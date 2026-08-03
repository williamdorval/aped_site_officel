
## D-690 · Les neuf ecrans de secteur s'ouvrent

Neuf des douze metiers ont un site de demonstration complet monte
dans `demos-secteurs/`. Ils jouaient deja, en `<iframe>` inerte au
survol (D-672) — mais seulement sur grand ecran, a la souris, au
palier 0, et sans qu'on puisse en toucher un seul. `grep -c
"demos-secteurs" index.html` rendait **0** : aucun lien, nulle part.

Ce ne sont PAS des sites : `STANDARD.md` § 0 bis (2026-08-01) dit
« UN ECRAN, PAS UN SITE », et les neuf sites longs sont archives dans
`archives/2026-08-01-sites-longs/`. Chacun est un PREMIER ECRAN
arrete, `scrollHeight <= 900`, dont les liens de menu sont `href="#"`.
Le mot du bloc le dit : « le menu ne mene nulle part. C'est une
maquette, pas un mandat livre. » Ma premiere redaction disait « neuf
sites complets » : c'etait faux, et corrige avant la premiere image.

Pour une agence sans client public, ces neuf premiers ecrans sont la
meilleure preuve disponible, et elle etait fermee. Verifie : aucun
debordement a 390, 768 ni 1024.

Les neuf ne sont PAS des pastilles de plus. Deux rangees de puces
identiques, l'une qui selectionne un apercu et l'autre qui ouvre un
site, ne se distinguent pas : la premiere planche l'a montre. Ils
reprennent donc la liste filetee du hero (`.fiche-rows`), qui est
deja la langue du site pour « voici ou aller » : un numero, un nom,
et l'acte a droite. Le minium est admis sur « OUVRIR » parce que
c'est un endroit ou le visiteur peut AGIR.

Aucun mouvement nouveau : le bloc entre avec les trois autres par le
seuil 04, verbe V2 S'ALIGNER, sens droite. La `data-cible` du seuil
passe de `.sector-group` a `.sector-group, .demos-ouvrir`.

## D-691 · `--ink-muted` ne tient pas sur `--surface-1`

`--ink-muted` est calibre sur `--surface-0` (5,18:1). Sur
`--surface-1` (#cbcec9) il rend **4,41:1**, sous le seuil de 4,5 pour
du texte de moins de 18 px. `.ecart-borne` echouait a ce titre aux
cinq largeurs, theme clair — defaut PREEXISTANT, zero ligne changee
depuis `avant-cro`.

Meme correctif que D-640 : `--ink`. La hierarchie tient toute seule,
le nombre etant en `--fs-4` display gras contre `--fs-8` mono.
