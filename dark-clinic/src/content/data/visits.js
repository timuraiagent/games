// Гости трёх ночей. Только данные.
//
// Шаблоны строк: {N} — имя гостя, {м|ж} — слово по роду гостя.
// truth — скрытая правда: природа, рисунок, место на лестнице. В интерфейс не попадает.
// greet — что гость говорит с порога: беду (кашель, бессонница, боль), но не ответы на вопросы доски.
//   Источник помехи (чай, бег, ветер, «я старая») гость называет здесь же, даром.
// signs — что покажут проверки. У живого всё сходится с природой, кроме того, что портит одна названная причина:
//   noise = { cause, signs: [проверки, которые она портит] }. Полоскание, отдых снимают помеху:
//   tongueAfterRinse, rateAfterRest, depthAfterRest.
// look — «похож на край» у живого (старость, ветер, бессонница): серая рука, синеватый язык, слабое зеркало.
//   Это не ось карты, а степень; отличает только отдых и повторный пульс.
// armText — своя строка про руку (земля под ногтями бывает и у живого).
// answers.*.value — код наблюдения для карты с листа Лю (см. signs.js, PUBLIC_MAP).
// greetVariants / answerVariants — по ключу варианта (cured / not_cured / harmed).

const say = (speaker, text) => ({ speaker, text });
// steps — слышны ли шаги к окошку (у не живых их нет); windStops — ветер стихает на этот стук; rustle — шорох по ставне
const knockOf = (count, rhythm, strength, extra = {}) => ({ count, rhythm, strength, steps: true, windStops: false, rustle: false, ...extra });
const see = (text) => ({ speaker: null, text });

// ── Порядок ночей ────────────────────────────────────────────────────────────
// SLOT — места для тех, кто приходит по итогам прошлой ночи: «не помогло» (до двух) или одно «спасибо».
export const NIGHT_ORDER = {
  1: ['n1_qian', 'n1_zhou', 'n1_lan', 'n1_gao', 'n1_mei', 'n1_bai'],
  2: ['n2_deng', 'n2_xu', 'n2_feng', 'SLOT', 'n2_wei'],
  // ночь 3: из серых первой — Мэй, она остаётся ждать; потом Фэн и Дэн; последним — Вэй
  3: ['n3_lan', 'n3_mei', 'n3_feng', 'n3_deng', 'SLOT', 'n3_wei'],
};

// Кто может вернуться на эти места (кто в следующей ночи и так приходит сам — тот приходит сам).
export const SLOT_POOL = {
  2: ['mei', 'zhou', 'gao', 'lan'],
  3: ['xu', 'zhou', 'gao'],
};
export const RETURN_PLACES = 2;

// Как меняется болезнь у вернувшегося (§23: «не всегда та же и не всегда наоборот»):
// same — та же клетка, loc — снаружи ↔ внутри, temp — холод ↔ жар, both — и то и другое.
// Мэй остаётся при холоде: щепоть рядом с Вэем должна её держать (§23, «Мертвец в доме»).
export const RETURN_SHIFT = {
  2: { zhou: 'temp', lan: 'same', gao: 'loc', mei: 'same' },
  3: { xu: 'same', zhou: 'loc', gao: 'temp' }, // Сюй остаётся холодным: его чай ведёт к жару
};

