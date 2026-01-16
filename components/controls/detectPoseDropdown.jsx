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
            onPress={() => {
                onPickVideo && onPickVideo();
            }}
            >
                <Text 
                style={[
                    styles.optionButton, 
                    {color: theme.button}
                    ]}>Select Video
                </Text>
        
            </TouchableOpacity>
            
            <TouchableOpacity 
            onPress={() => {
                setPoseView && setPoseView();
            }}
            >
            <Text 
                style={[
                    styles.optionButton, 
                    {color: theme.button}
                    ]}>Record Animation
                </Text>
            </TouchableOpacity>

            <TouchableOpacity 
            onPress={() => {
                setSvgView && setSvgView();
            }}
            >
            <Text 
                style={[
                    styles.optionButton, 
                    {color: theme.button}
                    ]}>Live Animation
                </Text>
            </TouchableOpacity>
        </View>
    )
}

export default detectPoseDropdown

const styles = StyleSheet.create({
    poseOptionsContainer: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        textAlign: 'left',
        borderBottomLeftRadius: 8,
        padding: 8,
        gap: 8,
    },

    optionButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 4,
        backgroundColor: 'transparent',
    },
})