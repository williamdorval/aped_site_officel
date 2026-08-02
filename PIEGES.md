# PIÈGES D'INSTRUMENT

**Quand lire ce fichier :** avant d'écrire un outil de mesure, et
chaque fois qu'une mesure rend un verdict surprenant. Chacun des
pièges ci-dessous a produit un **faux verdict** avant d'être trouvé —
un « échec » sur du code sain, ou un « tout va bien » sur un défaut.

La liste courte vit dans `CLAUDE.md`. Celle-ci donne la cause et le
correctif.


<!-- INDEX:DEBUT -->

> **NE LIS PAS CE FICHIER EN ENTIER.** Cette table donne le titre exact
> de chaque partie et ce qu'elle coûte. Va chercher la seule qui répond :
> `grep -n "^### <titre>" <fichier>` puis lis la plage. Le titre est la clé —
> il ne périme pas, un numéro de ligne oui.

| Partie | Lignes | Jetons ~ |
|---|---:|---:|
| **Table** | 11 | 100 |
| **MESURE ET CAPTURE** | 3 | 10 |
| &nbsp;&nbsp;↳ 1 · Une capture d'écran est plus lente qu'une transition | 5 | 54 |
| &nbsp;&nbsp;↳ 2 · Un cadrage de capture se RELÈVE, il ne se devine pas | 6 | 71 |
| &nbsp;&nbsp;↳ 3 · Deux images de tailles différentes rendent 100 % d'écart | 4 | 42 |
| &nbsp;&nbsp;↳ 4 · content-visibility: auto fait mentir getBoundingClientRect() | 6 | 81 |
| &nbsp;&nbsp;↳ 5 · Un scrollTo qui saute casse un pin de ScrollTrigger | 4 | 31 |
| &nbsp;&nbsp;↳ 6 · color-mix() calcule en color(srgb 0.67 …), pas en rgb() | 5 | 59 |
| &nbsp;&nbsp;↳ 7 · Une fenêtre d'odomètre rogne exprès | 5 | 37 |
| &nbsp;&nbsp;↳ 8 · Une analyse de pixels confond l'anticrénelage | 4 | 33 |
| &nbsp;&nbsp;↳ 9 · Un détecteur qui n'attend pas assez confond « animation en vol » et « texte échoué » | 5 | 68 |
| &nbsp;&nbsp;↳ 10 · Un détecteur de piège de tabulation doit identifier les éléments par leur identité | 4 | 38 |
| &nbsp;&nbsp;↳ 11 · Une page d'impression peut écraser son corps sans grandir | 4 | 36 |
| &nbsp;&nbsp;↳ 12 · Un ScrollTrigger en once se TUE après avoir joué | 4 | 41 |
| &nbsp;&nbsp;↳ 13 · Une sonde posée au document_start n'a pas encore document.documentElement | 5 | 63 |
| &nbsp;&nbsp;↳ 14 · Une sonde peut être plus RAPIDE que la page | 5 | 53 |
| &nbsp;&nbsp;↳ 15 · Un détecteur de débordement doit distinguer ce qui rogne exprès | 4 | 22 |
| **CSS ET JS** | 3 | 8 |
| &nbsp;&nbsp;↳ 16 · animation est un RACCOURCI : il remet animation-play-state à running | 7 | 95 |
| &nbsp;&nbsp;↳ 17 · Un test peut VERROUILLER le défaut | 9 | 118 |
| &nbsp;&nbsp;↳ 18 · Le popup cadeau bloque les outils | 7 | 81 |
| &nbsp;&nbsp;↳ 19 · Un A/B se fait en worktree, pas en stash | 23 | 274 |
| **LES CINQ FAUX VERDICTS DE LA NUIT DU 2026-07-30** | 3 | 19 |
| &nbsp;&nbsp;↳ 20 · getComputedStyle(el).transform ne contient pas les propriétés individuelles | 7 | 103 |
| &nbsp;&nbsp;↳ 21 · Une amplitude ABSOLUE mélange trois mouvements | 8 | 104 |
| &nbsp;&nbsp;↳ 22 · Le rectangle englobant d'un élément TOURNÉ est plus grand que l'élément | 9 | 133 |
| &nbsp;&nbsp;↳ 23 · Un nombre FIXE de tabulations ne mesure pas un piège de focus | 9 | 136 |
| &nbsp;&nbsp;↳ 24 · Une fenêtre d'observation trop courte cache le mouvement le plus lent | 8 | 91 |
| **LES QUATRE DE LA SECONDE PASSE DU 2026-07-30** | 3 | 18 |
| &nbsp;&nbsp;↳ 25 · UNE SONDE QUI INTERROGE LE DOM NE PEUT PAS VOIR UN DÉFAUT DE PEINTURE | 18 | 259 |
| &nbsp;&nbsp;↳ 26 · UNE GRILLE TRANSFORME CHAQUE NŒUD DE TEXTE EN ÉLÉMENT DE GRILLE ANONYME | 8 | 123 |
| &nbsp;&nbsp;↳ 27 · DEUX MÉCANISMES QUI VEULENT LE MÊME PSEUDO-ÉLÉMENT : LE PLUS SPÉCIFIQUE TUE L'AUTRE, EN SILENCE | 7 | 111 |
| &nbsp;&nbsp;↳ 28 · UN BRIDAGE TROP FORT REND LE DÉCLENCHEUR DU PALIER 2 INATTEIGNABLE, ET L'OUTIL APPELLE ÇA UN ÉCHEC | 19 | 253 |
| **AJOUTÉ LE 2026-07-30, CHANTIER DE STRUCTURE** | 3 | 18 |
| &nbsp;&nbsp;↳ 29 · UNE PLANCHE DE CAPTURES D'UNE PAGE QUI BOUGE N'EST PAS UNE PREUVE DE NON-RÉGRESSION | 49 | 659 |
| &nbsp;&nbsp;↳ 30 · UN SEUIL QUI VAUT NaN REND « AUCUNE DIFFÉRENCE » SUR N'IMPORTE QUOI | 29 | 294 |
| &nbsp;&nbsp;↳ 31 · UN lastIndexOf SUR UNE BALISE FERMANTE COMMUNE COUPE TOUT LE DOCUMENT | 47 | 513 |
| &nbsp;&nbsp;↳ 32 · UNE MARGE auto PEUT SE LIRE AUTREMENT ET SE POSER AU MÊME PIXEL | 32 | 425 |
| **AJOUTÉS LE 2026-07-31, CHANTIER DES SAS** | 2 | 12 |
| &nbsp;&nbsp;↳ 33 · GSAP additionne yPercent à un transform CSS de repos | 16 | 233 |
| &nbsp;&nbsp;↳ 34 · La hauteur réelle d'une section content-visibility se mesure À L'ÉCRAN | 17 | 206 |
| **AJOUTÉS LE 2026-07-31, CHANTIER DE MISE EN PRODUCTION** | 2 | 16 |
| &nbsp;&nbsp;↳ 35 · Une scène collante n'est épinglée qu'à partir de 100vh de course | 16 | 232 |
| &nbsp;&nbsp;↳ 36 · Un test qui synthétise l'événement ne teste pas le geste | 14 | 195 |
| &nbsp;&nbsp;↳ 37 · Une image est glissable par défaut, et ça annule le geste | 12 | 146 |
| &nbsp;&nbsp;↳ 38 · Une sonde de port en IPv4 ment sur un serveur qui écoute en IPv6 | 13 | 156 |
| &nbsp;&nbsp;↳ 39 · decode() ne rejette jamais sur une image jamais demandée | 11 | 135 |
| &nbsp;&nbsp;↳ 40 · Un sélecteur de masquage trop large peut effacer la page entière | 14 | 205 |
| &nbsp;&nbsp;↳ 41 · Un calendrier qui ouvre sur le mois courant peut n'avoir aucune date | 14 | 195 |
| &nbsp;&nbsp;↳ 42 · Une dégradation par palier ne s'hérite pas toute seule | 11 | 147 |
| &nbsp;&nbsp;↳ 43 · Un cadre qui défile peut n'avoir rien à faire défiler | 18 | 228 |
| &nbsp;&nbsp;↳ 44 · fullPage ne photographie pas une scène épinglée | 20 | 284 |
| &nbsp;&nbsp;↳ 45 · Un fond en dégradé n'est pas un fond absent | 18 | 225 |
| &nbsp;&nbsp;↳ 46 · Un contournement survit toujours au correctif | 17 | 230 |
| &nbsp;&nbsp;↳ 47 · Rendre un conteneur défilant peut tuer un glissement qui marchait | 21 | 297 |
| &nbsp;&nbsp;↳ 48 · L'injection tactile ne se remet pas entre deux gestes | 20 | 266 |
| &nbsp;&nbsp;↳ 49 · Un élément fixe au sommet et un élément épinglé plus bas ne sont pas la même chose | 17 | 237 |
| &nbsp;&nbsp;↳ 50 · Deux pages de hauteurs différentes ne peuvent pas partager une course en pixels | 12 | 171 |
| &nbsp;&nbsp;↳ 51 · :focus-visible ne s'arme pas sur un focus() de script | 9 | 110 |
| &nbsp;&nbsp;↳ 52 · Une image déclarée n'est pas une image chargée | 25 | 301 |
| &nbsp;&nbsp;↳ 53 · Une hauteur lue sur la première tuile d'une pile | 16 | 207 |
| &nbsp;&nbsp;↳ 54 · Dix images ne font pas un mouvement | 19 | 266 |
| &nbsp;&nbsp;↳ 55 · Un fichier de sortie abandonné ne disparaît pas tout seul | 11 | 140 |
| &nbsp;&nbsp;↳ 56 · requestAnimationFrame sur un écouteur de défilement met le contenu en retard d'une image | 27 | 324 |
| &nbsp;&nbsp;↳ 57 · Une planche-contact ne répond pas à « une marque est-elle lisible ? » | 24 | 304 |
| &nbsp;&nbsp;↳ 58 · Une fenêtre de recadrage porte sur la LARGEUR — sur une source en portrait, elle photographie le ciel | 16 | 217 |
| &nbsp;&nbsp;↳ 59 · position: sticky n'est pas position: fixed, et une sonde qui ne lit que fixed la laisse passer | 22 | 312 |
| &nbsp;&nbsp;↳ 60 · Un object-position, un voile ou une bande étroite ne recadrent PAS le fichier | 20 | 248 |
| &nbsp;&nbsp;↳ 61 · Chaque métier porte sa marque autrement, et la chercher au même endroit ne suffit pas | 23 | 306 |
| &nbsp;&nbsp;↳ 62 · Un outil qui écrit un registre l'écrase sur une passe partielle | 15 | 189 |
| &nbsp;&nbsp;↳ 63 · Le pli n'est pas une mesure de page, et une capture pleine page ne le montre pas | 23 | 299 |
| &nbsp;&nbsp;↳ 64 · animation-fill-mode: both rend la moitié du site VIDE en capture pleine page | 26 | 360 |
| &nbsp;&nbsp;↳ 65 · view() mesure la boîte de l'élément QU'ELLE ANIME, pas celle qu'on regarde | 22 | 289 |
| &nbsp;&nbsp;↳ 66 · overflow-x: clip cache un vrai défaut à une sonde scrollWidth | 14 | 185 |
| **AJOUTÉS LE 2026-08-01, CHANTIER DU PREMIER ÉCRAN** | 2 | 14 |
| &nbsp;&nbsp;↳ 67 · Une seule bande plate n'est pas une capture plate | 28 | 378 |
| &nbsp;&nbsp;↳ 68 · Geler les animations gèle aussi le préchargeur | 25 | 329 |
| &nbsp;&nbsp;↳ 69 · Un dépôt voisin peut être en chantier pendant qu'on le photographie | 14 | 182 |
| &nbsp;&nbsp;↳ 70 · Un masque figé à mi-course sur du TEXTE ne se lit pas comme un mouvement | 27 | 372 |
| &nbsp;&nbsp;↳ 71 · Un geste d'un pixel n'existe plus à l'échelle où on le regarde | 20 | 274 |
| &nbsp;&nbsp;↳ 72 · Un masque posé avant l'hydratation est effacé par l'hydratation | 25 | 338 |
| &nbsp;&nbsp;↳ 72 bis · Un vérificateur qui attrape son propre remplacement ne vérifie rien | 12 | 159 |
| &nbsp;&nbsp;↳ 73 · Un outil de contraste écrit à la hâte ment QUATRE fois de suite | 27 | 516 |
| &nbsp;&nbsp;↳ 74 · (73 bis) ET LE SIGNALEMENT DE DÉPART ÉTAIT FAUX AUSSI | 26 | 340 |
| &nbsp;&nbsp;↳ 75 · Une clôture de commentaire CSS cassée avale la règle suivante — et l'outil de contrôle rend « ok » | 16 | 226 |
| &nbsp;&nbsp;↳ 76 · Un outil de contraste qui ne remonte que les ANCÊTRES ne voit pas une masse posée en FRÈRE | 20 | 272 |
| &nbsp;&nbsp;↳ 77 · order réordonne aussi l'ORDRE DE PEINTURE — et rien ne peut le voir sauf l'image | 30 | 344 |
| &nbsp;&nbsp;↳ 78 · Une capture d'élément ne compose pas une toile WebGL | 15 | 157 |
| &nbsp;&nbsp;↳ 79 · Le clip d'une capture de page ne se lit pas dans le repère de boundingBox() | 12 | 139 |
| &nbsp;&nbsp;↳ 80 · Un scrollTo vers une section n'y arrive pas quand des sas grandissent la page | 22 | 289 |
| &nbsp;&nbsp;↳ 81 · Sous mouvement plein, une section derrière un sas se photographie en noir | 41 | 542 |
| &nbsp;&nbsp;↳ 82 · Un sélecteur d'enfant sans chevron mange le parent qu'il ne cible pas | 16 | 189 |
| &nbsp;&nbsp;↳ 83 · Un voile en pointer-events: none est INVISIBLE à elementFromPoint | 24 | 319 |
| &nbsp;&nbsp;↳ 84 · Une planche en mouvement réduit ne peut PAS voir un défaut de sas | 23 | 303 |
| &nbsp;&nbsp;↳ 85 · String.prototype.replace lit $$ comme un $ littéral | 18 | 232 |
| &nbsp;&nbsp;↳ 86 · . ne matche pas \r en JavaScript, et un fichier CRLF fait échouer /^…$/ en silence | 41 | 631 |

