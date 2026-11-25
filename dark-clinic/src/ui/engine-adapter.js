// Связь с движком правил (game/src/engine). Движок — единственный источник правил и текста.
//   createGame() / load(json) / save(state) / getView(state) / getActions(state) / perform(state, key)
// Сохранение — в localStorage под ключом night-reception-save-v2: { v: 1, state: <save(state)>, at }.

import * as E from '../engine/index.js';

export const SAVE_KEY = 'night-reception-save-v2';

export function readSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const rec = JSON.parse(raw);
    if (!rec || rec.v !== 1 || !rec.state) return null;
    E.load(rec.state); // проверка версии: чужое сохранение — как нет
    return rec;
  } catch { return null; }
}

/** Язык сохранённой игры (или null). */
export function saveLang() {
  try { const rec = readSave(); return rec ? (E.load(rec.state)?.lang || null) : null; } catch { return null; }
}

export function writeSave(state) {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify({ v: 1, state: E.save(state), at: Date.now() })); } catch { /* полное хранилище */ }
}

/** Язык, выбранный на обложке (для новой игры). Первый раз — русский, если браузер не английский. */
export const LANG_KEY = 'night-reception-lang';
export function readLang() {
  try { const l = localStorage.getItem(LANG_KEY); if (l === 'ru' || l === 'en') return l; } catch { /* */ }
  return /^en/i.test(navigator.language || '') ? 'en' : 'ru';
}
export function writeLang(l) { try { localStorage.setItem(LANG_KEY, l); } catch { /* */ } }

export function clearSave() {
  try { localStorage.removeItem(SAVE_KEY); } catch { /* */ }
}

/** Обёртка над состоянием: всё, что оболочке нужно от движка. */
export class Game {
  /** state — загруженное состояние; иначе новая партия на языке lang ('ru' | 'en'). */
  constructor(state, lang) { this.state = state || E.createGame({ lang }); }
  static fromSave(rec) { return new Game(E.load(rec.state)); }
  view() { return E.getView(this.state); }
  /** Действия; правило, которое впервые решает на действии, — отдельно от предупреждения о масле (ruleNote). */
  actions() {
    const W = (this.state && this.state.ruleWarn) || {};
    return E.getActions(this.state).map((a) => {
      const rule = W[a.key];
      if (!rule || !a.warning || !a.warning.startsWith(rule)) return a;
      const rest = a.warning.slice(rule.length).trim();
      return { ...a, ruleNote: rule, warning: rest || null };
    });
  }
  /** key — 'ask:thirst' или id без параметра. */
  perform(key, params) {
    const r = E.perform(this.state, key, params || {});
    if (r.ok) this.state = r.state;
    return r;
  }
  save() { writeSave(this.state); }
  /** Для снимков: лампа погасла, горит огарок (как в ночь 3 при стуке Вэя). */
  debugCandle(on = true) {
    if (this.state.phase !== 'night' || !this.state.night) return false;
    this.state.oil = 0; this.state.night.lampOut = true; this.state.night.candle = !!on;
    return true;
  }
  // для отладки и снимков: долить или слить масло, не трогая правил
  debugSetOil(n) {
    if (this.state.phase === 'night') {
      this.state.oil = Math.max(0, Math.round(n));
      if (this.state.night) { this.state.night.lampOut = this.state.oil <= 0; if (this.state.oil > 0) this.state.night.candle = false; }
    }
    else if (this.state.lampCap != null) this.state.lampCap = Math.max(0, Math.round(n));
  }
}
