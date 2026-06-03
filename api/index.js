const express = require('express');

const {default: mongoose} = require('mongoose');

// const connectDB = require('./config/db');

const cors = require('cors');

// const swaggerSpec = require('./swagger');
const setupSwagger = require('./swagger');
const path = require('path');
const dotenv = require('dotenv').config({path: path.join(__dirname, '.env')});
// dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

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

// app.use('/api/customers', require('./routes/customers.routes')); // Non demandé pour l'instant

app.use('/api/products', require('./routes/products.routes'));

app.use('/api/orders', require('./routes/orders.routes'));

app.use('/api/menus', require('./routes/menus.route'));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Une erreur s\'est produite ' + err });
});

if (process.env.NODE_ENV !== 'test') {
    //  connectDB(); // Connexion à la base de données MongoDB uniquement si l'environnement n'est pas "test"
} 
else {
    console.log("Environnement de test détecté, connexion à la base de données MongoDB ignorée");
}

setupSwagger(app);

if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`Server écoute sur le port ${PORT}`);
    });
}

module.exports = app;