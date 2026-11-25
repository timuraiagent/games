// Голос учителя Лю: календарь, листы правил на стене, записки из-под двери на лестницу.
// Только данные. Шаблоны: {N} {N_gen} {N_dat} {N_acc} {N_ins} — имя в падеже; {м|ж} — по роду;
// {CHECK} — проверка, которой ученик НЕ делал, {COST} — её цена в ложках масла;
// {SEEN} — то, что ученик сам видел (текст его же наблюдения); прочие {…} подставляет движок.
//
// Лю не знает, что умер, и об этом нигде не сказано.
// Утренняя записка: Лю называет причину и проверку, которая её вскрыла бы; исход — дело книги (§23, раунд 16).
// Каждая фраза о ночи несёт claim — что должно быть правдой этой ночью; движок проверяет его по фактам ночи,
// прежде чем фразу использовать. Фраза без claim о ночи не говорит вовсе. В записках нет оценок и слова «верно».
// Лист — не больше пяти коротких строк. Правило появляется раньше ночи, которая от него зависит:
// на листе этой ночи или в утренней записке накануне.

export const CALENDAR = {
  1: { image: 'cal_quiet', date: null, text: null },
  2: { image: 'cal_rain', date: null, text: null },
  3: { image: 'cal_wind', date: null, text: null },
};

// Лист правил — схема рукой учителя, а не сплошной текст (§23, экран 4): короткие строки, по одной мысли;
// пары столбцов там, где правда сравниваются две вещи; на листе только то, что нужно этой ночью; цен нет —
// цена написана на самой проверке. Слова примет — те же, что в приметах и на доске, чтобы найти их глазами.
// blocks: { type: 'line', text } | { type: 'pair', left: { title, items }, right: { title, items } } | { type: 'list', title, items }.
// lines — то же самое строками (для текстового игрока и старых мест); их собирает content/build.js из blocks.
// rule — код правила, которое строка утверждает: тест проверяет его по таблице исходов (round20.test.js);
// 'none' — строка совета, правила не утверждает.
const line = (text, rule, id, when) => ({ type: 'line', id, text, rule, when });
const pair = (axis, lt, li, rt, ri, rule, rows) => ({ type: 'pair', id: axis, axis, labels: rows.map(() => null), left: { title: lt, items: li }, right: { title: rt, items: ri }, rule, rows });
const list = (title, items, rule, id, when) => ({ type: 'list', id, title, items, rule, when });
const row = (id, when) => ({ id, when });

