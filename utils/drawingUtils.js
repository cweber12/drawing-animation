// utils/drawingUtils.js
import { getSvgSize } from './svgUtils';
import { affineFrom3Points } from './svgUtils';
import { useScaleFactors } from '../context/ScaleFactorsContext';

/*==============================================================================
                                    DRAW TORSO
================================================================================
Draw torso SVG using affine transform to fit between shoulder and hip anchors
==============================================================================*/
export function drawTorsoSvg(ctx, img, tl, tr, bl, br) {
    const { w: svgW, h: svgH } = getSvgSize(img);
    const shoulderWidth = tr.x - tl.x;
    const offset = shoulderWidth / 2;
    // Calculate hip center and shoulder width
    const hipCenter = {
        x: (bl.x + br.x) / 2,
        y: (bl.y + br.y) / 2,
    };

    // Use the offset to define the third point (left side shown)
    const thirdPoint = {
        x: hipCenter.x - offset,
        y: hipCenter.y,
    };

    // Use thirdPoint in the affine transform
    const M = affineFrom3Points(
        { x: 0, y: 0 },
        { x: svgW, y: 0 },
        { x: 0, y: svgH },
        { x: tl.x, y: tl.y },
        { x: tr.x, y: tr.y },
        thirdPoint
    );

    if (!M) return false;

    ctx.save();
    ctx.setTransform(M.a, M.b, M.c, M.d, M.e, M.f);
    ctx.scale(1, 1.2); // Slightly scale height to cover gaps
    ctx.drawImage(img, 0, -svgH * 0.2, svgW, svgH);
    ctx.restore();
    return true;
}

/*==============================================================================
                                    DRAW HEAD
================================================================================
Draw head SVG scaled and rotated between left and right ears
------------------------------------------------------------------------------*/
export function drawHeadSvg(
    ctx, img, leftEar, rightEar, torsoDims, earDist, headScaleFactors
) {
    const { w: svgW, h: svgH } = getSvgSize(img);
    const avgEarDistance = earDist?.avgEarDistance;
    const avgTorsoHeight = Math.abs(torsoDims?.avgTorsoHeight);
    const avgTorsoWidth = Math.abs(torsoDims?.avgTorsoWidth);
    const torsoSvgW = torsoDims?.torsoSvgWidth;
    const torsoSvgH = torsoDims?.torsoSvgHeight;

    // Midpoint between ears
    const midX = (leftEar.x + rightEar.x) / 2;
    const midY = ((leftEar.y + rightEar.y) / 2); 
    const scaleX = avgTorsoWidth * 0.5 / Math.max(1, torsoSvgW);  
    const scaleY = avgTorsoHeight * 0.5 / Math.max(1, torsoSvgH);
    ctx.save();
    ctx.translate(midX, midY);
    ctx.scale(
        scaleX * headScaleFactors.x, 
        scaleY * headScaleFactors.y
    );
    ctx.drawImage(img, -svgW / 2, -svgH / 1.2, svgW, svgH);
    ctx.restore();
    return true;
}

/*==============================================================================
                                DRAW HORIZONTAL ARMS
================================================================================
Draw arm SVG rotated to match elbow-wrist angle
***** TODO ******
IMPLEMENT AFFINE TRANSFORM FOR ARMS
------------------------------------------------------------------------------*/
export function drawHorizontalSegmentSvg(
    ctx, img, from, to, part, torsoDims, armScaleFactors
) {
    const { w: svgW, h: svgH } = getSvgSize(img);
    const avgTorsoHeight = Math.abs(torsoDims?.avgTorsoHeight);
    const avgTorsoWidth = Math.abs(torsoDims?.avgTorsoWidth);
    const torsoSvgW = torsoDims?.torsoSvgWidth;
    const torsoSvgH = torsoDims?.torsoSvgHeight;
    const isLeft = part === 'leftUpperArm' || part === 'leftLowerArm';

    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const angle = Math.atan2(dy, dx);
    const length = Math.hypot(dx, dy);
    
    const scaleX = length / Math.max(1, svgW);
    const scaleY = (avgTorsoHeight * 0.5 / Math.max(1, torsoSvgH) + 
                    (avgTorsoWidth * 0.5 / Math.max(1, torsoSvgW))) / 2; 
        

    ctx.save();
    ctx.translate(from.x, from.y);
    
    ctx.rotate(angle);

    if (!isLeft) {
        ctx.scale(
            -scaleX * armScaleFactors.x, 
            -scaleY * armScaleFactors.y);
        ctx.drawImage(img, -svgW, -svgH / 2, svgW, svgH);
    } else {
        ctx.scale(
            scaleX * armScaleFactors.x, 
            scaleY * armScaleFactors.y);    
        ctx.drawImage(img, 0, -svgH / 2, svgW, svgH);

    }
    ctx.restore();
    return true;
}

