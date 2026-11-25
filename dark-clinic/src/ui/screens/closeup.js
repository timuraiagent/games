// Крупные планы осмотра: язык за прутьями и рука на подушке (DESIGN §23, экран 4).
// Это тот же осмотр у окошка, только ближе: действия, цены и ид движка не меняются.
// Открыть крупный план — даром; за проверку платят здесь, цена видна до щелчка.
// Что уже увидено, открывается снова даром. Доска примет и кнопки — как у ставня; назад — одной кнопкой.
// Пока художник не дал картинок (bg.exam_tongue / bg.exam_pulse, tongue_bars, arms_close, our_hand_close),
// рисуются заглушки из того, что есть; отсутствующие файлы пропускаются без ошибок.

import { paintBg, panel, sideColumn, boardIn, LampLight, OilMarks, pulsePlan } from './common.js';
import { active, ambienceFromView } from '../present.js';
import { h } from '../kit.js';
import { t, tr } from '../strings/index.js';

const W = 1672, H = 941;

function backButton(shell) {
  const b = h('button', {
    class: 'plain-btn closeup-back paper', 'data-act': 'exam.back',
    onclick: (e) => { e.stopPropagation(); shell.closeCloseup(); },
  }, t(shell.closeup?.from === 'room' ? 'closeup.backRoom' : 'closeup.back'));
  b.tabIndex = -1;
  Object.assign(b.style, { left: '24px', top: '24px' });
  shell.stage.layers.ui.append(b);
}

function caption(shell, text, where = 'bottom') {
  let el = shell.stage.layers.ui.querySelector(':scope > .closeup-caption');
  if (!text) { el?.remove(); return; }
  if (!el) { el = h('div', { class: 'closeup-caption paper' }); shell.stage.layers.ui.append(el); }
  el.dataset.where = where;
  el.textContent = text;
}

function side(shell, v) {
  const a = active(v);
  const col = sideColumn(shell, { right: 24, top: 24, width: 310 });
  panel(shell, 'panel', { parent: col, title: a ? [a.name, a.who].filter(Boolean).join(', ') : null });
  if (a && (shell.actionsAt('board').length || a.lines?.length)) boardIn(shell, col, a);
  else col.querySelector(':scope > .board')?.remove();
}

/** Заглушка фона: кусок ставня вокруг отверстия, увеличенный во весь экран (тот же крупный пиксель). */
async function placeholderBg(shell, crop) {
  const rec = await shell.assets.get('bg.exam_closed').catch(() => null);
  const g = shell.stage.ctx.bg;
  g.fillStyle = '#0b0806'; g.fillRect(0, 0, W, H);
  if (!rec) return null;
  const s = Math.max(W / crop.w, H / crop.h);
  const ox = (W - crop.w * s) / 2, oy = (H - crop.h * s) / 2;
  g.imageSmoothingEnabled = false;
  g.drawImage(rec.img, crop.x, crop.y, crop.w, crop.h, ox, oy, crop.w * s, crop.h * s);
  return { s, ox, oy, crop };
}

const mapRect = (T, r) => ({ x: T.ox + (r.x - T.crop.x) * T.s, y: T.oy + (r.y - T.crop.y) * T.s, w: r.w * T.s, h: r.h * T.s });