// Правила приходят по ходу, а не списком (§23, «Правила приходят по ходу», раунд 28). when — когда строка становится
// известна игроку (любой из поводов):
//   evening — на листе с вечера (не больше четырёх строк на лист);
//   check:<проверка> — ученик впервые сделал эту проверку: примета приходит вместе со словами учителя, строка таблички
//     заполняется с обеих сторон (tongue, pulse_rate, pulse_depth, thirst, duration, chills, mirror, rinse, rest);
//   sign:<код> — впервые увидена такая примета: even (ровный язык или пульс), dead (серый язык, земля под ногтями,
//     чистое зеркало, пульс после отдыха не изменился), stain (бурый налёт), fast (частый пульс);
//   offer:<решение> — решение, исход которого от строки зависит, впервые предложено: строка — на самом действии (warning)
//     send_away (не открыть, отказать, отдать свёрток), take_pay, pinch, measure, let_in;
//   act:to_scales — ученик впервые встал к весам (выбор ящика ещё впереди);
//   act:to_scales_even — встал к весам для гостя, у которого ни холода, ни жара (строки только о нём — не раньше, §23, раунд 28б);
//   knock:return — стучит первый вернувшийся больной.
// Строки листа n работают только с ночи n. Чего за ночь не коснулись, Лю дописывает к утру (одной фразой в записке).
const SHEET_BLOCKS = {
  1: [
    line(null, 'door_shut_n1', 'door', ['evening']),
    line(null, 'four_drawers', 'drawers', ['evening']),
    line(null, 'no_herb_worse', 'no_herb_worse', ['offer:send_away']),
    pair('temp', null, [null, null, null], null, [null, null, null], 'temp_signs',
      [row('tongue', ['check:tongue', 'check:rinse']), row('pulse_rate', ['check:pulse_rate']), row('thirst', ['check:thirst'])]),
    pair('loc', null, [null, null, null], null, [null, null, null], 'loc_signs',
      [row('duration', ['check:duration']), row('chills', ['check:chills']), row('pulse_depth', ['check:pulse_depth'])]),
    list(null, [null, null, null], 'mirror', 'mirror', ['check:mirror']),
    line(null, 'none', 'one_sign', ['act:to_scales']),
    line(null, 'living_leans', 'living_leans', ['sign:even', 'act:to_scales_even']),
    line(null, 'even_signs', 'even_signs', ['sign:even', 'act:to_scales_even']),
    line(null, 'even_no_herb_no_money', 'even_no_herb', ['sign:even', 'act:to_scales_even']),
    line(null, 'check_costs', 'check_costs', ['evening']),
    line(null, 'home_free', 'home_free', ['evening']),
  ],
  2: [
    line(null, 'door_open_n2', 'door_open', ['evening']),
    list(null, [null, null, null], 'rest_reading', 'rest_reading', ['check:rest']),
    list(null, [null, null, null, null], 'dead_signs', 'dead_signs', ['sign:dead']),
    line(null, 'pinch_reveals', 'pinch_reveals', ['offer:pinch']),
    line(null, 'pinch_harms_sick', 'pinch_harms_sick', ['offer:pinch']),
    line(null, 'dead_refusal_herb', 'dead_refusal_herb', ['offer:let_in']),
    line(null, 'dead_inside_cold', 'dead_inside_cold', ['offer:let_in']),
    line(null, 'rinse_noise', 'rinse_noise', ['sign:stain', 'check:rinse']),
    line(null, 'pulse_noise', 'pulse_noise', ['sign:fast']),
    line(null, 'hot_pinch', 'hot_pinch', ['offer:pinch']),
    line(null, 'hot_pinch_edge', 'hot_pinch_edge', ['offer:pinch']),
    line(null, 'return_changes', 'return_changes', ['knock:return']),
  ],
  3: [
    line(null, 'edge_herb_holds', 'edge_herb_holds', ['act:to_scales']),
    line(null, 'edge_pinch_returns', 'edge_pinch_returns', ['act:to_scales']),
    line(null, 'dead_pulls', 'dead_pulls', ['evening']),
    line(null, 'beside_dead_holds', 'beside_dead_holds', ['act:to_scales']),
    line(null, 'return_needs_gone', 'return_needs_gone', ['evening']),
    line(null, 'not_enough', 'not_enough', ['evening']),
    line(null, 'pinch_costs_measure', 'pinch_costs_measure', ['offer:pinch', 'offer:measure']),
    line(null, 'no_return_wei', 'no_return_wei', ['evening']),
  ],
};

// Как правило звучит, когда его узнают по ходу: словами учителя, которые ученик вспоминает (§23, раунд 28).
export const RULE_LEARN = { line: null, row: null, list: null };
// утром: чего ученик за ночь не коснулся, Лю дописал на лист — одной фразой в записке (по утру своя)
export const SHEET_FILLED = { 1: { text: null, claim: null }, 2: { text: null, claim: null }, 3: { text: null, claim: null } };

export const RULE_SHEETS = {
  1: { title: null, blocks: SHEET_BLOCKS[1] },
  2: { title: null, blocks: SHEET_BLOCKS[2] },
  3: { title: null, blocks: SHEET_BLOCKS[3] },
};

export const EVENING_NOTES = {
  1: null,
  2: null,
  3: null,
};
// Первый вечер: что за поднос у двери на лестницу (ревью, раунд 16: «нетронут» в конце — без начала).
export const TRAY_FIRST = null;

// Вечером в бронзовом зеркале — свой язык; и руки, которые слабее, чем вчера (оттого и лампа короче).
export const SELF = {
  1: null,
  2: null,
  3: null,
};

// Вечерняя строка о лампе — всегда согласна с числом. {X} — ложек в лампе. Лампу ученик заправляет сам, каждый вечер.
export const LAMP_NOTE = {
  first: null,
  weaker: null,
  weaker3: null,
  // утром о вечере: лампа ещё не заправлена
  weakerNext: null,
  // утро 2 — о вечере ночи 3: другими словами, чем утро 1 (§23, раунд 25)
  weakerNext3: null,
  coldNext: null,
  totalNext: null,
  cold: null,
  bottle: null,
  // утром 2: бутыль Лю уже обещана в записке — утренний счёт её включает
  bottleNext: null,
  total: null,
  totalEvening: null,
  firstEvening: null,
};

