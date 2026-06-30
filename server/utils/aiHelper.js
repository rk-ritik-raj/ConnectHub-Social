import axios from 'axios';

/**
 * Calls Gemini API or falls back to rules to generate captions
 * @param {string} prompt - The descriptive text/context from user
 * @returns {Promise<string>}
 */
export const generateAICaption = async (prompt) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          contents: [
            {
              parts: [
                {
                  text: `Write a creative, engaging, and modern Instagram caption based on the following description: "${prompt}". Keep it concise, friendly, and match standard social media aesthetics. Do not include hashtags.`,
                },
              ],
            },
          ],
        }
      );
      const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return text.trim();
    } catch (error) {
      console.error('Gemini API Error in Caption Generator:', error.message);
    }
  }

  // Fallback Rule-Based Caption Generator
  const fallbacks = [
    `Chasing moments, not things. ✨ (${prompt})`,
    `Just another day of making memories. 📸 (${prompt})`,
    `Current mood. Thoughts? 💭 (${prompt})`,
    `Finding joy in the ordinary. 🌟 (${prompt})`,
    `Making the most of today. Let's go! 🚀 (${prompt})`,
  ];
  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
};

/**
 * Calls Gemini API or falls back to rules to generate hashtags
 * @param {string} prompt - Description text
 * @returns {Promise<Array<string>>}
 */
export const generateAIHashtags = async (prompt) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          contents: [
            {
              parts: [
                {
                  text: `Generate 8 relevant, high-traffic Instagram hashtags (just the tags, separated by spaces) for a post described as: "${prompt}".`,
                },
              ],
            },
          ],
        }
      );
      const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        // Extract hashtags
        const tags = text.match(/#\w+/g) || [];
        if (tags.length > 0) return tags.map((t) => t.toLowerCase());
      }
    } catch (error) {
      console.error('Gemini API Error in Hashtag Generator:', error.message);
    }
  }

  // Fallback Hashtag Generator
  const keywords = prompt.toLowerCase().split(/\s+/);
  const baseTags = ['#connecthub', '#instagood', '#photooftheday', '#picoftheday', '#goodvibes'];
  
  keywords.forEach((word) => {
    if (word.length > 3) {
      baseTags.push(`#${word.replace(/[^a-zA-Z0-9]/g, '')}`);
    }
  });

  return [...new Set(baseTags)].slice(0, 8);
};

/**
 * Generate 3 AI suggested comment replies based on post caption
 * @param {string} caption - Post caption
 * @returns {Promise<Array<string>>}
 */
export const generateAICommentSuggestions = async (caption) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          contents: [
            {
              parts: [
                {
                  text: `Suggest 3 short, friendly, and natural Instagram comments for a post with this caption: "${caption}". Provide them as a simple numbered list, e.g. "1. Comment one\\n2. Comment two\\n3. Comment three".`,
                },
              ],
            },
          ],
        }
      );
      const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        const comments = text
          .split('\n')
          .map((line) => line.replace(/^\d+\.\s*/, '').trim())
          .filter((line) => line.length > 0);
        if (comments.length >= 3) return comments.slice(0, 3);
      }
    } catch (error) {
      console.error('Gemini API Error in Comment Suggestion:', error.message);
    }
  }

  // Fallback Comment Suggestions
  return [
    'Love this! Absolute vibes! 🔥',
    'So clean. Keep it up! 💯',
    'This is amazing, thanks for sharing! 🙌',
  ];
};
