# ARCHIVE — les cinq projets de la section 03

Retirés le **2026-07-30**. Deux raisons, et **chacune suffisait**.

## 1 · Le propriétaire

> « Pneus Mécanique et MV Déneigement ne sont pas encore en ligne :
> on ne les montre pas. »

Une affirmation de livraison sans lien vers le livrable est la plus
facile à démolir de toutes — il suffit de demander l'adresse. Les cinq
cadres étaient des captures `webp` statiques ; aucun n'était lié à une
adresse en ligne.

## 2 · Aucune des cinq images n'a de licence documentée

Constat ouvert le 2026-07-30 dans `CHANTIER-SERVICES.md § 3.2`, et
**c'est lui qui rend ces fichiers inemployables partout, pas seulement
ici** :

| Fichier | Pourquoi il est bloqué |
|---|---|
| `real-pneus.webp` | aucune licence, **et il contient neuf marques de pneumatiques** — MICHELIN, FALKEN, KUMHO, VREDESTEIN, METHOD, VISION, DAI, FUEL, BRAELIN. Une exposition de marque est indépendante du droit d'auteur |
| `real-restaurant.webp` | aucune licence, et il incorpore une douzaine de photographies culinaires dont la licence est elle-même inconnue |
| `real-carrosserie.webp` | aucune licence, une dizaine de photos de véhicules et des marques identifiables |
| `real-neige.webp` | aucune licence |
| `real-interieur.webp` | aucune licence, et deux blocs de texte s'y rendent **espaces supprimés** (« Ondessinedesespacesquivousressemblent ») — une signature de modèle génératif, pas de navigateur |

**L'absence de métadonnée n'est pas une preuve de propreté** : le
ré-encodage WebP les a effacées, donc on ne peut plus savoir. Sur une
règle qui dit « licence claire et **vérifiée** », ne pas savoir vaut
non.

> **NE PAS LES REMETTRE.** Le jour où les cinq adresses en ligne
> existent, ce ne sont pas ces captures-là qu'il faut afficher : c'est
> un **lien** vers chaque site, et une capture refaite dont on connaît
> la provenance.

---

## Le contenu du dossier

| Fichier | Ce que c'est |
|---|---|
| `real-*.webp` (5) | les captures, telles quelles |
| `index.html-section-03.html` | la section 03 entière — cinq `article.project`, chacun avec `figure.shot`, `.shot-vue[data-shot]`, `.shot-etat`, `i.shot-jauge`, `.project-meta` et son `dl.project-facts[data-souder]` |
| `main-cadres-de-projet.js` | **139 lignes** — le parcours du cadre : survol prolongé de 520 ms, clic, Entrée/Espace, défilement interne, jauge, état. Tout passait par `scrollTop`, jamais par un `transform` |
| `motion-bloc7.js` | **57 lignes** — bloc 7 de `motion.js`, le dégagement de la capture (`clip-path`, 380 ms, une fois) |
| `langue-bloc6.js` | **26 lignes** — bloc 6 de `langue.js`, les vitesses différenciées (la fiche monte 22 px plus vite que sa capture, palier 0 seulement) |

Sept règles CSS de `app.css` sont parties avec — `.project`,
`.project .shot`, `.project .project-meta`, les deux variantes
`:nth-child(even)`, `.project-meta { will-change }` et les deux règles
`.shot` de mouvement réduit.

> **CE CODE ÉTAIT MORT SANS ÊTRE VISIBLE.** Les trois blocs sortaient
> proprement sur un sélecteur vide (`$$(".shot")`, `$$("[data-shot]")`,
> `$$(".project-meta")`) : aucune erreur, aucun avertissement, et un
> `services-check` qui passe en ne mesurant rien. C'est le **piège 17**
> de `CLAUDE.md`. Il a été supprimé plutôt que laissé, précisément
> pour ça.

---

## Ce qui remplace la section

Trois comparaisons **avant / après** entièrement construites en markup
— zéro image, zéro octet, zéro requête. Elles ne démontrent pas qu'on a
livré : elles démontrent **l'écart**, et l'écart se vérifie à l'écran
par n'importe qui.

Argument complet, registre des marqueurs de 2008-2012 avec leurs
captures Wayback, et les treize décisions :
`CHANTIER-SERVICES-REALISATIONS.md § 3`.
