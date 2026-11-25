// Утро: применяет таблицу исходов к ночи, пишет книгу приёма, кассу, записку Лю, улицу.
import { fillByMorning } from './sheets.js';
import { C } from './lang.js';
import * as R from './rules.js';
import { specOf, planReturns, nightSpoils, buildQueue } from './visit.js';
import { readSign } from './map.js';
import { fill, countText, joinList, grams4 } from './text.js';

export function morningSteps(n) {
  // условие следующей ночи (крючок) — раньше покупок
  return n < 3
    ? ['ledger', 'cashbox', 'note', 'street', 'hook', 'shop']
    : ['ledger', 'cashbox', 'note', 'street', 'hook'];
}

/**
 * Строка о лампе ночи n — сходится с числом до ложки: −1 руки, −2 холод в комнате, +2 бутыль Лю.
 * when: 'evening' — лампу заправили; 'night' — что налито было вечером; 'morning' — что будет вечером (ещё не заправлена).
 */
export function lampNote(n, coldRoom, oil, bottle = true, taught = false, night = false, when = night ? 'night' : 'evening') {
  const L = C.LAMP_NOTE;
  const X = countText(oil, 'spoon');
  if (n === 1) return fill(when === 'night' ? L.firstEvening : L.first, null, { X });
  const morning = when === 'morning';
  const lines = [morning ? (n === 3 ? L.weakerNext3 : L.weakerNext) : n === 3 ? L.weaker3 : L.weaker];
  if (coldRoom) lines.push(morning ? L.coldNext : L.cold);
  if (n === 3 && bottle) lines.push(morning ? L.bottleNext : L.bottle);
  lines.push(fill(morning ? L.totalNext : when === 'night' ? L.totalEvening : L.total, null, { X }));
  return lines.join(' ');
}

export function packetOf(rec) {
  if (rec.result === 'refused') return { refused: true };
  if (rec.result === 'unreceived') return { unreceived: true };
  return { herb: rec.packet.herb, dose: rec.packet.dose };
}

/** Что было в свёртке — целым шаблоном языка (трава, щепоть, мера; «выпил при тебе» — тоже шаблон). */
export function packetText(packet, delivery, pid) {
  const dose = packet.dose === 'pinch' || packet.dose === 'measure' ? packet.dose : null;
  const key = packet.herb ? (dose ? `herb_${dose}` : 'herb') : dose || 'empty';
  const t = fill(C.PACKET[key], pid, { HERB: packet.herb ? C.HERB_NAMES[packet.herb] : '' });
  return delivery === 'drink' ? fill(C.PACKET.drink, pid, { PACKET: t }) : t;
}

export function leftText(pinches) {
  return C.LEFT[Math.max(0, Math.min(3, pinches))];
}

/** Что стало с Мэй (одни и те же слова везде; разные — с Вэем рядом и без него). */
export function meiVerdict(p, weiGone) {
  if (p.killed) return 'killed';
  if (p.deg >= R.GONE) return 'gone';
  if (p.deg === 4) return weiGone ? 'slipped_alone' : 'slipped_with';
  if (p.deg === 3) return weiGone ? 'held_alone' : 'held_with';
  return 'returned';
}

/** Утренняя примета: у каждого их несколько, и одна не повторяется в разные утра. */
function factFor(s, pid, grp) {
  const list = C.FACTS[pid][grp];
  s.factUse = s.factUse || {};
  const k = `${pid}:${grp}`;
  const n = s.factUse[k] || 0;
  s.factUse[k] = n + 1;
  return list[Math.min(n, list.length - 1)];
}

function factGroup(before, after, killed) {
  if (killed || after >= R.GONE) return 'gone';
  if (after < before) return 'better';
  if (after === before) return 'same';
  return 'worse';
}

