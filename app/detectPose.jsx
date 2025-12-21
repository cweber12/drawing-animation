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
  const [landmarks, setLandmarks] = useState(null);
  const [loading, setLoading] = useState(true); 

  const params = useLocalSearchParams();
  const svgs = params.svgs ? JSON.parse(params.svgs) : {};
  const mapping = params.mapping ? JSON.parse(params.mapping) : {};
  
  /* Load TensorFlow.js and Pose Detection Model
  ------------------------------------------------------------------------------------------------*/
  useEffect(() => {
    (async () => {
      await tf.ready();
      setIsTfReady(true);
    })();
  }, []);

  /* Detect Pose at Intervals
  --------------------------------------------------------------------------------------------------
  Monitor webcam and run pose detection every 50ms
  ------------------------------------------------------------------------------------------------*/
  useEffect(() => {
    let detector;
    let interval;
    const runPoseDetection = async () => {
      detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet);
      setLoading(false);
      interval = setInterval(async () => {
        if (
          webcamRef.current &&
          webcamRef.current.video &&
          webcamRef.current.video.readyState === 4
        ) {
          const video = webcamRef.current.video;
          const image = tf.browser.fromPixels(video);
          const poses = await detector.estimatePoses(image);
          setLandmarks(poses[0]?.keypoints || []);
          tf.dispose(image);
        }
      }, 50);
    };
    if (isTfReady) {
      runPoseDetection();
    }
    return () => clearInterval(interval);
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
    pointerEvents: 'none',
  },
});