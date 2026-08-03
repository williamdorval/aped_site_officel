
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
