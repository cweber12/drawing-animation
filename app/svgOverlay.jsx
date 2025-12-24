import React, { useEffect, useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import * as poseDetection from '@tensorflow-models/pose-detection';
import SvgCanvas from '../components/SvgCanvas';
import PoseCanvas from '../components/PoseCanvas';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import ThemedView from '../components/ThemedView';
import { CANVAS_WIDTH, CANVAS_HEIGHT, WEBCAM_WIDTH, WEBCAM_HEIGHT } from '../constants/Sizes';

/* Detect Pose and Overlay SVGs
--------------------------------------------------------------------------------------------------*/
const SvgOverlay = () => {
  const webcamRef = useRef(null);
  const navigation = useNavigation();
  const params = useLocalSearchParams();

  const svgs = params.svgs ? JSON.parse(params.svgs) : {};
  const mapping = params.mapping ? JSON.parse(params.mapping) : {};

  // Normalize viewMode param (works with react native or web)
  const viewModeParam = Array.isArray(params.viewMode) ? params.viewMode[0] : params.viewMode;
  const viewMode = viewModeParam || 'svg';
  
  const [isTfReady, setIsTfReady] = useState(false);
  const [landmarks, setLandmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWebcam, setShowWebcam] = useState(true);
  const [isDetecting, setIsDetecting] = useState(false);
  const [savedLandmarks, setSavedLandmarks] = useState([]);
  
  // State to control viewing of saved landmarks after detection stops in pose mode
  const [viewSavedLandmarks, setViewSavedLandmarks] = useState(false);
  const firstStartRef = useRef(true);

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
        setViewSavedLandmarks(false);
        setIsDetecting(true);
      },
      onDetectionStopped: () => {
        setIsDetecting(false);
        if (!firstStartRef.current) setViewSavedLandmarks(true);
      },
      viewMode,
    });
  }, [navigation, toggleWebcam, viewMode]);

  
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
      setViewSavedLandmarks(false);
      firstStartRef.current = false;
    } else if (!firstStartRef.current) {
      setViewSavedLandmarks(true);
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
        {(viewMode === 'svg' || viewSavedLandmarks) && (
          <SvgCanvas
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            webcamWidth={WEBCAM_WIDTH}
            webcamHeight={WEBCAM_HEIGHT}
            landmarks={landmarks}
            savedLandmarks={savedLandmarks}
            viewMode={viewMode}
            replay={viewSavedLandmarks}
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
        {(viewMode === 'svg' || (viewMode === 'pose' && !viewSavedLandmarks)) && (
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

export default SvgOverlay;

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