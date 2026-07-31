# Ce que j'ai décidé à ta place — nuit du 29 au 30 juillet 2026

> Tu m'as dit : « quand tu rencontres une décision que tu m'aurais
> demandée, prends la plus prudente et la plus honnête des options,
> applique-la, et note-la dans une liste à part ». La voici.
>
> **Trente et une décisions.** Chacune porte ce que j'ai choisi, ce que
> j'ai écarté, et pourquoi. Tout est déjà appliqué et mesuré : rien
> ici n'attend ton accord pour fonctionner. Ce qui suit sert à ce que
> tu puisses **renverser** un choix en connaissant son motif.
>
> Trois blocs à lire dans cet ordre :
> **§1** les décisions · **§2** ce qui reste bloqué, et pourquoi
> techniquement · **§3** mes réserves honnêtes.

---

## 1 · LES DÉCISIONS

### 1.1 · Les formulaires — la plus grosse

**D1 · J'ai ajouté un repli `mailto:` au lieu d'attendre l'activation
de FormSubmit.**

FormSubmit n'est toujours pas activé. Vérifié cinq fois cette nuit,
avec et sans en-tête `Referer` :

```
HTTP 200
{"success":"false","message":"This form needs Activation. We've sent
 you an email containing an 'Activate Form' link."}
```

Le lien d'activation est **dans ta boîte**. Je ne peux pas cliquer à ta
place. J'aurais pu m'arrêter là et te le dire — mais alors les six
formulaires du site auraient passé la nuit à ne rien livrer, sous sept
promesses de « 12 h ».

**Ce que j'ai fait :** quand l'envoi automatique échoue, un bouton
paraît sous le formulaire — « Ouvrir mon courriel, message déjà
écrit » — qui ouvre le logiciel de courriel du visiteur avec le
message **entièrement rempli** à partir des réponses qu'il vient de
taper. Le message arrive donc, par un autre chemin.

**Ce que j'ai écarté :**
- *faire de `mailto:` le chemin principal* → beaucoup de postes de
  bureau n'ont aucun client de courriel configuré ; on remplacerait un
  échec silencieux par un échec bruyant ;
- *retirer les promesses de délai du site* → elles sont vraies, c'est
  le canal qui était mort ;
- *un service tiers différent* → même dépendance, autre nom.

**Ce que ça te coûte le jour où tu activeras :** rien. Le repli ne
paraît que sur échec. Une fois le lien cliqué, il ne paraîtra plus
jamais, sans qu'une ligne de code change.
`node tools/formulaires-e2e.mjs` te le dira : il relève la réponse
réelle du service et l'affiche en tête.

**Mesuré :** 6 formulaires sur 6 livrent par le repli, avec les
réponses tapées retrouvées dans le corps du message. 0 erreur console.

---

**D2 · Le courriel du popup cadeau est devenu facultatif, et la remise
est passée AVANT le formulaire.**

Le pied de page, Services et le Calculateur offrent les deux mêmes
documents « gratuits et **sans courriel** », liens directs vers les
PDF. Le popup exigeait une adresse pour la même chose. J'ai rendu les
deux guides téléchargeables tout de suite et déplacé le formulaire
d'envoi **après** la remise — l'ordre visuel est la promesse.

**Ce que ça te coûte :** des adresses. Tu en captureras moins.
**Pourquoi je l'ai fait quand même :** c'était la même faute que
« 60 s · Sans donner votre courriel », que tu venais de retirer du
hero. La laisser dans le popup, c'est la déplacer, pas la corriger. Et
un visiteur qui lit le popup puis le pied trouve deux réponses
différentes **sur un seul écran**.

Si tu veux revenir en arrière : `#cadeauEmail` reprend `required`, et
`.cadeau-recu` reprend `hidden`. Mais alors il faut retirer « sans
courriel » des trois autres endroits, sinon la contradiction revient.

---

### 1.2 · Les délais, et l'offre

**D3 · Toute la fiche technique du hero est alignée sur les quatre
chantiers de Services — mêmes noms, même ordre, mêmes délais.**

