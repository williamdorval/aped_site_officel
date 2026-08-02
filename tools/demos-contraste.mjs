/* ============================================================
   LE CONTRASTE DES SITES DE SECTEUR
   `node tools/demos-contraste.mjs [--port 8099] [secteur...]`

   Neuf palettes écrites à la main, dont une sur fond ACIDE et une
   sur papier rose. Un accent qui passe sur un fond ne passe pas
   forcément sur l'autre, et c'est le genre de défaut qu'on ne voit
   pas à l'image : le texte reste lisible pour qui le connaît déjà.

   DEUX PRÉCAUTIONS REPRISES DE `contraste-min.mjs`, ET CHACUNE A
   DÉJÀ COÛTÉ UNE PASSE AILLEURS DANS LE DÉPÔT.

   1. LE FOND RÉEL, PAS LE FOND DÉCLARÉ. On remonte jusqu'à la
      première surface opaque : mesurer contre le fond d'un élément
      transparent donne le ratio d'une couleur qui n'est peinte nulle
      part.
   2. UN FOND EN IMAGE OU EN DÉGRADÉ N'EST PAS UN FOND ABSENT. La
      remontée s'arrête et rend `null` — non calculable depuis les
      styles. Du texte blanc sur une barre en dégradé avait rendu
      « 1:1 », le pire verdict possible sur du texte parfaitement
      lisible. Ce qui n'est pas calculable est compté à part : ni
      échec, ni succès.  D-639

   3. UNE PHOTOGRAPHIE PEUT ÊTRE UN `<img>` VOISIN, PAS UN FOND CSS —
      ET LA REMONTÉE PAR LES ANCÊTRES NE LA VOIT PAS. La précaution 2
      ne couvrait que `background-image`. Le bandeau de titre de
      `coiffure` est du blanc posé PAR-DESSUS un `<img>` frère : la
      remontée passait à côté, atteignait le blanc de la page, et
      rendait **1:1 sur trois blocs** dont le pire mesure 14,88:1 aux
      pixels peints (`pire-pixel.mjs`). Exactement le faux verdict que
      la précaution 2 disait éviter, par une autre porte.
      On détecte donc aussi le recouvrement GÉOMÉTRIQUE par un élément
      remplacé — `img`, `video`, `canvas`, `svg` — qui n'est pas un
      descendant du texte. Ce cas ne peut que RETIRER des échecs
      faux ; il n'en ajoute aucun. Et il ne dispense de rien : ce qui
      est posé sur une photographie se mesure aux pixels peints, avec
      `tools/pire-pixel.mjs`, et c'est écrit dans le compte rendu.
   ============================================================ */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const DEMOS = path.join(ICI, "..", "demos-secteurs");

const iPort = process.argv.indexOf("--port");
let PORT = 8099;
if (iPort !== -1) {
  PORT = Number(process.argv[iPort + 1]);
  if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
    throw new Error(`--port ${process.argv[iPort + 1]} : ce n'est pas un numéro de port.`);
  }
}

const tous = fs.readdirSync(DEMOS).filter((d) => fs.existsSync(path.join(DEMOS, d, "index.html")));
const vise = process.argv.slice(2).filter((a) => tous.includes(a));
const aFaire = vise.length ? vise : tous;
const LARGEURS = [390, 768, 1440];

