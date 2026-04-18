import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [utilisateur, setUtilisateur] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user  = localStorage.getItem('utilisateur');
    if (token && user) {
      setUtilisateur(JSON.parse(user));
    }
    setLoading(false);
  }, []);

  const connecter = (userData, tokenData) => {
    setUtilisateur(userData);
    localStorage.setItem('token', tokenData);
    localStorage.setItem('utilisateur', JSON.stringify(userData));
  };

  const deconnecter = () => {
    setUtilisateur(null);
    localStorage.removeItem('token');
    localStorage.removeItem('utilisateur');
  };

  return (
    <AuthContext.Provider value={{ utilisateur, connecter, deconnecter, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
