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
import { useScaleFactors } from '../context/ScaleFactorsContext';
import { debugAnchors } from '../test/debugAnchors';
import { scale } from '@shopify/react-native-skia';

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
  // Context APIs may expose `factorsRef` (legacy) or specific named refs.
  const _shiftCtx = useShiftFactors();
  const shiftFactorsRef = _shiftCtx.shiftFactorsRef || _shiftCtx.factorsRef;

  const _scaleCtx = useScaleFactors();
  const scaleFactorsRef = _scaleCtx.scaleFactorsRef || _scaleCtx.factorsRef;
  
  useEffect(() => {
    let debugPoints = true; // Set to true to visualize anchor points and shifts for debugging
    const debugPipeline = false;     
    const torsoDims = torsoDimsRef?.current;
    const avgTorsoWidth = Math.abs(torsoDims?.avgTorsoWidth); 
    const avgTorsoHeight = Math.abs(torsoDims?.avgTorsoHeight);
    const torsoDimAvg = (avgTorsoWidth + avgTorsoHeight) / 2;

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
          
          let tlAdjusted = tl;
          let trAdjusted = tr;
          let blAdjusted = bl;
          let brAdjusted = br;
          
          try {
            tlAdjusted = {
              x: tl.x + shiftFactorsRef.current.torsoShift.x / avgTorsoWidth + 1e-5,
              y: tl.y + shiftFactorsRef.current.torsoShift.y / avgTorsoHeight + 1e-5,
            };
            trAdjusted = {
              x: tr.x - shiftFactorsRef.current.torsoShift.x / avgTorsoWidth + 1e-5,
              y: tr.y + shiftFactorsRef.current.torsoShift.y / avgTorsoHeight + 1e-5,
            };
            blAdjusted = {
              x: bl.x + shiftFactorsRef.current.torsoShift.x / avgTorsoWidth + 1e-5,
              y: bl.y - shiftFactorsRef.current.torsoShift.y / avgTorsoHeight + 1e-5,
            };
            brAdjusted = {
              x: br.x - shiftFactorsRef.current.torsoShift.x / avgTorsoWidth + 1e-5,
              y: br.y - shiftFactorsRef.current.torsoShift.y / avgTorsoHeight + 1e-5,
            };
          } catch (e) {
            console.warn('Error adjusting torso anchors:', e);
            continue;
          }

          const success = drawTorsoSvg(ctx, img, tlAdjusted, trAdjusted, blAdjusted, brAdjusted);     
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
          x: leftEar.x + shiftFactorsRef.current.headShift.x / avgTorsoWidth + 1e-5,
          y: leftEar.y + shiftFactorsRef.current.headShift.y / avgTorsoHeight + 1e-5,
        };

        rightEarAdjusted = {
          x: rightEar.x + shiftFactorsRef.current.headShift.x / avgTorsoWidth + 1e-5,
          y: rightEar.y + shiftFactorsRef.current.headShift.y / avgTorsoHeight + 1e-5,
        };

        const success = drawHeadSvg(
          ctx, img, 
          leftEarAdjusted, rightEarAdjusted, 
          torsoDims, earDist, 
          scaleFactorsRef.current.headScale
        ); 
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
        ------------------------------------------------------------------------
        - Fetch current shift factors from context and apply to anchor points 
        - 
        ----------------------------------------------------------------------*/
        let fromAdjusted = from; 
        let toAdjusted = to; 

        
        if (part === 'rightUpperArm') {
          fromAdjusted = {
            x: from.x + (shiftFactorsRef.current.shoulderShift.x + 
              shiftFactorsRef.current.torsoShift.x) / avgTorsoWidth + 1e-5,
            y: from.y + (shiftFactorsRef.current.shoulderShift.y + 
              shiftFactorsRef.current.torsoShift.y) / avgTorsoHeight + 1e-5, 
          }; 
          toAdjusted = {
            x: to.x + shiftFactorsRef.current.elbowShift.x / avgTorsoWidth + 1e-5,
            y: to.y + shiftFactorsRef.current.elbowShift.y / avgTorsoHeight + 1e-5,
          }; 
        } else if (part === 'leftUpperArm') {
          fromAdjusted = {
            x: from.x - (shiftFactorsRef.current.shoulderShift.x + 
              shiftFactorsRef.current.torsoShift.x) / avgTorsoWidth + 1e-5,
            y: from.y + (shiftFactorsRef.current.shoulderShift.y + 
              shiftFactorsRef.current.torsoShift.y) / avgTorsoHeight + 1e-5,
          }; 
          toAdjusted = {
            x: to.x - shiftFactorsRef.current.elbowShift.x / avgTorsoWidth + 1e-5,
            y: to.y + shiftFactorsRef.current.elbowShift.y / avgTorsoHeight + 1e-5,
          }; 
        } else if (part === 'rightLowerArm') {
          fromAdjusted = {
            x: from.x + shiftFactorsRef.current.elbowShift.x / avgTorsoWidth + 1e-5,
            y: from.y + shiftFactorsRef.current.elbowShift.y / avgTorsoHeight + 1e-5,
          }; 
          toAdjusted = {
            x: to.x + shiftFactorsRef.current.wristShift.x / avgTorsoWidth + 1e-5,
            y: to.y + shiftFactorsRef.current.wristShift.y / avgTorsoHeight + 1e-5,
          }; 
        } else if (part === 'leftLowerArm') {
          fromAdjusted = {
            x: from.x - shiftFactorsRef.current.elbowShift.x / avgTorsoWidth + 1e-5,
            y: from.y + shiftFactorsRef.current.elbowShift.y / avgTorsoHeight + 1e-5,
          }; 
          toAdjusted = {
            x: to.x - shiftFactorsRef.current.wristShift.x / avgTorsoWidth + 1e-5, 
            y: to.y + shiftFactorsRef.current.wristShift.y / avgTorsoHeight + 1e-5, 
          }; 
        }

        /* Draw
        ----------------------------------------------------------------------*/
        const success = 
          drawHorizontalSegmentSvg(
            ctx, img, 
            fromAdjusted, toAdjusted, 
            part, 
            torsoDims,
            scaleFactorsRef.current.armScale, 
          );
        if (success) { 
          if (debugPipeline) console.log('DREW: ', part);
          if (debugPoints) { debugAnchors(fromAdjusted, toAdjusted, ctx, part, avgTorsoHeight); }
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
            x: from.x + shiftFactorsRef.current.wristShift.x / avgTorsoWidth + 1e-5,
            y: from.y + shiftFactorsRef.current.wristShift.y / avgTorsoHeight + 1e-5,
          };
          toAdjusted = {
            x: to.x + shiftFactorsRef.current.elbowShift.x / avgTorsoWidth + 1e-5,
            y: to.y + shiftFactorsRef.current.elbowShift.y / avgTorsoHeight + 1e-5,
          };
        } else {
          fromAdjusted = {
            x: from.x - shiftFactorsRef.current.wristShift.x / avgTorsoWidth + 1e-5,
            y: from.y + shiftFactorsRef.current.wristShift.y / avgTorsoHeight + 1e-5,
          };
          toAdjusted = {
            x: to.x - shiftFactorsRef.current.elbowShift.x / avgTorsoWidth + 1e-5,
            y: to.y + shiftFactorsRef.current.elbowShift.y / avgTorsoHeight + 1e-5,
          };
        }

        const success = drawHandSvg(
          ctx, img, 
          fromAdjusted, toAdjusted, 
          armsDown, part, 
          torsoDims, 
          scaleFactorsRef.current.handScale
        );
        if (success) { 
          if (debugPipeline) console.log('DREW: ', part);
          if (debugPoints) { debugAnchors(fromAdjusted, toAdjusted, ctx, part, avgTorsoHeight); }
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
            x: from.x + shiftFactorsRef.current.hipShift.x / avgTorsoWidth + 1e-5,
            y: from.y + shiftFactorsRef.current.hipShift.y / avgTorsoHeight + 1e-5,
          };
          toAdjusted = {
            x: to.x + shiftFactorsRef.current.kneeShift.x / avgTorsoWidth + 1e-5,
            y: to.y + shiftFactorsRef.current.kneeShift.y / avgTorsoHeight + 1e-5,
          };
        } else if (part === 'leftUpperLeg') {
          fromAdjusted = {
            x: from.x - shiftFactorsRef.current.hipShift.x / avgTorsoWidth + 1e-5,
            y: from.y + shiftFactorsRef.current.hipShift.y / avgTorsoHeight + 1e-5,
          };
          toAdjusted = {
            x: to.x - shiftFactorsRef.current.kneeShift.x / avgTorsoWidth + 1e-5,
            y: to.y + shiftFactorsRef.current.kneeShift.y / avgTorsoHeight + 1e-5,
          };
        } else if (part === 'rightLowerLeg') {
          fromAdjusted = {
            x: from.x + shiftFactorsRef.current.kneeShift.x / avgTorsoWidth + 1e-5,
            y: from.y + shiftFactorsRef.current.kneeShift.y / avgTorsoHeight + 1e-5,
          };
          toAdjusted = {
            x: to.x + shiftFactorsRef.current.ankleShift.x / avgTorsoWidth + 1e-5,
            y: to.y + shiftFactorsRef.current.ankleShift.y / avgTorsoHeight + 1e-5, // add tiny value to prevent exact overlap with original anchor
          };
        } else if (part === 'leftLowerLeg') {
          fromAdjusted = {
            x: from.x - shiftFactorsRef.current.kneeShift.x / avgTorsoWidth + 1e-5,
            y: from.y + shiftFactorsRef.current.kneeShift.y / avgTorsoHeight + 1e-5,
          };
          toAdjusted = {
            x: to.x - shiftFactorsRef.current.ankleShift.x / avgTorsoWidth + 1e-5,
            y: to.y + shiftFactorsRef.current.ankleShift.y / avgTorsoHeight + 1e-5,
          };
        }

        /* Draw
        ----------------------------------------------------------------------*/
        const success = 
          drawLegSvg(
            ctx, img, 
            fromAdjusted, toAdjusted, 
            part, 
            torsoDims, 
            scaleFactorsRef.current.legScale,
          ); 
        if (success) { 
          if (debugPipeline) console.log('DREW: ', part);
          if (debugPoints) { debugAnchors(fromAdjusted, toAdjusted, ctx, part, avgTorsoHeight); }
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
            x: from.x + shiftFactorsRef.current.ankleShift.x / avgTorsoWidth + 1e-5,
            y: from.y + shiftFactorsRef.current.ankleShift.y / avgTorsoHeight + 1e-5,
          };
          toAdjusted = {
            x: to.x + shiftFactorsRef.current.footShift.x / avgTorsoWidth + 1e-5,
            y: to.y + shiftFactorsRef.current.footShift.y / avgTorsoHeight + 1e-5,
          };
        } else {
          fromAdjusted = {
            x: from.x - shiftFactorsRef.current.ankleShift.x / avgTorsoWidth + 1e-5,
            y: from.y + shiftFactorsRef.current.ankleShift.y / avgTorsoHeight + 1e-5,
          };
          toAdjusted = {
            x: to.x - shiftFactorsRef.current.footShift.x / avgTorsoWidth + 1e-5,
            y: to.y + shiftFactorsRef.current.footShift.y / avgTorsoHeight + 1e-5, 
          };
        }

        
        const success = drawFootSvg(
          ctx, img, 
          fromAdjusted, toAdjusted, 
          part, 
          torsoDims,
          scaleFactorsRef.current.footScale
        );
        if (success) { 
          if (debugPipeline) console.log('DREW: ', part);
          if (debugPoints) { debugAnchors(fromAdjusted, toAdjusted, ctx, part, avgTorsoHeight); }
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