import React, { useRef, useState, useEffect, useCallback} from 'react';
import { 
    View, 
    StyleSheet, 
    useWindowDimensions, 
    useColorScheme
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter, useNavigation } from 'expo-router';
import { CANVAS_LANDMARK_MAP, getCanvasLandmarkMap } from '../constants/LandmarkData';
import ThemedView from '../components/themed_elements/ThemedView';
import { Colors } from '../constants/Colors';
import BrushSizeSlider from '../components/controls/BrushSizeSlider';
import ColorPicker from '../components/controls/ColorPicker';
import Head from '../components/canvas/body_parts/Head';
import Torso from '../components/canvas/body_parts/Torso';
import RightArm from '../components/canvas/body_parts/RightArm';
import LeftArm from '../components/canvas/body_parts/LeftArm';
import Legs from '../components/canvas/body_parts/Legs';
import Feet from '../components/canvas/body_parts/Feet';
import { getSvgSizes } from '../constants/Sizes';
import { get } from 'lodash';

const SketchPage = () => {
    /* Navigation and routing for screen transitions
    --------------------------------------------------------------------------*/
    const router = useRouter();
    const navigation = useNavigation();

    const { width, height } = useWindowDimensions();
    const isSmallScreen = width < 768;
    const sizes = getSvgSizes(height);
    
    /* Theme and color scheme
    --------------------------------------------------------------------------*/
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;
    
    /* State variables brush size and color settings
    --------------------------------------------------------------------------*/
    const [selectedColor, setSelectedColor] = useState(theme.svgStrokeColor);
    const [strokeWidth, setStrokeWidth] = useState(2);
    const [showBrushSizeSlider, setShowBrushSizeSlider] = useState(false);
    const [showColorPicker, setShowColorPicker] = useState(false);

    /* View mode state to pass current viewMode to header buttons
    --------------------------------------------------------------------------*/
    const [viewMode, setViewMode] = useState('svg'); // 'svg' or 'pose'
    const [poseVideoUri, setPoseVideoUri] = useState(null);
    
    /* Refs for each body part canvas
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
    --------------------------------------------------------------------------*/
    const canvasProps = {
        canvasColor: 'rgba(0,0,0,0)',          
        exportWithBackgroundImage: false,      
        svgStyle: { background: 'transparent'} ,
        strokeWidth: strokeWidth,
        strokeColor: selectedColor,
    };

    /* Toggle display of sketch controls
    --------------------------------------------------------------------------*/
    const toggleBrushSizeSlider = useCallback(() => {
        setShowColorPicker(false);
        setShowBrushSizeSlider(prev => !prev);
        
    }, []);

    /* Toggle display of color picker
    --------------------------------------------------------------------------*/
    const toggleColorPicker = useCallback(() => {
        setShowBrushSizeSlider(false);
        setShowColorPicker(prev => !prev);
        
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
    }, []);

    /* Save all canvases as SVGs
    --------------------------------------------------------------------------*/
    const saveAll = useCallback(async () => {
        try {
            // Collect refs for each body part
            const refs = {
                head: headRef,
                rightUpperArm: rightUpperArmRef,
                leftUpperArm: leftUpperArmRef,
                rightUpperLeg: rightUpperLegRef,
                rightLowerLeg: rightLowerLegRef,
                rightFoot: rightFootRef,
                leftUpperLeg: leftUpperLegRef,
                leftLowerLeg: leftLowerLegRef,
                leftFoot: leftFootRef,
                torso: torsoRef,
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
            return svgs;
        } catch (e) {
            console.error('Error saving SVGs:', e);
            return null;
        }
    }, []);

    const handlePickVideo = async () => {
        const result = await DocumentPicker.getDocumentAsync({
            type: 'video/*',
        });
        if (!result.canceled) {
            console.log('Picked video:', result);
            goToDetectPose('pose', result.assets[0].uri);    
        }
    };

    /* Navigate to Detect Pose screen with SVGs
    --------------------------------------------------------------------------*/
    const goToDetectPose = useCallback(async (mode, poseVideoUri) => {
        console.log('videoUri param:', poseVideoUri);
        const svgsToSend =
            Object.keys(bodySvgsRef.current || {}).length > 0
            ? bodySvgsRef.current
            : await saveAll();

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
    }, [router, saveAll, isSmallScreen, poseVideoUri]);
    /* Set navigation params for header buttons
    --------------------------------------------------------------------------*/
    useEffect(() => {
        navigation.setParams({
            onClear: clearAll,
            onShowBrushSizeSlider: toggleBrushSizeSlider,
            onShowColorPicker: toggleColorPicker,
            setPoseView: () => goToDetectPose('pose', null),
            setSvgView: () => goToDetectPose('svg', null),
            onPickVideo: handlePickVideo,
            viewMode: viewMode,
        });
    }, [
            navigation, 
            clearAll, 
            goToDetectPose, 
            toggleBrushSizeSlider, 
            toggleColorPicker, 
            viewMode
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
            <ThemedView style={styles.container}>
                
                <Head 
                    canvasProps={canvasProps}
                    headRef={headRef} 
                    headSize={sizes.HEAD_SIZE}
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
        right: 0,
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