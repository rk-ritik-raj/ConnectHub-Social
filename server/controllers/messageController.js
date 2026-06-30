import Message from '../models/Message.js';
import User from '../models/User.js';
import { uploadToCloudinaryOrLocal } from '../utils/mediaUpload.js';
import { io } from '../server.js';
import { getReceiverSocketId } from '../sockets/socketHandler.js';

export const sendMessage = async (req, res) => {
  const { receiverId } = req.params;
  const { text } = req.body;

  try {
    let mediaUrl = '';
    let mediaType = 'text';

    // Check for uploaded file (image or audio voice notes)
    if (req.file) {
      mediaUrl = await uploadToCloudinaryOrLocal(req.file);
      if (req.file.mimetype.startsWith('audio/') || req.file.mimetype.includes('webm')) {
        mediaType = 'voice';
      } else {
        mediaType = 'image';
      }
    }

    if (!text && !mediaUrl) {
      return res.status(400).json({ success: false, message: 'Message content cannot be empty' });
    }

    const message = new Message({
      sender: req.user._id,
      receiver: receiverId,
      text: text || '',
      mediaUrl,
      mediaType,
    });

    await message.save();

    const populatedMessage = await message.populate('sender receiver', 'username fullName profilePic');

    // Trigger Socket.io real-time message emit
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('newMessage', populatedMessage);
    }

    res.status(201).json({ success: true, message: populatedMessage });
  } catch (error) {
    console.error('Error in sendMessage:', error.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export const getChatHistory = async (req, res) => {
  const { userId } = req.params; // Target user's id
  const currentUserId = req.user._id;

  try {
    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: userId },
        { sender: userId, receiver: currentUserId },
      ],
    }).sort({ createdAt: 1 });

    // Mark messages received from target user as seen
    const unreadMessageIds = messages
      .filter((m) => m.sender.toString() === userId && !m.seen)
      .map((m) => m._id);

    if (unreadMessageIds.length > 0) {
      await Message.updateMany(
        { _id: { $in: unreadMessageIds } },
        { $set: { seen: true, seenAt: new Date() } }
      );

      // Trigger socket event back to sender to notify that their message has been read
      const targetSocketId = getReceiverSocketId(userId);
      if (targetSocketId) {
        io.to(targetSocketId).emit('messagesSeen', {
          chatPartnerId: currentUserId,
          messageIds: unreadMessageIds,
        });
      }
    }

    res.status(200).json({ success: true, messages });
  } catch (error) {
    console.error('Error in getChatHistory:', error.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export const getConversations = async (req, res) => {
  const currentUserId = req.user._id;

  try {
    // Find all users the current user has sent or received messages from
    const uniqueUserIds = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: currentUserId }, { receiver: currentUserId }],
        },
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$sender', currentUserId] },
              '$receiver',
              '$sender',
            ],
          },
          lastMessageAt: { $max: '$createdAt' },
        },
      },
      { $sort: { lastMessageAt: -1 } },
    ]);

    const conversations = await Promise.all(
      uniqueUserIds.map(async (item) => {
        const participant = await User.findById(item._id).select('username fullName profilePic');
        
        // Find last message
        const lastMessage = await Message.findOne({
          $or: [
            { sender: currentUserId, receiver: item._id },
            { sender: item._id, receiver: currentUserId },
          ],
        }).sort({ createdAt: -1 });

        // Unread message count
        const unreadCount = await Message.countDocuments({
          sender: item._id,
          receiver: currentUserId,
          seen: false,
        });

        return {
          participant,
          lastMessage,
          unreadCount,
        };
      })
    );

    res.status(200).json({ success: true, conversations });
  } catch (error) {
    console.error('Error in getConversations:', error.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
