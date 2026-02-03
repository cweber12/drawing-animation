/* SvgCanvas.jsx
  ----------------------------------------------------------------------------
  Renders a canvas overlay that draws pose landmarks and SVG body parts
  based on provided landmarks and SVG strings.
  ----------------------------------------------------------------------------
*/
import React, { useRef, useEffect, useState } from 'react';
import { LANDMARKS, CONNECTED_KEYPOINTS } from '../../constants/landmarkData';
import { 
  CANVAS_WIDTH, 
  CANVAS_HEIGHT, 
  CANVAS_BORDER_RADIUS, 
  updateAvgTorsoHeight,
  updateAvgTorsoWidth,
  updateAvgEarDistance, 
} from '../../constants/Sizes';
import {
  affineFrom3Points,
  svgStringToImage,
  getSvgSize,
  addSvgClipPath,
  getSvgDimensions,
} from '../../utils/svgUtils';
import {
  drawHeadSvg,
  drawHorizontalSegmentSvg,
  drawVerticalSegmentSvg,
  drawHandSvg,
  drawLegSvg,
  drawFootSvg,
} from '../../utils/drawingUtils';
import { update } from 'lodash';

import { useSvgCaching } from '../../hooks/useSvgCaching';

import { 
  setTorsoAnchors, 
  setHeadAnchors, 
  setArmAnchors, 
  setHandAnchors, 
  setLegAnchors, 
  setFootAnchors
} from '../../utils/anchorUtils'

