(function () {
'use strict';

/* ───────── 유틸 ───────── */
const KEY = 'mygarage.v1';
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const fmt = n => Math.round(Number(n) || 0).toLocaleString('ko-KR');
const parseNum = v => { const s = String(v ?? '').replace(/[^\d]/g, ''); return s === '' ? NaN : Number(s); };
const won = n => fmt(n) + '원';
const shortWon = n => n >= 10000 ? (Math.round(n / 1000) / 10).toLocaleString('ko-KR') + '만원' : fmt(n) + '원';

const pad = n => String(n).padStart(2, '0');
const iso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const today = () => iso(new Date());
const parseD = s => { const [y, m, d] = String(s).split('-').map(Number); return new Date(y, m - 1, d, 12); };
const daysBetween = (a, b) => Math.round((parseD(b) - parseD(a)) / 86400000);
const addDays = (s, n) => { const d = parseD(s); d.setDate(d.getDate() + n); return iso(d); };
const addMonths = (s, n) => {
  const d = parseD(s), day = d.getDate();
  d.setDate(1); d.setMonth(d.getMonth() + n);
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(day, last));
  return iso(d);
};
const fmtDate = s => s ? s.replace(/-/g, '.') : '';
const WD = ['일', '월', '화', '수', '목', '금', '토'];
const todayLabel = () => { const d = new Date(); return `${d.getMonth() + 1}월 ${d.getDate()}일 ${WD[d.getDay()]}요일`; };
const dday = n => n > 0 ? `D-${n}` : n === 0 ? 'D-Day' : `${-n}일 지남`;
const span = days => days < 45 ? `${days}일` : days < 365 ? `약 ${Math.round(days / 30.4)}개월` : `약 ${(days / 365).toFixed(1)}년`;
const cycleText = it => [it.km > 0 ? `${fmt(it.km)}km` : '', it.months > 0 ? `${it.months}개월` : ''].filter(Boolean).join(' / ') || '주기 없음';

/* ───────── 아이콘 ───────── */
const ICONS = {
  oil: '<path d="M12 3c3 4 6 7.5 6 11a6 6 0 0 1-12 0c0-3.5 3-7 6-11z"/>',
  wind: '<path d="M3 8h11a3 3 0 1 0-3-3M3 12h15a3 3 0 1 1-3 3M3 16h7"/>',
  filter: '<path d="M4 5h16l-6 7v6l-4 2v-8z"/>',
  rotate: '<path d="M20 12a8 8 0 1 1-2.3-5.6M20 4v5h-5"/>',
  tire: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="M12 3v5M12 16v5M3 12h5M16 12h5"/>',
  brake: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2.5"/><path d="M8 4.5a8.6 8.6 0 0 1 8 0"/>',
  drop: '<path d="M12 3c3 4 6 7.5 6 11a6 6 0 0 1-12 0c0-3.5 3-7 6-11z"/><path d="M9.5 14.5h5"/>',
  thermo: '<path d="M10 14V5a2 2 0 1 1 4 0v9a4 4 0 1 1-4 0z"/><path d="M12 9v6"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1"/>',
  spark: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
  wiper: '<path d="M3 18a12 12 0 0 1 18 0"/><path d="M12 18 6.5 8"/>',
  battery: '<rect x="3" y="7" width="18" height="12" rx="2"/><path d="M7 7V5h3v2M14 7V5h3v2M6.5 13h4M15 11v4M13 13h4"/>',
  belt: '<circle cx="7" cy="12" r="4"/><circle cx="17" cy="12" r="4"/><path d="M7 8h10M7 16h10"/>',
  fuel: '<path d="M4 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16M3 21h12M14 9h2a2 2 0 0 1 2 2v5a1.5 1.5 0 0 0 3 0V8l-3-3"/><path d="M7 7h4"/>',
  wrench: '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.5-2.5z"/>',
  home: '<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>',
  receipt: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>',
  gauge: '<path d="M4 18a8 8 0 1 1 16 0"/><path d="m12 18 4-6"/>',
  sliders: '<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  chev: '<path d="m9 6 6 6-6 6"/>',
  trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/>',
  check: '<path d="m5 12 5 5 9-10"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  road: '<path d="M8 3 4 21M16 3l4 18M12 5v2M12 11v2M12 17v2"/>'
};
const ic = (name, cls = '') => `<svg class="i ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${ICONS[name] || ICONS.wrench}</svg>`;

/* ───────── 상태 ───────── */
const blank = () => ({ cars: [], records: [], odos: [], currentCarId: null });
function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) { const s = JSON.parse(raw); if (s && Array.isArray(s.cars)) return migrate(Object.assign(blank(), s)); }
  } catch (e) { /* 저장소 접근 불가 */ }
  return blank();
}
// 기본 주기가 바뀌었을 때: 사용자가 직접 바꾸지 않은 항목만 새 기본값으로
function migrate(s) {
  s.cars.forEach(car => (car.items || []).forEach(it => {
    if (it.custom) return;
    const d = DEFAULT_ITEMS.find(x => x.key === it.key), old = LEGACY_DEFAULTS[it.key];
    if (!d) return;
    it.name = d.name;
    if (old && it.km === old[0] && it.months === old[1]) { it.km = d.km; it.months = d.months; }
  }));
  return s;
}
let state = load();
let view = 'home';
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); }
  catch (e) { toast('이 브라우저에서는 저장이 안 돼요'); }
}

const applies = (d, fuel) => !d.fuels || d.fuels.includes(fuel);
const buildItems = fuel => DEFAULT_ITEMS.map(d => ({
  key: d.key, name: d.name, icon: d.icon, km: d.km, months: d.months,
  enabled: applies(d, fuel) && !d.off, custom: false
}));
const defOf = key => DEFAULT_ITEMS.find(d => d.key === key);
const curCar = () => state.cars.find(c => c.id === state.currentCarId) || state.cars[0] || null;
const carRecords = car => state.records.filter(r => r.carId === car.id);
const colorName = hex => (CAR_COLORS.find(c => c.hex.toLowerCase() === String(hex).toLowerCase()) || {}).name || '커스텀';
const fuelName = id => (FUELS.find(f => f.id === id) || {}).name || '';
const bodyName = id => (BODY_TYPES.find(b => b.id === id) || {}).name || '';

/* ───────── 주행거리 예측 ───────── */
function odoPoints(car) {
  const pts = [{ date: car.createdAt, km: car.initialKm, src: 'init' }];
  state.odos.filter(o => o.carId === car.id).forEach(o => pts.push({ date: o.date, km: o.km, src: 'odo', id: o.id }));
  carRecords(car).forEach(r => pts.push({ date: r.date, km: r.km, src: 'rec', id: r.id }));
  pts.sort((a, b) => a.date < b.date ? -1 : a.date > b.date ? 1 : a.km - b.km);
  return pts;
}

function rateInfo(car) {
  const fallback = (car.monthlyKm || DEFAULT_MONTHLY_KM) / 30.4;
  if (car.rateMode === 'manual') return { daily: fallback, src: 'manual' };
  const t = today();
  const valid = odoPoints(car).filter(p => p.date <= t);
  let win = valid.filter(p => daysBetween(p.date, t) <= 365);
  if (win.length < 2 || daysBetween(win[0].date, win[win.length - 1].date) < 14) win = valid;
  if (win.length >= 2) {
    const a = win[0], b = win[win.length - 1];
    const d = daysBetween(a.date, b.date), km = b.km - a.km;
    if (d >= 14 && km > 0) return { daily: km / d, src: 'auto', days: d };
  }
  return { daily: fallback, src: 'default' };
}

function odoState(car) {
  const t = today();
  const pts = odoPoints(car).filter(p => p.date <= t);
  const last = pts[pts.length - 1] || { date: t, km: car.initialKm };
  const maxKm = Math.max(...pts.map(p => p.km), car.initialKm || 0);
  const rate = rateInfo(car);
  const since = Math.max(0, daysBetween(last.date, t));
  const est = Math.max(maxKm, last.km + rate.daily * since);
  return { est: Math.round(est), last, since, rate, maxKm, pts };
}

/* ───────── 정비 일정 계산 ───────── */
// 기록 없는 항목의 기준점: 연식 1월 1일 · 0km (연식이 없으면 등록일·등록 시 주행거리)
function baseline(car) {
  const y = Number(car.year);
  if (y > 1980 && y <= new Date().getFullYear() + 1) {
    const d = `${y}-01-01`;
    return { date: d > today() ? today() : d, km: 0, virtual: true, label: `${y}년식 출고` };
  }
  return { date: car.createdAt, km: car.initialKm || 0, virtual: true, label: '앱 등록 시점' };
}

