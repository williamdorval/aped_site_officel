/* ============================================================
   LES POLICES DES SITES DE SECTEUR
   `node tools/polices-demos.mjs [famille...]`

   POURQUOI.
   Les trois references — restau, carrosserie, design interieur —
   n'ont pas la meme personnalite, et ca tient d'abord a la
   TYPOGRAPHIE : un didone a fort contraste pour le restaurant, une
   grotesque condensee lourde pour la carrosserie, une transitionnelle
   posee pour le studio de design. Trois sites qui partagent une seule
   police sont un gabarit decline trois fois, et ca se voit au premier
   coup d'oeil.

   ZERO REQUETE TIERCE, ET C'EST NON NEGOCIABLE.
   Les fichiers sont telecharges ICI, une fois, et servis depuis le
   depot. Aucune page ne parle a `fonts.googleapis.com`. Le tour de
   passe-passe habituel — « ce n'est qu'une police » — est exactement
   ce que la regle interdit.

   LICENCES.
   Toutes les familles retenues sont sous SIL Open Font License 1.1,
   qui autorise l'usage commercial et la redistribution. Le releve est
   ecrit dans `fonts/demos/_licences.json` a chaque passe.
   ============================================================ */
import fs from "node:fs";
import path from "node:path";
import https from "node:https";
import { fileURLToPath } from "node:url";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, "..");
const SORTIE = path.join(RACINE, "fonts", "demos");
fs.mkdirSync(SORTIE, { recursive: true });

/* Une famille = un fichier. On ne prend QU'UNE graisse par face :
   une page de demonstration n'a pas besoin de neuf variantes, et
   chaque graisse en trop est un fichier de plus a servir. */
const FAMILLES = {
  /* --- faces d'affichage --- */
  "bodoni-moda": { g: "Bodoni+Moda:wght@700", role: "didone a fort contraste — coiffure, esthetique" },
  "playfair": { g: "Playfair+Display:ital,wght@0,700;1,600", role: "didone chaleureux — hebergement" },
  "anton": { g: "Anton", role: "grotesque condensee tres lourde — gym" },
  "oswald": { g: "Oswald:wght@600", role: "condensee industrielle — construction" },
  "syne": { g: "Syne:wght@800", role: "geometrique large et etrange — boutique" },
  "instrument-serif": { g: "Instrument+Serif:ital@0;1", role: "serif d'affichage fine — photographe" },
  "libre-baskerville": { g: "Libre+Baskerville:wght@700", role: "serif d'autorite — juridique" },
  "dm-serif": { g: "DM+Serif+Display", role: "serif tranquille — immobilier" },
  "manrope": { g: "Manrope:wght@400;800", role: "humaniste ronde — clinique" },
  /* --- faces d'affichage ajoutees le 2026-08-01 : douze secteurs,
     douze personnalites. Aucune ne doit pouvoir passer pour une
     autre a trois metres. --- */
  "fraunces": { g: "Fraunces:opsz,wght@9..144,600;9..144,900", role: "serif douce et gauche — boutique de ceramique" },
  "cormorant": { g: "Cormorant+Garamond:ital,wght@0,600;1,600", role: "antique lapidaire fine — hebergement" },
  "outfit": { g: "Outfit:wght@500;800", role: "geometrique ronde — clinique" },
  "space-grotesk": { g: "Space+Grotesk:wght@500;700", role: "grotesque technique — construction" },
  /* --- la seule ETENDUE du depot, ajoutee le 2026-08-01 pour
     l'immobilier. Archivo porte un axe de chasse `wdth` de 62,5 a
     125 ; on demande l'instance 125, l'inverse exact de l'ultra-
     condensee du gym. Deux graisses : 500 pour les capitales
     courantes, 700 pour le titre. --- */
  "archivo-exp": { g: "Archivo:wdth,wght@125,500;125,700", role: "grotesque ETENDUE (wdth 125) — immobilier, et nulle part ailleurs" },
  /* --- faces de texte et de detail --- */
  "inter": { g: "Inter:wght@400;600", role: "texte courant neutre" },
  "spectral": { g: "Spectral:ital,wght@0,400;1,400", role: "texte courant serif" },
  "karla": { g: "Karla:wght@400;700", role: "grotesque de texte a l'oeil ouvert — boutique" },
  "archivo": { g: "Archivo:wght@400;600", role: "grotesque de texte neutre et serree — coiffure, gym" },
  "source-serif": { g: "Source+Serif+4:ital,wght@0,400;1,400", role: "serif de presse — juridique" },
  "plex-sans": { g: "IBM+Plex+Sans:wght@400;600", role: "sans technique — construction" },
  "jetbrains-mono": { g: "JetBrains+Mono:wght@500", role: "micro-libelles et codes" }
};

