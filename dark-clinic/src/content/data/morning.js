// Утро: книга приёма, касса, улица, крючок, последняя карточка демо. Только данные.
// Шаблоны: {N} — имя, {м|ж} — по роду, {PACKET} — что было в свёртке, {FACT} — что видно утром.
//
// Строка книги: что выдал и одно, что видно утром. Без «вылечен, заплатил», без счёта.
// Утренние приметы не повторяются: у каждого их несколько, движок берёт следующую.

export const LEDGER = {
  packet: null,
  refused: null,
  refused_inside: null,
  unreceived: null,
  // умер у тебя на табурете — у каждого своё утро (ревью, раунд 16: «дверь, снятая с петель» у всех)
  killed_drink: {
    zhou: null,
    gao: null,
    lan: null,
    xu: null,
    deng: null,
    feng: null,
  },
  killed_home: null,
  promise: [null, null, null, null],
  // не живые
  bai_any: null,
  bai_refused: null,
  bai_unreceived: null,
  wei_any: null,
  wei_any_dark: null,
  bai_any_dark: null,
  wei3_any_dark: null,
  wei_refused: null,
  wei_refused_inside: null,
  wei_unreceived: null,
  wei3_any: null,
  wei3_refused: null,
  wei3_refused_inside: null,
  // Мэй умерла у тебя на лавке — Вэй уходит один
  wei3_any_alone: null,
  wei3_refused_alone: null,
  wei3_refused_inside_alone: null,
  wei3_any_inside_alone: null,
  wei3_unreceived: null,
  revealed: null,
  revealed_drink: null,
  revealed_course: null,
  fed: null,
  destroyed: null,
  destroyed_drink: null,
  scene_qian: null,
  // ночь 3: мера никому не досталась — сухо, одной строкой
  thanks: null,
  thanksDark: null,
  darkVoice: [null, null, null, null, null],
  darkRefused: [null, null, null],
  // по одному слову на каждое утро (индекс — утро − 1)
  darkOutcome: {
    well: { one: [null, null, null], many: [null, null, null] }, better: { one: [null, null, null], many: [null, null, null] }, same: { one: [null, null, null], many: [null, null, null] },
    worse: { one: [null, null, null], many: [null, null, null] }, gone: { one: [null, null, null], many: [null, null, null] },
  },
  darkSummary: { 1: null, 2: null, 3: null },
  // один безымянный голос — исход в его же строке (индекс — утро − 1)
  darkOne: { well: [null, null, null], better: [null, null, null], same: [null, null, null], worse: [null, null, null], gone: [null, null, null] },
  thanks_closed: null,
  unopened: [null, null, null, null],
  paper: '',
};


// Лестница мест (§23, раунды 25–26): ключ — ранг (цифра) и сдвиг за ночь против места у окошка:
// '' — опустился на это место (0 и 1 — поднялся); up — поднялся; held — остался, и книга вчера называла то же место
// («как вчера»); heldNight — остался, а вчера книга называла другое (сравнение с ночью, не со вчера).
export const FACTS = {
  zhou: { 0: [null, null], 1: [null], '1held': [null, null], 2: [null], '2held': [null, null], 3: [null], '3held': [null, null], '3up': [null], 4: [null], '4held': [null, null], '1heldNight': [null], '2heldNight': [null], '3heldNight': [null], '4heldNight': [null], '2up': [null], gone: [null] },
  gao: { 0: [null, null], 1: [null], '1held': [null, null], 2: [null], '2held': [null, null], 3: [null], '3held': [null, null], '3up': [null], 4: [null], '4held': [null, null], '1heldNight': [null], '2heldNight': [null], '3heldNight': [null], '4heldNight': [null], '2up': [null], gone: [null] },
  lan: { 0: [null, null], 1: [null], '1held': [null, null], 2: [null], '2held': [null, null], 3: [null], '3held': [null, null], '3up': [null], 4: [null], '4held': [null, null], '1heldNight': [null], '2heldNight': [null], '3heldNight': [null], '4heldNight': [null], '2up': [null], gone: [null] },
  mei: { 0: [null, null], 1: [null], '1held': [null, null], 2: [null], '2held': [null, null], 3: [null], '3held': [null, null], '3up': [null], 4: [null], '4held': [null, null], '1heldNight': [null], '2heldNight': [null], '3heldNight': [null], '4heldNight': [null], '2up': [null], gone: [null] },
  xu: { 0: [null, null], 1: [null], '1held': [null, null], 2: [null], '2held': [null, null], 3: [null], '3held': [null, null], '3up': [null], 4: [null], '4held': [null, null], '1heldNight': [null], '2heldNight': [null], '3heldNight': [null], '4heldNight': [null], '2up': [null], gone: [null] },
  deng: { 0: [null, null], 1: [null], '1held': [null, null], 2: [null], '2held': [null, null], 3: [null], '3held': [null, null], '3up': [null], 4: [null], '4held': [null, null], '1heldNight': [null], '2heldNight': [null], '3heldNight': [null], '4heldNight': [null], '2up': [null], gone: [null] },
  feng: { 0: [null, null], 1: [null], '1held': [null, null], 2: [null], '2held': [null, null], 3: [null], '3held': [null, null], '3up': [null], 4: [null], '4held': [null, null], '1heldNight': [null], '2heldNight': [null], '3heldNight': [null], '4heldNight': [null], '2up': [null], gone: [null] },
};

