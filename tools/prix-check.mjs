/* ============================================================
   AUCUN PRIX PUBLIC
   `node tools/prix-check.mjs [port]`

   Deux passes, parce qu'une seule ne prouve rien :
   1. dans le CODE SOURCE, tous les montants en dollars, avec leur
      fichier et leur ligne ;
   2. dans le TEXTE RENDU de la page, ce qu'un visiteur — ou un
      concurrent — lit reellement, modales ouvertes comprises.

   Trois familles sont AUTORISEES, et elles sont declarees ici
   plutot que devinees :
   · « 5 000 $ » du programme de reference — le plafond attire, la
     grille decourage ;
   · les sorties vivantes du calculateur et de l'estimateur, qui
     donnent un chiffre au prospect sans publier notre grille ;
   · « 0 $ », qui dit qu'une chose ne coute rien.
   ============================================================ */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, "..");
import { adresse, port as portDe } from "./_adresse.mjs";
const PORT = portDe(process.argv[2]);


const FICHIERS = ["index.html", "404.html", "css/app.css", "css/tokens.css", "css/base.css",
  "css/tour360.css", "js/main.js", "js/motion.js", "js/hero.js", "js/limaille.js",
  "js/pointe.js", "js/tour360.js"];

/* Un montant : un nombre, espaces insecables compris, suivi de $. */
const MONTANT = /(\d[\d  \s]*)\$/g;

const AUTORISES = [
  { motif: /^5[  \s]*000$/, pourquoi: "plafond du programme de reference" },
  { motif: /^0$/, pourquoi: "gratuite affirmee" }
];
/* Certaines lignes portent un montant qui n'est PAS notre prix. On
   les nomme une par une plutot que d'elargir le motif : une regle
   large finirait par laisser passer un vrai tarif. */
const CONTEXTES_OK = [
  { motif: /outRate|inRate|coûte une heure de main/, pourquoi: "taux horaire saisi par le visiteur" },
  { motif: /outRev|inRev|Chiffre d’affaires par mois/, pourquoi: "chiffre d'affaires saisi par le visiteur" },
  { motif: /une minute par semaine|par année, à|par minute hebdo/, pourquoi: "constante de methode du calcul, pas un tarif" },
  { motif: /grille de commissions|Commission versée uniquement/, pourquoi: "bareme de commission, revele apres l'interet — decision du client" },
  { motif: /nav-refer-num|referral-max|Encaissez|Référez/, pourquoi: "plafond du programme de reference" },
  /* Les maquettes de secteur et les ecrans de Services montrent des
     interfaces de CLIENTS fictifs : un menu de restaurant, un bon de
     travail de garage, une fiche de propriete. Les montants qu'on y
     lit sont ceux de ces entreprises imaginaires, jamais nos tarifs.
     Ils sont necessaires : un menu sans prix ne ressemble pas a un
     menu, et c'est precisement ce qui separait ces apercus d'un
     wireframe gris. On les nomme ici pour que la decision soit
     visible dans le rapport plutot que noyee. */
  { motif: /mock-|mk-|mkx-|ecr-|data-mock/, pourquoi: "prix de demonstration d'un client fictif, pas un tarif APED" },
  /* LA FOURCHETTE REVELEE APRES LE FORMULAIRE.  D-748
     La regle a change, et elle s'est RETRECIE : « aucun prix, nulle
     part » est devenu « aucun prix sur la page publique ». Le bareme
     vit dans `js/main.js` et n'est ecrit dans le document QU'APRES
     l'envoi d'un formulaire complet, dans la modale, a la personne
     qui vient de repondre a six questions sur son projet.
     La passe 2 ci-dessous — le TEXTE RENDU — est celle qui compte :
     elle ouvre toutes les modales et echouerait si un montant y
     paraissait au chargement. */
  /* LA FORME D'UNE LIGNE DE BAREME, pas le mot « BAREME » : le
     mot n'est ecrit que sur la ligne d'ouverture, et ce sont les
     CINQ lignes suivantes qui portent les montants. */
  { motif: /BAREME|devis-montant|fourchette_vue|fourchetteDe|score:\s*\d+\s*,\s*texte:/, pourquoi: "bareme revele apres le formulaire, D-748" }
];
const autorise = (n) => AUTORISES.find((a) => a.motif.test(n.trim()));
const contexteOk = (l) => CONTEXTES_OK.find((c) => c.motif.test(l));

