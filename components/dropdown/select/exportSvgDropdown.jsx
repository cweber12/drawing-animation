import { StyleSheet, Text, View, useColorScheme, TouchableOpacity} from 'react-native'
import { Colors } from '../../../constants/Colors';
import React from 'react'
import DropdownSelect from '../../button/DropdownSelect';
import { FaFileVideo } from "react-icons/fa";
import { IoCloudUploadOutline } from "react-icons/io5";
import { IoDownloadOutline } from "react-icons/io5";
import { downloadSvgToDevice } from '../../../utils/storageUtils';
import { uploadToS3 } from '../../../utils/s3Utils';

const ExportSvgDropdown = ({
        style,
        downloadSvgToDevice,
        uploadToS3, 

}) => {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;

    return (
        <View 
            style={[
                style,
                styles.exportOptionsContainer, 
            ]}>
            <DropdownSelect
                onPress={() => {downloadSvgToDevice && downloadSvgToDevice();}} >
                <IoDownloadOutline
                    size={24}
                    color={theme.actionButton} 
                /> 
                <Text 
                    style={[styles.text, { color: theme.text }]}> 
                    Download to Device </Text>        
            </DropdownSelect>
            
            <DropdownSelect
                onPress={() => {  uploadToS3 && uploadToS3();}}>
                <IoCloudUploadOutline
                    size={24}
                    color={theme.actionButton}
                />
                <Text 
                    style={[ styles.text,  { color: theme.text }]}>
                    Upload to S3</Text>
            </DropdownSelect>

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