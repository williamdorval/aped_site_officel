# Visite 360 — la sequence

Sept etats du lecteur, photographies en **mouvement reduit** et a la fenetre entiere.

**Pourquoi le mouvement reduit.** Sous mouvement plein et defilement programmatique, la scene rend un aplat noir : ecart-type de luminance **0,0**. Sous mouvement reduit, elle rend la piece : **75,9** sur le code d'avant le chantier, **58,5** sur celui d'apres. Le meme 0,0 sort des deux versions, servies depuis deux ports differents — ce n'est donc pas une regression du chantier, c'est ce que font les sas quand on les traverse au script (pieges 78 a 82). `tour360.js` ne lit `prefers-reduced-motion` que pour ne pas lancer la derive automatique : le lecteur se charge, tourne et change de piece exactement pareil.

**Ce que cette planche ne montre donc pas** : l'entree du cadre en V1 · DEGAGER, qui ne joue pas a ce palier. Elle reste declaree, pas prouvee en image (`RESERVES.md`).

**La preuve du mouvement ne repose pas seulement sur les images** : elle vient aussi du `translate` que le moteur pose lui-meme sur les pastilles de passage, et de l'etat du DOM. Les deux sont dans les constats.

## La piece est-elle sur l'image ?

Ecart-type de luminance dans la fenetre de la scene (1046 x 588 px). Sous 8, la surface est perimee : la capture ne porte pas le panorama.

| image | ecart-type | verdict |
|---|---|---|
| affiche | 58.5 | la piece est la |
| chargement | 62.2 | la piece est la |
| vivante-terrasse | 62.2 | la piece est la |
| clavier-droite | 60.5 | la piece est la |
| glissement-souris | 53.0 | la piece est la |
| piece-salon | 58.7 | la piece est la |
| piece-par-passage | 66.0 | la piece est la |

## Ecarts de pixels entre deux images consecutives

A ne lire QUE sur les paires dont les deux images portent la piece. Ailleurs l'ecart mesure la surface perimee, pas le mouvement.

| de | vers | ecart |
|---|---|---|
| affiche | chargement | FENETRES DIFFERENTES 1048x722 vs 1048x721 |
| chargement | vivante-terrasse | 0.00 % |
| vivante-terrasse | clavier-droite | 72.66 % |
| clavier-droite | glissement-souris | 73.33 % |
| glissement-souris | piece-salon | 78.66 % |
| piece-salon | piece-par-passage | 78.72 % |

## Constats

- **ok** — le lecteur est cable avant le clic
- **ok** — l'affiche est en place
- **ok** — l'entree est visible, le mode d'emploi non
- **ok** — le clic pose `.is-loading`
- **ok** — le moteur monte, `.is-live` posee
- **ok** — le conteneur du visionneur existe
- **ok** — l'affiche est retiree du DOM
- **ok** — les 2 commandes sont la
- **ok** — les 3 pieces du plan sont la
- **ok** — au moins un passage est pose
- **ok** — la piece active est la Terrasse
- **ok** — le pupitre garde sa hauteur (89 px avant, 89 px apres)
- **ok** — le cadre garde sa hauteur (721 px avant, 721 px apres)
- **ok** — l'entree cede la place au mode d'emploi
- **ok** — la fleche fait tourner la piece (le passage se deplace de 449 px)
- **ok** — le glissement fait tourner la piece (le passage se deplace de 7202 px)
- **ok** — le plan change de piece
- **ok** — le salon a deux passages, la terrasse un
- **ok** — un passage dans l'image change de piece

- erreurs console : **0**
- images : 7, paires au-dessus de 1 % d'ecart : 4

> Reserve : Chromium sous SwiftShader, composition logicielle, machine de bureau Windows. Ce n'est pas le navigateur d'un visiteur.

**Verdict : la visite fonctionne**
