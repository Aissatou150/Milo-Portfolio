/* Scènes animées du portfolio : chaque scène est un bloc haut dont le contenu reste
   épinglé à l'écran. Le défilement donne une progression p (0 à 1) à la scène,
   lissée pour que tout glisse sans à-coup. Aucune dépendance externe. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  const NS = 'http://www.w3.org/2000/svg';
  const mk = (tag, attrs = {}, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.append(e); return e; };
  const rng = seed => { let s = seed; return () => (s = s * 16807 % 2147483647) / 2147483647; };
  const S = {};

  /* ---------- Valeurs : éléments dessinés par le code ---------- */
  (function values() {
    const g = $('#dots-grid');
    if (g) {
      const og = mk('g', { 'clip-path': 'url(#lensclip)' }, g.parentNode);
      for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++) {
        const a = { cx: 36 + c * 37, cy: 38 + r * 42, r: 7 };
        mk('circle', { ...a, class: 'v-dot' }, g); mk('circle', { ...a, class: 'v-dot-on' }, og);
      }
    }
    const jg = $('#join-g'), R = rng(7);
    if (jg) {
      for (let i = 0; i < 9; i++) {
        const a = i / 9 * Math.PI * 2;
        const c = mk('circle', { cx: (120 + Math.cos(a) * 56).toFixed(1), cy: (80 + Math.sin(a) * 56).toFixed(1), r: 9, class: 'v-join' }, jg);
        c.style.setProperty('--x', ((R() - .5) * 160).toFixed(0) + 'px'); c.style.setProperty('--y', ((R() - .5) * 110).toFixed(0) + 'px');
      }
      mk('circle', { cx: 120, cy: 80, r: 12, fill: '#f2e9d4' }, jg);
    }
  })();

  /* ---------- Passage 1 : montée de nuages ---------- */
  function cloudBand(g, color, y0, seed, big) {
    const r = rng(seed);
    for (let x = -150; x < 1750; x += big ? 200 : 250) {
      const n = 4 + Math.floor(r() * 3);
      for (let i = 0; i < n; i++) mk('circle', { cx: x + r() * 230, cy: y0 + (r() - .5) * 70, r: 70 + big * 15 + r() * 70, fill: color }, g);
    }
    mk('rect', { x: -300, y: y0 + 20, width: 2200, height: 2600, fill: color }, g);
  }
  S.clouds = {
    init() {
      const svg = $('#cloudsvg'); this.layers = [];
      ['#aab38f', '#d9ceb0', '#f2e9d4'].forEach((c, i) => { const g = mk('g', {}, svg); cloudBand(g, c, 80 + i * 10, 11 + i * 7, i); this.layers.push({ g, lead: [.25, .12, 0][i] }); });
      this.milo = $('#miloFly'); this.txt = $('#cloudTxt');
    },
    update(p) {
      this.layers.forEach((L, i) => { const t = clamp(p * (1 + L.lead)); L.g.setAttribute('transform', `translate(${Math.sin(p * 4 + i) * 40} ${lerp(1000, -2750, t)})`); });
      this.milo.style.transform = `translateY(${lerp(innerHeight * .85, -innerHeight * .65, p)}px) rotate(${Math.sin(p * 9) * 8}deg)`;
      this.txt.style.opacity = clamp(1 - Math.abs(p - .5) / .2);
    }
  };

  /* ---------- Toboggan en nuages ---------- */
  S.tobo = {
    live: true, parts: [], last: 0, lp: -1,
    init(el) {
      this.rail = $('#rail'); this.L = this.rail.getTotalLength(); this.rider = $('#rider'); this.cv = $('#tbfx'); this.ctx = this.cv.getContext('2d');
      const R = rng(3), gp = $('#tbpuffs'); this.puffs = [];
      for (let i = 0; i < 84; i++) {
        const t = i / 83, pt = this.rail.getPointAtLength(this.L * t), base = 24 + R() * 26;
        const c = mk('circle', { r: base, fill: i % 3 ? '#f2e9d4' : '#fff7e6', opacity: 0 }, gp);
        this.puffs.push({ c, t, x: pt.x + (R() - .5) * 20, y: pt.y + (R() - .5) * 20 });
      }
      const mc = $('#mcloud'); [[-44, 14, 26], [0, 20, 34], [44, 14, 26], [-16, 6, 24], [18, 4, 26]].forEach(a => mk('circle', { cx: a[0], cy: a[1], r: a[2], fill: '#f2e9d4' }, mc));
      this.bg = []; const bg = $('#tbbg');
      for (let i = 0; i < 9; i++) {
        const g = mk('g', { opacity: .16 + R() * .26 }, bg); const w = 70 + R() * 60;
        [[0, 0, w * .8], [w * .7, -20, w], [w * 1.5, 0, w * .75], [w * .8, 22, w * .9]].forEach(a => mk('circle', { cx: a[0], cy: a[1], r: a[2] * .45, fill: '#f2e9d4' }, g));
        this.bg.push({ g, x: R() * 1500, y: 60 + R() * 880, sp: .4 + R() * 1.1 });
      }
      const wd = $('#tbwind');
      for (let i = 0; i < 16; i++) { const x = 400 + R() * 1000, y = 40 + R() * 920, l = 70 + R() * 150; const ln = mk('line', { x1: x, y1: y, x2: x + l, y2: y, class: 'wind' }, wd); ln.style.animationDuration = (2.2 + R() * 3) + 's'; ln.style.animationDelay = (-R() * 5) + 's'; }
      this.resize(el);
    },
    resize() { this.cv.width = this.cv.clientWidth; this.cv.height = this.cv.clientHeight; },
    update(p, el, now) {
      const dt = Math.min(50, now - (this.last || now)); this.last = now;
      this.puffs.forEach(pf => {
        const age = p - pf.t, s = age < 0 ? 0 : Math.min(1, age * 16) * (1 - clamp((age - .22) * 2, 0, .6));
        pf.c.setAttribute('transform', `translate(${pf.x} ${pf.y}) scale(${s.toFixed(3)})`); pf.c.setAttribute('opacity', age < 0 ? 0 : (1 - clamp((age - .3) * 1.6, 0, .6)).toFixed(2));
      });
      const a = this.rail.getPointAtLength(this.L * p), b = this.rail.getPointAtLength(Math.min(this.L, this.L * p + 2));
      this.rider.setAttribute('transform', `translate(${a.x} ${a.y}) rotate(${clamp(Math.atan2(b.y - a.y, b.x - a.x) * 57.3 * .35, -25, 25)})`);
      this.bg.forEach(c => c.g.setAttribute('transform', `translate(${(((c.x - p * c.sp * 900 - now * .012 * c.sp) % 1500) + 1500) % 1500 - 300} ${c.y})`));
      if (reduce) return;
      const rr = this.rider.getBoundingClientRect(), st = this.cv.getBoundingClientRect();
      if (Math.abs(p - this.lp) > .0002 && this.lp >= 0) for (let i = 0; i < 3; i++) this.parts.push({ x: rr.left + rr.width * (.3 + Math.random() * .3) - st.left, y: rr.top + rr.height * (.5 + Math.random() * .4) - st.top, vx: -1.2 - Math.random() * 1.8, vy: (Math.random() - .5) * 1.4, l: 0, m: 700 + Math.random() * 600, s: 4 + Math.random() * 7, k: i % 2 ? 'star' : 'puff' });
      this.lp = p;
      const c = this.ctx; c.clearRect(0, 0, this.cv.width, this.cv.height);
      this.parts = this.parts.filter(q => (q.l += dt) < q.m);
      this.parts.forEach(q => {
        q.x += q.vx * dt / 16; q.y += q.vy * dt / 16; const k = 1 - q.l / q.m; c.globalAlpha = k * .9;
        if (q.k === 'puff') { c.fillStyle = '#f2e9d4'; c.beginPath(); c.arc(q.x, q.y, q.s * (2 - k), 0, 6.283); c.fill(); }
        else { c.fillStyle = k > .5 ? '#ffd28a' : '#ff8a3d'; c.beginPath(); for (let i = 0; i < 8; i++) { const r = i % 2 ? q.s * .35 : q.s * 1.6, an = i / 8 * 6.283 - 1.57; c.lineTo(q.x + Math.cos(an) * r, q.y + Math.sin(an) * r); } c.closePath(); c.fill(); }
      });
      c.globalAlpha = 1;
    }
  };

  /* ---------- Ma force : la foule se laisse convaincre ---------- */
  S.force = {
    init() {
      const g = $('#crowd'), R = rng(5); this.pp = [];
      for (let r = 0; r < 5; r++) for (let c = 0; c < 8; c++) {
        const x = 392 + c * 38, y = 392 + r * 36, gg = mk('g', { class: 'pp' }, g);
        mk('circle', { cx: x, cy: y - 12, r: 8 }, gg); mk('rect', { x: x - 10, y: y - 3, width: 20, height: 22, rx: 9 }, gg); this.pp.push(gg);
      }
      this.rank = this.pp.map((_, i) => i).sort(() => R() - .5).map((v, i) => [v, i]).reduce((a, [v, i]) => (a[v] = i, a), []);
      this.n = $('#convN'); this.c = -1;
    },
    update(p) {
      const c = Math.floor(clamp((p - .1) / .72) * 40.999);
      if (c === this.c) return; this.c = c;
      this.pp.forEach((e, i) => e.classList.toggle('on', this.rank[i] < c)); this.n.textContent = c;
    }
  };

  /* ---------- Passage 2 : Milo court vers son axe ---------- */
  function hillPath(base, amp, wl, ph) {
    let d = `M0 900 L0 ${base}`;
    for (let x = 0; x <= 3600; x += 40) d += ` L${x} ${(base + amp * Math.sin(x / wl * 6.283 + ph) + amp * .4 * Math.sin(x / wl * 15 + ph * 2)).toFixed(1)}`;
    return d + ' L3600 900 Z';
  }
  S.run = {
    init() {
      mk('path', { d: hillPath(560, 70, 700, 1), fill: '#3b4a31' }, $('#hill1')); mk('path', { d: hillPath(640, 80, 520, 3), fill: '#2f3b27' }, $('#hill2')); mk('path', { d: hillPath(700, 50, 380, 5), fill: '#273221' }, $('#hill3'));
      this.h = [$('#hill1'), $('#hill2'), $('#hill3')]; this.ground = $('#ground'); this.runner = $('#runner'); this.flag = $('#flag'); this.A = $('#runA'); this.B = $('#runB');
    },
    update(p) {
      [500, 900, 1500].forEach((k, i) => this.h[i].setAttribute('transform', `translate(${-p * k} 0)`));
      this.ground.style.strokeDashoffset = p * 2600;
      const w = p * 150; this.runner.setAttribute('transform', `translate(0 ${(Math.sin(w) * 10).toFixed(1)}) rotate(${(Math.sin(w * .5) * 3).toFixed(1)} 510 700)`);
      this.flag.setAttribute('transform', `translate(${lerp(1900, 1040, ease(clamp((p - .3) / .6)))} 0)`);
      this.A.style.opacity = 1 - clamp((p - .38) / .12); this.B.style.opacity = clamp((p - .46) / .12);
    }
  };

  /* ---------- Mon axe : les tâches se rangent ---------- */
  S.axe = {
    tasks: [['Livrer la première version de l\'assistant', 0], ['Rédiger le rapport de projet', 1], ['Apprendre la méthode de Fay-Herriot', 1], ['Répondre aux e-mails', 2], ['Préparer la soutenance', 0], ['Réviser l\'anglais', 1], ['Faire défiler les réseaux', 3], ['Refaire une figure déjà validée', 3]],
    init() {
      this.board = $('#board'); const R = rng(21); this.items = [];
      const slot = [0, 0, 0, 0];
      this.tasks.forEach(([txt, q], i) => {
        const d = document.createElement('div'); d.className = 'task q' + q; d.textContent = txt; this.board.append(d);
        this.items.push({ d, q, slot: slot[q]++, sx: .12 + R() * .4, sy: .18 + R() * .5, rot: (R() - .5) * 30 });
      });
      this.qs = $$('.q', this.board);
    },
    update(p) {
      const W = this.board.clientWidth, fs = Math.max(10, W * .027), sh = fs * 2.9, lh = fs * 2.6;
      this.items.forEach((it, i) => {
        const t = ease(clamp((p - .1 - i * .045) / .4));
        const fx = (it.q % 2) * W / 2 + W * .03, fy = Math.floor(it.q / 2) * W / 2 + lh + it.slot * (sh + 6);
        it.d.style.fontSize = fs + 'px'; it.d.style.minHeight = sh + 'px';
        it.d.style.transform = `translate(${lerp(it.sx * W, fx, t).toFixed(1)}px,${lerp(it.sy * W, fy, t).toFixed(1)}px) rotate(${lerp(it.rot, 0, t).toFixed(1)}deg)`;
        it.d.classList.toggle('s', t > .97);
      });
      this.qs.forEach(q => { q.style.opacity = clamp((p - .5) / .2); q.style.fontSize = fs + 'px'; });
    }
  };

  /* ---------- Passage 3 : la mer ---------- */
  S.sea = {
    live: true,
    init() { this.w = [0, 1, 2, 3].map(i => $('#w' + i)); this.surfer = $('#surfer'); this.txt = $('#seaTxt'); this.A = [26, 34, 30, 18]; this.WL = [520, 420, 360, 600]; },
    y(i, x, lvl, ph) { return lvl + this.A[i] * Math.sin(x / this.WL[i] * 6.283 + ph * (1 + i * .3)) + this.A[i] * .5 * Math.sin(x / (this.WL[i] * .55) * 6.283 + ph * 1.3); },
    update(p, el, now) {
      const ph = now / 900, lv = [];
      this.w.forEach((path, i) => {
        const t = clamp(p * 1.12 - i * .05), lvl = lerp(1000 + i * 40, -330 - i * 20, ease(t)); lv.push(lvl);
        let d = `M-100 1800 L-100 ${this.y(i, -100, lvl, ph).toFixed(1)}`;
        for (let x = -60; x <= 1700; x += 40) d += ` L${x} ${this.y(i, x, lvl, ph).toFixed(1)}`;
        path.setAttribute('d', d + ' L1700 1800 Z');
      });
      const x = 900, y0 = this.y(1, x, lv[1], ph), sl = (this.y(1, x + 14, lv[1], ph) - this.y(1, x - 14, lv[1], ph)) / 28;
      this.surfer.setAttribute('transform', `translate(${x} ${y0 - 36}) rotate(${(Math.atan(sl) * 57.3 * .8).toFixed(1)})`);
      this.txt.style.opacity = clamp(1 - Math.abs(p - .55) / .22);
    }
  };

  /* ---------- CV : il s'ouvre en pleine page ---------- */
  S.cv = {
    init(el) { this.wrap = $('#docWrap'); this.img = $('#docImg'); this.title = $('#docTitle'); this.dl = $('#docDl'); this.img.addEventListener('load', () => this.resize(el)); this.resize(el); },
    resize(el) {
      if (reduce) return; const vh = innerHeight, ih = this.img.offsetHeight || this.wrap.offsetWidth * 1.294;
      this.dg = vh * .9; this.travel = Math.max(0, ih - vh); this.dw = vh * .5;
      el.style.height = (vh + this.dg + this.travel + this.dw) + 'px';
    },
    update(p) {
      const D = this.dg + this.travel + this.dw, px = p * D, u = clamp(px / this.dg), v = this.travel ? clamp((px - this.dg) / this.travel) : 0, e = ease(u);
      this.wrap.style.transform = `translate(-50%, ${lerp(innerHeight * .5, 0, e) - v * this.travel}px) rotateX(${lerp(28, 0, e)}deg) rotateZ(${lerp(-5, 0, e)}deg) scale(${lerp(.36, 1, e)})`;
      this.title.style.opacity = clamp(1 - e * 1.8); this.title.style.transform = `translateY(${-e * 50}px)`;
      this.dl.classList.toggle('on', u >= 1);
    }
  };

  /* ---------- LinkedIn : on parcourt le profil en défilant ---------- */
  S.li = {
    n: 0,
    init(el) { this.strip = $('#liStrip'); this.frame = $('#liFrame'); this.title = $('#liTitle'); this.count = $('#liCount'); this.load(el); },
    async load(el) {
      const imgs = [];
      for (let i = 1; i <= 12; i++) {
        let ok = null;
        for (const ext of ['png', 'jpg', 'webp']) { ok = await new Promise(r => { const im = new Image(); im.onload = () => r(im); im.onerror = () => r(null); im.src = `assets/linkedin/profil-${i}.${ext}`; }); if (ok) break; }
        if (!ok) break; imgs.push(ok);
      }
      if (imgs.length) { imgs.forEach((im, i) => { im.alt = `Capture ${i + 1} du profil LinkedIn d'Aïssatou Gueye`; this.strip.append(im); }); this.n = imgs.length; }
      else {
        for (let i = 1; i <= 4; i++) this.strip.insertAdjacentHTML('beforeend', `<div class="li-ph"><span class="no">${i}</span><div class="ban"></div><div class="av"></div><h4>Aïssatou Gueye</h4><p>Data Analyst et statisticienne</p><p>Marseille · ENSAE Dakar · Aix-Marseille Université</p><div class="sk"></div><div class="sk s"></div><div class="sk"></div></div>`);
        this.n = 4;
      }
      this.resize(el);
    },
    resize(el) {
      if (reduce) return; const vh = innerHeight, winH = this.frame.clientHeight - 38;
      this.dg = vh * .8; this.travel = Math.max(0, this.strip.offsetHeight - winH); this.dw = vh * .45;
      el.style.height = (vh + this.dg + this.travel + this.dw) + 'px';
    },
    update(p) {
      if (this.travel === undefined) return;
      const D = this.dg + this.travel + this.dw, px = p * D, u = clamp(px / this.dg), v = this.travel ? clamp((px - this.dg) / this.travel) : 0, e = ease(u);
      this.frame.style.transform = `translateY(${lerp(innerHeight * .62, 0, e)}px) rotateX(${lerp(24, 0, e)}deg) scale(${lerp(.7, 1, e)})`;
      this.title.style.opacity = clamp(1 - e * 1.8); this.title.style.transform = `translateY(${-e * 50}px)`;
      this.strip.style.transform = `translateY(${-v * this.travel}px)`;
      this.count.textContent = u >= 1 && this.n ? `Capture ${clamp(Math.floor(v * this.n) + 1, 1, this.n)} sur ${this.n}` : '';
    }
  };

  /* ---------- Objectifs 2027 : la route ---------- */
  S.road = {
    init() {
      this.path = $('#road'); this.L = this.path.getTotalLength(); this.r2 = $('#road2'); this.r2.style.strokeDasharray = this.L; this.milo = $('#roadMilo'); this.goals = $$('.goal');
      this.ts = [.12, .38, .66, .93]; this.flags = this.ts.map(t => { const pt = this.path.getPointAtLength(this.L * t), g = mk('g', {}, $('#flags')); mk('line', { x1: 0, y1: 0, x2: 0, y2: -78, stroke: '#f2e9d4', 'stroke-width': 5 }, g); mk('path', { d: 'M0 -78 L56 -64 L0 -50 Z', fill: '#ff8a3d' }, g); return { g, x: pt.x, y: pt.y }; });
    },
    update(p) {
      this.r2.style.strokeDashoffset = this.L * (1 - p);
      const pt = this.path.getPointAtLength(this.L * p); this.milo.setAttribute('transform', `translate(${pt.x} ${pt.y + Math.sin(p * 90) * 4})`);
      this.flags.forEach((f, i) => { const s = clamp((p - this.ts[i] + .05) * 18); f.g.setAttribute('transform', `translate(${f.x} ${f.y}) scale(${s})`); this.goals[i].classList.toggle('on', p >= this.ts[i] - .04); });
    }
  };

  /* ---------- Moteur : progression lissée de chaque scène ---------- */
  const scenes = $$('[data-scene]').map(el => {
    const def = S[el.dataset.scene]; if (def && def.init) def.init(el);
    return { el, def, cur: 0, target: 0, veil: $('.veil', el) };
  }).filter(s => s.def);
  const instant = new URLSearchParams(location.search).has('nosmooth');   // mode de test : pas de lissage
  let raf = 0, lastT = 0;
  function frame(now) {
    raf = 0; let busy = false;
    const k = 1 - Math.exp(-Math.min(200, now - (lastT || now - 16)) / 120); lastT = now;
    for (const sc of scenes) {
      const r = sc.el.getBoundingClientRect();
      if (r.bottom < -100 || r.top > innerHeight + 100) continue;
      sc.target = clamp(-r.top / Math.max(1, r.height - innerHeight));
      if (reduce) sc.cur = .62; else if (instant) sc.cur = sc.target; else { const d = sc.target - sc.cur; sc.cur = Math.abs(d) < .0004 ? sc.target : sc.cur + d * k; if (Math.abs(d) > .0004) busy = true; }
      sc.def.update(sc.cur, sc.el, now);
      if (sc.veil) sc.veil.style.opacity = reduce ? 0 : clamp((sc.cur - .9) / .1);
      if (sc.def.live) busy = true;
    }
    if (busy && !reduce) raf = requestAnimationFrame(frame);
  }
  const kick = () => { if (!raf) raf = requestAnimationFrame(frame); };
  addEventListener('scroll', kick, { passive: true });
  addEventListener('resize', () => { scenes.forEach(s => s.def.resize && s.def.resize(s.el)); kick(); });
  addEventListener('load', () => { scenes.forEach(s => s.def.resize && s.def.resize(s.el)); kick(); });
  kick();
})();
