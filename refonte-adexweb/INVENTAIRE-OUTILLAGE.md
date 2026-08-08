# INVENTAIRE — outillage et documentation, avec verdicts de survie

Relevé le 2026-08-08. `tools/` = **175 `.mjs`, 41 844 lignes** (+ 9 PNG, 7 `.txt`,
22 dossiers de sortie). Documentation = **45 `.md`**, dont `decisions/css-app.md`
à 3 608 lignes.

---

## 0 · Quatre faits transversaux

| Fait | Conséquence |
|---|---|
| **Le préfixe `aped-` est dans 97 des 175 outils** (clés de stockage) | Massif mais **mécanique**. Un `sed` coordonné `tools/` + `js/` + `Code.gs`. **Ce n'est pas un motif de RÉÉCRIRE.** |
| **Trois modules partagés** : `tools/_adresse.mjs` (importé par 27 outils), `tools/_png.mjs` (décodeur maison), `tools/prod-parcours.mjs` (importé par `_p2`…`_p6`) | Casser l'un des trois arrête un tiers du banc **en silence**. `.gitignore` documente déjà l'incident. |
| **Deux serveurs, deux ports** : `node tools/serve.mjs 8099` (le site), `node tools/faux-google.mjs 8098` (Apps Script exécuté sous Node). 8098 sert aussi de « AVANT » aux A/B. | ~150 outils n'existent pas sans eux. |
| **D-784 → D-788 n'ont AUCUNE entrée de journal.** Cités dans `CLAUDE.md`, `google/guides/LISEZ-MOI.md` et trois en-têtes de `.mjs` ; `decisions/index.md` s'arrête à D-783. | Cinq décisions, dont **deux de sécurité** (jeton signé D-786, porte de diagnostic D-785) et une de fuite (guides hors racine D-788), ne vivent que dans le code. **À écrire avant toute archive.** |

---

## VOLET 1 — `tools/`

### 1.A · Socle et modules partagés — GARDE sans discussion

| Fichier | Lancement | Fait quoi |
|---|---|---|
| `serve.mjs` | `node tools/serve.mjs [port]` | Serveur statique minimal, **zéro dépendance** |
| `faux-google.mjs` (990 l.) | `node tools/faux-google.mjs [8098]` | Exécute `google/Code.gs` **pour de vrai** sous Node : doPost, doGet créneaux, Sheets/Gmail/Calendar simulés. **Pièce maîtresse** |
| `_adresse.mjs` | (import) | « Où est le site », une seule fois |
| `_png.mjs` | (import) | Décodeur PNG + diff de pixels maison |
| `photo-noyau.mjs` | (import) | Noyau de traitement d'image partagé |
| `prod-parcours.mjs` | `node tools/prod-parcours.mjs <parcours>` | Les 7 parcours contre le **vrai** service |
| `config-envoi.mjs` | `node tools/config-envoi.mjs` | Fabrique `js/config.local.js` depuis `.env.local` |
| `verrou-env.mjs` | `node tools/verrou-env.mjs` | 7 preuves avant tout déploiement |
| `demos-sites.mjs` | (import) | Registre unique des sites photographiés |

### 1.B · Chaîne Google / formulaires / prix / sécurité — GARDE, priorité maximale
**C'est le patrimoine du projet.** Aucun ne connaît la palette ; ils connaissent
des colonnes de Sheet, des règles de prix, des jetons.

`securite-check.mjs` (781 l.) · `idempotence-check.mjs` (752) ·
`estimateur-attaque.mjs` (2 198) · `estimateur-check.mjs` (732) ·
`reference-attaque.mjs` (1 459) · **`retro-estim.mjs` (579 — calibration de la
grille de prix + 3 attaques, D-774)** · **`prix-check.mjs` (634 — aucun prix
public ; échoue si une grille se reforme dans un fichier servi)** ·
`prime-check.mjs` (433) · **`conditions.mjs` (346 — génère les 13 articles dans
`index.html` depuis `conditions/*.md`, D-773)** · `formulaires-prod.mjs` (669) ·
`classeur-check.mjs` (287) · `verite-prod.mjs` (320, **dépense du quota**) ·
`prod-final.mjs` (313) · `prod-sonde.mjs` (262) · `sept-parcours.mjs` (307) ·
`_p2`…`_p6.mjs` (sondes ciblées, à fusionner) · `acceptation-check.mjs` (363,
D-786) · `agenda-multi-check.mjs` (482, D-785) · `etapes-check.mjs` (459) /
`etapes-prod.mjs` (182) · `creneaux-check.mjs` (494) / `creneaux-vue.mjs` (291) ·
`delai-agenda.mjs` (172) · `declencheur-check.mjs` (241, D-763) ·
`blocages-check.mjs` (300, D-762) · `conditionnelles-check.mjs` (416, D-771) ·
`cas-tordus-check.mjs` (500, D-772) · `relance-check.mjs` (368, D-770) ·
`retenue-check.mjs` (724, D-780) · `portes-check.mjs` (390) ·
`suggestions-check.mjs` (308) · **`compte-check.mjs` (258 — le nombre d'étapes
promis est-il le vrai ; véracité)** · `appel-check.mjs` (226, D-760) ·
`cadeau-check.mjs` (302, D-788) · `confidentialite-check.mjs` (195) ·
`production-check.mjs` (340).

