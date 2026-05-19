const router = require('express').Router();
const multer = require('multer');
const upload = multer();
const { authenticate, requireRole } = require('../middleware/auth');
const { getMyProfile, getProfile, createProfile, updateProfile, getAllWorkers } = require('../controllers/workerController');

router.get('/me', authenticate, requireRole('worker'), getMyProfile);
router.get('/', authenticate, getAllWorkers);
router.get('/:id', authenticate, getProfile);
router.post('/', authenticate, requireRole('worker'), upload.none(), createProfile);
router.put('/me', authenticate, requireRole('worker'), upload.none(), updateProfile);

module.exports = router;
