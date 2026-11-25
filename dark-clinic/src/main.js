// Ночной приём — оболочка. Запуск: npm run serve, открыть адрес.
//
// Устройство: Shell держит сцену (stage.js), картинки (assets.js), звук (audio.js) и движок
// (engine-adapter.js → src/engine). Экран выбирается по виду движка (present.js: screenOf);
// события из perform() — стук, реплики, звуки, пульс — проигрываются по очереди;
// после каждого действия — сохранение (ночь не переиграть). Тексты для игрока — только из движка.

import { createStage } from './ui/stage.js';
import { Assets } from './ui/assets.js';
import { Audio } from './audio.js';
import { Tip, Dialogue, installTextures, closeMenu, closeOverlay, h } from './ui/kit.js';
import { Scenes } from './ui/scenes.js';
import { Game, readSave, clearSave, readLang, writeLang } from './ui/engine-adapter.js';
import { t, setUiLang } from './ui/strings/index.js';
import { screenOf, placeOf, knockFromData, SOUND_MAP, AMBIENCE_BY_NIGHT, ambienceFromView } from './ui/present.js';
import { Flicker } from './ui/lighting.js';
import { roomScreen } from './ui/screens/room.js';
import { examScreen } from './ui/screens/exam.js';
import { scalesScreen } from './ui/screens/scales.js';
import { morningScreen } from './ui/screens/morning.js';
import { titleScreen, eveningScreen, endScreen } from './ui/screens/other.js';
import { tongueScreen, pulseScreen } from './ui/screens/closeup.js';
import { installDebug } from './ui/debug.js';
import { Playtime } from './ui/playtime.js';

const SCREENS = {
  title: titleScreen, evening: eveningScreen, room: roomScreen, exam: examScreen,
  scales: scalesScreen, morning: morningScreen, end: endScreen,
  tongue: tongueScreen, pulse: pulseScreen,
};

// события, на которых экран может смениться: до них — договорить на старом экране
const isSplit = (e) => e.type === 'phase' || (e.type === 'sound' && e.sound === 'knock');

/** Событие, которое показывается строкой (её надо прочитать). */
/** Открытый крупный план переживает перезагрузку: игрок возвращается туда, где был. */
const CLOSEUP_KEY = 'night-reception-closeup';
const RULES_NEW_KEY = 'night-reception-rules-new';
const READ_KEY = 'night-reception-read';
function rememberCloseup(c) { try { if (c) localStorage.setItem(CLOSEUP_KEY, JSON.stringify(c)); else localStorage.removeItem(CLOSEUP_KEY); } catch { /* без хранилища — без памяти */ } }
function recallCloseup() { try { const c = JSON.parse(localStorage.getItem(CLOSEUP_KEY) || 'null'); return c && c.kind && c.ref != null ? { from: 'exam', ...c } : null; } catch { return null; } }

/** Флаги строки, с которой перемена на картинке становится видна (их ставит движок). */
const PICTURE_FLAGS = ['earth', 'body', 'bodyMoved', 'leaves', 'seats', 'mei', 'reveal'];

function isLine(ev) {
  return ['say', 'narrate', 'reveal', 'self', 'refused', 'sign'].includes(ev.type) && !!ev.text
    || (ev.type === 'show' && !!ev.text) || (ev.type === 'ambience' && !!ev.text);
}

class Shell {
  constructor() {
    this.params = new URLSearchParams(location.search);
    this.stage = createStage();
    this.assets = new Assets();
    this.audio = new Audio();
    this.tip = new Tip(this.stage);
    this.dialogue = new Dialogue(this);
    this.flicker = new Flicker(7);
    this.scenes = new Scenes(this, SCREENS);
    this.menu = null;
    this.overlay = null;
    this.atTitle = true;
    this.forced = null;
    this.oilShown = 32;
    this.oilFrac = 1;
    this.lampCap = 32;
    this.lampOut = false;
    this.busyCount = 0;
    this.waitingReader = 0;
    this.queue = Promise.resolve();
    this.speed = 1;          // 1 — как задумано; меньше — быстрее (для проверок)
    this.playGen = 0;        // растёт, когда игрок перебил реплики действием
    this.pendingEvents = []; // события, которые новый экран ещё проиграет
    this.seenLines = new Set(); // строки, уже показанные игроку (доска показывает только их)
    this.memo = {};          // что показало событие, а вид не хранит (например, чем платят)
    // минуты по ночам (вечер, ночь и утро ночи N — в счёт ночи N); обложка и конец демо — не в счёт
    this.playtime = new Playtime(() => {
      if (this.atTitle || !this.game) return null;
      const v = this.game.view();
      return ['evening', 'night', 'morning'].includes(v.phase) ? v.night : null;
    });
  }

