import { StyleSheet, Text, View, useColorScheme, TouchableOpacity} from 'react-native'
import { Colors } from '../../../constants/Colors';
import React from 'react'
import DropdownSelect from '../../button/DropdownSelect';
import { FaFileVideo } from "react-icons/fa";
import { RiWebcamFill } from "react-icons/ri";
import { FaVideo } from "react-icons/fa";

const DetectPoseDropdown = ({
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
            ]}>
            <DropdownSelect
                onPress={() => {onPickVideo && onPickVideo();}} >
                <FaFileVideo
                    size={24}
                    color={theme.actionButton} 
                /> 
                <Text 
                    style={[styles.text, { color: theme.text }]}> 
                    Select Video </Text>        
            </DropdownSelect>
            
            <DropdownSelect
                onPress={() => {  setPoseView && setPoseView();}}>
                <FaVideo
                    size={24}
                    color={theme.actionButton}
                />
                <Text 
                    style={[ styles.text,  { color: theme.text }]}>
                    Record Animation</Text>
            </DropdownSelect>

            <DropdownSelect
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
            </DropdownSelect>
        </View>
    )
}

export default DetectPoseDropdown

const styles = StyleSheet.create({
    
    poseOptionsContainer: {
        display: 'flex',
        width: '280px',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-end',
        textAlign: 'left',
        borderBottomLeftRadius: 8,
        padding: 0,
        gap: "0.2rem",
        backgroundColor: 'rgba(0,0,0,0.25)',
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
