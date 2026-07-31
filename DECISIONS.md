# DÉCISIONS — le journal du projet

**Quand lire ce fichier :** avant de renverser un choix, et chaque
fois qu'un bout de code paraît arbitraire. Il dit **pourquoi**.
`ARCHITECTURE.md` dit **où**, `SECTIONS.md` dit **quelle ligne**.

Deux niveaux :

1. **Les décisions de projet**, ci-dessous — ce qui vaut pour tout le
   site.
2. **Les décisions de code**, dans `decisions/` — un fichier par
   fichier source. Chaque entrée y porte un identifiant `D-042` qui
   figure **aussi dans le code**, en une ligne. `grep D-042` trouve
   les deux bouts. On n'ouvre jamais ces fichiers en entier : on y
   arrive par l'identifiant.

## Index de `decisions/`

| Fichier source | Journal | Entrées |
|---|---|---|
| `index.html` | `decisions/index.md` | D-001 → D-094 |
| `404.html` | `decisions/404.md` | D-095 |
| `css/app.css` | `decisions/css-app.md` | D-096 → D-298 |
| `css/secteurs.css` | `decisions/css-secteurs.md` | D-299 → D-333 |
| `css/tour360.css` | `decisions/css-tour360.md` | D-334 → D-341 |
| `css/tokens.css` | `decisions/css-tokens.md` | D-342 → D-347 |
| `css/base.css` | `decisions/css-base.md` | D-348 → D-351 |
| `js/main.js` | `decisions/js-main.md` | D-352 → D-442 |
| `js/langue.js` | `decisions/js-langue.md` | D-443 → D-494 |
| `js/motion.js` | `decisions/js-motion.md` | D-495 → D-525 |
| `js/limaille.js` | `decisions/js-limaille.md` | D-526 → D-537 |
| `js/tour360.js` | `decisions/js-tour360.md` | D-538 → D-542 |
| `js/hero.js` | `decisions/js-hero.md` | D-543 → D-556 |
| `js/trame.js` | `decisions/js-trame.md` | D-557 → D-564 |
| `js/pointe.js` | `decisions/js-pointe.md` | D-565 → D-566 |

---

# LES DÉCISIONS DE PROJET

## Contenu et offre

| Décision | Raison |
|---|---|
| **Pas de grille de prix publiée** | aucun projet ne ressemble au précédent ; une grille publiée finit toujours par mentir. Le chiffre ferme est dit au premier appel, et c'est celui de la facture |
| **Préavis de réservation à 24 h** | ce n'est pas un délai de réponse (12 h), c'est un préavis minimum de réservation. Les deux ne sont pas la même chose |
| **Grille de commissions retirée** | le montant qui attire est le **plafond**, pas le barème — et un barème par tranche publie notre structure de prix en creux |
| **Les délais de la fiche technique sont des délais de PRODUCTION** | la date de démarrage dépend de la liste d'attente. Confondre les deux, c'est soit mentir, soit s'excuser ; les séparer donne une raison d'appeler tout de suite |
| **« Estimation en six questions », pas « en 60 secondes »** | le parcours compte six questions **plus** une étape où le nom et le courriel sont obligatoires ; soixante secondes se mesurent au chronomètre. Corrigé aux **cinq** endroits, y compris `<meta name="description">` |

## Forme et mouvement

| Décision | Raison |
|---|---|
| **Rail horizontal aux Services, pas une roue** | sur un cercle il n'y a ni début ni fin, donc plus aucune réponse honnête à « combien il en reste » — du N1 sacrifié pour du N3 |
| **Section Référence sombre dans les deux thèmes** | en `--surface-inverse`, elle donnait un aplat **clair** au milieu d'un site sombre |
| **Pas de compteur `data-count` sur les plaques** | l'état de repos était alors le texte « 0 », donc « 0 · Du code vous appartient ». Écrire le contraire de ce qu'on affirme est un mensonge |
| **`startViewTransition` abandonné** | c'est un **fondu**, donc hors langue. Remplacé par la trame |
| **Ne jamais poser douze séparateurs** | un trait posé douze fois fabrique exactement les blocs qu'on veut supprimer. La continuité vient de ce qu'un **même** objet traverse et se transforme |
| **La piste des Services ne tombe à aucun palier** | elle porte l'orientation — « lequel des quatre je regarde » — et coûte **une** transformation composée par image sur **un** élément. La retirer coûterait plus en information qu'elle ne rapporterait en peinture |
| **L'escalade des paliers est à sens unique** | une page qui réactive ses animations dès que la machine respire produit un scintillement pire que le problème qu'elle corrige |

