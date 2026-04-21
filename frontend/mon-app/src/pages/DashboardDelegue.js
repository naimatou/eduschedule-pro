import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function DashboardDelegue() {
  const { utilisateur, token, deconnexion } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({});
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(
          'http://localhost/eduschedule-pro/backend/api/dashboard.php',
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setStats(response.data);
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setChargement(false);
      }
    };
    fetchStats();
  }, [token]);

  return (
    <div>
      <nav className="navbar navbar-dark bg-warning px-4">
        <span className="navbar-brand fw-bold text-dark">
          📅 EduSchedule Pro
        </span>
        <div className="d-flex align-items-center gap-3">
          <span className="text-dark">👤 {utilisateur?.email}</span>
          <button className="btn btn-outline-dark btn-sm"
            onClick={() => { deconnexion(); navigate('/login'); }}>
            Déconnexion
          </button>
        </div>
      </nav>
      <div className="container-fluid p-4">
        <h4 className="mb-4 fw-bold">Tableau de bord — Délégué</h4>
        {chargement ? (
          <div className="text-center py-5">
            <div className="spinner-border text-warning" />
          </div>
        ) : (
          <div className="row g-3">
            <div className="col-md-8">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <h6 className="fw-bold mb-3">
                    📖 Cahiers de texte à remplir
                  </h6>
                  {stats.cahiers_a_remplir?.length > 0 ? (
                    <div className="list-group">
                      {stats.cahiers_a_remplir.map((c, i) => (
                        <div key={i}
                          className="list-group-item d-flex 
                                     justify-content-between 
                                     align-items-center">
                          <div>
                            <strong>{c.matiere}</strong>
                            <br />
                            <small className="text-muted">
                              {c.titre_cours || 'Sans titre'} —{' '}
                              {new Date(c.date_creation)
                                .toLocaleDateString('fr-FR')}
                            </small>
                          </div>
                          <div className="d-flex gap-2">
                            <span className="badge bg-warning">
                              {c.statut}
                            </span>
                            <button
                              className="btn btn-sm btn-primary"
                              onClick={() => navigate('/cahier-texte')}>
                              Remplir
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted text-center py-3">
                      ✅ Tous les cahiers sont à jour !
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <h6 className="fw-bold mb-3">⚡ Accès rapides</h6>
                  <div className="d-grid gap-2">
                    <button className="btn btn-outline-warning"
                      onClick={() => navigate('/emploi-temps')}>
                      📅 Emploi du temps
                    </button>
                    <button className="btn btn-outline-primary"
                      onClick={() => navigate('/cahier-texte')}>
                      📖 Cahiers de texte
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardDelegue;