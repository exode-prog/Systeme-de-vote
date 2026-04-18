const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { verifierToken } = require('../middlewares/auth');

router.post('/', verifierToken, async (req, res) => {
  const { contenu, id_election, id_candidat } = req.body;
  const id_utilisateur = req.utilisateur.id;

  try {
    const electionExiste = await pool.query(
      `SELECT * FROM election WHERE id_election = $1`,
      [id_election]
    );
    if (electionExiste.rows.length === 0) {
      return res.status(404).json({ message: 'Election non trouvée' });
    }

    if (id_candidat) {
      const candidatExiste = await pool.query(
        `SELECT * FROM candidat WHERE id_candidat = $1`,
        [id_candidat]
      );
      if (candidatExiste.rows.length === 0) {
        return res.status(404).json({ message: 'Candidat non trouvé' });
      }
    }

    const result = await pool.query(
      `INSERT INTO commentaire (contenu, id_utilisateur, id_election, id_candidat)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [contenu, id_utilisateur, id_election, id_candidat || null]
    );
    res.status(201).json({
      message: 'Commentaire ajouté avec succès',
      commentaire: result.rows[0]
    });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
});

router.get('/election/:id_election', verifierToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
         co.id_commentaire,
         co.contenu,
         u.nom, u.prenom,
         ca.id_candidat,
         u2.nom    AS candidat_nom,
         u2.prenom AS candidat_prenom
       FROM commentaire co
       JOIN utilisateur u       ON co.id_utilisateur = u.id_utilisateur
       LEFT JOIN candidat ca    ON co.id_candidat = ca.id_candidat
       LEFT JOIN utilisateur u2 ON ca.id_utilisateur = u2.id_utilisateur
       WHERE co.id_election = $1
       ORDER BY co.id_commentaire DESC`,
      [req.params.id_election]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
});

router.delete('/:id', verifierToken, async (req, res) => {
  const id_utilisateur = req.utilisateur.id;
  try {
    const commentaire = await pool.query(
      `SELECT * FROM commentaire 
       WHERE id_commentaire = $1 AND id_utilisateur = $2`,
      [req.params.id, id_utilisateur]
    );
    if (commentaire.rows.length === 0) {
      return res.status(404).json({ message: 'Commentaire non trouvé' });
    }

    await pool.query(
      'DELETE FROM commentaire WHERE id_commentaire = $1',
      [req.params.id]
    );
    res.json({ message: 'Commentaire supprimé avec succès' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
});

module.exports = router;
