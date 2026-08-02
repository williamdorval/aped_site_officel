/* PASSE A — la structure des six references.
   On ne mesure encore rien : on identifie CE QU'IL FAUT MESURER.
   Choisir les cibles au jugé produirait six études qui parlent
   d'éléments qui n'existent pas. */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const SITES = [
  { n: 1, slug: "hover-cartes", url: "https://elated-convention-516854.framer.app/" },
  { n: 2, slug: "smooth-loader", url: "https://thoughtful-focus-537972.framer.app/" },
  { n: 3, slug: "sphere-particules", url: "https://3dparticlesphere.framer.website/" },
  { n: 4, slug: "pixel-reveal", url: "https://gracious-routine-029598.framer.app/swisspixelreveal" },
  { n: 5, slug: "micro-interactions", url: "https://fullstack-studio.webflow.io/" },
  { n: 6, slug: "fancy-toggle", url: "https://fancy-toggle-753251.framer.app/" },
];

const RACINE = join(process.cwd(), "tools", "_refs");
mkdirSync(RACINE, { recursive: true });

function structure() {
  const desc = (el) => {
    const c = typeof el.className === "string" ? el.className.trim().split(/\s+/).slice(0, 4).join(".") : "";
    return el.tagName.toLowerCase() + (el.id ? "#" + el.id : "") + (c ? "." + c : "");
  };
  /* Les blocs qui ont une surface et un rôle. Un arbre complet de
     Framer fait 3 000 nœuds et ne dit rien. */
  const blocs = [];
  document.querySelectorAll("*").forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.width < 60 || r.height < 30) return;
    const s = getComputedStyle(el);
    const bouge = s.transition !== "all 0s ease 0s" && s.transition !== "" || s.animationName !== "none" || s.willChange !== "auto";
    if (!bouge && el.children.length > 2) return;
    blocs.push({
      sel: desc(el),
      x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height),
      texte: (el.innerText || "").trim().slice(0, 48).replace(/\s+/g, " "),
      transition: s.transition.slice(0, 90),
      animation: s.animationName === "none" ? null : s.animationName + " " + s.animationDuration + " " + s.animationTimingFunction,
      transform: s.transform === "none" ? null : s.transform,
      clip: s.clipPath === "none" ? null : s.clipPath.slice(0, 60),
      opacity: s.opacity,
      radius: s.borderRadius,
      willChange: s.willChange,
    });
  });

  const dur = new Map(), eas = new Map(), kfs = {};
  let bloquees = 0;
  for (const sh of document.styleSheets) {
    let rr; try { rr = sh.cssRules; } catch (e) { bloquees++; continue; }
    if (!rr) continue;
    const marche = (liste) => {
      for (const r of liste) {
        if (r.type === 1 && r.style) {
          const d = r.style.transitionDuration || r.style.animationDuration;
          const e = r.style.transitionTimingFunction || r.style.animationTimingFunction;
          if (d) dur.set(d, (dur.get(d) || 0) + 1);
          if (e) eas.set(e, (eas.get(e) || 0) + 1);
        } else if (r.type === 7) {
          const et = []; for (const k of r.cssRules) et.push(k.keyText + " { " + k.style.cssText.slice(0, 150) + " }");
          kfs[r.name] = et.slice(0, 10);
        } else if (r.cssRules) marche(r.cssRules);
      }
    };
    marche(rr);
  }
  const tri = (m) => [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15).map(([v, c]) => v + " ×" + c);

  return {
    titre: document.title,
    hauteur: document.documentElement.scrollHeight,
    vh: innerHeight,
    canvas: [...document.querySelectorAll("canvas")].map((c) => ({ w: c.width, h: c.height, ctx: !!c.getContext })),
    svg: document.querySelectorAll("svg").length,
    noeuds: document.querySelectorAll("*").length,
    texte: (document.body.innerText || "").replace(/\s+/g, " ").slice(0, 700),
    anims: document.getAnimations().length,
    css: { bloquees, durees: tri(dur), easings: tri(eas), keyframes: kfs },
    blocs: blocs.slice(0, 60),
    scripts: [...document.querySelectorAll("script[src]")].map((s) => s.src.split("/").slice(-1)[0]).slice(0, 15),
  };
}

const nav = await chromium.launch({ headless: true });
const tout = {};
for (const s of SITES) {
  const ctx = await nav.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  try {
    await p.goto(s.url, { waitUntil: "load", timeout: 60000 });
    await p.waitForTimeout(3500);
    const r = await p.evaluate(structure);
    mkdirSync(join(RACINE, `${s.n}-${s.slug}`), { recursive: true });
    await p.screenshot({ path: join(RACINE, `${s.n}-${s.slug}`, "S-repos.png"), timeout: 15000 }).catch(() => {});
    tout[s.n] = { ...s, ...r };
    console.log(`${s.n} ${s.slug}: ${r.hauteur}px, ${r.noeuds} nœuds, ${r.canvas.length} canvas, ${r.svg} svg, ${r.blocs.length} blocs, ${r.anims} anims`);
  } catch (e) {
    tout[s.n] = { ...s, erreur: String(e).slice(0, 200) };
    console.log(`${s.n} ${s.slug}: ECHEC ${String(e).slice(0, 120)}`);
  }
  await ctx.close();
}
await nav.close();
writeFileSync(join(RACINE, "structure.json"), JSON.stringify(tout, null, 1), "utf8");
console.log("→ tools/_refs/structure.json");