// ── Язык ──────────────────────────────────────────────────────────────────────────────
export function tongueScreen(shell) {
  let view, lamp, oilMarks, opening, tongueRect = null, tongue = null, bars = null, T = null;

  async function load(v) {
    const a = active(v);
    const tid = a?.seen?.tongue?.image;
    // крупный язык художника для этого экрана (tongues.<id>.close); иначе — обычный, вписанный в отверстие
    tongue = tid ? (await shell.assets.getSub(`tongues.${tid}`, 'close')) : null;
    if (tongue) tongue.fixed = true;
    else tongue = tid ? await shell.assets.get(`tongues.${tid}`).catch(() => null) : null;
    caption(shell, a?.seen?.tongue?.text || null, 'side');   // подпись — в свободной полосе справа от рамы
  }

  return {
    name: 'tongue',
    async enter(v) {
      view = v;
      shell.dialoguePlace = 'closeup';   // реплики — полосой по нижней планке рамы: язык и доска открыты
      // в комнате — свой фон без прутьев (bg.room_tongue), пока его нет — тот же, что у ставня
      const inRoom = shell.closeup?.from === 'room';
      const bgName = inRoom && shell.assets.has('bg.room_tongue') ? 'room_tongue' : 'exam_tongue';
      const art = shell.assets.has(`bg.${bgName}`) ? await paintBg(shell, `bg.${bgName}`) : null;
      if (art) {
        const R = shell.assets.rects(bgName);
        opening = R.opening || { x: 560, y: 110, w: 560, h: 640 };
        tongueRect = R.tongue || opening;
      } else {
        // заглушка: решётка ставня крупно, за ней темнота
        T = await placeholderBg(shell, { x: 700, y: 95, w: 300, h: 169 });
        const gr = shell.assets.rects('exam_closed').grille || { x: 804, y: 140, w: 88, h: 74 };
        opening = T ? mapRect(T, { x: gr.x + 6, y: gr.y + 8, w: gr.w - 12, h: gr.h - 12 }) : { x: 560, y: 110, w: 560, h: 640 };
        const g = shell.stage.ctx.bg; g.fillStyle = '#050302'; g.fillRect(opening.x, opening.y, opening.w, opening.h);
      }
      bars = inRoom ? null : await shell.assets.get('exam_layers.tongue_bars').catch(() => null);
      if (bars && bars.placeholder) bars = null;
      this.noBars = inRoom;
      lamp = new LampLight(shell, {}, { flame: false });   // крупный план — как написан при любом масле
      oilMarks = new OilMarks(shell, { x: 30, y: 900, H: 20, text: { x: 30, y: 892 }, font: 24 });   // на доске рамы слева внизу
      await load(v);
      backButton(shell);
      side(shell, v);
      shell.audio.ambience({ ...ambienceFromView(v), hiss: 1.4 });
    },
    async update(v) { view = v; side(shell, v); await load(v); },
    lineShown() { side(shell, shell.view()); },
    frame(t) {
      const g = shell.stage.ctx.sprites;
      g.clearRect(0, 0, W, H);
      g.imageSmoothingEnabled = false;
      if (tongue && tongue.fixed) {
        g.drawImage(tongue.img, tongue.x, Math.round(tongue.y + Math.sin(t * 0.8) * 2), tongue.w, tongue.h);
      } else if (tongue && opening) {
        // язык крупно в отверстии, по высоте отверстия
        const s = Math.min((opening.h * 0.98) / tongue.h, (opening.w * 1.1) / tongue.w);
        const w = tongue.w * s, hh = tongue.h * s;
        g.save(); g.beginPath(); g.rect(opening.x, opening.y, opening.w, opening.h); g.clip();
        g.drawImage(tongue.img, Math.round(opening.x + (opening.w - w) / 2), Math.round(opening.y + (opening.h - hh) / 2 + Math.sin(t * 0.8) * 2), Math.round(w), Math.round(hh));
        g.restore();
      }
      if (bars) g.drawImage(bars.img, bars.x, bars.y, bars.w, bars.h);
      else if (opening && !this.noBars) {
        // прутья решётки (пока нет картинки художника): тёмное железо с бликом сбоку
        const n = 5, step = opening.w / (n + 1);
        for (let i = 1; i <= n; i++) {
          const x = Math.round(opening.x + i * step) - 7;
          g.fillStyle = '#1a120c'; g.fillRect(x, opening.y - 6, 14, opening.h + 12);
          g.fillStyle = 'rgba(150,110,70,0.35)'; g.fillRect(x + 2, opening.y - 6, 3, opening.h + 12);
        }
      }
      lamp?.frame(t);
      oilMarks?.draw();   // мел — своим слоем: светлый и при малом масле
    },
    debugState() { return { tongue: !!tongue, bars: !!bars, art: shell.assets.has('bg.exam_tongue') }; },
  };
}

