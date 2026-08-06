/* ============================================================
   LE FAUX GOOGLE — `google/Code.gs` execute pour de vrai, sous Node
   `node tools/faux-google.mjs [port]`   (defaut 8098)

   POURQUOI CET OUTIL EXISTE.
   Le deploiement dans le compte Google ne peut pas se faire depuis
   ici : il demande d'ouvrir un navigateur connecte a
   apedagence@gmail.com et de cliquer. Sans lui, tout ce chantier
   se resumait a « c'est ecrit, ca devrait marcher » — c'est-a-dire
   la reserve exacte que ce projet passe son temps a refuser.

   ALORS ON NE SIMULE PAS LE SCRIPT, ON L'EXECUTE.
   Ce fichier LIT `google/Code.gs`, pose autour de lui des versions
   en memoire des services Google — classeur, courrier, calendrier,
   verrou, proprietes — et l'evalue. Le `doPost` qui repond ici est
   la MEME fonction, ligne pour ligne, que celle qui repondra en
   production. L'aiguillage, la validation, le dedoublonnage, la
   construction des lignes, le honeypot, la forme de la reponse :
   tout ca se prouve ici.

   CE QUE CET OUTIL NE PROUVE PAS, ET IL FAUT LE DIRE :
   · qu'un vrai Google Sheet accepte ces appels — les bouchons
     disent toujours oui ;
   · qu'un lien Meet se cree vraiment — `conferenceData` est rendu
     par un bouchon, pas par Google ;
   · qu'un courriel ARRIVE dans une boite ;
   · que les autorisations OAuth passent.
   Ces quatre-la se verifient une seule fois, a la main, en suivant
   `docs/CONFIGURATION-GOOGLE-APED.md`. Tout le reste est ici.
   ============================================================ */
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, "..");
const PORT = Number(process.argv[2] || 8098);

/* ---------- l'etat en memoire, inspectable ---------- */
export const etat = {
  proprietes: {},
  feuilles: new Map(),      /* nom -> { valeurs: [][], figees, largeurs, listes, cachees } */
  courriels: [],
  evenements: [],
  fichiersDrive: [],
  journal: [],
  quota: 100,
  /* Les agendas que le compte de l'agence sait lire. Tout ce qui
     n'est pas la-dedans se comporte comme un agenda jamais partage. */
  agendasConnus: ["primary"],
  fuseauClasseur: "America/Toronto"
};

function feuille(nom) {
  if (!etat.feuilles.has(nom)) {
    etat.feuilles.set(nom, {
      nom, valeurs: [], figees: 0, largeurs: {}, listes: {}, cachees: [], hauteurs: {},
      /* Pour prouver l'ordre format/valeurs — voir `setNumberFormat`. */
      ecrites: new Set(), formatsTexte: [], formatApresValeurs: 0, regles: [],
      /* Les cellules que Sheets a retenues comme CALCUL. */
      formules: new Set()
    });
  }
  return etat.feuilles.get(nom);
}

/* Une plage. On ne reimplemente pas Sheets — seulement ce que
   `Code.gs` appelle reellement, et on LEVE sur le reste : un
   bouchon qui rend `undefined` en silence ferait passer un appel
   fautif pour un appel reussi. */
