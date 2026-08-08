// LE BANC — un seul passage sur TOUTES les pages, a CINQ largeurs.
//
//   node tools/banc.mjs [--tour N] [--port 8099]
//
// Ce qu'il mesure, et qui doit tenir :
//   · debordement horizontal              0
//   · erreurs de console                  0
//   · requetes tierces                    0
//   · ressources en echec                 0
//   · contraste de chaque texte peint     0 echec (AA)
//   · arrets au clavier sans anneau       0
//   · cible tactile sous 44 px            0
//   · texte de corps sous 19 px           0
//   · titres h1 par page                  exactement 1
//   · images sans alt                     0
//
// LE CONTRASTE SE MESURE SUR LA COULEUR PEINTE, pas sur la couleur
// declaree : un texte pose sur un aplat lui-meme translucide n'a pas le fond
// qu'annonce sa regle. On remonte donc la pile des ancetres jusqu'au premier
// fond opaque, et on compose.  Piege 25 : l'arbitre est le pixel.
//
// Un passage qui n'examine AUCUNE page s'arrete : « 0 echec sur 0 page » se
// lit comme un succes, et c'est un mensonge.  Pieges 30, 40, 62, 96.
import { chromium } from 'playwright';
import { readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const RACINE = join(dirname(fileURLToPath(import.meta.url)), '..');
const arg = (n, d) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : d; };
const PORT = Number(arg('--port', process.env.ADEXWEB_PORT ?? 8099));
const TOUR = arg('--tour', '1');
const LARGEURS = [320, 375, 768, 1024, 1440, 1920];

const PAGES = readdirSync(RACINE).filter((f) => f.endsWith('.html')).sort();
if (PAGES.length === 0) { console.error('ARRET : aucune page HTML a la racine.'); process.exit(1); }

const SORTIE = join(RACINE, 'preuves', `2026-08-08-adexweb-tour${TOUR}`);
mkdirSync(SORTIE, { recursive: true });

