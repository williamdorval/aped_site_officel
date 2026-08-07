/* ============================================================
   AUCUN PRIX PUBLIC
   `node tools/prix-check.mjs [port]`

   Deux passes, parce qu'une seule ne prouve rien :
   1. dans le CODE SOURCE, tous les montants en dollars, avec leur
      fichier et leur ligne ;
   2. dans le TEXTE RENDU de la page, ce qu'un visiteur — ou un
      concurrent — lit reellement, modales ouvertes comprises.

   Cinq familles sont AUTORISEES, et elles sont declarees ici
   plutot que devinees :
   · « 5 000 $ » du programme de reference — le plafond attire, la
     grille decourage ;
   · les sept PRIMES de la grille de reference : des montants qu'on
     VERSE, fixes par type de projet, dont aucun prix de vente ne se
     deduit. `tools/prime-check.mjs` verifie la grille elle-meme ;
   · le TAUX HORAIRE de la FAQ — un taux n'est pas un tarif : il ne
     dit le prix d'aucun projet, faute de dire combien d'heures ;
   · les sorties vivantes du calculateur et de l'estimateur, qui
     donnent un chiffre au prospect sans publier notre grille ;
   · « 0 $ », qui dit qu'une chose ne coute rien.

   DEUX AVEUGLEMENTS ONT ETE REPARES LE 2026-08-07 (D-773), et les
   deux rendaient « 0 » sans erreur :
   · le motif ne voyait pas un montant ecrit en ENTITE
     (`5&nbsp;000&nbsp;$`) — six signes ASCII entre le chiffre et le
     dollar, aucun dans sa classe ;
   · la passe du rendu lisait `innerText`, qui rend une chaine VIDE
     pour toute section sous `content-visibility: auto` hors ecran.
     Elle comptait deux montants sur la page entiere.
   ============================================================ */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, "..");
import { adresse, port as portDe } from "./_adresse.mjs";
const PORT = portDe(process.argv[2]);


const FICHIERS = ["index.html", "404.html", "css/app.css", "css/tokens.css", "css/base.css",
  "css/tour360.css", "js/main.js", "js/motion.js", "js/hero.js", "js/limaille.js",
  "js/pointe.js", "js/tour360.js"];

/* Un montant : un nombre, espaces insecables compris, suivi de $. */
const MONTANT = /(\d[\d  \s]*)\$/g;

/* UNE ENTITE EST UN ESPACE, ET L'OUTIL NE LE VOYAIT PAS.  D-773

   CE QUI S'EST PASSE. `5&nbsp;000&nbsp;$` s'ecrit avec six signes
   ASCII entre le chiffre et le dollar : `&`, `n`, `b`, `s`, `p`,
   `;`. Aucun n'est dans la classe du motif. Il ne matchait donc
   PAS, et la passe du source rendait « 0 a retirer » sur un
   montant parfaitement lisible a l'ecran.

   Ce n'etait pas visible tant que les montants ecrits en entite
   etaient tous des « 5 000 $ » autorises par ailleurs. Le jour ou
   la grille des primes est arrivee — sept montants, tous generes
   avec `&#160;` — l'outil a rendu « ok » sans en avoir vu un seul.

   On decode donc les quatre formes de l'espace insecable AVANT de
   chercher — vers un espace ORDINAIRE, que le motif accepte deja
   par son `\s` : rendre l'insecable exact ne changerait rien a la
   detection et ajouterait un caractere invisible dans ce fichier.
   Les numeros de ligne restent justes : une entite se remplace par
   UN caractere, sur la meme ligne. */