const LICENCE = "SIL Open Font License 1.1 — https://openfontlicense.org/";

const obtenir = (url, entetes) => new Promise((ok, non) => {
  https.get(url, { headers: entetes }, (r) => {
    if (r.statusCode >= 300 && r.statusCode < 400 && r.headers.location) { r.resume(); return obtenir(r.headers.location, entetes).then(ok, non); }
    if (r.statusCode !== 200) { r.resume(); return non(new Error(r.statusCode + " " + url)); }
    const m = [];
    r.on("data", (c) => m.push(c));
    r.on("end", () => ok(Buffer.concat(m)));
  }).on("error", non);
});

/* Le `user-agent` decide du FORMAT rendu par l'API : un navigateur
   ancien recoit du TTF, un recent du woff2. Sans lui, on telecharge
   quatre fois le poids necessaire sans que rien ne le dise. */
const UA_WOFF2 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const demandes = process.argv.slice(2).filter((a) => FAMILLES[a]);
const aFaire = demandes.length ? demandes : Object.keys(FAMILLES);
const REGISTRE = [];
const R = [];

for (const cle of aFaire) {
  const f = FAMILLES[cle];
  const css = (await obtenir(
    `https://fonts.googleapis.com/css2?family=${f.g}&display=swap`,
    { "user-agent": UA_WOFF2 }
  )).toString();

  /* On ne garde que les sous-ensembles `latin` et `latin-ext` : le
     francais n'a besoin de rien d'autre, et les blocs cyrillique,
     grec et vietnamien pesent plus que la face elle-meme. */
  const blocs = css.split("/* ").slice(1);
  const gardes = blocs.filter((b) => /^latin(-ext)?\b/.test(b));
  if (!gardes.length) throw new Error(`${cle} : aucun bloc latin dans la reponse — l'API a change de forme`);

  let n = 0, poids = 0;
  const morceaux = [];
  for (const b of gardes) {
    const u = /url\((https:\/\/fonts\.gstatic\.com\/[^)]+\.woff2)\)/.exec(b);
    if (!u) continue;
    const style = /font-style:\s*(\w+)/.exec(b);
    const graisse = /font-weight:\s*([\d ]+)/.exec(b);
    const uni = /unicode-range:\s*([^;]+);/.exec(b);
    const nom = `${cle}-${n}.woff2`;
    const bin = await obtenir(u[1], { "user-agent": UA_WOFF2 });
    fs.writeFileSync(path.join(SORTIE, nom), bin);
    poids += bin.length;
    morceaux.push({ fichier: nom, style: (style && style[1]) || "normal", graisse: (graisse && graisse[1].trim()) || "400", plage: uni ? uni[1].trim() : null });
    n++;
  }
  if (!morceaux.length) throw new Error(`${cle} : aucune URL woff2 trouvee`);

  REGISTRE.push({ famille: cle, google: f.g, role: f.role, licence: LICENCE, morceaux });
  R.push({ famille: cle, fichiers: morceaux.length, ko: Math.round(poids / 1024), role: f.role });
}

/* Le registre est REECRIT en entier a chaque passe complete, et
   FUSIONNE quand on ne demande qu'une famille — sinon un tirage
   partiel efface la licence des autres, et une licence effacee ne se
   remarque qu'au moment ou quelqu'un la demande. */
const cheminReg = path.join(SORTIE, "_licences.json");
let registre = REGISTRE;
if (demandes.length && fs.existsSync(cheminReg)) {
  const ancien = JSON.parse(fs.readFileSync(cheminReg, "utf8"));
  const neufs = new Set(REGISTRE.map((x) => x.famille));
  registre = ancien.filter((x) => !neufs.has(x.famille)).concat(REGISTRE);
}
registre.sort((a, b) => a.famille.localeCompare(b.famille));
fs.writeFileSync(cheminReg, JSON.stringify(registre, null, 2) + "\n");

/* Une feuille de declarations prete a inclure, pour ne pas les
   reecrire a la main douze fois — et pour que le chemin soit juste
   partout du premier coup. */
const decl = registre.flatMap((f) =>
  f.morceaux.map((m) =>
    `@font-face{font-family:"${f.famille}";src:url("../../fonts/demos/${m.fichier}") format("woff2");` +
    `font-style:${m.style};font-weight:${m.graisse};font-display:swap;` +
    (m.plage ? `unicode-range:${m.plage};` : "") + `}`
  )
).join("\n");
fs.writeFileSync(path.join(SORTIE, "_declarations.css"), decl + "\n");

console.table(R);
console.log(`${registre.length} famille(s) au registre · ${fs.readdirSync(SORTIE).filter((x) => x.endsWith(".woff2")).length} fichiers`);
console.log("licences : fonts/demos/_licences.json · declarations : fonts/demos/_declarations.css");
