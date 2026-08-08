/* ============================================================
   DEPLACEMENT DES COMMENTAIRES VERS LE JOURNAL
   `node tools/commentaires.mjs rapport`    — ne touche a rien
   `node tools/commentaires.mjs appliquer`  — reecrit les sources

   Outil de FABRICATION, execute une fois. Il ne tourne jamais chez
   le visiteur et n'est pas une preuve : la preuve est
   `tools/code-nu.mjs --comparer`, qui doit rendre IDENTIQUE sur
   chaque fichier touche.

   CE QU'IL DEPLACE. Tout bloc de commentaire de QUATRE lignes ou
   plus. Ces blocs racontent POURQUOI une decision a ete prise ; on
   les lit une fois sur cinquante et on les paie a chaque ouverture
   du fichier.

   CE QU'IL LAISSE. Les commentaires de une a trois lignes. Ceux-la
   expliquent LE CODE juste en dessous, et les separer du code qu'ils
   decrivent coute plus cher que de les garder.

   CE QU'IL LAISSE AUSSI, EN UNE LIGNE. Le TITRE du bloc deplace,
   suivi de son identifiant. Le titre garde la navigation dans le
   fichier ; l'identifiant fait le lien avec le journal, dans les
   deux sens, par un simple grep.
   ============================================================ */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, "..");
const MODE = process.argv[2] || "rapport";
const SEUIL = 4;                       /* lignes : en dessous, le bloc reste */

const FICHIERS = [
  "index.html", "services.html", "realisations.html", "automatisation.html",
  "processus.html", "contact.html", "reference.html", "404.html",
  "confidentialite.html",
  "css/app.css", "css/secteurs.css", "css/tour360.css", "css/tokens.css", "css/base.css",
  "js/main.js", "js/site.js", "js/tour360.js",
];

/* ------------------------------------------------------------
   REPERAGE DES BLOCS

   On travaille sur la source telle quelle, mais on ne declare un
   bloc que si ses bornes tombent en dehors de toute chaine, de tout
   gabarit et de toute regex litterale. Le masque ci-dessous marque,
   caractere par caractere, ce qui est du code exploitable.
   ------------------------------------------------------------ */
