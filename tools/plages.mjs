/* ============================================================
   LES PLAGES DE LIGNES — GENEREES, DONC JAMAIS PERIMEES
   `node tools/plages.mjs`            — affiche le tableau
   `node tools/plages.mjs verifier`   — compare a SECTIONS.md
   `node tools/plages.mjs ecrire`     — reecrit le tableau dans SECTIONS.md

   POURQUOI CET OUTIL EXISTE. Un index de lignes ecrit a la main
   derive des la premiere edition, et un index perime coute plus cher
   que pas d'index du tout : il envoie lire le mauvais endroit et on
   ne s'en apercoit qu'apres.

   CE QUI EST ECRIT A LA MAIN ICI : le lien SEMANTIQUE entre une
   section du site et les blocs qui la portent. Ce lien-la ne bouge
   pas quand on edite. Les NUMEROS, eux, sont toujours releves dans
   les fichiers.

   `verifier` sort 1 si le tableau de SECTIONS.md ne correspond plus.
   ============================================================ */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, "..");
const MODE = process.argv[2] || "afficher";

const BORNE_DEBUT = "<!-- PLAGES:DEBUT -->";
const BORNE_FIN = "<!-- PLAGES:FIN -->";

/* ------------------------------------------------------------
   Le lien semantique. Une entree par section du site.
   `css` et `js` designent le TITRE du bloc, pas sa ligne : on
   cherche le bloc par son texte, on rend ses bornes.
   ------------------------------------------------------------ */
const SECTIONS = [
  { n: "01", nom: "Accueil", ancre: "top",
    css: ["12. HERO", "11b. SEQUENCE D'ENTREE"], js: { "js/main.js": ["SEQUENCE D'ENTREE"] } },
  { n: "02", nom: "Services", ancre: "services",
    css: ["14. SERVICES"], js: { "js/main.js": ["SECTION 02"] } },
  { n: "03", nom: "Réalisations", ancre: "realisations",
    css: ["15. AVANT / APRES"], js: { "js/main.js": ["SECTION 03"] } },
  { n: "04", nom: "Secteurs", ancre: "demos",
    css: ["16. SECTEURS"], js: { "js/main.js": ["Apercu des secteurs"], "js/langue.js": ["5. LES SECTEURS"] },
    autres: "`css/secteurs.css` (entier, injecte par JS)" },
  { n: "05", nom: "Visite 360", ancre: "visite",
    css: [], js: {}, autres: "`css/tour360.css` · `js/tour360.js` (entiers)" },
  { n: "06", nom: "Calculateur", ancre: "calculateur",
    css: ["17. CALCULATEUR"], js: { "js/main.js": ["Calculateur."] } },
  { n: "07", nom: "Comparatif", ancre: "comparatif",
    css: ["18. COMPARATIF"], js: {} },
  { n: "08", nom: "Processus", ancre: "processus",
    css: ["19. PROCESSUS"], js: { "js/main.js": ["PARCOURS"] } },
  { n: "09", nom: "Référence", ancre: "reference",
    css: ["21. REFERENCE"], js: {} },
  { n: "10", nom: "Questions", ancre: "faq",
    css: ["22. FAQ"], js: { "js/langue.js": ["7. LA FAQ"] } },
  { n: "11", nom: "Contact", ancre: "contact",
    css: ["23. CONTACT"], js: { "js/main.js": ["Validation.", "Envoi", "LE REPLI QUI LIVRE"] } },
  { n: "—", nom: "Pied de page", ancre: "footer",
    css: ["24. PIED DE PAGE"], js: { "js/main.js": ["LA DOUZIEME FRONTIERE"] } },
];

/* ------------------------------------------------------------
   Relevé des bornes
   ------------------------------------------------------------ */
function lignes(rel) { return fs.readFileSync(path.join(RACINE, rel), "utf8").split("\n"); }

/* Blocs d'un fichier de code : chaque banniere `== TITRE ==` ouvre un
   bloc.

   DEUX NIVEAUX, ET IL EN FAUT DEUX. Dans `app.css` toutes les
   bannieres sont au retrait 0 : « 14. SERVICES » et « LA PILE » ne se
   distinguent que par leur titre. Une regle fondee sur le seul retrait
   fermait donc le bloc Services au bout de 13 lignes, juste avant ses
   propres sous-parties. Un titre qui commence par un NUMERO de section
   (`14.`, `11bis.`, `4b.`) est un bloc de rang 0 ; tout autre titre est
   un sous-bloc, de rang 1. Un bloc court jusqu'a la prochaine banniere
   de retrait inferieur, ou de meme retrait et de rang au plus egal. */
function blocs(rel) {
  const L = lignes(rel);
  const marques = [];
  L.forEach((l, i) => {
    const m = l.match(/^(\s*)(?:\/\*|<!--)\s*==\s*(.+?)\s*==/);
    if (m) marques.push({ ligne: i + 1, retrait: m[1].length, titre: m[2], rang: /^\d+[a-z]*\.\s/.test(m[2]) ? 0 : 1 });
  });
  return marques.map((m, k) => {
    let fin = L.length;
    for (let j = k + 1; j < marques.length; j++) {
      const o = marques[j];
      if (o.retrait < m.retrait || (o.retrait === m.retrait && o.rang <= m.rang)) { fin = o.ligne - 1; break; }
    }
    return { ...m, fin };
  });
}

function trouver(bs, motif) {
  const t = bs.filter((b) => b.titre.toLowerCase().includes(motif.toLowerCase()));
  return t.length ? t[0] : null;
}

