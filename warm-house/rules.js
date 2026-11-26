// ТЁПЛЫЙ ДОМ — правила (pipeline-game, этап 3). Договор модуля — pipeline-game/kit/rules.js.
// Общая величина — тепло комнаты, целое от 0 до 6. Ядро (двери) разводит тепло и выстуживает закрытые комнаты,
// печь даёт новое тепло, и раскалённая комната сама греет соседей; пар уносит воду из тёплой комнаты в самую
// холодную. Карта уровня: буква — комната, 'o' — открытая дверь, 'x' — закрытая, пробел — стена.
// Комнаты стоят на чётных клетках, двери и стены — между ними. Без случайности: всё задано уровнем.
(function (root) {
  const NODE = typeof module !== 'undefined' && module.exports;
  const LEVELS = NODE ? require('./levels.js') : root.LEVELS;

  const MECHANICS = [
    { id: 'sleepwall', name: 'Двери', role: 'ядро',
      rule: 'Касание двери открывает или закрывает её; «Ждать» — пропуск хода. Затем через открытую дверь уходит единица тепла в соседнюю комнату, если та холоднее на 2 или больше; комната, где все двери закрыты, теряет 2 (до 0). Приведите тепло комнат в нужные пределы до прихода гостей.' },
    { id: 'sinfurnace', name: 'Печь', role: 'необратимый ход',
      rule: 'Касание печи — плюс 3 тепла её комнате (не больше 6). До перетекания комната с теплом 5 и больше сама, не остывая, даёт плюс 1 каждому соседу за открытой дверью.' },
    { id: 'rosa', name: 'Пар', role: 'закон мира',
      rule: 'В конце хода комната с теплом от 3 отдаёт всю воду паром самой холодной другой комнате, и закрытые двери не мешают (из равных — верхней, затем левой). Полейте паром цветы.' },
  ];

  const NAMES = { К: 'кухня', Г: 'гостиная', С: 'спальня', Ч: 'чулан', Ц: 'цветы', М: 'бельё', П: 'прихожая', Д: 'детская' };
  const COOLED = { Ч: 'остыл', Ц: 'остыли', М: 'остыло' };   // род для событий: «чулан остыл», «цветы остыли»
  const MAX = 6, HOT = 5, STEAM = 3;
  const on = (S, m) => !S.off.includes(m);
  const nm = r => NAMES[r] || r;

  // Разбор карты уровня: комнаты в порядке чтения (сверху вниз, слева направо) — этот же порядок решает ничьи пара.
  const cache = new Map();
  function plan(level) {
    if (cache.has(level)) return cache.get(level);
    const rooms = [], doors = [], at = (x, y) => (level.map[y] || '')[x] || ' ';
    level.map.forEach((row, y) => [...row].forEach((ch, x) => { if (x % 2 === 0 && y % 2 === 0 && ch !== ' ') rooms.push({ id: ch, x, y }); }));
    const idx = Object.fromEntries(rooms.map((r, i) => [r.id, i]));
    level.map.forEach((row, y) => [...row].forEach((ch, x) => {
      if (ch !== 'o' && ch !== 'x' || (x + y) % 2 === 0) return;
      const [a, b] = x % 2 ? [at(x - 1, y), at(x + 1, y)] : [at(x, y - 1), at(x, y + 1)];
      doors.push({ x, y, a: idx[a], b: idx[b], start: ch === 'o' });
    }));
    const P = { rooms, doors, w: level.map[0].length, h: level.map.length };
    cache.set(level, P);
    return P;
  }
  const doorName = (P, d) => `${nm(P.rooms[d.a].id)}–${nm(P.rooms[d.b].id)}`;

  function init(level, off = []) {
    const P = plan(level), fl = level.flowers;
    return { level, off, left: level.guests, events: [],
      heat: P.rooms.map(r => level.rooms[r.id][0]),
      open: P.doors.map(d => d.start),
      water: P.rooms.map(r => (off.includes('rosa') ? 0 : (level.water || {})[r.id] || 0)),
      got: 0, need: fl && !off.includes('rosa') ? fl[1] : 0 };
  }

  const fits = S => plan(S.level).rooms.every((r, i) => S.heat[i] >= S.level.rooms[r.id][1] && S.heat[i] <= S.level.rooms[r.id][2]);
  const won = S => fits(S) && S.got >= S.need;
  const over = S => won(S) || S.left <= 0;
  const stoveOn = S => on(S, 'sinfurnace') && S.level.stove !== undefined;

  // Ходы: двери по порядку карты, затем печь, затем «ждать». Имя двери — со словом «открыть» или «закрыть».
  const doorMove = (S, i) => `${S.open[i] ? 'закрыть' : 'открыть'} дверь ${doorName(plan(S.level), plan(S.level).doors[i])}`;
  function legal(S) {
    if (over(S)) return [];
    const out = S.open.map((o, i) => doorMove(S, i));
    if (stoveOn(S)) out.push('дрова');
    out.push('ждать');
    return out;
  }
  const flowersRoom = S => (on(S, 'rosa') && S.level.flowers ? S.level.flowers[0] : null);

  // Шаг мира без хода игрока: пункты 1–4 карточки. Возвращает новое тепло, воду, полив и события.
  function world(S, heat0, open) {
    const P = plan(S.level), n = P.rooms.length, ev = [], live = P.doors.filter((d, i) => open[i]);
    let heat = heat0.slice();
    if (on(S, 'sinfurnace')) {                                            // 1. жар: 5 и больше греет соседей за открытой дверью
      const add = new Array(n).fill(0), hot = new Set();
      for (const d of live) { if (heat[d.a] >= HOT) { add[d.b]++; hot.add(d.a); } if (heat[d.b] >= HOT) { add[d.a]++; hot.add(d.b); } }
      heat = heat.map((h, i) => Math.min(MAX, h + add[i]));
      for (const i of hot) ev.push(`Жар: ${nm(P.rooms[i].id)} греет соседей.`);
    }
    { const d2 = new Array(n).fill(0), moved = [];                       // 2. перетекание: разница 2 и больше — единица тепла
      for (const d of live) { const [hi, lo] = heat[d.a] >= heat[d.b] ? [d.a, d.b] : [d.b, d.a];
        if (heat[hi] - heat[lo] >= 2) { d2[hi]--; d2[lo]++; moved.push(`${nm(P.rooms[hi].id)} → ${nm(P.rooms[lo].id)}`); } }
      heat = heat.map((h, i) => Math.max(0, Math.min(MAX, h + d2[i])));
      if (moved.length) ev.push(`Тепло перетекло: ${moved.join(', ')}.`); }
    heat = heat.map((h, i) => {                                           // 3. выстывание: все двери закрыты — минус 2
      if (live.some(d => d.a === i || d.b === i) || h === 0) return h;
      const n = nm(P.rooms[i].id), lost = Math.min(2, h);
      ev.push(`${n[0].toUpperCase() + n.slice(1)} за закрытыми дверями ${COOLED[P.rooms[i].id] || 'остыла'} на ${lost}.`);
      return h - lost; });
    const water = S.water.slice(), steam = []; let got = S.got;                       // 4. пар: из комнаты с теплом 3+ вся вода — самой холодной другой
    if (on(S, 'rosa')) {
      const w0 = S.water.slice(), fr = flowersRoom(S);
      for (let i = 0; i < n; i++) {
        if (!w0[i] || heat[i] < STEAM) continue;
        let t = -1;
        for (let j = 0; j < n; j++) if (j !== i && (t < 0 || heat[j] < heat[t])) t = j;   // порядок чтения: из равных — верхняя, затем левая
        water[i] -= w0[i]; steam.push(t);
        if (P.rooms[t].id === fr) { got += w0[i]; ev.push(`Пар из комнаты «${nm(P.rooms[i].id)}» полил цветы.`); }
        else { water[t] += w0[i]; ev.push(`Пар из комнаты «${nm(P.rooms[i].id)}» осел в комнате «${nm(P.rooms[t].id)}».`); }
      }
    }
    return { heat, water, got, ev, steam };
  }

  // Ход игрока и шаг мира. Порядок — как в карточке: ход, 1 жар, 2 перетекание, 3 выстывание, 4 пар, 5 проверка.
  function apply(S, move) {
    const P = plan(S.level), heat = S.heat.slice(), open = S.open.slice(), ev = [];
    const d = S.open.findIndex((o, i) => doorMove(S, i) === move);
    if (d >= 0) { open[d] = !open[d]; ev.push(`Дверь ${doorName(P, P.doors[d])} ${open[d] ? 'открыта' : 'закрыта'}.`); }
    else if (move === 'дрова') { const k = P.rooms.findIndex(r => r.id === S.level.stove); heat[k] = Math.min(MAX, heat[k] + 3); ev.push(`Дрова: ${nm(S.level.stove)} +3 тепла.`); }
    const W = world(S, heat, open);
    const N = { ...S, heat: W.heat, open, water: W.water, got: W.got, events: ev.concat(W.ev) };
    if (!won(N)) N.left = S.left - 1;                                     // 5. проверка: победа, иначе ход до гостей минус один
    return N;
  }

  const key = S => [S.heat.join(''), S.open.map(Number).join(''), S.water.join(','), S.got, S.left].join('|');
  function why(S) {
    const P = plan(S.level), bad = P.rooms.filter((r, i) => S.heat[i] < S.level.rooms[r.id][1] || S.heat[i] > S.level.rooms[r.id][2]).map(r => nm(r.id));
    const parts = [];
    if (bad.length) parts.push(`тепло не в пределах: ${bad.join(', ')}`);
    if (S.got < S.need) parts.push(`цветы политы на ${S.got} из ${S.need}`);
    return `Гости пришли, а ${parts.join('; ')}.`;
  }

  // Прогноз «если ждать»: шаг мира при нынешних дверях. Его показывают поле и текстовая картинка.
  const forecast = S => world(S, S.heat, S.open);

  function render(S) {
    const P = plan(S.level), F = forecast(S), fr = flowersRoom(S);
    const grid = S.level.map.map((row, y) => [...row].map((ch, x) => {
      const d = P.doors.findIndex(q => q.x === x && q.y === y);
      if (d >= 0) return S.open[d] ? 'o' : 'x';
      return ch === ' ' ? '#' : ch;
    }).join(' '));
    const lines = P.rooms.map((r, i) => {
      const lim = S.level.rooms[r.id], f = F.heat[i], bits = [`тепло ${S.heat[i]}, нужно ${lim[1]}–${lim[2]}`];
      if (r.id === S.level.stove && stoveOn(S)) bits.push('печь');
      if (S.water[i]) bits.push(`вода ${S.water[i]}`);
      if (r.id === fr) bits.push(`цветы политы ${S.got} из ${S.need}`);
      const dt = f - S.heat[i], mark = (dt ? ` (${dt > 0 ? '+' : '−'}${Math.abs(dt)})` : '') + (F.steam.includes(i) ? ', ☁️ сюда пар' : '');
      return `${r.id} ${nm(r.id)}: ${bits.join(', ')}` + (over(S) ? '' : `; если ждать — тепло ${f}${mark}`);
    });
    const steam = F.ev.filter(e => e.startsWith('Пар'));
    return grid.join('\n') + '\no открытая дверь  x закрытая дверь  # стена\n' + lines.join('\n') +
      (steam.length && !over(S) ? '\nесли ждать: ' + steam.join(' ') : '');
  }

  // Картинка для страницы. Комната — клетка 1,2×1,35, полоса двери или стены — 0,55. Число — тепло; справа
  // вверху — пределы; слева вверху — печь или цветы; слева внизу — вода или полив цветов; справа внизу —
  // сколько тепла прибавит или убавит шаг мира, если ждать, и облако, если туда уйдёт пар.
  const RW = 1.2, RH = 1.35, D = 0.55;
  const px = x => (x >> 1) * (RW + D) + (x % 2 ? RW : 0), py = y => (y >> 1) * (RH + D) + (y % 2 ? RH : 0);
  const sz = (x, y) => [x % 2 ? D : RW, y % 2 ? D : RH];
  function view(S) {
    const P = plan(S.level), F = forecast(S), fr = flowersRoom(S), items = [];
    // Мелкий знак: страница рисует его в углу предмета (5 % от края), поэтому коробка широкая — текст не переносится.
    const small = (x, y, glyph) => ({ x: x - 0.06, y: y - 0.015, w: 1.2, h: 0.3, glyph, corner: true });
    const width = g => [...g].reduce((a, c) => a + (c === '\u2060' || c === '\ufe0f' ? 0 : c.codePointAt(0) > 0x2100 ? 0.33 : c === '/' ? 0.1 : 0.17), 0);
    const right = (xr, y, glyph) => small(xr - width(glyph), y, glyph);
    const target = new Set(F.steam);
    for (let y = 0; y < P.h; y++) for (let x = 0; x < P.w; x++) {
      if (x % 2 === 0 && y % 2 === 0) continue;
      const d = P.doors.findIndex(q => q.x === x && q.y === y), [w, h] = sz(x, y);
      if (d < 0) { items.push({ x: px(x), y: py(y), w, h, tone: 'wall' }); continue; }
      items.push({ x: px(x), y: py(y), w, h, tone: S.open[d] ? 'go' : 'wall', move: doorMove(S, d) });
      if (!S.open[d]) items.push(small(px(x) + w / 2 - 0.16, py(y) + h / 2 - 0.16, '🚪'));
    }
    P.rooms.forEach((r, i) => {
      const lim = S.level.rooms[r.id], X = px(r.x), Y = py(r.y), t = S.heat[i];
      const ok = t >= lim[1] && t <= lim[2], stove = r.id === S.level.stove && stoveOn(S);
      items.push({ x: X, y: Y, w: RW, h: RH, glyph: String(t), tone: t >= HOT && on(S, 'sinfurnace') ? 'warn' : ok ? 'good' : undefined, move: stove ? 'дрова' : undefined });
      items.push({ x: X, y: Y, w: RW, h: 0.4, label: `${lim[1]}\u2060–\u2060${lim[2]}` });   // нужные пределы — плашкой вверху справа
      if (stove) items.push(small(X + 0.06, Y + 0.04, '🔥'));
      if (r.id === fr) { items.push(small(X + 0.06, Y + 0.04, '🌷')); items.push(small(X + 0.06, Y + RH - 0.36, `${S.got}/${S.need}`)); }
      if (S.water[i]) items.push(small(X + 0.06, Y + RH - 0.36, '💧\u2060' + S.water[i]));
      const dt = F.heat[i] - t, mark = (dt ? (dt > 0 ? '+' : '−') + '\u2060' + Math.abs(dt) : '') + (target.has(i) ? '\u2060☁️' : '');
      if (mark && !over(S)) items.push(right(X + RW - 0.06, Y + RH - 0.36, mark));
    });
    const hud = [{ label: S.left === 0 ? 'Гости' : 'Гости через', value: S.left === 0 ? 'пришли' : `${S.left} ${S.left === 1 ? 'ход' : S.left < 5 ? 'хода' : 'ходов'}`, tone: S.left <= 1 ? 'warn' : undefined }];
    if (!over(S)) hud.push({ label: 'Если ждать', value: '−1, +1 — тепло комнаты, ☁️ — сюда пар' });
    if (S.need) hud.push({ label: 'Цветы политы', value: `${S.got} из ${S.need}`, tone: S.got >= S.need ? 'good' : undefined });
    return { w: (P.w >> 1) * (RW + D) + RW, h: (P.h >> 1) * (RH + D) + RH, items, hud, buttons: [{ label: 'Ждать', move: 'ждать' }] };
  }

  const RULES = {
    NAME: 'Тёплый дом',
    QUESTION: 'Меняют ли жар печи и пар от белья решения о дверях, когда работают вместе?',
    MECHANICS, levels: LEVELS, init, legal, apply, won, over, key, render, view, why,
    moveName: m => m,          // ход — уже имя для человека: «открыть дверь кухня–гостиная», «дрова», «ждать»
    PASS: 'ждать',
  };
  if (NODE) module.exports = RULES; else root.RULES = RULES;
})(typeof self !== 'undefined' ? self : this);
