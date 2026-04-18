import { useState } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Dashboard from './Dashboard';
import Elections from './Elections';
import Candidature from './Candidature';
import Vote from './Vote';
import Commentaires from './Commentaires';

const menuItems = [
  { id: 'dashboard',    label: 'Accueil' },
  { id: 'elections',    label: 'Elections' },
  { id: 'candidature',  label: 'Ma candidature' },
  { id: 'vote',         label: 'Voter' },
  { id: 'commentaires', label: 'Commentaires' },
];

export default function EtudiantLayout() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':    return <Dashboard setCurrentPage={setCurrentPage} />;
      case 'elections':    return <Elections setCurrentPage={setCurrentPage} />;
      case 'candidature':  return <Candidature />;
      case 'vote':         return <Vote />;
      case 'commentaires': return <Commentaires />;
      default:             return <Dashboard setCurrentPage={setCurrentPage} />;
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: '#f5f7fa',
      fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    }}>
      <Header
        menuItems={menuItems}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
      <main style={{ flex: 1, paddingTop: '80px', paddingBottom: '40px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(16px, 4vw, 32px)' }}>
          {renderPage()}
        </div>
      </main>
      <Footer />
    </div>
  );
}
