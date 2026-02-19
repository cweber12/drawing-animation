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
import { GiShamblingZombie, GiLookAt } from "react-icons/gi";
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
  onShowDetectPoseOptions,
  onToggleExportOptions,
  onToggleSettings,
  onToggleBackCanvases,
  showBackCanvases,
}) => {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;
    const [showSettings, setShowSettings] = React.useState(false);
  
    return (
    <View style={{flexDirection: 'row', alignItems: 'center'}}>
    <View style={[styles.container, {backgroundColor: theme.controlsBackground}]}>    
    
      {/* INFO BUTTON -------------------------------------------------------*/}
      <HeaderButton
        onPress={onShowSketchInfo}
      >
        <LuInfo/>
      </HeaderButton>

      {/* CLEAR BUTTON ------------------------------------------------------*/}
      <HeaderButton 
        onPress={onClear}
      >
        <FaTrashAlt/>
      </HeaderButton>

      {/* EXPORT BUTTON -----------------------------------------------------*/}
      <HeaderButton
        onPress={onToggleExportOptions}
      >
        <FaFileExport/> 
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
      
      {/* SKETCH CONTROLS BUTTON --------------------------------------------*/}  
      <View style={styles.buttonColumn}>
        <HeaderButton 
          onPress={() => {
            setShowSettings(!showSettings);
            onToggleSettings && onToggleSettings(!showSettings);
          }}
          >
            <FaGear />
          </HeaderButton>
      </View>

      
      
      {/* ANIMATE BUTTON ----------------------------------------------------*/}
      <HeaderButton
        onPress={onShowDetectPoseOptions} 
        size={getIconSize() * 1.5}
      >
        <GiRaiseZombie />
      </HeaderButton>
    </View>
    <View 
      style={{
        flexDirection: 'row', 
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomRightRadius: 8,
        backgroundColor: theme.listItemBackgroundPressed, 
        padding: 12,
        }}>
        <GiLookAt size={getIconSize() * 1.5} color={theme.text} />
        <HeaderButton
            onPress={onToggleBackCanvases}
            size={getIconSize() * 1.5}
            style={{ borderLeft: `2px solid ${theme.text}`}}
          >
            {GiShamblingZombie ? (
              <GiShamblingZombie
                size={getIconSize() * 1.5}
                style={{ 
                  transform: !showBackCanvases ? 'rotateY(180deg)' : 'none', 
                  color: theme.actionButton,
                }} />
            ) : null}
        </HeaderButton>
      </View>
      </View>

  );
};

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center', 
    gap: 12,
    padding: 12, 

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
