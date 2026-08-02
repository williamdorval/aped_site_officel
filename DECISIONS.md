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

---

## 2026-07-31 · MISE EN PRODUCTION — D-586 à D-625

Quatre chantiers, et une seule règle : **ce qui se regarde se prouve
par une image, pas par un chiffre.** Les preuves sont dans `preuves/`,
un dossier par chantier, avec le `rapport.json` qui les accompagne.

### La forge du sas — D-586 à D-592

| ID | Décision |
|---|---|
| D-586 | La chambre noire sort des deux thèmes. Jetons `--chambre-*`, encre à pleine concentration `#060807`, un seul jeu pour les deux réglages. **Un lieu sombre qui blanchit quand on éteint la lumière n'est pas un lieu sombre**, et un arc de luminance qui s'inverse avec le thème n'a plus de direction |
| D-587 | La limaille tombe, PUIS s'aligne. Deux mouvements séparés au lieu d'une convergence en droite ligne : la chute donne un banc, l'alignement latéral en tire les lettres. L'ancienne version bougeait 1,79 % des pixels entre deux images — un moment qu'on ne remarque pas n'existe pas |
| D-588 | Les trois temps ne mordent plus l'un sur l'autre. Le vrai mot était posé à 0,86 pendant que la limaille peignait jusqu'à 0,94 : elle griffonnait par-dessus un texte déjà peint |
| D-589 | `scrub: 0.45` au lieu de `true`. Mesuré à la rafale de molette : **26 images figées sur 71 et des bonds de 44,5 px**, contre 2 sur 68 et 23,6 px. Le problème n'a jamais été le nombre de grains — 60 i/s dès le départ |
| D-590 | La scène EST déjà la colonne. Le fil écartait le rail une seconde fois : mot centré à 868, fil à 992 |
| D-591 | Pas de rognage sur la scène de la descente : l'arête vit hors de la plaque |
| D-592 | **Le balayage du volet est supprimé.** Il se jouait entièrement hors écran — la scène collante n'est épinglée qu'à partir de 100vh de course, et à p = 0,20 le bord bas du volet était 64 px SOUS la fenêtre. La plaque est déjà là et c'est le visiteur qui descend dedans, ce qui est la définition exacte de V1 |

### Services — D-595 à D-600

| ID | Décision |
|---|---|
| D-595 | La planche ne remplit plus la vitre. Elle l'étirait, et comme le corps de la carte est collé en bas, tout l'excédent s'empilait en vide au-dessus du titre. Écart filet → nom : **32 px**, le gap déclaré |
| D-596 | Le panneau de clôture s'inscrit dans la même grille : largeur d'une carte, rangée 1 réservée sur un filet léger. Il n'avait pas de numéro, donc son corps se plaçait en rangée 1 — collé en haut, à l'opposé des cinq autres |
| D-597 | Zone morte de 18 % à 10 %, pas vertical à 400 px. La pente maximale tombe de 2,34 à 1,79 fois la moyenne |
| D-598 | La marge de fin du rail devient la gouttière de centrage : la dernière carte se calait 222 px à droite de toutes les autres |
| D-599 | Le rail rattrape sa cible sur le rythme d'affichage. Même cause que la saccade du sas, même correctif |
| D-600 | *(sonde)* la position de repos se vise à `haut − collant + course × p`. Oublier le `collant` décale de 5,3 px et fait condamner un centrage sain |

### Les cinq panneaux — D-601 à D-609

| ID | Décision |
|---|---|
| D-601 | Trois classes de remplissage ajoutées au vocabulaire du schéma 05, et rien d'autre |
| D-602 | Le renvoi du panneau 01 porte le DESSIN de ce qu'on va voir : une page coupée en deux par le filet minium |
| D-603 | Le service le plus abstrait reçoit le seul visuel animé du lot. Quatre stations nommées en français de tous les jours, une pièce de minium qui les parcourt, chaque station cochée d'un CRAN |
| D-604 | Palier 2 et 3 : la course s'arrête, les quatre marques restent. `!important` — piège 16 |
| D-605 | L'affiche du panneau 03 est la VRAIE première image du lecteur installé plus bas |
| D-606 | Deux écrans dessinés pour le 04, au vocabulaire du 05. Redessinés, jamais capturés : une capture d'un logiciel livré serait la preuve d'un mandat qu'on ne peut pas montrer |
| D-607 | `data-tour-pret` : `tour360.js` arrive en vague 2, un `.click()` envoyé avant frappe un bouton sans écouteur et ne fait rien, en silence |
| D-608 | Les images-clés qui n'animent qu'un panneau ouvert au clic quittent le chemin critique. Liste EXPLICITE, jamais un préfixe |
| D-609 | Le vocabulaire du dessin ne vit plus sous une seule boîte. Vu à la capture : un `p2-plaque` sans règle rendait en NOIR PLEIN et ne levait aucune erreur |

### Réalisations — D-593, D-594, D-610 à D-621

