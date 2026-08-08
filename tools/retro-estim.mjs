/* LA GRILLE DE PRIX : SA CALIBRATION, ET TROIS ATTAQUES.  D-774
   ============================================================

   Il lit le VRAI `google/Code.gs` par `faux-google.mjs`. Aucune
   copie de la grille ne vit ici — une copie divergerait, et le jour
   ou elle divergerait cet outil rendrait « ok » sur une grille
   fausse.

   CE QU'IL VERIFIE, EN NEUF PASSES :

     0 · AUTO-CONTROLE. Une grille volontairement plate doit le
         faire crier. Un outil qui ne sait pas echouer ne prouve
         rien — trois sondes de ce depot rendaient « 0 » sans
         erreur avant qu'on les regarde.
     1 · CALIBRATION. Les quatre vrais projets d'ADEXWEB tombent DANS
         leur fourchette, et dans sa MOITIE BASSE.
     2 · LES ANCRAGES du brief du 2026-08-07.
     3 · MONOTONIE. Ajouter une fonction ne fait JAMAIS baisser le
         total. L'economie de lot pourrait l'inverser ; elle ne le
         fait pas, et il faut que ca reste vrai.
     4 · COMPRESSION. Combien de projets differents rendent le meme
         ecran.
     5 · UNE OPTION A LA FOIS — l'attaque nommee au brief.
     6 · LE SOLVEUR par moindres carres, a N sondages.
     7 · LES DEUX PORTES ne se contredisent jamais de plus d'un
         cran pour des reponses equivalentes.
     8 · LES LIBELLES d'`index.html` sont EXACTEMENT ceux de la
         grille, dans les deux sens. Un accent de travers rendrait
         une fourchette calculee sur une reponse perdue.

   Ce que cet outil NE prouve pas : rien de ce qu'il mesure ne dit
   ce qu'un vrai concurrent ferait. Il mesure une borne, pas un
   comportement. */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { gs } from "./faux-google.mjs";

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ECHELLE = gs.ESTIM_ECHELLE;
const GRILLE = gs.ESTIM_GRILLE;
const ECHEANCE = gs.ESTIM_ECHEANCE;
const TAILLE = gs.ESTIM_TAILLE;

let defauts = 0;
const dit = (ok, texte, detail) => {
  if (!ok) defauts++;
  console.log((ok ? "  OK    " : "  DEFAUT") + " " + texte + (detail ? "\n           " + detail : ""));
};
const ARRET = (m) => { console.error("\nARRET : " + m); process.exit(2); };
const sous = (t) => console.log("\n--- " + t);

/* Le nombre tel que le visiteur le lit, pour comparer aux libelles. */
const ecrire = (n) => n.toLocaleString("fr-CA").replace(/ /g, " ");

/* ============================================================
   L'ENUMERATION — le produit cartesien complet d'un type
   ============================================================ */
function toutes(cle) {
  const g = GRILLE[cle];
  const A = Object.keys(g.ampleur), V = Object.keys(g.visuel);
  const P = Object.keys(g.facteur.valeurs), F = Object.keys(g.fonctions);
  const E = Object.keys(ECHEANCE), T = Object.keys(TAILLE);
  const out = [];
  for (const a of A) for (const v of V) for (const p of P) for (const e of E) for (const t of T)
    for (let m = 0; m < (1 << F.length); m++) {
      const r = { ampleur: a, visuel: v, echeancier: e, taille_equipe: t,
                  fonctions: F.filter((_, i) => m & (1 << i)).join(", ") };
      r[g.facteur.champ] = p;
      out.push(r);
    }
  if (!out.length) ARRET("le produit cartesien de « " + cle + " » est vide");
  return out;
}

/* Le cran affiche, par la VRAIE fonction du serveur. */
function cranDe(cle, r) {
  const f = gs.estimFourchette(cle, r);
  if (!f) ARRET("le serveur refuse une combinaison pourtant legitime : "
    + cle + " " + JSON.stringify(r));
  if (f.horsEchelle) return ECHELLE.length - 1;
  return ECHELLE.indexOf(f.bas);
}

