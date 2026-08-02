/* ============================================================
   CE QUE COUTE CE DEPOT A LIRE.
   `node tools/contexte-mesure.mjs [ref] [--json]`

   Mesure l'etat COMMITE (`git show <ref>:fichier`) et non l'arbre de
   travail : une mesure de reference prise sur un arbre sale ne
   prouve rien.

   L'ESTIMATION DE JETONS. On compte les CARACTERES, pas les octets :
   le francais accentue en UTF-8 coute jusqu'a deux octets par lettre
   et gonflerait le chiffre sans que le modele lise davantage. Deux
   diviseurs, parce que la prose et le code ne se decoupent pas
   pareil : 3,6 caracteres par jeton pour le francais, 3,1 pour le
   code et le balisage. Ce sont des ordres de grandeur declares comme
   tels — le seul chiffre exact serait celui du tokeniseur.
   ============================================================ */
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, "..");
const REF = (process.argv[2] && !process.argv[2].startsWith("--")) ? process.argv[2] : "HEAD";
const JSON_OUT = process.argv.includes("--json");

function git(args) {
  return execFileSync("git", args, { cwd: RACINE, encoding: "utf8", maxBuffer: 256 * 1024 * 1024 });
}

const fichiers = git(["ls-tree", "-r", "--name-only", REF]).split("\n").filter(Boolean);

/* Ce qui est charge d'office a chaque tour de chaque session. La
   liste n'est pas devinee : `CLAUDE.md` du projet est lu par le
   harnais, plus tout ce qu'il declare importer. */
const AUTO = new Set(["CLAUDE.md"]);

const TEXTE = /\.(md|txt|json|mjs|js|css|html|svg)$/i;
const PROSE = /\.(md|txt)$/i;

const lignes = [];
let binaires = 0, octetsBinaires = 0;

for (const f of fichiers) {
  let buf;
  try { buf = execFileSync("git", ["show", `${REF}:${f}`], { cwd: RACINE, maxBuffer: 256 * 1024 * 1024 }); }
  catch (e) { continue; }
  if (!TEXTE.test(f)) { binaires++; octetsBinaires += buf.length; continue; }
  const s = buf.toString("utf8");
  const car = s.length;
  const nl = s.split("\n").length;
  const div = PROSE.test(f) ? 3.6 : 3.1;
  lignes.push({
    f,
    octets: buf.length,
    car,
    lignes: nl,
    jetons: Math.round(car / div),
    auto: AUTO.has(f),
    genre: PROSE.test(f) ? "prose" : "code",
  });
}

lignes.sort((a, b) => b.jetons - a.jetons);

const total = lignes.reduce((a, l) => a + l.jetons, 0);
const autoL = lignes.filter((l) => l.auto);
const autoT = autoL.reduce((a, l) => a + l.jetons, 0);

if (JSON_OUT) {
  console.log(JSON.stringify({ ref: REF, total, autoT, lignes, binaires, octetsBinaires }, null, 1));
} else {
  const g = (n) => n.toLocaleString("fr-CA").replace(/ | /g, " ");
  console.log(`\n=== ${REF} · ${lignes.length} fichiers texte · ${binaires} binaires (${g(Math.round(octetsBinaires / 1024))} Ko) ===\n`);
  console.log("fichier".padEnd(46) + "octets".padStart(9) + "lignes".padStart(8) + "jetons~".padStart(9) + "  auto");
  console.log("-".repeat(76));
  for (const l of lignes) {
    if (l.jetons < 300 && !l.auto) continue;
    console.log(
      l.f.padEnd(46) + g(l.octets).padStart(9) + g(l.lignes).padStart(8) +
      g(l.jetons).padStart(9) + (l.auto ? "   OUI" : "")
    );
  }
  const petits = lignes.filter((l) => l.jetons < 300 && !l.auto);
  console.log("-".repeat(76));
  console.log(`${petits.length} fichiers sous 300 jetons`.padEnd(46) +
    g(petits.reduce((a, l) => a + l.octets, 0)).padStart(9) + "".padStart(8) +
    g(petits.reduce((a, l) => a + l.jetons, 0)).padStart(9));
  console.log("-".repeat(76));
  console.log("TOTAL DU DEPOT (texte)".padEnd(46) +
    g(lignes.reduce((a, l) => a + l.octets, 0)).padStart(9) +
    g(lignes.reduce((a, l) => a + l.lignes, 0)).padStart(8) +
    g(total).padStart(9));
  console.log("\nCHARGE D'OFFICE A CHAQUE TOUR :");
  for (const l of autoL) console.log("  " + l.f.padEnd(30) + g(l.jetons).padStart(8) + " jetons");
  console.log("  " + "TOTAL AUTO".padEnd(30) + g(autoT).padStart(8) + " jetons");
}
