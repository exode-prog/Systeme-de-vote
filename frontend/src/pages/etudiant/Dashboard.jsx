import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getElections, getCandidats } from '../../services/api';

const StatCard = ({ label, value, color }) => (
  <div style={{
    background: 'white',
    borderRadius: '20px',
    padding: '28px 20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    transition: 'all 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1)',
    cursor: 'default',
    border: '1px solid rgba(0,0,0,0.03)',
  }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-6px)';
      e.currentTarget.style.boxShadow = '0 20px 35px -12px rgba(0,0,0,0.15)';
      e.currentTarget.style.borderColor = color;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
      e.currentTarget.style.borderColor = 'rgba(0,0,0,0.03)';
    }}
  >
    <div style={{
      fontSize: '42px',
      fontWeight: 800,
      color: color,
      marginBottom: '8px',
      letterSpacing: '-0.02em',
    }}>
      {value}
    </div>
    <div style={{
      fontSize: '14px',
      color: '#5f6368',
      fontWeight: 500,
      textTransform: 'uppercase',
      letterSpacing: '0.03em',
    }}>
      {label}
    </div>
  </div>
);

const ElectionCard = ({ election, onClick }) => {
  const statutConfig = {
    en_attente: { label: 'En attente', bg: '#fff8e1', color: '#f57c00', dot: '#fbbc04' },
    ouverte:    { label: 'En cours',   bg: '#e6f4ea', color: '#2e7d32', dot: '#34a853' },
    fermee:     { label: 'Terminée',   bg: '#fce8e6', color: '#c62828', dot: '#ea4335' },
    deliberee:  { label: 'Délibérée',  bg: '#e8f0fe', color: '#1a56db', dot: '#1a73e8' },
  };
  const s = statutConfig[election.statut] || statutConfig.en_attente;

  return (
    <div
      onClick={onClick}
      style={{
        background: 'white',
        borderRadius: '20px',
        padding: '22px 24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1)',
        border: '1px solid rgba(0,0,0,0.03)',
        borderLeft: `4px solid ${s.dot}`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateX(6px)';
        e.currentTarget.style.boxShadow = '0 12px 28px rgba(0,0,0,0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateX(0)';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ fontSize: '17px', fontWeight: 700, color: '#1a1a2e', marginBottom: '8px' }}>
            {election.nom}
          </div>
          <div style={{ fontSize: '13px', color: '#9aa0a6' }}>
            Année {election.annee_debut} — {election.annee_fin}
          </div>
        </div>
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
            borderRadius: '50%',
            background: s.dot,
            display: 'inline-block',
            animation: election.statut === 'ouverte' ? 'pulse 1.5s infinite' : 'none',
          }} />
          {s.label}
        </span>
      </div>
    </div>
  );
};

export default function Dashboard({ setCurrentPage }) {
  const { utilisateur } = useAuth();
  const [elections, setElections] = useState([]);
  const [candidats, setCandidats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [e, c] = await Promise.all([getElections(), getCandidats()]);
        setElections(e.data);
        setCandidats(c.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const electionsOuvertes = elections.filter(e => e.statut === 'ouverte');
  const electionsEnAttente = elections.filter(e => e.statut === 'en_attente');

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
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{
          fontSize: 'clamp(24px, 6vw, 32px)',
          fontWeight: 700,
          color: '#1a1a2e',
          marginBottom: '10px',
          letterSpacing: '-0.02em',
        }}>
          Bonjour, {utilisateur?.prenom}
        </h1>
        <p style={{ fontSize: '15px', color: '#6c757d', lineHeight: 1.5 }}>
          Bienvenue sur votre espace de vote électronique
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '18px',
        marginBottom: '40px',
      }}>
        <StatCard label="Elections totales" value={elections.length} color="#1a73e8" />
        <StatCard label="Elections en cours" value={electionsOuvertes.length} color="#34a853" />
        <StatCard label="En attente" value={electionsEnAttente.length} color="#fbbc04" />
        <StatCard label="Candidats inscrits" value={candidats.length} color="#ea4335" />
      </div>

      {electionsOuvertes.length > 0 && (
        <div
          style={{
            background: 'linear-gradient(135deg, #1a73e8 0%, #0d47a1 100%)',
            borderRadius: '24px',
            padding: 'clamp(24px, 5vw, 32px)',
            marginBottom: '40px',
            color: 'white',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 8px 20px rgba(26,115,232,0.25)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 16px 32px rgba(26,115,232,0.35)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 8px 20px rgba(26,115,232,0.25)';
          }}
          onClick={() => setShowModal(true)}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
            <span style={{
              width: '10px',
              height: '10px',
              background: '#fff',
              borderRadius: '50%',
              animation: 'pulse 1.5s infinite',
            }} />
            <span style={{ fontSize: 'clamp(14px, 4vw, 16px)', fontWeight: 700, letterSpacing: '0.5px' }}>
              {electionsOuvertes.length} élection(s) en cours
            </span>
          </div>
          <p style={{ fontSize: 'clamp(13px, 3.5vw, 14px)', opacity: 0.85, marginBottom: '20px', lineHeight: 1.5 }}>
            Ne manquez pas votre chance de voter. Votre voix compte
          </p>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrentPage('vote');
            }}
            style={{
              background: 'white',
              color: '#1a73e8',
              border: 'none',
              padding: '12px 28px',
              borderRadius: '40px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.02)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Voter maintenant
          </button>
        </div>
      )}

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1a1a2e' }}>
            Elections récentes
          </h2>
          <button
            onClick={() => setCurrentPage('elections')}
            style={{
              background: 'transparent',
              color: '#1a73e8',
              border: '1px solid #1a73e8',
              padding: '8px 20px',
              borderRadius: '40px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#1a73e8';
              e.currentTarget.style.color = 'white';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = '#1a73e8';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Voir tout
          </button>
        </div>

        {elections.length === 0 ? (
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '60px 24px',
            textAlign: 'center',
            color: '#9aa0a6',
            border: '1px solid rgba(0,0,0,0.05)',
          }}>
            <div style={{ fontSize: '52px', marginBottom: '16px', opacity: 0.5 }}>🗳️</div>
            <div style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px', color: '#5f6368' }}>
              Aucune élection disponible
            </div>
            <div style={{ fontSize: '14px' }}>Les élections apparaîtront ici</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {elections.slice(0, 4).map((e) => (
              <ElectionCard
                key={e.id_election}
                election={e}
                onClick={() => setCurrentPage('elections')}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal rapide */}
      {showModal && (
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
          onClick={() => setShowModal(false)}
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
              background: '#e8f0fe',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              fontSize: '28px',
            }}>🗳️</div>
            <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#1a1a2e', marginBottom: '12px' }}>
              Élections en cours
            </h3>
            <p style={{ fontSize: '14px', color: '#6c757d', lineHeight: 1.6, marginBottom: '24px' }}>
              {electionsOuvertes.length} élection(s) sont actuellement ouvertes. Participez dès maintenant
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowModal(false)}
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
                Plus tard
              </button>
              <button
                onClick={() => { setShowModal(false); setCurrentPage('vote'); }}
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
                onMouseEnter={(e) => { e.currentTarget.style.background = '#0d47a1'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#1a73e8'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                Voter maintenant
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
