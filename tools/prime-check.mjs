/* ============================================================
   LA GRILLE DES PRIMES — `node tools/prime-check.mjs [port]`

   CE QU'IL GARDE, ET C'EST LA CONTRAINTE QUI GOUVERNE TOUT LE
   PROGRAMME.  D-773

   On paie ceux qui nous referent des clients. Le referent ne doit
   JAMAIS pouvoir deduire le prix auquel on a vendu — c'est
   l'information la plus sensible qu'on ait, et un referent qui la
   connait peut la repeter, la comparer, ou nous mettre en
   difficulte avec le client lui-meme.

   D'OU LA GRILLE PAR TYPE, ET NON PAR TRANCHE DE PRIX. « Projet de
   5 000 a 10 000 $ → 400 $ » dit au referent, le jour ou il touche
   400 $, dans quelle fourchette on a vendu. « Une automatisation →
   400 $ » ne dit rien : la meme ligne couvre 6 000 comme 15 000 $.

   CINQ CONTROLES, ET AUCUN NE SE DEDUIT DES AUTRES :
     1 · la grille de la page est EXACTEMENT celle declaree ici —
         ni une ligne de plus, ni un montant qui aurait glisse ;
     2 · aucun taux effectif ne depasse 7 %, au PLANCHER de chaque
         type, qui est le point le plus cher pour nous ;
     3 · aucune marche brutale entre deux lignes voisines ;
     4 · aucun montant de la grille ne coincide avec un montant du
         BAREME de `js/main.js` — sinon la prime pointerait le prix ;
     5 · la grille est FERMEE au chargement, et le plafond affiche
         publiquement est bien celui de la derniere ligne.

   LES FOURCHETTES DE PRIX VIVENT ICI, ET NULLE PART AILLEURS. Elles
   ne sont ni dans `index.html` ni dans `js/main.js` : cet outil ne
   part pas au navigateur. C'est ce qui permet de VERIFIER le taux
   sans le PUBLIER.

   Sorties : 0 tout tient · 1 defaut · 2 l'instrument a derive.
   ============================================================ */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { port as portDe } from "./_adresse.mjs";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, "..");
const PORT = portDe(process.argv[2]);

/* ------------------------------------------------------------
   LA GRILLE DECLAREE

   `prime` est ce que la page doit afficher.
   `plancher`, `typique` et `sommet` sont les prix reels d'un mandat
   de ce type chez APED. Le PLANCHER est le seul qui contraigne : au
   plancher, la prime pese le plus lourd en pourcentage.
   ------------------------------------------------------------ */
const PLAFOND_TAUX = 7;      /* jamais au-dessus — les vendeurs internes touchent 10 % */
const MARCHE_MAX = 2.5;      /* rapport maximal entre deux lignes voisines */

const GRILLE = [
  { type: "Un site vitrine",                                                     prime: 150,  plancher: 2500,  typique: 4000,   sommet: 6000 },
  { type: "Un outil d’estimation sur son site",                                  prime: 250,  plancher: 4000,  typique: 6000,   sommet: 10000 },
  { type: "Une automatisation ou un projet d’IA",                                prime: 400,  plancher: 6000,  typique: 9000,   sommet: 15000 },
  { type: "Une boutique en ligne",                                               prime: 600,  plancher: 9000,  typique: 12000,  sommet: 20000 },
  { type: "Un logiciel ou une application sur mesure",                           prime: 1200, plancher: 18000, typique: 30000,  sommet: 45000 },
  { type: "Une plateforme complète, plusieurs volets d’un coup",                 prime: 2500, plancher: 40000, typique: 55000,  sommet: 80000 },
  { type: "Plusieurs entreprises d’un même groupe, ou un mandat de plus d’un an", prime: 5000, plancher: 80000, typique: 120000, sommet: 0 }
];

let ko = 0, n = 0;
const dire = (ok, quoi, note) => {
  n++; if (!ok) ko++;
  console.log("  " + (ok ? "OK   " : "ECHEC") + " " + quoi + (ok || !note ? "" : "\n         " + note));
};
const titre = (t) => { console.log(""); console.log("--- " + t); };
const sous = (v) => String(v).replace(/[  \s]/g, "");

