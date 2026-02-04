import { useEffect } from 'react';
import { getSvgSize } from '../utils/svgUtils';
import { 
  setTorsoAnchorsAndDraw, 
  setHeadAnchors, 
  setArmAnchors, 
  setHandAnchors, 
  setLegAnchors, 
  setFootAnchors 
} from '../utils/anchorUtils';
import { CONNECTED_KEYPOINTS } from '../constants/landmarkData';

export function useSetAnchorsAndDraw({
  canvasRef,
  imagesRef,
  width,
  height,
  displayLandmarks,
  replay,
  scaleWebcamX,
  scaleWebcamY,
  mapping,
  svgs,
  armOrientation,
  torsoDimsRef
}) {
  useEffect(() => {


    const canvas = canvasRef?.current; 
    console.log('useSetAnchorsAndDraw: canvasRef current:', canvas);
    if (!canvas) return;


    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, width, height);

    if (!displayLandmarks || displayLandmarks.length === 0) return;

    const images = imagesRef?.current;
    console.log('useSetAnchorsAndDraw: imagesRef current:', images);  
    if (!images) return;

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

      const anchorIndices = Object.values(map).filter(idx => typeof idx === 'number');
      const anchors = anchorIndices.map(idx => scaledLandmarks[idx]);
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

      if (
        part === 'torso' &&
        map.topLeft !== undefined && map.topRight !== undefined &&
        map.bottomLeft !== undefined && map.bottomRight !== undefined
      ) {
        const success = setTorsoAnchorsAndDraw({
            ctx,
            img,
            svgW,
            svgH,
            scaledLandmarks,
            map,
            torsoDimsRef,
        });
        console.log('setTorsoAnchorsAndDraw success:', success);
        if (success) continue;
      }

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
            torsoDimsRef
        });
        if (success) continue;
      }

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
            torsoDimsRef,
        });
        if (success) continue;
      }

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
            torsoDimsRef
        });
        if (success) continue;
      }

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
            torsoDimsRef
        });
        if (success) continue;
      }

      if (part === 'leftFoot' || part === 'rightFoot') {
        const success = setFootAnchors({
            ctx,
            img,
            scaledLandmarks,
            map,
            part,
            torsoDimsRef
        });
        if (success) continue;
      }
    }

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

    ctx.fillStyle = 'transparent';
    scaledLandmarks.forEach((kp) => {
      if (kp && kp.score > 0.3) {
        ctx.beginPath();
        ctx.arc(kp.x, kp.y, 5, 0, 2 * Math.PI);
        ctx.fill();
      }
    });

  }, [
    displayLandmarks,
    width, height,
    scaleWebcamX, scaleWebcamY,
    mapping,
    svgs,
    armOrientation,
    torsoDimsRef,
  ]);
}