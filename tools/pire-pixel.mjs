/* ============================================================
   LE CONTRASTE SOUS L'ENCRE PEINTE
   `node tools/pire-pixel.mjs <clé> <sélecteur…> [--port 8099] [--seuil 4.5]`

   POURQUOI CET OUTIL EXISTE.
   `demos-contraste.mjs` remonte jusqu'à la première surface OPAQUE.
   Sous une photographie il s'arrête et rend « approché » : il ne voit
   pas ce qui est réellement peint (piège 45). Un texte clair posé sur
   une branche enneigée peut donc passer à 5,67 dans le rapport et
   disparaître à l'écran.

   DEUX PRÉCAUTIONS, ET LA SECONDE A DÉJÀ RENDU UN FAUX VERDICT.

   1. ON MESURE LE FOND SANS L'ENCRE. Photographier par-dessus le
      texte mélangerait l'encre au fond et rendrait un ratio de 1.

   2. ON NE MESURE QUE LE CORPS DES LETTRES. Et il a fallu deux
      essais.
      · Le premier prenait le pire pixel du rectangle englobant —
        donc les BLANCS ENTRE LES LETTRES, où le fond est libre et où
        personne n'a rien à lire. Il a rendu 2,46:1 sur un mot-marque
        parfaitement lisible, en mesurant le ciel entre un « A » et
        un « u ».
      · Le second gardait tout pixel dont la couleur avait bougé de
        plus de 64 — donc **l'anticrénelage**, dont la couleur
        composée est presque celle du fond. Il a rendu **1,13 sur les
        neuf blocs** d'un écran dont aucun n'était en défaut. C'est
        le piège 8 du dépôt, rejoué.
      Ce qui décide est la COUVERTURE : de combien le pixel a-t-il
      parcouru la distance qui sépare le fond de l'encre ? On garde
      85 % et plus.
   ============================================================ */
import { chromium } from "playwright";

const args = process.argv.slice(2);
const lire = (nom, def) => {
  const i = args.indexOf(nom);
  if (i < 0) return def;
  const v = Number(args[i + 1]);
  if (!Number.isFinite(v)) throw new Error(`${nom} illisible : ${JSON.stringify(args[i + 1])}`);
  args.splice(i, 2);
  return v;
};
const PORT = lire("--port", 8099);
const SEUIL = lire("--seuil", 4.5);
const [cle, ...sels] = args;
if (!cle || !sels.length) throw new Error("node tools/pire-pixel.mjs <clé> <sélecteur…>");

const nav = await chromium.launch();
/* DENSITÉ 2, ET CE N'EST PAS DU CONFORT. À densité 1, une mono de
   10 px n'a AUCUN pixel de couverture pleine : ses hampes font moins
   d'un pixel de large et tout est de l'anticrénelage. L'outil rendait
   « aucun pixel d'encre » sur trois blocs — un silence qui se lit
   comme « rien à signaler ». À densité 2, le corps de lettre existe. */
const DENS = 2;
const p = await nav.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: DENS });
await p.goto(`http://localhost:${PORT}/demos-secteurs/${cle}/index.html`, { waitUntil: "load" });
await p.waitForTimeout(2400);

const boites = await p.evaluate(({ ss, d }) => ss.flatMap((s) => [...document.querySelectorAll(s)].map((e) => {
  const r = e.getBoundingClientRect();
  const m = getComputedStyle(e).color.match(/[\d.]+/g).map(Number);
  /* Les boîtes sont en pixels CSS, la capture en pixels d'appareil :
     on multiplie par la densité, sinon on lit le quart supérieur
     gauche de chaque bloc. */
  return { s, t: (e.textContent || "").replace(/\s+/g, " ").trim().slice(0, 26), x: Math.max(0, Math.floor(r.left * d)), y: Math.max(0, Math.floor(r.top * d)), w: Math.ceil(r.width * d), h: Math.ceil(r.height * d) };
})), { ss: sels, d: DENS });
if (!boites.length) throw new Error("aucun élément trouvé — sélecteurs faux ?");

/* LES DEUX CAPTURES DOIVENT ÊTRE LE MÊME INSTANT. Entre elles il
   s'écoule un quart de seconde ; si une animation tourne, ce qui a
   bougé se lit comme de l'encre. On fige d'abord. */
await p.evaluate(() => { for (const a of document.getAnimations()) { try { a.pause(); a.currentTime = 3000; } catch {} } });
await p.waitForTimeout(180);
const avecEncre = await p.screenshot();

/* `color: transparent` EFFACE AUSSI LES BORDURES, et c'est un
   troisième faux verdict : `border-color` vaut `currentColor` par
   défaut. Un filet qui disparaît dans la capture « sans encre » se
   lit comme un déplacement énorme, donc comme du corps de lettre, et
   l'outil rend 2,76:1 en mesurant un filet sur son fond. On neutralise
   le REMPLISSAGE du texte, pas la couleur : `-webkit-text-fill-color`
   ne touche ni les bordures, ni les `currentColor` d'arrière-plan. */
