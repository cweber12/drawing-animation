import React, { useState } from 'react'
import { ChromePicker } from 'react-color'
import { Colors} from '../../constants/Colors'
import { useColorScheme } from 'react-native'
import '../../styles/SketchControls.css';

/* Dropdown menu for selecting color and stroke width for sketching 
------------------------------------------------------------------------------*/
const ColorPicker = ({ onColorChange, style }) => {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;
    const [selectedColor, setSelectedColor] = useState(theme.colorPickerDefault);

    return (
        <div style={{...style, backgroundColor: theme.navBackground}}>

            <div className="selected-color" style={{ backgroundColor: selectedColor }} />      
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

export default ColorPicker