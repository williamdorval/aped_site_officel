// Verifie que CHAQUE couple texte/fond declare dans `css/tokens.css` tient le
// contraste qu'on lui prete. Les ratios ecrits dans les commentaires du fichier
// sont RELUS et compares au calcul : un commentaire qui ment est une erreur.
//
//   node tools/palette-check.mjs
//
// Arrete sur le premier couple interdit. Zero couple examine ARRETE aussi.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const RACINE = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = readFileSync(join(RACINE, 'css', 'tokens.css'), 'utf8');

// Le fichier est en CRLF. `.` ne matche pas `\r` : on normalise avant tout
// autre traitement, sinon les regex de fin de ligne echouent en silence.
const texte = source.replace(/\r\n/g, '\n');

function jetons(src) {
  const table = {};
  for (const [, nom, valeur] of src.matchAll(/^\s*--([a-z0-9-]+):\s*(#[0-9A-Fa-f]{6})\s*;/gm)) {
    table[nom] = valeur.toLowerCase();
  }
  return table;
}

function canal(v) {
  const c = v / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}
function luminance(hex) {
  const n = parseInt(hex.slice(1), 16);
  return 0.2126 * canal((n >> 16) & 255) + 0.7152 * canal((n >> 8) & 255) + 0.0722 * canal(n & 255);
}
function ratio(a, b) {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

const J = jetons(texte);
const attendus = ['pearl', 'silk', 'marble', 'navy', 'navy-dark', 'navy-light',
  'champagne', 'champagne-dark', 'text', 'text-soft', 'text-muted', 'danger', 'ok'];
const absents = attendus.filter((n) => !J[n]);
if (absents.length) {
  console.error(`ARRET : jetons absents de css/tokens.css — ${absents.join(', ')}`);
  process.exit(1);
}

const FONDS = ['pearl', 'silk', 'marble'];

// Ce que la regle autorise. `min` est le plancher WCAG applicable :
//   4.5 texte courant · 3 texte >= 24 px et element d'interface porteur de sens.
// `vise` est ce qu'on s'impose en plus, quand on l'a promis.
const REGLES = [
  { encre: 'text', fonds: FONDS, min: 4.5, vise: 7, quoi: 'texte courant' },
  { encre: 'text-soft', fonds: FONDS, min: 4.5, vise: 6, quoi: 'texte secondaire' },
  { encre: 'text-muted', fonds: ['pearl'], min: 4.5, vise: 4.5, quoi: 'mentions, sur pearl SEULEMENT' },
  { encre: 'navy', fonds: FONDS, min: 4.5, vise: 7, quoi: 'titres et boutons' },
  { encre: 'navy-dark', fonds: FONDS, min: 4.5, vise: 7, quoi: 'titres appuyes' },
  { encre: 'navy-light', fonds: FONDS, min: 4.5, vise: 4.5, quoi: 'appui' },
  { encre: 'danger', fonds: ['pearl', 'danger-wash'], min: 4.5, vise: 4.5, quoi: 'refus' },
  { encre: 'ok', fonds: ['pearl', 'ok-wash'], min: 4.5, vise: 4.5, quoi: 'confirmation' },
  { encre: 'pearl', fonds: ['navy', 'navy-dark'], min: 4.5, vise: 7, quoi: 'texte sur aplat fonce' },
  // La SEULE facon dont le champagne porte du texte : en FOND, pas en encre.
  { encre: 'navy-dark', fonds: ['champagne-light', 'champagne'], min: 4.5, vise: 7, quoi: 'etiquette sur aplat champagne' },
  { encre: 'champagne-light', fonds: ['navy-dark'], min: 4.5, vise: 7, quoi: 'texte discret du pied de page' },
];

// Ce que la regle INTERDIT, et qui doit rester interdit. Un jour ou l'un de
// ces couples passerait, c'est que quelqu'un a fonce la couleur sans le dire.
const INTERDITS = [
  { encre: 'champagne', fond: 'pearl', pourquoi: 'le champagne ne porte pas de texte' },
  { encre: 'champagne-dark', fond: 'pearl', pourquoi: 'meme fonce, il echoue au 3:1 d\'une icone porteuse de sens' },
  { encre: 'text-muted', fond: 'silk', pourquoi: 'mesure a moins de 4,5:1' },
  { encre: 'text-muted', fond: 'marble', pourquoi: 'mesure a moins de 4,5:1' },
];

let examines = 0;
const echecs = [];
const sous = [];

console.log('COUPLES AUTORISES\n');
for (const r of REGLES) {
  for (const f of r.fonds) {
    if (!J[f]) { console.error(`ARRET : fond inconnu — ${f}`); process.exit(1); }
    const v = ratio(J[r.encre], J[f]);
    examines++;
    const etat = v < r.min ? 'ECHEC' : v < r.vise ? 'sous la visee' : 'ok';
    if (v < r.min) echecs.push(`${r.encre} sur ${f} = ${v.toFixed(2)}:1, plancher ${r.min}`);
    else if (v < r.vise) sous.push(`${r.encre} sur ${f} = ${v.toFixed(2)}:1, visee ${r.vise}`);
    console.log(`  ${(r.encre + ' sur ' + f).padEnd(30)} ${v.toFixed(2).padStart(6)}:1   ${etat.padEnd(14)} ${r.quoi}`);
  }
}

console.log('\nCOUPLES QUI DOIVENT RESTER INTERDITS\n');
for (const i of INTERDITS) {
  const v = ratio(J[i.encre], J[i.fond]);
  examines++;
  const tenu = v < 4.5;
  if (!tenu) echecs.push(`${i.encre} sur ${i.fond} passe a ${v.toFixed(2)}:1 — l'interdit n'a plus de raison d'etre, relire la regle`);
  console.log(`  ${(i.encre + ' sur ' + i.fond).padEnd(30)} ${v.toFixed(2).padStart(6)}:1   ${tenu ? 'interdit tenu' : 'ANOMALIE'}      ${i.pourquoi}`);
}

// Un outil qui n'examine rien rend « 0 echec » et se lit comme « tout va bien ».
if (examines === 0) {
  console.error('\nARRET : zero couple examine.');
  process.exit(1);
}

console.log(`\n${examines} couples examines.`);
if (sous.length) {
  console.log(`\n${sous.length} sous la visee (WCAG AA tenu, AAA non) :`);
  for (const s of sous) console.log(`  · ${s}`);
}
if (echecs.length) {
  console.error(`\n${echecs.length} ECHEC(S) :`);
  for (const e of echecs) console.error(`  · ${e}`);
  process.exit(1);
}
console.log('\nAucun echec.');
