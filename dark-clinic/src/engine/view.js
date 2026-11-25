// Всё, что интерфейс может показать прямо сейчас. Скрытой правды здесь нет.
import { sheetView } from './sheets.js';
import { C, setLang, langOf } from './lang.js';
import { fill, countText } from './text.js';
import * as R from './rules.js';
import { specOf } from './visit.js';
import { morningSteps } from './morning.js';
import { blind, weiOutsideNow } from './game.js';

const vialTaken = (s) => s.phase === 'morning' && s.n === 2 && s.poison.vial;
function stocksView(s) {
  const herbs = {};
  for (const h of R.HERBS) herbs[h] = { name: C.HERB_NAMES[h], doses: s.herbs[h], image: h };
  const nightCash = s.night && !s.night.done ? s.night.cash.reduce((a, c) => a + c.coins, 0) : 0;
  const p = s.poison;
  return {
    herbs,
    coins: s.coins + nightCash,
    paperCoins: s.paperCoins.reduce((a, c) => a + c.coins, 0),
    poison: {
      pinches: p.pinches,
      vial: p.vial,
      sealed: p.sealed,
      key: p.key,
      image: s.n === 1 || vialTaken(s) ? 'seal' : p.vial ? 'vial' : `jar_poison_${Math.max(0, Math.min(3, p.pinches))}`,
      // утро 2: склянку Лю уже забрал — о ней больше не говорят (§23, раунд 25)
      text: s.n === 1
        ? C.VIEW.poisonNone
        : vialTaken(s)
          ? C.VIEW.vialTaken
          : p.vial
          ? (p.pinches > 0 ? C.VIEW.vialOne : C.VIEW.vialEmpty)
          : fill(C.VIEW.jar, null, { LEFT: C.VIEW.jarLeft[Math.max(0, Math.min(3, p.pinches))] }),
    },
    debt: s.debtKnown
      ? { total: 300, creditor: C.VIEW.creditor, terms: [{ after: 5, sum: 60 }, { after: 10, sum: 90 }, { after: 15, sum: 150 }], image: 'receipt' }
      : null,
  };
}

function visitorView(s, i) {
  const nt = s.night;
  const rec = nt.recs[i];
  const sp = specOf(nt.queue[i]);
  const known = rec.nameKnown;
  const seated = nt.seated === i;
  const where = rec.step === 'knock' ? 'door' : seated ? 'bench' : rec.letIn ? 'inside' : 'hatch';
  const seen = rec.seen;
  const answers = {};
  for (const t of R.QUESTION_TOPICS) if (seen[t]) answers[t] = seen[t].text;
  return {
    ref: `v${s.n}_${i}`,
    step: rec.step,
    where,
    knock: sp.knock,
    knockData: sp.knockData || null,
    offer: rec.step === 'payment' && sp.pay ? (sp.pay.coins ? { coins: sp.pay.coins } : { herb: sp.pay.herb }) : null,
    silhouette: blind(s) && rec.step === 'knock' ? null : sp.silhouette, // в темноте не видно и тени (при огарке — видно)
    // имя — если гостя видели при свете или он назвался сам (§23, раунд 16: одно имя везде)
    name: known && rec.known ? C.PEOPLE[sp.pid].name : null,
    who: known && rec.known ? C.PEOPLE[sp.pid].who : null,
    portrait: known && !rec.dark && !blind(s) ? sp.portrait : null, // в темноте лица не видно — и когда лампа погасла при госте; при огарке видно
    seatedImage: rec.letIn ? sp.seated : null,
    lines: rec.said.slice(),
    seen: {
      tongue: seen.tongue ? { image: seen.tongue.image, text: seen.tongue.text } : null,
      arm: seen.arm ? { image: seen.arm.image, armImage: seen.arm.armImage || null, text: seen.arm.text } : null,
      mirror: seen.mirror ? { image: seen.mirror.image, text: seen.mirror.text } : null,
      pulseRate: seen.pulse_rate ? seen.pulse_rate.text : null,
      pulseDepth: seen.pulse_depth ? seen.pulse_depth.text : null,
      rest: seen.rest ? seen.rest.text : null,
      pulseWeak: !!(sp.weak && (seen.pulse_rate || seen.pulse_depth)),
      rinsed: rec.rinsed,
      answers,
    },
    oilSpent: rec.oil,
    questionsAsked: rec.nAsked,
    board: {
      signs: rec.signs.map((x) => ({ ...x })),
      temp: rec.board.temp,
      loc: rec.board.loc,
      drawer: R.herbFor(rec.board.temp, rec.board.loc),
      drawerName: R.herbFor(rec.board.temp, rec.board.loc) ? C.HERB_NAMES[R.herbFor(rec.board.temp, rec.board.loc)] : null,
      questions: { temp: C.VIEW.questionTemp, loc: C.VIEW.questionLoc },
    },
    packet: { herb: rec.packet.herb, herbName: rec.packet.herb ? C.HERB_NAMES[rec.packet.herb] : null, dose: rec.packet.dose, wrapped: rec.wrapped },
  };
}

