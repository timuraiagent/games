// ПРАВИЛА «Фитиля 2» (pipeline-game, этап 3). Договор модуля — pipeline-game/kit/rules.js; закон — карточка
// games/fuse-two/game.md, разделы «Мир» и «Механики». Один файл подключают и боты, и страница.
//
// Вы идёте по погребу, за вами по следу ползёт огонёк, отставая не больше чем на длину фитиля (узлы). Пол за
// огоньком прогорает, лампы рядом с ним загораются. Выйти можно только в освещённую дверь. Общая величина —
// свет: какие клетки освещены. Огонёк светит на свою клетку и соседей, горящая лампа — на две клетки по
// сторонам; стены и закрытые створки свет не пропускают, но закрытая створка, до которой он дошёл, освещена.
// Знаки карты: # стена, . пол, P старт, D дверь, L лампа (не горит), K лампа (горит с начала),
// b пустая створка, B шкафчик (створка, за ней лампа). Поля уровня: n — узлов в фитиле, clock — K, часы бьют
// после каждого K-го хода (нужно только уровням с ярлыками).
(function (root) {
  const NODE = typeof module !== 'undefined' && module.exports;
  const LEVELS = NODE ? require('./levels.js') : root.LEVELS;

  // Фразы rule — дословно из столбца «Правило для игрока» карточки.
  const MECHANICS = [
    { id: 'fuse', name: 'Фитиль', role: 'ядро',
      rule: 'Касайтесь соседней свободной клетки — вы шагаете туда. Вашим следом идёт огонёк, отставая не больше чем на длину фитиля: пол за ним прогорает, лампы рядом загораются. Выйдите в дверь, пока её освещает огонёк (соседние клетки) или горящая лампа (до двух клеток, не сквозь стены и створки).' },
    { id: 'acid', name: 'Ярлыки', role: 'закон мира',
      rule: 'Коснитесь лампы рядом — повесите на неё ярлык, снять его нельзя. С каждым боем часов лампы с ярлыком снимают: тёмную уносят, оставляя проход, а горящая гаснет навсегда и стоит столбом.' },
    { id: 'widen', name: 'Створки', role: 'необратимый ход',
      rule: 'Коснитесь закрытой створки рядом — она откроется: на её месте проход или лампа, и на свету эта лампа сразу загорится. Фитиль от этого навсегда станет на узел длиннее.' },
  ];

  const DIRS = { вверх: [0, -1], вниз: [0, 1], влево: [-1, 0], вправо: [1, 0] };
  const ARROW = { вверх: '↑', вниз: '↓', влево: '←', вправо: '→' };
  // Механика действует, если она есть в игре и не выключена на уровне.
  const on = (S, m) => MECHANICS.some(x => x.id === m) && !S.off.includes(m);
  const W = lv => lv.map[0].length, H = lv => lv.map.length;
  const xy = (lv, c) => [c % W(lv), Math.floor(c / W(lv))];
  const nbs = (lv, c) => { const [x, y] = xy(lv, c), out = [];
    for (const [d, [dx, dy]] of Object.entries(DIRS)) { const a = x + dx, b = y + dy;
      if (a >= 0 && b >= 0 && a < W(lv) && b < H(lv)) out.push([d, b * W(lv) + a]); }
    return out; };
  // Знак клетки сейчас: открытые створки, снятые лампы и столбы (X) лежат в S.cells поверх карты. Без
  // механики «Створки» створки — стены навсегда (карточка, «Игра без неё»).
  function cell(S, c) {
    if (S.cells[c] !== undefined) return S.cells[c];
    const [x, y] = xy(S.level, c), ch = S.level.map[y][x];
    return (ch === 'b' || ch === 'B') && !on(S, 'widen') ? '#' : ch;
  }
  const isLamp = ch => ch === 'L' || ch === 'K';
  const isShut = ch => ch === 'b' || ch === 'B';
  const hero = S => S.path[S.path.length - 1];
  const fire = S => S.path[S.f];
  const sorted = a => [...a].sort((p, q) => p - q);

  // Свет: огонёк — своя клетка и соседи; горящая лампа — до двух шагов по сторонам. Стена и закрытая створка
  // света не пропускают; створка, до которой он дошёл, освещена. Остальное (пол, провалы, след, лампы,
  // столбы, дверь) свет пропускает.
  function light(S) {
    const out = new Set();
    const spread = (src, r) => { const seen = new Set([src]); let fr = [src];
      for (let k = 0; k < r; k++) { const nx = [];
        for (const a of fr) for (const [, b] of nbs(S.level, a)) { const ch = cell(S, b);
          if (ch === '#' || seen.has(b)) continue; seen.add(b); if (!isShut(ch)) nx.push(b); }
        fr = nx; }
      seen.forEach(c => out.add(c)); };
    spread(fire(S), 1);
    S.lit.forEach(c => spread(c, 2));
    return sorted(out);
  }

  function init(level, off = []) {
    const lit = []; let start = 0;
    level.map.forEach((row, y) => [...row].forEach((ch, x) => { const c = y * row.length + x;
      if (ch === 'P') start = c; if (ch === 'K') lit.push(c); }));
    const S = { level, off, path: [start], f: 0, N: level.n, t: 0, cells: {}, lit, mark: [], won: false, events: [] };
    S.light = light(S);
    return S;
  }

  const won = S => S.won;
  // Допустимые ходы: шаг на свободную клетку или в освещённую дверь, открыть створку, ярлык на лампу.
  function legal(S) {
    if (S.won) return [];
    const out = [];
    for (const [d, c] of nbs(S.level, hero(S))) { const ch = cell(S, c);
      if (ch === 'D') { if (S.light.includes(c)) out.push(d); }
      else if (isShut(ch)) { if (on(S, 'widen')) out.push('открыть ' + d); }
      else if (isLamp(ch)) { if (on(S, 'acid') && !S.mark.includes(c)) out.push('ярлык ' + d); }
      else if ((ch === '.' || ch === 'P') && !S.path.includes(c)) out.push(d); }
    return out;
  }
  const target = (S, m) => nbs(S.level, hero(S)).find(([d]) => d === m.split(' ').pop())[1];
  // Бой часов после этого хода? Часы есть только там, где действуют ярлыки.
  const strikes = (S, t) => on(S, 'acid') && S.level.clock > 0 && t % S.level.clock === 0;
  const lampWord = n => (n === 1 ? 'лампа' : n < 5 ? 'лампы' : 'ламп');

  // Ход игрока и шаг мира — в порядке карточки (раздел 1, «Шаг мира»).
  function apply(S, move) {
    const c = target(S, move), kind = move.startsWith('открыть') ? 'open' : move.startsWith('ярлык') ? 'mark' : 'step';
    const N = { ...S, path: [...S.path], cells: { ...S.cells }, lit: [...S.lit], mark: [...S.mark], t: S.t + 1, events: [] };
    let opened = null;
    if (kind === 'step' && cell(S, c) === 'D') {                                   // шаг в освещённую дверь: победа сразу
      N.path.push(c); N.won = true; N.events.push('Вы вышли в освещённую дверь.'); return N; }
    if (kind === 'step') N.path.push(c);
    if (kind === 'open') {                                                         // ход: открыть створку, фитиль +1 узел
      const was = cell(S, c); N.cells[c] = was === 'B' ? 'L' : '.'; N.N = S.N + 1; if (was === 'B') opened = c;
      N.events.push((was === 'B' ? 'Шкафчик открыт: за створкой лампа.' : 'Створка открыта: там проход.') + ` Фитиль теперь ${plural(N.N, 'узел', 'узла', 'узлов')}: огонёк постоит ещё ход.`); }
    if (kind === 'mark') { N.mark = sorted(N.mark.concat(c)); N.events.push('Ярлык повешен на лампу. Ярлык — ход без шага: огонёк стоит.'); }   // ход: ярлык
    // 1. огонёк: после шага переходит по следу, если до вас больше шагов, чем узлов; покинутая клетка прогорает
    if (kind === 'step' && N.path.length - 1 - N.f > N.N) { N.f += 1; N.events.push('Огонёк сдвинулся по следу, пол за ним прогорел.'); }
    // 2. лампы: каждая лампа рядом с огоньком загорается; шкафчик, открытый на свету (свет до хода), — тоже
    const fresh = [];
    for (const [, a] of nbs(N.level, fire(N))) if (isLamp(cell(N, a)) && !N.lit.includes(a)) fresh.push(a);
    if (opened !== null && S.light.includes(opened) && !fresh.includes(opened)) fresh.push(opened);
    if (opened !== null && fresh.includes(opened)) N.events.push('Лампа из шкафчика сразу загорелась.');
    const byFire = fresh.filter(a => a !== opened);
    if (byFire.length) N.events.push(byFire.length === 1 ? 'Огонёк зажёг лампу рядом.' : `Огонёк зажёг ${byFire.length} ${lampWord(byFire.length)} рядом.`);
    N.lit = sorted(N.lit.concat(fresh));
    // 3. бой: каждую лампу с ярлыком снимают — тёмную уносят (проход), горящая гаснет навсегда столбом (X)
    if (strikes(N, N.t)) {
      if (!N.mark.length) N.events.push('Бьют часы. Ярлыков нет — ничего не случилось.');
      const gone = N.mark.filter(a => !N.lit.includes(a)), dead = N.mark.filter(a => N.lit.includes(a));
      gone.forEach(a => { N.cells[a] = '.'; });
      dead.forEach(a => { N.cells[a] = 'X'; });
      N.lit = N.lit.filter(a => !dead.includes(a)); N.mark = [];
      if (gone.length) N.events.push(`Бьют часы: ${gone.length === 1 ? 'тёмную лампу с ярлыком унесли' : 'тёмные лампы с ярлыком унесли'} — там проход.`);
      if (dead.length) N.events.push(`Бьют часы: ${dead.length === 1 ? 'горящая лампа с ярлыком погасла навсегда и стала столбом' : 'горящие лампы с ярлыком погасли навсегда и стали столбами'}.`);
      N.events.push(`Следующий бой — через ${plural(N.level.clock, 'ход', 'хода', 'ходов')}.`);
    }
    // 4. свет пересчитывается
    N.light = light(N);
    const door = doorCell(N), was = S.light.includes(door), now = N.light.includes(door);
    if (now && !was) N.events.push('Дверь освещена — в неё можно выйти.');
    if (was && !now) N.events.push('Дверь больше не освещена.');
    // 5. проверка: нет ни шага, ни створки, ни ярлыка — тупик (over)
    return N;
  }
  const doorCell = S => { const w = W(S.level); let d = -1;
    S.level.map.forEach((row, y) => { const x = row.indexOf('D'); if (x >= 0) d = y * w + x; }); return d; };

  const over = S => S.won || legal(S).length === 0;
  // В ключ: вы, провалы, огонёк со шнуром по порядку, узлы, изменённые клетки, горящие лампы, ярлыки, ход
  // по модулю K (если часы действуют).
  const key = S => [sorted(S.path.slice(0, S.f)).join(','), S.path.slice(S.f).join(','), S.N,
    Object.keys(S.cells).map(Number).sort((a, b) => a - b).map(c => c + S.cells[c]).join(','), S.lit.join(','), S.mark.join(','),
    on(S, 'acid') && S.level.clock > 0 ? S.t % S.level.clock : 0, S.won ? 'w' : ''].join('|');

  function why(S) {
    const door = S.light.includes(doorCell(S)) ? 'дверь освещена, но до неё не дойти' : 'дверь тёмная';
    return `Тупик: шагнуть некуда, ${on(S, 'widen') ? 'открыть нечего, ' : ''}${on(S, 'acid') ? 'ярлык повесить не на что, ' : ''}а ${door}.`;
  }

  // Сколько ходов до боя (1 — бой после этого хода) и сколько шагов огонёк ещё стоит (0 — сдвинется с
  // вашим следующим шагом).
  const toStrike = S => S.level.clock - (S.t % S.level.clock);
  const fireWait = S => S.N - (S.path.length - 1 - S.f);
  const plural = (n, one, few, many) => `${n} ${n % 10 === 1 && n % 100 !== 11 ? one : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? few : many}`;

  // Текстовая картинка: поле и рядом карта света; ниже — легенда и то, что под вами.
  const NAMES = { '@': 'вы', '*': 'огонёк', '+': 'шнур (по нему пойдёт огонёк)', '_': 'провал', '#': 'стена', '.': 'пол',
    L: 'тёмная лампа', K: 'горящая лампа', l: 'тёмная лампа с ярлыком', k: 'горящая лампа с ярлыком', X: 'столб (погасшая лампа)',
    b: 'закрытая створка (за ней проход)', B: 'закрытый шкафчик (створка, за ней лампа)', D: 'дверь тёмная — выйти нельзя', O: 'дверь освещена — можно выйти' };
  function sign(S, c) {
    const ch = cell(S, c), i = S.path.indexOf(c);
    if (c === hero(S)) return '@';
    if (i >= 0) return i < S.f ? '_' : i === S.f ? '*' : '+';
    if (ch === 'D') return S.light.includes(c) ? 'O' : 'D';
    if (isLamp(ch)) { const lit = S.lit.includes(c), m = S.mark.includes(c); return lit ? (m ? 'k' : 'K') : (m ? 'l' : 'L'); }
    return ch === 'P' ? '.' : ch;
  }
  function render(S) {
    const w = W(S.level), h = H(S.level), rows = [], seen = new Set();
    rows.push('   ' + Array.from({ length: w }, (_, x) => x + 1).join('') + '    свет: o освещено, . темно');
    for (let y = 0; y < h; y++) { let a = '', b = '';
      for (let x = 0; x < w; x++) { const c = y * w + x, s = sign(S, c); seen.add(s); a += s;
        b += cell(S, c) === '#' ? '#' : S.light.includes(c) ? 'o' : '.'; }
      rows.push(` ${y + 1} ${a}    ${b}`); }
    const order = ['@', '*', '+', '_', '.', '#', 'L', 'K', 'l', 'k', 'X', 'b', 'B', 'D', 'O'];
    rows.push(order.filter(s => seen.has(s) || '*+'.includes(s)).map(s => `${s} ${NAMES[s]}`).join('  '));
    rows.push('клетка (3,2) — столбец 3, строка 2: номера над полем и слева; шнур — ваш след между огоньком и вами');
    const [fx, fy] = xy(S.level, fire(S));
    let tail = `огонёк на (${fx + 1},${fy + 1}); ` + (S.won ? 'вы в двери' : `под вами — ${hero(S) === fire(S) ? 'огонёк (старт), пол' : 'пол'}, ${S.light.includes(hero(S)) ? 'освещён' : 'тёмный'}`);
    if (!over(S)) { const wait = fireWait(S);
      if (wait <= 0 && S.f + 1 < S.path.length) { const [nx, ny] = xy(S.level, S.path[S.f + 1]); tail += `; с вашим следующим шагом огонёк перейдёт на (${nx + 1},${ny + 1})`; }
      else tail += `; огонёк будет стоять ещё ${plural(wait, 'ваш шаг', 'ваших шага', 'ваших шагов')}`;
      const ms = legal(S);
      if (ms.some(m => m.startsWith('открыть'))) tail += `\nесли открыть створку: фитиль станет ${plural(S.N + 1, 'узел', 'узла', 'узлов')}, огонёк постоит на ваш шаг дольше`;
      if (ms.some(m => m.startsWith('ярлык'))) tail += '\nярлык — ход без шага: огонёк в этот ход стоит'; }
    rows.push(tail);
    return rows.join('\n');
  }

  // Картинка для страницы. На каждой клетке — подложка (фон, касание, подпись) и знак поверх неё. Свет — ✨
  // в углу клетки; тёмные лампа и дверь бледные. Шнур — линия от огонька к вам. Подписи: «+1» на створке —
  // фитиль станет длиннее на узел; 🏷 — на лампе висит ярлык; 🔥 — сюда огонёк перейдёт с вашим следующим
  // шагом; 🔒 — тёмная дверь, выйти нельзя. Фон warn — горящая лампа с ярлыком: с боем она погаснет навсегда.
  function view(S) {
    const lv = S.level, w = W(lv), h = H(lv), items = [], marks = [], labels = [], lines = [], live = !over(S);
    const go = {}; if (live) for (const m of legal(S)) go[target(S, m)] = m;
    const next = live && fireWait(S) <= 0 && S.f + 1 < S.path.length ? S.path[S.f + 1] : -1;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const c = y * w + x, ch = cell(S, c), s = c === hero(S) && S.won ? 'O' : sign(S, c), lit = S.light.includes(c);
      if (ch === '#') { items.push({ x, y, glyph: '', tone: 'wall' }); continue; }
      const base = { x, y, glyph: '' }; let label;
      if (go[c] !== undefined) { base.move = go[c]; base.tone = 'go'; if (go[c].startsWith('открыть')) label = '+1'; }
      if (s === 'k') base.tone = 'warn';
      if (s === 'l' || s === 'k') label = '🏷';
      if (s === 'D') label = '🔒';                                          // тёмная дверь: выйти нельзя
      if (c === next) label = '🔥';
      items.push(base);
      const g = { '*': '🔥', _: '🕳️', L: '💡', l: '💡', K: '💡', k: '💡', X: '⚫', b: '🟫', B: '🗄️', D: '🚪', O: '🚪' }[s];
      if (g) marks.push({ x, y, glyph: g, tone: s === 'L' || s === 'l' || s === 'D' ? 'dim' : undefined, corner: c === hero(S) || undefined });
      // в углу клетки: ✨ — клетка освещена; под вами в начале уровня — огонёк (он тоже на старте)
      if (c === hero(S) && c === fire(S) && !S.won) marks.push({ x, y, glyph: '🔥', corner: true });
      else if (lit) marks.push({ x, y, glyph: '✨', corner: true });
      if (label) labels.push({ x, y, glyph: '', label });                  // подпись — поверх знака, чтобы её не закрыл
    }
    for (let i = S.f; i + 1 < S.path.length; i++) { const [x1, y1] = xy(lv, S.path[i]), [x2, y2] = xy(lv, S.path[i + 1]);
      lines.push({ x1, y1, x2, y2, tone: 'warn' }); }
    const [hx, hy] = xy(lv, hero(S));
    marks.push({ x: hx, y: hy, glyph: S.won ? '🚶' : '🧍' });
    const wait = fireWait(S);
    const hud = [{ label: 'Фитиль', value: plural(S.N, 'узел', 'узла', 'узлов') },
      { label: 'Огонёк', value: wait <= 0 ? 'шагнёт с вашим шагом' : `стоит ещё ${plural(wait, 'шаг', 'шага', 'шагов')}`, tone: wait <= 0 && live ? 'warn' : undefined }];
    const ms = live ? legal(S) : [];
    if (ms.some(m => m.startsWith('открыть'))) hud.push({ label: 'Открыть створку', value: `фитиль ${S.N + 1}, огонёк постоит на шаг дольше` });
    if (ms.some(m => m.startsWith('ярлык'))) hud.push({ label: 'Ярлык', value: 'ход без шага: огонёк стоит' });
    if (on(S, 'acid') && lv.clock > 0) { const k = toStrike(S), lit = S.mark.filter(a => S.lit.includes(a)).length, dark = S.mark.length - lit;
      hud.push({ label: 'Бой часов', value: (k === 1 ? 'после этого хода' : `через ${plural(k, 'ход', 'хода', 'ходов')}`) + `, потом каждые ${plural(lv.clock, 'ход', 'хода', 'ходов')}`, tone: k === 1 ? 'warn' : undefined });
      if (S.mark.length) hud.push({ label: 'С боем', value: [dark ? `тёмных унесут: ${dark}` : '', lit ? `горящих погаснет: ${lit}` : ''].filter(Boolean).join(', '), tone: lit ? 'warn' : undefined }); }
    return { w, h, items: items.concat(marks, labels), lines, hud };
  }

  const RULES = {
    NAME: 'Фитиль 2',
    QUESTION: 'Меняют ли ярлыки, срабатывающие с боем часов, и открытие створок рукой (лишний узел фитиля) то, куда вы ведёте огонёк?',
    MECHANICS, levels: LEVELS, init, legal, apply, won, over, key, render, view, why,
    moveName: m => m,
  };
  if (NODE) module.exports = RULES; else root.RULES = RULES;
})(typeof self !== 'undefined' ? self : this);
