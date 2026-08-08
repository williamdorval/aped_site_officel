# INVENTAIRE — la plomberie fonctionnelle

Relevé le 2026-08-08 sur `6f0784c`. **Rien de ce document ne doit être perdu
par la refonte.** Ce qui y est marqué CONTRACTUEL casse le service en silence
si on le renomme.

Périmètre réel : un seul HTML servi, 9 fichiers JS, un seul fichier serveur
(`google/Code.gs`, 5 278 l.). Une seule adresse Apps Script, lue dans
`window.APED_ENVOI` (`js/config.local.js:6`, généré par `tools/config-envoi.mjs`
depuis `.env.local`, hors dépôt). Point d'entrée site : `js/main.js:37`.

---

## 0. LE FAIT QUI CHANGE TOUT

**Il n'y a PAS de paramètre `action=` pour les formulaires.** Le routage se fait
par un champ **`_form`** dans le corps JSON du POST, et la valeur de `_form`
**est** la clé du `SCHEMA` de `Code.gs`.

- Site : `sendJson(kind, data)` — `js/main.js:2311-2324` — pose `_form: kind`.
- Serveur : `doPost` lit `kind = data._form` — `Code.gs:1982` — puis
  `if (!dans(SCHEMA, kind)) return {success:false, message:"Formulaire inconnu."}`
  (`Code.gs:2014`).
- `Content-Type: text/plain;charset=utf-8` **volontairement**, pour éviter le
  préflight CORS qu'Apps Script ne sait pas traiter (`js/main.js:2282-2285`,
  expliqué `js/main.js:2183-2194`).

Les seuls `action=` existants sont en **GET** : `?action=creneaux` et `?action=diag`.

---

## 1. LES SEPT FORMULAIRES

| # | Formulaire | `_form` | Conteneur + `<form>` | Handler JS | Onglet | Courriels |
|---|---|---|---|---|---|---|
| 1 | Démarrer un projet | `project` | `#modal-project` (3504) → `#projectWizard` (3515) | `advance()` `main.js:4177-4235` | Démarrer un projet (`Code.gs:958`) | avis agence + confirmation |
| 2 | Estimation rapide | `estimate` | `#modal-estimate` (4384) → `#wizard` (4403) → `[data-form=estimate]` (4684) | `main.js:4668-4735` | Estimation rapide (`Code.gs:1008`) | avis + confirmation |
| 3 | Urgence | `urgent` | `#modal-urgent` (3882) → `[data-form=urgent]` (3923) | commun `main.js:3305-3347` | Urgence (`Code.gs:1060`) | avis (objet `URGENCE`) + confirmation |
| 4 | Référer une entreprise | `refer` | `#modal-refer` (4017) → `[data-form=refer]` (4029) | `main.js:3224-3302` | Référer une entreprise (`Code.gs:1087`) | avis + confirmation au **référent** |
| 5 | Réserver un appel | `booking` | `#modal-booking` (3372) → `[data-form=booking]` (3409) | `main.js:3787-3900` | Réserver un appel (`Code.gs:1155`) | avis + confirmation + **invitation Agenda** |
| 6 | Contact simple | `contact` | `#contact` (2917) → `[data-form=contact]` (3061) | commun `main.js:3305-3347` | Contact simple (`Code.gs:1179`) | avis + confirmation |
| 7 | Lead magnet | `cadeau` | `<dialog id="cadeau">` (3199) → `#cadeauForm` (3254) | `main.js:1289-1345` | Lead magnet (`Code.gs:1191`) | visiteur **avec les 2 PDF joints** + avis |

L'objet réel des avis internes est reconstruit serveur par `objetAvis()`
(`Code.gs:4742-4788`) : `[APED] {COMMENCÉ n/N · }{sujet} · {entreprise · personne} · {repère}`.

