// Конечный автомат демо. Состояние — простой JSON. Интерфейс правил не знает:
// он берёт getView(state), getActions(state) и вызывает perform(state, id, params).
import { learnEvening, learnRules, sheetView } from './sheets.js';
import { C, setLang, langOf } from './lang.js';
import * as R from './rules.js';
import { fill, countText } from './text.js';
import { buildQueue, specOf } from './visit.js';
import { computeMorning, morningSteps, closingCard, lampNote } from './morning.js';

export const SAVE_VERSION = 1;
const LIVING_PIDS = Object.keys(C.PEOPLE).filter((p) => C.PEOPLE[p].start && C.PEOPLE[p].start.kind === 'living');

// ── Создание, сохранение ─────────────────────────────────────────────────────

/** Новая партия на выбранном языке (по умолчанию — русский); язык хранится в сохранении и до конца не меняется. */
export function createGame(opts = {}) {
  const lang = langOf({ lang: opts.lang });
  setLang(lang);
  return { v: SAVE_VERSION, seq: 0, phase: 'title', n: 0, lang };
}

export function save(state) {
  return JSON.stringify(state);
}

export function load(json) {
  const s = typeof json === 'string' ? JSON.parse(json) : structuredClone(json);
  setLang(langOf(s));
  if (!s || s.v !== SAVE_VERSION) throw new Error(C.SAY.badSave);
  s.lang = langOf(s); // сохранения до раунда 18 — русские
  return s;
}

function newWorld(lang) {
  const people = {};
  for (const pid of LIVING_PIDS) {
    const st = C.PEOPLE[pid].start;
    people[pid] = { deg: st.deg, temp: st.temp, loc: st.loc, killed: false, last: null };
  }
  const herbs = {};
  for (const h of R.HERBS) herbs[h] = R.START.herbDoses;
  return {
    v: SAVE_VERSION, seq: 0, phase: 'evening', n: 1, returnPlan: {}, lang,
    lampCap: R.LAMP_START, oil: R.LAMP_START, oilBonus: 0,
    coins: R.START.coins, paperCoins: [],
    herbs, poison: R.poisonForNight(1),
    debtKnown: false,
    people,
    others: {
      wei: { revealed: false, course: 0, destroyed: false, fed: false, tookOwn: [], insideNights: [] },
      bai: { revealed: false, course: 0, destroyed: false, fed: false, tookOwn: [], insideNights: [] },
    },
    rulesSeen: [], rulesKnown: {}, notes: [], ledger: [], history: {},
    coldRoom: false,
    night: null, morning: null, closing: null,
  };
}

function enterEvening(s, ev) {
  s.phase = 'evening';
  s.oil = s.lampCap;
  s.oilTonight = 0;
  s.oilBonus = 0;
  // вечерняя строка о лампе — согласна с числом
  s.lampNote = lampNote(s.n, s.coldRoom, s.oil, true, !!s.weiTaught);
  // ночью строка о лампе — о вечере: сколько было налито, а не сколько осталось (§23, раунд 15)
  s.lampNoteNight = lampNote(s.n, s.coldRoom, s.oil, true, !!s.weiTaught, true);
  s.poison = R.poisonForNight(s.n);
  if (!s.rulesSeen.includes(s.n)) s.rulesSeen.push(s.n);
  learnEvening(s, s.n); // с вечера на листе — только дело этой ночи (§23, раунд 28)
  s.notes.push({ n: s.n, when: 'evening', text: C.EVENING_NOTES[s.n] });
  s.night = null;
  const cal = C.CALENDAR[s.n];
  ev.push({ type: 'phase', phase: 'evening', night: s.n });
  ev.push({ type: 'show', slot: 'calendar', image: cal.image, text: `${cal.date}. ${cal.text}` });
  { const sv = sheetView(s, s.n); ev.push({ type: 'rule', title: sv.title, lines: sv.lines, blocks: sv.blocks, image: 'rules_sheet' }); }
  ev.push({ type: 'sound', sound: 'stair_door' });
  ev.push({ type: 'note', text: C.EVENING_NOTES[s.n], image: 'note' });
  ev.push({ type: 'lamp', oil: s.oil, text: s.lampNote });
  // первый вечер: что за поднос у двери на лестницу — ученик оставляет на нём ужин учителю (ревью, раунд 16)
  if (s.n === 1) ev.push({ type: 'show', slot: 'tray', image: 'tray', text: C.TRAY_FIRST });
  if (s.n === 2) ev.push({ type: 'show', slot: 'tray', image: 'vial', text: C.SAY.trayVial });
  if (s.n === 3) ev.push({ type: 'show', slot: 'tray', image: 'key', text: C.SAY.trayKey });
}

// ── Ночь ─────────────────────────────────────────────────────────────────────

function newRec(i) {
  return {
    i, step: 'knock', nameKnown: false, said: [], signs: [], seen: {}, asked: {}, nAsked: 0,
    board: { temp: null, loc: null }, letIn: false, rinsed: false, rested: false, pulsed: false,
    packet: { herb: null, dose: 'none' }, wrapped: false, delivery: null, result: null,
    paid: null, gift: null, oil: 0, drink: null, greetKey: null, backTo: null,
  };
}

function beginNight(s, ev) {
  s.phase = 'night';
  const queue = buildQueue(s.n, s);
  s.night = {
    queue, recs: queue.map((_, i) => newRec(i)), cur: 0, seated: null, focus: 'door',
    cash: [], lampOut: false, over: false, nonhumanInside: false, oilStart: s.oil,
  };
  ev.push({ type: 'phase', phase: 'night', night: s.n });
  ev.push({ type: 'sound', sound: s.n === 2 ? 'rain' : s.n === 3 ? 'wind' : 'crickets' });
  startKnock(s, ev);
}

const spec = (s, i) => specOf(s.night.queue[i]);
const nameOf = (pid) => C.PEOPLE[pid].name;

/** Строка, которой ещё не было в этой игре: из вариантов — первый несказанный (§23, раунд 17: одна фраза — один раз). */
function fresh(s, list) {
  const opts = list.filter(Boolean);
  s.spoken = s.spoken || {};
  const t = opts.find((x) => !s.spoken[x]) || opts[0];
  if (t) s.spoken[t] = true;
  return t;
}

/** Шаги в темноте — каждый раз своими словами (§23, раунд 25: не одна строка шесть раз за ночь). */
function darkSteps(s) {
  // раз за ночь, и то разными словами в разные ночи (§23, раунд 27); дальше шаги не рассказывают
  const nt = s.night;
  if (nt.routine && nt.routine.darkSteps) return null;
  return routine(s, 'darkSteps', fresh(s, [C.DARK.leave, ...(C.DARK.leaveMore || [])]));
}

/**
 * Привычное дело ученика (к весам, завернуть, отдать, плата) рассказано первый раз за ночь;
 * дальше — только если в нём что-то иначе (§23, раунд 25). Возвращает текст или null.
 */
function routine(s, key, text) {
  const nt = s.night;
  nt.routine = nt.routine || {};
  if (nt.routine[key]) return null;
  nt.routine[key] = true;
  return text;
}

/** Отказ: у каждого свой уход; у самого края — иначе; в темноте — только слышно. */
function refusedLine(s, rec, sp) {
  const pid = sp.pid;
  if (blind(s)) return C.PEOPLE[pid].start && C.PEOPLE[pid].start.kind !== 'living' ? C.DARK.weiLeave : darkSteps(s);
  const R2 = C.REFUSED_LEAVES[pid];
  const brink = sp.truth && sp.truth.kind === 'living' && sp.truth.deg >= 4;
  const t = R2 ? (rec.letIn ? fresh(s, [R2.inside, R2.again]) : brink && R2.brink ? R2.brink : fresh(s, [R2.hatch, R2.again])) : (rec.letIn ? C.SAY.refusedInside : C.SAY.refusedHatch);
  return fill(t, pid);
}

/** Строка Мэй в её сцене — по тому, где она сейчас (лавка, навес); в темноте и после её смерти — ничего. */
function meiLine(s, ev, table) {
  const spot = meiSpotNow(s);
  if (!table || !spot || blind(s)) return;
  const t = table[spot];
  if (!t) return;
  // её речь — речью с именем; что видно — строкой рассказчика (для интерфейса: раунд 15, I.1)
  for (const line of [].concat(t)) {
    if (typeof line === 'string') ev.push({ type: 'narrate', text: line, who: 'mei' });
    else if (line.speaker) ev.push({ type: 'say', speaker: meiKnown(s) ? nameOf(line.speaker) : C.DARK.voice, text: line.text, who: line.speaker });
    else ev.push({ type: 'narrate', text: line.text, who: 'mei' });
  }
}

/** Мэй известна по имени: её видели при свете, она назвалась — или Вэй позвал её по имени. */
function meiKnown(s) {
  const mi = meiIndex(s);
  return mi >= 0 && !!s.night.recs[mi].known;
}

/** Что видит тот, кто входит: обычная строка или — если в комнате тело — то, что он видит у стены. */
function insideLine(s, sp) {
  const nt = s.night;
  const bodies = (nt.bodies || []).filter((p) => p !== sp.pid);
  // Мэй, видевшая, как Вэя не стало, не просит «посидеть, пока он ждёт дома»
  if (s.n === 3 && sp.pid === 'mei' && weiGoneNow(s) && !blind(s)) return C.CLIMAX.meiInsideAfter;
  if (!bodies.length) return fresh(s, [sp.inside, sp.insideAgain]);
  if (blind(s)) return fill(C.BODY.insideDark, sp.pid);
  const meiOnBench = bodies.includes('mei') && nt.meiWait && nt.meiWait.where === 'dead';
  const own = meiOnBench ? C.BODY.insideMeiOf[sp.pid] : C.BODY.insideOf[sp.pid];
  // ученик сам перенёс тело к стене — он знает, кто там лежит (§23, раунд 23)
  const b = bodies[bodies.length - 1];
  const bi = nt.queue.findIndex((e) => e.pid === b);
  const BODY = bi >= 0 && nt.recs[bi].known ? C.PEOPLE[b].name : C.DESC[b] ? C.DESC[b].nom : C.PEOPLE[b].name;
  return fill(own || (meiOnBench ? C.BODY.insideMei : C.BODY.inside), sp.pid, { BODY });
}

/** Строка входа — и, если на лавке ждёт живая Мэй, то, что входящий её видит (§23, раунд 22). */
function insideWithMei(s, sp) {
  const line = insideLine(s, sp);
  const nt = s.night;
  const mw = nt && nt.meiWait;
  const meiThere = s.n === 3 && mw && mw.where === 'bench' && aliveNow(s, 'mei') && nt.queue[mw.i] && nt.queue[mw.i].pid === 'mei';
  // у стены тело — входящий занят им; Мэй — в другой раз (§23, раунд 23)
  if (!meiThere || blind(s) || ['mei', 'wei'].includes(sp.pid) || (nt.bodies || []).some((p) => p !== sp.pid)) return line;
  return `${line} ${fill(C.BODY.meiOnBenchOf[sp.pid] || C.BODY.meiOnBench, sp.pid)}`;
}

