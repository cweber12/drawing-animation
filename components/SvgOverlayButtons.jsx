import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { TouchableOpacity, useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors';
import { FaCamera, FaStopCircle } from 'react-icons/fa';
import { BsRecordCircleFill } from "react-icons/bs";
import { ICON_SIZE } from '../constants/Sizes';

const SvgOverlayButtons = ({ 
    onToggleWebcam, 
    onDetectionStarted, 
    onDetectionStopped, 
    viewMode
}) => {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;
  
    return (
        <View style={styles.container}>
            <TouchableOpacity 
                style={styles.button} 
                onPress={onToggleWebcam}
            >
                <FaCamera size={ICON_SIZE} color={theme.button} />
            </TouchableOpacity>
            {viewMode === 'pose' && (
                <>
                    <TouchableOpacity 
                        style={styles.button} 
                        onPress={onDetectionStarted}
                    >
                        <BsRecordCircleFill size={ICON_SIZE} color={theme.button} />
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={styles.button} 
                        onPress={onDetectionStopped}
                    >
                        <FaStopCircle size={ICON_SIZE} color={theme.button} />
                    </TouchableOpacity>
                </>
            )}
        </View>
    );
}

export default SvgOverlayButtons

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