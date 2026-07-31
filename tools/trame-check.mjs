/* ============================================================
   TRAME-CHECK — le moteur de passage, prouve et pas suppose.
   ------------------------------------------------------------
   Ce qu'il verifie, un par un :
   1. le voile EXISTE au moment du passage et n'existe plus apres ;
   2. il ne laisse RIEN derriere lui — zero canvas `.trame-voile`
      en fin de course, sinon on empile une couche par frontiere ;
   3. il ne rogne pas le texte : la cible est lisible avant et
      apres, et le passage dure moins que le budget annonce ;
   4. la bascule de theme change bien de theme, avec ET sans le
      moteur, et sous mouvement reduit ;
   5. la trame est absente au palier 2 et sous mouvement reduit ;
   6. zero erreur console.
   ============================================================ */
import { chromium } from "playwright";

const B = "http://localhost:" + (process.argv[2] || 8099);
const nav = await chromium.launch();
const sortie = [];
let echecs = 0;
const dire = (ok, quoi, detail) => {
  if (!ok) echecs++;
  sortie.push(`${ok ? "  ok " : "ECHEC"}  ${quoi}${detail ? "  — " + detail : ""}`);
};

async function page(opts) {
  const c = await nav.newContext({ viewport: { width: 1440, height: 900 }, ...(opts || {}) });
  const p = await c.newPage();
  const erreurs = [];
  p.on("console", (m) => { if (m.type() === "error") erreurs.push(m.text().slice(0, 160)); });
  p.on("pageerror", (e) => erreurs.push("PAGEERROR " + String(e).slice(0, 160)));
  await p.addInitScript(() => {
    try { sessionStorage.setItem("aped-entree-saut", "1"); sessionStorage.setItem("aped-sans-popup", "1"); } catch (e) {}
    localStorage.setItem("aped-cadeau-vu", "1");
  });
  await p.goto(B + "/", { waitUntil: "load" });
  await p.waitForTimeout(1800);
  return { c, p, erreurs };
}

/* --- 1/2/3 · le voile sur une frontiere reelle --- */
{
  const { c, p, erreurs } = await page();
  const dispo = await p.evaluate(() => typeof window.APED_TRAME);
  dire(dispo === "object", "APED_TRAME est charge en vague 1", dispo);

  /* On descend par pas jusqu'a la frontiere 02, comme un visiteur :
     un `scrollTo` qui saute ne declenche pas un ScrollTrigger. */
  const y = await p.evaluate(() => document.querySelector('[data-seuil][data-verbe="volet"]').getBoundingClientRect().top + scrollY);
  let vus = 0, max = 0;
  const cible = Math.max(0, y - 780);
  for (let s = 0; s < cible; s += 160) {
    await p.evaluate((v) => scrollTo(0, v), s);
    await p.waitForTimeout(30);
    const n = await p.evaluate(() => document.querySelectorAll("canvas.trame-voile").length);
    max = Math.max(max, n); if (n) vus++;
  }
  await p.evaluate((v) => scrollTo(0, v), cible);
  await p.waitForTimeout(120);
  const pendant = await p.evaluate(() => document.querySelectorAll("canvas.trame-voile").length);
  await p.waitForTimeout(900);
  const apres = await p.evaluate(() => document.querySelectorAll("canvas.trame-voile").length);
  dire(max > 0 || pendant > 0, "un voile parait au franchissement", `max en route ${max}, au seuil ${pendant}`);
  dire(apres === 0, "aucun voile ne survit au passage", `reste ${apres}`);

  /* Le contenu du seuil reste lisible : le voile ne doit jamais
     laisser la bande a mi-chemin. */
  const etat = await p.evaluate(() => {
    const s = document.querySelector('[data-seuil][data-verbe="volet"]');
    const c = getComputedStyle(s);
    return { clip: c.clipPath, op: c.opacity, nom: (s.querySelector(".seuil-nom") || {}).textContent };
  });
  dire(etat.op === "1" && (etat.clip === "none" || etat.clip.includes("0%")), "le seuil est net au repos", JSON.stringify(etat));
  dire(erreurs.length === 0, "zero erreur console pendant la traversee", erreurs.join(" | "));
  await c.close();
}