| ID | Décision |
|---|---|
| D-593 | **Le glissement est piloté au pointeur.** Un vrai `mouse.down` + huit `mouse.move` laissaient `--ba-p` à 50 du début à la fin. Le champ `input[type=range]` est étiré sur toute la scène mais sa piste n'a aucune hauteur |
| D-594 | Au doigt, le premier déplacement tranche : horizontal on compare, vertical la page reprend la main |
| D-617 | **L'après est une capture du vrai site.** Les quatre maquettes redessinées portaient des rectangles gris à la place des photos, dans la section dont le sujet est la preuve. 426 lignes de CSS mort partent avec elles |
| D-619 | Une image est glissable par défaut : `pointercancel` annulait le geste dès le premier déplacement |
| D-621 | Les temps d'arrêt de la boucle passent de 9 % à 5 % : l'après est une image fixe maintenant |
| D-610 à D-616, D-618, D-620 | Sept pièges de la capture, tous écrits dans `tools/demos-capture.mjs` avec leur relevé. Voir `PIEGES.md` § 38 à 40 |

### La passe de production — D-622 à D-625

| ID | Décision |
|---|---|
| D-622 | Le calendrier ouvre sur le premier jour RÉSERVABLE. Un 31 du mois, il ouvrait sur quarante et un jours grisés |
| D-623 | Les écouteurs se demandent au moteur, pas à une heuristique d'attributs : quatre faux verdicts sur quatre |
| D-624 | Ce qui reste sans écouteur détectable **se fait cliquer**. La question posée est « est-ce que ce bouton mène quelque part » : c'est par le clic qu'on y répond |
| D-625 | Ce qui tombe au palier 1 reste tombé aux paliers 2 et 3. Le sélecteur ne visait que « 1 », et l'animation permanente se remettait à tourner sur la machine la plus serrée des trois |

### Le cadre navigable — D-628 à D-639

Chantier du 2026-07-31, section 03 · Réalisations. Arbitrages du
propriétaire : les blocs gris sont des placeholders, il faut les
remplir ; les chiffres des démonstrations restent ; le texte
descriptif part — « les gens ne lisent pas, ils regardent ».

| ID | Décision |
|---|---|
| D-628 | Le cadre devient un petit écran : barre d'adresse, page dedans, et le visiteur descend lui-même. La boucle automatique disparaît — la main du visiteur fait mieux, et c'est une animation permanente de moins au budget des paliers |
| D-629 | Le champ `range` ne prend plus le pointeur. Étiré sur toute la scène, il captait la molette, qui cherchait alors un conteneur défilant parmi SES ancêtres et remontait à la page |
| D-630 | Deux comparaisons par rangée, largeur bornée, grille centrée. Elles prenaient toute la colonne et le rythme vertical agressait |
| D-631 | Les quatre sites sont rephotographiés à **1 280 px**, la largeur d'un écran de bureau. 760 px était la largeur d'une tablette : réduite dans un cadre de 460, cette mise en page se lit comme un gros plan. Ça ne se corrigeait pas en recadrant |
| D-632 | La pile est une grille d'une seule case : la rangée prend la hauteur du plus grand des deux. Sans ça, `scrollHeight − clientHeight` valait 0 et la vitre n'avait rien à faire défiler. Voir `PIEGES.md § 43` |
| D-633 | On coud une image par fenêtre au lieu d'un `fullPage` : une scène épinglée rendait 1 500 px de blanc. Recouvrement de 20 %, et un trou arrête l'outil. Voir `PIEGES.md § 44` |
| D-634 | Les vingt-quatre blocs photo des reconstitutions portent de vraies photographies, tirées de colonnes de tuiles — une requête pour six vignettes. Licences dans `tools/avant-photos.mjs`. La bande des partenaires reçoit une silhouette, pas un faux logo |
| D-635 | Le contournement `fixe: true` de `restau` tombe : le défaut qu'il évitait n'existe pas. Voir `PIEGES.md § 46` |
| D-636 | `overscroll-behavior` repasse à `auto` sous `pointer: coarse`. `contain` est juste à la molette et faux au doigt : sur un téléphone le cadre occupe presque toute la largeur, et le pouce y reste coincé |
| D-637 | La mention passe toujours à la ligne sous le titre, et le cadre monte à 33 rem au-delà de 90em. Deux légendes de longueurs différentes désalignaient les deux cadres d'une rangée par le bas |
| D-638 | Les étiquettes AVANT / APRÈS vivent dans la barre d'adresse. Posées dans les coins de la scène, elles couvraient la barre de navigation des deux sites — dont le bouton d'appel à l'action du site neuf, sur les quatre comparaisons |
| D-639 | `contraste-min.mjs` s'arrête aussi sur un `background-image` et rend « non calculable ». Il annonçait 1:1 sur du texte mesuré à 6,65:1 aux pixels peints. Voir `PIEGES.md § 45` |
| D-640 | Au doigt, les deux gestes se disputent le même rectangle et ils ne peuvent pas gagner tous les deux. On tranche par la **surface** : la colonne de la poignée compare (`touch-action: none`), tout le reste du cadre défile. Sans ça, la vitre revendique le geste dès le premier déplacement — `pointercancel`, poignée figée à 42 % après un seul pas |
| D-641 | La prise de la poignée s'allume sous `any-pointer: coarse` (pas `pointer: coarse` — un portable tactile annonce un pointeur primaire fin), et `main.js` renvoie la molette posée dessus à la vitre. Le filet vit dans la scène, pas dans la vitre : sa molette faisait descendre la **page**, et les cinq écarts de la descente sont tombés à 0,00 % |
| D-642 | Seule la **première séquence tactile d'une page** aboutit sous Playwright. Le défaut suit le rang, pas la comparaison — vérifié dans les deux sens. `realisations-check` ne juge donc plus que la première ; `tools/ba-doigt.mjs` prouve les quatre, une page neuve chacune |

