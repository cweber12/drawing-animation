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
import { StyleSheet, useWindowDimensions } from 'react-native';
import ThemedView from '../components/themed_elements/ThemedView';
import { CANVAS_WIDTH, CANVAS_HEIGHT, getWebcamDimensions } from '../constants/Sizes';
import { smoothLandmarks } from '../utils/poseUtils';

const DetectPose = () => {
  
  const webcamRef = useRef(null);
  const videoRef = useRef(null); 
  const navigation = useNavigation(); 
  const params = useLocalSearchParams(); 

  /* Geet screen dimensions and define isSmallScreen for responsive layout
  ------------------------------------------------------------------------------------------------*/
  const { width, height } = useWindowDimensions();
  const isSmallScreen = width < 768;

  /* Get webcam dimensions from constants/Sizes.js
  ------------------------------------------------------------------------------------------------*/
  const { width: webcamWidth, height: webcamHeight } = getWebcamDimensions();
  
  /* Parse SVGs and mapping from URL Params
  ------------------------------------------------------------------------------------------------*/
  const svgs = params.svgs ? JSON.parse(params.svgs) : {};
  const mapping = params.mapping ? JSON.parse(params.mapping) : {};
  const armOrientation = params.armOrientation || (isSmallScreen ? 'vertical' : 'horizontal');
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
  
  /* Ref to Track First Start of Detection
  --------------------------------------------------------------------------------------------------
  -  Pose animation displays after detection has stopped. Without this ref, the animation would show
     immediately on first load since isDetecting is false initially.
  -  After first start, the animation shows every time detection stops.
  ------------------------------------------------------------------------------------------------*/
  const firstStartRef = useRef(true);

  /* Filter saved landmarks to remove low-confidence points (score < 0.3)
  --------------------------------------------------------------------------------------------------
  -  This prevents jittery points during animation replay
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
    navigation.setParams({
      onToggleWebcam: toggleWebcam,
      onDetectionStarted: () => {
        firstStartRef.current = false;
        setSavedLandmarks([]);
        setShowPoseAnimation(false);
        setIsDetecting(true);
      },
      onDetectionStopped: () => {
        setIsDetecting(false);
        if (!firstStartRef.current) setShowPoseAnimation(true);
      },
      viewMode,
      showPoseAnimation,
    });
  }, [
    navigation,
    toggleWebcam,
    viewMode,
    showPoseAnimation,
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
  --------------------------------------------------------------------------------------------------
  On detection start: 
    - Clear saved landmarks
    - Hide pose animation
    - Set firstStartRef to false (so animation is shown on subsequent stops)
  On detection stop:
    - Show pose animation (if not first start)   
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

  /* Detect Pose from Webcam Feed and Update Landmarks
  --------------------------------------------------------------------------------------------------
  - requestAnimationFrame (built in browser API) ised to create a loop for continuous pose detection
    on each frame
  - In 'pose' mode, detected landmarks are saved for animation replay
  - Cleanup function disposes of the detector when component unmounts 
  ------------------------------------------------------------------------------------------------*/
  useEffect(() => {
    let detector;
    let cancelled = false;

    const runPoseDetection = async () => {
      detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet);
      if (cancelled) return;

      setLoading(false); // pose model loaded

      const detect = async () => {
        if (cancelled) return;
        const video = videoUri ? videoRef.current : webcamRef.current?.video;
        if (!video || video.readyState !== 4) { // video not ready
          requestAnimationFrame(detect);
          return;
        }
        try { // estimate poses
          if (isDetecting) {
            const poses = await detector.estimatePoses(video, { flipHorizontal: true });
            let currentLandmarks = poses?.[0]?.keypoints ?? []; // get keypoints (or empty array)
            
            if (videoUri && videoLoaded) {
              const videoWidth = video.videoWidth;
              const videoHeight = video.videoHeight;
              // Scale landmarks to match webcam dimensions
              const scaleX = CANVAS_WIDTH / videoWidth;
              const scaleY = 1;
              currentLandmarks = currentLandmarks.map(kp => ({
                ...kp,
                x: kp.x * scaleX,
                y: kp.y * scaleY,
              }));
            }
            
            setLandmarks(currentLandmarks); // update current landmarks

            
            if (viewMode === 'pose') { // In 'pose' mode, save landmarks for animation
              setSavedLandmarks(prev => [...prev, JSON.parse(JSON.stringify(currentLandmarks))]);
            }
          }
        } catch (e) {
          console.error('estimatePoses error:', e);
        }
        requestAnimationFrame(detect); // get next frame
      };
      detect(); // continue detection loop
    };

    if (isTfReady) { // start pose detection when TF is ready
      runPoseDetection();
    }

    return () => {
      cancelled = true;
      try {
        detector?.dispose?.();
      } catch {}
    };
  }, [isTfReady, isDetecting]);

  if (!isTfReady || loading) {
    return (
      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <div>Loading pose model...</div>
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
     <ThemedView style={styles.container}>
      <div style={{ position: 'relative', width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}>
        {(viewMode === 'svg' || showPoseAnimation) && (
          <SvgCanvas
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            webcamWidth={webcamWidth}
            webcamHeight={webcamHeight}
            landmarks={landmarks}
            savedLandmarks={smoothedSavedLandmarks}
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
                  width: CANVAS_WIDTH,
                  height: CANVAS_HEIGHT,
                  background: '#000',
                  objectFit: 'cover',
                }}
                onLoadedMetadata={() => videoRef.current && videoRef.current.play()}
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
              width={viewMode === 'pose' ? CANVAS_WIDTH : webcamWidth}
              height={viewMode === 'pose' ? CANVAS_HEIGHT : webcamHeight}
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
        
      </div>
    </ThemedView>
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
  
  container: {
    display: 'flex',
    justifyContent: 'flex-start',
    paddingTop: 20,
    alignItems: 'center',
    width: '100vw',
    height: '100vh',
    overflow: 'hidden',
  },

  mediaWrapper: {
    position: 'relative',

  },

  webcam: {
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: 2,

  },

  poseCanvas: {
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: 3,
  },

  svgCanvas: {
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: 1,
  },
});