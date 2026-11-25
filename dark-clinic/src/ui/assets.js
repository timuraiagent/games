// Картинки: сначала game/assets/manifest.json, иначе — заглушки из листов refs/.
//
// ── Контракт манифеста (его пишет художник, оболочка только читает) ─────────────────────
// game/assets/manifest.json (формат художника, 2026-11-14):
// {
//   "stage":  { "w": 1672, "h": 941 },
//   "assets": {
//     "bg":    { "room_night": { "file": "bg/room_night.png", "width": 1672, "height": 941,
//                                "rects": { "hatch_paper": [x0,y0,x1,y1], "flame_anchor": [x,y], ... } } },
//     "props": { "flame_1": { "file": "props/flame_1.png", "width": 35, "height": 48, "on": "room_night", "x": 426, "y": 661 } },
//     "silhouettes": { "man": { ..., "on": "room_night", "x": 652, "y": 278, "clip": "hatch_paper" } },
//     ...
//   }
// }
// Ключ картинки здесь — «группа.id» из game/asset_ids.json. x/y — левый верхний угол слоя на фоне «on».
// rects фона: [x0,y0,x1,y1] — прямоугольник, [x,y] — точка. Оболочка берёт из них горячие места
// и якоря по именам (см. ALIASES ниже: hatch ← hatch_paper, rules ← rules_sheet, flame ← flame_anchor…).
// Терпимо и к другим записям: «группа/id», плоский объект images, массив [{id, group, ...}],
// {x,y,w,h} вместо массива, отдельные разделы hotspots/anchors по имени фона.
// Чего нет в манифесте — берётся из заглушек ниже; когда картинка появится, заглушка исчезнет сама.

const PLACEHOLDERS = {
  'bg.title': { src: '../refs/15-pulse-hatch-b.png' },
  'bg.room_night': { src: '../refs/00-main-screen.png', prep: 'roomNight' },
  'bg.room_morning': { src: '../refs/10-morning-counter.png' },
  'bg.exam_closed': { src: 'assets/bg/exam_closed.png', prep: 'examClosed' },
  'bg.scales': { src: '../refs/07-cabinet-scales.png' },
  'bg.street_base': { src: '../refs/14-street-pair.png' },
  'props.cal_quiet': { src: '../refs/13-props.png', crop: [1222, 688, 200, 234] },
  'props.cal_rain': { src: '../refs/13-props.png', crop: [205, 688, 205, 234] },
  'props.cal_wind': { src: '../refs/13-props.png', crop: [535, 688, 205, 234] },
  'props.packet': { src: '../refs/13-props.png', crop: [905, 80, 245, 160] },
  'props.jar_poison_3': { src: '../refs/13-props.png', crop: [1210, 25, 175, 220] },
  'props.coins': { src: '../refs/13-props.png', crop: [1095, 300, 210, 135] },
  'props.paper_money': { src: '../refs/13-props.png', crop: [1375, 315, 240, 120] },
  'props.pillow': { src: '../refs/13-props.png', crop: [60, 515, 290, 135] },
  'props.cup': { src: '../refs/13-props.png', crop: [865, 500, 185, 190] },
  'props.key': { src: '../refs/13-props.png', crop: [1255, 535, 55, 95] },
};