### 1.1 `project` — 8 écrans
Champs (`index.html:3527-3821`) : `_gotcha`, `nom`*, `entreprise`*, `ville`,
`domaine`*, `nombre_employes`*, `site_existant`*, `site_actuel`, `besoins` (×6),
`objectif`*, `ampleur`*, `niveau_design`*, `contenu`*, `fonctions`*, `budget`*,
`echeancier`*, `description`, `fichiers` (multiple, `image/*,.pdf`), `email`*,
`telephone`, `moment_contact`, `prix_reaction`, `prix_raison`.
Serveur : `requis: ["nom","entreprise","email","budget"]`, `requisPartiel: ["email"]`
(`Code.gs:965-967`). Colonnes serveur en plus : `blocage`, `connu_par`,
`fourchette_vue`, `_pieces`.
Envoi final `{_sid, _etape:7, _etapes:8, _final:true}` (`main.js:4209-4211`),
pièces jointes base64 via `sendAvecFichiers()` (`main.js:2662-2671`) avec
**repli automatique sans fichiers** si ça échoue (`main.js:4226-4234`).
Écrans 4 et 5 sautés si le seul besoin est « Je ne sais pas encore »
(`projetSauteLeBareme`, `main.js:4109-4112`).
Portes de sortie `data-porte="estimate"|"booking"` (3866, 3870) : envoient
`_parti_vers` avant de basculer (`main.js:4255-4271`).
Pièces jointes : `rangerPieces()` (`Code.gs:3256-3320`) → dossier Drive
« APED — pièces jointes des formulaires » (`Code.gs:326`), max 12 fichiers / 8 Mo
(`Code.gs:197, 211`), allow-list d'extensions (`svg` retiré, `Code.gs:225-229`),
refus des noms à caractères de contrôle (`nomSuspect`, `Code.gs:3344`).

### 1.2 `estimate` — 14 écrans balisés, 4 à 6 vus
Chaque `.step` porte `data-step` + `data-pour` (`index.html:4410-4749`) :
1 `type_de_projet` (tous) · 2/3/4/5 `ampleur` (vitrine/boutique/estimateur/logiciel) ·
6 `besoin_detail` (sansprix) · 7/8/9/10 `fonctions` (« Rien de tout ça » = `data-seul`) ·
11 `niveau_design` + `contenu`/`complexite`/`usagers` · 12 `echeancier` ·
13 `nom`/`email`/`telephone` + `taille_equipe` · 14 résultat (`E_RESULTAT = 14`).
Les réponses vivent dans l'objet `answers`, **pas dans le DOM** (`main.js:4295`),
sérialisées par `reponsesEstimateur()` (`main.js:4479-4489`). Familles
`E_FAMILLES` (4301-4306), filtrage `convient()` (4309-4315).
**La demande part AVANT que le chiffre soit affiché** (`main.js:4689-4696`).

### 1.3 `urgent` — un écran, pas de `_sid`, pas de sauvegarde progressive
`_gotcha`, `nom`*, `telephone`*, `email`*, `entreprise`, `systeme`*, `gravite`*,
`depuis_quand`*, `message`*, `impact`. Retenue armée à la première frappe
(`main.js:3322-3324`).

### 1.4 `refer` — 8 écrans
`entreprise_referee`*, `domaine`, `besoin`, `contact_reference`*, `taille`,
`votre_nom`*, `votre_email`*, `votre_telephone` (optionnel depuis D-771),
`votre_lien`*, `votre_entreprise`, `mode_paiement`, `presentation` (max 1000),
`contexte` (max 3000), `conditions_acceptees` (`value="oui"`, l. 4307),
`conditions_version` (hidden, `value="2026-08-07-b"`, l. 4312).
Le serveur **purge** les deux champs de conditions sur toute étape non finale
(`Code.gs:2234-2238`) et pose lui-même `_conditions_le` (`Code.gs:2210-2213`).

### 1.5 `booking` — 3 écrans
`_gotcha`, `mode`* (hidden, piloté par les boutons Meet / téléphone), `nom`*,
`entreprise`, `email`*, `telephone`*, `sujet`. **`plage_demandee` et `plage_iso`
sont ajoutés en JS** (`main.js:3835-3836`), pas dans le HTML.
Enregistrement intermédiaire dès que le courriel est valide, sur
`change`/`focusout` (`main.js:3809-3824`). Distinction explicite entre **conflit
d'horaire** (regex `main.js:3877-3879` → retour à l'écran 1 + rechargement) et
**panne**.

### 1.6 `contact` — un écran
`_gotcha`, `nom`*, `telephone`, `email`*, `message`*. Aucun `requisPartiel`.

### 1.7 `cadeau` — `<dialog>` natif, `showModal()`
`_gotcha`, `email`*, `telephone`*. Le JS ajoute deux constantes
(`main.js:1341-1344`) : `documents: "Automatisation (42 p.) + IA et croissance (49 p.)"`,
`origine: "Popup guides"`.
**Les PDF ne sont plus servis en statique** : joints depuis Drive par
`guidesEnPieces()` (`Code.gs:4949-4998`), dossier « APED — guides du lead magnet »
(`Code.gs:344-348`). Marque locale posée **avant** l'envoi (`main.js:1323`) :
le popup ne revient jamais, même si le courriel se perd.

