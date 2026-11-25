// Комната ночью: лампа и темнота по маслу, стук и тень на бумаге окошка, гость на табурете,
// Мэй, которая ждёт (на табурете или под навесом за ставней), книга, лист правил, календарь,
// дверь на лестницу. Всё, что читается, — даром.

import {
  trayFor, contactShadow, paintBg, placeHotspots, menuFor, panel, sideColumn, boardIn, LampLight, loadFlames,
  showLedger, ledgerSections, showPaper, lampSub, OilMarks, feelPulseAudio,
} from './common.js';
import { rulesMark, showRules, prepPapers } from './common.js';
import { silhouetteCanvas, silhouetteInfo } from '../silhouettes.js';
import { active, AMBIENCE_BY_NIGHT, ambienceFromView } from '../present.js';
import { t, tr } from '../strings/index.js';

const NAMES = {
  street_door: { label: 'room.street_door' },
  cabinet: { label: 'room.cabinet' },
  hatch: { label: 'room.hatch' },
  stair_door: { label: 'room.stair_door' },
  ledger: { label: 'room.ledger' },
  rules: { label: 'room.rules' },
  scales: { label: 'room.scales' },
  calendar: { label: 'room.calendar' },
  lamp: { label: 'lamp' },
  thermos: { label: 'room.thermos' },
};

