/* ============================================================
   APED AGENCE - Mouvement
   Chaque animation ci-dessous a une raison, ecrite au-dessus d'elle.
   Aucune n'est la pour faire joli.

   Regles tenues partout : transform et opacity uniquement, aucun
   ecouteur scroll, tout se coupe sous prefers-reduced-motion.
   ============================================================ */

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

  /* ------------------------------------------------------------
     1. Entree du hero.
     Raison : hierarchie. La plaque, la phrase d'accroche et le
     sous-titre sont deja la au premier rendu ; seuls les boutons
     montent.

     MESURE DU 2026-07-25, ET C'EST LA RAISON DE CE CHANGEMENT :
     `.hero-claim` portait la classe `.rise`, donc `opacity: 0`
     jusqu'a ce que GSAP la releve. Un element a opacite nulle N'EST
     PAS candidat au LCP : le plus grand element de la page n'etait
     donc compte qu'a la fin de son animation, et le LCP tombait a
     620 ms au lieu du premier rendu. Une animation d'entree qui
     retarde la mesure du premier contenu utile ne retarde pas que la
     mesure : elle retarde la LECTURE. Le titre ne s'anime plus.
     ------------------------------------------------------------ */
  /* LE HERO NE S'ANIME PLUS DU TOUT.
     Le titre avait deja ete retire de l'animation en phase 6 : un
     element a opacite nulle n'est pas candidat au LCP. Les boutons
     suivent aujourd'hui, pour la meme raison poussee d'un cran —
     leur etat de depart obligeait a charger GSAP avant le premier
     ecran, donc a garder ses 51 ms de tache sur le chemin du
     chargement. Rien de ce qui est visible au premier ecran ne
     depend plus de la bibliotheque d'animation.
     Ce qu'on perd : une montee de 620 ms sur deux boutons.
     Ce qu'on gagne : la choregraphie entiere sort du chargement. */

  /* ------------------------------------------------------------
     2. Compression du titre.
     Raison : storytelling. L'axe de largeur d'Archivo passe de 125
     a 78 pendant que le hero sort. Le titre se comprime
     physiquement, comme une plaque qu'on met sous presse. C'est le
     moment signature de la page.
     ------------------------------------------------------------ */
  /* La plaque de limaille repond au defilement : quand le hero sort,
     le champ se relache et les grains montent legerement, comme une
     plaque qu'on souleve du banc. Un seul foyer d'attention : le
     mouvement est faible et s'arrete des que la plaque est sortie.
     C'est la meme matiere que le sillon du pointeur, pilotee par une
     autre force. */
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

  /* ------------------------------------------------------------
     3. Filets de section — N1 (orientation) + N2 (signature).
     Raison : hierarchie ET signature. Le filet annonce qu'une bande
     commence, donc il oriente. Et il ne se contente pas de se
     tracer : il s'assemble en grains de la gauche vers la droite,
     puis se RESSOUDE en trait plein. C'est la limaille du hero a
     l'echelle d'un filet, et c'est reconnaissable comme la meme
     idee sans etre une copie.
     ------------------------------------------------------------ */
  /* LES CINQ FILETS DE LA FICHE TECHNIQUE SONT EXCLUS, et c'est la
     consequence directe de la composition d'entree.
     Ils se soudent maintenant DANS la sequence, en CSS, au rythme
     de `--e`. Les laisser ici les faisait retracer une seconde fois
     a l'arrivee de GSAP — soit 1,2 s apres, hors tempo, sur un
     objet deja pose. Ils gardent `data-section-rule` : l'attribut
     sert aussi au filet de section active, qui vit dans `main.js`. */
  $$("[data-section-rule]").forEach(function (rule) {
    if (rule.classList.contains("fiche-rule")) return;
    gsap.fromTo(rule, { scaleX: 0 }, {
      scaleX: 1,
      duration: 0.72,
      ease: "power2.inOut",
      /* L'etat de depart n'est plus dans le CSS : il est pose ICI, et
         `immediateRender: false` garantit qu'il ne l'est qu'au
         moment ou le filet entre en scene. Sinon la bibliotheque,
         chargee tard, effacerait d'un coup douze filets deja
         visibles pour les retracer. */
      immediateRender: false,
      scrollTrigger: {
        trigger: rule,
        /* G1 · ANNONCER. Un filet de seuil part des qu'il ENTRE dans
           l'ecran — 97 % — et pas a 88 % comme les autres. La
           difference fait tout le geste demande : le filet de la
           section suivante se trace AVANT qu'elle arrive, donc il
           l'annonce au lieu de la souligner. Les filets qui ne sont
           pas des seuils gardent 88 % : eux soulignent, c'est leur
           role. */
        start: rule.closest("[data-seuil]") ? "top 97%" : "top 88%",
        once: true,
        onEnter: function () {
          /* Les grains se ressoudent une fois le filet pose. */
          window.setTimeout(function () { rule.classList.add("is-set"); }, 760);
        }
      }
    });
  });

  /* ------------------------------------------------------------
     4. Montee des blocs.
     Raison : storytelling. Les elements arrivent dans l'ordre de
     lecture plutot que tous ensemble. Decalage court : c'est une
     fiche technique, pas un generique de film.
     ------------------------------------------------------------ */
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

  /* ------------------------------------------------------------
     5. Compteurs de la bande de specification.
     Raison : feedback. Un chiffre qui se pose vaut mieux qu'un
     chiffre deja pose : il signale qu'il a ete mesure.
     ------------------------------------------------------------ */
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

  /* ------------------------------------------------------------
     6. LE RAIL DES SERVICES — N1 (orientation) + N2 (signature).

     Une seule timeline pilote LE RAIL ET LA JAUGE, a la meme
     position. C'est la correction du defaut le plus courant du
     defilement horizontal : avec deux ScrollTrigger separes, la
     barre atteint 100 % avant la derniere carte, le visiteur croit
     que c'est fini et il s'en va. Ici la barre n'est pas un
     indicateur DU mouvement, elle EST le mouvement.

     L'index actif n'est pas lu dans le DOM a chaque image : les
     decalages des quatre cartes sont mesures une fois par
     rafraichissement et l'index se deduit de la progression. Lire
     quatre `getBoundingClientRect()` a 60 images par seconde
     forcerait une mise en page par image pour afficher un chiffre.

     Sous 1024 px, AUCUN pin : la piste est une zone a debordement
     native avec accrochage, et un observateur met le compteur a
     jour. Detourner le defilement au telephone est proscrit, et un
     doigt sait deja glisser.
     ------------------------------------------------------------ */
  /* L'ORIENTATION EST DANS `main.js`, PAS ICI, et c'est voulu.
     Ce fichier entier s'arrete net sous `prefers-reduced-motion` :
     y mettre le compteur et le nom du chantier reviendrait a
     supprimer le N1 pour les gens qui ont justement demande moins
     de mouvement. `main.js` tient donc le compteur, la piste
     native, le clavier et les deux boutons ; on ne fait ici que
     REMPLACER LE GESTE — glisser devient descendre.
     ------------------------------------------------------------ */
  var svcApi = window.APED_SVC;
  if (svcApi && window.matchMedia("(min-width: 64em)").matches) {
    var svcScene = svcApi.svc;
    var svcPiste = svcApi.piste;
    var svcRail = svcApi.rail;
    var svcCartes = svcApi.cartes;
    var svcJauge = $("#svcJauge");

    var decalages = [];
    var course = 1;
    var mesurer = function () {
      decalages = svcCartes.map(function (c) { return c.offsetLeft; });
      course = Math.max(1, svcRail.scrollWidth - svcPiste.clientWidth);
      return course;
    };
    mesurer();

    svcScene.classList.add("is-pinned");

    /* L'index ne se lit pas dans le DOM a chaque image : lire quatre
       `getBoundingClientRect()` a 60 images par seconde forcerait une
       mise en page par image pour afficher un chiffre. Les decalages
       sont mesures une fois par rafraichissement, l'index se deduit
       de la progression. */
    var indexPour = function (p) {
      var x = course * p;
      var seuil = svcCartes[0].offsetWidth * 0.5;
      var i = 0;
      for (var k = 0; k < decalages.length; k++) if (decalages[k] <= x + seuil) i = k;
      return i;
    };

    var dernier = 0;
    var st = null;

    var tlSvc = gsap.timeline({
      scrollTrigger: {
        trigger: svcScene,
        /* Le haut de la scene se cale sous la barre, jamais sous le
           bord de l'ecran : sinon le tableau de bord de la section
           passe derriere la navigation pendant tout l'epinglage. */
        start: function () { var n = $(".nav"); return "top " + (n ? n.offsetHeight : 56); },
        end: function () { return "+=" + mesurer(); },
        pin: true,
        scrub: 0.6,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onRefresh: function (self) { st = self; },
        onUpdate: function (self) {
          var i = indexPour(self.progress);
          if (i !== dernier) { dernier = i; svcApi.poser(i); }
        }
      }
    });
    /* UNE SEULE timeline pour le rail ET la jauge, a la meme
       position. Avec deux ScrollTrigger separes, la barre atteint
       100 % avant la derniere carte : le visiteur croit que c'est
       fini et il s'en va. Ici la barre n'indique pas le mouvement,
       elle EST le mouvement. */
    tlSvc.to(svcRail, { x: function () { return -course; }, ease: "none" }, 0);
    if (svcJauge) tlSvc.to(svcJauge, { scaleX: 1, ease: "none" }, 0);

    /* Les boutons et les fleches visent la position de DEFILEMENT de
       la carte demandee : ils pilotent exactement le meme mecanisme
       que la molette, jamais une seconde source de verite. */
    svcApi.aller = function (i) {
      if (!st) return;
      i = Math.max(0, Math.min(svcCartes.length - 1, i));
      window.scrollTo({
        top: st.start + (st.end - st.start) * (decalages[i] / course),
        behavior: reduced.matches ? "auto" : "smooth"
      });
    };
  }

  /* ------------------------------------------------------------
     7. Defilement interne des captures de projet.
     Raison : storytelling. Chaque image est la page d'accueil
     complete du site livre. Elle defile du haut jusqu'en bas
     pendant que la bande traverse l'ecran : le visiteur voit le
     site entier sans quitter la page.
     ------------------------------------------------------------ */
  /* HISTORIQUE DES DEUX ERREURS, mesurees toutes les deux.

     Phase 3 : plage de 1 075 px, l'image filait a 2,74 px pour 1 px
     de doigt. Trop rapide, illisible.

     Phase 5 : bande EPINGLEE, plage de 3 200 px par projet pour
     derouler la page cliente jusqu'en bas. Lisible, mais la section
     passait a 20 588 px, soit 60 % de la hauteur totale du site, et
     traverser un seul projet coutait 4 044 px de defilement. Corriger
     la vitesse en allongeant la course a produit le defaut inverse.

     PHASE 6 — l'arbitrage est ailleurs : on n'a pas besoin de voir la
     page cliente EN ENTIER. Ce qui se juge, c'est le haut. Donc :
     · le pin saute. Il coutait 3 200 px par projet et c'est lui, pas
       la vitesse, qui donnait la sensation de ne plus avancer ;
     · la course de l'image est plafonnee a 0,9 hauteur de cadre, soit
       le premier ecran du site client plus un peu de la suite ;
     · la plage de defilement est la traversee NATURELLE de la bande,
       donc elle n'ajoute pas un seul pixel a la page.
     Resultat mesure plus bas dans REFONTE-CHECKLIST.md. */
  /* LE DEFILEMENT INTERNE A ETE RETIRE, ET C'EST LE CHANTIER.
     Il etait pilote par la position de la page : la capture bougeait
     sans que le visiteur l'ait demande, il ne pouvait ni l'arreter
     ni la reprendre, et le HAUT du site — ce qui se juge — n'etait
     net qu'une fraction de seconde. Un mouvement qu'on subit n'est
     pas une demonstration.
     Le parcours vit maintenant dans `js/main.js`, sur `scrollTop`,
     et il ne demarre que sur intention : survol prolonge, clic,
     Entree, ou defilement dans le cadre. Il fallait qu'il soit dans
     `main.js` parce que ce fichier-ci ne s'execute pas sous
     `prefers-reduced-motion` : perdre le mouvement ne doit jamais
     faire perdre l'acces au contenu.

     Ce qui reste ici est la seule chose qui appartient vraiment a la
     choregraphie : N2 · la capture ne s'affiche pas d'un bloc, elle
     se decouvre du haut vers le bas comme une page qui se charge.
     380 ms, une seule fois, le cadre garde sa place, donc aucun
     decalage de mise en page. */
  $$(".shot").forEach(function (frame) {
    var bande = frame.closest(".project") || frame;
    gsap.fromTo(frame,
      { clipPath: "inset(0 0 100% 0)" },
      {
        clipPath: "inset(0 0 0% 0)",
        duration: 0.38,
        ease: "power2.out",
        scrollTrigger: { trigger: bande, start: "top 82%", once: true }
      }
    );
  });

  /* ------------------------------------------------------------
     8. Ligne du processus.
     Raison : storytelling. La ligne se trace d'etape en etape :
     elle represente le projet qui avance.
     ------------------------------------------------------------ */
  /* LE FIL SE REMPLIT, station par station, et sa portion pleine
     EST la progression : l'orientation ne peut pas mentir parce
     qu'elle n'est pas un indicateur pose a cote du mouvement, elle
     est le mouvement lui-meme.
     Etat au repos = fil plein. Sans script, le parcours se lit
     entier : c'est un chemin, pas une animation. */
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

  /* ------------------------------------------------------------
     8bis. LES QUATRE COMPOSANTS DU PARCOURS — N2.
     Chacun se CONSTRUIT a l'ecran, et chacun montre ce que son
     etape produit : la fiche d'appel s'ecrit ligne par ligne, la
     maquette s'assemble en limaille — les blocs arrivent decales et
     se reprennent, exactement le motif du hero a l'echelle d'une
     mise en page —, le code se pose, le site passe en ligne.
     Une seule fois, jamais en boucle : ce sont des preuves, pas des
     animations d'attente.
     ------------------------------------------------------------ */
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

  /* ------------------------------------------------------------
     9. Piste du comparatif — N2.
     Raison : feedback, et surtout LECTURE. Le trait du temps actuel
     se trace en premier, puis le trait d'accent le recouvre sur la
     part qui reste une fois automatise. Ce qui depasse est l'ecart :
     le visiteur n'a aucune soustraction a faire, il la VOIT se
     faire. Une piste au lieu de deux, un geste au lieu d'un tableau.
     ------------------------------------------------------------ */
  /* Les LONGUEURS ne sont plus posees ici : elles sont dans le
     markup, en variables CSS. Ce script ne fait plus que TRACER, et
     c'est la difference entre un tableau qui a besoin de JavaScript
     pour exister et un tableau qui a besoin de JavaScript pour
     s'animer. Sans script, les six pistes sont deja a leur
     longueur. */
  $$(".vs-row").forEach(function (row) {
    var barM = $('[data-bar="manual"]', row);
    var barA = $('[data-bar="auto"]', row);
    if (!barM || !barA) return;
    gsap.timeline({ scrollTrigger: { trigger: row, start: "top 90%", once: true } })
      .fromTo(barM, { scaleX: 0 }, { scaleX: 1, duration: 0.52, ease: "power2.out" })
      .fromTo(barA, { scaleX: 0 }, { scaleX: 1, duration: 0.42, ease: "power3.out" }, "-=0.18");
  });

  /* ------------------------------------------------------------
     9bis. LE SCHEMA DE L'ECART — N2.
     Les deux journees se tracent l'une apres l'autre sur la meme
     regle, puis le pont enjambe la difference. L'ordre porte
     l'argument : d'abord ce que ca coute, ensuite ce que ca
     deviendrait, et seulement apres, ce qu'on recupere.
     Etat au repos = forme finale : le schema est lisible a l'arret,
     sans script et sous mouvement reduit.
     ------------------------------------------------------------ */
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

  /* ------------------------------------------------------------
     10. Titres de section — N2.
     Raison : signature. Le titre ne se tape pas lettre par lettre et
     ne se devoile pas mot par mot : il se DECOUVRE d'un balayage
     ligne par ligne, comme la matiere qu'on degage. 60 ms d'ecart,
     300 ms au total : le texte est lisible avant que l'oeil ait fini
     d'arriver dessus. C'est la limite que ce site s'impose — un
     titre qu'il faut attendre pour lire est un titre casse.
     ------------------------------------------------------------ */
  function couperEnLignes(el) {
    var mots = el.textContent.split(/\s+/).filter(Boolean);
    if (mots.length < 2) return null;
    el.textContent = "";
    var frag = document.createDocumentFragment();
    mots.forEach(function (m, i) {
      /* L'espace est un noeud de texte ENTRE les boites, jamais
         dedans : dans une boite `inline-block` il ne se replie pas
         en fin de ligne et decale le premier mot de la ligne
         suivante. Le texte accessible reste identique au caractere. */
      if (i) frag.appendChild(document.createTextNode(" "));
      var s = document.createElement("span");
      s.className = "mot";
      s.textContent = m;
      frag.appendChild(s);
    });
    el.appendChild(frag);
    /* Les mots sont regroupes par LIGNE reelle, mesuree apres mise en
       page, puis CHAQUE LIGNE EST ENVELOPPEE dans une boite.

       Ce dernier point n'est pas cosmetique. Sans enveloppe, le
       balayage s'appliquait a chaque mot separement : a mi-course, on
       lisait « selo  le métie » — des mots coupes en plein milieu
       d'une lettre. Capture du 2026-07-25 sur telephone. Une lettre
       tronquee ne se lit pas comme un balayage, elle se lit comme un
       bug d'affichage, et c'est exactement le reproche fait au reste
       du site. Avec l'enveloppe, c'est la LIGNE qui se decouvre. */
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
      /* Une espace entre les boites de ligne. Elle ne se voit pas —
         les boites sont en bloc — mais sans elle le texte accessible
         devient « Le style changeselon le metier ». Le titre lu par
         une synthese vocale doit etre le meme, au caractere pres,
         que celui qui est affiche. */
      bloc.appendChild(b);
      bloc.appendChild(document.createTextNode(" "));
      return b;
    });
    el.textContent = "";
    el.appendChild(bloc);
    return boites;
  }

  /* Le decoupage est PARESSEUX, un titre a la fois, au moment ou il
     entre par le bas. Fait a l'initialisation pour les dix titres
     d'un coup, il coutait dix mises en page forcees dans la tache de
     demarrage — mesure : la premiere tache longue passait de 216 a
     plus de 300 ms. Ici chaque titre paie sa propre mesure, hors du
     chemin critique, et jamais deux dans la meme image. */
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

  /* ------------------------------------------------------------
     11. Blocs qui se reprennent — N2.
     Raison : signature. Les blocs n'arrivent pas tous du bas : ils
     arrivent DECALES lateralement, en alternance, et se reprennent
     a leur place. C'est le meme geste que les grains du hero quand
     la pointe les relache, a l'echelle d'un bloc de mise en page.
     ------------------------------------------------------------ */
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

  /* ------------------------------------------------------------
     12. Frise du processus — N2, defilement lateral.
     Raison : storytelling. La ligne ne se trace pas a cote des
     etapes : elle les POUSSE en place. Chaque etape entre par la
     gauche au moment ou la ligne l'atteint, donc le mouvement
     lateral porte l'information « le projet avance », il ne decore
     pas. Aucun pin, aucun detournement du defilement.
     ------------------------------------------------------------ */
  /* La frise horizontale a ete remplacee par le parcours vertical
     de la section 8 : elle poussait les quatre etapes lateralement,
     ce qui portait bien l'information « le projet avance », mais
     elle ne pouvait pas repondre a « a quelle etape suis-je ». Le
     fil, lui, y repond par construction. */

  /* ------------------------------------------------------------
     12bis. LES QUATRE PREUVES DE L'AGENCE — N2.
     Chaque preuve se fabrique au moment ou on la lit. Les deux
     barres du prix partent ENSEMBLE et arrivent ENSEMBLE : c'est
     leur egalite qui est l'argument, donc elles ne peuvent pas se
     tracer l'une apres l'autre.
     Etat au repos = preuve finie : elles se lisent toutes sans
     script et sous mouvement reduit.
     ------------------------------------------------------------ */
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

  /* ------------------------------------------------------------
     13. Programme de reference — N2.
     Raison : preuve. Le filet qui relie les trois temps se trace en
     grains d'un temps a l'autre : c'est le dossier qui avance. Puis
     les six barres du bareme se posent, de la plus courte a la plus
     longue, et la derniere va jusqu'au bord.
     ------------------------------------------------------------ */
  var filetRef = $(".referral-line b");
  if (filetRef) {
    gsap.fromTo(filetRef, { scaleX: 0 }, {
      scaleX: 1,
      ease: "none",
      scrollTrigger: { trigger: ".referral-steps", start: "top 82%", end: "bottom 62%", scrub: 0.5 }
    });
  }
  /* Les trois PREUVES. Le bareme en regle graduee a ete retire —
     il apprenait au visiteur a calculer vers le bas. Ce qui reste
     est le mecanisme : le texto part, la signature se trace, le
     virement tombe. Etat au repos = preuve finie. */
  /* ============================================================
     `immediateRender: false` SUR ONZE TWEENS — CORRECTIF DU
     2026-07-30, ET C'EST LA REGLE 0bis QUI N'AVAIT PAS ETE APPLIQUEE
     JUSQU'AU BOUT.

     CE QUI A ETE MESURE. `tools/contraste-arret.mjs`, 61 positions
     d'arret : sept elements de TEXTE restaient a 0,10 ou 0,12
     d'opacite, definitivement, chez un visiteur qui defile
     normalement. Les trois etats du programme de reference
     — « Envoyé », « Signé », « Encaissé » —, la bulle de texto, les
     deux lignes d'avis, et la ligne de suite du parcours. Contrastes
     releves : 1,15:1 a 1,36:1. Illisible, et permanent.

     POURQUOI. Un `fromTo` dans une timeline rend son etat de DEPART
     immediatement, a la creation de la timeline — c'est le
     comportement par defaut de GSAP, et c'est ce qu'on veut pour une
     revelation. Mais la revelation n'arrivait jamais : la section 10
     est loin dans le document, et les sections traversees portent
     `content-visibility: auto`. A la creation, leur hauteur RESERVEE
     n'est pas leur hauteur reelle, donc la position de declenchement
     calculee par ScrollTrigger tombait a cote. Le declencheur ne
     partait pas, et le texte restait a son etat de depart pour
     toujours. Attendre plus longtemps n'y changeait rien : il n'y
     avait rien a attendre.

     CE QU'ON FAIT, ET CE QU'ON NE FAIT PAS. On applique la regle
     0bis : l'etat de repos est la forme FINALE, et l'etat de depart
     n'est pose qu'au moment ou l'animation part. Un declencheur qui
     ne part pas ne coute alors plus qu'une animation manquante, au
     lieu de coûter la lisibilite. Ce n'est PAS un correctif de la
     cause — les positions de declenchement restent perimees par
     `content-visibility`, et c'est note comme ouvert dans CLAUDE.md.
     C'est le correctif du DEGAT, et il est complet : le meme outil
     rend maintenant zero.

     A/B en worktree contre le commit precedent : 8 echecs avant, 0
     apres, meme densite d'echantillonnage.
     ============================================================ */
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

  /* ------------------------------------------------------------
     13bis. « Ce qui arrive apres » — N2.
     Le filet traverse les trois temps au defilement, exactement
     comme celui du programme de reference : c'est le meme geste
     pour la meme idee — un dossier qui avance d'un temps a l'autre.
     ------------------------------------------------------------ */
  var filetSuite = $(".suite-fil b");
  if (filetSuite) {
    gsap.fromTo(filetSuite, { scaleX: 0 }, {
      scaleX: 1,
      ease: "none",
      scrollTrigger: { trigger: ".suite-temps", start: "top 84%", end: "bottom 66%", scrub: 0.5 }
    });
  }

  /* ------------------------------------------------------------
     14. Recalcul apres chargement des images.
     Les captures de projet mesurent plusieurs milliers de pixels :
     tant qu'elles ne sont pas chargees, leur hauteur est fausse.
     ------------------------------------------------------------ */
  window.addEventListener("load", function () { ScrollTrigger.refresh(); });
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
  }

})();

