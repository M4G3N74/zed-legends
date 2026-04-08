# Music Stream Next.js - Catppuccin Mocha Edition

A modern music streaming application built with Next.js and React that streams music from your local music library. Features a beautiful dark mode UI with the Catppuccin Mocha color scheme, mobile-first responsive design, and component-based architecture.

## Features

- 🎵 Stream music from your local music library
- 🔄 Auto-play functionality for continuous playback
- 🔀 Smart shuffle mode that learns from your listening habits
- 🔁 Repeat modes (none, one, all)
- 🎚️ Volume control with bass boost enhancement
- 🎨 Dark mode UI with Catppuccin Mocha color scheme
- 📱 Mobile-first responsive design
- 🔍 Search functionality for finding songs quickly
- 📊 Visualizer for audio playback
- 📄 Pagination for large libraries (standard or infinite scroll)
- 📝 Metadata editing for songs
- 💾 Remembers your preferences
- ⚛️ Built with Next.js and React components

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v7 or higher)
- A collection of music files in the `/home/purple/Music` directory

### Installation

1. Clone this repository or download the files
2. Navigate to the project directory
3. Install dependencies:

   ```bash
   npm install
   ```

4. Make the start scripts executable:

   ```bash
   chmod +x start-dev.sh start-prod.sh
   ```

### Running the Application

#### Development Mode

Run both the Next.js frontend and Node.js API server in development mode:

```bash
# Using npm script
npm run dev:all

# Or using the shell script
./start-dev.sh
```

#### Production Mode

Build and run both the Next.js frontend and Node.js API server in production mode:

```bash
# Using npm script
npm run build
npm run start:all

# Or using the shell script
./start-prod.sh
```

#### Running Services Separately

If you want to run the services separately:

```bash
# Run only the API server
npm run dev:server  # Development mode
npm run server      # Production mode

# Run only the Next.js frontend
npm run dev         # Development mode
npm run start       # Production mode (after building)
```

The application will be available at:

```text
http://localhost:3000  # Next.js frontend
```

## Usage

### Playback Controls

- **Play/Pause**: Click the play/pause button to control playback (or press Space)
- **Next/Previous**: Navigate between songs (or press N/P)
- **Shuffle**: Toggle shuffle mode to randomize playback order
- **Smart Shuffle**: Enable smart shuffle to prioritize songs based on your listening habits
- **Repeat**: Cycle through repeat modes (none, one, all)
- **Auto-play**: Toggle auto-play to automatically play the next song when the current one ends
- **Bass Boost**: Enhance bass frequencies for a richer sound
- **Volume**: Adjust the volume using the slider
- **Progress**: Click anywhere on the progress bar to seek to that position

### Library Management

- **Search**: Use the search bar to find songs by title, artist, or album
- **Sort**: Click the sort button to sort by artist, title, or album
- **Edit Metadata**: Click the edit icon on any song to modify its metadata
- **Delete**: Click the delete icon to remove a song from your library
- **Refresh**: Click the refresh button to scan for new music files

### Pagination

- **Standard Pagination**: Navigate through pages using the pagination controls
- **Infinite Scroll**: Automatically load more songs as you scroll
- **Toggle Mode**: Switch between standard pagination and infinite scroll
- **Page Size**: Change the number of songs displayed per page

### Keyboard Shortcuts

- **Space**: Play/Pause
- **N**: Next song
- **P**: Previous song
- **M**: Mute/Unmute
- **S**: Toggle shuffle
- **R**: Cycle repeat modes
- **B**: Toggle bass boost
- **F**: Search (focus search input)
- **Escape**: Clear search

## Customization

### Music Directory

By default, the application uses `/home/purple/Music` as the music directory. To change this, edit the `MUSIC_DIR` constant in `server.js`:

```javascript
const MUSIC_DIR = '/path/to/your/music';
```

### Port Configuration

The default port for the API server is 3000. To change this, edit the `PORT` constant in `server.js`:

```javascript
const PORT = process.env.PORT || 8080;
```

If you change the API server port, you'll also need to update the rewrites in `next.config.js` to point to the new port:

```javascript
async rewrites() {
  return [
    {
      source: '/api/:path*',
      destination: 'http://localhost:8080/api/:path*', // Updated port
    },
    {
      source: '/music/:path*',
      destination: 'http://localhost:8080/music/:path*', // Updated port
    },
  ];
}
```

