# PHASE 10 — LES PASSAGES

2026-07-29. Le chantier précédent avait livré 51 traitements **dans** les
sections et 4 gestes **entre** elles. Celui-ci porte sur le moment de
bascule lui-même : d'une section à la suivante, d'un état à l'autre,
d'un composant au suivant.

Il livre **un** mécanisme — la trame — décliné sur onze passages, plus
**trois corrections de défauts** que la mesure a sortis au passage, dont
un qui rendait la treizième frontière invisible depuis toujours.

---

## 0 · LES TROIS DÉFAUTS TROUVÉS EN MESURANT

Ils comptent plus que les ajouts.

### A · La frontière du pied ne s'est jamais déclenchée

Relevé d'une traversée complète, voiles identifiés **par leur nom** :

```
seuil-02 · seuil-03 · seuil-05 · seuil-06 · seuil-11 · seuil-12   partent
seuil-00 — la frontière du pied                                    JAMAIS
```

**Cause.** ScrollTrigger calcule la position de départ d'un déclencheur à
sa création, puis à chaque `refresh()`. Les douze sections portent
`content-visibility: auto` : tant qu'une section n'a pas été traversée, le
navigateur rend sa taille **réservée**, pas sa vraie hauteur. Les
positions mises en cache sont fausses et le restent — le document grandit
en descendant, les déclencheurs ne bougent plus. Celui du pied finit
**au-delà de la fin du document** : aucun défilement ne peut plus
l'atteindre.

**Ce que ça coûtait en plus du pied :** les frontières 11 et 12 partaient
à `scrollY` 20 005 et 21 180 au lieu de 18 219 et 19 199 — soit **près de
2 000 px trop tard**. L'« annonce » de la section arrivait après la
section.

**Correction.** Les quatre gestes de frontière passent par
`IntersectionObserver`, qui ne met rien en cache et lit la géométrie
réelle. `rootMargin` bas de −8 % place le bord du cadre à 92 % de la
hauteur d'écran : c'est exactement `top 92%`, sans cache.

Ce qu'on **n'a pas** fait : rafraîchir ScrollTrigger en boucle. Un
`refresh()` recalcule tous les déclencheurs du site ; l'appeler à chaque
changement de hauteur pendant une traversée coûte plus cher que le
problème.

**Vérifié par** `trame-check.mjs`, qui exige les sept passages **nommés**.
Une version antérieure les *comptait* : elle en trouvait six, en attendait
sept, et ne pouvait pas dire lequel manquait. Un compte ne remplace jamais
un nom.

### B · La ligne d'état du rideau restait posée sur le hero

Séquence d'entrée filmée au protocole DevTools : les bandes finissent de
s'ouvrir vers 1 340 ms, le rideau n'est retiré qu'à 1 641 ms, et
`.entree-etat` n'avait **aucune animation de sortie**. Pendant ~300 ms,
« MISE EN PLACE » et le compteur restaient peints **par-dessus** le hero
découvert — sur le chapô à gauche, sur la fiche technique à droite. Deux
images consécutives le montrent.

Elle s'efface maintenant avec la plaque, à 760 ms : le compteur a atteint
100 à 800 ms au plus tard, il a fini de dire ce qu'il avait à dire.

### C · La bascule de thème était le dernier fondu du site

`document.startViewTransition` photographie l'avant et l'après et les
**fond** l'un dans l'autre. C'était le seul endroit où un fondu avait
survécu à la phase 8.

---

## 1 · LES SIX RÉFÉRENCES — CE QUI EN A ÉTÉ TIRÉ

Étudiées avec Playwright, pas décrites de mémoire : `tools/refs-structure.mjs`
puis `tools/refs-mesure.mjs`. Les relevés sont dans `tools/_refs/`.

Deux instruments ont dû être écrits avant de pouvoir mesurer quoi que ce
soit — voir § 5.

### Réf. 4 · Pixel reveal — **la plus utile, et de loin**

Ce que la page rend, tuile par tuile :

| | Relevé |
|---|---|
| grille | `repeat(25, 1fr)`, **400 tuiles**, 25 × 16 |
| tuile | 57,6 × 56,2 px, **aplat** `rgb(230,230,230)`, rayon 0, aucune ombre |
| motif | **radial depuis le centre** — reconstruit tuile par tuile |
| paliers | **74**, écart médian **20,2 ms** |
| durée | **1 480 ms** |
| mécanique | la tuile ne s'efface pas : elle **rétrécit sur son centre**. À chaque image le bord reste un carré net. Ce n'est jamais un fondu. |

Le motif reconstruit, rang de disparition ramené à 0–9 :

