import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Header({ menuItems, currentPage, setCurrentPage }) {
  const { utilisateur, deconnecter } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleDeconnexion = () => {
    deconnecter();
    navigate('/login');
  };

  return (
    <>
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        background: 'white', zIndex: 100,
        boxShadow: '0 1px 8px rgba(0,0,0,0.08)',
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
      }}>
        <div style={{
          maxWidth: '1280px', margin: '0 auto',
          padding: '0 24px', height: '64px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px', height: '36px', background: '#1a73e8',
              borderRadius: '10px', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="18" height="18" fill="none" stroke="white" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#202124' }}>
                Système de Vote
              </div>
              <div style={{ fontSize: '11px', color: '#9aa0a6' }}>
                {utilisateur?.role === 'admin' ? 'Administration' : 'Espace Étudiant'}
              </div>
            </div>
          </div>

          <nav style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
            className="desktop-nav">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '8px 14px', borderRadius: '8px', border: 'none',
                  cursor: 'pointer', fontSize: '13px', fontWeight: 500,
                  transition: 'all 0.2s ease',
                  background: currentPage === item.id ? '#e8f0fe' : 'transparent',
                  color: currentPage === item.id ? '#1a73e8' : '#5f6368',
                  borderBottom: currentPage === item.id ? '2px solid #1a73e8' : '2px solid transparent',
                }}
                onMouseEnter={(e) => {
                  if (currentPage !== item.id) {
                    e.currentTarget.style.background = '#f8f9fa';
                    e.currentTarget.style.color = '#1a73e8';
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentPage !== item.id) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#5f6368';
                  }
                }}
              >
                <span>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '6px 12px', background: '#f8f9fa',
              borderRadius: '20px', cursor: 'pointer',
            }}>
              <div style={{
                width: '28px', height: '28px', background: '#1a73e8',
                borderRadius: '50%', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                color: 'white', fontWeight: 700, fontSize: '12px',
              }}>
                {utilisateur?.nom?.charAt(0).toUpperCase()}
              </div>
              <span style={{ fontSize: '13px', fontWeight: 500, color: '#202124' }}
                className="desktop-only">
                {utilisateur?.nom}
              </span>
            </div>

            <button
              onClick={handleDeconnexion}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 14px', borderRadius: '8px', border: 'none',
                cursor: 'pointer', fontSize: '13px', fontWeight: 500,
                background: '#fce8e6', color: '#ea4335',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#ea4335'; e.currentTarget.style.color = 'white'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#fce8e6'; e.currentTarget.style.color = '#ea4335'; }}
            >
              <span>🚪</span>
              <span className="desktop-only">Déconnexion</span>
            </button>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="mobile-menu-btn"
              style={{
                display: 'none', background: 'none', border: 'none',
                cursor: 'pointer', padding: '8px', borderRadius: '8px',
              }}
            >
              <svg width="22" height="22" fill="none" stroke="#202124" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>

        {menuOpen && (
          <div style={{
            background: 'white', borderTop: '1px solid #f0f0f0',
            padding: '12px 24px', display: 'flex', flexDirection: 'column', gap: '4px',
          }}
            className="mobile-menu">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => { setCurrentPage(item.id); setMenuOpen(false); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '12px 16px', borderRadius: '10px', border: 'none',
                  cursor: 'pointer', fontSize: '14px', fontWeight: 500,
                  background: currentPage === item.id ? '#e8f0fe' : 'transparent',
                  color: currentPage === item.id ? '#1a73e8' : '#5f6368',
                  textAlign: 'left', width: '100%',
                }}
              >
                <span>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        )}
      </header>

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
          .desktop-only { display: none !important; }
        }
        @media (min-width: 769px) {
          .mobile-menu { display: none !important; }
        }
      `}</style>
    </>
  );
}