### 1.8 Le huitième `_form` : `appel`
Un clic sur `a[data-appel]` envoie un `sendBeacon` `_form:"appel"` + `origine` +
`appareil` (`main.js:2567-2581`). `compterAppel()` (`Code.gs:3214-3243`) écrit
dans l'onglet « Appels au numéro », aucun courriel, plafond propre.
`origine` bornée par une liste fermée serveur (`Code.gs:3236`).

---

## 2. SAUVEGARDE PROGRESSIVE ET CAPTURE DES ABANDONS

Bloc `js/main.js:2326-2631`.

| Élément | Valeur | Emplacement |
|---|---|---|
| Session | `aped-sid-<kind>` (`localStorage`) | `main.js:2351`, `sessionDe()` 2368-2377 |
| Jeton HMAC | `aped-jeton-<kind>` | `main.js:2391-2399` |
| Brouillon | `aped-brouillon-<kind>` | `main.js:2458`, `garderBrouillon()` 2460-2476 |
| Format `_sid` | `crypto.randomUUID()` sans tirets, 32 signes ; repli 24 lettres + 8 chiffres | `fabriquerSid()` 2356-2366 |
| Contrat serveur | `/^[A-Za-z0-9_-]{8,40}$/` | `Code.gs:2632` |
| Péremption brouillon | 21 jours | `main.js:2486` |

**Aucun `action=`** : même POST que l'envoi final, avec `_sid`, `_etape`,
`_etapes` et **sans** `_final` (`enregistrerEtape()`, 2415-2433).
Anti-doublon local par empreinte JSON (2428-2430).

Déclencheurs : `project` et `refer` à chaque « Continuer » (< 7) · `estimate` à
chaque réponse unique et chaque « Continuer » · `booking` sur `change`+`focusout`
dès que `#bkEmail` est valide · **tous** sur `pagehide` et
`visibilitychange→hidden` par `sendBeacon` (2587-2600, `baliser()` 2520-2539) ·
motif de refus de prix 800 ms après la frappe + `blur` (2607-2631).

Serveur : `signature()` renvoie `"S:" + _sid` quand `_sid` est présent
(`Code.gs:2692`) → toutes les étapes retombent sur **la même ligne**.
`repererLigne()` (2816) puis `fusionnerLigne()` (2868-2963). La fenêtre de
dédoublonnage de 10 min ne s'applique **pas** aux sessions (2810-2815).
`valider()` n'exige que `requisPartiel` tant que `_final` est absent (2546-2555).

Colonnes de trace : « Étape » (`n / N` ou `✓ complète`, `libelleEtape()` 3002-3008),
« Parti vers » (vocabulaire fermé `PARCOURS_CONNUS`, 2975-2982), « Relance »,
« Horodatage ».

**Un seul avis d'abandon**, à la NAISSANCE de la ligne, préfixe `COMMENCÉ n/N`
(4781-4785). Rien entre la naissance et la fin (2421-2434).

---

## 3. POPUPS DE RÉTENTION ET RELANCE

### 3.1 Panneau « retenue » (sortie d'intention)
`js/main.js:2827-3174`, markup `index.html:4349-4381`.
Clés : `aped-retenue-vue` (avant fourchette) et `aped-retenue-apres-vue`
(après). **Plafond à vie : 2 apparitions** (`marqueRetenue()` 2865-2873).

Trois déclencheurs : (1) `mouseout` avec `relatedTarget === null && clientY <= 0`
et aucune modale ouverte (3146-3150) ; (2) fermeture d'une modale de formulaire
commencé (`closeModal()` 1721-1724, délai 460 ms) ; (3) **rien sur
`beforeunload`**, délibérément (2840-2841).

Textes `RETENUE_TEXTES` (2896-2979) : 3 zones (`tot`/`milieu`/`fin`) pour
`project`, `estimate`, `refer`, `booking` ; une seule pour `contact`, `urgent`.
`RETENUE_APRES` (2995-3008). Repli `RETENUE_REPLI` (3012-3017).
Zone : `part = etape/(total-1)`, `≤0.34 → tot`, `≥0.7 → fin` (3019-3042).
Le bouton écrit dans **la même ligne** `{_sid, _etape:1, _etapes:99, email}`
(3098-3125).

### 3.2 Popup lead magnet
`js/main.js:1165-1453`. `localStorage["aped-guides-donnes"]` (1176-1178) ;
**`sessionStorage["aped-sans-popup"]="1"` = l'interrupteur des outils** (1182).
Minutages : `PRINCIPAL = 11 000 ms`, `PLANCHER = 4 000 ms`, `SORTIE = 20 000 ms`.
Cinq déclencheurs : 11 s après chargement · curseur ROI bougé (+2,2 s) ·
clic `[data-tour-start]` (+6 s) · `#realisations` atteint (IO, `rootMargin: -30%`) ·
dernier recours à 20 s (`mouseleave` par le haut, pointeur fin).
**Report jamais annulation** si `occupe()` : focus dans un champ, action < 2 s,
`.modal` ouverte, menu ouvert (1197-1205), jusqu'à 10 reprises.

