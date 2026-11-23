/*
 * 아이소메트릭 3D 자동차 렌더러
 * 측면 프로파일(둥근 모서리)을 폭 방향으로 돌출 + 가장자리 베벨 → 면마다 조명 계산 → SVG
 * 좌표계: X = 차 길이(앞 +), Y = 폭(보는 쪽 +), Z = 높이
 */

function shadeHex(hex, amt) {
  const n = parseInt(String(hex).replace('#', ''), 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const f = v => (amt >= 0 ? v + (255 - v) * amt : v * (1 + amt));
  return '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(f(v)))).toString(16).padStart(2, '0')).join('');
}

const CAR_MODELS = {
  sedan: {
    L: 3.9, W: 2, inset: .24, r: .44, wheels: [.88, 3.0],
    body: [[0, .38], [3.9, .38], [3.9, .82], [3.05, .97], [.75, .99], [0, .9]], bodyR: [.18, .14, .22, .4, .4, .22],
    cabin: [[.8, .97], [2.85, .97], [2.25, 1.55], [1.25, 1.55]], cabinR: [.04, .04, .2, .2], pillars: [1.85]
  },
  hatch: {
    L: 3.45, W: 2, inset: .22, r: .44, wheels: [.78, 2.68],
    body: [[0, .38], [3.45, .38], [3.45, .82], [2.65, .97], [0, 1.0]], bodyR: [.18, .14, .22, .4, .25],
    cabin: [[.08, .97], [2.6, .97], [2.05, 1.6], [.2, 1.6]], cabinR: [.04, .04, .2, .18], pillars: [1.3]
  },
  suv: {
    L: 3.95, W: 2.05, inset: .18, r: .5, wheels: [.9, 3.05],
    body: [[0, .46], [3.95, .46], [3.95, .95], [3.2, 1.08], [0, 1.1]], bodyR: [.2, .16, .24, .4, .24],
    cabin: [[.1, 1.08], [3.1, 1.08], [2.55, 1.85], [.22, 1.85]], cabinR: [.04, .04, .22, .18], pillars: [1.2, 2.15], rails: true
  },
  coupe: {
    L: 3.9, W: 2, inset: .26, r: .43, wheels: [.9, 3.0],
    body: [[0, .36], [3.9, .36], [3.9, .76], [3.0, .92], [.55, .95], [0, .86]], bodyR: [.16, .14, .2, .4, .4, .2],
    cabin: [[.6, .93], [2.95, .93], [2.3, 1.42], [1.5, 1.44]], cabinR: [.04, .04, .2, .3], pillars: [2.0]
  },
  van: {
    L: 3.95, W: 2.05, inset: .16, r: .45, wheels: [.82, 3.1],
    body: [[0, .42], [3.95, .42], [3.95, .92], [3.45, 1.02], [0, 1.04]], bodyR: [.18, .16, .22, .3, .22],
    cabin: [[.08, 1.02], [3.42, 1.02], [2.8, 1.95], [.2, 1.95]], cabinR: [.04, .04, .24, .2], pillars: [1.15, 2.25]
  },
  pickup: {
    L: 4.15, W: 2.05, inset: .18, r: .5, wheels: [.9, 3.25],
    body: [[0, .46], [4.15, .46], [4.15, .95], [3.35, 1.06], [0, 1.08]], bodyR: [.16, .16, .24, .35, .18],
    cabin: [[1.75, 1.06], [3.3, 1.06], [2.85, 1.78], [1.85, 1.78]], cabinR: [.04, .04, .2, .16], pillars: [], bed: [.16, 1.62]
  }
};

const carSVG = (function () {
  const SC = 40, C = Math.cos(Math.PI / 6), S = 0.5;
  const P = (x, y, z) => [(x - y) * C * SC, (x + y) * S * SC - z * SC];
  const n3 = v => { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; };
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const VIEW = n3([1, 1, 1]);
  const LIGHT = n3([0.25, 0.55, 1]);
  const f1 = v => Math.round(v * 10) / 10;
  const path = pts => 'M' + pts.map(p => f1(p[0]) + ' ' + f1(p[1])).join('L') + 'Z';
  const proj = pts => pts.map(p => P(p[0], p[1], p[2]));
  const lit = (c, n) => shadeHex(c, (dot(n, LIGHT) - 0.47) * 0.62);
  let uid = 0;

  // 둥근 모서리 프로파일 샘플링. e = 이 점에서 시작하는 선분이 속한 원래 변 번호 (-1 = 모서리 곡선)
  function roundProfile(pts, radii, steps = 6) {
    const n = pts.length, out = [];
    for (let i = 0; i < n; i++) {
      const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n];
      let r = radii[i] || 0;
      const ax = p0[0] - p1[0], az = p0[1] - p1[1], bx = p2[0] - p1[0], bz = p2[1] - p1[1];
      const la = Math.hypot(ax, az), lb = Math.hypot(bx, bz);
      const ux = ax / la, uz = az / la, wx = bx / lb, wz = bz / lb;
      const ang = Math.acos(Math.max(-1, Math.min(1, ux * wx + uz * wz)));
      if (r <= 0 || ang < 0.01 || ang > Math.PI - 0.01) { out.push({ x: p1[0], z: p1[1], e: i }); continue; }
      let t = r / Math.tan(ang / 2);
      const tmax = Math.min(la, lb) * 0.48;
      if (t > tmax) { t = tmax; r = t * Math.tan(ang / 2); }
      const sx = p1[0] + ux * t, sz = p1[1] + uz * t, ex = p1[0] + wx * t, ez = p1[1] + wz * t;
      let mx = ux + wx, mz = uz + wz; const ml = Math.hypot(mx, mz); mx /= ml; mz /= ml;
      const d = r / Math.sin(ang / 2), cx = p1[0] + mx * d, cz = p1[1] + mz * d;
      const a0 = Math.atan2(sz - cz, sx - cx), a1 = Math.atan2(ez - cz, ex - cx);
      let da = a1 - a0; while (da > Math.PI) da -= 2 * Math.PI; while (da < -Math.PI) da += 2 * Math.PI;
      for (let k = 0; k <= steps; k++) {
        const a = a0 + da * k / steps;
        out.push({ x: cx + Math.cos(a) * r, z: cz + Math.sin(a) * r, e: k === steps ? i : -1 });
      }
    }
    return out;
  }

  function normals(prof) {
    const n = prof.length, seg = [];
    for (let k = 0; k < n; k++) {
      const a = prof[k], c = prof[(k + 1) % n], dx = c.x - a.x, dz = c.z - a.z, l = Math.hypot(dx, dz) || 1;
      seg.push([dz / l, -dx / l]);
    }
    const vtx = prof.map((_, k) => {
      const p = seg[(k - 1 + n) % n], q = seg[k], x = p[0] + q[0], z = p[1] + q[1], l = Math.hypot(x, z) || 1;
      return [x / l, z / l];
    });
    return { seg, vtx };
  }
  // 날카로운 다각형의 정확한 안쪽 오프셋 (각 변을 d만큼 평행이동한 선들의 교점)
  function miter(pts, d) {
    const n = pts.length;
    const nrm = i => { const a = pts[i], b = pts[(i + 1) % n], dx = b[0] - a[0], dz = b[1] - a[1], l = Math.hypot(dx, dz); return [dz / l, -dx / l]; };
    return pts.map((p, i) => {
      const n1 = nrm((i - 1 + n) % n), n2 = nrm(i), k = 1 + n1[0] * n2[0] + n1[1] * n2[1];
      return [p[0] - (n1[0] + n2[0]) / k * d, p[1] - (n1[1] + n2[1]) / k * d];
    });
  }
  const offset = (prof, d) => { const { vtx } = normals(prof); return prof.map((p, k) => ({ x: p.x - vtx[k][0] * d, z: p.z - vtx[k][1] * d, e: p.e })); };

  // 프로파일을 y0~y1로 돌출 (양옆 베벨 b)
  function extrude(prof, y0, y1, b, base, glassEdges, glassCol) {
    const n = prof.length, { seg } = normals(prof), Q = offset(prof, b), faces = [];
    for (let k = 0; k < n; k++) {
      const a = prof[k], c = prof[(k + 1) % n], qa = Q[k], qc = Q[(k + 1) % n], [nx, nz] = seg[k];
      const glass = glassEdges && glassEdges.includes(a.e);
      faces.push({ L: 0, n: n3([nx, -1.2, nz]), col: base, pts: [[a.x, y0 + b, a.z], [c.x, y0 + b, c.z], [qc.x, y0, qc.z], [qa.x, y0, qa.z]] });
      faces.push({ L: 1, n: [nx, 0, nz], col: glass ? glassCol : base, pts: [[a.x, y0 + b, a.z], [c.x, y0 + b, c.z], [c.x, y1 - b, c.z], [a.x, y1 - b, a.z]] });
      faces.push({ L: 2, n: n3([nx, 1.2, nz]), col: base, pts: [[a.x, y1 - b, a.z], [c.x, y1 - b, c.z], [qc.x, y1, qc.z], [qa.x, y1, qa.z]] });
    }
    faces.push({ L: 3, n: [0, 1, 0], col: base, side: true, pts: Q.map(q => [q.x, y1, q.z]) });
    return { faces, Q };
  }

  function drawFaces(faces, sideFill) {
    return faces
      .filter(f => dot(f.n, VIEW) > 0.02)
      .map(f => { f.d = f.pts.reduce((s, p) => s + p[0] + p[1] + p[2], 0) / f.pts.length; return f; })
      .sort((a, b) => a.L - b.L || a.d - b.d)
      .map(f => {
        const c = lit(f.col, f.n);
        return `<path d="${path(proj(f.pts))}" fill="${f.side && sideFill ? sideFill : c}" stroke="${c}" stroke-width=".7" stroke-linejoin="round"/>`;
      }).join('');
  }

  function clipX(poly, x0, x1) {
    const clip = (pts, keep, inter) => {
      const out = [];
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i], b = pts[(i + 1) % pts.length], ka = keep(a), kb = keep(b);
        if (ka) out.push(a);
        if (ka !== kb) out.push(inter(a, b));
      }
      return out;
    };
    const at = xv => (a, b) => { const t = (xv - a.x) / (b.x - a.x); return { x: xv, z: a.z + (b.z - a.z) * t }; };
    let p = poly;
    if (x0 != null) p = clip(p, q => q.x >= x0, at(x0));
    if (x1 != null && p.length) p = clip(p, q => q.x <= x1, at(x1));
    return p;
  }

  function hull(pts) {
    const p = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const lo = [], up = [];
    for (const q of p) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
    for (let i = p.length - 1; i >= 0; i--) { const q = p[i]; while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }
    return lo.slice(0, -1).concat(up.slice(0, -1));
  }

  const ringXZ = (cx, cz, r, y, N = 32) => Array.from({ length: N }, (_, k) => { const t = k / N * Math.PI * 2; return P(cx + Math.cos(t) * r, y, cz + Math.sin(t) * r); });
  const ringYZ = (x, cy, cz, ry, rz, N = 24) => Array.from({ length: N }, (_, k) => { const t = k / N * Math.PI * 2; return P(x, cy + Math.cos(t) * ry, cz + Math.sin(t) * rz); });
  const quad = pts => path(proj(pts));

  function wheel(cx, r, yIn, yOut, id) {
    const back = ringXZ(cx, r, r, yIn), front = ringXZ(cx, r, r, yOut);
    return `<path d="${path(hull(back.concat(front)))}" fill="#1B1F28"/>
      <path d="${path(front)}" fill="#2D3341"/>
      <path d="${path(ringXZ(cx, r, r * .84, yOut + .002))}" fill="#242935"/>
      <path d="${path(ringXZ(cx, r, r * .6, yOut + .004))}" fill="url(#${id}w)" stroke="#8C96A8" stroke-width=".8"/>
      <path d="${path(ringXZ(cx, r, r * .2, yOut + .006))}" fill="#7A8497"/>`;
  }

  return function carSVG(type, color, opts = {}) {
    const m = CAR_MODELS[type] || CAR_MODELS.sedan;
    const c = color || '#2E6CF6';
    const id = 'iso' + (++uid);
    const { L, W, inset, r } = m;
    const GLASS = '#9DBDE8';
    const dark = shadeHex(c, -0.42);
    const out = [];

    // 바닥 그림자
    if (!opts.noShadow) {
      const sh = [];
      for (let k = 0; k < 36; k++) {
        const t = k / 36 * Math.PI * 2, cs = Math.cos(t), sn = Math.sin(t);
        const ex = Math.sign(cs) * Math.pow(Math.abs(cs), .5), ey = Math.sign(sn) * Math.pow(Math.abs(sn), .5);
        sh.push(P(L / 2 + ex * (L / 2 + .12), W / 2 + ey * (W / 2 + .22), 0));
      }
      out.push(`<path d="${path(sh)}" fill="#0E1726" opacity=".2" filter="url(#${id}b)"/>`);
    }

    // 뒤쪽(먼쪽) 바퀴
    m.wheels.forEach(x => out.push(wheel(x, r, -.04, .3, id)));

    // 차체 하부
    const bodyProf = roundProfile(m.body, m.bodyR);
    const body = extrude(bodyProf, 0, W, .16, c);
    out.push(drawFaces(body.faces, `url(#${id}s)`));

    const zBottom = m.body[0][1];
    const zFrontTop = m.body[2][1];
    const zRearTop = m.body[m.body.length - 1][1];
    const zBelt = m.cabin[0][1];

    // 픽업 적재함
    if (m.bed) {
      const [b0, b1] = m.bed, zt = zRearTop - .01, zf = zt - .34, y0 = .22, y1 = W - .22;
      const open = [[b0, y0, zt], [b1, y0, zt], [b1, y1, zt], [b0, y1, zt]];
      out.push(`<clipPath id="${id}bed"><path d="${quad(open)}"/></clipPath>
        <g clip-path="url(#${id}bed)">
          <path d="${quad([[b0, y0, zf], [b1, y0, zf], [b1, y1, zf], [b0, y1, zf]])}" fill="${shadeHex(c, -.5)}"/>
          <path d="${quad([[b0, y0, zf], [b0, y1, zf], [b0, y1, zt], [b0, y0, zt]])}" fill="${shadeHex(c, -.38)}"/>
          <path d="${quad([[b0, y0, zf], [b1, y0, zf], [b1, y0, zt], [b0, y0, zt]])}" fill="${shadeHex(c, -.25)}"/>
        </g>
        <path d="${quad(open)}" fill="none" stroke="${shadeHex(c, .25)}" stroke-width="1.2" stroke-linejoin="round"/>`);
    }

    // 캐빈 (윈드실드·뒷유리 = 유리)
    const cabProf = roundProfile(m.cabin, m.cabinR);
    const yc1 = W - inset;
    const cab = extrude(cabProf, inset, yc1, .1, c, [1, 3], GLASS);
    out.push(drawFaces(cab.faces, `url(#${id}s)`));

    // 루프 하이라이트
    const roofZ = m.cabin[2][1] + .004, rx0 = m.cabin[3][0] + .18, rx1 = m.cabin[2][0] - .12;
    if (rx1 > rx0) out.push(`<path d="${quad([[rx0, yc1 - .62, roofZ], [rx1, yc1 - .62, roofZ], [rx1, yc1 - .32, roofZ], [rx0, yc1 - .32, roofZ]])}" fill="#fff" opacity=".28" stroke="#fff" stroke-opacity=".28" stroke-width="2" stroke-linejoin="round"/>`);

    // 루프랙 (SUV)
    if (m.rails) {
      const z = m.cabin[2][1] + .1, a = m.cabin[3][0] + .15, b = m.cabin[2][0] - .1;
      [inset + .25, yc1 - .25].forEach(y => {
        const p0 = P(a, y, z), p1 = P(b, y, z), q0 = P(a, y, z - .1), q1 = P(b, y, z - .1);
        out.push(`<path d="M${f1(q0[0])} ${f1(q0[1])}L${f1(p0[0])} ${f1(p0[1])}L${f1(p1[0])} ${f1(p1[1])}L${f1(q1[0])} ${f1(q1[1])}" fill="none" stroke="#3A4150" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`);
      });
    }

    // 옆 유리창: 원래 캐빈 다각형을 마이터 방식으로 안쪽 오프셋 후 둥글게
    const win = roundProfile(miter(m.cabin, .22), m.cabin.map(() => .09), 4);
    const ps = m.pillars.slice().sort((a, b) => a - b);
    const ranges = [];
    let prev = null;
    ps.forEach(x => { ranges.push([prev, x - .07]); prev = x + .07; });
    ranges.push([prev, null]);
    const yw = yc1 + .004;
    ranges.forEach(([x0, x1]) => {
      const poly = clipX(win, x0, x1);
      if (poly.length > 2) out.push(`<path d="${quad(poly.map(p => [p.x, yw, p.z]))}" fill="url(#${id}g)" stroke="${shadeHex(GLASS, -.2)}" stroke-width=".6" stroke-linejoin="round"/>`);
    });

    // 사이드미러
    const mp = P(m.cabin[1][0] - .18, yc1 + .26, zBelt + .14);
    out.push(`<ellipse cx="${f1(mp[0])}" cy="${f1(mp[1])}" rx="5.2" ry="3.8" fill="${shadeHex(c, .05)}" stroke="${shadeHex(c, -.3)}" stroke-width=".8"/>`);

    // 도어 라인·손잡이
    const yd = W + .004;
    const doors = ps.length ? ps : [m.cabin[0][0] + .08];
    doors.forEach(x => {
      const a = P(x, yd, zBelt - .05), b = P(x, yd, zBottom + .14);
      out.push(`<path d="M${f1(a[0])} ${f1(a[1])}L${f1(b[0])} ${f1(b[1])}" stroke="${dark}" stroke-opacity=".35" stroke-width="1.1" stroke-linecap="round"/>`);
      const h0 = P(x + .22, yd, zBelt - .18), h1 = P(x + .44, yd, zBelt - .18);
      out.push(`<path d="M${f1(h0[0])} ${f1(h0[1])}L${f1(h1[0])} ${f1(h1[1])}" stroke="${dark}" stroke-opacity=".45" stroke-width="2" stroke-linecap="round"/>`);
    });

    // 후미등 (옆면 뒤쪽)
    out.push(`<path d="${quad([[.14, yd, zRearTop - .26], [.34, yd, zRearTop - .26], [.34, yd, zRearTop - .12], [.14, yd, zRearTop - .12]])}" fill="#F0525A" stroke="#F0525A" stroke-width="2" stroke-linejoin="round"/>`);

    // 앞면: 헤드램프, 그릴, 번호판
    const xf = L + .006, zl = zFrontTop - .2;
    out.push(`<path d="${quad([[xf, W / 2 - .3, zl - .07], [xf, W / 2 + .3, zl - .07], [xf, W / 2 + .3, zl + .05], [xf, W / 2 - .3, zl + .05]])}" fill="${shadeHex(c, -.5)}" stroke="${shadeHex(c, -.5)}" stroke-width="2" stroke-linejoin="round"/>`);
    [.45, W - .45].forEach(y => {
      out.push(`<path d="${path(ringYZ(xf, y, zl, .14, .12))}" fill="#FFF6CF" stroke="${shadeHex(c, -.35)}" stroke-width=".8"/>`);
      out.push(`<path d="${path(ringYZ(xf + .002, y - .03, zl + .03, .05, .045))}" fill="#fff"/>`);
    });
    const zp = zBottom + .2;
    out.push(`<path d="${quad([[xf, W / 2 - .26, zp - .07], [xf, W / 2 + .26, zp - .07], [xf, W / 2 + .26, zp + .07], [xf, W / 2 - .26, zp + .07]])}" fill="#fff" stroke="#C9D1DD" stroke-width="1.2" stroke-linejoin="round"/>`);

    // 휠 아치 + 앞쪽(가까운) 바퀴
    m.wheels.forEach(x => {
      const R = r + .08, arch = [];
      for (let k = 0; k <= 32; k++) { const t = k / 32 * Math.PI * 2; arch.push(P(x + Math.cos(t) * R, W + .004, Math.max(r + Math.sin(t) * R, zBottom + .03))); }
      out.push(`<path d="${path(arch)}" fill="#161A22"/>`);
    });
    m.wheels.forEach(x => out.push(wheel(x, r, W - .3, W + .07, id)));

    // 뷰박스: 크기는 고정, 차 중심에 맞춤
    const corners = [];
    [0, L].forEach(x => [-.05, W + .1].forEach(y => [0, m.cabin[2][1]].forEach(z => corners.push(P(x, y, z)))));
    const xs = corners.map(p => p[0]), ys = corners.map(p => p[1]);
    const cx = (Math.min(...xs) + Math.max(...xs)) / 2, cy = (Math.min(...ys) + Math.max(...ys)) / 2;
    const VW = 240, VH = 214;

    return `<svg class="car-svg" viewBox="${f1(cx - VW / 2)} ${f1(cy - VH / 2)} ${VW} ${VH}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="자동차">
  <defs>
    <linearGradient id="${id}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${shadeHex(c, .14)}"/><stop offset="1" stop-color="${shadeHex(c, -.16)}"/></linearGradient>
    <linearGradient id="${id}g" x1="0" y1="0" x2=".3" y2="1"><stop offset="0" stop-color="#E4EFFD"/><stop offset="1" stop-color="#7EA4DA"/></linearGradient>
    <radialGradient id="${id}w" cx=".4" cy=".35" r=".75"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#AEB8C7"/></radialGradient>
    <filter id="${id}b" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="4"/></filter>
  </defs>
  ${out.join('')}
</svg>`;
  };
})();
