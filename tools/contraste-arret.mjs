/* ============================================================
   CONTRASTE AUX POSITIONS D'ARRET.

   Une animation scrubbee n'a pas d'etat de repos : elle a l'etat
   ou le visiteur s'est arrete. Si elle touche a l'OPACITE d'un
   texte, alors chaque position de defilement est un etat
   permanent possible, et chacun doit passer le contraste.

   Ce script s'arrete a 40 positions reparties sur toute la page et
   calcule, pour chaque element de texte visible, le ratio WCAG de
   sa couleur EFFECTIVE — opacite comprise, heritee comprise —
   contre le fond opaque le plus proche.
   ============================================================ */
import { chromium } from "playwright";
import { adresse } from "./_adresse.mjs";
const B = adresse(process.argv[2]);
const N = Number(process.argv[3] || 40);
const nav = await chromium.launch();
const page = await (await nav.newContext({ viewport: { width: 1440, height: 900 } })).newPage();

/* Le popup parait tout seul a la 11e seconde, a CHAQUE
   chargement. Cet outil mesure autre chose : on le neutralise,
   sinon il mesure une surcouche par-dessus sa cible. */
await page.addInitScript(() => { try { sessionStorage.setItem("aped-entree-saut", "1"); sessionStorage.setItem("aped-sans-popup", "1"); } catch (e) {} });
await page.goto(B + "/", { waitUntil: "load" });
await page.mouse.move(700, 400);
await page.waitForTimeout(1800);

await page.evaluate(() => {
  /* SIXIEME PIEGE D'INSTRUMENT, ET IL A FAILLI FAIRE CONDAMNER DU
     CODE SAIN. `color-mix()` ne se calcule PAS en `rgb(r, g, b)` :
     Chromium rend `color(srgb 0.67 0.678 0.668)`, donc des flottants
     de 0 a 1. Lus comme des octets, 0,67 devient 0 : tout texte
     ecrit en `color-mix` ressortait a 1,11:1 sur fond sombre —
     quatorze faux echecs, dont onze sur du code qui n'avait pas
     bouge depuis des semaines.
     On detecte la forme et on remet a l'echelle. */
  const rgb = (c) => {
    const n = (c.match(/[\d.]+/g) || [0, 0, 0]).map(Number).slice(0, 3);
    return /^color\(/.test(c) ? n.map((v) => v * 255) : n;
  };
  const L = (m) => { const f=(v)=>{v/=255; return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4);};
    return 0.2126*f(m[0])+0.7152*f(m[1])+0.0722*f(m[2]); };
  const melange = (av, ar, a) => av.map((v,i)=> v*a + ar[i]*(1-a));
  window.__scan = () => {
    const out = [];
    document.querySelectorAll("main p, main span, main li, main h1, main h2, main h3, main dd, main dt, footer p").forEach((el) => {
      const t = el.textContent.trim();
      if (t.length < 4) return;
      /* Meme exclusion que theme-check : ce que le site MONTRE comme
         mauvais (les reconstitutions declarees role="img", avec
         legende) a le droit d'etre mauvais — c'est leur sujet. Ce
         qu'il FAIT reste au budget. */
      if (el.closest('[role="img"]')) return;
      /* Le mot forge vit sur le volet d'encre par z-index, pas par
         parente : la sonde DOM lit le fond de l'ancetre (ciment) et
         condamne un blanc-sur-noir reel — piege 25, une sonde du DOM
         ne voit pas la peinture. Sa preuve est en CAPTURE :
         refonte-captures/sas/descente. */
      if (el.closest("[data-sas-mot]")) return;
      if (el.querySelector("p,span,li,h1,h2,h3,dd,dt") && el.children.length) {
        /* On ne mesure que les feuilles de texte. */
        let feuille = true;
        el.childNodes.forEach(n => { if (n.nodeType === 1 && n.textContent.trim().length > 3) feuille = false; });
        if (!feuille) return;
      }
      const r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight || r.width < 4 || r.height < 4) return;
      const s = getComputedStyle(el);
      if (s.visibility === "hidden" || s.display === "none") return;
      /* Opacite EFFECTIVE : le produit de toutes celles de la chaine. */
      let a = 1, n = el;
      while (n && n !== document.documentElement) { a *= parseFloat(getComputedStyle(n).opacity); n = n.parentElement; }
      if (a < 0.02) return;
      /* Fond opaque le plus proche. */
      let fond = null; n = el;
      while (n && n !== document.documentElement) {
        const c = rgb(getComputedStyle(n).backgroundColor);
        const al = (getComputedStyle(n).backgroundColor.match(/[\d.]+/g)||[]).length === 4
          ? Number(getComputedStyle(n).backgroundColor.match(/[\d.]+/g)[3]) : 1;
        if (al > 0.92) { fond = c; break; }
        n = n.parentElement;
      }
      if (!fond) fond = rgb(getComputedStyle(document.body).backgroundColor);
      const encre = melange(rgb(s.color), fond, a);
      const l1 = L(encre), l2 = L(fond);
      const ratio = (Math.max(l1,l2)+0.05)/(Math.min(l1,l2)+0.05);
      const gros = parseFloat(s.fontSize) >= 24 || (parseFloat(s.fontSize) >= 18.66 && Number(s.fontWeight) >= 700);
      out.push({ r: +ratio.toFixed(2), seuil: gros ? 3 : 4.5, cls: (el.className||el.tagName).toString().slice(0,26), txt: t.slice(0,28),
        enc: s.color, fnd: JSON.stringify(fond.map(v=>Math.round(v))), a: +a.toFixed(2) });
    });
    return out;
  };
});