/** Темно ли сейчас для глаз: лампа погасла и огарок не зажжён (§23, «Огарок»). Масло это не возвращает. */
export function blind(s) {
  return !!(s.night && s.night.lampOut && !s.night.candle);
}

function activeIndex(s) {
  const nt = s.night;
  if (!nt) return null;
  if (nt.focus === 'seated' && nt.seated !== null) return nt.seated;
  if (nt.focus === 'waiting' && nt.meiWait && nt.meiWait.undecided) return nt.meiWait.i;
  if (nt.cur < nt.queue.length) return nt.cur;
  return null;
}

function startKnock(s, ev) {
  const nt = s.night;
  if (nt.cur >= nt.queue.length) return;
  const sp = spec(s, nt.cur);
  // ночь 3: лампа погасла раньше стука Вэя — ученик зажигает огарок на один, последний приём
  ev.push({ type: 'sound', sound: 'knock', text: sp.knock, image: blind(s) ? null : sp.silhouette, slot: 'shadow', knock: sp.knockData });
  // в темноте «не разобрать, кто там» — только если гость не назвался в самом стуке («Это Дэн»)
  if (blind(s) && !(sp.knock && names(sp.knock, sp.pid))) ev.push({ type: 'narrate', text: C.NIGHT_EVENTS.blindKnock });
  if (s.n === 3 && sp.pid === 'wei') ev.push({ type: 'ambience', wind: 'silent', text: null });
  // ночь 3: Мэй здесь, когда стучит Вэй, — на табурете или под навесом
  if (s.n === 3 && sp.pid === 'wei') {
    const where = meiWhere(s);
    if (where) {
      const mi = meiIndex(s);
      s.night.recs[mi].waitedAt = where; // где она ждала его, когда он пришёл (книга и уход — по этому месту)
      const k = where === 'dead' ? 'dead' : where;
      for (const line of [].concat(blind(s) ? C.CLIMAX.knockDark[k] : C.CLIMAX.knock[k])) pushLine(s, mi, typeof line === 'string' ? { speaker: null, text: line } : line, ev);
    }
  }
}

// ── Ночь 3: Мэй ждёт Вэя ─────────────────────────────────────────────────────

function meiIndex(s) {
  return s.night.queue.findIndex((e) => e.pid === 'mei');
}
function weiIndex(s) {
  return s.night.queue.findIndex((e) => e.pid === 'wei');
}
/** Мэй ещё ждёт Вэя: Вэй впереди по очереди и не принят. */
function weiPending(s) {
  if (s.n !== 3) return false;
  const w = weiIndex(s);
  return w >= 0 && s.night.recs[w].step !== 'done';
}
/** Где Мэй, пока у окошка Вэй: 'bench' (лавка у стены) | 'eaves' (под навесом) | 'dead' | null. */
function meiWhere(s) {
  const nt = s.night;
  if (nt.meiWait) return nt.meiWait.where;
  const mi = meiIndex(s);
  if (mi >= 0 && nt.seated === mi) return 'bench';
  return null;
}
/** Как уходит Мэй, когда Вэя не стало: видела ли она, как он рассыпался (была на лавке), или вошла позже. */
function meiGoneKey(s, where) {
  if (s.night.meiSawEarth) return 'destroyed_bench';
  return where === 'bench' ? 'destroyed_in' : 'destroyed';
}
/** Вэй позвал её голосом («Мэй. Пора.») — когда ему отказали у окошка или из комнаты. */
function weiCalled(s) {
  const w = weiIndex(s);
  return w >= 0 && s.night.recs[w].result === 'refused' && s.night.recs[w].nameKnown;
}

/** Что ты сделал с Вэем в ночь 3 — ключ для сцен ухода Мэй. */
function weiChoice(s) {
  const w = weiIndex(s);
  if (w < 0) return 'herb';
  const r = s.night.recs[w];
  if (r.drink && r.drink.code === 'destroyed') return 'destroyed';
  if (r.result === 'refused' || r.result === 'unreceived') return 'refused';
  if (r.packet.dose === 'measure') return 'measure';
  if (r.packet.dose === 'pinch') return 'pinch';
  return 'herb';
}

// ── Реплика знает, что случилось (§23, «Утро»: «Реплика знает, что случилось») ──
// У строки может быть need: { alive: [pid], dead: [pid], wei: 'walking' | 'gone', light: true, dark: true }.
// Движок не выпускает строку, условие которой не выполнено; из вариантов берёт первый подходящий.

/** Жив ли человек сейчас — с учётом того, что случилось этой ночью у тебя на табурете. */
export function aliveNow(s, pid) {
  const p = s.people[pid];
  if (p && (p.killed || p.deg >= R.GONE)) return false;
  if (pid === 'wei') return !weiGoneNow(s);
  const nt = s.night;
  if (nt && nt.recs) return !nt.queue.some((e, k) => e.pid === pid && nt.recs[k].drink && (nt.recs[k].drink.code === 'killed' || nt.recs[k].drink.diedHere));
  return true;
}
function weiGoneNow(s) {
  if (s.others.wei.destroyed) return true;
  const nt = s.night;
  return !!(nt && nt.recs && nt.queue.some((e, k) => e.pid === 'wei' && nt.recs[k].drink && nt.recs[k].drink.code === 'destroyed'));
}
export function holds(s, need) {
  if (!need) return true;
  const dark = blind(s);
  if (need.light && dark) return false;
  if (need.dark && !dark) return false;
  if (need.alive && !need.alive.every((pid) => aliveNow(s, pid))) return false;
  if (need.dead && !need.dead.every((pid) => !aliveNow(s, pid))) return false;
  if (need.wei === 'walking' && weiGoneNow(s)) return false;
  if (need.wei === 'gone' && !weiGoneNow(s)) return false;
  if (need.wei === 'here' && !weiHereNow(s)) return false;
  if (need.wei === 'seen' && !(weiHereNow(s) && s.night.recs[s.night.queue.findIndex((e) => e.pid === 'wei')].step !== 'knock')) return false;
  if (need.wei === 'outside' && !weiOutsideNow(s)) return false;
  if (need.wei === 'away' && (weiHereNow(s) || weiGoneNow(s))) return false;
  if (need.mei && meiSpotNow(s) !== need.mei) return false;
  return true;
}
/** Вэй уже постучал и ещё не ушёл (ночь 3). */
function weiHereNow(s) {
  const nt = s.night;
  if (!nt || !nt.recs || s.n !== 3 || weiGoneNow(s)) return false;
  const w = nt.queue.findIndex((e) => e.pid === 'wei');
  return w >= 0 && nt.cur >= w && nt.recs[w].step !== 'done';
}
/** Вэй был у окошка и вышел на улицу ждать Мэй (она ещё у тебя). */
export function weiOutsideNow(s) {
  const nt = s.night;
  if (!nt || !nt.recs || s.n !== 3 || weiGoneNow(s)) return false;
  const w = nt.queue.findIndex((e) => e.pid === 'wei');
  const mi = nt.queue.findIndex((e) => e.pid === 'mei');
  const meiUndecided = (nt.meiWait && nt.meiWait.undecided) || (mi >= 0 && nt.seated === mi && nt.recs[mi].step !== 'done');
  return w >= 0 && nt.recs[w].step === 'done' && !!meiUndecided && aliveNow(s, 'mei');
}
/** Где Мэй сейчас, пока ждёт Вэя: 'bench' | 'eaves' | 'dead' | null. */
function meiSpotNow(s) {
  const nt = s.night;
  if (!nt || !nt.recs || s.n !== 3) return null;
  if (!aliveNow(s, 'mei')) return 'dead';
  const mi = nt.queue.findIndex((e) => e.pid === 'mei');
  if (mi < 0) return null;
  if (nt.seated === mi) return 'bench';
  if (nt.meiWait && nt.meiWait.i === mi) return nt.meiWait.where;
  if (nt.recs[mi].step !== 'done' && nt.recs[mi].step !== 'knock') return nt.recs[mi].letIn ? 'bench' : 'eaves';
  return null;
}
/** Что изменилось вокруг того, кого спрашивают: Мэй — пришёл ли Вэй, нет ли его; Вэй — где и жива ли Мэй.
 *  Вопрос, заданный до перемены, можно задать снова (§23, раунд 11: «Уже спрашивал» после перемены — нельзя). */
export function askPhase(s, pid) {
  if (s.n !== 3) return 'x';
  if (pid === 'mei') {
    if (weiGoneNow(s)) return 'gone';
    if (weiHereNow(s)) { const w = s.night.queue.findIndex((e) => e.pid === 'wei'); const r = s.night.recs[w]; return `here:${r.step === 'knock' ? 'knock' : r.letIn ? 'in' : 'hatch'}`; }
    return weiOutsideNow(s) ? 'outside' : 'before';
  }
  if (pid === 'wei') {
    const w = s.night.queue.findIndex((e) => e.pid === 'wei');
    return `${meiSpotNow(s) || 'none'}|${w >= 0 && s.night.recs[w].letIn ? 'in' : 'out'}`; // вошёл — можно спросить снова
  }
  return 'x';
}
/** Первый вариант, чьё условие выполнено (или сама строка, если она не список). */
export function pickVariant(s, v) {
  if (!Array.isArray(v)) return v && holds(s, v.need) ? v : null;
  return v.find((x) => holds(s, x.need)) || null;
}

function pushLine(s, i, line, ev) {
  if (line.need && !holds(s, line.need)) return;
  const rec = s.night.recs[i];
  const pid = s.night.queue[i].pid;
  // в темноте у голоса нет имени, пока он его не назовёт (§23, раунд 14); свой голос и Вэй — другое дело
  // гость назвался сам — дальше он известен по имени и в темноте (§23, раунд 16: одно имя везде)
  if (line.names && line.speaker === pid) rec.known = true;
  const speaker = line.speaker ? (!rec.known && line.speaker === pid ? C.DARK.voice : nameOf(line.speaker)) : null;
  const text = fill(line.text, pid);
  rec.said.push({ speaker, text });
  ev.push(speaker ? { type: 'say', speaker, text } : { type: 'narrate', text });
}

function spend(s, rec, cost, ev) {
  if (!cost) return;
  s.oil -= cost;
  rec.oil += cost;
  ev.push({ type: 'lamp', oil: s.oil });
  if (s.oil <= 0 && !s.night.lampOut) {
    s.oil = 0;
    s.night.lampOut = true;
    s.night.lampOutAt = s.night.cur; // у чьего стука погасла: до Вэя или при нём (ветер, §23)
    rec.lampDied = true; // лампа погасла на этом госте: дальше проверять его было нечем
    ev.push({ type: 'sound', sound: 'flame_low' });
    // лампа погасла, пока здесь главный гость ночи, — огарок на этот приём (§23); тогда без «дальше — вслепую»,
    // чтобы следующая строка (огарок) ей не перечила (§23, раунд 25)
    const k = s.night.recs.indexOf(rec);
    const waitingMain = s.n === 3 && s.night.queue.some((e, j) => isMain(s, e.pid) && j <= s.night.cur && s.night.recs[j].step !== 'done' && s.night.recs[j].step !== 'knock');
    const candleNow = ((k >= 0 && isMain(s, s.night.queue[k].pid)) || waitingMain) && !s.night.candleOut;
    ev.push({ type: 'narrate', text: candleNow ? C.NIGHT_EVENTS.lampOutCandle : C.NIGHT_EVENTS.lampOut });
    if (candleNow) lightCandle(s, ev);
  }
}

