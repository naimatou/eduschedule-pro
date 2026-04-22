<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/auth.php';

$methode = $_SERVER['REQUEST_METHOD'];

// GET /api/creneaux?id=X&action=qr - Générer QR Code
if ($methode === 'GET') {
    verifierToken();
    $conn = getConnexion();
    
    $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
    $action = isset($_GET['action']) ? $_GET['action'] : '';
    
    if ($id > 0 && $action === 'qr') {
        // Générer un token unique pour le QR
        $token = bin2hex(random_bytes(16));
        $expire = date('Y-m-d H:i:s', strtotime('+2 hours'));
        
        $sql = "UPDATE creneaux 
                SET qr_token = '$token', 
                    qr_expire = '$expire' 
                WHERE id = $id";
        
        if ($conn->query($sql)) {
            echo json_encode([
                'message' => 'QR Code généré',
                'token' => $token,
                'expire' => $expire
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['erreur' => 'Erreur génération QR']);
        }
    } else {
        // Liste tous les créneaux
        $sql = "SELECT cr.*, 
                m.libelle as matiere,
                e.nom as enseignant_nom,
                e.prenom as enseignant_prenom,
                s.code as salle
                FROM creneaux cr
                JOIN matieres m ON cr.id_matiere = m.id
                JOIN enseignants e ON cr.id_enseignant = e.id
                JOIN salles s ON cr.id_salle = s.id
                ORDER BY cr.jour, cr.heure_debut";
        
        $resultat = $conn->query($sql);
        $creneaux = [];
        while ($ligne = $resultat->fetch_assoc()) {
            $creneaux[] = $ligne;
        }
        echo json_encode($creneaux);
    }
    
    $conn->close();
}
?>