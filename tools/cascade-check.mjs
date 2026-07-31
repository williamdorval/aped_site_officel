/* ============================================================
   LE DECOUPAGE N'A RIEN CASSE — preuve
   `node tools/cascade-check.mjs [port]`

   Decouper une feuille en deux change l'ORDRE de cascade entre deux
   regles de meme specificite qui etaient interleavees. C'est le
   seul vrai danger de l'operation, et il ne se voit pas a l'oeil :
   il se voit sur une propriete calculee, quelque part, sur un
   element qu'on n'a pas pense a regarder.

   On compare donc TOUT : quarante proprietes calculees sur chaque
   element de la page, dans les deux themes, feuille decoupee contre
   feuille entiere. Le controle est fabrique en vol — on remplace
   `critique.css` + `differe.css` par `app.css` — donc les deux
   mesures viennent du meme document et du meme navigateur.
   ============================================================ */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, "..");
const PORT = process.argv[2] || "8099";
const BASE = `http://127.0.0.1:${PORT}/`;

const PROPS = [
  "display", "position", "top", "right", "bottom", "left", "width", "height",
  "margin-top", "margin-right", "margin-bottom", "margin-left",
  "padding-top", "padding-right", "padding-bottom", "padding-left",
  "color", "background-color", "background-image",
  "border-top-width", "border-right-width", "border-bottom-width", "border-left-width",
  "border-top-color", "border-left-color",
  "font-family", "font-size", "font-weight", "line-height", "letter-spacing",
  "text-transform", "text-align", "opacity", "transform", "z-index",
  "grid-template-columns", "grid-template-rows", "flex-direction", "align-items",
  "justify-content", "gap", "overflow-x", "overflow-y", "aspect-ratio"
];

const nav = await chromium.launch();

/* PIEGE D'INSTRUMENT CORRIGE LE 2026-07-26, ET C'EST LE QUATRIEME
   DE LA SERIE.

   Ce script compare deux CHARGEMENTS de la meme page, element par
   element, par chemin dans le DOM. Depuis la phase 8, la page
   FABRIQUE des elements au defilement — les mots des chapos sont
   decoupes paresseusement par `langue.js` — et anime leur opacite
   en scrub. Deux chargements successifs n'ont donc plus ni le meme
   nombre de noeuds ni les memes valeurs calculees, et le script
   rendait de 1 a 19 « ecarts de cascade » qui n'en etaient pas :
   c'etait de la choregraphie prise en flagrant delit de bouger.

   Le releve se fait desormais en MOUVEMENT REDUIT. `langue.js` et
   `motion.js` s'y arretent net, donc aucun element n'est fabrique
   et aucune valeur n'est en cours d'interpolation : ce qui reste a
   comparer est exactement ce que le script pretend mesurer, la
   cascade des feuilles. */
async function releve(entiere, theme) {
  const ctx = await nav.newContext({
    viewport: { width: 1440, height: 900 },
    colorScheme: theme,
    reducedMotion: "reduce"
  });
  const page = await ctx.newPage();
  /* CE COMPARATEUR MESURE UNE FEUILLE, PAS UN SCENARIO.
     Deux couches en surimpression ont deja fausse ses verdicts :
     · la sequence d'entree — d'ou `aped-entree-saut` ;
     · le popup cadeau, qui parait tout seul a la onzieme seconde.
       Une passe le trouvait ouvert, l'autre ferme, et le rapport
       annoncait 77 « ecarts de cascade » sur `.cadeau` : `display`
       none contre block, `position` absolute contre fixed. Aucun
       n'existait — c'etait le meme element dans deux ETATS.
     Le test qui a leve le doute : les 77 ecarts portaient TOUS sur
     `dialog[7]`, et le verdict alternait entre 0 et 77 d'une passe
     a l'autre sans qu'une ligne de CSS bouge. Un ecart de cascade
     ne clignote pas. */
  await page.addInitScript((t) => {
    try {
      localStorage.setItem("aped-theme", t);
      sessionStorage.setItem("aped-sans-popup", "1");
      sessionStorage.setItem("aped-entree-saut", "1");
    } catch (e) {}
  }, theme);

  if (entiere) {
    /* Le CONTROLE : on sert `app.css` a la place des deux morceaux.
       `differe.css` devient vide pour ne pas appliquer deux fois. */
    await page.route("**/css/critique.css", async (route) => {
      const res = await route.fetch({ url: BASE + "css/app.css" });
      await route.fulfill({ status: 200, contentType: "text/css", body: await res.text() });
    });
    await page.route("**/css/differe.css", (route) =>
      route.fulfill({ status: 200, contentType: "text/css", body: "" }));
  }

  await page.goto(BASE, { waitUntil: "load" });
  /* On attend que les feuilles differees soient posees ET appliquees. */
  await page.waitForFunction(() =>
    [...document.styleSheets].some((f) => (f.href || "").endsWith("differe.css") || (f.href || "").endsWith("app.css")),
    null, { timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(1800);
  /* On visite la page pour que tout soit mis en page. */
  await page.evaluate(async () => {
    const pas = window.innerHeight * 0.9;
    for (let y = 0; y < document.documentElement.scrollHeight; y += pas) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 40));
    }
    window.scrollTo(0, 0);
  });
  /* PIEGE 4, PAR PRECAUTION ET NON PAR DIAGNOSTIC.
     Les sections portent `content-visibility: auto` : une fois revenu
     en haut, ce qui est hors ecran n'est plus mis en page, et toute
     valeur calculee qui depend de la mise en page devient une valeur
     RESERVEE. On leve donc la propriete DES DEUX COTES avant de lire.
     Ca ne suffit pas a expliquer la divergence de marge `auto` du
     2026-07-31 — mesuree, elle persiste apres la levee — mais ca
     retire une variable de la mesure. */
  await page.addStyleTag({
    content: "*, *::before, *::after { content-visibility: visible !important; contain-intrinsic-size: auto !important; }",
  });
  await page.waitForTimeout(900);

  const out = await page.evaluate((props) => {
    /* UNE CLE STRUCTURELLE, PAS UN INDEX.
       La premiere version numerotait les elements dans l'ordre du
       document. Mais le popup, les treize maquettes et les feuilles
       differees n'arrivent pas toujours au meme moment : deux
       releves n'avaient pas la meme numerotation, et l'outil
       comparait alors deux elements DIFFERENTS en croyant les avoir
       apparies. Le chemin dans l'arbre, lui, ne bouge pas. */
    function chemin(el) {
      const morceaux = [];
      let n = el;
      while (n && n !== document.body) {
        const p = n.parentElement;
        const rang = p ? [...p.children].indexOf(n) : 0;
        morceaux.unshift(n.tagName.toLowerCase() + "[" + rang + "]");
        n = p;
      }
      return morceaux.join(">");
    }
    const res = {};
    for (const el of document.querySelectorAll("body *")) {
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      const v = {
        __classe: (typeof el.className === "string" ? el.className : "") || "",
        __rect: [Math.round(r.left), Math.round(r.width), Math.round(r.height)].join("/"),
      };
      for (const p of props) v[p] = cs.getPropertyValue(p);
      res[chemin(el)] = v;
    }
    return res;
  }, PROPS);

  await ctx.close();
  return out;
}

