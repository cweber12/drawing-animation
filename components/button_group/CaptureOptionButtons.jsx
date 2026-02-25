import { StyleSheet, Text, View, useColorScheme, TouchableOpacity} from 'react-native'
import { Colors } from '../../constants/Colors';
import React from 'react'
import OptionButton from '../button/OptionButton';
import { FaFileVideo } from "react-icons/fa";
import { RiWebcamFill } from "react-icons/ri";
import { FaVideo } from "react-icons/fa";
import { BsFiletypeMp4 } from "react-icons/bs";
import { CiVideoOn } from "react-icons/ci";
import { BsWebcam } from "react-icons/bs";
import { BsPersonVideo } from "react-icons/bs";
import { BsRecordBtn } from "react-icons/bs";



const CaptureOptionButtons = ({
    style, 
    onPickVideo, 
    setReplay, 
    setLive,

}) => {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;


    return (
        <View 
            style={[
                style,
                styles.poseOptionsContainer,
                { borderBottom: `1px solid ${theme.border}`,
                  borderRight: `1px solid ${theme.border}` } 
            ]}>
            <OptionButton
                onPress={() => {onPickVideo && onPickVideo();}} >
                <BsFiletypeMp4 size={24} color={theme.icon} /> 
                <Text 
                    style={[styles.text, { color: theme.text }]}> 
                    Select Video </Text>        
            </OptionButton>
            
            <OptionButton
                onPress={() => {  setReplay && setReplay();}}>
                <BsRecordBtn size={24} color={theme.icon} />
                <Text style={[ styles.text, { color: theme.text }]}>
                    Record Video</Text>
            </OptionButton>

            <OptionButton
                onPress={() => { setLive && setLive(); }}>
                <BsWebcam size={24} color={theme.icon}/>
                <Text style={[ styles.text, { color: theme.text } ]}>
                    Live Webcam</Text>
            </OptionButton>
        </View>
    )
}

export default CaptureOptionButtons

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

    text: {
        fontSize: 18,
    },
})