function plage(f, ligne, colonne, nLignes, nCols) {
  const grandir = (jusqua) => {
    while (f.valeurs.length < jusqua) f.valeurs.push([]);
  };
  return {
    setValues(v) {
      grandir(ligne + nLignes - 1);
      for (let r = 0; r < nLignes; r++) {
        const cible = f.valeurs[ligne - 1 + r];
        for (let c = 0; c < nCols; c++) {
          const cle0 = (ligne - 1 + r) + ":" + (colonne - 1 + c);
          /* LA REGLE DE SHEETS, MODELISEE ICI TELLE QUELLE : une
             chaine qui commence par « = » devient une FORMULE, sauf
             si la cellule porte deja le format texte. C'est le seul
             endroit du banc ou l'injection se joue, donc le seul
             endroit ou le modele doit etre exact — pas approche. */
          if (/^[=+\-@]/.test(String(v[r][c])) && !f.formatsTexte.includes(cle0)) {
            f.formules.add(cle0);
          } else {
            f.formules.delete(cle0);
          }
          cible[colonne - 1 + c] = v[r][c];
          /* ON RETIENT QU'UNE VALEUR A ETE ECRITE ICI. Sert a
             prouver que le format TEXTE est pose AVANT, pas apres :
             un `setNumberFormat("@")` applique a une cellule qui
             porte deja une formule ne defait pas la formule, il ne
             fait que l'afficher autrement.  D-731 */
          f.ecrites.add((ligne - 1 + r) + ":" + (colonne - 1 + c));
        }
      }
      return this;
    },
    getValues() {
      grandir(ligne + nLignes - 1);
      const out = [];
      for (let r = 0; r < nLignes; r++) {
        const src = f.valeurs[ligne - 1 + r] || [];
        const row = [];
        for (let c = 0; c < nCols; c++) row.push(src[colonne - 1 + c] ?? "");
        out.push(row);
      }
      return out;
    },
    getValue() { return this.getValues()[0][0]; },
    setValue(v) { return this.setValues([[v]]); },
    /* Ce que Sheets a retenu comme CALCUL. Vide = du texte. C'est le
       verdict de l'injection, et il ne se lit pas dans `getValues`. */
    getFormulas() {
      const out = [];
      for (let r = 0; r < nLignes; r++) {
        const row = [];
        for (let c = 0; c < nCols; c++) {
          const cle = (ligne - 1 + r) + ":" + (colonne - 1 + c);
          row.push(f.formules.has(cle) ? String((f.valeurs[ligne - 1 + r] || [])[colonne - 1 + c] ?? "") : "");
        }
        out.push(row);
      }
      return out;
    },
    getNumberFormats() {
      const out = [];
      for (let r = 0; r < nLignes; r++) {
        const row = [];
        for (let c = 0; c < nCols; c++) {
          row.push(f.formatsTexte.includes((ligne - 1 + r) + ":" + (colonne - 1 + c)) ? "@" : "0.###############");
        }
        out.push(row);
      }
      return out;
    },
    getNumberFormat() { return this.getNumberFormats()[0][0]; },
    setNumberFormat(fmt) {
      if (fmt === "@") {
        for (let r = 0; r < nLignes; r++) {
          for (let c = 0; c < nCols; c++) {
            const cle = (ligne - 1 + r) + ":" + (colonne - 1 + c);
            f.formatsTexte.push(cle);
            /* Pose APRES l'ecriture = pose trop tard. On compte. */
            if (f.ecrites.has(cle)) f.formatApresValeurs++;
          }
        }
      }
      return this;
    },
    setFontWeight() { return this; },
    setBackground() { return this; },
    setFontColor() { return this; },
    setVerticalAlignment() { return this; },
    setDataValidation(regle) {
      f.listes[colonne] = regle ? regle.valeurs : null;
      return this;
    },
    clearContent() {
      grandir(ligne + nLignes - 1);
      for (let r = 0; r < nLignes; r++) {
        const cible = f.valeurs[ligne - 1 + r];
        for (let c = 0; c < nCols; c++) {
          cible[colonne - 1 + c] = "";
          f.ecrites.delete((ligne - 1 + r) + ":" + (colonne - 1 + c));
        }
      }
      return this;
    },
    getA1Notation() {
      const lettre = (n) => {
        let s = "";
        while (n > 0) { const r = (n - 1) % 26; s = String.fromCharCode(65 + r) + s; n = (n - r - 1) / 26; }
        return s;
      };
      return lettre(colonne) + ligne + ":" + lettre(colonne + nCols - 1) + (ligne + nLignes - 1);
    },
    /* Sert a la mise en forme conditionnelle : on retient la plage
       telle que `Code.gs` la demande, sans rien peindre. */
    _plage: { ligne, colonne, nLignes, nCols }
  };
}

