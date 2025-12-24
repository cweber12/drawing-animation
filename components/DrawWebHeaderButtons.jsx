import React from 'react';
import { View, Button, TouchableOpacity, StyleSheet, Text, useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors';
import { 
  FaPaintBrush, 
  FaSave, 
  FaTrashAlt, 
  FaRunning, 
  FaVideo
} from 'react-icons/fa';
import { ICON_SIZE } from '../constants/Sizes';
import { set } from 'lodash';

const DrawWebHeaderButtons = ({ 
  onClear, 
  onSave, 
  onOpenCamera, 
  onShowSketchControls,
  setPoseView,
  setSvgView,
}) => {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;
  
    return (
    <View style={styles.container}>
      
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => {
          setPoseView && setPoseView();
          onOpenCamera && onOpenCamera();
        }}
      >
        <FaRunning size={ICON_SIZE} color={theme.button} />
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.button} 
        onPress={() => {
          setSvgView && setSvgView();
          onOpenCamera && onOpenCamera();
        }}
      >
        <FaVideo size={ICON_SIZE} color={theme.button} />
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.button} 
        onPress={onClear}
      >
        <FaTrashAlt size={ICON_SIZE} color={theme.button} />
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.button} 
        onPress={onSave}
      > 
        <FaSave size={ICON_SIZE} color={theme.button} />
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.button} 
        onPress={onShowSketchControls}
      >
        <FaPaintBrush size={ICON_SIZE} color={theme.button}  />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginRight: 8,
  },

  button: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginHorizontal: 2,
  },

  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default DrawWebHeaderButtons;
