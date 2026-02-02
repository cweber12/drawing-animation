
/* SketchPage.jsx
--------------------------------------------------------------------------------
Main drawing interface for sketching, editing, and exporting SVG body parts.
------------------------------------------------------------------------------*/

import React, { 
    useRef, 
    useState, 
    useEffect, 
    useCallback
} from 'react';
import { 
    View, 
    StyleSheet, 
    useWindowDimensions, 
    useColorScheme, 
    Platform
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter, useNavigation } from 'expo-router';
import * as FileSystem from 'expo-file-system';
/* Import constants
-----------------------------------------------------------------------------*/
import { CANVAS_LANDMARK_MAP} from '../constants/landmarkData';
import ThemedView from '../components/themed_components/ThemedView';
import { Colors } from '../constants/Colors';
import { getSvgSizes } from '../constants/Sizes';
import { uploadToS3 } from '../utils/s3Utils';
/* Import components
-----------------------------------------------------------------------------*/
import BrushSizeSlider from '../components/dropdown/sketch_controls/BrushSizeSlider';
import ColorPicker from '../components/dropdown/sketch_controls/ColorPicker';
import DetectPoseDropdown from '../components/dropdown/select/detectPoseDropdown';
import Head from '../components/canvas/body_parts/Head';
import Torso from '../components/canvas/body_parts/Torso';
import RightArm from '../components/canvas/body_parts/RightArm';
import LeftArm from '../components/canvas/body_parts/LeftArm';
import Legs from '../components/canvas/body_parts/Legs';
import Feet from '../components/canvas/body_parts/Feet';
import SketchInfo from '../components/dropdown/info/SketchInfo';
import SketchControls from '../components/dropdown/sketch_controls/SketchControls';

const SketchPage = () => {
    
    /* Navigation and routing for screen transitions
    --------------------------------------------------------------------------*/
    const router = useRouter();
    const navigation = useNavigation();

    /* Responsive layout based on screen width
    --------------------------------------------------------------------------*/
    const { width, height } = useWindowDimensions();
    const isSmallScreen = width < 768;

    /* returns appropriate sizes for SVG canvases based on screen height
    --------------------------------------------------------------------------*/
    const sizes = getSvgSizes(height);
    
    /* Theme and color scheme
    --------------------------------------------------------------------------*/
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;
    
    /* States passed to navigation for header buttons
    --------------------------------------------------------------------------*/
    // Sketch controls states
    const [selectedColor, setSelectedColor] = useState(theme.svgStrokeColor);
    const [strokeWidth, setStrokeWidth] = useState(20);
    const [showSketchControls, setShowSketchControls] = useState(false);  
    const [erase, setErase] = useState(false);
    
    // viewMode for Detect Pose Display: 'svg' or 'pose'
    const [viewMode, setViewMode] = useState('svg'); 
    const [showDetectPoseOptions, setShowDetectPoseOptions] = useState(false);
    const [svgData, setSvgData] = useState(null);

    const [showSketchInfo, setShowSketchInfo] = useState(false);
    
    /* Refs for each body part canvas
    - Ensures canvases can be updated and accessed separately
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
    
    /* Common canvas props
    - CSS doesn't support spreading props, so define common props here
    - Passed to each body part canvas component
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

    /* Toggle display of sketch controls
    --------------------------------------------------------------------------*/

    const toggleDetectPoseOptions = useCallback(() => {
        setShowSketchControls(false);
        setShowDetectPoseOptions(prev => !prev);
    }, []);

    const toggleSettings = useCallback(() => {
        setShowDetectPoseOptions(false);
        setShowSketchControls(prev => !prev);
    }, []);

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

    /* Save all canvases as SVGs
    - saves all body part canvases as SVG strings in bodySvgsRef
    - exports SVGs as JSON file if exportSvg is true (export button pressed)
    --------------------------------------------------------------------------*/
    const saveAll = useCallback(async () => {
        try {
            const refs = {
            head: headRef,
            rightUpperLeg: rightUpperLegRef,
            rightLowerLeg: rightLowerLegRef,
            rightFoot: rightFootRef,
            leftUpperLeg: leftUpperLegRef,
            leftLowerLeg: leftLowerLegRef,
            leftFoot: leftFootRef,
            torso: torsoRef,
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
    - passes saved SVGs, viewMode, and videoUri as params
    NOTE: will implement better saving/loading of SVGs later.
    --------------------------------------------------------------------------*/
    const goToDetectPose = useCallback(async (mode, poseVideoUri) => {
        const svgsToSend = await saveAll();
        if (!svgsToSend) return;

        router.push({
            pathname: '/detectPose',
            params: {
            svgs: JSON.stringify(svgsToSend),
            mapping: JSON.stringify(CANVAS_LANDMARK_MAP),
            viewMode: mode,
            videoUri: poseVideoUri,
            armOrientation: isSmallScreen ? 'vertical' : 'horizontal',
            },
        });
    }, [router, saveAll, isSmallScreen]);

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
            onHandleUploadSvg: handleUploadSvg,

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
            handleUploadSvg,
            toggleDetectPoseOptions, 
            toggleSettings
        ]
    );
    
    /* Render page
    ----------------------------------------------------------------------------
    Elements: 
    Sketch controls: brush size, color picker, detect pose options
    - NOTE: React ColorPicker only supported on web platform. Mobile will use
      native color picker in future update.
    Info popup: Instructions for using sketch tools
    Canvases: body part SVG canvases for drawing
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
                        isSmallScreen={isSmallScreen}

                    />
                    
                    <View style={{gap: 2}}>
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

                        />
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
                        isSmallScreen={isSmallScreen}
               
                    />
                </View>
                <Feet
                    canvasProps={canvasProps}
                    rightFootId="rightFoot"
                    leftFootId="leftFoot"
                    rightFootRef={rightFootRef}
                    leftFootRef={leftFootRef}
                    footWidth={sizes.FOOT_WIDTH}
                    footLength={sizes.FOOT_LENGTH}
                />

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
        justifyContent: 'flex-start',
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
});