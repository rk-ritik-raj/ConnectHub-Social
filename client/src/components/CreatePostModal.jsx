import React, { useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiImage, FiMapPin, FiCpu, FiPlus, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const CreatePostModal = ({ isOpen, onClose, onPostCreated }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);

  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [isReel, setIsReel] = useState(false);

  // AI Assistant States
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [showAiHelper, setShowAiHelper] = useState(false);

  if (!isOpen) return null;

  // File Select Handler
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Validate size (15MB max per file)
    const validFiles = files.filter((f) => {
      if (f.size > 15 * 1024 * 1024) {
        toast.error(`${f.name} is too large (max 15MB)`);
        return false;
      }
      return true;
    });

    setSelectedFiles((prev) => [...prev, ...validFiles]);

    // Create local object URLs for previews
    const newPreviews = validFiles.map((file) => ({
      url: URL.createObjectURL(file),
      type: file.type.startsWith('video/') ? 'video' : 'image',
    }));
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  // Remove preview item
  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
    if (activeIndex >= previews.length - 1 && activeIndex > 0) {
      setActiveIndex(activeIndex - 1);
    }
  };

  // AI Caption/Hashtags generator call
  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) {
      toast.error('Please describe your post first');
      return;
    }

    setAiLoading(true);
    try {
      const [capRes, hashRes] = await Promise.all([
        api.get(`/posts/ai/caption?prompt=${encodeURIComponent(aiPrompt)}`),
        api.get(`/posts/ai/hashtag?prompt=${encodeURIComponent(aiPrompt)}`),
      ]);

      if (capRes.data.success && hashRes.data.success) {
        const hashtagsStr = hashRes.data.hashtags.join(' ');
        setCaption(`${capRes.data.caption}\n\n${hashtagsStr}`);
        toast.success('AI suggestions generated!');
        setShowAiHelper(false);
      }
    } catch (error) {
      toast.error('Failed to contact AI engine.');
    } finally {
      setAiLoading(false);
    }
  };

  // Submit Post
  const handleShare = async () => {
    if (selectedFiles.length === 0) {
      toast.error('Please select at least one image or video');
      return;
    }

    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append('media', file);
    });
    formData.append('caption', caption);
    formData.append('location', location);
    formData.append('isReel', isReel);

    setLoading(true);
    try {
      const res = await api.post('/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        toast.success('Post shared successfully!');
        if (onPostCreated) onPostCreated(res.data.post);
        handleClose();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to publish post.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Revoke object URLs to prevent leaks
    previews.forEach((p) => URL.revokeObjectURL(p.url));
    setSelectedFiles([]);
    setPreviews([]);
    setCaption('');
    setLocation('');
    setAiPrompt('');
    setActiveIndex(0);
    onClose();
  };

  const nextSlide = () => {
    setActiveIndex((prev) => (prev === previews.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setActiveIndex((prev) => (prev === 0 ? previews.length - 1 : prev - 1));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-neutral-955/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 select-none"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 26, stiffness: 220 }}
            className="bg-white/85 dark:bg-neutral-900/85 backdrop-blur-xl border border-white/20 dark:border-white/5 w-full max-w-4xl rounded-[32px] flex flex-col md:flex-row h-[85vh] md:h-[650px] overflow-hidden shadow-2xl"
          >
            {/* Media Upload / Preview Column */}
            <div className="flex-1 bg-neutral-100/50 dark:bg-neutral-950/40 flex flex-col justify-center items-center relative border-r border-neutral-200/40 dark:border-neutral-800/40 min-h-[300px] md:min-h-0">
              {previews.length === 0 ? (
                <div className="flex flex-col items-center p-8 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 dark:bg-indigo-400/10 flex items-center justify-center text-primary mb-5 shadow-inner">
                    <FiImage size={28} className="animate-pulse text-indigo-500 dark:text-indigo-400" />
                  </div>
                  <h3 className="text-sm font-black font-display text-neutral-850 dark:text-neutral-200 mb-2 uppercase tracking-wider">
                    Upload photos and videos
                  </h3>
                  <p className="text-xs text-neutral-450 dark:text-neutral-500 mb-6 max-w-xs leading-relaxed font-medium">
                    Choose high-quality pictures or clips from your device (max size 15MB)
                  </p>
                  <label className="px-5 py-3 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-950 text-xs font-black uppercase tracking-wider rounded-2xl cursor-pointer shadow-md transition-all hover:scale-102 active:scale-98">
                    Select from device
                    <input
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>
                </div>
              ) : (
                <div className="w-full h-full relative group bg-black">
                  {/* Media Element */}
                  {previews[activeIndex].type === 'video' ? (
                    <video
                      src={previews[activeIndex].url}
                      controls
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <img
                      src={previews[activeIndex].url}
                      alt="Preview"
                      className="w-full h-full object-contain"
                    />
                  )}

                  {/* Slider Controls (if multiple) */}
                  {previews.length > 1 && (
                    <>
                      <button
                        onClick={prevSlide}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full backdrop-blur-sm transition cursor-pointer z-10 hover:scale-105 active:scale-95"
                      >
                        <FiChevronLeft size={18} />
                      </button>
                      <button
                        onClick={nextSlide}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full backdrop-blur-sm transition cursor-pointer z-10 hover:scale-105 active:scale-95"
                      >
                        <FiChevronRight size={18} />
                      </button>
                      {/* Indicators dot */}
                      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-10">
                        {previews.map((_, i) => (
                          <div
                            key={i}
                            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                              i === activeIndex ? 'bg-primary scale-125 px-1.5' : 'bg-white/50'
                            }`}
                          ></div>
                        ))}
                      </div>
                    </>
                  )}

                  {/* Top Controls Overlay */}
                  <div className="absolute top-4 right-4 flex gap-2 z-10">
                    <label className="bg-black/50 hover:bg-black/70 text-white p-2.5 rounded-full backdrop-blur-sm cursor-pointer transition flex items-center justify-center active:scale-90 shadow-sm">
                      <FiPlus size={16} />
                      <input
                        type="file"
                        multiple
                        accept="image/*,video/*"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </label>
                    <button
                      onClick={() => removeFile(activeIndex)}
                      className="bg-black/50 hover:bg-red-500 text-white p-2.5 rounded-full backdrop-blur-sm transition cursor-pointer flex items-center justify-center active:scale-90 shadow-sm"
                    >
                      <FiX size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Form Details Column */}
            <div className="w-full md:w-[360px] flex flex-col bg-transparent">
              {/* Modal Header */}
              <div className="flex items-center justify-between px-5 py-4.5 border-b border-neutral-200/40 dark:border-neutral-800/40 bg-neutral-50/40 dark:bg-neutral-950/40 select-none">
                <button
                  onClick={handleClose}
                  className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-250 cursor-pointer p-1.5 rounded-xl hover:bg-neutral-100/50 dark:hover:bg-neutral-800/50 transition"
                >
                  <FiX size={18} />
                </button>
                <span className="font-black text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">Create Post</span>
                <button
                  onClick={handleShare}
                  disabled={loading || selectedFiles.length === 0}
                  className="px-3.5 py-1.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 text-[10px] font-black uppercase tracking-wider rounded-xl disabled:opacity-45 cursor-pointer transition hover:scale-102 active:scale-98"
                >
                  {loading ? 'Sharing...' : 'Share'}
                </button>
              </div>

              {/* Form Fields */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6 no-scrollbar">
                {/* Caption Area */}
                <div className="space-y-2 text-left">
                  <label className="block text-[10px] font-black text-neutral-450 dark:text-neutral-400 uppercase tracking-widest">
                    Caption
                  </label>
                  <textarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Write a captivating description..."
                    rows={4}
                    className="w-full p-4 text-xs bg-neutral-100/50 dark:bg-neutral-950/50 border border-neutral-200/50 dark:border-neutral-800/55 rounded-2xl outline-none focus:ring-1 focus:ring-primary focus:border-primary transition text-neutral-800 dark:text-neutral-100 resize-none font-semibold"
                  ></textarea>
                </div>

                {/* AI Assistant Accordion */}
                <div className="border border-neutral-200/50 dark:border-neutral-800/55 rounded-2xl overflow-hidden shadow-sm bg-neutral-50/50 dark:bg-neutral-950/50">
                  <button
                    type="button"
                    onClick={() => setShowAiHelper(!showAiHelper)}
                    className="w-full flex items-center justify-between px-4 py-3 text-neutral-700 dark:text-neutral-350 cursor-pointer hover:bg-neutral-100/40 dark:hover:bg-neutral-900/40 transition"
                  >
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                      <FiCpu className="text-primary animate-pulse" />
                      <span>AI Caption Assistant</span>
                    </div>
                    <span className="text-[10px] font-bold text-primary dark:text-indigo-400 uppercase tracking-wider">{showAiHelper ? 'Hide' : 'Expand'}</span>
                  </button>

                  {showAiHelper && (
                    <div className="p-4 border-t border-neutral-200/40 dark:border-neutral-800/40 space-y-3.5 text-left bg-neutral-100/20 dark:bg-neutral-900/20">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold tracking-wider uppercase text-neutral-450 dark:text-neutral-500">
                          Photo Description
                        </label>
                        <input
                          type="text"
                          value={aiPrompt}
                          onChange={(e) => setAiPrompt(e.target.value)}
                          placeholder="Describe e.g. clean code setup at desk"
                          className="w-full px-3.5 py-2.5 text-xs bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl outline-none focus:ring-1 focus:ring-primary text-neutral-850 dark:text-neutral-100 font-semibold"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleAIGenerate}
                        disabled={aiLoading}
                        className="w-full py-2.5 bg-gradient-to-r from-primary to-secondary hover:from-primary-hover hover:to-secondary-hover disabled:opacity-50 text-white font-black text-[10px] uppercase tracking-wider rounded-xl shadow-md hover:scale-102 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        {aiLoading ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <>
                            <FiCpu /> Generate Ideas
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* Location Area */}
                <div className="space-y-2 text-left">
                  <label className="block text-[10px] font-black text-neutral-450 dark:text-neutral-400 uppercase tracking-widest">
                    Location
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Add location details"
                      className="w-full pl-10 pr-4 py-2.5 text-xs bg-neutral-100/50 dark:bg-neutral-950/50 border border-neutral-200/50 dark:border-neutral-800/55 rounded-xl outline-none focus:ring-1 focus:ring-primary transition text-neutral-800 dark:text-neutral-100 font-semibold"
                    />
                    <FiMapPin className="absolute left-3.5 top-3 text-neutral-400" size={15} />
                  </div>
                </div>

                {/* Share as Reel Toggle */}
                {selectedFiles.some((f) => f.type.startsWith('video/')) && (
                  <div className="flex items-center justify-between p-4 bg-neutral-100/50 dark:bg-neutral-950/40 border border-neutral-200/40 dark:border-neutral-800/40 rounded-2xl select-none">
                    <div className="text-left">
                      <h4 className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wide">Share as Reel</h4>
                      <p className="text-[9px] text-neutral-450 mt-0.5 font-bold uppercase tracking-wider">This clip will show in Reels</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={isReel}
                      onChange={(e) => setIsReel(e.target.checked)}
                      className="w-4 h-4 accent-primary rounded cursor-pointer"
                    />
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CreatePostModal;
