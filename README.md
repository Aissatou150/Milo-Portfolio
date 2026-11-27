# Portfolio d'Aïssatou Gueye

Site statique d'une seule page (HTML, CSS, JavaScript), sans dépendance ni étape de build.
Tout est affiché dans la page : CV, aperçu LinkedIn, réalisations. Aucun lien n'oblige à ouvrir un autre onglet.

## Structure

```
portfolio/
├─ index.html          la page (le contenu est écrit directement dedans)
├─ css/
│  ├─ style.css        palette mousse et liège, typographie, accueil, réalisations, fond animé
│  └─ scenes.css       les scènes animées et les sections (nuages, valeurs, force, axe, stress…)
├─ js/
│  ├─ main.js          chargement, ciel étoilé, navigation, filtre du réseau
│  ├─ bg.js            fond WebGL animé, qui change de teinte selon la section
│  ├─ skills.js        grandes tuiles de compétences avec logos
│  ├─ scenes.js        moteur des scènes et une fonction par scène
│  └─ stress.js        respiration, mer et jeu 2048 jouable
├─ assets/
│  ├─ cv/              cv-aissatou-gueye.pdf et .png (le .png est affiché dans la page)
│  ├─ img/             portrait.jpg, bureau.jpg, ensae.jpg
│  ├─ linkedin/        1.jpeg, 2.jpeg…  (captures du profil, dans l'ordre)
│  ├─ logos/           logos des outils (Simple Icons, licence CC0)
│  └─ fonts/           bricolage.woff2, sourceserif.woff2  (optionnel)
├─ contenu/            notes de rédaction et a-verifier.md
├─ maquette/           maquettes de design (ignorées par Git)
└─ archive/v1/         première version du portfolio (ignorée par Git)
```

## Prévisualiser en local

```powershell
python -m http.server 8000
```

Puis ouvre http://localhost:8000. Deux paramètres utiles à ajouter à l'adresse : `?nopre` passe l'écran de chargement, `?nosmooth` désactive le lissage des scènes (pratique pour tester).

Après une modification des fichiers CSS ou JavaScript, augmente le numéro `?v=3` dans les balises de `index.html` pour que les navigateurs rechargent les fichiers.

## Comment fonctionnent les scènes

Une scène est un bloc haut (`class="scene"`) dont le contenu reste épinglé à l'écran. Le défilement donne à `scenes.js` une progression de 0 à 1, lissée, qui pilote les animations. Pour modifier une scène, cherche son nom dans `scenes.js` : `S.clouds`, `S.vals`, `S.tobo`, `S.force`, `S.run`, `S.axe`, `S.sea`, `S.cv`, `S.li`, `S.tl`, `S.bye`.

Le fond (`bg.js`) est un shader WebGL. Chaque section peut déclarer son ambiance avec `data-mood="moss | warm | sea | dusk | night"`. Sans WebGL, un dégradé CSS prend le relais.

## Remplacer les photos, les captures, le CV

- **Photos :** `assets/img/portrait.jpg` (À propos), `bureau.jpg` (Compétences), `ensae.jpg` (Leadership). Portrait ou format 3:4, 1200 px de haut au minimum, moins de 300 Ko.
- **LinkedIn :** captures dans `assets/linkedin/`, nommées `1`, `2`, `3`… (`.jpeg`, `.jpg`, `.png` ou `.webp`, jusqu'à 14). Elles défilent comme le vrai profil.
- **CV :** si tu le modifies, remplace `cv-aissatou-gueye.pdf` et refais l'image `cv-aissatou-gueye.png` (la page affiche l'image).
- **Objectifs :** les quatre objectifs et leur texte sont le tableau `M` de `S.tl`, dans `js/scenes.js`.
- **Polices (optionnel) :** `assets/fonts/bricolage.woff2` (Bricolage Grotesque) et `assets/fonts/sourceserif.woff2` (Source Serif 4), sous licence libre (OFL). Sans ces fichiers, le site utilise Arial Black et Georgia.

La console du navigateur signale des fichiers introuvables tant que les polices ne sont pas déposées : c'est normal.

## Déployer sur GitHub Pages

1. Crée un dépôt GitHub et envoie le contenu de ce dossier à la racine.
2. Dans le dépôt : Settings, Pages, Source « Deploy from a branch », branche `main`, dossier `/ (root)`.
3. Le site est publié à l'adresse `https://<ton-compte>.github.io/<nom-du-depot>/`.

## Confidentialité

Un dépôt public expose tout ce qu'il contient, y compris le CV (photo, e-mail, numéro de téléphone), tes photos et les captures LinkedIn.
Le site cite aussi des personnes de ton réseau par leur nom. Vérifie ces éléments, et demande leur accord aux personnes citées, avant de publier. Tu peux garder le dépôt privé tant que le site n'est pas prêt.

## Accessibilité et performance

- Le mode « réduire les animations » du système désactive les animations, les scènes épinglées et le fond animé : tout s'affiche à plat.
- Sur téléphone, les scènes sont plus courtes, les réalisations et la frise s'empilent verticalement.
- À la fin de la page, Milo apparaît en très grand, appuyé sur le rebord de l'écran, et salue de la patte.
- Le curseur est une pelote de laine sur ordinateur ; il redevient normal sur téléphone et avec « réduire les animations ».
- Navigation au clavier possible, avec un lien « Aller au contenu ». Le jeu 2048 se joue aux flèches, au toucher ou avec les boutons.
