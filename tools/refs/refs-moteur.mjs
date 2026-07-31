/* ============================================================
   RECON — quel MOTEUR anime chacune des deux references.
   Les sondes precedentes ont rendu 0 mouvement sur fullstack et
   ont attrape un suiveur de curseur sur le toggle. Avant de
   remesurer, on identifie l'outil : GSAP + ScrollTrigger ? Lenis ?
   Webflow IX2 ? Framer motion ? Et on liste les VRAIS objets.
   Usage : node tools/refs-moteur.mjs
   ============================================================ */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const d = join(process.cwd(), "tools", "_refs", "accueil");
mkdirSync(d, { recursive: true });
const attendre = (ms) => new Promise((r) => setTimeout(r, ms));

const nav = await chromium.launch();

/* ---------------------------------------------------------- 1 */
const p1 = await nav.newPage({ viewport: { width: 1440, height: 900 } });
await p1.goto("https://fullstack-studio.webflow.io/", { waitUntil: "networkidle", timeout: 90000 });
await attendre(2500);

const moteur1 = await p1.evaluate(() => {
  const out = { url: location.href, globales: [], scripts: [], scrollTriggers: null, lenis: null, ix2: null, split: null };
  for (const k of ["gsap", "ScrollTrigger", "ScrollSmoother", "SplitText", "Lenis", "lenis", "Webflow", "barba", "Swiper", "motion", "Framer"])
    if (window[k] !== undefined) out.globales.push(k);
  out.scripts = [...document.querySelectorAll("script[src]")].map((s) => s.src.replace(/^https?:\/\//, "")).slice(0, 40);

  if (window.gsap) {
    out.gsapVersion = window.gsap.version;
    const st = window.ScrollTrigger || (window.gsap.core && window.gsap.core.globals().ScrollTrigger);
    if (st && st.getAll) {
      out.scrollTriggers = st.getAll().slice(0, 60).map((t) => {
        const a = t.animation;
        let enfants = null;
        if (a && a.getChildren) {
          enfants = a.getChildren(true, true, false).slice(0, 6).map((c) => ({
            duree: c.duration(), retard: c.startTime(),
            ease: c.vars && c.vars.ease ? String(c.vars.ease.name || c.vars.ease) : null,
            cible: (() => { const g = c.targets ? c.targets()[0] : null; return g ? (g.tagName + "." + String(g.className).slice(0, 34)) : null; })(),
            vars: c.vars ? Object.keys(c.vars).filter((k) => !["ease", "onComplete", "data"].includes(k)).slice(0, 10) : null,
            y: c.vars ? (c.vars.y ?? c.vars.yPercent ?? null) : null,
            stagger: c.vars && c.vars.stagger ? JSON.stringify(c.vars.stagger).slice(0, 60) : null,
          }));
        }
        return {
          trigger: t.trigger ? (t.trigger.tagName + "." + String(t.trigger.className).slice(0, 40)) : null,
          start: t.vars.start, end: t.vars.end, scrub: t.vars.scrub ?? false,
          startPx: Math.round(t.start), endPx: Math.round(t.end), course_px: Math.round(t.end - t.start),
          dureeAnim: a ? a.duration() : null,
          easeAnim: a && a.vars && a.vars.ease ? String(a.vars.ease.name || a.vars.ease) : null,
          enfants,
        };
      });
    }
  }
  const l = window.lenis || window.Lenis;
  if (l) out.lenis = { present: true, options: l.options ? JSON.stringify(l.options).slice(0, 220) : null };
  out.ix2 = document.querySelectorAll("[data-w-id]").length;
  out.split = {
    lignes: document.querySelectorAll(".text-highlight_line").length,
    inner: document.querySelectorAll(".text-highlight_inner").length,
    rect: document.querySelectorAll(".text-highlight_rect").length,
    splitLine: document.querySelectorAll(".split-line, .line, [class*='split']").length,
    charWrap: document.querySelectorAll("[class*='char']").length,
    wordWrap: document.querySelectorAll("[class*='word']").length,
  };
  /* le HTML brut d'un bloc revele, pour voir la decoupe exacte */
  const bloc = document.querySelectorAll(".text-highlight_line")[3];
  out.htmlBloc = bloc ? bloc.outerHTML.slice(0, 1400) : null;
  const parent = bloc ? bloc.parentElement : null;
  out.htmlParent = parent ? parent.outerHTML.slice(0, 900) : null;
  return out;
});
console.log("=== 1 · fullstack-studio ===");
console.log(JSON.stringify({ ...moteur1, scrollTriggers: moteur1.scrollTriggers ? moteur1.scrollTriggers.length + " triggers" : null }, null, 1).slice(0, 3000));
if (moteur1.scrollTriggers) {
  console.log("\n--- ScrollTriggers (20 premiers) ---");
  moteur1.scrollTriggers.slice(0, 20).forEach((t, i) => console.log(" ", i, JSON.stringify(t)));
}
writeFileSync(join(d, "moteur-1.json"), JSON.stringify(moteur1, null, 2));

/* ---------------------------------------------------------- 2 */
const p2 = await nav.newPage({ viewport: { width: 1280, height: 800 } });
await p2.goto("https://fancy-toggle-753251.framer.app/", { waitUntil: "networkidle", timeout: 90000 });
await attendre(2500);

const moteur2 = await p2.evaluate(() => {
  const out = { url: location.href, titre: document.title, hauteur: document.documentElement.scrollHeight, candidats: [] };
  /* tout ce qui ressemble a un interrupteur : role, aria, curseur pointer, petite boite large */
  const vus = new Set();
  document.querySelectorAll("*").forEach((el) => {
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    if (r.width < 24 || r.height < 12 || r.width > 700 || r.height > 260) return;
    const cliquable = cs.cursor === "pointer" || el.getAttribute("role") === "switch" ||
      el.getAttribute("role") === "button" || el.tagName === "BUTTON" || el.hasAttribute("aria-checked") ||
      el.hasAttribute("data-framer-name") && /toggle|switch/i.test(el.getAttribute("data-framer-name") || "");
    if (!cliquable) return;
    const cle = `${Math.round(r.left)},${Math.round(r.top)},${Math.round(r.width)}`;
    if (vus.has(cle)) return; vus.add(cle);
    out.candidats.push({
      tag: el.tagName, cls: String(el.className).slice(0, 60),
      nom: el.getAttribute("data-framer-name") || "",
      role: el.getAttribute("role") || "", aria: el.getAttribute("aria-checked") || "",
      box: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)],
      texte: (el.textContent || "").trim().slice(0, 40),
      bg: cs.backgroundColor, radius: cs.borderRadius, transition: cs.transition.slice(0, 120),
      enfants: el.children.length,
    });
  });
  out.nomsFramer = [...new Set([...document.querySelectorAll("[data-framer-name]")].map((e) => e.getAttribute("data-framer-name")))].slice(0, 60);
  out.texte = document.body.innerText.slice(0, 900);
  return out;
});
console.log("\n=== 2 · fancy-toggle ===");
console.log("titre:", moteur2.titre, "· hauteur:", moteur2.hauteur);
console.log("noms Framer :", JSON.stringify(moteur2.nomsFramer));
console.log("\ntexte de la page :\n", moteur2.texte);
console.log("\ncandidats cliquables :", moteur2.candidats.length);
moteur2.candidats.forEach((c, i) => console.log(" ", i, JSON.stringify(c)));
writeFileSync(join(d, "moteur-2.json"), JSON.stringify(moteur2, null, 2));
await p2.screenshot({ path: join(d, "toggle-page.png"), fullPage: false });

await nav.close();
console.log("\nmoteur-1.json + moteur-2.json + toggle-page.png ecrits dans", d);