/** Утро после ночи s.n. Меняет s; кладёт события в ev. */
export function computeMorning(s, ev) {
  const n = s.n;
  const nt = s.night;
  const before = {};
  for (const pid of Object.keys(s.people)) before[pid] = { deg: s.people[pid].deg, killed: s.people[pid].killed };

  // 1. Таблица исходов
  const rows = [];
  for (let i = 0; i < nt.queue.length; i++) {
    const entry = nt.queue[i];
    const rec = nt.recs[i];
    const sp = specOf(entry);
    const pid = entry.pid;
    const row = { i, n, entry, rec, sp, pid, oc: null, degBefore: entry.truth ? entry.truth.deg : null };
    rows.push(row);
    if (sp.type !== 'patient') continue;
    const oc = rec.drink || R.resolve(entry.truth, packetOf(rec));
    row.oc = oc;
    if (entry.truth.kind === 'living') {
      const p = s.people[pid];
      if (oc.killed) p.killed = true;
      else p.deg = oc.deg;
      p.last = oc.code;
      p.lastCell = { temp: entry.truth.temp, loc: entry.truth.loc };
      p.unopened = rec.result === 'refused' && !rec.nameKnown;
    } else {
      const o = s.others[pid];
      if (oc.revealed) { o.revealed = true; o.course += 1; }
      if (oc.fed) o.fed = true;
      if (oc.destroyed) o.destroyed = true;
    }
  }

  // 2. Мертвец в доме: в ночь 3, если Вэй не рассеян, он увёл Мэй на шаг.
  let verdict = null;
  const meiRow = rows.find((r) => r.pid === 'mei' && r.sp.type === 'patient');
  if (n === 3 && meiRow) {
    const mei = s.people.mei;
    if (!mei.killed && !s.others.wei.destroyed) mei.deg = R.deadInHouse(mei.deg);
  }
  if (n === 3 && meiRow) verdict = meiVerdict(s.people.mei, s.others.wei.destroyed);

  const deaths = rows.filter((r) => r.sp.type === 'patient' && r.entry.truth.kind === 'living' && r.pid !== 'mei'
    && (s.people[r.pid].killed || (s.people[r.pid].deg >= R.GONE && r.degBefore < R.GONE)))
    .map((r) => ({ pid: r.pid, i: r.i, letIn: !!r.rec.letIn, known: !!r.rec.known, cause: deathCause(r), vars: r.rec.packet && r.rec.packet.herb ? herbErr(r.rec.packet.herb, r.entry.truth).vars : {} }));
  // Вэй унёс меру домой — Мэй ушла с ним и утром одна за их столом (§23)
  const weiRow3 = n === 3 ? rows.find((r) => r.pid === 'wei') : null;
  const weiHome = !!(s.others.wei.destroyed && weiRow3 && weiRow3.rec.result === 'packet' && weiRow3.rec.delivery === 'home');
  const meiCase = n === 3 && meiRow ? meiCaseOf(meiRow.rec, s.others.wei.destroyed, meiRow.entry.truth, weiHome) : null;
  const meiWrong = n === 3 && meiRow ? meiWrongOf(meiRow.rec, meiRow.entry.truth) : '';
  const meiDiedHere = n === 3 && meiRow && meiRow.rec.delivery === 'drink' && s.people.mei.killed;
  const meiSight = n === 3 && meiRow ? meiSightKey(verdict, meiCase, weiHome) : null;

  // 3. Кто вернётся следующей ночью — обещание в книге выполняется.
  const outcomes = rows.map((r) => ({
    i: r.i, pid: r.pid, mode: r.entry.mode, type: r.sp.type,
    code: r.oc ? r.oc.code : r.sp.type,
    returns: r.oc ? r.oc.returns : null,
    worse: !!(r.oc && r.entry.truth.kind === 'living'
      && (s.people[r.pid].killed || s.people[r.pid].deg > r.degBefore)),
    result: r.rec.result, packet: { ...r.rec.packet }, delivery: r.rec.delivery, blind: !!r.rec.blind, letIn: !!r.rec.letIn, degBefore: r.degBefore,
    // место к утру (для книги и проверки лестницы): живой — его место, умер — GONE
    degAfter: r.oc && r.entry.truth.kind === 'living' ? (s.people[r.pid].killed ? R.GONE : Math.min(R.GONE, s.people[r.pid].deg)) : null,
    cell: r.entry.truth && r.entry.truth.kind === 'living' ? { temp: r.entry.truth.temp, loc: r.entry.truth.loc } : null,
  }));
  const plan = n < 3 ? planReturns(n + 1, outcomes, s.people) : null;
  if (plan) {
    s.returnPlan = s.returnPlan || {};
    s.returnPlan[n + 1] = plan;
  }

  // 4. Книга, касса
  const ledger = [];
  let real = 0;
  const paper = [];
  const refunds = [];
  const herbsIn = [];
  let unopenedN = 0;
  const darkGroups = {}; // исходы принятых в темноте живых — для строки в конце книги
  const darkAt = []; // строки книги этих голосов
  let darkN = 0; // голоса в темноте — каждый своими словами // «Стучали — ты не открыл» — каждый раз своими словами
  for (const r of rows) {
    const { rec, sp, pid, oc } = r;
    const cash = nt.cash.filter((c) => c.i === r.i);
    if (sp.type === 'scene') { ledger.push(C.LEDGER.scene_qian); continue; }
    if (sp.type === 'thanks') {
      for (const c of cash) real += c.coins;
      if (rec.gift && rec.gift.herb) herbsIn.push(rec.gift.herb);
      if (rec.nameKnown && !rec.known) ledger.push(C.LEDGER.thanksDark); // в темноте голос имени не назвал
      else if (rec.nameKnown) ledger.push(fill(C.LEDGER.thanks, pid));
      else { ledger.push(C.LEDGER.unopened[unopenedN % C.LEDGER.unopened.length]); unopenedN += 1; }
      continue;
    }
    const PK = packetText(rec.packet, rec.delivery, pid);
    let line;
    let grpNow = null; // как этому живому к утру — для голоса в темноте
    const unopened = !rec.nameKnown && !(pid === 'mei' && n === 3);
    if (r.entry.truth.kind === 'living') {
      const p = s.people[pid];
      if (pid === 'mei' && n === 3) {
        const hk = meiCase.startsWith('refused_bench') ? 'refused_bench' : meiCase.startsWith('refused_late') ? 'refused_late' : meiCase.split('_')[0];
        const head = ['measure', 'pinch', 'herb'].includes(hk) ? 'packet' : hk === 'unopened' && !rec.known ? 'unopened_anon' : hk;
        line = `${fill(C.MEI_LEDGER.head[head], pid, { PACKET: PK })} ${C.MEI_LEDGER.sight[meiSight]}`;
      } else if (oc.killed || (rec.drink && rec.drink.diedHere)) {
        grpNow = 'gone';
        line = rec.delivery === 'drink' && rec.drink && (rec.drink.code === 'killed' || rec.drink.diedHere)
          ? fill(C.LEDGER.killed_drink[pid], pid, { PACKET: PK })
          : fill(C.LEDGER.killed_home, pid, { PACKET: PK, FACT: factFor(s, pid, 'gone') });
      } else {
        // строка утра — по месту, где он теперь: по ней место и узнают (§23, раунд 23)
        // лестница мест (§23, раунд 25): ранг — место; остался на месте — «не лучше и не хуже»; на краю — и куда сдвинулся
        const place = p.deg >= R.GONE ? 'gone' : Math.max(0, Math.min(4, p.deg));
        // сравнивают с тем, что книга знала вчера (место к прошлому утру), а не с тем, с чем гость пришёл
        // удержан, опустился или поднялся — против места, с которым он стоял у окошка этой ночью (§23, раунд 26);
        // «как вчера» — только если вчерашняя книга называла то же место, иначе — сравнение с ночью
        s.ledgerPlace = s.ledgerPlace || {};
        const arrived = r.degBefore;
        const y = s.ledgerPlace[pid];
        const sameAsYesterday = y && y.n === n - 1 && y.deg === p.deg;
        let rung;
        if (place === 'gone') rung = 'gone';
        else if (p.deg === arrived) rung = place === 0 ? '0' : sameAsYesterday ? `${place}held` : `${place}heldNight`;
        else if (p.deg < arrived) rung = place === 2 ? '2up' : place === 3 ? '3up' : String(place);
        else rung = String(place);
        if (place !== 'gone') s.ledgerPlace[pid] = { n, deg: p.deg };
        // здоров — не «поправляется»: голос в темноте говорит то же, что карточка (§23, раунд 27)
        grpNow = p.deg === 0 ? 'well' : factGroup(r.degBefore, p.deg, false);
        const FACT = factFor(s, pid, rung);
        const tpl = rec.result === 'refused' ? (rec.letIn ? C.LEDGER.refused_inside : C.LEDGER.refused) : rec.result === 'unreceived' ? C.LEDGER.unreceived : C.LEDGER.packet;
        line = fill(tpl, pid, { PACKET: PK, FACT });
        // кто придёт опять — обещание; кто не придёт, о том ничего: он дома, и об этом уже сказал факт (§23, раунд 22)
        if (plan && oc.returns === 'worse' && p.deg < R.GONE && (plan.worse.includes(pid) || plan.scripted.includes(pid))) {
          s.promiseUse = (s.promiseUse || 0) + 1;
          line += fill(C.LEDGER.promise[(s.promiseUse - 1) % C.LEDGER.promise.length], pid);
        }
      }
    } else {
      const o = s.others[pid];
      const res = rec.result;
      if (oc.revealed) line = fill(o.course > 1 ? C.LEDGER.revealed_course : rec.delivery === 'drink' ? C.LEDGER.revealed_drink : C.LEDGER.revealed, pid, { PACKET: PK, REVEAL: sp.reveal || '' });
      else if (oc.fed) line = fill(C.LEDGER.fed, pid, { PACKET: PK });
      else if (oc.destroyed) line = fill(rec.delivery === 'drink' ? C.LEDGER.destroyed_drink : C.LEDGER.destroyed, pid, { PACKET: PK });
      else {
        const who = pid === 'wei' ? (n === 3 ? 'wei3' : 'wei') : 'bai';
        let k = res === 'refused' ? `${who}_refused` : res === 'unreceived' ? `${who}_unreceived` : `${who}_any`;
        if (!C.LEDGER[k]) k = `wei_${k.split('_').pop()}`;
        if (meiDiedHere && rec.letIn && C.LEDGER[`${k}_inside_alone`]) k = `${k}_inside_alone`;
        else if (meiDiedHere && C.LEDGER[`${k}_alone`]) k = `${k}_alone`;
        else if (!rec.known && rec.nameKnown && C.LEDGER[`${k}_dark`]) k = `${k}_dark`; // в темноте его не видели — книга не пишет, как он ушёл
        else if (res === 'refused' && rec.letIn && C.LEDGER[`${k}_inside`]) k = `${k}_inside`;
        line = fill(C.LEDGER[k], pid, { PACKET: PK });
      }
    }
    if (unopened) { line = C.LEDGER.unopened[unopenedN % C.LEDGER.unopened.length]; unopenedN += 1; }
    // принят в темноте — в книге голос, а не имя (§23, раунд 15)
    else if (!rec.known && !(pid === 'mei' && n === 3)) {
      const pool = rec.result === 'refused' ? C.LEDGER.darkRefused : C.LEDGER.darkVoice;
      line = fill(pool[darkN % pool.length], pid, { PACKET: PK });
      // чем это кончилось — без имени, в конце книги одной строкой (§23, раунд 22)
      if (grpNow) { darkGroups[grpNow] = (darkGroups[grpNow] || 0) + 1; darkAt.push({ at: ledger.length, g: grpNow }); }
      darkN += 1;
    }
    for (const c of cash) {
      if (c.paper) { paper.push(c); line += C.LEDGER.paper; }
      else if (oc && oc.refund) refunds.push(c);
      else real += c.coins;
    }
    if (rec.paid && rec.paid.herb) herbsIn.push(rec.paid.herb);
    ledger.push(line);
  }

  // один голос — исход в его же строке; несколько — одна строка после них, и она прямо о них (§23, раунд 25):
  // безымянных строк не больше, чем безымянных гостей, плюс одна
  if (darkAt.length === 1) ledger[darkAt[0].at] += ` ${C.LEDGER.darkOne[darkAt[0].g][n - 1]}`;
  else {
    const darkList = ['gone', 'worse', 'same', 'better', 'well'].filter((g) => darkGroups[g]).map((g) => C.LEDGER.darkOutcome[g][darkGroups[g] > 1 ? 'many' : 'one'][n - 1]);
    if (darkList.length) ledger.push(fill(C.LEDGER.darkSummary[n], null, { LIST: joinList(darkList) }));
  }

  s.coins += real;
  for (const c of paper) s.paperCoins.push({ n, pid: c.pid, coins: c.coins });
  const cashLines = [fill(s.paperCoins.length ? (s.coins > 0 ? C.CASHBOX.totalReal : C.CASHBOX.totalRealNone) : C.CASHBOX.total, null, { X: countText(s.coins, 'coin') })];
  if (paper.length) {
    const list = joinList(paper.map((c) => fill(C.SAY.paperItem, c.pid, { X: countText(c.coins, 'coin') })));
    cashLines.push(fill(C.CASHBOX.paper[(n - 1) % C.CASHBOX.paper.length], null, { LIST: list }));
  }
  // кого ночью не видели — того касса не называет по имени: утром за монетами пришёл сосед, знакомый в лицо (§23, раунд 22)
  for (const c of refunds) {
    const seen = rows[c.i] && rows[c.i].rec.known;
    cashLines.push(seen ? fill(C.CASHBOX.refund, c.pid, { X: countText(c.coins, 'coinAcc') }) : fill(C.CASHBOX.refundAnon, c.pid, { WHO: C.DESC[c.pid].nom, X: countText(c.coins, 'coinAcc') }));
  }
  if (herbsIn.length) cashLines.push(fill(C.CASHBOX.herbIn, null, { LIST: joinList(herbsIn.map((h) => C.HERB_NAMES[h])) }));

  // 5. Записка, улица, крючок
  const patientRows = rows.filter((r) => r.sp.type === 'patient');
  const final = n === 3 ? finalKey(patientRows, s) : null;
  const warn = n < 3 ? brinkNext(s, n) : [];
  s.night.meiWrong = meiWrong;
  if (n === 2) {
    const weiRow = rows.find((r) => r.pid === 'wei');
    s.weiTaught = !!(weiRow && weiRow.rec.drink && weiRow.rec.drink.revealed);
  }
  const facts = nightFacts(s, n, rows, deaths, warn);
  // чего за ночь не коснулись — Лю дописал на лист, и говорит об этом одной фразой (§23, раунд 28)
  const filled = fillByMorning(s, ev);
  const { text: note, meta: noteMeta } = liuNote(s, n, rows, facts, meiCase, deaths, warn, filled);
  const street = streetOf(s, n, before);
  const hook = C.HOOKS[n];

  if (n < 3) {
    // мёртвый в комнате студит её — но не тогда, когда ученик впустил его по слову Лю и тот выпил учебную щепоть (§23)
    const cold = nt.nonhumanInside && !s.weiTaught;
    const bottle = n === 2 ? R.LIU_BOTTLE : 0;
    s.lampCap = R.nextLamp(s.lampCap, cold) + bottle;
    s.coldRoom = cold;
    // утренний счёт сходится с вечерним: бутыль Лю обещал в записке — она в счёте (§23, раунд 23)
    s.nextLampMorning = s.lampCap;
    s.nextLampNote = lampNote(n + 1, s.coldRoom, s.nextLampMorning, true, false, false, 'morning');
  }

  s.history[n] = {
    outcomes, final, verdict, meiCase, meiWrong, meiSight, noteMeta, deaths, warned: warn, facts,
    street: street.caption, // подпись улицы — для проверки, что она не повторяет книгу
    // кого ученик знал по имени в эту ночь (видел при свете или тот назвался) — одно имя везде (§23, раунд 16)
    known: rows.filter((r) => r.rec.known).map((r) => r.pid),
    dengBefore: (rows.find((r) => r.pid === 'deng') || {}).degBefore ?? null,
    opened: rows.filter((r) => r.rec.nameKnown).map((r) => r.pid),
    blind: nt.recs.filter((r) => r.blind).length,
    // сколько гостей ночи ученик видел при лампе (запас новичка, §23)
    byLamp: nt.recs.filter((r) => r.byLamp).length, guests: nt.queue.length,
    checks: rows.map((r) => ({ pid: r.pid, done: performedChecks(r.rec) })),
    oilUsed: nt.oilStart - s.oil,
    oilLeft: s.oil,
    rests: nt.recs.filter((r) => r.rested).length,
    vialUnused: n === 2 ? s.poison.pinches > 0 : null,
  };
  s.ledger.push({ n, lines: ledger });
  s.notes.push({ n, when: 'morning', text: note });
  s.phase = 'morning';
  s.morning = {
    step: 'ledger', boughtOil: false, bought: [],
    report: { ledger, cashbox: { lines: cashLines, coins: s.coins, paper: paper.length }, note, street, hook },
  };
  s.night = { ...nt, done: true };
  ev.push({ type: 'phase', phase: 'morning', night: n });
  ev.push({ type: 'narrate', text: C.NIGHT_EVENTS.dawn });
  ev.push({ type: 'show', slot: 'ledger', image: 'ledger_open' });
  for (const l of ledger) ev.push({ type: 'ledger', text: l });
}

