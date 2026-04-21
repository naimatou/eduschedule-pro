<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/auth.php';

$methode = $_SERVER['REQUEST_METHOD'];

if ($methode === 'GET') {
    verifierToken();
    $conn = getConnexion();
    
    $sql = "SELECT * FROM salles ORDER BY code";
    $resultat = $conn->query($sql);
    
    $salles = [];
    while ($ligne = $resultat->fetch_assoc()) {
        $salles[] = $ligne;
    }
    
    echo json_encode($salles);
    $conn->close();
}

elseif ($methode === 'POST') {
    verifierRole(['admin']);
    $donnees = json_decode(file_get_contents('php://input'), true);
    
    $conn = getConnexion();
    $code = $conn->real_escape_string($donnees['code']);
    $capacite = intval($donnees['capacite']);
    $equipements = $conn->real_escape_string($donnees['equipements'] ?? '');
    $batiment = $conn->real_escape_string($donnees['batiment'] ?? '');
    
    $sql = "INSERT INTO salles (code, capacite, equipements, batiment)
            VALUES ('$code', $capacite, '$equipements', '$batiment')";
    
    if ($conn->query($sql)) {
        http_response_code(201);
        echo json_encode([
            'message' => 'Salle créée',
            'id' => $conn->insert_id
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['erreur' => 'Erreur création']);
    }
    
    $conn->close();
}
?>