  sleep(ms) { return new Promise((r) => setTimeout(r, ms * this.speed)); }

  async boot() {
    installTextures();
    this.playtime.install();
    this._muteButton();
    const unlock = () => this.audio.unlock();
    window.addEventListener('pointerdown', unlock, { capture: true });
    // игра только мышью: клавиши не нажимают кнопок (Tab, Enter, пробел)
    window.addEventListener('keydown', (e) => {
      if (['Tab', 'Enter', ' ', 'Spacebar'].includes(e.key)) { e.preventDefault(); e.stopPropagation(); }
    }, { capture: true });
    window.addEventListener('keyup', (e) => { if (['Enter', ' '].includes(e.key)) { e.preventDefault(); e.stopPropagation(); } }, { capture: true });
    this.stage.el.addEventListener('pointerdown', (e) => {
      if (this.menu && !this.menu.contains(e.target)) {
        closeMenu(this);
        e.stopPropagation();
        this._swallowClick = true;
      }
    }, { capture: true });
    this.stage.el.addEventListener('click', (e) => {
      if (this._swallowClick) { this._swallowClick = false; e.stopPropagation(); e.preventDefault(); }
    }, { capture: true });

    await Promise.all([
      this.assets.init(),
      document.fonts.load('24px "PT Serif"'), document.fonts.load('italic 24px "PT Serif"'), document.fonts.load('36px Caveat'),
    ]);
    // ?lang=en|ru — язык обложки и новой игры (для снимков и проверок); иначе — запомненный выбор
    const ql = this.params.get('lang');
    this.uiLang = ql === 'en' || ql === 'ru' ? ql : readLang();
    if (ql === 'en' || ql === 'ru') writeLang(ql);
    this.game = new Game(null, this.uiLang);
    this.applyLang(this.uiLang);
    this.hasSave = !!readSave();
    if (this.params.has('fast')) this.speed = Math.max(0.01, Number(this.params.get('fast')) || 0.05);
    if (this.params.has('debug') || navigator.webdriver) installDebug(this);

    let last = performance.now();
    const loop = (now) => {
      const dt = Math.min(0.1, (now - last) / 1000); last = now;
      this._tickOil(dt);
      this.stage.el.classList.toggle('playing', this.busyCount > 0 && !this.waitingReader);
      this.stage.el.classList.toggle('reading', this.waitingReader > 0);
      this.stage.el.classList.toggle('dim', !this.atTitle && (this.lampOut || this.oilFrac < 0.35));
      this.scenes.frame(now / 1000, dt);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
    await this.scenes.go('title', this.view(), { fadeIn: 2200 });
    this.ready = true;
  }

  get oil() { const v = this.game.view(); return v.lamp ? v.lamp.oil : 32; }

  _tickOil(dt) {
    const v = this.game?.view();
    const lamp = v && v.lamp;
    const target = lamp ? lamp.oil : 32;
    this.lampCap = lamp ? Math.max(1, lamp.capacity || target) : 32;
    const out = !!(lamp && lamp.out && v.phase === 'night');
    // огарок свечи в ночь 3: масла нет, но на последний приём видно
    this.candle = !!(lamp && lamp.candle && v.phase === 'night');
    if (out !== this.lampOut) {
      this.lampOut = out;
      // лампа погасла: ночь идёт дальше вслепую — под полом низкий гул
      this.audio.dread(out, 0.35);
    }
    const d = target - this.oilShown;
    if (Math.abs(d) < 0.01) this.oilShown = target;
    else this.oilShown += Math.sign(d) * Math.min(Math.abs(d), (dt / Math.max(0.05, this.speed)) * Math.max(1.2, Math.abs(d) * 1.5));
    this.oilFrac = this.atTitle ? 1 : Math.max(0, Math.min(1, this.oilShown / this.lampCap));
  }

  /** Звук — маленький медный колокольчик в углу (в тон рисунку), а не надпись. */
  _muteButton() {
    const b = h('button', { id: 'mute', 'data-act': 'mute', 'aria-label': t('mute.label') });
    b.tabIndex = -1;
    const c = document.createElement('canvas'); c.width = 10; c.height = 10;
    b.append(c);
    const draw = () => {
      const g = c.getContext('2d');
      g.clearRect(0, 0, 10, 10);
      const px = (x, y, col) => { g.fillStyle = col; g.fillRect(x, y, 1, 1); };
      const B = '#8a6a3a', D = '#4e3a20', L = '#b08850';
      [[4, 1], [5, 1]].forEach(([x, y]) => px(x, y, D));
      [[3, 2], [4, 2], [5, 2], [6, 2], [3, 3], [6, 3], [2, 4], [7, 4], [2, 5], [7, 5], [1, 6], [8, 6]].forEach(([x, y]) => px(x, y, B));
      [[4, 3], [5, 3], [3, 4], [4, 4], [5, 4], [6, 4], [3, 5], [4, 5], [5, 5], [6, 5], [2, 6], [3, 6], [4, 6], [5, 6], [6, 6], [7, 6]].forEach(([x, y]) => px(x, y, L));
      for (let x = 1; x <= 8; x++) px(x, 7, D);
      if (!this.audio.muted) { px(4, 8, B); px(5, 8, B); }        // язычок висит — звонит
      else { px(0, 0, '#6e2a1d'); px(1, 1, '#6e2a1d'); px(8, 8, '#6e2a1d'); px(9, 9, '#6e2a1d'); px(2, 2, '#6e2a1d'); px(7, 7, '#6e2a1d'); }
    };
    b.addEventListener('mouseenter', (e) => this.tip.show(b, this.audio.muted ? t('mute.off') : t('mute.on'), null, e.clientX, e.clientY));
    b.addEventListener('mouseleave', () => this.tip.hide(b));
    b.addEventListener('click', (e) => { e.stopPropagation(); this.audio.unlock(); this.audio.toggleMute(); draw(); this.tip.hide(b); });
    draw();
    this.stage.el.append(b);
  }

  /** Вид движка + имя экрана. */
  view() {
    const v = this.game.view();
    if (v.lang && v.lang !== this.curLang) this.applyLang(v.lang);
    let screen = this.atTitle ? 'title' : (this.forced || screenOf(v));
    // крупный язык или пульс — тот же осмотр у окошка, только ближе; гаснет вместе с ним (и в темноте его нет)
    if ((screen === 'exam' || screen === 'room') && this.closeup) {
      const a = v.nightView?.active;
      // у ставня — гость у окошка; в комнате — гость, к которому повернулся ученик
      const where = screen === 'exam' ? 'hatch' : 'inside';
      const ok = a && a.ref === this.closeup.ref && a.step === where && this.closeup.from === screen && !v.lamp?.out && !v.lamp?.candle;
      if (ok) screen = this.closeup.kind; else { this.closeup = null; rememberCloseup(null); }
    }
    return { ...v, screen };
  }

  /** Язык интерфейса: строки, <html lang>, заголовок окна, строка «окно мало». */
  applyLang(l) {
    this.curLang = l;
    setUiLang(l);
    document.documentElement.lang = l;
    document.title = t('page.title');
    const ts = document.getElementById('too-small'); if (ts) ts.textContent = t('tooSmall');
    const mb = document.getElementById('mute'); if (mb) mb.setAttribute('aria-label', t('mute.label'));
  }

  /** Выбор языка на обложке: для новой игры и для самой обложки сразу. */
  chooseLang(l) {
    if (!this.atTitle || (l !== 'ru' && l !== 'en')) return;
    this.uiLang = l; writeLang(l);
    if (!this.hasSave || this.game.view().phase === 'title') this.game = new Game(null, l);
    this.applyLang(l);
    this.scenes.go('title', this.view(), { instant: true });
  }

  /** Открыть крупный план (tongue | pulse) от ставня; это даром — платят только за проверку. */
  openCloseup(kind) {
    const a = this.game.view().nightView?.active;
    if (!a || this.busy) return;
    const from = this.scenes.name === 'room' ? 'room' : 'exam';
    // реплика ещё на экране: щелчок открывает следующую строку, крупный план — когда дочитаны
    if (this.waitingReader) { this.pendingCloseup = kind; this.dialogue.next(); return; }
    closeMenu(this);
    this.closeup = { kind, ref: a.ref, from };
    rememberCloseup(this.closeup);
    this.audio.play('shutter', { open: true, small: true });
    this._run([], 'closeup');
  }

  closeCloseup() {
    if (!this.closeup || this.busy) return;
    this.closeup = null;
    rememberCloseup(null);
    this._run([], 'closeup');
  }

  actions() { return this.atTitle ? [] : this.game.actions(); }

  /** Действия, которые живут в данном месте экрана (горячее место, доска, панель). */
  /** Где действие на экране сейчас: место по раскладке, а если такого горячего места нет — панель. */
  placeNow(a, v) {
    const p = placeOf(a, v.screen, v);
    if (['panel', 'board', 'drawers', 'jar', 'paper', 'scales', 'exam.back'].includes(p) || p.startsWith('drawer_')) return p;
    const el = this.stage.layers.ui.querySelector(`.hotspot[data-act="${p}"]`);
    return el ? p : 'panel';
  }

  actionsAt(place) {
    const v = this.view();
    return this.actions().filter((a) => this.placeNow(a, v) === place);
  }

  /** Погода из вида (nightView.ambience) — после загрузки и при каждой перемене вида. */
  syncWeather() {
    const v = this.view();
    const a = v.nightView?.ambience;
    if (!a) return;
    const key = JSON.stringify(a);
    if (key === this.weatherKey) return;
    this.weatherKey = key;
    const lv = ambienceFromView(v);
    delete lv.hiss;
    if (this.audio.cricketsSilent) delete lv.crickets;
    this.audio.ambience(lv, 2);
    this.memo.windDown = a.wind === 'silent';
  }

  /** Погода от движка (событие или nightView.ambience): wind: 'silent' — ветер стихает. */
  applyAmbience(src, night) {
    if (!src || typeof src !== 'object') return;
    const lv = {};
    for (const k of ['wind', 'rain', 'crickets']) {
      if (src[k] === 'silent' || src[k] === 'off' || src[k] === false) lv[k] = 0.03;
      else if (typeof src[k] === 'number') lv[k] = src[k];
      else if (src[k] === 'on' || src[k] === true) lv[k] = (AMBIENCE_BY_NIGHT[night] || {})[k] ?? 0.6;
    }
    if (lv.wind != null && lv.wind < 0.1) this.memo.windDown = true;
    if (Object.keys(lv).length) this.audio.ambience(lv, 1.5);
  }

  /** Новое на листах правил: { [номер листа]: [id строк] } — переживает перезагрузку, пока лист не открыт. */
  get rulesNew() {
    if (!this._rulesNew) { try { this._rulesNew = JSON.parse(localStorage.getItem(RULES_NEW_KEY) || '{}') || {}; } catch { this._rulesNew = {}; } }
    return this._rulesNew;
  }
  _saveRulesNew() { try { localStorage.setItem(RULES_NEW_KEY, JSON.stringify(this.rulesNew)); } catch { /* */ } }
  noteRule(ev) {
    const k = String(ev.sheet || 1);
    const list = this.rulesNew[k] || (this.rulesNew[k] = []);
    if (ev.id && !list.includes(ev.id)) list.push(ev.id);
    this._saveRulesNew();
    this.scenes.current?.rulesMark?.();
  }
  hasNewRules(n) { return n == null ? Object.values(this.rulesNew).some((x) => x.length) : !!(this.rulesNew[String(n)] || []).length; }
  /** Лист открыт: знак снимается; что было новым — отдаётся (свежими чернилами, пока лист открыт). */
  takeFresh(n) {
    const k = String(n);
    const set = new Set(this.rulesNew[k] || []);
    if (set.size) { delete this.rulesNew[k]; this._saveRulesNew(); this.scenes.current?.rulesMark?.(); }
    return set;
  }

  /** Строка реплики показана полосой — с этого момента она и на доске. */
  onLineShown(l) {
    if (!l || !l.text) return;
    // сколько строк последнего шага прочитано — чтобы после перезагрузки показать остаток (view.last)
    if (this.readMark) { (this.readMark.texts ||= []).push(l.text); try { localStorage.setItem(READ_KEY, JSON.stringify(this.readMark)); } catch { /* */ } }
    (this.shownLines ||= []).push(l.text);
    this.seenLines.add(l.text);
    this.scenes.current?.lineShown?.();
  }

  /** Всё, что гость уже сказал до перезагрузки, считается прочитанным. */
  markAllSeen() {
    const n = this.game.view().nightView;
    for (const x of [n?.door, n?.seated, n?.waiting, n?.active]) for (const l of x?.lines || []) this.seenLines.add(l.text);
  }

  /** Адрес картинки по id движка (ищется по группам манифеста). */
  imageUrl(id) {
    if (!id) return null;
    for (const g of ['props', 'street_variants', 'tongues', 'portraits', 'arms', 'seated', 'bg']) {
      const u = this.assets.url(`${g}.${id}`);
      if (u) return u;
    }
    return null;
  }

  /** Темно совсем: лампа погасла и огарка нет. */
  get dark() { return this.lampOut && !this.candle; }

  get busy() { return this.scenes.transitioning || (this.busyCount > 0 && !this.waitingReader); }

  closeTransient() {
    closeMenu(this);
    closeOverlay(this);
    this.dialogue.clear();
    this.tip.hide();
  }

  /** Действие игрока. key — ключ движка ('ask:thirst') или действие обложки. */
  perform(key, params) {
    this.audio.unlock();
    closeMenu(this);
    if ((key === 'title.new' || key === 'new_game') && this.hasSave && !params?.confirmed) {
      // новая игра поверх сохранения — только после вопроса (и из отладки тоже)
      this.scenes.current?.askNew?.();
      return { ok: false, asked: true, events: [] };
    }
    if (key === 'title.new' || (key === 'new_game' && !this.atTitle)) {
      clearSave();
      rememberCloseup(null);
      this._rulesNew = {}; this._saveRulesNew();
      this.playtime.reset();
      this.game = new Game(null, this.uiLang);
      this.atTitle = false; this.forced = null; this.memo = {};
      key = 'new_game';
    } else if (key === 'title.continue') {
      const rec = readSave();
      if (!rec) return { ok: false, events: [] };
      this.game = Game.fromSave(rec);
      this.atTitle = false; this.forced = null;
      // перезагрузка на крупном плане — вернуться на него (вид сам проверит, что гость тот же)
      this.closeup = recallCloseup();
      this.oilShown = this.oil;
      this.markAllSeen();
      // погода после загрузки — из вида, если движок её даёт (иначе — погода ночи при входе на экран)
      this.restoreAmbience = null;
      // звук восстанавливается из вида: если у ставни стучат — стук звучит снова (по knockData)
      const nv0 = this.game.view().nightView;
      const d = nv0?.door;
      const kn = nv0?.knock || (d && d.step === 'knock' ? { text: d.knock, data: d.knockData } : null);
      let ev = kn ? [{ type: 'sound', sound: 'knock', text: kn.text, image: d?.silhouette, knock: kn.data, replay: true }] : [];
      // недочитанные строки последнего шага (view.last): показать остаток, с того места, где игрок остановился
      const last = this.game.view().last;
      let mark = null; try { mark = JSON.parse(localStorage.getItem(READ_KEY) || 'null'); } catch { /* */ }
      if (last && Array.isArray(last.events)) {
        const lineEvs = last.events.filter((e) => isLine(e) || (e.type === 'sound' && e.sound === 'knock' && e.text));
        const read = new Set(mark && mark.step === last.step ? mark.texts || [] : []);
        // остаток — с первой непрочитанной строки (строки, которые на этом экране строкой не показываются, — пропустить)
        const k = lineEvs.findIndex((e) => !read.has(e.text) && !(e.type === 'sign' && this.view().screen !== 'room'));
        const rest = k >= 0 ? lineEvs.slice(k).filter((e) => !(e.type === 'sign' && this.view().screen !== 'room')) : [];
        if (rest.length) {
          ev = rest.map((e) => ({ ...e }));
          // шаг уже сделан: картинка сразу по виду, звуки повторять не надо, кроме стука
          this.readMark = { step: last.step, texts: [...read] };
        }
      }
      this._run(ev, 'continue');
      return { ok: true, events: [] };
    } else if (this.atTitle) return { ok: false, events: [] };

    // пока идёт стук или переход — щелчок ничего не делает; пока висит реплика — щелчок по
    // действию её дочитывает и делает своё (несказанное из прошлого шага уже не показывается)
    // щелчок не теряется никогда: и между строками (звук, пауза, переход) действие ждёт и выполняется после
    const busyNoLine = this.busyCount > 0 && !this.waitingReader;
    const acts = this.game.actions();
    const a = acts.find((x) => x.key === key) || acts.find((x) => x.id === key && x.param === undefined);
    if (!a || a.enabled === false) return { ok: false, ignored: true, events: [] };
    // реплики гостя не теряются: действие, нажатое раньше, ждёт, пока прочитаны все строки;
    // каждый такой щелчок открывает следующую строку (как щелчок по самой полосе)
    if (this.waitingReader || busyNoLine) {
      this.pendingAction = { key, params };
      // кнопка видно ждёт: «нажато, сделаю, когда дочитаешь»
      for (const el of this.stage.el.querySelectorAll('.pending')) el.classList.remove('pending');
      this.stage.el.querySelector(`[data-act="${CSS.escape(key)}"]`)?.classList.add('pending');
      // нажато из меню горячего места: место держится нажатым (меловая галочка), пока действие не выполнится
      if (this.menuPick?.isConnected) this.menuPick.classList.add('pending');
      if (!busyNoLine) this.dialogue.next();
      return { ok: true, queued: true, events: [] };
    }

    const viewBefore = this.game.view();
    const before = this.view().screen;
    const res = this.game.perform(key, params);
    if (!res.ok) { console.debug('engine refused:', key, res.events); return res; }
    this.game.save();
    this.hasSave = true;
    // новый шаг: его строки ещё не прочитаны
    this.readMark = { step: this.game.view().last?.step ?? null, texts: [] };
    try { localStorage.setItem(READ_KEY, JSON.stringify(this.readMark)); } catch { /* */ }
    this.forced = null;
    const after = this.view().screen;
    // картинка не обгоняет текст: пока строки этого шага не прочитаны, перемены на картинке ждут
    // (уход гостя, тело, земля на табурете, ответ на доске); движок может отметить строку, с которой
    // перемена видна (earth / picture), — тогда она проявляется на этой строке
    this.holdPictures = res.events.some(isLine);
    this.viewBefore = viewBefore;
    if (after === before) this.scenes.update(this.view(), res.events);
    this._run(res.events, key, before !== after);
    return res;
  }

  _run(events, key, changes = true) {
    this.busyCount++;
    this.queue = this.queue
      .then(async () => {
        // гость пьёт или отзывается (at:'guest'): прежде этой строки — повернуться к нему (комната или ставня),
        // а не договаривать над весами
        const gi = events.findIndex((e) => e.at === 'guest');
        if (gi >= 0 && this.scenes.name === 'scales') {
          await this._play(events.slice(0, gi));
          const vb = this.viewBefore?.nightView?.active;
          this.forced = vb && vb.where === 'inside' ? 'room' : 'exam';
          this.pendingEvents = [];
          await this.scenes.go(this.forced, this.view(), {});
          const rest = events.slice(gi);
          const si = rest.findIndex(isSplit);
          await this._play(si > 0 ? rest.slice(0, si) : rest);
          this.forced = null;
          this.holdPictures = false;
          this.flagEarth = false;
          if (si > 0) { this.pendingEvents = rest.slice(si); await this._sync(); this.pendingEvents = []; await this._play(rest.slice(si)); }
          await this._sync();
          this.syncWeather();
          this.scenes.update(this.view(), []);
          return;
        }
        const i = events.findIndex(isSplit);
        const cur = this.scenes.name;
        // уходя от окошка или весов, договорить там; входя куда-то — сперва войти
        const stayFirst = changes && i > 0 && (cur === 'exam' || cur === 'scales');
        if (stayFirst) await this._play(events.slice(0, i));
        this.pendingEvents = stayFirst ? events.slice(i) : events;
        await this._sync();
        this.pendingEvents = [];
        this.syncWeather();
        await this._play(stayFirst ? events.slice(i) : events);
        this.holdPictures = false;
        this.flagEarth = false;
        await this._sync();
        this.syncWeather();
        this.scenes.update(this.view(), []);
      })
      .catch((e) => console.error(e))
      .finally(() => {
        this.holdPictures = false;
        this.flagEarth = false;
        this.busyCount--;
        if (this.busyCount === 0 && this.pendingCloseup && !this.pendingAction) {
          const k = this.pendingCloseup; this.pendingCloseup = null; this.openCloseup(k);
        }
        if (this.busyCount === 0 && this.pendingAction) {
          for (const el of this.stage.el.querySelectorAll('.pending')) el.classList.remove('pending');
          const p = this.pendingAction; this.pendingAction = null;
          this.perform(p.key, p.params);
        }
      });
  }

  async _sync() {
    const v = this.view();
    if (v.screen !== this.scenes.name) await this.scenes.go(v.screen, v, {});
  }

  async _say(line) {
    this.waitingReader++;
    try { await this.dialogue.say(line); } finally { this.waitingReader--; }
  }

  async _play(events) {
    const v = this.view();
    this._gen = this.playGen;
    // уходят без шагов (не живые): движок помечает строку silentSteps — тогда шагов от окошка не слышно
    this.batchSilent = events.some((ev) => ev.silentSteps);
    // если погода стихает вместе со стуком — стихает до стука, чтобы удары были слышны в тишине
    for (const ev of events) {
      if (ev.type === 'ambience' && ev.wind === 'silent') { this.audio.ambience({ wind: 0.03 }, 1.2); this.memo.windDown = true; ev._done = true; }
    }
    for (const ev of events) {
      const scene = this.scenes.current;
      switch (ev.type) {
        case 'sound': await this._sound(ev, v); break;
        case 'say': await this._say({ who: ev.speaker, text: ev.text }); break;
        case 'narrate':
          if (ev.sound === 'crickets_stop') this.audio.silenceCrickets(true);
          // строка, с которой перемена на картинке видна (движок отмечает её флагом)
          // земля бывает на табурете только между строками шага (к утру её сметают) — строка с earth рисует её сама
          if (ev.earth) this.flagEarth = true;
          if ((this.holdPictures || ev.earth) && PICTURE_FLAGS.some((f) => ev[f])) { this.holdPictures = false; await this.scenes.update(this.view(), []); }
          if (ev.image === 'coins' || (ev.image && ev.image.startsWith('herb_'))) this.memo.offer = ev.image;
          if (ev.who === 'mei') {
            // описание того, что видно у Мэй, — без имени (её речь приходит событием say)
            await this._say({ text: ev.text });
            break;
          }
          await this._say({ text: ev.text, image: this.imageUrl(ev.image) });
          break;
        case 'show':
          // плата на прилавке без строки (раунд 25): монеты — на прилавке у окошка, звук — своим событием
          if (ev.slot === 'counter' && ev.image && (ev.image === 'coins' || ev.image.startsWith('herb_') || ev.offer)) {
            this.memo.offer = ev.image;
            this.memo.counterShow = { image: ev.image, at: performance.now() };
            await this.scenes.update(this.view(), [ev]);
          }
          if (['tray', 'drawer', 'counter'].includes(ev.slot) && ev.text) {
            // вечер 3: на подносе ключ и бутыль Лю — обе вещи видно и в строке
            const imgs = [this.imageUrl(ev.image)];
            if (ev.slot === 'tray' && ev.image === 'key') imgs.push(this.imageUrl('bottle_liu'));
            await this._say({ text: ev.text, image: imgs[0], images: imgs.filter(Boolean) });
          }
          break;
        case 'refused': if (ev.text) await this._say({ text: ev.text }); break;
        case 'rule_learned':
          // правило стало известно: на листе — новое (знак на месте листа и на ярлыке, пока лист не открыт);
          // в сцене — слова учителя один раз, его рукой. Правило решения уже прочитано на самом действии;
          // дописанное Лю к утру — без строки
          this.noteRule(ev);
          if (ev.text && ev.via !== 'morning' && ev.via !== 'decision') await this._say({ text: ev.text, teacher: true });
          else this.audio.play('paper', { soft: true });
          break;
        case 'reveal':
          this.audio.dread(true, 0.5);
          await this._say({ text: ev.text });
          this.audio.dread(false);
          break;
        case 'sign':
          if (ev.check === 'arm') {
            await scene?.armIn?.();
          } else if (ev.check === 'pulse_rate' || ev.check === 'pulse_depth' || ev.check === 'rest') {
            await scene?.feelPulse?.(ev.check, ev);
          } else if ((ev.check === 'tongue' || ev.check === 'mirror') && this.scenes.name === 'exam') {
            this.audio.play('shutter', { open: true, small: true });
          }
          // в комнате (табурет, лавка) отверстий ставня нет: то, что увидено или нащупано, — строкой на сцене;
          // за проверку заплачено — результат виден сразу, не только на доске
          if (ev.text && this.scenes.name === 'room') await this._say({ text: ev.text });
          break;
        case 'lamp': this.audio.play('sputter'); break;
        case 'self': await this._say({ text: ev.text }); break;
        case 'candle':
          if (ev.lit === false) {
            // огарок догорел, когда визит кончился: дальше — в темноте (вид уже знает: lamp.candle = false)
            this.audio.play('sputter'); this.audio.dread(true, 0.35);
            await this.scenes.update(this.view(), []);
            if (ev.text) await this._say({ text: ev.text });
            break;
          }
          this.audio.play('bolt', { open: true }); this.audio.play('sputter'); this.audio.dread(false);
          if (ev.text) await this._say({ text: ev.text });
          break;
        case 'ambience': {
          if (ev._done) { if (ev.text) await this._say({ text: ev.text }); break; }
          this.applyAmbience(ev, v.night);
          if (ev.text) await this._say({ text: ev.text });
          break;
        }
        default: break; // phase, rule, note, board, ledger, card — из вида
      }
    }
  }

  async _sound(ev, v) {
    const s = ev.sound;
    if (s === 'knock') {
      const k = knockFromData(ev.knock || this.game.view().nightView?.knock?.data);
      const scene = this.scenes.current;
      if (this.audio.cricketsSilent) { this.audio.silenceCrickets(false); await this.sleep(1500); }
      if (k.windStops && !this.game.view().nightView?.ambience) { this.audio.ambience({ wind: 0.04 }, 1.2); this.memo.windDown = true; await this.sleep(1400); }
      if (scene?.knock) await scene.knock({ ...k, silhouette: ev.image, text: ev.text });
      else await this.sleep(this.audio.knock(k) * 1000);
      if (ev.text && !ev.replay) await this._say({ text: ev.text });
      return;
    }
    if (s === 'crickets' || s === 'rain' || s === 'wind') { this.audio.ambience(AMBIENCE_BY_NIGHT[v.night] || AMBIENCE_BY_NIGHT[1]); return; }
    if (s === 'crickets_stop') { this.audio.silenceCrickets(true); return; }
    if (s === 'hatch_close' && !this.batchSilent && !this.dark) {
      setTimeout(() => this.audio.steps({ n: 4, gap: 0.7, approach: false, wet: v.night === 2 }), 600 * this.speed);
    }
    if (s === 'hatch_close' || s === 'door_bolt') {
      // гость ушёл — сверчки и ветер понемногу возвращаются
      if (this.audio.cricketsSilent) setTimeout(() => this.audio.silenceCrickets(false), 2500 * this.speed);
      if (this.memo.windDown && !v.nightView?.ambience) { this.memo.windDown = false; setTimeout(() => this.audio.ambience(AMBIENCE_BY_NIGHT[v.night] || {}, 5), 3000 * this.speed); }
    }
    const m = SOUND_MAP[s];
    if (m) this.audio.play(m[0], m[1]);
    else this.audio.play(s);
  }

  /** Отладка: показать экран по имени поверх текущего вида (для снимков). */
  async jump(name, opts = {}) {
    if (!SCREENS[name]) throw new Error('no screen ' + name + '; available: ' + Object.keys(SCREENS).join(', '));
    this.closeTransient();
    if (opts.oil != null) this.setOil(opts.oil);
    this.atTitle = name === 'title';
    this.forced = name === screenOf(this.game.view()) || name === 'title' ? null : name;
    await this.scenes.go(name, this.view(), { instant: opts.instant !== false });
  }

  setOil(n) {
    this.game.debugSetOil(n);
    this.oilShown = this.oil;
    this.scenes.update(this.view(), []);
    this.game.save();
  }
}

const shell = new Shell();
shell.boot().catch((e) => {
  console.error(e);
  const msg = document.createElement('div');
  msg.id = 'boot-error';
  msg.textContent = t('boot.error', { MSG: e.message });
  Object.assign(msg.style, { position: 'fixed', left: '20px', bottom: '20px', color: '#a77', font: '14px serif' });
  document.body.append(msg);
});
