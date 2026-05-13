EduSchedule Pro



Système Intégré de Gestion de l'Emploi du Temps et de Suivi Pédagogique



Institut Supérieur de Génie Electrique du Burkina Faso (ISGE-BF)

Département Réseaux et Systèmes de Télécommunications (RST)

Année universitaire 2025-2026

Encadreur : Dr Wend-Panga Cédric BERE



Membres du groupe :

\- KABRE Jaël Eugenie

\- MAIGA Mohamed Moctar

\- NIKIEMA Naïmatou Wendpagnagdé







Présentation du projet



EduSchedule Pro est une application web full-stack qui couvre l'intégralite

du cycle de vie d'une séance de cours, depuis sa planification jusqu'au

paiement de l'enseignant vacataire.



Dans de nombreux établissements d'enseignement supérieur en Afrique

francophone, la gestion des emplois du temps et le suivi des séances

reposent encore sur des processus manuels. EduSchedule Pro résout ces

problèmes en intégrant en une seule plateforme : la planification des cours,

le pointage électronique via QR-Code, la tenue numérique du cahier de texte,

et la génération automatique des fiches de vacation.







Flux applicatif



Planification (Admin)

&#x20; -> Génération QR-Code par créneau

&#x20; -> Pointage de l'enseignant via scan QR

&#x20; -> Séance en cours

&#x20; -> Saisie du cahier de texte par le délégué

&#x20; -> Signatures numériques (Délégué + Enseignant)

&#x20; -> Clôture de la séance

&#x20; -> Calcul automatique de la vacation

&#x20; -> Contrôle par le Surveillant

&#x20; -> Validation comptable

&#x20; -> Paiement de l'enseignant







Modules fonctionnels



&#x20;   Module 1 - Gestion de l'Emploi du Temps

Permet a l'administrateur de créer et publier les plannings hebdomadaires

par classe. Chaque créneau définit : le jour, l'heure de début et de fin,

la matière, l'enseignant et la salle. Le système détecte automatiquement

les conflits (enseignant déjà occupe, salle déjà prise). Un QR-Code unique

est généré pour chaque créneau planifie.



&#x20;   Module 2 - Pointage QR-Code

Chaque créneau possède un QR-Code unique contenant un token chiffre

(id\_séance + horodatage + clé secrète). Ce QR-Code n'est valide que dans

une fenêtre de +/- 15 minutes autour de l'heure prévue. L'enseignant scanne

le QR-Code via son smartphone pour valider sa présence. Le système enregistre

l'heure réelle et envoie une alerte au surveillant en cas de retard supérieur

a 30 minutes.



&#x20;   Module 3 - Cahier de Texte Numérique

Le délégué de classe saisit en temps réel le contenu de la séance : titre

du cours, points abordes, niveau d'avancement du programme, travaux demandes.

A la fin de la séance, le délégué et l'enseignant apposent leurs signatures

numériques via un pad de signature HTML5. La fiche est ensuite verrouillée

et un PDF peut être généré pour archivage.



&#x20;   Module 4 - Fiche de Vacation et Paiement

La fiche de vacation est générée automatiquement a partir des données du

cahier de texte. Elle calcule : durée effective x taux horaire = montant

par séance. La validation suit un workflow en 3 étapes :

&#x20; 1. L'enseignant signe et valide le montant

&#x20; 2. Le surveillant vérifie et appose son visa

&#x20; 3. Le comptable approuve et génère le bon de paiement



&#x20;   Module 5 - Tableau de Bord et Statistiques

Chaque acteur dispose d'un tableau de bord personnalise selon son rôle :

&#x20; - Administrateur : vue globale, alertes, statistiques de présence

&#x20; - Enseignant : mes séances, mes fiches de vacation, mon historique

&#x20; - Délégué : emploi du temps de ma classe, cahiers a remplir

&#x20; - Surveillant : fiches en attente de validation

&#x20; - Comptable : fiches a approuver, bons de paiement





&#x20;   Acteurs et rôles



| Acteur              | Permissions principales                          |

|---------------------|--------------------------------------------------|

| Administrateur      | CRUD complet, gestion utilisateurs, paramètres   |

| Enseignant          | Scan QR, signature séance, fiche vacation        |

| Délégué de classe   | Saisie cahier de texte, signature délégué        |

| Surveillant général | Vérification fiches, validation, rapports        |

| Resp. Comptable     | Validation finale, bons de paiement              |

