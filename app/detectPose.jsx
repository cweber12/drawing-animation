import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import Webcam from 'react-webcam';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import * as poseDetection from '@tensorflow-models/pose-detection';
import SvgCanvas from '../components/canvas/SvgCanvas';
import PoseCanvas from '../components/canvas/PoseCanvas';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import ThemedView from '../components/themed_elements/ThemedView';
import { CANVAS_WIDTH, CANVAS_HEIGHT, WEBCAM_WIDTH, WEBCAM_HEIGHT } from '../constants/Sizes';
import { smoothLandmarks } from '../utils/poseUtils';
import { uploadJsonToS3 } from '../utils/s3Utils';

/* Detect Pose and Overlay SVGs
----------------------------------------------------------------------------------------------------
This page uses TensorFlow.js to detect human poses from the webcam feed and uses detected pose
landmarks as anchors to overlay SVGs body parts sketched in the drawWeb page. It supports two view 
modes:

- 'svg': Live animation mode where SVGs are animated in real-time based on detected poses.
- 'pose': Pose recording mode where detected poses are recorded and can be replayed as an animation.
--------------------------------------------------------------------------------------------------*/
const DetectPose = () => {
  const webcamRef = useRef(null); // Reference to the webcam component
  const navigation = useNavigation(); // Navigation object for setting params
  const params = useLocalSearchParams(); // Get URL params
  
  // Parse svgs and mapping from URL params
  const svgs = params.svgs ? JSON.parse(params.svgs) : {};
  const mapping = params.mapping ? JSON.parse(params.mapping) : {};

  // Normalize viewMode param (works with react native or web)
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
  
  /* Ref to Track First Start of Detection
  -  Pose animation displays after detection has stopped. Without this ref, the animation would show
     immediately on first load since isDetecting is false initially.
  -  After first start, the animation shows every time detection stops.
  ------------------------------------------------------------------------------------------------*/
  const firstStartRef = useRef(true);

  /* Filter Saved Landmarks to Remove Low-Confidence Points ( < 0.3 )
  ------------------------------------------------------------------------------------------------*/
  const filteredLandmarks = useMemo(() =>
    savedLandmarks.map(frame =>
      frame.map(point =>
        point && point.score > 0.3 ? point : null
      )
    ),
    [savedLandmarks]
  );
  
  /* Smooth Saved Landmarks 
  -  Apply moving average smoothing if showPoseAnimation is true
  -  Reduces jitter and flickering in the replayed animation 
  ------------------------------------------------------------------------------------------------*/
  const smoothedSavedLandmarks = useMemo(() => (
    showPoseAnimation && filteredLandmarks.length > 0
      ? smoothLandmarks(filteredLandmarks, 5)
      : filteredLandmarks
  ), [showPoseAnimation, filteredLandmarks]);
  
  /* Update isDetecting based on viewMode
  - pose mode: not detecting initially, detect when start button pressed
  - svg mode: always detecting
  ------------------------------------------------------------------------------------------------*/
  useEffect(() => {
    if (viewMode === 'pose') {
      setIsDetecting(false);
    } else if (viewMode === 'svg') {
      setIsDetecting(true);
    }
  }, [viewMode]);

  const toggleWebcam = useCallback(() => {
      setShowWebcam(prev => !prev);
  }, []);

  /* Set Navigation Params for Header Buttons
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
      // Ensure the backend is initialized (prevents odd runtime states on web)
      await tf.setBackend('webgl');
      await tf.ready();
      if (!cancelled) setIsTfReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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
  ------------------------------------------------------------------------------------------------*/
  useEffect(() => {
    let detector;
    let cancelled = false;

    const runPoseDetection = async () => {
      detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet);
      if (cancelled) return;

      setLoading(false);

      const detect = async () => {
        if (cancelled) return;
        const video = webcamRef.current?.video;
        if (!video || video.readyState !== 4) {
          requestAnimationFrame(detect);
          return;
        }
        try {
          if (isDetecting) {
            const poses = await detector.estimatePoses(video, { flipHorizontal: true });
            const currentLandmarks = poses?.[0]?.keypoints ?? [];
            setLandmarks(currentLandmarks);
            if (viewMode === 'pose') {
              setSavedLandmarks(prev => [...prev, JSON.parse(JSON.stringify(currentLandmarks))]);
            }
          }
        } catch (e) {
          console.error('estimatePoses error:', e);
        }
        requestAnimationFrame(detect);
      };
      detect();
    };

    if (isTfReady) {
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
  Overlay SvgCanvas on top of Webcam to display detected poses with SVGs
  ------------------------------------------------------------------------------------------------*/
  return (
     <ThemedView style={styles.container}>
      <div style={{ position: 'relative', width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}>
        {(viewMode === 'svg' || showPoseAnimation) && (
          <SvgCanvas
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            webcamWidth={WEBCAM_WIDTH}
            webcamHeight={WEBCAM_HEIGHT}
            landmarks={landmarks}
            savedLandmarks={smoothedSavedLandmarks}
            viewMode={viewMode}
            replay={showPoseAnimation}
            svgs={svgs}
            mapping={mapping}
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
            <Webcam
              ref={webcamRef}
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                zIndex: 2,
                visibility: showWebcam ? 'visible' : 'hidden',
                width: viewMode === 'pose' ? CANVAS_WIDTH : WEBCAM_WIDTH,
                height: viewMode === 'pose' ? CANVAS_HEIGHT : WEBCAM_HEIGHT,
              }}
              videoConstraints={{
                width: viewMode === 'pose' ? CANVAS_WIDTH : WEBCAM_WIDTH,
                height: viewMode === 'pose' ? CANVAS_HEIGHT : WEBCAM_HEIGHT,
                facingMode: 'user',
              }}
            />

            <PoseCanvas
              width={viewMode === 'pose' ? CANVAS_WIDTH : WEBCAM_WIDTH}
              height={viewMode === 'pose' ? CANVAS_HEIGHT : WEBCAM_HEIGHT}
              landmarks={landmarks}
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                zIndex: 3,
                width: viewMode === 'pose' ? CANVAS_WIDTH : WEBCAM_WIDTH,
                height: viewMode === 'pose' ? CANVAS_HEIGHT : WEBCAM_HEIGHT,
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