Le délai d'un site vitrine avait **quatre** valeurs dans le même
document : 1 semaine (hero), 2 à 4 (Services), deux à quatre (FAQ),
4–6 (maquette Secteurs). J'ai retenu **2 à 4 semaines** partout :
c'est la valeur que Services engage, et la seule qu'on puisse tenir.

Conséquences que tu n'as pas demandées et que j'ai assumées :
- « Estimateur pour vos clients » a **disparu** de la fiche. Ce n'était
  un chantier nulle part, et le nom demandait un décodage. Le
  calculateur reste dans l'index et dans sa section.
- « Immobilier et visibilité locale » y **entre** : c'était un chantier
  entier de Services absent du hero.
- « Automatisation, logiciels et applications — 3 semaines » est
  **scindé** : automatisation 1 à 3 semaines, logiciels 1 à 3 mois. Un
  seul chiffre pour deux choses qui diffèrent d'un facteur quatre
  n'était vrai pour aucune des deux.
- La plaque « 7 » dit maintenant **« Produits »** et non « Métiers » :
  deux listes de granularités différentes ne se contredisent pas, deux
  listes qui prétendent compter la même chose, si.

---

**D4 · « Estimation en 60 secondes » est devenu « Estimation en six
questions », partout — y compris dans la balise de description.**

Le parcours compte six questions plus une étape où le nom et le
courriel sont obligatoires. Soixante secondes se mesurent au
chronomètre, et le site chiffre déjà son autre formulaire
« 7 étapes · 4 minutes ». « Six questions » est vrai, ne se contredit
pas, et c'est déjà ce que dit la carte Contact.

Effet de bord vérifié : le libellé du bouton passe de 25 à 24 lettres,
donc 21,7 ms par lettre — au-dessus du plancher d'une image à 60 Hz.
Contraste pendant la transition : 4,70:1 minimum.

---

**D5 · « le jour même » est devenu « le prochain jour ouvrable ».**

Un message déposé à 23 h ou le samedi ne peut pas être lu le jour même,
et l'étape juste dessous annonçait « sous 12 h ouvrables » — deux
promesses contradictoires à trois lignes d'écart.

---

### 1.3 · Les chiffres

**D6 · J'ai retiré deux postes du calculateur, et le chiffre vedette a
baissé de 27 %.**

`Erreurs manuelles évitées` et `Revenus gagnés, réponse plus rapide`
pesaient 14 657 sur les 53 751 affichés. Aucune méthode publiée pour
ni l'une ni l'autre. **Et la première était une faute d'arithmétique,
pas seulement un défaut de méthode** : elle monétisait une seconde fois
les mêmes heures que « Heures facturables rendues » — mêmes heures,
autre taux, 35 % du résultat. Ce n'était pas un second bénéfice,
c'était le premier compté deux fois.

Le montant par défaut passe donc de **53 751 à ≈ 39 100 $**. Ces
39 100 se défendent ligne à ligne : des heures, au taux horaire que le
visiteur a lui-même réglé, sur cinquante-deux semaines.

**C'est la décision la plus lourde de la nuit, parce qu'elle réduit le
chiffre qui attire.** Je l'ai prise parce que tes deux PDF s'imposent
déjà ce standard, mot pour mot : « écrit au plus bas, jamais au plus
flatteur ». La page d'accueil ne l'atteignait pas.

Si tu veux récupérer ces 14 657 : il faut publier le taux et la base
dans la note de méthode, et retirer le double comptage. Le second est
non négociable ; le premier est un choix.

---

**D7 · Le montant s'affiche arrondi à la centaine, précédé de « ≈ ».**

« 53 751 $ » au dollar près, sur un chiffre que la section appelle
elle-même « un ordre de grandeur, pas une soumission ». La fausse
précision invite la contestation qu'elle veut éviter.

---

**D8 · Le cadre « une journée de huit heures » a été retiré du
Comparatif ; le tableau, lui, est intact.**

