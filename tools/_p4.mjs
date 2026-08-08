import { poster, ligneDe, val, formuleDe, dire, titre, etat, bilan, diag } from "./prod-parcours.mjs";

const av = await etat("AVANT");
const pause = (ms) => new Promise((s) => setTimeout(s, ms));

/* ============================================================
   5 · PROJET — sept ecrans, le retour en arriere, la fourchette
   ============================================================ */
titre("5 · PROJET — les etapes, le retour en arriere, la fourchette");
{
  const sid = "ZZTESTprojet" + String(Date.now()).slice(-6);
  const M = sid;

  const r1 = await poster({ _form: "project", _sid: sid, _etape: 2, _etapes: 8,
    nom: "ZZTESTprojet Bouchard", entreprise: "ZZTEST Toiture inc",
    email: "zztest@exemple.ca", telephone: "418 555 0177" });
  dire("l'etape 2 ouvre la ligne", r1.success, true, JSON.stringify(r1).slice(0, 140));
  const ligne1 = r1.ligne;
  await pause(1200);

  const r2 = await poster({ _form: "project", _sid: sid, _etape: 5, _etapes: 8,
    nom: "ZZTESTprojet Bouchard", entreprise: "ZZTEST Toiture inc",
    email: "zztest@exemple.ca", telephone: "418 555 0177",
    ville: "Levis", domaine: "Construction et renovation",
    besoins: "Site vitrine", ampleur: "6 à 15 — un vrai site" });
  dire("l'etape 5 complete la MEME ligne", r2.ligne, ligne1);
  await pause(1200);

  /* LE RETOUR EN ARRIERE : le visiteur corrige la ville a l'ecran 3
     apres etre alle jusqu'au 5. La correction doit ecraser, et
     l'etape ne doit PAS reculer. */
  const r3 = await poster({ _form: "project", _sid: sid, _etape: 3, _etapes: 8,
    nom: "ZZTESTprojet Bouchard", entreprise: "ZZTEST Toiture inc",
    email: "zztest@exemple.ca", telephone: "418 555 0177",
    ville: "Quebec", domaine: "Construction et renovation",
    besoins: "Site vitrine", ampleur: "6 à 15 — un vrai site" });
  dire("le retour en arriere est accepte", r3.success, true);
  await pause(1500);
  const Lr = await ligneDe("Démarrer un projet", M);
  dire("la ville corrigee a bien ecrase l'ancienne", val(Lr, "Ville"), "Quebec");
  dire("et « Etape » n'a PAS recule",
    /5 \/ 8|✓/.test(val(Lr, "Étape")), true, val(Lr, "Étape"));

  /* L'ENVOI FINAL, AVEC LES CLES EXACTES DE L'ESTIMATEUR DE PROJET. */
  const rf = await poster({ _form: "project", _sid: sid, _final: true, _etape: 8, _etapes: 8,
    nom: "ZZTESTprojet Bouchard", entreprise: "ZZTEST Toiture inc",
    email: "zztest@exemple.ca", telephone: "418 555 0177",
    ville: "Quebec", domaine: "Construction et renovation",
    besoins: "Site vitrine", ampleur: "6 à 15 — un vrai site",
    budget: "10 000 $ et plus", echeancier: "D’ici 1 à 2 mois",
    niveau_design: "Essentiel — propre, rapide, efficace", nombre_employes: "2 à 10",
    description: "ZZTEST — refonte complete, accents éèàçù." });
  dire("l'envoi final passe", rf.success, true, JSON.stringify(rf).slice(0, 200));
  await pause(1800);

  const L = await ligneDe("Démarrer un projet", M);
  dire("le nom", val(L, "Nom"), "ZZTESTprojet Bouchard");
  dire("l'entreprise", val(L, "Entreprise"), "ZZTEST Toiture inc");
  dire("le telephone", val(L, "Téléphone"), "418 555 0177");
  dire("le budget", val(L, "Budget"), "10 000 $ et plus");
  dire("la description, accents compris", /accents éèàçù/.test(val(L, "Description")), true);
  dire("« Etape » dit complete", /complète|✓/.test(val(L, "Étape")), true, val(L, "Étape"));
  dire("UNE seule ligne du debut a la fin", L.ligne, ligne1);
  dire("« Fourchette vue » est ecrite", val(L, "Fourchette vue").length > 3, true,
    val(L, "Fourchette vue"));
}

