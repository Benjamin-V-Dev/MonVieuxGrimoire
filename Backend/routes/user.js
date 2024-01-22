// Importation des package
const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/user')

router.post('/signup', userCtrl.signup);
router.post('/login', userCtrl.login);


// Exportation Module pour utilisation app.js
module.exports = router;