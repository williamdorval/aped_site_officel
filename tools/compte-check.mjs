/* ============================================================
   LE NOMBRE D'ÉTAPES PROMIS EST-IL LE VRAI ?
   `node tools/compte-check.mjs`

   CE QU'IL GARDE.  D-767

   Le 2026-08-06, le site promettait « six questions » à CINQ
   endroits pour un estimateur qui en posait NEUF, et « huit » à un
   sixième. La tuile du formulaire projet annonçait « 5 questions »
   pour sept écrans.

   AUCUN DE CES CHIFFRES N'ÉTAIT FAUX QUAND IL A ÉTÉ ÉCRIT. Le
   commentaire de D-703 — « Cinq questions, pas sept » — prouve
   qu'il a été vrai. C'est D-749 qui a ajouté deux écrans sans
   toucher aux tuiles. Une promesse chiffrée dérive toujours dans
   ce sens-là : le code grossit, la phrase reste.

   C'est un défaut de la RÈGLE A · Q1 : un visiteur à qui on promet
   six écrans et qui en voit neuf a été trompé, et c'est la première
   raison d'abandonner un formulaire long.

   IL COMPTE LE HTML, IL NE CROIT RIEN. Les étapes se comptent sur
   les attributs `data-step` / `data-pstep` / `data-rstep`, et les
   promesses se cherchent en toutes lettres ET en chiffres.

   Sorties : 0 les comptes sont justes · 1 une promesse est fausse.
   ============================================================ */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, "..");

let n = 0, ko = 0;
function dire(nom, obtenu, attendu, note) {
  n++;
  const ok = String(obtenu) === String(attendu);
  if (!ok) ko++;
  console.log("  " + (ok ? "OK   " : "ECHEC") + " " + nom
    + (ok ? "" : "\n         obtenu  : " + JSON.stringify(obtenu)
             + "\n         attendu : " + JSON.stringify(attendu)
             + (note ? "\n         " + note : "")));
}

/* LES FICHIERS SE LISENT EN BINAIRE PUIS SE DÉCODENT, et les
   sauts de ligne se normalisent : `.` ne matche pas `\r`, et sur
   un fichier CRLF un `/^…$/` échoue en silence — l'outil rendrait
   « 0 promesse trouvée » sur un fichier plein de promesses fausses.
   Piège 86. */
function lire(rel) {
  const f = path.join(RACINE, rel);
  if (!fs.existsSync(f)) return null;
  return fs.readFileSync(f, "utf8").replace(/\r\n?/g, "\n");
}

/* ON JUGE CE QUE LE VISITEUR LIT, PAS CE QUE LE FICHIER CONTIENT.

   Première version : elle cherchait « N questions » dans la source
   entière et accusait TROIS commentaires de code — « LES TROIS
   QUESTIONS QUI FONT VRAIMENT VARIER UN PRIX », qui décrit le
   barème et ne promet rien à personne. Un commentaire n'est pas une
   promesse : il ne s'affiche pas.

   On blanchit donc les commentaires en gardant leur LONGUEUR, pour
   que les numéros de ligne restent ceux du fichier. Remplacer par
   du vide décalerait tous les rapports, et on enverrait corriger
   la mauvaise ligne. */
function texteRendu(src) {
  const blanchir = (m) => m.replace(/[^\n]/g, " ");
  return src
    .replace(/<!--[\s\S]*?-->/g, blanchir)
    .replace(/<script\b[\s\S]*?<\/script>/gi, blanchir)
    .replace(/<style\b[\s\S]*?<\/style>/gi, blanchir);
}

const HTML = lire("index.html");
if (!HTML) { console.error("index.html introuvable."); process.exit(2); }

/* ---- 1 · CE QUE LE CODE CONTIENT VRAIMENT ---- */
function compter(attr, exclure = 0) {
  const vus = new Set();
  const re = new RegExp(attr + '="(\\d+)"', "g");
  let m;
  while ((m = re.exec(HTML))) vus.add(Number(m[1]));
  return [...vus].sort((a, b) => a - b).filter((x) => x <= (999 - exclure));
}

const eSteps = compter("data-step");
const pSteps = compter("data-pstep");
const rSteps = compter("data-rstep");

