import { View, StyleSheet, useColorScheme} from 'react-native'
import React, { useRef } from 'react';
import { ReactSketchCanvas } from 'react-sketch-canvas';
import CanvasWrapper from '../../themed_elements/ThemedCanvasWrapper';
import { Colors } from '../../../constants/Colors';
import { 
    ARM_LENGTH, 
    ARM_WIDTH, 
    HAND_LENGTH, 
    HAND_WIDTH, 
    isSmallScreen 
} from '../../../constants/Sizes';

const RightArm = ( { 
    canvasProps, 
    upperArmRef, 
    lowerArmRef, 
    handRef 
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
                        width: isSmallScreen ? ARM_WIDTH : ARM_LENGTH, 
                        height: isSmallScreen ? ARM_LENGTH : ARM_WIDTH, 
                        boxShadow: boxShadowColor,
                    }
                ]}>

                <ReactSketchCanvas
                    ref={upperArmRef}
                    style={styles.canvas}
                    width={ARM_WIDTH}
                    height={ARM_LENGTH}
                    {...canvasProps}
                />
             
            </CanvasWrapper>
            
            <CanvasWrapper 
                style={[
                    styles.canvasWrapper, 
                    { 
                        width: isSmallScreen ? ARM_WIDTH : ARM_LENGTH, 
                        height: isSmallScreen ? ARM_LENGTH : ARM_WIDTH,
                        boxShadow: boxShadowColor
                    }
                ]}>
                <ReactSketchCanvas
                    ref={lowerArmRef}
                    style={styles.canvas}
                    width={isSmallScreen ? ARM_WIDTH : ARM_LENGTH}
                    height={isSmallScreen ? ARM_LENGTH : ARM_WIDTH}
                    {...canvasProps}
                />
            </CanvasWrapper>
            <CanvasWrapper 
                style={[
                    styles.canvasWrapper, 
                    { 
                        width: isSmallScreen ? HAND_WIDTH : HAND_LENGTH, 
                        height: isSmallScreen ? HAND_LENGTH : HAND_WIDTH, 
                        boxShadow: boxShadowColor
                    }
                ]}>
    
                <ReactSketchCanvas
                    ref={handRef}
                    style={styles.canvas}
                    width={HAND_WIDTH}
                    height={HAND_LENGTH}
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