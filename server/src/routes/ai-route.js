const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai-controller');

router.route('/get-response').post(aiController.getAIResponse);

module.exports = router;