# Chantier 7 — les douze premiers écrans · 2026-08-01

## Ce que ce dossier prouve

Que les douze aperçus de la section Secteurs **ne se ressemblent pas**,
et qu'aucun ne porte l'identité d'APED. C'est la seule chose que cette
section vend : *on sait faire n'importe quel style, pour n'importe quel
métier.* Douze aperçus qui se ressemblent prouvent l'inverse.

## L'outil qui refait tout

```
node tools/ecrans-secteurs.mjs            # les douze, 1440 × 900, densité 2
node tools/planche-secteurs-12.mjs 460    # la planche, cases de 460 × 288
node tools/planche-secteurs-12.mjs 720    # la même, assez grande pour lire
```

Le serveur du dépôt doit tourner (`node tools/serve.mjs 8099`). Les
trois projets réels démarrent leur propre serveur de développement ;
`ecrans-secteurs.mjs` s'en charge et les arrête après.

## Ce qu'il faut VOIR dans `planche-douze-460.png`

C'est un test d'œil, pas une mesure. Trois questions, dans cet ordre.

**1 · Est-ce qu'on devine que ça vient du même studio ?**
Regarde la planche de loin, sans lire. Compte les familles :

| Ce qu'on doit voir | |
|---|---|
| **Luminance** | quatre sombres (01, 05, 06, 08) · un saturé (04) · sept clairs |
| **Fond** | photo pleine · argile · blanc pur · acide · bleu de plan · glacier · ivoire · papier rosé · noir |
| **Composition** | photo + titre géant · objet centré · colonnes de magazine · mur de lettres · plan technique · interface · split vertical · une de journal · galerie vide |
| **Formes** | un seul rond (09), un seul quadrillé (07), un seul réglé (11), le reste à angles vifs |

**Le point faible connu :** quatre écrans sombres à photographie
pleine. Trois sur quatre sont les projets réels, qu'on ne redessine
pas. C'est écrit dans `RESERVES.md`.

**2 · Est-ce qu'un écran a l'air cassé ?**
Un mot coupé, une bande vide, un titre qui déborde. Deux l'ont été —
Coiffure et Juridique, un masque figé à mi-course sur un titre. C'est
le piège 56, et il a été écrit ici.

**3 · Est-ce qu'on voit bouger quelque chose ?**
Chaque écran porte **un** geste, photographié à mi-course. À la case
de 460 px, il doit encore se voir : c'est le piège 57 — un filet d'1 px
devient 0,29 px et disparaît.

## Ce que ce dossier ne prouve PAS

- **Que les douze sont au niveau des sites primés.** Ça se juge en
  mettant la planche à côté des relevés de `tools/_refs/`, et ça ne
  s'automatise pas.
- **Que ça tient sur un appareil réel.** Rien de ce dépôt n'a été vu
  ailleurs que dans Chromium sous Playwright, sur un poste Windows.
- **Que les trois projets réels ont reçu la même passe.** Ils ont été
  rephotographiés, pas retravaillés. `RESERVES.md`.
