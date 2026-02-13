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
  debugAnchorsFlag = false,
}) {
  // Context APIs may expose `factorsRef` (legacy) or specific named refs.
  const _shiftCtx = useShiftFactors();
  const shiftFactorsRef = _shiftCtx.shiftFactorsRef || _shiftCtx.factorsRef;

  const _scaleCtx = useScaleFactors();
  const scaleFactorsRef = _scaleCtx.scaleFactorsRef || _scaleCtx.factorsRef;
  
  useEffect(() => {
    
    const debugPipeline = true;    
    if (debugPipeline) console.log('useSetAnchorsAndDraw: start', { width, height, hasLandmarks: !!displayLandmarks, landmarkCount: displayLandmarks?.length });
    const torsoDims = torsoDimsRef?.current;
    const avgTorsoWidth = Number.isFinite(torsoDims?.avgTorsoWidth)
      ? torsoDims.avgTorsoWidth
      : 1; 
    const avgTorsoHeight = Number.isFinite(torsoDims?.avgTorsoHeight)
      ? torsoDims.avgTorsoHeight
      : 1;

    const canvas = canvasRef?.current; 
    if (!canvas) {
      if (debugPipeline) console.warn('useSetAnchorsAndDraw: no canvasRef');
      return;
    }
    const images = imagesRef?.current;
    if (!images) {
      if (debugPipeline) console.warn('useSetAnchorsAndDraw: no images (cached svgs not ready)');
      return;
    }
    
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
      
      try {
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
        if (hasInvalidAnchor) {
          if (debugPipeline) console.log('INVALID ANCHORS: ', part, anchors);
          continue;
        }            

        const { w: svgW, h: svgH } = getSvgSize(img);
        if (debugPipeline) console.log(`Part: ${part}, Anchors:`, anchors);
        
        const faceEps = 0.5; // tune if needed
        const facingFront = avgTorsoWidth > faceEps;
        const facingBack = avgTorsoWidth < -faceEps;

        // fallback so startup frames still render
        const renderFront = facingFront || (!facingFront && !facingBack);
        const renderBack = facingBack;

        const isFrontHead = part === 'head';
        const isBackHead = part === 'headBack';
        const isFrontTorso = part === 'torso';
        const isBackTorso = part === 'torsoBack';
        const isFrontArm = part === 'leftUpperArm' || part === 'rightUpperArm' || 
          part === 'leftLowerArm' || part === 'rightLowerArm';
        const isBackArm = part === 'leftUpperArmBack' || part === 'rightUpperArmBack' 
          || part === 'leftLowerArmBack' || part === 'rightLowerArmBack';
        const isFrontHand = part === 'leftHand' || part === 'rightHand';
        const isBackHand = part === 'leftHandBack' || part === 'rightHandBack';
        const isFrontLeg = part === 'leftUpperLeg' || part === 'rightUpperLeg' || 
          part === 'leftLowerLeg' || part === 'rightLowerLeg';
        const isBackLeg = part === 'leftUpperLegBack' || part === 'rightUpperLegBack' || 
          part === 'leftLowerLegBack' || part === 'rightLowerLegBack';
        const isFrontFoot = part === 'leftFoot' || part === 'rightFoot';
        const isBackFoot = part === 'leftFootBack' || part === 'rightFootBack';


        /*========================================================================
                                          TORSO 
        ========================================================================*/
        if (
          ((isFrontTorso && renderFront) ||
          (isBackTorso && renderBack)) &&
          map.topLeft !== undefined && map.topRight !== undefined &&
          map.bottomLeft !== undefined && map.bottomRight !== undefined
        ) {
            try {
              const tl = scaledLandmarks[map.topLeft];
              const tr = scaledLandmarks[map.topRight];
              const bl = scaledLandmarks[map.bottomLeft];
              const br = scaledLandmarks[map.bottomRight];
            
              if (!tl || !tr || !bl || !br) continue;
              if (tl.score < 0.3 || tr.score < 0.3 || bl.score < 0.3 || br.score < 0.3) continue;
              if (debugPipeline) console.log('VALID ANCHORS: ', part);
              const shoulderWidth = tr.x - tl.x;
              const hipWidth = br.x - bl.x;
              
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
                  x: tl.x + shiftFactorsRef.current.torsoShift.x * (avgTorsoWidth * 0.1),
                  y: tl.y + shiftFactorsRef.current.torsoShift.y * (avgTorsoHeight * 0.1),
                };
                trAdjusted = {
                  x: tr.x - shiftFactorsRef.current.torsoShift.x * (avgTorsoWidth * 0.1),
                  y: tr.y + shiftFactorsRef.current.torsoShift.y * (avgTorsoHeight * 0.1),
                };
                blAdjusted = {
                  x: bl.x + shiftFactorsRef.current.torsoShift.x * (avgTorsoWidth * 0.1),
                  y: bl.y - shiftFactorsRef.current.torsoShift.y * (avgTorsoHeight * 0.1),
                };
                brAdjusted = {
                  x: br.x - shiftFactorsRef.current.torsoShift.x * (avgTorsoWidth * 0.1),
                  y: br.y - shiftFactorsRef.current.torsoShift.y * (avgTorsoHeight * 0.1),
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
            } catch (e) {
              console.warn('Error drawing torso:', e);
              continue;
            }
        }

        /*========================================================================
                                          HEAD 
        ========================================================================*/
        if (
          ((isFrontHead && renderFront) ||
          (isBackHead && renderBack)) &&
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
            x: leftEar.x + shiftFactorsRef.current.headShift.x * (avgTorsoWidth * 0.1),
            y: leftEar.y + shiftFactorsRef.current.headShift.y * (avgTorsoHeight * 0.1),
          };

          rightEarAdjusted = {
            x: rightEar.x + shiftFactorsRef.current.headShift.x * (avgTorsoWidth * 0.1),
            y: rightEar.y + shiftFactorsRef.current.headShift.y * (avgTorsoHeight * 0.1),
          };

          const success = drawHeadSvg(
            ctx, img, 
            leftEarAdjusted, rightEarAdjusted, 
            torsoDims, earDist, 
            scaleFactorsRef.current.headScale
          ); 
          if (success) { 
            if (debugPipeline) console.log('DREW: ', part);
          } else {
            console.warn('Failed to draw head:', part);
          }
          continue; 
        }

        /*========================================================================
                                          ARMS 
        ========================================================================*/
        if (
          ((isFrontArm && renderFront) ||
          (isBackArm && renderBack)) &&
          map.start !== undefined && map.end !== undefined
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

          
          if (part === 'rightUpperArm' || part === 'rightUpperArmBack') {
            fromAdjusted = {
              x: from.x + ((shiftFactorsRef.current.shoulderShift.x + 
                shiftFactorsRef.current.torsoShift.x) * (avgTorsoWidth * 0.1)),
              y: from.y + ((shiftFactorsRef.current.shoulderShift.y + 
                shiftFactorsRef.current.torsoShift.y) * (avgTorsoHeight * 0.1)), 
            }; 
            toAdjusted = {
              x: to.x + (shiftFactorsRef.current.elbowShift.x * (avgTorsoWidth * 0.1)),
              y: to.y + (shiftFactorsRef.current.elbowShift.y * (avgTorsoHeight * 0.1)),
            }; 
          } else if (part === 'leftUpperArm' || part === 'leftUpperArmBack') {
            fromAdjusted = {
              x: from.x - ((shiftFactorsRef.current.shoulderShift.x + 
                shiftFactorsRef.current.torsoShift.x) * (avgTorsoWidth * 0.1)),
              y: from.y + ((shiftFactorsRef.current.shoulderShift.y + 
                shiftFactorsRef.current.torsoShift.y) * (avgTorsoHeight * 0.1)),
            }; 
            toAdjusted = {
              x: to.x - (shiftFactorsRef.current.elbowShift.x * (avgTorsoWidth * 0.1)),
              y: to.y + (shiftFactorsRef.current.elbowShift.y * (avgTorsoHeight * 0.1)),
            }; 
          } else if (part === 'rightLowerArm' || part === 'rightLowerArmBack') {
            fromAdjusted = {
              x: from.x + (shiftFactorsRef.current.elbowShift.x * (avgTorsoWidth * 0.1)),
              y: from.y + (shiftFactorsRef.current.elbowShift.y * (avgTorsoHeight * 0.1)),
            }; 
            toAdjusted = {
              x: to.x + (shiftFactorsRef.current.wristShift.x * (avgTorsoWidth * 0.1)),
              y: to.y + (shiftFactorsRef.current.wristShift.y * (avgTorsoHeight * 0.1)),
            }; 
          } else if (part === 'leftLowerArm' || part === 'leftLowerArmBack') {
            fromAdjusted = {
              x: from.x - (shiftFactorsRef.current.elbowShift.x * (avgTorsoWidth * 0.1)),
              y: from.y + (shiftFactorsRef.current.elbowShift.y * (avgTorsoHeight * 0.1)),
            }; 
            toAdjusted = {
              x: to.x - (shiftFactorsRef.current.wristShift.x * (avgTorsoWidth * 0.1)), 
              y: to.y + (shiftFactorsRef.current.wristShift.y * (avgTorsoHeight * 0.1)), 
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
            if (debugAnchorsFlag) { debugAnchors(fromAdjusted, toAdjusted, ctx, part, avgTorsoHeight); }
            if (debugPipeline) console.log('DREW: ', part);
          } else {
            console.warn('Failed to draw arm:', part);
          }
          continue; 
        }

        /*========================================================================
                                          HANDS 
        ========================================================================*/
        if (
          ((isFrontHand && renderFront) || (isBackHand && renderBack)) &&
       
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
          if (part === 'rightHand' || part === 'rightHandBack') {
            fromAdjusted = {
              x: from.x + (shiftFactorsRef.current.wristShift.x * (avgTorsoWidth * 0.1)),
              y: from.y + (shiftFactorsRef.current.wristShift.y * (avgTorsoHeight * 0.1)),
            };
            toAdjusted = {
              x: to.x + (shiftFactorsRef.current.elbowShift.x * (avgTorsoWidth * 0.1)),
              y: to.y + (shiftFactorsRef.current.elbowShift.y * (avgTorsoHeight * 0.1)),
            };
          } else {
            fromAdjusted = {
              x: from.x - (shiftFactorsRef.current.wristShift.x * (avgTorsoWidth * 0.1)),
              y: from.y + (shiftFactorsRef.current.wristShift.y * (avgTorsoHeight * 0.1)),
            };
            toAdjusted = {
              x: to.x - (shiftFactorsRef.current.elbowShift.x * (avgTorsoWidth * 0.1)),
              y: to.y + (shiftFactorsRef.current.elbowShift.y * (avgTorsoHeight * 0.1)),
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
            if (debugAnchorsFlag) {
              debugAnchors(fromAdjusted, toAdjusted, ctx, part, avgTorsoHeight);
            }
            if (debugPipeline) console.log('DREW: ', part);
          } else {
            console.warn('Failed to draw hand:', part);
          }
          continue; 
          
        }

        /*========================================================================
                                          LEGS
        ========================================================================*/
        if (
          ((isFrontLeg && renderFront) || (isBackLeg && renderBack)) && 
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
              x: from.x + ((shiftFactorsRef.current.torsoShift.x + 
                shiftFactorsRef.current.hipShift.x) * (avgTorsoWidth * 0.1)),
              y: from.y + ((-shiftFactorsRef.current.torsoShift.y + 
                shiftFactorsRef.current.hipShift.y) * (avgTorsoHeight * 0.1)),
            };
            toAdjusted = {
              x: to.x + (shiftFactorsRef.current.kneeShift.x * (avgTorsoWidth * 0.1)),
              y: to.y + (shiftFactorsRef.current.kneeShift.y * (avgTorsoHeight * 0.1)),
            };
          } else if (part === 'leftUpperLeg') {
            fromAdjusted = {
              x: from.x - ((shiftFactorsRef.current.torsoShift.x + 
                shiftFactorsRef.current.hipShift.x) * (avgTorsoWidth * 0.1)),
              y: from.y + ((-shiftFactorsRef.current.torsoShift.y + 
                shiftFactorsRef.current.hipShift.y) * (avgTorsoHeight * 0.1)),
            };
            toAdjusted = {
              x: to.x - (shiftFactorsRef.current.kneeShift.x * (avgTorsoWidth * 0.1)),
              y: to.y + (shiftFactorsRef.current.kneeShift.y * (avgTorsoHeight * 0.1)),
            };
          } else if (part === 'rightLowerLeg') {
            fromAdjusted = {
              x: from.x + (shiftFactorsRef.current.kneeShift.x * (avgTorsoWidth * 0.1)),
              y: from.y + (shiftFactorsRef.current.kneeShift.y * (avgTorsoHeight * 0.1)),
            };
            toAdjusted = {
              x: to.x + (shiftFactorsRef.current.ankleShift.x * (avgTorsoWidth * 0.1)),
              y: to.y + (shiftFactorsRef.current.ankleShift.y * (avgTorsoHeight * 0.1)), // add tiny value to prevent exact overlap with original anchor
            };
          } else if (part === 'leftLowerLeg') {
            fromAdjusted = {
              x: from.x - (shiftFactorsRef.current.kneeShift.x * (avgTorsoWidth * 0.1)),
              y: from.y + (shiftFactorsRef.current.kneeShift.y * (avgTorsoHeight * 0.1)),
            };
            toAdjusted = {
              x: to.x - (shiftFactorsRef.current.ankleShift.x * (avgTorsoWidth * 0.1)),
              y: to.y + (shiftFactorsRef.current.ankleShift.y * (avgTorsoHeight * 0.1)),
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
            if (debugAnchorsFlag) { debugAnchors(fromAdjusted, toAdjusted, ctx, part, avgTorsoHeight); }
            
          } else {
            console.warn('Failed to draw leg:', part);
          }
          continue;
        }

        /*========================================================================
                                          FEET
        ========================================================================*/
        if (((isFrontFoot && renderFront) || (isBackFoot && renderBack)) &&
          map.start !== undefined && map.end !== undefined) {
          if (debugPipeline) console.log('SET ANCHORS: ', part);
          const torsoDims = torsoDimsRef?.current;
          if (map.start === undefined || map.end === undefined) continue;
          const from = scaledLandmarks[map.start];
          const to = scaledLandmarks[map.end];
          if (!from || !to || from.score < 0.3) continue;

          let fromAdjusted, toAdjusted;
          if (part === 'rightFoot') {
            fromAdjusted = {
              x: from.x + (shiftFactorsRef.current.ankleShift.x * (avgTorsoWidth * 0.1)),
              y: from.y + (shiftFactorsRef.current.ankleShift.y * (avgTorsoHeight * 0.1)),
            };
            toAdjusted = {
              x: to.x + (shiftFactorsRef.current.footShift.x * (avgTorsoWidth * 0.1)),
              y: to.y + (shiftFactorsRef.current.footShift.y * (avgTorsoHeight * 0.1)),
            };
          } else {
            fromAdjusted = {
              x: from.x - (shiftFactorsRef.current.ankleShift.x * (avgTorsoWidth * 0.1)),
              y: from.y + (shiftFactorsRef.current.ankleShift.y * (avgTorsoHeight * 0.1)),
            };
            toAdjusted = {
              x: to.x - (shiftFactorsRef.current.footShift.x * (avgTorsoWidth * 0.1)),
              y: to.y + (shiftFactorsRef.current.footShift.y * (avgTorsoHeight * 0.1)), 
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
            if (debugAnchorsFlag) { debugAnchors(fromAdjusted, toAdjusted, ctx, part, avgTorsoHeight); }
            continue;
          }
        }
      } catch (e) {
        console.warn(`Error processing part ${part}:`, e);
        continue;
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