// ── Утренняя записка ─────────────────────────────────────────────────────────
// Начало и конец — каждое утро свои и утверждают о ночи только проверенное (claim).
// kind — о чём начало: темнота внизу, погода за окном Лю, дом, тело у стены; за игру каждый вид — не больше одного утра (§23, раунд 23)
export const NOTE_OPEN = {
  1: [
    { text: null, kind: 'dark', claim: { blindHerbWraps: 1 } },
    { text: null, kind: 'dark', claim: { lampOut: true } },
    { text: null, kind: 'house', claim: null },
  ],
  2: [
    { text: null, kind: 'dark', claim: { blindWraps: 2 } },
    { text: null, kind: 'dark', claim: { blindWraps: 1, blindWrapsMax: 1 } },
    { text: null, kind: 'dark', claim: { lampOut: true } },
    { text: null, kind: 'weather', claim: { weather: 'rain' } },
  ],
  3: [
    { text: null, kind: 'body', claim: { bodies: 1 } },
    { text: null, kind: 'dark', claim: { lampOut: true, windBeforeLamp: true } },
    { text: null, kind: 'dark', claim: { lampOut: true, windBeforeLamp: false } },
    { text: null, kind: 'weather', claim: { weather: 'wind' } },
  ],
};

export const NOTE_CLOSE = {
  1: [{ text: null, claim: null }],
  2: [{ text: null, claim: null }],
  3: [
    { text: null, claim: null },
  ],
};

// Правила, которые Лю передаёт утром — к следующей ночи. О прошедшей ночи здесь ни слова.
export const NOTE_RULES = {
  1: null,
  2: null,
};

// Утро 2: учебная склянка; Вэй и щепоть.
export const VIAL_NOTE = {
  used: { text: null, claim: { vial: 'used' } },
  taught: { text: null, claim: { vial: 'used', weiTaught: true } },
  unused: { text: null, claim: { vial: 'unused' } },
};
export const WEI_DARK = { text: null, claim: { g: { pid: 'wei', dose: 'pinch', blindOpen: true } } };
export const WEI_PRICE = { text: null, claim: { g: [{ pid: 'wei', dose: 'pinch', result: 'packet' }, { pid: 'feng', opened: false }] } };

export const SPOONS = { 0: null, 1: null, 2: null, 3: null, 4: null, 5: null };

// Названия проверок для записок (именительный падеж).
export const CHECK_WORDS = {
  tongue: null, pulse_rate: null, pulse_depth: null, mirror: null,
  rinse: null, rest: null, thirst: null, duration: null,
  chills: null,
};

// Что надо было сделать — словами Лю, с местоимением гостя.
// Чего ученик не сделал — фактом о ночи (claim notDone), не «хватило бы» (§23, раунд 23). build — построение фразы:
// за игру каждое построение звучит один раз. done — что ещё должно быть сделано, чтобы фраза была правдой.
export const NOT_DONE = {
  tongue: [
    { text: null, build: 'a' },
    { text: null, build: 'b' },
    { text: null, build: 'c' },
  ],
  pulse_rate: [
    { text: null, build: 'a' },
    { text: null, build: 'b' },
    { text: null, build: 'c' },
  ],
  pulse_depth: [
    { text: null, build: 'a', done: ['pulse_rate'] },
    { text: null, build: 'a' },
    { text: null, build: 'b' },
    { text: null, build: 'c' },
  ],
  thirst: [
    { text: null, build: 'a' },
    { text: null, build: 'b' },
    { text: null, build: 'c' },
  ],
  duration: [
    { text: null, build: 'a' },
    { text: null, build: 'b' },
    { text: null, build: 'c' },
  ],
  chills: [
    { text: null, build: 'a' },
    { text: null, build: 'b' },
    { text: null, build: 'c' },
  ],
  rinse: [
    { text: null, build: 'a' },
    { text: null, build: 'b' },
    { text: null, build: 'c' },
  ],
  rest: [
    { text: null, build: 'a' },
    { text: null, build: 'b' },
    { text: null, build: 'c' },
  ],
  mirror: [
    { text: null, build: 'a' },
    { text: null, build: 'b' },
    { text: null, build: 'c' },
  ],
};
// решающая примета, которую ученик видел сам, — словами листа (§23, раунд 23: не всё описание осмотра)
export const SIGN_SHORT = {
  tongue: { cold: null, heat: null },
  pulse_rate: { cold: null, heat: null },
  pulse_depth: { out: null, in: null },
};

