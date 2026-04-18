import { useState, useEffect } from 'react';
import { getElections, getCandidats, getResultats, getCommentaires, ajouterCommentaire, voter } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { io } from 'socket.io-client';

const socket = io('http://192.168.138.42:3000');

export default function Elections({ setCurrentPage }) {
  const { utilisateur } = useAuth();
  const [elections, setElections] = useState([]);
  const [electionSelectionnee, setElectionSelectionnee] = useState(null);
  const [candidats, setCandidats] = useState([]);
  const [resultats, setResultats] = useState([]);
  const [commentaires, setCommentaires] = useState([]);
  const [nouveauCommentaire, setNouveauCommentaire] = useState('');
  const [candidatCommente, setCandidatCommente] = useState('');
  const [loading, setLoading] = useState(true);
  const [voteEnCours, setVoteEnCours] = useState(false);
  const [message, setMessage] = useState(null);
  const [modalVote, setModalVote] = useState(null);
  const [modalConfirmation, setModalConfirmation] = useState(null);

  useEffect(() => {
    fetchElections();
  }, []);

  useEffect(() => {
    if (electionSelectionnee) {
      socket.emit('rejoindreElection', electionSelectionnee.id_election);
      socket.on('resultatsMAJ', (data) => setResultats(data));
      socket.on('deliberation', (data) => {
        setMessage({ type: 'success', text: `Délibération : ${data.gagnant.prenom} ${data.gagnant.nom} est élu` });
      });
      fetchDetails(electionSelectionnee.id_election);
    }
    return () => {
      socket.off('resultatsMAJ');
      socket.off('deliberation');
    };
  }, [electionSelectionnee]);

  const fetchElections = async () => {
    try {
      const res = await getElections();
      setElections(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDetails = async (id) => {
    try {
      const [c, r, co] = await Promise.all([
        getCandidats(id),
        getResultats(id),
        getCommentaires(id),
      ]);
      setCandidats(c.data);
      setResultats(r.data.resultats);
      setCommentaires(co.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleVoter = async (candidat) => {
    if (!electionSelectionnee) return;
    setModalConfirmation({
      candidat,
      action: async () => {
        setVoteEnCours(true);
        try {
          await voter({ id_candidat: candidat.id_candidat, id_election: electionSelectionnee.id_election });
          setMessage({ type: 'success', text: 'Votre vote a été soumis avec succès' });
          fetchDetails(electionSelectionnee.id_election);
          setModalConfirmation(null);
        } catch (err) {
          setMessage({ type: 'error', text: err.response?.data?.message || 'Erreur lors du vote' });
        } finally {
          setVoteEnCours(false);
          setTimeout(() => setMessage(null), 4000);
        }
      }
    });
  };

  const handleCommenter = async (e) => {
    e.preventDefault();
    if (!nouveauCommentaire.trim()) return;
    try {
      await ajouterCommentaire({
        contenu: nouveauCommentaire,
        id_election: electionSelectionnee.id_election,
        id_candidat: candidatCommente || null,
      });
      setNouveauCommentaire('');
      setCandidatCommente('');
      const co = await getCommentaires(electionSelectionnee.id_election);
      setCommentaires(co.data);
      setMessage({ type: 'success', text: 'Commentaire publié' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: 'Erreur lors de l\'ajout' });
    }
  };

  const totalVotes = resultats.reduce((sum, r) => sum + parseInt(r.nombre_votes || 0), 0);

  const statutConfig = {
    en_attente: { label: 'En attente', bg: '#fff8e1', color: '#f57c00', dot: '#fbbc04' },
    ouverte:    { label: 'En cours',   bg: '#e6f4ea', color: '#2e7d32', dot: '#34a853' },
    fermee:     { label: 'Terminée',   bg: '#fce8e6', color: '#c62828', dot: '#ea4335' },
    deliberee:  { label: 'Délibérée',  bg: '#e8f0fe', color: '#1a56db', dot: '#1a73e8' },
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

  if (electionSelectionnee) {
    const s = statutConfig[electionSelectionnee.statut] || statutConfig.en_attente;
    return (
      <div>
        <button
          onClick={() => setElectionSelectionnee(null)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#1a73e8',
            fontSize: '14px',
            fontWeight: 600,
            marginBottom: '28px',
            padding: '8px 0',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.7'; e.currentTarget.style.transform = 'translateX(-4px)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateX(0)'; }}
        >
          ← Retour aux élections
        </button>

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

        <div style={{
          background: 'linear-gradient(135deg, #1a73e8 0%, #0d47a1 100%)',
          borderRadius: '28px',
          padding: 'clamp(24px, 5vw, 32px)',
          marginBottom: '32px',
          color: 'white',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h1 style={{ fontSize: 'clamp(20px, 5vw, 26px)', fontWeight: 700, marginBottom: '8px', letterSpacing: '-0.02em' }}>
                {electionSelectionnee.nom}
              </h1>
              <p style={{ opacity: 0.8, fontSize: '13px' }}>
                Année {electionSelectionnee.annee_debut} — {electionSelectionnee.annee_fin}
              </p>
            </div>
            <span style={{
              background: s.bg,
              color: s.color,
              padding: '8px 20px',
              borderRadius: '40px',
              fontSize: '12px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: s.dot,
                display: 'inline-block',
                animation: electionSelectionnee.statut === 'ouverte' ? 'pulse 1.5s infinite' : 'none',
              }} />
              {s.label}
            </span>
          </div>
          <div style={{ marginTop: '24px', display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
            <span style={{ opacity: 0.85, fontSize: '13px' }}>
              👥 {candidats.length} candidat(s)
            </span>
            <span style={{ opacity: 0.85, fontSize: '13px' }}>
              🗳️ {totalVotes} vote(s)
            </span>
            <span style={{ opacity: 0.85, fontSize: '13px' }}>
              💬 {commentaires.length} commentaire(s)
            </span>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px',
          alignItems: 'start',
        }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1a1a2e', marginBottom: '20px' }}>
              Candidats et programmes
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {candidats.length === 0 ? (
                <div style={{
                  background: 'white',
                  borderRadius: '20px',
                  padding: '48px',
                  textAlign: 'center',
                  color: '#9aa0a6',
                  border: '1px solid rgba(0,0,0,0.05)',
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '12px', opacity: 0.5 }}>👤</div>
                  <div style={{ fontWeight: 600 }}>Aucun candidat</div>
                </div>
              ) : (
                candidats.map((candidat) => {
                  const res = resultats.find(r => r.id_candidat === candidat.id_candidat);
                  const nbVotes = parseInt(res?.nombre_votes || 0);
                  const pourcentage = totalVotes > 0 ? Math.round((nbVotes / totalVotes) * 100) : 0;

                  return (
                    <div key={candidat.id_candidat} style={{
                      background: 'white',
                      borderRadius: '20px',
                      padding: '24px',
                      border: '1px solid rgba(0,0,0,0.05)',
                      transition: 'all 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1)',
                    }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = '0 16px 32px -12px rgba(0,0,0,0.15)';
                        e.currentTarget.style.borderColor = '#1a73e8';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                        e.currentTarget.style.borderColor = 'rgba(0,0,0,0.05)';
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                        <div>
                          <div style={{ fontSize: '17px', fontWeight: 700, color: '#1a1a2e', marginBottom: '4px' }}>
                            {candidat.prenom} {candidat.nom}
                          </div>
                          <div style={{ fontSize: '12px', color: '#9aa0a6' }}>
                            {candidat.classe}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '26px', fontWeight: 700, color: '#1a73e8' }}>
                            {nbVotes}
                          </div>
                          <div style={{ fontSize: '11px', color: '#9aa0a6' }}>vote(s)</div>
                        </div>
                      </div>

                      <div style={{
                        background: '#f8f9fa',
                        borderRadius: '14px',
                        padding: '16px',
                        marginBottom: '18px',
                        fontSize: '13px',
                        color: '#5f6368',
                        lineHeight: 1.7,
                        borderLeft: '3px solid #1a73e8',
                      }}>
                        {candidat.programme}
                      </div>

                      {electionSelectionnee.statut === 'ouverte' && (
                        <>
                          <div style={{ marginBottom: '18px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                              <span style={{ fontSize: '12px', color: '#9aa0a6' }}>Progression</span>
                              <span style={{ fontSize: '12px', fontWeight: 700, color: '#1a73e8' }}>{pourcentage}%</span>
                            </div>
                            <div style={{ background: '#f0f0f0', borderRadius: '10px', height: '8px', overflow: 'hidden' }}>
                              <div style={{
                                height: '100%',
                                borderRadius: '10px',
                                background: 'linear-gradient(90deg, #1a73e8, #4285f4)',
                                width: `${pourcentage}%`,
                                transition: 'width 0.6s ease',
                              }} />
                            </div>
                          </div>

                          <button
                            onClick={() => setModalVote(candidat)}
                            disabled={voteEnCours}
                            style={{
                              width: '100%',
                              padding: '12px',
                              background: '#1a73e8',
                              color: 'white',
                              border: 'none',
                              borderRadius: '40px',
                              fontSize: '14px',
                              fontWeight: 600,
                              cursor: voteEnCours ? 'not-allowed' : 'pointer',
                              transition: 'all 0.2s ease',
                              opacity: voteEnCours ? 0.6 : 1,
                            }}
                            onMouseEnter={(e) => { if (!voteEnCours) { e.currentTarget.style.background = '#0d47a1'; e.currentTarget.style.transform = 'translateY(-2px)'; } }}
                            onMouseLeave={(e) => { if (!voteEnCours) { e.currentTarget.style.background = '#1a73e8'; e.currentTarget.style.transform = 'translateY(0)'; } }}
                          >
                            Voter pour ce candidat
                          </button>
                        </>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            <div style={{ marginTop: '40px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1a1a2e', marginBottom: '20px' }}>
                Commentaires ({commentaires.length})
              </h2>

              {electionSelectionnee.statut === 'ouverte' && (
                <form onSubmit={handleCommenter} style={{
                  background: 'white',
                  borderRadius: '20px',
                  padding: '24px',
                  marginBottom: '20px',
                  border: '1px solid rgba(0,0,0,0.05)',
                }}>
                  <select
                    value={candidatCommente}
                    onChange={(e) => setCandidatCommente(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #e0e0e0',
                      borderRadius: '12px',
                      fontSize: '13px',
                      marginBottom: '14px',
                      outline: 'none',
                      color: '#5f6368',
                      background: 'white',
                      transition: 'all 0.2s ease',
                    }}
                    onFocus={(e) => { e.target.style.borderColor = '#1a73e8'; }}
                    onBlur={(e) => { e.target.style.borderColor = '#e0e0e0'; }}
                  >
                    <option value="">Commentaire général sur l'élection</option>
                    {candidats.map(c => (
                      <option key={c.id_candidat} value={c.id_candidat}>
                        Commenter {c.prenom} {c.nom}
                      </option>
                    ))}
                  </select>
                  <textarea
                    value={nouveauCommentaire}
                    onChange={(e) => setNouveauCommentaire(e.target.value)}
                    placeholder="Partagez votre avis..."
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #e0e0e0',
                      borderRadius: '12px',
                      fontSize: '13px',
                      resize: 'vertical',
                      outline: 'none',
                      marginBottom: '14px',
                      boxSizing: 'border-box',
                      transition: 'all 0.2s ease',
                    }}
                    onFocus={(e) => { e.target.style.borderColor = '#1a73e8'; }}
                    onBlur={(e) => { e.target.style.borderColor = '#e0e0e0'; }}
                  />
                  <button
                    type="submit"
                    style={{
                      background: '#1a73e8',
                      color: 'white',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '40px',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#0d47a1'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = '#1a73e8'; e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    Publier
                  </button>
                </form>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
                    <div style={{ fontWeight: 600 }}>Aucun commentaire</div>
                    <div style={{ fontSize: '13px', marginTop: '4px' }}>Soyez le premier à commenter</div>
                  </div>
                ) : (
                  commentaires.map((c) => (
                    <div key={c.id_commentaire} style={{
                      background: 'white',
                      borderRadius: '16px',
                      padding: '18px',
                      border: '1px solid rgba(0,0,0,0.05)',
                      transition: 'all 0.2s ease',
                    }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateX(4px)';
                        e.currentTarget.style.borderLeftColor = '#1a73e8';
                        e.currentTarget.style.borderLeftWidth = '3px';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateX(0)';
                        e.currentTarget.style.borderLeftColor = 'rgba(0,0,0,0.05)';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <div style={{
                          width: '36px',
                          height: '36px',
                          background: '#e8f0fe',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '14px',
                          fontWeight: 700,
                          color: '#1a73e8',
                        }}>
                          {c.nom?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a2e' }}>
                            {c.prenom} {c.nom}
                          </div>
                          {c.candidat_nom && (
                            <div style={{ fontSize: '11px', color: '#1a73e8' }}>
                              À propos de {c.candidat_prenom} {c.candidat_nom}
                            </div>
                          )}
                        </div>
                      </div>
                      <p style={{ fontSize: '13px', color: '#5f6368', lineHeight: 1.6, margin: 0 }}>
                        {c.contenu}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div style={{ position: 'sticky', top: '80px' }}>
            <div style={{
              background: 'white',
              borderRadius: '20px',
              padding: '24px',
              border: '1px solid rgba(0,0,0,0.05)',
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1a1a2e', marginBottom: '20px' }}>
                Résultats en temps réel
              </h3>
              {resultats.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#9aa0a6', padding: '24px 0', fontSize: '13px' }}>
                  Aucun vote pour le moment
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {resultats.map((r, i) => {
                    const pct = totalVotes > 0 ? Math.round((parseInt(r.nombre_votes) / totalVotes) * 100) : 0;
                    return (
                      <div key={r.id_candidat}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a2e' }}>
                            {i === 0 && '🏆 '}{r.prenom} {r.nom}
                          </span>
                          <span style={{ fontSize: '13px', fontWeight: 700, color: '#1a73e8' }}>
                            {pct}%
                          </span>
                        </div>
                        <div style={{ background: '#f0f0f0', borderRadius: '10px', height: '8px', overflow: 'hidden' }}>
                          <div style={{
                            height: '100%',
                            borderRadius: '10px',
                            background: i === 0 ? 'linear-gradient(90deg, #1a73e8, #4285f4)' : '#bdc1c6',
                            width: `${pct}%`,
                            transition: 'width 0.6s ease',
                          }} />
                        </div>
                        <div style={{ fontSize: '11px', color: '#9aa0a6', marginTop: '4px' }}>
                          {r.nombre_votes} vote(s)
                        </div>
                      </div>
                    );
                  })}
                  <div style={{
                    borderTop: '1px solid #f0f0f0',
                    paddingTop: '14px',
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}>
                    <span style={{ fontSize: '13px', color: '#9aa0a6' }}>Total votes</span>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#1a1a2e' }}>{totalVotes}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal vote */}
        {modalVote && (
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
            onClick={() => setModalVote(null)}
          >
            <div
              style={{
                background: 'white',
                borderRadius: '28px',
                maxWidth: '420px',
                width: '100%',
                padding: '32px',
                textAlign: 'center',
                animation: 'fadeInUp 0.3s ease',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{
                width: '60px',
                height: '60px',
                background: '#e8f0fe',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                fontSize: '30px',
              }}>🗳️</div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#1a1a2e', marginBottom: '12px' }}>
                Confirmation de vote
              </h3>
              <p style={{ fontSize: '14px', color: '#6c757d', lineHeight: 1.6, marginBottom: '8px' }}>
                Vous êtes sur le point de voter pour :
              </p>
              <p style={{ fontSize: '18px', fontWeight: 700, color: '#1a73e8', marginBottom: '20px' }}>
                {modalVote.prenom} {modalVote.nom}
              </p>
              <p style={{ fontSize: '13px', color: '#ea4335', marginBottom: '28px' }}>
                Ce vote est définitif et ne pourra pas être modifié
              </p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setModalVote(null)}
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
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#f5f5f5'; }}
                >
                  Annuler
                </button>
                <button
                  onClick={() => { setModalVote(null); handleVoter(modalVote); }}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: '#1a73e8',
                    border: 'none',
                    borderRadius: '40px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    color: 'white',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#0d47a1'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#1a73e8'; }}
                >
                  Confirmer mon vote
                </button>
              </div>
            </div>
          </div>
        )}

        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    );
  }

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
          Élections
        </h1>
        <p style={{ fontSize: '14px', color: '#6c757d' }}>
          Consultez toutes les élections disponibles
        </p>
      </div>

      {elections.length === 0 ? (
        <div style={{
          background: 'white',
          borderRadius: '24px',
          padding: '60px 24px',
          textAlign: 'center',
          color: '#9aa0a6',
          border: '1px solid rgba(0,0,0,0.05)',
        }}>
          <div style={{ fontSize: '56px', marginBottom: '16px', opacity: 0.5 }}>🗳️</div>
          <div style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px', color: '#5f6368' }}>
            Aucune élection disponible
          </div>
          <div style={{ fontSize: '14px' }}>Revenez plus tard</div>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '18px',
        }}>
          {elections.map((election) => {
            const s = statutConfig[election.statut] || statutConfig.en_attente;
            return (
              <div
                key={election.id_election}
                onClick={() => setElectionSelectionnee(election)}
                style={{
                  background: 'white',
                  borderRadius: '20px',
                  padding: '24px',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1)',
                  border: '1px solid rgba(0,0,0,0.05)',
                  borderTop: `4px solid ${s.dot}`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-6px)';
                  e.currentTarget.style.boxShadow = '0 20px 35px -12px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px', flexWrap: 'wrap', gap: '12px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1a1a2e' }}>
                    {election.nom}
                  </h3>
                  <span style={{
                    background: s.bg,
                    color: s.color,
                    padding: '5px 12px',
                    borderRadius: '40px',
                    fontSize: '11px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}>
                    <span style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: s.dot,
                      display: 'inline-block',
                      animation: election.statut === 'ouverte' ? 'pulse 1.5s infinite' : 'none',
                    }} />
                    {s.label}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#9aa0a6', marginBottom: '20px' }}>
                  Année {election.annee_debut} — {election.annee_fin}
                </div>
                <div style={{
                  background: '#f8f9fa',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  fontSize: '13px',
                  color: '#1a73e8',
                  fontWeight: 600,
                  textAlign: 'center',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#1a73e8'; e.currentTarget.style.color = 'white'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#f8f9fa'; e.currentTarget.style.color = '#1a73e8'; }}>
                  Voir les détails
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
      `}</style>
    </div>
  );
}
