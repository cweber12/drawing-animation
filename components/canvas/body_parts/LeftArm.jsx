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
    const boxShadowColor = `${theme.boxShadowColor} 0px 0px 6px -1px, 
                            ${theme.boxShadowColor} 0px 0px 4px -1px`;
                            
    
    return (
        <View style={isSmallScreen ? styles.armColumn : styles.armRow}>
            <CanvasWrapper 
                style={[
                    styles.canvasWrapper, 
                    { 
                        width: isSmallScreen ? armWidth : armLength, 
                        height: isSmallScreen ? armLength : armWidth, 
                        boxShadow: boxShadowColor,
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
                    styles.canvasWrapper, 
                    { 
                        width: isSmallScreen ? armWidth : armLength, 
                        height: isSmallScreen ? armLength : armWidth,
                        boxShadow: boxShadowColor
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
                    styles.canvasWrapper, 
                    { 
                        width: isSmallScreen ? handWidth : handLength, 
                        height: isSmallScreen ? handLength : handWidth, 
                        boxShadow: boxShadowColor
                    }
                ]}>
    
                <ReactSketchCanvas
                    id={handId}
                    ref={handRef}
                    style={styles.canvas}
                    width={handWidth}
                    height={handLength}
                    {...canvasProps}
      
                />
            
            </CanvasWrapper>
        </View>
    )
}

export default RightArm

const styles = StyleSheet.create({
    canvasWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
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