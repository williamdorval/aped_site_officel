# Brancher les formulaires du site — le guide complet

Ce document se suit **à la lettre, dans l'ordre**. Il ne suppose rien
de connu. À la fin, les sept formulaires du site écrivent dans un
Google Sheet, un avis part vers la boîte de l'agence, le site affiche
**vos vraies disponibilités tirées de Google Agenda**, et une
réservation crée le rendez-vous avec son lien Google Meet.

Compter **25 à 40 minutes** la première fois.

> **Vous cherchez juste à bloquer une journée ?** C'est trois lignes,
> depuis votre téléphone, et il n'y a rien à installer :
> [« Bloquer une journée »](#bloquer-une-journée-ou-une-plage-horaire).

> **Une seule chose à ne jamais faire** — au bout de ce guide, à
> l'étape 7 : quand vous modifierez `Code.gs` plus tard, ne cliquez
> **jamais** « Nouveau déploiement ». L'adresse changerait et le site
> parlerait dans le vide. Il faut « Gérer les déploiements → crayon →
> Nouvelle version ».

---

## Ce qu'on installe

```
Le site (statique)                Le compte apedagence@gmail.com
─────────────────────             ──────────────────────────────
index.html                        ┌─ Google Sheet « ADEXWEB — demandes du site »
  └ js/main.js                    │    7 onglets, un par formulaire
      ├ POST ─────────────────▶   ├─ Apps Script (Code.gs) en Web App
      │   écrit la demande        │    · doPost  → écrit
      │                           │    · doGet   → rend les créneaux libres
      └ GET ?action=creneaux ─▶   ├─ Gmail : l'avis interne + la confirmation
          ▲   lit les plages      ├─ Google Calendar : LA SOURCE des dispos,
          │                       │    le rendez-vous, et le lien Meet
   js/config.local.js             └─ Google Drive : les pièces jointes
     (fabriqué, jamais commité)
          ▲
     .env.local
```

**Une seule pièce est à vous** : l'adresse du déploiement, qui vit
dans `.env.local`. Tout le reste se fabrique.

**UN SEUL DÉPLOIEMENT, DEUX PORTES.** Le même Apps Script, à la même
adresse, fait les deux : `POST` écrit une demande, `GET
?action=creneaux` rend les plages libres. Il n'y a **pas** de second
déploiement à créer, pas de seconde adresse à tenir à jour.

**AUCUN SERVICE EXTERNE.** Pas de Calendly, pas d'extension, pas de
clé d'API. Le calendrier de `apedagence@gmail.com` est la seule
source de vérité de vos disponibilités.

---

## Étape 1 · Créer le classeur

**Connectez-vous à `apedagence@gmail.com`** — pas à un autre compte.
C'est ce compte qui va héberger le classeur, envoyer les courriels et
porter le calendrier. Vérifiez la photo en haut à droite avant de
continuer ; toute cette configuration se fait *dans* le compte où
vous êtes.

1. Allez sur **<https://script.google.com>**
2. **Nouveau projet**
3. En haut à gauche, cliquez sur « Projet sans titre » et nommez-le
   **`ADEXWEB — formulaires du site`**
4. Dans l'éditeur, effacez tout le contenu de `Code.gs`
   (`Ctrl/Cmd + A`, puis `Suppr`)
5. Ouvrez le fichier **`google/Code.gs`** de ce dépôt, copiez-le
   **en entier**, et collez-le dans l'éditeur
6. **`Ctrl/Cmd + S`** pour enregistrer

> **Quel fichier copier, exactement :** `google/Code.gs`, à la racine
> du dépôt, dans le dossier `google/`. C'est le seul. Le fichier
> `google/appsscript.json` du dépôt est une *référence* de ce que
> l'éditeur doit contenir — ne le copiez pas à la main, l'étape 2 le
> remplira toute seule.

---

## Étape 2 · Activer le service avancé Calendar

**Cette étape sert DEUX fois, et elle n'est pas optionnelle.**

| Sans elle | Ce qui se passe |
|---|---|
| **Le lien Meet** | il n'est **jamais** créé. Le service ordinaire pose des événements mais ne sait pas fabriquer de conférence ; seul le service avancé le peut. |
| **Les créneaux** | ils sont calculés quand même, mais **sans nuance** : le service ordinaire n'expose pas la marque « Occupé / Disponible » d'un événement, donc **tout** bloque. |

**Où cliquer, exactement :**

1. Dans la colonne de gauche de l'éditeur, repérez **`Services`**
   (avec un **`+`** à côté). C'est sous `Fichiers`, pas dans le menu
   du haut.
2. Cliquez le **`+`**
3. Une fenêtre « Ajouter un service » s'ouvre. Faites défiler jusqu'à
   **`Google Calendar API`** — la liste est par ordre alphabétique,
   c'est vers le milieu.
4. Laissez la version sur **`v3`** et l'identifiant sur **`Calendar`**
   — le code appelle `Calendar.Events.insert` et `Calendar.Events.list`,
   donc cet identifiant doit rester **exactement** `Calendar`. Le
   changer casse les deux d'un coup.
5. Cliquez **`Ajouter`**

`Calendar` apparaît maintenant sous `Services` dans la colonne de
gauche. C'est la preuve que c'est fait.

> **Vérification en une seconde, plus tard :** ouvrez l'adresse de
> votre déploiement dans un navigateur. La réponse contient
> `"calendrier":true`. Si elle dit `false`, cette étape n'a pas été
> faite — ou elle a été faite sans redéployer (étape 7).

---

## Étape 3 · Créer le classeur et ses sept onglets

Vous ne construisez rien à la main : une fonction s'en charge.

1. En haut de l'éditeur, dans le menu déroulant des fonctions,
   choisissez **`initialiser`**
2. Cliquez **`Exécuter`**
3. Google demande les autorisations — c'est l'étape 4, juste
   dessous. Revenez ici après.
4. Une fois autorisé, relancez **`Exécuter`**
5. Ouvrez **`Journal d'exécution`** (en bas). Vous devez lire :

   ```
   Classeur prêt : https://docs.google.com/spreadsheets/d/…/edit
   Identifiant retenu : …
   Avis envoyés à : apedagence@gmail.com
   ```

6. **Ouvrez le lien du classeur** et vérifiez les sept onglets :

   | Onglet | Ce qu'il reçoit |
   |---|---|
   | Démarrer un projet | le formulaire long, 6 étapes |
   | Estimation rapide | les 6 questions + nom et courriel |
   | Urgence | le formulaire prioritaire |
   | Référer une entreprise | le programme de référence |
   | Réserver un appel | les rendez-vous, avec le mode et le lien Meet |
   | Contact simple | le message ordinaire, en bas de page |
   | Lead magnet | les coordonnées du popup des deux guides |

   Sur chacun : la ligne 1 est **noire, en gras, figée**, les largeurs
   sont réglées, et les **cinq dernières colonnes** sont celles du
   travail à trois :

   | Colonne | Où | Ce que c'est |
   |---|---|---|
   | **Statut** | **B**, juste après la date | liste : *Nouveau · Contacté · En discussion · Client · Fermé*. **En deuxième position exprès** : c'est la seule chose qu'on relit à chaque coup d'œil, et elle était dix-neuvième |
   | **Renvois** | à la fin | combien de fois la même demande est revenue (double-clic, renvoi après coupure réseau). `0` sur une demande neuve |
   | **Lu par** | à la fin | liste : *William · Allen · Eli* |
   | **Rappelé par** | à la fin | liste : *William · Allen · Eli* |
   | **Notes internes** | à la fin | champ **libre**, sans liste. Le seul endroit où écrire une phrase |

   Cliquez une cellule de « Statut » pour vérifier que la liste
   déroulante est bien là.

> **Les demandes non lues sont surlignées en jaune pâle.** La règle
> est simple : « Lu par » vide → toute la ligne se colore. Mettez
> votre nom, la couleur disparaît. C'est le seul tri à faire un lundi
> matin : ce qui est jaune n'a été vu par personne.

> **Relancer `initialiser()` après un changement de colonnes ne
> décale plus rien.** La fonction relit les anciens en-têtes et
> **redispose** chaque ligne existante dans le nouvel ordre avant de
> réécrire la ligne 1. Le journal d'exécution dit exactement ce
> qu'elle a déplacé. (Avant, elle réécrivait les en-têtes en laissant
> les données en place : le courriel d'un client se retrouvait sous
> « Ville », et rien ne le signalait.)

   Une sixième colonne, **Signature**, est **masquée** : elle sert au
   dédoublonnage et n'a rien à dire à un humain. Ne la démasquez pas.

