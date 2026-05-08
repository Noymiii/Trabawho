const router = require('express').Router();
const { authenticate, requireRole } = require('../middleware/auth');
const { createJob, getMyJobs, getAllJobs, getJobById, updateJob, deleteJob } = require('../controllers/jobController');

router.get('/mine', authenticate, requireRole('customer'), getMyJobs);
router.get('/', authenticate, getAllJobs);
router.get('/:id', authenticate, getJobById);
router.post('/', authenticate, requireRole('customer'), createJob);
router.put('/:id', authenticate, requireRole('customer'), updateJob);
router.delete('/:id', authenticate, requireRole('customer'), deleteJob);

module.exports = router;
