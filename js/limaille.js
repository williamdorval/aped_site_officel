/* ============================================================
   LIMAILLE — moteur de champ de grains
   ------------------------------------------------------------
   LE MOTIF SIGNATURE D'APED, en une phrase :
   une matiere dure qui tient une forme nette sous tension,
   qui s'ecarte sous la pointe, et qui se reprend d'elle-meme.

   Ce n'est pas de la fumee, c'est de la limaille. Les grains sont
   durs, l'amortissement est critique, la forme au repos est NETTE.

   QUATRE ECARTS ASSUMES AVEC LA TECHNIQUE DE REFERENCE :

   1. AUCUN WEBGL, AUCUNE DEPENDANCE. La reference dessine ses
      particules une par une en WebGL. Ici on ecrit directement
      dans un buffer ImageData, puis un seul putImageData par
      image. Le cout devient lineaire en ecritures memoire, donc
      on peut se payer beaucoup PLUS de grains beaucoup PLUS
      petits — exactement ce qu'il faut pour rendre des MOTS
      lisibles la ou la reference n'affichait qu'une lettre.
      On perd la profondeur en z, remplacee par une modulation de
      ton, plus juste pour un langage imprime.

   2. SEUIL ALPHA A 170, PAS A 128. A 128 on ramasse les pixels de
      bord semi-transparents de l'anticrenelage, ce qui entoure
      chaque lettre d'un halo de grains fantomes. C'est
      litteralement le « ca fond » que la direction interdit.
      A 170 l'arete est franche et les contreformes restent
      ouvertes.

   3. ECHANTILLONNAGE EN PIXELS CSS, RENDU EN PIXELS ECRAN. Si on
      echantillonne dans l'espace du peripherique, le nombre de
      grains varie d'un facteur 4 entre un ecran DPR 1 et un DPR 2
      et tout le reglage physique s'ecroule. Toute la simulation
      vit en pixels CSS ; la conversion n'a lieu qu'au trace.

   4. VERROU AU REPOS + ARRET COMPLET. Quand un grain arrive a
      moins d'un tiers de pixel de sa cible, il y est colle et sa
      vitesse est mise a zero : l'etat de repos du champ est le
      rendu EXACT de la typographie. Le mot au repos ne
      « ressemble » pas a du texte, c'en est. Et quand tous les
      grains sont verrouilles sans pointeur, la boucle s'arrete :
      zero image par seconde, zero batterie.
   ============================================================ */

