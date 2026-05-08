const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { getMessagesByMatch, getConversations } = require('../controllers/messageController');

router.get('/conversations', authenticate, getConversations);
router.get('/:matchId', authenticate, getMessagesByMatch);

module.exports = router;
