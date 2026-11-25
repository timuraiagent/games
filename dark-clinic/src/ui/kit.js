// Набор интерфейса: горячие места с именами, меню действий с ценой в масле, реплики,
// листы бумаги, книга приёма, доска примет. Только мышь. У всего, что нажимается, — data-act.


// ── Фактуры: зернистая бумага и копоть рисуются один раз в маленький холст ─────────────
import { t } from './strings/index.js';

export function installTextures() {
  const paper = noiseTexture(72, (r) => {
    const base = [172, 156, 124];
    const n = (r() - 0.5) * 26;
    return [base[0] + n, base[1] + n * 0.95, base[2] + n * 0.85, 255];
  }, (g, r) => {
    // пятна, подтёки, волокна
    for (let i = 0; i < 16; i++) {
      const x = r() * 72, y = r() * 72, rad = 3 + r() * 14;
      const grd = g.createRadialGradient(x, y, 0, x, y, rad);
      const a = 0.05 + r() * 0.12;
      grd.addColorStop(0, `rgba(90,60,25,${a})`); grd.addColorStop(1, 'rgba(90,60,25,0)');
      g.fillStyle = grd; g.fillRect(0, 0, 72, 72);
    }
    for (let i = 0; i < 26; i++) {
      g.fillStyle = `rgba(60,40,20,${0.08 + r() * 0.1})`;
      g.fillRect(Math.floor(r() * 72), Math.floor(r() * 72), 1 + Math.floor(r() * 3), 1);
    }
  });
  const soot = noiseTexture(48, (r) => {
    const n = r() * 14;
    return [14 + n, 10 + n * 0.8, 8 + n * 0.6, 255];
  });
  document.documentElement.style.setProperty('--paper-tex', `url(${paper})`);
  document.documentElement.style.setProperty('--soot-tex', `url(${soot})`);
}

function rng(seed) {
  let s = seed >>> 0 || 1;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

function noiseTexture(size, pixel, extra) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  const g = c.getContext('2d');
  const img = g.createImageData(size, size);
  const r = rng(size * 7919);
  for (let i = 0; i < size * size; i++) {
    const [R, G, B, A] = pixel(r);
    img.data[i * 4] = R; img.data[i * 4 + 1] = G; img.data[i * 4 + 2] = B; img.data[i * 4 + 3] = A;
  }
  g.putImageData(img, 0, 0);
  if (extra) extra(g, r);
  return c.toDataURL('image/png');
}

/** Рваный край: clip-path с лёгкой неровностью, свой для каждого листа. */
export function tornEdges(el, seed = 1, amp = 0.7) {
  const r = rng(seed * 2654435761);
  const pts = [];
  const steps = 18;
  for (let i = 0; i <= steps; i++) pts.push(`${(i / steps) * 100}% ${r() * amp}%`);
  for (let i = 0; i <= steps; i++) pts.push(`${100 - r() * amp * 0.6}% ${(i / steps) * 100}%`);
  for (let i = steps; i >= 0; i--) pts.push(`${(i / steps) * 100}% ${100 - r() * amp}%`);
  for (let i = steps; i >= 0; i--) pts.push(`${r() * amp * 0.6}% ${(i / steps) * 100}%`);
  el.style.clipPath = `polygon(${pts.join(',')})`;
}

export function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
    else if (k === 'text') el.textContent = v;
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const c of children.flat()) if (c != null && c !== false) el.append(c.nodeType ? c : document.createTextNode(String(c)));
  return el;
}

const later = (fn) => requestAnimationFrame(() => requestAnimationFrame(fn));

