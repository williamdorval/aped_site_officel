// Fusionne les feuilles de chantier dans `css/app.css`, qui reste LA SEULE
// SOURCE. Chaque feuille a ete ecrite en parallele par un chantier different
// pour eviter que deux mains ecrivent le meme fichier ; une fois posee, elle
// disparait.
//
//   node tools/css-fusion.mjs [--sec]
//
// L'ORDRE COMPTE : les feuilles de page redefinissent volontairement des
// regles du socle (le filet entre deux bandes, le gris discret sur silk).
// Elles se posent donc APRES, jamais avant.
//
// `--sec` montre ce qui serait fait sans rien ecrire.
import { readFileSync, writeFileSync, existsSync, unlinkSync, readdirSync, rmdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const RACINE = join(dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = join(RACINE, 'refonte-adexweb', 'css-a-fusionner');
const CIBLE = join(RACINE, 'css', 'app.css');
const sec = process.argv.includes('--sec');

const ORDRE = ['modales.css', 'pages.css', 'visuel.css'];

if (!existsSync(SOURCE)) { console.error(`ARRET : ${SOURCE} introuvable.`); process.exit(1); }
if (!existsSync(CIBLE)) { console.error(`ARRET : ${CIBLE} introuvable.`); process.exit(1); }

const presentes = readdirSync(SOURCE).filter((f) => f.endsWith('.css'));
const inconnues = presentes.filter((f) => !ORDRE.includes(f));
if (inconnues.length) {
  console.error(`ARRET : feuille(s) non declaree(s) dans l'ordre de fusion — ${inconnues.join(', ')}`);
  console.error("Ajoute-la a ORDRE, a sa place : l'ordre decide qui gagne.");
  process.exit(1);
}

const app = readFileSync(CIBLE, 'utf8').replace(/\r\n/g, '\n');
let sortie = app.trimEnd();
let posees = 0;
let lignes = 0;

for (const nom of ORDRE) {
  const chemin = join(SOURCE, nom);
  if (!existsSync(chemin)) { console.log(`${nom.padEnd(14)} absente, ignoree`); continue; }
  const feuille = readFileSync(chemin, 'utf8').replace(/\r\n/g, '\n').trim();
  if (feuille.length < 200) { console.error(`ARRET : ${nom} ne fait que ${feuille.length} octets.`); process.exit(1); }

  // Une cloture de commentaire cassee avale la regle suivante, et l'outil
  // rend « ok ». On compte les ouvertures et les fermetures.  Piege 75
  const ouv = (feuille.match(/\/\*/g) || []).length;
  const fer = (feuille.match(/\*\//g) || []).length;
  if (ouv !== fer) {
    console.error(`ARRET : ${nom} porte ${ouv} « /* » et ${fer} « */ ». Un commentaire n'est pas clos.`);
    process.exit(1);
  }
  const acc = (feuille.match(/\{/g) || []).length - (feuille.match(/\}/g) || []).length;
  if (acc !== 0) {
    console.error(`ARRET : ${nom} a ${acc > 0 ? acc + ' accolade(s) ouverte(s)' : -acc + ' accolade(s) en trop'}.`);
    process.exit(1);
  }

  sortie += `\n\n/* ===================================================================\n`
    + `   FUSIONNE DEPUIS ${nom}\n`
    + `   =================================================================== */\n\n`
    + feuille;
  posees++;
  lignes += feuille.split('\n').length;
  console.log(`${nom.padEnd(14)} ${String(feuille.split('\n').length).padStart(5)} lignes`);
}

if (posees === 0) { console.error('ARRET : aucune feuille fusionnee.'); process.exit(1); }

if (sec) { console.log(`\n[--sec] ${posees} feuilles, ${lignes} lignes. Rien n'a ete ecrit.`); process.exit(0); }

writeFileSync(CIBLE, sortie + '\n', 'utf8');
for (const nom of ORDRE) {
  const chemin = join(SOURCE, nom);
  if (existsSync(chemin)) unlinkSync(chemin);
}
if (readdirSync(SOURCE).length === 0) rmdirSync(SOURCE);

const total = sortie.split('\n').length;
console.log(`\n${posees} feuilles fusionnees, ${lignes} lignes ajoutees. css/app.css fait ${total} lignes.`);
console.log('Lancer maintenant : node tools/css-critique.mjs puis node tools/cascade-check.mjs');
