import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSend,
  FiImage,
  FiMic,
  FiSquare,
  FiSmile,
  FiChevronLeft,
  FiCheck,
  FiMessageSquare,
} from 'react-icons/fi';
import EmojiPicker from 'emoji-picker-react';

const Messages = () => {
  const { user: currentUser } = useAuth();
  const { socket, onlineUsers } = useSocket();

  const [conversations, setConversations] = useState([]);
  const [conversationsLoading, setConversationsLoading] = useState(true);
  const [selectedChat, setSelectedChat] = useState(null); // participant user object

  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [typedMessage, setTypedMessage] = useState('');

  // Typing status states
  const [isPeerTyping, setIsPeerTyping] = useState(false);
  const [amTyping, setAmTyping] = useState(false);
  const typingTimeoutRef = useRef(null);

  // Audio Recording States
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Emoji Picker
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const messagesEndRef = useRef(null);

  // Load Inbox Conversations
  const fetchConversations = async () => {
    try {
      const res = await api.get('/messages/conversations');
      if (res.data.success) {
        setConversations(res.data.conversations || []);
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setConversationsLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  // Fetch Message Transcripts
  useEffect(() => {
    if (!selectedChat) return;

    const loadChat = async () => {
      setMessagesLoading(true);
      try {
        const res = await api.get(`/messages/chat/${selectedChat._id}`);
        if (res.data.success) {
          setMessages(res.data.messages || []);
          fetchConversations();
        }
      } catch (err) {
        toast.error('Failed to retrieve chat transcript.');
      } finally {
        setMessagesLoading(false);
      }
    };

    loadChat();
    setIsPeerTyping(false);
  }, [selectedChat]);

  // Scroll to bottom helper
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isPeerTyping]);

  // Socket.io Real-time Event Subscriptions
  useEffect(() => {
    if (!socket) return;

    // Receive incoming message
    socket.on('newMessage', (msg) => {
      if (selectedChat && (msg.sender._id === selectedChat._id || msg.receiver._id === selectedChat._id)) {
        setMessages((prev) => [...prev, msg]);
        if (msg.sender._id === selectedChat._id) {
          api.post(`/messages/send/${selectedChat._id}`, { seen: true }).catch(() => {});
        }
      }
      fetchConversations();
    });

    // Receive seen receipts
    socket.on('messagesSeen', ({ chatPartnerId, messageIds }) => {
      if (selectedChat && chatPartnerId === selectedChat._id) {
        setMessages((prev) =>
          prev.map((m) => {
            if (messageIds.includes(m._id)) {
              return { ...m, seen: true, seenAt: new Date() };
            }
            return m;
          })
        );
      }
    });

    // Receive peer typing indicators
    socket.on('typingStatus', ({ senderId, isTyping }) => {
      if (selectedChat && senderId === selectedChat._id) {
        setIsPeerTyping(isTyping);
      }
    });

    return () => {
      socket.off('newMessage');
      socket.off('messagesSeen');
      socket.off('typingStatus');
    };
  }, [socket, selectedChat]);

  // Handle typing triggers
  const handleInputChange = (e) => {
    setTypedMessage(e.target.value);
    if (!socket || !selectedChat) return;

    if (!amTyping) {
      setAmTyping(true);
      socket.emit('typing', { receiverId: selectedChat._id, isTyping: true });
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      setAmTyping(false);
      socket.emit('typing', { receiverId: selectedChat._id, isTyping: false });
    }, 2000);
  };

  // Send Text Message
  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!typedMessage.trim() || !selectedChat) return;

    try {
      const res = await api.post(`/messages/send/${selectedChat._id}`, { text: typedMessage });
      if (res.data.success) {
        setMessages((prev) => [...prev, res.data.message]);
        setTypedMessage('');
        if (socket) {
          socket.emit('typing', { receiverId: selectedChat._id, isTyping: false });
        }
        setAmTyping(false);
        fetchConversations();
      }
    } catch (error) {
      toast.error('Message delivery failed.');
    }
  };

  // Send Attachment file
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !selectedChat) return;

    const formData = new FormData();
    formData.append('media', file);

    try {
      const res = await api.post(`/messages/send/${selectedChat._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        setMessages((prev) => [...prev, res.data.message]);
        fetchConversations();
      }
    } catch (err) {
      toast.error('Failed to send file attachment.');
    }
  };

  // Start HTML5 MediaRecorder Audio Capturing
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioFile = new File([audioBlob], 'voice_note.webm', { type: 'audio/webm' });

        const formData = new FormData();
        formData.append('media', audioFile);

        try {
          const res = await api.post(`/messages/send/${selectedChat._id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          if (res.data.success) {
            setMessages((prev) => [...prev, res.data.message]);
            fetchConversations();
          }
        } catch (err) {
          toast.error('Voice note delivery failed.');
        }

        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      toast.error('Microphone permissions denied.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-130px)] md:h-[calc(100vh-100px)] glass-panel rounded-[32px] max-w-5xl mx-auto overflow-hidden my-4 shadow-2xl select-none border-white/40 dark:border-white/5 relative z-10">
      {/* Left Inbox sidebar panel */}
      <div className={`w-full md:w-80 lg:w-96 flex flex-col border-r border-neutral-200/40 dark:border-neutral-800/40 bg-white/20 dark:bg-black/10 ${
        selectedChat ? 'hidden md:flex' : 'flex'
      }`}>
        <div className="p-5 border-b border-neutral-200/40 dark:border-neutral-800/40 text-left bg-neutral-50/50 dark:bg-neutral-950/50">
          <h2 className="text-[10px] font-black text-neutral-500 dark:text-neutral-400 uppercase tracking-widest">Messages Inbox</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4.5 space-y-2 no-scrollbar">
          {conversationsLoading ? (
            <div className="flex justify-center py-16">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-20 px-4">
              <FiMessageSquare size={28} className="mx-auto text-neutral-350 dark:text-neutral-600 mb-4" />
              <p className="text-xs text-neutral-450 dark:text-neutral-500 font-semibold leading-relaxed">Inbox is empty. Start chats by exploring creator profiles!</p>
            </div>
          ) : (
            conversations.map((item) => {
              const isOnline = onlineUsers.includes(item.participant._id);
              const isActive = selectedChat?._id === item.participant._id;

              return (
                <div
                  key={item.participant._id}
                  onClick={() => setSelectedChat(item.participant)}
                  className={`flex items-center justify-between p-3.5 rounded-2xl cursor-pointer transition-all duration-200 ${
                    isActive
                      ? 'bg-neutral-900/5 dark:bg-white/10 shadow-inner border border-neutral-950/5 dark:border-white/5'
                      : 'hover:bg-neutral-100/50 dark:hover:bg-neutral-850/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={
                          item.participant.profilePic ||
                          'https://api.dicebear.com/7.x/initials/svg?seed=' + item.participant.fullName
                        }
                        alt="Participant Avatar"
                        className="w-11 h-11 rounded-xl object-cover border border-white/40 dark:border-white/5 shadow-sm"
                      />
                      {/* Online dot badge */}
                      {isOnline && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-neutral-900 shadow-md animate-pulse"></div>
                      )}
                    </div>
                    <div className="text-left max-w-[130px] md:max-w-[150px]">
                      <p className="text-xs font-black uppercase tracking-wider text-neutral-800 dark:text-white truncate">
                        {item.participant.username}
                      </p>
                      <p className="text-[9px] text-neutral-450 dark:text-neutral-500 truncate font-semibold mt-1">
                        {item.lastMessage?.text || (item.lastMessage?.mediaType === 'image' ? 'Attachment photo' : item.lastMessage?.mediaType === 'voice' ? 'Voice note' : 'New conversation')}
                      </p>
                    </div>
                  </div>

                  {item.unreadCount > 0 && (
                    <span className="w-5.5 h-5.5 bg-primary text-white text-[9px] font-black rounded-full flex items-center justify-center shrink-0 shadow-md">
                      {item.unreadCount}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right chat panel */}
      <div className={`flex-1 flex flex-col bg-neutral-50/20 dark:bg-neutral-950/20 ${
        !selectedChat ? 'hidden md:flex justify-center items-center bg-neutral-50/40 dark:bg-neutral-950/10' : 'flex'
      }`}>
        {selectedChat ? (
          <div className="w-full h-full flex flex-col justify-between relative bg-transparent">
            {/* Header info */}
            <div className="flex items-center gap-3 px-6 py-4.5 border-b border-neutral-250/40 dark:border-neutral-850/40 bg-white/70 dark:bg-neutral-900/70 backdrop-blur-md select-none">
              <button
                onClick={() => setSelectedChat(null)}
                className="md:hidden text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-white p-2 rounded-xl hover:bg-neutral-100/50 dark:hover:bg-neutral-800/50 cursor-pointer transition"
              >
                <FiChevronLeft size={18} />
              </button>
              <img
                src={
                  selectedChat.profilePic ||
                  'https://api.dicebear.com/7.x/initials/svg?seed=' + selectedChat.fullName
                }
                alt="Partner Profile"
                className="w-9 h-9 rounded-xl object-cover border border-white/40 dark:border-white/5 shadow-sm"
              />
              <div className="text-left">
                <p className="text-xs font-black uppercase tracking-wider text-neutral-800 dark:text-white">{selectedChat.username}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${onlineUsers.includes(selectedChat._id) ? 'bg-green-500 animate-pulse' : 'bg-neutral-400'}`}></div>
                  <p className="text-[9px] text-neutral-450 font-black uppercase tracking-wider">
                    {onlineUsers.includes(selectedChat._id) ? 'Active Now' : 'Offline'}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages Body */}
            <div className="flex-grow overflow-y-auto p-6 space-y-5 no-scrollbar bg-transparent">
              {messagesLoading ? (
                <div className="flex justify-center py-16">
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                messages.map((m) => {
                  const isOwn = m.sender._id === currentUser?._id || m.sender === currentUser?._id;
                  
                  return (
                    <div key={m._id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] space-y-1.5 ${isOwn ? 'text-right' : 'text-left'}`}>
                        {/* Text bubble */}
                        {m.text && (
                          <div className={`px-4 py-3 text-xs rounded-2xl break-words leading-relaxed shadow-sm font-semibold ${
                            isOwn
                              ? 'bg-gradient-to-tr from-indigo-500 to-purple-500 text-white rounded-br-none'
                              : 'bg-white dark:bg-neutral-900 border border-white/40 dark:border-white/5 text-neutral-800 dark:text-neutral-200 rounded-bl-none'
                          }`}>
                            {m.text}
                          </div>
                        )}

                        {/* Image file */}
                        {m.mediaType === 'image' && m.mediaUrl && (
                          <div className="border border-white/40 dark:border-white/5 rounded-2xl overflow-hidden shadow-md bg-neutral-100 dark:bg-neutral-950 max-w-xs">
                            <img src={m.mediaUrl} alt="attachment" className="max-w-full max-h-60 object-cover" />
                          </div>
                        )}

                        {/* Voice note message */}
                        {m.mediaType === 'voice' && m.mediaUrl && (
                          <div className={`px-3 py-2 rounded-2xl shadow-sm border border-white/45 dark:border-white/5 ${
                            isOwn ? 'bg-indigo-50/50 dark:bg-neutral-900 text-neutral-800' : 'bg-white dark:bg-neutral-900 text-neutral-800'
                          }`}>
                            <audio src={m.mediaUrl} controls className="max-w-[200px] h-8 outline-none text-xs" />
                          </div>
                        )}

                        {/* Date details & seen checkmarks */}
                        <div className="flex items-center justify-end gap-1.5 text-[9px] text-neutral-400 dark:text-neutral-500 mt-1 font-black uppercase tracking-wider">
                          <span>
                            {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {isOwn && (
                            <FiCheck size={10} className={m.seen ? 'text-primary' : 'text-neutral-400'} />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}

              {/* Peer typing indicator */}
              <AnimatePresence>
                {isPeerTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="flex justify-start"
                  >
                    <div className="bg-white dark:bg-neutral-900 border border-white/40 dark:border-white/5 px-4 py-2.5 rounded-2xl text-[9px] text-neutral-500 font-black rounded-bl-none animate-pulse uppercase tracking-wider">
                      {selectedChat.username} is typing...
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={messagesEndRef}></div>
            </div>

            {/* Input Action Bar */}
            <form onSubmit={handleSendMessage} className="p-4.5 border-t border-neutral-200/40 dark:border-neutral-800/40 bg-white/70 dark:bg-neutral-900/70 backdrop-blur-md flex flex-col gap-2 relative">
              <AnimatePresence>
                {showEmojiPicker && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-18 left-4 z-40 border border-neutral-200 dark:border-neutral-850 rounded-2xl shadow-xl overflow-hidden"
                  >
                    <EmojiPicker
                      onEmojiClick={(emojiData) => {
                        setTypedMessage((prev) => prev + emojiData.emoji);
                        setShowEmojiPicker(false);
                      }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-center gap-3">
                {/* Emoji trigger */}
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-250 cursor-pointer p-2 rounded-xl hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50 transition"
                >
                  <FiSmile size={19} />
                </button>

                {/* Upload Image trigger */}
                <label className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-250 cursor-pointer p-2 rounded-xl hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50 transition flex items-center justify-center">
                  <FiImage size={19} />
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>

                {/* Audio Recording trigger */}
                {isRecording ? (
                  <button
                    type="button"
                    onClick={stopRecording}
                    className="text-red-500 hover:text-red-650 cursor-pointer p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 transition animate-pulse"
                  >
                    <FiSquare size={19} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={startRecording}
                    className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-250 cursor-pointer p-2 rounded-xl hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50 transition"
                  >
                    <FiMic size={19} />
                  </button>
                )}

                <input
                  type="text"
                  placeholder={isRecording ? 'Recording voice note...' : 'Type message...'}
                  value={typedMessage}
                  onChange={handleInputChange}
                  disabled={isRecording}
                  className="flex-1 px-4 py-2.5 text-xs bg-neutral-100/50 dark:bg-neutral-950/50 border border-neutral-200/50 dark:border-neutral-800/55 rounded-xl outline-none focus:ring-1 focus:ring-primary focus:border-primary transition text-neutral-805 dark:text-neutral-100 font-semibold"
                />

                <button
                  type="submit"
                  disabled={!typedMessage.trim() || isRecording}
                  className="text-primary hover:text-primary-hover font-black text-xs uppercase tracking-wider cursor-pointer disabled:opacity-40 px-3.5 py-2 transition"
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="text-center p-8 select-none space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-white dark:bg-neutral-900 border border-white/20 dark:border-white/5 flex items-center justify-center text-neutral-400 dark:text-neutral-500 shadow-md mx-auto">
              <FiMessageSquare size={24} className="text-primary" />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-neutral-800 dark:text-neutral-200">Your Inbox Messages</h3>
              <p className="text-[10px] text-neutral-455 dark:text-neutral-500 font-semibold mt-1 max-w-xs mx-auto leading-relaxed">Select a creator conversation from the left drawer to read transcript history or start typing new messages.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
