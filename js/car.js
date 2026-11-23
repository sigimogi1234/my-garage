/* 귀여운 입체 느낌 자동차 SVG 생성기 (측면 뷰, 앞쪽 = 오른쪽) */

const CAR_SHAPES = {
  sedan: {
    body: 'M24 100 Q14 100 14 90 L14 78 Q14 66 28 64 L70 61 Q86 37 106 35 L146 35 Q166 37 184 60 L212 65 Q226 68 226 82 L226 90 Q226 100 216 100 Z',
    windows: ['M79 61 Q91 42 106 41 L122 41 L122 61 Z', 'M128 41 L146 41 Q160 42 174 61 L128 61 Z'],
    lines: 'M125 64 L125 96 M88 71 h9 M136 71 h9',
    wheels: [60, 182], r: 18, light: [218, 75], tail: [14, 70, 5, 8]
  },
  hatch: {
    body: 'M26 100 Q16 100 16 90 L16 66 Q16 44 34 40 Q60 34 104 33 L138 33 Q156 35 176 58 L208 64 Q222 67 222 80 L222 90 Q222 100 212 100 Z',
    windows: ['M30 60 L32 48 Q36 40 54 40 L94 39 L94 60 Z', 'M100 39 L136 39 Q150 40 166 60 L100 60 Z'],
    lines: 'M97 63 L97 96 M60 70 h9 M108 70 h9',
    wheels: [58, 176], r: 18, light: [214, 75], tail: [16, 52, 5, 10]
  },
  suv: {
    body: 'M26 100 Q14 100 14 88 L14 52 Q14 30 36 28 L136 26 Q152 26 166 46 L176 56 L210 60 Q224 62 224 78 L224 90 Q224 100 214 100 Z',
    windows: ['M28 54 L28 41 Q28 34 38 34 L84 33 L84 54 Z', 'M90 33 L126 32 L126 54 L90 54 Z', 'M132 32 L138 32 Q148 32 158 44 L166 54 L132 54 Z'],
    lines: 'M87 58 L87 94 M129 58 L129 94 M96 64 h9 M138 64 h9',
    rails: 'M40 22 h92',
    wheels: [60, 180], r: 20, light: [216, 72], tail: [14, 46, 5, 12]
  },
  coupe: {
    body: 'M24 100 Q14 100 14 90 L14 76 Q16 66 30 64 L66 60 Q92 38 116 38 L136 38 Q160 40 186 62 L214 67 Q226 70 226 84 L226 90 Q226 100 216 100 Z',
    windows: ['M77 60 Q96 44 116 44 L121 44 L121 60 Z', 'M127 44 L136 44 Q154 46 172 60 L127 60 Z'],
    lines: 'M124 64 L124 96 M132 71 h10',
    spoiler: 'M14 63 L30 58 L33 62 Z',
    wheels: [62, 184], r: 18, light: [218, 77], tail: [14, 70, 5, 7]
  },
  van: {
    body: 'M24 100 Q12 100 12 88 L12 46 Q12 26 34 25 L150 24 Q164 24 176 40 L196 60 L212 64 Q226 67 226 80 L226 90 Q226 100 216 100 Z',
    windows: ['M22 52 L22 38 Q22 31 31 31 L70 31 L70 52 Z', 'M76 31 L120 30 L120 52 L76 52 Z', 'M126 30 L150 30 Q158 30 166 40 L176 52 L126 52 Z'],
    lines: 'M73 56 L73 94 M123 56 L123 94 M80 60 h38 M132 64 h9',
    wheels: [58, 184], r: 18, light: [218, 74], tail: [12, 44, 5, 14]
  },
  pickup: {
    body: 'M20 100 Q12 100 12 92 L12 62 L102 62 L106 34 Q107 28 116 28 L146 28 Q158 28 166 42 L176 58 L210 62 Q226 64 226 80 L226 90 Q226 100 216 100 Z',
    windows: ['M113 58 L113 39 Q113 34 119 34 L144 34 Q152 34 158 44 L166 58 Z'],
    lines: 'M102 66 L102 96 M14 68 L98 68 M124 66 h9',
    wheels: [56, 182], r: 20, light: [218, 74], tail: [12, 66, 5, 10]
  }
};

let __carId = 0;

function shadeHex(hex, amt) {
  const n = parseInt(String(hex).replace('#', ''), 16);
  let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const f = v => (amt >= 0 ? v + (255 - v) * amt : v * (1 + amt));
  return '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(f(v)))).toString(16).padStart(2, '0')).join('');
}

