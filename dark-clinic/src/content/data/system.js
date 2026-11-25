// Слова, которые говорит сам движок: подписи действий, причины, почему нельзя, короткие строки рассказчика.
// Только данные. Шаблоны — как везде: {N} — имя, {м|ж} — по роду гостя, {KEY} — подставляет движок.

// Существительные для счёта: формы через «|» — сколько форм, решает язык (русский: одна|две|пять).
export const NOUNS = {
  coin: null,
  coinAcc: null,
  spoon: null,
  spoonAcc: null,
  dose: null,
};

// Грамматика списков: «Лани, Дэна и Гао».
export const GRAMMAR = { sep: null, and: null };

// Подписи действий.
export const ACT = {
  newGame: null,
  beginNight: null,
  toMorning: null,
  openHatch: null,
  dontOpen: null,
  closeHatch: null,
  selfMirror: null,
  turnToBench: null,
  turnToEaves: null,
  // у открытого окошка — окликнуть, а не «повернуться к окошку» (§23, раунд 24)
  callEaves: null,
  tongue: null,
  pulseRate: null,
  pulseDepth: null,
  mirror: null,
  rinse: null,
  // язык уже видели — полоскание покажет его ещё раз (§23, раунд 25)
  rinseAgain: null,
  restFirst: null,
  rest: null,
  lastOil: null,
  // третий и следующие вопросы тому же гостю — по 2 ложки: на кнопке сказано почему (§23, раунд 22)
  askLate: null,
  boardCold: null,
  boardHeat: null,
  boardOut: null,
  boardIn: null,
  takeGiftCoins: null,
  takeGiftHerb: null,
  thankNothing: null,
  letIn: null,
  letInCandle: null,
  letInToDrink: null,
  waitMore: null,
  // она под навесом у того же окошка (§23, раунд 24)
  waitMoreEaves: null,
  // {N2} — тот, кто на табурете (второй человек в строке); незнакомый — Anon
  backToStool: null,
  backToStoolAnon: null,
  backToHatch: null,
  waitBench: null,
  waitEaves: null,
  toScales: null,
  refuseInside: null,
  refuseHatch: null,
  drawer: null,
  drawerMark: null,
  noHerb: null,
  noPoison: null,
  pinchVial: null,
  // по числу щепотей, что останутся: 0, 1, 2 — число словами, как его скажет язык
  pinchLeftBy: [null, null, null],
  measure: null,
  wrap: null,
  back: null,
  giveHomeInside: null,
  giveHomeHatch: null,
  giveDrink: null,
  takePay: null,
  declinePay: null,
  buyHerb: null,
  next: {
    ledger: null, cashbox: null, note: null,
    street: null, shop: null,
    hook: null, hookLast: null, streetLast: null,
  },
};

// Почему действие сейчас нельзя.
export const WHY = {
  notNow: null,
  candleNoChecks: null,
  lampOut: null,
  noOil: null,
  lastOilWarning: null,
  asked: null,
  tongueSeen: null,
  rateCounted: null,
  depthFound: null,
  mirrorDone: null,
  rinsed: null,
  rested: null,
  marked: null,
  noMirrorDark: null,
  thanksOnly: null,
  candleOne: null,
  doorShut: null,
  nobodyAtHatch: null,
  onScales: null,
  drawerEmpty: null,
  noHerbOnScales: null,
  noPoisonInPacket: null,
  pinchOnScales: null,
  noPoison: null,
  poisonGone: null,
  measureOnScales: null,
  sealed: null,
  lessThanMeasure: null,
  packetEmpty: null,
  drawerGone: null,
  poisonTaken: null,
  letInFirst: null,
  noCoins: null,
};

// Строки рассказчика, которые собирает движок.
export const SAY = {
  you: null,
  badSave: null,
  trayVial: null,
  trayKey: null,
  refusedInside: null,
  refusedHatch: null,
  nobodyBench: null,
  nobodyEaves: null,
  debtSlip: null,
  notOpened: null,
  turnBench: null,
  turnBenchDark: null,
  turnEaves: null,
  turnEavesDark: null,
  staysBench: null,
  backEaves: null,
  receipt: null,
  rinseDrawer: null,
  rinseInside: null,
  rinseHatch: null,
  afterRinse: null,
  restRate: null,
  restDepth: null,
  toScales: null,
  fromScales: null,
  onScales: null,
  pinch: null,
  measure: null,
  wrap: null,
  giveInside: null,
  giveHatch: null,
  pour: null,
  herbPay: null,
  herbPayDark: null,
  payDefault: null,
  // куда ложится плата: {SILL}/{SILL_CAP} — у окошка на подоконник, у впущенного на прилавок (движок выбирает пару, текст не правит)
  sill: null,
  sillCap: null,
  counter: null,
  counterCap: null,
  // что ученик слышал сам: какой вопрос он задал — {ASK} в CHECK_LINE.heard
  ask: { thirst: null, duration: null, chills: null, other: null },
  restWordInside: null,
  // в книге: бумажные монеты — «8 монет от Бай»
  paperItem: null,
  mourningItem: null,
};

// То, что показывает вид (view) словами.
export const VIEW = {
  poisonNone: null,
  vialOne: null,
  vialEmpty: null,
  vialTaken: null,
  jar: null,
  jarLeft: [null, null, null, null],
  creditor: null,
  // короткая строка лампы — видна без наведения (§23, раунд 24): сейчас / утром — на вечер / погасла / огарок
  lampShort: null,
  lampShortNext: null,
  lampShortOut: null,
  lampShortCandle: null,
  receipt: null,
  questionTemp: null,
  questionLoc: null,
};

// Сюй во вторую ночь «не помогло» под дождём: знобит не от болезни.
export const WORSE_RAIN_CHILLS = null;
