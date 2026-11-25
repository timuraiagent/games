// Состав ночи и описание каждого визита: содержимое + приметы по скрытой правде.
import { C } from './lang.js';
import { GONE } from './rules.js';

const TONGUE_BY = {
  cold: { out: 'pale_white', in: 'pale_swollen' },
  heat: { out: 'red_thin_yellow', in: 'red_yellow' },
};

/**
 * Приметы живого по его природе (для вернувшихся). Серой руки и синевы нет ни на какой ступени:
 * на краю вернувшийся или просто болен — по руке и языку не понять, только отдыхом.
 */
export function deriveSigns(truth, person, noise) {
  // язык — только холод или жар; какой именно — у каждого свой, о глубине болезни он не говорит
  const tongue = (person.tongue && person.tongue[truth.temp]) || TONGUE_BY[truth.temp].out;
  const signs = {
    tongue,
    rate: truth.temp === 'cold' ? 'slow' : 'fast',
    depth: truth.loc === 'out' ? 'surface' : 'deep',
    mirror: 'strong', // «слабое зеркало» у вернувшегося выдавало бы край — его различает только отдых
    arm: person.arm === 'wet' ? 'warm' : person.arm,
  };
  if (noise && noise.cause === 'tea') { signs.tongueAfterRinse = tongue; signs.tongue = 'brown_stained'; }
  // крепкий чай частит пульс — после отдыха у лампы он честный
  if (noise && noise.signs.includes('pulse_rate') && signs.rate !== 'fast') { signs.rateAfterRest = signs.rate; signs.rate = 'fast'; }
  return signs;
}

/** Ветер ночи 3 прячет пульс вглубь у всех (§23, условие ночи): после отдыха — правда. */
function windDepth(signs, entry) {
  if (!/^n3_/.test(entry.vid) || signs.depth === 'deep') return signs;
  return { ...signs, depthAfterRest: signs.depth, depth: 'deep' };
}

/** Дождь ночи 2: кто пришёл с улицы, того знобит (§23, условие ночи) — озноб «да» у всех живых. */
function rainChills(answers, entry, truth) {
  if (!/^n2_/.test(entry.vid) || !truth || truth.kind !== 'living' || !answers) return answers;
  if (answers.chills.value === 'yes') return answers;
  return { ...answers, chills: { text: C.WORSE_RAIN_CHILLS, value: 'yes' } };
}

/** Что портит условие ночи у всех разом: дождь — озноб, ветер — глубину пульса. */
export function nightSpoils(vid) {
  if (/^n2_/.test(vid)) return ['chills'];
  if (/^n3_/.test(vid)) return ['pulse_depth'];
  return [];
}

function portraitFor(pid, truth) {
  if (pid === 'mei' && truth && truth.deg >= 3) return 'mei_edge';
  if (pid === 'lan' && truth && truth.deg >= 2) return 'lan'; // «жаркий» портрет даром выдавал бы жар (§23)
  if (pid === 'deng' && truth && truth.deg >= 2) return 'deng_tired';
  return C.PEOPLE[pid].portrait;
}

