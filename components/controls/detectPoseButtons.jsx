import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { TouchableOpacity, useColorScheme } from 'react-native';
import { Colors } from '../../constants/Colors';
import { FaCamera, FaStopCircle } from 'react-icons/fa';
import { BsRecordCircleFill } from "react-icons/bs";
import { getIconSize } from '../../constants/Sizes';

const DetectPoseButtons = ({ 
    onToggleWebcam, 
    onDetectionStarted, 
    onDetectionStopped, 
    viewMode, 
    showPoseAnimation,
}) => {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;
    // hides buttons that are not fully implemented yet
    const todo = true; 
  
    return (
        <View style={styles.container}>
            <TouchableOpacity 
                style={styles.button} 
                onPress={onToggleWebcam}
            >
                <FaCamera size={getIconSize()} color={theme.button} />
            </TouchableOpacity>
            {viewMode === 'pose' && (
                <>
                    <TouchableOpacity 
                        style={styles.button} 
                        onPress={onDetectionStarted}
                    >
                        <BsRecordCircleFill size={getIconSize()} color={theme.button} />
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={styles.button} 
                        onPress={onDetectionStopped}
                    >
                        <FaStopCircle size={getIconSize()} color={theme.button} />
                    </TouchableOpacity>
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
        marginRight: 8,
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