// Прямоугольники по листам-референсам; манифест их перекрывает поимённо.
const DEFAULT_HOTSPOTS = {
  room_night: {
    cabinet: { x: 18, y: 128, w: 382, h: 470 },
    hatch: { x: 636, y: 256, w: 228, h: 214 },
    lamp: { x: 392, y: 588, w: 112, h: 244 },
    scales: { x: 618, y: 650, w: 300, h: 135 },
    rules: { x: 676, y: 784, w: 280, h: 116 },
    ledger: { x: 1012, y: 742, w: 488, h: 166 },
    calendar: { x: 1288, y: 228, w: 100, h: 160 },
    stair_door: { x: 1082, y: 196, w: 186, h: 548 },
    street_door: { x: 1396, y: 136, w: 262, h: 590 },
  },
  room_morning: {
    cashbox: { x: 718, y: 668, w: 284, h: 238 },
    ledger: { x: 1012, y: 730, w: 590, h: 190 },
    street: { x: 512, y: 168, w: 412, h: 326 },
    note: { x: 1100, y: 676, w: 90, h: 50 },
  },
  exam_closed: {
    slot: { x: 732, y: 34, w: 206, h: 102 },
    voice: { x: 690, y: 142, w: 92, h: 92 },
    grille: { x: 798, y: 138, w: 84, h: 92 },
    mirror: { x: 892, y: 140, w: 96, h: 96 },
    arm_door: { x: 540, y: 586, w: 284, h: 340 },
    drawer: { x: 888, y: 668, w: 420, h: 196 },
    lamp: { x: 0, y: 520, w: 110, h: 400 },
  },
  wall_evening: {
    calendar: { x: 200, y: 20, w: 512, h: 792 },
    rules: { x: 862, y: 28, w: 626, h: 904 },
  },
  scales: {
    cabinet: { x: 110, y: 20, w: 830, h: 560 },
    scales: { x: 1040, y: 480, w: 400, h: 180 },
    jar: { x: 1470, y: 380, w: 200, h: 330 },
    paper: { x: 860, y: 690, w: 320, h: 170 },
  },
};

const DEFAULT_ANCHORS = {
  room_night: {
    flame: { x: 443, y: 713 },
    light: { x: 443, y: 700 },
    hatch_paper: { x: 650, y: 274, w: 196, h: 180 },
    red_labels: { x: 36, y: 140, w: 360, h: 120 },
  },
  room_morning: {},
  exam_closed: {
    flame: { x: 25, y: 693 },
    light: { x: 25, y: 670 },
    eye_slot: { x: 744, y: 58, w: 182, h: 64 },
    grille: { x: 804, y: 140, w: 88, h: 74 },
  },
  scales: { light: { x: 954, y: 470 } },
  wall_evening: { calendar_leaf: { x: 205, y: 262, w: 457, h: 486 }, rules_text_area: { x: 925, y: 110, w: 500, h: 730 }, light: { x: -60, y: 860 } },
  title: { title_area: { x: 0, y: 0, w: 1672, h: 310 }, light: { x: 70, y: 720 }, flame: { x: 70, y: 760 } },
};

// Имена прямоугольников художника для горячих мест и якорей оболочки.
const ALIASES = {
  room_night: { hatch: 'hatch_paper', rules: 'rules_sheet', stair_door: ['stair_door', 'tray'], flame: 'flame_anchor', light: 'flame_anchor', red_labels: 'cabinet_top_row' },
  exam_closed: { slot: 'eye_slot_frame', arm_door: ['arm_door', 'pillow'] },
  scales: { jar: 'copper_jar', paper: 'paper_square' },
  wall_evening: {},
};
const REAL_BAKED = { 'bg.exam_closed': 'examClosed' };
const PAD = { room_night: { hatch: 8 } };

function unionRects(rs) {
  const x0 = Math.min(...rs.map((r) => r.x)), y0 = Math.min(...rs.map((r) => r.y));
  const x1 = Math.max(...rs.map((r) => r.x + (r.w || 0))), y1 = Math.max(...rs.map((r) => r.y + (r.h || 0)));
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
}
function padRect(r, p) { return r.w ? { x: r.x - p, y: r.y - p, w: r.w + 2 * p, h: r.h + 2 * p } : r; }

// Где в заглушке «впечатано» то, что в настоящем рисунке будет отдельным слоем.
const BAKED = {
  roomNight: { shadow: { x: 650, y: 274, w: 196, h: 180 }, flame: { x: 428, y: 666, w: 32, h: 50 } },
  examClosed: { flame: { x: 2, y: 634, w: 46, h: 60 } },
};

function normRect(r) {
  if (!r) return null;
  if (Array.isArray(r)) {
    if (Array.isArray(r[0])) return null;                       // четырёхугольник — не прямоугольник
    if (r.length === 2) return { x: +r[0], y: +r[1] };          // точка
    return { x: +r[0], y: +r[1], w: +r[2] - +r[0], h: +r[3] - +r[1] }; // [x0,y0,x1,y1]
  }
  if (typeof r !== 'object') return null;
  const o = { x: +r.x || 0, y: +r.y || 0 };
  if (r.w != null || r.width != null) o.w = +(r.w ?? r.width);
  if (r.h != null || r.height != null) o.h = +(r.h ?? r.height);
  return o;
}

