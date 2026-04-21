import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function GestionClasses() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    code: '',
    libelle: '',
    niveau: '',
    annee_academique: '2025-2026'
  });

  useEffect(() => {
    fetchClasses();
  }, [token]);

  const fetchClasses = async () => {
    try {
      const response = await axios.get(
        'http://localhost/eduschedule-pro/backend/api/classes.php',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setClasses(response.data);
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
        'http://localhost/eduschedule-pro/backend/api/classes.php',
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage('✅ Classe créée avec succès !');
      setShowForm(false);
      setForm({ code: '', libelle: '', niveau: '', annee_academique: '2025-2026' });
      fetchClasses();
    } catch (error) {
      setMessage('❌ Erreur lors de la création');
    }
  };

  const supprimerClasse = async (id) => {
    if (!window.confirm('Supprimer cette classe ?')) return;
    try {
      await axios.delete(
        `http://localhost/eduschedule-pro/backend/api/classes.php?id=${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage('✅ Classe supprimée !');
      fetchClasses();
    } catch (error) {
      setMessage('❌ Erreur suppression');
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
          <h4 className="fw-bold mb-0">🎓 Gestion des Classes</h4>
          <button className="btn btn-primary"
            onClick={() => setShowForm(!showForm)}>
            {showForm ? '✕ Annuler' : '+ Nouvelle classe'}
          </button>
        </div>

        {message && (
          <div className="alert alert-info">{message}</div>
        )}

        {showForm && (
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body">
              <h5 className="fw-bold mb-3">Créer une classe</h5>
              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-md-3">
                    <label className="form-label fw-semibold">Code</label>
                    <input type="text" className="form-control"
                      placeholder="ex: L1-INFO"
                      value={form.code}
                      onChange={(e) => setForm({...form, code: e.target.value})}
                      required />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label fw-semibold">Libellé</label>
                    <input type="text" className="form-control"
                      placeholder="ex: Licence 1 Informatique"
                      value={form.libelle}
                      onChange={(e) => setForm({...form, libelle: e.target.value})}
                      required />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label fw-semibold">Niveau</label>
                    <select className="form-select"
                      value={form.niveau}
                      onChange={(e) => setForm({...form, niveau: e.target.value})}
                      required>
                      <option value="">Choisir</option>
                      <option>Licence 1</option>
                      <option>Licence 2</option>
                      <option>Licence 3</option>
                      <option>Master 1</option>
                      <option>Master 2</option>
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label fw-semibold">
                      Année académique
                    </label>
                    <input type="text" className="form-control"
                      value={form.annee_academique}
                      onChange={(e) => setForm({...form, annee_academique: e.target.value})}
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
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Code</th>
                    <th>Libellé</th>
                    <th>Niveau</th>
                    <th>Année</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {classes.map((c, i) => (
                    <tr key={i}>
                      <td><span className="badge bg-primary">{c.code}</span></td>
                      <td>{c.libelle}</td>
                      <td>{c.niveau}</td>
                      <td>{c.annee_academique}</td>
                      <td>
                        <button className="btn btn-sm btn-danger"
                          onClick={() => supprimerClasse(c.id)}>
                          🗑️ Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default GestionClasses;