// ── Подсказка с именем под мышью ──────────────────────────────────────────────────────
export class Tip {
  constructor(stage) {
    this.stage = stage;
    this.el = h('div', { id: 'tip', class: 'passive' });
    stage.layers.text.append(this.el);
    this.owner = null;
  }
  attach() { if (!this.el.isConnected) this.stage.layers.text.append(this.el); }
  show(owner, text, sub, clientX, clientY) {
    this.attach();
    this.owner = owner;
    this.el.replaceChildren(document.createTextNode(text), ...(sub ? [h('small', { text: sub })] : []));
    this.move(clientX, clientY);
    this.el.classList.add('on');
  }
  move(clientX, clientY) {
    const p = this.stage.toStage(clientX, clientY);
    const w = this.el.offsetWidth || 200;
    let x = p.x + 22, y = p.y + 18;
    if (x + w > 1650) x = p.x - w - 18;
    if (y > 880) y = p.y - 50;
    this.el.style.left = `${x}px`; this.el.style.top = `${y}px`;
  }
  hide(owner) { if (!owner || owner === this.owner) { this.el.classList.remove('on'); this.owner = null; } }
}

// ── Горячее место ─────────────────────────────────────────────────────────────────────
export function hotspot(shell, { act, name, sub, rect, onClick, disabled }) {
  const el = h('div', {
    class: 'hotspot', 'data-act': act, role: 'button', 'aria-label': name,
    style: { left: `${rect.x}px`, top: `${rect.y}px`, width: `${rect.w}px`, height: `${rect.h}px` },
  });
  if (disabled) el.setAttribute('aria-disabled', 'true');
  const subText = () => (typeof sub === 'function' ? sub() : sub);
  el.addEventListener('pointerenter', (e) => { if (el.getAttribute('aria-disabled') !== 'true') shell.tip.show(el, name, subText(), e.clientX, e.clientY); });
  el.addEventListener('pointermove', (e) => { if (shell.tip.owner === el) shell.tip.move(e.clientX, e.clientY); });
  el.addEventListener('pointerleave', () => shell.tip.hide(el));
  el.addEventListener('click', (e) => {
    e.stopPropagation();
    shell.tip.hide(el);
    if (el.getAttribute('aria-disabled') === 'true') return;
    shell.lastHotspot = el;   // если действие из его меню встанет в очередь — место видно нажатым
    onClick?.(e, el);
  });
  el.refreshTip = () => { if (shell.tip.owner === el) shell.tip.el.querySelector('small') && (shell.tip.el.querySelector('small').textContent = subText() || ''); };
  return el;
}

// ── Кнопка действия: цена в масле видна до нажатия, причина — когда нельзя ────────────
export function costMarks(cost, showFree = false) {
  const span = h('span', { class: `act-cost${cost ? '' : ' free'}`, title: cost ? t('cost.oil', { COST: cost }) : t('cost.free') });
  // даром — так и написано (у вопросов и осмотров, где обычно платят)
  if (!cost) { if (showFree) span.append(h('em', { text: t('cost.free') })); return span; }
  for (let i = 0; i < Math.min(cost, 5); i++) span.append(h('i'));
  span.append(h('em', { text: String(cost) }));
  return span;
}

export function actButton(a, onPick) {
  const disabled = a.enabled === false;
  // недоступное действие показывает причину — не цену (подпись без предупреждения даёт сам движок)
  const label = a.label;
  const b = h('button', {
    class: 'act', 'data-act': a.id, 'data-cost': a.cost ?? 0,
    'aria-disabled': disabled ? 'true' : null,
    title: disabled && a.reason ? a.reason : null,
  }, h('span', { class: 'act-label', text: label }), disabled ? null : costMarks(a.cost, a.group === 'exam'));
  if (disabled && a.reason) b.append(h('span', { class: 'act-reason', text: a.reason }));
  // правило, которое решает на этом действии впервые, — словами учителя, до щелчка (не ошибка и не цена)
  if (!disabled && a.ruleNote) { b.append(h('span', { class: 'act-rule', text: a.ruleNote })); b.style.flexWrap = 'wrap'; }
  // предупреждение движка (например, последняя ложка масла) видно до щелчка, как и цена
  if (!disabled && a.warning) { b.append(h('span', { class: 'act-warning', text: a.warning })); b.classList.add('warned'); b.style.flexWrap = 'wrap'; }
  b.tabIndex = -1;
  b.addEventListener('click', (e) => {
    e.stopPropagation();
    if (disabled) return;
    onPick(a);
  });
  return b;
}

