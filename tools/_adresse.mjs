/* ============================================================
   OU LE SITE SE TROUVE — la reponse, une seule fois

   POURQUOI CE FICHIER A DISPARU, ET POURQUOI IL REVIENT.
   Il etait couvert par la regle `tools/_*` du `.gitignore`, ecrite
   pour ecarter les sorties de mesure (`tools/_captures-*`,
   `tools/_planches`). Elle a emporte du CODE avec les sorties :
   `_adresse.mjs` n'a jamais ete commite, et huit outils
   l'importent — `formulaires-e2e`, `production-check`,
   `langue-check`, `theme-check`, `trame-check`, `palier-check`,
   `prix-check`, `contraste-arret`. Sur un depot fraichement clone,
   les huit s'arretaient sur
   `Cannot find module './_adresse.mjs'`.

   Un outil de mesure qui ne demarre pas ne rend pas un echec : il
   rend un silence, et un silence se lit comme « rien a signaler ».
   C'est le piege 17 sous une autre forme.

   La regle du `.gitignore` a ete resserree en meme temps que ce
   fichier est revenu : elle ne vise plus que les DOSSIERS de
   sortie, nommes un par un.
   ============================================================ */

const PORT_DEFAUT = 8099;

/* Le port, dans l'ordre : ce qui est passe en argument, puis
   `ADEXWEB_PORT`, puis le port de `tools/serve.mjs`.
   On accepte aussi une adresse complete en argument — plusieurs
   outils se lancent indifferemment avec `8099` ou avec
   `http://localhost:8099`, et les deux doivent marcher. */
export function port(arg) {
  const brut = arg ?? process.env.ADEXWEB_PORT ?? "";
  const texte = String(brut).trim();
  if (!texte) return PORT_DEFAUT;

  const dansUneUrl = texte.match(/^https?:\/\/[^/]*?:(\d{2,5})/);
  if (dansUneUrl) return Number(dansUneUrl[1]);

  const nu = texte.match(/^(\d{2,5})$/);
  if (nu) return Number(nu[1]);

  return PORT_DEFAUT;
}

/* L'adresse de base, SANS barre finale : tous les appelants
   ecrivent `BASE + "/index.html"`. En rendre une avec la barre
   produirait `//index.html`, que `serve.mjs` sert quand meme et
   qui fausse les rapports de liens.

   `127.0.0.1` plutot que `localhost` : sur une machine ou la
   resolution rend d'abord `::1`, `localhost` porte le navigateur
   sur l'IPv6 pendant que `serve.mjs` ecoute en IPv4, et la page ne
   charge jamais. */
export function adresse(arg) {
  const brut = arg ?? process.env.ADEXWEB_BASE ?? "";
  const texte = String(brut).trim();

  if (/^https?:\/\//i.test(texte)) return texte.replace(/\/+$/, "");
  return `http://127.0.0.1:${port(texte)}`;
}

export default { port, adresse };
