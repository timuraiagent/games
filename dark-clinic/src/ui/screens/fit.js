// Вписать лист правил в его место (стена вечером, лист из комнаты).

/** Вписать лист: шрифт от 28 до 22 px (мельче нельзя — в окне 1280×620 это 14.5 px). Не влезло — листается целыми строками, внизу видна метка «дальше». */
export function fitSheet(box) {
  for (let fs = 28; fs >= 22 && box.scrollHeight > box.clientHeight + 2; fs -= 1) box.style.setProperty('font-size', `${fs}px`, 'important');
  // короткий лист (вечер первой ночи) — с воздухом: строки и таблицы свободнее, бумага не ужимается
  box.classList.remove('airy');
  const used = () => { const kids = [...box.children].filter((c) => c.offsetParent !== null); const last = kids[kids.length - 1]; return last ? last.offsetTop + last.offsetHeight - box.firstElementChild.offsetTop : 0; };
  if (used() < box.clientHeight * 0.62) { box.classList.add('airy'); if (box.scrollHeight > box.clientHeight + 2) box.classList.remove('airy'); }
  // короткий лист — сверху, удобным размером, не растянут и не по центру: пустая бумага ниже — на будущее
  box.classList.toggle('short', used() < box.clientHeight * 0.4);
  if (box.classList.contains('short')) box.style.setProperty('font-size', '26px', 'important');
  const more = box.scrollHeight > box.clientHeight + 2;
  box.classList.toggle('scrolls', more);
  if (!more) return;
  const upd = () => box.classList.toggle('at-end', box.scrollTop + box.clientHeight >= box.scrollHeight - 2);
  box.addEventListener('scroll', upd);
  box.addEventListener('wheel', (ev) => { ev.preventDefault(); const lh = parseFloat(getComputedStyle(box).lineHeight) || 32; box.scrollTop += Math.sign(ev.deltaY) * lh * 2; }, { passive: false });
  upd();
}

