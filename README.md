# Dé Couleur

Site statique permettant de lancer **2, 3 ou 4 dés de couleur**.

## Fonctionnalités

- choix de 2, 3 ou 4 dés ;
- tirage parmi 6 couleurs ;
- panneau de probabilités dans le bouton **Réglages** ;
- niveaux disponibles : 0 %, 50 %, 75 % et 100 % ;
- 0 % empêche complètement une couleur de sortir ;
- 100 % garantit que la couleur sorte au moins une fois ;
- sauvegarde automatique des réglages dans le navigateur ;
- animation, copie du résultat et raccourci avec la barre d’espace ;
- interface responsive.

## Fonctionnement des chances

- **0 %** : la couleur ne peut jamais être tirée.
- **50 %** : poids normal.
- **75 %** : poids plus élevé.
- **100 %** : la couleur est placée au moins une fois dans le résultat.

Il n’est pas possible de garantir plus de couleurs que le nombre de dés.
Par exemple, avec 2 dés, seulement 2 couleurs peuvent être réglées à 100 %.

## Structure

```text
de-couleur/
├── assets/
│   └── favicon.svg
├── css/
│   └── style.css
├── js/
│   └── script.js
├── .gitignore
├── index.html
└── README.md
```

## Mise à jour sur Vercel

Si le projet Vercel est relié à GitHub :

1. remplace les anciens fichiers par ceux de cette archive ;
2. fais un commit sur la branche `main` ;
3. Vercel redéploiera automatiquement le site.