| Etudiant            | Lecture seule : emploi du temps de sa classe     |







&#x20;   Stack technique



| Couche            | Technologie                  |

|-------------------|------------------------------|

| Frontend          | React 18 + Bootstrap 5       |

| Backend           | PHP 8.3 (Apache via WAMP)    |

| Base de données   | MySQL 8.4                    |

| Authentification  | Sessions PHP + JWT           |

| Génération QR     | chillerlan/php-qrcode (PHP)  |

| Scan QR client    | jsQR / html5-qrcode (JS)     |

| Signatures        | signature\_pad (npm)          |

| Export PDF        | mPDF / FPDF (PHP)            |

| Versioning        | Git / GitHub                 |







Structure du projet











&#x20;Installation et lancement



&#x20;Prérequis

\- WAMP64 (Apache + MySQL) ou XAMPP

\- Node.js v16+ et npm

\- Navigateur moderne



&#x20;Etape 1 - Cloner le dépôt

git clone https://github.com/naimatou/eduschedule-pro.git

cd eduschedule-pro



&#x20;Etape 2 - Base de données

1\. Démarrer WAMP et ouvrir phpMyAdmin

2\. Créer une base de données nommée : eduschedule\_pro

3\. Importer le fichier : database/eduschedule\_pro.sql

&#x20;  Ce script crée toutes les tables et insère les données de démonstration

&#x20;  (5 classes, 5 enseignants, utilisateurs de test pour chaque rôle)



&#x20;Etape 3 - Backend PHP

1\. Copier le dossier backend/ dans C:\\wamp64\\www\\eduschedule-pro\\

2\. Copier .env.example en .env :

&#x20;  cp .env.example .env

3\. Renseigner les valeurs dans .env (voir section Variables d'environnement)

4\. Démarrer Apache et MySQL depuis WAMP



&#x20;Etape 4 - Frontend React

cd frontend/mon-app

npm install

npm start



L'application est accessible sur : http://localhost:3000







&#x20;Comptes de démonstration



| Rôle           | Email                          | Mot de passe |

|----------------|--------------------------------|--------------|

| Administrateur | admin@eduschedule.com          | password     |

| Enseignant     | prof@eduschedule.com           | password     |

| Délégué        | delegue@eduschedule.com        | password     |

| Surveillant    | surveillant@eduschedule.com    | password     |

| Comptable      | comptable@eduschedule.com      | password     |



IMPORTANT : Changer les mots de passe en environnement de production.







&#x20;Variables d'environnement



Copier .env.example en .env et renseigner :



DB\_HOST=localhost

DB\_PORT=3306

DB\_NAME=eduschedule\_pro

DB\_USER=root

DB\_PASSWORD=



REACT\_APP\_API\_URL=http://localhost/eduschedule-pro/backend/api

JWT\_SECRET=changez\_cette\_valeur\_en\_production

QR\_CODE\_SECRET=changez\_ce\_secret\_qr

QR\_EXPIRY\_MINUTES=15

APP\_ENV=development



Ne jamais commiter le fichier .env sur GitHub.







&#x20;API REST - Principaux endpoints



Toutes les réponses sont en JSON.

Routes protégées : Authorization: Bearer {token}



POST   /api/auth/login              -> Connexion, retourne JWT

POST   /api/auth/logout             -> Déconnexion

GET    /api/classes                 -> Liste des classes

POST   /api/classes                 -> Créer une classe

GET    /api/enseignants             -> Liste des enseignants

GET    /api/emploi-temps            -> Emploi du temps d'une classe

POST   /api/emploi-temps            -> Créer un planning

GET    /api/creneaux/{id}/qr        -> QR-Code d'un créneau

POST   /api/pointages/scan          -> Valider un scan QR

GET    /api/cahiers                 -> Liste des cahiers de texte

POST   /api/cahiers                 -> Créer un cahier

POST   /api/cahiers/{id}/signer     -> Apposer une signature

POST   /api/cahiers/{id}/cloture    -> Clôturer une séance

POST   /api/vacations/generer       -> Générer une fiche de vacation

POST   /api/vacations/{id}/valider  -> Valider (surveillant)

GET    /api/vacations/{id}/pdf      -> Télécharger la fiche PDF

GET    /api/dashboard/stats         -> Statistiques tableau de bord





&#x20;Licence



Projet académique - ISGE-BF RST 2025-2026

Usage pédagogique uniquement.