/* Sections HTML : de `<section id=` a la ligne juste avant la suivante. */
function sectionsHTML() {
  const L = lignes("index.html");
  const marques = [];
  L.forEach((l, i) => {
    let m = l.match(/<section[^>]*\bid="([^"]+)"/);
    if (m) return void marques.push({ id: m[1], ligne: i + 1 });
    /* Le pied donne son PROPRE id, il ne s'en fabrique plus un.  D-713 */
    if (/<footer[^>]*class="footer"/.test(l)) {
      const f = l.match(/<footer[^>]*\bid="([^"]+)"/);
      if (!f) {
        console.error(
          `ARRET  index.html:${i + 1} — <footer class="footer"> n'a pas d'id.\n` +
          `       Cet outil en fabriquait un a partir de la classe, puis son\n` +
          `       « verifier » comparait l'invention a elle-meme et rendait\n` +
          `       toujours « a jour ». Le tableau publiait donc une ancre que\n` +
          `       le document ne portait pas. Pose un id sur le pied.`
        );
        process.exit(2);
      }
      marques.push({ id: f[1], ligne: i + 1 });
    }
  });
  const fermeture = L.findIndex((l) => /<\/main>/.test(l));
  return marques.map((m, k) => ({
    ...m,
    fin: k + 1 < marques.length ? marques[k + 1].ligne - 1 : (fermeture > 0 ? fermeture : L.length),
  }));
}

const bsCSS = blocs("css/app.css");
const bsJS = { "js/main.js": blocs("js/main.js"), "js/langue.js": blocs("js/langue.js") };
const htm = sectionsHTML();

/* Le seuil d'une section vit AVANT sa balise `<section>` ? Non : il en
   est le premier enfant. La plage HTML l'inclut donc deja. */

const rangees = [];
const manquants = [];

for (const S of SECTIONS) {
  const h = htm.find((x) => x.id === S.ancre);
  if (!h) { manquants.push(`section HTML #${S.ancre} introuvable`); continue; }

  const css = [];
  for (const m of S.css) {
    const b = trouver(bsCSS, m);
    if (!b) { manquants.push(`bloc CSS « ${m} » introuvable (section ${S.nom})`); continue; }
    css.push(`${b.ligne}-${b.fin}`);
  }

  const js = [];
  for (const [f, motifs] of Object.entries(S.js)) {
    for (const m of motifs) {
      const b = trouver(bsJS[f], m);
      if (!b) { manquants.push(`bloc JS « ${m} » introuvable dans ${f} (section ${S.nom})`); continue; }
      js.push(`\`${f.replace("js/", "")}\` ${b.ligne}-${b.fin}`);
    }
  }

  rangees.push({
    n: S.n, nom: S.nom, ancre: S.ancre,
    html: `${h.ligne}-${h.fin}`,
    htmlN: h.fin - h.ligne + 1,
    css: css.join(" · ") || "—",
    js: js.join(" · ") || "—",
    autres: S.autres || "—",
  });
}

function tableau() {
  let s = `| № | Section | Ancre | \`index.html\` | l. | \`css/app.css\` | JS | autres |\n`;
  s += `|---|---|---|---|---:|---|---|---|\n`;
  for (const r of rangees) {
    s += `| ${r.n} | **${r.nom}** | \`#${r.ancre}\` | ${r.html} | ${r.htmlN} | ${r.css} | ${r.js} | ${r.autres} |\n`;
  }
  return s;
}

/* ------------------------------------------------------------ */
if (MODE === "afficher") {
  console.log(tableau());
  if (manquants.length) { console.log("\nMANQUANTS :"); for (const m of manquants) console.log("  " + m); process.exit(1); }
  process.exit(0);
}

const chemin = path.join(RACINE, "SECTIONS.md");
const doc = fs.readFileSync(chemin, "utf8");
const a = doc.indexOf(BORNE_DEBUT), b = doc.indexOf(BORNE_FIN);

if (a < 0 || b < 0) {
  console.log(`SECTIONS.md ne porte pas les bornes ${BORNE_DEBUT} / ${BORNE_FIN}.`);
  process.exit(1);
}

const actuel = doc.slice(a + BORNE_DEBUT.length, b).trim();
const attendu = tableau().trim();

if (MODE === "ecrire") {
  fs.writeFileSync(chemin, doc.slice(0, a + BORNE_DEBUT.length) + "\n\n" + attendu + "\n\n" + doc.slice(b), "utf8");
  console.log(`SECTIONS.md mis a jour — ${rangees.length} sections.`);
  if (manquants.length) { console.log("\nMANQUANTS :"); for (const m of manquants) console.log("  " + m); process.exit(1); }
  process.exit(0);
}

/* verifier */
if (manquants.length) {
  console.log("PLAGES : ECHEC — des reperes ont disparu du code.");
  for (const m of manquants) console.log("  " + m);
  process.exit(1);
}
if (actuel === attendu) {
  console.log(`PLAGES : a jour — ${rangees.length} sections verifiees dans index.html, css/app.css, js/main.js, js/langue.js.`);
  process.exit(0);
}
console.log("PLAGES : PERIME — SECTIONS.md ne correspond plus au code.");
console.log("Lancer `node tools/plages.mjs ecrire`.\n");
const la = actuel.split("\n"), lb = attendu.split("\n");
for (let i = 0; i < Math.max(la.length, lb.length); i++) {
  if (la[i] !== lb[i]) {
    console.log(`  ligne ${i + 1}`);
    console.log(`    ecrit : ${la[i] ?? "(absente)"}`);
    console.log(`    reel  : ${lb[i] ?? "(absente)"}`);
  }
}
process.exit(1);