function normKey(k) { return String(k).replace('/', '.'); }

function flattenImages(images) {
  const out = {};
  if (!images) return out;
  if (Array.isArray(images)) {
    for (const e of images) {
      if (!e) continue;
      const id = e.key || (e.group ? `${e.group}.${e.id}` : e.id);
      if (id) out[normKey(id)] = e;
    }
    return out;
  }
  for (const [k, v] of Object.entries(images)) {
    if (k.startsWith('_')) continue;
    if (v && typeof v === 'object' && !v.file && !v.src && !Array.isArray(v)) {
      for (const [k2, v2] of Object.entries(v)) if (!k2.startsWith('_') && v2 && typeof v2 === 'object') out[`${k}.${k2}`] = v2;
    } else out[normKey(k)] = v;
  }
  return out;
}

export async function fetchOptionalJSON(url) {
  try {
    const sep = url.includes('?') ? '&' : '?';
    const res = await fetch(url + sep + 'optional=1', { cache: 'no-store' });
    if (res.status !== 200) return null;
    const text = await res.text();
    if (!text.trim()) return null;
    return JSON.parse(text);
  } catch (e) {
    console.warn('could not read', url, e.message);
    return null;
  }
}

export class Assets {
  constructor() {
    this.manifest = null;
    this.images = {};      // key → запись манифеста
    this.hotspotsByBg = {};
    this.anchorsByBg = {};
    this.rectsByBg = {};    // rects из записи фона в манифесте
    this.cache = new Map(); // key → Promise<{img,w,h,x,y,placeholder}>
    this.srcCache = new Map();
  }

  async init() {
    const m = await fetchOptionalJSON('assets/manifest.json');
    this.manifest = m;
    if (!m) return this;
    this.images = flattenImages(m.assets || m.images || m.layers);
    const hs = m.hotspots || {};
    for (const [bg, rects] of Object.entries(hs)) {
      this.hotspotsByBg[bg.replace(/^bg[./]/, '')] = Object.fromEntries(Object.entries(rects).map(([n, r]) => [n, normRect(r)]));
    }
    const an = m.anchors || {};
    for (const [bg, pts] of Object.entries(an)) {
      this.anchorsByBg[bg.replace(/^bg[./]/, '')] = Object.fromEntries(Object.entries(pts).map(([n, r]) => [n, normRect(r)]));
    }
    for (const [key, e] of Object.entries(this.images)) {
      if (!key.startsWith('bg.')) continue;
      const bg = key.slice(3);
      if (e.rects) {
        const rects = Object.fromEntries(Object.entries(e.rects).filter(([n]) => !n.startsWith('_')).map(([n, r]) => [n, normRect(r)]).filter(([, r]) => r));
        this.rectsByBg[bg] = rects;
      }
      if (e.hotspots) this.hotspotsByBg[bg] = { ...(this.hotspotsByBg[bg] || {}), ...Object.fromEntries(Object.entries(e.hotspots).map(([n, r]) => [n, normRect(r)])) };
      if (e.anchors) this.anchorsByBg[bg] = { ...(this.anchorsByBg[bg] || {}), ...Object.fromEntries(Object.entries(e.anchors).map(([n, r]) => [n, normRect(r)])) };
    }
    return this;
  }

  has(key) { return !!this.images[key]; }
  /** Адрес файла картинки из манифеста (для фона DOM-листа) или null. */
  url(key) { const e = this.entry(key); return e && e.file ? 'assets/' + e.file.replace(/^\/?(assets\/)?/, '') : null; }
  /** Прямоугольники записи манифеста (не только фона) в виде {x,y,w,h}. */
  entryRects(key) {
    const e = this.images[key];
    if (!e || !e.rects) return {};
    return Object.fromEntries(Object.entries(e.rects).map(([n, r]) => [n, normRect(r)]).filter(([, r]) => r));
  }
  isPlaceholder(key) { return !this.images[key]; }