/** Полное описание визита из записи очереди. Содержит правду — только для движка. */
export function specOf(entry) {
  const person = C.PEOPLE[entry.pid];
  const key = entry.variant && entry.variant.key;
  if (entry.mode === 'first') {
    const c = C.FIRST[entry.vid];
    const truth = entry.truth || c.truth || null;
    // ночь 3: клетку задаёт движок — ответы и пульс по ней (ветер прячет пульс вглубь у всех)
    const byLoc = c.byLoc && truth ? c.byLoc[truth.loc] : null;
    const answers = rainChills(c.answers ? { ...c.answers, ...(byLoc || {}), ...((c.answerVariants && c.answerVariants[key]) || {}) } : undefined, entry, truth);
    let signs = c.signs ? { ...c.signs } : null;
    if (byLoc && signs) {
      signs.depth = 'deep';
      if (truth.loc === 'out') signs.depthAfterRest = 'surface'; else delete signs.depthAfterRest;
    }
    return {
      ...c,
      vid: entry.vid, pid: entry.pid, mode: 'first', truth, answers,
      portrait: c.portrait || person.portrait,
      knockData: C.KNOCK_DATA[entry.vid] || null,
      silhouette: person.silhouette,
      seated: person.seated,
      signs,
      weak: false,
    };
  }
  if (entry.mode === 'worse') {
    const c = C.WORSE[entry.pid];
    const truth = entry.truth;
    // второй возврат — своими словами, а не прошлой строкой слово в слово; остальное с порога (о соседе) сохраняется
    const said = c.greetVariants && ((entry.variant && entry.variant.again && c.greetVariants.again) || c.greetVariants[key]);
    const chillsLie = c.noise && c.noise.signs.includes('chills') && truth.loc === 'in' && c.chillsNoise; // названная причина портит и озноб
    const base = { thirst: c.thirstBy[truth.temp], duration: c.durationBy[truth.loc], chills: chillsLie || c.chillsBy[truth.loc], home: c.home };
    // второй возврат — и стук, и лицо другими словами (ревью, раунд 17: «Фартук в пятнах, не снят» дважды)
    const again = !!(entry.variant && entry.variant.again);
    const face = again && c.faceAgain ? { speaker: null, text: c.faceAgain } : c.greet[0];
    return {
      ...c,
      knock: again && c.knockAgain ? c.knockAgain : c.knock,
      greet: said ? [face, ...said, ...c.greet.slice(2)] : [face, ...c.greet.slice(1)],
      answers: rainChills(base, entry, truth),
      vid: entry.vid, pid: entry.pid, mode: 'worse', type: 'patient', truth,
      portrait: portraitFor(entry.pid, truth),
      knockData: C.KNOCK_DATA.worse[entry.pid] || null,
      silhouette: person.silhouette,
      seated: person.seated,
      signs: windDepth(deriveSigns(truth, person, c.noise), entry),
      weak: false,
      pay: { coins: 8 },
    };
  }
  const c = C.THANKS[entry.pid];
  return {
    ...c,
    vid: entry.vid, pid: entry.pid, mode: 'thanks', type: 'thanks', truth: null,
    knockData: C.KNOCK_DATA.thanks[entry.pid] || null,
    portrait: person.portrait, silhouette: person.silhouette, seated: person.seated,
  };
}

export const alive = (p) => p && !p.killed && p.deg < GONE;

/** Кто в ночь n приходит сам по сценарию (а значит, своё «придёт снова» выполняет и так). */
export function scriptedFor(n) {
  return C.NIGHT_ORDER[n].filter((v) => v !== 'SLOT').map((v) => C.FIRST[v].pid);
}

/**
 * Кто вернётся в ночь nNext по итогам прошлой ночи. Чистая функция:
 * outcomes — исходы прошлой ночи, people — лестница после утра.
 * { worse: [pid…] — на места «не помогло», overflow: [pid…] — мест не хватило, thanks: pid|null }
 */
export function planReturns(nNext, outcomes, people) {
  if (!C.NIGHT_ORDER[nNext]) return { worse: [], overflow: [], thanks: null, scripted: [] };
  const scripted = scriptedFor(nNext);
  const pool = C.SLOT_POOL[nNext];
  const worse = [];
  const thanks = [];
  outcomes.forEach((o, idx) => {
    const p = people[o.pid];
    if (!p || !alive(p)) return;
    if (o.returns === 'worse' && !scripted.includes(o.pid)) worse.push({ pid: o.pid, deg: p.deg, idx });
    if (o.returns === 'thanks' && pool.includes(o.pid) && !scripted.includes(o.pid)) thanks.push(o.pid);
  });
  worse.sort((a, b) => b.deg - a.deg || a.idx - b.idx);
  const fits = worse.filter((w) => pool.includes(w.pid));
  const back = fits.slice(0, C.RETURN_PLACES).map((w) => w.pid);
  const overflow = worse.map((w) => w.pid).filter((pid) => !back.includes(pid));
  const scriptedBack = outcomes.filter((o) => o.returns === 'worse' && scripted.includes(o.pid)).map((o) => o.pid);
  return {
    worse: back,
    overflow,
    thanks: pool.find((pid) => thanks.includes(pid)) || null,
    scripted: scriptedBack,
  };
}

/**
 * Очередь ночи n. Меняет state.people для тех, чья болезнь сдвинулась между ночами.
 * Записи: { vid, pid, mode, truth, variant }
 */
