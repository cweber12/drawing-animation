import React, { forwardRef, useState } from 'react'
import { ChromePicker } from 'react-color'
import { Colors} from '../../../constants/Colors'
import { useColorScheme, Text } from 'react-native'
import './SketchControls.css';
import { FaPalette } from 'react-icons/fa';

/* Dropdown menu for selecting color and stroke width for sketching 
------------------------------------------------------------------------------*/
const ColorPicker = ({ onColorChange, selectedColor }) => {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;

    return (
        <div className="sketch-controls-section">
            <div className="sub-header"
                style={{ 
                    color: theme.text,
                    marginBottom: '0.5rem'
                }}>
                Color <FaPalette size={32} color={selectedColor} />  
            </div>

            <ChromePicker className="color-picker"
                color={selectedColor}
                onChangeComplete={(color) => onColorChange(color.hex)}
                disableAlpha
            />
            
        </div>
    )
}

export default ColorPicker