### 3.3 Relance par courriel (serveur)
`Code.gs:4092-4275`. Délai 20 h · fenêtre fermée après 14 j · plafond 12 par
passe · déclencheur `relancerAbandons` toutes les 4 h · journal onglet
« Relances envoyées ».
Refus si : « Relance » déjà remplie, « Parti vers » remplie, étape `✓`, courriel
absent/invalide, hors fenêtre, signature ne commençant pas par `S:` (4212-4224).
**Arrêt total si la propriété de script `SITE_URL` est absente** (4164-4170).
**On écrit la date AVANT d'envoyer** (4236-4237), pour ne jamais envoyer deux fois.
4 gabarits (`project`, `estimate`, `refer`, `booking`) — rien pour `contact`,
`urgent`, `cadeau`.
Lien de reprise : `<SITE_URL>/?reprendre=<kind>&s=<sid>&e=<n>` (4106-4112).
Consommation site : `reprendreParcours()` `main.js:5479-5613` — repose le `_sid`,
nettoie l'URL par `history.replaceState`, rejoue le brouillon, ouvre la modale et
saute à l'étape après `setTimeout(…, 1400)`. **La plage n'est jamais reprise**
pour `booking` (5555-5558).

---

## 4. L'ESTIMATEUR

**Aucun barème dans le navigateur** — retiré le 2026-08-07 (D-774,
`main.js:82-97`). Le site envoie des réponses, lit `reponse.fourchette`.

La grille vit dans `google/Code.gs` et nulle part ailleurs :
`ESTIM_ECHELLE` 11 crans 2 500 → 42 000 (476-477) · `ESTIM_PLAFOND` 42 000 (481) ·
`ESTIM_LOT` `[1,1,0.95,0.90,0.86,0.83,0.81,0.80]` (484) · `ESTIM_TYPES` (487-492) ·
`ESTIM_SANS_PRIX` 4 catégories + 3 raisons (498-515) · `ESTIM_GRILLE` (520-601) ·
`ESTIM_ECHEANCE` ×1,20 si « Dans le mois » (607-610) · `ESTIM_TAILLE` ×1,05 / ×1,12
(611-613) · tables de traduction de l'assistant projet (781-828).

Fonctions : `estimTotal()` 678-719 (**refuse plutôt que de deviner → `null`**) ·
`estimFourchette()` 721-729 · `estimAllege()` 743-771 · `estimDeProjet()` 843-900 ·
**`estimerPour(kind, data)` 908-939** (seule porte de sortie).

Ce qui revient (`poserFourchette()`, 2176-2183), champ `fourchette`, **trois
formes exclusives** : `{texte, petit:{texte, retire[]}}` · `{sansPrix:true, raisons[]}` ·
`{horsEchelle:true}`.
Calcul **uniquement** à `_final` ou sur un envoi portant `prix_reaction` (2264-2265).
La colonne « Fourchette vue » est **figée** (`COLONNES_FIGEES`, 414-415) ; toute
`fourchette_vue` envoyée par le client est **supprimée** (2278-2283).

Affichage : `montrerFourchette()` `main.js:161-209`, table `DEVIS` 117-134.
Réaction au prix : `brancherDevis()` 255-298, motifs `data-choice="prix_pourquoi"`
(4745-4763) ; « C'est au-dessus de mon budget » **seul** ouvre `#esPetit`.
Second envoi `_etape:99, _etapes:99` **sans** `_final` (`chargeReaction()` 214-243).

**La note budgétaire** (`div.devis-note`) est du HTML statique identique aux deux
endroits — `index.html:4770-4778` et `3782-3790` : « estimation budgétaire »,
« le prix réel peut être plus bas comme plus haut », « on confirme le projet et
le prix ensemble ». **À conserver mot pour mot** (D-784).

---

## 5. PROGRAMME DE RÉFÉRENCE

Section `#reference` (2632). Plafond « jusqu'à 5 000 $ » (2668-2672), 4 étapes
(2686-2707), tiroir `#refPanneau` piloté par `data-tiroir` (2727, handler
générique `main.js:3194-3202`).

