import { useState, useEffect } from 'react';
import {
  getElections, creerElection, ouvrirElection,
  fermerElection, getAnneesAcademiques, getResultats
} from '../../services/api';

export default function GererElections() {
  const [elections, setElections] = useState([]);
  const [annees, setAnnees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [detail, setDetail] = useState(null);
  const [resultats, setResultats] = useState([]);
  const [nom, setNom] = useState('');
  const [idAnnee, setIdAnnee] = useState('');
  const [modalAction, setModalAction] = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [e, a] = await Promise.all([getElections(), getAnneesAcademiques()]);
      setElections(e.data);
      setAnnees(a.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreer = async (e) => {
    e.preventDefault();
    if (!nom.trim() || !idAnnee) return;
    setSubmitting(true);
    try {
      await creerElection({ nom, id_anneeAcademique: parseInt(idAnnee) });
      setMessage({ type: 'success', text: 'Élection créée avec succès' });
      setNom('');
      setIdAnnee('');
      setShowForm(false);
      fetchData();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Erreur' });
    } finally {
      setSubmitting(false);
      setTimeout(() => setMessage(null), 4000);
    }
  };

  const handleOuvrir = async (id) => {
    setModalAction(null);
    try {
      await ouvrirElection(id);
      setMessage({ type: 'success', text: 'Élection ouverte' });
      fetchData();
      if (detail?.id_election === id) {
        setDetail(prev => ({ ...prev, statut: 'ouverte' }));
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Erreur' });
    }
    setTimeout(() => setMessage(null), 3000);
  };

  const handleFermer = async (id) => {
    setModalAction(null);
    try {
      await fermerElection(id);
      setMessage({ type: 'success', text: 'Élection fermée' });
      fetchData();
      if (detail?.id_election === id) {
        setDetail(prev => ({ ...prev, statut: 'fermee' }));
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Erreur' });
    }
    setTimeout(() => setMessage(null), 3000);
  };

  const handleVoirDetail = async (election) => {
    setDetail(election);
    try {
      const res = await getResultats(election.id_election);
      setResultats(res.data.resultats);
    } catch (err) {
      setResultats([]);
    }
  };

  const totalVotes = resultats.reduce((sum, r) => sum + parseInt(r.nombre_votes || 0), 0);

  const statutConfig = {
    en_attente: { label: 'En attente', bg: '#fff8e1', color: '#f57c00', dot: '#fbbc04' },
    ouverte:    { label: 'En cours',   bg: '#e6f4ea', color: '#2e7d32', dot: '#34a853' },
    fermee:     { label: 'Terminée',   bg: '#fce8e6', color: '#c62828', dot: '#ea4335' },
    deliberee:  { label: 'Délibérée',  bg: '#e8f0fe', color: '#1a56db', dot: '#1a73e8' },
  };

  const stats = {
    total:      elections.length,
    en_attente: elections.filter(e => e.statut === 'en_attente').length,
    ouverte:    elections.filter(e => e.statut === 'ouverte').length,
    fermee:     elections.filter(e => e.statut === 'fermee').length,
    deliberee:  elections.filter(e => e.statut === 'deliberee').length,
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
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (detail) {
    const s = statutConfig[detail.statut] || statutConfig.en_attente;
    return (
      <div>
        <button
          onClick={() => { setDetail(null); setResultats([]); }}
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
          marginBottom: '28px',
          color: 'white',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h1 style={{ fontSize: 'clamp(20px, 5vw, 24px)', fontWeight: 700, marginBottom: '8px', letterSpacing: '-0.02em' }}>
                {detail.nom}
              </h1>
              <div style={{ opacity: 0.8, fontSize: '13px', marginBottom: '16px' }}>
                Année {detail.annee_debut} — {detail.annee_fin}
              </div>
              <span style={{
                background: s.bg,
                color: s.color,
                padding: '6px 16px',
                borderRadius: '40px',
                fontSize: '12px',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <span style={{
                  width: '8px',
                  height: '8px',
                  background: s.dot,
                  borderRadius: '50%',
                  display: 'inline-block',
                  animation: detail.statut === 'ouverte' ? 'pulse 1.5s infinite' : 'none',
                }} />
                {s.label}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {detail.statut === 'en_attente' && (
                <button
                  onClick={() => setModalAction({ type: 'ouvrir', id: detail.id_election, nom: detail.nom })}
                  style={{
                    background: '#34a853',
                    color: 'white',
                    border: 'none',
                    padding: '12px 28px',
                    borderRadius: '40px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 12px rgba(52,168,83,0.4)',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#2e7d32'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#34a853'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  Ouvrir l'élection
                </button>
              )}
              {detail.statut === 'ouverte' && (
                <button
                  onClick={() => setModalAction({ type: 'fermer', id: detail.id_election, nom: detail.nom })}
                  style={{
                    background: '#ea4335',
                    color: 'white',
                    border: 'none',
                    padding: '12px 28px',
                    borderRadius: '40px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 12px rgba(234,67,53,0.4)',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#c62828'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#ea4335'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  Fermer l'élection
                </button>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '24px', marginTop: '28px', flexWrap: 'wrap' }}>
            <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '14px', padding: '12px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: '26px', fontWeight: 700 }}>{totalVotes}</div>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>Votes</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '14px', padding: '12px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: '26px', fontWeight: 700 }}>{resultats.length}</div>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>Candidats</div>
            </div>
          </div>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '24px',
          padding: '24px',
          border: '1px solid rgba(0,0,0,0.05)',
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1a1a2e', marginBottom: '20px' }}>
            Résultats actuels
          </h2>
          {resultats.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#9aa0a6', padding: '40px' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px', opacity: 0.5 }}>🗳️</div>
              <div style={{ fontWeight: 600 }}>Aucun vote enregistré</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {resultats.map((r, i) => {
                const pct = totalVotes > 0 ? Math.round((parseInt(r.nombre_votes) / totalVotes) * 100) : 0;
                const isFirst = i === 0;
                return (
                  <div key={r.id_candidat} style={{
                    padding: '16px',
                    borderRadius: '14px',
                    background: isFirst ? '#fff8e1' : '#f8f9fa',
                    border: isFirst ? '2px solid #fbbc04' : '2px solid transparent',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
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
                        width: `${pct}%`,
                        background: isFirst ? 'linear-gradient(90deg, #fbbc04, #f57c00)' : '#bdc1c6',
                        transition: 'width 0.6s ease',
                      }} />
                    </div>
                  </div>
                );
              })}
              <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '16px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', color: '#9aa0a6' }}>Total des votes</span>
                <span style={{ fontSize: '16px', fontWeight: 700, color: '#1a1a2e' }}>{totalVotes}</span>
              </div>
            </div>
          )}
        </div>

        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        `}</style>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{
            fontSize: 'clamp(24px, 6vw, 28px)',
            fontWeight: 700,
            color: '#1a1a2e',
            marginBottom: '6px',
            letterSpacing: '-0.02em',
          }}>
            Gestion des élections
          </h1>
          <p style={{ fontSize: '14px', color: '#6c757d' }}>
            Créez et gérez toutes les élections
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            background: '#1a73e8',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '40px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 12px rgba(26,115,232,0.3)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#0d47a1';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#1a73e8';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          {showForm ? 'Annuler' : 'Nouvelle élection'}
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '14px',
        marginBottom: '28px',
      }}>
        {[
          { label: 'Total',      value: stats.total,      color: '#1a73e8', bg: '#e8f0fe' },
          { label: 'En attente', value: stats.en_attente, color: '#f57c00', bg: '#fff8e1' },
          { label: 'En cours',   value: stats.ouverte,    color: '#2e7d32', bg: '#e6f4ea' },
          { label: 'Terminées',  value: stats.fermee,     color: '#c62828', bg: '#fce8e6' },
          { label: 'Délibérées', value: stats.deliberee,  color: '#1a56db', bg: '#e8f0fe' },
        ].map((s, i) => (
          <div key={i} style={{
            background: 'white',
            borderRadius: '18px',
            padding: '18px',
            border: '1px solid rgba(0,0,0,0.05)',
            borderTop: `3px solid ${s.color}`,
            transition: 'all 0.2s ease',
          }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '28px', fontWeight: 700, color: '#1a1a2e' }}>{s.value}</div>
                <div style={{ fontSize: '11px', color: '#9aa0a6', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                  {s.label}
                </div>
              </div>
              <div style={{
                width: '36px',
                height: '36px',
                background: s.bg,
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
              }}>📊</div>
            </div>
          </div>
        ))}
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

      {showForm && (
        <div style={{
          background: 'white',
          borderRadius: '24px',
          padding: 'clamp(24px, 5vw, 32px)',
          marginBottom: '28px',
          border: '1px solid rgba(0,0,0,0.05)',
          borderTop: '4px solid #1a73e8',
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1a1a2e', marginBottom: '24px' }}>
            Créer une nouvelle élection
          </h2>
          <form onSubmit={handleCreer}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '24px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
                  Nom de l'élection
                </label>
                <input
                  type="text"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  placeholder="Ex: Élection Bureau Étudiant 2025"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '12px',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'all 0.2s ease',
                  }}
                  onFocus={(e) => { e.target.style.borderColor = '#1a73e8'; }}
                  onBlur={(e) => { e.target.style.borderColor = '#e0e0e0'; }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
                  Année académique
                </label>
                {annees.length === 0 ? (
                  <div style={{
                    padding: '12px 16px',
                    background: '#fff8e1',
                    border: '1px solid #fbbc04',
                    borderRadius: '12px',
                    fontSize: '13px',
                    color: '#f57c00',
                  }}>
                    Aucune année académique disponible
                  </div>
                ) : (
                  <select
                    value={idAnnee}
                    onChange={(e) => setIdAnnee(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #e0e0e0',
                      borderRadius: '12px',
                      fontSize: '14px',
                      outline: 'none',
                      background: 'white',
                      transition: 'all 0.2s ease',
                    }}
                    onFocus={(e) => { e.target.style.borderColor = '#1a73e8'; }}
                  >
                    <option value="">Choisir une année</option>
                    {annees.map(a => (
                      <option key={a.id_anneeacademique} value={a.id_anneeacademique}>
                        {a.annee_debut} — {a.annee_fin}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <div style={{
              background: '#f8f9fa',
              borderRadius: '14px',
              padding: '16px',
              marginBottom: '24px',
              fontSize: '13px',
              color: '#5f6368',
            }}>
              <div style={{ fontWeight: 600, marginBottom: '10px', color: '#1a1a2e' }}>Processus d'une élection</div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                {['Créer', 'Ouvrir', 'Vote en cours', 'Fermer', 'Délibérer'].map((step, i, arr) => (
                  <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      background: '#e8f0fe',
                      color: '#1a73e8',
                      padding: '4px 12px',
                      borderRadius: '8px',
                      fontWeight: 600,
                      fontSize: '12px',
                    }}>
                      {step}
                    </span>
                    {i < arr.length - 1 && <span style={{ color: '#9aa0a6' }}>→</span>}
                  </span>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              style={{
                background: submitting ? '#9aa0a6' : '#1a73e8',
                color: 'white',
                border: 'none',
                padding: '14px 32px',
                borderRadius: '40px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: submitting ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => { if (!submitting) e.currentTarget.style.background = '#0d47a1'; }}
            >
              {submitting ? 'Création en cours...' : 'Créer l\'élection'}
            </button>
          </form>
        </div>
      )}

      {elections.length === 0 ? (
        <div style={{
          background: 'white',
          borderRadius: '24px',
          padding: '60px',
          textAlign: 'center',
          color: '#9aa0a6',
          border: '1px solid rgba(0,0,0,0.05)',
        }}>
          <div style={{ fontSize: '56px', marginBottom: '16px', opacity: 0.5 }}>🗳️</div>
          <div style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px', color: '#5f6368' }}>
            Aucune élection
          </div>
          <div style={{ fontSize: '14px' }}>Créez votre première élection</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {elections.map((election) => {
            const s = statutConfig[election.statut] || statutConfig.en_attente;
            return (
              <div key={election.id_election} style={{
                background: 'white',
                borderRadius: '18px',
                padding: '22px',
                border: '1px solid rgba(0,0,0,0.05)',
                borderLeft: `4px solid ${s.dot}`,
                transition: 'all 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1)',
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px', flexWrap: 'wrap' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1a1a2e' }}>
                        {election.nom}
                      </h3>
                      <span style={{
                        background: s.bg,
                        color: s.color,
                        padding: '4px 12px',
                        borderRadius: '40px',
                        fontSize: '11px',
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}>
                        <span style={{
                          width: '6px',
                          height: '6px',
                          background: s.dot,
                          borderRadius: '50%',
                          display: 'inline-block',
                          animation: election.statut === 'ouverte' ? 'pulse 1.5s infinite' : 'none',
                        }} />
                        {s.label}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#9aa0a6' }}>
                      Année {election.annee_debut} — {election.annee_fin}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => handleVoirDetail(election)}
                      style={{
                        background: '#e8f0fe',
                        color: '#1a73e8',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '40px',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#1a73e8'; e.currentTarget.style.color = 'white'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = '#e8f0fe'; e.currentTarget.style.color = '#1a73e8'; }}
                    >
                      Détails
                    </button>

                    {election.statut === 'en_attente' && (
                      <button
                        onClick={() => setModalAction({ type: 'ouvrir', id: election.id_election, nom: election.nom })}
                        style={{
                          background: '#e6f4ea',
                          color: '#2e7d32',
                          border: 'none',
                          padding: '10px 20px',
                          borderRadius: '40px',
                          fontSize: '13px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#34a853'; e.currentTarget.style.color = 'white'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = '#e6f4ea'; e.currentTarget.style.color = '#2e7d32'; }}
                      >
                        Ouvrir
                      </button>
                    )}

                    {election.statut === 'ouverte' && (
                      <button
                        onClick={() => setModalAction({ type: 'fermer', id: election.id_election, nom: election.nom })}
                        style={{
                          background: '#fce8e6',
                          color: '#c62828',
                          border: 'none',
                          padding: '10px 20px',
                          borderRadius: '40px',
                          fontSize: '13px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#ea4335'; e.currentTarget.style.color = 'white'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = '#fce8e6'; e.currentTarget.style.color = '#c62828'; }}
                      >
                        Fermer
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal confirmation */}
      {modalAction && (
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
          onClick={() => setModalAction(null)}
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
              background: modalAction.type === 'ouvrir' ? '#e6f4ea' : '#fce8e6',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              fontSize: '28px',
            }}>
              {modalAction.type === 'ouvrir' ? '🟢' : '🔴'}
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#1a1a2e', marginBottom: '12px' }}>
              {modalAction.type === 'ouvrir' ? 'Ouvrir l\'élection' : 'Fermer l\'élection'}
            </h3>
            <p style={{ fontSize: '14px', color: '#6c757d', lineHeight: 1.6, marginBottom: '28px' }}>
              Êtes-vous sûr de vouloir {modalAction.type === 'ouvrir' ? 'ouvrir' : 'fermer'} l'élection "{modalAction.nom}" ?
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setModalAction(null)}
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
                onClick={() => modalAction.type === 'ouvrir' ? handleOuvrir(modalAction.id) : handleFermer(modalAction.id)}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: modalAction.type === 'ouvrir' ? '#34a853' : '#ea4335',
                  border: 'none',
                  borderRadius: '40px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  color: 'white',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = modalAction.type === 'ouvrir' ? '#2e7d32' : '#c62828'; }}
              >
                {modalAction.type === 'ouvrir' ? 'Ouvrir' : 'Fermer'}
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
