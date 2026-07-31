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
