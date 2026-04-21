import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function GestionEnseignants() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [enseignants, setEnseignants] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    nom: '',
    prenom: '',
    email: '',
    specialite: '',
    statut: 'vacataire',
    taux_horaire: ''
  });

  useEffect(() => {
    fetchEnseignants();
  }, [token]);

  const fetchEnseignants = async () => {
    try {
      const response = await axios.get(
        'http://localhost/eduschedule-pro/backend/api/enseignants.php',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEnseignants(response.data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setChargement(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        'http://localhost/eduschedule-pro/backend/api/enseignants.php',
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage('✅ Enseignant créé avec succès !');
      setShowForm(false);
      setForm({
        nom: '', prenom: '', email: '',
        specialite: '', statut: 'vacataire', taux_horaire: ''
      });
      fetchEnseignants();
    } catch (error) {
      setMessage('❌ Erreur lors de la création');
    }
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
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="fw-bold mb-0">👨‍🏫 Gestion des Enseignants</h4>
          <button className="btn btn-primary"
            onClick={() => setShowForm(!showForm)}>
            {showForm ? '✕ Annuler' : '+ Nouvel enseignant'}
          </button>
        </div>

        {message && (
          <div className="alert alert-info">{message}</div>
        )}

        {showForm && (
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body">
              <h5 className="fw-bold mb-3">Ajouter un enseignant</h5>
              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-md-3">
                    <label className="form-label fw-semibold">Nom</label>
                    <input type="text" className="form-control"
                      placeholder="Nom de famille"
                      value={form.nom}
                      onChange={(e) => setForm({...form, nom: e.target.value})}
                      required />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label fw-semibold">Prénom</label>
                    <input type="text" className="form-control"
                      placeholder="Prénom"
                      value={form.prenom}
                      onChange={(e) => setForm({...form, prenom: e.target.value})}
                      required />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label fw-semibold">Email</label>
                    <input type="email" className="form-control"
                      placeholder="email@isge.bf"
                      value={form.email}
                      onChange={(e) => setForm({...form, email: e.target.value})}
                      required />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label fw-semibold">Spécialité</label>
                    <input type="text" className="form-control"
                      placeholder="ex: Développement Web"
                      value={form.specialite}
                      onChange={(e) => setForm({...form, specialite: e.target.value})} />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label fw-semibold">Statut</label>
                    <select className="form-select"
                      value={form.statut}
                      onChange={(e) => setForm({...form, statut: e.target.value})}>
                      <option value="vacataire">Vacataire</option>
                      <option value="permanent">Permanent</option>
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label fw-semibold">
                      Taux horaire (FCFA)
                    </label>
                    <input type="number" className="form-control"
                      placeholder="ex: 12000"
                      value={form.taux_horaire}
                      onChange={(e) => setForm({...form, taux_horaire: e.target.value})}
                      required />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary mt-3">
                  💾 Enregistrer
                </button>
              </form>
            </div>
          </div>
        )}

        {chargement ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" />
          </div>
        ) : (
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead className="table-light">
                    <tr>
                      <th>Matricule</th>
                      <th>Nom & Prénom</th>
                      <th>Email</th>
                      <th>Spécialité</th>
                      <th>Statut</th>
                      <th>Taux/h</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enseignants.map((e, i) => (
                      <tr key={i}>
                        <td><span className="badge bg-secondary">{e.matricule}</span></td>
                        <td><strong>{e.prenom} {e.nom}</strong></td>
                        <td>{e.email}</td>
                        <td>{e.specialite}</td>
                        <td>
                          <span className={`badge ${e.statut === 'permanent' ? 'bg-success' : 'bg-warning'}`}>
                            {e.statut}
                          </span>
                        </td>
                        <td>{parseInt(e.taux_horaire).toLocaleString()} FCFA</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default GestionEnseignants;