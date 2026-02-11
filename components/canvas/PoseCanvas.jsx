// components/canvas/PoseCanvas.jsx

import React, { useEffect, useRef } from 'react'
import { CONNECTED_KEYPOINTS } from '../../constants/descriptors/landmarkDescriptors';
import { Colors } from '../../constants/Colors';
import { useColorScheme } from 'react-native';
import { has } from 'lodash';

/*==============================================================================
                          POSE CANVAS COMPONENT
================================================================================
Renders a canvas that draws pose landmarks and skeleton based on provided
landmarks.
------------------------------------------------------------------------------*/
const PoseCanvas = ({ 
  width, height, // canvas dimensions 
  landmarks, // pose landmarks to draw (fallback)
  savedLandmarks = [], // saved landmarks for replay (fallback)
  landmarksRef, // optional ref provided for imperative drawing
  
  style 
}) => {
  console.log('RENDERING POSE CANVAS');
  
  /* Theme setup
  ----------------------------------------------------------------------------*/
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;
    
  /* Reference to canvas DOM element
  ----------------------------------------------------------------------------*/
  const canvasRef = useRef(null);

  /* Imperative RAF drawing when landmarksRef provided, otherwise fallback to
     prop-driven draw. The RAF loop reads landmarksRef.current.__token to
     detect changes and avoids React re-renders per frame. */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const drawFrame = (landmarksToDraw) => {
      ctx.clearRect(0, 0, width, height);
      if (!landmarksToDraw || landmarksToDraw.length === 0) return;

      ctx.strokeStyle = theme.landmarkConnectors;
      ctx.lineWidth = 2;
      CONNECTED_KEYPOINTS.forEach(([i, j]) => {
        const kp1 = landmarksToDraw[i];
        const kp2 = landmarksToDraw[j];
        if (kp1 && kp2 && kp1.x != null && kp2.x != null) {
          ctx.beginPath();
          ctx.moveTo(kp1.x, kp1.y);
          ctx.lineTo(kp2.x, kp2.y);
          ctx.stroke();
        }
      });

      ctx.fillStyle = theme.landmarkPoints;
      landmarksToDraw.forEach((kp) => {
        if (kp && kp.x != null && kp.y != null) {
          ctx.beginPath();
          ctx.arc(kp.x, kp.y, 5, 0, 2 * Math.PI);
          ctx.fill();
        }
      });
    };

    const hasSaved = Array.isArray(savedLandmarks) && savedLandmarks.length > 0;

    // If saved landmarks are provided (replay mode), play them back frame-by-frame.
    if (hasSaved) {
      console.log('PoseCanvas: Playing back saved landmarks, count:', savedLandmarks.length);
      let raf = null;
      let frameIndex = 0;
      let lastTime = 0;
      const fps = 30; // replay FPS (adjustable)
      const frameDuration = 1000 / fps;

      const replayLoop = (time) => {
        if (!lastTime) lastTime = time;
        const elapsed = time - lastTime;
        if (elapsed >= frameDuration) {
          lastTime = time;
          const frame = savedLandmarks[frameIndex] || [];
          drawFrame(frame);
          frameIndex = (frameIndex + 1) % savedLandmarks.length;
        }
        raf = requestAnimationFrame(replayLoop);
      };

      raf = requestAnimationFrame(replayLoop);
      return () => cancelAnimationFrame(raf);
    }

    // If an imperative landmarksRef is provided, use its RAF-driven updates for live drawing.
    if (landmarksRef && landmarksRef.current) {
      let raf = null;
      let lastToken = null;
      const loop = () => {
        const token = landmarksRef.current?.__token;
        // use explicit null/undefined check so token=0 isn't treated as false
        if (token != null && token !== lastToken) {
          lastToken = token;
          const data = landmarksRef.current.data;
          drawFrame(data);
        }
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
      return () => cancelAnimationFrame(raf);
    }

    // Fallback: prop-driven draw when no landmarksRef and no saved frames
    drawFrame(landmarks);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [landmarksRef, landmarks, width, height, theme, savedLandmarks]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{
        width,
        height,
        pointerEvents: 'none',
        backgroundColor: 'transparent',
        ...style,
      }}
    />
  );
};

export default PoseCanvas;