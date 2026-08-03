# CORRECTIONS DE DESIGN — 2026-08-03

Point de retour : **`git reset --hard 0b57828`**

Sept items, sept commits. Aucun outil de `tools/` n'a été modifié.

| | Commit | Item |
|---|---|---|
| 1 | `32b38c7` | Réalisations — recapturer le « après » du déneigement |
| 2 | `358e2b2` | Processus — deux phrases + cohérence hébergement |
| 3 | `8afd8da` | FAQ — 4 supprimées, 4 réécrites, prix purgés |
| 4 | `784202a` | Contact — formulaire simple |
| 5 | `7155735` | Bug — la ligne parasite |
| 6 | `e130a72` | Pied — PDF et adresse retirés |
| 7 | `8de80dd` | Popup — refonte en lead magnet |

---

## 1 · LES SEPT PREUVES

| Item | Captures |
|---|---|
| 1 | `01-deneigement-APRES-1440-clair.png` · `01-deneigement-apres-plein-1440-clair.png` |
| 2 | `02-processus-etapes-1440-clair.png` · `02-processus-1440-clair.png` |
| 3 | `03-faq-1440-clair.png` · `03-faq-ouvert-1440-clair.png` · `03-estimateur-sans-prix-1440-clair.png` |
| 4 | `04-contact-formulaire-1440-clair.png` · `04-contact-envoi-en-cours.png` · `04-contact-echec-repli.png` |
| 5 | `05-bug-AVANT-1440-clair-1..3.png` → `05-bug-APRES-1440-clair.png` |
| 6 | `06-pied-AVANT-1440-clair-1..2.png` → `06-pied-APRES-1440-clair.png` |
| 7 | `07-popup-AVANT-1440-clair.png` → `07-popup-APRES-1440-clair.png` · `07-popup-enchainement.png` · `07-popup-deja-recupere.png` |

---

## 2 · PROPRIÉTÉ ET HÉBERGEMENT — LES HUIT AFFIRMATIONS CORRIGÉES

**Ce qui reste vrai :** le code est écrit sur mesure, il est remis, il
est transférable, rien n'est verrouillé.
**Ce qui n'est plus affirmable :** que l'hébergement ou l'adresse web
soit au nom du client.

| # | Où | Avant | Après |
|---|---|---|---|
| 1 | Socle du héros | « **Tout vous appartient** : le code, l'hébergement, l'adresse » | « **Le code est à vous** : écrit sur mesure, transférable, rien de verrouillé » |
| 2 | Fiche service 01 | « vous recevez les accès, **l'adresse web** et le code » | « vous recevez le code source et vos accès » |
| 3 | Fiche 01 · « Ce que vous recevez » | « **L'adresse web et l'hébergement**, ouverts à votre nom » | « **Le code source**, avec ses mots de passe : un autre développeur peut le reprendre » |
| 4 | Fiche 01 · « Compris » | « Mise en ligne incluse, **hébergement ouvert à votre nom** » | « Mise en ligne et hébergement inclus » |
| 5 | Fiche service 03 | « **tout** sort à votre nom » | « **votre fiche Google** reste à votre nom » |
| 6 | Processus, étape 05 | « **Les clés, le code et l'hébergement sont à vous.** » | « Votre site passe en ligne, et le code source vous est remis. » |
| 7 | Processus 05 · livraison | « **tous les accès**, et le code source » | « le code source, et vos accès » |
| 8 | Processus 05 · vignette | « **Propriétaire · vous** » sous « votre-entreprise.ca » | « **Code source · remis** » |

Corrigée puis supprimée : la réponse FAQ « Le site nous appartient à
100 % ? », qui disait « le code, l'hébergement et l'adresse web sont
à votre nom » et « vous pouvez le payer directement au fournisseur ».

**Non touchés, parce qu'ils ne parlent que du CODE :** les deux
`meta` et le sous-titre du héros (« le code est à vous »), et la
fiche service 04 (« Le code et son mode d'emploi, à votre nom : un
autre développeur reprend demain matin »).

**Vérification :** balayage du rendu, modales et `<details>` ouverts,
sur `index.html` et `404.html` → **0 affirmation** « hébergement à
votre nom ».

---

## 3 · LES ADRESSES COURRIEL

Balayage du **rendu**, modales et popup ouverts, `index.html` et
`404.html` :

- liens `mailto:` : **0**
- adresses écrites dans le texte : **0**

Les cinq emplacements retirés : menu plein écran, colonne de la FAQ,
tuile de contact, pied de page, page 404.