<!-- INDEX:FIN -->

## Table

> Elle etait ecrite a la main, et elle s'etait arretee a 32 sur 86 :
> les cinquante-quatre pieges suivants n'y figuraient pas. Un index
> partiel est pire qu'aucun — il fait croire qu'on a cherche.
> L'index genere en tete du fichier les porte tous, et il ne peut
> plus deriver : `node tools/index-doc.mjs verifier`.
> Retiree le 2026-08-03.

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

---

### 57 · Une planche-contact ne répond pas à « une marque est-elle lisible ? »

Douze photos ont été choisies pour un site de démonstration sur le
**nom** du panorama et sur une planche-contact de vignettes. Trois
portaient un mot imprimé — deux fois « Onduline » sur une sous-toiture,
« Ricoré » et « NAN » sur des boîtes de lait en poudre. Rien de tout ça
n'est visible à la taille d'une vignette.

Pire : un rapport a défendu une des trois en disant que le cadrage
`object-position: 50% 48%` de la **page** la sauvait. Un
`object-position` déplace la fenêtre de la mise en page ; il ne touche
pas au contenu du fichier. La marque était toujours dans l'image, et
elle réapparaît au premier changement de gabarit.

**Correctif :** quand ce qu'on cherche est un **mot**, ouvrir chaque
fichier à sa taille réelle, et agrandir la zone douteuse. Un
agrandissement au plus proche voisin d'une région de 200 × 120 px suffit
à trancher en une seconde.

