/* ============================================================
   LES LONGS COMMENTAIRES PARTENT AU JOURNAL.
   `node tools/decisions-extraire.mjs <fichier> [--min=5] [--faire]`

   Sans `--faire`, il ne fait que RENDRE COMPTE. C'est voulu : une
   passe qui reecrit 12 000 jetons de commentaires doit d'abord se
   montrer.

   POURQUOI. Mesure du 2026-08-03 : 23 % du source de ce depot est du
   commentaire — 32 % pour `css/app.css`, 45 % pour `js/sas.js`. Le
   detail est paye a CHAQUE lecture du fichier, pour une information
   dont on a besoin une fois sur cinquante. La regle du projet est
   deja ecrite : ce qui explique une DECISION va au journal, ce qui
   explique LE CODE reste dans le code, en une ligne.

   CE QUI PART, ET CE QUI RESTE.
     · un bloc de moins de `--min` lignes ne bouge pas : c'est deja
       une ligne de code ;
     · un bloc plus long part au journal, et laisse dans le code sa
       PREMIERE PHRASE plus son identifiant. `grep D-042` retrouve
       toujours les deux bouts ;
     · un bloc SANS identifiant ne bouge pas et il est SIGNALE. On ne
       frappe pas d'identifiant automatiquement : un numero invente
       entre en collision avec le journal a la premiere occasion.

   LES GARDE-FOUS, et ils ne sont pas negociables.
     · le compte de `/*` et de `*/` doit etre identique avant et
       apres — une cloture cassee avale la regle suivante et l'outil
       de controle rend « ok » (piege 75) ;
     · aucun `/*` ne doit se retrouver imbrique dans un autre ;
     · zero bloc traite est une ERREUR, pas un resultat (piege 86) ;
     · et la vraie preuve est ailleurs : `cascade-check` doit rendre
       0 ecart, et une planche doit rendre 0,0000 % d'ecart de pixels.
       Un commentaire ne se peint pas — s'il change quelque chose a
       l'image, c'est qu'on a coupe du code.
   ============================================================ */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, "..");

const CIBLE = process.argv[2];
const FAIRE = process.argv.includes("--faire");
const argMin = process.argv.find((a) => a.startsWith("--min="));
const MIN = argMin ? +argMin.slice(6) : 5;

if (!CIBLE) {
  console.error("usage : node tools/decisions-extraire.mjs <fichier> [--min=5] [--faire]");
  process.exit(2);
}

const MARQUES = {
  ".css": ["/*", "*/"],
  ".js": ["/*", "*/"],
  ".mjs": ["/*", "*/"],
  ".html": ["<!--", "-->"],
};
const ext = path.extname(CIBLE);
const [OUV, FER] = MARQUES[ext] || MARQUES[".js"];

const src = path.join(RACINE, CIBLE);
let texte = fs.readFileSync(src, "utf8");

const ouvAvant = texte.split(OUV).length - 1;
const ferAvant = texte.split(FER).length - 1;

const journal = path.join(RACINE, "decisions", CIBLE.replace(/[\/\\]/g, "-").replace(/\.\w+$/, "") + ".md");

/* La premiere phrase du bloc, coupee au mot. C'est elle qui reste
   dans le code : elle doit dire CE QUE FAIT la regle, pas pourquoi. */
function premierePhrase(corps) {
  const plat = corps
    .split("\n")
    .map((l) => l.replace(/^\s*\*?\s?/, "").trim())
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
  let p = plat.split(/(?<=[.!?])\s/)[0] || plat;
  /* Un identifiant en fin de titre est du bruit dans la ligne
     laissee : on le remet nous-memes, une seule fois. */
  p = p.replace(/\s*D-\d+\s*$/, "").replace(/\s*[—–-]\s*$/, "").trim();
  if (p.length > 78) {
    p = p.slice(0, 78);
    p = p.slice(0, p.lastIndexOf(" ")) + "…";
  }
  return p;
}

/* == Le decoupage == */
const blocs = [];
{
  let i = 0;
  while ((i = texte.indexOf(OUV, i)) >= 0) {
    const j = texte.indexOf(FER, i + OUV.length);
    if (j < 0) break;
    const fin = j + FER.length;
    blocs.push({ i, fin, t: texte.slice(i, fin) });
    i = fin;
  }
}

const longs = blocs.filter((b) => b.t.split("\n").length >= MIN);
const sansId = [];
const aFaire = [];

