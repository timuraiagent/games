// Улица: кто живёт рядом с «Сто ящиков». Только данные.
// start — с чем человек приходит впервые (скрытая правда, в интерфейс не попадает).

// tongue — какой язык у человека при холоде и при жаре (для вернувшихся); о глубине болезни язык не говорит.
export const PEOPLE = {
  qian: {
    name: null, g: 'm', who: null,
    portrait: 'qian', silhouette: 'stout', seated: 'man',
  },
  zhou: {
    name: null, g: 'm', who: null,
    portrait: 'zhou', silhouette: 'man', seated: 'man', arm: 'sweaty',
    tongue: { cold: 'pale_swollen', heat: 'red_yellow' },
    start: { kind: 'living', temp: 'cold', loc: 'out', deg: 1 },
    shop: 'repair',
  },
  gao: {
    name: null, g: 'm', who: null,
    portrait: 'gao', silhouette: 'stout', seated: 'man', arm: 'sweaty',
    tongue: { cold: 'pale_white', heat: 'red_yellow' },
    start: { kind: 'living', temp: 'heat', loc: 'in', deg: 1 },
    shop: 'butcher',
  },
  lan: {
    name: null, g: 'f', who: null,
    portrait: 'lan', silhouette: 'woman', seated: 'woman', arm: 'warm',
    tongue: { cold: 'pale_white', heat: 'red_thin_yellow' },
    start: { kind: 'living', temp: 'heat', loc: 'out', deg: 1 },
  },
  mei: {
    name: null, g: 'f', who: null,
    portrait: 'mei_sick', silhouette: 'woman', seated: 'mei', arm: 'warm',
    tongue: { cold: 'pale_white', heat: 'red_thin_yellow' },
    start: { kind: 'living', temp: 'cold', loc: 'in', deg: 1 },
    shop: 'tofu',
  },
  xu: {
    name: null, g: 'm', who: null,
    portrait: 'xu', silhouette: 'man', seated: 'man', arm: 'warm',
    tongue: { cold: 'pale_swollen', heat: 'red_yellow' },
    start: { kind: 'living', temp: 'cold', loc: 'in', deg: 1 },
  },
  deng: {
    name: null, g: 'm', who: null,
    portrait: 'deng', silhouette: 'man', seated: 'man', arm: 'wet',
    tongue: { cold: 'pale_white', heat: 'red_thin_yellow' },
    start: { kind: 'living', temp: 'cold', loc: 'out', deg: 1 },
  },
  feng: {
    name: null, g: 'f', who: null,
    portrait: 'feng', silhouette: 'old_bent', seated: 'old_woman', arm: 'old',
    tongue: { cold: 'pale_swollen', heat: 'red_thin_yellow' },
    start: { kind: 'living', temp: 'heat', loc: 'out', deg: 1 },
  },
  bai: {
    name: null, g: 'f', who: null,
    portrait: 'bai', silhouette: 'smooth', seated: 'woman', arm: 'porcelain',
    // нарисованная кожа, горячая. В демо смирная: её цена придёт после трёх предупреждений (§7, правило 2).
    start: { kind: 'skin', temp: 'heat', loc: 'out', deg: null, costly: false, stake: 'xu' },
  },
  wei: {
    name: null, g: 'm', who: null,
    portrait: 'wei', silhouette: 'tall_thin', seated: 'wei', arm: 'earth',
    // мертвец, не знающий, что умер. Холодный. Пока он ходит домой, Мэй гаснет (§23, «Мертвец в доме»).
    start: { kind: 'dead', temp: 'cold', loc: 'in', deg: null, costly: true, stake: 'mei' },
  },
};

// Формы имени — у каждого языка свои (русские падежи, английский притяжательный): только в ru/people.js и en/people.js.

