import { poster, ligneDe, val, dire, titre, etat, bilan } from "./prod-parcours.mjs";

const av = await etat("AVANT");

/* ============================================================
   2 · URGENCE
   ============================================================ */
titre("2 · URGENCE — l'ordre des colonnes a change (D-781)");
{
  const M = "ZZTESTurgence";
  const r = await poster({
    _form: "urgent",
    nom: M + " Gagnon", entreprise: "ZZTEST Garage inc",
    telephone: "418 555 0155", email: "zztest@exemple.ca",
    gravite: "Le site est en panne", depuis_quand: "Depuis ce matin",
    systeme: "Le site au complet",
    message: "ZZTEST — plus rien ne repond depuis 8 h.",
    impact: "On ne prend plus de rendez-vous."
  });
  dire("le service accepte", r.success, true, JSON.stringify(r).slice(0, 160));
  await new Promise((s) => setTimeout(s, 1500));

  const L = await ligneDe("Urgence", M);
  dire("la ligne est dans « Urgence »", !!L, true);
  dire("le nom", val(L, "Nom"), M + " Gagnon");
  dire("l'entreprise", val(L, "Entreprise"), "ZZTEST Garage inc");
  dire("le telephone", val(L, "Téléphone"), "418 555 0155");
  dire("la gravite", val(L, "Gravité"), "Le site est en panne");
  dire("ce qui est touche", val(L, "Quoi est touché"), "Le site au complet");
  dire("l'urgence elle-meme", /plus rien ne repond/.test(val(L, "L'urgence")), true);

  /* L'ORDRE, RELEVE DANS LE VRAI CLASSEUR.  D-781
     « Urgence » a ete retournee : sur une urgence on ne lit pas, on
     APPELLE. Le numero doit venir avant la description. */
  const noms = (L.cellules || []).map((c) => c.titre);
  const iTel = noms.indexOf("Téléphone"), iGrav = noms.indexOf("Gravité");
  dire("le telephone vient AVANT la gravite", iTel < iGrav && iTel > 0, true,
    "telephone en " + (iTel + 1) + ", gravite en " + (iGrav + 1));
}

/* ============================================================
   3 · LEAD MAGNET — LES PIECES JOINTES, JAMAIS EPROUVEES
   ============================================================ */
titre("3 · LEAD MAGNET — les deux guides en pieces jointes (D-788)");
{
  /* L'ADRESSE EST CELLE DU PROPRIETAIRE, ET C'EST VOULU. Aucun outil
     ne sait lire une boite de courriel : la seule facon de prouver
     que les deux PDF arrivent, complets et ouvrables, est qu'un
     humain les ouvre. La ligne reste marquee par `origine`, donc
     elle sort par `diagnostic()` et `nettoyerAutotest()` la retire. */
  const M = "ZZTESTguides";
  const r = await poster({
    _form: "cadeau",
    email: "dorvalwilliam11@gmail.com",
    telephone: "819 523-0871",
    documents: "Automatisation (42 p.) + IA et croissance (49 p.)",
    origine: M + " — verification des pieces jointes"
  });
  dire("le service accepte", r.success, true, JSON.stringify(r).slice(0, 160));
  await new Promise((s) => setTimeout(s, 2500));

  const L = await ligneDe("Lead magnet", M);
  dire("la ligne est dans « Lead magnet »", !!L, true);
  dire("le courriel", val(L, "Courriel"), "dorvalwilliam11@gmail.com");
  dire("le telephone", val(L, "Téléphone"), "819 523-0871");
  dire("les documents demandes", /Automatisation/.test(val(L, "Documents")), true);
  dire("l'origine porte le marqueur", /ZZTESTguides/.test(val(L, "Origine")), true);
}

const ap = await etat("APRES");
/* QUATRE ENVOIS ATTENDUS : urgence (avis + confirmation) et lead
   magnet (avis + le courriel qui porte les deux guides). Le lead
   magnet n'en envoyait AUCUN au visiteur avant D-788. */
dire("QUATRE courriels sont partis", av.quota - ap.quota, 4,
  "urgence 2 + lead magnet 2 — le second est neuf, c'est lui qui porte les guides");

process.exit(bilan("URGENCE + LEAD MAGNET") ? 1 : 0);
