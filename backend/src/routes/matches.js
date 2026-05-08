const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { getMatches, updateMatchStatus } = require('../controllers/matchController');

router.get('/', authenticate, getMatches);
router.put('/:id', authenticate, updateMatchStatus);

module.exports = router;
