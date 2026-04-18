import { useState, useEffect } from 'react';
import { getElections, getCommentaires, ajouterCommentaire, supprimerCommentaire, getCandidats } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function Commentaires() {
  const { utilisateur } = useAuth();
  const [elections, setElections] = useState([]);
  const [electionChoisie, setElectionChoisie] = useState('');
  const [commentaires, setCommentaires] = useState([]);
  const [candidats, setCandidats] = useState([]);
  const [contenu, setContenu] = useState('');
  const [idCandidat, setIdCandidat] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [modalSuppression, setModalSuppression] = useState(null);

  useEffect(() => {
    fetchElections();
  }, []);

  useEffect(() => {
    if (electionChoisie) {
      fetchCommentaires(electionChoisie);
      fetchCandidats();
    }
  }, [electionChoisie]);

  const fetchElections = async () => {
    try {
      const res = await getElections();
      setElections(res.data);
      if (res.data.length > 0) setElectionChoisie(res.data[0].id_election);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCommentaires = async (id) => {
    try {
      const res = await getCommentaires(id);
      setCommentaires(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCandidats = async () => {
    try {
      const res = await getCandidats();
      setCandidats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAjouter = async (e) => {
    e.preventDefault();
    if (!contenu.trim() || !electionChoisie) return;
    setSubmitting(true);
    try {
      await ajouterCommentaire({
        contenu,
        id_election: electionChoisie,
        id_candidat: idCandidat || null,
      });
      setContenu('');
      setIdCandidat('');
      setMessage({ type: 'success', text: 'Commentaire publié' });
      fetchCommentaires(electionChoisie);
    } catch (err) {
      setMessage({ type: 'error', text: 'Erreur lors de la publication' });
    } finally {
      setSubmitting(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleSupprimer = async (id) => {
    setModalSuppression(null);
    try {
      await supprimerCommentaire(id);
      setMessage({ type: 'success', text: 'Commentaire supprimé' });
      fetchCommentaires(electionChoisie);
    } catch (err) {
      setMessage({ type: 'error', text: 'Erreur lors de la suppression' });
    }
    setTimeout(() => setMessage(null), 3000);
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
          Commentaires
        </h1>
        <p style={{ fontSize: '14px', color: '#6c757d' }}>
          Réagissez et partagez votre avis sur les élections
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

      <div style={{ marginBottom: '24px' }}>
        <select
          value={electionChoisie}
          onChange={(e) => setElectionChoisie(e.target.value)}
          style={{
            padding: '12px 18px',
            border: '1px solid #e0e0e0',
            borderRadius: '40px',
            fontSize: '14px',
            outline: 'none',
            background: 'white',
            cursor: 'pointer',
            fontWeight: 500,
            transition: 'all 0.2s ease',
          }}
          onFocus={(e) => { e.target.style.borderColor = '#1a73e8'; }}
        >
          <option value="">Choisir une élection</option>
          {elections.map(el => (
            <option key={el.id_election} value={el.id_election}>
              {el.nom}
            </option>
          ))}
        </select>
      </div>

      {electionChoisie && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '28px',
          alignItems: 'start',
        }}>
          <div>
            <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#1a1a2e', marginBottom: '18px' }}>
              {commentaires.length} commentaire(s)
            </h2>

            {commentaires.length === 0 ? (
              <div style={{
                background: 'white',
                borderRadius: '20px',
                padding: '48px',
                textAlign: 'center',
                color: '#9aa0a6',
                border: '1px solid rgba(0,0,0,0.05)',
              }}>
                <div style={{ fontSize: '48px', marginBottom: '12px', opacity: 0.5 }}>💬</div>
                <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '6px' }}>
                  Aucun commentaire
                </div>
                <div style={{ fontSize: '13px' }}>Soyez le premier à réagir</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {commentaires.map((c) => (
                  <div key={c.id_commentaire} style={{
                    background: 'white',
                    borderRadius: '18px',
                    padding: '20px',
                    border: '1px solid rgba(0,0,0,0.05)',
                    borderLeft: c.id_candidat ? '4px solid #1a73e8' : '4px solid #e0e0e0',
                    transition: 'all 0.2s ease',
                  }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateX(4px)';
                      e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.08)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateX(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          background: '#e8f0fe',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '15px',
                          fontWeight: 700,
                          color: '#1a73e8',
                        }}>
                          {c.nom?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a2e' }}>
                            {c.prenom} {c.nom}
                          </div>
                          {c.candidat_nom && (
                            <div style={{ fontSize: '11px', color: '#1a73e8', fontWeight: 500 }}>
                              À propos de {c.candidat_prenom} {c.candidat_nom}
                            </div>
                          )}
                          {!c.candidat_nom && (
                            <div style={{ fontSize: '11px', color: '#9aa0a6' }}>Commentaire général</div>
                          )}
                        </div>
                      </div>

                      {c.nom === utilisateur?.nom && (
                        <button
                          onClick={() => setModalSuppression(c.id_commentaire)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#ea4335',
                            fontSize: '14px',
                            padding: '6px 10px',
                            borderRadius: '8px',
                            transition: 'all 0.2s ease',
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = '#fce8e6'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
                        >
                          Supprimer
                        </button>
                      )}
                    </div>
                    <p style={{
                      fontSize: '13px',
                      color: '#5f6368',
                      lineHeight: 1.7,
                      margin: 0,
                    }}>
                      {c.contenu}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ position: 'sticky', top: '80px' }}>
            <div style={{
              background: 'white',
              borderRadius: '20px',
              padding: '26px',
              border: '1px solid rgba(0,0,0,0.05)',
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1a1a2e', marginBottom: '20px' }}>
                Ajouter un commentaire
              </h3>
              <form onSubmit={handleAjouter}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#9aa0a6',
                    marginBottom: '6px',
                  }}>
                    Cibler un candidat (optionnel)
                  </label>
                  <select
                    value={idCandidat}
                    onChange={(e) => setIdCandidat(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      border: '1px solid #e0e0e0',
                      borderRadius: '12px',
                      fontSize: '13px',
                      outline: 'none',
                      color: '#5f6368',
                      transition: 'all 0.2s ease',
                    }}
                    onFocus={(e) => { e.target.style.borderColor = '#1a73e8'; }}
                  >
                    <option value="">Commentaire général</option>
                    {candidats.map(c => (
                      <option key={c.id_candidat} value={c.id_candidat}>
                        {c.prenom} {c.nom}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: '18px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#9aa0a6',
                    marginBottom: '6px',
                  }}>
                    Votre commentaire
                  </label>
                  <textarea
                    value={contenu}
                    onChange={(e) => setContenu(e.target.value)}
                    placeholder="Partagez votre avis..."
                    rows={4}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      border: '1px solid #e0e0e0',
                      borderRadius: '12px',
                      fontSize: '13px',
                      resize: 'vertical',
                      outline: 'none',
                      lineHeight: 1.6,
                      boxSizing: 'border-box',
                      transition: 'all 0.2s ease',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#1a73e8';
                      e.target.style.boxShadow = '0 0 0 3px rgba(26,115,232,0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e0e0e0';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting || !contenu.trim()}
                  style={{
                    width: '100%',
                    padding: '14px',
                    background: submitting || !contenu.trim() ? '#9aa0a6' : '#1a73e8',
                    color: 'white',
                    border: 'none',
                    borderRadius: '40px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: submitting || !contenu.trim() ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!submitting && contenu.trim()) {
                      e.currentTarget.style.background = '#0d47a1';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!submitting && contenu.trim()) {
                      e.currentTarget.style.background = '#1a73e8';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }
                  }}
                >
                  {submitting ? 'Publication...' : 'Publier'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal suppression */}
      {modalSuppression && (
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
          onClick={() => setModalSuppression(null)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '28px',
              maxWidth: '360px',
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
            }}>🗑️</div>
            <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#1a1a2e', marginBottom: '12px' }}>
              Supprimer le commentaire
            </h3>
            <p style={{ fontSize: '14px', color: '#6c757d', lineHeight: 1.6, marginBottom: '28px' }}>
              Cette action est irréversible
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setModalSuppression(null)}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#f5f5f5',
                  border: 'none',
                  borderRadius: '40px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  color: '#5f6368',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#e8e8e8'; }}
              >
                Annuler
              </button>
              <button
                onClick={() => handleSupprimer(modalSuppression)}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#ea4335',
                  border: 'none',
                  borderRadius: '40px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  color: 'white',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#c62828'; }}
              >
                Supprimer
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