/* ------------------------------------------------------------
   L'AUTO-CONTROLE, D'ABORD

   Un outil qui rend « 0 » sans erreur ment (pieges 30 · 40 · 62).
   Celui-ci lit une grille dans la page : si son extracteur derivait,
   il en trouverait zero et conclurait « rien a signaler ». On lui
   donne donc un DOM d'essai qui contient une grille fautive — un
   taux a 12 %, une marche de 4×, un montant du bareme — et il doit
   trouver les trois. S'il n'en trouve pas trois, c'est lui qui est
   casse, et on s'arrete la.
   ------------------------------------------------------------ */
function tauxDe(l, prix) { return prix ? (l.prime / prix) * 100 : 0; }

function fautes(grille, montantsBareme) {
  const out = [];
  grille.forEach((l) => {
    const t = tauxDe(l, l.plancher);
    if (t > PLAFOND_TAUX + 1e-9) out.push("taux " + t.toFixed(1) + " % sur « " + l.type + " »");
    if (l.prime >= l.plancher && (l.sommet === 0 || l.prime <= l.sommet)) {
      out.push("la prime " + l.prime + " tombe dans la fourchette de sa propre ligne");
    }
    void montantsBareme;
  });
  for (let i = 1; i < grille.length; i++) {
    const r = grille[i].prime / grille[i - 1].prime;
    if (r > MARCHE_MAX + 1e-9) out.push("marche de " + r.toFixed(1) + "x entre « " + grille[i - 1].type + " » et « " + grille[i].type + " »");
  }
  return out;
}

{
  const faux = [
    { type: "A", prime: 300,   plancher: 2500,  typique: 3000,  sommet: 4000 },   /* 12 % au plancher */
    { type: "B", prime: 12000, plancher: 9000,  typique: 12000, sommet: 20000 }   /* marche 40x + prime DANS la fourchette */
  ];
  const trouvees = fautes(faux, [2500]);
  if (trouvees.length < 3) {
    console.error(
      "ARRET  l'instrument ne reconnait plus une grille fautive.\n"
      + "       Sur une grille d'essai qui porte un taux a 12 %, une\n"
      + "       marche de 8x et un montant du bareme, il a trouve "
      + trouvees.length + " faute(s) au lieu de 3.\n"
      + "       Repare `fautes` avant de croire le verdict.");
    process.exit(2);
  }
}

console.log("============================================================");
console.log("LA GRILLE DES PRIMES DE REFERENCE");
console.log("============================================================");

/* ------------------------------------------------------------
   4 · LES MONTANTS DU BAREME, LUS DANS `google/Code.gs`

   IL LES CHERCHAIT DANS `js/main.js` JUSQU'AU 2026-08-07.  D-779

   D-774 a sorti le bareme du navigateur : `var BAREME` n'existe
   plus nulle part, et cet outil s'ARRETAIT sur exit 2 — donc ses
   CINQ controles etaient eteints, pas seulement le quatrieme. La
   grille des primes affichee sur la page n'etait plus verifiee du
   tout, et le seul signe en etait un code de sortie que personne
   ne lisait. Un outil arrete est un outil mort ; il compte comme
   une absence de test, jamais comme un test qui passe.

   Ce que voit le visiteur n'est plus un bareme mais une
   FOURCHETTE, dont les deux bornes sont des crans
   d'`ESTIM_ECHELLE`. Ce sont donc ces montants-la, et eux seuls,
   qu'une prime pourrait pointer : meme question, posee a la source
   qui existe encore.
   ------------------------------------------------------------ */
