<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/auth.php';

$methode = $_SERVER['REQUEST_METHOD'];

// POST /api/pointages/scan - Valider le scan QR
if ($methode === 'POST') {
    verifierRole(['enseignant']);
    $donnees = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($donnees['token_qr'])) {
        http_response_code(400);
        echo json_encode(['erreur' => 'Token QR manquant']);
        exit();
    }
    
    $conn = getConnexion();
    $token = $conn->real_escape_string($donnees['token_qr']);
    
    // Vérifier que le token existe et n'est pas expiré
    $sql = "SELECT cr.*, m.libelle as matiere, 
            c.libelle as classe, s.code as salle
            FROM creneaux cr
            JOIN matieres m ON cr.id_matiere = m.id
            JOIN emploi_temps et ON cr.id_emploi_temps = et.id
            JOIN classes c ON et.id_classe = c.id
            JOIN salles s ON cr.id_salle = s.id
            WHERE cr.qr_token = '$token' 
            AND cr.qr_expire > NOW()";
    
    $resultat = $conn->query($sql);
    
    if ($resultat->num_rows === 0) {
        http_response_code(400);
        echo json_encode(['erreur' => 'QR Code invalide ou expiré']);
        exit();
    }
    
    $creneau = $resultat->fetch_assoc();
    
    // Vérifier si déjà pointé
    $sql_check = "SELECT id FROM pointages 
                  WHERE id_creneau = {$creneau['id']}";
    $check = $conn->query($sql_check);
    
    if ($check->num_rows > 0) {
        http_response_code(400);
        echo json_encode(['erreur' => 'Pointage déjà effectué']);
        exit();
    }
    
    // Calculer le statut (retard si > 15 min)
    $heure_prevue = strtotime($creneau['heure_debut']);
    $heure_actuelle = time();
    $diff_minutes = ($heure_actuelle - $heure_prevue) / 60;
    
    $statut = 'valide';
    if ($diff_minutes > 15) $statut = 'retard';
    
    // Enregistrer le pointage
    $ip = $_SERVER['REMOTE_ADDR'];
    $sql_point = "INSERT INTO pointages 
                  (id_creneau, heure_pointage_reelle, ip_source, 
                   token_utilise, statut)
                  VALUES ({$creneau['id']}, NOW(), '$ip', '$token', '$statut')";
    
    if ($conn->query($sql_point)) {
        // Invalider le token QR après utilisation
        $conn->query("UPDATE creneaux SET qr_token = NULL, 
                      qr_expire = NULL WHERE id = {$creneau['id']}");
        
        echo json_encode([
            'message' => 'Pointage enregistré',
            'statut' => $statut,
            'creneau' => [
                'matiere' => $creneau['matiere'],
                'classe' => $creneau['classe'],
                'salle' => $creneau['salle'],
                'heure_debut' => $creneau['heure_debut'],
                'heure_fin' => $creneau['heure_fin']
            ]
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['erreur' => 'Erreur pointage']);
    }
    
    $conn->close();
}

// GET /api/pointages - Liste des pointages
elseif ($methode === 'GET') {
    verifierRole(['admin', 'surveillant']);
    $conn = getConnexion();
    
    $sql = "SELECT p.*, 
            cr.jour, cr.heure_debut, cr.heure_fin,
            m.libelle as matiere,
            e.nom as enseignant_nom,
            e.prenom as enseignant_prenom
            FROM pointages p
            JOIN creneaux cr ON p.id_creneau = cr.id
            JOIN matieres m ON cr.id_matiere = m.id
            JOIN enseignants e ON cr.id_enseignant = e.id
            ORDER BY p.heure_pointage_reelle DESC";
    
    $resultat = $conn->query($sql);
    $pointages = [];
    while ($ligne = $resultat->fetch_assoc()) {
        $pointages[] = $ligne;
    }
    
    echo json_encode($pointages);
    $conn->close();
}
?>