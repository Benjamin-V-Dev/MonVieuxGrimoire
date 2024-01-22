const multer = require('multer');
const path = require('path');

const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/webp': 'webp',
    'image/png': 'png'
};

// This middleware function is responsible for handling the upload of image files in the application using the multer package.
const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'images')
    },
    filename: (req, file, callback) => {
        // Checking file type
        if(file.mimetype.split('/')[0] !== 'image') new Error("Uploaded file must be an image");
        // Checking image type
        if(MIME_TYPES[file.mimetype] === undefined) new Error("Uploaded file must be a : JPG / PNG / WEBP");
        // Creating a unique destination filename (original-date.extension)
        const name = file.originalname.split(' ').join('_');
        const extension = MIME_TYPES[file.mimetype];
        const { name: onlyFileName } = path.parse(name);
        const finalFilename = onlyFileName + '-' + Date.now() + '.' + extension;
        // Sending to the next middleware / controller with the destination filename
        callback(null, finalFilename);
    }
});

module.exports = multer({ storage }).single('image');