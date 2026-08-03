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

Restent à relever avant la première modification : LCP, CLS, i/s
médiane, contrastes, débordement, erreurs console, requêtes tierces.

Planche « avant » : `preuves/2026-08-03-audit/avant/` — douze ancres,
cinq largeurs, deux thèmes, en mouvement **plein**.

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

## JOURNAL DES ITEMS

Un item = un défaut = un commit. Rien ne s'inscrit ici tant que ce
n'est pas commité ET prouvé par une image.

*(vide — l'audit n'est pas terminé)*
