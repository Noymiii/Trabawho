const { Message, User, Match } = require('../models');
const { Op } = require('sequelize');

const getMessagesByMatch = async (req, res) => {
  try {
    const { matchId } = req.params;
    const match = await Match.findByPk(matchId);
    if (!match) return res.status(404).json({ message: 'Match not found' });
    if (match.workerId !== req.user.id && match.customerId !== req.user.id) {
      return res.status(403).json({ message: 'Not your match' });
    }

    const messages = await Message.findAll({
      where: { matchId },
      include: [{ model: User, as: 'sender', attributes: ['id', 'fullname', 'avatar'] }],
      order: [['createdAt', 'ASC']],
      limit: 100,
    });

    // Mark messages as read
    await Message.update(
      { isRead: true },
      { where: { matchId, receiverId: req.user.id, isRead: false } }
    );

    res.json({ messages });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    const matches = await Match.findAll({
      where: {
        [Op.or]: [{ workerId: userId }, { customerId: userId }],
        status: { [Op.in]: ['matched', 'completed'] },
      },
      include: [
        { model: User, as: 'worker', attributes: ['id', 'fullname', 'email', 'avatar', 'role'] },
        { model: User, as: 'customer', attributes: ['id', 'fullname', 'email', 'avatar', 'role'] },
      ],
      order: [['createdAt', 'DESC']],
    });

    const conversations = await Promise.all(
      matches.map(async (match) => {
        const otherUser = match.workerId === userId ? match.customer : match.worker;
        const lastMessage = await Message.findOne({
          where: { matchId: match.id },
          order: [['createdAt', 'DESC']],
        });
        const unreadCount = await Message.count({
          where: { matchId: match.id, receiverId: userId, isRead: false },
        });
        return { matchId: match.id, otherUser, lastMessage, unreadCount, matchStatus: match.status, workerId: match.workerId, customerId: match.customerId };
      })
    );

    res.json({ conversations });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getMessagesByMatch, getConversations };
