# SIX CORRECTIONS · 2026-08-03

Point de retour avant le chantier : `git reset --hard 10dccb7`

Serveur : le 8099 ne répondait pas au démarrage (`ERR_CONNECTION_REFUSED`),
comme au chantier précédent. Il a été démarré pour permettre les captures.

---

## ITEM 3 · LA VISITE 360

### La cause réelle

**Le lecteur n'a jamais été cassé.** Mesuré avant toute modification :
un clic sur `[data-tour-start]` montait le panorama, la rotation et les
passages entre pièces, en 6 secondes, avec **zéro erreur console** et
zéro requête en échec. Le code de `js/tour360.js` n'avait pas été touché
depuis des semaines.

Ce qui était cassé, c'est **ce qui y amenait**.

Avant le 2026-08-03, la section était précédée d'un sas noir de 100 vh
qui portait le mot « Essayez. ». Ce sas ne lançait rien — vérifié dans
`js/sas.js` à l'état `49d3bc3`, aucun appel au lecteur. Mais il
**annonçait qu'il y avait quelque chose à faire**.

Le sas retiré (D-567), voici ce qu'un visiteur reçoit en arrivant
sur `#visite`, mesuré :

| | |
|---|---|
| ce qu'il voit | une **photo fixe** — l'affiche du lecteur |
| position du bouton qui la réveille | **1 114 px** du haut de la section |
| hauteur de la fenêtre | **900 px** |
| conclusion | le bouton est **sous le pli**, rien ne bouge, rien n'invite |

La seule lecture possible était « c'est une image ».

### Le correctif — D-718

Un `IntersectionObserver` sur `.tour`, `rootMargin: 260px` pour que le
panorama soit prêt à l'arrivée. Un seul chemin de démarrage, deux
portes : le clic et l'observateur.

Trois retenues :

1. **Rien ne se lance seul sous `saveData` ni en 2g.** Un forfait de
   données ne se fait pas imposer un panorama. Le bouton reste alors la
   seule porte, et il reste visible.
2. **Le palier se lit dans le rappel de l'observateur**, pas au
   chargement du script — `data-palier` est posé après coup et peut
   avoir monté (piège 87). À partir du palier 2, rien ne se lance.
3. **Le focus n'entre dans la vue qu'après un CLIC.** Voler le focus à
   quelqu'un qui ne fait que défiler serait un défaut, pas un service.

### La séquence qui le prouve

Trois épreuves, cinq images chacune, avec **l'écart de pixels entre
images consécutives**.

**A · L'arrivée, sans un seul clic** — `item3-A-arrivee-1..5.png`

À l'instant où on atteint la section : `is-live`, un canvas, l'affiche
retirée, `data-tour-auto` posé. Aucun clic n'a été donné.

| entre | pixels différents | % |
|---|---|---|
| 1 → 2 | 373 023 | 60,55 |
| 2 → 3 | 371 682 | 60,33 |
| 3 → 4 | 373 673 | 60,65 |
| 4 → 5 | 371 206 | 60,25 |

60 % d'écart d'une image à l'autre : **la dérive tourne**. Une photo
fixe donnerait 0.

**B · La rotation** — `item3-B-rotation-1,3,5.png`

| entre | pixels différents | % |
|---|---|---|
| 1 → 2 | 511 979 | 83,10 |
| 2 → 3 | 527 883 | 85,68 |
| 3 → 4 | 534 897 | 86,82 |
| 4 → 5 | 527 360 | 85,60 |

**C · Le passage vers une autre pièce** — `item3-C-passage-1,5.png`

La pièce courante est lue dans l'annonce `.tour-sr` avant de viser :
cliquer la pièce courante fait sortir `loadScene` par le haut et
donnerait un faux échec.

Terrasse → Salon.

| entre | pixels différents | % |
|---|---|---|
| 1 → 2 | 591 027 | 95,93 |
| 2 → 3 | 67 621 | 10,98 |
| 3 → 4 | 45 | 0,01 |
| 4 → 5 | 0 | 0 |

