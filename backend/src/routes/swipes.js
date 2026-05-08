const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { swipe, getQueue } = require('../controllers/swipeController');

router.post('/', authenticate, swipe);
router.get('/queue', authenticate, getQueue);

module.exports = router;
