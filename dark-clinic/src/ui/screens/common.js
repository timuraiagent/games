// Общее для экранов: фон, горячие места из манифеста, лампа, панели действий, листы.

import { hotspot, openMenu, actButton, h, openLedger, openSheet, renderBoard, ruleSheetBody } from '../kit.js';
import { fitSheet } from './fit.js';
import { drawFlame } from '../lighting.js';
import { active, pulseFeel, DEPTH_FEEL, lastSign } from '../present.js';
import { t, tr } from '../strings/index.js';

/** Нарисовать фон на нижнем холсте. Возвращает запись картинки или null. */
export async function paintBg(shell, key, { filter } = {}) {
  const g = shell.stage.ctx.bg;
  const rec = await shell.assets.get(key).catch(() => null);
  g.save();
  g.fillStyle = '#0b0806';
  g.fillRect(0, 0, 1672, 941);
  if (rec) {
    if (filter) g.filter = filter;
    g.imageSmoothingEnabled = false;
    g.drawImage(rec.img, 0, 0, 1672, 941);
  }
  g.restore();
  return rec;
}

/** Горячие места экрана. names: { id: { label, sub? } }. Прямоугольники — из манифеста. */
export function placeHotspots(shell, bg, names, onClick, extraRects = {}) {
  const rects = { ...shell.assets.hotspots(bg), ...extraRects };
  const els = {};
  const order = Object.keys(names).filter((n) => rects[n] && rects[n].w).sort((a, b) => rects[b].w * rects[b].h - rects[a].w * rects[a].h);
  for (const name of order) {
    const def = names[name];
    const el = hotspot(shell, {
      act: def.act || name, name: def.label, sub: def.sub, rect: rects[name],
      onClick: () => onClick(name, rects[name]),
    });
    shell.stage.layers.ui.append(el);
    els[name] = el;
  }
  return { rects, els };
}

/** Меню у горячего места: действия движка, что живут здесь, и короткая подпись. */
export function menuFor(shell, place, rect, { title, desc, actions, extra = [], after = null } = {}) {
  const acts = actions || shell.actionsAt(place);
  if (!acts.length && !desc && !extra.length) return null;
  return openMenu(shell, {
    act: `menu.${place}`, title, desc, actions: [...acts.map(withData), ...extra], near: rect,
    // extra — пункты интерфейса (крупный план), не действия движка; after — что открыть, когда шаг дочитан
    onPick: (a) => { if (a.run) { a.run(); return; } shell.perform(a.key); after?.(a); },
  });
}

// кнопке нужен data-act = ключ движка
const withData = (a) => ({ ...a, id: a.key, engineId: a.id });

/**
 * Панель кнопок. opts: { cls, x, y, bottom, right, parent, title, text, theme, actions, suggest }.
 * Возвращает элемент; повторный вызов с тем же cls обновляет его.
 */
export function panel(shell, place, opts = {}) {
  const parent = opts.parent || shell.stage.layers.ui;
  const cls = opts.cls || `panel-${place}`;
  let box = parent.querySelector(`:scope > .${cls}`);
  const acts = opts.actions || shell.actionsAt(place);
  if (!acts.length && !opts.text && !opts.title) { box?.remove(); return null; }
  if (!box) {
    box = h('div', { class: `panel ${cls} paper`, 'data-act': cls });
    parent.append(box);
  }
  const pos = { left: opts.x, top: opts.y, bottom: opts.bottom, right: opts.right };
  for (const [k, v] of Object.entries(pos)) box.style[k] = v == null ? '' : `${v}px`;
  if (opts.width) box.style.width = `${opts.width}px`;
  const kids = [];
  if (opts.title) kids.push(h('div', { class: 'panel-title', text: opts.title }));
  for (const t of [].concat(opts.text || [])) if (t) kids.push(h('div', { class: `panel-text${opts.small ? ' small' : ''}`, text: t }));
  for (const a of acts) {
    const b = actButton(withData(a), () => shell.perform(a.key));
    if (opts.suggest && opts.suggest(a)) b.classList.add('suggest');
    kids.push(b);
  }
  box.replaceChildren(...kids);
  return box;
}

