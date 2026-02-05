
/* SketchPage.jsx
--------------------------------------------------------------------------------
Main drawing interface for sketching, editing, and exporting SVG body parts.
------------------------------------------------------------------------------*/

/* Import libraries
-----------------------------------------------------------------------------*/
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, useWindowDimensions, useColorScheme, } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter, useNavigation } from 'expo-router';

/* Import constants
-----------------------------------------------------------------------------*/
import { CANVAS_LANDMARK_MAP} from '../constants/landmarkData';
import ThemedView from '../components/view/ThemedView';
import { Colors } from '../constants/Colors';
import { getSvgSizes } from '../constants/Sizes';

/* Import components
-----------------------------------------------------------------------------*/
import Head from '../components/canvas/body_parts/Head';
import Torso from '../components/canvas/body_parts/Torso';
import RightArm from '../components/canvas/body_parts/RightArm';
import LeftArm from '../components/canvas/body_parts/LeftArm';
import Legs from '../components/canvas/body_parts/Legs';
import LeftFoot from '../components/canvas/body_parts/LeftFoot';
import RightFoot from '../components/canvas/body_parts/RightFoot';
import SketchInfo from '../components/dropdown/info/SketchInfo';
import SketchControls from '../components/dropdown/sketch_controls/SketchControls';
import ExportSvgDropdown from '../components/dropdown/select/ExportSvgDropdown';
import DetectPoseDropdown from '../components/dropdown/select/DetectPoseDropdown';
/* Import utils
-----------------------------------------------------------------------------*/
import { uploadToS3 } from '../utils/s3Utils';
import { downloadSvgToDevice } from '../utils/storageUtils';

