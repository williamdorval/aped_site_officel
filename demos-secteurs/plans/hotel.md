# HÉBERGEMENT — Auberge de l'Anse-à-Givre

Un seul écran, **1440 × 900**, arrêté. Une photographie de paysage plein
cadre, et le plus gros caractère de l'écran mesure **21 px**. C'est tout
le parti : le visiteur regarde un lieu, pas une page.

> **Deux corrections du 2026-08-01, et elles se lisent partout dans ce
> plan.** (1) La photographie était `hotel-1`, un massif européen sous
> un texte qui dit « Haute-Côte-Nord » ; elle est remplacée par
> `hotel-2`, et la composition est **recotée sur la nouvelle matière**
> — voile du haut, mention à 72 %, bloc de gauche remonté de 28 px.
> (2) Le geste était un filet d'**1 px** ; réduit à l'échelle du
> panneau (0,29) il ne pesait plus rien. Il devient une **plaque de
> laiton de 16 px** qui court sous le nom. Piège 57.

---

## Les trois références

Sept relevés ont été pris ou relus. Trois sont retenus. Les autres —
`hotel-tengile` (titre de 120 px en travers de la photo : exactement
l'inverse de la voie), `hotel-svart` (le bleu arctique juste, mais un
site Wix sans métier), `hotel-arcticbath`, `hotel-juvet` (deux
grotesques lourdes, mauvais registre) — sont dans `tools/_refs/` et ne
servent qu'à borner ce qu'on écarte.

### 1 · Nimmo Bay Resort — https://www.nimmobay.com

*Relevé relancé le 2026-08-01 → `tools/_refs/hotel-nimmo/`*

**Les chiffres.** `h1` : **48 px**, interlignage 57,6 px, **chasse
+4 px**, graisse 300, capitales, blanc. Une seule famille sur toute la
page : `Roboto`. Premier écran : une section de **900 px** de haut, fond
`rgba(0,0,0,0)` — la photographie *est* le fond, il n'y a aucun aplat
dessous. Page de 10 785 px, 30 images dont 14 au-delà de 380 px. Aucune
bibliothèque d'animation détectée. Relevé à l'image : le mot-marque
visible a une hauteur de capitale de 50 px (y 434 → 484), soit ≈ 70 px
de fonte ; les deux micro-libellés « WILDNESS » / « WITHIN » font ≈ 15 px
avec ≈ 6 px de chasse.

**Ce qu'elle prouve.** Qu'un nom et deux mots suffisent à tenir un écran
entier, à condition que la photographie porte tout. Le premier écran ne
dit pas ce que l'entreprise fait — il montre où elle est. Message en
trois secondes : *une maison de bois, seule, dans une forêt mouillée.*
L'œil va au pignon, puis descend au nom.

**Ce qu'on lui prend.** La discipline des capitales espacées comme seule
voix d'affichage. Et le décalage des deux micro-libellés l'un par
rapport à l'autre, qui empêche le bloc de texte de devenir un logo.

**Ce qu'on écarte.** La photographie chaude — cèdre blond, toit rouge —
qui est la couleur même que la voie interdit. Les deux boutons encadrés
à angles vifs en haut à droite. Le bandeau promotionnel vert qui mange
46 px du haut de la fenêtre. Et surtout : le nom est posé **par-dessus
le bâtiment**, donc illisible sur sa moitié gauche. Notre texte se pose
sur du vide, jamais sur le sujet.

### 2 · NILS am See — https://www.nilsamsee.at/en

*Relevé neuf, 2026-08-01 → `tools/_refs/hotel-nils/`*

**Les chiffres.** **Attention au relevé : le `h1` mesuré fait 9 px.**
C'est un `h1` de référencement, masqué (`Italiana`, capitales, chasse
2 px, `#153149` sur `#f7f6f0`) — le mot-marque visible n'est pas un
`h1`. Le « corps 9 px » a la même cause. Aucune conclusion ne se tire de
ces deux chiffres. Ce qui se tient : **deux familles seulement**, `Jost`
et `Italiana` ; page de 24 239 px, 69 images dont 28 au-delà de 380 px ;
aucune bibliothèque d'animation. À l'image : la barre de réservation
blanche flottante mesure ≈ 550 × 62 px, centrée, bas de fenêtre, rayon
en stade.

**Ce qu'elle prouve.** Qu'un **objet à coins ronds qui flotte** sur la
photographie ne la détruit pas — il la cadre. Et que « AM SEE », un
sous-titre en capitales minuscules très espacées glissé sous le
mot-marque, tient mieux qu'une baseline écrite en phrase.

**Ce qu'on lui prend.** Le cartouche qui **flotte**, avec de l'air entre
lui et les bords, au lieu d'être soudé au bas de la fenêtre. La seconde
voix en capitales espacées. Et le numéro de téléphone en micro-libellé
en haut à gauche — c'est là qu'on logera nos coordonnées neutres.

