# AUDIT DE CONVERSION — 2026-08-02

État audité : `d0b361e`, étiquette `avant-cro`.
Preuves : `preuves/2026-08-04-cro/avant/` (198 images, 10 sections,
5 largeurs × 2 thèmes), plus les sondes de `tools/_sondes/`.

Repères de départ, à ne pas faire régresser :
LCP **136 ms** (médiane de 5, `SPAN.plate-big`) · i/s médiane **60**,
images > 20 ms **0** · erreurs console **0** · requêtes tierces **0** ·
débordement **aucun**.

---

## 0 · LE BLOQUANT — au-dessus de toute priorité

**Aucun formulaire du site ne livre.** FormSubmit répond `HTTP 200`
avec `{"success":"false", "message":"This form needs Activation..."}`.
Sonde émise depuis la page servie sur 8099, donc avec la bonne
origine — ce n'est pas un artefact de test.

Le code s'en aperçoit et ne ment pas : `D-422` bascule sur un
`mailto:` prérempli et l'annonce (« L'envoi automatique n'a pas
passé. Votre demande n'est pas perdue — envoyez-la d'ici : »). Mais :

- les pièces jointes du formulaire projet sont perdues sur ce chemin ;
- un visiteur en webmail sans gestionnaire `mailto:` n'aboutit nulle
  part ;
- c'est un message d'échec qui accueille la personne qui vient de
  décider.

Le geste manquant ne m'appartient pas : ma sonde a déclenché l'envoi
du courriel d'activation à `l-adresse-personnelle-retiree`. **Un clic sur
« Activate Form » ouvre le tunnel.**

---

## 1 · LA PREMIÈRE IMPRESSION — `#top`

### Ce qui fonctionne
- Le titre parle du **résultat**, pas du produit : « On code ce qui
  fait rouler votre entreprise. » C'est déjà la bonne formulation.
- Le sous-titre nomme les quatre offres **et** le différenciateur
  (« Rien de gabarit. Le code est à vous. »).
- Un seul CTA primaire en minium, un secondaire en fantôme.
  Hiérarchie franche.
- La fiche technique donne quatre délais chiffrés : elle répond à
  « combien de temps » avant qu'on la pose.

### Ce qui manque
1. **La cible n'est nommée nulle part.** « votre entreprise » ne dit
   pas *PME québécoise*. Le seul mot est « Québec », en gris, en
   petites capitales, tout en haut.
2. **Aucune preuve au premier écran.** Les trois lignes du socle
   (12 h, un interlocuteur, tout vous appartient) sont des
   **promesses**. La seule preuve immédiatement vérifiable est **le
   site lui-même** — et elle est enterrée dans la 7ᵉ question d'un
   accordéon fermé : « HTML, CSS et JavaScript quand le site doit
   être le plus rapide possible — c'est le cas de celui que vous
   lisez. »
3. **À 1024 × 768, le socle passe sous la ligne de flottaison.**
   (`tools/_sondes/cro-fold/fold-portable.png`.) Sur le portable le
   plus courant, aucune réassurance n'est visible au premier écran.
4. **Le rail affiche « IMPACT ANNUEL ESTIMÉ ≈ 39 100 $ » dès le
   premier écran**, avant que le visiteur ait touché quoi que ce
   soit. C'est la sortie des curseurs par défaut (5 employés, 42 $/h,
   26 h). Q1 : le calcul est juste. Q2 : invérifiable avant la
   section 06. Q4 : à côté du logo, en minium, « 39 100 $ » se lit
   comme un prix ou comme une promesse. **C'est le plus gros risque
   de véracité du site.**

---

## 2 · L'ACTION PRINCIPALE — le défaut n° 1

**« Démarrer votre projet » n'ouvre pas ce qu'il dit.** Le libellé
apparaît 13 fois ; 24 éléments ouvrent `modal-start`, intitulé
**« Par où on commence ? »**, qui redemande de choisir entre trois
chemins — dont « Démarrer votre projet », **en position 03**.

Le visiteur qui a décidé se voit redemander de décider, et l'action
qu'il vient de choisir est la dernière des trois.

Pire : en `#contact`, le **même libellé** va directement à
`modal-project`. Même mot, deux destinations.