const codeGs = fs.readFileSync(path.join(RACINE, "google", "Code.gs"), "utf8");
const bloc = /var ESTIM_ECHELLE = \[([\s\S]*?)\];/.exec(codeGs);
if (!bloc) {
  console.error("ARRET  `ESTIM_ECHELLE` introuvable dans google/Code.gs — la\n"
    + "       comparaison « aucune prime n'est un prix » ne pourrait pas se\n"
    + "       faire, et la conclure quand meme serait une invention.");
  process.exit(2);
}
const montantsBareme = (bloc[1].match(/\d+/g) || []).map(Number).filter(Boolean);
if (montantsBareme.length < 5) {
  console.error("ARRET  le bareme rend " + montantsBareme.length + " montant(s), au moins 5 attendus.");
  process.exit(2);
}

/* ------------------------------------------------------------
   LA GRILLE, TELLE QUE LA PAGE LA MONTRE
   ------------------------------------------------------------ */
const nav = await chromium.launch();
const ctx = await nav.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.addInitScript(() => {
  try { sessionStorage.setItem("aped-entree-saut", "1"); sessionStorage.setItem("aped-sans-popup", "1"); } catch (e) {}
});
await page.goto("http://127.0.0.1:" + PORT + "/", { waitUntil: "load" });
await page.waitForTimeout(1200);

const vu = await page.evaluate(() => {
  const panneau = document.getElementById("refPanneau");
  const bouton = document.getElementById("refVoir");
  const ferme = !!(panneau && panneau.hidden);
  const dit = bouton ? bouton.getAttribute("aria-expanded") : null;

  /* Ce qu'un visiteur LIT sans rien ouvrir. */
  const avant = document.body.innerText;

  if (panneau) panneau.hidden = false;
  if (bouton) bouton.setAttribute("aria-expanded", "true");

  const table = panneau ? panneau.querySelector("table.cond-grille") : null;
  const lignes = table ? [...table.querySelectorAll("tbody tr")].map((tr) => ({
    type: (tr.cells[0].textContent || "").trim(),
    prime: (tr.cells[1].textContent || "").trim()
  })) : [];

  /* Tous les montants du panneau, colonne des primes ou non : c'est
     la seule facon de voir un prix de projet qui aurait glisse dans
     une phrase. */
  const tousDuPanneau = ((panneau && panneau.innerText) || "")
    .match(/\d[\d  \s]*\$/g) || [];

  const plafond = (document.querySelector(".referral-max .num") || {}).textContent || "";
  const version = (panneau && panneau.querySelector(".cond-version b") || {}).textContent || "";

  /* LA GRILLE DU TIROIR NE DOIT PAS ETRE ROGNEE.

     LE DEFAUT QU'ON GARDE ICI. Le tiroir du formulaire a porte,
     une journee, un `max-height` avec defilement interne : la
     grille s'arretait a « une boutique en ligne, 600 $ » pendant
     que la meme fenetre annoncait « jusqu'a 5 000 $ ». Le tableau
     dementait l'accroche, et on demandait de cocher « j'ai lu ».

     UN RECTANGLE NE DIT RIEN DU ROGNAGE D'UN ANCETRE (piege 1) :
     les sept lignes ont toutes une hauteur, rognees ou non. Ce
     qui le dit, c'est de comparer le bas de la DERNIERE ligne au
     bas de chaque ancetre qui defile. */
  /* LA MODALE S'OUVRE AUSSI, ET C'EST CE QUI MANQUAIT.
     Le tiroir vit dans , qui nait  : tout
     l'arbre est alors en , et ,
      et  valent ZERO. La
     comparaison « le bas depasse-t-il ? » etait donc toujours
     fausse, et le controle rendait « ok » sur une grille rognee —
     verifie en remettant le  fautif. Piege 30 dans la
     sonde elle-meme. */
  const modale = document.getElementById("modal-refer");
  const tiroir = document.getElementById("rfCondTexte");
  let rognage = null;
  if (tiroir && modale) {
    /* TOUT CE QUI EST MASQUE ENTRE LE TIROIR ET LA PAGE S'OUVRE.

       Il en manquait deux, et le controle rendait « ok » sur une
       grille rognee — verifie en remettant le `max-height`
       fautif. La modale nait `hidden`, ET l'ecran 7 aussi : sous
       `display: none`, `scrollHeight`, `clientHeight` et
       `getBoundingClientRect` valent tous ZERO, donc « le bas
       depasse-t-il ? » etait toujours faux. Piege 30 dans la
       sonde elle-meme, et il a fallu tracer la chaine des
       ancetres pour le voir. */
    const ecran = modale.querySelector('.step[data-rstep="7"]');
    const modaleCachee = modale.hidden;
    const ecranCache = ecran ? ecran.hidden : true;
    modale.hidden = false;
    if (ecran) ecran.hidden = false;
    const etaitCache = tiroir.hidden;
    tiroir.hidden = false;
    const t = tiroir.querySelector("table.cond-grille");
    const derniere = t ? t.querySelector("tbody tr:last-child .cond-prime") : null;
    let coupe = "";
    if (derniere) {
      const r = derniere.getBoundingClientRect();
      /* ON S'ARRETE AU PANNEAU DE LA MODALE, ET C'EST LA REGLE
         JUSTE. Le panneau a le droit de defiler — c'est une
         modale, le visiteur le fait sans y penser. Ce qui est
         interdit, c'est un defilement IMBRIQUE a l'interieur :
         personne ne devine qu'un bloc au milieu d'un formulaire
         cache six lignes de plus.
         La premiere version cherchait « rien ne coupe » et
         accusait le panneau lui-meme : elle aurait force a
         retirer un defilement legitime. */
      let n = derniere.parentElement;
      while (n && n !== document.body && !coupe) {
        if (n.classList && n.classList.contains("modal-panel")) break;
        const cs = getComputedStyle(n);
        if (cs.overflowY !== "visible" && n.scrollHeight > n.clientHeight + 2) {
          const b = n.getBoundingClientRect();
          if (r.bottom > b.bottom + 1) {
            coupe = (n.id || String(n.className).split(" ")[0] || n.tagName)
              + " (bas " + Math.round(b.bottom) + " contre " + Math.round(r.bottom) + ")";
          }
        }
        n = n.parentElement;
      }
    }
    const rc = derniere ? derniere.getBoundingClientRect() : null;
    rognage = {
      hauteurNulle: !rc || rc.height < 1,
      lignes: t ? t.querySelectorAll("tbody tr").length : 0,
      derniereLue: derniere ? derniere.textContent.trim() : "",
      coupe: coupe
    };
    tiroir.hidden = etaitCache;
    if (ecran) ecran.hidden = ecranCache;
    modale.hidden = modaleCachee;
  }

  return { ferme, dit, lignes, tousDuPanneau, plafond, version, rognage,
           avantPorteUnePrime: /\b(150|250|400|600|1[  \s]?200|2[  \s]?500)[  \s]*\$/.test(avant) };
});
await nav.close();

