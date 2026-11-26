// «Штопка» — правила (pipeline-game, этап 3). Договор модуля — pipeline-game/kit/rules.js; закон — games/darning/game.md.
// Общая величина — слои шерсти в клетках шали. Ядро (moth): перелив по слою и моль; сгиб (fold) переносит все слои
// клетки через одну и оставляет залом; «Моль плодится» (brood) поднимает число метки рядом с молью и отпускает
// отлежавшуюся моль. Клетки названы как на доске: столбцы a…f слева направо, строки 1…6 сверху вниз.
// Уровень: grid — строки цифр (слои), moths — клетки молей, marks — { клетка: номер хода, после которого метка
// сработает }, limit — предел молей, turns — отсчёт ходов.
(function (root) {
  const NODE = typeof module !== 'undefined' && module.exports;
  const LEVELS = NODE ? require('./levels.js') : root.LEVELS;

  // Фразы rule — дословно из столбца «Правило для игрока» карточки.
  const MECHANICS = [
    { id: 'moth', name: 'Моль', role: 'ядро',
      rule: 'Перекладывайте по слою в соседнюю клетку, не превышая предел молей. Моль заводится в голой клетке и в клетке, где срабатывает метка с числом больше слоёв. Каждый ход моль ползёт, если может, в самую тонкую соседнюю тоньше 3, утягивая оттуда слой; при 3 слоях гибнет.' },
    { id: 'fold', name: 'Сгиб', role: 'необратимый ход',
      rule: 'Коснитесь клетки, потом клетки через одну по прямой (обе без моли): все слои первой лягут на вторую, первая опустеет, средняя получит залом. Сгиб через залом рвёт шаль.' },
    { id: 'brood', name: 'Моль плодится', role: 'закон мира',
      rule: 'У метки рядом с молью число на один больше. Моль, простоявшая без соседних молей два хода подряд, улетает; ход, в который она завелась, тоже считается.' },
  ];

  const KILL = 3, MARK = 2;                                   // моль гибнет при 3 слоях; число метки 2 (рядом с молью 3)
  const DIRS = [[0, 1], [0, -1], [-1, 0], [1, 0]];            // порядок из карточки: вниз, вверх, влево, вправо
  const on = (S, m) => MECHANICS.some(x => x.id === m) && !S.off.includes(m);
  const W = S => S.level.grid[0].length, H = S => S.level.grid.length;
  const cell = (x, y) => 'abcdef'[x] + (y + 1);
  const parse = c => ['abcdef'.indexOf(c[0]), +c.slice(1) - 1];
  const inside = (S, x, y) => x >= 0 && y >= 0 && x < W(S) && y < H(S);
  const L = (S, x, y) => S.layers[y * W(S) + x];
  const mothAt = (S, x, y) => S.moths.find(m => m.x === x && m.y === y);
  const near = (S, x, y) => DIRS.map(([dx, dy]) => [x + dx, y + dy]).filter(([a, b]) => inside(S, a, b));
  const lonely = (S, m) => !near(S, m.x, m.y).some(([a, b]) => mothAt(S, a, b));
  const moves = n => (n % 10 === 1 && n % 100 !== 11 ? 'ход' : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? 'хода' : 'ходов');
  const moveNo = S => S.level.turns - S.left + 1;              // номер хода, который сейчас будет сделан

  function init(level, off = []) {
    const layers = level.grid.flatMap(r => [...r].map(Number));
    const moths = (level.moths || []).map(c => { const [x, y] = parse(c); return { x, y, born: 0, rest: 0 }; });
    const marks = Object.entries(level.marks || {}).map(([c, t]) => { const [x, y] = parse(c); return { x, y, t }; });
    return { level, off, layers, moths, marks, creases: [], left: level.turns, lost: null, events: [] };
  }

  // Число метки сейчас: 2, а у метки рядом с молью 3 («Моль плодится»).
  const need = (S, k) => MARK + (on(S, 'brood') && near(S, k.x, k.y).some(([a, b]) => mothAt(S, a, b)) ? 1 : 0);

  // Ходы: из каждой клетки по строкам сверху вниз — переливы вниз, вверх, влево, вправо, затем сгибы в том же порядке.
  function legal(S) {
    if (S.lost || S.left <= 0) return [];
    const out = [];
    for (let y = 0; y < H(S); y++) for (let x = 0; x < W(S); x++) {
      if (L(S, x, y) > 0) for (const [dx, dy] of DIRS) if (inside(S, x + dx, y + dy)) out.push({ fx: x, fy: y, tx: x + dx, ty: y + dy, fold: false });
      if (!on(S, 'fold') || mothAt(S, x, y)) continue;
      for (const [dx, dy] of DIRS) { const tx = x + 2 * dx, ty = y + 2 * dy;
        if (inside(S, tx, ty) && !mothAt(S, tx, ty)) out.push({ fx: x, fy: y, tx, ty, fold: true }); }
    }
    return out;
  }
  const moveName = m => cell(m.fx, m.fy) + '→' + cell(m.tx, m.ty);
  const creased = (S, x, y) => S.creases.includes(cell(x, y));

  // Ход игрока и шаг мира в порядке карточки (пункты 0–6).
  function apply(S, m) {
    const N = { ...S, layers: [...S.layers], moths: S.moths.map(o => ({ ...o })), marks: S.marks.slice(), creases: S.creases.slice(), events: [] };
    const w = W(S), here = moveNo(S), ev = N.events;
    const name = (x, y) => cell(x, y);
    if (m.fold) {
      const mx = (m.fx + m.tx) / 2, my = (m.fy + m.ty) / 2;
      if (creased(S, mx, my)) {                                                                      // 0. разрыв
        N.lost = 'tear'; ev.push(`Сгиб через залом на ${name(mx, my)}: шаль порвалась.`); return N; }
      N.layers[m.ty * w + m.tx] += N.layers[m.fy * w + m.fx]; N.layers[m.fy * w + m.fx] = 0; N.creases.push(name(mx, my));
      ev.push(`Сгиб: слои ${name(m.fx, m.fy)} легли на ${name(m.tx, m.ty)}, на ${name(mx, my)} залом.`);
    } else {
      N.layers[m.fy * w + m.fx] -= 1; N.layers[m.ty * w + m.tx] += 1;
      ev.push(`Перелив: слой из ${name(m.fx, m.fy)} в ${name(m.tx, m.ty)}.`);
    }
    const Lx = (x, y) => N.layers[y * w + x];
    N.moths = N.moths.filter(o => { if (Lx(o.x, o.y) < KILL) return true;                           // 1. затык
      ev.push(`Моль в ${name(o.x, o.y)} погибла: там ${Lx(o.x, o.y)} слоя.`); return false; });
    const born = [];                                                                                   // 2. новые моли
    for (let y = 0; y < H(S); y++) for (let x = 0; x < w; x++) {
      const k = N.marks.find(o => o.x === x && o.y === y && o.t === here), c = name(x, y);
      if (mothAt(N, x, y)) { if (k) ev.push(`Метка ${c} исчезла: в клетке уже сидит моль.`); continue; }
      if (Lx(x, y) === 0) { born.push({ x, y, born: here, rest: 0 });
        ev.push(k ? `Метка ${c} сработала на голой клетке — завелась моль.` : `Моль завелась в голой клетке ${c}.`); }
      else if (k && Lx(x, y) < need(N, k)) { born.push({ x, y, born: here, rest: 0 }); ev.push(`Метка ${c} сработала: нужно ${need(N, k)}, было ${Lx(x, y)} — завелась моль.`); }
      else if (k) ev.push(`Метка ${c} сработала: нужно ${need(N, k)}, есть ${Lx(x, y)} — моли нет.`);
    }
    N.marks = N.marks.filter(o => o.t !== here);
    N.moths = N.moths.concat(born);
    const order = N.moths.slice().sort((a, b) => a.born - b.born || a.y - b.y || a.x - b.x);       // 3. моли ползут
    const moved = new Set();
    for (const o of order) {
      const to = step(N, o);
      if (!to) continue;
      const [tx, ty] = to, took = Lx(tx, ty) > 0;
      if (took) { N.layers[ty * w + tx] -= 1; N.layers[o.y * w + o.x] += 1; }
      ev.push((o.born === here ? `Новая моль из ${name(o.x, o.y)} сразу переползла` : `Моль из ${name(o.x, o.y)} переползла`) + ` в ${name(tx, ty)}`
        + (took ? ` и утянула оттуда слой в ${name(o.x, o.y)}.` : '.'));
      o.x = tx; o.y = ty; moved.add(o);
    }
    if (on(S, 'brood')) {                                                                             // 4. отдых
      for (const o of N.moths) { o.rest = !moved.has(o) && lonely(N, o) ? o.rest + 1 : 0;
        if (o.born === here && o.rest === 1) ev.push(`Новая моль в ${name(o.x, o.y)} не поползла: ход, когда она завелась, засчитан в отдых (1 из 2).`); }
      const gone = N.moths.filter(o => o.rest >= 2);
      gone.forEach(o => ev.push(`Моль в ${name(o.x, o.y)} отлежалась два хода и улетела.`));
      N.moths = N.moths.filter(o => o.rest < 2);
    }
    if (N.moths.length > S.level.limit) {                                                              // 5. провал
      N.lost = 'moths'; ev.push(`Молей ${N.moths.length} — больше предела ${S.level.limit}.`); return N; }
    N.left = S.left - 1;                                                                              // 6. отсчёт
    if (N.left <= 0) ev.push(`Отсчёт кончился, молей ${N.moths.length} из ${S.level.limit} — шаль сбережена: моли на поле победе не мешают, важен только предел.`);
    return N;
  }

  // Куда моль поползёт сейчас: соседняя клетка тоньше 3 без моли, самая тонкая; из равных — вниз, вверх, влево, вправо.
  function step(S, o) {
    let best = null;
    for (const [x, y] of near(S, o.x, o.y)) { const v = L(S, x, y);
      if (v < KILL && !mothAt(S, x, y) && (best === null || v < L(S, best[0], best[1]))) best = [x, y]; }
    return best;
  }

  const won = S => !S.lost && S.left <= 0;
  const over = S => won(S) || !!S.lost || legal(S).length === 0;
  const key = S => {
    const ages = [...new Set(S.moths.map(o => o.born))].sort((a, b) => a - b);
    return [S.left, S.layers.join(''), S.moths.map(o => `${ages.indexOf(o.born)}${cell(o.x, o.y)}${o.rest}`).sort().join(','), S.creases.slice().sort().join(',')].join('|');
  };
  const why = S => (S.lost === 'tear' ? 'Шаль порвалась: второй сгиб прошёл через старый залом.'
    : `Молей стало больше предела (${S.level.limit}): шаль не уберечь.`);

  // ---------------------------------------------------------------- картинка
  // Где после ближайшего хода заведётся моль, если эти клетки не тронуть: голые и недокормленные метки этого хода.
  function spawns(S) {
    const out = [], no = moveNo(S);
    for (let y = 0; y < H(S); y++) for (let x = 0; x < W(S); x++) { if (mothAt(S, x, y)) continue;
      const k = S.marks.find(q => q.x === x && q.y === y && q.t === no);
      if (L(S, x, y) === 0) out.push([x, y, 'голая']);
      else if (k && L(S, x, y) < need(S, k)) { const d = need(S, k) - L(S, x, y); out.push([x, y, `метке не хватит ${d} ${d === 1 ? 'слоя' : 'слоёв'}`]); } }
    return out;
  }

  // Что будет, если моль сейчас не тронуть: куда она ползёт; число метки; что заведёт моль после ближайшего хода.
  function render(S) {
    const rows = [], w = W(S);
    rows.push('  ' + [...Array(w)].map((_, x) => ' ' + 'abcdef'[x] + '   ').join('').trimEnd());
    for (let y = 0; y < H(S); y++) {
      let r = String(y + 1) + ' ';
      for (let x = 0; x < w; x++) {
        const o = mothAt(S, x, y), k = S.marks.find(q => q.x === x && q.y === y);
        r += ' ' + L(S, x, y) + (o ? 'м' : ' ') + (k ? '*' : ' ') + (creased(S, x, y) ? 'з' : ' ');
      }
      rows.push(r.trimEnd());
    }
    const notes = ['число — слои; м — моль; * — метка; з — залом'];
    for (const k of S.marks) notes.push(`метка ${cell(k.x, k.y)}: число ${need(S, k)}, сработает после хода ${k.t} (через ${k.t - moveNo(S) + 1})`);
    for (const o of S.moths) { const to = step(S, o);
      notes.push(`моль ${cell(o.x, o.y)}: ` + (to ? `ползёт в ${cell(to[0], to[1])}` : 'стоит') + (on(S, 'brood') ? `, отдых ${o.rest} из 2` : '')); }
    for (const [x, y, why] of spawns(S)) { const to = step(S, { x, y });
      notes.push(`${cell(x, y)}: ${why} — если клетку не тронуть, после хода заведётся моль и в тот же ход ` + (to ? `поползёт в ${cell(to[0], to[1])}` : 'останется на месте')); }
    notes.push(`победа — когда отсчёт дойдёт до нуля, а молей не больше ${S.level.limit}`);
    if (S.creases.length) notes.push('заломы: ' + S.creases.join(', ') + ' — сгиб через них рвёт шаль');
    return rows.join('\n') + '\n' + notes.join('\n');
  }

  // Картинка для страницы. Число в клетке — слои. 🦋 — моль, стрелка от неё — куда поползёт (пунктирная — моль, которая
  // заведётся после ближайшего хода и сразу поползёт), 💤 — отлежит ещё ход и улетит.
  // 🎯 с числом — метка и сколько слоёв ей нужно, ⏳ — через сколько ходов сработает. Пунктир — залом.
  // Выбор: касание клетки выделяет её; цели подписаны: +1 (перелив), +N (сгиб), «рвёт» (сгиб через залом);
  // на выбранном лоскуте — «0🦋»: после сгиба он опустеет и заведёт моль.
  function view(S, sel) {
    const items = [], lines = [], go = legal(S), w = W(S), h = H(S), nowNo = moveNo(S);
    const pick = sel === null || sel === undefined ? null : sel;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const c = cell(x, y), v = L(S, x, y), o = mothAt(S, x, y), k = S.marks.find(q => q.x === x && q.y === y);
      const it = { x, y, glyph: String(v) };
      const bare = v === 0 && !o, hit = k && !o && k.t === nowNo && v < need(S, k);
      if (bare || hit) it.tone = 'warn';
      if (pick === null) { if (go.some(m => cell(m.fx, m.fy) === c)) it.select = c; }
      else if (pick === c) it.select = c;
      else {
        const m = go.find(q => cell(q.fx, q.fy) === pick && q.tx === x && q.ty === y);
        if (m) { it.move = m; const tear = m.fold && creased(S, (m.fx + m.tx) / 2, (m.fy + m.ty) / 2);
          it.tone = tear ? 'warn' : 'go'; it.label = tear ? 'рвёт' : `+${m.fold ? L(S, m.fx, m.fy) : 1}`; }
        else if (go.some(q => cell(q.fx, q.fy) === c)) it.select = c;
      }
      if (pick === c && go.some(q => q.fold && cell(q.fx, q.fy) === c)) it.label = '0🦋';                // при сгибе лоскут опустеет и заведёт моль
      if (!it.label && bare) it.label = '🦋';
      if (!it.label && k && !o) it.label = `⏳${k.t - nowNo + 1}`;                       // через сколько ходов сработает метка
      items.push(it);
      if (k) items.push({ x, y, w: 0.6, h: 0.4, glyph: `🎯${need(S, k)}`, corner: true });   // метка и её число
      if (o) items.push({ x: x + 0.62, y, w: 0.38, h: 0.4, glyph: '🦋', corner: true });       // моль
      if (o && on(S, 'brood') && o.rest >= 1 && !step(S, o) && lonely(S, o))                  // отлежит ещё ход и улетит
        items.push({ x, y: y + 0.62, w: 0.38, h: 0.38, glyph: '💤', corner: true });
      if (creased(S, x, y)) lines.push({ x1: x - 0.42, y1: y + 0.42, x2: x + 0.42, y2: y - 0.42, dash: true });
    }
    for (let x = 1; x < w; x++) lines.push({ x1: x - 0.5, y1: -0.5, x2: x - 0.5, y2: h - 0.5, tone: 'dim' });
    for (let y = 1; y < h; y++) lines.push({ x1: -0.5, y1: y - 0.5, x2: w - 0.5, y2: y - 0.5, tone: 'dim' });
    const arrow = (o, to, dash) => { const dx = to[0] - o.x, dy = to[1] - o.y, ex = o.x + dx * 0.7, ey = o.y + dy * 0.7;
      lines.push({ x1: o.x + dx * 0.15, y1: o.y + dy * 0.15, x2: ex, y2: ey, tone: 'warn', dash });
      lines.push({ x1: ex, y1: ey, x2: ex - dx * 0.15 + dy * 0.12, y2: ey - dy * 0.15 + dx * 0.12, tone: 'warn' });
      lines.push({ x1: ex, y1: ey, x2: ex - dx * 0.15 - dy * 0.12, y2: ey - dy * 0.15 - dx * 0.12, tone: 'warn' }); };
    for (const o of S.moths) { const to = step(S, o); if (to) arrow(o, to, false); }          // куда моль поползёт
    for (const [x, y] of spawns(S)) { const to = step(S, { x, y }); if (to) arrow({ x, y }, to, true); }   // пунктир: моль заведётся и сразу поползёт
    const n = S.moths.length, lim = S.level.limit;
    return { w, h, items, lines,
      hud: [{ label: 'Продержитесь', value: `${S.left} ${moves(S.left)}`, tone: S.left <= 1 ? 'warn' : undefined },
            { label: 'Моли', value: `${n} из ${lim}, больше нельзя`, tone: n >= lim ? 'warn' : undefined }] };
  }

  const RULES = {
    NAME: 'Штопка',
    QUESTION: 'Выбирают ли игроки между «заткнуть моль», «запереть её и переждать» и «отдать метку сгибом» или проходят уровни, доливая слои в ближайшую метку?',
    MECHANICS, levels: LEVELS, init, legal, apply, won, over, key, render, view, why, moveName,
  };
  if (NODE) module.exports = RULES; else root.RULES = RULES;
})(typeof self !== 'undefined' ? self : this);