function addSign(rec, check, text, value, image) {
  rec.signs.push({ check, label: C.CHECK_NAMES[check], text, value: value || null, image: image || null });
}

function weiGreetKey(s) {
  const where = meiWhere(s);
  return where ? `mei_${where}` : 'mei_none';
}

/** Огарок свечи (§23): если в ночь 3 лампы нет к приёму Вэя — и до стука, и после стука, до окошка. */
/** Главный гость ночи (§23, «Огарок»): Бай в ночь 1, Вэй в ночи 2 и 3 — его игрок видит всегда. */
const MAIN = { 1: 'bai', 2: 'wei', 3: 'wei' };
export function isMain(s, pid) {
  return MAIN[s.n] === pid;
}
function lightCandle(s, ev) {
  const nt = s.night;
  if (!nt.lampOut || nt.candle || nt.candleOut) return;
  nt.candle = true;
  ev.push({ type: 'candle', lit: true });
  ev.push({ type: 'narrate', text: C.NIGHT_EVENTS.candle });
}

function openHatch(s, i, ev) {
  const rec = s.night.recs[i];
  const sp = spec(s, i);
  if (isMain(s, sp.pid)) lightCandle(s, ev); // лампа погасла уже после его стука
  rec.step = 'hatch';
  rec.nameKnown = true;
  const dark = blind(s);
  rec.dark = dark;
  // кто увиден при свете или назвался в стуке («Это Дэн») — известен по имени везде (§23, раунд 16)
  rec.known = !dark || !!sp.knockNames || !!rec.known;
  rec.byLamp = !s.night.lampOut; // видел при лампе (а не при огарке и не вслепую)
  ev.push({ type: 'sound', sound: 'hatch_open' });
  if (!dark) ev.push({ type: 'show', slot: 'face', image: sp.portrait });
  else ev.push({ type: 'narrate', text: C.DARK.hatch });
  const lines = [...sp.greet];
  let key = s.night.queue[i].variant && s.night.queue[i].variant.key;
  if (sp.pid === 'wei' && s.n === 3) key = weiGreetKey(s);
  rec.greetKey = key || null;
  // у вернувшегося «не помогло» вариант уже вставлен в greet (visit.js) — второй раз его не говорят
  if (sp.mode === 'first' && key && sp.greetVariants && sp.greetVariants[key]) lines.push(...sp.greetVariants[key]);
  if (sp.greetAfter) lines.push(...sp.greetAfter);
  if (sp.greetExtra && sp.pid === 'wei' && s.others.wei.revealed) lines.push(...sp.greetExtra.revealed);
  // у самого края (место 4) — видно и слышно иначе, чем на краю
  if (sp.truth && sp.truth.kind === 'living' && sp.truth.deg >= 4 && C.BRINK[sp.pid]) lines.push(...C.BRINK[sp.pid]);
  // в темноте — только голоса: того, что видно, нет
  for (const line of lines) if (!(dark && !line.speaker)) pushLine(s, i, line, ev);
  // ночь 3: Вэй заговорил с ней — она отвечает (её сцена); он зовёт её по имени — теперь она известна
  if (s.n === 3 && sp.pid === 'wei') {
    const mi = meiIndex(s);
    if (mi >= 0 && meiWhere(s)) s.night.recs[mi].known = true;
    meiLine(s, ev, C.CLIMAX.meiReplies);
  }
  // кто проходит мимо Мэй под навесом — видит её
  if (s.n === 3 && !['mei', 'wei'].includes(sp.pid) && meiSpotNow(s) === 'eaves' && !dark && C.PASS_MEI[sp.pid]) ev.push({ type: 'narrate', text: C.PASS_MEI[sp.pid] });
}

function finishVisit(s, i, ev) {
  const nt = s.night;
  const rec = nt.recs[i];
  rec.step = 'done';
  nt.revealed = null; // «земля с пальцев» — на этот приём
  const pid = nt.queue[i].pid;
  // огарок — на один приём главного гостя: приём кончился — огарок догорел, дальше темно (§23, раунд 25)
  if (nt.candle && isMain(s, pid)) {
    nt.candle = false;
    nt.candleOut = true;
    ev.push({ type: 'candle', lit: false });
    ev.push({ type: 'narrate', text: C.NIGHT_EVENTS.candleOut });
  }
  const wasWaiting = nt.meiWait && nt.meiWait.undecided && nt.meiWait.i === i ? nt.meiWait.where : null;
  if (wasWaiting) {
    nt.meiWait = null;
    if (nt.focus === 'waiting') nt.focus = 'door';
  }
  // ночь 3: Мэй не уходит до Вэя
  if (pid === 'mei' && weiPending(s)) {
    const dead = rec.drink && rec.drink.code === 'killed';
    // на табурете ждёт, только если ты сам её туда посадил; иначе — под навесом, табурет свободен для других
    const where = dead ? 'dead' : nt.seated === i || rec.letIn ? 'bench' : 'eaves';
    nt.meiWait = { i, where };
    // уже ждала там же — не «садится» второй раз, а остаётся
    const stay = !dead && wasWaiting === where && rec.nameKnown;
    const key = dead ? 'dead' : stay ? `${where}_stay` : where === 'bench' ? 'bench' : rec.result === 'packet' ? 'eaves' : rec.nameKnown ? 'eaves_refused' : 'eaves_unopened';
    // в темноте — только то, что слышно; у мёртвой дыхания нет, и лежит она на лавке, а не под навесом
    const darkKey = dead ? 'dead' : where;
    // он уже здесь, у окошка: «он за мной придёт» — не говорят
    const hereKey = !stay && weiHereNow(s) && C.CLIMAX.meiWaitsHere[key] ? C.CLIMAX.meiWaitsHere[key] : null;
    const darkLine = !dead && meiKnown(s) ? C.CLIMAX.meiWaitsDarkKnown[darkKey] : C.CLIMAX.meiWaitsDark[darkKey];
    ev.push({ type: 'narrate', text: blind(s) && key !== 'eaves_unopened' ? darkLine : hereKey || C.CLIMAX.meiWaits[key], mei: dead ? 'dead' : where });
    if (dead) nt.bodyOnStool = null; // её переносят на лавку: дальше она — waiting.spot 'dead'
  }
  // ночь 3: Вэя не стало или он ушёл — ветер возвращается в ту же минуту (§23, «Ночь 3»); пока он ждёт её на улице — ещё тихо
  if (pid === 'wei' && s.n === 3 && !weiOutsideNow(s)) windBack(s, ev);
  if (pid === 'mei' && s.n === 3 && weiIndex(s) >= 0 && nt.recs[weiIndex(s)].step === 'done') windBack(s, ev);
  // ночь 3: Вэй принят — Мэй уходит, и как — зависит от того, что ты с ним сделал
  if (pid === 'wei' && s.n === 3 && nt.meiWait && !nt.meiWait.undecided) {
    const weiInside = nt.recs[i].letIn;
    let key = nt.meiWait.where === 'dead' ? (weiInside ? 'dead_inside' : 'dead') : weiChoice(s);
    if (key === 'destroyed') key = meiGoneKey(s, nt.meiWait.where);
    // окошко ему не открыли — голоса не было: она уходит на стук, а не на голос
    if (key === 'refused' && !nt.recs[i].nameKnown) key = nt.meiWait.where === 'bench' ? 'unopened_bench' : 'unopened';
    ev.push({ type: 'narrate', text: blind(s) ? C.DARK.meiLeaves : C.CLIMAX.meiLeaves[key], ...(nt.meiWait.where === 'dead' ? { leaves: true } : { mei: 'street', leaves: true }) });
    nt.meiWait = null;
  }
  if (nt.seated === i) {
    nt.seated = null;
    nt.focus = 'door';
  } else if (i === nt.cur) {
    nt.cur += 1;
    nt.focus = 'door';
    if (nt.cur < nt.queue.length) startKnock(s, ev);
  }
  if (nt.cur >= nt.queue.length) {
    if (nt.meiWait && nt.meiWait.undecided) {
      nt.focus = 'waiting';
      ev.push({ type: 'narrate', text: nt.meiWait.where === 'bench' ? C.SAY.nobodyBench : C.SAY.nobodyEaves });
      nt.nobodySaid = true;
    } else {
      nightOver(s, ev);
    }
  }
}

/** Ветер возвращается, когда Вэя не стало или он ушёл (ночь 3). Один раз. */
function windBack(s, ev) {
  const nt = s.night;
  if (nt.windBack) return;
  nt.windBack = true;
  ev.push({ type: 'ambience', wind: 'blowing', text: null });
  ev.push({ type: 'narrate', text: C.NIGHT_EVENTS.windBack });
}

function endNightLampOut(s, ev) {
  const nt = s.night;
  const left = [];
  for (let i = 0; i < nt.queue.length; i++) {
    const r = nt.recs[i];
    if (r.step === 'done') continue;
    r.step = 'done';
    r.result = 'unreceived';
    if (i === nt.seated) {
      ev.push({ type: 'narrate', text: fill(C.NIGHT_EVENTS.seatedLeaves, nt.queue[i].pid), leaves: true });
    } else left.push(nt.queue[i].pid);
  }
  nt.seated = null;
  nt.cur = nt.queue.length;
  // у Вэя шагов не бывает: если за ставней остался только он — тишина
  if (left.length) ev.push({ type: 'narrate', text: left.every((p) => p === 'wei' || p === 'bai') ? C.DARK.weiLampOut : C.NIGHT_EVENTS.lampOutLeave, leaves: true, ...(left.every((p) => p === 'wei' || p === 'bai') ? { silentSteps: true } : {}) });
  if (s.n === 3 && left.includes('wei')) windBack(s, ev);
  nightOver(s, ev);
}

function nightOver(s, ev) {
  // земля на табурете — до конца ночи
  if (s.night.earth && !s.night.earthSwept) { s.night.earthSwept = true; ev.push({ type: 'narrate', text: C.BODY.earthDawn }); }
  if (s.n === 3) windBack(s, ev); // он ушёл — ветер вернулся (если ещё не вернулся)
  s.night.over = true;
  // «Больше никто не стучит» уже сказано (Мэй ждала одна) — второй раз не говорится (§23, раунд 23)
  ev.push({ type: 'narrate', text: s.night.nobodySaid ? C.NIGHT_EVENTS.nightOverQuiet[s.n] : C.NIGHT_EVENTS.nightOverBy[s.n] || C.NIGHT_EVENTS.nightOver });
}

// ── Действия ─────────────────────────────────────────────────────────────────

function act(id, label, cost = 0, extra = {}) {
  return { id, key: extra.param ? `${id}:${extra.param}` : id, label, cost, enabled: true, reason: null, ...extra };
}
function disable(a, reason) {
  a.enabled = false;
  a.reason = reason;
  return a;
}

