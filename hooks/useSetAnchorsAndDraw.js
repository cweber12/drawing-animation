import { useEffect, useState } from 'react';
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
import { set } from 'lodash';

import { 
  setTorsoAnchors, 
  setHeadAnchors,
  setArmAnchors,
  setHandAnchors,
  setLegAnchors,
  setFootAnchors, 
} from '../utils/setAnchors';

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
  
  /* Scale/Shift Factor Contexts
  ----------------------------------------------------------------------------*/
  const _shiftCtx = useShiftFactors();
  const shiftFactorsRef = _shiftCtx.shiftFactorsRef || _shiftCtx.factorsRef;

  const _scaleCtx = useScaleFactors();
  const scaleFactorsRef = _scaleCtx.scaleFactorsRef || _scaleCtx.factorsRef;
  
  useEffect(() => {
    
    const debugPipeline = true;    
    if (debugPipeline) console.log('useSetAnchorsAndDraw: start', { 
      width, height, 
      hasLandmarks: !!displayLandmarks, 
      landmarkCount: displayLandmarks?.length 
    });
    
    /* Context Values and Refs
    --------------------------------------------------------------------------*/
    // Dimensions for calculating shifts and scales
    const torsoDims = torsoDimsRef?.current;
    const earDist = earDistRef?.current;
    const avgTorsoWidth = Number.isFinite(torsoDims?.avgTorsoWidth)
      ? torsoDims.avgTorsoWidth
      : 1; 
    const avgTorsoHeight = Number.isFinite(torsoDims?.avgTorsoHeight)
      ? torsoDims.avgTorsoHeight
      : 1;

    // Canvas used for drawing SVGs  
    const canvas = canvasRef?.current; 
    if (!canvas) {
      if (debugPipeline) console.warn('useSetAnchorsAndDraw: no canvasRef');
      return;
    }

    // Clear previous frame
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, width, height);

    // Cached SVG images
    const images = imagesRef?.current;
    if (!images) {
      if (debugPipeline) console.warn('useSetAnchorsAndDraw: svgs not ready');
      return;
    }

    /* Rotation Detection : Front vs Back Facing
    --------------------------------------------------------------------------*/
    const faceEps = 0.1; 
    const facingFront = avgTorsoWidth > faceEps;
    const facingBack = avgTorsoWidth < -faceEps;

    // fallback so startup frames still render
    const renderFront = facingFront || (!facingFront && !facingBack);
    const renderBack = facingBack;

    /* Deferred Torso Drawing Setup
    ----------------------------------------------------------------------------
    Front Facing: Draw torso immediately when processing torso anchors
    Back Facing: Defer drawing torso until after processing other parts, so 
                 arms/legs/head are drawn behind torso.
    --------------------------------------------------------------------------*/
    const shouldDeferTorso = renderBack;
    let deferredTorso = null; // { img, anchors }

    /* Validate and Scale Landmarks
    --------------------------------------------------------------------------*/
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

    /* =========================================================================
                            MAIN LOOP: SET ANCHORS & DRAW PARTS
    ==========================================================================*/
    for (const [part, img] of Object.entries(images)) {
      
      try {

        /* Fetch/validate anchor indices & corresponding landmarks for this part
        ----------------------------------------------------------------------*/
        const map = ANCHOR_MAP[part];
        if (!map || !img) continue;
        if (debugPipeline) console.log('LOADED:', part);
        const anchorIndices = 
          Object.values(map).filter(idx => typeof idx === 'number');
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

        if (debugPipeline) console.log(`Part: ${part}, Anchors:`, anchors);
       
        /* Determine part type & direction (front/back) 
        ----------------------------------------------------------------------*/
        // Head 
        const isFrontHead = part === 'head';
        const isBackHead = part === 'headBack';
        // Torso
        const isFrontTorso = part === 'torso';
        const isBackTorso = part === 'torsoBack';
        // Arms
        const isFrontArm = part === 'leftUpperArm' || part === 'rightUpperArm' || 
          part === 'leftLowerArm' || part === 'rightLowerArm';
        const isBackArm = part === 'leftUpperArmBack' || 
          part === 'rightUpperArmBack' || part === 'leftLowerArmBack' || 
          part === 'rightLowerArmBack';
        // Hands
        const isFrontHand = part === 'leftHand' || part === 'rightHand';
        const isBackHand = part === 'leftHandBack' || part === 'rightHandBack';
        // Legs
        const isFrontLeg = part === 'leftUpperLeg' || part === 'rightUpperLeg' || 
          part === 'leftLowerLeg' || part === 'rightLowerLeg';
        const isBackLeg = part === 'leftUpperLegBack' || 
          part === 'rightUpperLegBack' || part === 'leftLowerLegBack' || 
          part === 'rightLowerLegBack';
        // Feet
        const isFrontFoot = part === 'leftFoot' || part === 'rightFoot';
        const isBackFoot = part === 'leftFootBack' || part === 'rightFootBack';


        /*======================================================================
                      CONDITIONALLY SET ANCHORS / DRAW 
        ======================================================================*/
        
        /* TORSO 
        ----------------------------------------------------------------------*/
        if (
          ((isFrontTorso && renderFront) ||
          (isBackTorso && renderBack)) &&
          map.topLeft !== undefined && map.topRight !== undefined &&
          map.bottomLeft !== undefined && map.bottomRight !== undefined
        ) {
          
          try {

            /* Set Anchors
            ------------------------------------------------------------------*/
            const anchors = setTorsoAnchors(
              part, 
              scaledLandmarks,
              avgTorsoWidth, avgTorsoHeight, torsoDims, 
              map, 
              shiftFactorsRef, 
              debugPipeline
            );
            
            if (!anchors) {
              if (debugPipeline) console.warn('setTorsoAnchors returned no anchors');
              continue;
            }

            // Returned anchors (adjusted)  
            const { tl, tr, bl, br } = anchors;
          
            /* Defer drawing torso if back-facing 
            --------------------------------------------------------------------
            Store image and anchors to draw after other parts
            ------------------------------------------------------------------*/
            if (shouldDeferTorso) {
              deferredTorso = { img, anchors: { tl, tr, bl, br } };
              continue;
            } else {
              
              /* Draw 
              ----------------------------------------------------------------*/
              const success = drawTorsoSvg(ctx, img, tl, tr, bl, br);     
              if (success) { 
                if (debugPipeline) console.log('DREW: ', part);
                continue;
              }
            }
          } catch (e) {
            console.warn('Error drawing torso:', e);
            continue;
          }
        }

        /* HEAD
        ----------------------------------------------------------------------*/
        if (
          ((isFrontHead && renderFront) ||
          (isBackHead && renderBack)) &&
          map.leftAnchor !== undefined &&
          map.rightAnchor !== undefined
        ) {
          if (debugPipeline) console.log('SETTING ANCHORS: ', part);

          /* Set Anchors
          --------------------------------------------------------------------*/
          const anchors = setHeadAnchors(
            scaledLandmarks,
            map,
            avgTorsoWidth,
            avgTorsoHeight,
            earDist, 
            shiftFactorsRef,
          );
          
          if (!anchors) {
            if (debugPipeline) console.warn('setHeadAnchors returned no anchors');
            continue;
          }
          const { leftAnchor, rightAnchor } = anchors;

          /* Draw
          --------------------------------------------------------------------*/
          const success = drawHeadSvg(
            ctx, img, 
            leftAnchor, rightAnchor, 
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

        /* ARMS
        ----------------------------------------------------------------------*/
        if (
          ((isFrontArm && renderFront) ||
          (isBackArm && renderBack)) &&
          map.start !== undefined && map.end !== undefined
        ) {

          if (debugPipeline) console.log('SET ANCHORS: ', part);
          /* Set Anchors
          --------------------------------------------------------------------*/
          const anchors = setArmAnchors(
            part,
            scaledLandmarks,
            map,
            avgTorsoWidth,
            avgTorsoHeight,
            shiftFactorsRef,
            debugPipeline
          );

          if (!anchors) {
            if (debugPipeline) console.warn('setArmAnchors returned no anchors');
            continue;
          }

          const { from, to } = anchors;

          /* Draw
          ----------------------------------------------------------------------*/
          const success = 
            drawHorizontalSegmentSvg(
              ctx, img, 
              from, to, 
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

        /* HANDS
        ----------------------------------------------------------------------*/
        if (
          ((isFrontHand && renderFront) || (isBackHand && renderBack)) &&    
          map.start !== undefined && map.end !== undefined
        ) {
          const { w: svgW, h: svgH } = getSvgSize(img);
          const armsDown = svgH > svgW;
          if (debugPipeline) console.log('SETTING ANCHORS: ', part);
          
          /* Set Anchors
          --------------------------------------------------------------------*/
          const anchors = setHandAnchors(
            part,
            scaledLandmarks,
            map,
            avgTorsoWidth,
            avgTorsoHeight,
            shiftFactorsRef,
            img,
            debugPipeline
          );

          if (!anchors) {
            if (debugPipeline) console.warn(
              'setHandAnchors returned no anchors');
            continue;
          }

          const { from, to } = anchors;

          /* Draw
          --------------------------------------------------------------------*/
          const success = drawHandSvg(
            ctx, img, 
            from, to, 
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

        /* LEGS
        ----------------------------------------------------------------------*/
        if (
          ((isFrontLeg && renderFront) || (isBackLeg && renderBack)) && 
          (map.start !== undefined && map.end !== undefined)
        ) {
          if (debugPipeline) console.log('SETTING ANCHORS: ', part);
          
          /* Set Anchors
          --------------------------------------------------------------------*/
          const anchors = setLegAnchors(
            part,
            scaledLandmarks,
            map,
            avgTorsoWidth,
            avgTorsoHeight,
            shiftFactorsRef,
          );

          if (!anchors) {
            if (debugPipeline) console.warn('setLegAnchors returned no anchors');
            continue;
          }
          const { from, to } = anchors;

          /* Draw
          ----------------------------------------------------------------------*/
          const success = 
            drawLegSvg(
              ctx, img, 
              from, to, 
              part, 
              torsoDims, 
              scaleFactorsRef.current.legScale,
            ); 
          if (success) { 
            if (debugPipeline) console.log('DREW: ', part);
            if (debugAnchorsFlag) { 
              debugAnchors(from, to, ctx, part, avgTorsoHeight); 
            }
            
          } else {
            console.warn('Failed to draw leg:', part);
          }
          continue;
        }

        /* FEET 
        ======================================================================*/
        if (((isFrontFoot && renderFront) || (isBackFoot && renderBack)) &&
          map.start !== undefined && map.end !== undefined
        ) {
          if (debugPipeline) console.log('SETTING ANCHORS: ', part);
          
          /* Set Anchors
          --------------------------------------------------------------------*/
          const anchors = setFootAnchors(
            part,
            scaledLandmarks,
            map,
            avgTorsoWidth,
            avgTorsoHeight,
            shiftFactorsRef
          );

          if (!anchors) {
            if (debugPipeline) console.warn('setFootAnchors returned no anchors');
            continue;
          }
          const { from, to } = anchors;

          /* Draw
          --------------------------------------------------------------------*/
          const success = drawFootSvg(
            ctx, img, 
            from, to, 
            part, 
            torsoDims,
            scaleFactorsRef.current.footScale
          );
          if (success) { 
            if (debugPipeline) console.log('DREW: ', part);
            if (debugAnchorsFlag) { 
              debugAnchors(from, to, ctx, part, avgTorsoHeight); 
            }
            continue;
          }
        }
      } catch (e) {
        console.warn(`Error processing part ${part}:`, e);
        continue;
      }
    }

    // After processing all parts, draw deferred torso if any (this ensures arms/back parts render beneath/above as desired)
    if (deferredTorso) {
      try {
        const { img, anchors } = deferredTorso;
        const res = drawTorsoSvg(ctx, img, anchors.tl, anchors.tr, anchors.bl, anchors.br);
        if (res && debugPipeline) console.log('DREW deferred torso after parts');
      } catch (e) {
        console.warn('Error drawing deferred torso:', e);
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