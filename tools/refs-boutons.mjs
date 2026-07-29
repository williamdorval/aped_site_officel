/* ============================================================
   LES ETATS — deux references, un meme protocole.

   1. fullstack-studio : le survol de `.button`. La source dit
      SplitText chars + y:-1.3em, 0.4 s, power2.out, stagger
      {amount:0.2}. On verifie au rendu et on chiffre le -1.3em
      en pixels.
   2. fancy-toggle : on ne sait pas encore QUEL objet bascule.
      Phase A — on survole chaque candidat et on releve ce qui a
      change dans tout son sous-arbre. Phase B — on mesure le
      gagnant a 60 Hz, aller ET retour, plus le clic.

   Piege phase 8 : une capture d'ecran est plus lente qu'une
   transition de survol. On lit donc les valeurs DANS la page a
   chaque image, et les images ne servent qu'a montrer.
   Usage : node tools/refs-boutons.mjs
   ============================================================ */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const RB = join(process.cwd(), "tools", "_refs");
const DT = join(RB, "toggle"); mkdirSync(DT, { recursive: true });
const DF = join(RB, "fullstack"); mkdirSync(DF, { recursive: true });
const attendre = (ms) => new Promise((r) => setTimeout(r, ms));
const nb = (n) => String(n).padStart(2, "0");

const SONDE = () => {
  window.__lire = (racine) => {
    const n = [racine, ...racine.querySelectorAll("*")].slice(0, 60);
    return n.map((e) => {
      const cs = getComputedStyle(e), r = e.getBoundingClientRect();
      return {
        tag: e.tagName, cls: String(e.className).slice(0, 44),
        nom: e.getAttribute && e.getAttribute("data-framer-name") || "",
        txt: (e.textContent || "").trim().slice(0, 22),
        o: +cs.opacity, tf: cs.transform, tr: cs.translate, sc: cs.scale, rot: cs.rotate,
        bg: cs.backgroundColor, col: cs.color, bd: cs.borderColor, bw: cs.borderWidth,
        cp: cs.clipPath, fl: cs.filter, rad: cs.borderRadius,
        w: +r.width.toFixed(1), h: +r.height.toFixed(1), x: +r.left.toFixed(1), y: +r.top.toFixed(1),
        tn: cs.transitionProperty.slice(0, 90), td: cs.transitionDuration.slice(0, 60), tf2: cs.transitionTimingFunction.slice(0, 80),
      };
    });
  };
  window.__film = (racine, n) => {
    window.__e = []; const t0 = performance.now();
    const tic = () => {
      window.__e.push({ t: +(performance.now() - t0).toFixed(1), v: window.__lire(racine) });
      if (window.__e.length < (n || 100)) requestAnimationFrame(tic);
    };
    tic();
  };
};

const nav = await chromium.launch();

