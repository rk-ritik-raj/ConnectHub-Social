# ConnectHub: Production-Ready Instagram Clone

ConnectHub is a full-featured, responsive, and secure Instagram Clone built on the MERN stack (React 19 + Vite, Node.js + Express.js, MongoDB + Mongoose, and Socket.io). It incorporates real-time WebSocket chat, dynamic stories (24-hour auto-expiry), vertical snap-scrolling reels, custom notification systems, dark/light display toggles, an admin moderation panel, and a Gemini-powered AI Assistant to generate post captions, hashtags, and suggestion replies.

---

## 🚀 Tech Stack

### Frontend
- **React 19** & **Vite** (Next-Gen module bundle)
- **React Router DOM v7** (Secure protected route hierarchies)
- **Tailwind CSS v4** (Modern styles, glassmorphic filters)
- **Framer Motion** (Micro-animations and double-tap interactions)
- **Axios** (Global cookie-credentials config)
- **React Hook Form** (Robust client form validations)
- **Socket.io Client** (WebSocket messaging channels)

### Backend
- **Node.js** & **Express.js** (ES Modules enabled, MVC architecture)
- **MongoDB** & **Mongoose** (TTL indexing, relation population)
- **JSON Web Token (JWT)** (HTTP-Only Secure Cookie session cache)
- **BcryptJS** (Password salting and comparisons)
- **Multer** & **Cloudinary SDK** (Batch media uploading with offline fallback)
- **Socket.io** (Bidirectional message routing)
- **Express Validator & Express Rate Limit** (Input sanitization and security throttling)

---

## 📂 Project Structure

```text
Instagram/
├── client/                  # Frontend Client (React)
│   ├── src/
│   │   ├── assets/          # Visual assets
│   │   ├── components/      # UI components (PostCard, StoriesTray, CreatePostModal)
│   │   ├── context/         # AuthContext, ThemeContext, SocketContext
│   │   ├── layouts/         # MainLayout (Sticky Side/Bottom menu templates)
│   │   ├── pages/           # Pages (Home, Explore, Profile, Reels, Settings)
│   │   ├── routes/          # AppRoutes (Protected and Public routes)
│   │   ├── services/        # api.js (Configured Axios client)
│   │   └── index.css        # Tailwind v4 import & custom scrollbar settings
│   └── package.json
└── server/                  # Backend API Server (Node + Express)
    ├── config/              # db.js (Mongoose connection), cloudinary.js (Media cloud SDK)
    ├── controllers/         # MVC Controllers (auth, user, post, story, message, admin)
    ├── middleware/          # authMiddleware, uploadMiddleware (Multer), errorMiddleware
    ├── models/              # Schemas (User, Post, Comment, Story, Message, Notification)
    ├── routes/              # Express Router endpoints
    ├── sockets/             # socketHandler.js (WebSockets and typing statuses)
    ├── uploads/             # Temporary folder for local media storage
    ├── utils/               # token.js (JWT sign/verify), aiHelper.js (Gemini SDK/Local Fallback)
    ├── server.js            # Server root entry point
    └── package.json
```

---

## 🛠️ Installation & Setup

### Prerequisites
- **Node.js** (v18+ recommended)
- **MongoDB** (Local instance running at `mongodb://127.0.0.1:27017` or MongoDB Atlas URI)

### 1. Server Configuration
Navigate into the `server/` directory and configure the environment variables:

```bash
cd server
```

Create a `.env` file containing:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/connecthub
JWT_SECRET=connecthub_super_secret_jwt_key_987654321
NODE_ENV=development

# Cloudinary Storage Configuration (Optional: Empty values default to local server folder uploads)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Gemini AI Engine Configuration (Optional: Empty values fallback to rule-based generation)
GEMINI_API_KEY=
```

Install packages and run server:
```bash
npm install
npm run dev
```
The server will boot and connect to MongoDB, listening at `http://localhost:5000`.

### 2. Client Configuration
Open a new terminal window, navigate into the `client/` directory, and run the client:

```bash
cd client
npm install
npm run dev
```
The Vite client will launch, listening at `http://localhost:5173`.

---

## 📖 REST API Reference

### 🔐 Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/signup` | Registers a new account, logs OTP verification code. | No |
| `POST` | `/verify-email` | Validates email verification code and sets session cookies. | No |
| `POST` | `/login` | Authorizes username/email and sets session cookies. | No |
| `POST` | `/logout` | Clears JWT session cookies. | No |
| `POST` | `/forgot-password` | Sends a reset OTP to email/console log. | No |
| `POST` | `/reset-password` | Executes password reset using OTP. | No |
| `GET` | `/me` | Retrieves the current session user data. | Yes |