const SvgCanvas = ({ 
  width, 
  height, 
  webcamWidth, 
  webcamHeight,
  landmarks, 
  savedLandmarks = [],
  replay, 
  svgs = {}, 
  mapping = {}, 
  armOrientation,
  videoLoaded,
  style
}) => {

  useEffect(() => {
    console.log('SvgCanvas: rendering with landmarks:', savedLandmarks);
  }, []);
  // Refs for canvas and cached images
  const canvasRef = useRef(null);
  const imagesRef = useSvgCaching(svgs, mapping);
  // Scaling factors from webcam to canvas size
  const scaleWebcamX = width / webcamWidth;
  const scaleWebcamY = height / webcamHeight; 

  // Debugging flags to display anchor points in svg rendering
  const debugTorsoAnchors = false;
  const debugHeadAnchors = false;
  const debugArmAnchors = false;
  const debugHandAnchors = false;
  const debugLegAnchors = false;
  const debugFootAnchors = false;

  // Animation frame state for pose replay
  const [frame, setFrame] = useState(0);
  
  /* Animate through savedLandmarks in pose mode
  ----------------------------------------------------------------------------*/
  useEffect(() => {
    if (replay && savedLandmarks.length > 0) {
      setFrame(0);
      const interval = setInterval(() => {
        setFrame(prev => (prev + 1) % savedLandmarks.length);
      }, 1000 / 30); // 30 FPS
      return () => clearInterval(interval);
    }
    setFrame(0);
  }, [replay, savedLandmarks.length]);

  /* Choose which landmarks to use for drawing
  ----------------------------------------------------------------------------*/
  const displayLandmarks =
    replay && savedLandmarks.length > 0
      ? savedLandmarks[frame]
      : landmarks;

  /* Draw pose and SVGs on canvas when displayLandmarks change
  ----------------------------------------------------------------------------*/
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, width, height);

    if (!displayLandmarks || displayLandmarks.length === 0) return;

    /* Draw SVGs for body parts
    --------------------------------------------------------------------------*/
    const images = imagesRef.current;
    
    // Conditionally scale landmarks for replay vs live
    // - replay: landmarks are already in canvas coords
    // - live: landmarks are in smaller webcam coords, need scaling
    let scaledLandmarks = null;
    if (replay) {
      scaledLandmarks = displayLandmarks; 
    } else {
      scaledLandmarks = displayLandmarks.map(kp =>
        kp
          ? {
              ...kp,
              x: kp.x * scaleWebcamX,
              y: kp.y * scaleWebcamY,
            }
          : kp
      );
    } 

    for (const [part, img] of Object.entries(images)) {
        const map = mapping?.[part];
        if (!map || !img) continue;

        /* Ensure all anchor landmarks are valid for current svg being drawn
        ----------------------------------------------------------------------*/
        // Gather anchor landmark indices for this part
        const anchorIndices = Object.values(map).filter(idx => typeof idx === 'number');
        // Get anchor landmarks
        const anchors = anchorIndices.map(idx => scaledLandmarks[idx]);
        // Check for invalid anchors (missing, NaN, or out of bounds)
        const hasInvalidAnchor = anchors.some(lm =>
            !lm ||
            typeof lm.x !== 'number' ||
            typeof lm.y !== 'number' ||
            isNaN(lm.x) ||
            isNaN(lm.y) ||
            lm.x < 0 ||
            lm.y < 0 ||
            lm.x > width ||
            lm.y > height
        );
        if (hasInvalidAnchor) continue;
        
        const { w: svgW, h: svgH } = getSvgSize(img);


        
        /* TORSO 
        -----------------------------------------------------------------------
        Set torso anchors and draw torso SVG on canvas
        Anchors: topLeft, topRight, bottomLeft, bottomRight
        ----------------------------------------------------------------------*/
        if (
          part === 'torso' &&
          map.topLeft !== undefined && map.topRight !== undefined &&
          map.bottomLeft !== undefined && map.bottomRight !== undefined
        ) {
          const success = setTorsoAnchors({
            ctx,
            img,
            svgW,
            svgH,
            scaledLandmarks,
            map,
            debugTorsoAnchors,
          });
          if (success) continue;
        }
          
        /* HEAD
        ------------------------------------------------------------------------
        Set head anchors and draw head SVG on canvas
        Anchors: leftAnchor, rightAnchor
        ----------------------------------------------------------------------*/
        if (
          part === 'head' &&
          map.leftAnchor !== undefined &&
          map.rightAnchor !== undefined
        ) {
          const success = setHeadAnchors({
            ctx,
            img,
            scaledLandmarks,
            map,
            svgW,
            svgH,
            debugHeadAnchors,
            updateAvgEarDistance,
            drawHeadSvg,
          });
          if (success) continue;
        }

        /* ARMS
        ----------------------------------------------------------------------*/
        if (
          (part === 'rightUpperArm' || part === 'rightLowerArm' ||
            part === 'leftUpperArm' || part === 'leftLowerArm') &&
          map.leftCenter !== undefined && map.rightCenter !== undefined
        ) {
          const success = setArmAnchors({
            ctx,
            img,
            part,
            map,
            scaledLandmarks,
            svgH,
            armOrientation,
            debugArmAnchors,
            drawVerticalSegmentSvg,
            drawHorizontalSegmentSvg,
          });
          if (success) continue;
        }
        

        /* HANDS
        ----------------------------------------------------------------------*/
        if ((part === 'leftHand' || part === 'rightHand') &&
            map.wrist !== undefined && map.elbow !== undefined
        ) {
          const success = setHandAnchors({
            ctx,
            img,
            scaledLandmarks,
            map,
            svgH,
            armOrientation,
            part,
            debugHandAnchors,
            drawHandSvg,
          });
          if (success) continue;
        }

        /* LEGS
        ----------------------------------------------------------------------*/
        if (
          part === 'leftUpperLeg' || part === 'leftLowerLeg' ||
          part === 'rightUpperLeg' || part === 'rightLowerLeg'
        ) {
          const success = setLegAnchors({
            ctx,
            img,
            scaledLandmarks,
            map,
            part,
            debugLegAnchors,
            drawLegSvg,
          });
          if (success) continue;
        }

        /* FEET
        ----------------------------------------------------------------------*/
        if (part === 'leftFoot' || part === 'rightFoot') {
          const success = setFootAnchors({
            ctx,
            img,
            scaledLandmarks,
            map,
            part,
            debugFootAnchors,
            drawFootSvg,
          });
          if (success) continue;
        }

    }
    /* Draw pose skeleton
    --------------------------------------------------------------------------*/
    ctx.strokeStyle = 'transparent';
    ctx.lineWidth = 2;
    CONNECTED_KEYPOINTS.forEach(([i, j]) => {
      const kp1 = scaledLandmarks[i];
      const kp2 = scaledLandmarks[j];
      if (kp1 && kp2 && kp1.score > 0.3 && kp2.score > 0.3) {
        ctx.beginPath();
        ctx.moveTo(kp1.x, kp1.y);
        ctx.lineTo(kp2.x, kp2.y);
        ctx.stroke();
      }
    });

    /* Draw keypoints
    --------------------------------------------------------------------------*/
    ctx.fillStyle = 'transparent';
    scaledLandmarks.forEach((kp) => {
      if (kp && kp.score > 0.3) {
        ctx.beginPath();
        ctx.arc(kp.x, kp.y, 5, 0, 2 * Math.PI);
        ctx.fill();
      }
    });

   

  }, [displayLandmarks, width, height, scaleWebcamX, scaleWebcamY, mapping, svgs]);

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

export default SvgCanvas;