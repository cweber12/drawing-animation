// utils/drawingUtils.js
import { getSvgSize } from './svgUtils';
import { affineFrom3Points } from './svgUtils';

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
export function drawHeadSvg(ctx, img, leftEar, rightEar, torsoDims, earDist) {
    const { w: svgW, h: svgH } = getSvgSize(img);
    const avgEarDistance = earDist?.avgEarDistance;
    const avgTorsoHeight = torsoDims?.avgTorsoHeight;
    const avgTorsoWidth = torsoDims?.avgTorsoWidth;
    
    // Calculate the distance and angle between ears
    const dx = rightEar.x - leftEar.x;
    const dy = rightEar.y - leftEar.y;

    // Midpoint between ears
    const midX = (leftEar.x + rightEar.x) / 2;
    const midY = ((leftEar.y + rightEar.y) / 2);  
    const scaleY = 
        ((avgTorsoHeight * 0.9 / Math.max(1, svgH)) +
        (avgTorsoWidth / Math.max(1, svgW))) / 2; 
    const scaleX = 
        ((avgEarDistance * 1.5 / svgW) + 
        (avgTorsoWidth / Math.max(1, svgH))) / 2; 
    ctx.save();
    ctx.translate(midX, midY);
    ctx.scale(scaleX, scaleY );
    ctx.drawImage(img, -svgW / 2, -svgH / 1.2, svgW, svgH);
    ctx.restore();
    return true;
}

