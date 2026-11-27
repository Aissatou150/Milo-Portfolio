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

  /* ---------- Valeurs : quatre chapitres en plein écran ---------- */
  (function drawnPieces() {
    const g = $('#dots-grid');
    if (g) {
      const og = mk('g', { 'clip-path': 'url(#lensclip)' }, g.parentNode);
      for (let r = 0; r < 5; r++) for (let c = 0; c < 8; c++) {
        const a = { cx: 70 + c * 66, cy: 70 + r * 66, r: 11 };
        mk('circle', { ...a, class: 'v-dot' }, g); mk('circle', { ...a, class: 'v-dot-on' }, og);
      }
    }
    const jg = $('#join-g'), R = rng(7);
    if (jg) {
      for (let i = 0; i < 14; i++) {
        const a = i / 14 * Math.PI * 2;
        const c = mk('circle', { cx: (300 + Math.cos(a) * 130).toFixed(1), cy: (210 + Math.sin(a) * 130).toFixed(1), r: 15, class: 'v-join' }, jg);
        c.style.setProperty('--x', ((R() - .5) * 420).toFixed(0) + 'px'); c.style.setProperty('--y', ((R() - .5) * 300).toFixed(0) + 'px');
      }
      mk('circle', { cx: 300, cy: 210, r: 34, fill: '#f2e9d4' }, jg);
    }
  })();
  S.vals = {
    init(el) {
      this.ps = $$('.vp', el); this.dots = $$('.vnav button', el); this.bar = $('#vbar');
      this.dots.forEach((b, i) => b.addEventListener('click', () => scrollTo({ top: el.getBoundingClientRect().top + scrollY + (i + .5) / this.ps.length * (el.offsetHeight - innerHeight) })));
    },
    update(p) {
      const n = this.ps.length; let act = 0;
      this.ps.forEach((el, i) => {
        const l = p * n - i; let o, y;
        if (l < 0) { o = i === 0 ? 1 : 0; y = i === 0 ? 0 : 80; }
        else if (l < .14 && i > 0) { const k = l / .14; o = k; y = lerp(80, 0, ease(k)); }
        else if (l > 1) { o = 0; y = -80; }
        else if (l > .86 && i < n - 1) { const k = (l - .86) / .14; o = 1 - k; y = lerp(0, -80, ease(k)); }
        else { o = 1; y = 0; }
        el.style.opacity = o.toFixed(3); el.style.transform = `translateY(${y.toFixed(1)}px)`; el.style.setProperty('--l', clamp(l).toFixed(3));
        el.style.visibility = o > 0 ? 'visible' : 'hidden'; el.classList.toggle('on', o > .5); if (o > .5) act = i;
      });
      this.dots.forEach((d, i) => d.classList.toggle('on', i === act)); this.bar.style.width = (p * 100) + '%';
    }
  };

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

  /* ---------- Ma force : Milo convainc la foule ---------- */
  S.force = {
    init() {
      const g = $('#crowd'), R = rng(5); this.f = [];
      const rows = 5, cols = 6;
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        const sc = .8 + r * .08, x = 430 + c * 58 + (r % 2) * 14, y = 322 + r * 56;
        const f = mk('g', { class: 'face', transform: `translate(${x} ${y}) scale(${sc})` }, g);
        const inner = mk('g', { class: 'fi' }, f); inner.style.animationDelay = (-R() * 3).toFixed(2) + 's';
        mk('path', { class: 'fb', d: 'M-19 40 Q-19 16 0 16 Q19 16 19 40 Z' }, inner);
        mk('circle', { class: 'fb', r: 19 }, inner);
        mk('circle', { cx: -7, cy: -3, r: 2.6, fill: '#1d1a33' }, inner); mk('circle', { cx: 7, cy: -3, r: 2.6, fill: '#1d1a33' }, inner);
        mk('path', { class: 'm-no', d: 'M-7 10 q7 -6 14 0', fill: 'none', stroke: '#1d1a33', 'stroke-width': 2.4, 'stroke-linecap': 'round' }, inner);
        mk('path', { class: 'm-yes', d: 'M-8 5 q8 10 16 0', fill: 'none', stroke: '#1d1a33', 'stroke-width': 2.4, 'stroke-linecap': 'round' }, inner);
        mk('path', { class: 'sp', d: 'M0 -34 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3z', fill: '#ffd28a' }, f);
        this.f.push(f);
      }
      this.rank = this.f.map((_, i) => i).sort(() => R() - .5).map((v, i) => [v, i]).reduce((a, [v, i]) => (a[v] = i, a), []);
      this.b = $$('#bubble .bt'); this.c = -1; this.bi = -1;
    },
    update(p) {
      const n = this.f.length, c = Math.floor(clamp((p - .08) / .74) * (n + .999));
      if (c !== this.c) { this.c = c; this.f.forEach((e, i) => e.classList.toggle('on', this.rank[i] < c)); }
      const bi = p < .3 ? 0 : p < .62 ? 1 : 2;
      if (bi !== this.bi) { this.bi = bi; this.b.forEach((t, i) => t.classList.toggle('on', i === bi)); }
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

  /* ---------- Mon axe : la matrice, puis l'agenda de la semaine ---------- */
  S.axe = {
    tasks: [['Rendre le projet de développement', 0], ['Préparer le Career Day de vendredi', 0], ['Réviser pour les examens à venir', 1], ['Reprendre le cours de macroéconomie', 1], ['Faire les exercices du TD de mercredi', 1], ['Répondre aux messages de groupe', 2], ['Faire défiler les réseaux', 3], ['Retoucher une figure déjà validée', 3]],
    init() {
      this.board = $('#board'); this.ag = $('#agenda'); const R = rng(21); this.items = [];
      const slot = [0, 0, 0, 0];
      this.tasks.forEach(([txt, q], i) => {
        const d = document.createElement('div'); d.className = 'task q' + q; d.textContent = txt; this.board.append(d);
        this.items.push({ d, q, slot: slot[q]++, sx: .12 + R() * .4, sy: .18 + R() * .5, rot: (R() - .5) * 30 });
      });
      this.qs = $$('.q', this.board);
      /* agenda de la semaine du 23 au 27 novembre */
      const days = ['Lun 23', 'Mar 24', 'Mer 25', 'Jeu 26', 'Ven 27'], cols = $('.ag-body', this.ag), hours = $('.ag-hours', this.ag);
      $('.ag-head', this.ag).insertAdjacentHTML('beforeend', days.map(d => `<b>${d}</b>`).join(''));
      for (let h = 8; h <= 18; h += 2) hours.insertAdjacentHTML('beforeend', `<span style="top:${(h - 8) / 10 * 100}%">${h} h</span>`);
      const B = [[0, 9.5, 12.5, 'Macroéconomie (CM)', 'f'], [0, 13.5, 16.5, 'Macroéconomie (CM)', 'f'], [2, 16.5, 18.5, 'TD de macroéconomie', 'f'], [4, 8, 17, 'Career Day', 'f'],
        [1, 9, 12, 'Projet de développement', 'm'], [1, 14, 17, 'Révisions', 'm'], [2, 9, 12, 'Préparer le Career Day', 'm'], [3, 9, 12, 'Projet de développement', 'm'], [3, 14, 17, 'Révisions', 'm']];
      this.blocks = [];
      days.forEach((_, i) => { const c = document.createElement('div'); c.className = 'ag-col'; cols.append(c); B.filter(b => b[0] === i).forEach(b => { const e = document.createElement('div'); e.className = 'blk ' + b[4]; e.style.top = (b[1] - 8) / 10 * 100 + '%'; e.style.height = (b[2] - b[1]) / 10 * 100 + '%'; e.textContent = b[3]; c.append(e); if (b[4] === 'm') this.blocks.push(e); }); });
    },
    update(p) {
      const W = this.board.clientWidth, fs = Math.max(12, W * .031), sh = fs * 2.9, lh = fs * 2.6;
      this.items.forEach((it, i) => {
        const t = ease(clamp((p - .06 - i * .04) / .36));
        const fx = (it.q % 2) * W / 2 + W * .03, fy = Math.floor(it.q / 2) * W / 2 + lh + it.slot * (sh + 6);
        it.d.style.fontSize = fs + 'px'; it.d.style.minHeight = sh + 'px';
        it.d.style.transform = `translate(${lerp(it.sx * W, fx, t).toFixed(1)}px,${lerp(it.sy * W, fy, t).toFixed(1)}px) rotate(${lerp(it.rot, 0, t).toFixed(1)}deg)`;
        it.d.classList.toggle('s', t > .97);
      });
      this.qs.forEach(q => { q.style.opacity = clamp((p - .4) / .1); q.style.fontSize = fs + 'px'; });
      const bo = 1 - clamp((p - .5) / .1), ao = clamp((p - .55) / .1);
      this.board.style.opacity = bo; this.board.style.visibility = bo > 0 ? 'visible' : 'hidden'; this.board.style.pointerEvents = 'none';
      this.ag.style.opacity = ao; this.ag.style.visibility = ao > 0 ? 'visible' : 'hidden'; this.ag.style.transform = `translateY(${lerp(30, 0, ao)}px)`;
      this.blocks.forEach((b, i) => { const t = clamp((p - .66 - i * .035) / .1); b.style.opacity = t; b.style.transform = `scaleY(${lerp(.2, 1, ease(t))})`; });
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
      const imgs = [], patterns = ['{i}.jpeg', '{i}.jpg', '{i}.png', '{i}.webp', 'profil-{i}.jpeg', 'profil-{i}.jpg', 'profil-{i}.png', 'profil-{i}.webp'];
      let known = null;                       // motif de nom trouvé : on le réutilise pour les captures suivantes
      const tryLoad = src => new Promise(r => { const im = new Image(); im.onload = () => r(im); im.onerror = () => r(null); im.src = src; });
      for (let i = 1; i <= 14; i++) {
        let ok = null;
        for (const p of (known ? [known] : patterns)) { ok = await tryLoad('assets/linkedin/' + p.replace('{i}', i)); if (ok) { known = p; break; } }
        if (!ok) break; imgs.push(ok);
      }
      if (imgs.length) { imgs.forEach((im, i) => { im.alt = `Capture ${i + 1} du profil LinkedIn d'Aïssatou Gueye`; this.strip.append(im); }); this.n = imgs.length; }
      else {
        for (let i = 1; i <= 4; i++) this.strip.insertAdjacentHTML('beforeend', `<div class="li-ph"><span class="no">${i}</span><div class="ban"></div><div class="av"></div><h4>Aïssatou Gueye</h4><p>Data Analyst et statisticienne</p><div class="sk2"></div><div class="sk2" style="width:55%"></div></div>`);
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

  /* ---------- Objectifs : une longue frise de 32 étapes ---------- */
  S.tl = {
    M: [['Stage', 'Trouver un stage en fin de M1', 'Un stage de 3 mois à partir de mai 2027, dans un métier de la donnée, pour appliquer ce que j\'apprends en économétrie et en statistique et prolonger mes expériences à l\'ANSD et chez Myriad.'],
      ['Alternance', 'Trouver une alternance', 'Une alternance pour la suite de mon master : alterner les cours et une mission réelle, et gagner en autonomie dans un environnement professionnel.'],
      ['Compétence', 'Monter en compétences en data engineering', 'Mieux maîtriser la construction de pipelines de données (ETL, API, CI/CD) pour livrer des données fiables à celles et ceux qui les analysent.'],
      ['Langue', 'Améliorer mon anglais', 'Passer d\'un niveau intermédiaire à un niveau professionnel, pour lire, rédiger et présenter en anglais dans un environnement international.']],
    init(el) {
      this.track = $('#tlTrack');
      this.track.innerHTML = this.M.map(([tag, t, d], i) => `<div class="ms ${i % 2 ? 'dn' : 'up'}"><i class="dot"></i><div class="body"><span class="d">${tag}</span><h3>${t}</h3><p>${d}</p></div></div>`).join('');
      this.items = $$('.ms', el); this.cnt = $('#tlCount'); this.resize(el);
    },    narrow() { return innerWidth <= 800 || reduce; },
    resize(el) {
      if (this.narrow()) { el.style.height = ''; return; }
      this.max = this.track.scrollWidth - innerWidth * .55; el.style.height = (this.max + innerHeight * 1.2) + 'px';
    },
    update(p) {
      if (this.narrow()) { this.items.forEach(i => i.classList.add('on')); return; }
      const tx = -p * this.max; this.track.style.transform = `translateX(${tx}px)`;
      const mx = innerWidth * .3; let n = 0;
      this.items.forEach(it => { const c = it.offsetLeft + it.offsetWidth / 2 + tx, on = c < mx + 60; it.classList.toggle('on', on); if (on) n++; });
      this.cnt.textContent = n + ' / ' + this.items.length;
    }
  };

  /* ---------- Au revoir : Milo géant qui s'élève du bas de l'écran et salue ---------- */
  S.bye = {
    init() { this.svg = $('#byeSvg'); this.bub = $('#byeBubble'); },
    update(p) {
      const e = ease(clamp(p / .4));
      this.svg.style.transform = `translateY(${((1 - e) * 105).toFixed(1)}%)`;
      this.bub.style.opacity = clamp((p - .45) / .15);
    }
  };

  /* ---------- Moteur : progression lissée de chaque scène ---------- */
  const scenes = $$('[data-scene]').map(el => {
    const def = S[el.dataset.scene]; if (def && def.init) def.init(el);
    return { el, def, cur: 0, target: 0 };
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