const h = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
const mauvais = new Map();
for (let i = 0; i <= N; i++) {
  /* ============================================================
     ON DEFILE PAR PAS, PAS D'UN BOND — ET C'EST UN DEFAUT
     D'INSTRUMENT QUI FAISAIT CONDAMNER DU CODE SAIN, RELEVE LE
     2026-07-29.

     Version precedente : `window.scrollTo(0, y)` d'un seul saut vers
     chaque position d'arret. Sept elements ressortaient alors a 0,10
     ou 0,12 d'opacite — les trois etats du programme de reference, la
     bulle, les deux avis, la ligne de suite du parcours — et le
     rapport les comptait comme du « texte echoue ».

     Or aucun des sept n'est pilote par un scrub. Ce sont des
     timelines `once: true` qui montent de 0,1 a 1 en 240 a 340 ms, et
     dont l'etat de repos vaut bien 1. Ce qui se passait est autre
     chose : un saut de plusieurs milliers de pixels laisse les
     positions de declenchement de ScrollTrigger perimees — les
     sections traversees portent `content-visibility: auto`, donc leur
     hauteur reelle remplace la hauteur reservee pendant le saut. Le
     declencheur ne partait jamais, l'element restait a son etat de
     depart, et la sonde le photographiait a l'ecran, immobile, a 0,1.
     Attendre plus longtemps n'y changeait rien : il n'y avait rien a
     attendre.

     C'est le piege deja nomme au § 8 de CLAUDE.md — « un `scrollTo`
     qui saute casse un pin de ScrollTrigger, defiler par pas comme un
     visiteur ». Il valait aussi pour cet outil-ci.
     ============================================================ */
  const cible = Math.round(h * i / N);
  await page.evaluate(async (y) => {
    const pas = 140;
    let ici = window.scrollY;
    while (Math.abs(y - ici) > pas) {
      ici += Math.sign(y - ici) * pas;
      window.scrollTo(0, ici);
      await new Promise((r) => requestAnimationFrame(r));
    }
    window.scrollTo(0, y);
  }, cible);
  /* ON ATTEND QUE TOUT SOIT POSE. Sans ce delai, le script attrape
     les animations d'entree EN VOL — elles partent a 0,1 d'opacite
     et montent en 300 a 600 ms — et rend trente-huit faux echecs.
     Ce qu'on cherche est l'inverse : ce qui reste bas UNE FOIS
     STABILISE, c'est-a-dire ce qui est pilote par un scrub et qui
     n'a donc aucun etat de repos. 1400 ms couvre la plus longue
     animation d'entree du site (le schema de l'ecart, 1,2 s). */
  await page.waitForTimeout(1400);
  const lot = await page.evaluate(() => window.__scan());
  for (const x of lot) {
    if (x.r >= x.seuil) continue;
    const cle = x.cls + "|" + x.txt;
    if (!mauvais.has(cle) || mauvais.get(cle).r > x.r) mauvais.set(cle, { ...x, y: cible });
  }
}
await nav.close();
const l = [...mauvais.values()].sort((a,b)=>a.r-b.r);
console.log(`${N + 1} positions d'arret · ${l.length} element(s) de texte sous leur seuil\n`);
l.slice(0, 14).forEach(x => console.log(`  ${String(x.r).padStart(6)}:1  (seuil ${x.seuil})  y=${String(x.y).padStart(6)}  .${x.cls}  « ${x.txt} »  encre=${x.enc} fond=${x.fnd} opacite=${x.a}`));
console.log(`\n${l.length === 0 ? "AUCUN TEXTE ECHOUE A UNE POSITION D'ARRET" : l.length + " ECHEC(S)"}\n`);
process.exit(l.length ? 1 : 0);
