import React, { useRef } from 'react';
import { View, StyleSheet, Dimensions, Button } from 'react-native';
import { ReactSketchCanvas } from 'react-sketch-canvas';

const { width, height } = Dimensions.get('window');

const DrawWeb = () => {
  const headRef = useRef(null);
  const torsoRef = useRef(null);
  const leftArmRef = useRef(null);
  const rightArmRef = useRef(null);
  const upperLegRef = useRef(null);
  const lowerLegRef = useRef(null);

  const clearAll = () => {
    headRef.current?.clearCanvas();
    torsoRef.current?.clearCanvas();
    leftArmRef.current?.clearCanvas();
    rightArmRef.current?.clearCanvas();
    upperLegRef.current?.clearCanvas();
    lowerLegRef.current?.clearCanvas();
  };

  // Sizes
    const bodyWidth = width * 0.1;
    const torsoHeight = height * 0.35;
    const headHeight = 150;
    const headWidth = 150; 
    const legHeight = 300;
    const armWidth = 100;
    const legWidth = bodyWidth * 0.5;
    const armHeight = torsoHeight;


    return (
        <View style={styles.container}>
        {/* Head */}
        <View style={[styles.canvasWrapper, { width: headWidth, height: headHeight }]}>
            <ReactSketchCanvas
            ref={headRef}
            style={styles.canvas}
            width={headWidth}
            height={headHeight}
            strokeWidth={4}
            strokeColor="black"
            />
        </View>
        {/* Arms and Torso */}
        <View style={styles.armTorsoRow}>
            <View style={[styles.canvasWrapper, { width: armWidth, height: armHeight }]}>
            <ReactSketchCanvas
                ref={leftArmRef}
                style={styles.canvas}
                width={armWidth}
                height={armHeight}
                strokeWidth={4}
                strokeColor="black"
            />
            </View>
            <View style={[styles.canvasWrapper, { width: bodyWidth, height: torsoHeight }]}>
            <ReactSketchCanvas
                ref={torsoRef}
                style={styles.canvas}
                width={bodyWidth}
                height={torsoHeight}
                strokeWidth={4}
                strokeColor="black"
            />
            </View>
            <View style={[styles.canvasWrapper, { width: armWidth, height: armHeight }]}>
            <ReactSketchCanvas
                ref={rightArmRef}
                style={styles.canvas}
                width={armWidth}
                height={armHeight}
                strokeWidth={4}
                strokeColor="black"
            />
            </View>
        </View>
        {/* Legs */}
        <View style={styles.legsRow}>
            <View style={[styles.canvasWrapper, { width: legWidth, height: legHeight }]}>
                <ReactSketchCanvas
                    ref={upperLegRef}
                    style={styles.canvas}
                    width={legWidth}
                    height={legHeight}
                    strokeWidth={4}
                    strokeColor="black"
                />
            </View>
            <View style={[styles.canvasWrapper, { height: legHeight, width: legWidth }]}>
                <ReactSketchCanvas
                    ref={lowerLegRef}
                    style={styles.canvas}
                    width={legWidth}
                    height={legHeight}

                    strokeWidth={4}
                    strokeColor="black"
                />
            </View>
        </View>
        <Button title="Clear All Canvases" onPress={clearAll} style={styles.clearButton} />
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
    backgroundColor: '#242424ff',
  },
  canvasWrapper: {
    borderWidth: 2,
    borderColor: 'black',
    backgroundColor: '#242424ff',
    margin: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  canvas: {
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  armTorsoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  legsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButton: {
    marginTop: 20,
  },
});