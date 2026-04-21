import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function GestionEmploiTemps() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [enseignants, setEnseignants] = useState([]);
  const [matieres, setMatieres] = useState([]);
  const [salles, setSalles] = useState([]);
  const [classesChargement, setClassesChargement] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [semaine, setSemaine] = useState('');
  const [idClasse, setIdClasse] = useState('');
  const [creneaux, setCreneaux] = useState([]);
  const [message, setMessage] = useState('');

  const jours = ['lundi','mardi','mercredi','jeudi','vendredi','samedi'];

  useEffect(() => {
    fetchDonnees();
  }, [token]);

  const fetchDonnees = async () => {
    try {
      const [resClasses, resEns, resMat, resSalles] = await Promise.all([
        axios.get('http://localhost/eduschedule-pro/backend/api/classes.php',
          { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost/eduschedule-pro/backend/api/enseignants.php',
          { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost/eduschedule-pro/backend/api/matieres.php',
          { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost/eduschedule-pro/backend/api/salles.php',
          { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setClasses(resClasses.data);
      setEnseignants(resEns.data);
      setMatieres(resMat.data);
      setSalles(resSalles.data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setClassesChargement(false);
    }
  };

  const ajouterCreneau = () => {
    setCreneaux([...creneaux, {
      id_matiere: '',
      id_enseignant: '',
      id_salle: '',
      jour: 'lundi',
      heure_debut: '08:00',
      heure_fin: '10:00'
    }]);
  };

  const modifierCreneau = (index, champ, valeur) => {
    const nouveaux = [...creneaux];
    nouveaux[index][champ] = valeur;
    setCreneaux(nouveaux);
  };

  const supprimerCreneau = (index) => {
    setCreneaux(creneaux.filter((_, i) => i !== index));
  };

  const soumettreEmploiTemps = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        'http://localhost/eduschedule-pro/backend/api/emploi_temps.php',
        { id_classe: idClasse, semaine_debut: semaine, creneaux },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage('✅ Emploi du temps créé avec succès !');
      setShowForm(false);
      setCreneaux([]);
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
          <h4 className="fw-bold mb-0">📅 Gestion des Emplois du Temps</h4>
          <button className="btn btn-primary"
            onClick={() => setShowForm(!showForm)}>
            {showForm ? '✕ Annuler' : '+ Nouvel emploi du temps'}
          </button>
        </div>

        {message && (
          <div className="alert alert-info">{message}</div>
        )}

        {showForm && (
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body">
              <h5 className="fw-bold mb-3">Créer un emploi du temps</h5>
              <form onSubmit={soumettreEmploiTemps}>
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Classe</label>
                    <select className="form-select"
                      value={idClasse}
                      onChange={(e) => setIdClasse(e.target.value)}
                      required>
                      <option value="">Choisir une classe</option>
                      {classes.map(c => (
                        <option key={c.id} value={c.id}>{c.libelle}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Semaine du
                    </label>
                    <input type="date" className="form-control"
                      value={semaine}
                      onChange={(e) => setSemaine(e.target.value)}
                      required />
                  </div>
                </div>

                <h6 className="fw-bold mb-2">Créneaux</h6>
                {creneaux.map((cr, index) => (
                  <div key={index} 
                       className="border rounded p-3 mb-2 bg-light">
                    <div className="row g-2">
                      <div className="col-md-2">
                        <label className="form-label small">Jour</label>
                        <select className="form-select form-select-sm"
                          value={cr.jour}
                          onChange={(e) => modifierCreneau(index, 'jour', e.target.value)}>
                          {jours.map(j => (
                            <option key={j} value={j}>
                              {j.charAt(0).toUpperCase() + j.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-2">
                        <label className="form-label small">Début</label>
                        <input type="time" className="form-control form-control-sm"
                          value={cr.heure_debut}
                          onChange={(e) => modifierCreneau(index, 'heure_debut', e.target.value)} />
                      </div>
                      <div className="col-md-2">
                        <label className="form-label small">Fin</label>
                        <input type="time" className="form-control form-control-sm"
                          value={cr.heure_fin}
                          onChange={(e) => modifierCreneau(index, 'heure_fin', e.target.value)} />
                      </div>
                      <div className="col-md-2">
                        <label className="form-label small">Matière</label>
                        <select className="form-select form-select-sm"
                          value={cr.id_matiere}
                          onChange={(e) => modifierCreneau(index, 'id_matiere', e.target.value)}>
                          <option value="">Choisir</option>
                          {matieres.map(m => (
                            <option key={m.id} value={m.id}>{m.libelle}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-2">
                        <label className="form-label small">Enseignant</label>
                        <select className="form-select form-select-sm"
                          value={cr.id_enseignant}
                          onChange={(e) => modifierCreneau(index, 'id_enseignant', e.target.value)}>
                          <option value="">Choisir</option>
                          {enseignants.map(e => (
                            <option key={e.id} value={e.id}>
                              {e.prenom} {e.nom}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-1">
                        <label className="form-label small">Salle</label>
                        <select className="form-select form-select-sm"
                          value={cr.id_salle}
                          onChange={(e) => modifierCreneau(index, 'id_salle', e.target.value)}>
                          <option value="">Choisir</option>
                          {salles.map(s => (
                            <option key={s.id} value={s.id}>{s.code}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-1 d-flex align-items-end">
                        <button type="button"
                          className="btn btn-sm btn-danger"
                          onClick={() => supprimerCreneau(index)}>
                          ✕
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                <button type="button"
                  className="btn btn-outline-secondary btn-sm mb-3"
                  onClick={ajouterCreneau}>
                  + Ajouter un créneau
                </button>

                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-primary">
                    💾 Enregistrer
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default GestionEmploiTemps;