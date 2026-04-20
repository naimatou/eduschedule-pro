<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';

// Clé secrète pour JWT
define('JWT_SECRET', 'eduschedule_secret_key_2026');

// Créer un token JWT
function creerToken($utilisateur) {
    $header = base64_encode(json_encode([
        'alg' => 'HS256',
        'typ' => 'JWT'
    ]));
    
    $payload = base64_encode(json_encode([
        'id'    => $utilisateur['id'],
        'email' => $utilisateur['email'],
        'role'  => $utilisateur['role'],
        'exp'   => time() + (24 * 60 * 60) // expire dans 24h
    ]));
    
    $signature = base64_encode(hash_hmac(
        'sha256',
        "$header.$payload",
        JWT_SECRET,
        true
    ));
    
    return "$header.$payload.$signature";
}

// Vérifier un token JWT
function verifierToken() {
    $headers = getallheaders();
    
    if (!isset($headers['Authorization'])) {
        http_response_code(401);
        die(json_encode(['erreur' => 'Token manquant']));
    }
    
    $token = str_replace('Bearer ', '', $headers['Authorization']);
    $parties = explode('.', $token);
    
    if (count($parties) !== 3) {
        http_response_code(401);
        die(json_encode(['erreur' => 'Token invalide']));
    }
    
    $payload = json_decode(base64_decode($parties[1]), true);
    
    // Vérifier expiration
    if ($payload['exp'] < time()) {
        http_response_code(401);
        die(json_encode(['erreur' => 'Token expiré']));
    }
    
    return $payload;
}

// Vérifier le rôle de l'utilisateur
function verifierRole($rolesAutorises) {
    $payload = verifierToken();
    
    if (!in_array($payload['role'], $rolesAutorises)) {
        http_response_code(403);
        die(json_encode(['erreur' => 'Accès refusé']));
    }
    
    return $payload;
}
?>