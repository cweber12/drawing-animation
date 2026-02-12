// components/ShiftControls.jsx
import React from 'react';
import { useShiftFactors } from '../context/ShiftFactorsContext';

export default function ShiftControls() {
  const { factors, updateFactor } = useShiftFactors();

  return (
    <div style={{ display: 'grid', gap: 8, width: 320 }}>
      <label>
        Left Upper Arm Shift X: {factors.leftUpperArmShiftX}
        <input
          type="range"
          min={-80}
          max={80}
          step={1}
          value={factors.leftUpperArmShiftX}
          onChange={(e) => updateFactor('leftUpperArmShiftX', Number(e.target.value))}
        />
      </label>

      <label>
        Right Upper Arm Shift X: {factors.rightUpperArmShiftX}
        <input
          type="range"
          min={-80}
          max={80}
          step={1}
          value={factors.rightUpperArmShiftX}
          onChange={(e) => updateFactor('rightUpperArmShiftX', Number(e.target.value))}
        />
      </label>

      <label>
        Lower Arm ScaleY Boost: {factors.lowerArmScaleYBoost.toFixed(2)}
        <input
          type="range"
          min={0}
          max={1.5}
          step={0.01}
          value={factors.lowerArmScaleYBoost}
          onChange={(e) => updateFactor('lowerArmScaleYBoost', Number(e.target.value))}
        />
      </label>
    </div>
  );
}