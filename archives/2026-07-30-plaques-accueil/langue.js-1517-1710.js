  /* ============================================================
     10. LES SEPT PLAQUES D'ATELIER — V2 · S'ALIGNER.

     LE REPOS EST DEJA LA COMPOSITION, ET IL EST DANS UNE AUTRE
     BOITE. Chaque plaque est faite d'une COQUE — `.plaque`, la case
     de grille, sans transformation propre — et d'un CORPS —
     `.plaque-corps`, qui porte l'inclinaison ecrite dans le
     document. On anime la coque, jamais le corps. Consequence : si
     ce fichier ne s'execute jamais — mouvement reduit, script
     coupe, palier 1 — la composition est intacte, seulement
     immobile. C'est exactement ce que demande le brief.

     Et c'est la SEULE facon d'y arriver. La premiere version
     mettait l'inclinaison sur la meme boite, via les proprietes
     individuelles `rotate` / `translate` / `scale`, en croyant
     laisser `transform` libre pour GSAP. GSAP, lui, ECRIT
     `rotate: none` sur tout element dont il prend les
     transformations en main : les sept plaques se retrouvaient
     droites des que la choregraphie arrivait.

     POURQUOI ICI ET PAS DANS `motion.js`. Le palier est pose par
     ce fichier, et `motion.js` s'execute AVANT lui : un test de
     palier la-bas lirait toujours 0. La derive est aussi, par
     nature, le poste que le palier 1 doit tuer — c'est la meme
     famille que « vitesses differenciees des fiches », deja
     nommee dans le budget de degradation.

     CE QUE LE SCRUB A LE DROIT DE TOUCHER. Une animation scrubbee
     n'a pas d'etat de repos : elle a l'etat ou le visiteur s'est
     arrete, et chaque position de defilement est donc un etat
     PERMANENT possible. Il est par consequent interdit d'y mettre
     l'opacite d'un element qui porte du texte. Ici on ne scrubbe
     que deux choses :
     · `y`, borne a +/- 34 px multiplies par la vitesse propre de
       la plaque. Une plaque decalee de 30 px reste lisible ;
     · `rotation`, bornee entre 0 et -55 % de l'inclinaison de
       repos. Au pire la plaque est a 2°, au mieux a 0,9° : elle ne
       peut jamais devenir illisible, ni depasser son angle ecrit,
       ni basculer de l'autre cote.

     LE REDRESSEMENT EST AU CENTRE, ET IL FAUT DEUX TEMPS POUR CA.
     Une seule tranche donnerait un redressement monotone : la
     plaque finirait droite en bas d'ecran au lieu de se redresser
     EN PASSANT. Deux tranches egales — se redresser puis se
     recoucher — mettent le point droit exactement a mi-course,
     c'est-a-dire quand la plaque traverse le centre.
     ============================================================ */
  (function plaques() {
    var bande = $("[data-plaques]");
    if (!bande) return;
    /* PALIER 1 — la derive tombe. Les plaques restent inclinees,
       decalees et lisibles : on ne perd que le mouvement. */
    if (PALIER !== 0) return;

    var lot = $$(".plaque", bande);
    if (!lot.length) return;

    /* ============================================================
       LA BOUCLE DE VIE — ajoutee le 2026-07-29.

       LE DEFAUT. La derive ci-dessous est un `scrub` : elle n'avance
       que pendant qu'on defile. Des qu'on s'arrete pour lire, les
       huit plaques se figent. Personne ne l'avait vu parce que toutes
       les mesures de derive se prennent EN DEFILANT — l'instrument
       ne pouvait pas rendre le defaut qu'il fallait trouver.

       CE FICHIER NE POSE QU'UNE CLASSE ET UN ATTRIBUT. Le mouvement
       est entierement en CSS — voir le bloc 13bis de `app.css`. Trois
       raisons, et aucune n'est esthetique :
       · une animation CSS de `translate` / `rotate` est composee par
         le compositeur, donc elle ne coute rien au fil principal ;
       · `animation-play-state: paused` gele la valeur courante sans
         AUCUNE interpolation. C'est le cran demande par le brief, et
         aucune boucle en JavaScript ne peut faire mieux : elle
         devrait lire la valeur, la reecrire, et laisser une image
         d'ecart ;
       · le mouvement survit a la mort de ce fichier. Si le palier
         monte a 2, `jetables` retire la classe et tout s'arrete net,
         sans laisser de valeur en vol.

       CE QUI SERAIT FAUX DE FAIRE ICI : poser la classe sans les deux
       verrous. Une animation permanente sur une section hors ecran est
       de la batterie brulee pour personne. `IntersectionObserver` et
       `visibilitychange` ne sont donc pas des raffinements, ils font
       partie de la fonction.
       ============================================================ */
    bande.classList.add("est-vivante");

    /* UN MASQUE DE BITS, PAS DEUX DRAPEAUX. Bit 1 = hors ecran,
       bit 2 = onglet cache. Deux booleens independants auraient laisse
       le retour d'un onglet relancer la boucle d'une section qui n'est
       plus a l'ecran : la cause qui reste doit continuer de retenir. */
    var repos = 0;
    function appliquerRepos() {
      if (repos) bande.setAttribute("data-repos", "");
      else bande.removeAttribute("data-repos");
    }

    /* La marge de declenchement est GENEREUSE a dessein : la boucle
       doit tourner avant que la bande entre, sinon le visiteur la
       decouvre a l'arret et voit huit plaques se mettre en marche —
       ce qui est exactement l'effet « animation qui demarre » qu'on
       ne veut pas. */
    var oeil = null;
    if (typeof IntersectionObserver === "function") {
      oeil = new IntersectionObserver(function (entrees) {
        for (var i = 0; i < entrees.length; i++) {
          if (entrees[i].isIntersecting) repos &= ~1; else repos |= 1;
        }
        appliquerRepos();
      }, { rootMargin: "200px 0px" });
      oeil.observe(bande);
    }

    function surVisibilite() {
      if (document.hidden) repos |= 2; else repos &= ~2;
      appliquerRepos();
    }
    document.addEventListener("visibilitychange", surVisibilite);
    surVisibilite();

    jetables.push({
      kill: function () {
        if (oeil) oeil.disconnect();
        document.removeEventListener("visibilitychange", surVisibilite);
        /* Retirer la classe suffit : l'animation disparait, et comme
           elle vivait dans `translate` / `rotate` et non dans
           `transform`, la pose de repos ecrite dans le document
           reapparait intacte. Rien a nettoyer, rien a remettre. */
        bande.classList.remove("est-vivante");
        bande.removeAttribute("data-repos");
      }
    });

    lot.forEach(function (p) {
      var cs = getComputedStyle(p);
      var ang = parseFloat(cs.getPropertyValue("--ang")) || 0;
      var incl = parseFloat(cs.getPropertyValue("--incl")) || 1;
      var v = parseFloat(cs.getPropertyValue("--v")) || 1;
      /* L'inclinaison REELLE est l'angle ecrit multiplie par le
         coefficient du conteneur : sur telephone il vaut 0,45, donc
         le redressement doit se calculer dessus et pas sur la
         valeur brute, sinon la plaque se redresserait au-dela de
         zero et pencherait de l'autre cote. */
      var reel = ang * incl;
      /* 110 PX ET NON 34, ET C'EST UNE CORRECTION MESUREE.
         34 px etalees sur toute la traversee de la bande — de
         `top bottom` a `bottom top`, soit environ 1 100 px de
         defilement — font 3 % de course. Un deplacement de 3 %
         ne se percoit pas : le releve du 2026-07-29 a confirme
         que les sept plaques etaient, a l'oeil, immobiles. Le
         coefficient `--v` reste ce qui differencie les vitesses :
         de 0,55 a 1, donc de 60 a 110 px selon la plaque. C'est
         ce DECALAGE entre elles qui se lit, plus encore que la
         course elle-meme. */
      var course = 110 * v;

      var tl = gsap.timeline({
        scrollTrigger: {
          trigger: bande,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.5,
          invalidateOnRefresh: true
        }
      });
      /* LE REDRESSEMENT EST MAINTENANT COMPLET. `-reel * 0.55`
         laissait 45 % de l'inclinaison en place au centre : la
         plaque ne se redressait pas, elle se redressait un peu.
         La coque tourne de `-reel` exactement, donc le net avec
         l'inclinaison du corps vaut ZERO au centre de l'ecran —
         V2 · S'ALIGNER se lit parce qu'il y a une fin nette a
         atteindre, pas parce que ca bouge. */
      tl.fromTo(p,
        { y: course, rotation: 0 },
        { y: 0, rotation: -reel, ease: "none", duration: 0.5 })
        .to(p, { y: -course, rotation: 0, ease: "none", duration: 0.5 });

      /* TUER UN SCRUB NE SUFFIT PAS : il faut RENDRE l'element.
         Un `kill()` seul laisse la plaque exactement ou le visiteur
         s'etait arrete — decalee de 20 px et tournee de 1° — et
         cette valeur devient permanente, alors qu'on vient
         justement de decider qu'on n'anime plus. On efface donc le
         `transform` pose par GSAP ; l'inclinaison de repos, elle,
         vit dans `rotate` / `translate` / `scale` et ne bouge pas. */
      jetables.push({
        kill: function () {
          tl.scrollTrigger && tl.scrollTrigger.kill();
          tl.kill();
          gsap.set(p, { clearProps: "transform" });
        }
      });
    });
  })();
