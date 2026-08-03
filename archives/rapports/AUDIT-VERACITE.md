# AUDIT DE VÉRACITÉ — site officiel APED Agency

> ## ⬛ ÉTAT AU 2026-07-30 : LES 36 CONSTATS SONT TRAITÉS
>
> Cet audit a été écrit en lecture seule le 2026-07-29. **Il a été
> appliqué dans la nuit du 29 au 30.** Les tableaux ci-dessous ne sont
> plus une liste de choses à faire : ils sont la trace de ce qui était
> faux, et ils restent tels quels parce qu'un audit qu'on réécrit après
> correction ne prouve plus rien.
>
> **Ce qui a été fait, constat par constat :**
>
> | Catégorie | Constats | Traités | Comment |
> |---|---|---|---|
> | **A** · faussetés démontrables | 9 | **9** | A1·A2 la fiche technique est alignée sur les quatre chantiers de Services · A3 courriel facultatif, remise avant le formulaire · A4 déjà corrigé le 29 · A5 « jusqu'à » rendu · A6 « le prochain jour ouvrable » · A7 résolu en corrigeant C5 · A8 le cadre « journée de huit heures » retiré, le tableau intact · A9 les deux affirmations retirées, **plus** les cinq lignes « ce qui a changé » réécrites |
> | **B** · invérifiables | 10 | **10** | B1·B2 douze métiers préparés · B3·B4·B5 les trois statistiques inventées retirées · B6 deux postes retirés du calcul, dont un **double comptage** · B7 arrondi à la centaine, « ≈ » · B8 l'appel de 30 minutes nommé · B9 bornes fermées + plancher · B10 « Votre entreprise », figure étiquetée « Exemple » |
> | **C** · engagements intenables | 6 | **6** | C1·C2 les deux promesses de classement Google retirées · C3 déjà corrigé le 29 · C4 « en six questions » aux cinq endroits · C5 le désabonnement retiré · C6 « Réponse — 12 h » |
> | **D** · jargon | 8 | **8** | D1 « CRM » aux trois endroits · D2 ordre inversé et liste complétée · D3·D4 le bénéfice devant, les crédits en note · D5·D6 la figure du chantier · D7 « robot d'usine » · D8 la ligne supprimée avec la refonte de la fiche |
> | **E** · taxonomies | 3 | **3** | E1 il ne reste que deux listes, de granularités différentes · E2 la note dit quel taux calcule quoi · E3 la sixième voie nommée |
> | **V** · à vérifier | 7 | **5** | V2 repli `mailto:`, les six formulaires livrent · V3 nommé comme l'appel de 30 min · V5 bornes fermées · V6 **vérifié VRAI** dans la source des PDF (« 24 tâches · 13 domaines » en couverture) · V7 la démo dit prouver le lecteur, pas la prise de vue · **V1 et V4 restent suspendus** : voir `DECISIONS-NUIT.md § 2 · B4` |
>
> **Trois défauts que cet audit n'avait pas vus**, trouvés en mesurant
> pendant l'application :
>
> 1. **Sept textes restaient à 10-12 % d'opacité en permanence** pour un
>    visiteur normal — 1,15:1 à 1,36:1. Leur déclencheur ne partait
>    jamais. Corrigé (`immediateRender: false`, onze tweens) ;
>    `contraste-arret` passe de 8 échecs à **0**.
> 2. **« Itinéraire », dans la figure Google : 1,34:1.** Une règle de
>    conteneur écrasait la couleur du bouton.
> 3. **Le survol des cinq cartes de contact faisait BAISSER le
>    contraste** à 4,41:1 — sous le seuil AA, sur le texte qu'on est
>    précisément en train de lire.
>
> Les trois sont antérieurs à l'application, prouvés par A/B en worktree
> contre le commit précédent. Détail et arbitrages : `DECISIONS-NUIT.md`.
> La règle qui gouverne désormais l'écriture : `CLAUDE.md § 0.A`.

---


**Version auditée :** `index.html`, md5 `8f275bfa77d4144b1c91651c5087e931`, 208 731 octets,
relevé le 2026-07-29 à 22 h 10. Le fichier a été modifié **deux fois pendant l'audit** :
les quatre plaques du hero et leurs échos dans Services, Parcours et FAQ étaient déjà
corrigés au moment du relevé final. Rien de ce qui suit ne redit ces quatre-là.

