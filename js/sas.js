/* == SAS — les trois pistes de l'arc de luminance ==  D-573 */

(function (root) {
  "use strict";

  var doc = root.document;
  if (!doc) return;

  /* == Les portes. Toutes fermees = le fichier ne fait RIEN, et  D-574
     les sas restent les bandes de seuil d'avant. == */
  /* La decision est prise dans le HEAD, avant la premiere mise en
     page : ici on la LIT, on ne la reprend pas. `langue.js` pose
     data-palier apres nous ; l'attribut absent vaut « pas encore
     retrograde ». */
  if (!doc.documentElement.classList.contains("sas-ok")) return;
  var palier0 = doc.documentElement.getAttribute("data-palier");
  if (palier0 && palier0 !== "0") return;
  if (typeof root.gsap === "undefined" || typeof root.ScrollTrigger === "undefined") return;

  root.gsap.registerPlugin(root.ScrollTrigger);
  var gsap = root.gsap;

  function $(s, c) { return (c || doc).querySelector(s); }

  /* Bruit deterministe — la meme graine rend la meme pluie. */
  function pseudo(a, b) {
    var s = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453;
    return s - Math.floor(s);
  }
  /* Amortissement critique en easing : aucun depassement possible. */
  function sortie(u) { var v = 1 - u; return 1 - v * v * v; }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  var vivants = [];

  /* == LE LISSAGE — le correctif de la saccade.  D-589
     `scrub: true` recopie la position de defilement TELLE QUELLE.
     Or une molette n'avance pas de facon continue : elle envoie des
     paliers de 100 px. Les grains se teleportaient donc d'un paquet
     au suivant, et le seul moment du site cense prouver notre
     maitrise etait le seul a saccader. Mesure : 60 i/s des le
     depart — le probleme n'a JAMAIS ete le nombre de grains, il
     etait dans la marche d'escalier de l'entree.
     `scrub: <nombre>` interpose un rattrapage joue sur le rythme
     d'affichage : la progression devient continue entre deux crans.
     Ce que le sas garantissait reste vrai — a l'ARRET la
     progression converge vers la valeur exacte de la position, donc
     une meme position de defilement rend toujours la meme image, et
     s'arreter en plein vol reste un etat legitime. == */
  var LISSE = 0.45;

  /* == LA FORGE — la limaille tombe, puis S'ALIGNE en mot.  D-575
     Pilotee par la progression, jamais par le temps : chaque
     position de defilement rend exactement la meme image, et
     l'arret en plein vol est un etat legitime du sas.

     DEUX MOUVEMENTS, PAS UN.  D-587
     La premiere version faisait converger chaque grain en droite
     ligne vers sa place : un nuage rectangulaire qui se resserrait
     sans jamais rien dire, et 1,79 % de pixels bouges entre deux
     images — un moment qu'on ne remarque pas n'existe pas.
     Maintenant :
       1. CHUTE (haut vers bas — le sens de lecture d'une page) :
          chaque grain tombe jusqu'a sa HAUTEUR finale, mais reste
          decale lateralement. Il se forme un BANC de limaille, plus
          large que le mot, avec le profil de masse du texte.
       2. ALIGNEMENT (V2, ζ = 1) : les grains se reprennent
          horizontalement. Le banc se compacte et les lettres
          apparaissent d'elles-memes.
     Les deux ne se chevauchent jamais : le banc est complet avant
     que l'alignement commence. == */
  var BANC = 0.58;   /* part de la course d'un grain passee a tomber */
  var ETAL = 0.50;   /* etalement des departs : 0 = tous ensemble */

  function Forge(canvas, mot) {
    this.ok = false;
    this.canvas = canvas;
    this.mot = mot;
    this.lastP = -1;
    this.w0 = 0;
  }

  Forge.prototype.batir = function () {
    var mot = this.mot, canvas = this.canvas;
    var boite = mot.getBoundingClientRect();
    if (boite.width < 8 || boite.height < 8) return false;

    /* Marges SYMETRIQUES, et ce n'est pas un detail de confort : le
       canevas et le mot partagent le meme centre par CSS. Une marge
       haute plus grande que la basse decalerait les grains du vrai
       mot, et le CRAN se verrait comme un saut. */
    var margeX = Math.round(boite.width * 0.10);
    var margeY = Math.round(boite.height * 1.25);
    var cw = Math.round(boite.width + margeX * 2);
    var ch = Math.round(boite.height + margeY * 2);
    /* Le grain de la signature mesure 2 px de COTE CSS. Le peindre a
       la densite de l'ecran le rendrait plus fin que la trame qu'il
       prolonge, et multiplierait par quatre le cout de la passe. */
    var dpr = 1;

    canvas.width = cw;
    canvas.height = ch;
    canvas.style.width = cw + "px";
    canvas.style.height = ch + "px";

    var st = getComputedStyle(mot);
    var off = doc.createElement("canvas");
    off.width = cw; off.height = ch;
    var octx = off.getContext("2d", { alpha: true, willReadFrequently: true });
    if (!octx) return false;
    octx.font = st.fontWeight + " " + st.fontSize + " " + st.fontFamily;
    try { octx.fontStretch = st.fontStretch; } catch (e) { /* moteur sans l'axe */ }
    try { octx.letterSpacing = st.letterSpacing; } catch (e) { /* idem */ }
    octx.textAlign = "center";
    octx.textBaseline = "middle";
    octx.fillStyle = "#fff";
    octx.fillText(mot.textContent, cw / 2, ch / 2);

    var data;
    try { data = octx.getImageData(0, 0, cw, ch).data; }
    catch (e) { return false; }

    /* Couleurs lues dans la page. La chambre ne depend pas du  D-586
       theme : ses jetons sont nommes, pas deduits d'une inversion. */
    var rac = getComputedStyle(doc.documentElement);
    var enc = rac.getPropertyValue("--chambre-ink").trim() || st.color;
    var acc = rac.getPropertyValue("--chambre-accent").trim() || "#e8562f";

    function pack(v) {
      var h = v.trim();
      if (h.charAt(0) === "#") {
        h = h.slice(1);
        if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
        return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
      }
      var mm = h.match(/\d+/g) || [220, 222, 219];
      return [+mm[0], +mm[1], +mm[2]];
    }
    var ce = pack(enc), ca = pack(acc);
    this.tons = ["rgb(" + ce[0] + "," + ce[1] + "," + ce[2] + ")",
                 "rgb(" + ca[0] + "," + ca[1] + "," + ca[2] + ")"];

    var xs = [], ys = [], tn = [];
    var pas = 3;
    for (var y = 0; y < ch; y += pas) {
      for (var x = 0; x < cw; x += pas) {
        if (data[(y * cw + x) * 4 + 3] > 170) {
          xs.push(x + (pseudo(x, y) - 0.5) * pas * 0.7);
          ys.push(y + (pseudo(y, x + 977) - 0.5) * pas * 0.7);
          tn.push(pseudo(x + 31, y + 17) < 0.13 ? 1 : 0);
        }
      }
    }
    var n = this.n = xs.length;
    if (!n) return false;

    this.tgt = new Float32Array(n * 2);   /* la place finale */
    this.banc = new Float32Array(n);      /* le x du banc, avant reprise */
    this.dep = new Float32Array(n);       /* le y de depart, au-dessus */
    this.ret = new Float32Array(n);
    this.ton = new Uint8Array(n);
    for (var i = 0; i < n; i++) {
      this.tgt[i * 2] = xs[i];
      this.tgt[i * 2 + 1] = ys[i];
      this.banc[i] = xs[i] + (pseudo(i * 7 + 3, i * 3 + 1) - 0.5) * cw * 0.15;
      this.dep[i] = ys[i] - (0.35 + pseudo(i * 13 + 11, i * 5 + 7) * 0.9) * ch;
      /* Le minium se pose EN DERNIER : la piece finit de se prendre
         sur une derniere pincee de couleur d'action. */
      this.ret[i] = tn[i]
        ? 0.52 + pseudo(i * 17 + 5, i * 11 + 13) * 0.48
        : pseudo(i * 17 + 5, i * 11 + 13) * 0.86;
      this.ton[i] = tn[i];
    }

    var ctx = canvas.getContext("2d");
    if (!ctx) return false;
    this.ctx = ctx;
    this.cw = cw; this.ch = ch; this.dpr = dpr;
    this.g = 2;
    this.w0 = Math.round(boite.width);
    this.ok = true;
    this.lastP = -1;
    return true;
  };

  Forge.prototype.peindre = function (p) {
    if (!this.ok) return;
    if (Math.abs(p - this.lastP) < 0.0015) return;
    this.lastP = p;

    var ctx = this.ctx, w = this.cw, h = this.ch, g = this.g;
    ctx.clearRect(0, 0, w, h);

    var n = this.n;
    var tgt = this.tgt, banc = this.banc, dep = this.dep, ret = this.ret, ton = this.ton;

    /* Deux passes, une par ton : changer `fillStyle` cinq mille fois
       coute plus cher que parcourir la table deux fois. */
    for (var t = 0; t < 2; t++) {
      ctx.fillStyle = this.tons[t];
      for (var i = 0; i < n; i++) {
        if (ton[i] !== t) continue;
        var u = clamp((p - ret[i] * ETAL) / (1 - ETAL), 0, 1);
        var a = sortie(clamp(u / BANC, 0, 1));
        var b = sortie(clamp((u - BANC) / (1 - BANC), 0, 1));
        var bx = banc[i];
        var x = (bx + (tgt[i * 2] - bx) * b) | 0;
        var y = (dep[i] + (tgt[i * 2 + 1] - dep[i]) * a) | 0;
        if (x < 0 || y < 0 || x > w - g || y > h - g) continue;
        ctx.fillRect(x, y, g, g);
      }
    }
  };

  Forge.prototype.vider = function () {
    if (!this.ok) return;
    if (this.lastP === -2) return;
    this.lastP = -2;
    this.ctx.clearRect(0, 0, this.cw, this.ch);
  };

  /* == Les trois pistes == */
  function armer() {
    $$sas().forEach(function (sas) {
      var genre = sas.getAttribute("data-sas");
      var piste = $(".sas-piste", sas);
      var scene = $(".sas-scene", sas);
      var volet = $("[data-sas-volet]", sas);
      var seuil = $("[data-seuil]", sas);
      /* La remontee est un calque sans piste ; les deux autres
         exigent leur scene collante. */
      if (genre !== "remontee" && (!piste || !scene)) return;
      if (genre === "remontee" && !volet) return;

      sas.classList.add("sas-actif");
      /* Le G4 du seuil est ABSORBE par le sas : deux voleurs sur la  D-576
         meme frontiere seraient le piege 27. langue.js lit l'attribut
         apres nous — l'ordre des vagues est l'argument. */
      if (seuil && genre !== "cloture") seuil.removeAttribute("data-verbe");

      if (genre === "descente") {
        var mot = $("[data-sas-mot]", sas);
        var canvas = $("[data-sas-forge]", sas);
        var filD = $("[data-sas-fil]", sas);
        var forge = canvas && mot ? new Forge(canvas, mot) : null;
        var batie = false;

        /* LES TROIS TEMPS, ET AUCUN NE MORD SUR LE SUIVANT.  D-588
           Deux defauts corriges d'un coup.
           1. Le volet AVAIT une descente en `yPercent`, de 0 a 0,42
              de la course. Elle ne s'est jamais vue : la scene est
              COLLANTE, donc elle n'est epinglee qu'a partir du
              moment ou le haut de la piste touche le haut de la
              fenetre — c'est-a-dire a 100vh de course, soit p = 0,42
              sur 240vh. Toute la descente du volet se jouait dans
              une scene encore en train d'entrer par le bas. Releve :
              a p = 0,20, le bord bas du volet etait a 964 px, soit
              64 px SOUS la fenetre. Le balayage est supprime ; la
              plaque est deja la et c'est le visiteur qui descend
              dedans, ce qui est la definition exacte de V1.  D-592
           2. La limaille etait peinte jusqu'a 0,94 alors que le vrai
              mot etait pose des 0,86 : pendant 8 % de la course elle
              GRIFFONNAIT par-dessus un texte deja peint. Ce n'etait
              pas une forge, c'etait une panne d'affichage.
             0,00 → 0,42  la plaque d'encre entre, arete de grains
                          en tete (le defilement EST le balayage)
             0,45 → 0,88  la limaille tombe puis s'aligne (V2)
             0,90         CRAN : le canevas se vide, le mot est la (V4)
             0,91 → 1,00  le fil minium tire vers la piece (V3)
           A 0,88 tous les grains sont a leur place. Les deux pour
           cent qui suivent sont la marge : le CRAN tombe sur une
           image ou plus rien ne bouge. */
        var st = root.ScrollTrigger.create({
          trigger: piste, start: "top bottom", end: "bottom bottom", scrub: LISSE,
          onUpdate: function (self) {
            var p = self.progress;
            if (forge && !batie && p > 0.24) batie = forge.batir();
            if (forge && batie) {
              if (p >= 0.45 && p < 0.90) forge.peindre(clamp((p - 0.45) / 0.43, 0, 1));
              else forge.vider();
            }
            if (mot) mot.classList.toggle("est-la", p >= 0.90);
            if (filD) gsap.set(filD, { scaleY: clamp((p - 0.91) / 0.09, 0, 1) });
          }
        });
        vivants.push(st);

        /* Un changement de largeur change le corps du mot : la table
           de grains devient fausse et le CRAN sauterait. On la jette,
           elle se refait au prochain passage. */
        var minuteur = 0;
        root.addEventListener("resize", function () {
          root.clearTimeout(minuteur);
          minuteur = root.setTimeout(function () {
            if (!forge || !batie) return;
            if (Math.abs(Math.round(mot.getBoundingClientRect().width) - forge.w0) < 2) return;
            batie = false;
            forge.ok = false;
            forge.lastP = -1;
          }, 180);
        }, { passive: true });
      }

      if (genre === "remontee") {
        /* Le calque part couvrant, se degage vers le haut pendant
           que le visiteur entre dans le Calculateur. `y: 0` purge la
           base en PIXELS que GSAP lit dans le transform CSS de repos
           (-102 % resolu en px) — sans lui, yPercent s'additionne et
           le volet joue sa course deja hors ecran. */
        gsap.fromTo(volet, { y: 0, yPercent: 0 }, {
          y: 0, yPercent: -102, ease: "none", immediateRender: false,
          scrollTrigger: {
            trigger: sas, start: "top 85%",
            end: "+=" + Math.round(root.innerHeight * 1.15),
            scrub: LISSE
          }
        });
      }

      if (genre === "cloture") {
        var fil = $("[data-sas-fil]", sas);
        if (fil) {
          /* Le fil finit sa course quand la bande touche le bas de
             l'ecran : il s'y SOUDE, il ne pend pas dans le vide. */
          gsap.fromTo(fil, { scaleY: 0 }, {
            scaleY: 1, ease: "none", immediateRender: false,
            scrollTrigger: {
              trigger: piste, start: "top bottom", end: "bottom bottom", scrub: LISSE
            }
          });
        }
      }
    });
  }

  function $$sas() {
    return Array.prototype.slice.call(doc.querySelectorAll(".sas[data-sas]"));
  }

  /* == L'escalade de palier fige les sas SANS les replier : une  D-577
     piste qui perd sa hauteur en pleine lecture fait sauter la page.
     Les volets se posent a leur forme finale, la forge disparait. == */
  var garde = new MutationObserver(function () {
    if (doc.documentElement.getAttribute("data-palier") === "0") return;
    garde.disconnect();
    vivants.forEach(function (v) { try { v.kill(); } catch (e) { } });
    root.ScrollTrigger.getAll().forEach(function (st) {
      var t = st.vars && st.vars.trigger;
      if (t && t.classList &&
        (t.classList.contains("sas-piste") || t.classList.contains("sas"))) {
        try { st.kill(); } catch (e) { }
      }
    });
    $$sas().forEach(function (sas) {
      var genre = sas.getAttribute("data-sas");
      var volet = $("[data-sas-volet]", sas);
      var fil = $("[data-sas-fil]", sas);
      var canvas = $("[data-sas-forge]", sas);
      var mot = $("[data-sas-mot]", sas);
      if (volet) gsap.set(volet, { yPercent: genre === "remontee" ? -102 : 0 });
      if (fil) gsap.set(fil, { scaleY: 1 });
      if (canvas) canvas.style.display = "none";
      if (mot) mot.classList.add("est-la");
    });
  });
  garde.observe(doc.documentElement, { attributes: true, attributeFilter: ["data-palier"] });

  armer();
})(window);