Il affirmait qu'une PME passe **91,7 %** d'une journée de huit heures en
administration : il resterait quarante minutes pour faire le métier. Le
tableau détaillé est arithmétiquement juste — 440 min → 104 min, écart
336 min = 5 h 36, vérifié ligne à ligne — et ces 440 minutes sont
celles d'une **entreprise**, toutes personnes confondues. C'est le
cadre qui mentait, pas la mesure. L'axe reste une règle de huit heures,
il n'affirme plus une proportion de journée.

---

**D9 · Le barème de commission a des bornes fermées, et un plancher
nommé.**

À un contrat de **exactement** 10 000 $, la commission valait 500 ou
700 sans qu'on puisse trancher. Idem à 30 000, 50 000, 80 000, 100 000.
J'ai fermé les bornes d'un seul côté (« de 1 000 $ à 9 999 $ → 500 $ »)
et ajouté la ligne qui manquait : **sous 1 000 $, pas de commission**.

**C'est une décision que je t'aurais demandée.** Une ambiguïté dans un
engagement écrit se règle en faveur de celui à qui on l'a promis :
l'écrire explicitement ne change donc rien à ce que tu devrais déjà
payer, et supprime la dispute. Le plancher, lui, était un silence — je
l'ai transformé en règle plutôt qu'en litige.

**Ce que je n'ai PAS touché :** 500 $ sur un contrat de 1 000 $ font
**50 % de commission**. Ton barème publié le prévoit. Je ne sais pas si
c'est voulu, et ce n'était pas à moi de le changer. **À regarder.**

---

**D10 · « 13 secteurs couverts » → « 12 métiers préparés ».**

Le treizième des treize est « Votre industrie ici » : un emplacement
vide. Et « couverts » affirme qu'ils ont été **servis**, ce que rien ne
soutient. « Préparés » est vrai : montrer un aperçu est vrai, avoir
servi le secteur ne l'est pas encore.

---

### 1.4 · Ce qui promettait un résultat

**D11 · « c'est vous qui sortez » → « tout est en place pour que ce
soit vous ».**

C'était une promesse de **classement Google**, à l'indicatif présent, en
titre de chantier. Personne ne contrôle le classement de Google, et
surtout pas par contrat : invérifiable avant l'achat, démontrable
**contre** toi après. Ce qui reste dit le travail, qui est livrable et
qui se constate.

---

**D12 · « il se trouve sur Google » → « il est construit pour être
trouvé sur Google ».**
**D13 · « Il se charge avant que la page d'à côté ait fini de
clignoter » → « Rien de superflu à charger, c'est ce qui le rend
rapide ».**

Le second était un superlatif comparatif contre un concurrent anonyme,
sans mesure. « La page d'à côté » n'existe pas, donc rien ne peut la
défendre.

**Ce que j'ai écarté :** l'audit proposait « il s'affiche en moins d'une
seconde, mesuré, pas promis ». **Je ne l'ai pas retenu**, et c'est
important : tous les chiffres de vitesse de ce dépôt sont mesurés en
local, sur `localhost`, dans Chromium piloté. Remplacer un superlatif
indéfendable par un chiffre indéfendable n'aurait rien réglé. La
formulation retenue dit la **cause** — un choix de construction — qui
est vraie et vérifiable.

---

**D14 · « Proposition écrite — 12 h » → « Réponse — 12 h » dans la
figure du Processus.**

Partout ailleurs les 12 h sont le délai de **réponse**, et le Contact
précise que cette réponse peut être « des questions s'il en manque, **ou**
directement une proposition ». La figure transformait un conditionnel
en engagement ferme de livrable. Le texte de l'étape, lui, dit
correctement qu'on repart avec une proposition écrite : je n'y ai rien
touché.

---

**D15 · « Désabonnement en un clic » a disparu du popup.**

Un désabonnement suppose un abonnement, et la section Contact promet
« jamais de liste d'envoi non demandée ». Les deux ne pouvaient pas
être vrais. J'ai gardé celle qui est vraie et remplacé l'autre par ce
qui décrit la réalité : « votre adresse sert à envoyer les deux guides,
et à rien d'autre ».

---

### 1.5 · Les projets, et les démonstrations

