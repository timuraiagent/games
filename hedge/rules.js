// «Живая изгородь» — правила (pipeline-game, этап 3). Договор модуля — pipeline-game/kit/rules.js.
// Карточка игры — games/hedge/game.md: мир, шаг мира и фразы правил взяты оттуда.
// Общая величина — занятость клетки: свободна, ветка, иней (1 или 2 слоя). Рост её тратит, срез освобождает,
// сгон переносит иней, подпор занимает лишние клетки.
// Знаки карты уровня (как в схемах карточки): . земля, b чистая грядка, x и X — грядка под инеем в 1 и 2 слоя,
// 1 и 2 — иней на земле, o — ветка, v > < ^ — кончик побега со стрелкой. Побег идёт от корня (за верхним краем)
// вниз по своему столбцу от ряда 1 до кончика; стрелка вбок — побег уже повернул в клетке кончика.
(function (root) {
  const NODE = typeof module !== 'undefined' && module.exports;
  const LEVELS = NODE ? require('./levels.js') : root.LEVELS;

  const MECHANICS = [
    { id: 'otpil', name: 'Живая изгородь', role: 'ядро',
      rule: 'Изгородь растёт сама: каждый ход побег тянется по стрелке, а упёршись, пропускает ход и поворачивает по часовой стрелке. Коснитесь ветки — всё за срезом засохнет, а из среза со следующего хода пойдут два побега поперёк ветки. Не пустите изгородь на грядки до вечера.' },
    { id: 'sgon', name: 'Иней', role: 'инструмент',
      rule: 'Коснитесь земли или грядки у инея — иней с соседних клеток сметётся на неё, не больше двух слоёв. Иней не пускает побеги, оттепель снимает слой, к вечеру грядки должны быть чистыми.' },
    { id: 'podpor', name: 'Подпор', role: 'закон мира',
      rule: 'Клетку роста каждого упёршегося побега самый длинный из выросших за ход прибавляет себе по стрелке, пока впереди свободно (край поля — занято). Если не вырос никто, прибавка пропадает.' },
  ];

  const D = { N: [0, -1], E: [1, 0], S: [0, 1], W: [-1, 0] };
  const CW = { N: 'E', E: 'S', S: 'W', W: 'N' }, ACROSS = { N: ['W', 'E'], S: ['W', 'E'], E: ['N', 'S'], W: ['N', 'S'] };
  const DORD = { N: 0, E: 1, S: 2, W: 3 }, ARROW = { N: '↑', E: '→', S: '↓', W: '←' }, ASCII = { N: '^', E: '>', S: 'v', W: '<' };
  const WORD = { N: 'вверх', E: 'вправо', S: 'вниз', W: 'влево' };
  const FROM_CH = { v: 'S', '>': 'E', '<': 'W', '^': 'N' };
  const on = (S, m) => !S.off.includes(m);
  const k = (x, y) => x + ',' + y, xy = s => s.split(',').map(Number);
  const nm = s => { const [x, y] = xy(s); return 'ABCDEF'[x] + (y + 1); };                 // A1 — столбец буквой, ряд числом
  const size = lv => [lv.map[0].length, lv.map.length];
  const inside = (S, x, y) => { const [w, h] = size(S.level); return x >= 0 && y >= 0 && x < w && y < h; };
  const byCell = (a, b) => { const [ax, ay] = xy(a), [bx, by] = xy(b); return ay - by || ax - bx; };
  const byTip = (a, b) => byCell(a.c, b.c) || DORD[a.d] - DORD[b.d];
  const nb = (S, c) => { const [x, y] = xy(c); return Object.values(D).map(([dx, dy]) => [x + dx, y + dy]).filter(([a, b]) => inside(S, a, b)).map(([a, b]) => k(a, b)); };
  const beds = lv => { const out = []; lv.map.forEach((row, y) => [...row].forEach((ch, x) => { if ('bxX'.includes(ch)) out.push(k(x, y)); })); return out; };
  const isBed = (S, c) => S.beds.includes(c);
  const layers = n => (n === 1 ? '1 слой' : n + ' слоя');
  const moves = n => n + ' ' + (n % 10 === 1 && n % 100 !== 11 ? 'ход' : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 'хода' : 'ходов');

  // Начальное состояние. Выключенный иней (sgon) — его клетки становятся пустым местом, грядки чистыми.
  function init(level, off = []) {
    const hedge = {}, tips = [], frost = {};
    level.map.forEach((row, y) => [...row].forEach((ch, x) => {
      const n = { 1: 1, 2: 2, x: 1, X: 2 }[ch];
      if (n && !off.includes('sgon')) frost[k(x, y)] = n;
      if (FROM_CH[ch]) {                                   // кончик: побег — столбец от ряда 1 до него
        for (let j = 0; j <= y; j++) hedge[k(x, j)] = { p: j ? k(x, j - 1) : null, a: 'S' };
        tips.push({ c: k(x, y), d: FROM_CH[ch], len: y + 1 });
      }
    }));
    return { level, off, t: 0, hedge, tips, frost, beds: beds(level), lost: null, events: [] };
  }

  const what = (S, c) => { const [x, y] = xy(c); return !inside(S, x, y) ? 'край поля' : S.hedge[c] ? 'ветку' : 'иней'; };   // во что упёрся
  const free = (S, c) => { const [x, y] = xy(c); return inside(S, x, y) && !S.hedge[c] && !(S.frost[c] > 0); };
  const ahead = (S, t) => { const [x, y] = xy(t.c); return k(x + D[t.d][0], y + D[t.d][1]); };
  const won = S => !S.lost && S.t >= S.level.steps;
  const sweepFrom = (S, c) => nb(S, c).filter(q => S.frost[q] > 0);
  const sweepTotal = (S, c) => (S.frost[c] || 0) + sweepFrom(S, c).reduce((a, q) => a + S.frost[q], 0);
  const canSweep = (S, c) => on(S, 'sgon') && !S.hedge[c] && sweepFrom(S, c).length > 0 && sweepTotal(S, c) <= 2;

  // Ходы: срез любой клетки ветки, сгон на клетку без ветки у инея, «ждать». Порядок — по клеткам, затем «ждать».
  function legal(S) {
    if (S.lost || S.t >= S.level.steps) return [];
    const out = Object.keys(S.hedge).sort(byCell).map(c => 'срез ' + nm(c));
    const [w, h] = size(S.level);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (canSweep(S, k(x, y))) out.push('сгон на ' + nm(k(x, y)));
    return out.concat('ждать');
  }
  // Ход — его имя для человека: оболочка ищет строковый ход по имени (moveName), поэтому они совпадают.
  const moveName = m => m;
  const cellOf = s => k('ABCDEF'.indexOf(s[0]), +s.slice(1) - 1);

  // Пункты 1–2 шага мира на копии состояния: рост и подпор. Возвращает, что случилось, — им же пользуется
  // view, чтобы до хода показать последствия ожидания.
  function growPhase(N) {
    const out = { grew: [], from: new Map(), at1: new Map(), blocked: [], extra: null, lost: null };
    const grow = t => { const q = ahead(N, t);
      if (!free(N, q)) return false;
      N.hedge[q] = { p: t.c, a: t.d }; t.c = q; t.len += 1;
      if (isBed(N, q)) out.lost = q;
      return true; };
    N.tips.sort(byTip);                                                   // 1. рост: сверху вниз, слева направо, ↑→↓←
    for (const t of N.tips) {
      const from = t.c;
      if (grow(t)) { out.grew.push(t); out.from.set(t, from); out.at1.set(t, t.c); if (out.lost) return out; }
      else { out.blocked.push({ t, from, was: t.d, why: what(N, ahead(N, t)) }); t.d = CW[t.d]; }
    }
    const kk = out.blocked.length;                                          // 2. подпор
    if (on(N, 'podpor') && kk > 0) {
      if (!out.grew.length) { out.extra = { k: kk, got: 0, none: true }; return out; }
      const r = out.grew.slice().sort((a, b) => b.len - a.len || byCell(a.c, b.c))[0];
      out.extra = { k: kk, t: r, got: 0, cells: [], len: r.len, tie: out.grew.some(t => t !== r && t.len === r.len), stop: null };
      for (let i = 0; i < kk; i++) { if (!grow(r)) { out.extra.stop = what(N, ahead(N, r)); break; } out.extra.got += 1; out.extra.cells.push(r.c); if (out.lost) return out; }
    }
    return out;
  }
  const copy = S => ({ ...S, hedge: { ...S.hedge }, tips: S.tips.map(t => ({ ...t })), frost: { ...S.frost }, events: [] });
  const dead = (S, c) => { const out = new Set([c]); let more = true;      // все клетки дальше от корня, чем c
    while (more) { more = false; for (const [q, h] of Object.entries(S.hedge)) if (!out.has(q) && h.p && out.has(h.p)) { out.add(q); more = true; } }
    out.delete(c); return out; };

  function apply(S, move) {
    const N = copy(S), E = N.events, kind = move === 'ждать' ? 'wait' : move.startsWith('срез') ? 'cut' : 'sweep', arg = kind === 'wait' ? null : cellOf(move.split(' ').pop());
    N.t = S.t + 1;
    let fresh = [];
    if (kind === 'cut') {                                                   // ход: срез
      const gone = dead(N, arg);
      gone.forEach(q => delete N.hedge[q]);
      N.tips = N.tips.filter(t => !gone.has(t.c) && t.c !== arg);
      fresh = ACROSS[N.hedge[arg].a].map(d => ({ c: arg, d, len: 0 }));
      E.push(`Срез ${nm(arg)}: ` + (gone.size ? `засохло веток — ${gone.size}` : 'засохших веток нет') + `; из ${nm(arg)} пойдут побеги ${fresh.map(t => WORD[t.d]).join(' и ')}.`);
    } else if (kind === 'sweep') {                                          // ход: сгон
      const src = sweepFrom(N, arg), add = src.reduce((a, q) => a + N.frost[q], 0);
      src.forEach(q => delete N.frost[q]);
      N.frost[arg] = (N.frost[arg] || 0) + add;
      E.push(`Иней сметён ${src.length > 1 ? 'с ' + src.map(nm).join(' и ') + ' ' : ''}на ${isBed(N, arg) ? 'грядку ' : ''}${nm(arg)}: там ${layers(N.frost[arg])}.`);
    }
    const g = growPhase(N);                                                 // 1–2. рост и подпор
    if (g.grew.length) E.push('Рост: ' + g.grew.map(t => nm(g.from.get(t)) + '→' + nm(g.at1.get(t))).join(', ') + '.');
    for (const b of g.blocked) E.push(`Побег ${nm(b.from)} упёрся в ${b.why} и повернул ${WORD[b.t.d]}.`);
    if (g.extra) E.push(g.extra.none ? `Подпор: упёрлись ${g.extra.k}, но никто не вырос — прибавка пропала.` : extraText(g, nm(g.from.get(g.extra.t)), 'past'));
    if (g.lost) { N.lost = { bed: g.lost }; E.push(`Изгородь вошла на грядку ${nm(g.lost)}.`); return N; }
    if (fresh.length) N.tips.push(...fresh);                                // 3. новые побеги из среза
    if ((N.level.thaw || []).includes(N.t) && on(N, 'sgon') && Object.keys(N.frost).length) {   // 4. оттепель
      for (const q of Object.keys(N.frost)) { N.frost[q] -= 1; if (N.frost[q] <= 0) delete N.frost[q]; }
      E.push('Оттепель: иней потерял слой.');
    }
    if (N.t >= N.level.steps) {                                             // 5. вечер
      const iced = N.beds.filter(c => N.frost[c] > 0);
      if (iced.length) { N.lost = { frost: iced }; E.push(`Вечер: на грядке ${iced.map(nm).join(' и ')} иней.`); }
      else E.push('Вечер: грядки чистые.');
    }
    return N;
  }

  const over = S => !!S.lost || S.t >= S.level.steps;
  const key = S => [S.t, Object.entries(S.hedge).map(([q, h]) => q + '<' + h.p + h.a).sort().join(';'),
    S.tips.slice().sort(byTip).map(t => t.c + t.d + t.len).join(';'), Object.entries(S.frost).sort().map(e => e.join('=')).join(';'), S.lost ? 'L' : ''].join('|');
  const why = S => (S.lost && S.lost.bed ? `Изгородь вошла на грядку ${nm(S.lost.bed)}.`
    : S.lost && S.lost.frost ? `Наступил вечер, а на грядке ${S.lost.frost.map(nm).join(' и ')} иней.` : 'Ходов больше нет.');

  // Что будет, если ждать: рост, упёршиеся, прибавка. Только для показа, правила не меняет.
  function forecast(S) {
    if (over(S)) return null;
    const N = copy(S), before = new Map(N.tips.map(t => [t, t.c])), g = growPhase(N);
    return { g, before };
  }
  const thawText = S => { const left = (S.level.thaw || []).filter(n => n > S.t); return left.length ? `через ${moves(left[0] - S.t)}: снимет слой инея` : 'больше не будет'; };
  // Прибавка словами: кто её получает и почему, сколько клеток вышло и что её оборвало. when — 'past' или 'next'.
  function extraText(g, from, when) {
    const ex = g.extra, past = when === 'past', who = `побег ${from} — самый длинный из выросших (длина ${ex.len})` + (ex.tie ? ', из равных верхний, затем левый' : '');
    const head = 'Подпор: ' + (ex.k === 1 ? `${past ? 'упёрся' : 'упрётся'} один побег — его клетку` : `${past ? 'упёрлись' : 'упрутся'} ${ex.k} — их ${ex.k} клетки`)
      + ` роста ${past ? 'получил' : 'получит'} ${who}`;
    if (!ex.got) return head + `; но впереди ${ex.stop}, прибавка ${past ? 'пропала' : 'пропадёт'}.`;
    return head + `: +${ex.got}, до ${nm(ex.t.c)}` + (g.lost === ex.t.c ? ' — на грядку!' : ex.stop ? `; остальное ${past ? 'пропало' : 'пропадёт'}: впереди ${ex.stop}.` : '.');
  }

  // Текстовая картинка: поле знаками карточки с буквами столбцов и номерами рядов, легенда и прогноз ожидания.
  const NAMES = { '.': 'земля', b: 'чистая грядка', x: 'грядка под инеем в 1 слой', X: 'грядка под инеем в 2 слоя', 1: 'иней в 1 слой на земле',
    2: 'иней в 2 слоя на земле', o: 'ветка', v: 'кончик побега, растёт вниз', '>': 'кончик, растёт вправо', '<': 'кончик, растёт влево',
    '^': 'кончик, растёт вверх', '*': 'клетка среза: из неё пойдут два новых побега' };
  function render(S) {
    const [w, h] = size(S.level), rows = [], seen = new Set();
    for (let y = 0; y < h; y++) { let row = '';
      for (let x = 0; x < w; x++) { const c = k(x, y), f = S.frost[c] || 0, ts = S.tips.filter(t => t.c === c);
        let ch = isBed(S, c) ? ['b', 'x', 'X'][f] : f ? String(f) : '.';
        if (S.hedge[c]) ch = ts.length > 1 ? '*' : ts.length ? ASCII[ts[0].d] : 'o';
        seen.add(ch); row += ch; }
      rows.push((y + 1) + ' ' + row); }
    const out = ['  ' + 'ABCDEF'.slice(0, w) + '   корень изгороди — над рядом 1', ...rows,
      'Знаки: ' + [...seen].map(c => `${c} ${NAMES[c]}`).join('; ') + '.'];
    const tips = S.tips.slice().sort(byTip);
    if (tips.length) out.push('Побеги: ' + tips.map(t => `${nm(t.c)} ${WORD[t.d]}, длина ${t.len}`).join('; ') + '.');
    const fc = forecast(S);
    if (fc) { const { g } = fc, parts = [];
      for (const t of g.grew) parts.push(`${nm(fc.before.get(t))} вырастет в ${nm(g.at1.get(t))}` + (g.lost === g.at1.get(t) ? ' — на грядку!' : ''));
      const many = c => S.tips.filter(t => t.c === c).length > 1;
      for (const b of g.blocked) parts.push(`${nm(b.from)}${many(b.from) ? ' (' + WORD[b.was] + ')' : ''} упрётся в ${b.why} и повернёт ${WORD[b.t.d]}`);
      if (g.extra && g.extra.none) parts.push(`прибавка ${g.extra.k} пропадёт: никто не вырастет`);
      if (!g.lost && g.grew.length === 0 && g.blocked.length === 0) parts.push('расти нечему');
      out.push('Если ждать: ' + parts.join('; ') + '.');
      if (g.extra && !g.extra.none) out.push('Если ждать, ' + extraText(g, nm(fc.before.get(g.extra.t)), 'next').replace(/^П/, 'п') + (g.extra.got ? ` На поле — метка «+${g.extra.got}» у ${nm(fc.before.get(g.extra.t))}.` : ''));
    }
    const no = blockedSweeps(S);
    if (no.length) out.push('Сгон невозможен: ' + no.map(([c, n]) => `на ${nm(c)} вышло бы ${n} слоя`).join('; ') + ' — больше двух слоёв не бывает.');
    return out.join('\n');
  }
  // Клетки у инея, куда смести нельзя: вышло бы больше двух слоёв.
  const blockedSweeps = S => { if (!on(S, 'sgon') || over(S)) return []; const [w, h] = size(S.level), out = [];
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const c = k(x, y);
      if (!S.hedge[c] && sweepFrom(S, c).length && sweepTotal(S, c) > 2) out.push([c, sweepTotal(S, c)]); }
    return out; };

  // Картинка для страницы. Ветки — линии от корня; кончик — стрелка. Прогноз ожидания: пунктир туда, куда
  // вырастет побег (красный — на грядку), «↻» у побега, который упрётся, «+k» у того, кто получит прибавку.
  // На клетке, куда можно смести иней, подпись — сколько слоёв там станет.
  function view(S) {
    const [w, h] = size(S.level), items = [], lines = [], fc = forecast(S), live = !over(S);
    const mark = {}, label = {};
    if (fc) { const { g, before } = fc;
      for (const t of g.grew) { let [px, py] = xy(before.get(t)); const path = [g.at1.get(t)].concat(g.extra && g.extra.t === t ? g.extra.cells : []);
        for (const c of path) { const [x, y] = xy(c); lines.push({ x1: px, y1: py, x2: x, y2: y, dash: true, tone: isBed(S, c) ? 'warn' : undefined }); [px, py] = [x, y];
          if (isBed(S, c) && !(S.frost[c] > 0)) mark[c] = 'warn'; } }
      for (const b of g.blocked) label[b.from] = (label[b.from] || '') + '↻';
      if (g.extra && g.extra.t && g.extra.got) label[before.get(g.extra.t)] = '+' + g.extra.got; }
    for (const [q, hh] of Object.entries(S.hedge)) { const [x, y] = xy(q), [px, py] = hh.p ? xy(hh.p) : [x, y - 1];
      lines.push({ x1: px, y1: py, x2: x, y2: y, tone: 'good' }); }
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const c = k(x, y), f = S.frost[c] || 0, ts = S.tips.filter(t => t.c === c).sort(byTip), bed = isBed(S, c);
      if (S.hedge[c]) {
        if (bed) items.push({ x, y, glyph: '🥬', corner: true, tone: 'warn' });          // изгородь вошла на грядку
        items.push({ x, y, glyph: ts.length ? ts.map(t => ARROW[t.d]).join('') : '🌿', label: label[c], move: live ? 'срез ' + nm(c) : undefined });
        continue; }
      const it = { x, y, glyph: '', tone: mark[c] };
      if (f) { it.glyph = '❄️'; it.label = String(f); }
      else if (bed) it.glyph = '🥬';
      if (f && bed) items.push({ x, y, glyph: '🥬', corner: true });
      if (live && on(S, 'sgon') && !canSweep(S, c) && sweepFrom(S, c).length) it.label = (f ? f + ' ' : '') + '✕';   // сюда смести нельзя: больше двух слоёв
      if (live && canSweep(S, c)) { it.move = 'сгон на ' + nm(c); it.tone = it.tone || 'go'; it.label = (f ? f : '') + '→❄' + sweepTotal(S, c); }
      items.push(it);
    }
    const g = fc && fc.g, risk = g && g.lost;
    const hud = [{ label: 'До вечера', value: moves(Math.max(0, S.level.steps - S.t)), tone: S.level.steps - S.t <= 1 ? 'warn' : undefined }];
    if (on(S, 'sgon')) {
      const iced = S.beds.filter(c => S.frost[c] > 0).length;
      if ((S.level.thaw || []).length) hud.push({ label: 'Оттепель', value: thawText(S) });
      hud.push({ label: 'Грядок под инеем', value: String(iced), tone: iced ? 'warn' : 'good' });
    }
    if (on(S, 'podpor') && g && g.blocked.length && !(g.lost && !g.extra)) hud.push({ label: 'Если ждать, упрутся', value: `${g.blocked.length} → ` + (g.extra && g.extra.got
      ? `+${g.extra.got} побегу ${nm(fc.before.get(g.extra.t))}` : 'прибавка пропадёт'), tone: g.extra && g.extra.got ? 'warn' : undefined });
    if (risk) hud.push({ label: 'Если ждать', value: 'изгородь на грядке ' + nm(g.lost), tone: 'warn' });
    return { w, h, items, lines, hud, buttons: live ? [{ label: 'Ждать', move: 'ждать' }] : [] };
  }

  const RULES = {
    NAME: 'Живая изгородь',
    QUESTION: 'Меняют ли иней и подпор то, где и когда срезать изгородь и куда сметать иней?',
    MECHANICS, levels: LEVELS, init, legal, apply, won, over, key, render, view, why, moveName,
    PASS: 'ждать',
  };
  if (NODE) module.exports = RULES; else root.RULES = RULES;
})(typeof self !== 'undefined' ? self : this);
