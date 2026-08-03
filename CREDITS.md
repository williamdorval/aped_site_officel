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

## Polices

Les polices des neuf écrans de démonstration sont sous licence libre
(Open Font License pour la plupart). Le relevé par famille, avec son
rôle et sa licence, est dans `fonts/demos/_licences.json`.

Les polices du site principal vivent dans `fonts/` et sont servies
depuis ce serveur. Aucune police distante, aucun appel à un service
de polices.

---

## Bibliothèques

| Bibliothèque | Version | Licence | Où |
|---|---|---|---|
| GSAP + ScrollTrigger | auto-hébergé | licence standard « no charge » GreenSock | `js/vendor/` |
| Pannellum | 2.5.7 | MIT | chargé au clic, section Visite 360 |

Il n'y a pas d'autre dépendance à l'exécution. Pas de cadriciel, pas
de CDN, pas de traceur, pas de témoin, pas de police distante.
