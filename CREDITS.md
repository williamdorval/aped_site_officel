# CRÉDITS ET LICENCES

Tout ce que le site sert vient d'ici. **Zéro requête tierce** : chaque
fichier listé est copié dans le dépôt et servi depuis notre serveur.
Rien n'est appelé chez un tiers au chargement d'une page.

Ce fichier existe parce que la mention doit être **vraie et
retrouvable**, sans encombrer l'écran d'un visiteur qui cherche un
prestataire. Le site affiche une ligne ; le détail est ici.

---

## Visite 360 — section `#visite`

### Les panoramas

**Ce ne sont pas nos prises de vue.** Ce sont des panoramas de
démonstration, choisis pour montrer ce qu'une visite virtuelle permet
de faire — pas pour représenter un lieu que nous aurions photographié.

| Pièce | Source | Auteur | Licence |
|---|---|---|---|
| Terrasse | [Poly Haven](https://polyhaven.com/) | Greg Zaal | CC0 · domaine public |
| Salon | [Poly Haven](https://polyhaven.com/) | Greg Zaal | CC0 · domaine public |
| Chambre | [Poly Haven](https://polyhaven.com/) | Greg Zaal | CC0 · domaine public |

Licence CC0 : <https://polyhaven.com/license>. Aucune attribution
n'est exigée ; elle est donnée quand même.

Les fichiers servis sont dans `images/tour/` — `terrasse`, `salon` et
`chambre`, chacun en `-2k` et `-4k`, plus l'affiche `poster.webp`.
Ils sont fabriqués par `tools/tour-images.mjs`.

### Le moteur

**Pannellum 2.5.7**, licence MIT — <https://pannellum.org/>.
Copié dans le dépôt (`js/vendor/pannellum.js`,
`css/vendor/pannellum.css`), servi depuis ce serveur, chargé
seulement au clic sur « Entrer dans la visite ». Aucun CDN.

---

## Photographies des écrans de secteur

Les douze aperçus de la section Secteurs et les images des neuf
écrans de démonstration viennent de deux banques libres :

- **Poly Haven** — CC0, domaine public — <https://polyhaven.com/license>
- **Pexels** — licence gratuite, usage commercial, modification
  permise, attribution non exigée — <https://www.pexels.com/license/>

Le relevé complet, une ligne par fichier avec sa page d'origine et sa
licence, est généré et tenu à jour dans
`images/secteurs-sites/_licences.json`.

Règle appliquée à chaque image, vérifiée en pleine résolution :
aucune marque lisible, aucun visage identifiable, aucun logo, aucun
numéro civique. Les rejets et leurs motifs sont commentés dans
`tools/secteurs-sites-photos.mjs`.

---

## Photographies du site — accueil, services, processus, contact

Les sept photographies du site viennent de **Pexels**, sous sa licence
gratuite : usage commercial permis, modification permise, **attribution
non exigée** — <https://www.pexels.com/license/>. Elle n'est pas
exigée ; elle est donnée quand même.

**Ce ne sont pas nos prises de vue, et elles ne montrent aucun de nos
clients.** Ce sont des scènes de travail réelles, choisies pour ce
qu'un métier a de matériel — un établi, une liasse de bons, une table
et des papiers — jamais pour faire passer un inconnu pour un client ou
un associé d'ADEXWEB. Aucun visage n'y est identifiable au premier
plan : de dos, de trois quarts, ou les mains seules.

| Emploi | Fichier servi | Source | Auteur | Licence |
|---|---|---|---|---|
| Accueil, premier écran | `images/photos/accueil-hero.webp` (+ `@2x`) | [Pexels 5089116](https://www.pexels.com/photo/5089116/) | cottonbro studio | [Licence Pexels](https://www.pexels.com/license/) |
| Services 01 · sites | `images/photos/services-sites.webp` | [Pexels 7480728](https://www.pexels.com/photo/7480728/) | cottonbro studio | [Licence Pexels](https://www.pexels.com/license/) |
| Services 02 · automatisation | `images/photos/services-automatisation.webp` | [Pexels 7054757](https://www.pexels.com/photo/7054757/) | Kindel Media | [Licence Pexels](https://www.pexels.com/license/) |
| Services 03 · immobilier | `images/photos/services-immobilier.webp` | [Pexels 36906952](https://www.pexels.com/photo/36906952/) | Curtis Adams | [Licence Pexels](https://www.pexels.com/license/) |
| Services 04 · logiciels | `images/photos/services-logiciels.webp` | [Pexels 7479042](https://www.pexels.com/photo/7479042/) | cottonbro studio | [Licence Pexels](https://www.pexels.com/license/) |
| Processus 01 · l'appel | `images/photos/processus-appel.webp` | [Pexels 7651953](https://www.pexels.com/photo/7651953/) | Kindel Media | [Licence Pexels](https://www.pexels.com/license/) |
| Contact · le lieu | `images/photos/contact-lieu.webp` | [Pexels 31423268](https://www.pexels.com/photo/31423268/) | Aymerik Grenier | [Licence Pexels](https://www.pexels.com/license/) |

Trois images de réserve, sous la même licence, sont dans le même
dossier et ne sont pas servies : `reserve-accueil-hero.webp` (cottonbro
studio, [7565167](https://www.pexels.com/photo/7565167/)),
`reserve-contact-lieu.webp` (Benjamin Svobodny,
[11490700](https://www.pexels.com/photo/11490700/)) et
`reserve-services-automatisation.webp` (cottonbro studio,
[8382613](https://www.pexels.com/photo/8382613/)).

Le relevé complet — une ligne par fichier, avec l'URL exacte du
téléchargement, la page de l'œuvre, la licence et l'auteur — est dans
`images/photos/_licences.json`, au même format que
`images/secteurs-sites/_licences.json`.

Règle appliquée à chaque image, vérifiée en pleine résolution : aucune
marque commerciale lisible, aucune enseigne de commerce, aucun visage
identifiable au premier plan, aucun texte incrusté, aucun filigrane.
Chaque fichier est copié dans le dépôt et servi depuis notre serveur —
**aucune requête tierce au chargement**.

---

## Polices

Les polices des neuf écrans de démonstration sont sous licence libre
(Open Font License pour la plupart). Le relevé par famille, avec son
rôle et sa licence, est dans `fonts/demos/_licences.json`.

Les deux polices du site vivent dans `fonts/` et sont servies depuis ce
serveur. **Aucune police distante, aucun appel à un service de polices.**

| Police | Emploi | Auteur | Licence |
|---|---|---|---|
| **Newsreader** | Titres | Production Type, pour Google Fonts | [SIL Open Font License 1.1](https://openfontlicense.org/) |
| **Instrument Sans** | Corps, interface, boutons, champs | Instrument (Rodrigo Fuenzalida, Jordan Egstad) | [SIL Open Font License 1.1](https://openfontlicense.org/) |

Les fichiers servis ne sont pas les originaux : ils sont **réduits** par
`python refonte-adexweb/sous-ensemble.py`, qui fige les axes inutiles et ne
garde que les caractères du français. Newsreader passe de 129 à 62 Ko, son
italique de 143 à 33, Instrument Sans de 56 à 24. La licence OFL permet la
modification et la redistribution des fichiers ainsi produits ; le nom des
familles est conservé, comme elle l'exige.

---

## Bibliothèques

| Bibliothèque | Version | Licence | Où |
|---|---|---|---|
| Pannellum | 2.5.7 | MIT | chargé au clic, la visite 360 de `realisations.html` |

**GSAP et ScrollTrigger ont été retirés le 2026-08-08.** Le nouveau langage
de mouvement tient en une transition CSS de 500 ms ; 115 Ko de bibliothèque
n'avaient plus d'emploi.

Il n'y a pas d'autre dépendance à l'exécution. Pas de cadriciel, pas
de CDN, pas de traceur, pas de témoin, pas de police distante.