```
8887665554433344555667888
8876655443332333445566788
8876654332222222334566788
8766543322111112233456678
8766543211100011123456678
8765432210000000122345678
7665432110000000112345667
...
```

**Pris :** la tuile en aplat, le rétrécissement sur le centre, la
quantification du front, la variation de motif d'un passage à l'autre.

**Jeté :**
- **1 480 ms.** Une frontière ne retient pas un visiteur pressé. Chez nous
  **420 ms**, mesuré entre 428 et 465 ms sur les sept passages ;
- **le radial par défaut.** Un front qui part du centre n'a pas de sens de
  lecture, et sur ce site la direction du balayage n'est jamais
  décorative. Le radial reste disponible pour ce qui n'a pas de sens de
  lecture, il n'est utilisé nulle part aujourd'hui ;
- **400 nœuds du DOM.** Douze frontières en feraient 4 800. On dessine
  dans **un** canvas, comme `limaille.js`.

### Réf. 2 · Smooth loader

| | Relevé |
|---|---|
| titre | découpé en lettres, `opacity + transform` |
| cadence | délai **+120 ms par lettre** — 0, 0,12, 0,24, 0,36 s… |
| durée | **1 200 ms** par lettre |
| courbe | `cubic-bezier(0.16, 1, 0.3, 1)` — expo out |
| fond | vidéo en `transform 3s` + `opacity 3s ease-in-out` |
| animations en vol | 40 à t≈770 ms, encore 2 à t≈5 000 ms |

**Ce qui compte, et c'est une idée, pas un chiffre :** il n'y a pas de
loader séparé. Le voile **est** le premier temps du hero — le titre
s'assemble sur fond noir, puis le site émerge derrière lui. La transition
chargement → contenu est un seul mouvement parce que c'est le même
mouvement.

**Chez nous, ça existait déjà** et c'est vérifié : les grains sont semés
sur les **quinze filets dont le rideau est fait**, et ils partent à
l'`animationstart` de la bande du milieu — pas sur une horloge. Le rideau
se disperse en filets et les grains composent APED dans la même seconde,
avec la même matière. La phase 10 n'avait donc rien à inventer ici ; elle
avait un défaut à corriger (§ 0-B).

**Jeté :** les 4,5 s de la référence. Notre séquence tient en **1 641 ms**
mesurés, dans la fenêtre 1,2–1,8 s.

### Réf. 1 · Pile de cartes

| | Relevé |
|---|---|
| pile | 5 cartes de 320 × 200 |
| geste | **rotation** −18, −9, 0, +9, +18° → **9° d'écart constant** |
| durée | **452 ms** |
| dépassement | **7,1 % à l'aller, 0 % au retour** |
| courbe déclarée | `cubic-bezier(0.6, 1.5, 0.5, 1)` — un ressort |

**Pris :** l'idée qu'une pile se rend lisible par un **écart constant**
entre voisines.

**Jeté :** la rotation (rien ne pivote ici : la limaille se range en
lignes, elle ne fait pas la roue) ; les 7,1 % de dépassement
(amortissement critique partout) ; les 452 ms (440, comme les autres
recompositions — une durée de plus serait une durée à retenir).

**Où :** les treize aperçus de secteur **sont** une pile — il y en a
treize, on en voit un. Changer de métier, c'est en tirer un autre : les
blocs partent d'un décalage cumulé de 11 px, borné à cinq. **Entrer** dans
la section n'est pas tirer une carte : c'est la matière qui prend forme,
et ça reste le départ depuis les quinze filets. Deux événements, deux
départs, **une seule animation par bloc** — la correction de conception de
la phase 8 n'est pas défaite.

### Réf. 6 · Fancy toggle

Relevé : `translate 0.3s ease-out` — un état **glisse** vers l'autre.

**Traduit :** chez nous un état ne glisse pas non plus, il **roule d'un
cran** (V4). À l'échelle de la page, le cran est une bande de matière qui
**traverse**. Voir § 3.

### Réf. 5 · Micro-interactions

12 268 px, 1 385 nœuds. Traversée + relevés de survol dans
`tools/_refs/5-micro-interactions/`.

**Honnêtement : c'est celle dont on a tiré le moins.** Les survols relevés
sur les conteneurs ne bougent ni en Y, ni en opacité, ni en échelle — les
interactions Webflow visent des descendants que le relevé n'a pas isolés,
et les seuls mouvements captés sont ceux d'un bandeau défilant continu
(`arc-marquee_item`), qui n'est pas une micro-interaction. Le catalogue de
transitions de cette phase vient donc des réf. 4, 1, 2 et 6, pas de la 5.
Le dire est plus utile que d'inventer un enseignement.