// ── Первые визиты ────────────────────────────────────────────────────────────
export const FIRST = {
  // ── Ночь 1 ── (шума нет; беда названа, ответы — за масло)
  n1_qian: {
    pid: 'qian', type: 'scene',
    knock: null,
    greet: [
      see(null),
      say('qian', null),
      say('qian', null),
      say('qian', null),
      say('qian', null),
    ],
    closeLabel: null,
    leave: null,
    debt: true,
  },

  n1_zhou: {
    pid: 'zhou', type: 'patient',
    truth: { kind: 'living', temp: 'cold', loc: 'out', deg: 1 },
    knock: null,
    greet: [
      see(null),
      say('zhou', null),
      see(null),
    ],
    answers: {
      thirst: { text: null, value: 'warm' },
      duration: { text: null, value: 'recent' },
      chills: { text: null, value: 'yes' },
      home: { text: null },
    },
    signs: { tongue: 'pale_swollen', rate: 'slow', depth: 'surface', mirror: 'strong', arm: 'sweaty' },
    pay: { coins: 8 }, payText: null,
    reflection: null,
    reflectionInside: null,
    inside: null,
    seatedLine: null,
    leave: null,
  },

  n1_lan: {
    pid: 'lan', type: 'patient',
    truth: { kind: 'living', temp: 'heat', loc: 'out', deg: 1 },
    knock: null,
    greet: [
      see(null),
      say('lan', null),
      see(null),
    ],
    answers: {
      thirst: { text: null, value: 'cold_drink' },
      duration: { text: null, value: 'recent' },
      chills: { text: null, value: 'yes' },
      home: { text: null },
    },
    signs: { tongue: 'red_yellow', rate: 'fast', depth: 'surface', mirror: 'strong', arm: 'warm' },
    pay: { coins: 8 }, payText: null,
    reflection: null,
    reflectionInside: null,
    inside: null,
    seatedLine: null,
    leave: null,
  },

  n1_gao: {
    pid: 'gao', type: 'patient',
    truth: { kind: 'living', temp: 'heat', loc: 'in', deg: 1 },
    knock: null,
    greet: [
      see(null),
      say('gao', null),
      see(null),
    ],
    answers: {
      thirst: { text: null, value: 'cold_drink' },
      duration: { text: null, value: 'long' },
      chills: { text: null, value: 'no' },
      home: { text: null },
    },
    signs: { tongue: 'red_thin_yellow', rate: 'fast', depth: 'deep', mirror: 'strong', arm: 'sweaty' },
    pay: { coins: 8 }, payText: null,
    reflection: null,
    reflectionInside: null,
    inside: null,
    seatedLine: null,
    leave: null,
  },

  n1_mei: {
    pid: 'mei', type: 'patient',
    truth: { kind: 'living', temp: 'cold', loc: 'in', deg: 1 },
    knock: null,
    greet: [
      see(null),
      say('mei', null),
      say('mei', null),
    ],
    answers: {
      thirst: { text: null, value: 'warm' },
      duration: { text: null, value: 'long' },
      chills: { text: null, value: 'no' },
      home: { text: null },
    },
    signs: { tongue: 'pale_white', rate: 'slow', depth: 'deep', mirror: 'strong', arm: 'warm' },
    pay: { coins: 8 }, payText: null,
    reflection: null,
    reflectionInside: null,
    inside: null,
    seatedLine: null,
    leave: null,
  },

  n1_bai: {
    pid: 'bai', type: 'patient',
    truth: { kind: 'skin', temp: 'heat', loc: 'out', deg: null, costly: false },
    knock: null,
    greet: [
      see(null),
      say('bai', null),
      say('bai', null),
    ],
    stake: { pid: 'xu' },
    answers: {
      thirst: { text: null, value: 'as_needed' },
      duration: { text: null, value: 'vague' },
      chills: { text: null, value: 'even' },
      home: [
        { text: null, need: { light: true } },
        { text: null },
      ],
    },
    signs: { tongue: 'pink_even', rate: 'even', depth: 'middle', mirror: 'strong', arm: 'porcelain' },
    wrist: null,
    pay: { coins: 8 }, payText: null,
    reflection: null,
    reflectionInside: null,
    inside: null,
    seatedLine: null,
    leave: null,
    reveal: null,
    drink: { fed: null },
  },

  // ── Ночь 2 ── (дождь; помеха у троих: бег, чай, старость)
  n2_deng: {
    pid: 'deng', type: 'patient',
    truth: { kind: 'living', temp: 'cold', loc: 'out', deg: 1 },
    knock: null,
    greet: [
      see(null),
      say('deng', null),
      see(null),
    ],
    answers: {
      thirst: { text: null, value: 'warm' },
      duration: { text: null, value: 'recent' },
      chills: { text: null, value: 'yes' },
      home: [
        { text: null, need: { light: true } },
        { text: null },
      ],
    },
    // бег частит пульс — у холодного он кажется «жарким»; потная рука — от бега, а не от жара
    signs: { tongue: 'pale_white', rate: 'fast', rateAfterRest: 'slow', depth: 'surface', mirror: 'strong', arm: 'wet' },
    armText: null,
    noise: { cause: 'ran', signs: ['pulse_rate'] },
    pay: { coins: 8 }, payText: null,
    reflection: null,
    reflectionInside: null,
    inside: null,
    seatedLine: null,
    leave: null,
  },

  n2_xu: {
    pid: 'xu', type: 'patient',
    truth: { kind: 'living', temp: 'cold', loc: 'in', deg: 1 },
    knock: null,
    greet: [
      see(null),
      say('xu', null),
      say('xu', null),
    ],
    answers: {
      thirst: { text: null, value: 'warm' },
      duration: { text: null, value: 'long' },
      chills: { text: null, value: 'yes' },
      home: { text: null },
    },
    // крепкий чай красит белый налёт в жёлто-бурый — холодный кажется «жарким»
    // холод вошёл глубоко: зеркало он не туманит — как мёртвый, хотя живой (§23, «Дыхание»)
    // крепкий чай и частит пульс — пока не посидит у лампы
    signs: { tongue: 'brown_stained', tongueAfterRinse: 'pale_swollen', rate: 'fast', rateAfterRest: 'slow', depth: 'deep', mirror: 'clear', arm: 'warm' },
    armText: null,
    noise: { cause: 'tea', signs: ['tongue', 'pulse_rate'] },
    pay: { coins: 8 }, payText: null,
    reflection: null,
    reflectionInside: null,
    inside: null,
    seatedLine: null,
    leave: null,
  },

  n2_feng: {
    pid: 'feng', type: 'patient',
    truth: { kind: 'living', temp: 'heat', loc: 'out', deg: 1 },
    knock: null,
    greet: [
      see(null),
      say('feng', null),
      say('feng', null),
      say('feng', null),
    ],
    answers: {
      thirst: { text: null, value: 'warm' },
      duration: { text: null, value: 'long' },
      chills: { text: null, value: 'yes' },
      home: { text: null },
    },
    // старость: просит горячего по привычке и считает от прошлой зимы, а слегла вчера
    signs: { tongue: 'red_thin_yellow', rate: 'fast', depth: 'surface', mirror: 'strong', arm: 'old' },
    armText: null,
    noise: { cause: 'old', signs: ['thirst', 'duration'] },
    pay: { herb: 'herb_out_cold' },
    payText: null,
    reflection: null,
    reflectionInside: null,
    inside: null,
    seatedLine: null,
    leave: null,
    leaveHarmed: null,
  },

  n2_wei: {
    pid: 'wei', type: 'patient',
    truth: { kind: 'dead', temp: 'cold', loc: 'in', deg: null, costly: true },
    knock: null,
    greet: [
      see(null),
      say('wei', null),
      say('wei', null),
    ],
    stake: { pid: 'mei' },
    answers: {
      thirst: { text: null, value: 'nothing' },
      duration: { text: null, value: 'recent' },
      chills: { text: null, value: 'no' },
      home: { text: null },
    },
    signs: { tongue: 'grey_dry', rate: 'very_slow', depth: 'deep', mirror: 'clear', arm: 'earth' },
    wrist: null,
    wristSound: 'crickets_stop',
    pay: { coins: 8 }, payText: null,
    reflection: null,
    reflectionCandle: null,
    reflectionInside: null,
    inside: null,
    seatedLine: null,
    leave: null,
    // одна строка в книге — рукой ученика, без карточки
    reveal: null,
    drink: {
      revealed: null,
      destroyed: null,
      no_effect: null,
    },
  },

  // ── Ночь 3 ── (ветер; четверо серых с порога — Лань, Мэй, Фэн, Дэн; на краю Дэн и Мэй, отличает только отдых)
  // Даром у троих серых — Дэна, Фэн, Мэй — всё одинаково: серое лицо, серая рука, синеватый язык, слабое зеркало.
  // Болезнь не стоит на месте: у каждого клетка не та, что в прошлый визит (движок задаёт truth.loc; ответы — byLoc).
  n3_deng: {
    pid: 'deng', type: 'patient',
    truth: { kind: 'living', temp: 'cold', loc: 'out', deg: 3 },
    portrait: 'deng_tired',
    knock: null,
    knockNames: true, // назвался в стуке — известен по имени и в темноте (§23, раунд 16)
    greet: [
      see(null),
    ],
    greetVariants: {
      cured: [say('deng', null)],
      not_cured: [say('deng', null)],
      harmed: [say('deng', null)],
      refused: [say('deng', null)],
      unopened: [say('deng', null)],
    },
    greetAfter: [say('deng', null)],
    answers: {
      thirst: { text: null, value: 'warm' },
      duration: { text: null, value: 'recent' },
      chills: { text: null, value: 'yes' },
      home: { text: null },
    },
    byLoc: {
      out: { duration: { text: null, value: 'recent' }, chills: { text: null, value: 'yes' } },
      in: { duration: { text: null, value: 'long' }, chills: { text: null, value: 'no' } },
    },
    // ветер прячет пульс вглубь у всех; серый от ветра — так он сам думает
    signs: { tongue: 'pale_bluish', rate: 'slow', depth: 'deep', mirror: 'weak', arm: 'grey_blue' },
    look: { cause: 'wind' },
    pay: { coins: 8 }, payText: null,
    reflection: null,
    reflectionInside: null,
    inside: null,
    seatedLine: null,
    leave: null,
    drink: {
      returned: null,
    },
  },

  n3_lan: {
    pid: 'lan', type: 'patient',
    truth: { kind: 'living', temp: 'heat', loc: 'in', deg: 2 },
    portrait: 'lan_grey', // сера с порога, как и все в эту ночь
    knock: null,
    greet: [
      see(null),
    ],
    greetVariants: {
      cured: [say('lan', null)],
      not_cured: [say('lan', null)],
      harmed: [say('lan', null)],
      refused: [say('lan', null)],
      unopened: [say('lan', null)],
    },
    greetAfter: [
      say('lan', null),
      say('lan', null),
    ],
    answers: {
      thirst: { text: null, value: 'warm' },
      duration: { text: null, value: 'long' },
      chills: { text: null, value: 'no' },
      home: { text: null },
    },
    byLoc: {
      out: { duration: { text: null, value: 'recent' }, chills: { text: null, value: 'yes' } },
      in: { duration: { text: null, value: 'long' }, chills: { text: null, value: 'no' } },
    },
    // молоко: белый налёт на языке и «только тёплое» — у неё жар, а читается холод
    signs: { tongue: 'pale_white', tongueAfterRinse: 'red_yellow', rate: 'fast', depth: 'deep', mirror: 'weak', arm: 'grey_blue' },
    noise: { cause: 'milk', signs: ['tongue', 'thirst'] },
    look: { cause: 'sleepless' }, // не спит с малым: серая с порога, как и все в эту ночь
    pay: { coins: 8 }, payText: null,
    reflection: null,
    reflectionInside: null,
    inside: null,
    seatedLine: null,
    leave: null,
    drink: { cured: null },
  },

  n3_feng: {
    pid: 'feng', type: 'patient',
    truth: { kind: 'living', temp: 'cold', loc: 'out', deg: 1 },
    portrait: 'feng_grey',
    knock: null,
    greet: [
      see(null),
    ],
    greetVariants: {
      cured: [say('feng', null)],
      not_cured: [say('feng', null)],
      harmed: [say('feng', null)],
      refused: [say('feng', null)],
      unopened: [say('feng', null)],
    },
    greetAfter: [
      say('feng', null),
      say('feng', null),
    ],
    answers: {
      thirst: { text: null, value: 'warm' },
      duration: { text: null, value: 'long' },
      chills: { text: null, value: 'yes' },
      home: [
        // он уже приходил при ней — сплетни кончились
        { text: null, need: { wei: 'gone' } },
        { text: null, need: { wei: 'here', light: true } },
        { text: null, need: { wei: 'here' } },
        { text: null, need: { wei: 'outside', light: true } },
        { text: null, need: { wei: 'outside' } },
        { text: null, need: { light: true, mei: 'bench' } },
        { text: null, need: { light: true, mei: 'eaves' } },
        // в темноте Мэй не видно — о ней не говорят ни как о той, что здесь, ни как о той, что дома
        { text: null, need: { mei: 'bench' } },
        { text: null, need: { mei: 'eaves' } },
        { text: null, need: { light: true, alive: ['mei'], wei: 'walking' } },
        { text: null, need: { alive: ['mei'], wei: 'walking' } },
        { text: null },
      ],
    },
    // запыхалась: пульс частит — у холодной он кажется «жарким». Серая от старости, а не от края.
    // старуха: словам о питье и давности не верь (лист Лю, утро 1) — Лю их ей и не предлагает
    signs: { tongue: 'pale_bluish', rate: 'fast', rateAfterRest: 'slow', depth: 'deep', depthAfterRest: 'surface', mirror: 'weak', arm: 'grey_blue' },
    // старуха считает от прошлой зимы (слово врёт), и запыхалась (частит пульс) — лист учил не верить старикам
    noise: { cause: 'breath', signs: ['pulse_rate', 'duration'] },
    distrust: ['thirst', 'duration'],
    look: { cause: 'old' },
    pay: { coins: 8 }, payText: null,
    reflection: null,
    reflectionInside: null,
    inside: null,
    seatedLine: null,
    leave: null,
  },

  n3_mei: {
    pid: 'mei', type: 'patient',
    // в ночь 3 у Мэй не та болезнь, что в ночь 1: клетку задаёт движок (холод; снаружи или внутри — не как в прошлый раз)
    truth: { kind: 'living', temp: 'cold', loc: 'out', deg: 3 },
    portrait: 'mei_edge',
    knock: null,
    greet: [
      see(null),
      say('mei', null),
      say('mei', null),
    ],
    answers: {
      thirst: [
        { text: null, value: 'nothing', need: { wei: 'gone' } },
        { text: null, value: 'nothing', need: { wei: 'here' } },
        { text: null, value: 'nothing', need: { wei: 'outside' } },
        { text: null, value: 'nothing' },
      ],
      duration: { text: null, value: 'recent' },
      chills: { text: null, value: 'yes' },
      home: [
        { text: null, need: { wei: 'seen', light: true } },
        { text: null, need: { wei: 'here', light: true } },
        { text: null, need: { wei: 'here' } },
        { text: null, need: { wei: 'outside' } },
        { text: null, need: { light: true, wei: 'walking' } },
        { text: null, need: { wei: 'gone' } },
        { text: null },
      ],
    },
    // ответы знают, что случилось: после того как Вэя не стало, она говорит иначе
    byLoc: {
      out: {
        duration: [
          { text: null, value: 'recent', need: { wei: 'gone' } },
          { text: null, value: 'recent', need: { wei: 'here' } },
          { text: null, value: 'recent', need: { wei: 'outside', light: true } },
          { text: null, value: 'recent', need: { wei: 'outside' } },
          { text: null, value: 'recent' },
        ],
        chills: [
          { text: null, value: 'yes', need: { wei: 'gone' } },
          { text: null, value: 'yes', need: { wei: 'here' } },
          { text: null, value: 'yes', need: { wei: 'outside' } },
          { text: null, value: 'yes' },
        ],
      },
      in: {
        duration: [
          { text: null, value: 'long', need: { wei: 'gone' } },
          { text: null, value: 'long', need: { wei: 'here' } },
          { text: null, value: 'long', need: { wei: 'outside' } },
          { text: null, value: 'long' },
        ],
        chills: [
          { text: null, value: 'no', need: { wei: 'gone' } },
          { text: null, value: 'no', need: { wei: 'here' } },
          { text: null, value: 'no', need: { wei: 'outside' } },
          { text: null, value: 'no' },
        ],
      },
    },
    signs: { tongue: 'pale_bluish', rate: 'slow', depth: 'deep', depthAfterRest: 'surface', mirror: 'weak', arm: 'grey_blue' },
    pay: { coins: 8 }, payText: null,
    reflection: null,
    reflectionInside: null,
    inside: null,
    seatedLine: null,
    leave: null,
    drink: {
      // щепоть с нужной травой: на эту ночь ей легче; что будет дома — решает утро
      returned: null,
      held: null,
      killed: null,
    },
  },

  n3_wei: {
    pid: 'wei', type: 'patient',
    truth: { kind: 'dead', temp: 'cold', loc: 'in', deg: null, costly: true },
    knock: null,
    greet: [
      see(null),
    ],
    greetVariants: {
      mei_bench: [say('wei', null), say('wei', null)],
      mei_eaves: [say('wei', null), say('wei', null)],
      mei_dead: [say('wei', null), say('wei', null)],
      mei_none: [say('wei', null), say('wei', null)],
    },
    greetExtra: {
      revealed: [say('wei', null)],
    },
    stake: { pid: 'mei' },
    answers: {
      thirst: { text: null, value: 'nothing' },
      duration: { text: null, value: 'recent' },
      chills: { text: null, value: 'no' },
      // он отвечает как человек, жена которого здесь же (§23, раунд 11)
      home: [
        { text: null, need: { mei: 'bench', light: true } },
        { text: null, need: { mei: 'bench' } },
        { text: null, need: { mei: 'eaves' } },
        { text: null, need: { mei: 'dead' } },
        { text: null },
      ],
    },
    signs: { tongue: 'grey_dry', rate: 'very_slow', depth: 'deep', mirror: 'clear', arm: 'earth' },
    wrist: null,
    wristSound: 'crickets_stop',
    pay: { coins: 8 }, payText: null,
    reflection: null,
    // при огарке (§23): свет — свечной, и строки об этом знают
    reflectionCandle: null,
    reflectionInside: null,
    inside: null,
    seatedLine: null,
    leave: null,
    reveal: null,
    drink: {
      revealed: null,
      destroyed: null,
    },
    drinkCandle: {
      destroyed: null,
      no_effect: null,
    },
  },
};

