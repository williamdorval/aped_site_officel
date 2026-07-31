# REFONTE IMMERSIVE — le document de conception

Chantier du 2026-07-31, branche `refonte-immersive`. Retour arrière :
`git switch main` (étiquette `avant-immersif`, copie disque
`../sauvegarde-avant-immersif-2026-07-31`).

Ce document dit CE QUI se construit et POURQUOI. Il précède le code.
Les mesures de référence « avant » : LCP 184 ms · CLS 0 · 59,9 i/s ·
0 image > 20 ms · 0 erreur console (`refonte-captures/avant-refonte`).

---

## 1 · CE QUE L'ANALYSE A ÉTABLI

**Alche (vérifié au pixel, rapport agent)** : les sas sont des pistes
de défilement au DOM vide (1 à 1,5 écran) dont l'unique fonction est de
donner à une progression 0→1 la place de jouer la transition. Ils vont
par paires (sortir d'un monde, entrer dans l'autre), avec un point
sombre entre les deux. Le rail d'orientation les absorbe : 5 libellés
pour 12 zones, le visiteur ne voit jamais la plomberie. UNE seule
inversion de luminance sur toute la page — et elle n'est pas un fondu,
c'est une arête géométrique qui avale l'écran. Un seul attribut sur
`<body>` pilote tout l'état.

**Les huit références mondiales (rapport agent)** : six invariants —
une seule matière déclinée partout ; un objet persistant qui se
transforme (jamais de coupes) ; le contrat de lecture annoncé en trois
secondes ; le scroll natif sacré ; l'orientation permanente ; le rythme
tension/repos avec la performance comme plancher. Don't Board Me (SOTY
Users' Choice 2024, DOM/CSS sans WebGL) bat les cathédrales 3D au vote
du public : la cohérence vend, pas la technologie. Ce qui sert la vente :
CTA à chaque station, transitions nettes, typographie comme spectacle,
ludique après la conversion. Ce qui la dessert : scrolljacking (NN/g :
les visiteurs en mode tâche — nos patrons — sont les moins tolérants),
intro bloquante, virtuosité continue.

**L'existant** : le site possède déjà la grammaire des lauréats —
matière limaille, quatre verbes, trame qui traverse, orientation
jamais sacrifiée. L'écart n'est pas technologique. Il est dans le
RYTHME : douze frontières fines qui se ressemblent, quatre bandes
d'encre dispersées sans récit, un contrat d'entrée qui annonce la
matière mais pas le voyage.

## 2 · LA RÉSOLUTION DE LA TENSION

Être spectaculaire ET limpide se résout par TROIS décisions :

1. **L'immersion vit dans l'architecture, pas dans le poids.** Aucun
   octet de média n'entre sur le chemin critique. Les sas sont des
   divs vides + un canvas réutilisé (le moteur limaille existant).
2. **Peu de moments, grands.** Trois sas réels au lieu de douze effets.
   Entre eux, les seuils légers existants (mesurés, ils marchent).
   Le reste de la page est CALME — c'est le calme qui rend les sas
   spectaculaires.
3. **L'orientation absorbe le spectacle.** Le rail numéroté 01-12 ne
   disparaît jamais ; pendant un sas, le cran roule (G2 existant) et le
   visiteur voit qu'il avance. Un sas n'est jamais une pause du voyage,
   c'est le voyage.

## 3 · L'ARC — la refonte structurelle

**Un seul récit de luminance** (au lieu de quatre bandes d'encre
dispersées) :

```
CIMENT ──────────────────────► ENCRE ────► CIMENT ─────────────► ENCRE
Accueil·Services·Démos·Secteurs  Visite·Calc  Comparatif→Contact   Pied
        ACTES I-II              ACTE III        ACTES IV-V         coda
```

- **Actes I-II · L'atelier et la preuve** (01→04) : plein jour, ciment.
  La bande d'encre du seuil des Services SAUTE (elle brisait l'arc).
- **Acte III · L'instrument** (05→06) : le seul monde sombre. Déjà
  encre dans le code actuel, déjà pensé comme « on entre dans
  l'instrument à la Visite, on en ressort au Calculateur » — l'arc
  existait en germe, on le rend spatial. Le minium y est le plus
  concentré : c'est l'acte où le visiteur AGIT.
- **Actes IV-V · La méthode et la décision** (07→12) : retour au jour.
  La plaque sombre de Référence reste : un objet encadré, pas un monde.