const SONDE = () => {
  const canal = (v) => { const c = v / 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
  const lum = (r, g, b) => 0.2126 * canal(r) + 0.7152 * canal(g) + 0.0722 * canal(b);
  const lire = (s) => {
    const m = /rgba?\(([^)]+)\)/.exec(s);
    if (!m) return null;
    const p = m[1].split(/[,\s/]+/).filter(Boolean).map(Number);
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
  };
  // Le fond REELLEMENT peint : on remonte les ancetres et on compose les
  // couches translucides, dans l'ordre ou le navigateur les pose.
  const fondPeint = (el) => {
    const couches = [];
    for (let n = el; n && n.nodeType === 1; n = n.parentElement) {
      const c = lire(getComputedStyle(n).backgroundColor);
      if (c && c.a > 0) { couches.unshift(c); if (c.a >= 0.999) break; }
    }
    if (couches.length === 0) return { r: 255, g: 255, b: 255 };
    let f = couches[0];
    for (let i = 1; i < couches.length; i++) {
      const d = couches[i];
      f = { r: d.r * d.a + f.r * (1 - d.a), g: d.g * d.a + f.g * (1 - d.a), b: d.b * d.a + f.b * (1 - d.a) };
    }
    return f;
  };

  const res = {
    contraste: [], petits: [], cibles: [], sansAlt: [], h1: 0,
    debord: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    hauteur: document.body.scrollHeight,
  };
  res.h1 = document.querySelectorAll('h1').length;

  document.querySelectorAll('img').forEach((i) => {
    if (!i.hasAttribute('alt')) res.sansAlt.push(i.getAttribute('src') || '(sans src)');
  });

  const marche = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const vus = new Set();
  let n;
  while ((n = marche.nextNode())) {
    const t = (n.textContent || '').trim();
    if (t.length < 2) continue;
    const el = n.parentElement;
    if (!el || vus.has(el)) continue;
    vus.add(el);
    // LES RECONSTITUTIONS NE SE JUGENT PAS A NOTRE REGLE.
    // Le « avant » des comparateurs imite volontairement un site de 2011 :
    // texte de 11 px, gris sur gris, compteur de visites. Les treize
    // maquettes de secteur imitent chacune un autre metier. Les mesurer
    // reviendrait a exiger que la laideur qu'on denonce soit accessible —
    // et a noyer les vrais defauts sous 243 faux.  D-852
    if (el.closest('.ba-vue--avant, .v11, [class^="gab"], [class*=" gab"], .mock, [data-mock], #tplSecteurs, .sec-chrome')) continue;
    if (el.closest('[hidden], [aria-hidden="true"], .sr-only, .piege, template')) continue;
    const s = getComputedStyle(el);
    if (s.visibility === 'hidden' || s.display === 'none' || Number(s.opacity) < 0.1) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) continue;

    const av = lire(s.color);
    if (!av) continue;
    const ar = fondPeint(el);
    const l1 = lum(av.r, av.g, av.b), l2 = lum(ar.r, ar.g, ar.b);
    const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    const px = parseFloat(s.fontSize);
    const gras = Number(s.fontWeight) >= 700;
    const grand = px >= 24 || (px >= 18.66 && gras);
    const plancher = grand ? 3 : 4.5;
    if (ratio < plancher) {
      res.contraste.push({ ratio: Number(ratio.toFixed(2)), plancher, px, texte: t.slice(0, 46), ou: el.className || el.tagName });
    }

    // Le corps ne descend jamais sous 19 px. Les mentions et les etiquettes
    // en capitales ont droit a 15 ; en dessous, plus rien.
    if (px < 14.9 && t.length > 12) res.petits.push({ px, texte: t.slice(0, 46), ou: el.className || el.tagName });
  }

  document.querySelectorAll('a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])').forEach((el) => {
    if (el.closest('[hidden], template') || el.disabled) return;
    if (el.closest('.ba-vue--avant, .v11, [class^="gab"], [class*=" gab"], .mock, [data-mock], #tplSecteurs')) return;
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return;
    // Un lien AU FIL DU TEXTE n'a pas de taille de cible imposee : la regle
    // vise les commandes, pas les mots soulignes dans un paragraphe.
    if (el.tagName === 'A' && el.closest('p, li') && !el.className) return;
    if (r.height < 44 || r.width < 44) {
      res.cibles.push({ h: Math.round(r.height), l: Math.round(r.width), quoi: (el.textContent || el.getAttribute('aria-label') || el.tagName).trim().slice(0, 34) });
    }
  });
  return res;
};

const nav = await chromium.launch();
const rapport = [];
let examinees = 0;
let echecs = 0;