// ── Ночь 3: Мэй ждёт Вэя, и каждый выбор у окошка — своя сцена ────────────────
// Ночь 3: кто проходит мимо Мэй под навесом — видит её (§23, «Реплика знает, что случилось»)
export const PASS_MEI = {
  feng: null,
  deng: null,
  zhou: null,
  gao: null,
  xu: null,
  lan: null,
};

export const CLIMAX = {
  // Мэй не уходит до Вэя: на табурете, если впущена, иначе — под навесом у окошка.
  meiWaits: {
    bench: null,
    eaves: null,
    eaves_undecided: null,
    bench_undecided: null,
    eaves_refused: null,
    eaves_unopened: null,
    dead: null,
  },
  // ── Её сцена: Мэй и Вэй в одной комнате (или она — под навесом). Мало слов, без крика.
  // Когда Вэй входит
  weiEnters: {
    bench: null,
    eaves: null,
  },
  // Мэй входит, когда Вэя уже нет
  meiInsideAfter: null,
  // Мэй берёт свёрток или пьёт, когда Вэя уже нет
  meiPacketAfter: {
    herb: null,
    pinch: null,
    measure: null,
  },
  meiDrinkAfter: {
    held: null,
    returned: null,
    killed: null,
  },
  // Когда он заговорил с ней — её ответ
  meiReplies: {
    // где говорит она — там речь с её именем, не строка рассказчика (для интерфейса: who)
    bench: [say('mei', null)],
    eaves: [see(null), say('mei', null)],
  },
  // Когда он пьёт при тебе — что делает она
  meiSees: {
    destroyed: {
      bench: null,
      eaves: [see(null), say('mei', null)],
    },
    revealed: {
      bench: [see(null), say('mei', null), see(null)],
      eaves: null,
    },
    no_effect: {
      bench: [say('mei', null)],
      eaves: [see(null)],
    },
  },
  // Когда ты сметаешь землю — она
  meiAfterEarth: {
    bench: [see(null), say('mei', null)],
    eaves: [see(null)],
  },
  // Когда свёрток уходит к нему в руки — она
  meiSeesHome: {
    measure_home: {
      // она видит свёрток — и остаётся: ни «пойдём», ни «встаёт» (§23, раунд 22)
      bench: null,
      eaves: null,
    },
    pinch_home: {
      bench: null,
      eaves: null,
    },
    herb_home: {
      bench: [say('mei', null)],
      eaves: [see(null), say('mei', null)],
    },
  },
  // «— Мэй. Пора.» — и она уходит к нему
  meiGoes: {
    bench: null,
    eaves: null,
  },
  meiGoesDark: null,
  // медная банка, когда Вэй у окошка, а Мэй — на лавке за спиной ученика
  jarMei: {
    lamp: null,
    candle: null,
  },
  // она ждёт, а он уже у окошка — «он за мной придёт» не говорят
  meiWaitsHere: {
    bench: null,
    eaves: null,
    bench_undecided: null,
    eaves_undecided: null,
    eaves_refused: null,
  },
  // в темноте: только то, что слышно (§23, «Реплика знает, что случилось»)
  // Мэй ждёт на лавке, а на табурете умер другой — она видит
  meiSeesDeath: {
    bench: null,
  },
  meiWaitsDark: {
    bench: null,
    eaves: null,
    dead: null,
  },
  // ученик уже видел Мэй: в темноте — её имя, а не «кто-то»
  meiWaitsDarkKnown: {
    bench: null,
    eaves: null,
  },
  knockDark: {
    bench: [see(null), say('mei', null)],
    eaves: [see(null), say('mei', null)],
    dead: null,
  },
  // кто что говорит, когда стучит Вэй
  knock: {
    bench: [see(null), say('mei', null)],
    eaves: [see(null), say('mei', null)],
    dead: null,
  },
  // что видно, когда Мэй уносит свёрток
  meiPacket: {
    herb: null,
    pinch: null,
    measure: null,
  },
  // свёрток Вэю — у каждого выбора своя сцена
  wei: {
    measure_home: null,
    pinch_home: null,
    herb_home: null,
    dark: null,
    refused: null,
    refused_inside: null,
    refused_inside_dead: null,
    refused_inside_dark: null,
    unpaid: null,
  },
  // как Мэй уходит после Вэя — по тому, что ты сделал с ним
  meiLeaves: {
    herb: null,
    pinch: null,
    measure: null,
    refused: null,
    destroyed: null,
    // ему не открыли — голоса не было: она уходит на его стук
    unopened: null,
    unopened_bench: null,
    destroyed_bench: null,
    dead: null,
    dead_inside: null,
  },
};

