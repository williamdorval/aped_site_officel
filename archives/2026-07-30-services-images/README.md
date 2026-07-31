# ARCHIVE — les quatre photographies de la section 02 · Services

Retirées le **2026-07-30**, sur demande du propriétaire : la section
Services est ramenée au texte seul, sans image ni illustration.

**Rien n'est supprimé.** Les quatre `.webp` sont ici, et
`svc-images.mjs` — le fabricant, qui porte le **registre de
provenance** — est ici avec elles. Un binaire ne garde pas sa
provenance : le ré-encodage WebP efface les métadonnées. C'est
exactement ce qui rend les cinq `images/real-*.webp` inemployables.
La provenance ne survit que dans un fichier **texte** du dépôt, et
c'est `svc-images.mjs`.

## Le registre, recopié ici pour qu'il survive au fichier

| Fichier | Octets | Ce que c'est | Source | Auteur | Licence |
|---|---|---|---|---|---|
| `svc-01-sites.webp` | 76 596 | salle de bistro au repos, chaises noires, sol de béton, contre-jour | [Pexels #11388016](https://www.pexels.com/photo/a-table-and-black-chairs-in-a-coffee-shop-11388016/) | Abdullah | **Pexels License** — commercial, modification permise, attribution non exigée |
| `svc-02-automatisation.webp` | 31 830 | formulaire papier rempli à la main sur un presse-papiers | [Pexels #12234106](https://www.pexels.com/photo/close-up-shot-of-a-person-doing-a-checklist-12234106/) | Daniel Andraski | **Pexels License**, idem |
| `svc-03-immobilier.webp` | 125 772 | terrasse de la propriété — **reprojection de la première pièce de notre propre visite 360**, pas une photo de banque | [Poly Haven, *Lythwood Lodge*](https://polyhaven.com/license), Lidgetton, KwaZulu-Natal | Greg Zaal | **CC0** — domaine public |
| `svc-04-logiciels.webp` | 232 938 | rayonnages à palettes rouges et noirs, entrepôt à dalle de béton | [Pexels #12706241](https://www.pexels.com/photo/interior-of-a-warehouse-12706241/) | iam luisao | **Pexels License**, idem |

`node tools/svc-images.mjs --licences` rechargeait chaque page source
**et** sa page de licence dans un navigateur avec tête, et rendait le
statut HTTP plus l'auteur déclaré. C'était la preuve, pas une
supposition. Le fichier est ici : si les images reviennent, il refait
la vérification.

## Ce qu'il faut savoir avant de les remettre

1. **Elles étaient étiquetées.** Chaque figure portait une mention
   permanente : « Illustration » pour 01, 02 et 04, « Démo · pas nos
   photos » pour 03. La 03 est une photographie d'une propriété
   sud-africaine, pas d'un mandat ; le dire est obligatoire au sens du
   § 0.A. Ne pas remettre les images sans remettre les étiquettes.
2. **Elles coûtaient 467 Ko** à quatre requêtes, toutes en
   `loading="lazy"` + `fetchpriority="low"`, donc jamais candidates au
   LCP. Le retrait rend ces 467 Ko.
3. Le bouton « Lancer la visite 360 » vivait **sur** l'image de la
   carte 03 (`[data-svc-tour]`, logique dans `js/main.js`). Il est
   retiré aussi : la visite se démontre déjà en section 05, et on ne
   duplique pas une démonstration. Le code du déclencheur est dans
   `main-svcTour.js` de ce dossier.
4. `tools/services-check.mjs` pesait les quatre fichiers (ligne 644).
   Ce relevé est retiré du test en même temps.

## Ce qui les remplace

Rien. La section est en **texte seul** — quatre chantiers qui défilent
latéralement pendant qu'on descend, sous une typographie large. Voir
`CHANTIER-SERVICES-REALISATIONS.md § 2`.
