// Обложка, вечер (лист календаря, лист правил, записка Лю и то, что на подносе), конец демо.

import { sheetTabs, softIn, prepPapers, paintBg, placeHotspots, menuFor, panel, LampLight, showPaper } from './common.js';
import { h, ruleSheetBody } from '../kit.js';
import { t, STRINGS } from '../strings/index.js';
import { saveLang } from '../engine-adapter.js';
import { fitSheet } from './fit.js';

// ── Обложка ───────────────────────────────────────────────────────────────────────────
export function titleScreen(shell) {
  let lamp;
  return {
    name: 'title',
    async enter(v) {
      prepPapers(shell);
      await paintBg(shell, 'bg.title');
      // обложка: свет падает от лампы слева и гаснет к правому краю; сверху не виньетка — темнота дана самой картинкой
      lamp = new LampLight(shell, shell.assets.anchors('title'), { flame: false });   // обложка — как написана
      const tt = v.title || { name: t('title.name'), sub: '' };
      const block = h('div', { class: 'title-block' }, h('h1', { text: tt.name }), h('div', { class: 'sub', text: tt.sub }));
      const start = shell.game.actions().find((a) => a.id === 'new_game');
      // новая игра поверх сохранения — только после вопроса
      const askNew = () => {
        if (!shell.hasSave) { shell.perform('title.new'); return; }
        if (shell.stage.layers.ui.querySelector('.title-confirm')) return;
        const box = h('div', { class: 'title-confirm paper slip' },
          h('p', { text: t('title.confirm') }),
          h('div', { class: 'row' },
            h('button', { 'data-act': 'title.new.confirm', onclick: (e) => { e.stopPropagation(); box.remove(); shell.perform('title.new', { confirmed: true }); } }, t('title.confirm.yes')),
            h('button', { 'data-act': 'title.new.cancel', onclick: (e) => { e.stopPropagation(); box.remove(); } }, t('title.confirm.no'))));
        shell.stage.layers.ui.append(box);
      };
      const menu = h('div', { class: 'title-menu' },
        h('button', { class: 't-item', 'data-act': 'title.new', onclick: () => shell.perform('title.new') }, shell.hasSave ? t('title.new') : (start?.label || t('title.begin'))),
        shell.hasSave ? h('button', { class: 't-item', 'data-act': 'title.continue', onclick: () => shell.perform('title.continue') }, t('title.continue')) : null,
        // сохранение на другом языке: «Продолжить» откроет его на его языке — сказать об этом рядом
        saveLangNote(shell));
      // язык: два слова в духе картинки; выбор — для новой игры и для обложки сразу
      const langs = h('div', { class: 'title-langs', 'data-act': 'title-langs' },
        ...['ru', 'en'].flatMap((l, i) => [
          i ? h('span', { class: 'dot', text: '·' }) : null,
          h('button', { class: `lang${shell.uiLang === l ? ' on' : ''}`, 'data-act': `lang.${l}`, lang: l, onclick: (ev) => { ev.stopPropagation(); shell.chooseLang(l); } }, STRINGS[l]['lang.self']),
        ]));
      shell.stage.layers.ui.append(block, menu, langs);
      shell.audio.ambience({ crickets: 0.35, rain: 0, wind: 0.25, hiss: 0 });
      this.askNew = askNew;
    },
    frame(t) { shell.stage.ctx.sprites.clearRect(0, 0, 1672, 941); lamp?.frame(t); },
  };
}