// ── Вернулись: «не помогло» ──────────────────────────────────────────────────
// Болезнь не стоит на месте: у вернувшегося клетка не та, что в прошлый раз (снаружи ↔ внутри); место — на шаг хуже.
// Ответы — по клетке: thirstBy по холоду и жару, durationBy и chillsBy по «снаружи — внутри». Приметы считает движок.
// С порога — только беда и то, что с ним сделали в прошлый раз; второй возврат (again) — другими словами.
// Серой руки у вернувшегося нет: на краю он или просто болен, по руке не понять.
export const WORSE = {
  zhou: {
    knock: null,
    greet: [
      see(null),
      say('zhou', null),
    ],
    // «не помогло» — только тому, кому давали траву; кому навредил яд или кому отказали — свои слова
    greetVariants: {
      harmed: [say('zhou', null)],
      refused: [say('zhou', null)],
      unopened: [say('zhou', null)],
      again: [say('zhou', null)],
    },
    thirstBy: { cold: { text: null, value: 'warm' }, heat: { text: null, value: 'cold_drink' } },
    durationBy: { out: { text: null, value: 'recent' }, in: { text: null, value: 'long' } },
    chillsBy: { out: { text: null, value: 'yes' }, in: { text: null, value: 'no' } },
    home: { text: null },
    payText: null,
    reflection: null,
    reflectionInside: null,
    inside: null,
    seatedLine: null,
    leave: null,
    // приходит и в ночь 2, и в ночь 3 — уходит каждый раз по-своему (§23, раунд 27)
    leaveAgain: null,
  },
  lan: {
    knock: null,
    greet: [
      see(null),
      say('lan', null),
    ],
    greetVariants: {
      harmed: [say('lan', null)],
      refused: [say('lan', null)],
      unopened: [say('lan', null)],
      again: [say('lan', null)],
    },
    thirstBy: { cold: { text: null, value: 'warm' }, heat: { text: null, value: 'cold_drink' } },
    durationBy: { out: { text: null, value: 'recent' }, in: { text: null, value: 'long' } },
    chillsBy: { out: { text: null, value: 'yes' }, in: { text: null, value: 'no' } },
    home: { text: null },
    payText: null,
    reflection: null,
    reflectionInside: null,
    inside: null,
    seatedLine: null,
    leave: null,
  },
  gao: {
    knock: null,
    greet: [
      see(null),
      say('gao', null),
    ],
    greetVariants: {
      harmed: [say('gao', null)],
      refused: [say('gao', null)],
      unopened: [say('gao', null)],
      again: [say('gao', null)],
    },
    thirstBy: { cold: { text: null, value: 'warm' }, heat: { text: null, value: 'cold_drink' } },
    durationBy: { out: { text: null, value: 'recent' }, in: { text: null, value: 'long' } },
    chillsBy: { out: { text: null, value: 'yes' }, in: { text: null, value: 'no' } },
    home: { text: null },
    payText: null,
    reflection: null,
    reflectionInside: null,
    inside: null,
    seatedLine: null,
    leave: null,
  },
  mei: {
    knock: null,
    greet: [
      see(null),
      say('mei', null),
    ],
    greetVariants: {
      harmed: [say('mei', null)],
      refused: [say('mei', null)],
      unopened: [say('mei', null)],
    },
    thirstBy: { cold: { text: null, value: 'nothing' }, heat: { text: null, value: 'cold_drink' } },
    durationBy: { out: { text: null, value: 'recent' }, in: { text: null, value: 'long' } },
    chillsBy: { out: { text: null, value: 'yes' }, in: { text: null, value: 'no' } },
    home: { text: null },
    payText: null,
    reflection: null,
    reflectionInside: null,
    inside: null,
    seatedLine: null,
    leave: null,
  },
  xu: {
    knock: null,
    greet: [
      see(null),
      say('xu', null),
      say('xu', null),
    ],
    greetVariants: {
      harmed: [say('xu', null)],
      refused: [say('xu', null)],
      unopened: [say('xu', null)],
      again: [say('xu', null)],
    },
    thirstBy: { cold: { text: null, value: 'warm' }, heat: { text: null, value: 'cold_drink' } },
    durationBy: { out: { text: null, value: 'recent' }, in: { text: null, value: 'long' } },
    chillsBy: { out: { text: null, value: 'yes' }, in: { text: null, value: 'no' } },
    home: { text: null },
    // привычка не уходит: опять крепкий чай (налёт и пульс); и печь не топлена — сидит в пальто, оттого «знобит»
    noise: { cause: 'tea', signs: ['tongue', 'pulse_rate', 'chills'] },
    chillsNoise: { text: null, value: 'yes' },
    payText: null,
    reflection: null,
    reflectionInside: null,
    inside: null,
    seatedLine: null,
    leave: null,
  },
};

