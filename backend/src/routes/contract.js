const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { proposeContract, updateContractStatus, getContractsByMatch } = require('../controllers/contractController');

router.post('/', authenticate, proposeContract);
router.put('/:id', authenticate, updateContractStatus);
router.get('/match/:matchId', authenticate, getContractsByMatch);

module.exports = router;