### Les cadres navigables — D-643 à D-647

Chantier du 2026-07-31, deuxième passe. Trois défauts signalés par le
propriétaire, tous vus à l'écran et invisibles au code, et **les trois
venaient de décisions prises la veille**.

| ID | Décision |
|---|---|
| D-643 | Les quatre « après » sont photographiés **entiers**, jusqu'au pied de page — 10 795 · 10 934 · 11 687 · 6 711 px. D-632 les coupait au rapport de la reconstitution d'en face : on montrait 14 % du site du garage, et le visiteur se bloquait au pied du site de 2011 |
| D-644 | Une scène épinglée ne se met pas à plat : à une hauteur donnée elle n'a qu'un seul état horizontal. Elle est photographiée **image par image** sur toute sa course, empilée en planche, et le défilement du visiteur choisit laquelle montrer. La capture distingue un élément fixe **dès le sommet** — barre du site, à masquer — d'un élément qui **devient** fixe plus bas : celui-là est une scène, et il se rejoue |
| D-645 | Les deux côtés défilent en **pourcentage**, pas en pixels. Deux pages de hauteurs très différentes ne peuvent pas partager une course en pixels sans que la plus grande soit plafonnée par la plus petite. La vitre ne contient plus qu'une piste vide ; les deux pages sont posées par-dessus et translatées chacune de sa fraction |
| D-646 | Tout est calculé en `cqw` — centièmes de la largeur du cadre. Rien n'est à recalculer quand la fenêtre change, et **la même valeur sert au cadre en grille comme au cadre agrandi** |
| ~~D-647~~ | **RETIRÉE le 2026-07-31 (D-650)** — le propriétaire n'en veut pas. Ce qui suit reste écrit pour que personne ne la réinvente en croyant qu'elle manquait : le cadre agrandi **était le même cadre, déplacé**. Une copie aurait doublé le markup, doublé les images servies et laissé deux états qui divergent au premier glissement. Un trou de la même hauteur garde la place dans la grille, sinon la page saute sous le visiteur |

### Les tuiles — D-648 et D-649

Chantier du 2026-07-31, régression signalée : le texte alternatif à la
place des quatre sites « après ».

| ID | Décision |
|---|---|
| D-648 | Chaque capture « après » est **découpée en tuiles de 1 100 px**. Une image de 6 916 px arrive tout d'un coup ou pas du tout, et pendant le « pas du tout » le navigateur peint son texte alternatif dans une boîte de 3 863 px. La description quitte les images et passe sur la vue en `role="img"` — un `alt` vide ne peut plus remplir l'écran |
| D-649 | `ba-check § 9` exige que **chaque** image charge : `complete`, `naturalWidth > 0`, dimensions rendues non nulles — et les fonds CSS du côté « avant » sont demandés un par un. Prouvé en retirant deux fichiers : le test les nomme tous les deux |

### Le retrait de la loupe — D-650

| ID | Décision |
|---|---|
| D-650 | La loupe est retirée en entier : le bouton, le dialogue, le trou qui gardait la place, les règles de la vue agrandie, le pilote de `main.js` et les deux sections de test. Elle marchait et elle était prouvée ; elle n'était pas voulue. Vérifié après coup : la poignée atteint toujours 2 / 50 / 98 %, les quatre cadres gardent leur course et descendent jusqu'au pied du site neuf |

### Le mouvement latéral continu — D-651 et D-652

| ID | Décision |
|---|---|
| D-651 | Une scène épinglée n'est plus rejouée en **dix vues** — un saut tous les 240 px, un diaporama — mais en **deux couches continues** : le fond de la scène, et la piste qui glisse par-dessus, translatée. La mesure a tranché : dans les deux scènes, **un seul élément translate**, purement à l'horizontale, pendant que rien ne bouge verticalement. Une translation n'a pas de pas, donc elle ne peut pas sauter. Le poids des deux scènes tombe de 493 Ko à 96 Ko |
| D-652 | Un fichier de sortie qui n'est plus produit est **effacé** par l'outil qui le produisait. Deux planches abandonnées quand les scènes sont passées en piste continue sont restées sur le disque, plus référencées, et gonflaient la section de 505 Ko sans que rien ne le dise |

### Le retard d'une image — D-654

