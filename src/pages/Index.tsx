import React, { useState, useEffect } from 'react';
import { DrawingCanvas } from '@/components/canvas/DrawingCanvas';
import { RoomJoinDialog } from '@/components/canvas/RoomJoinDialog';
import { useWebSocket } from '@/hooks/useWebSocket';

// Support both development and production WebSocket URLs
const getWebSocketURL = (): string => {
  // In production, use environment variable
  if (import.meta.env.VITE_WS_SERVER_URL) {
    return import.meta.env.VITE_WS_SERVER_URL as string;
  }
  
  // In development, use localhost
  if (import.meta.env.DEV) {
    return 'ws://localhost:3001';
  }
  
  // Fallback: construct from current window location
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.host}`;
};

const WS_SERVER_URL = getWebSocketURL();

const Index: React.FC = () => {
  const [hasJoined, setHasJoined] = useState(false);
  const [roomId, setRoomId] = useState('lobby');
  const [userName, setUserName] = useState('');

  // Check URL for room parameter
  useEffect(() => {
    const pathParts = window.location.pathname.split('/');
    const roomIndex = pathParts.indexOf('room');
    if (roomIndex !== -1 && pathParts[roomIndex + 1]) {
      setRoomId(pathParts[roomIndex + 1]);
    }
  }, []);

  const handleJoin = (room: string, name: string) => {
    setRoomId(room);
    setUserName(name);
    setHasJoined(true);
    
    // Update URL without reload
    const newUrl = `/room/${room}`;
    window.history.pushState({}, '', newUrl);
  };

  if (!hasJoined) {
    return <RoomJoinDialog onJoin={handleJoin} defaultRoom={roomId} />;
  }

  return <CanvasRoom roomId={roomId} userName={userName} />;
};

// Separate component for the canvas room
const CanvasRoom: React.FC<{ roomId: string; userName: string }> = ({ roomId, userName }) => {
  const {
    connected,
    users,
    strokes,
    localUser,
    isDemo,
    canUndo,
    canRedo,
    startStroke,
    updateStroke,
    endStroke,
    moveCursor,
    undo,
    redo,
  } = useWebSocket({
    serverUrl: WS_SERVER_URL,
    roomId,
    userName,
  });

  if (!connected || !localUser) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Connecting to room...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-canvas">
      <DrawingCanvas
        strokes={strokes}
        users={users}
        localUserId={localUser.id}
        isDemo={isDemo}
        roomId={roomId}
        canUndo={canUndo}
        canRedo={canRedo}
        onStrokeStart={startStroke}
        onStrokeUpdate={updateStroke}
        onStrokeEnd={endStroke}
        onCursorMove={moveCursor}
        onUndo={undo}
        onRedo={redo}
      />
    </div>
  );
};

export default Index;