/* ============================================================
   6 · REFERENCE — les deux cotes, et la preuve d'acceptation
   ============================================================ */
titre("6 · REFERENCE — l'acceptation, sa version, son heure (D-773)");
{
  const sid = "ZZTESTrefer" + String(Date.now()).slice(-6);
  const M = sid;

  /* SANS ACCEPTATION, L'ENVOI FINAL NE PASSE PAS. C'est la regle
     serveur de D-773 : la case du site sert au visiteur, le refus
     est ici. */
  const sansAcc = await poster({ _form: "refer", _sid: sid, _final: true, _etape: 8, _etapes: 8,
    votre_nom: "ZZTESTrefer Lavoie", votre_email: "zztest@exemple.ca",
    votre_lien: "Ami ou famille", entreprise_referee: "ZZTEST Depanneur inc",
    contact_reference: "Marie Tremblay" });
  dire("un envoi final SANS acceptation est refuse", sansAcc.success, false,
    JSON.stringify(sansAcc).slice(0, 160));

  const fausseV = await poster({ _form: "refer", _sid: sid, _final: true, _etape: 8, _etapes: 8,
    votre_nom: "ZZTESTrefer Lavoie", votre_email: "zztest@exemple.ca",
    votre_lien: "Ami ou famille", entreprise_referee: "ZZTEST Depanneur inc",
    contact_reference: "Marie Tremblay",
    conditions_acceptees: "oui", conditions_version: "2099-01-01" });
  dire("une version de conditions inventee est refusee", fausseV.success, false,
    JSON.stringify(fausseV).slice(0, 160));

  const ok = await poster({ _form: "refer", _sid: sid, _final: true, _etape: 8, _etapes: 8,
    votre_nom: "ZZTESTrefer Lavoie", votre_email: "zztest@exemple.ca",
    votre_telephone: "418 555 0188", votre_entreprise: "ZZTEST Lavoie inc",
    votre_lien: "Ami ou famille", votre_versement: "Virement Interac",
    entreprise_referee: "ZZTEST Depanneur inc", contact_reference: "Marie Tremblay",
    domaine: "Commerce de detail", taille: "6 à 25 personnes",
    besoin: "Un site web", contexte: "ZZTEST — elle cherche depuis un bout.",
    conditions_acceptees: "oui", conditions_version: "2026-08-07-b" });
  dire("avec l'acceptation et la bonne version, ca passe", ok.success, true,
    JSON.stringify(ok).slice(0, 160));
  await pause(1800);

  const L = await ligneDe("Référer une entreprise", M);
  dire("l'entreprise referee", val(L, "Entreprise référée"), "ZZTEST Depanneur inc");
  dire("la personne a contacter", val(L, "Personne à contacter"), "Marie Tremblay");
  dire("le referent, nom", val(L, "RÉFÉRENT · nom"), "ZZTESTrefer Lavoie");
  dire("le referent, telephone", val(L, "RÉFÉRENT · téléphone"), "418 555 0188");
  dire("le lien avec elle", val(L, "RÉFÉRENT · lien avec elle"), "Ami ou famille");
  dire("l'acceptation est enregistree", val(L, "Conditions acceptées"), "oui");
  dire("AVEC SA VERSION", val(L, "Version acceptée"), "2026-08-07-b");
  dire("et l'heure, posee par le SERVEUR", val(L, "Acceptées le").length > 8, true,
    val(L, "Acceptées le"));
}

const ap = await etat("APRES");
console.log("         quota consomme : " + (av.quota - ap.quota));
process.exit(bilan("PROJET + REFERENCE") ? 1 : 0);
