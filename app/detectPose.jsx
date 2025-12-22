import React, { useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import * as poseDetection from '@tensorflow-models/pose-detection';
import PoseCanvas from '../components/poseCanvas';
import { useLocalSearchParams } from 'expo-router';
import { Dimensions, StyleSheet } from 'react-native';

const { width, height } = Dimensions.get('window');

/* Detect Pose and Overlay SVGs
--------------------------------------------------------------------------------------------------*/
const DetectPose = () => {
  const webcamRef = useRef(null);
  const [isTfReady, setIsTfReady] = useState(false);
  const [landmarks, setLandmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  const params = useLocalSearchParams();
  const svgs = params.svgs ? JSON.parse(params.svgs) : {};
  const mapping = params.mapping ? JSON.parse(params.mapping) : {};

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

  /* Render Webcam and PoseCanvas
  --------------------------------------------------------------------------------------------------
  Overlay PoseCanvas on top of Webcam to display detected poses with SVGs
  ------------------------------------------------------------------------------------------------*/
  return (
    <div style={styles.container}>
      <div style={styles.mediaWrapper}>
        {/* Webcam Feed */}
        <Webcam
          ref={webcamRef}
          style={styles.webcam}
          videoConstraints={{
            width: 640,
            height: 480,
            facingMode: 'user',
          }}
        />
        {/* Display SVGs Aligned with Detected Landmarks */}
        <PoseCanvas
          width={1024}
          height={768}
          landmarks={landmarks}
          svgs={svgs}
          mapping={mapping}
          style={styles.poseCanvas}
        />
      </div>
    </div>
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
    backgroundColor: 'black',
  },

  mediaWrapper: {
    position: 'relative',
    width: 1024,
    height: 768,
  },

  webcam: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 640,
    height: 480,
    zIndex: 0,
    visibility: 'hidden',
  },

  poseCanvas: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 1024,
    height: 768,
    zIndex: 1,
  },
});