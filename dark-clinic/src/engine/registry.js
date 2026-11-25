// Реестр всего, что игрок получает даром (§23, «Честный шум»: «Всё, что даётся даром…»).
// Жалоба и слова с порога, лицо и портрет, рука при любом пульсе, стук и тень, медная банка,
// то, что видно, когда гость вошёл и сел, и то, что гость помнит о прошлой ночи.
// Тесты сканируют этот реестр на слова обеих осей доски и степени.
import { C, setLang } from './lang.js';

// Каждое поле визита, что игрок видит или слышит даром (или до решения), — и в каком канале.
// Поля с текстом, которых здесь нет, должны быть в PAID: тест (round21) не даёт тексту обойти реестр.
export const FREE_FIELDS = {
  knock: 'knock', knockAgain: 'knock', faceAgain: 'face',
  reflection: 'jar', reflectionAgain: 'jar', reflectionCandle: 'jar', reflectionInside: 'jar', reflectionInsideAgain: 'jar', afterScales: 'jar',
  inside: 'room', insideAgain: 'room', seatedLine: 'room',
  armText: 'arm', wrist: 'arm',
  payText: 'pay', payAgain: 'pay', giftText: 'pay',
  leave: 'leave', leaveAgain: 'leave', leaveInside: 'leave',
  homeBody: 'home', decline: 'greet',
};
// Поля, за которые платят маслом или которые звучат уже после решения (питьё, плата травой, раскрытие).
export const PAID_FIELDS = ['answers', 'thirstBy', 'durationBy', 'chillsBy', 'chillsNoise', 'byLoc', 'drink', 'drinkCandle', 'reveal', 'closeLabel', 'greet', 'greetVariants', 'greetAfter', 'greetExtra', 'answerVariants', 'leaveHarmed'];

function push(out, item) {
  if (item.text == null || item.text === '') return;
  out.push(item);
}

function linesOf(list) {
  return (list || []).map((l) => l.text);
}

/** Все даровые тексты и коды: [{ id, channel, night, pid, kind, text }]. kind — 'living' | 'dead' | 'skin' | 'scene'. */
export function freeTexts(lang = 'ru') {
  setLang(lang);
  const out = [];
  for (const [vid, c] of Object.entries(C.FIRST)) {
    const night = Number(vid[1]);
    const kind = c.truth ? c.truth.kind : 'scene';
    const base = { night, pid: c.pid, kind, vid };
    linesOf(c.greet).forEach((text, k) => push(out, { ...base, id: `${vid}.greet[${k}]`, channel: c.greet[k].speaker ? 'greet' : 'face', text }));
    for (const [key, list] of Object.entries(c.greetVariants || {})) linesOf(list).forEach((text, k) => push(out, { ...base, id: `${vid}.greetVariants.${key}[${k}]`, channel: 'memory', text }));
    linesOf(c.greetAfter).forEach((text, k) => push(out, { ...base, id: `${vid}.greetAfter[${k}]`, channel: 'greet', text }));
    for (const [f, ch] of Object.entries(FREE_FIELDS)) if (typeof c[f] === 'string') push(out, { ...base, id: `${vid}.${f}`, channel: ch, text: c[f] });
    if (c.portrait || C.PEOPLE[c.pid]) push(out, { ...base, id: `${vid}.portrait`, channel: 'portrait', text: c.portrait || C.PEOPLE[c.pid].portrait });
    if (C.PEOPLE[c.pid]) push(out, { ...base, id: `${vid}.silhouette`, channel: 'shadow', text: C.PEOPLE[c.pid].silhouette });
    if (C.KNOCK_DATA[vid]) push(out, { ...base, id: `${vid}.knockData`, channel: 'knockData', text: JSON.stringify(C.KNOCK_DATA[vid]) });
    if (c.answers && c.answers.home) [].concat(c.answers.home).forEach((a, k) => push(out, { ...base, id: `${vid}.answers.home[${k}]`, channel: 'home', text: a.text }));
    if (c.signs && c.signs.arm) push(out, { ...base, id: `${vid}.arm`, channel: 'arm', text: c.armText || (['warm', 'sweaty'].includes(c.signs.arm) ? C.ARM_OF[c.pid] : null) || C.ARM[c.signs.arm] });
  }
  for (const [pid, c] of Object.entries(C.WORSE)) {
    const base = { night: 0, pid, kind: 'living', vid: `worse_${pid}` };
    linesOf(c.greet).forEach((text, k) => push(out, { ...base, id: `worse.${pid}.greet[${k}]`, channel: c.greet[k].speaker ? 'greet' : 'face', text }));
    for (const [key, list] of Object.entries(c.greetVariants || {})) linesOf(list).forEach((text, k) => push(out, { ...base, id: `worse.${pid}.greetVariants.${key}[${k}]`, channel: 'memory', text }));
    for (const [f, ch] of Object.entries(FREE_FIELDS)) if (typeof c[f] === 'string') push(out, { ...base, id: `worse.${pid}.${f}`, channel: ch, text: c[f] });
    if (c.home) [].concat(c.home).forEach((a, k) => push(out, { ...base, id: `worse.${pid}.home[${k}]`, channel: 'home', text: a.text }));
  }
  for (const [pid, c] of Object.entries(C.THANKS)) {
    const base = { night: 0, pid, kind: 'living', vid: `thanks_${pid}` };
    linesOf(c.greet).forEach((text, k) => push(out, { ...base, id: `thanks.${pid}.greet[${k}]`, channel: c.greet[k].speaker ? 'greet' : 'face', text }));
    for (const [f, ch] of Object.entries(FREE_FIELDS)) if (typeof c[f] === 'string') push(out, { ...base, id: `thanks.${pid}.${f}`, channel: ch, text: c[f] });
  }
  for (const [pid, text] of Object.entries(C.ARM_OF)) push(out, { night: 0, pid, kind: 'living', vid: `arm_${pid}`, id: `ARM_OF.${pid}`, channel: 'arm', text });
  for (const [k, text] of Object.entries(C.ARM)) push(out, { night: 0, pid: null, kind: 'any', vid: 'arm', id: `ARM.${k}`, channel: 'arm', text });
  for (const [pid, list] of Object.entries(C.BRINK)) linesOf(list).forEach((text, k) => push(out, { night: 0, pid, kind: 'living', vid: `brink_${pid}`, id: `BRINK.${pid}[${k}]`, channel: 'brink', text }));
  for (const [k, text] of Object.entries(C.CLIMAX.meiWaits)) push(out, { night: 3, pid: 'mei', kind: 'living', vid: 'climax', id: `CLIMAX.meiWaits.${k}`, channel: 'room', text });
  for (const [k, text] of Object.entries(C.CLIMAX.knock)) push(out, { night: 3, pid: 'mei', kind: 'living', vid: 'climax', id: `CLIMAX.knock.${k}`, channel: 'knock', text });
  push(out, { night: 0, pid: null, kind: 'any', vid: 'room', id: 'REFLECTION_INSIDE', channel: 'jar', text: C.REFLECTION_INSIDE });
  return out;
}