**D16 · « Des sites en ligne, pas des maquettes » et « Cinq projets
livrés » sont retirés.**

C'est ton arbitrage, je l'ai appliqué. Mais j'ai poussé plus loin que
demandé, et il faut que tu le saches :

**D17 · J'ai aussi réécrit les cinq lignes « Ce qui a changé », qui
sont devenues « Ce que ça règle ».**

Elles étaient au passé et racontaient des résultats chez un client :
« Les appels hors territoire **ont cessé** », « Plus personne **ne
cherche** une référence de pneu au téléphone ». Si l'affirmation de
livraison n'est pas défendable, ces phrases-là ne le sont pas non plus
— elles sont même plus précises, donc plus faciles à contester. Elles
décrivent maintenant le **mécanisme** de la page, au présent, ce qui se
constate à l'écran.

> **Le jour où les cinq adresses en ligne existent**, mets le lien sur
> chaque cadre et remets « cinq projets livrés » : l'affirmation
> redevient la meilleure preuve du site. C'est le lien qui la
> transforme en preuve, pas la phrase.

---

**D18 · La figure « Résultats locaux » ne montre plus de client réel,
et sa note Google inventée a disparu.**

Elle affichait « MV Déneigement » en **position 1** avec « 4,9 · 128
avis » — deux chiffres inventés, sur une entreprise que la section
Projets présente comme un client. Et rien n'étiquetait la figure comme
une démonstration, contrairement aux treize aperçus de Secteurs.

Trois correctifs : la fiche devient « Votre entreprise », le mot
**« Exemple »** est écrit dans le chrome de la figure, et les deux
voisins prennent des noms manifestement génériques. Aucun nom de client
réel ne sert plus de décor.

---

**D19 · « La visite 360 de la section suivante est faite comme ça » →
« La section suivante montre le lecteur de visite qu'on installe ».**

Ta propre note de la section 05 dit que les panoramas sont des photos
CC0 de Poly Haven, pas tes prises de vue. La démonstration prouve le
**lecteur**, pas la séance de photo. J'ai aligné la phrase sur ce que la
démo démontre vraiment, et ajouté la même précision dans la note de
crédit.

> Le jour où une visite tournée chez un vrai client existe, elle
> remplace la démo et cette ligne redevient « faite comme ça ».

---

### 1.6 · Le jargon

**D20 · « CRM » a disparu des trois endroits** où il vivait (Services,
figure Atelier, Comparatif) → « fichier clients ». Un garagiste tient
ses clients dans un cahier ou dans un chiffrier.

**D21 · « Diagnostic de vos processus, offert et sans engagement » →
« L'appel de 30 minutes fait le tour de vos processus, sans
engagement ».** Le diagnostic n'existait nulle part ailleurs : le
Processus ne connaît que quatre étapes, commençant par l'appel. J'ai
nommé la chose qui existe. Le Comparatif, qui s'y adossait, dit
maintenant « les vôtres sortiront de l'appel ».

**D22 · « 2048 px puis 4096 px » → « La pièce s'ouvre tout de suite,
puis se précise d'elle-même ».** Les crédits Pannellum et CC0 restent —
ils sont honnêtes et nécessaires — mais en note, après le bénéfice.

**D23 · « grille — 12 colonnes » → « galerie — photos intégrées ».**
**D24 · « Tests passés — 24 / 24 » → « Vérifications — faites ».** Le 24
était inventé, et le client ne sait ni ce qu'est un test ni ce qui
arriverait à 23.

**D25 · « modèle générique » → « un robot d'usine ».**

**D26 · « React, Next.js, Node.js, Python » : l'ordre est inversé et la
liste complétée.** La vraie réponse — un autre développeur reprend le
code demain matin — arrivait après quatre noms et se noyait dedans.
Pire : **ce site-ci est en HTML, CSS et JavaScript sans cadriciel**, donc
la vitrine ne démontrait aucune des quatre technologies annoncées. Un
prospect technique le voit en trente secondes. La réponse nomme
maintenant la fourchette réelle, ce qui la rend vérifiable **sur ce
site même** au lieu d'être contredite par lui.

