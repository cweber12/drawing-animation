import React, { useRef } from 'react';
import { View, StyleSheet, Dimensions, Text, Button } from 'react-native';
import { ReactSketchCanvas } from 'react-sketch-canvas';

const { width, height } = Dimensions.get('window');

const DrawWeb = () => {
  const canvasRef = useRef(null);

  const handleClear = () => {
    if (canvasRef.current) {
      canvasRef.current.clearCanvas();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.canvasWrapper}>
        <ReactSketchCanvas
          ref={canvasRef}
          style={styles.canvas}
          width={width * 0.9}
          height={height * 0.7}
          strokeWidth={4}
          strokeColor="black"
        />
      </View>
      <Button title="Clear Canvas" onPress={handleClear} />
    </View>
  );
};

export default DrawWeb;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 22,
    marginBottom: 16,
  },
  canvasWrapper: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    overflow: 'hidden',
  },
  canvas: {
    borderRadius: 10,
    backgroundColor: '#fff',
  },
});