/** Боковая колонка (доска + кнопки), прижатая к правому краю. */
export function sideColumn(shell, { right = 24, top = 24, width = 310 } = {}) {
  let col = shell.stage.layers.ui.querySelector(':scope > .side');
  if (!col) {
    col = h('div', { class: 'side' });
    shell.stage.layers.ui.append(col);
  }
  Object.assign(col.style, { right: `${right}px`, top: `${top}px`, width: `${width}px` });
  return col;
}

/** Доска активного гостя в колонке. */
export function boardIn(shell, parent, active) {
  if (!active || !active.board) { parent.querySelector(':scope > .board')?.remove(); return; }
  // ответ на доске не раньше строки, которая его говорит: пока строки шага читаются — прежняя доска
  const who = active.pid || active.name;
  let board = active.board;
  if (shell.holdPictures && shell.boardShown?.who === who) board = shell.boardShown.board;
  else shell.boardShown = { who, board };
  renderBoard(shell, parent, {
    board,
    said: (active.lines || []).filter((l) => shell.seenLines.has(l.text)),
    acts: shell.actionsAt('board'),
    onPick: (a) => shell.perform(a.key),
  });
}

/**
 * Лампа. Интерфейс своего света и своей темноты не рисует (этап 14): при полном масле экран — как написан.
 * Темнота приходит из картин художника: bg.<экран>_low (последние ложки) и bg.<экран>_out (лампа погасла),
 * совмещённых пиксель в пиксель с полным фоном. Один раз на экран считаются карты R_low = low ÷ full и
 * R_out = out ÷ full (по пикселю и каналу), и весь собранный кадр — фон и предметы — умножается на смесь
 * 1 → R_low → R_out по маслу (верхний холст в режиме умножения). Пока картин нет — ровная тусклость по маслу.
 * Пламя — кадры художника на холсте предметов; без ореола.
 * opts: bg — имя фона экрана ('room_night' …), без него экран всегда как написан (обложка, вечер, крупные планы);
 * flames/low — кадры пламени; flame — рисовать ли пламя; candle — где огарок.
 */
export class LampLight {
  constructor(shell, anchors, { flames = null, low = null, flame = true, candle = null, bg = null } = {}) {
    this.shell = shell;
    this.anchors = anchors || {};
    this.flames = flames;
    this.low = low;
    this.flame = flame;
    this.bgName = bg;
    const L = this.anchors.light || this.anchors.flame || { x: 443, y: 700 };
    this.candleAt = candle || { x: L.x + 120, y: L.y + 70 };
    this.maps = null;          // { low: Uint8ClampedArray rgb, out, candle? } — когда художник дал картины
    this.key = null;           // что сейчас на холсте умножения
    this.img = null;
    // прежние вызовы экранов (keepRect, addFocus …) больше ничего не делают: своей темноты нет
    this.pass = { keepRect() {}, addFocus() {}, setExtraFromSprites() {}, keepRedFrom() {} };
    shell.stage.ctx.light.clearRect(0, 0, 1672, 941);
    // ?flatdim=1 — запасной путь (ровная тусклость), даже если картины есть: для сравнения снимков
    if (bg && !shell.params?.has?.('flatdim')) this.loadMaps(bg);
  }

