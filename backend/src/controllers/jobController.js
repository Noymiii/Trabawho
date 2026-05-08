const { Job, User } = require('../models');

const createJob = async (req, res) => {
  try {
    const { title, description, skillRequired, budget, location, schedule } = req.body;
    const job = await Job.create({
      customerId: req.user.id, title, description, skillRequired,
      budget: budget ? parseFloat(budget) : null, location, schedule,
    });
    res.status(201).json({ job });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.findAll({
      where: { customerId: req.user.id },
      order: [['createdAt', 'DESC']],
    });
    res.json({ jobs });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.findAll({
      where: { status: 'open' },
      include: [{ model: User, as: 'customer', attributes: ['id', 'fullname', 'avatar'] }],
      order: [['createdAt', 'DESC']],
    });
    res.json({ jobs });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getJobById = async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id, {
      include: [{ model: User, as: 'customer', attributes: ['id', 'fullname', 'avatar'] }],
    });
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json({ job });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updateJob = async (req, res) => {
  try {
    const job = await Job.findOne({ where: { id: req.params.id, customerId: req.user.id } });
    if (!job) return res.status(404).json({ message: 'Job not found' });
    await job.update(req.body);
    res.json({ job });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteJob = async (req, res) => {
  try {
    const job = await Job.findOne({ where: { id: req.params.id, customerId: req.user.id } });
    if (!job) return res.status(404).json({ message: 'Job not found' });
    await job.destroy();
    res.json({ message: 'Job deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createJob, getMyJobs, getAllJobs, getJobById, updateJob, deleteJob };
