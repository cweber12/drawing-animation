import { StyleSheet, Text, View, useColorScheme, TouchableOpacity} from 'react-native'
import { Colors } from '../../../constants/Colors';
import React from 'react'

const detectPoseDropdown = ({
        style, 
        onPickVideo, 
        setPoseView, 
        setSvgView,

}) => {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;

    return (
        <View style={[
            style,
            styles.poseOptionsContainer, 
            {backgroundColor: theme.navBackground}, 
            
            ]}>
            <TouchableOpacity
                style={styles.optionButton}  
                onPress={() => {
                    onPickVideo && onPickVideo();
                }}
            >
                <Text 
                    style={[
                        styles.text, 
                        { color: theme.text }
                    ]}>Select Video</Text>
        
            </TouchableOpacity>
            
            <TouchableOpacity 
                style={styles.optionButton}
                onPress={() => {
                    setPoseView && setPoseView();
                }}
            >
                <Text 
                    style={[
                        styles.text, 
                        { color: theme.text }
                    ]}>Record Animation</Text>
            </TouchableOpacity>

            <TouchableOpacity 
                style={styles.optionButton}
                onPress={() => {
                    setSvgView && setSvgView();
                }}
            >
            <Text 
            style={[
                styles.text, 
                { color: theme.text }
            ]}>Live Animation</Text>
            </TouchableOpacity>
        </View>
    )
}

export default detectPoseDropdown

const styles = StyleSheet.create({
    
    poseOptionsContainer: {
        display: 'flex',
        width: 'fit-content',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-end',
        textAlign: 'left',
        borderBottomLeftRadius: 8,
        padding: 0,
        gap: "0.2rem", 
    },

    optionButton: {
        flex: 1, 
        width: '100%', 
        textAlign: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: "1rem",
        paddingHorizontal: "3rem",
    },

    text: {
        fontSize: 20,
        fontWeight: '500',
    },
})