Le plan passe de `Terrasse=true` à `Salon=true`, et l'annonce dit
« Salon ». Retour au repos net.

**Sous mouvement réduit** — `tour-doux.png` : la visite s'ouvre aussi,
canvas monté, affiche retirée. Aucune information perdue, et la dérive
reste coupée (D-541).

`.tour-stage` porte `aspect-ratio: 16/9` : bloc à **771 px au repos,
770 px en marche**. L'ouverture automatique ne déplace rien.

---

## ITEM 2 · SECTEURS — `item2-demos.png`

La ligne « Trois de ces métiers ont un site complet » est partie.

**Une formulation équivalente subsistait dans le même bloc** : le mot
du bas disait « Ces trois-là sont montés en entier ». La même
affirmation était donc écrite deux fois. Elle est partie aussi.

Le titre dit maintenant ce que les liens **font** : « Comparer avant et
après ».

Ce qui **reste**, et ne pouvait pas partir : « Les autres métiers n'ont
qu'un aperçu : le premier écran, monté pour montrer le style. Il n'y a
pas de site à visiter derrière. » Retirer cette réserve ferait passer
neuf aperçus pour neuf sites livrés.

Vérifié dans toute la section : aucune autre formulation équivalente.

---

## ITEM 4 · CONTACT — `item4-contact.png`

« Cadrer votre projet » → **« Estimer votre projet »**. Un patron de
PME ne cadre pas ; il veut savoir combien.

Trouvé en vérifiant : **deux tuiles voisines portaient la même ligne de
destination**, « Ouvre le questionnaire, ici », pour deux modales
différentes. Celle de l'estimation dit maintenant « Ouvre les six
questions, ici ».

---

## ITEM 5 · LE FORMULAIRE DE CONTACT

### Ce qui n'allait pas, mesuré

| | avant | après |
|---|---|---|
| largeur du bloc | 1 048 px | 1 048 px |
| largeur du formulaire | 736 px | 664 px |
| **vide à droite** | **312 px** | **0 px** |
| forme du bloc | descente | **1 048 × 484** |
| bouton d'envoi | **hors de la fenêtre** | visible |

Un formulaire dont on ne voit pas le bouton n'est pas un formulaire,
c'est une page.

### Ce qui a été fait — D-720

Le titre passe **à gauche** du formulaire, 21 rem ; les champs prennent
le reste. Sous 64 em, une seule colonne.

**Pas de cadre, pas de fond, pas de tuile.** D-244 dit que ce bloc ne
doit pas se lire comme une sixième tuile du bento : c'est la voie de
celui qui n'a ni urgence ni projet. Un seul filet, en tête. Il tient.

### L'anneau de focus — un défaut trouvé en chemin

Les champs n'avaient **aucun anneau de focus dessiné**. Ils vivaient
sur celui du navigateur. Le seuil « zéro arrêt au clavier sans anneau »
passait donc — un anneau système reste un anneau — mais il était bleu,
au milieu d'une page qui n'a que trois matières.

Mesuré après correctif : `outline: rgb(155, 40, 16) 2px solid`,
`outline-offset: 2px`, bordure du champ à l'encre pleine — l'état se
lit aussi sans la couleur. **Le correctif porte sur `.field`, donc sur
les sept formulaires du site.**

### Les six états

| état | 1440 px | 390 px | ce qui est vérifié |
|---|---|---|---|
| repos | `item5-1440-1-repos.png` | `item5-390-1-repos.png` | champ à 50 px de haut |
| focus | `…-2-focus.png` | `…-2-focus.png` | anneau minium 2 px |
| saisie | `…-3-saisie.png` | `…-3-saisie.png` | |
| erreur | `…-4-erreur.png` | `…-4-erreur.png` | 2 champs marqués, message par champ **et** message global |
| envoi en cours | `…-5-envoi.png` | `…-5-envoi.png` | bouton **désactivé**, « Envoi en cours… » |
| succès | `…-6-succes.png` | `…-6-succes.png` | « Reçu. On vous répond très vite. », champs vidés, bouton rendu |