// Проверка, которая вскрыла бы причину: named — ученик её не делал; seen — делал и видел ({SEEN}).
// Две рамки: первая и вторая фраза о проверке в одной записке не звучат одинаково.
export const CHECK_LINE = {
  seen: [null, null, null],
  // что ученик слышал сам — ответ гостя целиком ({QUOTE}) и какой вопрос ({ASK})
  heard: [null, null, null],
  // лампа погасла на этом госте: смотреть было нечем — проверки Лю не советует
  dark: [null, null],
};

// Одна ошибка — одна фраза: причина. Проверку подставляет движок (CHECK_LINE).
// claim — что должно быть правдой о госте этой ночью; к нему движок добавляет done/notDone проверки.
export const MISTAKES = {
  // не та трава — причина; к ней движок добавляет проверку, что отличила бы верный ящик (CHECK_LINE)
  wrong_temp: { text: null, alt: null, again: null, builds: ['at', 'thing', 'ty'], claim: { result: 'packet', herb: 'wrong_temp' } },
  tea: { text: null, alt: null, again: null, builds: ['guest', 'thing', 'at'], claim: { result: 'packet', herb: 'wrong_temp', done: ['tongue'], notDone: ['rinse'] } },
  tea_pulse: { text: null, alt: null, again: null, builds: ['guest', 'thing', 'at'], claim: { result: 'packet', herb: 'wrong_temp', done: ['pulse_rate'], notDone: ['rest'] } },
  milk: { text: null, alt: null, again: null, builds: ['guest', 'thing', 'at'], claim: { result: 'packet', herb: 'wrong_temp', notDone: ['rinse'] } },
  ran: { text: null, alt: null, again: null, builds: ['guest', 'thing', 'at'], claim: { result: 'packet', herb: 'wrong_temp', done: ['pulse_rate'], notDone: ['rest'] } },
  breath: { text: null, alt: null, again: null, builds: ['guest', 'thing', 'at'], claim: { result: 'packet', herb: 'wrong_temp', done: ['pulse_rate'], notDone: ['rest'] } },
  old_temp: { text: null, alt: null, again: null, builds: ['guest', 'ty', 'at'], claim: { result: 'packet', herb: 'wrong_temp', done: ['thirst'] } },
  old_loc: { text: null, alt: null, again: null, builds: ['guest', 'ty', 'at'], claim: { result: 'packet', herb: 'wrong_loc', done: ['duration'] } },
  // обе оси мимо: только что было у гостя и что в свёртке — без проверки (§23, раунд 23)
  wrong_both: { text: null, alt: null, again: null, builds: ['at', 'thing', 'ty'], claim: { result: 'packet', herb: 'wrong_both' } },
  wrong_loc: { text: null, alt: null, again: null, builds: ['at', 'thing', 'ty'], claim: { result: 'packet', herb: 'wrong_loc' } },
  rain: { text: null, alt: null, again: null, builds: ['at', 'thing', 'ty'], claim: { result: 'packet', herb: 'wrong_loc', done: ['chills'] } },
  wind: { text: null, alt: null, again: null, builds: ['at', 'thing', 'ty'], claim: { result: 'packet', herb: 'wrong_loc', done: ['pulse_depth'], notDone: ['rest'] } },
  no_herb: { text: null, alt: null, again: null, builds: ['at', 'guest', 'thing'], claim: { result: 'packet', herb: 'none' } },
  refused_anon: { text: null, alt: null, again: null, builds: ['ty', 'guest', 'thing'], claim: { result: 'refused', opened: true, known: false } },
  returned_same: { text: null, alt: null, again: null, builds: ['guest', 'ty', 'thing'], claim: { result: 'packet', returnedSame: true } },
  // «только это» — без проверки: отказ, неоткрытое окошко, яд живому, впустил зря, деньги, темнота
  refused_living: { text: null, alt: null, again: null, builds: ['ty', 'guest', 'thing'], claim: { result: 'refused', opened: true, letIn: false } },
  refused_inside: { text: null, alt: null, again: null, builds: ['ty', 'guest', 'thing'], claim: { result: 'refused', letIn: true } },
  unreceived: { text: null, alt: null, again: null, builds: ['thing', 'guest', 'at'], claim: { result: 'unreceived' } },
  measure: { text: null, alt: null, again: null, builds: ['ty', 'thing', 'guest'], claim: { result: 'packet', dose: 'measure' } },
  pinch_heat: { text: null, alt: null, again: null, builds: ['ty', 'thing', 'guest'], claim: { result: 'packet', dose: 'pinch', code: 'pinch_heat' } },
  overdose: { text: null, alt: null, again: null, builds: ['ty', 'at', 'thing'], claim: { result: 'packet', dose: 'pinch', code: 'overdose' } },
  blind: { text: null, alt: null, again: null, builds: ['ty', 'thing', 'at'], claim: { result: 'packet', blindOpen: true, known: true } },
  blind_anon: { text: null, alt: null, again: null, builds: ['ty', 'thing', 'at'], claim: { result: 'packet', blindOpen: true, known: false } },
  empty_drawer: { text: null, alt: null, again: null, builds: ['thing', 'at', 'ty'], claim: { result: 'packet', drawerEmpty: true } },
  beside_dead: { text: null, alt: null, again: null, builds: ['thing', 'at', 'guest'], claim: { weiWalks: true, pid: 'mei', herb: 'right', dose: 'none' } },
  let_in_dead: { text: null, alt: null, again: null, builds: ['ty', 'guest', 'at'], claim: { letIn: true, kind: 'dead' } },
  paper_coin: { text: null, alt: null, again: null, builds: ['ty', 'guest', 'thing'], claim: { kind: 'skin', paidPaper: true } },
};
// Кому ученик не открыл — Лю не называет, но слышал сквозь пол, каким был стук.
export const NOT_OPENED = {
  // кто стучал — ученик не видел, и Лю не пересказывает стук: только то, что окошко не открылось
  text: null,
  alt: null,
  again: null,
  builds: ['at', 'thing', 'ty'],
  claim: { result: 'refused', opened: false },
};



