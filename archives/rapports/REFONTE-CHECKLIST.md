# Refonte APED — journal des phases

## EN COURS — les douze secteurs, 2026-07-31

**Ne jamais recommencer un secteur déjà commité.** L'état fait foi ici,
pas la mémoire d'une session.

| Secteur | Site | Branché | Commit |
|---|---|---|---|
| Restauration | `restau` (section 03) | **oui** | `2f2497e` |
| Garage et mécanique | `demo-carroserie` (section 03) | **oui** | `9633a98` |
| Paysagement et déneigement | `MV-deneigement` (section 03) | **oui** | `741eaeb` |
| Construction et rénovation | `demos-secteurs/construction/` | non — reprise des photos en cours | — |
| Immobilier | `demos-secteurs/immobilier/` | non — zones creuses en correction | — |
| Boutique en ligne | — | non | — |
| Coiffure et esthétique | — | non | — |
| Gym et entraînement | — | non | — |
| Hébergement et tourisme | — | non | — |
| Clinique et santé | — | non | — |
| Services juridiques | — | non | — |
| Photographe et créatif | — | non | — |
| *Votre industrie ici* | *carte de proposition* | *sans objet* | — |

**La chaîne, dans l'ordre :**
1. `node tools/secteurs-sites-photos.mjs <secteur>` — sourcer les
   photographies, licences écrites dans le tableau `TIRAGES` et
   recopiées dans `images/secteurs-sites/_licences.json` ;
2. écrire le site dans `demos-secteurs/<secteur>/index.html`, un seul
   fichier, aucune requête externe, `noindex` et mention de
   démonstration ;
3. `node tools/demos-capture.mjs --ecran secteur-<cle>` — il sait
   photographier un fichier statique du dépôt sans démarrer de serveur
   (D-653), à condition que l'entrée existe dans `PROJETS` ;
4. `node tools/demos-webp.mjs` — tuiles de 1 100 px ;
5. `node tools/secteurs-markup.mjs <cle>` — branche l'aperçu ;
6. `node tools/secteurs-vue.mjs 8123 <cle>` — les captures de preuve ;
7. commit.

**Les trois premiers n'ont rien coûté en octets** : leurs tuiles
existaient déjà pour la section 03.

---


**Phase 7 (la plus récente) : voir `PHASE-7.md`.**
Les douze chantiers, le retrait de tous les prix publics, et onze défauts
trouvés en propre — dont trois dans les instruments de mesure eux-mêmes.

**Phase 6 : voir `PHASE-6.md`.**
Elle corrige les huit points relevés par le client plus dix-sept défauts
trouvés en propre, et elle rend la mesure de chacun.

Ce fichier-ci garde le détail des phases 4 et 5, qui restent la référence pour
tout ce que les phases 6 et 7 n'ont pas touché.

> **Deux lignes de ce fichier sont périmées depuis la phase 7 :** le défaut du
> panorama `en_suite` (ligne ~114) est corrigé, les trois pièces de la visite
> viennent maintenant de la même propriété ; et le dispositif de capture par
> courriel des deux documents existe désormais.

---

# Refonte APED — phase 5 : LA SIGNATURE

État au 2026-07-25. Vérifié avec **Playwright** (le MCP `chrome-devtools` est
abandonné, ses captures expiraient systématiquement).

---

## LA SIGNATURE

> **APED est fait de limaille : une matière dure qui tient une forme nette sous
> tension, qui s'écarte sous la pointe, et qui se reprend d'elle-même.**

Ce n'est pas de la fumée, c'est de la limaille. Grains durs, amortissement
critique (ζ = 1, aucun dépassement possible), forme au repos **nette au pixel**.

Moteur unique : `js/limaille.js`. Une implémentation, réutilisée partout.

### Les déclinaisons

| # | Où | Forme prise | Niveau | État |
|---|---|---|---|---|
| 1 | **Hero** | APED et AGENCY composés de 20 881 grains. Le pointeur creuse un sillon, le ressort le referme. | N2 | **fait** |
| 2 | **Séquence d'entrée** | Les grains claquent sur 15 filets horizontaux puis se rassemblent en vague. Une fois par session (`sessionStorage`). | N2 | **fait** |
| 3 | **Filets de section** | Ne se tracent plus d'un trait : s'assemblent en grains puis **se ressoudent** en trait plein. | N1+N2 | **fait** |
| 4 | **Survol des CTA** | Le filet d'accent sous le bouton se compose en grains de gauche à droite, il ne glisse pas d'un bloc. | N2 | **fait** |
| 5 | **Barre de progression** | Même trame de grains, à l'échelle d'un filet de 2 px. | N1 | **fait** |
| 6 | **Plaque au défilement** | Le champ se relâche quand le hero sort, comme une plaque qu'on soulève du banc. | N3 | **fait** |
| 7 | **Re-coulée au clic** | Une onde écarte les grains, ils reforment **le même mot**. Jamais un autre glyphe. | N2 | **fait** |
| 8 | **Logo animé** | Revectorisé, même vocabulaire de balayage à 25°. | N2 | **en cours** |
| 9 | **Chiffre du calculateur** | Les chiffres se coulent en limaille tirée des tâches réglées. | N2 | **non fait** |
| 10 | **Curseur** | Réticule qui augmente le curseur natif, magnétisme sur les CTA. | N2 | **non fait** |
| 11 | **404 et og:image** | Le `404` en grains. | N3 | **non fait** |
| 12 | **Transitions de section** | Dispersion et reprise entre deux sections. | N2 | **non fait** |

### Le moment impossible — « LA COULÉE »

**Choisi, pas encore construit.** Au calculateur : le montant annuel n'est pas
compté, il est **coulé en limaille tirée des tâches que le visiteur a lui-même
réglées**. Chaque curseur émet un flux de grains proportionnel à son poids, les
flux convergent et forment les chiffres. Le chiffre est littéralement fait des
heures qu'il perd.

Pourquoi celui-là plutôt que la visite 360 : le 360 impressionne mais existe
ailleurs (Matterport, Street View). La coulée n'existe nulle part parce qu'elle
n'a de sens que sur ce site : c'est la seule où **la matière de la marque
devient la donnée du visiteur**. Tellable en une phrase : « le calculateur
fabrique ton chiffre avec la limaille de tes propres tâches. »

---

## MESURES APRÈS SIGNATURE

| | Phase 4 | Phase 5 | Cible |
|---|---|---|---|
| LCP | 164 ms | **232 ms** | < 300 ms ✓ |
| CLS | 0 | **0** | 0 ✓ |
| Tâche longue max | 78 ms | **83 ms** | < 50 ms ✗ |
| Hauteur de page | 17 227 px | **15 840 px** | plus court ✓ |
| Titres de section | 52 px | **38 px** | réduit ✓ |
| Erreurs console | 0 | **0** | 0 ✓ |
| Interactifs sans anneau de focus | 0 / 177 | **0 / 178** | 0 ✓ |
| Images sans dimensions | 0 | **0** | 0 ✓ |
| Icônes sans `aria-hidden` | 0 | **0** | 0 ✓ |
| Curseurs sans étiquette | 0 | **0** | 0 ✓ |
| Débordement horizontal | non | **non** | non ✓ |
| Grains au hero / fps | — | **20 881 / 59** | 60 ✓ |

