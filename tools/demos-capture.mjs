/* ============================================================
   LES QUATRE VRAIS SITES, PHOTOGRAPHIES POUR LA COMPARAISON
   `node tools/demos-capture.mjs [cle...]`

   Les quatre « apres » de la section Realisations ne sont plus des
   maquettes redessinees : ce sont les projets reels, servis par leur
   propre serveur de developpement et photographies.

   TROIS PRECAUTIONS, ET CHACUNE A COUTE UNE PASSE.

   1. ON NE FORCE PAS LES REVELATIONS A LA MAIN. La premiere version
      de cette capture poussait `opacity: 1` sur tout ce qui portait
      un style en ligne. Resultat sur un des sites : le titre
      « On dessine des espaces qui vous ressemblent » est sorti
      « Ondessinedesespacesqui vousressemblent » — les mots sont des
      boites separees, et forcer leur etat a ecrase l'espace qui les
      separait. On DEFILE la page comme un visiteur, on attend, et on
      laisse les revelations se jouer toutes seules.

   2. LE MASQUAGE EST TEXTUEL, PAS STRUCTUREL. On remplace des chaines
      dans les noeuds de texte ; on ne retire jamais un element, sauf
      pour les notes et nombres d'avis, qui sont des preuves qu'on ne
      peut pas montrer. Retirer une boite deplacerait tout ce qui
      suit, et on photographierait une mise en page qui n'existe pas.

   3. LE CADRAGE SE RELEVE, IL NE SE DEVINE PAS. Chaque site place le
      titre de son heros a une hauteur differente — de 650 px pour
      l'un a 1 250 px pour l'autre. Un cadrage commun rendait, pour
      deux d'entre eux, une photographie sans un mot dessus. Le point
      de depart est donc releve site par site, et il est ecrit ici
      avec sa raison.
   ============================================================ */
import { chromium } from "playwright";
import { spawn } from "node:child_process";
import net from "node:net";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { RAPPORTS } from "./demos-rapports.mjs";

/* UNE CAPTURE UNIFORME N'EST PAS UNE CAPTURE.  D-614 / piege 40
   Un des quatre sites a deja rendu une bande entierement noire, et
   rien ne l'a dit. On mesure l'etalement des valeurs PAR TRANCHES :
   une moyenne d'ensemble cache une image riche en haut et vide en
   bas — c'est exactement ce qui est arrive le 2026-07-31. */
async function mesurerPlatitude(p2, fichier) {
  return p2.evaluate(async (u) => {
    const img = new Image();
    img.src = u;
    await img.decode();
    const c = document.createElement("canvas");
    const L = 380;
    c.width = L;
    c.height = Math.min(Math.round((L * img.height) / img.width), 6000);
    const x = c.getContext("2d");
    x.imageSmoothingQuality = "high";
    x.drawImage(img, 0, 0, img.width, img.height, 0, 0, c.width, c.height);
    const tranches = [];
    const T = 8;
    for (let t = 0; t < T; t++) {
      const y0 = Math.floor((c.height * t) / T);
      const y1 = Math.floor((c.height * (t + 1)) / T);
      const d = x.getImageData(0, y0, c.width, Math.max(1, y1 - y0)).data;
      let s = 0, s2 = 0, n = 0;
      for (let i = 0; i < d.length; i += 4) {
        const l = 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
        s += l; s2 += l * l; n++;
      }
      const m = s / n;
      tranches.push({ t, moy: +m.toFixed(1), ec: +Math.sqrt(Math.max(0, s2 / n - m * m)).toFixed(1) });
    }
    return { tranches, pire: tranches.reduce((a, b) => (b.ec < a.ec ? b : a)) };
  }, "data:image/png;base64," + fs.readFileSync(fichier).toString("base64"));
}

const ICI = path.dirname(fileURLToPath(import.meta.url));
const SORTIE = path.join(ICI, "_demos");
fs.mkdirSync(SORTIE, { recursive: true });

/* DEUX CADRAGES, ET LE SECOND EST CELUI QUI PART EN PAGE.  D-631
   `760 x 1425` etait la largeur d'une TABLETTE. Les quatre sites y
   rendent leur mise en page etroite : un titre par ligne, des cartes
   empilees, une typographie de 60 px. Reduit dans un cadre de 460 px,
   ca ne se lit pas comme un site, ca se lit comme un GROS PLAN — le
   defaut principal releve par le proprietaire.
   `--ecran` photographie donc a `1280 x 800`, la fenetre d'un
   ordinateur de bureau : c'est la composition en colonnes, la barre
   de navigation entiere, la hierarchie complete. Reduite dans le
   meme cadre, elle se lit comme un ECRAN. Densite 1,5 et non 2 : la
   sortie fait 820 px de large, une densite 2 ne servirait qu'a
   tripler le poids de la capture intermediaire. */
const ECRAN = process.argv.includes("--ecran");
const LARG = ECRAN ? 1280 : 760;
const HAUT = ECRAN ? 800 : 1425;
const DENSITE = ECRAN ? 1.5 : 2;

