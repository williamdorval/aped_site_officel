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


<!-- INDEX:DEBUT -->

> **NE LIS PAS CE FICHIER EN ENTIER.** Cette table donne le titre exact
> de chaque partie et ce qu'elle coûte. Va chercher la seule qui répond :
> `grep -n "^### <titre>" <fichier>` puis lis la plage. Le titre est la clé —
> il ne périme pas, un numéro de ligne oui.

| Partie | Lignes | Jetons ~ |
|---|---:|---:|
| **Services et Réalisations, 2026-07-31** | 32 | 506 |
| **1 · LE PLUS GROS TROU DE PREUVE** | 44 | 599 |
| **2 · DÉFAUTS OUVERTS** | 110 | 1 601 |
| **3 · OUTILS PÉRIMÉS OU FAUX** | 25 | 338 |
| **4 · CONTENU ET LICENCES** | 41 | 556 |
| **5 · CE QUI N'A JAMAIS ÉTÉ TOUCHÉ DU DOIGT** | 14 | 189 |
| **Refonte immersive, 2026-07-31** | 24 | 352 |
| **OUVERTES APRÈS LA MISE EN PRODUCTION — 2026-07-31** | 2 | 15 |
| &nbsp;&nbsp;↳ Les captures des quatre « après » viennent de serveurs de DÉVELOPPEMENT | 8 | 112 |
| &nbsp;&nbsp;↳ Deux défauts trouvés DANS les projets sources, non corrigés | 27 | 426 |
| &nbsp;&nbsp;↳ FERMÉE le 2026-07-31 — les chiffres des sites de démonstration | 13 | 199 |
| &nbsp;&nbsp;↳ Le tracteur du site de déneigement porte une marque réelle | 6 | 66 |
| &nbsp;&nbsp;↳ FERMÉE le 2026-07-31 — les blocs photo gris des « avant » | 28 | 393 |
| &nbsp;&nbsp;↳ OUVERTES PAR LE CHANTIER DU CADRE NAVIGABLE — 2026-07-31 | 55 | 839 |
| &nbsp;&nbsp;↳ FormSubmit n'est toujours pas activé | 8 | 96 |
| &nbsp;&nbsp;↳ La réserve qui domine tout le reste n'a pas bougé | 6 | 36 |
| **Les douze secteurs, 2026-08-01 — ce qui reste ouvert** | 2 | 16 |
| &nbsp;&nbsp;↳ Deux des douze se ressemblent encore, et ce sont les deux projets RÉELS | 11 | 165 |
| &nbsp;&nbsp;↳ Le mouvement ne se voit pas dans l'aperçu du panneau | 12 | 172 |
| &nbsp;&nbsp;↳ Ce que les neuf sessions ont laissé ouvert, une ligne chacune | 24 | 1 086 |
| &nbsp;&nbsp;↳ La réserve qui domine, et elle n'a pas bougé | 8 | 64 |
| **Les douze secteurs, seconde passe — 2026-08-01** | 2 | 14 |
| &nbsp;&nbsp;↳ Ce qui reste ouvert sur l'aperçu vivant | 19 | 299 |
| &nbsp;&nbsp;↳ Ce que chaque session a laissé ouvert | 17 | 828 |
| &nbsp;&nbsp;↳ La réserve qui domine, et elle n'a pas bougé d'un mot | 8 | 96 |
| **Le chantier du premier écran — 2026-08-01, troisième passe** | 2 | 17 |
| &nbsp;&nbsp;↳ Ce que je n'ai PAS refait, et pourquoi | 17 | 239 |
| &nbsp;&nbsp;↳ Ce qui reste ouvert | 24 | 1 458 |
| **La passe finale — 2026-08-01, quatrième passe** | 53 | 867 |
| **Visite 360 et Agence — 2026-08-02** | 64 | 984 |
| **Le noir de la Visite — 2026-08-03** | 2 | 10 |
| &nbsp;&nbsp;↳ Les 110 planches « avant » de ce chantier ne prouvent PAS la réparation | 15 | 208 |
| &nbsp;&nbsp;↳ Trois états sur quatre ont été raisonnés, un seul a été photographié | 9 | 121 |
| &nbsp;&nbsp;↳ La course de 150vh est un arbitrage, et il n'a pas été mesuré sur un visiteur | 8 | 101 |
| &nbsp;&nbsp;↳ Et la réserve qui gouverne tout le reste n'a pas bougé | 10 | 98 |
| **Le chantier de conversion — 2026-08-02** | 2 | 12 |
| &nbsp;&nbsp;↳ Aucun formulaire du site n'a jamais livré | 11 | 152 |
| &nbsp;&nbsp;↳ Les modalités de paiement n'existent nulle part | 8 | 98 |
| &nbsp;&nbsp;↳ L'adresse de contact est une adresse Gmail personnelle | 8 | 96 |
| &nbsp;&nbsp;↳ Le socle du hero reste sous le pli à 1024 × 768 | 9 | 127 |
| &nbsp;&nbsp;↳ Trois des douze métiers n'ont pas d'écran | 6 | 53 |
| &nbsp;&nbsp;↳ Les deux nouveaux pièges sont des pièges de MESURE, pas de code | 8 | 114 |
| &nbsp;&nbsp;↳ Et la réserve qui gouverne tout le reste n'a toujours pas bougé | 9 | 99 |
| **Le chantier des sept items — 2026-08-03** | 6 | 60 |
| &nbsp;&nbsp;↳ Les trois vrais projets n'ont aucune adresse publique | 12 | 151 |
| &nbsp;&nbsp;↳ La commission de référence est un montant fixe, pas un pourcentage | 9 | 125 |
| &nbsp;&nbsp;↳ Quatre outils du sas mesurent une chose qui n'existe plus | 15 | 174 |
| &nbsp;&nbsp;↳ tools/etats-check.mjs rend un échec antérieur au chantier | 7 | 85 |
| &nbsp;&nbsp;↳ Le CLS n'était pas à zéro avant, et il ne l'est toujours pas | 15 | 154 |
| &nbsp;&nbsp;↳ tools/contraste-min.mjs sort en erreur sur une zone non touchée | 7 | 87 |
| &nbsp;&nbsp;↳ La FAQ n'a pas de sortie de secours sur téléphone | 9 | 111 |
| &nbsp;&nbsp;↳ Le serveur 8099 ne tournait pas | 6 | 62 |
| &nbsp;&nbsp;↳ Et celle qui gouverne tout le reste | 6 | 58 |
| **Corrections de design — 2026-08-03** | 5 | 36 |
| &nbsp;&nbsp;↳ Une adresse courriel reste atteignable, et c'est délibéré | 16 | 196 |
| &nbsp;&nbsp;↳ Les deux PDF publient une grille de prix APED | 14 | 164 |
| &nbsp;&nbsp;↳ tools/prix-check.mjs sort en code 2 | 10 | 132 |
| &nbsp;&nbsp;↳ Le déneigement est présenté comme une entreprise fictive | 13 | 173 |
| &nbsp;&nbsp;↳ Le masque RBQ ne masque plus rien | 7 | 78 |
| &nbsp;&nbsp;↳ Le téléphone du popup n'est pas validé | 6 | 58 |
| &nbsp;&nbsp;↳ Le decor des photos du « avant » n'est quebecois que par ressemblance | 12 | 168 |
| &nbsp;&nbsp;↳ Et celle qui gouverne tout le reste | 7 | 50 |
| **2026-08-03 · SIX CORRECTIONS** | 2 | 9 |
| &nbsp;&nbsp;↳ Aucun formulaire du site ne livre, et maintenant il le dit | 12 | 165 |
| &nbsp;&nbsp;↳ Les deux états « envoi en cours » et « succès » ne sont pas | 1 | 18 |
| &nbsp;&nbsp;↳ atteignables sur le site tel qu'il est | 7 | 86 |
| &nbsp;&nbsp;↳ tools/prix-check.mjs rend toujours le code 2 | 9 | 126 |
| &nbsp;&nbsp;↳ tools/production-check.mjs rend ECHEC : | 1 | 13 |
| &nbsp;&nbsp;↳ toutesLesImagesChargent | 9 | 109 |
| &nbsp;&nbsp;↳ La flèche du carrousel de la reconstitution est à 1,77:1 | 7 | 77 |
| &nbsp;&nbsp;↳ Le « après » du déneigement reste un vrai mandat sous une | 1 | 17 |
| &nbsp;&nbsp;↳ étiquette « entreprises fictives » | 8 | 100 |
| &nbsp;&nbsp;↳ Les quatre mentions sous les comparaisons ne sont pas accordées | 8 | 102 |
| &nbsp;&nbsp;↳ Et celle qui gouverne tout le reste | 9 | 75 |
| **OUVERTES PAR LE CHANTIER DE LA RÉSERVATION — 2026-08-06** | 2 | 16 |
| &nbsp;&nbsp;↳ Rien de tout ceci n'a touché le vrai Google | 26 | 353 |
| &nbsp;&nbsp;↳ Le fuseau est prouvé par le calcul, pas par un appel réel | 9 | 123 |
| &nbsp;&nbsp;↳ Le fuseau du projet Apps Script n'est pas sous contrôle | 13 | 176 |
| &nbsp;&nbsp;↳ FERMÉE le 2026-08-06 — le repli CalendarApp | 14 | 183 |
| &nbsp;&nbsp;↳ La deuxième porte est publique, et elle est appelable en boucle | 16 | 214 |
| &nbsp;&nbsp;↳ js/config.local.js absent = une erreur console, partout | 15 | 184 |
| &nbsp;&nbsp;↳ palier-check échoue sur trois assertions, avant comme après | 10 | 134 |
| &nbsp;&nbsp;↳ Dix montants en dollars dorment dans des commentaires | 20 | 261 |
| &nbsp;&nbsp;↳ Aucune animation n'a été ajoutée au panneau des créneaux | 13 | 179 |
| &nbsp;&nbsp;↳ Et celle qui gouverne tout le reste | 11 | 109 |
| **OUVERTES PAR LE CHANTIER DE STRESS — 2026-08-06** | 2 | 14 |
| &nbsp;&nbsp;↳ FERMÉE · le secret n'a jamais été poussé | 13 | 161 |
| &nbsp;&nbsp;↳ Le trou du verrou était une liste blanche d'extensions | 11 | 146 |
| &nbsp;&nbsp;↳ Le vrai service rend HTTP 404 — deux relevés qui ne s'accordent pas | 19 | 221 |
| &nbsp;&nbsp;↳ Les temps de réponse du vrai service | 16 | 216 |
| &nbsp;&nbsp;↳ Six envois simultanés : le verrou est resserré, PAS re-mesuré | 21 | 266 |
| &nbsp;&nbsp;↳ L'injection de formule — les charges sont posées, le verdict attend le redéploiement | 23 | 314 |
| &nbsp;&nbsp;↳ Le Sheet et le calendrier d'APED n'ont TOUJOURS pas été regardés | 27 | 325 |
| &nbsp;&nbsp;↳ FERMÉE le 2026-08-06 — les cibles tactiles | 25 | 282 |
| &nbsp;&nbsp;↳ OUVERTES PAR LE CHANTIER DE VALIDATION — 2026-08-06 (soir) | 46 | 602 |
| &nbsp;&nbsp;↳ Le changement de Code.gs n'est pas déployé | 20 | 241 |
| &nbsp;&nbsp;↳ Le préchargement n'a jamais été mesuré contre le vrai service | 6 | 76 |
| &nbsp;&nbsp;↳ Et celle qui gouverne tout le reste | 8 | 92 |
| &nbsp;&nbsp;↳ OUVERTES PAR LE PROGRAMME DE RÉFÉRENCE — 2026-08-07 (D-773) | 28 | 396 |
| &nbsp;&nbsp;↳ La grille se laisse deviner en RATIO, jamais en dollars | 18 | 226 |
| &nbsp;&nbsp;↳ « Jusqu'à 5 000 $ » sans son plancher | 13 | 176 |
| &nbsp;&nbsp;↳ Les trois autres assistants ont la même géométrie que celui qu'on vient de corriger | 15 | 224 |
| &nbsp;&nbsp;↳ Deux échecs d'outil qui EXISTAIENT AVANT ce chantier | 13 | 172 |
| &nbsp;&nbsp;↳ Le classeur attend quatre colonnes | 9 | 113 |