console.log("============================================================");
console.log("LA GRILLE DE PRIX — calibration et attaques");
console.log("============================================================");
console.log("echelle : " + ECHELLE.map(ecrire).join(" · "));
console.log("rapports : " + ECHELLE.slice(1).map((n, i) => (n / ECHELLE[i]).toFixed(2)).join(" "));
console.log("lot : " + gs.ESTIM_LOT.join(" "));

/* ============================================================
   0 · AUTO-CONTROLE
   ============================================================ */
sous("0 · AUTO-CONTROLE — une grille plate doit faire crier l'outil");
{
  /* Une echelle a un seul cran ne compresse rien et rend toute
     bascule d'option INVISIBLE ; une echelle a pas de 1 $ rend
     chaque bascule PARFAITEMENT lisible. C'est le second cas qu'on
     simule : c'est la panne qui compte. */
  const fine = [];
  for (let n = 2000; n <= 45000; n += 100) fine.push(n);
  const cranFin = (n) => {
    let b = 0, d = Infinity;
    for (let i = 0; i < fine.length; i++) {
      const e = Math.abs(fine[i] - n);
      if (e < d) { d = e; b = i; }
    }
    return b;
  };
  const g = GRILLE.boutique;
  const base = { ampleur: "Moins de 25 produits", visuel: "Propre et rapide",
                 contenu: "Mes textes et mes photos sont prêts",
                 echeancier: "Dans 1 à 3 mois", taille_equipe: "1 à 5 personnes",
                 fonctions: "" };
  const avec = Object.assign({}, base, { fonctions: "Le paiement en ligne" });
  const t0 = gs.estimTotal("boutique", base), t1 = gs.estimTotal("boutique", avec);
  const ecartFin = cranFin(t1) - cranFin(t0);
  const ecartVrai = cranDe("boutique", avec) - cranDe("boutique", base);
  dit(ecartFin === 25 && ecartVrai <= 1,
    "sur une echelle au pas de 100 $, la bascule se lit (" + ecartFin
    + " crans) ; sur la vraie, non (" + ecartVrai + ")",
    "l'outil sait donc distinguer une grille lisible d'une grille brouillee");
  if (ecartFin !== 25) ARRET("l'auto-controle ne detecte plus une grille lisible — il ne prouve plus rien");
  dit(g.fonctions["Le paiement en ligne"] > 0, "le module temoin existe encore dans la grille");
}

/* ============================================================
   1 · CALIBRATION — les quatre vrais projets
   ============================================================ */
const REELS = [
  { nom: "Déneigement, formulaire et carte", valeur: 6000, data: {
      type_de_projet: "Un site pour présenter mon entreprise",
      ampleur: "6 à 15 pages",
      fonctions: "Un formulaire de contact, Une carte du secteur desservi",
      niveau_design: "Marqué, avec des animations",
      contenu: "J’en ai une partie",
      echeancier: "Dans 1 à 3 mois", taille_equipe: "1 à 5 personnes" } },
  { nom: "Pneus, sans paiement ni livraison", valeur: 8000, data: {
      type_de_projet: "Une boutique en ligne",
      ampleur: "Moins de 25 produits", fonctions: "Rien de tout ça",
      niveau_design: "Propre et rapide",
      contenu: "Mes textes et mes photos sont prêts",
      echeancier: "Dans 1 à 3 mois", taille_equipe: "1 à 5 personnes" } },
  { nom: "Pneus, tout le paquet", valeur: 20000, data: {
      type_de_projet: "Une boutique en ligne", ampleur: "25 à 250 produits",
      fonctions: "Le paiement en ligne, Le calcul de la livraison, "
        + "Un panneau pour gérer mes produits, Des comptes clients, "
        + "Des rabais et des codes promo",
      niveau_design: "Propre et rapide",
      contenu: "Mes textes et mes photos sont prêts",
      echeancier: "Dans 1 à 3 mois", taille_equipe: "1 à 5 personnes" } },
  { nom: "Rampes et balcons, 2D et 3D", valeur: 18000, data: {
      type_de_projet: "Un outil de soumission ou de calcul",
      ampleur: "Un rendu en 3D",
      fonctions: "Il s’installe dans mon site, Il envoie la soumission par courriel",
      niveau_design: "Propre et rapide",
      complexite: "Beaucoup de règles et de contraintes",
      echeancier: "Dans 1 à 3 mois", taille_equipe: "1 à 5 personnes" } }
];