---

# 2026-07-29 · VÉRACITÉ

36 affirmations fausses, invérifiables ou en jargon relevées et
traitées. Neuf faussetés démontrables, six engagements que personne ne
pouvait tenir tels qu'écrits — sur un site par ailleurs soigné, dont
les deux PDF s'imposent déjà ce standard mot pour mot. Le trou n'était
pas dans le code.

Rapport complet : `archives/rapports/AUDIT-VERACITE.md`.
Les 31 arbitrages pris sans le propriétaire :
`archives/rapports/DECISIONS-NUIT.md`.

**Ce que cet audit a produit comme règle** — la propagation, § 0.A de
`CLAUDE.md`. « Abonnement obligatoire » a été corrigé dans la FAQ et
laissé intact dans Services : deux sections du même document se
contredisaient, et c'est la contradiction la plus facile à opposer
parce qu'elle tient sur un écran.

---

# 2026-07-30 · matin · SERVICES, PREMIÈRE REFONTE

La cause mesurée des quatre défauts du rail épinglé, la recherche sur
les carrousels en chiffres, la provenance et la licence de chaque
image, et 12 décisions prises sans le propriétaire.

Rapport : `archives/rapports/CHANTIER-SERVICES.md`.

---

# 2026-07-30 · après-midi · ACCUEIL, SERVICES, RÉALISATIONS

**Remplace en partie le précédent.** Le retrait des huit plaques, la
piste collante des Services (dont le défaut de PEINTURE qu'aucune sonde
du DOM ne voyait — `PIEGES.md` § 25), les trois avant / après en
markup, le registre des marqueurs de 2008-2012 avec leurs captures
Wayback, et 13 décisions.

Rapport : `archives/rapports/CHANTIER-SERVICES-REALISATIONS.md`.

## Le retrait des huit plaques de l'accueil

Sur demande du propriétaire : la section devient plus courte et plus
nette. Le markup, le CSS (§ 13 et § 13bis, 278 lignes), les deux replis
de largeur et le bloc 10 de `langue.js` (194 lignes) sont **archivés en
entier** dans `archives/2026-07-30-plaques-accueil/`, avec le registre
des huit affirmations et ce qui soutenait chacune.

**Ce que leur départ coûte est réel** : elles étaient le seul endroit
du site qui projetait l'image d'une maison **établie**. Pas par des
chiffres de volume — personne ne les croit — mais par le **standard** :
une maison qui affiche des engagements précis donne l'impression
d'avoir des processus, et une maison qui a des processus est grosse
dans la tête du visiteur.

**Ce qui les remplace** : une ligne, sous un filet, en pied de hero.
Douzième pas de la composition (`--e: 1320`).

> Réponse en 12 h jours ouvrables · Un seul interlocuteur du premier
> appel à la mise en ligne · Tout vous appartient : le code,
> l'hébergement, l'adresse

| Gardée | Pourquoi celle-là |
|---|---|
| **12 h** | le seul engagement **chiffré** du lot, affiché à cinq autres endroits du site |
| **Un seul interlocuteur** | dit le **standard**, pas la taille — ce que les grosses maisons facturent cher |
| **Tout vous appartient** | le différenciateur **premium** : il oppose notre offre à celles qui gardent le client en otage |

Écartées : « Jour 5 » et « = » demandent la figure qui les accompagne
dans la section Agence pour se comprendre ; « 0 mouchard » est un
argument **technique** et cette ligne parle la langue du client ;
« Québec » est déjà dit par le sur-titre six lignes plus haut ;
« 7 produits » comptait la **vidéo**, que rien ne soutient ailleurs.

**Emplacement.** `.hero-fiche` est en `display: none` sous 64em : un
socle posé dans la fiche n'existerait pas sur téléphone. Celui-ci est
un enfant direct du hero, `grid-column: 1 / -1`, `align-self: end`.
Coût mesuré (`node tools/socle-captures.mjs`) : **0 px** à 390 et 768,
**22 à 42 px** de 1280 à 1920.

**Plus aucune animation permanente ne subsiste dans l'accueil.** La
boucle de vie des plaques était le poste le plus cher du site : une
boucle ne s'arrête jamais.

---

# 2026-07-30 · soir · CHANTIER DE STRUCTURE

Aucun changement de comportement. Objectif : arriver plus vite à la
bonne information et payer moins de contexte par session.

## Ce qui a été décidé, et pourquoi