const SketchPage = () => {
    
    /* =========================================================================
                                CONSTANTS
    ==========================================================================*/
    
    /* Navigation and routing 
    --------------------------------------------------------------------------*/
    const router = useRouter();
    const navigation = useNavigation();

    /* Dynamic sizing based on screen dimensions
    --------------------------------------------------------------------------*/
    const { width, height } = useWindowDimensions();
    const [sizes, setSizes] = useState(getSvgSizes(height));
    const [armsDown, setArmsDown] = useState(true);

    useEffect(() => {
        setSizes(getSvgSizes(height));
        console.log('total width: ', sizes.TOTAL_WIDTH, 'screen width: ', width, 'armsDown: ', armsDown);
        if (sizes.TOTAL_WIDTH > width) {
            if (!armsDown) {
                setArmsDown(true);
                clearArms();
            }

        } else {            
            if (armsDown) {
                setArmsDown(false);
                clearArms();
            }
        }
    }, [height, sizes.TOTAL_WIDTH, width]);

    /* Get current color scheme and theme (light/dark)
    --------------------------------------------------------------------------*/
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;
    
    /*==========================================================================
                                    STATES
    ==========================================================================*/
    
    /* Drawing states
    --------------------------------------------------------------------------*/
    const [selectedColor, setSelectedColor] = useState(theme.svgStrokeColor);
    const [strokeWidth, setStrokeWidth] = useState(20);  
    const [erase, setErase] = useState(false);

    /* Dropdown visibility states
    --------------------------------------------------------------------------*/
    const [showDetectPoseOptions, setShowDetectPoseOptions] = useState(false);
    const [showSketchControls, setShowSketchControls] = useState(false);
    const [showSketchInfo, setShowSketchInfo] = useState(false);
    const [showExportOptions, setShowExportOptions] = useState(false);

    /* SVG data state for upload/download
    --------------------------------------------------------------------------*/
    const [svgData, setSvgData] = useState(null);
    const [viewMode, setViewMode] = useState('svg'); 
    
    /* =========================================================================
                                    REFS
    ==========================================================================*/
    
    /* Refs for body part canvases
    --------------------------------------------------------------------------*/
    const bodySvgsRef = useRef({}); 
    const headRef = useRef(null);
    const torsoRef = useRef(null);
    const rightUpperArmRef = useRef(null);
    const rightLowerArmRef = useRef(null);
    const rightHandRef = useRef(null);
    const leftUpperArmRef = useRef(null);
    const leftLowerArmRef = useRef(null);
    const leftHandRef = useRef(null);
    const rightUpperLegRef = useRef(null);
    const rightLowerLegRef = useRef(null);
    const rightFootRef = useRef(null);
    const leftUpperLegRef = useRef(null);
    const leftLowerLegRef = useRef(null);
    const leftFootRef = useRef(null);

    
    /* =========================================================================
                                    CALLBACKS
    ==========================================================================*/
    
    /* Toggle options for detect pose (upload video, record, or live)
    --------------------------------------------------------------------------*/
    const toggleDetectPoseOptions = useCallback(() => {
        console.log('SketchPage: Toggling detect pose options: ', showDetectPoseOptions);
        setShowSketchControls(false);
        setShowExportOptions(false);
        setShowSketchInfo(false);
        setShowDetectPoseOptions(prev => !prev);
    }, []);

    /* Toggle sketch settings (brush size, color picker)
    --------------------------------------------------------------------------*/
    const toggleSettings = useCallback(() => {
        console.log('SketchPage: Toggling sketch settings: ', showSketchControls);
        setShowDetectPoseOptions(false);
        setShowExportOptions(false);
        setShowSketchInfo(false);
        setShowSketchControls(prev => !prev);
    }, []);

    /* Toggle export options (upload to S3, download to device)
    --------------------------------------------------------------------------*/
    const toggleExportOptions = useCallback(() => {
        setShowDetectPoseOptions(false);
        setShowSketchControls(false);
        setShowSketchInfo(false);
        setShowExportOptions(prev => {
            console.log('SketchPage: Toggling export options: ', !prev);
            return !prev;
        });
    }, []);

    /* Clear arm canvases (used when toggling arm positions)
    --------------------------------------------------------------------------*/
    const clearArms = useCallback(() => {
        rightUpperArmRef.current?.clearCanvas();
        rightLowerArmRef.current?.clearCanvas();
        rightHandRef.current?.clearCanvas();
        leftUpperArmRef.current?.clearCanvas();
        leftLowerArmRef.current?.clearCanvas();
        leftHandRef.current?.clearCanvas();
    }, []);

     /* Clear all canvases (reset) 
    --------------------------------------------------------------------------*/
    const clearAll = useCallback(() => {
        headRef.current?.clearCanvas();
        torsoRef.current?.clearCanvas();
        rightUpperArmRef.current?.clearCanvas();
        rightLowerArmRef.current?.clearCanvas();
        rightHandRef.current?.clearCanvas();
        leftUpperArmRef.current?.clearCanvas();
        leftLowerArmRef.current?.clearCanvas();
        leftHandRef.current?.clearCanvas();
        rightUpperLegRef.current?.clearCanvas();
        rightLowerLegRef.current?.clearCanvas();
        rightFootRef.current?.clearCanvas();
        leftUpperLegRef.current?.clearCanvas();
        leftLowerLegRef.current?.clearCanvas();
        leftFootRef.current?.clearCanvas();
        bodySvgsRef.current = {};
    }, []);

    /* Save all SVGs from body part canvases
    --------------------------------------------------------------------------*/
    const saveAll = useCallback(async () => {
        try {
            const refs = {           
            rightUpperLeg: rightUpperLegRef,
            rightLowerLeg: rightLowerLegRef,
            rightFoot: rightFootRef,
            leftUpperLeg: leftUpperLegRef,
            leftLowerLeg: leftLowerLegRef,
            leftFoot: leftFootRef,
            torso: torsoRef,
            head: headRef,
            rightUpperArm: rightUpperArmRef,
            leftUpperArm: leftUpperArmRef,
            rightLowerArm: rightLowerArmRef,
            rightHand: rightHandRef,
            leftLowerArm: leftLowerArmRef,
            leftHand: leftHandRef,
            };

            const svgs = {};
            for (const [key, ref] of Object.entries(refs)) {
            if (ref.current?.exportSvg) {
                const svgString = await ref.current.exportSvg();
                svgs[key] = svgString;
                console.log(`sketchPage: Saved SVG for ${key}`);
            } else {
                svgs[key] = null;
                console.log(`sketchPage: No SVG for ${key}`);
            }
            }

            bodySvgsRef.current = svgs;
            return svgs;
        } catch (e) {
            console.error('sketchPage: Error saving SVGs:', e);
            return null;
        }
    }, []);

    /* Handle upload SVGs to S3
    --------------------------------------------------------------------------*/
    const handleUploadSvg = useCallback(async () => {
        console.log('sketchPage: handleUpload called');
        const svgs = await saveAll();
        setSvgData(svgs); 
        uploadToS3({
            landmarks: null,
            svgs: svgs,
            fileType: 'svg',
        });
    }, [saveAll]);

    /* Handle download SVGs to device
    --------------------------------------------------------------------------*/
    const handleDownloadSvg = useCallback(async () => {
        console.log('sketchPage: handleDownloadSvg called');
        const svgs = await saveAll();
        setSvgData(svgs); 
        console.log('sketchPage: Downloading SVGs:', svgs);
        downloadSvgToDevice(svgs);
    }, [saveAll]);

    /* Handle picking video for pose detection
    --------------------------------------------------------------------------*/
    const handlePickVideo = async () => {
        const result = await DocumentPicker.getDocumentAsync({
            type: 'video/*',
        });
        if (!result.canceled) {
            goToDetectPose('pose', result.assets[0].uri);    
        }
    };

    /* Navigate to detectPose screen with SVGs
    --------------------------------------------------------------------------*/
    const goToDetectPose = useCallback(async (mode, poseVideoUri) => {
        const svgsToSend = await saveAll();
        if (!svgsToSend) return;

        // Navigate to detectPose with SVGs and mode
        router.push({
            pathname: '/detectPose',
            params: {
            svgs: JSON.stringify(svgsToSend),
            mapping: JSON.stringify(CANVAS_LANDMARK_MAP),
            viewMode: mode,
            videoUri: poseVideoUri,
            armOrientation: armsDown ? 'vertical' : 'horizontal',
            },
        });
    }, [router, saveAll, armsDown]);

    /* =========================================================================
                                    HOOKS
    ==========================================================================*/
    
    /* Update erase mode on all canvases when erase state changes
    --------------------------------------------------------------------------*/
    useEffect(() => {
        const refs = [
            headRef, torsoRef,
            rightUpperArmRef, rightLowerArmRef, rightHandRef,
            leftUpperArmRef, leftLowerArmRef, leftHandRef,
            rightUpperLegRef, rightLowerLegRef, rightFootRef,
            leftUpperLegRef, leftLowerLegRef, leftFootRef
        ];
        refs.forEach(ref => {
            if (ref.current && ref.current.eraseMode) {
                ref.current.eraseMode(erase);
            }
        });
    }, [erase]);

    /* Set navigation params for header buttons
    --------------------------------------------------------------------------*/
    useEffect(() => {
        navigation.setParams({
            viewMode: viewMode,
            eraseMode: erase,
            setEraseMode: setErase,
            strokeColor: selectedColor,
            svgData: svgData,
            onClear: clearAll,
            onToggleSettings: toggleSettings,
            onShowDetectPoseOptions: toggleDetectPoseOptions,
            onShowSketchInfo: () => setShowSketchInfo(prev => !prev),
            onToggleExportOptions: toggleExportOptions,

        });
    }, [
            navigation, 
            clearAll, 
            goToDetectPose, 
            viewMode, 
            selectedColor,
            erase,
            saveAll,
            svgData,
            toggleDetectPoseOptions,
            toggleExportOptions, 
            toggleSettings,
        ]
    );

    /* =========================================================================
                                    CANVAS PROPS
    ==========================================================================*/

    /* Canvas properties for body part canvases
    --------------------------------------------------------------------------*/
    const canvasProps = {    
        exportWithBackgroundImage: false, 
        canvasColor: 'transparent',     
        svgStyle: { background: 'transparent'} ,
        strokeWidth: strokeWidth,
        strokeColor: selectedColor,
        eraserWidth: strokeWidth, 
        eraseMode: erase,
    };
    
    /* Render page
    ----------------------------------------------------------------------------
    Renders body part canvases and dropdowns
    --------------------------------------------------------------------------*/
    return (       
        <View style={[styles.mainContainer, { minWidth: sizes.TOTAL_WIDTH }]}>
            
            {showSketchControls && (
                <SketchControls
                    selectedColor={selectedColor}
                    setSelectedColor={setSelectedColor}
                    strokeWidth={strokeWidth}
                    setStrokeWidth={setStrokeWidth}
                    setShowSketchControls={setShowSketchControls}
                />
            )}
            {showDetectPoseOptions && (
                <DetectPoseDropdown
                    style={styles.sketchControls}
                    onPickVideo={handlePickVideo}
                    setPoseView={() => goToDetectPose('pose', null)}
                    setSvgView={() => goToDetectPose('svg', null)}
                />
            )}
            {showExportOptions && (
                <ExportSvgDropdown
                    style={styles.sketchControls}
                    onDownloadSvgToDevice={handleDownloadSvg}
                    onUploadToS3={handleUploadSvg}
                />
            )}
            
            {showSketchInfo && (
                 <SketchInfo 
                    setShowSketchInfo={setShowSketchInfo}
                 />
            )}



            <ThemedView style={styles.container}>              
                <Head 
                    canvasProps={canvasProps}
                    canvasId="head"
                    headRef={headRef} 
                    headSize={sizes.HEAD_SIZE}
                /> 
                
                
                    
                    <View style={styles.column}>
                        <View style={styles.row}>

                            <RightArm
                                canvasProps={canvasProps}
                                upperArmId="rightUpperArm"
                                lowerArmId="rightLowerArm"
                                handId="rightHand"
                                upperArmRef={rightUpperArmRef}
                                lowerArmRef={rightLowerArmRef}
                                handRef={rightHandRef}
                                armWidth={sizes.ARM_WIDTH}
                                armLength={sizes.ARM_LENGTH}
                                handWidth={sizes.HAND_WIDTH}
                                handLength={sizes.HAND_LENGTH}
                                armsDown={armsDown}

                            />
                            
                            <View style={styles.column}>
                                <Torso
                                    canvasProps={canvasProps}
                                    torsoId="torso"
                                    torsoRef={torsoRef}
                                    torsoWidth={sizes.TORSO_WIDTH}
                                    torsoHeight={sizes.TORSO_HEIGHT}

                                />
                           
                                <Legs
                                    canvasProps={canvasProps}
                                    leftUpperLegId="leftUpperLeg"
                                    rightUpperLegId="rightUpperLeg"
                                    rightLowerLegId="rightLowerLeg"
                                    leftLowerLegId="leftLowerLeg"
                                    rightUpperLegRef={rightUpperLegRef}
                                    rightLowerLegRef={rightLowerLegRef}
                                    leftUpperLegRef={leftUpperLegRef}
                                    leftLowerLegRef={leftLowerLegRef}
                                    legWidth={sizes.LEG_WIDTH}
                                    legLength={sizes.LEG_LENGTH}
                                    thighLength={sizes.THIGH_LENGTH}
                                    calfLength={sizes.CALF_LENGTH}
    
                                />
                                <View style={styles.row}>
                                <RightFoot
                                    canvasProps={canvasProps}
                                    rightFootId="rightFoot"
                                    rightFootRef={rightFootRef}
                                    footWidth={sizes.FOOT_WIDTH}
                                    footLength={sizes.FOOT_LENGTH}
                                />
                                <LeftFoot
                                    canvasProps={canvasProps}
                                    leftFootId="leftFoot"
                                    leftFootRef={leftFootRef}
                                    footWidth={sizes.FOOT_WIDTH}
                                    footLength={sizes.FOOT_LENGTH}
                                />
                                </View>
                            </View>

                            <LeftArm
                                canvasProps={canvasProps}
                                upperArmId="leftUpperArm"
                                lowerArmId="leftLowerArm"
                                handId="leftHand"
                                upperArmRef={leftUpperArmRef}
                                lowerArmRef={leftLowerArmRef}
                                handRef={leftHandRef}
                                armWidth={sizes.ARM_WIDTH}
                                armLength={sizes.ARM_LENGTH}
                                handWidth={sizes.HAND_WIDTH}
                                handLength={sizes.HAND_LENGTH}
                                armsDown={armsDown}
                    
                            />
                        </View>
                        
                    </View>

                    

            </ThemedView>            
        </View>        
    );
};

export default SketchPage;

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        position: 'relative'
    },
    
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        gap: 2, 
    },

    sketchControls: {
        position: 'absolute',
        top: "2rem",
        right: 0,
        borderTopLeftRadius: 8,
        borderBottomLeftRadius: 8,
        zIndex: 10,
        width: 300,
    },

    row: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'center',
        gap: 2, 
    },

    column: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2, 
    },
});