await p.evaluate(() => {
  const st = document.createElement("style");
  st.textContent = "*{-webkit-text-fill-color:transparent !important;text-shadow:none !important;-webkit-text-stroke:0 !important}";
  document.head.appendChild(st);
});
await p.waitForTimeout(240);
const sansEncre = await p.screenshot();

const res = await p.evaluate(async ({ a, b, boites, SEUIL }) => {
  const charger = async (b64) => {
    const i = new Image(); i.src = "data:image/png;base64," + b64; await i.decode();
    const c = document.createElement("canvas"); c.width = i.naturalWidth; c.height = i.naturalHeight;
    c.getContext("2d").drawImage(i, 0, 0);
    return c.getContext("2d");
  };
  const A = await charger(a), B = await charger(b);
  const lin = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  const Y = (r, g, bl) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(bl);
  const rap = (x, y) => { const [h, l] = x > y ? [x, y] : [y, x]; return (h + 0.05) / (l + 0.05); };
  const out = [];
  for (const bo of boites) {
    const w = Math.max(1, bo.w), h = Math.max(1, bo.h);
    const da = A.getImageData(bo.x, bo.y, w, h).data;
    const db = B.getImageData(bo.x, bo.y, w, h).data;
    /* LA CIBLE SE DÉRIVE DES DONNÉES, PAS DE LA FEUILLE DE STYLE.
       Prendre la couleur DÉCLARÉE comme repère marchait tant que le
       texte était opaque ; un libellé posé à `rgba(…, .72)` ne
       parcourt jamais que 72 % de cette distance, donc AUCUN de ses
       pixels n'atteignait le seuil, et l'outil rendait « aucun pixel
       d'encre » — un silence qui se lit comme « rien à signaler ».
       On relève d'abord le déplacement MAXIMAL observé dans la
       boîte : c'est lui, le corps de lettre, quels que soient
       l'alpha, le mode de fusion et ce que le moteur a décidé. */
    let max = 0;
    for (let i = 0; i < da.length; i += 4) {
      const d = Math.min(Math.abs(da[i] - db[i]), Math.abs(da[i + 1] - db[i + 1]), Math.abs(da[i + 2] - db[i + 2]));
      if (d > max) max = d;
    }
    let pire = Infinity, somme = 0, n = 0, pireXY = null;
    for (let i = 0; i < da.length; i += 4) {
      /* LA COUVERTURE D'ENCRE, ET C'EST ELLE QUI DÉCIDE.  Piège 8.
         Un seuil sur l'ÉCART entre les deux captures laisse entrer
         les pixels d'anticrénelage : leur couleur composée est
         presque celle du fond, donc leur rapport vaut 1,1 — et
         l'outil rend « illisible » sur du texte parfaitement net.
         Il a rendu 1,13 sur les NEUF blocs d'un écran dont aucun
         n'était en défaut.
         La couverture se calcule : de combien le pixel a-t-il
         parcouru la distance du fond vers l'encre ? On ne garde que
         ceux qui l'ont parcourue à 85 % ou plus — le corps de la
         lettre, pas son bord. */
      if (max < 24) break;                   // encre et fond confondus : rien à mesurer
      const parcouru = Math.min(Math.abs(da[i] - db[i]), Math.abs(da[i + 1] - db[i + 1]), Math.abs(da[i + 2] - db[i + 2]));
      if (parcouru / max < 0.85) continue;   // bord de glyphe, pas corps
      const r = rap(Y(da[i], da[i + 1], da[i + 2]), Y(db[i], db[i + 1], db[i + 2]));
      if (r < pire) { pire = r; const k = i / 4; pireXY = `${Math.round((bo.x + (k % w)) / 2)},${Math.round((bo.y + Math.floor(k / w)) / 2)}`; }
      somme += r; n++;
    }
    out.push(n
      ? { sel: bo.s, texte: bo.t, pixels: n, pire: +pire.toFixed(2), moyenne: +(somme / n).toFixed(2), ou: pireXY }
      : { sel: bo.s, texte: bo.t, pixels: 0, pire: null, moyenne: null, ou: null });
  }
  return out;
}, { a: avecEncre.toString("base64"), b: sansEncre.toString("base64"), boites, SEUIL });

let echecs = 0;
for (const r of res) {
  if (r.pixels === 0) { console.log(`  —     aucun pixel d'encre · ${r.sel.padEnd(12)} « ${r.texte} »`); continue; }
  const ko = r.pire < SEUIL;
  if (ko) echecs++;
  console.log(`${ko ? "ÉCHEC" : "ok   "} ${String(r.pire).padStart(6)} pire · ${String(r.moyenne).padStart(6)} moy · ${String(r.pixels).padStart(6)} px d'encre · ${r.sel.padEnd(12)} « ${r.texte} »${ko ? `  → pire en ${r.ou}` : ""}`);
}
await nav.close();
console.log(`\n${res.length} bloc(s) · seuil ${SEUIL} · ${echecs} échec(s)`);
process.exit(echecs ? 1 : 0);
