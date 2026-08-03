# CHANTIER — AUDIT AUTONOME COMPLET (Mode B)

Ouvert le **2026-08-03**. Branche `refonte-immersive`.
Portée : **tout le site** — les onze sections plus le pied de page.

> **Ce fichier est le seul état qui survit à une session qui meurt.**
> Un item déjà commité et prouvé ne se recommence JAMAIS. Avant de
> reprendre quoi que ce soit, lire le tableau des items et croiser
> avec `git log --oneline avant-audit-complet..HEAD`.

---

## RETOUR ARRIÈRE

État d'avant, étiqueté et poussé : **`avant-audit-complet`** → `c2cd7f6`

```
git reset --hard avant-audit-complet
node tools/css-critique.mjs
```

La deuxième ligne n'est pas facultative : `critique.css` et
`differe.css` sont **fabriqués** à partir de `css/app.css`. Un
`git reset` seul les laisse désynchronisés.

Pour annuler **un seul** item sans perdre les autres :
`git revert <sha-de-l-item>` — c'est pour ça que chaque item est un
commit séparé.

---

## MESURES D'AVANT — prises le 2026-08-03, avant toute modification

| Mesure | Relevé | Seuil |
|---|---|---|
| écart de cascade, découpée vs entière | **0** sur 273 240 propriétés | 0 |
| prix « A RETIRER dans le source » | **0** | 0 |
| prix « A VERIFIER dans le rendu » | **0** | 0 |
| LCP | **216 ms** | < 300 |
| CLS | **0** | 0 |
| i/s moyenne · p95 · pire | **60 · 60 · 60** | 60 |
| arrêts au clavier sans anneau de focus | **0** sur 109 arrêts | 0 |
| piège de focus des modales | tient · retour au déclencheur | — |
| requêtes tierces | **0** | 0 |
| erreurs console, page d'accueil | **0** | 0 |
| poids | 907 Ko | — |
| INP au clic du CTA primaire | 173 ms | — |
| tâches longues | 99 ms · 61 ms | — |
| relief le pire, 240 images | 14,8 sur `contact-1920-sombre-2` | > 8 |

**Ces mesures n'existaient pas avant aujourd'hui.** `tools/verif.mjs`
mourait d'une exception non rattrapée à la mesure d'INP ; aucun des
neuf seuils n'était donc gardé. Voir l'item 1.

Planche « avant » : `preuves/2026-08-03-audit/avant/` — douze ancres,
cinq largeurs, deux thèmes, en mouvement **plein**. 240 images,
zéro erreur console, aucune surface morte sauf l'ancre `footer`, qui
n'existe pas (item à venir).

---

## PHASES

| # | Phase | État |
|---|---|---|
| 0 | Sécuriser — commit, push, étiquette, commande de retour | **fait** |
| — | Mesures d'avant, planche « avant » complète | en cours |
| 4 | Recherche — références primées, quatre directions | en cours |
| 3bis | Audit — quota 3 à 5 défauts réels par section | à venir |
| — | Liste « protégé, n'y touche pas » | à venir |
| 5-9 | Un item à la fois : plan, construction, trois passes, commit | à venir |

---

## LES DOUZE ENTRÉES

| № | Section | Ancre | Audit | Défauts | Corrigés |
|---|---|---|---|---:|---:|
| 01 | Accueil | `#top` | à venir | — | — |
| 02 | Services | `#services` | à venir | — | — |
| 03 | Réalisations | `#realisations` | à venir | — | — |
| 04 | Secteurs | `#demos` | à venir | — | — |
| 05 | Visite 360 | `#visite` | à venir | — | — |
| 06 | Calculateur | `#calculateur` | à venir | — | — |
| 07 | Comparatif | `#comparatif` | à venir | — | — |
| 08 | Processus | `#processus` | à venir | — | — |
| 09 | Référence | `#reference` | à venir | — | — |
| 10 | Questions | `#faq` | à venir | — | — |
| 11 | Contact | `#contact` | à venir | — | — |
| — | Pied de page | `#footer` | à venir | — | — |

