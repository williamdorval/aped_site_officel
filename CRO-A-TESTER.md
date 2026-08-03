# CRO — CE QUI SE TESTE QUAND IL Y AURA DU TRAFIC

Écrit le 2026-08-02, à la fin du chantier CRO. Étiquette de départ :
`avant-cro`.

> **Rien ici n'est un défaut connu.** Ce sont des hypothèses que je ne
> peux pas trancher sans vrais visiteurs. Les défauts, eux, ont été
> corrigés — ils sont dans `preuves/2026-08-04-cro/AUDIT.md` et dans
> les journaux `decisions/`.

---

## 0 · CE QU'IL FAUT FAIRE AVANT TOUT AUTRE TEST

**Activer FormSubmit.** Tant que ce n'est pas fait, il n'y a rien à
mesurer : aucun formulaire ne livre. Le service répond `HTTP 200`
avec `{"success":"false"}` — « This form needs Activation ». Le
courriel d'activation a été envoyé à `dorvalwilliam11@gmail.com` le
2026-08-02 par la sonde `tools/_sondes/cro-formulaire.mjs`. Un clic
sur « Activate Form ».

Puis **refaire l'envoi de bout en bout** et vérifier qu'un courriel
arrive vraiment, pièces jointes comprises :

```
node tools/_sondes/cro-envoi-reel.mjs
```

---

## 1 · LA MESURE, SANS UNE SEULE REQUÊTE TIERCE

**Verdict : chantier séparé, après la mise en ligne. Rien installé.**

Les trois raisons :

1. **Une carte de chaleur sur zéro visiteur ne dit rien.** Les
   enregistrements de session et les cartes de chaleur demandent des
   centaines de sessions avant de séparer un signal d'un hasard.
2. **Les outils auto-hébergés demandent une infrastructure que le site
   n'a pas.** Umami, Plausible CE, Matomo, GoatCounter : tous exigent
   un serveur qui exécute et une base de données. Le site est
   statique, servi en fichiers.
3. **Le premier palier est gratuit et déjà là.** Les journaux de
   l'hébergeur donnent visites, pages et provenance, sans une ligne de
   JavaScript et sans un octet de témoin.

**S'il faut un jour du clic — et seulement alors** : un mouchard
**même origine**, ~40 lignes, `navigator.sendBeacon("/mesure", …)`,
qui n'enregistre que *quelle section a été atteinte* et *quel bouton a
été cliqué*. Aucun identifiant, aucun témoin, aucune adresse IP
conservée. Même origine = la règle des zéro requête tierce tient au
sens strict. **Mais il faut un hébergement qui exécute du code**, ce
qui n'est pas le cas aujourd'hui. À décider quand la question se
posera vraiment.

**Ne rien installer avant d'avoir mesuré avec les journaux pendant un
mois.**

---

## 2 · LES HYPOTHÈSES P3

### H1 · Le socle du hero est sous le pli à 1024 × 768

**Mesuré, avant comme après ce chantier** (`tools/_sondes/cro-pli.mjs`) :

| 1024 × 768 | bas | au pli ? |
|---|---:|---|
| sur-titre | 97 | oui |
| titre | 531 | oui |
| sous-titre | 601 | oui |
| CTA principal | 689 | oui |
| CTA second | 757 | oui, de justesse |
| fiche technique | 757 | oui, de justesse |
| **socle (les trois réassurances)** | **862** | **non** |

Sur le portable le plus courant, aucune des trois réassurances n'est
visible au premier écran. **Non corrigé** : le corriger demande de
déplacer la structure du hero, ce que le brief interdit sans accord.

**J'ai essayé une autre voie et je l'ai retirée** : ajouter une phrase
de preuve au sous-titre. Elle coûtait une ligne, et cette ligne
poussait le CTA second **et les quatre délais chiffrés** de 757 à 784
— sous le pli. Mauvais échange (D-698).

**À tester** : remonter le socle au-dessus des deux boutons, ou le
réduire à une seule ligne à cette largeur.

### H2 · Le programme de référence occupe le sommet visuel du site

`#reference` est la seule chambre noire pleine du parcours, avec
« 5 000 $ » au calibre d'affiche. C'est le pic visuel de la page — et
il est donné à une action destinée à quelqu'un qui **n'achète pas**.

Il occupe aussi la moitié de l'en-tête, à toutes les hauteurs de
défilement, à côté du CTA d'achat.

**À tester** : déplacer `#reference` après `#contact`, ou retirer son
bouton de l'en-tête sur les écrans étroits. Mesure : part des
ouvertures de `modal-project` par visiteur.

### H3 · L'ordre des sections

Onze sections, 18 888 px de haut. Le calculateur (06) et le comparatif
(07) sont les deux pièces les plus convaincantes, et elles arrivent
après quatre sections de démonstration.

**À tester** : le calculateur en 03, juste après les services.

### H4 · Les cinq champs obligatoires qui restent

Neuf champs obligatoires dans l'assistant de projet, sur cinq
questions (D-703). Chacun a été gardé parce qu'il change ce qu'on
écrit dans la proposition. Deux restent discutables :

- **`nombre_employes`** — scope-t-il vraiment la proposition, ou
  est-ce une question de confort ? Le curseur équivalent du
  calculateur a été retiré parce qu'il ne changeait rien (D-699).
- **`budget`** — le champ le plus abandonné de tous les formulaires
  d'agence. À tester en optionnel.

### H5 · La formulation du titre du hero

« On code ce qui fait rouler votre entreprise. » parle déjà du
résultat, pas du produit — je n'y ai pas touché, et je ne le
recommande pas sans données. **À tester seulement contre une variante
qui nomme le métier du visiteur**, pas contre une variante « plus
percutante ».

### H6 · « Nos services. »

Le seul H2 du site tourné produit. Non changé : il est compris en une
seconde par n'importe qui, et les cinq cartes en dessous sont déjà
toutes tournées bénéfice. Une formule plus habile coûterait de la
clarté pour un gain marginal. **À tester si le trafic le permet.**

---

## 3 · CE QUI MANQUE ET QUI NE SE TESTE PAS — il faut le décider

1. **Les modalités de paiement.** La nouvelle question de la FAQ
   répond à la peur de la surprise (« le prix est ferme et il est
   écrit ») mais **ne donne aucun acompte ni calendrier de
   versement** : je ne les connais pas, et les inventer aurait échoué
   Q1. Écris-les, je les mettrai.

2. **L'adresse de courriel.** `dorvalwilliam11@gmail.com` apparaît
   quatre fois et sert d'adresse de contact. Pour un patron de 55 ans
   qui évalue une agence, une adresse Gmail personnelle dit « ce n'est
   pas une entreprise ». Il faut un nom de domaine.

3. **Le premier vrai client.** La FAQ dit maintenant : « le jour où on
   aura un client à nommer, il sera nommé ici avec son accord. » C'est
   une promesse ; elle se tient le jour venu.

4. **`demos-secteurs/` : trois métiers sur douze n'ont pas d'écran** —
   restauration, garage, paysagement. Les neuf autres sont ouverts
   depuis `#demos` (D-705). Les trois manquants sont les seuls dont
   l'aperçu au survol ne mène nulle part.

---

## 4 · CE QUI N'A JAMAIS ÉTÉ MESURÉ

> **AUCUNE mesure de ce projet n'a été prise sur un appareil réel.**
> Tout vient de Chromium sous Playwright sur une machine de bureau
> Windows, relevés « téléphone » compris. Cela vaut aussi pour tout ce
> qui est écrit ici.
