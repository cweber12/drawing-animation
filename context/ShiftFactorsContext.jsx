// context/ShiftFactorsContext.jsx
import { topLeft } from '@shopify/react-native-skia';
import React, { createContext, useContext, useMemo, useRef, useState, useEffect } from 'react';

/* Context to manage shift factors for body part adjustments.
--------------------------------------------------------------------------------
- Each factor is an object with x and y properties representing pixel shifts.
- Provides a generic update function to modify any factor.
- Ensures uniform shifts to keep joints from separating. 
--------------------------------------------------------------------------------
Example usage:
const { factors, updateFactor } = useShiftFactors();
updateFactor('shoulderShift', { x: 10, y: -5 }); // Update shift values
shoulderShiftX = factors.shoulderShift.x; // Access current shift values
shoulderShiftY = factors.shoulderShift.y;
------------------------------------------------------------------------------*/

/* Default shift factors for each body part
------------------------------------------------------------------------------*/
const defaultFactors = {
    torsoShift:     { x: 0, y: 0 },
    headShift:      { x: 0, y: 0},
    shoulderShift:  { x: 0, y: 0 },
    elbowShift:     { x: 0, y: 0 },
    wristShift:     { x: 0, y: 0 },
    hipShift:       { x: 0, y: 0 },
    kneeShift:      { x: 0, y: 0 },
    ankleShift:     { x: 0, y: 0 },
    footShift:      { x: 0, y: 0 },    
};

const ShiftFactorsContext = createContext(null);

/* Provider component to wrap the app and provide shift factors context
------------------------------------------------------------------------------*/
export function ShiftFactorsProvider({ children }) {
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
    <ShiftFactorsContext.Provider value={value}>
      {children}
    </ShiftFactorsContext.Provider>
  );
}

/* Custom hook to access shift factors context
- Ensures the hook is used within the provider
------------------------------------------------------------------------------*/
export function useShiftFactors() {
  const ctx = useContext(ShiftFactorsContext);
  if (!ctx) throw new Error('useShiftFactors must be used inside ShiftFactorsProvider');
  return ctx;
}