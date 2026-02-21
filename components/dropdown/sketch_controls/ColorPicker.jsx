import { ChromePicker } from 'react-color'
import './SketchControls.css';

/* Dropdown menu for selecting color and stroke width for sketching 
------------------------------------------------------------------------------*/
const ColorPicker = ({ onColorChange, selectedColor }) => {

    return (
        <div className="sketch-controls-section">

            <ChromePicker className="color-picker"
                color={selectedColor}
                onChangeComplete={(color) => onColorChange(color.hex)}
                disableAlpha
            />
            
        </div>
    )
}

export default ColorPicker