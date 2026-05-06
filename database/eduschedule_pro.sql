-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1:3306
-- Généré le : mer. 06 mai 2026 à 15:33
-- Version du serveur : 8.4.7
-- Version de PHP : 8.3.28

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `eduschedule_pro`
--

-- --------------------------------------------------------

--
-- Structure de la table `cahiers_texte`
--

DROP TABLE IF EXISTS `cahiers_texte`;
CREATE TABLE IF NOT EXISTS `cahiers_texte` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_creneau` int NOT NULL,
  `id_delegue` int NOT NULL,
  `titre_cours` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contenu_json` text COLLATE utf8mb4_unicode_ci,
  `heure_fin_reelle` time DEFAULT NULL,
  `statut` enum('brouillon','signe_delegue','cloture') COLLATE utf8mb4_unicode_ci DEFAULT 'brouillon',
  `date_creation` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `id_creneau` (`id_creneau`),
  KEY `id_delegue` (`id_delegue`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `classes`
--

DROP TABLE IF EXISTS `classes`;
CREATE TABLE IF NOT EXISTS `classes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `libelle` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `niveau` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `annee_academique` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `classes`
--

INSERT INTO `classes` (`id`, `code`, `libelle`, `niveau`, `annee_academique`) VALUES
(1, 'L1-INFO', 'Licence 1 Informatique', 'Licence 1', '2025-2026'),
(2, 'L2-INFO', 'Licence 2 Informatique', 'Licence 2', '2025-2026'),
(3, 'L3-INFO', 'Licence 3 Informatique', 'Licence 3', '2025-2026'),
(4, 'M1-RST', 'Master 1 RST', 'Master 1', '2025-2026'),
(5, 'M2-RST', 'Master 2 RST', 'Master 2', '2025-2026');

-- --------------------------------------------------------

--
-- Structure de la table `creneaux`
--

DROP TABLE IF EXISTS `creneaux`;
CREATE TABLE IF NOT EXISTS `creneaux` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_emploi_temps` int NOT NULL,
  `id_matiere` int NOT NULL,
  `id_enseignant` int NOT NULL,
  `id_salle` int NOT NULL,
  `jour` enum('lundi','mardi','mercredi','jeudi','vendredi','samedi') COLLATE utf8mb4_unicode_ci NOT NULL,
  `heure_debut` time NOT NULL,
  `heure_fin` time NOT NULL,
  `qr_token` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `qr_expire` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id_emploi_temps` (`id_emploi_temps`),
  KEY `id_matiere` (`id_matiere`),
  KEY `id_enseignant` (`id_enseignant`),
  KEY `id_salle` (`id_salle`)
) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `creneaux`
--

INSERT INTO `creneaux` (`id`, `id_emploi_temps`, `id_matiere`, `id_enseignant`, `id_salle`, `jour`, `heure_debut`, `heure_fin`, `qr_token`, `qr_expire`) VALUES
(1, 1, 1, 1, 1, 'lundi', '08:00:00', '10:00:00', NULL, NULL),
(2, 2, 3, 3, 4, 'mercredi', '08:00:00', '12:00:00', NULL, NULL);

-- --------------------------------------------------------

--
-- Structure de la table `emploi_temps`
--

DROP TABLE IF EXISTS `emploi_temps`;
CREATE TABLE IF NOT EXISTS `emploi_temps` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_classe` int NOT NULL,
  `semaine_debut` date NOT NULL,
  `statut_publication` enum('brouillon','publie') COLLATE utf8mb4_unicode_ci DEFAULT 'brouillon',
  `cree_par` int NOT NULL,
  `date_creation` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `id_classe` (`id_classe`),
  KEY `cree_par` (`cree_par`)
) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `emploi_temps`
--

INSERT INTO `emploi_temps` (`id`, `id_classe`, `semaine_debut`, `statut_publication`, `cree_par`, `date_creation`) VALUES
(1, 1, '2026-04-21', 'brouillon', 1, '2026-04-21 22:36:22'),
(2, 4, '2026-05-06', 'brouillon', 1, '2026-05-06 09:40:22');