/*==============================================================================
                                DRAW HORIZONTAL ARMS
================================================================================
Draw arm SVG rotated to match elbow-wrist angle
------------------------------------------------------------------------------*/
export function drawHorizontalSegmentSvg(ctx, img, from, to, part, torsoDims) {
    const { w: svgW, h: svgH } = getSvgSize(img);
    const avgTorsoHeight = torsoDims?.avgTorsoHeight;
    const avgTorsoWidth = torsoDims?.avgTorsoWidth;
    const isLeft = part === 'leftUpperArm' || part === 'leftLowerArm';
 
    let fx = from.x;
    let fy = from.y;
    let tx = to.x;
    let ty = to.y;

    const dx = tx - fx;
    const dy = ty - fy;
    const angle = Math.atan2(dy, dx);
    const length = Math.hypot(dx, dy);
    
    const scaleX = length / Math.max(1, svgW);
    const scaleY = 
        ((avgTorsoHeight * 0.35) / Math.max(1, svgH) +  
        (avgTorsoWidth * 0.45) / Math.max(1, svgW)) / 2;   

    ctx.save();
    ctx.translate(fx, fy);
    
    ctx.rotate(angle);

    if (!isLeft) {
        ctx.scale(-scaleX, -scaleY);
        ctx.drawImage(img, -svgW, -svgH / 2, svgW, svgH);
    } else {
        ctx.scale(scaleX, scaleY);    
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
export function drawVerticalSegmentSvg(ctx, img, from, to, part, torsoDims) {
    const { w: svgW, h: svgH } = getSvgSize(img);      
    const avgTorsoWidth = torsoDims?.avgTorsoWidth;
    const avgTorsoHeight = torsoDims?.avgTorsoHeight;
    const isLeft = part === 'leftUpperArm' || part === 'leftLowerArm';

    let fx = from.x;
    let fy = from.y;
    const tx = to.x;
    const ty = to.y;

    const dx = tx - fx;
    const dy = ty - fy;
    const angle = Math.atan2(dy, dx);
    const length = Math.hypot(dx, dy);

    const scaleLength = length / Math.max(1, svgH);
    const scaleWidth = 
        ((avgTorsoHeight * 0.85 * 0.65 / Math.max(1, svgW)) + 
        (avgTorsoWidth * 0.9 * 0.85 * 0.65 / Math.max(1, svgW))) / 2; 
    
    ctx.save(); 
    ctx.translate(fx, fy);
    ctx.rotate(angle - Math.PI / 2); // Rotate to point toward elbow/wrist
    
    ctx.scale(scaleWidth, scaleLength); 
    ctx.drawImage(img, - svgW / 2, 0, svgW, svgH); 
    ctx.restore();
    return true;
}

/*==============================================================================
                                    DRAW HAND
================================================================================
Draw hand SVG rotated to align with wrist-elbow segment
------------------------------------------------------------------------------*/
export function drawHandSvg(ctx, img, wrist, elbow, armsDown, part, torsoDims) {
    const { w: svgW, h: svgH } = getSvgSize(img);
    const avgTorsoWidth = torsoDims?.avgTorsoWidth;
    const avgTorsoHeight = torsoDims?.avgTorsoHeight;
    const isRight = part === 'rightHand';

    let fx = elbow.x;
    let fy = elbow.y; 
    let tx = wrist.x;
    let ty = wrist.y;
 
    const dx = tx - fx;
    const dy = ty - fy;
    const angle = Math.atan2(dy, dx);
    const length = Math.hypot(dx, dy);

    const scaleY = 
        ((avgTorsoHeight * 0.35) / Math.max(1, svgH) + 
        (avgTorsoWidth * 0.45) / Math.max(1, svgW)) / 2; 
    const scaleX = (length / Math.max(1, svgW)); 

    ctx.save();
    ctx.translate(fx, fy);

    if (!armsDown) {
        ctx.rotate(angle);
        if (isRight) {
            ctx.scale(scaleX, -scaleY);
            ctx.drawImage(img, svgW, -svgH / 2, svgW, svgH);
        } else {
            ctx.scale(scaleX, scaleY);
            ctx.drawImage(img, svgW, -svgH / 2, svgW, svgH);
        }
    } else {
        ctx.rotate(angle - Math.PI / 2); 
        if (isRight) {
            ctx.scale(-scaleX, scaleY);   
            ctx.drawImage(img, 0, 0, svgW, svgH);
        } else {
            ctx.scale(scaleX, scaleY);
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
export function drawLegSvg(ctx, img, from, to, part, torsoDims) {
    try {
        const { w: svgW, h: svgH } = getSvgSize(img);
        const avgTorsoWidth = torsoDims?.avgTorsoWidth;
        const avgHipWidth = torsoDims?.avgHipWidth;
        const avgTorsoHeight = torsoDims?.avgTorsoHeight;
        const currentHipWidth = torsoDims?.currentHipWidth;
        
        let fromOffset = { x: from.x , y: from.y };
        let toOffset = { x: to.x, y: to.y };
        const dx = toOffset.x - fromOffset.x;
        const dy = toOffset.y - fromOffset.y;
        
        const angle = Math.atan2(dy, dx);
        const length = Math.hypot(dx, dy);
        
        const scaleLength = length / Math.max(1, svgH);
        const scaleWidth = 
            ((currentHipWidth * 0.6 / Math.max(1, svgW)) + 
            (avgHipWidth * 0.6 / Math.max(1, svgW))) / 2; 
        
        ctx.save();
        ctx.translate(fromOffset.x, fromOffset.y);
        
        if (part === 'rightUpperLeg' || part === 'rightLowerLeg') {
            ctx.rotate(angle - Math.PI / 2); // vertical authoring
            ctx.scale(scaleWidth, scaleLength);
            ctx.drawImage(img, -svgW / 2, 0, svgW, svgH);
        } else {
            ctx.rotate(angle - Math.PI / 2); // vertical authoring
            ctx.scale(scaleWidth, scaleLength);
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
export function drawFootSvg(ctx, img, from, to, part, torsoDims) {
    const { w: svgW, h: svgH } = getSvgSize(img);
    const avgTorsoWidth = torsoDims?.avgTorsoWidth;
    const avgTorsoHeight = torsoDims?.avgTorsoHeight;
    
    let fx = from.x;
    let fy = from.y; 
    let tx = to.x;
    let ty = to.y;

    const dx =  tx - fx;
    const dy = ty - fy; 
    
    const angle = Math.atan2(dy, dx);
    const length = Math.hypot(dx, dy);
    
    const scaleY = 
        ((length / Math.max(1, svgH)) +  
        (avgTorsoWidth * 0.5 / Math.max(1, svgW))) / 2; 
    const scaleX = 
        ((avgTorsoHeight * 0.35 / Math.max(1, svgH)) + 
        (avgTorsoWidth * 0.45 / Math.max(1, svgW))) / 2; 

    ctx.save();
    ctx.translate(fx, fy);
    ctx.rotate(angle - Math.PI / 2); // vertical authoring

    if (part === 'leftFoot') {
        ctx.scale(scaleX, scaleY);
        ctx.drawImage(img, -svgW / 2, 0, svgW, svgH);
    } else if (part === 'rightFoot') {
        ctx.scale(scaleX, scaleY);
        ctx.drawImage(img, -svgW / 2, 0, svgW, svgH);
    }

    ctx.restore();
}