**Les commentaires de 4 lignes ou plus quittent le code.**
Mesure d'entrée : **423 961 octets de commentaire sur 934 544 de
source, soit 45,4 %** — presque la moitié du code. `js/langue.js` était
à **68,1 %** : deux tiers du fichier n'étaient pas du code. Ce contenu
est précieux et se lit une fois sur cinquante ; il se payait à chaque
ouverture du fichier.

566 blocs déplacés vers `decisions/`, **329 360 octets** rendus. Avec
la normalisation des 50 bannières restantes, la source passe de
**934 544 à 598 972 octets — 35,9 %**, et les commentaires de **45,4 %
à 14,8 %**. Plus une seule ligne ne vit dans un bloc de plus de trois
lignes (il y en avait 6 318).

**Le gain se voit aussi chez le visiteur, et c'est un effet de bord.**
`css-critique.mjs` recopie les commentaires dans les feuilles qu'il
fabrique. `critique.css` — qui est sur le chemin critique — passe de
**89,5 à 46,4 Ko**, et le poids total transféré avant peinture de
**344,1 à 230,9 Ko, soit −32,9 %**. Le LCP, lui, ne bouge pas de façon
mesurable : médiane des différences **−8 ms** sur 7 passes appariées,
étendue −100 à +28. Le bruit domine, et on ne conclut pas dessus. Chaque bloc laisse en place son **titre** et
son identifiant : le titre garde la navigation dans le fichier,
l'identifiant fait le lien dans les deux sens par un simple `grep`.

**Les blocs de 1 à 3 lignes restent.** Ceux-là expliquent le code juste
en dessous, et les séparer du code qu'ils décrivent coûte plus cher que
de les garder.

**L'invariant, et pourquoi il vaut mieux qu'une planche de captures.**
`tools/code-nu.mjs --comparer` rend le fichier privé de tous ses
commentaires, espaces normalisés. Les 15 fichiers touchés rendent
**IDENTIQUE** : le code n'a pas bougé. C'est une preuve d'équivalence,
pas un échantillon — une planche de captures ne montre que ce qu'elle
a photographié, cet invariant couvre tout le fichier.

**Ce que les pixels ont dit ensuite, et ce qu'il a fallu pour le dire.**
La première planche comparée rendait des différences partout, jusqu'à
3,52 % sur le hero. Contrôle obligatoire — deux passes du **même**
code : le même ordre de différences. `theme-check.mjs` photographie une
page qui bouge, il ne peut donc rien prouver. D'où
`tools/captures-fixe.mjs`, qui photographie en mouvement réduit avec
`content-visibility` levé. Son plancher de bruit, mesuré sur **sept
paires de code strictement identique** : **3 images sur 130**, toutes à
`768-sombre`. Sur les **127 stables**, avant contre après rend
**0 différence**.

**Et un faux départ qu'il faut consigner.** Le premier « avant » a été
servi sur le port 8098 — déjà occupé par un serveur d'une session
précédente. `node tools/serve.mjs 8098 &` a échoué en silence, `curl`
a répondu 200, et la comparaison portait sur une version du site
vieille de plusieurs chantiers : 2 539 px d'écart de hauteur de page,
trois sections « modifiées ». Rien de tout cela n'était vrai.
**Vérifier que le port est libre fait maintenant partie du piège 19.**

**`CLAUDE.md` devient un aiguilleur.** 1 114 lignes → moins de 200. Il
est chargé à chaque tour de chaque session : chaque ligne inutile s'y
paie des milliers de fois. Ce qui en sort part vers `PIEGES.md`,
`MESURES.md`, `RESERVES.md`, `DECISIONS.md` et les documents qui
existaient déjà.

**Le HTML n'est pas découpé, le CSS et le JS non plus.**
Voir la section suivante — c'est la décision la plus discutable du
chantier, et elle est argumentée.

**Les rapports de phase partent en archives.** Ils documentent des
états révolus ; les garder à la racine les met sur le chemin de
quelqu'un qui cherche l'état courant.

## Pourquoi les gros fichiers ne sont PAS découpés

Le brief demandait de trancher entre découper `index.html` en fragments
assemblés par un script, ou le laisser entier avec des plages de lignes
exactes. La réponse retenue vaut aussi pour `css/app.css` et
`js/main.js`, et voici le raisonnement.

