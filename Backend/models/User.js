// Importation des packages
const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const userSchema = mongoose.Schema({
    email : { type : String, required: true, unique : true },
    password : { type : String, required: true },
});

// Vérification de l'email : unique-validator vérifie que l'email n'éxiste pas déja dans la BDD avant la création du schèma
mongoose.plugin(uniqueValidator);

// Exportation du module
module.exports = mongoose.model('User', userSchema);