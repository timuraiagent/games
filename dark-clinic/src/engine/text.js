// Подстановка в шаблоны содержимого: имя в падеже, слова по роду, переменные.
import { C, lang } from './lang.js';

/**
 * fill('{N} {ушёл|ушла}. {COST}', 'mei', { COST: '…' })
 *   {a|b}        — по роду первого человека (pid): a — он, b — она
 *   {2:a|b}      — по роду второго человека (vars.P2)
 *   {N}, {N2}    — имя первого и второго
 *   {N_форма}    — форма имени из таблицы языка (C.CASES): в русском gen/dat/acc/ins, в английском poss;
 *                  формы нет в этом языке — просто имя (не ошибка); то же {N2_форма}
 *   {KEY}        — переменная из vars; незаполненная остаётся как есть
 * Готовую строку движок не правит: всё, что зависит от языка, — в шаблоне.
 */
export function fill(tpl, pid, vars = {}) {
  if (tpl == null) return '';
  const p = C.PEOPLE[pid];
  const p2id = vars.P2 || null;
  const p2 = p2id ? C.PEOPLE[p2id] : null;
  const female = p && p.g === 'f';
  const female2 = p2 && p2.g === 'f';
  let s = String(tpl).replace(/\{2:([^{}|]*)\|([^{}|]*)\}/g, (_, m, f) => (female2 ? f : m));
  s = s.replace(/\{([^{}|:]*)\|([^{}|]*)\}/g, (_, m, f) => (female ? f : m));
  const nameForm = (who, person, form) => {
    if (!person) return '';
    const c = C.CASES && C.CASES[who];
    return (form && c && c[form]) || person.name;
  };
  s = s.replace(/\{(N2?)(?:_([a-z]+))?\}|\{([A-Z][A-Z0-9_]*)\}/g, (whole, n, form, key) => {
    if (n === 'N') return nameForm(pid, p, form);
    if (n === 'N2') return nameForm(p2id, p2, form);
    return key in vars ? String(vars[key]) : whole;
  });
  return s;
}

// Правило множественного числа — одно на язык: русский — одна|две|пять, английский — one|other.
const PLURAL = {
  ru: (n) => { const a = Math.abs(n) % 100; const b = a % 10; return a > 10 && a < 20 ? 2 : b === 1 ? 0 : b >= 2 && b <= 4 ? 1 : 2; },
  en: (n) => (Math.abs(n) === 1 ? 0 : 1),
};

/** plural(5, 'монета|монеты|монет') → 'монет'; формы — из C.NOUNS или строкой через «|». */
export function plural(n, forms) {
  const list = String(C.NOUNS && C.NOUNS[forms] ? C.NOUNS[forms] : forms).split('|');
  const k = (PLURAL[lang()] || PLURAL.en)(n);
  return list[Math.min(k, list.length - 1)];
}

/** countText(5, 'coin') → '5 монет' */
export function countText(n, forms) {
  return `${n} ${plural(n, forms)}`;
}

/** Список по правилам языка: «Лани, Дэна и Гао». */
export function joinList(items) {
  if (items.length < 2) return items.join('');
  return `${items.slice(0, -1).join(C.GRAMMAR.sep)}${C.GRAMMAR.and}${items[items.length - 1]}`;
}

export function capitalize(s) {
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}

// ── Рамка фразы (§23, раунд 22): четвёрки слов подряд; имена людей — одним знаком ──
let NAMES = null, NAMES_OF = null;
function nameWords() {
  if (NAMES_OF !== C.PEOPLE) {
    NAMES_OF = C.PEOPLE;
    NAMES = new Set(Object.keys(C.PEOPLE).flatMap((p) => [C.PEOPLE[p].name, ...Object.values(C.CASES[p] || {})]).map((w) => String(w).toLowerCase()));
  }
  return NAMES;
}
/** Куски речи без знаков: точка, вопрос, восклицание и абзац рвут цепочку; «Щепоть Фэн легла на жар» и «Щепоть Лани легла на жар» — одна рамка. */
export function frameWords(t) {
  const names = nameWords();
  return String(t).toLowerCase().split(/[.?!…\n]+/).map((part) => part.replace(/[«»—,;:()\x22]/g, ' ').split(/\s+/).filter(Boolean).map((w) => (names.has(w) ? '·' : w)));
}
/** Все четвёрки слов подряд внутри одного предложения. */
export function grams4(t) {
  const g = new Set();
  for (const w of frameWords(t)) for (let i = 0; i + 4 <= w.length; i++) g.add(w.slice(i, i + 4).join(' '));
  return g;
}
