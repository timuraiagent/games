// Язык партии. Содержимое — в content/ (ru — исходный, en — его зеркало ключ в ключ); движок берёт его через C.
// C смотрит в язык той партии, с которой движок сейчас работает: каждый вход в движок (createGame, perform,
// getActions, getView, freeTexts) ставит язык из состояния. Язык выбран при новой игре и до конца не меняется.
import { contentFor, DEFAULT_LANG, LANGS } from '../content/lang.js';

let active = DEFAULT_LANG;
export const C = new Proxy({}, {
  get(_, k) { return contentFor(active)[k]; },
  has(_, k) { return k in contentFor(active); },
  ownKeys() { return Reflect.ownKeys(contentFor(active)); },
  getOwnPropertyDescriptor(_, k) { return Reflect.getOwnPropertyDescriptor(contentFor(active), k); },
});
/** Язык состояния (старые сохранения — русские). */
export function langOf(state) {
  return state && LANGS.includes(state.lang) ? state.lang : DEFAULT_LANG;
}
export function setLang(l) { active = LANGS.includes(l) ? l : DEFAULT_LANG; }
export function lang() { return active; }
export { LANGS, DEFAULT_LANG };
