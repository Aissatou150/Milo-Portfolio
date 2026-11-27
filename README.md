# Portfolio d'Aïssatou Gueye

Site statique d'une seule page (HTML, CSS, JavaScript), sans dépendance ni étape de build.
Tout est affiché dans la page : CV, aperçu LinkedIn, réalisations. Aucun lien n'oblige à ouvrir un autre onglet.

## Structure

```
portfolio/
├─ index.html          la page (le contenu est écrit directement dedans)
├─ css/style.css       palette mousse et liège, typographie, mise en page
├─ js/main.js          chargement, toboggan, défilement horizontal, navigation
├─ assets/
│  ├─ cv/              cv-aissatou-gueye.pdf
│  ├─ img/             aissatou.webp  (ta photo, à déposer)
│  ├─ linkedin/        profil-1.png, profil-2.png, profil-3.png  (captures, à déposer)
│  └─ fonts/           bricolage.woff2, sourceserif.woff2  (optionnel)
├─ contenu/            notes de rédaction (non publiées par la page)
├─ maquette/           maquettes de design (peuvent être supprimées)
└─ archive/v1/         première version du portfolio
```

## Prévisualiser en local

```powershell
python -m http.server 8000
```

Puis ouvre http://localhost:8000. (Le PDF intégré ne s'affiche pas toujours en double-cliquant sur `index.html`.)

## Ajouter la photo, les captures LinkedIn, les polices

- **Photo :** `assets/img/aissatou.webp`, carrée, 800 px, moins de 200 Ko. Elle remplace les initiales toute seule.
- **LinkedIn :** captures d'écran de ton profil dans `assets/linkedin/` (`profil-1.png`, `profil-2.png`, `profil-3.png`).
- **Polices (optionnel) :** `assets/fonts/bricolage.woff2` (Bricolage Grotesque) et `assets/fonts/sourceserif.woff2` (Source Serif 4), toutes deux sous licence libre (OFL). Sans ces fichiers, le site utilise Arial Black et Georgia.

## Repères « à compléter »

Les pastilles jaunes viennent de l'attribut `data-draft` sur la balise `<html>` de `index.html`.
Quand le contenu est complet, supprime cet attribut : tous les repères disparaissent.

## Déployer sur GitHub Pages

1. Crée un dépôt GitHub et envoie le contenu de ce dossier à la racine.
2. Dans le dépôt : Settings, Pages, Source « Deploy from a branch », branche `main`, dossier `/ (root)`.
3. Le site est publié à l'adresse `https://<ton-compte>.github.io/<nom-du-depot>/`.

## Confidentialité

Un dépôt public expose tout ce qu'il contient, y compris le CV (photo, e-mail, numéro de téléphone du PDF) et les captures LinkedIn.
Vérifie ces fichiers avant de publier, ou garde le dépôt privé tant que le site n'est pas prêt.

## Accessibilité et performance

- Le mode « réduire les animations » du système désactive les animations, l'épinglage et le défilement horizontal.
- Sur téléphone, les réalisations s'empilent verticalement.
- Navigation au clavier possible, avec un lien « Aller au contenu ».
