# PIÈGES D'INSTRUMENT

**Quand lire ce fichier :** avant d'écrire un outil de mesure, et
chaque fois qu'une mesure rend un verdict surprenant. Chacun des
pièges ci-dessous a produit un **faux verdict** avant d'être trouvé —
un « échec » sur du code sain, ou un « tout va bien » sur un défaut.

La liste courte vit dans `CLAUDE.md`. Celle-ci donne la cause et le
correctif.

## Table

| # | En une ligne |
|---|---|
| [1](#1) | Une capture est plus lente qu'une transition |
| [2](#2) | Un cadrage de capture se relève, il ne se devine pas |
| [3](#3) | Deux images de tailles différentes rendent 100 % d'écart |
| [4](#4) | `content-visibility: auto` fait mentir `getBoundingClientRect()` |
| [5](#5) | Un `scrollTo` qui saute casse un pin de ScrollTrigger |
| [6](#6) | `color-mix()` calcule en `color(srgb …)`, pas en `rgb()` |
| [7](#7) | Une fenêtre d'odomètre rogne exprès |
| [8](#8) | Une analyse de pixels confond l'anticrénelage avec du texte illisible |
| [9](#9) | Un détecteur qui n'attend pas assez confond « en vol » et « échoué » |
| [10](#10) | Un piège de tabulation s'identifie par l'identité, pas par le texte |
| [11](#11) | Une page d'impression peut écraser son corps sans grandir |
| [12](#12) | Un `ScrollTrigger` en `once` se tue après avoir joué |
| [13](#13) | Une sonde au `document_start` n'a pas encore `documentElement` |
| [14](#14) | Une sonde peut être plus rapide que la page |
| [15](#15) | Un détecteur de débordement doit distinguer ce qui rogne exprès |
| [16](#16) | `animation` est un raccourci : il remet `animation-play-state: running` |
| [17](#17) | Un test peut verrouiller le défaut |
| [18](#18) | Le popup cadeau bloque les outils |
| [19](#19) | Un A/B se fait en worktree, pas en `stash` |
| [20](#20) | `transform` ne contient pas `translate` / `rotate` / `scale` |
| [21](#21) | Une amplitude absolue mélange trois mouvements |
| [22](#22) | L'englobant d'un élément tourné est plus grand que l'élément |
| [23](#23) | Un nombre fixe de tabulations ne mesure pas un piège de focus |
| [24](#24) | Une fenêtre d'observation trop courte cache le mouvement le plus lent |
| [25](#25) | **Une sonde du DOM ne peut pas voir un défaut de peinture** |
| [26](#26) | Une grille transforme chaque nœud de texte en élément anonyme |
| [27](#27) | Deux mécanismes sur le même pseudo-élément : le plus spécifique tue l'autre |
| [28](#28) | Un bridage trop fort rend le palier 2 inatteignable |
| [29](#29) | **Une planche de captures d'une page qui bouge n'est pas une preuve** |
| [30](#30) | Un seuil qui vaut `NaN` rend « aucune différence » sur n'importe quoi |
| [31](#31) | Un `lastIndexOf` sur une balise fermante commune coupe tout le document |
| [32](#32) | Une marge `auto` peut se LIRE autrement et se POSER au même pixel |

---

## MESURE ET CAPTURE

<a id="1"></a>
### 1 · Une capture d'écran est plus lente qu'une transition
30-50 ms contre 16,7 ms. On lit les valeurs **dans la page** pour les
chiffres ; les images ne servent qu'à montrer.

<a id="2"></a>
### 2 · Un cadrage de capture se RELÈVE, il ne se devine pas
Un cadre posé à `y = 300` photographiait la plaque de limaille au lieu
du titre, 180 px plus haut. Il rendait bien une suite d'images qui
bougent — mais pas celles qu'on croyait.

<a id="3"></a>
### 3 · Deux images de tailles différentes rendent 100 % d'écart
Chiffre qui ne veut rien dire. Le cadre d'une suite doit être **fixe**.

<a id="4"></a>
### 4 · `content-visibility: auto` fait mentir `getBoundingClientRect()`
Hors écran, il rend la taille **réservée**. Traverser la page
entièrement avant de mesurer, **remesurer chaque cible juste avant de
la capturer**, et lever la propriété pour relever une hauteur réelle.

<a id="5"></a>
### 5 · Un `scrollTo` qui saute casse un pin de ScrollTrigger
Défiler par pas, comme un visiteur.

<a id="6"></a>
### 6 · `color-mix()` calcule en `color(srgb 0.67 …)`, pas en `rgb()`
Lu comme du 0-255, tout texte en `color-mix` ressort à 1,11:1 —
quatorze faux échecs de contraste, dont onze sur du code intact.

<a id="7"></a>
### 7 · Une fenêtre d'odomètre rogne exprès
`.seuil-num`, `.entree-cran`. Un objet rogné exprès n'a pas de
contraste.

<a id="8"></a>
### 8 · Une analyse de pixels confond l'anticrénelage
…et l'arête d'un aplat avec du texte illisible.

<a id="9"></a>
### 9 · Un détecteur qui n'attend pas assez confond « animation en vol » et « texte échoué »
Une capture est aussi plus lente qu'une animation d'entrée : le popup
photographié sans attente apparaît coupé au milieu de son arête.

<a id="10"></a>
### 10 · Un détecteur de piège de tabulation doit identifier les éléments par leur identité
Pas par `sélecteur + texte`.

<a id="11"></a>
### 11 · Une page d'impression peut écraser son corps sans grandir
Mesurer la `.page` seule ne prouve donc rien.

<a id="12"></a>
### 12 · Un `ScrollTrigger` en `once` se TUE après avoir joué
Toute sonde qui traverse la page avant de mesurer photographie la fin.

<a id="13"></a>
### 13 · Une sonde posée au `document_start` n'a pas encore `document.documentElement`
Elle lève, et la boucle `rAF` n'est jamais programmée. Protéger chaque
tour **et** programmer le suivant quoi qu'il arrive.

<a id="14"></a>
### 14 · Une sonde peut être plus RAPIDE que la page
Chercher naïvement la première image où un filet est plein renvoie
l'image zéro, où l'animation n'est pas encore attachée.

<a id="15"></a>
### 15 · Un détecteur de débordement doit distinguer ce qui rogne exprès

---

## CSS ET JS

<a id="16"></a>
### 16 · `animation` est un RACCOURCI : il remet `animation-play-state` à `running`
Une règle de pause placée **avant** la déclaration, à spécificité
égale, ne fait rien. Elle doit porter `!important` ou venir après. Ce
défaut a rendu la pause du rideau **et** celle de la composition
inopérantes sans que rien ne le signale.

<a id="17"></a>
### 17 · Un test peut VERROUILLER le défaut
`entree-check` affirmait « session déjà vue → pas de rideau » ;
`cadeau-check` affirmait « il ne s'ouvre qu'une fois par personne » ;
`accueil-check entree` mesurait onze durées justes sans jamais
regarder si un rideau opaque était devant.
**Quand on corrige un défaut, lire le test qui le couvrait — s'il passe
encore sans modification, c'est lui le problème.**

<a id="18"></a>
### 18 · Le popup cadeau bloque les outils
Poser `sessionStorage["aped-sans-popup"] = "1"` dans tout outil qui
clique : un `<dialog>` ouvert par `showModal()` capture **tous** les
événements de pointeur et fait expirer n'importe quel survol en
accusant le mauvais coupable.

<a id="19"></a>
### 19 · Un A/B se fait en worktree, pas en `stash`
Le CSS fabriqué fait échouer le `stash pop`. Tuer le serveur avant de
retirer le worktree. Les outils prennent une **adresse complète**, pas
un numéro de port : `node tools/contraste-arret.mjs http://localhost:8098`.

**Et vérifier que le port est LIBRE.** Ajouté le 2026-07-30, après un
faux verdict complet. `node tools/serve.mjs 8098 &` a échoué sur
`EADDRINUSE` — en arrière-plan, donc en silence. Le port était tenu par
un serveur d'une session précédente qui servait une copie du site
vieille de plusieurs chantiers. `curl` répondait **200**, la planche
« avant » s'est capturée sans une erreur, et la comparaison a rendu
**2 539 px d'écart de hauteur de page** et trois sections
« modifiées ». Rien de tout cela n'était vrai.

Le contrôle qui l'a démasqué tient en une ligne, et il doit être fait
**avant** toute mesure A/B :

```
curl -s http://127.0.0.1:8098/index.html | wc -c   # doit égaler wc -c du fichier servi
```

---

## LES CINQ FAUX VERDICTS DE LA NUIT DU 2026-07-30

<a id="20"></a>
### 20 · `getComputedStyle(el).transform` ne contient pas les propriétés individuelles
`translate`, `rotate` et `scale` sont trois propriétés distinctes qui
se **composent** avec `transform`. Une sonde qui ne lit que `transform`
a rendu `dangle 0°` sur les huit plaques alors que la rotation
tournait : elle lisait la pose de repos et ignorait la boucle.

<a id="21"></a>
### 21 · Une amplitude ABSOLUE mélange trois mouvements
La boucle, la dérive au défilement, et la recomposition du document
par `content-visibility`. Relevé « hors écran » : 2 078 px d'amplitude
sur une bande dont l'animation était `paused` — deux affirmations
contradictoires dans le même relevé, donc au moins une fausse.
Mesurer **enfant moins parent**.

<a id="22"></a>
### 22 · Le rectangle englobant d'un élément TOURNÉ est plus grand que l'élément
Compter les intersections d'englobants sur des plaques inclinées de 4°,
c'est compter des chevauchements qui n'existent pas à l'écran. Ce qui
décide est l'**occultation** : `elementFromPoint` au centre du texte
doit rendre un nœud de cette plaque-là. Et il faut une **base de
comparaison au repos** : la composition décale déjà certaines plaques
de 48 px dans la colonne voisine.

<a id="23"></a>
### 23 · Un nombre FIXE de tabulations ne mesure pas un piège de focus
`cadeau-check` pressait six fois Tab puis demandait « le focus est-il
dans le dialogue ? ». Deux liens ajoutés, et la sixième tabulation est
tombée pile sur l'étape où Chromium fait transiter le focus par sa
propre barre. Verdict rendu : « le focus s'échappe » — faux. Ce qui se
mesure est la **propriété** : aucun élément de la page derrière la
modale ne reçoit le focus, et le cycle revient dedans.

<a id="24"></a>
### 24 · Une fenêtre d'observation trop courte cache le mouvement le plus lent
Quatre poses sur 750 ms rendaient « 7 plaques sur 8 bougent » : la
huitième, la plus lente et la plus plate près de ses extrémums, rendait
moins de 2 px. La fenêtre doit couvrir au moins une demi-période de
l'élément le plus lent — ici 10,6 s.

---

## LES QUATRE DE LA SECONDE PASSE DU 2026-07-30

<a id="25"></a>
### 25 · UNE SONDE QUI INTERROGE LE DOM NE PEUT PAS VOIR UN DÉFAUT DE PEINTURE
La scène des Services se vidait progressivement et était **entièrement
blanche** au troisième chantier. Pendant ce temps
`getBoundingClientRect()` rendait la bonne boîte, `opacity: 1`,
`visibility: visible`, la plaque de dégagement à `scaleX(0)`, l'index
actif juste, la jauge juste. **Le document disait « tout va bien »
pendant que l'écran était vide.** Seule la capture l'a vu.

La cause s'est trouvée en comparant deux chiffres : la largeur
réellement peinte valait exactement `fenêtre − |x|`. Un `transform`
promeut l'élément en calque composé et ne redemande pas de peinture ;
le navigateur rastérise sur la **boîte** du calque, et la boîte était
plus petite que son contenu. Correctif : `width: max-content`.

**Toute section qui traduit un rail par `transform` doit être vérifiée
en CAPTURE, jamais seulement en relevé de style.**

<a id="26"></a>
### 26 · UNE GRILLE TRANSFORME CHAQUE NŒUD DE TEXTE EN ÉLÉMENT DE GRILLE ANONYME
`li { display: grid; grid-template-columns: 1.5rem 1fr }` sur un
contenu fait d'un `<b>` **suivi d'un nœud de texte** : le `<b>` prend
la colonne 2, le texte repart en colonne 1 de la rangée suivante, sur
24 px de large. Rendu : « Avant, / il / est » sur trois lignes d'un
mot. Un flux normal plus un pseudo-élément absolu n'a pas ce problème.

<a id="27"></a>
### 27 · DEUX MÉCANISMES QUI VEULENT LE MÊME PSEUDO-ÉLÉMENT : LE PLUS SPÉCIFIQUE TUE L'AUTRE, EN SILENCE
`[data-souder] > *::before` (0,1,0) porte la trame de V3 · SOUDER ; un
`.ba-ecart li::before` (0,1,1) la battait, et le verbe ne jouait jamais
— sans erreur, sans avertissement, et `langue-check` ne comptait que
les **hôtes**, pas les trames. Celui qui arrive en second déménage.

<a id="28"></a>
### 28 · UN BRIDAGE TROP FORT REND LE DÉCLENCHEUR DU PALIER 2 INATTEIGNABLE, ET L'OUTIL APPELLE ÇA UN ÉCHEC
`js/langue.js` **jette** les intervalles au-delà de 200 ms — « un
onglet en arrière-plan n'est pas une mesure de performance », et c'est
juste. Conséquence : au-delà d'un certain bridage, **aucun** échantillon
n'entre plus dans la fenêtre 4-200 ms, `data-images` n'est jamais
écrit, et `data-palier` reste 0.

Relevé du 2026-07-30 à ×20 : intervalle médian **1 233 ms**, minimum
**417 ms**, **0 échantillon retenu sur 95**. `palier-check` rendait
trois ÉCHECS sur un site parfaitement sain. Le bridage est passé de ×20
à **×6** — le milieu de la fenêtre — et l'outil **réessaie trois fois**
puis dit « NON MESURÉ » au lieu d'« échec ».

**Deux passes du même code au même bridage ont rendu « 15 i/s, palier
2 » puis « null, palier 0 » : ne jamais conclure sur une seule passe
d'une mesure bridée.**

---

## AJOUTÉ LE 2026-07-30, CHANTIER DE STRUCTURE

<a id="29"></a>
### 29 · UNE PLANCHE DE CAPTURES D'UNE PAGE QUI BOUGE N'EST PAS UNE PREUVE DE NON-RÉGRESSION
`theme-check.mjs` photographie une page dont la composition d'entrée et
les aperçus de secteur sont en vol. Mesure du 2026-07-30, **code
strictement identique, deux passes** : jusqu'à **1,96 %** d'écart de
pixels sur `top.png`, 0,28 % sur `realisations.png`, 0,14 % sur
`reference.png`. Comparer une planche « avant » à une planche « après »
rend donc des différences **dans tous les cas**, et rien ne distingue
un vrai défaut d'une seconde d'horloge.

Le correctif est `tools/captures-fixe.mjs` : il photographie en
**mouvement réduit**, état où `langue.js` et `motion.js` ne s'exécutent
pas et où les animations CSS sont neutralisées par les règles du site
lui-même. Il lève aussi `content-visibility` (piège 4) et laisse
900 ms de repos aux odomètres, qui sont N1 et roulent même en mouvement
réduit.

**Son plancher de bruit n'est pas zéro, et il faut le dire.** Mesuré sur
**6 paires de code strictement identique**, 130 images : **4 images
bougent**, toutes à **768 px** — `768-sombre/realisations.png` jusqu'à
2,6 %, `768-sombre/contact.png` 1,7 %,
`768-sombre/calculateur.png` 1,29 %, `768-clair/calculateur.png`
1,28 %. Les **126 autres rendent 0,0000 %**, et c'est sur celles-là
qu'un verdict est recevable.

**Le nombre de paires de contrôle compte.** Avec **2** paires, seules
**2** des 4 instables ont été prises : le calculateur n'avait pas
flanché ce jour-là, et il est ressorti en « différence » dans le
verdict. Avec **6** paires, les 4 sont prises et le verdict tombe à
zéro. Deux passes ne suffisent pas — il en faut **trois de chaque
côté**.

**Le protocole, donc :**
`node tools/captures-comparer.mjs --avant A1,A2,A3 --apres B1,B2,B3`.
L'outil déclare BRUIT toute image qui bouge **à l'intérieur** d'un
groupe, puis ne rend son verdict que sur le reste. Un verdict rendu
sans cette soustraction confond le bruit de l'instrument avec un
défaut.

Ce que cette planche ne couvre pas — le mouvement — se prouve par des
outils qui mesurent des écarts **entre deux instants** au lieu de les
interdire : `langue-check`, `frontieres-check`,
`accueil-check sequences`, `svc-defile`, `ba-check`.

**Corollaire général : une planche de captures ne prouve quelque chose
que si l'on a d'abord mesuré son plancher de bruit sur deux passes du
même code.**


<a id="30"></a>
### 30 · UN SEUIL QUI VAUT `NaN` REND « AUCUNE DIFFÉRENCE » SUR N'IMPORTE QUOI

Trouvé le 2026-07-30 en écrivant `captures-comparer.mjs`. Le mode à deux
groupes lisait son seuil ainsi :

```js
Number((GROUPES ? args[args.indexOf("--seuil") + 1] : args[2]) || 8)
```

Sans `--seuil`, `indexOf` rend −1, donc `args[0]` — c'est-à-dire la
chaîne `"--avant"`. Elle est **truthy**, le repli `|| 8` ne joue pas, et
`Number("--avant")` rend `NaN`.

**Toute comparaison avec `NaN` est fausse.** `if (pire > NaN)` n'est
jamais vrai : `diffStats` ne compte plus un seul pixel fautif, et
l'outil a rendu **« PLANCHER DE BRUIT : 0 / 130 · AUCUNE DIFFÉRENCE
VISIBLE »** — la sortie exacte qu'on espérait, sur une mesure qui
n'avait rien mesuré.

C'est la pire forme du piège 17 : un test qui passe **parce qu'il est
cassé**, et dont la panne ressemble au succès.

**Correctif :** un paramètre illisible arrête l'outil.
`if (!Number.isFinite(SEUIL)) process.exit(2)`. Un repli silencieux sur
une valeur par défaut aurait masqué la même faute autrement.

---

<a id="31"></a>
### 31 · UN `lastIndexOf` SUR UNE BALISE FERMANTE COMMUNE COUPE TOUT LE DOCUMENT

**Relevé le 2026-07-31, chantier Services et Réalisations.**

Pour remplacer un bloc de `index.html`, une commande a borné la
découpe ainsi :

```js
const A = h.indexOf('<figure class="svc-plan2d">');
const B = h.indexOf("</div>", h.lastIndexOf("</figure>"));
h = h.slice(0, A) + neuf + h.slice(B);
```

`lastIndexOf("</figure>")` cherche dans **tout le document**, pas dans
le bloc visé. Il a trouvé la dernière `</figure>` de la page — sept
sections plus bas. `B` a donc désigné un point situé après elle, et le
`slice` a supprimé **les sections 03 à 09 en entier**, soit 1 393
lignes, sans une seule erreur de syntaxe et sans que rien ne le signale.

Le fichier restait un HTML valide. Le serveur le servait sans broncher.
Seul un `grep '<section'` a montré qu'il n'en restait que quatre
sur douze.

**Correctif :** borner une découpe par deux marqueurs **uniques**,
vérifier que la borne haute précède la borne basse, et ne jamais
utiliser `lastIndexOf` sur une balise fermante générique. Puis poser
un invariant après chaque remplacement structurel :

```js
const avant = L.filter((l) => /<section[ >]/.test(l)).length;
/* … la découpe … */
const apres = L.filter((l) => /<section[ >]/.test(l)).length;
if (avant !== apres) throw new Error("le remplacement a mange des sections");
```

Coût : la restauration s'est faite depuis `git show HEAD:index.html`.
Sans commit récent, le chantier était perdu.

**Corollaire, payé deux fois le même jour :** une chaîne JavaScript
passée à `node -e "…"` depuis un shell POSIX voit ses accents graves
interprétés comme une substitution de commande. Deux commentaires du
code sont partis en silence de cette façon. Les scripts qui portent
des accents graves s'écrivent dans un fichier, jamais en ligne.

---

<a id="32"></a>
### 32 · UNE MARGE `auto` PEUT SE LIRE AUTREMENT ET SE POSER AU MÊME PIXEL

**Relevé le 2026-07-31.**

`cascade-check` a annoncé **4 écarts de cascade** sur `margin-left` et
`margin-right` d'un seul `.wrap` : « 0px » sur la page réelle, « 48px »
sur le contrôle. Le verdict était stable d'une passe à l'autre — donc
pas un clignotement d'état, pas le piège 12.

Le rectangle, lui, était **identique au pixel dans les deux cas** :
`left 344, largeur 1048, hauteur 1033`. La largeur calculée était
identique elle aussi. Rien n'avait bougé à l'écran.

La différence tient à ceci : sur la page réelle, `differe.css` est
**injecté par script**, alors que le contrôle sert `app.css` comme une
feuille du document. Chrome ne résout pas la valeur *utilisée* d'une
marge `auto` de la même façon dans les deux cas. `content-visibility`
n'y est pour rien : la divergence persiste après l'avoir levée, ce qui
a été mesuré avant de conclure.

**Correctif :** l'outil relève désormais aussi le **rectangle utilisé**
de chaque élément. Une divergence sur une propriété `margin-*` dont le
rectangle est identique est comptée comme une **lecture**, affichée
nommément avec son rectangle — pas comme un écart, et surtout pas en
silence. Le seuil « 0 écart » garde son sens ; la lecture reste au
rapport pour qui voudra la reprendre.

**Ce que ce piège interdit :** conclure d'une valeur calculée sans
avoir comparé la géométrie. Une propriété qui diffère sans qu'un pixel
bouge n'est pas un défaut du site — c'est une question posée à
l'instrument.

## AJOUTÉS LE 2026-07-31, CHANTIER DES SAS

### 33 · GSAP additionne `yPercent` à un `transform` CSS de repos

Le volet de la remontée a un repos CSS `translateY(-102%)` — la règle
« l'état de repos est la forme finale ». Le `fromTo` animait
`yPercent: 0 → -102`… et le volet ne paraissait jamais. GSAP lit le
transform calculé comme une **base en pixels** (-102 % résolus contre
la hauteur de l'élément) et anime `yPercent` **par-dessus** : la
course entière se jouait déjà hors écran. Les captures le disaient —
0 % d'écart là où le drain devait balayer — et c'est la séquence
d'images, pas le DOM, qui a permis de le voir.

**Correctif :** purger la base avec un `y: 0` explicite dans les deux
états du `fromTo`. La règle vaut pour toute paire « repos CSS en
transform + tween en pourcentage ». `scaleY` n'est pas touché : les
échelles se décomposent, elles ne s'additionnent pas.

### 34 · La hauteur réelle d'une section `content-visibility` se mesure À L'ÉCRAN

Pour recalibrer les `contain-intrinsic-size`, la sonde a traversé
toute la page puis mesuré chaque section : elle a rendu **exactement
les valeurs réservées**, au pixel. Une section `content-visibility:
auto` ressaute en réservation dès qu'elle ressort de l'écran — la
traverse ne « persiste » pas.

**Correctif :** s'arrêter SUR chaque section (`scrollIntoView`, pause,
mesure) pendant qu'elle est visible. C'est ce que fait
`tools/sas-check.mjs`. Corollaire déjà payé au piège 4 : hors écran,
`getBoundingClientRect()` rend la réservation, et une réservation
périmée fausse chaque arrivée par ancre — près de 2 900 px d'erreur
cumulée le 2026-07-31.

---

## AJOUTÉS LE 2026-07-31, CHANTIER DE MISE EN PRODUCTION

### 35 · Une scène collante n'est épinglée qu'à partir de 100vh de course

Le volet du sas de la descente jouait un balayage `yPercent: -101 → 0`
sur les 42 premiers pour cent de sa piste. Il ne s'est **jamais vu**.
Une scène `position: sticky; top: 0` reste dans le flux tant que le
haut de sa piste n'a pas atteint le haut de la fenêtre : la première
moitié de la course, la scène ENTRE par le bas, et tout ce qui bouge
à l'intérieur bouge hors champ. Relevé : à p = 0,20 le bord bas du
volet était à **964 px**, soit 64 px sous la fenêtre.

**Correctif :** tout mouvement d'une scène collante se cale sur la
fenêtre `[hauteurScène / hauteurPiste, 1]`, pas sur `[0, 1]`. Et si le
mouvement n'y tient pas, c'est le DÉFILEMENT qui devient le balayage —
une forme déjà là que le visiteur découvre, ce qui est la définition
exacte de V1.

### 36 · Un test qui synthétise l'événement ne teste pas le geste

`ba-check.mjs` validait la poignée avant/après en posant `value` puis
en émettant un `input`. Tout passait au vert. Un vrai `mouse.down`
suivi de huit `mouse.move` a laissé la valeur **immobile du début à la
fin**, souris et doigt : le glissement était mort, probablement depuis
toujours. La cause tenait au champ `input[type=range]` étiré sur toute
la scène, dont la PISTE n'a aucune hauteur — Chromium ne suit le
pointeur que dedans.

**Correctif :** pour un geste, simuler le geste. `mouse.down` +
`mouse.move`, et exiger que la valeur **suive** le curseur, pas
seulement qu'elle bouge. Deuxième forme du piège 17, et la plus chère.

### 37 · Une image est glissable par défaut, et ça annule le geste

Aussitôt le glissement réparé, il s'est remis à coller — mais
autrement : la valeur suivait le premier déplacement, puis se figeait.
Le navigateur reconnaissait un début de glisser-déposer d'**image** et
émettait `pointercancel`, que tout pilote correct lit comme « le geste
m'a été retiré ».

**Correctif :** `draggable="false"` sur l'image, `user-select: none`
sur le cadre. Vaut pour toute zone de geste qui contient une image ou
du texte sélectionnable.

### 38 · Une sonde de port en IPv4 ment sur un serveur qui écoute en IPv6

Vite se lie à `localhost`, que Windows résout en `::1`. Un
`net.connect(port, "127.0.0.1")` rendait « port libre » pendant que
Vite répondait « port déjà utilisé » — deux verdicts contradictoires
sur le même numéro, et trois changements de port pour rien.
`netstat` disait la vérité : `TCP [::1]:5211 LISTENING`, rien sur
`0.0.0.0`.

**Correctif :** interroger `localhost`, pas une famille d'adresses. Et
tuer les processus par `netstat | findstr LISTENING`, qui voit les
deux familles.

### 39 · `decode()` ne rejette jamais sur une image jamais demandée

Une attente `Promise.all(images.map(i => i.decode().catch(…)))` a
bloqué une sonde **huit minutes sans un mot**. `decode()` ne rejette
pas quand l'image n'a pas été requise : il ne résout simplement
jamais, et le `.catch` ne sert à rien.

**Correctif :** toute attente sur une promesse qui vient de la page
porte sa propre limite — `Promise.race` avec un délai. Et l'outil DIT
combien d'images n'y sont pas arrivées.

### 40 · Un sélecteur de masquage trop large peut effacer la page entière

Pour neutraliser les curseurs maison des sites capturés, la sonde
masquait `[class*="cursor"]`. Or `cursor-none` et `cursor-pointer` sont
des utilitaires Tailwind, et un des sites le pose sur son enveloppe :
**la page entière disparaissait**. Résultat livré sans un mot : quatre
WebP de 5 Ko, entièrement noirs. Quatre passes ont cherché du côté du
port, du lissage, de la densité d'écran.

**Correctif :** deux règles. Un sélecteur de masquage se nomme
explicitement, jamais par sous-chaîne de classe. Et une capture dont
l'écart-type de luminance est nul **arrête l'outil** : une image vide
n'est pas une image, et livrée en silence c'est ce qui part en ligne.

### 41 · Un calendrier qui ouvre sur le mois courant peut n'avoir aucune date

Le calendrier de réservation ouvrait sur le mois en cours. Un 31 du
mois, avec un préavis de 24 h, il ne reste **aucune date ouverte** :
le visiteur voyait quarante et un jours grisés, sans un mot pour lui
dire d'aller au mois suivant. Trouvé par `formulaires-e2e.mjs`, qui a
cherché une plage libre sur dix jours et n'en a trouvé aucune — et le
défaut ne se manifeste que quelques jours par mois.

**Correctif :** ouvrir sur le mois du premier jour RÉSERVABLE, et
borner la flèche « précédent » sur ce mois-là. À poser dans la remise
à zéro, pas seulement à l'initialisation : c'est elle qui s'exécute à
chaque ouverture.

### 42 · Une dégradation par palier ne s'hérite pas toute seule

`:root[data-palier="1"] .v11-defile span { animation: none }` coupait
la seule animation permanente du site. Au palier **2** — la machine la
plus serrée des trois — l'attribut vaut « 2 », le sélecteur ne mord
plus, et l'animation **se remettait à tourner**. L'escalade est à sens
unique dans le code JavaScript ; elle ne l'était pas dans le CSS.

**Correctif :** un palier coupe pour lui ET pour tous ceux d'après.
Les trois valeurs sont écrites dans le sélecteur.

### 43 · Un cadre qui défile peut n'avoir rien à faire défiler

`overflow-y: auto` était en place, `overscroll-behavior: contain`
aussi, la barre de défilement se déclarait — et `scrollHeight −
clientHeight` valait **0 sur les quatre cadres**. La couche du dessous
était en flux et donnait sa hauteur à la pile ; elle faisait
exactement une fenêtre. La couche du dessus, haute de 540 à 1 903 px,
se faisait couper à 286 en `position: absolute; inset: 0`.

Aucune lecture du code ne le montre : chaque ligne est correcte
séparément. **Un conteneur défilant se vérifie par sa COURSE
mesurée, `scrollHeight − clientHeight`, jamais par la présence de
`overflow`.**

**Correctif :** empiler dans une grille d'une seule case. La rangée
prend la hauteur du plus grand des deux enfants, sans chiffre magique
et sans JavaScript.

### 44 · `fullPage` ne photographie pas une scène épinglée

La capture pleine page d'un site qui épingle une galerie horizontale
rendait **1 500 px de BLANC** au milieu. `fullPage` étire le document
à sa hauteur totale et prend une seule image : l'espaceur de la scène
épinglée est bien là, son contenu est resté en haut, le reste est du
vide. C'est un défaut de PEINTURE, donc invisible à toute sonde du
DOM (piège 25).

**Correctif :** une image par fenêtre, en descendant comme un
visiteur, cousues à leur position réelle de défilement. Deux
conséquences à ne pas oublier :
- **demander 80 % d'une fenêtre à chaque pas**, jamais 100 % — un
  défilement piloté DÉPASSE la cible, et une tuile posée à sa hauteur
  réelle laisse alors un trou. Premier essai : 147 px de blanc ;
- **masquer les éléments `position: fixed` à partir de la deuxième
  tuile**, sinon la barre du site se répète à chaque fenêtre ;
- **et refuser la couture** si un trou subsiste. Une image trouée qui
  part en silence coûte une passe complète.

### 45 · Un fond en dégradé n'est pas un fond absent

`contraste-min.mjs` remontait les ancêtres à la recherche de la
première `background-color` opaque. Une surface peinte par un
**dégradé** ou une **image** garde une `background-color`
transparente : la remontée passait au travers et allait chercher le
blanc trois niveaux plus haut. Verdict rendu : **1:1 sur du texte
blanc parfaitement lisible.** Mesure aux pixels peints du même
texte : **6,65:1**.

Un faux 1:1 ne coûte pas qu'une ligne de rapport. **Il noie les vrais
échecs et il pousse à « corriger » du code sain.**

**Correctif :** s'arrêter aussi sur `background-image`, et rendre
« non calculable » plutôt qu'un chiffre inventé. Ce qui n'est pas
calculable depuis les styles se mesure **à l'image**, et ne compte ni
comme échec ni comme succès.

### 46 · Un contournement survit toujours au correctif

« Le héros de `restau` devient noir dès qu'on défile d'un pixel,
reproduit à chaque essai. » Le site a donc été photographié sans
bouger, et la cause n'a jamais été cherchée. La vraie cause était le
piège 40 — un sélecteur de masquage qui effaçait la page entière —
trouvée et corrigée **le même jour, ailleurs**. Le contournement, lui,
est resté : il interdisait de photographier autre chose que la
première fenêtre, et personne ne le savait.

Remesure : 26 paliers, écart-type de luminance à chacun, plus une
pleine page. **Aucune image plate.** Le défaut n'existe pas.

**Règle :** un contournement s'écrit avec la date et la mesure qui le
justifie, et se **remesure** dès que la zone est retouchée. Sinon il
devient une contrainte que plus personne ne peut expliquer.

### 47 · Rendre un conteneur défilant peut tuer un glissement qui marchait

`touch-action: pan-y` sur la scène laissait passer le glissement
horizontal **tant qu'aucun descendant ne défilait** : `pan-y` n'avait
rien à faire défiler, donc le navigateur ne revendiquait jamais le
geste. Le jour où le cadre est devenu un écran dans lequel on descend,
il l'a revendiqué au premier déplacement — `pointercancel`, et la
poignée s'est figée à 42 % après un seul pas, au doigt seulement.

**La souris ne le voit pas** : elle n'a pas de geste ambigu, la
molette défile et le glissement compare. C'est un défaut qui
n'apparaît que sur la moitié des périphériques, et le test qui le
couvrait est devenu faux au lieu d'échouer — il partait du milieu de
la scène, là où le contrat a changé.

**Correctif :** trancher par la surface, pas par la direction. Une
colonne de 2,75 rem centrée sur le filet, en `touch-action: none`,
compare ; tout le reste du cadre défile. Et **mesurer les deux sens** —
un test qui ne prouve que le glissement laisse passer un cadre qui ne
défile plus.

### 48 · L'injection tactile ne se remet pas entre deux gestes

Sous Playwright, **seule la première séquence tactile d'une page
aboutit** : les suivantes s'arrêtent après un pas. Le défaut suit le
**rang**, pas l'élément — en parcourant les quatre comparaisons dans
l'ordre inverse, c'est la dernière qui passe et les trois autres qui
échouent.

Quatre hypothèses fausses payées avant de le voir : la comparaison
elle-même, l'empilement des sessions CDP, un défilement en vol, un
`touchCancel` manquant. **Aucune ne tient** — ni la session unique, ni
le cancel explicite, ni une seconde d'attente ne changent le relevé.

**Correctif :** une page neuve par geste, et l'outil qui enchaîne ne
juge que son premier. Un `touchCancel` envoyé sans toucher actif fait
d'ailleurs échouer l'appel : `Must send a TouchStart first`.

**Et une leçon de plus :** quand un défaut suit le RANG d'une boucle
et jamais son contenu, ce n'est pas la page qu'il faut regarder.

### 49 · Un élément fixe au sommet et un élément épinglé plus bas ne sont pas la même chose

Une couture qui masque **tous** les `position: fixed` à partir de la
deuxième fenêtre masque aussi les scènes épinglées — celles qui
retiennent la page pendant deux ou trois mille pixels et font glisser
leur contenu latéralement. Résultat : la scène disparaît par endroits,
et ce qu'il en reste se recouvre, parce que chaque fenêtre est posée à
sa hauteur de défilement alors que le contenu, lui, n'a pas bougé.

Vu de la page finie, ça donne « des images superposées » — et ça fait
passer le site montré pour du travail bâclé, alors qu'il est intact.

**La distinction se relève à `y = 0` :** ce qui est déjà fixe au
sommet est de la chrome (barre, voile) et doit être masqué. Ce qui
**devient** fixe plus bas est une scène épinglée, et elle doit être
jouée.

### 50 · Deux pages de hauteurs différentes ne peuvent pas partager une course en pixels

Un site de 2011 fait quelques centaines de pixels, un site neuf en fait
dix mille. Empilés dans le même conteneur défilant, ils partagent une
seule course — celle du plus court dès qu'on borne l'autre. Le
visiteur arrive au pied du vieux site et **tout** s'arrête.

**Correctif :** une course en POURCENTAGE. Le conteneur ne porte
qu'une piste vide ; chaque page est translatée de sa propre fraction.
À mi-chemin d'un côté, à mi-chemin de l'autre, et les deux atteignent
leur pied ensemble. Aucun des deux ne plafonne l'autre.

### 51 · `:focus-visible` ne s'arme pas sur un `focus()` de script

Un test qui appelle `element.focus()` puis lit `outline-width` rend
**zéro** sur un anneau qui existe : le navigateur ne juge le focus
« visible » que lorsqu'il vient d'un geste clavier. Quatre faux échecs
d'affilée sur un bouton parfaitement conforme.

**Correctif :** tabuler, puis lire le style de `document.activeElement`.

### 52 · Une image déclarée n'est pas une image chargée

`ba-check.mjs` mesurait des écarts de pixels entre deux captures d'un
cadre pour prouver que le défilement se voit. Le 2026-07-31, les quatre
« après » ont affiché leur **texte alternatif** à la place des sites —
et tout le fichier est passé au vert. Deux captures de texte alternatif
diffèrent aussi.

Rien n'y vérifiait qu'une image **charge**. Et une `background-image`
qui répond 404 ne se voit nulle part : elle ne passe par aucun `<img>`,
aucune sonde du DOM ne la trouve manquante.

**Ce qu'il faut exiger, et rien de moins :**
- `complete` **et** `naturalWidth > 0` — le fichier est arrivé et s'est
  décodé ;
- une largeur et une hauteur **rendues** non nulles — elle occupe
  vraiment de la place ;
- pour les fonds CSS, relever les adresses dans les styles calculés et
  les **demander une par une**.

Et il faut d'abord amener chaque image dans le champ : une tuile
différée n'entre en vue que **translatée** par le pilote du cadre, pas
par le défilement de son conteneur. Un `scrollTop` posé d'un coup la
saute.

### 53 · Une hauteur lue sur la première tuile d'une pile

`--ba-y` était borné par `.ba-shot.naturalHeight / naturalWidth`. Le
jour où l'image d'un seul tenant est devenue une **pile de tuiles**,
cette balise n'a plus désigné que la première : 1 100 px sur 6 916.

Le maximum calculé valait donc six fois trop peu — et l'assertion
« au bout, il ne reste rien » **passait pour une mauvaise raison** :
`position / maximum` dépassait 1, le reste sortait négatif, et
« négatif < 2 » est vrai. Un test vert sur un calcul faux.

**Correctif :** mesurer la hauteur **rendue de la pile**, la même que
celle que le pilote utilise. Et se méfier d'une assertion qui ne peut
échouer que par le haut : elle ne dit rien quand le calcul déraille par
le bas.

### 54 · Dix images ne font pas un mouvement

Une scène épinglée rejouée en dix vues sur 2 400 px de défilement, ça
fait **un saut tous les 240 px**. Aucun réglage ne rend ça fluide : le
problème n'est pas la vitesse, c'est qu'il n'y a que dix états.

Et le test ne le voyait pas, parce qu'il mesurait l'**écart de pixels
entre deux captures** — grand à chaque changement d'image, donc
rassurant. Ce qu'il fallait mesurer, c'est la **régularité du pas** :
on avance de douze pas égaux et on lit la position. Une piste continue
avance du même pas à chaque fois ; un diaporama avance par bonds et
reste **immobile** entre deux — un pas vaut zéro, et le rapport du plus
grand au plus petit part à l'infini.

**Avant de multiplier les images, mesurer ce qui bouge.** Ici, un seul
élément translatait, purement à l'horizontale : la réponse n'était pas
« plus d'images », c'était **une seule image translatée**. Continue par
construction, et cinq fois plus légère.

### 55 · Un fichier de sortie abandonné ne disparaît pas tout seul

Quand la forme d'une sortie change — deux planches remplacées par un
fond et une piste — les anciens fichiers restent sur le disque. Plus
référencés nulle part, invisibles à toute vérification de page, et
**505 Ko** de plus dans le dossier servi.

L'outil qui produit doit **effacer ce qu'il ne produit plus**, en
bornant le nettoyage à son propre motif de nom. Sinon le seul relevé
juste est un `du` à la main, et personne ne le fait.

### 56 · `requestAnimationFrame` sur un écouteur de défilement met le contenu en retard d'une image

Étaler un rendu sur un `requestAnimationFrame` est le réflexe habituel
pour ne pas surcharger un écouteur de `scroll`. Quand ce qu'on peint
**est** ce que le visiteur croit défiler, c'est faux.

Le conteneur défile sur le compositeur ; ce qu'on voit est une couche
posée par-dessus et déplacée par nous. Une image de retard, et la
couche montre encore l'état d'avant pendant que la barre est déjà
ailleurs.

**Mesuré :** sur 18 images où le défilement avançait, le contenu a suivi
dans la même image **0 fois**. Cent pour cent de retard, systématique —
et invisible sur une capture stabilisée, puisque tout se remet en place
dès qu'on arrête.

**Correctif :** écrire la transformation **dans l'événement**. Un
`scroll` est distribué avant la peinture, donc le style part dans la
même image. Après : 0 %. Le coût est de deux propriétés personnalisées
par événement.

**Comment le mesurer :** échantillonner `scrollTop` et la valeur
appliquée dans la MÊME boucle d'animation, et compter les images où
l'une a changé sans l'autre. Un écart moyen ne le montre pas.