/* ══════════════ 1 · fullstack-studio · .button ══════════════ */
{
  const page = await nav.newPage({ viewport: { width: 1440, height: 900 } });
  await page.addInitScript(SONDE);
  await page.goto("https://fullstack-studio.webflow.io/", { waitUntil: "networkidle", timeout: 90000 });
  await attendre(2500);

  const b = await page.evaluate(() => {
    const el = document.querySelector(".button");
    if (!el) return null;
    el.setAttribute("data-sonde-btn", "1");
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return {
      box: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)],
      html: el.outerHTML.slice(0, 900),
      taillePolice: cs.fontSize, ligne: cs.lineHeight, radius: cs.borderRadius,
      bg: cs.backgroundColor, col: cs.color,
      nChars: el.querySelectorAll("div").length,
    };
  });
  console.log("═══ 1 · fullstack .button ═══");
  console.log(JSON.stringify(b, null, 1).slice(0, 1200));

  if (b) {
    const cx = b.box[0] + b.box[2] / 2, cy = b.box[1] + b.box[3] / 2;
    const mesure = async (nom, avant, apres) => {
      await avant(); await attendre(800);
      await page.evaluate(() => window.__film(document.querySelector("[data-sonde-btn]"), 70));
      await apres(); await attendre(1500);
      const e = await page.evaluate(() => window.__e);
      /* chars = les elements dont y bouge */
      const n = e[0].v.length;
      const res = [];
      for (let i = 0; i < n; i++) {
        const ty = e.map((s) => { const m = String(s.v[i].tf).match(/matrix\(([^)]+)\)/); return m ? Number(m[1].split(",")[5]) : 0; });
        const sx = e.map((s) => { const m = String(s.v[i].tf).match(/matrix\(([^)]+)\)/); return m ? Number(m[1].split(",")[0]) : 1; });
        const dy = Math.max(...ty) - Math.min(...ty), ds = Math.max(...sx) - Math.min(...sx);
        if (dy < 0.5 && ds < 0.002) continue;
        let i0 = 0; while (i0 < ty.length - 1 && Math.abs(ty[i0 + 1] - ty[i0]) < 0.05 && Math.abs(sx[i0 + 1] - sx[i0]) < 0.0004) i0++;
        let i1 = ty.length - 1; while (i1 > 0 && Math.abs(ty[i1] - ty[i1 - 1]) < 0.05 && Math.abs(sx[i1] - sx[i1 - 1]) < 0.0004) i1--;
        res.push({
          i, cls: e[0].v[i].cls, txt: e[0].v[i].txt,
          deltaY_px: +dy.toFixed(2), y: `${ty[0].toFixed(1)} → ${ty[ty.length - 1].toFixed(1)}`,
          scale: ds > 0.002 ? `${sx[0].toFixed(4)} → ${sx[sx.length - 1].toFixed(4)}` : null,
          debut_ms: e[i0] ? e[i0].t : null, fin_ms: e[i1] ? e[i1].t : null,
          duree_ms: e[i0] && e[i1] ? +(e[i1].t - e[i0].t).toFixed(1) : null,
          images: i1 - i0 + 1,
        });
      }
      const deb = res.map((r) => r.debut_ms).filter((v) => v != null).sort((a, x) => a - x);
      console.log(`\n  --- ${nom} : ${res.length} objets bougent ---`);
      res.slice(0, 14).forEach((r) => console.log("   ", JSON.stringify(r)));
      if (res.length) {
        console.log(`    hauteur de char = ${(res[0].deltaY_px).toFixed(1)} px  ·  premier depart ${deb[0]} ms  ·  dernier depart ${deb[deb.length - 1]} ms`);
        console.log(`    etalement total du stagger = ${(deb[deb.length - 1] - deb[0]).toFixed(1)} ms sur ${deb.length} objets`);
      }
      writeFileSync(join(DF, `bouton-${nom}.json`), JSON.stringify({ res, e: e.slice(0, 70) }, null, 2));
      return res;
    };
    await page.evaluate(() => document.querySelector("[data-sonde-btn]").scrollIntoView({ block: "center" }));
    await attendre(900);
    const box = await page.evaluate(() => { const r = document.querySelector("[data-sonde-btn]").getBoundingClientRect(); return { cx: r.left + r.width / 2, cy: r.top + r.height / 2 }; });
    await mesure("survol", async () => page.mouse.move(20, 20), async () => page.mouse.move(box.cx, box.cy, { steps: 3 }));
    await mesure("sortie", async () => page.mouse.move(box.cx, box.cy), async () => page.mouse.move(20, 20, { steps: 3 }));

    /* 10 vues du survol */
    const SD = join(DF, "sequence-bouton"); mkdirSync(SD, { recursive: true });
    await page.mouse.move(20, 20); await attendre(800);
    const clip = await page.evaluate(() => { const r = document.querySelector("[data-sonde-btn]").getBoundingClientRect(); return { x: Math.max(0, Math.round(r.left) - 12), y: Math.max(0, Math.round(r.top) - 12), width: Math.round(r.width) + 24, height: Math.round(r.height) + 24 }; });
    for (let k = 0; k < 10; k++) {
      if (k === 1) await page.mouse.move(box.cx, box.cy, { steps: 2 });
      await page.screenshot({ path: join(SD, `btn-${nb(k)}.png`), clip }).catch(() => {});
      await attendre(38);
    }
  }
  await page.close();
}

