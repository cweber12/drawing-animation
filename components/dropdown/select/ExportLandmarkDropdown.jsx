import { StyleSheet, Text, View, useColorScheme } from 'react-native'
import { Colors } from '../../../constants/Colors';
import React from 'react'
import DropdownSelect from '../../button/DropdownSelect';
import { IoCloudUploadOutline } from "react-icons/io5";
import { IoDownloadOutline } from "react-icons/io5";
import { downloadLandmarksToDevice, uploadToS3 } from '../../../utils/storage/storageUtils';
import { useLandmarks } from '../../../context/LandmarksContext';

const ExportLandmarkDropdown = ({
        style,

}) => {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;

    const { processedRef } = useLandmarks();
    
    return (
        <View 
            style={[
                style,
                styles.exportOptionsContainer, 
            ]}>
            <DropdownSelect
                onPress={() => downloadLandmarksToDevice(processedRef.current)}>
                <IoDownloadOutline
                    size={24}
                    color={theme.actionButton} 
                /> 
                <Text 
                    style={[styles.text, { color: theme.text }]}> 
                    Download to Device </Text>        
            </DropdownSelect>
            
            <DropdownSelect
                onPress={() => { uploadToS3({ 
                    landmarks: processedRef.current, 
                    svgs: null, 
                    dataType: 'landmarks' 
                })}}>
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

export default ExportLandmarkDropdown

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