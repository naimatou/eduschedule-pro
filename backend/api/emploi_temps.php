<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/auth.php';

$methode = $_SERVER['REQUEST_METHOD'];

// GET /api/emploi-temps - Liste les emplois du temps
if ($methode === 'GET') {
    verifierToken();
    $conn = getConnexion();
    
    $id_classe = isset($_GET['id_classe']) ? intval($_GET['id_classe']) : 0;
    $semaine = isset($_GET['semaine']) ? $conn->real_escape_string($_GET['semaine']) : '';
    
    $where = "WHERE 1=1";
    if ($id_classe > 0) $where .= " AND et.id_classe = $id_classe";
    if ($semaine) $where .= " AND et.semaine_debut = '$semaine'";
    
    $sql = "SELECT et.*, c.libelle as classe_libelle 
            FROM emploi_temps et
            JOIN classes c ON et.id_classe = c.id
            $where
            ORDER BY et.semaine_debut DESC";
    
    $resultat = $conn->query($sql);
    $emplois = [];
    while ($ligne = $resultat->fetch_assoc()) {
        // Récupérer les créneaux de cet emploi du temps
        $id_et = $ligne['id'];
        $sql_creneaux = "SELECT cr.*, 
                         m.libelle as matiere, 
                         e.nom as enseignant_nom,
                         e.prenom as enseignant_prenom,
                         s.code as salle
                         FROM creneaux cr
                         JOIN matieres m ON cr.id_matiere = m.id
                         JOIN enseignants e ON cr.id_enseignant = e.id
                         JOIN salles s ON cr.id_salle = s.id
                         WHERE cr.id_emploi_temps = $id_et
                         ORDER BY cr.jour, cr.heure_debut";
        
        $res_cr = $conn->query($sql_creneaux);
        $creneaux = [];
        while ($cr = $res_cr->fetch_assoc()) {
            $creneaux[] = $cr;
        }
        $ligne['creneaux'] = $creneaux;
        $emplois[] = $ligne;
    }
    
    echo json_encode($emplois);
    $conn->close();
}

// POST /api/emploi-temps - Créer un emploi du temps
elseif ($methode === 'POST') {
    verifierRole(['admin']);
    $donnees = json_decode(file_get_contents('php://input'), true);
    $payload = verifierToken();
    
    $conn = getConnexion();
    $id_classe = intval($donnees['id_classe']);
    $semaine = $conn->real_escape_string($donnees['semaine_debut']);
    $cree_par = $payload['id'];
    
    $sql = "INSERT INTO emploi_temps (id_classe, semaine_debut, cree_par) 
            VALUES ($id_classe, '$semaine', $cree_par)";
    
    if ($conn->query($sql)) {
        $id_et = $conn->insert_id;
        
        // Ajouter les créneaux
        if (isset($donnees['creneaux']) && is_array($donnees['creneaux'])) {
            foreach ($donnees['creneaux'] as $cr) {
                $id_mat = intval($cr['id_matiere']);
                $id_ens = intval($cr['id_enseignant']);
                $id_salle = intval($cr['id_salle']);
                $jour = $conn->real_escape_string($cr['jour']);
                $hdebut = $conn->real_escape_string($cr['heure_debut']);
                $hfin = $conn->real_escape_string($cr['heure_fin']);
                
                $sql_cr = "INSERT INTO creneaux 
                           (id_emploi_temps, id_matiere, id_enseignant, 
                            id_salle, jour, heure_debut, heure_fin)
                           VALUES ($id_et,$id_mat,$id_ens,
                                   $id_salle,'$jour','$hdebut','$hfin')";
                $conn->query($sql_cr);
            }
        }
        
        http_response_code(201);
        echo json_encode([
            'message' => 'Emploi du temps créé',
            'id' => $id_et
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['erreur' => 'Erreur création']);
    }
    
    $conn->close();
}

// PUT /api/emploi-temps/publier - Publier un emploi du temps
elseif ($methode === 'PUT') {
    verifierRole(['admin']);
    $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
    
    $conn = getConnexion();
    $sql = "UPDATE emploi_temps SET statut_publication='publie' WHERE id=$id";
    
    if ($conn->query($sql)) {
        echo json_encode(['message' => 'Emploi du temps publié']);
    } else {
        http_response_code(500);
        echo json_encode(['erreur' => 'Erreur publication']);
    }
    
    $conn->close();
}
?>