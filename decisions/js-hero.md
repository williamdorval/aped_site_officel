# Décisions — `js/hero.js`

> Le pourquoi du code de `js/hero.js`. Chaque entrée porte un identifiant
> qui figure aussi dans le fichier source : `grep D-042` trouve les deux.
> Ne se lit jamais en entier — on y arrive par l'identifiant.

<!-- INDEX:DEBUT -->

> **NE LIS PAS CE FICHIER EN ENTIER.** Cette table donne le titre exact
> de chaque partie et ce qu'elle coûte. Va chercher la seule qui répond :
> `grep -n "^## <titre>" <fichier>` puis lis la plage. Le titre est la clé —
> il ne périme pas, un numéro de ligne oui.

| Partie | Lignes | Jetons ~ |
|---|---:|---:|
| **D-543 — HERO — la plaque de limaille** | 16 | 196 |
| **D-544 — Politique d'accent — tranchee et documentee.** | 24 | 315 |
| **D-545 — MESURE DU 2026-07-25 : a 0,72 le petit mot recevait 28 % de grains** | 11 | 164 |
| **D-546 — HAUTEUR REELLEMENT OCCUPEE, ROTATION COMPRISE.** | 20 | 274 |
| **D-547 — Le grand mot occupe presque toute la largeur, moins la marge** | 9 | 123 |
| **D-548 — ALIGNEMENT DU PETIT MOT — mesure, puis tranche.** | 11 | 148 |
| **D-549 — Sur ecran etroit le petit mot doit remonter en taille** | 7 | 77 |
| **D-550 — Le petit mot etait a 0,215 : sa hauteur de capitale tombait a** | 8 | 106 |
| **D-551 — Composition qui RENTRE, mesuree et non esperee. Deux passes** | 7 | 90 |
| **D-552 — DENSITE PAR LIGNE — c'est le reglage decisif.** | 14 | 188 |
| **D-553 — La decision « premiere visite de la session » est prise UNE** | 8 | 106 |
| **D-554 — Les grains partent des QUINZE filets horizontaux, exactement** | 16 | 229 |
| **D-555 — Filet de securite : onglet ouvert en arriere-plan, rideau** | 12 | 170 |
| **D-556 — RECOLORATION A LA BASCULE DE THEME.** | 20 | 261 |

<!-- INDEX:FIN -->

## D-543 — HERO — la plaque de limaille

============================================================
  HERO — la plaque de limaille
  ------------------------------------------------------------
  DEUX MOTS, EN PERMANENCE, QUI NE CHANGENT JAMAIS.
  « ADEXWEB » en tres gros, « AGENCY » dessous, nettement plus
  petit, justifie sur la largeur du mot du haut, la plaque posee
  de travers de quelques degres.

  Aucun carrousel de lettres, aucun morph d'un glyphe vers un
  autre, aucun bouton de selection : le mot ADEXWEB reste ADEXWEB du
  debut a la fin de la visite. La technique emprunte a la
  reference sa MATIERE, pas son scenario.
  ============================================================

## D-544 — Politique d'accent — tranchee et documentee.

------------------------------------------------------------
    Politique d'accent — tranchee et documentee.

    L'ancienne regle disait : le minium ne sert que le chiffre ROI,
    l'index actif, le CTA primaire et le filet de section active.
    Un hero en minium plein la casse.

    REGLE REECRITE, et elle est plus forte que l'ancienne :
    « Le minium est la MATIERE dont ADEXWEB est fait. Il apparait une
    fois en pleine masse, au hero, comme le bloc de matiere brute.
    Ensuite il ne revient que la ou le visiteur peut agir sur cette
    matiere : le CTA primaire, l'index actif, le chiffre du
    calculateur, le filet de la section active. »

    Le grand mot est donc en minium dominant, et le petit mot est
    deja en encre dominante : la descente vers l'encre commence
    dans le hero meme. Ce n'est pas qu'esthetique, c'est un gain
    de lisibilite mesurable — l'encre sur ciment donne 13,89:1
    quand le minium donne 5,74:1, et c'est le PETIT mot qui a le
    plus besoin de contraste.
    ------------------------------------------------------------