// ── Меню действий рядом с горячим местом ──────────────────────────────────────────────
export function openMenu(shell, { act = 'menu', title, desc, actions = [], near, theme = 'paper', onPick }) {
  closeMenu(shell);
  const el = h('div', { class: `menu ${theme}`, 'data-act': act, role: 'menu' });
  if (title) el.append(h('div', { class: 'menu-title', text: title }));
  if (desc) el.append(h('div', { class: 'menu-desc', text: desc }));
  for (const a of actions) el.append(actButton(a, (x) => { closeMenu(shell); shell.menuPick = shell.lastHotspot; onPick(x); shell.menuPick = null; }));
  shell.stage.layers.text.append(el);
  if (theme === 'paper') { el.classList.add('paper'); tornEdges(el, (title || '').length + actions.length, 0.9); }
  else el.classList.add('soot');
  // меню всегда целиком на сцене: длинное — в две колонки, если есть место, иначе листается внутри бумаги
  const H_MAX = 893;
  if (el.offsetHeight > H_MAX && actions.length > 3) {
    el.classList.add('two-col');
    if (el.offsetHeight > H_MAX || el.offsetWidth > 1672 - 32 - (shell.stage.layers.ui.querySelector('.side:not(.scales-left)')?.offsetWidth || 0) - 24) el.classList.remove('two-col');
  }
  if (el.offsetHeight > H_MAX) { el.classList.add('scrolls'); el.style.maxHeight = `${H_MAX}px`; }
  // место: справа от горячего места, иначе слева, ниже, выше; не вылезать за сцену и не ложиться
  // ни на строку реплики, ни на доску, ни на счёт масла, ни на то, на что смотрят (shell.avoidRects экрана).
  // Не нашлось места — меню ниже и листается внутри бумаги, пока место не найдётся
  const avoid = menuAvoid(shell);
  const place = () => {
    const w = el.offsetWidth, hgt = el.offsetHeight;
    const fits = (x, y) => x >= 16 && y >= 16 && x + w <= 1656 && y + hgt <= 925 && !avoid.some((r) => x < r.x + r.w && x + w > r.x && y < r.y + r.h && y + hgt > r.y);
    const cy = near ? near.y + Math.min(near.h / 2 - 40, 60) : 400;
    const cands = near ? [
      [near.x + near.w + 14, cy], [near.x - w - 14, cy],
      [near.x + near.w / 2 - w / 2, near.y + near.h + 12], [near.x + near.w / 2 - w / 2, near.y - hgt - 12],
      [near.x + near.w + 14, near.y + near.h - hgt], [near.x - w - 14, near.y + near.h - hgt],
    ] : [[836 - w / 2, 400]];
    let best = cands.find(([x, y]) => fits(x, y));
    if (!best) {
      const ox = near ? near.x + near.w / 2 : 836, oy = near ? near.y + near.h / 2 : 470;
      let bd = Infinity;
      for (let yy = 16; yy + hgt <= 925; yy += 12) for (let xx = 16; xx + w <= 1656; xx += 12) {
        if (!fits(xx, yy)) continue;
        const dd = (xx + w / 2 - ox) ** 2 + (yy + hgt / 2 - oy) ** 2;
        if (dd < bd) { bd = dd; best = [xx, yy]; }
      }
    }
    return { best, cands, w, hgt };
  };
  let res = place();
  for (let mh = el.offsetHeight - 40; !res.best && mh >= 200; mh -= 40) {
    el.classList.remove('two-col');
    el.classList.add('scrolls'); el.style.maxHeight = `${mh}px`;
    res = place();
  }
  let [x, y] = res.best || res.cands[0];
  x = Math.max(16, Math.min(1656 - res.w, x));
  y = Math.max(16, Math.min(925 - res.hgt, y));
  el.style.left = `${x}px`; el.style.top = `${y}px`;
  later(() => el.classList.add('on'));
  shell.menu = el;
  return el;
}

