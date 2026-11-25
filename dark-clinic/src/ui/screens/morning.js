// Утро: прилавок при сером свете. Книга приёма, касса (бумажные монеты среди настоящих),
// записка Лю из-под двери, улица в открытых ставнях (и во весь экран по щелчку), покупки, крючок.

import { rulesMark, showRules, trayFor, paintBg, placeHotspots, menuFor, panel, showLedger, ledgerSections, showPaper } from './common.js';
import { prepPapers } from './common.js';
import { h } from '../kit.js';
import { t, tr } from '../strings/index.js';

const NAMES = {
  street: { label: 'morning.street' },
  cash_box: { label: 'morning.cash_box' },
  ledger: { label: 'room.ledger' },
  note: { label: 'morning.note' },
  calendar: { label: 'room.calendar' },
  rules: { label: 'room.rules' },
  stair_door: { label: 'room.stair_door' },
};


export function morningScreen(shell) {
  let jarImg = null, trayImg = null;
  let rects, step = null, cashbox = null, paperMoney = null, trace = null, streetShown = null;

  const sections = (v) => [
    ...ledgerSections(v).filter((x) => !v.morning || !x.title.endsWith(` ${v.night}`)),
    { title: t('ledger.night', { N: v.night }), lines: v.morning?.ledger || [] },
  ];

  async function paintWindow(v) {
    const st = v.morning?.street;
    const img = st ? st.image : 'street_base';
    if (streetShown === img) return;
    await paintBg(shell, 'bg.room_morning');
    streetShown = img;
    // у художника для каждого вида улицы есть готовое окно — кладём как есть, без растяжения
    const rec = await shell.assets.getSub(`street_variants.${img}`, 'window');
    if (!rec) return;
    const bg = shell.stage.ctx.bg;
    bg.imageSmoothingEnabled = false;
    bg.drawImage(rec.img, rec.x, rec.y, rec.w, rec.h);
  }

  function openStreet(v) {
    const st = v.morning?.street;
    if (!st) return;
    const box = h('div', { class: 'street-view', 'data-act': 'street.close', role: 'dialog' });
    const cv = h('canvas', { width: 1672, height: 941 });
    box.append(cv);
    shell.assets.get(`street_variants.${st.image}`).then(async (rec) => {
      if (!rec) return;
      const g = cv.getContext('2d'); g.imageSmoothingEnabled = false;
      g.drawImage(rec.img, 0, 0, 1672, 941);
      // чашки на столе у Мэй — в её открытой двери, как часть улицы
      const door = shell.assets.images[`street_variants.${st.image}`]?.rects?.wei_mei_door
        || shell.assets.images['street_variants.street_base']?.rects?.wei_mei_door || [742, 395, 908, 768];
      const cupList = st.cups ? [st.cups] : (st.props || []).filter((p) => /^bowl_/.test(p.image || ''));
      for (const p of cupList) {
        const b = await shell.assets.get(`props.${p.image}`).catch(() => null);
        if (!b) continue;
        // художник написал полуоткрытую дверь со столом прямо на месте: рисуем по x,y манифеста
        if (b.x != null && b.y != null) { g.drawImage(b.img, b.x, b.y, b.w, b.h); continue; }
        const w = (door[2] - door[0]) * 0.62, s = w / b.w;
        g.drawImage(b.img, Math.round(door[0] + ((door[2] - door[0]) - w) / 2), Math.round(door[3] - b.h * s - 30), Math.round(w), Math.round(b.h * s));
      }
    });
    // подпись: одна перемена улицы и то, что видно у Мэй и в шкафу — одной полосой, без карточек
    box.append(h('div', { class: 'street-caption paper', text: captionOf(st) }));
    // видимый путь назад, как «К ставню» у крупных планов
    const back = h('button', { class: 'plain-btn closeup-back paper', 'data-act': 'street.back', text: t('street.back') });
    back.tabIndex = -1;
    Object.assign(back.style, { position: 'absolute', left: '24px', top: '24px' });
    box.append(back);
    box.addEventListener('click', (e) => { e.stopPropagation(); box.classList.remove('on'); box.style.pointerEvents = 'none'; setTimeout(() => box.remove(), 700); shell.overlay = null; });
    shell.stage.layers.text.append(box);
    shell.overlay = { el: box, kind: 'street', close: () => box.click() };
    requestAnimationFrame(() => requestAnimationFrame(() => box.classList.add('on')));
    shell.audio.play('shutter', { open: true, heavy: true });
  }

  function onHotspot(name, rect) {
    const v = shell.view();
    const m = v.morning;
    if (name === 'ledger') return showLedger(shell, sections(v));
    if (name === 'street') { if (m.street) openStreet(v); else menuFor(shell, 'street', rect, { title: t(NAMES.street.label), desc: null, actions: [] }); return; }
    // утро в любом порядке (раунд 29): касса и записка открываются с начала утра — их действием движка
    const look = (k) => shell.actions().find((a) => a.key === k && a.enabled !== false);
    if (name === 'note' || name === 'stair_door') {
      if (m.note) { showPaper(shell, 'note', { text: m.note }); return; }
      const a = look('look:note'); if (a) shell.perform(a.key);
      return;
    }
    if (name === 'cash_box') {
      if (m.cashbox) { menuFor(shell, 'cash_box', rect, { title: t(NAMES.cash_box.label), desc: m.cashbox.lines.join(' '), actions: [] }); return; }
      const a = look('look:cashbox'); if (a) shell.perform(a.key);
      return;
    }
    if (name === 'calendar' && v.calendar) { menuFor(shell, 'calendar', rect, { title: v.calendar.date, desc: v.calendar.text, actions: [] }); return; }
    if (name === 'rules' && v.rules?.length) showRules(shell, v.rules);
  }

  async function refresh(v, entering) {
    const m = v.morning;
    if (!m) return;
    await paintWindow(v);
    cashbox = m.cashbox ? await shell.assets.get('props.cashbox').catch(() => null) : null;
    paperMoney = m.cashbox && v.stocks.paperCoins > 0 ? await shell.assets.get('props.paper_money').catch(() => null) : null;
    // банка в верхнем ряду утром третьей ночи: пустая или с тем, что осталось — на прилавке у шкафа
    const jp = m.street?.jar || (m.street?.props || []).find((p) => /^jar_poison/.test(p.image));
    jarImg = jp ? await shell.assets.get(`props.${jp.image}`).catch(() => null) : null;
    trace = m.hook && m.hook.image ? await shell.assets.get(`props.${m.hook.image}`).catch(() => null) : null;
    const texts = {
      ledger: null,
      cashbox: null,          // строки кассы уже сказаны полосой — не повторять
      note: null,
      street: null,           // подпись улицы — на самой улице
      shop: m.shop ? [`${t('morning.coins', { COINS: v.stocks.coins })} ${Object.values(v.stocks.herbs).map((x) => `${x.name} — ${x.doses}`).join('; ')}.`, m.nextLampNote] : null,
      hook: m.hook ? [m.nextLampNote] : null,
    }[m.step];
    panel(shell, 'panel', { x: 24, bottom: 24, width: 420, text: texts });
    // ничто не светится как нажимаемое, если ничего не делает
    const can = (k) => shell.actions().some((a) => a.key === k && a.enabled !== false);
    const live = { cash_box: !!m.cashbox || can('look:cashbox'), note: !!m.note || can('look:note'), stair_door: !!m.note || can('look:note'), street: !!m.street || can('next') };
    for (const [nm, ok] of Object.entries(live)) {
      const el = shell.stage.layers.ui.querySelector(`.hotspot[data-act="${nm}"]`);
      if (el) el.setAttribute('aria-disabled', ok ? 'false' : 'true');
    }
    // бумажные монеты среди медных — видно сразу, без щелчка: строки кассы от движка у самой кассы
    shell.stage.layers.ui.querySelector(':scope > .cashbox-note')?.remove();
    if (m.cashbox && v.stocks?.paperCoins > 0 && m.cashbox.lines?.length) {
      const cb = rects?.cash_box || { x: 735, y: 785, w: 273, h: 156 };
      shell.stage.layers.ui.append(h('div', { class: 'cashbox-note paper', 'data-act': 'cash_box.note',
        style: { left: `${cb.x + cb.w + 14}px`, bottom: '24px', width: '330px' } }, ...m.cashbox.lines.map((l) => h('p', { text: l }))));
    }
    const changed = m.step !== step;
    step = m.step;
    if (!changed && !entering) return;
    // каждый шаг утра открывает своё — один раз
    if (m.step === 'ledger') setTimeout(() => showLedger(shell, sections(v)), 900 * shell.speed);
    if (m.step === 'note' && m.note) showPaper(shell, 'note', { text: m.note });
    if (m.step === 'street' && m.street) openStreet(v);
  }

  return {
    name: 'morning',
    async enter(v) {
      prepPapers(shell);
      // реплики утра — наверху: прилавок, касса и след у порога остаются открыты
      shell.dialoguePlace = 'high';
      rects = shell.assets.rects('room_morning');
      streetShown = null;
      await paintWindow(v);
      const extra = {};
      if (rects.window) extra.street = rects.window;
      if (rects.cash_box) extra.cash_box = rects.cash_box;
      if (rects.rules_sheet) extra.rules = rects.rules_sheet;
      placeHotspots(shell, 'room_morning', tr(NAMES), onHotspot, extra);
      shell.audio.ambience({ crickets: 0, rain: 0, wind: v.night === 3 ? 0.25 : 0.06, hiss: 0 });
      trayImg = await trayFor(shell, 'room_morning', v.night);
      await refresh(v, true);
      rulesMark(shell, rects.rules_sheet || rects.rules);
    },
    update(v) { refresh(v, false); },
    rulesMark() { rulesMark(shell, rects?.rules_sheet || rects?.rules); },
    frame() {
      const g = shell.stage.ctx.sprites;
      g.clearRect(0, 0, 1672, 941);
      // касса нарисована на прилавке с открытой крышкой; обгорелые бумажки — внутри ящика (cash_box_inside)
      const cb = rects?.cash_box_inside || rects?.cash_box;
      if (cashbox && cb && paperMoney) {
        const s = Math.min((cb.h * 0.9) / paperMoney.h, (cb.w * 0.4) / paperMoney.w);
        g.drawImage(paperMoney.img, Math.round(cb.x + cb.w * 0.52), Math.round(cb.y + (cb.h - paperMoney.h * s) / 2), Math.round(paperMoney.w * s), Math.round(paperMoney.h * s));
      }
      if (trace) g.drawImage(trace.img, trace.x, trace.y, trace.w, trace.h);
      if (trayImg) g.drawImage(trayImg.img, trayImg.x, trayImg.y, trayImg.w, trayImg.h);
      if (jarImg) { const s = 0.5; g.drawImage(jarImg.img, 250, Math.round(760 - jarImg.h * s), Math.round(jarImg.w * s), Math.round(jarImg.h * s)); }
      // утро — как написано художником (дневной свет в самой картине); своего света нет
      shell.stage.ctx.light.clearRect(0, 0, 1672, 941);
    },
    debugState() { return { step, street: streetShown, cashbox: !!cashbox, paperMoney: !!paperMoney }; },
  };
}

function captionOf(st) {
  return [st.caption, ...(st.props || []).map((p) => p.text)].filter(Boolean).join(' ');
}