<!-- INDEX:FIN -->

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

**Le compteur de courriels de Google ne dit pas ce qu'on croit.**
*Ouverte le 2026-08-06. D-758.*

Relevé contre le vrai service : `verite-prod.mjs` fait naître **trois**
lignes, donc envoie **trois** avis internes. `MailApp.getRemainingDailyQuota()`
est passé de **9 à 4** — cinq unités pour trois envois.

Deux lectures possibles, et **rien dans ce dépôt ne permet de trancher** :
soit le compteur est quantifié et arrondi — c'est documenté comme
« approximatif » —, soit deux courriels partent sans qu'on sache
lesquels. Le second cas serait un vrai défaut.

**Ce qu'on en fait en attendant :** on ne se sert plus de ce compteur
comme d'un budget. Il sert de **plancher**, jamais de solde. Tout outil
qui dépense annonce d'abord combien il va dépenser, et on garde une
marge d'au moins le double.

**Comment trancher, quand le quota sera plein :** faire naître UNE seule
ligne, lire le compteur avant et après. Un écart de 1 ferme la réserve ;
un écart de 2 ouvre une chasse dans `traiter()`. C'est une mesure à
1 courriel, elle ne coûte rien — elle n'a pas été faite parce que le
quota était déjà à 4 quand la question s'est posée.

**Un `_sid` connu permet d'ÉCRIRE dans la ligne de quelqu'un d'autre.**
*Ouverte le 2026-08-06. D-744, D-761.*

`signature()` rend `"S:" + _sid` et `repererLigne()` retrouve la ligne
qui porte cette signature. Le `_sid` est donc la seule preuve
d'identité : **il n'est ni signé, ni lié à quoi que ce soit.** Une
requête forgée qui porte un `_sid` valide fusionne dans la ligne de son
propriétaire — elle peut y écrire n'importe quel champ du schéma.

**Ce qu'elle ne permet PAS**, et c'est vérifié par
`tools/securite-check.mjs` § 7 :
- **lire** la ligne : la réponse ne rend que `ligne`, `session`,
  `etape`, `champs`. Aucune valeur de visiteur n'en ressort ;
- toucher un **autre onglet** : la recherche se fait dans celui du
  `_form` ;
- écrire dans les **colonnes de suivi** : `ecrireLigne` ne lit que les
  champs du `SCHEMA`.

**Pourquoi c'est jugé faible.** `_sid` vaut 32 signes de
`crypto.randomUUID`, soit 128 bits. Il ne sort du navigateur que vers
notre propre service, il vit en `localStorage` (jamais en témoin, donc
jamais envoyé automatiquement), et le site ne fait aucune requête
tierce — il n'y a pas de fuite par en-tête `Referer` vers un tiers.
Deviner un `_sid` n'est pas praticable ; il faut le **voler**, ce qui
suppose déjà l'accès à l'appareil.

**Ce que coûterait la fermeture — un jeton signé.** Chiffré le
2026-08-06, non fait :

