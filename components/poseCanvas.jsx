import React, { useRef, useEffect } from 'react';

// Define connections between keypoints (for MoveNet/BlazePose)
const CONNECTED_KEYPOINTS = [
  [5, 6], [11, 12],
  [5, 7], [7, 9],
  [6, 8], [8, 10],
  [11, 13], [13, 15],
  [12, 14], [14, 16],
  [5, 11], [6, 12],
];

// Helper: Convert SVG string to Image (async ONCE per SVG, not per frame)
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

// Helper: Compute angle and scale between two points
function getTransform(p1, p2, svgHeight) {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const angle = Math.atan2(dy, dx);
  const length = Math.sqrt(dx * dx + dy * dy);

  // Guard against divide-by-zero
  const safeSvgH = Math.max(1, svgHeight);
  const scale = length / safeSvgH;

  return { angle, scale, x: p1.x, y: p1.y };
}

const DEFAULT_SVG_SIZE = { width: 60, height: 120 };

const PoseCanvas = ({ width, height, landmarks, svgs = {}, mapping = {} }) => {
  const canvasRef = useRef(null);

  // Cache: part -> HTMLImageElement
  const imagesRef = useRef({});

  // 1) Preload SVG images only when `svgs` changes
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

  // 2) Draw per-frame (sync) whenever landmarks update
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, width, height);

    if (!landmarks || landmarks.length === 0) return;

    // Draw pose lines
    ctx.strokeStyle = '#00FF00';
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
    ctx.fillStyle = '#FF0000';
    landmarks.forEach((kp) => {
      if (kp && kp.score > 0.3) {
        ctx.beginPath();
        ctx.arc(kp.x, kp.y, 5, 0, 2 * Math.PI);
        ctx.fill();
      }
    });

    // Draw cached SVGs
    const images = imagesRef.current;

    for (const [part, img] of Object.entries(images)) {
        const map = mapping?.[part];
        if (!map || !img) continue;

        let fromIdx = null, toIdx = null, centerIdx = null;

        if (map.topRight !== undefined && map.bottomLeft !== undefined) {
            fromIdx = map.topRight;
            toIdx = map.bottomLeft;
        } else if (map.topLeft !== undefined && map.bottomRight !== undefined) {
            fromIdx = map.topLeft;
            toIdx = map.bottomRight;
        } else if (map.topLeft !== undefined && map.bottomCenter !== undefined) {
            fromIdx = map.topLeft;
            toIdx = map.bottomCenter;
        } else if (map.topRight !== undefined && map.bottomCenter !== undefined) {
            fromIdx = map.topRight;
            toIdx = map.bottomCenter;
        } else if (map.center !== undefined) {
            centerIdx = map.center;
        } else {
            continue;
        }

        if (centerIdx !== null) {
            const center = landmarks[centerIdx];
            if (!center || center.score < 0.3) continue;
            const svgW = img.width || DEFAULT_SVG_SIZE.width;
            const svgH = img.height || DEFAULT_SVG_SIZE.height;
            ctx.save();
            ctx.translate(center.x, center.y);
            ctx.drawImage(img, -svgW / 2, -svgH / 2, svgW, svgH);
            ctx.restore();
            continue;
        }

        const from = landmarks[fromIdx];
        const to = landmarks[toIdx];
        if (!from || !to || from.score < 0.3 || to.score < 0.3) continue;

        const svgW = img.width || DEFAULT_SVG_SIZE.width;
        const svgH = img.height || DEFAULT_SVG_SIZE.height;

        ctx.save();
        // Calculate angle from "from" to "to"
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const angle = Math.atan2(dy, dx);

        // Calculate scale based on distance between points and SVG height
        const length = Math.sqrt(dx * dx + dy * dy);
        const scale = length / svgH;

        // Move to "from" point
        ctx.translate(from.x, from.y);
        // Rotate to match direction
        ctx.rotate(angle);
        // Scale to match length
        ctx.scale(scale, scale);
        // Draw SVG so its top aligns with "from" and bottom with "to"
        ctx.drawImage(img, -svgW / 2, 0, svgW, svgH);
        ctx.restore();
    }
  }, [landmarks, width, height, mapping]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none' }}
    />
  );
};

export default PoseCanvas;