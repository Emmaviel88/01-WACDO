const express = require('express');

const {default: mongoose} = require('mongoose');

const connectDB = require('./config/db');

const dotenv = require('dotenv');
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const setupSwagger = require('./swagger');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
// app.get('/', (req, res) => {
//     res.json({ message: 'Bienvenue sur l\'API Wacdo' });
// });

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

connectDB(); // commenté pour les tests JEST

setupSwagger(app);

// Start server
app.listen(PORT, () => {
    console.log(`Server écoute sur le port ${PORT}`);
});