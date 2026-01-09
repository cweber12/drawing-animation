
/* SketchPage.jsx
--------------------------------------------------------------------------------
Main drawing interface for sketching, editing, and exporting SVG body parts.

Sketch SVGS: head, torso, arms, hands legs, and feet on separate canvases.
  - Select brush size and color, toggle erase mode.
  - Save all canvases as SVGs stored in state and local file.
  - Export SVGs as JSON file.
  - Navigate to Detect Pose screen with saved SVGs for pose-based animation.

  Navigate to detectPose: pass saved SVGs to view them over detected pose
landmarks from device camera or uploaded video.
  - Uses expo-router for navigation and routing.
  - Passes viewMode ('svg' or 'pose') and videoUri as params to adjust layout
    and functionality on Detect Pose screen.
    - 'svg' mode: view saved svgs over live pose detection.
    - 'pose' mode: create pose-based animation from uploaded video or webcam.
    NOTE: 'pose' mode creates a smoother animation by applying smoothing to 
    saved landmarks but takes longer to process. 'svg' mode uses real-time
    landmarks and is faster but the animation is more jumpy. 
------------------------------------------------------------------------------*/

/* Import libraries
-----------------------------------------------------------------------------*/
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
import { CANVAS_LANDMARK_MAP} from '../constants/LandmarkData';
import ThemedView from '../components/themed_elements/ThemedView';
import { Colors } from '../constants/Colors';
import { getSvgSizes } from '../constants/Sizes';
/* Import components
-----------------------------------------------------------------------------*/
import BrushSizeSlider from '../components/controls/BrushSizeSlider';
import ColorPicker from '../components/controls/ColorPicker';
import DetectPoseDropdown from '../components/controls/detectPoseDropdown';
import Head from '../components/canvas/body_parts/Head';
import Torso from '../components/canvas/body_parts/Torso';
import RightArm from '../components/canvas/body_parts/RightArm';
import LeftArm from '../components/canvas/body_parts/LeftArm';
import Legs from '../components/canvas/body_parts/Legs';
import Feet from '../components/canvas/body_parts/Feet';

