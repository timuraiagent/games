// Сцены и медленные переходы через чёрное.
// Слои: фон (canvas) → фигуры (canvas) → свет и темнота (canvas) → интерфейс (DOM) → текст (DOM).

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export const FADE_OUT_MS = 900;
export const FADE_IN_MS = 1400;

export class Scenes {
  constructor(shell, registry) {
    this.shell = shell;
    this.registry = registry;   // name → (shell) => screen
    this.current = null;
    this.name = null;
    this.transitioning = false;
    this.seq = 0;
  }

  async _fade(to, ms) {
    const f = this.shell.stage.layers.fade;
    ms = Math.round(ms * (this.shell.speed ?? 1));
    f.style.transitionDuration = `${ms}ms`;
    f.classList.toggle('blocking', to > 0.5);
    // принудительно применить стиль до смены прозрачности
    void f.offsetWidth;
    f.style.opacity = String(to);
    if (ms) await sleep(ms + 30);
  }

  /** Перейти на сцену. opts.instant — без затемнения (для снимков и отладки). */
  async go(name, view, opts = {}) {
    const make = this.registry[name];
    if (!make) throw new Error('no scene ' + name);
    const my = ++this.seq;
    this.transitioning = true;
    const { stage } = this.shell;
    if (this.current && !opts.instant) await this._fade(1, opts.fadeOut ?? FADE_OUT_MS);
    else await this._fade(1, 0);
    if (my !== this.seq) return;
    try { this.current?.exit?.(); } catch (e) { console.error(e); }
    this.shell.closeTransient();
    stage.clearUI();
    stage.clearCanvases();
    this.shell.avoidRects = null;   // что меню не закрывает — у каждого экрана своё
    this.shell.oilRect = null;
    this.shell.tip.attach();
    const screen = make(this.shell);
    this.current = screen;
    this.name = name;
    stage.el.dataset.scene = name;
    await screen.enter(view, opts);
    if (my !== this.seq) return;
    await this._fade(0, opts.instant ? 0 : (opts.fadeIn ?? FADE_IN_MS));
    if (my === this.seq) this.transitioning = false;
  }

  update(view, events) { return this.current?.update?.(view, events || []); }

  frame(t, dt) {
    if (!this.current?.frame) return;
    try { this.current.frame(t, dt); } catch (e) {
      if (!this._frameErr) { this._frameErr = true; console.error(e); }
    }
  }
}