function faireFeuille(f) {
  return {
    getName: () => f.nom,
    getSheetId: () => Math.abs([...f.nom].reduce((a, c) => a * 31 + c.charCodeAt(0), 7)) % 100000,
    getLastRow: () => {
      for (let i = f.valeurs.length - 1; i >= 0; i--) {
        if ((f.valeurs[i] || []).some((c) => c !== "" && c != null)) return i + 1;
      }
      return 0;
    },
    getMaxRows: () => Math.max(f.valeurs.length, 1000),
    getLastColumn: () => f.valeurs.reduce((m, r) => Math.max(m, (r || []).length), 0),
    getRange: (l, c, nl = 1, nc = 1) => plage(f, l, c, nl, nc),
    getConditionalFormatRules: () => f.regles.slice(),
    setConditionalFormatRules: (rs) => { f.regles = rs.slice(); },
    setFrozenRows: (n) => { f.figees = n; },
    setRowHeight: (r, h) => { f.hauteurs[r] = h; },
    setColumnWidth: (c, w) => { f.largeurs[c] = w; },
    hideColumns: (c) => { if (!f.cachees.includes(c)) f.cachees.push(c); },
    /* INSERER UNE LIGNE DECALE TOUT CE QUI EST EN DESSOUS — Y
       COMPRIS MES REPERES. Sans ce remappage, les cles de `ecrites`
       pointaient sur les mauvaises lignes apres la premiere
       insertion, et le controle « le format a-t-il ete pose avant
       les valeurs ? » rendait 40 faux positifs. L'instrument avait
       tort, pas `Code.gs`. */
    insertRowBefore: (n) => {
      f.valeurs.splice(n - 1, 0, []);
      const monter = (cle) => {
        const [r, c] = cle.split(":").map(Number);
        return (r >= n - 1 ? r + 1 : r) + ":" + c;
      };
      f.ecrites = new Set([...f.ecrites].map(monter));
      f.formules = new Set([...f.formules].map(monter));
      f.formatsTexte = f.formatsTexte.map(monter);
    },
    deleteRow: (n) => {
      f.valeurs.splice(n - 1, 1);
      const garder = (cle) => Number(cle.split(":")[0]) !== n - 1;
      const descendre = (cle) => {
        const [r, c] = cle.split(":").map(Number);
        return (r > n - 1 ? r - 1 : r) + ":" + c;
      };
      f.ecrites = new Set([...f.ecrites].filter(garder).map(descendre));
      f.formules = new Set([...f.formules].filter(garder).map(descendre));
      f.formatsTexte = f.formatsTexte.filter(garder).map(descendre);
    },
    getColumnWidth: (c) => f.largeurs[c] ?? 100,
    getFrozenRows: () => f.figees
  };
}

const classeurFactice = {
  getId: () => "CLASSEUR_FACTICE",
  getUrl: () => "https://docs.google.com/spreadsheets/d/CLASSEUR_FACTICE/edit",
  setSpreadsheetTimeZone: (tz) => { etat.fuseauClasseur = tz; },
  getSpreadsheetTimeZone: () => etat.fuseauClasseur || "America/Toronto",
  getSheetByName: (n) => (etat.feuilles.has(n) ? faireFeuille(etat.feuilles.get(n)) : null),
  insertSheet: (n) => faireFeuille(feuille(n)),
  getSheets: () => [...etat.feuilles.keys()].map((n) => faireFeuille(etat.feuilles.get(n))),
  deleteSheet: (s) => etat.feuilles.delete(s.getName())
};

/* ---------- le calendrier en memoire ----------

   UN EVENEMENT DU BANC porte au plus :
     { titre, debut, fin }                        — une plage horaire
     { titre, jour: "2026-08-11" }                — toute la journee
     { titre, jour, jours: 3 }                    — plusieurs journees
     { …, disponible: true }                      — « Disponible »
     { …, refuse: true }                          — invitation declinee
     { …, annule: true }                          — occurrence supprimee
   `tools/creneaux-check.mjs` s'en sert pour poser les trois cas que
   le guide promet, et VOIR le creneau disparaitre. */

const FUSEAU_BANC = "America/Toronto";

function partsFuseau(d, tz) {
  const f = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23"
  });
  const o = {};
  for (const p of f.formatToParts(d)) if (p.type !== "literal") o[p.type] = p.value;
  return o;
}

function decalageFuseau(d, tz) {
  const p = partsFuseau(d, tz);
  const commeUTC = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second);
  return Math.round((commeUTC - d.getTime()) / 60000);
}

/* Minuit, heure de Toronto, du jour « 2026-08-11 ». */
function minuitBanc(cle) {
  const [a, m, j] = String(cle).split("-").map(Number);
  const suppose = Date.UTC(a, m - 1, j, 0, 0, 0);
  const d1 = decalageFuseau(new Date(suppose), FUSEAU_BANC);
  let out = new Date(suppose - d1 * 60000);
  const d2 = decalageFuseau(out, FUSEAU_BANC);
  if (d2 !== d1) out = new Date(suppose - d2 * 60000);
  return out;
}