// ── Записка Лю ───────────────────────────────────────────────────────────────

/** Какие проверки ученик сделал этому гостю (ключи — как у проверок в записках). */
export function performedChecks(rec) {
  const out = [];
  for (const k of ['tongue', 'pulse_rate', 'pulse_depth', 'mirror']) if (rec.seen[k]) out.push(k);
  for (const k of ['thirst', 'duration', 'chills', 'home']) if (rec.asked[k]) out.push(k);
  if (rec.rinsed) out.push('rinse');
  if (rec.rested) out.push('rest');
  return out;
}


/**
 * Проверки, которые вскрыли бы ошибку, по дешевизне. Для каждой: делал ли её ученик и что он тогда видел.
 * Учитывает помехи: при чае язык честен только после полоскания, при беге частота — после отдыха,
 * при ветре глубина — после отдыха.
 */
function exposing(axis, r) {
  const { rec, sp } = r;
  // старикам о питье и давности не верь — так на листе Лю (утро 1)
  const bad = new Set([...(sp.noise ? sp.noise.signs : []), ...nightSpoils(sp.vid), ...(sp.distrust || [])]);
  const restCost = rec.letIn ? R.COST.rest : R.COST.rest + R.COST.let_in;
  const restWord = rec.letIn ? C.SAY.restWordInside : C.CHECK_WORDS.rest;
  const pc = R.pulseCost(r.n, rec.letIn);
  // что ученик видел — кодом приметы (короткую форму фразы даёт язык: C.SEEN_FORM); что слышал — ответом целиком
  const q = (id) => ({ id, kind: 'answer', cost: 1, word: C.CHECK_WORDS[id], done: !!rec.asked[id], seen: rec.seen[id] && rec.seen[id].text });
  const saw = (kind, key = kind) => (rec.seen[key] && rec.seen[key].value ? { kind, value: rec.seen[key].value } : null);
  const rest = (seenKey) => ({ id: 'rest', cost: restCost, word: restWord, done: rec.rested, seen: rec.rested && saw(seenKey) });
  if (axis === 'temp') {
    const list = [];
    // испорченная примета честна только после своей проверки: язык — после полоскания, пульс — после отдыха
    list.push(bad.has('tongue')
      ? { id: 'rinse', cost: 2, word: C.CHECK_WORDS.rinse, done: rec.rinsed, seen: rec.rinsed && saw('tongue') }
      : { id: 'tongue', cost: 1, word: C.CHECK_WORDS.tongue, done: !!rec.seen.tongue, seen: saw('tongue') });
    list.push(bad.has('pulse_rate') ? rest('pulse_rate')
      : { id: 'pulse_rate', cost: pc, word: C.CHECK_WORDS.pulse_rate, done: !!rec.seen.pulse_rate, seen: saw('pulse_rate') });
    if (!bad.has('thirst')) list.push(q('thirst'));
    return list.sort((a, b) => a.cost - b.cost);
  }
  if (axis === 'loc') {
    const list = [];
    if (!bad.has('duration')) list.push(q('duration'));
    if (!bad.has('chills')) list.push(q('chills'));
    list.push(bad.has('pulse_depth') ? rest('pulse_depth')
      : { id: 'pulse_depth', cost: pc, word: C.CHECK_WORDS.pulse_depth, done: !!rec.seen.pulse_depth, seen: saw('pulse_depth') });
    return list.sort((a, b) => a.cost - b.cost);
  }
  if (axis === 'degree') return [rest('rest')];
  if (axis === 'mirror') {
    return [{ id: 'mirror', cost: 1, word: C.CHECK_WORDS.mirror, done: !!rec.seen.mirror, seen: saw('mirror') }];
  }
  if (axis === 'even') {
    return [
      { id: 'tongue', cost: 1, word: C.CHECK_WORDS.tongue, done: !!rec.seen.tongue, seen: saw('tongue') },
      { id: 'pulse_rate', cost: pc, word: C.CHECK_WORDS.pulse_rate, done: !!rec.seen.pulse_rate, seen: saw('pulse_rate') },
    ];
  }
  return [];
}