**Méthode.** Texte **rendu** extrait dans un vrai navigateur, page traversée en entier par
pas de 600 px avant lecture (`content-visibility: auto` fait autrement mentir `innerText` —
la première extraction s'arrêtait à la section 04), `content-visibility` levée, les 12
`<details>` ouverts, les 7 modales et le `<template>` des 13 maquettes lus par `textContent`.
Les commentaires HTML ne sont **pas** comptés comme des affirmations publiques ; deux d'entre
eux sont cependant cités plus bas parce qu'ils **contredisent** le texte affiché.

**Périmètre couvert :** `index.html` (12 sections, pied, 7 modales, popup cadeau, FAQ),
`404.html`, `documents/src/*.html` (les 91 pages des deux PDF).

**Note sur les deux PDF :** ils sont **exemplaires** et ne figurent dans aucun tableau
ci-dessous. Ils écrivent d'eux-mêmes « Pourquoi jamais 100 % », « Écrit au plus bas, jamais
au plus flatteur », « le 55 % est volontairement bas », « Ce guide devait vous être utile
même si vous ne nous appelez jamais ». C'est le standard que la page d'accueil n'atteint pas
encore.

---

## 1 · LE TABLEAU, TRIÉ PAR GRAVITÉ

### A · FAUSSETÉS DÉMONTRABLES ET CONTRADICTIONS INTERNES DURES

Un visiteur qui lit deux endroits du même document trouve deux réponses différentes.
C'est la catégorie qui se perd au téléphone.

| # | Affirmation exacte (verbatim) | Fichier:ligne | Où elle s'affiche | Cat. | Pourquoi c'est un problème | Reformulation proposée |
|---|---|---|---|---|---|---|
| A1 | « Site web vitrine — **1 semaine** » | `index.html:415` | Hero, fiche technique 01 | A·E | Le même document donne **trois** délais pour un site vitrine : 1 semaine ici, « 2 à 4 semaines » dans Services (`740`), « Deux à quatre semaines » dans la FAQ (`2409`), et « 4–6 semaines » dans la maquette Secteurs (`1562`). Un client qui a lu le hero et reçoit une proposition à 4 semaines a un grief écrit. | Aligner sur la valeur défendable : **« 2 à 4 semaines »** partout, ou retirer le délai du hero et ne le donner qu'au premier appel — ce que la note sous la fiche fait déjà pour la date de démarrage. |
| A2 | « Automatisation, logiciels et applications — **3 semaines** » | `index.html:419` | Hero, fiche technique 03 | A·E | Services chantier 04 dit « **1 à 3 mois** » (`882`) et la FAQ dit « Un à trois mois pour une boutique ou un logiciel » (`2409`). Écart d'un **facteur quatre**. La plaque regroupe en plus trois choses dont les délais réels diffèrent (automatisation 1–3 semaines, logiciel 1–3 mois). | Scinder : « Automatisation — 1 à 3 semaines » et « Logiciel ou application — 1 à 3 mois ». Ne jamais réunir sous un seul chiffre deux chantiers dont les délais diffèrent d'un facteur quatre. |
| A3 | « Votre courriel » **requis** pour « Recevoir mes deux guides » | `index.html:2768-2775` | Popup cadeau `dialog#cadeau` | A | Le pied de page (`2622`), Services (`931`) et le Calculateur (`1809`) offrent **les deux mêmes documents** « gratuits et **sans courriel** » / « Télécharger, sans courriel ». Le popup fait payer d'une adresse ce que la page donne gratuitement trois écrans plus bas. C'est **exactement** la faute de « 60 s · Sans donner votre courriel » qui vient d'être retirée, déplacée dans le popup. | Rendre le champ **facultatif** : deux boutons, « Télécharger les deux guides » (direct) et « Me les envoyer par courriel » (avec adresse). La promesse « sans courriel » tient alors partout. |
| A4 | « Hébergement et mise en ligne **inclus** » | `index.html:734` | Services 01, liste à puces | A·E | La FAQ dit le contraire : « **Un site en ligne a toujours un coût d'hébergement** — le vôtre est modeste, il vous est annoncé avant la signature » (`2435`). « Inclus » sans durée se lit « inclus pour toujours ». C'est la fausseté que le propriétaire vient de retirer du hero (« 0 · Abonnement obligatoire »), restée intacte dans Services. | « **Mise en ligne incluse. Hébergement à votre nom, coût annoncé avant la signature** » — c'est ce que dit déjà la FAQ, et c'est vrai. |
| A5 | « Référez, gagnez **5 000 $** » | `index.html:250-252` | En-tête, bouton `.nav-refer`, **sur toutes les vues** | A | Le « **jusqu'à** » a sauté. Partout ailleurs le site écrit « Jusqu'à 5 000 $ » (`283`, `2357`, `2541`) et un commentaire du document dit lui-même : « On garde donc « jusqu'à 5 000 $ », **qui est vrai** » (`2280`). Le barème (`3277`) commence à **500 $**. L'élément le plus visible du site est le seul qui annonce le plafond comme un montant plat. | « Référez, gagnez **jusqu'à 5 000 $** ». Si la place manque, « Référez et gagnez » sans chiffre. |
| A6 | « **le jour même** » | `index.html:2560` | Contact, « Ce qui arrive après votre message », étape 01 | A·E | Le délai affiché **partout ailleurs** est « 12 h ouvrables » (hero `564`, Agence, FAQ `2394`, Contact `2579`, Parcours, confirmations des modales). Un message déposé à 23 h ou le samedi ne peut pas être lu « le jour même ». L'étape 02 juste dessous dit « sous 12 h ouvrables » : les deux se contredisent à trois lignes d'écart. | « **le prochain jour ouvrable** », ou aligner sur « sous 12 h ouvrables » comme les deux autres étapes. |
| A7 | « **Jamais** — De relance insistante, de **liste d'envoi non demandée**, ni de revente de vos coordonnées. » | `index.html:2582` | Contact, `ul.contact-sur` | A·E | Le popup cadeau promet « **Désabonnement en un clic** » (`2782`), ce qui n'a de sens que s'il existe une liste d'envoi. Les deux ne peuvent pas être vrais en même temps : soit il y a une liste, soit il n'y en a pas. | Si l'adresse ne sert qu'à envoyer les deux guides : remplacer la ligne du popup par « **Votre adresse sert à envoyer les deux guides, et à rien d'autre** ». Si une liste existe : retirer « liste d'envoi non demandée » de la ligne Contact. |
| A8 | « UNE JOURNÉE DE HUIT HEURES, PART PASSÉE SUR L'ADMINISTRATION — À la main **7 h 20** » | `index.html:1885` (barre à `--p:91.7%`) | 07 · Comparatif | A·B·E | Affirme qu'une PME passe **91,7 % d'une journée de huit heures** en administration — il resterait 40 minutes par jour pour faire le métier. Le **Calculateur du même site** part de « Heures par semaine sur l'administration : **26 h** » (`1717`), soit 5,2 h/jour. Le Comparatif dit 36,7 h/semaine. Les deux sections se contredisent d'un facteur 1,4, et la plus grosse n'est pas croyable. Le contredire coûte une phrase à un patron de garage. | Le tableau détaillé dessous est **arithmétiquement juste** (440 min → 104 min, écart 336 min = 5 h 36 — vérifié ligne à ligne). Le défaut est le cadre « journée de huit heures ». Écrire : « **Six tâches d'administration, chronométrées bout à bout : 7 h 20 par jour à la main, 1 h 44 une fois automatisées** » — sans les rapporter à une journée de travail, et sans la barre à 91,7 %. |
| A9 | « Des sites en ligne, pas des maquettes. » · « **Cinq projets livrés.** Chaque cadre contient la **vraie page d'accueil**, au complet. » | `index.html:976-977` | 03 · Projets, en-tête | A (si non vérifié) | Les cinq cadres sont des **captures webp statiques** (`images/real-restaurant.webp`, `real-pneus`, `real-carrosserie`, `real-neige`, `real-interieur`), pas des sites chargés. Aucun des cinq n'est **lié** à une adresse en ligne : un visiteur ne peut pas vérifier. Deux d'entre eux — « Cendre » et « MV Déneigement » — servent aussi de **décor de démonstration** dans Services (`728-760`, `857`), avec une note Google inventée « 4,9 · 128 avis ». Si les cinq ne sont pas des clients réels et livrés, la phrase est fausse au sens le plus direct. **Voir § 3.** | Si réels : **mettre le lien** sur chaque cadre (« voir le site en ligne ») — c'est ce qui transforme l'affirmation en preuve. Sinon : « Cinq pages d'accueil, dessinées et codées ici » et retirer « pas des maquettes » et « livrés ». |

### B · INVÉRIFIABLES PAR UN VISITEUR

| # | Affirmation exacte (verbatim) | Fichier:ligne | Où | Cat. | Pourquoi c'est un problème | Reformulation proposée |
|---|---|---|---|---|---|---|
| B1 | « **13** secteurs couverts » | `index.html:1560` | 04 · Secteurs, maquette « Votre industrie ici » | B | Le 13ᵉ des treize est « **Votre industrie ici** » — un emplacement vide, pas un secteur servi. Il en reste 12, dont aucun n'est adossé à un client nommé. « Couverts » affirme en plus qu'ils ont été **servis**, alors que la section Projets n'en montre que 5, dont deux (« Carrosserie », « Design intérieur ») ne figurent même pas dans les treize. | « **12 métiers, 12 aperçus** » — et remplacer « couverts » par « **préparés** » : montrer un aperçu est vrai, avoir servi le secteur ne l'est pas encore. |
| B2 | « Treize secteurs, treize aperçus. » | `index.html:1110` | 04 · Secteurs, chapô | B | Même défaut que B1 : le treizième aperçu est un emplacement vide. Ici c'est moins grave — « aperçu » n'affirme pas un client — mais le compte reste faux de un. | « **Douze métiers, douze aperçus — et le vôtre s'ajoute.** » |
| B3 | « **Les neuf qu'on nous pose le plus**, avec la vraie réponse. » | `index.html:2386` | 11 · Questions, chapô | B | Affirme un historique de questions reçues qu'un visiteur ne peut pas vérifier, et qu'une agence jeune ne peut pas démontrer si on le lui demande. Les neuf réponses, elles, sont bonnes. | « **Neuf questions, et la vraie réponse à chacune.** » Le contenu ne perd rien, l'affirmation de volume disparaît. |
| B4 | « La première est la bonne dans **neuf cas sur dix**. » | `index.html:2496` | 12 · Contact, chapô | B | Statistique inventée sur son propre trafic. Personne ne peut la produire si un client la conteste, et elle n'ajoute rien : le classement visuel dit déjà laquelle est recommandée. | « **La première est celle qu'on recommande.** Les quatre autres sont là pour les cas particuliers. » |
| B5 | « Minutes par jour, sur des tâches d'administration **observées chez des PME**. » | `index.html:1847` | 07 · Comparatif, chapô | B | « Observées » chez qui, combien, quand ? Aucune source. Le Calculateur, lui, cite sa méthode (`1826`) — le Comparatif ne cite rien alors qu'il affiche des chiffres plus agressifs. | Renvoyer à la source qui existe déjà : « **Six tâches tirées de notre document sur l'automatisation, où chaque chiffre porte sa source.** Les vôtres sortiront du diagnostic. » |
| B6 | « **Erreurs manuelles évitées** [6 280 $] » · « **Revenus gagnés, réponse plus rapide** [8 377 $] » | `index.html:1823-1824` | 06 · Calculateur, « Le détail du calcul » | B | La note de méthode (`1826`) n'explique que la conversion heures → dollars. Ces **deux lignes-là** n'ont aucune méthode publiée, et elles pèsent **14 657 $** sur les 53 751 $ affichés, soit 27 % du chiffre vedette. Un client qui demande « d'où sortent les erreurs évitées ? » n'a pas de réponse dans la page. | Soit ajouter le taux et la base dans la note (« erreurs de saisie estimées à X % du chiffre d'affaires »), soit **retirer les deux lignes** et ne garder que les heures, qui sont, elles, entièrement défendues. |
| B7 | « IMPACT ANNUEL ESTIMÉ — **53 751 $** » | `index.html:311-314` | Rail collant, visible dès le hero | B | Précision au dollar près sur un chiffre que la section elle-même appelle « **un ordre de grandeur, pas une soumission** » (`1826`). La fausse précision invite la contestation qu'elle veut éviter, et le montant s'affiche avant que le visiteur ait touché un curseur. | Arrondir à la centaine ou au millier : « **≈ 53 800 $** ». Le sous-titre « Réglez le calculateur, le montant suit » est déjà bon. |
| B8 | « **Diagnostic de vos processus, offert et sans engagement** » | `index.html:782` | Services 02, liste à puces | B | Promet une prestation distincte — un diagnostic de processus — que rien d'autre dans le site ne décrit ni ne planifie. Le seul rendez-vous offert ailleurs est « un appel de 30 minutes » (`2580`, `2611`). Le Comparatif s'y adosse pourtant : « Les vôtres sortiront du diagnostic » (`1847`). **À vérifier — voir § 3.** | Si c'est l'appel de 30 min : « **L'appel de 30 minutes sert à faire le tour de vos processus, sans engagement** ». Si c'est un livrable distinct, il faut dire ce qu'il contient et combien de temps il prend. |
| B9 | « 500 $ pour un contrat de **1 000 $ à 10 000 $**, 700 $ **de 10 000 $ à 30 000 $**, 1 500 $ **de 30 000 $ à 50 000 $**… » | `index.html:3277` | Modale `#modal-refer`, grille dépliable | B·C | **Cinq bornes ambiguës.** À un contrat de **exactement** 10 000 $, la commission est-elle 500 ou 700 ? Idem à 30 000, 50 000, 80 000, 100 000. Et **rien n'est prévu sous 1 000 $** : un référent dont le contrat sort à 800 $ n'a pas de réponse. C'est un engagement financier écrit — l'ambiguïté se règle en faveur du référent. | Bornes fermées d'un seul côté : « **1 000 $ à 9 999 $ → 500 $ · 10 000 $ à 29 999 $ → 700 $** … » et ajouter la ligne manquante : « **sous 1 000 $ : pas de commission** » (ou le montant réel). |
| B10 | « **4,9 · 128 avis** » | `index.html:857` | Services 03, figure « Résultats locaux », fiche **MV Déneigement** | B | Note et volume d'avis inventés, attribués à une entreprise que la section Projets présente comme un **client réel** (`1046-1068`). Contrairement aux 13 maquettes Secteurs — annoncées « treize aperçus » (`1110`) — cette figure n'est étiquetée nulle part comme une démonstration. La figure la montre en outre **en position 1**. | Rendre la figure manifestement générique : « **Votre entreprise** · 4,9 · 128 avis », ou étiqueter la figure « exemple ». |

### C · ENGAGEMENTS QUE PERSONNE NE PEUT TENIR TELS QU'ÉCRITS

| # | Affirmation exacte (verbatim) | Fichier:ligne | Où | Cat. | Pourquoi c'est un problème | Reformulation proposée |
|---|---|---|---|---|---|---|
| C1 | « Quand quelqu'un cherche dans votre coin, **c'est vous qui sortez.** » | `index.html:830` | Services 03, titre `h3` | C | **Promesse de position Google**, à l'indicatif présent, en titre de chantier. Personne ne contrôle le classement de Google. La figure juste dessous renforce en montrant le client **en position 1** (`847-857`). C'est l'affirmation la plus attaquable du site : elle est invérifiable avant l'achat et démontrable **contre** l'agence après. | « Quand quelqu'un cherche dans votre coin, **on met tout en place pour que vous sortiez.** » Ou, plus fort et entièrement vrai : « **Votre fiche Google, votre zone, vos avis : tenus comme il faut.** » |
| C2 | « **il se trouve sur Google** » | `index.html:728` | Services 01, chapô | C | Même promesse de résultat, en passant. Un site neuf n'est pas trouvable sur Google par la seule volonté du développeur. | « **il est construit pour être trouvé sur Google** » — dit le travail fait, pas le résultat promis. |
| C3 | « **Il se charge avant que la page d'à côté ait fini de clignoter** » | `index.html:728` | Services 01, chapô | C | Superlatif comparatif contre un concurrent anonyme, sans mesure. La formule est bonne à l'oreille mais indéfendable telle quelle : « la page d'à côté » n'existe pas. | Le site a les chiffres — les utiliser : « **Il s'affiche en moins d'une seconde**, mesuré, pas promis. » Un chiffre mesurable remplace un superlatif. |
| C4 | « **Estimation en 60 secondes** » | `index.html:383`, `2826`, `3294` | Hero CTA, modale `#modal-start`, titre `#modal-estimate` | C | Le parcours réel compte **six questions plus une étape** où le nom **et** le courriel sont `required` (`3358-3376`). Le site lui-même chiffre son autre formulaire « 7 étapes · 4 minutes » (`2501`). Soixante secondes pour six choix, un nom et une adresse est optimiste, et le libellé se mesure au chronomètre. | « **Estimation en six questions** » — c'est ce que dit déjà la carte Contact (`2514`), c'est vrai, et ça ne se contredit pas au chronomètre. |
| C5 | « **Désabonnement en un clic** » | `index.html:2782` | Popup cadeau, ligne de réassurance | C | Promet un mécanisme qui doit exister le jour où quelqu'un l'utilise. Voir aussi **A7** (contredit « jamais de liste d'envoi non demandée ») et **§ 3** (aucun formulaire du site ne livre aujourd'hui). | Si l'adresse ne sert qu'aux deux guides : « **Votre adresse sert aux deux guides, à rien d'autre.** » Ne promettre un désabonnement que le jour où l'envoi existe. |
| C6 | « **Proposition écrite — 12 h** » | `index.html:2061` (figure `parc-vis`, étape 01) | 08 · Processus, figure de l'étape 01 | C | Affiche une **proposition écrite** en 12 h, sans condition. Partout ailleurs les 12 h sont le délai de **réponse**, et le Contact précise que la réponse peut être « des questions s'il en manque, **ou** directement avec une proposition » (`2565`). La figure transforme un conditionnel en engagement ferme. | « **Réponse — 12 h** » dans la figure, et laisser le texte de l'étape dire quand la proposition suit. |

### D · JARGON DE DÉVELOPPEUR

Non décodable en trois secondes par un patron de garage. Aucun de ces énoncés n'est **faux** —
ils sont **inopérants**, ce qui est le second critère du propriétaire.

| # | Terme affiché (verbatim) | Fichier:ligne | Où | Pourquoi ça ne travaille pas | Reformulation proposée |
|---|---|---|---|---|---|
| D1 | « Vos outils reliés entre eux : **CRM**, courriels, comptabilité, rapports » · « Fiche **CRM** créée » · « mise à jour du **CRM** » | `index.html:784`, `801`, `1937` | Services 02 · figure Atelier · Comparatif | Sigle anglais de logiciel. Un garagiste tient ses clients dans un cahier ou dans Excel ; « CRM » ne lui dit rien. Répété **trois fois**, dont une dans le seul tableau chiffré du Comparatif. | « **votre fichier clients** ». « Fiche client créée » (la figure l'écrit d'ailleurs correctement deux nœuds plus loin, `800`). |
| D2 | « **React, Next.js, Node.js, Python.** Rien d'exotique » | `index.html:2439` | FAQ, « Quelles technologies utilisez-vous ? » | Défendable **ici** : celui qui pose la question veut les noms. Mais la phrase qui suit — « un autre développeur peut reprendre le code demain matin » — est la vraie réponse, et elle est noyée. **Voir aussi § 3** : ce site-ci n'utilise aucun des quatre. | Inverser l'ordre : « **Des technologies courantes — un autre développeur reprend le code demain matin sans vous appeler.** Concrètement : React, Next.js, Node.js, Python. » |
| D3 | « Chaque pièce s'ouvre en **2048 px** puis monte en **4096 px** toute seule » | `index.html:1633` | 05 · Visite 360, note sous la visite | Résolutions en pixels. Le bénéfice — ça s'ouvre tout de suite puis ça devient net — n'est jamais dit en clair. | « **La pièce s'ouvre tout de suite, puis se précise d'elle-même.** Rien ne se télécharge avant votre clic. » |
| D4 | « Moteur **Pannellum 2.5.7 (MIT)**, hébergé sur ce serveur. **Aucune requête vers un tiers.** » · « publiées par Poly Haven en **CC0** » | `index.html:1641-1642` | 05 · Visite 360, note de crédit | Numéro de version, licence logicielle, licence d'image, vocabulaire réseau. La mention légale est **honnête et nécessaire** (voir § 3), mais elle est écrite pour un développeur. | Garder les crédits, les mettre en petit et traduire la partie qui est un argument : « **Tout est hébergé chez nous : votre visite ne dépend d'aucun service extérieur.** » Le reste en note de bas de section. |
| D5 | « 02 **grille** — **12 colonnes** » | `index.html:2109` | 08 · Processus, figure de l'étape 03 « On code » | La figure est censée montrer au client **ce qu'il verra** de l'avancement. « Grille 12 colonnes » est une notion de mise en page interne : elle ne décrit aucun livrable visible. | « 02 **page d'accueil** — **mise en page** », ou n'importe quelle étape que le client reconnaît (« photos intégrées », « menu monté »). |
| D6 | « **Tests passés** — 24 / 24 » | `index.html:2113` | 08 · Processus, figure de l'étape 03 | Compte de tests automatisés. Le client ne sait pas ce qu'est un test, ni pourquoi 24, ni ce qui arriverait à 23. Le chiffre est en plus inventé et invérifiable. | « **Vérifications** — 24 / 24 », ou remplacer par un état que le client comprend : « **Prêt pour votre relecture** ». |
| D7 | « Un agent IA entraîné sur vos vraies réponses, pas sur un **modèle générique** » | `index.html:785` | Services 02, liste à puces | « Modèle générique » est du vocabulaire d'ingénieur. L'opposition visée — vos mots contre des mots d'usine — se dit mieux. | « Un agent IA qui répond **avec vos mots, pas avec ceux d'un robot d'usine** ». |
| D8 | « **Estimateur pour vos clients** — 2 semaines » | `index.html:417` | Hero, fiche technique 02 | Nom de produit interne. Un patron de garage ne devine pas que c'est un outil qu'on met **sur son site à lui** pour que **ses** clients se chiffrent eux-mêmes. C'est la seule des quatre lignes de la fiche qui demande un décodage. | « **Un calculateur de prix sur votre site** — 2 semaines ». |

### E · CHIFFRES ET TAXONOMIES QUI SE CONTREDISENT (résiduel)

Les contradictions numériques lourdes sont en **A1, A2, A6, A8**. Restent trois écarts mineurs.

| # | Affirmation | Fichier:ligne | Cat. | Problème | Reformulation |
|---|---|---|---|---|---|
| E1 | Trois découpages de l'offre coexistent : **4** lignes de fiche technique (site vitrine · estimateur · automatisation-logiciels-applications · visite+vidéo), **4** chantiers Services (sites et boutiques · automatisation et IA · immobilier et visibilité · logiciels et applications), **7** métiers sur une plaque | `index.html:415-421` · `716-905` · `632` | E | Trois taxonomies pour la même offre dans la même page. « Immobilier et visibilité locale » est un chantier entier de Services **absent** de la fiche technique du hero ; « Estimateur » est dans le hero et dans aucun chantier. Le visiteur ne peut pas rapprocher les listes. | Aligner la fiche technique du hero sur les **quatre chantiers de Services**, dans le même ordre et avec les mêmes noms. La plaque « 7 métiers » peut rester : elle compte des livrables, pas des chantiers, à condition de le dire. |
| E2 | « une minute par semaine récupérée vaut 28 $ par année, **à 35 $ l'heure** sur 48 semaines » | `index.html:1826` | E | Le curseur juste au-dessus est réglé par défaut à « Ce que vous coûte une heure de main-d'œuvre : **42 $** » (`1713`). La note explique la méthode du **document** pendant que l'écran calcule avec le taux du **visiteur** : deux taux horaires visibles en même temps, sans dire lequel produit le montant affiché. (L'arithmétique des deux est juste : 48 min × 35 $ = 28 $.) | « Même méthode que notre document sur l'automatisation, **appliquée au taux horaire que vous avez réglé plus haut**. Dans le document, la base est de 35 $ l'heure sur 48 semaines. » |
| E3 | « **Cinq** façons de nous joindre. » | `index.html:2495` | E | Cinq cartes, puis un sixième chemin sous « OU SIMPLEMENT » avec l'adresse courriel (`2588`), plus l'adresse répétée dans la FAQ (`2394`) et le pied. Très mineur — « les quatre autres sont là pour le dixième » referme correctement le compte. | Rien d'obligatoire. Au besoin : « **Cinq façons, plus l'adresse courriel si vous préférez.** » |

---

## 2 · CONTRADICTIONS INTERNES, FACE À FACE

### C-1 · Le délai d'un site vitrine — **quatre valeurs**

| | Ligne | Texte |
|---|---|---|
| ① | `index.html:415` | « Site web vitrine — **1 semaine** » |
| ② | `index.html:740` | « **2 à 4 semaines** — Et le code vous appartient, adresse web comprise. » |
| ③ | `index.html:2409` | « **Deux à quatre semaines** pour un site vitrine. » |
| ④ | `index.html:1562` | « **4–6** semaines » |

**Écart de 1 à 6.** ② et ③ concordent ; ① et ④ sont seuls contre eux, et ① est la
**première** chose que le visiteur lit.

### C-2 · Le délai d'un logiciel — **un facteur quatre**

| | Ligne | Texte |
|---|---|---|
| ① | `index.html:419` | « Automatisation, logiciels et applications — **3 semaines** » |
| ② | `index.html:882` | « **1 à 3 mois** — Un autre développeur peut reprendre le projet demain matin. » |
| ③ | `index.html:2409` | « Un à trois **mois** pour une boutique ou un logiciel, selon l'envergure. » |

### C-3 · L'hébergement est-il inclus ou payant ?

| | Ligne | Texte |
|---|---|---|
| ① | `index.html:734` | « Hébergement et mise en ligne **inclus** » |
| ② | `index.html:2435` | « Un site en ligne a **toujours un coût d'hébergement** — le vôtre est modeste, il vous est annoncé avant la signature » |
| ③ | `index.html:2421` | « Un **plan mensuel** couvre l'hébergement, la sécurité, les sauvegardes […] Ce n'est pas obligatoire » |

② et ③ sont la version honnête, écrite exprès lors de la correction du 2026-07-29.
① n'a pas été touchée et dit le contraire.

### C-4 · Les deux guides : avec ou sans courriel ?

| | Ligne | Texte |
|---|---|---|
| ① | `index.html:2622` | « Deux documents, 91 pages, gratuits et **sans courriel**. » |
| ② | `index.html:931` | « 91 pages, gratuites, **sans courriel**. » |
| ③ | `index.html:1809` | « Télécharger, **sans courriel** » |
| ④ | `index.html:2768-2775` | `<input id="cadeauEmail" … required />` → « Recevoir mes deux guides » |

①②③ disent vrai (les liens du pied pointent directement sur `documents/*.pdf`).
④ demande une adresse **pour la même chose**. C'est la faute qui vient d'être retirée du
hero, déplacée dans le popup.

### C-5 · Y a-t-il une liste d'envoi ?

| | Ligne | Texte |
|---|---|---|
| ① | `index.html:2582` | « **Jamais** — De relance insistante, de **liste d'envoi non demandée**, ni de revente de vos coordonnées. » |
| ② | `index.html:2782` | « Gratuit · Aucun envoi non sollicité · **Désabonnement en un clic** » |

Un désabonnement suppose un abonnement.

### C-6 · Combien de temps pour lire le premier message ?

| | Ligne | Texte |
|---|---|---|
| ① | `index.html:2560` | étape 01 — « **le jour même** » |
| ② | `index.html:2565` | étape 02 — « **sous 12 h ouvrables** » |
| ③ | `index.html:2579` et 5 autres emplacements | « **12 h** — Le délai de réponse, jours ouvrables. Souvent moins. » |

### C-7 · Combien d'heures d'administration par semaine ?

| | Ligne | Texte |
|---|---|---|
| ① | `index.html:1885` | Comparatif — « À la main **7 h 20** » sur « une journée de huit heures » → **36,7 h/semaine** |
| ② | `index.html:1717` | Calculateur, réglage par défaut — « Heures par semaine sur l'administration : **26 h** » |

### C-8 · Le commentaire du document contredit le document

Deux commentaires HTML — **non affichés**, donc pas des affirmations publiques, mais ils
prouvent que l'écart est connu :

- `index.html:2280` : « On garde donc « **jusqu'à 5 000 $** », **qui est vrai** » — alors que
  le bouton d'en-tête (`251-252`) affiche « Référez, gagnez **5 000 $** » sans le « jusqu'à ».
- `index.html:455-458` : « les affirmations correspondantes ont été corrigées **PARTOUT**, pas
  seulement ici : l'heure de formation (Services, Parcours, FAQ) et l'abonnement obligatoire
  (FAQ) » — la correction de l'heure de formation est bien complète (vérifié : plus aucune
  occurrence affichée), mais celle de l'abonnement s'est arrêtée à la FAQ et **n'a pas atteint
  Services `734`** (voir C-3).

