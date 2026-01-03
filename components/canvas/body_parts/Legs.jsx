import { View, StyleSheet, useColorScheme} from 'react-native'
import React, { useRef } from 'react';
import { ReactSketchCanvas } from 'react-sketch-canvas';
import CanvasWrapper from '../../themed_elements/ThemedCanvasWrapper';
import { Colors } from '../../../constants/Colors';
import { 
    isSmallScreen,
    LEG_LENGTH,
    LEG_WIDTH,
} from '../../../constants/Sizes';  

const Legs = ( {
    canvasProps, 
    rightUpperLegRef, 
    rightLowerLegRef, 
    leftUpperLegRef, 
    leftLowerLegRef
} ) => {

    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;
    const boxShadowColor = `${theme.boxShadowColor} 0px 0px 6px -1px, 
                            ${theme.boxShadowColor} 0px 0px 4px -1px`;

    const legHeight = LEG_LENGTH;
    const legWidth = LEG_WIDTH; 

    return (
        <View style={styles.legsRow}>
            {/* Right Leg (upper + lower) */}
            <View style={[styles.legColumn, {alignItems: "flex-end"}]}>
                <CanvasWrapper 
                    style={[
                        styles.canvasWrapper, 
                        { 
                            width: legWidth, 
                            height: legHeight, 
                            boxShadow: boxShadowColor 
                        }
                    ]}>
                    <ReactSketchCanvas
                    ref={rightUpperLegRef}
                    style={styles.canvas}
                    width={legWidth}
                    height={legHeight}
                    {...canvasProps}
                    />
                </CanvasWrapper>
                <CanvasWrapper 
                    style={[
                        styles.canvasWrapper, 
                        { 
                            width: legWidth, 
                            height: legHeight, 
                            boxShadow: boxShadowColor 
                        }
                    ]}>
                    <ReactSketchCanvas
                    ref={rightLowerLegRef}
                    style={styles.canvas}
                    width={legWidth}
                    height={legHeight}
                    {...canvasProps}
                    />
                </CanvasWrapper>
                
            </View>
            {/* Left Leg (upper + lower) */}
            <View style={[styles.legColumn, {alignItems: "flex-start"}]}>
                <CanvasWrapper 
                    style={[
                        styles.canvasWrapper, 
                        { 
                            width: legWidth, 
                            height: legHeight, 
                            boxShadow: boxShadowColor 
                        }
                    ]}>
                    <ReactSketchCanvas
                    ref={leftUpperLegRef}
                    style={styles.canvas}
                    width={legWidth}
                    height={legHeight}
                    {...canvasProps}
                    />
                </CanvasWrapper>
                <CanvasWrapper 
                    style={[
                        styles.canvasWrapper, 
                        { 
                            width: legWidth, 
                            height: legHeight, 
                            boxShadow: boxShadowColor 
                        }
                    ]}>
                    <ReactSketchCanvas
                    ref={leftLowerLegRef}
                    style={styles.canvas}
                    width={legWidth}
                    height={legHeight}
                    {...canvasProps}
                    />
                </CanvasWrapper>
            </View>
        </View>
    )
}

export default Legs

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
    legColumn: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2, 
    },

    legsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2, 
    },
})