/** Что меню не закрывает: строка реплики, доска и колонка справа, особые места экрана. */
function menuAvoid(shell) {
  const out = [...(shell.avoidRects || [])];
  if (shell.oilRect) out.push(shell.oilRect);   // счёт масла меню не закрывают
  const rectOf = (el) => (el ? { x: el.offsetLeft, y: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight } : null);
  const dlg = shell.stage.layers.text.querySelector(':scope > .dialogue');
  if (dlg && shell.dialogue?.active) out.push(rectOf(dlg));
  const side = shell.stage.layers.ui.querySelector('.side:not(.scales-left)');
  if (side) out.push(rectOf(side));
  return out.filter((r) => r && r.w > 0);
}

/** Строка появилась, а меню уже открыто и лежит на ней — меню отходит (строка на своём месте). */
export function menuMakeRoom(shell) {
  const m = shell.menu;
  if (!m) return;
  const d = shell.stage.layers.text.querySelector(':scope > .dialogue');
  if (!d) return;
  const r = { x: d.offsetLeft, y: d.offsetTop, w: d.offsetWidth, h: d.offsetHeight };
  const x = m.offsetLeft, y = m.offsetTop, w = m.offsetWidth, hh = m.offsetHeight;
  if (!(x < r.x + r.w && x + w > r.x && y < r.y + r.h && y + hh > r.y)) return;
  // ниже строки, если есть место, иначе выше
  const below = r.y + r.h + 10, above = r.y - hh - 10;
  m.style.top = `${below + hh <= 925 ? below : Math.max(16, above)}px`;
}

export function closeMenu(shell) {
  if (shell.menu) { shell.menu.remove(); shell.menu = null; }
}

// ── Реплики и повествование: щелчок — дальше ─────────────────────────────────────────
export class Dialogue {
  constructor(shell) {
    this.shell = shell;
    this.queue = [];
    this.el = null;
    this.waiters = [];
  }
  get active() { return !!this.el; }
  get current() { return this.cur || null; }
  /** lines: [{who?, text}] или строки. Возвращает обещание — когда все прочитаны. */
  say(lines) {
    for (const l of [].concat(lines)) this.queue.push(typeof l === 'string' ? { text: l } : l);
    if (!this.el) this._show();
    return new Promise((r) => this.waiters.push(r));
  }
  _show() {
    const l = this.queue.shift();
    if (!l) { this._close(); return; }
    this.cur = l;
    const el = this.el || h('div', { class: 'dialogue paper', 'data-act': 'dialogue.next', role: 'button' });
    el.classList.toggle('narration', !l.who || !!l.aside);
    el.classList.toggle('teacher', !!l.teacher);   // слова учителя, как их помнит ученик — его рукой
    el.dataset.place = (this.shell.scenes?.name === 'room' && this.shell.candle) ? 'high' : (this.shell.dialoguePlace || 'bottom');
    const imgs = l.images && l.images.length ? l.images : (l.image ? [l.image] : []);
    el.classList.toggle('with-image', imgs.length > 0);
    el.classList.toggle('two-images', imgs.length > 1);
    el.replaceChildren(
      ...imgs.map((src, i) => h('img', { class: `d-img d-img-${i}`, src, alt: '' })),
      ...(l.who ? [h('div', { class: 'who', text: l.who })] : []),
      h('div', { class: 'line', text: l.text }),
      h('div', { class: 'more', text: t('dialogue.next') }),
    );
    if (!this.el) {
      this.el = el;
      tornEdges(el, 7, 0.5);
      el.addEventListener('click', (e) => { e.stopPropagation(); this.next(); });
      this.shell.stage.layers.text.append(el);
      later(() => el.classList.add('on'));
    }
    this.shell.audio?.play('paper', { soft: true });
    menuMakeRoom(this.shell);
    this.shell.onLineShown?.(l);
  }
  next() { if (this.el) this._show(); }
  _close() {
    const el = this.el; this.el = null; this.cur = null;
    if (el) { el.classList.remove('on'); setTimeout(() => el.remove(), 600); }
    const w = this.waiters; this.waiters = [];
    w.forEach((r) => r());
  }
  clear() { this.queue = []; this._close(); }
}