> **Les demandes arrivent en LIGNE 2**, pas au bas du classeur. La
> plus récente est toujours en haut, sans avoir à trier.

> **Relancer `initialiser()` ne détruit rien.** Elle ajoute ce qui
> manque et laisse en place ce qui existe. C'est ce qui permet
> d'ajouter une colonne plus tard sans perdre les demandes reçues.

---

## Étape 4 · Les autorisations que Google demande

À la première exécution, Google ouvre une fenêtre. Le parcours est
volontairement effrayant ; il est normal.

1. **`Examiner les autorisations`**
2. Choisissez le compte **`apedagence@gmail.com`**
3. Écran « Google n'a pas validé cette application » →
   **`Paramètres avancés`** → **`Accéder à ADEXWEB — formulaires du site
   (non sécurisé)`**

   > Ce « non sécurisé » veut dire « Google n'a pas audité ce
   > script ». C'est **votre** script, dans **votre** compte, écrit
   > dans ce dépôt. Il n'y a pas de tiers.

4. **`Autoriser`**

Ce que vous accordez, et pourquoi chacune est nécessaire :

| Autorisation demandée | À quoi elle sert | Refusable ? |
|---|---|---|
| Consulter et gérer vos feuilles de calcul | écrire chaque demande dans le classeur | **non** — c'est le cœur |
| Envoyer un courriel en votre nom | l'avis interne + la confirmation au visiteur | **non** |
| **Consulter et modifier les agendas** | **trois choses à la fois** : LIRE votre agenda pour savoir quelles plages sont libres, RELIRE au moment d'enregistrer pour ne pas donner deux fois la même, et ÉCRIRE le rendez-vous avec son lien Meet | **non** — sans elle, plus de réservation du tout |
| Consulter et gérer les fichiers Drive | ranger les pièces jointes du formulaire de projet | oui, si vous acceptez de perdre les pièces jointes |
| Voir votre adresse électronique | savoir où envoyer l'avis, **sans l'écrire dans le dépôt** | **non** |
| Se connecter à un service externe | réservé, non utilisé aujourd'hui | oui |

> **« Consulter et modifier les agendas » a l'air énorme, et c'est
> normal de tiquer.** Google ne propose pas d'autorisation plus fine :
> il n'existe pas de « lire seulement les heures occupées, sans les
> titres ». Ce que le script en fait, en revanche, est étroit et
> vérifiable dans `google/Code.gs` : il lit des **intervalles**
> (`occupations`), il n'envoie au site **aucun titre, aucun invité,
> aucune description** — seulement des heures libres. La fonction
> `creneauxLibres` est l'unique chose que la porte publique rend, et
> `tools/creneaux-check.mjs` vérifie qu'aucun titre d'événement n'y
> fuit.

> **Pourquoi « voir votre adresse » est important.** Le code
> n'écrit **nulle part** `apedagence@gmail.com` : il la demande à
> l'exécution par `Session.getEffectiveUser().getEmail()`. Ce dépôt
> est public — une adresse en clair dans `Code.gs` serait une adresse
> publiée.

---

## Étape 5 · Déployer en application Web

1. En haut à droite : **`Déployer`** → **`Nouveau déploiement`**
2. Cliquez la **roue dentée** à gauche de « Sélectionner le type » →
   **`Application Web`**