### 👤 Profile & Relations (`/api/users`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/profile/:username` | Retrieves user profile metadata and follow details. | Yes |
| `PUT` | `/profile` | Updates fullName, bio, website, and privacy toggles. | Yes |
| `PUT` | `/profile/avatar` | Uploads profile picture (Multer `avatar` payload). | Yes |
| `POST` | `/follow/:id` | Toggles follow/unfollow and dispatches follow notifications. | Yes |
| `GET` | `/suggested` | Fetches suggested users not followed yet. | Yes |
| `GET` | `/search` | Queries users by username or fullName. | Yes |
| `GET` | `/followers/:userId` | Lists user followers. | Yes |
| `GET` | `/following/:userId` | Lists user following list. | Yes |
| `PUT` | `/change-password` | Verifies current password and updates it. | Yes |

### 🖼️ Posts & AI Features (`/api/posts`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/` | Uploads post media array (Multer `media` files), caption, location. | Yes |
| `GET` | `/feed` | Gets paginated posts from followed accounts + suggestions. | Yes |
| `GET` | `/explore` | Returns random trending posts for discovery grid. | Yes |
| `GET` | `/reels` | Returns vertical reels videos. | Yes |
| `GET` | `/user/:username` | Returns posts uploaded by a specific user. | Yes |
| `DELETE` | `/:id` | Deletes own post and comments. | Yes |
| `POST` | `/like/:id` | Likes/unlikes post and triggers notifications. | Yes |
| `POST` | `/save/:id` | Bookmarks/bookmarks-reset post to saved list. | Yes |
| `GET` | `/saved` | Returns posts saved by current user. | Yes |
| `POST` | `/comment/:id` | Adds a comment (parentCommentId optional for nested replies).| Yes |
| `GET` | `/:id/comments` | Fetches comments and replies for a post. | Yes |
| `POST` | `/pin/:id` | Toggles pinned post on profile grid. | Yes |
| `GET` | `/ai/caption` | Triggers Gemini to write caption from prompt. | Yes |
| `GET` | `/ai/hashtag` | Triggers Gemini to compile hashtag list. | Yes |
| `GET` | `/ai/commentsuggest`| Triggers Gemini to suggest comments for caption context. | Yes |

### 📖 Stories (`/api/stories`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/` | Uploads story file (Multer `media`). Expires in 24 hours. | Yes |
| `GET` | `/feed` | Gathers active stories grouped by followed user. | Yes |
| `POST` | `/view/:id` | Marks story viewed by current user. | Yes |

### 💬 Messages (`/api/messages`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/send/:receiverId` | Sends message text or attachments (Multer `media` file). | Yes |
| `GET` | `/chat/:userId` | Retrieves chat log and clears unread status flags. | Yes |
| `GET` | `/conversations` | Retrieves conversations summary list (inbox views). | Yes |

### 🛠️ Admin Moderation (`/api/admin`)
| Method | Endpoint | Description | Role Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/analytics` | Fetches total system counters. | Admin |
| `GET` | `/recent` | Returns recent registrations and post uploads. | Admin |
| `DELETE` | `/user/:id` | Force deletes user account and content. | Admin |
| `DELETE` | `/post/:id` | Moderates post deletion. | Admin |

---

## ⚡ Real-Time Events (Socket.io)

### Client Emissions
- `typing`: Emits typing bubble state `{ receiverId, isTyping }`.

### Server Emissions
- `getOnlineUsers`: Broadcasts list of active user IDs to all online clients.
- `newMessage`: Pushes incoming message to the recipient client.
- `messagesSeen`: Signals that the recipient read specific messages, updating single ticks.
- `typingStatus`: Delivers typing bubble updates from the partner client.
- `newNotification`: Broadcasts follow, like, or comment alerts in real-time.

---

## 🔍 Development Testing & Verification

1. **Email / OTP verification**:
   Since NodeMailer utilizes email server logs for development:
   - Registers a new user (`/register`).
   - Look at the terminal logs of the Node server. You will see a print:
     ```text
     --- EMAIL VERIFICATION CODE FOR user@example.com ---
     Code: 123456
     ----------------------------------------------------
     ```
   - Input this 6-digit code into the client OTP panel to verify the account.
2. **AI Caption Tools**:
   - Describe a photo in the uploader modal and click "Generate with AI".
   - If no Gemini API key is configured, the rule-based local system responds with realistic hashtags (e.g. matching tags to description words) and captions to allow off-grid testing.
3. **WebSockets Direct Messaging**:
   - Open two browser tabs: Tab A (User A) and Tab B (User B).
   - Navigate to Messages and select each other.
   - Send texts, images, or click the mic button to record voice notes!
   - Verification checklist: online green dot indicator, typing status, message ticks, audio playback, and unread counts.
