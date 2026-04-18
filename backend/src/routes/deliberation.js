const express = require('express');
const router  = express.Router();
const pool    = require('../config/db');
const { verifierToken, verifierAdmin } = require('../middlewares/auth');

const envoyerMail = async (destinataire, sujet, contenu) => {
  try {
    const brevo = require('@getbrevo/brevo');
    const client = brevo.ApiClient.instance;
    client.authentications['api-key'].apiKey = process.env.BREVO_API_KEY;
    const api  = new brevo.TransactionalEmailsApi();
    const mail = new brevo.SendSmtpEmail();
    mail.sender      = { name: process.env.BREVO_SENDER_NAME, email: process.env.BREVO_SENDER_EMAIL };
    mail.to          = [{ email: destinataire }];
    mail.subject     = sujet;
    mail.htmlContent = contenu;
    await api.sendTransacEmail(mail);
    console.log(`Mail envoyé à ${destinataire}`);
  } catch (err) {
    console.error(`Erreur mail vers ${destinataire}:`, err.message);
  }
};

router.post('/:id_election', verifierToken, verifierAdmin, async (req, res) => {
  const { id_election } = req.params;

  try {
    const election = await pool.query(
      `SELECT * FROM election WHERE id_election = $1`, [id_election]
    );
    if (election.rows.length === 0) {
      return res.status(404).json({ message: 'Election non trouvée' });
    }
    if (election.rows[0].statut !== 'fermee') {
      return res.status(400).json({ message: "L'élection doit être fermée avant de délibérer" });
    }

    const resultats = await pool.query(
      `SELECT c.id_candidat, u.nom, u.prenom, u.email,
              COUNT(v.id_vote) AS nombre_votes
       FROM candidat c
       JOIN utilisateur u  ON c.id_utilisateur = u.id_utilisateur
       LEFT JOIN vote v    ON v.id_candidat = c.id_candidat
                          AND v.id_election = $1
       GROUP BY c.id_candidat, u.nom, u.prenom, u.email
       ORDER BY nombre_votes DESC`,
      [id_election]
    );

    if (resultats.rows.length === 0) {
      return res.status(400).json({ message: 'Aucun candidat trouvé pour cette élection' });
    }

    const gagnant = resultats.rows[0];

    for (const candidat of resultats.rows) {
      const estGagnant = candidat.id_candidat === gagnant.id_candidat;
      const sujet = estGagnant
        ? `🏆 Félicitations ${candidat.prenom} — Vous avez été élu !`
        : `📊 Résultats — ${election.rows[0].nom}`;

      const contenu = estGagnant ? `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
          <div style="background:linear-gradient(135deg,#1a73e8,#0d47a1);padding:30px;border-radius:12px;color:white;text-align:center;margin-bottom:20px">
            <h1 style="margin:0;font-size:28px">🏆 Félicitations !</h1>
          </div>
          <h2>Bonjour ${candidat.prenom} ${candidat.nom},</h2>
          <p>Vous avez été <strong>élu(e)</strong> lors de l'élection <strong>${election.rows[0].nom}</strong> avec <strong>${candidat.nombre_votes} vote(s)</strong>.</p>
          <p>Toute l'équipe vous félicite et vous souhaite bonne chance dans vos nouvelles fonctions.</p>
          <p style="color:#9aa0a6;font-size:12px;margin-top:30px">Système de Vote Électronique © 2025</p>
        </div>` : `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
          <div style="background:linear-gradient(135deg,#1a73e8,#0d47a1);padding:30px;border-radius:12px;color:white;text-align:center;margin-bottom:20px">
            <h1 style="margin:0;font-size:24px">📊 Résultats de l'élection</h1>
          </div>
          <h2>Bonjour ${candidat.prenom} ${candidat.nom},</h2>
          <p>L'élection <strong>${election.rows[0].nom}</strong> est terminée.</p>
          <p>Le gagnant est <strong>${gagnant.prenom} ${gagnant.nom}</strong> avec <strong>${gagnant.nombre_votes} vote(s)</strong>.</p>
          <p>Merci pour votre participation et votre engagement.</p>
          <p style="color:#9aa0a6;font-size:12px;margin-top:30px">Système de Vote Électronique © 2025</p>
        </div>`;

      await envoyerMail(candidat.email, sujet, contenu);
    }

    const electeurs = await pool.query(
      `SELECT DISTINCT u.nom, u.prenom, u.email
       FROM vote v
       JOIN utilisateur u ON v.id_utilisateur = u.id_utilisateur
       WHERE v.id_election = $1
       AND u.email NOT IN (
         SELECT u2.email FROM candidat c
         JOIN utilisateur u2 ON c.id_utilisateur = u2.id_utilisateur
       )`,
      [id_election]
    );

    for (const electeur of electeurs.rows) {
      await envoyerMail(
        electeur.email,
        `📊 Résultats — ${election.rows[0].nom}`,
        `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
          <div style="background:linear-gradient(135deg,#1a73e8,#0d47a1);padding:30px;border-radius:12px;color:white;text-align:center;margin-bottom:20px">
            <h1 style="margin:0;font-size:24px">📊 Résultats de l'élection</h1>
          </div>
          <h2>Bonjour ${electeur.prenom} ${electeur.nom},</h2>
          <p>L'élection <strong>${election.rows[0].nom}</strong> est terminée.</p>
          <p>Le gagnant est <strong>${gagnant.prenom} ${gagnant.nom}</strong> avec <strong>${gagnant.nombre_votes} vote(s)</strong>.</p>
          <p>Merci pour votre participation citoyenne !</p>
          <p style="color:#9aa0a6;font-size:12px;margin-top:30px">Système de Vote Électronique © 2025</p>
        </div>`
      );
    }

    await pool.query(
      `UPDATE election SET statut = 'deliberee' WHERE id_election = $1`,
      [id_election]
    );

    const io = req.app.get('io');
    io.to(`election_${id_election}`).emit('deliberation', { gagnant, resultats: resultats.rows });

    res.json({
      message:   'Délibération effectuée avec succès',
      gagnant,
      resultats: resultats.rows
    });

  } catch (err) {
    console.error('Erreur délibération:', err);
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
});

module.exports = router;
