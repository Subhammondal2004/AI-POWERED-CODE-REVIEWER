const express = require('express');
const multer = require('multer');
const fileController = require('../controllers/file-controller');

const upload = multer({ dest: 'uploads/' });
const router = express.Router();

router.post('/upload-file', upload.single('file'), fileController.uploadFile);

module.exports = router;
