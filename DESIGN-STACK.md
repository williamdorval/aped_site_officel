# DESIGN-STACK

État du stack design frontend après installation, audit et tri.
Dernière mise à jour : 2026-07-25.

---

## 1. Ce qui est gardé

### Niveau 1 — CŒUR (déclenchement automatique, 5 skills)

| Skill | Source | Fonction | Quand il doit se déclencher | Poids |
|-------|--------|----------|------------------------------|-------|
| `design-taste-frontend` | Leonxlnx/taste-skill | Direction artistique anti-slop. Lit le brief, choisit une direction, refuse les patterns templatisés. | Toute création ou refonte d'UI. **Avant** d'écrire du CSS. | ~22,1k on-invoke |
| `redesign-existing-projects` | Leonxlnx/taste-skill | Audit du code existant, détection des patterns génériques, upgrade sans casser le fonctionnel. | Avant toute modification de pages déjà écrites. | ~3,8k |
| `gsap-scrolltrigger` | freshtechbro/claudedesignskills | GSAP + ScrollTrigger : timelines, pinning, scrubbing, parallax. Fonctionne en JS vanilla. | Toute animation sur ce projet. | ~197 tok always-on / ~4,5k on-invoke |
| `web-design-guidelines` | vercel-labs/agent-skills | Audit de conformité : 100+ règles a11y / perf / UX. | **Après** implémentation. | ~0,3k |
| `chrome-devtools` (plugin, 6 skills + MCP) | ChromeDevTools/chrome-devtools-mcp | Vérification live dans Chrome : traces perf, LCP, réseau, mémoire, a11y. | Avant de déclarer une tâche terminée. | ~654 tok always-on |

### Niveau 2 — SUR DEMANDE (invocation explicite, 3 skills)

| Skill | Fonction | Phrase d'invocation |
|-------|----------|---------------------|
| `ui-ux-pro-max` | Base de données : 161 palettes, 57 font pairings, 99 règles UX, 50+ styles. **Source de valeurs, pas de décision.** | « consulte ui-ux-pro-max pour la palette / le font pairing » |
| `locomotive-scroll` | Scroll inertiel, détection viewport, parallax natif. | « utilise locomotive-scroll pour le smooth scroll » |
| `full-output-enforcement` | Interdit la troncature et les placeholders sur les gros fichiers. | « applique full-output-enforcement » |

**Total actif : 8 skills.** Cible respectée.

### MCP

| Serveur | Fonction | État |
|---------|----------|------|
| `chrome-devtools` (via plugin) | Debug live, perf, LCP. Lancé avec `--autoConnect` → se branche sur le Chrome déjà ouvert (Chrome 150 détecté, ≥144 requis). | ✔ Connected |
| `shadcn` (`.mcp.json` projet) | Recherche/lecture de composants dans les registries. | ⏸ à approuver au prochain `claude` |

Registries dans `components.json`, les 4 testés et fonctionnels :

| Registry | Test |
|----------|------|
| `@magic-ui` | 6 résultats sur « marquee » ✔ |
| `@aceternity` | 78 résultats sur « card » ✔ |
| `@kokonutui` | 10 résultats sur « card » ✔ |
| `@kibo-ui` | 22 résultats sur « card » ✔ |

`@unlumen-ui` **non activé** — `UNLUMEN_LICENSE_KEY` absente de l'environnement.
Bloc prêt à coller dans `CLAUDE.md`.

---

## 2. Ce qui a été retiré, et pourquoi

19 skills désinstallés pour de vrai (`npx skills remove -g`).

### Doublons de direction artistique (6)

Ils se déclenchaient tous sur « design ma page ». Six philosophies concurrentes
sur le même mot-clé = indécision garantie.

| Retiré | Chevauche avec | Raison |
|--------|----------------|--------|
| `design-taste-frontend-v1` | `design-taste-frontend` | Version antérieure du même skill. Gardée uniquement pour compat legacy, inutile ici. |
| `gpt-taste` | `design-taste-frontend`, `gsap-scrolltrigger` | Variante optimisée pour Codex. Exige une « randomisation Python » qui n'a pas de sens dans Claude Code. Redonde GSAP. |
| `stitch-design-taste` | `design-taste-frontend` | Génère des `DESIGN.md` pour Google Stitch. Ne produit pas de code. |
| `high-end-visual-design` | `design-taste-frontend`, `minimalist-ui` | **Contradiction directe** : impose « haptic depth », ombres marquées, motion cinématique. |
| `minimalist-ui` | `high-end-visual-design` | **Contradiction directe** : bannit gradients et ombres lourdes. Deux skills opposés sur les mêmes déclencheurs. |
| `industrial-brutalist-ui` | les deux ci-dessus | Troisième esthétique incompatible (Swiss/militaire, scanlines CRT). Preset de niche. |

### Doublon Anthropic ↔ taste-skill (1, désactivé et non supprimé)