Restent quatre `@exemple.ca` **dans les maquettes « avant »** de
`#realisations` — ce sont les adresses d'entreprises fictives, dans
un contenu étiqueté comme démonstration.

### ⚠ UNE ADRESSE RESTE ATTEIGNABLE, ET IL FAUT LE SAVOIR

`js/main.js` — `CONTACT_EMAIL` alimente le repli `mailto:` qui
s'affiche **quand un envoi de formulaire échoue** :

> « Ouvrir mon courriel, message déjà écrit »

Comme FormSubmit n'a jamais été activé, **c'est aujourd'hui le
chemin normal, pas l'exception** : tous les formulaires y aboutissent.
Un balayage statique ne le voit pas — il n'apparaît qu'après l'échec.

**Je ne l'ai pas retiré**, et c'est une décision prise en votre
absence : le retirer aujourd'hui ferait échouer les formulaires **en
silence**, ce qui est pire qu'une adresse exposée après un échec. Il
disparaît de lui-même au prochain chantier, quand l'envoi ira vers le
Sheet. C'est la première chose à faire.

---

## 4 · LES PRIX

Relevé de **tous** les montants du rendu, modales et `<details>`
ouverts. Hors zones de démonstration, il reste :

| Montant | Où | Statut |
|---|---|---|
| **75 $** l'heure | FAQ · maintenance, FAQ · paiement | autorisé |
| **40 %** au démarrage | FAQ · paiement | autorisé |
| **5 000 $** | nav, menu, section Référence, tuile Contact, modale Référence | autorisé |
| 0 $ | « L'appel de 30 minutes ne coûte rien » | gratuité, pas un prix |
| 42 $ · ≈ 39 100 $ · 50 à 90 % | calculateur | chiffres **du visiteur**, réglés par lui |

**Deux grilles ont été retirées :**

- la **grille de commissions** du formulaire de référence publiait six
  paliers — donc, en creux, les six paliers de valeur de contrat
  d'APED, de 1 000 $ à 100 000 $ ;
- l'**estimateur** publiait une fourchette en dollars à son étape 8,
  tirée d'un barème de 2 500 $ à 40 000 $ et plus. `BAREME` et
  `computeEstimate` sont supprimés. L'étape 8 rend maintenant
  *« Site vitrine · Restauration · Simple · Urgent »* — ce qu'on a
  compris, vérifiable par le visiteur.

---

## 5 · LES CHAMPS DE CHAQUE FORMULAIRE

Base des colonnes du Sheet. **Un onglet par formulaire**, donc les
noms peuvent se répéter d'un onglet à l'autre.

| Formulaire | `data-form` / id | Champs (`name`) |
|---|---|---|
| **Contact simple** *(neuf)* | `contact` | `nom`\* · `telephone` · `email`\* · `message`\* |
| **Popup guides** *(refait)* | `#cadeauForm` | `email`\* · `telephone`\* |
| Urgence | `urgent` | `nom`\* · `telephone`\* · `email`\* · `message`\* |
| Réserver un appel | `booking` | `nom`\* · `entreprise` · `email`\* · `telephone`\* · `sujet` **+** `plage_demandee` *(posé par le JS)* |
| Référer une entreprise | `refer` | `votre_nom`\* · `votre_email`\* · `votre_telephone` · `votre_lien`\* · `entreprise_referee`\* · `domaine` · `taille` · `besoin` · `contact_reference`\* · `contexte` |
| Estimation | `estimate` | `nom`\* · `email`\* **+** `type_de_projet` · `domaine` · `envergure` · `niveau_design` · `echeancier` · `site_existant` *(posés par le JS)* |
| Démarrer un projet | `#projectWizard` | `nom`\* · `entreprise`\* · `ville` · `domaine`\* · `nombre_employes`\* · `site_existant`\* · `site_actuel` · `besoins` *(6 cases, une seule clé)* · `objectif`\* · `budget`\* · `echeancier`\* · `description` · `fichiers` · `email`\* · `telephone` · `moment_contact` |

\* = requis. Le popup ajoute `documents` et `origine`.

**Collisions à surveiller** si vous fusionnez un jour les onglets :
`domaine` existe dans trois formulaires avec trois natures (select,
texte libre, calculé) ; `echeancier` et `site_existant` dans deux ;
`email` et `nom` dans cinq.

---

## 6 · LE POINT DE BRANCHEMENT UNIQUE

```
js/main.js  ·  function sendJson(kind, data)
js/main.js  ·  function sendMultipart(kind, formData)
```

