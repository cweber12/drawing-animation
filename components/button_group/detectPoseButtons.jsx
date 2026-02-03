// components/button_group/detectPoseButtons.jsx

import { StyleSheet, View } from 'react-native'
import React from 'react'
import { FaStopCircle } from 'react-icons/fa';
import { BsRecordCircleFill } from "react-icons/bs";
import { LuInfo } from "react-icons/lu";
import { FaFileExport } from 'react-icons/fa';
import HeaderButton from '../button/HeaderButton';

/* Header buttons for the DetectPosePage
--------------------------------------------------------------------------------
Info: Opens info tab about DetectPosePage
Record: Starts pose detection recording
Stop: Stops pose detection recording
Export: Opens export options for saved landmarks
------------------------------------------------------------------------------*/
const DetectPoseButtons = ({ 
    onDetectionStarted, 
    onDetectionStopped,
    onShowPoseInfo, 
    viewMode, 
    savedLandmarks, 
    isDetecting,
    onHoverTitle,
    onToggleExportOptions,
}) => {

    return (
        <View style={styles.container}>
            {viewMode === 'pose' && (
                <>
                    {/* INFO BUTTON -----------------------------------------*/}
                    <HeaderButton 
                        onPress={onShowPoseInfo}
                        onHoverTitle={onHoverTitle}
                        title="INFO" 
                    >
                        <LuInfo />
                    </HeaderButton>

                    {/* EXPORT BUTTON ---------------------------------------*/}
                    {savedLandmarks && savedLandmarks.length > 0 && (
                        <HeaderButton 
                            onPress={onToggleExportOptions}
                            onHoverTitle={onHoverTitle}
                            title="EXPORT" 
                        >
                            <FaFileExport />
                        </HeaderButton>                        
                    )}

                    {/* RECORD / STOP BUTTON --------------------------------*/}
                    {!isDetecting ? (
                    <HeaderButton 
                        onPress={onDetectionStarted}
                        onHoverTitle={onHoverTitle}
                        title="RECORD"
                     >
                        <BsRecordCircleFill />
                    </HeaderButton>
                    ) : (
                    <HeaderButton 
                        onPress={onDetectionStopped}
                        onHoverTitle={onHoverTitle}
                        title="STOP"
                     >
                        <FaStopCircle />
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
    }

})