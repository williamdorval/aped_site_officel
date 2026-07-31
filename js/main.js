/* == APED AGENCE - Logique ==  D-352 */

(function () {
  "use strict";

  /* == Constantes metier. Inchangees. == */
  var CONTACT_EMAIL = "dorvalwilliam11@gmail.com";
  var FORM_ENDPOINT = "https://formsubmit.co/ajax/" + CONTACT_EMAIL;

  var BOOKING = {
    businessDays: [1, 2, 3, 4, 5],
    slots: ["9:00", "9:30", "10:00", "10:30", "11:00", "11:30",
            "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"],
    minNoticeHours: 24,
    horizonDays: 42
  };

  var SUBJECTS = {
    project: "Nouveau projet - site APED",
    urgent: "URGENCE - site APED",
    refer: "Nouvelle reference - site APED",
    estimate: "Demande d'estimation - site APED",
    booking: "Demande de rendez-vous - site APED",
    roi: "Calcul ROI - site APED",
    cadeau: "Documents demandes - site APED"
  };

  /* == LE BAREME PUBLIE — et ce qui a disparu d'ici. ==  D-353 */
  var BAREME = [
    { bas: 2500, haut: 5000 },
    { bas: 5000, haut: 10000 },
    { bas: 10000, haut: 20000 },
    { bas: 20000, haut: 40000 },
    { bas: 40000, haut: null }   /* au-dela : sur devis */
  ];

  /* Le score est GROSSIER a dessein : plusieurs combinaisons tombent
     dans la meme fourchette, donc aucune ne peut etre isolee. */
  var POIDS = {
    type: { vitrine: 0, automatisation: 1, ecommerce: 2, app: 4 },
    envergure: { petit: 0, moyen: 1, grand: 3 },
    design: { essentiel: 0, premium: 1, signature: 2 },
    delai: { flexible: 0, normal: 0, urgent: 1 }
  };

  var ANSWER_LABELS = {
    vitrine: "Site vitrine", ecommerce: "E-commerce", app: "Application ou logiciel",
    automatisation: "Automatisation et IA",
    restauration: "Restauration", construction: "Construction et services",
    commerce: "Commerce de detail", sante: "Sante et beaute", immobilier: "Immobilier", autre: "Autre",
    petit: "Simple", moyen: "Moyen", grand: "Ambitieux",
    essentiel: "Essentiel", premium: "Premium", signature: "Signature",
    urgent: "Urgent (moins d'un mois)", normal: "1 a 2 mois", flexible: "Flexible",
    oui: "Oui", non: "Non"
  };

  var doc = document;
  var root = doc.documentElement;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  var isDesktop = window.matchMedia("(min-width: 64em)");

  var $ = function (sel, ctx) { return (ctx || doc).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); };

  var fmtMoney = function (n) { return Math.round(n).toLocaleString("fr-CA") + " $"; };
  /* B7 · LA FAUSSE PRECISION INVITE EXACTEMENT LA CONTESTATION  D-354 */
  var fmtImpact = function (n) {
    return "≈ " + (Math.round(n / 100) * 100).toLocaleString("fr-CA") + " $";
  };
  var fmtHours = function (n) { return (Math.round(n * 10) / 10).toLocaleString("fr-CA") + " h"; };

  /* == Ressort. Sert a l'odometre du calculateur : le chiffre a une ==  D-355 */
  function Spring(onFrame, stiffness, damping) {
    this.value = 0;
    this.target = 0;
    this.velocity = 0;
    this.k = stiffness || 120;
    this.d = damping || 20;
    this.onFrame = onFrame;
    this.raf = 0;
    this.last = 0;
  }
  Spring.prototype.set = function (target, immediate) {
    this.target = target;
    if (immediate || reduced.matches) {
      this.value = target;
      this.velocity = 0;
      this.onFrame(this.value);
      return;
    }
    if (!this.raf) {
      this.last = 0;
      this.raf = requestAnimationFrame(this.step.bind(this));
    }
  };
  Spring.prototype.step = function (now) {
    var dt = this.last ? Math.min((now - this.last) / 1000, 1 / 30) : 1 / 60;
    this.last = now;
    var force = (this.target - this.value) * this.k;
    this.velocity += (force - this.velocity * this.d) * dt;
    this.value += this.velocity * dt;
    var span = Math.max(1, Math.abs(this.target));
    if (Math.abs(this.target - this.value) < span * 0.0005 && Math.abs(this.velocity) < span * 0.02) {
      this.value = this.target;
      this.velocity = 0;
      this.raf = 0;
      this.onFrame(this.value);
      return;
    }
    this.onFrame(this.value);
    this.raf = requestAnimationFrame(this.step.bind(this));
  };

  /* == SEQUENCE D'ENTREE — CE QUE LE SCRIPT AJOUTE, ET CE QU'IL ==  D-356 */
  var entree = $("#entree");
  if (entree) {
    if (!root.classList.contains("entree-on")) {
      entree.parentNode.removeChild(entree);
    } else if (reduced.matches) {
      /* Mouvement reduit : le CSS pose le monogramme, le tient
         520 ms, puis le fait disparaitre d'un cran. On ne fait que
         retirer le noeud une fois qu'il n'est plus visible. */
      window.setTimeout(function () {
        root.classList.remove("entree-on");
        if (entree.parentNode) entree.parentNode.removeChild(entree);
      }, 640);
    } else {
      /* LA PLAQUE SE REND A LA PLACE DU HERO.  D-357 */
      (function viser() {
        if (performance.now() > 600) return;
        var plaque = entree.querySelector(".entree-plaque");
        var cadre = $("#heroPlate");
        if (!plaque || !cadre) return;
        var c = cadre.getBoundingClientRect();
        if (!c.width || !c.height) return;
        var cx = c.left + c.width / 2;
        var cy = c.top + c.height / 2;
        plaque.style.setProperty("--entree-dx", Math.round(cx - window.innerWidth / 2) + "px");
        plaque.style.setProperty("--entree-dy", Math.round(cy - window.innerHeight / 2) + "px");
      })();

      /* 2. L'ATTENTE  D-358 */
      /* LA COMPOSITION DU HERO A SA PROPRE VIE  D-359 */
      var leve = false;
      function lever() {
        if (leve) return;
        leve = true;
        root.classList.remove("entree-attend");
      }
      root.classList.add("entree-attend");
      /* LES PLAQUES SONT POSEES TOUT DE SUITE, MAIS A L'ARRET.  D-360 */
      root.classList.add("compo-hero");
      root.classList.add("compo-attend");

      var restent = 2;
      function pret() { if (--restent <= 0) lever(); }

      /* Les polices. `document.fonts.ready` se resout quand toutes  D-361 */
      if (doc.fonts && doc.fonts.ready && typeof doc.fonts.ready.then === "function") {
        doc.fonts.ready.then(pret, pret);
      } else { pret(); }

      /* La limaille du hero. `hero.js` pose `is-live` sur l'hote une  D-362 */
      (function attendreLimaille() {
        var hote = $("#heroPlate");
        if (!hote) { pret(); return; }
        if (hote.classList.contains("is-live") || hote.classList.contains("is-fallback")) { pret(); return; }
        var obs = new MutationObserver(function () {
          if (hote.classList.contains("is-live") || hote.classList.contains("is-fallback")) {
            obs.disconnect();
            pret();
          }
        });
        obs.observe(hote, { attributes: true, attributeFilter: ["class"] });
        /* L'observateur n'est pas un contrat : si la classe
           n'arrive jamais, le garde-fou general tranche. */
      })();

      /* LE GARDE-FOU  D-363 */
      window.setTimeout(lever, Math.max(0, 2500 - performance.now()));

      /* 3. LE SAUT  D-364 */
      function sauter() {
        if (root.classList.contains("entree-saut")) return;
        lever();
        root.classList.add("entree-saut");
        window.setTimeout(finir, 200);
      }
      var opts = { capture: true, passive: true, once: true };
      window.addEventListener("pointerdown", sauter, opts);
      window.addEventListener("keydown", sauter, opts);

      /* LA FIN, ET LE DEPART DE LA COMPOSITION  D-365 */
      var fini = false;
      function finir() {
        root.classList.remove("entree-on");
        root.classList.remove("entree-attend");
        if (entree.parentNode) entree.parentNode.removeChild(entree);
        if (fini) return;
        fini = true;
        /* LE DEPART. La pause tombe, les onze horloges partent
           ensemble, et `--e:0` veut dire « maintenant ». */
        root.classList.remove("compo-attend");
        /* 3,2 s de budget. Le dernier geste est la soudure du filet  D-366 */
        window.setTimeout(function () {
          root.classList.remove("compo-hero");
          root.classList.remove("compo-attend");
          root.classList.remove("entree-saut");
        }, 3200);
      }
      entree.addEventListener("animationend", function (e) {
        if (!e.target.hasAttribute || !e.target.hasAttribute("data-entree-fin")) return;
        finir();
      });
      /* Filet de securite : si l'animation ne se declenche pas du  D-367 */
      window.setTimeout(finir, Math.max(1800, 2500 - performance.now() + 700));
    }
  }

  /* == SECTION 02 · LA PISTE, LE RAIL ET LE PANNEAU ==  D-368 */

  /* LA FICHE DE SERVICE N'EST PAS UNE `.modal` — c'est un  D-369 */
  var ficheOuverte = null;
  var fermerFiche = function () {};

  (function svcRail() {
    var piste = $("[data-svc-piste]");
    var scene = $("[data-svc-scene]");
    var rail = $("[data-svc-rail]");
    if (!piste || !scene || !rail) return;

    var vitre = rail.parentNode;
    var plans = $$(".svc-plan", rail);
    var compte = $("[data-svc-compte]");
    var n = plans.length;
    if (n < 2) return;

    /* LE DERNIER ITEM DU RAIL N'EST PAS UN SERVICE : c'est le panneau  D-481 */
    var nSvc = 0;
    for (var z = 0; z < n; z++) if (!plans[z].classList.contains("svc-plan--fin")) nSvc++;

    /* EST-CE QUE LE RAIL EXISTE ? LA REPONSE EST DANS LE CSS.  D-370 */
    var estActif = false;
    var course = 0;     /* distance verticale de la piste, en px */
    var collant = 0;    /* le `top` effectif du `position: sticky` */
    var cibles = [];    /* scrollLeft de REPOS, un par item */

    var premierArmement = true;

    /* LA POSITION DE REPOS D'UN CHANTIER — ET C'EST ICI QUE LES DEUX  D-482 */
    function mesurer() {
      cibles = [];
      /* LA MARGE DU RAIL SE MESURE SUR LE TEXTE, ELLE NE SE RECALCULE  D-493 */
      var ref = scene.querySelector(".svc-pied > .wrap") || scene.querySelector(".svc-tete .wrap");
      if (ref) {
        var m = Math.round(ref.getBoundingClientRect().left - vitre.getBoundingClientRect().left);
        if (m >= 0 && m < 600) rail.style.paddingInline = m + "px";
      }
      /* LA MARGE DE FIN N'EST PAS CELLE DU TEXTE.  D-598
         Elle l'etait, et le dernier item ne pouvait donc jamais se
         centrer : sa cible `centre - W/2` depassait le `scrollLeft`
         maximal et se faisait borner, si bien que le panneau de
         cloture se calait contre le bord droit — 222 px a droite de
         la ou toutes les autres cartes s'arretent. On reserve donc a
         DROITE la gouttiere de centrage d'une carte. La marge de
         gauche, elle, reste celle du texte : au repos, la premiere
         carte doit s'aligner sur le titre. */
      var derniere = plans[n - 1];
      if (derniere) {
        /* `ceil` plus deux pixels : au pixel pres, le bornage de la
           cible mordait encore de 6 px et la derniere carte
           s'arretait a cote des autres. On reserve un cheveu de
           trop — la reserve ne se voit pas, le decalage si. */
        var reste = vitre.clientWidth - derniere.getBoundingClientRect().width;
        if (reste > 0) rail.style.paddingInlineEnd = (Math.ceil(reste / 2) + 2) + "px";
      }
      var W = vitre.clientWidth;
      var max = Math.max(0, vitre.scrollWidth - W);
      if (W <= 0) return;
      var base = vitre.scrollLeft;
      var vb = vitre.getBoundingClientRect();
      for (var i = 0; i < n; i++) {
        var pb = plans[i].getBoundingClientRect();
        /* La position DANS LE CONTENU, relue par rectangles : elle ne
           depend d'aucun `offsetParent`, donc d'aucun `position` pose
           ailleurs dans la section. */
        var gauche = pb.left - vb.left + base;
        var c = gauche + pb.width / 2 - W / 2;
        if (c < 0) c = 0; else if (c > max) c = max;
        cibles.push(c);
      }
    }

    function relire() {
      var st = getComputedStyle(scene);
      var etait = estActif;
      estActif = st.position === "sticky";
      collant = parseFloat(st.top) || 0;
      course = Math.max(0, piste.offsetHeight - scene.offsetHeight);
      /* Toute relecture de geometrie invalide la position ecrite. */
      figer();
      if (!estActif) {
        rail.removeAttribute("data-degage");
        vitre.scrollLeft = 0;
        cibles = [];
      } else {
        mesurer();
        /* LA PREMIERE IMAGE NE DOIT DEPENDRE DE PERSONNE.  D-372 */
        var r0 = piste.getBoundingClientRect();
        var h0 = window.innerHeight;
        if (r0.bottom > -h0 * 0.5 && r0.top < h0 * 1.5) enVue = true;
      }
      image();
      /* L'ARRIVEE PAR ANCRE SE JOUE ICI, ET NULLE PART AILLEURS.  D-373 */
      if (estActif && (!etait || premierArmement)) {
        premierArmement = false;
        surAncre();
      }
    }

    /* LA CARTE DE PROGRESSION — V2 · S'ALIGNER, arretee d'un  D-374 */
    /* LA ZONE MORTE PASSE DE 18 % A 10 %.  D-597
       Elle s'ajoutait au lissage : 18 % de plat, puis TOUTE la
       distance parcourue sur les 64 % du milieu, puis 18 % de plat.
       La pente maximale valait donc 1,5 / 0,64 = 2,34 fois la
       moyenne — la carte restait immobile, partait d'un coup, se
       rearretait. C'est ce qu'on ressentait comme « ca n'a pas de
       rythme ». A 10 %, la pente maximale tombe a 1,79, et le pas
       vertical a ete ouvert a 400 px pour compenser la glisse plus
       longue. Le repos, lui, ne change pas : arrivee et depart
       restent a derivee nulle, donc aucun depassement — ζ = 1. */
    var MORT = 0.10;

    function lisser(t) { return t * t * (3 - 2 * t); }

    var actuel = -1;

    /* L'ODOMETRE — V4 · CRAN. Deux cases, une fenetre d'une ligne :  D-483 */
    var bascule = false;

    function deuxChiffres(k) { return (k < 10 ? "0" : "") + k; }

    function poserCompte(k) {
      if (!compte || compte.children.length < 2) return;
      var txt = deuxChiffres(Math.min(k + 1, nSvc));
      var idx = bascule ? 0 : 1;
      if (compte.children[idx].textContent === txt) return;
      compte.children[idx].textContent = txt;
      compte.style.transform = bascule ? "translateY(0)" : "translateY(-50%)";
      bascule = !bascule;
    }

    function marquer(k) {
      if (k === actuel) return;
      actuel = k;
      /* LE VOILE DES NOMS NAIT AVEC LE PREMIER MARQUAGE, PAS AVANT.  D-375 */
      rail.setAttribute("data-degage", "");
      for (var i = 0; i < plans.length; i++) {
        if (i === k) plans[i].setAttribute("data-actif", "");
        else plans[i].removeAttribute("data-actif");
        /* `data-vu` NE SE RETIRE JAMAIS. Le degagement du nom est  D-376 */
        /* `k + 1` ET NON `k` : le chantier SUIVANT deborde toujours  D-492 */
        if (i <= k + 1) plans[i].setAttribute("data-vu", "");
      }
      poserCompte(k);
    }

    /* UNE SEULE LECTURE DE MISE EN PAGE PAR IMAGE, ET ELLE VIENT  D-377 */
    function image() {
      if (!estActif || !enVue) return;
      /* LE FILET DE SECURITE. Une geometrie degeneree — course nulle  D-378 */
      if (course <= 0 || cibles.length !== n) { marquer(n - 1); return; }
      var haut = piste.getBoundingClientRect().top;
      var p = (collant - haut) / course;
      if (p < 0) p = 0; else if (p > 1) p = 1;

      var u = p * (n - 1);
      var i = Math.floor(u);
      if (i > n - 2) i = n - 2;
      var f = u - i;
      var g = (f - MORT) / (1 - 2 * MORT);
      if (g < 0) g = 0; else if (g > 1) g = 1;
      var t = lisser(g);

      /* `scrollLeft` ET NON `transform` — voir l'argument en tete du  D-379 */
      vise = cibles[i] + (cibles[i + 1] - cibles[i]) * t;
      marquer(t >= 0.5 ? i + 1 : i);
      ecrire();
    }

    /* == LE RATTRAPAGE — LE CORRECTIF DE « CA NE GLISSE PAS ». ==  D-599
       La cible ci-dessus est une fonction PURE de la position de
       defilement, et elle le reste. Mais une molette n'avance pas de
       facon continue : elle envoie des paliers d'environ 100 px,
       donc le rail se posait vingt fois par seconde a des endroits
       distants les uns des autres, et sautait. Meme cause que la
       saccade du sas, meme correctif : entre deux crans de molette,
       on rejoint la cible sur le rythme d'affichage.
       Ce qui compte est preserve : A L'ARRET, la position converge
       vers la valeur exacte de la cible — donc une meme position de
       defilement rend toujours le meme cadrage, et un arret en plein
       vol reste un etat legitime. Toute mesure doit laisser 400 ms
       de convergence avant de lire. */
    var vise = null;
    var pose = null;
    var boucle = 0;

    function ecrire() {
      if (vise === null) return;
      if (pose === null) { pose = vise; vitre.scrollLeft = vise; return; }
      if (!boucle) boucle = requestAnimationFrame(rattraper);
    }

    function rattraper() {
      boucle = 0;
      if (vise === null || pose === null) return;
      var d = vise - pose;
      if (d < 0.5 && d > -0.5) { pose = vise; vitre.scrollLeft = vise; return; }
      pose += d * 0.22;
      vitre.scrollLeft = pose;
      boucle = requestAnimationFrame(rattraper);
    }

    /* Un recalcul de geometrie invalide la position ecrite : on
       reprend au pixel, sans rattrapage, sinon le rail glisserait
       tout seul apres un redimensionnement ou une arrivee par
       ancre. */
    function figer() {
      pose = null;
      if (boucle) { cancelAnimationFrame(boucle); boucle = 0; }
    }

    /* LE PILOTE. Un ecouteur `scroll` passif, une seule image  D-380 */
    var enVue = false;
    var attend = false;

    function surDefilement() {
      if (attend) return;
      attend = true;
      requestAnimationFrame(function () { attend = false; image(); });
    }

    if (window.IntersectionObserver) {
      new IntersectionObserver(function (entrees) {
        enVue = entrees[0].isIntersecting;
        image();
        /* LA MARGE EST GENEREUSE, ET C'EST DELIBERE. A 120 px, une  D-381 */
      }, { rootMargin: "50% 0px" }).observe(piste);
    } else {
      enVue = true;
    }

    window.addEventListener("scroll", surDefilement, { passive: true });

    /* Le redimensionnement change la course, les cibles et la hauteur  D-382 */
    var attendR = false;
    window.addEventListener("resize", function () {
      if (attendR) return;
      attendR = true;
      requestAnimationFrame(function () { attendR = false; relire(); });
    }, { passive: true });

    /* `differe.css` est injecte APRES le premier rendu : au moment  D-383 */
    /* L'ARMEMENT — on ESSAIE jusqu'a ce que la feuille differee soit  D-384 */
    var essais = 0;
    (function armer() {
      relire();
      if (!estActif && essais++ < 40) window.setTimeout(armer, 50);
    })();
    window.addEventListener("load", relire);
    /* `bfcache` rejoue `pageshow` sans rejouer le script. */
    window.addEventListener("pageshow", relire);
    /* LES POLICES CHANGENT LA LARGEUR DES NOMS, DONC LES CIBLES.  D-484 */
    if (doc.fonts && doc.fonts.ready && doc.fonts.ready.then) {
      doc.fonts.ready.then(function () { if (estActif) { mesurer(); image(); } });
    }

    /* LA VITRE NE DEFILE QUE SUR L'AXE QU'ON PILOTE.  D-385 */
    vitre.addEventListener("scroll", function () {
      if (vitre.scrollTop !== 0) vitre.scrollTop = 0;
    }, { passive: true });

    /* ALLER A UN CHANTIER — on defile la PAGE, et rien d'autre.  D-386 */
    function allerA(k, doux) {
      if (!estActif || course <= 0) return;
      var haut = piste.getBoundingClientRect().top;
      var y = window.scrollY + haut - collant + (k / (n - 1)) * course;
      y = Math.round(y);
      if (doux && !reduced.matches && window.scrollTo) {
        window.scrollTo({ top: y, behavior: "smooth" });
      } else {
        window.scrollTo(0, y);
      }
    }

    /* L'ARRIVEE PAR ANCRE.  D-388 */
    /* ON VERIFIE L'ATTERRISSAGE, ON NE LE SUPPOSE PAS.  D-389 */
    var libre = false;
    ["wheel", "touchstart", "keydown", "pointerdown"].forEach(function (nom) {
      window.addEventListener(nom, function () { libre = true; }, { passive: true, once: true });
    });

    function viser(k) {
      var essais2 = 0;
      (function poser() {
        if (libre || !estActif || course <= 0 || essais2++ > 30) return;
        var haut = piste.getBoundingClientRect().top;
        var y = Math.round(window.scrollY + haut - collant + (k / (n - 1)) * course);
        if (Math.abs(window.scrollY - y) > 2) window.scrollTo(0, y);
        requestAnimationFrame(poser);
      })();
    }

    function surAncre() {
      var h = location.hash;
      if (h && h.indexOf("#svc-fiche-") === 0) { ouvrirParId(h.slice(1), null); return; }
      if (!h || h.indexOf("#svc-0") !== 0) return;
      for (var i = 0; i < plans.length; i++) {
        if ("#" + plans[i].id === h) { viser(i); return; }
      }
    }
    window.addEventListener("hashchange", surAncre);

    /* LE FOCUS NE DESYNCHRONISE RIEN.  D-390 */
    rail.addEventListener("focusin", function (e) {
      if (!estActif) return;
      var plan = e.target.closest ? e.target.closest(".svc-plan") : null;
      if (!plan) return;
      var k = plans.indexOf(plan);
      if (k < 0) return;
      var vb = vitre.getBoundingClientRect();
      var pb = plan.getBoundingClientRect();
      if (pb.left >= vb.left - 2 && pb.right <= vb.right + 2) return;
      allerA(k, false);
    });

    /* == LE PANNEAU DE DETAIL ==  D-392 */
    /* IL VIT HORS DU RAIL. C'EST LA CAUSE DU PANNEAU COUPE, ET LA  D-485 */
    var boite = $("[data-svc-fiches]");
    var fiches = $$(".svc-fiche");
    var retour = null;

    function parId(id) {
      for (var i = 0; i < fiches.length; i++) if (fiches[i].id === id) return fiches[i];
      return null;
    }

    function ouvrir(f, declencheur) {
      if (!f || ficheOuverte === f) return;
      if (ficheOuverte) fermer(ficheOuverte, true);
      retour = declencheur || null;
      f.setAttribute("data-ouvert", "");
      /* LE ROLE N'EXISTE QUE QUAND LE PANNEAU EST UN CALQUE.  D-486 */
      f.setAttribute("role", "dialog");
      f.setAttribute("aria-modal", "true");
      ficheOuverte = f;
      lockScroll();
      try { f.focus({ preventScroll: true }); } catch (e) {}
      try { history.pushState({ aped: "svc-fiche" }, "", "#" + f.id); } catch (e) {}
    }

    function ouvrirParId(id, declencheur) { ouvrir(parId(id), declencheur); }

    function fermer(f, net) {
      if (!f || !f.hasAttribute("data-ouvert")) return;
      var brut = net || reduced.matches || doc.documentElement.getAttribute("data-palier") === "2";
      var fini = function () {
        f.removeAttribute("data-ouvert");
        f.removeAttribute("data-sortant");
        f.removeAttribute("role");
        f.removeAttribute("aria-modal");
        if (ficheOuverte === f) ficheOuverte = null;
        unlockScroll();
        /* ON REVIENT EXACTEMENT OU ON ETAIT : le verrou n'a jamais  D-487 */
        if (retour) {
          try { retour.focus({ preventScroll: true }); } catch (e) {}
          retour = null;
        }
      };
      if (brut) { fini(); return; }
      f.setAttribute("data-sortant", "");
      window.setTimeout(fini, 300);
    }

    /* Toutes les routes de fermeture passent par ici : c'est ce qui
       garantit que le bouton Precedent et la touche Echap laissent
       l'historique dans le meme etat. */
    fermerFiche = function () {
      if (!ficheOuverte) return;
      if (history.state && history.state.aped === "svc-fiche") history.back();
      else fermer(ficheOuverte);
    };
    window.addEventListener("popstate", function () {
      if (ficheOuverte) fermer(ficheOuverte);
    });

    var portes = $$("[data-svc-ouvre]");
    for (var q = 0; q < portes.length; q++) {
      (function (a) {
        a.addEventListener("click", function (e) {
          var f = parId(a.getAttribute("data-svc-ouvre"));
          /* SANS CIBLE, L'ANCRE FAIT SON TRAVAIL. Le lien reste un
             lien : c'est lui, et pas le script, qui rend la fiche
             atteignable quand le script n'a pas tourne. */
          if (!f) return;
          e.preventDefault();
          ouvrir(f, a);
        });
      })(portes[q]);
    }

    var croix = $$("[data-svc-ferme]");
    for (var c = 0; c < croix.length; c++) {
      croix[c].addEventListener("click", function () { fermerFiche(); });
    }

    /* LES PORTES DU PIED FERMENT AVANT DE SAUTER : sinon le visiteur  D-488 */
    var sauts = $$("[data-svc-ferme-vers]");
    for (var s2 = 0; s2 < sauts.length; s2++) {
      sauts[s2].addEventListener("click", function (e) {
        if (ficheOuverte) fermer(ficheOuverte, true);
        if (e.currentTarget.hasAttribute("data-lance-visite")) lancerLaVisite();
      });
    }

    /* == OUVRIR LA VISITE DEPUIS LE PANNEAU 03. ==  D-607
       Trois choses doivent s'etre produites avant que le clic serve a
       quelque chose, et aucune n'est instantanee :
         1. le panneau doit etre ferme, sinon le verrou de defilement
            tient encore la page ;
         2. l'ancre `#visite` doit avoir fini d'atterrir — la re-visee
            de `viserLesAncres` repasse jusqu'a 900 ms apres le saut,
            et un lecteur qui demarre pendant qu'on corrige la
            position donne une arrivee bancale ;
         3. `tour360.js` doit etre CABLE. Il arrive en vague 2 : un
            `.click()` envoye avant frappe un bouton sans ecouteur et
            ne fait rien, en silence. D'ou le drapeau `data-tour-pret`
            pose par ce fichier-la.
       On attend donc le drapeau, jusqu'a quatre secondes, puis on
       clique UNE fois. Si le drapeau n'arrive jamais, on ne fait
       rien : le visiteur est de toute facon devant le bouton, a
       l'endroit exact ou il faut cliquer. */
    function lancerLaVisite() {
      var debut = Date.now();
      (function guetter() {
        var bloc = $("[data-tour]");
        var bouton = $("[data-tour-start]");
        if (bloc && bouton && bloc.hasAttribute("data-tour-pret")) {
          if (!bloc.classList.contains("is-loading")) bouton.click();
          return;
        }
        if (Date.now() - debut > 4000) return;
        window.setTimeout(guetter, 120);
      })();
    }

    /* LE CLIC A L'EXTERIEUR. Le voile est le `::before` de la boite :  D-489 */
    if (boite) {
      boite.addEventListener("click", function (e) {
        if (e.target === boite && ficheOuverte) fermerFiche();
      });
    }
  })();

  /* == SECTION 03 · L'AVANT / APRES ==  D-394 */
  (function avantApres() {
    var cadres = $$("[data-ba]");
    if (!cadres.length) return;

    function palier() {
      return doc.documentElement.getAttribute("data-palier") || "0";
    }

    /* --- 1 · LE CURSEUR ---  D-530 */
    /* LA POIGNEE EST UN `input[type=range]` NATIF, ET C'EST TOUT  D-531 */
    var touche = false;
    var scenes = [];

    for (var i = 0; i < cadres.length; i++) {
      (function (cadre) {
        var scene = $(".ba-scene", cadre);
        var curseur = $("[data-ba-curseur]", cadre);
        if (!scene || !curseur) return;
        scenes.push(scene);

        function poser(v) {
          if (!isFinite(v)) return;
          if (v < 0) v = 0; else if (v > 100) v = 100;
          scene.style.setProperty("--ba-p", v);
          /* `aria-valuetext` PARCE QUE « 62 » NE VEUT RIEN DIRE.  D-532 */
          curseur.setAttribute("aria-valuetext", Math.round(v) + " % de la version d'avant");
        }

        /* --- LE GLISSEMENT, ET IL EST EXPLICITE. ---  D-593
           Le `input[type=range]` reste : c'est la bonne semantique
           pour le clavier, le lecteur d'ecran et `aria-valuetext`.
           Mais son glissement NATIF ne repondait pas. Releve du
           2026-07-31, vrai `mouse.down` puis `mouse.move` sur huit
           positions de 15 % a 90 % de la scene : `--ba-p` est reste
           a 50 du debut a la fin, les huit fois, souris ET doigt.
           Le clavier, lui, marchait — donc le champ n'etait ni
           desactive ni couvert.
           Cause : le champ est etire en `inset: 0` sur toute la
           scene et son pouce fait `height: 100%`, mais la PISTE du
           champ n'a aucune hauteur. Chromium ne suit le pointeur que
           s'il est dans la piste : une bande mince, qui n'est pas la
           ou le visiteur attrape.
           `ba-check.mjs` ne POUVAIT pas le voir : il synthetisait un
           evenement `input` au lieu de glisser. Piege 17 — un test
           qui verrouille le defaut qu'il devait attraper.
           On pilote donc au pointeur, et on garde le champ. */
        var idPointeur = null;
        var pese = null;

        /* LA MOLETTE POSEE SUR LA PRISE DOIT DESCENDRE DANS LE CADRE,
           PAS DANS LA PAGE.  D-641
           La prise de la poignee est une colonne de 2,75 rem, large
           assez pour un doigt. Elle vit dans la SCENE, pas dans la
           vitre : son ancetre defilant est donc la PAGE. Mesure du
           2026-07-31, molette posee au milieu — la ou la poignee se
           trouve au repos, donc la ou une souris se pose : les cinq
           ecarts de la descente sont tombes a 0,00 % sur les quatre
           comparaisons, et la page a bouge de 330 a 590 px. Le
           correctif d'un geste avait casse l'autre.
           On renvoie donc la molette a la vitre a la main. Onze
           lignes, et les deux gestes tiennent sur toutes les
           machines — y compris un portable tactile, ou le pointeur
           fin et le doigt cohabitent sur le meme ecran.
           `passive: false` parce qu'on refuse le defilement de la
           page ; sans script, la prise n'existe pas du tout
           (`html:not(.js) .ba-trait { display: none }`) et la vitre
           defile nativement partout. */
        var vitre = $("[data-ba-vitre]", cadre);
        var trait = $(".ba-trait", cadre);
        if (vitre && trait) {
          trait.addEventListener("wheel", function (e) {
            var avant = vitre.scrollTop;
            vitre.scrollTop = avant + e.deltaY;
            /* On ne retient l'evenement que si la vitre a vraiment
               bouge : au bout de sa course, la page reprend la main
               comme n'importe quel conteneur qui a fini de defiler. */
            if (vitre.scrollTop !== avant) e.preventDefault();
          }, { passive: false });
        }

        function valeurEn(clientX) {
          var r = scene.getBoundingClientRect();
          if (!r.width) return null;
          return ((clientX - r.left) / r.width) * 100;
        }
        function suivre(clientX) {
          var v = valeurEn(clientX);
          if (v === null) return;
          poser(v);
          curseur.value = String(Math.round(v));
        }

        scene.addEventListener("pointerdown", function (e) {
          if (e.button) return;
          touche = true;
          /* AU DOIGT, ON NE PREND PAS LA MAIN TOUT DE SUITE : le  D-594
             meme geste peut vouloir dire « je compare » ou « je
             continue a lire ». On attend le premier deplacement pour
             trancher ; s'il est plutot vertical, le doigt est rendu
             a la page et le defilement n'est jamais bloque. */
          if (e.pointerType === "touch") {
            pese = { x: e.clientX, y: e.clientY, id: e.pointerId };
            return;
          }
          idPointeur = e.pointerId;
          try { scene.setPointerCapture(e.pointerId); } catch (err) { /* sans capture, ca marche quand meme */ }
          suivre(e.clientX);
        });

        scene.addEventListener("pointermove", function (e) {
          if (pese && e.pointerId === pese.id) {
            var dx = Math.abs(e.clientX - pese.x);
            var dy = Math.abs(e.clientY - pese.y);
            if (dx < 6 && dy < 6) return;
            if (dy > dx) { pese = null; return; }
            idPointeur = pese.id;
            pese = null;
            try { scene.setPointerCapture(idPointeur); } catch (err) {}
          }
          if (idPointeur === null || e.pointerId !== idPointeur) return;
          if (e.cancelable) e.preventDefault();
          suivre(e.clientX);
        });

        function lacher(e) {
          if (pese && e.pointerId === pese.id) pese = null;
          if (idPointeur === null || e.pointerId !== idPointeur) return;
          try { scene.releasePointerCapture(idPointeur); } catch (err) {}
          idPointeur = null;
        }
        scene.addEventListener("pointerup", lacher);
        scene.addEventListener("pointercancel", lacher);

        curseur.addEventListener("input", function () {
          touche = true;
          /* Pendant un glissement, c'est le pointeur qui fait foi :
             le champ natif poserait sa propre valeur par-dessus et
             la poignee sauterait d'un bord a l'autre. */
          if (idPointeur !== null) return;
          poser(Number(curseur.value));
        });
        poser(Number(curseur.value));
        scene.aped_poser = poser;
        scene.aped_curseur = curseur;
      })(cadres[i]);
    }

    /* --- 2 · L'OEIL QUI ALLUMAIT LA BOUCLE EST RETIRE ---  D-628
       Il posait `data-vif` sur chaque scene visible, et `data-vif`
       commandait la boucle de defilement des maquettes (D-533). La
       boucle est partie avec ce chantier : le cadre est devenu un
       petit ecran dans lequel le visiteur descend lui-meme.
       Verifie avant la coupe : plus une seule regle de `app.css` ne
       lit `data-vif`. Un observateur qui ne commande plus rien reste
       un observateur qui tourne — a chaque entree de scene, sur
       quatre scenes — et un piege pour la prochaine lecture. */

    /* --- 3 · LA DEMONSTRATION D'OUVERTURE ---  D-534 */
    /* SANS ELLE, LE VISITEUR NE SAIT PAS QUE CA SE GLISSE. La  D-535 */
    if (reduced.matches || palier() === "2" || !window.IntersectionObserver) return;
    var premiere = scenes[0];
    if (!premiere) return;
    var joue = false;

    var oeil2 = new IntersectionObserver(function (entrees) {
      if (joue || touche || !entrees[0].isIntersecting) return;
      joue = true;
      oeil2.disconnect();
      window.setTimeout(function () {
        if (touche) return;
        var t0 = 0, DUREE = 760;
        premiere.aped_poser(100);
        (function pas(t) {
          if (touche) { premiere.aped_poser(50); premiere.aped_curseur.value = 50; return; }
          if (!t0) t0 = t;
          var p = (t - t0) / DUREE;
          if (p > 1) p = 1;
          /* Une seule arete, franche, qui balaye : V1 · DEGAGER. */
          var e = 1 - Math.pow(1 - p, 3);
          var v = 100 - 50 * e;
          premiere.aped_poser(v);
          premiere.aped_curseur.value = Math.round(v);
          if (p < 1) requestAnimationFrame(pas);
        })(0);
      }, 700);
    }, { threshold: 0.5 });
    oeil2.observe(premiere);
  })();

  /* == PARCOURS — compteur d'etape. ==  D-399 */
  (function parcours() {
    var etapes = $$(".parc-etape");
    if (!etapes.length) return;
    var num = $("#parcNum");
    var nom = $("#parcNom");
    var reste = $("#parcReste");
    var courante = -1;

    function poser(i) {
      if (i === courante) return;
      courante = i;
      etapes.forEach(function (e, k) { e.classList.toggle("is-on", k <= i); });
      /* PHASE 8 · V4 — l'etape roule d'un cran. */
      if (num) rouler(num, ("0" + (i + 1)).slice(-2));
      if (nom) nom.textContent = etapes[i].getAttribute("data-parc") || "";
      if (reste) {
        var r = etapes.length - 1 - i;
        reste.textContent = r === 0
          ? "Dernière étape"
          : r + (r > 1 ? " étapes après celle-ci" : " étape après celle-ci");
      }
    }

    if (!("IntersectionObserver" in window)) { poser(0); return; }
    /* La bande de declenchement est une tranche fine au tiers haut
       de l'ecran : l'etape active est celle qu'on est en train de
       lire, pas celle qui vient d'entrer par le bas. */
    var obs = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (e) {
        if (e.isIntersecting) poser(etapes.indexOf(e.target));
      });
    }, { rootMargin: "-30% 0px -60% 0px" });
    etapes.forEach(function (e) { obs.observe(e); });
    poser(0);
  })();

  /* == LE CADEAU — QUAND IL PARAIT, ET POURQUOI CE N'EST PLUS CE QUE ==  D-400 */
  (function cadeau() {
    var boite = $("#cadeau");
    if (!boite || typeof boite.showModal !== "function") return;

    /* Les deux marqueurs de l'ancienne regle sont effaces a chaque  D-401 */
    try {
      localStorage.removeItem("aped-cadeau");
      localStorage.removeItem("aped-cadeau-donne");
    } catch (e) {}

    /* L'INTERRUPTEUR DES OUTILS DE MESURE. Voir l'en-tete. */
    var vu = false;
    try { vu = sessionStorage.getItem("aped-sans-popup") === "1"; } catch (e) {}

    var declencheur = null;
    var ouvert = false;
    var paru = false;
    var depart = performance.now();
    var derniereAction = 0;

    var PRINCIPAL = 11000;  /* le pic mesure : 11 a 15 s */
    var PLANCHER = 4000;    /* aucun declencheur avant, meme anticipe */
    var SORTIE = 20000;     /* dernier recours */

    /* Il est OCCUPE si le focus est dans un champ, ou s'il vient de
       toucher au calculateur. Deux secondes : le temps qu'un chiffre
       s'installe et qu'on le lise. */
    function occupe() {
      var a = doc.activeElement;
      if (a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)) return true;
      if (performance.now() - derniereAction < 2000) return true;
      if ($(".modal:not([hidden])")) return true;
      if (menu && !menu.hidden) return true;
      return false;
    }

    /* On REPORTE au lieu d'abandonner : c'est la difference entre  D-402 */
    function ouvrir(reprises) {
      if (vu || ouvert || paru) return;
      if (performance.now() - depart < PLANCHER) {
        window.setTimeout(function () { ouvrir(0); }, PLANCHER - (performance.now() - depart));
        return;
      }
      if (occupe()) {
        var n = (reprises || 0) + 1;
        if (n > 10) return;
        window.setTimeout(function () { ouvrir(n); }, 1000);
        return;
      }
      ouvert = true;
      paru = true;
      declencheur = doc.activeElement;
      boite.showModal();
      /* Le focus va au bouton de fermeture, pas au champ : ouvrir
         sur un curseur clignotant dans un formulaire non demande se
         lit comme une reclamation, pas comme un cadeau. */
      var x = $(".cadeau-x", boite);
      if (x) x.focus();
    }

    /* LA SORTIE EST LA RECIPROQUE DE L'ENTREE. On pose la classe,  D-403 */
    function fermer() {
      if (!ouvert || boite.classList.contains("se-retire")) return;
      if (reduced.matches) { boite.close(); return; }
      boite.classList.add("se-retire");
      window.setTimeout(function () {
        boite.classList.remove("se-retire");
        boite.close();
      }, 220);
    }

    boite.addEventListener("close", function () {
      ouvert = false;
      boite.classList.remove("se-retire");
      /* Le natif ne rend pas le focus : on le fait. */
      if (declencheur && declencheur.focus) { try { declencheur.focus(); } catch (e) {} }
    });
    /* Echap passe par `cancel`, pas par nos boutons : on lui donne
       la meme reciproque, sinon la seule sortie clavier serait la
       seule sans mise en scene. */
    boite.addEventListener("cancel", function (e) {
      if (reduced.matches || boite.classList.contains("se-retire")) return;
      e.preventDefault();
      fermer();
    });
    $$("[data-cadeau-non]", boite).forEach(function (b) {
      b.addEventListener("click", fermer);
    });

    /* --- LE FORMULAIRE. Il vit meme si le popup ne parait jamais :
           le meme document est offert ailleurs sur le site. --- */
    (function formulaire() {
      var form = $("#cadeauForm");
      if (!form) return;
      var champ = $("#cadeauEmail", form);
      var etat = $(".form-status", form);
      var bouton = $(".cadeau-go", form);
      var recu = $(".cadeau-recu", boite);

      /* A3 · LA REMISE N'EST PLUS CACHEE AU DEPART.  D-404 */
      function remettre() {
        if (!recu) return;
        recu.hidden = false;
        var a = $("a", recu);
        if (a) a.focus();
      }

      form.addEventListener("submit", function (e) {
        e.preventDefault();
        say(etat, "");
        /* LE CHAMP N'EST PLUS `required`, DONC `validate()` NE PEUT  D-405 */
        var adresse = champ.value.trim();
        var champBoite = champ.closest(".field");
        var valide = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adresse);
        if (!valide) {
          if (champBoite) markField(champBoite, false);
          say(etat, adresse
            ? "Cette adresse ne semble pas valide. Les deux guides restent téléchargeables juste au-dessus."
            : "Entrez une adresse pour recevoir la copie. Les deux guides sont déjà téléchargeables juste au-dessus.", "err");
          champ.focus();
          return;
        }
        if (champBoite) markField(champBoite, true);
        if (bouton) setLoading(bouton, true, "Envoi en cours…");

        /* CE QUI PART VERS LE VISITEUR, ET CE QUI N'EST PAS POSSIBLE.  D-406 */
        var lien1 = new URL("documents/aped-automatisation.pdf", location.href).href;
        var lien2 = new URL("documents/aped-ia-croissance.pdf", location.href).href;
        var reponse = [
          "Merci — voici vos deux guides.",
          "",
          "1. Ce que votre entreprise pourrait automatiser (42 pages)",
          "   " + lien1,
          "",
          "2. Comment utiliser l'IA pour faire grossir votre entreprise (49 pages)",
          "   " + lien2,
          "",
          "Ils sont a vous, meme si vous ne nous engagez jamais.",
          "Une question ? Repondez simplement a ce courriel.",
          "",
          "APED Agence — Quebec",
          CONTACT_EMAIL
        ].join("\n");

        sendJson("cadeau", {
          email: adresse,
          documents: "Automatisation (42 p.) + IA et croissance (49 p.)",
          origine: "Popup cadeau",
          lien_automatisation: lien1,
          lien_ia: lien2,
          _autoresponse: reponse
        }).then(function () {
          say(etat, "C’est parti vers " + adresse + ". Les deux guides sont aussi téléchargeables ici, tout de suite.", "ok");
        }).catch(function () {
          /* L'envoi a echoue : le cadeau, lui, ne peut pas echouer.
             On le remet sur place et on le dit sans jargon. */
          say(etat, "L’envoi par courriel n’a pas passé. Vos deux guides sont téléchargeables ici, tout de suite.", "err");
        }).then(function () {
          form.reset();
          if (bouton) setLoading(bouton, false);
          remettre();
        });
      });
    })();

    if (vu) return;

    /* LES DEUX COUVERTURES SONT CHARGEES A L'AVANCE, mais PAS au  D-407 */
    window.setTimeout(function () {
      $$(".cadeau-couv", boite).forEach(function (img) {
        var pre = new Image();
        pre.decoding = "async";
        pre.src = img.getAttribute("src");
      });
    }, Math.max(0, PLANCHER - 1500));

    /* --- 1. PRINCIPAL : 11 s, a chaque chargement --- */
    window.setTimeout(function () { ouvrir(0); }, PRINCIPAL);

    /* --- 2. ANTICIPE : trois signaux d'engagement fort --- */
    /* a) le resultat du calculateur consulte. On laisse le chiffre
          s'installer avant d'interrompre : 2,2 s. */
    $$("#calculateur input[type='range'], #calculateur button").forEach(function (c) {
      c.addEventListener("change", function () { derniereAction = performance.now(); }, { passive: true });
      c.addEventListener("input", function () { derniereAction = performance.now(); }, { passive: true });
    });
    var regle = false;
    $$("#calculateur input[type='range']").forEach(function (c) {
      c.addEventListener("change", function () {
        derniereAction = performance.now();
        if (regle || vu) return;
        regle = true;
        window.setTimeout(function () { ouvrir(0); }, 2200);
      });
    });

    /* b) la visite 360 ouverte. */
    var tour = $("[data-tour-start]");
    if (tour) {
      tour.addEventListener("click", function () {
        /* Il vient d'entrer dans la demonstration : on le laisse
           regarder six secondes avant de dire quoi que ce soit. */
        window.setTimeout(function () { ouvrir(0); }, 6000);
      });
    }

    /* c) la section Projets atteinte. */
    var projets = doc.getElementById("realisations");
    if (projets && "IntersectionObserver" in window) {
      var obsP = new IntersectionObserver(function (entrees) {
        entrees.forEach(function (e) {
          if (!e.isIntersecting) return;
          obsP.disconnect();
          ouvrir(0);
        });
      }, { rootMargin: "-30% 0px -30% 0px", threshold: 0 });
      obsP.observe(projets);
    }

    /* --- 3. DERNIER RECOURS : l'intention de sortie, souris
           seulement, et seulement si rien n'a paru. --- */
    window.setTimeout(function () {
      if (vu || paru) return;
      if (!window.matchMedia("(pointer: fine)").matches) return;
      doc.addEventListener("mouseleave", function (e) {
        if (e.clientY <= 0) ouvrir(0);
      });
    }, SORTIE);
  })();

  /* == Theme. Le basculement est anime, mais jamais au chargement. == */
  var themeToggle = $("#themeToggle");

  function labelTheme(next) {
    if (!themeToggle) return;
    themeToggle.setAttribute("aria-label", next === "dark" ? "Basculer en thème clair" : "Basculer en thème sombre");
  }
  labelTheme(root.getAttribute("data-theme"));

  // La barre du navigateur doit suivre la bascule manuelle. Avec des
  // balises `theme-color` en `media`, elle restait sur la preference
  // systeme et contredisait la page.
  var metaThemeColor = $("#metaThemeColor");

  function applyTheme(next) {
    root.classList.add("theme-shifting");
    root.setAttribute("data-theme", next);
    labelTheme(next);
    if (metaThemeColor) metaThemeColor.setAttribute("content", next === "dark" ? "#101211" : "#dcdedb");
    try { localStorage.setItem("aped-theme", next); } catch (e) {}
    window.setTimeout(function () { root.classList.remove("theme-shifting"); }, 560);
    /* Tout ce qui peint hors CSS doit etre prevenu. Le canvas du hero  D-408 */
    doc.dispatchEvent(new CustomEvent("aped:theme", { detail: { theme: next } }));
  }

  /* Le theme systeme peut changer PENDANT la visite (coucher de  D-409 */
  (function suivreSysteme() {
    var mq = window.matchMedia("(prefers-color-scheme: dark)");
    var choisi = null;
    try { choisi = localStorage.getItem("aped-theme"); } catch (e) {}
    if (choisi) return;
    var onChange = function (e) {
      var encoreLibre = null;
      try { encoreLibre = localStorage.getItem("aped-theme"); } catch (err) {}
      if (encoreLibre) return;
      var next = e.matches ? "dark" : "light";
      root.classList.add("theme-shifting");
      root.setAttribute("data-theme", next);
      labelTheme(next);
      if (metaThemeColor) metaThemeColor.setAttribute("content", next === "dark" ? "#101211" : "#dcdedb");
      window.setTimeout(function () { root.classList.remove("theme-shifting"); }, 560);
      doc.dispatchEvent(new CustomEvent("aped:theme", { detail: { theme: next } }));
    };
    if (mq.addEventListener) mq.addEventListener("change", onChange);
    else if (mq.addListener) mq.addListener(onChange);
  })();

  /* PHASE 10 — LA BASCULE PASSE PAR UNE TRAME, PLUS PAR UN FONDU.  D-410 */
  function couleurSurface(theme) {
    return theme === "dark" ? "#101211" : "#dcdedb";
  }

  function basculerTheme(next) {
    var trame = window.APED_TRAME;
    if (!trame || reduced.matches) { applyTheme(next); return; }

    /* La cible est l'element racine : `trame.js` sait que la boite
       d'une racine est la FENETRE, pas les trente mille pixels du
       document. */
    var scene = doc.documentElement;
    var teinte = couleurSurface(next);

    trame.couvrir(scene, {
      nom: "theme-couvre", sens: "droite", graine: 613, maille: 56, z: 2147483000,
      couleur: teinte, duree: 220, vie: 120,
      onFin: function () {
        applyTheme(next);
        trame.degager(scene, {
          nom: "theme-degage", sens: "droite", graine: 613, maille: 56, z: 2147483000,
          couleur: teinte, duree: 260, vie: 140
        });
      }
    });
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      basculerTheme(root.getAttribute("data-theme") === "dark" ? "light" : "dark");
    });
  }

  /* == Menu plein ecran == */
  var burger = $("#burger");
  var menu = $("#menu");

  function closeMenu() {
    if (!menu || menu.hidden) return;
    menu.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-label", "Ouvrir le menu");
    /* La fermeture est la RECIPROQUE : l'arete repasse par ou elle  D-411 */
    if (window.APED_TRAME && !reduced.matches) {
      window.APED_TRAME.couvrir(menu, {
        nom: "menu-ferme", sens: window.APED_TRAME.inverse("bas"), graine: 331,
        duree: 300, vie: 150, maille: 52, z: 2147483000
      });
    }
    window.setTimeout(function () { menu.hidden = true; }, reduced.matches ? 0 : 380);
    if (!activeModal) unlockScroll();
    // Le focus revient sur le bourgeon, jamais sur le body.
    if (!activeModal && burger.offsetParent !== null) burger.focus({ preventScroll: true });
  }

  function openMenu() {
    if (!menu) return;
    menu.hidden = false;
    lockScroll();
    requestAnimationFrame(function () { menu.classList.add("is-open"); });
    burger.setAttribute("aria-expanded", "true");
    burger.setAttribute("aria-label", "Fermer le menu");
    /* PHASE 10 — le menu est un PANNEAU : il se lit de haut en bas,  D-412 */
    if (window.APED_TRAME && !reduced.matches) {
      window.APED_TRAME.degager(menu, {
        nom: "menu-ouvre", sens: "bas", graine: 331, duree: 340, vie: 170,
        maille: 52, z: 2147483000
      });
    }
    // Le menu est un calque plein ecran : le focus doit y entrer, sinon la
    // premiere tabulation part dans le contenu couvert derriere.
    var first = focusablesIn(menu)[0];
    if (first) window.setTimeout(function () { first.focus({ preventScroll: true }); }, 60);
  }

  if (burger && menu) {
    burger.addEventListener("click", function () {
      if (menu.hidden) openMenu(); else closeMenu();
    });
    $$("a, button", menu).forEach(function (el) {
      el.addEventListener("click", closeMenu);
    });
    // La signature est une destination comme les autres : elle referme.
    var wordmark = $(".nav .wordmark");
    if (wordmark) wordmark.addEventListener("click", closeMenu);
  }

  /* == PHASE 10 — LE PANNEAU « AJUSTER EN DETAIL », ET LES AUTRES ==  D-413 */
  $$("details.roi-details").forEach(function (repli) {
    repli.addEventListener("toggle", function () {
      if (!repli.open || !window.APED_TRAME || reduced.matches) return;
      /* La cible est le CONTENU, pas le `<details>` entier : degager
         le tout recouvrirait le resume, donc le bouton que le
         visiteur vient de cliquer. */
      var contenu = repli.querySelector("summary") ? repli.querySelector("summary").nextElementSibling : null;
      if (!contenu) return;
      window.APED_TRAME.degager(contenu, {
        nom: "repli-" + (repli.id || "detail"), sens: "bas", graine: 449,
        duree: 320, vie: 160, maille: 36, z: 3
      });
    });
  });

  /* == Verrou de defilement. La largeur de la barre est compensee, ==  D-414 */
  var scrollLocks = 0;

  function lockScroll() {
    scrollLocks++;
    if (scrollLocks > 1) return;
    var gap = window.innerWidth - doc.documentElement.clientWidth;
    doc.body.style.overflow = "hidden";
    if (gap > 0) doc.body.style.paddingRight = gap + "px";
  }

  function unlockScroll() {
    scrollLocks = Math.max(0, scrollLocks - 1);
    if (scrollLocks > 0) return;
    doc.body.style.overflow = "";
    doc.body.style.paddingRight = "";
  }

  /* == Modales : piege de focus, retour au declencheur, Echap. == */
  var activeModal = null;
  var lastTrigger = null;

  var FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])';

  function focusablesIn(scope) {
    return $$(FOCUSABLE, scope).filter(function (el) {
      return el.offsetParent !== null || el === doc.activeElement;
    });
  }

  /* Deux calques peuvent capturer le focus : une modale, et le menu plein  D-415 */
  function trapList() {
    if (activeModal) return focusablesIn(activeModal);
    /* La fiche de service est un calque au meme titre qu'une  D-416 */
    if (ficheOuverte) return focusablesIn(ficheOuverte);
    if (menu && !menu.hidden) {
      var nav = $(".nav");
      return (nav ? focusablesIn(nav) : []).concat(focusablesIn(menu));
    }
    return null;
  }

  function trapFocus(e) {
    if (e.key !== "Tab") return;
    var list = trapList();
    if (!list || !list.length) return;
    var first = list[0];
    var last = list[list.length - 1];
    if (e.shiftKey && doc.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && doc.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  function openModal(id, keepTrigger) {
    var modal = doc.getElementById(id);
    if (!modal) return;
    if (!keepTrigger) lastTrigger = doc.activeElement;
    activeModal = modal;
    modal.hidden = false;
    lockScroll();
    requestAnimationFrame(function () {
      modal.classList.add("is-open");
      /* PHASE 8 · V1 — le panneau se DEGAGE du haut sous une arete  D-417 */
      var panneau = modal.querySelector(".modal-panel");
      if (panneau) doc.dispatchEvent(new CustomEvent("aped:modal", { detail: { panneau: panneau } }));
    });

    if (id === "modal-estimate") resetEstimate();
    if (id === "modal-project") resetProject();
    if (id === "modal-booking") resetBooking();

    var target = focusablesIn(modal)[0];
    if (target) window.setTimeout(function () { target.focus({ preventScroll: true }); }, 60);
  }

  /* Le declencheur peut avoir disparu entre-temps : une modale ouverte
     depuis le menu plein ecran voit son bouton passer en display:none
     quand le menu se referme. Sans repli, le focus tombe sur le body. */
  function restoreFocus() {
    var el = lastTrigger;
    lastTrigger = null;
    if (el && doc.contains(el) && el.offsetParent !== null) {
      el.focus({ preventScroll: true });
      return;
    }
    var fallbacks = [$("#burger"), $(".nav .nav-cta"), $(".wordmark")];
    for (var i = 0; i < fallbacks.length; i++) {
      if (fallbacks[i] && fallbacks[i].offsetParent !== null) {
        fallbacks[i].focus({ preventScroll: true });
        return;
      }
    }
  }

  function closeModal() {
    if (!activeModal) return;
    var modal = activeModal;
    modal.classList.remove("is-open");
    activeModal = null;
    unlockScroll();
    /* PHASE 8 · V1 — le panneau se referme par ou il s'est ouvert.  D-418 */
    var sortant = modal.querySelector(".modal-panel");
    if (sortant && !reduced.matches) {
      doc.dispatchEvent(new CustomEvent("aped:modal-ferme", { detail: { panneau: sortant } }));
    }
    window.setTimeout(function () { modal.hidden = true; }, reduced.matches ? 0 : 380);
    restoreFocus();
  }

  function switchModal(id) {
    if (activeModal) {
      activeModal.classList.remove("is-open");
      activeModal.hidden = true;
      activeModal = null;
      unlockScroll();
    }
    openModal(id, true);
  }

  doc.addEventListener("click", function (e) {
    var open = e.target.closest("[data-modal-open]");
    if (open) { openModal(open.getAttribute("data-modal-open")); return; }
    var swap = e.target.closest("[data-modal-switch]");
    if (swap) { switchModal(swap.getAttribute("data-modal-switch")); return; }
    var close = e.target.closest("[data-modal-close]");
    if (close) { closeModal(); }
  });

  doc.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      if (activeModal) closeModal();
      /* La fiche vient AVANT le menu et APRES la modale : une
         modale peut s'ouvrir depuis la fiche (« Démarrer ce
         chantier »), donc c'est elle qui doit partir la premiere. */
      else if (ficheOuverte) fermerFiche();
      else closeMenu();
      return;
    }
    trapFocus(e);
  });

  /* == Validation. Le focus se pose sur le premier champ en erreur, ==  D-419 */
  function markField(field, ok) {
    /* PHASE 8 · V3 — LA SOUDURE NE SE VOIT QUE SUR CE QUI VIENT  D-420 */
    if (ok && field.classList.contains("is-invalid")) {
      field.classList.add("is-valid");
      window.setTimeout(function () { field.classList.remove("is-valid"); }, 2400);
    }
    field.classList.toggle("is-invalid", !ok);
    var input = $("input, select, textarea", field);
    if (input) {
      if (ok) input.removeAttribute("aria-invalid");
      else input.setAttribute("aria-invalid", "true");
    }
    var err = $(".field-error", field);
    if (err && !err.id) err.id = "err-" + Math.random().toString(36).slice(2, 8);
    if (input && err) {
      if (ok) input.removeAttribute("aria-describedby");
      else input.setAttribute("aria-describedby", err.id);
    }
  }

  function validate(scope) {
    var firstBad = null;
    $$(".field", scope).forEach(function (field) {
      if (field.hidden || field.closest("[hidden]")) return;
      var checks = $$('input[type="checkbox"]', field);
      if (checks.length) {
        var anyChecked = checks.some(function (c) { return c.checked; });
        markField(field, anyChecked);
        if (!anyChecked && !firstBad) firstBad = checks[0];
        return;
      }
      var input = $("input, select, textarea", field);
      if (!input) return;
      if (!input.required) { markField(field, true); return; }
      var ok = String(input.value).trim().length > 0;
      if (ok && input.type === "email") {
        ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim());
      }
      markField(field, ok);
      if (!ok && !firstBad) firstBad = input;
    });
    if (firstBad) firstBad.focus({ preventScroll: false });
    return !firstBad;
  }

  /* == Envoi == */
  function serialize(form) {
    var data = {};
    new FormData(form).forEach(function (value, key) {
      if (value instanceof File) return;
      data[key] = data[key] ? data[key] + ", " + value : value;
    });
    return data;
  }

  /* UN 200 N'EST PAS UN ENVOI. C'est un vrai defaut, trouve le  D-421 */
  function lireReponse(res) {
    if (!res.ok) throw new Error("Le service d'envoi a répondu " + res.status + ".");
    return res.json().then(function (data) {
      /* Le champ vaut la CHAINE "false", pas le booleen. Un test
         laxiste laisserait passer exactement le cas qu'on corrige. */
      var ok = data && (data.success === true || data.success === "true");
      if (!ok) {
        var e = new Error((data && data.message) || "Envoi refusé par le service.");
        e.duService = true;
        throw e;
      }
      return data;
    });
  }

  function sendJson(kind, data) {
    var payload = Object.assign({}, data, {
      _subject: SUBJECTS[kind] || "Message - site APED",
      _template: "table",
      _captcha: "false"
    });
    return fetch(FORM_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload)
    }).then(lireReponse);
  }

  function sendMultipart(kind, formData) {
    formData.append("_subject", SUBJECTS[kind] || "Message - site APED");
    formData.append("_template", "table");
    formData.append("_captcha", "false");
    return fetch(FORM_ENDPOINT, {
      method: "POST",
      headers: { Accept: "application/json" },
      body: formData
    }).then(lireReponse);
  }

  /* Le bouton reste actif jusqu'au depart de la requete, puis
     affiche une barre indeterminee. */
  function setLoading(btn, on, text) {
    var label = $("[data-label]", btn);
    if (!btn.dataset.idle && label) btn.dataset.idle = label.textContent;
    btn.classList.toggle("is-loading", on);
    btn.disabled = on;
    if (label) label.textContent = on ? (text || "Envoi en cours…") : btn.dataset.idle;
  }

  function say(status, message, kind) {
    if (!status) return;
    status.className = "form-status" + (kind ? " is-" + kind : "");
    status.textContent = message;
  }

  /* == LE REPLI QUI LIVRE VRAIMENT — corrige le risque de veracite le ==  D-422 */

  /* Les navigateurs et les clients de courriel se coupent quelque  D-423 */
  var REPLI_MAX = 1600;

  function corpsCourriel(data, avecFichiers) {
    var lignes = [];
    Object.keys(data).forEach(function (cle) {
      /* Les cles de service du formulaire — `_subject`, `_template`,
         `_captcha`, `_autoresponse` — n'ont aucun sens pour un
         humain qui relit son propre message. */
      if (cle.charAt(0) === "_") return;
      var v = data[cle];
      if (v === null || v === undefined || String(v).trim() === "") return;
      lignes.push(cle.replace(/_/g, " ") + " : " + String(v));
    });
    var corps = lignes.join("\n");
    if (corps.length > REPLI_MAX) {
      corps = corps.slice(0, REPLI_MAX) + "\n\n[La suite a été coupée par la longueur maximale d’un courriel préparé. Ajoutez ce qui manque avant d’envoyer.]";
    }
    if (avecFichiers) {
      corps += "\n\nVos fichiers ne peuvent pas voyager par ce chemin : joignez-les au message avant de l’envoyer.";
    }
    return corps;
  }

  function lienRepli(kind, data, avecFichiers) {
    return "mailto:" + CONTACT_EMAIL +
      "?subject=" + encodeURIComponent(SUBJECTS[kind] || "Message - site APED") +
      "&body=" + encodeURIComponent(corpsCourriel(data, avecFichiers));
  }

  /* Pose le repli JUSTE APRES le message d'etat, dans le meme parent,  D-424 */
  function poserRepli(status, kind, data, avecFichiers) {
    if (!status || !status.parentNode) return;
    var hote = status.parentNode;
    var ancien = hote.querySelector("[data-repli]");
    if (ancien) hote.removeChild(ancien);

    var boite = doc.createElement("p");
    boite.className = "form-repli";
    boite.setAttribute("data-repli", "");

    var lien = doc.createElement("a");
    lien.className = "btn btn--primary";
    lien.href = lienRepli(kind, data, avecFichiers);
    lien.textContent = "Ouvrir mon courriel, message déjà écrit";

    var note = doc.createElement("small");
    note.textContent = "Tout ce que vous avez rempli est déjà dans le message. Il ne reste qu’à l’envoyer.";

    boite.appendChild(lien);
    boite.appendChild(note);
    hote.insertBefore(boite, status.nextSibling);
    lien.focus();
  }

  /* Un nouvel essai efface le repli du precedent : laisser un bouton
     « l'envoi a echoue » sous un formulaire qui vient de reussir
     serait exactement le genre de contradiction qu'on corrige. */
  function retirerRepli(status) {
    if (!status || !status.parentNode) return;
    var ancien = status.parentNode.querySelector("[data-repli]");
    if (ancien) ancien.parentNode.removeChild(ancien);
  }

  /* Formulaires simples : urgence et reference */
  $$('form[data-form="urgent"], form[data-form="refer"]').forEach(function (form) {
    var kind = form.getAttribute("data-form");
    var btn = $("[data-submit]", form);
    var status = $(".form-status", form);

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validate(form)) { say(status, "Vérifiez les champs signalés puis renvoyez.", "err"); return; }
      setLoading(btn, true);
      say(status, "");
      retirerRepli(status);
      var contenu = serialize(form);
      sendJson(kind, contenu).then(function () {
        setLoading(btn, false);
        say(status, "Reçu. On vous répond très vite.", "ok");
        form.reset();
        window.setTimeout(function () { closeModal(); say(status, ""); }, 2200);
      }).catch(function () {
        setLoading(btn, false);
        say(status, "L’envoi automatique n’a pas passé. Votre message n’est pas perdu — envoyez-le d’ici :", "err");
        poserRepli(status, kind, contenu);
      });
    });
  });

  /* == Calendrier == */
  var calMonth = $("#calMonth");
  var calDays = $("#calDays");
  var calPrev = $("#calPrev");
  var calNext = $("#calNext");
  var slotsTitle = $("#slotsTitle");
  var slotsList = $("#slotsList");
  var slotsEmpty = $("#slotsEmpty");
  var bookingModal = $("#modal-booking");

  var selectedDate = null;
  var selectedSlotLabel = "";

  function startOfDay(d) { var x = new Date(d); x.setHours(0, 0, 0, 0); return x; }
  function minDate() { return startOfDay(new Date(Date.now() + BOOKING.minNoticeHours * 3600 * 1000)); }
  function maxDate() { return startOfDay(new Date(Date.now() + BOOKING.horizonDays * 24 * 3600 * 1000)); }

  /* == LE CALENDRIER OUVRE SUR LE PREMIER JOUR RESERVABLE.  D-622
     Il ouvrait sur le MOIS COURANT. Un 31 du mois, avec un preavis
     de 24 h, il ne reste aucune date ouverte dans ce mois-la : le
     visiteur voyait quarante et un jours GRISES, sans un mot pour
     lui dire d'aller au mois suivant. Releve le 2026-07-31 par
     `formulaires-e2e.mjs`, qui a cherche une plage libre sur dix
     jours et n'en a trouve aucune.
     On ouvre donc sur le mois du premier jour ouvrable — la fleche
     « precedent » se desactive d'elle-meme, rien d'autre a changer. */
  function premierJourOuvrable() {
    var d = minDate();
    var fin = maxDate();
    for (var i = 0; i < 60 && d <= fin; i++) {
      if (BOOKING.businessDays.indexOf(d.getDay()) !== -1) return d;
      d = new Date(d.getTime() + 86400000);
    }
    return minDate();
  }

  var calView = premierJourOuvrable();
  function slotLabel(slot) { var p = slot.split(":"); return p[0] + " h " + p[1]; }

  function goBStep(n) {
    if (!bookingModal) return;
    $$(".step[data-bstep]", bookingModal).forEach(function (s) {
      s.hidden = Number(s.dataset.bstep) !== n;
    });
  }

  function renderCalendar() {
    if (!calDays) return;
    var y = calView.getFullYear();
    var m = calView.getMonth();
    calMonth.textContent = calView.toLocaleDateString("fr-CA", { month: "long", year: "numeric" });

    var firstDay = new Date(y, m, 1).getDay();
    var count = new Date(y, m + 1, 0).getDate();
    var lo = minDate();
    var hi = maxDate();
    var today = startOfDay(new Date());

    calDays.innerHTML = "";
    for (var i = 0; i < firstDay; i++) {
      var blank = doc.createElement("span");
      blank.className = "cal-day is-blank";
      blank.setAttribute("aria-hidden", "true");
      calDays.appendChild(blank);
    }
    for (var d = 1; d <= count; d++) {
      (function (day) {
        var date = new Date(y, m, day);
        var btn = doc.createElement("button");
        btn.type = "button";
        btn.className = "cal-day";
        btn.textContent = day;
        btn.setAttribute("aria-label", date.toLocaleDateString("fr-CA", { weekday: "long", day: "numeric", month: "long" }));
        var open = BOOKING.businessDays.indexOf(date.getDay()) !== -1 && date >= lo && date <= hi;
        if (date.getTime() === today.getTime()) btn.classList.add("is-today");
        if (!open) {
          btn.disabled = true;
        } else {
          if (selectedDate && date.getTime() === selectedDate.getTime()) {
            btn.classList.add("is-on");
            btn.setAttribute("aria-pressed", "true");
          } else {
            btn.setAttribute("aria-pressed", "false");
          }
          btn.addEventListener("click", function () {
            selectedDate = date;
            renderCalendar();
            renderSlots();
          });
        }
        calDays.appendChild(btn);
      })(d);
    }

    /* La borne du « precedent » est le mois du premier jour
       RESERVABLE, pas le mois courant : remonter plus haut ne
       montrerait que des cases grisees.  D-622 */
    var viewStart = new Date(y, m, 1);
    var pj = premierJourOuvrable();
    var moisPlancher = new Date(pj.getFullYear(), pj.getMonth(), 1);
    calPrev.disabled = viewStart <= moisPlancher;
    calNext.disabled = new Date(y, m + 1, 1) > hi;
  }

  function renderSlots() {
    if (!slotsList) return;
    slotsList.innerHTML = "";
    if (!selectedDate) {
      slotsTitle.textContent = "Sélectionnez une date";
      slotsEmpty.hidden = true;
      return;
    }
    slotsTitle.textContent = selectedDate.toLocaleDateString("fr-CA", { weekday: "long", day: "numeric", month: "long" });
    var floor = new Date(Date.now() + BOOKING.minNoticeHours * 3600 * 1000);
    BOOKING.slots.forEach(function (slot) {
      var parts = slot.split(":");
      var when = new Date(selectedDate);
      when.setHours(Number(parts[0]), Number(parts[1]), 0, 0);
      if (when < floor) return;
      var btn = doc.createElement("button");
      btn.type = "button";
      btn.className = "slot";
      btn.textContent = slotLabel(slot);
      btn.addEventListener("click", function () {
        selectedSlotLabel = selectedDate.toLocaleDateString("fr-CA", {
          weekday: "long", day: "numeric", month: "long", year: "numeric"
        }) + " à " + slotLabel(slot);
        $("#bookingRecap").textContent = selectedSlotLabel;
        goBStep(2);
        var firstField = $('.step[data-bstep="2"] input', bookingModal);
        if (firstField) firstField.focus({ preventScroll: true });
      });
      slotsList.appendChild(btn);
    });
    slotsEmpty.hidden = slotsList.children.length > 0;
  }

  function resetBooking() {
    /* Et ICI aussi : c'est la remise a zero qui s'execute a chaque
       ouverture de la modale, donc c'est elle qui decide du mois
       affiche. La poser a `new Date()` ramenait le calendrier sur le
       mois courant — entierement grise un 31 du mois.  D-622 */
    calView = premierJourOuvrable();
    selectedDate = null;
    selectedSlotLabel = "";
    renderCalendar();
    renderSlots();
    goBStep(1);
    var form = $('form[data-form="booking"]', bookingModal);
    if (form) {
      form.reset();
      say($(".form-status", form), "");
      var btn = $("[data-submit]", form);
      if (btn) setLoading(btn, false);
      $$(".field.is-invalid", form).forEach(function (f) { markField(f, true); });
    }
  }

  if (calPrev && calNext) {
    calPrev.addEventListener("click", function () {
      calView = new Date(calView.getFullYear(), calView.getMonth() - 1, 1);
      renderCalendar();
    });
    calNext.addEventListener("click", function () {
      calView = new Date(calView.getFullYear(), calView.getMonth() + 1, 1);
      renderCalendar();
    });
  }
  var bookingChange = $("#bookingChange");
  if (bookingChange) bookingChange.addEventListener("click", function () { goBStep(1); });

  var bookingForm = $('form[data-form="booking"]');
  if (bookingForm) {
    bookingForm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validate(bookingForm)) { say($(".form-status", bookingForm), "Vérifiez les champs signalés.", "err"); return; }
      var btn = $("[data-submit]", bookingForm);
      var status = $(".form-status", bookingForm);
      setLoading(btn, true, "Réservation en cours…");
      say(status, "");
      retirerRepli(status);
      var data = serialize(bookingForm);
      data.plage_demandee = selectedSlotLabel;
      sendJson("booking", data).then(function () {
        setLoading(btn, false);
        goBStep(3);
      }).catch(function () {
        setLoading(btn, false);
        say(status, "L’envoi automatique n’a pas passé. Votre demande de plage n’est pas perdue — envoyez-la d’ici :", "err");
        poserRepli(status, "booking", data);
      });
    });
  }

  /* == Formulaire projet, 7 etapes == */
  var projectWizard = $("#projectWizard");
  var projectBar = $("#projectBar");
  var projectBack = $("#projectBack");
  var projectNext = $("#projectNext");
  var projectNav = $("#projectNav");
  var P_TOTAL = 7;
  var pStep = 1;
  var pickedFiles = [];
  var MAX_BYTES = 10 * 1024 * 1024;

  function goPStep(n) {
    pStep = n;
    $$(".step[data-pstep]", projectWizard).forEach(function (s) {
      s.hidden = Number(s.dataset.pstep) !== n;
    });
    var pct = (n / P_TOTAL) * 100;
    projectBar.style.width = pct + "%";
    var bar = projectBar.closest("[role='progressbar']");
    if (bar) bar.setAttribute("aria-valuenow", String(Math.round(pct)));
    projectBack.hidden = n === 1 || n === P_TOTAL;
    projectNav.hidden = n === P_TOTAL;
    var label = $("[data-label]", projectNext);
    label.textContent = n === 6 ? "Envoyer ma demande" : "Continuer";
    projectNext.dataset.idle = label.textContent;
    var visible = $('.step[data-pstep="' + n + '"]', projectWizard);
    if (visible) {
      var focusTarget = $("input:not([type=hidden]):not([type=file]), select, textarea, button", visible);
      if (focusTarget && isDesktop.matches) focusTarget.focus({ preventScroll: true });
    }
  }

  function renderFiles() {
    var list = $("#prFileList");
    var empty = $("#prFileEmpty");
    list.innerHTML = "";
    pickedFiles.forEach(function (file, i) {
      var li = doc.createElement("li");
      var name = doc.createElement("span");
      name.textContent = file.name + " (" + Math.round(file.size / 1024) + " Ko)";
      var del = doc.createElement("button");
      del.type = "button";
      del.className = "btn-icon";
      del.setAttribute("aria-label", "Retirer " + file.name);
      del.innerHTML = '<svg class="icon" aria-hidden="true"><use href="#i-trash" /></svg>';
      del.addEventListener("click", function () {
        pickedFiles.splice(i, 1);
        renderFiles();
      });
      li.appendChild(name);
      li.appendChild(del);
      list.appendChild(li);
    });
    if (empty) empty.hidden = pickedFiles.length > 0;
  }

  function addFiles(files) {
    var total = pickedFiles.reduce(function (s, f) { return s + f.size; }, 0);
    var refused = false;
    Array.prototype.slice.call(files).forEach(function (f) {
      if (total + f.size > MAX_BYTES) { refused = true; return; }
      total += f.size;
      pickedFiles.push(f);
    });
    renderFiles();
    if (refused) {
      var li = doc.createElement("li");
      li.className = "is-warn";
      li.textContent = "Limite de 10 Mo atteinte. Les fichiers en trop n’ont pas été ajoutés.";
      $("#prFileList").appendChild(li);
    }
  }

  function resetProject() {
    if (!projectWizard) return;
    projectWizard.reset();
    pickedFiles = [];
    renderFiles();
    $$(".choices button", projectWizard).forEach(function (b) {
      b.classList.remove("is-on");
      b.setAttribute("aria-pressed", "false");
    });
    var urlField = $("#prUrlField");
    if (urlField) urlField.hidden = true;
    $$(".field.is-invalid", projectWizard).forEach(function (f) { markField(f, true); });
    say($(".form-status", projectWizard), "");
    setLoading(projectNext, false);
    goPStep(1);
  }

  if (projectWizard) {
    $$(".choices", projectWizard).forEach(function (row) {
      var key = row.dataset.choice;
      var hidden = $('input[type="hidden"][name="' + key + '"]', projectWizard);
      $$("button", row).forEach(function (btn) {
        btn.setAttribute("aria-pressed", "false");
        btn.addEventListener("click", function () {
          $$("button", row).forEach(function (b) {
            b.classList.remove("is-on");
            b.setAttribute("aria-pressed", "false");
          });
          btn.classList.add("is-on");
          btn.setAttribute("aria-pressed", "true");
          hidden.value = btn.dataset.value;
          markField(hidden.closest(".field"), true);
          if (key === "site_existant") {
            $("#prUrlField").hidden = btn.dataset.value !== "Oui";
          }
        });
      });
    });

    var fileInput = $("#prFiles");
    var dropzone = $(".dropzone", projectWizard);
    fileInput.addEventListener("change", function () {
      addFiles(fileInput.files);
      fileInput.value = "";
    });
    ["dragover", "dragenter"].forEach(function (ev) {
      dropzone.addEventListener(ev, function (e) { e.preventDefault(); dropzone.classList.add("is-over"); });
    });
    ["dragleave", "drop"].forEach(function (ev) {
      dropzone.addEventListener(ev, function (e) {
        e.preventDefault();
        dropzone.classList.remove("is-over");
        if (ev === "drop" && e.dataTransfer) addFiles(e.dataTransfer.files);
      });
    });

    projectBack.addEventListener("click", function () { if (pStep > 1) goPStep(pStep - 1); });

    var advance = function () {
      var current = $('.step[data-pstep="' + pStep + '"]', projectWizard);
      if (!validate(current)) return;
      if (pStep < 6) { goPStep(pStep + 1); return; }

      var status = $(".form-status", projectWizard);
      setLoading(projectNext, true);
      say(status, "");
      retirerRepli(status);

      var fd = new FormData();
      var data = serialize(projectWizard);
      Object.keys(data).forEach(function (k) { fd.append(k, data[k]); });
      pickedFiles.forEach(function (f, i) { fd.append("fichier_" + (i + 1), f, f.name); });

      var done = function () { setLoading(projectNext, false); goPStep(7); };
      var attempt = pickedFiles.length ? sendMultipart("project", fd) : sendJson("project", data);

      attempt.then(done).catch(function () {
        // Deuxieme essai sans piece jointe : mieux vaut la demande sans
        // fichiers que pas de demande du tout.
        sendJson("project", data).then(done).catch(function () {
          setLoading(projectNext, false);
          say(status, "L’envoi automatique n’a pas passé. Vos sept étapes ne sont pas perdues — envoyez-les d’ici :", "err");
          poserRepli(status, "project", data, pickedFiles.length > 0);
        });
      });
    };

    projectNext.addEventListener("click", advance);
    projectWizard.addEventListener("submit", function (e) { e.preventDefault(); advance(); });
  }

  /* == Estimateur, 8 etapes == */
  var wizard = $("#wizard");
  var wizardBar = $("#wizardBar");
  var answers = {};
  var E_TOTAL = 8;

  function computeEstimate() {
    var score = (POIDS.type[answers.type] || 0)
      + (POIDS.envergure[answers.envergure] || 0)
      + (POIDS.design[answers.design] || 0)
      + (POIDS.delai[answers.delai] || 0);
    /* Dix points au maximum, cinq fourchettes : deux points par
       fourchette. Le seuil est volontairement large — c'est lui qui
       garantit que plusieurs profils partagent une meme reponse. */
    var i = Math.min(BAREME.length - 1, Math.floor(score / 2));
    var f = BAREME[i];
    return { low: f.bas, high: f.haut, surDevis: f.haut === null };
  }

  function goEStep(n) {
    if (!wizard) return;
    $$(".step[data-step]", wizard).forEach(function (s) {
      s.hidden = Number(s.dataset.step) !== n;
    });
    var pct = (n / E_TOTAL) * 100;
    wizardBar.style.width = pct + "%";
    var bar = wizardBar.closest("[role='progressbar']");
    if (bar) bar.setAttribute("aria-valuenow", String(Math.round(pct)));
    var visible = $('.step[data-step="' + n + '"]', wizard);
    if (visible && isDesktop.matches) {
      var t = $("button, input", visible);
      if (t) t.focus({ preventScroll: true });
    }
  }

  function resetEstimate() {
    Object.keys(answers).forEach(function (k) { delete answers[k]; });
    goEStep(1);
    var form = wizard ? $('form[data-form="estimate"]', wizard) : null;
    if (form) {
      form.reset();
      say($(".form-status", form), "");
      var btn = $("[data-submit]", form);
      if (btn) setLoading(btn, false);
      $$(".field.is-invalid", form).forEach(function (f) { markField(f, true); });
    }
  }

  if (wizard) {
    $$(".options[data-key]", wizard).forEach(function (group) {
      var key = group.dataset.key;
      $$("button", group).forEach(function (btn) {
        btn.addEventListener("click", function () {
          answers[key] = btn.dataset.value;
          goEStep(Number(group.closest(".step").dataset.step) + 1);
        });
      });
    });

    var estimateForm = $('form[data-form="estimate"]', wizard);
    if (estimateForm) {
      estimateForm.addEventListener("submit", function (e) {
        e.preventDefault();
        if (!validate(estimateForm)) return;
        var btn = $("[data-submit]", estimateForm);
        var status = $(".form-status", estimateForm);
        setLoading(btn, true, "Calcul en cours…");
        say(status, "");

        var result = computeEstimate();
        var payload = Object.assign({}, serialize(estimateForm), {
          type_de_projet: ANSWER_LABELS[answers.type] || "",
          domaine: ANSWER_LABELS[answers.industrie] || "",
          envergure: ANSWER_LABELS[answers.envergure] || "",
          niveau_design: ANSWER_LABELS[answers.design] || "",
          echeancier: ANSWER_LABELS[answers.delai] || "",
          site_existant: ANSWER_LABELS[answers.site_existant] || "",
          fourchette_estimee: result.surDevis
            ? "a partir de " + result.low.toLocaleString("fr-CA") + " $, sur devis"
            : result.low.toLocaleString("fr-CA") + " $ a " + result.high.toLocaleString("fr-CA") + " $"
        });

        var reveal = function () {
          setLoading(btn, false);
          goEStep(8);
          var lowEl = $("#priceLow");
          var highEl = $("#priceHigh");
          var suite = $("#priceSuite");
          var sLow = new Spring(function (v) { lowEl.textContent = Math.round(v).toLocaleString("fr-CA"); }, 90, 22);
          sLow.set(result.low);
          /* La derniere fourchette n'a pas de borne haute : les
             plateformes vont sur devis, et inventer un plafond
             serait un chiffre faux affiche avec aplomb. */
          if (result.surDevis) {
            if (suite) suite.textContent = "et plus, sur devis";
            highEl.hidden = true;
          } else {
            if (suite) suite.textContent = "$";
            highEl.hidden = false;
            var sHigh = new Spring(function (v) { highEl.textContent = Math.round(v).toLocaleString("fr-CA"); }, 90, 22);
            sHigh.set(result.high);
          }
        };

        /* L'ETAT DE SORTIE EST CELUI DE L'ETAPE 8, PAS CELUI DU  D-425 */
        var sortie = $("#estimateStatus") || status;
        retirerRepli(sortie);
        say(sortie, "");
        sendJson("estimate", payload).then(reveal).catch(function () {
          /* L'ORDRE COMPTE. On revele d'abord la fourchette — c'est ce  D-426 */
          reveal();
          say(sortie, "L’envoi automatique n’a pas passé. Envoyez-nous cette estimation d’ici pour qu’on vous rappelle.", "err");
          poserRepli(sortie, "estimate", payload);
        });
      });
    }
  }

  /* == Calculateur. Le montant alimente aussi l'index de gauche et ==  D-427 */
  var roiSection = $("#calculateur");

  if (roiSection) {
    var inEmp = $("#inEmp");
    var inRate = $("#inRate");
    var inRev = $("#inRev");
    var inAdmin = $("#inAdmin");
    var outEmp = $("#outEmp");
    var outRate = $("#outRate");
    var outRev = $("#outRev");
    var outAdmin = $("#outAdmin");
    var taskFields = $$(".roi-task", roiSection);

    /* LE CURSEUR MAITRE.  D-428 */
    function repartir(total) {
      var inputs = taskFields.map(function (f) { return $("input", f); });
      var vals = inputs.map(function (i) { return Number(i.value); });
      var somme = vals.reduce(function (a, b) { return a + b; }, 0);
      var poids = somme > 0 ? vals
        : taskFields.map(function (f) { return Number(f.dataset.share); });
      var sp = poids.reduce(function (a, b) { return a + b; }, 0) || 1;

      var exact = poids.map(function (p) { return (total * p) / sp; });
      var part = exact.map(function (v) { return Math.floor(v); });
      var reste = total - part.reduce(function (a, b) { return a + b; }, 0);

      /* Les unites restantes vont aux plus grandes parties
         fractionnaires, en sautant les taches deja a leur maximum. */
      var ordre = exact
        .map(function (v, i) { return { i: i, f: v - Math.floor(v) }; })
        .sort(function (a, b) { return b.f - a.f; });
      var tour = 0;
      while (reste > 0 && tour < ordre.length * 3) {
        var k = ordre[tour % ordre.length].i;
        if (part[k] < Number(inputs[k].max)) { part[k]++; reste--; }
        tour++;
      }

      inputs.forEach(function (input, i) {
        input.value = String(Math.min(Number(input.max), part[i]));
      });
    }

    var railValue = $("#railImpactValue");
    var navValue = $("#navImpactValue");
    var impactEl = $("#roiImpact");

    var PRESETS = {
      construction:  { emp: 8,  rate: 40, rev: 60000,  tasks: [5, 5, 4, 3, 3, 2, 6, 1] },
      services:      { emp: 5,  rate: 55, rev: 45000,  tasks: [4, 8, 4, 4, 4, 3, 4, 2] },
      restauration:  { emp: 12, rate: 22, rev: 70000,  tasks: [3, 4, 6, 3, 2, 5, 1, 4] },
      sante:         { emp: 4,  rate: 35, rev: 30000,  tasks: [3, 5, 8, 3, 2, 4, 1, 3] },
      commerce:      { emp: 6,  rate: 28, rev: 90000,  tasks: [4, 6, 3, 5, 3, 6, 2, 4] },
      manufacturier: { emp: 20, rate: 38, rev: 250000, tasks: [6, 5, 3, 6, 5, 3, 5, 1] },
      perso:         { emp: 5,  rate: 42, rev: 65000,  tasks: [4, 6, 3, 3, 2, 3, 3, 2] }
    };

    var lastRoi = {};

    var impactSpring = new Spring(function (v) {
      var text = fmtImpact(v);
      if (impactEl) impactEl.textContent = text;
      if (railValue) railValue.textContent = text;
      if (navValue) navValue.textContent = text;
    }, 90, 22);

    function roiUpdate(immediate, depuisMaitre) {
      var rate = Number(inRate.value);
      var rev = Number(inRev.value);
      outEmp.textContent = inEmp.value;
      outRate.textContent = rate.toLocaleString("fr-CA") + " $";
      outRev.textContent = rev.toLocaleString("fr-CA") + " $";

      var totalHours = 0;
      var saved = 0;
      var perTask = [];
      taskFields.forEach(function (field) {
        var input = $("input", field);
        var h = Number(input.value);
        var share = Number(field.dataset.share);
        $("output", field).textContent = fmtHours(h);
        totalHours += h;
        saved += h * share;
        perTask.push({ name: field.dataset.task, saved: h * share });
      });

      /* Le curseur maitre suit toujours la somme des huit taches,  D-429 */
      if (inAdmin && !depuisMaitre) inAdmin.value = String(Math.min(Number(inAdmin.max), Math.round(totalHours)));
      if (outAdmin) outAdmin.textContent = fmtHours(totalHours);

      /* B6 · DEUX POSTES RETIRES DU TOTAL LE 2026-07-29, ET LE  D-430 */
      var direct = saved * rate * 52;
      var impact = direct;
      var remaining = Math.max(0, totalHours - saved);

      impactSpring.set(impact, immediate);

      $("#roiWeekly").textContent = fmtHours(saved);
      $("#roiDays").textContent = Math.round((saved * 52) / 8).toLocaleString("fr-CA");
      $("#roiFte").textContent = (Math.round((saved / 40) * 10) / 10).toLocaleString("fr-CA");
      $("#roiDirect").textContent = fmtMoney(direct);

      $("#barManual").style.width = totalHours > 0 ? "100%" : "0%";
      $("#barAuto").style.width = totalHours > 0 ? (remaining / totalHours) * 100 + "%" : "0%";
      $("#barManualVal").textContent = fmtHours(totalHours) + " par semaine";
      $("#barAutoVal").textContent = fmtHours(remaining) + " par semaine";

      var top3 = perTask.filter(function (t) { return t.saved > 0; })
        .sort(function (a, b) { return b.saved - a.saved; })
        .slice(0, 3);
      var top3El = $("#roiTop3");
      var top3Empty = $("#roiTop3Empty");
      top3El.innerHTML = "";
      top3.forEach(function (t) {
        var li = doc.createElement("li");
        var name = doc.createElement("span");
        name.textContent = t.name;
        var val = doc.createElement("b");
        val.textContent = fmtHours(t.saved) + " par semaine";
        li.appendChild(name);
        li.appendChild(val);
        top3El.appendChild(li);
      });
      top3Empty.hidden = top3.length > 0;

      lastRoi = {
        employes: inEmp.value,
        taux_horaire: rate + " $",
        revenus_mensuels: rev.toLocaleString("fr-CA") + " $",
        heures_recuperees_semaine: fmtHours(saved),
        impact_annuel_total: fmtImpact(impact),
        economies_directes: fmtMoney(direct)
      };
    }

    var announce = $("#roiAnnounce");

    if (inAdmin) {
      inAdmin.addEventListener("input", function () {
        repartir(Number(inAdmin.value));
        roiUpdate(false, true);
      });
    }

    $$('input[type="range"]', roiSection).forEach(function (slider) {
      /* Le curseur maitre a son propre `input` juste au-dessus : il
         repartit avant de recalculer. Il garde en revanche le meme
         `change`, donc la meme annonce vocale que les autres. */
      if (slider !== inAdmin) {
        slider.addEventListener("input", function () { roiUpdate(false); });
      }
      // `change` = fin du geste. Un seul message par reglage.
      slider.addEventListener("change", function () {
        if (!announce) return;
        announce.textContent = "Impact annuel total " + lastRoi.impact_annuel_total +
          ", " + lastRoi.heures_recuperees_semaine + " récupérées par semaine.";
      });
    });

    var presets = $("#roiPresets");
    $$("button", presets).forEach(function (btn) {
      btn.addEventListener("click", function () {
        var preset = PRESETS[btn.dataset.preset];
        if (!preset) return;
        $$("button", presets).forEach(function (b) { b.setAttribute("aria-pressed", "false"); });
        btn.setAttribute("aria-pressed", "true");
        inEmp.value = preset.emp;
        inRate.value = preset.rate;
        inRev.value = preset.rev;
        taskFields.forEach(function (field, i) { $("input", field).value = preset.tasks[i]; });
        roiUpdate(false);
      });
    });

    var roiMailForm = $("#roiMailForm");
    roiMailForm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validate(roiMailForm)) return;
      var status = $(".form-status", roiMailForm);
      var sendBtn = $('button[type="submit"]', roiMailForm);
      // Ce bouton n'avait aucun etat : il restait actif pendant la requete,
      // donc cliquable deux fois, donc deux courriels.
      if (sendBtn && sendBtn.disabled) return;
      var release = function () {
        if (!sendBtn) return;
        sendBtn.disabled = false;
        sendBtn.classList.remove("is-loading");
      };
      if (sendBtn) {
        sendBtn.disabled = true;
        sendBtn.classList.add("is-loading");
      }
      var email = $("#roiEmail").value.trim();
      say(status, "Envoi en cours…");
      retirerRepli(status);
      /* L'ACCUSE NE CITE PLUS QUE CE QUI EXISTE ENCORE. Il enumerait  D-431 */
      var chargeRoi = Object.assign({ email: email }, lastRoi, {
        _autoresponse: "Voici votre calcul d'economies APED Agence. Impact annuel estime : " + lastRoi.impact_annuel_total +
          ". Heures recuperees par semaine : " + lastRoi.heures_recuperees_semaine +
          ". Le montant, c'est ces heures multipliees par le taux horaire que vous avez regle, sur 52 semaines : " +
          lastRoi.economies_directes +
          ". C'est un ordre de grandeur, pas une soumission." +
          " Envie de le confirmer? Reservez un appel gratuit sur notre site. - L'equipe APED"
      });
      sendJson("roi", chargeRoi).then(function () {
        release();
        say(status, "Envoyé. Vérifiez votre boîte de réception.", "ok");
        roiMailForm.reset();
      }).catch(function () {
        release();
        say(status, "L’envoi automatique n’a pas passé. Votre calcul n’est pas perdu — envoyez-le d’ici :", "err");
        poserRepli(status, "roi", chargeRoi);
      });
    });

    // Premier calcul immediat : le chiffre est deja la des la section 01.
    roiUpdate(true);
  }

  /* == Apercu des secteurs == */
  var preview = $("#sectorPreview");
  if (preview) {
    /* Les treize maquettes sont clonees depuis leur `<template>` une
       fois la page peinte. Le markup n'a donc coute ni style ni mise
       en page pendant le premier rendu. */
    var gabarit = $("#tplSecteurs");
    var scene = $("#mockStage");
    if (gabarit && scene && !scene.children.length) {
      scene.appendChild(gabarit.content.cloneNode(true));
    }

    var caption = $("#sectorCaption");
    var mocks = $$(".mock", preview);
    var pills = $$(".sector-pills button");

    var secteurCourant = null;
    var showSector = function (key) {
      if (!key) return;
      mocks.forEach(function (m) { m.classList.toggle("is-on", m.dataset.mock === key); });
      pills.forEach(function (p) {
        var on = p.dataset.sector === key;
        p.classList.toggle("is-on", on);
        if (on && p.dataset.caption) caption.textContent = p.dataset.caption;
      });
      /* PHASE 8 — LA RECOMPOSITION. Ce fichier ne connait pas GSAP  D-432 */
      if (key !== secteurCourant) {
        secteurCourant = key;
        doc.dispatchEvent(new CustomEvent("aped:secteur", { detail: { cle: key } }));
      }
    };

    /* Les treize pastilles pilotent l'apercu au survol ET au focus :
       la tabulation donne exactement la meme demonstration que la
       souris. */
    pills.forEach(function (pill) {
      var run = function () { showSector(pill.dataset.sector); };
      pill.addEventListener("mouseenter", run);
      pill.addEventListener("focus", run);
    });

    /* AU TACTILE IL N'Y A PAS DE SURVOL.  D-433 */
    var coarse = window.matchMedia("(pointer: coarse)");
    if (coarse.matches && !reduced.matches && "IntersectionObserver" in window) {
      var ordre = pills.map(function (p) { return p.dataset.sector; }).filter(Boolean);
      var idx = 0;
      var minuteur = 0;
      var fige = false;

      var suivant = function () {
        idx = (idx + 1) % ordre.length;
        showSector(ordre[idx]);
      };
      var demarrer = function () {
        if (fige || minuteur) return;
        minuteur = window.setInterval(suivant, 3600);
      };
      var arreter = function () {
        if (minuteur) { window.clearInterval(minuteur); minuteur = 0; }
      };

      pills.forEach(function (pill) {
        pill.addEventListener("pointerdown", function () {
          fige = true;
          arreter();
          showSector(pill.dataset.sector);
        }, { passive: true });
      });

      new IntersectionObserver(function (es) {
        if (es[0].isIntersecting) demarrer(); else arreter();
      }, { threshold: 0.25 }).observe(preview);

      doc.addEventListener("visibilitychange", function () {
        if (doc.hidden) arreter(); else if (!fige) demarrer();
      });
    }
  }

  /* == LE CRAN — V4 du langage de mouvement, et il vit ICI. ==  D-434 */
  function rouler(el, texte) {
    if (!el) return;
    texte = String(texte);
    if (el.dataset.cran === texte) return;

    if (reduced.matches) {
      el.dataset.cran = texte;
      el.textContent = texte;
      return;
    }

    var avant = el.dataset.cran;
    el.dataset.cran = texte;

    /* Premier passage : on pose la structure sans rien animer.
       Un compteur qui roule des l'arrivee raconte un changement
       qui n'a pas eu lieu. */
    if (avant === undefined) {
      el.classList.add("odo");
      el.textContent = "";
      for (var k = 0; k < texte.length; k++) el.appendChild(caseCran(texte[k]));
      return;
    }

    var cases = Array.prototype.slice.call(el.children);
    /* La longueur peut changer — « 9 sections restantes » devient
       « 10 ». On ajuste le nombre de boites AVANT de rouler, sinon
       le dernier caractere n'a nulle part ou aller. */
    while (cases.length < texte.length) {
      var neuve = caseCran(" ");
      el.appendChild(neuve);
      cases.push(neuve);
    }
    while (cases.length > texte.length) el.removeChild(cases.pop());

    for (var i = 0; i < texte.length; i++) {
      var boite = cases[i];
      /* La valeur COURANTE est celle du DERNIER glyphe, pas du
         premier : pendant un roulement la boite en contient deux,
         le fantome qui sort et la valeur qui arrive. */
      var actuel = boite.lastChild ? boite.lastChild.textContent : "";
      if (actuel === texte[i]) continue;
      rouleUn(boite, texte[i], i);
    }
  }

  /* Termine un roulement en cours, sur-le-champ.  D-435 */
  function finirRoulement(boite) {
    if (boite._t) { window.clearTimeout(boite._t); boite._t = 0; }
    boite.classList.remove("is-roule");
    boite.style.removeProperty("--r");
    while (boite.children.length > 1) boite.removeChild(boite.firstChild);
    var b = boite.firstChild;
    if (b) { b.classList.remove("is-entrant"); b.removeAttribute("data-c"); }
  }

  function caseCran(c) {
    var boite = doc.createElement("i");
    boite.className = "odo-c";
    var b = doc.createElement("b");
    b.textContent = c;
    boite.appendChild(b);
    return boite;
  }

  function rouleUn(boite, cible, rang) {
    finirRoulement(boite);
    var sortant = boite.firstChild;

    /* LE SORTANT DEVIENT UN FANTOME, ET C'EST UNE CORRECTION DE  D-436 */
    if (sortant) {
      sortant.setAttribute("data-c", sortant.textContent);
      sortant.textContent = "";
    }

    var entrant = doc.createElement("b");
    entrant.textContent = cible;
    entrant.className = "is-entrant";
    boite.appendChild(entrant);
    /* Le decalage par rang fait rouler les caracteres de gauche a  D-437 */
    boite.style.setProperty("--r", Math.min(rang, 6));
    /* Une image d'attente : sans elle, l'element entrant est ajoute
       et anime dans la meme image, donc le navigateur n'a pas d'etat
       de depart a interpoler et le roulement ne se voit pas. */
    requestAnimationFrame(function () {
      if (entrant.parentNode !== boite) return;
      boite.classList.add("is-roule");
      boite._t = window.setTimeout(function () {
        boite._t = 0;
        finirRoulement(boite);
      }, 320 + Math.min(rang, 6) * 34);
    });
  }

  window.APED_ROULER = rouler;

  /* == Index collant. IntersectionObserver, jamais d'ecouteur scroll. == */
  var railLinks = $$("#railList a");
  if (railLinks.length && "IntersectionObserver" in window) {
    var byId = {};
    railLinks.forEach(function (a) { byId[a.dataset.rail] = a; });

    var railLeftNum = $("#railLeftNum");
    var railLeft = $("#railLeft");
    var currentId = null;

    /* N1 · LE CURSEUR DU RAIL — PHASE 8.  D-438 */
    var railCurseur = doc.createElement("i");
    railCurseur.className = "rail-curseur";
    railCurseur.setAttribute("aria-hidden", "true");
    railCurseur.appendChild(doc.createElement("b"));
    var railList = $("#railList");
    if (railList) railList.appendChild(railCurseur);

    var setCurrent = function (id) {
      currentId = id;
      var idx = 0;
      var actif = null;
      railLinks.forEach(function (a, i) {
        var on = a.dataset.rail === id;
        a.setAttribute("aria-current", on ? "true" : "false");
        if (on) { idx = i; actif = a; }
      });
      if (actif && railList) {
        railCurseur.style.setProperty("--y", actif.offsetTop + "px");
        railCurseur.style.setProperty("--h", actif.offsetHeight + "px");
        railCurseur.classList.add("is-on");
      }
      /* Trois seuils vivent dans un SAS, hors de leur section : le  D-578
         reperage passe par data-vers, jamais par la parente. */
      var numDe = {};
      railLinks.forEach(function (a, i) {
        numDe[a.dataset.rail] = (i + 1 < 10 ? "0" : "") + (i + 1);
      });
      function seuilVers(idSec) {
        var sec2 = doc.getElementById(idSec);
        var dedans = sec2 && $("[data-seuil]", sec2);
        if (dedans) return dedans;
        var v = numDe[idSec];
        return v ? $('[data-seuil][data-vers="' + v + '"]') : null;
      }

      $$("section, .hero").forEach(function (s) {
        var propre = $("[data-section-rule]", s);
        if (!propre && s.id) {
          var sl = seuilVers(s.id);
          propre = sl && $("[data-section-rule]", sl);
        }
        if (propre) propre.classList.toggle("is-current", s.id === id);
      });

      /* G2 · LE CRAN DE LA FRONTIERE — V4, et il vit ICI, pas dans  D-439 */
      if (actif) {
        var seuil = seuilVers(id);
        if (seuil && seuil.getAttribute("data-cran") !== "fait" && !seuil._cran) {
          seuil._cran = true;
          seuil.setAttribute("data-cran", "pose");
          requestAnimationFrame(function () {
            requestAnimationFrame(function () { seuil.setAttribute("data-cran", "fait"); });
          });
        }
      }
      /* N1 · combien il en reste. Le nombre ROULE d'un cran : le
         changement se voit, donc l'avancee se voit. */
      var reste = railLinks.length - 1 - idx;
      rouler(railLeftNum, String(reste));
      if (railLeft) {
        railLeft.lastChild.textContent = reste === 0 ? " derniere section"
          : reste === 1 ? " section restante" : " sections restantes";
      }
    };

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) setCurrent(entry.target.id);
      });
    }, { rootMargin: "-45% 0px -45% 0px", threshold: 0 });

    Object.keys(byId).forEach(function (id) {
      var target = doc.getElementById(id);
      if (target) observer.observe(target);
    });

    /* N1 · progression de lecture, et progression DANS la section  D-440 */
    var readBar = $("#readBar");
    var ticking = false;

    var measure = function () {
      ticking = false;
      var de = doc.documentElement;
      var max = de.scrollHeight - window.innerHeight;
      var p = max > 0 ? (window.scrollY / max) * 100 : 0;
      if (readBar) readBar.style.setProperty("--read", p.toFixed(2) + "%");

      if (currentId) {
        var sec = doc.getElementById(currentId);
        var link = byId[currentId];
        if (sec && link) {
          /* Fraction de la section REELLEMENT parcourue.  D-441 */
          var r = sec.getBoundingClientRect();
          var haut = r.top + window.scrollY;
          var course = Math.max(1, sec.offsetHeight - window.innerHeight);
          var seen = Math.min(1, Math.max(0, (window.scrollY - haut) / course));
          link.style.setProperty("--sec-progress", (seen * 100).toFixed(1) + "%");
          /* Le curseur porte la meme fraction : c'est LUI qui la
             montre depuis la phase 8, l'entree ne la garde que pour
             le repli sans script. */
          railCurseur.style.setProperty("--sec-progress", (seen * 100).toFixed(1) + "%");
          /* Les autres entrees repartent a zero, sinon un filet reste
             rempli derriere nous. */
          railLinks.forEach(function (a) {
            if (a !== link) a.style.setProperty("--sec-progress", "0%");
          });
        }
      }
    };

    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(measure); }
    }, { passive: true });
    measure();
  }

  /* == VISER L'ANCRE — `content-visibility` fait mentir les arrivees ==  D-583 */
  /* Le navigateur saute vers une position calculee sur des hauteurs
     RESERVEES ; les vraies hauteurs arrivent en rendant, et la cible
     s'est deplacee. Defaut anterieur au chantier des sas, mesure a
     2 474 px d'ecart sur #visite. On re-mesure SUR PLACE, en petites
     iterations, et on abandonne des que le visiteur reprend la main. */
  (function viserLesAncres() {
    var mainReprise = false;
    ["wheel", "touchstart", "keydown"].forEach(function (g) {
      window.addEventListener(g, function () { mainReprise = true; }, { passive: true });
    });

    function viser(hash, essai) {
      if (mainReprise) return;
      var el = hash && hash.length > 1 && doc.getElementById(hash.slice(1));
      if (!el) return;
      var pad = parseFloat(getComputedStyle(doc.documentElement).scrollPaddingTop) || 0;
      var d = el.getBoundingClientRect().top - pad;
      if (Math.abs(d) < 2 || (essai || 0) > 6) return;
      window.scrollBy({ top: d, left: 0, behavior: "instant" });
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { viser(hash, (essai || 0) + 1); });
      });
    }

    /* Les ancres du rail des Services ont leur propre visee, au
       chargement comme au clic — la doubler l'a fait atterrir sur le
       mauvais chantier, 10 fois sur 10. */
    if (location.hash && location.hash.length > 1 &&
      location.hash.indexOf("#svc-") !== 0) {
      var re = function () { mainReprise = false; viser(location.hash, 0); };
      if (doc.readyState === "complete") setTimeout(re, 120);
      else window.addEventListener("load", function () { setTimeout(re, 120); }, { once: true });
      /* Une seconde passe : la cascade de rendu `content-visibility`
         peut encore deplacer la cible apres la premiere. */
      window.setTimeout(function () { viser(location.hash, 0); }, 900);
    }

    doc.addEventListener("click", function (e) {
      var a = e.target && e.target.closest && e.target.closest('a[href^="#"]');
      if (!a) return;
      var hash = a.getAttribute("href");
      /* Les ancres du rail des Services ont leur propre visee,
         prouvee 10/10 — on ne double pas un mecanisme qui marche. */
      if (!hash || hash === "#" || hash.indexOf("#svc-") === 0) return;
      mainReprise = false;
      var fait = false;
      var corriger = function () {
        if (fait) return;
        fait = true;
        viser(hash, 0);
      };
      /* Le defilement natif est doux (scroll-behavior: smooth) : on
         corrige a sa FIN, jamais pendant. */
      if ("onscrollend" in window) {
        window.addEventListener("scrollend", corriger, { once: true });
        window.setTimeout(corriger, 1100);
      } else {
        window.setTimeout(corriger, 750);
      }
    }, true);
  })();

  /* == LA DOUZIEME FRONTIERE — LA CLOTURE. ==  D-442 */
  (function cloture() {
    var seuil = $(".seuil--pied");
    if (!seuil || !("IntersectionObserver" in window)) return;
    var obs = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (e) {
        if (!e.isIntersecting || seuil._cran) return;
        seuil._cran = true;
        obs.disconnect();
        seuil.setAttribute("data-cran", "pose");
        requestAnimationFrame(function () {
          requestAnimationFrame(function () { seuil.setAttribute("data-cran", "fait"); });
        });
      });
    }, { rootMargin: "0px 0px -30% 0px", threshold: 0 });
    obs.observe(seuil);
  })();

})();

