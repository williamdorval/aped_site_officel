// Telecharge les woff2 variables des polices candidates depuis Google Fonts,
// pour les AUTO-HEBERGER. Aucune requete tierce ne subsiste a l'execution.
// Usage : node refonte-adexweb/telecharger-polices.mjs
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ici = dirname(fileURLToPath(import.meta.url));
const src = join(ici, 'polices-src');
const dest = join(ici, 'polices');
mkdirSync(dest, { recursive: true });

// On ne garde que latin et latin-ext : le francais du Quebec n'a besoin
// de rien d'autre. Le vietnamien et le grec seraient du poids mort.
const SOUS_ENSEMBLES = ['latin', 'latin-ext'];

const familles = process.argv.slice(2);
if (familles.length === 0) {
  console.error('ARRET : aucune famille passee en argument.');
  process.exit(1);
}

let telecharges = 0;

for (const famille of familles) {
  const chemin = join(src, `${famille}.css`);
  if (!existsSync(chemin)) {
    console.error(`ARRET : ${chemin} introuvable.`);
    process.exit(1);
  }
  const css = readFileSync(chemin, 'utf8');

  // Le CSS de Google annonce chaque bloc par un commentaire de sous-ensemble.
  const blocs = css.split('/* ').slice(1);
  for (const bloc of blocs) {
    const sousEnsemble = bloc.slice(0, bloc.indexOf(' */'));
    if (!SOUS_ENSEMBLES.includes(sousEnsemble)) continue;

    const style = /font-style:\s*(\w+)/.exec(bloc)?.[1] ?? 'normal';
    const url = /src:\s*url\((https:[^)]+)\)/.exec(bloc)?.[1];
    if (!url) {
      console.error(`ARRET : pas d'URL dans le bloc ${famille}/${sousEnsemble}.`);
      process.exit(1);
    }

    const nom = `${famille.toLowerCase()}-${sousEnsemble}${style === 'italic' ? '-italique' : ''}.woff2`;
    const rep = await fetch(url);
    if (!rep.ok) {
      console.error(`ARRET : ${url} rend ${rep.status}.`);
      process.exit(1);
    }
    const octets = Buffer.from(await rep.arrayBuffer());
    if (octets.length < 2000) {
      console.error(`ARRET : ${nom} ne fait que ${octets.length} octets.`);
      process.exit(1);
    }
    writeFileSync(join(dest, nom), octets);
    console.log(`${nom.padEnd(44)} ${(octets.length / 1024).toFixed(1)} Ko`);
    telecharges++;
  }
}

if (telecharges === 0) {
  console.error('ARRET : zero fichier telecharge.');
  process.exit(1);
}
console.log(`\n${telecharges} fichiers dans ${dest}`);
