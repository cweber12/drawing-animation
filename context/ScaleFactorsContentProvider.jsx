// context/ScaleFactorsContext.jsx
import React, { createContext, useContext, useMemo, useRef, useState, useEffect } from 'react';

/* Context to manage Scale factors for body part adjustments.
--------------------------------------------------------------------------------
- Each factor is an object with x and y properties representing pixel Scales.
- Provides a generic update function to modify any factor.
- Ensures uniform Scales to keep joints from separating. 
--------------------------------------------------------------------------------
Example usage:
const { factors, updateFactor } = useScaleFactors();
updateFactor('shoulderScale', { x: 10, y: -5 }); // Update Scale values
shoulderScaleX = factors.shoulderScale.x; // Access current Scale values
shoulderScaleY = factors.shoulderScale.y;
------------------------------------------------------------------------------*/

/* Default scale factors for each body part
------------------------------------------------------------------------------*/
const defaultFactors = {
    headScale:      { x: 1, y: 1},
    torsoScale:     { x: 1, y: 1 },
    armScale:       { x: 1, y: 1 },
    handScale:      { x: 1, y: 1 },
    legScale:       { x: 1, y: 1 },
    footScale:      { x: 1, y: 1 },
    
};

const ScaleFactorsContext = createContext(null);

/* Provider component to wrap the app and provide Scale factors context
------------------------------------------------------------------------------*/
export function ScaleFactorsProvider({ children }) {
  const [factors, setFactors] = useState(defaultFactors);

  // Ref to hold the latest factors for use in callbacks
  const factorsRef = useRef(factors);
  useEffect(() => {
    factorsRef.current = factors;
  }, [factors]);

  // Generic function to update any factor by key
  const updateFactor = (key, value) => {
    setFactors(prev => ({ ...prev, [key]: value }));
  };

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    factors,       
    factorsRef,    
    updateFactor,
    setFactors,
  }), [factors]);

  // Provide the context value to children components
  return (
    <ScaleFactorsContext.Provider value={value}>
      {children}
    </ScaleFactorsContext.Provider>
  );
}

/* Custom hook to access Scale factors context
- Ensures the hook is used within the provider
------------------------------------------------------------------------------*/
export function useScaleFactors() {
  const ctx = useContext(ScaleFactorsContext);
  if (!ctx) throw new Error('useScaleFactors must be used inside ScaleFactorsProvider');
  return ctx;
}