function masqueJS(src) {
  const m = new Uint8Array(src.length);   /* 1 = interieur d'une chaine/gabarit/regex */
  let i = 0; const n = src.length; let etat = "code", quote = "", prev = "";
  while (i < n) {
    const c = src[i], d = src[i + 1];
    if (etat === "code") {
      if (c === "/" && d === "/") { etat = "ligne"; i += 2; continue; }
      if (c === "/" && d === "*") { etat = "bloc"; i += 2; continue; }
      if (c === '"' || c === "'") { etat = "chaine"; quote = c; m[i] = 1; prev = c; i++; continue; }
      if (c === "`") { etat = "gabarit"; m[i] = 1; prev = c; i++; continue; }
      if (c === "/" && /[=(,:[!&|?{};+\-*%~^<>]/.test(prev)) {
        m[i] = 1; i++;
        while (i < n && src[i] !== "/") { if (src[i] === "\\") { m[i] = 1; i++; } m[i] = 1; i++; }
        m[i] = 1; i++; prev = "/"; continue;
      }
      if (!/\s/.test(c)) prev = c; i++; continue;
    }
    if (etat === "ligne") { if (c === "\n") etat = "code"; i++; continue; }
    if (etat === "bloc") { if (c === "*" && d === "/") { i += 2; etat = "code"; continue; } i++; continue; }
    if (etat === "chaine" || etat === "gabarit") {
      m[i] = 1;
      if (c === "\\") { m[i + 1] = 1; i += 2; continue; }
      if ((etat === "chaine" && c === quote) || (etat === "gabarit" && c === "`")) etat = "code";
      i++; continue;
    }
  }
  return m;
}

function masqueCSS(src) {
  const m = new Uint8Array(src.length);
  let i = 0; const n = src.length; let etat = "code", quote = "";
  while (i < n) {
    const c = src[i], d = src[i + 1];
    if (etat === "code") {
      if (c === "/" && d === "*") { etat = "bloc"; i += 2; continue; }
      if (c === '"' || c === "'") { etat = "chaine"; quote = c; m[i] = 1; i++; continue; }
      i++; continue;
    }
    if (etat === "bloc") { if (c === "*" && d === "/") { i += 2; etat = "code"; continue; } i++; continue; }
    if (etat === "chaine") {
      m[i] = 1;
      if (c === "\\") { m[i + 1] = 1; i += 2; continue; }
      if (c === quote) etat = "code";
      i++; continue;
    }
  }
  return m;
}

/* HTML : le masque marque l'interieur des <script> et des <style>,
   ou les regles de commentaire sont celles de JS et de CSS. */
function masqueHTML(src) {
  const m = new Uint8Array(src.length);
  const re = /<(script|style)\b[^>]*>([\s\S]*?)<\/\1>/gi;
  let x;
  while ((x = re.exec(src))) {
    const debutCorps = x.index + x[0].indexOf(">") + 1;
    for (let k = debutCorps; k < debutCorps + x[2].length; k++) m[k] = 1;
  }
  return m;
}

/* Renvoie [{debut, fin, texte, ouvrant, fermant}] pour un delimiteur
   donne, en ignorant tout ce que le masque marque a 1. */
function blocsDelimites(src, masque, ouvrant, fermant) {
  const res = [];
  let i = 0;
  while (i < src.length) {
    const a = src.indexOf(ouvrant, i);
    if (a < 0) break;
    if (masque[a]) { i = a + 1; continue; }
    const b = src.indexOf(fermant, a + ouvrant.length);
    if (b < 0) break;
    res.push({ debut: a, fin: b + fermant.length, texte: src.slice(a, b + fermant.length) });
    i = b + fermant.length;
  }
  return res;
}

/* Suites d'au moins SEUIL lignes commencant par `//`. Les blocs `/* *\/`
   sont traites a part ; ici on ne prend que les lignes doubles-barres
   consecutives, et seulement si elles occupent la ligne entiere. */
function blocsLigneJS(src, masque) {
  const res = [];
  const lignes = [];
  let pos = 0;
  for (const l of src.split("\n")) { lignes.push({ txt: l, debut: pos }); pos += l.length + 1; }
  let k = 0;
  while (k < lignes.length) {
    const est = (j) => {
      const t = lignes[j].txt.trimStart();
      if (!t.startsWith("//")) return false;
      const dec = lignes[j].txt.length - t.length;
      return !masque[lignes[j].debut + dec];
    };
    if (!est(k)) { k++; continue; }
    let f = k;
    while (f + 1 < lignes.length && est(f + 1)) f++;
    if (f - k + 1 >= SEUIL) {
      res.push({ debut: lignes[k].debut, fin: lignes[f].debut + lignes[f].txt.length, texte: src.slice(lignes[k].debut, lignes[f].debut + lignes[f].txt.length) });
    }
    k = f + 1;
  }
  return res;
}

/* ------------------------------------------------------------
   TITRE ET CORPS
   ------------------------------------------------------------ */
const DECOR = /^[\s*=\-_·—–]+$/;

function depouille(texte, type) {
  let t = texte;
  if (type === "html") t = t.replace(/^<!--/, "").replace(/-->$/, "");
  else t = t.replace(/^\/\*/, "").replace(/\*\/$/, "").replace(/^\s*\/\/ ?/gm, "");
  const lignes = t.split("\n").map((l) => l.replace(/\s+$/, ""));
  /* desindentation : on retire le plus petit retrait des lignes non vides */
  const retraits = lignes.filter((l) => l.trim()).map((l) => l.length - l.trimStart().length);
  const min = retraits.length ? Math.min(...retraits) : 0;
  return lignes.map((l) => l.slice(min)).join("\n").replace(/^\n+/, "").replace(/\n+$/, "");
}

function titreDe(corps) {
  for (const l of corps.split("\n")) {
    const t = l.trim().replace(/^[*\-·—–=\s]+/, "").replace(/[=\-\s]+$/, "");
    if (t.length >= 4 && !DECOR.test(l) && /[A-Za-zÀ-ÿ]{3}/.test(t)) {
      let s = t.replace(/\s+/g, " ");
      if (s.length > 76) { s = s.slice(0, 76); const d = s.lastIndexOf(" "); if (d > 40) s = s.slice(0, d); s += "…"; }
      return s;
    }
  }
  return "(sans titre)";
}

/* Un bloc encadre de lignes pleines de `=` sert de reperage dans le
   fichier. On garde cette forme, sinon on perd la table des matieres
   implicite que les 26 blocs de `app.css` fournissent. */
function estBanniere(texte) {
  const l = texte.split("\n");
  return l.length > 2 && /^[\s/*]*={10,}/.test(l[0]) ;
}

/* Un titre qui contient `--` ferme un commentaire HTML, un titre qui
   contient `*​/` ferme un commentaire CSS ou JS. Le titre vient du
   texte du bloc : il faut donc le desamorcer avant de le reinjecter. */
function sur(t, type) {
  let s = t.replace(/\*\//g, "* /");
  if (type === "html") s = s.replace(/--+/g, "—");
  return s;
}

function remplacement(bloc, id, type, retrait) {
  const t = sur(bloc.titre, type);
  const corps = bloc.banniere ? `== ${t} ==  ${id}` : `${t}  ${id}`;
  if (type === "html") return `${retrait}<!-- ${corps} -->`;
  return `${retrait}/* ${corps} */`;
}

/* ------------------------------------------------------------
   PASSE PRINCIPALE
   ------------------------------------------------------------ */
const journal = new Map();   /* fichier -> [{id, titre, corps}] */
let compteur = 0;
const stats = [];

for (const rel of FICHIERS) {
  const abs = path.join(RACINE, rel);
  const src = fs.readFileSync(abs, "utf8");
  const ext = path.extname(rel).toLowerCase();
  const type = ext === ".html" ? "html" : ext === ".css" ? "css" : "js";

  let blocs = [];
  if (type === "html") {
    const m = masqueHTML(src);
    blocs = blocsDelimites(src, m, "<!--", "-->");
    /* les <script>/<style> en ligne du document, avec leurs propres regles */
    const re = /<(script|style)\b[^>]*>([\s\S]*?)<\/\1>/gi;
    let x;
    while ((x = re.exec(src))) {
      const off = x.index + x[0].indexOf(">") + 1;
      const corps = x[2];
      const mm = x[1].toLowerCase() === "style" ? masqueCSS(corps) : masqueJS(corps);
      for (const b of blocsDelimites(corps, mm, "/*", "*/")) blocs.push({ debut: b.debut + off, fin: b.fin + off, texte: b.texte, sousType: "js" });
      if (x[1].toLowerCase() !== "style") for (const b of blocsLigneJS(corps, mm)) blocs.push({ debut: b.debut + off, fin: b.fin + off, texte: b.texte, sousType: "js" });
    }
  } else {
    const m = type === "css" ? masqueCSS(src) : masqueJS(src);
    blocs = blocsDelimites(src, m, "/*", "*/");
    if (type === "js") blocs = blocs.concat(blocsLigneJS(src, m));
  }

  blocs.sort((a, b) => a.debut - b.debut);
  blocs = blocs.filter((b) => b.texte.split("\n").length >= SEUIL);

  if (!blocs.length) { stats.push({ rel, n: 0, avant: src.length, apres: src.length }); continue; }

  const entrees = [];
  let out = "", curseur = 0, gagne = 0;
  for (const b of blocs) {
    const sousType = b.sousType || type;
    const corps = depouille(b.texte, sousType === "html" ? "html" : "bloc");
    const titre = titreDe(corps);
    const banniere = estBanniere(b.texte);
    compteur++;
    const id = "D-" + String(compteur).padStart(3, "0");
    /* le retrait du bloc = les espaces qui le precedent sur sa ligne */
    let d = b.debut; while (d > 0 && src[d - 1] !== "\n" && /\s/.test(src[d - 1])) d--;
    const retrait = src.slice(d, b.debut);
    const debutReel = /^\s*$/.test(src.slice(d, b.debut)) ? d : b.debut;
    const rempl = remplacement({ titre, banniere }, id, sousType === "html" ? "html" : "bloc", src.slice(debutReel, b.debut));
    out += src.slice(curseur, debutReel) + rempl;
    gagne += (b.fin - debutReel) - rempl.length;
    curseur = b.fin;
    entrees.push({ id, titre, corps });
  }
  out += src.slice(curseur);

  journal.set(rel, entrees);
  stats.push({ rel, n: blocs.length, avant: src.length, apres: out.length });

  if (MODE === "appliquer") fs.writeFileSync(abs, out, "utf8");
}

/* ------------------------------------------------------------
   ECRITURE DU JOURNAL
   ------------------------------------------------------------ */
function slug(rel) { return rel.replace(/[\/\\]/g, "-").replace(/\.[^.]+$/, "") + ".md"; }

if (MODE === "appliquer") {
  const dossier = path.join(RACINE, "decisions");
  fs.mkdirSync(dossier, { recursive: true });
  for (const [rel, entrees] of journal) {
    const nom = slug(rel);
    let md = `# Décisions — \`${rel}\`\n\n`;
    md += `> Le pourquoi du code de \`${rel}\`. Chaque entrée porte un identifiant\n`;
    md += `> qui figure aussi dans le fichier source : \`grep D-042\` trouve les deux.\n`;
    md += `> Ne se lit jamais en entier — on y arrive par l'identifiant.\n\n`;
    md += `## Table\n\n`;
    for (const e of entrees) md += `- **${e.id}** — ${e.titre}\n`;
    md += `\n---\n\n`;
    for (const e of entrees) {
      md += `## ${e.id} — ${e.titre}\n\n`;
      md += e.corps.split("\n").map((l) => (l ? l : "")).join("\n");
      md += `\n\n`;
    }
    fs.writeFileSync(path.join(dossier, nom), md, "utf8");
  }
}

if (MODE === "apercu") {
  for (const [rel, entrees] of journal) {
    console.log(`\n### ${rel}`);
    for (const e of entrees) console.log(`  ${e.id}  ${e.titre}`);
  }
  process.exit(0);
}

/* ------------------------------------------------------------
   RAPPORT
   ------------------------------------------------------------ */
let ta = 0, tb = 0, tn = 0;
console.log(`mode : ${MODE}   seuil : ${SEUIL} lignes\n`);
console.log("fichier                blocs     avant     apres    gagne      %");
console.log("-".repeat(70));
for (const s of stats.sort((a, b) => (b.avant - b.apres) - (a.avant - a.apres))) {
  const g = s.avant - s.apres;
  ta += s.avant; tb += s.apres; tn += s.n;
  console.log(
    s.rel.padEnd(20) + String(s.n).padStart(6) + String(s.avant).padStart(10) +
    String(s.apres).padStart(10) + String(g).padStart(9) +
    ((g / s.avant * 100).toFixed(1) + "%").padStart(7)
  );
}
console.log("-".repeat(70));
console.log(`TOTAL${String(tn).padStart(21)}${String(ta).padStart(10)}${String(tb).padStart(10)}${String(ta - tb).padStart(9)}${((ta - tb) / ta * 100).toFixed(1).padStart(6)}%`);
console.log(`\n~tokens liberes : ${Math.round((ta - tb) / 3.5)}`);