### Theme Customization

The application uses the Catppuccin Mocha color scheme by default. The theme variables are defined in `styles/globals.css`:

```css
:root {
  /* Catppuccin Mocha color palette */
  --color-background: #1e1e2e;
  --color-surface: #313244;
  --color-overlay: #6c7086;
  --color-muted: #9399b2;
  --color-text: #cdd6f4;
  --color-love: #f38ba8;
  --color-gold: #f9e2af;
  --color-peach: #fab387;
  --color-green: #a6e3a1;
  --color-teal: #94e2d5;
  --color-sky: #89dceb;
  --color-sapphire: #74c7ec;
  --color-blue: #89b4fa;
  --color-lavender: #b4befe;
  --color-mauve: #cba6f7;
}
```

You can also customize the Tailwind theme in `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      // Catppuccin Mocha color palette
      background: '#1e1e2e',
      surface: '#313244',
      overlay: '#6c7086',
      // ... other colors
    },
    // ... other theme extensions
  },
},
```

## User Acceptance Testing (UAT)

### Test Scenarios

1. **Basic Playback**
   - Load the application
   - Play a song
   - Pause the song
   - Resume playback
   - Skip to the next song
   - Go back to the previous song

2. **Volume Control**
   - Adjust volume using the slider
   - Mute and unmute

3. **Playlist Navigation**
   - Test pagination controls
   - Switch between standard pagination and infinite scroll
   - Test different page sizes

4. **Search Functionality**
   - Search for a song by title
   - Search for songs by artist
   - Search for songs by album
   - Clear search and verify all songs are shown again

5. **Metadata Editing**
   - Edit a song's metadata
   - Verify changes are saved
   - Verify changes persist after refresh

6. **Audio Features**
   - Test bass boost
   - Verify visualizer works
   - Test smart shuffle

7. **Responsive Design**
   - Test on desktop
   - Test on tablet
   - Test on mobile devices

### Reporting Issues

When reporting issues, please include:

1. Steps to reproduce
2. Expected behavior
3. Actual behavior
4. Browser and OS information
5. Screenshots if applicable

## Project Structure

The application follows a component-based architecture with Next.js:

```bash
music-stream-next/
├── components/             # React components
│   ├── context/            # Context providers for state management
│   │   ├── LibraryContext.js
│   │   ├── PlayerContext.js
│   │   └── ThemeContext.js
│   ├── features/           # Feature components
│   │   ├── DeleteConfirmationModal.js
│   │   ├── EditMetadataModal.js
│   │   ├── SongItem.js
│   │   └── SongList.js
│   ├── layout/             # Layout components
│   │   ├── Layout.js
│   │   ├── NowPlayingBar.js
│   │   └── Sidebar.js
│   └── ui/                 # UI components
│       ├── Pagination.js
│       ├── SearchBar.js
│       └── Visualizer.js
├── pages/                  # Next.js pages
│   ├── _app.js
│   ├── _document.js
│   └── index.js
├── public/                 # Static assets
│   ├── css/
│   ├── images/
│   └── js/
├── styles/                 # Global styles
│   └── globals.css
├── next.config.js          # Next.js configuration
├── package.json            # Project dependencies
├── postcss.config.js       # PostCSS configuration
├── server.js               # Node.js API server
├── start-dev.sh            # Development startup script
├── start-prod.sh           # Production startup script
└── tailwind.config.js      # Tailwind CSS configuration
```

### Mobile-First Approach

The application is designed with a mobile-first approach:

- Responsive layouts that adapt to different screen sizes
- Touch-friendly controls for mobile devices
- Optimized navigation for small screens
- Efficient loading and rendering for mobile performance

### Component Organization

Components are organized by their purpose:

- **Context**: State management using React Context API
- **Layout**: Structural components that define the application layout
- **Features**: Components that implement specific features
- **UI**: Reusable UI components

## Browser Compatibility

The application has been tested on:

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is open source and available under the MIT License.

## Acknowledgements

- Next.js and React for the frontend framework
- Tailwind CSS for styling
- Catppuccin Mocha color scheme
- Font Awesome for icons
