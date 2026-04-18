const express = require('express');
const router  = express.Router();
const pool    = require('../config/db');
const { verifierToken } = require('../middlewares/auth');

router.post('/', verifierToken, async (req, res) => {
  const { id_candidat, id_election } = req.body;
  const id_utilisateur = req.utilisateur.id;

  try {
    const election = await pool.query(
      `SELECT * FROM election WHERE id_election = $1 AND statut = 'ouverte'`,
      [id_election]
    );
    if (election.rows.length === 0) {
      return res.status(400).json({ message: 'Election non disponible' });
    }

    const id_anneeacademique = election.rows[0].id_anneeacademique;

    const inscritDansCetteAnnee = await pool.query(
      `SELECT id_inscription FROM inscription
       WHERE id_utilisateur = $1 AND id_anneeacademique = $2`,
      [id_utilisateur, id_anneeacademique]
    );
    if (inscritDansCetteAnnee.rows.length === 0) {
      return res.status(403).json({
        message: 'Vous n\'êtes pas inscrit pour l\'année académique de cette élection'
      });
    }

    const dejaVote = await pool.query(
      `SELECT * FROM vote WHERE id_utilisateur = $1 AND id_election = $2`,
      [id_utilisateur, id_election]
    );
    if (dejaVote.rows.length > 0) {
      return res.status(400).json({ message: 'Vous avez déjà voté pour cette élection' });
    }

    const candidatExiste = await pool.query(
      `SELECT c.id_candidat FROM candidat c
       JOIN inscription i ON c.id_classe = i.id_classe
                         AND c.id_utilisateur = i.id_utilisateur
       WHERE c.id_candidat = $1
       AND i.id_anneeacademique = $2
       AND c.statut = 'valide'`,
      [id_candidat, id_anneeacademique]
    );
    if (candidatExiste.rows.length === 0) {
      return res.status(404).json({ message: 'Candidat non trouvé ou non validé pour cette élection' });
    }

    await pool.query(
      `INSERT INTO vote (id_candidat, id_utilisateur, id_election)
       VALUES ($1, $2, $3)`,
      [id_candidat, id_utilisateur, id_election]
    );

    const resultats = await pool.query(
      `SELECT c.id_candidat, u.nom, u.prenom,
              COUNT(v.id_vote) AS nombre_votes
       FROM candidat c
       JOIN utilisateur u  ON c.id_utilisateur = u.id_utilisateur
       JOIN inscription i  ON c.id_classe = i.id_classe
                          AND c.id_utilisateur = i.id_utilisateur
       LEFT JOIN vote v    ON v.id_candidat = c.id_candidat
                          AND v.id_election = $1
       WHERE i.id_anneeacademique = (SELECT id_anneeacademique FROM election WHERE id_election = $1)
       AND c.statut = 'valide'
       GROUP BY c.id_candidat, u.nom, u.prenom
       ORDER BY nombre_votes DESC`,
      [id_election]
    );

    const io = req.app.get('io');
    io.to(`election_${id_election}`).emit('resultatsMAJ', resultats.rows);

    res.status(201).json({ message: 'Vote soumis avec succès' });
  } catch (err) {
    console.error('POST vote:', err.message);
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
});

router.get('/resultats/:id_election', verifierToken, async (req, res) => {
  try {
    const election = await pool.query(
      `SELECT * FROM election WHERE id_election = $1`,
      [req.params.id_election]
    );
    if (election.rows.length === 0) {
      return res.status(404).json({ message: 'Election non trouvée' });
    }

    const id_anneeacademique = election.rows[0].id_anneeacademique;

    const resultats = await pool.query(
      `SELECT c.id_candidat, u.nom, u.prenom,
              COUNT(v.id_vote) AS nombre_votes
       FROM candidat c
       JOIN utilisateur u  ON c.id_utilisateur = u.id_utilisateur
       JOIN inscription i  ON c.id_classe = i.id_classe
                          AND c.id_utilisateur = i.id_utilisateur
       LEFT JOIN vote v    ON v.id_candidat = c.id_candidat
                          AND v.id_election = $1
       WHERE i.id_anneeacademique = $2
       AND c.statut = 'valide'
       GROUP BY c.id_candidat, u.nom, u.prenom
       ORDER BY nombre_votes DESC`,
      [req.params.id_election, id_anneeacademique]
    );

    res.json({ election: election.rows[0], resultats: resultats.rows });
  } catch (err) {
    console.error('GET resultats:', err.message);
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
});

module.exports = router;
