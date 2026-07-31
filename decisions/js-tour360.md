# Décisions — `js/tour360.js`

> Le pourquoi du code de `js/tour360.js`. Chaque entrée porte un identifiant
> qui figure aussi dans le fichier source : `grep D-042` trouve les deux.
> Ne se lit jamais en entier — on y arrive par l'identifiant.

## Table

- **D-538** — APED AGENCE - Visite virtuelle 360
- **D-539** — Plan : repere 240 x 140. Les rectangles ci-dessous et les murs du
- **D-540** — UNE SEULE PROPRIETE — Lythwood Lodge, Lidgetton, KwaZulu-Natal.
- **D-541** — Derive lente pendant l'inactivite : elle dit « c'est un 360 »
- **D-542** — PHASE 10 — LE PASSAGE D'UNE PIECE A L'AUTRE.

---

## D-538 — APED AGENCE - Visite virtuelle 360

============================================================
  APED AGENCE - Visite virtuelle 360
  Module autonome. Aucune dependance, aucun module ES, aucune
  requete tierce. Le moteur (Pannellum 2.5.7, MIT) est auto-heberge.

  REGLE DE CHARGE
  Ce fichier ne declenche aucun telechargement au chargement de la
  page : ni le moteur, ni les panoramas. Tout part au premier clic
  sur « Entrer dans la visite ». Avant ce clic la section ne pese
  que son affiche plate, posee en `loading="lazy"` dans le markup,
  donc jamais candidate au LCP.

  PROGRESSIF
  La scene s'ouvre en 2048 x 1024 (~150 Ko) pour etre navigable tout
  de suite, puis le 4096 x 2048 se telecharge en arriere-plan et
  remplace la scene a l'identique (meme yaw, meme pitch, meme hfov)
  une fois pret. Si l'utilisateur a change de piece entre-temps, le
  remplacement est abandonne.

  ACCESSIBILITE
  Pannellum fabrique ses points de passage en `div` nus : ni
  `tabindex`, ni `role`, ni nom accessible, ni clavier. On les
  reprend un par un dans `equiper()`. Le conteneur, lui, recoit
  bien `tabIndex = 0` de Pannellum et ecoute les fleches : il ne
  lui manquait que l'anneau de focus, rendu par css/tour360.css.
  ============================================================

## D-539 — Plan : repere 240 x 140. Les rectangles ci-dessous et les murs du

Plan : repere 240 x 140. Les rectangles ci-dessous et les murs du
    SVG sortent des memes coordonnees, c'est ce qui garantit que les
    pastilles tombent exactement dans les pieces.
      salon     x 10..120   y 10..74
      chambre   x 120..230  y 10..74
      terrasse  x 10..230   y 80..132  (dehors, le long de la facade)
    Ouvertures : y = 74 entre x 45 et 75 (portes-fenetres du jardin),
    x = 120 entre y 40 et 55 (porte interieure).

    La terrasse court sous la maison sur toute la largeur, et non en
    colonne a cote : en colonne elle ne faisait que 40 px de large
    dans la carte rendue, et « Terrasse » s'y coupait en trois
    lignes. Une bande large lui laisse une seule ligne.

    Le partage 64 / 52 entre la maison et la bande n'est pas un
    equilibre de dessin, c'est une contrainte de doigt. A 390 px la
    carte ne fait que 93 px de haut : en donnant a la maison la
    hauteur qui l'arrangeait, la bande « Terrasse » tombait a 20 px,
    soit une cible plus petite que tout ce que le site s'autorise.
    Repartition mesuree a 390 px : salon et chambre 43 px, terrasse
    35 px. Aucune cible n'est plus petite que la plus petite d'avant
    — l'ancienne « Salle de bain » faisait 33 px.

    La terrasse est tracee au trait clair, celui des jambages, parce
    qu'elle est DEHORS : au trait fort elle se lirait comme une piece
    de plus dans la maison. Aucune classe CSS nouvelle n'a ete
    necessaire pour ca.

## D-540 — UNE SEULE PROPRIETE — Lythwood Lodge, Lidgetton, KwaZulu-Natal.

UNE SEULE PROPRIETE — Lythwood Lodge, Lidgetton, KwaZulu-Natal.
    Les trois panoramas sont de Greg Zaal, publies par Poly Haven en
    CC0. L'ancien `salledebain` venait d'une AUTRE maison (toit de
    chaume visible par la porte) : c'etait le defaut signale, il est
    retire. Voir `tools/tour-images.mjs` pour la verification des
    coordonnees.

    Yaw et pitch releves piece par piece par reprojection gnomonique,
    avec `node tools/tour-angles.mjs <pano> <sortie> "<lacets>"` :
    l'outil dessine une croix au centre exact de chaque vue, et le
    lacet retenu est celui ou l'ouverture est SOUS la croix. Juger a
    l'oeil sur une planche sans repere donnait des ecarts de 40
    degres — c'est comme ca que l'ancien passage « salon » de la
    chambre avait fini pose sur le manteau de la cheminee, et non
    sur une porte.

    Les lacets ci-dessous sont ceux de Pannellum. `tour-angles.mjs`
    les rend deja dans ce sens ; en revanche l'affiche produite par
    `tools/tour-images.mjs` se demande au lacet OPPOSE (terrasse a
    +45 ici, affiche a -45 la-bas). Voir l'en-tete de
    `tools/tour-angles.mjs`.

    Le cadrage d'ouverture de chaque piece (`yaw` / `hfov`) n'est pas
    libre : il est choisi pour que TOUS les passages de la piece
    tombent dans le champ. Un demi-tour litteral apres une porte
    serait realiste mais ferait arriver le visiteur dos a la seule
    sortie visible. Marges retenues, en degres d'ecart au centre :
      terrasse hfov 104 (+/-52) -> passage a +52, marge 45
      salon    hfov 108 (+/-54) -> passages a +42 et -40, marges 7 et 19
      chambre  hfov 108 (+/-54) -> passage a -112, marge 37

    La terrasse ouvre la visite : on arrive DEVANT la maison, face a
    la baie vitree, et on entre. C'est l'ordre d'une vraie visite, et
    c'est aussi la plus belle des trois images — c'est elle qui sert
    d'affiche. Elle est donc en tete du tableau, parce que Pannellum
    ouvre sur `PIECES[0].id`.

## D-541 — Derive lente pendant l'inactivite : elle dit « c'est un 360 »

Derive lente pendant l'inactivite : elle dit « c'est un 360 »
        sans que personne ait a le lire. Elle s'arrete definitivement
        des que la main prend le relais, et ne demarre jamais sous
        prefers-reduced-motion.

## D-542 — PHASE 10 — LE PASSAGE D'UNE PIECE A L'AUTRE.

PHASE 10 — LE PASSAGE D'UNE PIECE A L'AUTRE.

            `loadScene` remplace la texture en une image : d'un mur
            on se retrouve dans l'autre piece sans qu'aucun geste
            n'ait dit qu'on se DEPLACAIT. C'est le seul endroit du
            site ou un changement d'etat n'avait aucune mise en
            scene du tout.

            La trame le dit en un mouvement lateral — on passe une
            porte, donc l'arete balaye horizontalement — et la
            charge se fait DERRIERE le voile, au moment ou l'ecran
            est couvert : le remplacement de texture ne se voit
            plus, il n'est plus qu'un temps du passage.

            Sans `trame.js` ou sous mouvement reduit : `loadScene`
            tout de suite, exactement comme avant. La visite ne
            depend pas de la mise en scene.