// что было в свёртке — целыми шаблонами языка: {HERB} — название травы; drink — {PACKET} и «выпил при тебе»
export const PACKET = {
  empty: null,
  herb: null,
  pinch: null,
  measure: null,
  herb_pinch: null,
  herb_measure: null,
  drink: null,
};

export const CASHBOX = {
  total: null,
  paper: [null, null, null],
  refund: null,
  refundAnon: null,
  totalReal: null,
  totalRealNone: null,
  herbIn: null,
};

export const STREET = {
  base1: null,
  butcher1: null,
  repair1: null,
  tofu1: null,
  rain2: null,
  tofu2: null,
  butcher2: null,
  repair2: null,
  deng2: null,
  feng2: null,
  xu2: null,
  lan2: null,
  mourning: null,
  mourningMany: null,
  mei_dead3: null,
  tofu_open3: null,
  tofu_closed3: null,
};

export const TABLE = {
  bowl_one: null,
  bowl_two: null,
  bowl_two_empty: null,
};

// Ночь 3, Мэй в книге: что ей дали — и что видно утром (исход). Без «не проснулась»: это слова карточки.
export const MEI_LEDGER = {
  head: {
    packet: null,
    refused: null,
    refused_bench: null,
    unopened: null,
    unopened_anon: null,
    unreceived: null,
  },
  sight: {
    killed_drink: null,
    killed_home: null,
    gone: null,
    slipped_with: null,
    slipped_alone: null,
    slipped_home: null,
    held_with: null,
    held_alone: null,
    held_home: null,
    returned: null,
  },
};

// Сколько яда осталось — с согласованием.
export const LEFT = {
  0: null,
  1: null,
  2: null,
  3: null,
};

export const JAR = {
  3: null,
  2: null,
  1: null,
  0: null,
};

export const HOOKS = {
  1: null,
  2: null,
  3: null,
};

export const SHOP = {
  intro: null,
  // каждое утро Цянь говорит своё
  introBy: {
    1: null,
    2: null,
    3: null,
  },
  nextLamp: null,
  boughtHerb: null,
  boughtOil: null,
};

// Последняя карточка — не рассказ, а список: имя и судьба в нескольких словах, у умерших — причина (§23, раунд 16).
export const CLOSING = {
  title: null,
  wei: {
    walks: null,
    walks_pinch: null,
    measure_drink: null,
    measure_home: null,
  },
  // Мэй: по тому, что с ней стало, и почему
  mei: {
    killed_drink: null,
    killed_home: null,
    gone_wrong: null,
    gone_none: null,
    gone_away: null,
    slipped_with: null,
    slipped_alone: null,
    held_with: null,
    held_alone: null,
    returned: null,
  },
  // живые: по тому, где они к концу демо
  alive: {
    0: null,
    1: null,
    2: null,
    3: null,
    4: null,
    returned: null,
    worseUnseen: null,
  },
  // умершие: причина в нескольких словах
  dead: null,
  // судьба без причины — для данных карточки (rows.fate); причина — rows.cause
  deadFate: null,
  cause: {
    wrong_temp: null, wrong_loc: null, no_herb: null,
    empty_drawer: null, refused: null, refused_inside: null,
    unopened: null, unreceived: null, blind: null,
    pinch_heat: null, pinch_heat_here: null, killed: null, other: null,
  },
  bai: {
    paper: null,
    refused: null,
    unopened: null,
    declined: null,
    unreceived: null,
  },
  // судьба — без имени и без точки; строку собирает row: «{WHO} — {FATE}.» (у карточки есть и данные: rows)
  qian: null,
  liuName: null,
  liu: null,
  row: null,
  end: null,
};

export const TITLE = {
  name: null,
  sub: null,
  start: null,
};

export const NIGHT_EVENTS = {
  lampOut: null,
  // лампа погасла, и тут же огарок — без «дальше вслепую»; огарок догорел после главного гостя — candleOut (§23, раунд 25)
  lampOutCandle: null,
  candleOut: null,
  blindKnock: null,
  lampOutLeave: null,
  seatedLeaves: null,
  nightOver: null,
  // конец ночи — у каждой свой
  nightOverBy: {
    1: null,
    2: null,
    3: null,
  },
  // «больше никто не стучит» уже сказано (Мэй ждала одна): конец ночи без этих слов
  nightOverQuiet: { 1: null, 2: null, 3: null },
  dawn: null,
  // ночь 3: Вэя не стало или он ушёл — ветер возвращается (§23, «Ночь 3»)
  windBack: null,
  restStart: null,
  // запястье ещё не брали — без «снова» (§23, раунд 25)
  restStartFirst: null,
  candle: null,
  // первый отдых за ночь: фитиль подрезан — каждую ночь, как обещает кнопка, и столько же, сколько списано
  wick: null,
  wickAgain: null,
};