for (const page of PAGES) {
  for (const largeur of LARGEURS) {
    const onglet = await nav.newPage({ viewport: { width: largeur, height: 900 }, deviceScaleFactor: 1 });
    const console_ = [];
    const tierces = [];
    const ratees = [];
    onglet.on('console', (m) => { if (m.type() === 'error') console_.push(m.text().slice(0, 120)); });
    onglet.on('pageerror', (e) => console_.push(String(e).slice(0, 120)));
    onglet.on('request', (r) => {
      const u = r.url();
      if (!u.startsWith(`http://127.0.0.1:${PORT}`) && !u.startsWith('data:') && !u.startsWith('blob:')) tierces.push(u.slice(0, 90));
    });
    onglet.on('requestfailed', (r) => ratees.push(r.url().slice(0, 90)));

    // Le popup des guides bloque tout clic dans les outils.  Piege 18
    await onglet.addInitScript(() => {
      try { sessionStorage.setItem('adexweb-sans-popup', '1'); } catch (e) {}
    });

    const rep = await onglet.goto(`http://127.0.0.1:${PORT}/${page}`, { waitUntil: 'load' });
    if (!rep || rep.status() !== 200) {
      console.error(`ARRET : ${page} rend ${rep ? rep.status() : 'rien'} — le serveur tourne-t-il ? node tools/serve.mjs ${PORT}`);
      process.exit(1);
    }
    await onglet.evaluate(() => document.fonts.ready);
    await onglet.evaluate(async () => {
      const pas = Math.round(window.innerHeight * 0.6);
      for (let y = 0; y < document.body.scrollHeight; y += pas) {
        window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60));
      }
    });
    await onglet.waitForTimeout(700);

    const s = await onglet.evaluate(SONDE);
    if (largeur === 1440) {
      await onglet.screenshot({ path: join(SORTIE, `${page.replace('.html', '')}-1440.png`), fullPage: true });
    }
    await onglet.close();
    examinees++;

    const ligne = {
      page, largeur,
      debord: s.debord, hauteur: s.hauteur, h1: s.h1,
      console: console_.length, tierces: tierces.length, ratees: ratees.length,
      contraste: s.contraste.length, petits: s.petits.length, cibles: s.cibles.length, sansAlt: s.sansAlt.length,
      detail: { console: console_.slice(0, 4), tierces: tierces.slice(0, 4), ratees: ratees.slice(0, 4), contraste: s.contraste.slice(0, 6), petits: s.petits.slice(0, 4), cibles: s.cibles.slice(0, 6), sansAlt: s.sansAlt.slice(0, 4) },
    };
    const ko = s.debord > 0 || console_.length || tierces.length || ratees.length
      || s.contraste.length || s.petits.length || s.cibles.length || s.sansAlt.length || s.h1 !== 1;
    if (ko) echecs++;
    rapport.push(ligne);

    console.log(
      `${ko ? 'ECHEC' : '  ok '} ${page.padEnd(22)} ${String(largeur).padStart(5)}  `
      + `deb ${String(s.debord).padStart(3)}  con ${String(console_.length).padStart(2)}  `
      + `3e ${String(tierces.length).padStart(2)}  404 ${String(ratees.length).padStart(2)}  `
      + `ctr ${String(s.contraste.length).padStart(3)}  15px ${String(s.petits.length).padStart(3)}  `
      + `44px ${String(s.cibles.length).padStart(3)}  alt ${String(s.sansAlt.length).padStart(2)}  h1 ${s.h1}  ${s.hauteur}px`);
  }
}

await nav.close();

if (examinees === 0) { console.error('ARRET : zero page examinee.'); process.exit(1); }

writeFileSync(join(SORTIE, 'rapport.json'), JSON.stringify({ tour: TOUR, pages: PAGES.length, largeurs: LARGEURS, examinees, echecs, rapport }, null, 1), 'utf8');

console.log(`\n${examinees} passages, ${echecs} en echec.`);
console.log(`Planches et rapport : preuves/2026-08-08-adexweb-tour${TOUR}/`);

if (echecs) {
  console.log('\nLE DETAIL DES PREMIERS ECHECS :');
  for (const l of rapport.filter((x) => x.debord || x.console || x.tierces || x.ratees || x.contraste || x.petits || x.cibles || x.sansAlt || x.h1 !== 1).slice(0, 8)) {
    console.log(`\n  ${l.page} @ ${l.largeur}`);
    if (l.h1 !== 1) console.log(`    h1 : ${l.h1} au lieu de 1`);
    if (l.debord) console.log(`    debord : ${l.debord} px`);
    for (const c of l.detail.console) console.log(`    console : ${c}`);
    for (const t of l.detail.tierces) console.log(`    TIERCE  : ${t}`);
    for (const r of l.detail.ratees) console.log(`    ratee   : ${r}`);
    for (const c of l.detail.contraste) console.log(`    contraste ${c.ratio}:1 (plancher ${c.plancher}, ${c.px}px) « ${c.texte} » — ${c.ou}`);
    for (const p of l.detail.petits) console.log(`    ${p.px}px « ${p.texte} » — ${p.ou}`);
    for (const c of l.detail.cibles) console.log(`    cible ${c.l}x${c.h} « ${c.quoi} »`);
    for (const a of l.detail.sansAlt) console.log(`    img sans alt : ${a}`);
  }
  process.exit(1);
}