### Réf. 3 · Sphère de particules

Canvas 1440 × 900. Le nombre de particules **n'est pas lisible depuis le
DOM** ; il n'est donc pas estimé.

**Écarté volontairement, et c'était l'avertissement du brief :** le hero
est déjà en particules. En refaire ailleurs diluerait la signature. Ce
qu'on garde de sa mécanique — disperser puis recomposer — est déjà ce que
fait `limaille.js`, et il le fait avec un amortissement critique là où la
référence laisse flotter.

---

## 2 · LA TRAME — LE MÉCANISME, ET SON VERBE

`js/trame.js`. Vague 1, moins de 6 Ko, **aucune dépendance** — comme
`limaille.js`, et pour la même raison : deux de ses usages (thème, menu)
se déclenchent au premier clic, donc potentiellement avant que GSAP soit
demandé.

> Une grille de tuiles en aplat recouvre une cible déjà peinte, puis
> chaque tuile **rétrécit sur son centre** jusqu'à disparaître. Le retard
> de chaque tuile est sa projection le long de l'axe de **lecture**, plus
> un désordre borné tiré d'une graine.

**Quel verbe c'est.** La règle d'admission s'applique. Ce n'est **pas** un
cinquième verbe :

- l'arête franche qui balaye et découvre une forme déjà là, c'est **V1 ·
  DÉGAGER** ;
- l'arête n'est pas un trait de règle, c'est une **trame de grains** qui
  se résorbe, c'est la matière de **V3 · SOUDER**.

La trame est V1 dont l'arête est faite de V3. Les deux verbes existaient ;
c'est leur composition qui est neuve.

**La graine vient du numéro de section**, jamais d'un hasard : douze
frontières, douze textures de front, et la même frontière rend exactement
la même trame à chaque franchissement. `Math.random()` ferait scintiller
deux passages successifs — c'est la faute déjà évitée sur les quinze
filets de `limaille.js`.

**Ce qu'elle ne fait jamais :** cacher du texte plus longtemps que le
passage (le voile est créé au moment du passage et retiré à la fin) ;
exister dans le CSS (aucun contenu ne dépend d'elle) ; être scrubbée (une
animation scrubbée n'a pas d'état de repos, et un voile arrêté à
mi-course est un défaut permanent).

**Garde-fou :** au-delà de 1 400 tuiles la maille grossit au lieu de
peindre. Un passage qui coûte plus qu'il n'apporte tombe sous sa propre
règle.

---

## 3 · L'INVENTAIRE DES PASSAGES

### Les treize frontières

| # | Verbe | Sens | Mécanisme | Voile mesuré |
|---|---|---|---|---|
| 02 | volet | bas | **trame** sur la bande d'encre | 442 ms |
| 03 | dégager | bas | **trame** sur la 1ʳᵉ capture | 450 ms |
| 04 | aligner | droite | V2, les groupes s'alignent | — |
| 05 | volet | bas | **trame** | 432 ms |
| 06 | volet | haut | **trame**, réciproque de 05 | 428 ms |
| 07 | aligner | droite | V2, les rangées | — |
| 08 | aligner | droite | V2, les étapes | — |
| 09 | souder | droite | V3, soudure longue | — |
| 10 | cran | droite | V4, 500 $ → 5 000 $ | — |
| 11 | dégager | droite | **trame** sur la 1ʳᵉ question | 447 ms |
| 12 | dégager | bas | **trame** sur la tuile | 452 ms |
| — | volet | bas | **trame** + cran 12 → 00 | **431 ms** ← ne partait jamais |

**Sept trames sur treize, pas treize.** Les cinq « aligner / souder /
cran » gardent leur geste : douze passages identiques feraient exactement
le tic que la phase 9 refusait. Un seul foyer d'attention par passage.

La **couleur** du voile est celle de la page (`--surface-0`), donc le
ciment s'érode en encre grain par grain. En thème sombre `--surface-0`
est l'encre et la bande est le ciment : c'est l'**inversion** qui porte le
sens, et elle se lit dans les deux thèmes sans une ligne de plus.

### Les passages internes

| Passage | Verbe | Traitement | État |
|---|---|---|---|
| Aperçu de secteur, métier → métier | V2 | départ **en pile**, écart 11 px borné à 5 (réf. 1) | livré |
| Pièce → pièce de la visite 360 | V1+V3 | trame latérale, **la texture se charge derrière le voile** | livré |
| Panneau « Ajuster en détail » | V1+V3 | trame, haut → bas | livré |
| Modales | V1+V3 | `clip-path` **plus** trame par-dessus | livré |
| Menu plein écran | V1+V3 | trame bas à l'ouverture, **réciproque calculée** à la fermeture | livré |
| Popup cadeau | V1 | arête CSS, inchangé — voir *Réserves* | inchangé |
| Projet → projet | — | non traité — voir *Réserves* | **non livré** |