3. Remplissez :

   | Champ | Valeur | **Pourquoi** |
   |---|---|---|
   | Description | `v1 — formulaires` | pour vous y retrouver plus tard |
   | Exécuter en tant que | **`Moi (apedagence@gmail.com)`** | le script doit écrire dans **votre** classeur et votre calendrier. En « utilisateur accédant », il tenterait d'écrire chez le **visiteur** — qui n'a ni le classeur ni le droit. |
   | Qui a accès | **`Tout le monde`** | un visiteur du site n'est connecté à aucun compte Google. Toute autre valeur lui répondrait « connectez-vous », et le formulaire échouerait pour tout le monde sauf vous. |

4. **`Déployer`**
5. **Copiez l'`URL de l'application Web`.** Elle ressemble à
   `https://script.google.com/macros/s/AKfy…/exec`

> **Elle doit se terminer par `/exec`.** L'éditeur affiche aussi une
> adresse en `/dev` : celle-là exige d'être connecté au compte
> propriétaire, donc elle marcherait pour vous et pour personne
> d'autre. `tools/config-envoi.mjs` refuse les adresses `/dev`
> justement pour empêcher ce piège.

### Les portes du même déploiement

Ce déploiement unique répond à plusieurs choses. Vous n'avez **rien**
à faire de plus : le site ajoute le paramètre tout seul.

| Ce que le site envoie | Ce que le script fait | Écrit-il ? |
|---|---|---|
| `POST` sur l'adresse `/exec` | `doPost` — valide, écrit la ligne, avertit, pose le rendez-vous | **oui** |
| `GET` sur `…/exec?action=creneaux` | `doGet` — calcule les plages libres à partir de votre agenda | **non**, lecture seule |
| `GET` sur `…/exec?action=diag` | `doGet` — décrit la **forme** du classeur, pour vérifier une installation | **non**, lecture seule |
| `GET` sur `…/exec` tout court | `doGet` — témoin de vie, utilisé par `tools/verrou-env.mjs` | **non** |

**La porte `diag` sert à une seule chose** : prouver que le classeur
a bien la forme attendue — « Statut » en colonne B, la première ligne
figée, une seule règle de couleur, le format texte sur les cellules
du visiteur — sans avoir à ouvrir le classeur ni à le partager.

Elle est publique comme les autres, et elle **ne peut pas** faire
sortir une demande de client :

- elle rend la **structure** — en-têtes, largeurs, règles — qui ne
  dit rien qu'un formulaire du site ne dise déjà ;
- elle ne rend le **contenu** que des lignes portant un marqueur
  d'essai (`ZZTEST`, `@exemple.ca`…). Cette liste est **écrite en
  dur** : aucun paramètre ne la choisit, donc on ne peut pas lui
  demander autre chose.

Pour la retirer, supprimez le bloc `diagnostic()` de `Code.gs` et les
six lignes correspondantes de `doGet`.

**Testez la deuxième porte tout de suite** : collez dans votre
navigateur votre adresse suivie de `?action=creneaux`. Vous devez
voir du texte commençant par :

```json
{"success":true,"fuseau":"America/Toronto","duree":30,...
```

suivi de vos jours et de vos heures. Si vous voyez `"success":false`,
le message dit pourquoi. Si vous voyez une page HTML de connexion
Google, c'est que « Qui a accès » n'est pas `Tout le monde`.

> **Ce que cette porte ne dit JAMAIS**, même si vous la partagez :
> aucun titre d'événement, aucun invité, aucune description, aucune
> adresse. Elle rend des heures libres, rien d'autre. C'est
> volontaire — elle est publique.

---

## Étape 6 · Donner l'adresse au site

Dans un terminal, à la racine du dépôt :

```bash
cp .env.local.example .env.local
```

Ouvrez **`.env.local`** et collez l'adresse :

```
ADEXWEB_WEB_APP_URL=https://script.google.com/macros/s/VOTRE_IDENTIFIANT/exec
ADEXWEB_COURRIEL=
```

| Clé | Ce que c'est | Obligatoire |
|---|---|---|
| `ADEXWEB_WEB_APP_URL` | l'adresse `/exec` de l'étape 5 | **oui** |
| `ADEXWEB_COURRIEL` | la boîte visée par les sondes lancées avec `--envoi-reel` | non |

Puis :

```bash
node tools/config-envoi.mjs     # fabrique js/config.local.js
node tools/verrou-env.mjs       # vérifie les sept points
```

Le verrou doit rendre :

```
VERDICT : les sept tiennent. Les formulaires livrent.
```

Il vérifie, dans l'ordre : `.env.local` existe · l'adresse est bien
une `/exec` · ni `.env.local` ni `js/config.local.js` ne sont suivis
par git · **aucune adresse de déploiement ne traîne dans un fichier
suivi** · le fichier fabriqué concorde avec `.env.local` ·
`index.html` le charge **avant** `main.js` · et le service **répond
vraiment**, service Calendar avancé compris.

> `.env.local` et `js/config.local.js` sont dans le `.gitignore`.
> Ne les commitez jamais. Si le verrou dit qu'ils sont suivis :
> `git rm --cached .env.local js/config.local.js`.

---

## Étape 7 · La règle des redéploiements

**À lire avant votre première modification de `Code.gs`.**

Chaque fois que vous changez `Code.gs`, il faut redéployer pour que
le changement prenne effet. Il y a deux boutons, et **un seul est le
bon** :

| Ce que vous cliquez | Ce qui arrive |
|---|---|
| `Déployer` → `Gérer les déploiements` → **crayon** → Version : **`Nouvelle version`** → `Déployer` | ✅ **l'adresse reste la même.** Le site continue de fonctionner. |
| `Déployer` → `Nouveau déploiement` | ❌ **une NOUVELLE adresse est créée.** L'ancienne continue de répondre avec l'ANCIEN code. Le site parle à un script figé — et rien ne le signale : les formulaires affichent « Reçu », le classeur se remplit, mais votre correction n'est jamais appliquée. |

