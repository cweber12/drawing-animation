import React from 'react';
import { View, Button, StyleSheet } from 'react-native';

const DrawWebHeaderButtons = ({ onClear, onSave, onOpenCamera }) => {
  return (
    <View style={styles.container}>
      <Button title="Clear" onPress={onClear} />
      <Button title="Save" onPress={onSave} />
      <Button title="Open Camera" onPress={onOpenCamera} />
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
});

export default DrawWebHeaderButtons;
