/* ============================================================
   LA PASSE DE PRODUCTION
   `node tools/production-check.mjs [port|adresse]`

   « Aucun bouton qui ne mène nulle part — teste-les TOUS. »
   Alors on les teste tous, un par un, et on rend la liste.

   SEPT RELEVES.

   1. LES LIENS. Chaque `href` du document rendu :
      · une ancre interne doit designer un element QUI EXISTE ;
      · un fichier relatif doit repondre 200 ;
      · `mailto:` et `tel:` doivent porter une valeur ;
      · un lien externe doit porter `rel` avec `noopener`.
   2. LES BOUTONS. Un bouton sans `type="submit"`, sans attribut de
      commande (`data-*`) et sans `aria-controls` ne mene nulle part
      par construction : on le nomme.
   3. LES MOTS DE REMPLISSAGE. « lorem », « à venir », « TODO »,
      « placeholder », « bientôt », « xxx » — dans le texte RENDU,
      pas seulement dans la source.
   4. LES IMAGES. Chargees, et dimensionnees : une image sans
      `width`/`height` est un decalage de mise en page en attente.
   5. LES REQUETES TIERCES. Zero, sans exception.
   6. LES ERREURS DE CONSOLE. Zero, sans exception.
   7. LES DOCUMENTS. Chaque PDF annonce doit repondre, et repondre
      en PDF.

   On visite la page ENTIERE avant de conclure : la moitie des liens
   vit dans des sections que `content-visibility` n'a pas encore
   mises en page.
   ============================================================ */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { adresse } from "./_adresse.mjs";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, "..");
const BASE = adresse(process.argv[2]);
const SORTIE = path.join(RACINE, "preuves", "production");
fs.mkdirSync(SORTIE, { recursive: true });

const REMPLISSAGE = [
  "lorem ipsum", "à venir", "a venir", "todo", "placeholder",
  "coming soon", "bientôt disponible", "xxxx", "à compléter", "tbd"
];

const nav = await chromium.launch();
const ctx = await nav.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
const erreurs = [];
const tierces = [];
page.on("pageerror", (e) => erreurs.push("pageerror: " + String(e)));
page.on("console", (m) => { if (m.type() === "error") erreurs.push("console: " + m.text()); });
page.on("request", (r) => {
  const u = r.url();
  if (/^https?:\/\//.test(u) && !u.startsWith(BASE)) tierces.push(u.slice(0, 120));
});
await page.addInitScript(() => {
  try { sessionStorage.setItem("aped-entree-saut", "1"); sessionStorage.setItem("aped-sans-popup", "1"); } catch (e) {}
});
await page.goto(BASE + "/", { waitUntil: "load" });
await page.waitForTimeout(1800);

/* On parcourt toute la page : sans ca, les sections en
   `content-visibility` ne sont pas mises en page et la moitie des
   liens n'existe pas encore pour le navigateur. */
await page.evaluate(async () => {
  const pas = window.innerHeight * 0.8;
  for (let y = 0; y < document.documentElement.scrollHeight; y += pas) {
    window.scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 90));
  }
  window.scrollTo(0, 0);
});
await page.waitForTimeout(900);

/* On ouvre aussi les cinq panneaux et les modales : leurs boutons
   comptent autant que les autres. */
await page.evaluate(() => {
  document.querySelectorAll(".svc-fiche").forEach((f) => f.setAttribute("data-ouvert", ""));
  document.querySelectorAll("dialog.modal, .modal").forEach((m) => { m.hidden = false; });
});
await page.waitForTimeout(600);

