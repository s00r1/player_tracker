# ⚽ Player Tracker (version sécurisée)

Application web pour rechercher des joueurs et consulter des effectifs de clubs via l'API-Football, **sans exposer la clé API dans le navigateur**.

---

## ✨ Ce qui a été mis en place

- ✅ **Proxy backend sécurisé** (`server.js`) :
  - La clé API est lue côté serveur via `API_FOOTBALL_KEY`.
  - Le front appelle uniquement `/api/...`.
  - Aucune clé en dur dans `index.html`.
- ✅ **Suppression du mode “Équipe nationale”** (fonction non fiable).
- ✅ **Tests automatiques** avec `node:test`.
- ✅ **Documentation complète**.
- ✅ **Licence MIT**.

---

## 🧱 Architecture

```text
Navigateur
   │
   ├── GET / (index.html)
   │
   └── GET /api/*  ─────────►  server.js (proxy)
                              │
                              └── API-Football (clé privée côté serveur)
```

### Pourquoi c’est plus sûr ?

Avant : la clé pouvait être lue dans le JavaScript côté client.

Maintenant :
1. Le navigateur n'a jamais accès à la clé.
2. Le backend ajoute l'en-tête `x-apisports-key`.
3. Les erreurs upstream sont contrôlées et renvoyées proprement.

---

## 🚀 Démarrage rapide

## 1) Prérequis

- Node.js 18+ (ou 20+ recommandé)

## 2) Configurer la clé API

```bash
export API_FOOTBALL_KEY="votre_cle_api_football"
```

> Sous Windows PowerShell:
>
> ```powershell
> $env:API_FOOTBALL_KEY="votre_cle_api_football"
> ```

## 3) Lancer l’application

```bash
npm start
```

Par défaut : `http://localhost:3000`

---

## 🧪 Tests

```bash
npm test
```

Tests couverts actuellement :

- Normalisation des chemins (`safePathname`).
- Disponibilité de la page d'accueil.
- Vérification de sécurité quand la clé API manque.

---

## 📚 Fonctionnalités disponibles

## Recherche joueur

- Saisie d'un nom.
- Chargement du profil principal.
- Chargement des clubs associés.

## Recherche effectif club

- Pays → Championnat → Club.
- Chargement de l’effectif du club.

---

## 🔒 Bonnes pratiques sécurité (recommandées)

- Utiliser un reverse-proxy (Nginx/Caddy) avec HTTPS.
- Ajouter un rate limiting sur `/api/*`.
- Ajouter une allowlist d’origines (CORS strict si nécessaire).
- Journaliser les erreurs sans logguer la clé.
- En production, stocker la clé dans un gestionnaire de secrets.

---

## 🛠 Scripts npm

- `npm start` : démarre le serveur HTTP + proxy.
- `npm test` : exécute les tests Node natifs.

---

## 📄 Licence

Ce projet est sous licence **MIT**. Voir [LICENSE](./LICENSE).