(function (root) {
  "use strict";

  /* Couleur empaquetee pour un Uint32Array en little-endian : ABGR. */
  function pack(hex, alpha) {
    var h = String(hex).replace("#", "").trim();
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    var r = parseInt(h.slice(0, 2), 16);
    var g = parseInt(h.slice(2, 4), 16);
    var b = parseInt(h.slice(4, 6), 16);
    var a = Math.round((alpha === undefined ? 1 : alpha) * 255);
    return ((a << 24) | (b << 16) | (g << 8) | r) >>> 0;
  }

  function toRgb(hex) {
    var h = String(hex).replace("#", "").trim();
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  }

  function mix(hex1, hex2, t) {
    var a = toRgb(hex1), b = toRgb(hex2);
    var c = [0, 1, 2].map(function (i) { return Math.round(a[i] + (b[i] - a[i]) * t); });
    return "#" + c.map(function (v) { return ("0" + v.toString(16)).slice(-2); }).join("");
  }

  function easeInOut(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  /* Bruit deterministe. Pas de Math.random : deux echantillonnages
     successifs donnent la meme matiere au meme endroit, donc aucun
     scintillement au redimensionnement. */
  function pseudo(a, b) {
    var s = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453;
    return s - Math.floor(s);
  }

  /* ------------------------------------------------------------ */
  function Limaille(canvas, opt) {
    opt = opt || {};
    this.canvas = canvas;
    this.ctx = null;
    this.dead = false;
    try {
      /* LE CONTEXTE EST ALPHA, ET C'EST UNE CORRECTION DE BOGUE.
         Il etait en `alpha: false`, donc le champ peignait un fond
         OPAQUE pris dans `--surface-0` au moment de la composition.
         Consequence mesuree : la bascule de theme ne recomposait
         rien, et un visiteur arrive en sombre puis passe en clair
         gardait un bloc noir pose sur le ciment. C'etait le defaut
         « le hero reste noir en mode clair ».
         Avec un contexte alpha et un fond transparent, la surface
         derriere la plaque est celle de la PAGE : elle suit le theme
         toute seule et elle profite meme de la transition de 520 ms
         de la bascule. Il ne reste plus qu'a recolorer les grains,
         ce que fait `recolor()` dans `hero.js`. */
      this.ctx = canvas.getContext("2d");
    } catch (e) { /* repli gere par l'appelant */ }
    if (!this.ctx) { this.dead = true; return; }

    this.o = {
      /* Pas d'echantillonnage EN PIXELS CSS. Plus il est petit,
         plus la matiere est fine et dense. */
      stride: opt.stride || 2,
      /* Seuil d'inclusion. 170, pas 128 : voir l'ecart 2 en tete. */
      alpha: opt.alpha === undefined ? 170 : opt.alpha,
      /* Desordre par cellule, en fraction de pas. Empeche que les
         bords aient l'air d'une grille. Volontairement faible :
         la direction veut des aretes nettes, pas du flou. */
      jitter: opt.jitter === undefined ? 0.32 : opt.jitter,
      /* Ressort critiquement amorti. omega est la pulsation propre
         en rad/s : elle seule fixe la vitesse de rappel, et
         zeta = 1 garantit qu'il n'y a JAMAIS de depassement.
         Un ressort qui rebondit ferait flotter les lettres. */
      omegaRest: opt.omegaRest === undefined ? 21 : opt.omegaRest,
      omegaStart: opt.omegaStart === undefined ? 7 : opt.omegaStart,
      /* Dissipation supplementaire appliquee a la vitesse. Forte au
         repos : c'est elle qui fait que le mot lit comme de l'encre
         et pas comme une comete. Exprimee par seconde, donc
         independante de la frequence d'images. */
      restDrag: opt.restDrag === undefined ? 0.55 : opt.restDrag,
      moveDrag: opt.moveDrag === undefined ? 0.86 : opt.moveDrag,
      /* Decalage du depart selon la graine : la forme se compose en
         vague, jamais d'un coup. */
      stagger: opt.stagger === undefined ? 0.42 : opt.stagger,
      /* Repulsion. Rayon en pixels CSS, pose par setRepelRadius
         depuis la hauteur de capitale du PETIT mot : on creuse un
         sillon, pas un cratere. */
      /* Repulsion. ATTENTION A L'ECHELLE : a l'equilibre le
         deplacement d'un grain vaut force / k, avec k = omega^2.
         A omega 21, k vaut 441, donc une force de 210 ne creuse
         que 0,48 px — invisible. Pour un sillon de 34 px il faut
         une force de l'ordre de 34 * 441, soit 15 000. */
      repelRadius: opt.repelRadius || 68,
      repelStrength: opt.repelStrength === undefined ? 15000 : opt.repelStrength,
      pulseStrength: opt.pulseStrength === undefined ? 52000 : opt.pulseStrength,
      pulseRadius: opt.pulseRadius || 200,
      /* Part de grains rendus dans l'encre de densite. */
      inkRatio: opt.inkRatio === undefined ? 0.12 : opt.inkRatio
    };

    this.dpr = 1;
    this.cw = 0; this.ch = 0;   /* pixels CSS */
    this.w = 0; this.h = 0;     /* pixels ecran */

    this.n = 0;
    this.pos = null; this.vel = null; this.tgt = null;
    this.seed = null; this.tone = null; this.lock = null;

    this.tones = new Uint32Array(3);
    this.bg = 0;

    this.phase = 1;
    this.entering = false;
    this.entryStart = 0;
    this.entryMs = 1000;

    this.px = -1e6; this.py = -1e6; this.hasPointer = false;
    this.pulses = [];

    this.raf = 0;
    this.running = false;
    this.settled = false;
    this.visible = true;
    this.reduced = false;
    this.last = 0;
    this.fpsSamples = [];
  }

  Limaille.prototype.setColors = function (bgHex, massHex, inkHex) {
    this.bgHex = bgHex; this.massHex = massHex; this.inkHex = inkHex;
    /* Fond TRANSPARENT : c'est la surface de la page qui se voit, donc
       le champ n'a aucune couleur de fond a tenir a jour. `bgHex` reste
       dans la signature parce qu'il sert de reference documentaire au
       calibrage des tons, et pour ne pas casser les appelants. */
    this.bg = 0;
    this.tones[0] = pack(massHex, 1);
    this.tones[1] = pack(inkHex, 1);
    /* Ton du grain deplace : la masse tiree vers l'encre. C'est ce
       qui remplace la profondeur en z de la reference — un grain
       sorti de sa place s'enfonce visuellement. */
    this.tones[2] = pack(mix(massHex, inkHex, 0.58), 1);
  };

  Limaille.prototype.resize = function (cssW, cssH) {
    if (this.dead) return;
    this.dpr = Math.min(root.devicePixelRatio || 1, 2);
    this.cw = Math.max(1, Math.round(cssW));
    this.ch = Math.max(1, Math.round(cssH));
    this.w = Math.max(1, Math.round(this.cw * this.dpr));
    this.h = Math.max(1, Math.round(this.ch * this.dpr));
    this.canvas.width = this.w;
    this.canvas.height = this.h;
    this.canvas.style.width = this.cw + "px";
    this.canvas.style.height = this.ch + "px";
    this.grain = Math.max(1, Math.round(this.dpr));
  };

  /* ------------------------------------------------------------
     compose(draw, bands)

     `draw(ctx, w, h)` rend la composition ENTIERE — les deux mots
     avec leurs tailles et leur interlignage reels — sur un canvas
     hors-ecran en pixels CSS. UN SEUL rendu, UN SEUL
     echantillonnage : ce n'est pas quatre passes qu'on recolle.

     `bands` : [{ y0, y1, stride, inkRatio }] en fraction de
     hauteur. C'est ce qui permet de donner a la petite ligne une
     densite relative PLUS ELEVEE. Repartir un budget fixe a l'aire
     donnerait a AGENCY une poignee de grains, donc de la poussiere
     illisible.
     ------------------------------------------------------------ */
  Limaille.prototype.compose = function (draw, bands, xform) {
    if (this.dead) return 0;
    var w = this.cw, h = this.ch;
    if (!w || !h) return 0;

    var off = root.document.createElement("canvas");
    off.width = w; off.height = h;
    /* willReadFrequently seulement ici : ce canvas n'est fait que
       pour etre lu. Le poser sur le canvas de rendu couterait cher. */
    var octx = off.getContext("2d", { alpha: true, willReadFrequently: true });
    if (!octx) { this.dead = true; return 0; }
    octx.clearRect(0, 0, w, h);
    draw(octx, w, h);

    var data;
    try {
      data = octx.getImageData(0, 0, w, h).data;
    } catch (e) { this.dead = true; return 0; }

    bands = (bands && bands.length) ? bands : [{ y0: 0, y1: 1 }];

    var xs = [], ys = [], tn = [], gz = [];
    var thr = this.o.alpha, jit = this.o.jitter;

    /* La COUVERTURE, c'est (grain / pas) au carre. A pas 2 et grain
       1 elle vaut 25 % : ce qu'on lit dominant est alors le fond
       entre les grains, pas la matiere, et le mot parait delave.
       Chaque bande porte donc son propre couple pas/grain, ce qui
       permet au grand mot d'etre grene et au petit d'etre plein. */
    for (var b = 0; b < bands.length; b++) {
      var band = bands[b];
      var step = Math.max(1, Math.round(band.stride || this.o.stride));
      var grain = Math.max(1, Math.round(band.grain || 1));
      var yA = Math.max(0, Math.floor(band.y0 * h));
      var yB = Math.min(h, Math.ceil(band.y1 * h));
      var ink = band.inkRatio === undefined ? this.o.inkRatio : band.inkRatio;

      for (var y = yA; y < yB; y += step) {
        var rowBase = y * w;
        for (var x = 0; x < w; x += step) {
          if (data[(rowBase + x) * 4 + 3] > thr) {
            var r1 = pseudo(x, y);
            var r2 = pseudo(y, x + 977);
            xs.push(x + (r1 - 0.5) * step * jit * 2);
            ys.push(y + (r2 - 0.5) * step * jit * 2);
            tn.push(pseudo(x + 31, y + 17) < ink ? 1 : 0);
            gz.push(grain);
          }
        }
      }
    }

    var n = xs.length;
    this.n = n;
    if (!n) return 0;

    this.tgt = new Float32Array(n * 2);
    this.pos = new Float32Array(n * 2);
    this.vel = new Float32Array(n * 2);
    this.seed = new Float32Array(n);
    this.tone = new Uint8Array(n);
    this.lock = new Uint8Array(n);
    this.gsz = new Uint8Array(n);

    /* La composition est echantillonnee DROITE, ce qui garde des
       bandes horizontales propres pour la densite par ligne. La
       rotation est ensuite appliquee aux coordonnees cibles, pas au
       canvas hors-ecran : on obtient la plaque posee de travers sans
       perdre le decoupage en bandes. */
    for (var i = 0; i < n; i++) {
      var tx = xs[i], ty = ys[i];
      if (xform) { var p2 = xform(tx, ty); tx = p2[0]; ty = p2[1]; }
      this.tgt[i * 2] = tx;
      this.tgt[i * 2 + 1] = ty;
      this.seed[i] = pseudo(i * 7 + 3, i * 13 + 11);
      this.tone[i] = tn[i];
      this.gsz[i] = gz[i];
    }

    this.imageData = this.ctx.createImageData(this.w, this.h);
    this.buf = new Uint32Array(this.imageData.data.buffer);

    this.seedPositions();
    return n;
  };

  /* Position de depart AVANT le deploiement.
     Pas un nuage aleatoire : ce serait organique et flottant, donc
     contraire a la direction. Les grains partent alignes sur des
     FILETS HORIZONTAUX, le vocabulaire meme du site. La signature
     emerge du systeme de filets, elle ne tombe pas du ciel. */
  Limaille.prototype.seedPositions = function () {
    var n = this.n, h = this.ch, w = this.cw;
    var lines = 15;
    for (var i = 0; i < n; i++) {
      var line = Math.floor(this.seed[i] * lines);
      this.pos[i * 2] = pseudo(i * 3 + 1, i * 5 + 7) * w;
      this.pos[i * 2 + 1] = ((line + 0.5) / lines) * h;
      this.vel[i * 2] = 0;
      this.vel[i * 2 + 1] = 0;
      this.lock[i] = 0;
    }
  };

  Limaille.prototype.snapToTargets = function () {
    for (var i = 0; i < this.n; i++) {
      this.pos[i * 2] = this.tgt[i * 2];
      this.pos[i * 2 + 1] = this.tgt[i * 2 + 1];
      this.vel[i * 2] = 0; this.vel[i * 2 + 1] = 0;
      this.lock[i] = 1;
    }
    this.phase = 1;
    this.entering = false;
  };

  /* Rayon du sillon, calcule depuis la hauteur de capitale du PETIT
     mot : au rayon de la reference, une de nos lettres disparaitrait
     entierement. On creuse, on n'efface pas. */
  Limaille.prototype.setRepelRadius = function (capHeightCss) {
    /* Calibre sur la hauteur de capitale du PETIT mot. A 0,55 le
       sillon etait invisible sur une plaque de 1000 px ; a 1,6 il
       se voit franchement tout en restant tres inferieur a la
       largeur d'une lettre du grand mot, donc il creuse sans
       jamais effacer. */
    this.o.repelRadius = Math.max(28, capHeightCss * 1.6);
    this.o.pulseRadius = Math.max(120, capHeightCss * 4.2);
  };

  Limaille.prototype.enter = function (ms) {
    if (this.dead) return;
    if (this.reduced) { this.snapToTargets(); this.drawFrame(); return; }
    this.entryMs = ms || 1000;
    this.entering = true;
    this.entryStart = 0;
    this.phase = 0;
    this.start();
  };

  Limaille.prototype.pointer = function (x, y) {
    if (this.dead || this.reduced) return;
    this.px = x; this.py = y;
    this.hasPointer = true;
    this.start();
  };

  Limaille.prototype.clearPointer = function () {
    this.hasPointer = false;
    this.px = -1e6; this.py = -1e6;
    this.start();
  };

  Limaille.prototype.pulse = function (x, y) {
    if (this.dead || this.reduced) return;
    this.pulses.push({ x: x, y: y, t: 0 });
    this.start();
  };

  Limaille.prototype.setReduced = function (on) {
    this.reduced = !!on;
    if (on) { this.stop(); this.snapToTargets(); this.drawFrame(); }
  };

  Limaille.prototype.setVisible = function (on) {
    this.visible = !!on;
    if (!on) this.stop();
    else if (!this.settled) this.start();
  };

  Limaille.prototype.start = function () {
    if (this.dead || this.running || !this.visible || this.reduced || !this.n) return;
    this.running = true;
    this.settled = false;
    this.last = 0;
    var self = this;
    var loop = function (t) {
      if (!self.running) return;
      self.step(t);
      self.drawFrame();
      if (self.settled) { self.running = false; self.raf = 0; return; }
      self.raf = root.requestAnimationFrame(loop);
    };
    this.raf = root.requestAnimationFrame(loop);
  };

  Limaille.prototype.stop = function () {
    this.running = false;
    if (this.raf) { root.cancelAnimationFrame(this.raf); this.raf = 0; }
  };

  /* ------------------------------------------------------------
     Integration semi-implicite, ressort critiquement amorti.
     k = w^2, c = 2w  =>  zeta = 1  =>  aucun depassement possible.
     ------------------------------------------------------------ */
  Limaille.prototype.step = function (t) {
    var o = this.o, n = this.n;
    if (!n) { this.settled = true; return; }

    var dt = this.last ? Math.min((t - this.last) / 1000, 1 / 30) : 1 / 60;
    this.last = t;
    if (dt <= 0) dt = 1 / 60;

    if (this.fpsSamples.length < 240) this.fpsSamples.push(dt);

    if (this.entering) {
      if (!this.entryStart) this.entryStart = t;
      this.phase = clamp((t - this.entryStart) / this.entryMs, 0, 1);
      if (this.phase >= 1) this.entering = false;
    }

    var moving = this.entering || this.hasPointer || this.pulses.length > 0;
    /* Dissipation independante de la frequence d'images :
       un ecran a 120 Hz doit donner exactement la meme matiere
       qu'un ecran a 60 Hz. */
    var drag = Math.exp(-(moving ? o.moveDrag : o.restDrag) * 60 * dt * 0.0167 * 60);
    drag = Math.pow(moving ? o.moveDrag : o.restDrag, dt * 60);

    for (var q = this.pulses.length - 1; q >= 0; q--) {
      this.pulses[q].t += dt;
      if (this.pulses[q].t > 0.55) this.pulses.splice(q, 1);
    }

    var rr = o.repelRadius, rr2 = rr * rr, rs = o.repelStrength;
    var px = this.px, py = this.py, hasP = this.hasPointer;
    var pos = this.pos, vel = this.vel, tgt = this.tgt, seed = this.seed, lock = this.lock;
    var stag = o.stagger, gp = this.phase;
    var np = this.pulses.length;

    var awake = 0;

    for (var i = 0; i < n; i++) {
      var ix = i * 2, iy = ix + 1;

      /* Avancement local : chaque grain part a son heure, la forme
         se compose en vague et jamais d'un coup. */
      var lp = 1;
      if (this.entering) {
        lp = easeInOut(clamp((gp - seed[i] * stag) / (1 - stag), 0, 1));
      }

      var pushed = 0;

      if (hasP) {
        var rx = pos[ix] - px, ry = pos[iy] - py;
        var d2 = rx * rx + ry * ry;
        if (d2 < rr2 && d2 > 0.0001) {
          var d = Math.sqrt(d2);
          var f = 1 - d / rr;
          /* f*f : le sillon a un fond franc et des bords qui
             remontent vite. Un f lineaire donnait une cuvette molle. */
          var amp = f * f * rs * dt;
          vel[ix] += (rx / d) * amp;
          vel[iy] += (ry / d) * amp;
          pushed = 1;
        }
      }

      for (var p = 0; p < np; p++) {
        var pu = this.pulses[p];
        var qx = pos[ix] - pu.x, qy = pos[iy] - pu.y;
        var qd2 = qx * qx + qy * qy;
        var pr = o.pulseRadius * (0.2 + pu.t * 2.4);
        if (qd2 < pr * pr && qd2 > 0.0001) {
          var qd = Math.sqrt(qd2);
          var pf = (1 - qd / pr) * (1 - pu.t / 0.55);
          var pamp = pf * pf * o.pulseStrength * dt;
          vel[ix] += (qx / qd) * pamp;
          vel[iy] += (qy / qd) * pamp;
          pushed = 1;
        }
      }

      if (lock[i] && !pushed && !this.entering) continue;

      /* omega monte pendant le deploiement : le grain part mou et
         arrive sec. */
      var om = o.omegaStart + (o.omegaRest - o.omegaStart) * lp;
      var k = om * om, c = 2 * om;

      var ex = pos[ix] - tgt[ix], ey = pos[iy] - tgt[iy];
      vel[ix] += (-k * ex - c * vel[ix]) * dt;
      vel[iy] += (-k * ey - c * vel[iy]) * dt;
      vel[ix] *= drag;
      vel[iy] *= drag;
      pos[ix] += vel[ix] * dt;
      pos[iy] += vel[iy] * dt;

      /* VERROU : l'etat de repos devient le rendu exact de la
         typographie, au pixel. C'est lui qui garde les contreformes
         du A, du P, du D et du G ouvertes. */
      var fx = pos[ix] - tgt[ix], fy = pos[iy] - tgt[iy];
      if (!pushed && (fx * fx + fy * fy) < 0.09 &&
          (vel[ix] * vel[ix] + vel[iy] * vel[iy]) < 1.2) {
        pos[ix] = tgt[ix]; pos[iy] = tgt[iy];
        vel[ix] = 0; vel[iy] = 0;
        lock[i] = 1;
      } else {
        lock[i] = 0;
        awake++;
      }
    }

    this.settled = (awake === 0 && !this.entering && !this.hasPointer && np === 0);
  };

  /* ------------------------------------------------------------
     Rendu. Un seul putImageData par image.
     ------------------------------------------------------------ */
  Limaille.prototype.drawFrame = function () {
    if (this.dead || !this.buf) return;
    var buf = this.buf, w = this.w, h = this.h, n = this.n;
    var dpr = this.dpr;

    buf.fill(this.bg);

    var pos = this.pos, tgt = this.tgt, tone = this.tone, tones = this.tones, gsz = this.gsz;

    for (var i = 0; i < n; i++) {
      var ix = i * 2, iy = ix + 1;
      /* Le grain est declare en pixels CSS et rendu en pixels ecran :
         la matiere garde la meme finesse apparente quel que soit le
         rapport de pixels. */
      var g = Math.max(1, Math.round(gsz[i] * dpr));
      var x = (pos[ix] * dpr) | 0;
      var y = (pos[iy] * dpr) | 0;
      if (x < 0 || y < 0 || x > w - g || y > h - g) continue;

      var dx = pos[ix] - tgt[ix], dy = pos[iy] - tgt[iy];
      var c = (dx * dx + dy * dy) > 2.2 ? tones[2] : tones[tone[i]];

      var base = y * w + x;
      for (var gy = 0; gy < g; gy++) {
        var row = base + gy * w;
        for (var gx = 0; gx < g; gx++) buf[row + gx] = c;
      }
    }

    this.ctx.putImageData(this.imageData, 0, 0);
  };

  /* Frequence d'images moyenne sur les echantillons collectes.
     Sert au calibrage, pas au rendu. */
  Limaille.prototype.fps = function () {
    if (!this.fpsSamples.length) return 0;
    var s = 0;
    for (var i = 0; i < this.fpsSamples.length; i++) s += this.fpsSamples[i];
    return Math.round(1 / (s / this.fpsSamples.length));
  };

  Limaille.pack = pack;
  Limaille.mix = mix;
  root.Limaille = Limaille;
})(window);

