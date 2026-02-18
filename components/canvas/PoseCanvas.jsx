// components/canvas/PoseCanvas.jsx

import React, { useEffect, useRef } from 'react'
import { CONNECTED_KEYPOINTS } from '../../constants/descriptors/landmarkDescriptors';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../constants/Sizes';
import { Colors } from '../../constants/Colors';
import { useColorScheme } from 'react-native';
import { useLandmarks } from '../../context/LandmarksContext';


/*==============================================================================
                          POSE CANVAS COMPONENT
================================================================================
Renders a canvas that draws pose landmarks and skeleton based on provided
landmarks.
------------------------------------------------------------------------------*/
const PoseCanvas = ({ 
  width = CANVAS_WIDTH, 
  height = CANVAS_HEIGHT,  
  landmarksRef, 
  style 
}) => {  
  
  /* Theme setup
  ----------------------------------------------------------------------------*/
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;
    
  /* Reference to canvas DOM element
  ----------------------------------------------------------------------------*/
  const canvasRef = useRef(null);

  // Landmarks from context (for replay or live drawing via landmarksRef)
  const { processedRef, processedVersion } = useLandmarks();
  
  useEffect(() => {
    console.log('PoseCanvas useEffect - processedVersion: ', processedVersion);
    console.log('PoseCanvas useEffect - processedRef.current: ', processedRef?.current);
    
  }, [processedVersion]);
  
  /* Drawing helper (imperative) ------------------------------------------------*/
  const drawFrame = (landmarksToDraw) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, width, height);
    if (!landmarksToDraw || landmarksToDraw.length === 0) return;

    ctx.strokeStyle = theme.listItemBackground;
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


    
    landmarksToDraw.forEach((kp, index) => {
      if (kp && kp.x != null && kp.y != null) {
        if (index === 0) {
          ctx.fillStyle = 'transparent';
        } else if (index % 2 === 1) {
          ctx.fillStyle = theme.landmarkPointsRight;
        } else if (index % 2 === 0 && index !== 0) {
          ctx.fillStyle = theme.landmarkPointsLeft;
        }
        ctx.beginPath();
        ctx.arc(kp.x, kp.y, 5, 0, 2 * Math.PI);
        ctx.fill();
      }
    });
  };

  const frameRef = useRef(0);

  useEffect(() => {
    if (processedRef?.current?.length > 0) {
      frameRef.current = 0;
      drawFrame(processedRef.current[0] || []);
      const interval = setInterval(() => {
        const len = processedRef.current.length || 1;
        frameRef.current = (frameRef.current + 1) % len;
        drawFrame(processedRef.current[frameRef.current] || []);
      }, 1000 / 30);
      return () => clearInterval(interval);
    }
    frameRef.current = 0;
  }, [processedVersion]);

  /* Effect: live RAF-driven drawing from landmarksRef (imperative live updates) */
  useEffect(() => {
    if (landmarksRef && landmarksRef.current) {
      let raf = null;
      let lastToken = null;
      const loop = () => {
        const token = landmarksRef.current?.__token;
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
  }, [landmarksRef, width, height, theme]);

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