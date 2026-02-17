import React, { createContext, useRef, useState, useCallback, useContext } from 'react';

const LandmarksContext = createContext(null);


export function LandmarksProvider({ children }) {
  const originalRef = useRef([]); // frames: [ [kp,...], [kp,...], ... ]
  const processedRef = useRef([]);   // frames Processed to canvas coords
  const dimensionsRef = useRef({ width: 0, height: 0 }); // dimensions of the video/canvas for scaling

  const [originalVersion, setOriginalVersion] = useState(0);
  const [processedVersion, setProcessedVersion] = useState(0);

  // Accept either (width, height) or a single object { width, height }
  const setDimensions = useCallback((a, b) => {
    if (a && typeof a === 'object') {
      const { width, height } = a;
      dimensionsRef.current = { width, height };
    } else {
      dimensionsRef.current = { width: a ?? 0, height: b ?? 0 };
    }
  }, []);
  
  // Originals API
  const setOriginals = useCallback((frames) => {
    originalRef.current = frames ?? [];
    setOriginalVersion(v => v + 1);
  }, []);
  const addOriginal = useCallback((frame) => {
    originalRef.current.push(frame);
  }, []);
  const clearOriginals = useCallback(() => {
    originalRef.current = [];
    setOriginalVersion(v => v + 1);
  }, []);
  const notifyOriginals = useCallback(() => setOriginalVersion(v => v + 1), []);

  // Processed API
  const setProcessed = useCallback((frames) => {
    processedRef.current = frames ?? [];
    setProcessedVersion(v => v + 1);
  }, []);
  const addProcessed = useCallback((frame) => {
    processedRef.current.push(frame);
  }, []);
  const clearProcessed = useCallback(() => {
    processedRef.current = [];
    setProcessedVersion(v => v + 1);
  }, []);
  const notifyProcessed = useCallback(() => setProcessedVersion(v => v + 1), []);

  // Snapshot helpers (safe shallow copy)
  const snapshotOriginals = useCallback(() => originalRef.current.slice(), []);
  const snapshotProcessed = useCallback(() => processedRef.current.slice(), []);

  const value = {
    // refs (imperative, cheap reads)
    originalRef,
    processedRef,
    dimensionsRef,

    // versions (for consumers to re-read when bumped)
    originalVersion,
    processedVersion,

    setDimensions,

    setOriginals,
    addOriginal,
    clearOriginals,
    notifyOriginals,
    snapshotOriginals,

    setProcessed,
    addProcessed,
    clearProcessed,
    notifyProcessed,
    snapshotProcessed,
  };

  return (
    <LandmarksContext.Provider value={value}>
      {children}
    </LandmarksContext.Provider>
  );
}

export function useLandmarks() {
  const ctx = useContext(LandmarksContext);
  if (!ctx) throw new Error('useLandmarks must be used within a LandmarksProvider');
  return ctx;
}