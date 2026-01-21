/**
 * Drawing State Manager
 * Manages strokes, undo/redo stacks for each room
 */

class DrawingState {
  constructor() {
    this.strokes = new Map(); // Map<strokeId, Stroke>
    this.strokeOrder = []; // Array of stroke IDs in order
    this.redoStack = []; // Stack of removed strokes for redo
    this.activeStrokes = new Map(); // Map<strokeId, Stroke> for in-progress strokes
  }

  // Add a new stroke or update existing
  addOrUpdateStroke(stroke) {
    if (this.activeStrokes.has(stroke.id)) {
      this.activeStrokes.set(stroke.id, stroke);
    } else {
      this.activeStrokes.set(stroke.id, stroke);
    }
    return stroke;
  }

  // Finalize a stroke (move from active to completed)
  finalizeStroke(strokeId) {
    const stroke = this.activeStrokes.get(strokeId);
    if (stroke) {
      this.strokes.set(strokeId, stroke);
      this.strokeOrder.push(strokeId);
      this.activeStrokes.delete(strokeId);
      // Clear redo stack when new stroke is added
      this.redoStack = [];
      return stroke;
    }
    return null;
  }

  // Update an active stroke with a new point
  updateStroke(strokeId, point) {
    const stroke = this.activeStrokes.get(strokeId);
    if (stroke) {
      stroke.points.push(point);
      return stroke;
    }
    return null;
  }

  // Get all strokes (completed + active)
  getAllStrokes() {
    const completed = this.strokeOrder.map(id => this.strokes.get(id)).filter(Boolean);
    const active = Array.from(this.activeStrokes.values());
    return [...completed, ...active];
  }

  // Get only completed strokes
  getCompletedStrokes() {
    return this.strokeOrder.map(id => this.strokes.get(id)).filter(Boolean);
  }

  // Undo last stroke
  undo() {
    if (this.strokeOrder.length === 0) {
      return { strokes: this.getAllStrokes(), canUndo: false, canRedo: this.redoStack.length > 0 };
    }

    const lastStrokeId = this.strokeOrder.pop();
    const stroke = this.strokes.get(lastStrokeId);
    
    if (stroke) {
      this.redoStack.push(stroke);
      this.strokes.delete(lastStrokeId);
    }

    return {
      strokes: this.getAllStrokes(),
      canUndo: this.strokeOrder.length > 0,
      canRedo: true,
    };
  }

  // Redo last undone stroke
  redo() {
    if (this.redoStack.length === 0) {
      return { strokes: this.getAllStrokes(), canUndo: this.strokeOrder.length > 0, canRedo: false };
    }

    const stroke = this.redoStack.pop();
    if (stroke) {
      this.strokes.set(stroke.id, stroke);
      this.strokeOrder.push(stroke.id);
    }

    return {
      strokes: this.getAllStrokes(),
      canUndo: true,
      canRedo: this.redoStack.length > 0,
    };
  }

  // Get undo/redo availability
  getHistoryState() {
    return {
      canUndo: this.strokeOrder.length > 0,
      canRedo: this.redoStack.length > 0,
    };
  }

  // Clear all state
  clear() {
    this.strokes.clear();
    this.strokeOrder = [];
    this.redoStack = [];
    this.activeStrokes.clear();
  }
}

module.exports = { DrawingState };
