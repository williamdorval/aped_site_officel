# RÉSERVES — ce qui reste ouvert, et ce qui n'a jamais été prouvé

**Quand lire ce fichier :** avant d'écrire « vérifié », avant de
fermer un chantier, et avant d'affirmer quoi que ce soit sur le
comportement mobile du site.

Une réserve n'est pas une liste de tâches. C'est la liste de ce que le
projet **ne sait pas**, tenue à jour pour qu'aucune session ne
l'oublie et n'écrive à sa place quelque chose qui sonne bien.

- [1 · Le plus gros trou de preuve](#mobile)
- [2 · Défauts ouverts](#defauts)
- [3 · Outils périmés ou faux](#outils)
- [4 · Contenu et licences](#contenu)
- [5 · Ce qui n'a jamais été touché du doigt](#doigt)

---

<a id="mobile"></a>
## Services et Réalisations, 2026-07-31

- **Le rail horizontal reste un contrôle caché.** La littérature
  (NN/g, *Beware Horizontal Scrolling*) est défavorable : coût
  d'interaction, flèches jamais regardées en oculométrie, piste
  informationnelle faible. Il est conservé sur demande explicite, et
  les trois conditions de défendabilité sont tenues — débord partiel
  du service suivant, compteur permanent, et la même liste disponible
  en pile sous 48em et sous mouvement réduit. **Ça n'en fait pas une
  preuve que le rail aide.**
- **Le curseur avant / après non plus.** Aucune étude publiée ne
  départage le curseur du côte-à-côte ; toutes les affirmations
  contraires viennent d'éditeurs de composants. Le repos à 50 % est
  une mitigation, pas une démonstration.
- **`exemple.ca` n'est pas un domaine réservé.** RFC 2606 ne réserve
  que `example.com`, `.net`, `.org`. Les courriels des maquettes
  utilisent `@exemple.ca` : le risque est nul en pratique, mais ce
  n'est pas une garantie formelle.
- **L'outil d'estimation du service 05 n'envoie encore rien.** Le
  projet de référence porte un `TODO` à l'endroit de l'envoi : le
  message « votre demande a été transmise » y est en avance sur le
  code. La fiche du service décrit ce qu'on LIVRE, pas l'état de ce
  projet-là — mais la distinction mérite d'être connue.
- **Une lecture de marge `auto` diverge entre la feuille découpée et
  la feuille entière** (piège 32). Géométrie identique au pixel,
  cause exacte non élucidée.
- **Les maquettes sont plus hautes que ce qu'on en voit.** La boucle
  parcourt 48cqw sur des pages de 220 à 410cqw : au-delà de ~110cqw,
  le contenu n'est jamais atteint. Il n'est pas faux, il est inutile.
- **Rien de ce chantier n'a été vu sur un appareil réel.** La réserve
  générale du projet tient, sans exception.

## 1 · LE PLUS GROS TROU DE PREUVE

> **AUCUNE mesure de ce projet n'a été prise sur un appareil réel.**
>
> Tout ce qui est écrit dans `MESURES.md` — LCP, i/s, contrastes,
> paliers, débordement, séquences — vient de **Chromium piloté par
> Playwright sur une machine de bureau Windows**. Y compris les
> relevés « téléphone » : 390 px de large avec `pointer: coarse`
> émulé n'est **pas** un téléphone.

Ce que l'émulation **ne peut pas** dire, et que personne ne sait donc
encore sur ce site :

- le **budget de peinture réel** d'un téléphone d'entrée de gamme —
  c'est toute la raison d'être des trois paliers, et le palier 2 n'a
  jamais été déclenché autrement qu'en bridant artificiellement le
  processeur ;
- le comportement de **Safari iOS**, qui n'est pas Chromium :
  `content-visibility`, `animation-play-state`, `clip-path`,
  `@property`, la barre d'adresse qui se rétracte et fait bouger
  `100vh` ;
- le **toucher réel** : cibles de 44 px, défilement à inertie,
  `:hover` fantôme qui reste collé après un tap ;
- la **lisibilité en plein soleil**, et le rendu des trois matières
  sur une dalle OLED calibrée autrement ;
- le **réseau mobile** : tout est mesuré en local, sur `localhost` ;
- **la pause de la boucle des plaques quand l'onglet est caché.**
  Le code réagit correctement — prouvé au pixel en forçant
  `document.hidden` et en émettant `visibilitychange` — mais
  **Chromium sous Playwright ne modélise pas la visibilité d'un
  onglet** : `document.hidden` reste `false` avec un second onglet au
  premier plan, sans tête comme avec tête, et
  `Page.setWebLifecycleState` rejette `hidden`. Ce verrou-là se
  vérifie à la main.

**Ce n'est pas une réserve de style, c'est un trou dans la preuve.** La
règle « visible, sinon ça ne compte pas » n'a été appliquée que sur un
écran de bureau. Le propriétaire s'en charge de son côté ; en
attendant, **aucune session ne doit écrire « vérifié sur mobile »** —
ni le laisser entendre — tant que cette section est encore ici. Quand
un vrai appareil aura été passé, remplacer ce bloc par ce qui a été
mesuré, sur quel modèle, quelle version d'OS et quelle date.

<a id="defauts"></a>
## 2 · DÉFAUTS OUVERTS

**`<footer class="footer">` est imbriqué dans `<main class="shell">`.**
Un `<footer>` descendant de `<main>` perd son rôle `contentinfo` dans
l'arbre d'accessibilité. Le déplacer n'est pas trivial : le seuil du
pied est collé juste au-dessus. Voir `ARCHITECTURE.md`.

**`[data-settle]` et `[data-count]` n'ont plus aucune cible.**
`motion.js` blocs 5 et 11 tournent à vide. Voir `SECTIONS.md`.

**`@keyframes cadeau-degage` est défini deux fois**, avec des contenus
différents. Voir `ANIMATIONS.md`.

**`404.html` charge `css/app.css` en entier** — seul endroit du dépôt à
servir la feuille source.

**Les positions de déclenchement de ScrollTrigger sont périmées par
`content-visibility: auto`.** Trouvé le 2026-07-30 en mesurant, pas en
lisant. Sept textes du site restaient à **10-12 % d'opacité en
permanence** pour un visiteur normal (1,15:1 à 1,36:1) : leur
déclencheur ne partait jamais, parce que la hauteur *réservée* des
sections traversées n'est pas leur hauteur réelle. Le **dégât** est
corrigé — onze tweens portent `immediateRender: false`, donc l'état de
repos est la forme finale et un déclencheur muet ne coûte plus qu'une
animation manquante. **La cause ne l'est pas.** Elle touche à la
stratégie `content-visibility` de toutes les sections, et c'est un
chantier en soi.
`node tools/contraste-arret.mjs http://localhost:8099 60` doit rester à
**0**.

**FormSubmit n'est toujours pas activé** — vérifié le 2026-07-30 :
HTTP 200 avec `{"success":"false","message":"This form needs
Activation."}`. Le lien d'activation est dans la boîte du propriétaire,
et c'est **un clic**. Depuis le 2026-07-30 les six formulaires
**livrent quand même** : sur échec, un repli `mailto:` paraît avec le
message déjà rempli à partir des réponses tapées.
`node tools/formulaires-e2e.mjs` relève l'état réel du service en tête
de rapport ; le jour où il dit `ACTIVE`, le repli cesse de paraître
sans qu'une ligne change.

**La section 02 fait 2,75 écrans** à 1440×900, contre 2,62 pour la
grille qu'elle remplace. Elle ne **retient** personne — aucune molette
n'est détournée — mais elle demande plus de course. Le seul nombre à
tourner est `--svc-pas` (`min(46vh, 430px)`) : la course vaut
`(n − 1) × --svc-pas` et tout le reste en découle.

<a id="outils"></a>
## 3 · OUTILS PÉRIMÉS OU FAUX

**FERMÉ le 2026-07-30 — quatre outils qui passaient en ne mesurant
rien.** `services-check.mjs` et `projets-check.mjs` interrogeaient
`.svc-carte`, `.svc-vue`, `.shot` et `.project` ; `plaques-vie.mjs` et
`plaques-debord.mjs` interrogeaient les huit plaques. Aucune de ces
cibles n'existe plus : les quatre passaient au vert sur du vide,
c'est-à-dire exactement le **piège 17**. Ils sont dans
`archives/outils-perimes/`. Les remplaçants vivants sont
`tools/svc-defile.mjs` et `tools/ba-check.mjs`.

**`prix-check.mjs` compte les lignes de COMMENTAIRE.** Un montant cité
dans un commentaire pour documenter un correctif ressort « A RETIRER ».
Les commentaires du dépôt écrivent donc les montants **sans le glyphe
`$`**. Ce n'est pas la bonne façon : le premier passage doit distinguer
code et commentaire, et rendre une troisième catégorie au lieu d'un
faux positif. En attendant, `A RETIRER dans le source` doit rester à
**0**.

**`theme-check.mjs` ne peut pas servir de preuve de non-régression
visuelle.** Ses captures d'une page qui bouge rendent jusqu'à 1,96 %
d'écart entre deux passes du même code. Utiliser `captures-fixe.mjs`
pour ça. Voir `PIEGES.md` § 29.

<a id="contenu"></a>
## 4 · CONTENU ET LICENCES

**`logo/LOGO_APED*.png` portent un manifeste C2PA signé** —
`gpt-image` 2.0, OpenAI, `trainedAlgorithmicMedia`, plus un filigrane
invisible non borné. Les deux fichiers ne sont référencés nulle part
(la marque affichée est `logo-mark.svg`), mais on ne peut pas en
revendiquer l'exclusivité.

**FERMÉ le 2026-07-31 — `images/og.png` contredisait le site** (« 24 h »
contre 12 h partout, plus une pique invérifiable). La carte est
maintenant **fabriquée depuis le vrai site** par `node tools/og.mjs` :
plaque de limaille réelle capturée au repos, titre du hero, les trois
faits du socle — vraie par construction. La réserve « aucun outil ne
lit le texte dans un PNG » demeure : si le socle change, relancer
l'outil fait partie de la correction de véracité.

**La « photographie » de la maquette de 2011 est dessinée en CSS** —
trois aplats et une trame, sursaturés. Pis-aller assumé : aucune image
du dépôt n'a de licence utilisable, et en ajouter une casserait « zéro
requête tierce ».

**Deux points d'`archives/rapports/AUDIT-VERACITE.md` restent suspendus** à une
information que seul le propriétaire a : les cinq adresses en ligne des
projets, et la pile réelle des projets clients. Voir
`archives/rapports/DECISIONS-NUIT.md § 2`.

**FERMÉ le 2026-07-30 — les cinq `images/real-*.webp`.** Elles ne sont
plus affichées nulle part : la section 03 est devenue trois
démonstrations avant / après entièrement en markup. Les fichiers sont
dans `archives/2026-07-30-projets-images/`. **Ne pas les remettre** :
la licence reste inconnue, et `real-pneus` contient neuf marques de
pneumatiques. Les quatre `images/_retire/service-*` n'ont jamais été
affichées.

**FERMÉ le 2026-07-30 — la plaque « 7 · Produits ».** Elle comptait la
vidéo. Les huit plaques sont sorties de l'accueil, le site n'affirme
donc plus nulle part qu'il fait de la vidéo. **La réserve revient si le
bloc revient** — elle est recopiée dans
`archives/2026-07-30-plaques-accueil/README.md`.

<a id="doigt"></a>
## 5 · CE QUI N'A JAMAIS ÉTÉ TOUCHÉ DU DOIGT

**LA PISTE DES SERVICES.** Elle ne s'active pas sous 48em, et cette
borne repose sur un **raisonnement** — `100dvh` change de valeur quand
la barre d'adresse d'un téléphone se rétracte, donc une scène collante
d'un écran de haut saute à ce moment-là — **pas sur une mesure**. C'est
la réserve la plus importante du chantier du 2026-07-30.

**LE CRAN AVANT / APRÈS.** Le patron a été choisi précisément parce
qu'il **évite** le conflit entre le glissement horizontal du doigt et
le défilement vertical de la page — il n'y a aucun geste horizontal,
donc aucun `touch-action` à négocier. Mais éviter un problème n'est pas
l'avoir mesuré.

## Refonte immersive, 2026-07-31

- **Aucun sas n'a été vu sur un appareil réel.** La réserve générale
  du projet s'applique en entier ; s'y ajoute que `sas-ok` exclut les
  téléphones PAR CONSTRUCTION — le mobile reçoit la page d'avant, et
  c'est voulu, mais personne n'a encore vérifié de ses yeux que le
  repli est propre sur un vrai appareil.
- **La cause `content-visibility` des ancres n'est PAS corrigée.**
  D-583 vise le symptôme : la re-visée mesure sur place et corrige.
  Le jour où les réservations seront tenues exactes en continu, la
  re-visée deviendra un filet qui ne se déclenche jamais.
- **Le mot « Essayez. » est un impératif, pas une affirmation** — rien
  à défendre au téléphone. Mais si la section 05 change de contenu, le
  mot forgé doit suivre le sens de ce qui l'attend dessous.
- **La forge n'a été mesurée qu'à 1440×900.** À 2560 px de large, le
  canvas grossit (~9k grains estimés) ; le plafond dpr 1,5 borne le
  coût, mais aucune mesure n'existe au-delà de 1920.
- **Le clic sur un lien d'ancre pendant le défilement doux** : la
  re-visée attend `scrollend` (repli 750/1100 ms). Un visiteur qui
  clique puis défile à la main DANS cette fenêtre annule la
  correction — choix assumé (sa main gagne toujours), non mesuré.

---

## OUVERTES APRÈS LA MISE EN PRODUCTION — 2026-07-31

### Les captures des quatre « après » viennent de serveurs de DÉVELOPPEMENT

Les quatre projets ont été photographiés sous `npm run dev`, pas sous
un build de production. Le rendu visible est le même — c'est le même
code, les mêmes polices, les mêmes images — mais aucune de ces quatre
captures ne prouve que le site *déployé* est identique. Refaire les
captures après un build réel serait plus solide.

### Deux défauts trouvés DANS les projets sources, non corrigés

Ils appartiennent aux dépôts des démonstrations, pas à ce site-ci, et
personne ne les a corrigés à la source :

1. **`demo-design-int-rieur` — les espaces disparaissent des titres en
   Fraunces.** « On dessine des espaces qui vous ressemblent » rend
   « Ondessinedesespacesqui vousressemblent ». Le caractère d'espace
   est placé à la FIN d'un `inline-block`, où le rendu le supprime.
   Trois endroits sur l'accueil. La capture le répare à la prise de
   vue avec `white-space: pre-wrap` — donc **la capture est plus juste
   que le site**, ce qui n'est pas tenable si le site part en ligne.
2. **FERMÉE le 2026-07-31 — `restau`, « le héros devient noir dès
   qu'on défile ».** Le défaut n'existe pas, et n'existait
   probablement plus quand la réserve a été écrite. Remesuré :
   26 paliers de 600 px, écart-type de luminance relevé à chaque
   palier, plus une pleine page. **Aucune image plate — le minimum
   est 22,8 pour un seuil de platitude de 3.** La vraie cause était
   le piège 40 : le sélecteur de masquage `[class*="cursor"]`
   attrapait `cursor-none`, que ce site pose sur son enveloppe, et
   masquait la page entière. Elle a été corrigée ; le contournement
   `fixe: true` lui a survécu et empêchait de photographier autre
   chose que la première fenêtre. Il est retiré.
   **Ce qu'il faut en retenir, et c'est la troisième fois : quand on
   contourne au lieu de chercher, le contournement reste après le
   correctif et personne ne le sait.**

### FERMÉE le 2026-07-31 — les chiffres des sites de démonstration

Les captures montrent « 12 000+ véhicules », « 98 % », « 120+ projets
livrés », « 5 000+ clients ». **Arbitrage du propriétaire : ils
restent.** Le raisonnement, et il tient : ce sont des entreprises
fictives, annoncées comme telles par le sous-titre de la section —
« Quatre démonstrations, entreprises fictives — pas des mandats
livrés ». Un chiffre à l'intérieur d'une démonstration étiquetée fait
partie de la fiction. **Ce n'est pas une affirmation d'APED**, et
aucune des quatre questions de véracité ne s'y applique : APED
n'affirme pas que 12 000 véhicules sont passés quelque part, APED
montre à quoi ressemble un site qu'elle sait coder.

### Le tracteur du site de déneigement porte une marque réelle

La photo du héros montre un tracteur identifiable. Ce n'est pas une
fausse recommandation — c'est un objet dans une photo — mais aucun
masquage textuel ne peut l'atteindre.

### FERMÉE le 2026-07-31 — les blocs photo gris des « avant »

Il y en avait **vingt-quatre**, pas quinze : garage 1, design 6,
restaurant 10, rénovation 13. Le compte de la réserve précédente
était faux parce qu'il ne listait que trois classes.

Ils étaient défendus ici même comme du contenu d'époque. **Le
propriétaire les lit comme des placeholders, et il a raison :** un
« avant » incomplet ne prouve pas que le vieux site était mauvais, il
donne l'impression que le travail n'est pas fini. Dans une section
dont le sujet est la preuve, c'est le pire endroit possible pour un
carré vide.

Ils portent maintenant de vraies photographies sous licence écrite —
Poly Haven (CC0) et Pexels —, aucune marque lisible, aucun visage
identifiable, aucun logo. `tools/avant-photos.mjs` porte l'adresse et
la licence de chaque pièce, **et la raison de chaque cadrage écarté**.
Vérifié à l'image sur les quatre reconstitutions rendues en pleine
hauteur : `preuves/chantier5-realisations/avant-*.png`.

**Trois blocs subsistent, et aucun n'est une photo** : le carré du
logo de l'office (c'est un logo), le plan de rues schématique (c'est
une carte), et le voile sombre posé PAR-DESSUS la photo du héros du
gabarit. La bande des cinq partenaires du pied de page porte
maintenant une silhouette de logo détrempée — **on n'invente pas de
faux logos**, un faux logo dans une reconstitution ressemble trop à
une vraie marque.

### OUVERTES PAR LE CHANTIER DU CADRE NAVIGABLE — 2026-07-31

**FERMÉE le 2026-07-31 — la hauteur des « après ».** La réserve
précédente assumait de couper chaque « après » à la hauteur de la
reconstitution d'en face. Le propriétaire l'a relevé en une phrase :
« j'arrive au bas du site avant, tout se bloque, et le après a encore
beaucoup à montrer ». Il a raison, et l'argument que j'en donnais
était faux — la règle « les deux côtés finissent à la même ligne » se
tient en POURCENTAGE, pas en pixels. Les quatre sites sont
photographiés entiers et se visitent jusqu'à leur pied de page.

**Le « après » n'est PAS un site vivant.** C'est une image cousue à
partir du vrai site, plus une planche de vues par scène épinglée. Le
visiteur voit la vraie page et la vraie transition, mais **rien ne
tourne** : aucun script du site montré ne s'exécute, aucun lien n'y est
cliquable. Faire tourner les quatre sites pour de vrai demanderait de
les construire en statique, de les servir depuis ce dépôt et de
corriger à la source les marques masquées à la prise de vue — c'est un
autre chantier, et il change le modèle de déploiement.

**La course d'une scène épinglée est relevée au pas de la descente,
pas au pixel.** Le restaurant épingle sur environ 1 260 px ; la
détection, qui avance par fenêtres de 640 px, en a retenu 605. La
transition rejouée couvre donc un peu moins que la vraie. Aucune
conséquence visible, mais c'est une approximation, pas une mesure.

**Le doigt n'a pas été essayé.** `overscroll-behavior` passe à `auto`
sous `pointer: coarse` pour que le cadre ne piège pas le défilement de
la page. **C'est la PROPRIÉTÉ qui est mesurée, pas le geste** — la
réserve qui domine tout ce projet s'applique en entier ici :
Chromium sous Playwright avec `hasTouch` n'est pas un téléphone.

**Le contraste des reconstitutions n'est pas celui du site.** La fiche
d'office de tourisme descend à 1,77:1 sur ses chevrons de fil
d'Ariane, à 5 px. C'est un site médiocre de 2019 reconstitué : sa
médiocrité est le sujet. Les quatre blocs « avant » portent
`role="img"` et une description complète, donc une technologie
d'assistance reçoit une image décrite et jamais ce texte-là. **Ça
reste une exception argumentée à « 0 échec de contraste », pas un
zéro.**

**Le poids des images de la section passe de 333 Ko à 1 287 Ko** —
quatre sites entiers plus deux planches de transition. Toutes
différées, sous la ligne de flottaison, sans effet mesuré sur le LCP
(168-220 ms) ni le CLS (0). Ça reste 1,3 Mo servis à qui descend
jusque-là, et c'est le prix de « le visiteur visite vraiment les
quatre sites ». À rediscuter si le poids devient un sujet.

**`cls-source.mjs` relève 0,0017 sur 34 décalages** quand il pilote la
page ; `accueil-check.mjs tenue`, l'instrument du seuil, relève **0**.
Les deux ne mesurent pas la même chose — le premier compte aussi ce
qui bouge pendant une interaction. Le plus gros décalage isolé vaut
0,00031. **Aucun des deux chiffres n'est faux ; c'est le mot « CLS »
qui désigne deux mesures.**

### FormSubmit n'est toujours pas activé

Inchangé. Les six formulaires livrent **6 / 6 par le repli courriel**,
vérifié de bout en bout le 2026-07-31 par `tools/formulaires-e2e.mjs`.
Le service répond 200 avec `success: "false"` et un message
d'activation. **Rien ne part automatiquement tant que le lien reçu par
courriel n'a pas été cliqué.**

### La réserve qui domine tout le reste n'a pas bougé

> **AUCUNE mesure de ce projet n'a été prise sur un appareil réel.**

---

## Les douze secteurs, 2026-08-01 — ce qui reste ouvert

### Deux des douze se ressemblent encore, et ce sont les deux projets RÉELS

`01 Restauration` et `02 Garage` sont tous les deux sombres avec un
orange. Sur la planche des douze c'est la paire la plus proche, et
elle n'a pas été traitée : ce sont `restau` et `demo-carroserie`, des
projets vivants hors de ce dépôt. Leurs typographies les séparent —
un didone contre une grotesque condensée capitale — mais leurs
premiers écrans se répondent. `03 Paysagement` porte un troisième
orange. **C'est de cette collision qu'est née la contrainte imposée
aux neuf autres : aucun n'a droit à l'orange.**

### Le mouvement ne se voit pas dans l'aperçu du panneau

L'aperçu de la section Secteurs est une **suite de captures fixes**
qu'on parcourt à la molette (D-653). Les animations écrites dans les
douze sites — parallaxe, volet, masque qui monte, compteurs qui
roulent — n'y jouent pas : ce qui bouge dans le panneau, c'est le
défilement. Les tuiles sont photographiées **pendant** que la page
défile, donc elles montrent des états animés réels, mais **le
visiteur ne voit un mouvement que s'il ouvre le site.** Changer ça
demanderait des `<iframe>` vivantes dans la page d'accueil, ce que
l'architecture actuelle refuse.

### Ce que les neuf sessions ont laissé ouvert, une ligne chacune

| Site | Réserve |
|---|---|
| Boutique | L'atelier est la section la plus faible — trois rangs alternés qui ressemblent à une mise en page d'article. Les cartes de la collection ne sont pas cliquables : il n'existe pas de page produit |
| Boutique | Le changement de fond au défilement **ne se voit pas dans une capture pleine page** : Playwright photographie au défilement 0. La signature est vraie à l'écran, mesurée aux quatre étapes |
| Coiffure | `coiffure-7` (les pinceaux) est un macro flou ; en noir et blanc il reste plus graphique que descriptif. La plus faible des neuf. Les fauteuils du héros sont encore sous film de protection |
| Hébergement | Le calendrier annonce des disponibilités **inventées** ; c'est écrit à sa légende. Les intertitres sont en cormorant capitales 18 px — une antique très fine à petite taille, le texte le plus délicat du site |
| Hébergement | `mix-blend-mode: color` à 44 % refroidit fortement la salle à manger, d'origine très chaude. C'est le cliché qui souffre le plus du virage |
| Gym | `timeline-scope` demande Chrome 116+, `animation-timeline` seul 115. Entre les deux versions, les compteurs et la jauge du rail restent à leur forme finale — l'information ne se perd pas, le mouvement oui. Le `@supports` ne couvre pas ce trou d'une version |
| Gym | `gym-3` porte des chiffres et un « PRO » moulés sur les disques ; illisibles après duotone, mais non validés comme absence de marque |
| Clinique | La photo du héros porte au fond, hors focus, une pancarte « JALE » — une quarantaine de pixels sur 1920, en espagnol, sur un site qui se dit québécois. Jugée illisible à l'écran, pas retouchée |
| Clinique | Quatre des sept photos sont des corridors ; `clinique-2` est très floue. Elle sert de bande de respiration plutôt que de vignette |
| Immobilier | `immobilier-4` porte une plaque de numéro civique près du garage — illisible (≈ 12 px à l'affichage), mais elle est là. Le cadrage 4:3 ne permet pas de la couper sans amputer la façade |
| Immobilier | La couverture reste une photo de plein jour sur une page qui se voulait « éclairée à la lampe ». La phrase a été retirée plutôt que le filtre poussé — un filtre ne transforme pas une pièce en lumière naturelle en pièce à la lampe sans mentir sur la pièce |
| Juridique | La trame d'impression à 45 % reste franchement visible sur les zones claires de la colonnade. C'est le comportement d'un vrai écran d'impression ; elle se baisse d'une valeur si on la trouve bruyante |
| Juridique | Vingt mesures de contraste sont **approchées** et non exactes : le papier porte un dégradé, et la remontée s'arrête dessus |
| Construction | Le « surlignage cyan sur les arêtes » écrit dans la DA **n'est pas fait** — impossible en CSS pur sans détection de contours. Remplacé par une trame cyan posée sur chaque photo. Ce n'est pas ce qui était écrit |
| Construction | Le décalage des sept étapes n'est visible que sur les **trois premières** : les quatre suivantes finissent leur course avant d'être vraiment à l'écran. Élargir la plage rendrait le mouvement plus voyant mais risquerait une capture à mi-course |
| Construction | `construction-5` porte un casque jaune au bas de l'image ; le virage bleu le désature au point qu'il ne se lit plus. Gardé parce que la photo était assignée |
| Construction | 109 mesures de contraste **approchées** : le quadrillage de plan est un dégradé posé sur toute la page |
| Photographe | `photo-1` et `photo-2` portent une étiquette de texte sur une torche, illisible même à 5×. Employées en second plan, jamais en plein cadre. Si l'interdit « rayon appareil photo » couvre aussi une inscription illisible, il faut les retirer — **et il n'y a rien pour les remplacer** |
| Photographe | La capture pleine page ne montre que l'œuvre `01` de la série : c'est inhérent à un défilement latéral, pas un défaut |

### La réserve qui domine, et elle n'a pas bougé

**AUCUNE de ces douze pages n'a été vue sur un appareil réel.** Tout
vient de Chromium sous Playwright sur un poste de bureau Windows,
relevés « 320 px » et « 390 px » compris.

---

## Les douze secteurs, seconde passe — 2026-08-01

### Ce qui reste ouvert sur l'aperçu vivant

- **Trois des douze n'ont pas d'aperçu vivant** : restau, garage et
  déneigement sont des projets réels qui vivent hors de ce dépôt, et
  aucun serveur d'ici ne les sert. Ils gardent la planche de captures.
- **L'aperçu vivant ne joue qu'au palier 0**, pointeur fin, largeur
  ≥ 64 em, hors mouvement réduit. Sur téléphone, au clavier, et dès
  que le palier monte, le visiteur voit la planche — donc le
  mouvement écrit dans les douze sites ne lui est pas montré.
- **Le cadre est `inert`** : on ne peut pas le défiler soi-même. C'est
  le prix de ne pas poser trente arrêts de tabulation dans le fil de
  l'accueil. Le visiteur qui veut agir clique la pastille.
- **CLS mesuré à 0,0029**, pas à 0 comme l'annonce `CLAUDE.md`.
  Trente-quatre décalages sur des `a::after` / `a::before` vers
  7,5 s. **Ce n'est pas le chantier de l'aperçu vivant** — la valeur
  est identique au millième avant et après, vérifiée en remettant les
  deux fichiers à leur état d'origine. C'est un défaut PRÉEXISTANT et
  personne ne l'avait relevé.

### Ce que chaque session a laissé ouvert

| Site | Réserve |
|---|---|
| Clinique | Le premier virage froid a tourné **les fauteuils bleus en orange** avant d'être corrigé — vu à l'image, jamais par une sonde. La plaque `clinique-2`, la plus floue, est sous un voile bleu à 82 % : la photographie n'y est plus qu'une texture, on ne peut pas dire qu'on « montre » ce corridor |
| Coiffure | Le type ne passe pas PAR-DESSUS la photographie du héros, ce que fait la référence : la source de lumière tombe exactement là où les lettres traverseraient. Onze images contre trente chez Achilles Heel. Le dernier tiers reste le point faible, et un blanc à droite du second bloc n'est pas composé |
| Coiffure | **Trois images du secteur ne sont plus employées** alors qu'elles restent au registre des licences : qui compte les fichiers en trouvera plus que d'employées |
| Gym | Les photographies restent des images de banque ; les trois références shootent leur propre salle, et le duotone ne rachète la cohérence tonale qu'à moitié. Le bandeau défilant tourne en continu hors mouvement réduit — coût GPU constant, non mesuré en i/s sur la traversée |
| Gym | `25 LB` moulé sur `gym-3` est la seule unité impériale d'une page dont tout le discours est en kilos |
| Construction | Le calcul du surlignage **n'est pas bridé par `prefers-reduced-motion`** — c'est un traitement, pas un mouvement, mais l'arbitrage se discute. Il l'est par le nombre de cœurs et la mémoire. `construction-9` reste la plus faible des douze : sous traitement, un champ gris avec trois lignes |
| Construction | Pas de caractère d'affichage sous licence : les références ont Suisse et Founders Grotesk, `space-grotesk` est bon mais commun |
| Immobilier | **La hauteur de la bande panoramique est une mesure, pas un goût** : le numéro civique « 621 » est lisible à la loupe à 68 % de la hauteur de la source. Toucher à `height` ou à `object-position` le ramène en champ — c'est écrit en commentaire au-dessus de la règle |
| Immobilier | La photographie de couverture est un salon de banlieue, pas une photographie d'architecture. Durcie, elle tient ; l'appariement propriété ↔ photo était imposé et n'a pas été touché. Le tri du registre réordonne VISUELLEMENT (`order`) : un lecteur d'écran lira toujours 01 → 10 |
| Photographe | La photographie de Dieste occupe 100 % de son premier écran, celle-ci 57 % — le prix des marges énormes et d'un titre qu'un client doit lire. L'état du filtre de salle ne vit pas dans l'URL : on ne peut pas partager un lien vers « salle objet » |
| Hébergement | Le héros donne 62 % de la fenêtre à la photographie, les références 100 %. La rétrécir pousserait le bouton au-delà des 800 px du pli. La densité photographique reste **trois fois sous les références** — elles n'ont presque pas de texte, cette page en a et c'est son argument |
| Juridique | Vingt mesures de contraste sont **approchées**, pas exactes : le papier porte un dégradé et la remontée s'arrête dessus |

### La réserve qui domine, et elle n'a pas bougé d'un mot

**AUCUNE de ces douze pages n'a été vue sur un appareil réel.** Tout
vient de Chromium sous Playwright sur un poste de bureau Windows,
relevés « 320 px » et « 390 px » compris. La piste latérale de
l'auberge est précisément ce qui se juge au doigt, et personne ne l'a
touchée du doigt.

## Le chantier du premier écran — 2026-08-01, troisième passe

### Ce que je n'ai PAS refait, et pourquoi

**Trois des douze écrans ne sont pas de ce chantier.** `restaurant`
(CENDRE), `garage` (MÉRIDIEN) et `paysagement` (MV Déneigement) sont
des projets qui vivent dans des dépôts voisins. Ils ont été
**rephotographiés** à 1440 × 900 comme les neuf autres — même échelle,
même traitement — mais leur composition n'a pas été retouchée. Les
redessiner aurait voulu dire modifier un projet qu'on ne m'a pas
demandé de toucher, et pour MV Déneigement, un projet **en cours de
refonte dans une autre session au moment même de la capture**.

Conséquence assumée : sur la planche des douze, ces trois-là n'ont pas
reçu la même passe de travail que les neuf autres. `restaurant` et
`garage` tiennent le côte-à-côte — leur premier écran est bon. Le
verdict sur `paysagement` est **suspendu** tant que sa refonte n'est
pas finie.

### Ce qui reste ouvert

| | |
|---|---|
| **`paysagement` a été rephotographié pendant sa refonte** | son dépôt ne compilait pas à la première prise de vue ; il compilait à la seconde. La capture montre donc **un chantier en cours**, pas un état livré, et elle vieillira dès la prochaine passe du voisin. À reprendre quand sa refonte sera posée |
| **Deux des douze rendent une erreur de console** | `restaurant` et `paysagement` : « Hydration failed because the server rendered text didn't match the client ». Elles sont dans les projets voisins, en mode développement, et je n'y ai pas touché. Elles n'affectent pas l'image — mais c'est cette même hydratation défaillante qui a défait le masquage du numéro de téléphone (piège 58) |
| **Les trois projets réels n'ont pas de `<meta name="aped-instant">`** | ils ne sont pas dessinés autour d'un instant photogénique et sont capturés « posés ». **Trois des douze aperçus ne prouvent donc aucun mouvement** |
| **`06 Garage` et `08 Paysagement` sont la paire la plus proche** | tous deux sombres, tous deux une grosse grotesque blanche en bas à gauche sur un véhicule. Ce sont les deux projets réels ; on ne les redessine pas. La réserve précédente désignait 01/02 — la mesure sur la planche dit 06/08 |
| **`12 Photographe` se repère au côte-à-côte** | il est le seul sombre de ses trois références, et son image est la moins saisissante des quatre. C'est ce qu'un photographe vend. Le fonds disponible est la limite |
| **`10 Immobilier` a perdu sa règle « aucun vert »** | le quart bas de la nouvelle photographie est une bande de plantation : **2,58 % de vert et 6,92 % de chaud** mesurés après filtre, contre 0 % pour l'image d'avant. C'est le prix de la seule tranche de 720 × 900 qui montre une maison entière |
| **`04 Gym` : l'accent du À change de couleur, pas sa lettre** | il monte à 1,10 em, donc il vit dans la bande de l'aplat qui l'inverse. Au repos — ce que voit un visiteur après 1,1 s — il est noir, collé à son À. Aucun corps ni aucun retrait ne l'évite |
| **`04 Gym` : son acide est la couleur de catégorie du fitness 2026, et ça n'a pas été corrigé** | la recherche du 2026-08-01 le dit sans ambiguïté : HYROX a fait du chartreuse la couleur du métier, PHIVE a monté un jaune saturé en Awwwards SOTD, La Huella porte la même paire. Notre `#d6f227` est un chartreuse — donc du côté HYROX. Ce qui nous distingue n'est **plus la couleur** mais l'absence totale de photographie et la chasse ultra-condensée, deux cases que la recherche a trouvées inoccupées. Un jaune décalé — soufre, citron froid — romprait la parenté, **mais ça n'a pas été tenté** : la teinte porte trois rapports de contraste mesurés et la cellule exclusive de la matrice, et on ne la déplace pas sur une comparaison de codes hexadécimaux qu'on n'a jamais posés côte à côte |
| **`04 Gym` : trois réserves de ce fichier décrivent un site qui n'existe plus** | les entrées « `timeline-scope` / les compteurs et la jauge du rail », « `gym-3` porte des chiffres et un PRO moulés sur les disques », « les photographies restent des images de banque » et « `25 LB` moulé sur `gym-3` » portent toutes sur la **page longue** archivée le 2026-08-01. L'écran actuel n'a ni rail, ni compteur, ni jauge, ni une seule photographie. Elles n'ont pas été retirées ici parce que d'autres métiers étaient en chantier dans le même fichier au même moment |
| **`07 Construction` : le seul mouvement n'existe qu'à partir de 1440 px** | en dessous, les cotes sont cachées parce que leur chiffre cesserait d'être vrai. Un portable de 1366 px ne voit rien bouger. Et à l'instant photographié, les trois chiffres sont éteints : l'argument « mes cotes mesurent vraiment quelque chose » n'est lisible que dans l'état fini |
| **`jetbrains-mono` sert dans six écrans sur neuf** | c'est une face de détail et non d'affichage, mais six sur neuf est une convergence réelle et non mesurée |
| **Le relevé « marco » de la coiffure est introuvable** | sa planche de côté-à-côte n'a que trois cases au lieu de quatre. L'outil le dit au lieu de rendre trois cases pour quatre |
| **Aucune des références n'a été relue par un humain** | les trois références de chaque métier ont été trouvées, relevées à 1440 px et regardées **par un sous-agent**. Le choix « c'est celle-là, la meilleure du métier » n'a été validé par personne d'autre |
| **L'échelle de 0,29 n'a pas été jugée sur un vrai écran** | elle est calculée, mesurée, et la capture le confirme. Mais « le texte paraît petit comme sur un vrai écran » est un jugement d'œil, et il se prend devant un moniteur |
| **Un seul écran a été mesuré au pixel peint** | `tools/pire-pixel.mjs` n'a tourné que sur l'auberge et la boutique, avec des sélecteurs écrits à la main. Les dix autres n'ont que le verdict « approché » de `demos-contraste.mjs`, qui ne voit pas ce qui est peint sous une image. Le risque est faible — eux seuls posent du texte sur une photographie — mais il n'est pas mesuré |
| **`tools/proto-secteurs.html` et `.css` sont périmés** | ils décrivent les douze maquettes dessinées retirées par D-681. Ils passent encore, en ne mesurant plus rien |

> Et la réserve qui les gouverne toutes tient toujours : **aucune
> mesure de ce projet n'a été prise sur un appareil réel.**

## La passe finale — 2026-08-01, quatrième passe

1. **Trois écrans sur douze ne sont pas réécrivables, et ce sont les
   trois qui se ressemblent le plus.** Restauration, garage et
   déneigement vivent dans des dépôts voisins et appartiennent à des
   clients. Même orange de bouton, même photo sombre, même titre blanc
   massif — parce qu'ils sortent de la même main. Sur eux, seul
   l'instant de la prise de vue se choisit. Le couple **06 garage ↔
   08 déneigement** est la seule collision réelle de la planche.
2. **La lèvre de laiton de l'hôtel se lit comme une barre de
   chargement** — un rectangle horizontal doré de 0 à 880 px sur 1440,
   puis sombre. C'est le geste visible à l'arrêt que le chantier
   exige, mais un rectangle rempli à 60 % est universellement une
   jauge. Jugé acceptable **à 460 px sur la planche**, où il se lit
   comme un filet sous le titre. Jamais tranché à 1440.
3. **Le sous-titre et le titre de la clinique disent la même chose
   deux fois** — « Physiothérapie, ostéopathie et nutrition, sous le
   même toit » puis « Trois métiers, un seul agenda ». Deux fois la
   même phrase à deux échelles est un élément par défaut au sens du
   critère 5. Non corrigé.
4. **Le côte-à-côte contre les références reste perdu pour la
   clinique**, et sans doute pour la boutique. Les trois références de
   la clinique sont des photos plein cadre ; le plein cadre appartient
   à cinq autres écrans de la matrice. Le gagner exigerait de casser
   la matrice, c'est-à-dire d'échanger un test contre l'autre.
5. **`tools/_refs/` est ignoré par git.** Les relevés neufs de cette
   passe — `coldpicnic`, `brzozowski`, `rendezvous`, `phive`,
   `pakau`, `medwest`, `function`, `heva`, `spaeth`, `klok` — n'existent
   que sur cette machine. La table `CHOIX` de `planche-refs.mjs` les
   désigne : sur un autre poste, les planches de références sortiront
   incomplètes en le disant.
6. **`tools/_refs/photo-keller/0-heros.png` ne rend plus que des
   icônes d'image cassée.** Relevé périmé, à refaire : la troisième
   case du côte-à-côte du photographe ne prouve rien.
7. **Deux outils de mesure de la passe photo sont jetables** —
   l'étalonnage par teinte moyenne en Lab et le relevé du geste ont
   été écrits dans le bac à sable de la session. Leurs chiffres ne
   sont pas rejouables tant qu'ils ne sont pas versés dans `tools/`.
8. **La correction de `demos-contraste.mjs` change 128 verdicts.**
   L'outil mesurait 128 blocs des neuf écrans contre un fond qui n'est
   pas peint là (piège 76). Le correctif ne peut que retirer de faux
   échecs — mais aucun de ces 128 n'a été remesuré un par un.
9. **`prefers-reduced-motion` n'a été vérifié qu'au DOM sur la plupart
   des écrans**, pas en capture.
10. **Restauration et déneigement émettent des erreurs de console
    d'hydratation React** qui viennent de leurs dépôts, pas du nôtre.
11. **AUCUNE de ces mesures n'a été prise sur un appareil réel.**
    Chromium sous Playwright, machine de bureau Windows. La réduction
    à 421 px est simulée. Le repli sous 720 px de plusieurs écrans n'a
    jamais été regardé à l'image.