Grille (bloc généré, `index.html:2742-2753`) : vitrine 150 $ · outil d'estimation
250 $ · automatisation/IA 400 $ · boutique 600 $ · logiciel 1 200 $ · plateforme
complète 2 500 $ · groupe ou mandat > 1 an 5 000 $.
Règles : montant lié au **type**, pas au prix ; la case la plus élevée s'applique
une fois ; **une seule prime par entreprise référée** (article 2) ; versement
**30 jours après le paiement final**, pas à la signature.

Versions : `conditions/reference-2026-08-07.md` et `-b.md`. Liste serveur
`CONDITIONS_VERSIONS = ["2026-08-07-b","2026-08-07"]` (`Code.gs:393`), la plus
récente en tête. Champ caché du site : `index.html:4312`.
Génération : `tools/conditions.mjs` (`ecrire`/`verifier`/`afficher`), **deux**
emplacements rendus, **jamais édités à la main**.
Preuve : 3 colonnes obligatoires — `conditions_acceptees`, `_conditions_le`
(posée serveur, 2212), `conditions_version` — toutes dans `COLONNES_FIGEES`.
Refus serveur si la case n'est pas « oui » ou si la version n'est pas archivée
(2655-2663).

---

## 6. RÉSERVATION D'APPEL — AGENDA, CRÉNEAUX, MEET

Grille `DISPONIBILITES` (`Code.gs:62-164`) — **le seul bloc à modifier** :
7 j/7 · 09:00–20:00 · aucune pause · créneau 30 min · tampon 15 min (départs
toutes les 45 min) · préavis 24 h · horizon 42 j · agenda principal du compte ·
`DISPONIBLE_BLOQUE: true` · `JOURS_RENDUS_MAX: 60`.

**Lecture — `GET ?action=creneaux`.** Site : `chargerCreneaux()` `main.js:3401-3458`,
timeout **8 s** (`DELAI_CRENEAUX_MS` 2252), 2 réessais (2218-2219), fraîcheur
locale 45 s (3398). **Préchargement à l'intention** sur `pointerenter`/`focusin`/
`pointerdown` (3770-3785). **Filet** si la porte ne répond pas : grille théorique
en dur `BOOKING` (64-70) + phrase d'avertissement (`noteCreneaux()` 3583,
`direLaSource()` 3594). État `creneauxEtat` : `vierge|attente|direct|filet`.
Serveur : `doGet` 1723-1742 → cache `creneaux-v1` 90 s (283) → `creneauxLibres()`
4277-4336. Chaîne : `fenetreReservable()` 3690 → `occupations()` 3518 →
`listeCalendriers()` 3530 → `occupationsDe()` 3548 (service avancé `Calendar`,
repli `CalendarApp`) → `grilleDuJour()` 3649 → `creneauTient()` 3676.

**Écriture — `poserRendezVous(data)`** `Code.gs:4357-4525`, appelée **uniquement**
quand `!enSession || _final` (2371). Contrôles re-joués serveur : préavis,
horizon, `surLaGrille()`, `creneauTient()` sous verrou. **Un agenda illisible
refuse la réservation** (4411-4414).
Titre `PREFIXE_TEL`/`PREFIXE_MEET` + « Nom — Entreprise » (4437) · téléphone dans
`location` (4441-4444) · Meet par `conferenceData.createRequest` +
`conferenceSolutionKey:{type:"hangoutsMeet"}`, `conferenceDataVersion: 1`
(4494-4502) · les **deux modes** passent par `Calendar.Events.insert` avec
`sendUpdates:"all"` — Google envoie l'invitation, hors quota du script (4505-4512) ·
repli `CalendarApp` (4522-4531).
Retour → `extra._debut`, `extra._meet`, `extra._evenement` ; `plage_demandee`
**réécrite serveur** à l'heure de Toronto (2387-2388) ; cache vidé (2376).

**Déclencheurs** — `poserVeille()` 3993-4062 en pose trois, après avoir supprimé
les siens : `surChangementAgenda` (`onEventUpdated`, soupape 120/h) ·
`veilleBlocages` quotidien à 7 h → onglet « ⚠ Blocages sans effet », renomme les
blocages inertes avec `MARQUE_INERTE = "⚠ NE BLOQUE RIEN · "` ·
`relancerAbandons` toutes les 4 h.
Vérification externe : `declencheursPoses()` (3936-3951), exposé par `doGet` nu.

---

## 7. VISITE VIRTUELLE 360