| | Ce qu'il faut | Coût |
|---|---|---|
| **Serveur** | à la naissance de la ligne, rendre `_jeton = HMAC-SHA256(sid, secret)` tronqué à 32 signes ; le secret vit en `PropertiesService`. `Utilities.computeHmacSha256Signature` existe déjà. | ~25 lignes |
| | `repererLigne` n'accepte une session que si le jeton reçu correspond | ~10 lignes |
| **Site** | garder le jeton à côté du `_sid` dans `localStorage`, le renvoyer à chaque étape | ~10 lignes |
| **Migration** | les sessions en cours n'ont pas de jeton. Ou bien on les casse — le visiteur repart d'une ligne neuve, on perd la fusion —, ou bien on accepte les deux formes pendant 30 jours, ce qui laisse le trou ouvert le temps de la transition | c'est ça, le vrai coût |
| **Banc** | 6 à 8 cas : jeton absent, jeton d'une autre session, jeton tronqué, secret changé | ~80 lignes |

**Le point de décision est la migration, pas le code.** Le reste tient
en une heure. Tant que ce n'est pas tranché, la réserve reste ouverte.

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

---

## Visite 360 et Agence — 2026-08-02

1. **L'entrée du cadre en V1 · DÉGAGER n'a jamais été photographiée
   en mouvement.** `tools/visite-sequence.mjs` prend ses images en
   mouvement réduit, où l'animation ne joue pas. La raison était
   mesurée (pièges 78 à 82) mais la réserve reste entière : **le
   mouvement du cadre est déclaré, pas prouvé en image.** La règle B du
   projet demande cinq captures et l'écart entre deux consécutives ; ce
   mouvement-là ne les a pas. **Depuis le 2026-08-03 l'instrument
   existe** — `tools/plaques.mjs` photographie en mouvement plein — mais
   il n'a pas été pointé sur A119b, et la réserve ne se ferme pas parce
   qu'un outil est disponible.

2. **TRANCHÉE le 2026-08-03 — c'était un vrai défaut de production, et
   il est réparé.** La réserve demandait si un visiteur voyait le même
   noir que la capture. Réponse : oui, et pas à cause de la capture.
   `.sas--calque .sas-volet` portait `top: 0; height: 130vh;
   transform: translateY(-102%)` — or `top: 0` est le haut du **sas**,
   donc monter de 102 % ne sortait pas du document : ça posait
   **1 193 px d'encre par-dessus les 130vh qui précèdent**, soit 88 %
   de `#visite`, mesuré à 1440 × 900. **Trois états sur quatre étaient
   couvrants** — le repos CSS, GSAP absent, et l'escalade de palier où
   `sas.js` pose lui-même `yPercent: -102`. Seul le scrub actif était
   sain. Un `div.sas-cache` rogne désormais la voie du volet : hors
   d'elle, il n'existe plus, quel que soit l'état (**D-629**).
   **La cause du faux acquittement de la veille** : « identique sur le
   code d'avant » avait été lu comme « artefact du harnais ». C'était
   « le défaut préexistait ». Pièges **81** (amendé), **83** et **84**.

3. **Le `pointe` (`langue.js` § 8) affiche encore « Regarder autour »
   au survol de `.tour-stage` AVANT le lancement**, c'est-à-dire à un
   moment où glisser ne fait rien. Même faute que la pastille de geste
   qu'on a refusé d'écrire (D-624), mais elle existait déjà et n'a pas
   été touchée.

4. **SANS OBJET le 2026-08-03 — la section 09 · Agence est retirée.**
   La réserve portait sur ses trois faits sans source affichée.
   « 1 interlocuteur » et « 12 h de délai » survivent au socle du hero,
   où ils étaient déjà, et où **la même réserve Q2 s'applique** : le
   visiteur n'a rien pour les vérifier hors de la cohérence interne du
   document. Ce qui change est seulement le calibre — 15 px au socle
   contre 80 px en affiche —, donc le coût s'ils sont contestés. « 0
   gabarit acheté » n'est plus affiché nulle part.

5. **`.tour-encours` est `aria-hidden`, et depuis le 2026-08-03 il n'a
   plus de doublure.** Le mode d'emploi visible une fois la visite
   ouverte n'est annoncé à **aucun** lecteur d'écran : il doublait
   `ul.tour-gestes`, qui était annoncé, et ce pied est parti avec
   D-632. **La réserve s'est donc aggravée, pas résolue.** Ce qui la
   borne : le lecteur reste pilotable au clavier — `tour360.js`
   rééquipe chaque point de passage avec `tabindex`, `role` et un nom
   accessible —, donc l'usage n'est pas perdu, seule l'annonce du mode
   d'emploi l'est. **Aucun lecteur d'écran réel n'a jamais parcouru ce
   site**, ni avant ni après.

6. **SANS OBJET le 2026-08-03** — l'écart de 64 px entre les mouvements
   2 et 3 de l'Agence n'existe plus avec la section.

7. **La planche avant/après ne comporte qu'UNE passe « avant ».** Le
   protocole du piège 29 en demande trois de chaque côté. Le plancher
   de bruit est donc estimé sur les deux passes « après » seulement.

---

## Le noir de la Visite — 2026-08-03

### Les 110 planches « avant » de ce chantier ne prouvent PAS la réparation

Elles sont dans `preuves/2026-08-03-cinq/avant/` et elles ont été
prises au **palier 0**, sur une page pilotée à la molette : le seul
des quatre états où le volet du calque était sain. **Le défaut ne s'y
manifeste pas** — ni avant le correctif, ni après. Comparer ces
planches à celles d'après ne peut donc rien dire de D-629, dans un
sens comme dans l'autre.

**Ce qui prouve la réparation est l'A/B au palier 2**, l'état où
`sas.js` pose lui-même `gsap.set(volet, { yPercent: -102 })` et où le
volet peignait. Une planche au palier 0 est une preuve de
non-régression **du reste de la page** ; ce n'est pas la preuve du
correctif, et il ne faut pas la citer comme telle.

### Trois états sur quatre ont été raisonnés, un seul a été photographié

Le repos CSS, GSAP absent et l'escalade de palier sont les trois états
couvrants. La mesure de 1 193 px et l'image entièrement noire ont été
relevées à **1440 × 900**, sur l'un d'eux. **Les deux autres sont
déduits de la règle CSS**, pas photographiés un par un — c'est le même
`translateY(-102%)` sur le même `top: 0`, mais le dépôt n'en garde pas
trois images.

### La course de 150vh est un arbitrage, et il n'a pas été mesuré sur un visiteur

37 % de molette en moins est un fait arithmétique — 2 160 px contre
1 350 à 900 de haut. « C'est le bon compromis » n'en est pas un :
personne n'a regardé quelqu'un descendre ce sas. La forge se voit
encore, ça `tools/sas-sequence.mjs` le montre ; **qu'elle se voie
assez, non.**

### Et la réserve qui gouverne tout le reste n'a pas bougé

> **AUCUNE mesure de ce projet n'a été prise sur un appareil réel.**
> Y compris celles de cette journée : `plaques.mjs` et
> `sas-sequence.mjs` tournent sous Chromium/Playwright sur un poste de
> bureau Windows. Le palier 2 n'a jamais été atteint autrement qu'en
> bridant le processeur.

---

## Le chantier de conversion — 2026-08-02

### Aucun formulaire du site n'a jamais livré

FormSubmit rend `HTTP 200` avec `{"success":"false"}` — « This form
needs Activation ». Sondé depuis la page servie, donc avec la bonne
origine. Le repli D-422 tient et ne ment pas au visiteur, mais **les
pièces jointes du formulaire de projet sont perdues** sur ce chemin,
et un visiteur en webmail sans gestionnaire `mailto:` n'aboutit nulle
part. Le courriel d'activation a été envoyé à l'adresse de contact le
2026-08-02. **Tant qu'il n'est pas cliqué, tout le reste du chantier
est décoratif.**

### Les modalités de paiement n'existent nulle part

La question ajoutée à la FAQ répond à la peur de la surprise — « le
prix est ferme et il est écrit » — mais **ne donne aucun acompte ni
calendrier de versement**. Je ne les connais pas, et les inventer
aurait échoué Q1. C'est la seule question du site dont la réponse est
volontairement incomplète.

