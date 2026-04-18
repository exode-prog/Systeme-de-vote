const express = require('express');
const cors    = require('cors');
const http    = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app    = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

app.set('io', io);

app.use('/api/auth',         require('./routes/auth'));
app.use('/api/elections',    require('./routes/election'));
app.use('/api/candidats',    require('./routes/candidat'));
app.use('/api/votes',        require('./routes/vote'));
app.use('/api/commentaires', require('./routes/commentaire'));
app.use('/api/deliberation', require('./routes/deliberation'));

app.use('/api/utilisateurs',      require('./routes/utilisateurs'));
app.use('/api/classes',           require('./routes/classes'));
app.use('/api/annees-academiques',require('./routes/annees'));
app.use('/api/inscriptions',      require('./routes/inscriptions'));

io.on('connection', (socket) => {
  console.log('Client connecté :', socket.id);

  socket.on('rejoindreElection', (id_election) => {
    socket.join(`election_${id_election}`);
    console.log(`Client ${socket.id} a rejoint election_${id_election}`);
  });

  socket.on('disconnect', () => {
    console.log('Client déconnecté :', socket.id);
  });
});

app.get('/', (req, res) => {
  res.json({ message: 'API Système de Vote opérationnelle' });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
