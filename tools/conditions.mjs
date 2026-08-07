/* ============================================================
   LES CONDITIONS DU PROGRAMME DE REFERENCE — GENEREES  D-773
   `node tools/conditions.mjs`          — affiche le HTML produit
   `node tools/conditions.mjs verifier` — compare aux deux blocs
   `node tools/conditions.mjs ecrire`   — reecrit les deux blocs

   POURQUOI CET OUTIL EXISTE. Le texte des conditions parait a DEUX
   endroits : le panneau de la section 09 et le tiroir de la
   derniere etape du formulaire. Deux copies tenues a la main
   divergent — et une condition qui dit deux choses differentes sur
   la meme page ne protege personne. La regle A de `CLAUDE.md` dit
   qu'une correction de veracite se fait PARTOUT, en une fois : ici
   elle se fait a un seul endroit, dans le fichier d'archive, et les
   deux copies se reecrivent.

   LA SOURCE DE VERITE EST `conditions/reference-<version>.md`.
   Le fichier le plus recent gouverne. Les anciens ne se modifient
   JAMAIS : une personne qui a accepte le 7 aout 2026 doit pouvoir
   relire ce qu'elle a accepte. Un fichier reecrit est une preuve
   perdue.

   `verifier` sort 1 si un bloc a derive, si les deux blocs ne sont
   pas identiques, ou si la version affichee n'est pas celle du nom
   de fichier ni celle que `google/Code.gs` accepte.
   ============================================================ */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, "..");
const MODE = process.argv[2] || "afficher";

const BORNE_DEBUT = "<!-- CONDITIONS:DEBUT -->";
const BORNE_FIN = "<!-- CONDITIONS:FIN -->";
const CIBLE = path.join(RACINE, "index.html");
const DOSSIER = path.join(RACINE, "conditions");

/* ------------------------------------------------------------
   1 · LA VERSION EN VIGUEUR

   Le nom de fichier EST la version. Aucune date n'est ecrite deux
   fois : celle du titre serait une seconde source, donc une source
   de plus a maintenir fausse.
   ------------------------------------------------------------ */
function versionEnVigueur() {
  if (!fs.existsSync(DOSSIER)) return null;
  const noms = fs.readdirSync(DOSSIER)
    .map((f) => /^reference-(\d{4}-\d{2}-\d{2})\.md$/.exec(f))
    .filter(Boolean)
    .map((m) => m[1])
    .sort();
  return noms.length ? noms[noms.length - 1] : null;
}

/* ------------------------------------------------------------
   2 · LE CONVERTISSEUR

   UN SOUS-ENSEMBLE DECLARE, PAS UN ANALYSEUR DE MARKDOWN. Quatre
   formes, et rien d'autre : le titre d'article, le tableau, le
   paragraphe, et le gras. Ce qui n'est pas dans cette liste ne se
   rend pas — et c'est voulu : un convertisseur qui devine finit
   par rendre un jour ce qu'on ne lui a pas demande, sur une page
   qui porte un engagement.

   `.` NE MATCHE PAS `\r` EN JAVASCRIPT (piege 86) : on decoupe
   toujours sur `\n` puis on rogne les `\r` un par un, plutot que
   d'ecrire des motifs multilignes qui echoueraient en silence sur
   un fichier CRLF.
   ------------------------------------------------------------ */
const echapper = (s) => String(s)
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/* Les montants ne se coupent jamais en fin de ligne : ni entre les
   milliers et les centaines, ni avant le signe. Le site l'ecrit
   partout ailleurs a la main ; ici c'est le convertisseur qui le
   pose, donc il ne peut pas etre oublie. */
function insecables(s) {
  return s.replace(/(\d) (\d{3})/g, "$1&#160;$2")
          .replace(/(\d) \$/g, "$1&#160;$");
}

/* L'APOSTROPHE DU SITE EST COURBE, PARTOUT. Le markdown se tape
   droit — c'est plus commode a ecrire — et se rend courbe, une
   seule fois, ici. Deux formes d'apostrophe sur la meme page se
   voient a l'oeil nu dans un texte de mille mots. */