`js/tour360.js` (474 l.), chargé en vague 2 (`index.html:4904`). Moteur Pannellum
chargé **à la demande** (`js/vendor/pannellum.js` + `css/vendor/pannellum.css`,
injectés une seule fois par `charger()` 71-89). `css/tour360.css` injecté avec
`differe.css`.
Markup : `index.html:2067` `[data-tour]`, 2077 `[data-tour-stage]`, 2087
`[data-tour-poster]`, 2098 `[data-tour-start]`, 2099 `[data-tour-label]`.
Assets `images/tour/` : `poster.webp` + 3 pièces × 2 définitions
(`terrasse|salon|chambre` en `-2k`/`-4k.webp`).
Données `PIECES` (20-46) : 3 pièces avec `yaw`/`pitch`/`hfov`, `boite` (position
sur le plan) et `liens` (passages). Plan SVG en dur (11-16), repère 240×140.
Zoom borné `HFOV_MIN 55`, `HFOV_MAX 118`.
Une seule propriété (Lythwood Lodge, KwaZulu-Natal) — voir `CREDITS.md`.

---

## 8. DÉMOS AVANT/APRÈS ET SECTEURS

**Avant/après — 4 blocs** : `#ba-garage` (966), `#ba-design` (1053),
`#ba-restaurant` (1230), `#ba-renovation` (1518).
Structure : `.ba-cadre[data-ba]` → `.ba-vitre[data-ba-vitre]` +
`.ba-piste[data-ba-piste]` → `.ba-pile` (`.ba-vue--apres` puis `--avant`) →
`.ba-trait` → `<input class="ba-poignee" type="range" data-ba-curseur>`.
Le « après » est une **pile d'images tranchées** `apres-<sujet>-t0…t6.webp` ;
deux blocs ont une bande animée `[data-ba-bande]` (1077, 1256).
Le « avant » est du **HTML reconstitué** — table `.v11`, marquee CSS, compteur de
visiteurs, badges W3C. Pas une image.

**Secteurs — 13 aperçus.** Pastilles 1846-1880 (3 groupes), chaque bouton porte
`data-sector`, `data-caption`, `data-modal-open="modal-start"`. Clés :
`restaurant`, `boutique`, `coiffure`, `gym`, `hotel`, `garage`, `construction`,
`paysagement`, `clinique`, `immobilier`, `juridique`, `photo`, `atelier`.
Maquettes dans `<template id="tplSecteurs">` (1913+), 13 `div.mock[data-mock]
[data-metier]` pointant sur `images/realisations/ecran-<clé>.webp`.
**Cloné après le premier rendu** (`main.js:4940-4944`) — le markup ne coûte rien
au premier paint. Pilotage `showSector()` (4956-4971) sur `mouseenter` **et**
`focus` ; sur tactile, rotation automatique toutes les 3 600 ms par IO.
Un `CustomEvent("aped:secteur")` est émis pour `langue.js` (4969).

**Sites de démo complets** : `demos-secteurs/`, 9 dossiers autonomes, assets dans
`images/secteurs-sites/`. Docs `STANDARD.md`, `DIRECTIONS.md`.

---

## 9. SÉCURITÉ

### 9.1 Jeton de session (signature du `_sid`) — D-786
Clé `HMAC-SHA256(sid, CLE_SESSIONS)`, propriété de script **auto-générée** à la
première demande (`cleSessions()` 2765-2773). `signerSid()` 2775-2779 → base64
web-safe sans `=`. Vérification `refusDeJeton(data, cible)` 2798-2806, **après**
`repererLigne`, **avant** toute écriture (appelée 2301).
Politique : jeton juste → écrit · pas de jeton **et** pas de ligne → première
écriture · pas de jeton **mais** ligne existante → **refus** · jeton faux →
**refus** (2781-2797). Message identique dans les deux refus, pour ne rien
apprendre à un attaquant (2805).
Renvoi : champ `jeton` dans **toutes** les réponses de session (2340, 2467),
stocké sous `aped-jeton-<kind>`. Attaché en un seul point : `sendJson()`
(`main.js:2316-2319`) et `baliser()` pour le beacon (2532-2535).

### 9.2 Honeypot
`_gotcha` dans les 7 formulaires (`index.html:3073, 3266, 3421, 3527, 3935, 4041,
4696`), sorti du cadre par CSS (`.piege`), `tabindex="-1"`, `aria-hidden`.
Rempli → `{success:true, ignore:true}` **en silence** (`Code.gs:2018-2024`).

### 9.3 Limites de débit — `tropVite()` (`Code.gs:5070-5089`, `CacheService`)

| Compteur | Clé | Plafond | Fenêtre | Effet |
|---|---|---|---|---|
| Session | `sid:<_sid>` | 40 | 1 h | refus de la requête |
| Avis | `avis` | 40 | 1 h | **la ligne s'écrit, aucun courriel ne part** |
| Lignes neuves | `lignes` | 300 | 1 h | refus dur |
| Clics `tel:` | `appels` | 200 | 1 h | on ne compte plus |
| Réveils agenda | `veille-agenda` | 120 | 1 h | cache vidé quand même |

