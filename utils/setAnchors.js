// utils/setAnchors.js

/*==============================================================================
                                SET ANCHORS
================================================================================
Functions to set anchors for each body part based on detected landmarks and
calculated average dimensions. Each function takes in the relevant landmarks,
average torso width and height, and shift factors to adjust anchor positions.
--------------------------------------------------------------------------------
scaledLandmarks: Landmarks scaled to the canvas size (for anchors)
map:             Mapping of body parts to landmark indices (anchors)
avgTorsoWidth:   Smoothed average of shoulder width (tl.x - tr.x)
avgTorsoHeight:  Smoothed average of torso height (shoulder -> hip hypot)
shiftFactorsRef: Shift anchors based on factors updated in UI.

********************************************************************************
NOTE: avgTorsoWidth and avgTorsoHeight are applied to shift and scale amounts 
      for uniform shifting/scaling as the person rotates or moves closer/further 
      from the camera. 
******************************************************************************** 
--------------------------------------------------------------------------------*/

/* Torso
------------------------------------------------------------------------------*/
export function setTorsoAnchors(
    part, 
    scaledLandmarks, 
    avgTorsoWidth, 
    avgTorsoHeight, 
    torsoDims, 
    map, 
    shiftFactorsRef, 
    debugPipeline
) {
    try {
        const tl = scaledLandmarks[map.topLeft];
        const tr = scaledLandmarks[map.topRight];
        const bl = scaledLandmarks[map.bottomLeft];
        const br = scaledLandmarks[map.bottomRight];
    
        if (!tl || !tr || !bl || !br) return;
        if (tl.score < 0.3 || tr.score < 0.3 || bl.score < 0.3 || br.score < 0.3) return;
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

        return {
            tl: tlAdjusted,
            tr: trAdjusted,
            bl: blAdjusted,
            br: brAdjusted,
        };

    } catch (e) {
        console.warn('Error processing torso anchors:', e);
    }
}

/* Head
------------------------------------------------------------------------------*/
export function setHeadAnchors(
    scaledLandmarks, 
    map, 
    avgTorsoWidth, 
    avgTorsoHeight, 
    earDist, 
    shiftFactorsRef
) {
    try {
        const leftEar = scaledLandmarks[map.leftAnchor];
        const rightEar = scaledLandmarks[map.rightAnchor];
        
        if (!leftEar || !rightEar || leftEar.score < 0.3 ||
        rightEar.score < 0.3) { return };
        
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
        
        return {
            leftAnchor: leftEarAdjusted,
            rightAnchor: rightEarAdjusted,
        };
        } catch (e) {
          console.warn('Error processing head anchors:', e);
        }
    }

/* Arms
------------------------------------------------------------------------------*/
export function setArmAnchors( 
    part, 
    scaledLandmarks, 
    map, 
    avgTorsoWidth, 
    avgTorsoHeight, 
    shiftFactorsRef, 
    debugPipeline 
) {
    try {
        const from = scaledLandmarks[map.start];
        const to = scaledLandmarks[map.end];
        if (!from || !to) return;
        
        if (debugPipeline) console.log('VALID ANCHORS: ', part);

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
        return { from: fromAdjusted, to: toAdjusted };
    } catch (e) {
        console.warn('Error processing arm anchors:', e);
    }
}

/* Hands
------------------------------------------------------------------------------*/
export function setHandAnchors(
    part, 
    scaledLandmarks,
    map,
    avgTorsoWidth,
    avgTorsoHeight,
    shiftFactorsRef,
    img
) {
    try {
        const from = scaledLandmarks[map.start];
        const to = scaledLandmarks[map.end];
        if (!from || !to) return;
        if (!to || !from || to.score < 0.3 || from.score < 0.3) return;

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
        return { from: fromAdjusted, to: toAdjusted };
    } catch (e) {
        console.warn('Error processing hand anchors:', e);
    }
}


/* Legs
------------------------------------------------------------------------------*/
export function setLegAnchors(
    part, 
    scaledLandmarks,
    map,
    avgTorsoWidth,
    avgTorsoHeight,
    shiftFactorsRef,

) {
    try {
        
        const from = scaledLandmarks[map.start];
        const to = scaledLandmarks[map.end];
        
        if (!from || !to) return;
        if (!to || !from || to.score < 0.3 || from.score < 0.3) return;

        let fromAdjusted = from; 
        let toAdjusted = to; 
        
        if (part === 'rightUpperLeg' || part === 'rightUpperLegBack') {
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
        } else if (part === 'leftUpperLeg' || part === 'leftUpperLegBack') {
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
        } else if (part === 'rightLowerLeg' || part === 'rightLowerLegBack') {
            fromAdjusted = {
                x: from.x + (shiftFactorsRef.current.kneeShift.x * (avgTorsoWidth * 0.1)),
                y: from.y + (shiftFactorsRef.current.kneeShift.y * (avgTorsoHeight * 0.1)),
            };
            toAdjusted = {
                x: to.x + (shiftFactorsRef.current.ankleShift.x * (avgTorsoWidth * 0.1)),
                y: to.y + (shiftFactorsRef.current.ankleShift.y * (avgTorsoHeight * 0.1)),
            };
        } else if (part === 'leftLowerLeg' || part === 'leftLowerLegBack') {
            fromAdjusted = {
                x: from.x - (shiftFactorsRef.current.kneeShift.x * (avgTorsoWidth * 0.1)),
                y: from.y + (shiftFactorsRef.current.kneeShift.y * (avgTorsoHeight * 0.1)),
            };
            toAdjusted = {
                x: to.x - (shiftFactorsRef.current.ankleShift.x * (avgTorsoWidth * 0.1)),
                y: to.y + (shiftFactorsRef.current.ankleShift.y * (avgTorsoHeight * 0.1)),
            };
        }
        return { from: fromAdjusted, to: toAdjusted };
    } catch (e) {
        console.warn('Error processing leg anchors:', e);
    }
}

/* Feet
------------------------------------------------------------------------------*/
export function setFootAnchors(
    part, 
    scaledLandmarks,
    map,
    avgTorsoWidth,
    avgTorsoHeight,
    shiftFactorsRef,
) {
    try {
        const from = scaledLandmarks[map.start];
        const to = scaledLandmarks[map.end];
        if (!from || !to || from.score < 0.3) return;

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
        return { from: fromAdjusted, to: toAdjusted };
    } catch (e) {
        console.warn('Error processing foot anchors:', e);
    }
}