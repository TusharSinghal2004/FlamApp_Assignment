import { useEffect, useRef, useState, useCallback } from 'react';
import type { Stroke, User, Point, Tool } from '@/types/canvas';

interface UseWebSocketProps {
  serverUrl: string;
  roomId: string;
  userName: string;
}

interface WebSocketState {
  connected: boolean;
  users: User[];
  strokes: Stroke[];
  localUser: User | null;
  canUndo: boolean;
  canRedo: boolean;
}

// Generate unique ID
const generateId = () => Math.random().toString(36).substring(2, 15);

// LocalStorage helpers for user progress
const STORAGE_KEY_PREFIX = 'canvas-user-';

const saveUserProgress = (userName: string, strokes: Stroke[]) => {
  try {
    const key = `${STORAGE_KEY_PREFIX}${userName.toLowerCase()}`;
    localStorage.setItem(key, JSON.stringify(strokes));
    console.log(`💾 Saved ${strokes.length} strokes for ${userName}`);
  } catch (err) {
    console.error('Failed to save progress:', err);
  }
};

const loadUserProgress = (userName: string): Stroke[] => {
  try {
    const key = `${STORAGE_KEY_PREFIX}${userName.toLowerCase()}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      const strokes = JSON.parse(saved);
      console.log(`📂 Loaded ${strokes.length} strokes for ${userName}`);
      return strokes;
    }
  } catch (err) {
    console.error('Failed to load progress:', err);
  }
  return [];
};

// Assign a color based on user ID
const getUserColor = (id: string): string => {
  const colors = [
    '#0EA5E9', // Sky blue
    '#8B5CF6', // Purple
    '#F97316', // Orange
    '#10B981', // Emerald
    '#EC4899', // Pink
    '#EAB308', // Yellow
    '#06B6D4', // Cyan
    '#F43F5E', // Rose
  ];
  const index = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  return colors[index];
};

export const useWebSocket = ({ serverUrl, roomId, userName }: UseWebSocketProps) => {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [state, setState] = useState<WebSocketState>({
    connected: false,
    users: [],
    strokes: [],
    localUser: null,
    canUndo: false,
    canRedo: false,
  });

  // For demo mode without server
  const [isDemo, setIsDemo] = useState(false);
  const localUserRef = useRef<User | null>(null);

  // Initialize demo mode
  useEffect(() => {
    const userId = generateId();
    const user: User = {
      id: userId,
      name: userName || `User-${userId.substring(0, 4)}`,
      color: getUserColor(userId),
      isDrawing: false,
    };
    localUserRef.current = user;

    // Load user's previous progress from localStorage
    const savedStrokes = loadUserProgress(userName);
    
    // Try to connect to WebSocket, fall back to demo mode
    const connectWebSocket = () => {
      try {
        const ws = new WebSocket(`${serverUrl}?room=${roomId}`);
        
        ws.onopen = () => {
          console.log('Connected to WebSocket server');
          setIsDemo(false);
          wsRef.current = ws;
          
          // Send join message
          ws.send(JSON.stringify({
            type: 'join',
            payload: { user },
          }));
        };

        ws.onmessage = (event) => {
          const message = JSON.parse(event.data);
          handleServerMessage(message);
        };

        ws.onclose = () => {
          console.log('WebSocket closed, switching to demo mode');
          setIsDemo(true);
          setState(prev => ({
            ...prev,
            connected: true,
            localUser: user,
            users: [user],
            strokes: prev.strokes.length > 0 ? prev.strokes : savedStrokes,
          }));
        };

        ws.onerror = () => {
          console.log('WebSocket error, using demo mode');
          setIsDemo(true);
          setState(prev => ({
            ...prev,
            connected: true,
            localUser: user,
            users: [user],
            strokes: prev.strokes.length > 0 ? prev.strokes : savedStrokes,
          }));
        };
      } catch (err) {
        console.log('WebSocket not available, using demo mode');
        setIsDemo(true);
        setState(prev => ({
          ...prev,
          connected: true,
          localUser: user,
          users: [user],
        }));
      }
    };

    // Start in demo mode immediately, try to connect
    setIsDemo(true);
    setState(prev => ({
      ...prev,
      connected: true,
      localUser: user,
      users: [user],
      strokes: savedStrokes, // Restore user's previous drawings
    }));

    // Try connecting after a short delay
    setTimeout(connectWebSocket, 100);

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [serverUrl, roomId, userName]);

  // Auto-save user progress to localStorage whenever strokes change
  useEffect(() => {
    if (userName && state.strokes.length > 0) {
      saveUserProgress(userName, state.strokes);
    }
  }, [userName, state.strokes]);

  const handleServerMessage = useCallback((message: { type: string; payload: unknown }) => {
    switch (message.type) {
      case 'init':
        const initPayload = message.payload as { users: User[]; strokes: Stroke[]; userId: string };
        setState(prev => ({
          ...prev,
          connected: true,
          users: initPayload.users,
          strokes: initPayload.strokes,
          localUser: initPayload.users.find(u => u.id === initPayload.userId) || prev.localUser,
        }));
        break;

      case 'user-joined':
        const joinPayload = message.payload as { user: User };
        setState(prev => ({
          ...prev,
          users: [...prev.users.filter(u => u.id !== joinPayload.user.id), joinPayload.user],
        }));
        break;

      case 'user-left':
        const leftPayload = message.payload as { userId: string };
        setState(prev => ({
          ...prev,
          users: prev.users.filter(u => u.id !== leftPayload.userId),
        }));
        break;

      case 'cursor-move':
        const cursorPayload = message.payload as { userId: string; position: Point };
        setState(prev => ({
          ...prev,
          users: prev.users.map(u =>
            u.id === cursorPayload.userId ? { ...u, cursor: cursorPayload.position } : u
          ),
        }));
        break;

      case 'stroke-start':
      case 'stroke-update':
        const strokePayload = message.payload as { stroke: Stroke };
        setState(prev => ({
          ...prev,
          strokes: [...prev.strokes.filter(s => s.id !== strokePayload.stroke.id), strokePayload.stroke],
        }));
        break;

      case 'stroke-end':
        const endPayload = message.payload as { stroke: Stroke };
        setState(prev => ({
          ...prev,
          strokes: [...prev.strokes.filter(s => s.id !== endPayload.stroke.id), endPayload.stroke],
        }));
        break;

      case 'undo':
      case 'redo':
        const historyPayload = message.payload as { strokes: Stroke[]; canUndo: boolean; canRedo: boolean };
        setState(prev => ({
          ...prev,
          strokes: historyPayload.strokes,
          canUndo: historyPayload.canUndo,
          canRedo: historyPayload.canRedo,
        }));
        break;
    }
  }, []);

  // Send message helper
  const sendMessage = useCallback((type: string, payload: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type, payload }));
    }
  }, []);

  // Drawing actions
  const startStroke = useCallback((strokeId: string, point: Point, color: string, width: number, tool: Tool) => {
    const stroke: Stroke = {
      id: strokeId,
      points: [point],
      color,
      width,
      tool,
      userId: localUserRef.current?.id || '',
      timestamp: Date.now(),
    };

    console.log('🎨 START STROKE:', strokeId, 'Demo mode:', isDemo);

    if (isDemo) {
      setState(prev => {
        const newStrokes = [...prev.strokes, stroke];
        console.log('📊 Strokes after start:', newStrokes.length);
        return {
          ...prev,
          strokes: newStrokes,
        };
      });
    } else {
      sendMessage('stroke-start', { stroke });
    }

    return stroke;
  }, [isDemo, sendMessage]);

  const updateStroke = useCallback((strokeId: string, point: Point) => {
    if (isDemo) {
      setState(prev => {
        const newStrokes = prev.strokes.map(s =>
          s.id === strokeId ? { ...s, points: [...s.points, point] } : s
        );
        console.log('✏️ UPDATE STROKE:', strokeId, 'Total strokes:', newStrokes.length);
        return {
          ...prev,
          strokes: newStrokes,
        };
      });
    } else {
      sendMessage('stroke-update', { strokeId, point });
    }
  }, [isDemo, sendMessage]);

  const endStroke = useCallback((strokeId: string) => {
    console.log('🏁 END STROKE:', strokeId, 'Demo mode:', isDemo);
    
    if (!isDemo) {
      sendMessage('stroke-end', { strokeId });
    }
    // Update undo availability
    setState(prev => {
      console.log('📊 Strokes on end:', prev.strokes.length);
      return {
        ...prev,
        canUndo: prev.strokes.length > 0,
      };
    });
  }, [isDemo, sendMessage]);

  const moveCursor = useCallback((position: Point) => {
    if (isDemo) {
      setState(prev => ({
        ...prev,
        users: prev.users.map(u =>
          u.id === localUserRef.current?.id ? { ...u, cursor: position } : u
        ),
      }));
    } else {
      sendMessage('cursor-move', { position });
    }
  }, [isDemo, sendMessage]);

  const undo = useCallback(() => {
    if (isDemo) {
      setState(prev => {
        if (prev.strokes.length === 0) return prev;
        const newStrokes = prev.strokes.slice(0, -1);
        return {
          ...prev,
          strokes: newStrokes,
          canUndo: newStrokes.length > 0,
          canRedo: true,
        };
      });
    } else {
      sendMessage('undo', {});
    }
  }, [isDemo, sendMessage]);

  const redo = useCallback(() => {
    if (!isDemo) {
      sendMessage('redo', {});
    }
  }, [isDemo, sendMessage]);

  return {
    ...state,
    isDemo,
    startStroke,
    updateStroke,
    endStroke,
    moveCursor,
    undo,
    redo,
  };
};