  _resolve(bg, defs, kind) {
    if (this.isPlaceholder('bg.' + bg)) return { ...defs };
    const rects = this.rectsByBg[bg] || {};
    const extra = (kind === 'hotspots' ? this.hotspotsByBg : this.anchorsByBg)[bg] || {};
    const alias = ALIASES[bg] || {};
    const out = {};
    for (const [name, def] of Object.entries(defs)) {
      const src = [].concat(alias[name] || name);
      const found = src.map((n) => rects[n]).filter(Boolean);
      let r = def;
      if (found.length) r = found.length === 1 ? found[0] : unionRects(found);
      if (r && kind === 'hotspots' && PAD[bg]?.[name]) r = padRect(r, PAD[bg][name]);
      out[name] = extra[name] || r;
    }
    for (const [n, r] of Object.entries(extra)) if (!out[n]) out[n] = r;
    return out;
  }

  hotspots(bg) { return this._resolve(bg, DEFAULT_HOTSPOTS[bg] || {}, 'hotspots'); }
  anchors(bg) { return this._resolve(bg, DEFAULT_ANCHORS[bg] || {}, 'anchors'); }
  /** Все прямоугольники фона из манифеста как есть. */
  rects(bg) { return { ...(this.rectsByBg[bg] || {}) }; }

  /** Описание картинки, если она есть в манифесте (x/y — позиция слоя). */
  entry(key) {
    const e = this.images[key];
    if (!e) return null;
    return { file: e.file || e.src || e.path, w: +(e.w ?? e.width ?? 0), h: +(e.h ?? e.height ?? 0), x: +(e.x ?? 0), y: +(e.y ?? 0), on: e.on || null, clip: e.clip || null, rects: e.rects || null };
  }

  _loadSrc(src) {
    if (!this.srcCache.has(src)) {
      this.srcCache.set(src, new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('missing image ' + src));
        img.src = src;
      }));
    }
    return this.srcCache.get(src);
  }

  /** → Promise<{img, w, h, x, y, placeholder}> или null, если нет ни картинки, ни заглушки. */
  get(key) {
    if (this.cache.has(key)) return this.cache.get(key);
    const p = (async () => {
      const e = this.entry(key);
      if (e && e.file) {
        try {
          let img = await this._loadSrc('assets/' + e.file.replace(/^\/?(assets\/)?/, ''));
          // в рисунке впечатано пламя, а якоря для отдельного пламени нет — убираем, рисуем сами
          const bake = REAL_BAKED[key];
          if (bake && !(e.rects && e.rects.flame_anchor)) img = prepPlaceholder(img, BAKED[bake]);
          return { img, w: e.w || img.naturalWidth, h: e.h || img.naturalHeight, x: e.x, y: e.y, on: e.on, clip: e.clip, meta: this.images[key], placeholder: false };
        } catch (err) { console.warn(err.message, '— using a placeholder'); }
      }
      const ph = PLACEHOLDERS[key];
      if (!ph) return null;
      const img = await this._loadSrc(ph.src);
      let out = img, w = img.naturalWidth, h = img.naturalHeight;
      if (ph.crop) {
        const [sx, sy, sw, sh] = ph.crop;
        const c = document.createElement('canvas'); c.width = sw; c.height = sh;
        c.getContext('2d').drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
        out = c; w = sw; h = sh;
      }
      if (ph.prep && BAKED[ph.prep]) out = prepPlaceholder(out, BAKED[ph.prep]);
      return { img: out, w, h, x: 0, y: 0, placeholder: true };
    })();
    this.cache.set(key, p);
    return p;
  }

  /** Вложенная картинка записи: например, tongues.pale_white → grille, street_variants.x → window. */
  getSub(key, sub) {
    const ck = `${key}#${sub}`;
    if (this.cache.has(ck)) return this.cache.get(ck);
    const p = (async () => {
      const e = this.images[key] && this.images[key][sub];
      if (!e || !e.file) return null;
      const img = await this._loadSrc('assets/' + e.file.replace(/^\/?(assets\/)?/, ''));
      return { img, w: +(e.width ?? e.w ?? img.naturalWidth), h: +(e.height ?? e.h ?? img.naturalHeight), x: +(e.x ?? 0), y: +(e.y ?? 0), meta: e, placeholder: false };
    })().catch(() => null);
    this.cache.set(ck, p);
    return p;
  }

  /** Все картинки сцены одним списком; отсутствующие — null. */
  async getMany(keys) {
    const res = await Promise.all(keys.map((k) => this.get(k).catch(() => null)));
    return Object.fromEntries(keys.map((k, i) => [k, res[i]]));
  }
}

