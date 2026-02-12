import { useEffect } from 'react';
import { ANCHOR_MAP } from '../constants/descriptors/anchorDescriptors';
import { getSvgSize } from '../utils/svgUtils';
import {
  drawTorsoSvg,
  drawHeadSvg,
  drawHorizontalSegmentSvg,
  drawVerticalSegmentSvg,
  drawHandSvg,
  drawLegSvg,
  drawFootSvg,
} from '../utils/drawingUtils';
import { useShiftFactors } from '../context/ShiftFactorsContext';

export function useSetAnchorsAndDraw({
  canvasRef,
  imagesRef,
  width,
  height,
  displayLandmarks,
  replay,
  scaleWebcamX,
  scaleWebcamY,
  svgs,
  armOrientation,
  torsoDimsRef, 
  earDistRef,
}) {
  const { factorsRef } = useShiftFactors();
  useEffect(() => {
    const debugPipeline = false;     
    const torsoDims = torsoDimsRef?.current;
    const avgTorsoWidth = torsoDims?.avgTorsoWidth; 
    const avgTorsoHeight = torsoDims?.avgTorsoHeight;

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
      if (debugPipeline) console.log('LOADED:', part);
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
      if (debugPipeline) console.log(`Part: ${part}, Anchors:`, anchors); 


      /*========================================================================
                                        TORSO 
      ========================================================================*/
      if (
        part === 'torso' &&
        map.topLeft !== undefined && map.topRight !== undefined &&
        map.bottomLeft !== undefined && map.bottomRight !== undefined
      ) {
          if (debugPipeline) console.log('SET ANCHORS: ', part);
          const tl = scaledLandmarks[map.topLeft];
          const tr = scaledLandmarks[map.topRight];
          const bl = scaledLandmarks[map.bottomLeft];
          const br = scaledLandmarks[map.bottomRight];
        
          if (!tl || !tr || !bl || !br) continue;
          if (tl.score < 0.3 || tr.score < 0.3 || bl.score < 0.3 || br.score < 0.3) continue;
          if (debugPipeline) console.log('VALID ANCHORS: ', part);
          const shoulderWidth = tr.x - tl.x;
          const hipWidth = br.x - bl.x;
          const offset = shoulderWidth / 2;
          
          torsoDims.updateAvgTorsoHeight(
            Math.hypot(
              (tl.x + tr.x) / 2 - (bl.x + br.x) / 2,
              (tl.y + tr.y) / 2 - (bl.y + br.y) / 2
            )
          );
        
          torsoDims.updateAvgTorsoWidth(shoulderWidth);
          torsoDims.updateAvgHipWidth(hipWidth);
        
          const success = drawTorsoSvg(ctx, img, tl, tr, bl, br);     
          if (success) { 
            if (debugPipeline) console.log('DREW: ', part);
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
        if (debugPipeline) console.log('SET ANCHORS: ', part);
        const earDist = earDistRef?.current;
        const leftEar = scaledLandmarks[map.leftAnchor];
        const rightEar = scaledLandmarks[map.rightAnchor];
        
        if (!leftEar || !rightEar || leftEar.score < 0.3 ||
           rightEar.score < 0.3) { continue };
        
        earDist.updateAvgEarDistance(
          Math.hypot(
            rightEar.x - leftEar.x,
            rightEar.y - leftEar.y
          )
        ); 
        
        let leftEarAdjusted = leftEar;
        let rightEarAdjusted = rightEar;
        
        leftEarAdjusted = {
          x: leftEar.x + factorsRef.current.headShift.x,
          y: leftEar.y + factorsRef.current.headShift.y,
        };
        rightEarAdjusted = {
          x: rightEar.x - factorsRef.current.headShift.x,
          y: rightEar.y + factorsRef.current.headShift.y,
        };

        const success = drawHeadSvg(ctx, img, leftEarAdjusted, rightEarAdjusted, torsoDims, earDist); 
        if (success) { 
          if (debugPipeline) console.log('DREW: ', part);
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
        if (debugPipeline) console.log('SET ANCHORS: ', part);
        
        const from = scaledLandmarks[map.start];
        const to = scaledLandmarks[map.end];
        if (!from || !to) continue;
        
        if (debugPipeline) console.log('VALID ANCHORS: ', part);

        /* Apply shifts to anchors 
        ----------------------------------------------------------------------*/
        let fromAdjusted = from; 
        let toAdjusted = to; 

        if (part === 'rightUpperArm') {
          fromAdjusted = {
            x: from.x + factorsRef.current.shoulderShift.x,
            y: from.y + factorsRef.current.shoulderShift.y, 
          }; 
          toAdjusted = {
            x: to.x + factorsRef.current.elbowShift.x,
            y: to.y + factorsRef.current.elbowShift.y,
          }; 
        } else if (part === 'leftUpperArm') {
          fromAdjusted = {
            x: from.x - factorsRef.current.shoulderShift.x,
            y: from.y + factorsRef.current.shoulderShift.y,
          }; 
          toAdjusted = {
            x: to.x - factorsRef.current.elbowShift.x,
            y: to.y + factorsRef.current.elbowShift.y,
          }; 
        } else if (part === 'rightLowerArm') {
          fromAdjusted = {
            x: from.x + factorsRef.current.elbowShift.x,
            y: from.y + factorsRef.current.elbowShift.y,
          }; 
          toAdjusted = {
            x: to.x + factorsRef.current.wristShift.x,
            y: to.y + factorsRef.current.wristShift.y,
          }; 
        } else if (part === 'leftLowerArm') {
          fromAdjusted = {
            x: from.x - factorsRef.current.elbowShift.x,
            y: from.y + factorsRef.current.elbowShift.y,
          }; 
          toAdjusted = {
            x: to.x - factorsRef.current.wristShift.x,
            y: to.y + factorsRef.current.wristShift.y,
          }; 
        }
        
        /* Draw
        ----------------------------------------------------------------------*/
        const success = 
          drawHorizontalSegmentSvg(ctx, img, fromAdjusted, toAdjusted, part, torsoDims);
        if (success) { 
          if (debugPipeline) console.log('DREW: ', part);
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

        if (debugPipeline) console.log('VALID ANCHORS: ', part);

        let fromAdjusted = from;
        let toAdjusted = to;
        if (part === 'rightHand') {
          fromAdjusted = {
            x: from.x + factorsRef.current.wristShift.x,
            y: from.y + factorsRef.current.wristShift.y,
          };
          toAdjusted = {
            x: to.x + factorsRef.current.elbowShift.x,
            y: to.y + factorsRef.current.elbowShift.y,
          };
        } else {
          fromAdjusted = {
            x: from.x - factorsRef.current.wristShift.x,
            y: from.y + factorsRef.current.wristShift.y,
          };
          toAdjusted = {
            x: to.x - factorsRef.current.elbowShift.x,
            y: to.y + factorsRef.current.elbowShift.y,
          };
        }

        const success = drawHandSvg(
          ctx, img, fromAdjusted, toAdjusted, armsDown, part, torsoDims);
        if (success) { 
          if (debugPipeline) console.log('DREW: ', part);
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
        if (debugPipeline) console.log('SET ANCHORS: ', part);
        
        const from = scaledLandmarks[map.start];
        const to = scaledLandmarks[map.end];
        
        if (!from || !to) continue;
        if (debugPipeline) console.log('VALID ANCHORS: ', part);

        /* Apply shifts to anchors
        ----------------------------------------------------------------------*/
        let fromAdjusted = from; 
        let toAdjusted = to; 
        
        if (part === 'rightUpperLeg') {
          fromAdjusted = {
            x: from.x + factorsRef.current.hipShift.x,
            y: from.y + factorsRef.current.hipShift.y,
          };
          toAdjusted = {
            x: to.x + factorsRef.current.kneeShift.x,
            y: to.y + factorsRef.current.kneeShift.y,
          };
        } else if (part === 'leftUpperLeg') {
          fromAdjusted = {
            x: from.x - factorsRef.current.hipShift.x,
            y: from.y + factorsRef.current.hipShift.y,
          };
          toAdjusted = {
            x: to.x - factorsRef.current.kneeShift.x,
            y: to.y + factorsRef.current.kneeShift.y,
          };
        } else if (part === 'rightLowerLeg') {
          fromAdjusted = {
            x: from.x + factorsRef.current.kneeShift.x,
            y: from.y + factorsRef.current.kneeShift.y,
          };
          toAdjusted = {
            x: to.x + factorsRef.current.ankleShift.x,
            y: to.y + factorsRef.current.ankleShift.y,
          };
        } else if (part === 'leftLowerLeg') {
          fromAdjusted = {
            x: from.x - factorsRef.current.kneeShift.x,
            y: from.y + factorsRef.current.kneeShift.y,
          };
          toAdjusted = {
            x: to.x - factorsRef.current.ankleShift.x,
            y: to.y + factorsRef.current.ankleShift.y,
          };
        }

        /* Draw
        ----------------------------------------------------------------------*/
        const success = 
          drawLegSvg(ctx, img, fromAdjusted, toAdjusted, part, torsoDims); 
        if (success) { 
          if (debugPipeline) console.log('DREW: ', part);
          continue;
        } 
      }

      /*========================================================================
                                        FEET
      ========================================================================*/
      if (part === 'leftFoot' || part === 'rightFoot') {
        if (debugPipeline) console.log('SET ANCHORS: ', part);
        const torsoDims = torsoDimsRef?.current;
        if (map.start === undefined || map.end === undefined) return false;
        const from = scaledLandmarks[map.start];
        const to = scaledLandmarks[map.end];
        if (!from || !to || from.score < 0.3) return false;

        let fromAdjusted, toAdjusted;
        if (part === 'rightFoot') {
          fromAdjusted = {
            x: from.x + factorsRef.current.ankleShift.x,
            y: from.y + factorsRef.current.ankleShift.y,
          };
          toAdjusted = {
            x: to.x + factorsRef.current.footShift.x,
            y: to.y + factorsRef.current.footShift.y,
          };
        } else {
          fromAdjusted = {
            x: from.x - factorsRef.current.ankleShift.x,
            y: from.y + factorsRef.current.ankleShift.y,
          };
          toAdjusted = {
            x: to.x - factorsRef.current.footShift.x,
            y: to.y + factorsRef.current.footShift.y,
          };
        }
        const success = drawFootSvg(ctx, img, fromAdjusted, toAdjusted, part, torsoDims);
        if (success) { 
          if (debugPipeline) console.log('DREW: ', part);
          continue;
        }
      }
    }

  }, [
    displayLandmarks,
    width, height,
    scaleWebcamX, scaleWebcamY,
    svgs,
    armOrientation,
    torsoDimsRef,
  ]);
}