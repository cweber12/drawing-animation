import React, { useRef, useState, useContext, useEffect, useCallback} from 'react';
import { View, StyleSheet, Dimensions, Button } from 'react-native';
import { ReactSketchCanvas } from 'react-sketch-canvas';
import { useRouter, useNavigation } from 'expo-router';
import { CANVAS_LANDMARK_MAP } from '../constants/LandmarkData';
import ThemedView from '../components/ThemedView';


const { width, height } = Dimensions.get('window');

const DrawWeb = () => {
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
    const torsoWidth = width * 0.15;
    const torsoHeight = height * 0.25;
    const legWidth = (torsoWidth * 0.5) - 1;
    const legHeight = torsoHeight * 0.65;
    const armWidth = torsoWidth * 0.65;
    const armHeight1 = (torsoHeight * 0.45) - 1;
    const armHeight2 = (torsoHeight * 0.45) - 1;
    const handHeight = armHeight1 * 4;
    const handWidth = armWidth * 2;
    const handOffsetY = armHeight1 + armHeight1 / 2;
    const headHeight = torsoHeight * 0.75;
    const headWidth = torsoWidth;
    const footHeight = torsoHeight * 0.35;
    const footWidth = legWidth * 1.5;

    // Common canvas export properties
    const canvasProps = {
        canvasColor: 'rgba(0,0,0,0)',          
        exportWithBackgroundImage: false,      
        svgStyle: { background: 'transparent'} ,
        strokeWidth: 2,
        strokeColor: "black"
    };

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
        });
    }, [navigation, clearAll, saveAll, goToDetectPose]);

    return (

        <ThemedView style={styles.container}>
            {/* Head */}
            <View style={[styles.canvasWrapper, styles.head, { width: headWidth, height: headHeight}]}>
                <ReactSketchCanvas
                ref={headRef}
                style={styles.canvas}
                width={headWidth}
                height={headHeight}
                {...canvasProps}
                />
            </View>
            {/* Arms and Torso */}
            <View style={styles.armTorsoRow}>
                {/* Left Arm (upper + lower) */}
                <View style={styles.armRow}>
                    <View 
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
                    </View>
                    <View style={[styles.canvasWrapper, { width: armWidth, height: armHeight2 }]}>
                        <ReactSketchCanvas
                            ref={rightLowerArmRef}
                            style={styles.canvas}
                            width={armWidth}
                            height={armHeight2}
                            {...canvasProps}
                        />
                    </View>
                    <View style={[styles.canvasWrapper, { width: armWidth, height: armHeight1 }]}>
                        <ReactSketchCanvas
                            ref={rightUpperArmRef}
                            style={styles.canvas}
                            width={armWidth}
                            height={armHeight1}
                            {...canvasProps}
                        />
                    </View>
                </View>
                <View style={styles.legColumn}>
                    {/* Torso */}
                    <View style={[styles.canvasWrapper, { width: torsoWidth, height: torsoHeight }]}>
                        <ReactSketchCanvas
                            ref={torsoRef}
                            style={styles.canvas}
                            width={torsoWidth}
                            height={torsoHeight}
                            {...canvasProps}
                        />
                    </View>
                    {/* Legs */}
                    <View style={styles.legsRow}>
                        {/* Right Leg (upper + lower) */}
                        <View style={[styles.legColumn, {alignItems: "flex-end"}]}>
                            <View style={[styles.canvasWrapper, { width: legWidth, height: legHeight }]}>
                                <ReactSketchCanvas
                                ref={rightUpperLegRef}
                                style={styles.canvas}
                                width={legWidth}
                                height={legHeight}
                                {...canvasProps}
                                />
                            </View>
                            <View style={[styles.canvasWrapper, { width: legWidth, height: legHeight }]}>
                                <ReactSketchCanvas
                                ref={rightLowerLegRef}
                                style={styles.canvas}
                                width={legWidth}
                                height={legHeight}
                                {...canvasProps}
                                />
                            </View>
                            
                        </View>
                        {/* Left Leg (upper + lower) */}
                        <View style={[styles.legColumn, {alignItems: "flex-start"}]}>
                            <View style={[styles.canvasWrapper, { width: legWidth, height: legHeight }]}>
                                <ReactSketchCanvas
                                ref={leftUpperLegRef}
                                style={styles.canvas}
                                width={legWidth}
                                height={legHeight}
                                {...canvasProps}
                                />
                            </View>
                            <View style={[styles.canvasWrapper, { width: legWidth, height: legHeight }]}>
                                <ReactSketchCanvas
                                ref={leftLowerLegRef}
                                style={styles.canvas}
                                width={legWidth}
                                height={legHeight}
                                {...canvasProps}
                                />
                            </View>
                        </View>
                    </View>
                </View>
                {/* Left Arm (upper + lower) */}
                <View style={styles.armRow}>
                    <View style={[styles.canvasWrapper, { width: armWidth, height: armHeight1 }]}>
                        <ReactSketchCanvas
                            ref={leftUpperArmRef}
                            style={{ backgroundColor: 'transparent' }}
                            width={armWidth}
                            height={armHeight1}
                            {...canvasProps}
                        />
                    </View>
                    <View style={[styles.canvasWrapper, { width: armWidth, height: armHeight2 }]}>
                        <ReactSketchCanvas
                        ref={leftLowerArmRef}
                        style={styles.canvas}
                        width={armWidth}
                        height={armHeight2}
                        {...canvasProps}
                        />
                    </View>
                    <View style={[styles.canvasWrapper, styles.hand,
                        { width: handWidth, height: handHeight, marginTop: -handOffsetY}]}>
                        <ReactSketchCanvas
                            ref={leftHandRef}
                            style={styles.canvas}
                            width={handWidth}
                            height={handHeight}
                            {...canvasProps}
                        />
                    </View>
                </View>              
            </View>
            {/* Feet */}
            <View style={styles.legsRow}>
                <View style={[styles.canvasWrapper, { width: footWidth, height: footHeight}]}>
                    <ReactSketchCanvas
                        ref={rightFootRef}
                        style={styles.canvas}
                        width={footWidth}
                        height={footHeight}
                        {...canvasProps}
                    />
                </View>
                <View style={[styles.canvasWrapper, { width: footWidth, height: footHeight}]}>
                    <ReactSketchCanvas
                        ref={leftFootRef}
                        style={styles.canvas}
                        width={footWidth}
                        height={footHeight}
                        {...canvasProps}
                    />
                </View>
            </View>
        </ThemedView>
    );
};

export default DrawWeb;

const styles = StyleSheet.create({
    container: {
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

    canvasWrapper: {
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
        overflow: 'hidden',
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