# Reduit les woff2 variables : on fige les axes inutiles et on ne garde que
# les caracteres dont le francais du Quebec a besoin. Le poids des polices
# est bloquant au premier rendu ; chaque kilo-octet se paie sur le LCP.
#
# On ne traite QUE le sous-ensemble "latin" de Google : il couvre U+0000-00FF
# plus OEoe, c'est-a-dire tout le francais. Le fichier "latin-ext" ne sert
# qu'a des langues qu'on n'ecrit pas ; le garder serait du poids mort.
#
# Usage : python refonte-adexweb/sous-ensemble.py
import os, sys
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools.subset import Subsetter, Options

ICI = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ICI, 'polices')
DEST = os.path.join(ICI, 'polices-pretes')
os.makedirs(DEST, exist_ok=True)

CARACTERES = (
    ''.join(chr(c) for c in range(0x20, 0x7F))
    + 'àâäçéèêëîïôöùûüÿœÀÂÄÇÉÈÊËÎÏÔÖÙÛÜŒÆæ'
    + '«»‘’“”–—…·°±×÷€©®™§'
    + '←↑→↓✓✕'
    + '  '   # espace insecable, espace fine insecable
)

# famille -> axes a figer ou borner, par variante. Les polices sont
# bloquantes : on ne garde que l'intervalle que le site parcourt vraiment.
PLAN = {
    'newsreader': {
        # Titres, de 26 a 80 px. Sous opsz 24 on n'imprime jamais rien, et la
        # hierarchie ne demande que deux graisses : 400 et 500.
        'latin': {'wght': (380, 560), 'opsz': (24, 72)},
        # L'italique n'emphase qu'un mot de titre, a une seule graisse et
        # aux grandes tailles : deux axes figes, la moitie du poids.
        'latin-italique': {'wght': 420, 'opsz': (32, 72)},
    },
    'instrument-sans': {
        # L'axe de chasse ne sert a rien : on le fige a 100.
        'latin': {'wdth': 100},
    },
}

total_avant = total_apres = 0
fichiers = 0
manquants_global = {}

for famille, variantes in PLAN.items():
    for variante, axes in variantes.items():
        nom = f'{famille}-{variante}.woff2'
        chemin = os.path.join(SRC, nom)
        if not os.path.exists(chemin):
            sys.exit(f'ARRET : {chemin} introuvable.')
        avant = os.path.getsize(chemin)

        police = TTFont(chemin)

        # Verifier la couverture AVANT de reduire : un caractere absent du
        # fichier source ne se verrait plus apres, et le site afficherait
        # un carre vide sans que rien ne le signale.
        couverts = set()
        for table in police['cmap'].tables:
            couverts.update(table.cmap.keys())
        manquants = sorted(c for c in set(CARACTERES) if ord(c) not in couverts)
        if manquants:
            manquants_global[nom] = manquants

        police = instancer.instantiateVariableFont(police, axes, updateFontNames=False)

        opts = Options()
        opts.layout_features = ['*']        # kern, liga, calt, onum...
        opts.name_IDs = ['*']
        opts.notdef_outline = True
        opts.drop_tables = ['DSIG']
        sub = Subsetter(options=opts)
        sub.populate(text=CARACTERES)
        sub.subset(police)

        police.flavor = 'woff2'
        sortie = os.path.join(DEST, nom)
        police.save(sortie)
        apres = os.path.getsize(sortie)
        if apres < 8000:
            sys.exit(f'ARRET : {nom} ne fait que {apres} octets apres reduction.')

        print(f'{nom:<38} {avant/1024:7.1f} Ko -> {apres/1024:6.1f} Ko  ({100 - apres*100//avant} % de moins)')
        total_avant += avant
        total_apres += apres
        fichiers += 1

if fichiers == 0:
    sys.exit('ARRET : zero fichier traite.')

print(f'\n{fichiers} fichiers  {total_avant/1024:.1f} Ko -> {total_apres/1024:.1f} Ko')

if manquants_global:
    print('\nCARACTERES ABSENTS DE LA SOURCE (ils tomberont sur la police de secours) :')
    for nom, liste in manquants_global.items():
        print(f'  {nom} : ' + ' '.join(f'U+{ord(c):04X}' for c in liste))
else:
    print('Couverture complete : aucun caractere demande ne manque.')
