/* == SAS — la piste de cloture ==  D-573

   IL N'Y EN A PLUS QU'UNE. Ce fichier pilotait trois sas :

   · DESCENTE (04 → 05) — le volet noir, l'arete de grains, la forge
     de limaille et le mot « Essayez. » qui s'y ecrivait ;
   · REMONTEE (05 → 06) — le calque noir qui se degageait vers le
     haut pour SORTIR de la piece sombre ;
   · CLOTURE  (11 → pied) — un fil qui se soude jusqu'a la bande.

   Les deux premiers etaient la mise en scene de la CHAMBRE NOIRE. La
   chambre est partie : la section Visite 360 se presente sur la page
   claire, comme les onze autres, et le lecteur 360 s'y suffit. Leurs
   branches ne pouvaient plus s'executer — plus aucun `data-sas` ne
   vaut « descente » ni « remontee » — et la Forge lisait
   `--chambre-ink`, un jeton qui n'existe plus.

   Un contournement, comme un mort, survit toujours au correctif si
   on ne va pas le chercher (piege 46). Ils sont partis avec lui.
   Reste la cloture, qui n'a jamais rien peint en noir. */

(function (root) {
  "use strict";

  var doc = root.document;
  if (!doc) return;

  /* == Les portes. Toutes fermees = le fichier ne fait RIEN, et  D-574
     le sas reste la bande de seuil d'avant. == */
  /* La decision est prise dans le HEAD, avant la premiere mise en
     page : ici on la LIT, on ne la reprend pas. `langue.js` pose
     data-palier apres nous ; l'attribut absent vaut « pas encore
     retrograde ». */
  if (!doc.documentElement.classList.contains("sas-ok")) return;
  var palier0 = doc.documentElement.getAttribute("data-palier");
  if (palier0 && palier0 !== "0") return;
  if (typeof root.gsap === "undefined" || typeof root.ScrollTrigger === "undefined") return;

  root.gsap.registerPlugin(root.ScrollTrigger);
  var gsap = root.gsap;

  function $(s, c) { return (c || doc).querySelector(s); }

  /* == LE LISSAGE — le correctif de la saccade.  D-589 */
  var LISSE = 0.45;

  function $$sas() {
    return Array.prototype.slice.call(doc.querySelectorAll(".sas[data-sas]"));
  }

  function armer() {
    $$sas().forEach(function (sas) {
      var genre = sas.getAttribute("data-sas");
      var piste = $(".sas-piste", sas);
      var scene = $(".sas-scene", sas);
      if (genre !== "cloture") return;
      if (!piste || !scene) return;

      sas.classList.add("sas-actif");

      var fil = $("[data-sas-fil]", sas);
      if (!fil) return;
      /* Le fil finit sa course quand la bande touche le bas de
         l'ecran : il s'y SOUDE, il ne pend pas dans le vide.
         Repos = forme finale ; `immediateRender: false` pose le
         depart, jamais le CSS — regle 3 du projet. */
      gsap.fromTo(fil, { scaleY: 0 }, {
        scaleY: 1, ease: "none", immediateRender: false,
        scrollTrigger: {
          trigger: piste, start: "top bottom", end: "bottom bottom", scrub: LISSE
        }
      });
    });
  }

  /* == L'escalade de palier fige le sas SANS le replier : une  D-577
     piste qui perd sa hauteur en pleine lecture fait sauter la
     page. Le fil se pose a sa forme finale, tendu. == */
  var garde = new MutationObserver(function () {
    if (doc.documentElement.getAttribute("data-palier") === "0") return;
    garde.disconnect();
    root.ScrollTrigger.getAll().forEach(function (st) {
      var t = st.vars && st.vars.trigger;
      if (t && t.classList &&
        (t.classList.contains("sas-piste") || t.classList.contains("sas"))) {
        try { st.kill(); } catch (e) { }
      }
    });
    $$sas().forEach(function (sas) {
      var fil = $("[data-sas-fil]", sas);
      if (fil) gsap.set(fil, { scaleY: 1 });
    });
  });
  garde.observe(doc.documentElement, { attributes: true, attributeFilter: ["data-palier"] });

  armer();
})(window);
