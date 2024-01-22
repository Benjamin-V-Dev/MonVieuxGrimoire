const express = require('express');
const auth = require('../middleware/auth');
const uploadMiddleware = require('../middleware/multer-config');
const imageProcessingMiddleware = require('../middleware/sharp-config');
const router = express.Router();

const bookCtrl = require('../controllers/book');

router.get('/', bookCtrl.findBook);
router.get('/bestrating', bookCtrl.bestBook);
router.post('/', auth, uploadMiddleware, imageProcessingMiddleware, bookCtrl.createBook);
router.get('/:id', bookCtrl.findOneBook);
router.put('/:id', auth, uploadMiddleware, imageProcessingMiddleware, bookCtrl.updateBook);
router.post('/:id/rating', auth, bookCtrl.rateOneBook);
router.delete('/:id', auth, bookCtrl.deleteBook);

// Exportation du module pour utilisation dans app.js
module.exports = router;