  /** Карты отношения из картин художника (если в манифесте есть _low и _out). */
  async loadMaps(name) {
    const A = this.shell.assets;
    if (!A.has(`bg.${name}_low`) || !A.has(`bg.${name}_out`)) return;
    const [full, low, out, cand] = await Promise.all([`bg.${name}`, `bg.${name}_low`, `bg.${name}_out`, `bg.${name}_candle`]
      .map((k) => (A.has(k) ? A.get(k).catch(() => null) : null)));
    if (!full || !low || !out) return;
    const px = (rec) => { const c = document.createElement('canvas'); c.width = 1672; c.height = 941; const g = c.getContext('2d'); g.drawImage(rec.img, 0, 0, 1672, 941); return g.getImageData(0, 0, 1672, 941).data; };
    const F = px(full);
    // отношение по каналу; у почти чёрных пикселей — мягкая поправка вместо размытия (иначе шум деления)
    const ratio = (D) => {
      const r = new Uint8ClampedArray(1672 * 941 * 3);
      for (let i = 0, k = 0; i < F.length; i += 4) for (let c = 0; c < 3; c++, k++) r[k] = Math.min(255, 255 * (D[i + c] + 4) / (F[i + c] + 4));
      return r;
    };
    this.maps = { low: ratio(px(low)), out: ratio(px(out)), candle: cand ? ratio(px(cand)) : null };
    this.key = null;
  }

  /** Сколько темноты сейчас: { a } — смесь 1→R_low (0…1), { b } — R_low→R_out, или свеча. */
  state() {
    const { shell } = this;
    if (!this.bgName) return { none: true };
    if (shell.lampOut) return shell.candle ? { candle: true } : { out: true };
    const cap = Math.max(1, shell.lampCap || 21);
    const f = shell.oilFrac;
    const full = 0.75, last = Math.min(0.5, 2 / cap);   // до трёх четвертей — как написано; последние две ложки — картина _low
    const a = f >= full ? 0 : f <= last ? 1 : (full - f) / (full - last);
    return { a: Math.round(a * 48) / 48 };
  }

  frame(t) {
    const { shell } = this;
    const st = this.state();
    const key = JSON.stringify(st) + (this.maps ? 'm' : 'u');
    if (key !== this.key) { this.key = key; this.paint(st); }
    // пламя — на холсте предметов, под той же картой; ни ореола, ни круга света
    const g = shell.stage.ctx.sprites;
    if (this.flame && this.anchors.flame && !st.none) {
      const flick = shell.flicker.update(t, shell.oilFrac);
      if (!shell.lampOut) drawFlame(g, { x: this.anchors.flame.x, y: this.anchors.flame.y, frac: shell.oilFrac, flick, t, frames: this.flames, low: this.low });
    }
    if (st.candle) drawCandle(g, this.candleAt, t);
  }

  /** Холст умножения: ровная тусклость (пока нет картин) или смесь карт художника. */
  paint(st) {
    const L = this.shell.stage.ctx.light;
    L.clearRect(0, 0, 1672, 941);
    if (st.none || (st.a === 0)) { this.level = 1; this.applyDom(); return; }
    if (!this.maps) {
      // запасной путь: одна ровная тусклость по маслу — без маски, без ступеней, без градиента
      const v = st.candle ? 0.2 : st.out ? 0.12 : 1 - 0.6 * st.a;
      const c = Math.round(255 * v);
      L.fillStyle = `rgb(${c},${c},${c})`; L.fillRect(0, 0, 1672, 941);
      this.level = v; this.applyDom(); return;
    }
    const M = this.maps;
    if (!this.img) this.img = L.createImageData(1672, 941);
    const d = this.img.data;
    const src = st.candle ? (M.candle || M.out) : st.out ? M.out : M.low;
    const a = st.candle || st.out ? 1 : st.a;
    let sum = 0;
    for (let i = 0, k = 0; i < d.length; i += 4, k += 3) {
      d[i] = 255 + (src[k] - 255) * a; d[i + 1] = 255 + (src[k + 1] - 255) * a; d[i + 2] = 255 + (src[k + 2] - 255) * a; d[i + 3] = 255;
      sum += d[i + 1];
    }
    L.putImageData(this.img, 0, 0);
    this.level = sum / (1672 * 941 * 255);
    this.applyDom();
  }

