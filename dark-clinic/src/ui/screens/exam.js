// Осмотр через устройство в ставне. У каждой проверки — своё отверстие:
// щель — глаза, заслонка — вопросы, решётка — язык, зеркало — дыхание, круглая дверца — рука
// и пульс (его слышно и видно: удары в темпе гостя, лёгкое касание и нажим), ящик — чашка.
// Справа — доска примет и кнопки двери.

import { paintBg, placeHotspots, menuFor, panel, sideColumn, boardIn, LampLight, loadFlames, lampSub, OilMarks, pulsePlan } from './common.js';
import { prepPapers } from './common.js';
import { active, AMBIENCE_BY_NIGHT, ambienceFromView } from '../present.js';
import { t, tr } from '../strings/index.js';

const NAMES = {
  arm_door: { label: 'exam.arm_door' },
  drawer: { label: 'exam.drawer' },
  slot: { label: 'exam.slot' },
  voice: { label: 'exam.voice' },
  grille: { label: 'exam.grille' },
  mirror: { label: 'exam.mirror', act: 'bronze_mirror' },
  lamp: { label: 'lamp' },
};

export function examScreen(shell) {
  let view, anchors, lamp, oilMarks;
  let offerTimer = null, self = null, earthFall = null, armKey = null;
  let L = {};                 // слои по ключу
  let portrait = null, tongue = null, offer = null, slotImg = null;
  const hand = { press: 0, target: 0, beat: 0, show: false, alpha: 0 };
  let beatTimes = [];

  async function load(v) {
    const a = active(v);
    if (!a) return;
    const keys = ['exam_layers.slot_open', 'exam_layers.our_hand'];
    if (a.seen.tongue) keys.push('exam_layers.grille_open', 'exam_layers.grille_bars');
    if (a.seen.mirror) keys.push(`exam_layers.${a.seen.mirror.image}`);
    // рука — своя у каждого гостя (arms_of.<armImage>); пока художник её не дал — прежняя arms.<image>
    const ownArm = a.seen.arm?.armImage && shell.assets.has(`arms_of.${a.seen.arm.armImage}`) ? `arms_of.${a.seen.arm.armImage}` : null;
    if (a.seen.arm) keys.push('exam_layers.arm_door_open', ownArm || `arms.${a.seen.arm.image}`);
    armKey = a.seen.arm ? (ownArm || `arms.${a.seen.arm.image}`) : null;
    if (a.seen.rinsed) keys.push('exam_layers.drawer_open');
    const recs = await shell.assets.getMany(keys);
    L = Object.fromEntries(Object.entries(recs).filter(([, r]) => r && !r.placeholder));
    hand.show = !!(a.seen.pulseRate || a.seen.pulseDepth || a.seen.rest);
    // глаза в щели — готовая полоска художника на сетке руки, 1:1; иначе — портрет, вписанный по глазам
    slotImg = a.portrait ? await shell.assets.getSub(`portraits.${a.portrait}`, 'slot') : null;
    portrait = !slotImg && a.portrait ? await shell.assets.get(`portraits.${a.portrait}`).catch(() => null) : null;
    if (portrait) portrait.eyes = shell.assets.images[`portraits.${a.portrait}`]?.eyes;
    // маленький язык за прутьями (у художника — отдельная картинка под решётку)
    tongue = a.seen.tongue ? await shell.assets.getSub(`tongues.${a.seen.tongue.image}`, 'grille') : null;
    // чем платят — данными движка (монеты или пучок травы)
    const of = a.offer ? (a.offer.coins ? (a.offer.coins > 1 ? 'coins' : 'coin') : a.offer.herb) : null;
    // монеты, положенные без строки (движок прислал show на прилавок), лежат на прилавке ещё пару секунд
    const cs = shell.memo.counterShow;
    const fresh = cs && performance.now() - cs.at < 2600 * Math.max(0.2, shell.speed);
    // у ставни: земля с пальцев на круглой дверце (exam_layers.earth_fall), пока длится визит
    earthFall = v.nightView?.revealed === 'earth' && shell.assets.has('exam_layers.earth_fall') ? await shell.assets.get('exam_layers.earth_fall').catch(() => null) : null;
    offer = a.step === 'payment' ? await shell.assets.get(`props.${of || shell.memo.offer || 'coins'}`).catch(() => null)
      : fresh ? await shell.assets.get(`props.${cs.image}`).catch(() => null) : null;
    if (fresh && !offerTimer) offerTimer = setTimeout(() => { offerTimer = null; shell.memo.counterShow = null; shell.scenes.current === self && shell.scenes.update(shell.view(), []); }, 2600 * Math.max(0.2, shell.speed));
  }

  function side(v) {
    const a = active(v);
    const col = sideColumn(shell, { right: 24, top: 24, width: 310 });
    // сначала кнопки, потом доска: доска ужимается под оставшееся место, колонка не вылезает за окно
    panel(shell, 'panel', { parent: col, title: a ? [a.name, a.who].filter(Boolean).join(', ') : null });
    if (a && (shell.actionsAt('board').length || a.lines?.length)) boardIn(shell, col, a);
    else col.querySelector(':scope > .board')?.remove();
  }

  function onHotspot(name, rect) {
    const v = shell.view();
    const a = active(v);
    if (name === 'lamp') { menuFor(shell, 'lamp', rect, { title: t('lamp'), desc: lampSub(shell) }); return; }
    if (name === 'slot') {
      menuFor(shell, 'slot', rect, { title: a?.name || t('exam.slot'), desc: a?.who || null, actions: [] });
      return;
    }
    // язык и пульс смотрят крупно, каждый на своём экране; в темноте проверок нет — только меню с причиной
    if ((name === 'grille' || name === 'arm_door') && !shell.lampOut && a?.step === 'hatch') {
      shell.openCloseup(name === 'grille' ? 'tongue' : 'pulse');
      return;
    }
    menuFor(shell, name === 'mirror' ? 'bronze_mirror' : name, rect, { title: t(NAMES[name].label) });
  }

  self = {
    name: 'exam',
    async enter(v) {
      prepPapers(shell);
      view = v;
      shell.dialoguePlace = 'middle';
      await paintBg(shell, 'bg.exam_closed');
      anchors = shell.assets.anchors('exam_closed');
      const flames = await loadFlames(shell);
      // лампа у левого края на вытянутой руке: светит на отверстия; темнота берёт сначала дальние доски
      const R = shell.assets.rects('exam_closed');
      const r = (k, d) => R[k] || d;
      lamp = new LampLight(shell, anchors, { bg: 'exam_closed', candle: { x: 700, y: 246 }, flames, low: flames?.low });
      oilMarks = new OilMarks(shell, { x: 176, y: 900, H: 20, text: { x: 176, y: 892 }, font: 24 });   // передняя кромка прилавка   // передняя кромка прилавка у ставня
      await load(v);
      // погода ночи слышна и у окошка (и после перезагрузки сюда же)
      shell.audio.ambience({ ...ambienceFromView(v), hiss: 1.4 });
      placeHotspots(shell, 'exam_closed', { ...tr(NAMES), lamp: { label: t('lamp'), sub: () => lampSub(shell) } }, onHotspot);
      side(v);
    },
    lineShown() { side(shell.view()); },
    async update(v) {
      view = v;
      side(v);
      await load(v);
    },
    async armIn() {
      hand.alpha = 0;
      await shell.sleep(500);
    },
    /** Пульс под пальцами: удары в темпе гостя; глубину — лёгким касанием, потом нажимом. */
    async feelPulse(check) {
      const p = pulsePlan(shell, check);
      hand.show = true;
      const dur = shell.audio.pulse({ bpm: p.bpm, beats: p.strengths.length, strengths: p.strengths, gaps: p.gaps });
      const t0 = performance.now() / 1000 + 0.05;
      let acc = t0;
      beatTimes = p.strengths.map((s, i) => { const b = { t: acc, s, press: p.presses[i] }; acc += p.gaps[i] * shell.speed; return b; });
      await shell.sleep((dur + 0.4) * 1000);
      hand.target = 0;
    },
    frame(t, dt) {
      const g = shell.stage.ctx.sprites;
      g.clearRect(0, 0, 1672, 941);
      const order = ['exam_layers.slot_open', 'exam_layers.grille_open', 'tongue', 'exam_layers.grille_bars', 'exam_layers.mirror_clear', 'exam_layers.mirror_fog_weak', 'exam_layers.mirror_fog_strong', 'exam_layers.drawer_open', 'exam_layers.arm_door_open'];
      const dark = shell.dark;   // в темноте от гостя не видно ничего
      for (const k of order) {
        if (dark && (k === 'tongue' || k.startsWith('exam_layers.mirror_fog'))) continue;
        const R = k === 'tongue' ? tongue : L[k];
        if (R) g.drawImage(R.img, R.x, R.y, R.w, R.h);
      }
      // рука гостя; на запястье — наши пальцы, они нажимают и вздрагивают с ударом
      const now = performance.now() / 1000;
      let throb = 0, press = 0;
      for (const b of beatTimes) {
        const d = now - b.t;
        if (d >= -0.3 && d < 0.6) press = Math.max(press, b.press);
        if (d >= 0 && d < 0.22) throb = Math.max(throb, b.s * (1 - d / 0.22));
      }
      if (beatTimes.length && now > beatTimes[beatTimes.length - 1].t + 0.6) beatTimes = [];
      hand.press += (press - hand.press) * Math.min(1, dt * 6);
      for (const [k, R] of Object.entries(L)) {
        if ((k.startsWith('arms.') || k.startsWith('arms_of.')) && !dark) g.drawImage(R.img, R.x, R.y + throb * 1.5, R.w, R.h);
      }
      const H = L['exam_layers.our_hand'];
      if (H && hand.show) {
        hand.alpha = Math.min(1, hand.alpha + dt * 2);
        g.save(); g.globalAlpha = hand.alpha;
        g.drawImage(H.img, H.x, H.y + hand.press * 5 + throb * 2, H.w, H.h);
        g.restore();
      }
      if (offer && anchors.drawer_sill) g.drawImage(offer.img, anchors.drawer_sill.x, anchors.drawer_sill.y, offer.w * 0.55, offer.h * 0.55);
      else if (offer) g.drawImage(offer.img, 1000, 740, offer.w * 0.55, offer.h * 0.55);
      if (slotImg && !dark) g.drawImage(slotImg.img, slotImg.x, slotImg.y, slotImg.w, slotImg.h);
      else if (portrait && !dark) drawInto(g, portrait, anchors.eye_slot, portrait.eyes);
      if (earthFall && !shell.dark) g.drawImage(earthFall.img, earthFall.x, earthFall.y, earthFall.w, earthFall.h);
      lamp?.frame(t);
      oilMarks?.draw();   // мел — своим слоем: светлый и при малом масле
    },
    debugState() { return { arm: armKey, layers: Object.keys(L), portrait: !!(portrait || slotImg), slotStrip: !!slotImg, tongue: !!tongue, hand: hand.show, offer: !!offer }; },
  };
  return self;
}

/** Картинку вписать в отверстие: по глазам, если они размечены, иначе — по центру с обрезкой. */
function drawInto(g, rec, hole, eyes) {
  if (!hole) return;
  g.save();
  g.beginPath(); g.rect(hole.x, hole.y, hole.w, hole.h); g.clip();
  let s, dx, dy;
  if (eyes) {
    const [x0, y0, x1, y1] = eyes;
    s = (hole.w * 0.92) / (x1 - x0);
    dx = hole.x + hole.w / 2 - ((x0 + x1) / 2) * s;
    dy = hole.y + hole.h / 2 - ((y0 + y1) / 2) * s;
  } else {
    s = Math.max(hole.w / rec.w, hole.h / rec.h);
    dx = hole.x + (hole.w - rec.w * s) / 2;
    dy = hole.y + (hole.h - rec.h * s) / 2;
  }
  g.drawImage(rec.img, dx, dy, rec.w * s, rec.h * s);
  g.restore();
}
