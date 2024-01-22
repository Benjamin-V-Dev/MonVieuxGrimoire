// Importation des package
require('dotenv').config();
const express = require('express');
const helmet = require('helmet')
const mongoose = require('mongoose')
const path = require('path');
const app = express();


// Import de helmet
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    imgSrc: ["'self'", "http://localhost:3000"],
    // autres directives si nécessaire
  },
}));


// Import des routes
const userRoutes = require('./routes/user')
const bookRoutes = require('./routes/book')

// Connexion Base de donnée
mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/?retryWrites=true&w=majority`,
  { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));



// Utilisation des données en Json
app.use(express.json())


// Gestion CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});


// Utilisation des routes
app.use('/api/books', bookRoutes);
app.use('/api/auth', userRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')));


// Exportation Module pour utilisation server.js
module.exports = app