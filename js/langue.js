/* == APED AGENCE — LA LANGUE DE MOUVEMENT ==  D-443 */

(function () {
  "use strict";

  var root = document.documentElement;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  var fine = window.matchMedia("(pointer: fine)");
  var hasGsap = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  if (!hasGsap || reduced.matches) return;

  var bureau = window.matchMedia("(min-width: 64em)");

  /* == LE BUDGET DE DEGRADATION — trois paliers, et l'ordre de chute ==  D-444 */
  var PALIER = 0;

  (function calibrer() {
    var coeurs = navigator.hardwareConcurrency || 8;
    /* `deviceMemory` n'existe que sur Chromium. Absent, on ne
       suppose rien : c'est un indice en moins, pas un verdict. */
    var memoire = navigator.deviceMemory === undefined ? 8 : navigator.deviceMemory;
    var grossier = window.matchMedia("(pointer: coarse)").matches;
    if (!bureau.matches || grossier || coeurs <= 4 || memoire <= 4) PALIER = 1;
    root.setAttribute("data-palier", PALIER);
  })();

  /* Les objets que le palier 2 doit pouvoir tuer en vol. Un tween
     deja cree continue sinon a peindre alors qu'on vient justement
     de decider qu'il coute trop cher. */
  var jetables = [];

  function monterAuPalier(n) {
    if (n <= PALIER) return;
    PALIER = n;
    root.setAttribute("data-palier", PALIER);
    jetables.forEach(function (o) {
      try { o.kill && o.kill(); } catch (e) {}
    });
    jetables.length = 0;
    /* Un voile de trame en vol continue a peindre plusieurs
       centaines de tuiles par image alors qu'on vient justement de
       decider que ca coute trop cher. Il tombe avec le reste. */
    if (window.APED_TRAME) window.APED_TRAME.tout_arreter();
  }

  /* LA MESURE. On n'echantillonne QUE pendant un defilement reel :  D-445 */
  (function surveiller() {
    var ecarts = [];
    var last = 0;
    var actif = false;
    var minuteur = 0;
    var fini = false;

    function image(t) {
      if (fini) return;
      if (actif) {
        if (last) {
          var dt = t - last;
          /* On jette les intervalles absurdes : un onglet en
             arriere-plan ou une pause du systeme n'est pas une
             mesure de performance. */
          if (dt > 4 && dt < 200) ecarts.push(dt);
        }
        last = t;
        if (ecarts.length >= 90) {
          fini = true;
          var tri = ecarts.slice().sort(function (a, b) { return a - b; });
          var median = tri[Math.floor(tri.length / 2)];
          if (median > 20) monterAuPalier(2);
          root.setAttribute("data-images", Math.round(1000 / median));
          return;
        }
      } else {
        last = 0;
      }
      window.requestAnimationFrame(image);
    }

    window.addEventListener("scroll", function () {
      actif = true;
      window.clearTimeout(minuteur);
      minuteur = window.setTimeout(function () { actif = false; }, 220);
    }, { passive: true });

    window.requestAnimationFrame(image);
  })();

  /* == LE TRAVAIL PREPARATOIRE SE FAIT PENDANT LES TEMPS MORTS. ==  D-446 */
  var filePrep = [];
  var prepLancee = false;

  function preparer(tache) { filePrep.push(tache); }

  function viderFilePrep(deadline) {
    while (filePrep.length &&
           (!deadline || deadline.timeRemaining() > 6 || deadline.didTimeout)) {
      var t = filePrep.shift();
      try { t(); } catch (e) {}
    }
    if (filePrep.length) planifierPrep();
  }

  function planifierPrep() {
    if (window.requestIdleCallback) {
      window.requestIdleCallback(viderFilePrep, { timeout: 2000 });
    } else {
      window.setTimeout(function () { viderFilePrep(null); }, 120);
    }
  }

  function lancerPrep() {
    if (prepLancee) return;
    prepLancee = true;
    planifierPrep();
  }

  /* == 0. FLIP MAISON — la mecanique, pas le code. ==  D-447 */
  function flip(elements, muter, opt) {
    opt = opt || {};
    var avant = elements.map(function (el) { return el.getBoundingClientRect(); });
    muter();
    var apres = elements.map(function (el) { return el.getBoundingClientRect(); });

    elements.forEach(function (el, i) {
      var dx = avant[i].left - apres[i].left;
      var dy = avant[i].top - apres[i].top;
      /* Un element qui n'a pas bouge d'un demi-pixel ne merite pas
         un tween : on economise une couche de composition. */
      if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) return;
      gsap.fromTo(el,
        { x: dx, y: dy },
        {
          x: 0, y: 0,
          duration: opt.duration || 0.42,
          /* Arret sec. Aucun ressort, aucun depassement : la piece
             se pose sur le banc, elle ne rebondit pas dessus. */
          ease: opt.ease || "power3.out",
          overwrite: "auto"
        }
      );
    });
  }

  /* == 0bis. LES DOUZE FRONTIERES. ==  D-448 */
  (function frontieres() {
    var SEUILS = $$("[data-seuil]");
    if (!SEUILS.length) return;

    /* Le sens de lecture, en clip-path. Meme table que celle des
       degagements du site : il n'y en a qu'une. */
    var ARETE = {
      bas: ["inset(0 0 100% 0)", "inset(0 0 0% 0)"],
      droite: ["inset(0 100% 0 0)", "inset(0 0% 0 0)"],
      gauche: ["inset(0 0 0 100%)", "inset(0 0 0 0%)"],
      haut: ["inset(100% 0 0 0)", "inset(0% 0 0 0)"]
    };

    /* LE FRANCHISSEMENT SE LIT A L'INTERSECTION, PLUS A UNE  D-449 */
    function auFranchissement(cible, pourcent, faire) {
      if (!("IntersectionObserver" in window)) {
        var st = ScrollTrigger.create({ trigger: cible, start: "top " + pourcent + "%", once: true, onEnter: faire });
        jetables.push(st);
        return st;
      }
      var io = new IntersectionObserver(function (entrees) {
        for (var i = 0; i < entrees.length; i++) {
          if (!entrees[i].isIntersecting) continue;
          io.disconnect();
          faire();
          return;
        }
      }, { rootMargin: "0px 0px -" + (100 - pourcent) + "% 0px", threshold: 0 });
      io.observe(cible);
      var jetable = { kill: function () { io.disconnect(); } };
      jetables.push(jetable);
      return jetable;
    }

    /* PHASE 10 — LA TRAME SUR LES FRONTIERES.  D-450 */
    var trameDispo = function () {
      return PALIER === 0 && typeof window.APED_TRAME !== "undefined";
    };
    /* La maille suit la HAUTEUR de ce qu'on degage : une bande de  D-451 */
    function mailleDe(el) {
      var h = el.getBoundingClientRect().height;
      return Math.max(28, Math.min(64, Math.round(h / 4.5)));
    }

    SEUILS.forEach(function (seuil) {
      var sens = seuil.getAttribute("data-sens") || "droite";
      var verbe = seuil.getAttribute("data-verbe");
      var cible = seuil.getAttribute("data-cible");
      var section = seuil.closest("section") || seuil.parentNode;
      var graine = (parseInt(seuil.getAttribute("data-vers"), 10) || 1) * 37 + 11;

      /* G3 · DEGAGER — le nom du seuil  D-452 */
      var nom = $(".seuil-nom", seuil);
      if (nom) {
        /* G3 passe par le meme franchissement que les autres : une  D-453 */
        auFranchissement(seuil, 94, function () {
          gsap.fromTo(nom,
            { clipPath: ARETE.droite[0] },
            { clipPath: ARETE.droite[1], duration: 0.3, ease: "power2.out", immediateRender: false }
          );
        });
      }

      /* G4 · LE GESTE PROPRE A LA FRONTIERE  D-454 */
      if (PALIER >= 2) return;

      if (verbe === "volet") {
        /* V1 · DEGAGER, a l'echelle de la bande.  D-455 */
        if (trameDispo()) {
          /* La bande d'encre est deja peinte au repos. La trame la  D-456 */
          var st = auFranchissement(seuil, 92, function () {
            window.APED_TRAME.degager(seuil, {
              sens: sens, graine: graine, duree: 420, vie: 190,
              maille: mailleDe(seuil), z: 3, nom: "seuil-" + seuil.getAttribute("data-vers")
            });
          });
          jetables.push(st);
        } else {
          var a = ARETE[sens] || ARETE.bas;
          var t = gsap.fromTo(seuil,
            { clipPath: a[0] },
            {
              clipPath: a[1],
              duration: 0.44,
              ease: "power3.out",
              immediateRender: false,
              onComplete: function () { gsap.set(seuil, { clearProps: "clipPath" }); },
              scrollTrigger: { trigger: seuil, start: "top 92%", once: true }
            }
          );
          jetables.push(t);
        }
      }

      if (verbe === "degager" && cible) {
        /* V1 · DEGAGER, sur ce que la section a de plus concret :  D-457 */
        var el = $(cible, section);
        if (el) {
          if (trameDispo()) {
            var st2 = auFranchissement(el, 90, function () {
              window.APED_TRAME.degager(el, {
                sens: sens, graine: graine, duree: 440, vie: 200,
                maille: mailleDe(el), z: 3, nom: "seuil-" + seuil.getAttribute("data-vers")
              });
            });
            jetables.push(st2);
          } else {
            var b = ARETE[sens] || ARETE.bas;
            var t2 = gsap.fromTo(el,
              { clipPath: b[0] },
              {
                clipPath: b[1],
                duration: 0.46,
                ease: "power3.out",
                immediateRender: false,
                onComplete: function () { gsap.set(el, { clearProps: "clipPath" }); },
                scrollTrigger: { trigger: el, start: "top 90%", once: true }
              }
            );
            jetables.push(t2);
          }
        }
      }

      if (verbe === "aligner" && cible) {
        /* V2 · S'ALIGNER. Les blocs arrivent DECALES lateralement,  D-458 */
        var blocs = $$(cible, section);
        if (blocs.length) {
          /* Meme franchissement que les trois autres gestes : la  D-459 */
          jetables.push(auFranchissement(blocs[0], 88, function () {
            gsap.fromTo(blocs,
              { x: function (i) { return i % 2 ? 26 : -26; } },
              { x: 0, duration: 0.42, ease: "power2.out", stagger: 0.05,
                immediateRender: false, clearProps: "transform" }
            );
          }));
        }
      }

      if (verbe === "souder") {
        /* V3 · SOUDER, en long. Le filet de ce seuil se soude plus  D-460 */
        seuil.classList.add("seuil-soudure-longue");
        auFranchissement(seuil, 96, function () {
          var filet = $(".seuil-filet", seuil);
          if (!filet) return;
          filet.classList.add("en-soudure-longue");
          window.setTimeout(function () {
            filet.classList.remove("en-soudure-longue");
          }, 860);
        });
      }

      if (verbe === "cran" && cible) {
        /* V4 · CRAN, sur le seul argument de la section : un  D-461 */
        auFranchissement(seuil, 74, function () {
          var num = $(cible, section);
          if (!num || typeof window.APED_ROULER !== "function") return;
          var arrivee = num.textContent.trim();
          if (!arrivee) return;
          /* Premier appel : `rouler` pose la structure sans animer.
             Second appel, deux images plus tard : il roule. */
          window.APED_ROULER(num, "500 $");
          requestAnimationFrame(function () {
            requestAnimationFrame(function () { window.APED_ROULER(num, arrivee); });
          });
        });
      }
    });
  })();

  /* == 1. LES LETTRES — V4 · CRAN, sur tous les boutons du site. ==  D-462 */
  function decouper(btn) {
    if (btn.dataset.lettres) return;
    btn.dataset.lettres = "1";

    var noeuds = Array.prototype.slice.call(btn.childNodes);
    var index = 0;

    noeuds.forEach(function (n) {
      /* UN ELEMENT IMBRIQUE COMPTE COMME UNE LETTRE, et c'est la  D-463 */
      if (n.nodeType === 1) {
        if (n.tagName.toLowerCase() === "svg") return;
        if (n.classList.contains("l") || n.classList.contains("lettres")) return;
        n.classList.add("l");
        return;
      }
      if (n.nodeType !== 3) return;
      var texte = n.nodeValue;
      if (!texte.trim()) return;

      /* LES LETTRES VIVENT DANS UNE SEULE BOITE, et c'est une  D-464 */
      var boite = document.createElement("span");
      boite.className = "lettres";

      var frag = document.createDocumentFragment();
      for (var i = 0; i < texte.length; i++) {
        var c = texte[i];
        /* Les blancs restent des NOEUDS DE TEXTE entre les boites,  D-465 */
        if (c === " " || c === "\n" || c === "\t" || c === "\r") {
          frag.appendChild(document.createTextNode(c));
          continue;
        }
        var s = document.createElement("i");
        s.className = "l";
        s.style.setProperty("--i", index++);
        s.textContent = c;
        frag.appendChild(s);
      }
      /* Le nombre de lettres pilote la duree totale de la cascade :  D-466 */
      btn.style.setProperty("--n", index);
      boite.appendChild(frag);
      n.parentNode.replaceChild(boite, n);
    });

    positionner(btn);
  }

  /* LE DECALAGE SUIT LA POSITION, PAS L'INDICE — et c'est la  D-467 */
  function positionner(btn) {
    var cibles = $$(".l, .icon", btn);
    if (!cibles.length) return;
    var rb = btn.getBoundingClientRect();
    if (!rb.width) return;
    var p = cibles.map(function (el) {
      var r = el.getBoundingClientRect();
      return Math.max(0, Math.min(1, (r.left + r.width / 2 - rb.left) / rb.width));
    });
    cibles.forEach(function (el, i) { el.style.setProperty("--p", p[i].toFixed(4)); });
  }

  /* LE DECOUPAGE SE FAIT PENDANT LES TEMPS MORTS, pas au survol.  D-468 */
  $$(".btn").forEach(function (btn) {
    preparer(function () { decouper(btn); });
  });
  lancerPrep();

  function amorcerLettres(e) {
    var btn = e.target.closest && e.target.closest(".btn, .btn-icon");
    if (btn && !btn.dataset.lettres) decouper(btn);
  }
  document.addEventListener("pointerenter", amorcerLettres, { capture: true, passive: true });
  document.addEventListener("focusin", amorcerLettres, { passive: true });

  /* `--p` est une position, donc elle depend de la largeur. Un  D-469 */
  var rtLettres = 0;
  window.addEventListener("resize", function () {
    window.clearTimeout(rtLettres);
    rtLettres = window.setTimeout(function () {
      $$(".btn[data-lettres]").forEach(positionner);
    }, 220);
  }, { passive: true });

  /* == 2. LES MOTS — V1 · DEGAGER, sur les chapos de section. ==  D-470 */
  function decouperMots(el) {
    if (el._mots) return el._mots;
    /* On ne touche qu'aux paragraphes de texte simple. Un chapo qui
       contient un lien ou une abreviation garde son markup et reste
       inanime : mieux vaut une exception muette qu'un DOM casse. */
    if (el.childNodes.length !== 1 || el.firstChild.nodeType !== 3) return null;
    var mots = el.textContent.split(/(\s+)/);
    var frag = document.createDocumentFragment();
    var boites = [];
    mots.forEach(function (m) {
      if (!m.trim()) { frag.appendChild(document.createTextNode(m)); return; }
      var s = document.createElement("span");
      s.className = "mot-encre";
      s.textContent = m;
      frag.appendChild(s);
      boites.push(s);
    });
    el.textContent = "";
    el.appendChild(frag);
    el._mots = boites;
    return boites;
  }

  /* PALIER 1 — LE PREMIER POSTE QUI TOMBE.  D-471 */
  if (PALIER === 0) $$(".head p").forEach(function (p) {
    /* Le decoupage part dans la file des temps morts ; le  D-472 */
    preparer(function () { decouperMots(p); });

    ScrollTrigger.create({
      trigger: p,
      start: "top 92%",
      once: true,
      onEnter: function () {
        if (PALIER !== 0) return;
        var mots = decouperMots(p);
        if (!mots || mots.length < 4) return;

        /* LE DEPART EST POSE SUR TOUS LES MOTS EN MEME TEMPS, et  D-473 */
        gsap.set(mots, { opacity: 0.34 });
        jetables.push(gsap.to(mots, {
          opacity: 1,
          duration: 0.34,
          ease: "power1.out",
          /* La vague entiere est plafonnee : un chapo de trente
             mots et un chapo de huit ne peuvent pas prendre le meme
             temps PAR MOT sans que le premier traine. */
          stagger: { each: Math.min(0.05, 0.62 / mots.length), from: "start" },
          /* `clearProps` rend les mots a leur CSS a la derniere
             image : l'etat de repos est l'encre pleine, ecrite
             nulle part, donc impossible a laisser a mi-chemin. */
          clearProps: "opacity"
        }));
      }
    });
  });

  /* == 3. DEGAGER — revelation par masque net. ==  D-474 */
  var SENS = {
    bas: ["inset(0 0 100% 0)", "inset(0 0 0% 0)"],
    droite: ["inset(0 100% 0 0)", "inset(0 0% 0 0)"],
    gauche: ["inset(0 0 0 100%)", "inset(0 0 0 0%)"],
    haut: ["inset(100% 0 0 0)", "inset(0% 0 0 0)"]
  };

  $$("[data-degage]").forEach(function (el) {
    var s = SENS[el.dataset.degage] || SENS.bas;
    gsap.fromTo(el,
      { clipPath: s[0] },
      {
        clipPath: s[1],
        duration: 0.46,
        ease: "power3.out",
        immediateRender: false,
        scrollTrigger: { trigger: el.closest("[data-degage-cadre]") || el, start: "top 86%", once: true }
      }
    );
  });

  /* LES SOUS-TITRES — V1 a l'echelle d'un h3.  D-475 */
  /* `.svc-texte h3` a ete retire de cette liste le 2026-07-30 : la  D-476 */
  if (PALIER === 0) $$(".cell h3, .sector-group h3, .parc-txt h3, .agc-txt h3")
    .forEach(function (titre) {
      gsap.fromTo(titre,
        { clipPath: "inset(0 100% 0 0)" },
        {
          clipPath: "inset(0 0% 0 0)",
          duration: 0.26,
          ease: "power2.out",
          immediateRender: false,
          scrollTrigger: { trigger: titre, start: "top 90%", once: true }
        }
      );
    });

  /* LE VOILE DE GRAINS A ETE COUPE, ET C'EST UNE DECISION, PAS UN  D-477 */

  /* == 4. SOUDER — les filets de liaison. ==  D-478 */
  $$("[data-souder]").forEach(function (hote) {
    var rangs = $$(":scope > *", hote);
    if (!rangs.length) return;
    /* PALIER 2 — la soudure tombe. Les filets sont pleins d'emblee :
       c'est deja l'etat au repos, donc il n'y a rien a perdre. */
    if (PALIER >= 2) return;

    ScrollTrigger.create({
      trigger: hote,
      start: "top 86%",
      once: true,
      onEnter: function () {
        rangs.forEach(function (rang, i) {
          /* JavaScript ne fait que POSER LA CLASSE. La croissance de  D-479 */
          window.setTimeout(function () {
            rang.classList.add("en-soudure");
            window.setTimeout(function () {
              rang.classList.remove("en-soudure");
            }, 420);
          }, i * 55);
        });
      }
    });
  });

  /* == 5. LES SECTEURS — LE MOMENT DE PREUVE. N2. ==  D-480 */
  (function secteurs() {
    var scene = $("#mockStage");
    var preview = $("#sectorPreview");
    if (!scene || !preview) return;

    /* Les blocs qu'on recompose sont les enfants directs de la  D-481 */
    function blocsDe(mock) {
      var page = $(".sec-page", mock) || mock;
      return $$(":scope > *", page).slice(0, 10);
    }

    /* Les quinze filets de `seedPositions()`. Un bloc part du filet  D-482 */
    var FILETS = 15;
    function filetDe(i, hauteur) {
      var ligne = (i * 7 + 3) % FILETS;
      return ((ligne + 0.5) / FILETS - 0.5) * hauteur;
    }

    /* 5a. LA RECOMPOSITION — UN SEUL CHEMIN DE CODE, ET C'EST UNE  D-483 */
    /* 5b. LA PILE — CE QU'ON A PRIS A LA REFERENCE 1, ET CE QU'ON  D-484 */
    var enCours = null;

    function recomposer(mock, amplitude, depuis) {
      if (!mock) return;
      /* PALIER 2 — la maquette change NET, sans recomposition.  D-485 */
      if (PALIER >= 2) return;
      var blocs = blocsDe(mock);
      if (!blocs.length) return;
      if (enCours) enCours.kill();
      var h = scene.clientHeight || 400;

      /* L'ECART CONSTANT de la pile : 11 px par bloc, borne a
         cinq — au-dela, une pile de dix se lit comme un
         escalier, et un escalier n'est plus une pile. */
      var pile = depuis === "pile";

      enCours = gsap.timeline();
      enCours.fromTo(blocs,
        {
          y: pile
            ? function (i) { return Math.min(i, 5) * -7; }
            : function (i) { return filetDe(i, h) * amplitude; },
          x: pile
            ? function (i) { return Math.min(i, 5) * 11; }
            : function (i) { return (i % 2 ? 1 : -1) * 18 * amplitude / 0.22; },
          opacity: 0.08
        },
        {
          y: 0, x: 0, opacity: 1,
          duration: 0.44,
          /* Amortissement critique : la piece se pose, elle ne
             rebondit pas. Aucun `back`, aucun `elastic`, jamais. */
          ease: "power3.out",
          stagger: 0.035,
          overwrite: "auto",
          clearProps: "transform,opacity"
        }
      );
    }

    document.addEventListener("aped:secteur", function (e) {
      recomposer($('.mock[data-mock="' + e.detail.cle + '"]', scene), 0.22, "pile");
    });

    /* La premiere fois que la vitrine entre par le bas, la maquette  D-486 */
    ScrollTrigger.create({
      trigger: preview,
      start: "top 88%",
      once: true,
      onEnter: function () {
        recomposer($(".mock.is-on", scene) || $(".mock", scene), 0.5);
      }
    });

    /* 5c. LA PARALLAXE A LA POINTE — bornee, pointeur fin seul.  D-487 */
    if (fine.matches && PALIER === 0) {
      var setX = gsap.quickTo(scene, "x", { duration: 0.5, ease: "power3.out" });
      var setY = gsap.quickTo(scene, "y", { duration: 0.5, ease: "power3.out" });
      preview.addEventListener("pointermove", function (ev) {
        var r = preview.getBoundingClientRect();
        setX(((ev.clientX - r.left) / r.width * 2 - 1) * 7);
        setY(((ev.clientY - r.top) / r.height * 2 - 1) * 4);
      }, { passive: true });
      preview.addEventListener("pointerleave", function () { setX(0); setY(0); }, { passive: true });
    }
  })();


  /* == 7. LA FAQ — V2, et c'est du FLIP. ==  D-488 */
  (function faq() {
    var items = $$(".faq-item");
    if (items.length < 2) return;
    items.forEach(function (item) {
      var tete = $("summary", item);
      if (!tete) return;
      tete.addEventListener("click", function () {
        /* PALIER 2 — les questions sautent, comme le fait le
           navigateur tout seul. On perd le glissement, pas le
           contenu. */
        if (PALIER >= 2) return;
        /* Le navigateur bascule `open` APRES le clic : on mesure  D-489 */
        var suivants = items.slice(items.indexOf(item) + 1);
        if (!suivants.length) return;
        var avant = suivants.map(function (el) { return el.getBoundingClientRect().top; });
        requestAnimationFrame(function () {
          suivants.forEach(function (el, i) {
            var dy = avant[i] - el.getBoundingClientRect().top;
            if (Math.abs(dy) < 0.5) return;
            gsap.fromTo(el, { y: dy }, { y: 0, duration: 0.38, ease: "power3.out", overwrite: "auto" });
          });
        });
      });
    });
  })();



  /* == 8. L'ETIQUETTE DE LA POINTE — V4. ==  D-490 */
  if (fine.matches && PALIER === 0) {
    var etiq = null;
    var ZONES = [
      [".sector-preview", "Choisir un métier"],
      [".tour-stage", "Regarder autour"]
    ];
    document.addEventListener("pointerover", function (e) {
      if (!e.target.closest) return;
      var mot = null;
      for (var i = 0; i < ZONES.length; i++) {
        if (e.target.closest(ZONES[i][0])) { mot = ZONES[i][1]; break; }
      }
      if (!mot) { if (etiq) etiq.classList.remove("is-on"); return; }
      if (!etiq) {
        etiq = document.createElement("div");
        etiq.className = "pointe-mot";
        etiq.setAttribute("aria-hidden", "true");
        etiq.innerHTML = "<i></i>";
        document.body.appendChild(etiq);
      }
      if (etiq.firstChild.textContent !== mot) etiq.firstChild.textContent = mot;
      etiq.classList.add("is-on");
    }, { passive: true });

    document.addEventListener("pointermove", function (e) {
      if (!etiq || !etiq.classList.contains("is-on")) return;
      etiq.style.transform = "translate(" + (e.clientX + 18) + "px," + (e.clientY + 18) + "px)";
    }, { passive: true });
  }

  /* == 9. LES MODALES — V1. ==  D-491 */
  document.addEventListener("aped:modal", function (e) {
    var panneau = e.detail && e.detail.panneau;
    if (!panneau) return;
    /* PALIER 2 — la modale apparait. Elle reste piegee au focus,
       fermable a Echap, et rend le focus au declencheur : rien de
       ce qui compte ne depend de son entree. */
    if (PALIER >= 2) return;
    gsap.fromTo(panneau,
      { clipPath: "inset(0 0 100% 0)", y: -10 },
      { clipPath: "inset(0 0 0% 0)", y: 0, duration: 0.26, ease: "power3.out", clearProps: "clipPath,transform" }
    );
    /* PHASE 10 — la trame par-dessus l'arete, pas a la place.  D-492 */
    if (PALIER === 0 && window.APED_TRAME) {
      window.APED_TRAME.degager(panneau, {
        nom: "modale", sens: "bas", graine: 907, duree: 300, vie: 150,
        maille: 40, z: 9, hote: panneau.closest("dialog") || panneau.parentNode
      });
    }
  });

  /* La fermeture est la RECIPROQUE de l'ouverture, pas une seconde  D-493 */
  document.addEventListener("aped:modal-ferme", function (e) {
    var panneau = e.detail && e.detail.panneau;
    if (!panneau) return;
    if (PALIER >= 2) return;
    gsap.to(panneau, {
      clipPath: "inset(0 0 100% 0)",
      y: -10,
      duration: 0.22,
      ease: "power2.in",
      overwrite: "auto",
      onComplete: function () { gsap.set(panneau, { clearProps: "clipPath,transform" }); }
    });
  });


  /* == 11. RECALCUL. Les captures de projet mesurent plusieurs ==  D-494 */
  window.addEventListener("load", function () { ScrollTrigger.refresh(); });

})();
