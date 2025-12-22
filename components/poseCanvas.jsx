import React, { useEffect, useRef } from 'react'
import { CONNECTED_KEYPOINTS } from '../constants/LandmarkData';
import { WEBCAM_WIDTH, WEBCAM_HEIGHT } from '../constants/Sizes';

const PoseCanvas = ({ width, height, landmarks, style }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
  
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, width, height);
  
      if (!landmarks || landmarks.length === 0) return;
  
      // Draw pose skeleton
      ctx.strokeStyle = 'lime';
      ctx.lineWidth = 2;
      CONNECTED_KEYPOINTS.forEach(([i, j]) => {
        const kp1 = landmarks[i];
        const kp2 = landmarks[j];
        if (kp1 && kp2 && kp1.score > 0.3 && kp2.score > 0.3) {
          ctx.beginPath();
          ctx.moveTo(kp1.x, kp1.y);
          ctx.lineTo(kp2.x, kp2.y);
          ctx.stroke();
        }
      });
  
      // Draw keypoints
      ctx.fillStyle = 'red';
      landmarks.forEach((kp) => {
        if (kp && kp.score > 0.3) {
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