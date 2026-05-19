const { User, Job, Match, WorkerProfile } = require('../models');

const getStats = async (req, res) => {
  try {
    const [totalUsers, totalWorkers, totalCustomers, totalJobs, totalMatches, activeJobs] = await Promise.all([
      User.count(),
      User.count({ where: { role: 'worker' } }),
      User.count({ where: { role: 'customer' } }),
      Job.count(),
      Match.count(),
      Job.count({ where: { status: 'open' } }),
    ]);
    res.json({ totalUsers, totalWorkers, totalCustomers, totalJobs, totalMatches, activeJobs });
  } catch (error) {
    console.error('Controller Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
    });
    res.json({ users });
  } catch (error) {
    console.error('Controller Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin') return res.status(403).json({ message: 'Cannot delete admin' });
    await WorkerProfile.destroy({ where: { userId: user.id } });
    await user.destroy();
    res.json({ message: 'User deleted' });
  } catch (error) {
    console.error('Controller Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getAdminJobs = async (req, res) => {
  try {
    const jobs = await Job.findAll({
      include: [{ model: User, as: 'customer', attributes: ['id', 'fullname'] }],
      order: [['createdAt', 'DESC']],
    });
    res.json({ jobs });
  } catch (error) {
    console.error('Controller Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteJob = async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    await job.destroy();
    res.json({ message: 'Job deleted' });
  } catch (error) {
    console.error('Controller Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getAdminMatches = async (req, res) => {
  try {
    const matches = await Match.findAll({
      include: [
        { model: User, as: 'worker', attributes: ['id', 'fullname'] },
        { model: User, as: 'customer', attributes: ['id', 'fullname'] },
        { model: Job, as: 'job', attributes: ['id', 'title'] },
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json({ matches });
  } catch (error) {
    console.error('Controller Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getStats, getUsers, deleteUser, getAdminJobs, deleteJob, getAdminMatches };