  /** Мел и обводки горячих мест (это DOM) — под той же картой: яркость по среднему карты под ними. */
  applyDom() {
    const ui = this.shell.stage.layers.ui;
    const L = this.shell.stage.ctx.light;
    const ms = this.maps && this.level < 1 ? L.getImageData(0, 0, 1672, 941).data : null;
    for (const el of ui.querySelectorAll('.chalk, .hotspot')) {
      let v = this.level ?? 1;
      if (ms && v < 1) {
        const x = el.offsetLeft, y = el.offsetTop, w = Math.max(1, el.offsetWidth), hh = Math.max(1, el.offsetHeight);
        let s = 0, n = 0;
        for (let yy = y; yy < y + hh; yy += 8) for (let xx = x; xx < x + w; xx += 8) {
          if (xx < 0 || yy < 0 || xx >= 1672 || yy >= 941) continue;
          s += ms[(yy * 1672 + xx) * 4 + 1]; n++;
        }
        v = n ? s / n / 255 : v;
      }
      el.style.filter = v < 0.995 ? `brightness(${v.toFixed(3)})` : '';
    }
  }
}

/** Огарок: короткий оплывший столбик воска и пламя в три-четыре клетки (на холсте предметов, без ореола). */
function drawCandle(g, at, t) {
  const { x, y } = at;
  const wob = 0.85 + 0.15 * Math.sin(t * 9.1) * Math.sin(t * 3.7);
  g.save();
  g.fillStyle = '#6e6250'; g.fillRect(x - 6, y - 12, 12, 12);
  g.fillStyle = '#8c7e66'; g.fillRect(x - 6, y - 12, 4, 12); g.fillRect(x - 9, y - 3, 18, 3);
  g.fillStyle = '#2a2018'; g.fillRect(x - 1, y - 16, 2, 4);
  const hgt = 3 + Math.round(2 * wob);
  for (let k = 0; k < hgt; k++) {
    g.fillStyle = k < 2 ? '#ffe2a0' : k < hgt - 1 ? '#ffb850' : '#d0662a';
    const sway = Math.round(Math.sin(t * 6 + k) * (k / 3));
    g.fillRect(x - 2 + sway, y - 19 - k * 3, k === hgt - 1 ? 2 : 4, 3);
  }
  g.restore();
}

