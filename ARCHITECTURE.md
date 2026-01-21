# Collaborative Canvas - Architecture

## Overview

A real-time collaborative drawing application where multiple users can draw together on a shared canvas. The architecture consists of:

1. **React Frontend** (runs in browser)
2. **Node.js WebSocket Server** (runs locally or on a server)

```text
┌──────────────────────────────────────────────────────────────────┐
│                        React Frontend                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐               │
│  │   Canvas    │  │   Toolbar   │  │   Users     │               │
│  │  Drawing    │  │   (Tools)   │  │  Sidebar    │               │
│  └─────────────┘  └─────────────┘  └─────────────┘               │
│          │                │                │                      │
│          └────────────────┴────────────────┘                      │
│                          │                                        │
│               ┌──────────▼──────────┐                             │
│               │   useWebSocket()    │                             │
│               │   (Hook + State)    │                             │
│               └──────────┬──────────┘                             │
└──────────────────────────┼────────────────────────────────────────┘
                           │ WebSocket
                           ▼
┌──────────────────────────────────────────────────────────────────┐
│                    Node.js Server                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐               │
│  │   server.js │◄─│  rooms.js   │◄─│ drawing-    │               │
│  │  (WS/HTTP)  │  │  (Manager)  │  │ state.js    │               │
│  └─────────────┘  └─────────────┘  └─────────────┘               │
└──────────────────────────────────────────────────────────────────┘
```

## Frontend Components

### `/src/pages/Index.tsx`

Main entry point. Handles room joining and renders the canvas.

### `/src/components/canvas/DrawingCanvas.tsx`

Core canvas component managing:

- Drawing interactions (mouse/touch)
- Keyboard shortcuts
- Cursor tracking
- Stroke rendering

### `/src/components/canvas/Toolbar.tsx`

Tool selection (brush/eraser), color picker, stroke width, undo/redo.

### `/src/components/canvas/UsersSidebar.tsx`

Shows online users with their assigned colors and connection status.

### `/src/components/canvas/RemoteCursors.tsx`

Renders cursor indicators for remote users.

### `/src/hooks/useCanvas.ts`

Canvas rendering logic - draws strokes with smooth curves.

### `/src/hooks/useWebSocket.ts`

WebSocket connection management. Falls back to "demo mode" if server unavailable.

## Server Components

### `/server/server.js`

Express + WebSocket server handling:

- Connection management
- Message routing
- Broadcasting to rooms

### `/server/rooms.js`

Room management:

- User tracking per room
- Cursor position updates
- Room lifecycle

### `/server/drawing-state.js`

Drawing state management:

- Stroke storage (active + completed)
- Undo/redo stacks
- History operations

## Data Flow

### Drawing a Stroke

```
1. User mousedown
   └─▶ startStroke() ─▶ WS "stroke-start" ─▶ Server
                                              │
2. User mousemove (throttled)                 ▼
   └─▶ updateStroke() ─▶ WS "stroke-update" ─▶ Broadcast to room
                                              │
3. User mouseup                               ▼
   └─▶ endStroke() ─▶ WS "stroke-end" ─▶ Finalize & broadcast
```

### Undo/Redo (Global)

```
User clicks Undo
   └─▶ WS "undo" ─▶ Server removes last stroke from stack
                    │
                    └─▶ Broadcasts updated strokes to ALL users
                         │
                         └─▶ All clients redraw canvas
```

## Message Protocol

| Type           | Direction | Description                  |
| -------------- | --------- | ---------------------------- |
| `join`         | C→S       | User joins room              |
| `init`         | S→C       | Initial state (users, strokes) |
| `user-joined`  | S→C       | New user notification        |
| `user-left`    | S→C       | User disconnect notification |
| `cursor-move`  | C→S→C     | Cursor position update       |
| `stroke-start` | C→S→C     | Begin new stroke             |
| `stroke-update` | C→S→C    | Add point to stroke          |
| `stroke-end`   | C→S→C     | Finalize stroke              |
| `undo`         | C→S→C     | Undo last stroke             |
| `redo`         | C→S→C     | Redo last undo               |

## Performance Optimizations

1. **Cursor throttling**: Mouse move events throttled to 50ms
2. **Smooth curves**: Quadratic bezier curves for stroke rendering
3. **Efficient updates**: Only transmit point deltas, not full strokes
4. **Canvas redraw**: Only redraw when strokes change

## Room System

- Default room: `lobby`
- Custom rooms via URL: `/room/<roomId>`
- Rooms auto-cleanup when empty
- Each room has independent drawing state

## Demo Mode

When WebSocket server is unavailable:

- App works in single-user mode
- All features functional except multi-user sync
- Great for testing UI/UX locally