| ID | Décision |
|---|---|
| D-654 | Les deux translations du cadre sont écrites **dans l'événement `scroll`**, plus dans un `requestAnimationFrame`. Mesuré avant : sur 18 images où le défilement avançait, le contenu suivait dans la même image **0 fois**. Après : 0 % de retard. Un `scroll` est distribué avant la peinture ; l'étaler sur une image faisait traîner la pile derrière la barre, et une couche en retard par-dessus une image fixe se lit comme du contenu superposé |

### Les photos des sites de secteur — D-655 à D-659

Chantier du 2026-07-31. Les aperçus de secteur montrent de vrais sites
complets ; encore faut-il que les photos qu'ils portent tiennent les
quatre questions.

| ID | Décision |
|---|---|
| D-655 | Un aperçu de secteur défile **nativement** (`overflow-y: auto`), sans une ligne de script. La section 03 verrouille DEUX pages en pourcentage et a besoin d'un pilote ; ici il n'y a qu'une page. Le défilement natif se fait sur le compositeur, donc sans le retard d'une image de D-654 |
| D-656 | Une photo se choisit **en la regardant à sa taille réelle**, jamais sur le nom du panorama ni sur une planche-contact. Trois sources écartées après coup portaient une marque imprimée lisible. Un `object-position` de la page ne recadre pas le fichier : il ne sauve rien. Piège 57 |
| D-657 | Une photo qui **contredit le texte du site** ne se pose pas, même si elle est belle et libre de droits. Le site de construction écrit « on ne fait pas de commercial » : le hall industriel et le mur nu restent produits, licenciés, et **posés nulle part** |
| D-658 | **Une adresse, une photo qui n'appartient qu'à elle.** Le site d'immobilier annonçait dix propriétés avec quatre photos reprises seize fois, et la même image portait des légendes qui se contredisent — « terrasse DEVANT la maison » ici, « cour ARRIÈRE » là. Q1 tombe, et ça se voit à l'œil nu en descendant la page. Corollaires tenus : le **type** de la façade suit la fiche (pas de maison à étages sur un « plain-pied »), l'**état** suit le prix (pas de ruine à 875 000 $), et le **voisinage** suit le texte (pas quatre rangées de maisons sous « sans voisin arrière »). Seule reprise assumée : la photo du salon sert deux fois, fiche et visite 360 — c'est la même pièce, les deux légendes le disent, et les repères de la visite doivent pointer sur ce qu'on y voit |
| D-659 | La couseuse de captures ne demande plus à un élément ce qu'il **déclare** (`position: fixed`), elle mesure ce qu'il **fait** : trois relevés de sa position dans la fenêtre, tous pris après le point de colle. Une barre `sticky` s'imprimait en plein milieu d'une capture de 17 829 px. `--port` s'ajoute aux projets statiques pour que le numéro du serveur de session ne soit plus écrit en dur dans la table. Pièges 58 et 59 |

### Les douze secteurs au standard — D-660 à D-662

Chantier du 2026-08-01. Les deux premiers sites de secteur ne tenaient
pas la comparaison avec les trois références du dépôt. La barre a été
relevée à l'image, écrite en chiffres, et les douze secteurs refaits ou
écrits contre elle.

| ID | Décision |
|---|---|
| D-660 | **`demos-secteurs/STANDARD.md` est la barre, et elle est mesurable.** Héros 90-160 px avec un interlignage sous 1 · **aucun palier entre le titre de section et le texte de 14-15 px** · un seul accent, réservé au bouton principal, aux micro-libellés et aux chiffres · cases d'image de 400 à 700 px · 110 à 170 px de padding · jamais deux fonds identiques à la suite · **un dispositif de signature qui revient quatre à cinq fois**. Ce qui faisait échouer les deux premiers : le plus gros titre faisait 34 px, il n'y avait aucune photographie plein cadre, sept tableaux, aucun dispositif récurrent, et la même sans partout. Une taille `xl` (1920×1080) s'ajoute aux tirages : sur une fenêtre de 1280 en densité 1,5, une image de 1280 est demandée à 1920 px réels et arrive floue |
| D-661 | **Douze familles de polices sont téléchargées UNE fois dans `fonts/demos/`**, toutes sous SIL OFL 1.1, licences relevées. Une par personnalité : douze sites qui partagent une police sont un gabarit décliné douze fois. Aucune page ne parle à `fonts.googleapis.com` — la règle « zéro requête tierce » ne fait pas d'exception pour les polices |
| D-662 | **Un outil qui écrit un registre ne doit jamais l'écraser sur une passe partielle.** `secteurs-sites-photos` réécrivait `_licences.json` avec les seuls secteurs demandés : douze secteurs sourcés un par un, et à la fin le fichier ne contenait plus que le dernier — sept lignes sur quatre-vingt-quatre. Rien ne le disait, le fichier était bien formé. Une licence effacée ne se remarque qu'au moment où quelqu'un la demande. Le registre est maintenant fusionné sur une passe partielle et trié |

