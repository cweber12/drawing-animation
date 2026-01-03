import { View, StyleSheet, useColorScheme} from 'react-native'
import React, { useRef } from 'react';
import { ReactSketchCanvas } from 'react-sketch-canvas';
import CanvasWrapper from '../../themed_elements/ThemedCanvasWrapper';
import { Colors } from '../../../constants/Colors';
import { 
    isSmallScreen,
    FOOT_LENGTH,
    FOOT_WIDTH,
} from '../../../constants/Sizes';  

const Feet = ({ rightFootRef, leftFootRef, canvasProps }) => {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;
    const boxShadowColor = `${theme.boxShadowColor} 0px 0px 6px -1px, 
                            ${theme.boxShadowColor} 0px 0px 4px -1px`;

    const footWidth = FOOT_LENGTH;
    const footHeight = FOOT_WIDTH;
    return (
        <View style={styles.legsRow}>
            <CanvasWrapper 
                style={[
                    styles.canvasWrapper, 
                    { 
                        width: footWidth, 
                        height: footHeight, 
                        boxShadow: boxShadowColor
                    }
                ]}>
                <ReactSketchCanvas
                    ref={rightFootRef}
                    style={styles.canvas}
                    width={footWidth}
                    height={footHeight}
                    {...canvasProps}
                />
            </CanvasWrapper>
            <CanvasWrapper 
                style={[
                    styles.canvasWrapper, 
                    { width: footWidth, height: footHeight, boxShadow: boxShadowColor}
                ]}>
                <ReactSketchCanvas
                    ref={leftFootRef}
                    style={styles.canvas}
                    width={footWidth}
                    height={footHeight}
                    {...canvasProps}
                />
            </CanvasWrapper>
        </View>
    )
}

export default Feet

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
    legsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2, 
    },
})