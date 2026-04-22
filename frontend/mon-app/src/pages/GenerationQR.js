import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function GenerationQR() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [emplois, setEmplois] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchEmplois();
  }, [token]);

  const fetchEmplois = async () => {
    try {
      const response = await axios.get(
        'http://localhost/eduschedule-pro/backend/api/emploi_temps.php',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEmplois(response.data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setChargement(false);
    }
  };

  const genererQR = async (id_creneau) => {
    try {
      const response = await axios.get(
        `http://localhost/eduschedule-pro/backend/api/creneaux.php?id=${id_creneau}&action=qr`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(`✅ QR Code généré pour le créneau ${id_creneau} !`);
      fetchEmplois();
    } catch (error) {
      setMessage('❌ Erreur lors de la génération du QR Code');
    }
  };

  const jours = {
    lundi: 'Lundi', mardi: 'Mardi',
    mercredi: 'Mercredi', jeudi: 'Jeudi',
    vendredi: 'Vendredi', samedi: 'Samedi'
  };

  return (
    <div>
      <nav className="navbar navbar-dark bg-primary px-4">
        <span className="navbar-brand fw-bold">📅 EduSchedule Pro</span>
        <button className="btn btn-outline-light btn-sm"
          onClick={() => navigate('/dashboard/admin')}>
          ← Retour
        </button>
      </nav>

      <div className="container-fluid p-4">
        <h4 className="fw-bold mb-4">🔲 Génération des QR Codes</h4>

        {message && (
          <div className="alert alert-info">{message}</div>
        )}

        {chargement ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" />
          </div>
        ) : emplois.length === 0 ? (
          <div className="alert alert-info">
            Aucun emploi du temps disponible.
          </div>
        ) : (
          emplois.map((emploi, i) => (
            <div key={i} className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-primary text-white">
                <strong>{emploi.classe_libelle}</strong> —
                Semaine du {new Date(emploi.semaine_debut)
                  .toLocaleDateString('fr-FR')}
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead className="table-light">
                      <tr>
                        <th>Jour</th>
                        <th>Horaire</th>
                        <th>Matière</th>
                        <th>Enseignant</th>
                        <th>Salle</th>
                        <th>QR Code</th>
                      </tr>
                    </thead>
                    <tbody>
                      {emploi.creneaux?.map((cr, j) => (
                        <tr key={j}>
                          <td>{jours[cr.jour]}</td>
                          <td>{cr.heure_debut} - {cr.heure_fin}</td>
                          <td>{cr.matiere}</td>
                          <td>{cr.enseignant_prenom} {cr.enseignant_nom}</td>
                          <td>{cr.salle}</td>
                          <td>
                            {cr.qr_token ? (
                              <span className="badge bg-success">
                                ✅ Généré
                              </span>
                            ) : (
                              <button
                                className="btn btn-sm btn-primary"
                                onClick={() => genererQR(cr.id)}
                              >
                                🔲 Générer QR
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default GenerationQR;