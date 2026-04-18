const express = require('express');
const router  = express.Router();
const pool    = require('../config/db');
const { verifierToken, verifierAdmin } = require('../middlewares/auth');

router.post('/', verifierToken, async (req, res) => {
  const { programme, id_classe, id_election } = req.body;
  const id_utilisateur = req.utilisateur.id;

  try {
    const election = await pool.query(
      `SELECT * FROM election WHERE id_election = $1 AND statut = 'ouverte'`,
      [id_election]
    );
    if (election.rows.length === 0) {
      return res.status(400).json({ message: 'Election non disponible ou non ouverte' });
    }

    const id_anneeacademique = election.rows[0].id_anneeacademique;

    const inscritDansCetteAnnee = await pool.query(
      `SELECT id_inscription FROM inscription
       WHERE id_utilisateur = $1
       AND id_anneeacademique = $2
       AND id_classe = $3`,
      [id_utilisateur, id_anneeacademique, id_classe]
    );
    if (inscritDansCetteAnnee.rows.length === 0) {
      return res.status(403).json({
        message: 'Vous n\'etes pas inscrit dans cette classe pour l\'annee academique de cette election'
      });
    }

    const dejaCandidat = await pool.query(
      `SELECT id_candidat FROM candidat
       WHERE id_utilisateur = $1 AND id_election = $2`,
      [id_utilisateur, id_election]
    );
    if (dejaCandidat.rows.length > 0) {
      return res.status(400).json({ message: 'Vous avez deja soumis une candidature pour cette election' });
    }

    const candidatValideExiste = await pool.query(
      `SELECT id_candidat FROM candidat
       WHERE id_classe = $1 AND id_election = $2 AND statut = 'valide'`,
      [id_classe, id_election]
    );
    if (candidatValideExiste.rows.length > 0) {
      return res.status(400).json({
        message: 'Un candidat a deja ete valide pour cette classe dans cette election'
      });
    }

    const result = await pool.query(
      `INSERT INTO candidat (programme, id_classe, id_utilisateur, statut, id_election)
       VALUES ($1, $2, $3, 'en_attente', $4) RETURNING *`,
      [programme, id_classe, id_utilisateur, id_election]
    );

    res.status(201).json({
      message: 'Candidature soumise avec succes — en attente de validation',
      candidat: result.rows[0]
    });
  } catch (err) {
    console.error('POST candidat:', err.message);
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
});

/*router.get('/', verifierToken, async (req, res) => {
  const { id_election } = req.query;
  try {
    let query = `
      SELECT c.id_candidat, c.programme, c.statut, c.id_election,
             u.nom, u.prenom, u.email,
             cl.nom AS classe, cl.id_classe
      FROM candidat c
      JOIN utilisateur u ON c.id_utilisateur = u.id_utilisateur
      JOIN classe cl     ON c.id_classe = cl.id_classe
    `;
    const params = [];

    if (id_election) {
      query += ` WHERE c.id_election = $1`;
      params.push(id_election);
    }

    query += ` ORDER BY c.id_candidat DESC`;
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('GET candidats:', err.message);
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
});
*/

 router.get('/', verifierToken, async (req, res) => {
  const { id_election } = req.query;
  try {
    let query = `
      SELECT c.id_candidat, c.programme, c.statut, c.id_election,
             u.nom, u.prenom, u.email,
             cl.nom AS classe, cl.id_classe
      FROM candidat c
      JOIN utilisateur u ON c.id_utilisateur = u.id_utilisateur
      JOIN classe cl     ON c.id_classe = cl.id_classe
      WHERE c.statut = 'valide'
    `;
    const params = [];

    if (id_election) {
      query += ` AND c.id_election = $1`;
      params.push(id_election);
    }

    query += ` ORDER BY c.id_candidat DESC`;
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('GET candidats:', err.message);
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
});


//Nouvelle route
router.get('/admin', verifierToken, verifierAdmin, async (req, res) => {
  const { id_election } = req.query;
  try {
    let query = `
      SELECT c.id_candidat, c.programme, c.statut, c.id_election,
             u.nom, u.prenom, u.email,
             cl.nom AS classe, cl.id_classe
      FROM candidat c
      JOIN utilisateur u ON c.id_utilisateur = u.id_utilisateur
      JOIN classe cl     ON c.id_classe = cl.id_classe
    `;
    const params = [];

    if (id_election) {
      query += ` WHERE c.id_election = $1`;
      params.push(id_election);
    }

    query += ` ORDER BY c.id_candidat DESC`;
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('GET candidats admin:', err.message);
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
});


router.patch('/:id/valider', verifierToken, verifierAdmin, async (req, res) => {
  try {
    const candidat = await pool.query(
      `SELECT * FROM candidat WHERE id_candidat = $1`, [req.params.id]
    );
    if (candidat.rows.length === 0) {
      return res.status(404).json({ message: 'Candidat non trouve' });
    }

    const dejaValide = await pool.query(
      `SELECT id_candidat FROM candidat
       WHERE id_classe = $1 AND id_election = $2 AND statut = 'valide'`,
      [candidat.rows[0].id_classe, candidat.rows[0].id_election]
    );
    if (dejaValide.rows.length > 0) {
      return res.status(400).json({ message: 'Un candidat est deja valide pour cette classe dans cette election' });
    }

    const result = await pool.query(
      `UPDATE candidat SET statut = 'valide' WHERE id_candidat = $1 RETURNING *`,
      [req.params.id]
    );
    res.json({ message: 'Candidature validee', candidat: result.rows[0] });
  } catch (err) {
    console.error('PATCH valider:', err.message);
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
});

router.patch('/:id/rejeter', verifierToken, verifierAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE candidat SET statut = 'rejete' WHERE id_candidat = $1 RETURNING *`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Candidat non trouve' });
    }
    res.json({ message: 'Candidature rejetee', candidat: result.rows[0] });
  } catch (err) {
    console.error('PATCH rejeter:', err.message);
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
});

router.delete('/:id', verifierToken, async (req, res) => {
  const id_utilisateur = req.utilisateur.id;
  try {
    const candidat = await pool.query(
      `SELECT * FROM candidat WHERE id_candidat = $1 AND id_utilisateur = $2`,
      [req.params.id, id_utilisateur]
    );
    if (candidat.rows.length === 0) {
      return res.status(404).json({ message: 'Candidature non trouvee' });
    }
    if (candidat.rows[0].statut === 'valide') {
      return res.status(400).json({ message: 'Impossible de retirer une candidature validee' });
    }
    await pool.query('DELETE FROM candidat WHERE id_candidat = $1', [req.params.id]);
    res.json({ message: 'Candidature retiree' });
  } catch (err) {
    console.error('DELETE candidat:', err.message);
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
});

module.exports = router;