**Ce qu'on écarte.** Toute la palette : claire, chaude, `#f7f6f0` sur
`#153149` et `#81a1bc`. Le rayon en stade (999 px) de la barre et les
deux boutons circulaires. La photographie d'intérieur — c'est une
chambre, pas un paysage. Et le mot-marque centré en haut, qui est
exactement le geste que tout le monde fait.

### 3 · Eleven Experience — https://www.elevenexperience.com

*Relevé relancé le 2026-08-01 → `tools/_refs/hotel-eleven/`*

**Les chiffres.** `h1` : **56 px**, **interlignage 56 px (soit 1,0)**,
chasse normale, graisse 300, famille `Larken`, blanc, posé sur la
photographie. Corps 16 px. Premier écran : section de **900 px**, fond
transparent. Fonds fréquents : `#232323` (52 nœuds),
`rgba(255,255,255,.08)` (25), puis **`#0e1b16` (vert-noir)** et
**`#16242e` (bleu-noir)**. Page de 7 737 px, **113 images dont 49
au-delà de 380 px** — 6,3 grandes images par millier de pixels.
`Lenis` détecté : le défilement est piloté.

**Ce qu'elle prouve.** Que le registre du métier — pavillon d'aventure
en pays froid — se joue en **noirs colorés**, jamais en gris neutre. Et
qu'un interlignage de 1,0 transforme une phrase de 56 px en objet
plutôt qu'en paragraphe.

**Ce qu'on lui prend.** Les deux noirs `#0e1b16` et `#16242e` : c'est la
preuve chiffrée que notre sapin `#0b1712` et notre voile froid `#122c3a`
sont le bon voisinage, pas une invention. Et la nav en capitales de
12–13 px très espacées, alignée en haut.

**Ce qu'on écarte.** La phrase centrée en serif lyrique : encore trop
grosse, et elle a le ton d'une citation. Les trois boutons ronds de
lecture vidéo en bas à droite. Le bouton `BOOK NOW` en aplat crème à
angles vifs — c'est le point le plus clair de l'écran, il attrape l'œil
**avant** le paysage, ce qui annule le dispositif.

---

## La direction artistique

