export default function Footer() {
  return (
    <footer style={{
      background: 'white', borderTop: '1px solid #f0f0f0',
      padding: '20px 24px', marginTop: 'auto',
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
    }}>
      <div style={{
        maxWidth: '1280px', margin: '0 auto',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '24px', height: '24px', background: '#1a73e8',
            borderRadius: '6px', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="12" height="12" fill="none" stroke="white" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#202124' }}>
            Système de Vote Électronique
          </span>
        </div>
        <span style={{ fontSize: '12px', color: '#9aa0a6' }}>
          © 2025 — Tous droits réservés
        </span>
      </div>
    </footer>
  );
}
