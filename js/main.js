/* ============================================================
   APED AGENCE - Logique
   Aucune dependance. GSAP n'intervient que dans motion.js : si le
   CDN tombe, les formulaires, les modales et le calculateur
   fonctionnent quand meme.
   ============================================================ */

(function () {
  "use strict";

  /* ------------------------------------------------------------
     Constantes metier. Inchangees.
     ------------------------------------------------------------ */
  var CONTACT_EMAIL = "dorvalwilliam11@gmail.com";
  var FORM_ENDPOINT = "https://formsubmit.co/ajax/" + CONTACT_EMAIL;

  var BOOKING = {
    businessDays: [1, 2, 3, 4, 5],
    slots: ["9:00", "9:30", "10:00", "10:30", "11:00", "11:30",
            "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"],
    minNoticeHours: 24,
    horizonDays: 42
  };

  var SUBJECTS = {
    project: "Nouveau projet - site APED",
    urgent: "URGENCE - site APED",
    refer: "Nouvelle reference - site APED",
    estimate: "Demande d'estimation - site APED",
    booking: "Demande de rendez-vous - site APED",
    roi: "Calcul ROI - site APED",
    cadeau: "Documents demandes - site APED"
  };

  /* ============================================================
     LE BAREME PUBLIE — et ce qui a disparu d'ici.

     Il y avait a cet endroit notre grille reelle : un prix de base
     par type de projet, et trois series de multiplicateurs pour
     l'envergure, le niveau de design et le delai. Elle etait
     lisible par quiconque ouvrait les outils de developpement. Elle
     donnait bien plus que des prix : les multiplicateurs disent
     comment on valorise le design par rapport a l'urgence,
     c'est-a-dire la structure de la marge.

     POURQUOI PAS UNE FONCTION SERVEUR. C'etait la premiere piste, et
     elle protege moins qu'elle n'en a l'air : les six questions
     n'offrent que 108 combinaisons. Un concurrent appelle la
     fonction 108 fois et reconstitue la grille exactement, en
     quelques minutes. Il faudrait donc y ajouter une limitation de
     debit sur un point d'entree public et anonyme, plus un
     hebergement qui execute du code — alors que ce site tient dans
     un dossier de fichiers et ne fait aujourd'hui aucune requete
     vers un tiers.

     POURQUOI PAS DES COEFFICIENTS MAQUILLES. Parce que le nombre
     AFFICHE reste le vrai nombre : quelle que soit la forme sous
     laquelle on range les coefficients, echantillonner les sorties
     les redonne. C'est du camouflage, pas de la protection.

     CE QUI EST FAIT : le calcul multiplicatif exact est remplace
     par un BAREME PUBLIE — cinq fourchettes larges, a bornes
     rondes, atteintes par un score grossier. Un concurrent qui
     epuise les 108 combinaisons apprend cinq fourchettes : tres
     exactement ce que cent-huit prospects apprendraient en soixante
     secondes chacun. Nos prix de base et nos multiplicateurs, eux,
     ne sont plus nulle part dans le navigateur.

     Le prix ferme reste dit au premier appel. C'est ce que la page
     promet, et c'est maintenant vrai jusque dans le code.
     ============================================================ */
  var BAREME = [
    { bas: 2500, haut: 5000 },
    { bas: 5000, haut: 10000 },
    { bas: 10000, haut: 20000 },
    { bas: 20000, haut: 40000 },
    { bas: 40000, haut: null }   /* au-dela : sur devis */
  ];

  /* Le score est GROSSIER a dessein : plusieurs combinaisons tombent
     dans la meme fourchette, donc aucune ne peut etre isolee. */
  var POIDS = {
    type: { vitrine: 0, automatisation: 1, ecommerce: 2, app: 4 },
    envergure: { petit: 0, moyen: 1, grand: 3 },
    design: { essentiel: 0, premium: 1, signature: 2 },
    delai: { flexible: 0, normal: 0, urgent: 1 }
  };

  var ANSWER_LABELS = {
    vitrine: "Site vitrine", ecommerce: "E-commerce", app: "Application ou logiciel",
    automatisation: "Automatisation et IA",
    restauration: "Restauration", construction: "Construction et services",
    commerce: "Commerce de detail", sante: "Sante et beaute", immobilier: "Immobilier", autre: "Autre",
    petit: "Simple", moyen: "Moyen", grand: "Ambitieux",
    essentiel: "Essentiel", premium: "Premium", signature: "Signature",
    urgent: "Urgent (moins d'un mois)", normal: "1 a 2 mois", flexible: "Flexible",
    oui: "Oui", non: "Non"
  };

  var doc = document;
  var root = doc.documentElement;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  var isDesktop = window.matchMedia("(min-width: 64em)");

  var $ = function (sel, ctx) { return (ctx || doc).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); };

  var fmtMoney = function (n) { return Math.round(n).toLocaleString("fr-CA") + " $"; };
  /* B7 · LA FAUSSE PRECISION INVITE EXACTEMENT LA CONTESTATION
     QU'ELLE VEUT EVITER. La section dit elle-meme, sous le detail,
     que c'est « un ordre de grandeur, pas une soumission » — et le
     rail affichait « 53 751 », au dollar pres, avant meme que le
     visiteur ait touche un curseur. Un chiffre arrondi a la centaine
     et precede de « environ » dit la meme chose et ne promet plus
     rien qu'on ne puisse tenir. Il stabilise en outre l'odometre :
     le ressort ne fait plus defiler des unites illisibles. */
  var fmtImpact = function (n) {
    return "≈ " + (Math.round(n / 100) * 100).toLocaleString("fr-CA") + " $";
  };
  var fmtHours = function (n) { return (Math.round(n * 10) / 10).toLocaleString("fr-CA") + " h"; };

  /* ============================================================
     Ressort. Sert a l'odometre du calculateur : le chiffre a une
     masse, il n'interpole pas lineairement.
     ============================================================ */
  function Spring(onFrame, stiffness, damping) {
    this.value = 0;
    this.target = 0;
    this.velocity = 0;
    this.k = stiffness || 120;
    this.d = damping || 20;
    this.onFrame = onFrame;
    this.raf = 0;
    this.last = 0;
  }
  Spring.prototype.set = function (target, immediate) {
    this.target = target;
    if (immediate || reduced.matches) {
      this.value = target;
      this.velocity = 0;
      this.onFrame(this.value);
      return;
    }
    if (!this.raf) {
      this.last = 0;
      this.raf = requestAnimationFrame(this.step.bind(this));
    }
  };
  Spring.prototype.step = function (now) {
    var dt = this.last ? Math.min((now - this.last) / 1000, 1 / 30) : 1 / 60;
    this.last = now;
    var force = (this.target - this.value) * this.k;
    this.velocity += (force - this.velocity * this.d) * dt;
    this.value += this.velocity * dt;
    var span = Math.max(1, Math.abs(this.target));
    if (Math.abs(this.target - this.value) < span * 0.0005 && Math.abs(this.velocity) < span * 0.02) {
      this.value = this.target;
      this.velocity = 0;
      this.raf = 0;
      this.onFrame(this.value);
      return;
    }
    this.onFrame(this.value);
    this.raf = requestAnimationFrame(this.step.bind(this));
  };

  /* ============================================================
     SEQUENCE D'ENTREE — CE QUE LE SCRIPT AJOUTE, ET CE QU'IL
     N'AJOUTE PAS.

     Le rideau se retire tout seul par une animation CSS : si ce
     bloc ne s'execute jamais, la page se decouvre quand meme. Le
     script ne fait donc que TROIS choses que le CSS ne peut pas :

     1. VISER. La plaque doit se rendre au cadre reel du hero, dont
        la position depend de la largeur de fenetre.
     2. ATTENDRE. `html.entree-attend` met en pause la derniere
        tranche de jauge, la remise de la plaque et l'ouverture du
        rideau, tant que les polices ne sont pas posees et que la
        limaille du hero n'est pas composee. C'est la vraie fonction
        de la sequence : elle couvre le chargement reel au lieu de
        faire semblant. Elle ne peut pas rester bloquee — le
        garde-fou leve la pause a 2,5 s depuis la navigation, quoi
        qu'il arrive.
     3. SAUTER. N'importe quel clic, n'importe quelle touche
        termine la sequence en 160 ms.

     Et il SORT le rideau du document une fois fini, pour ne pas
     laisser une couche de composition plein ecran en place pour le
     reste de la visite.
     ============================================================ */
  var entree = $("#entree");
  if (entree) {
    if (!root.classList.contains("entree-on")) {
      entree.parentNode.removeChild(entree);
    } else if (reduced.matches) {
      /* Mouvement reduit : le CSS pose le monogramme, le tient
         520 ms, puis le fait disparaitre d'un cran. On ne fait que
         retirer le noeud une fois qu'il n'est plus visible. */
      window.setTimeout(function () {
        root.classList.remove("entree-on");
        if (entree.parentNode) entree.parentNode.removeChild(entree);
      }, 640);
    } else {
      /* LA PLAQUE SE REND A LA PLACE DU HERO.
         Le monogramme du rideau et la plaque de limaille sont la
         MEME chose a deux moments : le rideau la tient au centre de
         l'ecran, le hero la tient dans son cadre. On mesure donc le
         cadre reel et on donne a la plaque le vecteur exact pour s'y
         rendre. Elle s'efface une fois arrivee, pendant que les
         grains, eux, sont deja en train de composer APED dessous :
         le relais se fait sur la matiere, pas sur un fondu.

         GARDE-FOU : la remise part a 640 ms. Si ce script arrive
         apres, on ne touche a rien — changer la cible d'une
         animation deja commencee produirait un saut, ce qui est pire
         qu'un geste generique. Les valeurs de repli du CSS prennent
         alors le relais. */
      (function viser() {
        if (performance.now() > 600) return;
        var plaque = entree.querySelector(".entree-plaque");
        var cadre = $("#heroPlate");
        if (!plaque || !cadre) return;
        var c = cadre.getBoundingClientRect();
        if (!c.width || !c.height) return;
        var cx = c.left + c.width / 2;
        var cy = c.top + c.height / 2;
        plaque.style.setProperty("--entree-dx", Math.round(cx - window.innerWidth / 2) + "px");
        plaque.style.setProperty("--entree-dy", Math.round(cy - window.innerHeight / 2) + "px");
      })();

      /* ---------- 2. L'ATTENTE ----------
         On pose la pause TOUT DE SUITE, sans se demander si elle est
         necessaire : la lever coute une classe, alors que la poser
         trop tard ne sert plus a rien — la jauge est deja passee.
         Elle est levee des que les deux conditions tombent, donc
         dans le cas normal elle n'aura jamais ete visible. */
      /* ---------- LA COMPOSITION DU HERO A SA PROPRE VIE ----------

         DEFAUT MESURE LE 2026-07-29 par `tools/accueil-check.mjs`.
         Les onze pas de la composition etaient d'abord accroches a
         `html.entree-on`. Or cette classe tombe avec le rideau, vers
         1,3 s : les cinq rangees de la fiche technique, dont le
         retard va de 1 140 a 1 420 ms, voyaient donc leur animation
         ANNULEE en vol et se posaient d'un coup. Releve : les six
         premiers pas se decouvraient normalement, les cinq suivants
         n'avaient tout simplement aucune duree.

         Une classe a part, et le probleme n'existe plus : le rideau
         garde son cycle — il faut qu'il parte tot, c'est un rideau —
         et la composition garde le sien. Elle ne demarre que si la
         sequence joue, donc sans script il n'y a pas de plaque du
         tout et le hero est simplement la ; et elle est retiree une
         fois finie, pour ne pas laisser onze pseudo-elements
         composites en place pour le reste de la visite. */
      var leve = false;
      function lever() {
        if (leve) return;
        leve = true;
        root.classList.remove("entree-attend");
      }
      root.classList.add("entree-attend");
      /* LES PLAQUES SONT POSEES TOUT DE SUITE, MAIS A L'ARRET.

         DEFAUT VU DANS NOS PROPRES CAPTURES, 2026-07-29.
         Premiere tentative de correction : poser `compo-hero` a la
         fin du rideau, pour que les retards partent de la. Mais les
         quinze bandes ne sortent PAS toutes en meme temps — celles
         qui couvrent le titre ont `--k` de 1 a 3, donc elles sont
         parties des 1 072 ms, alors que la derniere, celle qui porte
         `data-entree-fin` et declenche la suite, ne finit qu'a
         1 168 ms. Pendant ces ~96 ms, le titre etait nu ; puis la
         plaque tombait dessus et le recouvrait pour le decouvrir a
         nouveau. Un CLIGNOTEMENT, c'est-a-dire l'inverse exact de ce
         qu'on cherche. Releve : `refonte-captures/accueil/sequences/
         titre/00-1337ms.png` (titre nu) contre `03-1521ms.png`
         (recouvert).

         La classe est donc posee ICI, avant que le rideau ne
         decouvre quoi que ce soit, et les animations sont mises a
         l'ARRET par `compo-attend` jusqu'a la disparition du rideau.
         Une animation en pause n'avance pas son horloge : les
         retards partent donc bien de la levee, et le titre n'est
         jamais nu une seule image. */
      root.classList.add("compo-hero");
      root.classList.add("compo-attend");

      var restent = 2;
      function pret() { if (--restent <= 0) lever(); }

      /* Les polices. `document.fonts.ready` se resout quand toutes
         celles qui sont DEMANDEES par la page sont chargees. Les
         trois `woff2` sont en `preload` : dans le cas normal c'est
         deja fait, et la promesse se resout dans la foulee. */
      if (doc.fonts && doc.fonts.ready && typeof doc.fonts.ready.then === "function") {
        doc.fonts.ready.then(pret, pret);
      } else { pret(); }

      /* La limaille du hero. `hero.js` pose `is-live` sur l'hote une
         fois les 25 000 cibles composees ; c'est le poste le plus
         lourd du chargement et c'est exactement celui qu'il faut
         couvrir. `is-fallback` compte aussi : le canevas a renonce,
         il n'y a plus rien a attendre. */
      (function attendreLimaille() {
        var hote = $("#heroPlate");
        if (!hote) { pret(); return; }
        if (hote.classList.contains("is-live") || hote.classList.contains("is-fallback")) { pret(); return; }
        var obs = new MutationObserver(function () {
          if (hote.classList.contains("is-live") || hote.classList.contains("is-fallback")) {
            obs.disconnect();
            pret();
          }
        });
        obs.observe(hote, { attributes: true, attributeFilter: ["class"] });
        /* L'observateur n'est pas un contrat : si la classe
           n'arrive jamais, le garde-fou general tranche. */
      })();

      /* ---------- LE GARDE-FOU ----------
         2,5 s DEPUIS LA NAVIGATION, pas depuis ici. La difference
         compte : ce script s'execute deja quelques dizaines de
         millisecondes apres le depart, et c'est la duree totale vue
         par le visiteur qui est plafonnee, pas la notre. */
      window.setTimeout(lever, Math.max(0, 2500 - performance.now()));

      /* ---------- 3. LE SAUT ----------
         N'importe quel clic, n'importe quelle touche. Le rideau
         porte `pointer-events: none`, donc l'ecouteur va sur la
         fenetre, en capture : il voit le geste avant que la page
         dessous s'en serve, et il ne l'empeche pas — un visiteur qui
         clique sur un bouton pendant la sequence declenche le bouton
         ET termine la sequence. C'est le comportement juste : il
         savait ce qu'il visait, le contenu etait deja peint dessous.

         LE SAUT NE SE MEMORISE PLUS, et c'est un defaut corrige.
         On ecrivait `sessionStorage["aped-entree-saut"] = "1"` ici.
         Or cet ecouteur voit N'IMPORTE QUEL `pointerdown` et
         N'IMPORTE QUEL `keydown` — donc un clic sur un bouton du
         site, et la touche F5 elle-meme. Un seul geste pendant la
         premiere seconde, et le script en tete de document ne posait
         plus `entree-on` : ni rideau, ni `compo-hero`, ni composition
         du hero, pour tout le reste de l'onglet. Releve du
         2026-07-29 par `tools/diag-accueil.mjs`, quatre rechargements
         de suite a `<html class="js">`.
         Sauter reste immediat — c'est le sens de ce geste — mais
         c'est une decision qui vaut POUR CETTE VUE-LA. Un
         rechargement est une arrivee, pas la suite de la precedente. */
      function sauter() {
        if (root.classList.contains("entree-saut")) return;
        lever();
        root.classList.add("entree-saut");
        window.setTimeout(finir, 200);
      }
      var opts = { capture: true, passive: true, once: true };
      window.addEventListener("pointerdown", sauter, opts);
      window.addEventListener("keydown", sauter, opts);

      /* ---------- LA FIN, ET LE DEPART DE LA COMPOSITION ----------
         Le rideau lui-meme n'anime plus rien : ce sont ses quinze
         bandes. On ecoute donc la DERNIERE, celle qui porte le
         marqueur, et pas le conteneur.

         LA COMPOSITION DEMARRE ICI, ET C'EST TOUT L'INTERET.
         `compo-hero` etait posee plus haut, au moment ou ce script
         s'execute. Or une animation CSS demarre son horloge quand
         elle est DECLAREE : les onze retards partaient donc de
         l'instant ou `main.js` tourne — c'est-a-dire apres deux
         `requestAnimationFrame` plus l'injection, un instant qui
         varie d'une machine a l'autre. Releve du 2026-07-29 : le
         rideau partait avec +103 ms de decalage sur l'heure ecrite,
         la composition avec +281 ms. Deux horloges differentes pour
         deux gestes qui doivent s'enchainer, ca ne peut pas tenir :
         sur une machine rapide, la composition repassait sous le
         rideau ; sur une machine lente, elle laissait un trou.

         La classe est maintenant posee a l'instant EXACT ou le
         rideau disparait. Les `--e` du document ne sont plus des
         heures depuis la navigation mais des retards depuis
         l'ouverture — 0 pour le premier pas, ce qui veut dire
         « tout de suite ». Le passage de l'un a l'autre est
         deterministe, quelle que soit la machine.

         `fini` garde l'idempotence : cette fonction est appelee par
         la fin d'animation, par le saut, et par un filet de
         securite. Poser deux fois la classe ne couterait rien, mais
         programmer deux fois son retrait, si. */
      var fini = false;
      function finir() {
        root.classList.remove("entree-on");
        root.classList.remove("entree-attend");
        if (entree.parentNode) entree.parentNode.removeChild(entree);
        if (fini) return;
        fini = true;
        /* LE DEPART. La pause tombe, les onze horloges partent
           ensemble, et `--e:0` veut dire « maintenant ». */
        root.classList.remove("compo-attend");
        /* 3,2 s de budget. Le dernier geste est la soudure du filet
           de pied de fiche : retard 1 240 + 300 ms, puis 600 ms de
           soudure, soit 2 140 ms. Il reste une seconde de marge pour
           une machine lente. Retirer la classe trop tard ne coute
           rien — c'est une classe sur `<html>` et plus aucune
           animation n'y est attachee ; la couper trop tot pose les
           derniers pas d'un bloc, defaut deja paye une fois. */
        window.setTimeout(function () {
          root.classList.remove("compo-hero");
          root.classList.remove("compo-attend");
          root.classList.remove("entree-saut");
        }, 3200);
      }
      entree.addEventListener("animationend", function (e) {
        if (!e.target.hasAttribute || !e.target.hasAttribute("data-entree-fin")) return;
        finir();
      });
      /* Filet de securite : si l'animation ne se declenche pas du
         tout (onglet en arriere-plan au chargement, par exemple), on
         retire le rideau. Cale sur le garde-fou de la pause plus la
         duree de l'ouverture, sinon il couperait une sequence qui
         s'allonge legitimement. */
      window.setTimeout(finir, Math.max(1800, 2500 - performance.now() + 700));
    }
  }

  /* ============================================================
     RAIL DES SERVICES — orientation.

     Ce bloc est ici, et pas dans `js/motion.js`, pour une raison
     precise : `motion.js` s'arrete net sous `prefers-reduced-motion`.
     Y mettre le compteur et le nom du chantier reviendrait a
     supprimer le N1 — « ou je suis, combien il en reste » — pour
     exactement les gens qui ont demande moins de mouvement.

     Ce que ce bloc garantit sans GSAP, sans pin, sans animation :
     · la piste se parcourt au doigt, a la molette laterale et au
       clavier (fleches, Origine, Fin) ;
     · le compteur et le nom suivent le defilement reel ;
     · les deux boutons fonctionnent.
     `motion.js` ne fait ensuite que REMPLACER le geste — glisser
     devient descendre — en reecrivant `APED_SVC.aller`.
     ============================================================ */
  (function railServices() {
    var svc = $("#svc");
    var piste = $("#svcPiste");
    var rail = $("#svcRail");
    var cartes = $$(".svc-carte");
    if (!svc || !piste || !rail || !cartes.length) return;

    var num = $("#svcNum");
    var nom = $("#svcNow");
    var courant = 0;

    function poser(i) {
      i = Math.max(0, Math.min(cartes.length - 1, i));
      courant = i;
      cartes.forEach(function (c, k) { c.classList.toggle("is-on", k === i); });
      /* PHASE 8 · V4 — le compteur roule d'un cran. `rouler()` est
         une DECLARATION de fonction plus bas dans le meme IIFE :
         elle est hissee, donc appelable ici meme a l'initialisation. */
      if (num) rouler(num, ("0" + (i + 1)).slice(-2));
      if (nom) nom.textContent = cartes[i].getAttribute("data-svc-carte") || "";
    }

    /* Deplacement par defaut : la piste native. `motion.js` remplace
       cette fonction quand il prend la main sur le geste. */
    var api = {
      svc: svc,
      piste: piste,
      rail: rail,
      cartes: cartes,
      poser: poser,
      index: function () { return courant; },
      aller: function (i) {
        i = Math.max(0, Math.min(cartes.length - 1, i));
        piste.scrollTo({ left: cartes[i].offsetLeft, behavior: reduced.matches ? "auto" : "smooth" });
      }
    };
    window.APED_SVC = api;

    /* Le compteur suit le defilement REEL de la piste. Sous 1024 px
       c'est le seul mecanisme ; au-dessus, le pin fige la piste a
       zero et c'est `motion.js` qui appelle `poser()`. */
    var attente = 0;
    piste.addEventListener("scroll", function () {
      if (attente || svc.classList.contains("is-pinned")) return;
      attente = requestAnimationFrame(function () {
        attente = 0;
        var g = piste.getBoundingClientRect().left;
        var meilleur = 0, ecart = Infinity;
        cartes.forEach(function (c, k) {
          var d = Math.abs(c.getBoundingClientRect().left - g);
          if (d < ecart) { ecart = d; meilleur = k; }
        });
        if (meilleur !== courant) poser(meilleur);
      });
    }, { passive: true });

    $$("[data-svc]").forEach(function (b) {
      b.addEventListener("click", function () {
        api.aller(courant + Number(b.getAttribute("data-svc")));
      });
    });

    /* Une zone a debordement horizontal DOIT etre atteignable au
       clavier : sans ca c'est un echec WCAG 2.1.1 et 2.1.3, niveau
       A. `tabindex="0"` est dans le markup, les touches sont ici. */
    piste.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { e.preventDefault(); api.aller(courant + 1); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); api.aller(courant - 1); }
      else if (e.key === "Home") { e.preventDefault(); api.aller(0); }
      else if (e.key === "End") { e.preventDefault(); api.aller(cartes.length - 1); }
    });

    poser(0);
  })();

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

  /* ============================================================
     PARCOURS — compteur d'etape.

     Ici et pas dans `motion.js`, pour la meme raison que le rail des
     services : ce fichier-la ne s'execute pas sous
     `prefers-reduced-motion`, et « a quelle etape je suis » ne se
     supprime pas parce que quelqu'un a demande moins de mouvement.
     Un `IntersectionObserver` suffit : aucun ecouteur de defilement,
     aucun calcul par image.
     ============================================================ */
  (function parcours() {
    var etapes = $$(".parc-etape");
    if (!etapes.length) return;
    var num = $("#parcNum");
    var nom = $("#parcNom");
    var reste = $("#parcReste");
    var courante = -1;

    function poser(i) {
      if (i === courante) return;
      courante = i;
      etapes.forEach(function (e, k) { e.classList.toggle("is-on", k <= i); });
      /* PHASE 8 · V4 — l'etape roule d'un cran. */
      if (num) rouler(num, ("0" + (i + 1)).slice(-2));
      if (nom) nom.textContent = etapes[i].getAttribute("data-parc") || "";
      if (reste) {
        var r = etapes.length - 1 - i;
        reste.textContent = r === 0
          ? "Dernière étape"
          : r + (r > 1 ? " étapes après celle-ci" : " étape après celle-ci");
      }
    }

    if (!("IntersectionObserver" in window)) { poser(0); return; }
    /* La bande de declenchement est une tranche fine au tiers haut
       de l'ecran : l'etape active est celle qu'on est en train de
       lire, pas celle qui vient d'entrer par le bas. */
    var obs = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (e) {
        if (e.isIntersecting) poser(etapes.indexOf(e.target));
      });
    }, { rootMargin: "-30% 0px -60% 0px" });
    etapes.forEach(function (e) { obs.observe(e); });
    poser(0);
  })();

  /* ============================================================
     LE CADEAU — QUAND IL PARAIT, ET POURQUOI CE N'EST PLUS CE QUE
     C'ETAIT.

     LE DEFAUT MESURE. L'ancienne version armait a 12 s, exigeait un
     defilement de 55 % OU un curseur du calculateur bouge, et
     n'offrait l'intention de sortie qu'a 25 s. Surtout, elle posait
     son marqueur dans `localStorage` DES LA PREMIERE OUVERTURE. Un
     visiteur qui rechargeait la page ne le revoyait donc plus
     jamais, sur aucune visite, pour toujours. C'est la vraie raison
     du « il n'apparait presque jamais ».

     CE QUE DISENT LES DONNEES, ET ON LES SUIT MAINTENANT JUSQU'AU
     BOUT. Trois bases independantes — un milliard, 1,24 milliard et
     105 millions d'affichages — classent l'intention de sortie
     DERNIERE de tous les declencheurs mesures : 3,94 % contre
     6,45 % pour une attente de 11 a 15 secondes chez le premier
     editeur, 1,8 % contre 2,9 % chez le deuxieme. Le pic est donc
     une ATTENTE COURTE, et c'est elle qui devient le declencheur
     principal.

     L'ORDRE, DESORMAIS :
     1. PRINCIPAL — 11 s de presence, a chaque chargement. Onze,
        parce que c'est le debut de la fenetre 11-15 s ou le pic est
        mesure, et parce qu'entre deux valeurs egales on prend la
        plus courte : le visiteur qui part tot est celui qu'on perd.
     2. ANTICIPE — un engagement fort avant ces 11 s le fait paraitre
        LA, au moment chaud. Trois signaux, et seulement trois :
        · le resultat du calculateur consulte — il a bouge un
          curseur ET regarde le chiffre ;
        · la visite 360 ouverte — il est entre dans la demonstration ;
        · la section Projets atteinte — il regarde les preuves.
        PLANCHER DE 4 s quand meme : un visiteur qui defile vite
        atteint Projets en deux secondes, et un popup a la deuxieme
        seconde est le pire declencheur de tous les jeux de donnees.
     3. DERNIER RECOURS — l'intention de sortie, et uniquement si
        rien n'a encore paru. On la garde parce que le brief la
        nomme, pas parce qu'elle est bonne.

     LA FREQUENCE — DECISION DU PROPRIETAIRE DU SITE, 2026-07-26.

     IL PARAIT A CHAQUE CHARGEMENT, SANS EXCEPTION. Pas une fois par
     session, pas une fois par jour : chaque fois.

     CE QUI A ETE DIT AVANT DE LE FAIRE, parce que le prochain qui
     lira ce fichier se demandera si c'est un oubli. Ce n'en est pas
     un. Les mesures classent le rappel a chaque chargement parmi
     les motifs les plus mal recus, et redemander une adresse deja
     donnee dit au visiteur qu'on ne l'a pas ecoute. L'arbitrage a
     ete pose, l'argument entendu, la decision maintenue. Elle est
     donc appliquee entierement plutot qu'a moitie — une regle
     appliquee a moitie est le pire des deux mondes.

     CE QUI RESTE MALGRE « TOUJOURS », et qui n'est pas de la
     memoire mais de la tenue :
     · UNE SEULE FOIS PAR CHARGEMENT DE PAGE. `paru` est une
       variable, pas un stockage : elle meurt avec la page. Deux
       ouvertures dans la meme page ne seraient pas de l'insistance,
       ce serait une panne.
     · JAMAIS PENDANT QU'IL FAIT QUELQUE CHOSE. S'il est dans un
       champ, ou s'il a touche au calculateur il y a moins de deux
       secondes, on ne l'interrompt pas : on REPORTE et on retente
       des qu'il s'arrete. Un popup qui coupe une saisie est percu
       comme une panne, et « toujours » ne veut pas dire « au pire
       moment ».
     · JAMAIS PAR-DESSUS UNE AUTRE COUCHE. Deux surcouches d'un coup
       et le visiteur ferme les deux sans lire.

     LES ANCIENNES CLES SONT EFFACEES, PAS IGNOREES. `aped-cadeau`
     et `aped-cadeau-donne` ne veulent plus rien dire : les laisser
     dans le stockage des visiteurs, c'est preparer le prochain
     malentendu — on vient d'en payer un.

     LE SEUL SUPPRESSEUR EST UN INSTRUMENT, ET IL PORTE SON NOM.
     `sessionStorage["aped-sans-popup"]` n'est pas une regle
     produit : c'est l'interrupteur des trente outils de mesure, qui
     mesurent autre chose que le popup et ne peuvent pas travailler
     sous une surcouche. Il s'appelle « sans-popup » et pas
     « deja-vu » exactement pour qu'on ne le confonde jamais avec
     une decision de produit.
     ============================================================ */
  (function cadeau() {
    var boite = $("#cadeau");
    if (!boite || typeof boite.showModal !== "function") return;

    /* Les deux marqueurs de l'ancienne regle sont effaces a chaque
       chargement. Une cle morte dans le stockage d'un visiteur est
       une bombe a retardement : c'est exactement ce qui a fait que
       personne ne voyait le popup. */
    try {
      localStorage.removeItem("aped-cadeau");
      localStorage.removeItem("aped-cadeau-donne");
    } catch (e) {}

    /* L'INTERRUPTEUR DES OUTILS DE MESURE. Voir l'en-tete. */
    var vu = false;
    try { vu = sessionStorage.getItem("aped-sans-popup") === "1"; } catch (e) {}

    var declencheur = null;
    var ouvert = false;
    var paru = false;
    var depart = performance.now();
    var derniereAction = 0;

    var PRINCIPAL = 11000;  /* le pic mesure : 11 a 15 s */
    var PLANCHER = 4000;    /* aucun declencheur avant, meme anticipe */
    var SORTIE = 20000;     /* dernier recours */

    /* Il est OCCUPE si le focus est dans un champ, ou s'il vient de
       toucher au calculateur. Deux secondes : le temps qu'un chiffre
       s'installe et qu'on le lise. */
    function occupe() {
      var a = doc.activeElement;
      if (a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)) return true;
      if (performance.now() - derniereAction < 2000) return true;
      if ($(".modal:not([hidden])")) return true;
      if (menu && !menu.hidden) return true;
      return false;
    }

    /* On REPORTE au lieu d'abandonner : c'est la difference entre
       « pas maintenant » et « jamais ». Au plus dix reprises, une
       par seconde — au-dela, le visiteur ne s'arrete pas, et
       insister serait le harceler. */
    function ouvrir(reprises) {
      if (vu || ouvert || paru) return;
      if (performance.now() - depart < PLANCHER) {
        window.setTimeout(function () { ouvrir(0); }, PLANCHER - (performance.now() - depart));
        return;
      }
      if (occupe()) {
        var n = (reprises || 0) + 1;
        if (n > 10) return;
        window.setTimeout(function () { ouvrir(n); }, 1000);
        return;
      }
      ouvert = true;
      paru = true;
      declencheur = doc.activeElement;
      boite.showModal();
      /* Le focus va au bouton de fermeture, pas au champ : ouvrir
         sur un curseur clignotant dans un formulaire non demande se
         lit comme une reclamation, pas comme un cadeau. */
      var x = $(".cadeau-x", boite);
      if (x) x.focus();
    }

    /* LA SORTIE EST LA RECIPROQUE DE L'ENTREE. On pose la classe,
       on laisse l'animation CSS se terminer, PUIS on ferme. Sans
       l'attente, `close()` retire l'element de la couche superieure
       a la premiere image et la reciproque ne se voit jamais. */
    function fermer() {
      if (!ouvert || boite.classList.contains("se-retire")) return;
      if (reduced.matches) { boite.close(); return; }
      boite.classList.add("se-retire");
      window.setTimeout(function () {
        boite.classList.remove("se-retire");
        boite.close();
      }, 220);
    }

    boite.addEventListener("close", function () {
      ouvert = false;
      boite.classList.remove("se-retire");
      /* Le natif ne rend pas le focus : on le fait. */
      if (declencheur && declencheur.focus) { try { declencheur.focus(); } catch (e) {} }
    });
    /* Echap passe par `cancel`, pas par nos boutons : on lui donne
       la meme reciproque, sinon la seule sortie clavier serait la
       seule sans mise en scene. */
    boite.addEventListener("cancel", function (e) {
      if (reduced.matches || boite.classList.contains("se-retire")) return;
      e.preventDefault();
      fermer();
    });
    $$("[data-cadeau-non]", boite).forEach(function (b) {
      b.addEventListener("click", fermer);
    });

    /* --- LE FORMULAIRE. Il vit meme si le popup ne parait jamais :
           le meme document est offert ailleurs sur le site. --- */
    (function formulaire() {
      var form = $("#cadeauForm");
      if (!form) return;
      var champ = $("#cadeauEmail", form);
      var etat = $(".form-status", form);
      var bouton = $(".cadeau-go", form);
      var recu = $(".cadeau-recu", boite);

      /* A3 · LA REMISE N'EST PLUS CACHEE AU DEPART.
         Elle exigeait une adresse pour deverrouiller ce que le pied de
         page donne directement — la contradiction « sans courriel »
         que l'audit du 2026-07-29 a relevee. Les deux liens sont donc
         visibles des l'ouverture. `hidden = false` reste : il ne coute
         rien et il protege le jour ou quelque chose d'autre les
         cacherait. Le focus, lui, garde son sens : apres un envoi, ce
         qu'on vient de promettre est ce que le clavier atteint. */
      function remettre() {
        if (!recu) return;
        recu.hidden = false;
        var a = $("a", recu);
        if (a) a.focus();
      }

      form.addEventListener("submit", function (e) {
        e.preventDefault();
        say(etat, "");
        /* LE CHAMP N'EST PLUS `required`, DONC `validate()` NE PEUT
           PLUS LE JUGER : sa premiere regle est « pas requis, donc
           valide », ce qui laisserait passer une adresse vide ou
           malformee jusqu'au service d'envoi. On valide donc ici, a la
           main, et seulement parce que le visiteur a demande un envoi
           par courriel — s'il voulait les guides, il les a deja
           au-dessus. */
        var adresse = champ.value.trim();
        var champBoite = champ.closest(".field");
        var valide = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adresse);
        if (!valide) {
          if (champBoite) markField(champBoite, false);
          say(etat, adresse
            ? "Cette adresse ne semble pas valide. Les deux guides restent téléchargeables juste au-dessus."
            : "Entrez une adresse pour recevoir la copie. Les deux guides sont déjà téléchargeables juste au-dessus.", "err");
          champ.focus();
          return;
        }
        if (champBoite) markField(champBoite, true);
        if (bouton) setLoading(bouton, true, "Envoi en cours…");

        /* ------------------------------------------------------------
           CE QUI PART VERS LE VISITEUR, ET CE QUI N'EST PAS POSSIBLE.

           Le service d'envoi utilise par ce site notifie L'AGENCE.
           Il sait aussi renvoyer un accuse au visiteur — c'est le
           champ `_autoresponse` — mais c'est du TEXTE : il ne peut
           pas y joindre deux fichiers de deux megaoctets. Aucun
           service de formulaire sans serveur ne le peut.

           Les deux documents partent donc vers le visiteur sous
           forme de LIENS, dans ce message, et ils sont en meme temps
           remis sur place dans le popup — c'est la remise qui compte,
           le courriel n'est que la copie qu'il retrouvera plus tard.
           Dire « les deux PDF arrivent en piece jointe » serait faux ;
           ce qui est vrai, c'est qu'il les a tout de suite et qu'il
           les retrouve dans sa boite.

           LES ADRESSES SONT CALCULEES, PAS ECRITES. `new URL(...,
           location.href)` rend l'adresse absolue reelle du serveur
           qui sert la page. Une adresse ecrite en dur serait fausse
           le jour de la mise en ligne, et personne ne s'en
           apercevrait avant qu'un visiteur clique. */
        var lien1 = new URL("documents/aped-automatisation.pdf", location.href).href;
        var lien2 = new URL("documents/aped-ia-croissance.pdf", location.href).href;
        var reponse = [
          "Merci — voici vos deux guides.",
          "",
          "1. Ce que votre entreprise pourrait automatiser (42 pages)",
          "   " + lien1,
          "",
          "2. Comment utiliser l'IA pour faire grossir votre entreprise (49 pages)",
          "   " + lien2,
          "",
          "Ils sont a vous, meme si vous ne nous engagez jamais.",
          "Une question ? Repondez simplement a ce courriel.",
          "",
          "APED Agence — Quebec",
          CONTACT_EMAIL
        ].join("\n");

        sendJson("cadeau", {
          email: adresse,
          documents: "Automatisation (42 p.) + IA et croissance (49 p.)",
          origine: "Popup cadeau",
          lien_automatisation: lien1,
          lien_ia: lien2,
          _autoresponse: reponse
        }).then(function () {
          say(etat, "C’est parti vers " + adresse + ". Les deux guides sont aussi téléchargeables ici, tout de suite.", "ok");
        }).catch(function () {
          /* L'envoi a echoue : le cadeau, lui, ne peut pas echouer.
             On le remet sur place et on le dit sans jargon. */
          say(etat, "L’envoi par courriel n’a pas passé. Vos deux guides sont téléchargeables ici, tout de suite.", "err");
        }).then(function () {
          form.reset();
          if (bouton) setLoading(bouton, false);
          remettre();
        });
      });
    })();

    if (vu) return;

    /* LES DEUX COUVERTURES SONT CHARGEES A L'AVANCE, mais PAS au
       chargement de la page.
       Elles pesent 147 Ko a elles deux et ne sont visibles que dans
       un popup : les mettre sur le chemin critique serait payer
       cher pour une image que neuf visiteurs sur dix ne verront
       jamais. Elles portent donc `loading="lazy"`, ce qui les fait
       arriver APRES l'ouverture — le cadeau s'ouvrirait sur deux
       cadres vides, ce qui est exactement le contraire de l'effet
       recherche.
       On les demande donc trois secondes avant l'ouverture prevue,
       en arriere-plan, sans rien bloquer. A l'ouverture elles sont
       dans le cache. */
    window.setTimeout(function () {
      $$(".cadeau-couv", boite).forEach(function (img) {
        var pre = new Image();
        pre.decoding = "async";
        pre.src = img.getAttribute("src");
      });
    }, Math.max(0, PLANCHER - 1500));

    /* --- 1. PRINCIPAL : 11 s, a chaque chargement --- */
    window.setTimeout(function () { ouvrir(0); }, PRINCIPAL);

    /* --- 2. ANTICIPE : trois signaux d'engagement fort --- */
    /* a) le resultat du calculateur consulte. On laisse le chiffre
          s'installer avant d'interrompre : 2,2 s. */
    $$("#calculateur input[type='range'], #calculateur button").forEach(function (c) {
      c.addEventListener("change", function () { derniereAction = performance.now(); }, { passive: true });
      c.addEventListener("input", function () { derniereAction = performance.now(); }, { passive: true });
    });
    var regle = false;
    $$("#calculateur input[type='range']").forEach(function (c) {
      c.addEventListener("change", function () {
        derniereAction = performance.now();
        if (regle || vu) return;
        regle = true;
        window.setTimeout(function () { ouvrir(0); }, 2200);
      });
    });

    /* b) la visite 360 ouverte. */
    var tour = $("[data-tour-start]");
    if (tour) {
      tour.addEventListener("click", function () {
        /* Il vient d'entrer dans la demonstration : on le laisse
           regarder six secondes avant de dire quoi que ce soit. */
        window.setTimeout(function () { ouvrir(0); }, 6000);
      });
    }

    /* c) la section Projets atteinte. */
    var projets = doc.getElementById("realisations");
    if (projets && "IntersectionObserver" in window) {
      var obsP = new IntersectionObserver(function (entrees) {
        entrees.forEach(function (e) {
          if (!e.isIntersecting) return;
          obsP.disconnect();
          ouvrir(0);
        });
      }, { rootMargin: "-30% 0px -30% 0px", threshold: 0 });
      obsP.observe(projets);
    }

    /* --- 3. DERNIER RECOURS : l'intention de sortie, souris
           seulement, et seulement si rien n'a paru. --- */
    window.setTimeout(function () {
      if (vu || paru) return;
      if (!window.matchMedia("(pointer: fine)").matches) return;
      doc.addEventListener("mouseleave", function (e) {
        if (e.clientY <= 0) ouvrir(0);
      });
    }, SORTIE);
  })();

  /* ============================================================
     Theme. Le basculement est anime, mais jamais au chargement.
     ============================================================ */
  var themeToggle = $("#themeToggle");

  function labelTheme(next) {
    if (!themeToggle) return;
    themeToggle.setAttribute("aria-label", next === "dark" ? "Basculer en thème clair" : "Basculer en thème sombre");
  }
  labelTheme(root.getAttribute("data-theme"));

  // La barre du navigateur doit suivre la bascule manuelle. Avec des
  // balises `theme-color` en `media`, elle restait sur la preference
  // systeme et contredisait la page.
  var metaThemeColor = $("#metaThemeColor");

  function applyTheme(next) {
    root.classList.add("theme-shifting");
    root.setAttribute("data-theme", next);
    labelTheme(next);
    if (metaThemeColor) metaThemeColor.setAttribute("content", next === "dark" ? "#101211" : "#dcdedb");
    try { localStorage.setItem("aped-theme", next); } catch (e) {}
    window.setTimeout(function () { root.classList.remove("theme-shifting"); }, 560);
    /* Tout ce qui peint hors CSS doit etre prevenu. Le canvas du hero
       lit ses trois couleurs dans les tokens : sans cet evenement il
       gardait celles du theme de depart, ce qui donnait le bloc noir
       sur ciment clair. Un evenement plutot qu'un appel direct : la
       barre ne connait pas le hero, et n'a pas a le connaitre. */
    doc.dispatchEvent(new CustomEvent("aped:theme", { detail: { theme: next } }));
  }

  /* Le theme systeme peut changer PENDANT la visite (coucher de
     soleil sous macOS et Windows). On ne suit ce changement que si le
     visiteur n'a jamais tranche lui-meme : un choix explicite gagne
     toujours sur une preference systeme. */
  (function suivreSysteme() {
    var mq = window.matchMedia("(prefers-color-scheme: dark)");
    var choisi = null;
    try { choisi = localStorage.getItem("aped-theme"); } catch (e) {}
    if (choisi) return;
    var onChange = function (e) {
      var encoreLibre = null;
      try { encoreLibre = localStorage.getItem("aped-theme"); } catch (err) {}
      if (encoreLibre) return;
      var next = e.matches ? "dark" : "light";
      root.classList.add("theme-shifting");
      root.setAttribute("data-theme", next);
      labelTheme(next);
      if (metaThemeColor) metaThemeColor.setAttribute("content", next === "dark" ? "#101211" : "#dcdedb");
      window.setTimeout(function () { root.classList.remove("theme-shifting"); }, 560);
      doc.dispatchEvent(new CustomEvent("aped:theme", { detail: { theme: next } }));
    };
    if (mq.addEventListener) mq.addEventListener("change", onChange);
    else if (mq.addListener) mq.addListener(onChange);
  })();

  /* ------------------------------------------------------------
     PHASE 10 — LA BASCULE PASSE PAR UNE TRAME, PLUS PAR UN FONDU.

     CE QU'IL Y AVAIT : `document.startViewTransition`. Le
     navigateur photographie l'avant et l'apres et les FOND l'un
     dans l'autre. C'est exactement le mot que la direction
     interdit : rien ne fond ici, tout s'encliquette. C'etait aussi
     le seul endroit du site ou un fondu avait survecu.

     CE QUE LA REFERENCE 6 DONNE, TRADUIT. Le toggle Framer bascule
     en `translate 0.3s ease-out` : un etat GLISSE vers l'autre.
     Chez nous un etat ne glisse pas non plus, il ROULE d'un cran —
     V4. A l'echelle de la page entiere, le cran est une bande de
     matiere qui TRAVERSE : la trame couvre dans le sens de
     lecture, le theme bascule quand elle a couvert, la meme trame
     se retire dans le meme sens. Derriere la vague, l'autre etat.

     DEUX TEMPS, ET LA MEME GRAINE POUR LES DEUX : c'est la meme
     matiere qui passe, pas deux voiles differents. 220 + 260 ms.

     ET UN TROISIEME TEMPS QU'ON NE CHOISIT PAS. Changer
     `data-theme` sur la racine recalcule le style d'un document de
     trente mille pixels : mesure du jour, 250 a 350 ms de tache,
     AVEC ET SANS le voile — 256/221/219 ms sans trame contre
     316/258/231 avec. Ce cout ne vient donc pas d'ici, il etait
     deja la. `startViewTransition` le cachait sous une photo
     figee ; on le cache sous la couverture pleine de la trame, au
     seul instant ou l'ecran est un aplat et ou une pause ne se
     voit pas. C'est le meme abri, dans notre matiere au lieu d'un
     fondu. Duree vue par le visiteur, bout en bout : environ
     750 ms, dont un tiers qu'aucune mise en scene ne supprime.

     LA COULEUR EST CELLE D'ARRIVEE, pas celle de depart. La vague
     apporte le nouvel etat ; une vague de l'ancienne couleur
     dirait qu'on revient en arriere.

     CE QUI TIENT SANS ELLE : `applyTheme` est appele dans tous les
     cas. Sans `trame.js`, sous mouvement reduit, ou si le voile
     echoue, le theme bascule net — ce qui est le repli correct
     pour un etat binaire.
     ------------------------------------------------------------ */
  function couleurSurface(theme) {
    return theme === "dark" ? "#101211" : "#dcdedb";
  }

  function basculerTheme(next) {
    var trame = window.APED_TRAME;
    if (!trame || reduced.matches) { applyTheme(next); return; }

    /* La cible est l'element racine : `trame.js` sait que la boite
       d'une racine est la FENETRE, pas les trente mille pixels du
       document. */
    var scene = doc.documentElement;
    var teinte = couleurSurface(next);

    trame.couvrir(scene, {
      nom: "theme-couvre", sens: "droite", graine: 613, maille: 56, z: 2147483000,
      couleur: teinte, duree: 220, vie: 120,
      onFin: function () {
        applyTheme(next);
        trame.degager(scene, {
          nom: "theme-degage", sens: "droite", graine: 613, maille: 56, z: 2147483000,
          couleur: teinte, duree: 260, vie: 140
        });
      }
    });
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      basculerTheme(root.getAttribute("data-theme") === "dark" ? "light" : "dark");
    });
  }

  /* ============================================================
     Menu plein ecran
     ============================================================ */
  var burger = $("#burger");
  var menu = $("#menu");

  function closeMenu() {
    if (!menu || menu.hidden) return;
    menu.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-label", "Ouvrir le menu");
    /* La fermeture est la RECIPROQUE : l'arete repasse par ou elle
       est venue. `inverse()` la calcule au lieu de la decider — une
       reciproque qu'on choisit a la main finit par diverger de son
       ouverture, et deux idees remplacent une. */
    if (window.APED_TRAME && !reduced.matches) {
      window.APED_TRAME.couvrir(menu, {
        nom: "menu-ferme", sens: window.APED_TRAME.inverse("bas"), graine: 331,
        duree: 300, vie: 150, maille: 52, z: 2147483000
      });
    }
    window.setTimeout(function () { menu.hidden = true; }, reduced.matches ? 0 : 380);
    if (!activeModal) unlockScroll();
    // Le focus revient sur le bourgeon, jamais sur le body.
    if (!activeModal && burger.offsetParent !== null) burger.focus({ preventScroll: true });
  }

  function openMenu() {
    if (!menu) return;
    menu.hidden = false;
    lockScroll();
    requestAnimationFrame(function () { menu.classList.add("is-open"); });
    burger.setAttribute("aria-expanded", "true");
    burger.setAttribute("aria-label", "Fermer le menu");
    /* PHASE 10 — le menu est un PANNEAU : il se lit de haut en bas,
       donc l'arete descend. La trame est un supplement, jamais le
       mecanisme : la classe `is-open` fait tout le travail utile et
       le menu s'ouvre a l'identique si le voile n'arrive pas. */
    if (window.APED_TRAME && !reduced.matches) {
      window.APED_TRAME.degager(menu, {
        nom: "menu-ouvre", sens: "bas", graine: 331, duree: 340, vie: 170,
        maille: 52, z: 2147483000
      });
    }
    // Le menu est un calque plein ecran : le focus doit y entrer, sinon la
    // premiere tabulation part dans le contenu couvert derriere.
    var first = focusablesIn(menu)[0];
    if (first) window.setTimeout(function () { first.focus({ preventScroll: true }); }, 60);
  }

  if (burger && menu) {
    burger.addEventListener("click", function () {
      if (menu.hidden) openMenu(); else closeMenu();
    });
    $$("a, button", menu).forEach(function (el) {
      el.addEventListener("click", closeMenu);
    });
    // La signature est une destination comme les autres : elle referme.
    var wordmark = $(".nav .wordmark");
    if (wordmark) wordmark.addEventListener("click", closeMenu);
  }

  /* ============================================================
     PHASE 10 — LE PANNEAU « AJUSTER EN DETAIL », ET LES AUTRES
     REPLIS DU MEME TYPE.

     Un `<details>` natif bascule d'un coup : le contenu est absent,
     puis il est la. C'est correct, et ca doit le rester — c'est le
     seul repli qui marche sans script. Mais « d'un coup » n'est pas
     la meme chose que « d'un cran » : on ne voit pas D'OU vient ce
     qui arrive.

     La trame le dit : le panneau se DEGAGE de haut en bas, parce
     qu'un panneau se lit de haut en bas. A la fermeture, rien —
     le navigateur retire le contenu dans la meme image et il n'y a
     pas de reciproque a jouer sur un element qui n'existe plus.
     Mentir la-dessus demanderait de retarder la fermeture, donc de
     retenir le visiteur pour une decoration.
     ============================================================ */
  $$("details.roi-details").forEach(function (repli) {
    repli.addEventListener("toggle", function () {
      if (!repli.open || !window.APED_TRAME || reduced.matches) return;
      /* La cible est le CONTENU, pas le `<details>` entier : degager
         le tout recouvrirait le resume, donc le bouton que le
         visiteur vient de cliquer. */
      var contenu = repli.querySelector("summary") ? repli.querySelector("summary").nextElementSibling : null;
      if (!contenu) return;
      window.APED_TRAME.degager(contenu, {
        nom: "repli-" + (repli.id || "detail"), sens: "bas", graine: 449,
        duree: 320, vie: 160, maille: 36, z: 3
      });
    });
  });

  /* ============================================================
     Verrou de defilement. La largeur de la barre est compensee,
     sinon la page saute lateralement a l'ouverture.
     ============================================================ */
  var scrollLocks = 0;

  function lockScroll() {
    scrollLocks++;
    if (scrollLocks > 1) return;
    var gap = window.innerWidth - doc.documentElement.clientWidth;
    doc.body.style.overflow = "hidden";
    if (gap > 0) doc.body.style.paddingRight = gap + "px";
  }

  function unlockScroll() {
    scrollLocks = Math.max(0, scrollLocks - 1);
    if (scrollLocks > 0) return;
    doc.body.style.overflow = "";
    doc.body.style.paddingRight = "";
  }

  /* ============================================================
     Modales : piege de focus, retour au declencheur, Echap.
     ============================================================ */
  var activeModal = null;
  var lastTrigger = null;

  var FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])';

  function focusablesIn(scope) {
    return $$(FOCUSABLE, scope).filter(function (el) {
      return el.offsetParent !== null || el === doc.activeElement;
    });
  }

  /* Deux calques peuvent capturer le focus : une modale, et le menu plein
     ecran. Le menu n'etait pas piege : la tabulation sortait de l'overlay
     et se promenait dans le contenu couvert derriere. Son cycle inclut la
     barre de nav, qui est au-dessus de lui et porte la croix de fermeture. */
  function trapList() {
    if (activeModal) return focusablesIn(activeModal);
    if (menu && !menu.hidden) {
      var nav = $(".nav");
      return (nav ? focusablesIn(nav) : []).concat(focusablesIn(menu));
    }
    return null;
  }

  function trapFocus(e) {
    if (e.key !== "Tab") return;
    var list = trapList();
    if (!list || !list.length) return;
    var first = list[0];
    var last = list[list.length - 1];
    if (e.shiftKey && doc.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && doc.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  function openModal(id, keepTrigger) {
    var modal = doc.getElementById(id);
    if (!modal) return;
    if (!keepTrigger) lastTrigger = doc.activeElement;
    activeModal = modal;
    modal.hidden = false;
    lockScroll();
    requestAnimationFrame(function () {
      modal.classList.add("is-open");
      /* PHASE 8 · V1 — le panneau se DEGAGE du haut sous une arete
         franche. Meme raison que pour les secteurs : ce fichier
         annonce, `langue.js` choregraphie. Sans lui, le panneau
         s'ouvre par la transition CSS d'origine. */
      var panneau = modal.querySelector(".modal-panel");
      if (panneau) doc.dispatchEvent(new CustomEvent("aped:modal", { detail: { panneau: panneau } }));
    });

    if (id === "modal-estimate") resetEstimate();
    if (id === "modal-project") resetProject();
    if (id === "modal-booking") resetBooking();

    var target = focusablesIn(modal)[0];
    if (target) window.setTimeout(function () { target.focus({ preventScroll: true }); }, 60);
  }

  /* Le declencheur peut avoir disparu entre-temps : une modale ouverte
     depuis le menu plein ecran voit son bouton passer en display:none
     quand le menu se referme. Sans repli, le focus tombe sur le body. */
  function restoreFocus() {
    var el = lastTrigger;
    lastTrigger = null;
    if (el && doc.contains(el) && el.offsetParent !== null) {
      el.focus({ preventScroll: true });
      return;
    }
    var fallbacks = [$("#burger"), $(".nav .nav-cta"), $(".wordmark")];
    for (var i = 0; i < fallbacks.length; i++) {
      if (fallbacks[i] && fallbacks[i].offsetParent !== null) {
        fallbacks[i].focus({ preventScroll: true });
        return;
      }
    }
  }

  function closeModal() {
    if (!activeModal) return;
    var modal = activeModal;
    modal.classList.remove("is-open");
    activeModal = null;
    unlockScroll();
    /* PHASE 8 · V1 — le panneau se referme par ou il s'est ouvert.
       Une fermeture qui n'est pas la reciproque de l'ouverture se
       lit comme un deuxieme evenement, pas comme la fin du
       premier. Les 380 ms d'attente avant `hidden` existaient
       deja : la choregraphie tient dans ce budget, elle n'en
       ajoute pas. */
    var sortant = modal.querySelector(".modal-panel");
    if (sortant && !reduced.matches) {
      doc.dispatchEvent(new CustomEvent("aped:modal-ferme", { detail: { panneau: sortant } }));
    }
    window.setTimeout(function () { modal.hidden = true; }, reduced.matches ? 0 : 380);
    restoreFocus();
  }

  function switchModal(id) {
    if (activeModal) {
      activeModal.classList.remove("is-open");
      activeModal.hidden = true;
      activeModal = null;
      unlockScroll();
    }
    openModal(id, true);
  }

  doc.addEventListener("click", function (e) {
    var open = e.target.closest("[data-modal-open]");
    if (open) { openModal(open.getAttribute("data-modal-open")); return; }
    var swap = e.target.closest("[data-modal-switch]");
    if (swap) { switchModal(swap.getAttribute("data-modal-switch")); return; }
    var close = e.target.closest("[data-modal-close]");
    if (close) { closeModal(); }
  });

  doc.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      if (activeModal) closeModal();
      else closeMenu();
      return;
    }
    trapFocus(e);
  });

  /* ============================================================
     Validation. Le focus se pose sur le premier champ en erreur,
     et l'etat est annonce aux lecteurs d'ecran.
     ============================================================ */
  function markField(field, ok) {
    /* PHASE 8 · V3 — LA SOUDURE NE SE VOIT QUE SUR CE QUI VIENT
       D'ETRE REPARE.
       Poser `is-valid` sur tous les champs corrects a chaque
       validation ferait verdir un formulaire entier d'un coup :
       huit signaux pour zero information, et le seul qui compte —
       « celui-la, tu viens de le corriger » — noye dedans. Le filet
       ne se soude donc que sur un champ qui SORT de l'erreur. */
    if (ok && field.classList.contains("is-invalid")) {
      field.classList.add("is-valid");
      window.setTimeout(function () { field.classList.remove("is-valid"); }, 2400);
    }
    field.classList.toggle("is-invalid", !ok);
    var input = $("input, select, textarea", field);
    if (input) {
      if (ok) input.removeAttribute("aria-invalid");
      else input.setAttribute("aria-invalid", "true");
    }
    var err = $(".field-error", field);
    if (err && !err.id) err.id = "err-" + Math.random().toString(36).slice(2, 8);
    if (input && err) {
      if (ok) input.removeAttribute("aria-describedby");
      else input.setAttribute("aria-describedby", err.id);
    }
  }

  function validate(scope) {
    var firstBad = null;
    $$(".field", scope).forEach(function (field) {
      if (field.hidden || field.closest("[hidden]")) return;
      var checks = $$('input[type="checkbox"]', field);
      if (checks.length) {
        var anyChecked = checks.some(function (c) { return c.checked; });
        markField(field, anyChecked);
        if (!anyChecked && !firstBad) firstBad = checks[0];
        return;
      }
      var input = $("input, select, textarea", field);
      if (!input) return;
      if (!input.required) { markField(field, true); return; }
      var ok = String(input.value).trim().length > 0;
      if (ok && input.type === "email") {
        ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim());
      }
      markField(field, ok);
      if (!ok && !firstBad) firstBad = input;
    });
    if (firstBad) firstBad.focus({ preventScroll: false });
    return !firstBad;
  }

  /* ============================================================
     Envoi
     ============================================================ */
  function serialize(form) {
    var data = {};
    new FormData(form).forEach(function (value, key) {
      if (value instanceof File) return;
      data[key] = data[key] ? data[key] + ", " + value : value;
    });
    return data;
  }

  /* ------------------------------------------------------------
     UN 200 N'EST PAS UN ENVOI. C'est un vrai defaut, trouve le
     2026-07-26 en jouant le parcours complet du popup.

     Le service repond `HTTP 200` avec un corps qui dit l'inverse :

       {"success":"false","message":"This form needs Activation.
        We've sent you an email containing an 'Activate Form' link."}

     Les deux fonctions ne regardaient que `res.ok`. Les SIX
     formulaires du site affichaient donc « Demande recue » a un
     visiteur dont le message n'etait jamais parti. C'est le pire
     mode d'echec possible : celui ou personne n'apprend rien — ni
     le visiteur, qui attend un rappel, ni nous, qui ne voyons pas
     de courriel et croyons que personne n'ecrit.

     On lit maintenant le corps, et on porte le message du service
     jusqu'a l'appelant pour que l'echec soit lisible.
     ------------------------------------------------------------ */
  function lireReponse(res) {
    if (!res.ok) throw new Error("Le service d'envoi a répondu " + res.status + ".");
    return res.json().then(function (data) {
      /* Le champ vaut la CHAINE "false", pas le booleen. Un test
         laxiste laisserait passer exactement le cas qu'on corrige. */
      var ok = data && (data.success === true || data.success === "true");
      if (!ok) {
        var e = new Error((data && data.message) || "Envoi refusé par le service.");
        e.duService = true;
        throw e;
      }
      return data;
    });
  }

  function sendJson(kind, data) {
    var payload = Object.assign({}, data, {
      _subject: SUBJECTS[kind] || "Message - site APED",
      _template: "table",
      _captcha: "false"
    });
    return fetch(FORM_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload)
    }).then(lireReponse);
  }

  function sendMultipart(kind, formData) {
    formData.append("_subject", SUBJECTS[kind] || "Message - site APED");
    formData.append("_template", "table");
    formData.append("_captcha", "false");
    return fetch(FORM_ENDPOINT, {
      method: "POST",
      headers: { Accept: "application/json" },
      body: formData
    }).then(lireReponse);
  }

  /* Le bouton reste actif jusqu'au depart de la requete, puis
     affiche une barre indeterminee. */
  function setLoading(btn, on, text) {
    var label = $("[data-label]", btn);
    if (!btn.dataset.idle && label) btn.dataset.idle = label.textContent;
    btn.classList.toggle("is-loading", on);
    btn.disabled = on;
    if (label) label.textContent = on ? (text || "Envoi en cours…") : btn.dataset.idle;
  }

  function say(status, message, kind) {
    if (!status) return;
    status.className = "form-status" + (kind ? " is-" + kind : "");
    status.textContent = message;
  }

  /* ============================================================
     LE REPLI QUI LIVRE VRAIMENT — corrige le risque de veracite le
     plus grave du site, releve le 2026-07-29.

     L'ETAT DES FAITS, MESURE ET NON SUPPOSE. Le point d'entree
     `https://formsubmit.co/ajax/…` n'a JAMAIS ete active. Verifie ce
     soir, deux fois, avec et sans en-tete `Referer` :

       HTTP 200
       {"success":"false","message":"This form needs Activation.
        We've sent you an email containing an 'Activate Form' link."}

     Le code sait deja lire ce corps et lever — c'est le correctif du
     2026-07-26, et il tient. Mais savoir qu'un envoi a echoue ne le
     fait pas arriver. Aujourd'hui, DONC : aucun des six formulaires
     du site ne livre, et toutes les promesses de delai du site
     — « 12 h » a sept endroits, « le prochain jour ouvrable », « on
     confirme la plage par courriel » — reposent sur un message que
     personne ne recoit. Une promesse de reponse adossee a un canal
     mort est une faussete, meme si chaque mot est sincere.

     POURQUOI CE REPLI ET PAS AUTRE CHOSE.
     · Activer FormSubmit demande de cliquer un lien dans la boite du
       proprietaire. C'est un geste d'une seconde, et je ne peux pas
       le faire a sa place. Tant qu'il n'est pas fait, il fallait un
       chemin qui ne depende de PERSONNE.
     · `mailto:` est le seul canal d'envoi qui ne soit pas une requete
       vers un tiers. Il tient donc la plaque « 0 · Mouchard, traceur,
       service exterieur », que `formsubmit.co` entame deja au moment
       de l'envoi — voir DECISIONS-NUIT.md.
     · Le repli n'est PAS le chemin par defaut : ouvrir le logiciel de
       courriel du visiteur est une friction reelle, et beaucoup de
       postes de bureau n'en ont aucun de configure. L'envoi
       automatique reste donc l'essai numero un, et il redeviendra
       silencieux a la seconde ou le lien d'activation sera clique.

     CE QUI EST GARANTI PAR CONSTRUCTION : rien de ce que le visiteur
     a rempli n'est perdu. Le corps du message est construit a partir
     du MEME objet que celui qui partait vers le service.
     ============================================================ */

  /* Les navigateurs et les clients de courriel se coupent quelque
     part entre 2 000 et 8 000 caracteres selon la plateforme, et le
     plus bas des deux gagne. On borne donc en dessous du plus bas,
     et on le DIT dans le message plutot que de tronquer en silence :
     un texte coupe sans avertissement est pire qu'un texte court. */
  var REPLI_MAX = 1600;

  function corpsCourriel(data, avecFichiers) {
    var lignes = [];
    Object.keys(data).forEach(function (cle) {
      /* Les cles de service du formulaire — `_subject`, `_template`,
         `_captcha`, `_autoresponse` — n'ont aucun sens pour un
         humain qui relit son propre message. */
      if (cle.charAt(0) === "_") return;
      var v = data[cle];
      if (v === null || v === undefined || String(v).trim() === "") return;
      lignes.push(cle.replace(/_/g, " ") + " : " + String(v));
    });
    var corps = lignes.join("\n");
    if (corps.length > REPLI_MAX) {
      corps = corps.slice(0, REPLI_MAX) + "\n\n[La suite a été coupée par la longueur maximale d’un courriel préparé. Ajoutez ce qui manque avant d’envoyer.]";
    }
    if (avecFichiers) {
      corps += "\n\nVos fichiers ne peuvent pas voyager par ce chemin : joignez-les au message avant de l’envoyer.";
    }
    return corps;
  }

  function lienRepli(kind, data, avecFichiers) {
    return "mailto:" + CONTACT_EMAIL +
      "?subject=" + encodeURIComponent(SUBJECTS[kind] || "Message - site APED") +
      "&body=" + encodeURIComponent(corpsCourriel(data, avecFichiers));
  }

  /* Pose le repli JUSTE APRES le message d'etat, dans le meme parent,
     et lui donne le focus : celui qui vient de voir un echec doit
     atteindre la sortie au clavier suivant, pas la chercher.
     Idempotent — un second echec remplace le premier bouton au lieu
     d'en empiler deux. */
  function poserRepli(status, kind, data, avecFichiers) {
    if (!status || !status.parentNode) return;
    var hote = status.parentNode;
    var ancien = hote.querySelector("[data-repli]");
    if (ancien) hote.removeChild(ancien);

    var boite = doc.createElement("p");
    boite.className = "form-repli";
    boite.setAttribute("data-repli", "");

    var lien = doc.createElement("a");
    lien.className = "btn btn--primary";
    lien.href = lienRepli(kind, data, avecFichiers);
    lien.textContent = "Ouvrir mon courriel, message déjà écrit";

    var note = doc.createElement("small");
    note.textContent = "Tout ce que vous avez rempli est déjà dans le message. Il ne reste qu’à l’envoyer.";

    boite.appendChild(lien);
    boite.appendChild(note);
    hote.insertBefore(boite, status.nextSibling);
    lien.focus();
  }

  /* Un nouvel essai efface le repli du precedent : laisser un bouton
     « l'envoi a echoue » sous un formulaire qui vient de reussir
     serait exactement le genre de contradiction qu'on corrige. */
  function retirerRepli(status) {
    if (!status || !status.parentNode) return;
    var ancien = status.parentNode.querySelector("[data-repli]");
    if (ancien) ancien.parentNode.removeChild(ancien);
  }

  /* Formulaires simples : urgence et reference */
  $$('form[data-form="urgent"], form[data-form="refer"]').forEach(function (form) {
    var kind = form.getAttribute("data-form");
    var btn = $("[data-submit]", form);
    var status = $(".form-status", form);

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validate(form)) { say(status, "Vérifiez les champs signalés puis renvoyez.", "err"); return; }
      setLoading(btn, true);
      say(status, "");
      retirerRepli(status);
      var contenu = serialize(form);
      sendJson(kind, contenu).then(function () {
        setLoading(btn, false);
        say(status, "Reçu. On vous répond très vite.", "ok");
        form.reset();
        window.setTimeout(function () { closeModal(); say(status, ""); }, 2200);
      }).catch(function () {
        setLoading(btn, false);
        say(status, "L’envoi automatique n’a pas passé. Votre message n’est pas perdu — envoyez-le d’ici :", "err");
        poserRepli(status, kind, contenu);
      });
    });
  });

  /* ============================================================
     Calendrier
     ============================================================ */
  var calMonth = $("#calMonth");
  var calDays = $("#calDays");
  var calPrev = $("#calPrev");
  var calNext = $("#calNext");
  var slotsTitle = $("#slotsTitle");
  var slotsList = $("#slotsList");
  var slotsEmpty = $("#slotsEmpty");
  var bookingModal = $("#modal-booking");

  var calView = new Date();
  var selectedDate = null;
  var selectedSlotLabel = "";

  function startOfDay(d) { var x = new Date(d); x.setHours(0, 0, 0, 0); return x; }
  function minDate() { return startOfDay(new Date(Date.now() + BOOKING.minNoticeHours * 3600 * 1000)); }
  function maxDate() { return startOfDay(new Date(Date.now() + BOOKING.horizonDays * 24 * 3600 * 1000)); }
  function slotLabel(slot) { var p = slot.split(":"); return p[0] + " h " + p[1]; }

  function goBStep(n) {
    if (!bookingModal) return;
    $$(".step[data-bstep]", bookingModal).forEach(function (s) {
      s.hidden = Number(s.dataset.bstep) !== n;
    });
  }

  function renderCalendar() {
    if (!calDays) return;
    var y = calView.getFullYear();
    var m = calView.getMonth();
    calMonth.textContent = calView.toLocaleDateString("fr-CA", { month: "long", year: "numeric" });

    var firstDay = new Date(y, m, 1).getDay();
    var count = new Date(y, m + 1, 0).getDate();
    var lo = minDate();
    var hi = maxDate();
    var today = startOfDay(new Date());

    calDays.innerHTML = "";
    for (var i = 0; i < firstDay; i++) {
      var blank = doc.createElement("span");
      blank.className = "cal-day is-blank";
      blank.setAttribute("aria-hidden", "true");
      calDays.appendChild(blank);
    }
    for (var d = 1; d <= count; d++) {
      (function (day) {
        var date = new Date(y, m, day);
        var btn = doc.createElement("button");
        btn.type = "button";
        btn.className = "cal-day";
        btn.textContent = day;
        btn.setAttribute("aria-label", date.toLocaleDateString("fr-CA", { weekday: "long", day: "numeric", month: "long" }));
        var open = BOOKING.businessDays.indexOf(date.getDay()) !== -1 && date >= lo && date <= hi;
        if (date.getTime() === today.getTime()) btn.classList.add("is-today");
        if (!open) {
          btn.disabled = true;
        } else {
          if (selectedDate && date.getTime() === selectedDate.getTime()) {
            btn.classList.add("is-on");
            btn.setAttribute("aria-pressed", "true");
          } else {
            btn.setAttribute("aria-pressed", "false");
          }
          btn.addEventListener("click", function () {
            selectedDate = date;
            renderCalendar();
            renderSlots();
          });
        }
        calDays.appendChild(btn);
      })(d);
    }

    var viewStart = new Date(y, m, 1);
    var thisMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    calPrev.disabled = viewStart <= thisMonth;
    calNext.disabled = new Date(y, m + 1, 1) > hi;
  }

  function renderSlots() {
    if (!slotsList) return;
    slotsList.innerHTML = "";
    if (!selectedDate) {
      slotsTitle.textContent = "Sélectionnez une date";
      slotsEmpty.hidden = true;
      return;
    }
    slotsTitle.textContent = selectedDate.toLocaleDateString("fr-CA", { weekday: "long", day: "numeric", month: "long" });
    var floor = new Date(Date.now() + BOOKING.minNoticeHours * 3600 * 1000);
    BOOKING.slots.forEach(function (slot) {
      var parts = slot.split(":");
      var when = new Date(selectedDate);
      when.setHours(Number(parts[0]), Number(parts[1]), 0, 0);
      if (when < floor) return;
      var btn = doc.createElement("button");
      btn.type = "button";
      btn.className = "slot";
      btn.textContent = slotLabel(slot);
      btn.addEventListener("click", function () {
        selectedSlotLabel = selectedDate.toLocaleDateString("fr-CA", {
          weekday: "long", day: "numeric", month: "long", year: "numeric"
        }) + " à " + slotLabel(slot);
        $("#bookingRecap").textContent = selectedSlotLabel;
        goBStep(2);
        var firstField = $('.step[data-bstep="2"] input', bookingModal);
        if (firstField) firstField.focus({ preventScroll: true });
      });
      slotsList.appendChild(btn);
    });
    slotsEmpty.hidden = slotsList.children.length > 0;
  }

  function resetBooking() {
    calView = new Date();
    selectedDate = null;
    selectedSlotLabel = "";
    renderCalendar();
    renderSlots();
    goBStep(1);
    var form = $('form[data-form="booking"]', bookingModal);
    if (form) {
      form.reset();
      say($(".form-status", form), "");
      var btn = $("[data-submit]", form);
      if (btn) setLoading(btn, false);
      $$(".field.is-invalid", form).forEach(function (f) { markField(f, true); });
    }
  }

  if (calPrev && calNext) {
    calPrev.addEventListener("click", function () {
      calView = new Date(calView.getFullYear(), calView.getMonth() - 1, 1);
      renderCalendar();
    });
    calNext.addEventListener("click", function () {
      calView = new Date(calView.getFullYear(), calView.getMonth() + 1, 1);
      renderCalendar();
    });
  }
  var bookingChange = $("#bookingChange");
  if (bookingChange) bookingChange.addEventListener("click", function () { goBStep(1); });

  var bookingForm = $('form[data-form="booking"]');
  if (bookingForm) {
    bookingForm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validate(bookingForm)) { say($(".form-status", bookingForm), "Vérifiez les champs signalés.", "err"); return; }
      var btn = $("[data-submit]", bookingForm);
      var status = $(".form-status", bookingForm);
      setLoading(btn, true, "Réservation en cours…");
      say(status, "");
      retirerRepli(status);
      var data = serialize(bookingForm);
      data.plage_demandee = selectedSlotLabel;
      sendJson("booking", data).then(function () {
        setLoading(btn, false);
        goBStep(3);
      }).catch(function () {
        setLoading(btn, false);
        say(status, "L’envoi automatique n’a pas passé. Votre demande de plage n’est pas perdue — envoyez-la d’ici :", "err");
        poserRepli(status, "booking", data);
      });
    });
  }

  /* ============================================================
     Formulaire projet, 7 etapes
     ============================================================ */
  var projectWizard = $("#projectWizard");
  var projectBar = $("#projectBar");
  var projectBack = $("#projectBack");
  var projectNext = $("#projectNext");
  var projectNav = $("#projectNav");
  var P_TOTAL = 7;
  var pStep = 1;
  var pickedFiles = [];
  var MAX_BYTES = 10 * 1024 * 1024;

  function goPStep(n) {
    pStep = n;
    $$(".step[data-pstep]", projectWizard).forEach(function (s) {
      s.hidden = Number(s.dataset.pstep) !== n;
    });
    var pct = (n / P_TOTAL) * 100;
    projectBar.style.width = pct + "%";
    var bar = projectBar.closest("[role='progressbar']");
    if (bar) bar.setAttribute("aria-valuenow", String(Math.round(pct)));
    projectBack.hidden = n === 1 || n === P_TOTAL;
    projectNav.hidden = n === P_TOTAL;
    var label = $("[data-label]", projectNext);
    label.textContent = n === 6 ? "Envoyer ma demande" : "Continuer";
    projectNext.dataset.idle = label.textContent;
    var visible = $('.step[data-pstep="' + n + '"]', projectWizard);
    if (visible) {
      var focusTarget = $("input:not([type=hidden]):not([type=file]), select, textarea, button", visible);
      if (focusTarget && isDesktop.matches) focusTarget.focus({ preventScroll: true });
    }
  }

  function renderFiles() {
    var list = $("#prFileList");
    var empty = $("#prFileEmpty");
    list.innerHTML = "";
    pickedFiles.forEach(function (file, i) {
      var li = doc.createElement("li");
      var name = doc.createElement("span");
      name.textContent = file.name + " (" + Math.round(file.size / 1024) + " Ko)";
      var del = doc.createElement("button");
      del.type = "button";
      del.className = "btn-icon";
      del.setAttribute("aria-label", "Retirer " + file.name);
      del.innerHTML = '<svg class="icon" aria-hidden="true"><use href="#i-trash" /></svg>';
      del.addEventListener("click", function () {
        pickedFiles.splice(i, 1);
        renderFiles();
      });
      li.appendChild(name);
      li.appendChild(del);
      list.appendChild(li);
    });
    if (empty) empty.hidden = pickedFiles.length > 0;
  }

  function addFiles(files) {
    var total = pickedFiles.reduce(function (s, f) { return s + f.size; }, 0);
    var refused = false;
    Array.prototype.slice.call(files).forEach(function (f) {
      if (total + f.size > MAX_BYTES) { refused = true; return; }
      total += f.size;
      pickedFiles.push(f);
    });
    renderFiles();
    if (refused) {
      var li = doc.createElement("li");
      li.className = "is-warn";
      li.textContent = "Limite de 10 Mo atteinte. Les fichiers en trop n’ont pas été ajoutés.";
      $("#prFileList").appendChild(li);
    }
  }

  function resetProject() {
    if (!projectWizard) return;
    projectWizard.reset();
    pickedFiles = [];
    renderFiles();
    $$(".choices button", projectWizard).forEach(function (b) {
      b.classList.remove("is-on");
      b.setAttribute("aria-pressed", "false");
    });
    var urlField = $("#prUrlField");
    if (urlField) urlField.hidden = true;
    $$(".field.is-invalid", projectWizard).forEach(function (f) { markField(f, true); });
    say($(".form-status", projectWizard), "");
    setLoading(projectNext, false);
    goPStep(1);
  }

  if (projectWizard) {
    $$(".choices", projectWizard).forEach(function (row) {
      var key = row.dataset.choice;
      var hidden = $('input[type="hidden"][name="' + key + '"]', projectWizard);
      $$("button", row).forEach(function (btn) {
        btn.setAttribute("aria-pressed", "false");
        btn.addEventListener("click", function () {
          $$("button", row).forEach(function (b) {
            b.classList.remove("is-on");
            b.setAttribute("aria-pressed", "false");
          });
          btn.classList.add("is-on");
          btn.setAttribute("aria-pressed", "true");
          hidden.value = btn.dataset.value;
          markField(hidden.closest(".field"), true);
          if (key === "site_existant") {
            $("#prUrlField").hidden = btn.dataset.value !== "Oui";
          }
        });
      });
    });

    var fileInput = $("#prFiles");
    var dropzone = $(".dropzone", projectWizard);
    fileInput.addEventListener("change", function () {
      addFiles(fileInput.files);
      fileInput.value = "";
    });
    ["dragover", "dragenter"].forEach(function (ev) {
      dropzone.addEventListener(ev, function (e) { e.preventDefault(); dropzone.classList.add("is-over"); });
    });
    ["dragleave", "drop"].forEach(function (ev) {
      dropzone.addEventListener(ev, function (e) {
        e.preventDefault();
        dropzone.classList.remove("is-over");
        if (ev === "drop" && e.dataTransfer) addFiles(e.dataTransfer.files);
      });
    });

    projectBack.addEventListener("click", function () { if (pStep > 1) goPStep(pStep - 1); });

    var advance = function () {
      var current = $('.step[data-pstep="' + pStep + '"]', projectWizard);
      if (!validate(current)) return;
      if (pStep < 6) { goPStep(pStep + 1); return; }

      var status = $(".form-status", projectWizard);
      setLoading(projectNext, true);
      say(status, "");
      retirerRepli(status);

      var fd = new FormData();
      var data = serialize(projectWizard);
      Object.keys(data).forEach(function (k) { fd.append(k, data[k]); });
      pickedFiles.forEach(function (f, i) { fd.append("fichier_" + (i + 1), f, f.name); });

      var done = function () { setLoading(projectNext, false); goPStep(7); };
      var attempt = pickedFiles.length ? sendMultipart("project", fd) : sendJson("project", data);

      attempt.then(done).catch(function () {
        // Deuxieme essai sans piece jointe : mieux vaut la demande sans
        // fichiers que pas de demande du tout.
        sendJson("project", data).then(done).catch(function () {
          setLoading(projectNext, false);
          say(status, "L’envoi automatique n’a pas passé. Vos sept étapes ne sont pas perdues — envoyez-les d’ici :", "err");
          poserRepli(status, "project", data, pickedFiles.length > 0);
        });
      });
    };

    projectNext.addEventListener("click", advance);
    projectWizard.addEventListener("submit", function (e) { e.preventDefault(); advance(); });
  }

  /* ============================================================
     Estimateur, 8 etapes
     ============================================================ */
  var wizard = $("#wizard");
  var wizardBar = $("#wizardBar");
  var answers = {};
  var E_TOTAL = 8;

  function computeEstimate() {
    var score = (POIDS.type[answers.type] || 0)
      + (POIDS.envergure[answers.envergure] || 0)
      + (POIDS.design[answers.design] || 0)
      + (POIDS.delai[answers.delai] || 0);
    /* Dix points au maximum, cinq fourchettes : deux points par
       fourchette. Le seuil est volontairement large — c'est lui qui
       garantit que plusieurs profils partagent une meme reponse. */
    var i = Math.min(BAREME.length - 1, Math.floor(score / 2));
    var f = BAREME[i];
    return { low: f.bas, high: f.haut, surDevis: f.haut === null };
  }

  function goEStep(n) {
    if (!wizard) return;
    $$(".step[data-step]", wizard).forEach(function (s) {
      s.hidden = Number(s.dataset.step) !== n;
    });
    var pct = (n / E_TOTAL) * 100;
    wizardBar.style.width = pct + "%";
    var bar = wizardBar.closest("[role='progressbar']");
    if (bar) bar.setAttribute("aria-valuenow", String(Math.round(pct)));
    var visible = $('.step[data-step="' + n + '"]', wizard);
    if (visible && isDesktop.matches) {
      var t = $("button, input", visible);
      if (t) t.focus({ preventScroll: true });
    }
  }

  function resetEstimate() {
    Object.keys(answers).forEach(function (k) { delete answers[k]; });
    goEStep(1);
    var form = wizard ? $('form[data-form="estimate"]', wizard) : null;
    if (form) {
      form.reset();
      say($(".form-status", form), "");
      var btn = $("[data-submit]", form);
      if (btn) setLoading(btn, false);
      $$(".field.is-invalid", form).forEach(function (f) { markField(f, true); });
    }
  }

  if (wizard) {
    $$(".options[data-key]", wizard).forEach(function (group) {
      var key = group.dataset.key;
      $$("button", group).forEach(function (btn) {
        btn.addEventListener("click", function () {
          answers[key] = btn.dataset.value;
          goEStep(Number(group.closest(".step").dataset.step) + 1);
        });
      });
    });

    var estimateForm = $('form[data-form="estimate"]', wizard);
    if (estimateForm) {
      estimateForm.addEventListener("submit", function (e) {
        e.preventDefault();
        if (!validate(estimateForm)) return;
        var btn = $("[data-submit]", estimateForm);
        var status = $(".form-status", estimateForm);
        setLoading(btn, true, "Calcul en cours…");
        say(status, "");

        var result = computeEstimate();
        var payload = Object.assign({}, serialize(estimateForm), {
          type_de_projet: ANSWER_LABELS[answers.type] || "",
          domaine: ANSWER_LABELS[answers.industrie] || "",
          envergure: ANSWER_LABELS[answers.envergure] || "",
          niveau_design: ANSWER_LABELS[answers.design] || "",
          echeancier: ANSWER_LABELS[answers.delai] || "",
          site_existant: ANSWER_LABELS[answers.site_existant] || "",
          fourchette_estimee: result.surDevis
            ? "a partir de " + result.low.toLocaleString("fr-CA") + " $, sur devis"
            : result.low.toLocaleString("fr-CA") + " $ a " + result.high.toLocaleString("fr-CA") + " $"
        });

        var reveal = function () {
          setLoading(btn, false);
          goEStep(8);
          var lowEl = $("#priceLow");
          var highEl = $("#priceHigh");
          var suite = $("#priceSuite");
          var sLow = new Spring(function (v) { lowEl.textContent = Math.round(v).toLocaleString("fr-CA"); }, 90, 22);
          sLow.set(result.low);
          /* La derniere fourchette n'a pas de borne haute : les
             plateformes vont sur devis, et inventer un plafond
             serait un chiffre faux affiche avec aplomb. */
          if (result.surDevis) {
            if (suite) suite.textContent = "et plus, sur devis";
            highEl.hidden = true;
          } else {
            if (suite) suite.textContent = "$";
            highEl.hidden = false;
            var sHigh = new Spring(function (v) { highEl.textContent = Math.round(v).toLocaleString("fr-CA"); }, 90, 22);
            sHigh.set(result.high);
          }
        };

        /* L'ETAT DE SORTIE EST CELUI DE L'ETAPE 8, PAS CELUI DU
           FORMULAIRE. L'etape 7 devient `hidden` des que la fourchette
           parait : un message pose sur son `.form-status` serait juste
           et invisible. */
        var sortie = $("#estimateStatus") || status;
        retirerRepli(sortie);
        say(sortie, "");
        sendJson("estimate", payload).then(reveal).catch(function () {
          /* L'ORDRE COMPTE. On revele d'abord la fourchette — c'est ce
             que le visiteur est venu chercher, et elle est calculee
             dans le navigateur, donc elle ne depend d'aucun envoi —
             puis on offre le repli pour que NOUS aussi recevions la
             demande. La promesse au visiteur est tenue dans les deux
             cas ; le repli sert le rappel qu'on lui a promis. */
          reveal();
          say(sortie, "L’envoi automatique n’a pas passé. Envoyez-nous cette estimation d’ici pour qu’on vous rappelle.", "err");
          poserRepli(sortie, "estimate", payload);
        });
      });
    }
  }

  /* ============================================================
     Calculateur. Le montant alimente aussi l'index de gauche et
     la barre de navigation.
     ============================================================ */
  var roiSection = $("#calculateur");

  if (roiSection) {
    var inEmp = $("#inEmp");
    var inRate = $("#inRate");
    var inRev = $("#inRev");
    var inAdmin = $("#inAdmin");
    var outEmp = $("#outEmp");
    var outRate = $("#outRate");
    var outRev = $("#outRev");
    var outAdmin = $("#outAdmin");
    var taskFields = $$(".roi-task", roiSection);

    /* ------------------------------------------------------------
       LE CURSEUR MAITRE.
       Onze curseurs, c'etait onze decisions a prendre avant d'avoir
       un chiffre. Celui-ci en demande UNE : combien d'heures par
       semaine part en administration. Les huit taches se repartissent
       ce total en gardant leur melange actuel.

       La repartition se fait a la plus forte moyenne : on plancher
       chaque part, puis on distribue les unites restantes aux plus
       grandes parties fractionnaires. La somme des entiers vaut donc
       EXACTEMENT le total demande, sinon la poignee du curseur et le
       chiffre affiche a cote se contrediraient.

       Le modele metier n'est pas touche : ce sont les memes huit
       taches, les memes huit ponderations, la meme formule.
       ------------------------------------------------------------ */
    function repartir(total) {
      var inputs = taskFields.map(function (f) { return $("input", f); });
      var vals = inputs.map(function (i) { return Number(i.value); });
      var somme = vals.reduce(function (a, b) { return a + b; }, 0);
      var poids = somme > 0 ? vals
        : taskFields.map(function (f) { return Number(f.dataset.share); });
      var sp = poids.reduce(function (a, b) { return a + b; }, 0) || 1;

      var exact = poids.map(function (p) { return (total * p) / sp; });
      var part = exact.map(function (v) { return Math.floor(v); });
      var reste = total - part.reduce(function (a, b) { return a + b; }, 0);

      /* Les unites restantes vont aux plus grandes parties
         fractionnaires, en sautant les taches deja a leur maximum. */
      var ordre = exact
        .map(function (v, i) { return { i: i, f: v - Math.floor(v) }; })
        .sort(function (a, b) { return b.f - a.f; });
      var tour = 0;
      while (reste > 0 && tour < ordre.length * 3) {
        var k = ordre[tour % ordre.length].i;
        if (part[k] < Number(inputs[k].max)) { part[k]++; reste--; }
        tour++;
      }

      inputs.forEach(function (input, i) {
        input.value = String(Math.min(Number(input.max), part[i]));
      });
    }

    var railValue = $("#railImpactValue");
    var navValue = $("#navImpactValue");
    var impactEl = $("#roiImpact");

    var PRESETS = {
      construction:  { emp: 8,  rate: 40, rev: 60000,  tasks: [5, 5, 4, 3, 3, 2, 6, 1] },
      services:      { emp: 5,  rate: 55, rev: 45000,  tasks: [4, 8, 4, 4, 4, 3, 4, 2] },
      restauration:  { emp: 12, rate: 22, rev: 70000,  tasks: [3, 4, 6, 3, 2, 5, 1, 4] },
      sante:         { emp: 4,  rate: 35, rev: 30000,  tasks: [3, 5, 8, 3, 2, 4, 1, 3] },
      commerce:      { emp: 6,  rate: 28, rev: 90000,  tasks: [4, 6, 3, 5, 3, 6, 2, 4] },
      manufacturier: { emp: 20, rate: 38, rev: 250000, tasks: [6, 5, 3, 6, 5, 3, 5, 1] },
      perso:         { emp: 5,  rate: 42, rev: 65000,  tasks: [4, 6, 3, 3, 2, 3, 3, 2] }
    };

    var lastRoi = {};

    var impactSpring = new Spring(function (v) {
      var text = fmtImpact(v);
      if (impactEl) impactEl.textContent = text;
      if (railValue) railValue.textContent = text;
      if (navValue) navValue.textContent = text;
    }, 90, 22);

    function roiUpdate(immediate, depuisMaitre) {
      var rate = Number(inRate.value);
      var rev = Number(inRev.value);
      outEmp.textContent = inEmp.value;
      outRate.textContent = rate.toLocaleString("fr-CA") + " $";
      outRev.textContent = rev.toLocaleString("fr-CA") + " $";

      var totalHours = 0;
      var saved = 0;
      var perTask = [];
      taskFields.forEach(function (field) {
        var input = $("input", field);
        var h = Number(input.value);
        var share = Number(field.dataset.share);
        $("output", field).textContent = fmtHours(h);
        totalHours += h;
        saved += h * share;
        perTask.push({ name: field.dataset.task, saved: h * share });
      });

      /* Le curseur maitre suit toujours la somme des huit taches,
         sauf pendant qu'il est LUI-MEME en train de la commander :
         se reecrire au milieu d'un glissement ferait sauter la
         poignee sous le doigt. */
      if (inAdmin && !depuisMaitre) inAdmin.value = String(Math.min(Number(inAdmin.max), Math.round(totalHours)));
      if (outAdmin) outAdmin.textContent = fmtHours(totalHours);

      /* ----------------------------------------------------------
         B6 · DEUX POSTES RETIRES DU TOTAL LE 2026-07-29, ET LE
         DEUXIEME ETAIT UNE FAUTE D'ARITHMETIQUE, PAS SEULEMENT UN
         DEFAUT DE METHODE.

         Le total valait `direct + errors + uplift`, ou :
           errors = saved * 60 * 28 * 0.35 * util
           uplift = rev * 12 * 0.018 * util

         · `uplift` prenait 1,8 % du chiffre d'affaires annuel. Ni le
           1,8 % ni le `util` n'ont de source, nulle part, et la note
           de methode affichee sous le detail n'en parlait pas. Un
           client qui demande « d'ou sortent ces 8 377 dollars ? »
           n'avait aucune reponse dans la page.
         · `errors` est plus grave : il monetise UNE SECONDE FOIS les
           memes heures. `direct` les vend deja au taux du visiteur ;
           `errors` reprenait les memes `saved` heures, les
           reconvertissait en minutes hebdomadaires, les valorisait au
           taux du DOCUMENT (28 la minute annuelle, en dollars) puis
           en gardait 35 %. Ce n'est pas un second benefice, c'est le
           premier compte deux fois.

         Les deux pesaient 14 657 sur les 53 751 affiches par defaut,
         soit 27 % du chiffre vedette. Le total tombe donc a 39 094 —
         et ces 39 094 se defendent ligne a ligne : des
         heures mesurees, au taux que le visiteur a lui-meme regle,
         sur cinquante-deux semaines. C'est le standard que les deux
         PDF s'imposent deja : « ecrit au plus bas, jamais au plus
         flatteur ».
         ---------------------------------------------------------- */
      var direct = saved * rate * 52;
      var impact = direct;
      var remaining = Math.max(0, totalHours - saved);

      impactSpring.set(impact, immediate);

      $("#roiWeekly").textContent = fmtHours(saved);
      $("#roiDays").textContent = Math.round((saved * 52) / 8).toLocaleString("fr-CA");
      $("#roiFte").textContent = (Math.round((saved / 40) * 10) / 10).toLocaleString("fr-CA");
      $("#roiDirect").textContent = fmtMoney(direct);

      $("#barManual").style.width = totalHours > 0 ? "100%" : "0%";
      $("#barAuto").style.width = totalHours > 0 ? (remaining / totalHours) * 100 + "%" : "0%";
      $("#barManualVal").textContent = fmtHours(totalHours) + " par semaine";
      $("#barAutoVal").textContent = fmtHours(remaining) + " par semaine";

      var top3 = perTask.filter(function (t) { return t.saved > 0; })
        .sort(function (a, b) { return b.saved - a.saved; })
        .slice(0, 3);
      var top3El = $("#roiTop3");
      var top3Empty = $("#roiTop3Empty");
      top3El.innerHTML = "";
      top3.forEach(function (t) {
        var li = doc.createElement("li");
        var name = doc.createElement("span");
        name.textContent = t.name;
        var val = doc.createElement("b");
        val.textContent = fmtHours(t.saved) + " par semaine";
        li.appendChild(name);
        li.appendChild(val);
        top3El.appendChild(li);
      });
      top3Empty.hidden = top3.length > 0;

      lastRoi = {
        employes: inEmp.value,
        taux_horaire: rate + " $",
        revenus_mensuels: rev.toLocaleString("fr-CA") + " $",
        heures_recuperees_semaine: fmtHours(saved),
        impact_annuel_total: fmtImpact(impact),
        economies_directes: fmtMoney(direct)
      };
    }

    var announce = $("#roiAnnounce");

    if (inAdmin) {
      inAdmin.addEventListener("input", function () {
        repartir(Number(inAdmin.value));
        roiUpdate(false, true);
      });
    }

    $$('input[type="range"]', roiSection).forEach(function (slider) {
      /* Le curseur maitre a son propre `input` juste au-dessus : il
         repartit avant de recalculer. Il garde en revanche le meme
         `change`, donc la meme annonce vocale que les autres. */
      if (slider !== inAdmin) {
        slider.addEventListener("input", function () { roiUpdate(false); });
      }
      // `change` = fin du geste. Un seul message par reglage.
      slider.addEventListener("change", function () {
        if (!announce) return;
        announce.textContent = "Impact annuel total " + lastRoi.impact_annuel_total +
          ", " + lastRoi.heures_recuperees_semaine + " récupérées par semaine.";
      });
    });

    var presets = $("#roiPresets");
    $$("button", presets).forEach(function (btn) {
      btn.addEventListener("click", function () {
        var preset = PRESETS[btn.dataset.preset];
        if (!preset) return;
        $$("button", presets).forEach(function (b) { b.setAttribute("aria-pressed", "false"); });
        btn.setAttribute("aria-pressed", "true");
        inEmp.value = preset.emp;
        inRate.value = preset.rate;
        inRev.value = preset.rev;
        taskFields.forEach(function (field, i) { $("input", field).value = preset.tasks[i]; });
        roiUpdate(false);
      });
    });

    var roiMailForm = $("#roiMailForm");
    roiMailForm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validate(roiMailForm)) return;
      var status = $(".form-status", roiMailForm);
      var sendBtn = $('button[type="submit"]', roiMailForm);
      // Ce bouton n'avait aucun etat : il restait actif pendant la requete,
      // donc cliquable deux fois, donc deux courriels.
      if (sendBtn && sendBtn.disabled) return;
      var release = function () {
        if (!sendBtn) return;
        sendBtn.disabled = false;
        sendBtn.classList.remove("is-loading");
      };
      if (sendBtn) {
        sendBtn.disabled = true;
        sendBtn.classList.add("is-loading");
      }
      var email = $("#roiEmail").value.trim();
      say(status, "Envoi en cours…");
      retirerRepli(status);
      /* L'ACCUSE NE CITE PLUS QUE CE QUI EXISTE ENCORE. Il enumerait
         « erreurs evitees » et « revenus acceleres » : les deux postes
         ont ete retires du calcul le 2026-07-29 — voir le commentaire
         de `roiUpdate` — et les deux cles auraient rendu `undefined`
         dans le corps du courriel envoye au visiteur. */
      var chargeRoi = Object.assign({ email: email }, lastRoi, {
        _autoresponse: "Voici votre calcul d'economies APED Agence. Impact annuel estime : " + lastRoi.impact_annuel_total +
          ". Heures recuperees par semaine : " + lastRoi.heures_recuperees_semaine +
          ". Le montant, c'est ces heures multipliees par le taux horaire que vous avez regle, sur 52 semaines : " +
          lastRoi.economies_directes +
          ". C'est un ordre de grandeur, pas une soumission." +
          " Envie de le confirmer? Reservez un appel gratuit sur notre site. - L'equipe APED"
      });
      sendJson("roi", chargeRoi).then(function () {
        release();
        say(status, "Envoyé. Vérifiez votre boîte de réception.", "ok");
        roiMailForm.reset();
      }).catch(function () {
        release();
        say(status, "L’envoi automatique n’a pas passé. Votre calcul n’est pas perdu — envoyez-le d’ici :", "err");
        poserRepli(status, "roi", chargeRoi);
      });
    });

    // Premier calcul immediat : le chiffre est deja la des la section 01.
    roiUpdate(true);
  }

  /* ============================================================
     Apercu des secteurs
     ============================================================ */
  var preview = $("#sectorPreview");
  if (preview) {
    /* Les treize maquettes sont clonees depuis leur `<template>` une
       fois la page peinte. Le markup n'a donc coute ni style ni mise
       en page pendant le premier rendu. */
    var gabarit = $("#tplSecteurs");
    var scene = $("#mockStage");
    if (gabarit && scene && !scene.children.length) {
      scene.appendChild(gabarit.content.cloneNode(true));
    }

    var caption = $("#sectorCaption");
    var mocks = $$(".mock", preview);
    var pills = $$(".sector-pills button");

    var secteurCourant = null;
    var showSector = function (key) {
      if (!key) return;
      mocks.forEach(function (m) { m.classList.toggle("is-on", m.dataset.mock === key); });
      pills.forEach(function (p) {
        var on = p.dataset.sector === key;
        p.classList.toggle("is-on", on);
        if (on && p.dataset.caption) caption.textContent = p.dataset.caption;
      });
      /* PHASE 8 — LA RECOMPOSITION. Ce fichier ne connait pas GSAP
         et ne doit pas le connaitre : il tient l'USAGE, pas la
         choregraphie. Il annonce donc le changement, et `langue.js`
         le recompose s'il est charge. Si la vague 2 n'est jamais
         arrivee, ou si le visiteur a demande moins de mouvement,
         la maquette change quand meme — d'un coup, ce qui est
         exactement le repli correct. */
      if (key !== secteurCourant) {
        secteurCourant = key;
        doc.dispatchEvent(new CustomEvent("aped:secteur", { detail: { cle: key } }));
      }
    };

    /* Les treize pastilles pilotent l'apercu au survol ET au focus :
       la tabulation donne exactement la meme demonstration que la
       souris. */
    pills.forEach(function (pill) {
      var run = function () { showSector(pill.dataset.sector); };
      pill.addEventListener("mouseenter", run);
      pill.addEventListener("focus", run);
    });

    /* ------------------------------------------------------------
       AU TACTILE IL N'Y A PAS DE SURVOL.
       Sans ce bloc, un visiteur sur telephone voit toujours la meme
       maquette : la vitrine ne montre qu'un treizieme d'elle-meme.
       L'apercu defile donc tout seul, mais UNIQUEMENT quand la
       section est a l'ecran, jamais sous mouvement reduit, et il
       s'arrete pour de bon des que le visiteur touche une pastille :
       a partir de la, c'est son choix qui commande.
       ------------------------------------------------------------ */
    var coarse = window.matchMedia("(pointer: coarse)");
    if (coarse.matches && !reduced.matches && "IntersectionObserver" in window) {
      var ordre = pills.map(function (p) { return p.dataset.sector; }).filter(Boolean);
      var idx = 0;
      var minuteur = 0;
      var fige = false;

      var suivant = function () {
        idx = (idx + 1) % ordre.length;
        showSector(ordre[idx]);
      };
      var demarrer = function () {
        if (fige || minuteur) return;
        minuteur = window.setInterval(suivant, 3600);
      };
      var arreter = function () {
        if (minuteur) { window.clearInterval(minuteur); minuteur = 0; }
      };

      pills.forEach(function (pill) {
        pill.addEventListener("pointerdown", function () {
          fige = true;
          arreter();
          showSector(pill.dataset.sector);
        }, { passive: true });
      });

      new IntersectionObserver(function (es) {
        if (es[0].isIntersecting) demarrer(); else arreter();
      }, { threshold: 0.25 }).observe(preview);

      doc.addEventListener("visibilitychange", function () {
        if (doc.hidden) arreter(); else if (!fige) demarrer();
      });
    }
  }

  /* ============================================================
     LE CRAN — V4 du langage de mouvement, et il vit ICI.

     PHASE 8. Un etat ne fond pas dans un autre : il roule d'un
     cran. C'est la traduction directe de « tout s'encliquette » a
     l'echelle d'un caractere.

     POURQUOI DANS `main.js` ET PAS DANS `langue.js`. Tous les
     nombres qui roulent ici sont de l'ORIENTATION : quel chantier
     je regarde, a quelle etape j'en suis, combien de sections il
     reste. `langue.js` et `motion.js` s'arretent net sous
     `prefers-reduced-motion` ; y mettre ces compteurs reviendrait
     a supprimer l'information pour les gens qui ont justement
     demande moins de mouvement. Sous mouvement reduit, `rouler()`
     ecrit le texte d'un coup — le CHIFFRE reste, seul le roulement
     disparait.

     L'ARBITRAGE ENTRE ODOMETRE ET INTERPOLATION. Les valeurs
     DISCRETES roulent : 01 → 02 est un cran, il se voit comme un
     cran. La valeur du calculateur, elle, ne roule PAS : elle est
     tiree par un ressort, parce qu'elle suit un curseur qu'on
     bouge en continu. Un odometre sur une valeur qui change
     soixante fois par seconde ne donne pas soixante crans, il
     donne du bruit.

     ZERO DECALAGE DE MISE EN PAGE. Le roulement se fait dans une
     boite de hauteur fixe, en `translateY`, et les compteurs sont
     tous en Martian Mono : la largeur d'un caractere ne depend pas
     de sa valeur, donc changer 01 en 12 ne pousse rien.
     ============================================================ */
  function rouler(el, texte) {
    if (!el) return;
    texte = String(texte);
    if (el.dataset.cran === texte) return;

    if (reduced.matches) {
      el.dataset.cran = texte;
      el.textContent = texte;
      return;
    }

    var avant = el.dataset.cran;
    el.dataset.cran = texte;

    /* Premier passage : on pose la structure sans rien animer.
       Un compteur qui roule des l'arrivee raconte un changement
       qui n'a pas eu lieu. */
    if (avant === undefined) {
      el.classList.add("odo");
      el.textContent = "";
      for (var k = 0; k < texte.length; k++) el.appendChild(caseCran(texte[k]));
      return;
    }

    var cases = Array.prototype.slice.call(el.children);
    /* La longueur peut changer — « 9 sections restantes » devient
       « 10 ». On ajuste le nombre de boites AVANT de rouler, sinon
       le dernier caractere n'a nulle part ou aller. */
    while (cases.length < texte.length) {
      var neuve = caseCran(" ");
      el.appendChild(neuve);
      cases.push(neuve);
    }
    while (cases.length > texte.length) el.removeChild(cases.pop());

    for (var i = 0; i < texte.length; i++) {
      var boite = cases[i];
      /* La valeur COURANTE est celle du DERNIER glyphe, pas du
         premier : pendant un roulement la boite en contient deux,
         le fantome qui sort et la valeur qui arrive. */
      var actuel = boite.lastChild ? boite.lastChild.textContent : "";
      if (actuel === texte[i]) continue;
      rouleUn(boite, texte[i], i);
    }
  }

  /* Termine un roulement en cours, sur-le-champ.

     SANS CETTE FONCTION, LE COMPTEUR S'EMPILE. Chaque roulement
     ajoute un glyphe et programme son retrait 320 ms plus tard. Un
     defilement rapide traverse cinq sections en moins que ca : les
     cinq glyphes s'accumulent dans la meme boite, et
     `textContent` rend « 543210 » la ou le compteur doit rendre
     « 0 ». Mesure du 2026-07-26 par `tools/verif.mjs`, sur les dix
     positions de defilement du test du patron de 55 ans.

     Un roulement interrompu se termine donc IMMEDIATEMENT a sa
     valeur d'arrivee, et le suivant part de la. C'est aussi le
     comportement juste : quand on saute trois sections d'un coup,
     on veut voir le dernier cran, pas les trois. */
  function finirRoulement(boite) {
    if (boite._t) { window.clearTimeout(boite._t); boite._t = 0; }
    boite.classList.remove("is-roule");
    boite.style.removeProperty("--r");
    while (boite.children.length > 1) boite.removeChild(boite.firstChild);
    var b = boite.firstChild;
    if (b) { b.classList.remove("is-entrant"); b.removeAttribute("data-c"); }
  }

  function caseCran(c) {
    var boite = doc.createElement("i");
    boite.className = "odo-c";
    var b = doc.createElement("b");
    b.textContent = c;
    boite.appendChild(b);
    return boite;
  }

  function rouleUn(boite, cible, rang) {
    finirRoulement(boite);
    var sortant = boite.firstChild;

    /* LE SORTANT DEVIENT UN FANTOME, ET C'EST UNE CORRECTION DE
       BOGUE MESUREE.

       Pendant les 320 ms du roulement, la boite contient DEUX
       glyphes : celui qui part et celui qui arrive. Tant que les
       deux sont du texte, `textContent` les concatene. Mesure du
       2026-07-26 par `tools/verif.mjs` : le compteur du rail
       rendait « 87 » au lieu de « 7 » et « 765 » au lieu de « 5 ».
       Ce n'est pas un defaut d'affichage — l'affichage etait juste,
       les deux glyphes etant a des positions differentes dans une
       boite rognee. C'est un defaut d'ACCESSIBILITE : une synthese
       vocale, une recherche dans la page et tout script de mesure
       lisaient un nombre qui n'a jamais existe.

       Le glyphe sortant passe donc dans un pseudo-element, via
       `attr()`. Un pseudo-element n'est ni dans `textContent`, ni
       dans l'arbre d'accessibilite : il reste visible, il cesse
       d'etre du texte. La boite ne contient plus qu'une seule
       valeur lisible a tout instant, la bonne. */
    if (sortant) {
      sortant.setAttribute("data-c", sortant.textContent);
      sortant.textContent = "";
    }

    var entrant = doc.createElement("b");
    entrant.textContent = cible;
    entrant.className = "is-entrant";
    boite.appendChild(entrant);
    /* Le decalage par rang fait rouler les caracteres de gauche a
       droite plutot que tous ensemble : c'est ce qui se lit comme
       un odometre et pas comme un remplacement. Plafonne a 6 rangs
       pour qu'un libelle long ne traine pas. */
    boite.style.setProperty("--r", Math.min(rang, 6));
    /* Une image d'attente : sans elle, l'element entrant est ajoute
       et anime dans la meme image, donc le navigateur n'a pas d'etat
       de depart a interpoler et le roulement ne se voit pas. */
    requestAnimationFrame(function () {
      if (entrant.parentNode !== boite) return;
      boite.classList.add("is-roule");
      boite._t = window.setTimeout(function () {
        boite._t = 0;
        finirRoulement(boite);
      }, 320 + Math.min(rang, 6) * 34);
    });
  }

  window.APED_ROULER = rouler;

  /* ============================================================
     Index collant. IntersectionObserver, jamais d'ecouteur scroll.
     ============================================================ */
  var railLinks = $$("#railList a");
  if (railLinks.length && "IntersectionObserver" in window) {
    var byId = {};
    railLinks.forEach(function (a) { byId[a.dataset.rail] = a; });

    var railLeftNum = $("#railLeftNum");
    var railLeft = $("#railLeft");
    var currentId = null;

    /* ------------------------------------------------------------
       N1 · LE CURSEUR DU RAIL — PHASE 8.

       L'entree active se contentait de changer de couleur : d'une
       section a l'autre, la marque DISPARAISSAIT ici et REPARAISSAIT
       la. Le visiteur ne voyait donc pas qu'il avait avance d'un
       cran, il voyait deux etats sans lien.

       Un seul objet glisse maintenant le long du rail, et il porte
       les DEUX informations que l'index doit donner : sa POSITION
       dit dans quelle section on est, son REMPLISSAGE dit ou on en
       est dedans. Deux marques auraient dit la meme chose deux fois
       et se seraient contredites au moindre desaccord.

       `transform` et `height` seulement, sur un element hors flux :
       aucune recomposition du rail, aucune lecture forcee.
       Sous mouvement reduit, la transition CSS est coupee : le
       curseur saute, mais il est toujours au bon endroit.
       ------------------------------------------------------------ */
    var railCurseur = doc.createElement("i");
    railCurseur.className = "rail-curseur";
    railCurseur.setAttribute("aria-hidden", "true");
    railCurseur.appendChild(doc.createElement("b"));
    var railList = $("#railList");
    if (railList) railList.appendChild(railCurseur);

    var setCurrent = function (id) {
      currentId = id;
      var idx = 0;
      var actif = null;
      railLinks.forEach(function (a, i) {
        var on = a.dataset.rail === id;
        a.setAttribute("aria-current", on ? "true" : "false");
        if (on) { idx = i; actif = a; }
      });
      if (actif && railList) {
        railCurseur.style.setProperty("--y", actif.offsetTop + "px");
        railCurseur.style.setProperty("--h", actif.offsetHeight + "px");
        railCurseur.classList.add("is-on");
      }
      $$("section, .hero").forEach(function (s) {
        var rule = $("[data-section-rule]", s);
        if (rule) rule.classList.toggle("is-current", s.id === id);
      });

      /* ------------------------------------------------------------
         G2 · LE CRAN DE LA FRONTIERE — V4, et il vit ICI, pas dans
         `langue.js`.

         C'est le geste que les douze frontieres ont en commun avec
         l'index : le numero du seuil roule d'un cran a l'instant
         exact ou la section devient courante. « En synchronisation
         exacte avec le passage » n'est pas une intention, c'est une
         propriete de construction — les deux sont declenches par le
         MEME appel, il ne peut pas y avoir de decalage.

         POURQUOI DANS `main.js`. Parce que ce numero dit ou on est.
         Sous mouvement reduit et a tous les paliers, il reste juste :
         au repos la bande montre deja la bonne valeur, le cran
         n'ajoute que le mouvement. C'est la regle du site — perdre
         le mouvement ne doit jamais faire perdre une information.

         DEUX IMAGES, ET IL EN FAUT DEUX. On pose d'abord la bande
         sur la cellule du HAUT — le numero qu'on quitte — SANS
         transition, puis on la relache a l'image suivante. Sans
         cette attente, le navigateur n'a pas d'etat de depart a
         interpoler et le cran ne se voit pas. Meme correction que
         celle de l'odometre du rail, meme raison.
         ------------------------------------------------------------ */
      if (actif) {
        var sec = doc.getElementById(id);
        var seuil = sec && $("[data-seuil]", sec);
        if (seuil && seuil.getAttribute("data-cran") !== "fait" && !seuil._cran) {
          seuil._cran = true;
          seuil.setAttribute("data-cran", "pose");
          requestAnimationFrame(function () {
            requestAnimationFrame(function () { seuil.setAttribute("data-cran", "fait"); });
          });
        }
      }
      /* N1 · combien il en reste. Le nombre ROULE d'un cran : le
         changement se voit, donc l'avancee se voit. */
      var reste = railLinks.length - 1 - idx;
      rouler(railLeftNum, String(reste));
      if (railLeft) {
        railLeft.lastChild.textContent = reste === 0 ? " derniere section"
          : reste === 1 ? " section restante" : " sections restantes";
      }
    };

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) setCurrent(entry.target.id);
      });
    }, { rootMargin: "-45% 0px -45% 0px", threshold: 0 });

    Object.keys(byId).forEach(function (id) {
      var target = doc.getElementById(id);
      if (target) observer.observe(target);
    });

    /* ------------------------------------------------------------
       N1 · progression de lecture, et progression DANS la section
       courante. Ecrit dans des variables CSS plutot que de toucher
       au style de mise en page : aucune lecture forcee, aucune
       recomposition. Une seule mesure par image, sur rAF.
       ------------------------------------------------------------ */
    var readBar = $("#readBar");
    var ticking = false;

    var measure = function () {
      ticking = false;
      var de = doc.documentElement;
      var max = de.scrollHeight - window.innerHeight;
      var p = max > 0 ? (window.scrollY / max) * 100 : 0;
      if (readBar) readBar.style.setProperty("--read", p.toFixed(2) + "%");

      if (currentId) {
        var sec = doc.getElementById(currentId);
        var link = byId[currentId];
        if (sec && link) {
          /* Fraction de la section REELLEMENT parcourue.
             L'ancienne formule mesurait la position du haut de section
             par rapport au milieu de l'ecran : elle saturait a 100 %
             des qu'on entrait dans une section plus courte que le
             viewport, donc elle affichait 100 % partout et ne servait
             a rien. Mesure du 2026-07-25 : 100 % aux trois positions
             testees. Ici on rapporte le defilement accompli a la
             course utile de la section, ce qui donne bien 0 a l'entree
             et 1 a la sortie. */
          var r = sec.getBoundingClientRect();
          var haut = r.top + window.scrollY;
          var course = Math.max(1, sec.offsetHeight - window.innerHeight);
          var seen = Math.min(1, Math.max(0, (window.scrollY - haut) / course));
          link.style.setProperty("--sec-progress", (seen * 100).toFixed(1) + "%");
          /* Le curseur porte la meme fraction : c'est LUI qui la
             montre depuis la phase 8, l'entree ne la garde que pour
             le repli sans script. */
          railCurseur.style.setProperty("--sec-progress", (seen * 100).toFixed(1) + "%");
          /* Les autres entrees repartent a zero, sinon un filet reste
             rempli derriere nous. */
          railLinks.forEach(function (a) {
            if (a !== link) a.style.setProperty("--sec-progress", "0%");
          });
        }
      }
    };

    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(measure); }
    }, { passive: true });
    measure();
  }

  /* ============================================================
     LA DOUZIEME FRONTIERE — LA CLOTURE.

     Elle n'est pas dans une `<section>`, donc l'index ne la voit
     pas : elle a son propre declencheur. C'est le dernier cran du
     site, il roule de 12 a 00, et la boucle se ferme sur la meme
     plaque que la sequence d'entree.
     Ici et pas dans `langue.js` pour la meme raison que les onze
     autres : un cran dit ou on en est, donc il ne se sacrifie pas.
     ============================================================ */
  (function cloture() {
    var seuil = $(".seuil--pied");
    if (!seuil || !("IntersectionObserver" in window)) return;
    var obs = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (e) {
        if (!e.isIntersecting || seuil._cran) return;
        seuil._cran = true;
        obs.disconnect();
        seuil.setAttribute("data-cran", "pose");
        requestAnimationFrame(function () {
          requestAnimationFrame(function () { seuil.setAttribute("data-cran", "fait"); });
        });
      });
    }, { rootMargin: "0px 0px -30% 0px", threshold: 0 });
    obs.observe(seuil);
  })();

})();