**LA RÈGLE QUI A COÛTÉ LE PLUS CHER, ET ELLE EST TOMBÉE CINQ FOIS.**
Un `object-position`, un voile, une bande étroite : ce sont des
réglages de **mise en page**. Ils cachent une marque du rendu et la
laissent **dans le fichier**. Au premier changement de gabarit, elle
revient. Cinq images ont été refaites **à la source** pour cette seule
raison — une enseigne de salon, un mot peint sur un mur de gym, un
numéro civique, une collection éditoriale sur des dos de reliures, un
nom de fabricant sur deux boîtes à lumière.

**Chaque métier a son piège, et il n'est jamais le même :** la marque
est **imprimée** sur un matériau de construction, **moulée** dans un
disque de fonte, **gravée** sur le prisme d'un boîtier, **légendée** sur
la bordure d'un négatif ; en coiffure elle est partout parce qu'un
salon est un mur de produits ; en hôtellerie le piège n'est pas la
marque mais le **climat** ; en clinique c'est le **visage**, parce
qu'un visage dans une salle d'attente est une donnée de santé.

---

## Les douze secteurs, chacun son identité — 2026-08-01

Les neuf sites écrits ici étaient **le même document en neuf
couleurs** : sections numérotées `01`→`10`, filets de 1 px,
micro-libellés mono, encre et accent chaud, tableaux. L'identité
d'APED avec d'autres mots. Une section qui doit prouver qu'on sait
faire n'importe quel style prouvait exactement l'inverse.

| ID | Décision |
|---|---|
| D-663 | **Aucun site de secteur ne porte l'identité d'APED**, et les interdits d'APED — rayon 0, aucune ombre, aucun dégradé, aucun flou — **ne s'appliquent PLUS à l'intérieur d'un site de secteur.** Ils sont là pour montrer notre étendue. La clinique est le seul site à coins arrondis et à ombres douces, et c'est ce qui la rend reconnaissable à trois mètres. Le site APED, lui, les garde tous |
| D-664 | **Les douze directions artistiques s'écrivent ENSEMBLE, avant de coder** — `demos-secteurs/DIRECTIONS.md`. Une DA ne se juge pas seule : elle se juge à côté des onze autres. Le document porte la carte des collisions surveillées (deux sombres froids, deux clairs chauds, deux clairs froids) et dit comment chacune est tenue. Trois des douze sont des projets réels et portent déjà de l'orange : **aucun des neuf autres n'y a droit** |
| D-665 | **Le mouvement se fait en CSS pur, et le `<script>` reste à zéro.** `animation-timeline: view()` et `scroll()` donnent des révélations au défilement, des parallaxes, des compteurs qui roulent et des barres qui se remplissent sans un octet de JavaScript. Une page sans script ne peut pas avoir d'erreur console, et son mouvement tourne sur le compositeur. Chaque site a **son** langage : masque qui monte au salon, volet depuis le centre à l'immobilier, colonne par colonne au cabinet, cote qui se trace au chantier, fondu long et rien d'autre à la galerie |
| D-666 | **`animation-fill-mode: forwards`, jamais `both`.** Avec `both`, tout ce qui est sous la ligne de flottaison garde son état de départ — `opacity: 0` — et une capture pleine page rend la moitié du site VIDE. Aucune sonde ne le voit : le DOM est complet, les images sont chargées, le texte est là, il est seulement transparent. Deux sessions sont tombées dessus séparément. Piège 64 |
| D-667 | **`tools/demos-controle.mjs` vérifie ce qu'une capture ne montre pas** : prix affiché, `<script>`, requête tierce, `noindex`, mention de démonstration, `@keyframes` présentes, dimensions sur chaque image, erreurs console, débordement de 320 à 1920. Il a trouvé un gym sans `noindex` et **cinquante-quatre prix répartis sur huit sites**, alors que l'interdit était écrit depuis le premier jour. `tools/demos-contraste.mjs` s'y ajoute : neuf palettes écrites à la main, un accent qui passe sur un fond ne passe pas forcément sur l'autre |
| D-668 | **Atelier Lumen change de métier plutôt que de mentir.** Le site annonçait « portrait d'entreprise, architecture, produit » et ne montrait que du matériel de studio. Aucune source libre ne donne un portrait sans visage identifiable ; annoncer une prestation de portrait sans une seule image de portrait est une fausseté par omission. L'atelier fait désormais de l'architecture, de l'intérieur et de l'objet — trois pratiques qui se photographient sans personne dedans — et huit œuvres s'ajoutent |
| D-669 | **Le Cabinet Vallières garde ses cinq photos, et c'est une décision.** Trente-quatre candidats regardés pour en ajouter, aucun retenu : un rayon de bibliothèque est un mur de marques (titres lisibles, logos d'éditeur, codes à barres, un portrait de personne réelle en couverture), les salles de réunion libres sont meublées en orange, les stores d'ordinateur n'ont pas de sujet. Une page de quotidien porte peu d'images et beaucoup de texte. **« On n'invente jamais du contenu pour occuper de l'espace » vaut aussi pour les images** |
| D-670 | **La ligne « pas de colonnade » est levée et réécrite.** Elle interdisait la colonnade parce qu'un avocat photographié devant des colonnes est le cliché du métier. Quatre des cinq photos disponibles SONT de l'architecture classique. Ce qui a été retenu : une colonnade en duotone bordeaux tramé n'est plus un cliché de cabinet, c'est un ornement de une — à condition que la légende dise que ce n'est pas le bureau. **La ligne interdit l'homme devant les colonnes, pas la colonne** |
| D-671 | **Le premier écran de la boutique passe au céladon.** Sur la planche des douze, la boutique et le salon de coiffure étaient la paire la plus proche : deux clairs chauds, un serif d'affichage en bas de casse à gauche, un bouton noir. Le reste diffère — index en mono contre photographie pleine hauteur, argile contre blanc pur — mais la première impression était la même famille. Le héros prend donc l'émail : aucun des douze n'a de premier écran vert, et la signature du site (« le fond change d'émail au défilement ») se voit dès l'ouverture au lieu d'attendre le troisième écran. L'oxyde des codes y tombant à 2,79:1, il passe à l'encre sur ce seul écran |

