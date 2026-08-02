# CLINIQUE — CLINIQUE DU RIVERAIN

*Clinique multidisciplinaire fictive : physiothérapie, ostéopathie,
nutrition. Un seul écran, 1440 × 900, arrêté. Rien en dessous.*

Le nom vient de `demos-secteurs/DIRECTIONS.md § 08` et ne change pas :
les douze directions s'écrivent ensemble, un nom qui bouge tout seul
désynchronise la carte.

---

## Les trois références

Trois relevés réussis, mesurés à 1440 px de large avec
`node tools/refs-releve.mjs`. Les captures et les JSON sont dans
`tools/_refs/clinique-<clé>/`.

Six autres ont été tentées et écartées, et il faut le dire ici parce
que c'est une information : **`carbonhealth.com` rend un mur
Cloudflare** (« Sorry, you have been blocked »), **`doctolib.fr` rend
son héros sous un voile de témoins** — la capture est grise, il n'y a
rien à mesurer dessus. Les trois autres sont écartées pour la DA, pas
pour un échec technique : voir la fin de cette section.

### 1 · Sword Health — `https://swordhealth.com`

`tools/_refs/clinique-sword/`

**Ce qu'elle prouve.** Qu'un écran **très clair, froid et rond** peut
être le plus sérieux de la page d'un acteur de la santé musculo-
squelettique. Le fond n'est pas blanc : c'est un dégradé irisé
extrêmement pâle, sans point de fuite, qui donne de la profondeur sans
un seul aplat de couleur. La barre de navigation est **décollée du bord
haut** et flotte en capsule blanche encastrée de 64 px de chaque côté :
à elle seule, elle annonce « ceci est une application, pas une
brochure ».

**Ce qu'on lui prend.** Trois choses, au chiffre près :

- la **barre flottante** encastrée, et la logique de superposition
  qu'elle installe dès le premier pixel ;
- le **rayon 100 px sur tous les boutons** et le rayon **32 px** sur
  les cadres d'image ;
- son ombre, qui est la plus juste que j'aie mesurée sur les douze
  relevés : `rgba(0,0,0,.05) 0 12px 40px 0` — **12 px de décalage pour
  40 px de flou et 5 % d'opacité**. C'est une ombre qui pose, pas une
  ombre qui décolle.

**Ce qu'on écarte.** Le titre **centré** à 80 px : il fait de la page
une affiche, et ma voie est une interface. Et l'appareil qui monte du
bas de l'écran — je n'ai pas de bas d'écran.

**Les chiffres du relevé.** h1 80 px / interligne 86 px (**1,075**),
graisse 600, chasse −0,2 px, `rgb(31,34,44)`, boîte x 340 → 1100
(760 de large, centrée) · corps 16 px · **une seule famille pour toute
la page** (Figtree) · fonds dominants blanc, `rgb(247,244,242)`, bleu
d'action `rgb(74,137,232)` · boutons rayon **100 px**, hauteur 42 à 56 ·
cadres d'image rayon **32 px** · page 12 541 px · **aucune bibliothèque
d'animation** — ni GSAP, ni ScrollTrigger, ni Lenis, ni Locomotive, ni
Three, ni même l'animation pilotée par le défilement en CSS.

### 2 · Headway — `https://www.headway.co`

`tools/_refs/clinique-headway/`

**Ce qu'elle prouve.** Que **ma composition existe et qu'elle tient** :
colonne de texte courte à gauche, la commande à portée de main dans la
même colonne, et **une photographie petite, enfermée dans un cadre, à
droite**. La photo fait 456 × 368 sur un écran de 1440 × 900 — **13 %
de la surface**. Elle ne domine rien, et pourtant l'écran n'est pas
froid.

**Ce qu'on lui prend.** Le **rapport de surface**, et la place de la
commande : le premier geste possible est *dans* la colonne de gauche,
sous le sous-titre, pas dans un bandeau à part. C'est ce qui fait qu'on
comprend le site en trois secondes.

**Ce qu'on écarte.** Tout le reste : le vert, la sérif de titre, et
surtout **les rayons de 4 à 8 px** — Headway est une page à angles
presque vifs, et je suis le seul des douze à être rond. J'écarte aussi
son formulaire à deux champs plats, qui est un formulaire, pas une
interface.