La seconde panne est particulièrement méchante parce qu'elle **ne
ressemble pas à une panne**. Si un jour un correctif « ne fait rien »,
c'est la première chose à vérifier.

Si vous avez créé un nouveau déploiement par erreur : reprenez
l'étape 6 avec la nouvelle adresse, et supprimez l'ancien
déploiement (`Gérer les déploiements` → ⋮ → `Archiver`).

### Le geste, en cinq temps

1. Ouvrez l'éditeur Apps Script du compte de l'agence.
2. **`Déployer`** → **`Gérer les déploiements`**.
3. Le **crayon** (modifier) sur le déploiement existant.
4. Version : **`Nouvelle version`**. Puis **`Déployer`**.
5. Refermez. **L'adresse n'a pas changé** — c'est le but.

### Quand redéployer, et quoi lancer ensuite

Redéployer met le nouveau code en ligne. Ça ne touche pas au
classeur : les colonnes, les listes déroulantes et les formats ne
bougent que si vous lancez `initialiser()` **après**.

| Ce qui a changé | Redéployer | Lancer ensuite, depuis l'éditeur | Comment vérifier |
|---|---|---|---|
| une ligne quelconque de `Code.gs` | ✅ | rien | `version` a monté (voir plus bas) |
| les colonnes d'un onglet — `SCHEMA`, `SUIVI`, `SUIVI_FIN`, `TECHNIQUES` | ✅ | **`initialiser()`** | `node tools/classeur-check.mjs` |
| le contenu d'une liste déroulante — `ASSOCIES`, `STATUTS` | ✅ | **`initialiser()`**, puis **lire le journal d'exécution** | `classeur-check`, **et** aucun « VIDÉE » au journal |
| les disponibilités — `DISPONIBILITES` | ✅ | rien | la porte des créneaux affiche les nouvelles heures |
| une version des conditions — `CONDITIONS_VERSIONS` | ✅ | rien | `?action=diag` : le champ `conditions` |
| les textes d'un courriel | ✅ | rien | `autotest()` si vous voulez en voir un |
| un fichier du **site** — `.html`, `.css`, `.js` | ❌ | rien | rechargez la page |

> **Le seul cas qui demande de LIRE quelque chose est celui des
> listes déroulantes.** Changer le contenu d'une liste ne réécrit
> aucune cellule déjà remplie : Sheets garde l'ancienne valeur et la
> marque invalide, et la ligne ne casse qu'à la prochaine fusion,
> des semaines plus tard. `initialiser()` répare ces cellules et
> **écrit au journal chaque cellule touchée**. Tant que ce journal
> n'a pas été lu, le changement est posé, pas fait. (Décision D-778.)

### Lire le journal d'exécution

Dans l'éditeur : **`Exécutions`** dans la colonne de gauche, puis la
ligne `initialiser` la plus récente. Le détail s'ouvre dessous.

- Une ligne `« Onglet » B7 (Lu par) : « Alan » → « Allen »` dit
  qu'une cellule a été **corrigée** — rien à faire.
- Une ligne qui finit par **`VIDÉE`** dit qu'une valeur ne figurait
  dans aucune liste et qu'elle a été **effacée**. La cellule est
  nommée : allez la remettre à la main.

### Comment savoir que le déploiement a vraiment pris

Le service annonce son propre numéro de version. Depuis le dépôt :

```
node tools/classeur-check.mjs
```

La première ligne dit `VERSION DEPLOYEE : n (minimum exige : m)`. Si
`n` est plus petit que `m`, **l'outil s'arrête au lieu de rendre un
verdict** : un classeur jugé « sain » par un code trop vieux est
exactement le mensonge qu'on cherche à rendre impossible.

Le numéro vit dans `Code.gs`, dans la réponse de `doGet`. Il est levé
à la main à chaque changement qui doit être vu de l'extérieur. Si vous
redéployez et que le numéro ne monte pas, ce n'est pas le déploiement
qui a raté : c'est que personne ne l'a levé.

### Les deux fonctions d'essai

| Fonction | Ce qu'elle fait | Ce qu'elle coûte |
|---|---|---|
| `autotest()` | écrit une demande d'essai dans les sept onglets, sans réseau | rien — **aucun courriel, aucun rendez-vous** |
| `nettoyerAutotest()` | efface les lignes d'essai qu'elle a écrites | rien |

Lancez la première après un changement de colonnes, la seconde tout de
suite après. Les lignes d'essai portent `essai@exemple.ca` : elles se
reconnaissent à l'œil dans le classeur.

---

## Étape 7bis · Vos disponibilités

**Il y a deux couches, et elles ne se mélangent pas.** C'est la seule
chose à comprendre de toute cette section.

| | Où ça vit | Ce que ça dit | Quand on y touche |
|---|---|---|---|
| **1 · La grille** | `google/Code.gs`, tout en haut, bloc `DISPONIBILITES` | quand vous travaillez **en général** | rarement — un changement d'horaire |
| **2 · Les exceptions** | **Google Agenda**, rien d'autre | ce qui est pris **cette semaine-là** | tous les jours, depuis le téléphone |

Le site affiche : **la grille, moins l'agenda.**

### La grille — les huit valeurs de `Code.gs`

Ouvrez `google/Code.gs`. Le bloc est le **premier** du fichier, avant
tout le reste, et chaque ligne porte son explication. Vous n'avez
jamais besoin de descendre plus bas.

