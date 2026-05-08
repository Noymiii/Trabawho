const { WorkerProfile, User } = require('../models');

// Get current user's profile
const getMyProfile = async (req, res) => {
  try {
    const profile = await WorkerProfile.findOne({
      where: { userId: req.user.id },
      include: [{ model: User, as: 'user', attributes: ['id', 'fullname', 'email', 'avatar'] }],
    });
    res.json({ profile });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get worker profile by user ID
const getProfile = async (req, res) => {
  try {
    const profile = await WorkerProfile.findOne({
      where: { userId: req.params.id },
      include: [{ model: User, as: 'user', attributes: ['id', 'fullname', 'email', 'avatar'] }],
    });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    res.json({ profile });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Create worker profile
const createProfile = async (req, res) => {
  try {
    const existing = await WorkerProfile.findOne({ where: { userId: req.user.id } });
    if (existing) return res.status(400).json({ message: 'Profile already exists' });

    const { skills, bio, experience, location, availability, contactInfo, hourlyRate } = req.body;
    const profile = await WorkerProfile.create({
      userId: req.user.id,
      skills: typeof skills === 'string' ? JSON.parse(skills) : skills,
      bio, experience, location, availability, contactInfo,
      hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null,
    });

    res.status(201).json({ profile });
  } catch (error) {
    console.error('Create profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update worker profile
const updateProfile = async (req, res) => {
  try {
    const profile = await WorkerProfile.findOne({ where: { userId: req.user.id } });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    const { skills, bio, experience, location, availability, contactInfo, hourlyRate } = req.body;
    await profile.update({
      skills: skills ? (typeof skills === 'string' ? JSON.parse(skills) : skills) : profile.skills,
      bio: bio ?? profile.bio,
      experience: experience ?? profile.experience,
      location: location ?? profile.location,
      availability: availability ?? profile.availability,
      contactInfo: contactInfo ?? profile.contactInfo,
      hourlyRate: hourlyRate ? parseFloat(hourlyRate) : profile.hourlyRate,
    });

    res.json({ profile });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all workers (with optional filters)
const getAllWorkers = async (req, res) => {
  try {
    const profiles = await WorkerProfile.findAll({
      where: { availability: 'available' },
      include: [{ model: User, as: 'user', attributes: ['id', 'fullname', 'email', 'avatar'] }],
      order: [['createdAt', 'DESC']],
    });
    res.json({ workers: profiles });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getMyProfile, getProfile, createProfile, updateProfile, getAllWorkers };
