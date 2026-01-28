import { View, StyleSheet, useColorScheme} from 'react-native'
import React, { useRef } from 'react';
import { ReactSketchCanvas } from 'react-sketch-canvas';
import CanvasWrapper from '../../themed_elements/ThemedCanvasWrapper';
import { Colors } from '../../../constants/Colors';

const Feet = ({ 
    canvasProps,
    rightFootId, 
    leftFootId,
    rightFootRef, 
    leftFootRef,  
    footWidth, 
    footLength,

}) => {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;

    return (
        <View style={styles.legsRow}>
            <CanvasWrapper 
                style={[ 
                    { 
                        width: footLength, 
                        height: footWidth, 
                    }
                ]}>
                <ReactSketchCanvas
                    id = {rightFootId}
                    ref={rightFootRef}
                    style={styles.canvas}
                    width={footLength}
                    height={footWidth}
                    {...canvasProps}
         
                />
            </CanvasWrapper>
            <CanvasWrapper 
                style={[
                    { 
                        width: footLength, 
                        height: footWidth, 
                    }
                ]}>
                <ReactSketchCanvas
                    id = {leftFootId}
                    ref={leftFootRef}
                    style={styles.canvas}
                    width={footLength}
                    height={footWidth}
                    {...canvasProps}
               
                />
            </CanvasWrapper>
        </View>
    )
}

export default Feet

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