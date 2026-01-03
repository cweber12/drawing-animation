import { StyleSheet, useColorScheme} from 'react-native'
import React, { useRef } from 'react';
import { ReactSketchCanvas } from 'react-sketch-canvas';
import { SCREEN_WIDTH, CANVAS_BORDER_RADIUS } from '../../../constants/Sizes';
import CanvasWrapper from '../../themed_elements/ThemedCanvasWrapper';
import { Colors } from '../../../constants/Colors';

/* Component for the head drawing canvas
------------------------------------------------------------------------------*/
const Head = ( canvasProps) => {   
    // Ref for the head canvas
    const headRef = useRef(null);

    // Determine canvas dimensions based on screen size
    const smallScreenDimensions = SCREEN_WIDTH * 0.25
    const largeScreenDimensions = SCREEN_WIDTH * 0.15

    // Get current theme colors
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;
    const boxShadowColor = `${theme.boxShadowColor} 0px 0px 6px -1px, 
                            ${theme.boxShadowColor} 0px 0px 4px -1px`;

    return (
        <CanvasWrapper 
            style={[
                styles.canvasWrapper, 
                styles.head, 
                { 
                    width: SCREEN_WIDTH < 600 ? 
                        smallScreenDimensions : largeScreenDimensions, 
                    height: SCREEN_WIDTH < 600 ? 
                        smallScreenDimensions : largeScreenDimensions, 
                    boxShadow: boxShadowColor,
                    borderRadius: CANVAS_BORDER_RADIUS, 
                }
            ]}>

            <ReactSketchCanvas
            ref={headRef}
            style={styles.canvas}
            width={SCREEN_WIDTH < 600 ? 
                smallScreenDimensions : largeScreenDimensions}
            height={SCREEN_WIDTH < 600 ? 
                smallScreenDimensions : largeScreenDimensions}
            {...canvasProps}
            />
        </CanvasWrapper>
    )
}

export default Head

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
    head: {
        borderRadius: 50,
    },

})