function oilGate(s, a) {
  if (!a.cost) return a;
  if (s.night && s.night.lampOut) return disable(a, s.night.candle ? C.WHY.candleNoChecks : C.WHY.lampOut);
  if (a.cost > s.oil) return disable(a, C.WHY.noOil);
  if (a.cost === s.oil && a.enabled) { // у недоступного действия — только его причина
    // предупреждение верно при любой цене: это последнее масло, сколько бы ложек ни было
    a.warning = C.WHY.lastOilWarning;
    a.label = fill(C.ACT.lastOil, null, { LABEL: a.label });
  }
  return a;
}

function examActions(s, i, inside) {
  const rec = s.night.recs[i];
  const out = [];
  for (const t of R.QUESTION_TOPICS) {
    // «Кто ждёт дома?» — даром, вне счёта вопросов и даже в темноте (§23)
    const free = t === 'home';
    // третий вопрос дороже — и на кнопке сказано почему
    const label = !free && rec.nAsked >= 2 ? fill(C.ACT.askLate, null, { LABEL: C.QUESTIONS[t].label }) : C.QUESTIONS[t].label;
    const a = act('ask', label, free ? 0 : R.questionCost(rec.nAsked), { param: t, group: 'exam' });
    if (rec.asked[t] === askPhase(s, s.night.queue[i].pid)) disable(a, C.WHY.asked);
    out.push(free ? a : oilGate(s, a));
  }
  const checks = [
    ['tongue', C.ACT.tongue, R.COST.tongue, rec.seen.tongue ? C.WHY.tongueSeen : null],
    ['pulse_rate', C.ACT.pulseRate, R.pulseCost(s.n, inside), rec.seen.pulse_rate ? C.WHY.rateCounted : null],
    ['pulse_depth', C.ACT.pulseDepth, R.pulseCost(s.n, inside), rec.seen.pulse_depth ? C.WHY.depthFound : null],
    ['mirror', C.ACT.mirror, R.COST.mirror, rec.seen.mirror ? C.WHY.mirrorDone : null],
    ['rinse', rec.seen.tongue ? C.ACT.rinseAgain : C.ACT.rinse, R.COST.rinse, rec.rinsed ? C.WHY.rinsed : null], // полоскание и показывает язык
  ];
  for (const [id, label, cost, reason] of checks) {
    const a = act(id, label, cost, { group: 'exam' });
    if (reason) disable(a, reason);
    out.push(oilGate(s, a));
  }
  if (inside) {
    const first = !s.night.wick;
    // цена и её причина — до того, как платишь (§23, раунд 15)
    const a = act('rest', first ? C.ACT.restFirst : C.ACT.rest, R.COST.rest - (first ? R.WICK : 0), { group: 'exam' });
    if (rec.rested) disable(a, C.WHY.rested);
    out.push(oilGate(s, a));
  }
  return out;
}

function boardActions(rec) {
  const b = rec.board;
  const mk = (param, label, cur) => {
    const a = act(cur ? 'board_temp' : 'board_loc', label, 0, { param, group: 'board' });
    return a;
  };
  const list = [
    mk('cold', C.ACT.boardCold, true), mk('heat', C.ACT.boardHeat, true),
    mk('out', C.ACT.boardOut, false), mk('in', C.ACT.boardIn, false),
  ];
  for (const a of list) {
    const chosen = a.id === 'board_temp' ? b.temp : b.loc;
    if (chosen === a.param) disable(a, C.WHY.marked);
  }
  return list;
}

/** Своё бронзовое зеркало: ученик смотрит на свой язык. Даром; в темноте — не видно. */
function selfMirror(s) {
  const a = act('self_mirror', C.ACT.selfMirror, 0, { group: 'room' });
  if (blind(s) && !s.night.done) disable(a, C.WHY.noMirrorDark);
  return a;
}

function seatedActions(s, atHatch = false) {
  const nt = s.night;
  // ждать остаётся только Мэй в ночь 3 (§23, «Оставить ждать»): к ней можно повернуться;
  // у открытого окошка ученик уже стоит — тогда он её окликает, а не «поворачивается к окошку» (§23, раунд 24)
  if (nt.meiWait && nt.meiWait.undecided && nt.focus !== 'waiting') {
    const label = nt.meiWait.where === 'bench' ? C.ACT.turnToBench : atHatch ? C.ACT.callEaves : C.ACT.turnToEaves;
    return [act('turn_to_waiting', label, 0, { group: 'door' })];
  }
  return [];
}

/** Действия шага; правило, которое впервые решает здесь, — на самом действии (warning, §23, раунд 28). */
export function getActions(state) {
  const acts = actionsRaw(state);
  const W = state && state.ruleWarn;
  if (W) for (const a of acts) if (W[a.key] && a.enabled) a.warning = a.warning ? `${W[a.key]} ${a.warning}` : W[a.key];
  return acts;
}

function actionsRaw(state) {
  const s = state;
  setLang(langOf(s));
  if (s.phase === 'title') return [act('new_game', C.TITLE.start)];
  if (s.phase === 'end') return [act('new_game', C.ACT.newGame)];
  if (s.phase === 'evening') return [act('begin_night', C.ACT.beginNight), selfMirror(s)];
  if (s.phase === 'morning') return morningActions(s);
  const nt = s.night;
  if (nt.over) return [act('to_morning', C.ACT.toMorning)];
  const i = activeIndex(s);
  if (i === null) return [];
  const rec = nt.recs[i];
  const sp = spec(s, i);
  const N = nameOf(sp.pid);
  const out = [];

  if (rec.step === 'knock') {
    out.push(act('open_hatch', C.ACT.openHatch, 0, { group: 'door' }));
    out.push(act('dont_open', C.ACT.dontOpen, 0, { group: 'door' }));
    out.push(...seatedActions(s));
    out.push(selfMirror(s));
    return out;
  }
  if (sp.type === 'scene') {
    return [act('close_hatch', sp.closeLabel || C.ACT.closeHatch, 0, { group: 'door' })];
  }
  if (sp.type === 'thanks') {
    const why = sp.decline || fill(C.WHY.thanksOnly, sp.pid);
    const looks = ['tongue', 'pulse_rate', 'pulse_depth', 'mirror'].map((id) => disable(act(id, { tongue: C.ACT.tongue, pulse_rate: C.ACT.pulseRate, pulse_depth: C.ACT.pulseDepth, mirror: C.ACT.mirror }[id], id.startsWith('pulse') ? R.pulseCost(s.n) : 1, { group: 'exam' }), why));
    return [
      ...looks,
      act('take_gift', sp.gift.coins
        ? fill(C.ACT.takeGiftCoins, null, { X: countText(sp.gift.coins, 'coinAcc') })
        : fill(C.ACT.takeGiftHerb, null, { HERB: C.HERB_NAMES[sp.gift.herb] }), 0, { group: 'door' }),
      act('close_hatch', C.ACT.thankNothing, 0, { group: 'door' }),
    ];
  }
  if (rec.step === 'hatch' || rec.step === 'inside') {
    const inside = rec.step === 'inside';
    out.push(...examActions(s, i, inside));
    if (!inside) {
      // при огарке Вэя можно впустить даром — иначе «выпил при тебе» недостижим (§23, «Огарок»)
      const free = s.night.candle && isMain(s, sp.pid);
      let a = free ? act('let_in', C.ACT.letInCandle, 0, { group: 'door' }) : oilGate(s, act('let_in', C.ACT.letIn, R.COST.let_in, { group: 'door' }));
      if (!free && s.night.candle && s.night.lampOut) disable(a, C.WHY.candleOne);
      if (s.n === 1) disable(a, C.WHY.doorShut);
      out.push(a);
    }
    // ждать остаётся только Мэй в ночь 3: впущенная — на лавке, нет — под навесом (§23)
    if (s.n === 3 && sp.pid === 'mei' && weiPending(s)) {
      if (nt.focus === 'waiting') {
        const doorRec = nt.cur < nt.queue.length ? nt.recs[nt.cur] : null;
        // два человека в одной строке: {N} и его род — Мэй, {N2} и его род — тот, кто на табурете
        const back = doorRec && doorRec.letIn ? (doorRec.known ? fill(C.ACT.backToStool, sp.pid, { P2: nt.queue[nt.cur].pid }) : C.ACT.backToStoolAnon) : C.ACT.backToHatch;
        // она под навесом, у того же окошка: «вернуться к окошку» неверно — ученик и так у окошка (§23, раунд 24)
        const label = nt.meiWait.where === 'eaves' && back === C.ACT.backToHatch ? fill(C.ACT.waitMoreEaves, sp.pid) : fill(C.ACT.waitMore, sp.pid, { BACK: back });
        const a = act('let_wait', label, 0, { group: 'door' });
        if (nt.cur >= nt.queue.length) disable(a, C.WHY.nobodyAtHatch);
        out.push(a);
      }
      else out.push(act('let_wait', fill(inside ? C.ACT.waitBench : C.ACT.waitEaves, sp.pid), 0, { group: 'door' }));
    }
    out.push(...boardActions(rec));
    out.push(act('to_scales', C.ACT.toScales, 0, { group: 'scales' }));
    out.push(act('refuse', inside ? C.ACT.refuseInside : C.ACT.refuseHatch, 0, { group: 'door' }));
    // Вэй в комнате: к Мэй можно повернуться и при нём (§23: оба здесь, обоих можно спросить)
    if (!inside || (s.n === 3 && sp.pid === 'wei')) out.push(...seatedActions(s, !inside));
    out.push(selfMirror(s));
    return out;
  }
  if (rec.step === 'scales') {
    const drawer = R.herbFor(rec.board.temp, rec.board.loc);
    for (const h of R.HERBS) {
      const doses = s.herbs[h];
      const mark = h === drawer ? C.ACT.drawerMark : '';
      const a = act('herb', fill(C.ACT.drawer, null, { HERB: C.HERB_NAMES[h], MARK: mark, X: countText(doses, 'dose') }), 0, { param: h, group: 'scales' });
      if (rec.packet.herb === h) disable(a, C.WHY.onScales);
      else if (doses <= 0) disable(a, C.WHY.drawerEmpty);
      out.push(a);
    }
    const none = act('herb', C.ACT.noHerb, 0, { param: 'none', group: 'scales' });
    if (!rec.packet.herb) disable(none, C.WHY.noHerbOnScales);
    out.push(none);
    const p = s.poison;
    const dn = act('dose', C.ACT.noPoison, 0, { param: 'none', group: 'scales' });
    if (rec.packet.dose === 'none') disable(dn, C.WHY.noPoisonInPacket);
    out.push(dn);
    const left = p.pinches - 1;
    // яда не осталось (и на весах его нет): одна строка об этом, а не недоступные щепоть и мера (§23, раунд 24)
    // ночь 1: в доме яда нет вовсе — тоже одна строка (§23, раунд 25)
    const gone = s.n === 1 || (p.pinches < 1 && !['pinch', 'measure'].includes(rec.packet.dose));
    const goneWhy = s.n === 1 ? C.WHY.noPoison : C.WHY.poisonGone;
    if (gone) out.push(disable(act('dose', goneWhy, 0, { param: 'pinch', group: 'scales' }), goneWhy));
    const pinchLabel = s.n === 2 ? C.ACT.pinchVial : C.ACT.pinchLeftBy[Math.max(0, Math.min(2, left))];
    const dp = act('dose', pinchLabel, 0, { param: 'pinch', group: 'scales' });
    if (rec.packet.dose === 'pinch') disable(dp, C.WHY.pinchOnScales);
    else if (s.n === 1) disable(dp, C.WHY.noPoison);
    if (!gone) out.push(dp);
    const dm = act('dose', C.ACT.measure, 0, { param: 'measure', group: 'scales' });
    if (rec.packet.dose === 'measure') disable(dm, C.WHY.measureOnScales);
    else if (s.n === 1) disable(dm, C.WHY.noPoison);
    else if (p.sealed) disable(dm, C.WHY.sealed);
    else if (p.pinches < 3) disable(dm, C.WHY.lessThanMeasure);
    if (!gone) out.push(dm);
    out.push(...boardActions(rec));
    const w = act('wrap', C.ACT.wrap, 0, { group: 'scales' });
    const need = rec.packet.dose === 'measure' ? 3 : rec.packet.dose === 'pinch' ? 1 : 0;
    if (!rec.packet.herb && rec.packet.dose === 'none') disable(w, C.WHY.packetEmpty);
    else if (rec.packet.herb && s.herbs[rec.packet.herb] <= 0) disable(w, C.WHY.drawerGone);
    else if (need > p.pinches) disable(w, C.WHY.poisonTaken);
    out.push(w);
    out.push(act('back', C.ACT.back, 0, { group: 'scales' }));
    return out;
  }
  if (rec.step === 'handover') {
    out.push(act('give_home', rec.letIn ? C.ACT.giveHomeInside : C.ACT.giveHomeHatch, 0, { group: 'scales' }));
    const d = act('give_drink', C.ACT.giveDrink, 0, { group: 'scales' });
    if (!rec.letIn) disable(d, C.WHY.letInFirst);
    out.push(d);
    const candleWei = nt.candle && isMain(s, sp.pid);
    if (!rec.letIn && sp.type === 'patient' && (!nt.lampOut || candleWei)) {
      // свёрток завернули у окошка — «выпей при мне» ещё можно: впустить (при огарке Вэя — даром)
      const label = fill(C.ACT.letInToDrink, sp.pid);
      const a = candleWei ? act('let_in', label, 0, { group: 'door' }) : oilGate(s, act('let_in', label, R.COST.let_in, { group: 'door' }));
      if (s.n === 1) disable(a, C.WHY.doorShut);
      out.push(a);
    }
    return out;
  }
  if (rec.step === 'payment') {
    out.push(act('take_pay', C.ACT.takePay, 0, { group: 'door' }));
    out.push(act('decline_pay', C.ACT.declinePay, 0, { group: 'door' }));
    return out;
  }
  return out;
}

