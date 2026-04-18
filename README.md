# Système de Vote Électronique — Backend API

API REST construite avec Node.js + Express + PostgreSQL pour la gestion d'élections étudiantes.

## Stack technique

- Runtime : Node.js
- Framework : Express 5
- Base de données : PostgreSQL 14
- Authentification : JWT (jsonwebtoken)
- Hashage : bcrypt
- Autres : dotenv, cors, pg

---

## Structure du projet

projet-vote/
├── README.md
└── backend/
    ├── election_backup.sql    <- sauvegarde de la base
    ├── package.json
    └── src/
        ├── config/
        │   └── db.js          <- connexion PostgreSQL
        ├── middlewares/
        │   └── auth.js        <- vérification JWT + rôles
        ├── routes/
        │   ├── auth.js        <- login
        │   ├── election.js    <- gestion des élections
        │   ├── candidat.js    <- gestion des candidatures
        │   ├── vote.js        <- votes et résultats
        │   └── commentaire.js <- commentaires
        └── index.js           <- point d'entrée

---

## Prérequis

- Node.js >= 18
- PostgreSQL >= 14
- npm >= 9

---

## Installation après git clone

### 1. Cloner le projet

git clone https://github.com/votre-repo/projet-vote.git
cd projet-vote/backend

### 2. Installer les dépendances

npm install

### 3. Configurer les variables d'environnement

Créer le fichier .env dans le dossier backend/ :

PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=election
DB_USER=master
DB_PASSWORD=passe123
JWT_SECRET=secret_jwt_super_secure_2024

---

## Importer la base de données

### Étape 1 — Installer PostgreSQL sur Ubuntu

sudo apt update
sudo apt install postgresql postgresql-contrib -y
sudo systemctl start postgresql
sudo systemctl enable postgresql

### Étape 2 — Créer l'utilisateur et la base

sudo -u postgres psql

Dans psql, exécuter :

CREATE USER master WITH PASSWORD 'passe123';
CREATE DATABASE election;
GRANT ALL PRIVILEGES ON DATABASE election TO master;
GRANT ALL ON SCHEMA public TO master;
\q

### Étape 3 — Importer la sauvegarde

psql -U master -d election -h localhost < election_backup.sql

Mot de passe à saisir : passe123

### Étape 4 — Vérifier les tables

psql -U master -d election -h localhost

Puis dans psql :

\dt

Vous devriez voir ces 11 tables :
annee_academique, candidat, classe, commentaire,
cycle, election, filiere, inscription,
niveau, utilisateur, vote

---

## Démarrer le serveur

### Mode développement

cd backend
node src/index.js

Vous devriez voir :
Connexion PostgreSQL réussie
Serveur démarré sur le port 3000

### Mode production avec pm2

npm install -g pm2
pm2 start src/index.js --name election-api
pm2 startup
pm2 save

Serveur disponible sur : http://localhost:3000

---

## Comptes de test

ATTENTION : Ces comptes sont uniquement pour les tests.
Changer tous les mots de passe en production.

### Administrateur (surveillant)

Email        : surveillant@gmail.com
Mot de passe : passer
Rôle         : admin

### Étudiant 1

Email        : etudiant1@gmail.com
Mot de passe : passer
Rôle         : etudiant

### Étudiant 2

Email        : etudiant2@gmail.com
Mot de passe : passer
Rôle         : etudiant

### Base de données PostgreSQL

Utilisateur  : master
Mot de passe : passe123
Base         : election
Port         : 5432
Host         : localhost

---

## Routes de l'API

### Authentification

POST /api/auth/login — Public — Connexion utilisateur

Exemple :
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "surveillant@gmail.com", "mot_de_passe": "passer"}'

---

### Élections

POST   /api/elections                  — Admin     — Créer une élection
GET    /api/elections                  — Connecté  — Lister les élections
GET    /api/elections/:id              — Connecté  — Détail d'une élection
PATCH  /api/elections/:id/ouvrir       — Admin     — Ouvrir une élection
PATCH  /api/elections/:id/fermer       — Admin     — Fermer une élection

Exemple créer une élection :
curl -X POST http://localhost:3000/api/elections \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer VOTRE_TOKEN" \
  -d '{"nom": "Election Bureau Etudiant 2025", "id_anneeAcademique": 1}'

Exemple ouvrir une élection :
curl -X PATCH http://localhost:3000/api/elections/1/ouvrir \
  -H "Authorization: Bearer VOTRE_TOKEN"

Exemple fermer une élection :
curl -X PATCH http://localhost:3000/api/elections/1/fermer \
  -H "Authorization: Bearer VOTRE_TOKEN"

---

### Candidatures

POST   /api/candidats      — Connecté  — Se porter candidat
GET    /api/candidats      — Connecté  — Lister les candidats
DELETE /api/candidats/:id  — Connecté  — Retirer sa candidature

Exemple se porter candidat :
curl -X POST http://localhost:3000/api/candidats \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer VOTRE_TOKEN" \
  -d '{"programme": "Mon programme électoral", "id_classe": 1, "id_election": 1}'

Exemple lister les candidats :
curl -X GET http://localhost:3000/api/candidats \
  -H "Authorization: Bearer VOTRE_TOKEN"

---

### Votes

POST  /api/votes                          — Connecté — Voter pour un candidat
GET   /api/votes/resultats/:id_election   — Connecté — Voir les résultats

Exemple voter :
curl -X POST http://localhost:3000/api/votes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer VOTRE_TOKEN" \
  -d '{"id_candidat": 1, "id_election": 1}'

Exemple voir les résultats :
curl -X GET http://localhost:3000/api/votes/resultats/1 \
  -H "Authorization: Bearer VOTRE_TOKEN"

---

### Commentaires

POST   /api/commentaires                 — Connecté — Ajouter un commentaire
GET    /api/commentaires/election/:id    — Connecté — Lister les commentaires
DELETE /api/commentaires/:id             — Connecté — Supprimer son commentaire

Exemple commenter l'élection (général) :
curl -X POST http://localhost:3000/api/commentaires \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer VOTRE_TOKEN" \
  -d '{"contenu": "Bonne chance a tous!", "id_election": 1}'

Exemple commenter en ciblant un candidat :
curl -X POST http://localhost:3000/api/commentaires \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer VOTRE_TOKEN" \
  -d '{"contenu": "Je soutiens ce candidat", "id_election": 1, "id_candidat": 1}'

Exemple lister les commentaires :
curl -X GET http://localhost:3000/api/commentaires/election/1 \
  -H "Authorization: Bearer VOTRE_TOKEN"

---

## Authentification JWT

Toutes les routes protégées nécessitent ce header :

Authorization: Bearer VOTRE_TOKEN_JWT

Le token est obtenu via POST /api/auth/login
Il expire après 24 heures.

---

## Règles métier importantes

- Un utilisateur ne peut voter qu'une seule fois par élection
- On ne peut se porter candidat que si l'élection est ouverte
- Seul un admin peut créer, ouvrir ou fermer une élection
- Un commentaire peut cibler un candidat précis ou être général
- Un utilisateur ne peut supprimer que ses propres commentaires et candidatures

---

## Sauvegarde et restauration de la base

### Sauvegarder la base

pg_dump -U master -h localhost election > backend/election_backup.sql

### Restaurer la base

psql -U master -d election -h localhost < backend/election_backup.sql
# Systeme-de-vote