**Ce qui ne compte pas comme vérification :** une planche-contact, une
capture de la page, un `object-position`, la petitesse du rendu final.

---

### 58 · Une fenêtre de recadrage porte sur la LARGEUR — sur une source en portrait, elle photographie le ciel

`fen: { x, y, w }` donne la largeur en fraction de la source ; la
hauteur en découle du format demandé. Sur une source **portrait**, la
hauteur calculée est bien plus courte que l'image, et le cadre se pose
**en haut**. Deux tirages de terrasse ont ainsi rendu la cime des arbres
et une porte vitrée — jamais la terrasse, qui est au bas de la photo.

**Correctif :** relever l'orientation de la source avant de choisir la
fenêtre. En pratique : télécharger la source en 900 px, la REGARDER,
puis écrire `fen`. Une source paysage se recadre par la largeur, une
source portrait par la hauteur — et si l'outil ne sait faire que la
largeur, il faut une autre source.

---

### 59 · `position: sticky` n'est pas `position: fixed`, et une sonde qui ne lit que `fixed` la laisse passer

Une couseuse de captures masquait « les éléments fixes » à partir de la
deuxième tuile pour que la barre du site ne se répète pas. Elle testait
`getComputedStyle(el).position === "fixed"`. La barre d'un des sites est
**collante**, pas fixe : elle est passée au travers et s'est imprimée
**en plein milieu** de la capture, par-dessus la galerie.

**Ce qui ne marche pas non plus :** comparer la position de l'élément à
`y = 0` puis à `y = 1200`. Une barre collante posée **sous** un bandeau
d'annonce est à 44 px de haut à l'arrêt et à 0 une fois collée : 44 px
d'écart, donc « elle bouge », donc pas masquée.

**Correctif :** ne pas demander à l'élément ce qu'il **déclare**,
mesurer ce qu'il **fait** — relever sa position dans la fenêtre à
**trois** défilements, tous pris **après** le point de colle. Ce qui n'a
pas bougé d'un pixel est de la chrome, quel que soit le mot dans le CSS.
Trois relevés et pas deux : deux suffiraient à faire passer pour de la
chrome une scène épinglée qui couvre les deux.

---

### 60 · Un `object-position`, un voile ou une bande étroite ne recadrent PAS le fichier

Cinq fois sur douze secteurs, une marque réelle a été « réglée » en
déplaçant la fenêtre de la mise en page : un `object-position` qui la
pousse hors champ, un voile à 88 % qui la noie, une bande de 250 px qui
n'en montre qu'un tiers. Dans les cinq cas **le mot est resté dans le
fichier**, et il revient au premier changement de gabarit, au premier
recadrage, à la première ouverture du `.webp` seul.

Ce qui a été attrapé comme ça : une enseigne de salon, un mot peint sur
un mur de gym, un numéro civique qui contredisait l'adresse de la
fiche, une collection éditoriale sur des dos de reliures, un nom de
fabricant sur deux boîtes à lumière.

**Correctif :** la fenêtre de TIRAGE, dans `secteurs-sites-photos.mjs`.
On regénère l'image. Un réglage de page ne corrige jamais un défaut de
fichier.

---

### 61 · Chaque métier porte sa marque autrement, et la chercher au même endroit ne suffit pas

Sur douze secteurs, la marque n'était jamais au même endroit :

