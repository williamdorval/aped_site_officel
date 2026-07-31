# ARCHIVE — les huit plaques d'atelier de l'accueil

Retirées de `#top` le **2026-07-30**, sur demande du propriétaire :
« la section devient plus courte et plus nette ».

**Rien n'est supprimé.** Les quatre fichiers de ce dossier contiennent le
bloc entier, tel qu'il était, prêt à être recollé.

| Fichier | Ce qu'il contient | D'où il vient |
|---|---|---|
| `index.html-487-706.html` | le markup complet : le grand commentaire d'argumentation, la coque `.wrap`, la bande `.plaques[data-plaques]` et les huit `<article class="plaque">` avec leurs `--ang / --dx / --dy / --z / --v` | `index.html` l. 487-706 |
| `app.css-2354-2631.css` | § 13 · les plaques (coque + corps + filet de profondeur) **et** § 13bis · la boucle de vie (`@keyframes plaque-vie`, les huit retards négatifs, les trois verrous, le repli mouvement réduit) | `css/app.css` l. 2354-2631 |
| `app.css-points-de-rupture.css` | les deux replis : deux colonnes à 640 px, et la **grille de douze colonnes** à 64em avec ses huit `grid-column` et son rembourrage de 76 px | `css/app.css` l. 4869-4871 et 5022-5108 |
| `langue.js-1517-1710.js` | bloc 10 · la dérive au défilement (V2 · S'ALIGNER), le redressement complet au centre de l'écran, et le repli au palier 1 | `js/langue.js` l. 1517-1710 |

---

## POURQUOI CE CONTENU VAUT D'ÊTRE GARDÉ

Les huit affirmations ont été vérifiées **une par une** le 2026-07-29
contre les quatre questions du § 0.A de `CLAUDE.md`, et quatre autres
ont été retirées à ce moment-là parce qu'elles échouaient. Ce n'est pas
de la mise en scène qu'on archive, c'est **le travail de véracité**.

| # | Mot fort | Phrase | Ce qui la soutient ailleurs dans le site |
|---|---|---|---|
| 1 | **12 h** | Le délai de réponse, jours ouvrables. Souvent moins. | affiché à cinq endroits : Agence, pied, modale de contact, Parcours, formulaire |
| 2 | **Jour 5** | Les premières maquettes. Vous voyez avant qu'on code. | Agence, engagement 04, avec sa figure |
| 3 | **=** | Le chiffre du premier appel est celui de la facture. | Agence, engagement 01 (`Estimation = Facture`) |
| 4 | **1** | Interlocuteur, du premier appel à la mise en ligne. | Agence, `agc-faits` |
| 5 | **Tout** | Le code, l'hébergement, l'adresse web. Un autre peut reprendre demain. | Agence 03, FAQ, Parcours |
| 6 | **0** | Mouchard, traceur, service extérieur. Votre site ne dépend de personne. | aucune adresse externe dans le document — vérifiable en dix secondes |
| 7 | **7** | Produits : site, boutique, automatisation, logiciel, application, visite 360, vidéo. | Services, Secteurs, Visite 360, Calculateur — **sauf la vidéo**, voir la réserve ci-dessous |
| 8 | **Québec** | Conçu, codé et livré ici, du premier trait à la mise en ligne. | — |

### Les quatre qui avaient DÉJÀ été retirées, et pourquoi

| Retirée le 2026-07-29 | Pourquoi | Où elle vivait aussi, et a dû être corrigée |
|---|---|---|
| « 60 s · Sans donner votre courriel » | **FAUX** : le courriel est requis pour recevoir l'estimation | — |
| « 1 h · De formation incluse au lancement » | pas offert | Services (liste 01), Parcours (étape 04), FAQ |
| « 0 · Abonnement obligatoire » | **FAUX** : l'hébergement a un coût récurrent | FAQ « Le site nous appartient à 100 % ? » |
| « 100 % · Du code vous appartient » | vrai mais plat | revenue en plaque **Tout** |

Et « 0 · Sous-traitance. Vous parlez à la personne qui code » était
devenue « 1 · Interlocuteur » : l'absence d'intermédiaire est un
argument premium, la mention du codeur unique dit la **taille** et pas
le standard.

### La réserve qui reste ouverte sur la plaque 7

`grep vidéo index.html` ne rendait **qu'une ligne : celle de cette
plaque**. Six des sept produits sont démontrés par la section Services ;
le septième n'existe nulle part ailleurs sur le site. Si le bloc revient
un jour, deux sorties honnêtes : la vidéo entre dans le chantier 03 en
cinquième point, ou la plaque passe à **6**.

---

## CE QUI A ÉTÉ MESURÉ SUR CE BLOC, ET QUI DISPARAÎT AVEC LUI

Relevés du 2026-07-29 et du 2026-07-30, `tools/plaques-vie.mjs` et
`tools/accueil-check.mjs plaques|derive` :

| Mesure | Valeur |
|---|---|
| angles de repos | 2,1° à 4,2° (× `--incl`) — **sous 2° une inclinaison ne se perçoit pas** |
| dérive au défilement | 121 à 220 px, redressement au centre à ≈ 0,2° |
| boucle de vie, dérive | 8 à 24,5 px vertical · 4 à 13,4 px horizontal |
| boucle de vie, battement | 1,07° à 2,25° |
| écarts de pixels entre deux captures | 11 à 14,7 % |
| i/s, boucle **et** défilement en même temps | 59,9 · 0 image > 20 ms |
| rembourrage de bande nécessaire à 64em | 76 px latéraux, 96 px en bas |

## CE QU'IL FAUDRA REFAIRE SI LE BLOC REVIENT

1. **Remettre `.plaques` dans la liste `CRITIQUES` de
   `tools/css-critique.mjs`** si elle y était, puis régénérer et
   repasser `cascade-check.mjs`.
2. **Le débordement de la huitième plaque sur le seuil de la 02** avait
   été corrigé par `padding-block: var(--s-7) 96px`. Le refaire mesurer :
   la section 02 a changé de hauteur depuis.
3. `tools/plaques-vie.mjs` et `tools/plaques-debord.mjs` restent dans
   `tools/` : ils sortent proprement (« bande absente ») tant que le
   bloc n'est pas là. Ils redeviennent la preuve le jour où il revient.
4. La **boucle de vie tombait au palier 1** — une animation permanente
   est le poste le plus cher du site, elle ne s'arrête jamais. Ne pas la
   remettre sans ce repli.

---

## CE QUI LA REMPLACE

Une **ligne de compensation** dans le pied du hero — trois des huit
affirmations, sur un seul filet, en petit corps. Voir
`CHANTIER-SERVICES-REALISATIONS.md § 1`.