// ── Пульс ─────────────────────────────────────────────────────────────────────────────
export function pulseScreen(shell) {
  let view, lamp, oilMarks, arm = null, hand = null, T = null, armKey = null;
  const beat = { times: [], press: 0 };

  async function load(v) {
    const a = active(v);
    // рука видна только после того, как пульс оплачен (seen.arm), — даром руки не видно
    const id = a?.seen?.arm?.image;
    if (id) {
      // своя рука гостя крупно (arms_close_of.<armImage>), иначе — прежняя arms_close.<image>
      const own = a?.seen?.arm?.armImage;
      const ownKey = own && shell.assets.has(`arms_close_of.${own}`) ? `arms_close_of.${own}` : null;
      arm = await shell.assets.get(ownKey || `arms_close.${id}`).catch(() => null);
      armKey = ownKey || `arms_close.${id}`;
      arm = arm && !arm.placeholder && /_pulse$/.test(arm.on || '') ? { ...arm, close: true } : await shell.assets.get(`arms.${id}`).catch(() => null);
      hand = await shell.assets.get('exam_layers.our_hand_close').catch(() => null);
      hand = hand && !hand.placeholder && /_pulse$/.test(hand.on || '') ? { ...hand, close: true } : await shell.assets.get('exam_layers.our_hand').catch(() => null);
    } else { arm = null; hand = null; }
    const texts = [a?.seen?.arm?.text, a?.seen?.pulseRate, a?.seen?.pulseDepth].filter(Boolean);
    caption(shell, texts.length ? texts.join(' ') : null, 'top');   // полоса — наверху слева, подушка открыта
  }

  const place = (r) => (r.close || !T ? r : mapRect(T, r));

  return {
    name: 'pulse',
    async enter(v) {
      view = v;
      shell.dialoguePlace = 'high';
      const pulseBg = shell.closeup?.from === 'room' && shell.assets.has('bg.room_pulse') ? 'room_pulse' : 'exam_pulse';
      if (shell.assets.has(`bg.${pulseBg}`)) { await paintBg(shell, `bg.${pulseBg}`); T = null; }
      else T = await placeholderBg(shell, { x: 400, y: 560, w: 560, h: 315 });   // круглая дверца и подушка крупно
      const PR = shell.assets.rects(pulseBg);
      const fr = PR.pillow && PR.opening ? { x: Math.min(PR.pillow.x, PR.opening.x), y: PR.opening.y, w: Math.max(PR.pillow.x + PR.pillow.w, PR.opening.x + PR.opening.w) - Math.min(PR.pillow.x, PR.opening.x), h: PR.pillow.y + PR.pillow.h - PR.opening.y } : { x: 300, y: 250, w: 1000, h: 600 };
      lamp = new LampLight(shell, {}, { flame: false });
      oilMarks = new OilMarks(shell, { x: 30, y: 900, H: 20, text: { x: 30, y: 892 }, font: 24 });   // на доске рамы слева внизу
      await load(v);
      backButton(shell);
      side(shell, v);
      shell.audio.ambience({ ...ambienceFromView(v), hiss: 1.4 });
    },
    async update(v) { view = v; side(shell, v); await load(v); },
    lineShown() { side(shell, shell.view()); },
    async armIn() { await shell.sleep(400); },
    /** Удары под пальцами — здесь их слышно; пальцы вздрагивают в такт, при глубине — нажим. */
    async feelPulse(check) {
      const p = pulsePlan(shell, check);
      const dur = shell.audio.pulse({ bpm: p.bpm, beats: p.strengths.length, strengths: p.strengths, gaps: p.gaps });
      let acc = performance.now() / 1000 + 0.05;
      beat.times = p.strengths.map((s, i) => { const b = { t: acc, s, press: p.presses[i] }; acc += p.gaps[i] * shell.speed; return b; });
      await shell.sleep((dur + 0.4) * 1000);
    },
    frame(t, dt) {
      const g = shell.stage.ctx.sprites;
      g.clearRect(0, 0, W, H);
      g.imageSmoothingEnabled = false;
      const now = performance.now() / 1000;
      let throb = 0, press = 0;
      for (const b of beat.times) {
        const d = now - b.t;
        if (d >= -0.3 && d < 0.6) press = Math.max(press, b.press);
        if (d >= 0 && d < 0.22) throb = Math.max(throb, b.s * (1 - d / 0.22));
      }
      beat.press += (press - beat.press) * Math.min(1, dt * 6);
      if (arm) { const r = place(arm); g.drawImage(arm.img, Math.round(r.x), Math.round(r.y + throb * 3), Math.round(r.w), Math.round(r.h)); }
      if (arm && hand) { const r = place(hand); g.drawImage(hand.img, Math.round(r.x), Math.round(r.y + beat.press * 8 + throb * 4), Math.round(r.w), Math.round(r.h)); }
      lamp?.frame(t);
      oilMarks?.draw();   // мел — своим слоем: светлый и при малом масле
    },
    debugState() { return { arm: !!arm, armKey, hand: !!hand, art: shell.assets.has('bg.exam_pulse') }; },
  };
}
