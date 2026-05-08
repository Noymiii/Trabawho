const router = require('express').Router();
const { authenticate, requireRole } = require('../middleware/auth');
const { getStats, getUsers, deleteUser, getAdminJobs, deleteJob, getAdminMatches } = require('../controllers/adminController');

router.use(authenticate, requireRole('admin'));

router.get('/stats', getStats);
router.get('/users', getUsers);
router.delete('/users/:id', deleteUser);
router.get('/jobs', getAdminJobs);
router.delete('/jobs/:id', deleteJob);
router.get('/matches', getAdminMatches);

module.exports = router;