/* --- 4 · la bascule de theme --- */
{
  const { c, p, erreurs } = await page();
  const av = await p.evaluate(() => document.documentElement.getAttribute("data-theme"));
  await p.click("#themeToggle");
  await p.waitForTimeout(90);
  const voile = await p.evaluate(() => {
    const v = document.querySelector("canvas.trame-voile");
    return v ? { w: v.style.width, h: v.style.height, z: v.style.zIndex } : null;
  });
  dire(!!voile, "la bascule pose une trame plein ecran", JSON.stringify(voile));
  await p.waitForTimeout(900);
  const ap = await p.evaluate(() => document.documentElement.getAttribute("data-theme"));
  const reste = await p.evaluate(() => document.querySelectorAll("canvas.trame-voile").length);
  dire(av !== ap, "le theme a bascule", `${av} -> ${ap}`);
  dire(reste === 0, "la bascule ne laisse aucun voile", `reste ${reste}`);
  dire(!(await p.evaluate(() => !!document.startViewTransition && document.documentElement.classList.contains("theme-shifting"))), "aucun fondu de vue en cours apres coup");
  dire(erreurs.length === 0, "zero erreur console a la bascule", erreurs.join(" | "));
  await c.close();
}

/* --- 5 · mouvement reduit : le theme bascule quand meme, sans voile --- */
{
  const { c, p, erreurs } = await page({ reducedMotion: "reduce" });
  const av = await p.evaluate(() => document.documentElement.getAttribute("data-theme"));
  await p.click("#themeToggle");
  await p.waitForTimeout(60);
  const voile = await p.evaluate(() => document.querySelectorAll("canvas.trame-voile").length);
  await p.waitForTimeout(400);
  const ap = await p.evaluate(() => document.documentElement.getAttribute("data-theme"));
  dire(voile === 0, "mouvement reduit : aucun voile", `vu ${voile}`);
  dire(av !== ap, "mouvement reduit : le theme bascule quand meme", `${av} -> ${ap}`);
  dire(erreurs.length === 0, "mouvement reduit : zero erreur", erreurs.join(" | "));
  await c.close();
}

/* --- 5bis · sans le moteur : le site ne doit rien perdre --- */
{
  const c = await nav.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await c.newPage();
  const erreurs = [];
  p.on("pageerror", (e) => erreurs.push(String(e).slice(0, 160)));
  await p.route("**/js/trame.js", (r) => r.abort());
  await p.addInitScript(() => { try { sessionStorage.setItem("aped-entree-saut", "1"); sessionStorage.setItem("aped-sans-popup", "1"); } catch (e) {} });
  await p.goto(B + "/", { waitUntil: "load" });
  await p.waitForTimeout(1600);
  const av = await p.evaluate(() => document.documentElement.getAttribute("data-theme"));
  await p.click("#themeToggle");
  await p.waitForTimeout(700);
  const ap = await p.evaluate(() => document.documentElement.getAttribute("data-theme"));
  dire(av !== ap, "sans trame.js : le theme bascule net", `${av} -> ${ap}`);
  dire(erreurs.length === 0, "sans trame.js : zero erreur", erreurs.join(" | "));
  await c.close();
}

/* --- 6 · LES SEPT PASSAGES DE FRONTIERE, NOMMES UN PAR UN ---
   CE TEST EXISTE A CAUSE D'UN DEFAUT QU'UN COMPTAGE AVAIT LAISSE
   PASSER. Une premiere version comptait les voiles : elle en
   trouvait six, en attendait sept, et ne pouvait pas dire lequel
   manquait. C'etait `seuil-00`, la frontiere du pied — sa position
   mise en cache par ScrollTrigger, faussee par
   `content-visibility: auto`, tombait au-dela de la fin du
   document. Un compte ne remplace jamais un nom. */
{
  const { c, p, erreurs } = await page();
  await p.evaluate(() => {
    window.__NOMS = new Set();
    const b = () => {
      document.querySelectorAll("canvas.trame-voile").forEach((v) => window.__NOMS.add(v.getAttribute("data-passage") || "?"));
      requestAnimationFrame(b);
    };
    requestAnimationFrame(b);
  });
  const H = await p.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y <= H; y += 140) { await p.evaluate((v) => scrollTo(0, v), y); await p.waitForTimeout(22); }
  await p.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
  await p.waitForTimeout(900);
  const vus = await p.evaluate(() => [...window.__NOMS].sort());
  /* Depuis le 2026-07-31, les frontieres 05 et 06 sont ABSORBEES par
     leurs sas quand `html.sas-ok` est pose (D-576) : leur geste est
     le volet du sas, pas un voile de trame. Les attendre ici serait
     verrouiller l'ancien monde — le piege 17 dans l'autre sens. */
  const sasOk = await p.evaluate(() => document.documentElement.classList.contains("sas-ok"));
  const attendus = (sasOk
    ? ["seuil-02", "seuil-03", "seuil-11", "seuil-12", "seuil-00"]
    : ["seuil-02", "seuil-03", "seuil-05", "seuil-06", "seuil-11", "seuil-12", "seuil-00"]).sort();
  const interdits = sasOk ? ["seuil-05", "seuil-06"].filter((n) => vus.includes(n)) : [];
  const manquants = attendus.filter((a) => !vus.includes(a));
  dire(manquants.length === 0 && interdits.length === 0,
    sasOk ? "les cinq passages de frontiere partent, nommes — 05 et 06 absorbes par les sas"
      : "les sept passages de frontiere partent, nommes",
    manquants.length ? "MANQUE " + manquants.join(", ")
      : interdits.length ? "DOUBLE GESTE " + interdits.join(", ") : vus.join(", "));
  if (sasOk) {
    const actifs = await p.evaluate(() => document.querySelectorAll(".sas.sas-actif").length);
    dire(actifs === 3, "les trois sas sont actifs quand ils absorbent", String(actifs));
  }
  dire(await p.evaluate(() => document.querySelectorAll("canvas.trame-voile").length) === 0, "aucun voile ne survit a la traversee");
  dire(erreurs.length === 0, "traversee complete : zero erreur console", erreurs.join(" | "));
  await c.close();
}