const SketchPage = () => {
    
    /* Navigation and routing for screen transitions
    - router: navigates to different screens (detectPose)
    - navigation: sets params used and set by header buttons
    --------------------------------------------------------------------------*/
    const router = useRouter();
    const navigation = useNavigation();

    /* Responsive layout based on screen width
    --------------------------------------------------------------------------*/
    const { width, height } = useWindowDimensions();
    const isSmallScreen = width < 768;

    /* Get calculated svg sizes based on screen height
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
    const [strokeWidth, setStrokeWidth] = useState(2);
    const [showBrushSizeSlider, setShowBrushSizeSlider] = useState(false);
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [erase, setErase] = useState(false);
    // viewMode for Detect Pose Display: 'svg' or 'pose'
    const [viewMode, setViewMode] = useState('svg'); 
    // uploaded video URI for pose detection
    const [poseVideoUri, setPoseVideoUri] = useState(null);
    // export SVGs flag (triggers export in saveAll)
    const [exportSvg, setExportSvg] = useState(false);
    // show pose options dropdown (upload video, select view mode)
    const [showDetectPoseOptions, setShowDetectPoseOptions] = useState(false);
    
    /* Refs for each body part canvas
    - Ensures canvases can be updated and accessed separately
    --------------------------------------------------------------------------*/
    const bodySvgsRef = useRef({}); // Holds all saved svgs
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
        canvasColor: 'rgba(0,0,0,0)',          
        exportWithBackgroundImage: false,      
        svgStyle: { background: 'transparent'} ,
        strokeWidth: strokeWidth,
        strokeColor: selectedColor,
        eraseMode: erase,
        eraserWidth: strokeWidth, 
    };

    /* Toggle display of sketch controls
    --------------------------------------------------------------------------*/
    const toggleBrushSizeSlider = useCallback(() => {
        setShowColorPicker(false);
        setShowBrushSizeSlider(prev => !prev);
        
    }, []);

    const toggleColorPicker = useCallback(() => {
        setShowBrushSizeSlider(false);
        setShowColorPicker(prev => !prev);
        
    }, []);

    const toggleEraseMode = useCallback(() => {
        setErase(prev => !prev);
    }, []);

    /* Update erase mode on all canvases when erase state changes
    --------------------------------------------------------------------------*/
    useEffect(() => {
        // List all refs
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
            // Collect refs for each body part
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

            // Export SVG from each canvas ref
            const svgs = {};
            for (const [key, ref] of Object.entries(refs)) {
                if (ref.current && ref.current.exportSvg) {
                    let svg = await ref.current.exportSvg();
                    svgs[key] = svg;
                } else {
                    console.warn(`No stroke found or ref not ready for ${key}`);
                    svgs[key] = null;
                }
            }

            // Update state and ref
            bodySvgsRef.current = svgs;
            
            // Export SVGs as JSON file (if export button pressed) 
            if (exportSvg) {
                try {
                    const json = JSON.stringify(svgs, null, 2);
                    if (Platform.OS === 'web') {
                        // Web: trigger download using Blob
                        const blob = new Blob([json], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'body_svgs.json';
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                        console.log('SVGs exported as body_svgs.json');
                    } else {
                        // Native: use expo-file-system
                        const fileUri = FileSystem.documentDirectory + 'body_svgs.json';
                        await FileSystem.writeAsStringAsync(fileUri, json, {
                            encoding: FileSystem.EncodingType.UTF8,
                        });
                        console.log('SVGs exported to: ' + fileUri);
                    }
                } catch (e) {               
                    console.error('Error exporting SVGs:', e);
                } 
            }
                    
            return svgs;
        } catch (e) {
            console.error('Error saving SVGs:', e);
            return null;
        }
    }, [exportSvg]);

    /* Export all SVGs handler for header button
    --------------------------------------------------------------------------*/
    const exportAll = useCallback(async () => {
        setExportSvg(true);
        const svgs = await saveAll();
        setExportSvg(false);
        return svgs;
    }, [saveAll]);

    /* Handle picking video for pose detection
    --------------------------------------------------------------------------*/
    const handlePickVideo = async () => {
        const result = await DocumentPicker.getDocumentAsync({
            type: 'video/*',
        });
        if (!result.canceled) {
            console.log('Picked video:', result);
            goToDetectPose('pose', result.assets[0].uri);    
        }
    };

    /* Navigate to detectPose screen with SVGs
    - passes saved SVGs, viewMode, and videoUri as params
    - comment/uncomment to use savedSvgs from file of svgsToSend from current 
      canvases. Use savedSvgs for debug. 
    - savedSvgs: loaded from public/svg_parts/body_svgs.json file
    - svgsToSend: saved from current canvases
    NOTE: will implement better saving/loading of SVGs later.
    --------------------------------------------------------------------------*/
    const goToDetectPose = useCallback(async (mode, poseVideoUri) => {
        
        //const svgsToSend = await saveAll(); 
        let savedSvgs = null;
        

        /* Try to load saved SVGs from file (if using svgsToSend, remove this V)
        ----------------------------------------------------------------------*/
        if (Platform.OS === 'web') {
            try {
                const response = await fetch('/svg_parts/body_svgs.json');
                if (response.ok) {
                    const text = await response.text();
                    if (
                        text && text.trim() !== '' && 
                        text.trim() !== 'undefined'
                    ) {
                        savedSvgs = JSON.parse(text);
                    }
                }
            } catch (e) {
                console.warn('Could not load saved SVGs:', e);
            }
        } else {
            try {
                const fileUri = FileSystem.documentDirectory + 'body_svgs.json';
                const savedSvgsString = 
                    await FileSystem.readAsStringAsync(fileUri);
                if (
                    savedSvgsString && savedSvgsString.trim() !== '' && 
                    savedSvgsString.trim() !== 'undefined'
                ) {
                    savedSvgs = JSON.parse(savedSvgsString);
                }
            } catch (e) {
                console.warn('Could not load saved SVGs:', e);
            }
        }
        /* End load saved SVGs from file
        ----------------------------------------------------------------------*/

        //if (!svgsToSend) return;
        if (!savedSvgs) return; 

        router.push({
            pathname: '/detectPose',
            params: {
                // uncomment to use svgs from current canvases
                //svgs: JSON.stringify(svgsToSend), 
                // uncomment to use saved svgs from file
                svgs: JSON.stringify(savedSvgs),
                mapping: JSON.stringify(CANVAS_LANDMARK_MAP),
                viewMode: mode,
                videoUri: poseVideoUri,
                armOrientation: isSmallScreen ? 'vertical' : 'horizontal',
            },
        });
    }, [router, saveAll, isSmallScreen, poseVideoUri]);

    /* Set navigation params for header buttons
    --------------------------------------------------------------------------*/
    useEffect(() => {
        navigation.setParams({
            viewMode: viewMode,
            eraseMode: erase,
            strokeColor: selectedColor,
            onExportAll: exportAll,
            onClear: clearAll,
            onToggleErase: toggleEraseMode,
            onShowBrushSizeSlider: toggleBrushSizeSlider,
            onShowColorPicker: toggleColorPicker,
            onShowDetectPoseOptions: () => {
                setShowDetectPoseOptions(prev => !prev);
            }
        });
    }, [
            navigation, 
            clearAll, 
            goToDetectPose, 
            toggleBrushSizeSlider, 
            toggleColorPicker, 
            viewMode, 
            selectedColor,
            erase,
            exportAll,
            saveAll,
            toggleEraseMode
        ]
);
    
    /* Render page
    --------------------------------------------------------------------------*/
    return (       
        <View style={styles.mainContainer}>
            {showBrushSizeSlider && (
                <BrushSizeSlider 
                    style={styles.sketchControls} 
                    strokeWidth={strokeWidth}
                    onStrokeWidthChange={setStrokeWidth} 
                />
            )}
            {showColorPicker && (
                <ColorPicker 
                    style={styles.sketchControls}
                    selectedColor={selectedColor}
                    onColorChange={setSelectedColor}
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

            <ThemedView style={styles.container}>
                
                <Head 
                    canvasProps={canvasProps}
                    headRef={headRef} 
                    headSize={sizes.HEAD_SIZE}
                    eraseMode={erase}
                /> 
                
                <View style={styles.row}>

                    <RightArm
                        canvasProps={canvasProps}
                        upperArmRef={rightUpperArmRef}
                        lowerArmRef={rightLowerArmRef}
                        handRef={rightHandRef}
                        armWidth={sizes.ARM_WIDTH}
                        armLength={sizes.ARM_LENGTH}
                        handWidth={sizes.HAND_WIDTH}
                        handLength={sizes.HAND_LENGTH}
                        isSmallScreen={isSmallScreen}
                    />
                    
                    <View>
                        <Torso
                            canvasProps={canvasProps}
                            torsoRef={torsoRef}
                            torsoWidth={sizes.TORSO_WIDTH}
                            torsoHeight={sizes.TORSO_HEIGHT}
                        />

                        <Legs
                            canvasProps={canvasProps}
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
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 10,
        padding: 16, 
        borderBottomLeftRadius: 8,
    },

    row: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'center',
        gap: 2, 
    },
});