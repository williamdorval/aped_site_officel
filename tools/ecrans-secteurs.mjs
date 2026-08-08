/* ============================================================
   LE PREMIER ÉCRAN DES DOUZE SECTEURS
   `node tools/ecrans-secteurs.mjs [clé…] [--port 8099] [--png]`

   Un métier = UN écran, arrêté. Pas de page longue, pas de tuiles,
   pas de couture, pas de défilement.  D-681

   ── POURQUOI 1440 × 900 ET PAS 760 NI 1280 ──────────────────────
   L'aperçu du panneau donnait l'impression d'une LOUPE, et la cause
   n'était pas l'affichage : c'était la prise de vue. Les tuiles
   étaient photographiées à **760 px de large**, la largeur d'une
   tablette. À cette largeur un site rend sa mise en page étroite —
   un titre par ligne, des cartes empilées, une typographie
   proportionnellement énorme. Réduite dans un cadre de 421 px, elle
   se lit comme un gros plan, jamais comme un site.

   1440 × 900 est la fenêtre d'un vrai bureau. Réduite à 421 px de
   large, elle rend un facteur de **0,29** : le texte courant tombe
   sous 5 px, et c'est exactement à ça que ressemble un moniteur posé
   à trois mètres. C'est la commande.  D-683

   Densité 2 : la sortie fait 1 440 px pour un cadre qui va de 348 à
   621 px selon la fenêtre. On photographie à 2 880 pour que la
   réduction par demi-pas ne crénèle pas.

   ── CE QUE L'OUTIL REFUSE DE LIVRER ─────────────────────────────
   · une capture PLATE, mesurée par tranches — une image peut être
     riche en haut et vide en bas, et une moyenne d'ensemble le cache
     (piège 40, D-614) ;
   · une capture prise avant que les polices et les images soient
     là — `document.fonts.ready`, puis `complete && naturalWidth > 0`
     sur chaque `<img>`, chaque attente bornée (pièges 39 et 52) ;
   · un paramètre illisible : un `NaN` rend « tout va bien » sur
     n'importe quoi (piège 30).

   ── LE MASQUAGE ─────────────────────────────────────────────────
   Les trois projets RÉELS portent des marques, des numéros et des
   adresses. Le registre des masques est dans `demos-sites.mjs`, une
   seule source pour cet outil et pour `demos-capture.mjs` : une
   règle de véracité se corrige PARTOUT, en une fois.
   ============================================================ */
import { chromium } from "playwright";
import { spawn } from "node:child_process";
import net from "node:net";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PROJETS } from "./demos-sites.mjs";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, "..");
const SORTIE_PNG = path.join(ICI, "_ecrans");
const SORTIE_WEBP = path.join(RACINE, "images", "realisations");
fs.mkdirSync(SORTIE_PNG, { recursive: true });
fs.mkdirSync(SORTIE_WEBP, { recursive: true });

const LARG = 1440;
const HAUT = 900;
const DENSITE = 2;
const QUALITE = 0.82;

/* ── LES DOUZE ──────────────────────────────────────────────────
   `instant` : le nombre de millisecondes qu'on laisse tourner AVANT
   de déclencher. Ce n'est pas un délai de confort — c'est le moment
   où le geste de l'écran est à mi-course, et donc VISIBLE sur une
   image arrêtée (D-685). Un écran sans geste garde 1400, le temps
   que tout se pose.

   `figer: false` : les trois projets RÉELS ne sont pas dessinés
   autour d'un instant photogénique, et geler leurs animations est
   ACTIVEMENT NUISIBLE — la première passe a photographié le
   préchargeur du restaurant arrêté à « 89 % », parce que le gel a
   figé le compteur au lieu de le laisser finir. Pour eux : on attend
   que la page se pose, et on déclenche.

   `attente` : les millisecondes d'attente en plus, avant tout le
   reste. Un préchargeur qui compte jusqu'à cent n'a pas fini à
   1,4 seconde. */
