# Zed Legends 🎵

A modern Zambian music streaming platform built with Next.js, featuring a beautiful glassmorphism UI, mobile-first design, and cloud storage integration.

## Features

- 🎵 **Stream Music** - Access songs from R2 storage with caching
- 👤 **User Accounts** - Register, login, and sync your favorites across devices
- ❤️ **Favorites** - Like songs to save them to your collection
- 📋 **Playlists** - Create and manage custom playlists
- 📜 **History** - Track your recently played songs
- 🔍 **Search** - Find songs quickly by title, artist, or album
- 📱 **Mobile-First** - Beautiful responsive design
- 🔄 **Queue Management** - Play next, add to queue, reorder
- 🌐 **Open Graph** - Nice link previews when shared

## Tech Stack

- **Frontend:** Next.js 14 (App Router), React, Tailwind CSS
- **Storage:** R2 Cloudflare (songs), JSON files (users)
- **Auth:** Custom JWT with password hashing
- **Icons:** Lucide React

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your settings
```

### Environment Variables

```env
# Required for R2 storage
R2_ACCESS_KEY_ID=your_key
R2_SECRET_ACCESS_KEY=your_secret
R2_BUCKET_NAME=your_bucket
R2_PUBLIC_URL=https://your-bucket.r2.dev

# Optional: Telegram for data backup
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id
```

### Running

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

## Project Structure

```
app/
├── api/                 # API routes
│   ├── auth/            # Authentication
│   ├── songs/           # Song fetching
│   ├── user/           # User data
│   └── admin/           # Admin functions
├── components/          # React components
│   ├── player/          # Audio player
│   ├── icons/           # Icon components
│   ├── layout/          # Layout components
│   └── ui/              # UI components
├── library/             # Pages
├── login/               # Auth pages
└── profile/             # User profile
lib/
├── hooks/               # React hooks
├── db.ts                # Database operations
└── api.ts               # API utilities
data/                    # Local JSON storage
```

## User Data

User data (favorites, playlists, history) is stored in:

- **Local:** `data/users.json` (for development)
- **Telegram:** Private channel backup (optional)

## License

MIT

---

**Bold. Creative. Zambian.** 🇿🇲
