# PHASE 9 — LA SÉQUENCE D'ENTRÉE, LES DOUZE FRONTIÈRES, LE CADEAU

Trois chantiers, 2026-07-26. Un correctif de déclenchement, une
grammaire de transition, et une refonte de popup. Plus une découverte
qui vaut les trois : **aucun formulaire de ce site n'a jamais livré
quoi que ce soit.**

---

## 0 · LA DÉCOUVERTE QUI COMPTE LE PLUS

`node tools/cadeau-e2e.mjs 8099 --envoi-reel`, réponse du service,
mot pour mot :

```json
{"success":"false","message":"This form needs Activation. We've sent you an
 email containing an 'Activate Form' link. Just click it and your form will
 be actived!"}
```

FormSubmit n'a **jamais été activé**. Ni le cadeau, ni le calculateur,
ni la demande de projet, ni la prise de rendez-vous, ni le programme de
référence n'ont jamais délivré un courriel. Le site répondait « envoyé »
à des visiteurs dont le message n'existait pas.

**Ce qui n'est pas de notre ressort :** le lien d'activation est arrivé
dans `dorvalwilliam11@gmail.com`. Personne d'autre ne peut cliquer.

**Ce qui est vérifié malgré ça** — la requête part, elle va au bon
endroit, elle transporte l'adresse du visiteur, l'accusé au visiteur
porte les deux liens, et l'échec est traité proprement : le visiteur
repart avec ses deux guides quand même. Voir § 3.

**Après le clic :** relancer `node tools/cadeau-e2e.mjs 8099 --envoi-reel`.
Le verdict `success: "true"` est la seule preuve qui manque.

---

## 1 · LA SÉQUENCE D'ENTRÉE — POURQUOI PERSONNE NE L'AVAIT VUE

Elle existait depuis la phase 8 : `index.html` (le rideau), `app.css`
§ 11b, `main.js` (le pilote), `hero.js` (le relais vers la limaille).
Le défaut tenait en une ligne :

```js
sessionStorage.setItem("aped-entree", "1");   // posé au PREMIER chargement
```

Un rafraîchissement dans la même session lisait ce drapeau et sautait
tout. Or **un rafraîchissement est une arrivée**, pas une navigation
interne — et c'est la façon dont on regarde son propre site.

### Ce qui la déclenche maintenant

On lit le **type de navigation**, qui dit exactement ce qui s'est passé :

| `performance.getEntriesByType("navigation")[0].type` | La séquence |
|---|---|
| `navigate` — on arrive | joue |
| `reload` — on rafraîchit | **rejoue** |
| `back_forward` — retour arrière, cache de retour | ne joue pas |

Le drapeau de session ne sert plus qu'à une chose : si le visiteur l'a
**sautée**, on ne la lui remet pas au prochain rechargement. Sauter,
c'est dire non.

### Le compteur — V4 · CRAN

Onze valeurs empilées dans une fenêtre d'une ligne, translatées en
`steps()`. Aucun script nécessaire pour qu'il roule.

**Deux éléments, et il en faut deux.** `.entree-cran` est la FENÊTRE qui
rogne, `.entree-rouleau` est la BANDE qui défile. Animer la fenêtre la
déplace *avec son propre rognage*, donc rien ne défile : mesure du jour,
la jauge était à 62 % et le compteur affichait encore `000`, cent pixels
plus haut. La même erreur guette tout odomètre en CSS.

Deuxième piège, plus discret : `line-height` **doit** valoir la hauteur
de boîte, sinon chaque chiffre déborde de son cran et on lit deux
valeurs à la fois. C'est la seule contrainte du compteur, et elle est
invisible tant qu'on ne la casse pas.

### L'allongement — la vraie fonction de la séquence

La jauge se remplit **en deux temps** :

- `0 → 620 ms` : 0 à 80 %, sans condition. Ce qu'on s'est accordé joue
  toujours ;
- `80 → 100 %` : 180 ms, **seulement** quand les polices sont posées et
  que la limaille du hero est composée.

`html.entree-attend` met en pause la seconde tranche, la remise de la
plaque et l'ouverture du rideau. `animation-play-state` est une **liste** :
`running, paused` retient la seconde animation sans retenir la première.
C'est la seule façon de retenir la fin sans geler le début.

Quand le chargement traîne, la séquence **s'allonge** au lieu de sauter :
la jauge s'arrête à 80, le compteur au même cran, et rien ne ment.
Mesuré, promesse des polices coupée : arrêt net à `80 % / 080`, sortie
forcée à 2,5 s.

