import React from 'react';
import { View, Button, TouchableOpacity, StyleSheet, Text, useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors';
import { FaPaintBrush, FaSave, FaTrash, FaRunning} from 'react-icons/fa';
import { ICON_SIZE } from '../constants/Sizes';

const DrawWebHeaderButtons = ({ 
  onClear, 
  onSave, 
  onOpenCamera, 
  onShowSketchControls,
}) => {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;
  
    return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.button} 
        onPress={onOpenCamera}
      >
        <FaRunning size={ICON_SIZE} color={theme.button} />
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.button} 
        onPress={onClear}
      >
        <FaTrash size={ICON_SIZE} color={theme.button} />
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
