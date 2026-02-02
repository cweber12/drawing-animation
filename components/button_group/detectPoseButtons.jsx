import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { TouchableOpacity, useColorScheme } from 'react-native';
import { Colors } from '../../constants/Colors';
import { FaCamera, FaStopCircle } from 'react-icons/fa';
import { BsRecordCircleFill } from "react-icons/bs";
import { getIconSize } from '../../constants/Sizes';
import { uploadToS3 } from '../../utils/s3Utils'; 
import { LuInfo } from "react-icons/lu";
import { FaFileExport } from 'react-icons/fa';
import HeaderButton from '../button/HeaderButton';
import { record } from 'aws-amplify/analytics';

const DetectPoseButtons = ({ 
    onDetectionStarted, 
    onDetectionStopped,
    onShowPoseInfo, 
    viewMode, 
    savedLandmarks, 
    isDetecting,
    onHoverTitle,
}) => {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;
    const [hoveredExport, setHoveredExport] = React.useState(false);
    const [hoveredInfo, setHoveredInfo] = React.useState(false);
    const [hoveredRecord, setHoveredRecord] = React.useState(false);
    const [hoveredStop, setHoveredStop] = React.useState(false);

    return (
        <View style={styles.container}>
            {viewMode === 'pose' && (
                <>
                    <HeaderButton
                        style={styles.button} 
                        onPress={onShowPoseInfo}
                        onMouseEnter={() => setHoveredInfo(true)}
                        onMouseLeave={() => setHoveredInfo(false)}
                    >
                        <LuInfo 
                        size={getIconSize()} 
                        color={hoveredInfo ? theme.button : theme.text} />
                    </HeaderButton>

                    {savedLandmarks && savedLandmarks.length > 0 && (
                        <HeaderButton
                                onPress={async () => uploadToS3({
                                    landmarks: savedLandmarks,
                                    svgs: null,
                                    fileType: "json",
                                })}
                                onMouseEnter={() => {
                                  onHoverTitle && onHoverTitle('Export All Sketches')
                                  setHoveredExport(true);
                                }}
                                onMouseLeave={() => {
                                  onHoverTitle && onHoverTitle('Sketch')
                                  setHoveredExport(false);
                                }}
                                disabled={false}
                              >
                                <FaFileExport
                                  size={getIconSize()}
                                  color={hoveredExport ? theme.button : theme.text}
                                />
                              </HeaderButton>
                        
                    )}
                    {!isDetecting ? (
                    <HeaderButton 
                        style={styles.button} 
                        size={getIconSize() * 1.5}
                        onPress={onDetectionStarted}
                        onMouseEnter={() => setHoveredRecord(true)}
                        onMouseLeave={() => setHoveredRecord(false)}
                    >
                        <BsRecordCircleFill 
                        size={getIconSize()} 
                        color={hoveredRecord ? theme.button : theme.text} />
                    </HeaderButton>
                    ) : (
                    <HeaderButton 
                        style={styles.button}
                        size={getIconSize() * 1.5} 
                        onPress={onDetectionStopped}
                        onMouseEnter={() => setHoveredStop(true)}
                        onMouseLeave={() => setHoveredStop(false)}
                    >
                        <FaStopCircle 
                        size={getIconSize()} 
                        color={hoveredStop ? theme.button : theme.text} />
                    </HeaderButton>
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