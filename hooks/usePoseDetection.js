import { useEffect } from 'react';
import * as poseDetection from '@tensorflow-models/pose-detection';
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
  setLoading,
  viewMode,
}) {
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