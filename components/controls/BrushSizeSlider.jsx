import React, { useState } from 'react'
import { Colors} from '../../constants/Colors'
import { useColorScheme } from 'react-native'
import '../../styles/SketchControls.css';

/* Dropdown menu for selecting color and stroke width for sketching 
------------------------------------------------------------------------------*/
const brushSizeSlider = ({ onStrokeWidthChange, strokeWidth, style }) => {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;

    return (
        <div style={{...style, backgroundColor: theme.navBackground}}>
            <div className="line-width-row" style={{ color: theme.mutedText }}>
                <div style={
                    {
                        backgroundColor: theme.button,
                        borderRadius: '50%', 
                        width: strokeWidth, 
                        height: strokeWidth,
                        marginRight: 8
                    }
                    }/>
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
            
        </div>
    )
}

export default brushSizeSlider