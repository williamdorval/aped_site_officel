// Fabrique les declinaisons du logo depuis les PNG bruts de `logo/`.
//
//   node tools/logo.mjs [--seuil 16]
//
// Ce que ca fait : remplissage par diffusion depuis les QUATRE coins, pour ne
// rendre transparent que le fond CONTIGU — un remplacement global de couleur
// mangerait le « D » de marbre, qui est presque de la teinte du fond. Puis
// recadrage sur le contenu reel, et sortie en 1x et 2x.
//
// L'outil ARRETE si le detourage rend moins de 2 % ou plus de 98 % de l'image
// transparente : dans les deux cas le seuil est faux et l'image est perdue.
import { chromium } from 'playwright';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const RACINE = join(dirname(fileURLToPath(import.meta.url)), '..');
const seuilArg = process.argv.indexOf('--seuil');
const SEUIL = seuilArg > -1 ? Number(process.argv[seuilArg + 1]) : 16;

// `bichrome` : les lettres de MARBRE (le D et le B) tombent a 1,2:1 sur le
// fond blanc — a 28 px de haut dans l'en-tete, le logotype se lirait
// « A_EXWE_ ». On en tire une declinaison ou le marbre devient navy et ou
// seul le champagne reste : c'est la meme forme, lisible en petit.  D-831
const PIECES = [
  { src: 'logo/logo_adexweb.png',     nom: 'logo-marque',  hauteurs: [64, 128, 256], bichrome: true },
  { src: 'logo/logo_adexweb_nom.png', nom: 'logo-complet', hauteurs: [40, 80, 160], bichrome: true },
];

const NAVY = [34, 45, 82];         /* --navy   #222D52 */
const CHAMPAGNE = [185, 155, 107]; /* --champagne-dark #B99B6B */

const nav = await chromium.launch();
const page = await nav.newPage();
mkdirSync(join(RACINE, 'images', 'logo'), { recursive: true });

for (const piece of PIECES) {
  const chemin = resolve(RACINE, piece.src);
  if (!existsSync(chemin)) { console.error(`ARRET : ${chemin} introuvable.`); process.exit(1); }

  // On passe l'image en `data:` : un `file://` charge dans une page vierge
  // salit le canvas et `getImageData` leve une erreur de securite.
  const url = `data:image/png;base64,${readFileSync(chemin).toString('base64')}`;

  const resultat = await page.evaluate(async ({ url, seuil }) => {
    const img = new Image();
    img.src = url;
    await img.decode();
    const c = document.createElement('canvas');
    c.width = img.naturalWidth; c.height = img.naturalHeight;
    const ctx = c.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(img, 0, 0);
    const d = ctx.getImageData(0, 0, c.width, c.height);
    const p = d.data, L = c.width, H = c.height;

    // La couleur de fond est celle du coin haut-gauche.
    const fond = [p[0], p[1], p[2]];
    const proche = (i) =>
      Math.abs(p[i] - fond[0]) <= seuil &&
      Math.abs(p[i + 1] - fond[1]) <= seuil &&
      Math.abs(p[i + 2] - fond[2]) <= seuil;

    // Diffusion depuis les quatre coins, en file (pas en recursion : une
    // image de 1200 px ferait deborder la pile).
    const vu = new Uint8Array(L * H);
    const file = [0, L - 1, (H - 1) * L, H * L - 1];
    for (const d0 of file) vu[d0] = 1;
    let tete = 0;
    while (tete < file.length) {
      const n = file[tete++];
      const i = n * 4;
      if (!proche(i)) { vu[n] = 2; continue; }   // 2 = touche, mais pas du fond
      p[i + 3] = 0;
      const x = n % L, y = (n / L) | 0;
      const voisins = [];
      if (x > 0) voisins.push(n - 1);
      if (x < L - 1) voisins.push(n + 1);
      if (y > 0) voisins.push(n - L);
      if (y < H - 1) voisins.push(n + L);
      for (const v of voisins) if (!vu[v]) { vu[v] = 1; file.push(v); }
    }

    // Recadrage sur ce qui reste opaque.
    let x0 = L, y0 = H, x1 = -1, y1 = -1, opaques = 0;
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < L; x++) {
        if (p[(y * L + x) * 4 + 3] > 8) {
          opaques++;
          if (x < x0) x0 = x; if (x > x1) x1 = x;
          if (y < y0) y0 = y; if (y > y1) y1 = y;
        }
      }
    }
    if (x1 < 0) return { erreur: 'tout est transparent' };

    ctx.putImageData(d, 0, 0);
    const marge = 2;
    x0 = Math.max(0, x0 - marge); y0 = Math.max(0, y0 - marge);
    x1 = Math.min(L - 1, x1 + marge); y1 = Math.min(H - 1, y1 + marge);
    const lc = x1 - x0 + 1, hc = y1 - y0 + 1;

    const coupe = document.createElement('canvas');
    coupe.width = lc; coupe.height = hc;
    coupe.getContext('2d').drawImage(c, x0, y0, lc, hc, 0, 0, lc, hc);
    return {
      part: opaques / (L * H),
      largeur: lc, hauteur: hc,
      source: coupe.toDataURL('image/png'),
    };
  }, { url, seuil: SEUIL });

  if (resultat.erreur) { console.error(`ARRET : ${piece.src} — ${resultat.erreur}`); process.exit(1); }
  if (resultat.part < 0.02 || resultat.part > 0.98) {
    console.error(`ARRET : ${piece.src} — ${(resultat.part * 100).toFixed(1)} % d'opaque apres detourage. Le seuil ${SEUIL} est faux.`);
    process.exit(1);
  }
  console.log(`${piece.src}  ->  ${resultat.largeur} x ${resultat.hauteur}, ${(resultat.part * 100).toFixed(1)} % d'encre`);

  const versions = [{ suffixe: '', mono: null }];
  if (piece.bichrome) versions.push({ suffixe: '-bi', mono: { navy: NAVY, champagne: CHAMPAGNE } });

  for (const v of versions) {
    for (const h of piece.hauteurs) {
      const png = await page.evaluate(async ({ src, hauteur, ratio, mono }) => {
        const img = new Image(); img.src = src; await img.decode();
        const c = document.createElement('canvas');
        c.height = hauteur; c.width = Math.round(hauteur * ratio);
        const ctx = c.getContext('2d', { willReadFrequently: true });
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, c.width, c.height);

        if (mono) {
          const d = ctx.getImageData(0, 0, c.width, c.height);
          const p = d.data;
          for (let i = 0; i < p.length; i += 4) {
            if (p[i + 3] === 0) continue;
            // Le champagne est la seule matiere FRANCHEMENT chaude : dans les
            // barres, le rouge depasse le bleu de ~72. Le marbre a lui aussi
            // des grains chauds, mais faibles — a 24 d'ecart ils passaient, et
            // le « B » se mouchetait d'or. Le seuil est a 48.  D-831
            const chaud = p[i] > p[i + 2] + 48;
            const teinte = chaud ? mono.champagne : mono.navy;
            p[i] = teinte[0]; p[i + 1] = teinte[1]; p[i + 2] = teinte[2];
          }
          ctx.putImageData(d, 0, 0);
        }
        return c.toDataURL('image/png');
      }, { src: resultat.source, hauteur: h, ratio: resultat.largeur / resultat.hauteur, mono: v.mono });

      const sortie = join(RACINE, 'images', 'logo', `${piece.nom}${v.suffixe}-${h}.png`);
      const octets = Buffer.from(png.split(',')[1], 'base64');
      if (octets.length < 300) { console.error(`ARRET : ${sortie} ne fait que ${octets.length} octets.`); process.exit(1); }
      writeFileSync(sortie, octets);
      console.log(`   images/logo/${piece.nom}${v.suffixe}-${h}.png   ${(octets.length / 1024).toFixed(1)} Ko`);
    }
  }
}