**La garantie sans JavaScript tient toujours** : la pause EXIGE une classe
que seul le script pose. Si aucun script ne s'exécute, rien n'est jamais
mis en pause.

### Le reste

- **Le saut.** N'importe quel clic, n'importe quelle touche. Écouteur sur
  la fenêtre, en capture, `passive` : il voit le geste sans l'empêcher —
  un visiteur qui clique un bouton déclenche le bouton **et** termine la
  séquence. C'est juste : le contenu était déjà peint dessous.
  Ce n'est pas une coupure : les mêmes animations se terminent en 160 ms.
- **Le garde-fou.** 2,5 s **depuis la navigation**, pas depuis le script.
  C'est la durée vue par le visiteur qui est plafonnée, pas la nôtre.
- **Mouvement réduit.** L'ancienne version posait `display: none` : le
  visiteur qui demande moins de mouvement n'avait aucun premier contact.
  Il en a un maintenant, et il ne bouge pas — monogramme net, 520 ms,
  puis disparition d'un seul cran, en `step-end`, donc sans script.

### Durée

Nominal 1,50 s, dans la fenêtre 1,2–1,8 s demandée. Sous chargement
lent : jusqu'à 2,5 s, plafonnées.

---

## 2 · LES DOUZE FRONTIÈRES

### Le problème, et ce qu'on n'a pas fait

Cinquante et un traitements **à l'intérieur** des sections, **rien**
entre elles. Une traversée se lisait comme douze blocs empilés.

**On n'a pas posé douze séparateurs.** Un trait posé douze fois fabrique
exactement les blocs qu'on veut supprimer. Ce qui donne la continuité,
c'est qu'un même objet traverse et se transforme.

### La frontière, en une phrase

> Une frontière n'est pas un objet posé entre deux sections. C'est le
> moment où toute la page **roule d'un cran** : le filet de la section
> qui arrive se soude pour l'annoncer, l'index roule, et le premier bloc
> se fait dégager par une arête franche.

### Quatre gestes par frontière, jamais cinq

| | Geste | Verbe | Où il vit | Palier |
|---|---|---|---|---|
| **G1** | Le filet du seuil se soude dès qu'il **entre** dans l'écran — il annonce la section avant qu'elle arrive | V3 | `motion.js`, `start: "top 97%"` | tombe au 2 |
| **G2** | Le numéro roule d'un cran | V4 | **`main.js`** | **jamais** |
| **G3** | Le nom se dégage sous une arête franche, gauche→droite | V1 | `langue.js` | tombe au 2 |
| **G4** | UN geste propre à la frontière | variable | `langue.js` | tombe au 2 |

G2 est dans `main.js` et pas dans `langue.js` parce qu'il dit **où on
est**. « En synchronisation exacte avec le passage » n'est pas une
intention : les deux sont déclenchés par le **même appel** de
`setCurrent()`, il ne peut pas y avoir de décalage.

**Au repos la bande montre déjà le bon numéro** (`translateY(-1em)`, la
seconde cellule). Sans script, sans GSAP, sous mouvement réduit, à tous
les paliers : le numéro affiché est toujours le vrai. Le cran n'ajoute
que le mouvement, jamais l'information. Vérifié par `palier-check.mjs`
aux trois paliers, dont le 2 avec le processeur bridé ×6.

### Le fond ciment / encre change par découpe nette — et il change ICI

Le brief demandait le passage ciment ↔ encre par arête franche. Il n'y
avait **aucun** changement de fond au niveau des sections : les douze
sont transparentes sur le ciment du corps.

**Ce qu'on n'a pas fait :** repeindre quatre sections en encre. Ça
remettait en jeu tous les contrastes déjà mesurés dans les deux thèmes à
cinq largeurs, pour dire la même chose que dit une bande à la jointure.

**Ce qu'on a fait :** `data-dress="encre"` est un vrai passage
ciment → encre → ciment, obtenu par une arête franche, à la frontière.
`--surface-inverse` / `--ink-inverse` basculent avec le thème : en clair
c'est une bande d'encre sur ciment, en sombre une bande de ciment sur
encre. **Ce qui porte le sens est l'inversion, pas la couleur**, et
l'inversion se lit dans les deux thèmes.

