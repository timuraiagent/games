// Счётчик настоящего времени игры по ночам — замер на живых людях (сколько минут занимает ночь).
// Вечер, ночь и утро ночи N идут в счёт ночи N; обложка и последняя карточка — не в счёт.
// Время идёт, только пока вкладка видна и человек играет: нет ни щелчка, ни клавиши дольше IDLE_MS —
// счёт стоит до следующего действия (засчитываются только первые IDLE_MS тишины: человек читал).
// Счёт копится в localStorage рядом с сохранением (свой ключ) и переживает перезагрузку; новая игра его обнуляет.
// Движок о времени не знает. Без хранилища счёта нет — и строки о времени на карточке тоже.

export const PLAYTIME_KEY = 'night-reception-playtime-v1';
export const IDLE_MS = 2 * 60 * 1000;
const TICK_MS = 1000;

function readStore() {
  const raw = localStorage.getItem(PLAYTIME_KEY);   // хранилища нет — бросает, и счёта нет
  let rec = null;
  try { rec = raw ? JSON.parse(raw) : null; } catch { /* испорченная запись — как пустая */ }
  const out = {};
  if (rec && rec.v === 1 && rec.nights && typeof rec.nights === 'object') {
    for (const [k, ms] of Object.entries(rec.nights)) if (/^\d+$/.test(k) && Number.isFinite(ms) && ms > 0) out[k] = ms;
  }
  return out;
}

export class Playtime {
  /** nightNow() — номер ночи, которая сейчас идёт у игрока, или null (обложка, конец демо). */
  constructor(nightNow) {
    this.nightNow = nightNow;
    this.ok = true;
    try { this.nights = readStore(); } catch { this.ok = false; this.nights = {}; }
    this.last = performance.now();
    this.lastInput = this.last;
    this.visible = document.visibilityState !== 'hidden';
  }

  install() {
    const poke = () => { this.tick(); this.lastInput = performance.now(); };
    for (const type of ['pointerdown', 'keydown', 'wheel']) window.addEventListener(type, poke, { capture: true, passive: true });
    document.addEventListener('visibilitychange', () => {
      this.tick();   // то, что было до перемены, — по прежней видимости
      this.visible = document.visibilityState !== 'hidden';
      if (this.visible) this.lastInput = performance.now();   // вернулся во вкладку — это тоже действие
    });
    window.addEventListener('pagehide', () => this.tick());
    this.timer = setInterval(() => this.tick(), TICK_MS);
  }

  /** Добавить время с прошлого раза к идущей ночи (если вкладка видна и человек не отошёл). */
  tick() {
    const now = performance.now();
    const from = this.last;
    this.last = now;
    if (!this.ok || !this.visible) return;
    const n = this.nightNow();
    if (!n) return;
    const dt = Math.min(now, this.lastInput + IDLE_MS) - from;
    if (dt <= 0) return;
    this.nights[n] = (this.nights[n] || 0) + dt;
    this.write();
  }

  write() {
    try { localStorage.setItem(PLAYTIME_KEY, JSON.stringify({ v: 1, nights: this.nights })); } catch { this.ok = false; }
  }

  /** Новая игра: счёт с нуля. */
  reset() {
    this.nights = {};
    this.last = performance.now();
    this.lastInput = this.last;
    try { localStorage.removeItem(PLAYTIME_KEY); } catch { this.ok = false; }
  }

  /** Минуты по ночам и всего: { nights: [{ n, min }], total } или null, если считать нечего. */
  summary() {
    this.tick();
    if (!this.ok) return null;
    const nights = Object.keys(this.nights).map(Number).sort((a, b) => a - b)
      .map((n) => ({ n, min: Math.max(1, Math.round(this.nights[n] / 60000)) }));
    if (!nights.length) return null;
    return { nights, total: nights.reduce((s, x) => s + x.min, 0) };
  }
}
