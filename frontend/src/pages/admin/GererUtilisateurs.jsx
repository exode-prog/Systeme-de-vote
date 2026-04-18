import { useState, useEffect } from 'react';
import {
  getUtilisateurs, creerUtilisateur, supprimerUtilisateur,
  getClasses, getAnneesAcademiques, creerInscription, getInscriptions,
  creerAnneeAcademique, supprimerAnneeAcademique,supprimerInscription
} from '../../services/api';

export default function GererUtilisateurs() {
  const [utilisateurs, setUtilisateurs]       = useState([]);
  const [classes, setClasses]                 = useState([]);
  const [annees, setAnnees]                   = useState([]);
  const [inscriptions, setInscriptions]       = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [showForm, setShowForm]               = useState(false);
  const [showAnneeForm, setShowAnneeForm]     = useState(false);
  const [submitting, setSubmitting]           = useState(false);
  const [submittingAnnee, setSubmittingAnnee] = useState(false);
  const [message, setMessage]                 = useState(null);
  const [recherche, setRecherche]             = useState('');
  const [filtreRole, setFiltreRole]           = useState('tous');
  const [onglet, setOnglet]                   = useState('utilisateurs');
  const [filtreAnnee, setFiltreAnnee]         = useState('');
  const [filtreClasse, setFiltreClasse]       = useState('');
  const [anneeForm, setAnneeForm]             = useState({ annee_debut: '', annee_fin: '' });
  const [form, setForm] = useState({
    nom: '', prenom: '', email: '', mot_de_passe: '', role: 'etudiant',
    inscrire: true, id_classe: '', id_anneeacademique: '',
  });

  // Modale confirmation
  const [confirmModal, setConfirmModal] = useState({ show: false, id: null, type: '', message: '' });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [u, c, a, i] = await Promise.all([
        getUtilisateurs(), getClasses(), getAnneesAcademiques(), getInscriptions(),
      ]);
      setUtilisateurs(u.data);
      setClasses(c.data);
      setAnnees(a.data);
      setInscriptions(i.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleCreer = async (e) => {
    e.preventDefault();
    if (form.role === 'etudiant' && form.inscrire && (!form.id_classe || !form.id_anneeacademique)) {
      setMessage({ type: 'error', text: 'Veuillez choisir une classe et une annee academique' });
      setTimeout(() => setMessage(null), 4000);
      return;
    }
    setSubmitting(true);
    try {
      const resUser = await creerUtilisateur({
        nom: form.nom, prenom: form.prenom,
        email: form.email, mot_de_passe: form.mot_de_passe, role: form.role,
      });
      const newUser = resUser.data.utilisateur;
      if (form.role === 'etudiant' && form.inscrire) {
        await creerInscription({
          id_utilisateur:     newUser.id_utilisateur,
          id_classe:          parseInt(form.id_classe),
          id_anneeAcademique: parseInt(form.id_anneeacademique),
        });
        const classeNom = classes.find(c => c.id_classe == form.id_classe)?.nom || '';
        setMessage({ type: 'success', text: 'Etudiant cree et inscrit en ' + classeNom });
      } else {
        setMessage({ type: 'success', text: 'Utilisateur cree avec succes' });
      }
      setForm({ nom: '', prenom: '', email: '', mot_de_passe: '', role: 'etudiant', inscrire: true, id_classe: '', id_anneeacademique: '' });
      setShowForm(false);
      fetchData();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Erreur lors de la creation' });
    } finally {
      setSubmitting(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const handleSupprimer = async (id) => {
    setConfirmModal({ show: false, id: null, type: '', message: '' });
    try {
      await supprimerUtilisateur(id);
      setMessage({ type: 'success', text: 'Utilisateur supprime' });
      fetchData();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Erreur' });
    }
    setTimeout(() => setMessage(null), 3000);
  };

  const handleCreerAnnee = async (e) => {
    e.preventDefault();
    if (parseInt(anneeForm.annee_fin) <= parseInt(anneeForm.annee_debut)) {
      setMessage({ type: 'error', text: 'annee fin doit etre superieure a annee debut' });
      setTimeout(() => setMessage(null), 4000);
      return;
    }
    setSubmittingAnnee(true);
    try {
      await creerAnneeAcademique({
        annee_debut: parseInt(anneeForm.annee_debut),
        annee_fin:   parseInt(anneeForm.annee_fin),
      });
      setMessage({ type: 'success', text: 'Annee ' + anneeForm.annee_debut + ' - ' + anneeForm.annee_fin + ' creee' });
      setAnneeForm({ annee_debut: '', annee_fin: '' });
      setShowAnneeForm(false);
      fetchData();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Erreur' });
    } finally {
      setSubmittingAnnee(false);
      setTimeout(() => setMessage(null), 4000);
    }
  };

  const handleSupprimerInscription = async (id) => {
    setConfirmModal({ show: false, id: null, type: '', message: '' });
    try {
      await supprimerInscription(id);
      setMessage({ type: 'success', text: 'Inscription supprimee' });
      fetchData();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Erreur' });
    }
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSupprimerAnnee = async (id) => {
    setConfirmModal({ show: false, id: null, type: '', message: '' });
    try {
      await supprimerAnneeAcademique(id);
      setMessage({ type: 'success', text: 'Annee supprimee' });
      fetchData();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Erreur' });
    }
    setTimeout(() => setMessage(null), 3000);
  };

  const openConfirmModal = (id, type, name) => {
    let message = '';
    if (type === 'utilisateur') message = `Supprimer ${name} ?`;
    if (type === 'annee') message = `Supprimer l'année ${name} ?`;
    if (type === 'inscription') message = `Supprimer l'inscription de ${name} ?`;
    setConfirmModal({ show: true, id, type, message });
  };

  const confirmDelete = () => {
    const { id, type } = confirmModal;
    if (type === 'utilisateur') handleSupprimer(id);
    if (type === 'annee') handleSupprimerAnnee(id);
    if (type === 'inscription') handleSupprimerInscription(id);
  };

  const utilisateursFiltres = utilisateurs.filter(u => {
    const matchRecherche =
      u.nom?.toLowerCase().includes(recherche.toLowerCase()) ||
      u.prenom?.toLowerCase().includes(recherche.toLowerCase()) ||
      u.email?.toLowerCase().includes(recherche.toLowerCase());
    const matchRole = filtreRole === 'tous' || u.role === filtreRole;
    return matchRecherche && matchRole;
  });

  const inscriptionsFiltrees = inscriptions.filter(i => {
    const matchAnnee  = !filtreAnnee  || (i.annee_debut + '-' + i.annee_fin) === filtreAnnee;
    const matchClasse = !filtreClasse || i.classe === filtreClasse;
    return matchAnnee && matchClasse;
  });

  const anneesUniques  = [...new Set(inscriptions.map(i => i.annee_debut + '-' + i.annee_fin))];
  const classesUniques = [...new Set(inscriptions.map(i => i.classe))];

  const inputStyle = {
    width: '100%', padding: '11px 14px', border: '1.5px solid #e0e0e0',
    borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box',
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
      <div style={{ width: '40px', height: '40px', border: '3px solid #e8f0fe', borderTopColor: '#1a73e8', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div>
      {/* MODALE DE CONFIRMATION */}
      {confirmModal.show && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', zIndex: 300,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }} onClick={(e) => { if (e.target === e.currentTarget) setConfirmModal({ show: false, id: null, type: '', message: '' }); }}>
          <div style={{
            background: 'white', borderRadius: '20px', padding: '28px',
            width: '100%', maxWidth: '400px', textAlign: 'center'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#202124', marginBottom: '12px' }}>Confirmation</div>
            <div style={{ fontSize: '14px', color: '#5f6368', marginBottom: '24px' }}>{confirmModal.message}</div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button onClick={() => setConfirmModal({ show: false, id: null, type: '', message: '' })}
                style={{ padding: '10px 20px', background: '#f8f9fa', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#e0e0e0'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#f8f9fa'}>
                Annuler
              </button>
              <button onClick={confirmDelete}
                style={{ padding: '10px 20px', background: '#ea4335', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#c5221f'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#ea4335'}>
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#202124', marginBottom: '6px' }}>
            👥 Gestion des utilisateurs
          </h1>
          <p style={{ fontSize: '14px', color: '#9aa0a6' }}>
            {utilisateurs.filter(u => u.role === 'etudiant').length} étudiant(s) - {utilisateurs.filter(u => u.role === 'admin').length} admin(s)
          </p>
        </div>
        <button onClick={() => setShowForm(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#1a73e8', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '10px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s ease', boxShadow: '0 4px 12px rgba(26,115,232,0.3)' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#0d47a1'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(26,115,232,0.4)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#1a73e8'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(26,115,232,0.3)'; }}
        >
          ✨ Nouvel utilisateur
        </button>
      </div>

      {/* MESSAGE TOAST */}
      {message && (
        <div style={{
          background: message.type === 'success' ? '#e6f4ea' : '#fce8e6',
          borderLeft: '4px solid ' + (message.type === 'success' ? '#34a853' : '#ea4335'),
          color: message.type === 'success' ? '#2e7d32' : '#c62828',
          padding: '12px 16px', borderRadius: '8px', fontSize: '14px', marginBottom: '20px',
          display: 'flex', alignItems: 'center', gap: '10px'
        }}>
          <span>{message.type === 'success' ? '✅' : '❌'}</span>
          <span>{message.text}</span>
        </div>
      )}

      {/* MODAL CREATION UTILISATEUR */}
      {showForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowForm(false); }}
        >
          <div style={{ background: 'white', borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '640px', maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#202124' }}>✨ Créer un utilisateur</h2>
              <button onClick={() => setShowForm(false)}
                style={{ background: '#f8f9fa', border: 'none', borderRadius: '8px', padding: '8px 12px', cursor: 'pointer', fontSize: '16px', color: '#5f6368', transition: 'all 0.2s ease' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#fce8e6'; e.currentTarget.style.color = '#ea4335'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#f8f9fa'; e.currentTarget.style.color = '#5f6368'; }}
              >✕</button>
            </div>

            <form onSubmit={handleCreer}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                {[
                  { name: 'nom',          label: 'Nom',          placeholder: 'Nom de famille',   type: 'text'     },
                  { name: 'prenom',       label: 'Prénom',       placeholder: 'Prénom',            type: 'text'     },
                  { name: 'email',        label: 'Email',        placeholder: 'email@exemple.com', type: 'email'    },
                  { name: 'mot_de_passe', label: 'Mot de passe', placeholder: '........',          type: 'password' },
                ].map(field => (
                  <div key={field.name}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#9aa0a6', marginBottom: '6px', textTransform: 'uppercase' }}>
                      {field.label} *
                    </label>
                    <input name={field.name} type={field.type} value={form[field.name]} onChange={handleChange} placeholder={field.placeholder} required style={inputStyle}
                      onFocus={(e) => { e.target.style.borderColor = '#1a73e8'; e.target.style.boxShadow = '0 0 0 3px rgba(26,115,232,0.12)'; }}
                      onBlur={(e) => { e.target.style.borderColor = '#e0e0e0'; e.target.style.boxShadow = 'none'; }}
                    />
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#9aa0a6', marginBottom: '10px', textTransform: 'uppercase' }}>Rôle *</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {[
                    { value: 'etudiant', label: '🎓 Étudiant',       desc: 'Peut voter et se porter candidat' },
                    { value: 'admin',    label: '⚙️ Administrateur', desc: 'Gère le système complet'           },
                  ].map(r => (
                    <div key={r.value} onClick={() => setForm(prev => ({ ...prev, role: r.value }))}
                      style={{ flex: 1, padding: '14px', borderRadius: '10px', cursor: 'pointer', border: '2px solid ' + (form.role === r.value ? '#1a73e8' : '#e0e0e0'), background: form.role === r.value ? '#e8f0fe' : 'white', transition: 'all 0.2s ease' }}
                      onMouseEnter={(e) => { if (form.role !== r.value) e.currentTarget.style.borderColor = '#1a73e8'; }}
                      onMouseLeave={(e) => { if (form.role !== r.value) e.currentTarget.style.borderColor = '#e0e0e0'; }}
                    >
                      <div style={{ fontSize: '14px', fontWeight: 700, color: form.role === r.value ? '#1a73e8' : '#202124', marginBottom: '4px' }}>{r.label}</div>
                      <div style={{ fontSize: '11px', color: '#9aa0a6' }}>{r.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              {form.role === 'etudiant' && (
                <div style={{ background: '#f8f9fa', borderRadius: '12px', padding: '20px', marginBottom: '20px', border: '1.5px solid #e8f0fe' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: form.inscrire ? '16px' : '0' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#202124' }}>📚 Inscription scolaire</div>
                      <div style={{ fontSize: '12px', color: '#9aa0a6', marginTop: '2px' }}>Inscrire dans une classe</div>
                    </div>
                    <div onClick={() => setForm(prev => ({ ...prev, inscrire: !prev.inscrire }))}
                      style={{ width: '48px', height: '26px', borderRadius: '13px', background: form.inscrire ? '#1a73e8' : '#e0e0e0', position: 'relative', cursor: 'pointer', transition: 'background 0.2s ease', flexShrink: 0 }}
                    >
                      <div style={{ width: '20px', height: '20px', background: 'white', borderRadius: '50%', position: 'absolute', top: '3px', left: form.inscrire ? '25px' : '3px', transition: 'left 0.2s ease', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
                    </div>
                  </div>

                  {form.inscrire && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#9aa0a6', marginBottom: '6px', textTransform: 'uppercase' }}>Classe *</label>
                        <select name="id_classe" value={form.id_classe} onChange={handleChange}
                          style={{ ...inputStyle, background: 'white' }}
                          onFocus={(e) => { e.target.style.borderColor = '#1a73e8'; }}
                          onBlur={(e) => { e.target.style.borderColor = '#e0e0e0'; }}
                        >
                          <option value="">Choisir une classe</option>
                          {classes.map(c => (
                            <option key={c.id_classe} value={c.id_classe}>{c.nom}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#9aa0a6', marginBottom: '6px', textTransform: 'uppercase' }}>Année académique *</label>
                        {annees.length === 0 ? (
                          <div style={{ padding: '11px 14px', background: '#fff8e1', border: '1.5px solid #fbbc04', borderRadius: '8px', fontSize: '12px', color: '#f57c00' }}>
                            ⚠️ Aucune année - créez-en une ci-dessous
                          </div>
                        ) : (
                          <select name="id_anneeacademique" value={form.id_anneeacademique} onChange={handleChange}
                            style={{ ...inputStyle, background: 'white' }}
                            onFocus={(e) => { e.target.style.borderColor = '#1a73e8'; }}
                            onBlur={(e) => { e.target.style.borderColor = '#e0e0e0'; }}
                          >
                            <option value="">Choisir une année</option>
                            {annees.map(a => (
                              <option key={a.id_anneeacademique} value={a.id_anneeacademique}>
                                {a.annee_debut} - {a.annee_fin}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <button type="submit" disabled={submitting}
                style={{ width: '100%', padding: '14px', background: submitting ? '#9aa0a6' : '#1a73e8', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', transition: 'all 0.2s ease', boxShadow: '0 4px 12px rgba(26,115,232,0.3)' }}
                onMouseEnter={(e) => { if (!submitting) { e.currentTarget.style.background = '#0d47a1'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(26,115,232,0.4)'; } }}
                onMouseLeave={(e) => { if (!submitting) { e.currentTarget.style.background = '#1a73e8'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(26,115,232,0.3)'; } }}
              >
                {submitting ? 'Création en cours...' : form.role === 'etudiant' && form.inscrire ? '✨ Créer et inscrire' : '✨ Créer'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SECTION ANNÉES ACADÉMIQUES */}
      <div style={{ background: 'white', borderRadius: '14px', padding: '18px 20px', marginBottom: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', transition: 'all 0.2s ease' }}
        onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'}
        onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#202124' }}>📅 Années académiques</span>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {annees.length === 0 ? (
                <span style={{ fontSize: '12px', color: '#f57c00', background: '#fff8e1', padding: '3px 10px', borderRadius: '20px' }}>Aucune année</span>
              ) : (
                annees.map(a => (
                  <span key={a.id_anneeacademique} style={{ background: '#e8f0fe', color: '#1a73e8', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    {a.annee_debut} - {a.annee_fin}
                    <button onClick={() => openConfirmModal(a.id_anneeacademique, 'annee', `${a.annee_debut}-${a.annee_fin}`)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ea4335', fontSize: '12px', padding: '0', fontWeight: 700, transition: 'transform 0.1s ease' }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >✕</button>
                  </span>
                ))
              )}
            </div>
          </div>
          <button onClick={() => setShowAnneeForm(!showAnneeForm)}
            style={{ background: '#e8f0fe', color: '#1a73e8', border: 'none', padding: '8px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s ease', flexShrink: 0 }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#1a73e8'; e.currentTarget.style.color = 'white'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#e8f0fe'; e.currentTarget.style.color = '#1a73e8'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            {showAnneeForm ? 'Annuler' : '+ Nouvelle année'}
          </button>
        </div>

        {showAnneeForm && (
          <form onSubmit={handleCreerAnnee} style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', marginTop: '16px', flexWrap: 'wrap' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#9aa0a6', marginBottom: '6px', textTransform: 'uppercase' }}>Année début *</label>
              <input type="number" value={anneeForm.annee_debut} min="2020" max="2050"
                onChange={(e) => setAnneeForm(prev => ({ ...prev, annee_debut: e.target.value }))}
                placeholder="2024" required
                style={{ padding: '11px 14px', border: '1.5px solid #e0e0e0', borderRadius: '8px', fontSize: '13px', outline: 'none', width: '120px', transition: 'all 0.2s ease' }}
                onFocus={(e) => { e.target.style.borderColor = '#1a73e8'; e.target.style.boxShadow = '0 0 0 3px rgba(26,115,232,0.12)'; }}
                onBlur={(e) => { e.target.style.borderColor = '#e0e0e0'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#9aa0a6', marginBottom: '6px', textTransform: 'uppercase' }}>Année fin *</label>
              <input type="number" value={anneeForm.annee_fin} min="2020" max="2050"
                onChange={(e) => setAnneeForm(prev => ({ ...prev, annee_fin: e.target.value }))}
                placeholder="2025" required
                style={{ padding: '11px 14px', border: '1.5px solid #e0e0e0', borderRadius: '8px', fontSize: '13px', outline: 'none', width: '120px', transition: 'all 0.2s ease' }}
                onFocus={(e) => { e.target.style.borderColor = '#1a73e8'; e.target.style.boxShadow = '0 0 0 3px rgba(26,115,232,0.12)'; }}
                onBlur={(e) => { e.target.style.borderColor = '#e0e0e0'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
            <button type="submit" disabled={submittingAnnee}
              style={{ padding: '11px 20px', background: submittingAnnee ? '#9aa0a6' : '#1a73e8', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: submittingAnnee ? 'not-allowed' : 'pointer', transition: 'all 0.2s ease' }}
              onMouseEnter={(e) => { if (!submittingAnnee) { e.currentTarget.style.background = '#0d47a1'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
              onMouseLeave={(e) => { if (!submittingAnnee) { e.currentTarget.style.background = '#1a73e8'; e.currentTarget.style.transform = 'translateY(0)'; } }}
            >
              {submittingAnnee ? '...' : 'Créer'}
            </button>
          </form>
        )}
      </div>

      {/* ONGLETS */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', background: '#f8f9fa', borderRadius: '10px', padding: '4px', width: 'fit-content' }}>
        {[
          { id: 'utilisateurs', label: '👤 Utilisateurs (' + utilisateurs.length + ')' },
          { id: 'inscriptions',  label: '📚 Inscriptions (' + inscriptions.length + ')' },
        ].map(o => (
          <button key={o.id} onClick={() => setOnglet(o.id)}
            style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s ease', background: onglet === o.id ? 'white' : 'transparent', color: onglet === o.id ? '#1a73e8' : '#9aa0a6', boxShadow: onglet === o.id ? '0 2px 8px rgba(0,0,0,0.08)' : 'none' }}
            onMouseEnter={(e) => { if (onglet !== o.id) e.currentTarget.style.color = '#1a73e8'; }}
            onMouseLeave={(e) => { if (onglet !== o.id) e.currentTarget.style.color = '#9aa0a6'; }}
          >
            {o.label}
          </button>
        ))}
      </div>

      {/* ONGLET UTILISATEURS */}
      {onglet === 'utilisateurs' && (
        <div>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <input value={recherche} onChange={(e) => setRecherche(e.target.value)} placeholder="🔍 Rechercher..."
              style={{ flex: 1, minWidth: '200px', padding: '11px 16px', border: '1.5px solid #e0e0e0', borderRadius: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', transition: 'all 0.2s ease' }}
              onFocus={(e) => { e.target.style.borderColor = '#1a73e8'; e.target.style.boxShadow = '0 0 0 3px rgba(26,115,232,0.12)'; }}
              onBlur={(e) => { e.target.style.borderColor = '#e0e0e0'; e.target.style.boxShadow = 'none'; }}
            />
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {[
                { id: 'tous',     label: 'Tous (' + utilisateurs.length + ')' },
                { id: 'etudiant', label: '🎓 Étudiants (' + utilisateurs.filter(u => u.role === 'etudiant').length + ')' },
                { id: 'admin',    label: '⚙️ Admins (' + utilisateurs.filter(u => u.role === 'admin').length + ')' },
              ].map(f => (
                <button key={f.id} onClick={() => setFiltreRole(f.id)}
                  style={{ padding: '10px 14px', borderRadius: '8px', border: 'none', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s ease', background: filtreRole === f.id ? '#1a73e8' : '#f8f9fa', color: filtreRole === f.id ? 'white' : '#5f6368' }}
                  onMouseEnter={(e) => { if (filtreRole !== f.id) { e.currentTarget.style.background = '#e8f0fe'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
                  onMouseLeave={(e) => { if (filtreRole !== f.id) { e.currentTarget.style.background = '#f8f9fa'; e.currentTarget.style.transform = 'translateY(0)'; } }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 80px', padding: '14px 20px', background: '#f8f9fa', borderBottom: '1px solid #f0f0f0', fontSize: '11px', fontWeight: 700, color: '#9aa0a6', textTransform: 'uppercase' }}>
              <span>Utilisateur</span><span>Email</span><span>Rôle</span><span>Statut</span><span>Action</span>
            </div>
            {utilisateursFiltres.length === 0 ? (
              <div style={{ padding: '48px', textAlign: 'center', color: '#9aa0a6' }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔍</div>
                <div style={{ fontWeight: 600 }}>Aucun résultat</div>
              </div>
            ) : (
              utilisateursFiltres.map((u, i) => {
                const nbInscriptions = inscriptions.filter(ins => ins.email === u.email).length;
                return (
                  <div key={u.id_utilisateur}
                    style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 80px', padding: '16px 20px', alignItems: 'center', borderBottom: i < utilisateursFiltres.length - 1 ? '1px solid #f0f0f0' : 'none', transition: 'all 0.2s ease' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#f8f9fa'; e.currentTarget.style.transform = 'scale(1.01)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.transform = 'scale(1)'; }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '38px', height: '38px', background: u.role === 'admin' ? '#fce8e6' : '#e8f0fe', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', fontWeight: 700, color: u.role === 'admin' ? '#c62828' : '#1a73e8', flexShrink: 0 }}>
                        {u.nom?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#202124' }}>{u.prenom} {u.nom}</div>
                        <div style={{ fontSize: '11px', color: '#9aa0a6' }}>ID #{u.id_utilisateur}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: '13px', color: '#5f6368' }}>{u.email}</div>
                    <div>
                      <span style={{ background: u.role === 'admin' ? '#fce8e6' : '#e8f0fe', color: u.role === 'admin' ? '#c62828' : '#1a73e8', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600 }}>
                        {u.role === 'admin' ? '⚙️ Admin' : '🎓 Étudiant'}
                      </span>
                    </div>
                    <div>
                      {u.role === 'etudiant' ? (
                        <span style={{ background: nbInscriptions > 0 ? '#e6f4ea' : '#fff8e1', color: nbInscriptions > 0 ? '#2e7d32' : '#f57c00', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600 }}>
                          {nbInscriptions > 0 ? `${nbInscriptions} classe(s)` : 'Non inscrit'}
                        </span>
                      ) : (
                        <span style={{ background: '#e8f0fe', color: '#1a73e8', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600 }}>Système</span>
                      )}
                    </div>
                    <div>
                      <button onClick={() => openConfirmModal(u.id_utilisateur, 'utilisateur', `${u.prenom} ${u.nom}`)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ea4335', fontSize: '18px', padding: '6px 10px', borderRadius: '6px', transition: 'all 0.2s ease' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#fce8e6'; e.currentTarget.style.transform = 'scale(1.1)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.transform = 'scale(1)'; }}
                      >✕</button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ONGLET INSCRIPTIONS */}
      {onglet === 'inscriptions' && (
        <div>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
            <select value={filtreAnnee} onChange={(e) => setFiltreAnnee(e.target.value)}
              style={{ padding: '11px 14px', border: '1.5px solid #e0e0e0', borderRadius: '10px', fontSize: '13px', outline: 'none', background: 'white', minWidth: '180px', transition: 'all 0.2s ease', cursor: 'pointer' }}
              onFocus={(e) => { e.target.style.borderColor = '#1a73e8'; e.target.style.boxShadow = '0 0 0 3px rgba(26,115,232,0.12)'; }}
              onBlur={(e) => { e.target.style.borderColor = '#e0e0e0'; e.target.style.boxShadow = 'none'; }}
            >
              <option value="">📅 Toutes les années</option>
              {anneesUniques.map(a => <option key={a} value={a}>{a.replace('-', ' - ')}</option>)}
            </select>

            <select value={filtreClasse} onChange={(e) => setFiltreClasse(e.target.value)}
              style={{ padding: '11px 14px', border: '1.5px solid #e0e0e0', borderRadius: '10px', fontSize: '13px', outline: 'none', background: 'white', minWidth: '240px', transition: 'all 0.2s ease', cursor: 'pointer' }}
              onFocus={(e) => { e.target.style.borderColor = '#1a73e8'; e.target.style.boxShadow = '0 0 0 3px rgba(26,115,232,0.12)'; }}
              onBlur={(e) => { e.target.style.borderColor = '#e0e0e0'; e.target.style.boxShadow = 'none'; }}
            >
              <option value="">🏫 Toutes les classes</option>
              {classesUniques.sort().map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            {(filtreAnnee || filtreClasse) && (
              <button onClick={() => { setFiltreAnnee(''); setFiltreClasse(''); }}
                style={{ padding: '11px 16px', background: '#fce8e6', color: '#ea4335', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s ease' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#ea4335'; e.currentTarget.style.color = 'white'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#fce8e6'; e.currentTarget.style.color = '#ea4335'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >✕ Effacer filtres</button>
            )}

            <div style={{ marginLeft: 'auto', background: '#e8f0fe', color: '#1a73e8', padding: '10px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 700 }}>
              📊 {inscriptionsFiltrees.length} inscription(s)
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 2fr 80px', padding: '14px 20px', background: '#f8f9fa', borderBottom: '1px solid #f0f0f0', fontSize: '11px', fontWeight: 700, color: '#9aa0a6', textTransform: 'uppercase' }}>
              <span>Étudiant</span><span>Classe</span><span>Année académique</span><span>Action</span>
            </div>
            {inscriptionsFiltrees.length === 0 ? (
              <div style={{ padding: '48px', textAlign: 'center', color: '#9aa0a6' }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>📭</div>
                <div style={{ fontWeight: 600 }}>Aucune inscription trouvée</div>
                <div style={{ fontSize: '13px', marginTop: '4px' }}>
                  {filtreAnnee || filtreClasse ? 'Modifiez vos filtres' : 'Créez des utilisateurs pour voir les inscriptions'}
                </div>
              </div>
            ) : (
              inscriptionsFiltrees.map((ins, i) => (
                <div key={ins.id_inscription}
                  style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 2fr 80px', padding: '16px 20px', alignItems: 'center', borderBottom: i < inscriptionsFiltrees.length - 1 ? '1px solid #f0f0f0' : 'none', transition: 'all 0.2s ease' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#f8f9fa'; e.currentTarget.style.transform = 'scale(1.01)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.transform = 'scale(1)'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '34px', height: '34px', background: '#e8f0fe', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, color: '#1a73e8', flexShrink: 0 }}>
                      {ins.nom?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#202124' }}>{ins.prenom} {ins.nom}</div>
                      <div style={{ fontSize: '11px', color: '#9aa0a6' }}>{ins.email}</div>
                    </div>
                  </div>
                  <div>
                    <span style={{ background: '#e8f0fe', color: '#1a73e8', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600 }}>
                      📚 {ins.classe}
                    </span>
                  </div>
                  <div>
                    <span style={{ background: '#e6f4ea', color: '#2e7d32', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600 }}>
                      📅 {ins.annee_debut} - {ins.annee_fin}
                    </span>
                  </div>
                  <div>
                    <button onClick={() => openConfirmModal(ins.id_inscription, 'inscription', `${ins.prenom} ${ins.nom}`)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ea4335', fontSize: '18px', padding: '6px 10px', borderRadius: '6px', transition: 'all 0.2s ease' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#fce8e6'; e.currentTarget.style.transform = 'scale(1.1)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.transform = 'scale(1)'; }}
                    >✕</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
