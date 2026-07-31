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

const ICI = path.dirname(fileURLToPath(import.meta.url));
const SORTIE = path.join(ICI, "_demos");
fs.mkdirSync(SORTIE, { recursive: true });

const LARG = 760;
const HAUT = 1425;

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
    /* CE SITE-LA NE SE DEFILE PAS AVANT SA PHOTO.  D-620
       Il rend son heros parfaitement au chargement, et NOIR PLEIN
       des qu'on l'a fait defiler d'un pixel — quatre passes a
       chercher ailleurs (le port, le lissage, le masquage, la
       densite) avant de mesurer ca. Son heros tient de toute facon
       dans la premiere fenetre : le nom en pleine masse arrive a
       1 080 px sur 1 425. On le photographie donc SANS BOUGER, et
       la boucle interne de la comparaison va chercher le reste. */
    depart: 0,
    fixe: true,
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
    const ctx = await nav.newContext({ viewport: { width: LARG, height: HAUT }, deviceScaleFactor: 2 });
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
    const cadre = path.join(SORTIE, `${cle}-cadre.png`);
    await page.screenshot({ path: cadre });

    /* La pleine page vient ensuite, et sert de piece de comparaison
       avec le projet source — pas a alimenter la page. Elle coute
       cher (30 000 px de haut, plusieurs minutes) : `--sans-plein`
       la saute quand on ne refait qu'un cadrage. */
    if (!SANS_PLEIN) {
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
      cle, depart, atteint, images: images.total - images.vides + "/" + images.total, departEcrit: p.depart, hauteurPage: masquage.hauteur, espacesReparés: espaces,
      masques: masquage.faits.filter((f) => f.touches).length + "/" + masquage.faits.length,
      sansEffet: masquage.faits.filter((f) => !f.touches).map((f) => f.motif),
      boitesMasquees: masquage.masquees,
      requetesEchouees: manquantes.length
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