---

## PROTÉGÉ — N'Y TOUCHE PAS

Dans le doute, un élément est protégé **par défaut**. Cette liste se
remplit à l'audit ; ce qui suit y est déjà, avant même d'auditer.

- **La mécanique interne du lecteur de visite 360** — `js/tour360.js`,
  `css/tour360.css`. Il a déjà été cassé une fois en le
  « recomposant ». Seul son ENCADREMENT est ouvert au chantier :
  comment on l'annonce, comment on y entre, comment on en sort.

---

## CE QUE J'AI DÉCIDÉ À TA PLACE

Le gabarit est arrivé avec ses crochets vides. Voici ce que j'ai
tranché seul, et pourquoi. Chaque ligne est annulable.

| Décision | Pourquoi |
|---|---|
| Nom de l'étiquette : `avant-audit-complet` | Le champ `avant-[nom-du-chantier]` était vide. Trois étiquettes existaient déjà (`avant-cro`, `avant-immersif`, `avant-optimisation-contexte`) ; ce nom suit leur forme et dit ce que c'est. |
| Mécanique du lecteur 360 déclarée protégée | Le champ « éléments qui ne se touchent pas » n'était rempli que d'un exemple entre crochets, et cet exemple nommait le 360. Option la plus prudente : le prendre au mot. |
| Recherche groupée en quatre directions, pas douze | §5 demande une direction explicitement DIFFÉRENTE par sous-agent. Douze mandats sur un site de onze sections auraient produit douze fois la même recherche « site d'agence ». Quatre familles — ouverture/preuve, offre/choix, outils/engagement, récit/clôture — gardent des directions réellement distinctes. |
| Condition de fin (§8, champ vide) | Le chantier s'arrête quand tout défaut listé à l'audit est soit corrigé et prouvé, soit explicitement classé sans suite avec sa raison écrite ici. |

---

## SIGNAUX EXAMINÉS PUIS ÉCARTÉS — ce ne sont PAS des défauts

À garder : sans cette liste, la prochaine session refait l'enquête.

| Signal | Ce que ça semblait être | Ce que c'est réellement |
|---|---|---|
| `verif.mjs` : compteur d'orientation sautant 06 et 09 | perte de N1 · ORIENTATION | **Artefact d'échantillonnage.** L'outil lit 10 positions fixes pour 11 sections. Sonde par ancre : **11/11**, aucun saut. |
| `verif.mjs` : 12 éléments invisibles en mouvement réduit | perte d'information sous `prefers-reduced-motion` | **Identiques en mouvement plein ET réduit.** Ce sont les 12 `.mock` de `#demos` : `content-visibility: hidden` (D-223) plus `#mockStage[aria-hidden]`. Ni peints ni annoncés. |
| `verif.mjs` : erreur console sur la page 404 | ressource cassée | L'outil vise `/page-qui-nexiste-pas` ; le serveur rend un vrai **HTTP 404** pour le document et Chromium le journalise. Comportement attendu. |
| `.hero-fiche` cachée sous 1024 px | l'offre et les délais absents au téléphone | D-174 dit « rien n'est perdu, seul l'ordre change ». **Vérifié** : les quatre délais sont repris dans `#services` (`svc-plan-delai`) et dans les fiches. La justification est vraie. |
| `\*` en tête de commentaire dans `css/app.css` | clôture de commentaire cassée, piège 75 | Échappement de l'outil de recherche. Le fichier porte bien `/*`. |

---

## PROTÉGÉ — ce que l'audit a inspecté et jugé SAIN