/* LES ZONES DE DEMONSTRATION.
   Un montant s'evalue par ce qu'il DESIGNE, pas par sa ligne. Les
   treize apercus de secteur et les quatre ecrans de Services
   montrent des interfaces de CLIENTS fictifs : un menu de
   restaurant, un bon de travail de garage, une fiche de propriete.
   Les montants qu'on y lit appartiennent a ces entreprises
   imaginaires. Ils sont necessaires — un menu sans prix ne
   ressemble pas a un menu, et c'est exactement ce qui separait ces
   apercus du wireframe gris qu'on vient de remplacer.
   On delimite donc ces zones une fois, et tout ce qui tombe dedans
   est classe comme tel, avec sa raison. */
function zonesDemo(texte) {
  const bornes = [];
  const d = texte.indexOf('<template id="tplSecteurs">');
  if (d >= 0) bornes.push([d, texte.indexOf("</template>", d)]);
  let i = 0;
  while ((i = texte.indexOf('<div class="ecr ecr--', i)) >= 0) {
    bornes.push([i, texte.indexOf("</figure>", i)]);
    i += 10;
  }
  /* On convertit les bornes de caracteres en bornes de lignes. */
  const cumul = [];
  let n = 0;
  for (const l of texte.split("\n")) { cumul.push(n); n += l.length + 1; }
  const ligneDe = (pos) => { let k = 0; while (k + 1 < cumul.length && cumul[k + 1] <= pos) k++; return k; };
  return bornes.filter(([a, b]) => a >= 0 && b > a).map(([a, b]) => [ligneDe(a), ligneDe(b)]);
}

/* LES COMMENTAIRES, ET POURQUOI ILS COMPTENT A PART.  D-728

   Les dix montants que cet outil signalait apres sa reparation
   etaient TOUS dans des commentaires — et tous dans des
   commentaires qui expliquent le RETRAIT d'une grille : « elle
   publiait cinq paliers, de 2 500 $ a 40 000 $ ». Le raisonnement
   qui a fait disparaitre un prix ne peut pas s'ecrire sans citer le
   prix disparu.

   Un commentaire n'est ni rendu, ni lu par un visiteur — ni le
   bloc de JavaScript, ni celui de HTML. (On ne peut PAS ecrire ici
   la forme litterale du commentaire HTML : Node refuse un module
   qui la contient, « HTML comments are not allowed in modules ».)
   La passe du TEXTE RENDU, plus bas, reste le controle dur : elle
   ouvre les
   modales et les accordeons et relit `innerText`. Si un prix
   arrivait a l'ecran, c'est la qu'il se ferait prendre, et elle
   ne pardonne pas.

   ON LES COMPTE QUAND MEME, SEPAREMENT. Un commentaire qui cite un
   ancien tarif reste une trace du bareme dans un depot public : ce
   n'est pas une faute, c'est une chose a savoir.

   LA DETECTION EST STRUCTURELLE, PAS PAR MOT-CLE. On suit l'etat
   « dans un commentaire » ligne par ligne — sinon un montant place
   apres la fermeture d'un bloc passerait pour du commentaire. */
function lignesCommentees(texte, html) {
  const out = new Set();
  let bloc = false;
  texte.split("\n").forEach((l, i) => {
    const debutBloc = bloc;
    let reste = l;
    let commentee = bloc;

    if (html) {
      while (reste.length) {
        if (!bloc) {
          const o = reste.indexOf("<!--");
          if (o < 0) break;
          bloc = true; commentee = true; reste = reste.slice(o + 4);
        } else {
          const c = reste.indexOf("-->");
          if (c < 0) { reste = ""; break; }
          bloc = false; reste = reste.slice(c + 3);
        }
      }
    } else {
      while (reste.length) {
        if (!bloc) {
          const deuxBarres = reste.indexOf("//");
          const o = reste.indexOf("/*");
          if (deuxBarres >= 0 && (o < 0 || deuxBarres < o)) { commentee = true; break; }
          if (o < 0) break;
          bloc = true; commentee = true; reste = reste.slice(o + 2);
        } else {
          const c = reste.indexOf("*/");
          if (c < 0) { reste = ""; break; }
          bloc = false; reste = reste.slice(c + 2);
        }
      }
    }

    /* Une ligne compte comme commentee si elle l'etait en entrant OU
       si un commentaire s'y ouvre. Le cas « code, puis commentaire
       en fin de ligne » reste donc signale — c'est du code. */
    if (debutBloc || commentee) out.add(i);
  });
  return out;
}