function bornes(e) {
  if (e.jour) {
    const d0 = minuitBanc(e.jour);
    const n = e.jours || 1;
    /* +26 h puis retour a minuit : un jour de changement d'heure
       dure 23 h ou 25 h. */
    let fin = d0;
    for (let i = 0; i < n; i++) {
      const p = partsFuseau(new Date(fin.getTime() + 26 * 3600000), FUSEAU_BANC);
      fin = minuitBanc(`${p.year}-${p.month}-${p.day}`);
    }
    return { debut: d0, fin };
  }
  return { debut: new Date(e.debut), fin: new Date(e.fin) };
}

function versApiAvancee(e) {
  const out = { summary: e.titre, status: e.annule ? "cancelled" : "confirmed" };
  if (e.disponible) out.transparency = "transparent";
  if (e.refuse) out.attendees = [{ self: true, responseStatus: "declined" }];
  else if (e.invites && e.invites.length) out.attendees = e.invites.map((a) => ({ email: a }));
  if (e.jour) {
    const b = bornes(e);
    const f = partsFuseau(b.fin, FUSEAU_BANC);
    out.start = { date: e.jour };
    out.end = { date: `${f.year}-${f.month}-${f.day}` };
  } else {
    out.start = { dateTime: new Date(e.debut).toISOString() };
    out.end = { dateTime: new Date(e.fin).toISOString() };
  }
  return out;
}

/* DE QUEL AGENDA VIENT CET EVENEMENT. Sans champ, c'est celui de
   l'agence. `tools/agenda-multi-check.mjs` s'en sert pour poser un
   blocage dans un agenda PERSONNEL et verifier qu'il compte —
   c'etait exactement le trou du 2026-08-06. */
function agendaDe(e) { return e.agenda || "primary"; }

const calendrierFactice = (calId) => ({
  getEvents: (debut, fin) => etat.evenements
    .filter((e) => agendaDe(e) === calId && bornes(e).debut < fin && bornes(e).fin > debut)
    .map((e) => ({
      getMyStatus: () => (e.refuse ? "NO" : "YES"),
      isAllDayEvent: () => Boolean(e.jour),
      getAllDayStartDate: () => bornes(e).debut,
      getAllDayEndDate: () => bornes(e).fin,
      getStartTime: () => bornes(e).debut,
      getEndTime: () => bornes(e).fin,
      titre: e.titre
    })),
  createEvent: (titre, debut, fin, opts) => {
    const ev = { titre, debut, fin, description: (opts || {}).description,
                 invites: [], meet: "", agenda: calId };
    etat.evenements.push(ev);
    return { addGuest: (a) => ev.invites.push(a), getId: () => "EV" + etat.evenements.length };
  }
});