| Métier | Où était la marque |
|---|---|
| Construction | **imprimée** sur le matériau — panneaux de revêtement, sous-toiture |
| Gym | **moulée dans la fonte**, au centre du disque : elle ne se recadre pas |
| Photographe | **gravée sur le prisme** du boîtier — 23 candidats, 23 marques — et **légendée sur la bordure** de chaque négatif |
| Coiffure | **partout**, parce qu'un salon EST un mur de produits |
| Juridique | **dorée sur le dos** des seules reliures nettes de la banque |

Et deux secteurs n'ont pas de problème de marque du tout, mais un autre
piège : en **hôtellerie** c'est le **climat** — une chambre
méditerranéenne sous « auberge de Charlevoix » ment sur ce que le
client trouvera ; en **clinique** c'est le **visage**, parce qu'un
visage dans une salle d'attente est une donnée de santé.

**Correctif :** avant de sourcer un secteur, se demander *où* ce
métier-là porte son nom. La réponse change à chaque fois.

---

### 62 · Un outil qui écrit un registre l'écrase sur une passe partielle

`secteurs-sites-photos.mjs` réécrivait `_licences.json` avec les seuls
secteurs demandés en argument. Douze secteurs sourcés un par un, et à
la fin le fichier ne contenait plus que le dernier — **sept lignes sur
quatre-vingt-quatre**. Rien ne le signalait : le fichier existait, il
était bien formé, il était juste vide de tout le reste. Une licence
effacée ne se remarque qu'au moment où quelqu'un la demande.

**Correctif :** fusionner quand la passe est partielle, réécrire en
entier seulement quand elle est complète. Le même piège avait été vu à
l'écriture dans `polices-demos.mjs` et manqué ici.

---

### 63 · Le pli n'est pas une mesure de page, et une capture pleine page ne le montre pas

Deux héros sur douze poussaient leur bouton principal **sous la ligne
de flottaison** d'un écran de 1280 × 800 : la boutique coupait la
troisième ligne de son titre à 803 px, la construction posait son
« demander une soumission » à 867. Les deux passaient tous les
contrôles — pas de débordement, pas de trou, contraste bon — parce
qu'aucune sonde ne regarde **ce qui tient dans le premier écran**.

Ça s'est vu sur la **planche des douze premiers écrans**, à la même
largeur et à la même échelle, pas sur les captures pleine page.

**Correctif :** relever `getBoundingClientRect().bottom` du `h1` et du
premier appel à l'action sur une fenêtre de 800 px de haut, et exiger
qu'ils tiennent. `tools/planche-secteurs-12.mjs` fait la planche.

**Piège dans le piège :** composer douze captures de 14 000 à 26 000 px
en base64 dans une seule page **tue le navigateur**. Il faut deux
passes — découper le premier écran de chacune, une page par image, puis
composer sur des vignettes.

---

### 64 · `animation-fill-mode: both` rend la moitié du site VIDE en capture pleine page

Les neuf sites de secteur n'avaient aucune animation. Le jour où on
leur en a posé, les deux premières sessions ont écrit `animation: monte
both` — c'est ce que dit tous les articles sur les animations pilotées
par le défilement — et **les deux ont photographié une page blanche**.
Dix blocs entièrement vides sur la boutique ; ni titre ni image sur le
salon.

Cause : `both` remplit AUSSI l'avant-plage. Un élément qui n'a pas
encore atteint son `animation-range` garde donc son état de DÉPART,
c'est-à-dire `opacity: 0`. Une capture pleine page ne déplace pas le
défilement — Playwright photographie au-delà de la fenêtre sans
bouger la position. Tout ce qui est sous le pli est avant sa plage,
donc invisible. **La sonde ne dit rien : le DOM est complet, les
images sont chargées, le texte est là. Il est seulement transparent.**

**Correctif : `forwards`, jamais `both`.** Hors de la plage, c'est le
style de base qui tient — et le style de base est la forme FINALE
(règle 3 de la structure). La bascule vers l'état de départ se fait à
`entry 0%`, c'est-à-dire au moment où l'élément n'a pas un pixel de
visible. Le visiteur ne voit aucune différence ; l'aperçu du panneau,
lui, voit toute la page.

---

### 65 · `view()` mesure la boîte de l'élément QU'ELLE ANIME, pas celle qu'on regarde

Un odomètre sans script est une pile de chiffres qu'on translate. La
pile fait dix fois la hauteur de sa fenêtre. En posant
`animation-timeline: view()` sur la pile, `cover 25 %` tombait **un
écran et demi plus bas** que prévu : les quatre nombres restaient figés
à mi-course, progression relevée 0,354 alors que la bande était plein
cadre.

**Correctif :** déclarer la piste sur la BANDE — celle dont la
géométrie correspond à ce que le visiteur voit — avec `view-timeline`
nommée, et la hisser jusqu'à l'élément animé par `timeline-scope`.

**Corollaire, trouvé au même endroit :** `overflow: hidden` sur un rail
de progression **fait du rail un conteneur de défilement**, et un
`view()` posé sur son remplissage se met à mesurer le remplissage
*dans le rail* au lieu du rail *dans la page* — progression bloquée à
1,00, la barre naît pleine. Un `scaleX` depuis la gauche ne sort jamais
de sa boîte : le `overflow` n'avait aucune raison d'être là.

---

### 66 · `overflow-x: clip` cache un vrai défaut à une sonde `scrollWidth`

Le clip est nécessaire dès qu'un élément arrive de `+60 px` : sans lui,
la révélation latérale déborde à droite pendant toute sa course. Mais
il a aussi masqué un accordéon cassé sous 560 px — le nom du service et
son signe `+` posés sur la même case de grille, le nom partant hors
écran. `document.documentElement.scrollWidth` répondait « aucun
débordement », et c'était vrai : le document ne débordait pas, l'enfant
si.

**Correctif :** mesurer aussi les enfants contre leur COLONNE parente,
pas seulement le document contre la fenêtre. Et regarder la capture :
c'est elle qui l'a montré.

## AJOUTÉS LE 2026-08-01, CHANTIER DU PREMIER ÉCRAN

### 67 · Une seule bande plate n'est pas une capture plate

**Le verdict.** `ecrans-secteurs.mjs` a refusé le premier écran du
garage : « CAPTURE PLATE — pire bande 5,2 < 6 ». Bandes relevées :
`[26.9, 6.6, 99.3, 101.2, 80, 22.5, 29.4, 5.2]`.

