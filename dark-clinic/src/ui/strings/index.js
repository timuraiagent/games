// Строки интерфейса по языку партии (view.lang). t('key', { N: 2 }) → строка с подстановками.
import ru from './ru.js';
import en from './en.js';

export const STRINGS = { ru, en };
let current = 'ru';

export function setUiLang(l) { current = STRINGS[l] ? l : 'ru'; }
export function uiLang() { return current; }

export function t(key, vars = null) {
  let s = STRINGS[current][key] ?? STRINGS.ru[key] ?? key;
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.split(`{${k}}`).join(String(v));
  return s;
}

/** { id: { label: 'ключ', … } } → те же записи с переведёнными подписями. */
export function tr(names) {
  return Object.fromEntries(Object.entries(names).map(([k, v]) => [k, { ...v, label: t(v.label) }]));
}
