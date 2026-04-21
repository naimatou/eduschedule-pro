import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function DashboardAdmin() {
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
        console.error('Erreur chargement stats:', error);
      } finally {
        setChargement(false);
      }
    };
    fetchStats();
  }, [token]);

  return (
    <div>
      <nav className="navbar navbar-dark bg-primary px-4">
        <span className="navbar-brand fw-bold">📅 EduSchedule Pro</span>
        <div className="d-flex align-items-center gap-3">
          <span className="text-white">👤 {utilisateur?.email}</span>
          <button className="btn btn-outline-light btn-sm"
            onClick={() => { deconnexion(); navigate('/login'); }}>
            Déconnexion
          </button>
        </div>
      </nav>
      <div className="container-fluid p-4">
        <h4 className="mb-4 fw-bold">Tableau de bord — Administrateur</h4>
        {chargement ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" />
          </div>
        ) : (
          <>
            <div className="row g-3 mb-4">
              <div className="col-md-3">
                <div className="card border-0 shadow-sm bg-primary text-white">
                  <div className="card-body text-center">
                    <h2 className="fw-bold">{stats.total_classes || 0}</h2>
                    <p className="mb-0">Classes</p>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card border-0 shadow-sm bg-success text-white">
                  <div className="card-body text-center">
                    <h2 className="fw-bold">{stats.total_enseignants || 0}</h2>
                    <p className="mb-0">Enseignants</p>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card border-0 shadow-sm bg-info text-white">
                  <div className="card-body text-center">
                    <h2 className="fw-bold">{stats.seances_aujourd_hui || 0}</h2>
                    <p className="mb-0">Séances aujourd'hui</p>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card border-0 shadow-sm bg-warning text-white">
                  <div className="card-body text-center">
                    <h2 className="fw-bold">{stats.retards_aujourd_hui || 0}</h2>
                    <p className="mb-0">Retards</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="row g-3">
              <div className="col-md-6">
                <div className="card border-0 shadow-sm">
                  <div className="card-body">
                    <h6 className="fw-bold mb-3">🔔 Alertes</h6>
                    <ul className="list-group list-group-flush">
                      <li className="list-group-item d-flex justify-content-between">
                        <span>Cahiers en attente</span>
                        <span className="badge bg-warning">{stats.cahiers_en_attente || 0}</span>
                      </li>
                      <li className="list-group-item d-flex justify-content-between">
                        <span>Pointages aujourd'hui</span>
                        <span className="badge bg-success">{stats.pointages_aujourd_hui || 0}</span>
                      </li>
                      <li className="list-group-item d-flex justify-content-between">
                        <span>Vacations en attente</span>
                        <span className="badge bg-danger">{stats.vacations_en_attente || 0}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="card border-0 shadow-sm">
                  <div className="card-body">
                    <h6 className="fw-bold mb-3">⚡ Accès rapides</h6>
                    <div className="d-grid gap-2">
                      <button className="btn btn-outline-primary"
                        onClick={() => navigate('/emploi-temps')}>
                        📅 Gérer les emplois du temps
                      </button>
                      <button className="btn btn-outline-success"
                        onClick={() => navigate('/cahier-texte')}>
                        📖 Cahiers de texte
                      </button>
                      <button className="btn btn-outline-warning"
                        onClick={() => navigate('/vacations')}>
                        💰 Fiches de vacation
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default DashboardAdmin;