**Quatre bandes, pas douze** — 02, 05, 06 et 12. Un rythme, pas un tic.
La 06 est la **réciproque** de la 05 : même arête, sens inverse. On entre
dans l'instrument à la Visite, on en ressort au Calculateur. La section
Visite est donc encadrée par deux bandes : c'est elle, la pièce sombre.

### Les douze, et l'argument de chacune

| # | Frontière | Robe | G4 | Verbe | Pourquoi celle-là |
|---|---|---|---|---|---|
| 01 | (entrée) → 01 | — | rideau → grains | V1+V2 | c'est la séquence d'entrée |
| 02 | 01 → 02 Services | **encre** | volet, bas | V1 | on quitte la matière brute pour l'offre |
| 03 | 02 → 03 Projets | clair | dégager la 1ʳᵉ capture, bas | V1 | les services promettent, les projets prouvent : la preuve se découvre comme une page |
| 04 | 03 → 04 Secteurs | clair | les groupes s'alignent | V2 | on passe d'un exemple à treize |
| 05 | 04 → 05 Visite | **encre** | volet, bas | V1 | on entre dans un instrument |
| 06 | 05 → 06 Calculateur | **encre** | volet, **haut** | V1 | la réciproque : on ressort |
| 07 | 06 → 07 Comparatif | clair | les rangées s'alignent | V2 | un comparatif, ce sont deux colonnes en regard |
| 08 | 07 → 08 Processus | clair | les étapes s'alignent | V2 | une méthode, ce sont des pièces qui se mettent en ligne |
| 09 | 08 → 09 Agence | clair | soudure longue, pleine largeur | V3 | la méthode se termine, on signe |
| 10 | 09 → 10 Référence | clair | le montant roule 500 $ → 5 000 $ | V4 | le seul argument de la section est un chiffre, et le roulement montre l'étendue du barème |
| 11 | 10 → 11 Questions | clair | dégager la 1ʳᵉ question, droite | V1 | un libellé se lit de gauche à droite |
| 12 | 11 → 12 Contact | clair | dégager la tuile, bas | V1 | un panneau se lit de haut en bas |
| — | 12 → pied | **encre** | volet + cran 12 → 00 | V1+V4 | la boucle se ferme sur la plaque de l'entrée |

Une seule frontière a le droit de faire la soudure longue. Deux en
feraient une habitude, et une habitude n'est plus une signature.

### Ce qui est tenu

- **Aucun pin, aucun détournement de molette.** Tout est déclenché une
  fois et se termine seul en moins de 500 ms.
- **Aucun scrub d'opacité sur du texte.** Rien de nouveau n'est scrubbé.
- **60 i/s.** 922 images pendant une traversée complète, médiane 16,7 ms,
  5ᵉ centile bas 16,7 ms, **zéro image au-dessus de 20 ms**. Idem en
  thème sombre (888 images) et en mouvement réduit (720 images).
  Le plafond matériel est atteint : il n'y a pas de marge à perdre.
- **CLS 0,0000.** LCP 148 ms, identique avec et sans rideau.
- **Aucun débordement horizontal** à neuf largeurs, y compris le filet
  en `100vw` de la soudure longue.
- **0 écart de cascade** sur 253 264 propriétés comparées.

---

## 3 · LE CADEAU

### A · Le déclenchement

**Le défaut.** Marqueur `localStorage` posé **dès la première ouverture**.
Un visiteur qui rechargeait ne le revoyait plus jamais, sur aucune
visite, pour toujours. C'est la vraie raison du « il n'apparaît presque
jamais ».

**Les données, suivies jusqu'au bout cette fois.** Trois bases
indépendantes — un milliard, 1,24 milliard, 105 millions d'affichages —
classent l'intention de sortie **dernière** : 3,94 % contre 6,45 % pour
une attente de 11-15 s ; 1,8 % contre 2,9 % chez le deuxième éditeur.
Le pic est une **attente courte**. Elle devient donc le déclencheur
principal.

| Rang | Déclencheur | Quand |
|---|---|---|
| 1 | **Attente** | 11 s, à chaque chargement |
| 2 | **Engagement fort** | résultat du calculateur consulté · visite 360 ouverte · section Projets atteinte |
| 3 | **Intention de sortie** | 20 s, et seulement si rien n'a paru |

**Plancher de 4 s** sur tout, y compris l'anticipé : un visiteur qui
défile vite atteint Projets en une seconde, et un popup à la deuxième
seconde est le pire déclencheur de tous les jeux de données. Mesuré :
arrivée à Projets en 1,0 s, popup à 4,1 s.