---

## 3 · À VÉRIFIER PAR LE PROPRIÉTAIRE

Sept points que je ne peux pas trancher depuis le code. Pour chacun : l'information exacte
qui manque.

**V1 · Les cinq projets sont-ils de vrais clients, avec de vrais sites en ligne ?**
`index.html:976-1090`. Cendre, Pneus Mécanique, Atelier Méridien, MV Déneigement, Studio Norden.
Les cadres sont des captures `webp` statiques, aucun n'est lié à une adresse. Les maquettes
Secteurs, elles, portent des numéros en `555-01xx` — la convention nord-américaine du numéro
**fictif** — et « Cendre » comme « MV Déneigement » servent aussi de décor de démonstration dans
Services. **Il me manque : les cinq adresses en ligne.** Si elles existent → mettre le lien sur
chaque cadre, et l'affirmation devient la meilleure preuve du site. Si elles n'existent pas →
« Cinq projets livrés » et « pas des maquettes » (`976-977`) sont **faux** et passent en
catégorie A.

**V2 · Aucun formulaire du site ne livre.**
`js/main.js:15` → `https://formsubmit.co/ajax/l-adresse-personnelle-retiree`. Le point d'entrée
existe mais n'a jamais été confirmé côté FormSubmit. **Il me manque : une soumission réelle
qui arrive dans la boîte.** Tant qu'elle n'arrive pas, **toutes** les promesses de délai
reposent sur un message que personne ne reçoit : « 12 h » (7 emplacements), « le jour même »
(`2560`), « Recevoir mes deux guides » (`2775`), « Envoyer en priorité » (modale Urgence),
« On confirme la plage par courriel avec l'invitation Google Meet » (modale Réservation).
C'est le risque de véracité le plus grave du site, et il n'est pas dans le texte.