`frontend-design@claude-plugins-official` → **désactivé** (`claude plugin disable`).
Sa description (« distinctive, intentional visual design… choices that don't read
as templated defaults ») recouvre presque mot pour mot celle de
`design-taste-frontend` (« anti-slop… do not look templated »). Espace de
déclenchement identique. `design-taste-frontend` est plus prescriptif et c'était
la priorité n°1 énoncée. Désactivé et non désinstallé : réversible par
`claude plugin enable frontend-design@claude-plugins-official`.

### Génération d'images / hors code (5)

| Retiré | Raison |
|--------|--------|
| `image-to-code` | Explicitement « for Codex » dans sa propre description. Mauvais harness. |
| `imagegen-frontend-web` | Génère des références visuelles, pas du frontend. Description énorme (~700 car. always-on). |
| `imagegen-frontend-mobile` | Écrans d'app mobile. Hors sujet pour un site web. |
| `brandkit` | Planches d'identité de marque. Hors sujet frontend. |
| `claude-design-hyperframes` | Compositions vidéo MP4 via GSAP. Hors sujet. |

### Famille ckm (6)

`ckm-design`, `ckm-design-system`, `ckm-ui-styling`, `ckm-brand`,
`ckm-banner-design`, `ckm-slides` — même auteur que `ui-ux-pro-max`, dont ils
sont les satellites. `ckm-design` déclare dépendre de `ai-artist` et
`ai-multimodal`, **non installés** : références cassées. Périmètre réel = logos,
CIP, slides, bannières, visuels sociaux — pas du frontend.

### Résidus d'autres projets (2)

| Retiré | Raison |
|--------|--------|
| `veltech-debug` | Spécifique au produit « Veltick » (Stripe checkout, pricing page). Rien à voir avec ADEXWEB. Frontmatter YAML cassé, refusé au parsing par le CLI `skills`. |
| `start-voix-script` | Scripts pub TTS. Hors sujet. Frontmatter YAML cassé également. |

---

## 3. Installés mais hors périmètre sur ce projet

Gardés en global (utiles sur un futur projet React), explicitement exclus par
`CLAUDE.md` ici :

| Skill | Pourquoi exclu ici |
|-------|--------------------|
| `motion-dev-animations` | Cible React / Next / Svelte / Astro. Sa propre description dit de ne pas l'utiliser sur des sites statiques. Ce site est en JS vanilla. |
| `vercel-react-best-practices` | React/Next uniquement. Aucun React ici. |
| `lottie-animations` | Ne sert que si un JSON After Effects est réellement fourni. |

`motion-framer` (marketplace claude-design-skillstack) **n'a pas été installé** :
c'est la même bibliothèque que `motion-dev-animations`, déjà présente et plus
complète (détection de framework, validation ≥60fps, `prefers-reduced-motion`).

---

## 4. Poids en contexte (mesuré)

`/context` est une commande interactive — les chiffres ci-dessous sont mesurés
directement sur les fichiers.

| Poste | Always-on (chaque session) |
|-------|----------------------------|
| Descriptions des 57 skills locaux | ~8 930 tok |
| — dont **41 skills marketing** | **~7 130 tok (80 %)** |
| — dont design stack (8 skills) | ~980 tok |
| Plugin `chrome-devtools-mcp` (6 skills) | ~654 tok |
| Plugins `gsap` / `locomotive` / `lottie` | ~600 tok |
| **Total skills + plugins** | **~10 200 tok** |

Gain du tri : ~1 770 tok always-on supprimés, et ~76 400 tok de corps de skills
qui ne risquent plus d'être chargés à tort.

### Recommandation restante

Le vrai poids n'est plus le design stack : ce sont les **41 skills marketing**
(`coreyhaines31/marketingskills`) à ~7 130 tok always-on. Ils sont probablement
délibérés vu l'activité d'ADEXWEB, donc **non touchés**. S'il faut couper,
la commande est :

```bash
npx skills remove -g -a claude-code -s ab-test-setup ad-creative ai-seo ... -y
```

---

## 5. Problèmes MCP à traiter

| Problème | Détail | Action suggérée |
|----------|--------|-----------------|
| MCP `magic` en échec | `@21st-dev/magic` déjà installé, clé API absente/réinitialisée. Échoue à chaque démarrage de session. | `claude mcp remove magic` ou remettre une clé sur 21st.dev/mcp |
| Serveurs MCP en double | `stripe`, `supabase`, `vercel` existent en local HTTP **et** en connecteur claude.ai. Les trois locaux sont en « Needs authentication ». | Supprimer les trois locaux : `claude mcp remove stripe supabase vercel` |
| `shadcn` en attente | `.mcp.json` est en scope projet, il faut l'approuver au premier lancement. | Lancer `claude` et approuver |
| `--autoConnect` fragile | Le flag a été ajouté dans le cache du plugin (`~/.claude/plugins/cache/chrome-devtools-plugins/chrome-devtools-mcp/1.6.0/.claude-plugin/plugin.json`). Une mise à jour du plugin l'écrasera. | Rejouer l'ajout après chaque `claude plugin update chrome-devtools-mcp` |

`--autoConnect` exige aussi que le remote debugging soit activé côté Chrome
(`chrome://inspect/#remote-debugging`).
