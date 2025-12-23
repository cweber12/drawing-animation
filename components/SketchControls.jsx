import React, { useState } from 'react'
import { ChromePicker } from 'react-color'
import { Colors} from '../constants/Colors'
import { useColorScheme } from 'react-native'
import '../styles/SketchControls.css';

/* Dropdown menu for selecting color and stroke width for sketching 
------------------------------------------------------------------------------*/
const SketchControls = ({ onColorChange, onStrokeWidthChange, strokeWidth, style }) => {
    const [selectedColor, setSelectedColor] = useState('#000000')
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;

    return (
        <div 
        style={{...style, backgroundColor: theme.navBackground, }}>
            <div style={{ marginTop: 12, marginBottom: 12, color: theme.title }}>
                <label style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    fontFamily: 'segoe ui', 
                    fontWeight: 'bold' 
                    }}>
                    Line Width: {strokeWidth}
                    <input
                        type="range"
                        min={1}
                        max={60}
                        value={strokeWidth}
                        onChange={e => onStrokeWidthChange(Number(e.target.value))}
                        className="slider"
                        style={{ '--slider-color': theme.button }}
                    />
                </label>
            </div>
            <div 
                style={{ 
                    width: '100%', 
                    height: 20, 
                    backgroundColor: selectedColor, 
                    marginBottom: 12,
                    borderRadius: 50,
                }} 
            />           
            <ChromePicker
                color={selectedColor}
                onChange={color => {
                    setSelectedColor(color.hex)
                    if (onColorChange) onColorChange(color.hex)
                }}
                disableAlpha
            />
        </div>
    )
}

export default SketchControls