// ── Вечер ─────────────────────────────────────────────────────────────────────────────
export function eveningScreen(shell) {
  let lamp, trayImg = null, bottleImg = null;
  return {
    name: 'evening',
    async enter(v) {
      const e = v.evening || {};
      shell.dialoguePlace = 'evening';   // реплики — слева над кнопками; лист правил справа открыт
      const bg = await paintBg(shell, 'bg.wall_evening');
      const an = shell.assets.anchors('wall_evening');
      const rects = shell.assets.rects('wall_evening');
      const leaf = { ...(rects.calendar_leaf || an.calendar_leaf) };
      const text = rects.rules_text_area || an.rules_text_area;
      lamp = new LampLight(shell, {}, { flame: false });   // вечер — как написан
      const cal = e.calendar || v.calendar;
      const icon = cal ? await shell.assets.get(`props.${cal.image}`).catch(() => null) : null;
      const g = shell.stage.ctx.bg;
      if (icon && bg) {
        // из листа-приметы берём только поле с рисунком, без кольца и рваного низа
        const sx = icon.w * 0.04, sy = icon.h * 0.2, sw = icon.w * 0.92, sh = icon.h * 0.62;
        const dw = Math.min(leaf.w * 0.7, 320), s = dw / sw, dh = sh * s;
        g.imageSmoothingEnabled = false;
        g.globalAlpha = 0.92;
        g.drawImage(icon.img, sx, sy, sw, sh, leaf.x + (leaf.w - dw) / 2 + 4, leaf.y + 8, dw, dh);
        g.globalAlpha = 1;
        leaf.textTop = leaf.y + 8 + dh + 4;
      }
      const ui = shell.stage.layers.ui;
      if (cal) {
        // подпись календаря — правило ночи, по нему решают: листок бумаги над календарём, тёмным по светлому;
        // реплики внизу слева его не закрывают
        ui.append(h('div', { class: 'cal-text cal-card paper', 'data-act': 'calendar.text', style: { left: `${leaf.x + 6}px`, top: '22px', width: `${leaf.w - 12}px` } },
          h('div', { class: 'n', text: cal.date }),
          h('div', { class: 'w', text: cal.text })));
      }
      const r = e.rules || (v.rules || [])[v.rules?.length - 1];
      if (r) {
        // лист на стене: светлеет сама бумага до рваных краёв; текст — на всю высоту листа
        const sheetR = shell.assets.rects('wall_evening').rules_sheet || { x: 862, y: 28, w: 626, h: 904 };
        const area = { x: sheetR.x + 40, y: sheetR.y + 32, w: sheetR.w - 84, h: sheetR.h - 62 };
        lightenPaper(shell.stage.ctx.bg, sheetR, area);
        // на стене лист открыт: новое на нём — свежими чернилами, знак с ярлыка снимается
        const freshOf = (rr, i) => shell.takeFresh?.(rr.n ?? i + 1) || null;
        const all0 = v.rules || [];
        const box = h('div', { class: 'rules-on-wall', 'data-act': 'rules', style: { left: `${area.x}px`, top: `${area.y}px`, width: `${area.w}px`, height: `${area.h}px` } },
          h('h2', { text: r.title }), ...ruleSheetBody(r, { fresh: freshOf(r, Math.max(0, all0.findIndex((x) => x.title === r.title))) }));
        ui.append(box);
        fitSheet(box);
        // листы копятся: прежние — ярлыками слева от листа, щелчок кладёт выбранный сверху
        const all = v.rules || [];
        if (all.length > 1) {
          const show = (i) => {
            const rr = all[i];
            box.style.removeProperty('font-size');
            box.replaceChildren(h('h2', { text: rr.title }), ...ruleSheetBody(rr, { fresh: freshOf(rr, i) }));
            box.scrollTop = 0;
            fitSheet(box);
            ui.querySelector(':scope > .sheet-tabs')?.remove();
            ui.append(sheetTabs(shell, all, i, show, { x: sheetR.x - 196, y: 40 }));
          };
          ui.append(sheetTabs(shell, all, all.findIndex((x) => x.title === r.title) >= 0 ? all.findIndex((x) => x.title === r.title) : all.length - 1, show, { x: sheetR.x - 196, y: 40 }));
        }
      }
      // поднос у двери на лестницу: записка, склянка или ключ
      trayImg = e.tray && e.tray !== 'tray' ? await shell.assets.get(`props.${e.tray}`).catch(() => null) : null;
      // ночь 3: с ключом — бутыль масла Лю (картинка bottle_liu, когда художник её даст)
      bottleImg = e.tray === 'key' ? await shell.assets.get('props.bottle_liu').catch(() => null) : null;
      const trayRect = { x: 40, y: 500, w: 170, h: 200 };
      if (e.trayNote) ui.append(h('div', { class: 'tray-note', text: e.trayNote, style: { left: '30px', top: '700px', width: '210px' } }));
      placeHotspots(shell, 'wall_evening', { tray: { label: e.tray === 'vial' ? t('evening.tray.vial') : e.tray === 'key' ? t('evening.tray.key') : t('evening.tray.note') } },
        () => { if (e.note) showPaper(shell, 'note', { text: e.note }); }, { tray: trayRect });
      // своё отражение и почему лампа сегодня такая — на бумажке у двери, вместе с кнопкой
      // кнопки — внизу слева, под календарём; своё отражение и почему лампа такая — бумажкой слева,
      // чтобы ничто не закрывало лист календаря с предупреждением ночи
      panel(shell, 'panel', { x: 24, bottom: 18, width: 470 });
      const slipText = [e.self, v.lamp?.note].filter(Boolean);
      if (slipText.length) {
        const slip = h('div', { class: 'panel paper evening-slip', 'data-act': 'evening-slip' }, ...slipText.map((t) => h('div', { class: 'panel-text small', text: t })));
        Object.assign(slip.style, { left: '12px', top: '40px', width: '186px' });
        ui.append(slip);
      }
      shell.audio.ambience({ crickets: v.night === 1 ? 0.5 : 0, rain: v.night === 2 ? 0.6 : 0, wind: v.night === 3 ? 0.6 : 0, hiss: 0 });
      this.noteImg = await shell.assets.get('props.note').catch(() => null);
    },
    frame(t) {
      const g = shell.stage.ctx.sprites;
      g.clearRect(0, 0, 1672, 941);
      // сложенная записка и то, что пришло с ней, лежат у края стены
      if (this.noteImg) g.drawImage(this.noteImg.img, 50, 560, this.noteImg.w * 0.42, this.noteImg.h * 0.42);
      if (trayImg) g.drawImage(trayImg.img, 120, 520, trayImg.w * 0.42, trayImg.h * 0.42);
      if (bottleImg) { const s = 150 / bottleImg.h; g.drawImage(bottleImg.img, 22, 690 - Math.round(bottleImg.h * s), Math.round(bottleImg.w * s), Math.round(bottleImg.h * s)); }
      lamp?.frame(t);
    },
  };
}

