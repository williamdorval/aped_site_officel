/* == APED AGENCE - Mouvement ==  D-495 */

(function () {
  "use strict";

  var root = document.documentElement;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  var hasGsap = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* Sans GSAP ou en mouvement reduit : tout est visible, rien ne bouge.
     La page reste complete, elle perd seulement sa choregraphie. */
  if (!hasGsap || reduced.matches) {
    root.classList.add("reduced-motion");
    $$("[data-count]").forEach(function (el) {
      el.textContent = el.dataset.count + (el.dataset.suffix || "");
    });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  var ease = "power3.out";

  /* 1. Entree du hero.  D-496 */
  /* LE HERO NE S'ANIME PLUS DU TOUT.  D-497 */

  /* 2. Compression du titre.  D-498 */
  /* La plaque de limaille repond au defilement : quand le hero sort,  D-499 */
  var hero = $(".hero");
  var plate = $("#heroPlate");
  if (hero && plate && window.matchMedia("(min-width: 48em)").matches) {
    gsap.fromTo(plate,
      { y: 0 },
      {
        y: -34,
        ease: "none",
        scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: 0.6 }
      }
    );
  }

  /* 3. Filets de section — N1 (orientation) + N2 (signature).  D-500 */
  /* LES CINQ FILETS DE LA FICHE TECHNIQUE SONT EXCLUS, et c'est la  D-501 */
  $$("[data-section-rule]").forEach(function (rule) {
    if (rule.classList.contains("fiche-rule")) return;
    gsap.fromTo(rule, { scaleX: 0 }, {
      scaleX: 1,
      duration: 0.72,
      ease: "power2.inOut",
      /* L'etat de depart n'est plus dans le CSS : il est pose ICI, et  D-502 */
      immediateRender: false,
      scrollTrigger: {
        trigger: rule,
        /* G1 · ANNONCER. Un filet de seuil part des qu'il ENTRE dans  D-503 */
        start: rule.closest("[data-seuil]") ? "top 97%" : "top 88%",
        once: true,
        onEnter: function () {
          /* Les grains se ressoudent une fois le filet pose. */
          window.setTimeout(function () { rule.classList.add("is-set"); }, 760);
        }
      }
    });
  });

  /* 4. Montee des blocs.  D-504 */
  var groups = [];
  $$(".rise").forEach(function (el) {
    if (el.closest(".hero")) return;
    var parent = el.parentNode;
    if (groups.indexOf(parent) === -1) groups.push(parent);
  });
  groups.forEach(function (parent) {
    var items = $$(".rise", parent);
    gsap.fromTo(items,
      { y: 28, opacity: 0.1 },
      {
        y: 0,
        opacity: 1,
        duration: 0.58,
        stagger: 0.07,
        ease: ease,
        /* Jamais d'avance : sans ca, charger la bibliotheque en
           differe ferait DISPARAITRE d'un coup tout ce qui est deja
           a l'ecran, pour le refaire monter ensuite. */
        immediateRender: false,
        scrollTrigger: { trigger: parent, start: "top 86%", once: true }
      });
  });

  /* 5. Compteurs de la bande de specification.  D-505 */
  $$("[data-count]").forEach(function (el) {
    var target = Number(el.dataset.count);
    var suffix = el.dataset.suffix || "";
    var obj = { v: 0 };
    ScrollTrigger.create({
      trigger: el,
      start: "top 90%",
      once: true,
      onEnter: function () {
        gsap.to(obj, {
          v: target,
          duration: 1.1,
          ease: "power2.out",
          onUpdate: function () { el.textContent = Math.round(obj.v) + suffix; }
        });
      }
    });
  });


  /* 8. Ligne du processus.  D-506 */
  /* LE FIL SE REMPLIT, station par station, et sa portion pleine  D-507 */
  $$(".parc-etape").forEach(function (etape) {
    var fil = $(".parc-fil b", etape);
    var branche = $(".parc-branche", etape);
    if (fil) {
      gsap.fromTo(fil, { scaleY: 0 }, {
        scaleY: 1,
        ease: "none",
        scrollTrigger: { trigger: etape, start: "top 72%", end: "bottom 62%", scrub: 0.5 }
      });
    }
    if (branche) {
      gsap.fromTo(branche, { scaleX: 0 }, {
        scaleX: 1,
        duration: 0.34,
        ease: "power3.out",
        scrollTrigger: { trigger: etape, start: "top 74%", once: true }
      });
    }
  });

  /* 8bis. LES QUATRE COMPOSANTS DU PARCOURS — N2.  D-508 */
  $$(".parc-vis").forEach(function (vis) {
    var etape = vis.closest(".parc-etape") || vis;
    var tl = gsap.timeline({ scrollTrigger: { trigger: etape, start: "top 68%", once: true } });

    var lignes = $$(".vis-l i", vis);
    if (lignes.length) tl.fromTo(lignes, { scaleX: 0 }, { scaleX: 1, duration: 0.34, stagger: 0.11, ease: "power2.out" });

    var blocs = $$(".vis-grille i", vis);
    if (blocs.length) {
      tl.fromTo(blocs,
        { x: function (i) { return (i % 2 ? 1 : -1) * 22; }, opacity: 0.12 },
        { x: 0, opacity: 1, duration: 0.42, stagger: 0.05, ease: "power3.out", immediateRender: false });
    }

    var codes = $$(".vis-code p", vis);
    if (codes.length) tl.fromTo(codes, { opacity: 0.12, x: -10 }, { opacity: 1, x: 0, duration: 0.26, stagger: 0.09, ease: "power2.out", immediateRender: false });

    var sortie = $(".vis-sortie", vis);
    if (sortie) tl.fromTo(sortie, { opacity: 0.12 }, { opacity: 1, duration: 0.3, ease: "power2.out", immediateRender: false }, "-=0.08");

    var live = $(".vis-live", vis);
    if (live) tl.fromTo(live, { scale: 0.7, opacity: 0.2 }, { scale: 1, opacity: 1, duration: 0.28, ease: "power4.out", immediateRender: false }, "-=0.12");
  });

  /* 9. Piste du comparatif — N2.  D-509 */
  /* Les LONGUEURS ne sont plus posees ici : elles sont dans le  D-510 */
  $$(".vs-row").forEach(function (row) {
    var barM = $('[data-bar="manual"]', row);
    var barA = $('[data-bar="auto"]', row);
    if (!barM || !barA) return;
    gsap.timeline({ scrollTrigger: { trigger: row, start: "top 90%", once: true } })
      .fromTo(barM, { scaleX: 0 }, { scaleX: 1, duration: 0.52, ease: "power2.out" })
      .fromTo(barA, { scaleX: 0 }, { scaleX: 1, duration: 0.42, ease: "power3.out" }, "-=0.18");
  });

  /* 9bis. LE SCHEMA DE L'ECART — N2.  D-511 */
  var ecart = $("[data-ecart]");
  if (ecart) {
    var barres = $$(".ecart-barre", ecart);
    var pont = $(".ecart-pont", ecart);
    var tlEcart = gsap.timeline({
      scrollTrigger: { trigger: ecart, start: "top 82%", once: true }
    });
    tlEcart.fromTo(barres, { scaleX: 0 },
      { scaleX: 1, duration: 0.62, stagger: 0.16, ease: "power2.out" });
    if (pont) {
      tlEcart.fromTo(pont, { scaleX: 0 },
        { scaleX: 1, duration: 0.46, ease: "power3.out" }, "-=0.12");
      tlEcart.fromTo($("b", pont), { opacity: 0, y: -6 },
        { opacity: 1, y: 0, duration: 0.28, ease: "power2.out", immediateRender: false }, "-=0.10");
    }
  }

  /* 10. Titres de section — N2.  D-512 */
  function couperEnLignes(el) {
    var mots = el.textContent.split(/\s+/).filter(Boolean);
    if (mots.length < 2) return null;
    el.textContent = "";
    var frag = document.createDocumentFragment();
    mots.forEach(function (m, i) {
      /* L'espace est un noeud de texte ENTRE les boites, jamais  D-513 */
      if (i) frag.appendChild(document.createTextNode(" "));
      var s = document.createElement("span");
      s.className = "mot";
      s.textContent = m;
      frag.appendChild(s);
    });
    el.appendChild(frag);
    /* Les mots sont regroupes par LIGNE reelle, mesuree apres mise en  D-514 */
    var lignes = [], courante = null, y = null;
    $$(".mot", el).forEach(function (s) {
      var t = Math.round(s.getBoundingClientRect().top);
      if (y === null || t !== y) { courante = []; lignes.push(courante); y = t; }
      courante.push(s);
    });

    var bloc = document.createDocumentFragment();
    var boites = lignes.map(function (mots) {
      var b = document.createElement("span");
      b.className = "ligne";
      mots.forEach(function (m, i) {
        if (i) b.appendChild(document.createTextNode(" "));
        b.appendChild(m);
      });
      /* Une espace entre les boites de ligne. Elle ne se voit pas —  D-515 */
      bloc.appendChild(b);
      bloc.appendChild(document.createTextNode(" "));
      return b;
    });
    el.textContent = "";
    el.appendChild(bloc);
    return boites;
  }

  /* Le decoupage est PARESSEUX, un titre a la fois, au moment ou il  D-516 */
  $$(".head h2").forEach(function (titre) {
    ScrollTrigger.create({
      trigger: titre,
      start: "top bottom",
      once: true,
      onEnter: function () {
        var lignes = couperEnLignes(titre);
        if (!lignes || !lignes.length) return;
        lignes.forEach(function (ligne, i) {
          gsap.fromTo(ligne,
            { clipPath: "inset(0 100% 0 0)" },
            { clipPath: "inset(0 0% 0 0)", duration: 0.3, delay: i * 0.06, ease: "power2.out" }
          );
        });
      }
    });
  });

  /* 11. Blocs qui se reprennent — N2.  D-517 */
  $$("[data-settle]").forEach(function (parent) {
    var items = $$(":scope > *", parent);
    items.forEach(function (el, i) {
      gsap.fromTo(el,
        { x: (i % 2 ? 1 : -1) * 26, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.54,
          delay: i * 0.07,
          ease: "power3.out",
          scrollTrigger: { trigger: parent, start: "top 84%", once: true }
        }
      );
    });
  });

  /* 12. Frise du processus — N2, defilement lateral.  D-518 */
  /* La frise horizontale a ete remplacee par le parcours vertical  D-519 */

  /* 12bis. LES QUATRE PREUVES DE L'AGENCE — N2.  D-520 */
  $$(".agc-eng").forEach(function (eng) {
    var tl = gsap.timeline({ scrollTrigger: { trigger: eng, start: "top 78%", once: true } });

    var barres = $$(".pr-l i", eng);
    if (barres.length) tl.fromTo(barres, { scaleX: 0 }, { scaleX: 1, duration: 0.5, ease: "power2.out" });

    var egal = $(".pr-egal", eng);
    if (egal) tl.fromTo(egal, { opacity: 0.1, scale: 0.7 }, { opacity: 1, scale: 1, duration: 0.26, ease: "power4.out", immediateRender: false }, "-=0.08");

    var traits = $$(".pr-case s", eng);
    if (traits.length) tl.fromTo(traits, { scaleX: 0 }, { scaleX: 1, duration: 0.2, stagger: 0.12, ease: "power2.out" });

    var suite = $(".pr-ligne--suite", eng);
    if (suite) tl.fromTo(suite, { opacity: 0.1, x: -8 }, { opacity: 1, x: 0, duration: 0.26, ease: "power2.out", immediateRender: false });

    var rangs = $$(".pr-r b", eng);
    if (rangs.length) tl.fromTo(rangs, { opacity: 0.1, y: -6 }, { opacity: 1, y: 0, duration: 0.24, stagger: 0.1, ease: "power3.out", immediateRender: false });

    var jours = $$(".pr-sem i", eng);
    if (jours.length) tl.fromTo(jours, { scaleY: 0 }, { scaleY: 1, duration: 0.28, stagger: 0.07, ease: "power2.out" });
  });

  /* 13. Programme de reference — N2.  D-521 */
  var filetRef = $(".referral-line b");
  if (filetRef) {
    gsap.fromTo(filetRef, { scaleX: 0 }, {
      scaleX: 1,
      ease: "none",
      scrollTrigger: { trigger: ".referral-steps", start: "top 82%", end: "bottom 62%", scrub: 0.5 }
    });
  }
  /* Les trois PREUVES. Le bareme en regle graduee a ete retire —  D-522 */
  /* == `immediateRender: false` SUR ONZE TWEENS — CORRECTIF DU ==  D-523 */
  $$(".ref-preuve").forEach(function (preuve) {
    var tl = gsap.timeline({ scrollTrigger: { trigger: preuve, start: "top 84%", once: true } });

    var bulle = $(".rp-bulle", preuve);
    if (bulle) tl.fromTo(bulle, { x: -14, opacity: 0.12 }, { x: 0, opacity: 1, duration: 0.34, ease: "power3.out", immediateRender: false });

    var trait = $(".rp-signature path", preuve);
    if (trait) {
      /* Ici le trace SVG est justifie : c'est UNE seule courte
         courbe, jouee une seule fois, pas quarante rectangles
         repeints a chaque image. */
      tl.fromTo(trait, { strokeDashoffset: 220 }, { strokeDashoffset: 0, duration: 0.72, ease: "power2.inOut" });
    }

    var avis = $$(".rp-avis", preuve);
    if (avis.length) tl.fromTo(avis, { opacity: 0.12, y: -6 }, { opacity: 1, y: 0, duration: 0.26, stagger: 0.1, ease: "power3.out", immediateRender: false });

    var etat = $(".rp-etat", preuve);
    if (etat) tl.fromTo(etat, { opacity: 0.1 }, { opacity: 1, duration: 0.24, ease: "power2.out", immediateRender: false }, "-=0.06");
  });

  /* 13bis. « Ce qui arrive apres » — N2.  D-524 */
  var filetSuite = $(".suite-fil b");
  if (filetSuite) {
    gsap.fromTo(filetSuite, { scaleX: 0 }, {
      scaleX: 1,
      ease: "none",
      scrollTrigger: { trigger: ".suite-temps", start: "top 84%", end: "bottom 66%", scrub: 0.5 }
    });
  }

  /* 14. Recalcul apres chargement des images.  D-525 */
  window.addEventListener("load", function () { ScrollTrigger.refresh(); });
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
  }

})();