/** Кадры пламени из манифеста: обычные и слабые (при малом масле). Точка фитиля — base или низ-центр. */
export async function loadFlames(shell) {
  const load = async (keys) => {
    const recs = await shell.assets.getMany(keys);
    const frames = Object.values(recs).filter((r) => r && !r.placeholder).map((r) => ({ ...r, base: r.meta?.base || null }));
    return frames.length ? frames : null;
  };
  const [full, low] = await Promise.all([
    load(['props.flame_1', 'props.flame_2', 'props.flame_3']),
    load(['props.flame_low_1', 'props.flame_low_2', 'props.flame_low_3']),
  ]);
  if (full) full.low = low;
  return full;
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Книга приёма. sections: [{ title, lines }]. */
export function showLedger(shell, sections) {
  const url = shell.assets.url('props.ledger_open');
  // чистое поле каждой страницы — из манифеста (text_left / text_right); у правой страницы по внешнему
  // краю плесень — оттуда ещё отступ, чтобы строка не уходила в зелень
  const R = shell.assets.entry('props.ledger_open')?.rects || {};
  const box = (a, inR = 0) => (Array.isArray(a) ? { x: a[0], y: a[1], w: a[2] - a[0] - inR, h: a[3] - a[1] } : null);
  const pages = R.text_left && R.text_right ? [box(R.text_left), box(R.text_right, 80)] : null;
  return openLedger(shell, { sections, art: url ? { url, pages } : null });
}

/** Ночные записи книги из вида: [{ n, lines }] → разделы. */
export function ledgerSections(v) {
  return (v.ledger || []).map((x) => ({ title: t('ledger.night', { N: x.n }), lines: x.lines }));
}

/** Лист правил Лю или записка — на нарисованном листе. kind: 'rules' | 'note'. */
export function showPaper(shell, kind, { title, lines = [], text, sign, blocks = null, fresh = null } = {}) {
  const key = kind === 'note' ? 'props.note' : 'props.rules_sheet';
  const url = lightUrl(shell, key, PAPER_PAD[kind] || null) || shell.assets.url(key);
  const e = shell.assets.entry(key);
  // лист правил — во всю высоту сцены, чтобы схема помещалась без прокрутки
  const art = url ? (kind === 'note'
    ? { url, w: e.w, h: e.h, scale: 2.2, pad: PAPER_PAD.note }
    : { url, w: e.w, h: e.h, scale: 920 / e.h, sx: 1.3, pad: PAPER_PAD.rules }) : null;   // лист чуть шире картинки: схема входит целиком
  const paragraphs = lines.length ? lines : String(text || '').split(/\n\s*\n/).filter(Boolean);
  const body = kind === 'rules' && blocks ? ruleSheetBody({ blocks, lines }, { fresh }) : null;
  const p = openSheet(shell, { act: `sheet.${kind}`, title, paragraphs, sign, art, body });
  const el = shell.overlay?.el;
  if (kind === 'rules' && el) { el.classList.add('sheet-rules'); fitSheet(el); }
  return p;
}

/**
 * Листы правил копятся: все полученные — стопкой; сверху новый, остальные — щелчком по ярлыку
 * «Лист первый / второй / третий» сбоку от листа. rules — view.rules (по порядку), idx — какой открыть.
 */
export function showRules(shell, rules, idx = rules.length - 1) {
  if (!rules?.length) return null;
  const r = rules[idx];
  const fresh = shell.takeFresh?.(r.n ?? idx + 1) || null;
  const p = showPaper(shell, 'rules', { title: r.title, lines: r.lines, blocks: r.blocks, fresh });
  const el = shell.overlay?.el;
  if (rules.length > 1 && el && !el.dataset.tabs) {
    const W = parseFloat(el.style.width) || 820;
    const left = Math.max(16, Math.round((1672 - W) / 2) - 214);
    const tabs = sheetTabs(shell, rules, idx, (i) => showRules(shell, rules, i), { x: left, y: 120 });
    shell.stage.layers.text.append(tabs);
    p.then(() => tabs.remove());
  }
  return p;
}

/** Ярлыки листов: столбиком, текущий отмечен. */
export function sheetTabs(shell, rules, cur, onPick, { x, y }) {
  return h('div', { class: 'sheet-tabs', 'data-act': 'rules.tabs', style: { left: `${x}px`, top: `${y}px` } },
    ...rules.map((r, i) => {
      const isNew = i !== cur && shell.hasNewRules?.(r.n ?? i + 1);
      // новое на листе — меловая галочка на ярлыке, пока лист не открыт
      const b = h('button', { class: `sheet-tab paper${i === cur ? ' on' : ''}${isNew ? ' new' : ''}`, 'data-act': `rules.sheet:${i + 1}`, 'aria-pressed': i === cur ? 'true' : 'false' }, r.title, isNew ? h('span', { class: 'chalk-tick', 'aria-hidden': 'true' }) : null);
      b.tabIndex = -1;
      b.addEventListener('click', (e) => { e.stopPropagation(); if (i !== cur) onPick(i); });
      return b;
    }));
}

// бумага листа и записки, высветленная до рваных краёв (сама картинка, без подложки)
const lightCache = {};
function lightUrl(shell, key, pad = null) {
  if (lightCache[key]) return lightCache[key];
  const src = shell.assets.url(key);
  if (!src) return null;
  const img = new Image();
  img.onload = () => {
    const c = document.createElement('canvas'); c.width = img.naturalWidth; c.height = img.naturalHeight;
    const g = c.getContext('2d'); g.drawImage(img, 0, 0);
    const d = g.getImageData(0, 0, c.width, c.height), px = d.data;
    const W = c.width, H = c.height;
    // где ляжет текст (поля листа из pad) — чистая бумага; пятна и рваные края — только на полях
    const text = pad ? { x: W * pad[3] / 100, y: H * pad[0] / 100, w: W * (1 - (pad[1] + pad[3]) / 100), h: H * (1 - (pad[0] + pad[2]) / 100) } : null;
    const fe = Math.max(6, W * 0.04);
    for (let i = 0; i < px.length; i += 4) {
      if (px[i + 3] < 10) continue;
      const q = i / 4, x = q % W, y = (q - x) / W;
      const k = Math.max(0.68, text ? 0.96 * softIn(x, y, text, W * 0.01, fe) : 0);
      px[i] += (234 - px[i]) * k; px[i + 1] += (220 - px[i + 1]) * k; px[i + 2] += (188 - px[i + 2]) * k;
    }
    g.putImageData(d, 0, 0);
    lightCache[key] = c.toDataURL('image/png');
  };
  img.src = src;
  return null;
}
/** Заранее приготовить высветленные листы (вызывается при входе на экраны). */
export function prepPapers(shell) { lightUrl(shell, 'props.rules_sheet', PAPER_PAD.rules); lightUrl(shell, 'props.note', PAPER_PAD.note); }
const PAPER_PAD = { note: [9, 9, 8, 9], rules: [10, 8, 7, 8] };   // сверху — рваный край и кнопки, снизу — кнопка: текст ниже и выше них

/** Описание лампы для подсказки и меню (число — только при наведении). */
export function lampSub(shell) { return shell.game?.view?.()?.lamp?.short || ''; }

/**
 * Масло — мелом на прилавке у лампы: Лю считает масло ложками, ученик отмечает их чёрточками
 * (по пять в связке). Сожжённая ложка — чёрточка стёрта пальцем. Это часть комнаты: рисуется
 * в слое предметов и темнеет вместе с ней; в снимках без интерфейса — прячется.
 */
export class OilMarks {
  /**
   * Счёт масла мелом на доске или кромке: палочки по пять (пятая наискось) и строка движка «в лампе N ложек».
   * opts: x, y — левый край и верх палочек; H — высота палочки; text — { x, y } где строка (базовая линия),
   * font — размер строки. Рисуется своим холстом поверх темноты (мел светлый: при малом масле тускнеет,
   * но читается), его место меню не закрывают (shell.oilRect).
   */
  constructor(shell, { x, y, H = 22, step = 10, gap = 14, text = null, font = 26 }) {
    Object.assign(this, { shell, x, y, H, step, gap, text: text || { x, y: y - 8 }, font });
    const c = document.createElement('canvas'); c.width = 1672; c.height = 941; c.className = 'oil-chalk';
    c.style.cssText = 'position:absolute;left:0;top:0;width:1672px;height:941px;pointer-events:none;z-index:9';
    this.canvas = c; this.g = c.getContext('2d');
    shell.stage.layers.ui.append(c);
    shell.oilRect = this.area();
    this.key = null;
  }
  area() {
    const tw = 6 * this.step + 4 * (4 * this.step + this.gap);
    const x0 = Math.min(this.x, this.text.x) - 6, y0 = Math.min(this.y, this.text.y - this.font) - 6;
    const x1 = Math.max(this.x + tw, this.text.x + 300) + 6, y1 = Math.max(this.y + this.H, this.text.y) + 8;
    return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
  }
  draw() {
    const cap = Math.round(this.shell.lampCap || 0);
    if (!this.canvas.isConnected) this.shell.stage.layers.ui.append(this.canvas);
    const hide = !cap || this.shell.atTitle || this.shell.hideGauge;
    const left = Math.max(0, Math.round(this.shell.oilShown));
    const short = this.shell.game?.view?.()?.lamp?.short || String(left);
    // мел: на светлой стене — ярко, к темноте — тусклее, но не ниже читаемого
    const lv = this.shell.lampOut ? 0 : Math.max(0, Math.min(1, this.shell.oilFrac || 0));
    const a = 0.62 + 0.33 * lv;
    const key = [hide, cap, left, short, a.toFixed(2)].join('|');
    if (key === this.key) return;
    this.key = key;
    const g = this.g;
    g.clearRect(0, 0, 1672, 941);
    if (hide) return;
    const rnd = (k) => { const x = Math.sin(k * 91.17 + 7.3) * 43758.5453; return x - Math.floor(x); };
    const { H, step, gap } = this;
    const chalk = (x, y, w, h, k) => {
      for (let yy = 0; yy < h; yy += 3) for (let xx = 0; xx < w; xx += 3) {
        const r = rnd(k * 131 + yy * 17 + xx);
        if (r < 0.18) continue;
        g.fillStyle = `rgba(222,212,186,${(r > 0.75 ? 0.95 : 0.75) * a})`;
        g.fillRect(Math.round(x + xx), Math.round(y + yy), 3, 3);
      }
    };
    let x = this.x;
    for (let grp = 0; grp * 5 < cap; grp++) {
      const n = Math.min(5, cap - grp * 5);
      const gx = x;
      for (let i = 0; i < Math.min(4, n); i++) {
        const idx = grp * 5 + i;
        if (idx < left) chalk(gx + i * step, this.y, 3, H, idx);
        else { g.fillStyle = `rgba(170,160,138,${0.2 * a})`; g.fillRect(gx + i * step - 1, this.y + 4, 5, H - 8); }
      }
      if (n === 5) {
        const idx = grp * 5 + 4;
        const len = 4 * step + 2, steps = Math.round(len / 3.4);
        for (let k = 0; k < steps; k++) {
          const px = gx - 4 + k * 3.4, py = this.y + H - 3 - k * (H - 4) / steps;
          if (idx < left) { if (rnd(idx * 7 + k) > 0.15) { g.fillStyle = `rgba(222,212,186,${0.88 * a})`; g.fillRect(Math.round(px), Math.round(py), 3, 3); } }
          else if (k % 2) { g.fillStyle = `rgba(170,160,138,${0.18 * a})`; g.fillRect(Math.round(px), Math.round(py), 3, 3); }
        }
      }
      x += 4 * step + gap;
    }
    g.font = `700 ${this.font}px ${getComputedStyle(document.documentElement).getPropertyValue('--hand') || 'serif'}`;
    g.fillStyle = `rgba(226,216,190,${0.92 * a})`;
    g.textBaseline = 'alphabetic';
    g.fillText(short, this.text.x, this.text.y);
  }
}

/**
 * Пульс под пальцами. Темп звучит, только если частоту уже купили (пульс: частота);
 * иначе удары идут неровно — сосчитать по ним нельзя. Глубина — сперва лёгкое касание, потом нажим.
 * Отдых слышен ответом: «выровнялся» — удары сперва сбиты, потом ложатся ровно;
 * «едва» — так и остаются сбитыми; «не изменился» — одинаковые, как маятник.
 */
export function pulsePlan(shell, check) {
  const a = active(shell.view());
  const f = pulseFeel(a);
  const base = f.weak ? 0.32 : 0.72;
  const rnd = (k) => { const x = Math.sin(k * 12.9898 + (a?.ref?.length || 1) * 78.233) * 43758.5453; return x - Math.floor(x); };
  const period = 60 / f.bpm;
  const ragged = (n, center) => Array.from({ length: n }, (_, i) => center * (0.65 + 0.8 * rnd(i + 1)));
  let strengths, presses, gaps;
  if (check === 'pulse_depth') {
    const [light, deep] = DEPTH_FEEL[f.depth] || [0.5, 0.5];
    strengths = [light, light, light, deep, deep, deep].map((x) => x * (f.weak ? 0.5 : 1));
    presses = [0, 0, 0, 1, 1, 1];
    gaps = f.rateKnown ? Array(6).fill(period) : ragged(6, 0.85);
  } else if (check === 'rest') {
    const r = (lastSign(a, 'rest') || {}).value;
    const n = 8;
    presses = Array(n).fill(0.4);
    const p0 = f.rateKnown ? period : 0.85;
    if (r === 'evens') {
      gaps = Array.from({ length: n }, (_, i) => (i < 3 ? p0 * (0.6 + 0.8 * rnd(i + 3)) : p0));
      strengths = Array.from({ length: n }, (_, i) => (i < 3 ? base * (0.6 + 0.8 * rnd(i + 9)) : base));
    } else if (r === 'barely') {
      gaps = Array.from({ length: n }, (_, i) => p0 * (0.75 + 0.5 * rnd(i + 3)) * (1 - i * 0.01));
      strengths = Array.from({ length: n }, (_, i) => base * (0.55 + 0.6 * rnd(i + 9)));
    } else {
      gaps = Array(n).fill(p0);
      strengths = Array(n).fill(base);
    }
  } else {
    const n = f.bpm < 40 ? 4 : 7;
    strengths = Array(n).fill(base);
    presses = Array(n).fill(0.4);
    gaps = Array(n).fill(period);
  }
  return { bpm: f.bpm, strengths, presses, gaps, period };
}

export async function feelPulseAudio(shell, check) {
  const p = pulsePlan(shell, check);
  const dur = shell.audio.pulse({ bpm: p.bpm, beats: p.strengths.length, strengths: p.strengths, gaps: p.gaps });
  await shell.sleep((dur + 0.4) * 1000);
  return p;
}

/**
 * Поднос с едой у двери на лестницу — по ночи: нетронутый (1), рядом вторая миска (2), нет подноса (3).
 * Картинки и место — из манифеста (props.tray / tray_n2 / tray_gone, «on» или вложенная запись по фону).
 * Пока художник не дал место — ничего не рисуем: в фоне поднос уже есть.
 */
export async function trayFor(shell, bg, night) {
  const key = night >= 3 ? 'props.tray_gone' : night === 2 ? 'props.tray_n2' : 'props.tray';
  const e = shell.assets.images[key];
  if (!e) return null;
  if (e.on === bg && e.x != null) return shell.assets.get(key).catch(() => null);
  // вложенная запись для другого фона (например, morning: { on: 'room_morning', … })
  const sub = Object.keys(e).find((k) => e[k] && typeof e[k] === 'object' && e[k].file && e[k].on === bg);
  if (sub) return shell.assets.getSub(key, sub);
  return null;
}

/** Тень под предметом там, где он касается пола/стола: мягкий тёмный овал под нижним краем. */
export function contactShadow(g, x, y, w, h = 14, a = 0.55) {
  const cx = x + w / 2, cy = y;
  const grd = g.createRadialGradient(cx, cy, 2, cx, cy, w / 2);
  grd.addColorStop(0, `rgba(4,3,2,${a})`); grd.addColorStop(1, 'rgba(4,3,2,0)');
  g.save(); g.translate(cx, cy); g.scale(1, h / w); g.translate(-cx, -cy);
  g.fillStyle = grd; g.fillRect(x, cy - w / 2, w, w); g.restore();
}

/** 1 внутри прямоугольника (с запасом grow), к нулю за feather пикселей снаружи. */
export function softIn(x, y, a, grow, feather) {
  const dx = Math.max(a.x - grow - x, 0, x - (a.x + a.w + grow));
  const dy = Math.max(a.y - grow - y, 0, y - (a.y + a.h + grow));
  const dd = Math.sqrt(dx * dx + dy * dy);
  if (dd >= feather) return 0;
  const u = 1 - dd / feather;
  return u * u * (3 - 2 * u);
}

/** Знак «на листе новое» у места листа правил: уголок свежей бумаги и меловая галочка. */
export function rulesMark(shell, rect) {
  const ui = shell.stage.layers.ui;
  ui.querySelector(':scope > .rules-mark')?.remove();
  if (!rect || !shell.hasNewRules?.()) return;
  ui.append(h('div', { class: 'rules-mark', 'data-act': 'rules.new', style: { left: `${rect.x}px`, top: `${rect.y}px`, width: `${rect.w}px`, height: `${rect.h}px` } },
    h('span', { class: 'corner' }), h('span', { class: 'chalk-tick' })));
}
