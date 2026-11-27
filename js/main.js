/* Portfolio d'Aïssatou Gueye : JavaScript sans dépendance.
   Ce fichier : chargement, ciel étoilé, navigation, réalisations horizontales,
   filtre du réseau, boutons « copier ». Les scènes animées sont dans scenes.js. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const small = () => innerWidth <= 800;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

  /* ---- Nom : les lettres montent ---- */
  $$('[data-split]').forEach(el => {
    const t = el.textContent; el.textContent = ''; let i = 0;
    t.split(' ').forEach((word, wi, arr) => {
      const w = document.createElement('span'); w.className = 'w';
      [...word].forEach(c => { const s = document.createElement('span'); s.className = 'ch'; s.style.setProperty('--i', i++); s.textContent = c; w.append(s); });
      el.append(w); if (wi < arr.length - 1) el.append(' ');
    });
  });

  /* ---- Ciel étoilé ---- */
  const cv = $('#stars'), cx = cv.getContext('2d'); let stars = [];
  function sizeStars() {
    cv.width = cv.clientWidth; cv.height = cv.clientHeight;
    stars = Array.from({ length: 110 }, () => ({ x: Math.random() * cv.width, y: Math.random() * cv.height, r: Math.random() * 1.5 + .3, p: Math.random() * 6.28, d: Math.random() }));
  }
  function drawStars(t) {
    cx.clearRect(0, 0, cv.width, cv.height);
    for (const s of stars) {
      const a = reduce ? .5 : .25 + .35 * Math.sin(t / 800 + s.p);
      cx.fillStyle = `rgba(242,233,212,${a})`;
      cx.beginPath(); cx.arc(s.x, (s.y - scrollY * s.d * .2 + cv.height) % cv.height, s.r, 0, 6.28); cx.fill();
    }
    if (!reduce && scrollY < innerHeight * 1.5) requestAnimationFrame(drawStars);
  }
  sizeStars();
  addEventListener('resize', sizeStars);
  requestAnimationFrame(drawStars);
  addEventListener('scroll', () => { if (scrollY < innerHeight * 1.5 && !reduce) requestAnimationFrame(drawStars); }, { passive: true });

  /* ---- Milo suit un peu la souris ---- */
  const mh = $('#miloHero');
  if (!reduce) addEventListener('pointermove', e => {
    const x = (e.clientX / innerWidth - .5) * 24, y = (e.clientY / innerHeight - .5) * 16;
    mh.style.transform = `translate(${x}px,${y}px) rotate(${x * .25}deg)`;
  });

  /* ---- Réalisations : défilement horizontal épinglé (ordinateur) ---- */
  const hs = $('#realisations'), track = $('#track'), bar = $('#hsbar'), hsMilo = $('#hsMilo'); let hopT = 0;
  function sizeHS() {
    if (small() || reduce) { hs.style.height = ''; return; }
    hs.style.height = (track.scrollWidth - innerWidth + innerHeight) + 'px';
  }
  function horizontal() {
    if (small() || reduce) return;
    const r = hs.getBoundingClientRect(), max = track.scrollWidth - innerWidth;
    const p = clamp(-r.top / (hs.offsetHeight - innerHeight));
    track.style.transform = `translateX(${-p * max}px)`; bar.style.width = (p * 100) + '%';
    /* Milo court le long de la barre et sautille tant qu'on défile */
    hsMilo.style.left = `calc(8vw + ${p} * (84vw - 64px))`;
    hsMilo.classList.add('hop'); clearTimeout(hopT); hopT = setTimeout(() => hsMilo.classList.remove('hop'), 160);
  }

  /* ---- Navigation : points générés depuis data-s + barre de progression ---- */
  const secs = $$('[data-s]'), dotsBox = $('#dots'), barTop = $('#bar');
  secs.forEach(s => { const a = document.createElement('a'); a.href = '#' + s.id; const sp = document.createElement('span'); sp.textContent = s.dataset.s; a.append(sp); a.setAttribute('aria-label', s.dataset.s); dotsBox.append(a); });
  const dots = $$('a', dotsBox);
  function nav() {
    barTop.style.width = (scrollY / (document.documentElement.scrollHeight - innerHeight) * 100) + '%';
    let cur = 0; secs.forEach((s, i) => { if (s.getBoundingClientRect().top < innerHeight * .5) cur = i; });
    dots.forEach((d, i) => d.classList.toggle('on', i === cur));
  }
  let tick = false;
  function onScroll() { if (tick) return; tick = true; requestAnimationFrame(() => { horizontal(); nav(); tick = false; }); }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', () => { sizeHS(); onScroll(); });
  sizeHS(); onScroll();

  /* ---- Apparitions : fondu, et mise en route des animations quand elles sont visibles ---- */
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) e.target.classList.add(e.target.classList.contains('fade') ? 'in' : 'play'); }), { threshold: .25 });
  $$('.fade,.chain,.lead-photo,.roles').forEach(el => io.observe(el));

  /* ---- Filtre du tableau de réseau ---- */
  $$('.chip-b').forEach(b => b.addEventListener('click', () => {
    $$('.chip-b').forEach(x => x.setAttribute('aria-pressed', x === b ? 'true' : 'false'));
    const f = b.dataset.f;
    $$('.net tbody tr').forEach(tr => tr.classList.toggle('off', f !== 'all' && !tr.dataset.c.split(' ').includes(f)));
  }));

  /* ---- Boutons « copier » ---- */
  $$('[data-copy]').forEach(b => b.addEventListener('click', async () => {
    const old = b.textContent;
    try { await navigator.clipboard.writeText(b.dataset.copy); b.textContent = 'Copié'; }
    catch { b.textContent = 'Copie impossible : sélectionne le texte'; }
    setTimeout(() => b.textContent = old, 1800);
  }));

  /* ---- Curseur : une pelote de laine rose, avec un fil, qui roule derrière la souris ---- */
  if (matchMedia('(hover: hover) and (pointer: fine)').matches && !reduce) {
    const cur = $('#cur'), ball = $('#curBall'), rot = $('#curRot'), th = $('#curThread');
    let x = -100, y = -100, bx = -100, by = -100, tx = -100, ty = -100, spin = 0, sc = 1, tsc = 1, started = false, raf = 0;
    const HOVER = 'a,button,.btn,[data-copy],.chip-b,.sk,.evalrow,summary,[tabindex],.vnav button';
    const draw = () => {
      raf = 0; const px = bx;
      bx += (x - bx) * .24; by += (y - by) * .24; tx += (bx - tx) * .1; ty += (by - ty) * .1; sc += (tsc - sc) * .22; spin += (bx - px) * 2.4;
      ball.setAttribute('transform', `translate(${bx.toFixed(1)} ${by.toFixed(1)}) scale(${sc.toFixed(3)})`); rot.setAttribute('transform', `rotate(${spin.toFixed(1)})`);
      th.setAttribute('d', `M${bx.toFixed(1)} ${by.toFixed(1)} Q${((bx + tx) / 2 + (by - ty) * .35).toFixed(1)} ${((by + ty) / 2 - (bx - tx) * .35).toFixed(1)} ${tx.toFixed(1)} ${ty.toFixed(1)}`);
      if (Math.abs(x - bx) + Math.abs(y - by) + Math.abs(bx - tx) + Math.abs(by - ty) > .4 || Math.abs(tsc - sc) > .01) raf = requestAnimationFrame(draw);
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(draw); };
    addEventListener('pointermove', e => {
      x = e.clientX; y = e.clientY;
      if (!started) { started = true; bx = tx = x; by = ty = y; document.documentElement.classList.add('ball'); }
      cur.style.opacity = 1; tsc = e.target.closest && e.target.closest(HOVER) ? 1.7 : 1; kick();
    }, { passive: true });
    addEventListener('pointerdown', () => { tsc = .8; kick(); });
    addEventListener('pointerup', () => { tsc = 1; kick(); });
    document.addEventListener('mouseleave', () => { cur.style.opacity = 0; });
  }

  /* ---- Bienvenue : la pelote roule vers la souris, son fil se déroule ---- */
  const wm = $('#bienvenue'), wmSvg = $('#wmSvg'), ball = $('#wmBall'), rot = $('#wmBallRot'), thread = $('#wmThread'), tail = $('#wmTail');
  if (wm && ball) {
    let bx = 560, target = 560, lastMove = -9999, vis = true, rafW = 0, spin = 0;
    const fitBox = () => wmSvg.setAttribute('viewBox', innerWidth <= 900 ? '430 60 970 740' : '0 0 1400 800');
    fitBox(); addEventListener('resize', fitBox);
    wm.addEventListener('pointermove', e => { const r = wmSvg.getBoundingClientRect(); const u = clamp((e.clientX - r.left) / Math.max(1, r.width)); target = innerWidth <= 900 ? 470 + u * 380 : 300 + u * 520; lastMove = performance.now(); }, { passive: true });
    const draw = now => {
      rafW = 0;
      if (now - lastMove > 2200) target = 560 + Math.sin(now / 1100) * 90;
      const px = bx; bx += (target - bx) * .06; spin += (bx - px) * 1.1;
      ball.setAttribute('transform', `translate(${bx.toFixed(1)} 700)`); rot.setAttribute('transform', `rotate(${spin.toFixed(1)})`);
      thread.setAttribute('d', `M${(bx + 40).toFixed(1)} 668 C${(bx + 150).toFixed(1)} 600 ${(bx + 190).toFixed(1)} 800 905 738`);
      tail.setAttribute('d', `M${(bx - 76).toFixed(1)} 712 C${(bx - 170).toFixed(1)} 770 ${(bx - 260).toFixed(1)} 690 ${(bx - 360).toFixed(1)} 752 S${(bx - 520).toFixed(1)} 700 ${(bx - 620).toFixed(1)} 760`);
      if (vis && !reduce) rafW = requestAnimationFrame(draw);
    };
    new IntersectionObserver(es => es.forEach(e => { vis = e.isIntersecting; if (vis && !rafW) rafW = requestAnimationFrame(draw); })).observe(wm);
    rafW = requestAnimationFrame(draw);
  }

  /* ---- Écran de chargement : Milo se dessine ---- */
  const pre = $('#pre'), pn = $('#pre-n'), pm = $('#pre-msg');
  const msgs = ['Chargement de l\'univers de Milo', 'Tracé des étoiles', 'Réglage du toboggan', 'Milo est prêt'];
  const strokes = $$('[data-d]', pre).flatMap(el => el.tagName.toLowerCase() === 'g' ? $$('path,circle', el) : [el]);
  const ring = $('circle.cn', pre);
  strokes.forEach(s => { if (s === ring) { s.style.strokeDasharray = '2 6'; return; } s.setAttribute('pathLength', 1); s.style.strokeDasharray = 1; s.style.strokeDashoffset = 1; });
  const minTime = reduce ? 200 : 2600, t0 = performance.now();
  let loaded = document.readyState === 'complete', p = 0;
  addEventListener('load', () => loaded = true);
  const drawn = strokes.filter(s => s !== ring);
  function paint(v) {
    pn.textContent = Math.round(v * 100);
    drawn.forEach((s, i) => s.style.strokeDashoffset = 1 - clamp(v * 1.15 - i * .05));
    pm.textContent = msgs[Math.min(3, Math.floor(v * 4))];
  }
  function finish() {
    pre.classList.add('done'); document.body.classList.add('ready');
    setTimeout(() => $$('[data-split]').forEach((el, i) => setTimeout(() => el.classList.add('in'), 140 * i)), 450);
    setTimeout(() => $$('.hero-fade').forEach(el => el.classList.add('in')), 1100);
    setTimeout(() => pre.remove(), 1400);
    const y = +new URLSearchParams(location.search).get('y'); if (y) scrollTo(0, y);
    dispatchEvent(new Event('resize'));
  }
  function step(now) {
    const t = clamp((now - t0) / minTime);
    p = Math.min(loaded ? 1 : .9, Math.max(p, t));
    paint(p);
    if (p >= 1 && now - t0 >= minTime) { finish(); return; }
    requestAnimationFrame(step);
  }
  if (new URLSearchParams(location.search).has('nopre')) { paint(1); finish(); } else requestAnimationFrame(step);
})();