sous("1 · CALIBRATION — la valeur reelle tombe dans la fourchette, moitie basse");
console.log("           (Ames & Mason, JPSP 2015 : le plancher doit ETRE la cible)");
for (const c of REELS) {
  const f = gs.estimerPour("estimate", c.data);
  if (!f || !f.bas) { dit(false, c.nom + " : le serveur ne rend pas de fourchette"); continue; }
  const pos = (c.valeur - f.bas) / (f.haut - f.bas);
  dit(c.valeur >= f.bas && c.valeur <= f.haut && pos <= 0.5,
    c.nom.padEnd(34) + f.texte + "  reel " + ecrire(c.valeur) + " $ a " + Math.round(pos * 100) + " %");
}

/* ============================================================
   2 · LES ANCRAGES DU BRIEF
   ============================================================ */
const ANCRAGES = [
  ["Vitrine 3 pages — 2 500 min", 2500, 2500, {
    type_de_projet: "Un site pour présenter mon entreprise", ampleur: "1 à 5 pages",
    fonctions: "", niveau_design: "Propre et rapide",
    contenu: "Mes textes et mes photos sont prêts",
    echeancier: "Dans 1 à 3 mois", taille_equipe: "1 à 5 personnes" }],
  ["Vitrine complète — 3 000 à 4 000", 3000, 4000, {
    type_de_projet: "Un site pour présenter mon entreprise", ampleur: "1 à 5 pages",
    fonctions: "Un formulaire de contact", niveau_design: "Marqué, avec des animations",
    contenu: "Mes textes et mes photos sont prêts",
    echeancier: "Dans 1 à 3 mois", taille_equipe: "1 à 5 personnes" }],
  ["Outil simple — autour de 6 000", 5500, 6500, {
    type_de_projet: "Un outil de soumission ou de calcul", ampleur: "Un prix",
    fonctions: "", niveau_design: "Propre et rapide", complexite: "Quelques options",
    echeancier: "Dans 1 à 3 mois", taille_equipe: "1 à 5 personnes" }],
  ["Outil avec plan 2D — 8 000 à 12 000", 8000, 12000, {
    type_de_projet: "Un outil de soumission ou de calcul", ampleur: "Un prix et un plan en 2D",
    fonctions: "", niveau_design: "Propre et rapide", complexite: "Quelques options",
    echeancier: "Dans 1 à 3 mois", taille_equipe: "1 à 5 personnes" }],
  ["Outil avec rendu 3D — 8 000 à 12 000", 8000, 12000, {
    type_de_projet: "Un outil de soumission ou de calcul", ampleur: "Un rendu en 3D",
    fonctions: "", niveau_design: "Propre et rapide", complexite: "Quelques options",
    echeancier: "Dans 1 à 3 mois", taille_equipe: "1 à 5 personnes" }],
  ["Boutique simple — dès 8 000", 8000, 8000, {
    type_de_projet: "Une boutique en ligne", ampleur: "Moins de 25 produits",
    fonctions: "", niveau_design: "Propre et rapide",
    contenu: "Mes textes et mes photos sont prêts",
    echeancier: "Dans 1 à 3 mois", taille_equipe: "1 à 5 personnes" }],
  ["Logiciel avec base — au-dessus de 10 000", 10000, 11000, {
    type_de_projet: "Un logiciel ou une application sur mesure", ampleur: "Moins de 5 écrans",
    fonctions: "", niveau_design: "Propre et rapide", usagers: "Mon équipe",
    echeancier: "Dans 1 à 3 mois", taille_equipe: "1 à 5 personnes" }]
];

sous("2 · LES ANCRAGES — la bande annoncee par William chevauche la fourchette");
for (const [nom, bas, haut, data] of ANCRAGES) {
  const f = gs.estimerPour("estimate", data);
  if (!f || !f.bas) { dit(false, nom + " : pas de fourchette"); continue; }
  dit(f.haut >= bas && f.bas <= haut, nom.padEnd(42) + f.texte);
}

/* ============================================================
   3 · MONOTONIE
   ============================================================ */