| Variable | Livrée à | Ce qu'elle décide |
|---|---|---|
| `JOURS_OUVRABLES` | `[0, 1, 2, 3, 4, 5, 6]` | les jours ouverts. **0 = dimanche**, 1 = lundi … 6 = samedi. Livré **sept jours sur sept**. Revenir à la semaine : `[1,2,3,4,5]` |
| `HEURE_DEBUT` | `"09:00"` | rien ne commence avant |
| `HEURE_FIN` | `"20:00"` | rien ne **finit** après — donc rien ne démarre après 19 h 30 pour un appel de 30 min |
| `PAUSES` | `[]` | des trous tous les jours ouvrables. **Livré vide** : la journée est pleine de 9 h à 20 h. Reprendre l'heure du midi : `[{ debut: "12:00", fin: "13:00" }]` |
| `DUREE_CRENEAU_MIN` | `30` | la longueur d'un appel. **Le site annonce 30 minutes** — si vous changez ça, changez aussi le texte d'`index.html` |
| `TAMPON_MIN` | `15` | le temps entre deux appels. Il agit deux fois : il espace les créneaux (30 + 15 = un départ toutes les 45 min) **et** il élargit la zone interdite autour de chaque événement de l'agenda |
| `PREAVIS_HEURES` | `24` | personne ne réserve dans les 24 prochaines heures |
| `HORIZON_JOURS` | `42` | jusqu'où on peut réserver. 42 = six semaines |

Deux réglages de plus, qu'on touche presque jamais :

| Variable | Livrée à | Ce qu'elle décide |
|---|---|---|
| `CALENDRIER_ID` | `""` | vide = le calendrier **principal** du compte, c'est-à-dire celui d'`apedagence`. C'est ce qu'on veut : un seul calendrier, pas de gestion par associé |
| `CALENDRIERS_EN_PLUS` | `[]` | **les autres agendas qui bloquent aussi.** Voir « Bloquer depuis un autre agenda » plus bas |
| `DISPONIBLE_BLOQUE` | `true` | voir juste en dessous |

### Combien de créneaux la grille livrée donne

De 9 h à 20 h, 30 minutes d'appel plus 15 de tampon, ça fait un
départ toutes les **45 minutes**. Le dernier part à 19 h 30 pour
finir pile à 20 h.

> **9 h 00 · 9 h 45 · 10 h 30 · 11 h 15 · 12 h 00 · 12 h 45 ·
> 13 h 30 · 14 h 15 · 15 h 00 · 15 h 45 · 16 h 30 · 17 h 15 ·
> 18 h 00 · 18 h 45 · 19 h 30**

**Quinze par jour, sept jours sur sept — 105 par semaine.** L'agenda
en retire ensuite tout ce qui est déjà pris.

Deux journées ne sont jamais pleines, et c'est normal :

- **aujourd'hui et demain**, rognés par le préavis de 24 h ;
- **le dernier jour de l'horizon**, coupé au milieu par les 42 jours.

Si quinze par jour paraît trop, la façon la moins coûteuse de
resserrer est `TAMPON_MIN: 30` — un départ toutes les heures, dix par
jour — ou de rendre `HEURE_FIN` à `"17:00"`.

### Bloquer depuis un autre agenda que celui de l'agence

**Le piège, et il a mordu le 2026-08-06.** Ce script s'exécute sous
le compte de l'agence. Un blocage créé dans votre agenda
**personnel** lui est donc invisible : il ne bloque rien, et rien ne
le dit — le créneau reste offert, et quelqu'un réserve par-dessus
votre rendez-vous.

Deux façons de s'en sortir. Choisissez-en **une**.

**A · Tout bloquer dans l'agenda de l'agence.** Rien à changer dans
le code. Il faut être connecté à `apedagence` dans l'application
Agenda quand on crée le blocage. C'est le plus simple, et c'est ce
qui est livré.

**B · Faire compter votre agenda personnel aussi.** Deux gestes, une
fois pour toutes :

1. Dans **votre** agenda personnel : `Paramètres` → votre agenda →
   `Partager avec des personnes précises` → ajoutez
   `apedagence@gmail.com` → autorisation **`Afficher tous les
   détails`**. « Afficher uniquement libre/occupé » ne suffit pas.
2. Dans `Code.gs` :
   `CALENDRIERS_EN_PLUS: ["votre.adresse@gmail.com"]`, puis
   étape 7 — `Nouvelle version`.

Tout ce qui est dans **l'un ou l'autre** agenda bloque alors, avec
les mêmes règles. Vous pouvez en lister autant que vous voulez.

> **Un agenda qu'on ne sait pas lire ferme la porte.** Adresse mal
> tapée, partage oublié, partage en « libre/occupé seulement » : le
> site n'affiche **plus aucune plage** et la réservation refuse. Ce
> n'est pas un bogue — rendre « zéro occupation » voudrait dire
> « tout est libre », et c'est comme ça qu'on donne deux fois le même
> rendez-vous.
>
> **Pour savoir lequel :** lancez `initialiser` dans l'éditeur Apps
> Script et lisez le journal (`Exécutions`). Il écrit
> `Agenda lisible : …` pour chacun, et nomme le fautif.

**Après chaque changement : étape 7.** `Gérer les déploiements` →
crayon → `Nouvelle version`. Sans ça, le site continue de lire
l'ancienne grille et **rien ne le signale**.

### « Occupé » ou « Disponible » — lequel bloque

Dans Google Agenda, chaque événement porte une visibilité
d'occupation. On la trouve en ouvrant l'événement → `Plus d'options`
→ le menu déroulant qui dit `Occupé` ou `Disponible`.

**La règle livrée : les deux bloquent.** `DISPONIBLE_BLOQUE: true`.

C'est un choix, et voici pourquoi c'est celui-là. La règle devient
*« ce qui est dans mon agenda n'est pas réservable »*, sans exception
à retenir. C'est la seule règle qu'on puisse appliquer de tête, à
7 h du matin, sur un téléphone, sans se demander si on a mis le bon
menu déroulant. L'autre règle — « Disponible n'empêche rien » — est
plus fine et elle donne un rendez-vous double le jour où on l'oublie.

Pour l'inverser : `DISPONIBLE_BLOQUE: false` dans `Code.gs`, puis
étape 7. Un événement marqué « Disponible » laissera alors le créneau
ouvert, ce qui permet de se servir de l'agenda comme d'un carnet de
notes.

> **Attention :** le repli ne sait pas lire cette marque. Si le
> service avancé Calendar n'est pas activé (étape 2), le script
> retombe sur le service ordinaire, qui n'expose pas la visibilité —
> et **tout bloque**, quel que soit ce réglage.

