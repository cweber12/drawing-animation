import React, { useState } from 'react'
import { Colors} from '../../../constants/Colors'
import { useColorScheme, Text } from 'react-native'
import './SketchControls.css';

/* Dropdown menu for selecting color and stroke width for sketching 
------------------------------------------------------------------------------*/
const BrushSizeSlider = ({ onStrokeWidthChange, strokeWidth}) => {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;
    const maxStrokeWidth = 60;
    return (
        <div className="sketch-controls-section">
            <div className="sub-header"
                style={{ color: theme.text}}>
                <input className="slider"
                    type="range"
                    min={1}
                    max={maxStrokeWidth}
                    value={strokeWidth}
                    onChange={e => onStrokeWidthChange(Number(e.target.value))}
                    style={{ '--slider-color': theme.background }}
                />
                    
                
                <div className="line-width-circle-wrapper"
                    style={{ 
                        width: maxStrokeWidth, 
                        height: maxStrokeWidth, 
                        }}>
                        <div className="line-width-circle"
                            style={{
                                backgroundColor: theme.text, 
                                width: strokeWidth, 
                                height: strokeWidth,
                            }}/>
                </div>
            </div>
            
        </div>
    )
}

export default BrushSizeSlider