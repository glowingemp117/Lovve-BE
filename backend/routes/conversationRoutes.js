const express = require('express');
const router = express.Router();
const { conversations, getconversationbyid } = require('../controllers/conversationController');
const { protect } = require('../middleware/authMiddleware');
router.get('/list', protect, conversations).get('/', protect, getconversationbyid);

module.exports = router