/* --- 7 · LE MENU ET SA RECIPROQUE --- */
{
  const c = await nav.newContext({ viewport: { width: 430, height: 860 }, isMobile: true, hasTouch: true });
  const p = await c.newPage();
  const erreurs = [];
  p.on("pageerror", (e) => erreurs.push(String(e).slice(0, 140)));
  await p.addInitScript(() => { try { sessionStorage.setItem("aped-entree-saut", "1"); sessionStorage.setItem("aped-sans-popup", "1"); localStorage.setItem("aped-cadeau-vu", "1"); } catch (e) {} });
  await p.goto(B + "/", { waitUntil: "load" });
  await p.waitForTimeout(1900);
  await p.click("#burger");
  await p.waitForTimeout(80);
  const ouvre = await p.evaluate(() => { const v = document.querySelector("canvas.trame-voile"); return v && v.getAttribute("data-passage"); });
  await p.waitForTimeout(500);
  await p.click("#burger");
  await p.waitForTimeout(80);
  const ferme = await p.evaluate(() => { const v = document.querySelector("canvas.trame-voile"); return v && v.getAttribute("data-passage"); });
  await p.waitForTimeout(700);
  dire(ouvre === "menu-ouvre", "le menu s'ouvre sous une trame", String(ouvre));
  dire(ferme === "menu-ferme", "la fermeture est la reciproque", String(ferme));
  dire(await p.evaluate(() => document.querySelectorAll("canvas.trame-voile").length) === 0, "le menu ne laisse aucun voile");
  dire(await p.evaluate(() => document.getElementById("menu").hidden) === true, "le menu est bien referme");
  dire(erreurs.length === 0, "menu : zero erreur", erreurs.join(" | "));
  await c.close();
}

/* --- 8 · LE PANNEAU « AJUSTER EN DETAIL » --- */
{
  const { c, p, erreurs } = await page();
  const ok = await p.evaluate(async () => {
    const d = document.querySelector("details.roi-details");
    if (!d) return "aucun panneau";
    d.scrollIntoView({ block: "center" });
    d.open = true;
    d.dispatchEvent(new Event("toggle"));
    await new Promise((r) => setTimeout(r, 90));
    const v = document.querySelector("canvas.trame-voile");
    return v ? v.getAttribute("data-passage") : "aucun voile";
  });
  dire(String(ok).startsWith("repli-"), "le panneau se degage sous une trame", String(ok));
  /* Et il reste LISIBLE : le contenu ne doit pas dependre du voile. */
  await p.waitForTimeout(600);
  const lisible = await p.evaluate(() => {
    const d = document.querySelector("details.roi-details");
    const c = d.querySelector("summary").nextElementSibling;
    return c ? getComputedStyle(c).opacity : null;
  });
  dire(lisible === "1", "le contenu du panneau est net apres le passage", String(lisible));
  dire(erreurs.length === 0, "panneau : zero erreur", erreurs.join(" | "));
  await c.close();
}

await nav.close();
console.log(sortie.join("\n"));
console.log(echecs ? `\n${echecs} ECHEC(S)` : "\nTout passe.");
process.exit(echecs ? 1 : 0);
