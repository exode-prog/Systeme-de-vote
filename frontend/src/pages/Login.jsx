import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login } from '../services/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [mot_de_passe, setMotDePasse] = useState('');
  const [erreur, setErreur] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { connecter } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreur('');
    setLoading(true);
    try {
      const res = await login({ email, mot_de_passe });
      connecter(res.data.utilisateur, res.data.token);
      if (res.data.utilisateur.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/etudiant');
      }
    } catch (err) {
      setErreur(err.response?.data?.message || 'Email ou mot de passe incorrect');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      fontFamily: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif",
      backgroundColor: '#f5f7fb',
    }}>
      {/* Panneau gauche - Bannière */}
      <div style={{
        flex: 1.2,
        background: 'linear-gradient(135deg, #1a73e8 0%, #0d47a1 50%, #0b3d91 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '48px',
        position: 'relative',
        overflow: 'hidden',
      }}
        className="banner-panel"
      >
        {/* Décorations géométriques */}
        <div style={{
          position: 'absolute', top: '-100px', right: '-80px',
          width: '350px', height: '350px',
          background: 'rgba(255,255,255,0.04)',
          borderRadius: '60% 40% 50% 50%',
        }} />
        <div style={{
          position: 'absolute', bottom: '-60px', left: '-80px',
          width: '280px', height: '280px',
          background: 'rgba(255,255,255,0.04)',
          borderRadius: '50%',
        }} />
        <div style={{
          position: 'absolute', top: '40%', left: '20%',
          width: '150px', height: '150px',
          background: 'rgba(255,255,255,0.02)',
          borderRadius: '50%',
        }} />

        {/* En-tête du panneau */}
        <div style={{ position: 'relative', zIndex: 2 }}>
          <h1 style={{
            color: 'white',
            fontSize: 'clamp(24px, 4vw, 32px)',
            fontWeight: 700,
            lineHeight: 1.4,
            marginBottom: '32px',
            maxWidth: '500px',
          }}>
            Plateforme de vote présidentiel de l'amicale <span style={{ whiteSpace: 'nowrap' }}>EC2LT</span>
          </h1>
        </div>

        {/* Bloc des informations */}
        <div style={{
          position: 'relative',
          zIndex: 2,
          background: 'rgba(255,255,255,0.08)',
          backdropFilter: 'blur(8px)',
          borderRadius: '20px',
          padding: '24px',
          border: '1px solid rgba(255,255,255,0.1)',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <div style={{
                fontSize: '13px',
                fontWeight: 500,
                color: 'rgba(255,255,255,0.9)',
                marginBottom: '4px',
              }}> Vote sécurisé et anonyme</div>
            </div>
            <div>
              <div style={{
                fontSize: '13px',
                fontWeight: 500,
                color: 'rgba(255,255,255,0.9)',
                marginBottom: '4px',
              }}> Résultats en direct</div>
            </div>
          </div>
        </div>
      </div>

      {/* Panneau droit - Formulaire de connexion */}
      <div style={{
        width: '100%',
        maxWidth: '520px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: 'clamp(32px, 6vw, 56px)',
        backgroundColor: 'white',
        boxShadow: '-8px 0 32px rgba(0,0,0,0.05)',
      }}>
        <div style={{ maxWidth: '380px', margin: '0 auto', width: '100%' }}>

          {/* Titre du formulaire */}
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontSize: 'clamp(24px, 5vw, 30px)',
              fontWeight: 700,
              color: '#1a1a2e',
              marginBottom: '10px',
            }}>
              EC2LT
            </h2>
            <p style={{
              fontSize: '14px',
              color: '#6c757d',
              lineHeight: 1.5,
            }}>
              Connectez-vous à votre espace personnel
            </p>
          </div>

          {/* Message d'erreur */}
          {erreur && (
            <div style={{
              background: '#fee2e2',
              borderLeft: '4px solid #dc2626',
              color: '#991b1b',
              padding: '14px 18px',
              borderRadius: '12px',
              fontSize: '13px',
              marginBottom: '28px',
            }}>
              {erreur}
            </div>
          )}

          {/* Formulaire */}
          <form onSubmit={handleSubmit}>
            {/* Champ Email */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 600,
                color: '#374151',
                marginBottom: '8px',
              }}>
                Adresse email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="exemple@ec2lt.org"
                required
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  border: '1.5px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '14px',
                  color: '#1f2937',
                  backgroundColor: '#fafbfc',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#1a73e8';
                  e.target.style.backgroundColor = '#ffffff';
                  e.target.style.boxShadow = '0 0 0 3px rgba(26,115,232,0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.backgroundColor = '#fafbfc';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Champ Mot de passe */}
            <div style={{ marginBottom: '28px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px',
              }}>
                <label style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#374151',
                }}>
                  Mot de passe
                </label>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={mot_de_passe}
                  onChange={(e) => setMotDePasse(e.target.value)}
                  placeholder="Votre mot de passe"
                  required
                  style={{
                    width: '100%',
                    padding: '14px 50px 14px 16px',
                    border: '1.5px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '14px',
                    color: '#1f2937',
                    backgroundColor: '#fafbfc',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#1a73e8';
                    e.target.style.backgroundColor = '#ffffff';
                    e.target.style.boxShadow = '0 0 0 3px rgba(26,115,232,0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.backgroundColor = '#fafbfc';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '18px',
                    padding: '0',
                    color: '#9ca3af',
                  }}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Bouton de connexion */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                background: loading ? '#9ca3af' : '#1a73e8',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '15px',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.background = '#0d47a1';
                  e.target.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.target.style.background = '#1a73e8';
                  e.target.style.transform = 'translateY(0)';
                }
              }}
            >
              {loading ? 'Connexion en cours...' : 'Se connecter'}
            </button>
          </form>

          {/* Pied de page */}
          <p style={{
            textAlign: 'center',
            fontSize: '11px',
            color: '#9ca3af',
            marginTop: '40px',
            letterSpacing: '0.3px',
          }}>
            © 2026 - EC2LT • Vote électronique sécurisé
          </p>
        </div>
      </div>

      {/* Styles responsives */}
      <style>{`
        @media (max-width: 900px) {
          .banner-panel {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
