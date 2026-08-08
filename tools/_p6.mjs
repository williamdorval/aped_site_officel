import { poster, ligneDe, val, formuleDe, dire, titre, etat, bilan } from "./prod-parcours.mjs";

const av = await etat("AVANT");
const pause = (ms) => new Promise((s) => setTimeout(s, ms));

/* ============================================================
   8 · L'INJECTION DE FORMULE, CONTRE LE VRAI SHEETS

   LE BANC A DEJA MENTI LA-DESSUS (D-757) : l'injection a ete
   trouvee OUVERTE contre le vrai Google apres des mois passes a
   croire le contraire. C'est le seul point de tout ce chantier
   qu'un banc ne peut pas trancher.

   ET ELLE SE REARME A LA FUSION. Ecrire est un chemin ; REECRIRE la
   ligne entiere a l'etape suivante en est un autre, et c'est celui
   qui avait ete oublie. On teste les deux.
   ============================================================ */
titre("8 · INJECTION DE FORMULE — a l'ecriture ET a la fusion (D-757, piege 93)");
{
  const sid = "ZZTESTinject" + String(Date.now()).slice(-6);
  const POISONS = [
    ["=1+1", "l'egal nu"],
    ["+1+1", "le plus"],
    ["-1+1", "le moins"],
    ["@SUM(A1:A9)", "l'arobase"],
    ["=IMPORTXML(\"https://exemple.ca/x\",\"//a\")", "IMPORTXML"],
    ["=HYPERLINK(\"https://exemple.ca\",\"clic\")", "HYPERLINK"],
    ["\t=1+1", "la tabulation de tete"],
    [" =1+1", "l'espace de tete"]
  ];

  /* --- 1 · A L ECRITURE, dans les champs LIBRES ---
     Un premier jet mettait le poison dans le TELEPHONE et la VILLE :
     la validation les refuse avant tout, donc aucune ligne n etait
     ecrite et le test ne touchait jamais le chemin d injection. La
     defense etait bonne, la sonde ne mesurait rien. Le poison va
     desormais la ou du texte libre est ATTENDU. */
  const r1 = await poster({ _form: "project", _sid: sid, _etape: 2, _etapes: 8,
    nom: "ZZTESTinject Poison", entreprise: POISONS[0][0],
    email: "zztest@exemple.ca", telephone: "418 555 0209",
    ville: "Levis", description: POISONS[3][0] });
  dire("l ecriture empoisonnee est acceptee", r1.success, true, JSON.stringify(r1).slice(0, 160));
  await pause(1800);

  const L1 = await ligneDe("Démarrer un projet", sid);
  for (const nom of ["Entreprise", "Description"]) {
    dire("« " + nom + " » n est PAS une formule", formuleDe(L1, nom), "",
      "valeur lue : " + JSON.stringify(val(L1, nom)));
  }

  /* --- 2 · A LA FUSION, le poison arrive a l etape SUIVANTE --- */
  const r2 = await poster({ _form: "project", _sid: sid, _etape: 5, _etapes: 8,
    nom: "ZZTESTinject Poison", entreprise: POISONS[0][0],
    email: "zztest@exemple.ca", telephone: "418 555 0209", ville: "Levis",
    description: POISONS[4][0], besoins: "Site vitrine",
    site_actuel: POISONS[5][0], bloque: POISONS[2][0] });
  dire("la fusion est acceptee", r2.success, true, JSON.stringify(r2).slice(0, 160));
  await pause(1800);

  const L2 = await ligneDe("Démarrer un projet", sid);
  for (const nom of ["Entreprise", "Description", "Site actuel", "Ce qui les bloque"]) {
    dire("apres FUSION, « " + nom + " » n est pas une formule",
      formuleDe(L2, nom), "", "valeur lue : " + JSON.stringify(val(L2, nom)).slice(0, 70));
  }

  /* --- 3 · LES PREFIXES A ESPACE DE TETE, jamais eprouves en vrai --- */
  const sid2 = "ZZTESTinjEsp" + String(Date.now()).slice(-6);
  await poster({ _form: "contact", nom: "ZZTESTinjEsp Espace",
    email: "zztest@exemple.ca", telephone: "418 555 0210",
    message: POISONS[6][0] + " | " + POISONS[7][0] });
  await pause(1800);
  const L3 = await ligneDe("Contact simple", "ZZTESTinjEsp");
  dire("un poison a espace ou tabulation de tete reste du texte",
    formuleDe(L3, "Message"), "", "valeur lue : " + JSON.stringify(val(L3, "Message")));
}

/* ============================================================
   9 · LES CAS TORDUS
   ============================================================ */
titre("9 · CHAMPS VIDES, TEXTES ENORMES, HONEYPOT, DOUBLE CLIC");
{
  const vide = await poster({ _form: "contact", nom: "", email: "", telephone: "", message: "" });
  dire("un formulaire vide est refuse", vide.success, false, JSON.stringify(vide).slice(0, 140));

  const malAdresse = await poster({ _form: "contact", nom: "ZZTEST Mauvais",
    email: "pas-une-adresse", telephone: "418 555 0211", message: "ZZTEST" });
  dire("un courriel invalide est refuse", malAdresse.success, false,
    JSON.stringify(malAdresse).slice(0, 140));

  /* LE HONEYPOT REND UN FAUX SUCCES ET N'ECRIT RIEN : repondre
     « refuse » apprendrait au robot qu'il a ete vu. */
  const avantH = (await ligneDe("Contact simple", "ZZTESTrobot")) ? 1 : 0;
  const robot = await poster({ _form: "contact", _gotcha: "je suis un robot",
    nom: "ZZTESTrobot", email: "zztest@exemple.ca", telephone: "418 555 0212",
    message: "ZZTEST robot" });
  dire("le honeypot rend un succes muet", robot.success, true, JSON.stringify(robot).slice(0, 140));
  await pause(1500);
  dire("mais AUCUNE ligne n'est ecrite",
    (await ligneDe("Contact simple", "ZZTESTrobot")) ? 1 : 0, avantH);

  /* UN TEXTE ENORME. La borne des descriptions est a 5 000. */
  const enorme = "ZZTESTlong " + "é".repeat(12000);
  const trop = await poster({ _form: "contact", nom: "ZZTESTlong Texte",
    email: "zztest@exemple.ca", telephone: "418 555 0213", message: enorme });
  dire("un texte de 12 000 signes est refuse proprement", trop.success, false,
    JSON.stringify(trop).slice(0, 160));

  /* LE DOUBLE CLIC : deux envois identiques, a la suite. */
  const charge = { _form: "contact", nom: "ZZTESTdouble Clic",
    email: "zztest@exemple.ca", telephone: "418 555 0214",
    message: "ZZTEST — double clic." };
  const d1 = await poster(charge);
  const d2 = await poster(charge);
  dire("le premier envoi passe", d1.success, true);
  dire("le second est reconnu comme un RENVOI", d2.renvoi, true,
    JSON.stringify(d2).slice(0, 160));
  dire("et il vise la MEME ligne", d2.ligne, d1.ligne,
    "deux lignes pour un double clic, c'est un client compte deux fois");

  /* UN FORMULAIRE INCONNU. */
  const inconnu = await poster({ _form: "__proto__", nom: "ZZTEST", email: "zztest@exemple.ca" });
  dire("un formulaire de la chaine de prototypes est refuse", inconnu.success, false,
    JSON.stringify(inconnu).slice(0, 140));
}

const ap = await etat("APRES");
console.log("         quota consomme : " + (av.quota - ap.quota));
process.exit(bilan("INJECTION + CAS TORDUS") ? 1 : 0);