**Test du patron de 55 ans : passé.** Aux 10 positions de défilement mesurées,
la section active et le nombre de sections restantes sont toujours affichés.

**Test du lendemain :** « Tu peux passer la souris dans le nom de l'agence et il
se creuse comme de la limaille, puis il se remet en place tout seul. »

---

## LES 12 CHANTIERS — état réel

| # | Chantier | État |
|---|---|---|
| 0 | Outillage Playwright | **fait** — MCP ajouté et connecté, chromium installé, `CLAUDE.md` à jour, chrome-devtools abandonné |
| 0.5 | Recherche | **fait** — 30 techniques trouvées, sourcées, triées GARDE/ÉCARTE |
| 1 | Référence dans le header | **fait** — « Référez, gagnez 5 000 $ », secondaire en filet, visible sur téléphone |
| 2 | 13 secteurs, vraies démos | **non fait** |
| 3 | 5 projets, ralentir le scrub | **non fait** |
| 4 | Hero | **fait** — voir la signature |
| 5 | Navigation et échelle | **fait** — titres 52→38 px, bandes resserrées, page −1 387 px, barre de progression, sections restantes, progression dans la section |
| 6 | Immobilier, visite 3D | **construit et vérifié, PAS intégré** — Pannellum vendorisé, 3 pièces, hotspots clavier, 78,9 Ko avant clic. Bloc prêt dans `fragment-tour.html` |
| 7 | Mockups | **non fait** |
| 8 | Contact | **non fait** |
| 9 | Calculateur simplifié | **non fait** |
| 10 | Logo | **revectorisé et vérifié, PAS intégré** — `images/logo-mark.svg` 673 o, `images/logo-lockup.svg` 1 481 o |
| 11 | Animations | **partiel** — déclinaisons 1 à 7 faites et documentées N1/N2/N3 |
| 12 | Cadeaux contre courriel | **PDF faits, dispositif de capture PAS fait** — 2 documents, 16 et 15 pages, 40 sources citées |

### Livrables des chantiers 6, 10 et 12 — détail

**Visite 360** (`fragment-tour.html`, `js/tour360.js`, `css/tour360.css`,
`js/vendor/pannellum.js`, `css/vendor/pannellum.css`, `images/tour/*`) :
1,66 Mo au total mais **78,9 Ko seulement avant le clic**, zéro requête pour
Pannellum et les panoramas tant que le visiteur n'entre pas. Hotspots avec
`role="link"`, `tabindex="0"`, `aria-label`, Entrée et Espace. Anneau de focus
mesuré `2px solid #9b2810`. Cibles tactiles toutes ≥ 44 px.
**Défaut connu :** `en_suite` n'est pas la même maison que les deux
`lythwood_*` (toit de chaume, autre bâtiment). Erreur de brief de ma part.
Remplacer ce seul panorama suffit.

**Logo** : les deux PNG sources sont générés par `gpt-image 2.0`, portent une
signature C2PA `trainedAlgorithmicMedia` et un **filigrane invisible qui
survit au recadrage**. Revectorisés à 94,4 % et 93,3 % de recouvrement.
**Deux décisions en attente :** le logo dit AGENCE, le hero dit AGENCY ;
et le monogramme est illisible à 32 px, il faut une variante favicon.

**Lead magnets** (`documents/`) : 16 et 15 pages, **40 sources citées et
appelées dans le texte**. Le document 1 donne une constante recalculable
(28 $ par minute hebdomadaire) plus une grille vierge : le lecteur peut
refuser nos chiffres et refaire les siens. Le document 2 **cite Statistique
Canada contre la BDC** sur la productivité de l'IA (l'écart de 24 % tombe à
5,1 % et devient non significatif une fois contrôlées les capacités
préexistantes) et cite les articles de la loi 25 sur le transfert hors Québec.
Se contredire là où les données l'exigent est le seul argument qu'un
concurrent sans aucune source ne peut pas copier.
**Défauts connus :** le tarif Anthropic cité périme le 1er septembre 2026 ;
les minutes par tâche du document 1 sont nos ordres de grandeur, étiquetés
comme tels, seul endroit sans source externe ; les renvois de page internes
sont en dur.

---

## RÉSERVES DE LA PHASE 5

1. **La tâche longue passe de 78 à 83 ms**, au-dessus de la cible de 50 ms que
   vous avez posée. Cause : l'échantillonnage du hero (un `getImageData` sur
   1048×306 plus la construction de 20 881 cibles) s'exécute au premier rendu.
   Piste non explorée : le déplacer dans un `requestIdleCallback` ou découper
   l'échantillonnage en tranches.
2. **Le logo est un problème d'actif, pas de code.** Les deux fichiers portent
   une signature C2PA `trainedAlgorithmicMedia` d'OpenAI et un filigrane
   invisible. Pour une marque destinée à être déposée, c'est un risque réel.
3. **Six chantiers sur douze ne sont pas faits.** Je ne les ai pas cachés.

---

# Refonte APED — bilan de clôture (phase 4)

Direction retenue : **A · ATELIER**. Accent **minium `#C8371B`**.
Vérifié le 2026-07-25 dans Chrome 150 réel, piloté en CDP, thèmes clair et
sombre, 1440×900 et 390×844. Preuves dans `refonte-captures/preuves/`,
mesures brutes dans `refonte-captures/preuves/rapport.json`.

Légende : ☑ refait · ⊘ supprimé, contenu replié ailleurs (justifié)

---

## 0. DÉCOMPTE — rectification d'abord

La phase 1 a annoncé **« 78 lignes »**. C'était faux. L'inventaire écrit dans
ce fichier en contenait **87** en sections A à G. Le chiffre annoncé
sous-comptait de 9. Décompte réel, section par section :

| Section | Lignes | Cochées | Supprimées | Ouvertes |
|---|---|---|---|---|
| A. Pages | 2 | 2 | 0 | 0 |
| B. Blocs globaux | 9 | 7 | 2 | 0 |
| C. Sections | 16 | 15 | 1 | 0 |
| D. Modales | 6 | 6 | 0 | 0 |
| E. Composants | 22 | 22 | 0 | 0 |
| F. Tokens | 17 | 17 | 0 | 0 |
| G. Animations | 15 | 12 | 3 | 0 |
| **Total A–G** | **87** | **81** | **6** | **0** |
| H. Logique métier (à préserver) | 8 | 8 intactes | 0 | 0 |
| I. Violations relevées | 45 | 44 | 0 | **1** |
| Bugs visuels constatés | 5 | 5 | 0 | 0 |

**Les 6 lignes supprimées, avec leur justification :**

