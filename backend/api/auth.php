<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/auth.php';

$methode = $_SERVER['REQUEST_METHOD'];

// POST /api/auth/login
if ($methode === 'POST') {
    $donnees = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($donnees['email']) || !isset($donnees['password'])) {
        http_response_code(400);
        echo json_encode(['erreur' => 'Email et mot de passe requis']);
        exit();
    }
    
    $conn = getConnexion();
    $email = $conn->real_escape_string($donnees['email']);
    
    $sql = "SELECT * FROM utilisateurs WHERE email = '$email' AND actif = 1";
    $resultat = $conn->query($sql);
    
    if ($resultat->num_rows === 0) {
        http_response_code(401);
        echo json_encode(['erreur' => 'Email ou mot de passe incorrect']);
        exit();
    }
    
    $utilisateur = $resultat->fetch_assoc();
    
    if (!password_verify($donnees['password'], $utilisateur['mot_de_passe_hash'])) {
        http_response_code(401);
        echo json_encode(['erreur' => 'Email ou mot de passe incorrect']);
        exit();
    }
    
    $token = creerToken($utilisateur);
    
    echo json_encode([
        'token' => $token,
        'utilisateur' => [
            'id'    => $utilisateur['id'],
            'email' => $utilisateur['email'],
            'role'  => $utilisateur['role']
        ]
    ]);
    
    $conn->close();
}
?>