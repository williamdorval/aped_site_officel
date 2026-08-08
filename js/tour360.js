/* == ADEXWEB - Visite virtuelle 360 ==  D-538 */
(function () {
  "use strict";

  var MOTEUR_JS = "js/vendor/pannellum.js";
  var MOTEUR_CSS = "css/vendor/pannellum.css";
  var DOSSIER = "images/tour/";
  var HD = "--hd";

  /* Plan : repere 240 x 140. Les rectangles ci-dessous et les murs du  D-539 */
  var PLAN_SVG =
    '<svg class="tour-map-plan" viewBox="0 0 240 140" aria-hidden="true" focusable="false">' +
      '<path d="M10 10H230V74H75M45 74H10V10M120 10V40M120 55V74"/>' +
      '<path class="tour-map-jamb" d="M10 80H230V132H10Z"/>' +
      '<path class="tour-map-jamb" d="M45 68V80M75 68V80M114 40H126M114 55H126"/>' +
    '</svg>';

  /* UNE SEULE PROPRIETE — Lythwood Lodge, Lidgetton, KwaZulu-Natal.  D-540 */
  var PIECES = [
    {
      id: "terrasse",
      nom: "Terrasse",
      vers: "à la terrasse",
      yaw: 45, pitch: -5, hfov: 104,
      boite: [4.1667, 57.1429, 91.6667, 37.1429],
      liens: [{ id: "salon", yaw: 52, pitch: -3, arrivee: -5 }]
    },
    {
      id: "salon",
      nom: "Salon",
      vers: "au salon",
      yaw: -5, pitch: -3, hfov: 108,
      boite: [4.1667, 7.1429, 45.8333, 45.7143],
      liens: [
        { id: "terrasse", yaw: 42, pitch: -2, arrivee: 45 },
        { id: "chambre", yaw: -40, pitch: -2, arrivee: -95 }
      ]
    },
    {
      id: "chambre",
      nom: "Chambre",
      vers: "à la chambre",
      yaw: -95, pitch: -3, hfov: 108,
      boite: [50, 7.1429, 45.8333, 45.7143],
      liens: [{ id: "salon", yaw: -112, pitch: -3, arrivee: -5 }]
    }
  ];

  var HFOV_MIN = 55;
  var HFOV_MAX = 118;

  var doc = document;

  function par(id) {
    for (var i = 0; i < PIECES.length; i++) if (PIECES[i].id === id) return PIECES[i];
    return null;
  }

  function racine(id) {
    var c = id.indexOf(HD);
    return c === -1 ? id : id.slice(0, c);
  }

  function svg(d) {
    return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + d + "</svg>";
  }

  /* Chargement d'une ressource, une seule fois pour toute la page,
     meme si plusieurs visites cohabitent. */
  var enAttente = {};

  function charger(url, css) {
    if (enAttente[url]) return enAttente[url];
    enAttente[url] = new Promise(function (ok, non) {
      var el;
      if (css) {
        el = doc.createElement("link");
        el.rel = "stylesheet";
        el.href = url;
      } else {
        el = doc.createElement("script");
        el.src = url;
        el.async = false;
      }
      el.onload = function () { ok(); };
      el.onerror = function () { non(new Error(url)); };
      doc.head.appendChild(el);
    });
    return enAttente[url];
  }

  function demarrer(bloc, index) {
    var scene = bloc.querySelector("[data-tour-stage]");
    var bouton = bloc.querySelector("[data-tour-start]");
    if (!scene || !bouton) return;

    var base = bloc.getAttribute("data-tour-base") || "";
    var doux = window.matchMedia("(prefers-reduced-motion: reduce)");
    var reduit = doux.matches;

    /* Le 4k est un confort, pas le service. On ne l'impose pas a un
       forfait de donnees ni a un lien lent. */
    var lien = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    var veutHd = !(lien && (lien.saveData || /(^|-)2g$/.test(lien.effectiveType || "")));

    var vue = null;
    var visionneur = null;
    var hud = null;
    var pastilles = {};
    var annonce = null;
    var lance = false;
    var mort = false;
    var mainMise = false;

    var etiquette = bouton.querySelector("[data-tour-label]") || bouton;
    var etiquetteInitiale = etiquette.textContent;

    /* UN SEUL CHEMIN DE DEMARRAGE, DEUX PORTES.  D-718 */
    function lancer(seul) {
      if (lance || mort) return;
      lance = true;
      if (seul) bloc.setAttribute("data-tour-auto", "");
      bloc.classList.add("is-loading");
      bouton.classList.add("is-loading");
      bouton.setAttribute("aria-busy", "true");
      etiquette.textContent = "Chargement…";
      scene.setAttribute("aria-busy", "true");

      Promise.all([charger(base + MOTEUR_CSS, true), charger(base + MOTEUR_JS, false)])
        .then(function () { monter(seul); })
        .catch(echec);
    }

    bouton.addEventListener("click", function () { lancer(false); });

    /* LA VISITE S'OUVRE SEULE QUAND ON ARRIVE DESSUS.  D-718 */
    function ouvrirSeul() {
      if (!window.IntersectionObserver) return;
      /* Un forfait de donnees ne se fait pas imposer un panorama sans
         l'avoir demande : `veutHd` est deja faux sur `saveData` et sur
         la 2g. Le bouton reste alors la seule porte, et il reste la. */
      if (!veutHd) return;

      var oeil = new IntersectionObserver(function (entrees) {
        for (var i = 0; i < entrees.length; i++) {
          if (!entrees[i].isIntersecting) continue;
          oeil.disconnect();
          /* Les trois paliers de degradation sont partis avec
             l'ancienne identite : `veutHd` ci-dessus est le seul
             frein qui reste, et c'est celui qui compte — le forfait
             de donnees.  D-718 */
          lancer(true);
          return;
        }
      }, { rootMargin: "260px 0px", threshold: 0.01 });

      oeil.observe(bloc);
    }

    /* LE BOUTON EST CABLE — ET C'EST UN DRAPEAU, PAS UN DETAIL.  D-607 */
    bloc.setAttribute("data-tour-pret", "");
    ouvrirSeul();

    function echec() {
      lance = false;
      bloc.classList.remove("is-loading");
      bouton.classList.remove("is-loading");
      bouton.removeAttribute("aria-busy");
      etiquette.textContent = etiquetteInitiale;
      scene.removeAttribute("aria-busy");
      if (scene.querySelector(".tour-msg")) return;
      var p = doc.createElement("p");
      p.className = "tour-msg";
      p.setAttribute("role", "status");
      p.textContent = "La visite n’a pas pu s’ouvrir. Rechargez la page, ou écrivez-nous et on vous envoie le lien direct.";
      scene.appendChild(p);
    }

    function monter(seul) {
      if (!window.pannellum || !window.pannellum.viewer) { echec(); return; }

      vue = doc.createElement("div");
      vue.className = "tour-view";
      vue.id = "tour-view-" + index;
      scene.appendChild(vue);

      var defauts = {
        firstScene: PIECES[0].id,
        autoLoad: true,
        showControls: false,
        compass: false,
        keyboardZoom: true,
        hfov: 100,
        minHfov: HFOV_MIN,
        maxHfov: HFOV_MAX,
        sceneFadeDuration: reduit ? 0 : 380,
        strings: {
          loadingLabel: "Chargement…",
          noPanoramaError: "Aucun panorama n’a été fourni.",
          fileAccessError: "Le fichier %s est introuvable.",
          malformedURLError: "L’adresse du panorama est invalide.",
          genericWebGLError: "Votre navigateur n’a pas le WebGL nécessaire à la visite.",
          textureSizeError: "Ce panorama est trop grand pour cet appareil (%s px de large, maximum %s px).",
          unknownError: "La visite n’a pas pu s’ouvrir."
        }
      };

      /* Derive lente pendant l'inactivite : elle dit « c'est un 360 »  D-541 */
      if (!reduit) defauts.autoRotate = -1.6;

      var scenes = {};
      PIECES.forEach(function (p) {
        scenes[p.id] = fabriquer(p, false);
        scenes[p.id + HD] = fabriquer(p, true);
      });

      try {
        visionneur = window.pannellum.viewer(vue, { default: defauts, scenes: scenes });
      } catch (e) {
        vue.parentNode.removeChild(vue);
        vue = null;
        echec();
        return;
      }

      vue.setAttribute("role", "application");
      vue.setAttribute("aria-roledescription", "Visionneuse panoramique");
      vue.setAttribute(
        "aria-label",
        "Visite 360. Flèches pour regarder autour, plus et moins pour zoomer, tabulation pour atteindre les passages."
      );

      /* Le credit Pannellum du menu contextuel s'ouvre dans un onglet
         sans `rel`. On referme la fuite d'opener. */
      var credit = vue.querySelector(".pnlm-about-msg a");
      if (credit) credit.setAttribute("rel", "noopener noreferrer");

      batirHud();

      /* Des que la main prend le relais, la derive s'arrete pour de
         bon : `loadScene` relit la config par defaut et la ferait
         repartir a chaque changement de piece si on ne le retenait pas. */
      ["pointerdown", "touchstart", "wheel", "keydown"].forEach(function (n) {
        vue.addEventListener(n, function () { mainMise = true; }, { passive: true });
      });

      visionneur.on("load", chargee);
      visionneur.on("scenechange", changee);
      visionneur.on("error", function (msg) {
        scene.removeAttribute("aria-busy");
        if (annonce) annonce.textContent = String(msg || "La visite n’a pas pu s’ouvrir.");
      });

      /* Le clic vient de creer le widget : le focus doit y entrer,
         sinon les fleches ne repondent a personne. QUAND LA VISITE
         S'EST OUVERTE SEULE, PERSONNE N'A RIEN DEMANDE — on ne
         deplace pas le focus de quelqu'un qui ne fait que passer. */
      if (!seul) {
        try { vue.focus({ preventScroll: true }); } catch (e) { vue.focus(); }
      }
    }

    function fabriquer(p, hd) {
      return {
        type: "equirectangular",
        panorama: base + DOSSIER + p.id + (hd ? "-4k" : "-2k") + ".webp",
        yaw: p.yaw,
        pitch: p.pitch,
        hfov: p.hfov,
        /* Les passages visent toujours la scene legere : on change de
           piece en 2k, le 4k rattrape ensuite. */
        hotSpots: p.liens.map(function (l) {
          var cible = par(l.id);
          return {
            type: "scene",
            sceneId: l.id,
            yaw: l.yaw,
            pitch: l.pitch,
            targetYaw: l.arrivee,
            targetPitch: 0,
            targetHfov: cible.hfov,
            createTooltipFunc: equiper,
            createTooltipArgs: { nom: cible.nom, aria: "Aller " + cible.vers }
          };
        })
      };
    }

    /* Pannellum appelle ceci avec le `div` qu'il vient de creer, apres
       lui avoir pose son `onclick`. C'est le seul point d'accroche
       propre pour reparer l'accessibilite sans toucher au vendor. */
    function equiper(el, args) {
      el.classList.add("tour-hs");
      el.setAttribute("tabindex", "0");
      el.setAttribute("role", "link");
      el.setAttribute("aria-label", args.aria);

      var txt = doc.createElement("span");
      txt.className = "tour-hs-txt";
      txt.textContent = args.nom;
      el.appendChild(txt);

      el.addEventListener("keydown", function (ev) {
        var k = ev.key;
        if (k === "Enter" || k === " " || k === "Spacebar" || ev.keyCode === 13 || ev.keyCode === 32) {
          ev.preventDefault();
          ev.stopPropagation();
          el.click();
        }
      });
    }

    function batirHud() {
      hud = doc.createElement("div");
      hud.className = "tour-hud";

      var ctls = doc.createElement("div");
      ctls.className = "tour-ctls";

      ctls.appendChild(
        commande("Reculer le cadrage", svg('<path d="M5 12h14"/>'), function () {
          visionneur.setHfov(Math.min(HFOV_MAX, visionneur.getHfov() + 12), reduit ? 0 : 260);
        })
      );
      ctls.appendChild(
        commande("Rapprocher le cadrage", svg('<path d="M12 5v14"/><path d="M5 12h14"/>'), function () {
          visionneur.setHfov(Math.max(HFOV_MIN, visionneur.getHfov() - 12), reduit ? 0 : 260);
        })
      );

      var plein = commande(
        "Passer en plein écran",
        svg('<path d="M4 9V4h5"/><path d="M20 9V4h-5"/><path d="M4 15v5h5"/><path d="M20 15v5h-5"/>'),
        function () { visionneur.toggleFullscreen(); }
      );
      plein.setAttribute("aria-pressed", "false");
      ctls.appendChild(plein);

      ["fullscreenchange", "webkitfullscreenchange", "mozfullscreenchange", "MSFullscreenChange"].forEach(function (n) {
        doc.addEventListener(n, function () {
          var actif = (doc.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullScreenElement || doc.msFullscreenElement) === vue;
          plein.setAttribute("aria-pressed", actif ? "true" : "false");
          plein.setAttribute("aria-label", actif ? "Quitter le plein écran" : "Passer en plein écran");
        });
      });

      hud.appendChild(ctls);

      var carte = doc.createElement("div");
      carte.className = "tour-map";
      carte.setAttribute("role", "group");
      carte.setAttribute("aria-label", "Plan — changer de pièce");

      PIECES.forEach(function (p) {
        var b = doc.createElement("button");
        b.type = "button";
        b.className = "tour-map-room";
        b.textContent = p.nom;
        b.style.left = p.boite[0] + "%";
        b.style.top = p.boite[1] + "%";
        b.style.width = p.boite[2] + "%";
        b.style.height = p.boite[3] + "%";
        b.addEventListener("click", function () {
          if (racine(visionneur.getScene()) === p.id) return;
          /* LE PASSAGE D'UNE PIECE A L'AUTRE EST CELUI DE PANNELLUM.
             La trame qui le recouvrait etait un verbe de l'ancienne
             identite ; son moteur est parti, et `sceneFadeDuration`
             fait deja le fondu — sous mouvement reduit il vaut 0. */
          visionneur.loadScene(p.id, p.pitch, p.yaw, p.hfov);
        });
        pastilles[p.id] = b;
        carte.appendChild(b);
      });

      /* Le SVG passe APRES les boutons pour que les murs restent
         lisibles par-dessus l'aplat de la piece courante. */
      carte.insertAdjacentHTML("beforeend", PLAN_SVG);
      hud.appendChild(carte);

      annonce = doc.createElement("p");
      annonce.className = "tour-sr";
      annonce.setAttribute("aria-live", "polite");
      hud.appendChild(annonce);

      vue.appendChild(hud);
    }

    function commande(nom, dessin, action) {
      var b = doc.createElement("button");
      b.type = "button";
      b.className = "tour-ctl";
      b.setAttribute("aria-label", nom);
      b.innerHTML = dessin;
      b.addEventListener("click", action);
      return b;
    }

    function changee(id) {
      marquer(racine(id));
    }

    function chargee() {
      var id = visionneur.getScene();
      var court = racine(id);
      var p = par(court);

      bloc.classList.remove("is-loading");
      bloc.classList.add("is-live");
      scene.removeAttribute("aria-busy");

      var affiche = scene.querySelector("[data-tour-poster]");
      if (affiche) affiche.parentNode.removeChild(affiche);

      marquer(court);

      if (reduit || mainMise) { try { visionneur.stopAutoRotate(); } catch (e) {} }

      if (id === court && p && annonce) annonce.textContent = p.nom;

      monterEnQualite(id);
    }

    function marquer(id) {
      PIECES.forEach(function (p) {
        var b = pastilles[p.id];
        if (b) b.setAttribute("aria-current", p.id === id ? "true" : "false");
      });
    }

    function monterEnQualite(id) {
      if (!veutHd || mort) return;
      if (id.indexOf(HD) !== -1) return;

      var img = new Image();
      img.decoding = "async";
      /* Pannellum demande ses panoramas en `crossOrigin = anonymous`.
         Sans le meme mode ici, Chromium range la precharge dans une
         autre entree de cache et telecharge le 4k DEUX fois. */
      img.crossOrigin = "anonymous";
      img.onload = function () {
        if (mort || !visionneur) return;
        if (visionneur.getScene() !== id) return;
        try {
          visionneur.loadScene(id + HD, visionneur.getPitch(), visionneur.getYaw(), visionneur.getHfov());
        } catch (e) { /* la 2k reste a l'ecran : echec sans consequence */ }
      };
      img.src = base + DOSSIER + id + "-4k.webp";
    }

    window.addEventListener("pagehide", function () {
      mort = true;
      if (visionneur) { try { visionneur.destroy(); } catch (e) {} }
    });
  }

  function init() {
    var blocs = doc.querySelectorAll("[data-tour]");
    for (var i = 0; i < blocs.length; i++) demarrer(blocs[i], i);
  }

  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", init);
  else init();
})();

