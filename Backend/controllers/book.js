const Book = require('../models/Book')
const fs = require('fs')


exports.createBook = (req, res, next) => {
    const bookObject = JSON.parse(req.body.book);
    delete bookObject._id;
    delete bookObject._userId;
    const book = new Book({
        ...bookObject,
        userId: req.auth.userId,
        imageUrl: `https://mvg.benjamin-vallon.fr/api/mvg/images/${req.file.compressedFilename}`,
        averageRating: bookObject.ratings[0].grade
    });

    book.save()
    .then(() => { res.status(201).json({message: 'Livre enregistré !'})})
    .catch(error => { res.status(400).json( { error })})
}


exports.updateBook = (req, res, next) => {
    const bookObject = req.file ? {
       ...JSON.parse(req.body.book),
       imageUrl: `https://mvg.benjamin-vallon.fr/api/mvg/images/${req.file.compressedFilename}`,
    } : { ...req.body };
 
   delete bookObject._userId;
   Book.findOne({_id: req.params.id})
       .then((book) => {
           if (book.userId != req.auth.userId) {
               res.status(401).json({ message : 'Not authorized'});
           } else {
               Book.updateOne({ _id: req.params.id}, { ...bookObject, _id: req.params.id})
               .then(() => res.status(200).json({message : 'Livre modifié!'}))
               .catch(error => res.status(401).json({ error }));
           }
       })
       .catch((error) => {
           res.status(400).json({ error });
       });
}


exports.deleteBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id})
       .then(book => {
           if (book.userId != req.auth.userId) {
               res.status(401).json({message: 'Not authorized'});
           } else {
               const filename = book.imageUrl.split('/images/')[1];
               fs.unlink(`images/${filename}`, () => {
                   Book.deleteOne({_id: req.params.id})
                       .then(() => { res.status(200).json({message: 'Livre supprimé !'})})
                       .catch(error => res.status(401).json({ error }));
               });
           }
       })
       .catch( error => {
           res.status(500).json({ error });
       });
}


exports.findBook = (req, res, next) => {
    Book.find()
        .then(books => res.status(200).json(books))
        .catch(error => res.status(400).json({ error }))
}


exports.bestBook = (req, res, next) => {
    Book.find()
        .sort({ ratings: -1 })
        .limit(3)
        .then(books => res.status(200).json(books))
        .catch(error => res.status(400).json({ error }))
}


exports.findOneBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
        .then(books => res.status(200).json(books))
        .catch(error => res.status(404).json({ error }))
}



exports.rateOneBook = (req, res, next) => {
    const bookId = req.params.id;
    const userId = req.body.userId;
    const rating = req.body.rating;

    // Vérifier si la note est comprise entre 0 et 5
    if (rating < 0 || rating > 5) {
        return res.status(400).send('Invalid rating. Must be between 0 and 5.');
    }

    Book.findById(bookId)
        .then(book => {
            if (!book) {
                return res.status(404).send('Book not found.');
            }

            // Vérifier si l'utilisateur a déjà noté ce livre
            const existingRating = book.ratings.find(r => r.userId === userId);
            if (existingRating) {
                return res.status(403).send('User has already rated this book.');
            }

            // Ajouter la note
            book.ratings.push({ userId, grade: rating });

            // Mettre à jour la note moyenne
            const totalRating = book.ratings.reduce((acc, r) => acc + r.grade, 0);
            book.averageRating = parseFloat((totalRating / book.ratings.length).toFixed(1));

            // Sauvegarder uniquement les champs modifiés
            book.markModified('ratings');
            book.markModified('averageRating');

            return book.save();
        })
        .then(books => res.status(200).json(books))
        .catch(error => res.status(404).json({ error }))
};
