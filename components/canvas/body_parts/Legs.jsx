import { View, StyleSheet, useColorScheme} from 'react-native'
import React, { useRef } from 'react';
import { ReactSketchCanvas } from 'react-sketch-canvas';
import CanvasWrapper from '../../themed_components/ThemedCanvasWrapper';
import { Colors } from '../../../constants/Colors';
import { 
    isSmallScreen,
    LEG_LENGTH,
    LEG_WIDTH,
} from '../../../constants/Sizes';  

const Legs = ( {
    canvasProps, 
    rightUpperLegId,
    rightLowerLegId,
    leftUpperLegId,
    leftLowerLegId,
    rightUpperLegRef, 
    rightLowerLegRef, 
    leftUpperLegRef, 
    leftLowerLegRef, 
    legWidth,
    legLength,

} ) => {

    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;
    const boxShadowColor = `${theme.boxShadowColor} 0px 0px 6px -1px, 
                            ${theme.boxShadowColor} 0px 0px 4px -1px`;

    return (
        <View style={styles.legsRow}>
            {/* Right Leg (upper + lower) */}
            <View style={[styles.legColumn, {alignItems: "flex-end"}]}>
                <CanvasWrapper 
                    style={[
                        { 
                            width: legWidth, 
                            height: legLength, 
                        }
                    ]}>
                    <ReactSketchCanvas
                    id={rightUpperLegId}
                    ref={rightUpperLegRef}
                    style={styles.canvas}
                    width={legWidth}
                    height={legLength}
                    {...canvasProps}
           

                    />
                </CanvasWrapper>
                <CanvasWrapper 
                    style={[
                        { 
                            width: legWidth, 
                            height: legLength, 
                        }
                    ]}>
                    <ReactSketchCanvas
                    id={rightLowerLegId}
                    ref={rightLowerLegRef}
                    style={styles.canvas}
                    width={legWidth}
                    height={legLength}
                    {...canvasProps}
             
                    />
                </CanvasWrapper>
                
            </View>
            {/* Left Leg (upper + lower) */}
            <View style={[styles.legColumn, {alignItems: "flex-start"}]}>
                <CanvasWrapper 
                    style={[
                        { 
                            width: legWidth, 
                            height: legLength, 
                        }
                    ]}>
                    <ReactSketchCanvas
                    id={leftUpperLegId}
                    ref={leftUpperLegRef}
                    style={styles.canvas}
                    width={legWidth}
                    height={legLength}
                    {...canvasProps}
             
                    />
                </CanvasWrapper>
                <CanvasWrapper 
                    style={[
                        { 
                            width: legWidth, 
                            height: legLength, 
                        }
                    ]}>
                    <ReactSketchCanvas
                    id={leftLowerLegId}
                    ref={leftLowerLegRef}
                    style={styles.canvas}
                    width={legWidth}
                    height={legLength}
                    {...canvasProps}
            
                    />
                </CanvasWrapper>
            </View>
        </View>
    )
}

export default Legs

const styles = StyleSheet.create({
    
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