### 1.C · Qualité agnostique au design — GARDE

`verif.mjs` (333 — vérification finale : clavier, perf, orientation, contrastes,
console, débordement) · `audit.mjs` (203) · `deborde.mjs` / `debord.mjs` /
`debord404.mjs` / `_404.mjs` (débordement 320→1920) ·
**`contraste-min.mjs` / `contraste-survol.mjs` / `contraste-arret.mjs`** (contraste
par section, **pendant le survol**, **aux positions d'arrêt d'un scrub**) ·
**`pire-pixel.mjs`** (contraste **au pixel peint**, pas à la couleur déclarée) ·
`pouce-check.mjs` (169 — ce qu'on peut viser au pouce) · `theme-check.mjs` (291) ·
`theme-sequence.mjs` (155) · `perf-probe.mjs` / `cls-source.mjs` (**attribution du
CLS à sa source**) / `tache-longue.mjs` / `tache-traversee.mjs` ·
`ab-accueil.mjs` / `ab-phase8.mjs` / `ab-structure.mjs` (A/B apparié 8098 vs 8099) ·
**`css-critique.mjs` (228 — seul « build » du projet)** ·
**`cascade-check.mjs` (233 — 0 écart)** · **`index-doc.mjs` (175 — génère les index
de tête)** · **`plages.mjs` (226 — génère la table de `SECTIONS.md`)** ·
`contexte-mesure.mjs` (96 — ce que le dépôt coûte à lire en jetons) ·
`decisions-extraire.mjs` / `commentaires.mjs` / `code-nu.mjs` ·
`captures-comparer.mjs` / `captures-fixe.mjs` · `cine.mjs` (133) · `pdf.mjs` (135) ·
`titres.mjs` (33) · `vue.mjs` / `_voir.mjs` / `_ecran.mjs` / `_petit.mjs` /
`_coudre.mjs` · `_outil-dom.mjs` / `_outil-seq.mjs` / `_outil-sonde.mjs` ·
**`refs-galerie.mjs` / `refs-releve.mjs` / `planche-refs.mjs`** (trouver et
**mesurer** des références mondiales — précieux **pour** la refonte) ·
`_candidats.mjs` (cueillette Pexels) / `_inventaire.mjs` / `_invisibles.mjs` (a11y) ·
`svc-cadre.mjs` / `svc-recharge.mjs` · `palier-check.mjs` (404, retoucher § 169) ·
`_orientation.mjs` (54, le nombre 12 est à paramétrer).

### 1.D · Secteurs — GARDE : hors identité par construction
`STANDARD.md` interdit déjà toute identité APED dans les écrans de métier.
`ecrans-secteurs.mjs` (445) · `secteurs-markup.mjs` (124) · `secteurs-photos.mjs`
(544) · `secteurs-sites-photos.mjs` (1 005) · `secteurs-vue.mjs` ·
`secteurs-check.mjs` · `demos-capture.mjs` (813) · `demos-webp.mjs` ·
`demos-contraste.mjs` · `demos-controle.mjs` · `demos-markup.mjs` ·
`demos-rapports.mjs` · `avant-photos.mjs` (409) · `polices-demos.mjs` (157) ·
`panneau-echelle.mjs` · `panneau-vivant-check.mjs` · `panneaux-check.mjs` ·
`planche-secteurs-12.mjs` · `ba-check.mjs` (671) · `ba-deborde.mjs` ·
`ba-doigt.mjs` · `realisations-check.mjs` · `realisations-preuves.mjs` ·
`services-check.mjs` · `svc-fiches.mjs` · `svc-panneaux.mjs`.
*(Retargeter les sélecteurs si la structure DOM change.)*

### 1.E · Visite 360 — GARDE conditionnel
`apercu-panos.mjs`, `tour-angles.mjs`, `tour-images.mjs` (388), `tour-verif.mjs`,
`svc-360-cadre.mjs`, `visite-sequence.mjs` (500).
GARDE si la section reste, ARCHIVER en bloc sinon. Seul `visite-sequence.mjs:454`
porte une trace d'identité (`l'entree du cadre en V1 · DEGAGER`).

### 1.F · RÉÉCRIRE — l'identité est codée en dur (~18 outils, ~4 000 lignes)

| Fichier | L. | Ligne qui condamne |
|---|---:|---|
| `accueil-check.mjs` | 977 | l. 770 cadrage sur « la plaque de limaille, 180 px trop haut » ; 65 occurrences d'identité. **Le squelette « 7 relevés chiffrés » est bon** |
| `forge-check.mjs` | 234 | l. 12-14 exige `--chambre` (#060807) et « du ciment clair » ; l. 91 `sas-ok` ; l. 160 `limaille` |
| `sas-check.mjs` | 171 | l. 139, 157 : le concept de sas |
| `trame-check.mjs` | 235 | l. 158, 161 : `html.sas-ok` (D-576) |
| `langue-check.mjs` | 293 | vérifie les quatre verbes ; l. 178 « environ 1,5:1 sur le ciment » |
| `og.mjs` | 78 | l. 2 « plaque de limaille reelle » ; l. 40 `#dcdedb`/`#101211` ; l. 47 Martian Mono ; l. 54-57 `#c8371b` |
| `plaques.mjs` | 265 | l. 9, 47 : `html.sas-ok`. **Le mécanisme « photographier en mouvement PLEIN » est bon — le sauver** |
| `hero-check.mjs` | 62 | « la plaque est-elle entière ? » |
| `passages-cine.mjs` | 224 | les transitions inter-sections des sas |
| `entree-check.mjs` | 217 | rideau de 15 filets, jauge, compteur V4·CRAN |
| `frontieres-check.mjs` | 131 | « LES DOUZE FRONTIERES » |
| `svc-defile.mjs` | 409 | la piste collante de la section 02 |
| `svc-course.mjs` | 177 | « la course du rail » |
| `svc-sequences.mjs` | 177 | calibré sur le rail |
| `secteur-morph-check.mjs` | 55 | ζ = 1, forme au repos nette au pixel |
| `etats-check.mjs` | 134 | « PHASE 8 — les micro-etats », `.btn ::before` pris par V4 |
| `traversee-check.mjs` | 116 | la descente à travers les sas |
| `estimateur-vue.mjs` · `reference-vue.mjs` | 247/204 | cadrages photo. **La logique métier vit dans les `*-check`/`*-attaque`, qui sont GARDE** |

### 1.G · ARCHIVER (~39)
**Déjà hors git** (24, listés nommément dans `.gitignore`) : `_360-grade`, `_404`,
`_ba-gris`, `_ba-vue`, `_couverture`, `_entree-rail`, `_panneau-vue`,
`_planche-finale`, `_sas-1920`, `_sas-sombre`, `_svc-shot`, `_vivant-vue`, etc.
**Suivies mais périmées** : `diag-accueil.mjs` (460) + `diag-accueil2.mjs` (289) ·
`phase8-captures.mjs` (191) · `cascade-captures.mjs` (87) · `socle-captures.mjs`
(128) · `svc-bug.mjs` (358) + `svc-cause.mjs` (168) · `proto-secteurs-check.mjs`
(283, remplacé par `ecrans-secteurs.mjs`) · `sas-sequence.mjs` (226) ·
`cadeau-scene.mjs` (79) · `couvertures.mjs` (68).
**Non-`.mjs`** : 9 PNG (jusqu'à 5 Mo), 7 relevés `_m-*.txt`, 22 dossiers de sortie —
tous gitignorés, tous régénérables.

### 1.H · Bilan
| Verdict | `.mjs` |
|---|---:|
| **GARDE** | ~118 — dont ~35 pour la chaîne Google/prix/sécurité, **le patrimoine** |
| **RÉÉCRIRE** | ~18 |
| **ARCHIVER** | ~39 (dont 24 déjà hors git) |

---

## VOLET 2 — Documentation

### 2.A · Racine

| Fichier | L. | Verdict | Raison |
|---|---:|---|---|
| `CLAUDE.md` | 227 | **RÉÉCRIRE** | Les § interdits et § quatre verbes disparaissent. **À préserver mot pour mot** : règle A (Q1–Q4), règle B (visible), tableau des seuils, réserve mobile, § prix |
| `DECISIONS.md` | 1 001 | **GARDE scindé** | « Contenu et offre » à garder, « Forme et mouvement » à archiver |
| `PIEGES.md` | 1 946 | **GARDE ★** | 96 pièges d'instrument, presque tous agnostiques (`content-visibility`, CRLF/`\r`, `setValues` non atomique, formules Sheets, `order` et ordre de peinture). **Le document le plus réutilisable du dépôt** |
| `RESERVES.md` | 1 984 | **GARDE élagué** | § 1 (aucune mesure sur appareil réel), § 3, § 4 (licences) restent vrais |
| `MESURES.md` | 659 | **GARDE partiel** | §§ 1, 2, 3, 5 = méthode. § 4 « chiffres de référence » devient historique |
| `ARCHITECTURE.md` | 917 | **RÉÉCRIRE** | Le **format** est excellent, le contenu périme entièrement |
| `ANIMATIONS.md` | 897 | **ARCHIVER** | Colonne « Verbe » = la grammaire supprimée. Garder § 2 « LES VERROUS » |
| `SECTIONS.md` | 572 | **RÉÉCRIRE** | Régénérable en une commande. Garder « comment lire cet index » |
| `DESIGN-STACK.md` | 163 | **GARDE** | Outillage agent, pas design. À rafraîchir |
| `CREDITS.md` | 83 | **GARDE ★** | Obligation légale |
| `CRO-A-TESTER.md` | 169 | **GARDE** | ⚠ § 0 « Activer FormSubmit » **périmé** |
| `REFONTE-CHECKLIST.md` | 257 | **ARCHIVER** | Chantier clos. **Mais son format est le patron exact à réutiliser** |
| `REFONTE-IMMERSIVE.md` | 247 | **ARCHIVER** | Entièrement sur les sas |

### 2.B · `decisions/` — seize journaux

| Fichier | L. | Verdict |
|---|---:|---|
| `index.md` | **2 890** | **GARDE, tri chirurgical ★** — mélange esthétique (D-005, 007, 010, 014, 017, 020, 023, 025) et **fonctionnel à préserver** : **D-773** grille par type · **D-774** la grille quitte le navigateur · **D-775** « le non n'est pas une sortie » · **D-776** questionnaire conditionnel · **D-777** · **D-778** les trois associés · **D-779** une prime par entreprise · **D-780** la retenue · **D-781** le classeur un lundi matin · **D-782** popup des guides · **D-783** le numéro · **D-012/013** programme de référence · **D-748** fourchette après formulaire |
| `css-app.md` | **3 608** | **ARCHIVER** — le plus gros et le plus périssable |
| `js-main.md` | **2 097** | **GARDE, tri** — le tiers « formulaires / envoi / brouillons / créneaux » est à sauver |
| `js-langue.md` | 1 004 | ARCHIVER |
| `css-secteurs.md` | 420 | GARDE |
| `js-motion.md` | 409 | ARCHIVER |
| `js-hero.md` | 214 | ARCHIVER |
| `js-tour360.md` | 205 | GARDE conditionnel |
| `js-limaille.md` | 176 | ARCHIVER |
| `js-trame.md` | 158 | ARCHIVER |
| `css-tour360.md` | 151 | GARDE conditionnel |
| `js-sas.md` | 137 | ARCHIVER |
| `css-base.md` | 97 | GARDE |
| `css-tokens.md` | 92 | **RÉÉCRIRE** — le système de jetons se garde, ses valeurs non |
| `js-pointe.md` | 56 | ARCHIVER |
| `404.md` | 26 | RÉÉCRIRE |

### 2.C · `docs/`, `conditions/`, `demos-secteurs/`

| Fichier | L. | Verdict |
|---|---:|---|
| **`docs/CONFIGURATION-GOOGLE-APED.md`** | **875** | **GARDE ★★★** — le document fonctionnel le plus précieux. Sheet 7 onglets, Web App, doPost/doGet, Gmail, Calendar + Meet, Drive, et l'avertissement « ne jamais cliquer *Nouveau déploiement* ». Seuls le nom du classeur et de la boîte changent |
| `conditions/reference-2026-08-07.md` | 156 | **GARDE — INTOUCHABLE.** Une version ne se modifie jamais : c'est la preuve de ce qu'une personne a accepté |
| `conditions/reference-2026-08-07-b.md` | 187 | **GARDE ★★** — source de vérité des 13 articles. Une refonte crée une **nouvelle** version à côté |
| `demos-secteurs/STANDARD.md` | 352 | **GARDE ★** — la loi des écrans de métier |
| `demos-secteurs/DIRECTIONS.md` | 192 | ARCHIVER (s'auto-déclare dépassée) — extraire la carte des douze et les noms fictifs |
| `demos-secteurs/plans/*.md` (9) | **3 137** | **GARDE ★** — une DA par métier, écrite à partir de **trois références mondiales relevées et mesurées**. *(3 métiers sur 12 n'ont pas de plan)* |
| `preuves/LISEZ-MOI.md` | 218 | GARDE élagué |
| **`google/guides/LISEZ-MOI.md`** | 28 | **GARDE ★** — **seule trace écrite de D-788** (les PDF sortis de la racine servie) |

### 2.D · À extraire AVANT d'archiver
1. **Prix** — `CLAUDE.md` § interdits + `D-774` (la grille vit dans `Code.gs` et
   nulle part ailleurs).
2. **Programme de référence** — `reference-2026-08-07-b.md`, D-773, D-779, D-012,
   D-013, et « une version archivée ne se modifie jamais ».
3. **Estimateur** — D-774, D-776, D-777 + `tools/retro-estim.mjs`.
4. **Sécurité** — **D-785, D-786, D-788 : ces trois-là n'existent que dans le code.**
5. **Classeur** — `docs/CONFIGURATION-GOOGLE-APED.md` intégral + D-781 + pièges
   93/94/95.
6. **Véracité** — `CLAUDE.md` § A (Q1–Q4) + « une correction se fait partout, en
   une fois ».

---

## VOLET 3 — Configuration

**`package.json`** — aucun `name`, aucun `scripts`, aucune `dependencies`.
`playwright ^1.62.0` (**utilisé par ~120 outils**) · `gsap ^3.12.5` (**servi
localement**) · `@tabler/icons ^3.45.0` (à vérifier) · `puppeteer-core ^25.3.0`
(marginal, candidat au retrait) · `shadcn ^4.14.1` (**CLI seulement**, aucun
composant React dans le dépôt).

**`node_modules`** — ~330 dossiers, dont l'arbre Babel/TypeScript, `postcss`,
`tailwind-merge`, `express`, MCP : **tirés uniquement par le CLI `shadcn`**.
Supprimer `shadcn` + `components.json` + `.mcp.json` ferait fondre `node_modules`
de ~330 à ~40 dossiers. Le site n'a **aucun build**.

**`components.json`** — **fichier fantôme.** `tailwind.config: ""` (il n'y a pas de
Tailwind), `tailwind.css: "css/styles.css"` (**n'existe pas**), aliases vers
`components/`, `js/utils`, `js/lib`, `js/hooks` (**aucun n'existe**), quatre
registries de composants React dans un projet sans React. **ARCHIVER.**

**`.mcp.json`** — un seul serveur, `shadcn`. Tombe avec `components.json`.

**`.gitignore`** — **GARDE ★★, le document le mieux écrit du dépôt.** Il raconte
deux incidents : (1) la règle `tools/_*` avait emporté `tools/_adresse.mjs`,
importé par huit outils ; sur un clone les huit s'arrêtaient sur *Cannot find
module* — « un outil de mesure qui ne démarre pas ne rend pas un échec, il rend un
silence, et un silence se lit comme *rien à signaler* ». (2) La preuve exigée
avant d'ajouter une ligne :
`for f in $(git ls-files 'tools/*.mjs'); do grep -oE "from ['\"][^'\"]*_[a-z0-9-]+\.mjs['\"]" "$f"; done | sort -u`

**`.env.local.example`** — GARDE ★, renommer les deux clés, **garder les
commentaires mot pour mot** (le piège `/dev` vs `/exec`, et « Nouveau déploiement »
change l'adresse). ⚠ Il référence `tools/cadeau-e2e.mjs` et
`tools/formulaires-e2e.mjs`, **tous deux déjà archivés**.

---

## Trois anomalies à traiter en priorité

1. **D-784 → D-788 n'ont aucune entrée de journal.** Dont deux de sécurité.
2. **Cinq en-têtes d'outils annoncent une commande qui n'existe pas** :
   `refs-galerie.mjs`→`_galerie.mjs`, `refs-releve.mjs`→`_ref.mjs`,
   `traversee-check.mjs`→`_traversee.mjs`, `cadeau-scene.mjs`→`_cadeau-film.mjs`,
   `frontieres-check.mjs`→`_frontieres.mjs`.
3. **Trois configs mortes** : `components.json` (5 chemins inexistants) ·
   `CRO-A-TESTER.md § 0` (FormSubmit abandonné) · `.env.local.example`
   (2 outils archivés).