sous("3 · MONOTONIE — ajouter une fonction ne fait jamais baisser le total");
{
  let pires = [];
  for (const cle of Object.keys(GRILLE)) {
    const F = Object.keys(GRILLE[cle].fonctions);
    for (const r of toutes(cle)) {
      const dedans = r.fonctions ? r.fonctions.split(", ") : [];
      for (const f of F) {
        if (dedans.indexOf(f) !== -1) continue;
        const avant = gs.estimTotal(cle, r);
        const apres = gs.estimTotal(cle, Object.assign({}, r,
          { fonctions: dedans.concat([f]).join(", ") }));
        if (apres < avant - 0.5) pires.push(cle + " / " + f + " : " + avant + " -> " + apres);
      }
    }
  }
  dit(pires.length === 0, "aucune fonction ajoutee ne fait baisser le total",
    pires.length ? pires.slice(0, 3).join(" | ") : "verifie sur toutes les combinaisons des quatre types");
}

/* ============================================================
   4 · COMPRESSION
   ============================================================ */
sous("4 · COMPRESSION — combien de projets differents rendent le meme ecran");
const CACHE = {};
for (const cle of Object.keys(GRILLE)) {
  const combos = toutes(cle);
  CACHE[cle] = combos;
  const vus = new Set(combos.map((r) => cranDe(cle, r)));
  const ratio = combos.length / vus.size;
  dit(ratio >= 100, cle.padEnd(11) + String(combos.length).padStart(6)
    + " combinaisons -> " + String(vus.size).padStart(2) + " fourchettes  ("
    + Math.round(ratio) + " projets par fourchette)");
}

/* ============================================================
   5 · UNE OPTION A LA FOIS — l'attaque du brief
   ============================================================ */
sous("5 · UNE OPTION A LA FOIS — je bascule une fonction, je lis l'ecart");
console.log("           lisible = le meme ecart non nul dans 80 % des contextes");
for (const cle of Object.keys(GRILLE)) {
  const g = GRILLE[cle];
  for (const f of Object.keys(g.fonctions)) {
    const ecarts = new Map();
    let n = 0;
    for (const r of CACHE[cle]) {
      const dedans = r.fonctions ? r.fonctions.split(", ") : [];
      if (dedans.indexOf(f) !== -1) continue;
      const d = cranDe(cle, Object.assign({}, r,
        { fonctions: dedans.concat([f]).join(", ") })) - cranDe(cle, r);
      ecarts.set(d, (ecarts.get(d) || 0) + 1);
      n++;
    }
    const tri = [...ecarts.entries()].sort((a, b) => b[1] - a[1]);
    const part = tri[0][1] / n;
    dit(!(part >= 0.80 && tri[0][0] !== 0),
      (cle + " · " + f).padEnd(56) + tri.slice(0, 3)
        .map(([d, c]) => d + " cran (" + Math.round(100 * c / n) + " %)").join("  "));
  }
}

/* ============================================================
   6 · LE SOLVEUR
   ============================================================ */
sous("6 · LE SOLVEUR — moindres carres sur N sondages");
console.log("           chaque sondage coute une ligne au classeur, avec des coordonnees");
let graine = 20260807;
const suivant = () => { graine = (graine * 1103515245 + 12345) & 0x7fffffff; return graine / 0x7fffffff; };

