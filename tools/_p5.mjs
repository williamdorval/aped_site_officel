import { poster, ligneDe, val, dire, titre, etat, bilan } from "./prod-parcours.mjs";
import fs from "node:fs";

const env = fs.readFileSync(".env.local", "utf8");
const SERVICE = (/^ADEXWEB_WEB_APP_URL=(.+)$/m.exec(env))[1].trim();
const pause = (ms) => new Promise((s) => setTimeout(s, ms));

async function creneaux() {
  const r = await fetch(SERVICE + "?action=creneaux", { redirect: "follow" });
  return JSON.parse(await r.text());
}
/* Un creneau libre, le plus loin possible : on evite le preavis. */
function libre(c, saut) {
  const j = (c.jours || []).filter((x) => (x.creneaux || []).length > (saut + 1)).pop();
  return j ? { date: j.date, ...j.creneaux[saut] } : null;
}

const av = await etat("AVANT");

titre("7 · RESERVATION — telephone puis Meet, et l'heure partout pareille");
{
  const c0 = await creneaux();
  const t1 = libre(c0, 1);
  const t2 = libre(c0, 3);
  if (!t1 || !t2) { console.error("ARRET  pas assez de creneaux libres pour deux essais."); process.exit(2); }
  console.log("         creneau telephone : " + t1.date + " " + t1.h + "  (" + t1.iso + ")");
  console.log("         creneau Meet      : " + t2.date + " " + t2.h + "  (" + t2.iso + ")");

  /* ---------- mode TELEPHONE ---------- */
  const sidA = "ZZTESTrdvTel" + String(Date.now()).slice(-6);
  const a1 = await poster({ _form: "booking", _sid: sidA, _etape: 2, _etapes: 3,
    nom: "ZZTESTrdvTel Fortin", email: "zztest@exemple.ca",
    telephone: "418 555 0199", mode: "Appel téléphonique",
    plage_iso: t1.iso, plage_demandee: t1.h });
  dire("l'etape 2 ouvre la ligne", a1.success, true, JSON.stringify(a1).slice(0, 140));
  await pause(1200);

  const aF = await poster({ _form: "booking", _sid: sidA, _final: true, _etape: 3, _etapes: 3,
    nom: "ZZTESTrdvTel Fortin", email: "zztest@exemple.ca",
    telephone: "418 555 0199", mode: "Appel téléphonique",
    plage_iso: t1.iso, plage_demandee: t1.h,
    sujet: "ZZTEST — un appel d'essai." });
  dire("la confirmation finale passe", aF.success, true, JSON.stringify(aF).slice(0, 200));
  dire("un appel telephonique n'a PAS de lien Meet", String(aF.meet || ""), "");
  await pause(2500);

  const LA = await ligneDe("Réserver un appel", sidA);
  dire("la ligne est dans « Réserver un appel »", !!LA, true);
  dire("le mode", val(LA, "Mode"), "Appel téléphonique");
  dire("le telephone", val(LA, "Téléphone"), "418 555 0199");
  /* LE CLASSEUR GARDE LE LIBELLE COMPLET, PAS LA SEULE HEURE.
     Le serveur reecrit « plage_demandee » en « vendredi 18 septembre
     2026 a 9 h 45 » : l ecran n a besoin que de l heure, le classeur
     a besoin de la date. Ma sonde exigeait l egalite stricte et
     accusait un service qui fait MIEUX que ce qu elle demandait.
     Ce qui doit tenir, c est que l heure de l ecran s y retrouve. */
  dire("l heure de l ecran se retrouve au classeur",
    val(LA, "Plage demandée").indexOf(t1.h) !== -1, true,
    "ecran : " + t1.h + "  ·  classeur : " + val(LA, "Plage demandée"));
  dire("et la date aussi", val(LA, "Plage demandée").indexOf("2026") !== -1, true);
  dire("« Début » est pose", val(LA, "Début").length > 8, true, val(LA, "Début"));
  dire("« Événement » porte un identifiant d'agenda", val(LA, "Événement").length > 3, true,
    val(LA, "Événement"));
  dire("aucun lien Meet au classeur", val(LA, "Lien Meet"), "");

  /* ---------- mode MEET ---------- */
  const sidB = "ZZTESTrdvMeet" + String(Date.now()).slice(-6);
  const bF = await poster({ _form: "booking", _sid: sidB, _final: true, _etape: 3, _etapes: 3,
    nom: "ZZTESTrdvMeet Cote", entreprise: "ZZTEST Cote inc",
    email: "zztest@exemple.ca", telephone: "418 555 0200", mode: "Google Meet",
    plage_iso: t2.iso, plage_demandee: t2.h,
    sujet: "ZZTEST — une rencontre d'essai." });
  dire("la reservation Meet passe", bF.success, true, JSON.stringify(bF).slice(0, 200));
  await pause(2500);

  const LB = await ligneDe("Réserver un appel", sidB);
  dire("le mode est Meet", val(LB, "Mode"), "Google Meet");
  dire("l heure de l ecran se retrouve au classeur",
    val(LB, "Plage demandée").indexOf(t2.h) !== -1, true,
    "ecran : " + t2.h + "  ·  classeur : " + val(LB, "Plage demandée"));
  dire("un lien Meet EXISTE au classeur", /meet\.google\.com|https?:\/\//.test(val(LB, "Lien Meet")), true,
    val(LB, "Lien Meet"));
  dire("et la reponse le rend au navigateur", String(bF.meet || "").length > 8, true,
    String(bF.meet || ""));
  dire("le meme lien des deux cotes", String(bF.meet || ""), val(LB, "Lien Meet"));

  /* ---------- L'AGENDA A VRAIMENT BOUGE ---------- */
  await pause(2000);
  const c1 = await creneaux();
  const restait = (j, iso) => {
    const d = (j.jours || []).find((x) => x.date === iso.slice(0, 10));
    return d ? (d.creneaux || []).some((k) => k.iso === iso) : false;
  };
  dire("le creneau telephone n'est PLUS offert", restait(c1, t1.iso), false,
    "s'il l'etait encore, deux visiteurs reserveraient la meme heure");
  dire("le creneau Meet non plus", restait(c1, t2.iso), false);

  /* ---------- DEUX RESERVATIONS SUR LE MEME CRENEAU ---------- */
  const sidC = "ZZTESTrdvDouble" + String(Date.now()).slice(-6);
  const cF = await poster({ _form: "booking", _sid: sidC, _final: true, _etape: 3, _etapes: 3,
    nom: "ZZTESTrdvDouble Roy", email: "zztest@exemple.ca",
    telephone: "418 555 0201", mode: "Appel téléphonique",
    plage_iso: t1.iso, plage_demandee: t1.h, sujet: "ZZTEST — le meme creneau." });
  dire("une SECONDE reservation sur le meme creneau est refusee", cF.success, false,
    JSON.stringify(cF).slice(0, 200));
}

const ap = await etat("APRES");
console.log("         quota consomme : " + (av.quota - ap.quota));
process.exit(bilan("RESERVATION") ? 1 : 0);