function morningActions(s) {
  const m = s.morning;
  const steps = morningSteps(s.n);
  const idx = steps.indexOf(m.step);
  const out = [];
  if (m.step === 'shop') {
    for (const h of R.HERBS) {
      const a = act('buy_herb', fill(C.ACT.buyHerb, null, { HERB: C.HERB_NAMES[h], X: countText(R.HERB_PRICE, 'coin') }), 0, { param: h, group: 'shop' });
      if (s.coins < R.HERB_PRICE) disable(a, C.WHY.noCoins);
      out.push(a);
    }

  }
  // утро 3: после улицы — не слух, а порог, где лежит киноварь (§23, раунд 22)
  const NEXT = { ...C.ACT.next, hook: s.n < 3 ? C.ACT.next.hook : C.ACT.next.hookLast, street: s.n < 3 ? C.ACT.next.street : C.ACT.next.streetLast };
  void idx;
  // книга, касса и записка — в любом порядке, каждая раз; улица — после всех трёх (§23, раунд 29)
  if (['ledger', 'cashbox'].includes(m.step)) {
    const seen = m.seen || {};
    if (!seen.cashbox) out.push(act('look', C.ACT.next.ledger, 0, { param: 'cashbox', group: 'morning' }));
    if (!seen.note) out.push(act('look', C.ACT.next.cashbox, 0, { param: 'note', group: 'morning' }));
    const nextPart = !seen.cashbox ? 'ledger' : 'cashbox';
    out.push(act('next', NEXT[nextPart], 0, { group: 'morning' }));
    return out;
  }
  out.push(act('next', NEXT[m.step], 0, { group: 'morning' }));
  return out;
}

// ── perform ──────────────────────────────────────────────────────────────────

export function perform(state, actionId, params = {}) {
  const r = performStep(state, actionId, params);
  if (r.ok) {
    heardNames(r.state, r.events);
    // последнее действие и его строки — в сохранении: после перезагрузки посреди строк остаток не теряется (§23, раунд 29)
    r.state.last = { step: r.state.seq, events: r.events };
    // правило на действии — до следующего шага; что стало известно этим шагом — событием (§23, раунд 28)
    r.state.ruleWarn = null;
    const st = r.state;
    if (st.phase === 'night' && st.night && !st.night.over) {
      const i = activeIndex(st);
      learnRules(st, r.events, actionsRaw(st), i === null ? null : spec(st, i), i === null ? null : st.night.recs[i]);
    }
  }
  return r;
}

const escRe = (t) => String(t).split('').map((c) => ('\\^$.*+?()[]{}|/'.includes(c) ? `\\${c}` : c)).join('');
/** Есть ли в тексте имя этого человека (в любом падеже), отдельным словом. */
function names(text, pid) {
  const forms = [C.PEOPLE[pid].name, ...Object.values(C.CASES[pid] || {})].filter(Boolean);
  return forms.some((f) => new RegExp(`(?<!\\p{L})${escRe(f)}(?!\\p{L})`, 'u').test(text));
}

/**
 * Имя, сказанное ученику кем угодно, делает человека известным по имени (§23, раунд 23): на карточке он — по имени.
 * Ночь 3: Мэй ждёт, и её при тебе назвали — дальше она «Мэй», а не «голос».
 */
function heardNames(s, ev) {
  if (!s.people) return;
  s.heard = s.heard || [];
  const nt = s.night;
  const mi = nt && s.n === 3 && s.phase === 'night' ? meiIndex(s) : -1;
  for (const e of ev) {
    if (!e.text || !['say', 'narrate'].includes(e.type)) continue;
    for (const pid of Object.keys(C.PEOPLE)) {
      if (!names(e.text, pid)) continue;
      if (e.type === 'say' && !s.heard.includes(pid)) s.heard.push(pid);
      if (pid === 'mei' && mi >= 0 && nt.meiWait && !nt.recs[mi].known) nt.recs[mi].known = true;
    }
  }
}

