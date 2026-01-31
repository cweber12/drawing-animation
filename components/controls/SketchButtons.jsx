import { 
  View, 
  TouchableOpacity, 
  StyleSheet, 
  useColorScheme,
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { 
  FaPaintBrush, 
  FaPalette,
  FaTrashAlt, 
  FaRunning, 
  FaFileExport,
  FaEraser, 
  FaChevronDown
} from 'react-icons/fa';
import { getIconSize } from '../../constants/Sizes';
import React from 'react';

import { uploadToS3 } from '../../utils/s3Utils';
import { LuInfo } from "react-icons/lu";
import { GiRaiseZombie } from "react-icons/gi";
import HeaderButton from '../buttons/HeaderButton';

/* Header buttons for the SketchPage
--------------------------------------------------------------------------------
Info: Opens info tab about SketchPage
Save: Uploads current SVG to S3
Clear: Clears the current sketch
Erase: Toggles between eraser and brush mode
Brush Size: Opens brush size slider
Color Picker: Opens color picker
Animate: Opens detect pose options to animate sketch
------------------------------------------------------------------------------*/
const SketchButtons = ({ 
  eraseMode,
  strokeColor,
  onClear, 
  onToggleErase,
  onShowBrushSizeSlider,
  onShowColorPicker,
  onShowSketchInfo,
  onHoverTitle,
  onShowDetectPoseOptions,
  onHandleUploadSvg,
}) => {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;  
  
    return (
    <View style={styles.container}>    

      {/* INFO BUTTON -------------------------------------------------------*/}
      <HeaderButton
        onPress={onShowSketchInfo}
        onHoverTitle={onHoverTitle}
        title="Info"
      >
        <LuInfo/>
      </HeaderButton>
      {/* EXPORT BUTTON -----------------------------------------------------*/}
      <HeaderButton
        onPress={onHandleUploadSvg}
        onHoverTitle={onHoverTitle}
        title="Save"
      >
        <FaFileExport/>
      </HeaderButton>

      {/* CLEAR BUTTON ------------------------------------------------------*/}
      <HeaderButton 
        onPress={onClear}
        onHoverTitle={onHoverTitle}
        title="Clear"
      >
        <FaTrashAlt/>
      </HeaderButton>

      {/* ERASE BUTTON ------------------------------------------------------*/}
      <HeaderButton 
        onPress={onToggleErase}
        onHoverTitle={onHoverTitle}
        title={eraseMode ? "Brush" : "Eraser"}
      >
        {eraseMode ? <FaPaintBrush /> : <FaEraser /> }
      </HeaderButton>

      
      {/* BRUSH SIZE BUTTON -------------------------------------------------*/}
      <View style={styles.buttonColumn}>
          {eraseMode ? (
            <FaEraser 
            size={getIconSize() / 2} 
            color={theme.button}  
            style={styles.brushButton}
            />
          ) : (
            <FaPaintBrush 
            size={getIconSize() / 2} 
            color={theme.text}  
            style={styles.brushButton}
            />
          )}
        <HeaderButton 
          onPress={onShowBrushSizeSlider}
          onHoverTitle={onHoverTitle}
          title="Adjust Brush Size"
        >
          <FaChevronDown />
        </HeaderButton>
      </View>
      
      {/* COLOR PICKER BUTTON -----------------------------------------------*/}
      <View style={styles.buttonColumn}>
        <FaPalette 
          size={getIconSize() / 2} 
          color={strokeColor}
          style={styles.brushButton} 
        />
        <HeaderButton 
          onPress={onShowColorPicker}
          onHoverTitle={onHoverTitle}
          title="Select Brush Color"
        >
          <FaChevronDown />
        </HeaderButton>
      </View>

      
      {/* ANIMATE BUTTON ----------------------------------------------------*/}
      <HeaderButton
        onPress={onShowDetectPoseOptions}
        onHoverTitle={onHoverTitle}
        title="Animate"
        size={getIconSize() * 2}
      >
        <GiRaiseZombie />
      </HeaderButton>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginRight: 24,
    gap: 24,
  },

  buttonColumn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
  },

  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },

  brushButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  
});

export default SketchButtons;