**Le coût qu'on cherche à supprimer n'est pas la taille du fichier,
c'est le fait de ne pas savoir où regarder.** Un `Read` avec un
décalage et une longueur coûte exactement ce que coûte l'ouverture d'un
petit fichier. Ce qui coûte, c'est la lecture du fichier entier faute
d'index — et un index fiable règle ça sans rien déplacer.

**Après le retrait des commentaires, les fichiers ont maigri d'un
tiers.** `css/app.css` passe de 6 566 à **4 673 lignes** (270 → 164 Ko),
`index.html` de 4 054 à **2 903** (245 → 176 Ko), `js/main.js` de 3 423
à **2 329** (154 → 92 Ko), `js/langue.js` de 1 426 à **713** (65 →
27 Ko).

**Ce n'est pas assez pour lire un de ces fichiers en entier, et ce
n'est pas le but.** Le but est que la plage utile soit petite et qu'on
sache laquelle c'est. Le bloc 14 d'`app.css`, celui des Services, fait
maintenant **479 lignes au lieu de 867** ; la section `#services`
d'`index.html`, **278 au lieu de 489**. Ce sont ces plages-là qui se
lisent, et elles ont fondu de moitié.

**Un artefact fabriqué est une classe de bug, et le dépôt en a déjà
une.** `critique.css` et `differe.css` sont fabriqués, et le premier
piège documenté du projet est « éditer l'un des deux, c'est écrire du
CSS qui disparaîtra ». Ajouter des fragments HTML assemblés ajouterait
la même classe de bug **sur le fichier où elle est la plus dangereuse**
: `index.html` porte le **contenu**, et la règle de véracité impose de
`grep` un énoncé dans tout le document. Un document assemblé rend
possible qu'une correction de véracité vive dans le fragment et pas
dans la page servie.

**Ce qui est fait à la place** : `SECTIONS.md` porte pour chaque
section l'ancre, les fichiers et les **plages de lignes exactes**, et
`node tools/plages-check.mjs` vérifie que ces plages sont encore
justes. Un index périmé coûte plus cher que pas d'index ; un index
vérifié par machine ne périme pas en silence.

**Ce que cette décision coûte, honnêtement.** Un fichier de 2 763
lignes reste un fichier où l'on peut se perdre si l'index ment. Tout
repose donc sur `plages-check.mjs` et sur la discipline de le lancer.
Si cette discipline ne tient pas, la décision est mauvaise et il
faudra découper.


## 2026-07-31 · Services et Réalisations

### Cinq services, et la tête entre dans la scène

Le rail commençait par un écran vide et finissait sans finir. Les deux
défauts avaient la même cause : **rien ne remplissait la scène**.
L'en-tête vivait au-dessus, hors du bloc collant, et le rail visait
`k × pas` — une distance que le contenu ne pouvait pas parcourir.

- **La tête est descendue dans la scène collante.** À l'entrée, le
  visiteur voit le titre, le compteur et le service 01 en même temps.
- **La cible d'un cran est le CENTRE de l'élément, bornée à
  `[0, scrollWidth − clientWidth]`.** Le premier se cale à gauche, le
  dernier à droite, et rien ne se clampe en silence au milieu.
- **Un sixième élément ferme le rail** : « Et si le vôtre n'est pas
  là ? ». Ce n'est pas un service — d'où `role="none"`, pour que la
  liste continue d'en annoncer cinq.
- **La marge du rail se MESURE** sur le texte au lieu de se recalculer.
  `padding-inline: max(pad, (100% − maxw) / 2)` sur un `width:
  max-content` résout le pourcentage contre sa propre largeur : 2 199 px
  de marge fantôme, et le dernier service n'atteignait jamais sa place.

### Le panneau de détail sort du rail

Il s'affichait coupé parce qu'il était `position: fixed` **à
l'intérieur** d'un conteneur transformé et rogné : un ancêtre
transformé devient le bloc conteneur d'un descendant fixe, et
`.svc-vitre` a `overflow: hidden`. Les cinq fiches vivent maintenant
hors de la piste. Sans script elles sont cinq articles empilés et lus ;
avec script, un calque `role="dialog"` avec Échap, clic dehors, verrou
de défilement et retour du focus au bouton d'ouverture.

### Le service 05 se dessine, il ne se capture pas

Le brief demandait des captures floutées de l'outil d'estimation. Les
schémas 2D et 3D sont **redessinés en SVG**. Trois raisons, dans cet
ordre : une capture floutée sur un site qui interdit le flou est une
contradiction que le visiteur voit ; les captures les plus utilisables
portent le vocabulaire du métier du client **dans leurs pixels**, donc
flouter le nom ne suffit pas ; et un dessin pèse 4 Ko au lieu de 300.
Aucun nom, aucun secteur, aucune mesure du projet réel.