**V3 · Le « diagnostic de vos processus, offert et sans engagement » existe-t-il ?**
`index.html:782`, référencé par `1847`. **Il me manque : ce que le client reçoit et combien de
temps ça prend.** Si c'est l'appel de 30 minutes, le dire ainsi. Si c'est un livrable distinct,
il doit apparaître dans le Processus, qui ne connaît aujourd'hui que quatre étapes commençant
par l'appel.

**V4 · « React, Next.js, Node.js, Python » est-il la vraie pile des projets clients ?**
`index.html:2439`. **Il me manque : la pile réelle d'au moins un projet livré.** Ce site-ci est
en HTML/CSS/JS sans cadriciel ni étape de compilation — la vitrine ne démontre donc aucune des
quatre. Un prospect technique, ou un concurrent, le voit en trente secondes. Si les projets
clients sont bien en React/Next, aucun problème. Sinon, la réponse est à réécrire.

**V5 · Le barème de commission tient-il ?**
`index.html:3277`. Deux questions. (a) **500 $ sur un contrat de 1 000 $ = 50 % de commission** :
est-ce voulu ? (b) Les cinq bornes sont ambiguës et rien n'est prévu sous 1 000 $ (voir B9).
**Il me manque : la règle exacte aux bornes, et le plancher.** C'est le seul engagement
financier chiffré du site envers un tiers.