/* ------------------------------------------------------------
   5 · FERMEE AU CHARGEMENT
   ------------------------------------------------------------ */
titre("5 · LA GRILLE NE TRAINE PAS A LA VUE DE TOUT LE MONDE");
dire(vu.ferme === true, "le panneau nait ferme");
dire(vu.dit === "false", "et le bouton le dit à la voix (`aria-expanded`)", "lu : " + vu.dit);
dire(vu.avantPorteUnePrime === false,
  "aucun montant de la grille ne se lit sans l'ouvrir",
  "le texte rendu de la page fermee en porte un");

/* ------------------------------------------------------------
   5bis · ET UNE FOIS OUVERTE, ELLE EST ENTIERE
   ------------------------------------------------------------ */
titre("5bis · LA GRILLE DU TIROIR N'EST PAS ROGNEE");
if (!vu.rognage) {
  console.error("ARRET  le tiroir `#rfCondTexte` est introuvable : le controle du\n"
    + "       rognage ne porterait sur rien et rendrait « ok » quand meme.");
  process.exit(2);
}
/* UN RECTANGLE A ZERO NE PROUVE RIEN, IL DIT QUE LA SONDE REGARDE CE
   QUI N'EST PAS PEINT. Sans cet arret, le controle du rognage a rendu
   « ok » trois fois de suite sur une grille reellement coupee. */