// ── Факты ночи и claim (§23, раунд 16: Лю утверждает только то, что было) ──────────

/** Что было этой ночью — то, против чего проверяется каждая фраза Лю о ночи. Простой JSON. */
export function nightFacts(s, n, rows, deaths = [], warn = []) {
  const nt = s.night;
  const prevOut = (pid) => (s.history[n - 1] ? s.history[n - 1].outcomes.find((o) => o.pid === pid) : null);
  const guests = rows.map((r) => {
    const { rec, sp, entry } = r;
    const t = entry.truth;
    const living = !!(t && t.kind === 'living');
    const h = rec.packet ? rec.packet.herb : null;
    let herb = 'none';
    if (h && living) {
      const [, hl, ht] = h.split('_');
      herb = h === R.herbFor(t.temp, t.loc) ? 'right' : hl !== t.loc && ht !== t.temp ? 'wrong_both' : ht !== t.temp ? 'wrong_temp' : 'wrong_loc';
    }
    else if (h) herb = 'any';
    const p = living ? s.people[r.pid] : null;
    const prev = prevOut(r.pid);
    return {
      i: r.i, pid: r.pid, type: sp.type, kind: t ? t.kind : null,
      opened: !!rec.nameKnown, known: !!rec.known, letIn: !!rec.letIn,
      result: rec.result || null, herb, dose: rec.packet ? rec.packet.dose : 'none', delivery: rec.delivery || null,
      code: r.oc ? r.oc.code : null,
      blindOpen: !!rec.blind, blindWrap: !!rec.wrapBlind, lampDied: !!rec.lampDied,
      done: performedChecks(rec), drawerEmpty: !!rec.drawerEmpty,
      paidPaper: nt.cash.some((c) => c.i === r.i && c.paper),
      returnedSame: !!(entry.mode === 'worse' && prev && prev.packet && h && prev.packet.herb === h),
      worse: !!(living && r.oc && (p.killed || p.deg > r.degBefore)),
      died: !!(living && r.oc && (p.killed || (p.deg >= R.GONE && r.degBefore < R.GONE))),
    };
  });
  const wi = rows.findIndex((r) => r.pid === 'wei');
  return {
    n,
    weather: { 1: 'quiet', 2: 'rain', 3: 'wind' }[n],
    lampOut: !!nt.lampOut,
    candle: !!nt.candle,
    // ветер стихает при стуке Вэя: погасла ли лампа уже после этого
    windBeforeLamp: n === 3 && wi >= 0 && (!nt.lampOut || (nt.lampOutAt ?? -1) >= wi),
    blindWraps: guests.filter((g) => g.blindWrap).length,
    blindHerbWraps: guests.filter((g) => g.blindWrap && g.herb !== 'none').length,
    bodies: (nt.bodies || []).length,
    deaths: guests.filter((g) => g.died).length,
    quiet: !guests.some((g) => g.worse),
    poisonLeft: Math.max(0, s.poison.pinches),
    vial: n === 2 ? (s.poison.pinches > 0 ? 'unused' : 'used') : null,
    weiTaught: !!s.weiTaught,
    weiWalks: !s.others.wei.destroyed,
    warn: warn.slice(),
    guests,
  };
}

const NIGHT_KEYS = new Set(['weather', 'lampOut', 'candle', 'windBeforeLamp', 'blindWraps', 'blindWrapsMax', 'blindHerbWraps', 'bodies', 'bodiesMax', 'deaths', 'quiet', 'poisonLeft', 'poisonLeftMin', 'vial', 'weiTaught', 'weiWalks', 'warn']);

function checkNight(F, k, v) {
  switch (k) {
    case 'blindWraps': case 'blindHerbWraps': case 'bodies': case 'deaths': return F[k] >= v;
    case 'blindWrapsMax': return F.blindWraps <= v;
    case 'bodiesMax': return F.bodies <= v;
    case 'poisonLeftMin': return F.poisonLeft >= v;
    case 'warn': return F.warn.includes(v);
    default: return F[k] === v;
  }
}

function checkGuest(F, c) {
  const g = c.i !== undefined ? F.guests.find((x) => x.i === c.i) : F.guests.find((x) => x.pid === c.pid);
  if (!g) return false;
  for (const [k, v] of Object.entries(c)) {
    if (k === 'i' || k === 'pid') continue;
    if (NIGHT_KEYS.has(k)) { if (!checkNight(F, k, v)) return false; continue; }
    if (k === 'done') { if (![].concat(v).every((x) => g.done.includes(x))) return false; continue; }
    if (k === 'notDone') { if ([].concat(v).some((x) => g.done.includes(x))) return false; continue; }
    if (k === 'dark') { if (!(g.blindOpen || g.lampDied)) return false; continue; }
    if (!(k in g)) throw new Error(`claim: unknown guest key ${k}`);
    if (Array.isArray(v) ? !v.includes(g[k]) : g[k] !== v) return false;
  }
  return true;
}

/** Правда ли claim этой ночью. null — фраза о ночи не говорит. */
export function checkClaim(F, claim) {
  if (!claim) return true;
  for (const [k, v] of Object.entries(claim)) {
    if (k === 'g') { if (![].concat(v).every((c) => checkGuest(F, c))) return false; continue; }
    if (!NIGHT_KEYS.has(k)) throw new Error(`claim: unknown key ${k}`);
    if (!checkNight(F, k, v)) return false;
  }
  return true;
}

const forGuest = (claim, i) => ({ g: { ...claim, i } });

// ── Записка Лю: причина и проверка ───────────────────────────────────────────

// ── Записка Лю: одна ошибка ночи — самая тяжёлая (§23, раунд 17) ─────────────────

/** Что показала бы эта проверка у этого гостя по оси axis — по его же приметам (то, что увидел бы игрок). */
function readsAs(r, x, axis) {
  const { sp } = r;
  const S = sp.signs || {};
  const ans = (id) => { const a = sp.answers && sp.answers[id]; return a ? [].concat(a).pop().value : null; };
  let sign = null;
  if (x.id === 'tongue') sign = { check: 'tongue', value: S.tongue };
  else if (x.id === 'rinse') sign = { check: 'tongue', value: S.tongueAfterRinse || S.tongue };
  else if (x.id === 'pulse_rate') sign = { check: 'pulse_rate', value: S.rate };
  else if (x.id === 'pulse_depth') sign = { check: 'pulse_depth', value: S.depth };
  else if (x.id === 'rest') sign = axis === 'temp' ? { check: 'pulse_rate', value: S.rateAfterRest || S.rate } : { check: 'pulse_depth', value: S.depthAfterRest || S.depth };
  else if (['thirst', 'duration', 'chills'].includes(x.id)) sign = { check: x.id, value: ans(x.id) };
  return sign ? readSign(sign)[axis] || null : null;
}

