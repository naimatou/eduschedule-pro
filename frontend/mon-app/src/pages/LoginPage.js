import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(false);
  
  const { connexion } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setChargement(true);
    setErreur('');

    try {
      const response = await axios.post(
        'http://localhost/eduschedule-pro/backend/api/auth.php',
        { email, password }
      );

      connexion(response.data.utilisateur, response.data.token);
      
      // Redirection selon le rôle
      const role = response.data.utilisateur.role;
      navigate(`/dashboard/${role}`);

    } catch (error) {
      setErreur(
        error.response?.data?.erreur || 'Erreur de connexion'
      );
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className="container-fluid min-vh-100 d-flex 
                    align-items-center justify-content-center"
         style={{ backgroundColor: '#1a237e' }}>
      
      <div className="card shadow-lg" style={{ width: '400px' }}>
        <div className="card-body p-5">
          
          {/* Logo et titre */}
          <div className="text-center mb-4">
            <h2 className="fw-bold text-primary">
              📅 EduSchedule Pro
            </h2>
            <p className="text-muted">
              Système de gestion pédagogique
            </p>
          </div>

          {/* Message d'erreur */}
          {erreur && (
            <div className="alert alert-danger">{erreur}</div>
          )}

          {/* Formulaire */}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold">
                Email
              </label>
              <input
                type="email"
                className="form-control"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="mb-4">
              <label className="form-label fw-semibold">
                Mot de passe
              </label>
              <input
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 py-2 fw-semibold"
              disabled={chargement}
            >
              {chargement ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Connexion...
                </>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>

          <div className="text-center mt-3">
            <small className="text-muted">
              ISGE — Année 2025-2026
            </small>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;