export function buildQueue(n, state) {
  const order = C.NIGHT_ORDER[n];
  const out = [];
  for (const vid of order) {
    if (vid === 'SLOT') {
      out.push(...slotEntries(n, state));
      continue;
    }
    const c = C.FIRST[vid];
    const pid = c.pid;
    const entry = { vid, pid, mode: 'first', truth: c.truth ? { ...c.truth } : null, variant: {} };
    const p = state.people[pid];
    if (p && !alive(p)) continue;
    // болезнь не стоит на месте: в ночь 3 клетка не та, что в прошлый визит (§23: память даром не отвечает)
    const flip = (loc) => (loc === 'out' ? 'in' : 'out');
    const lastLoc = (p && (p.lastCell ? p.lastCell.loc : p.loc)) || 'out';
    if (n === 3 && ['deng', 'lan', 'feng'].includes(pid)) {
      // прошлая ночь оставляет след: кто ушёл хуже — приходит хуже и помнит, что с ним сделали
      entry.variant.key = ['overdose', 'pinch_heat'].includes(p.last) ? 'harmed' : p.last === 'unreceived' ? 'unopened' : p.last === 'refused' ? (p.unopened ? 'unopened' : 'refused') : p.deg === 0 ? 'cured' : 'not_cured';
      const worse = p.deg >= 2 ? Math.min(2, p.deg - 1) : 0;
      if (pid === 'deng') setPerson(p, entry, 'cold', 'out', Math.min(4, 3 + (worse ? 1 : 0))); // на краю: холод, пристал недавно (§23)
      if (pid === 'lan') setPerson(p, entry, 'heat', flip(lastLoc), Math.min(4, 2 + worse));
      if (pid === 'feng') setPerson(p, entry, 'cold', 'out', Math.min(4, 1 + worse));
    }
    if (n === 3 && pid === 'mei') {
      // Мертвец в доме: в ночь 3 Мэй всегда на краю, место 3 (§23); болезнь не та, что в прошлый визит.
      setPerson(p, entry, 'cold', flip(lastLoc), 3);
    }
    if (pid === 'wei' && state.others.wei.destroyed) continue;
    out.push(entry);
  }
  return out;
}

function setPerson(p, entry, temp, loc, deg) {
  p.deg = deg; p.temp = temp; p.loc = loc;
  entry.truth = { kind: 'living', temp, loc, deg };
}

function slotEntries(n, state) {
  const plan = state.returnPlan && state.returnPlan[n];
  if (!plan) return [];
  const out = [];
  for (const pid of plan.worse) {
    const p = state.people[pid];
    if (!alive(p)) continue;
    const key = ['overdose', 'pinch_heat'].includes(p.last) ? 'harmed' : p.last === 'unreceived' ? 'unopened' : p.last === 'refused' ? (p.unopened ? 'unopened' : 'refused') : null;
    // болезнь меняется непредсказуемо: та же, наоборот по одной оси или по обеим (идемпотентно — от lastCell)
    const last = p.lastCell || { temp: p.temp, loc: p.loc };
    const shift = (C.RETURN_SHIFT[n] && C.RETURN_SHIFT[n][pid]) || 'loc';
    const ft = (t) => (t === 'cold' ? 'heat' : 'cold');
    const fl = (l) => (l === 'out' ? 'in' : 'out');
    p.temp = shift === 'temp' || shift === 'both' ? ft(last.temp) : last.temp;
    p.loc = shift === 'loc' || shift === 'both' ? fl(last.loc) : last.loc;
    const again = !!(state.history && state.history[n - 1] && state.history[n - 1].outcomes.some((o) => o.pid === pid && o.mode === 'worse'));
    const variant = {};
    if (key) variant.key = key;
    if (again) variant.again = true;
    out.push({
      vid: `n${n}_slot_${pid}`, pid, mode: 'worse',
      truth: { kind: 'living', temp: p.temp, loc: p.loc, deg: p.deg }, variant,
    });
  }
  if (plan.thanks) out.push({ vid: `n${n}_slot_${plan.thanks}`, pid: plan.thanks, mode: 'thanks', truth: null, variant: {} });
  return out;
}
