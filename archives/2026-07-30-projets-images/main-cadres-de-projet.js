  /* ============================================================
     CADRES DE PROJET — le parcours se demande, il ne s'impose pas.

     Le cadre est INERTE au repos : on voit le haut du site client,
     immobile et net, parce que c'est ce qui se juge. Il ne se
     parcourt que sur une intention explicite, et il en accepte
     trois :
     · un survol PROLONGE de 520 ms — assez long pour qu'un pointeur
       qui traverse le cadre en allant ailleurs ne declenche rien ;
     · un clic, ou Entree et Espace au clavier ;
     · un defilement fait a l'interieur du cadre, qui prend
       immediatement le pas sur la lecture automatique.

     Tout passe par `scrollTop`, jamais par un `transform` : c'est
     la seule facon d'avoir UNE source de verite pour la molette, le
     doigt, les touches et la lecture automatique. Et comme le
     defilement natif s'enchaine vers la page une fois la capture au
     bout, le cadre ne peut pas retenir le visiteur.

     Ce bloc vit dans `main.js` et non dans `motion.js` : sous
     `prefers-reduced-motion` la lecture automatique se coupe, mais
     le cadre doit rester parcourable a la main. Perdre le mouvement
     ne doit jamais faire perdre le contenu.
     ============================================================ */
  $$("[data-shot]").forEach(function (cadre) {
    var boite = cadre.closest(".shot") || cadre;
    var img = $("img", cadre);
    var mot = $("[data-shot-mot]", boite);
    var jauge = $(".shot-jauge b", boite);
    if (!img) return;

    var actif = false;
    var raf = 0;
    var attente = 0;
    var lecture = false;      /* la lecture automatique tourne-t-elle */
    var derniereCible = 0;    /* pour distinguer notre defilement du sien */

    function course() { return Math.max(0, cadre.scrollHeight - cadre.clientHeight); }

    function majJauge() {
      var c = course();
      if (jauge) jauge.style.transform = "scaleX(" + (c ? cadre.scrollTop / c : 0) + ")";
    }

    function dire(t) { if (mot) mot.textContent = t; }

    function boucle() {
      if (!lecture) { raf = 0; return; }
      var c = course();
      if (cadre.scrollTop >= c - 0.5) {
        lecture = false;
        raf = 0;
        dire("Fin de la page. Molette pour remonter.");
        return;
      }
      /* 42 px par seconde environ : assez lent pour lire une mise en
         page, assez vif pour qu'on voie qu'il se passe quelque
         chose. */
      derniereCible = cadre.scrollTop + 0.7;
      cadre.scrollTop = derniereCible;
      majJauge();
      raf = requestAnimationFrame(boucle);
    }

    function activer(auto) {
      if (actif) return;
      actif = true;
      boite.classList.add("is-parcours");
      if (auto && !reduced.matches) {
        lecture = true;
        dire("Parcours en cours · molette pour reprendre la main");
        if (!raf) raf = requestAnimationFrame(boucle);
      } else {
        dire("À vous : molette, doigt ou flèches");
      }
    }

    function desactiver() {
      if (!actif) return;
      actif = false;
      lecture = false;
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      boite.classList.remove("is-parcours");
      dire("Survolez pour parcourir");
      cadre.scrollTo({ top: 0, behavior: reduced.matches ? "auto" : "smooth" });
      window.setTimeout(majJauge, reduced.matches ? 0 : 420);
    }

    /* --- survol prolonge --- */
    cadre.addEventListener("pointerenter", function (e) {
      if (e.pointerType !== "mouse") return;
      attente = window.setTimeout(function () { activer(true); }, 520);
    });
    cadre.addEventListener("pointerleave", function (e) {
      if (e.pointerType !== "mouse") return;
      window.clearTimeout(attente);
      desactiver();
    });

    /* --- clic et clavier --- */
    cadre.addEventListener("click", function () {
      window.clearTimeout(attente);
      if (actif) desactiver(); else activer(true);
    });
    cadre.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        if (actif) desactiver(); else activer(true);
      } else if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "PageDown" || e.key === "PageUp") {
        /* Les fleches parcourent la capture. On active d'abord, sinon
           le cadre est en `overflow: hidden` et rien ne bouge. */
        activer(false);
        lecture = false;
      }
    });
    cadre.addEventListener("focus", function () { activer(false); });
    cadre.addEventListener("blur", function () { desactiver(); });

    /* --- le visiteur prend la main --- */
    cadre.addEventListener("scroll", function () {
      majJauge();
      /* Si le defilement ne vient pas de notre boucle, il vient de
         lui : la lecture automatique s'arrete sans discussion. */
      if (lecture && Math.abs(cadre.scrollTop - derniereCible) > 2) {
        lecture = false;
        dire("À vous : molette, doigt ou flèches");
      }
    }, { passive: true });

    /* Au tactile il n'y a pas de survol : le premier contact active
       le cadre, et le doigt le parcourt ensuite normalement. */
    cadre.addEventListener("pointerdown", function (e) {
      if (e.pointerType === "mouse") return;
      activer(false);
    }, { passive: true });

    majJauge();
  });

