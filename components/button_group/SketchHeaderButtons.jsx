import { View, StyleSheet, useColorScheme, Text } from 'react-native';
import React from 'react';
import { LuInfo } from "react-icons/lu";
import { GiRaiseZombie } from "react-icons/gi";
import { FaFileExport } from 'react-icons/fa';
import { FaPersonRunning } from "react-icons/fa6";
import { MdOutlineSaveAs } from "react-icons/md";
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
const SketchHeaderButtons = ({ 
  onShowSketchInfo,
  onShowDetectPoseOptions,
  onToggleExportOptions,
  onToggleBackCanvases,
  showBackCanvases,
}) => {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;
  
    return (
    <View style={styles.container}>    
      <HeaderButton
        onPress={onShowSketchInfo}
        color={theme.headerIcon}
        hoveredColor={theme.headerIconHover}
      >
        <LuInfo/>
      </HeaderButton>


      {/* EXPORT BUTTON -----------------------------------------------------*/}
      <HeaderButton
        onPress={onToggleExportOptions}
        color={theme.headerIcon}
        hoveredColor={theme.headerIconHover}
      >
        <MdOutlineSaveAs/> 
      </HeaderButton>  
      
      {/* ANIMATE BUTTON ----------------------------------------------------*/}
      <HeaderButton
        onPress={onShowDetectPoseOptions} 
        color={theme.headerIcon}
        hoveredColor={theme.headerIconHover}
      >
        <FaPersonRunning />
      </HeaderButton>

      </View>

  );
};

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center', 
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 12,

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

export default SketchHeaderButtons;
