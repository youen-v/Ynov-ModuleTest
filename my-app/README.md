## Fonctionnalités

- Affichage des utilisateurs depuis `jsonplaceholder.typicode.com`.
- Formulaire d'inscription avec validation en temps réel:
  - identité (`firstName`, `lastName`),
  - email,
  - majorité (18+),
  - code postal (5 chiffres),
  - ville obligatoire.
- Gestion d'erreurs côté store (email déjà utilisé, erreurs API, serveur indisponible).
- Toast de succès après enregistrement puis redirection vers l'accueil.

## Stack technique

- Vue 3
- Vite 7
- Pinia
- Vue Router
- Axios
- Jest + Vue Testing Library
- Cypress
- JSDoc

## Prérequis

- Node.js 22.x (aligné avec la CI GitHub Actions)
- npm

## Installation

```bash
cd my-app
npm ci
```

## Lancer le projet

```bash
npm run dev
```

Application disponible (par défaut) sur `http://localhost:5173/Ynov-ModuleTest/`.

## Scripts disponibles

- `npm run dev` : démarre le serveur de développement Vite.
- `npm run build` : build de production dans `dist/`.
- `npm run preview` : prévisualise le build de production.
- `npm test` : lance Jest avec couverture (`--coverage`).
- `npm run cypress` : ouvre Cypress (démarre aussi l'app en local).
- `npm run build-npm-ci` : construit un package npm via Babel dans `dist/`.

## Tests

### Tests unitaires / intégration (Jest)

```bash
npm test
```

Les rapports de couverture sont générés dans `coverage/`.

### Tests end-to-end (Cypress)

```bash
npm run cypress
```

Scénarios couverts:

- création d'utilisateur valide,
- gestion des doublons d'email,
- vérification de la navigation et de l'état affiché sur l'accueil.

## Documentation JSDoc

```bash
npx jsdoc -c jsdoc.config.json
```

La documentation est générée dans `docs/`.

## Structure du projet

```text
my-app/
├── src/
│   ├── router/            # Routes Vue Router
│   ├── stores/            # Store Pinia (users)
│   ├── validators/        # Logique métier (validation + calcul d'âge)
│   └── views/             # Pages Home / UserForm
├── tests/                 # Tests Jest
├── cypress/               # Tests E2E
├── docs/                  # Sortie JSDoc
├── dist/                  # Build Vite
└── package.json
```

## CI/CD (GitHub Actions)

Workflow: `.github/workflows/build_test_vue.yml`

Au `push` sur `main`, la pipeline:

1. installe les dépendances,
2. build l'application,
3. exécute les tests Jest,
4. envoie la couverture à Codecov,
5. exécute les tests Cypress,
6. génère la documentation JSDoc,
7. publie sur GitHub Pages,
8. publie sur npm uniquement si la version locale est strictement supérieure à celle déjà publiée.

## Variables et secrets CI attendus

- `CODECOV_TOKEN`
- `NPM_TOKEN`

## Notes

- Le routeur utilise `createWebHistory('/Ynov-ModuleTest/')`.
- La base Vite est configurée sur `/Ynov-ModuleTest/` pour la compatibilité GitHub Pages.

## Package NPM

[Lien du package npm public](https://www.npmjs.com/package/ci-cd-youen-ynov)
