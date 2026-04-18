import { useState, useEffect } from 'react';
import { getCandidatsAdmin, validerCandidat, rejeterCandidat, getElections } from '../../services/api';

export default function GererCandidats() {
  const [candidats, setCandidats] = useState([]);
  const [elections, setElections] = useState([]);
  const [electionChoisie, setElectionChoisie] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [filtre, setFiltre] = useState('tous');
  const [modalAction, setModalAction] = useState(null);

  useEffect(() => { fetchElections(); }, []);

  useEffect(() => {
    if (electionChoisie) {
      fetchCandidats(electionChoisie);
    }
  }, [electionChoisie]);

  const fetchElections = async () => {
    try {
      const res = await getElections();
      setElections(res.data);
      const ouverte = res.data.find(e => e.statut === 'ouverte');
      if (ouverte) setElectionChoisie(ouverte.id_election);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCandidats = async (id_election) => {
    setLoading(true);
    try {
      const res = await getCandidatsAdmin(id_election);
      setCandidats(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleValider = async (id) => {
    setModalAction(null);
    try {
      await validerCandidat(id);
      setMessage({ type: 'success', text: 'Candidature validée' });
      fetchCandidats(electionChoisie);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Erreur' });
    }
    setTimeout(() => setMessage(null), 4000);
  };

  const handleRejeter = async (id) => {
    setModalAction(null);
    try {
      await rejeterCandidat(id);
      setMessage({ type: 'success', text: 'Candidature rejetée' });
      fetchCandidats(electionChoisie);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Erreur' });
    }
    setTimeout(() => setMessage(null), 4000);
  };

  const statutConfig = {
    en_attente: { label: 'En attente', bg: '#fff8e1', color: '#f57c00', dot: '#fbbc04' },
    valide:     { label: 'Validée',    bg: '#e6f4ea', color: '#2e7d32', dot: '#34a853' },
    rejete:     { label: 'Rejetée',    bg: '#fce8e6', color: '#c62828', dot: '#ea4335' },
  };

  const candidatsFiltres = filtre === 'tous'
    ? candidats
    : candidats.filter(c => c.statut === filtre);

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
          Gestion des candidatures
        </h1>
        <p style={{ fontSize: '14px', color: '#6c757d' }}>
          Validez ou rejetez les candidatures par élection
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

      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
        <select
          value={electionChoisie}
          onChange={(e) => { setElectionChoisie(e.target.value); setFiltre('tous'); }}
          style={{
            padding: '12px 18px',
            border: '1px solid #e0e0e0',
            borderRadius: '40px',
            fontSize: '14px',
            outline: 'none',
            background: 'white',
            minWidth: '280px',
            fontWeight: 500,
            transition: 'all 0.2s ease',
          }}
          onFocus={(e) => { e.target.style.borderColor = '#1a73e8'; }}
        >
          <option value="">Toutes les élections</option>
          {elections.map(el => {
            const config = {
              en_attente: 'En attente',
              ouverte:    'Ouverte',
              fermee:     'Fermée',
              deliberee:  'Délibérée',
            };
            return (
              <option key={el.id_election} value={el.id_election}>
                {el.nom} — {config[el.statut]}
              </option>
            );
          })}
        </select>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { id: 'tous',       label: `Tous (${candidats.length})` },
            { id: 'en_attente', label: `En attente (${candidats.filter(c => c.statut === 'en_attente').length})` },
            { id: 'valide',     label: `Validées (${candidats.filter(c => c.statut === 'valide').length})` },
            { id: 'rejete',     label: `Rejetées (${candidats.filter(c => c.statut === 'rejete').length})` },
          ].map(f => (
            <button key={f.id} onClick={() => setFiltre(f.id)}
              style={{
                padding: '10px 20px',
                borderRadius: '40px',
                border: 'none',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                background: filtre === f.id ? '#1a73e8' : '#f8f9fa',
                color: filtre === f.id ? 'white' : '#5f6368',
              }}
              onMouseEnter={(e) => {
                if (filtre !== f.id) e.currentTarget.style.background = '#e8f0fe';
              }}
              onMouseLeave={(e) => {
                if (filtre !== f.id) e.currentTarget.style.background = '#f8f9fa';
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px' }}>
          <div style={{
            width: '40px', height: '40px',
            border: '2px solid #e8f0fe',
            borderTopColor: '#1a73e8',
            borderRadius: '50%',
            animation: 'spin 0.6s linear infinite',
          }} />
        </div>
      ) : candidatsFiltres.length === 0 ? (
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '60px',
          textAlign: 'center',
          color: '#9aa0a6',
          border: '1px solid rgba(0,0,0,0.05)',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '12px', opacity: 0.5 }}>👥</div>
          <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '6px', color: '#5f6368' }}>
            Aucune candidature
          </div>
          <div style={{ fontSize: '13px' }}>
            {electionChoisie ? 'Aucune candidature pour cette élection' : 'Sélectionnez une élection'}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {candidatsFiltres.map((candidat) => {
            const s = statutConfig[candidat.statut] || statutConfig.en_attente;
            return (
              <div key={candidat.id_candidat} style={{
                background: 'white',
                borderRadius: '20px',
                padding: '24px',
                border: '1px solid rgba(0,0,0,0.05)',
                borderLeft: `4px solid ${s.dot}`,
                transition: 'all 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1)',
              }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 12px 28px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
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
                      <div style={{ fontSize: '16px', fontWeight: 700, color: '#1a1a2e', marginBottom: '4px' }}>
                        {candidat.prenom} {candidat.nom}
                      </div>
                      <div style={{ fontSize: '12px', color: '#9aa0a6', marginBottom: '2px' }}>{candidat.email}</div>
                      <div style={{ fontSize: '12px', color: '#1a73e8', fontWeight: 600 }}>
                        {candidat.classe}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <span style={{
                      background: s.bg,
                      color: s.color,
                      padding: '6px 14px',
                      borderRadius: '40px',
                      fontSize: '12px',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}>
                      <span style={{
                        width: '6px',
                        height: '6px',
                        background: s.dot,
                        borderRadius: '50%',
                        display: 'inline-block',
                      }} />
                      {s.label}
                    </span>

                    {candidat.statut === 'en_attente' && (
                      <>
                        <button onClick={() => setModalAction({ type: 'valider', id: candidat.id_candidat, nom: `${candidat.prenom} ${candidat.nom}` })}
                          style={{
                            background: '#e6f4ea',
                            color: '#2e7d32',
                            border: 'none',
                            padding: '8px 20px',
                            borderRadius: '40px',
                            fontSize: '13px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = '#34a853'; e.currentTarget.style.color = 'white'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = '#e6f4ea'; e.currentTarget.style.color = '#2e7d32'; }}
                        >
                          Valider
                        </button>
                        <button onClick={() => setModalAction({ type: 'rejeter', id: candidat.id_candidat, nom: `${candidat.prenom} ${candidat.nom}` })}
                          style={{
                            background: '#fce8e6',
                            color: '#c62828',
                            border: 'none',
                            padding: '8px 20px',
                            borderRadius: '40px',
                            fontSize: '13px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = '#ea4335'; e.currentTarget.style.color = 'white'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = '#fce8e6'; e.currentTarget.style.color = '#c62828'; }}
                        >
                          Rejeter
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div style={{
                  background: '#f8f9fa',
                  borderRadius: '14px',
                  padding: '14px 18px',
                  marginTop: '18px',
                  fontSize: '13px',
                  color: '#5f6368',
                  lineHeight: 1.7,
                  borderLeft: '3px solid #1a73e8',
                }}>
                  {candidat.programme}
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
              background: modalAction.type === 'valider' ? '#e6f4ea' : '#fce8e6',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              fontSize: '28px',
            }}>
              {modalAction.type === 'valider' ? '✅' : '❌'}
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#1a1a2e', marginBottom: '12px' }}>
              {modalAction.type === 'valider' ? 'Valider la candidature' : 'Rejeter la candidature'}
            </h3>
            <p style={{ fontSize: '14px', color: '#6c757d', lineHeight: 1.6, marginBottom: '28px' }}>
              Êtes-vous sûr de vouloir {modalAction.type === 'valider' ? 'valider' : 'rejeter'} la candidature de <strong>{modalAction.nom}</strong> ?
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
                onClick={() => modalAction.type === 'valider' ? handleValider(modalAction.id) : handleRejeter(modalAction.id)}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: modalAction.type === 'valider' ? '#34a853' : '#ea4335',
                  border: 'none',
                  borderRadius: '40px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  color: 'white',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = modalAction.type === 'valider' ? '#2e7d32' : '#c62828'; }}
              >
                {modalAction.type === 'valider' ? 'Valider' : 'Rejeter'}
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