-- --------------------------------------------------------

--
-- Structure de la table `enseignants`
--

DROP TABLE IF EXISTS `enseignants`;
CREATE TABLE IF NOT EXISTS `enseignants` (
  `id` int NOT NULL AUTO_INCREMENT,
  `matricule` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nom` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `prenom` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `specialite` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `statut` enum('vacataire','permanent') COLLATE utf8mb4_unicode_ci NOT NULL,
  `taux_horaire` decimal(10,2) DEFAULT '0.00',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `enseignants`
--

INSERT INTO `enseignants` (`id`, `matricule`, `nom`, `prenom`, `email`, `specialite`, `statut`, `taux_horaire`) VALUES
(1, 'ENS2026001', 'BERE', 'Cédric', 'bere@isge.bf', 'Développement Web', 'permanent', 15000.00),
(2, 'ENS2026002', 'TRAORE', 'Aminata', 'traore@isge.bf', 'Base de Données', 'vacataire', 12000.00),
(3, 'ENS2026003', 'OUEDRAOGO', 'Issouf', 'ouedraogo@isge.bf', 'Réseaux', 'vacataire', 12000.00),
(4, 'ENS2026004', 'KABORE', 'Fatima', 'kabore@isge.bf', 'Algorithmique', 'permanent', 15000.00),
(5, 'ENS2026005', 'SOME', 'Pierre', 'some@isge.bf', 'Anglais', 'vacataire', 10000.00);

-- --------------------------------------------------------

--
-- Structure de la table `logs_activite`
--

DROP TABLE IF EXISTS `logs_activite`;
CREATE TABLE IF NOT EXISTS `logs_activite` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_utilisateur` int DEFAULT NULL,
  `action` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `details_json` text COLLATE utf8mb4_unicode_ci,
  `ip` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date_heure` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `id_utilisateur` (`id_utilisateur`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `matieres`
--

DROP TABLE IF EXISTS `matieres`;
CREATE TABLE IF NOT EXISTS `matieres` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `libelle` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `volume_horaire_total` int NOT NULL,
  `coefficient` int DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `matieres`
--

INSERT INTO `matieres` (`id`, `code`, `libelle`, `volume_horaire_total`, `coefficient`) VALUES
(1, 'DEV-WEB', 'Développement Web', 60, 3),
(2, 'BASE-DON', 'Base de Données', 45, 3),
(3, 'RESEAU', 'Réseaux Informatiques', 45, 2),
(4, 'ALGO', 'Algorithmique', 30, 2),
(5, 'ANGLAIS', 'Anglais Technique', 30, 1);

-- --------------------------------------------------------

--
-- Structure de la table `pointages`
--

DROP TABLE IF EXISTS `pointages`;
CREATE TABLE IF NOT EXISTS `pointages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_creneau` int NOT NULL,
  `heure_pointage_reelle` datetime NOT NULL,
  `ip_source` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `token_utilise` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `statut` enum('valide','retard','absent') COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `id_creneau` (`id_creneau`)
) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `pointages`
--

INSERT INTO `pointages` (`id`, `id_creneau`, `heure_pointage_reelle`, `ip_source`, `token_utilise`, `statut`) VALUES
(1, 1, '2026-04-22 11:41:53', '::1', '5482ef8406ac9e17e77c9f53bceec55f', 'retard'),
(2, 2, '2026-05-06 09:44:01', '::1', 'ae4d068005758eaa6242e315c6b3115d', 'retard');

-- --------------------------------------------------------

--
-- Structure de la table `salles`
--

DROP TABLE IF EXISTS `salles`;
CREATE TABLE IF NOT EXISTS `salles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `capacite` int NOT NULL,
  `equipements` text COLLATE utf8mb4_unicode_ci,
  `batiment` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `salles`
--

INSERT INTO `salles` (`id`, `code`, `capacite`, `equipements`, `batiment`) VALUES
(1, 'SALLE-A1', 50, 'Tableau, Projecteur', 'Bâtiment A'),
(2, 'SALLE-A2', 40, 'Tableau, PC', 'Bâtiment A'),
(3, 'SALLE-B1', 60, 'Tableau, Projecteur, Climatisation', 'Bâtiment B'),
(4, 'LABO-INFO', 30, 'PC, Internet, Climatisation', 'Bâtiment B');

-- --------------------------------------------------------

--
-- Structure de la table `signatures`
--

DROP TABLE IF EXISTS `signatures`;
CREATE TABLE IF NOT EXISTS `signatures` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_cahier` int NOT NULL,
  `type_signataire` enum('delegue','enseignant') COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_utilisateur` int NOT NULL,
  `signature_base64` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `horodatage` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `id_cahier` (`id_cahier`),
  KEY `id_utilisateur` (`id_utilisateur`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `travaux_demandes`
--

DROP TABLE IF EXISTS `travaux_demandes`;
CREATE TABLE IF NOT EXISTS `travaux_demandes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_cahier` int NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `date_limite` date DEFAULT NULL,
  `type` enum('devoir','exercice','projet') COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `id_cahier` (`id_cahier`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `utilisateurs`
--

DROP TABLE IF EXISTS `utilisateurs`;
CREATE TABLE IF NOT EXISTS `utilisateurs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mot_de_passe_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('admin','enseignant','delegue','surveillant','comptable','etudiant') COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_lien` int DEFAULT NULL,
  `actif` tinyint DEFAULT '1',
  `token_reset` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=MyISAM AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `utilisateurs`
--

INSERT INTO `utilisateurs` (`id`, `email`, `mot_de_passe_hash`, `role`, `id_lien`, `actif`, `token_reset`) VALUES
(1, 'admin@eduschedule.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', NULL, 1, NULL),
(2, 'enseignant@eduschedule.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'enseignant', NULL, 1, NULL),
(3, 'delegue@eduschedule.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'delegue', NULL, 1, NULL),
(4, 'surveillant@eduschedule.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'surveillant', NULL, 1, NULL),
(5, 'comptable@eduschedule.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'comptable', NULL, 1, NULL);

-- --------------------------------------------------------

--
-- Structure de la table `vacations`
--

DROP TABLE IF EXISTS `vacations`;
CREATE TABLE IF NOT EXISTS `vacations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_enseignant` int NOT NULL,
  `mois` int NOT NULL,
  `annee` int NOT NULL,
  `montant_brut` decimal(10,2) DEFAULT '0.00',
  `montant_net` decimal(10,2) DEFAULT '0.00',
  `statut` enum('generee','signee','validee','approuvee') COLLATE utf8mb4_unicode_ci DEFAULT 'generee',
  `date_generation` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `id_enseignant` (`id_enseignant`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `vacation_lignes`
--

DROP TABLE IF EXISTS `vacation_lignes`;
CREATE TABLE IF NOT EXISTS `vacation_lignes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_vacation` int NOT NULL,
  `id_creneau` int NOT NULL,
  `duree_heures` decimal(5,2) NOT NULL,
  `taux` decimal(10,2) NOT NULL,
  `montant` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `id_vacation` (`id_vacation`),
  KEY `id_creneau` (`id_creneau`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `validations`
--

DROP TABLE IF EXISTS `validations`;
CREATE TABLE IF NOT EXISTS `validations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_vacation` int NOT NULL,
  `id_validateur` int NOT NULL,
  `role_validateur` enum('surveillant','comptable') COLLATE utf8mb4_unicode_ci NOT NULL,
  `visa_base64` longtext COLLATE utf8mb4_unicode_ci,
  `date_validation` datetime DEFAULT CURRENT_TIMESTAMP,
  `commentaire` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  KEY `id_vacation` (`id_vacation`),
  KEY `id_validateur` (`id_validateur`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
