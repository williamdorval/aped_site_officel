# CHANTIER ADEXWEB — l'état qui survit à une session qui meurt

**Ouvert le 2026-08-08.** Retour arrière : `git reset --hard avant-adexweb`
(étiquette poussée sur `origin`, pointe sur `6f0784c`).

Lire ce fichier EN PREMIER en reprenant le chantier. Ne jamais recommencer
ce qui est marqué FAIT et commité.

---

## LES SIX ÉTAPES

| № | Étape | État |
|---|---|---|
| 0 | Inventaire + réécriture de la mémoire projet | **FAIT** — `01796ef` |
| 1 | Analyse des références, direction retenue | en cours |
| 2 | Le nom et le logo ADEXWEB partout | à faire |
| 3 | La nouvelle palette et le système de jetons | à faire |
| 4 | Le design complet, architecture multi-pages | à faire |
| 5 | La boucle trois rôles, trois tours minimum | à faire |
| — | Livrable | à faire |

---

## ÉTAPE 0 — FAIT

- Étiquette `avant-adexweb` posée sur `6f0784c` et poussée.
- Quatre inventaires écrits sur disque, chacun relu et persisté :
  `INVENTAIRE-STRUCTURE.md` · `INVENTAIRE-PLOMBERIE.md` ·
  `INVENTAIRE-ANCIENNE-IDENTITE.md` · `INVENTAIRE-OUTILLAGE.md`.
- `CLAUDE.md` réécrit : nouvelle identité, interdiction explicite du
  retour de l'ancienne, contrats de la dorsale.
- Archivé dans `archives/2026-08-08-identite-aped/` : `CLAUDE-aped.md`,
  `ANIMATIONS-aped.md`, `REFONTE-IMMERSIVE.md`, `REFONTE-CHECKLIST.md`,
  `components.json`.
- Polices candidates téléchargées, réduites, mesurées ; planche
  typographique à cinq accouplements photographiée à 1440.

---

## DÉCISIONS PRISES EN AUTONOMIE — à relire par William

| № | Décision | Pourquoi | Réversible ? |
|---|---|---|---|
| A1 | **Titres en Newsreader (serif), corps en Instrument Sans.** | Une serif dit *établi* à un patron de 55 ans ; une grotesque dit *jeune pousse techno* — exactement le reproche reçu. Les cinq accouplements sont photographiés dans `captures/typo-a*.png`, la comparaison est visible. | oui, changer deux `@font-face` |
| A2 | **Le mode sombre part.** | Le fond blanc majoritaire EST ce qui crée la confiance ; un mode sombre l'inverse. La palette imposée est une palette claire, sans équivalent sombre qui garde l'identité. Le bouton de bascule est lui-même une affordance « techno ». Et il doublait chaque contrôle de contraste (2 thèmes × 5 largeurs). **Contrepartie assumée** : un visiteur en `prefers-color-scheme: dark` verra une page claire le soir. | oui, mais coûteux |
| A3 | **Ajout d'un jeton `--text-soft` `#4F5261`, hors palette fournie.** | `--text-muted` `#6E7180` donne 4,9:1 sur pearl (AA, pas AAA) et **3,9:1 sur silk et marble — échec AA**. Il fallait un secondaire qui tienne AAA sur pearl (7,7:1) et AA-fort sur silk/marble (6,2:1). La palette fournie est conservée telle quelle ; c'est un ajout, pas une substitution. | oui |
| A4 | **Le champagne ne porte aucune information.** | `#B99B6B`, le plus foncé, plafonne à 2,65:1 sur pearl : il échoue même au 3:1 exigé d'une icône porteuse de sens. Toute icône ou bordure qui *dit quelque chose* est en `--navy`. Le champagne reste décoratif : filets, traits, détails. | non, c'est une mesure |
| A5 | **`CLAUDE.md` fait 217 lignes, pas les 200 demandées.** | Coupé trois fois. Ce qui reste est porteur : les contrats de la dorsale qui cassent en silence, les seuils, les pièges qui reviennent. Couper plus retirait des garde-fous qui coûtent de l'argent quand on les oublie. | oui, dis-le et je coupe |
| A6 | **Polices réduites par instanciation d'axes.** | Newsreader 129 → 62 Ko, son italique 143 → 33 Ko, Instrument Sans 56 → 24 Ko. Total 119 Ko contre 123 Ko pour les trois polices actuelles. **Conséquence** : `opsz` est borné à 24-72 pour les titres et `wght` à 380-560 — on ne peut plus composer un titre en Newsreader sous 24 px ni en graisse 700. | oui, relancer le script avec d'autres bornes |
| A7 | **`components.json` et le CLI `shadcn` archivés.** | Le fichier pointait vers cinq chemins inexistants (`css/styles.css`, `components/`, `js/utils`, `js/lib`, `js/hooks`) et déclarait quatre registres de composants React dans un projet sans React. Il tirait à lui seul ~290 des ~330 dossiers de `node_modules`. | oui |

---

## RÉSERVES OUVERTES SUR CE CHANTIER

1. **Aucune mesure sur appareil réel.** Tout vient de Chromium sous
   Playwright sur une machine de bureau Windows. Rien de ce chantier ne
   dira « vérifié sur mobile ».
2. **Renommer les clés de stockage `aped-*` en `adexweb-*` orpheline les
   sessions en cours** : les brouillons locaux non envoyés et les liens de
   relance déjà partis (`?reprendre=…&s=<sid>`) ne retrouveront plus leur
   ligne. Volume estimé faible (le site n'a pas de trafic public), mais ce
   n'est pas zéro.
3. **D-784 à D-788 n'ont aucune entrée de journal** — dont deux décisions
   de sécurité (jeton de session signé, porte de diagnostic fermée à clé)
   et une de fuite (les deux PDF sortis de la racine servie). Elles ne
   vivent que dans le code. À écrire avant toute archive de `decisions/`.
4. **Cinq en-têtes d'outils annoncent une commande qui n'existe pas** :
   `refs-galerie`→`_galerie`, `refs-releve`→`_ref`,
   `traversee-check`→`_traversee`, `cadeau-scene`→`_cadeau-film`,
   `frontieres-check`→`_frontieres`.
5. **`CRO-A-TESTER.md § 0` exige d'activer FormSubmit**, service abandonné
   au profit d'Apps Script. Et `.env.local.example` renvoie à deux outils
   déjà archivés.
