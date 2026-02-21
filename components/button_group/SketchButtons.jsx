import { View, StyleSheet, useColorScheme } from 'react-native';
import React from 'react';
import { 
  FaTrashAlt, 
  FaEraser, 
  FaPencilAlt,
} from 'react-icons/fa';
import { FaRotateRight } from "react-icons/fa6";
import { RiSketching } from "react-icons/ri";
import HeaderButton from '../button/HeaderButton';
import { getIconSize } from '../../constants/Sizes';
import { Colors } from '../../constants/Colors';



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
  onClear, 
  setEraseMode,
  onToggleSettings,
  onToggleBackCanvases,
  showBackCanvases,
}) => {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;
    const [showSettings, setShowSettings] = React.useState(false);
  
    return (
    <View style={[styles.container, {backgroundColor: theme.controlsBackground}]}>    
    
      <HeaderButton
        onPress={onToggleBackCanvases}
        >
        <FaRotateRight
          style={{
            transform: showBackCanvases ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s ease',
          }}
        
        />
      </HeaderButton>

      <HeaderButton 
        onPress={onClear}
        color={theme.stopButton}
        hoveredColor={theme.stopButtonHover}
      >
        <FaTrashAlt/>
      </HeaderButton>

      {/* ERASE BUTTON ------------------------------------------------------*/}
      <HeaderButton 
        onPress={() => setEraseMode(true)}
        selected={eraseMode}
        {...(eraseMode ? {disabled: true} : {})}
      >
        <FaEraser />
      </HeaderButton>

      {/* SKETCH BUTTON -----------------------------------------------------*/}
      <HeaderButton
        onPress={() => setEraseMode(false)}
        selected={!eraseMode}
        {...(!eraseMode ? {disabled: true} : {})}
      >
        <FaPencilAlt />
      </HeaderButton>
      
      <HeaderButton 
        onPress={() => {
          setShowSettings(!showSettings);
          onToggleSettings && onToggleSettings(!showSettings);
        }}
        >
          <RiSketching />
      </HeaderButton> 
         
      </View>

  );
};

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center', 
    justifyContent: 'center',
    gap: 12,
    padding: 12, 
    borderBottomRightRadius: 8,

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
