// Весы: от первого лица, спиной к гостю — он виден только в медной банке.
// Травы берутся из самого шкафа: четыре блока ящиков — карта (холод/жар × снаружи/внутри).
// Блок, который следует из ответов на доске, тихо помечен; сколько доз осталось — чёрточками
// на бумажке у ящика. Яд — из красного верхнего ряда или из банки (уровень виден в банке,
// в ночи 1–2 ряд под бумажными полосками). На бумаге — то, что отвешено, потом свёрток.

import { paintBg, placeHotspots, menuFor, LampLight, loadFlames, lampSub, boardIn, OilMarks } from './common.js';
import { active, AMBIENCE_BY_NIGHT, ambienceFromView } from '../present.js';
import { h } from '../kit.js';
import { t } from '../strings/index.js';

const HERB_LAYOUT = {
  // столбцы — холод/жар, ряды — снаружи/внутри (как карта на листе Лю)
  herb_out_cold: { col: 0, row: 0 },
  herb_out_heat: { col: 1, row: 0 },
  herb_in_cold: { col: 0, row: 1 },
  herb_in_heat: { col: 1, row: 1 },
};

export function scalesScreen(shell) {
  let lamp, rects, view, oilMarks, blocks = {};
  const herbIcons = {};
  let warped = null;
  let herbImg = null, packetImg = null, poisonImg = null, reflect = null, hatchShadow = null, seal = null;

  /** Ночь 3: ключ открыл верхний ряд — банка стоит в открытом ряду (а не на столе). */
  function rowOpen() { const p = view?.stocks?.poison; return !!(p && !p.vial && !p.sealed && view.night >= 3); }
  function jarRect() {
    if (!rowOpen() || !poisonImg) return null;
    const top = rects.cabinet_top_row || { x: 255, y: 118, w: 745, h: 132 };
    const s = (top.h - 14) / poisonImg.h;
    const w = Math.round(poisonImg.w * s), hh = Math.round(poisonImg.h * s);
    return { x: Math.round(top.x + top.w * 0.46 - w / 2), y: top.y + top.h - hh - 4, w, h: hh };
  }

  function computeBlocks() {
    const cab = rects.cabinet || { x: 245, y: 85, w: 760, h: 605 };
    const top = rects.cabinet_top_row || { x: 255, y: 118, w: 745, h: 132 };
    const x0 = cab.x + 17, x1 = Math.min(cab.x + cab.w - 10, (rects.lamp?.x || 935) - 2);
    const y0 = top.y + top.h + 6, y1 = cab.y + cab.h;
    const mx = Math.round((x0 + x1) / 2), my = Math.round((y0 + y1) / 2);
    const out = {};
    for (const [herb, { col, row }] of Object.entries(HERB_LAYOUT)) {
      out[herb] = { x: col ? mx : x0, y: row ? my : y0, w: col ? x1 - mx : mx - x0, h: row ? y1 - my : my - y0 };
    }
    return out;
  }

  async function load(v) {
    const a = active(v);
    const pk = a?.packet || {};
    herbImg = pk.herb ? await shell.assets.get(`props.${pk.herb}`).catch(() => null) : null;
    packetImg = pk.wrapped ? await shell.assets.get('props.packet').catch(() => null) : null;
    const p = v.stocks?.poison;
    let img = null;
    if (p && v.night > 1) {
      img = p.vial ? 'vial' : `jar_poison_${Math.max(0, Math.min(3, p.pinches - (!pk.wrapped ? (pk.dose === 'pinch' ? 1 : pk.dose === 'measure' ? 3 : 0) : 0)))}`;
      if (p.vial && pk.dose === 'pinch' && !pk.wrapped) img = 'vial';
    }
    poisonImg = img ? await shell.assets.get(`props.${img}`).catch(() => null) : null;
    seal = p?.sealed || v.night === 1 ? await shell.assets.getSub('props.seal', 'scales') : null;
    const key = a?.letIn && a.seatedImage ? `seated.${a.seatedImage}` : a?.silhouette ? `silhouettes.${a.silhouette}` : null;
    reflect = key ? await shell.assets.get(key).catch(() => null) : null;
    hatchShadow = !a?.letIn && a?.silhouette ? await shell.assets.get(`silhouettes.${a.silhouette}`).catch(() => null) : null;
  }

  function board(v) {
    let col = shell.stage.layers.ui.querySelector(':scope > .side.scales-board');
    if (!col) { col = h('div', { class: 'side scales-board' }); shell.stage.layers.ui.append(col); }
    // доска — одна бумажка внизу слева, над ступкой: шкаф (карта) остаётся открытым
    Object.assign(col.style, { left: '12px', top: 'auto', bottom: '14px', width: '286px', maxHeight: '600px', justifyContent: 'flex-end' });
    if (shell.actionsAt('board').length) boardIn(shell, col, active(v));
    else col.querySelector(':scope > .board')?.remove();
  }

  function onHotspot(name, rect) {
    const v = shell.view();
    const a = active(v);
    if (name.startsWith('drawer_')) {
      const herb = name.slice(7);
      const st = v.stocks.herbs[herb];
      menuFor(shell, name, rect, { title: st?.name || t('scales.drawer'), desc: null });
      return;
    }
    if (name === 'top_row' && !rowOpen()) {
      // запечатан (ночь 1–2): щелчок говорит это строкой содержимого; яда отсюда не взять
      menuFor(shell, 'top_row', rect, { title: t('scales.top_row'), desc: v.stocks.poison.text, actions: [] });
      return;
    }
    if (name === 'jar' || name === 'top_row') { menuFor(shell, 'jar', rect, { title: t('scales.poison'), desc: v.stocks.poison.text, actions: shell.actionsAt('jar') }); return; }
    if (name === 'paper') {
      const pk = a?.packet;
      const what = pk ? [pk.herbName, pk.dose === 'pinch' ? t('scales.pinch') : pk.dose === 'measure' ? t('scales.measure') : null].filter(Boolean).join(' + ') : '';
      menuFor(shell, 'paper', rect, { title: t('scales.paper'), desc: what || null });
      return;
    }
    if (name === 'scales') { menuFor(shell, 'scales', rect, { title: t('scales.scales'), desc: null }); return; }
    if (name === 'copper') { menuFor(shell, 'copper', rect, { title: t('scales.copper'), desc: a?.name || null, actions: [] }); return; }
    if (name === 'lamp') menuFor(shell, 'lamp', rect, { title: t('lamp'), desc: lampSub(shell), actions: [] });
  }

  /** Что подсветить как «следующее»: ящик по доске, пока на весах пусто; бумагу, когда можно завернуть. */
  function hint(v) {
    const a = active(v);
    if (!a) return null;
    if (a.step === 'handover') return 'paper';
    const wrap = shell.actionsAt('paper').find((x) => x.id === 'wrap' && x.enabled);
    if (wrap) return 'paper';
    if (!a.packet?.herb && a.board?.drawer) return `drawer_${a.board.drawer}`;
    return null;
  }

  return {
    name: 'scales',
    async enter(v) {
      view = v;
      shell.dialoguePlace = 'bottom';
      shell.audio.ambience({ ...ambienceFromView(v), hiss: 0.6 });
      await paintBg(shell, 'bg.scales');
      rects = shell.assets.rects('scales');
      blocks = computeBlocks();
      const anchors = shell.assets.anchors('scales');
      const lampR = rects.lamp;
      const light = lampR ? { x: lampR.x + lampR.w / 2, y: lampR.y + lampR.h * 0.42 } : (anchors.light || { x: 990, y: 500 });
      // лампа стоит прямо на столе у весов: бумага и банка в её круге даже на последней ложке
      lamp = new LampLight(shell, { light }, { bg: 'scales', flame: false, candle: { x: 1235, y: 706 } });
      oilMarks = new OilMarks(shell, { x: 1404, y: 906, H: 18, step: 9, gap: 12, text: { x: 1404, y: 898 }, font: 23 });   // передняя кромка стола справа, где строка реплики не ложится
      // меню банки и ящиков не ложатся на лампу и весы
      shell.avoidRects = [lampR, rects.scales].filter(Boolean);   // передняя кромка стола, не посреди столешницы
      await load(v);
      for (const hb of Object.keys(HERB_LAYOUT)) herbIcons[hb] = await shell.assets.get(`props.${hb}`).catch(() => null);
      const names = {
        copper: { label: t('scales.copper') },
        scales: { label: t('scales.scales') },
        paper: { label: t('scales.paper.label') },
        jar: { label: t('scales.poison') },
        top_row: { label: t('scales.top_row') },
        lamp: { label: t('lamp'), sub: () => lampSub(shell) },
      };
      const extra = {
        copper: rects.copper_jar, scales: rects.scales, paper: rects.paper_square,
        jar: rowOpen() ? (jarRect() || rects.cabinet_top_row) : rects.poison_jar_place, top_row: rects.cabinet_top_row, lamp: rects.lamp,
      };
      for (const [herb, r] of Object.entries(blocks)) {
        const st = v.stocks.herbs[herb];
        names[`drawer_${herb}`] = { label: st?.name || herb, sub: () => t('scales.doses', { N: shell.view().stocks.herbs[herb].doses }) };
        extra[`drawer_${herb}`] = r;
      }
      placeHotspots(shell, 'scales', names, onHotspot, extra);
      // те же два вопроса, что на доске, мелом на шкафу: столбцы — холод / жар, ряды — снаружи / внутри
      const ui = shell.stage.layers.ui;
      const bo = blocks.herb_out_cold, bh = blocks.herb_out_heat, bi = blocks.herb_in_cold;
      // подписи мелом стоят по центру своей точки (ширина слова не важна — годится для любого языка)
      const chalk = (text, x, y, rot = 0, block = null) => ui.append(h('div', { class: 'chalk', 'data-block': block, text, style: { left: `${x}px`, top: `${y}px`, transform: `translateX(-50%) rotate(${rot}deg)` } }));
      chalk(t('board.cold'), bo.x + bo.w / 2, bo.y + 6, -2);
      chalk(t('board.heat'), bh.x + bh.w / 2, bh.y + 6, 1);
      chalk(t('board.out'), bo.x + bo.w * 0.55, bo.y + bo.h / 2 + 6, -1);
      chalk(t('board.in'), bi.x + bi.w * 0.55, bi.y + bi.h / 2 + 6, 1);
      // метка «по доске»: мелом в углу каждого блока (видна, когда блок подсказан)
      for (const [herb, r] of Object.entries(blocks)) chalk('○', r.x + 24, r.y + r.h - 40, 0, `drawer_${herb}`);
      board(v);
    },
    async update(v) {
      view = v;
      board(v);
      await load(v);
    },
    frame(t) {
      const g = shell.stage.ctx.sprites;
      g.clearRect(0, 0, 1672, 941);
      g.imageSmoothingEnabled = false;
      const v = view;
      // дозы на ящиках: бумажка с чёрточками; пустой ящик — крест
      const mark = v ? hint(v) : null;
      for (const [herb, r] of Object.entries(blocks)) {
        // сколько доз осталось — столько пучков травы лежит у ящика; пустой ящик — тёмный
        const doses = v?.stocks?.herbs?.[herb]?.doses ?? 0;
        if (doses <= 0) { g.fillStyle = 'rgba(6,4,3,0.45)'; g.fillRect(r.x, r.y, r.w, r.h); }

      }
      // подсказка «ящик по доске» — мелом на дереве (подпись блока), а не рамкой
      for (const el of shell.stage.layers.ui.querySelectorAll('.chalk')) el.classList.toggle('suggest', !!mark && el.dataset.block === mark);
      // бумажные полоски на верхнем ряду, пока он запечатан
      if (seal) g.drawImage(seal.img, seal.x, seal.y, seal.w, seal.h);
      const base = rects?.poison_jar_base;
      const jr2 = jarRect();
      if (poisonImg && jr2) g.drawImage(poisonImg.img, jr2.x, jr2.y, jr2.w, jr2.h);
      else if (poisonImg && base) {
        const s = poisonImg.w > 200 ? 0.62 : 0.75;
        g.drawImage(poisonImg.img, Math.round(base.x - (poisonImg.w * s) / 2), Math.round(base.y - poisonImg.h * s), poisonImg.w * s, poisonImg.h * s);
      }
      const paper = rects?.paper_square;
      if (paper) {
        const item = packetImg || herbImg;
        if (item) {
          const s = Math.min((paper.w * 0.6) / item.w, (paper.h * 0.72) / item.h);
          g.drawImage(item.img, Math.round(paper.x + (paper.w - item.w * s) / 2), Math.round(paper.y + (paper.h - item.h * s) / 2 - 6), item.w * s, item.h * s);
        }
      }
      const dark = shell.dark;   // в темноте ни тени, ни отражения
      const hp = rects?.hatch_paper;
      if (hatchShadow && hp && !dark) {
        g.save(); g.beginPath(); g.rect(hp.x, hp.y, hp.w, hp.h); g.clip();
        g.globalAlpha = 0.75;
        const s = (hp.h * 0.85) / hatchShadow.h;
        g.drawImage(hatchShadow.img, hp.x + hp.w / 2 - (hatchShadow.w * s) / 2, hp.y + hp.h * 0.2, hatchShadow.w * s, hatchShadow.h * s);
        g.restore();
      }
      const jr = rects?.jar_reflection;
      if (reflect && jr && !dark) {
        // медь с вмятинами: от гостя — тёмное кривое пятно, без подробностей
        if (!warped || warped.src !== reflect) warped = warpReflection(reflect, jr);
        const sway = Math.round(Math.sin(t * 0.7) * 2);
        g.save();
        g.beginPath(); g.ellipse(jr.x + jr.w / 2, jr.y + jr.h / 2, jr.w / 2, jr.h / 2, 0, 0, Math.PI * 2); g.clip();
        g.drawImage(warped.c, jr.x + sway, jr.y);
        g.restore();
      }
      lamp?.frame(t);
      oilMarks?.draw();   // мел — своим слоем: светлый и при малом масле
      // сколько доз осталось — мелом прямо на дереве ящика, как отметки масла: чёрточка — доза,
      // пустой ящик — чёрточка, перечёркнутая крест-накрест. В снимке без интерфейса не видно.
      const L = shell.stage.ctx.sprites;   // мел на дереве — под той же картой темноты
      if (!shell.hideGauge) {
        L.save();
        L.globalAlpha = 0.85;
        for (const [herb, r] of Object.entries(blocks)) {
          const doses = view?.stocks?.herbs?.[herb]?.doses ?? 0;
          const x0 = r.x + r.w - 26, y0 = r.y + 14;
          L.fillStyle = 'rgba(226,218,192,0.95)';
          if (doses <= 0) {
            L.fillRect(x0 - 2, y0, 4, 22);
            for (let k = 0; k < 22; k += 2) L.fillRect(x0 - 10 + k, y0 + 2 + k * 0.8, 3, 2);
          } else {
            for (let i2 = 0; i2 < Math.min(doses, 9); i2++) L.fillRect(x0 - i2 * 8 - (i2 >= 5 ? 6 : 0), y0 + ((i2 * 7) % 3) - 1, 4, 22);
          }
        }
        L.restore();
      }
    },
    debugState() { return { herb: !!herbImg, packet: !!packetImg, poison: !!poisonImg, reflection: !!reflect, hint: view ? hint(view) : null }; },
  };
}

