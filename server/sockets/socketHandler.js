// Store online users mapping: userId -> socketId
const userSocketMap = {}; 

export const getReceiverSocketId = (receiverId) => {
  return userSocketMap[receiverId];
};

const socketHandler = (io) => {
  io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId;
    console.log(`Socket connection: ${socket.id}, User ID: ${userId}`);

    if (userId && userId !== 'undefined') {
      userSocketMap[userId] = socket.id;
      // Broadcast online users lists to all connected clients
      io.emit('getOnlineUsers', Object.keys(userSocketMap));
    }

    socket.on('typing', ({ receiverId, isTyping }) => {
      const receiverSocketId = getReceiverSocketId(receiverId);
      if (receiverSocketId) {
        socket.to(receiverSocketId).emit('typingStatus', { senderId: userId, isTyping });
      }
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}, User ID: ${userId}`);
      if (userId && userSocketMap[userId] === socket.id) {
        delete userSocketMap[userId];
        io.emit('getOnlineUsers', Object.keys(userSocketMap));
      }
    });
  });
};

export default socketHandler;
