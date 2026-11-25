// Языки игры. Русский — исходный; английский — его зеркало ключ в ключ (en/ — те же модули, имена и пути).
// Язык выбирают для новой игры и не меняют до её конца: contentFor(lang) — всё содержимое этого языка.
import { build, MODULES } from './build.js';
import * as RU_PEOPLE from './ru/people.js';
import * as RU_SIGNS from './ru/signs.js';
import * as RU_VISITS from './ru/visits.js';
import * as RU_LIU from './ru/liu.js';
import * as RU_MORNING from './ru/morning.js';
import * as RU_SYSTEM from './ru/system.js';
import * as EN_PEOPLE from './en/people.js';
import * as EN_SIGNS from './en/signs.js';
import * as EN_VISITS from './en/visits.js';
import * as EN_LIU from './en/liu.js';
import * as EN_MORNING from './en/morning.js';
import * as EN_SYSTEM from './en/system.js';

export const LANGS = ['ru', 'en'];
export const DEFAULT_LANG = 'ru';
export const TEXT = {
  ru: { people: RU_PEOPLE, signs: RU_SIGNS, visits: RU_VISITS, liu: RU_LIU, morning: RU_MORNING, system: RU_SYSTEM },
  en: { people: EN_PEOPLE, signs: EN_SIGNS, visits: EN_VISITS, liu: EN_LIU, morning: EN_MORNING, system: EN_SYSTEM },
};
export { MODULES };

const cache = {};
/** Содержимое языка (собирается один раз). Неизвестный язык — русский. */
export function contentFor(lang) {
  const l = LANGS.includes(lang) ? lang : DEFAULT_LANG;
  return (cache[l] ||= build(l, TEXT[l]));
}
