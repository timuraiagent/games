// Сборка содержимого одного языка: данные (data/ — структура, коды, правила) + текст языка (ru/ или en/).
// В data на месте каждой строки текста стоит null; текст лежит в ru/ и en/ по тем же путям ключей.
// Здесь же — то, что выводится из текста: строки листа правил из его схемы.
import * as DATA_PEOPLE from './data/people.js';
import * as DATA_SIGNS from './data/signs.js';
import * as DATA_VISITS from './data/visits.js';
import * as DATA_LIU from './data/liu.js';
import * as DATA_MORNING from './data/morning.js';
import * as DATA_SYSTEM from './data/system.js';

export const MODULES = ['people', 'signs', 'visits', 'liu', 'morning', 'system'];
export const DATA = { people: DATA_PEOPLE, signs: DATA_SIGNS, visits: DATA_VISITS, liu: DATA_LIU, morning: DATA_MORNING, system: DATA_SYSTEM };

/** Текст поверх данных: строка текста встаёт на место null; null в тексте — «здесь текста нет». */
export function merge(data, text) {
  if (text === undefined || text === null) return data;
  if (data === undefined || data === null) return text;
  if (Array.isArray(data) && Array.isArray(text)) {
    return Array.from({ length: Math.max(data.length, text.length) }, (_, k) => merge(data[k], text[k]));
  }
  if (typeof data === 'object' && typeof text === 'object' && !Array.isArray(text)) {
    const out = Array.isArray(data) ? [...data] : { ...data };
    for (const k of Object.keys(text)) out[k] = merge(data[k], text[k]);
    return out;
  }
  return text;
}

/** Строки листа из его схемы: пара — два столбца, каждый своей строкой; список — заголовок и пункт за пунктом. */
export function sheetLines(blocks) {
  const out = [];
  const col = (c) => `${c.title}: ${c.items.join(', ')}.`;
  for (const b of blocks) {
    if (b.type === 'line') out.push(b.text);
    else if (b.type === 'pair') out.push(col(b.left), col(b.right));
    else if (b.type === 'list') out.push(`${b.title}:`, ...b.items.map((x) => `· ${x}.`));
  }
  return out;
}

/** Всё содержимое одного языка одним объектом: { PEOPLE, FIRST, …, LANG }. */
export function build(lang, textModules) {
  const out = { LANG: lang };
  for (const m of MODULES) {
    const D = DATA[m];
    const T = textModules[m] || {};
    for (const name of new Set([...Object.keys(D), ...Object.keys(T)])) out[name] = merge(D[name], T[name]);
  }
  const sheets = {};
  for (const [n, sh] of Object.entries(out.RULE_SHEETS)) sheets[n] = { ...sh, lines: sheetLines(sh.blocks) };
  out.RULE_SHEETS = sheets;
  return out;
}