// ── Листы бумаги: правила Лю, записка, лист календаря ────────────────────────────────
export function openSheet(shell, { act = 'sheet', title, paragraphs = [], sign, width, seed = 3, art = null, body = null }) {
  closeOverlay(shell);
  const veil = h('div', { class: 'veil', 'data-act': 'veil' });
  const sheet = h('div', { class: `sheet ${art ? 'sheet-art' : 'paper'}`, 'data-act': act, role: 'dialog' },
    art ? null : h('div', { class: 'pin' }),
    title ? h('h2', { text: title }) : null,
    h('div', { class: 'sheet-body' }, ...(body || paragraphs.map((p) => h('p', { text: p })))),
    sign ? h('div', { class: 'sign', text: sign }) : null,
    h('button', { class: 'close-hint', 'data-act': 'sheet.close', text: t('sheet.close') }));
  if (width) sheet.style.width = `${width}px`;
  const chars = paragraphs.join(' ').length + (title || '').length;
  if (chars > 330) sheet.classList.add('long');
  if (chars > 560) sheet.classList.add('longer');
  if (art) {
    // лист нарисован художником: текст ложится на картинку, бумагу CSS не рисуем
    const sc = art.scale || 1.9;
    const [pt, pr, pb, pl] = art.pad || [11, 12, 10, 12];
    // sx — лист шире своей картинки (бумага растянута по ширине), чтобы схема вошла без прокрутки
    const W = Math.round(art.w * sc * (art.sx || 1)), H = Math.round(art.h * sc);
    // поля в процентах от самого листа (CSS считал бы их от ширины сцены)
    Object.assign(sheet.style, {
      width: `${W}px`, height: `${H}px`, minHeight: '0',
      backgroundImage: `url(${art.url})`, backgroundSize: '100% 100%',
      padding: `${Math.round(H * pt / 100)}px ${Math.round(W * pr / 100)}px ${Math.round(H * pb / 100)}px ${Math.round(W * pl / 100)}px`,
    });
  } else tornEdges(sheet, seed, 1.0);
  return showOverlay(shell, veil, sheet);
}

function showOverlay(shell, veil, body) {
  shell.stage.layers.text.append(veil, body);
  shell.audio?.play('paper');
  later(() => { veil.classList.add('on'); body.classList.add('on'); });
  return new Promise((resolve) => {
    const close = (e) => {
      e?.stopPropagation();
      veil.classList.remove('on'); body.classList.remove('on');
      // закрытый лист больше не ловит щелчков, пока гаснет
      veil.style.pointerEvents = 'none'; body.style.pointerEvents = 'none';
      setTimeout(() => { veil.remove(); body.remove(); }, 600);
      shell.overlay = null;
      shell.audio?.play('paper', { soft: true });
      resolve();
    };
    veil.addEventListener('click', close);
    body.addEventListener('click', close);
    shell.overlay = { el: body, close, kind: body.classList.contains('ledger') ? 'ledger' : 'sheet' };
  });
}

export function closeOverlay(shell) { if (shell.overlay) shell.overlay.close(); }