**V6 · Les deux documents contiennent-ils bien 24 tâches chiffrées ?**
`index.html:2761` (popup cadeau : « **24** tâches chiffrées »). Le Comparatif en montre 6
(`1918-1970`), le Calculateur en liste 8 (`1731-1790`), et le Calculateur annonce « 42 pages,
**13 domaines** » (`1807`). **Il me manque : le décompte des tâches chiffrées dans les deux PDF.**
Les totaux de pages, eux, concordent (42 + 49 = 91, vérifié `2627`/`2633`/`2622`).

**V7 · La visite 360 et l'attribution Poly Haven.**
`index.html:1636-1642`. La note est **honnête** et je ne la compte pas comme un défaut : elle dit
que les panoramas sont des photos CC0 de Greg Zaal, pas des prises de vue APED. Mais Services 03
affirme « La visite 360 de la section suivante est **faite comme ça** » (`839`) en tête d'un
chantier qui vend des « visites virtuelles ». **Il me manque : une visite 360 tournée par APED
chez un vrai client.** Si elle existe, la mettre — c'est la démonstration que la section promet.
Sinon, la section 05 reste correcte (elle est étiquetée « Démo · Immobilier », `1612`) mais elle
prouve le **lecteur**, pas la **prise de vue**.

---

## 4 · DÉCOMPTE PAR CATÉGORIE

