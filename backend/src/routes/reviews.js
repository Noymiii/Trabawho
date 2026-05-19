const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { authenticate } = require('../middleware/auth');

router.post('/', authenticate, reviewController.submitReview);
router.get('/user/:userId', reviewController.getUserReviews);

module.exports = router;
