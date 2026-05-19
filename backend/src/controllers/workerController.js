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
    if (!profile) {
      const user = await User.findByPk(req.params.id, {
        attributes: ['id', 'fullname', 'email', 'avatar', 'role']
      });
      if (user) {
        return res.json({
          profile: null,
          user: {
            id: user.id,
            fullname: user.fullname,
            email: user.email,
            avatar: user.avatar,
            role: user.role
          }
        });
      }
      return res.status(404).json({ message: 'Profile not found' });
    }
    res.json({ profile });
  } catch (error) {
    console.error('Controller Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create worker profile (self-healing / upsert)
const createProfile = async (req, res) => {
  try {
    const { skills, bio, experience, location, availability, contactInfo, hourlyRate, images } = req.body;
    
    const parsedSkills = skills ? (typeof skills === 'string' ? JSON.parse(skills) : skills) : [];
    const parsedImages = images ? (typeof images === 'string' ? JSON.parse(images) : images) : [];
    const parsedRate = hourlyRate ? parseFloat(hourlyRate) : null;

    const [profile, created] = await WorkerProfile.findOrCreate({
      where: { userId: req.user.id },
      defaults: {
        userId: req.user.id,
        skills: parsedSkills,
        bio: bio || '',
        experience: experience || '',
        location: location || '',
        availability: availability || 'available',
        contactInfo: contactInfo || '',
        hourlyRate: parsedRate,
        images: parsedImages,
      }
    });

    if (!created) {
      // If profile already exists, update it instead of throwing an error
      await profile.update({
        skills: skills ? parsedSkills : profile.skills,
        bio: bio ?? profile.bio,
        experience: experience ?? profile.experience,
        location: location ?? profile.location,
        availability: availability ?? profile.availability,
        contactInfo: contactInfo ?? profile.contactInfo,
        hourlyRate: hourlyRate ? parsedRate : profile.hourlyRate,
        images: images ? parsedImages : profile.images,
      });
    }

    res.status(created ? 201 : 200).json({ profile });
  } catch (error) {
    console.error('Create profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update worker profile (self-healing / upsert)
const updateProfile = async (req, res) => {
  try {
    const { skills, bio, experience, location, availability, contactInfo, hourlyRate, images } = req.body;
    
    const parsedSkills = skills ? (typeof skills === 'string' ? JSON.parse(skills) : skills) : [];
    const parsedImages = images ? (typeof images === 'string' ? JSON.parse(images) : images) : [];
    const parsedRate = hourlyRate ? parseFloat(hourlyRate) : null;

    const [profile, created] = await WorkerProfile.findOrCreate({
      where: { userId: req.user.id },
      defaults: {
        userId: req.user.id,
        skills: parsedSkills,
        bio: bio || '',
        experience: experience || '',
        location: location || '',
        availability: availability || 'available',
        contactInfo: contactInfo || '',
        hourlyRate: parsedRate,
        images: parsedImages,
      }
    });

    if (!created) {
      await profile.update({
        skills: skills ? parsedSkills : profile.skills,
        bio: bio ?? profile.bio,
        experience: experience ?? profile.experience,
        location: location ?? profile.location,
        availability: availability ?? profile.availability,
        contactInfo: contactInfo ?? profile.contactInfo,
        hourlyRate: hourlyRate ? parsedRate : profile.hourlyRate,
        images: images ? parsedImages : profile.images,
      });
    }

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
    console.error('Controller Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getMyProfile, getProfile, createProfile, updateProfile, getAllWorkers };