// ── Вернулись: «спасибо» ─────────────────────────────────────────────────────
export const THANKS = {
  zhou: {
    decline: null,
    knock: null,
    greet: [
      see(null),
      say('zhou', null),
      { speaker: 'zhou', text: null, need: { alive: ['feng'], wei: 'walking' } },
    ],
    gift: { coins: 4 }, giftText: null,
    leave: null,
  },
  lan: {
    decline: null,
    knock: null,
    greet: [
      see(null),
      say('lan', null),
      say('lan', null),
    ],
    gift: { herb: 'herb_out_heat' }, giftText: null,
    leave: null,
  },
  gao: {
    decline: null,
    knock: null,
    greet: [
      see(null),
      say('gao', null),
      { speaker: 'gao', text: null, need: { alive: ['mei'], wei: 'walking' } },
    ],
    gift: { coins: 4 }, giftText: null,
    leave: null,
  },
  mei: {
    decline: null,
    knock: null,
    greet: [
      see(null),
      say('mei', null),
      say('mei', null),
    ],
    gift: { coins: 2 }, giftText: null,
    leave: null,
  },
  xu: {
    decline: null,
    knock: null,
    greet: [
      see(null),
      say('xu', null),
      say('xu', null),
    ],
    gift: { coins: 4 }, giftText: null,
    leave: null,
  },
};