| Catégorie | Constats | Dont bloquants |
|---|---|---|
| **A · Faussetés démontrables / contradictions internes dures** | **9** | A1, A2, A3, A4, A5, A8 |
| **B · Invérifiables par un visiteur** | **10** | B6, B9 |
| **C · Engagements intenables tels qu'écrits** | **6** | C1, C2 |
| **D · Jargon de développeur** | **8** | D1 (répété 3 ×) |
| **E · Chiffres/taxonomies qui se contredisent (résiduel)** | **3** | — |
| **TOTAL des constats** | **36** | **11** |
| **À vérifier par le propriétaire** | **7** | V1, V2 |

**Répartition par section**

| Section | Constats |
|---|---|
| 01 · Accueil (hero + fiche technique) | 4 — A1, A2, D8, E1 |
| 02 · Services | 7 — A4, B8, B10, C1, C2, C3, D1 |
| 03 · Projets | 1 — A9 |
| 04 · Secteurs | 2 — B1, B2 |
| 05 · Visite 360 | 2 — D3, D4 |
| 06 · Calculateur | 3 — B6, B7, E2 |
| 07 · Comparatif | 2 — A8, B5 |
| 08 · Processus | 3 — C6, D5, D6 |
| 09 · Agence | 0 |
| 10 · Référence | 2 — A5, B9 |
| 11 · Questions (FAQ) | 1 — D2 |
| 12 · Contact | 4 — A6, A7, B4, E3 |
| Popup cadeau | 2 — A3, C5 |
| Modale Estimation | 1 — C4 |
| En-tête (toutes vues) | *A5, compté en 10* |
| `404.html` | **0** — rien à signaler |
| `documents/src/*.html` (91 pages) | **0** — exemplaires, voir en tête |

