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
2. **`restau` — le héros devient noir dès qu'on a fait défiler la page
   d'un pixel** dans une fenêtre pilotée. Reproduit à chaque essai.
   Contourné en photographiant sans bouger. Cause non cherchée.

### Les chiffres invérifiables des sites de démonstration

Les captures montrent, entre autres, « 12 000+ véhicules », « 98 % »,
« 120+ projets livrés », « 5 000+ clients ». Ce sont les contenus de
démonstrations d'entreprises qui n'existent pas, et la ligne
d'honnêteté sous les quatre comparaisons le dit. Mais un visiteur qui
ne lit pas cette ligne voit des chiffres. **À trancher par le
propriétaire** : les neutraliser à la capture comme les coordonnées,
ou les laisser.

### Le tracteur du site de déneigement porte une marque réelle

La photo du héros montre un tracteur identifiable. Ce n'est pas une
fausse recommandation — c'est un objet dans une photo — mais aucun
masquage textuel ne peut l'atteindre.

### Les blocs photo gris des reconstitutions « avant »

Quinze rectangles gris subsistent du côté AVANT des comparaisons
(`.v11-photo`, `.gab-carr-photo`, `.gab-svc-i`). C'est un choix : un
site de 2011 et un gabarit acheté ont des blocs photo génériques, et
les reconstituer sans eux serait les flatter. `realisations-check.mjs`
les compte à part et ne juge que le côté APRÈS, où il n'en reste
aucun. **Si le propriétaire les trouve trop proches d'un placeholder,
il faut les remplir d'une trame.**

### FormSubmit n'est toujours pas activé

Inchangé. Les six formulaires livrent **6 / 6 par le repli courriel**,
vérifié de bout en bout le 2026-07-31 par `tools/formulaires-e2e.mjs`.
Le service répond 200 avec `success: "false"` et un message
d'activation. **Rien ne part automatiquement tant que le lien reçu par
courriel n'a pas été cliqué.**

### La réserve qui domine tout le reste n'a pas bougé

> **AUCUNE mesure de ce projet n'a été prise sur un appareil réel.**
