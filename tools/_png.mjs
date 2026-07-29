/* ============================================================
   DECODEUR PNG MINIMAL + DIFFERENCE DE PIXELS.

   POURQUOI CE FICHIER EXISTE.
   Le critere de reussite de ce chantier n'est pas une duree en
   millisecondes, c'est : « cinq captures d'une meme animation
   doivent se RESSEMBLER LE MOINS POSSIBLE ». Sans decodeur, on ne
   peut comparer que la taille des fichiers, ce qui ne dit rien.
   Aucune dependance n'est installee pour ca : `zlib` suffit.

   PORTEE : PNG 8 bits, non entrelace, couleur 2 (RGB) ou 6 (RGBA),
   ce que produit exactement `page.screenshot()` de Playwright.
   Tout le reste leve une erreur explicite plutot que de rendre
   des pixels faux.
   ============================================================ */
import zlib from "node:zlib";

const SIG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

export function decodePNG(buf) {
  for (let i = 0; i < 8; i++) {
    if (buf[i] !== SIG[i]) throw new Error("pas un PNG");
  }
  let off = 8;
  let w = 0, h = 0, depth = 0, color = 0, interlace = 0;
  const idat = [];
  while (off < buf.length) {
    const len = buf.readUInt32BE(off);
    const type = buf.toString("ascii", off + 4, off + 8);
    const data = buf.subarray(off + 8, off + 8 + len);
    if (type === "IHDR") {
      w = data.readUInt32BE(0);
      h = data.readUInt32BE(4);
      depth = data[8];
      color = data[9];
      interlace = data[12];
    } else if (type === "IDAT") {
      idat.push(data);
    } else if (type === "IEND") break;
    off += 12 + len;
  }
  if (depth !== 8) throw new Error("profondeur " + depth + " non geree");
  if (interlace !== 0) throw new Error("entrelacement non gere");
  const ch = color === 6 ? 4 : color === 2 ? 3 : color === 0 ? 1 : -1;
  if (ch < 0) throw new Error("type de couleur " + color + " non gere");

  const raw = zlib.inflateSync(Buffer.concat(idat));
  const stride = w * ch;
  const out = Buffer.alloc(h * stride);

  /* DEFILTRAGE. Chaque ligne porte son octet de filtre en tete ;
     les cinq filtres du format sont tous utilises par les
     encodeurs reels, donc les cinq sont implementes. */
  for (let y = 0; y < h; y++) {
    const ft = raw[y * (stride + 1)];
    const src = y * (stride + 1) + 1;
    const dst = y * stride;
    const up = dst - stride;
    for (let x = 0; x < stride; x++) {
      const a = x >= ch ? out[dst + x - ch] : 0;
      const b = y > 0 ? out[up + x] : 0;
      const c = x >= ch && y > 0 ? out[up + x - ch] : 0;
      const v = raw[src + x];
      let r;
      switch (ft) {
        case 0: r = v; break;
        case 1: r = v + a; break;
        case 2: r = v + b; break;
        case 3: r = v + ((a + b) >> 1); break;
        case 4: {
          const p = a + b - c;
          const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
          r = v + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c);
          break;
        }
        default: throw new Error("filtre " + ft + " inconnu");
      }
      out[dst + x] = r & 0xff;
    }
  }
  return { width: w, height: h, channels: ch, data: out };
}

/* Difference entre deux images de meme taille.
   · `pct`  — pourcentage de pixels dont un canal bouge de plus de
     `seuil` (8 par defaut : au-dessus de l'anticrenelage, en
     dessous de tout changement voulu) ;
   · `moy`  — ecart moyen sur 255, tous canaux confondus ;
   · `max`  — le pire ecart rencontre.
   Un test qui ne regarde que `moy` ne voit pas un petit objet qui
   traverse ; un test qui ne regarde que `pct` ne voit pas un
   aplat qui change de deux teintes. On rend les trois. */
export function diffStats(a, b, seuil = 8) {
  if (a.width !== b.width || a.height !== b.height) {
    return { pct: 100, moy: 255, max: 255, taille: false };
  }
  const ch = Math.min(a.channels, b.channels);
  const n = a.width * a.height;
  let bouges = 0, somme = 0, max = 0;
  for (let i = 0; i < n; i++) {
    const ia = i * a.channels, ib = i * b.channels;
    let pire = 0;
    for (let k = 0; k < Math.min(ch, 3); k++) {
      const d = Math.abs(a.data[ia + k] - b.data[ib + k]);
      somme += d;
      if (d > pire) pire = d;
    }
    if (pire > seuil) bouges++;
    if (pire > max) max = pire;
  }
  return {
    pct: +(bouges / n * 100).toFixed(2),
    moy: +(somme / (n * 3)).toFixed(2),
    max,
    taille: true,
  };
}

/* Lecture directe depuis un chemin. */
export function lire(fs, chemin) {
  return decodePNG(fs.readFileSync(chemin));
}