// ── Чистка заглушек: убрать впечатанную тень и пламя, чтобы их рисовала оболочка ──────────

function prepPlaceholder(img, baked) {
  const c = document.createElement('canvas');
  c.width = img.naturalWidth || img.width; c.height = img.naturalHeight || img.height;
  const g = c.getContext('2d', { willReadFrequently: true });
  g.drawImage(img, 0, 0);
  if (baked.shadow) liftShadow(g, baked.shadow);
  if (baked.flame) inpaintRows(g, baked.flame);
  return c;
}

/** Тень на бумаге — это та же бумага, только темнее. Высветляем тёмное пятно обратно. */
function liftShadow(g, r) {
  const d = g.getImageData(r.x, r.y, r.w, r.h);
  const px = d.data, W = r.w, H = r.h;
  const L = new Float32Array(W * H);
  for (let i = 0; i < W * H; i++) L[i] = (px[i * 4] + px[i * 4 + 1] + px[i * 4 + 2]) / 3;
  const B = boxBlur(boxBlur(L, W, H, 6), W, H, 6);
  let pSum = 0, pN = 0, sSum = 0, sN = 0;
  for (let i = 0; i < W * H; i++) {
    if (B[i] > 64) { pSum += L[i]; pN++; } else if (B[i] < 38) { sSum += L[i]; sN++; }
  }
  const k = pN && sN ? (pSum / pN) / (sSum / sN) : 2.4;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      const edge = Math.min(x, y, W - 1 - x, H - 1 - y);
      const ew = Math.max(0, Math.min(1, (edge - 3) / 7));
      const m = Math.max(0, Math.min(1, (62 - B[i]) / 22)) * ew;
      const gain = 1 + (k - 1) * m;
      px[i * 4] = Math.min(255, px[i * 4] * gain);
      px[i * 4 + 1] = Math.min(255, px[i * 4 + 1] * gain);
      px[i * 4 + 2] = Math.min(255, px[i * 4 + 2] * gain);
    }
  }
  g.putImageData(d, r.x, r.y);
}

function boxBlur(src, W, H, rad) {
  const tmp = new Float32Array(W * H), out = new Float32Array(W * H);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      let s = 0, n = 0;
      for (let k = -rad; k <= rad; k++) { const xx = x + k; if (xx >= 0 && xx < W) { s += src[y * W + xx]; n++; } }
      tmp[y * W + x] = s / n;
    }
  }
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      let s = 0, n = 0;
      for (let k = -rad; k <= rad; k++) { const yy = y + k; if (yy >= 0 && yy < H) { s += tmp[yy * W + x]; n++; } }
      out[y * W + x] = s / n;
    }
  }
  return out;
}

/** Заливка прямоугольника построчно между левым и правым краем, крупным «пикселем». */
function inpaintRows(g, r) {
  const d = g.getImageData(r.x - 2, r.y, r.w + 4, r.h);
  const px = d.data, W = r.w + 4, H = r.h;
  const B = 3;
  for (let y = 0; y < H; y += B) {
    const li = (y * W + 0) * 4, ri = (y * W + W - 1) * 4;
    for (let x = 2; x < W - 2; x += B) {
      const t = x / (W - 1);
      const n = (Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1 * 6;
      for (let c = 0; c < 3; c++) {
        const v = px[li + c] * (1 - t) + px[ri + c] * t + n;
        for (let yy = y; yy < Math.min(H, y + B); yy++) for (let xx = x; xx < Math.min(W - 2, x + B); xx++) px[(yy * W + xx) * 4 + c] = v;
      }
    }
  }
  g.putImageData(d, r.x - 2, r.y);
}
