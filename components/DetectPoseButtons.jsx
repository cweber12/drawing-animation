import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { TouchableOpacity, useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors';
import { FaCamera } from 'react-icons/fa';
import { ICON_SIZE } from '../constants/Sizes';

const DetectPoseButtons = ({ onToggleWebcam }) => {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;
  
    return (
        <TouchableOpacity 
            style={styles.button} 
            onPress={onToggleWebcam}
        >
            <FaCamera size={ICON_SIZE} color={theme.button} />
        </TouchableOpacity>
    );
}

export default DetectPoseButtons

const styles = StyleSheet.create({
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
})