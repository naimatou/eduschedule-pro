import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function DashboardEnseignant() {
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

  const jours = {
    lundi: 'Lundi', mardi: 'Mardi',
    mercredi: 'Mercredi', jeudi: 'Jeudi',
    vendredi: 'Vendredi', samedi: 'Samedi'
  };

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
        <h4 className="mb-4 fw-bold">Tableau de bord — Enseignant</h4>
        {chargement ? (
          <div className="text-center py-5">
            <div className="spinner-border text-success" />
          </div>
        ) : (
          <div className="row g-3">
            <div className="col-md-7">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <h6 className="fw-bold mb-3">📅 Mes séances de la semaine</h6>
                  {stats.mes_seances?.length > 0 ? (
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead className="table-light">
                          <tr>
                            <th>Jour</th>
                            <th>Matière</th>
                            <th>Classe</th>
                            <th>Horaire</th>
                            <th>Salle</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stats.mes_seances.map((s, i) => (
                            <tr key={i}>
                              <td>{jours[s.jour]}</td>
                              <td>{s.matiere}</td>
                              <td>{s.classe}</td>
                              <td>{s.heure_debut} - {s.heure_fin}</td>
                              <td>{s.salle}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-muted text-center py-3">
                      Aucune séance cette semaine
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="col-md-5">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <h6 className="fw-bold mb-3">💰 Mes fiches de vacation</h6>
                  {stats.mes_vacations?.length > 0 ? (
                    stats.mes_vacations.map((v, i) => (
                      <div key={i} className="d-flex justify-content-between align-items-center border-bottom py-2">
                        <span>{v.mois}/{v.annee}</span>
                        <span className="fw-bold text-success">{v.montant_net} FCFA</span>
                        <span className={`badge ${v.statut === 'approuvee' ? 'bg-success' : v.statut === 'validee' ? 'bg-info' : 'bg-warning'}`}>
                          {v.statut}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted text-center py-3">Aucune fiche</p>
                  )}
                </div>
              </div>
              <div className="card border-0 shadow-sm mt-3">
                <div className="card-body">
                  <h6 className="fw-bold mb-3">⚡ Accès rapides</h6>
                  <div className="d-grid gap-2">
                    <button className="btn btn-success"
                      style={{ textTransform: 'none' }}
                      onClick={() => navigate('/pointage-qr')}>
                      📱 Pointer ma présence (QR)
                    </button>
                    <button className="btn btn-outline-success"
                      onClick={() => navigate('/cahier-texte')}>
                      📖 Mes cahiers de texte
                    </button>
                    <button className="btn btn-outline-primary"
                      onClick={() => navigate('/emploi-temps')}>
                      📅 Mon emploi du temps
                    </button>
                    <button className="btn btn-outline-warning"
                      onClick={() => navigate('/vacations')}>
                      💰 Mes fiches de vacation
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

export default DashboardEnseignant;