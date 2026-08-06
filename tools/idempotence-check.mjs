/* ============================================================
   UN REESSAI NE DOIT RIEN CASSER
   `node tools/idempotence-check.mjs`

   POURQUOI CET OUTIL EXISTE.
   Le 2026-08-06, le VRAI deploiement a rendu 2 reponses sur 36 en
   HTTP 404 — le renvoi de `/exec` vers `googleusercontent.com` qui
   tombe. Le site reessaie donc maintenant (D-734). Un reessai n'est
   sur QUE si le service est idempotent, et il ne l'etait pas :

     · une reservation reessayee se refusait elle-meme, parce que le
       premier essai avait deja pose l'evenement au calendrier ;
     · un projet reessaye televersait ses fichiers DEUX fois ;
     · les avis pouvaient partir deux fois.

   `traiter()` cherche desormais la signature AVANT tout effet de
   bord (D-730). Cet outil verifie que c'est vrai, sur le VRAI
   `Code.gs` execute par `tools/faux-google.mjs`.

   IL VERIFIE AUSSI L'INJECTION DE FORMULE (D-731) : qu'une valeur
   du visiteur commencant par `=` soit rangee dans une cellule au
   format TEXTE, donc jamais evaluee.

   CE QU'IL NE PROUVE PAS : que Google Sheets respecte bien le
   format `@` pose avant `setValues`. Le bouchon enregistre l'appel,
   il ne simule pas le moteur de calcul de Sheets. Verification a la
   main, une fois : `RESERVES.md`.
   ============================================================ */
import { pathToFileURL } from "node:url";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const { gs, etat } = await import(pathToFileURL(path.join(ICI, "faux-google.mjs")).href);

gs.initialiser();

let n = 0, ko = 0;
function dire(nom, obtenu, attendu) {
  n++;
  const ok = String(obtenu) === String(attendu);
  if (!ok) ko++;
  console.log("  " + (ok ? "OK   " : "ECHEC") + " " + nom
    + "\n         obtenu  : " + obtenu
    + "\n         attendu : " + attendu);
}
const poster = (c) => JSON.parse(gs.doPost({ postData: { contents: JSON.stringify(c) }, parameter: {} }).getContent());
const etatDe = () => ({
  courriels: etat.courriels.length,
  evenements: etat.evenements.length,
  fichiers: etat.fichiersDrive.length
});
const lignesDe = (onglet) => {
  const f = etat.feuilles.get(onglet);
  return f ? f.valeurs.slice(1).filter((r) => r.some((c) => c !== "" && c != null)).length : 0;
};

console.log("============================================================");
console.log("UN REESSAI NE DOIT RIEN CASSER");
console.log("============================================================");


/* ============================================================
   1 · UN CONTACT REESSAYE TROIS FOIS
   ============================================================ */
console.log("\n--- 1 · CONTACT, TROIS FOIS LA MEME DEMANDE");
{
  const charge = { _form: "contact", nom: "Ida Contact", email: "ida@exemple.ca",
                   message: "Exactement le meme message." };
  const av = etatDe();
  const a = poster(charge);
  const apres1 = etatDe();
  const b = poster(charge);
  const c = poster(charge);
  const ap = etatDe();

  dire("1er : ligne creee", a.success && a.renvoi === false, true);
  dire("2e : compte comme renvoi", b.renvoi, true);
  dire("3e : renvoi aussi", c.renvoi, true);
  dire("le compteur de renvois monte", b.renvois + "→" + c.renvois, "1→2");
  dire("une seule ligne au total", lignesDe("Contact simple"), 1);
  dire("DEUX courriels au total, pas six",
    ap.courriels - av.courriels, 2);
  dire("le 1er envoi a bien envoye les deux",
    apres1.courriels - av.courriels, 2);
}


/* ============================================================
   2 · UNE RESERVATION REESSAYEE — LE CAS QUI SE REFUSAIT LUI-MEME
   ============================================================ */
console.log("\n--- 2 · RESERVATION, DEUX FOIS LA MEME DEMANDE");
{
  const rep = JSON.parse(gs.doGet({ parameter: { action: "creneaux" } }).getContent());
  const iso = rep.jours[1].creneaux[2].iso;
  const charge = { _form: "booking", nom: "Ida Meet", email: "ida.meet@exemple.ca",
                   telephone: "418 555 0142", mode: "Google Meet", plage_iso: iso };

  const av = etatDe();
  const a = poster(charge);
  const b = poster(charge);
  const ap = etatDe();

  dire("1er : reserve", a.success && a.renvoi === false, true);
  dire("1er : rend un lien Meet", Boolean(a.meet), true);
  dire("2e : SUCCES (pas « plage deja prise »)", b.success, true);
  dire("2e : marque comme renvoi", b.renvoi, true);
  dire("2e : rend LE MEME lien Meet", b.meet, a.meet);
  dire("UN SEUL evenement au calendrier", ap.evenements - av.evenements, 1);
  dire("DEUX courriels, pas quatre", ap.courriels - av.courriels, 2);
  dire("une seule ligne", lignesDe("Réserver un appel"), 1);
}


