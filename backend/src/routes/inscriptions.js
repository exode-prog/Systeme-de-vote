const express = require('express');
const router  = express.Router();
const pool    = require('../config/db');
const { verifierToken, verifierAdmin } = require('../middlewares/auth');

router.get('/', verifierToken, verifierAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT i.id_inscription,
              u.nom, u.prenom, u.email,
              c.nom AS classe,
              a.annee_debut, a.annee_fin
       FROM inscription i
       JOIN utilisateur u      ON i.id_utilisateur = u.id_utilisateur
       JOIN classe c           ON i.id_classe = c.id_classe
       JOIN annee_academique a ON i.id_anneeacademique = a.id_anneeacademique
       ORDER BY a.annee_debut DESC, c.nom ASC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('GET inscriptions:', err.message);
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
});

router.post('/', verifierToken, verifierAdmin, async (req, res) => {
  const { id_utilisateur, id_classe, id_anneeAcademique } = req.body;
  try {
    if (!id_utilisateur || !id_classe || !id_anneeAcademique) {
      return res.status(400).json({ message: 'Tous les champs sont obligatoires' });
    }
    const dejaInscrit = await pool.query(
      `SELECT id_inscription FROM inscription
       WHERE id_utilisateur = $1 AND id_classe = $2 AND id_anneeacademique = $3`,
      [id_utilisateur, id_classe, id_anneeAcademique]
    );
    if (dejaInscrit.rows.length > 0) {
      return res.status(400).json({ message: 'Cet étudiant est déjà inscrit dans cette classe pour cette année' });
    }
    const result = await pool.query(
      `INSERT INTO inscription (id_utilisateur, id_classe, id_anneeacademique)
       VALUES ($1, $2, $3) RETURNING *`,
      [id_utilisateur, id_classe, id_anneeAcademique]
    );
    res.status(201).json({ message: 'Inscription créée', inscription: result.rows[0] });
  } catch (err) {
    console.error('POST inscriptions:', err.message);
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
});

router.delete('/:id', verifierToken, verifierAdmin, async (req, res) => {
  try {
    const existe = await pool.query(
      `SELECT id_inscription FROM inscription WHERE id_inscription = $1`, [req.params.id]
    );
    if (existe.rows.length === 0) {
      return res.status(404).json({ message: 'Inscription non trouvée' });
    }
    await pool.query(`DELETE FROM inscription WHERE id_inscription = $1`, [req.params.id]);
    res.json({ message: 'Inscription supprimée' });
  } catch (err) {
    console.error('DELETE inscriptions:', err.message);
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
});

module.exports = router;