**Une invitation que vous avez refusée ne bloque pas**, et ça ne se
règle pas. Un rendez-vous auquel vous avez répondu « non » n'est pas
un engagement : il reste affiché, barré, dans l'agenda, et le compter
volerait des heures réellement libres. Même chose pour une occurrence
supprimée d'un événement récurrent.

### Bloquer une journée ou une plage horaire

**Trois lignes, depuis le téléphone, sans rien installer.**

1. Ouvrez l'application **Google Agenda**, sur le compte dont
   l'agenda compte — `apedagence@gmail.com`, ou le vôtre si vous
   avez fait le montage **B** ci-dessus — et appuyez sur le **`+`**.
2. **Toute une journée** → activez `Toute la journée`, mettez la date,
   enregistrez. **Quelques heures** → laissez `Toute la journée`
   éteint et mettez l'heure de début et de fin.
3. C'est fini. Le site cesse d'offrir ces heures **dès la requête
   suivante** — pas de cache, pas de délai, pas de redéploiement.

**Le geste 1 est celui qui se rate.** Créer le blocage dans le
mauvais agenda ne donne aucune erreur : ça a l'air d'avoir marché, et
le créneau reste offert. Si un blocage ne fait rien, c'est presque
toujours ça — pas un bogue.

**Mesuré le 2026-08-06 contre le vrai service :** une plage prise a
disparu de la porte des créneaux **dès l'appel suivant**, 1,8 s après
— et ces 1,8 s sont le temps de la requête elle-même, pas un délai
d'attente. `creneauxLibres()` relit l'agenda à chaque appel : il n'y
a aucun cache côté serveur. Côté site, une réponse déjà chargée vaut
45 secondes, et elle est jetée immédiatement dès qu'une réservation
est refusée.

Le titre n'a aucune importance et **n'est jamais montré au
visiteur** : le site ne reçoit que des heures.

| Ce que vous créez dans l'agenda | Ce que le visiteur voit |
|---|---|
| Événement `Toute la journée` sur le mardi 11 | le 11 est **grisé** dans le calendrier, on ne peut pas cliquer dessus |
| Événement de 14 h à 16 h le mardi 11 | le 11 reste cliquable ; les créneaux de 13 h 30 à 16 h 30 disparaissent (le tampon de 15 min mord un peu au-delà) |
| Un rendez-vous pris par un visiteur | son créneau disparaît **tout seul** pour le suivant — c'est devenu un événement comme un autre |
| Une invitation que vous avez refusée | **rien ne change**, le créneau reste offert |

**Pour rouvrir** : supprimez l'événement. Les créneaux reviennent
aussitôt.

### Deux personnes qui visent la même plage

C'est le risque réel, et il ne se règle pas à l'affichage. Entre le
moment où quelqu'un **voit** la liste et celui où il **confirme**, il
remplit un formulaire — une minute, parfois cinq. Une autre personne
a pu prendre la place ; vous avez pu bloquer l'après-midi depuis
votre téléphone.

Le script **revérifie au moment d'enregistrer**, avec exactement les
mêmes fonctions que celles qui ont produit la liste. Si la plage
vient d'être prise, le visiteur lit *« Cette plage vient d'être
prise. Choisissez-en une autre. »*, revient au calendrier — et **tout
ce qu'il avait déjà rempli est encore là**. Rien n'est écrit au
classeur, aucun courriel ne part, aucun événement n'est créé.

Et si le calendrier est illisible à cet instant précis, le script
**refuse** au lieu d'accepter en aveugle : *« Impossible de vérifier
les disponibilités à l'instant. »* Mieux vaut une réservation à
reprendre qu'un rendez-vous que vous découvrez en double.

---

## Étape 8 · Le test de bout en bout

### 8.1 · Sans toucher à Google

Le dépôt sait exécuter le vrai `Code.gs` sous Node, avec des services
Google en mémoire. Ça prouve l'aiguillage, la validation, le
dédoublonnage, la construction des lignes et le honeypot — sans
consommer un seul envoi.

```bash
node tools/serve.mjs 8099          # le site
node tools/faux-google.mjs 8098    # le vrai Code.gs, services bouchonnés

node tools/formulaires-prod.mjs 8099 8098   # les 8 flux d'envoi
node tools/creneaux-check.mjs               # le calcul des créneaux
node tools/creneaux-vue.mjs 8099 8098       # ce que l'écran en montre
```

| Outil | Attendu |
|---|---|
| `formulaires-prod` | `FORMULAIRES QUI LIVRENT : 8 / 8`, `erreurs console : 0` |
| `creneaux-check` | `LES CRENEAUX TIENNENT : 41 / 41` |
| `creneaux-vue` | `L'ECRAN DIT LA VERITE DE L'AGENDA : 17 / 17` + quatre images dans `tools/_creneaux/` |

`creneaux-check` pose lui-même les cas que cette page promet — une
journée entière bloquée, un événement de 14 h à 16 h, un rendez-vous
fraîchement pris, un « Disponible », une invitation refusée — et
imprime la liste des heures **avant** et **après** chaque blocage.
`creneaux-vue` refait les trois premiers **depuis le site**, dans un
vrai navigateur, et photographie le panneau : `tools/_creneaux/`.

Les deux traversent aussi les **changements d'heure** : 9 h à Toronto
tombe à 13 h UTC l'été et 14 h UTC l'hiver, et les deux dimanches de
bascule sont vérifiés nommément.

### 8.2 · Contre le vrai Google

