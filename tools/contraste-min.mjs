/* ============================================================
   CONTRASTE MINIMUM PAR SECTION
   `node tools/contraste-min.mjs [port]`

   `theme-check.mjs` dit COMBIEN d'echecs. Celui-ci dit ou se trouve
   la marge la plus mince, section par section et dans les deux
   themes : c'est le chiffre a surveiller quand on retouche une
   couleur, parce que c'est celui qui basculera en premier.
   ============================================================ */
import { chromium } from "playwright";

const PORT = process.argv[2] || "8099";
const nav = await chromium.launch();

for (const theme of ["light", "dark"]) {
  const ctx = await nav.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: theme });
  const page = await ctx.newPage();
  await page.addInitScript((t) => {
    try { localStorage.setItem("adexweb-theme", t); sessionStorage.setItem("adexweb-entree-saut", "1"); sessionStorage.setItem("adexweb-sans-popup", "1"); } catch (e) {}
  }, theme);
  await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: "load" });
  await page.waitForTimeout(900);
  await page.evaluate(async () => {
    const pas = window.innerHeight * 0.8;
    for (let y = 0; y < document.documentElement.scrollHeight; y += pas) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 50));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(600);

  const parSection = await page.evaluate(() => {
    function lum(c) {
      const s = c.map((v) => {
        const x = v / 255;
        return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * s[0] + 0.7152 * s[1] + 0.0722 * s[2];
    }
    function rgb(v) {
      const m = String(v).match(/rgba?\(([^)]+)\)/);
      if (!m) return null;
      const q = m[1].split(",").map(parseFloat);
      return { c: [q[0], q[1], q[2]], a: q.length > 3 ? q[3] : 1 };
    }
    /* Le fond REEL : on remonte jusqu'a la premiere surface opaque.
       Mesurer contre le fond declare de l'element donnerait le ratio
       d'une couleur qui n'est peinte nulle part.

       UN FOND EN `background-image` N'EST PAS UN FOND ABSENT.  D-639
       Cette remontee ne regardait que `background-color`. Or une
       surface peut etre peinte par un DEGRADE ou une IMAGE, et sa
       `background-color` reste alors `transparent` : la remontee
       passait au travers et allait chercher le blanc d'un ancetre
       trois niveaux plus haut. Resultat le 2026-07-31 : du texte
       blanc sur une barre bleue en degrade rendait « 1:1 » — le pire
       verdict possible sur du texte parfaitement lisible. Mesure aux
       PIXELS PEINTS du meme texte : 6,65:1.
       Un faux 1:1 ne coute pas qu'une ligne de rapport. Il noie les
       vrais echecs, et il pousse a « corriger » du code sain.
       On rend donc `null` : non calculable depuis les styles
       calcules, a mesurer a l'image. Ce qui n'est pas calculable ne
       compte pas comme un echec, et ne compte pas comme un succes
       non plus — c'est dit a part. */
    function fond(el) {
      let n = el;
      while (n && n !== document.documentElement) {
        const cs = getComputedStyle(n);
        if (cs.backgroundImage && cs.backgroundImage !== "none") return null;
        const c = rgb(cs.backgroundColor);
        if (c && c.a >= 0.95) return c.c;
        n = n.parentElement;
      }
      return rgb(getComputedStyle(document.body).backgroundColor).c;
    }
    const out = {};
    for (const sec of document.querySelectorAll("section[id], footer, dialog")) {
      const id = sec.id || sec.tagName.toLowerCase();
      let min = 99, quoi = "", px = 0, horsCalcul = 0;
      for (const el of sec.querySelectorAll("*")) {
        if (el.closest("[aria-hidden='true'], template")) continue;
        const t = [...el.childNodes]
          .filter((n) => n.nodeType === 3 && n.textContent.trim())
          .map((n) => n.textContent.trim()).join(" ");
        if (!t) continue;
        const cs = getComputedStyle(el);
        if (cs.visibility === "hidden" || cs.display === "none" || parseFloat(cs.opacity) < 0.5) continue;
        const r = el.getBoundingClientRect();
        if (!r.width || !r.height) continue;
        const fg = rgb(cs.color);
        if (!fg) continue;
        const bg = fond(el);
        if (bg === null) { horsCalcul++; continue; }
        const l1 = lum(fg.c), l2 = lum(bg);
        const ct = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
        if (ct < min) { min = ct; quoi = t.slice(0, 36); px = Math.round(parseFloat(cs.fontSize)); }
      }
      if (min < 99) out[id] = { min: Math.round(min * 100) / 100, quoi, px, horsCalcul };
    }
    return out;
  });

  console.log(`\n--- ${theme === "light" ? "CLAIR" : "SOMBRE"} ---`);
  for (const [k, v] of Object.entries(parSection)) {
    console.log(`  ${k.padEnd(14)} ${String(v.min).padStart(6)}:1  ${String(v.px).padStart(3)}px  « ${v.quoi} »` + (v.horsCalcul ? `   [${v.horsCalcul} hors calcul : fond en image ou degrade, a mesurer a l'image]` : ""));
  }
  await ctx.close();
}
await nav.close();