Un compteur illisible **ne bloque personne** (5083-5088).

### 9.4 Validation serveur — `valider(kind, data)` (2532-2666)
1. Requis (`requisPartiel` en route, `requis` à `_final`)
2. `RE_COURRIEL = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/` sur `email` et `votre_email`,
   **même optionnels** (2496, 2560-2564)
3. Téléphones **≥ 10 chiffres** ; `contact_reference` jugé à partir de 7 chiffres
4. Longueurs : table `LONGUEURS` (2506-2530), défaut 2 000 ; le message **nomme
   la colonne** fautive
5. `booking` : `plage_iso` parsable + `mode ∈ {MODES.TEL, MODES.MEET}`
6. `_sid` : `/^[A-Za-z0-9_-]{8,40}$/`
7. `refer` + `_final` : `conditions_acceptees === "oui"` et version archivée

Miroir client `validate(scope)` (`main.js:2070-2143`) : juge aussi les champs
facultatifs **remplis** et les `maxlength`.

### 9.5 Autres surfaces
- **Injection de formules Sheets** : `texteInerte(v)` (3091-3106) préfixe `'`
  devant toute chaîne commençant par `=`, `+`, `-`, `@`. **`setNumberFormat("@")`
  ne protège pas** — mesuré (3061-3089). À la fusion, **toute la ligne** repasse
  par `texteInerte` (2952), parce que `getValues()` rend la forme nue.
- **Prototype pollution** : `dans(objet, cle)` = `hasOwnProperty.call` (631-633),
  utilisé **partout**. `SCHEMA["constructor"]`, `ampleur:"constructor"`,
  `_parti_vers:"toString"` étaient tous exploitables.
- **Verrou** `LockService.getScriptLock().tryLock(25000)` autour de `traiter()`
  seulement — les courriels sont **hors verrou** (2044-2081).
- **Idempotence** : `chercherJumelle()` avant tout effet de bord (2349-2358),
  fenêtre 10 min, 60 lignes relues. C'est ce qui autorise les 2 réessais du site.
- **Porte de diagnostic** `?action=diag&cle=…`, fermée par `DIAG_CLE`, refuse si
  absente (1761-1779). Ne rend le contenu que des lignes marquées `MARQUEURS_ESSAI`.