Une soumission par formulaire, depuis le site servi en local (le
service est déjà branché par l'étape 6) :

| Formulaire | Où vérifier | Ce que vous devez voir |
|---|---|---|
| Contact simple | onglet **Contact simple** | ligne **2**, horodatée, Statut « Nouveau » |
| Urgence | onglet **Urgence** | idem · l'avis a `[ADEXWEB] URGENCE` en objet |
| Référer | onglet **Référer une entreprise** | les colonnes « Référent » et « Entreprise référée » distinctes |
| Estimation | onglet **Estimation rapide** | les six réponses en toutes lettres |
| Projet | onglet **Démarrer un projet** | « Besoins » liste les cases cochées, séparées par des virgules |
| Projet **avec un fichier** | Drive → dossier `ADEXWEB — pièces jointes des formulaires` | le fichier y est, et la colonne « Pièces jointes » porte son lien |
| Lead magnet | onglet **Lead magnet** | les deux PDF se sont téléchargés **et** la ligne existe |
| **Réservation · Google Meet** | voir ci-dessous | ⬇ |
| **Réservation · Téléphone** | onglet **Réserver un appel** | Mode = « Appel téléphonique », colonne « Lien Meet » **vide** |

**La réservation en Google Meet, en détail** — c'est le seul flux qui
touche quatre endroits à la fois. **Faites-le en entier au moins une
fois** : c'est le test qui vaut tous les autres.

1. **Le classeur**, onglet « Réserver un appel » : Mode = `Google
   Meet`, « Début » horodaté, **« Lien Meet » rempli**, « Événement »
   pointe sur l'agenda, et les quatre colonnes de suivi — « Lu par »,
   « Rappelé par », « Statut », « Notes internes » — sont à la fin
2. **<https://calendar.google.com>** : l'événement est là, **à la
   bonne heure**, intitulé `▸ Meet · <nom>` — ou `☎ Appeler <nom>` si
   la personne a choisi le téléphone —, avec un bouton
   **Rejoindre avec Google Meet**
3. **La boîte `apedagence@gmail.com`** : l'avis interne. Son objet
   porte la **plage du rendez-vous**, pas l'heure de la demande :
   `[ADEXWEB] Demande de rendez-vous · Nom · lundi 10 août 2026 à 9 h 00`
4. **La boîte du visiteur** (mettez la vôtre pour l'essai) : *deux*
   messages — l'invitation envoyée par **Google** (avec le lien) et
   la confirmation envoyée par **le script**, objet `C'est réservé —
   lundi 10 août 2026 à 9 h 00`, avec le lien Meet **en clair** dans
   le corps

**Puis, immédiatement : rouvrez le site et regardez le calendrier.**
Le créneau que vous venez de prendre ne doit plus être offert. C'est
la preuve que la boucle est fermée. *(Mesuré le 2026-08-06 : parti
dès l'appel suivant.)*

### 8.2bis · Le test d'injection — trois minutes, et il compte

Sheets ne range pas toujours ce qu'on lui donne : une valeur qui
commence par `=`, `+`, `-` ou `@` devient une **formule**, et elle
s'exécute à l'ouverture du classeur, **sous le compte de l'agence**.
Il n'y a aucune faille à exploiter — il suffit d'un champ de texte.

Le script pose le format **texte** sur les colonnes du visiteur
*avant* d'écrire. Voici comment vérifier que ça tient :

1. Envoyez un message de contact dont le texte est exactement `=1+1`.
2. Recommencez avec `=IMPORTXML("https://exemple.ca/x","//a")`.
3. Ouvrez le classeur, onglet **Contact simple**, colonne
   « Message ».

| Ce que vous voyez | Verdict |
|---|---|
| `=1+1` **écrit tel quel** | ✅ le format tient |
| `2` | ❌ la faille est ouverte — Sheets a calculé |
| `#N/A`, `Chargement…`, ou une valeur qui apparaît | ❌ `IMPORTXML` s'exécute |

**Sans ouvrir le classeur**, la porte `diag` rend le même verdict :
`…/exec?action=diag`, puis cherchez l'onglet « Contact simple » et
la ligne d'essai. Le champ `formule` de la cellule « Message » doit
être **vide** — s'il porte quelque chose, Sheets a calculé.

> **Refuser les `=` aurait été le mauvais correctif.** Une entreprise
> peut s'appeler « +Design », un budget s'écrire « -de 5 k ». On
> range du texte comme du texte ; on ne rejette pas le client.

> **L'heure doit être la même aux quatre endroits.** Si l'écran dit
> 9 h et l'agenda 10 h, arrêtez tout et signalez-le : c'est un défaut
> de fuseau, et un appel manqué à chaque réservation. Le script
> calcule tout à `America/Toronto` et envoie au site des heures
> **déjà écrites** — le navigateur n'en reformate aucune.

### 8.3 · Les refus, qui comptent autant

| Essai | Attendu |
|---|---|
| Réserver une plage **déjà prise** | « Cette plage vient d'être prise. Choisissez-en une autre. » puis retour au calendrier, **sans perdre ce qui était rempli** |
| Réserver à **moins de 24 h** | « Cette plage demande au moins 24 h d'avance. » |
| Bloquer une journée dans l'agenda, puis rouvrir le site | le jour est **grisé** |
| Bloquer 14 h–16 h, puis rouvrir | le jour reste ouvert, les créneaux de l'après-midi sont partis |
| Téléphone = **`12`** | « Le numéro de téléphone est incomplet. » |
| Courriel = **`pas-une-adresse`** | « L'adresse courriel n'est pas valide. » |

### 8.4 · Les courriels, un par formulaire

Chaque formulaire répond avec son propre texte. Un gabarit unique
pour sept demandes, c'est six réponses à côté.

| Formulaire | Objet du courriel au visiteur |
|---|---|
| Démarrer un projet | On a votre projet |
| Estimation rapide | Votre estimation est en préparation |
| Urgence | Votre urgence est reçue — vous passez devant |
| Référer une entreprise | Merci pour la référence |
| Contact simple | On a bien reçu votre message |
| Réserver un appel | C'est réservé — *(la date et l'heure)* |
| Lead magnet | **aucun** — les guides sont déjà téléchargés, et un envoi de plus est un destinataire de moins au quota |

Les délais annoncés dans ces courriels sont **ceux du site**, au mot
près : « moins de 12 h ouvrables ». Si vous changez la promesse sur
la page, changez-la dans `texteVisiteur()` de `Code.gs` — sinon le
courriel fait mentir la page.

### 8.5 · Nettoyer

**Deux fonctions, à lancer depuis l'éditeur**, dans cet ordre :

| Fonction | Ce qu'elle retire |
|---|---|
| **`nettoyerAutotest`** | toute ligne portant `essai@exemple.ca`, `zztest@exemple.ca`, `ZZTEST` ou `exemple.ca` — dans les sept onglets. Elle journalise chaque onglet et chaque compte |
| **`nettoyerRendezVousEssai`** | les événements du calendrier dont le titre commence par `☎ Appeler `, `▸ Meet · ` — ou par l'ancien `Appel APED `, gardé pour les rendez-vous posés avant le 2026-08-06 — **et** qui portent un marqueur d'essai |

> **Les deux, pas une.** Tant qu'un faux rendez-vous est dans
> l'agenda, il **bloque son créneau** sur le site — c'est exactement
> le comportement voulu, et exactement ce dont vous ne voulez pas
> pour un essai. Un classeur nettoyé avec un agenda qui ne l'est pas
> donne un calendrier public plein de trous inexplicables.

`nettoyerRendezVousEssai` ne touche **jamais** un événement
personnel : il exige que le titre commence par un des préfixes que
seul le site écrit (`PREFIXE_TEL`, `PREFIXE_MEET` dans `Code.gs`).

---

## Étape 9 · Le quota d'envoi — 100 par jour

Un compte Google **gratuit** peut écrire à **100 destinataires par
jour**. Ce n'est pas 100 courriels : c'est 100 **destinataires**,
tous envois confondus, et `MailApp` et `GmailApp` puisent dans la
même réserve. Le compteur se libère **24 h après le premier envoi**,
pas à minuit.

**Ce que consomme une soumission :**

| Formulaire | Destinataires |
|---|---|
| Contact · Urgence · Projet · Référence · **Estimation** | **2** (l'avis interne + la confirmation au visiteur) |
| Réservation | **2** (l'invitation Google Calendar au visiteur **ne compte pas** — c'est Google qui l'envoie, pas le script) |
| Lead magnet | **1** (les guides sont déjà téléchargés ; aucune confirmation à envoyer) |

Soit environ **50 demandes par jour** au pire. Très au-dessus du
trafic actuel du site.

> **L'estimation est passée de 1 à 2** le 2026-08-06 : elle envoie
> maintenant sa propre confirmation. Le plafond passe de ~55 à ~50
> demandes par jour. C'est assumé — une personne qui remplit six
> questions et ne reçoit rien croit que ça n'a pas marché.

> **Pourquoi une seule adresse d'avis.** Avertir William, Allen et Eli
> séparément coûterait 3 destinataires par demande au lieu d'un, et
> ramènerait la capacité à ~25 demandes/jour. Les trois consultent
> `apedagence@gmail.com`.

**Voir ce qu'il reste :** dans l'éditeur, exécutez `autotest` — la
dernière ligne du journal donne le quota restant. L'avis interne
prévient aussi de lui-même sous 15 envois restants.

**Si le quota tombe à zéro :**

- ✅ **le classeur continue de se remplir** — rien n'est perdu
- ✅ les rendez-vous continuent d'être créés au calendrier
- ✅ l'invitation Google au visiteur part quand même
- ❌ l'avis interne et la confirmation ne partent plus
- ❌ **personne n'est prévenu** — d'où l'importance de regarder le
  classeur, pas seulement la boîte

Le script ne lève pas : il note dans le journal d'exécution
(`Exécutions` dans la colonne de gauche) et laisse tout le reste
fonctionner.

---

## Dépannage

| Symptôme | Cause la plus probable |
|---|---|
| Tous les formulaires disent « L'envoi n'a pas passé » | `js/config.local.js` absent ou vide → `node tools/config-envoi.mjs` |
| Le verrou dit « injoignable » | l'adresse est en `/dev`, ou le déploiement a été archivé |
| Ça marche pour vous, pas pour les autres | « Qui a accès » n'est pas `Tout le monde` (étape 5) |
| Un correctif de `Code.gs` « ne fait rien » | vous avez cliqué « Nouveau déploiement » (étape 7) |
| Réservation Meet sans lien | service avancé Calendar absent (étape 2) puis redéploiement oublié |
| « Formulaire inconnu » | le champ `_form` n'arrive pas — vérifiez que `js/main.js` n'a pas été modifié |
| Les avis n'arrivent plus, le classeur se remplit | quota des 100 atteint (étape 9) |
| **Le calendrier dit « L'agenda ne répond pas »** | la porte des créneaux est injoignable. Ouvrez `…/exec?action=creneaux` dans un navigateur : la réponse dit pourquoi. Souvent « Qui a accès » ≠ `Tout le monde` (étape 5) |
| **Le site montre des plages que j'ai bloquées** | vous avez modifié `Code.gs` sans faire `Nouvelle version` (étape 7) — ou vous avez bloqué dans un **autre** calendrier que celui d'`apedagence` |
| **Aucun jour n'est cliquable** | l'agenda est plein sur tout l'horizon, ou `JOURS_OUVRABLES` est vide. La note sous les plages le dit en toutes lettres |
| **Le premier jour offert est loin** | c'est le préavis de 24 h plus les jours déjà pris. `PREAVIS_HEURES` dans `Code.gs` |
| **L'heure du site ≠ l'heure de l'agenda** | à signaler tout de suite. Vérifiez d'abord que le fuseau du **projet Apps Script** est `America/Toronto` (⚙ Paramètres du projet) — même si le code ne s'y fie pas |
| **Un blocage « Disponible » ne bloque rien** | `DISPONIBLE_BLOQUE` est à `false`, ou vous ne l'avez pas redéployé (étape 7bis) |
| **Une journée entière bloquée ne bloque rien** | l'événement est-il bien sur le calendrier d'`apedagence`, et non sur un agenda partagé ? Seul `CALENDRIER_ID` compte |

Le journal complet de chaque exécution est dans l'éditeur Apps
Script, colonne de gauche, **`Exécutions`**. Toute erreur y est, avec
sa pile d'appels.
