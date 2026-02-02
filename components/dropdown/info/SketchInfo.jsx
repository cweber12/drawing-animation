import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Colors } from '../../../constants/Colors';
import { useColorScheme } from 'react-native';
import { 
  FaPalette,
  FaTrashAlt, 
  FaFileExport,
  FaEraser, 
  FaChevronDown, 
  FaPencilAlt,
  FaTrash, FaCircle
} from 'react-icons/fa';
import { GiRaiseZombie } from "react-icons/gi";


const SketchInfo = () => {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light; 

  
    return (
    <View style={[
        styles.sketchInfo,
        { 
            backgroundColor: theme.controlsBackground, 
            color: theme.text,
            padding: '1rem',
            borderRadius: 10,
            boxShadow: `0 0 4px ${theme.title}`,
        }
    ]}>
        <Text style={styles.header}>Using Sketch Tools</Text>
        <View style={styles.listItem}>
            <FaPencilAlt size={42} color={theme.text} />
            <Text style={styles.text}>
                Draw on the canvas using touch or mouse input. Strokes do not carry 
                over between body parts, each section is drawn independently.
            </Text>
        </View>
        <View style={styles.listItem}>
            <FaPalette size={42} color={theme.text} />
            <Text style={styles.text}>
                Open color picker to select stroke color.
            </Text>
        </View>
        <View style={styles.listItem}>
            <FaCircle size={42} color={theme.text} />

        <Text style={styles.text}>   
             Oper brush size slider to adjust stroke width.
        </Text>
        </View>
        <View style={styles.listItem}>
            <FaTrashAlt size={42} color={theme.text} />

        <Text style={styles.text}>
            Use the clear button to erase all canvases. 
        </Text>
        </View>
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
        top: 20,
        right: 10,
        maxWidth: "30vw",
        padding: 10,
        zIndex: 1000,
    }, 

    header: {
        fontWeight: 'bold',
        fontSize: 24,
        marginBottom: "1rem",
        textDecoration: 'underline',
    },

    text: {
        marginBottom: "1rem",
        fontSize: 20,
    },

    listItem: {
        flexDirection: 'row', 
        alignItems: 'center', 
        marginBottom: '1rem', 
        gap: '1rem', 
    },

    inconColumn: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
    },
})