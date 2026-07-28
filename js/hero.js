/* ============================================================
   HERO — la plaque de limaille
   ------------------------------------------------------------
   DEUX MOTS, EN PERMANENCE, QUI NE CHANGENT JAMAIS.
   « APED » en tres gros, « AGENCY » dessous, nettement plus
   petit, justifie sur la largeur du mot du haut, la plaque posee
   de travers de quelques degres.

   Aucun carrousel de lettres, aucun morph d'un glyphe vers un
   autre, aucun bouton de selection : le mot APED reste APED du
   debut a la fin de la visite. La technique emprunte a la
   reference sa MATIERE, pas son scenario.
   ============================================================ */

(function () {
  "use strict";

  var root = document.documentElement;
  var host = document.getElementById("heroPlate");
  if (!host || typeof window.Limaille === "undefined") return;

  var canvas = document.getElementById("heroCanvas");
  if (!canvas) return;

  var reducedMQ = window.matchMedia("(prefers-reduced-motion: reduce)");
  var finePointer = window.matchMedia("(pointer: fine)");

  var CSS = getComputedStyle(root);
  var v = function (n, fb) { var x = CSS.getPropertyValue(n).trim(); return x || fb; };

  /* ------------------------------------------------------------
     Politique d'accent — tranchee et documentee.

     L'ancienne regle disait : le minium ne sert que le chiffre ROI,
     l'index actif, le CTA primaire et le filet de section active.
     Un hero en minium plein la casse.

     REGLE REECRITE, et elle est plus forte que l'ancienne :
     « Le minium est la MATIERE dont APED est fait. Il apparait une
     fois en pleine masse, au hero, comme le bloc de matiere brute.
     Ensuite il ne revient que la ou le visiteur peut agir sur cette
     matiere : le CTA primaire, l'index actif, le chiffre du
     calculateur, le filet de la section active. »

     Le grand mot est donc en minium dominant, et le petit mot est
     deja en encre dominante : la descente vers l'encre commence
     dans le hero meme. Ce n'est pas qu'esthetique, c'est un gain
     de lisibilite mesurable — l'encre sur ciment donne 13,89:1
     quand le minium donne 5,74:1, et c'est le PETIT mot qui a le
     plus besoin de contraste.
     ------------------------------------------------------------ */
  /* MESURE DU 2026-07-25 : a 0,72 le petit mot recevait 28 % de grains
     minium melanges a 72 % d'encre. A la taille d'AGENCE, ce melange ne
     se lit pas comme de la matiere, il se lit comme du BRUIT : les
     lettres paraissent floues alors que la couverture est pleine. Ce
     n'etait donc pas un probleme de densite mais de DITHERING a deux
     tons sur un fut de 12 px. A 0,96 il reste juste assez de grains
     d'accent pour que la matiere soit la meme que celle d'APED, et le
     mot se lit d'un coup. */
  var RATIOS = {
    /* part de grains rendus dans l'encre, par ligne */
    masse:  { grand: 0.12, petit: 0.96 },   /* recommande */
    inverse: { grand: 0.82, petit: 0.98 }   /* politique ancienne respectee a la lettre */
  };
  var mode = host.getAttribute("data-accent") === "inverse" ? "inverse" : "masse";

  var field = new window.Limaille(canvas, {
    stride: 2,
    alpha: 170,
    jitter: 0.32,
    omegaRest: 21,
    omegaStart: 7,
    restDrag: 0.55,
    moveDrag: 0.86,
    stagger: 0.42,
    repelStrength: 15000
  });

  if (field.dead) { host.classList.add("is-fallback"); return; }

  /* ------------------------------------------------------------
     Composition. Mesuree, jamais devinee.
     ------------------------------------------------------------ */
  var BIG = "APED";
  /* AGENCE, pas AGENCY. Le logo dit AGENCE, le site est francais, et un
     seul des deux pouvait rester. Tranche par le client le 2026-07-25. */
  var SMALL = "AGENCE";
  var ANGLE = -2.2;                 /* degres, la plaque posee de travers */
  var layout = null;

  /* Archivo est variable sur wght ET wdth. Le raccourci `font` du
     canvas accepte la largeur en mot-cle. On verifie qu'elle est
     bien prise en compte plutot que de l'esperer. */
  function fontFor(px, expanded) {
    return (expanded ? "expanded " : "") + "900 " + px + "px Archivo, sans-serif";
  }

  var expandedWorks = false;
  (function probe() {
    var c = document.createElement("canvas").getContext("2d");
    if (!c) return;
    c.font = fontFor(100, false);
    var a = c.measureText(BIG).width;
    c.font = fontFor(100, true);
    var b = c.measureText(BIG).width;
    expandedWorks = Math.abs(b - a) > 1.5;
  })();

  /* Taille qui fait tenir le grand mot sur la largeur demandee.
     Recherche dichotomique : deux mesures suffisent en theorie mais
     l'avance des glyphes n'est pas parfaitement lineaire. */
  function sizeToWidth(ctx, text, targetW, tracking) {
    var lo = 8, hi = 900;
    for (var i = 0; i < 22; i++) {
      var mid = (lo + hi) / 2;
      ctx.font = fontFor(mid, expandedWorks);
      var w = ctx.measureText(text).width + tracking * mid * (text.length - 1);
      if (w > targetW) hi = mid; else lo = mid;
    }
    return lo;
  }

  /* ------------------------------------------------------------
     HAUTEUR REELLEMENT OCCUPEE, ROTATION COMPRISE.

     Le bloc est tourne de ANGLE degres autour du CENTRE du canvas.
     Un bloc large bascule : son coin bas-gauche descend de
     (largeur / 2) * |sin(ANGLE)|. Mesure du 2026-07-25 a 1440 :
     largeur du bloc 968 px, |sin(2,2°)| = 0,0384, donc 18,6 px de
     descente de chaque cote. Hauteur du bloc droit 296,6 px, canvas
     305 px : le bloc tenait de justesse A PLAT et debordait de
     28,8 px UNE FOIS TOURNE. Les grains hors cadre sont supprimes au
     trace (`drawFrame`), donc le bas d'AGENCE etait litteralement
     ampute. C'est la cause exacte du mot coupe.

     On mesure donc l'emprise reelle, et si elle deborde on
     RECALCULE la composition a l'echelle qui rentre. Aucune
     dimension de canvas ne peut plus produire un mot coupe.
     ------------------------------------------------------------ */
  var SIN_A = Math.abs(Math.sin(ANGLE * Math.PI / 180));
  var COS_A = Math.abs(Math.cos(ANGLE * Math.PI / 180));
  function emprise(bigW, blockH) { return bigW * SIN_A + blockH * COS_A; }

  function computeLayout(cw, ch, echelle) {
    var probe = document.createElement("canvas").getContext("2d");
    if (!probe) return null;
    echelle = echelle === undefined ? 1 : echelle;

    /* Le grand mot occupe presque toute la largeur, moins la marge
       que la rotation reclame : incline de 2,2 degres, un bloc de
       1000 px de large deborde de 1000*sin(2,2°) ≈ 38 px en
       hauteur et il faut lui laisser cette place. Sur ecran etroit
       la taille est RECALCULEE pour le format, on ne rétrécit pas
       betement, donc APED ne deborde jamais. */
    var fill = (cw < 560 ? 0.955 : 0.925) * echelle;
    var bigTrack = -0.035;                       /* en em */
    var bigSize = sizeToWidth(probe, BIG, cw * fill, bigTrack);

    probe.font = fontFor(bigSize, expandedWorks);
    var bm = probe.measureText(BIG);
    var bigCap = bm.actualBoundingBoxAscent || bigSize * 0.72;
    var bigW = bm.width + bigTrack * bigSize * (BIG.length - 1);

    /* ALIGNEMENT DU PETIT MOT — mesure, puis tranche.
       Justifie sur la largeur exacte d'APED, l'interlettrage
       necessaire monte a 2,3 em : AGENCY explose en six lettres
       sans lien et cesse d'etre un mot. Mesure a 1440 : 135 px
       entre chaque lettre pour un corps de 59.
       On garde donc un interlettrage TENU, et le petit mot
       s'aligne a gauche sous la haste du A. Le bloc a un bord
       droit irregulier, ce qui est une decision, pas un accident. */
    var align = host.getAttribute("data-align") === "justify" ? "justify" : "left";
    /* Sur ecran etroit le petit mot doit remonter en taille
       relative : a 0,245 sa hauteur de capitale tombait a 17 px,
       avec des fûts de 3 px sur lesquels un grain de 2 px est plus
       large que le trait. */
    /* Le petit mot etait a 0,215 : sa hauteur de capitale tombait a
       46 px pour un grand mot a 216, soit un rapport de 4,7. A cette
       echelle AGENCE ne soutient pas la comparaison avec APED et le
       visiteur doit deviner. Porte a 0,26 : rapport 3,8, hauteur de
       capitale 56 px, futs de 15 px. */
    var smallSize = bigSize * (cw < 560 ? 0.34 : 0.26);
    probe.font = fontFor(smallSize, expandedWorks);
    var sm = probe.measureText(SMALL);
    var smallCap = sm.actualBoundingBoxAscent || smallSize * 0.72;
    var natural = sm.width;
    var smallTrackPx = align === "justify"
      ? (bigW - natural) / (SMALL.length - 1)
      : smallSize * 0.32;

    var gap = bigCap * 0.16;
    var blockH = bigCap + gap + smallCap;
    var top = (ch - blockH) / 2;
    var left = (cw - bigW) / 2;

    return {
      cw: cw, ch: ch, echelle: echelle,
      bigSize: bigSize, bigTrackPx: bigTrack * bigSize, bigCap: bigCap, bigW: bigW,
      smallSize: smallSize, smallTrackPx: smallTrackPx, smallCap: smallCap,
      left: left, top: top, gap: gap, blockH: blockH,
      emprise: emprise(bigW, blockH),
      bigBaseline: top + bigCap,
      smallBaseline: top + bigCap + gap + smallCap
    };
  }

  /* Composition qui RENTRE, mesuree et non esperee. Deux passes
     suffisent : l'emprise est quasi lineaire en echelle, la seconde
     passe ne sert qu'a absorber la non-linearite de l'avance des
     glyphes. On garde 2 % de marge sous le bord du cadre. */
  function layoutQuiRentre(cw, ch) {
    var cible = ch * 0.98;
    var l = computeLayout(cw, ch, 1);
    if (!l) return null;
    for (var i = 0; i < 3 && l.emprise > cible; i++) {
      l = computeLayout(cw, ch, l.echelle * (cible / l.emprise));
      if (!l) return null;
    }
    return l;
  }

  /* Trace lettre par lettre : c'est le seul moyen d'obtenir une
     justification exacte, et ca garde la maitrise de l'avance. */
  function drawTracked(ctx, text, x, baseline, size, trackPx) {
    ctx.font = fontFor(size, expandedWorks);
    var cx = x;
    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      ctx.fillText(ch, cx, baseline);
      cx += ctx.measureText(ch).width + trackPx;
    }
  }

  function build() {
    var box = host.getBoundingClientRect();
    var cw = Math.max(240, Math.round(box.width));
    var ch = Math.max(160, Math.round(box.height));

    field.resize(cw, ch);
    layout = layoutQuiRentre(cw, ch);
    if (!layout) { host.classList.add("is-fallback"); return; }

    var surface = v("--surface-0", "#dcdedb");
    var mass = v("--accent", "#c8371b");
    var ink = v("--ink", "#101211");
    field.setColors(surface, mass, ink);

    /* Le rayon du sillon vient de la hauteur de capitale du PETIT
       mot : au rayon de la reference, une de nos lettres
       disparaitrait entierement. On creuse, on n'efface pas. */
    field.setRepelRadius(layout.smallCap);

    var r = RATIOS[mode];

    /* DENSITE PAR LIGNE — c'est le reglage decisif.
       Couverture = (grain / pas)^2.
       - Grand mot : pas 3, grain 2 => 44 %. La matiere est
         franchement grenee de pres, mais assez dense pour lire
         comme un bloc de minium plein d'un coup d'oeil.
       - Petit mot : pas 2, grain 2 => 100 %, donc plein. A cette
         taille les fûts ne font que quelques pixels ; les trouer
         reduirait AGENCY en poussiere. C'est exactement le piege
         de la repartition a l'aire.
       Sous 560 px de large, le grand mot passe aussi en plein :
         ses fûts y sont trop etroits pour supporter des trous. */
    var etroit = cw < 560;
    var bands = [
      { y0: Math.max(0, (layout.top - layout.bigCap * 0.10) / ch),
        y1: (layout.bigBaseline + layout.gap * 0.45) / ch,
        stride: etroit ? 2 : 3,
        grain: 2,
        inkRatio: r.grand },
      { y0: (layout.bigBaseline + layout.gap * 0.45) / ch,
        y1: Math.min(1, (layout.smallBaseline + layout.smallCap * 0.4) / ch),
        /* Sur ecran etroit le grain descend a 1 px : sur un fût de
           4 px, un grain de 2 px est un pave, pas de la limaille. */
        stride: 1,
        grain: etroit ? 1 : 2,
        inkRatio: r.petit }
    ];

    var rad = ANGLE * Math.PI / 180;
    var cos = Math.cos(rad), sin = Math.sin(rad);
    var pcx = cw / 2, pcy = ch / 2;
    var rotate = function (x, y) {
      var dx = x - pcx, dy = y - pcy;
      return [pcx + dx * cos - dy * sin, pcy + dx * sin + dy * cos];
    };

    var n = field.compose(function (ctx) {
      ctx.fillStyle = "#000";
      ctx.textBaseline = "alphabetic";
      ctx.textAlign = "left";
      drawTracked(ctx, BIG, layout.left, layout.bigBaseline, layout.bigSize, layout.bigTrackPx);
      drawTracked(ctx, SMALL, layout.left, layout.smallBaseline, layout.smallSize, layout.smallTrackPx);
    }, bands, rotate);

    if (!n) { host.classList.add("is-fallback"); return; }

    host.setAttribute("data-grains", String(n));
    field.snapToTargets();
    field.drawFrame();
    host.classList.add("is-live");
  }

  /* ------------------------------------------------------------
     Cycle de vie
     ------------------------------------------------------------ */
  function applyReduced() { field.setReduced(reducedMQ.matches); }

  /* La decision « premiere visite de la session » est prise UNE
     SEULE FOIS, dans le script de tete, avant le premier rendu, et
     elle se lit ici sur la classe `entree-on`. Deux cles de session
     concurrentes se desynchronisaient : le rideau pouvait jouer sans
     que les grains ne partent, ou l'inverse. */
  var entered = false;
  var lance = false;
  function lancerGrains(ms) {
    if (lance) return;
    lance = true;
    field.enter(ms);
  }

  function maybeEnter() {
    if (entered || reducedMQ.matches) return;
    entered = true;
    if (!root.classList.contains("entree-on")) return;

    /* Les grains partent des QUINZE filets horizontaux, exactement
       ceux dont le rideau est fait. Ils y sont poses tout de suite,
       mais ils ne partent qu'au moment ou la premiere bande du
       rideau s'ouvre : le rideau se disperse en filets et les grains
       composent APED dans la meme seconde, avec la meme matiere.

       LE DECLENCHEUR EST L'ANIMATION REELLE, pas une horloge.
       Un `setTimeout` cale sur `performance.now()` mesure depuis la
       navigation, alors qu'un delai CSS part du premier rendu de
       l'element : les deux horloges different de tout le temps
       d'analyse du document, et le decalage se voyait. En ecoutant
       `animationstart` de la premiere bande, les deux gestes sont
       cales par construction. */
    field.seedPositions();
    field.drawFrame();

    /* La bande du MILIEU part la premiere : c'est elle le top de
       depart, pas la premiere du document. */
    var bande = document.querySelector("#entree [data-entree-debut]");
    if (bande) {
      bande.addEventListener("animationstart", function () { lancerGrains(800); }, { once: true });
      /* Filet de securite : onglet ouvert en arriere-plan, rideau
         deja retire, animation jamais declenchee. La plaque se
         compose quand meme.
         CALE SUR LE GARDE-FOU DE `main.js`, pas sur une horloge a
         part. Depuis que la sequence peut s'ALLONGER pour couvrir un
         chargement lent, un delai fixe de 1,4 s partait avant que le
         rideau ait commence a s'ouvrir : les grains composaient
         APED derriere un rideau encore ferme, et le relais — qui est
         tout l'interet du geste — ne se voyait pas. */
      window.setTimeout(function () { lancerGrains(800); }, Math.max(600, 2700 - performance.now()));
    } else {
      lancerGrains(900);
    }
  }

  /* ------------------------------------------------------------
     RECOLORATION A LA BASCULE DE THEME.

     Le defaut : `build()` lit `--surface-0`, `--accent` et `--ink`
     UNE SEULE FOIS, a la composition. La bascule de theme ne
     rappelait rien. Un visiteur arrive en sombre puis passe en clair
     gardait donc des grains fonces sur un ciment clair, et — avant
     que le champ passe en fond transparent — un bloc franchement
     noir. C'est exactement le « le hero reste noir en mode clair ».

     Recomposer entierement couterait un `getImageData` et 25 000
     cibles reconstruites pour un simple changement de couleur. Or
     `this.tone` ne stocke qu'un INDICE de ton par grain : il suffit
     de remettre la table des tons a jour et de retracer une image.
     Cout mesure : une passe de trace, sous la milliseconde.
     ------------------------------------------------------------ */
  function recolor() {
    if (!field || field.dead) return;
    field.setColors(v("--surface-0", "#dcdedb"), v("--accent", "#c8371b"), v("--ink", "#101211"));
    field.drawFrame();
  }
  document.addEventListener("aped:theme", recolor);

  function ready() {
    build();
    applyReduced();
    if (!reducedMQ.matches) maybeEnter();
  }

  if (document.fonts && document.fonts.ready) {
    /* Sans cette attente on echantillonne la police de secours et
       la matiere n'a pas la bonne forme. */
    document.fonts.ready.then(ready);
  } else {
    window.setTimeout(ready, 60);
  }

  /* --- pointeur : le sillon --- */
  if (finePointer.matches) {
    host.addEventListener("pointermove", function (e) {
      if (!layout) return;
      var b = canvas.getBoundingClientRect();
      field.pointer(e.clientX - b.left, e.clientY - b.top);
    });
    host.addEventListener("pointerleave", function () { field.clearPointer(); });
    /* Une re-coulee : l'onde ecarte les grains et ils reforment LE
       MEME MOT. Jamais un autre glyphe. */
    host.addEventListener("click", function (e) {
      var b = canvas.getBoundingClientRect();
      field.pulse(e.clientX - b.left, e.clientY - b.top);
    });
  }

  /* --- au tactile : pas de sillon suivi, une re-coulee au toucher,
         et surtout jamais de piege de defilement --- */
  if (!finePointer.matches) {
    host.addEventListener("pointerdown", function (e) {
      var b = canvas.getBoundingClientRect();
      field.pulse(e.clientX - b.left, e.clientY - b.top);
    }, { passive: true });
  }

  /* --- boucle en pause hors ecran et onglet cache --- */
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (es) {
      field.setVisible(es[0].isIntersecting);
    }, { rootMargin: "80px" }).observe(host);
  }
  document.addEventListener("visibilitychange", function () {
    field.setVisible(!document.hidden && !!field.visible);
    if (!document.hidden) field.setVisible(true);
  });

  /* --- redimensionnement : on recompose, la matiere est
         deterministe donc aucun scintillement --- */
  var rt = 0;
  window.addEventListener("resize", function () {
    window.clearTimeout(rt);
    rt = window.setTimeout(function () {
      build();
      applyReduced();
    }, 160);
  });

  if (reducedMQ.addEventListener) reducedMQ.addEventListener("change", applyReduced);

  /* Sonde de calibrage, lue par Playwright. Jamais utilisee par la page. */
  window.__heroField = field;
  window.__heroLayout = function () { return layout; };
})();

