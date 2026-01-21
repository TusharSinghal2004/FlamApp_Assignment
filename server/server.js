const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const url = require('url');
const { v4: uuidv4 } = require('uuid');
const { RoomManager } = require('./rooms');

const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const roomManager = new RoomManager();

// User colors
const USER_COLORS = [
  '#0EA5E9', '#8B5CF6', '#F97316', '#10B981',
  '#EC4899', '#EAB308', '#06B6D4', '#F43F5E',
];

const getRandomColor = () => USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)];

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', environment: NODE_ENV, ...roomManager.getStats() });
});

// CORS headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', CORS_ORIGIN);
  res.header('Access-Control-Allow-Methods', 'GET, POST');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Broadcast to all users in a room except sender
function broadcastToRoom(roomId, message, excludeSocketId = null) {
  const users = roomManager.getUsersInRoom(roomId);
  
  users.forEach(user => {
    if (user.socketId !== excludeSocketId && user.ws?.readyState === WebSocket.OPEN) {
      user.ws.send(JSON.stringify(message));
    }
  });
}

// Broadcast to all users in a room including sender
function broadcastToRoomAll(roomId, message) {
  const users = roomManager.getUsersInRoom(roomId);
  
  users.forEach(user => {
    if (user.ws?.readyState === WebSocket.OPEN) {
      user.ws.send(JSON.stringify(message));
    }
  });
}

// WebSocket connection handler
wss.on('connection', (ws, req) => {
  const parsedUrl = url.parse(req.url, true);
  const roomId = parsedUrl.query.room || 'lobby';
  const socketId = uuidv4();
  
  let currentUser = null;
  let currentRoomId = roomId;

  console.log(`New connection: ${socketId} joining room: ${roomId}`);

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      
      switch (message.type) {
        case 'join': {
          const { user } = message.payload;
          currentUser = {
            id: user.id || uuidv4(),
            name: user.name || `User-${socketId.substring(0, 4)}`,
            color: user.color || getRandomColor(),
            ws,
          };

          roomManager.addUser(currentRoomId, socketId, currentUser);
          
          // Get current state
          const drawingState = roomManager.getDrawingState(currentRoomId);
          const users = roomManager.getUsersInRoom(currentRoomId);

          // Send init to joining user
          ws.send(JSON.stringify({
            type: 'init',
            payload: {
              userId: currentUser.id,
              users: users.map(u => ({
                id: u.id,
                name: u.name,
                color: u.color,
                cursor: u.cursor,
                isDrawing: u.isDrawing,
              })),
              strokes: drawingState.getAllStrokes(),
              ...drawingState.getHistoryState(),
            },
          }));

          // Notify others
          broadcastToRoom(currentRoomId, {
            type: 'user-joined',
            payload: {
              user: {
                id: currentUser.id,
                name: currentUser.name,
                color: currentUser.color,
                cursor: null,
                isDrawing: false,
              },
            },
          }, socketId);

          console.log(`User ${currentUser.name} joined room ${currentRoomId}`);
          break;
        }

        case 'cursor-move': {
          const { position } = message.payload;
          if (!currentUser) return;

          roomManager.updateUserCursor(currentRoomId, socketId, position);

          broadcastToRoom(currentRoomId, {
            type: 'cursor-move',
            payload: {
              userId: currentUser.id,
              position,
            },
          }, socketId);
          break;
        }

        case 'stroke-start': {
          const { stroke } = message.payload;
          if (!currentUser) return;

          roomManager.setUserDrawing(currentRoomId, socketId, true);
          const drawingState = roomManager.getDrawingState(currentRoomId);
          
          const newStroke = {
            ...stroke,
            userId: currentUser.id,
          };
          
          drawingState.addOrUpdateStroke(newStroke);

          broadcastToAll(currentRoomId, {
            type: 'stroke-start',
            payload: { stroke: newStroke },
          });
          break;
        }

        case 'stroke-update': {
          const { strokeId, point } = message.payload;
          if (!currentUser) return;

          const drawingState = roomManager.getDrawingState(currentRoomId);
          const stroke = drawingState.updateStroke(strokeId, point);

          if (stroke) {
            broadcastToAll(currentRoomId, {
              type: 'stroke-update',
              payload: { stroke },
            });
          }
          break;
        }

        case 'stroke-end': {
          const { strokeId } = message.payload;
          if (!currentUser) return;

          roomManager.setUserDrawing(currentRoomId, socketId, false);
          const drawingState = roomManager.getDrawingState(currentRoomId);
          const stroke = drawingState.finalizeStroke(strokeId);

          if (stroke) {
            broadcastToAll(currentRoomId, {
              type: 'stroke-end',
              payload: {
                stroke,
                ...drawingState.getHistoryState(),
              },
            });
          }
          break;
        }

        case 'undo': {
          const drawingState = roomManager.getDrawingState(currentRoomId);
          const result = drawingState.undo();

          // Broadcast to ALL users including sender
          broadcastToRoomAll(currentRoomId, {
            type: 'undo',
            payload: result,
          });
          
          console.log(`Undo in room ${currentRoomId}`);
          break;
        }

        case 'redo': {
          const drawingState = roomManager.getDrawingState(currentRoomId);
          const result = drawingState.redo();

          // Broadcast to ALL users including sender
          broadcastToRoomAll(currentRoomId, {
            type: 'redo',
            payload: result,
          });
          
          console.log(`Redo in room ${currentRoomId}`);
          break;
        }

        default:
          console.warn(`Unknown message type: ${message.type}`);
      }
    } catch (err) {
      console.error('Error processing message:', err);
    }
  });

  ws.on('close', () => {
    if (currentUser) {
      const user = roomManager.removeUser(currentRoomId, socketId);
      
      if (user) {
        broadcastToRoom(currentRoomId, {
          type: 'user-left',
          payload: { userId: currentUser.id },
        });
        
        console.log(`User ${currentUser.name} left room ${currentRoomId}`);
      }
    }
  });

  ws.on('error', (err) => {
    console.error('WebSocket error:', err);
  });
});

server.listen(PORT, () => {
  console.log(`🎨 Collaborative Canvas Server running on port ${PORT}`);
  console.log(`   Environment: ${NODE_ENV}`);
  console.log(`   CORS Origin: ${CORS_ORIGIN}`);
  console.log(`   WebSocket: ws://localhost:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/health`);
});
