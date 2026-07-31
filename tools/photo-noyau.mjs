/* ============================================================
   LE NOYAU DE TRAITEMENT D IMAGE, PARTAGE
   Ce module ne fait rien tout seul : il porte le SOURCE des
   fonctions qui tournent DANS le navigateur, et que deux outils de
   fabrication injectent par `page.addScriptTag`.

   Il existe parce que la reprojection gnomonique a ete ecrite trois
   fois — `tour-images.mjs`, `secteurs-photos.mjs`, puis ce
   chantier-ci. Trois copies d une projection, c est trois occasions
   d en corriger une seule.

   QUATRE FONCTIONS, ET CHACUNE PORTE SA RAISON DANS SON COMMENTAIRE
     __charger          une image depuis une `data:` URL
     __reduireCyclique  reduire un equirectangulaire SANS couture
     __vue              reprojection gnomonique, la meme que le
                        visionneur 360 : la photo EST une vue
     __prep             charge, reduit, garde les pixels sous la main
     __plat             recadrage et reduction d une photo ordinaire
   ============================================================ */
export const NOYAU = `
window.__charger = d => new Promise((ok,no)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=()=>no(new Error("image illisible"));i.src=d;});

/* REDUCTION CYCLIQUE — un equirectangulaire boucle, drawImage non.
   Sans ca, le filtre de bord travaille sur un voisinage tronque et
   fabrique une couture A LA REDUCTION, sur une image dont la
   projection etait parfaite. */
window.__reduireCyclique = function (img, largeur) {
  const MARGE = 64, k = largeur / img.width, Ms = Math.max(2, Math.round(MARGE / k));
  let cur = document.createElement("canvas");
  cur.width = img.width + 2*Ms; cur.height = img.height;
  let x = cur.getContext("2d", {willReadFrequently:true});
  x.imageSmoothingEnabled = true; x.imageSmoothingQuality = "high";
  x.drawImage(img, img.width-Ms, 0, Ms, img.height, 0, 0, Ms, img.height);
  x.drawImage(img, Ms, 0, img.width, img.height);
  x.drawImage(img, 0, 0, Ms, img.height, Ms+img.width, 0, Ms, img.height);
  const cible = largeur + 2*MARGE;
  while (cur.width/2 >= cible) {
    const c = document.createElement("canvas");
    c.width = Math.round(cur.width/2); c.height = Math.round(cur.height/2);
    const g = c.getContext("2d", {willReadFrequently:true});
    g.imageSmoothingEnabled = true; g.imageSmoothingQuality = "high";
    g.drawImage(cur, 0, 0, c.width, c.height); cur = c;
  }
  const out = document.createElement("canvas");
  out.width = largeur; out.height = Math.round(largeur/2);
  const o = out.getContext("2d", {willReadFrequently:true});
  o.imageSmoothingEnabled = true; o.imageSmoothingQuality = "high";
  const ech = (largeur + 2*MARGE) / cur.width;
  o.drawImage(cur, -MARGE, 0, cur.width*ech, cur.height*ech);
  return out;
};

/* REPROJECTION GNOMONIQUE — identique a tools/tour-images.mjs, donc
   au visionneur : la photo EST une vue de la visite, pas une
   illustration a cote. */
window.__vue = function (sd, sw, sh, yaw, pitch, hfov, W, H) {
  const out = document.createElement("canvas"); out.width=W; out.height=H;
  const oc = out.getContext("2d"); const od = oc.createImageData(W,H);
  const R = Math.PI/180, f = (W/2)/Math.tan(hfov/2*R);
  const cy=Math.cos(yaw*R), sy=Math.sin(yaw*R), cp=Math.cos(pitch*R), sp=Math.sin(pitch*R);
  for (let py=0; py<H; py++) for (let px=0; px<W; px++) {
    /* rayon camera : elle vise -Z, comme dans le viewer */
    let x=px-W/2, y=-(py-H/2), z=-f;
    /* tangage autour de X, puis lacet autour de Y */
    let y2=y*cp - z*sp, z2=y*sp + z*cp;
    const dx=x*cy + z2*sy, dz=-x*sy + z2*cy;
    const n=Math.hypot(dx,y2,dz);
    const lon=Math.atan2(dx/n,-dz/n), lat=Math.asin(y2/n);
    const u=(0.5+lon/(2*Math.PI))*sw, v=(0.5-lat/Math.PI)*sh;
    const u0=Math.floor(u), v0=Math.min(sh-1,Math.max(0,Math.floor(v)));
    const fu=u-u0, fv=v-v0;
    /* bilineaire, avec bouclage en u : l'image est cyclique */
    const u1=((u0+1)%sw+sw)%sw, uu=((u0%sw)+sw)%sw, v1=Math.min(sh-1,v0+1);
    const k=(py*W+px)*4;
    for (let c=0;c<3;c++){
      const a=sd[(v0*sw+uu)*4+c], b=sd[(v0*sw+u1)*4+c];
      const d2=sd[(v1*sw+uu)*4+c], e=sd[(v1*sw+u1)*4+c];
      od.data[k+c]=(a+(b-a)*fu)*(1-fv)+(d2+(e-d2)*fu)*fv;
    }
    od.data[k+3]=255;
  }
  oc.putImageData(od,0,0); return out;
};

/* Charge un equirectangulaire, le ramene a la largeur de travail et
   garde ses pixels sous la main pour les reprojections suivantes. */
window.__prep = async function (d, largeur) {
  const im = await window.__charger(d);
  const c = window.__reduireCyclique(im, largeur);
  const x = c.getContext("2d", {willReadFrequently:true});
  window.__sd = x.getImageData(0,0,c.width,c.height).data;
  window.__sw = c.width; window.__sh = c.height;
  return { w: im.width, h: im.height, ratio: +(im.width/im.height).toFixed(3) };
};

/* PHOTOGRAPHIE PLATE — fenetre en fractions, puis reduction par
   demi-pas : un drawImage qui divise par plus de deux d'un coup
   aliase les textures fines (grille de radiateur, chevrons). */
window.__plat = async function (d, fen, W, H, q) {
  const im = await window.__charger(d);
  const sw = Math.round(im.width * fen.w);
  const sh = Math.round(sw * H / W);
  const sx = Math.round(im.width * fen.x);
  const sy = Math.round(im.height * fen.y);
  let cur = document.createElement("canvas");
  cur.width = sw; cur.height = sh;
  let g = cur.getContext("2d", {willReadFrequently:true});
  g.imageSmoothingEnabled = true; g.imageSmoothingQuality = "high";
  g.drawImage(im, sx, sy, sw, sh, 0, 0, sw, sh);
  while (cur.width/2 >= W) {
    const c = document.createElement("canvas");
    c.width = Math.round(cur.width/2); c.height = Math.round(cur.height/2);
    const x = c.getContext("2d", {willReadFrequently:true});
    x.imageSmoothingEnabled = true; x.imageSmoothingQuality = "high";
    x.drawImage(cur, 0, 0, c.width, c.height); cur = c;
  }
  const out = document.createElement("canvas");
  out.width = W; out.height = H;
  const o = out.getContext("2d");
  o.imageSmoothingEnabled = true; o.imageSmoothingQuality = "high";
  o.drawImage(cur, 0, 0, W, H);
  return { data: out.toDataURL("image/webp", q), sw: im.width, sh: im.height };
};`;