function resoudre(cle, N) {
  const g = GRILLE[cle];
  const F = Object.keys(g.fonctions), A = Object.keys(g.ampleur);
  const V = Object.keys(g.visuel), P = Object.keys(g.facteur.valeurs);
  const cols = ["1"].concat(A.slice(1).map((x) => "A|" + x), F.map((x) => "F|" + x),
                V.slice(1).map((x) => "V|" + x), P.slice(1).map((x) => "P|" + x));
  /* Le concurrent tient les deux pourcentages constants — c'est ce
     qu'un attaquant serieux fait. On ne se donne pas le beau role. */
  const pool = CACHE[cle].filter((r) => r.echeancier === "Dans 1 à 3 mois"
    && r.taille_equipe === "1 à 5 personnes");
  const m = cols.length, X = [], y = [];
  for (let k = 0; k < N; k++) {
    const r = pool[Math.floor(suivant() * pool.length)];
    const dedans = r.fonctions ? r.fonctions.split(", ") : [];
    X.push(cols.map((c) => {
      if (c === "1") return 1;
      const q = c.slice(0, 1), v = c.slice(2);
      if (q === "A") return r.ampleur === v ? 1 : 0;
      if (q === "F") return dedans.indexOf(v) !== -1 ? 1 : 0;
      if (q === "V") return r.visuel === v ? 1 : 0;
      return r[g.facteur.champ] === v ? 1 : 0;
    }));
    y.push(ECHELLE[cranDe(cle, r)]);
  }
  const M = Array.from({ length: m }, (_, i) => Array.from({ length: m + 1 }, (_, j) =>
    j === m ? X.reduce((s, r, k) => s + r[i] * y[k], 0)
            : X.reduce((s, r) => s + r[i] * r[j], 0) + (i === j ? 1e-6 : 0)));
  for (let i = 0; i < m; i++) {
    let p = i;
    for (let k = i + 1; k < m; k++) if (Math.abs(M[k][i]) > Math.abs(M[p][i])) p = k;
    if (Math.abs(M[p][i]) < 1e-9) return null;
    [M[i], M[p]] = [M[p], M[i]];
    for (let k = 0; k < m; k++) {
      if (k === i) continue;
      const fct = M[k][i] / M[i][i];
      for (let j = i; j <= m; j++) M[k][j] -= fct * M[i][j];
    }
  }
  const b = M.map((r, i) => r[m] / M[i][i]);
  const dec = A.length;   /* 1 constante + (A.length - 1) colonnes d'ampleur */
  let rel = 0;
  F.forEach((f, i) => { rel += Math.abs(b[dec + i] - g.fonctions[f]) / g.fonctions[f]; });
  return rel / F.length;
}

/* TROIS TIRAGES PAR TAILLE, ET C'EST LA MOYENNE QUI JUGE. Un tirage
   unique donne au concurrent le benefice du hasard : la premiere
   version voyait « 8 % » sur un echantillon chanceux et « 21 % » sur
   le suivant, plus grand. Un verdict qui bascule sur un coup de des
   ne dit rien de la grille. */
for (const cle of Object.keys(GRILLE)) {
  const lignes = [];
  let retrouvee = false;
  for (const N of [10, 30, 100, 400, 2000]) {
    const tirages = [];
    for (let k = 0; k < 3; k++) {
      const rel = resoudre(cle, N);
      if (rel !== null) tirages.push(rel);
    }
    if (!tirages.length) { lignes.push("N=" + N + " insoluble"); continue; }
    const moy = tirages.reduce((s, x) => s + x, 0) / tirages.length;
    if (moy < 0.15) retrouvee = true;
    lignes.push("N=" + N + " → " + Math.round(moy * 100) + " %");
  }
  dit(!retrouvee, cle.padEnd(11) + "erreur du solveur sur les modules : " + lignes.join("  "),
    retrouvee ? "un concurrent retrouve la grille — l'economie de lot ne mord plus" : "");
}

/* ============================================================
   7 · LES DEUX PORTES
   ============================================================ */