// Стук — данными для интерфейса: сколько ударов, ритм ('even' ровно, 'quick' часто, 'slow' медленно,
// 'broken' с перерывом), сила ('weak' | 'normal' | 'strong'). Текст стука — в knock у визита.
export const KNOCK_DATA = {
  n1_qian: knockOf(3, 'even', 'strong'),
  n1_zhou: knockOf(2, 'quick', 'normal'),
  n1_lan: knockOf(1, 'slow', 'weak'),
  n1_gao: knockOf(2, 'slow', 'strong'),
  n1_mei: knockOf(1, 'slow', 'weak', { rustle: true }),
  n1_bai: knockOf(2, 'even', 'normal', { steps: false }),
  n2_deng: knockOf(5, 'quick', 'normal'),
  n2_xu: knockOf(2, 'even', 'normal'),
  n2_feng: knockOf(3, 'broken', 'weak'),
  n2_wei: knockOf(3, 'slow', 'normal', { steps: false }),
  n3_lan: knockOf(3, 'quick', 'weak'),
  n3_mei: knockOf(3, 'broken', 'weak'),
  n3_feng: knockOf(2, 'broken', 'weak'),
  n3_deng: knockOf(2, 'broken', 'weak'),
  n3_wei: knockOf(3, 'slow', 'normal', { steps: false, windStops: true }),
  worse: { zhou: knockOf(2, 'quick', 'normal'), lan: knockOf(2, 'even', 'weak'), gao: knockOf(3, 'slow', 'normal'), mei: knockOf(1, 'slow', 'weak'), xu: knockOf(3, 'even', 'normal') },
  thanks: { zhou: knockOf(2, 'quick', 'strong'), lan: knockOf(2, 'even', 'weak'), gao: knockOf(3, 'even', 'strong'), mei: knockOf(1, 'slow', 'weak'), xu: knockOf(3, 'even', 'normal') },
};