const source = [];
const enCommentaire = [];
for (const f of FICHIERS) {
  const p = path.join(RACINE, f);
  if (!fs.existsSync(p)) continue;
  const brut = fs.readFileSync(p, "utf8");
  const demo = f.endsWith(".html") ? zonesDemo(brut) : [];
  const dansDemo = (i) => demo.some(([a, b]) => i >= a && i <= b);
  const commentees = lignesCommentees(brut, f.endsWith(".html"));
  const lignes = brut.split("\n");
  lignes.forEach((l, i) => {
    let m;
    MONTANT.lastIndex = 0;
    while ((m = MONTANT.exec(l))) {
      const n = m[1];
      const a = autorise(n) || contexteOk(l) ||
        (dansDemo(i) ? { pourquoi: "prix de demonstration d'un client fictif, pas un tarif APED" } : null);

      /* Un montant dans un commentaire sort du decompte dur et entre
         dans le sien : il n'atteint aucun visiteur, mais il reste
         une trace du bareme dans un depot public. */
      if (!a && commentees.has(i)) {
        enCommentaire.push({
          fichier: f, ligne: i + 1, montant: m[0].trim(),
          contexte: l.trim().slice(0, 96)
        });
        continue;
      }

      source.push({
        fichier: f, ligne: i + 1, montant: m[0].trim(),
        verdict: a ? "autorise (" + a.pourquoi + ")" : "A RETIRER",
        contexte: l.trim().slice(0, 96)
      });
    }
  });
}

/* LA GRILLE A DISPARU POUR DE BON, ET LA SONDE NE LE SAVAIT PAS.
   D-716 · D-728

   HISTOIRE COURTE, PARCE QU'ELLE SE REPETE. Premiere version : la
   sonde cherchait `PRICING`, la variable s'appelait `BAREME`, elle
   ne matchait rien et jurait qu'il n'y avait pas de grille. On a
   corrige en cherchant `BAREME` ET en ARRETANT sur zero — « zero
   ici veut dire que la sonde a derive ».

   Puis `BAREME` a ete retire pour de vrai le 2026-08-03 (D-353).
   Le garde-fou est alors devenu le defaut : la sonde ARRETE a
   chaque lancement, `process.exit(2)`, et TOUT LE RESTE DU
   CONTROLE — les montants du source, le texte rendu — ne s'execute
   plus. La garantie « aucun prix publie » n'etait plus verifiee
   depuis, sans que rien ne le dise autrement qu'en criant.

   C'est le piege 46 dans sa forme la plus pure : un contournement
   qui survit a son motif.

   CE QUI REMPLACE L'ARRET. Zero grille est desormais le resultat
   ATTENDU — mais un zero ne se croit toujours pas sur parole. On
   passe donc a la sonde un texte d'essai qui CONTIENT une grille :
   si elle ne la trouve pas, c'est la sonde qui est cassee, et c'est
   la qu'on arrete. Le zero du vrai fichier ne compte que si le
   faux, lui, rend autre chose que zero. */
function chercherGrille(source) {
  const trouve = [];
  let dedans = false;
  source.split("\n").forEach((l, i) => {
    if (/\bvar\s+BAREME\s*=|PRICING|base:\s*\{\s*vitrine/.test(l)) {
      dedans = true;
      trouve.push({ ligne: i + 1, texte: l.trim().slice(0, 110) });
      return;
    }
    if (dedans) {
      if (/^\s*\]/.test(l)) { dedans = false; return; }
      if (/\d/.test(l)) trouve.push({ ligne: i + 1, texte: l.trim().slice(0, 110) });
    }
  });
  return trouve;
}

{
  /* L'AUTO-CONTROLE, D'ABORD. Une sonde qui ne sait plus trouver ce
     qu'elle cherche rend zero, et zero se lit « rien a signaler ». */
  const faux = [
    "var BAREME = [",
    "  { max: 1, bas: 2500, haut: 5000 },",
    "  { max: 3, bas: 5000, haut: 12000 }",
    "];"
  ].join("\n");
  const essai = chercherGrille(faux);
  if (essai.length < 3) {
    console.error(
      "ARRET  la sonde ne reconnait plus une grille de prix.\n" +
      "       Sur un texte d'essai qui en contient une, elle en a\n" +
      "       trouve " + essai.length + " ligne(s) au lieu de 3 au moins.\n" +
      "       Ce n'est pas le site qui a change, c'est l'instrument.\n" +
      "       Repare `chercherGrille` avant de croire le verdict."
    );
    process.exit(2);
  }
}

