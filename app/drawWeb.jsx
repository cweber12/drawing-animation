import { useRef } from 'react';
import { View, StyleSheet, Dimensions, Button } from 'react-native';
import { ReactSketchCanvas } from 'react-sketch-canvas';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { bottomLeft } from '@shopify/react-native-skia';

const { width, height } = Dimensions.get('window');

const DrawWeb = () => {
    const router = useRouter();
    const bodySvgsRef = useRef({});
    
    // Refs for all canvases
    const headRef = useRef(null);
    const torsoRef = useRef(null);
    const leftUpperArmRef = useRef(null);
    const leftLowerArmRef = useRef(null);
    const rightUpperArmRef = useRef(null);
    const rightLowerArmRef = useRef(null);
    const leftUpperLegRef = useRef(null);
    const leftLowerLegRef = useRef(null);
    const leftFootRef = useRef(null);
    const rightUpperLegRef = useRef(null);
    const rightLowerLegRef = useRef(null);
    const rightFootRef = useRef(null);

    const [bodySvgs, setBodySvgs] = useState({});

    const LANDMARKS = {
        nose: 0,
        leftEye: 1,
        rightEye: 2,
        leftEar: 3,
        rightEar: 4,
        leftShoulder: 5,
        rightShoulder: 6,
        leftElbow: 7,
        rightElbow: 8,
        leftWrist: 9,
        rightWrist: 10,
        leftHip: 11,
        rightHip: 12,
        leftKnee: 13,
        rightKnee: 14,
        leftAnkle: 15,
        rightAnkle: 16,
    };

    const CANVAS_LANDMARK_MAP = {
        // Screen-left arm (your left on screen) = rightShoulder/rightElbow/rightWrist
        leftUpperArm: { 
            rightCenter: LANDMARKS.rightShoulder, 
            leftCenter: LANDMARKS.rightElbow 
        },
        leftLowerArm: { 
            rightCenter: LANDMARKS.rightElbow, 
            leftCenter: LANDMARKS.rightWrist 
        },

        // Screen-right arm (your right on screen) = leftShoulder/leftElbow/leftWrist
        rightUpperArm: { 
            leftCenter: LANDMARKS.leftShoulder, 
            rightCenter: LANDMARKS.leftElbow 
        },

        rightLowerArm: { 
            leftCenter: LANDMARKS.leftElbow, 
            rightCenter: LANDMARKS.leftWrist 
        },
        
        rightUpperLeg: {
            topRight: LANDMARKS.leftHip,
            bottomLeft: LANDMARKS.leftKnee},
        rightLowerLeg: {
            topRight: LANDMARKS.leftKnee,
            bottomLeft: LANDMARKS.leftAnkle},
        leftUpperLeg: {
            topLeft: LANDMARKS.rightHip,
            bottomRight: LANDMARKS.rightKnee},
        leftLowerLeg: {
            topLeft: LANDMARKS.rightKnee,
            bottomRight: LANDMARKS.rightAnkle},
        torso: {
            topRight: LANDMARKS.leftShoulder,
            topLeft: LANDMARKS.rightShoulder,
            bottomRight: LANDMARKS.leftHip,
            bottomLeft: LANDMARKS.rightHip
        },
        head: {center: LANDMARKS.nose},
        leftFoot: {center: LANDMARKS.leftAnkle},
        rightFoot: {center: LANDMARKS.rightAnkle},

    };

    // Sizes
    const torsoWidth = width * 0.12;
    const torsoHeight = height * 0.24;
    const limbWidth = (torsoWidth * 0.5) - 1;
    const armHeight1 = (torsoHeight * 0.45) - 1;
    const armHeight2 = (torsoHeight * 0.45) - 1;
    const headHeight = torsoHeight * 0.75;
    const headWidth = torsoWidth;
    const legHeight = torsoHeight * 0.5;
    const footHeight = torsoHeight * 0.35;
    const footWidth = limbWidth * 2;

    const clearAll = () => {
        headRef.current?.clearCanvas();
        torsoRef.current?.clearCanvas();
        leftUpperArmRef.current?.clearCanvas();
        leftLowerArmRef.current?.clearCanvas();
        rightUpperArmRef.current?.clearCanvas();
        rightLowerArmRef.current?.clearCanvas();
        leftUpperLegRef.current?.clearCanvas();
        leftLowerLegRef.current?.clearCanvas();
        leftFootRef.current?.clearCanvas();
        rightUpperLegRef.current?.clearCanvas();
        rightLowerLegRef.current?.clearCanvas();
        rightFootRef.current?.clearCanvas();
    };

    const saveAll = async () => {
        try {
            const refs = {
                head: headRef,
                torso: torsoRef,
                leftUpperArm: leftUpperArmRef,
                leftLowerArm: leftLowerArmRef,
                rightUpperArm: rightUpperArmRef,
                rightLowerArm: rightLowerArmRef,
                leftUpperLeg: leftUpperLegRef,
                leftLowerLeg: leftLowerLegRef,
                leftFoot: leftFootRef,
                rightUpperLeg: rightUpperLegRef,
                rightLowerLeg: rightLowerLegRef,
                rightFoot: rightFootRef,
            };

            const svgs = {};
            for (const [key, ref] of Object.entries(refs)) {
                if (ref.current && ref.current.exportSvg) {
                    svgs[key] = await ref.current.exportSvg();
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
    };

    const goToDetectPose = async () => {
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
    };


    return (
        <View style={styles.container}>
            {/* Head */}
            <View style={[styles.canvasWrapper, { width: headWidth, height: headHeight}]}>
                <ReactSketchCanvas
                ref={headRef}
                style={styles.canvas}
                width={headWidth}
                height={headHeight}
                strokeWidth={4}
                strokeColor="black"
                />
            </View>
            {/* Arms and Torso */}
            <View style={styles.armTorsoRow}>
                {/* Left Arm (upper + lower) */}
                <View style={styles.armRow}>
                    <View style={[styles.canvasWrapper, { width: limbWidth, height: armHeight2 }]}>
                        <ReactSketchCanvas
                            ref={leftLowerArmRef}
                            style={styles.canvas}
                            width={limbWidth}
                            height={armHeight2}
                            strokeWidth={4}
                            strokeColor="black"
                        />
                    </View>
                    <View style={[styles.canvasWrapper, { width: limbWidth, height: armHeight1 }]}>
                        <ReactSketchCanvas
                            ref={leftUpperArmRef}
                            style={styles.canvas}
                            width={limbWidth}
                            height={armHeight1}
                            strokeWidth={4}
                            strokeColor="black"
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
                            strokeWidth={4}
                            strokeColor="black"
                        />
                    </View>
                    {/* Legs */}
                    <View style={styles.legsRow}>
                        {/* Left Leg (upper + lower) */}
                        <View style={[styles.legColumn, {alignItems: "flex-end"}]}>
                            <View style={[styles.canvasWrapper, { width: limbWidth, height: legHeight }]}>
                                <ReactSketchCanvas
                                ref={leftUpperLegRef}
                                style={styles.canvas}
                                width={limbWidth}
                                height={legHeight}
                                strokeWidth={4}
                                strokeColor="black"
                                />
                            </View>
                            <View style={[styles.canvasWrapper, { width: limbWidth, height: legHeight }]}>
                                <ReactSketchCanvas
                                ref={leftLowerLegRef}
                                style={styles.canvas}
                                width={limbWidth}
                                height={legHeight}
                                strokeWidth={4}
                                strokeColor="black"
                                />
                            </View>
                            
                        </View>
                        {/* Right Leg (upper + lower) */}
                        <View style={[styles.legColumn, {alignItems: "flex-start"}]}>
                            <View style={[styles.canvasWrapper, { width: limbWidth, height: legHeight }]}>
                                <ReactSketchCanvas
                                ref={rightUpperLegRef}
                                style={styles.canvas}
                                width={limbWidth}
                                height={legHeight}
                                strokeWidth={4}
                                strokeColor="black"
                                />
                            </View>
                            <View style={[styles.canvasWrapper, { width: limbWidth, height: legHeight }]}>
                                <ReactSketchCanvas
                                ref={rightLowerLegRef}
                                style={styles.canvas}
                                width={limbWidth}
                                height={legHeight}
                                strokeWidth={4}
                                strokeColor="black"
                                />
                            </View>
                        </View>
                    </View>
                </View>
                {/* Right Arm (upper + lower) */}
                <View style={styles.armRow}>
                    <View style={[styles.canvasWrapper, { width: limbWidth, height: armHeight1 }]}>
                        <ReactSketchCanvas
                        ref={rightUpperArmRef}
                        style={styles.canvas}
                        width={limbWidth}
                        height={armHeight1}
                        strokeWidth={4}
                        strokeColor="black"
                        />
                    </View>
                    <View style={[styles.canvasWrapper, { width: limbWidth, height: armHeight2 }]}>
                        <ReactSketchCanvas
                        ref={rightLowerArmRef}
                        style={styles.canvas}
                        width={limbWidth}
                        height={armHeight2}
                        strokeWidth={4}
                        strokeColor="black"
                        />
                    </View>
                </View>              
            </View>
            {/* Feet */}
            <View style={styles.legsRow}>
                <View style={[styles.canvasWrapper, { width: footWidth, height: footHeight}]}>
                    <ReactSketchCanvas
                        ref={leftFootRef}
                        style={styles.canvas}
                        width={footWidth}
                        height={footHeight}
                        strokeWidth={4}
                        strokeColor="black"
                    />
                </View>
                <View style={[styles.canvasWrapper, { width: footWidth, height: footHeight}]}>
                    <ReactSketchCanvas
                        ref={rightFootRef}
                        style={styles.canvas}
                        width={footWidth}
                        height={footHeight}
                        strokeWidth={4}
                        strokeColor="black"
                    />
                </View>
            </View>
            <Button title="Clear All Canvases"onPress={clearAll}/>
            <Button title="Save Drawing" onPress={saveAll} />
            <Button title="Go to Detect Pose" onPress={goToDetectPose} />
        
        </View>
    );
};

export default DrawWeb;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        backgroundColor: '#dededeff',
        gap: 2, 
    },

    canvasWrapper: {
        backgroundColor: '#242424ff',
        alignItems: 'center',
        justifyContent: 'center',
    },

    canvas: {
        backgroundColor: '#fff',
    },

    armTorsoRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'center',
        gap: 2, 
    },

    armRow: {
        flexDirection: 'row',
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