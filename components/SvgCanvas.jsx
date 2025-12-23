import React, { useRef, useEffect} from 'react';
import { useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors';
import { LANDMARKS, CONNECTED_KEYPOINTS } from '../constants/LandmarkData';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants/Sizes';

/* Compute affine transform from 3 source points to 3 destination points
------------------------------------------------------------------------------*/
function affineFrom3Points(src0, src1, src2, dst0, dst1, dst2) {
  const x0 = src0.x, y0 = src0.y;
  const x1 = src1.x, y1 = src1.y;
  const x2 = src2.x, y2 = src2.y;

  const X0 = dst0.x, Y0 = dst0.y;
  const X1 = dst1.x, Y1 = dst1.y;
  const X2 = dst2.x, Y2 = dst2.y;

  const det = x0 * (y1 - y2) + x1 * (y2 - y0) + x2 * (y0 - y1);
  if (Math.abs(det) < 1e-6) return null;

  const a = (X0 * (y1 - y2) + X1 * (y2 - y0) + X2 * (y0 - y1)) / det;
  const c = (X0 * (x2 - x1) + X1 * (x0 - x2) + X2 * (x1 - x0)) / det;
  const e = (X0 * (x1 * y2 - x2 * y1) + X1 * (x2 * y0 - x0 * y2) + X2 * (x0 * y1 - x1 * y0)) / det;

  const b = (Y0 * (y1 - y2) + Y1 * (y2 - y0) + Y2 * (y0 - y1)) / det;
  const d = (Y0 * (x2 - x1) + Y1 * (x0 - x2) + Y2 * (x1 - x0)) / det;
  const f = (Y0 * (x1 * y2 - x2 * y1) + Y1 * (x2 * y0 - x0 * y2) + Y2 * (x0 * y1 - x1 * y0)) / det;

  // Canvas expects: setTransform(a, b, c, d, e, f)
  return { a, b, c, d, e, f };
}

const DEFAULT_SVG_SIZE = { width: 60, height: 120 };

/* Convert SVG string to Image object
------------------------------------------------------------------------------*/
function svgStringToImage(svgString) {
  return new Promise((resolve) => {
    if (!svgString || typeof window === 'undefined') return resolve(null);

    const img = new window.Image();
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };

    img.src = url;
  });
}

/* Get SVG image size
------------------------------------------------------------------------------*/
function getSvgSize(img) {
  // SVG images can report 0 width/height in some browsers; natural* is safer.
  const w = img?.naturalWidth || img?.width || DEFAULT_SVG_SIZE.width;
  const h = img?.naturalHeight || img?.height || DEFAULT_SVG_SIZE.height;
  return { w, h };
}

/* Draw head SVG scaled and rotated between left and right ears
------------------------------------------------------------------------------*/
function drawHeadSvg(ctx, img, leftEar, rightEar) {
  const { w: svgW, h: svgH } = getSvgSize(img);

  // Calculate the distance and angle between ears
  const dx = rightEar.x - leftEar.x;
  const dy = rightEar.y - leftEar.y;
  const angle = Math.atan2(dy, dx);

  // Midpoint between ears
  const midX = (leftEar.x + rightEar.x) / 2;
  const midY = (leftEar.y + rightEar.y) / 2;
  const earDist = Math.hypot(dx, dy);
  const scale = (earDist / svgW) * 2.0;

  ctx.save();
  ctx.translate(midX, midY);
  ctx.rotate(angle); // Ensure upright orientation
  ctx.scale(scale, scale);
  // Draw SVG so its center is at the midpoint between ears
  ctx.drawImage(img, -svgW / 2, -svgH / 2, svgW, svgH);
  ctx.restore();
}

