const express = require('express');
const router  = express.Router();
const pool    = require('../config/db');
const { verifierToken, verifierAdmin } = require('../middlewares/auth');

router.get('/', verifierToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM annee_academique ORDER BY annee_debut DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('GET annees:', err.message);
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
});

router.post('/', verifierToken, verifierAdmin, async (req, res) => {
  const { annee_debut, annee_fin } = req.body;
  try {
    if (!annee_debut || !annee_fin) {
      return res.status(400).json({ message: 'Les deux années sont obligatoires' });
    }
    if (parseInt(annee_fin) <= parseInt(annee_debut)) {
      return res.status(400).json({ message: 'L\'année de fin doit être supérieure à l\'année de début' });
    }
    const dejaExiste = await pool.query(
      `SELECT id_anneeacademique FROM annee_academique WHERE annee_debut = $1 AND annee_fin = $2`,
      [annee_debut, annee_fin]
    );
    if (dejaExiste.rows.length > 0) {
      return res.status(400).json({ message: 'Cette année académique existe déjà' });
    }
    const result = await pool.query(
      `INSERT INTO annee_academique (annee_debut, annee_fin) VALUES ($1, $2) RETURNING *`,
      [annee_debut, annee_fin]
    );
    res.status(201).json({ message: 'Année académique créée', annee: result.rows[0] });
  } catch (err) {
    console.error('POST annees:', err.message);
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
});

router.delete('/:id', verifierToken, verifierAdmin, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`DELETE FROM commentaire WHERE id_election IN (SELECT id_election FROM election WHERE id_anneeacademique = $1)`, [req.params.id]);
    await client.query(`DELETE FROM vote WHERE id_election IN (SELECT id_election FROM election WHERE id_anneeacademique = $1)`, [req.params.id]);
    await client.query(`DELETE FROM candidat WHERE id_candidat IN (SELECT v.id_candidat FROM vote v JOIN election e ON v.id_election = e.id_election WHERE e.id_anneeacademique = $1)`, [req.params.id]);
    await client.query(`DELETE FROM election WHERE id_anneeacademique = $1`, [req.params.id]);
    await client.query(`DELETE FROM inscription WHERE id_anneeacademique = $1`, [req.params.id]);
    await client.query(`DELETE FROM annee_academique WHERE id_anneeacademique = $1`, [req.params.id]);
    await client.query('COMMIT');
    res.json({ message: 'Année académique et toutes ses données supprimées' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('DELETE annees:', err.message);
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  } finally {
    client.release();
  }
});



router.get('/active', verifierToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM annee_academique ORDER BY annee_debut DESC LIMIT 1`
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Aucune année académique trouvée' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
});

module.exports = router;
