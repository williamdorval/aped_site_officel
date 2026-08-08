# Décisions — `js/tour360.js`

> Le pourquoi du code de `js/tour360.js`. Chaque entrée porte un identifiant
> qui figure aussi dans le fichier source : `grep D-042` trouve les deux.
> Ne se lit jamais en entier — on y arrive par l'identifiant.

<!-- INDEX:DEBUT -->

> **NE LIS PAS CE FICHIER EN ENTIER.** Cette table donne le titre exact
> de chaque partie et ce qu'elle coûte. Va chercher la seule qui répond :
> `grep -n "^## <titre>" <fichier>` puis lis la plage. Le titre est la clé —
> il ne périme pas, un numéro de ligne oui.

| Partie | Lignes | Jetons ~ |
|---|---:|---:|
| **D-538 — ADEXWEB - Visite virtuelle 360** | 29 | 361 |
| **D-539 — Plan : repere 240 x 140. Les rectangles ci-dessous et les murs du** | 30 | 425 |
| **D-540 — UNE SEULE PROPRIETE — Lythwood Lodge, Lidgetton, KwaZulu-Natal.** | 39 | 566 |
| **D-541 — Derive lente pendant l'inactivite : elle dit « c'est un 360 »** | 7 | 85 |
| **D-542 — PHASE 10 — LE PASSAGE D'UNE PIECE A L'AUTRE.** | 20 | 247 |
| **D-607 · LE BOUTON EST CABLE — ET C'EST UN DRAPEAU, PAS UN DETAIL.** | 11 | 127 |
| **D-718 · LA VISITE S'OUVRE SEULE QUAND ON ARRIVE DESSUS.** | 45 | 555 |

<!-- INDEX:FIN -->

## D-538 — ADEXWEB - Visite virtuelle 360

============================================================
  ADEXWEB - Visite virtuelle 360
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

## D-607 · LE BOUTON EST CABLE — ET C'EST UN DRAPEAU, PAS UN DETAIL.

*Extrait de `js/tour360.js` le 2026-08-03.*

LE BOUTON EST CABLE — ET C'EST UN DRAPEAU, PAS UN DETAIL.  D-607
Ce fichier arrive en VAGUE 2, donc au premier geste du visiteur
ou 1,2 s apres le rendu. Le panneau du service 03 propose
« Ouvrir la visite » : un `.click()` envoye avant ce moment-la
frappe un bouton sans ecouteur et ne fait RIEN, en silence. On
pose donc de quoi attendre.

## D-718 · LA VISITE S'OUVRE SEULE QUAND ON ARRIVE DESSUS.

*Ajoute a `js/tour360.js` le 2026-08-03.*

LA VISITE S'OUVRE SEULE QUAND ON ARRIVE DESSUS.  D-718

Le lecteur n'a jamais ete casse : mesure le 2026-08-03, un clic
sur `[data-tour-start]` montait le panorama, la rotation et les
passages en 6 s, zero erreur. Ce qui etait casse, c'est ce qui y
amenait.

Avant le 2026-08-03, la section etait precedee d'un sas noir de
100 vh qui portait le mot « Essayez. ». Le sas est parti (D-567).
Il ne lancait rien — mais il annoncait qu'il y avait quelque
chose a faire. Sans lui, un visiteur qui arrive sur #visite voit
une PHOTO FIXE : l'affiche du lecteur. Le bouton qui la reveille
est a 1 114 px du haut de la section, donc SOUS LE PLI d'une
fenetre de 900 px. Rien ne bouge, rien n'invite : la seule
lecture possible est « c'est une image ».

D'ou : un `IntersectionObserver` sur `.tour`, `rootMargin` de
260 px pour que le panorama soit pret quand le visiteur arrive,
et non pendant qu'il attend.

Trois retenues :

  1. `veutHd` est deja faux sous `saveData` et sous 2g. On ne
     lance alors RIEN tout seul : un forfait de donnees ne se
     fait pas imposer un panorama. Le bouton reste la seule
     porte, et il reste visible.
  2. Le palier se lit DANS le rappel de l'observateur, pas au
     chargement du script. `data-palier` est pose apres coup et
     peut avoir monte entre les deux (piege 87). A partir du
     palier 2, on ne lance rien.
  3. `monter()` recoit l'origine du lancement. Apres un CLIC, le
     focus entre dans la vue — le visiteur l'a demande, et sans
     ca les fleches ne repondent a personne. Apres une ouverture
     AUTOMATIQUE, on ne touche pas au focus : personne n'a rien
     demande, et deplacer le focus de quelqu'un qui ne fait que
     defiler est un defaut, pas un service.

`.tour-stage` porte `aspect-ratio: 16/9` : la hauteur est prise
avant le montage. Mesure — bloc a 771 px au repos, 770 px en
marche. L'ouverture automatique ne deplace rien.
