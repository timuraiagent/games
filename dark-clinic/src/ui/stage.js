// Сцена 1672×941: масштаб под окно с полями, слои, «окно мало».

export const STAGE_W = 1672;
export const STAGE_H = 941;
const MIN_SCALE = 0.6; // 1280×620 (ноутбук 1366×768 с окном браузера) должен идти; мелкие подписи там крупнее

export function createStage() {
  const el = document.getElementById('stage');
  const frame = document.getElementById('frame');
  const tooSmall = document.getElementById('too-small');
  const layers = {
    bg: document.getElementById('layer-bg'),
    sprites: document.getElementById('layer-sprites'),
    light: document.getElementById('layer-light'),
    ui: document.getElementById('layer-ui'),
    text: document.getElementById('layer-text'),
    fade: document.getElementById('layer-fade'),
  };
  const ctx = {
    bg: layers.bg.getContext('2d'),
    sprites: layers.sprites.getContext('2d'),
    light: layers.light.getContext('2d'),
  };
  for (const c of Object.values(ctx)) c.imageSmoothingEnabled = false;

  const stage = { el, layers, ctx, scale: 1, offsetX: 0, offsetY: 0, tooSmall: false };

  function fit() {
    const w = window.innerWidth, h = window.innerHeight;
    const s = Math.min(w / STAGE_W, h / STAGE_H);
    stage.scale = s;
    stage.offsetX = Math.round((w - STAGE_W * s) / 2);
    stage.offsetY = Math.round((h - STAGE_H * s) / 2);
    el.style.transform = `translate(${stage.offsetX}px, ${stage.offsetY}px) scale(${s})`;
    // Пиксели рисунка — чёткие при увеличении; при уменьшении «ближайший сосед» рвёт рисунок, там сглаживаем.
    el.classList.toggle('px', s >= 0.999);
    // в маленьком окне мелкие подписи крупнее, чтобы на экране они были не меньше ~12 px
    el.classList.toggle('tight', s < 0.82);
    stage.tooSmall = s < MIN_SCALE;
    tooSmall.hidden = !stage.tooSmall;
    frame.style.visibility = stage.tooSmall ? 'hidden' : 'visible';
  }
  window.addEventListener('resize', fit);
  fit();

  /** Перевод координат окна в логические координаты сцены. */
  stage.toStage = (clientX, clientY) => ({
    x: (clientX - stage.offsetX) / stage.scale,
    y: (clientY - stage.offsetY) / stage.scale,
  });

  stage.clearUI = () => { layers.ui.replaceChildren(); layers.text.replaceChildren(); };
  stage.clearCanvases = () => {
    for (const c of Object.values(ctx)) c.clearRect(0, 0, STAGE_W, STAGE_H);
  };

  return stage;
}
