/* ============================================================
   LES SUGGESTIONS SE VOIENT — `node tools/suggestions-check.mjs`

   POURQUOI CET OUTIL EXISTE, ET POURQUOI IL PHOTOGRAPHIE.

   Le menu d'un `<datalist>` est dessine par le NAVIGATEUR, pas par
   la page : aucune capture ne peut le montrer, et une sonde du DOM
   ne peut pas dire s'il s'est ouvert. C'est exactement le genre de
   chose dont ce projet refuse de dire « c'est fait ». D-759 pose
   donc un panneau qui vit DANS la page — et cet outil en sort une
   image par champ.

   IL EXIGE UNE IMAGE ET UN COMPTE. Un panneau ouvert mais vide, ou
   ouvert hors de l'ecran, passerait une sonde du DOM sans passer
   celle-ci : on releve le rectangle du panneau, on verifie qu'il
   est SOUS le champ et dans la fenetre, et on compte les lignes.

   Images : `preuves/suggestions/`.
   Sorties : 0 tout tient · 1 defaut · 2 impossible de conclure.
   ============================================================ */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, "..");
const SORTIE = path.join(RACINE, "preuves", "suggestions");
const BASE = process.env.ADEXWEB_BASE || "http://127.0.0.1:8099";

fs.mkdirSync(SORTIE, { recursive: true });

let n = 0, ko = 0;
function dire(nom, obtenu, attendu, note) {
  n++;
  const ok = String(obtenu) === String(attendu);
  if (!ok) ko++;
  console.log("  " + (ok ? "OK   " : "ECHEC") + " " + nom
    + "\n         obtenu  : " + obtenu
    + "\n         attendu : " + attendu
    + (note ? "\n         " + note : ""));
}

/* CHAQUE CAS : la modale a ouvrir, comment atteindre l'etape, le
   champ, ce qu'on tape, et ce qu'on doit voir remonter. */
const CAS = [
  {
    cle: "ville-projet", modale: "modal-project", etapes: 0,
    champ: "#prCity", frappe: "levi",
    attendu: "Lévis",
    dit: "Ville ou région · formulaire « Démarrer un projet »"
  },
  {
    cle: "ville-projet-saint", modale: "modal-project", etapes: 0,
    champ: "#prCity", frappe: "saint", fleches: 2,
    attendu: "Saint-Georges",
    dit: "Ville ou région · plusieurs reponses, la 2e retenue au clavier"
  },
  {
    cle: "domaine-projet", modale: "modal-project", etapes: 1,
    champ: "#prIndustry", frappe: "erie",
    attendu: "Boulangerie et pâtisserie",
    dit: "Votre domaine · c'etait un <select> ferme a huit cases"
  },
  {
    /* UN ECRAN PLUS LOIN DEPUIS D-773 : l'etape 1 ne porte plus que
       le nom de l'entreprise referee. Le domaine est passe a la 2. */
    cle: "domaine-reference", modale: "modal-refer", etapes: 1,
    champ: "#rfIndustry", frappe: "toit",
    attendu: "Toiture",
    dit: "Domaine · formulaire « Référer une entreprise »"
  }
];

const nav = await chromium.launch();
const page = await nav.newPage({ viewport: { width: 1280, height: 900 } });

const erreurs = [];
page.on("console", (m) => { if (m.type() === "error") erreurs.push(m.text()); });
page.on("pageerror", (e) => erreurs.push("pageerror: " + String(e)));

/* LE POPUP CADEAU BLOQUE TOUT OUTIL QUI CLIQUE. Piege 18. */
await page.addInitScript(() => {
  try { sessionStorage.setItem("adexweb-sans-popup", "1"); } catch (e) {}
});

await page.goto(BASE + "/index.html", { waitUntil: "load" });
/* LES SCRIPTS ARRIVENT EN DEUX VAGUES, la seconde au premier geste
   ou a 1,2 s. Une sonde lue avant ne voit pas la vraie page. P-87 */
await page.waitForTimeout(2600);

const palier = await page.getAttribute("html", "data-palier");
console.log("data-palier : " + palier);

/* LES LISTES SONT-ELLES LOCALES ? On regarde ce qui a ete demande
   au reseau, pas ce qu'on croit avoir ecrit. */
const tiers = [];
/* LE SERVICE DES FORMULAIRES N'EST PAS UN TIERS. C'est notre propre
   Apps Script, appele pour ENVOYER une demande — la porte des
   creneaux le contacte des l'ouverture de la modale de reservation.
   L'interdit vise ce qui SUIT le visiteur : reseau de diffusion,
   traceur, temoin, police distante. Ne pas l'ecrire ici rendrait
   « 1 requete tierce » a chaque passage, et l'outil finirait par
   etre ignore — ce qui coute plus cher qu'un outil absent. */
