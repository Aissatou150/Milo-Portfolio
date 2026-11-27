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
  const hs = $('#realisations'), track = $('#track'), bar = $('#hsbar');
  function sizeHS() {
    if (small() || reduce) { hs.style.height = ''; return; }
    hs.style.height = (track.scrollWidth - innerWidth + innerHeight) + 'px';
  }
  function horizontal() {
    if (small() || reduce) return;
    const r = hs.getBoundingClientRect(), max = track.scrollWidth - innerWidth;
    const p = clamp(-r.top / (hs.offsetHeight - innerHeight));
    track.style.transform = `translateX(${-p * max}px)`; bar.style.width = (p * 100) + '%';
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
  $$('.fade,.val,.tool,.chain').forEach(el => io.observe(el));

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
