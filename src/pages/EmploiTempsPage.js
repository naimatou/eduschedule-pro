import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function EmploiTempsPage() {
  const { token, utilisateur } = useAuth();
  const navigate = useNavigate();
  const [emplois, setEmplois] = useState([]);
  const [chargement, setChargement] = useState(true);

  const jours = ['lundi','mardi','mercredi','jeudi','vendredi','samedi'];

  useEffect(() => {
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
    fetchEmplois();
  }, [token]);

  return (
    <div>
      <nav className="navbar navbar-dark bg-primary px-4">
        <span className="navbar-brand fw-bold">
          📅 EduSchedule Pro
        </span>
        <button
          className="btn btn-outline-light btn-sm"
          onClick={() => navigate(-1)}
        >
          ← Retour
        </button>
      </nav>

      <div className="container-fluid p-4">
        <h4 className="mb-4 fw-bold">📅 Emploi du Temps</h4>

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
                <span className={`badge ms-2 ${
                  emploi.statut_publication === 'publie'
                    ? 'bg-success' : 'bg-warning'
                }`}>
                  {emploi.statut_publication}
                </span>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-bordered text-center">
                    <thead className="table-light">
                      <tr>
                        {jours.map(j => (
                          <th key={j}>
                            {j.charAt(0).toUpperCase() + j.slice(1)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        {jours.map(jour => (
                          <td key={jour} className="p-1">
                            {emploi.creneaux
                              ?.filter(c => c.jour === jour)
                              .map((c, idx) => (
                                <div key={idx}
                                  className="bg-primary text-white 
                                             rounded p-1 mb-1 small">
                                  <strong>{c.matiere}</strong>
                                  <br />
                                  {c.heure_debut} - {c.heure_fin}
                                  <br />
                                  <small>
                                    {c.enseignant_prenom} {c.enseignant_nom}
                                  </small>
                                  <br />
                                  <small>Salle: {c.salle}</small>
                                </div>
                              ))}
                          </td>
                        ))}
                      </tr>
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

export default EmploiTempsPage;