> **À vérifier par toi :** si tes projets clients ne sont pas en
> React/Next/Node/Python, dis-le-moi et je réécris. J'ai supposé que
> oui, en ajoutant le vanilla que ce site prouve.

---

### 1.7 · Les statistiques inventées

**D27 · « Les neuf qu'on nous pose le plus » → « Neuf questions, et la
vraie réponse à chacune ».** Un historique qu'un visiteur ne peut pas
vérifier, et qu'une maison jeune ne peut pas démontrer.

**D28 · « La première est la bonne dans neuf cas sur dix » → « La
première est celle qu'on recommande ».** Statistique inventée sur ton
propre trafic. En la retirant, « le dixième » disparaît aussi — et
c'était lui qui refermait le compte de cinq. J'ai donc nommé la sixième
voie dans la même phrase : « et l'adresse courriel est en bas de page ».

**D29 · « observées chez des PME » → « tirées de notre document sur
l'automatisation, où chaque chiffre porte sa source ».** La source
existait déjà et était publique. Le Comparatif affichait les chiffres
les plus agressifs du site et ne citait rien.

**D30 · « Référez, gagnez 5 000 $ » → « Référez, gagnez jusqu'à
5 000 $ ».** L'élément le plus visible du site — présent sur **toutes**
les vues — était le seul à annoncer le plafond comme un montant plat,
alors que le barème commence à 500 $ et qu'un commentaire de ton propre
document dit « on garde donc jusqu'à 5 000 $, **qui est vrai** ».

---

### 1.8 · Deux corrections que personne n'avait demandées

**D31 · Trois textes du site restaient à 10 % d'opacité, en permanence,
pour un visiteur normal.**

Trouvé en mesurant, pas en lisant. `tools/contraste-arret.mjs`, 61
positions d'arrêt : les trois états du programme de référence
— « Envoyé », « Signé », « Encaissé » —, la bulle de texto, les deux
lignes d'avis, et la ligne de suite du parcours. Contrastes relevés de
**1,15:1 à 1,36:1**. Illisible, et permanent.

La cause : un `fromTo` de GSAP pose son état de départ dès la création
de la timeline. La révélation n'arrivait jamais, parce que les sections
traversées portent `content-visibility: auto` — leur hauteur réservée
n'est pas leur hauteur réelle, donc la position de déclenchement
calculée tombait à côté.

Onze tweens portent maintenant `immediateRender: false`, ce qui est la
règle 0bis du projet appliquée jusqu'au bout : l'état de repos est la
forme finale. Un déclencheur qui ne part pas coûte alors une animation
manquante, plus la lisibilité.

**Le même outil rend maintenant zéro.** C'était 8 avant.

> **Ce n'est pas la correction de la CAUSE.** Les positions de
> déclenchement restent périmées par `content-visibility`. C'est un
> chantier plus gros que ce que je devais décider seul cette nuit, et
> il est inscrit dans `CLAUDE.md § 13`.

---

**Deux contrastes à l'arrêt corrigés au passage** (antérieurs à cette
nuit, prouvés par A/B en worktree contre le commit précédent — les deux
versions rendaient la même valeur au centième) :

| Où | Avant | Après | Cause |
|---|---|---|---|
| « Itinéraire », figure Google | **1,34:1** | conforme | `.ecr-fiche span` remettait `--ink-muted` par-dessus le `--accent-ink` du bouton |
| Texte des 5 cartes de contact, **au survol** | **4,41:1** | 11,8:1 | `--ink-muted` sur le « ciment enfoncé » du survol. Le survol faisait **baisser** le contraste |

Sur la carte principale, qui est sur minium, mon premier correctif en a
cassé un autre — 3,02:1 — attrapé par la passe suivante. Corrigé aussi.
C'est pour ça que la densité d'échantillonnage compte.

---

## 2 · CE QUI RESTE BLOQUÉ, ET POUR QUELLE RAISON TECHNIQUE

### B1 · FormSubmit — **un clic, dans ta boîte**

> **C'est la seule chose que je ne pouvais pas faire, et c'est la plus
> rapide à faire.**

