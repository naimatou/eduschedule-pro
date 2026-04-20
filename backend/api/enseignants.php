<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/auth.php';

$methode = $_SERVER['REQUEST_METHOD'];

// GET /api/enseignants - Liste tous les enseignants
if ($methode === 'GET') {
    verifierToken();
    $conn = getConnexion();
    
    $sql = "SELECT * FROM enseignants ORDER BY nom, prenom";
    $resultat = $conn->query($sql);
    
    $enseignants = [];
    while ($ligne = $resultat->fetch_assoc()) {
        $enseignants[] = $ligne;
    }
    
    echo json_encode($enseignants);
    $conn->close();
}

// POST /api/enseignants - Créer un enseignant (admin)
elseif ($methode === 'POST') {
    verifierRole(['admin']);
    $donnees = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($donnees['nom']) || !isset($donnees['prenom']) || 
        !isset($donnees['email']) || !isset($donnees['statut'])) {
        http_response_code(400);
        echo json_encode(['erreur' => 'Données manquantes']);
        exit();
    }
    
    $conn = getConnexion();
    $matricule = 'ENS' . date('Y') . rand(100, 999);
    $nom = $conn->real_escape_string($donnees['nom']);
    $prenom = $conn->real_escape_string($donnees['prenom']);
    $email = $conn->real_escape_string($donnees['email']);
    $specialite = $conn->real_escape_string($donnees['specialite'] ?? '');
    $statut = $conn->real_escape_string($donnees['statut']);
    $taux = floatval($donnees['taux_horaire'] ?? 0);
    
    $sql = "INSERT INTO enseignants 
            (matricule, nom, prenom, email, specialite, statut, taux_horaire) 
            VALUES ('$matricule','$nom','$prenom','$email',
                    '$specialite','$statut',$taux)";
    
    if ($conn->query($sql)) {
        http_response_code(201);
        echo json_encode([
            'message' => 'Enseignant créé avec succès',
            'id' => $conn->insert_id,
            'matricule' => $matricule
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['erreur' => 'Erreur lors de la création']);
    }
    
    $conn->close();
}

// PUT /api/enseignants - Modifier un enseignant
elseif ($methode === 'PUT') {
    verifierRole(['admin']);
    $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
    $donnees = json_decode(file_get_contents('php://input'), true);
    
    if ($id === 0) {
        http_response_code(400);
        echo json_encode(['erreur' => 'ID manquant']);
        exit();
    }
    
    $conn = getConnexion();
    $nom = $conn->real_escape_string($donnees['nom']);
    $prenom = $conn->real_escape_string($donnees['prenom']);
    $email = $conn->real_escape_string($donnees['email']);
    $taux = floatval($donnees['taux_horaire'] ?? 0);
    
    $sql = "UPDATE enseignants 
            SET nom='$nom', prenom='$prenom', 
                email='$email', taux_horaire=$taux 
            WHERE id=$id";
    
    if ($conn->query($sql)) {
        echo json_encode(['message' => 'Enseignant modifié']);
    } else {
        http_response_code(500);
        echo json_encode(['erreur' => 'Erreur modification']);
    }
    
    $conn->close();
}
?>