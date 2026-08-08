import { poster, ligneDe, val, dire, titre, etat, bilan } from "./prod-parcours.mjs";

const av = await etat("AVANT");
const pause = (ms) => new Promise((s) => setTimeout(s, ms));

/* ============================================================
   4 · ESTIMATION — la session signee, la fourchette, la note
   ============================================================ */
titre("4 · ESTIMATION — sauvegarde progressive et jeton signe (D-786)");
let sid = "ZZTESTestim" + String(Date.now()).slice(-6);
{
  const M = sid;   /* le sid est unique a chaque passe : c est LUI le marqueur */

  /* --- etape 2 : rien qu'une adresse, la ligne nait --- */
  const r1 = await poster({ _form: "estimate", _sid: sid, _etape: 2, _etapes: 7,
    email: "zztest@exemple.ca", type_de_projet: "Une boutique en ligne" });
  dire("l'etape 2 est acceptee", r1.success, true, JSON.stringify(r1).slice(0, 160));
  dire("le serveur rend un jeton", typeof r1.jeton === "string" && r1.jeton.length > 10, true);
  dire("le jeton n'est pas le `_sid`", r1.jeton === sid, false);
  const ligne1 = r1.ligne;
  await pause(1200);

  /* --- UN JETON FORGE, CONTRE LE VRAI SERVICE --- */
  const forge = await poster({ _form: "estimate", _sid: sid, _etape: 3, _etapes: 7,
    _jeton: "jeton-forge-de-la-bonne-longueur-ou-presque",
    nom: "PIRATE", email: "pirate@exemple.ca", telephone: "9999999999" });
  dire("un jeton FORGE est refuse", forge.success, false, JSON.stringify(forge).slice(0, 160));

  const sans = await poster({ _form: "estimate", _sid: sid, _etape: 3, _etapes: 7,
    _jeton: null, nom: "PIRATE2", email: "pirate2@exemple.ca" });
  dire("aucun jeton sur une ligne existante : refuse", sans.success, false);
  await pause(1200);

  const apAttaque = await ligneDe("Estimation rapide", M);
  dire("la ligne n'a pas ete corrompue", val(apAttaque, "Courriel"), "zztest@exemple.ca");
  dire("ni le nom", /PIRATE/.test(val(apAttaque, "Nom")), false, val(apAttaque, "Nom"));

  /* --- etape 4 : la MEME ligne se complete --- */
  const r2 = await poster({ _form: "estimate", _sid: sid, _etape: 4, _etapes: 7,
    email: "zztest@exemple.ca", type_de_projet: "Une boutique en ligne",
    ampleur: "25 à 250 produits", fonctions: "Le paiement en ligne" });
  dire("l'etape 4 passe avec le jeton", r2.success, true);
  dire("c'est la MEME ligne", r2.ligne, ligne1,
    "une seule ligne qui se complete : tout le point de la sauvegarde progressive");
  await pause(1200);

  /* --- l'envoi final : coordonnees, fourchette --- */
  const r3 = await poster({ _form: "estimate", _sid: sid, _final: true, _etape: 7, _etapes: 7,
    nom: "ZZTESTestim Roy", email: "zztest@exemple.ca", telephone: "418 555 0166",
    type_de_projet: "Une boutique en ligne", ampleur: "25 à 250 produits",
    fonctions: "Le paiement en ligne", niveau_design: "Propre et rapide", contenu: "Mes textes et mes photos sont prêts",
    echeancier: "Dans 1 à 3 mois", taille_equipe: "1 à 5 personnes" });
  dire("l'envoi final passe", r3.success, true, JSON.stringify(r3).slice(0, 200));
  dire("le serveur rend une fourchette", !!(r3.fourchette && (r3.fourchette.texte || r3.fourchette.sansPrix || r3.fourchette.horsEchelle)), true,
    JSON.stringify(r3.fourchette));
  await pause(1500);

  const L = await ligneDe("Estimation rapide", M);
  dire("le nom est arrive", val(L, "Nom"), "ZZTESTestim Roy");
  dire("le telephone aussi", val(L, "Téléphone"), "418 555 0166");
  dire("« Etape » dit complete", /complète|✓/.test(val(L, "Étape")), true, val(L, "Étape"));
  dire("« Fourchette vue » est ecrite au classeur", val(L, "Fourchette vue").length > 3, true,
    val(L, "Fourchette vue"));
  dire("toujours UNE seule ligne", L.ligne, ligne1);

  /* --- la reaction au prix, et sa raison --- */
  /* LE NAVIGATEUR RENVOIE LE FORMULAIRE ENTIER A CHAQUE FOIS, jamais
     le seul champ qui vient de changer. Un premier jet n envoyait que
     la reaction : le serveur a repondu « Il manque ce qui permettrait
     de vous rappeler », et il avait raison — c est MON envoi qui
     n etait pas celui d un navigateur. */
  const r4 = await poster({ _form: "estimate", _sid: sid, _etape: 7, _etapes: 7,
    nom: "ZZTESTestim Roy", email: "zztest@exemple.ca", telephone: "418 555 0166",
    type_de_projet: "Une boutique en ligne", ampleur: "25 à 250 produits",
    fonctions: "Le paiement en ligne", niveau_design: "Propre et rapide",
    contenu: "Mes textes et mes photos sont prêts",
    prix_reaction: "Non", prix_raison: "ZZTEST — plus haut que mon budget" });
  dire("la reaction au prix est acceptee", r4.success, true, JSON.stringify(r4).slice(0, 120));
  await pause(1500);
  const L2 = await ligneDe("Estimation rapide", M);
  dire("« Ca convient ? » est enregistre", val(L2, "Ça convient ?"), "Non");
  dire("et la raison aussi", /plus haut que mon budget/.test(val(L2, "Pourquoi pas")), true,
    val(L2, "Pourquoi pas"));
  dire("la fourchette n'a PAS ete reecrite", val(L2, "Fourchette vue"), val(L, "Fourchette vue"),
    "colonne figee : une preuve qui se modifie n'est pas une preuve");
}

const ap = await etat("APRES");
console.log("         quota consomme : " + (av.quota - ap.quota));

process.exit(bilan("ESTIMATION") ? 1 : 0);