| # | Ligne | Pourquoi supprimée | Où va son contenu |
|---|---|---|---|
| B1 | Preloader | Retardait le premier rendu de 1,3 s pour un compteur décoratif | Nulle part. Le LCP passe de 1 112 ms à 164 ms |
| B2 | Grain overlay | Texture posée sur une mise en page non composée | Nulle part. La matière vient des surfaces et des filets |
| C2 | Marquee | Remplissage. Un seul marquee par page est autorisé, et aucun n'était mérité | Mots-clés repliés dans l'intro de Services |
| G1 | Animation du preloader | Suit B1 | — |
| G3 | Animation du marquee | Suit C2 | — |
| G14 | Lenis, défilement inertiel | L'inertie contredit le langage Atelier, et c'est une dépendance tierce de plus | Défilement natif |

**La seule ligne encore ouverte** est I45, l'état des modales dans l'URL.
Vous l'avez explicitement mise de côté. Voir section K.

---

## 1. COMPTAGE DES SECTIONS — les trois chiffres réconciliés

Vous aviez raison de tiquer : 16, 11 et 13 circulaient pour la même chose.
Voici ce que chaque chiffre compte réellement, relevé dans le DOM.

| Chiffre | Ce qu'il compte | Exact ? |
|---|---|---|
| **16** | Sections de l'**ancien** site, avant refonte | Oui, mais c'est l'avant |
| **11** | Éléments `<section id>` de `index.html`, donc les cibles de navigation | Oui |
| **13** | Enfants directs de `main.shell`, donc les blocs de composition | Oui |
| **13** | Blocs numérotés 12 à 24 de `app.css` | Oui, un par bloc de composition |

**Le vrai nombre : 13 blocs de composition, dont 11 sections navigables.**

Les deux blocs qui ne sont pas des `<section>` :

- la **bande de spécification** (`div.spec`), qui n'est pas une cible de
  navigation parce qu'elle appartient au hero, pas au parcours ;
- le **pied de page** (`footer.footer`), qui n'a jamais été une section.

L'index de gauche liste 11 entrées parce qu'il ne liste que ce qui est
cliquable. C'est cohérent. Ce qui ne l'était pas, c'est le mot « sections »
employé pour trois choses différentes. Corrigé partout dans ce fichier.

Passage de 16 à 13 : `-1` marquee supprimé, `-2` par deux fusions
(bandeau confiance + statistiques → bande de spécification ; démos +
réalisations → séquence pleine largeur).

---

## 2. LA DEUXIÈME PAGE — ni oubliée, ni supprimée

L'audit de phase 1 disait « 2 pages ». Voici sa ligne exacte, telle
qu'écrite :

```
| A1 | `index.html` — page unique                | ☐ |
| A2 | Page 404 — **n'existe pas**, à créer      | ☐ |
```

La deuxième page **était** la 404. Elle figurait à l'inventaire comme
manquante et à créer, pas comme existante. Le site n'a jamais eu de
deuxième page. Rien n'a été oublié ni supprimé, mais le résumé
« 2 pages » était trompeur : il comptait comme inventaire une page qui
n'existait pas.

**Ce qui était vrai en revanche, et que vous avez senti :** la 404 livrée en
phase 3 n'était pas au niveau. Elle réutilisait deux familles de composition
de l'accueil (bande de spécification et pied de page), elle n'avait aucun
moment à elle, et son gros `404` était l'élément le plus templaté du web.
Elle a été refaite.

### 404 refaite — famille « index déraillé »

