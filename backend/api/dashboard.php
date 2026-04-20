<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/auth.php';

$methode = $_SERVER['REQUEST_METHOD'];

if ($methode === 'GET') {
    $payload = verifierToken();
    $role = $payload['role'];
    $id_user = $payload['id'];
    $conn = getConnexion();
    
    $stats = [];

    // Dashboard Administrateur
    if ($role === 'admin') {
        // Nombre total de classes
        $res = $conn->query("SELECT COUNT(*) as total FROM classes");
        $stats['total_classes'] = $res->fetch_assoc()['total'];
        
        // Nombre total d'enseignants
        $res = $conn->query("SELECT COUNT(*) as total FROM enseignants");
        $stats['total_enseignants'] = $res->fetch_assoc()['total'];
        
        // Séances du jour
        $jour = strtolower(date('l'));
        $jours = [
            'monday'=>'lundi','tuesday'=>'mardi',
            'wednesday'=>'mercredi','thursday'=>'jeudi',
            'friday'=>'vendredi','saturday'=>'samedi'
        ];
        $jour_fr = $jours[$jour] ?? 'lundi';
        
        $res = $conn->query(
            "SELECT COUNT(*) as total FROM creneaux 
             WHERE jour = '$jour_fr'"
        );
        $stats['seances_aujourd_hui'] = $res->fetch_assoc()['total'];
        
        // Séances pointées aujourd'hui
        $res = $conn->query(
            "SELECT COUNT(*) as total FROM pointages 
             WHERE DATE(heure_pointage_reelle) = CURDATE()"
        );
        $stats['pointages_aujourd_hui'] = $res->fetch_assoc()['total'];
        
        // Cahiers en attente de signature
        $res = $conn->query(
            "SELECT COUNT(*) as total FROM cahiers_texte 
             WHERE statut = 'brouillon'"
        );
        $stats['cahiers_en_attente'] = $res->fetch_assoc()['total'];
        
        // Fiches de vacation en attente
        $res = $conn->query(
            "SELECT COUNT(*) as total FROM vacations 
             WHERE statut = 'generee'"
        );
        $stats['vacations_en_attente'] = $res->fetch_assoc()['total'];
        
        // Alertes retards
        $res = $conn->query(
            "SELECT COUNT(*) as total FROM pointages 
             WHERE statut = 'retard' 
             AND DATE(heure_pointage_reelle) = CURDATE()"
        );
        $stats['retards_aujourd_hui'] = $res->fetch_assoc()['total'];
    }
    
    // Dashboard Enseignant
    elseif ($role === 'enseignant') {
        // Récupérer l'id enseignant lié
        $res = $conn->query(
            "SELECT id_lien FROM utilisateurs WHERE id = $id_user"
        );
        $id_enseignant = $res->fetch_assoc()['id_lien'];
        
        // Mes séances cette semaine
        $res = $conn->query(
            "SELECT cr.*, m.libelle as matiere, 
             c.libelle as classe, s.code as salle
             FROM creneaux cr
             JOIN matieres m ON cr.id_matiere = m.id
             JOIN emploi_temps et ON cr.id_emploi_temps = et.id
             JOIN classes c ON et.id_classe = c.id
             JOIN salles s ON cr.id_salle = s.id
             WHERE cr.id_enseignant = $id_enseignant
             AND et.semaine_debut <= CURDATE()
             AND DATE_ADD(et.semaine_debut, INTERVAL 6 DAY) >= CURDATE()
             ORDER BY cr.jour, cr.heure_debut"
        );
        $seances = [];
        while ($s = $res->fetch_assoc()) $seances[] = $s;
        $stats['mes_seances'] = $seances;
        
        // Mes fiches de vacation
        $res = $conn->query(
            "SELECT * FROM vacations 
             WHERE id_enseignant = $id_enseignant 
             ORDER BY annee DESC, mois DESC 
             LIMIT 5"
        );
        $vacations = [];
        while ($v = $res->fetch_assoc()) $vacations[] = $v;
        $stats['mes_vacations'] = $vacations;
    }
    
    // Dashboard Délégué
    elseif ($role === 'delegue') {
        // Cahiers à remplir
        $res = $conn->query(
            "SELECT ct.*, m.libelle as matiere
             FROM cahiers_texte ct
             JOIN creneaux cr ON ct.id_creneau = cr.id
             JOIN matieres m ON cr.id_matiere = m.id
             WHERE ct.id_delegue = $id_user
             AND ct.statut = 'brouillon'
             ORDER BY ct.date_creation DESC"
        );
        $cahiers = [];
        while ($c = $res->fetch_assoc()) $cahiers[] = $c;
        $stats['cahiers_a_remplir'] = $cahiers;
    }
    
    echo json_encode($stats);
    $conn->close();
}
?>