// components/button_group/detectPoseButtons.jsx

import { StyleSheet, View, useColorScheme, Text } from 'react-native'
import { FaStopCircle } from 'react-icons/fa';
import { BsRecordCircleFill } from "react-icons/bs";
import { BsPlayCircle } from "react-icons/bs";
import { RiBodyScanFill } from "react-icons/ri";
import HeaderButton from '../button/HeaderButton';
import { Colors } from '../../constants/Colors';


/* Header buttons for the DetectPosePage
--------------------------------------------------------------------------------
Info: Opens info tab about DetectPosePage
Record: Starts pose detection recording
Stop: Stops pose detection recording
Export: Opens export options for saved landmarks
------------------------------------------------------------------------------*/
const DetectToolButtons = ({ 
    onDetectionStarted, 
    onDetectionStopped, 
    isDetecting,
}) => {

    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;
          
    return (
        <View 
            style={{
                ...styles.container,
                backgroundColor: theme.listItemBackground,
                borderBottom: `1px solid ${theme.border}`,
                borderRight: `1px solid ${theme.border}`, 

            }}>
            <View style={styles.buttonRow}>
                <Text 
                    style={{
                        ...styles.buttonText, 
                        color: theme.icon
                        }} >{isDetecting ? 'STOP DETECTING' : 'START DETECTING'}</Text>                                            
                <HeaderButton 
                    onPress={isDetecting ? onDetectionStopped : onDetectionStarted}
                >
                    {isDetecting ? <FaStopCircle size={48} /> : <BsPlayCircle size={48} />}
                </HeaderButton>       
            </View>
                    
        </View>
    );
}

export default DetectToolButtons;

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center', 
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 8, 
    paddingLeft: 24, 
    paddingRight: 12,
    width: "100%",

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
    width: '100%',
  },

  buttonText: {
    fontSize: 20,
  },

})