const courber = (s) => s.replace(/'/g, "’");

function enLigne(s) {
  return courber(insecables(echapper(s)))
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2">$1</a>');
}

function convertir(markdown) {
  const lignes = markdown.split("\n").map((l) => l.replace(/\r$/, ""));
  const out = [];
  let para = [];

  const viderPara = () => {
    if (!para.length) return;
    out.push("<p>" + enLigne(para.join(" ")) + "</p>");
    para = [];
  };

  const cellules = (l) => l.replace(/^\s*\|/, "").replace(/\|\s*$/, "")
    .split("|").map((c) => c.trim());

  for (let i = 0; i < lignes.length; i++) {
    const l = lignes[i];

    if (!l.trim()) { viderPara(); continue; }

    const t = /^##\s+(.+)$/.exec(l);
    if (t) { viderPara(); out.push('<h4 class="cond-t">' + enLigne(t[1]) + "</h4>"); continue; }

    /* Un tableau : une rangee d'en-tete, une rangee de tirets, puis
       le corps. La rangee de tirets est ce qui distingue un tableau
       d'un paragraphe qui contiendrait une barre verticale. */
    if (/^\s*\|/.test(l) && /^\s*\|[\s:|-]+\|\s*$/.test(lignes[i + 1] || "")) {
      viderPara();
      const tete = cellules(l);
      const corps = [];
      let k = i + 2;
      while (k < lignes.length && /^\s*\|/.test(lignes[k])) { corps.push(cellules(lignes[k])); k++; }
      i = k - 1;
      out.push('<table class="cond-grille">');
      out.push("<thead><tr>" + tete.map((c) => "<th>" + enLigne(c) + "</th>").join("") + "</tr></thead>");
      out.push("<tbody>");
      for (const r of corps) {
        out.push("<tr>" + r.map((c, j) => (j === r.length - 1
          ? '<td class="cond-prime"><b>' + enLigne(c) + "</b></td>"
          : "<td>" + enLigne(c) + "</td>")).join("") + "</tr>");
      }
      out.push("</tbody></table>");
      continue;
    }

    para.push(l.trim());
  }
  viderPara();
  return out.join("\n");
}

/* ------------------------------------------------------------
   3 · L'AUTO-CONTROLE

   Un outil qui rend « 0 » sans erreur ment (pieges 30 · 40 · 62).
   Celui-ci rendrait une chaine vide si le convertisseur derivait,
   et une chaine vide s'ecrirait dans les deux blocs sans que rien
   ne crie : la page perdrait ses conditions et le controle dirait
   « a jour ». On lui donne donc un texte d'essai qui contient les
   quatre formes, et on ARRETE s'il n'en rend pas les quatre.
   ------------------------------------------------------------ */
{
  const essai = convertir([
    "## 1 · Un titre",
    "",
    "Un paragraphe avec du **gras**, un [lien](ailleurs.html), l'apostrophe et 1 200 $ dedans.",
    "",
    "| Colonne | Prime |",
    "|---|---|",
    "| Une ligne | 150 $ |"
  ].join("\n"));
  const attendus = [
    ['<h4 class="cond-t">', "le titre d'article"],
    ["<strong>gras</strong>", "le gras"],
    ["1&#160;200&#160;$", "l'insecable des montants"],
    ['<a href="ailleurs.html">lien</a>', "le lien"],
    ["l’apostrophe", "l'apostrophe courbe"],
    ['<table class="cond-grille">', "le tableau"],
    ['<td class="cond-prime"><b>150&#160;$</b></td>', "la cellule de prime"]
  ];
  const rates = attendus.filter(([m]) => essai.indexOf(m) === -1);
  if (rates.length) {
    console.error(
      "ARRET  le convertisseur ne rend plus " + rates.length + " forme(s) sur "
      + attendus.length + " :\n"
      + rates.map(([, quoi]) => "         · " + quoi).join("\n")
      + "\n       Ce n'est pas le texte qui a change, c'est l'instrument.\n"
      + "       Repare `convertir` avant de croire le verdict.");
    process.exit(2);
  }
}

/* ------------------------------------------------------------
   4 · LE BLOC ATTENDU
   ------------------------------------------------------------ */
const version = versionEnVigueur();
if (!version) {
  console.error("ARRET  aucun `conditions/reference-AAAA-MM-JJ.md` trouve.");
  process.exit(2);
}

const source = fs.readFileSync(path.join(DOSSIER, "reference-" + version + ".md"), "utf8");
const d = source.indexOf("<!-- TEXTE:DEBUT -->");
const f = source.indexOf("<!-- TEXTE:FIN -->");
if (d < 0 || f < 0) {
  console.error("ARRET  `reference-" + version + ".md` ne porte pas les bornes TEXTE:DEBUT / TEXTE:FIN.");
  process.exit(2);
}
const texte = source.slice(d + "<!-- TEXTE:DEBUT -->".length, f);

/* La version se pose ICI, jamais dans le markdown : elle vient du
   nom de fichier, qui est la seule chose qu'on ne peut pas oublier
   de changer en creant une nouvelle version. */
const attendu = convertir(texte)
  + '\n<p class="cond-version">Version <b>' + version + "</b>. "
  + "C’est cette version-là qui s’applique à une référence envoyée aujourd’hui, "
  + "et c’est elle qu’on enregistre avec la vôtre.</p>";

if (MODE === "afficher") {
  console.log(attendu);
  process.exit(0);
}

/* ------------------------------------------------------------
   5 · LES BLOCS DU DOCUMENT
   ------------------------------------------------------------ */
const doc = fs.readFileSync(CIBLE, "utf8");
const bornes = [];
{
  let i = 0;
  while ((i = doc.indexOf(BORNE_DEBUT, i)) >= 0) {
    const j = doc.indexOf(BORNE_FIN, i);
    if (j < 0) break;
    bornes.push([i + BORNE_DEBUT.length, j]);
    i = j + BORNE_FIN.length;
  }
}

/* DEUX BLOCS, PAS UN NI TROIS. Un seul bloc voudrait dire que le
   tiroir du formulaire a perdu son texte — et la case a cocher
   demanderait d'accepter quelque chose d'illisible. */
const VOULUS = 2;
if (bornes.length !== VOULUS) {
  console.error("ARRET  index.html porte " + bornes.length + " bloc(s) "
    + BORNE_DEBUT + " au lieu de " + VOULUS + ".\n"
    + "       Le panneau de la section 09 et le tiroir du formulaire\n"
    + "       doivent tous deux porter le texte.");
  process.exit(2);
}

if (MODE === "ecrire") {
  let sortie = "";
  let curseur = 0;
  for (const [a, b] of bornes) {
    sortie += doc.slice(curseur, a) + "\n" + attendu + "\n";
    curseur = b;
  }
  sortie += doc.slice(curseur);
  fs.writeFileSync(CIBLE, sortie, "utf8");
  console.log("index.html mis a jour — " + VOULUS + " blocs, version " + version + ".");
  process.exit(0);
}

/* ------------------------------------------------------------
   6 · VERIFIER
   ------------------------------------------------------------ */
let ko = 0;
const dire = (ok, quoi, note) => {
  console.log("  " + (ok ? "OK   " : "ECHEC") + " " + quoi + (ok || !note ? "" : "\n         " + note));
  if (!ok) ko++;
};

console.log("--- LES CONDITIONS DU PROGRAMME · version " + version);

bornes.forEach(([a, b], i) => {
  dire(doc.slice(a, b).trim() === attendu.trim(),
    "le bloc " + (i + 1) + " est a jour",
    "`node tools/conditions.mjs ecrire` le reecrit");
});

dire(doc.slice(bornes[0][0], bornes[0][1]).trim() === doc.slice(bornes[1][0], bornes[1][1]).trim(),
  "les deux blocs disent exactement la meme chose",
  "une condition qui dit deux choses sur la meme page ne protege personne");

/* LA VERSION PARAIT A TROIS ENDROITS DE PLUS, et chacun est une
   occasion de derive : le champ cache que le navigateur envoie, le
   libelle de la case a cocher — celui que la personne LIT au moment
   d'accepter — et la ligne de bas de bloc, qui elle est generee.
   Si le champ cache disait une version et le libelle une autre, la
   preuve dirait le contraire de ce qui a ete montre. */
dire(doc.indexOf('name="conditions_version" value="' + version + '"') !== -1,
  "le champ envoye porte la version en vigueur",
  "cherche : name=\"conditions_version\" value=\"" + version + "\"");
dire(doc.indexOf("version " + version + "</b>") !== -1,
  "le libelle de la case dit la meme version",
  "c'est la seule que la personne LIT en cochant");

/* LE SERVEUR DOIT CONNAITRE CETTE VERSION. Sans ca, il refuserait
   toutes les references en production : le site enverrait une
   version que `valider()` ne reconnait pas. */
const gs = fs.readFileSync(path.join(RACINE, "google", "Code.gs"), "utf8");
const mv = /var CONDITIONS_VERSIONS = \[([^\]]*)\]/.exec(gs);
dire(!!mv, "google/Code.gs declare CONDITIONS_VERSIONS");
if (mv) {
  const listees = mv[1].split(",").map((s) => s.trim().replace(/^["']|["']$/g, "")).filter(Boolean);
  dire(listees[0] === version,
    "le serveur accepte « " + version + " » et la donne en tete",
    "lu : [" + listees.join(", ") + "]");
}

/* ET LES ANCIENNES VERSIONS NE DOIVENT PAS DISPARAITRE de la liste :
   une reference acceptee sous l'ancienne se reenverrait — reessai
   reseau — et se ferait refuser sur une version qui etait vraie. */
const archives = fs.readdirSync(DOSSIER)
  .map((n) => /^reference-(\d{4}-\d{2}-\d{2})\.md$/.exec(n)).filter(Boolean).map((m) => m[1]);
if (mv) {
  const listees = mv[1].split(",").map((s) => s.trim().replace(/^["']|["']$/g, "")).filter(Boolean);
  const orphelines = archives.filter((v) => listees.indexOf(v) === -1);
  dire(orphelines.length === 0,
    "toutes les versions archivees sont encore acceptees",
    "absente(s) de CONDITIONS_VERSIONS : " + orphelines.join(", "));
}

console.log(ko ? "\nLES CONDITIONS ONT DERIVE : " + ko + " defaut(s)."
                : "\nok — les conditions sont a jour et identiques des deux cotes.");
process.exit(ko ? 1 : 0);
