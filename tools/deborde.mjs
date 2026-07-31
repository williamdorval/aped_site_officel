/* ============================================================
   CONTENU QUI DEBORDE SA BOITE
   `node tools/deborde.mjs [port] [largeurs...]`

   Cherche les elements dont le contenu depasse la boite qui le
   contient, c'est-a-dire tout ce qui est COUPE a l'ecran. C'est le
   defaut le plus visible et le moins detecte par un audit de
   contraste ou de debordement horizontal : la page ne defile pas
   plus large, mais le texte est ampute.

   On ne signale que les depassements reels : un `overflow` visible
   n'est pas un defaut, seul un `overflow: hidden` ou `auto` qui
   AVALE du contenu en est un.
   ============================================================ */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, "..");
const PORT = process.argv[2] || "8099";
const LARGEURS = process.argv.slice(3).map(Number).filter(Boolean);
const VUES = LARGEURS.length ? LARGEURS : [1920, 1440, 1280, 1024, 834, 430, 390, 360, 320];
const BASE = `http://127.0.0.1:${PORT}/`;

const nav = await chromium.launch();
const total = {};

for (const w of VUES) {
  const ctx = await nav.newContext({ viewport: { width: w, height: w < 700 ? 844 : 900 } });
  const page = await ctx.newPage();
  await page.addInitScript(() => { try { sessionStorage.setItem("aped-entree-saut", "1"); sessionStorage.setItem("aped-sans-popup", "1"); } catch (e) {} });
  await page.goto(BASE, { waitUntil: "load" });
  await page.waitForTimeout(700);

  /* On visite toute la page : beaucoup de blocs ne sont mis en page
     qu'une fois entres dans le champ. */
  await page.evaluate(async () => {
    const pas = window.innerHeight * 0.8;
    for (let y = 0; y < document.documentElement.scrollHeight; y += pas) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 90));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(500);

  const cas = await page.evaluate(() => {
    /* CE QUI DEBORDE EXPRES.
       Trois familles rognent volontairement, et les confondre avec
       un defaut rendrait ce rapport inutilisable : on ne les cache
       pas, on les NOMME, avec leur raison.
       Un outil de mesure qui melange le voulu et le rate ne se lit
       plus au bout de trois passages. */
    const INTENTIONNELS = [
      { sel: ".shot-vue", pourquoi: "la capture du site client est plus haute que son cadre : c'est le sujet" },
      { sel: ".svc-piste", pourquoi: "le rail horizontal des services" },
      { sel: ".mk-pano, .mk-galbody, .mock-body", pourquoi: "defilement interne d'une maquette de secteur" },
      { sel: ".parc-vis, [data-settle], .parc-corps", pourquoi: "etat de depart d'une animation d'entree, dans un cadre qui rogne" },
      { sel: ".sr-only", pourquoi: "boite de 1 px reservee aux lecteurs d'ecran : elle rogne par definition" },
      { sel: ".ecr-chrome span", pourquoi: "nom de domaine tronque par points de suspension, comme une vraie barre d'adresse" },
      { sel: ".sec-visu, .sec-planche, .sec-pano, .sec-gal", pourquoi: "defilement interne d'une maquette de secteur" },
      { sel: ".sec-panier, .sec-toast, .sec-page", pourquoi: "etat de depart d'une animation de maquette, dans un cadre qui rogne" },
      { sel: ".seuil-num, .entree-cran, .odo, .odo-c", pourquoi: "fenetre d'un compteur a crans : elle tient DEUX valeurs et n'en montre qu'une. Le rognage est le mecanisme, pas un defaut" },
      { sel: ".sas-scene", pourquoi: "la scene d'un sas rogne expres : l'arete de grains du volet depasse son bord pour mordre sur ce qu'il avale (D-571)" },
      { sel: ".ba-vue", pourquoi: "les deux cotes d'une comparaison sont plus hauts que leur cadre PAR CONSTRUCTION : la boucle n'en parcourt qu'une fenetre. Les selecteurs `.ap-*` qui figuraient ici sont partis avec les maquettes redessinees, remplacees par des captures des vrais sites (D-617)" },
      { sel: ".v11-defile", pourquoi: "le texte defilant de la maquette 2011 est un marquee diegetique : il deborde parce que les sites de 2011 debordaient (A79e)" }
    ];
    const out = [];
    for (const el of document.querySelectorAll("body *")) {
      if (el.closest("template, [hidden]")) continue;
      const voulu = INTENTIONNELS.find((k) => el.matches(k.sel));
      if (voulu) continue;
      /* Un enfant qui deborde d'un cadre qui rogne VOLONTAIREMENT
         n'est pas un defaut non plus : c'est le meme fait, compte
         deux fois. */
      if (el.closest(".shot-vue, .parc-vis, [data-settle], .mock, .svc-piste")) continue;
      const cs = getComputedStyle(el);
      if (cs.display === "none" || cs.visibility === "hidden") continue;
      const coupeY = (cs.overflowY === "hidden" || cs.overflowY === "clip") && el.scrollHeight - el.clientHeight > 2;
      const coupeX = (cs.overflowX === "hidden" || cs.overflowX === "clip") && el.scrollWidth - el.clientWidth > 2;
      if (!coupeY && !coupeX) continue;
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) continue;
      out.push({
        sel: el.tagName.toLowerCase() +
          (el.id ? "#" + el.id : "") +
          (typeof el.className === "string" && el.className ? "." + el.className.trim().split(/\s+/).slice(0, 2).join(".") : ""),
        depasseY: coupeY ? el.scrollHeight - el.clientHeight : 0,
        depasseX: coupeX ? el.scrollWidth - el.clientWidth : 0,
        texte: (el.textContent || "").trim().slice(0, 48)
      });
    }
    return out;
  });

  const debordH = await page.evaluate(() => ({
    sw: document.documentElement.scrollWidth,
    cw: document.documentElement.clientWidth
  }));

  total[w] = { coupes: cas, debordementHorizontal: debordH.sw > debordH.cw ? `${debordH.sw} > ${debordH.cw}` : "aucun" };
  await ctx.close();
}

await nav.close();
fs.mkdirSync(path.join(RACINE, "refonte-captures"), { recursive: true });
fs.writeFileSync(path.join(RACINE, "refonte-captures", "deborde.json"), JSON.stringify(total, null, 2), "utf8");

for (const [w, r] of Object.entries(total)) {
  console.log(`\n=== ${w} px === debordement horizontal : ${r.debordementHorizontal}`);
  if (!r.coupes.length) { console.log("  aucun contenu coupe"); continue; }
  for (const c of r.coupes) {
    console.log(`  ${c.sel}  ${c.depasseY ? "hauteur +" + c.depasseY : ""}${c.depasseX ? " largeur +" + c.depasseX : ""}  « ${c.texte} »`);
  }
}