/* ---------- les services ---------- */
const services = {
  PropertiesService: {
    getScriptProperties: () => ({
      getProperty: (k) => etat.proprietes[k] ?? null,
      setProperty: (k, v) => { etat.proprietes[k] = v; }
    })
  },

  SpreadsheetApp: {
    create: () => { etat.proprietes.CLASSEUR_ID = "CLASSEUR_FACTICE"; return classeurFactice; },
    openById: () => classeurFactice,
    /* La mise en forme conditionnelle : on retient la formule et
       la couleur, on ne peint rien. Ce qu'on veut prouver, c'est
       QUE la regle est posee, sur la bonne colonne, et qu'elle ne
       s'empile pas a chaque relance d'. */
    newConditionalFormatRule: () => {
      const b = { formule: null, fond: null, plages: [] };
      const api = {
        whenFormulaSatisfied: (f) => { b.formule = f; return api; },
        setBackground: (c) => { b.fond = c; return api; },
        setRanges: (r) => { b.plages = r; return api; },
        build: () => Object.assign(b, {
          getRanges: () => b.plages,
          getBooleanCondition: () => ({
            getCriteriaValues: () => [b.formule],
            getBackgroundObject: () => ({
              asRgbColor: () => ({ asHexString: () => b.fond })
            })
          })
        })
      };
      return api;
    },
    newDataValidation: () => {
      const b = { valeurs: null };
      const api = {
        requireValueInList: (v) => { b.valeurs = v; return api; },
        setAllowInvalid: () => api,
        build: () => b
      };
      return api;
    }
  },

  Session: { getEffectiveUser: () => ({ getEmail: () => "compte-factice@exemple.ca" }) },

  MailApp: {
    getRemainingDailyQuota: () => etat.quota,
    sendEmail: (o) => {
      if (etat.quota < 1) throw new Error("quota");
      etat.quota--;
      etat.courriels.push(o);
    }
  },

  CalendarApp: {
    GuestStatus: { NO: "NO", YES: "YES", MAYBE: "MAYBE" },
    getDefaultCalendar: () => calendrierFactice("primary"),
    /* GOOGLE REND `null` SUR UN AGENDA INCONNU — il ne leve pas.
       Le bouchon rendait toujours un calendrier, donc le chemin
       « agenda mal orthographie » n'etait jamais exerce et le seul
       code qui compte, celui qui REFUSE, n'etait pas teste. */
    getCalendarById: (id) => (etat.agendasConnus.includes(id) ? calendrierFactice(id) : null)
  },

  /* Le service avance. C'est LUI qui fabrique le lien Meet en
     production ; ici il rend un lien de forme plausible pour que la
     suite de la chaine — colonne, avis, confirmation — se prouve.

     `list` compte AUTANT que `insert` depuis que les creneaux
     existent : c'est par lui que `Code.gs` apprend ce qui occupe
     l'agenda, et donc lui qui decide de ce que le site affiche. Il
     rend la forme EXACTE du service avance — `start.date` sans
     heure pour une journee entiere, `transparency`, `status`,
     `attendees[].self` — parce que c'est justement cette forme-la
     que `intervalleEvenement` doit savoir lire. */
  Calendar: {
    Events: {
      list: (calId, params) => {
        /* UN AGENDA INCONNU LEVE, il ne rend pas une liste vide.
           C'est ce que fait le vrai service (404 Not Found), et
           c'est la seule reponse acceptable : « zero occupation »
           voudrait dire « journee entierement libre ». */
        if (!etat.agendasConnus.includes(calId)) {
          throw new Error("Not Found: " + calId);
        }
        const t0 = new Date(params.timeMin);
        const t1 = new Date(params.timeMax);
        const items = etat.evenements
          .filter((e) => agendaDe(e) === calId && bornes(e).debut < t1 && bornes(e).fin > t0)
          .map((e) => versApiAvancee(e));
        return { items, nextPageToken: null };
      },
      insert: (ev, calId, opts) => {
        if (!opts || opts.conferenceDataVersion !== 1) {
          throw new Error("conferenceDataVersion doit valoir 1 pour creer un Meet");
        }
        if (!ev.conferenceData?.createRequest?.requestId) {
          throw new Error("requestId manquant");
        }
        const n = etat.evenements.length + 1;
        const lien = "https://meet.google.com/fac-tice-" + String(n).padStart(3, "0");
        etat.evenements.push({
          titre: ev.summary, debut: new Date(ev.start.dateTime), fin: new Date(ev.end.dateTime),
          description: ev.description, invites: (ev.attendees || []).map((a) => a.email),
          meet: lien, sendUpdates: opts.sendUpdates, agenda: calId || "primary"
        });
        return { hangoutLink: lien, htmlLink: "https://calendar.google.com/event?eid=FACTICE" + n,
                 conferenceData: { entryPoints: [{ entryPointType: "video", uri: lien }] } };
      }
    }
  },

  DriveApp: {
    getFoldersByName: () => ({ hasNext: () => false }),
    createFolder: (nom) => ({
      createFile: (blob) => {
        const f = { nom: blob.nom, octets: blob.octets, dossier: nom };
        etat.fichiersDrive.push(f);
        return { getName: () => f.nom, getUrl: () => "https://drive.google.com/file/d/FACTICE" + etat.fichiersDrive.length };
      }
    })
  },

  Utilities: {
    DigestAlgorithm: { SHA_256: "SHA_256" },
    Charset: { UTF_8: "UTF_8" },
    computeDigest: (algo, texte) => {
      /* Un condense stable suffit : on teste le dedoublonnage, pas
         la cryptographie. */
      const out = [];
      let h1 = 0x811c9dc5, h2 = 0x01000193;
      for (let i = 0; i < texte.length; i++) {
        h1 = Math.imul(h1 ^ texte.charCodeAt(i), 16777619) >>> 0;
        h2 = Math.imul(h2 + texte.charCodeAt(i), 2246822519) >>> 0;
      }
      for (let i = 0; i < 16; i++) out.push((h1 >>> (i % 4 * 8)) & 0xff, (h2 >>> (i % 4 * 8)) & 0xff);
      return out.slice(0, 32);
    },
    getUuid: () => "uuid-" + Math.random().toString(36).slice(2, 12),

    /* IL RENDAIT DE L'ISO, ET C'ETAIT UN BOUCHON QUI MENTAIT.
       `Code.gs` lit le decalage du fuseau en demandant `"Z"` a
       `formatDate` : la reponse « 2026-08-10T13:00:00.000Z » aurait
       ete lue comme un decalage de +20 h 26. Le banc aurait rendu
       des creneaux, tous faux, et personne n'aurait vu passer une
       erreur. `Intl` connait America/Toronto et son changement
       d'heure ; on s'en sert. */
    formatDate: (d, tz, fmt) => {
      const p = partsFuseau(new Date(d), tz);
      const off = decalageFuseau(new Date(d), tz);
      const signe = off < 0 ? "-" : "+";
      const abs = Math.abs(off);
      const zz = signe
        + String(Math.floor(abs / 60)).padStart(2, "0")
        + String(abs % 60).padStart(2, "0");
      return String(fmt)
        .replace(/yyyy/g, p.year)
        .replace(/MM/g, p.month)
        .replace(/dd/g, p.day)
        .replace(/HH/g, p.hour)
        .replace(/mm/g, p.minute)
        .replace(/ss/g, p.second)
        .replace(/Z/g, zz);
    },
    newBlob: (octets, type, nom) => ({ octets, type, nom }),
    base64Decode: (b64) => Buffer.from(b64, "base64")
  },

  ContentService: {
    MimeType: { JSON: "application/json" },
    createTextOutput: (t) => ({ _texte: t, setMimeType() { return this; }, getContent() { return this._texte; } })
  },

  LockService: {
    getScriptLock: () => ({ tryLock: () => true, releaseLock: () => {} })
  },

  Logger: { log: (m) => etat.journal.push(String(m)) },

  console: {
    log: (...a) => etat.journal.push("log: " + a.join(" ")),
    warn: (...a) => etat.journal.push("warn: " + a.join(" ")),
    error: (...a) => etat.journal.push("error: " + a.join(" "))
  }
};

