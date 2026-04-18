import { useState, useEffect } from 'react';
import { getElections, getCandidats, getUtilisateurs } from '../../services/api';

const StatCard = ({ label, value, color }) => (
  <div style={{
    background: 'white',
    borderRadius: '20px',
    padding: '24px 20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    transition: 'all 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1)',
    cursor: 'default',
    border: '1px solid rgba(0,0,0,0.03)',
    borderTop: `3px solid ${color}`,
  }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.boxShadow = '0 20px 35px -12px rgba(0,0,0,0.15)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
    }}
  >
    <div>
      <div style={{ fontSize: '36px', fontWeight: 800, color: color, marginBottom: '8px', letterSpacing: '-0.02em' }}>
        {value}
      </div>
      <div style={{ fontSize: '13px', color: '#5f6368', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
        {label}
      </div>
    </div>
  </div>
);

export default function Dashboard({ setCurrentPage }) {
  const [elections, setElections] = useState([]);
  const [candidats, setCandidats] = useState([]);
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [e, c, u] = await Promise.all([
          getElections(),
          getCandidats(),
          getUtilisateurs(),
        ]);
        setElections(e.data);
        setCandidats(c.data);
        setUtilisateurs(u.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const ouvertes = elections.filter(e => e.statut === 'ouverte');
  const fermees = elections.filter(e => e.statut === 'fermee');
  const enAttente = elections.filter(e => e.statut === 'en_attente');
  const etudiants = utilisateurs.filter(u => u.role === 'etudiant');

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
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{
          fontSize: 'clamp(24px, 6vw, 32px)',
          fontWeight: 700,
          color: '#1a1a2e',
          marginBottom: '10px',
          letterSpacing: '-0.02em',
        }}>
          Tableau de bord
        </h1>
        <p style={{ fontSize: '15px', color: '#6c757d', lineHeight: 1.5 }}>
          Vue d'ensemble du système de vote
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '18px',
        marginBottom: '40px',
      }}>
        <StatCard label="Elections totales" value={elections.length} color="#1a73e8" />
        <StatCard label="En cours" value={ouvertes.length} color="#34a853" />
        <StatCard label="En attente" value={enAttente.length} color="#fbbc04" />
        <StatCard label="Terminées" value={fermees.length} color="#ea4335" />
        <StatCard label="Candidats" value={candidats.length} color="#9c27b0" />
        <StatCard label="Etudiants inscrits" value={etudiants.length} color="#ff9800" />
      </div>

      {ouvertes.length > 0 && (
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
              {ouvertes.length} élection(s) en cours
            </span>
          </div>
          <p style={{ fontSize: 'clamp(13px, 3.5vw, 14px)', opacity: 0.85, marginBottom: '20px', lineHeight: 1.5 }}>
            {ouvertes.map(e => e.nom).join(', ')}
          </p>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrentPage('elections');
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
            Gérer
          </button>
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '24px',
      }}>
        <div style={{
          background: 'white',
          borderRadius: '24px',
          padding: '24px',
          border: '1px solid rgba(0,0,0,0.05)',
        }}>
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
                padding: '6px 16px',
                borderRadius: '40px',
                fontSize: '12px',
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
            <div style={{ textAlign: 'center', color: '#9aa0a6', padding: '32px', fontSize: '13px' }}>
              Aucune élection
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {elections.slice(0, 5).map(e => {
                const config = {
                  en_attente: { bg: '#fff8e1', color: '#f57c00', label: 'En attente' },
                  ouverte:    { bg: '#e6f4ea', color: '#2e7d32', label: 'Ouverte' },
                  fermee:     { bg: '#fce8e6', color: '#c62828', label: 'Fermée' },
                  deliberee:  { bg: '#e8f0fe', color: '#1a56db', label: 'Délibérée' },
                }[e.statut] || { bg: '#f5f5f5', color: '#9aa0a6', label: e.statut };
                return (
                  <div key={e.id_election} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '14px 16px',
                    background: '#f8f9fa',
                    borderRadius: '14px',
                    transition: 'all 0.2s ease',
                  }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#e8f0fe';
                      e.currentTarget.style.transform = 'translateX(4px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#f8f9fa';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}
                  >
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a2e' }}>
                      {e.nom}
                    </span>
                    <span style={{
                      background: config.bg,
                      color: config.color,
                      padding: '4px 12px',
                      borderRadius: '40px',
                      fontSize: '11px',
                      fontWeight: 600,
                    }}>
                      {config.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div style={{
          background: 'white',
          borderRadius: '24px',
          padding: '24px',
          border: '1px solid rgba(0,0,0,0.05)',
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1a1a2e', marginBottom: '20px' }}>
            Actions rapides
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { label: 'Créer une élection',   page: 'elections',    color: '#1a73e8', bg: '#e8f0fe' },
              { label: 'Gérer les candidats',  page: 'candidats',    color: '#34a853', bg: '#e6f4ea' },
              { label: 'Ajouter un étudiant',  page: 'utilisateurs', color: '#9c27b0', bg: '#f3e5f5' },
              { label: 'Inscrire un étudiant', page: 'inscriptions', color: '#ff9800', bg: '#fff3e0' },
              { label: 'Délibérer',            page: 'deliberation', color: '#ea4335', bg: '#fce8e6' },
            ].map((item, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(item.page)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 18px',
                  borderRadius: '14px',
                  border: 'none',
                  cursor: 'pointer',
                  background: '#f8f9fa',
                  transition: 'all 0.2s ease',
                  width: '100%',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = item.bg;
                  e.currentTarget.style.transform = 'translateX(6px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#f8f9fa';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a2e' }}>
                  {item.label}
                </span>
                <span style={{ color: item.color, fontSize: '16px', fontWeight: 600 }}>→</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Modal */}
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
              {ouvertes.length} élection(s) sont actuellement ouvertes.
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
              >
                Fermer
              </button>
              <button
                onClick={() => { setShowModal(false); setCurrentPage('elections'); }}
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
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#0d47a1';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#1a73e8';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Gérer
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
