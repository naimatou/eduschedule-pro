<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/auth.php';

$methode = $_SERVER['REQUEST_METHOD'];

if ($methode === 'GET') {
    verifierToken();
    $conn = getConnexion();
    
    $sql = "SELECT * FROM matieres ORDER BY libelle";
    $resultat = $conn->query($sql);
    
    $matieres = [];
    while ($ligne = $resultat->fetch_assoc()) {
        $matieres[] = $ligne;
    }
    
    echo json_encode($matieres);
    $conn->close();
}

elseif ($methode === 'POST') {
    verifierRole(['admin']);
    $donnees = json_decode(file_get_contents('php://input'), true);
    
    $conn = getConnexion();
    $code = $conn->real_escape_string($donnees['code']);
    $libelle = $conn->real_escape_string($donnees['libelle']);
    $volume = intval($donnees['volume_horaire_total']);
    $coeff = intval($donnees['coefficient'] ?? 1);
    
    $sql = "INSERT INTO matieres (code, libelle, volume_horaire_total, coefficient)
            VALUES ('$code', '$libelle', $volume, $coeff)";
    
    if ($conn->query($sql)) {
        http_response_code(201);
        echo json_encode([
            'message' => 'Matière créée',
            'id' => $conn->insert_id
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['erreur' => 'Erreur création']);
    }
    
    $conn->close();
}
?>