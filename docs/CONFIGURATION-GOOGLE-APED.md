# Brancher les formulaires du site — le guide complet

Ce document se suit **à la lettre, dans l'ordre**. Il ne suppose rien
de connu. À la fin, les sept formulaires du site écrivent dans un
Google Sheet, un avis part vers la boîte de l'agence, et une
réservation crée le rendez-vous avec son lien Google Meet.

Compter **25 à 40 minutes** la première fois.

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
index.html                        ┌─ Google Sheet « APED — demandes du site »
  └ js/main.js                    │    7 onglets, un par formulaire
      └ FORM_ENDPOINT ──POST──▶   ├─ Apps Script (Code.gs) en Web App
          ▲                       ├─ Gmail : l'avis interne + la confirmation
          │                       ├─ Google Calendar : le rendez-vous + le Meet
   js/config.local.js             └─ Google Drive : les pièces jointes
     (fabriqué, jamais commité)
          ▲
     .env.local
```

**Une seule pièce est à vous** : l'adresse du déploiement, qui vit
dans `.env.local`. Tout le reste se fabrique.

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
   **`APED — formulaires du site`**
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

**Sans cette étape, les réservations en visioconférence n'auront
aucun lien Meet.** Le service ordinaire crée des événements mais ne
sait pas fabriquer de conférence ; seul le service avancé le peut.

1. Dans la colonne de gauche de l'éditeur, repérez **`Services`**
   (avec un **`+`** à côté)
2. Cliquez le **`+`**
3. Dans la liste, choisissez **`Google Calendar API`**
4. Laissez la version sur **`v3`** et l'identifiant sur **`Calendar`**
   — le code appelle `Calendar.Events.insert`, donc cet identifiant
   doit rester exactement `Calendar`
5. Cliquez **`Ajouter`**

`Calendar` apparaît maintenant sous `Services` dans la colonne de
gauche. C'est la preuve que c'est fait.

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

   Sur chacun : la ligne 1 est **noire, en gras, figée**, et les trois
   dernières colonnes visibles — **Lu par**, **Rappelé par**,
   **Statut** — ont une **liste déroulante**. Cliquez une cellule de
   « Statut » pour le vérifier : *Nouveau · Contacté · En discussion ·
   Client · Fermé*.

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
   **`Paramètres avancés`** → **`Accéder à APED — formulaires du site
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
| Consulter et modifier les agendas | créer le rendez-vous, vérifier qu'une plage est libre | **non** pour les réservations |
| Consulter et gérer les fichiers Drive | ranger les pièces jointes du formulaire de projet | oui, si vous acceptez de perdre les pièces jointes |
| Voir votre adresse électronique | savoir où envoyer l'avis, **sans l'écrire dans le dépôt** | **non** |
| Se connecter à un service externe | réservé, non utilisé aujourd'hui | oui |

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

---

## Étape 6 · Donner l'adresse au site

Dans un terminal, à la racine du dépôt :

```bash
cp .env.local.example .env.local
```

Ouvrez **`.env.local`** et collez l'adresse :

```
APED_WEB_APP_URL=https://script.google.com/macros/s/VOTRE_IDENTIFIANT/exec
APED_COURRIEL=
```

| Clé | Ce que c'est | Obligatoire |
|---|---|---|
| `APED_WEB_APP_URL` | l'adresse `/exec` de l'étape 5 | **oui** |
| `APED_COURRIEL` | la boîte visée par les sondes lancées avec `--envoi-reel` | non |

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
node tools/formulaires-prod.mjs 8099 8098
```

Attendu : `FORMULAIRES QUI LIVRENT : 8 / 8` et `erreurs console : 0`.

### 8.2 · Contre le vrai Google

Une soumission par formulaire, depuis le site servi en local (le
service est déjà branché par l'étape 6) :

| Formulaire | Où vérifier | Ce que vous devez voir |
|---|---|---|
| Contact simple | onglet **Contact simple** | ligne **2**, horodatée, Statut « Nouveau » |
| Urgence | onglet **Urgence** | idem · l'avis a `[APED] URGENCE` en objet |
| Référer | onglet **Référer une entreprise** | les colonnes « Référent » et « Entreprise référée » distinctes |
| Estimation | onglet **Estimation rapide** | les six réponses en toutes lettres |
| Projet | onglet **Démarrer un projet** | « Besoins » liste les cases cochées, séparées par des virgules |
| Projet **avec un fichier** | Drive → dossier `APED — pièces jointes des formulaires` | le fichier y est, et la colonne « Pièces jointes » porte son lien |
| Lead magnet | onglet **Lead magnet** | les deux PDF se sont téléchargés **et** la ligne existe |
| **Réservation · Google Meet** | voir ci-dessous | ⬇ |
| **Réservation · Téléphone** | onglet **Réserver un appel** | Mode = « Appel téléphonique », colonne « Lien Meet » **vide** |

**La réservation en Google Meet, en détail** — c'est le seul flux qui
touche quatre endroits à la fois :

1. **Le classeur**, onglet « Réserver un appel » : Mode = `Google
   Meet`, « Début » horodaté, **« Lien Meet » rempli**, « Événement »
   pointe sur l'agenda
2. **<https://calendar.google.com>** : l'événement est là, à la bonne
   heure, intitulé `Appel APED · <nom>`, avec un bouton **Rejoindre
   avec Google Meet**
3. **La boîte `apedagence@gmail.com`** : l'avis interne, contenant le
   lien Meet
4. **La boîte du visiteur** (mettez la vôtre pour l'essai) : *deux*
   messages — l'invitation envoyée par **Google** (avec le lien) et
   la confirmation envoyée par **le script**

> **Si le point 1 dit « Lien Meet » vide alors que le mode est Google
> Meet** : le service avancé Calendar n'est pas activé. Reprenez
> l'étape 2, puis **étape 7** (Nouvelle version). L'avis interne le
> dit aussi, en toutes lettres : « ATTENTION : le lien Meet n'a pas
> pu être créé ».

### 8.3 · Les refus, qui comptent autant

| Essai | Attendu |
|---|---|
| Réserver une plage **déjà prise** | « Cette plage vient d'être prise. Choisissez-en une autre. » puis retour au calendrier |
| Réserver à **moins de 24 h** | « Cette plage demande au moins 24 h d'avance. » |
| Téléphone = **`12`** | « Le numéro de téléphone est incomplet. » |
| Courriel = **`pas-une-adresse`** | « L'adresse courriel n'est pas valide. » |

### 8.4 · Nettoyer

Les lignes d'essai portant `essai@exemple.ca` se retirent d'un coup :
dans l'éditeur, fonction **`nettoyerAutotest`** → `Exécuter`. Les
autres lignes d'essai se suppriment à la main dans le classeur, et
les événements de test dans l'agenda.

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
| Contact · Urgence · Projet · Référence | **2** (l'avis interne + la confirmation au visiteur) |
| Réservation | **2** (l'invitation Google Calendar au visiteur ne compte pas — c'est Google qui l'envoie) |
| Estimation · Lead magnet | **1** (la réponse est déjà à l'écran ; pas de confirmation) |

Soit environ **50 demandes par jour** au pire. Très au-dessus du
trafic actuel du site.

> **Pourquoi une seule adresse d'avis.** Avertir William, Alan et Elie
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

Le journal complet de chaque exécution est dans l'éditeur Apps
Script, colonne de gauche, **`Exécutions`**. Toute erreur y est, avec
sa pile d'appels.
