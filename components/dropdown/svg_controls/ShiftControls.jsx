// components/ShiftControls.jsx
import React, { useState } from 'react';
import { useShiftFactors } from '../../../context/ShiftFactorsContext';

const BODY_PARTS = [
  { id: 'headShift', label: 'Head' },
  { id: 'shoulderShift', label: 'Upper Arms' },
  { id: 'elbowShift', label: 'Lower Arms' },
  { id: 'wristShift', label: 'Hands' },
  { id: 'hipShift', label: 'Upper Legs' },
  { id: 'kneeShift', label: 'Lower Legs' },
  { id: 'footShift', label: 'Feet' },
];

export default function ShiftControls() {
  const { factors, updateFactor } = useShiftFactors();
  const [selected, setSelected] = useState(BODY_PARTS[0].id);

  const current = factors[selected] || { x: 0, y: 0 };

  function setAxis(axis, value) {
    const next = { x: current.x, y: current.y, [axis]: Number(value) };
    updateFactor(selected, next);
  }

  return (
    <div 
        style={{ 
            display: 'flex', 
            gap: 12, 
            position: 'absolute',
            top: 12,
            right: 12, 
            }}>
        <div style={{ minWidth: 140 }}>
            {BODY_PARTS.map(p => (
            <button
                key={p.id}
                onClick={() => setSelected(p.id)}
                style={{
                display: 'block',
                width: '100%',
                marginBottom: 6,
                padding: '6px 8px',
                textAlign: 'left',
                background: selected === p.id ? '#e6f0ff' : 'white',
                border: '1px solid #ddd',
                cursor: 'pointer',
                }}
            >
                {p.label}
            </button>
            ))}
        </div>

        <div style={{ flex: 1, minWidth: 180 }}>
            <div style={{ marginBottom: 8, fontWeight: '600' }}>{BODY_PARTS.find(b => b.id === selected).label}</div>

            <label style={{ display: 'block', marginBottom: 8 }}>
            X: <strong style={{ marginLeft: 8 }}>{current.x}</strong>
            <input
                type="range"
                min={-200}
                max={200}
                step={1}
                value={current.x}
                onChange={(e) => setAxis('x', e.target.value)}
                style={{ width: '100%', marginTop: 6 }}
            />
            </label>

            <label style={{ display: 'block' }}>
            Y: <strong style={{ marginLeft: 8 }}>{current.y}</strong>
            <input
                type="range"
                min={-200}
                max={200}
                step={1}
                value={current.y}
                onChange={(e) => setAxis('y', e.target.value)}
                style={{ width: '100%', marginTop: 6 }}
            />
            </label>

        </div>
    </div>
  );
}