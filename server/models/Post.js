import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    media: [
      {
        url: { type: String, required: true },
        type: { type: String, enum: ['image', 'video'], default: 'image' },
      },
    ],
    caption: {
      type: String,
      trim: true,
      default: '',
    },
    location: {
      type: String,
      trim: true,
      default: '',
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        index: true,
      },
    ],
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
      },
    ],
    hashtags: [
      {
        type: String,
        trim: true,
        index: true,
      },
    ],
    pinned: {
      type: Boolean,
      default: false,
    },
    views: {
      type: Number,
      default: 0,
    },
    shares: {
      type: Number,
      default: 0,
    },
    isReel: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

// Automatically extract and set hashtags from the caption before save
postSchema.pre('save', function (next) {
  if (this.caption) {
    const hashtagRegex = /#(\w+)/g;
    const matches = this.caption.match(hashtagRegex);
    if (matches) {
      // Remove '#' and save clean lowercase tags
      this.hashtags = matches.map((tag) => tag.substring(1).toLowerCase());
    } else {
      this.hashtags = [];
    }
  } else {
    this.hashtags = [];
  }
  next();
});

const Post = mongoose.model('Post', postSchema);
export default Post;
