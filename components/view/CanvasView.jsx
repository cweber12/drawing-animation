import { StyleSheet, Text, View, useColorScheme } from 'react-native'
import React from 'react'
import { Colors } from '../../constants/Colors';


const CanvasView = ({ style, children }) => {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;
    return (
        <View style={[
                style, 
                styles.canvasWrapper,
                { 
                    backgroundColor: theme.canvasBackground, 
                    borderColor: theme.border,
                    borderWidth: 1,
                }, 
            
            ]}>
            {children}
        </View>
        
    )
}

export default CanvasView

const styles = StyleSheet.create({
    canvasWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
})