/** Утром — сколько будет в лампе вечером, тем же числом, что строка о лампе (бутыль Лю — только вечером ночи 3). */
function nextOil(s) {
  if (s.phase !== 'morning') return s.lampCap;
  return s.n < 3 ? (s.nextLampMorning ?? s.lampCap) : s.oil;
}

/** Что слышно в комнате: ночь 1 — тихо, ночь 2 — дождь, ночь 3 — ветер; он стихает, пока Вэй у окошка
 *  или в комнате, и возвращается, когда его не стало или он ушёл (§23, «Ночь 3»). */
function ambienceOf(s) {
  const nt = s.night;
  if (s.n === 2) return { wind: 'rain', rain: true };
  if (s.n !== 3) return { wind: 'quiet', rain: false };
  const w = nt.queue.findIndex((e) => e.pid === 'wei');
  // ветер стихает, пока Вэй у окошка, в комнате или ждёт её посреди улицы
  const silent = !nt.over && w >= 0 && ((nt.cur >= w && nt.recs[w].step !== 'done') || weiOutsideNow(s));
  return { wind: silent ? 'silent' : 'blowing', rain: false };
}

function lampShort(s) {
  const nt = s.night;
  if (nt && nt.lampOut && !nt.done && s.phase === 'night') return nt.candle ? C.VIEW.lampShortCandle : C.VIEW.lampShortOut;
  if (s.phase === 'morning') return s.n >= 3 ? null : fill(C.VIEW.lampShortNext, null, { X: countText(nextOil(s), 'spoon') });
  if (s.phase === 'night' || s.phase === 'evening') return fill(C.VIEW.lampShort, null, { X: countText(s.oil, 'spoon') });
  return null;
}

