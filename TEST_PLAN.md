# TEST_PLAN

## Objectif

Intégrer le module `validator.js` (activité 1) dans une interface **Vue 3** et vérifier que l’UI réagit correctement à la logique métier :

- affichage des erreurs (rouge) dès la saisie ou au focus out,
- bouton de soumission désactivé tant que le formulaire est invalide (et visuellement “gris”),
- au succès : toaster + sauvegarde localStorage + reset des champs.

---

## Périmètre fonctionnel

Champs requis :

- Nom (`lastName`)
- Prénom (`firstName`)
- Email (`email`)
- Date de naissance (`birthDate`)
- Code postal (`zip`)
- Ville (`city`)

Règles de validation (sources) :

- `validateIdentity({ firstName, lastName })` (anti-HTML + regex)
- `validateEmail(email)`
- `validatePostalCode(zip)`
- `validateAdult({ birth: Date })` → erreur `"Pegi 18"` si mineur
- Règle UI : ville obligatoire → `"City is required"`

---

## Tests Unitaires (UT) — Logique métier (`validator.js`)

Les UT valident la logique métier indépendamment de l’UI.

### UT : `validateIdentity`

Cas couverts :

- identité manquante → `"Identity is required"`
- type invalide → `"Identity must be an object"`
- champs manquants → `"firstName and lastName are required"`
- types invalides → `"firstName/lastName must be strings"`
- injection HTML → `"HTML tags are not allowed in identity"`
- format invalide (regex) → `"Invalid identity format"`
- cas valide → retourne l’objet identity

### UT : `validateEmail`

Cas couverts :

- email manquant → `"Email is required"`
- type invalide → `"Email must be a string"`
- format invalide → `"Invalid email format"`
- cas valide → retourne l’email

### UT : `validatePostalCode`

Cas couverts :

- manquant → `"Zip required"`
- type invalide → `"Zip code type error"`
- longueur/format invalide → `"Zip code wrong length"`
- cas valide → retourne le code postal

### UT : `validateAdult` + `calculateAge`

Cas couverts :

- mineur → `"Pegi 18"`
- majeur → retourne l’âge (>= 18)
- paramètres invalides/absents (via `calculateAge`) → erreurs associées

---

## Tests d’Intégration (IT) — UI (`UserForm.vue`) avec Vue Testing Library

Les IT vérifient le comportement complet de l’application : DOM + styles + interactions utilisateur + localStorage.

### Stratégie générale

- Simulation d’un utilisateur “chaotique” (saisies invalides, corrections, re-saisies).
- Vérifications DOM :
  - erreur visible sous le champ concerné,
  - style rouge sur les erreurs,
  - bouton submit disabled + style “gris” (opacity 0.5) tant que invalide,
  - bouton actif (opacity 1) quand valide.
- Vérification `localStorage` via **jsdom** :
  - lecture `localStorage.getItem("userForm")`,
  - comparaison du JSON attendu.

### Cas IT couverts (mapping avec les tests)

1. **Parcours complet** : invalide → erreurs rouges + bouton disabled/grey → corrections → submit OK  
   Vérifie : `localStorage` écrit, toaster visible, reset champs.
2. **Date vide** → affiche `"Birth date is required"`.
3. **Mineur** → affiche `"Pegi 18"` + bouton disabled + pas de localStorage.
4. **Identité avec HTML** → affiche `"HTML tags are not allowed in identity"` (rouge).
5. **Identité format invalide (chiffres)** → `"Invalid identity format"` + bouton disabled.
6. **Email** : vide → `"Email is required"` → invalide → `"Invalid email format"` → valide → erreur disparaît.
7. **Code postal** : vide → `"Zip required"` → lettres → `"Zip code wrong length"` → 4 chiffres → `"Zip code wrong length"` → 5 chiffres → erreur disparaît.
8. **Ville vide** → `"City is required"` + bouton disabled.
9. **Submit invalide** → n’écrit pas dans localStorage et affiche des erreurs (via `markAllTouched`).

---

## Conclusion

- Les **UT** garantissent que la logique métier du module `validator.js` est correcte et stable.
- Les **IT** garantissent que l’interface Vue 3 reflète fidèlement ces règles : messages, styles, état du bouton, et effets de bord (toaster, localStorage, reset).
