import { useState } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Dashboard from './Dashboard';
import GererElections from './GererElections';
import GererCandidats from './GererCandidats';
import GererUtilisateurs from './GererUtilisateurs';
import Inscriptions from './Inscriptions';
import Deliberation from './Deliberation';

const menuItems = [
  { id: 'dashboard',    label: 'Tableau de bord',  emoji: '📊' },
  { id: 'elections',    label: 'Élections',        emoji: '🗳️' },
  { id: 'candidats',    label: 'Candidats',        emoji: '👥' },
  { id: 'utilisateurs', label: 'Utilisateurs',     emoji: '👤' },
  { id: 'inscriptions', label: 'Inscriptions',     emoji: '📝' },
  { id: 'deliberation', label: 'Délibération',     emoji: '🏆' },
];

export default function AdminLayout() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':    return <Dashboard setCurrentPage={setCurrentPage} />;
      case 'elections':    return <GererElections />;
      case 'candidats':    return <GererCandidats />;
      case 'utilisateurs': return <GererUtilisateurs />;
      case 'inscriptions': return <Inscriptions />;
      case 'deliberation': return <Deliberation />;
      default:             return <Dashboard setCurrentPage={setCurrentPage} />;
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: '#f8f9fc',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    }}>
      <Header
        menuItems={menuItems}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
      <main style={{ flex: 1, paddingTop: '80px', paddingBottom: '48px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px 20px' }}>
          {renderPage()}
        </div>
      </main>
      <Footer />
    </div>
  );
}