const ECRANS = {
  restaurant: { projet: "restau", instant: 1400, figer: false, attente: 7000 },
  boutique: { statique: "boutique", instant: 1400 },
  coiffure: { statique: "coiffure", instant: 1400 },
  gym: { statique: "gym", instant: 1400 },
  hotel: { statique: "hotel", instant: 1400 },
  garage: { projet: "garage", instant: 1400, figer: false, attente: 4000 },
  construction: { statique: "construction", instant: 1400 },
  paysagement: { projet: "deneigement", instant: 1400, figer: false, attente: 5000 },
  clinique: { statique: "clinique", instant: 1400 },
  immobilier: { statique: "immobilier", instant: 1400 },
  juridique: { statique: "juridique", instant: 1400 },
  photo: { statique: "photo", instant: 1400 },
};

/* ── LES PARAMÈTRES ─────────────────────────────────────────────
   Un paramètre qui ne se lit pas ARRÊTE l'outil. Il ne retombe
   jamais en silence sur une valeur par défaut : toute comparaison
   avec `NaN` est fausse, donc un seuil illisible rend « aucune
   différence » sur n'importe quelle image (piège 30). */
const args = process.argv.slice(2);
const iPort = args.indexOf("--port");
let PORT = 8099;
if (iPort >= 0) {
  PORT = Number(args[iPort + 1]);
  if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
    throw new Error(`--port illisible : ${JSON.stringify(args[iPort + 1])}`);
  }
  args.splice(iPort, 2);
}
const GARDER_PNG = args.includes("--png");
const cles = args.filter((a) => !a.startsWith("--"));
const liste = cles.length ? cles : Object.keys(ECRANS);
for (const c of liste) if (!ECRANS[c]) throw new Error(`clé inconnue : ${c}\nconnues : ${Object.keys(ECRANS).join(" ")}`);

/* ── LA SONDE DE PORT INTERROGE `localhost` ─────────────────────
   Vite se lie à `localhost`, que Windows résout en `::1` : le
   serveur écoute donc en IPv6 SEULEMENT. Une sonde branchée sur
   l'IPv4 rend « port libre » pendant que le serveur répond « port
   déjà utilisé » — deux verdicts contradictoires sur le même port.
   Piège 38 / D-611. */
function ecoute(port) {
  return new Promise((res) => {
    const s = net.connect({ host: "localhost", port }, () => { s.destroy(); res(true); });
    s.on("error", () => res(false));
    s.setTimeout(900, () => { s.destroy(); res(false); });
  });
}
async function attendrePort(port, limite = 60000) {
  const t0 = Date.now();
  while (Date.now() - t0 < limite) {
    if (await ecoute(port)) return true;
    await new Promise((r) => setTimeout(r, 400));
  }
  return false;
}

/* ── LA PLATITUDE, PAR TRANCHES ─────────────────────────────────
   Une capture uniforme n'est pas une capture, et une moyenne
   d'ensemble cache une image riche en haut et vide en bas. On mesure
   l'écart-type de luminance sur huit bandes.

   MAIS UNE SEULE BANDE PLATE N'EST PAS UN DÉFAUT, ET LE PREMIER
   VERDICT DE CET OUTIL ÉTAIT FAUX.  Piège 15, encore lui : un
   détecteur doit distinguer ce qui est plat EXPRÈS. Le premier écran
   du garage a été refusé sur une pire bande à 5,2 — c'était le capot
   noir de la voiture, en bas de l'image, et la capture était
   excellente. Un bandeau plein, un ciel, un capot, un mur de couleur :
   tous les écrans bien composés ont une bande calme.

   Deux critères, et il faut les DEUX pour refuser :
     · la MÉDIANE des huit bandes sous le seuil — l'image entière est
       vide, pas seulement son bord ;
     · ou TROIS bandes plates de suite — un tiers de l'écran mort. */
