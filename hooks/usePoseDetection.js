// hooks/usePoseDetection.js
import { useEffect, useState, useRef } from 'react';
import * as poseDetection from '@tensorflow-models/pose-detection';
import { smoothAndInterpolateLandmarks } from '../utils/poseUtils';
import { addFeetFromHipKneeVectors } from '../utils/calcFootVectors';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants/Sizes';
import { useLandmarks } from '../context/LandmarksContext';

/*==============================================================================
                          USE POSE DETECTION HOOK
================================================================================
Custom React hook to manage pose detection using TensorFlow.js MoveNet model.
Handles loading the model, running detection on video/webcam input, and managing
landmark state and context updates. 
------------------------------------------------------------------------------*/

export function usePoseDetection({
  isTfReady,
  isDetecting,
  videoUri,
  videoRef,
  webcamRef,
  videoLoaded,
  naturalVideoWidth,
  naturalVideoHeight,
  setLandmarks,
  setLoading,
  viewMode,
  landmarksRef, // optional ref to update for imperative drawing
}) {

  /* Throttle and cache management refs for pose detection and landmark updates
  ----------------------------------------------------------------------------*/
  const lastSetTimeRef = useRef(0); // For throttling landmark updates to UI
  const saveFrameCounterRef = useRef(0); // Count frames for save interval
  const tokenRef = useRef(0); // Token to force landmarksRef updates for canvas drawing
  
  // Target UI draw FPS 
  const MIN_INTERVAL = 1000 / 30; // 30 FPS 
  const SAVE_EVERY_N = 2;

  const [cachedLandmarks, setCachedLandmarks] = useState([]);

  const { 
    setProcessed, 
    notifyProcessed,
    setDimensions
  } = useLandmarks();

  /* DETECTION STOP
  ------------------------------------------------------------------------------
  1. Smooth and interpolate cached landmarks for better replay animation
  2. Add estimated foot landmarks 
  3. Update context
  4. Clear cache
  ----------------------------------------------------------------------------*/
  useEffect(() => {
    if (!isDetecting && cachedLandmarks?.length) {
      const smoothedLandmarks = smoothAndInterpolateLandmarks(cachedLandmarks, 5, 1);
      const { 
        landmarksArray: estimatedLandmarks, 
        croppedWidth, 
        croppedHeight } = addFeetFromHipKneeVectors(smoothedLandmarks);
      console.log('usePoseDetection: setting original landmarks, ', cachedLandmarks);
      setProcessed(estimatedLandmarks);
      setDimensions(croppedWidth, croppedHeight);
      notifyProcessed();   
      console.log('usePoseDetection: setting processed landmarks, ', estimatedLandmarks);
      setCachedLandmarks([]);          
    }
  }, [isDetecting]);

  /* POSE DETECTION EFFECT
  ------------------------------------------------------------------------------
  Runs pose detection on the provided media input when TensorFlow is ready. 
  ----------------------------------------------------------------------------*/
  useEffect(() => {
    let detector;
    let cancelled = false;

    const runPoseDetection = async () => {
      /* Load the MoveNet model 
      ------------------------------------------------------------------------*/
      detector = await poseDetection.createDetector(
        poseDetection.SupportedModels.MoveNet,
        { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING }
      );
      if (cancelled) return;
      console.log('Pose Detector loaded, model:', detector);
      setLoading(false);

      /* Detection loop using requestAnimationFrame
      ------------------------------------------------------------------------*/
      const detect = async () => {
        if (cancelled) return;
        const video = videoUri ? videoRef.current : webcamRef.current?.video;
        const width = video?.videoWidth || naturalVideoWidth;
        const height = video?.videoHeight || naturalVideoHeight;
        // If video not ready, try again on next frame
        if (!video || video.readyState !== 4) {
          requestAnimationFrame(detect);
          return;
        }
        try {

          /* Run pose detection on the current video frame
          --------------------------------------------------------------------*/
          if (isDetecting) {
            const poses = await detector.estimatePoses(
              video, { flipHorizontal: true }
            );
            let currentLandmarks = poses?.[0]?.keypoints ?? [];
            
            /* Scale landmarks to video dimensions
            ------------------------------------------------------------------*/
            if (videoUri && videoLoaded && width && 
              height
            ) {
              const videoAspect = width / height;
              const canvasAspect = CANVAS_WIDTH / CANVAS_HEIGHT;
              let scale, offsetX = 0, offsetY = 0;
              if (videoAspect > canvasAspect) {
                scale = CANVAS_WIDTH / width;
                offsetY = (CANVAS_HEIGHT - height * scale) / 2;
              } else {
                scale = CANVAS_HEIGHT / height;
                offsetX = (CANVAS_WIDTH - width * scale) / 2;
              }
              currentLandmarks = currentLandmarks.map(kp => ({
                ...kp,
                x: kp.x * scale + offsetX,
                y: kp.y * scale + offsetY,
              }));
            }

            // Throttle UI landmark updates to reduce React work
            const now = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
            if (now - lastSetTimeRef.current >= MIN_INTERVAL) {
              lastSetTimeRef.current = now;
              // update landmarks state used by canvas UI
              setLandmarks(currentLandmarks);
              // also update landmarksRef for imperative canvas drawing (tokened)
              if (landmarksRef && landmarksRef.current) {
                tokenRef.current += 1;
                landmarksRef.current.__token = tokenRef.current;
                landmarksRef.current.data = currentLandmarks;
              }
            }

            /* Cache landmarks for replay animation, saving every N frames 
            ------------------------------------------------------------------*/
            if (viewMode === 'replay') {
              saveFrameCounterRef.current += 1;
              if (saveFrameCounterRef.current % SAVE_EVERY_N === 0) {
                const copy = typeof structuredClone === 'function'
                  ? structuredClone(currentLandmarks)
                  : currentLandmarks.map(kp => (kp ? { ...kp } : kp));
                setCachedLandmarks(prev => [...prev, copy]);
              }
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
  }, [
    isTfReady,
    isDetecting,
    videoUri,
    videoRef,
    webcamRef,
    videoLoaded,
    naturalVideoWidth,
    naturalVideoHeight,
    setLandmarks,
    setLoading,
    viewMode,
    landmarksRef,
  ]);
}