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
const DetectPose = () => {
  const webcamRef = useRef(null);
  const [isTfReady, setIsTfReady] = useState(false);
  const [landmarks, setLandmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWebcam, setShowWebcam] = useState(true);

  const navigation = useNavigation();
  const params = useLocalSearchParams();
  const svgs = params.svgs ? JSON.parse(params.svgs) : {};
  const mapping = params.mapping ? JSON.parse(params.mapping) : {};

  const toggleWebcam = useCallback(() => {
      setShowWebcam(prev => !prev);
  }, []);

  useEffect(() => {
      navigation.setParams({
          onToggleWebcam: toggleWebcam,
      });
  }, [navigation, toggleWebcam]);

  
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
          const poses = await detector.estimatePoses(video, { flipHorizontal: true });
          setLandmarks(poses?.[0]?.keypoints ?? []);
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
  }, [isTfReady]);

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
        <SvgCanvas
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          webcamWidth={WEBCAM_WIDTH}
          webcamHeight={WEBCAM_HEIGHT}
          landmarks={landmarks}
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
        <Webcam
          ref={webcamRef}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            zIndex: 2,
            width: WEBCAM_WIDTH,
            height: WEBCAM_HEIGHT,
          }}
          videoConstraints={{
            width: WEBCAM_WIDTH,
            height: WEBCAM_HEIGHT,
            facingMode: 'user',
          }}
        />
        <PoseCanvas
          width={WEBCAM_WIDTH}
          height={WEBCAM_HEIGHT}
          landmarks={landmarks}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            zIndex: 3,
            width: WEBCAM_WIDTH,
            height: WEBCAM_HEIGHT,
          }}
        />
      </div>
    </ThemedView>
  );
};

export default DetectPose;

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    justifyContent: 'center',
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