// ── Конец демо ────────────────────────────────────────────────────────────────────────
export function endScreen(shell) {
  return {
    name: 'end',
    async enter(v) {
      const e = v.end || { title: '', lines: [] };
      const again = shell.game.actions().find((a) => a.id === 'new_game');
      // перечень — на последнем развороте книги приёма (картинка книги художника), тёмными чернилами
      const g = shell.stage.ctx.bg;
      g.fillStyle = '#0b0806'; g.fillRect(0, 0, 1672, 941);
      const book = await shell.assets.get('props.ledger_open').catch(() => null);
      if (book) { g.imageSmoothingEnabled = false; g.drawImage(book.img, 0, 0, 1672, 941); }
      const rows = rollRows(e);
      const row = ({ name, fate, cause }) => name
        ? [h('span', { class: 'who', text: name }), h('span', { class: 'what' }, fate, cause ? h('span', { class: 'cause', text: cause }) : null)]
        : [h('span', { class: 'what plain', text: fate })];
      const half = Math.ceil(rows.length / 2);
      const left = h('div', { class: 'roll-page left' }, h('h1', { text: e.title }), h('div', { class: 'roll' }, ...rows.slice(0, half).flatMap(row)));
      const right = h('div', { class: 'roll-page right' }, h('div', { class: 'roll' }, ...rows.slice(half).flatMap(row)),
        playtimeLine(shell),
        again ? h('button', { class: 'plain-btn roll-again', 'data-act': 'new_game', onclick: (ev) => { ev.stopPropagation(); shell.perform('new_game'); } }, again.label) : null);
      const card = h('div', { class: `end-card on-book${book ? '' : ' no-book'}`, 'data-act': 'end-card' }, left, right);
      const askNew = () => {
        if (card.querySelector('.title-confirm')) return;
        // вопрос — на листке той же бумаги, что вечерние записки
        const box = h('div', { class: 'title-confirm paper slip' },
          h('p', { text: t('end.confirm') }),
          h('div', { class: 'row' },
            h('button', { 'data-act': 'new_game.confirm', onclick: (e2) => { e2.stopPropagation(); shell.perform('new_game', { confirmed: true }); } }, t('title.confirm.yes')),
            h('button', { 'data-act': 'new_game.cancel', onclick: (e2) => { e2.stopPropagation(); box.remove(); } }, t('end.confirm.no'))));
        right.append(box);
      };
      this.askNew = askNew;
      shell.stage.layers.ui.append(card);
      shell.audio.ambience({ crickets: 0, rain: 0, wind: 0.15, hiss: 0 });
    },
  };
}

/**
 * Высветлить нарисованный лист бумаги на фоне до его рваных краёв: форму листа даёт размытая яркость
 * (лист светлее стены), внутри формы пятна и грязь приглушаются почти до ровной бумаги, края остаются рисунком.
 */