**Ce que l'image montrait.** Un premier écran excellent — titre en
grotesque condensée de 120 px sur trois lignes, photographie de capot
de voiture sombre en plein cadre, deux boutons, une barre de
navigation. La bande à 5,2 était **le capot noir**, en bas. La bande à
6,6 était le haut de la même voiture.

**La cause.** Le détecteur cherchait « une image vide » et mesurait
« la bande la plus calme ». Ce n'est pas la même question. Piège 15,
rejoué : *un détecteur doit distinguer ce qui est plat EXPRÈS.* Tous
les écrans bien composés ont une bande calme — un bandeau plein, un
ciel, un capot, un mur de couleur, une marge. Un écran qui n'en a
aucune est un écran chargé.

**Le correctif.** Deux critères, et l'un des deux suffit à refuser :
la **médiane** des huit bandes sous le seuil (l'image entière est
vide), ou **trois bandes plates consécutives** (un tiers de l'écran
est mort). Une bande isolée ne dit rien.

> **La règle générale :** un seuil posé sur le minimum d'un
> échantillon mesure le cas particulier, pas la population. Le
> minimum d'une distribution saine descend bas — c'est sa définition.

### 68 · Geler les animations gèle aussi le préchargeur

**Le verdict.** Première capture du restaurant : un écran noir, le
mot-marque au centre, et **« 89 % »** dessous. 62 Ko pour une image de
2880 × 1800.

**La cause.** Pour que deux passes rendent la même image, l'outil met
**toutes** les animations en pause et pose leur temps local à
l'instant photogénique : `document.getAnimations().forEach(a => {
a.pause(); a.currentTime = t })`. C'est juste — et c'est exactement ce
qui a figé le compteur du préchargeur à quatre-vingt-neuf pour cent,
avant que la page qu'on voulait photographier ait seulement paru.

Le gel déterministe suppose que **ce qui joue est ce qu'on veut
voir**. Un préchargeur, un rideau d'entrée, un compteur de chargement
ne sont pas le sujet : ils sont ce qui empêche de le voir.

**Le correctif.** Deux réglages, par écran :
`figer: false` pour les pages qui ne sont pas dessinées autour d'un
instant — on les laisse finir ; et `attente`, le temps qu'il faut au
rideau pour se lever avant que quoi que ce soit d'autre commence.

> **La règle générale :** avant de figer un état, s'assurer que c'est
> l'état de la chose, et pas celui de ce qui la précède.

### 69 · Un dépôt voisin peut être en chantier pendant qu'on le photographie

`MV-deneigement` a rendu une page d'erreur Next.js : `Module not
found: Can't resolve '@/components/layout/Footer'`. Le fichier
`Footer.tsx` **existait**, horodaté à la minute de la capture — 40
fichiers modifiés, un composant supprimé, une refonte en cours dans
une autre session.

Rien n'était cassé chez nous, et rien n'était cassé chez eux : on a
photographié entre deux enregistrements. **Avant de conclure d'une
capture prise sur un projet qu'on ne pilote pas, regarder son
`git status` et l'horodatage de ses fichiers.** Un arbre sale est un
avertissement, pas un décor.

### 70 · Un masque figé à mi-course sur du TEXTE ne se lit pas comme un mouvement

**Le verdict.** Sur la planche des douze, deux écrans rendaient un
titre coupé net : « deux doigt | une » pour le salon de coiffure,
« ne s'ouvre avant d'être e| » pour le cabinet. Les deux étaient
**conformes à leur plan** : un masque de révélation photographié à
mi-course, exactement à l'instant demandé.

**Ce que voit un visiteur.** Pas un mot en train d'apparaître : un mot
**tronqué**. Une page cassée, un `overflow` mal réglé, une police qui
n'a pas chargé. Le mouvement n'est lisible que si l'œil a vu l'état
d'avant ou celui d'après — sur une image arrêtée, il n'a ni l'un ni
l'autre, et il conclut au défaut.

C'est le même raisonnement que l'interdit du scrub d'opacité sur du
texte (`CLAUDE.md`) : **une animation n'a pas d'état de repos, elle a
l'état où on la photographie.** Ce qui vaut pour l'opacité vaut pour
le `clip-path`.

**La règle.** Un geste photographié à mi-course doit être une chose
dont l'état intermédiaire est **naturellement lisible** :
une bande qui se remplit, un filet en train d'être tiré, une cote dont
la flèche n'a pas fini, un chiffre entre deux crans, un volet de
couleur pleine. **Jamais une lettre coupée en deux.** Si le geste
porte sur du texte, on le photographie **fini**, et on met le
mouvement ailleurs.

### 71 · Un geste d'un pixel n'existe plus à l'échelle où on le regarde

L'aperçu du panneau réduit la capture de 1440 à **421 px, soit 0,29**.
Un filet de 1 px y devient **0,29 px** : le moteur l'étale en un gris
que personne ne voit. Deux écrans avaient pour seul mouvement un trait
de 1 px qui se remplit — mesuré, prouvé, cinq états à 63 px d'écart —
et **invisible là où l'écran est regardé le plus souvent**.

Le mouvement se prouve dans la page ; il se **vend** dans le panneau.
Les deux échelles ne demandent pas la même chose.

> **La règle : à 1440, un geste photographié doit peser au moins
> 12 px dans sa plus petite dimension** — une bande, une plaque, un
> volet, un bloc de couleur. En dessous, il ne survit pas à la
> réduction, et un écran dont le geste ne survit pas est un écran fixe.

Corollaire : un geste qui repose sur un **déplacement** de moins de
40 px à 1440 se lit comme du bruit une fois réduit. Ce qui bouge doit
bouger d'une distance qu'on voit à 0,29.

### 72 · Un masque posé avant l'hydratation est effacé par l'hydratation

**Le verdict.** La capture du déneigeur est sortie avec **le numéro de
téléphone du client en clair**, alors que l'outil avait annoncé
« 9 nœuds masqués ». Le masque avait bien été posé. Il avait aussi été
défait.

**La cause.** La page est en React. Son hydratation a échoué —
« Hydration failed because the server rendered text didn't match the
client. As a result this tree will be regenerated on the client » —
et la reconstruction de l'arbre a **remplacé les nœuds de texte** que
le masque venait de réécrire. Entre le masquage et le déclenchement il
y avait cinq secondes d'attente : largement de quoi.

**Le correctif, en deux temps.**
1. **Masquer deux fois** : une fois tôt, et une fois **juste avant le
   déclenchement**, après toutes les attentes.