function performStep(state, actionId, params = {}) {
  setLang(langOf(state));
  let id = actionId;
  let param = params && (params.value ?? params.param ?? params.kind ?? params.topic);
  if (typeof id === 'string' && id.includes(':')) {
    const k = id.indexOf(':');
    param = id.slice(k + 1);
    id = id.slice(0, k);
  }
  const available = getActions(state);
  const a = available.find((x) => x.id === id && (x.param === undefined || x.param === param));
  if (!a) {
    return { state, events: [{ type: 'refused', text: C.WHY.notNow }], autosave: false, ok: false };
  }
  if (!a.enabled) {
    return { state, events: [{ type: 'refused', text: a.reason }], autosave: false, ok: false };
  }
  const s = id === 'new_game' ? newWorld(langOf(state)) : structuredClone(state);
  const ev = [];
  let autosave = false;
  if (id === 'self_mirror') {
    s.seq += 1;
    ev.push({ type: 'self', text: C.SELF[s.n], image: 'mirror_clear' });
    return { state: s, events: ev, autosave: false, ok: true };
  }
  if (id === 'new_game') {
    enterEvening(s, ev);
    s.seq = 1;
    return { state: s, events: ev, autosave: true, ok: true };
  }
  s.seq += 1;

  if (s.phase === 'evening') {
    beginNight(s, ev);
    return { state: s, events: ev, autosave: true, ok: true };
  }
  if (s.phase === 'morning') {
    autosave = doMorning(s, id, param, ev);
    return { state: s, events: ev, autosave, ok: true };
  }
  if (s.phase === 'night' && s.night.over) {
    computeMorning(s, ev);
    return { state: s, events: ev, autosave: true, ok: true };
  }

  const nt = s.night;
  const i = activeIndex(s);
  const rec = nt.recs[i];
  const sp = spec(s, i);
  const pid = sp.pid;
  const N = nameOf(pid);
  const visitsBefore = nt.recs.filter((r) => r.step === 'done').length;

  switch (id) {
    case 'open_hatch':
      openHatch(s, i, ev);
      if (blind(s)) rec.blind = true; // принят в темноте (огарок, зажжённый для главного гостя, — не темнота)
      break;
    case 'dont_open':
      rec.result = sp.type === 'patient' ? 'refused' : sp.type;
      if (sp.type === 'scene' && sp.debt) {
        s.debtKnown = true;
        ev.push({ type: 'narrate', text: C.SAY.debtSlip, image: 'receipt' });
      } else if (pid === 'wei') {
        ev.push({ type: 'narrate', text: C.DARK.weiUnopened, silentSteps: true, leaves: true });
      } else if (pid === 'bai') {
        ev.push({ type: 'narrate', text: C.DARK.baiUnopened, silentSteps: true, leaves: true }); // у неё шагов не бывает
      } else if (!(s.n === 3 && pid === 'mei' && weiPending(s))) {
        ev.push({ type: 'narrate', text: C.SAY.notOpened, leaves: true });
      }
      finishVisit(s, i, ev);
      break;
    case 'turn_to_waiting':
      nt.focus = 'waiting';
      // где она ждёт — там к ней и поворачиваешься; в темноте — только голос
      ev.push({ type: 'narrate', text: nt.meiWait && nt.meiWait.where === 'bench'
        ? (blind(s) ? C.SAY.turnBenchDark : C.SAY.turnBench)
        : (blind(s) ? C.SAY.turnEavesDark : C.SAY.turnEaves) });
      break;
    case 'let_wait':
      if (nt.focus === 'waiting') {
        nt.focus = 'door';
        ev.push({ type: 'narrate', text: nt.meiWait && nt.meiWait.where === 'bench' ? C.SAY.staysBench : C.SAY.backEaves, mei: nt.meiWait ? nt.meiWait.where : null });
      } else {
        const where = rec.letIn ? 'bench' : 'eaves';
        nt.meiWait = { i, where, undecided: true };
        ev.push({ type: 'narrate', text: blind(s) ? (meiKnown(s) ? C.CLIMAX.meiWaitsDarkKnown[where] : C.CLIMAX.meiWaitsDark[where]) : (weiHereNow(s) && C.CLIMAX.meiWaitsHere[`${where}_undecided`]) || C.CLIMAX.meiWaits[`${where}_undecided`], mei: where });
        nt.cur += 1;
        startKnock(s, ev);
        if (nt.cur >= nt.queue.length) {
          nt.focus = 'waiting';
          ev.push({ type: 'narrate', text: where === 'bench' ? C.SAY.nobodyBench : C.SAY.nobodyEaves });
          nt.nobodySaid = true;
        }
      }
      break;
    case 'close_hatch':
      if (sp.type === 'scene') {
        rec.result = 'scene';
        if (sp.debt) {
          s.debtKnown = true;
          ev.push({ type: 'show', slot: 'counter', image: 'receipt', text: C.SAY.receipt });
        }
      } else {
        rec.result = 'thanks';
      }
      ev.push({ type: 'sound', sound: 'hatch_close' });
      { const t = blind(s) ? darkSteps(s) : sp.leave; if (t) ev.push({ type: 'narrate', text: t, leaves: true }); } // в темноте — только шаги, раз за ночь
      finishVisit(s, i, ev);
      break;
    case 'take_gift': {
      rec.result = 'thanks';
      const gift = sp.gift;
      rec.gift = gift;
      if (gift.coins) nt.cash.push({ i, pid, coins: gift.coins, paper: false });
      if (gift.herb) s.herbs[gift.herb] += 1;
      // в темноте благодарящего не видно: плата ложится, имени нет
      { // в темноте «со звоном ложится плата» — раз за ночь (§23, раунд 27)
        const t = blind(s) && gift.coins && !gift.herb ? (routine(s, 'payDark', true) ? C.DARK.pay : null) : fill(blind(s) ? (gift.herb ? C.DARK.payHerb : C.DARK.pay) : sp.giftText, pid, sillVars(false));
        if (t) ev.push({ type: 'narrate', text: fill(t, pid, sillVars(false)), image: gift.coins ? 'coins' : gift.herb });
      }
      ev.push({ type: 'sound', sound: gift.coins ? 'coin' : 'paper' });
      ev.push({ type: 'sound', sound: 'hatch_close' });
      { const t = blind(s) ? darkSteps(s) : sp.leave; if (t) ev.push({ type: 'narrate', text: t, leaves: true }); } // в темноте — только шаги, раз за ночь
      finishVisit(s, i, ev);
      break;
    }
    case 'ask': {
      const free = param === 'home';
      const cost = free ? 0 : R.questionCost(rec.nAsked);
      rec.asked[param] = askPhase(s, pid); // при перемене (Вэй пришёл, Вэя не стало) можно спросить снова
      if (!free) rec.nAsked += 1;
      ev.push({ type: 'say', speaker: C.SAY.you, text: C.QUESTIONS[param].line });
      const ans0 = pickVariant(s, sp.answers[param]) || [].concat(sp.answers[param]).pop();
      // кто вошёл и видит циновку у стены — о доме говорит не как обычно (§23, «Реплика знает, что случилось»)
      const ans = param === 'home' && rec.letIn && sp.homeBody && (nt.bodies || []).some((p) => p !== pid) && !blind(s) ? { ...ans0, text: sp.homeBody } : ans0;
      const N = rec.known ? nameOf(pid) : C.DARK.voice; // в темноте отвечает голос, пока не назвался
      let text = fill(ans.text, pid);

      rec.said.push({ speaker: C.SAY.you, text: C.QUESTIONS[param].line });
      rec.said.push({ speaker: N, text });
      ev.push({ type: 'say', speaker: N, text });
      rec.seen[param] = { text, value: ans.value || null };
      addSign(rec, param, text, ans.value);
      spend(s, rec, cost, ev);
      break;
    }
    case 'tongue': {
      const id2 = rec.rinsed && sp.signs.tongueAfterRinse ? sp.signs.tongueAfterRinse : sp.signs.tongue;
      rec.seen.tongue = { image: id2, text: C.TONGUE[id2], value: id2 };
      addSign(rec, 'tongue', C.TONGUE[id2], id2, id2);
      ev.push({ type: 'sign', check: 'tongue', image: id2, text: C.TONGUE[id2], slot: 'grille' });
      spend(s, rec, R.COST.tongue, ev);
      break;
    }
    case 'pulse_rate':
    case 'pulse_depth': {
      const first = !rec.pulsed;
      rec.pulsed = true;
      if (first) {
        // рука — по ремеслу человека; серая рука в ночь 3 у всех одна и та же
        const own = ['warm', 'sweaty'].includes(sp.signs.arm) ? C.ARM_OF[pid] : null;
        const armText = sp.armText || own || C.ARM[sp.signs.arm];
        // у каждого гостя своя рука в каждом состоянии (§23, раунд 31): armImage — <гость>_<состояние>,
        // один id на обе группы: arms_of (ставень) и arms_close_of (экран пульса); image — состояние, как было
        const armImage = `${pid}_${sp.signs.arm}`;
        rec.seen.arm = { image: sp.signs.arm, text: armText, armImage };
        ev.push({ type: 'sound', sound: 'arm_door' });
        ev.push({ type: 'sign', check: 'arm', image: sp.signs.arm, armImage, text: armText, slot: 'arm', touch: 'wrist' });
        addSign(rec, 'arm', armText, sp.signs.arm, sp.signs.arm);
        if (sp.wrist) ev.push({ type: 'narrate', text: sp.wrist, sound: sp.wristSound || null, touch: 'wrist' });
      }
      if (id === 'pulse_rate') {
        // после отдыха у лампы пульс честный: отдышался, рука отогрелась
        const v = rec.rested && sp.signs.rateAfterRest ? sp.signs.rateAfterRest : sp.signs.rate;
        const text = C.RATE[v] + (sp.weak ? C.WEAK : '');
        rec.seen.pulse_rate = { text, value: v };
        addSign(rec, 'pulse_rate', text, v);
        ev.push({ type: 'sign', check: 'pulse_rate', text, image: 'our_hand', slot: 'arm', touch: 'wrist' });
        spend(s, rec, R.pulseCost(s.n, rec.letIn), ev);
      } else {
        const v = rec.rested && sp.signs.depthAfterRest ? sp.signs.depthAfterRest : sp.signs.depth;
        const text = C.DEPTH[v] + (sp.weak && !rec.seen.pulse_rate ? C.WEAK : '');
        rec.seen.pulse_depth = { text, value: v };
        addSign(rec, 'pulse_depth', text, v);
        ev.push({ type: 'sign', check: 'pulse_depth', text, image: 'our_hand', slot: 'arm', touch: 'wrist' });
        spend(s, rec, R.pulseCost(s.n, rec.letIn), ev);
      }
      break;
    }
    case 'mirror': {
      const m = C.MIRROR[sp.signs.mirror];
      rec.seen.mirror = { image: m.image, text: m.text, value: sp.signs.mirror };
      addSign(rec, 'mirror', m.text, sp.signs.mirror, m.image);
      ev.push({ type: 'sign', check: 'mirror', image: m.image, text: m.text, slot: 'mirror' });
      spend(s, rec, R.COST.mirror, ev);
      break;
    }
    case 'rinse': {
      rec.rinsed = true;
      ev.push({ type: 'show', slot: 'drawer', image: 'drawer_open', text: C.SAY.rinseDrawer });
      ev.push({ type: 'sound', sound: 'rinse' });
      ev.push({ type: 'narrate', text: fill(rec.letIn ? C.SAY.rinseInside : C.SAY.rinseHatch, pid) });
      const id2 = sp.signs.tongueAfterRinse || sp.signs.tongue;
      rec.seen.tongue = { image: id2, text: C.TONGUE[id2], value: id2 };
      addSign(rec, 'rinse', fill(C.SAY.afterRinse, pid, { TONGUE: C.SEEN_FORM.tongue[id2] }), id2, id2);
      ev.push({ type: 'sign', check: 'tongue', image: id2, text: C.TONGUE[id2], slot: 'grille' });
      spend(s, rec, R.COST.rinse, ev);
      break;
    }
    case 'let_in':
      rec.letIn = true;
      // Мэй ждала под навесом и вошла — теперь она в комнате, на лавке
      if (nt.meiWait && nt.meiWait.i === i) nt.meiWait.where = 'bench';
      // свёрток уже завёрнут: впустить, чтобы выпил при тебе, — и сразу к выдаче
      rec.step = rec.step === 'handover' ? 'handover' : 'inside';
      if (sp.truth && sp.truth.kind !== 'living') {
        nt.nonhumanInside = true;
        s.others[pid].insideNights.push(s.n);
      }
      ev.push({ type: 'sound', sound: 'door_bolt' });
      // на табурете земля — её сметают прежде, чем гость войдёт и сядет (строкой раньше, §23)
      if (nt.earth && !nt.earthSwept) { nt.earthSwept = true; ev.push({ type: 'narrate', text: fill(blind(s) ? C.BODY.earthSweepDark : C.BODY.earthSweep, pid) }); }
      // кто вошёл после смерти в комнате — видит тело у стены
      ev.push({ type: 'narrate', text: insideWithMei(s, sp), ...(nt.meiWait && nt.meiWait.i === i ? { mei: 'bench' } : { seats: true }) });
      if (s.n === 3 && pid === 'wei') meiLine(s, ev, C.CLIMAX.weiEnters);
      ev.push({ type: 'show', slot: 'stool', image: sp.seated });
      spend(s, rec, nt.candle && isMain(s, pid) ? 0 : R.COST.let_in, ev);
      break;
    case 'rest': {
      rec.rested = true;
      // земля на табурете — сметают в ту минуту, когда на табурет садятся, не позже (§23, раунд 16)
      if (nt.earth && !nt.earthSwept) { nt.earthSwept = true; ev.push({ type: 'narrate', text: fill(blind(s) ? C.BODY.earthSweepDark : C.BODY.earthSweep, pid) }); }
      const r = R.restReading(sp.truth);
      const text = C.REST[r];
      rec.seen.rest = { text, value: r };
      addSign(rec, 'rest', text, r);
      // «снова берёшь запястье» — только если его уже брали (§23, раунд 25)
      ev.push({ type: 'narrate', text: fill(rec.seen.pulse_rate || rec.seen.pulse_depth ? C.NIGHT_EVENTS.restStart : C.NIGHT_EVENTS.restStartFirst, pid), seats: true });
      ev.push({ type: 'sign', check: 'rest', text, image: 'our_hand', slot: 'arm', touch: 'wrist' });
      // отдых отвечает только на степень; пульс перечитывается, лишь если за него уже платили
      const after = sp.signs.rateAfterRest;
      if (after && after !== sp.signs.rate && rec.seen.pulse_rate) {
        const t2 = fill(C.SAY.restRate, pid, { RATE: C.RATE[after] });
        rec.seen.pulse_rate = { text: t2, value: after };
        addSign(rec, 'pulse_rate', t2, after);
        ev.push({ type: 'sign', check: 'pulse_rate', text: t2, image: 'our_hand', slot: 'arm' });
      }
      const afterD = sp.signs.depthAfterRest;
      if (afterD && afterD !== sp.signs.depth && rec.seen.pulse_depth) {
        const t3 = fill(C.SAY.restDepth, pid, { DEPTH: C.SEEN_FORM.pulse_depth[afterD] });
        rec.seen.pulse_depth = { text: t3, value: afterD };
        addSign(rec, 'pulse_depth', t3, afterD);
        ev.push({ type: 'sign', check: 'pulse_depth', text: t3, image: 'our_hand', slot: 'arm' });
      }
      // первый отдых за ночь: пока гость сидит у лампы, ты подрезаешь фитиль — огонь ровнее, ложка сбережена
      const wick = !nt.wick;
      // фитиль подрезан при первом отдыхе каждой ночи — строка каждый раз, как обещала кнопка (§23, раунд 23)
      if (wick) { nt.wick = true; ev.push({ type: 'narrate', text: fresh(s, [C.NIGHT_EVENTS.wick, C.NIGHT_EVENTS.wickAgain]) }); }
      spend(s, rec, R.COST.rest - (wick ? R.WICK : 0), ev);
      break;
    }
    case 'board_temp':
      rec.board.temp = param;
      ev.push({ type: 'board', temp: param, loc: rec.board.loc, drawer: R.herbFor(param, rec.board.loc) });
      break;
    case 'board_loc':
      rec.board.loc = param;
      ev.push({ type: 'board', temp: rec.board.temp, loc: param, drawer: R.herbFor(rec.board.temp, param) });
      break;
    case 'to_scales':
      rec.backTo = rec.step;
      rec.step = 'scales';
      ev.push({ type: 'sound', sound: 'scales' });
      if (blind(s)) { const t = routine(s, 'scalesDark', C.DARK.scales); if (t) ev.push({ type: 'narrate', text: t }); }
      else { const t = routine(s, 'scales', C.SAY.toScales); if (t) ev.push({ type: 'narrate', text: t }); }
      // медная банка — один раз за приём: второй раз к весам — без неё
      if (!blind(s) && !rec.jarShown) {
        rec.jarShown = true;
        let jar = rec.letIn ? fresh(s, [fill(sp.reflectionInside || C.REFLECTION_INSIDE, pid), sp.reflectionInsideAgain]) : (nt.candle && sp.reflectionCandle) || fresh(s, [sp.reflection, sp.reflectionAgain]);
        // ночь 3: Вэй у окошка, а Мэй — на лавке у тебя за спиной: банка показывает и её
        if (s.n === 3 && pid === 'wei' && !rec.letIn && meiSpotNow(s) === 'bench') jar = nt.candle ? C.CLIMAX.jarMei.candle : C.CLIMAX.jarMei.lamp;
        ev.push({ type: 'narrate', text: jar, image: 'scales' });
      }
      break;
    case 'back':
      rec.step = rec.backTo || (rec.letIn ? 'inside' : 'hatch');
      ev.push({ type: 'narrate', text: C.SAY.fromScales });
      break;
    case 'herb':
      rec.packet.herb = param === 'none' ? null : param;
      if (param !== 'none') ev.push({ type: 'show', slot: 'scales', image: param, text: fill(C.SAY.onScales, null, { HERB: C.HERB_NAMES[param] }) });
      break;
    case 'dose':
      rec.packet.dose = param;
      if (param !== 'none') ev.push({ type: 'show', slot: 'scales', image: s.poison.vial ? 'vial' : `jar_poison_${s.poison.pinches}`, text: param === 'pinch' ? C.SAY.pinch : C.SAY.measure });
      break;
    case 'wrap':
      if (sp.truth && sp.truth.kind === 'living') {
        // для записки Лю: был ли нужный ящик пуст, когда ты отвешивал
        const right = R.herbFor(sp.truth.temp, sp.truth.loc);
        rec.drawerEmpty = rec.packet.herb !== right && s.herbs[right] <= 0;
      }
      if (rec.packet.herb) s.herbs[rec.packet.herb] -= 1;
      if (rec.packet.dose === 'pinch') s.poison.pinches -= 1;
      if (rec.packet.dose === 'measure') s.poison.pinches -= 3;
      rec.wrapped = true;
      rec.wrapBlind = blind(s); // свёрток собран на ощупь — для записки Лю (что он мог слышать)
      rec.step = 'handover';
      ev.push({ type: 'sound', sound: 'paper' });
      { const t = routine(s, 'wrap', C.SAY.wrap); if (t) ev.push({ type: 'narrate', text: t, image: 'packet' }); }
      break;
    case 'give_home':
      rec.delivery = 'home';
      rec.result = 'packet';
      if (sp.afterScales && !rec.letIn) ev.push({ type: 'narrate', text: sp.afterScales }); // «под карнизом» — только у окошка
      { const t = routine(s, rec.letIn ? 'giveInside' : 'giveHatch', fill(rec.letIn ? C.SAY.giveInside : C.SAY.giveHatch, pid)); if (t) ev.push({ type: 'narrate', text: t, image: 'packet' }); }
      if (s.n === 3 && pid === 'wei') {
        const k = rec.packet.dose === 'measure' ? 'measure_home' : rec.packet.dose === 'pinch' ? 'pinch_home' : 'herb_home';
        ev.push({ type: 'narrate', text: blind(s) ? C.CLIMAX.wei.dark : C.CLIMAX.wei[k] });
        meiLine(s, ev, C.CLIMAX.meiSeesHome[k]);
      }
      if (s.n === 3 && pid === 'mei' && !blind(s)) {
        const k = rec.packet.dose === 'none' ? 'herb' : rec.packet.dose;
        ev.push({ type: 'narrate', text: weiGoneNow(s) ? C.CLIMAX.meiPacketAfter[k] : C.CLIMAX.meiPacket[k] });
      }
      toPayment(s, rec, sp, ev);
      break;
    case 'give_drink': {
      rec.delivery = 'drink';
      rec.result = 'packet';
      if (sp.afterScales && !rec.letIn) ev.push({ type: 'narrate', text: sp.afterScales }); // «под карнизом» — только у окошка
      const oc = R.resolve(sp.truth, rec.packet);
      rec.drink = oc;
      ev.push({ type: 'sound', sound: 'pour' });
      ev.push({ type: 'narrate', text: C.SAY.pour, image: 'cup' });
      const pool = C.DRINK[oc.code] || C.DRINK.no_effect;
      // горячая щепоть тому, кто горит у самого края, убивает сразу — здесь, на табурете (§23)
      const diesHere = oc.code === 'pinch_heat' && oc.deg >= R.GONE;
      if (diesHere) rec.drink = { ...oc, diedHere: true };
      // Мэй пьёт, когда Вэя уже нет, — иначе, чем при нём
      const meiAfter = s.n === 3 && pid === 'mei' && weiGoneNow(s) && C.CLIMAX.meiDrinkAfter[oc.code];
      const byCandle = nt.candle && sp.drinkCandle && sp.drinkCandle[oc.code]; // при огарке — свет свечной
      const t = blind(s) ? (rec.known ? C.DARK.drinkKnown : C.DARK.drink) : (diesHere ? (C.DRINK_DIES_HERE[pid] || C.DRINK.pinch_heat_dead[0]) : meiAfter || byCandle || (oc.code === 'revealed' && s.others[pid] && s.others[pid].revealed && sp.drink && sp.drink.revealed_again) || (sp.drink && sp.drink[oc.code]) || (oc.code === 'killed' && C.DRINK_KILLED[pid]) || fresh(s, [...pool.slice((i + s.n) % pool.length), ...pool.slice(0, (i + s.n) % pool.length)]));
      // строка, после которой картинка другая: на табурете земля (earth) или тело (body) — интерфейс меняет её здесь, не раньше
      // для картинки (§23, раунд 29): строку о том, как гость пьёт, — на гостя (at: 'guest'); с неживого сыплется земля —
      // reveal: 'earth'; у живого после щепоти или меры меняется лицо — reveal: 'face' и какой (faceKind)
      const FACE = { pinch_heat: 'flush', overdose: 'pale', held_pinch: 'held', returned: 'better', killed: 'dies' };
      const living = sp.truth && sp.truth.kind === 'living';
      const poisoned = rec.packet.dose === 'pinch' || rec.packet.dose === 'measure';
      const reveal = oc.code === 'revealed' ? { reveal: 'earth' } : living && poisoned && (diesHere || FACE[oc.code]) ? { reveal: 'face', faceKind: diesHere ? 'dies' : FACE[oc.code] } : {};
      if (reveal.reveal === 'earth') nt.revealed = 'earth';
      ev.push({ type: 'narrate', text: fill(t, pid), at: 'guest', ...reveal, ...(oc.code === 'destroyed' ? { earth: true, leaves: true } : (oc.code === 'killed' || diesHere) ? { body: true } : {}) });
      // тело на табурете — до строки, где его переносят (для картинки; верно и после загрузки — §23, раунд 24)
      if (oc.code === 'killed' || diesHere) nt.bodyOnStool = pid;
      // ночь 3: Вэй пьёт при тебе — что делает Мэй
      if (s.n === 3 && pid === 'wei' && C.CLIMAX.meiSees[oc.code]) meiLine(s, ev, C.CLIMAX.meiSees[oc.code]);
      if (oc.code === 'killed' || oc.code === 'destroyed' || diesHere) {
        if (oc.code === 'destroyed') s.others[pid].destroyed = true;
        // тело в комнате: ученик его переносит, и об этом есть строка (§23, «Реплика знает, что случилось»)
        nt.bodies = nt.bodies || [];
        if (oc.code === 'killed' || diesHere) {
          // ночь 3: Мэй ждёт на лавке и видит, как на табурете умер другой
          if (s.n === 3 && pid !== 'mei' && pid !== 'wei') meiLine(s, ev, C.CLIMAX.meiSeesDeath);
          nt.bodies.push(pid);
          if (!(s.n === 3 && pid === 'mei' && weiPending(s))) {
            ev.push({ type: 'narrate', text: fill(blind(s) ? C.BODY.moveDark : C.BODY.move, pid), bodyMoved: true });
            // у стены под циновкой — до конца ночи; known — знает ли ученик, кто там
            nt.bodyOnStool = null;
            nt.bodyAtWall = { known: !!rec.known };
          }
        } else {
          nt.earth = true;
          nt.meiSawEarth = s.n === 3 && meiSpotNow(s) === 'bench'; // Мэй на лавке видела, как он рассыпался
          // в темноте землю нащупывают; при свете её видно в строке о том, как он пьёт, — повторять не надо (раунд 21)
          if (blind(s)) ev.push({ type: 'narrate', text: C.BODY.earthDark, earth: true });
          if (s.n === 3 && pid === 'wei') meiLine(s, ev, C.CLIMAX.meiAfterEarth);
        }
        ev.push({ type: 'show', slot: 'stool', image: null });
        finishVisit(s, i, ev);
      } else if (oc.code === 'overdose' || oc.code === 'pinch_heat') {
        if (!(s.n === 3 && pid === 'mei' && weiPending(s))) ev.push({ type: 'narrate', text: fill(blind(s) ? (rec.known ? C.DARK.harmedLeavesKnown : C.DARK.harmedLeaves) : (C.HARMED_LEAVES_OF[pid] || C.HARMED_LEAVES), pid), leaves: true, at: 'guest' });
        finishVisit(s, i, ev);
      } else {
        toPayment(s, rec, sp, ev);
      }
      break;
    }
    case 'take_pay': {
      const pay = sp.pay || { coins: R.FEE };
      if (pay.coins) nt.cash.push({ i, pid, coins: pay.coins, paper: !!(sp.truth && sp.truth.kind !== 'living') });
      if (pay.herb) {
        s.herbs[pay.herb] += 1;
        // что за пучок — говорят, когда его берут
        ev.push({ type: 'narrate', text: fill(blind(s) ? C.SAY.herbPayDark : C.SAY.herbPay, null, { HERB: C.HERB_NAMES[pay.herb] }) });
      }
      rec.paid = pay;
      ev.push({ type: 'sound', sound: pay.coins ? 'coin' : 'paper' });
      leave(s, i, sp, ev);
      finishVisit(s, i, ev);
      break;
    }
    case 'decline_pay':
      rec.paid = null;
      s.declines = (s.declines || 0) + 1;
      // плату не рассказали — отказ сам говорит, что монеты протянули (§23, раунд 27)
      ev.push({ type: 'narrate', text: fill(blind(s) ? C.DARK.decline : rec.payQuiet ? C.DECLINE_QUIET[(s.declines - 1) % C.DECLINE_QUIET.length] : C.DECLINE[(s.declines - 1) % C.DECLINE.length], pid) });
      leave(s, i, sp, ev);
      finishVisit(s, i, ev);
      break;
    case 'refuse':
      rec.result = 'refused';
      ev.push({ type: 'sound', sound: rec.letIn ? 'door_bolt' : 'hatch_close' });
      if (s.n === 3 && pid === 'wei') {
        const deadMei = meiSpotNow(s) === 'dead';
        ev.push({ type: 'narrate', text: rec.letIn ? (blind(s) ? C.CLIMAX.wei.refused_inside_dark : deadMei ? C.CLIMAX.wei.refused_inside_dead : C.CLIMAX.wei.refused_inside) : C.CLIMAX.wei.refused, ...(rec.letIn ? { leaves: true } : {}) });
      }
      else if (s.n === 3 && pid === 'mei' && weiPending(s)) { /* Мэй остаётся ждать — сцена в finishVisit */ }
      else if (s.n === 3 && pid === 'mei') {
        // «— Мэй. Пора.»: она уходит к нему — своя сцена, у окошка или с лавки
        const where = nt.meiWait && nt.meiWait.i === i ? nt.meiWait.where : rec.letIn ? 'bench' : 'eaves';
        // Вэя уже нет — она уходит одна; иначе — к нему, на голос (и всё это — при том свете, какой есть)
        const spotKey = where === 'bench' ? 'bench' : 'eaves';
        const text = weiGoneNow(s)
          ? (blind(s) ? C.DARK.meiLeavesAlone : C.CLIMAX.meiLeaves[meiGoneKey(s, where)])
          // он ждёт на улице: позвал её («Мэй. Пора.») — она уходит на голос; унёс свёрток и молчит — к нему, без голоса
          : (blind(s) ? C.CLIMAX.meiGoesDark : C.CLIMAX.meiGoes[weiCalled(s) ? spotKey : `${spotKey}_silent`]);
        ev.push({ type: 'narrate', text, mei: 'street', leaves: true });
      } else { const t = refusedLine(s, rec, sp); if (t) ev.push({ type: 'narrate', text: t, leaves: true, ...quietOf(pid) }); }
      finishVisit(s, i, ev);
      break;
    default:
      throw new Error(`unknown action: ${id}`);
  }
  const visitsAfter = s.night ? s.night.recs.filter((r) => r.step === 'done').length : visitsBefore;
  autosave = visitsAfter > visitsBefore;
  return { state: s, events: ev, autosave, ok: true };
}