---

## De 7/10 à 10/10 — 2026-08-01, seconde passe

Les douze existaient, distincts, véraces. Le client a rendu 7/10 et
levé la contrainte que la première passe s'était imposée.

| ID | Décision |
|---|---|
| D-672 | **L'aperçu du panneau devient VIVANT.** Un aperçu figé ne prouve pas qu'on sait animer, et c'est le cœur de ce que la section vend. Trois solutions pesées : une vidéo par secteur (2 à 3 Mo chacune, à refaire à chaque retouche, et ce serait un ENREGISTREMENT — la section vendrait une capture d'écran de sa preuve) ; rejouer les animations en miniature (une reconstitution, donc un faux) ; un `<iframe>` de même origine, **le seul des trois qui montre la chose elle-même**. La planche de captures reste le POSTER : texte de remplacement, géométrie, clavier, lecteurs d'écran, tactile, et tout palier au-dessus de zéro. Elle est aussi le seul aperçu des trois projets réels, qui vivent hors du dépôt |
| D-673 | **Le vivant est borné, et chaque borne est mesurée.** Un seul cadre à la fois, créé au premier survol du panneau — donc après le LCP, relevé à 152-156 ms — et détruit dès que le pointeur sort. 320 ms de délai avant de charger : un balayage des treize pastilles fait 60,1 i/s et **ne demande RIEN au réseau**. `inert` : une page de démonstration porte une trentaine d'arrêts de tabulation, et les laisser entrer dans le fil de l'accueil serait un piège de focus déguisé en démonstration ; le vivant disparaît dès qu'un focus clavier arrive |
| D-674 | **Le JavaScript est autorisé dans les sites de secteur. GSAP aussi, AUTO-HÉBERGÉ.** « Zéro script » était un plafond de qualité et il s'était vu : le surlignage cyan déclaré impossible, `timeline-scope` qui demande Chrome 116 quand `animation-timeline` demande 115. Ce qui ne bouge pas : zéro requête tierce — un CDN reste une requête tierce même quand il sert la bibliothèque qu'on a déjà sous la main — zéro erreur console, et **rien de nécessaire à la lecture ne dépend du script** : `demos-controle.mjs` recharge chaque page JavaScript coupé et exige 85 % du texte. Le site APED, lui, garde tous ses interdits |
| D-675 | **La recherche passe AVANT le code, et elle se mesure.** Les douze directions artistiques avaient été inventées ; c'est ce qui leur manquait le plus. `tools/refs-galerie.mjs` sort les liens sortants d'une galerie de sites primés, `tools/refs-releve.mjs` ouvre une référence, la défile À LA MOLETTE et dépose sept captures prises pendant que les révélations se jouent, plus un relevé : polices, taille et interlignage du `h1`, paddings, fonds dominants, bibliothèques d'animation, **nombre d'images de plus de 380 px**. Trois références retenues par métier, et pour chacune ce qu'on lui prend et ce qu'on écarte |
| D-676 | **La leçon la plus contre-intuitive vient de la santé.** Cascaid Health, primé, n'a que **trois images de plus de 380 px sur 17 455 px de page**. Un site de santé ne remplit pas sa largeur avec des vignettes, il la remplit avec des FORMES et du TYPE. C'est ce qui a réparé « il a l'air vide » : un champ d'anneaux concentriques, une seule grande chose par section, une rangée de nombres géants, et des pastilles d'annotation posées SUR la photographie — elles nomment ce qu'on y voit et remplissent une image sans rien inventer |
| D-677 | **Le surlignage des arêtes se fait au `<canvas>`, et le seuil se CALCULE.** Luminance Rec.709, deux passes de flou — une seule laissait le feuillage allumer 14,7 % des pixels —, Sobel, **suppression des non-maximums** (sans elle le Sobel rend une bande de 3 px agrandie, et ça ressemble à un néon, pas à un trait de dessin), seuil par histogramme pour que chaque planche reçoive la même quantité de trait : 3,0 à 3,2 % sur les douze, du héros en plein soleil au mur de gypse blanc |
| D-678 | **Le rail latéral plein écran est un mauvais dispositif quand l'aperçu est une capture.** Il ne montrait qu'une œuvre sur onze, et l'aperçu du panneau EST une capture : six septièmes du site étaient invisibles pour qui ne clique pas. L'accrochage devient vertical, onze œuvres toutes visibles. Le mouvement latéral n'a pas disparu, **il est passé DANS les œuvres** : trois bandes portent une image 114 % plus large que leur cadre, qui panoramique au défilement sans épinglage — donc aucune course vide dans le flux, et le cadre reste couvert à toute progression, y compris à zéro |
| D-679 | **Le correctif d'une répétition n'est pas toujours dans ce qui se répète.** Dix propriétés en alternance gauche/droite se réparent AVANT les planches : un registre triable de dix lignes ouvre le catalogue, le compte est acquis, et les planches peuvent alors changer d'échelle sans qu'on se perde. Sept formes, aucune deux fois de suite, zéro alternance |
| D-680 | **Trois gestes, trois échelles.** La même règle vaut pour une section de trois : trois rangs de même poids sont la mise en page d'un article. Une bande de 21/9 pleine largeur, une photographie en colonne étroite sous un texte large, un détail carré calé à droite |