/**
 * Проверка, которая отличила бы верный ящик от выбранного: по осям, где трава ошиблась (или по обеим, если травы не было),
 * — только те проверки, что у этого гостя показали бы правду. Сделана и увидена — «было перед глазами»; нет — самая дешёвая.
 */
function decisiveCheck(r, axes, remedy = null) {
  const t = r.entry.truth;
  const cand = axes.flatMap((a) => exposing(a, r).filter((x) => readsAs(r, x, a) === t[a]).map((x) => ({ ...x, axis: a })));
  const seen = cand.find((x) => x.done && x.seen);
  // что увидел — одной решающей приметой, словами листа (§23, раунд 23), а не всем описанием осмотра
  const base = (x) => (x.id === 'rinse' ? 'tongue' : x.id === 'rest' ? (x.axis === 'temp' ? 'pulse_rate' : 'pulse_depth') : x.id);
  if (seen) return seen.kind === 'answer'
    ? { variant: 'heard', id: seen.id, axis: seen.axis, vars: { ASK: C.SAY.ask[seen.id] || C.SAY.ask.other, QUOTE: seen.seen } }
    : { variant: 'seen', id: seen.id, axis: seen.axis, vars: { SIGHT: C.SIGN_SHORT[base(seen)][t[seen.axis]] } };
  // ошибку сделала помеха, а её снятия (полоскания, отдыха) не было — не сделано именно оно (§23, раунд 23)
  const todo = (remedy && cand.find((x) => x.id === remedy && !x.done)) || cand.filter((x) => !x.done).sort((a, b) => a.cost - b.cost)[0];
  if (!todo) return null;
  if (r.rec.blind || r.rec.lampDied) return { variant: 'dark', id: todo.id, axis: todo.axis, vars: {} };
  return { variant: 'named', id: todo.id, axis: todo.axis, vars: {} };
}

// ошибки, о которых Лю говорит «только это» — без проверки (§23): отказ, неоткрытое окошко, яд живому, впустил зря, деньги
const ONLY_THAT = new Set(['refused_living', 'refused_inside', 'refused_anon', 'not_opened', 'unreceived', 'measure', 'pinch_heat', 'overdose',
  'blind', 'blind_anon', 'let_in_dead', 'paper_coin', 'beside_dead', 'empty_drawer', 'no_herb']);

// ── Одна рамка — один раз за игру (§23, раунд 20): три утра не повторяют четырёх слов подряд ──
/** Записки прошлых утр этой игры — четвёрки слов, которые уже были. */
function usedFrames(s, n) {
  const used = new Set();
  for (const x of s.notes) if (x.when === 'morning' && x.n < n) for (const g of grams4(x.text)) used.add(g);
  return { has: (t) => [...grams4(t)].some((g) => used.has(g)) };
}

/** Какая это ошибка у гостя (ключ C.MISTAKES) и насколько тяжела: смерть 4, вред от яда 3, шаг вниз 2, впустил зря 1.5, деньги 1. */
function mistakeOf(s, n, r, F) {
  const { rec, sp, oc } = r;
  if (sp.type !== 'patient') return null;
  const t = r.entry.truth;
  const g = F.guests.find((x) => x.i === r.i);
  if (t.kind !== 'living') {
    // впустил мёртвого и не дал щепоти — завтра лампа короче (только ночь 2: дальше лампы нет)
    if (n === 2 && rec.letIn && t.kind === 'dead' && !(rec.drink && (rec.drink.revealed || rec.drink.destroyed))) return { sev: 1.5, key: 'let_in_dead' };
    if (t.kind === 'skin' && g.paidPaper) return { sev: 1, key: 'paper_coin' };
    return null;
  }
  // тяжесть — худшее место, куда гость пришёл по вине ученика (умер > у самого края > на краю …), потом — насколько упал
  // (§23, раунд 27); у не живых ошибок (впустил мёртвого, бумажная монета) тяжесть меньше любой живой
  if (!(g.died || g.worse || ['overdose', 'pinch_heat'].includes(oc.code))) return null;
  const p = s.people[r.pid];
  const after = g.died || p.killed ? R.GONE : Math.min(4, p.deg);
  // мера живому — смерть от руки ученика: тяжелее любой другой смерти ночи (§23, раунд 29)
  const sev = (rec.result === 'packet' && rec.packet && rec.packet.dose === 'measure' ? 100 : 0) + after * 10 + Math.max(0, after - r.degBefore);
  if (rec.result === 'refused') return { sev, key: !rec.nameKnown ? 'not_opened' : rec.letIn ? 'refused_inside' : 'refused_living' };
  if (rec.result === 'unreceived') return { sev, key: 'unreceived' };
  const h = rec.packet.herb;
  const dose = rec.packet.dose;
  if (dose === 'measure') return { sev, key: 'measure' };
  if (oc.code === 'pinch_heat') return { sev, key: 'pinch_heat' };
  if (oc.code === 'overdose') return { sev, key: 'overdose' };
  if (rec.blind) return { sev, key: rec.known ? 'blind' : 'blind_anon' };
  const right = R.herbFor(t.temp, t.loc);
  if (h && h !== right && rec.drawerEmpty) return { sev, key: 'empty_drawer', vars: { RIGHT: C.HERB_NAMES[right] } };
  if (!h) return { sev, key: 'no_herb', axes: ['temp', 'loc'] };
  if (h === right) return r.pid === 'mei' && n === 3 && F.weiWalks ? { sev, key: 'beside_dead' } : null;
  // не та трава: что именно не так, и не обманула ли помеха, которую ученик не снял
  const [, hloc, temp] = h.split('_');
  // о месте болезни — только что было не так: какая болезнь и от какой трава (§23, раунд 27), без «ты разобрал»
  const vars = { HERB: C.HERB_NAMES[h], TEMP: C.TEMP_WORD[t.temp], LOC_AT: C.LOC_AT[t.loc], LOC_HAD: C.LOC_HAD[t.loc], LOC_GAVE: C.LOC_GAVE[hloc] };
  // обе оси мимо — только что было у гостя и что в свёртке: ни одна проверка одна этого не решила бы (§23, раунд 23)
  if (temp !== t.temp && hloc !== t.loc) return { sev, key: 'wrong_both', vars };
  const noise = sp.noise ? sp.noise.cause : null;
  const bad = new Set([...(sp.noise ? sp.noise.signs : []), ...nightSpoils(sp.vid)]);
  const fooledBy = (k) => bad.has(k) && (['thirst', 'duration', 'chills'].includes(k) ? rec.asked[k] : rec.seen[k]);
  const prevO = r.entry.mode === 'worse' && s.history[n - 1] && s.history[n - 1].outcomes.find((o) => o.pid === r.pid);
  const same = prevO && prevO.packet && prevO.packet.herb === h;
  if (temp !== t.temp) {
    let key = 'wrong_temp';
    let remedy = null; // чем снимается помеха, что обманула (лист 2: чай и молоко — полоскание, бег и чай — отдых)
    if (same) key = 'returned_same';
    else if ((noise === 'tea' || noise === 'milk') && fooledBy('tongue') && !rec.rinsed) { key = noise; remedy = 'rinse'; }
    else if (noise === 'tea' && fooledBy('pulse_rate') && !rec.rested) { key = 'tea_pulse'; remedy = 'rest'; }
    else if (noise === 'milk' && fooledBy('thirst')) key = 'milk';
    else if ((noise === 'ran' || noise === 'breath') && fooledBy('pulse_rate') && !rec.rested) { key = noise; remedy = 'rest'; }
    else if (noise === 'old' && fooledBy('thirst')) key = 'old_temp';
    return { sev, key, axes: ['temp'], remedy, vars };
  }
  let key = 'wrong_loc';
  let remedy = null;
  if (same) key = 'returned_same';
  else if (fooledBy('pulse_depth') && !rec.rested) { key = 'wind'; remedy = 'rest'; }
  else if (fooledBy('chills')) key = 'rain';
  else if ((noise === 'old' || (sp.distrust || []).includes('duration')) && fooledBy('duration')) key = 'old_loc';
  return { sev, key, axes: ['loc'], remedy, vars };
}