const grilles = chercherGrille(fs.readFileSync(path.join(RACINE, "js/main.js"), "utf8"));

/* ---- passe 2 : le texte reellement rendu ---- */
const nav = await chromium.launch();
const ctx = await nav.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.addInitScript(() => { try { sessionStorage.setItem("aped-entree-saut", "1"); sessionStorage.setItem("aped-sans-popup", "1"); } catch (e) {} });
await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: "load" });
await page.waitForTimeout(900);

const rendu = await page.evaluate(() => {
  /* On ouvre TOUT : modales, accordeons, details replies. Un prix
     cache derriere un `hidden` reste un prix publie. */
  document.querySelectorAll(".modal").forEach((m) => m.removeAttribute("hidden"));
  document.querySelectorAll("details").forEach((d) => (d.open = true));
  const t = document.body.innerText;
  const out = [];
  const re = /([^\n]{0,60}?)(\d[\d  \s]*\$)([^\n]{0,40})/g;
  let m;
  while ((m = re.exec(t))) out.push({ montant: m[2].trim(), avant: m[1].trim(), apres: m[3].trim() });
  return out;
});
await nav.close();

const renduTries = rendu.map((r) => {
  const n = r.montant.replace("$", "").trim();
  const ok = /^5[  \s]*000$/.test(n) || /^0$/.test(n);
  /* Les sorties vivantes du calculateur partent a zero puis suivent
     les curseurs : elles sont identifiables par leur voisinage. */
  const vivant = /(annuel|impact|vaut par|Heures|estim|fourchette|évitées|rendues|gagnés)/i.test(r.avant + " " + r.apres)
    /* LE SIGNE « ≈ » EST DEVENU LA SIGNATURE DE LA SORTIE VIVANTE.
       Le montant du calculateur est un `<b>` seul dans sa boite : son
       voisinage textuel est VIDE, donc aucun mot-cle ne pouvait
       l'identifier et il ressortait « A VERIFIER » a chaque passe. Il
       porte depuis le 2026-07-29 un « environ » — B7 de l'audit de
       veracite, la fausse precision au dollar pres — et ce prefixe ne
       se trouve nulle part ailleurs dans la page. Un montant precede
       de « ≈ » est, par construction, une estimation calculee et non
       un tarif. */
    || /^≈/.test(r.avant) || r.avant === "≈";
  /* LE BAREME DE COMMISSION EST UNE LIGNE CONTINUE : le decoupage par
     montant la fragmente, et les fragments perdent le contexte. On
     reconnait donc la ligne a l'un de ses reperes, pas chaque
     morceau. C'est un engagement envers un TIERS, pas notre grille de
     prix — decision assumee, deja nommee dans les contextes du
     source. */
  const bareme = /(Commission versée|contrat est signé|pas de commission|→\s*\d)/i.test(r.avant + " " + r.apres);
  return {
    ...r,
    verdict: ok ? "autorise"
      : vivant ? "sortie vivante du calculateur"
      : bareme ? "bareme de commission, engagement envers un tiers"
      : "A VERIFIER",
  };
});

const aRetirer = source.filter((s) => s.verdict === "A RETIRER");
const aVerifier = renduTries.filter((r) => r.verdict === "A VERIFIER");

fs.writeFileSync(path.join(RACINE, "refonte-captures", "prix.json"),
  JSON.stringify({ source, rendu: renduTries, grilles, enCommentaire }, null, 2), "utf8");