## UN ÉCRAN, PAS UN SITE — 2026-08-01, troisième passe

La seconde passe avait construit **neuf sites complets**, jusqu'à
17 000 px de haut. Le client a repris la commande : ce n'est pas ça
qu'il fallait. L'aperçu du panneau montre **un écran**. Tout le reste
était de l'effort dépensé là où personne ne regarde, et pendant ce
temps le premier écran — le seul qui compte — restait à 5 sur 10.

| ID | Décision |
|---|---|
| D-681 | **Un métier = un premier écran, arrêté.** Plus de page longue, plus de capture par tuiles, plus de couture, plus de défilement dans l'aperçu. Cent pour cent de l'effort d'un site entier va dans 1440 × 900 px. Ce n'est pas un renoncement, c'est ce qui rend le niveau des références atteignable : les neuf pages longues étaient neuf fois « correct », et « correct » ne se vend pas à côté d'un site primé. Les neuf pages sont dans `archives/2026-08-01-sites-longs/`, avec la liste de ce qui reste en service |
| D-682 | **Ce qui survit aux pages longues, et pourquoi.** Les **polices** (`fonts/demos/`, 20 familles SIL OFL, licences relevées) et les **photographies** (`images/secteurs-sites/`, ouvertes une par une en pleine résolution, licences documentées, deux marques imprimées attrapées à la loupe) sont du travail qui ne se refait pas. Les **palettes et pairings** de `DIRECTIONS.md` entrent comme matière première dans les nouveaux plans, **pas comme verdict** : la recherche passe avant, et elle peut les contredire |
| D-683 | **La cause du « ça a l'air d'une loupe » : on capturait dans une fenêtre étroite.** Les tuiles du panneau étaient photographiées à **760 px de large** puis affichées dans un cadre de 421 px — donc à 0,55 fois une mise en page déjà tassée pour tablette. Tout paraissait énorme parce que tout l'ÉTAIT : à 760 px, un site rend ses caractères et ses gouttières proportionnellement plus gros. Le correctif n'est pas de réduire l'image, c'est de **capturer large** : 1440 × 900, la fenêtre d'un vrai bureau, réduite ensuite à 0,29 dans le cadre. Le texte courant tombe sous 5 px et **c'est voulu** — c'est ce à quoi ressemble un moniteur posé à trois mètres |
| D-684 | **Le cadre perd son `aspect-ratio: 4/3`.** Il l'avait parce que les tuiles défilaient : la hauteur était arbitraire, il fallait bien en choisir une. Avec une image unique, une hauteur imposée ne peut que **rogner ou cadrer en boîte aux lettres** — et le rapport du cadre variait déjà de 1,58 à 1,86 selon la largeur de la fenêtre, donc le rognage n'aurait même pas été le même partout. La hauteur se déduit maintenant du contenu : barre de chrome, image en 8/5, légende |
| D-685 | **Un mouvement ne compte que s'il se voit sur l'image arrêtée.** La contrainte est plus dure que « on peut animer » : elle interdit tout geste dont la preuve exige une vidéo. Sont admis un trait à moitié tiré, une bande à mi-course, un chiffre entre deux crans, un masque qui découvre la moitié d'un mot. Le reste ne se fait pas, même si c'est beau. L'`<iframe>` vivant de D-672 reste par-dessus la planche pour qui a le palier — mais **il ne sert plus d'excuse** : la planche doit tenir seule |

## Le geste, et ce qu'il devient quand on le réduit — 2026-08-01