- **Coda · le pied** : la nuit à la fin de la traversée. Déjà encre.

Ordre et ancres des sections : INCHANGÉS. L'ordre actuel est un bon arc
de vente et les ancres sont des adresses publiques.

## 4 · LES TROIS SAS

Un sas = une piste `div[data-sas]` au DOM presque vide, hauteur en
`vh`, qui donne à la transition la place d'exister. Sans JavaScript ni
au palier 3 : la piste se replie (height réduite via `html.js` absent)
et il ne reste qu'une frontière nette — l'information ne dépend jamais
du mouvement.

**SAS 1 · LA DESCENTE (04 Secteurs → 05 Visite) — le moment
impossible.** ~120 vh. Une arête d'encre AVALE l'écran de haut en bas
(V1, sens de lecture d'une page), le bord fait de grains (V3) — la
géométrie d'Alche, la matière d'APED. Dans le noir, des grains de
minium coulent et FORGENT le titre de l'acte — le moteur limaille
réutilisé, piloté par la progression (positions déterministes par
graine, ressort ζ=1 encodé en easing par grain). À 85 % de progression,
le vrai titre DOM bascule en un cran (V4, une image) sous les grains
déjà en place. Le texte n'est jamais scrubbé en opacité : le canvas est
décoratif, le titre existe en DOM, l'information vit aussi dans le
`.head` de la section. C'est l'instant « je ne pensais pas qu'un site
pouvait faire ça » : la signature du hero, à l'échelle de l'écran, au
pivot exact du récit de vente — entre « ce qu'on montre » et « ce que
ça vous rapporte ».

**SAS 2 · LA REMONTÉE (05 Visite → 06 Calculateur).** Construit, puis
REFAIT en cours de chantier : la version piste (80-180 vh) rendait des
écrans de ciment vide — mesurés à 0 % d'écart entre captures, donc du
défilement volé. La forme finale est un CALQUE sans piste (D-568) : le
volet d'encre couvre le début du Calculateur et se dégage vers le
haut, la question « combien vous coûte le travail fait à la main » se
découvre sous l'arête de grains. Zéro pixel de page ajouté. La sortie
du monde sombre se joue donc à 05→06 (là où le code disait déjà « on
en ressort ici »), pas à 06→07.

**SAS 3 · LA CLÔTURE (12 Contact → pied).** ~60 vh. Le fil de la
traversée (§ 5) descend, se fait trame (V3), et se SOUDE dans la marque
du pied (`.footer-mark`, cible du cran existant). La nuit tombe sur
l'atelier. « Fin de la traversée » — le libellé existe déjà.

Les neuf autres frontières gardent leurs seuils légers actuels (G1-G4,
mesurés). Douze sas seraient le tic des « douze séparateurs ».

## 5 · LE FIL — l'objet persistant

La traversée doit se lire comme UN mouvement continu. L'objet qui la
porte : **le fil du chantier** — un filet vertical de 1 px, déjà présent
en germe (barre de lecture du rail, fil scrubbé du Processus, filets
soudés des seuils). La refonte le rend LISIBLE comme un seul objet :

- il naît au hero (le filet du socle, 12ᵉ pas existant) ;
- il descend avec le visiteur dans le sas 1 et devient MINIUM dans
  l'acte sombre (la couleur d'action, l'acte où l'on agit) ;
- il redevient encre-sur-ciment à la remontée ;
- il se soude dans la marque au pied (sas 3).

Coût : un élément par acte, transform/scaleY seulement, scrub permis
(aucun texte). Ce n'est pas un douzième séparateur : c'est le MÊME
objet à des stations différentes, et les sas montrent le passage.

## 6 · L'ARRIVÉE — le contrat

La séquence d'entrée actuelle (rideau, jauge, compteur, monogramme,
douze pas — mesurée, 11/11 visibles) RESTE. Elle gagne un dernier
temps : **l'assemblage du rail**. Après le douzième pas, les douze
crans du rail arrivent décalés et se reprennent (V2), le « 01 » roule
en place (V4). Le contrat n'est pas « scroll to explore » (cliché
banni) : c'est le VOYAGE montré — douze stations, vous êtes à la
première. L'annonce vit dans l'orientation elle-même.

## 7 · CE QUE CHAQUE SECTION DEVIENT

