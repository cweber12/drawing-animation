/* app/detectPose.jsx
----------------------------------------------------------------------------------------------------
This page uses TensorFlow.js to detect human poses from the webcam feed and uses detected pose
landmarks as anchors to overlay SVGs body parts sketched in SketchPage. It supports two view 
modes:

- 'svg': Live animation mode where SVGs are animated in real-time based on detected poses.
- 'pose': Pose recording mode where detected poses are recorded and can be replayed as an animation.
--------------------------------------------------------------------------------------------------*/

import React, { useEffect, useRef, useState, useCallback, useMemo, use } from 'react';
import Webcam from 'react-webcam';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import * as poseDetection from '@tensorflow-models/pose-detection';
import SvgCanvas from '../components/canvas/SvgCanvas';
import PoseCanvas from '../components/canvas/PoseCanvas';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { StyleSheet } from 'react-native';
import { CANVAS_WIDTH, CANVAS_HEIGHT, getWebcamDimensions } from '../constants/Sizes';
import { smoothLandmarks } from '../utils/poseUtils';
import { FootCalculator } from '../utils/FootCalculator';
import ThemedPoseView from '../components/themed_components/ThemedPoseView';
import { usePoseDetection } from '../hooks/usePoseDetection';
import PoseInfo from '../components/info/PoseInfo';

