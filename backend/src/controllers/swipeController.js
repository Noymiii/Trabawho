const { Swipe, Match, Job, WorkerProfile, User } = require('../models');
const { Op } = require('sequelize');

// Process a swipe
const swipe = async (req, res) => {
  try {
    const { targetId, targetType, direction } = req.body;
    const swiperId = req.user.id;

    // Prevent duplicate swipes
    const existing = await Swipe.findOne({
      where: { swiperId, targetId, targetType },
    });
    if (existing) return res.status(400).json({ message: 'Already swiped on this' });

    // Record the swipe
    await Swipe.create({ swiperId, targetId, targetType, direction });

    let matched = false;

    // Check for mutual match (only if swiped right)
    if (direction === 'right') {
      if (req.user.role === 'worker' && targetType === 'job') {
        // Worker swiped right on a job — check if customer (job owner) swiped right on this worker
        const job = await Job.findByPk(targetId);
        if (job) {
          const counterSwipe = await Swipe.findOne({
            where: { swiperId: job.customerId, targetId: swiperId, targetType: 'worker', direction: 'right' },
          });
          if (counterSwipe) {
            await Match.create({ workerId: swiperId, customerId: job.customerId, jobId: job.id });
            matched = true;
          }
        }
      } else if (req.user.role === 'customer' && targetType === 'worker') {
        // Customer swiped right on a worker — check if worker swiped right on any of customer's jobs
        const jobs = await Job.findAll({ where: { customerId: swiperId, status: 'open' } });
        for (const job of jobs) {
          const counterSwipe = await Swipe.findOne({
            where: { swiperId: targetId, targetId: job.id, targetType: 'job', direction: 'right' },
          });
          if (counterSwipe) {
            await Match.create({ workerId: targetId, customerId: swiperId, jobId: job.id });
            matched = true;
            break;
          }
        }
        // If no specific job match, create a general match if worker swiped right on customer
        if (!matched) {
          const generalSwipe = await Swipe.findOne({
            where: { swiperId: targetId, targetId: swiperId, direction: 'right' },
          });
          if (generalSwipe) {
            await Match.create({ workerId: targetId, customerId: swiperId });
            matched = true;
          }
        }
      }
    }

    res.json({ matched, message: matched ? 'It\'s a match!' : 'Swipe recorded' });
  } catch (error) {
    console.error('Swipe error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get swipe queue (unswiped items for current user)
const getQueue = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get IDs already swiped
    const swipedIds = await Swipe.findAll({
      where: { swiperId: userId },
      attributes: ['targetId', 'targetType'],
    });

    const swipedWorkerIds = swipedIds.filter(s => s.targetType === 'worker').map(s => s.targetId);
    const swipedJobIds = swipedIds.filter(s => s.targetType === 'job').map(s => s.targetId);

    let queue = [];

    if (req.user.role === 'customer') {
      // Find open jobs owned by this customer
      const customerJobs = await Job.findAll({
        where: { customerId: userId, status: 'open' },
        attributes: ['skillRequired']
      });
      const requiredSkills = customerJobs.flatMap(j => 
        j.skillRequired ? j.skillRequired.split(',').map(s => s.trim()) : []
      ).filter(Boolean);

      // Customers see available workers they haven't swiped on
      const workers = await WorkerProfile.findAll({
        where: {
          userId: { [Op.notIn]: [...swipedWorkerIds, userId] },
          availability: 'available',
        },
        include: [{ model: User, as: 'user', attributes: ['id', 'fullname', 'email', 'avatar'] }],
      });

      // Filter workers by matching skills if the customer has open jobs specifying skills
      let filteredWorkers = workers;
      if (requiredSkills.length > 0) {
        filteredWorkers = workers.filter(w => {
          const workerSkills = Array.isArray(w.skills) ? w.skills : [];
          return workerSkills.some(skill => requiredSkills.includes(skill));
        });
      }

      queue = filteredWorkers.slice(0, 20).map(w => {
        const imagesList = [];
        if (w.user.avatar) {
          imagesList.push(w.user.avatar);
        }
        if (w.images && w.images.length > 0) {
          // If images is stored as a string parsed or actual array
          const portImages = typeof w.images === 'string' ? JSON.parse(w.images) : w.images;
          imagesList.push(...portImages);
        }
        return {
          id: w.userId,
          type: 'worker',
          title: w.user.fullname,
          subtitle: w.skills?.slice(0, 3).join(', ') || 'No skills listed',
          description: w.bio || 'No bio provided.',
          tags: w.skills || [],
          location: w.location,
          availability: w.availability,
          images: imagesList,
        };
      });
    } else {
      // Find worker profile
      const workerProfile = await WorkerProfile.findOne({
        where: { userId }
      });
      const workerSkills = workerProfile?.skills || [];

      // Workers see open jobs they haven't swiped on
      const jobs = await Job.findAll({
        where: {
          id: { [Op.notIn]: swipedJobIds },
          customerId: { [Op.ne]: userId },
          status: 'open',
        },
        include: [{ model: User, as: 'customer', attributes: ['id', 'fullname', 'avatar'] }],
        order: [['createdAt', 'DESC']],
      });

      // Filter jobs by matching skills if the worker profile has skills specified
      let filteredJobs = jobs;
      if (workerSkills && workerSkills.length > 0) {
        filteredJobs = jobs.filter(j => {
          if (!j.skillRequired) return false;
          const skills = j.skillRequired.split(',').map(s => s.trim());
          return skills.some(s => workerSkills.includes(s));
        });
      }

      queue = filteredJobs.slice(0, 20).map(j => {
        let jobImages = [];
        if (j.images) {
          jobImages = typeof j.images === 'string' ? JSON.parse(j.images) : j.images;
        }
        return {
          id: j.id,
          type: 'job',
          title: j.title,
          subtitle: `by ${j.customer?.fullname || 'Unknown'}`,
          description: j.description || 'No description.',
          tags: j.skillRequired ? j.skillRequired.split(',').map(s => s.trim()) : [],
          location: j.location,
          budget: j.budget ? parseFloat(j.budget) : undefined,
          images: jobImages,
        };
      });
    }

    res.json({ queue });
  } catch (error) {
    console.error('Get queue error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { swipe, getQueue };
