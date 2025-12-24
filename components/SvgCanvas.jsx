import React, { useRef, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors';
import { LANDMARKS, CONNECTED_KEYPOINTS } from '../constants/LandmarkData';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants/Sizes';
import {
  affineFrom3Points,
  DEFAULT_SVG_SIZE,
  svgStringToImage,
  getSvgSize,
  drawHeadSvg,
  drawHorizontalSegmentSvg,
  drawLeftHandSvg,
  drawRightHandSvg,
  drawLegSvg,
  drawFootSvg,
} from '../utils/svgUtils';

/* SvgCanvas: Draw pose and SVG overlays, animate using savedLandmarks in pose mode
------------------------------------------------------------------------------*/
const SvgCanvas = ({ 
  width, 
  height, 
  webcamWidth, 
  webcamHeight,
  landmarks, 
  savedLandmarks = [],
  viewMode,
  replay, 
  svgs = {}, 
  mapping = {}, 
  style
}) => {
  // Refs for canvas and cached images
  const canvasRef = useRef(null);
  const imagesRef = useRef({});

  const scaleX = width / webcamWidth;
  const scaleY = height / webcamHeight;

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
          const img = await svgStringToImage(svgString);
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

    /* Draw pose skeleton
    --------------------------------------------------------------------------*/
    ctx.strokeStyle = 'transparent';
    ctx.lineWidth = 2;
    CONNECTED_KEYPOINTS.forEach(([i, j]) => {
      const kp1 = displayLandmarks[i];
      const kp2 = displayLandmarks[j];
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
    displayLandmarks.forEach((kp) => {
      if (kp && kp.score > 0.3) {
        ctx.beginPath();
        ctx.arc(kp.x, kp.y, 5, 0, 2 * Math.PI);
        ctx.fill();
      }
    });

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
              x: kp.x * scaleX,
              y: kp.y * scaleY,
            }
          : kp
      );
    } 

    for (const [part, img] of Object.entries(images)) {
        const map = mapping?.[part];
        if (!map || !img) continue;

        const { w: svgW, h: svgH } = getSvgSize(img);

        /* TORSO 
        ----------------------------------------------------------------------*/
        if (
        map.topLeft !== undefined &&
        map.topRight !== undefined &&
        map.bottomLeft !== undefined &&
        map.bottomRight !== undefined
        ) {
        const tl = scaledLandmarks[map.topLeft];
        const tr = scaledLandmarks[map.topRight];
        const bl = scaledLandmarks[map.bottomLeft];
        const br = scaledLandmarks[map.bottomRight];

        // Ensure all four corners are present and have sufficient score
        if (!tl || !tr || !bl || !br) continue;
        if (tl.score < 0.3 || tr.score < 0.3 || bl.score < 0.3 || br.score < 0.3) continue;
        
        const M = affineFrom3Points(
            { x: 0, y: 0 },
            { x: svgW, y: 0 },
            { x: 0, y: svgH },
            { x: tl.x, y: tl.y },
            { x: tr.x, y: tr.y },
            { x: bl.x, y: bl.y }
        );

        if (!M) continue;

        ctx.save();
        ctx.setTransform(M.a, M.b, M.c, M.d, M.e, M.f);
        ctx.drawImage(img, 0, 0, svgW, svgH);
        ctx.restore();
        continue;
        }

        if (map.center !== undefined) {
            const center = scaledLandmarks[map.center];
            if (!center || center.score < 0.3) continue;

            ctx.save();
            ctx.translate(center.x, center.y);
            ctx.drawImage(img, -svgW / 2, -svgH / 2, svgW, svgH);
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
            continue;
        }

        /* ARMS 
        ----------------------------------------------------------------------*/
        if (
            (part === 'leftUpperArm' || part === 'rightUpperArm' ||
            part === 'leftLowerArm' || part === 'rightLowerArm') &&
            map.leftCenter !== undefined &&
            map.rightCenter !== undefined
        ) {
            const from = scaledLandmarks[map.leftCenter];
            const to = scaledLandmarks[map.rightCenter];
            if (!from || !to || from.score < 0.3 || to.score < 0.3) continue;
            drawHorizontalSegmentSvg(ctx, img, from, to);
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
            drawLeftHandSvg(ctx, img, wrist, elbow);
            continue;
        }

        if (part === 'rightHand' &&
            map.wrist !== undefined &&
            map.elbow !== undefined
        ) {
            const wrist = scaledLandmarks[map.wrist];
            const elbow = scaledLandmarks[map.elbow];
            if (!wrist || !elbow || wrist.score < 0.3 || elbow.score < 0.3) continue;
            drawRightHandSvg(ctx, img, wrist, elbow);
            continue;
        }

        /* LEGS
        ----------------------------------------------------------------------*/
        if ( part === 'leftUpperLeg' || part === 'leftLowerLeg' || part === 'rightUpperLeg' || part === 'rightLowerLeg' ) {
            if (map.start === undefined || map.end === undefined) continue;
            const from = scaledLandmarks[map.start];
            const to = scaledLandmarks[map.end];
            if (!from || !to || from.score < 0.3 || to.score < 0.3) continue;
            drawLegSvg(ctx, img, from, to);
            continue;
        }

        /* FEET
        ----------------------------------------------------------------------*/
        if ( part === 'leftFoot' || part === 'rightFoot' ) {
            if (map.center === undefined) continue;
            const center = scaledLandmarks[map.center];
            if (!center || center.score < 0.3) continue;  
            drawFootSvg(ctx, img, center, { x: center.x + 1, y: center.y }); // slight offset to define angle
            continue;
        }
    }

  }, [displayLandmarks, width, height, scaleX, scaleY, mapping, svgs]);

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