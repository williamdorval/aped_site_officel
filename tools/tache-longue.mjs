/* ============================================================
   D'OU VIENT LA TACHE LONGUE
   `node tools/tache-longue.mjs [port] [n]`

   On ne devine pas : on retire un poste a la fois, EN VOL, par
   interception de la reponse, et on mesure. Aucun fichier n'est
   modifie, donc les variantes sont comparables entre elles et
   reproductibles.

   Variantes :
   · reference       le site tel quel
   · sans-template   le `<template>` des treize secteurs, vide
   · sans-modales    les six modales, videes
   · sans-css        `app.css` servi vide
   · os-a-la-moelle  les trois a la fois
   ============================================================ */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, "..");
const PORT = process.argv[2] || "8099";
const N = Number(process.argv[3] || 7);
const BASE = `http://127.0.0.1:${PORT}/`;

const VARIANTES = {
  "reference": { html: (h) => h, css: null },
  "sans-template": {
    html: (h) => h.replace(/<template id="tplSecteurs">[\s\S]*?<\/template>/,
      '<template id="tplSecteurs"></template>'),
    css: null
  },
  "sans-modales": {
    html: (h) => h.replace(/<div class="modal" id="modal-[\s\S]*?\n<\/div>\n\n/g, ""),
    css: null
  },
  "sans-icones": {
    /* Le jeu d'icones est un `<svg>` en ligne de 4 Ko avec seize
       `<symbol>` : il n'est pas peint, mais il est analyse. */
    html: (h) => h.replace(/<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" style="display:none"[\s\S]*?<\/svg>/, ""),
    css: null
  },
  "sans-css": { html: (h) => h, css: "" },
  "os-a-la-moelle": {
    html: (h) => h
      .replace(/<template id="tplSecteurs">[\s\S]*?<\/template>/, '<template id="tplSecteurs"></template>')
      .replace(/<div class="modal" id="modal-[\s\S]*?\n<\/div>\n\n/g, ""),
    css: ""
  }
};

const med = (a) => [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)];
const nav = await chromium.launch();
const R = {};

for (const [nom, v] of Object.entries(VARIANTES)) {
  const lcp = [], tache = [], octets = [];
  for (let i = 0; i < N; i++) {
    const ctx = await nav.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();

    await page.route(BASE, async (route) => {
      const res = await route.fetch();
      let h = await res.text();
      h = v.html(h);
      octets.push(Buffer.byteLength(h));
      await route.fulfill({ response: res, body: h });
    });
    if (v.css !== null) {
      await page.route("**/css/critique.css", (route) =>
        route.fulfill({ status: 200, contentType: "text/css", body: v.css }));
    }

    await page.addInitScript(() => {
      window.__l = 0; window.__t = 0; window.__liste = [];
      new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__l = e.startTime; })
        .observe({ type: "largest-contentful-paint", buffered: true });
      /* On garde la LISTE, pas seulement le maximum. Le maximum
         cachait le fait qu'il y a DEUX taches longues a des moments
         differents : celle d'avant la peinture et celle de
         l'evaluation des scripts. Retirer un poste faisait alors
         « baisser » le chiffre en revelant simplement l'autre tache,
         ce qui se lit comme un gain alors que ce n'en est pas un. */
      new PerformanceObserver((l) => {
        for (const e of l.getEntries()) {
          window.__t = Math.max(window.__t, e.duration);
          window.__liste.push({ d: Math.round(e.duration), s: Math.round(e.startTime) });
        }
      }).observe({ type: "longtask", buffered: true });
      try { sessionStorage.setItem("adexweb-entree-saut", "1"); sessionStorage.setItem("adexweb-sans-popup", "1"); } catch (e) {}
    });
    await page.goto(BASE, { waitUntil: "load" });
    await page.waitForTimeout(2000);
    const r = await page.evaluate(() => ({ l: Math.round(window.__l), t: Math.round(window.__t), liste: window.__liste }));
    lcp.push(r.l); tache.push(r.t);
    if (i === 0) R[nom + "__taches"] = r.liste;
    await ctx.close();
  }
  R[nom] = { lcp: med(lcp), tache: med(tache), htmlKo: Math.round(med(octets) / 1024) };
  const detail = (R[nom + "__taches"] || []).map((t) => `${t.d}ms@${t.s}`).join(" · ");
  console.log(`${nom.padEnd(16)} LCP ${String(R[nom].lcp).padStart(4)} ms   pire tache ${String(R[nom].tache).padStart(4)} ms   html ${String(R[nom].htmlKo).padStart(3)} Ko   [${detail}]`);
}

await nav.close();
fs.writeFileSync(path.join(RACINE, "refonte-captures", "tache-longue.json"), JSON.stringify(R, null, 2), "utf8");

const base = R["reference"];
console.log("\nGAIN PAR POSTE, sur la tache la plus longue :");
for (const [nom, v] of Object.entries(R)) {
  if (nom === "reference") continue;
  console.log(`  ${nom.padEnd(16)} ${String(base.tache - v.tache).padStart(4)} ms`);
}
