/* ============================================================
   FABRICATION DES DEUX PDF
   `node tools/pdf.mjs`            -> les deux
   `node tools/pdf.mjs automatisation`  -> un seul

   Outil de FABRICATION. Il ne tourne jamais chez le visiteur.
   Il rend `documents/src/<nom>.html` en A4 avec Chromium, par le
   meme moteur que le reste de la mesure (Playwright, deja present).

   La feuille `print.css` pagine explicitement : chaque `.page` est
   une page physique de 210 x 297 mm. On imprime donc SANS marge et
   SANS en-tete de navigateur, sinon Chromium ajoute sa propre
   pagination par-dessus la notre.

   Il rend aussi le NOMBRE DE PAGES reel, parce que c'est le seul
   chiffre qu'on a le droit d'ecrire dans le pied de page du site.
   ============================================================ */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, "..");
const SRC = path.join(RACINE, "documents/src");
/* LES PDF NE SORTENT PLUS DANS L ARBRE SERVI.  D-788
   Ils tombaient dans `documents/`, donc a la racine du site :
   `GET /documents/aped-automatisation.pdf` rendait 2 Mo a qui
   connaissait l adresse, pendant que le popup annoncait « contre vos
   coordonnees ». Ils vont sous `google/`, avec le code du serveur —
   un dossier qu on ne televerse jamais. Le rangement fait ce qu une
   consigne de deploiement ne fait pas : on ne peut plus les publier
   par distraction. */
const OUT = path.join(RACINE, "google", "guides");

const DOCS = [
  { id: "aped-automatisation", titre: "Ce que votre entreprise pourrait automatiser" },
  { id: "aped-ia-croissance", titre: "Comment utiliser l'IA pour faire grossir votre entreprise" }
];

const filtre = process.argv[2];
const cible = filtre ? DOCS.filter((d) => d.id.includes(filtre)) : DOCS;
if (!cible.length) {
  console.error(`Aucun document ne correspond a "${filtre}".`);
  process.exit(1);
}

const nav = await chromium.launch();
const rapport = [];

for (const doc of cible) {
  const src = path.join(SRC, `${doc.id}.html`);
  if (!fs.existsSync(src)) {
    console.error(`MANQUE  ${src}`);
    continue;
  }
  const page = await nav.newPage();
  const erreurs = [];
  page.on("pageerror", (e) => erreurs.push(String(e)));
  page.on("console", (m) => { if (m.type() === "error") erreurs.push(m.text()); });

  await page.goto("file:///" + src.replace(/\\/g, "/"), { waitUntil: "load" });
  await page.emulateMedia({ media: "print" });
  /* Les six woff2 sont en `font-display: block` : sans cette
     attente, la premiere page sort parfois en police de repli. */
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);

  /* VERIFICATION DE PAGINATION — deux mesures, et il en faut deux.

     La premiere version ne regardait que `page.scrollHeight`. Elle
     etait AVEUGLE au defaut le plus frequent de cette feuille :
     `.page__body` est un element flex a `min-height: 0`, donc quand
     son contenu deborde il se laisse ECRASER. Le contenu passe sous
     le pied de page et disparait, sans que `.page` grandisse d'un
     pixel. Constat du 2026-07-26 : quinze pages d'un document
     rendaient « zero debordement » alors qu'un encadre recouvrait
     litteralement le numero de page.

     On mesure donc aussi le corps, et le chevauchement reel entre
     le bas du dernier bloc et le haut du pied de page. Un outil de
     mesure qui rate le defaut qu'il est cense trouver est pire
     qu'aucun outil : il donne une garantie fausse. */
  const pages = await page.evaluate(() => {
    const el = [...document.querySelectorAll(".page")];
    const mm297 = Math.round(297 / 25.4 * 96);
    const out = [];
    el.forEach((n, i) => {
      const causes = [];
      const hPage = Math.round(n.scrollHeight);
      if (hPage > mm297 + 2) causes.push(`page ${hPage}px > ${mm297}px`);

      const corps = n.querySelector(".page__body") || n;
      const ecrase = Math.round(corps.scrollHeight - corps.clientHeight);
      if (ecrase > 2) causes.push(`corps ecrase de ${ecrase}px`);

      const pied = n.querySelector(".page__foot");
      if (pied) {
        const rp = pied.getBoundingClientRect();
        let bas = -Infinity;
        for (const enfant of corps.children) {
          const r = enfant.getBoundingClientRect();
          if (r.height) bas = Math.max(bas, r.bottom);
        }
        const chevauche = Math.round(bas - rp.top);
        if (chevauche > 2) causes.push(`chevauche le pied de ${chevauche}px`);
      }

      if (causes.length) out.push({ i: i + 1, id: n.dataset.id || "", causes });
    });
    return { total: el.length, debordent: out };
  });

  const dest = path.join(OUT, `${doc.id}.pdf`);
  await page.pdf({
    path: dest,
    format: "A4",
    printBackground: true,
    preferCSSPageSize: true,
    margin: { top: "0", right: "0", bottom: "0", left: "0" }
  });
  await page.close();

  const ko = Math.round(fs.statSync(dest).size / 1024);
  rapport.push({ id: doc.id, pages: pages.total, ko, debordent: pages.debordent, erreurs });
  console.log(`OK  ${doc.id}.pdf  ${pages.total} pages  ${ko} Ko`);
  if (pages.debordent.length) {
    for (const d of pages.debordent) console.log(`    DEBORDE p.${d.i} (${d.id}) : ${d.causes.join(" · ")}`);
  }
  if (erreurs.length) console.log(`    ERREURS : ${erreurs.join(" | ")}`);
}

await nav.close();
fs.writeFileSync(path.join(OUT, "rapport-pdf.json"), JSON.stringify(rapport, null, 2), "utf8");
console.log("\n" + JSON.stringify(rapport.map((r) => ({ id: r.id, pages: r.pages, ko: r.ko })), null, 2));
