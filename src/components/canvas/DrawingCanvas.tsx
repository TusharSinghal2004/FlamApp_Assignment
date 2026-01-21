import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useCanvas } from '@/hooks/useCanvas';
import { Toolbar } from './Toolbar';
import { UsersSidebar } from './UsersSidebar';
import { RemoteCursors } from './RemoteCursors';
import type { Point, Stroke, ToolSettings, Tool } from '@/types/canvas';
import { cn } from '@/lib/utils';

interface DrawingCanvasProps {
  strokes: Stroke[];
  users: { id: string; name: string; color: string; cursor?: Point; isDrawing: boolean }[];
  localUserId: string;
  isDemo: boolean;
  roomId: string;
  canUndo: boolean;
  canRedo: boolean;
  onStrokeStart: (strokeId: string, point: Point, color: string, width: number, tool: Tool) => Stroke;
  onStrokeUpdate: (strokeId: string, point: Point) => void;
  onStrokeEnd: (strokeId: string) => void;
  onCursorMove: (position: Point) => void;
  onUndo: () => void;
  onRedo: () => void;
}

// Generate unique stroke ID
const generateStrokeId = () => `stroke-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

// Throttle function for cursor updates
const throttle = <T extends (...args: unknown[]) => void>(fn: T, ms: number): T => {
  let lastCall = 0;
  return ((...args: unknown[]) => {
    const now = Date.now();
    if (now - lastCall >= ms) {
      lastCall = now;
      fn(...args);
    }
  }) as T;
};

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({
  strokes,
  users,
  localUserId,
  isDemo,
  roomId,
  canUndo,
  canRedo,
  onStrokeStart,
  onStrokeUpdate,
  onStrokeEnd,
  onCursorMove,
  onUndo,
  onRedo,
}) => {
  const [settings, setSettings] = useState<ToolSettings>({
    tool: 'brush',
    color: '#FFFFFF',
    width: 4,
  });

  const [cursorPosition, setCursorPosition] = useState<Point | null>(null);

  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);
  const isDrawingRef = useRef(false);
  const currentStrokeIdRef = useRef<string | null>(null);

  const { canvasRef, dimensions, getCanvasPoint } = useCanvas({
    strokes,
    currentStroke,
    remoteUsers: users,
    localUserId,
  });

  // Throttled cursor move
  const throttledCursorMove = useCallback(
    throttle((point: Point) => {
      onCursorMove(point);
    }, 50),
    [onCursorMove]
  );

  // Handle mouse/touch down
  const handlePointerDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const point = getCanvasPoint(e.nativeEvent as MouseEvent | TouchEvent);
    if (!point) return;

    isDrawingRef.current = true;
    const strokeId = generateStrokeId();
    currentStrokeIdRef.current = strokeId;

    const stroke = onStrokeStart(strokeId, point, settings.color, settings.width, settings.tool);
    setCurrentStroke(stroke);
  }, [getCanvasPoint, settings, onStrokeStart]);

  // Handle mouse/touch move
  const handlePointerMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const point = getCanvasPoint(e.nativeEvent as MouseEvent | TouchEvent);
    if (!point) return;

    // Update cursor position for eraser preview
    setCursorPosition(point);

    // Always update cursor position
    throttledCursorMove(point);

    // Update stroke if drawing
    if (isDrawingRef.current && currentStrokeIdRef.current) {
      onStrokeUpdate(currentStrokeIdRef.current, point);
      setCurrentStroke(prev => {
        if (!prev) return prev;
        return { ...prev, points: [...prev.points, point] };
      });
    }
  }, [getCanvasPoint, throttledCursorMove, onStrokeUpdate]);

  // Handle mouse/touch up
  const handlePointerUp = useCallback(() => {
    if (isDrawingRef.current && currentStrokeIdRef.current) {
      onStrokeEnd(currentStrokeIdRef.current);
    }
    isDrawingRef.current = false;
    currentStrokeIdRef.current = null;
    setCurrentStroke(null);
  }, [onStrokeEnd]);

  // Handle pointer leave
  const handlePointerLeave = useCallback(() => {
    handlePointerUp();
    setCursorPosition(null); // Hide eraser cursor when leaving canvas
  }, [handlePointerUp]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Tool shortcuts
      if (e.key === 'b' || e.key === 'B') {
        setSettings(prev => ({ ...prev, tool: 'brush' }));
      } else if (e.key === 'e' || e.key === 'E') {
        setSettings(prev => ({ ...prev, tool: 'eraser' }));
      }

      // Undo/Redo
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' && !e.shiftKey) {
          e.preventDefault();
          onUndo();
        } else if ((e.key === 'y') || (e.key === 'z' && e.shiftKey)) {
          e.preventDefault();
          onRedo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onUndo, onRedo]);

  const handleSettingsChange = useCallback((newSettings: Partial<ToolSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  return (
    <div className="relative w-full h-full bg-canvas overflow-hidden canvas-container">
      {/* Toolbar */}
      <Toolbar
        settings={settings}
        onSettingsChange={handleSettingsChange}
        onUndo={onUndo}
        onRedo={onRedo}
        canUndo={canUndo}
        canRedo={canRedo}
      />

      {/* Users Sidebar */}
      <UsersSidebar
        users={users}
        localUserId={localUserId}
        isDemo={isDemo}
        roomId={roomId}
      />

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={dimensions.width || 1920}
        height={dimensions.height || 1080}
        className={cn(
          'w-full h-full touch-none',
          settings.tool === 'eraser' ? 'cursor-none' : 'cursor-crosshair'
        )}
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerLeave}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
      />

      {/* Eraser Cursor Preview */}
      {settings.tool === 'eraser' && cursorPosition && (
        <div
          className="absolute pointer-events-none z-30 bg-white/90 border-2 border-white shadow-lg"
          style={{
            left: `${cursorPosition.x}px`,
            top: `${cursorPosition.y}px`,
            width: `${settings.width}px`,
            height: `${settings.width}px`,
            transform: 'translate(-50%, -50%)',
            boxShadow: '0 0 0 1px rgba(0,0,0,0.5), 0 2px 4px rgba(0,0,0,0.3)',
          }}
        />
      )}

      {/* Remote Cursors */}
      <RemoteCursors users={users} localUserId={localUserId} />

      {/* Room Info */}
      <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 px-3 py-2 bg-card/80 backdrop-blur-sm rounded-lg border border-border text-xs text-muted-foreground">
        <span>Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-foreground font-mono">B</kbd> for brush</span>
        <span className="text-border">|</span>
        <span><kbd className="px-1.5 py-0.5 bg-muted rounded text-foreground font-mono">E</kbd> for eraser</span>
      </div>
    </div>
  );
};
