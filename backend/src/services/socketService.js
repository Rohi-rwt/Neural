const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

module.exports = (io) => {
  // Auth middleware for socket
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication required'));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.userId}`);
    socket.join(`user:${socket.userId}`);

    // Real-time test events
    socket.on('test:join', (testId) => {
      socket.join(`test:${testId}`);
      socket.to(`test:${testId}`).emit('participant:joined', { userId: socket.userId });
    });

    socket.on('test:answer', (data) => {
      socket.to(`test:${data.testId}`).emit('live:update', {
        userId: socket.userId,
        questionId: data.questionId,
        answered: true
      });
    });

    // Group study room
    socket.on('study:join', (roomId) => {
      socket.join(`study:${roomId}`);
      io.to(`study:${roomId}`).emit('room:update', {
        type: 'joined',
        userId: socket.userId
      });
    });

    socket.on('study:message', (data) => {
      io.to(`study:${data.roomId}`).emit('study:message', {
        userId: socket.userId,
        message: data.message,
        timestamp: new Date()
      });
    });

    // Typing indicator for AI chat
    socket.on('ai:typing', (data) => {
      socket.to(`user:${socket.userId}`).emit('ai:typing', data);
    });

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.userId}`);
    });
  });

  // Helper to send notification to specific user
  io.notifyUser = (userId, event, data) => {
    io.to(`user:${userId}`).emit(event, data);
  };
};
