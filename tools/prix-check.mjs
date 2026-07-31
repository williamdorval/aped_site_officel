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
  { motif: /mock-|mk-|mkx-|ecr-|data-mock/, pourquoi: "prix de demonstration d'un client fictif, pas un tarif APED" }
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

const source = [];
for (const f of FICHIERS) {
  const p = path.join(RACINE, f);
  if (!fs.existsSync(p)) continue;
  const brut = fs.readFileSync(p, "utf8");
  const demo = f.endsWith(".html") ? zonesDemo(brut) : [];
  const dansDemo = (i) => demo.some(([a, b]) => i >= a && i <= b);
  const lignes = brut.split("\n");
  lignes.forEach((l, i) => {
    let m;
    MONTANT.lastIndex = 0;
    while ((m = MONTANT.exec(l))) {
      const n = m[1];
      const a = autorise(n) || contexteOk(l) ||
        (dansDemo(i) ? { pourquoi: "prix de demonstration d'un client fictif, pas un tarif APED" } : null);
      source.push({
        fichier: f, ligne: i + 1, montant: m[0].trim(),
        verdict: a ? "autorise (" + a.pourquoi + ")" : "A RETIRER",
        contexte: l.trim().slice(0, 96)
      });
    }
  });
}

/* Les grilles de calcul vivent dans le script : elles produisent le
   chiffre du prospect et ne s'affichent jamais telles quelles. On
   les releve quand meme, pour que la decision soit visible. */
const grilles = [];
{
  const p = path.join(RACINE, "js/main.js");
  const lignes = fs.readFileSync(p, "utf8").split("\n");
  lignes.forEach((l, i) => {
    if (/PRICING|base:\s*\{\s*vitrine/.test(l)) grilles.push({ ligne: i + 1, texte: l.trim().slice(0, 110) });
  });
}

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
  JSON.stringify({ source, rendu: renduTries, grilles }, null, 2), "utf8");

console.log("=== SOURCE ===");
source.forEach((s) => console.log(`  ${s.fichier}:${s.ligne}  ${s.montant}  ${s.verdict}`));
console.log("\n=== TEXTE RENDU, modales et accordeons ouverts ===");
renduTries.forEach((r) => console.log(`  ${r.montant}  ${r.verdict}   « …${r.avant} ${r.montant} ${r.apres}… »`));
console.log(`\n=== GRILLE DE CALCUL (jamais affichee telle quelle) ===`);
grilles.forEach((g) => console.log(`  js/main.js:${g.ligne}  ${g.texte}`));
console.log(`\nA RETIRER dans le source : ${aRetirer.length}`);
console.log(`A VERIFIER dans le rendu : ${aVerifier.length}`);
