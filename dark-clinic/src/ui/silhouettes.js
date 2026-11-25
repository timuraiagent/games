// Тень на бумаге окошка. Пока художник не дал silhouettes.*, тень рисуется здесь: мягкая,
// без подробностей — по ней можно гадать, но не узнать. Живые чуть дышат; Вэй и Бай — нет.

const cache = new Map();

const SHAPES = {
  // голова: cx, cy, rx, ry; плечи: верх y, ширина у шеи и внизу; наклон; дышит ли
  man:       { head: [0.50, 0.36, 0.13, 0.17], neck: 0.06, sh: [0.60, 0.40, 0.84], breathe: 1 },
  woman:     { head: [0.51, 0.40, 0.115, 0.15], neck: 0.05, sh: [0.62, 0.34, 0.70], scarf: true, breathe: 1 },
  old_bent:  { head: [0.40, 0.56, 0.12, 0.14], neck: 0.05, sh: [0.70, 0.40, 0.74], hunch: true, breathe: 1 },
  tall_thin: { head: [0.50, 0.12, 0.11, 0.16], neck: 0.05, sh: [0.38, 0.30, 0.58], longNeck: true, breathe: 0 },
  smooth:    { head: [0.50, 0.38, 0.115, 0.155], neck: 0.045, sh: [0.60, 0.32, 0.66], scarf: false, sharp: true, breathe: 0 },
  stout:     { head: [0.50, 0.42, 0.155, 0.18], neck: 0.09, sh: [0.62, 0.56, 1.02], breathe: 1 },
};

export const SILHOUETTE_TYPES = Object.keys(SHAPES);

export function silhouetteInfo(type) { return SHAPES[type] || SHAPES.man; }

/** Холст с тенью нужного размера (w×h — бумага окошка). */
export function silhouetteCanvas(type, w, h) {
  const key = `${type}:${w}x${h}`;
  if (cache.has(key)) return cache.get(key);
  const s = SHAPES[type] || SHAPES.man;
  const pad = 20;
  const c = document.createElement('canvas');
  c.width = w + pad * 2; c.height = h + pad * 2;
  const g = c.getContext('2d');
  g.translate(pad, pad);
  g.filter = s.sharp ? 'blur(2.5px)' : 'blur(6px)';
  g.fillStyle = '#000';
  const [hx, hy, rx, ry] = s.head;
  // плечи и тело
  const [shY, topW, botW] = s.sh;
  g.beginPath();
  const cx = w * 0.5 + (s.hunch ? -w * 0.06 : 0);
  g.moveTo(cx - (w * topW) / 2, h * shY);
  g.bezierCurveTo(cx - (w * topW) / 2 - w * 0.06, h * shY + h * 0.06, cx - (w * botW) / 2, h * (shY + 0.14), cx - (w * botW) / 2, h + 10);
  g.lineTo(cx + (w * botW) / 2 + (s.hunch ? w * 0.08 : 0), h + 10);
  if (s.hunch) g.bezierCurveTo(cx + (w * botW) / 2 + w * 0.06, h * (shY - 0.05), cx + w * 0.25, h * (shY - 0.16), cx + w * 0.02, h * (shY - 0.04));
  else g.bezierCurveTo(cx + (w * botW) / 2, h * (shY + 0.14), cx + (w * topW) / 2 + w * 0.06, h * shY + h * 0.06, cx + (w * topW) / 2, h * shY);
  g.closePath();
  g.fill();
  // шея
  const neckTop = hy * h + ry * h * 0.6;
  const neckH = h * shY - neckTop + 6;
  g.fillRect(w * hx - (w * s.neck), neckTop, w * s.neck * 2, neckH + (s.longNeck ? 4 : 0));
  // голова
  g.beginPath();
  g.ellipse(w * hx, h * hy, w * rx, h * ry, s.hunch ? -0.25 : 0, 0, Math.PI * 2);
  g.fill();
  if (s.scarf) {
    // платок: шире у затылка, сходится к шее
    g.beginPath();
    g.ellipse(w * hx, h * (hy + 0.02), w * (rx + 0.03), h * (ry + 0.025), 0, Math.PI * 1.05, Math.PI * 1.95);
    g.fill();
    g.beginPath();
    g.moveTo(w * (hx - rx - 0.02), h * hy);
    g.lineTo(w * (hx - 0.05), h * (hy + ry + 0.07));
    g.lineTo(w * (hx + 0.05), h * (hy + ry + 0.07));
    g.lineTo(w * (hx + rx + 0.02), h * hy);
    g.fill();
  }
  if (type === 'man' || type === 'stout') {
    // кепка
    g.beginPath();
    g.ellipse(w * hx, h * (hy - ry * 0.55), w * (rx + 0.012), h * ry * 0.5, 0, Math.PI, Math.PI * 2);
    g.fill();
    g.fillRect(w * hx, h * (hy - ry * 0.6), w * (rx + 0.06), h * 0.03);
  }
  const out = { c, pad, breathe: s.breathe };
  cache.set(key, out);
  return out;
}
