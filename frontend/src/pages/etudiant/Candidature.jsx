import { useState, useEffect } from 'react';
import { getElections, postuler, retirerCandidature, getCandidats, getMesClasses } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function Candidature() {
  const { utilisateur } = useAuth();
  const [elections, setElections] = useState([]);
  const [mesClasses, setMesClasses] = useState([]);
  const [maCandidature, setMaCandidature] = useState(null);
  const [programme, setProgramme] = useState('');
  const [idElection, setIdElection] = useState('');
  const [idClasse, setIdClasse] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [modalRetrait, setModalRetrait] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [e, mc] = await Promise.all([
        getElections(),
        getMesClasses()
      ]);
      const electionsOuvertes = e.data.filter(el => el.statut === 'ouverte');
      setElections(electionsOuvertes);
      setMesClasses(mc.data);

      if (mc.data.length === 1) setIdClasse(mc.data[0].id_classe);

      if (electionsOuvertes.length > 0) {
        const premiereElection = electionsOuvertes[0].id_election;
        setIdElection(premiereElection);

        const c = await getCandidats(premiereElection);
        const ma = c.data.find(c => c.email === utilisateur?.email);
        setMaCandidature(ma || null);
      } else {
        setMaCandidature(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePostuler = async (e) => {
    e.preventDefault();
    if (!programme.trim() || !idElection || !idClasse) {
      setMessage({ type: 'error', text: 'Veuillez remplir tous les champs' });
      setTimeout(() => setMessage(null), 3000);
      return;
    }
    setSubmitting(true);
    try {
      await postuler({
        programme,
        id_election: parseInt(idElection),
        id_classe: parseInt(idClasse),
      });
      setMessage({ type: 'success', text: 'Candidature soumise — en attente de validation' });
      setProgramme('');
      fetchData();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Erreur lors de la soumission' });
    } finally {
      setSubmitting(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const handleRetirer = async () => {
    if (!maCandidature) return;
    setModalRetrait(false);
    try {
      await retirerCandidature(maCandidature.id_candidat);
      setMessage({ type: 'success', text: 'Candidature retirée' });
      setMaCandidature(null);
      fetchData();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Erreur' });
    }
    setTimeout(() => setMessage(null), 4000);
  };

  const statutConfig = {
    en_attente: { label: 'En attente de validation', bg: '#fff8e1', color: '#f57c00' },
    valide:     { label: 'Candidature validée',      bg: '#e6f4ea', color: '#2e7d32' },
    rejete:     { label: 'Candidature rejetée',      bg: '#fce8e6', color: '#c62828' },
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
      <div style={{
        width: '40px', height: '40px',
        border: '2px solid #e8f0fe',
        borderTopColor: '#1a73e8',
        borderRadius: '50%',
        animation: 'spin 0.6s linear infinite',
      }} />
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{
          fontSize: 'clamp(24px, 6vw, 28px)',
          fontWeight: 700,
          color: '#1a1a2e',
          marginBottom: '8px',
          letterSpacing: '-0.02em',
        }}>
          Ma candidature
        </h1>
        <p style={{ fontSize: '14px', color: '#6c757d' }}>
          Gérez votre candidature aux élections
        </p>
      </div>

      {message && (
        <div style={{
          background: message.type === 'success' ? '#e6f4ea' : '#fce8e6',
          borderLeft: `4px solid ${message.type === 'success' ? '#34a853' : '#ea4335'}`,
          color: message.type === 'success' ? '#2e7d32' : '#c62828',
          padding: '14px 18px',
          borderRadius: '14px',
          fontSize: '14px',
          marginBottom: '24px',
        }}>
          {message.text}
        </div>
      )}

      {mesClasses.length === 0 && (
        <div style={{
          background: '#fff8e1',
          borderLeft: '4px solid #fbbc04',
          color: '#f57c00',
          padding: '14px 18px',
          borderRadius: '14px',
          fontSize: '14px',
          marginBottom: '24px',
        }}>
          Vous n'êtes inscrit dans aucune classe. Contactez l'administration.
        </div>
      )}

      {maCandidature ? (
        <div>
          <div
            style={{
              background: 'linear-gradient(135deg, #1a73e8 0%, #0d47a1 100%)',
              borderRadius: '28px',
              padding: 'clamp(28px, 5vw, 36px)',
              marginBottom: '28px',
              color: 'white',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <div style={{
                width: '64px',
                height: '64px',
                background: 'rgba(255,255,255,0.2)',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
              }}>
                🏆
              </div>
              <div>
                <div style={{ fontSize: 'clamp(18px, 5vw, 22px)', fontWeight: 700, marginBottom: '4px' }}>
                  Vous êtes candidat
                </div>
                <div style={{ opacity: 0.8, fontSize: '13px' }}>
                  Classe : {maCandidature.classe}
                </div>
              </div>
            </div>

            <div style={{
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '16px',
              padding: '18px',
              fontSize: '13px',
              lineHeight: 1.7,
              marginBottom: '20px',
            }}>
              <div style={{ fontWeight: 600, marginBottom: '8px', opacity: 0.8 }}>Mon programme</div>
              {maCandidature.programme}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
              <span style={{
                background: statutConfig[maCandidature.statut]?.bg,
                color: statutConfig[maCandidature.statut]?.color,
                padding: '8px 20px',
                borderRadius: '40px',
                fontSize: '12px',
                fontWeight: 700,
              }}>
                {statutConfig[maCandidature.statut]?.label}
              </span>

              {maCandidature.statut === 'en_attente' && (
                <button
                  onClick={() => setModalRetrait(true)}
                  style={{
                    background: 'rgba(234,67,53,0.9)',
                    color: 'white',
                    border: 'none',
                    padding: '10px 24px',
                    borderRadius: '40px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#ea4335'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(234,67,53,0.9)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  Retirer ma candidature
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '28px',
        }}>
          <div style={{
            background: 'white',
            borderRadius: '24px',
            padding: 'clamp(24px, 5vw, 32px)',
            border: '1px solid rgba(0,0,0,0.05)',
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1a1a2e', marginBottom: '24px' }}>
              Soumettre ma candidature
            </h2>

            {elections.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9aa0a6' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px', opacity: 0.5 }}>🔒</div>
                <div style={{ fontWeight: 600, marginBottom: '4px' }}>Aucune élection ouverte</div>
                <div style={{ fontSize: '13px' }}>Vous ne pouvez pas vous porter candidat pour le moment</div>
              </div>
            ) : mesClasses.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9aa0a6' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px', opacity: 0.5 }}>📚</div>
                <div style={{ fontWeight: 600 }}>Aucune classe trouvée</div>
                <div style={{ fontSize: '13px', marginTop: '4px' }}>Contactez l'administration</div>
              </div>
            ) : (
              <form onSubmit={handlePostuler}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#3c4043', marginBottom: '8px' }}>
                    Élection
                  </label>
                  <select
                    value={idElection}
                    onChange={(e) => setIdElection(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #e0e0e0',
                      borderRadius: '12px',
                      fontSize: '13px',
                      outline: 'none',
                      boxSizing: 'border-box',
                      transition: 'all 0.2s ease',
                    }}
                    onFocus={(e) => { e.target.style.borderColor = '#1a73e8'; }}
                    onBlur={(e) => { e.target.style.borderColor = '#e0e0e0'; }}
                  >
                    <option value="">Choisir une élection ouverte</option>
                    {elections.map(el => (
                      <option key={el.id_election} value={el.id_election}>
                        {el.nom}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#3c4043', marginBottom: '8px' }}>
                    Ma classe
                  </label>
                  {mesClasses.length === 1 ? (
                    <div style={{
                      padding: '12px 16px',
                      background: '#e8f0fe',
                      borderRadius: '12px',
                      fontSize: '13px',
                      color: '#1a73e8',
                      fontWeight: 600,
                    }}>
                      {mesClasses[0].nom} — {mesClasses[0].filiere}
                    </div>
                  ) : (
                    <select
                      value={idClasse}
                      onChange={(e) => setIdClasse(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid #e0e0e0',
                        borderRadius: '12px',
                        fontSize: '13px',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                      onFocus={(e) => { e.target.style.borderColor = '#1a73e8'; }}
                    >
                      <option value="">Choisir votre classe</option>
                      {mesClasses.map(c => (
                        <option key={c.id_classe} value={c.id_classe}>
                          {c.nom} — {c.filiere} ({c.annee_debut}/{c.annee_fin})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#3c4043', marginBottom: '8px' }}>
                    Mon programme
                  </label>
                  <textarea
                    value={programme}
                    onChange={(e) => setProgramme(e.target.value)}
                    placeholder="Décrivez votre programme électoral..."
                    rows={6}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #e0e0e0',
                      borderRadius: '12px',
                      fontSize: '13px',
                      resize: 'vertical',
                      outline: 'none',
                      boxSizing: 'border-box',
                      lineHeight: 1.6,
                      transition: 'all 0.2s ease',
                    }}
                    onFocus={(e) => { e.target.style.borderColor = '#1a73e8'; }}
                    onBlur={(e) => { e.target.style.borderColor = '#e0e0e0'; }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    width: '100%',
                    padding: '14px',
                    background: submitting ? '#9aa0a6' : '#1a73e8',
                    color: 'white',
                    border: 'none',
                    borderRadius: '40px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => { if (!submitting) { e.currentTarget.style.background = '#0d47a1'; e.currentTarget.style.transform = 'translateY(-2px)'; } }}
                  onMouseLeave={(e) => { if (!submitting) { e.currentTarget.style.background = '#1a73e8'; e.currentTarget.style.transform = 'translateY(0)'; } }}
                >
                  {submitting ? 'Soumission en cours...' : 'Soumettre ma candidature'}
                </button>
              </form>
            )}
          </div>

          <div style={{
            background: 'white',
            borderRadius: '24px',
            padding: 'clamp(24px, 5vw, 32px)',
            border: '1px solid rgba(0,0,0,0.05)',
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1a1a2e', marginBottom: '24px' }}>
              Informations
            </h2>
            {[
              { title: 'Éligibilité', text: 'Tout étudiant inscrit dans une classe peut se porter candidat.' },
              { title: 'Validation', text: 'Votre candidature doit être validée par l\'administrateur avant d\'être visible.' },
              { title: 'Une seule classe', text: 'Vous ne pouvez vous présenter que dans votre propre classe.' },
              { title: 'Limitation', text: 'Un seul candidat validé par classe est autorisé.' },
              { title: 'Retrait', text: 'Vous pouvez retirer votre candidature tant qu\'elle n\'est pas validée.' },
            ].map((item, i) => (
              <div key={i} style={{
                marginBottom: '16px',
                padding: '14px 16px',
                background: '#f8f9fa',
                borderRadius: '14px',
                transition: 'all 0.2s ease',
              }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#e8f0fe'; e.currentTarget.style.transform = 'translateX(4px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#f8f9fa'; e.currentTarget.style.transform = 'translateX(0)'; }}
              >
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#1a1a2e', marginBottom: '4px' }}>{item.title}</div>
                <div style={{ fontSize: '12px', color: '#9aa0a6', lineHeight: 1.5 }}>{item.text}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal retrait */}
      {modalRetrait && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
          onClick={() => setModalRetrait(false)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '28px',
              maxWidth: '380px',
              width: '100%',
              padding: '32px',
              textAlign: 'center',
              animation: 'fadeInUp 0.3s ease',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              width: '56px',
              height: '56px',
              background: '#fce8e6',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              fontSize: '28px',
            }}>⚠️</div>
            <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#1a1a2e', marginBottom: '12px' }}>
              Retirer ma candidature
            </h3>
            <p style={{ fontSize: '14px', color: '#6c757d', lineHeight: 1.6, marginBottom: '28px' }}>
              Êtes-vous sûr de vouloir retirer votre candidature ? Cette action est irréversible.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setModalRetrait(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#f5f5f5',
                  border: 'none',
                  borderRadius: '40px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  color: '#5f6368',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#e8e8e8'; }}
              >
                Annuler
              </button>
              <button
                onClick={handleRetirer}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#ea4335',
                  border: 'none',
                  borderRadius: '40px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  color: 'white',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#c62828'; }}
              >
                Retirer
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