/* ---------- on evalue le VRAI Code.gs ---------- */
const source = fs.readFileSync(path.join(RACINE, "google", "Code.gs"), "utf8");
const noms = Object.keys(services);
const fabrique = new Function(...noms, source + `
  return { doPost, doGet, initialiser, autotest, valider, signature,
           ecrireLigne, colonnes, SCHEMA, REGLAGES, MODES, quotaRestant, notifDest,
           DISPONIBILITES, creneauxLibres, grilleDuJour, occupations, creneauTient,
           instantLocal, partsLocal, decalageMin, libelleHeure, libelleComplet,
           surLaGrille, fenetreReservable, colonneLettre, migrerColonnes };
`);
export const gs = fabrique(...noms.map((n) => services[n]));

/* LE MEME `Code.gs`, SANS LE SERVICE AVANCE CALENDAR.  D-736

   POURQUOI IL FAUT UNE SECONDE INSTANCE. Le repli sur `CalendarApp`
   est le chemin qu'emprunte le script quand le service avance n'a
   pas ete active dans le compte — c'est-a-dire l'etat par defaut de
   toute nouvelle installation. Il n'avait jamais ete exerce : le
   banc fournissait toujours `Calendar`, donc les 41 cas des
   creneaux passaient tous par la branche d'a cote.

   `typeof Calendar` rend « undefined » quand le parametre vaut
   `undefined` : la branche se choisit donc exactement comme en
   production. Les deux instances partagent `etat` — memes
   evenements, meme classeur, seul le chemin de lecture change. */
export const gsSansAvance = fabrique(
  ...noms.map((n) => (n === "Calendar" ? undefined : services[n]))
);

