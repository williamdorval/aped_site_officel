  /* ============================================================
     SERVICES — la demonstration se lance d'ici.

     CE QUI A DISPARU LE 2026-07-30. Ce bloc tenait le rail
     horizontal : le compteur « 01 / 04 », le nom du chantier, la
     piste native avec accrochage, le clavier et les deux fleches.
     Les quatre cartes sont maintenant peintes en meme temps dans une
     grille CSS, et le detail de chacune est un `<details>` natif.
     Il n'y a donc plus rien a orienter, plus rien a piloter, et plus
     aucune touche a reimplementer : le navigateur fait tout.

     `window.APED_SVC` n'existe plus. `js/motion.js` bloc 6, qui
     l'utilisait pour remplacer le geste « glisser » par
     « descendre », a ete retire en meme temps.

     CE QUI RESTE ICI, ET POURQUOI ICI. Un seul geste : lancer la
     visite 360 depuis la carte 03. C'est de l'USAGE, pas de la
     choregraphie — donc `main.js`, qui s'execute a tous les paliers
     et sous `prefers-reduced-motion`, jamais `langue.js`, qui
     s'arrete net.

     ON NE CONSTRUIT PAS UN SECOND LECTEUR. Le bouton amene a la
     section 05 et declenche celui qui existe deja. Une seconde
     instance de Pannellum, ce sont 8,5 Mo de panoramas charges deux
     fois et un deuxieme moteur pour montrer exactement la meme
     piece.
     ============================================================ */
  (function svcTour() {
    var depart = $("[data-svc-tour]");
    var visite = $("#visite");
    var lanceur = $("[data-tour-start]");
    if (!depart || !visite || !lanceur) return;

    depart.addEventListener("click", function () {
      /* On defile d'abord, on declenche ensuite. Declencher avant
         de defiler ferait charger 2 Mo pendant que le visiteur
         regarde encore la section Services : il verrait une barre
         de chargement pour quelque chose qu'il n'a pas sous les
         yeux. */
      visite.scrollIntoView({ behavior: reduced.matches ? "auto" : "smooth", block: "start" });

      /* Le clic est programme apres le defilement, mais il ne DEPEND
         pas de lui : `scrollIntoView` lisse n'a pas d'evenement de
         fin fiable et un `scrollend` manquant laisserait le bouton
         mort. Un delai unique, borne, puis on declenche quoi qu'il
         arrive. Sous mouvement reduit le saut est immediat, donc le
         delai tombe a une image. */
      window.setTimeout(function () {
        /* Si le visiteur a deja ouvert la visite, `tour360.js` a
           retire le bouton de l'affichage : le declencher une
           seconde fois relancerait un chargement pour rien. */
        if (lanceur.isConnected && !lanceur.classList.contains("is-loading")) lanceur.click();
        /* Le focus suit le regard. Sans ca, la tabulation suivante
           repart du haut du document et le clavier perd la page. */
        var vue = $("[data-tour-stage]") || visite;
        if (vue.hasAttribute && !vue.hasAttribute("tabindex")) vue.setAttribute("tabindex", "-1");
        try { vue.focus({ preventScroll: true }); } catch (e) {}
      }, reduced.matches ? 16 : 620);
    });
  })();
