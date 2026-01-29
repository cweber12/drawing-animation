import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Colors } from '../../constants/Colors';
import { useColorScheme } from 'react-native';

const SketchInfo = () => {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light; 

  
    return (
    <View style={[
        styles.sketchInfo,
        { 
            backgroundColor: "#DDDDDD", 
            color: theme.text
        }
    ]}>
        <Text style={styles.header}>Using Sketch Tools</Text>
        <Text style={styles.text}>
            Draw on the canvas using touch or mouse input. Strokes do not carry 
            over between body parts, each section is drawn independently.
        </Text>
        <Text style={styles.text}>
            Use the color picker to select different brush colors. Adjust brush size
            using the size slider.
        </Text>
        <Text style={styles.text}>
            Use the clear button to erase all canvases. 
        </Text>
        <Text style={styles.text}>
            Toggle the eraser to switch between drawing and erasing modes. 
        </Text>
        <Text style={styles.text}>
            When finished, select the running icon and select a detection mode to 
            animate the sketch.
        </Text>
        <Text>

        </Text>
    </View>
  )
}

export default SketchInfo

const styles = StyleSheet.create({
    sketchInfo: {
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