**Les chiffres du relevé.** **Attention, un piège**, et il vaut la
peine d'être écrit : le `<h1>` que l'outil attrape fait **16 px** et
n'est pas visible — c'est un titre d'accessibilité masqué. Le titre
qu'on voit, mesuré sur `0-heros.png`, fait **≈ 44 px / 52 px**
(interligne **1,18**), en sérif « Honey » · corps 16 px / 24 px,
`PostGrotesk` · fond de héros menthe très pâle `rgb(242,253,249)`,
accent vert `rgb(11,102,61)` · colonne gauche à x 136, ≈ 600 de large ·
deux champs de 52 px de haut + un bouton 133 × 56 · photo x 848 → 1304,
456 × 368, rayon ≈ 8 px · page 5 626 px · **aucune bibliothèque
d'animation**.

### 3 · Jane App — `https://jane.app`

`tools/_refs/clinique-jane/`

**Ce qu'elle prouve.** Que **l'objet du héros peut être le produit
lui-même** : à droite, une capture de l'agenda de la clinique, ~550 ×
382, dans un cadre clair posé sur un socle d'ordinateur portable ; à
gauche, quatre lignes et deux boutons. C'est le logiciel de gestion que
les physios et les ostéos du Québec ont réellement sous les yeux — la
grammaire visuelle que mon visiteur *reconnaîtra*.

**Ce qu'on lui prend.** Le principe, et rien que le principe :
**montrer l'agenda, pas le promettre**. Et la sarcelle très pâle
`rgb(205,245,247)` comme fond de zone active — un pastel froid qui ne
salit pas le blanc.

**Ce qu'on écarte.** L'exécution, qui a dix ans : la capture d'écran
photographiée dans un socle d'ordinateur (au lieu d'une interface
redessinée et vivante), les boutons à **rayon 0**, la sarcelle saturée
en pleine masse, l'interligne de **1,267** sur un titre d'affichage —
mou. Et le bandeau de témoins qui mange le quart bas de l'écran.

**Les chiffres du relevé.** h1 60 px / interligne 76 px (**1,267**),
graisse 500, `rgb(0,177,184)`, boîte x 135, y 233, 545 de large ·
corps **15 px** · fonds blanc, sarcelle `rgb(0,193,202)`, sarcelle pâle
`rgb(205,245,247)` · boutons rayon **0 px** · page 6 307 px ·
**animation pilotée par le défilement en CSS pur détectée**
(`scrollDrivenCSS: true`) et aucune bibliothèque.

### Les trois qu'on a mesurées et qu'on refuse

Elles ne sont pas des références, elles sont la **liste des pièges du
métier**, et chacune fait exactement une des choses que ma voie
interdit.

| Site | Relevé | Ce qu'elle fait, et que je ne ferai pas |
|---|---|---|
| `hingehealth.com` | `clinique-hinge` | **Vidéo plein cadre**, sombre, un visage en très gros plan. C'est le contraire d'« aucune photographie plein cadre » |
| `nabla.com` | `clinique-nabla` | **La blouse blanche et le stéthoscope**, plein cadre, en virage vert. Le cliché nommément interdit par la DA |
| `101physio.ca` | `clinique-101physio` | Nommée aux Awwwards, et pourtant : dégradé bleu saturé, **bouton rouge**, deux sourires d'archive avec un haltère. C'est le gabarit de clinique que le client croit vouloir |

`superpower.com` (`clinique-superpower`) est écartée pour la même
raison que les trois — fond noir, orange en pleine masse, portrait
plein cadre — mais je lui prends **une** idée : la page entière est un
rectangle arrondi **encastré** dans une marge blanche. C'est la même
famille de geste que la barre flottante de Sword, et ça confirme que le
dispositif tient.

---

## La direction artistique

