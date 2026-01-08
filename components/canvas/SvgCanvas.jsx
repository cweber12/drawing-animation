/* SvgCanvas.jsx
  ----------------------------------------------------------------------------
  Renders a canvas overlay that draws pose landmarks and SVG body parts
  based on provided landmarks and SVG strings.
  ----------------------------------------------------------------------------
*/
import React, { useRef, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { Colors } from '../../constants/Colors';
import { LANDMARKS, CONNECTED_KEYPOINTS } from '../../constants/LandmarkData';
import { 
  CANVAS_WIDTH, 
  CANVAS_HEIGHT, 
  CANVAS_BORDER_RADIUS, 
  updateAvgTorsoHeight,
  updateAvgTorsoWidth,
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
  drawLeftHandSvg,
  drawRightHandSvg,
  drawLegSvg,
  drawFootSvg,
} from '../../utils/drawingUtils';
import { update } from 'lodash';

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

  // Refs for canvas and cached images
  const canvasRef = useRef(null);
  const imagesRef = useRef({});
  // Scaling factors from webcam to canvas size
  const scaleWebcamX = width / webcamWidth;
  const scaleWebcamY = height / webcamHeight; 
  // Theme colors 
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;

  // Animation frame state for pose replay
  const [frame, setFrame] = useState(0);

  /* Animate through savedLandmarks in pose mode
  ----------------------------------------------------------------------------*/
  useEffect(() => {
    if (replay && savedLandmarks.length > 0) {
      setFrame(0);
      const interval = setInterval(() => {
        setFrame(prev => (prev + 1) % savedLandmarks.length);
      }, 1000 / 30);
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

  /* Cache SVG images when svgs prop changes
  ----------------------------------------------------------------------------*/
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const entries = await Promise.all(
        Object.entries(svgs).map(async ([part, svgString]) => {
          const { width: svgW, height: svgH } = getSvgDimensions(svgString);
          const svgStringClipped = addSvgClipPath(
            svgString,
            svgW,
            svgH,
            CANVAS_BORDER_RADIUS
          );
          const img = await svgStringToImage(svgStringClipped);
          return [part, img];
        })
      );

      if (cancelled) return;

      const next = {};
      for (const [part, img] of entries) {
        if (img) next[part] = img;
      }
      imagesRef.current = next;
    })();

    return () => {
      cancelled = true;
    };
  }, [svgs]);

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
        ----------------------------------------------------------------------*/
        if (
          part === 'torso' &&
          map.topLeft !== undefined && map.topRight !== undefined &&
          map.bottomLeft !== undefined && map.bottomRight !== undefined
        ) {
        const tl = scaledLandmarks[map.topLeft];
        const tr = scaledLandmarks[map.topRight];
        const bl = scaledLandmarks[map.bottomLeft];
        const br = scaledLandmarks[map.bottomRight];

        // Ensure all four corners are present and have sufficient score
        if (!tl || !tr || !bl || !br) continue;
        if (tl.score < 0.3 || tr.score < 0.3 || bl.score < 0.3 || br.score < 0.3) continue;
        
        updateAvgTorsoHeight( 
          Math.hypot( 
            (tl.x + tr.x)/2 - (bl.x + br.x)/2, 
            (tl.y + tr.y)/2 - (bl.y + br.y)/2 
          ) 
        );

        updateAvgTorsoWidth(
          Math.hypot(
            (tr.x + br.x)/2 - (tl.x + bl.x)/2,
            (tr.y + br.y)/2 - (tl.y + bl.y)/2
          )
        );
 
        // Calculate hip center and shoulder width
        const hipCenter = {
          x: (bl.x + br.x) / 2,
          y: (bl.y + br.y) / 2,
        };
        const shoulderWidth = Math.abs(tr.x - tl.x);
        const offset = shoulderWidth / 2;

        // Use the offset to define the third point (left side shown)
        const thirdPoint = {
          x: hipCenter.x - offset,
          y: hipCenter.y,
        };

        // Use thirdPoint in the affine transform
        const M = affineFrom3Points(
            { x: 0, y: 0 },
            { x: svgW, y: 0 },
            { x: 0, y: svgH },
            { x: tl.x, y: tl.y },
            { x: tr.x, y: tr.y },
            thirdPoint
        );

        if (!M) continue;

        ctx.save();
        ctx.setTransform(M.a, M.b, M.c, M.d, M.e, M.f);
        ctx.scale(1, 1); 
        ctx.drawImage(img, 0, 0, svgW, svgH);
        ctx.restore();

        ctx.save();
        ctx.fillStyle = 'yellow'; 
        ctx.beginPath();
        ctx.arc(tl.x, tl.y, 12, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(tr.x, tr.y, 12, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(bl.x, bl.y, 5, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(br.x, br.y, 5, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(hipCenter.x, hipCenter.y, 5, 0, 2 * Math.PI);
        ctx.fill();
        ctx.restore();
        continue;
        }

        /* HEAD 
        ----------------------------------------------------------------------*/
        if (
            part === 'head' &&
            map.leftAnchor !== undefined &&
            map.rightAnchor !== undefined
            ) {
            const leftEar = scaledLandmarks[map.leftAnchor];
            const rightEar = scaledLandmarks[map.rightAnchor];
            if (!leftEar || !rightEar || leftEar.score < 0.3 || rightEar.score < 0.3) continue;

            drawHeadSvg(ctx, img, leftEar, rightEar);

            ctx.save();
            ctx.fillStyle = 'orange'; // or any color you want
            ctx.beginPath();
            ctx.arc(leftEar.x, leftEar.y, 8, 0, 2 * Math.PI);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(rightEar.x, rightEar.y, 8, 0, 2 * Math.PI);
            ctx.fill();
            ctx.restore();
            continue;
        }

        /* ARMS
        ----------------------------------------------------------------------*/
        if (
            (part === 'rightUpperArm' || part === 'rightLowerArm' ||
            part === 'leftUpperArm' || part === 'leftLowerArm') &&
            map.leftCenter !== undefined && map.rightCenter !== undefined 
        ) {
            let from, to;
            if (armOrientation === 'vertical') {
              console.log('arm orientation vertical');
              from = scaledLandmarks[map.start];
              to = scaledLandmarks[map.end];
            } else {
              console.log('arm orientation horizontal');
              if (part === 'rightUpperArm' || part === 'rightLowerArm') {
                from = scaledLandmarks[map.rightCenter];
                to = scaledLandmarks[map.leftCenter];
              } else {
                from = scaledLandmarks[map.leftCenter];
                to = scaledLandmarks[map.rightCenter];
              }

            } 
            
            if (
              !from || 
              !to || 
              from.score < 0.3 || 
              to.score < 0.3 ||
              (from.x === to.x && from.y === to.y)
            ) continue;
            if (armOrientation === 'vertical') {
              console.log('drawing vertical arm', part);
              drawVerticalSegmentSvg(ctx, img, from, to, part);
            } else {
              console.log('drawing horizontal arm', part);
              drawHorizontalSegmentSvg(ctx, img, from, to, part);
            }

            // Draw from/to points as circles
            ctx.save();
            ctx.fillStyle = 'lime'; // or any color you want
            ctx.beginPath();
            ctx.arc(from.x, from.y, 8, 0, 2 * Math.PI);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(to.x, to.y, 8, 0, 2 * Math.PI);
            ctx.fill();
            ctx.restore();

            continue;
        }
        

        /* HANDS
        ----------------------------------------------------------------------*/
        if (part === 'leftHand' &&
            map.wrist !== undefined &&
            map.elbow !== undefined
        ) {
            const wrist = scaledLandmarks[map.wrist];
            const elbow = scaledLandmarks[map.elbow];
            if (!wrist || !elbow || wrist.score < 0.3 || elbow.score < 0.3) continue;
            drawLeftHandSvg(ctx, img, wrist, elbow, armOrientation);
            ctx.save();
            ctx.fillStyle = 'blue'; // or any color you want
            ctx.beginPath();
            ctx.arc(wrist.x, wrist.y, 5, 0, 2 * Math.PI);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(elbow.x, elbow.y, 5, 0, 2 * Math.PI);
            ctx.fill();
            ctx.restore();
            continue;
        }

        if (part === 'rightHand' &&
            map.wrist !== undefined &&
            map.elbow !== undefined
        ) {
            const wrist = scaledLandmarks[map.wrist];
            const elbow = scaledLandmarks[map.elbow];
            if (
              !wrist || !elbow || wrist.score < 0.3 || 
              elbow.score < 0.3) continue;
            drawRightHandSvg(ctx, img, wrist, elbow, armOrientation);

            ctx.save();
            ctx.fillStyle = 'blue'; // or any color you want
            ctx.beginPath();
            ctx.arc(wrist.x, wrist.y, 5, 0, 2 * Math.PI);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(elbow.x, elbow.y, 5, 0, 2 * Math.PI);
            ctx.fill();
            ctx.restore();
            continue;
        }

        /* LEGS
        ----------------------------------------------------------------------*/
        if ( 
          part === 'leftUpperLeg' || part === 'leftLowerLeg' || 
          part === 'rightUpperLeg' || part === 'rightLowerLeg'

        ) {
            if (map.start === undefined || map.end === undefined) continue;
            const from = scaledLandmarks[map.start];
            const to = scaledLandmarks[map.end];
            if (!from || !to || from.score < 0.3 || to.score < 0.3) continue;
            drawLegSvg(ctx, img, from, to, part);

            ctx.save();
            ctx.fillStyle = 'purple';
            ctx.beginPath();
            ctx.arc(from.x, from.y, 8, 0, 2 * Math.PI);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(to.x, to.y, 8, 0, 2 * Math.PI);
            ctx.fill();
            ctx.restore();
            continue;
        }

        /* FEET
        ----------------------------------------------------------------------*/
        if ( part === 'leftFoot' || part === 'rightFoot' ) {
            if (map.center === undefined) continue;
            const center = scaledLandmarks[map.center];
            if (!center || center.score < 0.3) continue;  
            drawFootSvg(ctx, img, center, part); 
            
            ctx.save();
            ctx.fillStyle = 'lime';
            ctx.beginPath();
            ctx.arc(center.x, center.y, 8, 0, 2 * Math.PI);
            ctx.fill();
            ctx.restore();
            
        
            continue;
        }

    }
    /* Draw pose skeleton
    --------------------------------------------------------------------------*/
    ctx.strokeStyle = 'lime';
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
    ctx.fillStyle = 'red';
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
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        style={{
            width: CANVAS_WIDTH,
            height: CANVAS_HEIGHT,
            pointerEvents: 'none',
            backgroundColor: 'transparent', 
            ...style,
        }}
    />
  );
};

export default SvgCanvas;