// В медной банке, когда гость в комнате, а своей строки у визита нет.
export const REFLECTION_INSIDE = null;

// Когда плату не берёшь — по очереди, чтобы не повторялось.
export const DECLINE_QUIET = [null, null, null];
export const DECLINE = [
  null,
  null,
  null,
];

// ── Что видно, когда впущенный пьёт при тебе ─────────────────────────────────
// Несколько вариантов: движок берёт их по очереди, чтобы соседи не повторяли друг друга слово в слово.
export const DRINK = {
  cured: [
    null,
    null,
    null,
    null,
  ],
  held: [null],
  worse: [
    null,
    null,
  ],
  worse_edge: [null],
  overdose: [
    null,
    null,
  ],
  pinch_heat: [
    null,
    null,
  ],
  // у самого края горячая щепоть убивает сразу
  pinch_heat_dead: [null],
  returned: [null],
  held_pinch: [null, null],
  killed: [null],
  no_effect: [null],
  revealed: [null],
  fed: [null],
  destroyed: [null],
};

// Ушёл после вреда, который ты сделал у него на глазах.
// У самого края (место 4) — иначе, чем на краю: видно и слышно (§23, «Сосед с именем не умирает без предупреждения»).
export const BRINK = {
  deng: [see(null)],
  lan: [see(null)],
  feng: [see(null)],
  zhou: [see(null)],
  gao: [see(null)],
  xu: [see(null)],
  mei: [see(null)],
};

