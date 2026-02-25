// components/button_group/detectPoseButtons.jsx
import React, { useEffect } from 'react'
import { StyleSheet, View, useColorScheme, Text } from 'react-native'
import { FaStopCircle } from 'react-icons/fa';
import { BsRecordCircleFill } from "react-icons/bs";
import { BsPlayCircle } from "react-icons/bs";
import HeaderButton from '../button/HeaderButton';
import { Colors } from '../../constants/Colors';
import { RiReceiptLine, RiRecordCircleFill } from 'react-icons/ri';
import { useLandmarks } from '../../context/LandmarksContext';
import { MdOutlineSaveAs } from "react-icons/md";
import { RxReset } from "react-icons/rx";
import { IoSaveOutline } from "react-icons/io5";


/* Header buttons for the DetectPosePage
--------------------------------------------------------------------------------
Info: Opens info tab about DetectPosePage
Record: Starts pose detection recording
Stop: Stops pose detection recording
Export: Opens export options for saved landmarks
------------------------------------------------------------------------------*/
const CaptureToolButtons = ({ 
    onDetectionStarted, 
    onDetectionStopped, 
    isDetecting,
    onToggleExportOptions,
    onReset,
}) => {

    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;

    const { processedRef, processedVersion } = useLandmarks();
    const [newLandmarks, setNewLandmarks] = React.useState([]);
    
    useEffect(() => {
        setNewLandmarks(processedRef?.current || []); 
    }, [processedVersion]);
          
    return (
        
        <View 
            style={{
                ...styles.container,
                backgroundColor: theme.listItemBackground,
                borderBottom: `1px solid ${theme.border}`,
                borderRight: `1px solid ${theme.border}`, 

            }}>

            {!newLandmarks || newLandmarks.length === 0 && (
                <View style={styles.buttonRow}>
                    <Text 
                        style={{
                            ...styles.buttonText, 
                            color: theme.icon
                            }} >{isDetecting ? 'STOP CAPTURE' : 'START CAPTURE'}</Text>                                            
                    <HeaderButton 
                        onPress={isDetecting ? onDetectionStopped : onDetectionStarted}
                    >
                        {isDetecting ? <FaStopCircle size={48} /> : <RiRecordCircleFill size={48} />}
                    </HeaderButton>       
                </View>
            )}
            {newLandmarks && newLandmarks.length > 0 && (
                <>
                    <HeaderButton 
                        onPress={onReset}
                    >
                        <RxReset />
                    </HeaderButton>
                    <HeaderButton 
                        onPress={onToggleExportOptions}
                    >
                        <IoSaveOutline />
                    </HeaderButton>
                </>                        
            )}

                    
        </View>
    );
}

export default CaptureToolButtons;

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center', 
    justifyContent: 'space-between',
    paddingHorizontal: 24, 
    width: "100%",
    height: 60,

  },

  buttonColumn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
  },

  buttonRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 6,
  },

  buttonText: {
    fontSize: 20,
  },

})