### L'adresse de contact est une adresse Gmail personnelle

`l-adresse-personnelle-retiree`, quatre fois dans `index.html`, plus le
point d'arrivée de tous les formulaires. Pour un patron de PME qui
évalue une agence, c'est un signal de « ce n'est pas une entreprise ».
Le correctif demande un nom de domaine — ce n'est pas une décision de
code.

### Le socle du hero reste sous le pli à 1024 × 768

Mesuré avant comme après : `bas = 862` pour une fenêtre de 768. Sur le
portable le plus courant, aucune des trois réassurances n'est visible
au premier écran. **Non corrigé** — le corriger demande de déplacer la
structure du hero, que le brief interdit sans accord. Une tentative
par le texte a été mesurée puis **retirée** : elle poussait le second
CTA et les quatre délais chiffrés sous le pli (D-698).

### Trois des douze métiers n'ont pas d'écran

Restauration, garage, paysagement. Leur aperçu au survol existe, mais
il n'y a rien à ouvrir. Les neuf autres sont liés depuis `#demos`
(D-705).

### Les deux nouveaux pièges sont des pièges de MESURE, pas de code

87 et 88. Trois de mes sondes ont rendu un faux verdict pendant ce
chantier : lecture à 1 500 ms avant `data-lettres` et avant l'escalade
de palier ; `NaN` silencieux sur une image RGB lue comme RGBA ; et un
parcours des feuilles de style qui a rendu **zéro règle** sans le
signaler. Les trois ont été trouvées par l'image, jamais par le DOM.

### Et la réserve qui gouverne tout le reste n'a toujours pas bougé

> **AUCUNE mesure de ce chantier non plus n'a été prise sur un
> appareil réel.** Le palier 1 y est atteint sous Chromium/Playwright
> sur un poste de bureau Windows — sur un vrai téléphone il serait la
> règle, pas l'exception, et c'est justement ce qui rendait le piège
> 87 invisible.


## Le chantier des sept items — 2026-08-03

Sept items demandés, sept livrés, plus un correctif de
non-régression. Point de retour `49d3bc3`. Détail et captures :
`preuves/2026-08-03-chantier-sept-items/RAPPORT.md`.

### Les trois vrais projets n'ont aucune adresse publique

L'item 1 demandait de garder l'action « ouvrir ou visiter » sur les
trois métiers qui ont un site complet derrière — garage, restauration,
paysagement et déneigement. **Aucun des trois n'est publié.**
`demo-carroserie`, `restau` et `MV-deneigement` sont des projets
locaux, et le dépôt ne contient aucune URL vers eux.

L'action pointe donc vers leur avant/après, dans `#realisations` — la
seule destination réelle que le site contrôle. Trois adresses
publiques la rendraient exacte.

### La commission de référence est un montant fixe, pas un pourcentage

Le libellé demandé pour l'étape 04 était « Vous touchez votre
pourcentage ». La grille publiée dans `#modal-refer` verse un montant
FIXE par tranche : 500 · 700 · 1 500 · 3 000 · 4 000 · 5 000 $ selon
la valeur du contrat. L'étape dit « Vous êtes payé ». **Si le
programme est passé au pourcentage, deux endroits sont à corriger
ensemble**, et `tools/prix-check.mjs` le verra.

### Quatre outils du sas mesurent une chose qui n'existe plus

Le sas « descente », sa forge de limaille et le mot « Essayez. » sont
partis avec la chambre noire. Restent, sans cible :

- `tools/forge-check.mjs` — cherche `.sas[data-sas="descente"]`, son
  volet et son mot, et vérifie que le fond vaut `--chambre` ;
- `tools/sas-sequence.mjs` — piste, mot, forge de la descente ;
- `tools/_sas-1920.mjs` et `tools/_sas-sombre.mjs` — même piste ;
- `tools/sas-check.mjs` — lit le fond de `#visite` en attendant du
  noir.

**Ils vont crier, et ils auront tort.** Non corrigés : le chantier
interdisait de toucher aux outils.

### `tools/etats-check.mjs` rend un échec antérieur au chantier

Il clique `.nav-cta`, qui porte `data-modal-open="modal-project"`, et
assère ensuite sur `#modal-start`. Avec le balisage actuel
l'assertion ne peut pas passer. `git diff 49d3bc3` est **vide** sur
ces deux zones : le défaut vit dans l'outil.

### Le CLS n'était pas à zéro avant, et il ne l'est toujours pas

Relevé A/B en worktree contre `49d3bc3`, même machine, même fenêtre :

| | CLS | décalages |
|---|---:|---:|
| avant le chantier | 0,0021 | 29 |
| après les sept items | 0,0033 | 31 |
| après le correctif | **0,0019** | 29 |

Le décalage ajouté était `P.referral-max` — le montant « 5 000 $ » se
remesurait à l'échange de police. Corrigé. Ce qui reste vient de
l'odomètre du calculateur et des lettres des boutons, tous antérieurs.
**Le seuil du projet dit CLS = 0 ; il n'est pas tenu.**

### `tools/contraste-min.mjs` sort en erreur sur une zone non touchée

Un chevron `›` de 5 px sur fond photographique dans `#realisations`,
à 1,77:1. L'outil note lui-même « 63 hors calcul : fond en image ou
dégradé, à mesurer à l'image ». `tools/theme-check.mjs`, qui mesure
5 largeurs × 2 thèmes, rend 0 échec.

### La FAQ n'a pas de sortie de secours sur téléphone

`.faq-aside` — l'adresse courriel et « Poser la question de vive
voix » — est en `display: none` sous 64em (D-238). Un visiteur de
téléphone dont la question n'y est pas n'a aucune issue depuis cette
section ; il lui reste le pied de page et le menu. Non corrigé : la
consigne de l'item 6 était « polir seulement, ne change pas la
structure ».

### Le serveur 8099 ne tournait pas

Il devait tourner du côté du propriétaire ; `ERR_CONNECTION_REFUSED`
au premier appel. Démarré par la session avec `node tools/serve.mjs
8099`, sans quoi aucune capture n'était possible.

### Et celle qui gouverne tout le reste

> **AUCUNE mesure de ce chantier non plus n'a été prise sur un
> appareil réel.** Chromium sous Playwright, poste de bureau Windows,
> relevés « téléphone » compris.

## Corrections de design — 2026-08-03

Sept items livrés. Détail et captures :
`preuves/2026-08-03-corrections-design/RAPPORT.md`.

### Une adresse courriel reste atteignable, et c'est délibéré

Le site n'affiche plus aucune adresse : zéro `mailto:`, zéro adresse
écrite, vérifié sur le rendu d'`index.html` et de `404.html`, modales
et popup ouverts.

**Sauf une.** `CONTACT_EMAIL` dans `js/main.js` alimente le repli
`mailto:` qui s'affiche **quand un envoi de formulaire échoue** —
« Ouvrir mon courriel, message déjà écrit ». Comme FormSubmit n'a
jamais été activé, c'est aujourd'hui le chemin **normal**, pas
l'exception. Un balayage statique ne le voit pas.

Retiré aujourd'hui, il ferait échouer les formulaires **en silence**.
Il disparaît au branchement vers le Sheet. **C'est la première chose
à faire au prochain chantier.**

### Les deux PDF publient une grille de prix APED

`documents/src/aped-automatisation.html`, tableau « Le point mort » :
mise en place de 700 $ à 12 000 $ par type de mandat, abonnements
annuels, « coût an 1 » jusqu'à 16 300 $, et une note de méthode qui
valorise « l'entretien à 35 $ l'heure ».

Les seuls prix autorisés sur le site sont désormais **75 $ l'heure,
40 % au démarrage et le plafond de 5 000 $**. Ces deux documents se
téléchargent depuis le popup : ils sont donc publics.

Non régénérés — un chapitre entier de 42 pages repose sur ces
chiffres. **Arbitrage du propriétaire.**

