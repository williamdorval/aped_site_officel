# CHANTIER DES SEPT ITEMS — 2026-08-03

Point de retour : **`git reset --hard 49d3bc3`**

Huit commits, un par item plus un correctif de non-régression.
Aucun outil de `tools/` n'a été modifié.

| | Commit | Item |
|---|---|---|
| 1 | `1d4936d` | #demos — retirer l'ouverture sur les neuf écrans seuls |
| 2 | `a2f005f` | #demos — recapturer l'écran « Paysagement et déneigement » |
| 3 | `8a34dda` | #visite — retirer le fond noir, « Essayez », la mention technique |
| 4 | `3a69091` | #processus — retirer « Ce qui change avec nous » |
| 5 | `10c7f63` | #reference — refonte sobre en quatre étapes |
| 6 | `aff7f5c` | #faq — polir seulement |
| 7 | `e1dd524` | #contact — refonte complète |
| — | `6bacc7d` | correctif · CLS du montant de référence |

---

## LES SEPT PREUVES

### 1 · #demos — l'action « Ouvrir » ne survit que sur les trois vrais projets

- `01-demos-apres-1440-clair.png` — le chapô ne promet plus « neuf premiers écrans s'ouvrent »
- `01-demos-trois-1440-clair.png` — les trois seules entrées qui restent
- `01-demos-trois-1440-sombre.png` · `01-demos-trois-390-clair.png`

Neuf liens « Ouvrir » retirés. La FAQ, qui invitait encore à les
ouvrir, est corrigée dans le même commit — une correction de véracité
se fait partout en une fois.

### 2 · #demos — l'écran du paysagement était périmé

- `02-paysagement-AVANT.webp` — héros sombre, camion de déneigement, capture du 2026-08-01
- `02-paysagement-APRES.webp` — héros clair, vue aérienne de Shawinigan
- `02-paysagement-apercu-1440-clair.png` — la nouvelle capture dans l'aperçu du site