**Deux CTA se disputent l'en-tête, à toutes les hauteurs de
défilement** : « Référez, gagnez jusqu'à 5 000 $ » (fantôme) et
« Démarrer votre projet » (primaire). Le premier s'adresse à
quelqu'un qui **n'achète pas**, et occupe la place la plus chère de
la page.

**Sur téléphone, le bouton de référence se réduit à « 5 000 $ » nu**,
en minium, collé au logo. (`fold-telephone.png`.) C'est la seule fois
où le site affiche un montant en dollars sans phrase autour : ça se
lit comme un prix.

**`#comparatif` n'a aucun appel à l'action.** C'est la section qui
produit le chiffre le plus fort du site — **− 5 h 36 par jour** — et
elle ne propose rien.

**Les douze boutons de secteur** de `#demos` ouvrent eux aussi
`modal-start`. Le visiteur clique « Immobilier » et reçoit « Par où
on commence ? », sans que son métier soit repris nulle part dans la
modale.

**Sait-on ce qui se passe après le clic ?** Oui en `#contact` — le
bloc « Ce qui arrive après votre message » (trois temps, trois
délais) est exemplaire. Non ailleurs.

---

## 3 · LA PREUVE PRÈS DE L'ACTION

| Endroit | Réassurance présente |
|---|---|
| Hero | trois lignes, **sous** les boutons, hors champ à 1024 |
| Services (fiches) | aucune à côté du bouton |
| Calculateur | **aucune** — deux boutons nus |
| Contact | complète : « Aucun compte à créer · Vous pouvez tout envoyer plus tard », puis 12 h / 0 $ / Écrit / Jamais |
| Pied de page | deux points, corrects |

**Cohérence du 12 h** : hero, processus 06, contact, FAQ, modales —
identique partout. Rien à corriger.

**Une contradiction apparente** : le hero promet « Réponse en 12 h »,
et `#contact` dit que la **lecture** arrive « le prochain jour
ouvrable ». Les deux sont tenables ensemble, mais lus à la suite ils
se contredisent aux yeux du visiteur.

---

## 4 · LA RÉDUCTION DU RISQUE

**Couvert** : coût (FAQ 1 + estimation) · délai (fiche + FAQ 3) ·
complexité (FAQ 2) · engagement (FAQ 5, « sans engagement » ×3) ·
propriété (FAQ 6, la meilleure du lot) · résultat (FAQ 8) ·
distance (FAQ 9).

**Non couvert** :
1. **« Qui êtes-vous ? »** — plus aucune réponse depuis le retrait de
   `#apropos`. C'est la première peur d'un patron devant une agence
   qu'il ne connaît pas.
2. **« Comment je paye ? »** — pas un mot sur l'acompte, sur
   l'échelonnement, sur le moment de la facture. « Le chiffre dit à
   l'appel est celui du contrat » donne le montant, jamais le
   calendrier.
3. **« Et si vous disparaissez en cours de route ? »** — la réponse
   existe (« le code est à vous ») mais n'est jamais formulée comme
   la réponse à cette peur-là.

**Les garanties existantes sont précises, jamais vagues** : « l'appel
de 30 minutes ne coûte rien et ne se facture jamais », « le code,
l'hébergement et l'adresse sont à votre nom : un autre développeur
peut reprendre demain matin ». Aucune formule creuse trouvée.

---

## 5 · BÉNÉFICE PLUTÔT QUE CARACTÉRISTIQUE

Les cinq titres de service sont **déjà** orientés bénéfice :
« Un site à vous, que vous changez sans nous. » · « Les tâches que
personne n'aime faire se font toutes seules. » · « Tout est complet
quand un client cherche près de chez vous. » · « Quand aucun logiciel
du commerce ne fait la job. » · « Vos clients chiffrent leur projet
eux-mêmes… ». Rien à reprendre.

Restent orientés **produit** : le H2 « Nos services. », et quelques
lignes des fiches dépliées (« Référencement monté au départ »,
« Branché sur ce que vous utilisez déjà »).

---

## 6 · VITESSE DE COMPRÉHENSION

