import { StyleSheet, Text, View, useColorScheme, TouchableOpacity} from 'react-native'
import { Colors } from '../../constants/Colors';
import React from 'react'
import OptionButton from '../button/OptionButton';
import { FaFileVideo } from "react-icons/fa";
import { RiWebcamFill } from "react-icons/ri";
import { FaVideo } from "react-icons/fa";

const DetectOptions = ({
        style, 
        onPickVideo, 
        setPoseView, 
        setSvgView,

}) => {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;

    return (
        <View 
            style={[
                style,
                styles.poseOptionsContainer,
                {
                  borderBottom: `1px solid ${theme.border}`,
                  borderRight: `1px solid ${theme.border}`,
                } 
            ]}>
            <OptionButton
                onPress={() => {onPickVideo && onPickVideo();}} >
                <FaFileVideo
                    size={24}
                    color={theme.actionButton} 
                /> 
                <Text 
                    style={[styles.text, { color: theme.text }]}> 
                    Select Video </Text>        
            </OptionButton>
            
            <OptionButton
                onPress={() => {  setPoseView && setPoseView();}}>
                <FaVideo
                    size={24}
                    color={theme.actionButton}
                />
                <Text 
                    style={[ styles.text,  { color: theme.text }]}>
                    Record Animation</Text>
            </OptionButton>

            <OptionButton
                onPress={() => {
                    setSvgView && setSvgView();
                }}
            >
                <RiWebcamFill size={24} color={theme.actionButton}/>
                <Text 
                style={[
                    styles.text, 
                    { color: theme.text }
                ]}>Live Animation</Text>
            </OptionButton>
        </View>
    )
}

export default DetectOptions

const styles = StyleSheet.create({
    
    poseOptionsContainer: {
        display: 'flex',
        width: '280px',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-end',
        textAlign: 'left',
        padding: 0,
        backdropFilter: 'blur(6px)', 
    },

    optionButton: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        flex: 1, 
        width: '100%', 
        paddingVertical: "1rem",
        paddingHorizontal: "1rem",
    },

    text: {
        fontSize: 20,
        fontWeight: '500',
    },
})
