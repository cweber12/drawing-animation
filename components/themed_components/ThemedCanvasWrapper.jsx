import { StyleSheet, Text, View, useColorScheme } from 'react-native'
import React from 'react'
import { Colors } from '../../constants/Colors';


const CanvasWrapper = ({ style, children }) => {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;
    return (
        <View style={[
                style, 
                styles.canvasWrapper,
                { backgroundColor: theme.canvasBackground}, 
            
            ]}>
            {children}
        </View>
        
    )
}

export default CanvasWrapper

const styles = StyleSheet.create({
    canvasWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
})