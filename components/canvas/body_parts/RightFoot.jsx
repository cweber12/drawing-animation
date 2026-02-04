import { View, StyleSheet, useColorScheme} from 'react-native'
import React, { useRef } from 'react';
import { ReactSketchCanvas } from 'react-sketch-canvas';
import CanvasView from '../../view/CanvasView';
import { Colors } from '../../../constants/Colors';

const RightFoot = ({ 
    canvasProps,
    rightFootId, 
    rightFootRef, 
    footWidth, 
    footLength,

}) => {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;
    return (
            <CanvasView 
                style={[ 
                    { 
                        width: footWidth, 
                        height: footLength,
                    }
                ]}>
                <ReactSketchCanvas
                    id = {rightFootId}
                    ref={rightFootRef}
                    style={styles.canvas}
                    width={footWidth}
                    height={footLength}
                    {...canvasProps}
         
                />
            </CanvasView>
           

    )
}

export default RightFoot

const styles = StyleSheet.create({
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