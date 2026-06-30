import Notification from '../models/Notification.js';

export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ receiver: req.user._id })
      .sort({ createdAt: -1 })
      .populate('sender', 'username fullName profilePic')
      .populate({
        path: 'post',
        select: 'media caption isReel',
      });

    res.status(200).json({ success: true, notifications });
  } catch (error) {
    console.error('Error in getNotifications:', error.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export const markNotificationsAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ receiver: req.user._id, isRead: false }, { isRead: true });
    res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error in markNotificationsAsRead:', error.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
