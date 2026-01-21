const { DrawingState } = require('./drawing-state');

/**
 * Room Manager
 * Manages rooms, users, and their drawing states
 */

class RoomManager {
  constructor() {
    this.rooms = new Map(); // Map<roomId, Room>
  }

  // Get or create a room
  getOrCreateRoom(roomId) {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, {
        id: roomId,
        users: new Map(), // Map<socketId, User>
        drawingState: new DrawingState(),
        createdAt: Date.now(),
      });
    }
    return this.rooms.get(roomId);
  }

  // Get a room
  getRoom(roomId) {
    return this.rooms.get(roomId);
  }

  // Add user to room
  addUser(roomId, socketId, user) {
    const room = this.getOrCreateRoom(roomId);
    room.users.set(socketId, {
      ...user,
      socketId,
      cursor: null,
      isDrawing: false,
    });
    return room;
  }

  // Remove user from room
  removeUser(roomId, socketId) {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    const user = room.users.get(socketId);
    room.users.delete(socketId);

    // Clean up empty rooms
    if (room.users.size === 0) {
      this.rooms.delete(roomId);
    }

    return user;
  }

  // Get user in room
  getUser(roomId, socketId) {
    const room = this.rooms.get(roomId);
    return room?.users.get(socketId);
  }

  // Get all users in room
  getUsersInRoom(roomId) {
    const room = this.rooms.get(roomId);
    if (!room) return [];
    return Array.from(room.users.values());
  }

  // Update user cursor
  updateUserCursor(roomId, socketId, cursor) {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    const user = room.users.get(socketId);
    if (user) {
      user.cursor = cursor;
      return user;
    }
    return null;
  }

  // Set user drawing state
  setUserDrawing(roomId, socketId, isDrawing) {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    const user = room.users.get(socketId);
    if (user) {
      user.isDrawing = isDrawing;
      return user;
    }
    return null;
  }

  // Get drawing state for room
  getDrawingState(roomId) {
    const room = this.rooms.get(roomId);
    return room?.drawingState;
  }

  // Get room stats
  getStats() {
    return {
      totalRooms: this.rooms.size,
      rooms: Array.from(this.rooms.entries()).map(([id, room]) => ({
        id,
        userCount: room.users.size,
        strokeCount: room.drawingState.strokeOrder.length,
      })),
    };
  }
}

module.exports = { RoomManager };
