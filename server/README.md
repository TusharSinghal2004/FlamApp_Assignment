# Collaborative Canvas Server

WebSocket server for real-time collaborative drawing.

## Quick Start

```bash
# Install dependencies
npm install

# Start server
npm start

# Or with auto-reload during development
npm run dev
```

Server runs on `ws://localhost:3001` by default.

## API

### WebSocket Connection

Connect with room parameter:
```
ws://localhost:3001?room=<roomId>
```

### Message Types

#### Client → Server

**join**
```json
{
  "type": "join",
  "payload": {
    "user": {
      "id": "optional-user-id",
      "name": "User Name",
      "color": "#0EA5E9"
    }
  }
}
```

**cursor-move**
```json
{
  "type": "cursor-move",
  "payload": {
    "position": { "x": 100, "y": 200 }
  }
}
```

**stroke-start**
```json
{
  "type": "stroke-start",
  "payload": {
    "stroke": {
      "id": "stroke-123",
      "points": [{ "x": 100, "y": 200 }],
      "color": "#FFFFFF",
      "width": 4,
      "tool": "brush"
    }
  }
}
```

**stroke-update**
```json
{
  "type": "stroke-update",
  "payload": {
    "strokeId": "stroke-123",
    "point": { "x": 110, "y": 210 }
  }
}
```

**stroke-end**
```json
{
  "type": "stroke-end",
  "payload": {
    "strokeId": "stroke-123"
  }
}
```

**undo / redo**
```json
{
  "type": "undo",
  "payload": {}
}
```

#### Server → Client

**init** - Sent after join with current room state
**user-joined** - New user joined room
**user-left** - User left room
**cursor-move** - User moved cursor
**stroke-start/update/end** - Stroke updates
**undo/redo** - History updated with full stroke list

## Health Check

```bash
curl http://localhost:3001/health
```

Returns room stats:
```json
{
  "status": "ok",
  "totalRooms": 2,
  "rooms": [
    { "id": "lobby", "userCount": 3, "strokeCount": 15 }
  ]
}
```
