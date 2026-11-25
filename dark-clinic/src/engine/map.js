// Чтение доски по листу Лю — то же знание, что у игрока на стене.
// Работает только с тем, что есть в getView: значения наблюдений, не правда.
import { C } from './lang.js';

const SOURCE = {
  tongue: 'tongue', rinse: 'tongue', pulse_rate: 'rate', pulse_depth: 'depth',
  thirst: 'thirst', duration: 'duration', chills: 'chills',
};

/** Что говорит одна примета по листу: { temp?, loc? } или {} если не говорит ничего. */
export function readSign(sign) {
  if (!sign) return {};
  const table = C.PUBLIC_MAP[SOURCE[sign.check]];
  if (!table || !sign.value) return {};
  return table[sign.value] || {};
}

/**
 * Голоса примет за каждый ответ доски. Последнее наблюдение по той же проверке
 * перекрывает прежнее (язык после полоскания, пульс после отдыха).
 */
export function tally(signs) {
  const latest = new Map();
  for (const s of signs) {
    const key = SOURCE[s.check] === 'tongue' ? 'tongue' : s.check;
    latest.set(key, s);
  }
  const votes = { cold: 0, heat: 0, out: 0, in: 0 };
  let unclear = 0;
  for (const s of latest.values()) {
    if (!SOURCE[s.check]) continue;
    const r = readSign(s);
    if (r.temp) votes[r.temp] += 1;
    if (r.loc) votes[r.loc] += 1;
    if (!r.temp && !r.loc) unclear += 1;
  }
  const temp = votes.cold > votes.heat ? 'cold' : votes.heat > votes.cold ? 'heat' : null;
  const loc = votes.out > votes.in ? 'out' : votes.in > votes.out ? 'in' : null;
  return { votes, temp, loc, unclear };
}
