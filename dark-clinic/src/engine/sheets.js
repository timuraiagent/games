// Правила приходят по ходу, а не списком (§23, раунд 28): какая строка листа известна игроку и когда она становится известна.
// Строка — line или list целиком; у пары-таблички известна каждая строка (row) отдельно, с обеих сторон сразу.
// Известное лежит в s.rulesKnown: { 'лист.id': true }. У старых сохранений его нет — тогда известно всё.
import { C } from './lang.js';
import { fill } from './text.js';

/** Все строки всех листов: { key: '1.door', n, id, when, kind: 'line'|'list'|'row', block, row? }. */
export function ruleIndex() {
  const out = [];
  for (const [nk, sh] of Object.entries(C.RULE_SHEETS)) {
    const n = Number(nk);
    for (const b of sh.blocks) {
      if (b.type === 'pair') b.rows.forEach((r, k) => out.push({ key: `${n}.${r.id}`, n, id: r.id, when: r.when, kind: 'row', block: b, k }));
      else out.push({ key: `${n}.${b.id}`, n, id: b.id, when: b.when, kind: b.type, block: b });
    }
  }
  return out;
}

export function isKnown(s, key) {
  return !s.rulesKnown || !!s.rulesKnown[key];
}

/** Словами учителя, которые ученик вспоминает: так строка звучит, когда её узнают по ходу. */
export function rememberText(r) {
  const b = r.block;
  let rule;
  if (r.kind === 'row') {
    const words = b.axis === 'temp' ? C.TEMP_WORD : C.LOC_AT;
    const [lw, rw] = b.axis === 'temp' ? [words.cold, words.heat] : [words.out, words.in];
    rule = fill(C.RULE_LEARN.row, null, { L: b.left.items[r.k], LW: lw, R: b.right.items[r.k], RW: rw });
  } else if (r.kind === 'list') rule = fill(C.RULE_LEARN.list, null, { TITLE: b.title, ITEMS: b.items.join('; ') });
  else rule = b.text;
  return fill(C.RULE_LEARN.line, null, { RULE: rule });
}

/** Строка листа — так, как она стоит на листе (для события и интерфейса). */
export function sheetText(r) {
  const b = r.block;
  if (r.kind === 'row') return `${b.labels[r.k]}: ${b.left.items[r.k]} | ${b.right.items[r.k]}`;
  if (r.kind === 'list') return `${b.title}: ${b.items.join('; ')}`;
  return b.text;
}

/** Вечер: строки «evening» листа n известны сразу (без события — они на листе с начала). */
export function learnEvening(s, n) {
  if (!s.rulesKnown) return;
  for (const r of ruleIndex()) if (r.n === n && r.when.includes('evening')) s.rulesKnown[r.key] = true;
}

const CHECK_DONE = {
  tongue: (rec) => !!rec.seen.tongue,
  pulse_rate: (rec) => !!rec.seen.pulse_rate,
  pulse_depth: (rec) => !!rec.seen.pulse_depth,
  mirror: (rec) => !!rec.seen.mirror,
  thirst: (rec) => !!rec.asked.thirst,
  duration: (rec) => !!rec.asked.duration,
  chills: (rec) => !!rec.asked.chills,
  rinse: (rec) => !!rec.rinsed,
  rest: (rec) => !!rec.rested,
};
const SIGN = {
  even: (g) => (g.check === 'tongue' && g.value === 'pink_even') || (g.check === 'pulse_rate' && g.value === 'even'),
  dead: (g) => (g.check === 'tongue' && g.value === 'grey_dry') || (g.check === 'arm' && g.value === 'earth') || (g.check === 'mirror' && g.value === 'clear') || (g.check === 'rest' && g.value === 'unchanged'),
  stain: (g) => g.check === 'tongue' && g.value === 'brown_stained',
  fast: (g) => g.check === 'pulse_rate' && g.value === 'fast',
};
// решение → какие действия его предлагают; на первом из них (в этом порядке) и стоит строка
const OFFER = {
  send_away: ['dont_open', 'refuse', 'give_home', 'give_drink'],
  take_pay: ['take_pay'],
  pinch: ['dose:pinch'],
  measure: ['dose:measure'],
  let_in: ['let_in'],
};

/**
 * После каждого шага: какие строки стали известны. Проверки и приметы — по тому, что ученик уже сделал этой ночью;
 * решения — по тому, что ему сейчас предложено (строка встаёт на это действие, warning, до следующего шага).
 * activeSpec — гость, к которому сейчас обращены действия (или null); acts — действия этого шага.
 */
