import { useEffect, useRef } from 'react';
import * as poseDetection from '@tensorflow-models/pose-detection';
import { smoothAndInterpolateLandmarks } from '../utils/poseUtils';
import { addFeetFromHipKneeVectors } from '../utils/calcFootVectors';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants/Sizes';

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
  setSavedLandmarks,
  savedLandmarks,
  setLoading,
  viewMode,
  landmarksRef, // optional ref to update for imperative drawing
}) {

  // Throttle / sampling refs and settings
  const lastSetTimeRef = useRef(0);
  const saveFrameCounterRef = useRef(0);
  const tokenRef = useRef(0);
  // Target UI draw FPS 
  const MIN_INTERVAL = 1000 / 30; // 30 FPS
  // Save every Nth detected frame to reduce memory/clone cost
  const SAVE_EVERY_N = 2;

  useEffect(() => {
    if (!isDetecting && savedLandmarks?.length) {
      const processed = smoothAndInterpolateLandmarks(savedLandmarks, 5, 1);
      const estimatedLandmarks = addFeetFromHipKneeVectors( processed );
      setSavedLandmarks(estimatedLandmarks);
    }
  }, [isDetecting]);

  useEffect(() => {
    let detector;
    let cancelled = false;

    const runPoseDetection = async () => {
      detector = await poseDetection.createDetector(
        poseDetection.SupportedModels.MoveNet,
        { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING }
      );
      if (cancelled) return;
      console.log('Pose Detector loaded, model:', detector);
      setLoading(false);

      const detect = async () => {
        if (cancelled) return;
        const video = videoUri ? videoRef.current : webcamRef.current?.video;
        if (!video || video.readyState !== 4) {
          requestAnimationFrame(detect);
          return;
        }
        try {
          if (isDetecting) {
            const poses = await detector.estimatePoses(video, { flipHorizontal: true });
            let currentLandmarks = poses?.[0]?.keypoints ?? [];

            if (videoUri && videoLoaded && naturalVideoWidth && naturalVideoHeight) {
              const videoAspect = naturalVideoWidth / naturalVideoHeight;
              const canvasAspect = CANVAS_WIDTH / CANVAS_HEIGHT;
              let scale, offsetX = 0, offsetY = 0;
              if (videoAspect > canvasAspect) {
                scale = CANVAS_WIDTH / naturalVideoWidth;
                offsetY = (CANVAS_HEIGHT - naturalVideoHeight * scale) / 2;
              } else {
                scale = CANVAS_HEIGHT / naturalVideoHeight;
                offsetX = (CANVAS_WIDTH - naturalVideoWidth * scale) / 2;
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

            // Sample and cheaply clone frames for savedLandmarks to reduce GC pressure
            if (viewMode === 'pose') {
              saveFrameCounterRef.current += 1;
              if (saveFrameCounterRef.current % SAVE_EVERY_N === 0) {
                // Use structuredClone when available (faster than JSON), otherwise shallow-clone each keypoint
                const copy = typeof structuredClone === 'function'
                  ? structuredClone(currentLandmarks)
                  : currentLandmarks.map(kp => (kp ? { ...kp } : kp));
                setSavedLandmarks(prev => [...prev, copy]);
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
    setSavedLandmarks,
    setLoading,
    viewMode,
  ]);
}