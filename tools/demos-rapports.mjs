/* LE RAPPORT HAUTEUR / LARGEUR DE CHAQUE RECONSTITUTION « AVANT ».
   Releve dans la page, pas devine : `node tools/ba-check.mjs` le
   remesure et refuse si l'ecart depasse 3 %.
   Mesure du 2026-07-31 a cinq largeurs de fenetre (390 · 720 · 1024 ·
   1440 · 1920). Ecart maximal releve : 2 %, parce que tout ce qui
   compose une reconstitution est exprime en `cqw`.

   Ces chiffres commandent DEUX choses :
     - la hauteur photographiee de chaque vrai site (`demos-capture`) ;
     - la hauteur du WebP livre (`demos-webp`).
   Une comparaison avant / apres n'a de sens que si les deux cotes
   finissent a la meme ligne : sinon la poignee compare, a une hauteur
   donnee, le pied d'un site avec le milieu de l'autre.  D-632 */
export const RAPPORTS = {
  garage: 1.179,
  design: 2.721,
  restau: 2.413,
  deneigement: 4.155
};

/* La cle du projet source n'est pas celle de la comparaison : le
   dossier s'appelle `restau` et la fiche s'appelle « restaurant »,
   le dossier `MV-deneigement` et la fiche « renovation ». */
export const VERS_BA = {
  garage: "ba-garage",
  design: "ba-design",
  restau: "ba-restaurant",
  deneigement: "ba-renovation"
};
