/* == LA POINTE — declinaison du motif signature au curseur ==  D-565 */

(function () {
  "use strict";

  var fine = window.matchMedia("(pointer: fine)");
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  var doc = document;

  var el = null;
  var raf = 0;
  var abandonne = false;

  /* Position visee et position rendue. La pointe ne poursuit pas le
     curseur en inertie : elle s'y pose. L'ecart n'existe que pour
     l'aimantation. */
  var tx = -999, ty = -999, x = -999, y = -999;
  var cible = null;

  function actif() {
    return !abandonne && fine.matches && !reduced.matches;
  }

  function build() {
    if (el) return;
    el = doc.createElement("div");
    el.className = "pointe";
    el.setAttribute("aria-hidden", "true");
    el.innerHTML = '<i class="pointe-h"></i><i class="pointe-v"></i>';
    doc.body.appendChild(el);
  }

  function destroy() {
    if (raf) { cancelAnimationFrame(raf); raf = 0; }
    if (el && el.parentNode) el.parentNode.removeChild(el);
    el = null;
    doc.documentElement.classList.remove("has-pointe");
  }

  /* Aimantation : la CIBLE se rapproche de la pointe, pas l'inverse.
     Le curseur natif n'est jamais deplace ni masque, donc le geste
     du visiteur reste exact. */
  var aimante = null;
  function poserAimant(t, dx, dy) {
    if (aimante && aimante !== t) aimante.style.transform = "";
    aimante = t;
    if (t) t.style.transform = "translate(" + dx.toFixed(1) + "px," + dy.toFixed(1) + "px)";
  }

  function boucle() {
    raf = 0;
    if (!actif() || !el) return;

    /* Encliquetage : la pointe rattrape en deux crans, pas en
       glissade continue. */
    x += (tx - x) * 0.42;
    y += (ty - y) * 0.42;
    el.style.transform = "translate(" + x.toFixed(1) + "px," + y.toFixed(1) + "px)";

    if (cible) {
      var r = cible.getBoundingClientRect();
      var cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      var d = Math.min(1, Math.hypot(tx - cx, ty - cy) / Math.max(r.width, r.height));
      poserAimant(cible, (tx - cx) * 0.16 * (1 - d), (ty - cy) * 0.16 * (1 - d));
    } else if (aimante) {
      poserAimant(null, 0, 0);
    }

    if (Math.abs(tx - x) > 0.2 || Math.abs(ty - y) > 0.2 || cible) {
      raf = requestAnimationFrame(boucle);
    }
  }

  function reveiller() { if (!raf && actif()) raf = requestAnimationFrame(boucle); }

  function onMove(e) {
    if (!actif()) return;
    build();
    doc.documentElement.classList.add("has-pointe");
    tx = e.clientX; ty = e.clientY;
    if (x < -900) { x = tx; y = ty; }

    /* Les cibles AIMANTEES sont les objets qu'on peut saisir : ils se  D-566 */
    var t = e.target.closest
      ? e.target.closest(".btn, .btn-icon, .cell, .sector-pills button, .roi-presets button, .rail-list a, .nav-links a, .menu-list a, .hero-fiche a, .footer-nav a, .faq-item summary")
      : null;
    var large = !t && e.target.closest
      ? e.target.closest(".shot, .sheet-media, .sector-preview, .tour-stage")
      : null;
    if (t !== cible) {
      if (!t && aimante) poserAimant(null, 0, 0);
      cible = t;
    }
    if (el) {
      el.classList.toggle("is-on", !!t);
      el.classList.toggle("is-large", !!large);
    }
    reveiller();
  }

  function appliquer() {
    if (actif()) {
      doc.addEventListener("pointermove", onMove, { passive: true });
    } else {
      doc.removeEventListener("pointermove", onMove);
      if (aimante) poserAimant(null, 0, 0);
      destroy();
    }
  }

  /* Le premier contact tactile met fin a la pointe pour de bon :
     un ecran hybride ne doit pas garder un reticule fantome. */
  doc.addEventListener("touchstart", function () {
    abandonne = true;
    appliquer();
  }, { passive: true, once: true });

  doc.addEventListener("pointerleave", function () {
    if (el) el.classList.remove("is-on");
    if (aimante) poserAimant(null, 0, 0);
    cible = null;
  });

  if (fine.addEventListener) fine.addEventListener("change", appliquer);
  if (reduced.addEventListener) reduced.addEventListener("change", appliquer);

  appliquer();
})();

