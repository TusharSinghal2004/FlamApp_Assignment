# Collaborative Canvas - Real-time Multi-User Drawing Application

A real-time collaborative drawing application where multiple users can draw simultaneously on a shared canvas with instant synchronization, cursor tracking, and global undo/redo support.

## 📋 Features

- **Real-time Synchronization**: See other users' drawings as they draw in real-time
- **Drawing Tools**: Brush and eraser with adjustable stroke width
- **Color Picker**: Multiple colors with automatic user color assignment
- **Remote Cursors**: See where other users are currently drawing
- **Global Undo/Redo**: Undo/redo works across all users' drawings
- **User Management**: Live user list showing who's online in the room
- **Conflict Resolution**: Handles simultaneous drawing in overlapping areas
- **Demo Mode**: Works without server (single-user mode) for testing frontend
- **Multi-room Support**: Different drawing sessions for different rooms
- **Canvas Mastery**: Efficient path rendering and high-frequency event handling
- **Local Persistence**: User drawings saved to localStorage and restored on rejoin

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation & Setup

```bash
# 1. Clone and navigate to the project
git clone <YOUR_REPO_URL>
cd FlamApp_Assignment

# 2. Install frontend dependencies
npm install

# 3. Install server dependencies
cd server
npm install
cd ..

# 4. Start the WebSocket server (in a new terminal)
npm run server

# 5. Start the development server (in another terminal)
npm run dev
```

The application will be available at `http://localhost:5173`

## 🧪 Testing with Multiple Users

### Option 1: Local Testing (Two Browser Tabs)
1. Open `http://localhost:5173` in two different browser tabs
2. Enter a room name (same for both) and username
3. Draw in one tab and see updates in real-time in the other

### Option 2: Network Testing
1. On Machine A: Start server and frontend as above
2. On Machine B: Access `http://<Machine-A-IP>:5173`
3. Join the same room and test collaborative drawing

### Option 3: Demo Mode (Without Server)
If the WebSocket server is not running, the application automatically falls back to demo mode:
- Frontend-only drawing works
- Undo/redo functions
- Remote user features are disabled

## 📚 Project Structure

```
├── src/
│   ├── components/canvas/
│   │   ├── DrawingCanvas.tsx       # Core canvas drawing logic
│   │   ├── Toolbar.tsx              # Tool selection & settings
│   │   ├── UsersSidebar.tsx         # User list display
│   │   ├── RemoteCursors.tsx        # Remote cursor rendering
│   │   └── RoomJoinDialog.tsx       # Room entry UI
│   ├── hooks/
│   │   ├── useWebSocket.ts          # WebSocket client with fallback
│   │   ├── useCanvas.ts             # Canvas rendering logic
│   │   └── use-mobile.tsx           # Mobile detection
│   ├── types/
│   │   └── canvas.ts                # TypeScript type definitions
│   └── pages/
│       └── Index.tsx                # Main entry point
├── server/
│   ├── server.js                    # Express + WebSocket server
│   ├── rooms.js                     # Room and user management
│   └── drawing-state.js             # Canvas state & undo/redo logic
├── ARCHITECTURE.md                  # Detailed architecture documentation
└── package.json
```

## 🏗️ Architecture Overview

### Frontend
- **React + TypeScript**: Component-based UI with hooks
- **Canvas API**: Raw HTML5 Canvas for efficient drawing
- **WebSocket Client**: Real-time communication with fallback to demo mode
- **State Management**: React hooks for local and synchronized state

### Backend
- **Node.js + Express**: HTTP server for health checks
- **WebSocket Server**: Real-time message handling with rooms
- **Room Manager**: Isolated drawing sessions per room
- **Drawing State**: Global undo/redo across all users

### Real-time Communication
- **Message Format**: JSON-based WebSocket messages
- **Event Types**: `join`, `stroke_start`, `stroke_update`, `stroke_end`, `undo`, `redo`, `cursor_move`
- **Batching**: Cursor updates throttled to 50ms for efficiency
- **Broadcasting**: Messages broadcast to all users in a room

## 🎮 How to Use

1. **Join a Room**: Enter a room name and username
2. **Draw**: Click and drag to draw with the brush tool
3. **Erase**: Switch to eraser tool to remove content
4. **Adjust Settings**: Change color and stroke width from toolbar
5. **Undo/Redo**: Use toolbar buttons or Ctrl+Z / Ctrl+Y shortcuts
6. **View Users**: Check the sidebar to see who's drawing

## 🔧 Technical Implementation

### Canvas Rendering
- **Path Optimization**: Smooth Bezier curves between points
- **Layer Management**: Separate layers for each stroke
- **Efficient Redraw**: Only redraws when needed
- **High-Frequency Events**: Throttled mouse events (50ms for cursors)

### State Synchronization
- **Operation History**: Linear undo/redo stack (LIFO)
- **Stroke Finalization**: Strokes committed when mouse is released
- **Active Strokes**: In-progress strokes tracked separately
- **Conflict Handling**: Last-write-wins for overlapping areas

### WebSocket Protocol
```javascript
// Join room
{ type: 'join', payload: { user } }

// Stroke events
{ type: 'stroke_start', payload: { stroke } }
{ type: 'stroke_update', payload: { strokeId, point } }
{ type: 'stroke_end', payload: { strokeId } }

// Undo/Redo
{ type: 'undo', payload: {} }
{ type: 'redo', payload: {} }

// Cursor tracking
{ type: 'cursor_move', payload: { position } }
```

## 📊 npm Scripts

```bash
npm run dev        # Start Vite development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run test       # Run tests
npm run lint       # Run ESLint
npm run server     # Start WebSocket server
```

## ✅ Known Limitations & Future Improvements

### Current Limitations
- **Single Undo Stack**: Global undo/redo (conflicts resolved by operation order)
- **Server Persistence**: Drawing data stored in-memory (clears on server restart)
- **Client Persistence**: Individual user drawings saved to localStorage (survives page refresh)
- **In-Memory Only**: No database backend
- **Limited Colors**: 8 predefined user colors
- **No Authentication**: Room IDs are public
- **Network Latency**: Free hosting tier may have 1-2 second delays for real-time sync

### Potential Improvements
- Add drawing persistence to MongoDB/PostgreSQL
- Implement operational transformation (OT) for conflict resolution
- Add line smoothing algorithms (Catmull-Rom splines)
- Persist undo history per user
- Add layer management
- Implement drawing redo from specific points
- Add touch gesture support for mobile
- Optimize network bandwidth with delta compression

## ⏱️ Development Time

**Total Time Spent**: ~4-5 hours
- Architecture & Setup: 1 hour
- Frontend Components: 1.5 hours
- WebSocket Integration: 1 hour
- Server Implementation: 1 hour
- Testing & Refinement: 0.5 hours

## 🔗 Important Files to Review

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Detailed system design
- [src/components/canvas/DrawingCanvas.tsx](src/components/canvas/DrawingCanvas.tsx) - Drawing logic
- [server/server.js](server/server.js) - Server implementation
- [src/hooks/useWebSocket.ts](src/hooks/useWebSocket.ts) - WebSocket client

## 📝 Notes

- The frontend gracefully falls back to demo mode if the server isn't running
- Color assignment is deterministic based on user ID for consistency
- Cursor positions are throttled to reduce network traffic
- All strokes are stored server-side per room for consistency
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
