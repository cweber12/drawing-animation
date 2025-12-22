import { useRef } from 'react';
import { View, StyleSheet, Dimensions, Button } from 'react-native';
import { ReactSketchCanvas } from 'react-sketch-canvas';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { CANVAS_LANDMARK_MAP } from '../constants/landmarkData';

const { width, height } = Dimensions.get('window');

const DrawWeb = () => {
    // Router for navigation
    const router = useRouter();
    
    // State to trigger re-render when SVGs are saved
    const [bodySvgs, setBodySvgs] = useState({});

    // Ref to store saved SVGs
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
   
    // SVG dimensions
    const torsoWidth = width * 0.12;
    const torsoHeight = height * 0.24;
    const legWidth = (torsoWidth * 0.5) - 1;
    const armWidth = torsoWidth * 0.65;
    const armHeight1 = (torsoHeight * 0.45) - 1;
    const armHeight2 = (torsoHeight * 0.45) - 1;
    const headHeight = torsoHeight * 0.65;
    const headWidth = torsoWidth;
    const legHeight = torsoHeight * 0.65;
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
            <View style={styles.controls}>
                <Button title="Clear"onPress={clearAll}/>
                <Button title="Save" onPress={saveAll} />
                <Button title="Open Camera" onPress={goToDetectPose} />
            </View>
            {/* Head */}
            <View style={[styles.canvasWrapper, { width: headWidth, height: headHeight}]}>
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
                    <View style={[styles.canvasWrapper, { width: armWidth, height: armHeight2 }]}>
                        <ReactSketchCanvas
                            ref={leftLowerArmRef}
                            style={styles.canvas}
                            width={armWidth}
                            height={armHeight2}
                            {...canvasProps}
                        />
                    </View>
                    <View style={[styles.canvasWrapper, { width: armWidth, height: armHeight1 }]}>
                        <ReactSketchCanvas
                            ref={leftUpperArmRef}
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
                        {/* Left Leg (upper + lower) */}
                        <View style={[styles.legColumn, {alignItems: "flex-end"}]}>
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
                        {/* Right Leg (upper + lower) */}
                        <View style={[styles.legColumn, {alignItems: "flex-start"}]}>
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
                    </View>
                </View>
                {/* Right Arm (upper + lower) */}
                <View style={styles.armRow}>
                    <View style={[styles.canvasWrapper, { width: armWidth, height: armHeight1 }]}>
                        <ReactSketchCanvas
                            ref={rightUpperArmRef}
                            style={{ backgroundColor: 'transparent' }}
                            width={armWidth}
                            height={armHeight1}
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
                        {...canvasProps}
                    />
                </View>
                <View style={[styles.canvasWrapper, { width: footWidth, height: footHeight}]}>
                    <ReactSketchCanvas
                        ref={rightFootRef}
                        style={styles.canvas}
                        width={footWidth}
                        height={footHeight}
                        {...canvasProps}
                    />
                </View>
            </View>
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
        backgroundColor: '#363636ff',
        gap: 2, 
    },

    controls: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        width: '100%',
        gap: 8,
    },

    canvasWrapper: {
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
    },

    canvas: {
        backgroundColor: 'transparent',
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