const NOTRE_SERVICE = "https://script.google.com/macros/s/";
page.on("request", (r) => {
  const u = r.url();
  if (u.startsWith(BASE) || u.startsWith("data:") || u.startsWith("blob:")) return;
  if (u.startsWith(NOTRE_SERVICE) || u.startsWith("https://script.googleusercontent.com/")) return;
  tiers.push(u);
});

console.log("");
console.log("--- CE QUE LE JAVASCRIPT A REPRIS");
{
  const etat = await page.evaluate(() => {
    const ids = ["prCity", "prIndustry", "rfIndustry"];
    return ids.map((id) => {
      const el = document.getElementById(id);
      if (!el) return { id, absent: true };
      return {
        id,
        balise: el.tagName.toLowerCase(),
        listeRestante: el.getAttribute("list"),
        role: el.getAttribute("role"),
        panneau: !!el.parentNode.querySelector(".sug")
      };
    });
  });
  for (const e of etat) {
    dire(e.id + " est un champ de texte (donc hors liste accepte)", e.balise, "input");
    dire(e.id + " a rendu `list` (plus de menu du navigateur par-dessus)",
      e.listeRestante, null);
    dire(e.id + " annonce une liste au lecteur d'ecran", e.role, "combobox");
    dire(e.id + " porte son panneau", e.panneau, true);
  }

  const tailles = await page.evaluate(() => ({
    villes: document.querySelectorAll("#l-villes option").length,
    domaines: document.querySelectorAll("#l-domaines option").length
  }));
  dire("la liste des villes est garnie", tailles.villes > 100, true, tailles.villes + " entrées");
  dire("la liste des domaines est garnie", tailles.domaines > 50, true, tailles.domaines + " entrées");
}

console.log("");
console.log("--- LES PANNEAUX, UN PAR CHAMP");