Cherche dans `dorvalwilliam11@gmail.com` un message de FormSubmit avec
un lien **« Activate Form »**. Clique. C'est fini.

Puis lance, pour confirmer :

```
node tools/serve.mjs 8099
node tools/formulaires-e2e.mjs
```

La première ligne du rapport doit passer de `NON ACTIVE` à `ACTIVE`.
À partir de là les six formulaires livrent directement et le repli
`mailto:` ne paraît plus. Rien à changer dans le code.

Je n'ai pas d'accès à ta boîte : l'outil Gmail de cette session n'a
qu'une fonction d'authentification interactive, et tu dormais.

---

### B2 · L'onglet caché — **non prouvable sur cette machine**

Le brief exige que la boucle des plaques se mette en pause quand
l'onglet est caché. **Le code le fait.** Ce que je n'ai pas pu prouver,
c'est que le navigateur émet bien l'événement, parce que Chromium sous
Playwright ne modélise pas la visibilité d'un onglet. Trois méthodes
essayées, toutes rendent `document.hidden === false` :

- un second onglet du même contexte mis au premier plan, **sans tête** ;
- le même, **avec tête** (fenêtre réelle) ;
- `Page.setWebLifecycleState` en `frozen` via le protocole DevTools.

`tools/plaques-vie.mjs § 7` rend donc deux verdicts séparés, et il le
dit :

- **A · la plateforme** → NON PROUVABLE ICI ;
- **B · le branchement** → prouvé : `document.hidden` forcé à `true` +
  `visibilitychange` émis → l'attribut se pose, les huit animations
  passent en `paused`, le gel est vérifié au pixel, et ça repart au
  retour.

**Ce qu'il te reste à faire :** ouvre le site, va sur les plaques,
change d'onglet dix secondes, reviens. Si elles ont bougé pendant ton
absence, dis-le-moi.

---

### B3 · Rien n'a été vérifié sur un appareil réel

Inchangé, et je n'ai rien ajouté qui le corrige. Tout ce que j'ai
mesuré cette nuit — la boucle, les contrastes, le LCP, les paliers —
vient de **Chromium piloté par Playwright sur une machine de bureau
Windows**. Y compris les relevés « téléphone » : 390 px avec
`pointer: coarse` émulé n'est pas un téléphone.

La boucle des plaques ne tourne pas sur téléphone (palier 1), donc ce
trou-là ne s'est pas agrandi. Mais il ne s'est pas comblé.

---

### B4 · Deux points de ton audit que je n'ai pas pu trancher seul

| | Ce qui manque |
|---|---|
| **Les cinq adresses en ligne** | Si elles existent, mets les liens et je remets l'affirmation. Voir D16-D17. |
| **La pile réelle des projets clients** | J'ai supposé React/Next/Node/Python + vanilla. Voir D26. |

Deux autres se sont résolus tout seuls en lisant les sources :

- **« 24 tâches chiffrées »** est **VRAI**. La couverture de ton
  document sur l'automatisation l'écrit elle-même : « Guide de
  référence · 24 tâches · 13 domaines », et la table des matières les
  détaille par famille, tâches 01 à 24. Rien à corriger.
- **Les 91 pages** concordent (42 + 49), déjà vérifié.

---

### B5 · Un détail d'ergonomie, trouvé en testant la réservation

Le calendrier rend le **lendemain** sélectionnable, mais si tu réserves
en soirée, le préavis de 24 h élimine toutes ses plages : le visiteur
clique un jour disponible et lit « Plus rien de libre ce jour-là ».
Ce n'est pas faux, c'est juste un clic pour rien. Le premier jour
réellement offrable pourrait être désactivé quand il n'a aucune plage.
**Je ne l'ai pas touché** : c'est un choix d'ergonomie, pas une
fausseté, et tu ne m'avais pas mandaté pour ça.

---

## 3 · MES RÉSERVES HONNÊTES

**R1 · La boucle des plaques est visible, et je ne sais pas si elle te
plaira.**

