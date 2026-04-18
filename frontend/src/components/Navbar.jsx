import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Navbar({ menuItems, currentPage, setCurrentPage }) {
  const { utilisateur, deconnecter } = useAuth();
  const navigate = useNavigate();

  const handleDeconnexion = () => {
    deconnecter();
    navigate('/login');
  };

  return (
    <aside style={{
      position: 'fixed', left: 0, top: 0,
      height: '100vh', width: '256px',
      background: 'white', boxShadow: '2px 0 8px rgba(0,0,0,0.08)',
      display: 'flex', flexDirection: 'column', zIndex: 50
    }}>
      <div style={{ padding: '24px', borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px', height: '40px', background: '#1a73e8',
            borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <svg width="20" height="20" fill="none" stroke="white" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#202124' }}>Système Vote</div>
            <div style={{ fontSize: '11px', color: '#9aa0a6' }}>
              {utilisateur?.role === 'admin' ? 'Administration' : 'Espace Étudiant'}
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '16px', borderBottom: '1px solid #f0f0f0' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          padding: '12px', background: '#e8f0fe', borderRadius: '12px'
        }}>
          <div style={{
            width: '36px', height: '36px', background: '#1a73e8',
            borderRadius: '50%', display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '14px'
          }}>
            {utilisateur?.nom?.charAt(0).toUpperCase()}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#202124', 
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {utilisateur?.nom}
            </div>
            <div style={{ fontSize: '11px', color: '#9aa0a6',
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {utilisateur?.email}
            </div>
          </div>
        </div>
      </div>

      <nav style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto' }}>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentPage(item.id)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
              padding: '12px 16px', borderRadius: '12px', border: 'none',
              cursor: 'pointer', fontSize: '13px', fontWeight: 500,
              transition: 'all 0.2s ease', textAlign: 'left',
              background: currentPage === item.id ? '#1a73e8' : 'transparent',
              color: currentPage === item.id ? 'white' : '#5f6368',
              boxShadow: currentPage === item.id ? '0 4px 12px rgba(26,115,232,0.3)' : 'none',
            }}
            onMouseEnter={(e) => {
              if (currentPage !== item.id) {
                e.currentTarget.style.background = '#e8f0fe';
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
            <span style={{ fontSize: '18px' }}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div style={{ padding: '16px', borderTop: '1px solid #f0f0f0' }}>
        <button
          onClick={handleDeconnexion}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
            padding: '12px 16px', borderRadius: '12px', border: 'none',
            cursor: 'pointer', fontSize: '13px', fontWeight: 500,
            background: 'transparent', color: '#ea4335', transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#fce8e6'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
        >
          <span style={{ fontSize: '18px' }}>🚪</span>
          Se déconnecter
        </button>
      </div>
    </aside>
  );
}