/* ---------- le serveur ---------- */
export function servir(port = PORT) {
  gs.initialiser();

  const serveur = http.createServer((req, res) => {
    const cors = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };
    if (req.method === "OPTIONS") { res.writeHead(204, cors); return res.end(); }

    /* Une trappe pour les outils : l'etat interne, en JSON. */
    if (req.url.startsWith("/_etat")) {
      res.writeHead(200, { ...cors, "Content-Type": "application/json" });
      return res.end(JSON.stringify({
        onglets: [...etat.feuilles.entries()].map(([nom, f]) => ({
          nom,
          entetes: f.valeurs[0] || [],
          lignes: f.valeurs.slice(1).filter((r) => r.some((c) => c !== "" && c != null)),
          figees: f.figees,
          listes: Object.entries(f.listes).filter(([, v]) => v).map(([c, v]) => ({ colonne: Number(c), valeurs: v })),
          cachees: f.cachees
        })),
        courriels: etat.courriels,
        evenements: etat.evenements,
        fichiersDrive: etat.fichiersDrive.map((f) => ({ nom: f.nom, octets: f.octets?.length })),
        quota: etat.quota,
        journal: etat.journal.slice(-40)
      }, null, 1));
    }

    /* UNE TRAPPE POUR POSER DES EVENEMENTS AU CALENDRIER.
       Elle n'existe QUE dans le banc — la vraie Web App n'a pas de
       porte pour ecrire dans l'agenda depuis le web. Sans elle, on
       ne pourrait pas prouver qu'une journee bloquee depuis un
       telephone efface bien ses creneaux : il faudrait ouvrir Google
       Agenda a la main, et « il faudrait » est exactement ce qui ne
       se fait jamais. */
    if (req.url.startsWith("/_evenement") && req.method === "POST") {
      let brut = "";
      req.on("data", (c) => { brut += c; });
      req.on("end", () => {
        try {
          const e = JSON.parse(brut);
          etat.evenements.push(e);
          res.writeHead(200, { ...cors, "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true, total: etat.evenements.length }));
        } catch (err) {
          res.writeHead(400, { ...cors, "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: false, message: String(err) }));
        }
      });
      return;
    }

    /* Vider le calendrier entre deux cas d'essai. */
    if (req.url.startsWith("/_vider-calendrier")) {
      etat.evenements.length = 0;
      res.writeHead(200, { ...cors, "Content-Type": "application/json" });
      return res.end(JSON.stringify({ success: true }));
    }

    if (req.method === "GET") {
      /* LES PARAMETRES DE REQUETE COMPTENT DEPUIS QUE `doGet` A DEUX
         PORTES. Les jeter ici aurait fait repondre le temoin de vie
         a une demande de creneaux, et le site aurait affiche zero
         plage sans la moindre erreur. */
      const parametre = {};
      const q = req.url.indexOf("?");
      if (q >= 0) {
        for (const [k, v] of new URLSearchParams(req.url.slice(q + 1))) parametre[k] = v;
      }
      const sortie = gs.doGet({ parameter: parametre });
      res.writeHead(200, { ...cors, "Content-Type": "application/json" });
      return res.end(sortie.getContent());
    }

    let corps = "";
    req.on("data", (c) => { corps += c; });
    req.on("end", () => {
      let sortie;
      try {
        sortie = gs.doPost({ postData: { contents: corps }, parameter: {} });
      } catch (e) {
        res.writeHead(500, { ...cors, "Content-Type": "application/json" });
        return res.end(JSON.stringify({ success: false, message: String(e) }));
      }
      res.writeHead(200, { ...cors, "Content-Type": "application/json" });
      res.end(sortie.getContent());
    });
  });

  serveur.listen(port, () => {
    console.log(`Faux Google sur http://127.0.0.1:${port}`);
    console.log(`  POST /                    → doPost du vrai Code.gs`);
    console.log(`  GET  /                    → doGet — témoin de vie`);
    console.log(`  GET  /?action=creneaux    → doGet — les plages libres`);
    console.log(`  GET  /_etat               → classeur, courriels, événements`);
    console.log(`  POST /_evenement          → pose un événement au calendrier`);
    console.log(`  GET  /_vider-calendrier   → vide le calendrier`);
  });
  return serveur;
}

/* « SUIS-JE LANCE DIRECTEMENT ? » — PAS PAR CONCATENATION.
   `file://${process.argv[1]}` est le raccourci habituel, et il est
   FAUX des que le chemin porte une espace : `import.meta.url`
   encode « site APED AGENCY » en « site%20APED%20AGENCY », la
   comparaison echoue, et le serveur ne demarre jamais — sans le
   moindre message. `pathToFileURL` fait l'encodage des deux cotes. */
if (import.meta.url === pathToFileURL(process.argv[1]).href) servir();