// Тело в комнате (§23, «Реплика знает, что случилось»): ученик его переносит; кто вошёл после — видит.
export const BODY = {
  move: null,
  moveDark: null,
  // земля на табурете лежит, пока на него никто не сел и пока не кончилась ночь (для картинки: nightView.stoolEarth)
  earthDark: null,
  earthSweep: null,
  earthSweepDark: null,
  earthDawn: null,
  inside: null,
  insideMei: null,
  insideDark: null,
  // у каждого — своя реакция, в характере
  insideOf: {
    zhou: null,
    gao: null,
    lan: null,
    mei: null,
    xu: null,
    deng: null,
    feng: null,
    wei: null,
  },
  insideMeiOf: {
    feng: null,
    deng: null,
    wei: null,
  },
  // Мэй жива и ждёт на лавке: входящий её видит — одной общей строкой вслед за своей
  meiOnBench: null,
  meiOnBenchOf: { zhou: null, gao: null, lan: null, xu: null, deng: null, feng: null },
};

// В темноте: голос и вес руки — и ничего больше.
export const DARK = {
  hatch: null,
  voice: null,
  scales: null,
  pay: null,
  payHerb: null,
  leave: null,
  // шаги в темноте — каждый раз своими словами (§23, раунд 25)
  leaveMore: [null, null, null],
  weiLeave: null,
  weiUnopened: null,
  weiLampOut: null,
  baiUnopened: null,
  harmedLeaves: null,
  harmedLeavesKnown: null,
  decline: null,
  meiLeaves: null,
  meiLeavesAlone: null,
  drink: null,
  drinkKnown: null,
};

// Ушёл после «выпей при мне» — свёртка у него в руках уже нет.
export const DRINK_LEAVES = [
  null,
  null,
  null,
];

// Мера на табурете: каждый умирает по-своему (ревью, раунд 16: одна строка на всех).
export const DRINK_KILLED = {
  zhou: null,
  gao: null,
  lan: null,
  xu: null,
  deng: null,
  feng: null,
};
// Горячая щепоть у самого края — смерть тут же, у каждого своя.
export const DRINK_DIES_HERE = {
  zhou: null,
  gao: null,
  lan: null,
  xu: null,
  deng: null,
  feng: null,
};

export const HARMED_LEAVES = null;
// у каждого — свой уход после вреда у тебя на глазах
export const HARMED_LEAVES_OF = {
  zhou: null,
  gao: null,
  lan: null,
  mei: null,
  xu: null,
  deng: null,
  feng: null,
};
// отказ: у каждого свой уход — у окошка, из комнаты, у самого края
export const REFUSED_LEAVES = {
  zhou: { hatch: null, inside: null, brink: null },
  gao: { hatch: null, inside: null, brink: null },
  lan: { hatch: null, inside: null, brink: null },
  mei: { hatch: null, inside: null },
  xu: { hatch: null, inside: null, brink: null },
  deng: { hatch: null, inside: null, brink: null },
  feng: { hatch: null, inside: null, brink: null },
  bai: { hatch: null, inside: null },
};