/** Тихая метка: пунктир крупными клетками, медленно дышит. */
function dottedFrame(g, r, t) {
  const a = 0.35 + 0.2 * Math.sin(t * 1.6);
  g.save();
  g.fillStyle = `rgba(214,160,80,${a.toFixed(2)})`;
  for (let x = r.x; x < r.x + r.w; x += 12) { g.fillRect(x, r.y, 6, 3); g.fillRect(x, r.y + r.h - 3, 6, 3); }
  for (let y = r.y; y < r.y + r.h; y += 12) { g.fillRect(r.x, y, 3, 6); g.fillRect(r.x + r.w - 3, y, 3, 6); }
  g.restore();
}

/** Отражение в медной банке: силуэт по альфе, тёмная медь, волна по строкам (вмятины), сжатие к краям. */
function warpReflection(rec, jr) {
  const W = Math.round(jr.w), H = Math.round(jr.h);
  const src = document.createElement('canvas'); src.width = W; src.height = H;
  const sg = src.getContext('2d');
  const s = (H * 0.78) / rec.h;
  const w = rec.w * s * 0.6;
  sg.drawImage(rec.img, (W - w) / 2, H * 0.14, w, rec.h * s);
  const a = sg.getImageData(0, 0, W, H).data;
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d');
  const out = g.createImageData(W, H);
  for (let y = 0; y < H; y += 3) {
    const shift = Math.round(Math.sin(y / 17) * 4 + Math.sin(y / 5.3) * 1.5);
    const squeeze = 1 + 0.25 * Math.abs((y / H) - 0.5);
    for (let x = 0; x < W; x += 3) {
      const sx = Math.round((x - W / 2) * squeeze + W / 2) - shift;
      if (sx < 0 || sx >= W) continue;
      if (a[(y * W + sx) * 4 + 3] < 110) continue;
      for (let yy = y; yy < Math.min(H, y + 3); yy++) for (let xx = x; xx < Math.min(W, x + 3); xx++) {
        const p = (yy * W + xx) * 4;
        out.data[p] = 20; out.data[p + 1] = 10; out.data[p + 2] = 5; out.data[p + 3] = 200;
      }
    }
  }
  g.putImageData(out, 0, 0);
  return { c, src: rec };
}