**Il n'interrompt jamais.** Focus dans un champ, ou calculateur touché
il y a moins de deux secondes : on **reporte** et on retente chaque
seconde, dix fois au plus. Mesuré : focus tenu 13,5 s → popup absent ;
focus relâché → popup dans la seconde.

**Deux portées de mémoire, et les confondre était le défaut :**

| Ce qu'il a fait | Où | Effet |
|---|---|---|
| Fermé sans donner son adresse | `sessionStorage` | pas deux fois dans cette visite ; il revient à la prochaine |
| Courriel donné | `localStorage` | plus jamais — on ne redemande pas ce qu'on a déjà reçu |

Un refus n'est pas un abonnement à vie à l'absence de cadeau.

### B · Le contenu

**Ce qui n'allait pas :** neuf objets à trier — titre de quatre lignes,
paragraphe de quatre lignes, deux puces, **deux** boutons de
téléchargement, un champ, un libellé long, un lien de refus. Et **trois
actions concurrentes** dans un encart qui se lit en deux secondes : ça
ne fait pas trois chances, ça fait une hésitation.

**Sept objets, chacun avec un rôle :**

1. `GRATUIT · DEUX GUIDES · 91 PAGES` — dit gratuit et combien
2. « Nos deux guides sont à vous. » — dit que c'est à lui
3. Trois lignes de **bénéfice** — ce qu'il pourra faire, jamais la table des matières
4. **UN** champ : le courriel
5. **UNE** action : « Recevoir les deux guides » — le bénéfice est dans le libellé
6. Une ligne de réassurance, minuscule
7. Une sortie écrite, en plus de la croix

51 mots à lire. Le visuel : les **vraies** couvertures des deux PDF,
rendues depuis leur source par `tools/couvertures.mjs` — elles ne peuvent
pas se désynchroniser du document livré. 147 Ko, en `lazy`, préchargées
trois secondes avant l'ouverture prévue : sur le chemin critique elles
coûteraient cher pour une image que neuf visiteurs sur dix ne verront
jamais ; sans préchargement le popup s'ouvrirait sur deux cadres vides.

**Le cadeau reste un cadeau.** Les deux liens ne sont plus offerts avant
le champ — le popup n'a qu'une action. Ils sont **remis sur place** à la
seconde où l'adresse est donnée, y compris quand l'envoi échoue. Ils sont
aussi en clair dans le pied de page, sans aucun courriel.

### C · La mise en scène — en CSS, pas en GSAP

Le popup peut s'ouvrir à la 4ᵉ seconde sur un engagement fort, donc
**avant** la seconde vague de scripts. Une entrée écrite en GSAP
apparaîtrait sans mise en scène une fois sur dix.

- **Entrée** — V1 · DÉGAGER, arête franche **de haut en bas** : un panneau
  se lit de haut en bas. Relevé image par image : `clip-path` passe de
  `inset(0 0 100%)` à `inset(0 0 0%)` avec `opacity` constante à 1. C'est
  une arête, pas un fondu, et c'est lu dans la page, pas jugé sur des pixels.
- **Les couvertures** — V2 · S'ALIGNER, ±22 px en alternance, décroissance
  monotone jusqu'à 0. Aucun dépassement.
- **Sortie** — la réciproque exacte : l'arête repasse par où elle est venue.
  `main.js` pose la classe, attend la fin, **puis** appelle `close()` —
  sans l'attente, `close()` retire l'élément de la couche supérieure à la
  première image et la réciproque ne se voit jamais.
- **Échap** passe par `cancel`, pas par nos boutons : on lui donne la même
  réciproque, sinon la seule sortie clavier serait la seule sans mise en scène.

### D · La chaîne

Ce qu'un service de formulaire sans serveur **ne peut pas faire** :
joindre deux fichiers de deux mégaoctets. Aucun ne le peut. Ce qu'il
peut : renvoyer au visiteur un accusé qui les **porte**, via
`_autoresponse`.

Les adresses sont **calculées**, pas écrites : `new URL(…, location.href)`
rend l'adresse absolue réelle du serveur qui sert la page. Une adresse en
dur serait fausse le jour de la mise en ligne, et personne ne s'en
apercevrait avant qu'un visiteur clique.

Dire « les deux PDF arrivent en pièce jointe » serait faux. Ce qui est
vrai : **il les a tout de suite, et il les retrouve dans sa boîte.**

Reste bloqué à l'activation FormSubmit — voir § 0.

