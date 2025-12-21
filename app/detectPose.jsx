import React, { useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import * as poseDetection from '@tensorflow-models/pose-detection';
import PoseCanvas from '../components/poseCanvas';
import { useLocalSearchParams } from 'expo-router';


// Main component for detecting pose using webcam
const DetectPose = () => {
  const webcamRef = useRef(null);
  const [isTfReady, setIsTfReady] = useState(false);
  const [landmarks, setLandmarks] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dimensions, setDimensions] = useState({ width: 640, height: 480 }); // <-- Move here

  const params = useLocalSearchParams();
  const svgs = params.svgs ? JSON.parse(params.svgs) : {};
  const mapping = params.mapping ? JSON.parse(params.mapping) : {};
  
  // Load TensorFlow.js and the pose detection model
  useEffect(() => {
    (async () => {
      await tf.ready();
      setIsTfReady(true);
    })();
  }, []);

  // Set up pose detection and periodically estimate poses
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
      }, 100);
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

  return (
    <div style={{ position: 'relative', width: dimensions.width, height: dimensions.height }}>
      <Webcam
        ref={webcamRef}
        width={dimensions.width}
        height={dimensions.height}
        onUserMedia={() => {
          // Optionally update dimensions here if needed
        }}
        style={{ position: 'absolute', left: 0, top: 0 }}
      />
      <PoseCanvas
        width={dimensions.width}
        height={dimensions.height}
        landmarks={landmarks}
        svgs={svgs}
        mapping={mapping}
      />
    </div>
  );
};

export default DetectPose;