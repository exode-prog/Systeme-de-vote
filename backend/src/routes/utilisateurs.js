const express = require('express');
const router  = express.Router();
const pool    = require('../config/db');
const { verifierToken, verifierAdmin } = require('../middlewares/auth');

router.get('/', verifierToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id_utilisateur, nom, prenom, email, role FROM utilisateur ORDER BY id_utilisateur DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('GET utilisateurs:', err.message);
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
});

router.post('/', verifierToken, verifierAdmin, async (req, res) => {
  const { nom, prenom, email, mot_de_passe, role } = req.body;
  try {
    if (!nom || !prenom || !email || !mot_de_passe || !role) {
      return res.status(400).json({ message: 'Tous les champs sont obligatoires' });
    }
    const emailExiste = await pool.query(
      `SELECT id_utilisateur FROM utilisateur WHERE email = $1`, [email]
    );
    if (emailExiste.rows.length > 0) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }
    const result = await pool.query(
      `INSERT INTO utilisateur (nom, prenom, email, mot_de_passe, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id_utilisateur, nom, prenom, email, role`,
      [nom, prenom, email, mot_de_passe, role]
    );
    res.status(201).json({ message: 'Utilisateur créé', utilisateur: result.rows[0] });
  } catch (err) {
    console.error('POST utilisateurs:', err.message);
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
});

router.delete('/:id', verifierToken, verifierAdmin, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`DELETE FROM commentaire WHERE id_utilisateur = $1`, [req.params.id]);
    await client.query(`DELETE FROM vote WHERE id_utilisateur = $1`, [req.params.id]);
    await client.query(`DELETE FROM candidat WHERE id_utilisateur = $1`, [req.params.id]);
    await client.query(`DELETE FROM inscription WHERE id_utilisateur = $1`, [req.params.id]);
    await client.query(`DELETE FROM utilisateur WHERE id_utilisateur = $1`, [req.params.id]);
    await client.query('COMMIT');
    res.json({ message: 'Utilisateur et toutes ses données supprimés' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('DELETE utilisateurs:', err.message);
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  } finally {
    client.release();
  }
});

module.exports = router;
