import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function VacationPage() {
  const { token, utilisateur } = useAuth();
  const navigate = useNavigate();
  const [vacations, setVacations] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [vacationSelectionnee, setVacationSelectionnee] = useState(null);

  useEffect(() => {
    fetchVacations();
  }, [token]);

  const fetchVacations = async () => {
    try {
      const response = await axios.get(
        'http://localhost/eduschedule-pro/backend/api/vacations.php',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setVacations(response.data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setChargement(false);
    }
  };

  const validerVacation = async (id) => {
    try {
      await axios.post(
        `http://localhost/eduschedule-pro/backend/api/vacations.php/valider?id=${id}`,
        { commentaire: 'Validé par le surveillant' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Fiche validée !');
      fetchVacations();
    } catch (error) {
      alert('Erreur lors de la validation');
    }
  };

  const approuverVacation = async (id) => {
    try {
      await axios.post(
        `http://localhost/eduschedule-pro/backend/api/vacations.php/approuver?id=${id}`,
        { commentaire: 'Approuvé par le comptable' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Fiche approuvée !');
      fetchVacations();
    } catch (error) {
      alert('Erreur lors de l\'approbation');
    }
  };

  const statutBadge = (statut) => {
    const couleurs = {
      generee: 'warning',
      signee: 'info',
      validee: 'primary',
      approuvee: 'success'
    };
    return couleurs[statut] || 'secondary';
  };

  const moisNoms = [
    '', 'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

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
        <h4 className="mb-4 fw-bold">💰 Fiches de Vacation</h4>

        {chargement ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" />
          </div>
        ) : vacations.length === 0 ? (
          <div className="alert alert-info">
            Aucune fiche de vacation disponible.
          </div>
        ) : (
          <div className="row g-3">
            {vacations.map((v, i) => (
              <div key={i} className="col-md-6">
                <div className="card border-0 shadow-sm">
                  <div className="card-header d-flex 
                                  justify-content-between 
                                  align-items-center">
                    <strong>
                      {v.enseignant_prenom} {v.enseignant_nom}
                    </strong>
                    <span className={`badge bg-${statutBadge(v.statut)}`}>
                      {v.statut}
                    </span>
                  </div>
                  <div className="card-body">
                    <p className="mb-1">
                      <strong>Période :</strong>{' '}
                      {moisNoms[v.mois]} {v.annee}
                    </p>
                    <p className="mb-1">
                      <strong>Matricule :</strong> {v.matricule}
                    </p>
                    <p className="mb-1">
                      <strong>Montant brut :</strong>{' '}
                      <span className="text-success fw-bold">
                        {parseFloat(v.montant_brut).toLocaleString()} FCFA
                      </span>
                    </p>
                    <p className="mb-2">
                      <strong>Montant net :</strong>{' '}
                      <span className="text-primary fw-bold">
                        {parseFloat(v.montant_net).toLocaleString()} FCFA
                      </span>
                    </p>

                    {/* Détail des séances */}
                    <button
                      className="btn btn-sm btn-outline-secondary mb-2"
                      onClick={() => setVacationSelectionnee(
                        vacationSelectionnee?.id === v.id ? null : v
                      )}
                    >
                      {vacationSelectionnee?.id === v.id
                        ? '▲ Masquer détails'
                        : '▼ Voir détails'}
                    </button>

                    {vacationSelectionnee?.id === v.id && (
                      <div className="table-responsive mt-2">
                        <table className="table table-sm table-bordered">
                          <thead className="table-light">
                            <tr>
                              <th>Matière</th>
                              <th>Jour</th>
                              <th>Durée</th>
                              <th>Taux</th>
                              <th>Montant</th>
                            </tr>
                          </thead>
                          <tbody>
                            {v.lignes?.map((l, j) => (
                              <tr key={j}>
                                <td>{l.matiere}</td>
                                <td>{l.jour}</td>
                                <td>{l.duree_heures}h</td>
                                <td>{l.taux} FCFA</td>
                                <td>{parseFloat(l.montant)
                                  .toLocaleString()} FCFA</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Boutons selon rôle */}
                    <div className="d-flex gap-2 mt-2">
                      {utilisateur?.role === 'surveillant' &&
                       v.statut === 'generee' && (
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => validerVacation(v.id)}
                        >
                          ✅ Valider
                        </button>
                      )}
                      {utilisateur?.role === 'comptable' &&
                       v.statut === 'validee' && (
                        <button
                          className="btn btn-sm btn-success"
                          onClick={() => approuverVacation(v.id)}
                        >
                          ✅ Approuver
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default VacationPage;