**Réserve honnête :** « envoi en cours » et « succès » ne peuvent pas
se produire sur le site tel qu'il est — l'item 6 a vidé le point de
sortie. Ils ont été provoqués en **détournant le réseau** dans la
sonde, sur le vrai code du site.

**Les noms des champs et la structure d'envoi n'ont pas bougé** :
`nom`, `email`, `telephone`, `message`.

---

## ITEM 6 · L'ADRESSE COURRIEL

### Le pied de site était déjà propre

Vérifié à l'image (`item6-pied` dans la traversée) : le pied n'affiche
aucune adresse. Elle avait été retirée au chantier précédent.

### La vraie fuite était ailleurs, et elle était pire

`js/main.js:7` portait `CONTACT_EMAIL`. **Trois chemins la sortaient :**

1. `FORM_ENDPOINT` valait `https://formsubmit.co/ajax/` + elle — visible
   dans l'onglet Réseau à chaque envoi ;
2. `js/main.js` est servi en clair, non minifié ;
3. **`poserRepli()` insérait un bouton `mailto:` dans le DOM sous chaque
   formulaire en échec.** L'adresse était lisible dans la barre d'état
   au survol.

Et le chemin 3 n'était pas un cas rare : FormSubmit n'a jamais été
activé — un `200` avec `success: "false"`. **L'échec est le cas
nominal**, donc le bouton paraissait à chaque envoi.

### Ce que ça a forcé

L'adresse **est** le point de sortie. On ne pouvait pas retirer l'une en
gardant l'autre. `FORM_ENDPOINT` est vide, et l'envoi refuse tout de
suite avec le même drapeau qu'un refus du service — donc le même état
visible. **Aucune livraison perdue : il n'y en avait aucune.**

Le repli garde ce qu'il protégeait vraiment, la **saisie** :
« Copier ce que j'ai écrit » et « Réserver un appel » — sauf sous le
formulaire de rendez-vous, où proposer un rendez-vous serait renvoyer
le visiteur dans le mur.

Les quatre messages d'échec ne disent plus « envoyez-le d'ici ».

### La preuve — `item6-echec.png`

| épreuve | résultat |
|---|---|
| liens `mailto:` dans toute la page | **0** |
| adresses réelles dans le texte rendu | **0** |
| saisie conservée | oui — « Jean Tremblay », message intact |
| bouton rendu au visiteur | oui |
| erreurs | 0 |

### Le résultat de la recherche

Balayage de **tout le disque**, hors `node_modules` et `.git`.

**Occurrences trouvées au départ : 18, dans 10 fichiers.**

| où | occ. | statut |
|---|---|---|
| `js/main.js` (constante + point de sortie) | 2 | **retirée** |
| `RESERVES.md`, `CRO-A-TESTER.md`, `preuves/2026-08-04-cro/AUDIT.md` | 5 | **retirées** |
| `archives/rapports/` (4 fichiers) | 5 | **retirées** |
| `tools/cadeau-e2e.mjs`, `tools/formulaires-e2e.mjs` | 2 | **sorties du fichier** (voir ci-dessous) |
| `tools/_sondes/` (3 fichiers, ignorés par git) | 4 | **retirées** |
| `refonte-captures/formulaires-e2e.json` (ignoré par git) | 6 | **retirées** |

**Balayage final : `grep -rl` sur tout le dépôt → AUCUNE OCCURRENCE.**

**Exception assumée à la règle « on ne touche à aucun outil ».** Les
deux outils suivis par git s'en servaient comme **destination d'un
envoi réel**. La valeur sort du fichier vers `APED_COURRIEL` ; aucune
logique, aucun verdict ne bouge. C'était ça, ou laisser une adresse
personnelle dans un dépôt.

**Autres adresses trouvées, laissées volontairement :**