Le passage de pièce mérite un mot : `loadScene` remplaçait la texture en
une image. D'un mur on se retrouvait dans l'autre pièce sans qu'aucun
geste n'ait dit qu'on se **déplaçait**. C'était le seul endroit du site où
un changement d'état n'avait **aucune** mise en scène. La charge se fait
maintenant derrière le voile, au moment où l'écran est couvert.

### Les passages d'état

| Passage | Traitement |
|---|---|
| **Clair ↔ sombre** | la trame **couvre** dans le sens de lecture (220 ms), le thème bascule quand elle a couvert, la **même** trame se retire (260 ms). Derrière la vague, l'autre état. La couleur portée est celle **d'arrivée** : une vague de l'ancienne couleur dirait qu'on revient en arrière. |
| Repos → survol → pressé | inchangé — les onze micro-états sont couverts depuis la phase 8 par `etats-check.mjs` |
| Formulaires | inchangé, idem |
| Section inactive → active | inchangé — N1, vit dans `main.js`, jamais sacrifié |
| Valeur du calculateur | inchangé — ressort, jamais un odomètre : un odomètre sur une valeur qui change soixante fois par seconde donne du bruit |

**Sur la bascule de thème, un chiffre qu'il faut dire.** Changer
`data-theme` sur la racine recalcule le style d'un document de trente
mille pixels. Mesuré, en différences appariées sur la même machine :

```
sans trame : 256, 221, 219, 268, 65 ms
avec trame : 316, 258, 231, 119, 105 ms
```

**Ce coût ne vient pas d'ici, il était déjà là.**
`startViewTransition` le cachait sous une photo figée ; on le cache sous
la couverture pleine de la trame, au seul instant où l'écran est un aplat
et où une pause ne se voit pas. C'est le même abri, dans notre matière au
lieu d'un fondu. **Durée vue par le visiteur, bout en bout : ~750 ms,
dont un tiers qu'aucune mise en scène ne supprime.**

### Les passages d'entrée

| Passage | État |
|---|---|
| Chargement du site | 1 641 ms mesurés · **défaut corrigé** (§ 0-B) |
| Entrée de bloc dans l'écran | inchangé (`rise`, `settle`, `motion.js`) |
| Arrivée du popup | inchangé — arête CSS, phase 9 |

---

## 4 · LE BUDGET DE DÉGRADATION — UN ÉCHELON DE PLUS

Le G4 des frontières tombait au palier 2. Il tombe maintenant **en deux
temps**, ce qui est plus juste :

| Palier | G4 « volet » / « dégager » |
|---|---|
| **0** | la trame |
| **1** | l'arête de règle d'avant — même verbe, même sens, même durée. Sur une machine modeste on garde le geste et on lâche la texture, jamais l'inverse. |
| **2** | rien. La frontière reste lisible : filet, numéro, nom. |
| **3** | `langue.js` ne s'exécute pas. |

Le palier 2 **tue les voiles en vol** (`APED_TRAME.tout_arreter()`) : un
voile déjà créé continuerait sinon à peindre des centaines de tuiles par
image alors qu'on vient justement de décider que ça coûte trop cher.

---

## 5 · LES PIÈGES D'INSTRUMENT DE CETTE PHASE

Six, et **chacun a produit un faux verdict avant d'être trouvé**.

1. **Une capture d'écran est trop lente pour filmer une transition.**
   `page.screenshot()` coûte 120 à 950 ms sur cette machine. Vingt
   captures d'affilée sur le pixel reveal (1 480 ms) n'en ont montré
   **aucune image** : sur les vingt, le reveal était déjà fini. Il a fallu
   écrire `tools/cine.mjs`, qui utilise `Page.startScreencast` du
   protocole DevTools — le navigateur pousse une image à chaque peinture,
   sans bloquer le rendu.

2. **Dater une image à la réception, c'est dater le transport.** Chromium
   groupe et retarde les envois. La première lecture de notre séquence
   d'entrée montrait le **rideau après le site** — une séquence jouée à
   l'envers, qui n'existait pas. `metadata.timestamp` est l'horloge de la
   peinture ; c'est la seule honnête, et il faut trier dessus.

