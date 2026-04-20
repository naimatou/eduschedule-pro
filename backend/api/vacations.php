<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/auth.php';

$methode = $_SERVER['REQUEST_METHOD'];
$url = $_SERVER['REQUEST_URI'];

// GET /api/vacations - Liste des fiches de vacation
if ($methode === 'GET' && !strpos($url, '/pdf')) {
    verifierToken();
    $conn = getConnexion();
    
    $id_enseignant = isset($_GET['id_enseignant']) ? 
                     intval($_GET['id_enseignant']) : 0;
    $mois = isset($_GET['mois']) ? intval($_GET['mois']) : 0;
    $annee = isset($_GET['annee']) ? intval($_GET['annee']) : 0;
    
    $where = "WHERE 1=1";
    if ($id_enseignant > 0) $where .= " AND v.id_enseignant = $id_enseignant";
    if ($mois > 0) $where .= " AND v.mois = $mois";
    if ($annee > 0) $where .= " AND v.annee = $annee";
    
    $sql = "SELECT v.*, 
            e.nom as enseignant_nom,
            e.prenom as enseignant_prenom,
            e.matricule
            FROM vacations v
            JOIN enseignants e ON v.id_enseignant = e.id
            $where
            ORDER BY v.annee DESC, v.mois DESC";
    
    $resultat = $conn->query($sql);
    $vacations = [];
    while ($ligne = $resultat->fetch_assoc()) {
        // Récupérer les lignes de détail
        $sql_lignes = "SELECT vl.*, 
                       m.libelle as matiere,
                       cr.jour, cr.heure_debut, cr.heure_fin
                       FROM vacation_lignes vl
                       JOIN creneaux cr ON vl.id_creneau = cr.id
                       JOIN matieres m ON cr.id_matiere = m.id
                       WHERE vl.id_vacation = {$ligne['id']}";
        
        $res_l = $conn->query($sql_lignes);
        $lignes = [];
        while ($l = $res_l->fetch_assoc()) {
            $lignes[] = $l;
        }
        $ligne['lignes'] = $lignes;
        $vacations[] = $ligne;
    }
    
    echo json_encode($vacations);
    $conn->close();
}

// POST /api/vacations/generer - Générer une fiche
elseif ($methode === 'POST' && strpos($url, '/generer')) {
    verifierRole(['admin', 'surveillant']);
    $donnees = json_decode(file_get_contents('php://input'), true);
    
    $conn = getConnexion();
    $id_enseignant = intval($donnees['id_enseignant']);
    $mois = intval($donnees['mois']);
    $annee = intval($donnees['annee']);
    
    // Récupérer toutes les séances clôturées du mois
    $sql = "SELECT ct.*, cr.heure_debut, cr.heure_fin,
            cr.id as id_creneau, e.taux_horaire
            FROM cahiers_texte ct
            JOIN creneaux cr ON ct.id_creneau = cr.id
            JOIN enseignants e ON cr.id_enseignant = e.id
            JOIN emploi_temps et ON cr.id_emploi_temps = et.id
            WHERE cr.id_enseignant = $id_enseignant
            AND ct.statut = 'cloture'
            AND MONTH(ct.date_creation) = $mois
            AND YEAR(ct.date_creation) = $annee";
    
    $resultat = $conn->query($sql);
    
    $montant_total = 0;
    $lignes = [];
    
    while ($seance = $resultat->fetch_assoc()) {
        $debut = strtotime($seance['heure_debut']);
        $fin = strtotime($seance['heure_fin']);
        $duree = ($fin - $debut) / 3600; // en heures
        $montant = $duree * $seance['taux_horaire'];
        $montant_total += $montant;
        
        $lignes[] = [
            'id_creneau' => $seance['id_creneau'],
            'duree' => $duree,
            'taux' => $seance['taux_horaire'],
            'montant' => $montant
        ];
    }
    
    // Créer la fiche de vacation
    $sql_vac = "INSERT INTO vacations 
                (id_enseignant, mois, annee, montant_brut, montant_net)
                VALUES ($id_enseignant, $mois, $annee, 
                        $montant_total, $montant_total)";
    
    if ($conn->query($sql_vac)) {
        $id_vacation = $conn->insert_id;
        
        // Insérer les lignes de détail
        foreach ($lignes as $ligne) {
            $sql_l = "INSERT INTO vacation_lignes 
                      (id_vacation, id_creneau, duree_heures, taux, montant)
                      VALUES ($id_vacation, {$ligne['id_creneau']},
                              {$ligne['duree']}, {$ligne['taux']},
                              {$ligne['montant']})";
            $conn->query($sql_l);
        }
        
        http_response_code(201);
        echo json_encode([
            'message' => 'Fiche générée',
            'id' => $id_vacation,
            'montant_total' => $montant_total
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['erreur' => 'Erreur génération']);
    }
    
    $conn->close();
}

// POST /api/vacations/valider - Valider une fiche
elseif ($methode === 'POST' && strpos($url, '/valider')) {
    verifierRole(['surveillant']);
    $payload = verifierToken();
    $donnees = json_decode(file_get_contents('php://input'), true);
    $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
    
    $conn = getConnexion();
    $visa = $conn->real_escape_string($donnees['visa_base64'] ?? '');
    $commentaire = $conn->real_escape_string($donnees['commentaire'] ?? '');
    $id_validateur = $payload['id'];
    
    $sql = "INSERT INTO validations 
            (id_vacation, id_validateur, role_validateur, 
             visa_base64, commentaire)
            VALUES ($id, $id_validateur, 'surveillant', 
                    '$visa', '$commentaire')";
    
    if ($conn->query($sql)) {
        $conn->query("UPDATE vacations SET statut='validee' WHERE id=$id");
        echo json_encode(['message' => 'Fiche validée par le surveillant']);
    } else {
        http_response_code(500);
        echo json_encode(['erreur' => 'Erreur validation']);
    }
    
    $conn->close();
}

// POST /api/vacations/approuver - Approbation comptable
elseif ($methode === 'POST' && strpos($url, '/approuver')) {
    verifierRole(['comptable']);
    $payload = verifierToken();
    $donnees = json_decode(file_get_contents('php://input'), true);
    $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
    
    $conn = getConnexion();
    $commentaire = $conn->real_escape_string($donnees['commentaire'] ?? '');
    $id_validateur = $payload['id'];
    
    $sql = "INSERT INTO validations 
            (id_vacation, id_validateur, role_validateur, commentaire)
            VALUES ($id, $id_validateur, 'comptable', '$commentaire')";
    
    if ($conn->query($sql)) {
        $conn->query("UPDATE vacations SET statut='approuvee' WHERE id=$id");
        echo json_encode(['message' => 'Fiche approuvée par le comptable']);
    } else {
        http_response_code(500);
        echo json_encode(['erreur' => 'Erreur approbation']);
    }
    
    $conn->close();
}
?>