/** Самая тяжёлая ошибка ночи (при равной — что раньше по очереди) и её фразы: причина и, для травы, проверка. */
function theMistake(s, n, rows, F, frames, builds) {
  let best = null;
  for (const r of rows) {
    const m = mistakeOf(s, n, r, F);
    if (!m) continue;
    // безымянного Лю называет лишь там, где имени не нужно
    if (!r.rec.known && m.key === 'refused_living') m.key = 'refused_anon';
    if (!r.rec.known && !['blind_anon', 'not_opened', 'unreceived', 'refused_anon'].includes(m.key)) continue;
    if (!best || m.sev > best.sev) best = { ...m, r };
  }
  if (!best) return null;
  const { r, key } = best;
  const M = key === 'not_opened' ? C.NOT_OPENED : C.MISTAKES[key];
  const anon = ['blind_anon', 'unreceived', 'not_opened', 'refused_anon'].includes(key);
  // рамка, уже звучавшая в прошлые утра, второй раз не звучит: другая — или ничего (§23, раунд 20)
  // рамка и построение, уже звучавшие в прошлые утра, второй раз не звучат: «Деньги у приезжей ты взял» и «Меру Фэн ты
  // отвесил сам» — одно построение (§23, раунд 23); у каждой ошибки три фразы трёх разных построений
  // о ошибке ночи Лю не молчит никогда (§23, раунд 25): сначала — новое построение и новые слова; нет — новое построение;
  // нет и его — то, что звучало давнее всего
  const all = [M.text, M.alt, M.again].map((t, k) => ({ t, build: (M.builds || [])[k] || `k${k}` })).filter((x) => x.t)
    .map((x) => ({ ...x, t: fill(x.t, r.pid, best.vars || {}) }));
  const fresh = all.filter((x) => !builds.has(`mistake:${x.build}`));
  const pick = fresh.find((x) => !frames.has(x.t)) || fresh[0] || [...all].sort((a, b) => (builds.when(`mistake:${a.build}`) || 0) - (builds.when(`mistake:${b.build}`) || 0))[0];
  const out = [{ text: pick.t, claim: forGuest(M.claim, r.i), pid: anon ? null : r.pid, about: r.pid, kind: 'mistake', build: pick.build }];
  let check = null;
  if (!ONLY_THAT.has(key) && best.axes) {
    check = decisiveCheck(r, best.axes, best.remedy);
    if (check) {
      // не сделано — фактом о ночи («Язык ты у него не смотрел»), не «хватило бы» (§23, раунд 23); видел или слышал — одной приметой
      const items = check.variant === 'named'
        ? C.NOT_DONE[check.id].map((x, k) => ({ t: x.text, build: x.build || `n${k}`, done: x.done || [] }))
        : C.CHECK_LINE[check.variant].map((t, k) => ({ t, build: `${check.variant}${k}`, done: [] }));
      const rec = r.rec;
      const did = new Set(performedChecks(rec));
      const ct = items.filter((x) => !builds.has(`check:${x.build}`) && x.done.every((d) => did.has(d)))
        .map((x) => ({ ...x, t: fill(x.t, r.pid, check.vars) })).find((x) => !frames.has(x.t));
      const claim = check.variant === 'dark' ? { dark: true, notDone: [check.id] } : check.variant === 'named' ? { notDone: [check.id], ...(ct && ct.done.length ? { done: ct.done } : {}) } : { done: [check.id] };
      if (ct) out.push({ text: ct.t, claim: forGuest(claim, r.i), pid: null, about: r.pid, kind: 'check', build: ct.build });
      else check = null;
    }
    if (check) {
      // для теста: что эта проверка показала бы и что было выбрано
      const t = r.entry.truth;
      const h = r.rec.packet.herb;
      check.reads = readsAs(r, { id: check.id }, check.axis);
      check.truth = t[check.axis];
      check.chosen = h ? (check.axis === 'temp' ? h.split('_')[2] : h.split('_')[1]) : null;
    }
  }
  return { key, pid: r.pid, i: r.i, sev: best.sev, check, sentences: out };
}

/** Знал ли ученик этого человека по имени — в эту ночь или раньше. */
function knownEver(s, pid, rows) {
  if (rows && rows.some((r) => r.pid === pid && r.rec.known)) return true;
  return Object.values(s.history).some((h) => (h.known || []).includes(pid));
}

function firstTrue(F, pool) {
  return pool.find((x) => checkClaim(F, x.claim)) || null;
}

function liuNote(s, n, rows, F, meiCase, deaths = [], warn = [], filled = 0) {
  const patients = rows.filter((r) => r.sp.type === 'patient');
  const frames = usedFrames(s, n);
  // построения прошлых утр этой игры: «вид:построение» (ошибка, проверка, начало записки)
  const builds = new Set();
  const usedAt = new Map(); // построение → в какое утро звучало последний раз
  for (const [k, h] of Object.entries(s.history)) {
    if (Number(k) >= n) continue;
    for (const x of ((h.noteMeta && h.noteMeta.sentences) || []).filter((y) => y.build)) { builds.add(`${x.kind}:${x.build}`); usedAt.set(`${x.kind}:${x.build}`, Number(k)); }
  }
  builds.when = (b) => usedAt.get(b);
  // три утра начинаются с трёх разных вещей — или ни с чего: погода за окном Лю — не больше одного утра (§23, раунд 23)
  const op = C.NOTE_OPEN[n].find((x) => checkClaim(F, x.claim) && !frames.has(x.text) && !builds.has(`opener:${x.kind}`));
  const opener = op ? { ...op, kind: 'opener', build: op.kind } : null;
  const closer = firstTrue(F, C.NOTE_CLOSE[n]);
  const mistake = theMistake(s, n, patients, F, frames, builds);
  const body = mistake ? [...mistake.sentences] : [];
  // ночь 3, мера ушла Вэю: о цене — одним фактом, своим абзацем, не вдогонку к ошибке (§23, раунд 29)
  const price = n === 3 && checkClaim(F, C.MEASURE_PRICE.claim) ? { ...C.MEASURE_PRICE, pid: null, about: null, kind: 'price' } : null;
  // о каждом умершем соседе — то, что учитель о нём помнит (не причина, не исход, не урок); безымянного не называет
  const memory = [];
  for (const r of patients) {
    const g = F.guests.find((x) => x.i === r.i);
    if (!g.died || !r.rec.known || !C.MEMORY[r.pid]) continue;
    memory.push({ text: C.MEMORY[r.pid], claim: forGuest({ died: true, known: true }, r.i), pid: r.pid, about: r.pid, kind: 'memory' });
  }
  // «сказать нечего» — раз за игру и не после другого замечания о ночи (иначе Лю спорит сам с собой)
  const noneSaid = Object.values(s.history).some((h) => h.noteMeta && h.noteMeta.sentences.some((x) => x.kind === 'none'));
  // чистая ночь: о ней Лю не говорит ничего — ни «нечего», ни оценки (§23, раунд 25)
  void noneSaid;
  const extra = [];
  if (n === 2) {
    extra.push(s.poison.pinches > 0 ? C.VIAL_NOTE.unused : s.weiTaught ? C.VIAL_NOTE.taught : C.VIAL_NOTE.used);
    for (const W of [C.WEI_DARK, C.WEI_PRICE]) if (checkClaim(F, W.claim)) { extra.push(W); if (W === C.WEI_DARK) break; }
  }
  for (const pid of warn) {
    const W = C.WARN[pid];
    if (!W) continue;
    const met = knownEver(s, pid, rows);
    const WHO = met ? C.PEOPLE[pid].name : C.DESC[pid].cap;
    // второе предупреждение о том же человеке — другой рамкой; кого ученик не знает, Лю называет по дому
    const again = fill(W.again, pid, { WHO });
    // по книге этого утра он ещё не у самого края (хуже станет за день) — Лю говорит «к ночи», не «уже» (§23, раунд 27)
    const soon = s.people[pid] && s.people[pid].deg < 4;
    const text = soon ? fill(W.soon, pid, { WHO }) : [W[met ? 'met' : 'unmet'], again].find((t) => !frames.has(t));
    if (text) extra.push({ text, claim: { warn: pid }, pid: met ? pid : null, about: pid });
  }
  if (filled) extra.push({ text: C.SHEET_FILLED[n].text, claim: {}, kind: 'sheet' }); // правда по построению: дописано = было что дописать
  if (n < 3) extra.push({ text: C.NOTE_RULES[n], claim: null });
  const used = new Set();
  // ни одна фраза не повторяет четырёх слов подряд из прошлых записок этой игры (§23, раунд 22)
  // фраза об ошибке ночи не выпадает никогда (§23, раунд 25): построение у неё и так свежее
  const once = (x) => x && !used.has(x.text) && (x.kind === 'mistake' || !frames.has(x.text)) && used.add(x.text);
  const paras = [[opener], body, [price], memory, extra, [closer]].map((p) => p.filter(once)).filter((p) => p.length);
  const sentences = paras.flat();
  const text = paras.map((p) => p.map((x) => x.text).join(' ')).join('\n\n');
  const meta = {
    key: mistake ? mistake.key : 'none', pid: mistake ? mistake.pid : null, i: mistake ? mistake.i : null,
    named: mistake && mistake.check && mistake.check.variant === 'named' ? mistake.check.id : null,
    check: mistake && mistake.check ? { id: mistake.check.id, variant: mistake.check.variant, axis: mistake.check.axis, reads: mistake.check.reads, truth: mistake.check.truth, chosen: mistake.check.chosen } : null,
    sentences: sentences.map((x) => ({ text: x.text, claim: x.claim || null, pid: x.pid || null, about: x.about || x.pid || null, kind: x.kind || null, build: x.build || null })),
    personal: sentences.filter((x) => x.pid).map((x) => ({ pid: x.pid, text: x.text })),
    memory: memory.map((x) => x.about),
  };
  return { text, meta };
}

