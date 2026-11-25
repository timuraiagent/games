// Чистые правила демо (DESIGN.md §23): цены в масле, лампа, запасы, таблица исходов.
// Без состояния и без случайности.

// Лампа подобрана под состав ночей (§23, «Честный шум»): обычный приём каждого и два глубоких осмотра.
// Каждую ночь на ложку меньше (мертвец в доме), ещё на две — если мёртвый сидел в комнате.
// В ночь 3 Лю отдаёт свою бутыль (LIU_BOTTLE): «мне свет ни к чему».
export const LAMP_START = 21;
export const LAMP_FLOOR = 0; // нижней границы нет: штраф ровно такой, как обещает лист
export const LIU_BOTTLE = 2;
// кто по записке Лю впустил Вэя в ночь 2, тот в ночь 3 не идёт к его стуку в темноте (§23): ещё ложка из бутыли
export const LIU_BOTTLE_COLD = 0; // больше не нужен: кто впустил Вэя по слову Лю, тому лампу не студят (§23)
// первый отдых за ночь учит подрезать фитиль: он стоит на ложку меньше (§23, справедливость к новичку)
export const WICK = 1;
export const FEE = 8; // ночной приём
export const HERB_PRICE = 4;
// масло в демо не продаётся (§23, «Запасы»)
export const START = { coins: 12, herbDoses: 3 };

export const HERBS = ['herb_out_cold', 'herb_out_heat', 'herb_in_cold', 'herb_in_heat'];
export const QUESTION_TOPICS = ['thirst', 'duration', 'chills', 'home'];

export const COST = {
  question: 1, questionLate: 2, // третий и следующие вопросы тому же гостю — по 2
  tongue: 1, pulse_rate: 1, pulse_depth: 1, mirror: 1, rinse: 2,
  let_in: 1, rest: 5, leave_seated: 0,
};

/**
 * Цена касания пульса: в дождь (ночь 2) у окошка рука мокрая — две ложки; у лампы, в комнате, рука обсыхает — одна.
 * Отдых с повторным пульсом идёт у лампы и стоит своё (три ложки) в любую ночь.
 */
export function pulseCost(n, inside = false) {
  return n === 2 && !inside ? 2 : 1;
}

/** Цена следующего вопроса, если гостю уже задано asked вопросов. */
export function questionCost(asked) {
  return asked >= 2 ? COST.questionLate : COST.question;
}

/** Ящик, который следует из двух ответов доски. */
export function herbFor(temp, loc) {
  if (!temp || !loc) return null;
  return `herb_${loc}_${temp}`;
}

/** Лампа следующей ночи: −1 (мертвец в доме), ещё −2, если нелюдь сидел в комнате; не ниже LAMP_FLOOR. */
export function nextLamp(cap, nonhumanInside) {
  return Math.max(LAMP_FLOOR, cap - 1 - (nonhumanInside ? 2 : 0));
}

/** Яд на начало ночи: ночь 1 — нет; ночь 2 — учебная склянка на щепоть, верх запечатан; ночь 3 — мера, три щепоти. */
export function poisonForNight(n) {
  if (n === 1) return { pinches: 0, vial: false, sealed: true, key: false };
  if (n === 2) return { pinches: 1, vial: true, sealed: true, key: false };
  return { pinches: 3, vial: false, sealed: false, key: true };
}

export const GONE = 5;
export const isSick = (d) => d === 1 || d === 2;
export const isEdge = (d) => d === 3 || d === 4;

/**
 * Таблица исходов §23.
 * truth: { kind: 'living'|'dead'|'skin', temp, loc, deg, costly }
 * packet: { herb: id|null, dose: 'none'|'pinch'|'measure' }
 *       | { refused: true } | { unreceived: true }
 * Возвращает { code, deg, returns, refund, … } — deg только у живых.
 */
export function resolve(truth, packet) {
  if (truth.kind === 'living') return resolveLiving(truth, packet);
  return resolveOther(truth, packet);
}

function step(deg, by) {
  return Math.max(0, Math.min(GONE, deg + by));
}

function resolveLiving(t, p) {
  const before = t.deg;
  const out = (code, deg, extra = {}) => ({
    code, before, deg, gone: deg >= GONE && code !== 'killed', killed: code === 'killed',
    returns: null, refund: false, ...extra,
  });
  if (p.refused) return out('refused', step(before, 1));
  if (p.unreceived) return out('unreceived', step(before, 1));
  const right = p.herb && p.herb === herbFor(t.temp, t.loc);
  const dose = p.dose || 'none';

  if (dose === 'measure') return out('killed', before);
  if (dose === 'pinch') {
    if (t.temp === 'heat') {
      const d = step(before, 2);
      return out('pinch_heat', d, { returns: isSick(before) && d < GONE ? 'worse' : null });
    }
    // холодный
    if (isSick(before)) return out('overdose', step(before, 1), { refund: true, returns: 'worse' });
    if (right) return out('returned', step(before, -1));
    return out('held_pinch', before);
  }
  // без яда
  if (right) {
    if (isSick(before)) return out('cured', 0, { returns: 'thanks' });
    return out('held', before);
  }
  if (isSick(before)) {
    const d = step(before, 1);
    return out('worse', d, { returns: 'worse' });
  }
  return out('worse_edge', step(before, 1));
}

function resolveOther(t, p) {
  const out = (code, extra = {}) => ({ code, returns: null, refund: false, ...extra });
  // Отказ: уходит, как пришёл; мертвец идёт домой, как и шёл (§23, правка после ревью).
  if (p.refused || p.unreceived) return out(t.kind === 'dead' ? 'walked_home' : 'left');
  const dose = p.dose || 'none';
  if (dose === 'pinch') return t.temp === 'cold' ? out('revealed', { revealed: true, course: 1 }) : out('fed', { fed: true });
  if (dose === 'measure') return t.temp === 'cold' ? out('destroyed', { destroyed: true }) : out('fed', { fed: true });
  return out('no_effect');
}

/**
 * Мертвец в доме (§23): пока он ходит домой, домашний каждую ночь делает шаг вниз.
 * Применяется к Мэй утром ночи 3, если Вэя не рассеяли.
 */
export function deadInHouse(deg) {
  return Math.min(GONE, deg + 1);
}

/** Что покажет отдых и повторный пульс. */
export function restReading(truth) {
  if (truth.kind !== 'living') return 'unchanged';
  return isEdge(truth.deg) ? 'barely' : 'evens';
}
