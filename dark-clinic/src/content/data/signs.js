// Что видит ученик при каждой проверке. Тексты наблюдений, без выводов.
// Значения (value) — коды наблюдений, а не правда: по ним интерфейс и боты
// могут читать карту так же, как игрок читает лист Лю на стене.

export const HERB_NAMES = {
  herb_out_cold: null,
  herb_out_heat: null,
  herb_in_cold: null,
  herb_in_heat: null,
};

export const TONGUE = {
  pale_white: null,
  pale_swollen: null,
  red_thin_yellow: null,
  red_yellow: null,
  brown_stained: null,
  pink_even: null,
  grey_dry: null,
  pale_bluish: null,
};

export const RATE = {
  slow: null,
  fast: null,
  even: null,
  very_slow: null,
};
export const WEAK = ''; // «слабый пульс» ни один лист не учит — не приманка

export const DEPTH = {
  surface: null,
  deep: null,
  middle: null,
};

export const MIRROR = {
  strong: { image: 'mirror_fog_strong', text: null },
  weak: { image: 'mirror_fog_weak', text: null },
  clear: { image: 'mirror_clear', text: null },
};

// Рука — цветом кожи, грязью и влагой, а не теплом (§23, «Честный шум»): даром она на доску не отвечает.
// Влажная и сухая рука бывает и при холоде, и при жаре.
export const ARM = {
  warm: null,
  sweaty: null,
  old: null,
  wet: null,
  grey_blue: null,
  earth: null,
  porcelain: null,
};

// У каждого своя рука — по ремеслу (картинка та же, что в ARM).
export const ARM_OF = {
  zhou: null,
  gao: null,
  lan: null,
  mei: null,
  xu: null,
};

export const REST = {
  evens: null,
  barely: null,
  unchanged: null,
};

export const QUESTIONS = {
  thirst: { label: null, line: null },
  duration: { label: null, line: null },
  chills: { label: null, line: null },
  home: { label: null, line: null },
};

export const CHECK_NAMES = {
  tongue: null,
  pulse_rate: null,
  pulse_depth: null,
  mirror: null,
  rinse: null,
  rest: null,
  thirst: null,
  duration: null,
  chills: null,
  home: null,
  arm: null,
};

/**
 * Карта с листа Лю. Публичное знание: что значит каждое наблюдение.
 * Не правда о госте — у живого с шумом одно наблюдение может врать.
 */
export const PUBLIC_MAP = {
  tongue: {
    pale_white: { temp: 'cold' }, pale_swollen: { temp: 'cold' }, pale_bluish: { temp: 'cold' },
    red_thin_yellow: { temp: 'heat' }, red_yellow: { temp: 'heat' },
    brown_stained: { temp: 'heat' }, // жёлтый налёт читается как жар — даже если это чай
    pink_even: {}, grey_dry: {},
  },
  rate: { slow: { temp: 'cold' }, very_slow: { temp: 'cold' }, fast: { temp: 'heat' }, even: {} },
  depth: { surface: { loc: 'out' }, deep: { loc: 'in' }, middle: {} },
  thirst: { warm: { temp: 'cold' }, nothing: { temp: 'cold' }, cold_drink: { temp: 'heat' }, as_needed: {} },
  duration: { recent: { loc: 'out' }, long: { loc: 'in' }, vague: {} },
  chills: { yes: { loc: 'out' }, no: { loc: 'in' }, even: {} },
};
