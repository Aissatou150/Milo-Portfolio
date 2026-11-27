/* Section anti-stress : respiration (canvas), mer (canvas), jeu 2048 jouable.
   Chaque animation ne tourne que lorsqu'elle est visible à l'écran. */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const ease = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

  /* Lance une boucle de dessin seulement quand l'élément est visible */
  function whenVisible(el, draw) {
    let on = false, raf = 0;
    const loop = t => { draw(t); if (on && !reduce) raf = requestAnimationFrame(loop); };
    new IntersectionObserver(es => es.forEach(e => { on = e.isIntersecting; if (on) { cancelAnimationFrame(raf); raf = requestAnimationFrame(loop); } })).observe(el);
  }
  function fit(cv) { const k = Math.min(devicePixelRatio || 1, 2); cv.width = cv.clientWidth * k; cv.height = cv.clientHeight * k; return k; }

  /* ---------- Respiration ---------- */
  const bc = document.getElementById('breathCv');
  if (bc) {
    const c = bc.getContext('2d'), word = document.getElementById('breathWord'), miloEl = document.getElementById('breathMilo'), R = []; let k = fit(bc);
    for (let i = 0; i < 90; i++) R.push({ a: Math.random() * 6.283, d: 1.25 + Math.random() * 1.9, s: (Math.random() - .5) * .0006, z: .6 + Math.random() * 2 });
    addEventListener('resize', () => { k = fit(bc); });
    whenVisible(bc, now => {
      const w = bc.width, h = bc.height, cx = w * (innerWidth > 900 ? .72 : .5), cy = innerWidth > 900 ? h * .5 : h - (Math.min(innerHeight, bc.clientHeight) * .34) * k, base = Math.min(w, h) * .17;
      const t = (now % 10000) / 10000, b = t < .4 ? ease(t / .4) : t < .5 ? 1 : 1 - ease((t - .5) / .5);
      const r = base * (.62 + .52 * b);
      c.clearRect(0, 0, w, h);
      for (let i = 5; i >= 1; i--) {
        const rr = r * (1 + i * .34 + .06 * Math.sin(now / 900 + i)), g = c.createRadialGradient(cx, cy, rr * .2, cx, cy, rr);
        g.addColorStop(0, `rgba(143,217,204,${.22 - i * .03})`); g.addColorStop(1, 'rgba(143,217,204,0)');
        c.fillStyle = g; c.beginPath(); c.arc(cx, cy, rr, 0, 6.283); c.fill();
      }
      c.strokeStyle = 'rgba(242,233,212,.4)'; c.lineWidth = 2 * k; c.beginPath(); c.arc(cx, cy, r * 1.5 + b * 14 * k, 0, 6.283); c.stroke();
      /* Milo gonfle quand il inspire, se dégonfle quand il souffle */
      const W = innerWidth > 900 ? Math.min(bc.clientHeight * .62, 380) : Math.min(innerHeight * .42, 300), mw = W * (.88 + .2 * b);
      miloEl.style.left = (cx / k) + 'px'; miloEl.style.top = (cy / k) + 'px'; miloEl.style.width = W + 'px'; miloEl.style.marginLeft = (-W / 2) + 'px'; miloEl.style.marginTop = (-W / 2) + 'px';
      miloEl.style.transform = `scale(${(.9 + .2 * b).toFixed(3)},${(.92 + .13 * b).toFixed(3)})`;
      /* petits souffles : ils entrent vers sa bouche à l'inspiration, en sortent à l'expiration */
      const mouthX = cx + W * .02 * k, mouthY = cy + W * .015 * k, R2 = W * k;
      for (let i = 0; i < 4; i++) {
        const ph = t < .4 ? t / .4 : t > .5 ? (t - .5) / .5 : 1, u = (ph + i * .22) % 1;
        if (t >= .4 && t <= .5) continue;
        const inhale = t < .4, d = (inhale ? 1 - u : u) * R2 * .55 + R2 * .12;
        c.fillStyle = `rgba(242,233,212,${(inhale ? u : 1 - u) * .6})`;
        c.beginPath(); c.arc(mouthX + d, mouthY + Math.sin(u * 6 + i) * 6 * k, (3 + (inhale ? 1 - u : u) * 14) * k, 0, 6.283); c.fill();
      }
      R.forEach(p => {
        p.a += p.s * 16; const rr = base * p.d * (.8 + .5 * b);
        c.fillStyle = `rgba(242,233,212,${.18 + .35 * b})`; c.beginPath(); c.arc(cx + Math.cos(p.a) * rr, cy + Math.sin(p.a) * rr * .8, p.z * k, 0, 6.283); c.fill();
      });
      const wd = t < .4 ? 'Inspire' : t < .5 ? 'Retiens' : 'Souffle'; if (word.textContent !== wd) word.textContent = wd;
    });
  }

  /* ---------- La mer ---------- */
  const sc = document.getElementById('seaCv');
  if (sc) {
    const c = sc.getContext('2d'); let k = fit(sc); addEventListener('resize', () => { k = fit(sc); });
    whenVisible(sc, now => {
      const w = sc.width, h = sc.height, hz = h * .5, t = now / 1000;
      const sky = c.createLinearGradient(0, 0, 0, hz); sky.addColorStop(0, '#1a2f3a'); sky.addColorStop(1, '#e8a15a');
      c.fillStyle = sky; c.fillRect(0, 0, w, hz + 2);
      const sx = w * .68, sg = c.createRadialGradient(sx, hz, 0, sx, hz, w * .25); sg.addColorStop(0, 'rgba(255,214,150,.95)'); sg.addColorStop(.25, 'rgba(255,160,80,.45)'); sg.addColorStop(1, 'rgba(255,160,80,0)');
      c.fillStyle = sg; c.fillRect(0, 0, w, hz + 2); c.fillStyle = '#ffd9a0'; c.beginPath(); c.arc(sx, hz - 4 * k, 34 * k, 0, 6.283); c.fill();
      for (let l = 0; l < 6; l++) {
        const y0 = hz + (h - hz) * (l / 6) ** 1.2 + 6 * k, amp = (4 + l * 5) * k, wl = (160 + l * 90) * k, sp = (.5 + l * .25) * (l % 2 ? -1 : 1);
        c.beginPath(); c.moveTo(0, h);
        for (let x = 0; x <= w; x += 8 * k) c.lineTo(x, y0 + Math.sin(x / wl * 6.283 + t * sp) * amp + Math.sin(x / (wl * .5) * 6.283 - t * sp * 1.3) * amp * .4);
        c.lineTo(w, h); c.closePath();
        const g = c.createLinearGradient(0, y0 - amp, 0, h); g.addColorStop(0, ['#3a8f98', '#2f7f88', '#26707a', '#1f6069', '#184f58', '#123f47'][l]); g.addColorStop(1, '#0d3038'); c.fillStyle = g; c.fill();
        if (l < 3) { c.strokeStyle = `rgba(255,222,170,${.5 - l * .13})`; c.lineWidth = 2 * k; c.stroke(); }
      }
      for (let i = 0; i < 18; i++) { const y = hz + 10 * k + i * 14 * k, wv = (30 + 120 * (i / 18)) * k * (.7 + .3 * Math.sin(t * 2 + i)); c.fillStyle = `rgba(255,222,170,${.5 - i * .025})`; c.fillRect(sx - wv / 2 + Math.sin(t + i) * 10 * k, y, wv, 2.5 * k); }
    });
  }

  /* ---------- 2048 ---------- */
  const board = document.getElementById('g2048'); if (!board) return;
  const N = 4, scoreEl = document.getElementById('g2048score'), msg = document.getElementById('g2048msg');
  let g, score, prev;
  const empty = () => Array.from({ length: N }, () => Array(N).fill(0));
  function add() { const e = []; g.forEach((r, y) => r.forEach((v, x) => { if (!v) e.push([x, y]); })); if (!e.length) return; const [x, y] = e[Math.random() * e.length | 0]; g[y][x] = Math.random() < .9 ? 2 : 4; }
  function slide(row) { const a = row.filter(Boolean); for (let i = 0; i < a.length - 1; i++) if (a[i] === a[i + 1]) { a[i] *= 2; score += a[i]; a.splice(i + 1, 1); } while (a.length < N) a.push(0); return a; }
  const tr = m => m[0].map((_, i) => m.map(r => r[i]));
  function move(d) {
    const old = JSON.stringify(g);
    if (d === 'left') g = g.map(slide);
    if (d === 'right') g = g.map(r => slide(r.slice().reverse()).reverse());
    if (d === 'up') g = tr(tr(g).map(slide));
    if (d === 'down') g = tr(tr(g).map(r => slide(r.slice().reverse()).reverse()));
    if (JSON.stringify(g) !== old) add();
    draw();
  }
  function stuck() { for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { if (!g[y][x]) return false; if (x < N - 1 && g[y][x] === g[y][x + 1]) return false; if (y < N - 1 && g[y][x] === g[y + 1][x]) return false; } return true; }
  function draw() {
    board.innerHTML = '';
    g.forEach((r, y) => r.forEach((v, x) => { const d = document.createElement('div'); d.className = 'cell' + (v ? ' v' + Math.min(v, 2048) : ''); if (v) { d.textContent = v; if (prev && prev[y][x] !== v) d.classList.add('pop'); } board.append(d); }));
    prev = g.map(r => r.slice()); scoreEl.textContent = score;
    const mx = Math.max(...g.flat()); msg.textContent = mx >= 2048 ? 'Bravo, 2048 atteint !' : stuck() ? 'Plus de coups. Recommencer ?' : '';
  }
  function start() { g = empty(); score = 0; prev = null; add(); add(); draw(); }
  start();
  const keys = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down' };
  board.addEventListener('keydown', e => { if (keys[e.key]) { e.preventDefault(); move(keys[e.key]); } });
  let sx = 0, sy = 0;
  board.addEventListener('touchstart', e => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
  board.addEventListener('touchend', e => { const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy; if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return; move(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up')); }, { passive: true });
  board.addEventListener('click', () => board.focus());
  document.querySelectorAll('[data-mv]').forEach(b => b.addEventListener('click', () => move(b.dataset.mv)));
  document.getElementById('g2048new').addEventListener('click', start);
})();
