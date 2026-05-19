const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { getMessagesByMatch, getConversations, sendMessage } = require('../controllers/messageController');

router.get('/conversations', authenticate, getConversations);
router.get('/:matchId', authenticate, getMessagesByMatch);
router.post('/', authenticate, sendMessage);

module.exports = router;
