import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function NouveauCahier() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [creneaux, setCreneaux] = useState([]);
  const [message, setMessage] = useState('');
  const [erreur, setErreur] = useState('');
  const [form, setForm] = useState({
    id_creneau: '',
    titre_cours: '',
    contenu: '',
    niveau_avancement: '',
    observations: ''
  });
  const [travaux, setTravaux] = useState([]);

  useEffect(() => {
    fetchCreneaux();
  }, [token]);

  const fetchCreneaux = async () => {
    try {
      const response = await axios.get(
        'http://localhost/eduschedule-pro/backend/api/creneaux.php',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCreneaux(response.data);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const ajouterTravail = () => {
    setTravaux([...travaux, {
      description: '',
      date_limite: '',
      type: 'devoir'
    }]);
  };

  const modifierTravail = (index, champ, valeur) => {
    const nouveaux = [...travaux];
    nouveaux[index][champ] = valeur;
    setTravaux(nouveaux);
  };

  const supprimerTravail = (index) => {
    setTravaux(travaux.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        'http://localhost/eduschedule-pro/backend/api/cahiers.php',
        {
          id_creneau: form.id_creneau,
          titre: form.titre_cours,
          contenu_json: {
            contenu: form.contenu,
            niveau_avancement: form.niveau_avancement,
            observations: form.observations
          },
          travaux
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage('✅ Cahier de texte créé avec succès !');
      setTimeout(() => navigate('/cahier-texte'), 2000);
    } catch (error) {
      setErreur('❌ Erreur lors de la création');
    }
  };

  return (
    <div>
      <nav className="navbar navbar-dark bg-warning px-4">
        <span className="navbar-brand fw-bold text-dark">
          📅 EduSchedule Pro
        </span>
        <button className="btn btn-outline-dark btn-sm"
          onClick={() => navigate('/cahier-texte')}>
          ← Retour
        </button>
      </nav>

      <div className="container py-4">
        <h4 className="fw-bold mb-4">📖 Nouveau Cahier de Texte</h4>

        {message && <div className="alert alert-success">{message}</div>}
        {erreur && <div className="alert alert-danger">{erreur}</div>}

        <div className="card border-0 shadow-sm">
          <div className="card-body p-4">
            <form onSubmit={handleSubmit}>
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Séance concernée
                  </label>
                  <select className="form-select"
                    value={form.id_creneau}
                    onChange={(e) => setForm({...form, id_creneau: e.target.value})}
                    required>
                    <option value="">Choisir une séance</option>
                    {creneaux.map(cr => (
                      <option key={cr.id} value={cr.id}>
                        {cr.jour} - {cr.matiere} - {cr.heure_debut}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Titre du cours
                  </label>
                  <input type="text" className="form-control"
                    placeholder="ex: Chapitre 2 - Les bases de PHP"
                    value={form.titre_cours}
                    onChange={(e) => setForm({...form, titre_cours: e.target.value})}
                    required />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">
                  Points vus dans le cours
                </label>
                <textarea className="form-control" rows="4"
                  placeholder="Décrivez les notions, concepts et exercices traités..."
                  value={form.contenu}
                  onChange={(e) => setForm({...form, contenu: e.target.value})}
                  required />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">
                  Niveau d'avancement du programme
                </label>
                <input type="text" className="form-control"
                  placeholder="ex: Chapitre 2/5 - 40% du programme"
                  value={form.niveau_avancement}
                  onChange={(e) => setForm({...form, niveau_avancement: e.target.value})} />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">
                  Observations
                </label>
                <textarea className="form-control" rows="2"
                  placeholder="Incidents, retards, absences..."
                  value={form.observations}
                  onChange={(e) => setForm({...form, observations: e.target.value})} />
              </div>

              <h6 className="fw-bold mb-2">Travaux demandés</h6>
              {travaux.map((t, index) => (
                <div key={index} className="border rounded p-3 mb-2 bg-light">
                  <div className="row g-2">
                    <div className="col-md-5">
                      <input type="text" className="form-control form-control-sm"
                        placeholder="Description du travail"
                        value={t.description}
                        onChange={(e) => modifierTravail(index, 'description', e.target.value)} />
                    </div>
                    <div className="col-md-3">
                      <input type="date" className="form-control form-control-sm"
                        value={t.date_limite}
                        onChange={(e) => modifierTravail(index, 'date_limite', e.target.value)} />
                    </div>
                    <div className="col-md-3">
                      <select className="form-select form-select-sm"
                        value={t.type}
                        onChange={(e) => modifierTravail(index, 'type', e.target.value)}>
                        <option value="devoir">Devoir</option>
                        <option value="exercice">Exercice</option>
                        <option value="projet">Projet</option>
                      </select>
                    </div>
                    <div className="col-md-1">
                      <button type="button"
                        className="btn btn-sm btn-danger"
                        onClick={() => supprimerTravail(index)}>✕</button>
                    </div>
                  </div>
                </div>
              ))}

              <button type="button"
                className="btn btn-outline-secondary btn-sm mb-3"
                onClick={ajouterTravail}>
                + Ajouter un travail
              </button>

              <div className="d-grid">
                <button type="submit" className="btn btn-warning fw-bold"
                  style={{ textTransform: 'none' }}>
                  💾 Enregistrer le cahier de texte
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NouveauCahier;