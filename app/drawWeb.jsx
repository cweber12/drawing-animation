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
    //const headRef = useRef(null);
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
                /> 
                
                {/* Arms and Torso */}
                <View style={styles.armTorsoRow}>
                    {/* Left Arm (upper + lower) */}
                    <View style={isSmallScreen ? styles.armColumn : styles.armRow}>
                        <CanvasWrapper 
                            style={[
                                styles.canvasWrapper, 
                                styles.hand,
                                { 
                                    width: isSmallScreen ? armHeight : handWidth, 
                                    height: isSmallScreen ? armWidth : handHeight, 
                                    marginTop: isSmallScreen ? null : -handOffsetY, 
                                    boxShadow: boxShadowColor,
                                }
                            ]}>
                            {isSmallScreen ? (
                                <ReactSketchCanvas
                                    ref={rightUpperArmRef}
                                    style={styles.canvas}
                                    width={armHeight}
                                    height={armWidth}
                                    {...canvasProps}
                                />
                            ) : (
                                
                                <ReactSketchCanvas
                                    ref={rightHandRef}
                                    style={styles.canvas}
                                    width={handWidth}
                                    height={handHeight}
                                    {...canvasProps}
                                />
                            )}
                        </CanvasWrapper>
                        <CanvasWrapper 
                            style={[
                                styles.canvasWrapper, 
                                { 
                                    width: isSmallScreen ? armHeight : armWidth, 
                                    height: isSmallScreen ? forearmWidth : armHeight,
                                    boxShadow: boxShadowColor
                                }
                            ]}>
                            <ReactSketchCanvas
                                ref={rightLowerArmRef}
                                style={styles.canvas}
                                width={isSmallScreen ? armHeight : forearmWidth}
                                height={isSmallScreen ? forearmWidth : armHeight}
                                {...canvasProps}
                            />
                        </CanvasWrapper>
                        <CanvasWrapper 
                            style={[
                                styles.canvasWrapper, 
                                { 
                                    width: isSmallScreen ? handHeight : armWidth, 
                                    height: isSmallScreen ? handWidth : armHeight, 
                                    boxShadow: boxShadowColor
                                }
                            ]}>
                            {isSmallScreen ? (
                                <ReactSketchCanvas
                                    ref={rightHandRef}
                                    style={styles.canvas}
                                    width={handHeight}
                                    height={handWidth}
                                    {...canvasProps}
                                />
                            ) : (
                                <ReactSketchCanvas
                                    ref={rightUpperArmRef}
                                    style={styles.canvas}
                                    width={armWidth}
                                    height={armHeight}
                                    {...canvasProps}
                                />
                            )}
                        </CanvasWrapper>
                    </View>
                    {/* Torso and Legs */}
                    <View style={styles.legColumn}>
                        {/* Torso */}
                        <CanvasWrapper 
                            style={[
                                styles.canvasWrapper, 
                                { 
                                    width: torsoWidth, 
                                    height: torsoHeight, 
                                    boxShadow: boxShadowColor 
                                }
                            ]}>
                            <ReactSketchCanvas
                                ref={torsoRef}
                                style={styles.canvas}
                                width={torsoWidth}
                                height={torsoHeight}
                                {...canvasProps}
                            />
                        </CanvasWrapper>
                        {/* Legs */}
                        <View style={styles.legsRow}>
                            {/* Right Leg (upper + lower) */}
                            <View style={[styles.legColumn, {alignItems: "flex-end"}]}>
                                <CanvasWrapper 
                                    style={[
                                        styles.canvasWrapper, 
                                        { 
                                            width: legWidth, 
                                            height: legHeight, 
                                            boxShadow: boxShadowColor 
                                        }
                                    ]}>
                                    <ReactSketchCanvas
                                    ref={rightUpperLegRef}
                                    style={styles.canvas}
                                    width={legWidth}
                                    height={legHeight}
                                    {...canvasProps}
                                    />
                                </CanvasWrapper>
                                <CanvasWrapper 
                                    style={[
                                        styles.canvasWrapper, 
                                        { 
                                            width: legWidth, 
                                            height: legHeight, 
                                            boxShadow: boxShadowColor 
                                        }
                                    ]}>
                                    <ReactSketchCanvas
                                    ref={rightLowerLegRef}
                                    style={styles.canvas}
                                    width={legWidth}
                                    height={legHeight}
                                    {...canvasProps}
                                    />
                                </CanvasWrapper>
                                
                            </View>
                            {/* Left Leg (upper + lower) */}
                            <View style={[styles.legColumn, {alignItems: "flex-start"}]}>
                                <CanvasWrapper 
                                    style={[
                                        styles.canvasWrapper, 
                                        { 
                                            width: legWidth, 
                                            height: legHeight, 
                                            boxShadow: boxShadowColor 
                                        }
                                    ]}>
                                    <ReactSketchCanvas
                                    ref={leftUpperLegRef}
                                    style={styles.canvas}
                                    width={legWidth}
                                    height={legHeight}
                                    {...canvasProps}
                                    />
                                </CanvasWrapper>
                                <CanvasWrapper 
                                    style={[
                                        styles.canvasWrapper, 
                                        { 
                                            width: legWidth, 
                                            height: legHeight, 
                                            boxShadow: boxShadowColor 
                                        }
                                    ]}>
                                    <ReactSketchCanvas
                                    ref={leftLowerLegRef}
                                    style={styles.canvas}
                                    width={legWidth}
                                    height={legHeight}
                                    {...canvasProps}
                                    />
                                </CanvasWrapper>
                            </View>
                        </View>
                    </View>
                    {/* Left Arm (upper + lower) */}
                    <View style={isSmallScreen ? styles.armColumn : styles.armRow}>
                        <CanvasWrapper 
                            style={[
                                styles.canvasWrapper, 
                                { 
                                    width: isSmallScreen ? armHeight : armWidth, 
                                    height: isSmallScreen ? armWidth : armHeight, 
                                    boxShadow: boxShadowColor 
                                }
                            ]}>
                            <ReactSketchCanvas
                                ref={leftUpperArmRef}
                                style={{ backgroundColor: 'transparent' }}
                                width={isSmallScreen ? armHeight : armWidth}
                                height={isSmallScreen ? armWidth : armHeight}
                                {...canvasProps}
                            />
                        </CanvasWrapper>
                        <CanvasWrapper 
                            style={[
                                styles.canvasWrapper, 
                                { 
                                    width: isSmallScreen ? armHeight : armWidth, 
                                    height: isSmallScreen ? forearmWidth : armHeight, 
                                    boxShadow: boxShadowColor }
                            ]}>
                            <ReactSketchCanvas
                                ref={leftLowerArmRef}
                                style={styles.canvas}
                                width={isSmallScreen ? forearmWidth : armHeight}
                                height={armHeight}
                                {...canvasProps}
                            />
                        </CanvasWrapper>
                        <CanvasWrapper 
                            style={[
                                styles.canvasWrapper, 
                                styles.hand,
                                { 
                                    width: isSmallScreen ? handHeight : handWidth, 
                                    height: isSmallScreen ? handWidth : handHeight, 
                                    marginTop: isSmallScreen ? 0 : -handOffsetY, 
                                    boxShadow: boxShadowColor 
                                }
                            ]}>
                            <ReactSketchCanvas
                                ref={leftHandRef}
                                style={styles.canvas}
                                width={isSmallScreen ? handHeight : handWidth}
                                height={isSmallScreen ? handWidth : handHeight}
                                {...canvasProps}
                            />
                        </CanvasWrapper>
                    </View>              
                </View>
                {/* Feet */}
                <View style={styles.legsRow}>
                    <CanvasWrapper 
                        style={[
                            styles.canvasWrapper, 
                            { width: footWidth, height: footHeight, boxShadow: boxShadowColor}
                        ]}>
                        <ReactSketchCanvas
                            ref={rightFootRef}
                            style={styles.canvas}
                            width={footWidth}
                            height={footHeight}
                            {...canvasProps}
                        />
                    </CanvasWrapper>
                    <CanvasWrapper 
                        style={[
                            styles.canvasWrapper, 
                            { width: footWidth, height: footHeight, boxShadow: boxShadowColor}
                        ]}>
                        <ReactSketchCanvas
                            ref={leftFootRef}
                            style={styles.canvas}
                            width={footWidth}
                            height={footHeight}
                            {...canvasProps}
                        />
                    </CanvasWrapper>
                </View>
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

    head: {
        borderRadius: 50,
    },

    armTorsoRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'center',
        gap: 2, 
    },

    armRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'center',
        gap: 2, 
    },
    
    armColumn: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2, 
    },

    legColumn: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2, 
    },

    legsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2, 
    },

});