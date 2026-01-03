import React, { useRef, useState, useEffect, useCallback} from 'react';
import { View, StyleSheet, useWindowDimensions, useColorScheme, ScrollView } from 'react-native';
import { ReactSketchCanvas } from 'react-sketch-canvas';
import { useRouter, useNavigation } from 'expo-router';
import { CANVAS_LANDMARK_MAP } from '../constants/LandmarkData';
import ThemedView from '../components/themed_elements/ThemedView';
import { Colors } from '../constants/Colors';
import CanvasWrapper from '../components/themed_elements/ThemedCanvasWrapper';
import BrushSizeSlider from '../components/controls/BrushSizeSlider';
import ColorPicker from '../components/controls/ColorPicker';
import Head from '../components/canvas/body_parts/Head';
import Torso from '../components/canvas/body_parts/Torso';
import { CANVAS_BORDER_RADIUS } from '../constants/Sizes';
import RightArm from '../components/canvas/body_parts/RightArm';
import LeftArm from '../components/canvas/body_parts/LeftArm';
import Legs from '../components/canvas/body_parts/Legs';
import Feet from '../components/canvas/body_parts/Feet';

const DrawWeb = () => {
    /* Navigation and routing for screen transitions
    --------------------------------------------------------------------------*/
    const router = useRouter();
    const navigation = useNavigation();

    const { width, height } = useWindowDimensions();
    const isSmallScreen = width < 600;
    
    /* Theme and color scheme
    --------------------------------------------------------------------------*/
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;
    const boxShadowColor = `${theme.boxShadowColor} 0px 0px 6px -1px, 
                            ${theme.boxShadowColor} 0px 0px 4px -1px`;
    
    /* State variables brush size and color settings
    --------------------------------------------------------------------------*/
    const [selectedColor, setSelectedColor] = useState(theme.svgStrokeColor);
    const [strokeWidth, setStrokeWidth] = useState(2);
    const [showBrushSizeSlider, setShowBrushSizeSlider] = useState(false);
    const [showColorPicker, setShowColorPicker] = useState(false);
    
    /* Other state variables
    - bodySvgs: holds the saved SVGs for each body part
    - viewMode: 'pose' or 'svg' for detectPose display mode
    --------------------------------------------------------------------------*/
    const [bodySvgs, setBodySvgs] = useState({});
    const [viewMode, setViewMode] = useState(null);
    
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

    /* Body part dimensions based on overall canvas width
    --------------------------------------------------------------------------*/
    const torsoWidth = isSmallScreen ? width * 0.35 : width * 0.075;
    const torsoHeight = torsoWidth * 1.5;
    const legWidth = (torsoWidth * 0.5) - 1;
    const legHeight = torsoHeight * 0.75;
    const armWidth = torsoWidth * 0.9;
    const forearmWidth = armWidth * 0.9;
    const armHeight = (torsoHeight * 0.4) - 1;
    const handHeight = armHeight;
    const handWidth = armWidth;
    const handOffsetY = armHeight * 0.3;
    const headHeight = torsoHeight * 0.8;
    const headWidth = torsoWidth;
    const footHeight = torsoHeight * 0.35;
    const footWidth = legWidth * 2;
    
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
            const refs = {
                head: headRef,
                rightUpperArm: rightUpperArmRef,
                rightLowerArm: rightLowerArmRef,
                rightHand: rightHandRef,
                leftUpperArm: leftUpperArmRef,
                leftLowerArm: leftLowerArmRef,
                leftHand: leftHandRef,
                rightUpperLeg: rightUpperLegRef,
                rightLowerLeg: rightLowerLegRef,
                rightFoot: rightFootRef,
                leftUpperLeg: leftUpperLegRef,
                leftLowerLeg: leftLowerLegRef,
                leftFoot: leftFootRef,
                torso: torsoRef,
            };

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

            bodySvgsRef.current = svgs;
            setBodySvgs(svgs);
            return svgs;
        } catch (e) {
            console.error('Error saving SVGs:', e);
            return null;
        }
    }, []);

    /* Navigate to Detect Pose screen with SVGs
    --------------------------------------------------------------------------*/
    const goToDetectPose = useCallback(async (mode) => {
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
            },
        });
    }, [router, saveAll]);

    /* Set navigation params for header buttons
    --------------------------------------------------------------------------*/
    useEffect(() => {
        navigation.setParams({
            onClear: clearAll,
            onShowBrushSizeSlider: toggleBrushSizeSlider,
            onShowColorPicker: toggleColorPicker,
            setPoseView: () => goToDetectPose('pose'),
            setSvgView: () => goToDetectPose('svg'),
        });
    }, [navigation, clearAll, goToDetectPose, toggleBrushSizeSlider, viewMode]);
    
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
                /> 
                
                {/* Arms and Torso */}
                <View style={styles.armTorsoRow}>
                    {/* Left Arm (upper + lower) */}
                    <RightArm
                        canvasProps={canvasProps}
                        upperArmRef={rightUpperArmRef}
                        lowerArmRef={rightLowerArmRef}
                        handRef={rightHandRef}
                    />
                    {/* Torso */}
                    {/* Torso and Legs */}
                    <View style={styles.legColumn}>
                        {/* Torso */}
                        <Torso
                            canvasProps={canvasProps}
                            torsoRef={torsoRef}
                        />
                        {/* Legs */}
                        <Legs
                            canvasProps={canvasProps}
                            rightUpperLegRef={rightUpperLegRef}
                            rightLowerLegRef={rightLowerLegRef}
                            leftUpperLegRef={leftUpperLegRef}
                            leftLowerLegRef={leftLowerLegRef}
                        />
                    </View>
                    {/* Left Arm (upper + lower) */}
                    <LeftArm
                        canvasProps={canvasProps}
                        upperArmRef={leftUpperArmRef}
                        lowerArmRef={leftLowerArmRef}
                        handRef={leftHandRef}
                    />
                </View>
                {/* Feet */}
                <Feet
                    canvasProps={canvasProps}
                    rightFootRef={rightFootRef}
                    leftFootRef={leftFootRef}
                />
            </ThemedView>            
        </View>        
    );
};

export default DrawWeb;

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
        padding: 24,
        gap: 2, 
    },

    scrollView: {
        flexGrow: 1,
        width : '100%',
        height: '100%',
    },

    controls: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 8,
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

    canvasWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 24,
        overflow: 'hidden',
    },

    canvas: {
        backgroundColor: 'transparent',
        width: '100%',
        height: '100%',
        borderRadius: '0.25rem',
    },

    armTorsoRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'center',
        gap: 2, 
    },
});