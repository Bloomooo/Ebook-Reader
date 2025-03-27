# EbookReader

Ce projet est une extension Firefox permettant de gérer et lire des eBooks.

## 📌 Version

Version actuelle : **1.0.1**

## Environnement de développement
- **OS** : Ubuntu 20.04.3 LTS
- **Node.js** : 18.19.1
- **npm** : 9.2.0
- **Angular CLI** : 19.2.4
- **TypeScript** : 5.7.3
- **Firefox** : 136.0.3 (64 bits)
- **webstorm** : 2024.3.5 

## 📦 Technologies utilisées

- Angular CLI 19.2.4
- TypeScript
- HTML/CSS
- Material Design

## 📚 Fonctionnalités
- [x] Ajouter un eBook
- [x] Lire un eBook
- [x] Progression de lecture
- [x] Sauvegarder la progression de lecture
- [x] Marquer un eBook comme lu/non lu

## ⚙️ Installation et exécution

### 1️⃣ Prérequis

Avant d'installer et d'exécuter le projet, assure-toi d'avoir :

- **Node.js** (version 18.19.1 ou plus récente)
- **npm** (installé avec Node.js / version 9.2.0 ou plus récente)
- **Angular CLI**

### 2️⃣ Installation

Clone ce dépôt et installe les dépendances :

```bash
  cd EbookReader
  npm install
```

### 3️⃣ Compilation automatique

Pour construire le projet en mode **watch** (compilation automatique des modifications) :

```bash
npm run build:watch
```

Cela génère les fichiers compilés dans le répertoire **`dist/`**.

## 🚀 Charger l'extension sur Firefox

Une fois le projet construit, voici comment l'ajouter à **Firefox** :

1. Ouvrir **Firefox**.
2. Aller à `about:debugging` dans la barre d'adresse.
3. Cliquer sur **"Ce Firefox"** dans le menu de gauche.
4. Cliquer sur **"Charger un module complémentaire temporaire"**.
5. Sélectionner le fichier `manifest.json` dans le dossier **`dist/ebook-reader/browser`**.
6. L'extension est maintenant chargée temporairement ! 🎉

💡 **Remarque** : Cette méthode charge l'extension temporairement. Elle disparaîtra lorsque tu relanceras Firefox.

## 📜 Licence

Ce projet est sous licence **MIT**.

---

🚀 **EbookReader** - Une extension simple et efficace pour gérer tes eBooks !