### Quatre comparaisons, quatre échecs DIFFÉRENTS

Quatre fois le même vieux site aurait fait un seul argument répété.
Chaque « avant » échoue autrement : un site de 2011 en tableaux ; une
fiche d'annuaire spécialisé où l'entreprise est noyée parmi seize
concurrents ; une fiche d'office de tourisme sans horaire ni menu ni
réservation ; et — le plus utile — **un gabarit acheté en 2019, qui
n'a pas l'air vieux et ne répond quand même pas**. C'est celui-là qui
parle au patron qui pense « j'ai déjà un site ».

Le quatrième porte l'outil d'estimation du service 05 : c'est la seule
des quatre qui démontre une capacité que les autres ne montrent pas,
et elle referme la boucle entre Services et Démonstrations.

### Le repos du curseur est 50 %, et c'est une décision

La recherche est nette sur un point : un curseur est un contrôle caché,
et le visiteur qui ne le bouge jamais repart en croyant qu'il n'y a
rien. Au repos, le partage est donc **moitié-moitié** — l'écart se voit
sans un geste, et la poignée n'est qu'un bonus. Sans script, elle est
retirée : rien d'inerte à tirer.

### Ce qu'on MONTRE peut être mauvais ; ce qu'on FAIT, non

Les quatre reconstitutions ont un mauvais contraste : **c'est leur
sujet**. Elles se déclarent `role="img"` avec une légende, et
`theme-check` les exclut **en disant combien** (6 820 éléments). La
moitié « après », elle, reste au budget — et deux échecs réels y ont
été corrigés.

### « Projets » promettait des mandats livrés

Le libellé de navigation est devenu **« Démonstrations »**, partout, en
une fois. Un visiteur qui clique « Projets » attend du travail
commandé ; il trouvait quatre maquettes d'entreprises fictives.

---

# 2026-07-31 · REFONTE IMMERSIVE — L'ARC, LES SAS, LA CHAMBRE NOIRE

Conception et périmètre : `REFONTE-IMMERSIVE.md`. Branche
`refonte-immersive`, retour arrière `git switch main` (étiquette
`avant-immersif`, copie disque datée à côté du dépôt).

| Décision | Raison |
|---|---|
| **Trois sas, pas douze** | douze sas seraient les « douze séparateurs » ; le calme entre les sas est ce qui les rend grands |
| **Un seul arc de luminance** | trois bandes d'encre dispersées racontaient trois petites histoires ; la bande du seuil 02 est partie (D-570) |
| **La chambre noire = jetons du thème opposé** | aucune paire de contraste inventée — chaque couple est déjà audité dans l'autre thème (D-572) |
| **Le moment impossible réutilise la limaille** | une seule idée déclinée devient une signature ; un second moteur aurait été un gadget (D-575) |
| **La remontée est un calque, pas une piste** | la version piste rendait des écrans vides mesurés à 0 % d'écart ; un sas qui n'a rien à montrer est du défilement volé (D-568) |
| **`sas-ok` décidé dans le `<head>`** | une hauteur de piste posée après coup faisait sauter les ancres de 1 700 px (D-581) |
| **Le contrat d'arrivée est le rail lui-même** | « scroll to explore » est le cliché que toutes les références bannissent ; montrer les douze stations EST le contrat (D-584) |
| **Les seuils des sas se repèrent par `data-vers`** | le repère par structure DOM vient de périmer ; celui par sélecteur ne périme pas (D-578) |
| **Les ancres se visent en re-mesurant sur place** | défaut ANTÉRIEUR au chantier (2 474 px d'écart sur la copie témoin) ; `content-visibility` reste la cause, non corrigée — le correctif vise le symptôme, honnêtement (D-583) |

Corrigés en passant : les `contain-intrinsic-size` périmés de près de
2 900 px (D-580) ; l'appât du calculateur écrasé en colonne d'un mot
(D-585). Pièges nouveaux : 33 (base pixel de GSAP sous `yPercent`) et
34 (hauteur c-v mesurée à l'écran).

Chiffres après chantier, machine de bureau, 1440×900 : LCP **192 ms** ·
CLS **0** · traversée complète **60 i/s pile, 0 image > 20 ms sur
763** · ancres `#visite`/`#calculateur`/`#contact` à **88 px pile**
(le `scroll-padding`) · cascade **0 écart sur 354 112 propriétés** ·
console **0**.
