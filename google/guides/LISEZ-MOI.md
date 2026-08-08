# Les deux guides du lead magnet

**Ils ne sont plus dans le site, et c'est le correctif.**  D-788

Ils vivaient dans `documents/`, donc à la racine servie :
`GET /documents/adexweb-automatisation.pdf` rendait 2 Mo de PDF à qui
connaissait l'adresse — et l'adresse était en clair dans `index.html`.
Le popup annonçait « contre vos coordonnées » et ne gardait rien.

Ils sont ici, sous `google/`, avec le code du serveur. **Ce dossier ne
se téléverse jamais sur l'hébergement du site**, au même titre que
`Code.gs`. Le rangement fait ce qu'une consigne de déploiement ne fait
pas : on ne peut plus les publier par distraction.

## Qui les livre

`Code.gs` les lit dans le dossier Drive `ADEXWEB — guides du lead magnet`
et les joint au courriel envoyé au visiteur qui a donné ses
coordonnées. Apps Script ne sait pas servir d'octets — ni
`ContentService` ni `HtmlService` ne rendent un PDF — donc la pièce
jointe est la seule livraison qui soit à la fois réelle et
conditionnelle.

## Quand les remplacer

`node tools/pdf.mjs` les refabrique depuis `documents/src/*.html`.
**Après chaque refabrication, redéposer les deux fichiers dans le
dossier Drive** : c'est de là que le serveur les prend, pas d'ici.