const MESURE = () => {
  const lum = (c) => {
    const s = c.map((v) => {
      const x = v / 255;
      return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * s[0] + 0.7152 * s[1] + 0.0722 * s[2];
  };
  const rgb = (v) => {
    const m = String(v).match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const q = m[1].split(/[,\s/]+/).filter(Boolean).map(parseFloat);
    return { c: [q[0], q[1], q[2]], a: q.length > 3 ? q[3] : 1 };
  };
  /* Deux lectures du même fond, et il faut les deux.
     `exact` s'arrête net sur une image ou un dégradé : ce qui n'est
     pas calculable depuis les styles ne compte ni comme échec ni
     comme succès.
     `approche` continue et prend la première couleur opaque
     DESSOUS. Sur la construction, le quadrillage de plan est un
     `repeating-linear-gradient` posé sur toute la page : la lecture
     exacte rend « 208 hors calcul » et ne dit plus rien. La lecture
     approchée dit le ratio contre le bleu de plan, ce qui est la
     bonne réponse à 8 % d'opacité de trait — mais ce n'est pas une
     mesure aux pixels peints, et c'est écrit comme tel.  D-639 */
  function fond(el, approche) {
    let n = el, image = false;
    while (n && n !== document.documentElement) {
      const cs = getComputedStyle(n);
      if (cs.backgroundImage && cs.backgroundImage !== "none") {
        if (!approche) return null;
        image = true;
      }
      const c = rgb(cs.backgroundColor);
      if (c && c.a >= 0.95) return { c: c.c, image };
      n = n.parentElement;
    }
    const b = rgb(getComputedStyle(document.body).backgroundColor);
    return b && b.a >= 0.95 ? { c: b.c, image } : null;
  }
  /* Les éléments remplacés visibles, relevés UNE fois : on compare
     ensuite chaque boîte de texte à leurs rectangles. Un texte qui
     recouvre l'un d'eux est peint sur des pixels que les styles ne
     décrivent pas — non calculable, comme un dégradé. */
  const peints = [...document.querySelectorAll("img, video, canvas, svg")]
    .filter((n) => {
      const cs = getComputedStyle(n);
      if (cs.visibility === "hidden" || cs.display === "none") return false;
      if (parseFloat(cs.opacity) < 0.1) return false;
      const b = n.getBoundingClientRect();
      return b.width > 1 && b.height > 1;
    })
    .map((n) => ({ n, b: n.getBoundingClientRect() }));
  const surImage = (el, r) => peints.some(({ n, b }) =>
    !el.contains(n) &&
    r.left < b.right && r.right > b.left && r.top < b.bottom && r.bottom > b.top);

  const echecs = [];
  let horsCalcul = 0, approches = 0, mesures = 0, surImages = 0, min = 99, minQuoi = "";
  for (const el of document.querySelectorAll("body *")) {
    if (el.closest("[aria-hidden='true'], template, svg")) continue;
    const t = [...el.childNodes].filter((n) => n.nodeType === 3 && n.textContent.trim())
      .map((n) => n.textContent.trim()).join(" ");
    if (!t) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === "hidden" || cs.display === "none") continue;
    /* Un élément à opacité nulle est en cours de révélation, pas en
       défaut : une animation pilotée par le défilement en laisse
       toujours quelques-uns en vol. */
    if (parseFloat(cs.opacity) < 0.9) continue;
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) continue;
    const fg = rgb(cs.color);
    if (!fg || fg.a < 0.9) continue;
    /* Précaution 3 : posé sur un `<img>`, ce n'est pas mesurable ici. */
    if (surImage(el, r)) { horsCalcul++; surImages++; continue; }
    const bg = fond(el, true);
    if (bg === null) { horsCalcul++; continue; }
    const px = parseFloat(cs.fontSize);
    const gras = parseInt(cs.fontWeight, 10) >= 700;
    /* Seuil WCAG AA : 3:1 pour du grand texte — 24 px, ou 18,66 px
       en gras — et 4,5:1 pour tout le reste. */
    const seuil = px >= 24 || (px >= 18.66 && gras) ? 3 : 4.5;
    const l1 = lum(fg.c), l2 = lum(bg.c);
    const ct = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    mesures++;
    if (bg.image) approches++;
    if (ct < min) { min = ct; minQuoi = `${t.slice(0, 30)} · ${Math.round(px)}px`; }
    if (ct < seuil) {
      echecs.push({ ct: Math.round(ct * 100) / 100, seuil, px: Math.round(px), t: t.slice(0, 40), approche: bg.image });
    }
  }
  return { echecs, horsCalcul, approches, surImages, mesures, min: Math.round(min * 100) / 100, minQuoi };
};

const b = await chromium.launch();
const R = [];
let total = 0;
let surImageTotal = 0;

for (const cle of aFaire) {
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto(`http://localhost:${PORT}/demos-secteurs/${cle}/index.html`, { waitUntil: "networkidle", timeout: 45000 });
  const ligne = { secteur: cle };
  let pires = [];
  for (const w of LARGEURS) {
    await p.setViewportSize({ width: w, height: 900 });
    /* On DÉFILE avant de mesurer : ce qui n'a jamais traversé la
       fenêtre reste dans son état de départ, et un état de départ
       n'est pas un défaut de contraste. */
    const H = await p.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < H; y += 700) { await p.evaluate((yy) => window.scrollTo(0, yy), y); await p.waitForTimeout(60); }
    await p.evaluate(() => window.scrollTo(0, 0));
    await p.waitForTimeout(400);
    const r = await p.evaluate(MESURE);
    /* « ok » sur zéro mesure n'est pas un succès, c'est un silence.
       Quand tout le texte est posé sur une photographie — c'est le cas
       entier de `photo` —, il ne reste RIEN à calculer depuis les
       styles, et l'outil doit le dire au lieu de rendre « min 99 ». */
    ligne[`${w}px`] = r.echecs.length ? `${r.echecs.length} ÉCHEC`
      : r.mesures ? `ok (min ${r.min})` : "rien de calculable";
    if (r.approches) ligne[`${w}px`] += ` [${r.approches} approché]`;
    /* Ce qui est posé sur une photographie ne se tait pas : il se
       nomme, et il envoie à l'outil qui sait le mesurer. */
    if (r.surImages) { ligne[`${w}px`] += ` [${r.surImages} sur image]`; surImageTotal += r.surImages; }
    total += r.echecs.length;
    pires = pires.concat(r.echecs.map((e) => ({ ...e, w })));
  }
  await p.close();
  pires.sort((a, c) => a.ct - c.ct);
  ligne.pire = pires.length ? `${pires[0].ct}:1 < ${pires[0].seuil} · ${pires[0].px}px · « ${pires[0].t} » @${pires[0].w}` : "—";
  R.push(ligne);
}

await b.close();
console.table(R);
if (total) {
  console.error(`\n${total} échec(s) de contraste. Le seuil est 4,5:1, et 3:1 pour du grand texte.`);
  process.exitCode = 1;
} else {
  console.log(`\n${R.length} site(s) × ${LARGEURS.length} largeurs : aucun échec de contraste calculable.`);
  console.log("Les mesures « approché » sont prises contre la première couleur OPAQUE sous une image ou un dégradé — pas aux pixels peints.");
}
if (surImageTotal) {
  console.log(`\n${surImageTotal} bloc(s) « sur image » : posés par-dessus un <img>, ils ne sont PAS mesurables ici.`);
  console.log("Ils se mesurent aux pixels peints :  node tools/pire-pixel.mjs <clé> <sélecteur…>");
}