export function learnRules(s, ev, acts, activeSpec, activeRec) {
  if (!s.rulesKnown || s.phase !== 'night' || !s.night) return;
  const recs = s.night.recs;
  const signs = recs.flatMap((r) => r.signs || []);
  const on = (key) => acts.find((a) => a.enabled && a.key === key);
  for (const r of ruleIndex()) {
    if (r.n > s.n || s.rulesKnown[r.key]) continue;
    let via = null;
    let action = null;
    for (const w of r.when) {
      const [kind, what] = w.split(':');
      if (kind === 'evening') via = 'evening';
      else if (kind === 'check' && recs.some((rec) => CHECK_DONE[what](rec))) via = 'check';
      else if (kind === 'sign' && signs.some(SIGN[what])) via = 'sign';
      else if (kind === 'act' && what === 'to_scales' && recs.some((rec) => rec.step === 'scales' || rec.wrapped)) via = 'decision';
      // строки о госте без холода и жара — у весов именно для такого гостя, до ящика и до его денег
      else if (kind === 'act' && what === 'to_scales_even' && activeRec && activeRec.step === 'scales' && activeSpec && activeSpec.truth && activeSpec.truth.kind === 'skin') via = 'decision';
      else if (kind === 'offer') {
        // «отпустить без свёртка» — только больному (сцене и благодарящему — нет)
        if (what === 'send_away' && !(activeSpec && activeSpec.type === 'patient')) continue;
        const a = OFFER[what].map(on).find(Boolean);
        if (a) { via = 'decision'; action = a.key; }
      } else if (kind === 'knock' && what === 'return' && activeSpec && activeSpec.type === 'patient' && activeRec && activeRec.step === 'knock' && activeSpec.mode === 'worse') {
        via = 'decision'; action = 'open_hatch';
      }
      if (via) break;
    }
    if (!via) continue;
    s.rulesKnown[r.key] = true;
    if (via === 'evening') continue; // с вечера на листе — без события
    const text = rememberText(r);
    ev.push({ type: 'rule_learned', sheet: r.n, id: r.id, row: r.kind === 'row', line: sheetText(r), text, via, action });
    if (action) {
      s.ruleWarn = s.ruleWarn || {};
      s.ruleWarn[action] = s.ruleWarn[action] ? `${s.ruleWarn[action]} ${text}` : text;
    }
  }
}

/** Утро: чего за ночь не коснулись — Лю дописал на лист. Возвращает, сколько строк дописано. */
export function fillByMorning(s, ev) {
  if (!s.rulesKnown) return 0;
  let k = 0;
  for (const r of ruleIndex()) {
    if (r.n > s.n || s.rulesKnown[r.key]) continue;
    s.rulesKnown[r.key] = true;
    k += 1;
    ev.push({ type: 'rule_learned', sheet: r.n, id: r.id, row: r.kind === 'row', line: sheetText(r), text: rememberText(r), via: 'morning', action: null });
  }
  return k;
}

/** Лист для view: известные строки; у табличек — все строки с названием, приметы только у известных. */
export function sheetView(s, n) {
  const sh = C.RULE_SHEETS[n];
  const blocks = [];
  const lines = [];
  for (const b of sh.blocks) {
    if (b.type === 'pair') {
      const rows = b.rows.map((r, k) => {
        const known = isKnown(s, `${n}.${r.id}`);
        return { id: r.id, label: b.labels[k], known, left: known ? b.left.items[k] : null, right: known ? b.right.items[k] : null };
      });
      // табличка появляется вместе с первой известной строкой и растёт по строке (§23, раунд 30): неизвестных строк
      // в lines нет вовсе, а в blocks они остаются с known: false — интерфейс их прячет
      const any = rows.some((r) => r.known);
      blocks.push({
        type: 'pair', id: b.id, rule: b.rule, known: any,
        left: { title: b.left.title, items: rows.map((r) => r.left) },
        right: { title: b.right.title, items: rows.map((r) => r.right) },
        rows,
      });
      if (any) {
        lines.push(`${b.left.title} | ${b.right.title}`);
        for (const r of rows) if (r.known) lines.push(`${r.label}: ${r.left} | ${r.right}`);
      }
      continue;
    }
    if (!isKnown(s, `${n}.${b.id}`)) continue;
    if (b.type === 'list') {
      blocks.push({ type: 'list', id: b.id, rule: b.rule, known: true, title: b.title, items: b.items.slice() });
      lines.push(`${b.title}:`, ...b.items.map((x) => `· ${x}.`));
    } else {
      blocks.push({ type: 'line', id: b.id, rule: b.rule, known: true, text: b.text });
      lines.push(b.text);
    }
  }
  return { n, title: sh.title, lines, blocks };
}
