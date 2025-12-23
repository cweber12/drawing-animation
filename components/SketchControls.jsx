import React, { useState } from 'react'
import { ChromePicker } from 'react-color'
import { Colors} from '../constants/Colors'
import { useColorScheme } from 'react-native'
import '../styles/SketchControls.css';

/* Dropdown menu for selecting color and stroke width for sketching 
------------------------------------------------------------------------------*/
const SketchControls = ({ onColorChange, onStrokeWidthChange, strokeWidth, style }) => {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;
    const [selectedColor, setSelectedColor] = useState(theme.colorPickerDefault);

    return (
        <div style={{...style, backgroundColor: theme.navBackground}}>
            <div className="line-width-row" style={{ color: theme.mutedText }}>
                <div style={{fontWeight: 'bold' }}>Stroke Width:</div>
                <input
                    type="range"
                    min={1}
                    max={60}
                    value={strokeWidth}
                    onChange={e => onStrokeWidthChange(Number(e.target.value))}
                    className="slider"
                    style={{ '--slider-color': theme.button }}
                />    
            </div>
            <div className="selected-color-row">
                <span style={{ color: theme.mutedText, marginRight: 8, fontWeight: 'bold' }}>Color:</span>
                <div className="selected-color" style={{ backgroundColor: selectedColor }} /> 
            </div>          
            <ChromePicker
                color={selectedColor}
                className="color-picker"
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