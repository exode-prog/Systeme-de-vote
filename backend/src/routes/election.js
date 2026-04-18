const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { verifierToken, verifierAdmin } = require('../middlewares/auth');

router.post('/', verifierToken, verifierAdmin, async (req, res) => {
  const { nom, id_anneeAcademique } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO election (nom, statut, id_anneeacademique)
       VALUES ($1, 'en_attente', $2) RETURNING *`,
      [nom, id_anneeAcademique]
    );
    res.status(201).json({
      message: 'Election créée avec succès',
      election: result.rows[0]
    });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
});

router.get('/', verifierToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT e.*, a.annee_debut, a.annee_fin
       FROM election e
       JOIN annee_academique a ON e.id_anneeacademique = a.id_anneeacademique
       ORDER BY e.id_election DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
});

router.get('/:id', verifierToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT e.*, a.annee_debut, a.annee_fin
       FROM election e
       JOIN annee_academique a ON e.id_anneeacademique = a.id_anneeacademique
       WHERE e.id_election = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Election non trouvée' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
});

router.patch('/:id/ouvrir', verifierToken, verifierAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE election SET statut = 'ouverte'
       WHERE id_election = $1 RETURNING *`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Election non trouvée' });
    }
    res.json({ message: 'Election ouverte', election: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
});

router.patch('/:id/fermer', verifierToken, verifierAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE election SET statut = 'fermee'
       WHERE id_election = $1 RETURNING *`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Election non trouvée' });
    }
    res.json({ message: 'Election fermée', election: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
});

module.exports = router;
