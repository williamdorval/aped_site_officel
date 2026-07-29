/* ============================================================
   CINE — l'enregistreur d'images, et pourquoi il fallait l'ecrire
   ------------------------------------------------------------
   `page.screenshot()` coute 120 a 950 ms sur cette machine. Une
   rafale de captures ne filme donc pas une transition de 450 ms :
   elle la RATE. C'est arrive sur la reference 4 — le reveal par
   tuiles dure 1,48 s, et les vingt captures d'affilee n'en ont
   montre aucune image.

   `Page.startScreencast` du protocole DevTools ne bloque pas le
   rendu : le navigateur pousse une image A CHAQUE PEINTURE, avec
   son horodatage. C'est le seul instrument honnete pour dire
   « voila ce que le visiteur a vu, et quand ».

   Deux services :
   · filmer(page, ms, action) -> [{t, buf}]
   · planche(images, chemin, n) -> n images reparties, ecrites

   Usage direct : node tools/cine.mjs <url> <ms> <dossier>
   ============================================================ */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export async function filmer(page, ms, action) {
  const client = await page.context().newCDPSession(page);
  const images = [];
  /* PIEGE D'INSTRUMENT, ET IL A PRODUIT UN FAUX VERDICT.
     Dater une image a la RECEPTION dans Node, c'est dater le
     transport, pas la peinture. Chromium groupe et retarde les
     envois : la premiere lecture faisait apparaitre le rideau
     d'entree APRES le site, donc une sequence jouee a l'envers
     qui n'existait pas. `metadata.timestamp` est l'horloge de la
     PEINTURE, en secondes depuis l'epoque ; c'est la seule
     honnete. On trie a la fin, parce que l'ordre d'arrivee ne
     garantit rien non plus. */
  client.on("Page.screencastFrame", async (f) => {
    images.push({ ts: f.metadata && f.metadata.timestamp, buf: Buffer.from(f.data, "base64") });
    try { await client.send("Page.screencastFrameAck", { sessionId: f.sessionId }); } catch (e) {}
  });
  await client.send("Page.startScreencast", { format: "jpeg", quality: 82, everyNthFrame: 1, maxWidth: 1440, maxHeight: 900 });
  if (action) await action();
  const fin = Date.now() + ms;
  while (Date.now() < fin) await page.waitForTimeout(40);
  try { await client.send("Page.stopScreencast"); } catch (e) {}
  await client.detach().catch(() => {});
  images.sort((a, b) => (a.ts || 0) - (b.ts || 0));
  const base = images.length ? images[0].ts : 0;
  images.forEach((im) => { im.t = Math.round(((im.ts || base) - base) * 1000); });
  return images;
}

/* Ecrit n images REPARTIES dans le temps, pas les n premieres :
   sinon on rend le debut d'un mouvement et jamais sa fin. */
export function planche(images, dossier, prefixe, n) {
  mkdirSync(dossier, { recursive: true });
  if (!images.length) return [];
  const pris = [];
  for (let i = 0; i < n; i++) {
    const k = Math.round(i * (images.length - 1) / Math.max(1, n - 1));
    if (pris.length && pris[pris.length - 1].k === k) continue;
    pris.push({ k, t: images[k].t });
    writeFileSync(join(dossier, `${prefixe}-${String(i).padStart(2, "0")}-t${String(images[k].t).padStart(4, "0")}.jpg`), images[k].buf);
  }
  return pris;
}

/* Les images datees dans l'horloge de la PAGE. Le film est date en
   secondes depuis l'epoque ; `performance.timeOrigin` donne
   l'epoque du t=0 de la page. Sans cette conversion on ne peut pas
   dire « telle image est pendant le passage » — on ne peut que
   deviner, et deviner a deja produit dix images d'apres coup. */
export function versHorlogePage(images, timeOrigin) {
  return images.map((im) => ({ ...im, tp: Math.round((im.ts || 0) * 1000 - timeOrigin) }));
}

/* Ecrit AVANT / PENDANT / APRES : trois images avant la fenetre,
   n images dedans, trois apres. C'est la seule planche qui prouve
   un passage — une image pendant, seule, ne dit pas d'ou il vient
   ni ou il va. */
export function plancheFenetre(images, timeOrigin, t0, t1, dossier, prefixe, n) {
  mkdirSync(dossier, { recursive: true });
  const av = versHorlogePage(images, timeOrigin);
  const dans = av.filter((im) => im.tp >= t0 && im.tp <= t1);
  const avant = av.filter((im) => im.tp < t0).slice(-3);
  const apres = av.filter((im) => im.tp > t1).slice(0, 3);
  const pris = [];
  const ecrire = (im, etiquette, i) => {
    writeFileSync(join(dossier, `${prefixe}-${etiquette}-${String(i).padStart(2, "0")}-t${String(im.tp).padStart(5, "0")}.jpg`), im.buf);
    pris.push({ etiquette, tp: im.tp });
  };
  avant.forEach((im, i) => ecrire(im, "1avant", i));
  for (let i = 0; i < n && dans.length; i++) {
    const k = Math.round(i * (dans.length - 1) / Math.max(1, n - 1));
    if (pris.length && pris[pris.length - 1].tp === dans[k].tp) continue;
    ecrire(dans[k], "2pendant", i);
  }
  apres.forEach((im, i) => ecrire(im, "3apres", i));
  return { avant: avant.length, pendant: dans.length, apres: apres.length, ecrites: pris.length, fenetre: [t0, t1] };
}

/* La cadence reelle du film. Un ecart median de 16,7 ms est du
   60 i/s ; on rend aussi le nombre d'ecarts au-dela de 20 ms,
   parce qu'un maximum ne veut rien dire (une interruption du
   systeme le triple sans que rien n'ait change). */
export function cadence(images) {
  if (images.length < 3) return { images: images.length };
  const d = [];
  for (let i = 1; i < images.length; i++) d.push(images[i].t - images[i - 1].t);
  const tri = [...d].sort((a, b) => a - b);
  return {
    images: images.length,
    duree_ms: images[images.length - 1].t,
    ecart_median: tri[Math.floor(tri.length / 2)],
    ecart_p95: tri[Math.floor(tri.length * 0.95)],
    au_dela_de_20ms: d.filter((x) => x > 20).length,
    au_dela_de_33ms: d.filter((x) => x > 33).length,
  };
}

/* Le chemin du projet contient des espaces : `import.meta.url` les
   encode en %20, pas `process.argv[1]`. Comparer les deux chaines
   telles quelles rend toujours faux, et le module se tait. */
const { pathToFileURL } = await import("node:url");
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { chromium } = await import("playwright");
  const [url, ms, dos] = [process.argv[2], +(process.argv[3] || 4000), process.argv[4] || "tools/_cine"];
  const nav = await chromium.launch({ headless: true });
  const ctx = await nav.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const imgs = await filmer(page, ms, () => page.goto(url, { waitUntil: "commit", timeout: 60000 }));
  console.log(JSON.stringify({ cadence: cadence(imgs), ecrites: planche(imgs, dos, "f", 24) }, null, 1));
  await nav.close();
}
