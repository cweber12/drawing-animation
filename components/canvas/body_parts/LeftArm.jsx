import { View, StyleSheet, useColorScheme} from 'react-native'
import React, { useRef } from 'react';
import { ReactSketchCanvas } from 'react-sketch-canvas';
import CanvasWrapper from '../../themed_elements/ThemedCanvasWrapper';
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
    isSmallScreen, 
}) => {

    // Determine canvas dimensions based on screen size// Get current theme colors
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;                       
    
    return (
        <View style={isSmallScreen ? styles.armColumn : styles.armRow}>
            <CanvasWrapper 
                style={[
                    { 
                        width: isSmallScreen ? armWidth : armLength, 
                        height: isSmallScreen ? armLength : armWidth, 
                    }
                ]}>

                <ReactSketchCanvas
                    id={upperArmId}
                    ref={upperArmRef}
                    style={styles.canvas}
                    width={armWidth}
                    height={armLength}
                    {...canvasProps}
                
                />
             
            </CanvasWrapper>
            
            <CanvasWrapper 
                style={[
                    { 
                        width: isSmallScreen ? armWidth : armLength, 
                        height: isSmallScreen ? armLength : armWidth,
                    }
                ]}>
                <ReactSketchCanvas
                    id={lowerArmId}
                    ref={lowerArmRef}
                    style={styles.canvas}
                    width={isSmallScreen ? armWidth : armLength}
                    height={isSmallScreen ? armLength : armWidth}
                    {...canvasProps}
             
                />
            </CanvasWrapper>
            <CanvasWrapper 
                style={[
                    { 
                        width: isSmallScreen ? handWidth : handLength, 
                        height: isSmallScreen ? handLength : handWidth, 
                    }
                ]}>
    
                <ReactSketchCanvas
                    id={handId}
                    ref={handRef}
                    style={styles.canvas}
                    width={isSmallScreen ? handWidth : handLength}
                    height={isSmallScreen ? handLength : handWidth}
                    {...canvasProps}
      
                />
            
            </CanvasWrapper>
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