| № | Section | Verdict | Quoi |
|---|---|---|---|
| 01 | Accueil | GARDÉE + contrat | composition 12 pas mesurée (LCP 84-112 ms, 11/11 visibles) — meilleure que tout remplacement ; + assemblage du rail (§ 6) |
| 02 | Services | GARDÉE, re-peau | mécanique piste refaite 2× et prouvée (ancres 10/10, 0 px) ; perd sa bande d'encre (l'arc), entre dans l'acte II ciment |
| 03 | Démonstrations | GARDÉE | 4 avant/après tout-markup, cran sans JS — construits il y a un jour, mesurés |
| 04 | Secteurs | entrée refaite | machinerie des 13 aperçus gardée (60 Ko de CSS fonctionnel) ; sa sortie devient le SAS 1 |
| 05 | Visite 360 | tête forgée | son titre naît des grains du sas 1 ; le reste gardé (rien ne part avant le clic — jamais candidate LCP) |
| 06 | Calculateur | GARDÉE, minium amplifié | l'odomètre-ressort est déjà l'acte le plus vivant ; le fil minium le traverse |
| 07 | Comparatif | entrée refaite | reprise V2 au sortir du sas 2 |
| 08 | Processus | GARDÉE | son fil scrubbé rejoint le fil du chantier (§ 5) |
| 09 | Agence | GARDÉE | l'acte humain se joue calme — le contraste avec les sas EST la composition |
| 10 | Référence | GARDÉE | la plaque sombre devient un écho volontaire de l'acte III |
| 11 | Questions | GARDÉE | FLIP mesuré ; une fausseté ici coûte plus qu'un effet n'y rapporte |
| 12 | Contact | GARDÉE | cinq entrées, aucune vide ; le sas 3 partira d'ici |

« Gardée » n'est pas un défaut de courage : chaque forme gardée a des
mesures qui la défendent (colonne Quoi). La refonte immersive est
STRUCTURELLE — l'arc, les sas, le fil, le contrat — pas cosmétique.

## 8 · BUDGET DE DÉGRADATION DES SAS (ira dans CLAUDE.md)

| Palier | Déclencheur (existant) | Ce que les sas deviennent |
|---|---|---|
| 0 | plein | tout : arête + grains + forge du titre |
| 1 | < 64em · coarse · ≤ 4 cœurs · ≤ 4 Go | pistes raccourcies (~60 %), arête sans grains (volet plein), pas de canvas |
| 2 | i/s médiane < 50 | volet instantané par trame (mécanisme existant), pistes repliées |
| 3 | reduced-motion | aucune piste, aucun mouvement — frontières nettes, fonds d'acte posés par CSS statique |

L'escalade reste à sens unique. Ce qui ne tombe JAMAIS : le cran du
rail, la barre de lecture, les fonds d'acte (information de position).

## 9 · CONTRAINTES REPRISES SANS DISCUSSION

Zéro requête tierce · LCP < 300 ms · CLS 0 · 60 i/s · 0 erreur console ·
scroll natif jamais détourné (aucun pin ajouté, aucun snap — NN/g) ·
jamais d'opacité scrubbée sur du texte · état de repos = forme finale ·
`immediateRender: false` · bruit déterministe par graine · ζ = 1 ·
trois matières · quatre verbes · rayon 0, aucune ombre, aucun dégradé,
aucun flou · aucun prix · véracité Q1-Q4 propagée partout.

`content-visibility` : les nouvelles pistes de sas N'Y SONT PAS
soumises (déclencheurs ScrollTrigger piégés par la hauteur réservée —
RESERVES.md). Leurs hauteurs sont fixes en vh : CLS structurellement 0.

## 10 · VISUELS (phase 4) — discipline de véracité

Le site ne contient AUCUNE image de contenu, par décision de véracité
(licences, fausses preuves). La refonte ne rouvre pas cette porte :
aucun visuel généré ne peut jouer une preuve (pas de fausses équipes,
pas de faux locaux, pas de faux projets). Périmètre Higgsfield
légitime : `images/og.png` (qui CONTREDIT le site — « 24 h » contre
12 h partout : le refaire est une correction de véracité), l'art du
404, les couvertures des deux PDF si retenu. Bible de style + feuille
VISUELS-PROMPTS.xlsx + variantes + rejets motivés. Tout visuel qui a
l'air généré est rejeté ; en cas d'hésitation, il ne passe pas.
