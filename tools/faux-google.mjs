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
  quota: 100
};

function feuille(nom) {
  if (!etat.feuilles.has(nom)) {
    etat.feuilles.set(nom, { nom, valeurs: [], figees: 0, largeurs: {}, listes: {}, cachees: [], hauteurs: {} });
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
        for (let c = 0; c < nCols; c++) cible[colonne - 1 + c] = v[r][c];
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
    setNumberFormat() { return this; },
    setFontWeight() { return this; },
    setBackground() { return this; },
    setFontColor() { return this; },
    setVerticalAlignment() { return this; },
    setDataValidation(regle) {
      f.listes[colonne] = regle ? regle.valeurs : null;
      return this;
    }
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
    getRange: (l, c, nl = 1, nc = 1) => plage(f, l, c, nl, nc),
    setFrozenRows: (n) => { f.figees = n; },
    setRowHeight: (r, h) => { f.hauteurs[r] = h; },
    setColumnWidth: (c, w) => { f.largeurs[c] = w; },
    hideColumns: (c) => { if (!f.cachees.includes(c)) f.cachees.push(c); },
    insertRowBefore: (n) => { f.valeurs.splice(n - 1, 0, []); },
    deleteRow: (n) => { f.valeurs.splice(n - 1, 1); }
  };
}

const classeurFactice = {
  getId: () => "CLASSEUR_FACTICE",
  getUrl: () => "https://docs.google.com/spreadsheets/d/CLASSEUR_FACTICE/edit",
  setSpreadsheetTimeZone: () => {},
  getSheetByName: (n) => (etat.feuilles.has(n) ? faireFeuille(etat.feuilles.get(n)) : null),
  insertSheet: (n) => faireFeuille(feuille(n)),
  getSheets: () => [...etat.feuilles.keys()].map((n) => faireFeuille(etat.feuilles.get(n))),
  deleteSheet: (s) => etat.feuilles.delete(s.getName())
};

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
    getDefaultCalendar: () => ({
      getEvents: (debut, fin) => etat.evenements
        .filter((e) => e.debut < fin && e.fin > debut)
        .map((e) => ({ getMyStatus: () => "YES", titre: e.titre })),
      createEvent: (titre, debut, fin, opts) => {
        const ev = { titre, debut, fin, description: (opts || {}).description, invites: [], meet: "" };
        etat.evenements.push(ev);
        return { addGuest: (a) => ev.invites.push(a), getId: () => "EV" + etat.evenements.length };
      }
    })
  },

  /* Le service avance. C'est LUI qui fabrique le lien Meet en
     production ; ici il rend un lien de forme plausible pour que la
     suite de la chaine — colonne, avis, confirmation — se prouve. */
  Calendar: {
    Events: {
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
          meet: lien, sendUpdates: opts.sendUpdates
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
    formatDate: (d, tz, fmt) => new Date(d).toISOString(),
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
           ecrireLigne, colonnes, SCHEMA, REGLAGES, MODES, quotaRestant, notifDest };
`);
export const gs = fabrique(...noms.map((n) => services[n]));

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

    if (req.method === "GET") {
      const sortie = gs.doGet({});
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
    console.log(`  POST /            → doPost du vrai Code.gs`);
    console.log(`  GET  /            → doGet`);
    console.log(`  GET  /_etat       → classeur, courriels, événements`);
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