/** Как в ночь 3 обошлись с Мэй — ключ её утренних текстов (C.MEI3). */
/** Чем трава Мэй была не та — для {WRONG}. */
function meiWrongKind(rec, truth) {
  const h = rec.packet && rec.packet.herb;
  if (!h || h === R.herbFor(truth.temp, truth.loc)) return '';
  return h.split('_')[2] !== truth.temp ? 'temp' : truth.loc;
}
function meiWrongOf(rec, truth) {
  const h = rec.packet && rec.packet.herb;
  if (!h || h === R.herbFor(truth.temp, truth.loc)) return '';
  const temp = h.split('_')[2];
  return C.MEI_WRONG[temp !== truth.temp ? 'temp' : truth.loc];
}

/** Что видно утром у Мэй — ключ C.MEI_LEDGER.sight. */
function meiSightKey(verdict, meiCase, weiHome) {
  if (verdict === 'killed') return meiCase === 'measure_drink' ? 'killed_drink' : 'killed_home';
  if (weiHome && (verdict === 'slipped_alone' || verdict === 'held_alone')) return { slipped_alone: 'slipped_home', held_alone: 'held_home' }[verdict];
  return verdict;
}

export function meiCaseOf(rec, weiGone, truth, weiHome = false) {
  const tail = weiHome ? '_home' : weiGone ? '_alone' : '_with';
  // где она была: у окошка и под навесом, на лавке у тебя в комнате, за неоткрытой ставней
  if (rec.result === 'refused') {
    if (!rec.nameKnown) return `unopened${tail}`;
    // ждала его под навесом, а впущена позже — не «ждала у тебя на лавке» и не «окошко закрыто»
    if (rec.letIn && rec.waitedAt === 'eaves') return `refused_late${tail}`;
    return ((rec.waitedAt ? rec.waitedAt === 'bench' : rec.letIn) ? 'refused_bench' : 'refused') + tail;
  }
  if (rec.result !== 'packet') return 'unreceived' + tail;
  const p = rec.packet;
  if (p.dose === 'measure') return rec.delivery === 'drink' ? 'measure_drink' : 'measure_home';
  const right = p.herb === R.herbFor(truth.temp, truth.loc);
  const herb = right ? 'right' : p.herb ? 'wrong' : 'none';
  return `${p.dose === 'pinch' ? 'pinch' : 'herb'}_${herb}${tail}`;
}

/** Что было с человеком в прошлые ночи, когда ему становилось хуже: [{n, kind}]. */
export function harmChain(s, pid, beforeNight) {
  const out = [];
  for (let k = 1; k < beforeNight; k++) {
    const h = s.history[k];
    if (!h) continue;
    const o = h.outcomes.find((x) => x.pid === pid && x.type === 'patient');
    if (!o || !o.worse) continue;
    let kind;
    if (o.result === 'refused') kind = (h.opened || []).includes(pid) ? 'refused' : 'unopened';
    else if (o.result === 'unreceived') kind = 'unreceived';
    else if (o.code === 'pinch_heat') kind = 'pinch';
    else if (o.code === 'overdose') kind = 'overdose';
    else if (o.blind) kind = 'blind';
    else if (!o.packet.herb) kind = 'empty';
    else kind = o.cell ? herbErr(o.packet.herb, o.cell).kind : 'herb_temp';
    out.push({ n: k, kind, vars: o.cell && o.packet.herb ? herbErr(o.packet.herb, o.cell).vars : {} });
  }
  return out;
}

/** Что именно было не так с травой: холод с жаром ('temp') или «где сидит» ('loc'); слова для строк. */
function herbErr(herb, cell) {
  const [, loc, temp] = herb.split('_');
  const vars = { GAVE: C.ERR_WORDS.gave[temp], HAD: C.ERR_WORDS.had[cell.temp], WHERE: C.ERR_WORDS.where[cell.loc] };
  return { kind: temp !== cell.temp ? 'herb_temp' : loc !== cell.loc ? 'herb_loc' : 'herb_temp', vars };
}

/** Отчего умер сосед — настоящая причина, одними словами для Лю и карточки. */
function deathCause(r) {
  const { rec, oc } = r;
  if (oc.killed) return 'killed';
  if (rec.result === 'refused') return rec.nameKnown ? 'refused' : 'unopened';
  if (rec.result === 'unreceived') return 'unreceived';
  if (rec.blind) return 'blind';
  if (oc.code === 'pinch_heat') return rec.drink && rec.drink.diedHere ? 'pinch_heat_here' : 'pinch_heat';
  if (rec.drawerEmpty) return 'empty_drawer';
  if (['worse', 'worse_edge', 'held_pinch', 'overdose'].includes(oc.code)) {
    if (!(rec.packet && rec.packet.herb)) return 'no_herb';
    return herbErr(rec.packet.herb, r.entry.truth).kind === 'herb_loc' ? 'wrong_loc' : 'wrong_temp';
  }
  return 'other';
}

/** Кто следующей ночью придёт к самому краю (место 4): их Лю называет заранее. */
function brinkNext(s, n) {
  const probe = structuredClone(s);
  const q = buildQueue(n + 1, probe);
  return q.filter((e) => e.truth && e.truth.kind === 'living' && e.truth.deg >= 4 && e.pid !== 'mei').map((e) => e.pid);
}

/** Как в ночь 3 обошлись с Вэем — ключ C.WEI3 и строки карточки. */
function weiCaseOf(rows) {
  const r = rows.find((x) => x.pid === 'wei');
  if (!r) return 'none';
  return weiKey(r.rec.result, r.rec.packet, r.rec.delivery, r.rec.nameKnown, r.rec.letIn);
}

function weiKey(result, packet, delivery, opened, letIn) {
  if (result === 'refused') return letIn ? 'refused_inside' : opened ? 'refused' : 'unopened';
  if (result === 'unreceived') return 'unreceived';
  if (packet.dose === 'measure') return delivery === 'drink' ? 'measure_drink' : 'measure_home';
  if (packet.dose === 'pinch') return 'pinch';
  return 'herb';
}