sous("7 · LES DEUX PORTES — l'estimateur et l'assistant ne se contredisent pas");
{
  const paires = [
    ["vitrine simple",
      { besoins: "Site vitrine", ampleur: "1 à 5 — l’essentiel",
        niveau_design: "Essentiel — propre, rapide, efficace",
        contenu: "Prêts — j’ai tout sous la main", fonctions: "Aucune — un site qui présente",
        echeancier: "D’ici 1 à 2 mois", nombre_employes: "2 à 10" },
      { type_de_projet: "Un site pour présenter mon entreprise", ampleur: "1 à 5 pages",
        fonctions: "", niveau_design: "Propre et rapide",
        contenu: "Mes textes et mes photos sont prêts",
        echeancier: "Dans 1 à 3 mois", taille_equipe: "1 à 5 personnes" }],
    ["boutique moyenne",
      { besoins: "Boutique en ligne", ampleur: "6 à 15 — un vrai site",
        niveau_design: "Premium — identité forte, animations",
        contenu: "En partie — il manque des bouts",
        fonctions: "Une ou deux — réservation, paiement, formulaire",
        echeancier: "D’ici 1 à 2 mois", nombre_employes: "2 à 10" },
      { type_de_projet: "Une boutique en ligne", ampleur: "25 à 250 produits",
        fonctions: "Le paiement en ligne, Le calcul de la livraison",
        niveau_design: "Marqué, avec des animations", contenu: "J’en ai une partie",
        echeancier: "Dans 1 à 3 mois", taille_equipe: "1 à 5 personnes" }],
    ["logiciel ambitieux",
      { besoins: "Application ou logiciel", ampleur: "Plus de 15 — une plateforme",
        niveau_design: "Essentiel — propre, rapide, efficace",
        contenu: "Prêts — j’ai tout sous la main",
        fonctions: "Plusieurs — comptes, tableau de bord, connexions",
        echeancier: "Pas pressé, j’explore", nombre_employes: "11 à 50" },
      { type_de_projet: "Un logiciel ou une application sur mesure",
        ampleur: "Plus de 15 écrans",
        fonctions: "Des comptes et des permissions, Des rapports et un tableau de bord, Des paiements",
        niveau_design: "Propre et rapide", usagers: "Mon équipe",
        echeancier: "Pas de date fixe", taille_equipe: "6 à 25 personnes" }]
  ];
  for (const [nom, dProjet, dEstim] of paires) {
    const a = gs.estimerPour("project", dProjet);
    const b = gs.estimerPour("estimate", dEstim);
    if (!a || !a.bas || !b || !b.bas) { dit(false, nom + " : une des deux portes se tait"); continue; }
    const ecart = Math.abs(ECHELLE.indexOf(a.bas) - ECHELLE.indexOf(b.bas));
    dit(ecart <= 1, nom.padEnd(20) + "assistant " + a.texte + "  ·  estimateur " + b.texte
      + "  (" + ecart + " cran d'ecart)");
  }
}

/* ============================================================
   8 · LES LIBELLES — index.html contre la grille, dans les deux sens
   ============================================================ */
sous("8 · LES LIBELLES — ce que le site envoie est ce que la grille attend");
{
  const html = fs.readFileSync(path.join(RACINE, "index.html"), "utf8");
  const modale = html.split('id="modal-estimate"')[1];
  if (!modale) ARRET("la modale #modal-estimate est introuvable dans index.html");
  const bloc = modale.split("</div>\n</div>")[0];

  /* Tout ce que l'estimateur peut envoyer comme reponse fermee. */
  /* LES REPONSES A LA QUESTION DU PRIX NE SONT PAS DES REPONSES DE
     GRILLE. « C’est au-dessus de mon budget » se range dans la
     colonne « Pourquoi pas » ; la grille n'a pas a la connaitre. On
     retire donc les groupes de choix qui portent un `data-choice`. */
  const sansChoix = bloc.replace(/<div class="choices[\s\S]*?<\/div>/g, "");
  const envoyes = new Set();
  const re = /data-value="([^"]+)"/g;
  let m;
  while ((m = re.exec(sansChoix))) envoyes.add(m[1]);
  const reC = /<input[^>]*type="checkbox"[^>]*value="([^"]+)"/g;
  while ((m = reC.exec(sansChoix))) envoyes.add(m[1]);
  if (envoyes.size === 0) ARRET("aucune reponse fermee trouvee dans #modal-estimate — la sonde regarde a cote");

  /* Tout ce que la grille sait lire. */
  const connus = new Set(["Rien de tout ça", "Oui", "Non"]);
  Object.keys(gs.ESTIM_TYPES).forEach((x) => connus.add(x));
  Object.keys(gs.ESTIM_SANS_PRIX).forEach((x) => connus.add(x));
  Object.keys(ECHEANCE).forEach((x) => connus.add(x));
  Object.keys(TAILLE).forEach((x) => connus.add(x));
  for (const cle of Object.keys(GRILLE)) {
    const g = GRILLE[cle];
    Object.keys(g.ampleur).forEach((x) => connus.add(x));
    Object.keys(g.fonctions).forEach((x) => connus.add(x));
    Object.keys(g.visuel).forEach((x) => connus.add(x));
    Object.keys(g.facteur.valeurs).forEach((x) => connus.add(x));
  }

  const orphelins = [...envoyes].filter((x) => !connus.has(x));
  dit(orphelins.length === 0,
    envoyes.size + " reponses fermees a l'ecran, toutes reconnues par la grille",
    orphelins.length ? "INCONNUES DU SERVEUR : " + orphelins.join(" | ") : "");

  const jamais = [...connus].filter((x) => !envoyes.has(x)
    && x !== "Rien de tout ça" && x !== "Oui" && x !== "Non");
  dit(jamais.length === 0, "aucun libelle de la grille n'est absent de l'ecran",
    jamais.length ? "JAMAIS OFFERTS : " + jamais.join(" | ") : "");
}