const PROJETS = {
  garage: {
    dossier: "C:/Users/tiwil/APED-AGENCY/demo-carroserie",
    cmd: ["run", "dev", "--", "--port", "5211", "--strictPort"],
    port: 5211,
    /* Le titre du heros est a 650-780 px : un depart a 300 le pose
       au milieu de la premiere fenetre. */
    depart: 300,
    masques: [
      [/I-CAR Gold Class/gi, "Certification carrosserie"],
      [/CAA[-\s]?Qu[ée]bec/gi, "Association automobile"],
      [/\bPPG\b/g, "Peinture homologuée"],
      [/514\s?555[-\s]?0192/g, "000 000-0000"],
      [/1855,\s*rue du Méridien[^.]*/gi, "Adresse sur demande"]
    ],
    retirer: ["4,9", "327 avis", "★"]
  },
  design: {
    dossier: "C:/Users/tiwil/APED-AGENCY/demo-design-int-rieur",
    cmd: ["run", "dev", "--", "-p", "3101"],
    port: 3101,
    /* La carte du heros vit tout en bas de la premiere fenetre,
       940-1300 px. */
    depart: 820,
    masques: [
      [/bonjour@studionorden\.ca/gi, "courriel@exemple.ca"],
      [/418\s?555[-\s]?0192/g, "000 000-0000"],
      [/400,\s*rue Saint-Paul Est[^.]*/gi, "Adresse sur demande"],
      [/Marie-Ève L\./g, "Cliente"],
      [/Jean-Philippe D\./g, "Client"],
      [/Catherine & Marc B\./g, "Clients"]
    ],
    retirer: []
  },
  restau: {
    dossier: "C:/Users/tiwil/APED-AGENCY/restau",
    cmd: ["run", "dev", "--", "-p", "3102"],
    port: 3102,
    /* LE « HEROS QUI NOIRCIT AU DEFILEMENT » N'EXISTE PAS.  D-635
       D-620 disait : ce site rend son heros au chargement et NOIR
       PLEIN des qu'on l'a fait defiler d'un pixel, « reproduit a
       chaque essai ». Il a donc ete photographie sans bouger
       (`fixe: true`), et la cause n'a jamais ete cherchee.
       Remesure du 2026-07-31 : 26 paliers de 600 px, ecart-type de
       luminance releve a chaque palier, plus une pleine page. AUCUNE
       image plate — le minimum est 22,8, le seuil de platitude est 3.
       La vraie cause etait D-618 / piege 40 : le selecteur de
       masquage `[class*="cursor"]` attrapait `cursor-none`, que ce
       site pose sur son enveloppe, et masquait LA PAGE ENTIERE. Elle
       a ete corrigee ; `fixe` est un contournement qui lui a survecu
       et qui, lui, empechait de photographier autre chose que la
       premiere fenetre. Il tombe.
       Lecon, et c'est la troisieme fois : quand on contourne au lieu
       de chercher, le contournement reste apres le correctif. */
    depart: 0,
    masques: [
      [/Le Devoir/g, "Quotidien national"],
      [/Tastet/g, "Guide gourmand"],
      [/En Route/g, "Magazine de bord"],
      [/OpenTable/g, "Réservation"],
      [/\bResy\b/g, "Réservation"],
      [/Gaspor/g, "Ferme partenaire"],
      [/Miels d'Anicet/g, "Miellerie"],
      [/march[ée]\s+Jean-Talon/gi, "marché public"],
      [/514\s?555[-\s]?0173/g, "000 000-0000"],
      [/5612,\s*boulevard Saint-Laurent/gi, "Adresse sur demande"]
    ],
    retirer: []
  },
  deneigement: {
    dossier: "C:/Users/tiwil/APED-AGENCY/MV-deneigement",
    cmd: ["run", "dev", "--", "-p", "3103"],
    port: 3103,
    /* Le titre « Votre entrée déneigée » est a 1020-1080 px. */
    depart: 680,
    masques: [
      [/\b\d{3}\s?\d{3}[-\s]\d{4}\b/g, "000 000-0000"],
      [/RBQ\s*:?\s*[\d-]+/gi, "RBQ 0000-0000-00"],
      [/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi, "courriel@exemple.ca"]
    ],
    retirer: []
  }
};

/* LA SONDE DE PORT INTERROGE `localhost`, PAS `127.0.0.1`.  D-611
   Vite se lie a `localhost`, que Windows resout en `::1` : le
   serveur ecoutait donc en IPv6 SEULEMENT. Une sonde branchee sur
   l'IPv4 rendait « port libre » pendant que Vite repondait « port
   deja utilise » — deux verdicts contradictoires sur le meme port,
   et trois changements de numero pour rien. Releve au netstat :
   `TCP [::1]:5211 LISTENING`, et rien sur `0.0.0.0`. */
function attendrePort(port, delai = 90000) {
  const fin = Date.now() + delai;
  return new Promise((res, rej) => {
    (function essai() {
      const s = net.connect(port, "localhost");
      s.on("connect", () => { s.destroy(); res(true); });
      s.on("error", () => {
        s.destroy();
        if (Date.now() > fin) rej(new Error("le port " + port + " n'a jamais repondu"));
        else setTimeout(essai, 600);
      });
    })();
  });
}

/* ON DEFILE A LA MOLETTE, PAS PAR `scrollTo`.  D-615
   Deux des quatre projets utilisent un defilement pilote (Lenis) :
   il intercepte la molette et translate lui-meme le contenu.
   `window.scrollTo` deplace le defilement natif SOUS lui — la
   position annoncee changeait, l'image restait celle du haut de
   page, et sur l'un des deux la fenetre rendait du NOIR PLEIN.
   La molette passe par le meme chemin qu'un visiteur, donc elle
   marche sur les quatre sans distinction. */
async function allerA(page, y) {
  for (let i = 0; i < 90; i++) {
    const cur = await page.evaluate(() => Math.round(window.scrollY));
    const d = y - cur;
    if (Math.abs(d) < 14) break;
    await page.mouse.wheel(0, Math.max(-420, Math.min(420, d)));
    await page.waitForTimeout(80);
  }
  await page.waitForTimeout(1100);
  return page.evaluate(() => Math.round(window.scrollY));
}

const SANS_PLEIN = process.argv.includes("--sans-plein");
const cles = process.argv.slice(2).filter((c) => PROJETS[c]);
const aFaire = cles.length ? cles : Object.keys(PROJETS);
const R = [];

for (const cle of aFaire) {
  const p = PROJETS[cle];
  console.log(`\n=== ${cle} — demarrage sur ${p.port} ===`);
  /* Piege 19 : un serveur deja debout fait echouer le tien en
     SILENCE. Ici les zombies gardaient le port en IPv6 sans plus
     repondre a rien : on nettoie avant, systematiquement. */
  await new Promise((r) => {
    const t = spawn(`for /f "tokens=5" %a in ('netstat -ano ^| findstr :${p.port} ^| findstr LISTENING') do taskkill /F /PID %a`, { shell: true, stdio: "ignore" });
    t.on("close", () => setTimeout(r, 1500));
    t.on("error", () => r());
  });
  /* `shell: true` : sous Windows, Node 24 refuse de lancer un `.cmd`
     sans passer par l'interpreteur (EINVAL). */
  const serveur = spawn("npm " + p.cmd.join(" "), { cwd: p.dossier, stdio: "ignore", shell: true });
  try {
    await attendrePort(p.port);
    const nav = await chromium.launch();
    const ctx = await nav.newContext({ viewport: { width: LARG, height: HAUT }, deviceScaleFactor: DENSITE });
    const page = await ctx.newPage();
    const manquantes = [];
    page.on("requestfailed", (r) => manquantes.push(r.url().slice(0, 80)));
    await page.goto(`http://localhost:${p.port}/`, { waitUntil: "networkidle", timeout: 120000 });
    await page.waitForTimeout(4500);

    /* On defile comme un visiteur : les revelations se jouent
       d'elles-memes, on ne pousse aucun etat a la main. */

    /* LES ESPACES DE FRAUNCES ONT UNE LARGEUR NULLE.  D-610
       Releve du 2026-07-31 sur deux des quatre projets : le titre
       « On dessine des espaces qui vous ressemblent » sort
       « Ondessinedesespacesqui vousressemblent », et le manifeste
       entier avec. Ce n'est PAS un artefact de la capture — le
       defaut est la sans qu'on touche a rien, et seuls les textes
       en Fraunces sont atteints ; ceux en Satoshi ont leurs
       espaces. La police, chargee par `next/font`, arrive sans
       glyphe d'espace utilisable.
       On repare a la prise de vue, sur les seuls elements dont la
       fonte calculee est Fraunces : `word-spacing` s'ajoute a
       l'avance du caractere, donc une avance nulle redevient une
       avance normale. On photographie ainsi le site tel qu'il est
       CENSE rendre, et le defaut est note dans RESERVES.md pour
       que le projet source soit corrige. */
    const espaces = await page.evaluate(() => {
      /* Le caractere d'espace EXISTE : il est place a la FIN d'un
         `inline-block`, ou le rendu supprime l'espace de fin de
         boite. Deux fausses pistes payees avant celle-ci :
           - `word-spacing` n'a rien a elargir, puisqu'il n'y a plus
             d'espace a l'affichage. Zero effet sur 34 elements.
           - une marge a droite de chaque boite : le titre du heros
             est decoupe LETTRE PAR LETTRE, pas mot par mot, donc la
             marge s'est glissee entre chaque caractere —
             « O n d e s s i n e ». Pire que le defaut.
         La bonne prise est `white-space: pre-wrap` : il empeche la
         suppression de l'espace de fin sans rien ajouter la ou il
         n'y en a pas, et il continue de passer a la ligne.  D-610 */
      let n = 0;
      for (const bloc of document.querySelectorAll("h1, h2, h3, h4, p, blockquote")) {
        if (!/Fraunces/i.test(getComputedStyle(bloc).fontFamily || "")) continue;
        bloc.style.whiteSpace = "pre-wrap";
        for (const mot of bloc.querySelectorAll("span")) { mot.style.whiteSpace = "pre-wrap"; n++; }
        n++;
      }
      return n;
    });

    /* La pastille des outils de `next dev` n'existe pas en
       production : la photographier serait montrer un site qui n'a
       jamais ete servi comme ca. */
    await page.evaluate(() => {
      document.querySelectorAll("nextjs-portal, [data-nextjs-toolbar], #__next-build-watcher, [data-next-badge-root], [id*='devtools'], [class*='devtools']")
        .forEach((e) => { e.style.display = "none"; });
    });

    const masquage = await page.evaluate(({ masques, retirer }) => {
      const faits = [];
      const marcheur = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      const noeuds = [];
      while (marcheur.nextNode()) noeuds.push(marcheur.currentNode);
      for (const [src, rep] of masques) {
        const rx = new RegExp(src.source, src.flags);
        let n = 0;
        for (const t of noeuds) {
          if (!t.nodeValue) continue;
          rx.lastIndex = 0;
          if (rx.test(t.nodeValue)) { t.nodeValue = t.nodeValue.replace(new RegExp(src.source, src.flags), rep); n++; }
        }
        faits.push({ motif: src.source, touches: n });
      }
      /* Une note ou un nombre d'avis est une preuve qu'on ne peut
         pas montrer : on masque la boite qui la porte, sans la
         retirer du flux — sinon toute la mise en page glisse. */
      let masquees = 0;
      for (const mot of retirer) {
        for (const el of document.querySelectorAll("span, p, li, div, strong, b")) {
          if (el.children.length === 0 && (el.textContent || "").indexOf(mot) >= 0) {
            el.style.visibility = "hidden"; masquees++;
          }
        }
      }
      /* Le curseur maison et les iframes de carte ne se photographient
         pas : l'un suit une souris absente, l'autre appelle un tiers. */
      /* JAMAIS `[class*="cursor"]`.  D-618
         C'etait la pour masquer les curseurs maison. Or `cursor-none`
         et `cursor-pointer` sont des utilitaires Tailwind, et l'un
         des quatre sites le pose sur son enveloppe : le selecteur
         masquait LA PAGE ENTIERE. Resultat, une capture noire, un
         WebP de 5 Ko, et trois passes a chercher du cote du
         defilement pilote. Un curseur maison ne se photographie de
         toute facon pas — il n'y a pas de souris. */
      document.querySelectorAll('iframe[src*="google"]')
        .forEach((e) => { e.style.visibility = "hidden"; });
      return { faits, masquees, hauteur: document.body.scrollHeight };
    }, { masques: p.masques.map(([r, s]) => [{ source: r.source, flags: r.flags }, s]), retirer: p.retirer });

    await page.waitForTimeout(900);
    /* LA FENETRE CADREE SE PREND AVANT TOUT LE RESTE.  D-613
       Deux raisons, et les deux ont ete payees en images noires :
         - `fullPage` redimensionne la fenetre le temps de la prise,
           et un site a defilement pilote ne s'en remet pas ;
         - une traversee complete de 16 000 px laisse les sections
           epinglees dans un etat dont elles ne reviennent pas.
       Le heros, lui, est peint des le chargement : il n'a besoin
       d'aucune traversee pour se montrer. On le photographie donc
       en premier, quand la page est encore intacte. */
    const vise = await page.evaluate(() => {
      const h = document.querySelector("h1") || document.querySelector("h2");
      if (!h) return null;
      const r = h.getBoundingClientRect();
      return Math.round(r.top + window.scrollY);
    });
    const depart = p.fixe ? p.depart : (vise === null ? p.depart : Math.max(0, vise - 360));
    const atteint = p.fixe ? await page.evaluate(() => Math.round(window.scrollY)) : await allerA(page, depart);
    /* ON ATTEND QUE LES IMAGES SOIENT DECODEES.  D-616
       En densite 2, l'optimiseur d'images de `next dev` sert des
       variantes plus grandes et met plusieurs secondes ; la fenetre
       partait avant, et le heros rendait NOIR PLEIN. Aucune requete
       n'echouait — elles n'etaient simplement pas finies. On attend
       le decodage, et on DIT combien d'images n'y sont pas arrivees. */
    const images = await page.evaluate(async () => {
      /* `decode()` NE REJETTE PAS sur une image jamais demandee : il
         ne resout jamais. Un `.catch` ne sert donc a rien et la
         sonde restait bloquee indefiniment — huit minutes sans un
         mot avant qu'on aille voir. Toute attente sur une promesse
         qui vient d'une page doit porter sa propre limite. */
      const tout = [...document.images];
      const limite = (pr, ms) => Promise.race([pr, new Promise((r) => setTimeout(r, ms))]);
      await limite(
        Promise.all(tout.map((i) => (i.complete && i.naturalWidth ? null : i.decode().catch(() => null)))),
        12000
      );
      return { total: tout.length, vides: tout.filter((i) => !i.naturalWidth).length };
    });
    await page.waitForTimeout(1200);
    let platitude = null;
    let tuiles = 0;
    if (!ECRAN) {
      const cadre = path.join(SORTIE, `${cle}-cadre.png`);
      await page.screenshot({ path: cadre });
    }

    /* ON NE PHOTOGRAPHIE PLUS EN `fullPage` : ON COUD.  D-633
       Releve a l'image le 2026-07-31 : la capture pleine page d'un
       des quatre sites portait une BANDE BLANCHE de 1 500 px au
       milieu. Cause : ce site epingle une galerie qui defile a
       l'horizontale. `fullPage` etire le document a sa hauteur
       totale et prend une seule image — l'espaceur de la scene
       epinglee est bien la, son contenu est reste en haut, et le
       reste est du vide. Aucune sonde du DOM ne pouvait le voir :
       c'est un defaut de PEINTURE (piege 25).
       On prend donc une image par fenetre, en descendant comme un
       visiteur, et on les coud a leur position REELLE de
       defilement. Une scene epinglee y apparait autant de fois
       qu'elle occupe de fenetres, avec sa progression horizontale
       a chaque fois — c'est exactement ce que le visiteur voit.
       Les elements FIXES sont masques a partir de la deuxieme
       tuile, sinon la barre du site se repeterait a chaque fenetre. */
    if (ECRAN) {
      /* ON DESCEND JUSQU'AU PIED DE PAGE, PLUS JUSQU'A LA HAUTEUR DE
         LA RECONSTITUTION D'EN FACE.  D-643
         D-632 coupait chaque « apres » au rapport de son « avant »,
         pour que les deux cotes finissent a la meme ligne. La regle
         etait juste, la consequence ne l'etait pas : le garage
         montrait 14 % de son site, le restaurant 26 %, le design
         32 %. Le visiteur arrivait au pied du site de 2011 et TOUT
         se bloquait, alors que le site neuf avait encore huit mille
         pixels a montrer. On perdait la seule preuve qui compte.
         Les deux cotes sont maintenant photographies ENTIERS et
         verrouilles en POURCENTAGE dans la page (D-645) : a
         mi-course d'un cote, on est a mi-course de l'autre, et
         personne ne bloque personne. */
      const totalPage = await page.evaluate(() => document.body.scrollHeight);
      const pasTraverse = Math.round(HAUT * 0.6);
      for (let t = 0; t < totalPage; t += pasTraverse) {
        await page.mouse.wheel(0, pasTraverse);
        await page.waitForTimeout(200);
      }
      await allerA(page, 0);
      await page.evaluate(async () => {
        const limite = (pr, ms) => Promise.race([pr, new Promise((r) => setTimeout(r, ms))]);
        await limite(Promise.all([...document.images].map((i) => (i.complete && i.naturalWidth ? null : i.decode().catch(() => null)))), 20000);
      });
      await page.waitForTimeout(1500);
      const docH = await page.evaluate(() => document.body.scrollHeight);

      /* --- LES PERMANENTS, RELEVES A y = 0 ---  D-644
         Un element FIXE au sommet de la page est la barre du site ou
         un voile decoratif : il doit etre masque a partir de la
         deuxieme tuile, sinon il se repete a chaque fenetre.
         Un element qui devient fixe PLUS BAS est tout autre chose :
         c'est une scene EPINGLEE. La version precedente ne faisait
         pas la difference et masquait les deux — d'ou la galerie qui
         disparaissait par endroits et se repetait ailleurs. C'est la
         cause exacte des « images superposees » relevees par le
         proprietaire. */
      const permanents = await page.evaluate(() => {
        const l = [];
        let n = 0;
        for (const el of document.querySelectorAll("body *")) {
          if (getComputedStyle(el).position !== "fixed") continue;
          el.setAttribute("data-permanent", "p" + n++);
          l.push(el.getAttribute("data-permanent"));
        }
        return l;
      });

      /* --- LA DESCENTE : on tuile, et on repere les bandes --- */
      const pasTuile = Math.round(HAUT * 0.8);
      const prises = [];
      const bandes = [];
      let bandeEnCours = null;
      let y = 0;
      let masqueMis = false;

      for (let k = 0; k < 80; k++) {
        const atteintY = await allerA(page, y);
        if (k === 1 && !masqueMis) {
          await page.evaluate(() => {
            for (const el of document.querySelectorAll("[data-permanent]")) el.style.visibility = "hidden";
          });
          masqueMis = true;
          await page.waitForTimeout(400);
        }
        await page.waitForTimeout(600);

        /* Une scene epinglee = un element devenu fixe, qui n'etait
           pas fixe au sommet, et qui couvre une bonne part de la
           fenetre. Les voiles pleine page sont deja dans les
           permanents, donc ecartes. */
        const pin = await page.evaluate(() => {
          for (const el of document.querySelectorAll("body *")) {
            if (el.hasAttribute("data-permanent")) continue;
            if (getComputedStyle(el).position !== "fixed") continue;
            const r = el.getBoundingClientRect();
            if (r.height < window.innerHeight * 0.5 || r.width < window.innerWidth * 0.5) continue;
            if (!el.hasAttribute("data-pin")) el.setAttribute("data-pin", "pin" + Math.round(performance.now()));
            return { id: el.getAttribute("data-pin"), cls: (el.className || "").toString().slice(0, 50) };
          }
          return null;
        });

        if (pin && bandeEnCours && bandeEnCours.id === pin.id) {
          /* On est TOUJOURS dans la meme scene epinglee : on ne pose
             pas de tuile, on note seulement jusqu'ou elle va. */
          bandeEnCours.finY = atteintY;
        } else {
          if (bandeEnCours) { bandes.push(bandeEnCours); bandeEnCours = null; }
          const b64 = (await page.screenshot()).toString("base64");
          const t = { b64, yPage: atteintY, bande: null };
          prises.push(t);
          if (pin) {
            /* Premiere fenetre de la scene : elle occupera UNE
               hauteur de fenetre dans l'image verticale, et sa
               progression sera rendue a part, en sequence. */
            bandeEnCours = { id: pin.id, cls: pin.cls, debutY: atteintY, finY: atteintY, tuile: t };
            t.bande = bandeEnCours;
          }
        }

        if (atteintY + HAUT >= docH - 4) break;
        const suivant = atteintY + pasTuile;
        if (suivant <= y) break;
        y = suivant;
      }
      if (bandeEnCours) bandes.push(bandeEnCours);

      /* --- LES POSITIONS DANS L'IMAGE ---
         Hors bande, une tuile monte du DEFILEMENT REEL entre elle et
         la precedente — jamais du pas demande, qu'un defilement
         pilote depasse (D-633). Une bande, elle, occupe exactement
         une fenetre quelle que soit sa course : c'est la sequence
         qui portera le reste. */
      let yc = 0;
      for (let i = 0; i < prises.length; i++) {
        const t = prises[i];
        if (i > 0) {
          const p0 = prises[i - 1];
          yc += p0.bande ? HAUT : Math.max(0, t.yPage - p0.yPage);
        }
        t.yImage = yc;
        if (t.bande) t.bande.yImage = yc;
      }
      const dernier = prises[prises.length - 1];
      const cibleH = dernier.yImage + HAUT;
      tuiles = prises.length;
      /* Un trou dans la couture arrete l'outil : une image trouee qui
         part en silence coute une passe complete (D-633). */
      for (let i = 1; i < prises.length; i++) {
        const attendu = prises[i - 1].yImage + HAUT;
        if (prises[i].yImage > attendu) {
          throw new Error(`${cle} : TROU de ${prises[i].yImage - attendu} px entre les tuiles ${i - 1} et ${i}.`);
        }
      }

      /* --- LES BANDES, EN DEUX COUCHES CONTINUES ---  D-651
         CE QUE CETTE VERSION REMPLACE, ET POURQUOI.
         D-644 photographiait la scene epinglee IMAGE PAR IMAGE, dix
         vues sur toute sa course. Dix vues sur 2 400 px de
         defilement, c'est un saut tous les 240 px : ce n'est pas un
         mouvement, c'est un diaporama. Sur la section censee prouver
         notre maitrise du mouvement, c'etait le pire endroit
         possible — releve par le proprietaire, et il avait raison.
         Aucun reglage ne rend dix etats fluides.

         CE QUE LA MESURE A DIT, ET QUI TRANCHE.
         `tools/_bande-diag.mjs` sur la scene du design : UN SEUL
         element translate, de 2 146 px, purement a l'horizontale,
         pendant que rien ne bouge verticalement. Sa boite fait
         3 917 px de large. Ce n'est donc pas « plus d'images » qu'il
         faut — c'est UNE BANDE, translatee. Une translation est
         continue par construction : elle n'a pas de pas, donc elle
         ne peut pas sauter, quel que soit le defilement.

         DEUX COUCHES.
           · le FOND — la scene sans sa piste, une seule fenetre ;
           · la PISTE — l'element qui bouge, seul, a sa largeur
             ENTIERE, en une image.
         Le poids tombe de dix fenetres a une fenetre plus une bande.

         Si aucune piste ne se detache — rien qui translate assez —
         on retombe sur la sequence d'images : mieux vaut un
         diaporama qu'une bande fausse. */
      const IMAGES_BANDE = 10;
      for (const b of bandes) {
        /* ON RELEVE LA VRAIE FIN DE LA BANDE, PAS CELLE DU PAS.  D-651
           La descente avance par fenetres de 640 px : la derniere
           tuile ou la scene etait encore epinglee ne dit pas ou elle
           cesse de l'etre, a 640 px pres. Sur le restaurant, la bande
           mesuree faisait 600 px la ou elle en fait 1 260 — et la
           course de la piste, mesuree sur cette bande tronquee,
           tombait sous le seuil de detection. On avance donc par pas
           fins jusqu'a ce que l'element ne soit plus fixe. */
        for (let y = b.finY; y < docH - HAUT; y += 120) {
          await allerA(page, y + 120);
          await page.waitForTimeout(180);
          const encore = await page.evaluate((id) => {
            const el = document.querySelector(`[data-pin="${id}"]`);
            return !!el && getComputedStyle(el).position === "fixed";
          }, b.id);
          if (!encore) break;
          b.finY = await page.evaluate(() => Math.round(window.scrollY));
        }
        const course = Math.max(1, b.finY - b.debutY);
        b.course = course;
        b.images = [];

        /* On releve la piste : l'element dont le `translateX` varie
           le plus entre le debut et la fin de la bande. */
        const marquer = async () => page.evaluate(() => {
          let n = 0;
          const out = [];
          for (const el of document.querySelectorAll("body *")) {
            const cs = getComputedStyle(el);
            if (cs.transform === "none") continue;
            const m = cs.transform.match(/matrix\(([^)]+)\)/);
            if (!m) continue;
            const v = m[1].split(",").map(Number);
            if (!el.dataset.pisteId) el.dataset.pisteId = "p" + n++;
            const r = el.getBoundingClientRect();
            out.push({ id: el.dataset.pisteId, x: v[4], y: v[5], w: Math.round(r.width), h: Math.round(r.height) });
          }
          return out;
        });
        await allerA(page, b.debutY);
        await page.waitForTimeout(500);
        const t0 = await marquer();
        await allerA(page, b.finY);
        await page.waitForTimeout(500);
        const t1 = await marquer();

        let piste = null;
        for (const e of t0) {
          const f = t1.find((x) => x.id === e.id);
          if (!f) continue;
          const dx = Math.abs(f.x - e.x);
          const dy = Math.abs(f.y - e.y);
          /* Une piste de galerie translate BEAUCOUP, a l'horizontale,
             et sa boite est plus large que la fenetre. Un bandeau
             defilant permanent (`marquee`) bouge aussi, mais peu :
             le seuil les separe. */
          /* LE SEUIL SEPARE UNE GALERIE D'UN BANDEAU DEFILANT.  D-651
             Les deux translatent a l'horizontale. Un bandeau
             (`marquee`) avance de 80 a 180 px sur toute la bande, une
             galerie de 700 a 2 400. Le seuil etait a la moitie de la
             largeur de prise de vue — 640 px — et il a REJETE la
             galerie du restaurant, qui en fait 721 sur une bande mal
             bornee. Il descend au quart, ce qui laisse encore un
             facteur trois avec le plus rapide des bandeaux, et la
             largeur de boite superieure a la fenetre acheve de les
             distinguer : un bandeau fait 29 px de haut. */
          if (dx > LARG * 0.25 && dx > dy * 4 && e.w > LARG && e.h > HAUT * 0.25) {
            if (!piste || dx > piste.dx) piste = { id: e.id, dx, xDebut: e.x, xFin: f.x, w: e.w, h: e.h };
          }
        }

        if (!piste) {
          console.log(`   ${cle} : aucune piste continue trouvee dans la bande — on retombe sur ${IMAGES_BANDE} vues`);
          for (let i = 0; i < IMAGES_BANDE; i++) {
            await allerA(page, b.debutY + Math.round((course * i) / (IMAGES_BANDE - 1)));
            await page.waitForTimeout(420);
            b.images.push((await page.screenshot()).toString("base64"));
          }
          continue;
        }

        await allerA(page, b.debutY);
        await page.waitForTimeout(500);

        /* 1 · LE FOND — la scene sans sa piste. */
        await page.evaluate((id) => {
          const el = document.querySelector(`[data-piste-id="${id}"]`);
          el.setAttribute("data-piste-cachee", "");
          el.style.visibility = "hidden";
        }, piste.id);
        await page.waitForTimeout(350);
        b.fond = (await page.screenshot()).toString("base64");

        /* 2 · LA PISTE SEULE, A SA LARGEUR ENTIERE.
           On la remet a `translateX(0)`, on ouvre les rognages de ses
           ancetres, et on masque tout le reste de la page : ce qui
           reste sur l'image est la piste et rien d'autre. */
        const boite = await page.evaluate((id) => {
          const el = document.querySelector(`[data-piste-id="${id}"]`);
          el.style.visibility = "";
          el.removeAttribute("data-piste-cachee");
          /* on ouvre les rognages, on garde de quoi restaurer */
          const rognes = [];
          for (let n = el.parentElement; n && n !== document.documentElement; n = n.parentElement) {
            const cs = getComputedStyle(n);
            if (cs.overflow !== "visible") {
              rognes.push([n, n.style.overflow]);
              n.style.overflow = "visible";
            }
          }
          window.__rognes = rognes;
          /* on masque tout ce qui n'est ni la piste, ni un de ses
             ancetres, ni un de ses descendants */
          const garder = new Set([el]);
          for (let n = el.parentElement; n; n = n.parentElement) garder.add(n);
          const caches = [];
          for (const n of document.querySelectorAll("body *")) {
            if (garder.has(n) || el.contains(n)) continue;
            if (getComputedStyle(n).visibility === "hidden") continue;
            caches.push(n);
            n.style.visibility = "hidden";
          }
          window.__caches = caches;
          const tr = el.style.transform;
          window.__trAvant = tr;
          el.style.transform = "translateX(0px)";
          el.style.animation = "none";
          const r = el.getBoundingClientRect();
          return { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) };
        }, piste.id);
        await page.waitForTimeout(400);
        const el = await page.$(`[data-piste-id="${piste.id}"]`);
        b.piste = {
          image: (await el.screenshot()).toString("base64"),
          /* tout est en px de la fenetre de prise de vue */
          x: boite.x, y: boite.y, w: boite.w, h: boite.h,
          course: Math.round(Math.abs(piste.xFin - piste.xDebut)),
          xDebut: Math.round(piste.xDebut)
        };
        /* on remet la page dans l'etat ou on l'a trouvee */
        await page.evaluate((id) => {
          const el = document.querySelector(`[data-piste-id="${id}"]`);
          el.style.transform = window.__trAvant || "";
          el.style.animation = "";
          for (const n of window.__caches || []) n.style.visibility = "";
          for (const [n, v] of window.__rognes || []) n.style.overflow = v || "";
        }, piste.id);
        await page.waitForTimeout(300);
        console.log(`   ${cle} : piste continue ${b.piste.w}x${b.piste.h}, course ${b.piste.course} px`);
      }

      /* --- LA COMPOSITION --- */
      const p2 = await ctx.newPage();
      await p2.setContent("<html><body></body></html>");
      const cousu = await p2.evaluate(async ({ prises, cibleH, LARG, DENSITE }) => {
        const c = document.createElement("canvas");
        c.width = Math.round(LARG * DENSITE);
        c.height = Math.round(cibleH * DENSITE);
        const x = c.getContext("2d");
        x.fillStyle = "#ffffff";
        x.fillRect(0, 0, c.width, c.height);
        for (const t of prises) {
          const img = new Image();
          img.src = "data:image/png;base64," + t.b64;
          await img.decode();
          x.drawImage(img, 0, Math.round(t.yImage * DENSITE));
        }
        return c.toDataURL("image/png");
      }, { prises, cibleH, LARG, DENSITE });
      const fichier = path.join(SORTIE, `${cle}-ecran.png`);
      fs.writeFileSync(fichier, Buffer.from(cousu.split(",")[1], "base64"));

      /* Une bande CONTINUE sort en deux fichiers — le fond et la
         piste. Une bande qui n'a pas trouve de piste retombe sur sa
         planche de N fenetres, et le manifeste dit laquelle est
         laquelle : le rendu n'a pas a deviner.  D-651 */
      const manifeste = [];
      for (let bi = 0; bi < bandes.length; bi++) {
        const b = bandes[bi];
        if (b.piste) {
          fs.writeFileSync(path.join(SORTIE, `${cle}-bande${bi}-fond.png`), Buffer.from(b.fond, "base64"));
          fs.writeFileSync(path.join(SORTIE, `${cle}-bande${bi}-piste.png`), Buffer.from(b.piste.image, "base64"));
          manifeste.push({
            index: bi, genre: "continue", cls: b.cls, yImage: b.yImage, hauteur: HAUT, coursePage: b.course,
            piste: { x: b.piste.x, y: b.piste.y, w: b.piste.w, h: b.piste.h, course: b.piste.course }
          });
          continue;
        }
        const planche = await p2.evaluate(async ({ imgs, LARG, HAUT, DENSITE }) => {
          const c = document.createElement("canvas");
          c.width = Math.round(LARG * DENSITE);
          c.height = Math.round(HAUT * DENSITE * imgs.length);
          const x = c.getContext("2d");
          for (let i = 0; i < imgs.length; i++) {
            const img = new Image();
            img.src = "data:image/png;base64," + imgs[i];
            await img.decode();
            x.drawImage(img, 0, Math.round(HAUT * DENSITE * i));
          }
          return c.toDataURL("image/png");
        }, { imgs: b.images, LARG, HAUT, DENSITE });
        const fb = path.join(SORTIE, `${cle}-bande${bi}.png`);
        fs.writeFileSync(fb, Buffer.from(planche.split(",")[1], "base64"));
        manifeste.push({ index: bi, genre: "vues", cls: b.cls, yImage: b.yImage, hauteur: HAUT, images: b.images.length, coursePage: b.course });
      }
      fs.writeFileSync(path.join(SORTIE, `${cle}-bandes.json`),
        JSON.stringify({ cle, largeur: LARG, fenetre: HAUT, hauteurImage: cibleH, hauteurPage: docH, bandes: manifeste }, null, 1));

      platitude = await mesurerPlatitude(p2, fichier);
      await p2.close();
      if (platitude.pire.ec < 6) {
        throw new Error(`${cle} : une tranche de la couture est PLATE (ecart-type ${platitude.pire.ec}, moyenne ${platitude.pire.moy}) — ` +
          "une bande n'a pas peint. Reprendre avant de convertir.");
      }
      console.log(`   ${cle} : image ${LARG}x${cibleH}, ${tuiles} tuiles, ${bandes.length} scene(s) epinglee(s)` +
        bandes.map((b) => ` [${b.piste ? "continue" : b.images.length + " vues"} · ${b.course} px]`).join(""));
    }

    /* La pleine page vient ensuite, et sert de piece de comparaison
       avec le projet source — pas a alimenter la page. Elle coute
       cher (30 000 px de haut, plusieurs minutes) : `--sans-plein`
       la saute quand on ne refait qu'un cadrage. Elle ne sert plus a
       alimenter la page depuis D-633 : c'est la couture qui livre. */
    if (!ECRAN && !SANS_PLEIN) {
      const total = await page.evaluate(() => document.body.scrollHeight);
      const pas = Math.round(HAUT * 0.6);
      for (let y = atteint; y < total; y += pas) {
        await page.mouse.wheel(0, pas);
        await page.waitForTimeout(140);
      }
      await allerA(page, 0);
      await page.screenshot({ path: path.join(SORTIE, `${cle}-plein.png`), fullPage: true });
    }
    R.push({
      cle, depart, atteint, tuiles, images: images.total - images.vides + "/" + images.total, hauteurPage: masquage.hauteur, espacesReparés: espaces,
      masques: masquage.faits.filter((f) => f.touches).length + "/" + masquage.faits.length,
      sansEffet: masquage.faits.filter((f) => !f.touches).map((f) => f.motif),
      boitesMasquees: masquage.masquees,
      requetesEchouees: manquantes.length,
      platitude: platitude ? `ec min ${platitude.pire.ec} sur ${platitude.tranches.length} tranches` : "—"
    });
    await nav.close();
  } finally {
    try { process.kill(serveur.pid); } catch (e) {}
    spawn("cmd", ["/c", `for /f "tokens=5" %a in ('netstat -ano ^| findstr :${p.port} ^| findstr LISTENING') do taskkill /F /PID %a`], { shell: true, stdio: "ignore" });
    await new Promise((r) => setTimeout(r, 1500));
  }
}

console.table(R);
for (const r of R) if (r.sansEffet.length) console.log(`${r.cle} — motifs SANS EFFET :`, r.sansEffet.join(" · "));
