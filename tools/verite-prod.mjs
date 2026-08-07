/* ============================================================
   CE QUE LE VRAI CLASSEUR CONTIENT — `node tools/verite-prod.mjs`

   IL PARLE AU VRAI SERVICE ET IL DEPENSE DU QUOTA. Trois sessions,
   trois naissances de ligne, donc TROIS courriels. Rien de plus :
   aucune n'est confirmee, et une etape intermediaire n'envoie rien.

   IL PROUVE DEUX CHOSES QUE LE BANC NE PEUT PAS PROUVER.

   1 · L'INJECTION DE FORMULE, RELUE AVEC `getFormulas()`.  D-757
       C'est le point exact ou le banc a menti pendant des mois : il
       modelisait la croyance « le format texte protege », qui est
       fausse. Seule une lecture du vrai Sheets tranche. On regarde
       donc la FORMULE de la cellule, pas sa valeur affichee — c'est
       precisement ce qui avait masque la faille.

   2 · LE RETOUR EN ARRIERE.  D-744
       Une valeur CHANGEE doit ecraser. Une valeur ABSENTE ne doit
       toucher a rien. Les deux dans la meme requete, sinon on ne
       prouve que la moitie de la regle — et c'est la moitie facile.

   Sorties : 0 tout tient · 1 defaut · 2 impossible de conclure.
   ============================================================ */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, "..");
const VERSION_MINIMALE = 10;

const env = fs.readFileSync(path.join(RACINE, ".env.local"), "utf8");
const m = /^APED_WEB_APP_URL=(.+)$/m.exec(env);
if (!m) { console.error("APED_WEB_APP_URL absent de .env.local"); process.exit(2); }
const SERVICE = m[1].trim();

let n = 0, ko = 0;
function dire(nom, obtenu, attendu, note) {
  n++;
  const ok = String(obtenu) === String(attendu);
  if (!ok) ko++;
  console.log("  " + (ok ? "OK   " : "ECHEC") + " " + nom
    + "\n         obtenu  : " + JSON.stringify(obtenu)
    + "\n         attendu : " + JSON.stringify(attendu)
    + (note ? "\n         " + note : ""));
}
function titre(t) { console.log(""); console.log("--- " + t); }