const SEUIL_PLATITUDE = 6;
function verdictPlatitude(bandes) {
  const tri = [...bandes].sort((a, b) => a - b);
  const mediane = (tri[3] + tri[4]) / 2;
  let suite = 0, pire = 0;
  for (const b of bandes) { suite = b < SEUIL_PLATITUDE ? suite + 1 : 0; if (suite > pire) pire = suite; }
  return {
    mediane: +mediane.toFixed(1),
    suite: pire,
    plate: mediane < SEUIL_PLATITUDE || pire >= 3,
    raison: mediane < SEUIL_PLATITUDE ? `médiane ${mediane.toFixed(1)} < ${SEUIL_PLATITUDE}` : (pire >= 3 ? `${pire} bandes plates de suite` : ""),
  };
}
async function platitude(page, fichier) {
  return page.evaluate(async (u) => {
    const img = new Image();
    img.src = u;
    await img.decode();
    const c = document.createElement("canvas");
    c.width = 480;
    c.height = Math.round((480 * img.naturalHeight) / img.naturalWidth);
    const x = c.getContext("2d");
    x.imageSmoothingQuality = "high";
    x.drawImage(img, 0, 0, c.width, c.height);
    const bandes = [];
    for (let t = 0; t < 8; t++) {
      const y0 = Math.floor((c.height * t) / 8);
      const y1 = Math.max(y0 + 1, Math.floor((c.height * (t + 1)) / 8));
      const d = x.getImageData(0, y0, c.width, y1 - y0).data;
      let s = 0, s2 = 0, n = 0;
      for (let i = 0; i < d.length; i += 4) {
        const l = 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
        s += l; s2 += l * l; n++;
      }
      const m = s / n;
      bandes.push(+Math.sqrt(Math.max(0, s2 / n - m * m)).toFixed(1));
    }
    return { bandes, pire: Math.min(...bandes) };
  }, "data:image/png;base64," + fs.readFileSync(fichier).toString("base64"));
}

/* ── L'ENCODAGE ─────────────────────────────────────────────────
   Par le navigateur lui-même : aucune dépendance nouvelle, et le
   dépôt continue de ne dépendre de rien. La réduction se fait par
   demi-pas — un `drawImage` qui divise par plus de deux d'un coup
   crénèle. */
async function versWebp(page, entree, sortie) {
  const b64 = fs.readFileSync(entree).toString("base64");
  const dataUrl = await page.evaluate(async ({ b64, L, Q }) => {
    const img = new Image();
    img.src = "data:image/png;base64," + b64;
    await img.decode();
    const h = Math.round((L * img.naturalHeight) / img.naturalWidth);
    let cw = img.naturalWidth, ch = img.naturalHeight;
    let src = document.createElement("canvas");
    src.width = cw; src.height = ch;
    src.getContext("2d").drawImage(img, 0, 0);
    while (cw / 2 > L) {
      const nw = Math.round(cw / 2), nh = Math.round(ch / 2);
      const c2 = document.createElement("canvas");
      c2.width = nw; c2.height = nh;
      const x2 = c2.getContext("2d");
      x2.imageSmoothingQuality = "high";
      x2.drawImage(src, 0, 0, nw, nh);
      src = c2; cw = nw; ch = nh;
    }
    const c = document.createElement("canvas");
    c.width = L; c.height = h;
    const x = c.getContext("2d");
    x.imageSmoothingQuality = "high";
    x.drawImage(src, 0, 0, cw, ch, 0, 0, L, h);
    return c.toDataURL("image/webp", Q);
  }, { b64, L: LARG, Q: QUALITE });
  if (!dataUrl.startsWith("data:image/webp")) throw new Error("le moteur n'a pas rendu du WebP");
  fs.writeFileSync(sortie, Buffer.from(dataUrl.split(",")[1], "base64"));
  return fs.statSync(sortie).size;
}

