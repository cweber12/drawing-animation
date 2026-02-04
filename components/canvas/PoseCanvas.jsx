// components/canvas/PoseCanvas.jsx

import React, { useEffect, useRef } from 'react'
import { CONNECTED_KEYPOINTS } from '../../constants/landmarkData';
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
  landmarks, // pose landmarks to draw
  style 
}) => {
  /* Theme setup
  ----------------------------------------------------------------------------*/
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;
    
  /* Reference to canvas DOM element
  ----------------------------------------------------------------------------*/
  const canvasRef = useRef(null);

  /* Draw landmarks and skeleton on canvas when landmarks change
  ----------------------------------------------------------------------------*/
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, width, height);

    if (!landmarks || landmarks.length === 0) return;

    // Draw pose skeleton
    ctx.strokeStyle = theme.landmarkConnectors;
    ctx.lineWidth = 2;
    CONNECTED_KEYPOINTS.forEach(([i, j]) => {
      const kp1 = landmarks[i];
      const kp2 = landmarks[j];
      if (kp1 && kp2 && kp1.x !== null && kp2.x !== null) {

        ctx.beginPath();
        ctx.moveTo(kp1.x, kp1.y);
        ctx.lineTo(kp2.x, kp2.y);
        ctx.stroke();

      }
    });

    // Draw keypoints
    ctx.fillStyle = theme.landmarkPoints;
    landmarks.forEach((kp) => {
      if (kp && kp.x !== null && kp.y !== null) {
        ctx.beginPath();
        ctx.arc(kp.x, kp.y, 5, 0, 2 * Math.PI);
        ctx.fill();
      }
    });
  }, [landmarks, width, height]);

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