async function lire(q) {
  const r = await fetch(SERVICE + (q ? "?" + q : ""), { redirect: "follow" });
  const t = await r.text();
  try { return JSON.parse(t); }
  catch {
    console.error("Le service n'a pas rendu de JSON (" + t.length + " octets).");
    console.error(t.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").slice(0, 300));
    process.exit(2);
  }
}

/* LE SERVICE REND PARFOIS HTTP 404 — 2 sur 36 mesures le
   2026-08-06, le renvoi de `/exec` qui tombe. On reessaie, et c'est
   sans danger : `traiter()` cherche la signature avant tout effet de
   bord (D-730). */
async function poster(charge, essais = 3) {
  for (let i = 1; i <= essais; i++) {
    try {
      const r = await fetch(SERVICE, {
        method: "POST", redirect: "follow",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(charge)
      });
      const t = await r.text();
      try { return JSON.parse(t); }
      catch {
        if (i === essais) {
          console.error("reponse non-JSON apres " + essais + " essais : "
            + t.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").slice(0, 200));
          process.exit(2);
        }
      }
    } catch (e) {
      if (i === essais) { console.error("reseau : " + e); process.exit(2); }
    }
    await new Promise((r2) => setTimeout(r2, 1200));
  }
}

/* La ligne d'essai qui porte cette signature, telle que le CLASSEUR
   la contient — valeur, formule et format, cellule par cellule. */
async function ligneDe(onglet, marqueur) {
  const d = await lire("action=diag");
  const o = (d.onglets || []).find((x) => x.onglet === onglet);
  if (!o) { console.error("onglet « " + onglet + " » absent"); process.exit(2); }
  const cand = (o.lignesEssai || []).filter((l) =>
    (l.cellules || []).some((c) => String(c.valeur || "").indexOf(marqueur) !== -1));
  if (!cand.length) return null;
  /* La plus BASSE : `ecrireLigne` insere en ligne 2, la plus recente
     est donc la premiere. On prend quand meme la plus recente
     explicitement, pour ne pas dependre de l'ordre d'insertion. */
  cand.sort((a, b) => a.ligne - b.ligne);
  return { ligne: cand[0], quota: d.quota, total: o.lignesTotal };
}
const cell = (l, titreCol) =>
  (l.cellules || []).find((c) => c.titre === titreCol) || {};

const sid = (p) => (p + Math.random().toString(36).slice(2, 10)).slice(0, 40);

/* ============================================================ */
const vie = await lire("");
console.log("VERSION DEPLOYEE : " + vie.version + "   (minimum exige : " + VERSION_MINIMALE + ")");
if (!(Number(vie.version) >= VERSION_MINIMALE)) {
  console.error("\nARRET — le deploiement est trop vieux pour etre juge.");
  process.exit(2);
}
const depart = await lire("action=diag");
console.log("QUOTA AU DEPART : " + depart.quota);
console.log("");
console.log("Cet outil va faire NAITRE trois lignes : trois courriels.");

/* ============================================================
   A · PROJET — L'INJECTION, PUIS LE RETOUR EN ARRIERE
   ============================================================ */
titre("A · DÉMARRER UN PROJET — injection de formule (D-757)");
const SA = sid("ZZTESTprojA");
{
  /* 1 · la naissance : le minimum vital, un courriel part. */
  const r1 = await poster({
    _form: "project", _sid: SA, _etape: 1, _etapes: 6,
    email: "zztest@exemple.ca", nom: "ZZTEST Avant"
  });
  dire("la ligne naît", r1.success, true, "réponse : " + JSON.stringify(r1));

  /* 2 · l'etape suivante porte les poisons. Aucun courriel. */
  const POISONS = {
    entreprise: "=1+1",
    description: '=IMPORTXML("https://exemple.ca/x","//a")',
    ville: "+41855501@42",
    budget: "-1+1"
  };
  const r2 = await poster(Object.assign({
    _form: "project", _sid: SA, _etape: 3, _etapes: 6,
    email: "zztest@exemple.ca"
  }, POISONS));
  dire("l'étape suivante est acceptée", r2.success, true);
  dire("elle FUSIONNE, elle ne crée pas de ligne", r2.session, true);

  /* 3 · ON LIT LE CLASSEUR AVANT DE NETTOYER. C'est la consigne, et
     c'est ce qui avait revele la faille : la VALEUR seule disait
     « 2 », ce qui ressemble a un texte anodin. */
  const t = await ligneDe("Démarrer un projet", "ZZTEST Avant");
  if (!t) { console.error("ARRET · la ligne d'essai est introuvable"); process.exit(2); }
  const l = t.ligne;
  console.log("         ligne " + l.ligne + " du classeur, quota " + t.quota);

  for (const [champ, envoye] of [
    ["Entreprise", POISONS.entreprise],
    ["Description", POISONS.description],
    ["Ville", POISONS.ville],
    ["Budget", POISONS.budget]
  ]) {
    const c = cell(l, champ);
    console.log("");
    console.log("    « " + champ + " »  valeur " + JSON.stringify(c.valeur)
      + "  formule " + JSON.stringify(c.formule) + "  format " + JSON.stringify(c.format));
    dire(champ + " : la cellule ne porte AUCUNE formule",
      String(c.formule || ""), "",
      "c'est getFormulas() qui tranche, jamais la valeur affichée");
    dire(champ + " : elle contient le texte envoyé, à l'identique",
      String(c.valeur || ""), envoye);
  }
}

titre("A · DÉMARRER UN PROJET — le retour en arrière (D-744)");
{
  /* LA MEME REQUETE PORTE LES DEUX MOITIES DE LA REGLE : une valeur
     CHANGEE et une valeur ABSENTE. Les separer ne prouverait que la
     moitie facile. */
  const r3 = await poster({
    _form: "project", _sid: SA, _etape: 4, _etapes: 6,
    email: "zztest@exemple.ca",
    nom: "ZZTEST Corrigé",          /* changé  → doit écraser */
    entreprise: "",                 /* absent  → ne doit rien toucher */
    description: "",                /* absent  → ne doit rien toucher */
    telephone: "418 555 0164"       /* nouveau → doit s'écrire */
  });
  dire("la correction est acceptée", r3.success, true);
  dire("elle fusionne encore", r3.session, true);

  const t = await ligneDe("Démarrer un projet", "ZZTEST Corrigé");
  if (!t) { console.error("ARRET · ligne corrigée introuvable"); process.exit(2); }
  const l = t.ligne;
  dire("le nom CHANGÉ a bien écrasé l'ancien",
    String(cell(l, "Nom").valeur || ""), "ZZTEST Corrigé");
  dire("l'entreprise ABSENTE n'a PAS été effacée",
    String(cell(l, "Entreprise").valeur || ""), "=1+1");
  dire("la description ABSENTE n'a PAS été effacée",
    String(cell(l, "Description").valeur || ""),
    '=IMPORTXML("https://exemple.ca/x","//a")');
  dire("le champ NOUVEAU s'est écrit",
    String(cell(l, "Téléphone").valeur || ""), "418 555 0164");
  dire("et rien n'est devenu une formule au passage",
    (l.cellules || []).filter((c) => String(c.formule || "") !== "").length, 0);

  /* UNE SEULE LIGNE POUR TOUTE LA SESSION. Trois envois, une ligne. */
  const d = await lire("action=diag");
  const o = d.onglets.find((x) => x.onglet === "Démarrer un projet");
  const portantes = (o.lignesEssai || []).filter((x) =>
    (x.cellules || []).some((c) => String(c.valeur || "").indexOf("ZZTEST Corrigé") !== -1));
  dire("trois envois, UNE seule ligne", portantes.length, 1);
}

/* ============================================================
   B · RÉFÉRER UNE ENTREPRISE — le référent, et le retour en arrière
   ============================================================ */
titre("B · RÉFÉRER UNE ENTREPRISE — le référent qu'on paie (D-759)");
const SB = sid("ZZTESTrefB");
{
  const r1 = await poster({
    _form: "refer", _sid: SB, _etape: 1, _etapes: 4,
    entreprise_referee: "ZZTEST Garage Bilodeau"
  });
  dire("la ligne naît sur le seul nom de l'entreprise", r1.success, true);

  await poster({
    _form: "refer", _sid: SB, _etape: 3, _etapes: 4,
    entreprise_referee: "ZZTEST Garage Bilodeau",
    contact_reference: "Marie Bilodeau, 418 555 0143",
    domaine: "Garage et mécanique",
    votre_nom: "ZZTEST Referent Avant",
    votre_email: "zztest@exemple.ca",
    votre_telephone: "819 555 0177",
    votre_entreprise: "ZZTEST Toiture Lachance",
    votre_lien: "Client ou fournisseur"
  });

  const t = await ligneDe("Référer une entreprise", "ZZTEST Garage Bilodeau");
  if (!t) { console.error("ARRET · ligne de référence introuvable"); process.exit(2); }
  const l = t.ligne;
  const titres = (l.cellules || []).map((c) => c.titre);

  dire("les colonnes du RÉFÉRENT sont nommées sans ambiguïté",
    titres.filter((x) => /^RÉFÉRENT · /.test(x)).length, 5,
    titres.filter((x) => /^RÉFÉRENT · /.test(x)).join(" | "));
  dire("son nom est là", String(cell(l, "RÉFÉRENT · nom").valeur || ""), "ZZTEST Referent Avant");
  dire("son téléphone est là", String(cell(l, "RÉFÉRENT · téléphone").valeur || ""), "819 555 0177");
  dire("son courriel est là", String(cell(l, "RÉFÉRENT · courriel").valeur || ""), "zztest@exemple.ca");
  dire("SON ENTREPRISE est là — c'est elle qu'on facture",
    String(cell(l, "RÉFÉRENT · entreprise").valeur || ""), "ZZTEST Toiture Lachance");
  dire("l'entreprise RÉFÉRÉE ne s'y confond pas",
    String(cell(l, "Entreprise référée").valeur || ""), "ZZTEST Garage Bilodeau");

  /* Le retour en arrière : il corrige son nom, il ne renvoie pas le reste. */
  await poster({
    _form: "refer", _sid: SB, _etape: 3, _etapes: 4,
    entreprise_referee: "ZZTEST Garage Bilodeau",
    votre_nom: "ZZTEST Referent Corrigé",
    votre_telephone: "", votre_entreprise: ""
  });
  const t2 = await ligneDe("Référer une entreprise", "ZZTEST Garage Bilodeau");
  const l2 = t2.ligne;
  dire("le nom corrigé a écrasé",
    String(cell(l2, "RÉFÉRENT · nom").valeur || ""), "ZZTEST Referent Corrigé");
  dire("le téléphone renvoyé VIDE n'a pas été effacé",
    String(cell(l2, "RÉFÉRENT · téléphone").valeur || ""), "819 555 0177");
  dire("son entreprise non plus",
    String(cell(l2, "RÉFÉRENT · entreprise").valeur || ""), "ZZTEST Toiture Lachance");
}

/* ============================================================
   C · RÉSERVER UN APPEL — le retour en arrière sans réserver
   ============================================================ */
titre("C · RÉSERVER UN APPEL — le retour en arrière (aucune plage prise)");
const SC = sid("ZZTESTbookC");
{
  const r1 = await poster({
    _form: "booking", _sid: SC, _etape: 1, _etapes: 3,
    email: "zztest@exemple.ca", nom: "ZZTEST Rdv Avant"
  });
  dire("la ligne naît sans poser de rendez-vous", r1.success, true);

  await poster({
    _form: "booking", _sid: SC, _etape: 2, _etapes: 3,
    email: "zztest@exemple.ca", nom: "ZZTEST Rdv Avant",
    telephone: "418 555 0191", entreprise: "ZZTEST Bilodeau inc",
    sujet: "un premier appel"
  });
  await poster({
    _form: "booking", _sid: SC, _etape: 2, _etapes: 3,
    email: "zztest@exemple.ca", nom: "ZZTEST Rdv Corrigé",
    telephone: "", entreprise: "", sujet: ""
  });

  const t = await ligneDe("Réserver un appel", "ZZTEST Rdv Corrigé");
  if (!t) { console.error("ARRET · ligne de réservation introuvable"); process.exit(2); }
  const l = t.ligne;
  dire("le nom corrigé a écrasé", String(cell(l, "Nom").valeur || ""), "ZZTEST Rdv Corrigé");
  dire("le téléphone vide n'a rien effacé",
    String(cell(l, "Téléphone").valeur || ""), "418 555 0191");
  dire("l'entreprise vide non plus",
    String(cell(l, "Entreprise").valeur || ""), "ZZTEST Bilodeau inc");
  /* LA COLONNE S'APPELLE « Sujet de l'appel », PAS « Sujet ».
     Ecrite de memoire, elle rendait "" — et l'outil accusait le code
     d'avoir efface une valeur parfaitement en place. Le titre se lit
     dans le SCHEMA, il ne s'invente pas. */
  dire("le sujet vide non plus",
    String(cell(l, "Sujet de l'appel").valeur || ""), "un premier appel");
  dire("aucun rendez-vous n'a été posé : la plage est vide",
    String(cell(l, "Plage demandée").valeur || ""), "");
}

/* ============================================================ */
const fin = await lire("action=diag");
console.log("");
console.log("QUOTA À LA FIN : " + fin.quota + "   (au départ : " + depart.quota + ")");
console.log("");
console.log("============================================================");
console.log(ko ? ("LE CLASSEUR NE DIT PAS LA VÉRITÉ : " + ko + " échec(s) sur " + n)
              : ("CE QUE LE CLASSEUR CONTIENT : " + n + " / " + n));
console.log("============================================================");
process.exit(ko ? 1 : 0);