/* ============================================================
   9 · LA GRILLE N'EST PAS DANS CE QUI PART AU NAVIGATEUR
   ============================================================ */
sous("9 · AUCUN MONTANT DE LA GRILLE DANS UN FICHIER SERVI");
{
  /* Les neuf pages du decoupage, et plus les six fichiers JS de
     l'ancienne identite : ils n'existent plus. */
  const servis = ["index.html", "services.html", "realisations.html",
                  "automatisation.html", "processus.html", "contact.html",
                  "reference.html", "404.html", "confidentialite.html",
                  "partiels/modales.html",
                  "js/main.js", "js/site.js", "js/tour360.js",
                  "css/app.css", "css/critique.css", "css/differe.css"];
  const montants = new Set();
  for (const cle of Object.keys(GRILLE)) {
    const g = GRILLE[cle];
    montants.add(g.base);
    [g.ampleur, g.fonctions, g.visuel, g.facteur.valeurs].forEach((t) =>
      Object.keys(t).forEach((k) => { if (t[k] > 0) montants.add(t[k]); }));
  }
  ECHELLE.forEach((n) => montants.add(n));
  if (montants.size < 15) ARRET("moins de 15 montants releves — la grille n'a pas ete lue");

  /* CE QUE LE SITE PUBLIE DEJA, ET QUI N'EST PAS UNE FUITE.

     Le programme de reference affiche sept primes, dont 2 500 $
     et 5 000 $ — deux montants qui coincident avec cette grille.
     Les denoncer ferait crier la sonde sur un tableau qu'on veut
     justement voir a l'ecran (D-773). On les lit dans le fichier
     de conditions plutot que de les recopier ici : une liste
     recopiee finirait par mentir.

     CE QUE CETTE EXEMPTION COUTE, ET IL FAUT LE SAVOIR : ces deux
     montants-la ne sont plus surveilles. La grille reste illisible
     parce qu'un chiffre isole ne dit rien — c'est la passe « deux
     montants sur la meme ligne » qui garde le reste. */
  const versions = fs.readdirSync(path.join(RACINE, "conditions"))
    .filter((f) => /^reference-\d{4}-\d{2}-\d{2}\.md$/.test(f)).sort();
  if (!versions.length) ARRET("aucune version de conditions — la sonde ne sait pas ce qui est publie");
  const texteCond = fs.readFileSync(path.join(RACINE, "conditions", versions[versions.length - 1]), "utf8");
  const publies = new Set();
  (texteCond.match(/\d[\d\s\u00a0\u202f]*\$/g) || []).forEach((x) => {
    const n = Number(x.replace(/[^\d]/g, ""));
    if (n > 0) publies.add(n);
  });
  if (publies.size < 5) ARRET("moins de cinq primes lues dans " + versions[versions.length - 1]);

  /* Le controle « ecrit en dollars » ne porte que sur les montants
     a quatre chiffres et plus, non publies. « 500 $ » est le
     nombre de depart d'un roulement d'animation dans `langue.js` :
     trop commun pour signifier un prix. La passe « deux sur la
     meme ligne » le couvre quand meme. */
  const surveilles = [...montants].filter((n) => n >= 1000 && !publies.has(n));
  if (surveilles.length < 10) ARRET("moins de dix montants surveilles — l'exemption a tout avale");

  /* LE PROGRAMME DE RÉFÉRENCE A LE DROIT D'ÉCRIRE DES MONTANTS.
     Ses sept primes sont publiques (D-773) et deux d'entre elles —
     2 500 et 5 000 — coincident avec des montants de cette grille.
     Sans cette exemption la sonde crie sur le tableau des
     commissions, qui est justement ce qu'on veut voir affiche. */
  const EXEMPT = /cond-prime|cond-grille|referral|nav-refer|Encaissez|Référez|prime|commission/i;

  /* UN MONTANT ECRIT, ANCRE POUR DE VRAI. « 2 500 $ » ne doit pas
     compter comme une fuite du montant 500 : le premier jet oubliait
     l'ancrage et denoncait huit lignes innocentes, dont le tableau
     des primes du programme de reference. Deux regards en arriere :
     ni un chiffre colle, ni un chiffre separe par une espace de
     groupement. */
  const groupes = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, "|")
    .split("|").join("(?:[\\s\\u00a0\\u202f]|&nbsp;|&#160;|&#xa0;)");
  const ecritDe = (n) => new RegExp("(?<!\\d)(?<!\\d[\\s\\u00a0\\u202f])"
    + groupes(n) + "(?!\\d)\\s*\\$");
  const nuDe = (n) => new RegExp("(?<!\\d)(?<!\\d[\\s\\u00a0\\u202f])" + n + "(?!\\d)");

  const trouves = [];
  for (const f of servis) {
    const abs = path.join(RACINE, f);
    if (!fs.existsSync(abs)) continue;
    const lignes = fs.readFileSync(abs, "utf8").split(/\r?\n/);
    let dansConditions = false;
    lignes.forEach((ligne, i) => {
      if (ligne.indexOf("CONDITIONS:DEBUT") !== -1) dansConditions = true;
      if (ligne.indexOf("CONDITIONS:FIN") !== -1) { dansConditions = false; return; }
      if (dansConditions || EXEMPT.test(ligne)) return;
      for (const n of surveilles) {
        if (ecritDe(n).test(ligne)) {
          trouves.push(f + ":" + (i + 1) + " · " + n + " ecrit en dollars");
          return;
        }
      }
      /* UN MONTANT NU NE COMPTE QUE S'IL EST ACCOMPAGNE. Une grille a
         plusieurs chiffres sur la meme ligne — `{vitrine: 2500,
         boutique: 8000}`. Un `--e:500` de decalage d'animation ou un
         `z-index: 2500` n'en a qu'un, et n'est pas un prix. Exiger
         DEUX montants distincts tue le faux positif sans laisser
         passer la grille — verifie en injectant une fausse grille. */
      const nus = [...montants].filter((n) => nuDe(n).test(ligne));
      if (nus.length >= 2) {
        trouves.push(f + ":" + (i + 1) + " · " + nus.join(" et ") + " sur la meme ligne");
      }
    });
  }

  /* AUTO-CONTROLE DE LA SONDE. Une grille factice, ecrite en memoire,
     doit etre vue — sinon « aucun ne fuit » ne prouve rien. */
  {
    const faux = "  var TARIFS = { vitrine: " + [...montants][0]
      + ", boutique: " + [...montants][1] + " };";
    const vus = [...montants].filter((n) => nuDe(n).test(faux));
    if (vus.length < 2) ARRET("la sonde de fuite ne voit pas une grille factice");
    const ecrit = "  <p>Un site vitrine, c’est " + ECHELLE[0].toLocaleString("fr-CA") + " $.</p>";
    if (!ecritDe(ECHELLE[0]).test(ecrit)) ARRET("la sonde de fuite ne voit pas un montant ecrit");
    const innocent = "  <p>La prime monte à 2 500 $ pour une plateforme.</p>";
    if (ecritDe(500).test(innocent) === false && ecritDe(2500).test(innocent) === false) {
      ARRET("la sonde de fuite ne voit plus rien du tout");
    }
    if (ecritDe(500).test(innocent)) ARRET("la sonde confond encore « 2 500 $ » avec 500");
  }

  dit(trouves.length === 0, surveilles.length + " montants surveilles ("
    + montants.size + " au total, " + publies.size + " deja publies par le programme de reference) dans "
    + servis.length + " fichiers servis",
    trouves.length ? trouves.slice(0, 10).join("\n           ") : "aucun ne fuit");
}

console.log("");
console.log("============================================================");
console.log(defauts === 0
  ? "LA GRILLE TIENT. Calibration, monotonie, trois attaques, deux portes."
  : defauts + " DEFAUT(S)");
console.log("============================================================");
process.exit(defauts === 0 ? 0 : 1);
