import { useEffect } from 'react';
import { getSvgSize } from '../utils/svgUtils';
import { 
  setTorsoAnchorsAndDraw, 
  setHeadAnchors, 
  setArmAnchors, 
  setHandAnchors, 
  setFootAnchors 
} from '../utils/anchorUtils';
import {
  drawTorsoSvg,
  drawHeadSvg,
  drawHorizontalSegmentSvg,
  drawVerticalSegmentSvg,
  drawHandSvg,
  drawLegSvg,
  drawFootSvg,
} from '../utils/drawingUtils';
import { LANDMARKS, CONNECTED_KEYPOINTS } from '../constants/descriptors/landmarkDescriptors';
import { ANCHOR_MAP } from '../constants/descriptors/anchorDescriptors';

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
  torsoDimsRef, 
  earDistRef,
}) {
  useEffect(() => {
    
    const torsoDims = torsoDimsRef?.current;
    //if (!torsoDims) return;
    const canvas = canvasRef?.current; 
    if (!canvas) return;
    const images = imagesRef?.current;
    if (!images) return;
    
    // Clear previous frame
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, width, height);

    if (!displayLandmarks || displayLandmarks.length === 0) return;

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

    /* LOOP THROUGH ANCHORS TO SET AND DRAW
    --------------------------------------------------------------------------*/
    for (const [part, img] of Object.entries(images)) {
      const map = ANCHOR_MAP[part];
      if (!map || !img) continue;
      console.log('LOADED:', part);
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
      console.log('VALID: ', part);

      /*========================================================================
                                        TORSO 
      ========================================================================*/
      if (
        part === 'torso' &&
        map.topLeft !== undefined && map.topRight !== undefined &&
        map.bottomLeft !== undefined && map.bottomRight !== undefined
      ) {
          console.log('SET ANCHORS: ', part);
          const tl = scaledLandmarks[map.topLeft];
          const tr = scaledLandmarks[map.topRight];
          const bl = scaledLandmarks[map.bottomLeft];
          const br = scaledLandmarks[map.bottomRight];
        
          if (!tl || !tr || !bl || !br) continue;
          if (tl.score < 0.3 || tr.score < 0.3 || bl.score < 0.3 || br.score < 0.3) continue;
          console.log('VALID ANCHORS: ', part);
          const shoulderWidth = tr.x - tl.x;
          const offset = shoulderWidth / 2;
          
          torsoDims.updateAvgTorsoHeight(
            Math.hypot(
              (tl.x + tr.x) / 2 - (bl.x + br.x) / 2,
              (tl.y + tr.y) / 2 - (bl.y + br.y) / 2
            )
          );
        
          torsoDims.updateAvgTorsoWidth(Math.abs(tr.x - tl.x));
          torsoDims.updateAvgHipWidth(Math.abs(br.x - bl.x));
        
          const success = drawTorsoSvg(ctx, img, tl, tr, bl, br);     
          if (success) { 
            console.log('DREW: ', part);
            continue;
          }
      }

      /*========================================================================
                                        HEAD 
      ========================================================================*/
      if (
        part === 'head' &&
        map.leftAnchor !== undefined &&
        map.rightAnchor !== undefined
      ) {
        console.log('SET ANCHORS: ', part);
        const earDist = earDistRef?.current;
        const leftEar = scaledLandmarks[map.leftAnchor];
        const rightEar = scaledLandmarks[map.rightAnchor];
        
        if (!leftEar || !rightEar || leftEar.score < 0.3 ||
           rightEar.score < 0.3) { continue };
        
        console.log('VALID ANCHORS: ', part);
        
        earDist.updateAvgEarDistance(
          Math.hypot(
            rightEar.x - leftEar.x,
            rightEar.y - leftEar.y
          )
        );
  
        const success = drawHeadSvg(ctx, img, leftEar, rightEar, torsoDims, earDist); 
        if (success) { 
          console.log('DREW: ', part);
          continue;
        }
      }

      /*========================================================================
                                        ARMS 
      ========================================================================*/
      if (
        (part === 'rightUpperArm' || part === 'rightLowerArm' ||
        part === 'leftUpperArm' || part === 'leftLowerArm') && 
        (map.start !== undefined && map.end !== undefined)
      ) {
        console.log('SET ANCHORS: ', part);
        const from = scaledLandmarks[map.start];
        const to = scaledLandmarks[map.end];
        if (!from || !to) continue;
        console.log('VALID ANCHORS: ', part);
        const success = 
          drawHorizontalSegmentSvg(ctx, img, from, to, part, torsoDims);
        if (success) { 
          console.log('DREW: ', part);
          continue;
        }
      }

      /*========================================================================
                                        HANDS 
      ========================================================================*/
      if ((part === 'leftHand' || part === 'rightHand') &&
        map.start !== undefined && map.end !== undefined
      ) {
        const { w: svgW, h: svgH } = getSvgSize(img);
        const armsDown = svgH > svgW;
        const from = scaledLandmarks[map.start];
        const to = scaledLandmarks[map.end];
        if (!from || !to) continue;
        if (!to || !from || to.score < 0.3 || from.score < 0.3) continue;

        console.log('VALID ANCHORS: ', part);

        const success = drawHandSvg(
          ctx, img, from, to, armsDown, part, torsoDims);
        if (success) { 
          console.log('DREW: ', part);
          continue;
        }
        
      }

      /*========================================================================
                                        LEGS
      ========================================================================*/
      if (
        (part === 'leftUpperLeg' || part === 'leftLowerLeg' ||
        part === 'rightUpperLeg' || part === 'rightLowerLeg') &&
        (map.start !== undefined && map.end !== undefined)
      ) {
        console.log('SET ANCHORS: ', part);
        const from = scaledLandmarks[map.start];
        const to = scaledLandmarks[map.end];
        if (!from || !to) continue;
        console.log('VALID ANCHORS: ', part);
        const success = drawLegSvg(ctx, img, from, to, part, torsoDims); 
        if (success) { 
          console.log('DREW: ', part);
          continue;
        } 
      }

      /*========================================================================
                                        FEET
      ========================================================================*/
      if (part === 'leftFoot' || part === 'rightFoot') {
        console.log('SET ANCHORS: ', part);
        const success = setFootAnchors({
            ctx,
            img,
            scaledLandmarks,
            map,
            part,
            torsoDimsRef
        });
        if (success) { 
          console.log('DREW: ', part);
          continue;
        }
      }
    }

    /*========================================================================
                                        DEBUG LANDMARKS
    ========================================================================*/
    ctx.strokeStyle = 'red';
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

    ctx.fillStyle = 'green';
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