/* Serveur statique minimal pour les vérifications Playwright.
   Aucune dépendance. `node tools/serve.mjs [port]` */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PORT = Number(process.argv[2] || 8099);

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".pdf": "application/pdf"
};

http
  .createServer((req, res) => {
    let rel = decodeURIComponent(req.url.split("?")[0]);
    /* TOUT CHEMIN QUI FINIT PAR UNE BARRE EST UN DOSSIER, et un
       dossier sert son `index.html` — pas un 404. Sans cette ligne,
       `/demos-secteurs/boutique/` rendait la page d'erreur alors que
       le fichier existait : le serveur ne traitait que la racine.
       Douze sites de démonstration inaccessibles à l'adresse qu'on
       tape naturellement, et le 404 le disait mal. */
    if (rel.endsWith("/")) rel += "index.html";
    const file = path.join(ROOT, rel);
    if (!file.startsWith(ROOT)) {
      res.writeHead(403).end();
      return;
    }
    fs.readFile(file, (err, buf) => {
      if (err) {
        const f404 = path.join(ROOT, "404.html");
        fs.readFile(f404, (e2, b2) => {
          res.writeHead(404, { "content-type": "text/html; charset=utf-8" });
          res.end(e2 ? "404" : b2);
        });
        return;
      }
      res.writeHead(200, {
        "content-type": TYPES[path.extname(file).toLowerCase()] || "application/octet-stream",
        "cache-control": "no-store"
      });
      res.end(buf);
    });
  })
  /* UN PORT DÉJÀ PRIS DOIT CRIER. Piège 19.
     Un second `serve.mjs` lancé sur un port occupé mourait sans qu'on
     le voie : l'ancien serveur continuait de répondre 200, et il
     servait la version d'AVANT la correction. Ça vient d'arriver une
     fois de plus, sur cette ligne-ci — la correction du routage des
     dossiers ne prenait pas, et rien ne disait pourquoi. */
  .on("error", (e) => {
    if (e.code === "EADDRINUSE") {
      console.error(
        `\nLE PORT ${PORT} EST DÉJÀ PRIS.\n` +
        `Un serveur y répond déjà, et il sert peut-être une version périmée.\n` +
        `Arrête-le d'abord, ou lance celui-ci sur un autre port :\n` +
        `  node tools/serve.mjs ${PORT + 1}\n`
      );
      process.exit(1);
    }
    throw e;
  })
  .listen(PORT, () => console.log("http://localhost:" + PORT));