if (vu.rognage.hauteurNulle) {
  console.error("ARRET  la derniere ligne de la grille mesure zero : la sonde\n"
    + "       regarde un arbre encore en `display: none`. Tout ce qui\n"
    + "       suit vaudrait « ok » sans rien avoir mesure.");
  process.exit(2);
}
dire(vu.rognage.lignes === GRILLE.length,
  "le tiroir porte les " + GRILLE.length + " lignes", "lu : " + vu.rognage.lignes);
dire(sous(vu.rognage.derniereLue) === GRILLE[GRILLE.length - 1].prime + "$",
  "et la derniere se lit bien " + GRILLE[GRILLE.length - 1].prime + " $",
  "lu : « " + vu.rognage.derniereLue + " »");
dire(vu.rognage.coupe === "",
  "aucun defilement imbrique ne la coupe",
  "un `max-height` avec defilement interne a deja arrete cette grille a "
  + "600 $ pendant que la meme fenetre annoncait 5 000 $ · " + vu.rognage.coupe);

/* ------------------------------------------------------------
   1 · LA PAGE DIT EXACTEMENT LA GRILLE DECLAREE
   ------------------------------------------------------------ */
titre("1 · LA PAGE DIT EXACTEMENT CE QUI EST DECLARE ICI");
dire(vu.lignes.length === GRILLE.length,
  GRILLE.length + " lignes dans la grille de la page",
  "lu : " + vu.lignes.length);
GRILLE.forEach((l, i) => {
  const p = vu.lignes[i];
  if (!p) { dire(false, "ligne " + (i + 1) + " absente de la page"); return; }
  dire(p.type === l.type && sous(p.prime) === l.prime + "$",
    "ligne " + (i + 1) + " · " + l.prime + " $ · " + l.type,
    "page : « " + p.type + " » → « " + p.prime + " »");
});

/* ------------------------------------------------------------
   2 · LE PLAFOND DE 7 %
   ------------------------------------------------------------ */
titre("2 · AUCUN TAUX EFFECTIF NE DEPASSE " + PLAFOND_TAUX + " %");
console.log("      (le plancher est le point le plus cher : c'est lui qui contraint)");
GRILLE.forEach((l) => {
  const tp = tauxDe(l, l.plancher);
  const tt = tauxDe(l, l.typique);
  const ts = tauxDe(l, l.sommet);
  dire(tp <= PLAFOND_TAUX + 1e-9,
    l.prime + " $  ·  " + tp.toFixed(1) + " % au plancher  ·  " + tt.toFixed(1) + " % au typique"
      + (l.sommet ? "  ·  " + ts.toFixed(1) + " % au sommet" : "  ·  — ")
      + "   « " + l.type + " »",
    "au-dessus du plafond : nos vendeurs internes touchent 10 %, un referent ne peut pas s'en approcher");
});

/* ------------------------------------------------------------
   3 · AUCUNE MARCHE BRUTALE
   ------------------------------------------------------------ */
titre("3 · AUCUNE MARCHE BRUTALE ENTRE DEUX LIGNES VOISINES");
for (let i = 1; i < GRILLE.length; i++) {
  const r = GRILLE[i].prime / GRILLE[i - 1].prime;
  dire(r <= MARCHE_MAX + 1e-9,
    GRILLE[i - 1].prime + " $ → " + GRILLE[i].prime + " $   ×" + r.toFixed(1),
    "un referent qui compare deux lignes voisines doit lire une progression, pas un saut");
}

/* ------------------------------------------------------------
   4 · AUCUNE PRIME NE POINTE UN PRIX
   ------------------------------------------------------------ */
titre("4 · UNE PRIME NE PEUT PAS SE LIRE COMME LE PRIX DE SON PROPRE PROJET");
GRILLE.forEach((l) => {
  const dedans = l.prime >= l.plancher && (l.sommet === 0 || l.prime <= l.sommet);
  dire(!dedans,
    "la prime de " + l.prime + " $ ne tombe pas dans la fourchette de « " + l.type + " »",
    "un montant qui pourrait AUSSI etre le prix du projet est le seul cas ou la confusion est possible");
});