Mesuré : 8 à 24,5 px de dérive verticale, 4 à 13,4 px d'horizontale,
1,07° à 2,25° de battement, périodes de 7 à 10,6 s. Écarts de pixels
entre deux captures consécutives : 11 à 14,7 %. C'est **au-dessus** des
seuils de perception, ce qui était l'exigence — mais l'écart entre
« ça vit » et « ça danse » est un jugement, pas une mesure. Si c'est
trop, `--vie-x`, `--vie-y` et `--vie-a` sont dans un seul bloc de
`css/app.css § 13bis` et se divisent par deux en dix secondes.

**R2 · J'ai fait tomber la boucle au palier 1, donc elle ne tourne pas
sur téléphone.**

Une animation permanente est par définition le poste le plus cher du
site : elle ne s'arrête jamais. Tu as insisté sur la batterie, et j'ai
appliqué ce principe jusqu'au bout. Conséquence assumée : sur
téléphone, les plaques restent inclinées, décalées et lisibles, mais
immobiles. Si tu la veux sur téléphone, c'est un mot à changer dans
`js/langue.js` — et il faudra alors mesurer sur un vrai appareil, pas
sur une émulation.

**R3 · J'ai touché à des tests, et c'est le geste le plus risqué de la
nuit.**

`cadeau-check.mjs` affirmait, **comme une qualité**, que les deux guides
sont verrouillés jusqu'à ce qu'on donne une adresse. Le test passait, et
il passait *parce que* le défaut était là. J'ai retourné trois
verdicts. J'ai aussi corrigé deux instruments qui rendaient de faux
verdicts (`contraste-survol` concluait sur la pire image ;
`contraste-arret` sautait au lieu de défiler ; `cadeau-check` comptait
un nombre fixe de tabulations).

**Chaque fois qu'on corrige un test, on peut fabriquer un test
complaisant.** Les miens mesurent l'inverse de ce que mesuraient les
anciens, et les anciens étaient faux — mais c'est moi qui le dis, et
c'est exactement le genre d'affirmation qu'il faut relire à froid.

**R4 · Le chiffre du calculateur a baissé de 27 %, et c'est visible dès
le premier écran.**

Le rail affiche « ≈ 39 100 $ » là où il affichait « 53 751 $ ». C'est
plus honnête et c'est moins vendeur. Je pense que c'est le bon
arbitrage, et je pense aussi que c'est celui que tu es le plus
susceptible de vouloir renverser. Le double comptage, lui, n'est pas
négociable ; le reste est un choix.

**R5 · Je n'ai pas relu les deux PDF.**

91 pages. Ton audit les déclare exemplaires et n'y trouve rien. J'ai
vérifié une seule affirmation dedans — les 24 tâches — parce que le
site s'y adosse. Je n'ai pas cherché de contradictions **entre** les
PDF et le site corrigé. Si le site dit maintenant « 2 à 4 semaines » et
qu'un PDF dit autre chose, je ne l'ai pas vu.

**R6 · Le site fait une requête tierce, et une plaque dit le
contraire.**

La plaque dit « **0** · Mouchard, traceur, service extérieur. Votre site
ne dépend de personne. » C'est vrai **au chargement** : zéro requête
externe, vérifiable en dix secondes dans la console. Mais à l'envoi
d'un formulaire, le site appelle `formsubmit.co`.

Je ne l'ai pas comptée comme une fausseté, et voici mon raisonnement :
« **votre** site » désigne le site du client, pas celui-ci ; la plaque
promet ce que tu construis, et ce site le démontre au chargement. Le
repli `mailto:` que j'ai ajouté est, lui, le seul canal d'envoi qui ne
soit une requête vers personne.

**Mais c'est un raisonnement, pas une mesure**, et un prospect technique
pourrait ne pas l'acheter. Si tu veux fermer complètement : le jour où
un formulaire passe par ton propre hébergement, la plaque devient vraie
sans réserve.

---

*Écrit pendant la nuit du 29 au 30 juillet 2026. Tout ce qui est décrit
ici est appliqué, mesuré, et poussé. Ce document n'attend rien de toi
sauf une relecture — sauf **B1**, qui attend un clic.*
