import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Colors } from '../../../constants/Colors';
import { useColorScheme } from 'react-native';

const SketchInfo = () => {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light; 

  
    return (
    <View style={[
        styles.container,
        { 
            backgroundColor: theme.dropdownBackground, 
        }
    ]}>
        <Text style={{...styles.header, color: theme.text}}>Animating From Video</Text>
        <Text style={{...styles.text, color: theme.text}}>
            Press the green record button in the top right to start recording pose 
            data in the video. You can move to different parts of the video 
            before recording to only record a specific section. Press the red stop 
            button to finish recording and view the animation. 
        </Text>
        <Text style={{...styles.header, color: theme.text}}>Recording an Animation</Text>
        <Text style={{...styles.text, color: theme.text}}>
            Press the green play button in the top right to start recording pose 
            data from your webcam. Press the red stop button to finish recording and 
            view the animation.
        </Text>
        <Text style={{...styles.header, color: theme.text}}>Live Animation</Text>
        <Text style={{...styles.text, color: theme.text}}>
            Runs automatically using webcam input. No recording necessary.
        </Text>
    </View>
  )
}

export default SketchInfo

const styles = StyleSheet.create({
    container: {
        maxWidth: "30vw",
        zIndex: 10,
        backdropFilter: 'blur(6px)',
        padding: 12,
        borderBottomLeftRadius: 8,
    }, 

    header: {
        fontSize: 18,
        margin: 0,
    },

    text: {
        margin: 0,
        fontSize: 18,
    },

    listItem: {
        flexDirection: 'row', 
        alignItems: 'center',
        paddingVertical: 6,
    },
})
