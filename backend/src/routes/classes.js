const express = require('express');
const router  = express.Router();
const pool    = require('../config/db');
const { verifierToken } = require('../middlewares/auth');

router.get('/', verifierToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.id_classe, c.nom, f.nom AS filiere
       FROM classe c
       JOIN filiere f ON c.id_filiere = f.id_filiere
       ORDER BY c.nom`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
});

router.get('/moi', verifierToken, async (req, res) => {
  const id_utilisateur = req.utilisateur.id;
  try {
    const result = await pool.query(
      `SELECT DISTINCT c.id_classe, c.nom, f.nom AS filiere,
              a.annee_debut, a.annee_fin, a.id_anneeacademique,
              i.id_inscription
       FROM inscription i
       JOIN classe c           ON i.id_classe = c.id_classe
       JOIN filiere f          ON c.id_filiere = f.id_filiere
       JOIN annee_academique a ON i.id_anneeacademique = a.id_anneeacademique
       WHERE i.id_utilisateur = $1
       ORDER BY a.annee_debut DESC`,
      [id_utilisateur]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
});

module.exports = router;