// ── Раскрытая книга приёма: записи текстом по линейкам разворота ─────────────────────
// sections: [{ title, lines: [строка движка, …] }]
export function openLedger(shell, { sections = [], art = null, empty = null }) {
  closeOverlay(shell);
  const veil = h('div', { class: 'veil', 'data-act': 'veil' });
  // книга — разворот из двух страниц; ночи, что не влезли, — на следующих разворотах
  const left = h('div', { class: 'ledger-page left' });
  const right = h('div', { class: 'ledger-page right' });
  const flow = h('div', { class: 'ledger-flow paged' }, left, right);
  const prev = h('button', { class: 'ledger-turn prev', 'data-act': 'ledger.prev', text: t('ledger.prev') });
  const next = h('button', { class: 'ledger-turn next', 'data-act': 'ledger.next', text: t('ledger.next') });
  const book = h('div', {
    class: `ledger ${art ? 'ledger-art' : 'ledger-plain paper'}`, 'data-act': 'ledger.page', role: 'dialog',
    style: art ? { backgroundImage: `url(${art.url})` } : {},
  }, flow, prev, next, h('button', { class: 'close-hint', 'data-act': 'ledger.close', text: t('ledger.close') }));
  // страницы по чистым полям картинки (если манифест их дал)
  if (art?.pages) {
    Object.assign(flow.style, { left: '0px', top: '0px', width: '1672px', height: '941px' });
    [left, right].forEach((pg, i) => { const r = art.pages[i]; Object.assign(pg.style, { left: `${r.x}px`, top: `${r.y}px`, width: `${r.w}px`, height: `${r.h}px` }); });
  }
  const done = showOverlay(shell, veil, book);
  // куски текста: заголовок ночи держится со своей первой строкой
  const pieces = [];
  let lastStart = 0;
  const any = sections.some((x) => x.lines && x.lines.length);
  if (!any) pieces.push([h('p', { class: 'empty', text: empty || t('ledger.empty') })]);
  for (const sec of sections) {
    if (!sec.lines || !sec.lines.length) continue;
    lastStart = pieces.length;
    sec.lines.forEach((l, k) => pieces.push(k === 0 && sec.title ? [h('h3', { text: sec.title }), h('p', { text: l })] : [h('p', { text: l })]));
  }
  // разложить по страницам: пробная страница того же размера, лишнее — на следующую
  const probe = h('div', { class: 'ledger-page probe' });
  if (art?.pages) { const r = art.pages[0], r2 = art.pages[1]; Object.assign(probe.style, { left: `${r.x}px`, top: `${Math.max(r.y, r2.y)}px`, width: `${Math.min(r.w, r2.w)}px`, height: `${Math.min(r.h, r2.h)}px` }); }
  flow.append(probe);
  const pages = [[]];
  let startPage = 0;
  pieces.forEach((pc, k) => {
    probe.append(...pc);
    if (probe.scrollHeight > probe.clientHeight + 1 && pages[pages.length - 1].length) {
      probe.replaceChildren(...pc);
      pages.push([]);
    }
    pages[pages.length - 1].push(...pc);
    if (k === lastStart) startPage = pages.length - 1;
  });
  probe.remove();
  const spreads = Math.max(1, Math.ceil(pages.length / 2));
  let at = Math.floor(startPage / 2);   // книга открывается там, где начинается последняя ночь
  const show = () => {
    left.replaceChildren(...(pages[at * 2] || []));
    right.replaceChildren(...(pages[at * 2 + 1] || []));
    prev.hidden = at <= 0; next.hidden = at >= spreads - 1;
    book.dataset.spread = `${at + 1}/${spreads}`;
    shell.audio?.play('paper', { soft: true });
  };
  const turn = (d) => { const n = Math.max(0, Math.min(spreads - 1, at + d)); if (n !== at) { at = n; show(); } };
  prev.addEventListener('click', (e) => { e.stopPropagation(); turn(-1); });
  next.addEventListener('click', (e) => { e.stopPropagation(); turn(1); });
  const onKey = (e) => {
    if (shell.overlay?.el !== book) return;
    if (e.key === 'ArrowLeft') { e.preventDefault(); turn(-1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); turn(1); }
  };
  document.addEventListener('keydown', onKey);
  done.then(() => document.removeEventListener('keydown', onKey));
  left.replaceChildren(...(pages[at * 2] || []));
  right.replaceChildren(...(pages[at * 2 + 1] || []));
  prev.hidden = at <= 0; next.hidden = at >= spreads - 1;
  book.dataset.spread = `${at + 1}/${spreads}`;
  return done;
}