Deux salissures écartées et **vérifiées absentes** avant le
déclenchement : la bannière de témoins du site client (choix posé en
refus dans `localStorage`, donc aucune carte Google, donc aucune
requête tierce dans l'image) et le badge de développement de Next 15.

### 3 · #visite — le lecteur, et rien d'autre

- `03-visite-1440-clair-1.png` · `-2.png` — la section sur la page claire, la ligne courte
- `03-visite-1440-sombre.png` · `03-visite-390-clair.png`
- `03-cloture-intacte-1440-clair.png` — le sas de clôture, seul survivant, intact

**Le lecteur est prouvé, pas supposé** — `tools/tour-verif.mjs` ne
peut plus tourner (piège 18, défaut antérieur de l'outil) :

| Épreuve | Relevé |
|---|---|
| démarrage | `.tour.is-live` atteint |
| rotation | `03-visite-rotation-1..5.png`, écarts **77,5 · 72,2 · 73,1 · 66,5 %** de pixels changés entre deux images consécutives |
| hotspots | 1 dans la scène d'entrée, cliquable |
| passage de pièce | `03-visite-piece-avant.png` → `03-visite-piece-apres.png`, Terrasse → Salon, **96,9 %** d'écart |
| console | 0 erreur |

### 4 · #processus — le bloc est parti

- `04-processus-fin-1440-clair.png` — la section finit à l'étape 06
- `04-processus-jonction-1440-clair.png` — la jonction vers #reference, propre

### 5 · #reference — quatre étapes, sobre

- `05-reference-AVANT-1440-clair-1.png` · `-2.png` — trois temps, trois figures décoratives
- `05-reference-p1` → `p2` → `p3` — les trois passes de critique
- `05-reference-1440-clair.png` · `-sombre.png` · `390` · `320`

Trois défauts vus dans mes propres captures et corrigés : « 5000$ »
sans espaces, les quatre corps de texte en escalier, la mention légale
ferrée à droite en monospace.

### 6 · #faq — onze questions, aucune touchée

- `06-faq-AVANT-1440-clair-1.png` · `-2.png`
- `06-faq-ouvert-1440-clair.png` — deux questions ouvertes, le filet V3 tracé
- `06-faq-1440-clair.png` · `-sombre.png` · `06-faq-390-clair.png` — le `+` calé sur la première ligne

### 7 · #contact — trois niveaux, six destinations nommées

- `07-contact-AVANT-1440-clair-1..3.png` — cinq tuiles à plat, le courriel en dernier
- `07-contact-p1` · `p2` — les passes de critique
- `07-contact-1440-sombre.png` · `07-contact-390-clair.png`

Relevé au DOM, toutes épreuves passées : six entrées, six lignes de
destination **distinctes**, six flèches cohérentes, cinq modales
ouvertes au clic, six arrêts clavier avec anneau, 0 erreur console.

---

## MESURES DE NON-RÉGRESSION

| Mesure | Seuil | Relevé |
|---|---|---|
| LCP (`SPAN.plate-big`, 1440×900) | < 300 ms | **100 ms** (médiane de 5) |
| i/s médiane, traversée complète | 60 | **60** |
| images > 20 ms | 0 | **0** |
| écart de cascade, découpée vs entière | 0 | **0** sur 263 120 propriétés |
| contraste, 5 largeurs × 2 thèmes | 0 échec | **0** sur ~720 éléments par passe |
| arrêts au clavier sans anneau | 0 | **0** sur 41 positions |
| débordement horizontal, 320 → 1920 | aucun | **aucun** |
| erreurs console | 0 | **0** |
| prix non autorisés | 0 | **0** |
| CLS | 0 | **0,0019** — voir réserve |

`critique.css` passe de 53 à 49 Ko sur le chemin critique.

---

## RÉSERVES

### R1 · Les trois vrais projets n'ont aucune adresse publique

L'item 1 demandait de garder l'action « ouvrir ou visiter » sur les
trois métiers qui ont un site complet. **Aucun des trois n'est
publié** : `demo-carroserie`, `restau` et `MV-deneigement` sont des
projets locaux, et le dépôt ne contient aucune URL vers eux. Je ne
pouvais pas écrire un lien qui ne mène nulle part.

L'action pointe donc vers leur avant/après, dans la section
Démonstrations — la seule destination réelle que le site contrôle.
**Donnez-moi les trois adresses et je les branche.**

### R2 · L'étape 04 de la référence n'est pas un pourcentage

Le libellé demandé était « Vous touchez votre pourcentage ». La grille
publiée dans le formulaire verse un **montant fixe par tranche** :
500 · 700 · 1 500 · 3 000 · 4 000 · 5 000 $ selon la valeur du
contrat. Écrire « pourcentage » aurait été faux. J'ai écrit « Vous
êtes payé ». Si le programme a changé, les deux endroits se corrigent
ensemble.

### R3 · `tools/etats-check.mjs` rend un échec antérieur au chantier

Il clique `.nav-cta`, qui ouvre `modal-project`, et assère sur
`#modal-start`. `git diff 49d3bc3` est **vide** sur ces deux zones :
le défaut vit dans l'outil, pas dans la page. Non corrigé — le
chantier interdit de toucher aux outils.

### R4 · Trois outils sont morts et personne ne le sait encore

`tools/forge-check.mjs`, `tools/sas-sequence.mjs`, `tools/_sas-1920.mjs`
et `tools/_sas-sombre.mjs` mesurent le sas « descente », sa forge et
le mot « Essayez. ». Ils n'ont plus de cible. `tools/sas-check.mjs`
lit le fond de `#visite` en attendant du noir. **Ils vont crier, et
ils auront tort.**

### R5 · Le CLS n'était pas à zéro avant ce chantier non plus

Relevé A/B en worktree contre `49d3bc3`, même machine : **0,0021
avant, 0,0019 après**. Les décalages restants viennent de l'odomètre
du calculateur (`I.odo-c`) et des lettres des boutons, tous
antérieurs. Le seuil du projet dit CLS = 0 ; il n'est pas tenu, et ce
chantier ne l'a pas creusé — il l'a légèrement réduit.

### R6 · `tools/contraste-min.mjs` sort en erreur, et c'est le `›` des avant/après

Un chevron de 5 px sur fond photographique, dans `#realisations`, à
1,77:1. Zone non touchée par ce chantier. L'outil lui-même note
« 63 hors calcul : fond en image ou dégradé, à mesurer à l'image ».

### R7 · La FAQ n'a pas de sortie de secours sur téléphone

`.faq-aside` — l'adresse courriel et le bouton « Poser la question de
vive voix » — est en `display: none` sous 64em (D-238, décision
antérieure). Un visiteur de téléphone dont la question n'y est pas n'a
aucune issue **depuis cette section**. Non corrigé : la consigne était
« polir seulement, ne change pas la structure ».

### R8 · Aucune mesure n'a été prise sur un appareil réel

Tout vient de Chromium sous Playwright, sur une machine de bureau
Windows, relevés « téléphone » compris. **Rien ici ne dit « vérifié
sur mobile ».**

### R9 · Le serveur 8099 n'était pas en écoute

Il devait tourner de votre côté ; `ERR_CONNECTION_REFUSED`. Je l'ai
démarré (`node tools/serve.mjs 8099`) — sans lui, aucune capture
n'était possible. Il tourne encore.

### R10 · FormSubmit n'est toujours pas activé

Les six formulaires du site n'aboutissent que par le repli `mailto:`.
C'est la raison pour laquelle le courriel est passé au deuxième niveau
de la section Contact, et non une préférence esthétique. Réserve
antérieure, inchangée.