| Poste | Décision |
|---|---|
| **Référence culturelle** | Une **plaque de laiton gravée, vissée sur la rambarde d'un belvédère**. On lit le paysage d'abord ; la plaque ensuite, en s'approchant. Rien sur cet écran ne cherche à être vu de loin sauf la photographie |
| **Palette** | **sapin profond `#0b1712`** — le seul aplat de l'écran (cartouche, et couleur de `<html>` sous la photo) · **os `#e8e0cd`** — tout le texte, sans exception · **laiton `#a98b4f`** — le filet, la bordure du cartouche, l'aplat du bouton, **et la plaque du geste** · **voile froid `#122c3a`** posé à 26 % sur la photographie · **givre `#607888`** — ce que la neige *devient* après traitement (mesuré, pas choisi) · noir du dégradé et des deux voiles `rgb(9,18,15)`. **Aucun orange, aucun rouge dans la palette dessinée.** Dans la photographie il en reste **650 pixels sur 1 296 000 — 0,502 ‰** : les carreaux allumés des pavillons, le plus saturé à `#4a362a` (43 %). `saturate(.26)` les ramènerait à 101 px et les deux planches sont indiscernables ; on garde `.34` parce que ces pixels-là sont la seule chose de l'écran qui dise qu'il y a quelqu'un — et c'est précisément ce que la passe du côte-à-côte demandait en remontant la luminosité. *(À `brightness(.60)` il n'y en avait que 61, soit 0,047 ‰ : **le compte suit la luminosité et se reprend à chaque fois qu'elle bouge**.)* |
| **Typographie** | **`cormorant` 600, capitales uniquement, toujours espacé** — 21 px / interlignage 1,0 / chasse **0,44 em** (la marque) · 17 px / 0,20 em (le fait du cartouche) · 14 px / 0,26 em (la nav) · 13 px / 0,28 em (le bouton). **`spectral` 400 italique** — 16 px / interlignage 1,55 (les deux lignes de promesse). **`jetbrains-mono` 500** — 11 px / 0,22 em et 0,16 em, 10 px / 0,22 em et 0,14 em (les micro-libellés). **Le plus gros caractère de l'écran fait 21 px.** Aucune fonte en bas de casse sauf `spectral`. Quatre fichiers : `cormorant-2/3`, `spectral-0/1`, `jetbrains-mono-0/1` — servis depuis `../../fonts/demos/`, SIL OFL 1.1 |
| **Composition du premier écran** | Voir le tableau au pixel ci-dessous |
| **Formes** | **Deux rayons, et rien d'autre : 24 px** sur le cartouche (288 × 116), **20 px** sur le bouton (236 × 52) — le petit objet prend le plus petit rayon, c'est la règle. Le bouton fait 52 px de haut pour un rayon de 20 : il reste **12 px de segment droit** de chaque côté, donc ce n'est pas un stade. **La plaque du geste (506 × 16) est à angles vifs** : c'est une pièce de métal encastrée, pas un objet flottant ; les deux rayons restent réservés aux deux objets qui flottent. **Filets de 1 px** : le filet vertical, en **laiton plein** (à `.55` il tombait à 2,54:1 sur cette photo et s'effaçait ; plein il rend 5,31:1) ; le séparateur du haut et la bordure du cartouche restent à `rgba(169,139,79,.55)` — l'un est court, l'autre est posé sur un aplat. **Aucune ombre portée** — la profondeur vient de la photographie, qui en a trois plans. **Aucun flou, aucun `backdrop-filter`** : le cartouche se remplit à `rgba(11,23,18,.88)`, un aplat franc, et c'est ce qui lui donne ses 13,82:1 |
| **Traitement photo** | Sur le `<img>` : **`filter: saturate(.34) contrast(1.12) brightness(.82)`**. *La luminosité était `.60` ; la passe du côte-à-côte l'a remontée à `.82` parce qu'à `.60` cet écran était le seul du lot dont on ne distinguait pas le sujet à la vignette de 421 px. Décision gardée.* Par-dessus, une nappe plate **`rgba(18,44,58,.26)`**. Mesuré au réglage en place, composite en `canvas` au recouvrement exact : la neige du sol passe de `#69b8eb` (Y = 0,433, saturation 55 %) à **`#607888`** (Y = 0,177, 29 %) — bleu > vert > rouge, donc **la neige reste bleue** ; la neige des branches tombe à `#324047` ; les troncs à `#333f45`, froids eux aussi. **Le dégradé du bas** est inchangé : `linear-gradient(180deg, rgba(9,18,15,0) 0, rgba(9,18,15,.22) 20%, rgba(9,18,15,.55) 42%, rgba(9,18,15,.82) 62%, rgba(9,18,15,.94) 84%, rgba(9,18,15,.97) 100%)`, de **y = 400 à y = 900**. **UN VOILE EN HAUT, ET IL EST NOUVEAU** : `linear-gradient(180deg, rgba(9,18,15,.82) 0, rgba(9,18,15,.48) 45%, rgba(9,18,15,0) 100%)` sur **210 px**. La version précédente n'en avait pas et elle avait raison — son tiers supérieur était un mur d'épinettes plein à Y = 0,011. La nouvelle matière est l'inverse : un lacis de branches chargées de neige, clair et haché. Sans voile, le **pire pixel** sous le téléphone rend 3,82:1, sous la mention 2,20:1, sous la nav 3,23:1 — une moyenne à 12,87 n'excuse pas une hampe posée sur une branche blanche. **IL SE RÈGLE SUR LA LUMINOSITÉ, PAS UNE FOIS POUR TOUTES** : à `.60` il valait `.62` sur 190 px ; laissé tel quel quand la photo est passée à `.82`, le pire pixel de la mention retombait à **3,13:1**. À `.82 / .48 / 0` sur 210 px on retrouve la cote exacte — **7,78 · 4,35 · 6,41** — sans rendre la luminosité gagnée : la bande 0→400 garde **L 46,2 et σ 29,4**, contre 38,7 et 22,5 quand la photographie était à `.60`. **Toute reprise de `brightness` se rejoue ici.** La photographie reste intacte de **y = 210 à y = 400** |
| **Le geste et l'instant de capture** | **« LA LAISSE »** — un seul geste, et c'est une **plaque de laiton pleine masse, 506 × 16**, qui court **de gauche à droite sous le nom**, comme la laisse de haute mer le long d'une grève. `@keyframes laisse { from{transform:scaleX(0)} to{transform:scaleX(1)} }` sur `.marque::after`, `transform-origin: 0 50%`, **`animation: laisse 1800ms linear 400ms forwards`**. La direction suit le sens de lecture, comme un titre. **POURQUOI PAS LE FILET D'1 PX DE LA VERSION PRÉCÉDENTE** : l'aperçu du panneau réduit la capture de 1440 à 421 px, soit 0,29 ; un filet d'1 px y vaut 0,29 px et le moteur l'étale en un gris que personne ne voit — le geste était mesuré, prouvé, et **invisible là où l'écran est regardé le plus souvent** (piège 57). La règle qui en sort : à 1440, un geste photographié pèse **au moins 12 px** dans sa plus petite dimension et se déplace **d'au moins 40 px**. Ici : **16 px de haut → 4,6 px réduits**, et un bord de fuite qui parcourt **506 px → 147 px réduits**. **Linéaire, et c'est délibéré** : une sortie en ease-out ferait bouger la fraction capturée de 20 points pour 40 ms d'écart, un remplissage linéaire ne la bouge que de 2,2 points. **Capture à t = 1500 ms** : (1500 − 400) / 1800 = **61,1 %**, soit **309 px de laiton relevés dans la capture**, de x = 112 à x = 420. **La course est dessinée en creux** derrière (`rgba(232,224,205,.12)`, même boîte au pixel) : sur une image ARRÊTÉE, une plaque à 61 % sans sa course se lit comme un filet court qu'on a voulu court ; avec la course, elle se lit comme un objet qui n'a pas fini. Au repos le laiton la recouvre exactement. **Preuve du geste** : cinq captures à 400 / 675 / 950 / 1225 / 1500 ms ; le bord de fuite relevé dans l'image doit avancer de **77 px** entre deux consécutives — 112 → 188 → 265 → 343 → 420, longueurs 0 / 77 / 154 / 232 / 309. Si deux images se ressemblent, l'outil ment. Sous `prefers-reduced-motion: reduce`, la plaque est pleine dès le premier rendu (mesuré : 0 animation, `matrix(1,0,0,1,0,0)`) — elle ne porte aucune information, c'est le seul objet de l'écran qu'on ait le droit d'animer |
| **Ce qu'on ne fait pas** | Pas de titre géant — plafond dur à **21 px**. Pas de partage gauche/droite, pas de colonne de magazine, pas d'aplat de couleur pleine (le cartouche fait 288 × 116, soit 2,6 % de la surface). Pas de flou, pas d'ombre, pas de rayon en stade. **Aucun prix, aucun « à partir de »**, aucune note, aucun avis, aucun témoignage, aucun logo. Pas de champ de réservation avec dates saisissables — la DA du secteur l'interdit et le cartouche dit la météo, pas la disponibilité. **Pas de parallaxe, pas de Ken Burns, pas de vidéo, pas de second geste** : quarante mouvements s'annulent, et la plaque est le seul objet animé de l'écran. Aucune requête tierce. Et jamais de laiton sur du **texte** posé à même la photographie — il tombe à **3,88:1** à hauteur du surtitre ; le laiton n'y est qu'un aplat, jamais une lettre |

### La composition, au pixel — fenêtre 1440 × 900

**La photographie retenue : `images/secteurs-sites/hotel-2.webp`, 1920 × 1080.**
Légende vraie : les pavillons de bois éclairés, montés sur pilotis dans
la forêt d'arbres nus sous la neige, à la tombée du jour ; quelques
promeneurs sur la passerelle.

> **CE PLAN A COTÉ SA COMPOSITION SUR `hotel-1`, ET C'ÉTAIT UNE
> FAUSSETÉ.** `hotel-1` est un massif européen : toiture à très forte
> pente à quinze lucarnes, **pierrier alpin** dans le coin haut-droit,
> **pins de montagne** en amorce au premier plan, mur d'épinettes
> uniforme sur un versant. L'écran s'appelle *Auberge de
> l'Anse-à-Givre* et se dit sur la **Haute-Côte-Nord**. Un Québécois
> voit le décalage en trois secondes. `STANDARD.md § 4.5` tranche :
> « Une photo ne contredit jamais le texte de la page. Si les deux se
> contredisent : on change la photo, jamais le texte. » **Un plan ne
> peut pas verrouiller une fausseté** — la cote la plus soignée du
> monde ne rend pas la photo vraie.

*Pourquoi `hotel-2` tient.* Rien dedans n'est étranger : **feuillus nus
chargés de neige**, sol enneigé profond, **pavillons de bois à pignon
sombre montés sur pilotis**, une lanterne, la brunante bleue. C'est
Charlevoix ou la Côte-Nord sans discussion. Et elle est **déjà froide à
la source** — la neige y mesure `#69b8eb` avant tout traitement — donc
le virage ne se bat pas contre l'image, il la suit.

*Pourquoi elle tient à 1440 × 900.* Même géométrie que la précédente :
le recouvrement est piloté par la hauteur, 1080 → 900 est une réduction
de 0,833, la largeur affichée devient 1600 px et **80 px sont rognés de
chaque côté**. Donc **aucun agrandissement**. Le sujet — les deux
pavillons éclairés — se retrouve entier entre **x = 250 et x = 1250**,
au tiers haut. Et **le bas de l'image est vide** : à partir de la source
y = 830, c'est la neige du sol, traversée de troncs mais sans détail
clair. Le dégradé la couvre à 63 % en haut du bloc de texte et à 95 %
au bas — mesuré sur la page rendue, la promesse rend **7,84:1** et la
marque **11,20:1**. L'objection du plan précédent (« son tiers bas est
traversé de troncs, il n'y a nulle part où poser un texte ») ne tenait
pas : les troncs y sont plus sombres que la neige, et c'est le dégradé
qui décide, pas eux.

*Ce que la seconde lecture, en pleine résolution, a corrigé.* Le plan
précédent écartait `hotel-2` sur « on y distingue des silhouettes de
personnes ». Relevé à ×3 sur le fichier source : ce sont **quatre ou
cinq promeneurs en manteau d'hiver sur une passerelle, à contre-jour,
plus une silhouette isolée en bas au centre. Aucun visage n'est
résolu — ce sont des masses noires.** `STANDARD.md § 4.2` interdit les
**visages reconnaissables**, pas les gens ; et des clients sur une
passerelle, à l'heure bleue, sont un argument pour une auberge, pas
contre. Cherché aussi, au même grossissement : aucune marque imprimée,
aucune enseigne, aucune plaque, aucun numéro civique.

*Pourquoi pas `hotel-9.webp`* (brume sur le lac gelé, 1920 × 1080) :
le feu arrière rouge à x ≈ 1370 **survit à l'examen** — mesuré, la
désaturation froide le ramène à un gris et le composite entier rend
**0 pixel** où le rouge domine. Ce n'est donc pas lui qui la disqualifie.
Ce qui la disqualifie est ailleurs, et c'est mesuré : **son tiers
supérieur est de la brume claire**, et le fond sous la ligne du haut y
rend **3,26:1 pour le téléphone et 2,22:1 pour la mention de
démonstration** — la voie n'a pas de voile assez fort pour rattraper ça
sans noyer l'image entière. Et à l'œil : pas de sujet, pas de neige au
sol, une allée d'arbres plantés en rang, une voiture stationnée, une
personne, des abris de pique-nique — un parc, pas la Côte-Nord.

*Pourquoi pas `hotel-3.webp`* (pignon vitré sous la neige, 1280 × 720) :
le recouvrement 16/9 → 16/10 est piloté par la hauteur, donc
l'agrandissement n'est pas de 1,125 mais de **1,25** — 25 % d'étirement
sur toute la surface. Et la matière est mauvaise : le bardage est
**teint rouge-orange vif**, les troncs derrière sont des pins sylvestres
à écorce cuivrée (Europe du Nord), le haut de l'image est de la neige
claire (téléphone à 4,51:1, mention à 3,49:1), et c'est un **détail de
bâtiment, pas un paysage** — la voie verrouille « photographie de
paysage plein cadre ».

*Pourquoi aucune des treize autres.* `hotel-4 · 5 · 6 · 8 · 13 · 14 ·
15 · 17` sont des intérieurs ou des détails. `hotel-7` est une grange
alpine en 960 × 720. `hotel-10 · 11 · 12 · 16` sont debout en
1000 × 1400 : le recouvrement y demande **1,44 d'agrandissement**, et
par-dessus, `hotel-10` est une pinède de pins sylvestres, `hotel-11`
un versant de montagne à pins mugo, `hotel-16` une hêtraie européenne
à feuilles marcescentes. Trois candidates sur dix-sept étaient
recevables ; une seule tient.

Toutes les cotes ci-dessous sont **relevées dans la page rendue**
(`getBoundingClientRect` après `document.fonts.ready`), et tous les
contrastes sont des **composites réels** : l'encre est retirée du
document, la page est photographiée, et le fond est moyenné sur le
rectangle exact que le texte occupait.

| # | Objet | x | y | largeur × hauteur | Détail |
|---|---|---|---|---|---|
| 1 | Photographie `hotel-2.webp` | −80 | 0 | 1600 × 900 | `object-fit: cover`, `object-position: 50% 50%`, `width="1920" height="1080"` dans le balisage (CLS 0), `fetchpriority="high"`, `decoding="sync"`, **jamais `lazy`** |
| 2 | Nappe froide `rgba(18,44,58,.26)` | 0 | 0 | 1440 × 900 | plate, sans mélange de fusion |
| 3 | **Voile du haut** | 0 | 0 | 1440 × 210 | trois arrêts, `.82 → .48 → 0`. Nouveau — voir la DA, et il se rejoue si `brightness` bouge |
| 4 | Dégradé du bas | 0 | 400 | 1440 × 500 | six arrêts, voir la DA |
| 5 | Téléphone `000 000-0000` | 72 | 48 | 100 × 14 | mono 11 px / 0,16 em, os 100 % — fond `#0f191a`, **13,60:1** (pire pixel 7,78) |
| 6 | Filet séparateur vertical | 186 | 51 | 1 × 10 | laiton `rgba(169,139,79,.55)` |
| 7 | `SITE DE DÉMONSTRATION` | 201 | 48 | 172 × 13 | mono 10 px / 0,22 em, **os à 72 %** — fond `#172222`, **7,05:1** (pire pixel 4,35). *62 % rendait 5,84:1 sur le mur d'épinettes de la version précédente ; sur ce lacis de branches il tombe à 3,58:1 au pire pixel même sous le voile. 72 % reste discret* |
| 8 | Nav, 4 items, écart 36 px | 783 | 48 | 585 × 17 | cormorant 600, 14 px / 0,26 em, os 100 % — fond `#1b2728`, **11,68:1** (pire pixel 6,41). Largeurs mesurées : 103 / 144 / 91 / 142. Le dernier item porte `margin-right:-0.26em` pour que l'encre s'aligne sur 1368, pas la chasse morte |
| 9 | Filet de laiton vertical | 72 | 436 | 1 × 412 | **laiton plein `#a98b4f`**, statique. **5,31:1** contre son fond `#131d1e`. *Il portait le geste ; il ne le porte plus* |
| 10 | Surtitre `HAUTE-CÔTE-NORD, QUÉBEC` | 112 | 610 | 207 × 14 | mono 11 px / 0,22 em, **os à 76 %** — fond `#222e31`, **6,79:1** (pire pixel 4,51). *En os, pas en laiton : le laiton tombe à 3,88:1 ici* |
| 11 | **La marque** | 112 | 643 | **516 × 25** d'encre | cormorant 600, **21 px**, interlignage 1,0, **chasse 0,44 em**, os 100 % — fond `#1f2a2c`, **11,20:1**. Boîte 112 / 645 / 515,7 × 51 : 21 px de texte, puis 30 px de `padding-bottom` qui réservent la plaque |
| 12 | **La plaque — LE GESTE** | 112 | 680 | **506,5 × 16** | angles vifs, laiton plein `#a98b4f`, **4,98:1** contre son fond `#182324` (seuil des non-textes : 3:1). Largeur = `calc(100% − var(--chasse))` sur `.marque` : **l'encre du nom au pixel, sans nombre magique**, et elle se recote seule quand la chasse change sous 1080 px. Course en creux derrière, `rgba(232,224,205,.12)`, même boîte. À t = 1500 ms : **309 px de laiton, x 112 → 420** |
| 13 | Promesse, ligne 1 | 112 | 714 | 350 × 24 | spectral italique 16 px, os à 76 % — fond `#15201f`, **7,84:1** (pire pixel 7,40) |
| 14 | Promesse, ligne 2 | 112 | 742 | 311 × 24 | idem |
| 15 | Bouton `LES DATES LIBRES` | 112 | 796 | **236 × 52** | **rayon 20 px**, aplat laiton `#a98b4f`, texte sapin `#0b1712` cormorant 600 13 px / 0,28 em (encre 166 px relevée à x 147, marge intérieure 35 px). **5,67:1** |
| 16 | Cartouche « conditions » | 1080 | 732 | **288 × 116** | **rayon 24 px**, remplissage `rgba(11,23,18,.88)` sur un fond nu `#121c1b` — composite mesuré **`#0c1813`** — bordure 1 px `rgba(169,139,79,.55)`, marge intérieure **26 px sur les côtés, 22 px en haut, 23 px en bas**. os dessus : **13,82:1** |
| 16a | ↳ `CE MATIN À L'ANSE` | 1106 | 754 | 139 × 13 | mono 10 px / 0,22 em, **laiton `#a98b4f` — 5,62:1**, seul endroit où le laiton porte du texte : il est sur un aplat |
| 16b | ↳ `−21 °C · ANSE PRISE` | 1106 | 779 | 208 × 21 | cormorant 600 17 px / 0,20 em, os 100 % |
| 16c | ↳ `LEVER 7 H 12 — COUCHER 16 H 04` | 1106 | 812 | 222 × 13 | mono 10 px / 0,14 em, **os à 58 %** — 5,34:1 |

**Le laiton saturé occupe désormais 20 796 px sur 1 296 000, soit
1,60 %** : le bouton 12 272, la plaque 8 104, le filet 412. C'était
0,95 % quand le geste ne pesait qu'un pixel de large. C'est le prix de
la règle du piège 57, et il se paie une fois.

**Les marges, et elles sont volontairement inégales :** 72 px à gauche
et à droite, 48 px en haut, 52 px en bas. Le texte est renfoncé à
x = 112 — 40 px de plus que le filet — pour que le filet lise comme un
objet posé dans la marge et non comme un soulignement.

**Le bloc de gauche a grandi de 28 px** (610 → 848 au lieu de
638 → 848) : la plaque prend 16 px, son air 14, et la promesse rend
2 px de marge haute. Il est ancré par le BAS, donc c'est le surtitre
qui monte ; à y = 610 le dégradé vaut encore 0,55 d'opacité et le
surtitre y mesure 6,79:1.

**Le rectangle x 0→1440 · y 210→400 est de la photographie pure** —
190 px, 21 % de l'écran. C'était 400 px et 44 % ; le voile du haut a
pris les 210 premiers. Rien n'y est POSÉ dans les deux cas : ce qui a
changé, c'est qu'une matière claire demande un voile là où une matière
noire n'en demandait aucun.

### Ce qui a été mesuré, et comment le refaire

Le choix de la photographie s'est fait en `canvas` : chaque candidate
chargée à 1440 × 900 avec le recouvrement exact, le filtre appliqué par
`ctx.filter`, la nappe et le dégradé peints par-dessus, puis moyenne ET
**pire pixel** relevés sur le rectangle exact de chaque bloc. C'est ce
qui a disqualifié `hotel-9` (2,22:1 sous la mention) et `hotel-3`
(3,49:1), et c'est ce qui a innocenté le feu arrière rouge de `hotel-9`
(0 pixel chaud après désaturation).

Les cotes finales, elles, sont relevées **dans la page rendue**, pas
dans une reconstruction : l'encre est retirée du document
(`visibility:hidden`), la page est photographiée, et le fond est moyenné
sur le rectangle exact que le texte occupait — puis l'encre est
recomposée à son alpha réel. Les largeurs viennent de
`document.fonts.ready` puis `getBoundingClientRect`, jamais d'une chasse
moyenne. La longueur du laiton à chaque instant est **relevée dans
l'image** par balayage d'une ligne, jamais lue dans le CSS.

**Quatre écueils payés en route, et ils sont dans le tableau.**
1. Le surtitre en laiton — 3,88:1, refusé.
2. Un **commentaire CSS mal fermé** a avalé en silence la règle qui le
   suivait : la plaque héritait alors de la colonne entière, 1 286 px
   au lieu de 506, et rien ne le disait. Un commentaire ne se referme
   pas deux fois ; on relit le sélecteur retenu par le moteur, pas
   celui qu'on croit avoir écrit.
3. Le premier compte de pixels chauds a rendu **2 798**, tous posés sur
   les lignes de texte : Chromium sous Windows rend le texte en
   anticrénelage de **sous-pixels** et `-webkit-font-smoothing:
   antialiased` n'y change rien. Une frange rouge de sous-pixel
   satisfait « r > g et r > b » sans qu'aucune couleur chaude soit dans
   la page. On ne compte que les couches d'image, tout le reste retiré
   du document. *(Piège 8, encore lui.)*
4. `hotel-3` demandait « un agrandissement de 1,125 » — faux : sur une
   source 16/9 dans une fenêtre 16/10, **c'est la hauteur qui pilote**,
   donc 1,25. Un rapport d'agrandissement se calcule sur la dimension
   qui recouvre, pas sur la largeur.

À vérifier après toute reprise, dans cet ordre : `node
tools/demos-controle.mjs --port 8099 hotel` → **ok** · contraste réel
sur la page rendue aux 16 blocs · aucun débordement de 320 à 1920 px et
`scrollHeight` = 900 · zéro erreur console · zéro requête tierce · la
planche des cinq instants du geste (**77 px d'écart** entre deux
images, relevés dans l'image) · **la vignette réduite à 421 px, où le
geste doit encore se voir** · et **l'écran ouvert et regardé**, pas
seulement sondé.

---

## Le contenu exact

**Nom fictif :** Auberge de l'Anse-à-Givre
*(toponyme inventé sur le patron québécois — Anse-à-Beaufils,
Anse-au-Griffon. « Givre » n'existe pas comme anse au Québec.)*

**`<title>`**
```
Auberge de l'Anse-à-Givre — Haute-Côte-Nord
```

**`<meta name="description">`**
```
Auberge devant une anse gelée de la Haute-Côte-Nord. Site de démonstration.
```

**`<meta name="robots">`** → `noindex,nofollow`
**`<meta name="theme-color">`** → `#0b1712`

**Haut à gauche** *(mono 11 px, puis filet, puis mono 10 px à 62 %)*
```
000 000-0000
SITE DE DÉMONSTRATION
```

**Nav, haut à droite** *(cormorant 600 caps, 14 px, chasse 0,26 em ;
écart de 36 px ; `NOUS JOINDRE` est un `mailto:courriel@exemple.ca`, les
trois autres pointent `#`)*
```
L'AUBERGE
LES CHAMBRES
LA TABLE
NOUS JOINDRE
```

**Surtitre** *(mono 11 px, chasse 0,22 em, os 76 %)*
```
HAUTE-CÔTE-NORD, QUÉBEC
```

**Le titre du héros, mot pour mot** *(cormorant 600, 21 px, chasse
0,44 em, capitales — apostrophe typographique U+2019)*
```
AUBERGE DE L'ANSE-À-GIVRE
```

**Le sous-titre, deux lignes** *(spectral 400 italique, 16 px,
interlignage 1,55, os 76 %)*
```
Vingt-deux chambres devant l'anse qui prend en glace.
Une seule tablée le soir, à dix-huit heures trente.
```
*Vingt-deux, et pas sept : la photographie montre trois pavillons
éclairés et une passerelle qui continue hors champ à droite. Vingt-deux
chambres ne contredit rien de ce qu'on voit. **La justification
précédente — « la toiture porte une quinzaine de lucarnes » — est morte
avec `hotel-1`** : cette toiture n'est plus dans l'écran, et un
argument qui s'appuie sur une image retirée ne compte plus. Le chiffre
reste parce qu'il ne contredit pas la nouvelle image, pas parce que
l'ancienne le prouvait.*

**Le libellé du bouton** *(cormorant 600, 13 px, chasse 0,28 em)*
```
LES DATES LIBRES
```
*Ni « Réserver », ni « À partir de ». On promet une liste de dates —
c'est tenable, et ça ne parle pas d'argent.*

**Le cartouche, trois lignes**
```
CE MATIN À L'ANSE
−21 °C · ANSE PRISE
LEVER 7 H 12 — COUCHER 16 H 04
```
*« Anse prise » : l'anse a gelé d'un bord à l'autre. **La photographie
ne la montre pas** — elle montre les pavillons dans le bois, l'anse est
derrière l'objectif. Ce n'est pas une contradiction (rien à l'écran ne
dit que l'anse est libre), c'est une absence, et elle est écrite dans
les réserves. Le signe moins est U+2212, pas un trait d'union.*

**Texte de remplacement de la photographie** *(il décrit ce que l'image
montre vraiment, promeneurs compris — `STANDARD.md § 4.4`)*
```
Les pavillons de bois de l'auberge, éclairés et montés sur pilotis
dans la forêt d'arbres nus sous la neige, à la tombée du jour ;
quelques promeneurs sur la passerelle.
```

**Les coordonnées, et il n'y en a pas d'autres.** Téléphone
`000 000-0000`, visible en haut à gauche. Courriel
`courriel@exemple.ca`, derrière `NOUS JOINDRE`. Adresse : « Adresse sur
demande » — elle n'apparaît **nulle part** sur cet écran, et si une
construction en réclame une, c'est cette chaîne-là et aucune autre.

---

## Ce qui me distingue des onze autres

**Composition.** Je suis le seul écran où la photographie occupe 100 %
de la surface et où **le plus gros caractère mesure 21 px** — de
y = 62 (sous la barre du haut) à y = 610 (le surtitre), **61 % de la
hauteur ne porte rien**.
Le Gym est un mur de lettres de 180 px sans image ; la Coiffure est en
colonnes de magazine ; l'Immobilier présente une propriété comme un lot
de catalogue. Chez moi le texte n'est pas le sujet, il est la plaque
vissée à côté du sujet.

**Couleur.** Je suis le seul écran **sans aucun fond** : il n'y a pas
d'aplat de page, il y a une photographie virée au froid dont la neige
mesure `#475b67`, un bleu-gris — pas du blanc. Le laiton `#a98b4f` est
la seule couleur saturée et il occupe **1,60 %** des pixels. Les deux
autres sombres froids du lot s'en écartent par la matière : l'Immobilier
est nuit + or sur de la photographie de propriété, la Construction est
bleu de plan + cyan sur du quadrillage.

**Typographie.** `cormorant` 600 n'apparaît nulle part ailleurs, et
ici il ne s'écrit **jamais** autrement qu'en capitales espacées de 0,20
à 0,44 em, jamais en bas de casse, jamais sous 13 px ni au-dessus de
21 px. La seule minuscule de l'écran est une italique `spectral` de
16 px sur deux lignes. Le saut entre l'affichage et le texte courant
vaut ici **1,3** (21 px contre 16 px) ; le standard des sites de secteur
demande 90 à 160 px d'affichage contre 14 à 16 px de texte, soit un
saut de **6 à 11**. C'est le même métier, la même grammaire, et le
rapport inverse.

---

## Ce qui reste ouvert

1. **L'anse n'est jamais montrée.** Le nom, le surtitre, la promesse et
   le cartouche parlent tous d'une anse qui prend en glace ; la
   photographie montre le bois. Aucun des dix-sept tirages du lot ne
   réunit *une étendue gelée* et *une matière québécoise crédible* :
   `hotel-9` a l'étendue et pas la matière, `hotel-2` a la matière et
   pas l'étendue. Rien à l'écran ne contredit le texte — c'est une
   absence, pas une fausseté — mais l'écran serait plus fort avec une
   dix-huitième photo : une anse gelée bordée d'épinettes, avec un
   bâtiment de bois à toit de bardeau. **Tant qu'elle n'existe pas,
   cette ligne reste.**
2. **Des gens sont dans l'image.** Quatre ou cinq promeneurs à
   contre-jour, aucun visage résolu au grossissement ×3 sur le fichier
   source. C'est conforme à `STANDARD.md § 4.2`, qui vise les visages
   reconnaissables. Aucun des onze autres écrans du lot ne montre de
   personne : celui-ci est le seul, et c'est un écart assumé, pas un
   oubli.
3. **Le pire pixel sous la mention de démonstration rend 4,20:1** —
   sous 4,5. C'est un pixel unique de branche enneigée sous une hampe
   de 1 px ; la moyenne du bloc rend 7,05:1. Monter la mention plus
   haut que 72 % la ferait crier. Épaissir le voile du haut coûterait
   à la photographie ce qu'il rapporterait à un pixel.
4. **Rien de tout cela n'a été vu sur un appareil réel.** Chromium sous
   Playwright, machine de bureau Windows. La réduction à 421 px est
   simulée par deux `drawImage` en demi-pas, pas par le panneau lui-même.