/* Draw segment SVG rotated to align from 'from' to 'to' (arms)
------------------------------------------------------------------------------*/
function drawHorizontalSegmentSvg(ctx, img, from, to) {
  const { w: svgW, h: svgH } = getSvgSize(img);
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const angle = Math.atan2(dy, dx);
  const length = Math.hypot(dx, dy);
  const scale = length / Math.max(1, svgW);

  ctx.save();
  ctx.translate(from.x, from.y); // Move to shoulder/elbow
  ctx.rotate(angle); // Rotate to point toward elbow/wrist
  ctx.scale(scale, scale); // Scale so SVG width matches segment length
  ctx.drawImage(img, 0, -svgH / 2, svgW, svgH); // left center at from, right center at to
  ctx.restore();
}

/* Draw left hand SVG rotated to match wrist-elbow angle
------------------------------------------------------------------------------*/
function drawLeftHandSvg(ctx, img, wrist, elbow) {
    const { w: svgW, h: svgH } = getSvgSize(img);
    const dx = wrist.x - elbow.x;
    const dy = wrist.y - elbow.y;
    const angle = Math.atan2(dy, dx);

    ctx.save();
    ctx.translate(wrist.x, wrist.y);
    ctx.rotate(angle);
    ctx.drawImage(img, 0, -svgH / 2, svgW, svgH);
    ctx.restore();
}

/* Draw right hand SVG rotated to match wrist-elbow angle
------------------------------------------------------------------------------*/
function drawRightHandSvg(ctx, img, wrist, elbow) {
    const { w: svgW, h: svgH } = getSvgSize(img);
    const dx = wrist.x - elbow.x;
    const dy = wrist.y - elbow.y;
    const angle = Math.atan2(dy, dx);

    ctx.save();
    ctx.translate(wrist.x, wrist.y);
    ctx.rotate(angle + Math.PI);
    ctx.drawImage(img, -svgW, -svgH / 2, svgW, svgH);
    ctx.restore();
}

function drawLegSvg(ctx, img, from, to) {
  const { w: svgW, h: svgH } = getSvgSize(img);
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const angle = Math.atan2(dy, dx);
  const length = Math.hypot(dx, dy);
  const scale = length / Math.max(1, svgH);
  ctx.save();
  ctx.translate(from.x, from.y);
  ctx.rotate(angle - Math.PI / 2); // <-- Fix: rotate so SVG height aligns with segment
  ctx.scale(scale, scale);
  ctx.drawImage(img, -svgW / 2, 0, svgW, svgH);
  ctx.restore();
}

function drawFootSvg(ctx, img, from, to) {
  const { w: svgW, h: svgH } = getSvgSize(img);
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const angle = Math.atan2(dy, dx);
  ctx.save();
  ctx.translate(from.x, from.y);
  ctx.rotate(angle);
  ctx.drawImage(img, -svgW / 2, 0, svgW, svgH);
  ctx.restore();
}

const SvgCanvas = ({ 
  width, 
  height, 
  webcamWidth, 
  webcamHeight,
  landmarks, 
  svgs = {}, 
  mapping = {} 
}) => {
  // Refs for canvas and cached images
  const canvasRef = useRef(null);
  const imagesRef = useRef({});

  const scaleX = width / webcamWidth;
  const scaleY = height / webcamHeight;

  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;

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

  /* Draw pose and SVGs on canvas when landmarks change
  ----------------------------------------------------------------------------*/
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, width, height);

    if (!landmarks || landmarks.length === 0) return;

    /* Draw pose skeleton
    --------------------------------------------------------------------------*/
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

    /* Draw keypoints
    --------------------------------------------------------------------------*/
    ctx.fillStyle = 'red';
    landmarks.forEach((kp) => {
      if (kp && kp.score > 0.3) {
        ctx.beginPath();
        ctx.arc(kp.x, kp.y, 5, 0, 2 * Math.PI);
        ctx.fill();
      }
    });

    /* Draw SVGs for body parts
    --------------------------------------------------------------------------*/
    const images = imagesRef.current;

    const scaledLandmarks = landmarks.map(kp =>
      kp
        ? {
            ...kp,
            x: kp.x * scaleX,
            y: kp.y * scaleY,
          }
        : kp
    );

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
            const center = landmarks[map.center];
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

  }, [landmarks, width, height, scaleX, scaleY, mapping]);

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
        }}
    />
  );
};

export default SvgCanvas;