/* ══════════════ 2 · fancy-toggle ══════════════ */
{
  const page = await nav.newPage({ viewport: { width: 1280, height: 800 } });
  await page.addInitScript(SONDE);
  await page.goto("https://fancy-toggle-753251.framer.app/", { waitUntil: "networkidle", timeout: 90000 });
  await attendre(2500);

  /* ── A. DECOUVERTE : qui reagit ? ── */
  const zones = await page.evaluate(() => {
    const out = [];
    document.querySelectorAll("[data-framer-name], p, div").forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width < 30 || r.height < 14 || r.width > 900 || r.height > 600) return;
      if (r.top < 0 || r.bottom > 800) return;
      const t = (el.textContent || "").trim();
      out.push({ nom: el.getAttribute("data-framer-name") || "", cls: String(el.className).slice(0, 40), txt: t.slice(0, 30), box: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)] });
    });
    /* dedoublonner par boite */
    const vus = new Set();
    return out.filter((o) => { const k = o.box.join(","); if (vus.has(k)) return false; vus.add(k); return true; });
  });
  console.log(`\n═══ 2 · fancy-toggle — ${zones.length} zones a sonder ═══`);

  await page.evaluate(() => {
    window.__racine = document.body;
    window.__snap = () => {
      const n = [...document.querySelectorAll("*")].slice(0, 400);
      return n.map((e) => {
        const cs = getComputedStyle(e), r = e.getBoundingClientRect();
        return [String(e.className).slice(0, 34), e.getAttribute("data-framer-name") || "", cs.transform, cs.translate, cs.opacity, cs.backgroundColor, cs.color, cs.clipPath, +r.width.toFixed(1), +r.height.toFixed(1), +r.left.toFixed(1), +r.top.toFixed(1), (e.textContent || "").trim().slice(0, 18)];
      });
    };
  });

  const reactions = [];
  for (const z of zones) {
    await page.mouse.move(5, 5); await attendre(420);
    const a = await page.evaluate(() => window.__snap());
    await page.mouse.move(z.box[0] + z.box[2] / 2, z.box[1] + z.box[3] / 2, { steps: 2 });
    await attendre(650);
    const b = await page.evaluate(() => window.__snap());
    const diff = [];
    for (let i = 0; i < Math.min(a.length, b.length); i++) {
      const props = ["transform", "translate", "opacity", "bg", "col", "clip", "w", "h", "x", "y"];
      const ch = [];
      for (let k = 2; k <= 11; k++) if (String(a[i][k]) !== String(b[i][k])) ch.push(`${props[k - 2]}: ${a[i][k]} → ${b[i][k]}`);
      if (ch.length) diff.push({ cls: b[i][0], nom: b[i][1], txt: b[i][12], ch: ch.slice(0, 5) });
    }
    /* on ignore le suiveur de curseur : il bouge pour TOUTE position */
    if (diff.length) reactions.push({ zone: z, n: diff.length, diff: diff.slice(0, 8) });
  }
  /* le suiveur bouge partout : on repere les classes qui reagissent a TOUTES les zones */
  const compte = new Map();
  reactions.forEach((r) => r.diff.forEach((d) => compte.set(d.cls + "|" + d.nom, (compte.get(d.cls + "|" + d.nom) || 0) + 1)));
  const partout = new Set([...compte.entries()].filter(([, n]) => n >= reactions.length * 0.8).map(([k]) => k));
  console.log("  classes qui reagissent PARTOUT (suiveur de curseur, ignorees) :", [...partout].slice(0, 6));
  const vraies = reactions.map((r) => ({ ...r, diff: r.diff.filter((d) => !partout.has(d.cls + "|" + d.nom)) })).filter((r) => r.diff.length);
  console.log(`  zones a reaction PROPRE : ${vraies.length}`);
  vraies.slice(0, 10).forEach((r) => {
    console.log(`\n  → « ${r.zone.txt || r.zone.nom || r.zone.cls} » ${JSON.stringify(r.zone.box)}`);
    r.diff.slice(0, 6).forEach((d) => console.log(`      ${d.nom || d.cls} « ${d.txt} » : ${d.ch.join(" | ")}`));
  });
  writeFileSync(join(DT, "decouverte.json"), JSON.stringify({ zones: zones.length, reactions: vraies }, null, 2));

  /* ── B. MESURE du candidat le plus riche ── */
  const cible = vraies.sort((a, b) => b.diff.length - a.diff.length)[0];
  if (!cible) { console.log("  !! aucune reaction propre trouvee"); }
  else {
    const bx = cible.zone.box;
    const cx = bx[0] + bx[2] / 2, cy = bx[1] + bx[3] / 2;
    console.log(`\n  CIBLE RETENUE : « ${cible.zone.txt || cible.zone.nom} » a (${Math.round(cx)}, ${Math.round(cy)})`);
    await page.evaluate((b) => {
      const el = document.elementFromPoint(b[0] + b[2] / 2, b[1] + b[3] / 2);
      let r = el; for (let i = 0; i < 4 && r.parentElement; i++) r = r.parentElement;
      window.__cible = r;
    }, bx);

    const scene = async (nom, avant, apres) => {
      await avant(); await attendre(800);
      await page.evaluate(() => window.__film(window.__cible, 90));
      await apres(); await attendre(1700);
      const e = await page.evaluate(() => window.__e);
      const n = e[0].v.length, res = [];
      const px = (v) => { const m = String(v.tr).match(/(-?[\d.]+)px/); if (m && v.tr !== "none") return Number(m[1]); const q = String(v.tf).match(/matrix\(([^)]+)\)/); return q ? Number(q[1].split(",")[4]) : 0; };
      const py = (v) => { const m = String(v.tr).match(/(-?[\d.]+)px\s+(-?[\d.]+)px/); if (m && v.tr !== "none") return Number(m[2]); const q = String(v.tf).match(/matrix\(([^)]+)\)/); return q ? Number(q[1].split(",")[5]) : 0; };
      for (let i = 0; i < n; i++) {
        const s = e.map((z) => z.v[i]);
        const xs = s.map(px), ys = s.map(py), os = s.map((v) => v.o), ws = s.map((v) => v.w), hs = s.map((v) => v.h);
        const bgs = s.map((v) => v.bg), cols = s.map((v) => v.col), cps = s.map((v) => v.cp), xls = s.map((v) => v.x);
        const amp = (a) => Math.max(...a) - Math.min(...a);
        const dX = amp(xs), dY = amp(ys), dO = amp(os), dW = amp(ws), dH = amp(hs), dXl = amp(xls);
        const nBg = new Set(bgs).size, nCol = new Set(cols).size, nCp = new Set(cps).size;
        if (dX < 0.6 && dY < 0.6 && dO < 0.03 && dW < 1 && dH < 1 && dXl < 0.6 && nBg < 2 && nCol < 2 && nCp < 2) continue;
        const chg = (arr) => { let a = 0; while (a < arr.length - 1 && String(arr[a + 1]) === String(arr[a])) a++; let z = arr.length - 1; while (z > 0 && String(arr[z]) === String(arr[z - 1])) z--; return [a, z]; };
        const cands = [xs, ys, os, ws, hs, xls].filter((a) => amp(a) > 0.5).concat([bgs, cols, cps].filter((a) => new Set(a).size > 1));
        let a0 = 1e9, z0 = -1; cands.forEach((c) => { const [a, z] = chg(c); if (a < a0) a0 = a; if (z > z0) z0 = z; });
        res.push({
          i, cls: s[0].cls, nom: s[0].nom, txt: s[0].txt,
          deltaX_px: +dX.toFixed(2), deltaY_px: +dY.toFixed(2), deltaGauche_px: +dXl.toFixed(2),
          deltaLargeur_px: +dW.toFixed(1), deltaHauteur_px: +dH.toFixed(1), deltaOpacite: +dO.toFixed(3),
          fonds: [...new Set(bgs)].slice(0, 3), couleurs: [...new Set(cols)].slice(0, 3), clips: [...new Set(cps)].slice(0, 3),
          debut_ms: e[a0] ? e[a0].t : null, fin_ms: e[z0] ? e[z0].t : null,
          duree_ms: e[a0] && e[z0] ? +(e[z0].t - e[a0].t).toFixed(1) : null,
          images: z0 - a0 + 1,
          transition: `${s[0].tn} / ${s[0].td} / ${s[0].tf2}`,
          trajX: xs.filter((_, k) => k % 2 === 0).map((v) => +v.toFixed(1)).slice(0, 30),
          trajY: ys.filter((_, k) => k % 2 === 0).map((v) => +v.toFixed(1)).slice(0, 30),
          trajO: os.filter((_, k) => k % 2 === 0).map((v) => +v.toFixed(2)).slice(0, 30),
        });
      }
      console.log(`\n  --- ${nom} : ${res.length} objets bougent ---`);
      res.slice(0, 12).forEach((r) => console.log("   ", JSON.stringify(r).slice(0, 640)));
      writeFileSync(join(DT, `${nom}.json`), JSON.stringify({ res, e: e.slice(0, 90) }, null, 2));
      return res;
    };

    await scene("aller-survol", async () => page.mouse.move(5, 5), async () => page.mouse.move(cx, cy, { steps: 3 }));
    await scene("retour-sortie", async () => page.mouse.move(cx, cy), async () => page.mouse.move(5, 5, { steps: 3 }));
    await scene("appui-clic", async () => page.mouse.move(cx, cy), async () => { await page.mouse.down(); await attendre(160); await page.mouse.up(); });

    /* ── C. les images : 10 a l'aller, 10 au retour ── */
    const clip = { x: Math.max(0, bx[0] - 60), y: Math.max(0, bx[1] - 60), width: Math.min(1280 - Math.max(0, bx[0] - 60), bx[2] + 120), height: Math.min(800 - Math.max(0, bx[1] - 60), bx[3] + 120) };
    const SA = join(DT, "sequence-aller"); mkdirSync(SA, { recursive: true });
    await page.mouse.move(5, 5); await attendre(900);
    for (let k = 0; k < 10; k++) { if (k === 1) await page.mouse.move(cx, cy, { steps: 2 }); await page.screenshot({ path: join(SA, `aller-${nb(k)}.png`), clip }).catch(() => {}); await attendre(36); }
    const SR = join(DT, "sequence-retour"); mkdirSync(SR, { recursive: true });
    await page.mouse.move(cx, cy); await attendre(900);
    for (let k = 0; k < 10; k++) { if (k === 1) await page.mouse.move(5, 5, { steps: 2 }); await page.screenshot({ path: join(SR, `retour-${nb(k)}.png`), clip }).catch(() => {}); await attendre(36); }
    console.log(`\n  20 vues ecrites dans ${DT}`);
  }
  await page.close();
}

await nav.close();
console.log("\n→ tools/_refs/fullstack/bouton-*.json + sequence-bouton/ · tools/_refs/toggle/*.json + sequence-aller|retour/");
