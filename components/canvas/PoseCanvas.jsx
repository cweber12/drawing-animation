// components/canvas/PoseCanvas.jsx

import React, { useEffect, useRef } from 'react'
import { CONNECTED_KEYPOINTS } from '../../constants/descriptors/landmarkDescriptors';
import { Colors } from '../../constants/Colors';
import { useColorScheme } from 'react-native';

/*==============================================================================
                          POSE CANVAS COMPONENT
================================================================================
Renders a canvas that draws pose landmarks and skeleton based on provided
landmarks.
------------------------------------------------------------------------------*/
const PoseCanvas = ({ 
  width, height, // canvas dimensions 
  landmarks, // pose landmarks to draw (fallback)
  landmarksRef, // optional ref provided for imperative drawing
  style 
}) => {
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

    if (landmarksRef && landmarksRef.current) {
      let raf = null;
      let lastToken = 0;
      const loop = () => {
        const token = landmarksRef.current?.__token;
        if (token && token !== lastToken) {
          lastToken = token;
          const data = landmarksRef.current.data;
          drawFrame(data);
        }
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
      return () => cancelAnimationFrame(raf);
    }

    // Fallback: prop-driven draw when landmarksRef not provided
    drawFrame(landmarks);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [landmarksRef, landmarks, width, height, theme]);

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