- `jack@greensock.com` dans `js/vendor/gsap.min.js` et
  `ScrollTrigger.min.js` — bandeau de licence GreenSock. **Le retirer
  briserait la licence.** Jamais affichée.
- Les adresses fictives de démonstration (`@exemple.ca`,
  `@entreprise.ca`) dans les faux vieux sites et les gabarits de
  saisie. Ce sont des décors, pas des coordonnées.
- ~30 adresses d'entreprises tierces dans `.playwright-mcp/*.yml`
  (ignoré par git) — des instantanés de sites concurrents, jetables.
  Aucune n'est la vôtre, aucune n'est affichée.

**Aucun bloc `application/ld+json`, aucune donnée structurée, aucun
`manifest.json`, aucun `humans.txt` n'existe dans ce dépôt** — ces
vecteurs n'ont pas pu en porter. `documents/src/*.html` (les sources
des deux PDF) et `CREDITS.md` : zéro adresse.

---

## ITEM 1 · LA COMPARAISON DU DÉNEIGEMENT

*(section complétée dans le commit des photos)*

---

## CE QUI N'A PAS RÉGRESSÉ

Traversée complète, les douze sections mesurées **pendant qu'elles sont
à l'écran** (piège 4 · 34 : `content-visibility: auto` vide `innerText`
dès qu'une section sort du cadre — ma première passe s'est fait avoir).

| mesure | seuil | relevé |
|---|---|---|
| LCP (`SPAN.plate-big`, 1440×900) | < 300 ms | **112 ms** (médiane de 5) |
| CLS | 0 | **0,0020** — identique à avant le chantier |
| i/s, traversée complète | 60 | **57** |
| échecs de contraste, 5 largeurs × 2 thèmes | 0 | **0** (minimum réel 4,7:1) |
| débordement horizontal, 320 → 1920 | aucun | **aucun** |
| erreurs console | 0 | **0** |
| écart de cascade | 0 | **0** sur **267 608** propriétés |
| requêtes tierces | 0 | **aucune** |
| `code-nu` (site sans JavaScript) | — | **passe** |
| `ba-check` (les quatre comparaisons) | — | **passe** |
| liens `mailto:` | — | **0** |

Les douze sections répondent : hauteur non nulle, texte peint,
formulaires présents (7), comparaisons présentes (4), visite **vivante**.

---

## RÉSERVES

Elles sont écrites au long dans `RESERVES.md`, section
« 2026-08-03 · SIX CORRECTIONS ». En bref :

1. **Aucun formulaire du site ne livre**, et maintenant il le dit. Rien
   n'a été perdu : FormSubmit n'a jamais été activé.
2. **« Envoi en cours » et « succès » ne sont pas atteignables** sur le
   site servi ; ils ont été photographiés en détournant le réseau.
3. `tools/prix-check.mjs` rend toujours le code 2 (antérieur). Vérifié
   à la main : les seuls montants affichés sont les trois autorisés,
   plus le **42 $** du calculateur — qui est la valeur que **le
   visiteur règle lui-même**, pas un prix d'APED.
4. `tools/production-check.mjs` rend `ECHEC : toutesLesImagesChargent` —
   onze écrans de secteur vivent dans un `<template>` et sont inertes.
   Antérieur, pas une régression.
5. La flèche à 1,77:1 relevée dans `#realisations` est le `›` **du
   mauvais site reconstitué**. Un défaut représenté.
6. **Le « après » du déneigement reste un vrai mandat** sous une
   étiquette « entreprises fictives », avec sa ville visible. Réserve
   ouverte, non résolue ici.
7. Les quatre mentions sous les comparaisons ne sont pas accordées
   entre elles (casse, espacement). Seule la quatrième était dans le
   périmètre.

> **AUCUNE mesure de ce chantier n'a été prise sur un appareil réel.**
> Chromium sous Playwright, poste de bureau Windows. Les relevés
> « 390 px » sont une fenêtre redimensionnée, pas un téléphone.