## D-545 — MESURE DU 2026-07-25 : a 0,72 le petit mot recevait 28 % de grains

MESURE DU 2026-07-25 : a 0,72 le petit mot recevait 28 % de grains
    minium melanges a 72 % d'encre. A la taille d'AGENCE, ce melange ne
    se lit pas comme de la matiere, il se lit comme du BRUIT : les
    lettres paraissent floues alors que la couverture est pleine. Ce
    n'etait donc pas un probleme de densite mais de DITHERING a deux
    tons sur un fut de 12 px. A 0,96 il reste juste assez de grains
    d'accent pour que la matiere soit la meme que celle d'ADEXWEB, et le
    mot se lit d'un coup.

## D-546 — HAUTEUR REELLEMENT OCCUPEE, ROTATION COMPRISE.

------------------------------------------------------------
    HAUTEUR REELLEMENT OCCUPEE, ROTATION COMPRISE.

    Le bloc est tourne de ANGLE degres autour du CENTRE du canvas.
    Un bloc large bascule : son coin bas-gauche descend de
    (largeur / 2) * |sin(ANGLE)|. Mesure du 2026-07-25 a 1440 :
    largeur du bloc 968 px, |sin(2,2°)| = 0,0384, donc 18,6 px de
    descente de chaque cote. Hauteur du bloc droit 296,6 px, canvas
    305 px : le bloc tenait de justesse A PLAT et debordait de
    28,8 px UNE FOIS TOURNE. Les grains hors cadre sont supprimes au
    trace (`drawFrame`), donc le bas d'AGENCE etait litteralement
    ampute. C'est la cause exacte du mot coupe.

    On mesure donc l'emprise reelle, et si elle deborde on
    RECALCULE la composition a l'echelle qui rentre. Aucune
    dimension de canvas ne peut plus produire un mot coupe.
    ------------------------------------------------------------

## D-547 — Le grand mot occupe presque toute la largeur, moins la marge

Le grand mot occupe presque toute la largeur, moins la marge
      que la rotation reclame : incline de 2,2 degres, un bloc de
      1000 px de large deborde de 1000*sin(2,2°) ≈ 38 px en
      hauteur et il faut lui laisser cette place. Sur ecran etroit
      la taille est RECALCULEE pour le format, on ne rétrécit pas
      betement, donc ADEXWEB ne deborde jamais.

## D-548 — ALIGNEMENT DU PETIT MOT — mesure, puis tranche.

ALIGNEMENT DU PETIT MOT — mesure, puis tranche.
      Justifie sur la largeur exacte d'ADEXWEB, l'interlettrage
      necessaire monte a 2,3 em : AGENCY explose en six lettres
      sans lien et cesse d'etre un mot. Mesure a 1440 : 135 px
      entre chaque lettre pour un corps de 59.
      On garde donc un interlettrage TENU, et le petit mot
      s'aligne a gauche sous la haste du A. Le bloc a un bord
      droit irregulier, ce qui est une decision, pas un accident.

## D-549 — Sur ecran etroit le petit mot doit remonter en taille

Sur ecran etroit le petit mot doit remonter en taille
      relative : a 0,245 sa hauteur de capitale tombait a 17 px,
      avec des fûts de 3 px sur lesquels un grain de 2 px est plus
      large que le trait.

## D-550 — Le petit mot etait a 0,215 : sa hauteur de capitale tombait a

Le petit mot etait a 0,215 : sa hauteur de capitale tombait a
      46 px pour un grand mot a 216, soit un rapport de 4,7. A cette
      echelle AGENCE ne soutient pas la comparaison avec ADEXWEB et le
      visiteur doit deviner. Porte a 0,26 : rapport 3,8, hauteur de
      capitale 56 px, futs de 15 px.

