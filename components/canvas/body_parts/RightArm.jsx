import { View, StyleSheet, useColorScheme} from 'react-native'
import React, { useRef } from 'react';
import { ReactSketchCanvas } from 'react-sketch-canvas';
import CanvasView from '../../view/CanvasView';
import { Colors } from '../../../constants/Colors';

const RightArm = ( { 
    canvasProps,
    upperArmId, 
    lowerArmId, 
    handId, 
    upperArmRef, 
    lowerArmRef, 
    handRef, 
    armWidth, 
    armLength,
    handWidth,
    handLength, 
    armsDown, 

}) => {

    // Determine canvas dimensions based on screen size// Get current theme colors
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;

    // Replace parent with this once vertical arm drawing logic implemented. 
    // <View style={armsDown ? styles.armColumn : styles.armRow}></View>
                            
    return (
        <View style={armsDown ? styles.armColumn : styles.armRow}>
            <CanvasView 
                style={[
                    { 
                        width: armsDown ? armWidth : handLength, 
                        height: armsDown ? armLength : handWidth, 
                    }
                ]}>
                {armsDown ? (
                    <ReactSketchCanvas
                        id={upperArmId}
                        ref={upperArmRef}
                        style={styles.canvas}
                        width={armWidth}
                        height={armLength}
                        {...canvasProps}
                   
                    />
                ) : (
                    
                    <ReactSketchCanvas
                        id={handId}
                        ref={handRef}
                        style={styles.canvas}
                        width={handWidth}
                        height={handLength}
                        {...canvasProps}
                  
                    />
                    )}
            </CanvasView>
            <CanvasView 
                style={[
                    { 
                        width: armsDown ? armWidth : armLength, 
                        height: armsDown ? armLength : armWidth,
                    }
                ]}>
                <ReactSketchCanvas
                    id={lowerArmId}
                    ref={lowerArmRef}
                    style={styles.canvas}
                    width={armsDown ? armWidth : armLength}
                    height={armsDown ? armLength : armWidth}
                    {...canvasProps}
         
                />
            </CanvasView>
            <CanvasView 
                style={[
                    { 
                        width: armsDown ? handWidth : armLength, 
                        height: armsDown ? handLength : armWidth, 
                    }
                ]}>
                {armsDown ? (
                    <ReactSketchCanvas
                        id={handId}
                        ref={handRef}
                        style={styles.canvas}
                        width={handWidth}
                        height={handLength}
                        {...canvasProps}
                 
                    />
                ) : (
                    <ReactSketchCanvas
                        id={upperArmId}
                        ref={upperArmRef}
                        style={styles.canvas}
                        width={armLength}
                        height={armWidth}
                        {...canvasProps}
          
                    />
                )}
            </CanvasView>
        </View>
    )
}

export default RightArm

const styles = StyleSheet.create({
    canvas: {
        backgroundColor: 'transparent',
        width: '100%',
        height: '100%',
    },
     armRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'center',
        gap: 2, 
    },
    
    armColumn: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2, 
    },

})