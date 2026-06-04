const express = require('express');

const cors = require('cors');

const setupSwagger = require('./swagger');
const path = require('path');
require('dotenv').config({path: path.join(__dirname, '.env')});

const app = express();
const PORT = process.env.PORT || 5000;

const connectDB = require('../api/config/db');

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.json({
    status: 'OK',
    message: 'WACDO API is running'
  });
});

app.get('/test-js', (req, res) => {
  res.type('application/javascript');
  res.send('console.log("test");');
});

app.use('/api/employees', require('./routes/employees.routes'));

// app.use('/api/customers', require('./routes/customers.routes')); // Non demandé dans le cahier des charges, à implémenter ultérieurement

app.use('/api/products', require('./routes/products.routes'));

app.use('/api/orders', require('./routes/orders.routes'));

app.use('/api/menus', require('./routes/menus.route'));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Une erreur s\'est produite ' + err });
});

const start = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`✅ Server écoute sur le port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Impossible de démarrer le serveur :', err);
  }
};

setupSwagger(app);

if (process.env.NODE_ENV !== 'test') {
  //  connectDB(); // Connexion à la base de données MongoDB uniquement si l'environnement n'est pas "test"
  start();
} 
else {
    console.log("Environnement de test détecté, connexion à la base de données MongoDB ignorée");
}

module.exports = app;