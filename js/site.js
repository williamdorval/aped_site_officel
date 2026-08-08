/* == ADEXWEB - Le socle de toutes les pages ==  D-840
   Rien de ce fichier n'est necessaire a la LECTURE ni a l'USAGE du site :
   sans lui, la page reste entierement lisible et tous les liens marchent. */
(function () {
  "use strict";

  var doc = document;
  var $ = function (s, r) { return (r || doc).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || doc).querySelectorAll(s)); };

  var douceur = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- 1 · LA BARRE SE DETACHE, UNE FOIS QU'ON A QUITTE LE HAUT ----
     Au repos elle ne dessine rien : aucun filet n'apparait au chargement. */
  var barre = $("[data-barre]");
  if (barre) {
    var detachee = false;
    var jauger = function () {
      var doitEtre = window.scrollY > 8;
      if (doitEtre === detachee) return;
      detachee = doitEtre;
      barre.setAttribute("data-detachee", doitEtre ? "oui" : "non");
    };
    jauger();
    window.addEventListener("scroll", jauger, { passive: true });
  }

  /* ---- 2 · LE MENU PLEIN ECRAN ----
     Piege de mise au point, retour au declencheur, Echap. Sans ces trois,
     un menu plein ecran est une souriciere au clavier. */
  var menu = $("#menu");
  var burger = $("#burger");
  if (menu && burger) {
    var declencheur = null;
    var focusables = function () {
      return $$("a[href], button:not([disabled]), input, select, textarea", menu)
        .filter(function (el) { return el.offsetParent !== null; });
    };

    var ouvrir = function () {
      declencheur = doc.activeElement;
      menu.hidden = false;
      burger.setAttribute("aria-expanded", "true");
      doc.body.style.overflow = "hidden";
      var premier = focusables()[0];
      if (premier) premier.focus();
    };
    var fermer = function () {
      menu.hidden = true;
      burger.setAttribute("aria-expanded", "false");
      doc.body.style.overflow = "";
      if (declencheur && declencheur.focus) declencheur.focus();
      declencheur = null;
    };

    burger.addEventListener("click", ouvrir);
    $$("[data-menu-ferme]", menu).forEach(function (b) { b.addEventListener("click", fermer); });
    // Un lien du menu ferme le menu : sur une ancre de la meme page, aucune
    // navigation n'a lieu et le menu resterait ouvert par-dessus la cible.
    $$("a", menu).forEach(function (a) { a.addEventListener("click", fermer); });

    doc.addEventListener("keydown", function (e) {
      if (menu.hidden) return;
      if (e.key === "Escape") { e.preventDefault(); fermer(); return; }
      if (e.key !== "Tab") return;
      var liste = focusables();
      if (liste.length === 0) return;
      var premier = liste[0];
      var dernier = liste[liste.length - 1];
      if (e.shiftKey && doc.activeElement === premier) { e.preventDefault(); dernier.focus(); }
      else if (!e.shiftKey && doc.activeElement === dernier) { e.preventDefault(); premier.focus(); }
    });
  }

  /* ---- 3 · UNE PORTE QUI N'EXISTE PAS SUR CETTE PAGE MENE A CONTACT ----
     Les modales ne sont pas embarquees sur toutes les pages : la 404 et la
     confidentialite s'en passent, et rien ne sert de les alourdir de 1 500
     lignes de balisage. Un bouton `data-modal-open` dont la modale est
     absente devient donc un lien vers la page de contact, au lieu de ne
     rien faire — un bouton mort est pire qu'un lien.  D-844 */
  doc.addEventListener("click", function (e) {
    var b = e.target.closest ? e.target.closest("[data-modal-open]") : null;
    if (!b) return;
    var cible = b.getAttribute("data-modal-open");
    if (doc.getElementById(cible)) return;   // la modale est la : main.js s'en charge
    e.preventDefault();
    e.stopPropagation();
    window.location.href = "contact.html#" + cible;
  }, true);

  /* ---- 4 · LE SEUL GESTE D'ENTREE DU SITE ----
     16 px, 500 ms, decalage 60 ms par BLOC. L'etat de repos est la forme
     FINALE : si le script ne tourne pas, tout est deja en place. Une fois
     joue, l'element ne rejoue jamais.  D-829 */
  var entrants = $$(".entre");
  if (entrants.length && douceur && "IntersectionObserver" in window) {
    var oeil = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.setAttribute("data-vu", "");
        oeil.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -20% 0px", threshold: 0 });

    entrants.forEach(function (el) {
      // Ce qui est deja a l'ecran au chargement se pose NET, sans transition :
      // un fondu de 500 ms sur le premier ecran retarde d'autant le moment ou
      // le titre est lisible, et le navigateur horodate le LCP a la DERNIERE
      // peinture. Mesure : 768 ms de LCP pour 204 de FCP.  D-854
      if (el.getBoundingClientRect().top < window.innerHeight) {
        el.setAttribute("data-vu-net", "");
      } else {
        oeil.observe(el);
      }
    });
  } else {
    entrants.forEach(function (el) { el.setAttribute("data-vu-net", ""); });
  }
})();
