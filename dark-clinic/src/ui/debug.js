// Отладочная поверхность для снимков и критиков: window.__game.
// Включена при ?debug=1 или когда страницей управляет автомат (navigator.webdriver).
// Игроку ничего лишнего не показывает.

import { clearSave, SAVE_KEY } from './engine-adapter.js';
import { placeOf } from './present.js';
import { t } from './strings/index.js';

function visible(el) {
  if (!el.isConnected) return false;
  const r = el.getBoundingClientRect();
  if (r.width < 1 || r.height < 1) return false;
  const st = getComputedStyle(el);
  return st.visibility !== 'hidden' && st.display !== 'none';
}

function uiActs() {
  const seen = new Set();
  const out = [];
  for (const el of document.querySelectorAll('[data-act]')) {
    if (!visible(el)) continue;
    const id = el.dataset.act;
    if (seen.has(id)) continue;
    seen.add(id);
    const label = (el.getAttribute('aria-label') || el.querySelector('.act-label')?.textContent || el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 80);
    const rec = { id, kind: el.classList.contains('hotspot') ? 'hotspot' : el.classList.contains('act') ? 'action' : 'ui', label };
    if (el.dataset.cost != null) rec.cost = +el.dataset.cost;
    if (el.getAttribute('aria-disabled') === 'true') { rec.enabled = false; const r = el.querySelector('.act-reason'); if (r) rec.reason = r.textContent; }
    out.push(rec);
  }
  return out;
}

export function installDebug(shell) {
  const api = {
    version: 1,
    saveKey: SAVE_KEY,
    view() {
      const v = shell.view();
      const cur = shell.scenes.current;
      return {
        ...v,
        shell: {
          scene: shell.scenes.name,
          busy: shell.busy,
          screen: shell.scenes.name,
          atTitle: shell.atTitle,
          hasSave: shell.hasSave,
          speed: shell.speed,
          manifest: !!shell.assets.manifest,
          oilShown: Math.round(shell.oilShown * 100) / 100,
          overlay: shell.overlay?.kind || null,
          menu: shell.menu ? shell.menu.dataset.act : null,
          dialogue: shell.dialogue.current ? { ...shell.dialogue.current, queued: shell.dialogue.queue.length } : null,
          audio: { ready: shell.audio.ready, muted: shell.audio.muted, recent: shell.audio.log.slice(-12) },
          scale: Math.round(shell.stage.scale * 1000) / 1000,
          tooSmall: shell.stage.tooSmall,
          ...(cur?.debugState ? cur.debugState() : {}),
        },
      };
    },
    /** Действия движка (с ценой, причиной и тем, где их искать на экране) и всё нажимаемое сейчас. */
    actions() {
      const v = shell.view();
      const engine = shell.actions().map((a) => {
        const place = shell.placeNow(a, v);
        const open = ['panel', 'board', 'drawers', 'poison'].includes(place) ? null : place;
        return { ...a, place, open };
      });
      if (shell.atTitle) {
        engine.push({ key: 'title.new', id: 'title.new', label: t('debug.new'), cost: 0, enabled: true, place: 'panel', open: null });
        if (shell.hasSave) engine.push({ key: 'title.continue', id: 'title.continue', label: t('debug.continue'), cost: 0, enabled: true, place: 'panel', open: null });
      }
      return { engine, screen: uiActs() };
    },
    /** key — ключ действия движка ('ask:thirst'), 'title.new' / 'title.continue' или data-act на экране. */
    do(key, params) {
      const acts = shell.actions();
      const ea = acts.find((a) => a.key === key) || acts.find((a) => a.id === key && a.param === undefined);
      if (ea || key.startsWith('title.')) return shell.perform(key, params);
      const el = [...document.querySelectorAll(`[data-act="${CSS.escape(key)}"]`)].find(visible);
      if (el) { el.click(); return { ok: true, clicked: key }; }
      return { ok: false, error: `no action or element «${key}»` };
    },
    /** Повторить стук того, кто сейчас у ставни (только звук и тень, правила не трогает). */
    knock() {
      const d = shell.view().nightView?.door;
      if (!d || !shell.scenes.current?.knock) return false;
      import('./present.js').then(({ knockFromData }) => shell.scenes.current.knock({ ...knockFromData(d.knockData), silhouette: d.silhouette }));
      return true;
    },
    /** Все строки, что были показаны полосой реплик (для проверки, что ничего не потеряно). */
    shown() { return (shell.shownLines || []).slice(); },
    fast(k = 0.05) { shell.speed = k; return k; },
    /** Снимок без интерфейса: прячет слои кнопок и текста и меловые отметки масла. */
    noui(on = true) { shell.hideGauge = !!on; document.getElementById('stage').classList.toggle('noui', !!on); return !!on; },
    scene(name, opts = {}) { return shell.jump(name, opts).then(() => api.view()); },
    setOil(n) { shell.setOil(n); return shell.oil; },
    /** Только для снимков: положить в вид ночи тело у стены (как в nightView.bodyAtWall), правил не трогает. */
    bodyAtWall(on = true) {
      const g = shell.game, orig = g._origView || (g._origView = g.view.bind(g));
      g.view = on ? () => { const v = orig(); if (v.nightView) v.nightView = { ...v.nightView, bodyAtWall: { known: true } }; return v; } : orig;
      shell.scenes.update(shell.view(), []);
      return on;
    },
    /** Есть ли картинка в манифесте (для проверок замены). */
    hasAsset(key) { return shell.assets.has(key); },
    candle(on = true) { const r = shell.game.debugCandle(on); shell.scenes.update(shell.view(), []); return r; },
    /** Счёт минут по ночам: мс по ночам (досчитано до сейчас) и то, что покажет последняя карточка. */
    playtime() { const s = shell.playtime.summary(); return { nights: { ...shell.playtime.nights }, ok: shell.playtime.ok, summary: s }; },
    busy() { return shell.busy; },
    ready() { return !!shell.ready; },
    freeze(on = true) { shell.flicker.frozen = !!on; return shell.flicker.frozen; },
    async resume() {
      if (shell.atTitle && shell.hasSave) {
        shell.perform('title.continue');
        await new Promise((r) => setTimeout(r, 50));
      }
      return { phase: shell.view().phase, screen: shell.view().screen };
    },
    reset() { clearSave(); return true; },
    audio: shell.audio,
  };
  window.__game = api;
}