2. **Vérifier.** Un masque qu'on ne vérifie pas est un masque qui peut
   être défait en silence. Les motifs sont relus dans le texte RENDU,
   et un seul survivant **arrête la capture**.

> **La règle générale :** toute modification du DOM faite avant une
> attente doit être **revérifiée après** l'attente. Ce qui a du
> JavaScript peut tout reconstruire pendant qu'on patiente.

### 72 bis · Un vérificateur qui attrape son propre remplacement ne vérifie rien

Le premier jet du vérificateur ci-dessus a refusé la capture sur
`000 000-0000` et `courriel@exemple.ca` — c'est-à-dire sur les chaînes
que le masque venait de POSER. Un numéro de remplacement satisfait
évidemment le motif « un numéro de téléphone ». L'outil rendait donc
« masquage défait » sur un masquage parfaitement appliqué.

**Un motif n'a survécu que si ce qu'il attrape n'est pas son propre
remplacement.** Le contrôle compare la prise à la chaîne de
substitution avant de crier.

### 73 · Un outil de contraste écrit à la hâte ment QUATRE fois de suite

`demos-contraste.mjs` remonte jusqu'à la première surface **opaque**.
Sous une photographie il s'arrête et rend « approché » : il ne mesure
pas ce qui est peint. Piège 45, appliqué au contraste.

Un sous-agent a signalé que l'écran de l'auberge tombait à 4,35:1 sous
sa mention. J'ai écrit `tools/pire-pixel.mjs` pour vérifier — deux
captures, avec et sans encre, on compare. **Il a rendu un faux verdict
quatre fois avant d'être juste**, et à chaque fois le chiffre était
crédible.

| # | Ce qu'il gardait | Ce qu'il a rendu | La cause |
|---|---|---|---|
| 1 | tout pixel du rectangle englobant | **2,46:1** sur un mot-marque net | il mesurait le ciel **entre** un « A » et un « u » |
| 2 | tout pixel ayant bougé de plus de 64 | **1,13:1 sur les neuf blocs** | il mesurait l'**anticrénelage**, dont la couleur composée est presque celle du fond. Piège 8 |
| 3 | 85 % de la distance vers la couleur **déclarée** | « **aucun pixel d'encre** » sur trois blocs | leur encre est posée à `rgba(…, .72)` et ne parcourt jamais 85 % de cette distance. Un silence qui se lit comme « rien à signaler » |
| 4 | 85 % du déplacement **maximal d'un canal** | **2,76:1** sur un sous-titre à 8,29 déclaré | Chromium sous Windows fait de l'anticrénelage de **SOUS-PIXELS** : un bord de glyphe peut avoir son rouge déplacé à fond et son bleu à peine |

Ce qui décide enfin : **le déplacement MINIMAL des trois canaux**,
comparé au maximum de ce minimum dans la boîte. Un pixel n'est du corps
de lettre que s'il a bougé sur les trois. Plus deux réglages sans
lesquels rien ne tient : **densité 2** — à densité 1 une mono de 10 px
n'a pas un pixel plein — et **`-webkit-text-fill-color` et non
`color`**, parce que `color: transparent` efface aussi les bordures,
qui valent `currentColor` par défaut.

### 74 · (73 bis) ET LE SIGNALEMENT DE DÉPART ÉTAIT FAUX AUSSI

Une fois l'outil juste, l'écran mesuré avec **ses valeurs d'origine**
rend **5,78 au pire pixel**. Il n'a jamais été en défaut.

Entre-temps j'avais « corrigé » deux choses : épaissi le voile — sans
effet, 4,23 → 4,26 — puis remonté l'opacité de trois textes de 72 % à
88 %. **Le second a fait passer le chiffre**, donc j'ai cru avoir
trouvé. J'avais seulement déplacé un artefact de mesure, en écrasant au
passage une décision de composition : la discrétion de ces libellés
était voulue et cotée.

> **Ce qui aurait évité les deux : mesurer la valeur DÉCLARÉE avant de
> croire un instrument neuf.** Prune `#4A3742` sur argile `#E7DFD2`
> rend 8,29:1 — trois lignes de calcul, aucune capture. **Quand un
> outil de pixels contredit une arithmétique triviale, c'est l'outil
> qui a tort**, et on ne touche à rien tant qu'on ne sait pas pourquoi.

L'observation sur l'alpha, elle, reste vraie et vaut d'être gardée :
**une encre semi-transparente est composée sur le fond qu'on
assombrit**, donc les deux termes du rapport descendent ensemble et le
quotient ne bouge pas. Sur un fond qu'on ne contrôle pas, ou l'encre
est opaque, ou son fond est un aplat.

---

### 75 · Une clôture de commentaire CSS cassée avale la règle suivante — et l'outil de contrôle rend « ok »

En éditant un `<style>` inline, un `*/` perdu fait avaler la règle qui
suit par le commentaire. Deux fois de suite sur le même écran. La
**masse bordeaux avait disparu** de la page — 56 % de la surface — et
`demos-controle.mjs` rendait **« ok, 0 mal »** : il vérifie la
véracité du contenu, pas la présence de la composition.

Le défaut a été attrapé **à l'image**, jamais par un test. C'est le
cas général : un outil qui ne mesure pas la chose ne dit rien de la
chose, et son silence se lit comme un feu vert.

> **Compter les `/*` et les `*/` après toute édition d'un bloc de
> style.** Un déséquilibre arrête l'outil. Et pour tout ce qui se
> regarde : la capture est la preuve, pas le test qui passe.

### 76 · Un outil de contraste qui ne remonte que les ANCÊTRES ne voit pas une masse posée en FRÈRE

`demos-contraste.mjs` cherche le fond en remontant la chaîne des
parents jusqu'à la première surface opaque. Une masse de couleur qui
est un **frère** du texte — un aplat en `position: absolute` posé
derrière, très courant dès qu'un titre traverse une frontière de fond
— lui est totalement invisible. Il a rendu **quatre échecs à « 1:1 »
sur du texte mesuré à 9,4:1**.

Ce n'est pas le même défaut que le 45 (un fond en dégradé rend
`rgba(0,0,0,0)`) ni que le 73 (la boîte au lieu du glyphe) : ici
l'outil trouve *un* fond, réel, opaque — mais pas celui qui est
**peint sous les lettres**.

> Contourner en déclarant le fond sur le porteur du texte **répare
> l'écran, pas l'outil** — et un contournement survit toujours au
> correctif (piège 46). Sous une masse en frère comme sous une
> photographie, l'arbitre reste `tools/pire-pixel.mjs`, qui mesure ce
> qui est **peint**.

