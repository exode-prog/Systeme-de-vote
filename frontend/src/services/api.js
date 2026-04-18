import axios from 'axios';

const API = axios.create({
  baseURL: 'http://192.168.1.45:3000/api',
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const login = (data) => API.post('/auth/login', data);
export const supprimerInscription = (id) => API.delete(`/inscriptions/${id}`);
export const getElections = () => API.get('/elections');
export const getElection = (id) => API.get(`/elections/${id}`);
export const creerElection = (data) => API.post('/elections', data);
export const ouvrirElection = (id) => API.patch(`/elections/${id}/ouvrir`);
export const fermerElection = (id) => API.patch(`/elections/${id}/fermer`);
export const delibererElection = (id) => API.post(`/deliberation/${id}`);

/*export const getCandidats = () => API.get('/candidats');
export const getCandidats = (id_election) =>
  id_election
    ? API.get(`/candidats?id_election=${id_election}`)
    : API.get('/candidats');
*/
export const getCandidats = (id_election) =>
  id_election
    ? API.get(`/candidats?id_election=${id_election}`)
    : API.get('/candidats');

export const getCandidatsAdmin = (id_election) =>
  id_election
    ? API.get(`/candidats/admin?id_election=${id_election}`)
    : API.get('/candidats/admin');

export const postuler = (data) => API.post('/candidats', data);
export const retirerCandidature = (id) => API.delete(`/candidats/${id}`);

export const voter = (data) => API.post('/votes', data);
export const getResultats = (id) => API.get(`/votes/resultats/${id}`);

export const getCommentaires = (id) => API.get(`/commentaires/election/${id}`);
export const ajouterCommentaire = (data) => API.post('/commentaires', data);
export const supprimerCommentaire = (id) => API.delete(`/commentaires/${id}`);

export const getUtilisateurs = () => API.get('/utilisateurs');
export const creerUtilisateur = (data) => API.post('/utilisateurs', data);
export const modifierUtilisateur = (id, data) => API.put(`/utilisateurs/${id}`, data);
export const supprimerUtilisateur = (id) => API.delete(`/utilisateurs/${id}`);

export const getClasses = () => API.get('/classes');
export const getAnneesAcademiques = () => API.get('/annees-academiques');
export const creerInscription = (data) => API.post('/inscriptions', data);
export const getInscriptions = () => API.get('/inscriptions');

export const validerCandidat  = (id) => API.patch(`/candidats/${id}/valider`);
export const rejeterCandidat  = (id) => API.patch(`/candidats/${id}/rejeter`);
export const getMesClasses    = ()   => API.get('/classes/moi');

export const creerAnneeAcademique   = (data) => API.post('/annees-academiques', data);
export const supprimerAnneeAcademique = (id) => API.delete(`/annees-academiques/${id}`);