/** {SILL}, {SILL_CAP}: куда ложатся деньги — на подоконник у окошка, на прилавок в комнате. */
function sillVars(inside) {
  return inside ? { SILL: C.SAY.counter, SILL_CAP: C.SAY.counterCap } : { SILL: C.SAY.sill, SILL_CAP: C.SAY.sillCap };
}

/** Не живые не ходят: строка об уходе — с пометкой для звука (интерфейс не читает слов). */
function quietOf(pid) {
  const p = C.PEOPLE[pid];
  return p && p.start && p.start.kind !== 'living' ? { silentSteps: true } : {};
}

function toPayment(s, rec, sp, ev) {
  rec.step = 'payment';
  const pay = sp.pay || { coins: R.FEE };
  rec.payBlind = blind(s);
  // куда ложится плата — переменная шаблона, а не правка готовой строки: у окошка подоконник, у впущенного прилавок
  // плату живого монетами рассказывают первый раз за ночь; иначе — плата травой, холодные монеты не живого, темнота — всегда
  const plain = pay.coins && !pay.herb && sp.truth && sp.truth.kind === 'living';
  // в темноте — тоже раз за ночь: «на подоконник со звоном ложится плата» не повторяется (§23, раунд 27)
  const told = plain || (blind(s) && pay.coins && !pay.herb) ? routine(s, blind(s) ? 'payDark' : 'pay', true) : true;
  const offer = { image: pay.coins ? 'coins' : pay.herb, offer: pay.coins ? { coins: pay.coins } : { herb: pay.herb } };
  rec.payQuiet = !told;
  if (!told) { ev.push({ type: 'show', slot: 'counter', text: null, ...offer }); return; }
  const text = fill(blind(s) ? (pay.herb ? C.DARK.payHerb : C.DARK.pay) : fresh(s, [sp.payText, sp.payAgain]) || C.SAY.payDefault, sp.pid, sillVars(rec.letIn));
  ev.push({ type: 'narrate', text, ...offer });
}

