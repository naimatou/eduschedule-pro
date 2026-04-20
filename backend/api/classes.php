<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/auth.php';

$methode = $_SERVER['REQUEST_METHOD'];

// GET /api/classes - Liste toutes les classes
if ($methode === 'GET') {
    verifierToken();
    $conn = getConnexion();
    
    $sql = "SELECT * FROM classes ORDER BY niveau, libelle";
    $resultat = $conn->query($sql);
    
    $classes = [];
    while ($ligne = $resultat->fetch_assoc()) {
        $classes[] = $ligne;
    }
    
    echo json_encode($classes);
    $conn->close();
}

// POST /api/classes - Créer une classe (admin seulement)
elseif ($methode === 'POST') {
    verifierRole(['admin']);
    $donnees = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($donnees['code']) || !isset($donnees['libelle']) || 
        !isset($donnees['niveau']) || !isset($donnees['annee_academique'])) {
        http_response_code(400);
        echo json_encode(['erreur' => 'Données manquantes']);
        exit();
    }
    
    $conn = getConnexion();
    $code = $conn->real_escape_string($donnees['code']);
    $libelle = $conn->real_escape_string($donnees['libelle']);
    $niveau = $conn->real_escape_string($donnees['niveau']);
    $annee = $conn->real_escape_string($donnees['annee_academique']);
    
    $sql = "INSERT INTO classes (code, libelle, niveau, annee_academique) 
            VALUES ('$code', '$libelle', '$niveau', '$annee')";
    
    if ($conn->query($sql)) {
        http_response_code(201);
        echo json_encode([
            'message' => 'Classe créée avec succès',
            'id' => $conn->insert_id
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['erreur' => 'Erreur lors de la création']);
    }
    
    $conn->close();
}

// DELETE /api/classes - Supprimer une classe
elseif ($methode === 'DELETE') {
    verifierRole(['admin']);
    $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
    
    if ($id === 0) {
        http_response_code(400);
        echo json_encode(['erreur' => 'ID manquant']);
        exit();
    }
    
    $conn = getConnexion();
    $sql = "DELETE FROM classes WHERE id = $id";
    
    if ($conn->query($sql)) {
        echo json_encode(['message' => 'Classe supprimée']);
    } else {
        http_response_code(500);
        echo json_encode(['erreur' => 'Erreur suppression']);
    }
    
    $conn->close();
}
?>