/*==============================================================================
                                DRAW VERTICAL ARMS
================================================================================
Draw arm SVG rotated to match elbow-wrist angle
------------------------------------------------------------------------------*/
export function drawVerticalSegmentSvg(
    ctx, img, from, to, part, torsoDims, legScaleFactors
) {
    const { w: svgW, h: svgH } = getSvgSize(img);      
    const avgTorsoWidth = Math.abs(torsoDims?.avgTorsoWidth);
    const torsoSvgW = torsoDims?.torsoSvgWidth;

    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const angle = Math.atan2(dy, dx);
    const length = Math.hypot(dx, dy);

    const scaleY = length / Math.max(1, svgH);
    const scaleX = avgTorsoWidth * 0.5 / Math.max(1, torsoSvgW);
      
    ctx.save(); 
    ctx.translate(from.x, from.y);
    ctx.rotate(angle - Math.PI / 2); // Rotate to point toward elbow/wrist
    
    ctx.scale(
        scaleX * legScaleFactors.x, 
        scaleY * legScaleFactors.y); 
    ctx.drawImage(img, - svgW / 2, 0, svgW, svgH); 
    ctx.restore();
    return true;
}

/*==============================================================================
                                    DRAW HAND
================================================================================
Draw hand SVG rotated to align with wrist-elbow segment
------------------------------------------------------------------------------*/
export function drawHandSvg(
    ctx, img, wrist, elbow, armsDown, part, torsoDims, handScaleFactors
) {
    const { w: svgW, h: svgH } = getSvgSize(img);
    const avgTorsoWidth = Math.abs(torsoDims?.avgTorsoWidth);
    const avgTorsoHeight = Math.abs(torsoDims?.avgTorsoHeight);
    const torsoSvgW = torsoDims?.torsoSvgWidth;
    const torsoSvgH = torsoDims?.torsoSvgHeight;
    const isRight = part === 'rightHand';
 
    const dx = elbow.x - wrist.x;
    const dy = elbow.y - wrist.y;
    const angle = Math.atan2(dy, dx);
    const length = Math.hypot(dx, dy);

    const scale = (avgTorsoHeight * 0.5 / Math.max(1, torsoSvgH) + 
                    (avgTorsoWidth * 0.5 / Math.max(1, torsoSvgW))) / 2;
    
    ctx.save();
    ctx.translate(wrist.x, wrist.y);

    if (!armsDown) {
        ctx.rotate(angle);
        if (isRight) {
            ctx.scale(
                scale * handScaleFactors.x, 
                scale * handScaleFactors.y);
            ctx.drawImage(img, -svgW, -svgH / 2, svgW, svgH);
        } else {
            ctx.scale(
                -scale * handScaleFactors.x, 
                -scale * handScaleFactors.y);
            ctx.drawImage(img, 0, -svgH / 2, svgW, svgH);
        }
    } else {
        ctx.rotate(angle - Math.PI / 2); 
        if (isRight) {
            ctx.scale(
                -scale * handScaleFactors.x, 
                scale * handScaleFactors.y);
            ctx.drawImage(img, 0, 0, svgW, svgH);
        } else {
            ctx.scale(
                scale * handScaleFactors.x, 
                scale * handScaleFactors.y);
            ctx.drawImage(img, -svgW, 0, svgW, svgH);
        }
    }
    ctx.restore();
    return true;
}

