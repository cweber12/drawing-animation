import React, { useState } from 'react'
import { ChromePicker } from 'react-color'

const SketchControls = ({ onColorChange, style }) => {
    const [selectedColor, setSelectedColor] = useState('#000000')

    return (
        <div style={style}>
            <ChromePicker
                color={selectedColor}
                onChange={color => {
                    setSelectedColor(color.hex)
                    if (onColorChange) onColorChange(color.hex)
                }}
                disableAlpha
            />
            <div 
                style={{ 
                    width: '100%', 
                    height: 40, 
                    backgroundColor: selectedColor,  
                }} 
            />
        </div>
    )
}

export default SketchControls