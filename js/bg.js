/* Fond animé : un shader WebGL (bruit fluide) derrière toute la page.
   Il bouge en continu, s'écoule davantage quand on défile, suit la souris,
   et change de teinte selon la section visible. Sans WebGL, un dégradé CSS prend le relais. */
(() => {
  const cv = document.getElementById('bg');
  if (!cv) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const gl = cv.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' });
  if (!gl) { document.body.classList.add('no-gl'); return; }

  const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255);
  /* Teintes par ambiance : [fond, milieu, lumière] */
  const MOODS = {
    moss:  ['#1c2517', '#2f3b27', '#4f6b3a'],
    warm:  ['#27271a', '#3a3322', '#9a5a26'],
    sea:   ['#0e3a3e', '#1d5a5f', '#3aa39b'],
    dusk:  ['#1f2719', '#3b3a2a', '#c0682c'],
    night: ['#131a10', '#232d1d', '#35502d']
  };
  const VS = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  const FS = `precision mediump float;
uniform vec2 uR;uniform float uT;uniform float uS;uniform vec2 uM;uniform vec3 uA;uniform vec3 uB;uniform vec3 uC;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1.,0.)),f.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*n(p);p=p*2.02+vec2(1.7,9.2);a*=.5;}return v;}
void main(){
  vec2 uv=gl_FragCoord.xy/uR;vec2 p=uv*vec2(uR.x/uR.y,1.)*1.5;float t=uT*.06;
  vec2 q=vec2(fbm(p+vec2(0.,t)+uS*.5),fbm(p+vec2(5.2,1.3)-t));
  float f=fbm(p+2.6*q+vec2(uS*.9,uS*1.4));
  vec3 col=mix(uA,uB,smoothstep(.15,.75,f));
  col=mix(col,uC,smoothstep(.45,1.,q.x*q.y*2.4)*.85);
  float d=distance(uv*vec2(uR.x/uR.y,1.),uM*vec2(uR.x/uR.y,1.));
  col+=uC*.14*smoothstep(.5,0.,d);
  col*=.92+.08*smoothstep(1.2,.2,distance(uv,vec2(.5)));
  gl_FragColor=vec4(col,1.);
}`;
  const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
  const pr = gl.createProgram();
  gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pr);
  if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) { document.body.classList.add('no-gl'); return; }
  gl.useProgram(pr);
  const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const U = n => gl.getUniformLocation(pr, n);
  const uR = U('uR'), uT = U('uT'), uS = U('uS'), uM = U('uM'), uA = U('uA'), uB = U('uB'), uC = U('uC');

  function size() { const k = Math.min(devicePixelRatio || 1, 1.5) * .5; cv.width = Math.max(2, innerWidth * k | 0); cv.height = Math.max(2, innerHeight * k | 0); gl.viewport(0, 0, cv.width, cv.height); }
  size(); addEventListener('resize', () => { size(); draw(performance.now()); });

  let cur = MOODS.moss.map(hex), tgt = cur, mouse = [.6, .5], mt = [.6, .5], sy = 0, raf = 0, visible = true;
  const sections = [...document.querySelectorAll('[data-mood]')];
  function pickMood() {
    let m = 'moss'; const line = innerHeight * .55;
    for (const s of sections) { if (s.getBoundingClientRect().top < line) m = s.dataset.mood; }
    tgt = MOODS[m].map(hex);
  }
  addEventListener('pointermove', e => { mt = [e.clientX / innerWidth, 1 - e.clientY / innerHeight]; }, { passive: true });
  addEventListener('scroll', () => { pickMood(); if (!raf && !reduce) raf = requestAnimationFrame(draw); }, { passive: true });
  document.addEventListener('visibilitychange', () => { visible = !document.hidden; if (visible && !raf && !reduce) raf = requestAnimationFrame(draw); });

  function draw(now) {
    raf = 0;
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) cur[i][j] += (tgt[i][j] - cur[i][j]) * .05;
    mouse[0] += (mt[0] - mouse[0]) * .06; mouse[1] += (mt[1] - mouse[1]) * .06;
    sy += (scrollY / 1000 - sy) * .08;
    gl.uniform2f(uR, cv.width, cv.height); gl.uniform1f(uT, reduce ? 4 : now / 1000); gl.uniform1f(uS, sy); gl.uniform2f(uM, mouse[0], mouse[1]);
    gl.uniform3fv(uA, cur[0]); gl.uniform3fv(uB, cur[1]); gl.uniform3fv(uC, cur[2]);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    if (!reduce && visible) raf = requestAnimationFrame(draw);
  }
  pickMood(); cur = tgt.map(a => a.slice()); raf = requestAnimationFrame(draw);
})();