### 77 · `order` réordonne aussi l'ORDRE DE PEINTURE — et rien ne peut le voir sauf l'image

Dans un conteneur `flex` ou `grid`, `order` ne change pas seulement la
place : il change **l'ordre de peinture**. Une photographie posée à
`order: 8` s'est peinte **par-dessus** un bandeau à `order: 1`, et le
nom du salon avait purement disparu de la capture.

Ce qui rend le cas méchant, c'est que **tout allait bien partout
ailleurs** :

- la boîte du bandeau est présente dans le DOM ;
- son rectangle est à la bonne position et à la bonne taille ;
- sa couleur calculée est la bonne ;
- son texte est dans le texte rendu ;
- zéro erreur de console ;
- `demos-controle.mjs` rend **« ok »**.

**Aucune sonde du DOM ne pouvait le voir**, parce qu'il n'y a rien à
voir dans le DOM : le défaut est dans le compositeur. C'est le piège
25 exactement — une sonde du DOM ne voit pas un défaut de peinture —
mais par une cause qu'on n'attend pas, puisque `order` se lit comme
une propriété de mise en page.

> Toute pile qui emploie `order` ou un `z-index` implicite se vérifie
> **en capture**, et la capture se **regarde**. Voisin du 75 : deux
> fois de suite ici, l'outil de contrôle a rendu « ok » sur un écran
> dont il manquait un morceau.

---

### 78 · Une capture d'élément ne compose pas une toile WebGL

`element.screenshot()` de Playwright rendait le panorama de la Visite
360 en **aplat noir** dès qu'un pointeur avait appuyé dans le lecteur.
L'écart de pixels annonçait alors **75 %** entre deux états qui
n'avaient pas bougé, et **0,6 %** entre deux pièces différentes —
c'est-à-dire l'inverse de la vérité.

`page.screenshot()` compose la même couche et rend la pièce.

> Sous SwiftShader, toute preuve d'un lecteur WebGL passe par une
> capture de **fenêtre**, jamais par une capture d'élément.

---

### 79 · Le `clip` d'une capture de page ne se lit pas dans le repère de `boundingBox()`

Suite du 78. Passé à `page.screenshot({ clip })` avec les coordonnées
rendues par `boundingBox()`, à 6 000 px du haut du document, l'outil a
photographié une bande d'encre vide : cadre noir, bandeau absent,
pupitre absent. Les deux mesures ne partagent pas leur origine.

> Photographier la fenêtre entière et **borner la comparaison au
> décodage**, chaque image portant la fenêtre où se trouvait l'objet.

---

### 80 · Un `scrollTo` vers une section n'y arrive pas quand des sas grandissent la page

Le cœur de l'affaire, et il a coûté cinq fausses pistes avant d'être vu.
`scrollTo(0, hautDeLaSection)` ne s'y pose **jamais** : les sas ajoutent
de la hauteur *au fur et à mesure* de la descente, donc la cible recule
plus vite qu'on n'avance. Mesure : à six décalages différents, le cadre
de la visite est resté **entre 2 128 et 3 555 px sous la fenêtre**.

Toutes les captures « noires » étaient donc des captures **d'ailleurs**.
Et les constats du DOM passaient quand même, parce que Playwright amène
lui-même un élément dans le champ avant de cliquer dessus : l'interaction
avait lieu, la photo non.

Une boucle de correction ne sauve pas : elle poursuit une cible qui
bouge avec elle. Trois tentatives, dont une partie à **5 156 px**.

> Traverser **toute** la page une fois — ce qui fixe sa hauteur
> définitive — puis laisser `scrollIntoViewIfNeeded()` amener l'objet.
> Et **vérifier où est l'objet dans l'image**, au lieu de le supposer.

---

### 81 · Sous mouvement plein, une section derrière un sas se photographie en noir

Une fois le cadre réellement dans le champ, il rendait **encore** noir.
Le DOM ne disait rien : `clip-path` à sa forme finale, opacité 1, aucune
transformation, `elementFromPoint` trouvait bien le lecteur.

Mesure A/B, worktree du code d'avant servi sur un autre port :

| | mouvement réduit | mouvement plein |
|---|---|---|
| **avant le chantier** | relief **75,9** | relief **0,0** |
| **après le chantier** | relief **58,5** | relief **0,0** |

Identique des deux côtés : ce n'est pas une régression, c'est ce que
font les sas quand on les traverse au script. C'est aussi pourquoi
toutes les planches du dépôt photographient en **mouvement réduit** et
n'ont jamais rencontré le problème.

> Un lecteur qui doit être **vivant** sur la photo se photographie
> quand même en mouvement réduit, si son moteur n'en dépend pas —
> `tour360.js` ne lit `prefers-reduced-motion` que pour la dérive
> automatique. Et **quand un instrument neuf contredit le code, mesurer
> le code d'avant avant de s'accuser** (piège 74, autre visage).

> ### ⚠ CE PIÈGE A RENDU UN FAUX ACQUITTEMENT — corrigé le 2026-08-03
>
> Les deux relevés « relief 0,0 » ci-dessus sont exacts. La conclusion
> qu'on en a tirée était fausse. **« Identique des deux côtés » ne veut
> pas dire « artefact de mesure » : ça veut dire que le défaut existait
> déjà des deux côtés.** Le volet du sas de la remontée posait 1 193 px
> d'encre par-dessus la section Visite dans trois états sur quatre —
> c'était un défaut de production, pas une bizarrerie du harnais, et
> une planche en mouvement plein ne mentait pas. Cause et correctif :
> **D-629**, et le mécanisme qui l'a caché : **piège 84**.
>
> Ce que le piège 81 garde de vrai : la géométrie des sas ne s'observe
> **pas** en mouvement réduit. Ce qu'il faut cesser de lire dedans :
> « donc on photographie en mouvement réduit ». C'est l'inverse.

---

### 82 · Un sélecteur d'enfant sans chevron mange le parent qu'il ne cible pas

`.agc-faits span { font-size: var(--fs-6) }` visait la glose. La fenêtre
du cran est **aussi** un `span`, à l'intérieur du `b.num` qui porte les
80 px : la règle l'a attrapée, lui a posé 15 px et l'a chassée à droite.
Le chiffre d'affiche mesurait **7 px de large**. Déclaré à 80, rendu à 15.