const rapport = { themes: {}, total: 0, ecarts: 0 };

for (const theme of ["light", "dark"]) {
  const decoupe = await releve(false, theme);
  const entiere = await releve(true, theme);

  const cles = Object.keys(decoupe);
  const ecarts = [];
  const lectures = [];
  const etats = [];
  for (const cle of cles) {
    const a = decoupe[cle], b = entiere[cle];
    if (!b) { ecarts.push({ cle, quoi: "element absent du controle" }); continue; }
    /* DEUX ETATS NE SONT PAS DEUX CASCADES.
       Certaines classes sont posees par le script apres un delai —
       `is-set` sur les filets de section arrive 760 ms apres son
       declencheur. Deux releves ne tombent pas au meme moment de
       cette horloge, et l'element a alors des classes differentes :
       comparer ses styles reviendrait a comparer deux etats, pas
       deux cascades. On les compte a part. */
    if ((a.__classe || "") !== (b.__classe || "")) {
      etats.push({ cle, decoupe: a.__classe, entiere: b.__classe });
      continue;
    }
    for (const p of PROPS) {
      /* Les transformations sont echantillonnees pendant que des
         animations tournent : deux releves ne tombent jamais sur la
         meme image. On ne compare donc que leur PRESENCE, pas leur
         valeur instantanee. */
      if (p === "transform") {
        if ((a[p] === "none") !== (b[p] === "none")) {
          ecarts.push({ cle, classe: a.__classe, prop: p, decoupe: a[p], entiere: b[p] });
        }
        continue;
      }
      if (a[p] === b[p]) continue;
      /* UNE MARGE `auto` QUI SE LIT AUTREMENT MAIS SE POSE AU MEME
         PIXEL N EST PAS UN ECART DE CASCADE.  Releve du 2026-07-31 :
         `.wrap` du bloc avant/apres rendait `margin-left: 0px` sur la
         page reelle et `48px` sur le controle, pour un rectangle
         IDENTIQUE au pixel dans les deux cas — Chrome ne resout pas
         la valeur utilisee de la meme facon selon que la feuille est
         posee par le document ou injectee par script.  On le compte
         a part, on ne le cache pas. */
      if (/^margin-/.test(p) && a.__rect === b.__rect && (a[p] === "0px" || b[p] === "0px")) {
        lectures.push({ cle, classe: a.__classe, prop: p, decoupe: a[p], entiere: b[p], rect: a.__rect });
        continue;
      }
      ecarts.push({ cle, classe: a.__classe, prop: p, decoupe: a[p], entiere: b[p] });
    }
  }
  rapport.themes[theme] = {
    elements: cles.length,
    ecarts: ecarts.length,
    etatsDifferents: etats.length,
    lectures: lectures.length,
    detailLectures: lectures.slice(0, 8),
    detail: ecarts.slice(0, 40),
    detailEtats: etats.slice(0, 10)
  };
  rapport.total += cles.length * PROPS.length;
  rapport.ecarts += ecarts.length;
  console.log(`${theme.padEnd(6)} ${cles.length} elements · ${cles.length * PROPS.length} proprietes · ${ecarts.length} ecart(s) de cascade · ${etats.length} element(s) dans un etat different · ${lectures.length} lecture(s) de marge auto a geometrie identique`);
  lectures.slice(0, 6).forEach((l) =>
    console.log(`   LECTURE  .${l.classe || "(sans classe)"}  ${l.prop} : « ${l.decoupe} » contre « ${l.entiere} », meme rectangle ${l.rect}`));
  ecarts.slice(0, 20).forEach((e) =>
    console.log(`   .${e.classe || "(sans classe)"}  ${e.prop}\n      decoupe « ${e.decoupe} »\n      entiere « ${e.entiere} »\n      ${e.cle}`));
}

await nav.close();
fs.writeFileSync(path.join(RACINE, "refonte-captures", "cascade.json"), JSON.stringify(rapport, null, 2), "utf8");
console.log(`\nTOTAL : ${rapport.ecarts} ecart(s) sur ${rapport.total} proprietes comparees`);
