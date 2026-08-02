/* ============================================================
   L'INDEX DE TETE D'UN DOCUMENT — genere, jamais ecrit a la main.
   `node tools/index-doc.mjs ecrire|verifier [fichier.md …]`

   POURQUOI CET OUTIL EXISTE. Mesure du 2026-08-03 : lire
   `ANIMATIONS.md` en entier coute 25 622 jetons, `PIEGES.md` 19 157,
   `ARCHITECTURE.md` 15 518. Or aucun de ces trois n'a besoin d'etre
   lu en entier — ils sont decoupes en titres `##` et `###`, et une
   seule sous-partie repond a la question. Ce qui manquait n'etait pas
   la structure : c'etait de SAVOIR, sans les ouvrir, quelle
   sous-partie demander.

   L'index de tete donne cette liste. Il coute environ 700 jetons et
   evite d'en lire vingt-cinq mille.

   IL EST GENERE. Un index tenu a la main derive a la premiere
   edition, et un index perime envoie lire le mauvais endroit — ce qui
   coute plus cher que pas d'index du tout. `verifier` sort 1 s'il a
   derive, pour qu'un chantier ne se ferme pas dessus.

   LA CLE EST LE TITRE, PAS LE NUMERO DE LIGNE. Les 420 references
   `fichier:ligne` d'ANIMATIONS.md ont ete retirees le 2026-07-30 :
   elles etaient toutes fausses. Un titre ne perime pas, et il se
   grep.
   ============================================================ */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, "..");

const MODE = process.argv[2] || "verifier";
const DEFAUT = ["ANIMATIONS.md", "ARCHITECTURE.md", "PIEGES.md", "MESURES.md", "DECISIONS.md", "RESERVES.md", "SECTIONS.md"];
const CIBLES = process.argv.slice(3).length ? process.argv.slice(3) : DEFAUT;

const DEBUT = "<!-- INDEX:DEBUT -->";
const FIN = "<!-- INDEX:FIN -->";

/* Un titre peut contenir du code, des liens, du gras. On ne garde que
   ce qui se tape dans un `grep`. */
