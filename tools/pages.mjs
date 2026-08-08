// Injecte les partiels partages dans les pages servies.
//
//   node tools/pages.mjs ecrire     met les pages a jour
//   node tools/pages.mjs verifier   ARRETE si une page a decroche
//
// Pourquoi un injecteur : l'en-tete, le pied, le jeu d'icones, les modales et
// les datalistes vivent sur SEPT pages. Recopies a la main, ils derivent — et
// une derive d'en-tete ne se voit pas, elle se decouvre six semaines plus
// tard sur la seule page que personne ne regarde.
//
// La page est a la fois la source et la sortie : le partiel s'ecrit ENTRE
// deux bornes, comme le fait deja `tools/conditions.mjs` pour les conditions
// du programme de reference. Il n'y a pas de dossier `src/` a tenir en
// parallele.  D-833
//
// Marqueur, dans la page :
//     <!-- PARTIEL:entete:DEBUT -->  ...  <!-- PARTIEL:entete:FIN -->
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const RACINE = join(dirname(fileURLToPath(import.meta.url)), '..');
const DOSSIER = join(RACINE, 'partiels');
const mode = process.argv[2];

if (mode !== 'ecrire' && mode !== 'verifier') {
  console.error('ARRET : usage node tools/pages.mjs ecrire|verifier');
  process.exit(1);
}
if (!existsSync(DOSSIER)) {
  console.error(`ARRET : ${DOSSIER} introuvable.`);
  process.exit(1);
}

const partiels = {};
for (const f of readdirSync(DOSSIER)) {
  if (!f.endsWith('.html')) continue;
  partiels[f.slice(0, -5)] = readFileSync(join(DOSSIER, f), 'utf8').replace(/\r\n/g, '\n').trim();
}
if (Object.keys(partiels).length === 0) {
  console.error('ARRET : aucun partiel dans partiels/.');
  process.exit(1);
}

const pages = readdirSync(RACINE).filter((f) => f.endsWith('.html'));
if (pages.length === 0) {
  console.error('ARRET : aucune page HTML a la racine.');
  process.exit(1);
}

let poses = 0;
let touchees = 0;
const decrochees = [];
const inconnus = [];

for (const page of pages) {
  const chemin = join(RACINE, page);
  const avant = readFileSync(chemin, 'utf8');
  // Le depot est en CRLF : `.` ne matche pas `\r`, et une regex multiligne
  // echouerait en silence. On normalise, on traite, on rend du LF.
  const source = avant.replace(/\r\n/g, '\n');

  let apres = source;
  let dansCettePage = 0;

  apres = apres.replace(
    /(<!-- PARTIEL:([a-z0-9-]+):DEBUT -->)\n?[\s\S]*?\n?(<!-- PARTIEL:\2:FIN -->)/g,
    (tout, ouvre, nom, ferme) => {
      if (!(nom in partiels)) { inconnus.push(`${page} → ${nom}`); return tout; }
      dansCettePage++;
      // La page peut demander un partiel avec un contexte : `data-page`
      // marque le lien courant de la navigation.
      return `${ouvre}\n${partiels[nom]}\n${ferme}`;
    },
  );

  if (dansCettePage === 0) continue;
  poses += dansCettePage;

  // La navigation marque sa propre page : `aria-current` ET un filet, jamais
  // la couleur seule. La cle vient d'un attribut du <body>.
  const cle = /<body[^>]*\bdata-page="([a-z0-9-]+)"/.exec(source)?.[1];
  if (cle) {
    apres = apres.replace(
      new RegExp(`(<a[^>]*\\sdata-page="${cle}")([^>]*)>`, 'g'),
      (t, tete, reste) => (reste.includes('aria-current') ? t : `${tete}${reste} aria-current="page">`),
    );
  }

  if (apres !== source) {
    if (mode === 'verifier') { decrochees.push(page); continue; }
    writeFileSync(chemin, apres, 'utf8');
    touchees++;
    console.log(`${page.padEnd(26)} ${dansCettePage} partiel(s)`);
  } else {
    console.log(`${page.padEnd(26)} ${dansCettePage} partiel(s) — deja a jour`);
  }
}

if (inconnus.length) {
  console.error(`\nARRET : partiel(s) demande(s) mais absent(s) de partiels/ :`);
  for (const i of inconnus) console.error(`  · ${i}`);
  process.exit(1);
}

// Zero borne trouvee sur tout le depot n'est pas « rien a faire » : c'est un
// outil qui ne controle plus rien, et qui se lirait comme un succes.
if (poses === 0) {
  console.error('\nARRET : aucune borne PARTIEL trouvee dans les pages.');
  process.exit(1);
}

if (mode === 'verifier') {
  if (decrochees.length) {
    console.error(`\nARRET : ${decrochees.length} page(s) ont decroche de leurs partiels — ${decrochees.join(', ')}`);
    console.error('Lancer : node tools/pages.mjs ecrire');
    process.exit(1);
  }
  console.log(`\n${poses} partiels poses dans ${pages.length} pages : a jour.`);
} else {
  console.log(`\n${poses} partiels poses. ${touchees} page(s) reecrite(s).`);
}