for (const c of CAS) {
  console.log("");
  console.log("  · " + c.dit);

  /* On repart de la page nue a chaque cas : une modale laissee
     ouverte fausse la suivante. */
  await page.evaluate(() => {
    document.querySelectorAll(".modal").forEach((m) => { m.hidden = true; });
    document.documentElement.classList.remove("is-locked");
    document.body.classList.remove("is-locked");
  });
  await page.evaluate((id) => {
    const b = document.querySelector('[data-modal-open="' + id + '"]');
    if (b) b.click();
  }, c.modale);
  await page.waitForTimeout(500);

  /* Avancer d'etape en cliquant le bouton « suivant » de l'etape
     visible — sans connaitre son identifiant, qui change par
     formulaire. */
  for (let i = 0; i < c.etapes; i++) {
    await page.evaluate((sel) => {
      const modale = document.querySelector(sel);
      const etape = [...modale.querySelectorAll(".step")].find((s) => !s.hidden);
      if (!etape) return;
      etape.querySelectorAll("input[required], select[required]").forEach((el) => {
        if (String(el.value).trim() !== "") return;
        if (el.tagName === "SELECT") { el.selectedIndex = 1; }
        else if (el.type === "email") { el.value = "zztest@exemple.ca"; }
        else if (el.type === "tel") { el.value = "418 555 0142"; }
        else { el.value = "ZZTEST"; }
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
      });
      const suivant = [...modale.querySelectorAll("button")]
        .find((b) => /suivant|continuer/i.test(b.textContent) && b.offsetParent !== null);
      if (suivant) suivant.click();
    }, "#" + c.modale);
    await page.waitForTimeout(450);
  }

  const champ = await page.$(c.champ);
  if (!champ) { console.error("    ARRET · champ " + c.champ + " introuvable"); process.exit(2); }

  /* ON VIDE PAR LE DOM, PAS PAR `fill`. Le panneau ouvert recouvre
     parfois le champ : Playwright attend alors qu'il soit
     « visible et editable » et finit par lever, sur un champ qui va
     tres bien. Le DOM ne se laisse pas recouvrir. */
  await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    el.value = ""; el.focus();
  }, c.champ);
  await page.keyboard.type(c.frappe, { delay: 45 });
  await page.waitForTimeout(300);

  const vu = await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    const p = el.parentNode.querySelector(".sug");
    if (!p || p.hidden) return { ouvert: false };
    const rp = p.getBoundingClientRect();
    const rc = el.getBoundingClientRect();
    const opts = [...p.querySelectorAll(".sug-o")];
    const cs = getComputedStyle(p);
    return {
      ouvert: true,
      lignes: opts.length,
      textes: opts.map((o) => o.textContent),
      hauteurMin: Math.min(...opts.map((o) => Math.round(o.getBoundingClientRect().height))),
      sousLeChamp: Math.round(rp.top) >= Math.round(rc.bottom) - 2,
      dansLaFenetre: rp.top >= 0 && rp.left >= 0 && rp.right <= innerWidth,
      rayon: cs.borderRadius,
      ombre: cs.boxShadow,
      surligne: !!p.querySelector(".sug-o b")
    };
  }, c.champ);

  dire("le panneau est ouvert", vu.ouvert, true);
  if (!vu.ouvert) { continue; }
  dire("il propose des lignes", vu.lignes > 0, true, vu.lignes + " : " + vu.textes.join(" · "));
  dire("« " + c.attendu + " » y est",
    vu.textes.some((t) => t.replace(/\s+/g, " ").trim() === c.attendu), true);
  dire("chaque ligne fait au moins 44 px (le pouce)", vu.hauteurMin >= 44, true,
    vu.hauteurMin + " px");
  dire("il s'ouvre SOUS le champ", vu.sousLeChamp, true);
  dire("il tient dans la fenetre", vu.dansLaFenetre, true);
  dire("rayon 0", vu.rayon, "0px");
  dire("aucune ombre portee", vu.ombre, "none");
  dire("ce qui a ete tape est surligne", vu.surligne, true);

  /* LA REPONSE HORS LISTE RESTE POSSIBLE — c'est la contrainte qui
     a fait rejeter le `<select>`, elle se prouve ici. */
  const hors = await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    el.value = "Fabrication de girouettes";
    el.dispatchEvent(new Event("input", { bubbles: true }));
    return el.value;
  }, c.champ);
  dire("une reponse hors liste tient dans le champ", hors, "Fabrication de girouettes");

  /* Et on la retire pour photographier le panneau ouvert. */
  await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    el.value = ""; el.focus();
  }, c.champ);
  await page.keyboard.type(c.frappe, { delay: 45 });
  await page.waitForTimeout(300);

  /* LE CRAN NE SE PROUVE QU'EN ETAT ACTIF. Sans flechage, aucune
     ligne n'est retenue au chargement — c'est voulu, mais ca ne
     montre pas le filet de minium. V4. */
  for (let i = 0; i < (c.fleches || 0); i++) {
    await page.keyboard.press("ArrowDown");
    await page.waitForTimeout(120);
  }
  if (c.fleches) {
    const cran = await page.evaluate((sel) => {
      const p = document.querySelector(sel).parentNode.querySelector(".sug");
      const on = p.querySelector(".sug-o.is-on");
      if (!on) return { aucune: true };
      const cs = getComputedStyle(on);
      return { texte: on.textContent, ombre: cs.boxShadow, fond: cs.backgroundColor,
        duree: cs.transitionDuration, fonction: cs.transitionTimingFunction };
    }, c.champ);
    dire("la " + c.fleches + "e ligne est retenue au clavier",
      String(cran.texte || "").replace(/\s+/g, " ").trim(), c.attendu);
    dire("elle porte le filet de minium a gauche",
      /rgb\(200, 55, 27\)/.test(String(cran.ombre)), true, cran.ombre);
    dire("elle roule d'un cran, elle ne fond pas (V4)",
      /steps/.test(String(cran.fonction)), true, cran.fonction);
  }

  const boite = await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    const p = el.parentNode.querySelector(".sug");
    const a = el.getBoundingClientRect(), b = p.getBoundingClientRect();
    const x = Math.max(0, Math.min(a.left, b.left) - 24);
    const y = Math.max(0, a.top - 48);
    return { x: Math.round(x), y: Math.round(y),
      width: Math.round(Math.max(a.right, b.right) - x + 24),
      height: Math.round(b.bottom - y + 16) };
  }, c.champ);

  const fichier = path.join(SORTIE, c.cle + ".png");
  await page.screenshot({ path: fichier, clip: boite });
  console.log("         image   : preuves/suggestions/" + c.cle + ".png");
}

console.log("");
console.log("--- LE RESTE");
dire("aucune requete tierce", tiers.length, 0, tiers.join(" "));
dire("aucune erreur de console", erreurs.length, 0, erreurs.slice(0, 3).join(" | "));

await nav.close();

console.log("");
console.log("============================================================");
console.log(ko ? ("LES SUGGESTIONS NE TIENNENT PAS : " + ko + " echec(s) sur " + n)
              : ("LES SUGGESTIONS TIENNENT : " + n + " / " + n));
console.log("============================================================");
process.exit(ko ? 1 : 0);