function itemStatus(car, item, os) {
  const t = today();
  const hist = carRecords(car).filter(r => r.items.includes(item.key))
    .sort((a, b) => a.date < b.date ? 1 : a.date > b.date ? -1 : b.km - a.km);
  // 교체 기록 (점검 후 미루기 기록은 제외). 없으면 출고(연식) 시점 0km를 기준으로 추정
  const real = hist.find(r => r.kind !== 'defer') || null;
  const last = real || baseline(car);
  // 마지막 교체 이후의 가장 최근 '다음 주기로 넘기기'
  const defer = hist[0] && hist[0].kind === 'defer' ? hist[0] : null;
  const first = !real && defOf(item.key) && defOf(item.key).first;
  const iKm = first ? first.km : item.km, iMo = first ? first.months : item.months;
  const s = { item, last, hist, defer, estimated: !real, iKm, iMo, first: !!first };

  let pk = 0, pt = 0;
  s.usedKm = Math.max(0, os.est - last.km);
  s.elapsedDays = Math.max(0, daysBetween(last.date, t));
  if (iKm > 0) {
    s.nextKm = defer ? defer.km + (defer.addKm || 0) : last.km + iKm;
    s.totalKm = Math.max(1, s.nextKm - last.km);
    s.remainKm = s.nextKm - os.est;
    pk = (os.est - last.km) / s.totalKm;
    s.kmRatio = Math.max(0, pk);
    s.kmDays = s.remainKm > 0 ? Math.ceil(s.remainKm / os.rate.daily) : 0;
    s.kmDate = addDays(t, s.kmDays);
  }
  if (iMo > 0) {
    s.nextDate = defer ? addMonths(defer.date, defer.addMonths || 0) : addMonths(last.date, iMo);
    s.remainDays = daysBetween(t, s.nextDate);
    const total = daysBetween(last.date, s.nextDate);
    pt = total > 0 ? daysBetween(last.date, t) / total : 1;
    s.timeRatio = Math.max(0, pt);
  }
  s.progress = Math.max(pk, pt, 0);
  const c = [s.kmDays, s.remainDays].filter(v => v != null);
  s.dueDays = c.length ? Math.min(...c) : null;
  s.dueBy = s.kmDays != null && (s.remainDays == null || s.kmDays <= s.remainDays) ? 'km' : 'time';
  s.dueDate = s.dueBy === 'km' ? s.kmDate : s.nextDate;
  // 게이지는 0%에서 차오름: 70% 미만 파랑, 70~90% 주황, 90% 이상 빨강, 100% 이상 초과
  const over = (s.remainKm != null && s.remainKm <= 0) || (s.remainDays != null && s.remainDays < 0);
  s.kmLvl = iKm > 0 ? (s.remainKm <= 0 ? 'over' : lvl(pk)) : null;
  s.timeLvl = iMo > 0 ? (s.remainDays < 0 ? 'over' : lvl(pt)) : null;
  s.status = over ? 'over' : [s.kmLvl, s.timeLvl].filter(Boolean).sort((a, b) => ORDER[a] - ORDER[b])[0] || 'ok';
  return s;
}
const lvl = r => r >= 1 ? 'over' : r >= 0.9 ? 'soon' : r >= 0.7 ? 'warn' : 'ok';
const ORDER = { over: 0, soon: 1, warn: 2, ok: 3 };
const sortSt = (a, b) => ORDER[a.status] - ORDER[b.status] || (a.dueDays ?? 1e9) - (b.dueDays ?? 1e9);
const STATUS_LABEL = { over: '교체 필요', soon: '곧 교체', warn: '주의', ok: '양호' };

/* ───────── 공통 UI ───────── */
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('show'), 1900);
}

function openSheet(html, { full = false, onMount } = {}) {
  const w = document.createElement('div');
  w.className = 'sheet-wrap';
  w.innerHTML = `<div class="sheet-backdrop" data-close></div>
    <div class="sheet ${full ? 'full' : ''}" role="dialog" aria-modal="true"><div class="sheet-grip"></div><div class="sheet-body">${html}</div></div>`;
  document.body.appendChild(w);
  document.body.classList.add('lock');
  requestAnimationFrame(() => requestAnimationFrame(() => w.classList.add('open')));
  w.addEventListener('click', e => { if (e.target.closest('[data-close]')) closeSheet(w); });
  enableSwipe(w);
  onMount && onMount(w);
  return w;
}

// 아래로 쓸어내려 닫기: 손잡이/제목에서 시작하거나, 내용이 맨 위일 때 아래로 당기면 동작
function enableSwipe(w) {
  const sheet = $('.sheet', w), back = $('.sheet-backdrop', w);
  let y0 = null, dy = 0, dragging = false, fromHead = false, lastY = 0, lastT = 0, vel = 0;
  const start = (y, target) => {
    fromHead = !!target.closest('.sheet-grip, .sheet-head');
    if (!fromHead && sheet.scrollTop > 0) { y0 = null; return; }
    if (!fromHead && target.closest('textarea')) { y0 = null; return; }
    y0 = y; dy = 0; dragging = false; lastY = y; lastT = performance.now(); vel = 0;
  };
  const move = (y, ev) => {
    if (y0 == null) return;
    const d = y - y0;
    if (!dragging) {
      if (d > 8 && (fromHead || sheet.scrollTop <= 0)) {
        dragging = true; y0 = y; sheet.classList.add('dragging'); back.style.transition = 'none';
        if (document.activeElement && sheet.contains(document.activeElement)) document.activeElement.blur();
      } else if (d < -8) { y0 = null; return; }
      else return;
    }
    if (ev.cancelable) ev.preventDefault();
    dy = Math.max(0, y - y0);
    const now = performance.now();
    vel = (y - lastY) / Math.max(1, now - lastT); lastY = y; lastT = now;
    sheet.style.transform = `translateY(${dy}px)`;
    back.style.opacity = String(Math.max(0, 1 - dy / sheet.offsetHeight));
  };
  const end = () => {
    if (y0 == null) return;
    y0 = null;
    if (!dragging) return;
    dragging = false;
    sheet.classList.remove('dragging'); back.style.transition = '';
    const close = dy > Math.min(160, sheet.offsetHeight * 0.3) || (vel > 0.5 && dy > 30);
    sheet.style.transform = ''; back.style.opacity = '';
    if (close) closeSheet(w);
  };
  sheet.addEventListener('touchstart', e => { if (e.touches.length === 1) start(e.touches[0].clientY, e.target); }, { passive: true });
  sheet.addEventListener('touchmove', e => move(e.touches[0].clientY, e), { passive: false });
  sheet.addEventListener('touchend', end);
  sheet.addEventListener('touchcancel', end);
  // PC 마우스: 손잡이/제목 드래그
  sheet.addEventListener('mousedown', e => {
    if (!e.target.closest('.sheet-grip, .sheet-head') || e.target.closest('button')) return;
    start(e.clientY, e.target);
    const mm = ev => move(ev.clientY, ev);
    const mu = () => { end(); window.removeEventListener('mousemove', mm); window.removeEventListener('mouseup', mu); };
    window.addEventListener('mousemove', mm); window.addEventListener('mouseup', mu);
  });
}
function closeSheet(w) {
  w.classList.remove('open');
  setTimeout(() => { w.remove(); if (!$('.sheet-wrap')) document.body.classList.remove('lock'); }, 260);
}

// 브라우저 confirm() 대신 쓰는 앱 내 확인창 (임베드 환경에서도 동작)
function ask(msg, okLabel = '확인', danger = false) {
  return new Promise(res => {
    let done = false;
    const finish = v => { if (!done) { done = true; res(v); } };
    openSheet(`<div class="ask"><p>${esc(msg).replace(/\n/g, '<br>')}</p>
      <div class="btn-row"><button class="btn ghost" data-close>취소</button><button class="btn ${danger ? 'danger' : 'primary'}" data-ok>${esc(okLabel)}</button></div></div>`, {
      onMount(w) {
        w.addEventListener('click', e => {
          if (e.target.closest('[data-ok]')) { finish(true); closeSheet(w); }
          else if (e.target.closest('[data-close]')) finish(false);
        });
      }
    });
  });
}

function header(title, sub) {
  return `<header class="top"><div><div class="eyebrow">${sub || todayLabel()}</div><h1>${title}</h1></div></header>`;
}

function switcher() {
  if (!state.cars.length) return '';
  const cur = curCar();
  return `<div class="switcher">${state.cars.map(c => `
    <button class="sw ${c.id === cur.id ? 'on' : ''}" data-action="select-car" data-id="${c.id}">
      <span class="sw-car">${carSVG(c.body, c.color, { noShadow: true })}</span><span>${esc(c.nickname)}</span>
    </button>`).join('')}
    <button class="sw add" data-action="add-car">${ic('plus')}<span>차량 추가</span></button>
  </div>`;
}

function emptyGarage() {
  return `${header('마이 개러지')}
  <section class="empty">
    <div class="empty-stage">${carSVG('hatch', '#7DB4FF')}</div>
    <h2>내 차를 등록해볼까요?</h2>
    <p>주행거리와 정비 기록을 입력하면<br>다음 정비 시기를 거리·기간 기준으로 알려드려요.</p>
    <button class="btn primary lg" data-action="add-car">${ic('plus')} 첫 차 등록하기</button>
    <button class="btn ghost" data-action="demo">예시 데이터로 둘러보기</button>
  </section>`;
}

