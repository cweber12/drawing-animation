import { StyleSheet, useColorScheme} from 'react-native'
import React, { useRef } from 'react';
import { ReactSketchCanvas } from 'react-sketch-canvas';
import { SCREEN_WIDTH, CANVAS_BORDER_RADIUS } from '../../../constants/Sizes';
import CanvasView from '../../view/CanvasView';
import { Colors } from '../../../constants/Colors';
import { HEAD_SIZE } from '../../../constants/Sizes';

/* Component for the head drawing canvas
------------------------------------------------------------------------------*/
const Head = ( { 
    canvasProps, 
    canvasId,
    headRef, 
    headSize
} ) => {   

    // Get current theme colors
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;
  
    return (
        <CanvasView 
            style={[
                { 
                    width: headSize,
                    height: headSize,
                }
            ]}>

            <ReactSketchCanvas
                id={canvasId}
                ref={headRef}
                style={styles.canvas}
                width={headSize}
                height={headSize}
                {...canvasProps}
            />
        </CanvasView>
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

})

