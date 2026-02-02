import React from 'react'
import BrushSizeSlider from './BrushSizeSlider'
import ColorPicker from './ColorPicker'
import { Colors} from '../../../constants/Colors'
import { useColorScheme } from 'react-native';
import './SketchControls.css';
import { FaMinus } from 'react-icons/fa';

const SketchControls = ({ 
    selectedColor, 
    setSelectedColor,
    strokeWidth,
    setStrokeWidth,
    setShowSketchControls,
}) => {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;

return (
    <div className="sketch-controls">
        <div className="header"
            style={{ 
                color: theme.text,
            }}> 
            Tools
            <FaMinus 
                size={24} 
                style={{ cursor: 'pointer' }}
                onClick={() => setShowSketchControls(false)}
            />
        </div>
        <BrushSizeSlider 
            strokeWidth={strokeWidth}
            onStrokeWidthChange={setStrokeWidth}   
        />

        <ColorPicker
            selectedColor={selectedColor}
            onColorChange={setSelectedColor}
        />
    </div>
)
}

export default SketchControls