export function getView(state) {
  const s = state;
  setLang(langOf(s));
  if (s.phase === 'title') {
    return { phase: 'title', lang: langOf(s), title: { name: C.TITLE.name, sub: C.TITLE.sub, image: 'title' } };
  }
  const cal = C.CALENDAR[s.n];
  const base = {
    phase: s.phase,
    lang: langOf(s), // язык партии: интерфейс берёт по нему свои строки
    // последнее действие и все его строки (§23, раунд 29): после перезагрузки интерфейс дочитывает остаток
    last: s.last ? { step: s.last.step, events: structuredClone(s.last.events) } : null,
    night: s.n,
    seq: s.seq,
    calendar: cal ? { image: cal.image, date: cal.date, text: cal.text } : null,
    // свой язык ученика — виден и ночью; поднос и расписка — после перезагрузки тоже
    apprentice: { tongue: C.SELF[s.n] || null },
    tray: s.n >= 1 ? { image: s.n === 2 ? 'vial' : s.n === 3 ? 'key' : 'tray', text: C.EVENING_NOTES[s.n] || null } : null,
    receipt: s.debtKnown ? { image: 'receipt', text: C.VIEW.receipt } : null,
    lamp: {
      // утром — сколько будет в лампе вечером, тем же числом, что строка о лампе (бутыль Лю — только вечером ночи 3)
      oil: s.phase === 'night' || s.phase === 'evening' ? s.oil : nextOil(s),
      capacity: s.phase === 'morning' && s.n < 3 ? nextOil(s) : s.lampCap,
      bought: 0, // масло не продаётся
      note: s.phase === 'evening' ? s.lampNote || null : s.phase === 'night' ? s.lampNoteNight || s.lampNote || null : null,
      out: !!(s.night && s.night.lampOut && !s.night.done),
      candle: !!(s.night && s.night.candle && !s.night.done), // ночь 3: огарок свечи на последний приём — комната видна, масла нет
      // короткая строка для интерфейса — читается без наведения, на языке игры (§23, раунд 24)
      short: lampShort(s),
    },
    stocks: stocksView(s),
    // лист — схемой (blocks) для раскладки и строками (lines) для старых мест; строки собраны из схемы
    // листы — только то, что игроку уже известно; у табличек — все строки с названием (§23, раунд 28)
    rules: s.rulesSeen.map((n) => sheetView(s, n)),
    notes: s.notes
      .filter((x) => !(s.phase === 'morning' && x.n === s.n && x.when === 'morning'
        && morningSteps(s.n).indexOf(s.morning.step) < morningSteps(s.n).indexOf('note')))
      .map((x) => ({ ...x })),
    ledger: s.ledger.map((x) => ({ n: x.n, lines: x.lines.slice() })),
  };

  if (s.phase === 'evening') {
    let self = C.SELF[s.n];
    void self;
    base.evening = {
      calendar: base.calendar,
      rules: base.rules[base.rules.length - 1],
      note: C.EVENING_NOTES[s.n],
      self,
      tray: s.n === 2 ? 'vial' : s.n === 3 ? 'key' : 'tray',
      trayNote: s.n === 1 ? C.TRAY_FIRST : null, // что за поднос — один раз, в первый вечер
    };
    return base;
  }

  if (s.phase === 'night') {
    const nt = s.night;
    const doorIdx = nt.cur < nt.queue.length && !nt.over ? nt.cur : null;
    const door = doorIdx !== null ? visitorView(s, doorIdx) : null;
    const seated = nt.seated !== null ? visitorView(s, nt.seated) : null;
    // ночь 3: Мэй со свёртком ждёт Вэя — на табурете ('stool'), под навесом у окошка ('eaves') или мёртвая на табурете ('dead')
    let waiting = null;
    if (nt.meiWait && !nt.over) {
      const vv = visitorView(s, nt.meiWait.i);
      // spot — где она ждёт: 'eaves' (под навесом), 'stool' (на табурете), 'dead'; undecided — свёртка ещё нет
      waiting = { ...vv, where: nt.meiWait.undecided ? vv.where : nt.meiWait.where, spot: nt.meiWait.where, undecided: !!nt.meiWait.undecided };
    }
    const focus = nt.over ? null : nt.focus === 'seated' && seated ? 'seated' : nt.focus === 'waiting' && waiting ? 'waiting' : door ? 'door' : null;
    const active = focus === 'seated' ? seated : focus === 'waiting' ? waiting : focus === 'door' ? door : null;
    base.nightView = {
      focus,
      door,
      seated,
      waiting,
      active,
      step: active ? active.step : nt.over ? 'over' : null,
      over: nt.over,
      lampOut: nt.lampOut,
      received: nt.recs.filter((r) => r.step === 'done').length,
      // звук комнаты — в view, а не только в событиях: после загрузки его можно восстановить (раунд 15)
      ambience: ambienceOf(s),
      // горсть земли на табурете: Вэй выпил меру в комнате; лежит, пока никого не посадили и пока не кончилась ночь
      stoolEarth: !!(nt.earth && !nt.earthSwept),
      // с неживого сыпалась земля после щепоти — на этот приём (для картинки после перезагрузки, §23, раунд 29)
      revealed: nt.revealed || null,
      // тело на табурете — от строки смерти до строки, где его переносят; у стены под циновкой — от неё до конца ночи (§23, раунд 24)
      bodyOnStool: !!nt.bodyOnStool,
      bodyAtWall: nt.bodyAtWall ? { known: !!nt.bodyAtWall.known } : null,
      // стук, на который ещё не ответили, — тоже
      knock: door && door.step === 'knock' ? { text: door.knock, data: door.knockData || null } : null,
    };
    if (active && active.step === 'scales') {
      base.nightView.scales = {
        drawer: active.board.drawer,
        reflection: true,
        packet: active.packet,
      };
    }
    return base;
  }

  if (s.phase === 'morning') {
    const m = s.morning;
    const steps = morningSteps(s.n);
    const idx = steps.indexOf(m.step);
    const r = m.report;
    // касса и записка видны, как только их открыли, в любом порядке (§23, раунд 29)
    const upto = (k) => !!(m.seen && m.seen[k]) || steps.indexOf(k) <= idx;
    base.morning = {
      step: m.step,
      steps,
      ledger: r.ledger.slice(),
      cashbox: upto('cashbox') ? { lines: r.cashbox.lines.slice(), coins: s.coins } : null,
      note: upto('note') ? r.note : null,
      street: upto('street') ? {
        image: r.street.image, caption: r.street.caption, props: r.street.props.map((p) => ({ ...p })),
        // утро 3: что на столе у Мэй и что осталось в банке — полями, с подписью (для картинки)
        cups: r.street.cups ? { ...r.street.cups } : null,
        jar: r.street.jar ? { ...r.street.jar } : null,
      } : null,
      shop: m.step === 'shop'
        ? { herbPrice: R.HERB_PRICE, oil: null, boughtOil: false, bought: m.bought.slice(), text: C.SHOP.introBy[s.n] || C.SHOP.intro }
        : null,
      hook: upto('hook') ? { text: r.hook, image: s.n === 3 ? 'cinnabar_trace' : null } : null,
      nextLamp: s.n < 3 ? (s.nextLampMorning ?? s.lampCap) : null,
      nextLampNote: s.n < 3 ? s.nextLampNote || null : null,
    };
    return base;
  }

  if (s.phase === 'end') {
    // строки карточки — и текстом, и данными { pid, name, fate, cause? }: интерфейс не делит строку по тире
    base.end = { title: s.closing.title, lines: s.closing.lines.slice(), rows: (s.closing.rows || []).map((r) => ({ ...r })) };
    return base;
  }
  return base;
}