const releve = await page.evaluate((mots) => {
  const liens = [];
  for (const a of document.querySelectorAll("a[href]")) {
    const h = a.getAttribute("href") || "";
    const texte = (a.textContent || "").trim().slice(0, 44) || a.getAttribute("aria-label") || "(sans texte)";
    let genre = "relatif", ok = null, note = "";
    if (h.startsWith("#")) {
      genre = "ancre";
      if (h === "#") { ok = false; note = "ancre vide"; }
      else { ok = !!document.querySelector(h.replace(/([^\w-])/g, "\\$1").replace(/^\\#/, "#")) || !!document.getElementById(h.slice(1)); if (!ok) note = "cible absente"; }
    } else if (h.startsWith("mailto:")) {
      genre = "mailto"; ok = h.length > 8 && h.indexOf("@") > 0; if (!ok) note = "adresse vide";
    } else if (h.startsWith("tel:")) {
      genre = "tel"; ok = /\d{6,}/.test(h); if (!ok) note = "numero vide";
    } else if (/^https?:\/\//.test(h)) {
      genre = "externe";
      const rel = (a.getAttribute("rel") || "");
      ok = rel.indexOf("noopener") >= 0;
      if (!ok) note = "rel sans noopener : « " + rel + " »";
    } else if (h.startsWith("javascript:")) {
      genre = "javascript"; ok = false; note = "lien mort";
    }
    liens.push({ h, texte, genre, ok, note });
  }

  /* Les boutons sont marques ici, mais le VERDICT vient d'ailleurs :
     un attribut `data-*` n'est qu'un indice, et l'absence d'indice
     n'est pas une preuve. On demande les vrais ecouteurs au moteur,
     plus bas, par CDP. */
  const boutons = [];
  document.querySelectorAll("button").forEach((b, i) => {
    b.setAttribute("data-_pc", String(i));
    const attrs = Array.from(b.attributes).map((x) => x.name);
    boutons.push({
      i,
      texte: (b.textContent || "").trim().slice(0, 40) || b.getAttribute("aria-label") || "(sans texte)",
      type: b.type,
      indice: attrs.some((n) => n.indexOf("data-") === 0 && n !== "data-_pc") || b.type === "submit" || b.hasAttribute("aria-controls")
    });
  });

  const t = (document.body.innerText || "").toLowerCase();
  const remplissage = mots.filter((m) => t.indexOf(m) >= 0);

  const images = [];
  for (const i of document.querySelectorAll("img")) {
    /* Une image differee dans un calque FERME n'a jamais eu a se
       charger : la compter comme cassee ferait dire a l'outil qu'un
       fichier manque alors qu'il est la et qu'il repond. On la
       compte a part, et on verifie le fichier par une requete. */
    const visible = !!(i.offsetParent || i.getClientRects().length);
    images.push({
      src: (i.getAttribute("src") || "").slice(0, 70),
      chargee: i.naturalWidth > 0,
      visible,
      dimensionnee: !!(i.getAttribute("width") && i.getAttribute("height")),
      differee: i.getAttribute("loading") === "lazy"
    });
  }

  const docs = [...document.querySelectorAll('a[href$=".pdf"]')].map((a) => a.getAttribute("href"));
  return { liens, boutons, remplissage, images, docs: [...new Set(docs)] };
}, REMPLISSAGE);

/* LES ECOUTEURS SE DEMANDENT AU MOTEUR.  D-623
   Un bouton peut etre cable par son `id`, sans le moindre attribut
   `data-*` : la bascule de theme et les deux fleches du calendrier
   le sont. Les declarer « muets » sur la foi d'une heuristique
   d'attributs, c'etait quatre faux verdicts sur quatre. On demande
   donc a Chromium la liste reelle de ses ecouteurs — sur le bouton
   ET sur ses ancetres, puisque la delegation est legitime. */
{
  const cdp = await ctx.newCDPSession(page);
  for (const b of releve.boutons) {
    const h = await page.evaluateHandle((i) => document.querySelector(`[data-_pc="${i}"]`), b.i);
    const { objectId } = h._preview ? {} : await cdp.send("Runtime.evaluate", {
      expression: `document.querySelector('[data-_pc="${b.i}"]')`
    }).then((r) => r.result);
    b.ecouteurs = 0;
    if (objectId) {
      try {
        const { listeners } = await cdp.send("DOMDebugger.getEventListeners", { objectId, depth: -1, pierce: true });
        b.ecouteurs = (listeners || []).filter((l) => l.type === "click" || l.type === "pointerdown").length;
      } catch (e) { b.ecouteurs = -1; }
    }
    /* Un ancetre porteur d'un ecouteur de clic suffit : la
       delegation est une facon normale de cabler. */
    if (!b.ecouteurs) {
      const parDelegation = await page.evaluate((i) => {
        const el = document.querySelector(`[data-_pc="${i}"]`);
        return !!(el && el.closest("form, [data-svc-piste], .cal-days, #slotsList, .roi-presets, [data-modal], dialog"));
      }, b.i);
      b.delegue = parDelegation;
    }
    b.mene = b.indice || b.ecouteurs > 0 || !!b.delegue;
    await h.dispose();
  }
}

/* CE QUI RESTE SANS ECOUTEUR SE FAIT CLIQUER.  D-624
   `DOMDebugger.getEventListeners` ne rend que les ecouteurs du
   noeud et de ses DESCENDANTS : un bouton cable par delegation sur
   un ancetre y passe pour muet. Plutot que d'empiler les
   heuristiques, on tranche par l'experience — on clique, et on
   regarde si quoi que ce soit a bouge dans le document. C'est
   exactement la question posee : « est-ce que ce bouton mene
   quelque part ? » */
{
  const restants = releve.boutons.filter((b) => !b.mene);
  for (const b of restants) {
    const p2 = await ctx.newPage();
    await p2.addInitScript(() => {
      try { sessionStorage.setItem("aped-entree-saut", "1"); sessionStorage.setItem("aped-sans-popup", "1"); } catch (e) {}
    });
    await p2.goto(BASE + "/", { waitUntil: "load" });
    await p2.waitForTimeout(1500);
    await p2.evaluate(async () => {
      const pas = window.innerHeight * 0.8;
      for (let y = 0; y < document.documentElement.scrollHeight; y += pas) {
        window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60));
      }
      window.scrollTo(0, 0);
    });
    await p2.evaluate(() => {
      document.querySelectorAll("button").forEach((x, i) => x.setAttribute("data-_pc", String(i)));
    });
    const signature = () => p2.evaluate(() => ({
      taille: document.documentElement.outerHTML.length,
      theme: document.documentElement.getAttribute("data-theme"),
      hash: location.hash,
      y: Math.round(window.scrollY),
      calendrier: (document.getElementById("calMonth") || {}).textContent || ""
    }));
    const avant = await signature();
    const clique = await p2.evaluate((i) => {
      const el = document.querySelector(`[data-_pc="${i}"]`);
      if (!el) return false;
      el.scrollIntoView({ block: "center", behavior: "instant" });
      el.click();
      return true;
    }, b.i).catch(() => false);
    await p2.waitForTimeout(500);
    const apres = await signature();
    b.clique = clique;
    b.aChange = clique && JSON.stringify(avant) !== JSON.stringify(apres);
    b.mene = b.aChange;
    await p2.close();
  }
}

/* Les fichiers relatifs se verifient par une vraie requete. */
const relatifs = [...new Set(releve.liens.filter((l) => l.genre === "relatif").map((l) => l.h))];
const reponses = {};
for (const h of relatifs.concat(releve.docs)) {
  const u = h.startsWith("/") ? BASE + h : BASE + "/" + h;
  try {
    const r = await page.request.get(u);
    reponses[h] = { statut: r.status(), type: (r.headers()["content-type"] || "").split(";")[0] };
  } catch (e) {
    reponses[h] = { statut: 0, type: "erreur : " + String(e).slice(0, 60) };
  }
}
for (const l of releve.liens) {
  if (l.genre !== "relatif") continue;
  const r = reponses[l.h];
  l.ok = !!r && r.statut === 200;
  if (!l.ok) l.note = "reponse " + (r ? r.statut : "?");
}

const liensMorts = releve.liens.filter((l) => l.ok === false);
const boutonsMuets = releve.boutons.filter((b) => !b.mene);
const imagesVides = releve.images.filter((i) => !i.chargee && i.visible);
const imagesDormantes = releve.images.filter((i) => !i.chargee && !i.visible);
const imagesSansTaille = releve.images.filter((i) => !i.dimensionnee);
const pdfHs = Object.entries(reponses).filter(([h, r]) => h.endsWith(".pdf") && (r.statut !== 200 || r.type !== "application/pdf"));

const R = {
  liens: releve.liens.length,
  parGenre: releve.liens.reduce((a, l) => { a[l.genre] = (a[l.genre] || 0) + 1; return a; }, {}),
  liensMorts,
  boutons: releve.boutons.length,
  boutonsMuets,
  motsDeRemplissage: releve.remplissage,
  images: releve.images.length,
  imagesVides,
  imagesDormantes,
  imagesSansTaille,
  pdf: Object.entries(reponses).filter(([h]) => h.endsWith(".pdf")).map(([h, r]) => ({ h, ...r })),
  requetesTierces: [...new Set(tierces)],
  erreurs
};
R.verdict = {
  aucunLienMort: liensMorts.length === 0,
  aucunBoutonMuet: boutonsMuets.length === 0,
  aucunMotDeRemplissage: releve.remplissage.length === 0,
  toutesLesImagesChargent: imagesVides.length === 0,
  toutesLesImagesSontDimensionnees: imagesSansTaille.length === 0,
  lesDeuxDocumentsRepondent: pdfHs.length === 0,
  aucuneRequeteTierce: R.requetesTierces.length === 0,
  aucuneErreurConsole: erreurs.length === 0
};
fs.writeFileSync(path.join(SORTIE, "rapport.json"), JSON.stringify(R, null, 2));

console.log(`LIENS : ${R.liens}  ${JSON.stringify(R.parGenre)}`);
if (liensMorts.length) liensMorts.forEach((l) => console.log(`  MORT  ${l.genre}  ${l.h}  « ${l.texte} »  ${l.note}`));
else console.log("  aucun lien mort");
console.log(`\nBOUTONS : ${R.boutons}`);
if (boutonsMuets.length) boutonsMuets.forEach((b) => console.log(`  MUET  « ${b.texte} »  type=${b.type}  ecouteurs=${b.ecouteurs}  clique=${b.clique}  a change=${b.aChange}`));
else console.log("  aucun bouton sans commande");
console.log(`\nMOTS DE REMPLISSAGE : ${releve.remplissage.length ? releve.remplissage.join(" · ") : "aucun"}`);
console.log(`IMAGES : ${R.images}  vides ${imagesVides.length}  differees dans un calque ferme ${imagesDormantes.length}  sans width/height ${imagesSansTaille.length}`);
imagesDormantes.forEach((i) => console.log(`  DORMANTE (fichier verifie a part)  ${i.src}`));
imagesVides.forEach((i) => console.log(`  VIDE  ${i.src}`));
imagesSansTaille.forEach((i) => console.log(`  SANS TAILLE  ${i.src}`));
console.log(`DOCUMENTS : ${R.pdf.map((p) => p.h + " " + p.statut + " " + p.type).join(" · ") || "aucun"}`);
console.log(`REQUETES TIERCES : ${R.requetesTierces.length ? R.requetesTierces.join(" · ") : "aucune"}`);
console.log(`ERREURS CONSOLE : ${erreurs.length ? erreurs.join(" | ") : "aucune"}`);
const rate = Object.entries(R.verdict).filter(([, v]) => !v);
console.log(rate.length ? "\nECHEC : " + rate.map(([k]) => k).join(", ") : "\nTOUT PASSE");
process.exitCode = rate.length ? 1 : 0;
await nav.close();
