// components/button_group/DetectHeaderIcons.jsx

import { StyleSheet, View } from 'react-native'
import React, { useEffect } from 'react'
import { LuInfo } from "react-icons/lu";
import { IoMdMenu } from "react-icons/io";
import { FaFileExport } from 'react-icons/fa';
import HeaderButton from '../button/HeaderButton';
import { useLandmarks } from '../../context/LandmarksContext';
import { MdOutlineSaveAs } from "react-icons/md";

/* Header buttons for the DetectPosePage
--------------------------------------------------------------------------------
Info: Opens info tab about DetectPosePage
Record: Starts pose detection recording
Stop: Stops pose detection recording
Export: Opens export options for saved landmarks
------------------------------------------------------------------------------*/
const CaptureHeaderButtons = ({ 
    onShowPoseInfo, 
    viewMode, 
    onHoverTitle,
    onToggleDetectOptions,
}) => {
    
    /* Landmarks context for determining when to show export button
    --------------------------------------------------------------------------*/
    const { processedRef, processedVersion } = useLandmarks();
    const [newLandmarks, setNewLandmarks] = React.useState([]);
    
    useEffect(() => {
        setNewLandmarks(processedRef?.current || []); 
        console.log('DetectHeaderIcons useEffect - processedVersion: ', processedVersion);
        console.log('DetectHeaderIcons useEffect - processedRef.current: ', processedRef?.current);
    }, [processedVersion]);
    
    return (
        <View style={styles.container}>



                {/* OPTIONS BUTTON --------------------------------------*/}
                <HeaderButton 
                    onPress={onToggleDetectOptions}
                    onHoverTitle={onHoverTitle}
                    title="OPTIONS" 
                >
                    <IoMdMenu />
                </HeaderButton>

                {/* INFO BUTTON -----------------------------------------*/}
                <HeaderButton 
                    onPress={onShowPoseInfo}
                    onHoverTitle={onHoverTitle}
                    title="INFO" 
                >
                    <LuInfo />
                </HeaderButton>
        </View>
    );
}

export default CaptureHeaderButtons;

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginLeft: 8,
    }

})