/** Чем кончилась ночь 3 у двери. */
export function finalKey(rows, s) {
  const mei = rows.find((r) => r.pid === 'mei');
  const wei = rows.find((r) => r.pid === 'wei');
  const dose = (r) => (r && r.rec.result === 'packet' ? r.rec.packet.dose : 'none');
  if (dose(mei) === 'measure') return 'mei_killed';
  if (s.people.mei.deg >= R.GONE) return 'mei_gone';
  if (dose(wei) === 'measure') return 'wei_measure';
  if (dose(mei) === 'pinch') return 'mei_pinch';
  if (dose(wei) === 'pinch') return 'wei_pinch';
  return s.poison.pinches >= 3 ? 'kept' : 'kept_spent';
}

// ── Улица ────────────────────────────────────────────────────────────────────

function streetOf(s, n, before) {
  const worse = (pid) => s.people[pid] && !s.people[pid].killed && s.people[pid].deg > before[pid].deg;
  const deaths = Object.keys(s.people).filter((pid) => {
    const p = s.people[pid];
    return (p.killed && !before[pid].killed) || (p.deg >= R.GONE && before[pid].deg < R.GONE);
  });
  const props = [];
  if (n === 3) {
    const mei = s.people.mei;
    const meiDead = mei.killed || mei.deg >= R.GONE;
    let image; let caption;
    if (meiDead) { image = 'street_mourning_extra'; caption = C.STREET.mei_dead3; }
    else if (mei.deg <= 2) { image = 'street_base'; caption = C.STREET.tofu_open3; }
    else { image = 'street_tofu_closed'; caption = C.STREET.tofu_closed3; }
    const others = deaths.filter((p) => p !== 'mei');
    // каждая смерть — на улице, не только первая
    if (others.length === 1) caption += ' ' + fill(C.STREET.mourning, others[0]);
    else if (others.length > 1) { caption += ' ' + fill(C.STREET.mourningMany, null); } // чья — говорит книга, не улица (§23, раунд 23)
    let cups;
    if (meiDead) cups = { count: 2, filled: false, image: 'bowl_two', text: C.TABLE.bowl_two_empty };
    else if (s.others.wei.destroyed) cups = { count: 1, filled: true, image: 'bowl_one', text: C.TABLE.bowl_one };
    else cups = { count: 2, filled: true, image: 'bowl_two', text: C.TABLE.bowl_two };
    props.push({ image: cups.image, text: cups.text });
    const left = Math.max(0, s.poison.pinches);
    const jar = { pinches: left, image: `jar_poison_${left}`, text: C.JAR[left] };
    props.push({ image: jar.image, text: jar.text });
    return { image, caption, props, cups, jar };
  }
  if (deaths.length) return { image: 'street_mourning_extra', caption: fill(C.STREET.mourning, deaths[0]), props };
  if (n === 1) {
    if (worse('gao')) return { image: 'street_butcher_closed', caption: C.STREET.butcher1, props };
    if (worse('zhou')) return { image: 'street_repair_closed', caption: C.STREET.repair1, props };
    if (worse('mei')) return { image: 'street_tofu_closed', caption: C.STREET.tofu1, props };
    return { image: 'street_base', caption: C.STREET.base1, props };
  }
  if (worse('mei')) return { image: 'street_tofu_closed', caption: C.STREET.tofu2, props };
  if (worse('gao')) return { image: 'street_butcher_closed', caption: C.STREET.butcher2, props };
  if (worse('zhou')) return { image: 'street_repair_closed', caption: C.STREET.repair2, props };
  // кому ночью стало хуже — видно и на улице, даже если у него нет лавки
  for (const pid of ['deng', 'feng', 'xu', 'lan']) if (worse(pid)) return { image: 'street_rain', caption: C.STREET[`${pid}2`], props };
  return { image: 'street_rain', caption: C.STREET.rain2, props };
}

// ── Последняя карточка ───────────────────────────────────────────────────────

/** Список: имя и судьба в нескольких словах, у умерших — причина (§23, раунд 16). Без оценок и счёта. */
export function closingCard(s) {
  const K = C.CLOSING;
  const rows = []; // данными: { pid, name, fate, cause? } — интерфейсу не делить строку по тире
  const h3 = s.history[3] || {};
  const known = (pid) => Object.values(s.history).some((h) => (h.known || []).includes(pid));
  // имя, сказанное ученику кем угодно (Бай — «к Сюю»), делает человека известным по имени (§23, раунд 23)
  const WHO = (pid) => (known(pid) || (s.heard || []).includes(pid) ? C.PEOPLE[pid].name : C.DESC[pid].cap);
  const add = (pid, name, fate, cause = null) => rows.push({ pid, name, fate, ...(cause ? { cause } : {}) });
  // Вэй
  const weiO = h3.outcomes && h3.outcomes.find((o) => o.pid === 'wei');
  if (s.others.wei.destroyed) add('wei', WHO('wei'), fill(weiO && weiO.delivery === 'drink' ? K.wei.measure_drink : K.wei.measure_home, 'wei'));
  else add('wei', WHO('wei'), fill(s.others.wei.revealed ? K.wei.walks_pinch : K.wei.walks, 'wei'));
  // Мэй
  if (h3.verdict) {
    const v = h3.verdict;
    const c = h3.meiCase || '';
    let key;
    if (v === 'killed') key = c === 'measure_drink' ? 'killed_drink' : 'killed_home';
    else if (v === 'gone') key = c.startsWith('herb_wrong') ? 'gone_wrong' : c.startsWith('herb_none') ? 'gone_none' : 'gone_away';
    else key = v;
    add('mei', WHO('mei'), fill(K.mei[key], 'mei'));
  }
  // остальные живые: где они к концу демо; умершие — с причиной
  const allDeaths = Object.values(s.history).flatMap((h) => h.deaths || []);
  for (const pid of ['deng', 'lan', 'feng', 'zhou', 'gao', 'xu']) {
    const p = s.people[pid];
    if (!p) continue;
    const d = allDeaths.find((x) => x.pid === pid);
    if (d) {
      const c = d.cause === 'refused' && d.letIn ? 'refused_inside' : d.cause;
      const cause = fill(fill(K.cause[c] || K.cause.other, pid, d.vars || {}), pid, d.vars || {});
      // данные чистые: судьба — «умер», причина — отдельно; строка текста — «умер: причина» (§23, раунд 24)
      add(pid, WHO(pid), fill(K.deadFate, pid), cause);
      continue;
    }
    const wasEdge = Object.values(s.history).some((h) => h.outcomes.some((o) => o.pid === pid && o.degBefore >= 3));
    let k = wasEdge && p.deg < 3 ? 'returned' : Math.min(4, p.deg);
    if (k === 2 && !known(pid)) k = 'worseUnseen'; // «хуже, чем в первый раз» — только о том, кого ученик видел
    add(pid, WHO(pid), fill(K.alive[k], pid));
  }
  // приезжая
  const h1 = s.history[1];
  const baiO = h1 && h1.outcomes.find((o) => o.pid === 'bai');
  if (baiO) {
    let k = 'declined';
    if (s.paperCoins.some((c) => c.pid === 'bai')) k = 'paper';
    else if (baiO.result === 'refused') k = (h1.opened || []).includes('bai') ? 'refused' : 'unopened';
    else if (baiO.result === 'unreceived') k = 'unreceived';
    add('bai', k === 'unopened' ? C.DESC.bai.cap : WHO('bai'), fill(K.bai[k], 'bai'));
  }
  add('qian', C.PEOPLE.qian.name, K.qian);
  add('liu', K.liuName, K.liu);
  const lines = [...rows.map((r) => fill(K.row, r.pid, { WHO: r.name, FATE: r.cause ? fill(K.dead, r.pid, { CAUSE: r.cause }) : r.fate })), K.end];
  return { title: K.title, lines, rows };
}