// ── Доска: собранные приметы и два вопроса, на которые игрок отвечает сам ─────────────
// board — из вида движка (signs, temp, loc, drawerName, questions); acts — действия board_*.
const BOARD_OPTS = [
  ['temp', 'board_temp', [['cold', 'board.cold'], ['heat', 'board.heat']]],
  ['loc', 'board_loc', [['out', 'board.out'], ['in', 'board.in']]],
];

export function renderBoard(shell, parent, { board, acts = [], onPick, title = null, said = [] }) {
  let el = parent.querySelector(':scope > .board');
  if (!el) {
    el = h('div', { class: 'board paper', 'data-act': 'board' });
    tornEdges(el, 11, 0.6);
    parent.prepend(el);
  }
  const signs = board?.signs || [];
  // сначала — что гость сказал (всё, что было сказано за визит, читается даром), потом — что видно
  const saidItems = (said || []).map((l) => h('li', { class: 'said' }, l.speaker ? h('span', { class: 'lbl', text: `${l.speaker}: ` }) : null, l.text));
  const signItems = signs.map((x) => h('li', { 'data-check': x.check }, h('span', { class: 'lbl', text: `${x.label}. ` }), x.text));
  const list = h('ul', {}, ...saidItems,
    ...(saidItems.length ? [h('li', { class: 'sep', text: t('board.signs') })] : []),
    ...(signItems.length ? signItems : [h('li', { class: 'none', text: t('board.empty') })]));
  const qs = BOARD_OPTS.map(([key, id, opts]) => h('div', { class: 'q' },
    h('div', { class: 'q-label', text: board?.questions?.[key] || '' }),
    h('div', { class: 'q-opts' }, ...opts.map(([v, label]) => {
      const on = board?.[key] === v;
      const a = acts.find((x) => x.id === id && x.param === v);
      return h('button', {
        class: `q-opt${on ? ' on' : ''}`, 'data-act': `${id}:${v}`, 'aria-pressed': on ? 'true' : 'false',
        'aria-disabled': a ? null : 'true',
        onclick: (e) => { e.stopPropagation(); if (a && a.enabled) onPick(a); },
      }, t(label));
    }))));
  const drawer = h('div', { class: 'q-drawer', text: board?.drawerName ? t('board.drawer', { DRAWER: board.drawerName }) : '' });
  const more = h('div', { class: 'more-up', text: t('board.more') });
  const wrap = h('div', { class: 'signs' }, more, list);
  more.addEventListener('click', (e) => { e.stopPropagation(); list.scrollBy({ top: -120, behavior: 'smooth' }); });
  const withQs = acts.length > 0;
  el.replaceChildren(h('h4', { text: said && said.length ? t('board.saidSeen') : (title || t('board.signs')) }), wrap, ...(withQs ? [...qs, drawer] : []));
  // приметы держатся в своём окошке доски: доска никогда не выталкивает кнопки из кадра.
  // новые — внизу; если старые ушли вверх, видна пометка, список листается колесом
  list.style.fontSize = signs.length + (said?.length || 0) > 6 ? '21px' : '';
  const upd = () => more.classList.toggle('on', list.scrollTop > 2);
  list.addEventListener('scroll', upd);
  // листаем целыми строками: верх окошка — всегда начало записи (последняя запись видна целиком)
  const bottom = list.scrollHeight - list.clientHeight;
  const firstWhole = [...list.children].find((li) => li.offsetTop >= bottom - 1);
  if (bottom > 0 && firstWhole) {
    list.style.paddingBottom = `${Math.max(0, firstWhole.offsetTop - bottom)}px`;
    list.scrollTop = firstWhole.offsetTop;
  } else list.scrollTop = list.scrollHeight;
  upd();
  return el;
}

