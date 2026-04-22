import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function PointageQR() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [tokenQR, setTokenQR] = useState('');
  const [message, setMessage] = useState('');
  const [erreur, setErreur] = useState('');
  const [seance, setSeance] = useState(null);
  const [chargement, setChargement] = useState(false);

  const scanner = async (e) => {
    e.preventDefault();
    setChargement(true);
    setMessage('');
    setErreur('');
    setSeance(null);

    try {
      const response = await axios.post(
        'http://localhost/eduschedule-pro/backend/api/pointages.php',
        { token_qr: tokenQR },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(response.data.message);
      setSeance(response.data.creneau);
      setTokenQR('');
    } catch (error) {
      setErreur(error.response?.data?.erreur || 'Erreur lors du pointage');
    } finally {
      setChargement(false);
    }
  };

  return (
    <div>
      <nav className="navbar navbar-dark bg-success px-4">
        <span className="navbar-brand fw-bold">📅 EduSchedule Pro</span>
        <button className="btn btn-outline-light btn-sm"
          onClick={() => navigate('/dashboard/enseignant')}>
          ← Retour
        </button>
      </nav>

      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-5">
                <h4 className="fw-bold text-center mb-4">
                  📱 Pointage QR Code
                </h4>

                {message && (
                  <div className="alert alert-success text-center">
                    ✅ {message}
                  </div>
                )}

                {erreur && (
                  <div className="alert alert-danger text-center">
                    ❌ {erreur}
                  </div>
                )}

                {seance && (
                  <div className="card bg-light mb-3">
                    <div className="card-body">
                      <h6 className="fw-bold">Détails de la séance :</h6>
                      <p className="mb-1">
                        <strong>Matière :</strong> {seance.matiere}
                      </p>
                      <p className="mb-1">
                        <strong>Classe :</strong> {seance.classe}
                      </p>
                      <p className="mb-1">
                        <strong>Salle :</strong> {seance.salle}
                      </p>
                      <p className="mb-0">
                        <strong>Horaire :</strong>{' '}
                        {seance.heure_debut} - {seance.heure_fin}
                      </p>
                    </div>
                  </div>
                )}

                <form onSubmit={scanner}>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Code QR de la séance
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-lg text-center"
                      placeholder="Scannez ou saisissez le code"
                      value={tokenQR}
                      onChange={(e) => setTokenQR(e.target.value)}
                      required
                    />
                    <small className="text-muted">
                      Scannez le QR code affiché dans la salle ou 
                      saisissez le code manuellement
                    </small>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-success w-100 py-2"
                    style={{ textTransform: 'none' }}
                    disabled={chargement}
                  >
                    {chargement ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" />
                        Validation...
                      </>
                    ) : (
                      '✅ Valider le pointage'
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PointageQR;