function leave(s, i, sp, ev) {
  ev.push({ type: 'sound', sound: 'hatch_close' });
  if (s.n === 3 && sp.pid === 'mei') {
    if (weiPending(s)) return; // она ждёт — сцену скажет finishVisit
    const w = weiIndex(s);
    if (w >= 0) {
      // она видела всё с лавки — или стояла под навесом
      let k = weiChoice(s);
      const nt = s.night;
      const where = nt.seated === i ? 'bench' : nt.meiWait && nt.meiWait.i === i ? nt.meiWait.where : nt.recs[i].letIn ? 'bench' : 'eaves';
      if (k === 'destroyed') k = meiGoneKey(s, where);
      // Вэя уже нет (земля на табурете) — в темноте она уходит одна, не разговаривая ни с кем (§23, раунд 27)
      ev.push({ type: 'narrate', text: blind(s) ? (s.others.wei.destroyed ? C.DARK.meiLeavesAlone : C.DARK.meiLeaves) : C.CLIMAX.meiLeaves[k], mei: 'street', leaves: true });
      return;
    }
  }
  // уход Вэя — в сцене Мэй; если она ещё не решена (ждёт), он выходит на улицу и ждёт её — об этом строка
  const meiSeated = s.night.seated !== null && s.night.queue[s.night.seated].pid === 'mei';
  if (s.n === 3 && sp.pid === 'wei' && ((s.night.meiWait && s.night.meiWait.undecided) || meiSeated) && !blind(s)) { ev.push({ type: 'narrate', text: s.night.recs[i].letIn && sp.leaveInside ? sp.leaveInside : sp.leave, leaves: true }); return; }
  if (s.n === 3 && sp.pid === 'wei' && (s.night.meiWait || meiWhere(s) === null)) return;
  const rec = s.night.recs[i];
  if (blind(s)) { const t = quietOf(sp.pid).silentSteps ? C.DARK.weiLeave : darkSteps(s); if (t) ev.push({ type: 'narrate', text: t, leaves: true, ...quietOf(sp.pid) }); return; }
  if (rec.delivery === 'drink') {
    ev.push({ type: 'narrate', text: fill(C.DRINK_LEAVES[(i + s.n) % C.DRINK_LEAVES.length], sp.pid), leaves: true, ...quietOf(sp.pid) });
    return;
  }
  ev.push({ type: 'narrate', text: fresh(s, [sp.leave, sp.leaveAgain]), leaves: true, ...quietOf(sp.pid) });
}

// ── Утро ─────────────────────────────────────────────────────────────────────

function doMorning(s, id, param, ev) {
  const m = s.morning;
  if (id === 'buy_herb') {
    s.coins -= R.HERB_PRICE;
    s.herbs[param] += 1;
    m.bought.push(param);
    ev.push({ type: 'sound', sound: 'coin' });
    ev.push({ type: 'narrate', text: fill(C.SHOP.boughtHerb, null, { HERB: C.HERB_NAMES[param] }) });
    return true;
  }
  // книга, касса, записка — в любом порядке (look:cashbox, look:note); next — к первой ещё не открытой (§23, раунд 29)
  if (id === 'look' || (id === 'next' && ['ledger', 'cashbox'].includes(m.step))) {
    m.seen = m.seen || {};
    const part = id === 'look' ? param : !m.seen.cashbox ? 'cashbox' : 'note';
    if (!m.seen[part]) {
      m.seen[part] = true;
      const r = m.report;
      if (part === 'cashbox') {
        ev.push({ type: 'sound', sound: 'coins' });
        for (const line of r.cashbox.lines) ev.push({ type: 'narrate', text: line, image: 'cashbox' });
      } else {
        ev.push({ type: 'sound', sound: 'stair_door' });
        ev.push({ type: 'note', text: r.note, image: 'note' });
      }
    }
    m.step = m.seen.cashbox && m.seen.note ? 'note' : m.seen.cashbox ? 'cashbox' : 'ledger';
    return true;
  }
  // next
  const steps = morningSteps(s.n);
  const idx = steps.indexOf(m.step);
  if (idx < steps.length - 1) {
    m.step = steps[idx + 1];
    const r = m.report;
    if (m.step === 'cashbox') {
      ev.push({ type: 'sound', sound: 'coins' });
      for (const line of r.cashbox.lines) ev.push({ type: 'narrate', text: line, image: 'cashbox' });
    }
    if (m.step === 'note') {
      ev.push({ type: 'sound', sound: 'stair_door' });
      ev.push({ type: 'note', text: r.note, image: 'note' });
    }
    if (m.step === 'street') {
      ev.push({ type: 'sound', sound: 'shutters' });
      ev.push({ type: 'show', slot: 'street', image: r.street.image, text: r.street.caption });
      for (const p of r.street.props) ev.push({ type: 'show', slot: 'prop', image: p.image, text: p.text });
    }
    if (m.step === 'shop') ev.push({ type: 'narrate', text: C.SHOP.introBy[s.n] || C.SHOP.intro });
    if (m.step === 'hook') ev.push({ type: 'narrate', text: r.hook, image: s.n === 3 ? 'cinnabar_trace' : null });
    return true;
  }
  // последний шаг утра
  if (s.n < 3) {
    s.n += 1;
    s.morning = null;
    enterEvening(s, ev);
    return true;
  }
  s.phase = 'end';
  s.closing = closingCard(s);
  s.morning = null;
  ev.push({ type: 'phase', phase: 'end' });
  ev.push({ type: 'card', title: s.closing.title, lines: s.closing.lines, rows: s.closing.rows });
  return true;
}
