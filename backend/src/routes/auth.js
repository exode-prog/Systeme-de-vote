const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

router.post('/login', async (req, res) => {
  const { email, mot_de_passe } = req.body;

  try {
    const result = await pool.query(
      'SELECT * FROM utilisateur WHERE email = $1', [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    const utilisateur = result.rows[0];

    const motDePasseValide = mot_de_passe === utilisateur.mot_de_passe;

    if (!motDePasseValide) {
      return res.status(401).json({ message: 'Mot de passe incorrect' });
    }

    const token = jwt.sign(
      {
        id:    utilisateur.id_utilisateur,
        email: utilisateur.email,
        role:  utilisateur.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Connexion réussie',
      token,
      utilisateur: {
        id:     utilisateur.id_utilisateur,
        nom:    utilisateur.nom,
        prenom: utilisateur.prenom,
        email:  utilisateur.email,
        role:   utilisateur.role
      }
    });

  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
});

module.exports = router;