3. **Deux pièges qui se contredisent sur les frontières.**
   `content-visibility: auto` oblige à **traverser avant de mesurer** ;
   mais les frontières sont `once: true` et traverser les **consomme**.
   La première lecture a rendu « aucun voile » sur les douze — un verdict
   entièrement fabriqué par l'instrument. Il faut une page qui mesure et
   une page **neuve par frontière** qui filme.

4. **Une sonde peut devenir le goulot.** Relever `getImageData` sur
   1,3 million de pixels à chaque image affamait la boucle et rendait une
   animation de 560 ms pour **1 800 ms**. L'instrument mesurait
   l'instrument. Une ligne médiane suffit.

5. **Descendre d'un trait vers une position relevée sur une autre page
   fait dépasser.** Les hauteurs dérivent ; dépasser un `once: true` le
   consomme sans l'avoir filmé. Les frontières 06, 11, 12 et le pied ont
   été perdues exactement comme ça. Il faut **recalculer la cible à chaque
   pas**.

6. **Un compte ne remplace pas un nom.** Six voiles pour sept attendus, et
   aucun moyen de dire lequel manquait. Chaque voile porte maintenant
   `data-passage`.

---

## 6 · LES CHIFFRES, AVANT / APRÈS

Même machine, même session, serveur local sur 8099.

| Mesure | Avant | Après |
|---|---|---|
| Traversée, images relevées | 866 | 922 |
| Fréquence médiane | **16,7 ms — 60 i/s** | **16,7 ms — 60 i/s** |
| 5ᵉ centile bas | 60 i/s | 60 i/s |
| Images au-dessus de 20 ms | **0** | **0** |
| Écarts de cascade | 0 sur 253 264 | **0 sur 252 912** |
| Séquence d'entrée | 1 641 ms | 1 641 ms |
| Frontières qui se déclenchent | **12 sur 13** | **13 sur 13** |
| Requêtes tierces | 0 | 0 |

---

## 7 · RÉSERVES HONNÊTES

1. **La réf. 5 n'a presque rien donné.** Les relevés de survol sur les
   conteneurs Webflow ne bougent pas ; les interactions visent des
   descendants que la sonde n'a pas isolés. Une seconde passe ciblée
   serait nécessaire pour en tirer un vrai catalogue.

2. **Le passage projet → projet n'est pas traité.** Les cinq projets sont
   une liste verticale, pas une pile qu'on feuillette : appliquer la
   mécanique de la réf. 1 y aurait demandé de changer la structure de la
   section, ce qui dépasse le mandat « le passage » et rouvrirait des
   contrastes déjà mesurés. C'est un manque assumé, pas un oubli.

3. **La trame sur une cible qui porte du texte.** Sur la frontière 11, la
   première question est traversée par une trame de mailles de 28 px
   pendant ~450 ms : au front, quelques glyphes sont partiellement
   couverts. Ça reste une **révélation** (le texte arrive, il ne part
   pas), ça ne dure pas, et l'état de repos est net au pixel. Mais c'est
   la limite du procédé et il ne faut pas l'étendre à des paragraphes.

4. **Les 250 à 350 ms de recalcul de style à la bascule de thème** ne sont
   pas supprimés — ils sont abrités. Aucune mise en scène ne les
   supprimera ; seule une refonte de la façon dont le thème est appliqué
   le ferait.

5. **Le popup cadeau garde son arête CSS.** Il peut s'ouvrir à la 4ᵉ
   seconde, donc avant la seconde vague de scripts ; `trame.js` est en
   vague 1 et serait disponible, mais changer une mise en scène qui
   fonctionne pour gagner de la texture sur un objet qui s'ouvre une fois
   par visite n'a pas paru valoir le risque.

6. **Rien n'est mesuré sur un vrai téléphone.** Les paliers 1 et 2 sont
   vérifiés par leurs déclencheurs réels, processeur bridé compris, mais
   sur une machine de bureau.

---

## 8 · LES OUTILS DE CETTE PHASE

| Outil | Ce qu'il rend |
|---|---|
| `cine.mjs` | l'enregistreur d'images au protocole DevTools : `filmer`, `planche`, `plancheFenetre`, `cadence`. Non bloquant, images datées à la peinture |
| `refs-structure.mjs` | la structure des six références — ce qu'il faut mesurer |
| `refs-mesure.mjs` | durées, écarts, dépassements et courbes identifiées par comparaison à un catalogue de cubic-bezier |
| `passages-cine.mjs` | nos passages filmés : thème, douze frontières avant/pendant/après, modale, secteur, menu |
| `trame-check.mjs` | 26 vérifications : les sept passages **nommés**, la réciproque du menu, le repli, le thème avec et sans moteur, sous mouvement réduit et sans `trame.js` |
