// Движок «Ночного приёма». Чистые правила, без DOM и зависимостей.
//
//   createGame({ lang })         → состояние (обложка); lang — 'ru' (по умолчанию) или 'en', до конца партии
//   load(json) / save(state)     → простой JSON; то же сохранение грузится в браузере
//   getView(state)               → всё, что можно показать сейчас; скрытой правды нет
//   getActions(state)            → [{ id, key, param?, label, cost, enabled, reason, group }]
//   perform(state, id, params)   → { state, events, autosave, ok }; id можно писать как 'ask:thirst'
export { createGame, load, save, getActions, perform, SAVE_VERSION } from './game.js';
export { getView } from './view.js';
export { readSign, tally } from './map.js';
export * as rules from './rules.js';
export { LANGS, DEFAULT_LANG } from './lang.js';