/* ── LA PRISE DE VUE ────────────────────────────────────────────── */
const nav = await chromium.launch();
const utilitaire = await nav.newPage();          // sert au calcul et à l'encodage
const serveurs = [];
const rapport = [];
let echecs = 0;

try {
  for (const cle of liste) {
    const def = ECRANS[cle];
    let url;

    if (def.statique) {
      if (!(await ecoute(PORT))) {
        throw new Error(`rien n'écoute sur ${PORT} — lancer \`node tools/serve.mjs ${PORT}\` dans un autre terminal`);
      }
      url = `http://localhost:${PORT}/demos-secteurs/${def.statique}/index.html`;
    } else {
      const p = PROJETS[def.projet];
      if (!p) throw new Error(`projet inconnu dans demos-sites.mjs : ${def.projet}`);
      if (!(await ecoute(p.port))) {
        console.log(`   ${cle} — démarrage de ${def.projet} sur ${p.port}`);
        const proc = spawn("npm", p.cmd, { cwd: p.dossier, shell: true, stdio: "ignore" });
        serveurs.push(proc);
        if (!(await attendrePort(p.port))) throw new Error(`${def.projet} n'a jamais répondu sur ${p.port}`);
        await new Promise((r) => setTimeout(r, 2500));
      }
      url = `http://localhost:${p.port}/`;
    }

    const page = await nav.newPage({ viewport: { width: LARG, height: HAUT }, deviceScaleFactor: DENSITE });
    const erreurs = [];
    page.on("console", (m) => { if (m.type() === "error") erreurs.push(m.text()); });
    page.on("pageerror", (e) => erreurs.push("pageerror: " + e.message));
    await page.goto(url, { waitUntil: "load", timeout: 45000 });

    /* Les polices d'abord : un titre mesuré avant `fonts.ready` est
       mesuré dans la police de secours, et la mise en page bouge
       après la capture. L'attente est BORNÉE. */
    await page.evaluate(() => Promise.race([
      document.fonts.ready,
      new Promise((r) => setTimeout(r, 6000)),
    ]));

    /* Puis les images. Une image DÉCLARÉE n'est pas une image
       CHARGÉE (piège 52), et `decode()` ne rejette jamais sur une
       image jamais demandée (piège 39) : chaque attente porte donc
       sa propre limite. */
    const img = await page.evaluate(async () => {
      const tout = [...document.images];
      const dans = tout.filter((i) => {
        const r = i.getBoundingClientRect();
        return r.top < innerHeight && r.bottom > 0 && r.width > 0;
      });
      await Promise.all(dans.map((i) => Promise.race([
        i.complete && i.naturalWidth > 0 ? Promise.resolve() : new Promise((r) => { i.addEventListener("load", r, { once: true }); i.addEventListener("error", r, { once: true }); }),
        new Promise((r) => setTimeout(r, 5000)),
      ])));
      return {
        dans: dans.length,
        chargees: dans.filter((i) => i.complete && i.naturalWidth > 0).length,
      };
    });

    /* ── LE MASQUAGE, ET IL SE PASSE DEUX FOIS ──────────────────
       LE MASQUAGE EST TEXTUEL, PAS STRUCTUREL. On remplace des
       chaînes dans les nœuds de texte ; retirer un élément
       déplacerait tout ce qui suit et on photographierait une mise
       en page qui n'existe pas.

       DEUX FOIS, PARCE QU'UNE FOIS NE TIENT PAS.  Piège 58.
       Le premier passage a été effacé sous nos yeux : la page du
       déneigeur a raté son hydratation React (« Hydration failed…
       this tree will be regenerated on the client »), React a
       reconstruit l'arbre, et le numéro de téléphone est revenu —
       en clair, dans la capture, sans que rien ne le dise. On masque
       donc AVANT l'attente et de nouveau JUSTE AVANT le déclenchement.

       ET ON VÉRIFIE. Un masque qu'on ne vérifie pas est un masque
       qui peut être défait en silence : après la seconde passe, les
       motifs sont relus dans le texte RENDU, et un seul survivant
       arrête la capture. */
    const p = def.projet ? PROJETS[def.projet] : null;
    const masquer = async () => {
      if (!p || (!p.masques.length && !p.retirer.length)) return 0;
      return page.evaluate(({ masques, retirer }) => {
        let n = 0;
        const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        const noeuds = [];
        while (w.nextNode()) noeuds.push(w.currentNode);
        for (const nd of noeuds) {
          let t = nd.nodeValue;
          const avant = t;
          for (const [motif, drapeaux, par] of masques) t = t.replace(new RegExp(motif, drapeaux), par);
          for (const r of retirer) if (t.includes(r)) t = t.split(r).join("");
          if (t !== avant) { nd.nodeValue = t; n++; }
        }
        return n;
      }, {
        masques: p.masques.map(([re, par]) => [re.source, re.flags, par]),
        retirer: p.retirer,
      });
    };
    let remplaces = await masquer();

    /* ── L'INSTANT, ET IL NE SE JOUE PAS AU CHRONOMÈTRE ─────────
       Un mouvement ne compte que s'il se voit sur l'image arrêtée
       (D-685) : on photographie au moment où il est à mi-course.

       Attendre N millisecondes puis déclencher, c'est une course :
       la sonde peut être plus rapide que la page (piège 14) ou plus
       lente qu'une révélation qui s'est déjà terminée (piège 9), et
       deux passes rendent deux images différentes. On PAUSE donc
       toutes les animations et on pose leur temps local à la main —
       le même nombre rend toujours la même image.

       `pause()` et non `animation-play-state` : `animation` est un
       raccourci qui remet `running`, et il faudrait un `!important`
       pour le tenir (piège 16). L'API Web Animations n'a pas ce
       défaut.

       L'ÉCRAN DÉCLARE SON PROPRE INSTANT, dans son `<head>` :
           <meta name="adexweb-instant" content="940">
       Un registre séparé dériverait du fichier qu'il décrit. Sans la
       balise, on prend le défaut du registre et on le DIT. */
    /* Les deux noms, le temps que les neuf ecrans passent au nouveau :
       sans la balise, l'outil retombe sur le defaut du registre et
       photographie a un autre instant, sans echouer.  A RETIRER des
       qu'aucun `index.html` de `demos-secteurs` ne porte plus
       `aped-instant`. */
    const instant = await page.evaluate(() => {
      const m = document.querySelector('meta[name="adexweb-instant"], meta[name="aped-instant"]');
      const v = m ? Number(m.content) : NaN;
      return Number.isFinite(v) && v >= 0 ? v : null;
    });
    const t = instant ?? def.instant;
    if (def.attente) await page.waitForTimeout(def.attente);
    await page.waitForTimeout(Math.min(t, 1400));
    let gelees = 0;
    if (def.figer !== false) {
      gelees = await page.evaluate((ms) => {
        const a = document.getAnimations();
        for (const an of a) { try { an.pause(); an.currentTime = ms; } catch {} }
        return a.length;
      }, t);
    }

    /* LE BADGE DE DÉVELOPPEMENT DE NEXT.JS EST DANS L'IMAGE, et il n'a
       rien à y faire : une pastille rouge « 1 Issue » en bas à gauche
       du premier écran d'un projet. Il vit dans un `<nextjs-portal>`
       à racine d'ombre — on le retire du document, pas de son ombre. */
    await page.evaluate(() => {
      for (const s of ["nextjs-portal", "[data-nextjs-toast]", "#__next-build-watcher", "vite-error-overlay"]) {
        document.querySelectorAll(s).forEach((e) => e.remove());
      }
    });
    /* Seconde passe de masquage, puis vérification — voir plus haut. */
    remplaces += await masquer();
    /* UN VÉRIFICATEUR QUI ATTRAPE SON PROPRE REMPLACEMENT NE VÉRIFIE
       RIEN.  Le premier jet a refusé la capture sur « 000 000-0000 »
       et « courriel@exemple.ca » — c'est-à-dire sur les chaînes que
       le masque venait de POSER : elles satisfont évidemment le motif
       qu'elles remplacent. Un motif n'a survécu que si ce qu'il
       attrape n'est PAS son propre remplacement. */
    const survivants = p ? await page.evaluate(({ masques, retirer }) => {
      const txt = document.body.innerText;
      const out = [];
      for (const [motif, drapeaux, par] of masques) {
        const m = txt.match(new RegExp(motif, drapeaux.includes("g") ? drapeaux : drapeaux + "g"));
        if (m) for (const x of new Set(m)) if (x !== par) out.push(x);
      }
      for (const r of retirer) if (txt.includes(r)) out.push(r);
      return [...new Set(out)];
    }, {
      masques: p.masques.map(([re, par]) => [re.source, re.flags, par]),
      retirer: p.retirer,
    }) : [];

    await page.waitForTimeout(160);   // laisser une image se peindre

    const fPng = path.join(SORTIE_PNG, `${cle}.png`);
    await page.screenshot({ path: fPng });               // pas `fullPage` : c'est UN écran

    if (survivants.length) {
      echecs++;
      console.log(`✗ ${cle.padEnd(13)} MASQUAGE DÉFAIT — ${survivants.length} motif(s) encore lisible(s) : ${survivants.slice(0, 6).join(" · ")}`);
      console.log(`  la capture reste dans ${path.relative(RACINE, fPng)} ; rien n'est écrit en WebP`);
      rapport.push({ cle, ko: 0, survivants, images: img, erreurs: erreurs.length });
      await page.close();
      continue;
    }

    const plat = await platitude(utilitaire, fPng);
    const v = verdictPlatitude(plat.bandes);
    const fWebp = path.join(SORTIE_WEBP, `ecran-${cle}.webp`);
    let ko = 0;
    if (v.plate) {
      echecs++;
      console.log(`✗ ${cle.padEnd(13)} CAPTURE PLATE — ${v.raison}  ${JSON.stringify(plat.bandes)}`);
      console.log(`  la capture reste dans ${path.relative(RACINE, fPng)} pour être REGARDÉE ; rien n'est écrit en WebP`);
    } else {
      ko = Math.round((await versWebp(utilitaire, fPng, fWebp)) / 1024);
      console.log(`✓ ${cle.padEnd(13)} ${LARG}×${HAUT}  ${String(ko).padStart(3)} ko  images ${img.chargees}/${img.dans}  ${gelees} anim. gelées à ${t} ms${instant === null ? " (défaut — pas de <meta name=\"adexweb-instant\">)" : ""}  bandes ${JSON.stringify(plat.bandes)}${erreurs.length ? `  ⚠ ${erreurs.length} erreur(s) console` : ""}${remplaces ? `  ${remplaces} nœud(s) masqué(s)` : ""}`);
    }
    if (erreurs.length) {
      echecs++;
      for (const e of erreurs.slice(0, 4)) console.log(`    console: ${e.slice(0, 160)}`);
    }
    rapport.push({ cle, ko, bandes: plat.bandes, mediane: v.mediane, suitePlate: v.suite, instant: t, images: img, erreurs: erreurs.length });
    if (!GARDER_PNG && !v.plate) fs.unlinkSync(fPng);
    await page.close();
  }
} finally {
  for (const s of serveurs) { try { s.kill(); } catch {} }
  await nav.close();
}

fs.writeFileSync(path.join(SORTIE_PNG, "rapport.json"), JSON.stringify(rapport, null, 1), "utf8");
console.log(`\n${rapport.length} écran(s) · ${echecs} problème(s) · sortie images/realisations/ecran-<clé>.webp`);
process.exit(echecs ? 1 : 0);