### `tools/prix-check.mjs` sort en code 2

Il exige que `BAREME` existe et refuse de rendre zéro en silence. Le
barème a été retiré volontairement le 2026-08-03 ; l'outil ne peut pas
le savoir. Son propre message dit : « va le vérifier à la main avant
de me croire ». Fait, avec une sonde hors dépôt qui lit la page
rendue : seuls 75 $, 40 % et 5 000 $ subsistent, plus les sorties
vivantes du calculateur, qui sont les chiffres du visiteur.
**L'outil est à mettre à jour.**

### Le déneigement est présenté comme une entreprise fictive

`#realisations` annonce « Quatre démonstrations, entreprises fictives
— pas des mandats livrés ». Le « après » du déneigement est la
capture d'un site RÉEL : « Déneigement MV », « Shawinigan depuis
2005 », et son adresse civique — **1250, avenue de la Station** — que
les masques de `tools/demos-sites.mjs` ne couvrent pas. Ils masquent
le téléphone, le RBQ et le courriel, pas l'adresse, contrairement aux
trois autres projets où elle devient « Adresse sur demande ».

Antérieur à ce chantier. Soit le libellé est faux, soit l'adresse ne
doit pas être publiée.

### Le masque RBQ ne masque plus rien

`demos-capture.mjs` signale `RBQ\s*:?\s*[\d-]+` comme SANS EFFET : le
site du client ne porte plus son numéro. Sans conséquence, mais un
masque qu'on croit actif et qui ne l'est plus est exactement ce qui
laisse passer la prochaine donnée.

### Le téléphone du popup n'est pas validé

`validate()` vérifie qu'il n'est pas vide. Un visiteur qui tape « 1 »
passe et repart avec les guides. La validation de forme viendra avec
le doublage côté serveur.

### Le decor des photos du « avant » n'est quebecois que par ressemblance

Les 14 photos de la reconstitution du deneigement viennent de Pexels.
Maisons a pignon, brique, epinettes, garages doubles : ca ressemble.
Mais deux viennent d'Europe de l'Est et une du Canada anglais. Rien
n'y designe un lieu, aucune marque, aucun visage identifiable a la
taille rendue — verifie sur la tuile produite agrandie trois fois.

La carte « epandage d'abrasifs » lit « entretien hivernal » plutot
qu'« epandage » : toutes les vraies photos d'epandeuse trouvees
portaient une marque lisible. La legende porte le sens.

### Et celle qui gouverne tout le reste

> **AUCUNE mesure de ce chantier non plus n'a été prise sur un
> appareil réel.** Chromium sous Playwright, poste de bureau Windows.

---

## 2026-08-03 · SIX CORRECTIONS

### Aucun formulaire du site ne livre, et maintenant il le dit

L'item 6 a retiré l'adresse personnelle. Elle **était** le point de
sortie : `FORM_ENDPOINT` valait `https://formsubmit.co/ajax/` + elle.
On ne pouvait pas retirer l'une en gardant l'autre.

`FORM_ENDPOINT` est donc vide, et les sept formulaires échouent tout
de suite, avec un message visible et la saisie conservée. **Rien n'a
été perdu au passage** : FormSubmit n'a jamais été activé, l'échec
était déjà le cas nominal. Mais le site est maintenant une coquille
franche, et c'est exactement ce que le prochain chantier branche.

### Les deux états « envoi en cours » et « succès » ne sont pas
### atteignables sur le site tel qu'il est

Ils existent dans le code et ils ont été photographiés — mais en
**détournant le réseau** dans la sonde, pas sur le site servi. Sans
point de sortie, l'échec est instantané et ces deux états passent
sans être vus. Ils reviendront d'eux-mêmes au prochain chantier.

### `tools/prix-check.mjs` rend toujours le code 2

Inchangé depuis le chantier précédent : la grille `BAREME` qu'il
cherche n'existe plus, et l'outil refuse de rendre zéro en silence.
Vérifié à la main sur le RENDU : les seuls montants affichés sont les
trois autorisés, plus le **42 $** du calculateur — qui est la valeur
que **le visiteur règle lui-même** (« Ce que vous coûte une heure de
main-d'œuvre »), pas un prix d'APED. Antérieur à ce chantier.

### `tools/production-check.mjs` rend `ECHEC :
### toutesLesImagesChargent`

Onze écrans de secteur sont comptés « VIDE ». Ils vivent dans
`<template id="tplSecteurs">` (D-051), donc inertes tant qu'un métier
n'est pas choisi — et le seul chargé, `ecran-restaurant`, est
justement le seul absent de la liste. Les douze fichiers existent et
aucun n'a bougé dans ce chantier. Verdict antérieur, pas une
régression. L'outil n'a pas été touché.

### La flèche du carrousel de la reconstitution est à 1,77:1

`tools/contraste-min.mjs` la relève dans `#realisations`. C'est le
`›` du carrousel **du mauvais site reconstitué** — un défaut
représenté, pas un défaut du site d'APED. Antérieur. Le minimum réel
du site est 4,7:1.

### Le « après » du déneigement reste un vrai mandat sous une
### étiquette « entreprises fictives »

L'item 1 a rendu le « avant » cohérent avec lui — même nom, même
ville, même métier. Mais l'en-tête de la section dit « quatre
démonstrations, entreprises fictives », alors que la capture du
déneigement vient d'un vrai projet livré, avec sa ville visible.
Réserve ouverte depuis le chantier précédent, non résolue ici.

### Les quatre mentions sous les comparaisons ne sont pas accordées

`Avant&nbsp;: un site de 2011` · `avant : une fiche d'annuaire` ·
`Fiche tenue par l'office` · `avant : un site resté à l'hiver 2019`.
Casse du « a » et espacement avant le deux-points diffèrent, et la
troisième n'annonce pas un « avant ». Seule la quatrième était dans
le périmètre de ce chantier.

### Et celle qui gouverne tout le reste

> **AUCUNE mesure de ce chantier non plus n'a été prise sur un
> appareil réel.** Chromium sous Playwright, poste de bureau Windows.
> Les relevés « 390 px » de l'item 5 sont une fenêtre redimensionnée,
> pas un téléphone.

---

## OUVERTES PAR LE CHANTIER DE LA RÉSERVATION — 2026-08-06

### Rien de tout ceci n'a touché le vrai Google

C'est la réserve mère de ce chantier, et elle vaut pour tout ce qui
suit. `google/Code.gs` a été **exécuté** — pas relu, exécuté — par
`tools/faux-google.mjs`, qui l'évalue sous Node avec des services
Google en mémoire. 41 cas de `creneaux-check` et 17 de `creneaux-vue`
passent. Mais :

- **aucun vrai Google Agenda n'a été interrogé.** Le bouchon rend la
  forme **documentée** de `Calendar.Events.list` — `start.date` pour
  une journée entière, `transparency: "transparent"` pour
  « Disponible », `attendees[].self` pour une invitation refusée.
  La forme documentée n'est pas la forme observée ;
- **aucun lien Meet réel n'a été créé.** `conferenceData` vient d'un
  bouchon ;
- **aucun courriel n'est parti** vers une vraie boîte. Les sept
  gabarits ont été construits et comptés, jamais reçus ;
- **aucune autorisation OAuth n'a été accordée**, donc rien ne prouve
  que le compte acceptera les portées demandées ;
- **le service avancé Calendar n'a jamais été activé** dans un vrai
  projet Apps Script.

Ces cinq-là se ferment en une seule séance, à la main, en suivant
`docs/CONFIGURATION-GOOGLE-APED.md` étape 8.2. Tant que ce n'est pas
fait, **aucune session ne doit écrire que la réservation fonctionne.**

### Le fuseau est prouvé par le calcul, pas par un appel réel

`instantLocal` est vérifié sur six dates, dont les deux dimanches de
bascule de 2026, et sur la totalité des créneaux rendus. Ce qui
n'est **pas** vérifié : qu'un événement posé par le script tombe à
la bonne heure dans l'interface de Google Agenda. Le premier test
réel doit comparer l'heure affichée sur le site, celle du courriel,
et celle de l'agenda — les trois, côte à côte.

### Le fuseau du projet Apps Script n'est pas sous contrôle

`google/appsscript.json` déclare `"timeZone": "America/Toronto"`,
mais ce fichier est une **référence** : le guide dit de coller
`Code.gs` à la main, pas de remplacer `appsscript.json`. Le fuseau
réel du projet est celui du menu déroulant de l'éditeur, réglé sur
le fuseau du navigateur au moment de la création.

Le code ne s'y fie pas — `decalageMin` demande le décalage de
Toronto à chaque appel — mais **`initialiser()` pose le fuseau du
CLASSEUR** à `REGLAGES.FUSEAU`, et les horodatages du Sheet en
dépendent. À vérifier une fois : ⚙ Paramètres du projet → fuseau.

### FERMÉE le 2026-08-06 — le repli `CalendarApp`

Il n'était pas seulement non testé : **une mutation a prouvé qu'on
pouvait le casser sans faire tomber un seul cas.** Le banc fournissait
toujours `Calendar`, donc les 41 de `creneaux-check` passaient tous
par la branche d'à côté.

`tools/faux-google.mjs` évalue désormais `Code.gs` **une seconde
fois** sans le service avancé (`gsSansAvance`), et
`agenda-multi-check` l'exerce sur dix cas : la grille identique, une
journée bloquée qui disparaît, « Disponible » qui bloque quand même
faute de savoir lire la marque, un agenda illisible qui ferme la
porte, et une réservation qui se pose **sans lien Meet**.

### La deuxième porte est publique, et elle est appelable en boucle

`?action=creneaux` ne demande rien : ni jeton, ni référent, ni
limite. C'est nécessaire — un visiteur n'est connecté à aucun compte
Google. Ce qu'elle expose est mince (des heures libres, aucun titre,
aucune adresse — vérifié par `creneaux-check`), mais elle consomme du
**temps d'exécution Apps Script**, plafonné à 90 min/jour sur un
compte gratuit. Une boucle malveillante peut donc éteindre
l'affichage des créneaux pour la journée.