/* L'ESTIMATEUR NE SE COMPTE PLUS AU NOMBRE D'ECRANS DU BALISAGE.
   D-776

   Il en porte QUATORZE et n'en montre JAMAIS plus de six : chaque
   écran déclare `data-pour`, la famille de projet à laquelle il
   s'adresse, et le questionnaire choisit son chemin au premier
   clic. L'ancienne règle — « tout `data-step` jusqu'à 9 est une
   question » — comptait donc les quatre écrans d'ampleur comme
   quatre questions posées à la même personne. Elle rendait 9 sur un
   parcours qui en fait 6.

   CE QU'ON COMPTE : le PLUS LONG chemin. C'est ce que la promesse
   « six écrans au plus » engage, et c'est le seul nombre qu'aucun
   visiteur ne verra dépassé. L'écran du résultat ne s'y compte pas :
   il ne se remplit pas. */
const FAMILLES = ["vitrine", "boutique", "estimateur", "logiciel", "sansprix"];
function ecransDe(famille) {
  const re = /<div class="step"[^>]*data-step="(\d+)"[^>]*data-pour="([^"]+)"/g;
  let m, k = 0, dernier = 0;
  while ((m = re.exec(HTML))) {
    const num = Number(m[1]);
    const pour = m[2].trim().split(/\s+/);
    dernier = Math.max(dernier, num);
    const ok = pour.includes("tous") || pour.includes(famille)
      || (pour.includes("prix") && famille !== "sansprix");
    if (ok) k++;
  }
  /* Le dernier ecran est celui du resultat : il est `data-pour="tous"`
     et il ne se remplit pas. */
  return { ecrans: k - 1, dernier };
}
const PARCOURS = FAMILLES.map((f) => ({ f, ...ecransDe(f) }));
const Q_ESTIM = Math.max(...PARCOURS.map((x) => x.ecrans));
const Q_MIN = Math.min(...PARCOURS.map((x) => x.ecrans));
if (PARCOURS.some((x) => x.ecrans < 1)) {
  console.error("ARRET · un parcours de l'estimateur ne compte aucun écran remplissable.");
  console.error("        Le balisage a changé de forme et cet outil ne le lit plus.");
  process.exit(2);
}
/* LE PROJET : le dernier écran est le SUCCÈS, il ne se remplit pas. */
const E_PROJET = pSteps.length - 1;
const E_REFER = rSteps.length - 1;

console.log("============================================================");
console.log("CE QUE LE CODE CONTIENT");
console.log("  estimation · le plus long chemin : " + Q_ESTIM + " écrans remplissables");
PARCOURS.forEach((x) => console.log("               · " + x.f.padEnd(11) + " " + x.ecrans + " écrans"));
console.log("               (le plus court : " + Q_MIN + ")");
console.log("  projet     · écrans remplis : " + E_PROJET + "   (data-pstep " + pSteps.join(",") + ")");
console.log("  référence  · écrans remplis : " + E_REFER + "   (data-rstep " + rSteps.join(",") + ")");
console.log("============================================================");

/* UN COMPTE À ZÉRO ARRÊTE L'OUTIL. Un `index.html` qu'on n'aurait
   pas su lire rendrait « 0 étape » et « 0 promesse » — donc « tout
   concorde », sur un fichier qu'on n'a pas compris. Pièges 30 · 40. */
if (!Q_ESTIM || !E_PROJET) {
  console.error("ARRET · aucune étape trouvée. Le fichier n'a pas été compris,");
  console.error("        et « 0 promesse fausse » serait une invention.");
  process.exit(2);
}

/* ---- 2 · CE QUE LE SITE PROMET ---- */
const MOTS = { un: 1, deux: 2, trois: 3, quatre: 4, cinq: 5, six: 6,
  sept: 7, huit: 8, neuf: 9, dix: 10, onze: 11, douze: 12 };
const MOT_DE = Object.fromEntries(Object.entries(MOTS).map(([k, v]) => [v, k]));

/* Où chaque promesse doit pointer. La clé est le CONTEXTE, pas le
   fichier : la même phrase peut vivre dans trois fichiers. */
/* LE CONTEXTE DÉCIDE, PAS LE MOTIF.

   Deuxième version de cet outil : elle jugeait TOUT « N questions »
   du texte rendu, et accusait trois phrases parfaitement vraies —
   « 7 questions » qui compte la FAQ, et « quatre questions qui ne
   s'ouvrent pas » qui décrit le site D'AVANT d'un client dans une
   maquette. Les trois disaient vrai sur autre chose.

   Une promesse ne se juge que contre ce qu'elle promet. On ne
   retient donc que les occurrences dont l'ENTOURAGE nomme
   l'estimateur, et la FAQ se compte à part, sur ses propres items. */
