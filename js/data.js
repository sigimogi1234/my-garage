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
// first: 신차(출고) 기준 최초 교체 주기가 따로 있는 항목
// note: 기본값 근거 (설정·상세 화면에 표시)
const DEFAULT_ITEMS = [
  { key: 'engine_oil',    name: '엔진오일·오일필터', icon: 'oil',     km: 10000,  months: 12, fuels: ICE,
    note: '제조사 일반 조건 1만~1.5만km/12개월, 시내 위주·단거리는 5천~7.5천km 권장' },
  { key: 'cabin_filter',  name: '에어컨 필터',       icon: 'wind',    km: 15000,  months: 12,
    note: '현대 매뉴얼 12개월마다 교체. 미세먼지 많은 지역은 6개월' },
  { key: 'air_filter',    name: '에어클리너',        icon: 'filter',  km: 30000,  months: 24, fuels: ICE,
    note: '보통 2만~4만km. 비포장·먼지 많은 환경이면 더 자주' },
  { key: 'tire_rotation', name: '타이어 위치교환',    icon: 'rotate',  km: 10000,  months: 12,
    note: '1만km 전후로 앞뒤 교환하면 마모가 고르게 돼요' },
  { key: 'tire',          name: '타이어 교체',       icon: 'tire',    km: 50000,  months: 60,
    note: '보통 4만~6만km, 또는 제조 5년. 마모한계 1.6mm면 즉시' },
  { key: 'brake_pad',     name: '브레이크 패드',      icon: 'brake',   km: 40000,  months: 0,
    note: '제조사는 점검만 지정. 앞 3만~4만km가 일반적, 마모 경고음 시 교체' },
  { key: 'brake_fluid',   name: '브레이크액',        icon: 'drop',    km: 50000,  months: 24,
    note: '현대 5만km, 기아 2년마다 교체 (먼저 오는 쪽)' },
  { key: 'coolant',       name: '냉각수(부동액)',     icon: 'thermo',  km: 40000,  months: 24, first: { km: 200000, months: 120 },
    note: '장수명 냉각수: 신차 최초 20만km/10년, 이후 4만km/2년' },
  { key: 'atf',           name: '변속기 오일',       icon: 'gear',    km: 100000, months: 0, fuels: ICE,
    note: '현대·기아 일반 조건은 무교환. 가혹 조건·오래 탈 차는 10만km 교체 권장' },
  { key: 'reducer_oil',   name: '감속기 오일',       icon: 'gear',    km: 120000, months: 0, fuels: ['ev'],
    note: '전기차 감속기 오일은 대부분 무교환. 가혹 조건이면 점검 권장' },
  { key: 'spark_plug',    name: '점화플러그',        icon: 'spark',   km: 100000, months: 0, fuels: ['gasoline', 'hybrid', 'lpg'],
    note: '이리듐 기준 자연흡기 약 16만km, 터보 약 7만km (엔진마다 다름)' },
  { key: 'fuel_filter',   name: '연료필터',          icon: 'fuel',    km: 40000,  months: 24, fuels: ['diesel'],
    note: '디젤 3만~4만km가 일반적' },
  { key: 'wiper',         name: '와이퍼',            icon: 'wiper',   km: 0,      months: 12,
    note: '6개월~1년. 줄무늬가 생기거나 소리 나면 교체' },
  { key: 'battery',       name: '배터리(12V)',       icon: 'battery', km: 0,      months: 36,
    note: '보통 3~5년. 시동이 약해지면 점검' },
  { key: 'timing_belt',   name: '타이밍벨트',        icon: 'belt',    km: 100000, months: 72, fuels: ICE, off: true,
    note: '최근 차는 대부분 타이밍체인(무교환). 벨트 엔진만 켜세요' }
];

// 이전 버전 기본값 (사용자가 안 바꾼 항목만 새 기본값으로 올려주기 위해)
const LEGACY_DEFAULTS = {
  engine_oil: [10000, 12], cabin_filter: [10000, 6], air_filter: [20000, 12], tire_rotation: [10000, 12],
  tire: [50000, 48], brake_pad: [30000, 24], brake_fluid: [40000, 24], coolant: [40000, 24],
  atf: [60000, 48], reducer_oil: [60000, 48], spark_plug: [40000, 36], fuel_filter: [30000, 24],
  wiper: [0, 12], battery: [0, 36], timing_belt: [100000, 72]
};

const DEFAULT_MONTHLY_KM = 1250; // 연 15,000km 기준
