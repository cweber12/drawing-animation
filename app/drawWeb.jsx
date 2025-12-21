import { useRef } from 'react';
import { View, StyleSheet, Dimensions, Button } from 'react-native';
import { ReactSketchCanvas } from 'react-sketch-canvas';
import { useRouter } from 'expo-router';
import { useState } from 'react';

const { width, height } = Dimensions.get('window');

const DrawWeb = () => {
    const router = useRouter();
    const bodySvgsRef = useRef({});
    
    // Refs for all canvases
    const headRef = useRef(null);
    const torsoRef = useRef(null);
    const leftUpperArmRef = useRef(null);
    const leftLowerArmRef = useRef(null);
    const leftHandRef = useRef(null);
    const rightUpperArmRef = useRef(null);
    const rightLowerArmRef = useRef(null);
    const rightHandRef = useRef(null);
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
        rightUpperArm: {
            topRight: LANDMARKS.leftShoulder,
            bottomLeft: LANDMARKS.leftElbow},
        rightLowerArm: {
            topLeft: LANDMARKS.leftElbow,
            bottomCenter: LANDMARKS.leftWrist},
        leftUpperArm: {
            topLeft: LANDMARKS.rightShoulder,
            bottomRight: LANDMARKS.rightElbow},
        leftLowerArm: {
            topRight: LANDMARKS.rightElbow,
            bottomCenter: LANDMARKS.rightWrist},
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
        rightHand: {center: LANDMARKS.rightWrist},
        leftHand: {center: LANDMARKS.leftWrist},
        leftFoot: {center: LANDMARKS.leftAnkle},
        rightFoot: {center: LANDMARKS.rightAnkle},

    };

    // Sizes
    const torsoWidth = width * 0.12;
    const torsoHeight = height * 0.24;
    const limbWidth = (torsoWidth * 0.5) - 1;
    const armHeight = (torsoHeight * 0.5) - 1;
    const headHeight = torsoHeight * 0.75;
    const headWidth = torsoWidth + (limbWidth * 2);
    const legHeight = torsoHeight * 0.5;
    const footHeight = torsoHeight * 0.5;
    const footWidth = limbWidth * 2;
    const handHeight = torsoHeight;
    const handWidth = limbWidth;

    const clearAll = () => {
        headRef.current?.clearCanvas();
        torsoRef.current?.clearCanvas();
        leftUpperArmRef.current?.clearCanvas();
        leftLowerArmRef.current?.clearCanvas();
        leftHandRef.current?.clearCanvas();
        rightUpperArmRef.current?.clearCanvas();
        rightLowerArmRef.current?.clearCanvas();
        rightHandRef.current?.clearCanvas();
        leftUpperLegRef.current?.clearCanvas();
        leftLowerLegRef.current?.clearCanvas();
        leftFootRef.current?.clearCanvas();
        rightUpperLegRef.current?.clearCanvas();
        rightLowerLegRef.current?.clearCanvas();
        rightFootRef.current?.clearCanvas();
    };

    // update saveAll:
    const saveAll = async () => {
        try {
            const svgs = {
            head: await headRef.current.exportSvg(),
            torso: await torsoRef.current.exportSvg(),
            leftUpperArm: await leftUpperArmRef.current.exportSvg(),
            leftLowerArm: await leftLowerArmRef.current.exportSvg(),
            leftHand: await leftHandRef.current.exportSvg(),
            rightUpperArm: await rightUpperArmRef.current.exportSvg(),
            rightLowerArm: await rightLowerArmRef.current.exportSvg(),
            rightHand: await rightHandRef.current.exportSvg(),
            leftUpperLeg: await leftUpperLegRef.current.exportSvg(),
            leftLowerLeg: await leftLowerLegRef.current.exportSvg(),
            leftFoot: await leftFootRef.current.exportSvg(),
            rightUpperLeg: await rightUpperLegRef.current.exportSvg(),
            rightLowerLeg: await rightLowerLegRef.current.exportSvg(),
            rightFoot: await rightFootRef.current.exportSvg(),
            };

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
                <View style={styles.armColumn}>
                    
                    <View style={[styles.canvasWrapper, { width: limbWidth, height: armHeight }]}>
                        <ReactSketchCanvas
                            ref={leftUpperArmRef}
                            style={styles.canvas}
                            width={limbWidth}
                            height={armHeight}
                            strokeWidth={4}
                            strokeColor="black"
                        />
                    </View>
                    <View style={[styles.canvasWrapper, { width: limbWidth, height: armHeight }]}>
                        <ReactSketchCanvas
                            ref={leftLowerArmRef}
                            style={styles.canvas}
                            width={limbWidth}
                            height={armHeight}
                            strokeWidth={4}
                            strokeColor="black"
                        />
                    </View>
                    <View style={[styles.canvasWrapper, { width: handWidth, height: handHeight }]}>
                        <ReactSketchCanvas
                            ref={leftHandRef}
                            style={styles.canvas}
                            width={handWidth}
                            height={handHeight}
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
                <View style={styles.armColumn}>
                    <View style={[styles.canvasWrapper, { width: limbWidth, height: armHeight }]}>
                        <ReactSketchCanvas
                        ref={rightUpperArmRef}
                        style={styles.canvas}
                        width={limbWidth}
                        height={armHeight}
                        strokeWidth={4}
                        strokeColor="black"
                        />
                    </View>
                    <View style={[styles.canvasWrapper, { width: limbWidth, height: armHeight }]}>
                        <ReactSketchCanvas
                        ref={rightLowerArmRef}
                        style={styles.canvas}
                        width={limbWidth}
                        height={armHeight}
                        strokeWidth={4}
                        strokeColor="black"
                        />
                    </View>
                    <View style={[styles.canvasWrapper, { width: handWidth, height: handHeight }]}>
                        <ReactSketchCanvas
                        ref={rightHandRef}
                        style={styles.canvas}
                        width={handWidth}
                        height={handHeight}
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
        alignItems: 'center',
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