/* CE QUI N'EST PAS UNE FAUTE, ET POURQUOI ON L'ECRIT QUAND MEME.
   D-773

   La premiere version de ce controle refusait toute prime egale a
   un palier du bareme. Deux lignes tombaient : 2 500 $ et 5 000 $.

   A LA LECTURE, LA REGLE NE PROTEGEAIT RIEN. Un referent qui touche
   5 000 $ lit, sur la ligne d'a cote, « plusieurs entreprises d'un
   meme groupe ». Il ne peut pas en conclure que le projet valait
   5 000 $ : la grille lui dit noir sur blanc que c'est SA prime, et
   le montant est deux fois plus petit que le plus petit mandat de
   cette ligne. La coincidence est arithmetique, pas informative.

   ON LA GARDE EN NOTE. Une coincidence qu'on a examinee une fois et
   jugee inoffensive doit rester VISIBLE : le jour ou le bareme ou la
   grille bougent, c'est la premiere chose a reexaminer. La regle qui
   MORD est la suivante — aucun montant du panneau hors la colonne
   des primes. */
const collisions = GRILLE.filter((l) => montantsBareme.indexOf(l.prime) !== -1);
console.log("      crans lus dans google/Code.gs (ESTIM_ECHELLE) : "
  + [...new Set(montantsBareme)].join(" · ") + " $");
console.log("      NOTE  " + collisions.length + " prime(s) coincide(nt) avec un palier du bareme"
  + (collisions.length ? " : " + collisions.map((l) => l.prime + " $").join(" · ") : "")
  + "\n            Sans effet : la grille nomme le TYPE a cote du montant, et\n"
  + "            chaque prime est loin sous le plancher de sa propre ligne.\n"
  + "            A reexaminer si le bareme ou la grille bougent.");

/* ET AUCUN MONTANT DU BAREME NE PARAIT DANS LE PANNEAU. C'est le
   controle qui repond a la question du client : « est-ce que je peux
   deviner combien vous avez vendu ? ». */
const primesDeclarees = GRILLE.map((l) => l.prime);
const intrus = vu.tousDuPanneau
  .map((s) => Number(sous(s).replace("$", "")))
  .filter((v) => v && primesDeclarees.indexOf(v) === -1);
dire(intrus.length === 0,
  "aucun autre montant que les sept primes dans tout le panneau",
  "intrus : " + intrus.join(" · ") + " $ — un prix de projet dans une phrase se lit aussi bien que dans un tableau");

/* ------------------------------------------------------------
   LE PLAFOND AFFICHE
   ------------------------------------------------------------ */
titre("6 · LE PLAFOND AFFICHE EST CELUI DE LA GRILLE");
const haut = GRILLE[GRILLE.length - 1].prime;
dire(sous(vu.plafond) === haut + "$",
  "la section annonce " + haut + " $, et la grille le paie",
  "annonce : « " + vu.plafond + " »  ·  derniere ligne : " + haut + " $");
/* LA LETTRE DE FIN EST ADMISE DEPUIS D-779 : deux redactions d'un
   meme jour ne peuvent pas partager un nom de fichier, et dater du
   lendemain une condition affichee aujourd'hui serait une faussete. */
dire(/^\d{4}-\d{2}-\d{2}(-[a-z])?$/.test(vu.version.trim()),
  "le panneau porte une version datee", "lu : « " + vu.version + " »");

console.log("");
console.log("============================================================");
console.log(ko ? ("LA GRILLE NE TIENT PAS : " + ko + " defaut(s) sur " + n)
              : ("LA GRILLE TIENT : " + n + " / " + n
                 + "   —  taux max " + Math.max(...GRILLE.map((l) => tauxDe(l, l.plancher))).toFixed(1) + " %"));
console.log("============================================================");
process.exit(ko ? 1 : 0);
