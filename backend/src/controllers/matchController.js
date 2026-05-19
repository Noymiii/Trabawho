const { Match, User, Job } = require('../models');

const getMatches = async (req, res) => {
  try {
    const userId = req.user.id;
    const where = req.user.role === 'worker'
      ? { workerId: userId }
      : { customerId: userId };

    const matches = await Match.findAll({
      where,
      include: [
        { model: User, as: 'worker', attributes: ['id', 'fullname', 'email', 'avatar'] },
        { model: User, as: 'customer', attributes: ['id', 'fullname', 'email', 'avatar'] },
        { model: Job, as: 'job', attributes: ['id', 'title', 'skillRequired', 'budget'] },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json({ matches });
  } catch (error) {
    console.error('Get matches error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateMatchStatus = async (req, res) => {
  try {
    const match = await Match.findByPk(req.params.id);
    if (!match) return res.status(404).json({ message: 'Match not found' });
    if (match.workerId !== req.user.id && match.customerId !== req.user.id) {
      return res.status(403).json({ message: 'Not your match' });
    }
    await match.update({ status: req.body.status });
    res.json({ match });
  } catch (error) {
    console.error('Controller Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getMatches, updateMatchStatus };