/* == LA PASTILLE — favicon et icone d'ecran d'accueil ==
   Un favicon transparent disparait sur le chrome sombre d'un navigateur. La
   pastille est donc un carre navy plein, avec le monogramme en perle et ses
   deux barres en champagne : elle se voit sur n'importe quel fond.  D-832 */
{
  const src = `data:image/png;base64,${readFileSync(join(RACINE, 'images', 'logo', 'logo-marque-256.png')).toString('base64')}`;
  for (const taille of [32, 180, 512]) {
    const png = await page.evaluate(async ({ src, taille, navy, champagne }) => {
      const img = new Image(); img.src = src; await img.decode();
      const c = document.createElement('canvas');
      c.width = c.height = taille;
      const ctx = c.getContext('2d', { willReadFrequently: true });

      ctx.fillStyle = `rgb(${navy.join(' ')})`;
      const r = Math.round(taille * 0.18);
      ctx.beginPath(); ctx.roundRect(0, 0, taille, taille, r); ctx.fill();

      // Le monogramme occupe 68 % du carre, centre optiquement.
      const marge = taille * 0.16;
      const dispo = taille - marge * 2;
      const ratio = img.naturalWidth / img.naturalHeight;
      const l = ratio >= 1 ? dispo : dispo * ratio;
      const h = ratio >= 1 ? dispo / ratio : dispo;

      const tampon = document.createElement('canvas');
      tampon.width = Math.max(1, Math.round(l)); tampon.height = Math.max(1, Math.round(h));
      const tc = tampon.getContext('2d', { willReadFrequently: true });
      tc.imageSmoothingQuality = 'high';
      tc.drawImage(img, 0, 0, tampon.width, tampon.height);
      const d = tc.getImageData(0, 0, tampon.width, tampon.height);
      const p = d.data;
      for (let i = 0; i < p.length; i += 4) {
        if (p[i + 3] === 0) continue;
        const chaud = p[i] > p[i + 2] + 48;
        const t = chaud ? champagne : [253, 255, 255];
        p[i] = t[0]; p[i + 1] = t[1]; p[i + 2] = t[2];
      }
      tc.putImageData(d, 0, 0);
      ctx.drawImage(tampon, (taille - tampon.width) / 2, (taille - tampon.height) / 2);
      return c.toDataURL('image/png');
    }, { src, taille, navy: NAVY, champagne: [210, 182, 138] });

    const nom = taille === 180 ? 'apple-touch-icon.png' : `favicon-${taille}.png`;
    const octets = Buffer.from(png.split(',')[1], 'base64');
    if (octets.length < 200) { console.error(`ARRET : ${nom} ne fait que ${octets.length} octets.`); process.exit(1); }
    writeFileSync(join(RACINE, 'images', nom), octets);
    console.log(`   images/${nom}   ${(octets.length / 1024).toFixed(1)} Ko`);
  }
}

await nav.close();