/* ───────── 화면: 홈 ───────── */
function vHome() {
  const car = curCar();
  if (!car) return emptyGarage();
  const os = odoState(car);
  const sts = car.items.filter(i => i.enabled).map(i => itemStatus(car, i, os)).sort(sortSt);
  const over = sts.filter(s => s.status === 'over').length;
  const soon = sts.filter(s => s.status === 'soon' || s.status === 'warn').length;
  const y = String(new Date().getFullYear());
  const yearCost = carRecords(car).filter(r => r.date.startsWith(y)).reduce((a, r) => a + (r.cost || 0), 0);
  const sub = [car.brand, car.model, car.year ? car.year + '년식' : '', fuelName(car.fuel)].filter(Boolean).map(esc).join(' · ');
  const rateSrc = os.rate.src === 'auto' ? '실제 기록 기반' : os.rate.src === 'manual' ? '직접 설정' : '기본값';

  return `${header('마이 개러지')}
  ${switcher()}
  <section class="hero">
    <div class="stage"><span class="badge">${esc(car.brand)}</span><span class="badge r">${esc(bodyName(car.body))}</span>
      <div class="stage-car">${carSVG(car.body, car.color)}</div></div>
    <div class="hero-head">
      <div><h2>${esc(car.nickname)}</h2><p>${sub}</p></div>
      <button class="icon-btn" data-action="edit-car" data-id="${car.id}" aria-label="차량 편집">${ic('edit')}</button>
    </div>
    <div class="odo-card">
      <div class="odo-l">
        <span class="lbl">오늘 예상 주행거리</span>
        <div class="odo-num">${fmt(os.est)}<small>km</small></div>
        ${os.since >= 7 ? `<span class="meta">마지막 입력 ${os.since}일 전 · 지금 입력하면 더 정확해져요</span>` : ''}
      </div>
      <button class="btn primary sm" data-action="odo">${ic('gauge')}입력</button>
    </div>
  </section>

  <section class="stats">
    <div class="stat ${over ? 'red' : ''}"><b>${over}</b><span>교체 필요</span></div>
    <div class="stat ${soon ? 'amber' : ''}"><b>${soon}</b><span>곧 교체·주의</span></div>
    <div class="stat"><b>${shortWon(yearCost)}</b><span>${y}년 정비비</span></div>
  </section>

  <section class="sec">
    <div class="sec-head"><h3>정비 일정</h3><button class="link" data-action="tab" data-tab="config">주기 설정 ${ic('chev')}</button></div>
    <div class="items">${sts.map(itemCard).join('') || '<p class="muted pad">활성화된 정비 항목이 없어요.</p>'}</div>
  </section>`;
}

function itemCard(s) {
  const it = s.item;
  const sub = s.estimated
    ? `<small class="est">정비 기록 없음 · ${esc(s.last.label)} 기준 추정</small>`
    : `<small>최근 교체 ${fmtDate(s.last.date)} · ${fmt(s.last.km)}km</small>`;
  const dfr = s.defer ? `<small class="dfr-note">${fmtDate(s.defer.date)} 점검 · 다음 주기로 넘김</small>` : '';
  return `<article class="item st-${s.status}" data-action="item" data-key="${it.key}" tabindex="0">
    <div class="item-top">
      <span class="ic">${ic(it.icon)}</span>
      <div class="item-tt"><b>${esc(it.name)}</b>${sub}${dfr}</div>
      <span class="pill">${STATUS_LABEL[s.status]}</span>
    </div>
    ${gauges(s)}
    ${dueLine(s)}
  </article>`;
}

// 주행거리·기간 게이지: 정비 직후 0%에서 사용한 만큼 차오름
const monthsText = d => d < 31 ? `${d}일` : `${Math.floor(d / 30.44)}개월`;
const leftDays = n => n > 60 ? `${Math.floor(n / 30.44)}개월 남음` : `${n}일 남음`;
function gauge(label, ratio, st, value, sub) {
  const w = Math.max(0, Math.min(100, ratio * 100));
  return `<div class="g g-${st}">
    <div class="g-row"><span class="g-l">${label}</span><span class="g-v">${value}</span></div>
    <div class="g-bar"><i style="width:${w.toFixed(1)}%"></i></div>
    ${sub ? `<div class="g-sub">${sub}</div>` : ''}
  </div>`;
}
function gauges(s, detail) {
  const out = [];
  if (s.iKm > 0) {
    out.push(gauge('주행거리', s.kmRatio, s.kmLvl,
      s.remainKm > 0 ? `${fmt(s.remainKm)}km 남음` : `${fmt(-s.remainKm)}km 초과`,
      detail ? `${fmt(s.usedKm)} / ${fmt(s.totalKm)}km 주행` : ''));
  }
  if (s.iMo > 0) {
    out.push(gauge('기간', s.timeRatio, s.timeLvl,
      s.remainDays >= 0 ? leftDays(s.remainDays) : `${monthsText(-s.remainDays)} 지남`,
      detail ? `${monthsText(s.elapsedDays)} / ${monthsText(daysBetween(s.last.date, s.nextDate))} 경과` : ''));
  }
  return `<div class="gs">${out.join('')}</div>`;
}
function dueLine(s) {
  if (s.dueDays == null) return '';
  if (s.status === 'over') return `<div class="due-line over">${ic('wrench')}<span>지금 교체·점검이 필요해요</span></div>`;
  return `<div class="due-line">${ic('check')}<span>다음 교체 예상 <b>${fmtDate(s.dueDate)}</b> · ${span(Math.max(0, s.dueDays))} 후 (${s.dueBy === 'km' ? '주행거리' : '기간'} 기준)</span></div>`;
}

