import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Colors } from '../../constants/Colors';
import { useColorScheme } from 'react-native';

const SketchInfo = () => {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light; 

  
    return (
    <View style={[
        styles.poseInfo,
        { 
            backgroundColor: "#DDDDDD", 
            color: theme.text
        }
    ]}>
        <Text style={styles.header}>Animating From Video</Text>
        <Text style={styles.text}>
            Press the green record button in the top right to start recording pose 
            data in the video. You can move to different parts of the video 
            before recording to only record a specific section. Press the red stop 
            button to finish recording and view the animation. 
        </Text>
        <Text style={styles.header}>Recording an Animation</Text>
        <Text style={styles.text}>
            Press the green play button in the top right to start recording pose 
            data from your webcam. Press the red stop button to finish recording and 
            view the animation.
        </Text>
        <Text style={styles.header}>Live Animation</Text>
        <Text style={styles.text}>
            Runs automatically using webcam input. No recording necessary.
        </Text>
    </View>
  )
}

export default SketchInfo

const styles = StyleSheet.create({
    poseInfo: {
        position: 'absolute',
        top: 10,
        right: 10,
        maxWidth: "30vw",
        padding: 10,
        zIndex: 1000,
    }, 

    header: {
        fontWeight: 'bold',
        fontSize: 24,
        marginBottom: "1rem",
    },

    text: {
        marginBottom: "1rem",
        fontSize: 20,
    },
})