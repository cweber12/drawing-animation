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

  /* Detect Pose (safe loop; prevents overlapping estimatePoses calls)
  ------------------------------------------------------------------------------------------------*/
  useEffect(() => {
    let detector;
    let interval;
    let cancelled = false;
    let inFlight = false;

    const runPoseDetection = async () => {
      detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet);
      if (cancelled) return;

      setLoading(false);

      interval = setInterval(async () => {
        if (cancelled || inFlight) return;

        const video = webcamRef.current?.video;
        if (!video || video.readyState !== 4) return;

        // Guard against invalid dimensions (can trigger internal ROI/crop crashes)
        if (video.videoWidth <= 0 || video.videoHeight <= 0) return;

        inFlight = true;
        try {
          // IMPORTANT: pass the video element directly (avoid fromPixels overhead + concurrency issues)
          const poses = await detector.estimatePoses(video, { flipHorizontal: true });
          setLandmarks(poses?.[0]?.keypoints ?? []);
        } catch (e) {
          console.error('estimatePoses error:', e);
        } finally {
          inFlight = false;
        }
      }, 50);
    };

    if (isTfReady) {
      runPoseDetection();
    }

    return () => {
      cancelled = true;
      if (interval) clearInterval(interval);
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
      <Webcam
        ref={webcamRef}
        style={styles.webcam}
        videoConstraints={{
          width: width,
          height: height,
          facingMode: 'user',
        }}
      />
      <PoseCanvas
        width={width}
        height={height}
        landmarks={landmarks}
        svgs={svgs}
        mapping={mapping}
        style={styles.poseCanvas}
      />
    </div>
  );
};

export default DetectPose;

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '80vw',
    height: '80vh',
    overflow: 'hidden',
    alignSelf: 'center',
  },

  webcam: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },

  poseCanvas: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    pointerEvents: 'none',
  },
});