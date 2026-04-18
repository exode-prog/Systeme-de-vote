import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import EtudiantLayout from './pages/etudiant/Layout';
import AdminLayout from './pages/admin/Layout';

const PrivateRoute = ({ children, role }) => {
  const { utilisateur, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50">
      <div className="text-blue-600 text-lg font-medium">Chargement...</div>
    </div>
  );
  if (!utilisateur) return <Navigate to="/login" />;
  if (role && utilisateur.role !== role) return <Navigate to="/login" />;
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/etudiant/*" element={
        <PrivateRoute role="etudiant">
          <EtudiantLayout />
        </PrivateRoute>
      } />
      <Route path="/admin/*" element={
        <PrivateRoute role="admin">
          <AdminLayout />
        </PrivateRoute>
      } />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
