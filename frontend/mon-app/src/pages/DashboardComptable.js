import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function DashboardComptable() {
  const { utilisateur, deconnexion } = useAuth();
  const navigate = useNavigate();

  return (
    <div>
      <nav className="navbar navbar-dark bg-success px-4">
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
        <h4 className="mb-4 fw-bold">Tableau de bord — Comptable</h4>
        <div className="row g-3">
          <div className="col-md-6">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h6 className="fw-bold mb-3">⚡ Accès rapides</h6>
                <div className="d-grid gap-2">
                  <button className="btn btn-outline-success"
                    onClick={() => navigate('/vacations')}>
                    💰 Approuver les fiches de vacation
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

export default DashboardComptable;