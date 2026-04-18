import { useState, useEffect } from 'react';
import { getElections, getCandidats, getResultats, voter } from '../../services/api';
import { io } from 'socket.io-client';

const socket = io('http://192.168.138.42:3000');

export default function Vote() {
  const [elections, setElections] = useState([]);
  const [election, setElection] = useState(null);
  const [candidats, setCandidats] = useState([]);
  const [resultats, setResultats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [voteEnCours, setVoteEnCours] = useState(false);
  const [message, setMessage] = useState(null);
  const [modalVote, setModalVote] = useState(null);

  useEffect(() => {
    fetchElections();
  }, []);

  useEffect(() => {
    if (election) {
      socket.emit('rejoindreElection', election.id_election);
      socket.on('resultatsMAJ', (data) => setResultats(data));
      fetchDetails(election.id_election);
    }
    return () => socket.off('resultatsMAJ');
  }, [election]);

  const fetchElections = async () => {
    try {
      const res = await getElections();
      const ouvertes = res.data.filter(e => e.statut === 'ouverte');
      setElections(ouvertes);
      if (ouvertes.length === 1) setElection(ouvertes[0]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDetails = async (id) => {
    try {
      const [c, r] = await Promise.all([getCandidats(), getResultats(id)]);
      setCandidats(c.data);
      setResultats(r.data.resultats);
    } catch (err) {
      console.error(err);
    }
  };

  const handleVoter = async (candidat) => {
    if (!election) return;
    setVoteEnCours(true);
    setModalVote(null);
    try {
      await voter({ id_candidat: candidat.id_candidat, id_election: election.id_election });
      setMessage({ type: 'success', text: 'Votre vote a été soumis avec succès' });
      fetchDetails(election.id_election);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Erreur lors du vote' });
    } finally {
      setVoteEnCours(false);
      setTimeout(() => setMessage(null), 5000);
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
    </div>
  );

  if (elections.length === 0) return (
    <div>
      <h1 style={{
        fontSize: 'clamp(24px, 6vw, 28px)',
        fontWeight: 700,
        color: '#1a1a2e',
        marginBottom: '8px',
        letterSpacing: '-0.02em',
      }}>
        Voter
      </h1>
      <div style={{
        background: 'white',
        borderRadius: '24px',
        padding: '60px 24px',
        textAlign: 'center',
        color: '#9aa0a6',
        marginTop: '24px',
        border: '1px solid rgba(0,0,0,0.05)',
      }}>
        <div style={{ fontSize: '56px', marginBottom: '16px', opacity: 0.5 }}>🔒</div>
        <div style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px', color: '#5f6368' }}>
          Aucune élection ouverte
        </div>
        <div style={{ fontSize: '14px' }}>Le vote n'est pas disponible pour le moment</div>
      </div>
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
          Voter
        </h1>
        <p style={{ fontSize: '14px', color: '#6c757d' }}>
          Choisissez votre candidat — votre vote est définitif
        </p>
      </div>

      {elections.length > 1 && (
        <div style={{ marginBottom: '24px' }}>
          <select
            value={election?.id_election || ''}
            onChange={(e) => {
              const el = elections.find(el => el.id_election === parseInt(e.target.value));
              setElection(el);
            }}
            style={{
              padding: '12px 18px',
              border: '1px solid #e0e0e0',
              borderRadius: '40px',
              fontSize: '14px',
              outline: 'none',
              background: 'white',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onFocus={(e) => { e.target.style.borderColor = '#1a73e8'; }}
          >
            <option value="">Choisir une élection</option>
            {elections.map(el => (
              <option key={el.id_election} value={el.id_election}>{el.nom}</option>
            ))}
          </select>
        </div>
      )}

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

      {election && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px',
        }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1a1a2e', marginBottom: '20px' }}>
              Choisissez votre candidat
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {candidats.map((candidat) => (
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                    <div style={{
                      width: '52px',
                      height: '52px',
                      background: '#e8f0fe',
                      borderRadius: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px',
                      fontWeight: 700,
                      color: '#1a73e8',
                    }}>
                      {candidat.nom?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: '17px', fontWeight: 700, color: '#1a1a2e' }}>
                        {candidat.prenom} {candidat.nom}
                      </div>
                      <div style={{ fontSize: '12px', color: '#9aa0a6' }}>{candidat.classe}</div>
                    </div>
                  </div>
                  <div style={{
                    background: '#f8f9fa',
                    borderRadius: '14px',
                    padding: '16px',
                    fontSize: '13px',
                    color: '#5f6368',
                    lineHeight: 1.7,
                    borderLeft: '3px solid #1a73e8',
                    marginBottom: '20px',
                  }}>
                    {candidat.programme}
                  </div>
                  <button
                    onClick={() => setModalVote(candidat)}
                    disabled={voteEnCours}
                    style={{
                      width: '100%',
                      padding: '14px',
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
                </div>
              ))}
            </div>
          </div>

          <div style={{ position: 'sticky', top: '80px' }}>
            <div style={{
              background: 'white',
              borderRadius: '20px',
              padding: '24px',
              border: '1px solid rgba(0,0,0,0.05)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <span style={{
                  width: '8px',
                  height: '8px',
                  background: '#34a853',
                  borderRadius: '50%',
                  display: 'inline-block',
                  animation: 'pulse 1.5s infinite',
                }} />
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1a1a2e' }}>
                  Résultats en direct
                </h3>
              </div>
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
                    <span style={{ fontSize: '13px', color: '#9aa0a6' }}>Total</span>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#1a1a2e' }}>{totalVotes} votes</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
              maxWidth: '400px',
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
                onClick={() => handleVoter(modalVote)}
                disabled={voteEnCours}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#1a73e8',
                  border: 'none',
                  borderRadius: '40px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: voteEnCours ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  color: 'white',
                }}
                onMouseEnter={(e) => { if (!voteEnCours) e.currentTarget.style.background = '#0d47a1'; }}
                onMouseLeave={(e) => { if (!voteEnCours) e.currentTarget.style.background = '#1a73e8'; }}
              >
                Confirmer mon vote
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
