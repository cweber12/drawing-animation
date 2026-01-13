import { StyleSheet, useColorScheme} from 'react-native'
import React, { useRef } from 'react';
import { ReactSketchCanvas } from 'react-sketch-canvas';
import { SCREEN_WIDTH, SCREEN_HEIGHT, CANVAS_BORDER_RADIUS} from '../../../constants/Sizes';
import CanvasWrapper from '../../themed_elements/ThemedCanvasWrapper';
import { Colors } from '../../../constants/Colors';
import { TORSO_WIDTH, TORSO_HEIGHT } from '../../../constants/Sizes';

const Torso = ( { 
    canvasProps,
    torsoId, 
    torsoRef,
    torsoWidth,
    torsoHeight, 

} ) => {

    // Get current theme colors
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;
    const boxShadowColor = `${theme.boxShadowColor} 0px 0px 6px -1px, 
                            ${theme.boxShadowColor} 0px 0px 4px -1px`;
    return (
        <CanvasWrapper 
            style={[
                styles.canvasWrapper, 
                { 
                    width: torsoWidth, 
                    height: torsoHeight, 
                    boxShadow: boxShadowColor,
                }
            ]}>
            <ReactSketchCanvas
                id={torsoId}
                ref={torsoRef}
                style={styles.canvas}
                width={torsoWidth}
                height={torsoHeight}
                {...canvasProps}

            />
        </CanvasWrapper>
    )
}

export default Torso

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

})