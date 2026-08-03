
## D-692 · Le montant se tait tant que le visiteur n'a rien regle

Le rail affichait « IMPACT ANNUEL ESTIME ≈ 39 100 $ » **des le premier
ecran**, avant que le visiteur ait touche quoi que ce soit. C'etait la
sortie des curseurs par defaut (42 $/h, 26 h d'administration).

Les quatre questions de la regle A :
  · **Q1 vrai ?** le calcul est juste ;
  · **Q2 verifiable ?** non — la section 06 est six ecrans plus bas ;
  · **Q3 controle ?** oui ;
  · **Q4 compris en trois secondes ?** non. A cote du logo, en minium,
    « 39 100 $ » se lit comme un prix ou comme une promesse.

Q2 et Q4 echouent : le chiffre ne s'affiche donc plus tant qu'il n'est
pas le sien. Au repos, un cadratin. Au premier geste — n'importe quel
curseur, n'importe quel profil d'industrie — le rail et l'en-tete
s'allument, une fois pour toutes.

Le PANNEAU du calculateur, lui, compte des le depart : c'est son etat
de depart a lui, sous les yeux du visiteur, pas une affirmation sur
son entreprise.

Le cadratin est en `--ink-muted`, pas en minium : le minium ne se pose
que la ou le visiteur peut agir, et un cadratin n'est pas un montant.
`data-vide` porte l'etat, et il part au premier geste.

Sans JavaScript, le calculateur ne calcule pas : le cadratin est donc
aussi l'etat correct de la page nue.

## D-693 · Deux curseurs ne changeaient rien, ils sont partis

L'impact vaut `heures recuperees x taux horaire x 52`. Ni le NOMBRE
D'EMPLOYES ni le CHIFFRE D'AFFAIRES n'y entrent : les heures sont
saisies directement. Les deux curseurs ne nourrissaient que `lastRoi`,
mort depuis le retrait du formulaire courriel (D-636).

Mesure : de 5 a 50 employes, l'impact ne bouge pas d'un dollar. Un
patron qui pousse le premier curseur du calculateur et voit le chiffre
rester fige conclut que le calculateur est faux — et il a raison.

« Trois reglages, c'est tout » devient « Deux reglages, c'est tout ».
Les deux qui restent comptent tous les deux. Verifie : 10 curseurs,
0 qui ne change rien.

Le nombre d'employes reste demande la ou il sert vraiment, dans le
formulaire de projet (`nombre_employes`).

## D-694 · Un jour offert a toujours au moins une plage

La borne du JOUR etait calculee a minuit (`minDate()`, +24 h puis
`startOfDay`), celle des PLAGES a l'heure (`floor`, +24 h exactement).
Deux bornes, deux endroits, un decalage : tous les soirs apres
16 h 30 — la derniere plage — le premier jour offert etait cliquable
et **vide**. « Plus rien de libre ce jour-la. Prenez une autre date. »

C'est le visiteur le plus presse qui tombait dessus, a l'heure ou un
patron de PME regarde un site : le soir.

Une seule source, `plagesDuJour(date)`, sert desormais aux deux :
`jourOuvert()` la consulte pour desactiver la case, `renderSlots()`
pour peindre les boutons. Un jour sans plage ne s'offre plus.

`#slotsEmpty` reste en place. Ce n'est pas la rustine du defaut — le
defaut etait la borne, pas le message : c'est l'etat d'erreur du cas
ou la modale reste ouverte en franchissant 16 h 30.

Preuve : la sonde eprouve six heures d'horloge, dont 17 h et 21 h 30.
Sur le code d'avant elle rend **2 en defaut** ; sur celui-ci, **0**.
Le compte des jours offerts passe de 19 a 18 apres 16 h 30 — le jour
est retenu au lieu d'etre offert vide.