function lightenPaper(g, r, text = null) {
  const d = g.getImageData(r.x, r.y, r.w, r.h);
  const px = d.data, W = r.w, H = r.h;
  const C = 4, gw = Math.ceil(W / C), gh = Math.ceil(H / C);
  const lum = new Float32Array(gw * gh);
  for (let j = 0; j < gh; j++) for (let i = 0; i < gw; i++) {
    let s2 = 0, n = 0;
    for (let y = j * C; y < Math.min(H, j * C + C); y++) for (let x = i * C; x < Math.min(W, i * C + C); x++) { const p = (y * W + x) * 4; s2 += px[p] + px[p + 1] + px[p + 2]; n++; }
    lum[j * gw + i] = s2 / n / 3;
  }
  const blur = (a, rad) => {
    const o = new Float32Array(a.length);
    for (let j = 0; j < gh; j++) for (let i = 0; i < gw; i++) {
      let s2 = 0, n = 0;
      for (let dj = -rad; dj <= rad; dj++) for (let di = -rad; di <= rad; di++) {
        const jj = j + dj, ii = i + di; if (jj < 0 || ii < 0 || jj >= gh || ii >= gw) continue; s2 += a[jj * gw + ii]; n++;
      }
      o[j * gw + i] = s2 / n;
    }
    return o;
  };
  // бумага — всё, что светлее стены (тёмные пятна внутри листа — тоже лист); край листа рваный, как нарисован
  const b = blur(lum, 2);
  const wide = text ? blur(lum, 9) : null;   // сквозь крупные тёмные пятна: лист — то, что в среднем светлее стены
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const cell = Math.floor(y / C) * gw + Math.floor(x / C);
    // под текстом — чистая светлая бумага; к полям переход широкий, пятна остаются только на полях
    const tz = text ? softIn(r.x + x, r.y + y, text, 6, 36) : 0;
    let pm = Math.max(0, Math.min(1, (b[cell] - 22) / 10));
    if (tz > 0) pm = Math.max(pm, Math.min(tz, Math.max(0, Math.min(1, (wide[cell] - 18) / 8))));
    if (tz > 0) pm = Math.max(pm, softIn(r.x + x, r.y + y, text, -6, 10));   // сам текст — всегда на бумаге
    if (pm <= 0) continue;
    const k = pm * (0.72 + 0.25 * tz);
    const p = (y * W + x) * 4;
    px[p] += (232 - px[p]) * k; px[p + 1] += (218 - px[p + 1]) * k; px[p + 2] += (186 - px[p + 2]) * k;
  }
  g.putImageData(d, r.x, r.y);
}

/** Строки перечня: из view.end.rows ({ name, fate, cause }) — имя отдельно, судьба, причина у умерших;
 *  если движок строк-данных не дал — строки как есть, без разбора по тире. */
function rollRows(e) {
  if (Array.isArray(e.rows) && e.rows.length) {
    // причина — один раз: если движок уже вписал её в судьбу, отдельно не повторять
    const rows = e.rows.map((r) => {
      const fate = r.fate || '', cause = r.cause || '';
      return { name: r.name || '', fate, cause: cause && fate.includes(cause) ? '' : cause };
    });
    // строки сверх перечня (например «конец демо») — как есть, без имени
    const extra = (e.lines || []).slice(rows.length).map((l) => ({ name: '', fate: String(l), cause: '' }));
    return [...rows, ...extra];
  }
  return (e.lines || []).map((l) => ({ name: '', fate: String(l), cause: '' }));
}

/** Под перечнем судеб — сколько минут шла каждая ночь и всего (счёт интерфейса; без хранилища — ничего). */
function playtimeLine(shell) {
  const s = shell.playtime?.summary();
  if (!s) return null;
  const parts = [...s.nights.map((x) => t('end.time.night', { N: x.n, MIN: x.min })), t('end.time.total', { MIN: s.total })];
  return h('div', { class: 'roll-time', 'data-act': 'end.playtime' },
    ...parts.flatMap((p, i) => [i ? h('span', { class: 'sep', text: ' · ' }) : null, h('span', { class: 'part', text: p })]));
}

/** Подпись у «Продолжить», если сохранённая игра на другом языке, чем выбран на обложке. */
function saveLangNote(shell) {
  if (!shell.hasSave) return null;
  const l = saveLang();
  if (!l || l === shell.uiLang) return null;
  return h('div', { class: 't-note', 'data-act': 'title.save-lang', text: t('title.saveLang', { LANG: t(`lang.name.${l}`) }) });
}