## D-551 — Composition qui RENTRE, mesuree et non esperee. Deux passes

Composition qui RENTRE, mesuree et non esperee. Deux passes
    suffisent : l'emprise est quasi lineaire en echelle, la seconde
    passe ne sert qu'a absorber la non-linearite de l'avance des
    glyphes. On garde 2 % de marge sous le bord du cadre.

## D-552 — DENSITE PAR LIGNE — c'est le reglage decisif.

DENSITE PAR LIGNE — c'est le reglage decisif.
      Couverture = (grain / pas)^2.
      - Grand mot : pas 3, grain 2 => 44 %. La matiere est
        franchement grenee de pres, mais assez dense pour lire
        comme un bloc de minium plein d'un coup d'oeil.
      - Petit mot : pas 2, grain 2 => 100 %, donc plein. A cette
        taille les fûts ne font que quelques pixels ; les trouer
        reduirait AGENCY en poussiere. C'est exactement le piege
        de la repartition a l'aire.
      Sous 560 px de large, le grand mot passe aussi en plein :
        ses fûts y sont trop etroits pour supporter des trous.

## D-553 — La decision « premiere visite de la session » est prise UNE

La decision « premiere visite de la session » est prise UNE
    SEULE FOIS, dans le script de tete, avant le premier rendu, et
    elle se lit ici sur la classe `entree-on`. Deux cles de session
    concurrentes se desynchronisaient : le rideau pouvait jouer sans
    que les grains ne partent, ou l'inverse.

## D-554 — Les grains partent des QUINZE filets horizontaux, exactement

Les grains partent des QUINZE filets horizontaux, exactement
      ceux dont le rideau est fait. Ils y sont poses tout de suite,
      mais ils ne partent qu'au moment ou la premiere bande du
      rideau s'ouvre : le rideau se disperse en filets et les grains
      composent ADEXWEB dans la meme seconde, avec la meme matiere.

      LE DECLENCHEUR EST L'ANIMATION REELLE, pas une horloge.
      Un `setTimeout` cale sur `performance.now()` mesure depuis la
      navigation, alors qu'un delai CSS part du premier rendu de
      l'element : les deux horloges different de tout le temps
      d'analyse du document, et le decalage se voyait. En ecoutant
      `animationstart` de la premiere bande, les deux gestes sont
      cales par construction.

## D-555 — Filet de securite : onglet ouvert en arriere-plan, rideau

Filet de securite : onglet ouvert en arriere-plan, rideau
        deja retire, animation jamais declenchee. La plaque se
        compose quand meme.
        CALE SUR LE GARDE-FOU DE `main.js`, pas sur une horloge a
        part. Depuis que la sequence peut s'ALLONGER pour couvrir un
        chargement lent, un delai fixe de 1,4 s partait avant que le
        rideau ait commence a s'ouvrir : les grains composaient
        ADEXWEB derriere un rideau encore ferme, et le relais — qui est
        tout l'interet du geste — ne se voyait pas.

## D-556 — RECOLORATION A LA BASCULE DE THEME.

------------------------------------------------------------
    RECOLORATION A LA BASCULE DE THEME.

    Le defaut : `build()` lit `--surface-0`, `--accent` et `--ink`
    UNE SEULE FOIS, a la composition. La bascule de theme ne
    rappelait rien. Un visiteur arrive en sombre puis passe en clair
    gardait donc des grains fonces sur un ciment clair, et — avant
    que le champ passe en fond transparent — un bloc franchement
    noir. C'est exactement le « le hero reste noir en mode clair ».

    Recomposer entierement couterait un `getImageData` et 25 000
    cibles reconstruites pour un simple changement de couleur. Or
    `this.tone` ne stocke qu'un INDICE de ton par grain : il suffit
    de remettre la table des tons a jour et de retracer une image.
    Cout mesure : une passe de trace, sous la milliseconde.
    ------------------------------------------------------------

