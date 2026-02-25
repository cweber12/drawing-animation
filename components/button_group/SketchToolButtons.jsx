import { View, StyleSheet, useColorScheme, Text } from 'react-native';
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
const SketchToolButtons = ({ 
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
    <View 
    style={[
      styles.container, 
      {
        backgroundColor: theme.controlsBackground, 
        borderBottom: `1px solid ${theme.border}`,
        borderLeft: `1px solid ${theme.border}`,
      }
    ]}>    
      
      <View style={styles.buttonRow}>
        <HeaderButton 
          onPress={onClear}
          hoveredColor={theme.stopButtonHover}
        >
          <FaTrashAlt/>
        </HeaderButton>
        <Text style={{...styles.buttonText, color: theme.icon}}>Clear All</Text>
      </View>

      {/* ERASE BUTTON ------------------------------------------------------*/}
      <View style={styles.buttonRow}>
        <HeaderButton 
            onPress={() => setEraseMode(true)}
            selected={eraseMode}
            {...(eraseMode ? {disabled: true} : {})}
          >
          <FaEraser />
        </HeaderButton>
        <Text style={{...styles.buttonText, color: theme.icon}}>Erase</Text>
      </View>

      {/* SKETCH BUTTON -----------------------------------------------------*/}
      <View style={styles.buttonRow}>
        <HeaderButton
          onPress={() => setEraseMode(false)}
          selected={!eraseMode}
          {...(!eraseMode ? {disabled: true} : {})}
        >
          <FaPencilAlt />
        </HeaderButton>
        <Text style={{...styles.buttonText, color: theme.icon}}>Sketch</Text>
      </View>
      
      <View style={styles.buttonRow}>
        <HeaderButton 
          onPress={() => {
            setShowSettings(!showSettings);
            onToggleSettings && onToggleSettings(!showSettings);
          }}
          >
            <RiSketching />
        </HeaderButton> 
        <Text style={{...styles.buttonText, color: theme.icon}}>Options</Text>
      </View>

      <View style={styles.buttonRow}>
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
        <Text style={{...styles.buttonText, color: theme.icon}}>Flip Canvas</Text>
      </View>
      <View style={{...styles.textSection, borderTop: `1px solid ${theme.border}`}} >
        
        <Text style={{ color: theme.mutedText, fontSize: 20 }}>Facing: </Text>
        <Text style={{ color: theme.text, fontSize: 20, fontWeight: 'bold' }}>
          {showBackCanvases ? 'BACK' : 'FRONT'}
        </Text>
      </View>
         
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
    paddingTop: 12,
    borderBottomLeftRadius: 8,

  },

  buttonColumn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
  },

  buttonRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 6,
    width: '100%',
    paddingRight: 48, 
    paddingLeft: 12,
  },

  textSection: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12, 
    width: '100%',
  },

  buttonText: {
    fontSize: 18,
  },
  
});

export default SketchToolButtons;
