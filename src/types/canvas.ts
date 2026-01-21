export interface Point {
  x: number;
  y: number;
}

export interface Stroke {
  id: string;
  points: Point[];
  color: string;
  width: number;
  tool: 'brush' | 'eraser';
  userId: string;
  timestamp: number;
}

export interface User {
  id: string;
  name: string;
  color: string;
  cursor?: Point;
  isDrawing: boolean;
}

export interface Room {
  id: string;
  users: User[];
  strokes: Stroke[];
  undoStack: Stroke[];
}

export interface DrawingState {
  strokes: Stroke[];
  redoStack: Stroke[];
}

export type Tool = 'brush' | 'eraser';

export interface ToolSettings {
  tool: Tool;
  color: string;
  width: number;
}

// WebSocket message types
export interface WSMessage {
  type: string;
  payload: unknown;
}

export interface StrokeStartPayload {
  strokeId: string;
  point: Point;
  color: string;
  width: number;
  tool: Tool;
}

export interface StrokeUpdatePayload {
  strokeId: string;
  point: Point;
}

export interface StrokeEndPayload {
  strokeId: string;
}

export interface CursorMovePayload {
  position: Point;
}

export interface UndoPayload {
  strokes: Stroke[];
}

export interface RedoPayload {
  strokes: Stroke[];
}