const VOISINAGE = 500;
function parleDeLEstimateur(src, i) {
  const autour = src.slice(Math.max(0, i - VOISINAGE), i + VOISINAGE).toLowerCase();
  return /modal-estimate|estimation|estimer votre projet|vos économies/.test(autour);
}

const CIBLES = [
  { fichiers: ["index.html", "confidentialite.html"],
    /* « ECRANS », PAS « QUESTIONS ».  D-776
       Deux ecrans posent DEUX questions chacun : promettre « six
       questions » serait faux de deux, et dans le sens qui deçoit.
       Le compteur a l'ecran dit « 3 sur 6 » et compte des ecrans :
       la promesse doit compter la meme chose, sinon les deux
       chiffres se contredisent sous les yeux du visiteur. */
    motif: /(?:^|[^\wàâçéèêëîïôûùüÿñ])(?:(un|deux|trois|quatre|cinq|six|sept|huit|neuf|dix|onze|douze)|(\d{1,2}))\s+écrans/gi,
    attendu: Q_ESTIM, quoi: "écrans de l'estimateur", filtre: parleDeLEstimateur }
];

let promesses = 0;
for (const c of CIBLES) {
  for (const rel of c.fichiers) {
    const brutFichier = lire(rel);
    if (brutFichier === null) continue;
    const src = texteRendu(brutFichier);
    let m;
    c.motif.lastIndex = 0;
    while ((m = c.motif.exec(src))) {
      const brut = m[1] || m[2];
      const val = m[1] ? MOTS[String(m[1]).toLowerCase()] : Number(m[2]);
      if (!val) continue;
      if (c.filtre && !c.filtre(src, m.index)) continue;
      promesses++;
      const ligne = src.slice(0, m.index).split("\n").length;
      dire(rel + ":" + ligne + " · « " + brut + " " + c.quoi.split(" ")[0] + " »",
        val, c.attendu,
        "le code en contient " + c.attendu + " — écrivez « "
        + MOT_DE[c.attendu] + " » ou « " + c.attendu + " »");
    }
  }
}

/* UNE PROMESSE À ZÉRO N'EST PAS UNE RÉUSSITE. Si plus aucune tuile
   n'annonce de nombre, cet outil n'a plus rien à garder — et il
   doit le dire, pas rendre « tout concorde ». */
console.log("");
dire("le site annonce bien un nombre d'écrans", promesses > 0, true,
  "aucune promesse chiffrée trouvée : soit elles ont disparu, soit le motif ne les voit plus");

/* ---- 3 · LA FAQ COMPTE SES PROPRES QUESTIONS ---- */
{
  const rendu = texteRendu(HTML);
  const vraies = (HTML.match(/class="faq-item"/g) || []).length;
  dire("la FAQ contient bien des questions", vraies > 0, true);
  const re = /(?:^|[^\wàâçéèêëîïôûùüÿñ])(?:(un|deux|trois|quatre|cinq|six|sept|huit|neuf|dix|onze|douze)|(\d{1,2}))\s+questions/gi;
  let m, vus = 0;
  while ((m = re.exec(rendu))) {
    const autour = rendu.slice(Math.max(0, m.index - 400), m.index + 400).toLowerCase();
    if (!/questions fréquentes|faq/.test(autour)) continue;
    vus++;
    const val = m[1] ? MOTS[String(m[1]).toLowerCase()] : Number(m[2]);
    dire("la FAQ annonce le bon nombre", val, vraies,
      "elle contient " + vraies + " items `faq-item`");
  }
  dire("la FAQ annonce un nombre", vus > 0, true);
}

/* ---- 4 · LES PROMESSES EN ÉCRANS, côté projet ---- */
{
  const re = /Recommandé\s*·\s*(\d+)\s*(étapes?|questions?)/g;
  let m, vus = 0;
  while ((m = re.exec(HTML))) {
    vus++;
    dire("la tuile du projet annonce le bon nombre d'écrans",
      Number(m[1]), E_PROJET, "sept écrans se remplissent, le huitième est le succès");
    dire("et elle dit « étapes », pas « questions »",
      /étapes?/.test(m[2]), true,
      "un écran du projet porte deux ou trois champs : « question » sous-compte");
  }
  dire("la tuile du projet porte un compte", vus, 1);
}

console.log("");
console.log("============================================================");
console.log(ko ? ("UNE PROMESSE EST FAUSSE : " + ko + " écart(s) sur " + n)
              : ("LES COMPTES SONT JUSTES : " + n + " / " + n));
console.log("============================================================");
process.exit(ko ? 1 : 0);
