import React, { createContext, useContext, useRef } from 'react';

const StrokeHistoryContext = createContext();

export function StrokeHistoryProvider({ children }) {
  // Array of { canvasId, strokeData }
  const strokeHistory = useRef([]);
  const redoStack = useRef([]);

  // Register a new stroke
  const registerStroke = (canvasId, strokeData) => {
    strokeHistory.current.push({ canvasId, strokeData });
    redoStack.current = []; // Clear redo stack on new stroke
  };

  // Undo last stroke
  const undoStroke = (removeStrokeFromCanvas) => {
    if (strokeHistory.current.length === 0) return;
    const last = strokeHistory.current.pop();
    redoStack.current.push(last);
    // Remove stroke from canvas
    if (removeStrokeFromCanvas) {
      removeStrokeFromCanvas(last.canvasId, last.strokeData);
    }
  };

  // Redo last undone stroke
  const redoStroke = (addStrokeToCanvas) => {
    if (redoStack.current.length === 0) return;
    const last = redoStack.current.pop();
    strokeHistory.current.push(last);
    // Add stroke back to canvas
    if (addStrokeToCanvas) {
      addStrokeToCanvas(last.canvasId, last.strokeData);
    }
  };

  return (
    <StrokeHistoryContext.Provider value={{
      strokeHistory,
      redoStack,
      registerStroke,
      undoStroke,
      redoStroke,
    }}>
      {children}
    </StrokeHistoryContext.Provider>
  );
}

export function useStrokeHistory() {
  return useContext(StrokeHistoryContext);
}