Ce qui reste debout dans ce cas : le calendrier bascule sur son
filet, le POST continue de fonctionner, et le serveur revérifie
quand même à la confirmation. Rien ne se perd, l'affichage ment
juste un peu. **Non mesuré** : combien d'appels il faut pour y
arriver.

### `js/config.local.js` absent = une erreur console, partout

Sur un dépôt fraîchement cloné, `index.html` injecte
`js/config.local.js` qui n'existe pas encore : le navigateur écrit
`Failed to load resource: 404`. Le seuil « erreurs console : 0 » de
`CLAUDE.md` est donc **inatteignable tant que `node
tools/config-envoi.mjs` n'a pas tourné**. `etats-check` et
`langue-check` échouent là-dessus, et sur rien d'autre.

Mesuré le 2026-08-06 : en servant un `config.local.js` valide,
**0 requête en 404** dans les quatre états du panneau de réservation,
deux thèmes compris. Le 404 est bien celui-là, et lui seul.

Antérieur à ce chantier — il arrive avec `D-720`.

### `palier-check` échoue sur trois assertions, avant comme après

Vérifié en A/B dans un worktree sur `HEAD` : `--cran d'un bouton
secondaire`, `--cran d'un CTA primaire`, et le `--cran` du palier 2
échouent **à l'identique** sur le dépôt d'avant ce chantier. C'est
le piège 88 (`::before` d'un `.btn` pris par l'aplat de V4). La
fréquence relevée sous bridage varie de 20 à 60 i/s d'un lancement à
l'autre sur cette machine : le déclencheur du palier 2 n'est pas
reproductible ici.

### Dix montants en dollars dorment dans des commentaires

`tools/prix-check.mjs` ARRÊTAIT depuis le 2026-08-03 : il cherchait
`var BAREME`, retiré ce jour-là par D-353, et `process.exit(2)`
empêchait le reste du contrôle de s'exécuter. **L'interdit « aucun
prix » n'était donc plus vérifié du tout depuis trois jours.**

Réparé le 2026-08-06 (D-728). Le verdict est maintenant : **0 prix
non autorisé dans le source, 0 dans le texte rendu, 0 grille**. Mais
l'outil relève aussi **10 montants dans des commentaires** —
`1 000 $`, `100 000 $`, `2 500 $`, `40 000 $`, `75 $` — tous dans
des blocs qui expliquent le RETRAIT de la grille, aux lignes
`index.html:3629-3631`, `index.html:3753-3755`, `js/main.js:83-85`
et `js/main.js:2413`.

Aucun n'atteint un visiteur. Mais le dépôt est **public** : ces
commentaires publient en creux les anciens paliers tarifaires
d'APED. **Arbitrage du propriétaire** — l'outil les nomme et ne
tranche pas.

### Aucune animation n'a été ajoutée au panneau des créneaux

L'arrivée des vraies plages remplace une liste par une autre. Ça
aurait pu être V1 — une forme déjà là qui se découvre — mais
l'animation aurait dépendu de GSAP, qui arrive en vague 2, alors que
le calendrier est peint par `main.js` en vague 1. Un mouvement qui
ne s'exécute pas aux paliers 2 et 3 n'est pas un mouvement.

Ce qui a été fait à la place est nommable : le **cran V4** de
`.slots-list.is-attente` — les plages passent de `rule-strong` à
`rule` et de `ink` à `ink-muted` pendant la relecture, sans état
intermédiaire, et cessent d'être cliquables. Elles restent lisibles.

### Et celle qui gouverne tout le reste

> **AUCUNE mesure de ce chantier non plus n'a été prise sur un
> appareil réel.** Chromium sous Playwright, poste de bureau Windows.
> Le panneau de réservation n'a jamais été ouvert sur un téléphone,
> et la phrase du guide « bloquez une journée depuis votre
> téléphone » décrit un geste dans Google Agenda, pas un geste
> vérifié sur le site.

---

## OUVERTES PAR LE CHANTIER DE STRESS — 2026-08-06

### FERMÉE · le secret n'a jamais été poussé

`.env.local.example` — suivi par git — portait la vraie adresse de
déploiement et l’adresse de l’agence. Vérifié à trois endroits :

- `git log --all -S "<identifiant du déploiement>"` ne rend **rien** ;
- `origin/main:.env.local.example` porte `APED_WEB_APP_URL=` **vide** ;
- seul le fichier de travail était modifié, jamais commité.

**Aucun redéploiement n'est nécessaire.** L'adresse reste privée.
Valeurs déplacées dans `.env.local` (ignoré), modèle remis à vide,
et `tools/verrou-env.mjs` refuse désormais tout modèle non vide.

### Le trou du verrou était une liste blanche d'extensions

`verrou-env.mjs` filtrait sur `js|mjs|html|css|json|md|gs|txt|yml|
yaml`. `.env.local.example` n'a aucune de ces extensions : le fichier
dont le **sujet** est de porter des clés était le seul que le verrou
n'ouvrait jamais, et il annonçait « ✓ 2509 fichiers relus ».

C'est la forme générale du piège 30/40/62 : **un filtre qui écarte
silencieusement ce qu'il est censé trouver.** Corrigé en inversant —
on lit tout sauf le binaire. À retenir pour tout futur filtre.

### Le vrai service rend HTTP 404 — deux relevés qui ne s'accordent pas

| Jour | Appels | HTTP 404 | Taux |
|---|---:|---:|---:|
| 2026-08-05 | 36 | **2** | 5,6 % |
| 2026-08-06 | 60 | **0** | 0 % |

Ce n'est pas `Code.gs` — c'est le renvoi de `/exec` vers
`googleusercontent.com`, l'étage devant lui. Le site réessaie deux
fois (D-734), et le service est idempotent pour que ce soit sûr
(D-730).