- **Adresse de l'agence jamais dans le dépôt** : `Session.getEffectiveUser()
  .getEmail()` (`notifDest()` 4561-4565), surchargeable par `NOTIF_DEST`.
- **`Reply-To`** posé sur l'adresse du visiteur dans l'avis interne (4595-4597).
- **Timeouts** : envoi 25 s, créneaux 8 s, par `AbortController` (2251-2275).
- **Propriétés de script** : `CLASSEUR_ID`, `CLE_SESSIONS`, `DIAG_CLE`,
  `NOTIF_DEST`, `SITE_URL`.
- **`.env.local`** (hors dépôt) : `APED_WEB_APP_URL`, `APED_COURRIEL`, `APED_DIAG_CLE`.

---

## 10. TOUTES LES REQUÊTES VERS APPS SCRIPT

### GET

| `action=` | Fonction | Rend | Appelé par |
|---|---|---|---|
| `creneaux` | `doGet` 1726-1742 → cache → `creneauxLibres()` 4277 | `{success, fuseau, duree, preavisHeures, horizonJours, total, jours[]}` | `chargerCreneaux()` `main.js:3413` |
| `diag` (+`cle=`) | `doGet` 1761-1779 → `diagnostic()` 1826-1973 | structure des 7 onglets, validations, règles, quota, blocages, lignes d'essai | `tools/*.mjs` seulement |
| *(aucun)* | `doGet` 1781-1799 | témoin de vie : `{success, service, version:20, conditions, calendrier, calendriers, fuseau, creneaux, diag, declencheurs, siteConnu}` | `tools/verrou-env.mjs` |

### POST (champ `_form`, pas d'`action=`)

| `_form` | Chemin serveur | Onglet | Courriels |
|---|---|---|---|
| `project` | `doPost` 1975 → `valider` 2532 → `traiter` 2185 → `estimerPour` 908 + `rangerPieces` 3256 → `ecrireLigne` 3140 / `fusionnerLigne` 2868 | Démarrer un projet | `avertirAgence()` 4606 + `confirmerAuVisiteur()` 5001 |
| `estimate` | idem + `estimerPour` | Estimation rapide | agence + visiteur (4871) |
| `urgent` | idem, sans estimation ni pièces | Urgence | agence (objet `URGENCE`, 4761) + visiteur (4889) |
| `refer` | idem + purge non finale 2234 + `_conditions_le` 2212 | Référer une entreprise | agence + **référent** (4907) |
| `booking` | idem + **`poserRendezVous()` 4357** + `oublierCreneaux()` 5046 | Réserver un appel | agence (avec Meet) + visiteur (4814) + **invitation Agenda** |
| `contact` | idem, mono-écran | Contact simple | agence + visiteur (4929) |
| `cadeau` | idem | Lead magnet | visiteur **avec 2 PDF joints** (4949 + `guidesEnPieces()` 4982) + avis |
| `appel` | **`compterAppel()` 3214**, court-circuite tout (2001-2006) | Appels au numéro | **aucun** |
| *inconnu* | 2014 | — | `{success:false, message:"Formulaire inconnu."}` |
| *`_gotcha` rempli* | 2022 | — | `{success:true, ignore:true}`, rien n'est écrit |

### Champs de service du corps POST

`_form` (routage) · `_subject` (informatif) · `_gotcha` (honeypot) ·
`_sid` (identité de la ligne) · `_jeton` (HMAC) · `_etape`/`_etapes` ·
`_final` (déclenche fourchette, rendez-vous, confirmation) · `_parti_vers` ·
`_fichiers` (base64).
**Serveur seulement** : `_conditions_le`, `_debut`, `_meet`, `_evenement`, `_pieces`.

### Onglets du classeur
Les 7 de `SCHEMA`, plus 3 techniques créés à la demande : « Appels au numéro »
(3212) · « ⚠ Blocages sans effet » (3802, inséré en position 0) ·
« Relances envoyées » (4092).
Colonnes communes, dans l'ordre (`colonnes()` 1289-1298) : `Vu` (case) · `Lu par` ·
`Rappelé par` · `Statut` · `Étape` · `Parti vers` · `Relance` · `Horodatage` ·
*[champs du visiteur]* · `Notes internes` · `Renvois` · `Signature` (masquée).

---

## 11. CE QUI EST CONTRACTUEL — À NE JAMAIS RENOMMER SANS TOUCHER `Code.gs`

1. **Les `name=` des inputs** — contrat explicite avec `SCHEMA[kind].champs[].champ`
   (`Code.gs:946-947`).
2. **Les VALEURS des boutons et des `<option>` de l'estimateur** — elles **sont**
   les clés de `ESTIM_GRILLE`, `ESTIM_TYPES`, `ESTIM_ECHEANCE`, `ESTIM_TAILLE`
   (`main.js:308-311` : « la valeur d'un bouton EST le libellé que la grille
   attend »). Une virgule ou une apostrophe typographique changée fait retomber
   `estimTotal()` sur `null` → **plus aucune fourchette, en silence**.
3. **Les libellés traduits de l'assistant projet** — `ESTIM_PROJET_*`
   (`Code.gs:781-828`) : même piège sur les `<option>` de `#prAmpleur`,
   `#prDesign`, `#prContenu`, `#prSize`, `#prFonctions`, `#prEcheancier`.
4. **Les sélecteurs JS en dur** : `data-form`, `data-pstep`, `data-rstep`,
   `data-bstep`, `data-step`, `data-pour`, `data-key`, `data-checks`, `data-seul`,
   `data-esuivant`, `data-choice`, `data-porte`, `data-tiroir`, `data-modal-open`,
   `data-modal-switch`, `data-modal-close`, `data-submit`, `data-label`,
   `data-sector`, `data-mock`, `data-metier`, `data-ba*`, `data-tour*`,
   `data-appel`, `data-cadeau-*`.
5. **Les ids cités** dans `DEVIS` (`main.js:117-134`), `ouvrirRetenue()` (3062-3082),
   `MODALES` de la reprise (5486-5489).
6. **Les blocs `<!-- CONDITIONS:DEBUT --> … <!-- CONDITIONS:FIN -->`** (deux
   occurrences) — `node tools/conditions.mjs ecrire`, jamais à la main.
7. Le champ caché `conditions_version` doit rester égal à `CONDITIONS_VERSIONS[0]`.
8. La note « estimation budgétaire » et la mention légale de `booking`
   (`index.html:3478`) sont des textes de véracité, pas de la décoration.
9. Le chargement en deux vagues : `config.local.js` doit rester **premier** de la
   vague 1, avant `main.js`.
10. `sessionStorage["aped-sans-popup"] = "1"` est l'interrupteur qu'utilisent
    ~85 outils pour tester sans popup.
