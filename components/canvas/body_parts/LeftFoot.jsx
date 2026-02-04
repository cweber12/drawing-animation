import { View, StyleSheet, useColorScheme} from 'react-native'
import React, { useRef } from 'react';
import { ReactSketchCanvas } from 'react-sketch-canvas';
import CanvasView from '../../view/CanvasView';
import { Colors } from '../../../constants/Colors';

const LeftFoot = ({ 
    canvasProps,
    leftFootId,
    leftFootRef,  
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
                    id = {leftFootId}
                    ref={leftFootRef}
                    style={styles.canvas}
                    width={footWidth}
                    height={footLength}
                    {...canvasProps}
               
                />
            </CanvasView>
    )
}

export default LeftFoot

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