| | |
|---|---|
| Famille de composition | **Index du site à l'échelle de la page.** Absente de l'accueil. L'index de gauche est un rail fixe de 15,5 rem ; ici c'est un objet plein cadre en Archivo `--fs-3`, deux colonnes au bureau. |
| Moment wow | Le `404` n'est plus un chiffre décoratif : c'est le **numéro de rang** de l'adresse demandée dans l'index. Cette ligne est la seule sans rang valide, la seule à sortir de la colonne, et elle est barrée en minium. Au chargement elle est éjectée hors de la colonne pendant que la barre se trace. |
| Justification du mouvement, en une phrase | La ligne demandée refuse de rentrer dans l'index, ce qui est littéralement la définition d'un 404. |
| Adresse affichée | `location.pathname` réel, posé en `textContent` uniquement, jamais d'injection de balise. Repli « Adresse introuvable » sans script. |
| Mouvement réduit | La ligne est déjà dehors, la barre déjà tracée, aucune transition. |
| Tient dans un écran | Oui, mesuré à **900 px exactement** pour un écran de 900. Un cul-de-sac ne se défile pas. |
| Ce qui a été retiré | La bande de spécification (répétait l'accueil) et le gros `404` décoratif. |
| Ce qui a été ajouté | Lien d'évitement, bascule de thème pour la parité avec l'accueil, `theme-color` piloté. |

Le grand `404` ne réutilise **pas** la compression `wdth` du hero de
l'accueil : la signature de l'accueil reste unique.

---

## 3. COPIE — réécrite

Votre point 9 était juste. Le design était refait, le texte était resté une
machine. **82 remplacements** appliqués, chacun vérifié unique avant
écriture. Les faits, les prix et **tous les `name` de champs** sont
inchangés : les courriels reçus gardent exactement la même structure.

### Ce qui a changé dans la voix

| Avant | Après |
|---|---|
| `L'agence qui construit ce que les autres promettent.` | `On code ce qui fait rouler votre entreprise.` |
| `…lancés par une équipe qui vise le wow.` | `Rien de gabarit. Le code est à vous.` |
| `Une équipe obsédée par vos résultats.` | `Vous parlez à la personne qui code.` |
| `Transparence totale` / `Vitesse d'exécution` / `Sur mesure, vraiment` | `Le prix est dit au départ` / `Rien ne se code sans votre accord` / `Le code vous appartient` / `Ça va vite` |
| `Livrés, en ligne, entre les mains du client.` | `Des sites en ligne, pas des maquettes.` |
| `Voyez combien l'automatisation vous ferait économiser.` | `Combien vous coûte le travail fait à la main.` |
| `Découvrir` / `Designer` / `Développer` / `Lancer` | `On se parle` / `On dessine` / `On code` / `On met en ligne` |
| `Prêt à accélérer votre entreprise ?` | `On commence quand vous voulez.` |
| `Trois façons de partir le bal…` | `Choisissez la vôtre.` |
| `niveau Awwwards` | `Direction visuelle complète, animations sur mesure` |
| `Priorité absolue` | `Traité en premier` |

### Les régularités cassées, chiffres relevés dans le DOM

| Régularité | Avant | Après |
|---|---|---|
| Puces par service | 5 · 5 · 5 · 5 | **6 · 4 · 5 · 3** |
| Faits par projet | 3 · 3 · 3 · 3 · 3 | **2 · 2 · 2 · 2 · 2** (le `Statut : Livré` répétait le titre de section) |
| Valeurs de l'agence | 3 noms abstraits parallèles | **4 phrases** de longueurs inégales, grille asymétrique refaite |
| Points du programme de référence | 3 | **2** |
| Puces du pied de page | 3 | **2** |
| Chapeaux de section | 8 | **4** (budget : 1 pour 3 sections) |
| Superlatifs creux | « vise le wow », « obsédée », « totale », « ultra rapide », « les meilleurs », « niveau Awwwards », « absolue » | **0** |
| Triades de prose | 9 relevées | **0** |
| Em-dashes | 0 | **0** |
| Apostrophes droites | 0 | **0** |

Longueurs de phrases désormais irrégulières : les sous-titres de section
vont de 4 mots (`Prenez celle qui vous convient.`) à 21, et les descriptions
de projet de 7 à 13 mots.

---

## 4. PAGES

| # | Page | Résultat | ✓ |
|---|------|----------|---|
| A1 | `index.html` | Réécrit intégralement. 13 blocs de composition, 11 sections navigables, 6 modales. Copie réécrite en phase 4. | ☑ |
| A2 | `404.html` | **Créée en phase 3, refaite en phase 4.** Famille « index déraillé », moment wow propre, tient dans un écran. | ☑ |

## 5. BLOCS GLOBAUX

| # | Bloc | Avant | Après | ✓ |
|---|------|-------|-------|---|
| B1 | Preloader | Compteur 0→100, slide up | **Supprimé.** LCP de 1 112 ms à 164 ms. | ⊘ |
| B2 | Grain overlay | feTurbulence, opacity .05 | **Supprimé.** | ⊘ |
| B3 | Nav | Pilule flottante, blur 20px | Barre pleine largeur, 56 px, arête franche, filet bas, fond opaque. **Passe au-dessus du menu plein écran** depuis la phase 4. | ☑ |
| B4 | Burger et menu | 2 barres → croix | Deux filets superposés → croix vraiment centrée. Menu numéroté plein écran, `display:none` fermé, **focus piégé** depuis la phase 4. | ☑ |
| B5 | Scrollbar | `::-webkit-` seulement | `scrollbar-color` + `scrollbar-width` + `::-webkit-`, les deux moteurs, les deux thèmes. | ☑ |
| B6 | Sélection de texte | Bourgogne | Minium, encre inversée. | ☑ |
| B7 | Favicon | SVG « A » sur carré arrondi | Marque géométrique, arêtes franches. | ☑ |
| B8 | Meta OG | Pas d'`og:image` | `og.png` 1200×630 généré avec les vraies polices. `apple-touch-icon`. **`theme-color` unique et piloté** depuis la phase 4. | ☑ |
| B9 | Curseur personnalisé | Aucun | Aucun. Écarté : hostile à l'accessibilité et aux performances. | ☑ |
| + B10 | Lien d'évitement | Absent | Ajouté sur les **deux** pages, visible au focus. | ☑ |
| + B11 | Bascule de thème | Absente | Ajoutée sur les **deux** pages. Transition animée, `startViewTransition` quand dispo, préférence mémorisée, `theme-color` suivi. | ☑ |

## 6. SECTIONS

| # | Avant | Après | Famille de composition | ✓ |
|---|-------|-------|------------------------|---|
| C1 | Hero 2 colonnes, image inclinée, 2 orbes | Plaque typographique pleine largeur, aucune image. Titre comprimé sur l'axe `wdth` d'Archivo au défilement, 125 → 78. | plaque typographique | ☑ |
| C2 | Marquee défilant | **Supprimé.** | — | ⊘ |
| C3 | Bandeau confiance, 4 items | Fusionné avec C10 | bande de spécification | ☑ |
| C4 | Services, pile sticky 4 cartes arrondies | 4 feuilles de spécification, collant CSS natif, aucun pin GSAP. Puces en 2 colonnes, un seul filet de tête. | pile collante | ☑ |
| C5 | Démos, grille 5 cartes | Fusionné avec C9 | séquence pleine largeur | ☑ |
| C6 | Démos, grille 13 cartes | 3 groupes de pastilles, aperçu collant au survol et au focus. | groupes et aperçu | ☑ |
| C7 | Calculateur, panneau collant coupé | Deux moitiés. 11 curseurs étiquetés. Odomètre à ressort réel. Barres sans piste de fond. | split fixe | ☑ |
| C8 | Comparatif, tableau 4 colonnes | Deux barres nues par tâche, proportionnelles aux minutes. | comparaison à barres | ☑ |
| C9 | Réalisations, pan épinglé **cassé** | Fusionné dans C5 : 5 bandes en alternance, la capture entière défile dans son cadre au scrub. Aucun pin. | séquence pleine largeur | ☑ |
| C10 | Stats, 4 compteurs figés à `0` | Fusionné avec C3. Compteurs fonctionnels. | bande de spécification | ☑ |
| C11 | Processus, titre collant + 4 étapes | Ligne horizontale tracée au scrub, 4 étapes en colonnes. | frise horizontale | ☑ |
| C12 | À propos, 3 valeurs égales | **Quatuor** asymétrique sur 2 rangées, aucune colonne de même largeur, décalages verticaux inégaux. | quatuor asymétrique | ☑ |
| C13 | Référence | Bloc inversé pleine largeur, le seul aplat foncé de la page claire. | bloc plein inversé | ☑ |
| C14 | FAQ, titre à gauche + 9 details | Deux colonnes, en-tête collant, accordéon. | accordéon 2 colonnes | ☑ |
| C15 | Contact, bento 5 cellules arrondies | Bento 5 cellules exactes, tailles inégales, 3 traitements visuels. Aucune cellule vide. | bento | ☑ |
| C16 | Footer, colonne droite vide | Grille 6/5, mot géant, mentions. Colonne droite remplie, même hauteur que la gauche. | pied de page | ☑ |

**13 blocs de composition, 13 familles distinctes, aucune répétée.**
La 404 en ajoute une 14ᵉ qui n'apparaît pas sur l'accueil.

## 7. MODALES

| # | Modale | Résultat | ✓ |
|---|--------|----------|---|
| D1 | `modal-start` | Réécrite. Options numérotées, filets, aucun icône décoratif. | ☑ |
| D2 | `modal-booking` | Réécrite. Calendrier à arêtes franches, créneaux, état vide traité. | ☑ |
| D3 | `modal-project` | Réécrite. 7 étapes, dropzone, liste de fichiers, état vide traité. | ☑ |
| D4 | `modal-urgent` | Réécrite. | ☑ |
| D5 | `modal-refer` | Réécrite, grille de commissions en accordéon. | ☑ |
| D6 | `modal-estimate` | Réécrite. 8 étapes, prix révélé au ressort. | ☑ |

## 8. COMPOSANTS

Les 22 composants de l'inventaire réécrits. Aucun ne conserve son ancien
markup ni son ancien style.

| # | Avant | Après | ✓ |
|---|-------|-------|---|
| E1 | `.btn` pilule + orbe | `.btn` rectangulaire, filet d'accent tracé au survol, états chargement et désactivé | ☑ |
| E2 | `.bezel` double bordure arrondie | `.plate`, fond plein, filet 1 px, aucune ombre | ☑ |
| E3 | `.eyebrow` | `.label` mono. **4 chapeaux sur toute la page** (budget : 1 pour 3 sections) | ☑ |
| E4 | `.section-title` / `.section-sub` | `.head`, empilement vertical strict, jamais de paragraphe flottant à droite | ☑ |
| E5-E6 | Champs et lignes | Étiquette mono au-dessus, erreur dessous, `aria-invalid`, focus interne, **état désactivé** ajouté en phase 4 | ☑ |
| E7 | `.wizard-bar` | `.progress` avec `role="progressbar"` et `aria-valuenow` réel | ☑ |
| E8-E10 | Options, choix, cases | Listes filetées, `aria-pressed`, cible cliquable entière | ☑ |
| E11 | Dropzone | Réécrite, état vide explicite | ☑ |
| E12 | Modales | Réécrites, `overscroll-behavior: contain`, piège de focus, retour au déclencheur | ☑ |
| E13 | Calendrier | Réécrit, jours avec `aria-label` et `aria-pressed`, état désactivé traité | ☑ |
| E14 | 5 variantes de carte identiques en silhouette | Feuille, bande projet, pastille, cellule bento : 4 objets réellement distincts | ☑ |
| E15 | `.faq-item` | Réécrit | ☑ |
| E16 | Curseurs | Piste = filet, poignée = carré franc, `id` + `<label for>` | ☑ |
| E17 | Barres ROI | Sans piste de fond | ☑ |
| E18-E21 | Stats, trust, statuts, pastilles | Refondus dans les nouvelles sections | ☑ |
| E22 | 60 icônes Phosphor via feuille unpkg bloquante | 16 icônes Tabler vendorisées, sprite SVG local de 4 Ko, inline. Les 44 autres remplacées par un numéro ou une étiquette mono. | ☑ |

## 9. TOKENS

Les 17 tokens de l'ancien système supprimés. Aucune valeur en dur hors
`tokens.css`.

| # | Avant | Après | ✓ |
|---|-------|-------|---|
| F1-F7 | Bleu marine, bourgogne, pêche | Ciment froid, encre, minium. Deux thèmes complets. **Ratios remesurés en phase 4**, trois commentaires du fichier annonçaient des chiffres faux et ont été corrigés. | ☑ |
| F8 | 3 rayons (999 / 24 / 14) | `--radius: 0`, une seule valeur, partout | ☑ |
| F9 | 2 easings | `--e-snap`, `--e-drive`, `--e-brake` | ☑ |
| F10-F11 | Clash Display + Satoshi via CDN Fontshare | Archivo variable (wght + wdth), Chivo, Martian Mono. Auto-hébergées, 6 woff2. | ☑ |
| F12 | `--nav-h: 64px` | `--nav-h: 3.5rem` (56 px) | ☑ |
| F13 | Aucune échelle d'espacement | `--s-1` à `--s-11` sur base 8, plus 3 respirations de bande inégales | ☑ |
| F14 | Aucune échelle typo | `--fs-1` à `--fs-8` | ☑ |
| F15 | Ombres non tokenisées | Aucune ombre sur le site. L'élévation se lit au changement de surface. | ☑ |
| F16 | ~40 durées en dur | `--t-1` à `--t-4` | ☑ |
| F17 | 18 hex en dur dans le HTML | Supprimés. Un seul accent, verrouillé. | ☑ |

## 10. ANIMATIONS

Chaque animation porte sa justification en commentaire dans `js/motion.js`.

| # | Avant | Après | ✓ |
|---|-------|-------|---|
| G1 | Preloader | Supprimé | ⊘ |
| G2 | Hero line-mask | Montée du sous-titre et des boutons seulement. Le titre ne bouge pas. | ☑ |
| G3 | Marquee CSS | Supprimé | ⊘ |
| G4 | `reveal-up` global | `.rise` groupé par parent, décalage 70 ms | ☑ |
| G5 | Parallaxe hero | Remplacée par la compression du titre sur l'axe `wdth` | ☑ |
| G6 | Pile services, fond translucide | Opacité sur le contenu seulement, fonds toujours opaques | ☑ |
| G7 | Pan horizontal épinglé **cassé** | Supprimé. Remplacé par le défilement interne des captures, sans pin. | ☑ |
| G8 | Compteurs stats figés | Compteurs de la bande de spécification, fonctionnels | ☑ |
| G9 | Projecteur au curseur | Aperçu de secteur au survol et au focus | ☑ |
| G10 | Hovers hétérogènes | Une seule micro-interaction, un filet d'accent tracé depuis la gauche, répétée partout | ☑ |
| G11-G13 | Modales, wizard, menu | Réécrits | ☑ |
| G14 | Lenis | **Supprimé.** | ⊘ |
| G15 | Compteur de prix | Ressort réel, intégrateur maison, sans dépendance | ☑ |

## 11. LOGIQUE MÉTIER — vérifiée intacte

| # | Logique | État |
|---|---------|------|
| H1 | Envoi FormSubmit AJAX + multipart | Conservé, avec repli sans pièce jointe |
| H2 | Validation | Conservée, plus focus sur le premier champ en erreur et `aria-invalid` |
| H3 | Calendrier : jours ouvrables, préavis 24 h, horizon 42 j | Conservé à l'identique |
| H4 | Wizard projet 7 étapes, 10 Mo | Conservé à l'identique |
| H5 | Grille `PRICING` | Conservée à l'identique |
| H6 | ROI : 7 presets, 8 tâches pondérées, 3 sources de valeur | Conservé à l'identique |
| H7 | Courriel de contact et sujets | Conservés. **Tous les `name` de champs inchangés.** |
| H8 | Contenu textuel français | **Réécrit en phase 4 dans la voix, faits conservés.** |

---

## 12. VIOLATIONS — tableau à jour

### Les 4 lignes rouges

| Violation | Vérification | Résultat |
|---|---|---|
| `:focus-visible` partout | **177** éléments interactifs, style calculé lu un par un | **0 sans anneau** ☑ |
| Curseurs avec `id` + `<label for>` | 11 curseurs, 53 champs au total | **0 sans étiquette** ☑ |
| Piège de focus + retour au déclencheur | 6 modales **et le menu plein écran** | **0 fuite** ☑ |
| `width`/`height` sur les images | 21 images | **0 sans dimensions**, CLS mesuré à **0** ☑ |

### 🟠 Trouvés en phase 4, que la phase 3 avait manqués

| # | Violation | Où | Correction |
|---|---|---|---|
| 1 | **Bande morte jamais fermée.** Les deux côtés de chaque jonction cumulaient leur respiration. 6 jonctions sur 12 dépassaient 250 px de vide non peint, jusqu'à **323 px**. C'est le bug visuel n° 4 de l'audit, déplacé et par endroits aggravé. | `app.css` bandes | La respiration appartient à la section qui **arrive**, jamais aux deux. Plage passée de 112–323 à **112–211 px**, 0 au-delà de 250, 7 paliers distincts. `-1 485 px` de hauteur de page. ☑ |
| 2 | **Menu plein écran non atteignable au téléphone.** Le menu (`z 60`) recouvrait la barre (`z 40`), donc le bourgeon devenait inatteignable. Sur téléphone il n'y a pas de touche Échap : le seul moyen de fermer était de choisir un lien. | `tokens.css`, `main.js` | `--z-nav: 70`. Bourgeon confirmé cliquable par test de point. ☑ |
| 3 | **Menu plein écran sans piège de focus.** La tabulation sortait de l'overlay et se promenait dans le contenu couvert derrière. Le focus n'y entrait pas non plus à l'ouverture. | `main.js` | Cycle piégé, barre incluse. Focus entre à l'ouverture, revient au bourgeon à la fermeture. Les deux vérifiés. ☑ |
| 4 | **`theme-color` ne suivait pas la bascule.** Deux balises pilotées par `prefers-color-scheme` : la barre du navigateur restait claire quand on passait en sombre à la main. | `index.html`, `404.html`, `main.js` | Une seule balise sans `media`, posée avant le premier rendu et mise à jour à la bascule. ☑ |
| 5 | **`will-change: transform` permanent** sur 5 captures de 900 × 9 195 px et 4 feuilles plein écran. ~33 Mo de couche compositeur par image, réservés pour toute la vie de la page. Symptôme : les captures d'écran expiraient. | `app.css` | Retiré. GSAP pose et retire `will-change` lui-même le temps du scrub. ☑ |
| 6 | **Double envoi possible.** Le bouton d'envoi du calcul par courriel n'avait ni état de chargement ni désactivation. | `main.js`, `app.css` | Désactivé pendant la requête, état `.btn-icon.is-loading` ajouté. ☑ |
| 7 | **« Automatisé » débordait sa colonne** de 5 px dans les 6 lignes du comparatif, et empiétait sur la barre. | `app.css` | Colonne portée de 4,5 rem à 6 rem. 0 débordement. ☑ |
| 8 | **Cibles tactiles sous le minimum.** Les 6 liens du pied de page mesuraient 21 px de haut. | `app.css` | 39 px. Plus aucune cible sous 24 px sur la page. ☑ |
| 9 | **Croix du bourgeon décalée.** Les deux filets tombaient dans deux rangées de grille : ils pivotaient autour de centres distants de 2 px, la croix ressemblait à un chevron. | `app.css` | Filets superposés au même point. Centres mesurés identiques. ☑ |
| 10 | **Montant du calculateur muet** pour un lecteur d'écran : c'est un `<b>`, hors de toute région vivante. | `index.html`, `main.js` | Région `role="status"` annoncée sur `change`, donc une fois par réglage et non à chaque image du glissement. ☑ |
| 11 | **Légende des secteurs inaccessible.** Le `<figure>` était `aria-hidden`, or sa légende porte la seule description de ce qu'on construit pour le secteur. | `index.html` | `aria-hidden` retiré, images gardées décoratives (`alt=""`), légende en région polie annoncée au focus. ☑ |
| 12 | **Ratios de contraste faux dans le code.** `tokens.css` annonçait 6,42:1 pour `--danger` (réel 5,81), 6,05 pour `--ok` (5,89), 7,88 en sombre (8,26). | `tokens.css` | 9 commentaires remesurés et corrigés. Toutes les valeurs passent AA. ☑ |
| 13 | **`autocomplete` absent** sur 4 champs. | `index.html` | `url` sur le site actuel ; `off` sur les 3 champs qui décrivent une **autre** entreprise que celle du visiteur, pour que le gestionnaire de mots de passe n'y mette pas ses propres coordonnées. ☑ |

### Les 8 lignes que vous avez demandées explicitement

| Ligne demandée | État réel, mesuré | Verdict |
|---|---|---|
| `color-scheme` | Déclaré par thème dans `tokens.css`, calculé `light`/`dark` selon le thème | Déjà fait ☑ |
| `scroll-margin-top` | **Volontairement absent.** `scroll-padding-top: calc(var(--nav-h) + var(--s-6))` = 88 px sur `html`. Mesuré : une ancre pose la section à 88 px, soit **32 px sous une barre de 56 px**. | Voir désaccord ci-dessous |
| focus + `aria-invalid` sur le 1er champ en erreur | `validate()` retient le premier mauvais champ et l'appelle en `focus()`, `markField()` pose `aria-invalid` et `aria-describedby` | Déjà fait ☑ |
| `aria-hidden` sur les icônes décoratives | 89 `svg` sur la page, **0** sans `aria-hidden` | Déjà fait ☑ |
| `theme-color` | Présent mais **cassé** : piloté par `prefers-color-scheme`, ne suivait pas la bascule | Corrigé ☑ (🟠 4) |
| Lien d'évitement | Présent sur `index.html`, **absent de `404.html`** | Corrigé ☑ |
| `tabular-nums` | 48 éléments chiffrés, **0** sans `tabular-nums` | Déjà fait ☑ |
| `text-wrap: balance` | 45 titres, **0** sans | Déjà fait ☑ |

**Désaccord motivé sur `scroll-margin-top`.** Les deux propriétés font la
même chose par deux bouts. `scroll-padding-top` sur le conteneur de
défilement se déclare **une fois** et couvre toutes les ancres, présentes et
futures, y compris celles qui arrivent depuis la 404. `scroll-margin-top`
doit être posé sur **chaque** cible : onze sections aujourd'hui, plus toute
section ajoutée demain, avec l'oubli comme mode d'échec par défaut. Surtout,
les deux **s'additionnent** : poser `scroll-margin-top: 88px` par-dessus le
`scroll-padding-top` existant enverrait chaque ancre 176 px trop bas. J'ai
donc mesuré au lieu d'ajouter, et le dégagement est correct. Si vous voulez
quand même la propriété nommée dans le code, il faut retirer l'autre, pas
l'empiler. Dites-le et je fais l'échange.

### 🟡 Restants, assumés

| Sujet | Constat | Position |
|---|---|---|
| Filigrane `APED` du pied de page | Texte de 317 px à **1,39:1** en clair, 1,56:1 en sombre | Assumé. `aria-hidden="true"`, `user-select: none`, aucune information. Le monter en contraste en ferait un titre concurrent du CTA juste au-dessus. |
| Cellule bento photographique | Contraste non calculable automatiquement : fond photo + voile dégradé de 0,45 à 0,88 | Jugé à l'œil dans les deux thèmes, l'encre inversée tient. Le voile devient un aplat sous `prefers-reduced-transparency`. |
| 62 attributs `style` en ligne | Positions de grille et marges ponctuelles | Aucun hex, aucune couleur, aucune valeur hors système. Coût de maintenance faible, gain de lisibilité nul à les déplacer. |
| Navigation clavier du calendrier | Tabulation seulement, pas de flèches directionnelles | Le motif `grid` ARIA complet est un chantier à lui seul. Les 42 jours sont atteignables et étiquetés. |
| `prefers-contrast` | Non traité | Les ratios sont tous ≥ 5,18 hors CTA à 4,70. Rien à renforcer d'urgent. |
| Une tâche longue de **78 ms** | Initialisation des ScrollTrigger. Était mesurée à 56 ms en phase 3. | Notée comme demandé. Sous le seuil INP de 200 ms. C'est le point à surveiller si d'autres animations s'ajoutent. |

### Bugs visuels de l'audit initial — un par un

| # | Bug | Vérification | Preuve |
|---|---|---|---|
| 1 | Texte superposé aux images dans le pan épinglé | Chevauchement calculé sur les **5** bandes projet : `0 px` partout | `bug1-realisations-aucun-chevauchement.png` |
| 2 | Nav illisible par-dessus le contenu | Fond `rgb(16,18,17)` **opaque**, `backdrop-filter: none`, `z-index: 70`. Test de point : le lien de la barre est bien la cible au-dessus du contenu | `bug2-barre-opaque.png` |
| 3 | Compteurs figés à `0` | `12+` et `100 %` atteints. Le `0` de la 4ᵉ cellule est une vraie valeur, pas un compteur cassé | `bug3-compteurs-vivants.png` |
| 4 | Bande morte de 250 px | **N'était pas mort.** 6 jonctions sur 12 au-dessus de 250 px, jusqu'à 323. Corrigé en phase 4 : 112–211 px, 0 au-delà de 250 | `bug4-jonction-secteurs-calculateur.png` |
| 5 | Colonne droite du footer vide | 2 enfants, 395 × 332 px, **exactement la hauteur de la colonne gauche**, courriel + 6 liens | `bug5-footer-colonne-droite-clair.png` |

Autres preuves : `hero-clair-1440.png`, `hero-sombre-1440.png`, `hero-390.png`,
`services-feuille-1.png`, `menu-plein-ecran-390.png`, `bourgeon-croix-390.png`,
`404-index-deraille-1440.png`, `404-index-deraille-390.png`.

---

## 13. ÉTATS ET DÉTAILS

| État | Composants concernés | Traitement |
|---|---|---|
| **Chargement** | 5 boutons de soumission + le bouton d'envoi du calcul | `.btn.is-loading` et `.btn-icon.is-loading` : barre indéterminée sous le bouton, `cursor: progress`, bouton désactivé, libellé remplacé par `Envoi en cours…` / `Réservation en cours…` / `Calcul en cours…`. **Aucun cercle qui tourne.** Barre statique sous mouvement réduit. |
| | Images | `background: var(--surface-1)` en attendant le décodage, dimensions déclarées, donc aucune réserve à faire. |
| | Polices | `font-display: swap` + préchargement des 3 fontes latines. |
| **Vide** | 3 listes qui peuvent l'être | `#roiTop3Empty` (tous les curseurs à zéro), `#slotsEmpty` (plus rien de libre ce jour-là), `#prFileEmpty` (aucun fichier, étape facultative). Classe `.empty` unique, filet de tête, texte mono. |
| | Calendrier | `Sélectionnez une date` tant qu'aucune date n'est choisie. |
| **Erreur** | 26 champs | `.field.is-invalid` : bordure et lavis danger, message sous le champ, `aria-invalid="true"`, `aria-describedby` posé et retiré. |
| | 6 formulaires | `.form-status.is-err` dans une région `role="status" aria-live="polite"`. Chaque message porte la suite à faire, pas juste le problème : « Réessayez, ou écrivez directement à … ». |
| | Fichiers | Ligne `.is-warn` quand la limite de 10 Mo est atteinte. |
| | Estimateur | Si l'envoi échoue, le prix est **quand même** révélé. |
| **Désactivé** | Boutons | `.btn[disabled]` et `[aria-disabled="true"]` : opacité 0,45, `not-allowed`, filet d'accent supprimé. `.btn-icon[disabled]` : 0,35. |
| | Calendrier | Jours hors jours ouvrables ou hors fenêtre 24 h – 42 j : opacité 0,4, bordure transparente. Flèches de mois désactivées aux bornes. |
| | Champs | **Ajouté en phase 4** : `input/select/textarea:disabled` + étiquette atténuée. Aucun champ du site ne l'est aujourd'hui, l'état existe pour le jour où. |
| **Scrollbar** | Document, modales, menu | `scrollbar-color` + `scrollbar-width: thin` pour Gecko, `::-webkit-scrollbar` + `-track` + `-thumb` + `-corner` pour Blink et WebKit. Les deux thèmes, via tokens. Pouce qui s'assombrit au survol. |
| **Sélection de texte** | Global | `::selection` en minium, encre inversée, les deux thèmes. `user-select: none` sur le seul filigrane. |
| **Transition clair ↔ sombre** | Global | Classe `.theme-shifting` posée **juste avant** la bascule et retirée après 560 ms : transition de 520 ms sur `background-color`, `border-color`, `color`, `fill`, avec `--e-drive`. `document.startViewTransition()` quand disponible et mouvement non réduit. **Jamais au chargement.** Coupée sous `prefers-reduced-motion`. Identique sur la 404 depuis la phase 4. |
| **Contrastes forcés** | Global | **Ajouté en phase 4** : bloc `@media (forced-colors: active)`. Sans lui, les filets d'accent des boutons, la barre de progression et la barre de la 404 disparaissaient en contraste élevé Windows. |
| **Encoche** | Barre et pied de page | `env(safe-area-inset-top)` sur la barre, `env(safe-area-inset-bottom)` ajouté en phase 4 sur le dernier bloc. |

---

## 14. MESURES

| | Avant | Phase 3 | Phase 4 |
|---|---|---|---|
| LCP | non mesuré, préloader de 1,3 s | 240 ms | **164 ms** |
| CLS | garanti non nul | 0 | **0** |
| Tâches longues | non mesuré | 1, 56 ms | 1, **78 ms** |
| Poids transféré | non mesuré | 441 Ko | 452 Ko |
| Erreurs console | 0 | 0 | **0** |
| Requêtes tierces | 3 origines | 0 | **0** |
| Débordement horizontal | oui | non | **non**, à 1440 et à 390 |
| Vide de jonction, plage | ~250 px constatés | **112–323 px, 6 au-delà de 250** | **112–211 px, 0 au-delà de 250** |
| Hauteur de page | — | 18 712 px | **17 227 px** |
| Éléments interactifs sans anneau de focus | ~toute la page | 0 sur 78 | **0 sur 177** |
| Contraste, échecs relevés | inconnu | 4 rouges | **0** en clair, **0** en sombre |
| Contraste minimum | inconnu | 4,70:1 annoncé | **4,70:1** clair et **5,20:1** sombre, texte du CTA sur aplat, remesurés |
| Cibles tactiles sous 24 px | non mesuré | 6 | **0** |

Le poids monte de 11 Ko : la 404 refaite précharge la troisième fonte et le
serveur de test répond en `no-store`, donc rien n'est servi depuis le cache.

---

## 15. RÉSERVES

1. **État des modales absent de l'URL.** Une modale n'est pas partageable par
   lien. Ajout de fonctionnalité, pas correction de surface. **Mis de côté à
   votre demande.** Seule ligne encore ouverte de l'inventaire.
2. **Une tâche longue de 78 ms** au chargement, due à l'initialisation des
   ScrollTrigger. Elle a monté depuis les 56 ms de la phase 3. Sous le seuil
   INP, **notée à votre demande**, à surveiller si d'autres animations
   s'ajoutent.
3. **`@unlumen-ui` toujours inactif**, faute de clé de licence.
4. **Vérification live faite en CDP direct** (`puppeteer-core` sur le Chrome
   du poste), pas via le MCP `chrome-devtools` : ses captures d'écran
   expiraient systématiquement. Le symptôme a mené au 🟠 5, donc l'outil
   défaillant a quand même trouvé un vrai bug. Playwright MCP n'est pas
   exposé dans cette session.

---

## 16. NUIT DU 29 AU 30 JUILLET 2026 — VÉRACITÉ ET BOUCLE DE VIE

Chantier mené sans arbitrage du propriétaire, sur mandat explicite de
tout traiter. **Deux documents en portent le détail** :
`AUDIT-VERACITE.md` (l'encadré de tête : les 36 constats et leur
traitement) et `DECISIONS-NUIT.md` (les 31 arbitrages, ce qui a été
écarté, ce qui reste bloqué, les réserves).

### Ce qui est livré

| | |
|---|---|
| **Les 36 constats de véracité** | traités. Deux points restent suspendus à une information que seul le propriétaire a : les cinq adresses en ligne des projets, la pile réelle des projets clients |
| **Les six formulaires livrent** | FormSubmit n'est toujours pas activé — un clic dans la boîte du propriétaire. En attendant, un repli `mailto:` paraît sur échec avec le message déjà rempli. Mesuré : 6 / 6 |
| **La boucle de vie des huit plaques** | mouvement permanent, arrêt net au survol, pause hors écran et onglet caché, aucune boucle sous mouvement réduit, tombe au palier 1 |
| **La mention des délais** | une ligne : « Semaines estimées, variables selon la demande et la file d'attente » |
| **La règle permanente** | `CLAUDE.md § 0.A` — quatre questions, et la règle de propagation |

### Trois défauts trouvés en mesurant, que l'audit n'avait pas vus

1. **Sept textes à 10-12 % d'opacité en permanence** (1,15:1 à 1,36:1) :
   leur déclencheur ne partait jamais, parce que `content-visibility:
   auto` périme les positions calculées par ScrollTrigger. Dégât corrigé
   (`immediateRender: false`), **cause notée comme ouverte**.
2. **« Itinéraire » à 1,34:1** dans la figure Google.
3. **Le survol des cartes de contact faisait BAISSER le contraste** à
   4,41:1, sur le texte qu'on est en train de lire.

### Cinq faux verdicts d'instrument, corrigés

Chacun aurait fait condamner du code sain ou déclarer un défaut absent.
Ils sont écrits en entier dans `CLAUDE.md § 8`, points 20 à 24 :
`transform` ne contient pas les propriétés individuelles · une amplitude
absolue mélange trois mouvements · l'englobant d'un élément tourné est
plus grand que lui · un nombre fixe de tabulations ne mesure pas un
piège de focus · une fenêtre trop courte cache le mouvement le plus
lent. Plus, dans `§ 0.B` : **ne jamais conclure sur la pire image.**

### Un test qui verrouillait son défaut

`cadeau-check.mjs` affirmait, **comme une qualité**, que les deux guides
sont verrouillés jusqu'à ce qu'on donne une adresse — alors que le pied
de page les donne directement. Le test passait *parce que* le défaut
était là. Trois verdicts retournés, l'ancien nom du relevé
(`remiseCacheeAuDepart`) remplacé par ce qu'on veut vraiment mesurer.

### Réserves

1. **L'amplitude de la boucle est un jugement, pas une mesure.** Les
   chiffres sont au-dessus des seuils de perception ; l'écart entre
   « ça vit » et « ça danse » ne se mesure pas. Trois variables dans un
   seul bloc, `css/app.css § 13bis`.
2. **Le chiffre du calculateur a baissé de 27 %** — de 53 751 à
   ≈ 39 100 $. Le double comptage retiré n'est pas négociable ; le reste
   est un choix qui peut se renverser en publiant la méthode.
3. **La pause sur onglet caché n'est pas prouvable sur ce poste.**
   Chromium sous Playwright ne modélise pas la visibilité d'un onglet,
   sans tête comme avec tête. Le branchement est prouvé, la plateforme
   ne l'est pas. À vérifier à la main.
4. **Les deux PDF n'ont pas été relus** contre le site corrigé. Une
   seule affirmation vérifiée dedans — les 24 tâches, vraie.
5. **`formsubmit.co` est une requête tierce à l'envoi**, alors qu'une
   plaque du hero dit « 0 · service extérieur ». Raisonnement complet
   dans `DECISIONS-NUIT.md § 3 · R6` — c'est un raisonnement, pas une
   mesure.

---

## Chantier section 02 · Services — 2026-07-30

Document complet : **`CHANTIER-SERVICES.md`**.

| | Fait | Preuve |
|---|---|---|
| Le défaut d'affichage | ✅ cause trouvée et supprimée | `tools/svc-cause.mjs` — le `start` du pin était calculé 284 px trop tôt à toute arrivée qui n'est pas « par le haut », 10 passes sur 10 ; la scène se téléportait de 275-280 px en une image |
| Trois autres défauts du rail | ✅ | bouton « suivant » visant au-delà de `st.end` (ratio 1,066 à 1,137) · `is-pinned` posée sans condition et jamais retirée · plaque « Québec » débordant de 28-38 px sur le seuil |
| Le test qui verrouillait le défaut | ✅ réécrit en entier | `tools/services-check.mjs` — l'ancien défilait en sauts, ne chargeait jamais par `#services`, et ne regardait jamais si quelque chose était peint par-dessus |
| Les quatre services visibles d'un coup | ✅ | 4 / 4 noms, bénéfices et délais lisibles sans un clic ; **4 / 4 aussi sans JavaScript** |
| Détail au clic, fermeture sans perte de position | ✅ | `<details>` natif ; déplacement de la carte cliquée mesuré à **0 px** |
| Images beaux visuels | ⚠️ **partiel, et c'est argumenté** | trois photographies sous licence écrite entrent dans les vues ; **aucune image de site, d'automatisation ou de logiciel du dépôt n'a de licence documentée** — `CHANTIER-SERVICES.md § 3.2` et décision D2 |
| Le lecteur 360 depuis la carte Immobilier | ✅ | `nbLecteurs: 1` — il déclenche celui de la section 05, il n'en construit pas un second |
| Animations : 5 captures minimum + écarts de pixels | ✅ **4 / 4** | `tools/svc-sequences.mjs` |
| Contrastes, débordement, paliers, cascade, prix | ✅ | 0 partout ; `A RETIRER dans le source : 0` ; `0 écart sur 253 968 propriétés` |
| Ce qui reste au propriétaire | 4 points | la vidéo de la plaque « 7 » · les 5 adresses des projets · qui tourne les panoramas · `og.png` qui dit 24 h |
