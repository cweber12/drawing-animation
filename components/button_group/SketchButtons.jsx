import { View, StyleSheet, useColorScheme } from 'react-native';
import React from 'react';
import { FaGear } from "react-icons/fa6";
import { LuInfo } from "react-icons/lu";
import { GiRaiseZombie } from "react-icons/gi";
import { 
  FaTrashAlt, 
  FaFileExport,
  FaEraser, 
  FaPencilAlt, 
} from 'react-icons/fa';
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
  onShowSketchInfo,
  onHoverTitle,
  onShowDetectPoseOptions,
  onToggleExportOptions,
  onToggleSettings,
}) => {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;
    const [showSettings, setShowSettings] = React.useState(false);
    const [hoveredAnimate, setHoveredAnimate] = React.useState(false);
  
    return (
    <View style={styles.container}>    

      {/* INFO BUTTON -------------------------------------------------------*/}
      <HeaderButton
        onPress={onShowSketchInfo}
        onHoverTitle={onHoverTitle}
        title="INFO"
      >
        <LuInfo/>
      </HeaderButton>

      {/* CLEAR BUTTON ------------------------------------------------------*/}
      <HeaderButton 
        onPress={onClear}
        onHoverTitle={onHoverTitle}
        title="CLEAR"
      >
        <FaTrashAlt/>
      </HeaderButton>

      {/* EXPORT BUTTON -----------------------------------------------------*/}
      <HeaderButton
        onPress={onToggleExportOptions}
        onHoverTitle={onHoverTitle}
        title="SAVE"
      >
        <FaFileExport/>
      </HeaderButton>

      {/* ERASE BUTTON ------------------------------------------------------*/}
      <HeaderButton 
        onPress={() => setEraseMode(true)}
        onHoverTitle={onHoverTitle}
        selected={eraseMode}
        title={"ERASE"}
        style={{opacity: eraseMode ? 1 : 0.5}}
        {...(eraseMode ? {disabled: true} : {})}
      >
        <FaEraser /> 
      </HeaderButton>

      {/* SKETCH BUTTON -----------------------------------------------------*/}
      <HeaderButton
        onPress={() => setEraseMode(false)}
        onHoverTitle={onHoverTitle}
        selected={!eraseMode}
        title={"SKETCH"}
        style={{
          opacity: eraseMode ? 0.5 : 1, 
        }}
        {...(!eraseMode ? {disabled: true} : {})}
      >
        <FaPencilAlt />
      </HeaderButton>
      
      {/* SKETCH CONTROLS BUTTON --------------------------------------------*/}  
      <View style={styles.buttonColumn}>
        <HeaderButton 
          onPress={() => {
            setShowSettings(!showSettings);
            onToggleSettings && onToggleSettings(!showSettings);
          }}
          onHoverTitle={onHoverTitle}
          title="BRUSH SIZE & COLOR"
          >
            <FaGear />
          </HeaderButton>
      </View>
      
      {/* ANIMATE BUTTON ----------------------------------------------------*/}
      <HeaderButton
        onPress={onShowDetectPoseOptions}
        onHoverTitle={(title) => {
          onHoverTitle && onHoverTitle(title);
        }}
        setHoveredProp={setHoveredAnimate}
        title="ANIMATE"
        size={getIconSize() * 2}
      >
        <GiRaiseZombie 
          style={{
            backgroundColor: hoveredAnimate ? theme.iconHover : '', 
            borderRadius: 9999, 
            boxShadow: hoveredAnimate ? `0 0 10px ${theme.actionButton}` : 'none',
            color: theme.button
          }}
        />
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