function nettoyer(t) {
  return t.replace(/\*\*/g, "").replace(/`/g, "").replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").trim();
}

/* `.` NE MATCHE PAS `\r` EN JAVASCRIPT — c'est un terminateur de
   ligne au meme titre que `\n`. Sur un fichier en CRLF, `/^## (.+)$/`
   echoue donc en SILENCE : `.+` s'arrete avant le `\r` et `$` ne
   tombe pas sur la fin de chaine. Le depot melange les deux fins de
   ligne (git convertit a l'ecriture) : ANIMATIONS.md est en LF,
   ARCHITECTURE.md en CRLF. Premiere passe de cet outil : 40 titres
   trouves dans le premier, ZERO dans le second, et aucune erreur —
   il a ecrit six tables vides en rendant « ok ». On coupe donc le
   `\r` avant de comparer, et on le remet a l'ecriture. */
function batir(texte) {
  /* TOUT `\r` de la ligne, pas seulement le dernier : un CR insere au
     MILIEU — ce qui arrive des qu'un script ecrit du texte avec un
     echappement mal protege — casse la meme regex sans etre coupe.
     Ce piege s'est reproduit ici meme : le titre du piege 86 est
     devenu invisible a son propre index de cette facon. */
  const lignes = texte.split("\n").map((l) => l.replace(/\r/g, ""));
  const titres = [];
  let dansCode = false;
  for (let i = 0; i < lignes.length; i++) {
    const l = lignes[i];
    if (/^```/.test(l)) { dansCode = !dansCode; continue; }
    if (dansCode) continue;
    const m = /^(#{2,3}) (.+)$/.exec(l);
    if (!m) continue;
    titres.push({ niveau: m[1].length, titre: nettoyer(m[2]), ligne: i + 1 });
  }
  /* Le poids de chaque partie : c'est lui qui dit si on peut se
     permettre de la lire, et c'est l'information qui manque toujours
     quand on decide quoi ouvrir. */
  for (let i = 0; i < titres.length; i++) {
    const fin = i + 1 < titres.length ? titres[i + 1].ligne : lignes.length + 1;
    const bloc = lignes.slice(titres[i].ligne - 1, fin - 1).join("\n");
    titres[i].lignes = fin - titres[i].ligne;
    titres[i].jetons = Math.round(bloc.length / 3.6);
  }
  /* Une sous-partie de niveau 3 herite du poids de sa mere pour le
     calcul, mais on ne l'affiche qu'une fois. */
  const out = [];
  out.push(DEBUT);
  out.push("");
  out.push("> **NE LIS PAS CE FICHIER EN ENTIER.** Cette table donne le titre exact");
  out.push("> de chaque partie et ce qu'elle coûte. Va chercher la seule qui répond :");
  out.push("> `grep -n \"^### <titre>\" <fichier>` puis lis la plage. Le titre est la clé —");
  out.push("> il ne périme pas, un numéro de ligne oui.");
  out.push("");
  out.push("| Partie | Lignes | Jetons ~ |");
  out.push("|---|---:|---:|");
  for (const t of titres) {
    const indent = t.niveau === 3 ? "&nbsp;&nbsp;↳ " : "**";
    const fin = t.niveau === 3 ? "" : "**";
    out.push(`| ${indent}${t.titre}${fin} | ${t.lignes} | ${t.jetons.toLocaleString("fr-CA").replace(/ | /g, " ")} |`);
  }
  out.push("");
  out.push(FIN);
  return out.join("\n");
}

let derive = 0;
for (const cible of CIBLES) {
  const p = path.join(RACINE, cible);
  if (!fs.existsSync(p)) { console.log(`  ABSENT  ${cible}`); continue; }
  let texte = fs.readFileSync(p, "utf8");
  /* La fin de ligne du fichier se releve et se remet : inserer des
     lignes en LF dans un fichier en CRLF laisse un melange que le
     prochain outil relira de travers. */
  const CRLF = (texte.match(/\r\n/g) || []).length > (texte.split("\n").length / 2);
  const EOL = CRLF ? "\r\n" : "\n";
  const neuf = batir(texte).split("\n").join(EOL);

  const i = texte.indexOf(DEBUT);
  const j = texte.indexOf(FIN);
  const aDejaUnIndex = i >= 0 && j > i;
  const actuel = aDejaUnIndex ? texte.slice(i, j + FIN.length) : null;

  if (MODE === "verifier") {
    if (!aDejaUnIndex) { console.log(`  SANS INDEX  ${cible}`); derive++; continue; }
    if (actuel !== neuf) { console.log(`  A DERIVE    ${cible}`); derive++; continue; }
    console.log(`  a jour      ${cible}`);
    continue;
  }

  if (aDejaUnIndex) {
    texte = texte.slice(0, i) + neuf + texte.slice(j + FIN.length);
  } else {
    /* On l'insere APRES la ligne « Quand lire ce fichier », qui doit
       rester la premiere chose lue, et avant tout le reste. */
    const lignes = texte.split(/\r?\n/);
    let pos = 1;
    for (let k = 1; k < Math.min(lignes.length, 40); k++) {
      if (/^---\s*$/.test(lignes[k]) || /^## /.test(lignes[k])) { pos = k; break; }
      pos = k + 1;
    }
    lignes.splice(pos, 0, "", neuf, "");
    texte = lignes.join(EOL);
  }
  /* ZERO PARTIE EST UNE ERREUR, PAS UN RESULTAT. Un document de ce
     depot sans titre `##` n'existe pas. Sans ce garde-fou, la
     premiere passe a ecrit six tables VIDES en rendant « ok » —
     l'outil s'etait tu sur exactement le defaut qu'il devait voir. */
  const n = (neuf.match(/\n\| |\r\n\| /g) || []).length - 1;
  if (n <= 0) {
    console.log(`  *** AUCUNE PARTIE TROUVEE dans ${cible} — index NON ecrit`);
    process.exitCode = 1;
    continue;
  }
  fs.writeFileSync(p, texte, "utf8");
  console.log(`  ecrit       ${cible}  (${n} parties, index ~${Math.round(neuf.length / 3.6)} jetons)`);
}

if (MODE === "verifier" && derive) {
  console.log(`\n${derive} document(s) sans index a jour — \`node tools/index-doc.mjs ecrire\``);
  process.exit(1);
}