**Les deux relevés ne s'accordent pas, et c'est le résultat.** Le
défaut est intermittent : une journée sans aucun échec ne prouve pas
qu'il a disparu. Sur les 96 appels cumulés, p ≈ 2,1 % ; avec deux
réessais, p³ ≈ 0,001 %, soit une demande perdue sur ~110 000. C'est
suffisant **si p reste là**. Ce qui n'est toujours pas mesuré : le
taux aux heures de pointe, et sur plus d'une heure d'affilée.

### Les temps de réponse du vrai service

| Porte | Appels | médiane | p90 | max |
|---|---:|---:|---:|---:|
| témoin de vie · 2026-08-05 | 30 | 826 ms | 1 290 ms | 4 324 ms |
| témoin de vie · 2026-08-06 | 60 | **773 ms** | 1 132 ms | 1 666 ms |
| créneaux · 2026-08-05 | 25 | 1 716 ms | 3 100 ms | **29 893 ms** |
| créneaux · 2026-08-06 | ~15 | ~1 800 ms | ~2 100 ms | 2 086 ms |
| écriture d'une réservation | 4 | ~5 100 ms | — | 6 011 ms |

**Le pic à 29,9 s n'est toujours pas expliqué**, et il ne s'est pas
reproduit le 2026-08-06. Il n'est donc ni compris ni éliminé — il
est seulement **borné** : depuis D-741, la requête des créneaux
abandonne à 8 s et montre le filet, un envoi abandonne à 25 s et le
dit. Le visiteur ne regarde plus une roue tourner une demi-minute.

### Six envois simultanés : le verrou est resserré, PAS re-mesuré

`LockService` sérialise les écritures, et c'est ce qui empêche deux
personnes de réserver la même plage. Le prix relevé le 2026-08-05 :
six soumissions lancées ensemble, **18,4 s** pour la dernière servie.

**Corrigé (D-738)** : le verrou ne tient plus pendant les deux
`MailApp.sendEmail`. Il ne couvre que le numéro de ligne et la plage
du calendrier — les deux seules courses. Les courriels partent après
sa libération.

**LA NOUVELLE MESURE N'A PAS ÉTÉ PRISE.** Six envois simultanés
consomment douze destinataires du quota de 100/jour, et il en restait
trop peu le 2026-08-06 pour rejouer l'essai honnêtement. Le gain est
donc **attendu, pas prouvé** : deux envois à ~1,5 s chacun sortent
d'une section critique qui en durait ~3.

Ce que la correction prouve, elle : un courriel qui lève ne fait plus
échouer une demande **déjà écrite au classeur**
(`agenda-multi-check`, section 5).

### L'injection de formule — les charges sont posées, le verdict attend le redéploiement

`ecrireLigne` pose le format `@` sur les colonnes du visiteur avant
`setValues`. `idempotence-check` prouve que l'appel part, dans le bon
ordre, sur les bonnes colonnes. `faux-google` modélise désormais la
règle de Sheets elle-même — une chaîne commençant par `=`, `+`, `-`
ou `@` devient une formule **sauf** si la cellule porte déjà le
format texte — et `agenda-multi-check` lit le verdict par
`getFormulas()`.

**Ce n'est toujours pas Google.** Le 2026-08-06, trois charges ont
été envoyées au VRAI classeur : `=1+1`, `+41855501@42`, et
`=IMPORTXML("https://exemple.ca/x","//a")`. Les trois lignes y sont.

**Le verdict ne peut pas être lu tant que le redéploiement n'est pas
fait** : il se lit par `?action=diag`, qui n'existe qu'à partir de la
version 3. Après le redéploiement :
`node tools/formulaires-prod.mjs 8099 --reel` l'imprime.

**Rappel du chantier précédent :** cinq essais du 2026-08-05 sont
partis vers le vrai classeur AVANT la correction. Ces lignes portent
peut-être des formules actives. `nettoyerAutotest` les retire.

### Le Sheet et le calendrier d'APED n'ont TOUJOURS pas été regardés

Le propriétaire a partagé le classeur en lecture avec son compte
personnel le 2026-08-06. **Il reste invisible depuis cette session.**
Quatre recherches, à quarante minutes d'intervalle :

| Requête Drive | Résultat |
|---|---|
| `sharedWithMe = true` | 14 fichiers, aucun d'`apedagence` |
| `title contains 'APED'` | vide |
| `title contains 'demandes du site'` | vide |
| `owner = 'apedagence@gmail.com'` | vide |

De même, `list_calendars` ne rend que l'agenda personnel et les
jours fériés — **le calendrier d'APED n'est pas partagé du tout.**