for (const b of longs) {
  const m = /D-(\d+)/.exec(b.t);
  if (!m) { sansId.push(b); continue; }
  const id = "D-" + m[1];
  /* L'indentation de la ligne d'ouverture se conserve : une ligne
     desalignee dans une regle CSS se voit tout de suite. */
  const avantLigne = texte.slice(texte.lastIndexOf("\n", b.i) + 1, b.i);
  const indent = /^\s*$/.test(avantLigne) ? avantLigne : "";
  const corps = b.t.slice(OUV.length, b.t.length - FER.length);
  const phrase = premierePhrase(corps);
  aFaire.push({ ...b, id, indent, corps, phrase });
}

console.log(`\n${CIBLE} · ${blocs.length} blocs, ${longs.length} de ${MIN} lignes ou plus`);
console.log(`  avec identifiant  : ${aFaire.length}`);
console.log(`  SANS identifiant  : ${sansId.length}  (laisses en place)`);
const poids = aFaire.reduce((a, b) => a + b.t.length, 0);
const apres = aFaire.reduce((a, b) => a + (b.indent + OUV + " " + b.phrase + "  " + b.id + " " + FER).length, 0);
console.log(`  poids deplace     : ${poids} → ${apres} caracteres  (~${Math.round((poids - apres) / 3.1)} jetons liberes)`);

if (sansId.length) {
  console.log("\n  --- blocs sans identifiant, a traiter a la main ---");
  for (const b of sansId.slice(0, 12)) {
    console.log("    l." + (texte.slice(0, b.i).split("\n").length) + "  " + premierePhrase(b.t).slice(0, 66));
  }
  if (sansId.length > 12) console.log(`    … et ${sansId.length - 12} autres`);
}

if (!FAIRE) {
  console.log("\n(passe a blanc — ajouter `--faire` pour ecrire)");
  process.exit(0);
}

if (!aFaire.length) {
  console.log("\n*** AUCUN BLOC A DEPLACER — rien n'est ecrit.");
  process.exit(1);
}

/* == L'ecriture. On remplace de la FIN vers le DEBUT : sinon chaque
   substitution decale toutes les positions suivantes. == */
let sortie = texte;
for (let k = aFaire.length - 1; k >= 0; k--) {
  const b = aFaire[k];
  const ligne = OUV + " " + b.phrase + "  " + b.id + " " + FER;
  sortie = sortie.slice(0, b.i) + ligne + sortie.slice(b.fin);
}

const ouvApres = sortie.split(OUV).length - 1;
const ferApres = sortie.split(FER).length - 1;
if (ouvApres !== ouvAvant || ferApres !== ferAvant) {
  console.log(`\n*** COMPTE DE COMMENTAIRES CHANGE : ${ouvAvant}/${ferAvant} → ${ouvApres}/${ferApres}. Rien n'est ecrit.`);
  process.exit(1);
}
if (ouvApres !== ferApres) {
  console.log(`\n*** CLOTURES DESEQUILIBREES : ${ouvApres} / ${ferApres}. Rien n'est ecrit.`);
  process.exit(1);
}

/* == Le journal == */
let jn = fs.existsSync(journal) ? fs.readFileSync(journal, "utf8") : `# ${CIBLE} — le pourquoi\n\n> Ce que le code ne dit pas. Le code porte l'identifiant ; \`grep D-042\`\n> trouve les deux bouts.\n`;
const nl = (jn.match(/\r\n/g) || []).length > jn.split("\n").length / 2 ? "\r\n" : "\n";
let ajoutes = 0, deja = 0;
for (const b of aFaire) {
  if (new RegExp("^## " + b.id + "\\b", "m").test(jn)) { deja++; continue; }
  const corps = b.corps
    .split("\n")
    .map((l) => l.replace(/^\s*\*?\s?/, "").replace(/\s+$/, ""))
    .join(nl)
    .trim();
  jn = jn.replace(/\s*$/, "") + nl + nl + `## ${b.id} · ${b.phrase}` + nl + nl +
    `*Extrait de \`${CIBLE}\` le 2026-08-03.*` + nl + nl + corps + nl;
  ajoutes++;
}

fs.writeFileSync(journal, jn, "utf8");
fs.writeFileSync(src, sortie, "utf8");

console.log(`\n${CIBLE} : ${texte.length} → ${sortie.length} caracteres`);
console.log(`${path.relative(RACINE, journal)} : ${ajoutes} entree(s) ajoutee(s), ${deja} deja presente(s)`);
console.log(`commentaires : ${ouvApres} / ${ferApres}`);
console.log("\nMAINTENANT : `node tools/css-critique.mjs` puis `node tools/cascade-check.mjs` (0 ecart exige).");
