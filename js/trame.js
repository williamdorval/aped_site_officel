/* == TRAME — L'ARETE QUANTIFIEE ==  D-557 */

(function (root) {
  "use strict";

  var doc = root.document;

  /* Amortissement critique. Aucun depassement, jamais : la  D-558 */
  function sortie(u) { var v = 1 - u; return 1 - v * v * v; }

  /* Un bruit DETERMINISTE. Deux passages sur la meme frontiere  D-559 */
  function grain(graine, x, y) {
    var n = (x * 374761393 + y * 668265263 + graine * 1274126177) | 0;
    n = (n ^ (n >>> 13)) * 1274126177;
    n = (n ^ (n >>> 16)) >>> 0;
    return n / 4294967296;
  }

  /* La projection le long de l'axe de LECTURE. Elle n'est pas  D-560 */
  var AXES = {
    bas: function (fx, fy) { return fy; },
    haut: function (fx, fy) { return 1 - fy; },
    droite: function (fx) { return fx; },
    gauche: function (fx) { return 1 - fx; },
    radial: function (fx, fy) {
      var dx = fx - 0.5, dy = fy - 0.5;
      return Math.min(1, Math.sqrt(dx * dx + dy * dy) / 0.7071);
    },
    /* La reciproque du radial : les bords d'abord, le centre en
       dernier. Utile pour COUVRIR ce qu'un radial a decouvert. */
    "radial-inverse": function (fx, fy) {
      var dx = fx - 0.5, dy = fy - 0.5;
      return 1 - Math.min(1, Math.sqrt(dx * dx + dy * dy) / 0.7071);
    }
  };

  var actifs = [];

  function couleurDe(el, demandee) {
    if (demandee) return demandee;
    var s = getComputedStyle(doc.documentElement);
    return (s.getPropertyValue("--surface-0") || "#dcdedb").trim();
  }

  /* UN PASSAGE. `sens` decide de l'axe, `graine` decide de la  D-561 */
  function passage(el, opt, versLeVide) {
    if (!el || !root.requestAnimationFrame) return null;
    opt = opt || {};

    /* L'ECRAN N'EST PAS UN ELEMENT. `documentElement` mesure  D-562 */
    var pleinEcran = el === doc.documentElement || opt.pleinEcran;
    var r = pleinEcran
      ? { left: 0, top: 0, width: root.innerWidth, height: root.innerHeight }
      : el.getBoundingClientRect();
    if (r.width < 4 || r.height < 4) { if (opt.onFin) opt.onFin(); return null; }

    var maille = opt.maille || 44;
    var duree = opt.duree || 420;
    var vie = Math.min(opt.vie || 190, duree);
    var etale = Math.max(1, duree - vie);
    var desordre = opt.desordre === undefined ? 0.22 : opt.desordre;
    var graine = opt.graine || 1;
    var axe = AXES[opt.sens] || AXES.bas;
    var couleur = couleurDe(el, opt.couleur);

    var cols = Math.max(1, Math.ceil(r.width / maille));
    var lignes = Math.max(1, Math.ceil(r.height / maille));
    /* Garde-fou : au-dela de 1 400 tuiles on grossit la maille
       plutot que de peindre. Un passage qui coute plus qu'il
       n'apporte tombe sous sa propre regle. */
    while (cols * lignes > 1400) {
      maille = Math.round(maille * 1.25);
      cols = Math.max(1, Math.ceil(r.width / maille));
      lignes = Math.max(1, Math.ceil(r.height / maille));
    }

    var dpr = Math.min(root.devicePixelRatio || 1, 2);
    var cv = doc.createElement("canvas");
    cv.width = Math.round(r.width * dpr);
    cv.height = Math.round(r.height * dpr);
    cv.setAttribute("aria-hidden", "true");
    cv.className = "trame-voile";
    /* CHAQUE VOILE DIT DE QUEL PASSAGE IL EST. Sans ce nom, un  D-563 */
    if (opt.nom) cv.setAttribute("data-passage", opt.nom);
    cv.style.cssText =
      "position:fixed;left:0;top:0;width:" + r.width + "px;height:" + r.height + "px;" +
      "pointer-events:none;z-index:" + (opt.z || 40) + ";will-change:transform;" +
      "transform:translate3d(" + r.left + "px," + r.top + "px,0)";
    (opt.hote || doc.body).appendChild(cv);

    var ctx = cv.getContext("2d", { alpha: true });
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    /* Les delais sont calcules UNE FOIS. Les recalculer a chaque
       image reviendrait a payer 700 racines carrees soixante fois
       par seconde pour un resultat qui ne bouge pas. */
    var delais = new Float32Array(cols * lignes);
    for (var y = 0; y < lignes; y++) {
      for (var x = 0; x < cols; x++) {
        var fx = cols === 1 ? 0.5 : x / (cols - 1);
        var fy = lignes === 1 ? 0.5 : y / (lignes - 1);
        var p = axe(fx, fy);
        var j = grain(graine, x, y) * desordre;
        delais[y * cols + x] = Math.min(1, Math.max(0, p * (1 - desordre) + j)) * etale;
      }
    }

    var debut = 0;
    var obj = { el: el, cv: cv, mort: false };

    /* LA MUTATION PART AVANT LE DEMONTAGE.  D-634 */
    function fin() {
      if (obj.mort) return;
      obj.mort = true;
      if (opt.onFin) opt.onFin();
      if (cv.parentNode) cv.parentNode.removeChild(cv);
      var i = actifs.indexOf(obj);
      if (i >= 0) actifs.splice(i, 1);
    }
    obj.tuer = fin;

    function image(t) {
      if (obj.mort) return;
      if (!debut) debut = t;
      var ecoule = t - debut;

      /* La cible peut bouger pendant le passage : une frontiere  D-564 */
      if (!pleinEcran) {
        var b = el.getBoundingClientRect();
        cv.style.transform = "translate3d(" + b.left + "px," + b.top + "px,0)";
      }

      ctx.clearRect(0, 0, r.width, r.height);
      ctx.fillStyle = couleur;

      var reste = 0;
      for (var y2 = 0; y2 < lignes; y2++) {
        for (var x2 = 0; x2 < cols; x2++) {
          var d = delais[y2 * cols + x2];
          var u = (ecoule - d) / vie;
          if (u < 0) u = 0; else if (u > 1) u = 1;
          if (u < 1) reste++;
          /* `versLeVide` : la tuile part (DEGAGER). Sinon elle
             arrive (COUVRIR) — la reciproque exacte, pas une
             seconde idee. */
          var s = versLeVide ? 1 - sortie(u) : sortie(u);
          if (s <= 0.001) continue;
          var cx = x2 * maille + maille / 2;
          var cy = y2 * maille + maille / 2;
          var m = maille * s;
          /* Arrondi au pixel : une tuile a 0,4 px de bord rend une
             arete grise, et une arete grise est un fondu. */
          ctx.fillRect(Math.round(cx - m / 2), Math.round(cy - m / 2), Math.round(m), Math.round(m));
        }
      }

      if (ecoule >= duree && !reste) { fin(); return; }
      if (ecoule > duree + 200) { fin(); return; }
      root.requestAnimationFrame(image);
    }

    actifs.push(obj);
    /* Premiere image tout de suite : sans elle le voile
       apparaitrait a la deuxieme image et on verrait la cible
       nue pendant 16 ms — un clignotement. */
    image(performance.now());
    return obj;
  }

  /* == L'API. Deux gestes et leur reciproque, rien d'autre. == */
  var API = {
    /* La cible est deja peinte : la trame la recouvre a la
       premiere image, puis se retire. On DEGAGE ce qui est la. */
    degager: function (el, opt) { return passage(el, opt, true); },

    /* La reciproque : la trame avance et recouvre. Sert aux
       fermetures — une fermeture repasse par ou l'ouverture est
       venue, sinon ce sont deux idees au lieu d'une. */
    couvrir: function (el, opt) { return passage(el, opt, false); },

    /* Le sens inverse d'un sens. Une reciproque ne se decide pas
       au cas par cas : elle se calcule. */
    inverse: function (sens) {
      return { bas: "haut", haut: "bas", droite: "gauche", gauche: "droite",
        radial: "radial-inverse", "radial-inverse": "radial" }[sens] || "haut";
    },

    /* Tout arreter — le palier 2 doit pouvoir tuer en vol ce
       qu'on vient de decider trop cher. */
    tout_arreter: function () { actifs.slice().forEach(function (o) { o.tuer(); }); },

    actifs: function () { return actifs.length; }
  };

  root.ADEXWEB_TRAME = API;
})(window);
