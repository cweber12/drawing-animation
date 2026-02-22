// components/button_group/DetectHeaderIcons.jsx

import { StyleSheet, View } from 'react-native'
import React, { useEffect } from 'react'
import { LuInfo } from "react-icons/lu";
import { IoMdMenu } from "react-icons/io";
import { FaFileExport } from 'react-icons/fa';
import HeaderButton from '../button/HeaderButton';
import { useLandmarks } from '../../context/LandmarksContext';

/* Header buttons for the DetectPosePage
--------------------------------------------------------------------------------
Info: Opens info tab about DetectPosePage
Record: Starts pose detection recording
Stop: Stops pose detection recording
Export: Opens export options for saved landmarks
------------------------------------------------------------------------------*/
const DetectHeaderIcons = ({ 
    onShowPoseInfo, 
    viewMode, 
    onHoverTitle,
    onToggleDetectOptions,
    onToggleExportOptions,
}) => {
    
    /* Landmarks context for determining when to show export button
    --------------------------------------------------------------------------*/
    const { processedRef, processedVersion } = useLandmarks();
    const [newLandmarks, setNewLandmarks] = React.useState([]);
    const [newMedia, setNewMedia] = React.useState(null);
    
    useEffect(() => {
        setNewLandmarks(processedRef?.current || []); 
        console.log('DetectHeaderIcons useEffect - processedVersion: ', processedVersion);
        console.log('DetectHeaderIcons useEffect - processedRef.current: ', processedRef?.current);
    }, [processedVersion]);
    
    return (
        <View style={styles.container}>
            {viewMode === 'replay' && (
                <>

                    {/* OPTIONS BUTTON --------------------------------------*/}
                    <HeaderButton 
                        onPress={onToggleDetectOptions}
                        onHoverTitle={onHoverTitle}
                        title="OPTIONS" 
                    >
                        <IoMdMenu />
                    </HeaderButton>

                    {/* EXPORT BUTTON ---------------------------------------*/}
                    {newLandmarks && newLandmarks.length > 0 && (
                        <HeaderButton 
                            onPress={onToggleExportOptions}
                            onHoverTitle={onHoverTitle}
                            title="EXPORT" 
                        >
                            <FaFileExport />
                        </HeaderButton>                        
                    )}

                    {/* INFO BUTTON -----------------------------------------*/}
                    <HeaderButton 
                        onPress={onShowPoseInfo}
                        onHoverTitle={onHoverTitle}
                        title="INFO" 
                    >
                        <LuInfo />
                    </HeaderButton>
                </>
            )}
        </View>
    );
}

export default DetectHeaderIcons;

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginLeft: 8,
    }

})