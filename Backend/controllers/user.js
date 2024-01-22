// Importation des package
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const validator = require('validator');
const passwordValidator = require('password-validator');

const User = require('../models/User');


// Création d'un schéma de mot de passe
let schema = new passwordValidator();
schema
.is().min(12)                                    // Longueur minimale 12
.has().uppercase()                              // Doit avoir des lettres majuscules
.has().lowercase()                              // Doit avoir des lettres minuscules
.has().digits(2)                                // Doit avoir au moins 2 chiffres
.has().not().spaces()                           // Ne doit pas avoir d'espaces

// Middleware pour créer un nouveau compte : (signup)

exports.signup = (req, res, next) => {
    // Valider l'adresse e-mail
    if (!validator.isEmail(req.body.email)) {
        return res.status(401).json({ error: "Adresse e-mail invalide." });
    }


    // Valider le mot de passe
    if (!schema.validate(req.body.password)) {
        return res.status(402).json({ error : "Le mot de passe ne remplit pas les critères de sécurité." });
    }

    bcrypt.hash(req.body.password, 10)
        .then(hash => {
            const user = new User({
                email: req.body.email,
                password: hash
            });
            user.save()
                .then(() => res.status(201).json({ message: "Utilisateur crée !" }))
                .catch(error => res.status(400).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
};


// Middleware pour se connecter à un compte éxistant : (login)

exports.login = (req, res, next) => {
    User.findOne({ email: req.body.email })
        .then(user => {
            if (!user) {
                return res.status(401).json({ message: 'Paire login/mot de passe incorrecte'});
            }
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    if (!valid) {
                        return res.status(401).json({ message: 'Paire login/mot de passe incorrecte' });
                    }
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign(
                            { userId : user._id }, // pour authentifier l'utilisateur lors des modifications
                            process.env.JWT_SECRET, // Token à modifier en production !!!
                            { expiresIn : '24h' }
                        )
                    });
                })
                .catch(error => res.status(500).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
 };