/* ============================================================
   3 · UN PROJET AVEC FICHIER, REESSAYE
   ============================================================ */
console.log("\n--- 3 · PROJET AVEC PIECE JOINTE, DEUX FOIS");
{
  const charge = {
    _form: "project", nom: "Ida Projet", entreprise: "Ida inc",
    email: "ida.projet@exemple.ca", telephone: "418 555 0142",
    description: "Un projet.",
    _fichiers: [{ nom: "plan.pdf", type: "application/pdf",
                  base64: Buffer.from("un faux pdf").toString("base64") }]
  };
  const av = etatDe();
  const a = poster(charge);
  const b = poster(charge);
  const ap = etatDe();

  dire("1er : ligne creee", a.success && a.renvoi === false, true);
  dire("2e : renvoi", b.renvoi, true);
  dire("UN SEUL fichier sur Drive, pas deux", ap.fichiers - av.fichiers, 1);
  dire("une seule ligne", lignesDe("Démarrer un projet"), 1);
}


/* ============================================================
   4 · DEUX DEMANDES DIFFERENTES NE FUSIONNENT JAMAIS
   Un dedoublonnage trop zele coute deux vrais clients. C'est aussi
   grave qu'un doublon, et beaucoup moins visible.
   ============================================================ */
console.log("\n--- 4 · MEME COURRIEL, DEMANDES DIFFERENTES");
{
  const base = { _form: "contact", nom: "Ida Contact", email: "ida@exemple.ca" };
  const avant = lignesDe("Contact simple");
  const cas = [
    ["message different", { message: "Un message tout autre." }],
    ["casse differente", { message: "EXACTEMENT LE MEME MESSAGE." }],
    ["espaces multiples", { message: "Exactement  le  meme  message." }],
    ["accents", { message: "Exactement le même message." }],
    ["nom different", { nom: "Ida Contact 2", message: "Exactement le meme message." }]
  ];
  for (const [nom, extra] of cas) {
    const r = poster(Object.assign({}, base, extra));
    dire(nom + " : ligne DISTINCTE", r.renvoi === false, true);
  }
  dire("cinq lignes de plus", lignesDe("Contact simple") - avant, 5);
}


/* ============================================================
   5 · L'INJECTION DE FORMULE
   ============================================================ */
console.log("\n--- 5 · INJECTION DE FORMULE");
{
  const poisons = ["=1+1", '=IMPORTXML("http://exemple.ca","//a")',
                   "+1+1", "@SUM(A1:A9)", "-1+1"];
  for (const p of poisons) {
    const r = poster({ _form: "contact", nom: "Ida Poison " + p.slice(0, 6),
                       email: "poison@exemple.ca", message: p });
    dire("« " + p.slice(0, 22) + " » accepte", r.success, true);
  }

  const f = etat.feuilles.get("Contact simple");
  const titres = f.valeurs[0];
  const iMsg = titres.indexOf("Message") + 1;
  /* LA VALEUR EST RANGEE TELLE QUELLE — on ne la mutile pas. */
  const rangees = f.valeurs.slice(1).map((r) => r[iMsg - 1]).filter((v) => typeof v === "string");
  dire("les formules sont rangees SANS etre modifiees",
    rangees.filter((v) => poisons.indexOf(v) !== -1).length, poisons.length);

  /* LE FORMAT TEXTE EST POSE AVANT L'ECRITURE. Le bouchon retient
     l'ordre des appels : c'est ce qui distingue « format pose » de
     « format pose trop tard ». */
  dire("le format « @ » a ete pose sur les colonnes du visiteur",
    f.formatsTexte && f.formatsTexte.length > 0, true);
  dire("il a ete pose AVANT les valeurs, jamais apres",
    f.formatApresValeurs || 0, 0);
}


/* ============================================================
   6 · LE HONEYPOT N'ECRIT TOUJOURS RIEN
   ============================================================ */
console.log("\n--- 6 · HONEYPOT");
{
  const av = etatDe();
  const avantLignes = lignesDe("Contact simple");
  const r = poster({ _form: "contact", nom: "Robot", email: "robot@exemple.ca",
                     message: "Je suis un robot.", _gotcha: "rempli" });
  dire("succes rendu au robot", r.success, true);
  dire("marque ignore", r.ignore, true);
  dire("aucune ligne ecrite", lignesDe("Contact simple") - avantLignes, 0);
  dire("aucun courriel", etatDe().courriels - av.courriels, 0);
}


/* ============================================================
   7 · LE QUOTA EPUISE NE PERD JAMAIS LA DEMANDE
   ============================================================ */