function carSVG(type, color, opts = {}) {
  const s = CAR_SHAPES[type] || CAR_SHAPES.sedan;
  const c = color || '#2E6CF6';
  const id = 'cv' + (++__carId);
  const top = shadeHex(c, 0.32);
  const bot = shadeHex(c, -0.22);
  const stroke = shadeHex(c, -0.38);

  const arches = s.wheels.map(cx => {
    const R = s.r + 4;
    return `<path d="M${cx - R} 100 A${R} ${R} 0 0 1 ${cx + R} 100 Z" fill="#1A1F2B"/>`;
  }).join('');

  const wheels = s.wheels.map(cx => {
    const r = s.r, rim = r * 0.56;
    const spokes = [0, 72, 144, 216, 288].map(a => {
      const rad = (a - 90) * Math.PI / 180;
      return `M${cx} 100 L${(cx + Math.cos(rad) * rim * 0.9).toFixed(1)} ${(100 + Math.sin(rad) * rim * 0.9).toFixed(1)}`;
    }).join(' ');
    return `<g>
      <circle cx="${cx}" cy="100" r="${r}" fill="#222733"/>
      <circle cx="${cx}" cy="100" r="${r - 3.5}" fill="none" stroke="#353C4A" stroke-width="1.5"/>
      <circle cx="${cx}" cy="100" r="${rim}" fill="url(#${id}r)" stroke="#7C8698" stroke-width="1"/>
      <path d="${spokes}" stroke="#8A94A6" stroke-width="2" stroke-linecap="round"/>
      <circle cx="${cx}" cy="100" r="2.6" fill="#5B6577"/>
    </g>`;
  }).join('');

  const [lx, ly] = s.light;
  const [tx, ty, tw, th] = s.tail;

  return `<svg class="car-svg" viewBox="0 0 240 126" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="자동차">
  <defs>
    <linearGradient id="${id}b" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${top}"/><stop offset=".55" stop-color="${c}"/><stop offset="1" stop-color="${bot}"/>
    </linearGradient>
    <linearGradient id="${id}g" x1="0" y1="0" x2=".4" y2="1">
      <stop offset="0" stop-color="#F2F7FF"/><stop offset="1" stop-color="#8DB0E0"/>
    </linearGradient>
    <linearGradient id="${id}s" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fff" stop-opacity=".6"/><stop offset=".42" stop-color="#fff" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="${id}r" cx=".35" cy=".35" r=".8">
      <stop offset="0" stop-color="#FAFBFD"/><stop offset="1" stop-color="#A3ADBD"/>
    </radialGradient>
    <clipPath id="${id}c"><path d="${s.body}"/></clipPath>
  </defs>
  ${opts.noShadow ? '' : '<ellipse cx="120" cy="118" rx="104" ry="5.5" fill="#0E1726" opacity=".10"/>'}
  ${s.rails ? `<path d="${s.rails}" stroke="${stroke}" stroke-width="4" stroke-linecap="round"/>` : ''}
  ${s.spoiler ? `<path d="${s.spoiler}" fill="${bot}" stroke="${stroke}" stroke-width="1.2" stroke-linejoin="round"/>` : ''}
  <path d="${s.body}" fill="url(#${id}b)" stroke="${stroke}" stroke-width="1.6" stroke-linejoin="round"/>
  <g clip-path="url(#${id}c)">
    <rect x="0" y="0" width="240" height="126" fill="url(#${id}s)"/>
    <rect x="0" y="89" width="240" height="14" fill="#000" opacity=".09"/>
  </g>
  ${s.windows.map(w => `<path d="${w}" fill="url(#${id}g)" stroke="${stroke}" stroke-width="1.3" stroke-linejoin="round"/>`).join('')}
  <path d="${s.lines}" stroke="${stroke}" stroke-width="1.4" stroke-linecap="round" opacity=".55" fill="none"/>
  <ellipse cx="${lx}" cy="${ly}" rx="4.6" ry="3.6" fill="#FFF7D1" stroke="${stroke}" stroke-width="1"/>
  <ellipse cx="${lx - 1}" cy="${ly - 1}" rx="1.4" ry="1.1" fill="#fff"/>
  <rect x="${tx}" y="${ty}" width="${tw}" height="${th}" rx="2" fill="#F0525A"/>
  ${arches}
  ${wheels}
</svg>`;
}