/* ───────── 화면: 정비 내역 ───────── */
function vRecords() {
  const car = curCar();
  if (!car) return emptyGarage();
  const recs = carRecords(car).slice().sort((a, b) => a.date < b.date ? 1 : a.date > b.date ? -1 : b.km - a.km);
  const total = recs.reduce((a, r) => a + (r.cost || 0), 0);
  const y = String(new Date().getFullYear());
  const yearCost = recs.filter(r => r.date.startsWith(y)).reduce((a, r) => a + (r.cost || 0), 0);

  // 최근 6개월 막대
  const now = new Date(); const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const k = `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
    months.push({ k, label: `${d.getMonth() + 1}월`, v: recs.filter(r => r.date.startsWith(k)).reduce((a, r) => a + (r.cost || 0), 0) });
  }
  const mx = Math.max(...months.map(m => m.v), 1);

  const name = k => (car.items.find(i => i.key === k) || defOf(k) || { name: k }).name;
  let lastGroup = '';
  const list = recs.map(r => {
    const g = r.date.slice(0, 7);
    const head = g !== lastGroup ? `<div class="group">${g.replace('-', '년 ')}월</div>` : '';
    lastGroup = g;
    return `${head}<article class="rec" data-action="record" data-id="${r.id}" tabindex="0">
      <div class="rec-d"><b>${Number(r.date.slice(8))}</b><span>${WD[parseD(r.date).getDay()]}</span></div>
      <div class="rec-b">
        <div class="tags">${r.kind === 'defer' ? '<span class="dfr">점검·미룸</span>' : ''}${r.items.map(k => `<span class="tag">${esc(name(k))}</span>`).join('')}</div>
        <div class="rec-m">${fmt(r.km)}km${r.shop ? ' · ' + esc(r.shop) : ''}${r.memo ? ' · ' + esc(r.memo) : ''}</div>
      </div>
      <div class="rec-c">${r.kind === 'defer' ? '' : r.cost ? won(r.cost) : '-'}</div>
    </article>`;
  }).join('');

  return `${header('정비 내역')}
  ${switcher()}
  <section class="card sum">
    <div class="sum-row">
      <div><span class="lbl">누적 정비비</span><div class="big">${won(total)}</div></div>
      <div class="r"><span class="lbl">${y}년</span><div class="mid">${won(yearCost)}</div><span class="lbl">${recs.length}건</span></div>
    </div>
    <div class="bars">${months.map(m => `<div class="bc"><div class="bw"><i style="height:${Math.max(m.v ? 6 : 0, Math.round(m.v / mx * 100))}%"></i></div><span>${m.label}</span>${m.v ? `<em>${shortWon(m.v)}</em>` : ''}</div>`).join('')}</div>
  </section>
  <section class="sec">${list || `<div class="empty sm">${ic('receipt', 'xl')}<p>아직 정비 기록이 없어요.<br>아래 버튼으로 첫 기록을 남겨보세요.</p></div>`}</section>`;
}

/* ───────── 화면: 주행거리 ───────── */
function vOdo() {
  const car = curCar();
  if (!car) return emptyGarage();
  const os = odoState(car);
  const r = os.rate;
  const all = odoPoints(car);
  const rows = all.slice().reverse().map((p, i, arr) => {
    const prev = arr[i + 1];
    const diff = prev ? p.km - prev.km : null;
    const src = p.src === 'odo' ? '직접 입력' : p.src === 'rec' ? '정비 기록' : '등록 시';
    return `<div class="log">
      <div><b>${fmt(p.km)}km</b><span>${fmtDate(p.date)} · <i class="src s-${p.src}">${src}</i></span></div>
      <div class="log-r">${diff != null ? `<em>${diff >= 0 ? '+' : ''}${fmt(diff)}km</em>` : ''}
      ${p.src === 'odo' ? `<button class="icon-btn sm" data-action="del-odo" data-id="${p.id}" aria-label="삭제">${ic('trash')}</button>` : ''}</div>
    </div>`;
  }).join('');

  const note = r.src === 'auto'
    ? `최근 ${r.days}일간 기록으로 계산했어요.`
    : r.src === 'manual' ? '직접 설정한 월 평균으로 예측해요.'
    : `기록이 2개 이상(14일 이상 간격) 쌓이면 실제 패턴으로 예측해요. 지금은 월 ${fmt(car.monthlyKm)}km 기준이에요.`;

  return `${header('주행거리')}
  ${switcher()}
  <section class="card">
    <span class="lbl">오늘 예상 주행거리</span>
    <div class="odo-num lg">${fmt(os.est)}<small>km</small></div>
    <div class="trio">
      <div><b>${fmt(r.daily)}km</b><span>하루 평균</span></div>
      <div><b>${fmt(r.daily * 30.4)}km</b><span>월 예상</span></div>
      <div><b>${fmt(r.daily * 365)}km</b><span>연 예상</span></div>
    </div>
    ${odoChart(os)}
  </section>

  <section class="sec">
    <div class="sec-head"><h3>예측 방식</h3></div>
    <div class="card">
      <div class="seg">
        <button class="${car.rateMode !== 'manual' ? 'on' : ''}" data-action="rate-mode" data-mode="auto">자동 계산</button>
        <button class="${car.rateMode === 'manual' ? 'on' : ''}" data-action="rate-mode" data-mode="manual">직접 설정</button>
      </div>
      <label class="fld inline"><span>${car.rateMode === 'manual' ? '월 평균 주행거리' : '기본 월 주행거리'}</span>
        <div class="unit"><input class="num" data-field="monthlyKm" inputmode="numeric" value="${fmt(car.monthlyKm)}"><i>km</i></div></label>
      <p class="desc">${note}</p>
    </div>
  </section>

  <section class="sec">
    <div class="sec-head"><h3>주행 기록</h3><span class="muted">${all.length}개</span></div>
    <div class="card list">${rows}</div>
  </section>`;
}

function odoChart(os) {
  const pts = os.pts;
  if (pts.length < 2) return `<div class="chart-empty">주행거리를 몇 번 더 입력하면 그래프가 그려져요</div>`;
  const W = 320, H = 140, L = 6, R = 6, T = 12, B = 22;
  const t0 = parseD(pts[0].date).getTime(), t1 = parseD(today()).getTime();
  const tw = Math.max(t1 - t0, 86400000);
  const kms = pts.map(p => p.km).concat(os.est);
  let k0 = Math.min(...kms), k1 = Math.max(...kms);
  if (k1 - k0 < 100) { k1 += 50; k0 -= 50; }
  const x = d => L + (parseD(d).getTime() - t0) / tw * (W - L - R);
  const y = k => T + (1 - (k - k0) / (k1 - k0)) * (H - T - B);
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${x(p.date).toFixed(1)} ${y(p.km).toFixed(1)}`).join(' ');
  const last = pts[pts.length - 1];
  const area = `${line} L${x(last.date).toFixed(1)} ${H - B} L${x(pts[0].date).toFixed(1)} ${H - B} Z`;
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="주행거리 추이">
    <defs><linearGradient id="oa" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2E6CF6" stop-opacity=".22"/><stop offset="1" stop-color="#2E6CF6" stop-opacity="0"/></linearGradient></defs>
    <line x1="${L}" x2="${W - R}" y1="${H - B}" y2="${H - B}" stroke="#E7EBF2"/>
    <path d="${area}" fill="url(#oa)"/>
    <path d="${line}" fill="none" stroke="#2E6CF6" stroke-width="2.2" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>
    <path d="M${x(last.date).toFixed(1)} ${y(last.km).toFixed(1)} L${x(today()).toFixed(1)} ${y(os.est).toFixed(1)}" stroke="#2E6CF6" stroke-width="2" stroke-dasharray="4 4" vector-effect="non-scaling-stroke"/>
    ${pts.map(p => `<circle cx="${x(p.date).toFixed(1)}" cy="${y(p.km).toFixed(1)}" r="3" fill="#fff" stroke="#2E6CF6" stroke-width="2" vector-effect="non-scaling-stroke"/>`).join('')}
    <circle cx="${x(today()).toFixed(1)}" cy="${y(os.est).toFixed(1)}" r="4" fill="#2E6CF6"/>
    <text x="${L}" y="${H - 6}" class="ct">${fmtDate(pts[0].date)}</text>
    <text x="${W - R}" y="${H - 6}" class="ct" text-anchor="end">오늘 (예상)</text>
  </svg>`;
}

/* ───────── 화면: 설정 ───────── */
function vSettings() {
  const car = curCar();
  const carsHtml = state.cars.map(c => `
    <button class="row" data-action="edit-car" data-id="${c.id}">
      <span class="row-car">${carSVG(c.body, c.color, { noShadow: true })}</span>
      <span class="row-b"><b>${esc(c.nickname)}</b><small>${esc([c.brand, c.model, bodyName(c.body), fuelName(c.fuel)].filter(Boolean).join(' · '))}</small></span>
      ${ic('chev')}
    </button>`).join('');

  let cyc = '';
  if (car) {
    const row = it => {
      const d = defOf(it.key);
      const changed = d && (d.km !== it.km || d.months !== it.months);
      return `<div class="cyc ${it.enabled ? '' : 'off'}">
        <div class="cyc-top">
          <span class="ic sm">${ic(it.icon)}</span>
          <b>${esc(it.name)}</b>
          ${changed ? '<em class="chg">변경됨</em>' : ''}${it.custom ? '<em class="chg c">직접 추가</em>' : ''}
          ${it.custom ? `<button class="icon-btn sm" data-action="del-item" data-key="${it.key}" aria-label="항목 삭제">${ic('trash')}</button>` : ''}
          <label class="tg"><input type="checkbox" data-cyc="enabled" data-key="${it.key}" ${it.enabled ? 'checked' : ''}><i></i></label>
        </div>
        ${it.enabled ? `<div class="cyc-in">
          <div class="unit"><input class="num" inputmode="numeric" data-cyc="km" data-key="${it.key}" value="${it.km ? fmt(it.km) : ''}" placeholder="없음"><i>km</i></div>
          <span class="or">또는</span>
          <div class="unit"><input class="num" inputmode="numeric" data-cyc="months" data-key="${it.key}" value="${it.months || ''}" placeholder="없음"><i>개월</i></div>
        </div>${d && changed ? `<div class="defv">기본값 ${cycleText(d)}</div>` : ''}${d && d.note ? `<div class="defv">${esc(d.note)}</div>` : ''}` : ''}
      </div>`;
    };
    const on = car.items.filter(i => i.enabled), off = car.items.filter(i => !i.enabled);
    cyc = `<section class="sec">
      <div class="sec-head"><h3>정비 주기 · ${esc(car.nickname)}</h3></div>
      <p class="desc">기본값은 일반적인 권장 주기예요. 차량 매뉴얼이나 운전 환경에 맞게 바꿔보세요.<br>거리와 기간 중 <b>먼저 도래하는 쪽</b> 기준으로 알려드려요. (한쪽을 비우면 다른 쪽만 체크)</p>
      <div class="card list">${on.map(row).join('')}</div>
      ${off.length ? `<div class="sub-h">사용 안 함</div><div class="card list">${off.map(row).join('')}</div>` : ''}
      <div class="btn-row">
        <button class="btn ghost" data-action="add-item">${ic('plus')}항목 추가</button>
        <button class="btn ghost" data-action="reset-items">기본값으로 되돌리기</button>
      </div>
    </section>`;
  }

  return `${header('설정')}
  <section class="sec">
    <div class="sec-head"><h3>내 차량</h3></div>
    ${state.cars.length ? `<div class="card list">${carsHtml}</div>` : ''}
    <button class="btn ghost full" data-action="add-car">${ic('plus')}차량 추가</button>
  </section>
  ${cyc}
  <section class="sec">
    <div class="sec-head"><h3>데이터</h3></div>
    <p class="desc">모든 데이터는 이 기기의 브라우저에만 저장돼요. 폰을 바꾸거나 브라우저 데이터를 지우기 전에 백업해두세요.</p>
    <div class="card list">
      <button class="row" data-action="export"><span class="row-b"><b>백업 파일 내보내기</b><small>JSON 파일로 저장</small></span>${ic('chev')}</button>
      <button class="row" data-action="import"><span class="row-b"><b>백업 불러오기</b><small>현재 데이터를 덮어써요</small></span>${ic('chev')}</button>
      <button class="row danger" data-action="reset-all"><span class="row-b"><b>모든 데이터 삭제</b></span>${ic('chev')}</button>
    </div>
  </section>
  <p class="foot">권장 주기는 일반적인 기준이에요. 정확한 주기는 차량 취급설명서를 확인하세요.</p>`;
}

/* ───────── 시트: 차량 등록/편집 ───────── */
function carForm(id) {
  const ex = id ? state.cars.find(c => c.id === id) : null;
  const d = ex ? { ...ex } : { nickname: '', brand: '현대', model: '', year: '', body: 'sedan', color: '#2E6CF6', fuel: 'gasoline', initialKm: '', monthlyKm: DEFAULT_MONTHLY_KM };
  const html = `
    <div class="sheet-head"><h3>${ex ? '차량 편집' : '새 차량 등록'}</h3><button class="icon-btn" data-close aria-label="닫기">${ic('close')}</button></div>
    <div class="preview"><div class="preview-car" id="cf-prev">${carSVG(d.body, d.color)}</div></div>
    <form id="cf" class="form" novalidate>
      <label class="fld"><span>애칭</span><input name="nickname" maxlength="20" placeholder="예: 출퇴근 머신" value="${esc(d.nickname)}"></label>
      <div class="fld"><span>브랜드</span><div class="chips" data-group="brand">${BRANDS.map(b => `<button type="button" class="chip ${b === d.brand ? 'on' : ''}" data-val="${esc(b)}">${esc(b)}</button>`).join('')}</div></div>
      <div class="row2">
        <label class="fld"><span>모델명</span><input name="model" maxlength="20" placeholder="예: 아반떼" value="${esc(d.model)}"></label>
        <label class="fld"><span>연식</span><input name="year" inputmode="numeric" maxlength="4" placeholder="${new Date().getFullYear()}" value="${esc(d.year)}"></label>
      </div>
      <div class="fld"><span>차종</span><div class="bodies" data-group="body">${BODY_TYPES.map(b => `<button type="button" class="body-opt ${b.id === d.body ? 'on' : ''}" data-val="${b.id}">${carSVG(b.id, '#C9D4E6', { noShadow: true })}<span>${b.name}</span></button>`).join('')}</div></div>
      <div class="fld"><span>색상 <em id="cf-cname">${colorName(d.color)}</em></span><div class="swatches" data-group="color">${CAR_COLORS.map(c => `<button type="button" class="swatch ${c.hex === d.color ? 'on' : ''}" data-val="${c.hex}" style="--c:${c.hex}" aria-label="${c.name}"></button>`).join('')}</div></div>
      <div class="fld"><span>연료</span><div class="chips" data-group="fuel">${FUELS.map(f => `<button type="button" class="chip ${f.id === d.fuel ? 'on' : ''}" data-val="${f.id}">${f.name}</button>`).join('')}</div></div>
      <label class="fld"><span>${ex ? '등록 시 주행거리' : '현재 주행거리'}</span><div class="unit"><input class="num" name="initialKm" inputmode="numeric" placeholder="계기판 ODO 숫자" value="${d.initialKm !== '' ? fmt(d.initialKm) : ''}"><i>km</i></div></label>
      <label class="fld"><span>월 평균 주행거리 (예상)</span><div class="unit"><input class="num" name="monthlyKm" inputmode="numeric" value="${fmt(d.monthlyKm)}"><i>km</i></div><small>주행거리 기록이 쌓이면 실제 패턴으로 자동 보정돼요</small></label>
      <button class="btn primary full lg" type="submit">${ex ? '저장' : '등록하기'}</button>
      ${ex ? `<button type="button" class="btn danger-ghost full" data-act="del">이 차량 삭제</button>` : ''}
    </form>`;

  openSheet(html, {
    full: true, onMount(w) {
      const f = $('#cf', w);
      w.addEventListener('click', e => {
        const opt = e.target.closest('[data-group] [data-val]');
        if (opt) {
          const g = opt.closest('[data-group]'), key = g.dataset.group;
          $$('[data-val]', g).forEach(x => x.classList.toggle('on', x === opt));
          d[key] = opt.dataset.val;
          if (key === 'body' || key === 'color') {
            const p = $('#cf-prev', w); p.innerHTML = carSVG(d.body, d.color);
            p.classList.remove('pop'); void p.offsetWidth; p.classList.add('pop');
          }
          if (key === 'color') $('#cf-cname', w).textContent = colorName(d.color);
          return;
        }
        if (e.target.closest('[data-act="del"]')) {
          ask(`'${ex.nickname}'와 모든 정비·주행 기록을 삭제할까요?`, '삭제', true).then(ok => {
            if (!ok) return;
            state.cars = state.cars.filter(c => c.id !== ex.id);
            state.records = state.records.filter(r => r.carId !== ex.id);
            state.odos = state.odos.filter(o => o.carId !== ex.id);
            if (state.currentCarId === ex.id) state.currentCarId = state.cars[0]?.id || null;
            save(); closeSheet(w); render(); toast('차량을 삭제했어요');
          });
        }
      });
      f.addEventListener('submit', e => {
        e.preventDefault();
        const fd = new FormData(f);
        const model = String(fd.get('model') || '').trim();
        const km = parseNum(fd.get('initialKm'));
        if (isNaN(km)) { toast('주행거리를 입력해주세요'); f.initialKm.focus(); return; }
        const yr = parseNum(fd.get('year'));
        const data = {
          nickname: String(fd.get('nickname') || '').trim() || [d.brand !== '기타' ? d.brand : '', model].filter(Boolean).join(' ') || '내 차',
          brand: d.brand, model, year: isNaN(yr) ? '' : yr, body: d.body, color: d.color, fuel: d.fuel,
          initialKm: km, monthlyKm: parseNum(fd.get('monthlyKm')) || DEFAULT_MONTHLY_KM
        };
        if (ex) {
          if (ex.fuel !== d.fuel) {
            // 연료가 바뀌면 해당 연료에 맞게 기본 항목 활성 상태만 다시 맞춤 (주기 값은 유지)
            const have = new Set(ex.items.map(i => i.key));
            ex.items.forEach(i => { const df = defOf(i.key); if (df && !i.custom) i.enabled = applies(df, d.fuel) && !df.off; });
            buildItems(d.fuel).forEach(i => { if (!have.has(i.key)) ex.items.push(i); });
          }
          Object.assign(ex, data);
          toast('저장했어요');
        } else {
          const car = Object.assign({ id: uid(), createdAt: today(), rateMode: 'auto', items: buildItems(d.fuel) }, data);
          state.cars.push(car);
          state.currentCarId = car.id;
          toast('등록 완료! 최근 정비 기록을 입력해보세요');
        }
        save(); closeSheet(w); render();
      });
    }
  });
}

/* ───────── 시트: 정비 기록 ───────── */
function recordForm({ id, key } = {}) {
  const car = curCar();
  if (!car) { toast('먼저 차량을 등록해주세요'); return; }
  const ex = id ? state.records.find(r => r.id === id) : null;
  const os = odoState(car);
  const sel = new Set(ex ? ex.items : key ? [key] : []);
  const items = car.items.filter(i => i.enabled || sel.has(i.key));
  const html = `
    <div class="sheet-head"><h3>${ex ? '정비 기록 수정' : '정비 기록 추가'}</h3><button class="icon-btn" data-close aria-label="닫기">${ic('close')}</button></div>
    <form id="rf" class="form" novalidate>
      <div class="row2">
        <label class="fld"><span>정비일</span><input type="date" name="date" max="${today()}" value="${ex ? ex.date : today()}"></label>
        <label class="fld"><span>주행거리</span><div class="unit"><input class="num" name="km" inputmode="numeric" value="${fmt(ex ? ex.km : os.est)}"><i>km</i></div></label>
      </div>
      <div class="fld"><span>정비 항목 <em>여러 개 선택 가능</em></span>
        <div class="chips multi">${items.map(i => `<button type="button" class="chip ic-chip ${sel.has(i.key) ? 'on' : ''}" data-key="${i.key}">${ic(i.icon)}${esc(i.name)}</button>`).join('')}</div></div>
      <label class="fld"><span>비용</span><div class="unit"><input class="num" name="cost" inputmode="numeric" placeholder="0" value="${ex && ex.cost ? fmt(ex.cost) : ''}"><i>원</i></div></label>
      <label class="fld"><span>정비소</span><input name="shop" maxlength="30" placeholder="예: OO모터스" value="${esc(ex?.shop)}"></label>
      <label class="fld"><span>메모</span><textarea name="memo" rows="2" maxlength="200" placeholder="예: 합성유 5W-30, 다음엔 와이퍼도">${esc(ex?.memo)}</textarea></label>
      <button class="btn primary full lg" type="submit">저장</button>
      ${ex ? `<button type="button" class="btn danger-ghost full" data-act="del">기록 삭제</button>` : ''}
    </form>`;
  openSheet(html, {
    full: true, onMount(w) {
      const f = $('#rf', w);
      w.addEventListener('click', e => {
        const chip = e.target.closest('.multi .chip');
        if (chip) { const k = chip.dataset.key; sel.has(k) ? sel.delete(k) : sel.add(k); chip.classList.toggle('on', sel.has(k)); return; }
        if (e.target.closest('[data-act="del"]')) {
          ask('이 정비 기록을 삭제할까요?', '삭제', true).then(ok => {
            if (!ok) return;
            state.records = state.records.filter(r => r.id !== ex.id);
            save(); closeSheet(w); render(); toast('삭제했어요');
          });
        }
      });
      f.addEventListener('submit', e => {
        e.preventDefault();
        const fd = new FormData(f);
        const date = fd.get('date'), km = parseNum(fd.get('km'));
        if (!date) { toast('정비일을 선택해주세요'); return; }
        if (date > today()) { toast('미래 날짜는 입력할 수 없어요'); return; }
        if (isNaN(km)) { toast('주행거리를 입력해주세요'); return; }
        if (!sel.size) { toast('정비 항목을 하나 이상 선택해주세요'); return; }
        const rec = {
          carId: ex ? ex.carId : car.id, date, km, items: [...sel],
          cost: parseNum(fd.get('cost')) || 0,
          shop: String(fd.get('shop') || '').trim(), memo: String(fd.get('memo') || '').trim()
        };
        if (ex) Object.assign(ex, rec); else state.records.push(Object.assign({ id: uid() }, rec));
        save(); closeSheet(w); render(); toast(ex ? '수정했어요' : '정비 기록을 저장했어요');
      });
    }
  });
}

/* ───────── 시트: 주행거리 입력 ───────── */
function odoForm() {
  const car = curCar();
  if (!car) { toast('먼저 차량을 등록해주세요'); return; }
  const os = odoState(car);
  const html = `
    <div class="sheet-head"><h3>주행거리 입력</h3><button class="icon-btn" data-close aria-label="닫기">${ic('close')}</button></div>
    <p class="desc">계기판의 누적 주행거리(ODO)를 입력하면 예측이 더 정확해져요.<br>현재 예상치는 <b>${fmt(os.est)}km</b>예요.</p>
    <form id="of" class="form" novalidate>
      <label class="fld"><span>주행거리</span><div class="unit big"><input class="num" name="km" inputmode="numeric" placeholder="${fmt(os.est)}"><i>km</i></div></label>
      <label class="fld"><span>날짜</span><input type="date" name="date" max="${today()}" value="${today()}"></label>
      <button class="btn primary full lg" type="submit">저장</button>
    </form>`;
  openSheet(html, {
    onMount(w) {
      const f = $('#of', w);
      setTimeout(() => f.km.focus(), 300);
      f.addEventListener('submit', async e => {
        e.preventDefault();
        const km = parseNum(f.km.value), date = f.date.value;
        if (isNaN(km)) { toast('주행거리를 입력해주세요'); return; }
        if (!date || date > today()) { toast('날짜를 확인해주세요'); return; }
        const before = odoPoints(car).filter(p => p.date <= date);
        const maxBefore = Math.max(...before.map(p => p.km), 0);
        if (km < maxBefore && !(await ask(`이전 기록(${fmt(maxBefore)}km)보다 작아요.\n그래도 저장할까요?`, '저장'))) return;
        const same = state.odos.find(o => o.carId === car.id && o.date === date);
        if (same) same.km = km; else state.odos.push({ id: uid(), carId: car.id, date, km });
        save(); closeSheet(w); render(); toast('주행거리를 업데이트했어요');
      });
    }
  });
}

/* ───────── 시트: 항목 상세 ───────── */
function itemSheet(key) {
  const car = curCar(); if (!car) return;
  const it = car.items.find(i => i.key === key); if (!it) return;
  const body = () => {
    const s = itemStatus(car, it, odoState(car));
    const d = defOf(it.key);
    const dueTxt = s.status === 'over' ? '지금 교체·점검이 필요해요'
      : s.dueDays != null ? `${fmtDate(s.dueDate)}쯤 (${span(Math.max(0, s.dueDays))} 후) · ${s.dueBy === 'km' ? '주행거리' : '기간'} 기준이 먼저` : '';
    const info = `
      ${s.estimated ? `<div class="callout">${ic('wrench')}<div><b>정비 기록이 없어 ${esc(s.last.label)} 기준으로 추정했어요</b><span>${s.first ? `신차 최초 교체 주기(${cycleText({ km: s.iKm, months: s.iMo })})로 계산했어요. ` : ''}실제로 정비한 적이 있다면 아래 버튼으로 입력하면 정확해져요.</span></div></div>` : ''}
      <div class="due st-${s.status}"><span class="pill">${STATUS_LABEL[s.status]}</span><b>${dueTxt}</b></div>
      ${gauges(s, true)}
      <div class="grid2">
        <div><small>${s.estimated ? '기준점 (추정)' : '마지막 정비'}</small><b>${fmtDate(s.last.date)}</b><span>${fmt(s.last.km)}km</span></div>
        ${s.iKm > 0 ? `<div><small>다음 (주행거리)</small><b>${fmt(s.nextKm)}km</b><span>${s.remainKm > 0 ? fmtDate(s.kmDate) + ' 예상' : fmt(-s.remainKm) + 'km 초과'}</span></div>` : ''}
        ${s.iMo > 0 ? `<div><small>다음 (기간)</small><b>${fmtDate(s.nextDate)}</b><span>${dday(s.remainDays)}</span></div>` : ''}
      </div>
      ${d && d.note ? `<p class="note">${ic('check')}<span>${esc(d.note)}</span></p>` : ''}`;
    const hist = s.hist.map(r => `<button class="hrow" data-act="rec" data-id="${r.id}"><span>${fmtDate(r.date)}</span><span>${fmt(r.km)}km</span>${r.kind === 'defer' ? '<em class="dfr">점검·미룸</em>' : `<b>${r.cost ? won(r.cost) : '-'}</b>`}</button>`).join('');
    return `
      <div class="sheet-head"><span class="ic lg">${ic(it.icon)}</span><div class="grow"><h3>${esc(it.name)}</h3><p>주기 ${cycleText(it)}</p></div><button class="icon-btn" data-close aria-label="닫기">${ic('close')}</button></div>
      ${info}
      <div class="cyc-edit">
        <span class="lbl">점검 주기</span>
        <div class="cyc-in">
          <div class="unit"><input class="num" inputmode="numeric" id="ie-km" value="${it.km ? fmt(it.km) : ''}" placeholder="없음"><i>km</i></div>
          <span class="or">또는</span>
          <div class="unit"><input class="num" inputmode="numeric" id="ie-mo" value="${it.months || ''}" placeholder="없음"><i>개월</i></div>
          <button class="btn ghost sm" data-act="save-cyc">적용</button>
        </div>
      </div>
      ${hist ? `<div class="sub-h">정비 이력 (${s.hist.length})</div><div class="card list hist">${hist}</div>` : ''}
      <button class="btn primary full lg" data-act="done">${ic('check')}${s.estimated ? '마지막 교체 입력하기' : '교체 완료 기록하기'}</button>
      <button class="btn ghost full defer-btn" data-act="defer">점검만 했어요 · 다음 주기로 넘기기</button>`;
  };
  const w = openSheet(body(), {
    onMount(w) {
      w.addEventListener('click', e => {
        const a = e.target.closest('[data-act]'); if (!a) return;
        if (a.dataset.act === 'done') { closeSheet(w); setTimeout(() => recordForm({ key }), 120); }
        if (a.dataset.act === 'defer') { closeSheet(w); setTimeout(() => deferSheet(key), 120); }
        if (a.dataset.act === 'rec') {
          const r = state.records.find(x => x.id === a.dataset.id);
          if (r && r.kind === 'defer') {
            ask(`${fmtDate(r.date)} '다음 주기로 넘기기' 기록을 삭제할까요?`, '삭제', true).then(ok => {
              if (!ok) return;
              state.records = state.records.filter(x => x.id !== r.id);
              save(); render(); $('.sheet-body', w).innerHTML = body(); toast('삭제했어요');
            });
            return;
          }
          closeSheet(w); setTimeout(() => recordForm({ id: a.dataset.id }), 120);
        }
        if (a.dataset.act === 'save-cyc') {
          const km = parseNum($('#ie-km', w).value), mo = parseNum($('#ie-mo', w).value);
          if ((isNaN(km) || !km) && (isNaN(mo) || !mo)) { toast('거리나 기간 중 하나는 입력해주세요'); return; }
          it.km = isNaN(km) ? 0 : km; it.months = isNaN(mo) ? 0 : mo;
          save(); render(); $('.sheet-body', w).innerHTML = body(); toast('주기를 변경했어요');
        }
      });
    }
  });
  return w;
}

/* ───────── 시트: 점검만 하고 다음 주기로 넘기기 ───────── */
function deferSheet(key) {
  const car = curCar(); if (!car) return;
  const it = car.items.find(i => i.key === key); if (!it) return;
  const os = odoState(car);
  const s = itemStatus(car, it, os);
  const baseKm = it.km, baseMo = it.months;
  const opts = [
    { f: .5, label: '반 주기' },
    { f: 1, label: '한 주기' }
  ].map(o => ({ ...o, km: baseKm ? Math.round(baseKm * o.f / 500) * 500 : 0, mo: baseMo ? Math.max(1, Math.round(baseMo * o.f)) : 0 }));
  let pick = 0;
  const html = `
    <div class="sheet-head"><span class="ic lg">${ic(it.icon)}</span><div class="grow"><h3>다음 주기로 넘기기</h3><p>${esc(it.name)}</p></div><button class="icon-btn" data-close aria-label="닫기">${ic('close')}</button></div>
    <p class="desc">정비소에서 점검했는데 아직 교체 안 해도 된다고 한 경우예요. 교체 기록은 그대로 두고, 다음 교체 시점만 오늘부터 뒤로 미뤄요.</p>
    <form id="df" class="form" novalidate>
      <div class="row2">
        <label class="fld"><span>점검일</span><input type="date" name="date" max="${today()}" value="${today()}"></label>
        <label class="fld"><span>주행거리</span><div class="unit"><input class="num" name="km" inputmode="numeric" value="${fmt(os.est)}"><i>km</i></div></label>
      </div>
      <div class="fld"><span>얼마나 미룰까요?</span>
        <div class="seg defer-seg">${opts.map((o, i) => `<button type="button" class="${i === pick ? 'on' : ''}" data-i="${i}"><b>${o.label}</b><small>${cycleText({ km: o.km, months: o.mo })}</small></button>`).join('')}</div>
      </div>
      <p class="note" id="df-prev"></p>
      <button class="btn primary full lg" type="submit">다음 주기로 넘기기</button>
    </form>`;
  openSheet(html, {
    onMount(w) {
      const f = $('#df', w);
      const preview = () => {
        const o = opts[pick], km = parseNum(f.km.value), date = f.date.value || today();
        const parts = [];
        if (o.km && !isNaN(km)) parts.push(`${fmt(km + o.km)}km`);
        if (o.mo) parts.push(fmtDate(addMonths(date, o.mo)));
        $('#df-prev', w).innerHTML = `${ic('check')}<span>다음 교체 시점: <b>${parts.join(' 또는 ')}</b>${parts.length > 1 ? ' 중 먼저 오는 때' : ''}${s.status === 'over' ? '<br>지금 초과 상태가 해제돼요.' : ''}</span>`;
      };
      preview();
      f.addEventListener('input', preview);
      w.addEventListener('click', e => {
        const b = e.target.closest('.defer-seg button'); if (!b) return;
        pick = Number(b.dataset.i);
        $$('.defer-seg button', w).forEach(x => x.classList.toggle('on', x === b));
        preview();
      });
      f.addEventListener('submit', e => {
        e.preventDefault();
        const km = parseNum(f.km.value), date = f.date.value;
        if (!date || date > today()) { toast('점검일을 확인해주세요'); return; }
        if (isNaN(km)) { toast('주행거리를 입력해주세요'); return; }
        const o = opts[pick];
        state.records.push({ id: uid(), carId: car.id, date, km, items: [key], kind: 'defer', addKm: o.km, addMonths: o.mo, cost: 0, shop: '', memo: '점검 후 다음 주기로 넘김' });
        save(); closeSheet(w); render(); toast('다음 주기로 넘겼어요');
      });
    }
  });
}

/* ───────── 시트: 커스텀 항목 ───────── */
function customItemForm() {
  const car = curCar(); if (!car) return;
  const html = `
    <div class="sheet-head"><h3>정비 항목 추가</h3><button class="icon-btn" data-close aria-label="닫기">${ic('close')}</button></div>
    <form id="cif" class="form" novalidate>
      <label class="fld"><span>항목 이름</span><input name="name" maxlength="20" placeholder="예: 디퍼런셜 오일"></label>
      <div class="row2">
        <label class="fld"><span>거리 주기</span><div class="unit"><input class="num" name="km" inputmode="numeric" placeholder="없음"><i>km</i></div></label>
        <label class="fld"><span>기간 주기</span><div class="unit"><input class="num" name="months" inputmode="numeric" placeholder="없음"><i>개월</i></div></label>
      </div>
      <button class="btn primary full lg" type="submit">추가</button>
    </form>`;
  openSheet(html, {
    onMount(w) {
      const f = $('#cif', w);
      f.addEventListener('submit', e => {
        e.preventDefault();
        const name = f.name.value.trim(), km = parseNum(f.km.value), mo = parseNum(f.months.value);
        if (!name) { toast('항목 이름을 입력해주세요'); return; }
        if ((isNaN(km) || !km) && (isNaN(mo) || !mo)) { toast('거리나 기간 중 하나는 입력해주세요'); return; }
        car.items.push({ key: 'c_' + uid(), name, icon: 'wrench', km: isNaN(km) ? 0 : km, months: isNaN(mo) ? 0 : mo, enabled: true, custom: true });
        save(); closeSheet(w); render(); toast('항목을 추가했어요');
      });
    }
  });
}

/* ───────── 예시 데이터 ───────── */
function loadDemo() {
  const t = today(), D = n => addDays(t, -n);
  const a = { id: uid(), nickname: '파랑이', brand: '현대', model: '아반떼', year: 2021, body: 'sedan', color: '#2E6CF6', fuel: 'gasoline', initialKm: 32000, createdAt: D(200), monthlyKm: 1250, rateMode: 'auto', items: buildItems('gasoline') };
  const b = { id: uid(), nickname: '패밀리카', brand: '기아', model: '쏘렌토', year: 2024, body: 'suv', color: '#F3F5F8', fuel: 'hybrid', initialKm: 12000, createdAt: D(40), monthlyKm: 1500, rateMode: 'auto', items: buildItems('hybrid') };
  state = blank();
  state.cars = [a, b]; state.currentCarId = a.id;
  state.odos = [
    { id: uid(), carId: a.id, date: D(140), km: 36500 },
    { id: uid(), carId: a.id, date: D(60), km: 41200 },
    { id: uid(), carId: a.id, date: D(12), km: 44300 },
    { id: uid(), carId: b.id, date: D(5), km: 13900 }
  ];
  state.records = [
    { id: uid(), carId: a.id, date: D(250), km: 30900, items: ['engine_oil', 'cabin_filter'], cost: 89000, shop: '블루모터스', memo: '합성유 5W-30' },
    { id: uid(), carId: a.id, date: D(95), km: 39800, items: ['tire_rotation', 'brake_pad'], cost: 180000, shop: '블루모터스', memo: '' },
    { id: uid(), carId: a.id, date: D(420), km: 27000, items: ['coolant', 'wiper', 'air_filter'], cost: 72000, shop: '동네 카센터', memo: '' },
    { id: uid(), carId: a.id, date: D(1000), km: 8000, items: ['battery'], cost: 150000, shop: '', memo: '' },
    { id: uid(), carId: b.id, date: D(30), km: 12300, items: ['engine_oil'], cost: 95000, shop: '기아 오토큐', memo: '' }
  ];
  save(); render(); toast('예시 데이터를 불러왔어요');
}

/* ───────── 백업 ───────── */
// 백업: 텍스트 복사(어디서나 동작) + 파일 저장(일반 브라우저에서 동작)
function exportData() {
  const json = JSON.stringify(state);
  openSheet(`
    <div class="sheet-head"><h3>백업</h3><button class="icon-btn" data-close aria-label="닫기">${ic('close')}</button></div>
    <p class="desc">아래 백업 코드를 복사해서 메모앱이나 카톡 '나에게 보내기'에 붙여 넣어 보관하세요. 나중에 '백업 불러오기'에 붙여 넣으면 복원돼요.</p>
    <textarea id="bk-text" class="bk" readonly>${esc(json)}</textarea>
    <div class="btn-row"><button class="btn ghost" data-act="file">파일로 저장</button><button class="btn primary" data-act="copy">백업 코드 복사</button></div>`, {
    onMount(w) {
      w.addEventListener('click', e => {
        const a = e.target.closest('[data-act]'); if (!a) return;
        if (a.dataset.act === 'copy') {
          const ta = $('#bk-text', w);
          const fallback = () => { ta.focus(); ta.select(); toast('텍스트를 선택했어요. 복사해주세요'); };
          try { navigator.clipboard.writeText(json).then(() => toast('백업 코드를 복사했어요'), fallback); } catch (err) { fallback(); }
        }
        if (a.dataset.act === 'file') {
          const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = `mygarage-backup-${today().replace(/-/g, '')}.json`;
          document.body.appendChild(link); link.click(); link.remove();
          setTimeout(() => URL.revokeObjectURL(link.href), 1000);
        }
      });
    }
  });
}
function restoreFrom(text) {
  let s;
  try { s = JSON.parse(text); if (!s || !Array.isArray(s.cars) || !Array.isArray(s.records)) throw new Error('bad'); }
  catch (e) { toast('올바른 백업 코드가 아니에요'); return Promise.resolve(false); }
  return ask(`차량 ${s.cars.length}대, 정비 기록 ${s.records.length}건을 불러올까요?\n현재 데이터는 덮어써져요.`, '불러오기').then(ok => {
    if (!ok) return false;
    state = Object.assign(blank(), s); save(); render(); toast('백업을 불러왔어요');
    return true;
  });
}
function importData(file) {
  const rd = new FileReader();
  rd.onload = () => restoreFrom(rd.result);
  rd.readAsText(file);
}
function importSheet() {
  openSheet(`
    <div class="sheet-head"><h3>백업 불러오기</h3><button class="icon-btn" data-close aria-label="닫기">${ic('close')}</button></div>
    <p class="desc">보관해둔 백업 코드를 붙여 넣거나, 백업 파일을 선택하세요.</p>
    <textarea id="im-text" class="bk" placeholder="백업 코드 붙여넣기"></textarea>
    <div class="btn-row"><button class="btn ghost" data-act="file">파일 선택</button><button class="btn primary" data-act="paste">불러오기</button></div>`, {
    onMount(w) {
      w.addEventListener('click', e => {
        const a = e.target.closest('[data-act]'); if (!a) return;
        if (a.dataset.act === 'file') $('#import-file').click();
        if (a.dataset.act === 'paste') {
          const v = $('#im-text', w).value.trim();
          if (!v) { toast('백업 코드를 붙여 넣어주세요'); return; }
          restoreFrom(v).then(ok => { if (ok) closeSheet(w); });
        }
      });
    }
  });
}

/* ───────── 렌더 & 이벤트 ───────── */
const VIEWS = { home: vHome, records: vRecords, odo: vOdo, config: vSettings };
function render() {
  $('#app').innerHTML = (VIEWS[view] || vHome)();
  $$('.tabbar [data-tab]').forEach(b => b.classList.toggle('on', b.dataset.tab === view));
  const fab = $('#fab'), car = curCar();
  if (car && (view === 'home' || view === 'records')) { fab.hidden = false; fab.dataset.action = 'add-record'; fab.innerHTML = ic('plus') + '<span>정비 기록</span>'; }
  else if (car && view === 'odo') { fab.hidden = false; fab.dataset.action = 'odo'; fab.innerHTML = ic('plus') + '<span>주행거리</span>'; }
  else fab.hidden = true;
}
function setView(v) {
  view = VIEWS[v] ? v : 'home';
  try { history.replaceState(null, '', view === 'home' ? location.pathname + location.search : '#' + view); } catch (e) { /* noop */ }
  render(); window.scrollTo(0, 0);
}

document.addEventListener('click', e => {
  const el = e.target.closest('[data-action]');
  if (!el || el.closest('.sheet-wrap')) return;
  const car = curCar();
  switch (el.dataset.action) {
    case 'tab': setView(el.dataset.tab); break;
    case 'select-car': state.currentCarId = el.dataset.id; save(); render(); break;
    case 'add-car': carForm(); break;
    case 'edit-car': carForm(el.dataset.id); break;
    case 'odo': odoForm(); break;
    case 'add-record': recordForm(); break;
    case 'record': {
      const r = state.records.find(x => x.id === el.dataset.id);
      if (r && r.kind === 'defer') {
        ask(`${fmtDate(r.date)} '다음 주기로 넘기기' 기록을 삭제할까요?`, '삭제', true).then(ok => {
          if (ok) { state.records = state.records.filter(x => x.id !== r.id); save(); render(); toast('삭제했어요'); }
        });
      } else recordForm({ id: el.dataset.id });
      break;
    }
    case 'item': itemSheet(el.dataset.key); break;
    case 'demo': loadDemo(); break;
    case 'rate-mode': car.rateMode = el.dataset.mode; save(); render(); break;
    case 'del-odo': {
      const id = el.dataset.id;
      ask('이 주행 기록을 삭제할까요?', '삭제', true).then(ok => { if (ok) { state.odos = state.odos.filter(o => o.id !== id); save(); render(); } });
      break;
    }
    case 'add-item': customItemForm(); break;
    case 'del-item': {
      const key = el.dataset.key;
      ask('이 항목을 삭제할까요?', '삭제', true).then(ok => { if (ok) { car.items = car.items.filter(i => i.key !== key); save(); render(); } });
      break;
    }
    case 'reset-items':
      ask('기본 항목의 주기와 사용 여부를 기본값으로 되돌릴까요?\n(직접 추가한 항목은 유지돼요)', '되돌리기').then(ok => {
        if (ok) { car.items = buildItems(car.fuel).concat(car.items.filter(i => i.custom)); save(); render(); toast('기본값으로 되돌렸어요'); }
      });
      break;
    case 'export': exportData(); break;
    case 'import': importSheet(); break;
    case 'reset-all':
      ask('모든 차량과 기록이 삭제되고 되돌릴 수 없어요.\n정말 삭제할까요?', '전체 삭제', true).then(ok => {
        if (ok) { state = blank(); save(); setView('home'); toast('모든 데이터를 삭제했어요'); }
      });
      break;
  }
});

document.addEventListener('keydown', e => {
  if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('article[data-action]')) { e.preventDefault(); e.target.click(); }
  if (e.key === 'Escape') { const w = [...$$('.sheet-wrap')].pop(); if (w) closeSheet(w); }
});

// 숫자 입력 시 천 단위 콤마
document.addEventListener('input', e => {
  const t = e.target;
  if (!t.classList || !t.classList.contains('num')) return;
  const n = parseNum(t.value);
  t.value = isNaN(n) ? '' : (t.dataset.cyc === 'months' || t.id === 'ie-mo' ? String(n) : fmt(n));
});

document.addEventListener('change', e => {
  const t = e.target;
  if (t.id === 'import-file') { if (t.files[0]) importData(t.files[0]); t.value = ''; return; }
  if (!t.closest('#app')) return;
  const car = curCar(); if (!car) return;
  if (t.dataset.cyc) {
    const it = car.items.find(i => i.key === t.dataset.key); if (!it) return;
    if (t.dataset.cyc === 'enabled') { it.enabled = t.checked; save(); render(); toast(it.enabled ? `${it.name} 사용` : `${it.name} 사용 안 함`); return; }
    const n = parseNum(t.value);
    const other = t.dataset.cyc === 'km' ? it.months : it.km;
    if ((isNaN(n) || !n) && !other) { toast('거리나 기간 중 하나는 있어야 해요'); render(); return; }
    it[t.dataset.cyc] = isNaN(n) ? 0 : n;
    save(); render(); toast('주기를 저장했어요');
  }
  if (t.dataset.field === 'monthlyKm') {
    car.monthlyKm = parseNum(t.value) || DEFAULT_MONTHLY_KM; save(); render(); toast('저장했어요');
  }
});

// 당겨서 새로고침 (홈 화면에 추가한 앱에서도 동작)
(function pullToRefresh() {
  const el = $('#ptr'); if (!el) return;
  const icon = $('svg', el);
  const MAX = 110, GO = 70;
  let x0 = 0, y0 = null, pull = 0, active = false;
  const reset = () => {
    el.style.transition = 'transform .25s ease, opacity .25s ease';
    el.style.transform = ''; el.style.opacity = '';
    el.classList.remove('ready');
    setTimeout(() => { el.style.transition = ''; }, 260);
  };
  window.addEventListener('touchstart', e => {
    y0 = null;
    if (e.touches.length !== 1 || window.scrollY > 0 || $('.sheet-wrap')) return;
    x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; pull = 0; active = false;
  }, { passive: true });
  window.addEventListener('touchmove', e => {
    if (y0 == null) return;
    const dx = e.touches[0].clientX - x0, dy = e.touches[0].clientY - y0;
    if (!active) {
      if (dy > 8 && dy > Math.abs(dx) * 1.5 && window.scrollY <= 0) active = true;
      else if (dy < 0 || Math.abs(dx) > 8) { y0 = null; return; }
      else return;
    }
    if (e.cancelable) e.preventDefault();
    pull = Math.min(MAX, Math.max(0, dy) * 0.5);
    el.style.transform = `translate(-50%, ${pull}px)`;
    el.style.opacity = String(Math.min(1, pull / 45));
    icon.style.transform = `rotate(${pull * 3.2}deg)`;
    el.classList.toggle('ready', pull >= GO);
  }, { passive: false });
  window.addEventListener('touchend', () => {
    if (y0 == null) return;
    y0 = null;
    if (!active) return;
    active = false;
    if (pull >= GO) {
      el.classList.add('loading');
      el.style.transition = 'transform .2s ease';
      el.style.transform = `translate(-50%, ${GO - 10}px)`;
      setTimeout(() => location.reload(), 380);
    } else reset();
  });
})();

const initial = location.hash.slice(1);
if (VIEWS[initial]) view = initial;
if (new URLSearchParams(location.search).has('demo') && !state.cars.length) loadDemo();
render();
})();
