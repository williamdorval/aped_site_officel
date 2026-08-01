/* ============================================================
   LE CONTRÔLE DES SITES DE SECTEUR
   `node tools/demos-controle.mjs [--port 8099] [secteur...]`

   Neuf sites écrits à la main, un fichier chacun. Ce qui se vérifie
   ici est ce qu'on ne peut PAS voir sur une capture : un prix oublié
   dans une ligne de tableau, une police appelée chez Google, un
   `<img>` sans dimensions, une erreur console.

   CE QU'IL NE VÉRIFIE PAS, ET IL FAUT LE DIRE : la qualité. Un site
   peut passer les douze contrôles et rester laid. Le jugement se
   fait à l'image, avec `tools/_voir.mjs`, jamais ici.
   ============================================================ */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, "..");
const DEMOS = path.join(RACINE, "demos-secteurs");

/* Un port illisible ARRÊTE l'outil. `Number("huit")` vaut `NaN`, et
   toute comparaison avec `NaN` est fausse — l'outil rendrait « tout
   va bien » sans avoir rien chargé. Piège 30. */
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

/* Un prix, c'est un nombre collé à un dollar — et le dollar peut être
   précédé d'une espace insécable, d'une espace fine, ou de `&nbsp;`.
   On lit le TEXTE RENDU, pas la source : `&nbsp;` y est déjà résolu. */
const PRIX = /\d[\d\s  ]*\$/;

const b = await chromium.launch();
const R = [];
let echecs = 0;

for (const cle of aFaire) {
  const src = fs.readFileSync(path.join(DEMOS, cle, "index.html"), "utf8");
  const maux = [];

  /* --- ce qui se lit dans la source --- */
  if (/<script[\s>]/i.test(src)) maux.push("un <script>");
  if (/https?:\/\/(?!localhost)/i.test(src.replace(/<!--[\s\S]*?-->/g, ""))) maux.push("une adresse absolue hors du dépôt");
  if (!/name=["']robots["']\s+content=["']noindex,nofollow["']/i.test(src)) maux.push("pas de noindex");
  if (!/(site de démonstration|démonstration)/i.test(src)) maux.push("pas de mention de démonstration");
  if (!/@keyframes/.test(src)) maux.push("AUCUNE @keyframes — le site ne bouge pas");
  if (!/animation-timeline/.test(src)) maux.push("aucune animation pilotée par le défilement");
  if (!/prefers-reduced-motion/.test(src)) maux.push("prefers-reduced-motion non traité");

  const imgs = [...src.matchAll(/<img\b[^>]*>/gi)].map((m) => m[0]);
  const sansDim = imgs.filter((t) => !/\bwidth=/.test(t) || !/\bheight=/.test(t));
  if (sansDim.length) maux.push(`${sansDim.length} <img> sans width/height`);

  /* --- ce qui ne se lit que dans la page rendue --- */
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const erreurs = [];
  const tierces = [];
  p.on("console", (m) => { if (m.type() === "error") erreurs.push(m.text()); });
  p.on("pageerror", (e) => erreurs.push(String(e)));
  p.on("request", (r) => { const u = r.url(); if (!u.startsWith(`http://localhost:${PORT}/`) && !u.startsWith("data:")) tierces.push(u); });

  const url = `http://localhost:${PORT}/demos-secteurs/${cle}/index.html`;
  const rep = await p.goto(url, { waitUntil: "networkidle", timeout: 45000 });
  if (!rep || !rep.ok()) maux.push(`la page ne répond pas (${rep ? rep.status() : "aucune réponse"})`);

  const texte = await p.evaluate(() => document.body.innerText);
  const prix = texte.match(new RegExp(PRIX.source, "g"));
  if (prix) maux.push(`PRIX affiché : ${[...new Set(prix)].slice(0, 6).join(" · ")}`);
  if (/\b\d[,.]\d\s*(\/\s*5|étoile)/i.test(texte)) maux.push("une note affichée");

  /* Le débordement se mesure à trois largeurs : un bandeau qui défile
     déborde à 1440 sans déborder à 360, et l'inverse est vrai aussi. */
  const deb = [];
  for (const w of [320, 360, 768, 1024, 1440, 1920]) {
    await p.setViewportSize({ width: w, height: 900 });
    await p.waitForTimeout(120);
    const d = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if (d > 1) deb.push(`${w}px:+${d}`);
  }
  if (deb.length) maux.push(`débordement horizontal ${deb.join(" ")}`);

  /* Les polices réellement téléchargées : une page qui déclare douze
     familles en sert douze, et le poids ne se voit pas à l'image. */
  const polices = [...new Set(tierces.filter((u) => /\.woff2?$/.test(u)))];
  const faces = [...new Set((src.match(/font-family:\s*"([a-z0-9-]+)"/g) || []).map((s) => s.split('"')[1]))];

  if (tierces.length) maux.push(`${tierces.length} requête(s) tierce(s) : ${[...new Set(tierces)].slice(0, 3).join(" ")}`);
  if (erreurs.length) maux.push(`${erreurs.length} erreur(s) console : ${erreurs[0].slice(0, 90)}`);

  await p.close();
  if (maux.length) echecs++;
  R.push({
    secteur: cle,
    ko: Math.round(src.length / 1024),
    images: imgs.length,
    familles: faces.join(" "),
    verdict: maux.length ? "ÉCHEC" : "ok",
    maux: maux.join(" · ") || "—"
  });
}

await b.close();
console.table(R);
if (echecs) {
  console.error(`\n${echecs} site(s) en échec.`);
  process.exitCode = 1;
} else {
  console.log(`\n${R.length} site(s) : rien à signaler. La qualité, elle, se regarde à l'image.`);
}
