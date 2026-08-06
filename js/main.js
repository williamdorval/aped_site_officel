/* == APED AGENCE - Logique ==  D-352 */

(function () {
  "use strict";

  /* == Constantes metier. == */

  /* L'ADRESSE PERSONNELLE EST PARTIE D'ICI.  D-719
     Elle etait la seule adresse reelle qui restait dans le site, et
     elle n'etait pas qu'« au fond du source » : elle sortait par
     l'adresse du service d'envoi, et surtout par le `mailto:` de
     repli qui s'affichait sous CHAQUE formulaire en echec.
     Le POURQUOI est dans `decisions/js-main.md`. */

  /* LE POINT DE SORTIE NE VIT PLUS DANS CE FICHIER.  D-720
     Il vient de `js/config.local.js`, qui n'est PAS suivi par git :
     `node tools/config-envoi.mjs` le fabrique a partir de
     `.env.local`. Trois raisons.

     1. Le depot est public. Une adresse de deploiement ecrite ici
        serait publiee, et n'importe qui pourrait arroser le
        classeur de l'agence.
     2. L'adresse change a chaque NOUVEAU deploiement. La sortir du
        code evite de recommiter le site pour un changement qui
        n'est pas du code.
     3. Absent, le fichier ne casse rien : l'injecteur avale son
        `onerror`, `FORM_ENDPOINT` reste vide, et `sansPoint()` rend
        l'echec franc qu'on avait deja. Un depot fraichement clone
        se comporte exactement comme avant ce chantier.

     CE N'EST PAS UN SECRET AU SENS FORT, ET IL NE FAUT PAS SE
     RACONTER LE CONTRAIRE : sur un site statique, tout ce que le
     navigateur appelle est lisible dans l'onglet reseau. Ce que la
     manoeuvre protege, c'est le depot public et l'historique — pas
     la requete. La vraie defense du service est ailleurs : le
     honeypot, la validation serveur, et le verrou d'Apps Script. */
  var FORM_ENDPOINT = (window.APED_ENVOI || "");

  /* LES DISPONIBILITES NE SE DECIDENT PLUS ICI.  D-726

     Ce bloc etait la SEULE source des plages offertes : une grille
     ecrite en dur, identique tous les jours, qui ne savait rien de
     l'agenda de l'agence. Elle affichait donc des heures deja
     prises, et le visiteur ne l'apprenait qu'apres avoir rempli tout
     le formulaire — au moment ou le service refusait.

     Les vraies plages viennent maintenant de la DEUXIEME PORTE du
     meme Apps Script : `?action=creneaux`. Elle calcule la grille a
     partir de `DISPONIBILITES` dans `Code.gs`, en retire tout ce que
     le calendrier d'apedagence occupe, et rend des heures DEJA
     ECRITES EN FRANCAIS, DEJA CALCULEES A TORONTO.

     CE QUI RESTE ICI N'EST PLUS UNE SOURCE, C'EST UN FILET. Quand la
     porte ne repond pas — deploiement pas encore fait, reseau coupe,
     quota Google — le calendrier montre quand meme la grille
     theorique, avec une phrase qui dit qu'elle n'est pas confirmee.
     C'est honnete : le serveur revalide de toute facon a la
     confirmation, et une plage prise entre-temps est refusee avec sa
     raison. Un calendrier vide, lui, ne dirait rien du tout.

     LES VALEURS DOIVENT SUIVRE CELLES DE `Code.gs`. Elles ne servent
     qu'au filet, mais un filet qui ment est pire qu'un filet
     absent. */
  var BOOKING = {
    businessDays: [1, 2, 3, 4, 5],
    slots: ["9:00", "9:45", "10:30", "11:15",
            "13:30", "14:15", "15:00", "15:45", "16:30"],
    minNoticeHours: 24,
    horizonDays: 42
  };

  var SUBJECTS = {
    project: "Nouveau projet - site APED",
    urgent: "URGENCE - site APED",
    refer: "Nouvelle reference - site APED",
    estimate: "Demande d'estimation - site APED",
    booking: "Demande de rendez-vous - site APED",
    contact: "Message - site APED",
    cadeau: "Documents demandes - site APED"
  };

  /* LE BAREME N'EXISTE PLUS.  D-353
     Cinq paliers, de 2 500 $ a 40 000 $ et plus, affiches a l'etape 8
     de l'estimateur : c'etait la grille tarifaire d'APED, publiee.
     Les seuls prix du site sont maintenant 75 $ l'heure, 40 % au
     demarrage, et le plafond de 5 000 $ du programme de reference.
     `POIDS` reste : il sert encore a ordonner les reponses, plus a
     choisir une fourchette. */

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
      /* LA MARGE DE FIN N'EST PAS CELLE DU TEXTE.  D-598 */
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
    /* LA ZONE MORTE PASSE DE 18 % A 10 %.  D-597 */
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

    /* == LE RATTRAPAGE — LE CORRECTIF DE « CA NE GLISSE PAS ».  D-599 */
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

    /* == OUVRIR LA VISITE DEPUIS LE PANNEAU 03.  D-607 */
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

        /* --- LE GLISSEMENT, ET IL EST EXPLICITE.  D-593 */
        var idPointeur = null;
        var pese = null;

        /* LA MOLETTE POSEE SUR LA PRISE DOIT DESCENDRE DANS LE CADRE, PAS DANS LA PAGE.  D-641 */
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

        /* --- LE VERROU EN POURCENTAGE --- D-645 Les deux cotes n'ont pas la meme…  D-645 */
        var piste = $("[data-ba-piste]", cadre);
        var pageAp = $(".ba-vue--apres .ba-page", cadre);
        var pageAv = $(".ba-vue--avant .ba-page", cadre);
        /* `data-ba-bande` = y · hauteur · course de la scene · course
           de la piste, tout en cqw. Une piste a une course non nulle :
           c'est ce qui distingue une bande CONTINUE (D-651) d'une
           bande rejouee en N vues (D-644, gardee en repli). */
        var bandes = $$(".ba-bande", cadre).map(function (el) {
          var d = (el.getAttribute("data-ba-bande") || "").split(/\s+/).map(Number);
          var coursePiste = d[3] || 0;
          return {
            el: el, y: d[0] || 0, h: d[1] || 0, course: d[2] || 0,
            continue: coursePiste > 0, coursePiste: coursePiste,
            n: Math.max(2, +(el.style.getPropertyValue("--ba-b-n") || 2))
          };
        });
        var segments = [];
        var courseTotale = 0;
        var hApres = 0;

        function mesurer() {
          var W = scene.clientWidth;
          if (!W) return;
          var enCqw = function (px) { return (px / W) * 100; };
          /* 100 cqw = la largeur du cadre.  D-648 */
          hApres = pageAp ? enCqw(pageAp.scrollHeight) : 0;
          var hAvant = pageAv ? enCqw(pageAv.scrollHeight) : 0;
          var fenetre = enCqw(scene.clientHeight);

          segments = [];
          var cur = 0;
          for (var b = 0; b < bandes.length; b++) {
            var bd = bandes[b];
            if (bd.y > cur) segments.push({ t: "f", de: cur, long: bd.y - cur });
            segments.push({ t: "b", de: bd.y, long: Math.max(bd.h, bd.course), bande: bd });
            cur = bd.y + bd.h;
          }
          var finFlux = Math.max(0, hApres - fenetre);
          if (cur < finFlux) segments.push({ t: "f", de: cur, long: finFlux - cur });

          courseTotale = 0;
          for (var s = 0; s < segments.length; s++) courseTotale += segments[s].long;
          /* La reconstitution ne doit pas etre plus courte que sa
             propre course, sinon elle s'arrete avant la fin de la
             piste : on prend la plus longue des deux. */
          scene.style.setProperty("--ba-h-avant", Math.max(0, hAvant - fenetre));
          piste.style.height = (scene.clientHeight + (courseTotale / 100) * W) + "px";
          rendre();
        }

        /* UNE BANDE SE POSE PAR SA FRACTION, PAS PAR UN INDICE.  D-651 */
        function poserBande(b, frac) {
          var f = Math.min(1, Math.max(0, frac));
          if (b.continue) b.el.style.setProperty("--ba-piste", f * b.coursePiste);
          else b.el.style.setProperty("--ba-bande-i", Math.round(f * (b.n - 1)));
        }

        function rendre() {
          if (!courseTotale) return;
          var maxDef = vitre.scrollHeight - vitre.clientHeight;
          var p = maxDef > 0 ? Math.min(1, Math.max(0, vitre.scrollTop / maxDef)) : 0;
          var d = p * courseTotale;
          var acc = 0;
          var yAp = 0;
          for (var s = 0; s < segments.length; s++) {
            var seg = segments[s];
            if (d <= acc + seg.long || s === segments.length - 1) {
              var dans = Math.min(seg.long, Math.max(0, d - acc));
              if (seg.t === "f") {
                yAp = seg.de + dans;
              } else {
                yAp = seg.de;
                poserBande(seg.bande, dans / seg.long);
              }
              break;
            }
            acc += seg.long;
            /* Une bande DEPASSEE reste posee sur son dernier etat :
               la transition est finie, elle ne se rembobine pas. */
            if (seg.t === "b") poserBande(seg.bande, 1);
          }
          /* Une bande PAS ENCORE ATTEINTE reste a son premier etat. */
          var vu = 0;
          for (var s2 = 0; s2 < segments.length; s2++) {
            if (segments[s2].t !== "b") { vu += segments[s2].long; continue; }
            if (d < vu) poserBande(segments[s2].bande, 0);
            vu += segments[s2].long;
          }
          if (pageAp) pageAp.style.setProperty("--ba-y", yAp);
          if (pageAv) {
            var hAv = parseFloat(scene.style.getPropertyValue("--ba-h-avant")) || 0;
            pageAv.style.setProperty("--ba-y", p * hAv);
          }
        }

        if (piste && vitre) {
          /* ON PEINT DANS L'EVENEMENT, PAS UNE IMAGE PLUS TARD.  D-654 */
          vitre.addEventListener("scroll", rendre, { passive: true });
          mesurer();
          if (window.ResizeObserver) new ResizeObserver(mesurer).observe(scene);
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
          /* AU DOIGT, ON NE PREND PAS LA MAIN TOUT DE SUITE : le D-594 meme geste peut…  D-594 */
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

    /* --- 2 · L'OEIL QUI ALLUMAIT LA BOUCLE EST RETIRE --- D-628 Il posait…  D-628 */

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
      /* UN SEUL CRAN ALLUME A LA FOIS. `k <= i` allumait toutes les
         stations franchies : a six etapes, ca faisait jusqu'a six
         nodules de minium en meme temps, et le minium ne designait
         plus rien. L'accent tombe sur l'etape EN COURS, une seule. */
      etapes.forEach(function (e, k) { e.classList.toggle("is-on", k === i); });
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

    /* LA MEMOIRE EST DE RETOUR, ET ELLE A UN SENS MAINTENANT.  D-401
       Elle avait ete abolie quand les guides etaient offerts sans
       contrepartie : reproposer un cadeau ne coute rien. Depuis que
       les coordonnees sont la CONDITION, redemander a quelqu'un qui a
       deja donne est une faute — on lui redemande ce qu'on a deja.
       Une seule cle, et elle ne contient rien de personnel : la date
       du don suffit a savoir qu'il a eu lieu. */
    var CLE_DONNE = "aped-guides-donnes";
    var deja = false;
    try { deja = !!localStorage.getItem(CLE_DONNE); } catch (e) {}

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

    /* --- LES DEUX GUIDES, ET CE QU'ILS COUTENT MAINTENANT. --- */
    var GUIDES = [
      { fichier: "documents/aped-automatisation.pdf", nom: "aped-ce-que-vous-pourriez-automatiser.pdf" },
      { fichier: "documents/aped-ia-croissance.pdf", nom: "aped-lia-pour-faire-grossir-votre-entreprise.pdf" }
    ];

    /* LE TELECHARGEMENT SE FAIT ICI, PAS PAR COURRIEL.  D-406
       L'ancienne version promettait un envoi par courriel, alors
       qu'aucun service d'envoi n'a jamais ete active : la promesse ne
       tenait pas. Un `<a download>` clique par le script telecharge
       tout de suite, sans reseau, sans promesse. */
    function telecharger() {
      GUIDES.forEach(function (g, i) {
        window.setTimeout(function () {
          var a = doc.createElement("a");
          a.href = g.fichier;
          a.download = g.nom;
          a.rel = "noopener";
          doc.body.appendChild(a);
          a.click();
          doc.body.removeChild(a);
        }, i * 350);   /* deux telechargements simultanes : le second est souvent ignore */
      });
    }

    var form = $("#cadeauForm");
    var suite = $(".cadeau-suite", boite);
    var dejaBloc = $(".cadeau-deja", boite);
    var fin = $(".cadeau-fin", boite);

    /* CE QUE VOIT QUELQU'UN QUI A DEJA DONNE : pas le formulaire. */
    function montrerDeja() {
      if (form) form.hidden = true;
      if (fin) fin.hidden = true;
      if (suite) suite.hidden = true;
      if (dejaBloc) dejaBloc.hidden = false;
    }
    if (deja) montrerDeja();

    (function formulaire() {
      if (!form) return;
      var etat = $(".form-status", form);
      var bouton = $(".cadeau-go", form);

      form.addEventListener("submit", function (e) {
        e.preventDefault();
        /* La validation passe par `validate()`, comme partout : les
           deux champs sont `required`, donc elle mord. */
        if (!validate(form)) {
          say(etat, "Les deux sont nécessaires pour vous envoyer les guides.", "err");
          return;
        }
        var donnees = serialize(form);
        setLoading(bouton, true, "Préparation…");
        say(etat, "");

        /* LE TELECHARGEMENT NE DEPEND PAS DE L'ENVOI. Le visiteur a
           donne ce qu'on demandait : il repart avec les guides, que
           l'enregistrement de ses coordonnees aboutisse ou non. */
        try { localStorage.setItem(CLE_DONNE, new Date().toISOString().slice(0, 10)); } catch (err) {}
        telecharger();

        var finir = function () {
          setLoading(bouton, false);
          form.hidden = true;
          if (fin) fin.hidden = true;
          if (suite) {
            suite.hidden = false;
            var b = $("[data-cadeau-projet]", suite);
            if (b) b.focus();
          }
        };

        sendJson("cadeau", Object.assign({}, donnees, {
          documents: "Automatisation (42 p.) + IA et croissance (49 p.)",
          origine: "Popup guides"
        })).then(finir).catch(finir);
      });
    })();

    /* L'ENCHAINEMENT. Une personne qui vient de telecharger est
       chaude : le popup se retire et la modale de projet s'ouvre. */
    var versProjet = $("[data-cadeau-projet]", boite);
    if (versProjet) {
      versProjet.addEventListener("click", function () {
        fermer();
        window.setTimeout(function () { openModal("modal-project"); }, 260);
      });
    }

    /* UNE ENTREE MANUELLE, et c'est la CONTREPARTIE du retrait des
       telechargements directs du pied. Sans elle, quelqu'un qui a
       deja donne ses coordonnees n'aurait plus AUCUN chemin vers ses
       guides : le popup ne se represente jamais, et le pied ne les
       offre plus. Elle est cablee AVANT la sortie ci-dessous, sinon
       elle ne le serait pas pour ceux-la memes qui en ont besoin. */
    $$("[data-cadeau-ouvrir]").forEach(function (b) {
      b.addEventListener("click", function () {
        if (ouvert) return;
        ouvert = true;
        paru = true;
        declencheur = doc.activeElement;
        boite.showModal();
        var x = $(".cadeau-x", boite);
        if (x) x.focus();
      });
    });

    /* Quelqu'un qui a deja donne ne revoit plus le popup TOUT SEUL. */
    if (vu || deja) return;

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

  /* LA BASCULE EST UN CRAN.  D-635 */
  function applyTheme(next) {
    root.setAttribute("data-theme", next);
    labelTheme(next);
    if (metaThemeColor) metaThemeColor.setAttribute("content", next === "dark" ? "#101211" : "#dcdedb");
    try { localStorage.setItem("aped-theme", next); } catch (e) {}
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
      root.setAttribute("data-theme", next);
      labelTheme(next);
      if (metaThemeColor) metaThemeColor.setAttribute("content", next === "dark" ? "#101211" : "#dcdedb");
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

  /* PAS D'ADRESSE, PAS D'ENVOI — ET ON LE DIT.  D-719
     Un point de sortie vide ne retombe pas en silence sur un succes :
     il echoue tout de suite, avec le meme drapeau qu'un refus du
     service, donc le meme etat visible sous le formulaire. */
  function sansPoint() {
    var e = new Error("L’envoi n’est pas branché.");
    e.duService = true;
    return Promise.reject(e);
  }

  /* LE TYPE DE CONTENU EST `text/plain`, ET C'EST DELIBERE.  D-721
     Une Web App Apps Script ne repond pas aux requetes prealables
     CORS : avec `application/json` le navigateur en envoie une, ne
     recoit rien, et la requete meurt AVANT de partir. `text/plain`
     fait une requete « simple », donc sans preliminaire. Le corps
     reste du JSON — c'est l'en-tete qui ment, pas le contenu, et
     `doPost` le lit avec `JSON.parse`.

     `mode: "no-cors"` reglerait aussi le probleme et serait un
     piege : la reponse devient opaque, `res.json()` echoue, et
     TOUS les formulaires afficheraient un echec meme quand
     l'enregistrement a reussi. */
  /* LE VRAI SERVICE TOMBE PAR INTERMITTENCE, ET C'EST MESURE. D-734

     Releve du 2026-08-06 contre le deploiement REEL : 2 reponses
     sur 36 en HTTP 404, avec une page HTML au lieu du JSON. Ce
     n'est pas le script qui echoue — c'est le renvoi de `/exec`
     vers `googleusercontent.com`, l'etage devant lui.

     Sans reessai, une demande sur vingt affichait « L'envoi n'a
     pas passe » a quelqu'un qui avait tout rempli correctement.
     Le repli sauvait sa saisie, mais il lui fallait recommencer,
     et un patron de PME presse ne recommence pas.

     ON PEUT REESSAYER PARCE QUE LE SERVICE EST DEVENU
     IDEMPOTENT : `traiter()` cherche la signature de la demande
     AVANT de poser un rendez-vous ou de televerser un fichier
     (D-730). Un second envoi de la meme demande incremente
     « Renvois » et rend le meme resultat, lien Meet compris. Sans
     cette correction-la, ce reessai-ci creerait des doublons.

     ON NE REESSAIE PAS UN REFUS. `success: false` est une reponse,
     pas une panne : plage prise, champ manquant, courriel invalide.
     Reessayer donnerait exactement le meme refus, trois fois plus
     lentement. */
  var REESSAIS_MAX = 2;
  var REESSAI_MS = [700, 1800];

  function transitoire(statut) {
    if (statut === 404) return true;                 /* le renvoi qui tombe */
    if (statut === 429) return true;                 /* trop d'appels */
    return statut >= 500 && statut < 600;            /* surcharge Google */
  }

  function attendre(ms) {
    return new Promise(function (r) { window.setTimeout(r, ms); });
  }

  /* AUCUNE REQUETE N'ATTEND INDEFINIMENT.  D-741

     MESURE, contre le vrai deploiement, le 2026-08-06 : la porte des
     creneaux repond en 1,7 s de mediane et 3,1 s au p90 — mais une
     fois sur vingt-cinq elle a mis 29,9 s. Trente secondes de roue
     qui tourne, sans un mot, ce n'est pas de la lenteur : le
     visiteur conclut que c'est casse et il ferme.

     `fetch` n'a pas de delai maximum. Sans `AbortController`, la
     promesse reste ouverte aussi longtemps que le navigateur veut
     bien — et le reessai, lui, n'est jamais declenche puisque rien
     n'a echoue.

     DEUX BUDGETS, PARCE QUE LES DEUX ENJEUX SONT OPPOSES :
     · l'AFFICHAGE des creneaux est jetable — on a un filet, on
       coupe tot (8 s) et on montre autre chose ;
     · l'ENVOI d'une demande ne l'est pas — abandonner trop tot
       ferait renvoyer une demande peut-etre deja recue. On laisse
       25 s, soit plus que le pire releve, et le service est
       idempotent (D-730) : un renvoi ne cree pas de doublon. */
  var DELAI_ENVOI_MS = 25000;
  var DELAI_CRENEAUX_MS = 8000;

  function avecDelai(url, options, ms) {
    /* Un navigateur sans `AbortController` garde l'ancien
       comportement plutot que de perdre la requete. */
    if (typeof window.AbortController !== "function") return fetch(url, options);
    var ctrl = new window.AbortController();
    var minuterie = window.setTimeout(function () { ctrl.abort(); }, ms);
    var o = Object.assign({}, options, { signal: ctrl.signal });
    return fetch(url, o).then(function (res) {
      window.clearTimeout(minuterie);
      return res;
    }, function (err) {
      window.clearTimeout(minuterie);
      /* On renomme l'abandon : `AbortError` remonterait tel quel
         jusqu'au message du visiteur, qui n'en ferait rien. */
      if (err && err.name === "AbortError") {
        var e = new Error("delai depasse");
        e.delaiDepasse = true;
        throw e;
      }
      throw err;
    });
  }

  function poster(payload) {
    if (!FORM_ENDPOINT) return sansPoint();
    var essai = 0;

    function tenter() {
      return avecDelai(FORM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload)
      }, DELAI_ENVOI_MS).then(function (res) {
        if (!res.ok && transitoire(res.status) && essai < REESSAIS_MAX) {
          return attendre(REESSAI_MS[essai++]).then(tenter);
        }
        return lireReponse(res);
      }, function (err) {
        /* PANNE RESEAU. `fetch` ne rejette que la : coupure, DNS,
           TLS. Un 404 passe par la branche du dessus. */
        if (essai < REESSAIS_MAX) {
          return attendre(REESSAI_MS[essai++]).then(tenter);
        }
        throw err;
      });
    }
    return tenter();
  }

  /* `_form` est ce qui aiguille vers le bon onglet du classeur.
     `_subject` reste : il sert au sujet de l'avis interne. */
  function sendJson(kind, data) {
    return poster(Object.assign({}, data, {
      _form: kind,
      _subject: SUBJECTS[kind] || "Message - site APED"
    }));
  }

  /* LES PIECES JOINTES VOYAGENT EN BASE64, PAS EN MULTIPART.  D-722
     `doPost` d'Apps Script recoit `e.postData.contents` comme une
     CHAINE : il ne sait pas reconstruire les parties binaires d'un
     `multipart/form-data`. Les fichiers sont donc lus dans le
     navigateur et encodes dans le meme JSON que le reste ; le
     script les repose dans un dossier Drive et n'ecrit que leurs
     liens dans le classeur.

     La lecture peut echouer — fichier retire du disque entre le
     choix et l'envoi, permission refusee. On ne fait pas echouer
     la demande pour autant : `envoyerProjet` retombe deja sur un
     envoi sans pieces, qui vaut infiniment mieux que rien. */
  function lireFichier(f) {
    return new Promise(function (resoudre, rejeter) {
      var lecteur = new FileReader();
      lecteur.onload = function () {
        var res = String(lecteur.result || "");
        var virgule = res.indexOf(",");
        resoudre({
          nom: f.name,
          type: f.type || "application/octet-stream",
          base64: virgule >= 0 ? res.slice(virgule + 1) : ""
        });
      };
      lecteur.onerror = function () { rejeter(lecteur.error || new Error("lecture")); };
      lecteur.readAsDataURL(f);
    });
  }

  function sendAvecFichiers(kind, data, fichiers) {
    if (!FORM_ENDPOINT) return sansPoint();
    return Promise.all(fichiers.map(lireFichier)).then(function (pieces) {
      return poster(Object.assign({}, data, {
        _form: kind,
        _subject: SUBJECTS[kind] || "Message - site APED",
        _fichiers: pieces
      }));
    });
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

  /* UN MESSAGE D'ECHEC DOIT DIRE QUOI FAIRE, PAS CE QUI RATE. D-736

     « L'envoi n'a pas passe » etait la meme phrase pour trois
     situations qui n'appellent pas la meme chose :
       · le visiteur est hors ligne — il doit se reconnecter, et
         rien d'autre ne marchera d'ici la ;
       · le service refuse pour une raison qu'il NOMME — il faut
         lui rendre cette raison, pas la remplacer par une phrase
         generique ;
       · le service est en panne — il faut reessayer plus tard.

     Les trois reponses sont differentes. Une seule phrase pour les
     trois, c'est laisser le visiteur devant un mur sans porte. Et
     le reessai automatique a deja eu lieu quand on arrive ici :
     ce n'est pas un pepin, c'est une panne installee.  D-734 */
  function messageEchec(err, quoi) {
    var perdu = "Rien de ce que vous avez écrit n’est perdu.";
    if (navigator && navigator.onLine === false) {
      return "Vous semblez hors ligne. " + perdu
        + " Reconnectez-vous et renvoyez.";
    }
    if (err && err.duService && err.message) return err.message;
    /* LE DELAI DEPASSE N'EST PAS UNE PANNE, et le dire autrement  D-741
       serait faux : le service a peut-etre recu la demande. On
       invite donc a renvoyer — c'est sans danger, `traiter()`
       reconnait un renvoi et n'ecrit pas deux fois (D-730) — et on
       le dit, sinon personne n'ose. */
    if (err && err.delaiDepasse) {
      return "Google met plus de temps que d’habitude. " + perdu
        + " Renvoyez dans une minute : si la demande est déjà passée,"
        + " elle ne comptera pas en double.";
    }
    return "Le service ne répond pas — on a réessayé deux fois. "
      + perdu + " Réessayez dans un moment, ou réservez un appel.";
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
      corps = corps.slice(0, REPLI_MAX) + "\n\n[La suite a été coupée. Ajoutez ce qui manque.]";
    }
    if (avecFichiers) {
      corps += "\n\nVos fichiers ne sont pas dans cette copie : ils sont restés sur votre appareil.";
    }
    return corps;
  }

  /* LE REPLI NE PASSE PLUS PAR UNE ADRESSE.  D-719
     Il faisait exactement ce qu'on lui demandait — livrer quand le
     service refuse — mais il le faisait en ecrivant l'adresse
     personnelle dans un `href`, lisible dans la barre d'etat au
     survol. Ce qu'il protegeait vraiment, c'est la SAISIE du
     visiteur : elle ne se perd pas. On garde ca, sans adresse.

     Pose JUSTE APRES le message d'etat, dans le meme parent.  D-424 */
  function poserRepli(status, kind, data, avecFichiers) {
    if (!status || !status.parentNode) return;
    var hote = status.parentNode;
    var ancien = hote.querySelector("[data-repli]");
    if (ancien) hote.removeChild(ancien);

    var boite = doc.createElement("p");
    boite.className = "form-repli";
    boite.setAttribute("data-repli", "");

    var premier = null;

    /* 1 · RIEN DE CE QUI A ETE ECRIT NE SE PERD. Le presse-papiers
       demande un geste du visiteur : le clic sur ce bouton en est un.
       Sans l'API, le bouton ne parait pas — on ne montre pas une
       commande qui ne fait rien. */
    if (navigator.clipboard && navigator.clipboard.writeText) {
      var copier = doc.createElement("button");
      copier.type = "button";
      copier.className = "btn btn--primary";
      copier.textContent = "Copier ce que j’ai écrit";
      copier.addEventListener("click", function () {
        navigator.clipboard.writeText(corpsCourriel(data, avecFichiers)).then(
          function () { copier.textContent = "Copié."; },
          function () { copier.textContent = "La copie a échoué."; }
        );
      });
      boite.appendChild(copier);
      premier = copier;
    }

    /* 2 · UNE AUTRE ROUTE — mais jamais celle qui vient d'echouer :
       proposer « Reserver un appel » sous un formulaire de rendez-vous
       en panne serait renvoyer le visiteur dans le mur. */
    if (kind !== "booking") {
      var appel = doc.createElement("button");
      appel.type = "button";
      appel.className = "btn btn--ghost";
      appel.textContent = "Réserver un appel";
      appel.addEventListener("click", function () { openModal("modal-booking"); });
      boite.appendChild(appel);
      if (!premier) premier = appel;
    }

    var note = doc.createElement("small");
    note.textContent = "Rien de ce que vous avez rempli n’est perdu. Réessayez dans un moment&nbsp;: le formulaire est encore là, tel que vous l’avez laissé."
      .replace(/&nbsp;/g, " ");

    boite.appendChild(note);
    hote.insertBefore(boite, status.nextSibling);
    if (premier) premier.focus();
  }

  /* Un nouvel essai efface le repli du precedent : laisser un bouton
     « l'envoi a echoue » sous un formulaire qui vient de reussir
     serait exactement le genre de contradiction qu'on corrige. */
  function retirerRepli(status) {
    if (!status || !status.parentNode) return;
    var ancien = status.parentNode.querySelector("[data-repli]");
    if (ancien) ancien.parentNode.removeChild(ancien);
  }

  /* LE HANDLER COMMUN — urgence, reference, et le message ordinaire.
     Ces trois-la ne connaissent RIEN de l'envoi : ils declarent leur
     `data-form`, et tout le reste — validation, etats du bouton,
     message de succes, message d'echec avec un moyen de nous joindre
     quand meme — vient d'ici. Un quatrieme formulaire s'ajoute en
     ecrivant son nom dans ce selecteur, nulle part ailleurs. */
  $$('form[data-form="urgent"], form[data-form="refer"], form[data-form="contact"]').forEach(function (form) {
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
      }).catch(function (err) {
        setLoading(btn, false);
        say(status, messageEchec(err), "err");
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
  var selectedSlotISO = "";

  /* CE QUE LE SERVEUR A REPONDU. `null` tant qu'on n'a rien
     demande ou que la demande a echoue : c'est ce `null` qui fait
     basculer tout le calendrier sur le filet. */
  var creneauxServeur = null;
  var creneauxEtat = "vierge";   /* vierge · attente · direct · filet */
  var creneauxPromesse = null;
  var slotsNote = null;

  function startOfDay(d) { var x = new Date(d); x.setHours(0, 0, 0, 0); return x; }
  function minDate() { return startOfDay(new Date(Date.now() + BOOKING.minNoticeHours * 3600 * 1000)); }
  function maxDate() { return startOfDay(new Date(Date.now() + BOOKING.horizonDays * 24 * 3600 * 1000)); }

  /* LA CLE D'UN JOUR — « 2026-08-10 », telle que le serveur l'ecrit.
     Construite a partir des chiffres AFFICHES dans la case du
     calendrier, jamais par `toISOString()` : celui-la convertit en
     UTC, et le 10 aout a 00 h a Vancouver y devient le 9 aout. */
  function cleDate(d) {
    var m = d.getMonth() + 1;
    var j = d.getDate();
    return d.getFullYear() + "-" + (m < 10 ? "0" : "") + m + "-" + (j < 10 ? "0" : "") + j;
  }

  /* LA DEUXIEME PORTE. Meme adresse que l'envoi, un parametre en
     plus. En GET, donc sans requete prealable CORS, comme le POST
     en `text/plain` : les Web Apps Apps Script ne repondent pas aux
     preliminaires.  D-726 */
  /* LA FRAICHEUR, PARCE QUE LE PRECHARGEMENT NE DOIT PAS ETRE
     JETE.  D-735
     `resetBooking` redemandait de FORCE a chaque ouverture. Avec le
     prechargement au survol, la reponse arrivait puis se faisait
     immediatement remplacer par un second appel — le visiteur
     attendait quand meme ses 1,7 s, et le service travaillait deux
     fois. Une reponse de moins de 45 s est encore vraie : le
     preavis est de 24 h, personne ne prend une plage dans cet
     intervalle sans que la revalidation du serveur l'attrape. */
  var CRENEAUX_FRAIS_MS = 45000;
  var creneauxHorodatage = 0;

  function chargerCreneaux(forcer) {
    var frais = creneauxPromesse
      && (Date.now() - creneauxHorodatage) < CRENEAUX_FRAIS_MS
      && creneauxEtat !== "filet";
    if (creneauxPromesse && (!forcer || frais)) return creneauxPromesse;
    if (!FORM_ENDPOINT) {
      creneauxServeur = null;
      creneauxEtat = "filet";
      creneauxPromesse = Promise.resolve(null);
      return creneauxPromesse;
    }
    creneauxEtat = "attente";
    var url = FORM_ENDPOINT + (FORM_ENDPOINT.indexOf("?") === -1 ? "?" : "&") + "action=creneaux";
    /* MEME REESSAI QUE POUR L'ENVOI, ET ICI IL EST GRATUIT : c'est
       une lecture, elle n'ecrit rien, la rejouer n'a aucun cout.
       Sans lui, un 404 transitoire fait basculer tout le calendrier
       sur son filet — des plages qui ne sont pas confirmees — alors
       qu'un second appel aurait repondu.  D-734 */
    var essai = 0;
    var lire = function () {
      /* HUIT SECONDES, PAS PLUS. L'affichage des creneaux est la  D-741
         seule requete du site qui ait un remplacant : le filet.
         Attendre trente secondes une reponse qu'on sait remplacer
         est le pire des deux mondes. */
      return avecDelai(url, { method: "GET" }, DELAI_CRENEAUX_MS).then(function (res) {
        if (!res.ok) {
          if (transitoire(res.status) && essai < REESSAIS_MAX) {
            return attendre(REESSAI_MS[essai++]).then(lire);
          }
          throw new Error("creneaux " + res.status);
        }
        return res.json();
      }, function (err) {
        if (essai < REESSAIS_MAX) return attendre(REESSAI_MS[essai++]).then(lire);
        throw err;
      });
    };
    creneauxPromesse = lire()
      .then(function (data) {
        /* UN 200 N'EST PAS UNE REPONSE. Meme regle que pour l'envoi :
           le service peut repondre « success: false ». */
        if (!data || data.success !== true || !data.jours) throw new Error("creneaux refuses");
        var carte = {};
        data.jours.forEach(function (j) { carte[j.date] = j; });
        creneauxServeur = carte;
        creneauxEtat = "direct";
        creneauxHorodatage = Date.now();
        return carte;
      })
      .catch(function (err) {
        /* ON NE VIDE PAS LE CALENDRIER SUR UN ECHEC. Voir le filet,
           au bloc `BOOKING`. */
        creneauxServeur = null;
        creneauxEtat = "filet";
        return null;
      });
    return creneauxPromesse;
  }

  /* UN JOUR SANS PLAGE NE S'OFFRE PAS.  D-708
     Rend toujours la meme forme — `[{ iso, h }]` — que les plages
     viennent du serveur ou du filet, pour que l'affichage n'ait
     qu'un seul cas a traiter. */
  function plagesDuJour(date) {
    if (creneauxServeur) {
      var jour = creneauxServeur[cleDate(date)];
      return jour ? jour.creneaux : [];
    }
    var plancher = new Date(Date.now() + BOOKING.minNoticeHours * 3600 * 1000);
    return BOOKING.slots.map(function (slot) {
      var p = slot.split(":");
      var quand = new Date(date);
      quand.setHours(Number(p[0]), Number(p[1]), 0, 0);
      return { iso: quand.toISOString(), h: p[0] + " h " + p[1], _quand: quand };
    }).filter(function (c) { return c._quand >= plancher; });
  }

  function jourOuvert(date) {
    if (creneauxServeur) return Boolean(creneauxServeur[cleDate(date)]);
    return BOOKING.businessDays.indexOf(date.getDay()) !== -1 &&
      date >= minDate() && date <= maxDate() &&
      plagesDuJour(date).length > 0;
  }

  /* == LE CALENDRIER OUVRE SUR LE PREMIER JOUR RESERVABLE.  D-622 */
  function premierJourOuvrable() {
    var d = minDate();
    var fin = maxDate();
    for (var i = 0; i < 60 && d <= fin; i++) {
      if (jourOuvert(d)) return d;
      d = new Date(d.getTime() + 86400000);
    }
    return minDate();
  }

  var calView = premierJourOuvrable();

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
        /* DEUX ETIQUETTES DANS LA MEME CASE, UNE SEULE VISIBLE.  D-740
           En grille c'est le quantieme, seul lisible dans 40 px de
           large. Sur un telephone tenu d'une main la grille laisse
           tomber : sept colonnes dans un panneau de 288 px donnent
           des cases de 40 px, sous le seuil de 44, et se tromper de
           case ne rate pas un clic — ca reserve le mauvais jour.
           La feuille de style bascule alors en LISTE, une ligne
           pleine largeur par jour offert, et c'est la longue
           etiquette qui parait. Aucune des deux n'est fabriquee au
           moment de l'affichage : elles voyagent ensemble. */
        var court = doc.createElement("span");
        court.className = "cal-num";
        court.textContent = day;
        var longue = doc.createElement("span");
        longue.className = "cal-long";
        longue.textContent = date.toLocaleDateString("fr-CA", { weekday: "short", day: "numeric", month: "short" });
        btn.appendChild(court);
        btn.appendChild(longue);
        btn.setAttribute("aria-label", date.toLocaleDateString("fr-CA", { weekday: "long", day: "numeric", month: "long" }));
        var open = jourOuvert(date);
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

  /* LA NOTE SOUS LES PLAGES. Elle dit d'ou viennent les heures.
     Trois etats, trois phrases, et jamais de silence : un visiteur
     qui ne sait pas si les plages sont a jour n'ose pas reserver.
     Le noeud est cree une seule fois, apres la liste.  D-726 */
  function noteCreneaux() {
    if (!slotsList || !slotsList.parentNode) return null;
    if (!slotsNote) {
      slotsNote = doc.createElement("p");
      slotsNote.className = "slots-note";
      slotsNote.setAttribute("data-creneaux-note", "");
      slotsList.parentNode.insertBefore(slotsNote, slotsList.nextSibling);
    }
    return slotsNote;
  }

  function direLaSource() {
    var n = noteCreneaux();
    if (!n) return;
    if (creneauxEtat === "direct" && creneauxServeur && !Object.keys(creneauxServeur).length) {
      /* L'AGENDA A REPONDU, ET IL EST PLEIN. Ce n'est pas une panne,
         et le dire comme une panne enverrait le visiteur recharger
         la page pour rien. */
      n.textContent = "L’agenda est complet pour les prochaines semaines. "
        + "Écrivez-nous : on trouve un moment à la main.";
      n.className = "slots-note is-filet";
    } else if (creneauxEtat === "direct") {
      n.textContent = "Heure de l’Est (Québec). Ces plages sont libres à l’instant : "
        + "ce qui est pris n’apparaît pas.";
      n.className = "slots-note";
    } else if (creneauxEtat === "attente") {
      n.textContent = "Lecture de l’agenda…";
      n.className = "slots-note is-attente";
    } else {
      n.textContent = "Heure de l’Est (Québec). L’agenda ne répond pas à l’instant : "
        + "ces plages sont nos heures habituelles, pas une confirmation. "
        + "On vérifie au moment où vous confirmez.";
      n.className = "slots-note is-filet";
    }
  }

  function renderSlots() {
    if (!slotsList) return;
    slotsList.innerHTML = "";
    /* LE CRAN DE L'ATTENTE. Les plages restent lisibles, elles ne se
       cliquent plus. Voir `.slots-list.is-attente` dans app.css. */
    slotsList.classList.toggle("is-attente", creneauxEtat === "attente");
    direLaSource();
    if (!selectedDate) {
      slotsTitle.textContent = creneauxEtat === "attente"
        ? "Lecture de l’agenda…"
        : "Sélectionnez une date";
      slotsEmpty.hidden = true;
      return;
    }

    var cle = cleDate(selectedDate);
    var jour = creneauxServeur ? creneauxServeur[cle] : null;
    slotsTitle.textContent = jour
      ? jour.libelle
      : selectedDate.toLocaleDateString("fr-CA", { weekday: "long", day: "numeric", month: "long" });

    /* MEME SOURCE que le calendrier : deux bornes calculees a deux
       endroits, c'etait exactement le defaut.  D-708 */
    plagesDuJour(selectedDate).forEach(function (creneau) {
      var btn = doc.createElement("button");
      btn.type = "button";
      btn.className = "slot";
      /* L'HEURE VIENT DU SERVEUR, ECRITE.  D-727
         Elle a ete calculee a America/Toronto puis mise en francais
         la-bas. Le navigateur ne la reformate pas : `toLocaleTime`
         l'aurait rendue dans le fuseau du VISITEUR, et une personne
         a Vancouver aurait lu « 6 h 00 » pour un appel de 9 h. */
      btn.textContent = creneau.h;
      btn.addEventListener("click", function () {
        var jourLong = jour
          ? jour.libelleLong
          : selectedDate.toLocaleDateString("fr-CA", {
              weekday: "long", day: "numeric", month: "long", year: "numeric"
            });
        selectedSlotLabel = jourLong + " à " + creneau.h;
        /* LA PLAGE LISIBLE PAR UNE MACHINE.  D-723
           `selectedSlotLabel` est une phrase francaise. Elle est
           parfaite pour un humain et inutilisable pour poser un
           evenement : on envoie l'instant exact a cote. Le serveur
           REECRIT la phrase a partir de cet instant-la avant de
           l'ecrire au classeur, donc les deux ne peuvent pas se
           contredire. */
        selectedSlotISO = creneau.iso;
        $("#bookingRecap").textContent = selectedSlotLabel;
        goBStep(2);
        var firstField = $('.step[data-bstep="2"] input', bookingModal);
        if (firstField) firstField.focus({ preventScroll: true });
      });
      slotsList.appendChild(btn);
    });
    slotsEmpty.hidden = slotsList.children.length > 0;
  }

  /* Redemander les plages, puis repeindre. Appelee a l'ouverture de
     la modale et apres un refus pour plage prise. */
  function rafraichirCreneaux(forcer) {
    /* L'APPEL D'ABORD, LA PEINTURE ENSUITE. `chargerCreneaux` pose
       `creneauxEtat = "attente"` de facon SYNCHRONE avant de partir
       sur le reseau : peindre avant, c'est peindre l'etat
       precedent, et le cran de l'attente ne paraitrait jamais. */
    var promesse = chargerCreneaux(forcer);
    renderSlots();
    return promesse.then(function () {
      /* Le premier jour ouvrable change quand l'agenda parle : le
         mois affiche doit suivre, sinon la modale s'ouvre sur une
         grille entierement grisee. */
      if (!selectedDate) calView = premierJourOuvrable();
      renderCalendar();
      renderSlots();
    });
  }

  function resetBooking() {
    /* Et ICI aussi : c'est la remise a zero qui s'execute a chaque
       ouverture de la modale, donc c'est elle qui decide du mois
       affiche. La poser a `new Date()` ramenait le calendrier sur le
       mois courant — entierement grise un 31 du mois.  D-622 */
    calView = premierJourOuvrable();
    selectedDate = null;
    selectedSlotLabel = "";
    selectedSlotISO = "";
    renderCalendar();
    renderSlots();
    /* ON REDEMANDE L'AGENDA A CHAQUE OUVERTURE, ET DE FORCE.  D-726
       Une modale rouverte dix minutes plus tard sur une liste mise
       en cache offrirait une plage prise entre-temps. Le cout est
       une requete par ouverture ; le prix de l'economie serait un
       rendez-vous double. */
    rafraichirCreneaux(true);
    goBStep(1);
    var form = $('form[data-form="booking"]', bookingModal);
    if (form) {
      form.reset();
      say($(".form-status", form), "");
      var btn = $("[data-submit]", form);
      if (btn) setLoading(btn, false);
      $$(".field.is-invalid", form).forEach(function (f) { markField(f, true); });
      /* `form.reset()` vide bien le champ cache du mode, mais il ne
         releve pas les boutons : ils resteraient allumes sur un
         choix que le formulaire ne porte plus.  D-725 */
      $$(".choices button", form).forEach(function (b) {
        b.classList.remove("is-on");
        b.setAttribute("aria-pressed", "false");
      });
      var note = $("#bkModeNote");
      if (note) note.textContent = "";
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

  /* == PRECHARGER LES CRENEAUX AU MOMENT DE L'INTENTION ==  D-735

     MESURE DU 2026-08-06, CONTRE LE VRAI SERVICE : la porte des
     creneaux repond en 1,7 s de mediane, 3,1 s au neuvieme decile,
     et une fois sur vingt-cinq elle a mis 29,9 s. Tout ce temps
     s'ecoulait APRES le clic, avec « Lecture de l'agenda… » a
     l'ecran et rien a faire. C'est la seconde la plus chere du
     site : elle est entre un visiteur qui a decide de reserver et
     le calendrier qui doit le lui permettre.

     ON DEMANDE DES QUE LA MAIN S'APPROCHE. Survol ou tabulation
     sur un bouton qui ouvre la reservation : la requete part, et
     le temps du geste — deplacer le curseur, cliquer — est du
     temps rendu au visiteur.

     ON NE PRECHARGE PAS AU CHARGEMENT DE LA PAGE, et c'est
     delibere : ce serait une execution Apps Script par visiteur,
     dont l'immense majorite ne reservera jamais. Le compte gratuit
     plafonne a 90 minutes d'execution par jour ; les depenser pour
     des gens qui ne cliqueront pas, c'est fermer la porte a ceux
     qui cliquent.

     `chargerCreneaux()` sans argument rend la promesse en cours :
     survoler trois boutons ne fait qu'UN appel. */
  (function precharger() {
    if (!FORM_ENDPOINT) return;
    var amorce = function (e) {
      var cible = e.target.closest
        ? e.target.closest('[data-modal-open="modal-booking"], [data-modal-switch="modal-booking"]')
        : null;
      if (!cible) return;
      chargerCreneaux();
    };
    doc.addEventListener("pointerenter", amorce, true);
    doc.addEventListener("focusin", amorce);
    /* Le pouce n'a pas de survol. `pointerdown` part quand le doigt
       touche, donc avant le `click` : ce n'est pas beaucoup, mais
       c'est ce qu'il y a. */
    doc.addEventListener("pointerdown", amorce, true);
  })();

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
      data.plage_iso = selectedSlotISO;
      sendJson("booking", data).then(function () {
        setLoading(btn, false);
        goBStep(3);
      }).catch(function (err) {
        setLoading(btn, false);
        /* UNE PLAGE DEJA PRISE N'EST PAS UNE PANNE.  D-724
           Le service refuse la reservation et dit pourquoi. Repondre
           « l'envoi n'a pas passe » enverrait le visiteur reessayer
           exactement la meme plage, qui echouera exactement pareil.
           On lui rend la phrase du service et on le ramene au
           calendrier, ou il en choisira une autre.
           Le repli generique n'a rien a faire la : rien n'est en
           panne, et « copier ce que j'ai ecrit » ne repare pas un
           conflit d'horaire. */
        /* CE QUI EST UN CONFLIT D'HORAIRE, ET CE QUI N'EN EST PAS.
           Toutes ces phrases viennent de `poserRendezVous` : plage
           prise, preavis, hors grille, trop lointaine, agenda
           illisible. Aucune n'est une panne d'envoi, et toutes se
           reglent en choisissant une autre plage.  D-724 · D-726 */
        var conflit = err && err.duService &&
          /prise|d’avance|d'avance|offerte|lointaine|disponibilités|disponibilites/i
            .test(err.message || "");
        if (conflit) {
          say(status, err.message, "err");
          /* ON REDEMANDE L'AGENDA AVANT DE LE RENVOYER CHOISIR.
             Sans ca, il retombe sur la liste qui vient justement de
             se tromper, reprend la meme plage, et se fait refuser
             exactement pareil. */
          rafraichirCreneaux(true);
          window.setTimeout(function () {
            goBStep(1);
            say(status, "");
          }, 2600);
          return;
        }
        say(status, messageEchec(err), "err");
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
  /* Six, depuis que les fichiers ont rejoint la description.  D-703 */
  var P_TOTAL = 6;
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
    label.textContent = n === P_TOTAL - 1 ? "Envoyer ma demande" : "Continuer";
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

  /* LES CHOIX A DEUX BOUTONS SERVENT MAINTENANT A DEUX ENDROITS.  D-725
     Ce bloc etait enferme dans `if (projectWizard)` et ne voyait que
     le formulaire de projet. La reservation a besoin du meme geste
     — deux boutons, un champ cache, `aria-pressed` — pour le mode
     de l'appel. On le sort d'un cran plutot que d'ecrire un second
     controle qui ferait la meme chose avec un autre style : un
     visiteur qui a compris « Oui / Non » a deja compris
     « Telephone / Google Meet ».
     La recherche du champ cache part de la rangee, plus du wizard :
     c'est ce qui la rend portable. */
  $$(".choices").forEach(function (row) {
    var key = row.dataset.choice;
    var portee = row.closest("form") || doc;
    var hidden = $('input[type="hidden"][name="' + key + '"]', portee);
    if (!hidden) return;
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
        if (key === "site_existant" && $("#prUrlField")) {
          $("#prUrlField").hidden = btn.dataset.value !== "Oui";
        }
        /* Le mode commande ce que le visiteur lit sous les boutons :
           on ne promet pas un lien Meet a quelqu'un qu'on va
           appeler. */
        if (key === "mode") {
          var note = $("#bkModeNote");
          if (note) {
            note.textContent = btn.dataset.value === "Google Meet"
              ? "L’invitation et le lien Meet partent vers votre courriel et votre calendrier."
              : "On vous appelle au numéro ci-dessous, à l’heure choisie.";
          }
        }
      });
    });
  });

  if (projectWizard) {

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
      if (pStep < P_TOTAL - 1) { goPStep(pStep + 1); return; }

      var status = $(".form-status", projectWizard);
      setLoading(projectNext, true);
      say(status, "");
      retirerRepli(status);

      var data = serialize(projectWizard);

      var done = function () { setLoading(projectNext, false); goPStep(P_TOTAL); };
      var attempt = pickedFiles.length
        ? sendAvecFichiers("project", data, pickedFiles)
        : sendJson("project", data);

      attempt.then(done).catch(function () {
        // Deuxieme essai sans piece jointe : mieux vaut la demande sans
        // fichiers que pas de demande du tout.
        sendJson("project", data).then(done).catch(function (err) {
          setLoading(projectNext, false);
          say(status, messageEchec(err), "err");
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

  /* CE QU'ON A COMPRIS, PAS UN PRIX.  D-353
     `computeEstimate` rendait une fourchette en dollars tiree du
     bareme, affichee a l'etape 8. Le bareme et son affichage sont
     partis le 2026-08-03 : le site ne publie plus que 75 $ l'heure,
     40 % au demarrage et le plafond de 5 000 $ du programme de
     reference. Ce qui reste utile au visiteur, c'est de VOIR que ses
     six reponses ont ete lues — et c'est verifiable par lui, ce
     qu'un chiffre invente ne serait pas. */
  function resumeProjet() {
    var bouts = [
      ANSWER_LABELS[answers.type],
      ANSWER_LABELS[answers.industrie],
      ANSWER_LABELS[answers.envergure],
      ANSWER_LABELS[answers.delai]
    ].filter(function (x) { return x; });
    return bouts.length ? bouts.join(" · ") : "Votre projet";
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

        var resume = resumeProjet();
        var payload = Object.assign({}, serialize(estimateForm), {
          type_de_projet: ANSWER_LABELS[answers.type] || "",
          domaine: ANSWER_LABELS[answers.industrie] || "",
          envergure: ANSWER_LABELS[answers.envergure] || "",
          niveau_design: ANSWER_LABELS[answers.design] || "",
          echeancier: ANSWER_LABELS[answers.delai] || "",
          site_existant: ANSWER_LABELS[answers.site_existant] || ""
        });

        var reveal = function () {
          setLoading(btn, false);
          goEStep(8);
          var res = $("#estimateResume");
          if (res) res.textContent = resume;
        };

        /* L'ETAT DE SORTIE EST CELUI DE L'ETAPE 8, PAS CELUI DU  D-425 */
        var sortie = $("#estimateStatus") || status;
        retirerRepli(sortie);
        say(sortie, "");
        sendJson("estimate", payload).then(reveal).catch(function (err) {
          /* L'ORDRE COMPTE. On revele d'abord le resume — c'est ce  D-426 */
          reveal();
          say(sortie, messageEchec(err), "err");
          poserRepli(sortie, "estimate", payload);
        });
      });
    }
  }

  /* == Calculateur. Le montant alimente aussi l'index de gauche et ==  D-427 */
  var roiSection = $("#calculateur");

  if (roiSection) {
    /* DEUX CURSEURS SONT PARTIS PARCE QU'ILS NE CHANGEAIENT RIEN.  D-699 */
    var inRate = $("#inRate");
    var inAdmin = $("#inAdmin");
    var outRate = $("#outRate");
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

    /* `emp` et `rev` ont quitte les profils avec leurs curseurs.  D-699 */
    var PRESETS = {
      construction:  { rate: 40, tasks: [5, 5, 4, 3, 3, 2, 6, 1] },
      services:      { rate: 55, tasks: [4, 8, 4, 4, 4, 3, 4, 2] },
      restauration:  { rate: 22, tasks: [3, 4, 6, 3, 2, 5, 1, 4] },
      sante:         { rate: 35, tasks: [3, 5, 8, 3, 2, 4, 1, 3] },
      commerce:      { rate: 28, tasks: [4, 6, 3, 5, 3, 6, 2, 4] },
      manufacturier: { rate: 38, tasks: [6, 5, 3, 6, 5, 3, 5, 1] },
      perso:         { rate: 42, tasks: [4, 6, 3, 3, 2, 3, 3, 2] }
    };

    var lastRoi = {};

    /* LE MONTANT N'EST PAS LE SIEN TANT QU'IL N'A RIEN REGLE.  D-707 */
    var roiRegle = false;

    var impactSpring = new Spring(function (v) {
      var text = fmtImpact(v);
      if (impactEl) impactEl.textContent = text;
      if (!roiRegle) return;
      if (railValue) railValue.textContent = text;
      if (navValue) navValue.textContent = text;
    }, 90, 22);

    /* Le premier geste allume le rail et l'en-tete, une seule fois. */
    function roiRegler() {
      if (roiRegle) return;
      roiRegle = true;
      var text = fmtImpact(impactSpring.value);
      if (railValue) { railValue.removeAttribute("data-vide"); railValue.textContent = text; }
      if (navValue) { navValue.removeAttribute("data-vide"); navValue.textContent = text; }
    }

    function roiUpdate(immediate, depuisMaitre) {
      var rate = Number(inRate.value);
      outRate.textContent = rate.toLocaleString("fr-CA") + " $";

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

      /* LES DEUX PISTES PARTAGENT ORIGINE ET ECHELLE.  D-636 */
      $("#barManual").style.width = totalHours > 0 ? "100%" : "0%";
      $("#barAuto").style.width = totalHours > 0 ? (remaining / totalHours) * 100 + "%" : "0%";
      $("#barManualVal").textContent = fmtHours(totalHours);
      $("#barAutoVal").textContent = fmtHours(remaining);

      lastRoi = {
        taux_horaire: rate + " $",
        heures_recuperees_semaine: fmtHours(saved),
        impact_annuel_total: fmtImpact(impact),
        economies_directes: fmtMoney(direct)
      };
    }

    var announce = $("#roiAnnounce");

    if (inAdmin) {
      inAdmin.addEventListener("input", function () {
        roiRegler();
        repartir(Number(inAdmin.value));
        roiUpdate(false, true);
      });
    }

    $$('input[type="range"]', roiSection).forEach(function (slider) {
      /* Le curseur maitre a son propre `input` juste au-dessus : il
         repartit avant de recalculer. Il garde en revanche le meme
         `change`, donc la meme annonce vocale que les autres. */
      if (slider !== inAdmin) {
        slider.addEventListener("input", function () { roiRegler(); roiUpdate(false); });
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
        roiRegler();
        $$("button", presets).forEach(function (b) { b.setAttribute("aria-pressed", "false"); });
        btn.setAttribute("aria-pressed", "true");
        inRate.value = preset.rate;
        taskFields.forEach(function (field, i) { $("input", field).value = preset.tasks[i]; });
        roiUpdate(false);
      });
    });

    /* LE FORMULAIRE DE COURRIEL EST PARTI.  D-636 */

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

    /* UN SEUL CARTOUCHE POUR LES TREIZE.  D-687 */
    var barre = $("#sectorChrome");
    var barreMetier = barre ? barre.querySelector("em") : null;

    var secteurCourant = null;
    var showSector = function (key) {
      if (!key) return;
      mocks.forEach(function (m) {
        var on = m.dataset.mock === key;
        m.classList.toggle("is-on", on);
        if (on && barreMetier) barreMetier.textContent = m.dataset.metier || "";
      });
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

    /* ================================================================== L'APERCU…  D-672 */
    var LOCAUX = {
      boutique: 1, coiffure: 1, gym: 1, hotel: 1, clinique: 1,
      immobilier: 1, juridique: 1, photo: 1, construction: 1
    };
    var largeMQ = window.matchMedia("(min-width: 64em)");

    function palierPlein() {
      var p = doc.documentElement.getAttribute("data-palier");
      /* Les trois valeurs sont ecrites : un test sur la seule valeur
         « 1 » ne mord plus quand l'attribut passe a « 2 ». Piege 42 */
      return p !== "1" && p !== "2" && p !== "3";
    }
    function vivantPossible() {
      return !reduced.matches && !coarse.matches && largeMQ.matches &&
        palierPlein() && "IntersectionObserver" in window;
    }

    var live = null, cadre = null;
    var minuteurSrc = 0;
    var survole = false, dansLaVue = false, cleVivante = "";

    function batir() {
      if (live) return;
      live = doc.createElement("div");
      live.className = "sec-live";
      live.setAttribute("inert", "");
      cadre = doc.createElement("iframe");
      cadre.className = "sec-live-cadre";
      cadre.setAttribute("loading", "lazy");
      /* PAS de `scrolling="no"` : il pose `overflow: hidden` sur la
         fenetre du document embarque, et `scrollTop` y reste alors
         cloue a zero. Le cadre ne bougerait plus d'un pixel, et rien
         ne le dirait. */
      cadre.setAttribute("title", "Apercu vivant du site de demonstration");
      live.appendChild(cadre);
      cadre.addEventListener("load", prendreLaMain);
      scene.appendChild(live);
      echelle();
    }

    /* LE CADRE FAIT 1440 x 900 EN PROPRE ET SE REDUIT.  D-688 */
    function echelle() {
      if (!live) return;
      var l = scene.clientWidth;
      if (l > 0) live.style.setProperty("--sec-ech", (l / 1440).toFixed(5));
    }
    window.addEventListener("resize", echelle, { passive: true });

    function prendreLaMain() {
      echelle();
      live.classList.add("is-pret");
      scene.classList.add("is-vivant");
    }

    /* IL N'Y A PLUS RIEN A FAIRE DEFILER.  D-681 */

    function eteindre() {
      if (!live) return;
      live.classList.remove("is-pret");
      live.hidden = true;
      scene.classList.remove("is-vivant");
      window.clearTimeout(minuteurSrc);
      /* La page chargee est LIBEREE : un `<iframe>` laisse en place
         garde ses images, ses polices et son ScrollTrigger en
         memoire, et il y en a douze. */
      if (cadre.getAttribute("src")) { cadre.removeAttribute("src"); cleVivante = ""; }
    }

    function allumer(cle) {
      if (!vivantPossible() || !LOCAUX[cle] || !survole || !dansLaVue) { eteindre(); return; }
      batir();
      window.clearTimeout(minuteurSrc);
      if (cleVivante === cle && live.classList.contains("is-pret")) { live.hidden = false; return; }
      live.hidden = true;
      live.classList.remove("is-pret");
      scene.classList.remove("is-vivant");
      minuteurSrc = window.setTimeout(function () {
        if (!survole || !dansLaVue) return;
        cleVivante = cle;
        live.hidden = false;
        cadre.setAttribute("src", "demos-secteurs/" + cle + "/index.html");
      }, 320);
    }

    var grille = preview.closest(".sectors-grid") || preview.parentNode;
    if (grille) {
      grille.addEventListener("pointerenter", function (ev) {
        if (ev.pointerType === "touch") return;
        survole = true;
        if (secteurCourant) allumer(secteurCourant);
      });
      grille.addEventListener("pointerleave", function () { survole = false; eteindre(); });
      /* UN FOCUS CLAVIER RESTITUE LA PLANCHE. Le vivant est inerte :
         si on le laissait pendant qu'on tabule, le visiteur au clavier
         mettrait son anneau de focus sur une planche invisible. */
      grille.addEventListener("focusin", function () { survole = false; eteindre(); });
      doc.addEventListener("aped:secteur", function (ev) { allumer(ev.detail && ev.detail.cle); });
    }

    new IntersectionObserver(function (es) {
      dansLaVue = es[0].isIntersecting;
      if (!dansLaVue) eteindre();
    }, { threshold: 0.2 }).observe(preview);

    doc.addEventListener("visibilitychange", function () { if (doc.hidden) eteindre(); });
    if (reduced.addEventListener) reduced.addEventListener("change", function () { if (reduced.matches) eteindre(); });
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

