const { Review, User, Match } = require('../models');

exports.submitReview = async (req, res) => {
  try {
    const { revieweeId, workerId, matchId, rating, comment } = req.body;
    const reviewerId = req.user.id;
    const finalRevieweeId = revieweeId || workerId;

    if (!finalRevieweeId || !rating) {
      return res.status(400).json({ message: 'Missing required fields (revieweeId/workerId, rating)' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    let resolvedMatchId = matchId;
    let match = null;

    if (resolvedMatchId) {
      match = await Match.findByPk(resolvedMatchId);
    } else {
      // Find an active match between reviewer and reviewee
      match = await Match.findOne({
        where: {
          workerId: req.user.role === 'customer' ? finalRevieweeId : reviewerId,
          customerId: req.user.role === 'customer' ? reviewerId : finalRevieweeId
        }
      });
      if (match) {
        resolvedMatchId = match.id;
      }
    }

    if (!match) {
      return res.status(404).json({ message: 'You can only review users you have matched with.' });
    }
    
    if (match.workerId !== reviewerId && match.customerId !== reviewerId) {
      return res.status(403).json({ message: 'You are not part of this match' });
    }

    // Check if a review already exists for this match from this reviewer
    const existingReview = await Review.findOne({
      where: { reviewerId, matchId: resolvedMatchId }
    });

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this match' });
    }

    const review = await Review.create({
      reviewerId,
      revieweeId: finalRevieweeId,
      matchId: resolvedMatchId,
      rating,
      comment
    });

    res.status(201).json({ message: 'Review submitted successfully', review });
  } catch (error) {
    console.error('Submit review error:', error);
    res.status(500).json({ message: 'Server error while submitting review' });
  }
};

exports.getUserReviews = async (req, res) => {
  try {
    const { userId } = req.params;

    const reviews = await Review.findAll({
      where: { revieweeId: userId },
      include: [
        { model: User, as: 'reviewer', attributes: ['id', 'fullname', 'avatar'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    const averageRating = reviews.length > 0 
      ? reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length 
      : 0;

    res.json({
      reviews,
      averageRating: parseFloat(averageRating.toFixed(1)),
      totalReviews: reviews.length
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ message: 'Server error while fetching reviews' });
  }
};
