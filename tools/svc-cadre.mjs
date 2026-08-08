/* Le contenu des maquettes tient-il dans son cadre, ferme ET ouvert,
   a toutes les largeurs ? Un cadre en `overflow: hidden` ne se
   plaint pas : il coupe en silence.
   `node tools/svc-cadre.mjs [adresse]` */
import { chromium } from "playwright";
const BASE=(process.argv[2]||"http://127.0.0.1:8099").replace(/\/$/,"")+"/";
const nav=await chromium.launch();
const out=[];
for (const L of [1920,1600,1440,1280,1024,900,600,390,320]) {
  const ctx=await nav.newContext({viewport:{width:L,height:900},colorScheme:"light"});
  const page=await ctx.newPage();
  await page.addInitScript(()=>{try{sessionStorage.setItem("adexweb-sans-popup","1")}catch(e){}});
  await page.goto(BASE,{waitUntil:"load"});
  await page.waitForTimeout(2000);
  const lire=()=>page.evaluate(()=>[...document.querySelectorAll(".svc-carte")].map(c=>{
    const p=c.querySelector(".ecr-page");
    const cad=c.querySelector(".svc-cadre");
    return {carte:c.id, ouverte:!!c.querySelector(".svc-detail[open]"),
      cadre:Math.round(cad.getBoundingClientRect().height),
      coupeDe: p ? p.scrollHeight-p.clientHeight : 0,
      slack: p ? p.clientHeight-p.scrollHeight : 0};
  }));
  const ferme=await lire();
  for (const id of ["svc-01","svc-02","svc-03","svc-04"]) {
    await page.evaluate(i=>{const d=document.querySelector("#"+i+" .svc-detail"); if(d) d.open=true;}, id);
  }
  await page.waitForTimeout(500);
  const ouvert=await lire();
  out.push({largeur:L,
    ferme: ferme.filter(x=>x.coupeDe>0),
    ouvert: ouvert.filter(x=>x.coupeDe>0),
    slackMaxFerme: Math.max(...ferme.map(x=>x.slack||0)),
    slackMaxOuvert: Math.max(...ouvert.map(x=>x.slack||0)),
    debordH: await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth)});
  await ctx.close();
}
console.log(JSON.stringify(out,null,1));
await nav.close();
