import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import Webcam from 'react-webcam';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import * as poseDetection from '@tensorflow-models/pose-detection';

// Main component for detecting pose using webcam
const DetectPose = () => {
  const webcamRef = useRef(null);
  const [isTfReady, setIsTfReady] = useState(false);
  const [landmarks, setLandmarks] = useState(null);
  const [loading, setLoading] = useState(true);

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
      }, 1000);
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
    <>
      {/* Main container */}
      <div style={styles.container}>
        {/* Webcam feed */}
        <Webcam ref={webcamRef} style={{ flex: 1 }} />
        
        {/* Display detected landmarks */}
        <div style={{ flex: 2, padding: 16, backgroundColor: '#fff' }}>
          <div style={{ fontWeight: 'bold', marginBottom: 8 }}>Pose Landmarks:</div>
          {/* List of landmarks returned by second useEffect */}
          {landmarks && landmarks.length > 0 ? (
            landmarks.map((lm, idx) => (
              <div key={idx}>
                {lm.name || idx}: x={lm.x?.toFixed(1)}, y={lm.y?.toFixed(1)}, score={lm.score?.toFixed(2)}
              </div>
            ))
          ) : (
            <div>No landmarks detected yet.</div>
          )}
        </div>
      </div>
    </>
  );
};

export default DetectPose;

const styles = StyleSheet.create({
  container: {
    display: 'flex', 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'flex-start',
    height: '90vh', 
    width: '60vw', 
    margin: 'auto', 
  },
});