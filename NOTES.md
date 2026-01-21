# ⚠️ Important Notes

## Storage & Data Persistence

### Why Drawings Are Not Saved

**Current Implementation**: The application uses **in-memory storage only**. This means:

- ✅ Drawings work in real-time across all connected users
- ✅ All features functional (draw, undo, redo, etc.)
- ❌ Drawings are **lost when server restarts**
- ❌ No database backend currently implemented

### This is By Design (for the assignment)

The assignment requires:
- ✅ Real-time collaboration ✓
- ✅ Canvas operations ✓
- ✅ WebSocket communication ✓
- ✅ State synchronization ✓

**Persistence was not a requirement**, so in-memory storage keeps it simple.

### How to Add Persistence (Optional Enhancement)

If you want drawings to persist:

#### Option 1: Local Storage (Client-side, single-user persistence)
```typescript
// In useWebSocket.ts, save to localStorage
useEffect(() => {
  localStorage.setItem('canvas-state', JSON.stringify(strokes));
}, [strokes]);
```

#### Option 2: MongoDB (Server-side, multi-user persistence)

1. **Install MongoDB**:
```bash
cd server
npm install mongodb
```

2. **Update `drawing-state.js`**:
```javascript
// Save to MongoDB after each stroke
async finalizeStroke(strokeId) {
  const stroke = this.activeStrokes.get(strokeId);
  if (stroke) {
    await db.collection('strokes').insertOne(stroke);
    // ... rest of code
  }
}

// Load on server start
async loadFromDatabase(roomId) {
  const strokes = await db.collection('strokes')
    .find({ roomId })
    .toArray();
  // ... populate state
}
```

3. **Add to `render.yaml`** (if deploying):
```yaml
databases:
  - name: canvas-db
    databaseName: collaborative_canvas
    plan: free
```

#### Option 3: JSON File (Simple file-based persistence)
```javascript
// In drawing-state.js
const fs = require('fs');

finalizeStroke(strokeId) {
  // ... existing code
  fs.writeFileSync(`./data/room-${roomId}.json`, JSON.stringify(this.getAllStrokes()));
}
```

### Current Behavior

- **Server Running**: All users in same room see same canvas
- **Server Restart**: All drawings cleared, fresh canvas
- **User Refresh**: Reconnects to current room state
- **New Users Join**: See all existing strokes from current session

This is expected and normal for the assignment requirements.

---

## About This Project

This is a **custom-built collaborative canvas application** developed from scratch for an assignment. It demonstrates:

- WebSocket real-time communication
- Canvas manipulation without libraries
- State synchronization across clients
- Efficient event handling and optimization

All code written specifically for this project to meet the assignment requirements.
