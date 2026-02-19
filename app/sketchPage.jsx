
// app/sketchPage.jsx

/* Import libraries
-----------------------------------------------------------------------------*/
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, useWindowDimensions, useColorScheme, TouchableOpacity, Text } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter, useNavigation } from 'expo-router';
/* Import constants
-----------------------------------------------------------------------------*/
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
import { uploadToS3 } from '../utils/storage/s3Utils';
import { downloadSvgToDevice } from '../utils/storage/storageUtils';
import SketchButtons from '../components/button_group/SketchButtons';

/*==============================================================================
                                SKETCH PAGE
================================================================================
Main interface for sketching, editing, and exporting SVG body parts. Contains
canvas components for each body part, dropdowns for settings and options, and
handles navigation to detect pose screen with saved SVGs.
------------------------------------------------------------------------------*/
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
    const [viewMode, setViewMode] = useState('replay'); 

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

    const [showBackCanvases, setShowBackCanvases] = useState(false);
    const [backCopied, setBackCopied] = useState(false);

    /* SVG data state for upload/download
    --------------------------------------------------------------------------*/
    const [svgData, setSvgData] = useState(null);

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

    /* =========================================================================
                                BODY PART REFS
    ============================================================================
    Refs for front and back canvases of each body part to call drawing methods 
    and export methods (exportSvg, exportPaths) for copying and saving.
    --------------------------------------------------------------------------*/
    // FRONT CANVASES
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
    // BACK CANVASES
    const headBackRef = useRef(null);
    const torsoBackRef = useRef(null);
    const rightUpperArmBackRef = useRef(null);
    const rightLowerArmBackRef = useRef(null);
    const rightHandBackRef = useRef(null);
    const leftUpperArmBackRef = useRef(null);
    const leftLowerArmBackRef = useRef(null);
    const leftHandBackRef = useRef(null);
    const rightUpperLegBackRef = useRef(null);
    const rightLowerLegBackRef = useRef(null);
    const rightFootBackRef = useRef(null);
    const leftUpperLegBackRef = useRef(null);
    const leftLowerLegBackRef = useRef(null);
    const leftFootBackRef = useRef(null);
    
    /* =========================================================================
                                    CALLBACKS
    ==========================================================================*/
    
    /* Toggle options for detect pose (upload video, record, or live)
    --------------------------------------------------------------------------*/
    const toggleDetectPoseOptions = useCallback(() => {
        setShowSketchControls(false);
        setShowExportOptions(false);
        setShowSketchInfo(false);
        setShowDetectPoseOptions(prev => !prev);
    }, []);

    /* Toggle sketch settings (brush size, color picker)
    --------------------------------------------------------------------------*/
    const toggleSettings = useCallback(() => {
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
            return !prev;
        });
    }, []);

    /* Front <-> back sketch canvas toggle 
    ----------------------------------------------------------------------------
    Page Load: Show front canvases (z-index 2) hide back canvases (z-index -1)
    Toggle Back Canvases: 
    - First Toggle Front -> Back: Copy front canvases to back asynchronously, 
      then show back (z-index 2) hide front (z-index -1). 
    - Subsequent Toggles Back -> Front: Just toggle z-index of front/back. 
    ****************************************************************************
    NOTE: Copy front -> back on first toggle to save time drawing and ensure 
          colors and edges match to avoid jerky transitions from front <-> back.
    --------------------------------------------------------------------------*/
    
    /* Copy SVG data from front canvases to back canvases
    --------------------------------------------------------------------------*/
    const copyFrontToBack = useCallback(async () => {
        try {
            const pairs = [
                [headRef, headBackRef],
                [torsoRef, torsoBackRef],

                [rightUpperArmRef, rightUpperArmBackRef],
                [rightLowerArmRef, rightLowerArmBackRef],
                [rightHandRef, rightHandBackRef],

                [leftUpperArmRef, leftUpperArmBackRef],
                [leftLowerArmRef, leftLowerArmBackRef],
                [leftHandRef, leftHandBackRef],

                [rightUpperLegRef, rightUpperLegBackRef],
                [rightLowerLegRef, rightLowerLegBackRef],
                [rightFootRef, rightFootBackRef],

                [leftUpperLegRef, leftUpperLegBackRef],
                [leftLowerLegRef, leftLowerLegBackRef],
                [leftFootRef, leftFootBackRef],
            ];

            for (const [frontRef, backRef] of pairs) {
                try {
                    if (!frontRef?.current || !backRef?.current) continue;

                    // Reset back canvas first
                    if (typeof backRef.current.resetCanvas === 'function') {
                        await backRef.current.resetCanvas();
                    }

                    // Prefer exportPaths/loadPaths for fidelity
                    if (typeof frontRef.current.exportPaths === 'function' && typeof backRef.current.loadPaths === 'function') {
                        const paths = await frontRef.current.exportPaths();
                        if (paths && paths.length > 0) {
                            await backRef.current.loadPaths(paths);
                        }
                        continue;
                    }

                    // Fallback: exportSvg -> (if back supports import from svg)
                    if (typeof frontRef.current.exportSvg === 'function' && typeof backRef.current.importSvg === 'function') {
                        const svg = await frontRef.current.exportSvg();
                        if (svg) await backRef.current.importSvg(svg);
                    }
                } catch (e) {
                    console.warn('copyFrontToBack: failed for a pair', e);
                    continue;
                }
            }

            setBackCopied(true);
        } catch (e) {
            console.error('copyFrontToBack error:', e);
        }
    }, []);

    /* Handle toggle between front and back canvases
    --------------------------------------------------------------------------*/
    const handleToggleBackCanvases = useCallback(() => {
        setShowBackCanvases(prev => {
            const next = !prev;
            if (next && !backCopied) {
                // copy asynchronously, don't block UI
                copyFrontToBack();
            }
            return next;
        });
    }, [backCopied, copyFrontToBack]);

    /* =========================================================================
                                CLEAR / RESET CANVASES
    ============================================================================
    Clear all canvases and reset SVG data.
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
        
        headBackRef.current?.clearCanvas();
        torsoBackRef.current?.clearCanvas();
        rightUpperArmBackRef.current?.clearCanvas();
        rightLowerArmBackRef.current?.clearCanvas();
        rightHandBackRef.current?.clearCanvas();
        leftUpperArmBackRef.current?.clearCanvas();
        leftLowerArmBackRef.current?.clearCanvas();
        leftHandBackRef.current?.clearCanvas();
        rightUpperLegBackRef.current?.clearCanvas();
        rightLowerLegBackRef.current?.clearCanvas();
        rightFootBackRef.current?.clearCanvas();
        leftUpperLegBackRef.current?.clearCanvas();
        leftLowerLegBackRef.current?.clearCanvas();
        leftFootBackRef.current?.clearCanvas();
        bodySvgsRef.current = {};
    }, []);

    /* Clear arm canvases (used when toggling arm positions)
    ----------------------------------------------------------------------------
    Current implementation does not adjust canvas dimensions after arm position
    changes (arms rotate down when screen width < total width of canvases). 
    Arms cleared to avoid drawing issues. 

    TODO: adjust canvas orientation on window resize after sketch started. 
    --------------------------------------------------------------------------*/
    const clearArms = useCallback(() => {
        rightUpperArmRef.current?.clearCanvas();
        rightLowerArmRef.current?.clearCanvas();
        rightHandRef.current?.clearCanvas();
        leftUpperArmRef.current?.clearCanvas();
        leftLowerArmRef.current?.clearCanvas();
        leftHandRef.current?.clearCanvas();
        
        rightUpperArmBackRef.current?.clearCanvas();
        rightLowerArmBackRef.current?.clearCanvas();
        rightHandBackRef.current?.clearCanvas();
        leftUpperArmBackRef.current?.clearCanvas();
        leftLowerArmBackRef.current?.clearCanvas();
        leftHandBackRef.current?.clearCanvas();
    }, []);

    /* =========================================================================
                                    SAVE ALL
    ==========================================================================*/
    const saveAll = useCallback(async () => {
        try {
            const refs = {                            
                rightUpperLeg: rightUpperLegRef,
                rightUpperLegBack: rightUpperLegBackRef,
                rightFoot: rightFootRef,
                rightFootBack: rightFootBackRef,
                rightLowerLeg: rightLowerLegRef,
                rightLowerLegBack: rightLowerLegBackRef,                          
                
                leftUpperLeg: leftUpperLegRef,
                leftUpperLegBack: leftUpperLegBackRef,
                leftFoot: leftFootRef,
                leftFootBack: leftFootBackRef,
                leftLowerLeg: leftLowerLegRef, 
                leftLowerLegBack: leftLowerLegBackRef,                              
                
                torso: torsoRef,
                torsoBack: torsoBackRef,
                head: headRef,
                headBack: headBackRef,
                
                rightUpperArm: rightUpperArmRef,
                rightUpperArmBack: rightUpperArmBackRef,
                rightHand: rightHandRef,
                rightHandBack: rightHandBackRef,
                rightLowerArm: rightLowerArmRef,
                rightLowerArmBack: rightLowerArmBackRef,
                
                leftUpperArm: leftUpperArmRef,
                leftUpperArmBack: leftUpperArmBackRef,
                leftHand: leftHandRef,
                leftHandBack: leftHandBackRef,
                leftLowerArm: leftLowerArmRef, 
                leftLowerArmBack: leftLowerArmBackRef,
            };

            const svgs = {};
            for (const [key, ref] of Object.entries(refs)) {
                if (!ref.current) { svgs[key] = null; continue; }

                if (ref.current.exportPaths) {
                    const paths = await ref.current.exportPaths();
                    if (!paths || paths.length === 0) {
                        svgs[key] = null; 
                        continue;
                    }
                }

                // only serialize when there are paths
                if (ref.current.exportSvg) {
                    svgs[key] = await ref.current.exportSvg();
                    console.log(`Exported SVG for ${key}: `);
                } else {
                    svgs[key] = null;
                }
            }

            bodySvgsRef.current = svgs;
            return svgs;
        } catch (e) {
            return null;
        }
    }, []);

    /* =========================================================================
                                    UPLOAD / DOWNLOAD
    ==========================================================================*/
    const handleUploadSvg = useCallback(async () => {
        const svgs = await saveAll();
        if (!svgs) {
            return;
        }
        setSvgData(svgs); 
        uploadToS3({
            landmarks: null,
            svgs: svgs,
            dataType: 'svg',
        });
    }, [saveAll]);

    /* Handle download SVGs to device
    --------------------------------------------------------------------------*/
    const handleDownloadSvg = useCallback(async () => {
        const svgs = await saveAll();
        if (!svgs) {
            console.error('No SVGs to download');
            return;
        }
        setSvgData(svgs); 
        downloadSvgToDevice(svgs);
    }, [saveAll]);

    /* Handle picking video for pose detection
    --------------------------------------------------------------------------*/
    const handlePickVideo = async () => {
        const result = await DocumentPicker.getDocumentAsync({
            type: 'video/*',
        });
        if (!result.canceled) {
            setViewMode('replay');
            goToDetectPose(result.assets[0].uri);    
        }
    };

    /* =========================================================================
                                    NAVIGATE TO DETECT POSE
    ==========================================================================*/
    const goToDetectPose = useCallback(async (poseVideoUri) => {
        
        let svgsToSend = {};
        const savedSvgs = await saveAll();
        if (savedSvgs) {
            svgsToSend = JSON.stringify(savedSvgs);
        } 
        // Navigate to detectPose with SVGs and mode
        router.push({
            pathname: '/detectPose',
            params: {
            svgs: svgsToSend,
            viewMode: viewMode,
            videoUri: poseVideoUri,
            armOrientation: armsDown ? 'vertical' : 'horizontal',
            },
        });
    }, [router, saveAll, armsDown, viewMode]);

    /* =========================================================================
                                    EFFECTS
    ==========================================================================*/
    
    /* Update erase mode on all canvases when erase state changes
    --------------------------------------------------------------------------*/
    useEffect(() => {
        const refs = [
            headRef, torsoRef,
            rightUpperArmRef, rightLowerArmRef, rightHandRef,
            leftUpperArmRef, leftLowerArmRef, leftHandRef,
            rightUpperLegRef, rightLowerLegRef, rightFootRef,
            leftUpperLegRef, leftLowerLegRef, leftFootRef,
            headBackRef, torsoBackRef,
            rightUpperArmBackRef, rightLowerArmBackRef, rightHandBackRef,
            leftUpperArmBackRef, leftLowerArmBackRef, leftHandBackRef,
            rightUpperLegBackRef, rightLowerLegBackRef, rightFootBackRef,
            leftUpperLegBackRef, leftLowerLegBackRef, leftFootBackRef
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
                onToggleBackCanvases: handleToggleBackCanvases,
            showBackCanvases: showBackCanvases,

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
            handleToggleBackCanvases,
            showBackCanvases,
        ]
    );
    
    /* Render page
    ----------------------------------------------------------------------------
    Renders body part canvases and dropdowns
    --------------------------------------------------------------------------*/
    return (       
        <View style={[styles.mainContainer, { minWidth: sizes.TOTAL_WIDTH }]}>
            
            <View 
                style={{ 
                    position: 'absolute', top: 0, left: 0, zIndex: 50, 
                    flexDirection: 'column', alignItems: 'flex-start', gap: 12
                }}>
                <SketchButtons
                    eraseMode={erase}
                    onClear={clearAll}
                    setEraseMode={setErase}
                    onShowSketchInfo={() => setShowSketchInfo(prev => !prev)}
                    onShowDetectPoseOptions={toggleDetectPoseOptions}
                    onToggleExportOptions={toggleExportOptions}
                    onToggleSettings={toggleSettings}
                    onToggleBackCanvases={handleToggleBackCanvases}
                    showBackCanvases={showBackCanvases}
                />
            

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
                        onPickVideo={handlePickVideo}
                        setPoseView={() => {
                            setViewMode('replay');
                            goToDetectPose(null);
                        }}
                        setSvgView={() => {
                            setViewMode('live');
                            goToDetectPose(null);
                        }}
                    />
                )}
                {showExportOptions && (
                    <ExportSvgDropdown
                        onDownloadSvgToDevice={handleDownloadSvg}
                        onUploadToS3={handleUploadSvg}
                    />
                )}
                
                {showSketchInfo && (
                    <SketchInfo 
                        setShowSketchInfo={setShowSketchInfo}
                    />
                )}

            </View>

            <ThemedView style={[styles.container, { zIndex: !showBackCanvases ? 1 : -1 }]}>              
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

            {/* BACK CANVASES */}
            <ThemedView style={[styles.container, { zIndex: showBackCanvases ? 1 : -1}]}>                              
                <Head 
                    canvasProps={canvasProps}
                    canvasId="headBack"
                    headRef={headBackRef} 
                    headSize={sizes.HEAD_SIZE}
                />                                                   
                <View style={styles.column}>
                    <View style={styles.row}>
                        <RightArm
                            canvasProps={canvasProps}
                            upperArmId="rightUpperArmBack"
                            lowerArmId="rightLowerArmBack"
                            handId="rightHandBack"
                            upperArmRef={rightUpperArmBackRef}
                            lowerArmRef={rightLowerArmBackRef}
                            handRef={rightHandBackRef}
                            armWidth={sizes.ARM_WIDTH}
                            armLength={sizes.ARM_LENGTH}
                            handWidth={sizes.HAND_WIDTH}
                            handLength={sizes.HAND_LENGTH}
                            armsDown={armsDown}
                        />                       
                        <View style={styles.column}>
                            <Torso
                                canvasProps={canvasProps}
                                torsoId="torsoBack"
                                torsoRef={torsoBackRef}
                                torsoWidth={sizes.TORSO_WIDTH}
                                torsoHeight={sizes.TORSO_HEIGHT}
                            />                       
                            <Legs
                                canvasProps={canvasProps}
                                leftUpperLegId="leftUpperLegBack"
                                rightUpperLegId="rightUpperLegBack"
                                rightLowerLegId="rightLowerLegBack"
                                leftLowerLegId="leftLowerLegBack"
                                rightUpperLegRef={rightUpperLegBackRef}
                                rightLowerLegRef={rightLowerLegBackRef}
                                leftUpperLegRef={leftUpperLegBackRef}
                                leftLowerLegRef={leftLowerLegBackRef}
                                legWidth={sizes.LEG_WIDTH}
                                legLength={sizes.LEG_LENGTH}
                                thighLength={sizes.THIGH_LENGTH}
                                calfLength={sizes.CALF_LENGTH}
                            />
                            <View style={styles.row}>
                            <RightFoot
                                canvasProps={canvasProps}
                                rightFootId="rightFootBack"
                                rightFootRef={rightFootBackRef}
                                footWidth={sizes.FOOT_WIDTH}
                                footLength={sizes.FOOT_LENGTH}
                            />
                            <LeftFoot
                                canvasProps={canvasProps}
                                leftFootId="leftFootBack"
                                leftFootRef={leftFootBackRef}
                                footWidth={sizes.FOOT_WIDTH}
                                footLength={sizes.FOOT_LENGTH}
                            />
                            </View>
                        </View>
                        <LeftArm
                            canvasProps={canvasProps}
                            upperArmId="leftUpperArmBack"
                            lowerArmId="leftLowerArmBack"
                            handId="leftHandBack"
                            upperArmRef={leftUpperArmBackRef}
                            lowerArmRef={leftLowerArmBackRef}
                            handRef={leftHandBackRef}
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

    flipButton: {
        position: 'absolute',
        top: 12,
        left: 24,
        zIndex: 10,
        padding: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
    },
});