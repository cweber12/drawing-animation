import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Colors } from '../../../constants/Colors';
import { useColorScheme } from 'react-native';
import { 
  FaTrashAlt, 
  FaEraser, 
  FaPencilAlt,
  FaCircle, 
  FaMinus,
} from 'react-icons/fa';
import { GiRaiseZombie } from "react-icons/gi";
import { FaGear } from "react-icons/fa6";
import { LuInfo } from "react-icons/lu";


const SketchInfo = ({ setShowSketchInfo }) => {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light; 

    const iconSize = 32;
  
    return (
    <View 
        style={[
            styles.sketchInfo,
            { backgroundColor: theme.dropdownBackground, color: theme.text }
        ]}>
        <View style={[styles.listItem, {marginTop: 0}]}>
            <LuInfo size={iconSize} color={theme.text} />
            <Text style={[styles.header, {color: theme.text}]}>
                Info 
            </Text>
            <FaMinus 
                size={24} 
                style={{ cursor: 'pointer', marginLeft: 'auto' }}
                onClick={() => setShowSketchInfo(false)}
            />
        </View>

        <Text style={[styles.text, {color: theme.text}]}>
            Draw on the canvas using touch or mouse input. Strokes do not carry 
            over between body parts, each section is drawn independently.
        </Text>

        <View style={styles.listItem}>
            <FaTrashAlt size={iconSize} color={theme.actionButton} />
            <Text style={[styles.text, {color: theme.text}]}>
                Clear all canvases 
            </Text>
        </View>
        <View style={styles.listItem}>
            <FaCircle size={iconSize} color={theme.actionButton} />
            <Text style={[styles.text, {color: theme.text}]}>
                Export the current sketch as an SVG file
            </Text>
        </View>

        <View style={styles.listItem}>
            <FaEraser size={iconSize} color={theme.actionButton} />
            <Text style={[styles.text, {color: theme.text}]}>
                Set the brush to erase mode
            </Text>
        </View>
        <View style={styles.listItem}>
            <FaPencilAlt size={iconSize} color={theme.actionButton} />
            <Text style={[styles.text, {color: theme.text}]}>
                Set the brush to sketch mode
            </Text>
        </View>
        <View style={styles.listItem}>
            <FaGear size={iconSize} color={theme.actionButton} />
            <Text style={[styles.text, {color: theme.text}]}>
                Open brush size and color controls
            </Text>
        </View>
        <View style={styles.listItem}>
            <GiRaiseZombie size={iconSize} color={theme.actionButton} />
            <Text style={[styles.text, {color: theme.text}]}>
                Open pose detection options to animate the sketch
            </Text>
        </View>
        <Text style={[styles.text, {color: theme.text}]}>
            Select Video: Uses a video file as input for pose detection and sketch animation.
        </Text>
        <Text style={[styles.text, {color: theme.text}]}>
            Record Animation: Records pose data from your webcam to animate the sketch.
        </Text>
        <Text style={[styles.text, {color: theme.text}]}>
            Live Animation: Uses your webcam as input for live pose detection and sketch animation.
        </Text>
    </View>
  )
}

export default SketchInfo

const styles = StyleSheet.create({
    sketchInfo: {
        position: 'absolute',
        top: 20,
        right: 0,
        maxWidth: "30vw",
        padding: 10,
        zIndex: 1000,
        backdropFilter: 'blur(6px)',
        padding: '1rem',
        borderBottomLeftRadius: 10,
    }, 

    header: {
        fontWeight: 'bold',
        fontSize: 24,
        margin: 0,
    },

    text: {
        margin: 0,
        fontSize: 20,
    },

    listItem: {
        flexDirection: 'row', 
        alignItems: 'center',
        marginBottom: '1rem',
        marginTop: '1rem', 
        gap: '1rem', 
    },

    inconColumn: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
    },
})