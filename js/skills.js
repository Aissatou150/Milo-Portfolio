/* Compétences : grandes tuiles avec logo, filtrables par catégorie.
   Logos : collection Simple Icons (licence CC0) dans assets/logos/.
   Quand un outil n'a pas de logo officiel libre, la tuile affiche son sigle. */
(() => {
  const grid = document.getElementById('skillGrid'); if (!grid) return;
  const D = [
    ['Python', 'Données', 'python', '#3776AB'], ['R', 'Données', 'r', '#276DC3'], ['Stata', 'Données', null, '#1A5F91', 'Stata'],
    ['SPSS', 'Données', null, '#0F62FE', 'SPSS'], ['SQL', 'Données', null, '#E48E00', 'SQL'], ['PostgreSQL', 'Données', 'postgresql', '#4169E1'],
    ['BigQuery', 'Données', 'googlebigquery', '#4F86F7'], ['AWS', 'Données', 'amazonwebservices', '#FF9900'], ['Databricks', 'Données', 'databricks', '#FF3621'],
    ['Power BI', 'Visualisation', null, '#E0A800', 'BI'], ['Dash', 'Visualisation', 'plotly', '#5B63E0'], ['Metabase', 'Visualisation', 'metabase', '#509EE3'],
    ['Looker Studio', 'Visualisation', 'looker', '#4285F4'], ['R Shiny', 'Visualisation', 'rstudioide', '#4E8DC5'],
    ['Régression', 'ML et engineering', null, '#C2410C', 'β'], ['Analyse multivariée', 'ML et engineering', null, '#7C3AED', 'ACP'], ['scikit-learn', 'ML et engineering', 'scikitlearn', '#F7931E'],
    ['LLM / RAG', 'ML et engineering', null, '#0E9F6E', 'RAG'], ['ETL / API', 'ML et engineering', null, '#0891B2', 'ETL'], ['CI/CD', 'ML et engineering', 'githubactions', '#2088FF'],
    ['ODK', 'Collecte et autres', null, '#2E7D32', 'ODK'], ['KoboToolbox', 'Collecte et autres', null, '#1976D2', 'Kobo'], ['Survey Solution', 'Collecte et autres', null, '#8E24AA', 'SuSo'],
    ['QGIS', 'Collecte et autres', 'qgis', '#589632'], ['Excel / VBA', 'Collecte et autres', null, '#217346', 'XL'], ['LaTeX', 'Collecte et autres', 'latex', '#008080'],
    ['Canva', 'Collecte et autres', 'canva', '#00A3AD'], ['Figma', 'Collecte et autres', 'figma', '#F24E1E']
  ];
  D.forEach(([name, cat, slug, col, mono], i) => {
    const a = document.createElement('article'); a.className = 'sk'; a.dataset.cat = cat; a.style.setProperty('--c', col); a.style.setProperty('--d', (i % 3) * 90 + 'ms');
    const logo = slug ? `<span class="sk-logo" style="--m:url(../assets/logos/${slug}.svg)" aria-hidden="true"></span>` : `<span class="sk-mono" aria-hidden="true">${mono}</span>`;
    a.innerHTML = `${logo}<h3 class="sk-name">${name}</h3><p class="sk-cat">${cat}</p>`;
    grid.append(a);
  });
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .2 });
  grid.querySelectorAll('.sk').forEach(t => io.observe(t));
  document.querySelectorAll('[data-skf]').forEach(b => b.addEventListener('click', () => {
    document.querySelectorAll('[data-skf]').forEach(x => x.setAttribute('aria-pressed', x === b ? 'true' : 'false'));
    const f = b.dataset.skf;
    grid.querySelectorAll('.sk').forEach(t => { const off = f !== 'all' && t.dataset.cat !== f; t.classList.toggle('off', off); if (!off) t.classList.add('in'); });
  }));
})();