`getComputedStyle(.num).fontSize` rendait bien `80px` — la règle qui tue
est sur l'ENFANT, pas sur lui. Seule la géométrie le disait.

> Un descendant qui hérite d'un calibre se cible avec `>`. Et quand une
> valeur déclarée ne se voit pas, lire la géométrie **rendue**, pas la
> propriété du parent.

---

### 83 · Un voile en `pointer-events: none` est INVISIBLE à `elementFromPoint`

Cherchant pourquoi la section Visite se photographiait noire, la sonde
interrogeait neuf points de la scène avec `elementFromPoint` et
demandait ce qui était au-dessus. Elle a rendu **`img.tour-poster` sur
les neuf**, c'est-à-dire « rien ne recouvre », sur une scène
**entièrement recouverte d'encre**. Le volet du sas porte
`pointer-events: none` : le test d'atteinte le traverse comme s'il
n'existait pas. Une couche qui ne prend pas le pointeur peint quand
même.

Second temps, une fois le correctif posé. La sonde mesurait le
recouvrement avec `getBoundingClientRect()` du volet — et elle a
continué de dire **« recouvre 88 % »** alors que l'écran était propre.
`getBoundingClientRect()` rend la boîte **de l'élément**, pas ce qui en
survit au rognage d'un ancêtre : le volet garde ses 130vh à
`translateY(-102%)`, il est simplement hors de la voie qui le rogne.

> Une sonde du DOM ne peut juger **ni d'un recouvrement, ni d'un
> rognage**. Les deux se voient dans l'image, et nulle part ailleurs.
> C'est le piège 25 par deux portes différentes le même jour.

---

### 84 · Une planche en mouvement réduit ne peut PAS voir un défaut de sas

`html.sas-ok` se décide dans le `<head>`, avant la première mise en
page, avec `!matchMedia("(prefers-reduced-motion: reduce)")`. Sans la
classe, **un sas EST sa bande de seuil** : la piste n'a pas de hauteur,
le calque n'existe pas, le volet n'est pas positionné. Donc la
géométrie qu'on veut vérifier **n'existe pas au moment où on la
photographie**.

Toutes les planches du dépôt photographiaient en mouvement réduit —
c'est ce que le piège 81 recommandait, et c'est ce qui rendait les
images déterministes. **110 planches de la passe « avant » du
2026-08-03 déclarent saine une section qui rendait un aplat noir en
production.** Aucune n'était fausse ; aucune ne regardait la chose.

> Un harnais qui neutralise le mouvement pour être stable neutralise
> aussi ce qu'il devait mesurer. Quand la chose à juger **dépend** du
> mode de mouvement, photographier dans le mode où elle existe :
> `node tools/plaques.mjs <ancre> <nom>`, mouvement plein par défaut,
> et le RELIEF de chaque image comme verdict.

---

### 85 · `String.prototype.replace` lit `$$` comme un `$` littéral

Dans la **chaîne de remplacement**, `$` est un caractère spécial :
`$&`, `$1`, `` $` ``, et `$$` qui vaut un dollar littéral. Une passe
d'outillage qui remplaçait `$(".a")` par `$$(".a, .b")` a donc écrit
`$(".a, .b")` dans le fichier — **silencieusement**. Un `querySelector`
unique s'est retrouvé à recevoir un `.forEach`.

Erreur de page à l'exécution, **aucune erreur de syntaxe**, aucun
avertissement, et un diff qui a l'air juste tant qu'on lit le motif
plutôt que le résultat.

> Utiliser une **fonction** de remplacement — `replace(motif, () =>
> remplacement)` — qui ne réinterprète rien. Et relire le fichier
> écrit, pas la chaîne qu'on croyait écrire : c'est le même
> raisonnement que le piège 72, où un masque non vérifié avait été
> défait en silence.

### 86 · `.` ne matche pas `\r` en JavaScript, et un fichier CRLF fait échouer `/^…$/` en silence

**Le faux verdict.** `tools/index-doc.mjs`, première passe : « 40 parties
trouvées » dans `ANIMATIONS.md`, « **0 partie** » dans `ARCHITECTURE.md`,
`PIEGES.md`, `MESURES.md`, `DECISIONS.md` et `RESERVES.md`. Aucune erreur,
aucun avertissement. L’outil a écrit **six tables d’index vides**, puis a
rendu « a jour » sur les sept fichiers.

**La cause.** Le dépôt mélange les fins de ligne — git convertit à
l’écriture, donc `ANIMATIONS.md` est en LF et `ARCHITECTURE.md` en CRLF.
Le détecteur de titres faisait `split("\n")` puis `/^(#{2,3}) (.+)$/`.
Sur une ligne CRLF, `split` laisse le `\r` en queue ; or **`.` en
JavaScript ne matche pas `\r`** — c’est un terminateur de ligne au même
titre que `\n`, `\u2028` et `\u2029`. Donc `(.+)` s’arrête avant lui, `$`
ne tombe pas sur la fin de chaîne, et le test rend `false`. Relevé
caractère par caractère : codes `35 35 32 84 …` puis `13` ; `/^#{2,3} /`
rend `true` et `/^(#{2,3}) (.+)$/` rend `false` sur la **même ligne**.

**Ce qui l’a masqué.** `grep -c "^## "` trouvait bien les 12 titres :
l’outil POSIX et le moteur JS ne sont pas d’accord, et c’est le désaccord
qui trompe. On vérifie avec `grep`, on conclut que le fichier va bien, et
on cherche le défaut ailleurs.

**Il se reproduit un cran plus bas.** Le correctif naïf coupe le `\r`
**final** (`.replace(/\r$/, "")`). Mais un `\r` inséré au MILIEU d’une
ligne — ce qui arrive dès qu’un script écrit du texte contenant un
échappement mal protégé — casse la même regex sans être coupé. Ce piège
s’est écrit lui-même de cette façon : son propre titre a été rendu
invisible à l’index par un CR au milieu.

**Le correctif.** Couper tout `\r` de la ligne avant de comparer, relever
la fin de ligne dominante du fichier et la remettre à l’écriture — insérer
des lignes en LF dans un fichier CRLF laisse un mélange que le prochain
outil relira de travers.

**Et le vrai correctif est ailleurs : zéro résultat doit ARRÊTER l’outil.**
Un compteur de parties à 0 sur un document qui a forcément des titres
n’est pas un résultat, c’est une panne. Sans ce garde-fou, l’instrument
s’est tu sur exactement le défaut qu’il devait voir. Même famille que les
pièges 30, 40 et 62.