| Poste | Décision |
|---|---|
| **Référence culturelle** | **Le tableau de bord d'un logiciel de prise de rendez-vous, sorti de son navigateur et posé sur une vitre.** Rond, calme, aéré, jamais froid — au sens humain ; très froid au sens de la lumière. On ne montre pas une clinique : on montre **la minute où le rendez-vous se prend**, et on la montre en train de se faire |
| **Palette (hex nommés)** | **Fonds** — `glacier #EEF4F8` (page), `givre #F7FAFC` (le plus clair), `blanc #FFFFFF` (les capsules). **Bleus** — `bleu profond #1B4F7A` (accent d'action : bouton, étape courante, créneau retenu, anneau), `bleu d'appui #0F3B5F` (seulement sur menthe), `bleu pâle #DCE9F2` (fond des états en attente), `filet #C2D8E8`, `filet fin #E1EBF2`, `mat #F2F6F9` (créneau déjà pris). **Menthe** — `menthe #7FBFA8` (étape franchie, disponibilité), `menthe pâle #E4F2EC` (halo bas-gauche). **Textes** — `encre douce #20303A`, `ardoise #48657A`. Aucun bleu marine : `#1B4F7A` est à 205° de teinte, il tire sur le cyan. Aucun orange nulle part |
| **Typographie (familles + tailles + interlignage)** | Deux familles, quatre fichiers, **rien d'autre** — `outfit` 500 / 800 et `manrope` 400, servies depuis `fonts/demos/` (`outfit-{0..3}.woff2`, `manrope-{0..1}.woff2`). **Ces graisses-là sont les seules disponibles** (`tools/polices-demos.mjs` : `Outfit:wght@500;800`, `Manrope:wght@400;800`) et le plan est dessiné pour n'avoir besoin de rien d'autre. **Titre** `outfit` 800, **68 px / interligne 64 px (0,941)**, chasse −2,0 px, `#20303A`. **Titre de carte** `outfit` 800 26 px / 30 px. **Chiffre de l'anneau** `outfit` 800 32 px. **Libellés d'interface, liens, boutons, heures** `outfit` 500, 12 à 16 px. **Texte courant** `manrope` 400, 17 px / 27 px, mesure **476 px** (≈ 58 signes — la fourchette 46–62 du standard). **Petit texte** `manrope` 400, 11,5 à 14 px |
| **Composition du premier écran** | **Au pixel, dans le tableau qui suit.** En un mot : une barre flottante en capsule, une colonne courte à gauche, une **plaque** translucide à droite, et **par-dessus la plaque, décalée de 64 px vers la gauche et de 40 px vers le bas, la carte de rendez-vous** — c'est ce décalage, et lui seul, qui fait qu'on voit deux plans |
| **Formes** | **Rayon 999 px** : barre de navigation, pastille de démonstration, pastilles de discipline, tous les boutons, les trois pastilles d'étape, les sept capsules de jour, les six capsules d'heure, les deux flèches de semaine. **Rayon 24 px** : la carte, la vignette photo. **Rayon 32 px** : la plaque. **Rayon 20 px** : rien — on n'invente pas une quatrième valeur. **Aucun angle vif nulle part**, y compris `stroke-linecap: round` sur l'anneau. **Ombres douces, en deux temps** : un contact serré + une portée large et très faible. La carte : `0 2px 8px rgba(27,79,122,.06), 0 40px 80px -24px rgba(27,79,122,.22)`. Les boutons pleins : `0 10px 22px -8px rgba(27,79,122,.45)`. La barre : `0 6px 24px rgba(27,79,122,.07)`. **Flou de verre** : `backdrop-filter: blur(24px) saturate(1.3)` sur la carte, `blur(20px) saturate(1.25)` sur la barre. **Dégradés doux** : deux voiles radiaux sur le fond, décrits plus bas |
| **Traitement photo** | **Une seule photographie, `images/secteurs-sites/clinique-2.webp`** (1920 × 1080, corridor vitré et rangée de sièges, `pexels.com/photo/19921278/`). Recadrée **à la source** sur `x 20 → 920, y 380 → 980` (900 × 600, rapport 1,5) : on garde la baie vitrée et les dossiers de sièges, **on coupe la silhouette floue et le panneau vert** du fond de corridor. Affichée **264 × 176** — **3,6 % de la surface de l'écran**. Traitement : `filter: saturate(.6) brightness(1.07)` + un voile `#BFD8E8` à 12 % en `mix-blend-mode: color`, qui tire le beige des sièges vers le gris froid sans le vider. Hautes lumières relevées, jamais de gros plan clinique. Cadre : rayon 24, filet 1 px `rgba(255,255,255,.9)`, ombre `0 16px 36px -12px rgba(27,79,122,.28)`. `alt` : « Rangée de sièges le long d'une baie vitrée, lumière du jour. » |
| **Le geste et l'instant de capture** | **Un seul : l'anneau « 2 sur 3 » se dessine.** Cercle SVG r = 52, `stroke-width` 8, `stroke-linecap: round`, `transform: rotate(-90deg)` pour partir à midi, sens horaire. Piste `#DCE9F2`, arc `#1B4F7A`. `stroke-dasharray: 326.7` (2πr) ; `stroke-dashoffset` va de **326,7 (0 %) à 108,9 (66,7 %)** en **1100 ms**, `cubic-bezier(.22,.61,.36,1)`, délai 260 ms, `animation-fill-mode: forwards`. **L'état de repos est 66,7 %** — deux étapes sur trois, ce qui est l'information. **On capture à 600 ms** après le premier rendu, soit 340 ms de course : l'arc est alors à **≈ 31 %** et s'arrête vers quatre heures. Sur l'image arrêtée, un anneau de 112 px de diamètre à 8 px d'épaisseur, franchement inachevé contre sa piste pâle — **ça se lit à trois mètres, et ça se lit sans deuxième image**. Preuve exigée par le standard : cinq captures à 260 · 430 · 600 · 780 · 1360 ms rendent 0 % · 17 % · 31 % · 48 % · 66,7 %. Sous `prefers-reduced-motion: reduce`, l'anneau est à 66,7 % dès la première image et rien ne bouge : **aucune information ne se perd**, elle est écrite trois fois — l'arc, le « 2/3 » au centre, et le rail des trois étapes |
| **Ce qu'on ne fait pas** | Pas de croix, pas de blouse blanche, pas de stéthoscope, pas de main sur une épaule. Pas de bleu marine, pas d'orange, pas de rouge, pas de vert d'hôpital. **Pas un seul angle vif.** Pas de photographie plein cadre, pas de vidéo. Pas de mur typographique — le titre est à 68 px et fait trois lignes courtes, la carte est plus grande que lui. Pas de prix, pas d'avis, pas de note, pas de témoignage, pas de nom de professionnel, pas d'accréditation, pas de « depuis 1998 ». Pas de chiffre de patients. Pas de date numérotée dans le calendrier — **et c'est une décision, pas un oubli** : voir plus bas. Aucune requête tierce |

### La composition, au pixel — 1440 × 900

**Le fond.** `#EEF4F8` uni, plus deux voiles radiaux, et rien d'autre :

- `radial-gradient(980px 760px at 1090px 250px, #DCE9F2 0%, transparent 70%)` — la lueur froide derrière la carte ;
- `radial-gradient(620px 520px at 300px 840px, #E4F2EC 0%, transparent 72%)` — la menthe sous le bas-gauche, qui empêche l'écran de virer au bleu clinique.

| Élément | x | y | l × h | rayon | ce qu'il porte |
|---|---|---|---|---|---|
| **Barre flottante** | 96 → 1344 | 28 | 1248 × 68 | 999 | `rgba(255,255,255,.68)` + `blur(20px) saturate(1.25)`, filet intérieur 1 px `rgba(255,255,255,.85)`, ombre `0 6px 24px rgba(27,79,122,.07)` |
| ↳ pastille du sigle | 128 | 46 | 32 × 32 | 999 | fond `#1B4F7A`, « R » `outfit` 800 16 px blanc |
| ↳ mot-symbole | 172 | — | 153 de large | — | « Clinique du Riverain », `outfit` 800 17 px, chasse −0,2, `#20303A` *(mesuré : 153,2 px)* |
| ↳ quatre liens | 517 → 923 | — | h 34 | 999 | `outfit` 500 15 px `#48657A` ; le courant (« Services ») dans une capsule `#DCE9F2`, retrait 14 px, texte `#1B4F7A` |
| ↳ téléphone | 1001 → 1093 | — | — | — | « 000 000-0000 », `manrope` 400 14 px `#48657A` |
| ↳ bouton de barre | 1121 → 1312 | 40 | 191 × 44 | 999 | fond `#1B4F7A`, « Prendre rendez-vous » `outfit` 500 15 px blanc *(texte mesuré 138,8 px + 2 × 26)* |
| **Pastille de démonstration** | 96 | 136 → 166 | 345 × 30 | 999 | fond transparent, filet 1 px `#C2D8E8`, `manrope` 400 12,5 px `#48657A` |
| **Titre (3 lignes)** | 96 | 202 → 394 | mesure 520 | — | `outfit` 800 **68 / 64**, chasse −2,0, `#20303A`. Lignes **mesurées à la spécification finale** : 402,9 · 432,4 · 475,1 px — **45 px de marge sur la colonne de 520** |
| **Sous-titre (2 lignes)** | 96 | 428 → 482 | mesure 476 | — | `manrope` 400 **17 / 27**, `#48657A` *(ligne 1 mesurée 459 px, ligne 2 : 304 px → la coupe tombe toute seule après « toit. »)* |
| **Trois pastilles de discipline** | 96 → 487 | 522 → 562 | 141 / 126 / 104, h 40, écart 10 | 999 | fond blanc, filet 1 px `#C2D8E8`, `outfit` 500 14 px `#20303A`, point de 8 px devant : `#1B4F7A`, `#7FBFA8`, `#9CC2DA` |
| **Bouton primaire** | 96 → 304 | 594 → 650 | 208 × 56 | 999 | fond `#1B4F7A`, `outfit` 500 16 px blanc, ombre `0 10px 22px -8px rgba(27,79,122,.45)` |
| **Vignette photo** | 96 → 360 | 690 → 866 | 264 × 176 | 24 | la photo décrite plus haut. Marge basse 34 px |
| **La plaque** | 800 → 1392 | 92 → 828 | 592 × 736 | 32 | `rgba(220,233,242,.55)`, filet 1 px `rgba(255,255,255,.72)`, **aucune ombre**. Elle dépasse la carte de 40 px en haut, 48 px à droite, 52 px en bas — ce liseré est toute la preuve de superposition |
| **LA CARTE** | 736 → 1344 | 132 → 776 | 608 × 644 | **24** | `rgba(255,255,255,.82)` + `blur(24px) saturate(1.3)`, filet intérieur 1 px `rgba(255,255,255,.9)`, filet extérieur 1 px `rgba(27,79,122,.07)`, ombre `0 2px 8px rgba(27,79,122,.06), 0 40px 80px -24px rgba(27,79,122,.22)`. Retrait 32 → **zone utile x 768 → 1312, 544 de large** |

**Le contenu de la carte, de haut en bas.**

| Bloc | y | détail |
|---|---|---|
| **L'anneau** | centre (824, 220) | ø extérieur **112** (donc 164 → 276, exactement sous le retrait haut de la carte), piste `#DCE9F2` 8 px, arc `#1B4F7A` 8 px. Au centre : « **2** » `outfit` 800 32 px `#1B4F7A` suivi de « /3 » `outfit` 500 16 px `#48657A` |
| **Le bloc de titre** | x 960 | sur-titre « PRISE DE RENDEZ-VOUS » `outfit` 500 12 px, chasse 0,1em, `#48657A`, y 181 · titre « Choisissez votre heure » `outfit` 800 26 / 30 `#20303A`, y 203 *(mesuré 270,5 px)* · sous-ligne « Physiothérapie · 45 minutes · en clinique » `manrope` 400 14 px `#48657A`, y 241 *(mesuré 256,3 px)*. Le bloc va de 181 à 261 : son milieu tombe à 221, soit **le centre de l'anneau à un pixel près** |
| **Le rail des trois étapes** | pastilles centrées y 313 | trois pastilles ø 34, rayon 999, centres à **x 816 · 1036 · 1256** (pas de 220) ; ligne de liaison 2 px à y 313. **① franchie** : fond `#7FBFA8`, coche 14 px `#0F3B5F` *(contraste 5,48)* ; liaison ①→② pleine `#7FBFA8`. **② courante** : fond `#1B4F7A`, « 2 » `outfit` 800 14 px blanc, halo 1 px `#DCE9F2` à 6 px ; liaison ②→③ `#DCE9F2`. **③ en attente** : fond `#DCE9F2`, « 3 » `outfit` 800 14 px `#1B4F7A` *(contraste 6,94)*. Libellés y 344, `outfit` 500 12,5 px, centrés : « Le service » `#48657A` · « Le moment » `#20303A` · « Vos coordonnées » `#48657A` *(mesurés 54,9 / 62,6 / 94,1 — le troisième, centré sur 1256, va de 1209 à 1303 et garde 9 px de marge sur la zone utile qui finit à 1312 ; c'est pour ça que les centres ne sont pas à 816 · 1040 · 1264)* |
| **La ligne de semaine** | 386 → 414 | « CETTE SEMAINE » `outfit` 500 12 px, chasse 0,1em, `#48657A`, calée à gauche sur x 768 ; deux pastilles ‹ › ø 28, rayon 999, filet 1 px `#C2D8E8`, texte `#1B4F7A`, calées à droite : x 1248 → 1276 et 1284 → 1312 |
| **La bande des sept jours** | 414 → 488 | sept capsules **68 × 74**, rayon **999**, écart 11 *(7 × 68 + 6 × 11 = 542 sur 544)*. Chacune : jour abrégé `outfit` 500 12 px, et sous lui un point de 6 px. **Disponible** : fond blanc, filet 1 px `#C2D8E8`, texte `#20303A`, point `#7FBFA8`. **Retenue (« mer. »)** : fond `#1B4F7A`, texte blanc, point blanc, ombre `0 8px 18px -6px rgba(27,79,122,.5)`. **Fermée (« dim. »)** : fond transparent, filet 1 px `#E1EBF2`, texte `#48657A`, et une barre de 12 px `#C2D8E8` au lieu du point |
| **La grille des six heures** | 516 → 568 et 582 → 634 | six capsules **172 × 52**, rayon **999**, écart 14 *(3 × 172 + 2 × 14 = 544)*, `outfit` 500 16 px. **Libre** : fond blanc, filet 1 px `#C2D8E8`, texte `#20303A`. **Retenue (« 10 h 30 »)** : fond `#1B4F7A`, texte blanc, ombre `0 8px 18px -6px rgba(27,79,122,.45)`. **Déjà prise (« 11 h 15 »)** : fond `#F2F6F9`, **texte `#48657A` à pleine valeur** *(6,14 sur blanc)*, barré 1 px `#8FA9BA`, aucun filet |
| **Le filet de pied** | 662 | 1 px `#E1EBF2`, de x 768 à 1312 |
| **Le récapitulatif** | 684 / 708 | « Mercredi, 10 h 30 » `outfit` 800 17 px `#20303A` *(mesuré 134,7)* ; dessous « Physiothérapie · 45 min » `manrope` 400 13,5 px `#48657A` |
| **Le bouton de la carte** | x 1160 → 1312, y 684 | 152 × 52, rayon 999, fond `#1B4F7A`, « Continuer » `outfit` 500 16 px blanc, ombre `0 10px 22px -8px rgba(27,79,122,.45)` |
| **La mention légale** | 742, centrée | « Démonstration — aucune réservation n'est enregistrée. » `manrope` 400 11,5 px **`#48657A`** *(mesurée 290,4 px ; contraste 6,14 — surtout pas un gris pâle, c'est la phrase la plus importante de la carte)* |

### Les quatre points sur lesquels on peut me prendre en défaut

Écrits ici pour qu'on n'ait pas à les redécouvrir.

1. **Le calendrier n'affiche aucune date numérotée, et c'est voulu.**
   La consigne est qu'un calendrier qui montre des dates doit ouvrir
   sur un mois qui en offre. Un écran arrêté ne peut pas tenir cette
   promesse : le « 4 août » d'aujourd'hui est le 4 août périmé de
   demain, et le piège 41 dit exactement ça. Donc : **des noms de jours
   et « CETTE SEMAINE », rien de numéroté.** Si un jour on rend les
   numéros, ils se calculent à partir de la semaine courante, jamais en
   dur, et la vue s'ouvre sur la première semaine qui offre un créneau.
   Les deux flèches ‹ › sont inertes sur un écran unique, comme les
   quatre liens de la barre : elles portent un `aria-disabled="true"`
   et gardent leur anneau de focus.
2. **La carte ne réserve rien, et elle le dit deux fois** — dans la
   pastille sous la barre, et en pied de carte. Une seule mention se
   perd ; deux, à deux niveaux de lecture différents, tiennent.
3. **Le texte de toutes les commandes passe AA** (les onze paires
   mesurées sont dans le tableau). **La frontière visuelle des capsules
   ne passe pas 3:1** — `#C2D8E8` sur blanc rend 1,35. C'est inhérent à
   « très clair et froid » : un filet à 3:1 serait un gris moyen et
   tuerait la douceur. L'identification d'une capsule tient à son
   **libellé** et à sa position dans une grille régulière, pas à son
   filet. C'est un choix, il est assumé, et il est écrit.
4. **Aucune de ces mesures ne vient d'un appareil réel.** Les largeurs
   de texte ont été relevées dans Chromium sous Playwright, avec les
   `.woff2` du dépôt effectivement chargés
   (`document.fonts.check` = vrai). Les positions, elles, sont
   **calculées, pas encore observées** : elles se vérifient à la
   capture, pas dans ce fichier.

---

## Le contenu exact

**Nom fictif :** Clinique du Riverain
**Sigle :** R
**Coordonnées :** `000 000-0000` · `courriel@exemple.ca` · Adresse sur demande

### La barre

| Emplacement | Texte, mot pour mot |
|---|---|
| Mot-symbole | `Clinique du Riverain` |
| Lien 1 *(courant)* | `Services` |
| Lien 2 | `Approche` |
| Lien 3 | `Vos questions` |
| Lien 4 | `Nous joindre` |
| Téléphone | `000 000-0000` |
| Bouton | `Prendre rendez-vous` |

*Les quatre liens sont inertes sur un écran unique — `href="#"`,
`aria-current="page"` sur « Services ». Ils sont là parce qu'une
interface sans navigation n'est pas une interface, pas pour aller
quelque part.*

### La colonne de gauche

**Pastille de démonstration**

```
Démonstration — aucune réservation n'est enregistrée
```

**Titre** *(trois lignes forcées, `<br>` explicites)*

```
Trois métiers,
une seule prise
de rendez-vous.
```

**Sous-titre** *(deux lignes, la coupe tombe d'elle-même)*

```
Physiothérapie, ostéopathie et nutrition sous le même toit.
Vous choisissez le service, puis l'heure.
```

**Les trois pastilles**

```
Physiothérapie
Ostéopathie
Nutrition
```

**Bouton primaire**

```
Voir les disponibilités
```

**Vignette photo — texte de remplacement**

```
Rangée de sièges le long d'une baie vitrée, lumière du jour.
```

### La carte de rendez-vous — tout le texte

**En-tête**

```
PRISE DE RENDEZ-VOUS
Choisissez votre heure
Physiothérapie · 45 minutes · en clinique
```

**Au centre de l'anneau**

```
2/3
```

**Le rail des trois étapes**

```
✓            2            3
Le service   Le moment    Vos coordonnées
```

**La ligne de semaine**

```
CETTE SEMAINE          ‹  ›
```

**Les sept capsules de jour** *(« mer. » retenue, « dim. » fermée)*

```
lun.   mar.   mer.   jeu.   ven.   sam.   dim.
```

**Les six capsules d'heure** *(« 10 h 30 » retenue, « 11 h 15 » barrée)*

```
8 h 15     9 h 00     10 h 30
11 h 15    13 h 45    15 h 30
```

*Les heures s'écrivent à la québécoise, avec une espace insécable de
part et d'autre du `h` : `10&nbsp;h&nbsp;30`.*

**Le pied de carte**

```
Mercredi, 10 h 30
Physiothérapie · 45 min

[ Continuer ]

Démonstration — aucune réservation n'est enregistrée.
```

### Ce qui ne s'écrit nulle part sur cet écran

Aucun prix. Aucune note, aucun avis, aucun témoignage. Aucun nom de
physiothérapeute, d'ostéopathe ou de nutritionniste. Aucun ordre
professionnel, aucun numéro de permis, aucune assurance nommée. Aucune
adresse. Aucun nombre de patients, aucune année de fondation.

`<meta name="robots" content="noindex,nofollow">` dans l'en-tête, et la
mention « démonstration » visible deux fois dans l'écran.

---

## Ce qui me distingue des onze autres

**Composition.** Je suis le seul dont le premier écran est **une
interface en train d'être utilisée** : une carte translucide au premier
plan, décalée de 64 px sur une plaque, avec une étape sur trois
allumée. Les onze autres montrent une photographie, un titre, ou un
objet — moi je montre **un geste à moitié fait**, et la photographie y
occupe 3,6 % de la surface.

**Couleur.** Je suis le seul **très clair et froid** : `#EEF4F8` en
fond, `#1B4F7A` pour agir, `#7FBFA8` pour ce qui est franchi. La
coiffure est l'autre clair froid, mais elle est en blanc pur, noir et
rouge, en colonnes de magazine — trois couleurs dures contre mes onze
teintes pâles de deux familles. Personne d'autre ne pose de menthe.

**Typographie.** `outfit` 800 à 68 px sur un interligne de 0,941 : des
bols parfaitement ronds, en trois lignes courtes qui n'occupent qu'un
tiers de la largeur. Et c'est le seul écran des douze où **le titre
n'est pas le plus gros objet de l'image** — la carte l'est, et c'est
tout le propos.

---

*Écrit le 2026-08-01. Relevés dans `tools/_refs/clinique-sword`,
`clinique-headway`, `clinique-jane`. Aucune ligne de code n'a été
écrite ; ce fichier est le seul livrable.*