console.log("\n--- 7 · QUOTA EPUISE");
{
  etat.quota = 0;
  const avantLignes = lignesDe("Urgence");
  const r = poster({ _form: "urgent", nom: "Ida Quota", telephone: "418 555 0142",
                     email: "quota@exemple.ca", message: "Le site est tombe." });
  dire("la demande passe quand meme", r.success, true);
  dire("la ligne est ecrite", lignesDe("Urgence") - avantLignes, 1);

  const f = etat.feuilles.get("Urgence");
  const iNotes = f.valeurs[0].indexOf("Notes internes");
  const note = String(f.valeurs[1][iNotes] || "");
  dire("le classeur PORTE la mention du quota epuise",
    /QUOTA D’ENVOI ÉPUISÉ/.test(note), true);
  console.log("         note : " + note.slice(0, 90));
  etat.quota = 100;
}


/* ============================================================
   8 · REPONDRE A L'AVIS ECRIT AU CLIENT
   ============================================================ */
console.log("\n--- 8 · REPLY-TO SUR L'AVIS INTERNE");
{
  etat.courriels.length = 0;
  poster({ _form: "contact", nom: "Ida ReplyTo", email: "ida.replyto@exemple.ca",
           message: "Une demande pour verifier le Reply-To." });
  const avis = etat.courriels.find((c) => /^\[APED\]/.test(c.subject));
  const conf = etat.courriels.find((c) => !/^\[APED\]/.test(c.subject));
  dire("l'avis interne porte un Reply-To", avis && avis.replyTo, "ida.replyto@exemple.ca");
  dire("il part bien vers la boite de l'agence", avis && avis.to, gs.notifDest());
  dire("le corps annonce que « Repondre » ecrit au client",
    avis && /« Répondre » à ce message écrit directement à/.test(avis.body), true);
  dire("la confirmation au visiteur n'a PAS de Reply-To",
    conf && conf.replyTo === undefined, true);
  dire("l'objet porte l'heure",
    avis && /· \d{1,2} h \d{2}$/.test(avis.subject), true);
  console.log("         objet : " + (avis && avis.subject));
}


/* ============================================================
   9 · LE CLASSEUR VU UN LUNDI MATIN
   ============================================================ */
console.log("\n--- 9 · L'ORDRE DES COLONNES ET LA MISE EN FORME");
{
  const cols = gs.colonnes("project").map((c) => c.titre);
  dire("colonne A = Horodatage", cols[0], "Horodatage");
  dire("colonne B = Statut (pas au bout)", cols[1], "Statut");
  dire("le nom vient juste apres", cols[2], "Nom");
  console.log("         ordre : " + cols.slice(0, 6).join(" | ") + " | … | "
    + cols.slice(-4).join(" | "));

  const f = etat.feuilles.get("Démarrer un projet");
  dire("une regle de mise en forme est posee", f.regles.length, 1);
  const r = f.regles[0];
  const iLu = f.valeurs[0].indexOf("Lu par") + 1;
  const lettre = gs.colonneLettre(iLu);
  dire("elle juge bien la colonne « Lu par »",
    r.formule.indexOf("$" + lettre + '2=""') !== -1, true);
  dire("elle ne colore que les lignes qui EXISTENT",
    r.formule.indexOf('$A2<>""') !== -1, true);
  console.log("         formule : " + r.formule);

  /* RELANCER `initialiser()` NE DOIT PAS EMPILER LES REGLES. */
  gs.initialiser();
  gs.initialiser();
  dire("trois passages d'initialiser() = toujours UNE regle",
    etat.feuilles.get("Démarrer un projet").regles.length, 1);
}

/* ============================================================
   10 · LA MIGRATION NE DECALE PAS LES DONNEES
   On simule un classeur d'AVANT le deplacement de « Statut » :
   en-tetes dans l'ancien ordre, une ligne dessous. `initialiser()`
   doit redisposer la ligne, pas la laisser glisser.
   ============================================================ */
console.log("\n--- 10 · MIGRATION D'UN CLASSEUR DEJA REMPLI");
{
  const nom = "Contact simple";
  const f = etat.feuilles.get(nom);
  const voulus = gs.colonnes("contact").map((c) => c.titre);
  /* L'ancien ordre : Statut a sa place d'avant, juste avant la
     signature. */
  const anciens = ["Horodatage"].concat(
    voulus.filter((t) => t !== "Horodatage" && t !== "Statut" && t !== "Signature"),
    ["Statut", "Signature"]);

  f.valeurs.length = 0;
  f.valeurs.push(anciens.slice());
  const ligne = anciens.map((t) => "val:" + t);
  f.valeurs.push(ligne);

  gs.initialiser();

  const apres = f.valeurs[0];
  const donnees = f.valeurs[1];
  dire("les en-tetes sont dans le nouvel ordre", apres.join("|"), voulus.join("|"));
  const decalees = voulus.filter((t, i) => donnees[i] !== "val:" + t);
  dire("chaque valeur a suivi son en-tete",
    decalees.length ? decalees.join(", ") : "aucune decalee", "aucune decalee");
  console.log("         ex. : « " + voulus[1] + " » porte « " + donnees[1] + " »");
}

console.log("\n============================================================");
console.log(ko === 0 ? "TOUT TIENT : " + n + " / " + n : "DEFAUTS : " + ko + " sur " + n);
console.log("============================================================");
process.exit(ko === 0 ? 0 : 1);