const decoderEspaces = (s) => String(s)
  .replace(/&nbsp;/g, " ")
  .replace(/&#160;/g, " ")
  .replace(/&#xa0;/gi, " ")
  .replace(/&#8239;/g, " ");

const AUTORISES = [
  { motif: /^5[  \s]*000$/, pourquoi: "plafond du programme de reference" },
  { motif: /^0$/, pourquoi: "gratuite affirmee" }
];
/* Certaines lignes portent un montant qui n'est PAS notre prix. On
   les nomme une par une plutot que d'elargir le motif : une regle
   large finirait par laisser passer un vrai tarif. */
const CONTEXTES_OK = [
  { motif: /outRate|inRate|coûte une heure de main/, pourquoi: "taux horaire saisi par le visiteur" },
  { motif: /outRev|inRev|Chiffre d’affaires par mois/, pourquoi: "chiffre d'affaires saisi par le visiteur" },
  { motif: /une minute par semaine|par année, à|par minute hebdo/, pourquoi: "constante de methode du calcul, pas un tarif" },
  { motif: /grille de commissions|Commission versée uniquement/, pourquoi: "bareme de commission, revele apres l'interet — decision du client" },
  { motif: /nav-refer-num|referral-max|Encaissez|Référez/, pourquoi: "plafond du programme de reference" },
  /* LA GRILLE DES PRIMES.  D-773
     Ce sont des montants qu'on VERSE, pas des prix qu'on demande, et
     c'est toute la difference : ils sont fixes par TYPE de projet,
     donc ils ne laissent rien deduire du prix de vente — une meme
     ligne couvre une fourchette de deux a trois fois.
     Le contexte est la CELLULE, pas le bloc : seule la colonne des
     primes est blanchie, et `tools/prime-check.mjs` verifie que son
     contenu est exactement la grille declaree, ni plus ni moins. */
  { motif: /cond-prime/, pourquoi: "prime du programme de reference, versee a un tiers" },
  /* LE TAUX HORAIRE, PUBLIE DEPUIS D-353, ET QUE CET OUTIL N'AVAIT
     JAMAIS VU.  D-773
     Les deux reponses de la FAQ l'ecrivent `75&nbsp;$`, en entite :
     le motif ne les matchait pas, et personne n'a jamais eu a
     trancher leur cas. Le decodage des entites les a fait
     apparaitre du jour au lendemain — ce n'est pas une regression,
     c'est une decision qui n'avait jamais ete inscrite.
     UN TAUX N'EST PAS UN TARIF : il ne dit le prix d'aucun projet,
     faute de dire combien d'heures. On le nomme, on ne l'efface
     pas. */
  { motif: /l’heure|l'heure/, pourquoi: "taux horaire publie, decision assumee D-353" },
  /* Les maquettes de secteur et les ecrans de Services montrent des
     interfaces de CLIENTS fictifs : un menu de restaurant, un bon de
     travail de garage, une fiche de propriete. Les montants qu'on y
     lit sont ceux de ces entreprises imaginaires, jamais nos tarifs.
     Ils sont necessaires : un menu sans prix ne ressemble pas a un
     menu, et c'est precisement ce qui separait ces apercus d'un
     wireframe gris. On les nomme ici pour que la decision soit
     visible dans le rapport plutot que noyee. */
  { motif: /mock-|mk-|mkx-|ecr-|data-mock/, pourquoi: "prix de demonstration d'un client fictif, pas un tarif APED" },
  /* LA FOURCHETTE REVELEE APRES LE FORMULAIRE.  D-748
     La regle a change, et elle s'est RETRECIE : « aucun prix, nulle
     part » est devenu « aucun prix sur la page publique ». Le bareme
     vit dans `js/main.js` et n'est ecrit dans le document QU'APRES
     l'envoi d'un formulaire complet, dans la modale, a la personne
     qui vient de repondre a six questions sur son projet.
     La passe 2 ci-dessous — le TEXTE RENDU — est celle qui compte :
     elle ouvre toutes les modales et echouerait si un montant y
     paraissait au chargement. */
  /* LA FORME D'UNE LIGNE DE BAREME, pas le mot « BAREME » : le
     mot n'est ecrit que sur la ligne d'ouverture, et ce sont les
     CINQ lignes suivantes qui portent les montants. */
  { motif: /BAREME|devis-montant|fourchette_vue|fourchetteDe|score:\s*\d+\s*,\s*texte:/, pourquoi: "bareme revele apres le formulaire, D-748" }
];
const autorise = (n) => AUTORISES.find((a) => a.motif.test(n.trim()));
const contexteOk = (l) => CONTEXTES_OK.find((c) => c.motif.test(l));

/* LES ZONES DE DEMONSTRATION.
   Un montant s'evalue par ce qu'il DESIGNE, pas par sa ligne. Les
   treize apercus de secteur et les quatre ecrans de Services
   montrent des interfaces de CLIENTS fictifs : un menu de
   restaurant, un bon de travail de garage, une fiche de propriete.
   Les montants qu'on y lit appartiennent a ces entreprises
   imaginaires. Ils sont necessaires — un menu sans prix ne
   ressemble pas a un menu, et c'est exactement ce qui separait ces
   apercus du wireframe gris qu'on vient de remplacer.
   On delimite donc ces zones une fois, et tout ce qui tombe dedans
   est classe comme tel, avec sa raison. */
function zonesDemo(texte) {
  const bornes = [];
  const d = texte.indexOf('<template id="tplSecteurs">');
  if (d >= 0) bornes.push([d, texte.indexOf("</template>", d)]);
  let i = 0;
  while ((i = texte.indexOf('<div class="ecr ecr--', i)) >= 0) {
    bornes.push([i, texte.indexOf("</figure>", i)]);
    i += 10;
  }
  /* On convertit les bornes de caracteres en bornes de lignes. */
  const cumul = [];
  let n = 0;
  for (const l of texte.split("\n")) { cumul.push(n); n += l.length + 1; }
  const ligneDe = (pos) => { let k = 0; while (k + 1 < cumul.length && cumul[k + 1] <= pos) k++; return k; };
  return bornes.filter(([a, b]) => a >= 0 && b > a).map(([a, b]) => [ligneDe(a), ligneDe(b)]);
}

/* LES COMMENTAIRES, ET POURQUOI ILS COMPTENT A PART.  D-728

   Les dix montants que cet outil signalait apres sa reparation
   etaient TOUS dans des commentaires — et tous dans des
   commentaires qui expliquent le RETRAIT d'une grille : « elle
   publiait cinq paliers, de 2 500 $ a 40 000 $ ». Le raisonnement
   qui a fait disparaitre un prix ne peut pas s'ecrire sans citer le
   prix disparu.

   Un commentaire n'est ni rendu, ni lu par un visiteur — ni le
   bloc de JavaScript, ni celui de HTML. (On ne peut PAS ecrire ici
   la forme litterale du commentaire HTML : Node refuse un module
   qui la contient, « HTML comments are not allowed in modules ».)
   La passe du TEXTE RENDU, plus bas, reste le controle dur : elle
   ouvre les
   modales et les accordeons et relit `innerText`. Si un prix
   arrivait a l'ecran, c'est la qu'il se ferait prendre, et elle
   ne pardonne pas.

   ON LES COMPTE QUAND MEME, SEPAREMENT. Un commentaire qui cite un
   ancien tarif reste une trace du bareme dans un depot public : ce
   n'est pas une faute, c'est une chose a savoir.

   LA DETECTION EST STRUCTURELLE, PAS PAR MOT-CLE. On suit l'etat
   « dans un commentaire » ligne par ligne — sinon un montant place
   apres la fermeture d'un bloc passerait pour du commentaire. */
function lignesCommentees(texte, html) {
  const out = new Set();
  let bloc = false;
  texte.split("\n").forEach((l, i) => {
    const debutBloc = bloc;
    let reste = l;
    let commentee = bloc;

    if (html) {
      while (reste.length) {
        if (!bloc) {
          const o = reste.indexOf("<!--");
          if (o < 0) break;
          bloc = true; commentee = true; reste = reste.slice(o + 4);
        } else {
          const c = reste.indexOf("-->");
          if (c < 0) { reste = ""; break; }
          bloc = false; reste = reste.slice(c + 3);
        }
      }
    } else {
      while (reste.length) {
        if (!bloc) {
          const deuxBarres = reste.indexOf("//");
          const o = reste.indexOf("/*");
          if (deuxBarres >= 0 && (o < 0 || deuxBarres < o)) { commentee = true; break; }
          if (o < 0) break;
          bloc = true; commentee = true; reste = reste.slice(o + 2);
        } else {
          const c = reste.indexOf("*/");
          if (c < 0) { reste = ""; break; }
          bloc = false; reste = reste.slice(c + 2);
        }
      }
    }

    /* Une ligne compte comme commentee si elle l'etait en entrant OU
       si un commentaire s'y ouvre. Le cas « code, puis commentaire
       en fin de ligne » reste donc signale — c'est du code. */
    if (debutBloc || commentee) out.add(i);
  });
  return out;
}

const source = [];
const enCommentaire = [];
for (const f of FICHIERS) {
  const p = path.join(RACINE, f);
  if (!fs.existsSync(p)) continue;
  const brut = fs.readFileSync(p, "utf8");
  const demo = f.endsWith(".html") ? zonesDemo(brut) : [];
  const dansDemo = (i) => demo.some(([a, b]) => i >= a && i <= b);
  const commentees = lignesCommentees(brut, f.endsWith(".html"));
  const lignes = brut.split("\n").map(decoderEspaces);
  lignes.forEach((l, i) => {
    let m;
    MONTANT.lastIndex = 0;
    while ((m = MONTANT.exec(l))) {
      const n = m[1];
      const a = autorise(n) || contexteOk(l) ||
        (dansDemo(i) ? { pourquoi: "prix de demonstration d'un client fictif, pas un tarif APED" } : null);

      /* Un montant dans un commentaire sort du decompte dur et entre
         dans le sien : il n'atteint aucun visiteur, mais il reste
         une trace du bareme dans un depot public. */
      if (!a && commentees.has(i)) {
        enCommentaire.push({
          fichier: f, ligne: i + 1, montant: m[0].trim(),
          contexte: l.trim().slice(0, 96)
        });
        continue;
      }

      source.push({
        fichier: f, ligne: i + 1, montant: m[0].trim(),
        verdict: a ? "autorise (" + a.pourquoi + ")" : "A RETIRER",
        contexte: l.trim().slice(0, 96)
      });
    }
  });
}

/* LA GRILLE A DISPARU POUR DE BON, ET LA SONDE NE LE SAVAIT PAS.
   D-716 · D-728

   HISTOIRE COURTE, PARCE QU'ELLE SE REPETE. Premiere version : la
   sonde cherchait `PRICING`, la variable s'appelait `BAREME`, elle
   ne matchait rien et jurait qu'il n'y avait pas de grille. On a
   corrige en cherchant `BAREME` ET en ARRETANT sur zero — « zero
   ici veut dire que la sonde a derive ».

   Puis `BAREME` a ete retire pour de vrai le 2026-08-03 (D-353).
   Le garde-fou est alors devenu le defaut : la sonde ARRETE a
   chaque lancement, `process.exit(2)`, et TOUT LE RESTE DU
   CONTROLE — les montants du source, le texte rendu — ne s'execute
   plus. La garantie « aucun prix publie » n'etait plus verifiee
   depuis, sans que rien ne le dise autrement qu'en criant.

   C'est le piege 46 dans sa forme la plus pure : un contournement
   qui survit a son motif.

   CE QUI REMPLACE L'ARRET. Zero grille est desormais le resultat
   ATTENDU — mais un zero ne se croit toujours pas sur parole. On
   passe donc a la sonde un texte d'essai qui CONTIENT une grille :
   si elle ne la trouve pas, c'est la sonde qui est cassee, et c'est
   la qu'on arrete. Le zero du vrai fichier ne compte que si le
   faux, lui, rend autre chose que zero. */
function chercherGrille(source) {
  const trouve = [];
  let dedans = false;
  source.split("\n").forEach((l, i) => {
    if (/\bvar\s+BAREME\s*=|PRICING|base:\s*\{\s*vitrine/.test(l)) {
      dedans = true;
      trouve.push({ ligne: i + 1, texte: l.trim().slice(0, 110) });
      return;
    }
    if (dedans) {
      if (/^\s*\]/.test(l)) { dedans = false; return; }
      if (/\d/.test(l)) trouve.push({ ligne: i + 1, texte: l.trim().slice(0, 110) });
    }
  });
  return trouve;
}

{
  /* L'AUTO-CONTROLE, D'ABORD. Une sonde qui ne sait plus trouver ce
     qu'elle cherche rend zero, et zero se lit « rien a signaler ». */
  const faux = [
    "var BAREME = [",
    "  { max: 1, bas: 2500, haut: 5000 },",
    "  { max: 3, bas: 5000, haut: 12000 }",
    "];"
  ].join("\n");
  const essai = chercherGrille(faux);
  if (essai.length < 3) {
    console.error(
      "ARRET  la sonde ne reconnait plus une grille de prix.\n" +
      "       Sur un texte d'essai qui en contient une, elle en a\n" +
      "       trouve " + essai.length + " ligne(s) au lieu de 3 au moins.\n" +
      "       Ce n'est pas le site qui a change, c'est l'instrument.\n" +
      "       Repare `chercherGrille` avant de croire le verdict."
    );
    process.exit(2);
  }
}

const grilles = chercherGrille(fs.readFileSync(path.join(RACINE, "js/main.js"), "utf8"));

/* ---- passe 2 : le texte reellement rendu ---- */
const nav = await chromium.launch();
const ctx = await nav.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.addInitScript(() => { try { sessionStorage.setItem("aped-entree-saut", "1"); sessionStorage.setItem("aped-sans-popup", "1"); } catch (e) {} });
await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: "load" });
await page.waitForTimeout(900);

const sonde = await page.evaluate(() => {
  /* On ouvre TOUT : modales, accordeons, details replies, TIROIRS.
     Un prix cache derriere un `hidden` reste un prix publie.

     LES TIROIRS ONT MANQUE, ET C'EST LE MEME DEFAUT QUE L'ENTITE.
     D-773
     Le panneau des montants et le texte des conditions naissent
     `hidden` : `innerText` les rendait vides, et l'outil comptait
     zero montant sur le plus gros bloc de dollars de la page. Un
     bouton les ouvre en un clic — donc ils sont publies. */
  document.querySelectorAll(".modal").forEach((m) => m.removeAttribute("hidden"));
  document.querySelectorAll("details").forEach((d) => (d.open = true));
  document.querySelectorAll("[data-tiroir]").forEach((b) => {
    const c = document.getElementById(b.getAttribute("data-tiroir"));
    if (c) c.hidden = false;
  });

  /* ON MARCHE DANS LES NOEUDS DE TEXTE, PAS DANS `innerText`.
     `innerText` rend une chaine plate : impossible d'y dire si un
     montant vient de la grille des primes ou d'ailleurs, et
     « ailleurs » est justement ce qu'on cherche. Le noeud, lui,
     sait ou il vit. */
  const out = [];
  let tout = "";
  const re = /(\d[\d\u00a0\u202f\s]*\$)/g;
  const marche = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let nd;
  while ((nd = marche.nextNode())) {
    const t = nd.nodeValue || "";
    tout += " " + t;
    if (t.indexOf("$") === -1) continue;
    const el = nd.parentElement;
    if (!el || el.closest("template")) continue;
    let m;
    re.lastIndex = 0;
    while ((m = re.exec(t))) {
      out.push({
        montant: m[1].trim(),
        avant: t.slice(Math.max(0, m.index - 60), m.index).replace(/\s+/g, " ").trim(),
        apres: t.slice(m.index + m[1].length, m.index + m[1].length + 40).replace(/\s+/g, " ").trim(),
        prime: !!el.closest(".cond-prime"),
        /* L'ANCRE : l'identifiant le plus proche, et la section qui
           le porte. Un montant se juge par ce qu'il DESIGNE, et le
           voisinage textuel d'un `<b>` seul dans sa boite est vide —
           c'est le DOM qui sait, pas la chaine. */
        ancre: (el.closest("[id]") || {}).id || "",
        zone: (el.closest("section[id]") || {}).id || ""
      });
    }
  }
  return { montants: out, texte: tout };
});
await nav.close();
const rendu = sonde.montants;
const texteRendu = sonde.texte;

/* LE CLASSEMENT DU TEXTE RENDU.

   IL EST DEVENU BEAUCOUP PLUS SEVERE, ET C'EST UNE REPARATION.
   D-773

   L'ANCIENNE PASSE LISAIT `document.body.innerText`. Or
   `innerText` ne rend QUE ce qui est mis en page : avec
   `content-visibility: auto` sur les sections, tout ce qui etait
   hors ecran rendait la chaine VIDE. L'outil comptait deux montants
   sur toute la page et concluait « 0 a verifier ». Il ne mentait pas
   sur ce qu'il voyait — il ne voyait presque rien. Pieges 4 · 34.

   La sonde marche maintenant dans les NOEUDS DE TEXTE, qui existent
   qu'ils soient peints ou non, et elle ouvre les tiroirs. Elle voit
   donc tout, y compris deux publications assumees qu'aucune passe
   n'avait jamais eu a nommer : le taux horaire et les sorties du
   calculateur. On les nomme ici, une par une. */
const RENDU_OK = [
  /* LE TAUX HORAIRE EST PUBLIE, ET C'EST UNE DECISION.  D-353
     Le site l'ecrit deux fois, dans la FAQ, et il ne dit le prix
     d'AUCUN projet : c'est ce qui separe un taux d'un tarif. Une
     personne qui le lit ne peut pas en deduire un devis, faute de
     savoir combien d'heures. */
  { quand: (r) => /l’heure|l'heure/.test(r.apres), quoi: "taux horaire publie, decision assumee D-353" },
  /* LES SORTIES DU CALCULATEUR partent a zero et suivent les
     curseurs du visiteur. Deux facons de les reconnaitre : le signe
     « environ » qui les precede, et leur identifiant — un `<b>` seul
     dans sa boite n'a aucun voisinage textuel. */
  { quand: (r) => /^≈/.test(r.avant) || r.avant === "≈", quoi: "sortie vivante du calculateur" },
  { quand: (r) => /^(out|in)[A-Z]/.test(r.ancre), quoi: "sortie vivante du calculateur (" + "identifiant" + ")" },
  { quand: (r) => /(annuel|impact|vaut par|Heures|estim|fourchette|évitées|rendues|gagnés)/i.test(r.avant + " " + r.apres),
    quoi: "sortie vivante du calculateur" },
  /* LA PRIME DE REFERENCE. Le noeud vit dans la colonne des primes
     de la grille : un engagement envers un TIERS, fixe par TYPE de
     projet. `tools/prime-check.mjs` verifie que cette colonne porte
     exactement la grille declaree — ici on ne fait que la nommer. */
  { quand: (r) => r.prime, quoi: "prime du programme de reference" },
  /* Les apercus de secteur montrent des interfaces de clients
     fictifs : un menu de restaurant a des prix, sinon ce n'est pas
     un menu. */
  { quand: (r) => /^(sec|demos)/.test(r.zone) || /mock|ecr-|tou-/.test(r.ancre),
    quoi: "prix de demonstration d'un client fictif" }
];

const renduTries = rendu.map((r) => {
  const n = r.montant.replace("$", "").trim();
  if (/^5[  \s]*000$/.test(n) || /^0$/.test(n)) return { ...r, verdict: "autorise" };
  const trouve = RENDU_OK.find((c) => c.quand(r));
  return { ...r, verdict: trouve ? trouve.quoi : "A VERIFIER" };
});

const aRetirer = source.filter((s) => s.verdict === "A RETIRER");
const aVerifier = renduTries.filter((r) => r.verdict === "A VERIFIER");

fs.writeFileSync(path.join(RACINE, "refonte-captures", "prix.json"),
  JSON.stringify({ source, rendu: renduTries, grilles, enCommentaire }, null, 2), "utf8");

console.log("=== SOURCE ===");
source.forEach((s) => console.log(`  ${s.fichier}:${s.ligne}  ${s.montant}  ${s.verdict}`));
console.log("\n=== TEXTE RENDU, modales et accordeons ouverts ===");
renduTries.forEach((r) => console.log(`  ${r.montant}  ${r.verdict}   « …${r.avant} ${r.montant} ${r.apres}… »`));
console.log(`\n=== GRILLE DE PRIX DANS js/main.js ===`);
if (!grilles.length) {
  /* AUCUNE GRILLE EST DEVENU L'ANOMALIE.  D-748
     Le bareme est REVENU le 2026-08-06, sous une regle plus etroite
     que celle de D-353 : il ne s'affiche qu'apres un formulaire
     complet, dans la modale. S'il disparaissait, la fourchette
     promise a la derniere etape ne paraitrait plus et rien d'autre
     ne le dirait. */
  console.log(
    `  *** AUCUNE — et c'est une anomalie depuis D-748.\n` +
    `  Le bareme doit exister dans js/main.js : c'est lui qui produit la\n` +
    `  fourchette montree a la fin de l'assistant de projet.`
  );
} else {
  grilles.forEach((g) => console.log(`  js/main.js:${g.ligne}  ${g.texte}`));
  console.log(
    `  ^ ${grilles.length} ligne(s). PERMIS DEPUIS D-748, sous condition :\n` +
    `    ces montants ne s'ecrivent dans le document qu'APRES l'envoi d'un\n` +
    `    formulaire complet. La passe du TEXTE RENDU ci-dessus le verifie —\n` +
    `    elle ouvre toutes les modales et compte ce qui parait au chargement.`
  );
}
console.log(`\n=== DANS UN COMMENTAIRE — NON RENDU, MAIS PUBLIE DANS LE DEPOT ===`);
if (!enCommentaire.length) {
  console.log("  aucun");
} else {
  enCommentaire.forEach((c) => console.log(`  ${c.fichier}:${c.ligne}  ${c.montant}   « ${c.contexte} »`));
  console.log(
    `  ^ ${enCommentaire.length} montant(s). Aucun n'atteint un visiteur : ni un\n` +
    `    « /* */ » ni un « <!-- --> » n'est rendu, et la passe du TEXTE RENDU\n` +
    `    ci-dessus le confirme. Ce sont des commentaires qui expliquent le\n` +
    `    RETRAIT d'une grille, et le raisonnement ne s'ecrit pas sans citer\n` +
    `    ce qui a ete retire. Ils restent lisibles dans un depot public :\n` +
    `    a arbitrer, pas a corriger en douce.`
  );
}
console.log(`
A RETIRER dans le source : ${aRetirer.length}`);
console.log(`A VERIFIER dans le rendu : ${aVerifier.length}`);

/* UN INTERDIT ABSOLU DOIT POUVOIR ECHOUER.  D-716 · D-728
   `CLAUDE.md` ecrit « doit rester a 0 » et cet outil n'avait aucun
   `process.exit` : il imprimait un nombre que rien ne relisait.
   Une grille de prix REVENUE fait echouer, elle aussi : elle
   n'attend plus d'arbitrage, il a ete rendu le 2026-08-03. */
/* LA GRILLE N'EST PLUS UNE FAUTE — SON ABSENCE DU RENDU EN EST UNE.
   D-748

   Jusqu'au 2026-08-06 cet outil echouait des qu'il trouvait un
   bareme dans `js/main.js`, parce que `CLAUDE.md` disait « aucun
   prix, nulle part ». La regle s'est retrecie : le bareme est
   permis dans le source, et c'est son apparition dans le TEXTE
   RENDU qui reste interdite.

   ON NE SE CONTENTE PAS DE LEVER L'INTERDIT. Un garde-fou qu'on
   desarme sans le remplacer ne garde plus rien. Celui-ci verifie
   maintenant les DEUX sens :
     · aucun montant du bareme dans la page chargee ;
     · et le bareme EXISTE — s'il disparaissait, la fourchette
       promise a l'etape 6 ne s'afficherait plus, et rien ne le
/* CE QUE D-748 PROTEGE EXACTEMENT : LA PHRASE, PAS LE NOMBRE.
   D-773

   DEUX DEFAUTS SE CACHAIENT L'UN L'AUTRE.

   1 · `g.ligne || g.texte` prenait le NUMERO de ligne — toujours
       verite — et cherchait un montant dans « 108 ». La liste des
       montants du bareme restait VIDE, donc `fuites` valait zero
       quoi qu'il arrive. Le seuil que `CLAUDE.md` inscrit noir sur
       blanc ne gardait rien. Piege 30 dans sa forme exacte.

   2 · Une fois repare, il criait sur « 5 000 $ » — le plafond du
       programme de reference, affiche depuis toujours, qui est AUSSI
       la borne d'un palier du bareme. Le nombre nu ne peut pas dire
       lequel des deux il est.

   CE QUE LE VISITEUR NE DOIT PAS LIRE, c'est « 2 500 $ a 5 000 $ » :
   la FOURCHETTE, c'est-a-dire la grille tarifaire. Un montant seul,
   etiquete « jusqu'a, par entreprise referee », n'est pas une
   grille. On cherche donc les PHRASES du bareme dans le texte rendu,
   et on garde les coincidences de nombres en note.

   L'ARRET SUR ZERO RESTE : un bareme trouve dont aucune phrase ne se
   lit veut dire que la lecture a derive, jamais que le bareme a
   disparu. */
const phrasesBareme = [...new Set(grilles
  .map((g) => (/texte:\s*"([^"]+)"/.exec(String(g.texte || "")) || [])[1])
  .filter(Boolean))];
if (grilles.length && !phrasesBareme.length) {
  console.error(
    "ARRET  le bareme a ete trouve (" + grilles.length + " lignes) mais aucune\n"
    + "       fourchette ne s'en lit. La verification « aucune fourchette\n"
    + "       du bareme dans la page » ne porterait alors sur RIEN, et\n"
    + "       rendrait 0 quoi qu'il arrive.");
  process.exit(2);
}

const aplatir = (t) => String(t).replace(/[\u00a0\u202f\s]+/g, " ");
const platRendu = aplatir(texteRendu);
const fuites = phrasesBareme
  .filter((f) => platRendu.indexOf(aplatir(f)) !== -1)
  .map((f) => ({ montant: f, avant: "fourchette du bareme lue dans la page" }));

/* LES COINCIDENCES DE NOMBRE, EN NOTE. « 5 000 $ » est le plafond du
   programme ET la borne d'un palier ; 2 500 $ est une prime ET la
   borne du premier. Aucune ne publie une fourchette — mais le jour
   ou le bareme bouge, c'est la premiere chose a relire. */
const montantsBareme = [...new Set(phrasesBareme
  .flatMap((f) => f.match(/\d[\d\u00a0\u202f\s]*(?=\s*\$)/g) || [])
  .map((x) => x.replace(/[\u00a0\u202f\s]/g, "")))];
const coincidences = [...new Set(rendu
  .map((r) => r.montant.replace(/[\u00a0\u202f\s]/g, "").replace("$", ""))
  .filter((v) => montantsBareme.indexOf(v) !== -1))];

console.log(`
Bareme trouve dans js/main.js : ${grilles.length} ligne(s)`);
console.log(`Fourchettes du bareme lues dans la page : ${fuites.length}`);
console.log(`  note · ${coincidences.length} montant(s) de la page coincident avec une BORNE du bareme`
  + (coincidences.length ? " : " + coincidences.join(" \u00b7 ") + " $" : "")
  + "\n         Sans effet : un montant seul n'est pas une fourchette. A relire\n"
  + "         si le bareme ou la grille des primes bougent.");
if (fuites.length) {
  fuites.forEach((f) => console.log("   *** " + f.montant + "   « " + f.avant + " »"));
}

if (aRetirer.length || aVerifier.length || fuites.length || grilles.length === 0) {
  console.error(
    `\nECHEC : ${aRetirer.length} prix a retirer dans le source, ` +
    `${aVerifier.length} a verifier dans le rendu, ` +
    `${fuites.length} montant(s) du bareme dans la page, ` +
    `bareme ${grilles.length ? "present" : "INTROUVABLE"}.`
  );
  if (!grilles.length) {
    console.error(
      "       Le bareme a disparu de js/main.js. La fourchette promise\n" +
      "       a la fin de l'assistant de projet ne s'affichera plus, et\n" +
      "       rien d'autre ne le dirait."
    );
  }
  process.exit(1);
}
console.log("\nok — 0 prix non autorise sur la page, bareme present et non divulgue.");
