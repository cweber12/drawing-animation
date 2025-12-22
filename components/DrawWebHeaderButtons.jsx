import React from 'react';
import { View, Button, TouchableOpacity, StyleSheet, Text, useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors';
const DrawWebHeaderButtons = ({ onClear, onSave, onOpenCamera }) => {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;
  
    return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[styles.button, { backgroundColor: theme.button }]} 
        onPress={onOpenCamera}
      >
        <Text style={[styles.buttonText, { color: theme.buttonText }]}>
            Open Camera
        </Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.button, { backgroundColor: theme.button }]} 
        onPress={onClear}
      >
        <Text style={[styles.buttonText, { color: theme.buttonText }]}>
            Clear
        </Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.button, { backgroundColor: theme.button }]} 
        onPress={onSave}
      >
        <Text style={[styles.buttonText, { color: theme.buttonText }]}>
            Save
        </Text>
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
