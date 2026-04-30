const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { summarizeChat } = require('../services/aiService');
const { sendBroadcast, getBroadcastHistory } = require('../controllers/broadcastControllers');

const router = express.Router();

router.get('/summarize/:chatId', protect, summarizeChat);
router.post('/broadcast', protect, sendBroadcast);
router.get('/broadcast/history', protect, getBroadcastHistory);

module.exports = router;
