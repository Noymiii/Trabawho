const jwt = require('jsonwebtoken');
const { Message } = require('../models');

module.exports = (io) => {
  // Authenticate socket connections
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication error'));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId}`);

    // Join personal user room to receive notifications and messages globally
    socket.join(`user-${socket.userId}`);
    console.log(`User ${socket.userId} joined their personal room user-${socket.userId}`);

    // Join a match room
    socket.on('join-match', (matchId) => {
      socket.join(`match-${matchId}`);
      console.log(`User ${socket.userId} joined match-${matchId}`);
    });

    // Send message
    socket.on('send-message', async (data) => {
      try {
        const { matchId, receiverId, message } = data;
        const savedMessage = await Message.create({
          senderId: socket.userId,
          receiverId,
          matchId,
          message,
        });

        // Broadcast to the match room AND the receiver's personal room
        io.to(`match-${matchId}`).to(`user-${receiverId}`).emit('message-received', {
          id: savedMessage.id,
          senderId: socket.userId,
          receiverId,
          matchId,
          message,
          isRead: false,
          createdAt: savedMessage.createdAt,
        });
      } catch (error) {
        console.error('Send message error:', error);
      }
    });

    // Typing indicator
    socket.on('typing', (data) => {
      socket.to(`match-${data.matchId}`).emit('user-typing', {
        userId: socket.userId,
        isTyping: data.isTyping,
      });
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
    });
  });
};
