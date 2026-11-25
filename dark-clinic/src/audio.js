// Звук — только синтез WebAudio, без файлов.
// Правила (DESIGN §10): на приёме нет музыки; пугает подход — стук, шаги; пик — когда смолкают
// сверчки; скримеров нет. Поэтому здесь нет резких громких «ударов» — самое громкое здесь стук.
//
// Запуск — после первого щелчка (политика автозапуска браузера); до этого вызовы копятся
// только для фона (ambience), одиночные звуки до разблокировки молча пропускаются.

const MUTE_KEY = 'night-reception-mute';

export class Audio {
  constructor() {
    this.ctx = null;
    this.muted = false;
    try { this.muted = localStorage.getItem(MUTE_KEY) === '1'; } catch { /* приватное окно */ }
    this.log = [];          // последние звуки — для отладки и критиков в безголовом браузере
    this.beds = {};         // постоянные фоны
    this.want = { crickets: 0, rain: 0, wind: 0, hiss: 0 };
    this.pulseTimer = null;
    this.cricketTimer = null;
    this.dreadNodes = null;
  }

  get ready() { return !!this.ctx && this.ctx.state === 'running'; }

  /** Вызывать из обработчика щелчка. */
  unlock() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      const ctx = new AC();
      this.ctx = ctx;
      this.master = ctx.createGain();
      this.master.gain.value = this.muted ? 0 : 0.9;
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -14; comp.knee.value = 12; comp.ratio.value = 3;
      this.master.connect(comp).connect(ctx.destination);
      this.dry = ctx.createGain(); this.dry.connect(this.master);
      this.verb = ctx.createConvolver();
      this.verb.buffer = this._impulse(1.4, 2.8);
      this.verbGain = ctx.createGain(); this.verbGain.gain.value = 0.32;
      this.verb.connect(this.verbGain).connect(this.master);
      this.noise = this._noiseBuffer(4);
      this._applyAmbience(0.01);
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
  }

  setMuted(m) {
    this.muted = !!m;
    try { localStorage.setItem(MUTE_KEY, this.muted ? '1' : '0'); } catch { /* */ }
    if (this.master) this.master.gain.setTargetAtTime(this.muted ? 0 : 0.9, this.ctx.currentTime, 0.08);
  }
  toggleMute() { this.setMuted(!this.muted); return this.muted; }

  _note(name, params) {
    this.log.push({ name, at: Math.round(performance.now()), ...(params || {}) });
    if (this.log.length > 40) this.log.shift();
  }

  // ── вспомогательное ────────────────────────────────────────────────────────────────
  _noiseBuffer(sec) {
    const ctx = this.ctx, n = Math.floor(ctx.sampleRate * sec);
    const b = ctx.createBuffer(1, n, ctx.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    return b;
  }
  _impulse(sec, decay) {
    const ctx = this.ctx, n = Math.floor(ctx.sampleRate * sec);
    const b = ctx.createBuffer(2, n, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = b.getChannelData(c);
      for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, decay) * (i < 90 ? i / 90 : 1);
    }
    return b;
  }
  _out(node, { verb = 0.3, pan = 0 } = {}) {
    let last = node;
    if (pan && this.ctx.createStereoPanner) { const p = this.ctx.createStereoPanner(); p.pan.value = pan; last.connect(p); last = p; }
    last.connect(this.dry);
    if (verb) { const s = this.ctx.createGain(); s.gain.value = verb; last.connect(s).connect(this.verb); }
  }
  _noiseSrc(loop = true) {
    const s = this.ctx.createBufferSource(); s.buffer = this.noise; s.loop = loop;
    s.loopStart = 0; s.loopEnd = this.noise.duration;
    return s;
  }
  _env(gainNode, t, a, peak, d) {
    const g = gainNode.gain;
    g.setValueAtTime(0.0001, t);
    g.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + a);
    g.exponentialRampToValueAtTime(0.0001, t + a + d);
  }
  _tone(type, f0, f1, t, a, peak, d, opts) {
    const ctx = this.ctx;
    const o = ctx.createOscillator(); o.type = type;
    o.frequency.setValueAtTime(f0, t);
    if (f1 && f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + a + d);
    const g = ctx.createGain(); this._env(g, t, a, peak, d);
    o.connect(g); this._out(g, opts);
    o.start(t); o.stop(t + a + d + 0.05);
    return o;
  }
  _burst(t, dur, peak, filt, opts = {}) {
    const ctx = this.ctx;
    const s = this._noiseSrc(false);
    const f = ctx.createBiquadFilter(); f.type = filt.type || 'bandpass'; f.frequency.value = filt.f; f.Q.value = filt.q ?? 1;
    if (filt.f1) f.frequency.exponentialRampToValueAtTime(filt.f1, t + dur);
    const g = ctx.createGain(); this._env(g, t, opts.attack ?? 0.003, peak, dur);
    s.connect(f).connect(g); this._out(g, opts);
    const off = Math.random() * (this.noise.duration - dur - 0.2);
    s.start(t, Math.max(0, off), dur + 0.1);
  }

  // ── одиночные звуки ─────────────────────────────────────────────────────────────────
  /** Общий вход по имени: play('coin'), play('knock', {count:3, rhythm:'slow'}). */
  play(name, p = {}) {
    const fn = {
      knock: () => this.knock(p), paper: () => this.paper(p), coin: () => this.coin(p), drawer: () => this.drawer(p),
      bolt: () => this.bolt(p), steps: () => this.steps(p), sputter: () => this.sputter(p), pulse: () => this.pulse(p),
      shutter: () => this.shutter(p), creak: () => this.creak(p), pour: () => this.pour(p), clink: () => this.clink(p),
    }[name];
    if (!fn) { this._note(name, { unknown: true }); return 0; }
    return fn();
  }

  static rhythm(r, count) {
    if (Array.isArray(r)) return r;
    const base = { slow: 1.15, even: 0.62, quick: 0.27, hesitant: 0.9 }[r] ?? 0.62;
    const out = [];
    for (let i = 0; i < count - 1; i++) {
      if (r === 'hesitant') out.push(i % 2 ? 0.35 : 1.2);
      else out.push(base * (r === 'slow' ? 1 : 0.93 + Math.random() * 0.14));
    }
    return out;
  }

  /** Стук в ставень. count, rhythm: 'slow'|'even'|'quick'|'hesitant'|[секунды между ударами], strength 0..1.
   *  Возвращает длительность в секундах. */
  knock({ count = 3, rhythm = 'even', strength = 0.8, where = 'shutter', delay = 0 } = {}) {
    strength = Number.isFinite(+strength) ? +strength : 0.75; count = Math.max(1, Math.round(+count || 1));
    const gaps = Audio.rhythm(rhythm, count);
    const total = delay + gaps.reduce((a, b) => a + b, 0) + 0.4;
    this._note('knock', { count, rhythm, strength, where });
    if (!this.ready) return total;
    let t = this.ctx.currentTime + 0.02 + delay;
    const heavy = where === 'door';
    for (let i = 0; i < count; i++) {
      const s = strength * (0.9 + Math.random() * 0.15);
      this._tone('sine', heavy ? 78 : 104, heavy ? 52 : 66, t, 0.002, 0.95 * s, heavy ? 0.26 : 0.17, { verb: 0.45 });
      this._tone('triangle', heavy ? 160 : 228, heavy ? 120 : 170, t, 0.001, 0.32 * s, 0.07, { verb: 0.3 });
      this._burst(t, 0.035, 0.55 * s, { f: heavy ? 600 : 1050, q: 1.3 }, { verb: 0.35 });
      this._burst(t + 0.004, 0.09, 0.12 * s, { type: 'lowpass', f: 380 }, { verb: 0.5 });
      if (i < count - 1) t += gaps[i];
    }
    return total;
  }

  /** Шаги снаружи по мокрой или сухой земле: n шагов, приближаются или уходят. */
  steps({ n = 5, gap = 0.62, approach = true, wet = false } = {}) {
    this._note('steps', { n, approach });
    if (!this.ready) return n * gap;
    let t = this.ctx.currentTime + 0.02;
    for (let i = 0; i < n; i++) {
      const k = approach ? (i + 1) / n : 1 - i / n;
      this._burst(t, 0.09, 0.05 + 0.18 * k, { type: 'lowpass', f: wet ? 900 : 520, q: 0.7 }, { verb: 0.2, pan: 0.3 * (1 - k) });
      this._burst(t + 0.03, 0.05, (0.02 + 0.06 * k) * (wet ? 1.6 : 1), { f: wet ? 2600 : 1800, q: 2 }, { verb: 0.1 });
      t += gap * (0.92 + Math.random() * 0.16);
    }
    return n * gap;
  }

  paper({ soft = false } = {}) {
    this._note('paper', { soft });
    if (!this.ready) return 0.4;
    const t0 = this.ctx.currentTime + 0.01;
    const k = soft ? 0.35 : 1;
    const n = soft ? 3 : 7;
    for (let i = 0; i < n; i++) {
      const t = t0 + Math.random() * (soft ? 0.12 : 0.35);
      this._burst(t, 0.02 + Math.random() * 0.05, (0.05 + Math.random() * 0.08) * k, { type: 'highpass', f: 1800 + Math.random() * 2500, q: 0.7 }, { verb: 0.1 });
    }
    return 0.4;
  }

  coin({ count = 1 } = {}) {
    this._note('coin', { count });
    if (!this.ready) return 0.8;
    let t = this.ctx.currentTime + 0.02;
    for (let c = 0; c < count; c++) {
      const partials = [2350, 3910, 5470, 7230].map((f) => f * (0.96 + Math.random() * 0.08));
      for (let b = 0; b < 3; b++) {
        const a = [0.16, 0.08, 0.035][b];
        partials.forEach((f, i) => this._tone('sine', f, f, t, 0.001, a / (i + 1.2), 0.5 - i * 0.08 - b * 0.1, { verb: 0.2 }));
        this._burst(t, 0.02, a * 0.6, { f: 4000, q: 2 }, { verb: 0.1 });
        t += [0.14, 0.09, 0.05][b];
      }
      t += 0.25;
    }
    return count * 0.6;
  }

  drawer({ open = true } = {}) {
    this._note('drawer', { open });
    if (!this.ready) return 0.7;
    const ctx = this.ctx, t = ctx.currentTime + 0.02, dur = 0.5;
    const s = this._noiseSrc(false);
    const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 420; f.Q.value = 1.4;
    const am = ctx.createGain(); am.gain.value = 0;
    const lfo = ctx.createOscillator(); lfo.type = 'sawtooth'; lfo.frequency.value = 27;
    const lfoG = ctx.createGain(); lfoG.gain.value = 0.5;
    lfo.connect(lfoG).connect(am.gain);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.22, t + 0.08);
    g.gain.linearRampToValueAtTime(0.16, t + dur - 0.1); g.gain.linearRampToValueAtTime(0.0001, t + dur);
    s.connect(f).connect(am).connect(g); this._out(g, { verb: 0.25 });
    s.start(t, Math.random(), dur + 0.1); lfo.start(t); lfo.stop(t + dur + 0.1);
    this._tone('sine', 120, 70, t + dur, 0.002, 0.5, 0.14, { verb: 0.4 });
    this._burst(t + dur, 0.04, 0.2, { f: 700, q: 1 }, { verb: 0.3 });
    return dur + 0.2;
  }

  bolt({ open = true } = {}) {
    this._note('bolt', { open });
    if (!this.ready) return 0.6;
    const t = this.ctx.currentTime + 0.02;
    this._burst(t, 0.28, 0.12, { f: 2400, f1: open ? 1500 : 3200, q: 5 }, { verb: 0.25 });
    this._burst(t, 0.28, 0.05, { f: 600, q: 1 }, { verb: 0.2 });
    const tc = t + 0.3;
    [1820, 2960, 4410].forEach((f, i) => this._tone('sine', f, f * 0.99, tc, 0.001, 0.12 / (i + 1), 0.22, { verb: 0.35 }));
    this._tone('sine', 140, 90, tc, 0.001, 0.4, 0.12, { verb: 0.3 });
    return 0.6;
  }

  /** Заслонка в ставне: дерево по дереву. */
  shutter({ open = true, small = false, heavy = false } = {}) {
    this._note('shutter', { open, small, heavy });
    if (!this.ready) return 0.4;
    const t = this.ctx.currentTime + 0.02;
    const k = small ? 0.6 : heavy ? 1.4 : 1;
    this._burst(t, 0.18 * k, 0.12 * k, { f: (open ? 700 : 500) / k, f1: (open ? 400 : 800) / k, q: 2 }, { verb: 0.2 });
    this._tone('sine', 150 / k, 95 / k, t + 0.18 * k, 0.002, 0.35 * Math.min(1.2, k), 0.1 * k, { verb: 0.35 });
    return 0.35 * k;
  }

  /** Дверь на лестницу: сухой скрип петли. */
  creak() {
    this._note('creak');
    if (!this.ready) return 0.9;
    const ctx = this.ctx, t = ctx.currentTime + 0.02, dur = 0.8;
    const o = ctx.createOscillator(); o.type = 'sawtooth';
    o.frequency.setValueAtTime(190, t);
    for (let i = 1; i < 10; i++) o.frequency.linearRampToValueAtTime(150 + Math.random() * 120, t + (dur * i) / 10);
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 900; bp.Q.value = 6;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.06, t + 0.1);
    g.gain.linearRampToValueAtTime(0.04, t + dur - 0.2); g.gain.linearRampToValueAtTime(0.0001, t + dur);
    o.connect(bp).connect(g); this._out(g, { verb: 0.4, pan: 0.4 });
    o.start(t); o.stop(t + dur + 0.05);
    return dur;
  }

  /** Вода в чашку или полоскание. */
  pour({ short = false } = {}) {
    this._note('pour', { short });
    if (!this.ready) return 0.8;
    const t0 = this.ctx.currentTime + 0.02;
    const dur = short ? 0.5 : 1.1;
    this._burst(t0, dur, 0.06, { type: 'bandpass', f: 1400, q: 0.8 }, { verb: 0.2, attack: 0.05 });
    for (let i = 0; i < (short ? 8 : 18); i++) {
      const t = t0 + Math.random() * dur, f = 500 + Math.random() * 900;
      this._tone('sine', f, f * 1.6, t, 0.003, 0.03, 0.04, { verb: 0.25 });
    }
    return dur;
  }

  /** Чашки весов звякнули. */
  clink() {
    this._note('clink');
    if (!this.ready) return 0.5;
    const t = this.ctx.currentTime + 0.02;
    [1320, 2210, 3170].forEach((f, i) => this._tone('sine', f, f, t + i * 0.01, 0.001, 0.05 / (i + 1), 0.5, { verb: 0.3 }));
    return 0.5;
  }

  /** Фитиль трещит — когда жжёшь масло. */
  sputter() {
    this._note('sputter');
    if (!this.ready) return 0.3;
    const t = this.ctx.currentTime + 0.01;
    for (let i = 0; i < 4; i++) this._burst(t + Math.random() * 0.25, 0.012, 0.05 + Math.random() * 0.06, { type: 'highpass', f: 3000, q: 0.5 }, { verb: 0.05 });
    return 0.3;
  }

  /** Пульс под пальцами: удары с заданной частотой (в минуту) и силой 0..1. beats — сколько. */
  pulse({ bpm = 70, strength = 0.6, beats = 6, irregular = 0, strengths = null, delay = 0, gaps = null } = {}) {
    this.pulseStop();
    this._note('pulse', { bpm, strength, beats, strengths });
    const period = 60 / Math.max(20, bpm);
    if (!this.ready) return delay + beats * period;
    let t = this.ctx.currentTime + 0.05 + delay;
    for (let i = 0; i < beats; i++) {
      const s = Math.max(0.03, Math.min(1, strengths ? strengths[i] ?? strength : strength));
      this._tone('sine', 62, 44, t, 0.012, 0.85 * s, 0.13, { verb: 0.05 });
      this._tone('sine', 52, 40, t + period * 0.28, 0.012, 0.42 * s, 0.11, { verb: 0.05 });
      t += gaps ? (gaps[i] ?? period) : period * (1 + (Math.random() - 0.5) * irregular);
    }
    return gaps ? delay + gaps.slice(0, beats).reduce((a, b) => a + b, 0) : beats * period;
  }
  pulseStop() { /* удары планируются заранее и коротки — остановка не нужна */ }

  // ── фоны ────────────────────────────────────────────────────────────────────────────
  /** ambience({crickets:1, rain:0, wind:0, hiss:1}) — громкости 0..1, плавный переход. */
  ambience(levels = {}, fade = 2.5) {
    Object.assign(this.want, levels);
    this._note('ambience', { ...this.want });
    if (this.ctx) this._applyAmbience(fade);
  }
  /** Сверчки смолкают разом — это и есть страшное (§10.7). */
  silenceCrickets(on = true) {
    this.cricketsSilent = !!on;
    this._note('crickets', { silent: !!on });
    if (this.ctx) this._applyAmbience(on ? 0.25 : 6);
  }

  _applyAmbience(fade) {
    const ctx = this.ctx; const now = ctx.currentTime;
    const set = (name, level, make) => {
      if (level > 0 && !this.beds[name]) this.beds[name] = make();
      const b = this.beds[name];
      if (b) b.gain.gain.setTargetAtTime(level * b.base, now, Math.max(0.02, fade / 3));
    };
    set('rain', this.want.rain, () => this._rainBed());
    set('wind', this.want.wind, () => this._windBed());
    set('hiss', this.want.hiss, () => this._hissBed());
    set('crickets', this.cricketsSilent ? 0 : this.want.crickets, () => this._cricketBed());
  }

  _rainBed() {
    const ctx = this.ctx;
    const gain = ctx.createGain(); gain.gain.value = 0;
    const s = this._noiseSrc();
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1500; bp.Q.value = 0.5;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 5200;
    s.connect(bp).connect(lp).connect(gain);
    const s2 = this._noiseSrc();
    const lp2 = ctx.createBiquadFilter(); lp2.type = 'lowpass'; lp2.frequency.value = 300;
    const g2 = ctx.createGain(); g2.gain.value = 0.5;
    s2.connect(lp2).connect(g2).connect(gain);
    this._out(gain, { verb: 0.15 });
    s.start(); s2.start(ctx.currentTime, 1.7);
    // капли с крыши
    const drip = () => {
      if (!this.beds.rain) return;
      const lvl = this.want.rain;
      if (lvl > 0.05 && this.ready) {
        const t = ctx.currentTime + 0.01;
        const f = 900 + Math.random() * 1600;
        this._tone('sine', f, f * 0.6, t, 0.001, 0.05 * lvl, 0.05, { verb: 0.3, pan: Math.random() - 0.5 });
      }
      this.beds.rain.timer = setTimeout(drip, 120 + Math.random() * 700);
    };
    const bed = { gain, base: 0.16, timer: null };
    this.beds.rain = bed; drip();
    return bed;
  }

  _windBed() {
    const ctx = this.ctx;
    const gain = ctx.createGain(); gain.gain.value = 0;
    const s = this._noiseSrc();
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 380; lp.Q.value = 4;
    const gust = ctx.createGain(); gust.gain.value = 0.5;
    s.connect(lp).connect(gust).connect(gain);
    // свист в щели ставня
    const s2 = this._noiseSrc();
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 720; bp.Q.value = 18;
    const g2 = ctx.createGain(); g2.gain.value = 0.25;
    s2.connect(bp).connect(g2).connect(gain);
    this._out(gain, { verb: 0.2 });
    s.start(); s2.start(ctx.currentTime, 2.3);
    const bed = { gain, base: 0.5, timer: null };
    const move = () => {
      if (!this.beds.wind) return;
      const t = ctx.currentTime;
      lp.frequency.setTargetAtTime(220 + Math.random() * 520, t, 0.9);
      gust.gain.setTargetAtTime(0.2 + Math.random() * 0.8, t, 0.8);
      bp.frequency.setTargetAtTime(620 + Math.random() * 220, t, 1.2);
      bed.timer = setTimeout(move, 900 + Math.random() * 2200);
    };
    this.beds.wind = bed; move();
    return bed;
  }

  _hissBed() {
    const ctx = this.ctx;
    const gain = ctx.createGain(); gain.gain.value = 0;
    const s = this._noiseSrc();
    const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 3800;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 9000;
    s.connect(hp).connect(lp).connect(gain);
    this._out(gain, { verb: 0 });
    s.start(ctx.currentTime, 0.9);
    return { gain, base: 0.012 };
  }

  _cricketBed() {
    const ctx = this.ctx;
    const gain = ctx.createGain(); gain.gain.value = 0;
    this._out(gain, { verb: 0.35 });
    const bed = { gain, base: 0.5, timer: null };
    const voices = [
      { f: 4650, rate: 0.62, pan: -0.6, amp: 0.05 },
      { f: 4920, rate: 0.83, pan: 0.5, amp: 0.035 },
      { f: 4380, rate: 1.1, pan: 0.1, amp: 0.022 },
    ].map((v) => ({ ...v, next: ctx.currentTime + Math.random() }));
    const tick = () => {
      if (!this.beds.crickets) return;
      const now = ctx.currentTime;
      for (const v of voices) {
        while (v.next < now + 0.3) {
          const t = Math.max(v.next, now + 0.01);
          for (let k = 0; k < 3; k++) {
            const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = v.f;
            const g = ctx.createGain();
            const st = t + k * 0.045;
            g.gain.setValueAtTime(0.0001, st); g.gain.exponentialRampToValueAtTime(v.amp, st + 0.006);
            g.gain.exponentialRampToValueAtTime(0.0001, st + 0.03);
            const p = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
            if (p) { p.pan.value = v.pan; o.connect(g).connect(p).connect(gain); } else o.connect(g).connect(gain);
            o.start(st); o.stop(st + 0.04);
          }
          v.next = t + v.rate * (0.9 + Math.random() * 0.25);
        }
      }
      bed.timer = setTimeout(tick, 120);
    };
    this.beds.crickets = bed; tick();
    return bed;
  }

  /** Низкий гул для худших минут: dread(true, 0.6) — нарастает за несколько секунд; dread(false) — уходит. */
  dread(on = true, level = 0.6) {
    this._note('dread', { on, level });
    if (!this.ctx) return;
    const ctx = this.ctx, now = ctx.currentTime;
    if (on && !this.dreadNodes) {
      const gain = ctx.createGain(); gain.gain.value = 0.0001;
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 140;
      const oscs = [41, 41.6, 61.7].map((f, i) => {
        const o = ctx.createOscillator(); o.type = i === 2 ? 'sine' : 'sawtooth'; o.frequency.value = f;
        const g = ctx.createGain(); g.gain.value = i === 2 ? 0.25 : 0.35;
        o.connect(g).connect(lp); o.start(); return o;
      });
      const s = this._noiseSrc();
      const nlp = ctx.createBiquadFilter(); nlp.type = 'lowpass'; nlp.frequency.value = 180;
      const ng = ctx.createGain(); ng.gain.value = 0.6;
      s.connect(nlp).connect(ng).connect(lp);
      s.start();
      const lfo = ctx.createOscillator(); lfo.frequency.value = 0.07;
      const lfoG = ctx.createGain(); lfoG.gain.value = 50;
      lfo.connect(lfoG).connect(lp.frequency); lfo.start();
      lp.connect(gain); this._out(gain, { verb: 0.4 });
      this.dreadNodes = { gain, stop: () => { [...oscs, s, lfo].forEach((n) => n.stop(ctx.currentTime + 6)); } };
    }
    if (!this.dreadNodes) return;
    if (on) this.dreadNodes.gain.gain.setTargetAtTime(Math.max(0.0001, 0.35 * level), now, 1.6);
    else {
      const d = this.dreadNodes; this.dreadNodes = null;
      d.gain.gain.setTargetAtTime(0.0001, now, 1.2);
      d.stop();
    }
  }

  stopAll() {
    for (const [k, b] of Object.entries(this.beds)) { clearTimeout(b.timer); b.gain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.1); delete this.beds[k]; }
    this.dread(false);
  }
}
