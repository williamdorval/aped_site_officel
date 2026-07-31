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

  /* == LA FORGE — les grains pleuvent et deviennent le mot.  D-575
     Pilotee par la progression, jamais par le temps : chaque
     position de defilement rend exactement la meme image, et
     l'arret en plein vol est un etat legitime du sas. == */
  function Forge(canvas, mot) {
    this.ok = false;
    this.canvas = canvas;
    this.mot = mot;
    this.lastP = -1;
  }

  Forge.prototype.batir = function () {
    var mot = this.mot, canvas = this.canvas;
    var boite = mot.getBoundingClientRect();
    if (boite.width < 8 || boite.height < 8) return false;

    var marge = Math.round(boite.height * 1.1);
    var cw = Math.round(boite.width + marge);
    var ch = Math.round(boite.height + marge * 2);
    var dpr = Math.min(root.devicePixelRatio || 1, 1.5);

    canvas.width = Math.round(cw * dpr);
    canvas.height = Math.round(ch * dpr);
    canvas.style.width = cw + "px";
    canvas.style.height = ch + "px";

    var st = getComputedStyle(mot);
    var off = doc.createElement("canvas");
    off.width = cw; off.height = ch;
    var octx = off.getContext("2d", { alpha: true, willReadFrequently: true });
    if (!octx) return false;
    octx.font = st.fontWeight + " " + st.fontSize + " " + st.fontFamily;
    try { octx.fontStretch = st.fontStretch; } catch (e) { /* moteur sans l'axe */ }
    octx.textAlign = "center";
    octx.textBaseline = "middle";
    octx.fillStyle = "#fff";
    octx.fillText(mot.textContent, cw / 2, ch / 2);

    var data;
    try { data = octx.getImageData(0, 0, cw, ch).data; }
    catch (e) { return false; }

    /* Couleurs lues dans la page : la masse est l'encre du volet,
       une part des grains est minium. Jamais de valeur en dur. */
    var enc = st.color;
    var acc = getComputedStyle(doc.documentElement).getPropertyValue("--accent").trim() || "#c8371b";

    function packCss(css) {
      var mm = css.match(/\d+/g) || [220, 222, 219];
      return ((255 << 24) | ((+mm[2]) << 16) | ((+mm[1]) << 8) | (+mm[0])) >>> 0;
    }
    function packHex(hex) {
      var h = hex.replace("#", "");
      if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
      return ((255 << 24) | (parseInt(h.slice(4, 6), 16) << 16) |
        (parseInt(h.slice(2, 4), 16) << 8) | parseInt(h.slice(0, 2), 16)) >>> 0;
    }
    this.tons = [packCss(enc), acc.charAt(0) === "#" ? packHex(acc) : packCss(acc)];

    var xs = [], ys = [], tn = [];
    var pas = 3;
    for (var y = 0; y < ch; y += pas) {
      for (var x = 0; x < cw; x += pas) {
        if (data[(y * cw + x) * 4 + 3] > 170) {
          xs.push(x + (pseudo(x, y) - 0.5) * pas * 0.7);
          ys.push(y + (pseudo(y, x + 977) - 0.5) * pas * 0.7);
          tn.push(pseudo(x + 31, y + 17) < 0.14 ? 1 : 0);
        }
      }
    }
    var n = this.n = xs.length;
    if (!n) return false;

    this.tgt = new Float32Array(n * 2);
    this.dep = new Float32Array(n * 2);
    this.ret = new Float32Array(n);
    this.ton = new Uint8Array(n);
    for (var i = 0; i < n; i++) {
      this.tgt[i * 2] = xs[i];
      this.tgt[i * 2 + 1] = ys[i];
      /* La pluie : chaque grain part au-dessus de sa place, dans le
         sens de lecture d'une page — haut vers bas. */
      this.dep[i * 2] = xs[i] + (pseudo(i * 7 + 3, i * 3 + 1) - 0.5) * cw * 0.14;
      this.dep[i * 2 + 1] = ys[i] - (0.25 + pseudo(i * 13 + 11, i * 5 + 7) * 0.95) * ch;
      this.ret[i] = pseudo(i * 17 + 5, i * 11 + 13);
      this.ton[i] = tn[i];
    }

    var ctx = canvas.getContext("2d");
    if (!ctx) return false;
    this.ctx = ctx;
    this.image = ctx.createImageData(canvas.width, canvas.height);
    this.buf = new Uint32Array(this.image.data.buffer);
    this.cw = cw; this.ch = ch; this.dpr = dpr;
    this.ok = true;
    return true;
  };

  Forge.prototype.peindre = function (p) {
    if (!this.ok) return;
    if (Math.abs(p - this.lastP) < 0.001) return;
    this.lastP = p;

    var buf = this.buf, w = this.canvas.width, h = this.canvas.height;
    buf.fill(0);

    var n = this.n, dpr = this.dpr;
    var g = Math.max(1, Math.round(1.6 * dpr));
    var S = 0.55;

    for (var i = 0; i < n; i++) {
      var d = this.ret[i] * S;
      var u = clamp((p - d) / (1 - S), 0, 1);
      var e = sortie(u);
      var x = ((this.dep[i * 2] + (this.tgt[i * 2] - this.dep[i * 2]) * e) * dpr) | 0;
      var y = ((this.dep[i * 2 + 1] + (this.tgt[i * 2 + 1] - this.dep[i * 2 + 1]) * e) * dpr) | 0;
      if (x < 0 || y < 0 || x > w - g || y > h - g) continue;
      var c = this.tons[this.ton[i]];
      var base = y * w + x;
      for (var gy = 0; gy < g; gy++) {
        var row = base + gy * w;
        for (var gx = 0; gx < g; gx++) buf[row + gx] = c;
      }
    }
    this.ctx.putImageData(this.image, 0, 0);
  };

  Forge.prototype.vider = function () {
    if (!this.ok) return;
    if (this.lastP === -2) return;
    this.lastP = -2;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
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

        gsap.fromTo(volet, { yPercent: -101 }, {
          yPercent: 0, ease: "none", immediateRender: false,
          scrollTrigger: {
            trigger: piste, start: "top bottom", end: "55% bottom", scrub: true
          }
        });

        var st = root.ScrollTrigger.create({
          trigger: piste, start: "top bottom", end: "bottom bottom", scrub: true,
          onUpdate: function (self) {
            var p = self.progress;
            if (forge && !batie && p > 0.2) batie = forge.batir();
            if (forge && batie) {
              if (p > 0.4 && p < 0.94) {
                forge.peindre(clamp((p - 0.42) / 0.46, 0, 1));
              } else if (p >= 0.94) {
                forge.vider();
              } else {
                forge.vider();
              }
            }
            /* Le mot bascule d'un CRAN, jamais en fondu. Une seule
               image le separe d'absent a present. */
            if (mot) mot.classList.toggle("est-la", p >= 0.86);
            /* Puis le fil minium nait sous le mot et tire vers la
               piece — il donne sa direction a la sortie du sas. */
            if (filD) gsap.set(filD, { scaleY: clamp((p - 0.88) / 0.12, 0, 1) });
          }
        });
        vivants.push(st);
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
            scrub: true
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
              trigger: piste, start: "top bottom", end: "bottom bottom", scrub: true
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
