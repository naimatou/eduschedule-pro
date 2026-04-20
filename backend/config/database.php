<?php
// Configuration de la base de données
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'eduschedule_pro');

// Connexion à la base de données
function getConnexion() {
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    
    // Vérifier la connexion
    if ($conn->connect_error) {
        http_response_code(500);
        die(json_encode([
            'erreur' => 'Connexion échouée : ' . $conn->connect_error
        ]));
    }
    
    // Définir l'encodage UTF-8
    $conn->set_charset('utf8mb4');
    
    return $conn;
}
?>