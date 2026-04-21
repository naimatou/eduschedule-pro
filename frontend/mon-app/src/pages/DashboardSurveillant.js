import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function DashboardSurveillant() {
  const { utilisateur, deconnexion } = useAuth();
  const navigate = useNavigate();

  return (
    <div>
      <nav className="navbar navbar-dark bg-dark px-4">
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
        <h4 className="mb-4 fw-bold">Tableau de bord — Surveillant</h4>
        <div className="row g-3">
          <div className="col-md-6">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h6 className="fw-bold mb-3">⚡ Accès rapides</h6>
                <div className="d-grid gap-2">
                  <button className="btn btn-outline-dark"
                    onClick={() => navigate('/cahier-texte')}>
                    📖 Contrôler les cahiers de texte
                  </button>
                  <button className="btn btn-outline-warning"
                    onClick={() => navigate('/vacations')}>
                    💰 Valider les fiches de vacation
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardSurveillant;