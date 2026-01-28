import { StyleSheet, Text, View, useColorScheme, TouchableOpacity} from 'react-native'
import { Colors } from '../../constants/Colors';
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
            styles.poseOptionsContainer, 
            {backgroundColor: theme.navBackground}, 
            style
            ]}>
            <TouchableOpacity
                style={styles.optionButton}  
                onPress={() => {
                    onPickVideo && onPickVideo();
                }}
            >
                <Text style={styles.text}>Select Video</Text>
        
            </TouchableOpacity>
            
            <TouchableOpacity 
                style={styles.optionButton}
                onPress={() => {
                    setPoseView && setPoseView();
                }}
            >
                <Text style={styles.text}>Record Animation</Text>
            </TouchableOpacity>

            <TouchableOpacity 
                style={styles.optionButton}
                onPress={() => {
                    setSvgView && setSvgView();
                }}
            >
            <Text style={styles.text}>Live Animation</Text>
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
        alignItems: 'flex-start',
        textAlign: 'left',
        borderBottomLeftRadius: 8,
        padding: "1rem",
        gap: "0.2rem"
    },

    optionButton: {
        flex: 1, 
        width: '100%', 
        textAlign: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 4,  
        paddingVertical: "1rem",
        paddingHorizontal: "1.5rem",
        color: '#362F4F',
        border: '1px solid #362F4F',
    },

    text: {
        fontSize: 20,
        fontWeight: '500',
    },
})