---

## 5 · CE QUI EST BIEN, ET QU'IL NE FAUT PAS CASSER EN CORRIGEANT

Un audit qui ne relève que les défauts fait supprimer les bonnes affirmations avec les mauvaises.
Les suivantes sont **vraies, vérifiables et comprises en trois secondes**. Elles ne figurent dans
aucun tableau.

- « **Le chiffre du premier appel est celui de la facture.** » (`592`, repris `2212`) — vérifiable
  par le client le jour de la facture, dit en une phrase, sans chiffre inventé.
- « **Tout** — Le code, l'hébergement, l'adresse web. Un autre peut reprendre demain. » (`611`) —
  la reformulation qui a remplacé « 100 % du code vous appartient » est meilleure que l'originale.
- « **0** — Mouchard, traceur, service extérieur. » (`623`) — vérifiable en dix secondes par
  n'importe qui, et **vrai** : aucune adresse externe dans le document.
- « C'est un **ordre de grandeur, pas une soumission**. » (`1826`) — la phrase la plus honnête
  de la page.
- « on ne publie pas de grille : […] une grille publiée finit **toujours par mentir** dans un sens
  ou dans l'autre » (`2401`) — un refus argumenté vaut mieux qu'un faux prix.
- La réponse FAQ sur l'abonnement (`2435`) — elle nomme le coût d'hébergement au lieu de le
  cacher, et distingue le coût réel de l'abonnement-otage. C'est le modèle à appliquer à `734`.
- L'attribution Poly Haven / Pannellum (`1636-1642`) — jargonneuse (D4) mais **honnête** :
  elle avoue que les panoramas ne sont pas d'APED alors que rien ne l'y obligeait.
- Les deux PDF, en entier.

---

*Audit en lecture seule. Aucun fichier du site n'a été modifié. Ce document est le seul ajout.*