**Les sept formulaires y passent tous.** C'est le seul endroit qui
connaît `FORM_ENDPOINT`. Remplacer ces deux fonctions par un appel au
Apps Script suffit ; aucun formulaire n'a de logique d'envoi propre.

Trois fonctions voisines à connaître :
- `lireReponse(res)` — refuse un `HTTP 200` dont le corps dit
  `success: "false"`. À réécrire selon ce que renvoie le Sheet ;
- `lienRepli(kind, data)` — construit le `mailto:` de secours ;
- `SUBJECTS` — un libellé par `kind`, qui deviendra le nom de
  l'onglet.

**Ce qui n'est PAS centralisé, et qu'il faudra regarder :** cinq
handlers `submit` distincts orchestrent la navigation d'étapes et les
messages. Le transport est commun, l'orchestration non. Le formulaire
de contact et les deux autres formulaires simples partagent le même
handler — c'est le modèle à suivre.

---

## 7 · MESURES DE NON-RÉGRESSION

| Mesure | Seuil | Relevé |
|---|---|---|
| LCP (`SPAN.plate-big`, 1440×900) | < 300 ms | **128 ms** |
| CLS | 0 | **0,0020** — voir réserve |
| i/s médiane · images > 20 ms | 60 · 0 | **60** · **0** |
| écart de cascade | 0 | **0** sur 262 856 propriétés |
| contraste, 5 largeurs × 2 thèmes | 0 échec | **0** |
| arrêts au clavier sans anneau | 0 | **0** sur 41 positions |
| débordement, 320 → 1920 | aucun | **aucun** |
| erreurs console | 0 | **0** |

---

## 8 · RÉSERVES

### R1 · Le repli `mailto:` expose encore l'adresse
Voir §3. À régler en premier au prochain chantier.

### R2 · `tools/prix-check.mjs` sort en code 2
Il exige que le barème existe et refuse de rendre zéro en silence ;
le barème a disparu volontairement. Son message dit lui-même : « va
le vérifier à la main avant de me croire ». Je l'ai fait, avec une
sonde écrite hors du dépôt qui lit la page rendue. **L'outil est à
mettre à jour** — je n'y ai pas touché.

### R3 · Les deux PDF publient encore une grille de prix APED
`documents/src/aped-automatisation.html`, tableau « Le point mort » :
mise en place de **700 $ à 12 000 $** par type de mandat, abonnements
annuels, « coût an 1 » jusqu'à **16 300 $**, et « l'entretien est
valorisé à 35 $ l'heure ». Ces PDF se téléchargent depuis le popup.
**Hors des trois prix autorisés.** Je ne les ai pas régénérés : ce
sont deux documents de 42 et 49 pages dont un chapitre entier repose
sur ces chiffres. **C'est votre arbitrage.**

### R4 · Le déneigement est présenté comme une entreprise fictive
`#realisations` annonce « Quatre démonstrations, **entreprises
fictives** — pas des mandats livrés ». Le « après » du déneigement est
la capture d'un site réel : « Déneigement MV », « Shawinigan depuis
2005 », et son adresse civique **1250, avenue de la Station**, que les
masques de `demos-sites.mjs` ne couvrent pas (ils masquent téléphone,
RBQ et courriel). C'était déjà le cas avant ce chantier. Soit le
libellé est faux, soit l'adresse ne doit pas être publiée.

### R5 · Le motif de masquage RBQ est sans effet
`demos-capture.mjs` signale que `RBQ\s*:?\s*[\d-]+` n'a rien trouvé :
le site du client ne porte plus son numéro. Sans conséquence
aujourd'hui, mais un masque qui ne masque plus rien est un masque
qu'on croit actif.

### R6 · Le CLS n'est pas à zéro, et ne l'était pas avant
0,0020 aujourd'hui, contre 0,0021 relevé avant le chantier précédent.
Les décalages viennent de l'odomètre du calculateur et des lettres
des boutons. Le seuil du projet dit 0 ; il n'est pas tenu.

### R7 · Le téléphone du popup n'est pas validé
`validate()` vérifie qu'il n'est pas vide, rien de plus. Un visiteur
qui tape « 1 » passe. La validation de forme viendra avec le
doublage côté serveur du prochain chantier.

### R8 · Aucune mesure sur un appareil réel
Chromium sous Playwright, poste de bureau Windows, relevés
« téléphone » compris.

### R9 · Le serveur 8099
Il répondait au début de ce chantier. Il a été démarré par la session
précédente et tourne toujours.