---

## 4 · SIX PIÈGES D'INSTRUMENT AJOUTÉS PAR CETTE PHASE

Ils ont tous produit un faux verdict avant d'être trouvés.

1. **`content-visibility: auto` fait mentir `getBoundingClientRect()`.**
   Hors écran, il rend la taille **réservée**, pas la vraie. Mesurer les
   jointures sur une page fraîche donnait des positions fausses de
   plusieurs milliers de pixels : la capture de la frontière 09 montrait
   la 11. Il faut traverser la page **entièrement** avant de mesurer, et
   **remesurer chaque seuil juste avant de le capturer** — les hauteurs
   continuent de dériver à mesure qu'on descend. Pour relever une hauteur
   réelle, lever la propriété (`style.contentVisibility = "visible"`) ;
   sinon on relit exactement les nombres déjà écrits dans la feuille et
   on croit que rien n'a bougé.

2. **Un `scrollTo` qui saute casse un pin de ScrollTrigger.** La scène
   épinglée des Services se retrouvait à des milliers de pixels de sa
   place et la capture montrait un empilement qui n'existe pas. On défile
   **par pas**, comme un visiteur.

3. **`color-mix()` ne se calcule pas en `rgb()`.** Chromium rend
   `color(srgb 0.67 0.678 0.668)` — des flottants de 0 à 1. Lus comme des
   octets, `0,67` devient `0` : **tout** texte écrit en `color-mix`
   ressortait à 1,11:1 sur fond sombre. Quatorze faux échecs, dont onze
   sur du code qui n'avait pas bougé depuis des semaines. Un lecteur de
   couleurs doit détecter la forme et remettre à l'échelle.

4. **Un détecteur de débordement confond une fenêtre d'odomètre avec un
   défaut.** `.seuil-num` et `.entree-cran` tiennent DEUX valeurs et n'en
   montrent qu'une : le rognage est le mécanisme, pas une panne.

5. **Une capture d'écran est plus lente qu'une animation d'entrée.** Le
   popup photographié sans attente apparaissait coupé au milieu de son
   arête. Laisser la mise en scène finir, ou relever les valeurs dans la
   page.

6. **Un test peut verrouiller le défaut.** `entree-check.mjs` affirmait
   « session déjà vue → le rideau ne doit pas exister » et « mouvement
   réduit → le rideau ne doit pas exister ». Il passait donc au vert sur
   une séquence que personne ne voyait jamais. `cadeau-check.mjs`
   affirmait « il ne s'ouvre qu'une fois par personne » — la formulation
   exacte du bug. **Les deux ont été réécrits.** Quand on corrige un
   défaut, il faut lire le test qui le couvrait : s'il passe encore sans
   modification, c'est lui le problème.

---

## 5 · LES OUTILS DE CETTE PHASE

| Outil | Ce qu'il rend |
|---|---|
| `entree-check.mjs` | huit garanties de la séquence, chacune par son scénario réel — dont l'allongement, prouvé en coupant la promesse des polices |
| `frontieres-check.mjs` | les douze frontières, avant / pendant / après, plus l'état relevé de chacune |
| `traversee-check.mjs` | planche de 24 vues + i/s pendant un défilement réel (médiane, 5ᵉ centile, nombre d'images > 20 ms — jamais un maximum) |
| `cadeau-check.mjs` | sept scénarios de déclenchement, contenu, clavier, mouvement réduit |
| `cadeau-scene.mjs` | l'entrée est une arête et pas un fondu, image par image, lu dans la page |
| `cadeau-e2e.mjs` | le parcours complet, avec `--envoi-reel` pour la dernière étape |
| `couvertures.mjs` | les deux couvertures de PDF en webp, depuis la source des documents |

---

## 6 · CE QUI RESTE À FAIRE, ET PAR QUI

1. **Activer FormSubmit.** Lien dans `dorvalwilliam11@gmail.com`,
   expéditeur `formsubmit.co`. Puis
   `node tools/cadeau-e2e.mjs 8099 --envoi-reel`.
2. **Neuf contrastes sous seuil restent**, tous antérieurs à cette phase
   et tous sur des maquettes décoratives en cours d'animation :
   `.rp-etat`, `.rp-bulle`, `.rp-avis`, `.vis-sortie`, `.ecr-btn`,
   `.pr-ligne`. Aucun n'est un seuil ni la séquence d'entrée.
   `node tools/contraste-arret.mjs` les liste.
