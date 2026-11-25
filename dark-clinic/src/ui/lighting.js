// Лампа: дрожь пламени и само пламя (кадры художника). Своего света и своей темноты интерфейс
// не рисует (этап 14): темнота — из картин художника, см. LampLight в screens/common.js.

const W = 1672, H = 941;
export const CELL = 3;

// хэш-шум на клетку и плавный шум: край света не ложится по прямой, ступени не складываются в квадраты
const hash = (i, j) => { let h = (i * 374761393 + j * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
function valueNoise(x, y) {
  const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi;
  const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
  const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
  return (a + (b - a) * sx) * (1 - sy) + (c + (d - c) * sx) * sy;
}

const clamp01 = (v) => Math.max(0, Math.min(1, v));
const lerp = (a, b, t) => a + (b - a) * t;

/** Дрожь пламени: гладкий шум + редкие провалы, чаще — когда масла мало. */
export class Flicker {
  constructor(seed = 1) {
    this.seed = seed;
    this.dip = 0; this.dipUntil = 0;
    this.frozen = false;
    this.value = 1;
  }
  update(t, frac) {
    if (this.frozen) { this.value = 1; return 1; }
    const s = this.seed;
    let v = 0.55 * Math.sin(t * 7.3 + s) + 0.3 * Math.sin(t * 13.1 + s * 2.1) + 0.15 * Math.sin(t * 23.7 + s * 0.7);
    v = 1 + v * 0.035;
    const low = 1 - clamp01(frac);
    if (t > this.dipUntil && Math.random() < 0.004 + low * 0.03) {
      this.dip = 0.05 + Math.random() * (0.06 + low * 0.2);
      this.dipUntil = t + 0.08 + Math.random() * 0.3;
    }
    if (t < this.dipUntil) v -= this.dip; else this.dip *= 0.9;
    this.value = v;
    return v;
  }
}

/**
 * Проход темноты для одного экрана. keep — что видно и без лампы (0..1 света на клетку):
 * красные ярлыки находятся по цвету фона, прямоугольники (бумага окошка) и силуэты — явно.
 */
/** Пламя: кадры художника; при малом масле — слабое пламя; без масла — тлеющий фитиль. */
export function drawFlame(g, { x, y, frac, flick = 1, t = 0, frames = null, low = null, out = false }) {
  g.save();
  g.imageSmoothingEnabled = false;
  if (out) {
    // красная точка фитиля, мигает
    const a = 0.35 + 0.35 * Math.max(0, Math.sin(t * 2.3) * flick);
    g.fillStyle = `rgba(190,60,20,${a.toFixed(2)})`;
    g.fillRect(Math.round(x) - 1, Math.round(y) - 3, 3, 3);
    g.restore();
    return;
  }
  const set = frac < 0.28 && low && low.length ? low : frames;
  if (set && set.length) {
    const f = set[Math.floor(t * 7 + flick * 3) % set.length];
    const wx = f.base ? f.base[0] : f.w / 2, wy = f.base ? f.base[1] : f.h;
    g.globalAlpha = Math.min(1, 0.75 + 0.25 * flick);
    g.drawImage(f.img, Math.round(x - wx), Math.round(y - wy), f.w, f.h);
  } else {
    // запасное пламя, если кадров нет: несколько крупных клеток
    const hgt = Math.max(2, Math.round(lerp(2, 6, frac) * flick));
    for (let k = 0; k < hgt; k++) {
      g.fillStyle = k < hgt / 2 ? '#ffd27a' : '#e0802c';
      g.fillRect(Math.round(x) - 3 + (k > hgt - 2 ? 1 : 0), Math.round(y) - (k + 1) * CELL, k > hgt - 2 ? 3 : 6, CELL);
    }
  }
  g.restore();
}
