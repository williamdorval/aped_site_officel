  /* 12ter. LES TROIS FAITS DE L'AGENCE — V3 · SOUDER puis V4 · CRAN.  D-628
     Le filet du fait se soude de gauche a droite, et le chiffre roule
     d'un cran dans sa fenetre une fois le trait pose. Deux verbes, un
     seul geste, dans l'ordre : on trace la ligne, puis on y depose le
     chiffre. Aucun fondu — un chiffre a moitie transparent se lit
     comme une panne, pas comme un mouvement (piege 70). */
  $$(".agc-faits li").forEach(function (fait, i) {
    var filet = $(".agc-filet", fait);
    var roul = $(".agc-roul i", fait);
    var tl = gsap.timeline({
      scrollTrigger: { trigger: fait, start: "top 84%", once: true },
      delay: i * 0.08
    });
    if (filet) tl.fromTo(filet,
      { scaleX: 0 },
      { scaleX: 1, duration: 0.42, ease: "power2.out", immediateRender: false });
    /* `y: 0` explicite : GSAP lirait un `transform` CSS de repos comme
       une base en PIXELS et animerait `yPercent` par-dessus. Piege 33. */
    if (roul) tl.fromTo(roul,
      { yPercent: 105, y: 0 },
      { yPercent: 0, y: 0, duration: 0.34, ease: "power3.out", immediateRender: false },
      "-=0.14");
  });

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

