/* ============================================================
   APED AGENCE — LA LANGUE DE MOUVEMENT
   ------------------------------------------------------------
   PHASE 8. Ce fichier ne contient pas quarante animations : il
   contient QUATRE VERBES, declines partout.

   Le motif de depart est celui du hero, ecrit dans `limaille.js` :
   une matiere dure qui tient une forme nette sous tension, qui
   s'ecarte sous la pointe, et qui se reprend d'elle-meme.

   Les quatre verbes en sont la grammaire :

   V1 · DEGAGER   Une forme deja la se decouvre sous une arete
                  FRANCHE qui balaye. clip-path, jamais un fondu.
                  « la matiere qu'on degage »

   V2 · S'ALIGNER Les blocs arrivent DECALES lateralement, en
                  alternance, et se reprennent a leur place. Aucun
                  depassement, jamais : zeta = 1, comme les grains.
                  « les grains que la pointe relache »

   V3 · SOUDER    Un filet apparait d'abord en TRAME DE GRAINS,
                  puis se ressoude en trait plein.
                  « la limaille a l'echelle d'un filet »

   V4 · CRAN      Un etat ne fond pas dans un autre : il roule d'un
                  cran. Odometre, index, bascule.
                  « tout s'encliquette »

   LA REGLE D'ADMISSION. Avant d'ajouter un mouvement, il faut
   pouvoir dire lequel des quatre verbes il est. Si la reponse
   n'existe pas, le mouvement ne se fait pas, meme si l'effet est
   beau. C'est ce qui separe une signature d'un catalogue.

   CE QUI N'EST PAS ICI, ET POURQUOI.
   Ce fichier s'arrete net sous `prefers-reduced-motion`, comme
   `motion.js`. Tout ce qui repond a « ou je suis, combien il en
   reste » — odometres, filet de section active, compteur du rail —
   vit donc dans `main.js`, qui s'execute toujours. Perdre le
   mouvement ne doit jamais faire perdre une information.

   DISCIPLINE TENUE PARTOUT :
   · sur le fil du defilement, transform et opacity uniquement ;
   · aucun etat de depart dans le CSS — l'etat au repos est
     toujours la forme FINALE, et c'est le script qui pose le
     depart, avec `immediateRender: false` ;
   · tout decoupage de texte est PARESSEUX : jamais au chargement.
   ============================================================ */

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

  /* ============================================================
     LE BUDGET DE DEGRADATION — trois paliers, et l'ordre de chute
     est ecrit avant d'en avoir besoin.

     POURQUOI IL EXISTE. Tout ce fichier est mesure sur une machine
     de bureau. Un telephone d'entree de gamme a un budget de
     peinture sans commune mesure, et le poste le plus cher d'ici
     n'est pas une animation spectaculaire : ce sont les 227 spans
     de mots dont l'opacite est PEINTE. Decouvrir ca en production
     serait une faute ; le prevoir est le travail.

     LE PRINCIPE : ce qui tombe en premier est ce qui coute le plus
     pour ce qu'il apporte le moins. L'ordre est donc l'inverse
     exact de la hierarchie N1/N2/N3, et il n'est jamais improvise.

     PALIER 0 — PLEIN. Tout.

     PALIER 1 — ALLEGE. Declencheur STATIQUE, connu des
     l'initialisation :
       · largeur < 64em, OU
       · pointeur grossier, OU
       · `navigator.hardwareConcurrency` <= 4, OU
       · `navigator.deviceMemory` <= 4.
     Tombe, dans cet ordre — que du N3, aucune information perdue :
       1. parallaxe a la souris de la vitrine
       2. vitesses differenciees des fiches de projet
       3. etiquette contextuelle de la pointe
       4. fleche qui sort du cadre (300 ms d'animation par survol)
       5. DECOUPAGE PAR MOT DES CHAPOS — le poste le plus cher
       6. balayage des 25 sous-titres

     PALIER 2 — MINIMAL. Declencheur MESURE, pas devine : la
     frequence d'images mediane, relevee sur 90 images d'un
     defilement REEL, descend sous 50 i/s. Tombe EN PLUS — du N2,
     la signature s'appauvrit mais rien n'est perdu :
       7. cascade par lettre des boutons -> bascule d'un bloc
       8. recomposition des secteurs -> changement net
       9. soudure des filets de liste -> filets pleins d'emblee
      10. FLIP de la FAQ -> comportement natif
      11. degagement des modales -> apparition

     PALIER 3 — `prefers-reduced-motion`. Ce fichier ne s'execute
     pas du tout, ni `motion.js`.

     JAMAIS SACRIFIE, A AUCUN PALIER, parce que tout ca vit dans
     `main.js` qui s'execute toujours : curseur du rail, odometres,
     filet de section active, barre de lecture, compteur des
     chantiers, etape du parcours, jauge des cadres de projet.
     L'orientation n'est pas un budget, c'est un plancher.

     L'ESCALADE EST A SENS UNIQUE. Un palier ne redescend jamais :
     une page qui reactive ses animations des que la machine
     respire produit un scintillement pire que le probleme qu'elle
     corrige.
     ============================================================ */
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
  }

  /* ------------------------------------------------------------
     LA MESURE. On n'echantillonne QUE pendant un defilement reel :
     hors defilement, `requestAnimationFrame` est ralenti par le
     navigateur lui-meme et rendrait un verdict faux.
     90 images, mediane des intervalles, un seul verdict, jamais
     rejoue. Au-dela de 20 ms d'intervalle median — soit moins de
     50 i/s — on monte au palier 2.
     ------------------------------------------------------------ */
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

  /* ============================================================
     LE TRAVAIL PREPARATOIRE SE FAIT PENDANT LES TEMPS MORTS.

     MESURE DU 2026-07-26 : le seul recul de la phase 8 etait une
     tache de ~60 ms pendant la traversee, absente de la version
     d'avant sur deux series sur quatre. Elle venait du decoupage
     PARESSEUX : decouper un chapo en mots force une mise en page,
     et ce decoupage avait lieu au moment ou le paragraphe entre a
     l'ecran — c'est-a-dire exactement pendant qu'on defile.

     Le paresseux etait la bonne idee au mauvais moment. Ce qu'il
     fallait eviter, c'est de payer au CHARGEMENT ; ce n'est pas une
     raison de payer au DEFILEMENT, qui est le pire moment de tous.

     `requestIdleCallback` donne le bon : le navigateur nous reveille
     quand il n'a rien de mieux a faire, avec un budget de temps
     qu'on respecte. On decoupe UN objet par reveil tant qu'il reste
     plus de 6 ms, puis on rend la main. Sur un navigateur sans
     `requestIdleCallback` — Safari jusqu'a recemment — on retombe
     sur un `setTimeout` espace, ce qui n'est pas aussi bon mais
     reste hors du chemin du defilement.
     ============================================================ */
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

  /* ============================================================
     0. FLIP MAISON — la mecanique, pas le code.

     GSAP publie un plugin Flip qui fait exactement ca. Il n'est
     pas dans `js/vendor/` et l'ajouter couterait une requete et
     ~20 Ko pour deux usages. La mecanique tient en quinze lignes :
     on mesure AVANT, on laisse la mise en page changer, on mesure
     APRES, on pose la transformation inverse, et on l'annule.

     C'est la regle de la phase : on prend la mecanique, on jette
     le code.
     ============================================================ */
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

  /* ============================================================
     0bis. LES DOUZE FRONTIERES.

     LE PROBLEME QUE CE BLOC RESOUT. Le site avait cinquante et un
     traitements A L'INTERIEUR des sections et RIEN entre elles :
     les douze sections se succedaient, point. Une traversee se
     lisait donc comme douze blocs empiles, pas comme un mouvement.

     CE QU'ON N'A PAS FAIT, ET POURQUOI. On n'a pas pose douze
     separateurs. Un trait pose douze fois FABRIQUE les blocs qu'on
     veut supprimer. Ce qui donne la continuite, c'est qu'un meme
     objet traverse et se transforme — le seuil — et que le meme
     franchissement declenche partout les memes verbes.

     QUATRE GESTES PAR FRONTIERE, JAMAIS CINQ :
     · G1 · SOUDER  — le filet du seuil s'assemble en grains des
       qu'il entre dans l'ecran, donc il ANNONCE la section avant
       qu'elle arrive. Il est dans `motion.js`, avec les autres
       filets : c'est le meme objet, il n'a pas a etre traite deux
       fois.
     · G2 · CRAN    — le numero roule. Il est dans `main.js` : c'est
       du N1, il survit au mouvement reduit et a tous les paliers.
     · G3 · DEGAGER — le nom du seuil se decouvre sous une arete
       franche, dans le sens de lecture. Ici.
     · G4           — UN geste propre a la frontiere, nomme dans
       `data-verbe`, argumente dans le document en face du seuil.
       Ici aussi.

     AUCUN PIN, AUCUN DETOURNEMENT DE MOLETTE, AUCUN SCRUB
     D'OPACITE. Tout ce qui suit est declenche une fois et se
     termine tout seul en moins de 500 ms : une frontiere ne retient
     jamais un visiteur presse. La seule propriete scrubbee du site
     reste ce qui ne peut rendre aucun texte illisible.

     LE SENS DE BALAYAGE N'EST JAMAIS DECORATIF. Il est lu dans
     `data-sens` et il suit ce que l'arete decouvre : haut vers bas
     pour une page, un panneau, une capture ; gauche vers droite
     pour un titre, un libelle, un filet.
     ============================================================ */
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

    function auFranchissement(seuil, quand, faire) {
      var st = ScrollTrigger.create({
        trigger: seuil,
        start: quand,
        once: true,
        onEnter: faire
      });
      jetables.push(st);
      return st;
    }

    SEUILS.forEach(function (seuil) {
      var sens = seuil.getAttribute("data-sens") || "droite";
      var verbe = seuil.getAttribute("data-verbe");
      var cible = seuil.getAttribute("data-cible");
      var section = seuil.closest("section") || seuil.parentNode;

      /* ---------- G3 · DEGAGER — le nom du seuil ----------
         Le nom est un LIBELLE : il se lit de gauche a droite, quel
         que soit le sens du geste propre a la frontiere. Le sens de
         lecture appartient a ce qu'on decouvre, pas au voisinage. */
      var nom = $(".seuil-nom", seuil);
      if (nom) {
        gsap.fromTo(nom,
          { clipPath: ARETE.droite[0] },
          {
            clipPath: ARETE.droite[1],
            duration: 0.3,
            ease: "power2.out",
            immediateRender: false,
            scrollTrigger: { trigger: seuil, start: "top 94%", once: true }
          }
        );
      }

      /* ---------- G4 · LE GESTE PROPRE A LA FRONTIERE ----------
         PALIER 2 : il tombe. Les trois autres restent, donc la
         frontiere reste lisible — filet, numero, nom — elle cesse
         seulement d'etre remarquable. C'est exactement l'ordre de
         chute du budget : ce qui coute le plus pour ce qu'il
         apporte le moins part en premier. */
      if (PALIER >= 2) return;

      if (verbe === "volet") {
        /* V1 · DEGAGER, a l'echelle de la bande.
           C'est ICI que le fond passe du ciment a l'encre, et il y
           passe par une ARETE FRANCHE qui balaye — jamais par un
           fondu. La bande est deja peinte au repos : on ne fait que
           la decouvrir, donc rien ne clignote si le script arrive
           en retard.
           `willChange` puis `clearProps` : la bande est pleine
           largeur, on ne laisse pas une couche de composition de
           cette taille en place pour le reste de la visite. */
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

      if (verbe === "degager" && cible) {
        /* V1 · DEGAGER, sur ce que la section a de plus concret :
           sa premiere preuve. Une seule cible, jamais la section
           entiere — degager une section entiere reviendrait a
           poser un rideau devant du texte deja lisible. */
        var el = $(cible, section);
        if (el) {
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

      if (verbe === "aligner" && cible) {
        /* V2 · S'ALIGNER. Les blocs arrivent DECALES lateralement,
           en alternance, et se reprennent a leur place.
           `power2.out` et rien d'autre : zeta = 1, aucun
           depassement, jamais. Un rebond ici contredirait la
           matiere du site — la limaille ne rebondit pas.
           `transform` seul, donc zero paint. */
        var blocs = $$(cible, section);
        if (blocs.length) {
          var t3 = gsap.fromTo(blocs,
            { x: function (i) { return i % 2 ? 26 : -26; } },
            {
              x: 0,
              duration: 0.42,
              ease: "power2.out",
              stagger: 0.05,
              immediateRender: false,
              clearProps: "transform",
              scrollTrigger: { trigger: blocs[0], start: "top 88%", once: true }
            }
          );
          jetables.push(t3);
        }
      }

      if (verbe === "souder") {
        /* V3 · SOUDER, en long. Le filet de ce seuil se soude plus
           lentement que les autres et sur toute la largeur de
           l'ecran : la methode se termine, on signe. Une seule
           frontiere a le droit de faire ca, sinon ce n'est plus une
           signature, c'est une habitude. */
        seuil.classList.add("seuil-soudure-longue");
        auFranchissement(seuil, "top 96%", function () {
          var filet = $(".seuil-filet", seuil);
          if (!filet) return;
          filet.classList.add("en-soudure-longue");
          window.setTimeout(function () {
            filet.classList.remove("en-soudure-longue");
          }, 860);
        });
      }

      if (verbe === "cran" && cible) {
        /* V4 · CRAN, sur le seul argument de la section : un
           chiffre. On reutilise l'odometre de `main.js` — il y en a
           UN sur ce site, et c'est deja celui du rail, du
           calculateur et des compteurs.

           IL ROULE D'UN BOUT DU BAREME A L'AUTRE, pas de zero. Le
           programme de reference commence a 500 $ et plafonne a
           5 000 $ : faire rouler le chiffre de l'un a l'autre MONTRE
           l'etendue au lieu de l'ecrire. Un roulement depuis zero
           n'aurait rien dit — zero n'est pas une valeur du bareme.

           La valeur d'arrivee est lue DANS LE DOCUMENT : le contenu
           reste la seule source, le script ne la republie pas. */
        auFranchissement(seuil, "top 74%", function () {
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

  /* ============================================================
     1. LES LETTRES — V4 · CRAN, sur tous les boutons du site.

     TRADUCTION DU COMPOSANT FOURNI. L'original fait s'illuminer
     les lettres une a une, avec un balayage lumineux qui monte du
     bas, et les deforme au flou pendant le focus. Ce qu'on garde :
     la CASCADE PAR CARACTERE, le BALAYAGE, le CHANGEMENT D'ETAT.
     Ce qu'on jette : le rayon 24 px, les dix ombres internes, les
     degrades, le flou, le halo colore.

     · le halo devient une INVERSION DE CONTRASTE. Les lettres ne
       s'eclairent pas, elles BASCULENT — encre sur ciment devient
       ciment sur encre — et elles basculent une par une, dans
       l'ordre de lecture, au moment ou le remplissage les depasse ;
     · le balayage devient un APLAT A ARETE FRANCHE qui part du
       filet du bas et grandit vers la droite : le filet de 2 px au
       repos EST la trace de ce remplissage ;
     · le flou du focus devient une COMPRESSION sur l'axe de
       largeur — la plaque passe sous la presse. transform pur,
       donc zero cout de mise en page et zero perte de contraste.

     POURQUOI LE REPOS N'EST PAS GRIS. L'original part de lettres
     a 53 % de blanc. Un libelle de bouton delave au repos, c'est
     un echec de contraste permanent echange contre une animation
     de survol. Ici le repos est l'encre pleine ; c'est la BASCULE
     qui cascade, pas l'allumage.

     DECOUPAGE PARESSEUX. Vingt-huit boutons decoupes au chargement
     font environ 560 elements de plus dans la premiere mise en
     page. Chaque bouton paie donc son propre decoupage, au premier
     survol ou au premier focus, et une seule fois.
     ============================================================ */
  function decouper(btn) {
    if (btn.dataset.lettres) return;
    btn.dataset.lettres = "1";

    var noeuds = Array.prototype.slice.call(btn.childNodes);
    var index = 0;

    noeuds.forEach(function (n) {
      /* UN ELEMENT IMBRIQUE COMPTE COMME UNE LETTRE, et c'est la
         troisieme correction mesuree sur ce composant.

         Trois boutons du site portent un morceau de libelle dans un
         element a eux : `<b class="nav-refer-num">5 000 $</b>` dans
         « Référez, gagnez », par exemple. Le decoupage ne traitait
         que les NOEUDS DE TEXTE : ces morceaux-la gardaient donc
         leur couleur d'origine et restaient en encre pendant que
         l'aplat d'encre passait dessous. Mesure du 2026-07-26 par
         `tools/contraste-survol.mjs` : 2,13:1 sur `.nav-refer`,
         c'est-a-dire un montant de 5 000 $ qui disparait au survol
         du bouton qui sert a le gagner.

         Un element imbriqué recoit donc la classe `.l` : il bascule
         comme une lettre, en un seul bloc, au moment ou l'arete
         passe sur lui. L'icone, elle, est exclue — elle a deja son
         propre traitement. */
      if (n.nodeType === 1) {
        if (n.tagName.toLowerCase() === "svg") return;
        if (n.classList.contains("l") || n.classList.contains("lettres")) return;
        n.classList.add("l");
        return;
      }
      if (n.nodeType !== 3) return;
      var texte = n.nodeValue;
      if (!texte.trim()) return;

      /* LES LETTRES VIVENT DANS UNE SEULE BOITE, et c'est une
         CORRECTION DE BOGUE MESUREE, pas une precaution.

         `.btn` est un `inline-flex` avec `gap: 1.5rem` et
         `justify-content: space-between`. Poser les lettres
         directement dans le bouton en faisait autant d'ELEMENTS
         FLEXIBLES : vingt-quatre lettres recevaient vingt-trois
         fois 24 px d'ecart. Mesure du 2026-07-26 sur
         « Démarrer votre projet » : 216,97 px avant decoupage,
         643,58 px apres, soit +426 px. La rangee de boutons du
         hero passait a la ligne, la fiche technique descendait, et
         le CLS de la page montait a 0,1155 au premier survol.

         Avec l'enveloppe, le bouton garde EXACTEMENT deux elements
         flexibles — le libelle et l'icone — donc exactement la
         mise en page qu'il avait avant. */
      var boite = document.createElement("span");
      boite.className = "lettres";

      var frag = document.createDocumentFragment();
      for (var i = 0; i < texte.length; i++) {
        var c = texte[i];
        /* Les blancs restent des NOEUDS DE TEXTE entre les boites,
           et ils sont recopies AU CARACTERE PRES — pas normalises
           en une espace. Deux raisons, verifiees par
           `tools/langue-check.mjs` :
           dans une boite `inline-block` un blanc ne se replie pas
           en fin de ligne et decale le mot suivant ; et surtout le
           texte lu par une synthese vocale doit rester identique,
           caractere pour caractere, a celui d'avant le decoupage.
           Normaliser « \n        Démarrer » en « Démarrer »
           changeait le nom accessible de quinze boutons. */
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
      /* Le nombre de lettres pilote la duree totale de la cascade :
         un libelle de six lettres et un libelle de vingt-quatre ne
         peuvent pas prendre le meme temps par lettre sans que le
         second traine. */
      btn.style.setProperty("--n", index);
      boite.appendChild(frag);
      n.parentNode.replaceChild(boite, n);
    });

    positionner(btn);
  }

  /* ------------------------------------------------------------
     LE DECALAGE SUIT LA POSITION, PAS L'INDICE — et c'est la
     deuxieme correction de bogue mesuree sur ce composant.

     Premiere version : le decalage de la lettre i valait
     i / n * 230 ms, et l'arete de l'aplat traversait le bouton en
     230 ms. Les deux ne se rencontrent jamais, pour deux raisons
     qui s'additionnent :
     · l'indice ne compte pas les espaces, la position si ;
     · le libelle n'occupe pas toute la largeur du bouton — il y a
       un rembourrage de 18 px de chaque cote, un ecart de 24 px et
       une icone a droite. L'arete atteint donc la fin du LIBELLE
       bien avant la fin du BOUTON.
     Mesure du 2026-07-26 par `tools/contraste-survol.mjs`, horloge
     etiree d'un facteur 10 : les lettres de droite basculaient
     jusqu'a 40 % de la course APRES avoir ete recouvertes, ce qui
     donnait 3,63:1 sur le bouton fantome et 1,86:1 sur le primaire.
     Sous le seuil de 4,5:1, donc illisible, donc un defaut.

     Chaque lettre porte desormais `--p`, sa position horizontale
     RELLE dans le bouton, entre 0 et 1. Son basculement se declenche
     a `--p * 230 ms`, c'est-a-dire exactement quand l'arete passe
     sur elle. Il n'y a plus d'ecart possible, quel que soit le
     libelle, la police ou la largeur.

     UNE SEULE MISE EN PAGE FORCEE : on LIT toutes les positions,
     puis on ECRIT toutes les variables. Lire et ecrire en
     alternance couterait une mise en page par lettre.
     ------------------------------------------------------------ */
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

  /* LE DECOUPAGE SE FAIT PENDANT LES TEMPS MORTS, pas au survol.

     Il etait declenche par `pointerenter`, ce qui evitait bien de
     payer au chargement mais faisait payer une mise en page a
     l'instant precis ou le visiteur vise le bouton — le pire
     moment pour une tache de mise en page, puisque c'est celui ou
     il attend une reponse. Vingt-huit boutons decoupes un par un
     pendant les temps morts coutent la meme chose au total et rien
     au moment ou ca compte.

     L'ecouteur reste en secours : un bouton cree apres coup, ou
     atteint avant que la file soit vidée, se decoupe a la volee. */
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

  /* `--p` est une position, donc elle depend de la largeur. Un
     changement de taille de fenetre la rend fausse et desynchronise
     la cascade de l'arete — c'est-a-dire qu'il reintroduit la
     fenetre illisible qu'on a passe la phase a supprimer.
     Recalcul groupe, une seule mise en page pour tous les boutons. */
  var rtLettres = 0;
  window.addEventListener("resize", function () {
    window.clearTimeout(rtLettres);
    rtLettres = window.setTimeout(function () {
      $$(".btn[data-lettres]").forEach(positionner);
    }, 220);
  }, { passive: true });

  /* ============================================================
     2. LES MOTS — V1 · DEGAGER, sur les chapos de section.

     Le paragraphe d'introduction ne se decouvre pas d'un bloc :
     l'encre se pose mot apres mot au fil du defilement, comme une
     ligne qu'on degage. C'est le meme geste que le balayage des
     titres, un cran plus fin.

     CE N'EST PAS SCRUBBE, ET C'EST UNE CORRECTION MESUREE.

     Premiere version : l'opacite des mots etait liee au defilement,
     de « top 88% » a « bottom 62% ». C'est la technique la plus
     repandue de la categorie, et elle est FAUSSE des qu'elle touche
     a l'opacite d'un TEXTE.

     Raison : une animation scrubbee n'a pas d'etat de repos, elle a
     l'etat ou le visiteur s'est arrete. Chaque position de
     defilement est donc un etat PERMANENT possible, et chacun doit
     tenir le contraste. Mesure du 2026-07-26 : avec le paragraphe
     a 64 % de la hauteur d'ecran — une position de lecture tout a
     fait ordinaire — les mots restaient a 0,39 d'opacite, soit
     environ 1,5:1 sur le ciment. Un echec AA franc, tenu aussi
     longtemps que le visiteur ne bouge pas.

     C'est exactement le meme defaut que celui corrige sur le
     morphe des secteurs, et il appelle la meme reponse : une
     animation qui a un DEBUT et une FIN, jouee une fois, qui ne
     peut pas s'arreter au milieu.

     TROIS GARDE-FOUS, chacun pour une raison :
     · l'etat au repos est l'encre PLEINE. Sans script, sans GSAP,
       sous mouvement reduit, le chapo est lisible entier ;
     · le plancher est a 0,34 d'opacite, pas a 0. Un mot invisible
       qu'on attend n'est pas une revelation, c'est une attente ;
     · le declenchement est bas — « top 92% » — et la vague entiere
       dure moins de 700 ms : le texte est entierement pose bien
       avant que l'oeil arrive dessus.
     ============================================================ */
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

  /* PALIER 1 — LE PREMIER POSTE QUI TOMBE.
     227 spans dont l'opacite est PEINTE, c'est le plus cher de tout
     le fichier pour ce qu'il apporte : un chapo qui s'encre mot a
     mot est du N3 pur. Sur un appareil etroit ou faible, le
     paragraphe est simplement la, en encre pleine. */
  if (PALIER === 0) $$(".head p").forEach(function (p) {
    /* Le decoupage part dans la file des temps morts ; le
       declencheur ne fait plus que LANCER l'animation. Si le
       visiteur arrive avant que la file soit vidée, `decouperMots`
       s'execute a la volee — il est idempotent. */
    preparer(function () { decouperMots(p); });

    ScrollTrigger.create({
      trigger: p,
      start: "top 92%",
      once: true,
      onEnter: function () {
        if (PALIER !== 0) return;
        var mots = decouperMots(p);
        if (!mots || mots.length < 4) return;

        /* LE DEPART EST POSE SUR TOUS LES MOTS EN MEME TEMPS, et
           c'est une correction mesuree.

           Avec un `fromTo` decale, un mot dont le tour n'est pas
           encore venu reste a son opacite CSS, c'est-a-dire a
           l'encre pleine — puis il TOMBE a 0,34 au moment ou son
           tour arrive, avant de remonter. Releve du 2026-07-26,
           image par image :
             1    1    1    1    1    1
             0.62 0.51 0.39 1    1    1
             0.79 0.71 0.61 0.5  0.38 1
           La vague se lit donc « foncé, clair, foncé » et un mot
           DEJA LISIBLE devient moins lisible sous les yeux du
           visiteur. C'est pire que pas d'animation du tout.

           Le depart est donc pose d'un coup, a l'entree par le bas
           de l'ecran, et seule la REMONTEE est decalee. La vague ne
           va plus que dans un sens : celui de la lecture. */
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

  /* ============================================================
     3. DEGAGER — revelation par masque net.

     Aucun fondu nulle part sur ce site. Une image, une maquette,
     un cadre : tout se DECOUVRE sous une arete franche.
     La direction du balayage n'est pas decorative — elle suit le
     sens de lecture de ce qu'elle decouvre : de haut en bas pour
     une page, de gauche a droite pour une ligne.
     ============================================================ */
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

  /* LES SOUS-TITRES — V1 a l'echelle d'un h3.
     `motion.js` degage deja les `h2` ligne par ligne. Les vingt-six
     `h3` du site, eux, apparaissaient. Ils se degagent maintenant
     du meme geste, en un seul balayage : ils tiennent sur une ou
     deux lignes, donc les decouper par ligne couterait une mesure
     forcee par titre pour un gain invisible.
     260 ms : le texte est lisible avant que l'oeil ait fini
     d'arriver dessus. C'est la limite que ce site s'impose. */
  if (PALIER === 0) $$(".project-meta h3, .cell h3, .sector-group h3, .parc-txt h3, .agc-txt h3, .svc-texte h3")
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

  /* ------------------------------------------------------------
     LE VOILE DE GRAINS A ETE COUPE, ET C'EST UNE DECISION, PAS UN
     OUBLI.

     Il faisait passer chaque capture de projet d'une trame de
     grains a l'image franche, en 520 ms, une fois. C'etait le plus
     joli effet du lot. Trois raisons de le retirer, et la
     troisieme suffit a elle seule :

     1. IL POUVAIT NE JAMAIS ETRE VU. Declenche a 82 % de la hauteur
        d'ecran, il durait 520 ms : un visiteur qui defile
        normalement traversait la moitie de la bande avant qu'il ait
        fini. Une animation qui coute des ressources et que personne
        ne regarde est le pire des deux mondes — et la corriger en
        la declenchant sur INTENTION revenait a poser 520 ms de
        grain devant la chose que le visiteur vient justement de
        demander a voir.

     2. IL DOUBLAIT UN VERBE DEJA PRESENT. Le meme cadre recoit deja
        un degagement par masque haut->bas. Deux V1 sur le meme
        objet, ce n'est pas une signature plus forte, c'est une
        signature bavarde.

     3. IL VISAIT LA MAUVAISE CIBLE. Ces captures sont LA PREUVE :
        de vraies pages d'accueil de vrais clients en ligne. C'est
        le seul endroit du site ou la nettete n'est pas une
        preference esthetique mais l'argument lui-meme. Poser une
        trame dessus, meme une demi-seconde, affaiblit exactement ce
        qu'on demande au visiteur de juger.

     Ce que ca rend au passage : deux degrades repetitifs peints sur
     une surface de 900 px de large, cinq fois par page. C'est aussi
     le genre de poste que le budget de degradation ci-dessus aurait
     fait tomber en premier — autant ne pas l'ecrire du tout.
     ------------------------------------------------------------ */

  /* ============================================================
     4. SOUDER — les filets de liaison.

     Partout ou deux choses sont reliees par un trait, le trait se
     pose en grains puis se ressoude. `motion.js` le fait deja pour
     les filets de section et les fiches du hero ; on l'etend ici
     aux separateurs de listes, aux rangees de faits de projet et
     aux cellules de contact, qui etaient inertes.
     ============================================================ */
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
          /* JavaScript ne fait que POSER LA CLASSE. La croissance de
             la trame est une transition CSS : le navigateur la mene
             sans nous, sur son propre fil, et sans invalider le
             style du sous-arbre a chaque image.
             Le trait plein est masque pendant la soudure et revient
             quand elle est finie : ce qu'on voit avancer est bien
             une TRAME DE GRAINS, et ce qui reste est bien un TRAIT.
             Sans le masquage, la trame se surimposerait a un trait
             deja plein et on ne verrait rien avancer du tout. */
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

  /* ============================================================
     5. LES SECTEURS — LE MOMENT DE PREUVE. N2.

     TRADUCTION DU SECOND COMPOSANT FOURNI, ET C'EST ICI QU'IL VA.

     L'original disperse vingt images, les aligne en ligne, les
     ferme en cercle, puis interpole le cercle vers un arc au
     defilement, avec parallaxe a la souris et retournement des
     cartes au survol.

     CE QU'ON GARDE : l'interpolation progressive entre DEUX MISES
     EN PAGE CALCULEES, la sequence dispersion → filets → forme, la
     parallaxe bornee a la souris, le changement d'etat au survol.

     CE QU'ON JETTE, ET POURQUOI :

     · LE DETOURNEMENT DU DEFILEMENT. L'original pose un
       `wheel` avec `preventDefault` : le visiteur ne peut plus
       sortir de la section. C'est interdit. Ici la scene est
       scrubbee sur sa TRAVERSEE NATURELLE — aucun `pin`, aucun
       pixel ajoute a la page, et la molette fait toujours
       exactement ce qu'elle fait ailleurs.

     · LE CERCLE. Ce site a deja arbitre contre une mecanique
       rotative, en phase 6, sur deux arguments qui tiennent
       encore : sur un cercle il n'y a ni debut ni fin, donc plus
       aucune reponse honnete a « combien il en reste » ; et une
       carte posee sur un cercle doit etre redressee pour rester
       lisible, donc elle glisse le long d'une courbe sans jamais
       s'y aligner — ca flotte, et rien ne flotte ici.
       La forme dispersee n'est donc pas un nuage aleatoire : ce
       sont les QUINZE FILETS HORIZONTAUX de `seedPositions()`
       dans `limaille.js`. La meme matiere, au meme endroit, a une
       autre echelle. La forme d'arrivee est la grille orthogonale
       de la maquette, nette au pixel.

     · LE RETOURNEMENT 3D DES CARTES. Une rotation en Y suppose une
       perspective, donc une profondeur, donc quelque chose qui
       flotte. Le survol fait ici ce que fait la matiere : la
       tuile s'INVERSE en contraste et son libelle roule d'un cran.

     POURQUOI SECTEURS PLUTOT QUE PROJETS — trois raisons, dans
     l'ordre d'importance :

     1. SENS. Cette section affirme « le style change selon le
        metier ». Une matiere unique qui se recompose en une forme
        differente par metier N'ILLUSTRE PAS l'affirmation, elle
        l'EST. Dans Projets, l'affirmation est « ces sites sont en
        ligne pour de vrai » : faire voler les captures affaiblit
        la preuve au lieu de la porter.
     2. HISTORIQUE MESURE. L'epinglage de Projets a ete retire en
        phase 6 sur une mesure : 3 200 px par projet, section a
        20 588 px, soit 60 % de la hauteur du site. Le remettre
        serait reintroduire un defaut deja paye.
     3. LISIBILITE. Les captures de Projets sont des pages
        completes avec du vrai texte. C'est le moment ou elles
        doivent etre NETTES ; un morphe les rend illisibles
        exactement quand on les juge.
     ============================================================ */
  (function secteurs() {
    var scene = $("#mockStage");
    var preview = $("#sectorPreview");
    if (!scene || !preview) return;

    /* Les blocs qu'on recompose sont les enfants directs de la
       PAGE de la maquette, pas tous ses descendants : recomposer
       240 elements couterait 240 couches de composition pour un
       geste que huit blocs racontent aussi bien. */
    function blocsDe(mock) {
      var page = $(".sec-page", mock) || mock;
      return $$(":scope > *", page).slice(0, 10);
    }

    /* Les quinze filets de `seedPositions()`. Un bloc part du filet
       que sa graine lui donne, jamais d'une position aleatoire :
       deux passages successifs donnent la meme matiere au meme
       endroit, donc aucun scintillement. */
    var FILETS = 15;
    function filetDe(i, hauteur) {
      var ligne = (i * 7 + 3) % FILETS;
      return ((ligne + 0.5) / FILETS - 0.5) * hauteur;
    }

    /* --------------------------------------------------------
       5a. LA RECOMPOSITION — UN SEUL CHEMIN DE CODE, ET C'EST UNE
       CORRECTION DE CONCEPTION, PAS UNE SIMPLIFICATION.

       Il y en avait deux : un morphe scrubbe sur la traversee de la
       scene, et une recomposition declenchee par le changement de
       metier. Les deux visaient LES MEMES BLOCS. Consequences,
       mesurees par `tools/secteur-morph-check.mjs` :
       · a l'arret au milieu de la plage de scrub, les blocs
         restaient a 4,1 px de leur place et a 0,84 d'opacite. L'etat
         au repos n'etait donc plus la forme finale — c'est la regle
         numero deux de ce projet, et elle etait cassee ;
       · un changement de metier pendant le scrub tuait le tween
         scrubbe, qui reprenait la main au defilement suivant et
         faisait sauter les blocs.

       Le morphe est donc UNE SEULE animation, jouee en 440 ms, une
       fois a l'entree de la scene et une fois par changement de
       metier. Elle a un debut et une fin, elle ne peut pas
       s'arreter au milieu, et `clearProps` rend les blocs a leur
       CSS a la derniere image : la forme au repos est nette au
       pixel, par construction.

       Ce qu'on perd : le lien direct entre la molette et le morphe.
       Ce qu'on gagne : un etat de repos qui ne ment jamais.
       -------------------------------------------------------- */
    var enCours = null;

    function recomposer(mock, amplitude) {
      if (!mock) return;
      /* PALIER 2 — la maquette change NET, sans recomposition.
         C'est le moment de preuve de la page, donc c'est le dernier
         N2 qu'on lache ; mais dix blocs animes simultanement sur un
         appareil qui rame produisent une bouillie qui dessert
         exactement ce qu'ils devaient prouver. */
      if (PALIER >= 2) return;
      var blocs = blocsDe(mock);
      if (!blocs.length) return;
      if (enCours) enCours.kill();
      var h = scene.clientHeight || 400;

      enCours = gsap.timeline();
      enCours.fromTo(blocs,
        {
          y: function (i) { return filetDe(i, h) * amplitude; },
          x: function (i) { return (i % 2 ? 1 : -1) * 18 * amplitude / 0.22; },
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
      recomposer($('.mock[data-mock="' + e.detail.cle + '"]', scene), 0.22);
    });

    /* La premiere fois que la vitrine entre par le bas, la maquette
       en place se compose depuis les filets — plus ample que pour un
       changement de metier, parce que c'est la premiere fois qu'on
       voit la matiere prendre forme. */
    ScrollTrigger.create({
      trigger: preview,
      start: "top 88%",
      once: true,
      onEnter: function () {
        recomposer($(".mock.is-on", scene) || $(".mock", scene), 0.5);
      }
    });

    /* --------------------------------------------------------
       5c. LA PARALLAXE A LA POINTE — bornee, pointeur fin seul.
       C'est la seule chose que l'original fait qu'on garde telle
       quelle, et encore : ±100 px chez lui, ±7 px ici. Au-dela, la
       maquette flotte, et rien ne flotte.
       -------------------------------------------------------- */
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

  /* ============================================================
     6. VITESSES DIFFERENCIEES — N3, bureau seulement.
     La fiche d'un projet monte un peu plus vite que sa capture.
     Course bornee a 22 px : assez pour que les deux colonnes ne
     soient pas solidaires, trop peu pour qu'on remarque autre
     chose que de la profondeur. Sous 64em, rien : sur une colonne
     unique, deux vitesses ne veulent plus rien dire.
     ============================================================ */
  if (PALIER === 0) {
    $$(".project-meta").forEach(function (meta) {
      gsap.fromTo(meta,
        { y: 22 },
        {
          y: -22,
          ease: "none",
          immediateRender: false,
          scrollTrigger: {
            trigger: meta.closest(".project") || meta,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.8
          }
        }
      );
    });
  }

  /* ============================================================
     7. LA FAQ — V2, et c'est du FLIP.
     Ouvrir une question repousse toutes celles d'en dessous. Sans
     rien, elles SAUTENT : la page se reorganise sous l'oeil du
     visiteur pendant qu'il commence a lire. Avec le FLIP maison,
     elles GLISSENT a leur nouvelle place — donc on voit que rien
     n'a disparu, seulement qu'une chose s'est ouverte.
     ============================================================ */
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
        /* Le navigateur bascule `open` APRES le clic : on mesure
           avant, on laisse le natif faire, on mesure au tour
           suivant. Aucun `preventDefault`, donc le comportement
           natif — clavier, ancre, recherche dans la page — reste
           intact. */
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

  /* ============================================================
     8. L'ETIQUETTE DE LA POINTE — V4.
     Sur les deux zones ou il y a quelque chose a faire mais aucun
     bouton — le cadre d'un projet, la vitrine des secteurs — la
     pointe porte le mot. Il ne fond pas : il ROULE d'un cran,
     comme le reste.
     `pointe.js` tient deja le reticule et l'aimantation ; on ne
     fait qu'y accrocher un libelle, et uniquement au pointeur fin.
     ============================================================ */
  if (fine.matches && PALIER === 0) {
    var etiq = null;
    var ZONES = [
      [".shot-vue", "Parcourir"],
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

  /* ============================================================
     9. LES MODALES — V1.
     Six modales, et elles apparaissaient. Elles se DEGAGENT
     maintenant du haut, arete franche, 260 ms. La toile de fond
     reste instantanee : c'est elle qui dit « le reste est
     inerte », et le dire progressivement serait le dire mal.
     ============================================================ */
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
  });

  /* La fermeture est la RECIPROQUE de l'ouverture, pas une seconde
     idee : le panneau se recoupe par le haut, d'ou il est venu.
     `clearProps` a la fin, sinon le `clip-path` de sortie resterait
     pose et la modale rouvrirait sur un panneau deja coupe. */
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

  /* ============================================================
     10. RECALCUL. Les captures de projet mesurent plusieurs
     milliers de pixels : tant qu'elles ne sont pas chargees, les
     plages de defilement calculees ici sont fausses.
     ============================================================ */
  window.addEventListener("load", function () { ScrollTrigger.refresh(); });

})();