/*==============================================================================
                                    DRAW LEG
================================================================================
Draw leg SVG rotated to align with segment
------------------------------------------------------------------------------*/
export function drawLegSvg(
    ctx, img, from, to, part, torsoDims, legScaleFactors
) {
    try {
        const { w: svgW, h: svgH } = getSvgSize(img);
        const avgTorsoWidth = Math.abs(torsoDims?.avgTorsoWidth);
        const avgTorsoHeight = Math.abs(torsoDims?.avgTorsoHeight);
        const torsoSvgH = torsoDims?.torsoSvgHeight;
        const torsoSvgW = torsoDims?.torsoSvgWidth;
        
        let fx = from.x;
        let fy = from.y; 
        let tx = to.x;
        let ty = to.y; 

        const dx = tx - fx;
        const dy = ty - fy;
        
        const angle = Math.atan2(dy, dx);
        const length = Math.hypot(dx, dy);
        
        const scaleY = length / Math.max(1, svgH);
        const scaleX = (avgTorsoHeight * 0.5 / Math.max(1, torsoSvgH) + 
                    (avgTorsoWidth * 0.5 / Math.max(1, torsoSvgW))) / 2;
           
        
        ctx.save();
        ctx.translate(fx, fy);
        
        if (part === 'rightUpperLeg' || part === 'rightLowerLeg') {
            ctx.rotate(angle - Math.PI / 2); // vertical authoring
            ctx.scale(
                scaleX * legScaleFactors.x, 
                scaleY * legScaleFactors.y);
            ctx.drawImage(img, -svgW / 2, 0, svgW, svgH);
        } else {
            ctx.rotate(angle - Math.PI / 2); // vertical authoring
            ctx.scale(
                scaleX * legScaleFactors.x, 
                scaleY * legScaleFactors.y);
            ctx.drawImage(img, -svgW / 2, 0, svgW, svgH);
        }
        ctx.restore();
        return true;
    } catch (error) {
        console.log('Error drawing leg:', error);
        return false;
    }
}
/*==============================================================================
                                    DRAW FOOT
================================================================================
Draw foot SVG rotated to align with ankle-foot segment
- Foot coordinates calculated with FootCalculator utility, not provided by
  pose detection model
------------------------------------------------------------------------------*/
export function drawFootSvg(
    ctx, img, from, to, part, torsoDims, footScaleFactors
) {
    const { w: svgW, h: svgH } = getSvgSize(img);
    const avgTorsoWidth = Math.abs(torsoDims?.avgTorsoWidth);
    const avgTorsoHeight = Math.abs(torsoDims?.avgTorsoHeight);
    const torsoSvgW = torsoDims?.torsoSvgWidth;
    const torsoSvgH = torsoDims?.torsoSvgHeight;
    
    let fx = from.x;
    let fy = from.y; 
    let tx = to.x;
    let ty = to.y;

    const dx =  tx - fx;
    const dy = ty - fy; 
    
    const angle = Math.atan2(dy, dx);
    const length = Math.hypot(dx, dy);
    
    const scaleY = avgTorsoHeight * 0.5 / Math.max(1, torsoSvgH);
    const scaleX = avgTorsoWidth * 0.5 / Math.max(1, torsoSvgW);

    ctx.save();
    ctx.translate(fx, fy);
    ctx.rotate(angle - Math.PI / 2); // vertical authoring

    if (part === 'leftFoot') {
        ctx.scale(
            scaleX * footScaleFactors.x, 
            scaleY * footScaleFactors.y);
        ctx.drawImage(img, -svgW / 2, 0, svgW, svgH);
    } else if (part === 'rightFoot') {
        ctx.scale(
            scaleX * footScaleFactors.x, 
            scaleY * footScaleFactors.y);
        ctx.drawImage(img, -svgW / 2, 0, svgW, svgH);
    }

    ctx.restore();
}