export function roomScreen(shell) {
  let anchors, lamp, view, rects, oilMarks;
  const shadow = { type: null, alpha: 0, target: 0, slide: 0, img: null, knockTimes: [] };
  const eaves = { alpha: 0, target: 0, img: null };     // Мэй под навесом: край тени у бумаги
  let seated = null;     // на табурете: { rec, key }
  let benched = null;    // на лавке: { rec, key, still }
  let figsShown = false;
  let bodyStool = null, bodyWall = null;   // тело на табурете и у стены (nightView.bodyOnStool / bodyAtWall) // фигуры уже нарисованы хоть раз (держать их можно только тогда)
  let seal = null, bench = null, tray = null, earth = null, shadowBuf = null;
  let visitorEl = null, benchEl = null;

  const doorAtShutter = (v) => {
    const n = v.nightView;
    const d = n?.door;
    if (!d || n.over) return null;
    return d.step === 'knock' || (d.where === 'hatch' && n.focus !== 'door') ? d : null;
  };
  /** На табурете у лампы — тот, кого впустили и сейчас осматривают. */
  const sitter = (v) => {
    const n = v.nightView;
    if (!n) return null;
    const a = n.active;
    // ждущая на лавке, к которой повернулись, — остаётся на лавке, а не пересаживается на табурет
    if (a && a.where === 'inside' && a.seatedImage && n.focus !== 'waiting') return a;
    // в развязке: впущенный у лампы, даже когда разговор идёт с другим
    const d = n.door;
    if (d && d.where === 'inside' && d.seatedImage) return d;
    return null;
  };
  /** На лавке у стены, в темноте — тот, кто ждёт (один): оставленный сидеть или Мэй. */
  const bencher = (v) => {
    const n = v.nightView;
    if (!n) return null;
    // кто ждёт на лавке — там и сидит, повернулся к нему ученик или нет
    if (n.seated && n.seated.seatedImage) return n.seated;
    const w = n.waiting;
    if (w && (w.spot === 'bench' || w.spot === 'stool' || w.spot === 'dead')) return { ...w, seatedImage: w.seatedImage || 'mei', still: w.spot === 'dead' };
    return null;
  };

  function onHotspot(name, rect) {
    const v = shell.view();
    if (name === 'ledger') { showLedger(shell, ledgerSections(v)); return; }
    if (name === 'rules' && v.rules?.length) { showRules(shell, v.rules); return; }
    if (name === 'stair_door' && v.notes?.length) { const n = v.notes[v.notes.length - 1]; showPaper(shell, 'note', { text: n.text }); return; }
    if (name === 'hatch') {
      const d = doorAtShutter(v);
      const w = v.nightView?.waiting;
      const desc = [d ? d.knock : null].filter(Boolean).join(' ');
      const acts = shell.actionsAt('panel').filter((a) => ['open_hatch', 'dont_open', 'turn_to_waiting'].includes(a.id));
      menuFor(shell, 'hatch', rect, { title: t(NAMES.hatch.label), desc: desc || (w && w.spot === 'eaves' ? w.name : null), actions: acts });
      return;
    }
    if (name === 'lamp') {
      const lines = [v.lamp.note ? lampSub(shell) : t('lamp.ofCap', { SUB: lampSub(shell), CAP: v.lamp.capacity })];
      if (v.lamp.note) lines.push(v.lamp.note);
      menuFor(shell, 'lamp', rect, { title: t(NAMES.lamp.label), desc: lines.join('. '), actions: [] });
      return;
    }
    if (name === 'calendar' && v.calendar) { menuFor(shell, 'calendar', rect, { title: v.calendar.date, desc: v.calendar.text, actions: [] }); return; }
    if (name === 'thermos') {
      menuFor(shell, 'thermos', rect, { title: t('room.thermos'), desc: t('room.thermos.desc') });
      return;
    }
    if (name === 'cabinet' && v.stocks) {
      const lines = Object.values(v.stocks.herbs).map((x) => `${x.name} — ${x.doses}`).join('; ');
      menuFor(shell, 'cabinet', rect, { title: t(NAMES.cabinet.label), desc: `${lines}. ${v.stocks.poison.text}`, actions: [] });
    }
  }

  function onVisitor(rect) {
    const v = shell.view();
    const a = active(v);
    if (a && a.step === 'inside') menuFor(shell, 'visitor', rect, { title: a.name || '', desc: a.who || null, ...closeupMenu(a) });
  }
  /** Крупный план и в комнате: язык и рука гостя — тем же экраном, что у ставня. */
  function closeupMenu(a) {
    const KIND = { tongue: 'tongue', rinse: 'tongue', pulse_rate: 'pulse', pulse_depth: 'pulse' };
    const extra = [];
    if (a?.seen?.tongue) extra.push({ id: 'closeup.tongue', key: 'closeup.tongue', label: t('closeup.openTongue'), cost: 0, run: () => shell.openCloseup('tongue') });
    if (a?.seen?.arm) extra.push({ id: 'closeup.pulse', key: 'closeup.pulse', label: t('closeup.openPulse'), cost: 0, run: () => shell.openCloseup('pulse') });
    // проверка, сделанная из меню, открывает крупный план, когда её строки прочитаны
    return { extra, after: (x) => { const k = KIND[x.engineId]; if (k) shell.pendingCloseup = k; } };
  }
  function onBench(rect) {
    const v = shell.view();
    const b = bencher(v);
    if (!b) return;
    // повернулся к лавке — то же меню проверок, что у табурета; иначе — повернуться к ней
    const checks = shell.actionsAt('bench_visitor');
    const turn = shell.actionsAt('panel').filter((x) => x.id === 'turn_to_seated' || x.id === 'turn_to_waiting');
    // к тому, кто на лавке, повернулся ученик (Мэй, ночь 3) — те же крупные планы, что у табурета
    const a = active(v);
    const facing = a && a.step === 'inside' && checks.length > 0;
    menuFor(shell, 'bench_visitor', rect, { title: b.name || '', desc: b.who || null, actions: [...checks, ...turn], ...(facing ? closeupMenu(a) : {}) });
  }

  async function loadShadow(type) {
    if (!type) return;
    shadow.type = type;
    const rec = await shell.assets.get(`silhouettes.${type}`).catch(() => null);
    shadow.img = rec && !rec.placeholder ? rec : null;
  }

  async function refresh(v, events = [], instant = false) {
    view = v;
    const n = v.nightView;
    // пока читаются строки этого шага, картинка не обгоняет текст: фигуры, тень, земля — прежние
    // (если шаг пришёл с другого экрана — комната рисуется по виду до шага)
    const hold = shell.holdPictures && figsShown;
    if (!hold) {
    const vNow = v;
    if (shell.holdPictures && shell.viewBefore?.nightView) v = { ...v, nightView: shell.viewBefore.nightView };
    const n = v.nightView;
    figsShown = true;
    // тень у ставни
    const d = doorAtShutter(v);
    const knockComing = events.some((e) => e.type === 'sound' && e.sound === 'knock');
    if (d && !d.silhouette) shadow.target = 0;      // лампа погасла: бумага пустая, есть только стук
    else if (d && !knockComing) {
      if (shadow.type !== d.silhouette) await loadShadow(d.silhouette);
      shadow.target = 1;
      if (instant) { shadow.alpha = 1; shadow.slide = 0; }
    } else if (!d) shadow.target = 0;
    // Мэй под навесом: её тень с краю бумаги, пока она ждёт снаружи
    const w = n?.waiting;
    eaves.target = w && w.spot === 'eaves' ? 1 : 0;
    if (eaves.target && !eaves.img) eaves.img = await shell.assets.get('silhouettes.woman').catch(() => null);
    if (instant) eaves.alpha = eaves.target;
    // после развязки на табурете — горсть земли (картинка stool_earth, когда художник её даст)
    earth = (shell.flagEarth || (n && 'stoolEarth' in n ? n.stoolEarth : shell.memo.stoolEarth === v.night)) ? await shell.assets.get('props.stool_earth').catch(() => null) : null;
    // тело: на табурете (пока не унесли) и у стены под циновкой — из полей вида; картинки нет — тихо пропустить
    const bs = n?.bodyOnStool, bw = n?.bodyAtWall;
    bodyStool = bs ? await shell.assets.get(`seated.${bs.seatedImage || bs.image || bs}`).catch(() => null) : null;
    bodyWall = bw && shell.assets.has('props.body_mat') ? await shell.assets.get('props.body_mat').catch(() => null) : null;
    // табурет у края света и лавка в темноте
    const s = sitter(v);
    if (s) {
      // щепоть открыла неживого: с пальцев сыплется земля (seated.<id>_reveal), пока он здесь (nightView.revealed)
      const rk = `seated.${s.seatedImage}_reveal`;
      const key = n?.revealed === 'earth' && shell.assets.has(rk) ? rk : `seated.${s.seatedImage}`;
      if (!seated || seated.key !== key) seated = { key, rec: await shell.assets.get(key).catch(() => null) };
    } else seated = null;
    const b = bencher(v);
    if (b) {
      const key = `seated.${b.seatedImage}_bench`;
      if (!benched || benched.key !== key) benched = { key, rec: await shell.assets.get(key).catch(() => null) };
      benched.still = !!b.still;
    } else benched = null;
    // фигуры у края света и в темноте читаются хотя бы очертанием и при малом масле
    visitorEl?.remove(); visitorEl = null;
    benchEl?.remove(); benchEl = null;
    if (seated?.rec) {
      const r = rects.seat || { x: seated.rec.x, y: seated.rec.y, w: seated.rec.w, h: seated.rec.h };
      visitorEl = placeHotspots(shell, 'room_night', { visitor: { label: s.name || t('room.visitor') } }, (nm, rr) => onVisitor(rr), { visitor: r }).els.visitor;
    }
    if (benched?.rec) {
      const r = rects.waiting_spot || { x: benched.rec.x, y: benched.rec.y, w: benched.rec.w, h: benched.rec.h };
      benchEl = placeHotspots(shell, 'room_night', { bench_visitor: { label: b.name || t('room.bench') } }, (nm, rr) => onBench(rr), { bench_visitor: r }).els.bench_visitor;
    }
    v = vNow;
    }
    // доска — когда гость в комнате и с ним говорят
    const a = active(v);
    // доска уже и правее: лавка у стены (x до 1400) с тем, кто ждёт, всегда видна целиком
    const col = sideColumn(shell, { right: 20, top: 24, width: 250 });
    // доска не ложится на того, кто на лавке: колонка кончается над ним (и над хотспотом лавки)
    const benchTop = benched?.rec ? Math.min(benched.rec.y, (rects.waiting_spot || benched.rec).y) : null;
    col.style.maxHeight = benchTop ? `${Math.max(260, benchTop - 24 - 12)}px` : '';
    if (a && a.where !== 'hatch' && a.where !== 'door' && (shell.actionsAt('board').length || a.lines?.length)) boardIn(shell, col, a);
    else col.querySelector(':scope > .board')?.remove();
    const title = n?.over ? null : a && (a.where === 'inside' || a.where === 'stool') ? a.name : null;
    // лишние кнопки, которые ничего не дают, не показывать («у окошка никого»)
    const acts = shell.actionsAt('panel').filter((x) => x.enabled !== false || !['leave_seated', 'let_wait'].includes(x.id));
    panel(shell, 'panel', { x: 24, bottom: 24, width: 340, title, actions: acts });
    // при огарке полоса реплик уходит наверх: свеча и те, кого она освещает, остаются видны
    shell.dialoguePlace = shell.candle ? 'high' : 'bottom';
  }

  return {
    name: 'room',
    async enter(v) {
      prepPapers(shell);
      await paintBg(shell, 'bg.room_night');
      anchors = shell.assets.anchors('room_night');
      rects = shell.assets.rects('room_night');
      const flames = await loadFlames(shell);
      lamp = new LampLight(shell, anchors, { bg: 'room_night', candle: { x: 588, y: 806 }, flames, low: flames?.low });
      oilMarks = new OilMarks(shell, { x: 434, y: 495, H: 18, step: 9, gap: 12, text: { x: 776, y: 512 }, font: 23 });   // мелом по поперечной доске ставни: палочки слева от засова, строка справа   // мелом на досках ставни над весами, у лампы: панель и реплики его не закрывают
      placeHotspots(shell, 'room_night', { ...tr(NAMES), lamp: { label: t('lamp'), sub: () => lampSub(shell) } }, onHotspot,
        { thermos: rects.thermos || { x: 92, y: 548, w: 98, h: 212 } });
      seal = v.stocks?.poison?.sealed ? await shell.assets.get('props.seal').catch(() => null) : null;
      bench = await shell.assets.get('props.bench').catch(() => null);
      // комната помнит: поднос у двери на лестницу каждую ночь другой
      tray = await trayFor(shell, 'room_night', v.night);
      const trayR = rects.tray || (tray ? { x: tray.x, y: tray.y, w: tray.w, h: tray.h } : null);
      if (trayR) placeHotspots(shell, 'room_night', { tray: { label: t('room.tray') } }, (n, r) => {
        const vv = shell.view();
        menuFor(shell, 'tray', r, { title: t('room.tray'), desc: vv.tray?.text || null, actions: [] });
      }, { tray: trayR });
      figsShown = false;
      await refresh(v, shell.pendingEvents || [], true);
      rulesMark(shell, rects?.rules_sheet || rects?.rules);
      shell.audio.ambience(ambienceFromView(v));
    },
    update(v, events) { return refresh(v, events); },
    rulesMark() { rulesMark(shell, rects?.rules_sheet || rects?.rules); },
    lineShown() { refresh(shell.view(), []); },
    /** Стук: шаги (если в описании их нет — тишина), тень ложится на бумагу, удары. */
    async knock(k) {
      // в темноте (лампа погасла) тени нет — только стук
      if (k.silhouette) { await loadShadow(k.silhouette); shadow.alpha = 0; shadow.target = 1; shadow.slide = 1; } else shadow.target = 0;
      if (k.steps) {
        const dur = shell.audio.steps({ n: 4, gap: 0.7, approach: true, wet: view?.night === 2 });
        await shell.sleep(dur * 1000 + 300);
      } else await shell.sleep(1600);
      const gaps = shell.audio.constructor.rhythm(k.rhythm || 'even', k.count || 1);
      const start = performance.now() / 1000;
      shadow.knockTimes = [start];
      let acc = start;
      for (const gp of gaps) { acc += gp; shadow.knockTimes.push(acc); }
      const dur = shell.audio.knock({ count: k.count || 1, rhythm: gaps, strength: k.strength ?? 0.8 });
      await shell.sleep(dur * 1000);
      if (k.rustle) shell.audio.play('paper', { soft: true });
    },
    /** Пульс впущенного: те же удары под пальцами, что и у окошка. */
    async feelPulse(check) { await feelPulseAudio(shell, check); },
    frame(t, dt) {
      const g = shell.stage.ctx.sprites;
      g.clearRect(0, 0, 1672, 941);
      if (seal) g.drawImage(seal.img, seal.x, seal.y, seal.w, seal.h);   // печать — бумага, нарисованная художником
      const dark = shell.dark;   // в темноте от гостей не видно ничего
      // Мэй на лавке нарисована вместе с лавкой — тогда пустую лавку не рисуем
      const meiBench = benched?.key === 'seated.mei_bench' && benched?.rec;
      if (bench && !meiBench) { contactShadow(g, bench.x, bench.y + bench.h - 2, bench.w, 16, 0.5); g.drawImage(bench.img, bench.x, bench.y, bench.w, bench.h); }
      if (tray) { contactShadow(g, tray.x + 6, tray.y + tray.h - 4, tray.w - 12, 12, 0.45); g.drawImage(tray.img, tray.x, tray.y, tray.w, tray.h); }
      if (earth && !seated?.rec && earth.x != null) g.drawImage(earth.img, earth.x, earth.y, earth.w, earth.h);
      // и в темноте фигуры рисуются: их гасит та же карта темноты, что и стену за ними (этап 18)
      if (benched?.rec) {
        const r = benched.rec;
        const breathe = benched.still ? 0 : Math.round(Math.sin(t * 0.9 + 1) * 1);
        g.drawImage(r.img, r.x, r.y + breathe, r.w, r.h);
      }
      if (bodyWall && bodyWall.x != null) g.drawImage(bodyWall.img, bodyWall.x, bodyWall.y, bodyWall.w, bodyWall.h);
      if (bodyStool && !seated?.rec && bodyStool.x != null) g.drawImage(bodyStool.img, bodyStool.x, bodyStool.y, bodyStool.w, bodyStool.h);   // неподвижно
      if (seated?.rec) {
        const r = seated.rec;
        g.drawImage(r.img, r.x, r.y + Math.round(Math.sin(t * 1.1) * 1), r.w, r.h);
      }
      const k = dt / Math.max(0.05, shell.speed);
      shadow.alpha += Math.sign(shadow.target - shadow.alpha) * Math.min(Math.abs(shadow.target - shadow.alpha), k * 0.55);
      shadow.slide = Math.max(0, shadow.slide - k * 0.45);
      eaves.alpha += Math.sign(eaves.target - eaves.alpha) * Math.min(Math.abs(eaves.target - eaves.alpha), k * 0.4);
      if (anchors?.hatch_paper) {
        if (eaves.alpha > 0.002 && !dark) drawEaves(g, t);
        if (shadow.alpha > 0.002 && shadow.type) drawShadow(g, t);
      }
      lamp?.frame(t);
      oilMarks?.draw();   // мел — своим слоем: светлый и при малом масле
    },
    debugState() {
      return {
        shadow: { type: shadow.type, alpha: +shadow.alpha.toFixed(3), art: !!shadow.img },
        eaves: +eaves.alpha.toFixed(2), seated: seated?.key || null, bench: benched?.key || null, earth: !!earth,
      };
    },
  };

  /** Тень сквозь бумагу: художник дал всю бумагу окошка с фигурой за ней — рисуем как есть, только медленно покачиваем. */
  function drawShadow(g, t) {
    const p = anchors.hatch_paper;
    const info = silhouetteInfo(shadow.type);
    const now = performance.now() / 1000;
    let jx = 0;
    for (const kt of shadow.knockTimes) if (now >= kt && now - kt < 0.09) jx = 1;
    const sway = info.breathe ? Math.round(Math.sin(t * 0.55) * 1.5) : 0;
    const ease = shadow.slide * shadow.slide;
    g.save();
    g.beginPath(); g.rect(p.x, p.y, p.w, p.h); g.clip();
    g.globalAlpha = Math.min(1, shadow.alpha);
    if (shadow.img) {
      const s2 = shadow.img;
      // бумага с пятнами уже в картинке: фигура проступает, а не въезжает
      g.drawImage(s2.img, s2.x + sway + jx, s2.y, s2.w, s2.h);
    } else {
      const sc = silhouetteCanvas(shadow.type, p.w, p.h);
      g.globalAlpha *= 0.62;
      g.drawImage(sc.c, p.x - sc.pad + Math.round(ease * 46) + jx, p.y - sc.pad);
    }
    g.restore();
  }

  /** Мэй ждёт под навесом: край её тени с левого края бумаги, ниже и бледнее. */
  function drawEaves(g, t) {
    const p = anchors.hatch_paper;
    const s = eaves.img;
    if (!s) return;
    g.save();
    g.beginPath(); g.rect(p.x, p.y, p.w, p.h); g.clip();
    // под навесом стоят сбоку и ниже окошка: на бумаге — её плечо и голова у правого края
    g.globalAlpha = eaves.alpha * 0.85;
    const sway = Math.round(Math.sin(t * 0.8));
    // в картинке вся бумага с пятнами; сдвинуть можно только саму фигуру — то, чем панель темнее голой бумаги
    const fig = eaves.fig || (eaves.fig = shapeOnly(s, shell.stage.ctx.bg));
    g.drawImage(fig, p.x + p.w - s.w * 0.45 + sway, p.y + p.h * 0.32, s.w, s.h);
    g.restore();
  }
}

/** Только фигура из панели тени: темнота там, где панель темнее бумаги под ней. */
function shapeOnly(rec, bgCtx) {
  const c = document.createElement('canvas'); c.width = rec.w; c.height = rec.h;
  const x = c.getContext('2d');
  x.drawImage(rec.img, 0, 0, rec.w, rec.h);
  const a = x.getImageData(0, 0, rec.w, rec.h);
  const b = bgCtx.getImageData(rec.x, rec.y, rec.w, rec.h).data;
  const d = a.data;
  for (let i = 0; i < d.length; i += 4) {
    const la = (d[i] + d[i + 1] + d[i + 2]) / 3, lb = (b[i] + b[i + 1] + b[i + 2]) / 3;
    const k = Math.max(0, Math.min(1, (lb - la - 4) / 60)) * (d[i + 3] / 255);
    d[i] = 26; d[i + 1] = 18; d[i + 2] = 12; d[i + 3] = Math.round(k * 255);
  }
  x.putImageData(a, 0, 0);
  return c;
}
