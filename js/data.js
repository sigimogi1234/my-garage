/* 기본 데이터: 브랜드, 차종, 색상, 연료, 정비 항목 기본 주기 */

const BRANDS = [
  '현대', '기아', '제네시스', '쉐보레', '르노코리아', 'KGM',
  'BMW', '벤츠', '아우디', '폭스바겐', '볼보', '테슬라',
  '토요타', '렉서스', '혼다', '포르쉐', '미니', '포드', '기타'
];

const BODY_TYPES = [
  { id: 'sedan',  name: '세단' },
  { id: 'hatch',  name: '해치백' },
  { id: 'suv',    name: 'SUV' },
  { id: 'coupe',  name: '쿠페' },
  { id: 'van',    name: '미니밴' },
  { id: 'pickup', name: '픽업' }
];

const CAR_COLORS = [
  { name: '스노우 화이트', hex: '#F3F5F8' },
  { name: '실버',         hex: '#C4CAD3' },
  { name: '그레이',       hex: '#6B7483' },
  { name: '미드나잇 블랙', hex: '#262A33' },
  { name: '오션 블루',     hex: '#2E6CF6' },
  { name: '스카이',       hex: '#7DB4FF' },
  { name: '네이비',       hex: '#1E3A8A' },
  { name: '레드',         hex: '#E5484D' },
  { name: '오렌지',       hex: '#F2892E' },
  { name: '옐로우',       hex: '#F5C542' },
  { name: '그린',         hex: '#2F9E6E' },
  { name: '민트',         hex: '#7FD6C2' },
  { name: '베이지',       hex: '#D9C7A7' },
  { name: '핑크',         hex: '#F4A3C0' }
];

const FUELS = [
  { id: 'gasoline', name: '가솔린' },
  { id: 'diesel',   name: '디젤' },
  { id: 'hybrid',   name: '하이브리드' },
  { id: 'lpg',      name: 'LPG' },
  { id: 'ev',       name: '전기' }
];

const ICE = ['gasoline', 'diesel', 'hybrid', 'lpg']; // 내연기관 계열

/*
 * 일반적으로 많이 쓰는 권장 주기 (km = 0 이면 기간만, months = 0 이면 거리만 체크)
 * 실제 주기는 차량 매뉴얼/운전 환경에 따라 다를 수 있어 설정에서 바꿀 수 있음
 */
const DEFAULT_ITEMS = [
  { key: 'engine_oil',    name: '엔진오일·오일필터', icon: 'oil',     km: 10000,  months: 12, fuels: ICE },
  { key: 'cabin_filter',  name: '에어컨 필터',       icon: 'wind',    km: 10000,  months: 6 },
  { key: 'air_filter',    name: '에어클리너',        icon: 'filter',  km: 20000,  months: 12, fuels: ICE },
  { key: 'tire_rotation', name: '타이어 위치교환',    icon: 'rotate',  km: 10000,  months: 12 },
  { key: 'tire',          name: '타이어 교체',       icon: 'tire',    km: 50000,  months: 48 },
  { key: 'brake_pad',     name: '브레이크 패드',      icon: 'brake',   km: 30000,  months: 24 },
  { key: 'brake_fluid',   name: '브레이크액',        icon: 'drop',    km: 40000,  months: 24 },
  { key: 'coolant',       name: '냉각수(부동액)',     icon: 'thermo',  km: 40000,  months: 24 },
  { key: 'atf',           name: '변속기 오일',       icon: 'gear',    km: 60000,  months: 48, fuels: ICE },
  { key: 'reducer_oil',   name: '감속기 오일',       icon: 'gear',    km: 60000,  months: 48, fuels: ['ev'] },
  { key: 'spark_plug',    name: '점화플러그',        icon: 'spark',   km: 40000,  months: 36, fuels: ['gasoline', 'hybrid', 'lpg'] },
  { key: 'fuel_filter',   name: '연료필터',          icon: 'fuel',    km: 30000,  months: 24, fuels: ['diesel'] },
  { key: 'wiper',         name: '와이퍼',            icon: 'wiper',   km: 0,      months: 12 },
  { key: 'battery',       name: '배터리(12V)',       icon: 'battery', km: 0,      months: 36 },
  { key: 'timing_belt',   name: '타이밍벨트',        icon: 'belt',    km: 100000, months: 72, fuels: ICE, off: true }
];

const DEFAULT_MONTHLY_KM = 1250; // 연 15,000km 기준