/**
 * Лист правил как таблица рукой учителя (DESIGN §23): blocks = [{type:'line', text},
 * {type:'pair', left:{title, items}, right:{title, items}}]. Без blocks — строки lines.
 */
export function ruleSheetBody(r, { fresh = null } = {}) {
  if (!r) return [];
  if (!Array.isArray(r.blocks) || !r.blocks.length) return (r.lines || []).map((l) => h('p', { text: l }));
  const isFresh = (id) => !!(fresh && id && fresh.has(id));
  // первые две строки листа — одним абзацем (место по высоте)
  let blocks = r.blocks;
  const plain = (b) => b && b.type !== 'pair' && b.type !== 'list';
  if (blocks.length > 1 && plain(blocks[0]) && plain(blocks[1]) && !isFresh(blocks[0].id) && !isFresh(blocks[1].id)) {
    blocks = [{ type: 'line', text: `${blocks[0].text || ''} ${blocks[1].text || ''}`.trim() }, ...blocks.slice(2)];
  }
  const out = [];
  let pairs = null;
  for (const b of blocks) {
    if (b.type === 'pair' && b.left && b.right) {
      // таблица: заголовки «Холод | Жар», строки — название проверки слева, приметы по сторонам;
      // неизвестная строка — короткий прочерк от руки с обеих сторон
      const all = Array.isArray(b.rows) && b.rows.length ? b.rows
        : (b.left.items || []).map((x, k) => ({ id: null, label: '', known: x != null || (b.right.items || [])[k] != null, left: x, right: (b.right.items || [])[k] }));
      // таблица появляется с первой известной строкой и растёт по строке; неизвестных строк не рисуем (§23)
      const rows = all.filter((r) => r.known);
      const tableKnown = b.known ?? rows.length > 0;
      if (!tableKnown || !rows.length) continue;
      // первая строка новой таблицы — свежими чернилами вместе с заголовками
      const freshTable = rows.length > 0 && rows.every((r) => isFresh(r.id));
      const cell = (txt, known) => (known && txt ? h('div', { class: 'rp-item', text: txt }) : h('div', { class: 'rp-item rp-blank' }, h('span', { class: 'blank-dash' })));
      const ft = freshTable ? ' fresh' : '';
      const grid = h('div', { class: 'rule-chart', 'data-pair': b.id || '' },
        h('div', { class: 'rc-corner' }), h('div', { class: `rp-title${ft}`, text: b.left.title || '' }), h('div', { class: `rp-title${ft}`, text: b.right.title || '' }),
        ...rows.flatMap((row) => {
          const cls = `rc-row${row.known ? '' : ' unknown'}${isFresh(row.id) ? ' fresh' : ''}`;
          return [h('div', { class: `rc-label ${cls}`, 'data-row': row.id || '', text: row.label || '' }),
            Object.assign(cell(row.left, row.known), { className: `rp-item ${cls}${row.known && row.left ? '' : ' rp-blank'}` }),
            Object.assign(cell(row.right, row.known), { className: `rp-item ${cls}${row.known && row.right ? '' : ' rp-blank'}` })];
        }));
      if (!pairs) { pairs = h('div', { class: 'rule-pairs' }); out.push(pairs); }
      pairs.append(grid);
      continue;
    }
    pairs = null;
    if (b.type === 'list') {
      out.push(h('div', { class: `rule-list${isFresh(b.id) ? ' fresh' : ''}`, 'data-rule': b.id || '' }, h('div', { class: 'rl-title', text: b.title || '' }),
        ...(b.items || []).map((x) => h('div', { class: 'rl-item', text: x }))));
      continue;
    }
    out.push(h('p', { class: `rule-line${isFresh(b.id) ? ' fresh' : ''}`, 'data-rule': b.id || '', text: b.text || '' }));
  }
  return out;
}
