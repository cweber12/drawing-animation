import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { TouchableOpacity, useColorScheme } from 'react-native';
import { Colors } from '../../constants/Colors';
import { FaCamera, FaStopCircle } from 'react-icons/fa';
import { BsRecordCircleFill } from "react-icons/bs";
import { getIconSize } from '../../constants/Sizes';
import UploadS3 from '../buttons/UploadS3';
import { LuInfo } from "react-icons/lu";

const DetectPoseButtons = ({ 
    onDetectionStarted, 
    onDetectionStopped,
    onShowPoseInfo, 
    viewMode, 
    savedLandmarks, 
    isDetecting,
}) => {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;
  
    return (
        <View style={styles.container}>

            
            {viewMode === 'pose' && (
                <>
                    <TouchableOpacity 
                        style={styles.button} 
                        onPress={onShowPoseInfo}
                    >
                        <LuInfo size={getIconSize()} color={theme.actionButton} />
                    </TouchableOpacity>

                    {savedLandmarks && savedLandmarks.length > 0 && (
                        <UploadS3 
                            landmarks={savedLandmarks}
                            style={styles.button} 
                            svgs={null}
                            fileType="json"   
                        />
                    )}
                    {!isDetecting ? (
                    <TouchableOpacity 
                        style={styles.button} 
                        onPress={onDetectionStarted}
                    >
                        <BsRecordCircleFill size={getIconSize()} color={theme.actionButton} />
                    </TouchableOpacity>
                    ) : (
                    <TouchableOpacity 
                        style={styles.button} 
                        onPress={onDetectionStopped}
                    >
                        <FaStopCircle size={getIconSize()} color={theme.stopButton} />
                    </TouchableOpacity>
                    )}
                </>
            )}
        </View>
    );
}

export default DetectPoseButtons;

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginLeft: 8,
    },
    
    button: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 4,
        marginHorizontal: 2,
    },

    buttonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
})