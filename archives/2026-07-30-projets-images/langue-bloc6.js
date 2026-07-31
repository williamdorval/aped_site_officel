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
