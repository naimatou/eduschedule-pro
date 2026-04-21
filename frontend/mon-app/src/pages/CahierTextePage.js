import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import SignaturePad from 'signature_pad';

function CahierTextePage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [cahiers, setCahiers] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [cahierSelectionne, setCahierSelectionne] = useState(null);
  const [showSignature, setShowSignature] = useState(false);
  const canvasRef = useRef(null);
  const signaturePadRef = useRef(null);

  useEffect(() => {
    fetchCahiers();
  }, [token]);

  useEffect(() => {
    if (showSignature && canvasRef.current) {
      signaturePadRef.current = new SignaturePad(canvasRef.current);
    }
  }, [showSignature]);

  const fetchCahiers = async () => {
    try {
      const response = await axios.get(
        'http://localhost/eduschedule-pro/backend/api/cahiers.php',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCahiers(response.data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setChargement(false);
    }
  };

  const signerCahier = async (id, type) => {
    if (signaturePadRef.current?.isEmpty()) {
      alert('Veuillez apposer votre signature !');
      return;
    }

    const signature = signaturePadRef.current.toDataURL();

    try {
      await axios.post(
        `http://localhost/eduschedule-pro/backend/api/cahiers.php/signer?id=${id}`,
        { signature_base64: signature, type },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Signature enregistrée !');
      setShowSignature(false);
      fetchCahiers();
    } catch (error) {
      alert('Erreur lors de la signature');
    }
  };

  const statutBadge = (statut) => {
    const couleurs = {
      brouillon: 'warning',
      signe_delegue: 'info',
      cloture: 'success'
    };
    return couleurs[statut] || 'secondary';
  };

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
        <h4 className="mb-4 fw-bold">📖 Cahiers de Texte</h4>

        {chargement ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" />
          </div>
        ) : cahiers.length === 0 ? (
          <div className="alert alert-info">
            Aucun cahier de texte disponible.
          </div>
        ) : (
          <div className="row g-3">
            {cahiers.map((cahier, i) => (
              <div key={i} className="col-md-6">
                <div className="card border-0 shadow-sm">
                  <div className="card-header d-flex 
                                  justify-content-between">
                    <strong>{cahier.matiere}</strong>
                    <span className={`badge bg-${statutBadge(cahier.statut)}`}>
                      {cahier.statut}
                    </span>
                  </div>
                  <div className="card-body">
                    <p className="mb-1">
                      <strong>Classe :</strong> {cahier.classe}
                    </p>
                    <p className="mb-1">
                      <strong>Enseignant :</strong>{' '}
                      {cahier.enseignant_prenom} {cahier.enseignant_nom}
                    </p>
                    <p className="mb-1">
                      <strong>Titre :</strong>{' '}
                      {cahier.titre_cours || 'Non renseigné'}
                    </p>
                    <p className="mb-1">
                      <strong>Date :</strong>{' '}
                      {new Date(cahier.date_creation)
                        .toLocaleDateString('fr-FR')}
                    </p>

                    {cahier.statut !== 'cloture' && (
                      <button
                        className="btn btn-sm btn-primary mt-2"
                        onClick={() => {
                          setCahierSelectionne(cahier);
                          setShowSignature(true);
                        }}
                      >
                        ✍️ Signer
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal Signature */}
        {showSignature && cahierSelectionne && (
          <div className="modal show d-block" 
               style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    ✍️ Signature numérique
                  </h5>
                  <button
                    className="btn-close"
                    onClick={() => setShowSignature(false)}
                  />
                </div>
                <div className="modal-body">
                  <p className="text-muted mb-2">
                    Signez dans le cadre ci-dessous :
                  </p>
                  <canvas
                    ref={canvasRef}
                    width={450}
                    height={200}
                    className="border rounded w-100"
                    style={{ touchAction: 'none' }}
                  />
                  <button
                    className="btn btn-sm btn-outline-secondary mt-2"
                    onClick={() => signaturePadRef.current?.clear()}
                  >
                    Effacer
                  </button>
                </div>
                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowSignature(false)}
                  >
                    Annuler
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={() => signerCahier(
                      cahierSelectionne.id, 'delegue'
                    )}
                  >
                    Valider la signature
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CahierTextePage;