- Phrases courtes, concrètes, peu de jargon. Le fond est sain.
- **Le formulaire « Démarrer votre projet » : 7 étapes, 21 champs,
  10 obligatoires**, annoncé « Le plus direct · 7 étapes ·
  4 minutes ». Le chemin présenté comme le plus direct est le plus
  long du site.
- Réservation d'appel : 5 champs, 3 obligatoires. Bien dimensionné.
- **Bug de calendrier.** `minDate()` ouvre le jour à +24 h **à
  minuit** (`js/main.js:1650`), mais les plages sont filtrées à +24 h
  **à l'heure** (`js/main.js:1741`). Tous les soirs après 16 h 30, le
  premier jour proposé est cliquable et **vide** : « Plus rien de
  libre ce jour-là. » Preuve en image : `cro-envoi/3-apres-envoi.png`.
  Le visiteur le plus pressé tombe sur une porte fermée.

---

## 7 · LA DIFFÉRENCIATION

Elle existe, éparpillée, et n'est **jamais dite** :

- « Rien de gabarit. Le code est à vous. » (hero)
- « Un seul interlocuteur » (socle)
- « Le code s'écrit ici, pas à l'autre bout du monde. » (processus 03)
- « pas de gabarit acheté, rien d'inutile à charger » (fiche 01)
- FAQ 6 (propriété) et FAQ 7 (technologies)

Aucun endroit ne dit *voici ce qui nous distingue*. Le visiteur doit
la reconstituer lui-même — il ne le fera pas.

**Et le plus gros gisement de preuve est hors d'atteinte : les neuf
écrans de secteur (`demos-secteurs/`) ne sont liés depuis aucune page
du site.** `grep -c "demos-secteurs" index.html` → **0**.

> **Deux corrections à ce que j'avais d'abord écrit ici.**
>
> 1. Ils ne sont pas *inertes* : ils jouent déjà, en `<iframe>`
>    inerte au survol (D-672) — mais uniquement sur grand écran, à la
>    souris, au palier 0, à l'échelle **0,29**, où le texte courant
>    tombe sous 5 px *à dessein* (D-683). Le visiteur voit la
>    composition, jamais le travail. Et il ne peut en ouvrir aucun.
> 2. Ce ne sont **pas des « sites complets »**. `STANDARD.md § 0 bis`
>    (2026-08-01) : **« UN ÉCRAN, PAS UN SITE »**. Les neuf sites
>    longs ont été archivés dans `archives/2026-08-01-sites-longs/`.
>    Chacun est **un premier écran arrêté**, 25 à 116 éléments,
>    `scrollHeight <= 900`, dont les cinq liens de menu sont
>    `href="#"`.

Ce qui reste vrai : neuf premiers écrans complets, chacun avec sa
propre direction visuelle, chacun répondant en 200, **et personne ne
peut en ouvrir un**. Pour une agence sans client public, c'est la
meilleure preuve disponible, et elle est fermée. Vérifié aussi : ils
sont responsifs, **aucun débordement à 390, 768 ni 1024**.

---

## 8 · LA VÉRACITÉ — état des lieux

**Aucun faux témoignage, aucune note, aucun résultat client** dans la
voix d'APED. Vérifié :

- Toutes les étoiles et tous les témoignages du document
  (`index.html:1545`, `1651`, `1656`, `1661`) sont **à l'intérieur du
  bloc `ba-vue--avant`** — la reconstitution d'un gabarit acheté —
  dans une section titrée « Quatre démonstrations, entreprises
  fictives — pas des mandats livrés ».
- Les deux PDF : aucun faux avis. Le guide IA **interdit** nommément
  la production de faux avis (`aped-ia-croissance.html:2679`).
- Les neuf écrans de secteur ne portent aucune identité d'APED (une
  balise `<meta name="aped-instant">`, invisible).
- `node tools/prix-check.mjs` → **0**.

**Le seul chiffre affiché sans que le visiteur l'ait demandé** est le
« ≈ 39 100 $ » du rail (§ 1.4).

**Un point de forme** : `l-adresse-personnelle-retiree` apparaît quatre
fois dans `index.html` et sert d'adresse de contact. Pour un patron
de 55 ans qui évalue une agence, une adresse Gmail personnelle dit
« ce n'est pas une entreprise ». Le correctif demande un nom de
domaine — c'est ta décision, pas la mienne.
