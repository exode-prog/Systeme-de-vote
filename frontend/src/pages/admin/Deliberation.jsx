import { useState, useEffect } from 'react';
import { getElections, getResultats, delibererElection } from '../../services/api';

export default function Deliberation() {
  const [elections, setElections] = useState([]);
  const [electionChoisie, setElectionChoisie] = useState(null);
  const [resultats, setResultats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingResultats, setLoadingResultats] = useState(false);
  const [deliberating, setDeliberating] = useState(false);
  const [message, setMessage] = useState(null);
  const [gagnant, setGagnant] = useState(null);
  const [modalConfirmation, setModalConfirmation] = useState(false);

  useEffect(() => { fetchElections(); }, []);

  const fetchElections = async () => {
    try {
      const res = await getElections();
      const eligibles = res.data.filter(e =>
        e.statut === 'fermee' || e.statut === 'deliberee'
      );
      setElections(eligibles);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChoisirElection = async (election) => {
    setElectionChoisie(election);
    setGagnant(null);
    setLoadingResultats(true);
    try {
      const res = await getResultats(election.id_election);
      setResultats(res.data.resultats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingResultats(false);
    }
  };

  const handleDeliberer = async () => {
    if (!electionChoisie) return;
    setModalConfirmation(false);
    setDeliberating(true);
    try {
      const res = await delibererElection(electionChoisie.id_election);
      setGagnant(res.data.gagnant);
      setMessage({ type: 'success', text: 'Délibération effectuée — Emails envoyés à tous les participants' });
      setResultats(res.data.resultats);
      fetchElections();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Erreur lors de la délibération' });
    } finally {
      setDeliberating(false);
      setTimeout(() => setMessage(null), 6000);
    }
  };

  const totalVotes = resultats.reduce((sum, r) => sum + parseInt(r.nombre_votes || 0), 0);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
      <div style={{
        width: '40px', height: '40px',
        border: '2px solid #e8f0fe',
        borderTopColor: '#1a73e8',
        borderRadius: '50%',
        animation: 'spin 0.6s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
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
          Délibération
        </h1>
        <p style={{ fontSize: '14px', color: '#6c757d' }}>
          Délibérez les élections terminées et notifiez les participants
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

      {gagnant && (
        <div style={{
          background: 'linear-gradient(135deg, #fbbc04, #f57c00)',
          borderRadius: '24px',
          padding: '32px',
          marginBottom: '28px',
          color: 'white',
          textAlign: 'center',
          boxShadow: '0 8px 24px rgba(251,188,4,0.3)',
          transition: 'all 0.3s ease',
        }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          <div style={{ fontSize: '52px', marginBottom: '16px' }}>🏆</div>
          <div style={{ fontSize: 'clamp(22px, 5vw, 28px)', fontWeight: 800, marginBottom: '8px' }}>
            {gagnant.prenom} {gagnant.nom}
          </div>
          <div style={{ opacity: 0.9, fontSize: '14px', marginBottom: '10px' }}>
            Est élu(e) avec {gagnant.nombre_votes} vote(s)
          </div>
          <div style={{ opacity: 0.8, fontSize: '13px' }}>
            Emails envoyés à tous les participants
          </div>
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '28px',
        alignItems: 'start',
      }}>
        <div>
          <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#1a1a2e', marginBottom: '18px' }}>
            Elections éligibles
          </h2>

          {elections.length === 0 ? (
            <div style={{
              background: 'white',
              borderRadius: '20px',
              padding: '48px',
              textAlign: 'center',
              color: '#9aa0a6',
              border: '1px solid rgba(0,0,0,0.05)',
            }}>
              <div style={{ fontSize: '48px', marginBottom: '12px', opacity: 0.5 }}>🔒</div>
              <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '6px', color: '#5f6368' }}>
                Aucune élection à délibérer
              </div>
              <div style={{ fontSize: '13px' }}>
                Fermez d'abord une élection pour pouvoir délibérer
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {elections.map((election) => (
                <div
                  key={election.id_election}
                  onClick={() => handleChoisirElection(election)}
                  style={{
                    background: electionChoisie?.id_election === election.id_election ? '#f0f7ff' : 'white',
                    borderRadius: '18px',
                    padding: '20px',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1)',
                    border: '1px solid rgba(0,0,0,0.05)',
                    borderLeft: electionChoisie?.id_election === election.id_election
                      ? '4px solid #1a73e8'
                      : '4px solid transparent',
                  }}
                  onMouseEnter={(e) => {
                    if (electionChoisie?.id_election !== election.id_election) {
                      e.currentTarget.style.transform = 'translateX(4px)';
                      e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.08)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (electionChoisie?.id_election !== election.id_election) {
                      e.currentTarget.style.transform = 'translateX(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: '#1a1a2e', marginBottom: '4px' }}>
                        {election.nom}
                      </div>
                      <div style={{ fontSize: '12px', color: '#9aa0a6' }}>
                        Année {election.annee_debut} — {election.annee_fin}
                      </div>
                    </div>
                    <span style={{
                      background: election.statut === 'deliberee' ? '#e8f0fe' : '#fce8e6',
                      color: election.statut === 'deliberee' ? '#1a56db' : '#c62828',
                      padding: '5px 14px',
                      borderRadius: '40px',
                      fontSize: '11px',
                      fontWeight: 600,
                    }}>
                      {election.statut === 'deliberee' ? 'Délibérée' : 'Fermée'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          {electionChoisie ? (
            <div>
              <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#1a1a2e', marginBottom: '18px' }}>
                Résultats — {electionChoisie.nom}
              </h2>

              {loadingResultats ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
                  <div style={{
                    width: '32px', height: '32px',
                    border: '2px solid #e8f0fe',
                    borderTopColor: '#1a73e8',
                    borderRadius: '50%',
                    animation: 'spin 0.6s linear infinite',
                  }} />
                </div>
              ) : (
                <div>
                  <div style={{
                    background: 'white',
                    borderRadius: '20px',
                    padding: '24px',
                    border: '1px solid rgba(0,0,0,0.05)',
                    marginBottom: '20px',
                  }}>
                    {resultats.length === 0 ? (
                      <div style={{ textAlign: 'center', color: '#9aa0a6', padding: '32px' }}>
                        <div style={{ fontSize: '40px', marginBottom: '12px', opacity: 0.5 }}>🗳️</div>
                        <div style={{ fontWeight: 600 }}>Aucun vote enregistré</div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                        {resultats.map((r, i) => {
                          const pct = totalVotes > 0
                            ? Math.round((parseInt(r.nombre_votes) / totalVotes) * 100) : 0;
                          const isFirst = i === 0;
                          return (
                            <div key={r.id_candidat} style={{
                              padding: '16px',
                              borderRadius: '14px',
                              background: isFirst ? '#fff8e1' : '#f8f9fa',
                              border: isFirst ? '2px solid #fbbc04' : '2px solid transparent',
                              transition: 'all 0.2s ease',
                            }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateX(4px)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateX(0)';
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                                <div>
                                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#1a1a2e' }}>
                                    {r.prenom} {r.nom}
                                  </div>
                                  <div style={{ fontSize: '12px', color: '#9aa0a6' }}>
                                    {r.nombre_votes} vote(s)
                                  </div>
                                </div>
                                <div style={{ fontSize: '22px', fontWeight: 700, color: isFirst ? '#f57c00' : '#9aa0a6' }}>
                                  {pct}%
                                </div>
                              </div>
                              <div style={{ background: '#e0e0e0', borderRadius: '10px', height: '8px', overflow: 'hidden' }}>
                                <div style={{
                                  height: '100%',
                                  borderRadius: '10px',
                                  background: isFirst ? 'linear-gradient(90deg, #fbbc04, #f57c00)' : '#bdc1c6',
                                  width: `${pct}%`,
                                  transition: 'width 0.6s ease',
                                }} />
                              </div>
                            </div>
                          );
                        })}

                        <div style={{
                          borderTop: '1px solid #f0f0f0',
                          paddingTop: '16px',
                          display: 'flex',
                          justifyContent: 'space-between',
                        }}>
                          <span style={{ fontSize: '13px', color: '#9aa0a6' }}>Total des votes</span>
                          <span style={{ fontSize: '16px', fontWeight: 700, color: '#1a1a2e' }}>
                            {totalVotes}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {electionChoisie.statut === 'fermee' && (
                    <button
                      onClick={() => setModalConfirmation(true)}
                      disabled={deliberating || resultats.length === 0}
                      style={{
                        width: '100%',
                        padding: '14px',
                        background: deliberating || resultats.length === 0
                          ? '#9aa0a6'
                          : 'linear-gradient(135deg, #fbbc04, #f57c00)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '40px',
                        fontSize: '15px',
                        fontWeight: 700,
                        cursor: deliberating || resultats.length === 0 ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: deliberating ? 'none' : '0 4px 16px rgba(251,188,4,0.4)',
                      }}
                      onMouseEnter={(e) => {
                        if (!deliberating && resultats.length > 0) {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 8px 24px rgba(251,188,4,0.5)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 16px rgba(251,188,4,0.4)';
                      }}
                    >
                      {deliberating ? 'Délibération en cours...' : 'Lancer la délibération et envoyer les emails'}
                    </button>
                  )}

                  {electionChoisie.statut === 'deliberee' && (
                    <div style={{
                      background: '#e6f4ea',
                      borderRadius: '14px',
                      padding: '14px',
                      textAlign: 'center',
                      color: '#2e7d32',
                      fontSize: '14px',
                      fontWeight: 600,
                    }}>
                      Cette élection a déjà été délibérée
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div style={{
              background: 'white',
              borderRadius: '20px',
              padding: '48px',
              textAlign: 'center',
              color: '#9aa0a6',
              border: '1px solid rgba(0,0,0,0.05)',
            }}>
              <div style={{ fontSize: '48px', marginBottom: '12px', opacity: 0.5 }}>👈</div>
              <div style={{ fontSize: '15px', fontWeight: 600, color: '#5f6368', marginBottom: '6px' }}>
                Sélectionnez une élection
              </div>
              <div style={{ fontSize: '13px' }}>
                Choisissez une élection fermée pour voir les résultats et délibérer
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal confirmation */}
      {modalConfirmation && (
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
          onClick={() => setModalConfirmation(false)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '28px',
              maxWidth: '400px',
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
              Confirmation de délibération
            </h3>
            <p style={{ fontSize: '14px', color: '#6c757d', lineHeight: 1.6, marginBottom: '28px' }}>
              Voulez-vous vraiment délibérer "{electionChoisie?.nom}" ? Cette action est irréversible et enverra un email à tous les participants.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setModalConfirmation(false)}
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
                onClick={handleDeliberer}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#fbbc04',
                  border: 'none',
                  borderRadius: '40px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  color: '#5f6368',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#f57c00'; e.currentTarget.style.color = 'white'; }}
              >
                Confirmer
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