| ID | Décision |
|---|---|
| D-686 | **Le registre des sites photographiés sort de l'outil qui le lisait.** `demos-sites.mjs`, une seule source pour la capture par tuiles et pour celle du premier écran. Les `masques` ne sont pas du confort : ce sont les marques, les numéros et les adresses qu'on refuse de publier. Un registre recopié se corrige d'un côté et pas de l'autre, et la marque ressort dans la capture de l'autre outil |
| D-687 | **Une seule barre d'adresse pour les treize, et elle sort des maquettes.** Tant qu'elle vivait DANS chaque `.mock`, la scène ne pouvait pas porter le rapport 1440/900 : il aurait fallu lui retrancher une hauteur qui change avec la largeur de la fenêtre — 22 px à 1280, 30 px à 1920 — et l'image se serait fait rogner de 2 à 3 % **du bas**, là où les douze posent leur bandeau, leur cartouche et leur plaque |
| D-688 | **Le cadre vivant fait 1440 × 900 en propre et se réduit par `transform`.** Il faisait la largeur de la scène — 348 à 621 px — et rendait donc la mise en page TÉLÉPHONE d'un écran dessiné pour 1440 : le vivant et la planche montraient deux compositions différentes du même site, et c'est la planche qui avait raison. La boucle qui poussait le défilement de deux pixels par image tombe avec : un premier écran n'a pas de course |
| D-689 | **Un geste qui ne survit pas à la réduction n'est pas un geste.** Le mouvement se **prouve** dans la page — cinq états, l'écart de pixels entre deux consécutifs — mais il se **vend** dans le panneau, à 0,29. Un filet d'1 px y fait 0,29 px. Deux écrans avaient un mouvement mesuré, prouvé, et invisible là où on les regarde le plus. Plancher : **12 px de masse, 40 px de course, à 1440**. Piège 71 |
| D-690 | **Un masque figé à mi-course sur du texte est interdit.** Deux écrans rendaient « deux doigt| » et « avant d'être e| », tous deux **conformes à leur plan**. Un mot à moitié découvert ne se lit pas comme une révélation : il se lit comme du texte tronqué. C'est le même raisonnement que l'interdit du scrub d'opacité — une animation n'a pas d'état de repos, elle a l'état où on la photographie. Le titre se photographie FINI ; le mécanisme reste dans la page pour qui arrive, il n'est simplement plus ce qu'on montre. Piège 70 |
| D-691 | **Et le correctif ne doit pas déplacer le défaut.** Le cabinet a porté sa plaque de date sur **deux couches du même texte** — la forme en flux qui donne la hauteur, la plaque absolue qui se tire — parce qu'une plaque tirée sur une couche unique aurait caché « SITE DE DÉMONSTRATION » pendant une seconde. Le piège 70 déplacé, pas corrigé |
| D-692 | **Un masque non vérifié est un masque qui peut être défait.** La capture du déneigeur est sortie avec le numéro du client **en clair** alors que l'outil annonçait « 9 nœuds masqués » : l'hydratation React a échoué, l'arbre s'est reconstruit pendant l'attente, et les nœuds réécrits sont revenus. On masque deux fois — dont une juste avant le déclenchement — et on relit les motifs dans le texte RENDU. Un survivant arrête la capture. Piège 72 |

## La passe finale — 2026-08-01, quatrième passe

| ID | Décision |
|---|---|
| D-693 | **Une adresse web dit « va voir ». Il n'y a rien à aller voir.** Les treize aperçus portaient chacun un domaine inventé — `bistro-nordet.ca`, `salon-brume.ca`, `cabinet-vallieres.ca`. C'est le seul énoncé de toute la section qui échouait à la question Q2 de la règle A : le visiteur ne peut PAS le vérifier, et s'il essaie il tombe sur rien. Le cartouche ne porte plus que le métier. Il perd du même coup son `clamp(cqw)` : depuis sa sortie de `.mock` (D-687) il n'avait plus de conteneur, donc `cqw` retombait silencieusement sur la fenêtre — une taille en token, parce que ce cartouche est celui d'APED, pas la fenêtre du client |
| D-694 | **L'outil de géométrie prouve l'absence d'adresse, et il la lit dans le TEXTE RENDU.** Un `data-hote` oublié se serait vu dans la source et pas dans la page, ou l'inverse. `panneau-echelle.mjs` relit le cartouche et la maquette active à sept largeurs et refuse tout motif `<mot>.ca|.com|.net|.org`. Même raisonnement que D-692 : un retrait non vérifié dans le rendu est un retrait qui peut avoir été défait |
| D-695 | **Douze agents qui cherchent « le meilleur site de leur métier » convergent tous vers le goût de l'année.** Quatre des neuf démos étaient du serif sur crème ; cinq des douze étaient une photo sombre avec un titre lourd. Chaque écran reçoit donc une **cellule exclusive** — palette, typographie, composition, traitement photo — et ce qui est exclusif à l'un est **interdit** aux onze autres. La matrice se décide AVANT la recherche, sinon la recherche la dissout |
| D-696 | **Les trois projets réels ne se réécrivent pas pour soigner leur vignette.** Restauration, garage et déneigement vivent dans des dépôts voisins et appartiennent à des clients. Sur eux, seul l'**instant de la prise de vue** se choisit. Conséquence assumée, et c'est le plus gros angle mort de la section : ce sont les trois qui se ressemblent le plus — même orange de bouton, même photo sombre, même titre blanc massif — parce qu'ils sortent de la même main |
