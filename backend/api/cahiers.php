<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/auth.php';

$methode = $_SERVER['REQUEST_METHOD'];
$url = $_SERVER['REQUEST_URI'];

// GET /api/cahiers - Liste des cahiers
if ($methode === 'GET' && !strpos($url, '/signer') 
    && !strpos($url, '/cloture')) {
    verifierToken();
    $conn = getConnexion();
    
    $id_creneau = isset($_GET['id_creneau']) ? intval($_GET['id_creneau']) : 0;
    
    $where = "WHERE 1=1";
    if ($id_creneau > 0) $where .= " AND ct.id_creneau = $id_creneau";
    
    $sql = "SELECT ct.*, 
            m.libelle as matiere,
            e.nom as enseignant_nom,
            e.prenom as enseignant_prenom,
            c.libelle as classe
            FROM cahiers_texte ct
            JOIN creneaux cr ON ct.id_creneau = cr.id
            JOIN matieres m ON cr.id_matiere = m.id
            JOIN enseignants e ON cr.id_enseignant = e.id
            JOIN emploi_temps et ON cr.id_emploi_temps = et.id
            JOIN classes c ON et.id_classe = c.id
            $where
            ORDER BY ct.date_creation DESC";
    
    $resultat = $conn->query($sql);
    $cahiers = [];
    while ($ligne = $resultat->fetch_assoc()) {
        $cahiers[] = $ligne;
    }
    
    echo json_encode($cahiers);
    $conn->close();
}

// POST /api/cahiers - Créer un cahier de texte
elseif ($methode === 'POST' && !strpos($url, '/signer') 
        && !strpos($url, '/cloture')) {
    verifierRole(['delegue']);
    $payload = verifierToken();
    $donnees = json_decode(file_get_contents('php://input'), true);
    
    $conn = getConnexion();
    $id_creneau = intval($donnees['id_creneau']);
    $id_delegue = $payload['id'];
    $titre = $conn->real_escape_string($donnees['titre'] ?? '');
    $contenu = $conn->real_escape_string(
        json_encode($donnees['contenu_json'] ?? [])
    );
    
    $sql = "INSERT INTO cahiers_texte 
            (id_creneau, id_delegue, titre_cours, contenu_json)
            VALUES ($id_creneau, $id_delegue, '$titre', '$contenu')";
    
    if ($conn->query($sql)) {
        $id_cahier = $conn->insert_id;
        
        // Ajouter les travaux demandés
        if (isset($donnees['travaux']) && is_array($donnees['travaux'])) {
            foreach ($donnees['travaux'] as $travail) {
                $desc = $conn->real_escape_string($travail['description']);
                $date = $conn->real_escape_string($travail['date_limite'] ?? '');
                $type = $conn->real_escape_string($travail['type']);
                
                $sql_tr = "INSERT INTO travaux_demandes 
                           (id_cahier, description, date_limite, type)
                           VALUES ($id_cahier, '$desc', '$date', '$type')";
                $conn->query($sql_tr);
            }
        }
        
        http_response_code(201);
        echo json_encode([
            'message' => 'Cahier créé',
            'id' => $id_cahier
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['erreur' => 'Erreur création cahier']);
    }
    
    $conn->close();
}

// POST /api/cahiers/signer - Signer un cahier
elseif ($methode === 'POST' && strpos($url, '/signer')) {
    verifierToken();
    $payload = verifierToken();
    $donnees = json_decode(file_get_contents('php://input'), true);
    $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
    
    $conn = getConnexion();
    $signature = $conn->real_escape_string($donnees['signature_base64']);
    $type = $conn->real_escape_string($donnees['type']);
    $id_user = $payload['id'];
    
    $sql = "INSERT INTO signatures 
            (id_cahier, type_signataire, id_utilisateur, signature_base64)
            VALUES ($id, '$type', $id_user, '$signature')";
    
    if ($conn->query($sql)) {
        // Mettre à jour le statut
        $statut = ($type === 'delegue') ? 'signe_delegue' : 'cloture';
        $conn->query("UPDATE cahiers_texte 
                      SET statut='$statut' WHERE id=$id");
        
        echo json_encode(['message' => 'Signature enregistrée']);
    } else {
        http_response_code(500);
        echo json_encode(['erreur' => 'Erreur signature']);
    }
    
    $conn->close();
}

// POST /api/cahiers/cloture - Clôturer une séance
elseif ($methode === 'POST' && strpos($url, '/cloture')) {
    verifierRole(['enseignant']);
    $donnees = json_decode(file_get_contents('php://input'), true);
    $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
    $payload = verifierToken();
    
    $conn = getConnexion();
    $heure_fin = $conn->real_escape_string($donnees['heure_fin']);
    $signature = $conn->real_escape_string($donnees['signature_base64']);
    $id_user = $payload['id'];
    
    // Mettre à jour l'heure de fin
    $conn->query("UPDATE cahiers_texte 
                  SET heure_fin_reelle='$heure_fin' WHERE id=$id");
    
    // Enregistrer la signature enseignant
    $sql = "INSERT INTO signatures 
            (id_cahier, type_signataire, id_utilisateur, signature_base64)
            VALUES ($id, 'enseignant', $id_user, '$signature')";
    
    if ($conn->query($sql)) {
        $conn->query("UPDATE cahiers_texte 
                      SET statut='cloture' WHERE id=$id");
        echo json_encode(['message' => 'Séance clôturée']);
    } else {
        http_response_code(500);
        echo json_encode(['erreur' => 'Erreur clôture']);
    }
    
    $conn->close();
}
?>