- **Les 12 `.mock` de `#demos`** — correctement retirés du rendu et de l'arbre d'accessibilité.
- **`.hero-fiche` sous 1024 px** — absence justifiée et la justification est vérifiée.
- **Les deux PDF téléchargeables sans courriel**, et le pied qui le dit. Aucune des références relevées ne donne 91 pages contre rien ; c'est une preuve, et elle est déjà au bon endroit.
- **« On ne vous demande rien »** — les deux chefs de file du marché (ServiceTitan, Jobber) exigent un courriel avant la première question. APED a raison contre eux.
- **La barre hachurée de `#comparatif`** — le rapport de longueur EST l'argument, sans légende à retenir.
- **`#comparatif` tient en un seul écran** (800 px à 1440). La section la mieux proportionnée du site.
- **Le seuil de 0 arrêt clavier sans anneau** — 0 sur 109 arrêts, mesuré. Le piège de focus des modales tient, le focus revient au déclencheur.

---

## DÉFAUTS TROUVÉS

Rien ici n'est écrit sans preuve. « img » = prouvé par une image
ouverte ; « msr » = prouvé par une mesure et sa commande.

### Famille A · Des outils de contrôle qui se valident eux-mêmes

| # | Défaut | Preuve |
|---|---|---|
| 1 | `verif.mjs` mourait sur `#modal-start` que le CTA n'ouvre plus — **aucun des neuf seuils gardé** | msr · **CORRIGÉ**, voir journal |
| 2 | `plages.mjs:108` **fabrique** `id="footer"` à partir de `class="footer"` ; `verifier` compare l'invention à elle-même et rend « à jour » | msr |
| 3 | `SECTIONS.md` annonce 4 `li.parc-etape` dans `#processus` ; le document en porte **six**. `ANIMATIONS.md` dit encore « (4) » pour A124/A126 | msr |
| 4 | `refs-galerie.mjs` rend **0 lien** sur Godly sans erreur et sans s'arrêter — trois recherches indépendantes s'y sont cassées | msr |
| 5 | `verif.mjs` · `elementsInvisibles` compte des éléments correctement cachés : il rendra 12 à chaque passage, donc on apprendra à l'ignorer | msr |
| 6 | `verif.mjs` · `p404.erreurs` compte le 404 attendu comme une erreur : une vraie erreur sur cette page passerait pour du bruit | msr |

### Famille B · Le pied de page, angle mort du dépôt

| # | Défaut | Preuve |
|---|---|---|
| 7 | `<footer>` n'a **aucun `id`** — seule section sans ancre, zéro `href="#footer"`, et `plaques.mjs` rend « ABSENTE » sur **10 plaques sur 10** | msr |
| 8 | `<footer>` est imbriqué dans `<main>` : il perd son rôle `contentinfo` | msr |
| 9 | Sur la dernière image du site, `.footer-mega` (« APED » en contour, ~230 px pleine largeur, **aucune information**) est le plus gros objet — et porte le seul `data-degage` du document | img |
| 10 | La phrase de clôture « On commence quand vous voulez. » est **au-dessus du pli** au défilement maximal ; `nav.footer-nav` est coupée en deux | img |
| 11 | Le rail de gauche occupe encore ~300 px dans le pied, affichant « 0 dernière section » et « Réglez le calculateur, le montant s'affiche ici » — une sollicitation morte sur le dernier écran | img |

### Famille C · L'orientation qu'on calcule puis qu'on jette

| # | Défaut | Preuve |
|---|---|---|
| 12 | `.parc-bar` affiche « 01 / 06 · 5 ÉTAPES APRÈS CELLE-CI », `main.js` la tient à jour — et sa règle `css/app.css:4954` **n'a aucune propriété `position`**. À l'étape 06 elle a quitté la fenêtre. N1 · ORIENTATION ne se sacrifie jamais | img |
| 13 | Le rail affiche « — » et « Réglez le calculateur » pendant que le panneau calcule déjà ≈ 39 100 $ : deux états opposés du même chiffre, visibles ensemble | img |
| 14 | À 390 px, « 10 QUESTIONS » (ordinal de section) surmonte « 11 questions » (le compte) à ~120 px d'intervalle | img |

