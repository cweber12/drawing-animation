import { StyleSheet, Text, View, useColorScheme } from 'react-native'
import { Colors } from '../../../constants/Colors';
import React from 'react'
import OptionButton from '../../button/OptionButton';
import { IoCloudUploadOutline } from "react-icons/io5";
import { IoDownloadOutline } from "react-icons/io5";
import { downloadLandmarksToDevice} from '../../../utils/storage/storageUtils';
import { useLandmarks } from '../../../context/LandmarksContext';
import { uploadToS3 } from '../../../utils/storage/s3Utils';

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
                { 
                    backgroundColor: theme.listItemBackground, 
                    borderBottom: `1px solid ${theme.border}`, 
                    borderLeft: `1px solid ${theme.border}`,
                }
            ]}>
            <OptionButton
                onPress={() => downloadLandmarksToDevice(processedRef.current)}>
                <IoDownloadOutline
                    size={24}
                    color={theme.actionButton} 
                /> 
                <Text 
                    style={[styles.text, { color: theme.text }]}> 
                    Download to Device </Text>        
            </OptionButton>
            
            <OptionButton
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
            </OptionButton>

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
        backdropFilter: 'blur(6px)',
        position: 'absolute',
        top: 60,
        right: 0,
        zIndex: 10, 
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