export const DESC = {
  zhou: { nom: null, ins: null, cap: null },
  lan: { nom: null, ins: null, cap: null },
  gao: { nom: null, ins: null, cap: null },
  mei: { nom: null, ins: null, cap: null },
  xu: { nom: null, ins: null, cap: null },
  deng: { nom: null, ins: null, cap: null },
  feng: { nom: null, ins: null, cap: null },
  bai: { nom: null, ins: null, cap: null },
  wei: { nom: null, ins: null, cap: null },
};

// Предупреждение: сосед следующей ночью придёт к самому краю. Без утренних примет — их пишет книга.
export const WARN = {
  lan: { met: null, unmet: null, again: null, soon: null },
  deng: { met: null, unmet: null, again: null, soon: null },
  gao: { met: null, unmet: null, again: null, soon: null },
  zhou: { met: null, unmet: null, again: null, soon: null },
  xu: { met: null, unmet: null, again: null, soon: null },
  feng: { met: null, unmet: null, again: null, soon: null },
};

// Ни одной ошибки: правило дня, без оценки ночи.
// Ночь 3, мера ушла Вэю: Лю о цене — одним фактом, без имени и без объяснения (§23: обмен он ошибкой не называет)
export const MEASURE_PRICE = { text: null, claim: { weiWalks: false, g: { pid: 'wei', dose: 'measure', result: 'packet' } } };


export const TEMP_WORD = { cold: null, heat: null };
// какая болезнь у гостя и от какой трава — для «не то место» (§23, раунд 27: без «ты разобрал», без двусмысленного «она»)
export const LOC_HAD = { out: null, in: null };
export const LOC_GAVE = { out: null, in: null };
// где сидит болезнь — словами листа («снаружи», «внутри»): для ошибки по обеим осям
export const LOC_AT = { out: null, in: null };
// Чего именно не угадал ученик: холод с жаром или «где сидит» — для {GAVE}, {HAD}, {WHERE}.
export const ERR_WORDS = {
  gave: { cold: null, heat: null },
  had: { cold: null, heat: null },
  where: { in: null, out: null },
};




// Не та трава для Мэй — что именно было не так (подставляется в {WRONG}).
export const MEI_WRONG = {
  temp: null,
  out: null,
  in: null,
};

// Чем лечит трава — словами Лю, а не ярлыком ящика.