### Famille D · La visite 360 — son cadre, jamais sa mécanique

| # | Défaut | Preuve |
|---|---|---|
| 15 | `batirHud()` crée exactement trois boutons : reculer, rapprocher, plein écran. **Aucune fermeture, aucune écoute d'Échap** | msr |
| 16 | `chargee()` fait `affiche.parentNode.removeChild(affiche)` : l'affiche est **détruite**, pas masquée. L'état « avant d'entrer » est irrécupérable sans recharger | msr |
| 17 | « Entrer dans la visite » n'apparaît qu'au second écran de `#visite` : un écran entier de photo immobile avant de savoir qu'elle est cliquable | img |

### Famille E · Des mouvements qui ne se réclament d'aucun verbe

| # | Défaut | Preuve |
|---|---|---|
| 18 | Le chiffre du calculateur traverse **12 valeurs fausses en 1 486 ms**. Un cran ne passe pas par douze états — ce n'est aucun des quatre verbes, c'est un fondu de valeur | msr |
| 19 | L'accordéon de la FAQ saute **+85,6 px en UNE image**, plat sur 12 échantillons. Le seul mouvement est le `+` qui pivote. V4 · CRAN est dû et absent | msr |

### Famille F · Géométrie et lecture

| # | Défaut | Preuve |
|---|---|---|
| 20 | `.faq-aside` — « Votre question n'y est pas », l'adresse, « Réponse en 12 h » — est `display: none` sous 1024 px. Le visiteur le plus perdu perd sa sortie. **À vérifier comme D-174 : est-ce repris ailleurs ?** | img |
| 21 | À 390 px, l'aperçu de `#demos` est à **+2 129 px**, soit 91 % de la section ; le carrousel tactile fait tourner toutes les 3 600 ms une image hors champ | msr |
| 22 | `#demos` porte 13 pastilles **et** 9 liens « OUVRIR » : 22 entrées cliquables pour 12 métiers, neuf listés deux fois avec deux comportements | msr |
| 23 | Le rail de `#services` coupe des titres en plein mot à 1440 : « …ation » à gauche, « Logic / applic… » à droite | img |
| 24 | À 390 px, le sur-titre casse entre « PME » et « DU QUÉBEC » — les `&nbsp;` de D-016 entourent le `·`, pas le groupe | img |
| 25 | Le socle du hero laisse des `·` orphelins en fin de ligne à 768 px | img |
| 26 | Trois masses minium se disputent le premier écran : la puce « Référez… 5 000 $ », la plaque, le CTA primaire. « Un seul foyer d'attention par écran » | img |

---

## JOURNAL DES ITEMS

Un item = un défaut = un commit. Rien ne s'inscrit ici tant que ce
n'est pas commité ET prouvé.

| Item | Défaut | Commit | Preuve |
|---|---|---|---|
| 1 | La vérification finale ne vérifiait plus rien (défaut 1) | `a9f48ec` | Test cassé volontairement → sortie 1 ; remis → sortie 0 |
| 2 | Le pied n'avait pas d'ancre, et le générateur lui en inventait une (défauts 2 et 7) | `b74d810` | `plaques.mjs footer` : **16 images, 0 surface morte**, contre « ABSENTE » sur 10 plaques sur 10 avant. Ancre retirée → `plages.mjs` sort **2** et nomme la cause ; remise → sortie 0 |
| 3 | **« − 5 h 36 par jour » — le plus gros chiffre du site, multiplié par cinq** | *(ce commit)* | Le guide source dit « minutes **par semaine** » et « ordre de grandeur d'atelier, **pas une donnée d'enquête** ». Corrigé aux trois endroits, y compris le texte pour lecteur d'écran. Image à 390 px : tient sur une ligne. `verif.mjs` sortie 0, tous seuils tenus |