Deux causes possibles, non départagées : un partage **par lien**
plutôt que par adresse (un fichier partagé ainsi n'entre dans
« Partagés avec moi » qu'une fois ouvert), ou un délai d'indexation
Drive qui dépasse quarante minutes.

**La porte `?action=diag` (D-737) rend ce partage inutile.** Elle
rend la structure du classeur et le contenu des seules lignes
d'essai, sans aucun accès Drive. Elle n'existe qu'à partir de la
version 3 : **tant que le redéploiement n'est pas fait, l'apparence
du classeur reste non vérifiée**, exactement comme avant.

### FERMÉE le 2026-08-06 — les cibles tactiles

`node tools/pouce-check.mjs 8099` — **18 cas sur 18**, aux trois
largeurs, seuil AAA de WCAG 2.5.5 (44 px) compris.

| largeur | case de jour | plage | forme |
|---|---|---|---|
| 320 px | **254 × 48** ✓ | 123 × 44 ✓ | liste |
| 360 px | **294 × 48** ✓ | 143 × 44 ✓ | liste |
| 390 px | 45 × 44 ✓ | 158 × 44 ✓ | grille |

Sous 24 rem, la grille de sept colonnes devient une **liste pleine
largeur**, une ligne par jour offert (D-740). La contrainte n'était
pas la hauteur, c'était les sept colonnes : on les a retirées au lieu
de gratter des pixels.

**Le seuil de 24 rem est mesuré, pas calculé.** L'arithmétique de
tête donnait 348 px et elle avait tort — elle oubliait le
remplissage propre du panneau. `pouce-check` a rendu le vrai chiffre :
la grille ne tient les 44 px qu'à partir de **378 px** de fenêtre.

Reste vrai, et c'est la réserve mère : **aucun vrai pouce n'a touché
cet écran.** `isMobile: true, hasTouch: true` sous Playwright, sur un
poste Windows.

### OUVERTES PAR LE CHANTIER DE VALIDATION — 2026-08-06 (soir)

#### Les courriels n'ont été vus par personne

Aucun des sept formulaires n'a permis de **lire** un courriel. Le
connecteur Gmail de cette session n'est pas authentifié, et il vise
de toute façon le compte personnel ; les avis partent à
`apedagence`. Ce qui est prouvé : que `MailApp.sendEmail` est
appelé, avec le bon destinataire, le bon objet, le bon `replyTo`, et
un corps différent par formulaire (`agenda-multi-check` section 5,
`idempotence-check` section 8).

**Ce qui ne l'est pas** : qu'ils arrivent, qu'ils ne tombent pas en
indésirable, et que « Répondre » vise bien le client dans le client
de messagerie. Les trois se vérifient en trente secondes — par le
propriétaire, dans sa boîte.

#### La grille de 9 h à 20 h, sept jours sur sept, n'est pas un choix neutre

Elle offre **105 créneaux par semaine**. Le préavis de 24 h et
l'agenda en retirent une partie, mais un dimanche à 19 h reste
réservable, et rien dans le code ne s'y oppose.

Ce que ça veut dire concrètement : **toute soirée et toute fin de
semaine non bloquée dans l'agenda est vendue.** Le montage à deux
agendas (D-736) existe justement pour que la vie personnelle compte
sans avoir à la recopier ailleurs — mais il faut l'activer, et il
n'est pas activé par défaut.

#### Le pic de 29,9 s est borné, pas expliqué

D-741 pose 8 s sur les créneaux et 25 s sur un envoi. Le visiteur ne
regarde plus une roue tourner. **La cause reste inconnue**, et un
envoi qui dépasse 25 s laisse une ambiguïté réelle : la demande est
peut-être passée. Le message le dit et invite à renvoyer, ce qui est
sans danger (D-730) — mais c'est une gêne, pas une réparation.

#### Le nombre exact de lignes d'essai dans le vrai classeur n'est pas connu

Il est **estimé** à une vingtaine, sur les sept onglets, plus deux
événements d'agenda du 7 août et deux de septembre. L'estimation
vient des réponses du service (`ligne`, `renvoi`) et de ce qui a
disparu de la porte des créneaux — **pas d'une lecture du classeur**,
qui reste inaccessible. Le compte exact sortira de `nettoyerAutotest`,
qui journalise chaque onglet et chaque ligne retirée.

### Le changement de Code.gs n'est pas déployé

**Vérifié le 2026-08-06 au soir** : le témoin de vie rend
`"version": 2`. La version du dépôt est la **3**. Le déploiement
porte donc encore le code d'avant ce chantier-ci — le précédent, lui,
a bien été déployé (dédoublonnage, formats, colonnes, courriels).

Ce qui n'existe pas encore pour un visiteur :

| | Ce qui manque en production |
|---|---|
| **D-736** | les agendas supplémentaires — un blocage personnel ne bloque rien |
| **D-737** | la porte `?action=diag` — d'où l'impossibilité de lire le classeur |
| **D-738** | le verrou resserré, et le courriel qui ne perd plus la demande |
| **grille** | 9 h–20 h, sept jours sur sept, sans pause |

**Ce qui est déjà en ligne**, lui, est du côté du site et n'attend
rien : la politique de confidentialité, les sept mentions, la liste
au pouce, les délais maximum.

### Le préchargement n'a jamais été mesuré contre le vrai service

Il est prouvé fonctionnel contre le banc (`creneaux-vue`, 17/17) et
le gain théorique est le temps du geste. **Le gain réel — combien de
millisecondes un visiteur récupère vraiment — n'a pas été relevé.**

### Et celle qui gouverne tout le reste

> **AUCUNE mesure de ce chantier non plus n'a été prise sur un
> appareil réel.** Les relevés « 320 px » et « 390 px » viennent de
> `isMobile: true, hasTouch: true` sous Playwright, sur un poste de
> bureau Windows. **Le panneau de réservation n'a jamais été touché
> par un vrai pouce.**

### OUVERTES PAR LE PROGRAMME DE RÉFÉRENCE — 2026-08-07 (D-773)

**LE FISCAL ET LE LÉGAL N'ONT ÉTÉ VALIDÉS PAR PERSONNE.** L'article 10
des conditions dit que le référent est responsable de ses propres
obligations fiscales, et il ne prétend rien d'autre. C'est
volontairement prudent, parce que le sujet est incertain sur au moins
quatre points, tous à faire trancher par un comptable :

- fédéral, un feuillet **T4A case 048** semble requis au-delà de
  **500 $** versés à un même bénéficiaire dans l'année ;
- Québec, **relevé 1 case O**, code **RD** ou **RM** — les deux codes
  existent pour des situations voisines et le bon n'est pas évident ;
- si la prime est versée à une **entreprise incorporée**, le feuillet
  reste requis en principe mais l'application varie ;
- si le référent est un **client actif**, une prime pourrait être
  requalifiée en rabais.

**Les pages officielles de l'ARC et de Revenu Québec ont refusé la
récupération automatisée (HTTP 403).** Ce qui précède vient d'extraits
de recherche et de sources secondaires : rien n'a été lu à la source.
**Aucune de ces quatre lignes ne doit être écrite sur le site tant
qu'un comptable ne les a pas confirmées** — l'article 10 est rédigé
pour n'en affirmer aucune.

Le reste du texte n'a pas non plus été relu par un avocat. Il tient
sur des clauses relevées chez Gorgias, Callbox et Gusto, ce qui n'est
pas la même chose qu'un avis juridique québécois.

### La grille se laisse deviner en RATIO, jamais en dollars

Le rôle du client a essayé, et il faut le rapporter tel quel : il a
supposé que la commission valait 10 %, multiplié la grille par dix, et
conclu « j'ai leur liste de prix ». **Ses chiffres sont faux d'un
facteur 2 à 3** — le taux réel est de 3 à 6,7 %, jamais 10. Il n'a
donc rien deviné ; il croit l'avoir fait, ce qui est un problème
différent et plus petit.

Deux façons de le fermer, et les deux coûtent :

- **casser la régularité de la progression** (150 · 250 · 400 · 600 ·
  1 200 · 2 500 · 5 000) — mais c'est justement cette régularité qui
  garantit « aucune marche brutale », qui était une exigence explicite ;
- **afficher le taux** — ce qui publie exactement ce qu'on protège.

**Rien n'a été changé.** L'arbitrage appartient à William.

### « Jusqu'à 5 000 $ » sans son plancher

Le rôle du client l'a nommé « mentir par omission » : l'accroche
annonce 5 000 $, la ligne d'entrée en paie 150. Trente-trois fois
l'écart, et il faut ouvrir un panneau pour l'apprendre.

La consigne du chantier était explicite — « le plafond affiché
publiquement reste *jusqu'à 5 000 $ et plus* » — donc **rien n'a été
changé**. La correction, si William la veut, tient en une ligne : la
mention sous les boutons dirait « de 150 $ à 5 000 $ ». Elle ferait
échouer `prime-check` sur son contrôle « aucun montant de la grille ne
se lit sans ouvrir le panneau », qu'il faudrait alors ajuster.

### Les trois autres assistants ont la même géométrie que celui qu'on vient de corriger

Le bouton « Continuer » du formulaire de référence débordait du
panneau : sa moitié basse était rognée par l'`overflow`, mais toujours
à sa place pour `getBoundingClientRect`, et un clic dessus touchait le
voile — donc **fermait le formulaire**. Cible ramenée de 44 à 16 px.

La barre de navigation est devenue collante **dans `#modal-refer`
seulement**. `#modal-project`, `#modal-estimate` et `#modal-booking`
ont la même structure et donc le même risque latent ; aucun ne
l'atteint aujourd'hui parce qu'aucun de leurs écrans n'est aussi haut.
Le corriger partout d'un coup changerait quatre formulaires dans un
chantier qui n'en visait qu'un. **À faire, mais dans son propre
chantier, avec ses propres captures.**

### Deux échecs d'outil qui EXISTAIENT AVANT ce chantier

Vérifiés en worktree sur le commit `232949b`, avant toute modification :

- **`formulaires-prod.mjs` rend 7 / 8**, et le huitième est
  l'ESTIMATION. Elle n'atteint pas son écran de succès. Rien dans ce
  chantier ne touche l'estimateur — le compte est identique avant et
  après.
- **`appel-check.mjs`** échoue sur `project` (« le lien existe ») et
  **`confidentialite-check.mjs`** compte trois mentions `.form-legal`
  dans `projectWizard` au lieu d'une. Les deux comptes sont identiques
  entre `232949b` et aujourd'hui : **pré-existants, hors périmètre.**

### Le classeur attend quatre colonnes

`google/Code.gs` passe en version 12 et le schéma `refer` gagne quatre
colonnes : `RÉFÉRENT · versement`, `Conditions acceptées`,
`Acceptées le`, `Version acceptée`. **Tant que le déploiement n'a pas
été refait et `initialiser()` relancé**, `classeur-check.mjs` s'arrête
sur « déploiement trop vieux » — c'est voulu, il refuse de juger un
service qu'il sait périmé.
