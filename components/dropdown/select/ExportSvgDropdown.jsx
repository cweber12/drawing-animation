import { StyleSheet, Text, View, useColorScheme} from 'react-native'
import { Colors } from '../../../constants/Colors';
import React from 'react'
import OptionButton from '../../button/OptionButton';
import { IoCloudUploadOutline } from "react-icons/io5";
import { IoDownloadOutline } from "react-icons/io5";


const ExportSvgDropdown = ({
        style,
        onDownloadSvgToDevice,
        onUploadToS3, 

}) => {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;

    return (
        <View style={[ style, styles.exportOptionsContainer ]}>
            <OptionButton
                onPress={() => {onDownloadSvgToDevice && onDownloadSvgToDevice();}} >
                <IoDownloadOutline
                    size={24}
                    color={theme.actionButton} 
                /> 
                <Text 
                    style={[styles.text, { color: theme.text }]}> 
                    Download to Device </Text>        
            </OptionButton>
            
            <OptionButton
                onPress={() => {  onUploadToS3 && onUploadToS3();}}>
                <IoCloudUploadOutline
                    size={24}
                    color={theme.actionButton}
                />
                <Text 
                    style={[ styles.text,  { color: theme.text }]}>
                    Upload to S3</Text>
            </OptionButton>

        </View>
    )
}

export default ExportSvgDropdown

const styles = StyleSheet.create({
    
    exportOptionsContainer: {
        display: 'flex',
        width: '280px',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-end',
        textAlign: 'left',
        borderBottomLeftRadius: 8,
        padding: 0,
        gap: "0.2rem",
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
