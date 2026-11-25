// Как вид движка ложится на экраны. Только раскладка: какой экран, где какая кнопка,
// как звучит стук и как ощущается пульс. Исходов и текстов для игрока здесь нет.

/** Экран по виду движка. */
export function screenOf(v) {
  if (!v) return 'title';
  switch (v.phase) {
    case 'title': return 'title';
    case 'evening': return 'evening';
    case 'morning': return 'morning';
    case 'end': return 'end';
    case 'night': {
      const nv = v.nightView;
      const a = nv && nv.active;
      if (!nv || nv.over || !a) return 'room';
      if (a.step === 'knock' || a.step === 'inside') return 'room';
      if (a.step === 'hatch') return 'exam';
      if (a.step === 'scales' || a.step === 'handover') return 'scales';
      if (a.step === 'payment') return a.where === 'hatch' ? 'exam' : 'room';
      return 'room';
    }
    default: return 'title';
  }
}

/** Активный гость и где он: 'hatch' (у окошка) или 'inside' (в комнате). */
export function active(v) {
  return v && v.nightView ? v.nightView.active : null;
}

const CHECK_PART = {
  ask: 'voice', tongue: 'grille', rinse: 'drawer', mirror: 'bronze_mirror',
  pulse_rate: 'arm_door', pulse_depth: 'arm_door', rest: 'arm_door',
};
const HERB_DRAWER = (p) => (p && p !== 'none' ? `drawer_${p}` : 'paper');

/**
 * Где живёт действие на экране: имя горячего места (тогда кнопка — в его меню),
 * 'board' (доска), 'drawers' / 'poison' (весы) или 'panel' (кнопки экрана).
 */
export function placeOf(a, screen, v) {
  const id = a.id;
  if (id === 'board_temp' || id === 'board_loc') return 'board';
  // своё зеркало — везде одной кнопкой в панели (не прячется в лампе или термосе)
  if (screen === 'exam') return CHECK_PART[id] || 'panel';
  // крупные планы: здесь — своя проверка; доска — та же; остальное — на шаг назад, у ставня
  if (screen === 'tongue') return id === 'tongue' || id === 'rinse' ? 'panel' : 'exam.back';
  if (screen === 'pulse') return id === 'pulse_rate' || id === 'pulse_depth' ? 'panel' : 'exam.back';
  if (screen === 'room') {
    const ac = active(v);
    // осмотр в комнате — у того, к кому повернулся ученик: на табурете (visitor) или на лавке (bench_visitor)
    const onBench = v.nightView?.focus === 'waiting' && ['bench', 'stool'].includes(v.nightView?.waiting?.spot);
    if (ac && ac.step === 'inside' && CHECK_PART[id]) return ac.where === 'inside' && !onBench ? 'visitor' : 'bench_visitor';
    return 'panel';
  }
  if (screen === 'scales') {
    // травы — из ящиков шкафа, яд — из банки; свёрток и отдать — на бумаге; отойти — от весов
    if (id === 'herb') return HERB_DRAWER(a.param);
    if (id === 'dose') return 'jar';
    if (id === 'wrap' || id === 'give_home' || id === 'give_drink' || id === 'let_in') return 'paper';
    if (id === 'back') return 'scales';
    return 'panel';
  }
  return 'panel';
}

// ── Стук — только данными движка (nightView.knock.data / событие knock): число, ритм, сила,
// слышны ли шаги, стихает ли ветер, шорох по ставне. Текст стука лишь читается игроком.
const RH = { even: 'even', slow: 'slow', quick: 'quick', broken: 'hesitant', hesitant: 'hesitant' };
const ST = { weak: 0.4, normal: 0.72, strong: 0.95 };

export function knockFromData(data) {
  const d = data || {};
  return {
    count: Math.max(1, d.count || 1),
    rhythm: Array.isArray(d.rhythm) ? d.rhythm : (RH[d.rhythm] || 'even'),
    strength: typeof d.strength === 'number' ? d.strength : (ST[d.strength] ?? 0.72),
    steps: d.steps !== false,
    windStops: !!d.windStops,
    rustle: !!d.rustle,
  };
}

// ── Пульс под пальцами: темп и сила из кода наблюдения на доске ─────────────────────────
export const RATE_BPM = { slow: 52, even: 72, fast: 112, very_slow: 26 };
export const DEPTH_FEEL = {
  // [сила при лёгком касании, сила при нажиме]
  surface: [0.85, 0.4],
  middle: [0.45, 0.6],
  deep: [0.08, 0.8],
};

export function lastSign(a, check) {
  if (!a || !a.board) return null;
  const s = [...a.board.signs].reverse().find((x) => x.check === check);
  return s || null;
}

export function pulseFeel(a) {
  const rate = lastSign(a, 'pulse_rate');
  const depth = lastSign(a, 'pulse_depth');
  const weakText = !!a?.seen?.pulseWeak;
  const bpm = RATE_BPM[rate?.value] || 70;
  return { bpm, weak: !!weakText, depth: depth?.value || null, rateKnown: !!rate };
}

// ── Звуки движка → синтез ──────────────────────────────────────────────────────────────
export const SOUND_MAP = {
  stair_door: ['creak', {}],
  hatch_open: ['shutter', { open: true }],
  hatch_close: ['shutter', { open: false }],
  arm_door: ['shutter', { open: true, small: true }],
  rinse: ['pour', { short: true }],
  pour: ['pour', {}],
  door_bolt: ['bolt', {}],
  scales: ['clink', {}],
  paper: ['paper', {}],
  coin: ['coin', { count: 1 }],
  coins: ['coin', { count: 3 }],
  flame_low: ['sputter', {}],
  shutters: ['shutter', { open: true, heavy: true }],
};

export const AMBIENCE_BY_NIGHT = {
  1: { crickets: 0.8, rain: 0, wind: 0, hiss: 1 },
  2: { crickets: 0, rain: 1, wind: 0.12, hiss: 1 },
  3: { crickets: 0.35, rain: 0, wind: 1, hiss: 1 },
};

/** Погода из вида движка (nightView.ambience), а если её нет — погода ночи. */
const WIND = { quiet: { crickets: 0.8, wind: 0 }, rain: { crickets: 0, wind: 0.12 }, blowing: { crickets: 0.35, wind: 1 }, silent: { crickets: 0.2, wind: 0.03 } };
export function ambienceFromView(v) {
  const a = v?.nightView?.ambience;
  if (!a) return { ...(AMBIENCE_BY_NIGHT[v?.night] || AMBIENCE_BY_NIGHT[1]) };
  return { ...(WIND[a.wind] || WIND.quiet), rain: a.rain ? 1 : 0, hiss: 1 };
}