const DetectPose = () => {
  
  const webcamRef = useRef(null);
  const videoRef = useRef(null); 
  const navigation = useNavigation(); 
  const params = useLocalSearchParams(); 

  /* Get webcam dimensions from constants/Sizes.js
  ------------------------------------------------------------------------------------------------*/
  const { width: webcamWidth, height: webcamHeight } = getWebcamDimensions();
  
  /* Parse SVGs and mapping from URL Params
  ------------------------------------------------------------------------------------------------*/
  const svgs = params.svgs ? JSON.parse(params.svgs) : {};
  console.log('detectPose: svgs loaded from params:', svgs);
  const mapping = params.mapping ? JSON.parse(params.mapping) : {};
  const armOrientation = params.armOrientation;
  const videoUri = params.videoUri || null;

  /* Normalize viewMode param so it is always a string (works with web and native)
  ------------------------------------------------------------------------------------------------*/
  const viewModeParam = Array.isArray(params.viewMode) ? params.viewMode[0] : params.viewMode;
  const viewMode = viewModeParam || 'svg';
  
  /* State Variables for Pose Detection
  ------------------------------------------------------------------------------------------------*/
  const [isTfReady, setIsTfReady] = useState(false); // TensorFlow.js readiness (for pose detection)
  const [loading, setLoading] = useState(true); // Loading state for pose model
  const [landmarks, setLandmarks] = useState([]); // Current detected pose landmarks
  const [isDetecting, setIsDetecting] = useState(false); // Are poses currently being detected
  const [savedLandmarks, setSavedLandmarks] = useState([]); // Saved landmarks (for pose mode)

  /* State Variables to Toggle Webcam and Pose Animation
  ------------------------------------------------------------------------------------------------*/
  const [showWebcam, setShowWebcam] = useState(true); 
  const [showPoseAnimation, setShowPoseAnimation] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);

  const [naturalVideoWidth, setNaturalVideoWidth] = useState(null);
  const [naturalVideoHeight, setNaturalVideoHeight] = useState(null);

  const [ showPoseInfo, setShowPoseInfo ] = useState(false);

  const footCalculator = useRef(new FootCalculator());
  
  /* Ref to Track First Start of Detection
  --------------------------------------------------------------------------------------------------
  -  Pose animation displays after detection has stopped. Without this ref, the animation would show
     immediately on first load since isDetecting is false initially.
  -  After first start, the animation shows every time detection stops.
  ------------------------------------------------------------------------------------------------*/
  const firstStartRef = useRef(true);

  /* Filter saved landmarks to remove low-confidence points (score < 0.3)
  ------------------------------------------------------------------------------------------------*/
  const filteredLandmarks = useMemo(() =>
    savedLandmarks.map(
      frame =>frame.map(point => point && point.score > 0.3 ? point : null)
    ),[savedLandmarks]
  );
  
  /* Apply smoothing to saved landmarks for pose animation
  --------------------------------------------------------------------------------------------------
  -  Only apply smoothing when showPoseAnimation is true to avoid lag during live detection
  ------------------------------------------------------------------------------------------------*/
  const smoothedSavedLandmarks = useMemo(() => (
    showPoseAnimation && filteredLandmarks.length > 0
      ? smoothLandmarks(filteredLandmarks, 5)
      : filteredLandmarks
  ), [showPoseAnimation, filteredLandmarks]);

  const estimatedLandmarks = useMemo(() => {
    if (smoothedSavedLandmarks.length === 0) return smoothedSavedLandmarks;
    return footCalculator.current.addFeetToLandmarks(smoothedSavedLandmarks);
  }, [smoothedSavedLandmarks]);
 
  /* Update isDetecting based on viewMode
  ------------------------------------------------------------------------------------------------*/
  useEffect(() => {
    if (viewMode === 'pose') {
      setIsDetecting(false); // start detecting when start button is pressed in pose mode
    } else if (viewMode === 'svg') {
      setIsDetecting(true); // always detect in svg mode
    }
  }, [viewMode]);

  useEffect(() => {
    if (videoUri) {
      setVideoLoaded(true); 
    }
  }, [videoUri]);

  /* Toggle Webcam Visibility
  ------------------------------------------------------------------------------------------------*/
  const toggleWebcam = useCallback(() => {
      setShowWebcam(prev => !prev);
  }, []);

  /* Set Navigation Params for Header Buttons
  --------------------------------------------------------------------------------------------------
  - Buttons in detectPoseButtons.jsx call these functions via navigation params
  - This effect updates the params when the user clicks a header button
  ------------------------------------------------------------------------------------------------*/
  useEffect(() => {
    console.log('DetectPose: Updating navigation params for header buttons');
    console.log('estimatedLandmarks:', estimatedLandmarks);
    navigation.setParams({
      onToggleWebcam: toggleWebcam, // toggle webcam visibility
      onDetectionStarted: () => {
        firstStartRef.current = false; // not first start anymore, next stop will show animation
        setSavedLandmarks([]); // clear saved landmarks
        setShowPoseAnimation(false); // hide pose animation during detection
        setIsDetecting(true); // detection started
      },
      onDetectionStopped: () => {
        setIsDetecting(false); // detection stopped
        if (!firstStartRef.current) setShowPoseAnimation(true); // show after fists start
      },
      onShowPoseInfo: () => {
        setShowPoseInfo(prev => !prev);
      },
      viewMode,
      showPoseAnimation,
      estimatedLandmarks,
      isDetecting,
    });
  }, [
    navigation,
    toggleWebcam,
    viewMode,
    showPoseAnimation,
    estimatedLandmarks,
    isDetecting,
    
  ]);

  /* Load TensorFlow.js and Pose Detection Model
  ------------------------------------------------------------------------------------------------*/
  useEffect(() => {
    let cancelled = false;
    (async () => {
      await tf.setBackend('webgl'); // set backend to webgl for better performance
      await tf.ready(); // wait for the model to be ready
      if (!cancelled) setIsTfReady(true); // update state only if not cancelled
    })();
    return () => {
      cancelled = true; // cleanup on unmount
    };
  }, []);

  /* Manage pose animation display based on isDetecting state
  ------------------------------------------------------------------------------------------------*/
  useEffect(() => {
    if (isDetecting) {
      setSavedLandmarks([]); 
      setShowPoseAnimation(false); 
      firstStartRef.current = false; 
    } else if (!firstStartRef.current) {
      setShowPoseAnimation(true);
    }
  }, [isDetecting, viewMode]);

  /* Custom hook to run pose detection
  ------------------------------------------------------------------------------------------------*/
  usePoseDetection({
    isTfReady,
    isDetecting,
    videoUri,
    videoRef,
    webcamRef,
    videoLoaded,
    naturalVideoWidth,
    naturalVideoHeight,
    setLandmarks,
    setSavedLandmarks,
    setLoading,
    viewMode,
  });

  if (!isTfReady || loading) {
    return (
      <div>
        <div style={styles.notificationText}>Loading pose model...</div>
      </div>
    );
  }

  /* Render Webcam and SvgCanvas
  --------------------------------------------------------------------------------------------------
  - SvgCanvas: Renders SVGs overlaid on detected pose landmarks
  - Webcam: Displays webcam feed (visibility toggled by header button)
  - PoseCanvas: Draws pose landmarks over webcam feed 
  ------------------------------------------------------------------------------------------------*/
  return (
     <ThemedPoseView>
        {showPoseInfo && <PoseInfo />}
        {(viewMode === 'svg' || showPoseAnimation) && (
          <SvgCanvas
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            webcamWidth={webcamWidth}
            webcamHeight={webcamHeight}
            landmarks={landmarks}
            savedLandmarks={estimatedLandmarks}
            replay={showPoseAnimation}
            svgs={svgs}
            mapping={mapping}
            armOrientation={armOrientation}
            videoLoaded={videoLoaded}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              zIndex: 1,
              width: CANVAS_WIDTH,
              height: CANVAS_HEIGHT,
            }}
          />
        )}
        {(viewMode === 'svg' || (viewMode === 'pose' && !showPoseAnimation)) && (
          <>
            {videoUri ? (
              <video
                ref={videoRef}
                src={videoUri}
                controls
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  zIndex: 2,
                  height: CANVAS_HEIGHT,
                  width: CANVAS_WIDTH,
                  
                  background: '#000',
                }}
                onLoadedMetadata={() => {
                  const video = videoRef.current;
                  if (video) {
                    setNaturalVideoWidth(video.videoWidth);
                    setNaturalVideoHeight(video.videoHeight);
                    video.play();
                  }
                  setVideoLoaded(true);
                }}
              />
            ) : (
              <Webcam
                ref={webcamRef}
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  zIndex: 2,
                  visibility: showWebcam ? 'visible' : 'hidden',
                  width: viewMode === 'pose' ? CANVAS_WIDTH : webcamWidth,
                  height: viewMode === 'pose' ? CANVAS_HEIGHT : webcamHeight,
                }}
                videoConstraints={{
                  width: viewMode === 'pose' ? CANVAS_WIDTH : webcamWidth,
                  height: viewMode === 'pose' ? CANVAS_HEIGHT : webcamHeight,
                  facingMode: 'user',
                }}
              />
            )}
            <PoseCanvas
              width={
                viewMode === 'pose'
                  ? (videoUri
                      ? CANVAS_WIDTH
                      : naturalVideoWidth || CANVAS_WIDTH)
                  : webcamWidth
              }
              height={
                viewMode === 'pose'
                  ? (videoUri
                      ? CANVAS_HEIGHT
                      : naturalVideoHeight || CANVAS_HEIGHT)
                  : webcamHeight
              }
              landmarks={landmarks}
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                zIndex: 3,
                width: viewMode === 'pose' ? CANVAS_WIDTH : webcamWidth,
                height: viewMode === 'pose' ? CANVAS_HEIGHT : webcamHeight,
              }}
            />

          </>
        )}  
    </ThemedPoseView>
  );
};

export default DetectPose;

const styles = StyleSheet.create({
  notificationText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
    fontFamily: 'segoe-ui',
  },
});