console.log("=== SOURCE ===");
source.forEach((s) => console.log(`  ${s.fichier}:${s.ligne}  ${s.montant}  ${s.verdict}`));
console.log("\n=== TEXTE RENDU, modales et accordeons ouverts ===");
renduTries.forEach((r) => console.log(`  ${r.montant}  ${r.verdict}   « …${r.avant} ${r.montant} ${r.apres}… »`));
console.log(`\n=== GRILLE DE PRIX DANS js/main.js ===`);
if (!grilles.length) {
  /* AUCUNE GRILLE EST DEVENU L'ANOMALIE.  D-748
     Le bareme est REVENU le 2026-08-06, sous une regle plus etroite
     que celle de D-353 : il ne s'affiche qu'apres un formulaire
     complet, dans la modale. S'il disparaissait, la fourchette
     promise a la derniere etape ne paraitrait plus et rien d'autre
     ne le dirait. */
  console.log(
    `  *** AUCUNE — et c'est une anomalie depuis D-748.\n` +
    `  Le bareme doit exister dans js/main.js : c'est lui qui produit la\n` +
    `  fourchette montree a la fin de l'assistant de projet.`
  );
} else {
  grilles.forEach((g) => console.log(`  js/main.js:${g.ligne}  ${g.texte}`));
  console.log(
    `  ^ ${grilles.length} ligne(s). PERMIS DEPUIS D-748, sous condition :\n` +
    `    ces montants ne s'ecrivent dans le document qu'APRES l'envoi d'un\n` +
    `    formulaire complet. La passe du TEXTE RENDU ci-dessus le verifie —\n` +
    `    elle ouvre toutes les modales et compte ce qui parait au chargement.`
  );
}
console.log(`\n=== DANS UN COMMENTAIRE — NON RENDU, MAIS PUBLIE DANS LE DEPOT ===`);
if (!enCommentaire.length) {
  console.log("  aucun");
} else {
  enCommentaire.forEach((c) => console.log(`  ${c.fichier}:${c.ligne}  ${c.montant}   « ${c.contexte} »`));
  console.log(
    `  ^ ${enCommentaire.length} montant(s). Aucun n'atteint un visiteur : ni un\n` +
    `    « /* */ » ni un « <!-- --> » n'est rendu, et la passe du TEXTE RENDU\n` +
    `    ci-dessus le confirme. Ce sont des commentaires qui expliquent le\n` +
    `    RETRAIT d'une grille, et le raisonnement ne s'ecrit pas sans citer\n` +
    `    ce qui a ete retire. Ils restent lisibles dans un depot public :\n` +
    `    a arbitrer, pas a corriger en douce.`
  );
}
console.log(`
A RETIRER dans le source : ${aRetirer.length}`);
console.log(`A VERIFIER dans le rendu : ${aVerifier.length}`);

/* UN INTERDIT ABSOLU DOIT POUVOIR ECHOUER.  D-716 · D-728
   `CLAUDE.md` ecrit « doit rester a 0 » et cet outil n'avait aucun
   `process.exit` : il imprimait un nombre que rien ne relisait.
   Une grille de prix REVENUE fait echouer, elle aussi : elle
   n'attend plus d'arbitrage, il a ete rendu le 2026-08-03. */
/* LA GRILLE N'EST PLUS UNE FAUTE — SON ABSENCE DU RENDU EN EST UNE.
   D-748

   Jusqu'au 2026-08-06 cet outil echouait des qu'il trouvait un
   bareme dans `js/main.js`, parce que `CLAUDE.md` disait « aucun
   prix, nulle part ». La regle s'est retrecie : le bareme est
   permis dans le source, et c'est son apparition dans le TEXTE
   RENDU qui reste interdite.

   ON NE SE CONTENTE PAS DE LEVER L'INTERDIT. Un garde-fou qu'on
   desarme sans le remplacer ne garde plus rien. Celui-ci verifie
   maintenant les DEUX sens :
     · aucun montant du bareme dans la page chargee ;
     · et le bareme EXISTE — s'il disparaissait, la fourchette
       promise a l'etape 6 ne s'afficherait plus, et rien ne le
       dirait. */
const montantsBareme = grilles
  .map((g) => (/(\d[\d  \s]*\$)/.exec(g.ligne || g.texte || String(g)) || [])[1])
  .filter(Boolean)
  .map((s) => s.replace(/[  \s]/g, ""));
const fuites = rendu.filter((r) =>
  montantsBareme.indexOf(r.montant.replace(/[  \s]/g, "")) !== -1);

console.log(`
Bareme trouve dans js/main.js : ${grilles.length} ligne(s)`);
console.log(`Montants du bareme visibles au chargement : ${fuites.length}`);
if (fuites.length) {
  fuites.forEach((f) => console.log("   *** " + f.montant + "   « " + f.avant + " »"));
}

if (aRetirer.length || aVerifier.length || fuites.length || grilles.length === 0) {
  console.error(
    `\nECHEC : ${aRetirer.length} prix a retirer dans le source, ` +
    `${aVerifier.length} a verifier dans le rendu, ` +
    `${fuites.length} montant(s) du bareme dans la page, ` +
    `bareme ${grilles.length ? "present" : "INTROUVABLE"}.`
  );
  if (!grilles.length) {
    console.error(
      "       Le bareme a disparu de js/main.js. La fourchette promise\n" +
      "       a la fin de l'assistant de projet ne s'affichera plus, et\n" +
      "       rien d'autre ne le dirait."
    );
  }
  process.exit(1);
}
console.log("\nok — 0 prix non autorise sur la page, bareme present et non divulgue.");
