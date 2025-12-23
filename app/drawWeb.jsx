import React, { useRef, useState, useContext, useEffect, useCallback} from 'react';
import { View, StyleSheet, Dimensions, Button, useColorScheme } from 'react-native';
import { Canvas, ReactSketchCanvas } from 'react-sketch-canvas';
import { useRouter, useNavigation } from 'expo-router';
import { CANVAS_LANDMARK_MAP } from '../constants/LandmarkData';
import ThemedView from '../components/ThemedView';
import { Colors } from '../constants/Colors';
import CanvasWrapper from '../components/CanvasWrapper';
import SketchControls from '../components/SketchControls';


const { width, height } = Dimensions.get('window');

const DrawWeb = () => {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;
    
    const [selectedColor, setSelectedColor] = useState(theme.svgStrokeColor);
    const [strokeWidth, setStrokeWidth] = useState(2);
    const [showSketchControls, setShowSketchControls] = useState(false);
    const router = useRouter();
    const navigation = useNavigation();
    const [bodySvgs, setBodySvgs] = useState({});
    const bodySvgsRef = useRef({});

    // Refs for all canvases
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

    // SVG dimensions
    const torsoWidth = width * 0.12;
    const torsoHeight = height * 0.25;
    const legWidth = (torsoWidth * 0.5) - 1;
    const legHeight = torsoHeight * 0.65;
    const armWidth = torsoWidth * 0.65;
    const armHeight1 = (torsoHeight * 0.45) - 1;
    const armHeight2 = (torsoHeight * 0.45) - 1;
    const handHeight = armHeight1 * 1.5;
    const handWidth = armWidth;
    const handOffsetY = armHeight1 * 0.3;
    const headHeight = torsoHeight * 0.8;
    const headWidth = torsoWidth;
    const footHeight = torsoHeight * 0.35;
    const footWidth = legWidth * 1.5;

    
    
    // Common canvas export properties
    const canvasProps = {
        canvasColor: 'rgba(0,0,0,0)',          
        exportWithBackgroundImage: false,      
        svgStyle: { background: 'transparent'} ,
        strokeWidth: strokeWidth,
        strokeColor: selectedColor,
    };

    const toggleSketchControls = useCallback(() => {
        setShowSketchControls(prev => !prev);
    }, []);

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

    const saveAll = useCallback(async () => {
        try {
            const refs = {
                head: headRef,
                torso: torsoRef,
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

    const goToDetectPose = useCallback(async () => {
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
            },
        });
    }, [router, saveAll]);

    useEffect(() => {
        navigation.setParams({
            onClear: clearAll,
            onSave: saveAll,
            onOpenCamera: goToDetectPose,
            onShowSketchControls: toggleSketchControls,
        });
    }, [navigation, clearAll, saveAll, goToDetectPose, toggleSketchControls]);

    return (

        <View style={styles.mainContainer}>
            {showSketchControls && (
                <SketchControls 
                    style={styles.sketchControls} 
                    onColorChange={setSelectedColor}
                    strokeWidth={strokeWidth}
                    onStrokeWidthChange={setStrokeWidth} 
                />
            )}
            <ThemedView style={styles.container}>
                {/* Head */}
                <CanvasWrapper style={[styles.canvasWrapper, styles.head, { width: headWidth, height: headHeight}]}>
                    <ReactSketchCanvas
                    ref={headRef}
                    style={styles.canvas}
                    width={headWidth}
                    height={headHeight}
                    {...canvasProps}
                    />
                </CanvasWrapper>
                {/* Arms and Torso */}
                <View style={styles.armTorsoRow}>
                    {/* Left Arm (upper + lower) */}
                    <View style={styles.armRow}>
                        <CanvasWrapper 
                        style={[styles.canvasWrapper, styles.hand,
                            { width: handWidth, height: handHeight, marginTop: -handOffsetY}
                        ]}>
                            <ReactSketchCanvas
                                ref={rightHandRef}
                                style={styles.canvas}
                                width={handWidth}
                                height={handHeight}
                                {...canvasProps}
                            />
                        </CanvasWrapper>
                        <CanvasWrapper style={[styles.canvasWrapper, { width: armWidth, height: armHeight2 }]}>
                            <ReactSketchCanvas
                                ref={rightLowerArmRef}
                                style={styles.canvas}
                                width={armWidth}
                                height={armHeight2}
                                {...canvasProps}
                            />
                        </CanvasWrapper>
                        <CanvasWrapper style={[styles.canvasWrapper, { width: armWidth, height: armHeight1 }]}>
                            <ReactSketchCanvas
                                ref={rightUpperArmRef}
                                style={styles.canvas}
                                width={armWidth}
                                height={armHeight1}
                                {...canvasProps}
                            />
                        </CanvasWrapper>
                    </View>
                    <View style={styles.legColumn}>
                        {/* Torso */}
                        <CanvasWrapper style={[styles.canvasWrapper, { width: torsoWidth, height: torsoHeight }]}>
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
                                <CanvasWrapper style={[styles.canvasWrapper, { width: legWidth, height: legHeight }]}>
                                    <ReactSketchCanvas
                                    ref={rightUpperLegRef}
                                    style={styles.canvas}
                                    width={legWidth}
                                    height={legHeight}
                                    {...canvasProps}
                                    />
                                </CanvasWrapper>
                                <CanvasWrapper style={[styles.canvasWrapper, { width: legWidth, height: legHeight }]}>
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
                                <CanvasWrapper style={[styles.canvasWrapper, { width: legWidth, height: legHeight }]}>
                                    <ReactSketchCanvas
                                    ref={leftUpperLegRef}
                                    style={styles.canvas}
                                    width={legWidth}
                                    height={legHeight}
                                    {...canvasProps}
                                    />
                                </CanvasWrapper>
                                <CanvasWrapper style={[styles.canvasWrapper, { width: legWidth, height: legHeight }]}>
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
                    <View style={styles.armRow}>
                        <CanvasWrapper style={[styles.canvasWrapper, { width: armWidth, height: armHeight1 }]}>
                            <ReactSketchCanvas
                                ref={leftUpperArmRef}
                                style={{ backgroundColor: 'transparent' }}
                                width={armWidth}
                                height={armHeight1}
                                {...canvasProps}
                            />
                        </CanvasWrapper>
                        <CanvasWrapper style={[styles.canvasWrapper, { width: armWidth, height: armHeight2 }]}>
                            <ReactSketchCanvas
                            ref={leftLowerArmRef}
                            style={styles.canvas}
                            width={armWidth}
                            height={armHeight2}
                            {...canvasProps}
                            />
                        </CanvasWrapper>
                        <CanvasWrapper style={[styles.canvasWrapper, styles.hand,
                            { width: handWidth, height: handHeight, marginTop: -handOffsetY}]}>
                            <ReactSketchCanvas
                                ref={leftHandRef}
                                style={styles.canvas}
                                width={handWidth}
                                height={handHeight}
                                {...canvasProps}
                            />
                        </CanvasWrapper>
                    </View>              
                </View>
                {/* Feet */}
                <View style={styles.legsRow}>
                    <CanvasWrapper style={[styles.canvasWrapper, { width: footWidth, height: footHeight}]}>
                        <ReactSketchCanvas
                            ref={rightFootRef}
                            style={styles.canvas}
                            width={footWidth}
                            height={footHeight}
                            {...canvasProps}
                        />
                    </CanvasWrapper>
                    <CanvasWrapper style={[styles.canvasWrapper, { width: footWidth, height: footHeight}]}>
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
        padding: 12, 
        borderBottomLeftRadius: 8,
    },

    canvasWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
        overflow: 'hidden',
        boxShadow: '0 0 6px white',
    },

    canvas: {
        backgroundColor: 'transparent',
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

    hand: {
        borderRadius: 50,
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