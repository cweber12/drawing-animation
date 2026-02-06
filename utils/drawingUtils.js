// utils/drawingUtils.js
import { getSvgSize } from './svgUtils';

const ARM_SHIFT_FACTOR_X = 6; 
const ARM_SHIFT_FACTOR_Y = 6;

const LEG_SHIFT_FACTOR_X = 12;
const LEG_SHIFT_FACTOR_Y = 0;
/*==============================================================================
                                    DRAW HEAD
================================================================================
Draw head SVG scaled and rotated between left and right ears
------------------------------------------------------------------------------*/
export function drawHeadSvg(ctx, img, leftEar, rightEar, torsoDims, earDist) {
    const { w: svgW, h: svgH } = getSvgSize(img);

    // Calculate the distance and angle between ears
    const dx = rightEar.x - leftEar.x;
    const dy = rightEar.y - leftEar.y;

    // Midpoint between ears
    const midX = (leftEar.x + rightEar.x) / 2;
    const midY = ((leftEar.y + rightEar.y) / 2); 
    const avgEarDistance = earDist?.avgEarDistance;
    const avgTorsoHeight = torsoDims?.avgTorsoHeight;
    const scaleY = (avgTorsoHeight * 0.9) / Math.max(1, svgH);
    const scaleX = avgEarDistance * 2 / svgW;
    ctx.save();
    ctx.translate(midX, midY);
    ctx.scale(scaleX, scaleY );
    ctx.drawImage(img, -svgW / 2, -svgH / 2, svgW, svgH);
    ctx.restore();
}

/*==============================================================================
                                DRAW HORIZONTAL ARMS
================================================================================
Draw arm SVG rotated to match elbow-wrist angle
------------------------------------------------------------------------------*/
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
 
    // Do NOT mutate anchors
    let fx = from.x;
    let fy = from.y;
    let tx = to.x;
    let ty = to.y;

    if (part === 'leftUpperArm' || part === 'leftLowerArm') {
        fx -= avgTorsoWidth / ARM_SHIFT_FACTOR_X; 
        fy += avgTorsoHeight / ARM_SHIFT_FACTOR_Y;
        tx -= avgTorsoWidth / ARM_SHIFT_FACTOR_X;
        ty += avgTorsoHeight / ARM_SHIFT_FACTOR_Y;
    } else if (part === 'rightUpperArm' || part === 'rightLowerArm') {
        fx += avgTorsoWidth / ARM_SHIFT_FACTOR_X; 
        fy += avgTorsoHeight / ARM_SHIFT_FACTOR_Y;
        tx += avgTorsoWidth / ARM_SHIFT_FACTOR_X;
        ty += avgTorsoHeight / ARM_SHIFT_FACTOR_Y;
    }

    const dx = tx - fx;
    const dy = ty - fy;
    const angle = Math.atan2(dy, dx);
    const length = Math.hypot(dx, dy);

    // thickness should scale from svgH, not svgW
    
    const scaleX = length / Math.max(1, svgW);
    const scaleY = (avgTorsoHeight * 0.4) / Math.max(1, svgH);

    ctx.save();
    ctx.translate(fx, fy);
    
    ctx.rotate(angle);
    if (!isLeft) {
        ctx.scale(-scaleX * 1.1, -scaleY);
        ctx.drawImage(img, -svgW, -svgH / 2, svgW, svgH);
    } else {
        ctx.scale(scaleX * 1.1, scaleY);
        ctx.drawImage(img, 0, -svgH / 2, svgW, svgH);
    }

    // draw centered on thickness axis to prevent apparent "floating" seam

    ctx.restore();
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

    if (part === 'leftUpperArm' ) {
        fx -= avgTorsoWidth / ARM_SHIFT_FACTOR_X; 
        fy += avgTorsoHeight / ARM_SHIFT_FACTOR_Y;
    } else if (part === 'rightUpperArm' ) {
        fx += avgTorsoWidth / ARM_SHIFT_FACTOR_X; 
        fy += avgTorsoHeight / ARM_SHIFT_FACTOR_Y;
    }
    const dx = tx - fx;
    const dy = ty - fy;
    const angle = Math.atan2(dy, dx);
    const length = Math.hypot(dx, dy);
    const scaleLength = length / Math.max(1, svgH);
    const scaleWidth = (avgTorsoHeight * 0.85 * 0.65) / Math.max(1, svgW);
    
    ctx.save(); 
    ctx.translate(fx, fy);
    ctx.rotate(angle - Math.PI / 2); // Rotate to point toward elbow/wrist
    
    ctx.scale(scaleWidth, scaleLength); 
    ctx.drawImage(img, - svgW / 2, 0, svgW, svgH); 
    ctx.restore();
}

/*==============================================================================
                                    DRAW HAND
================================================================================
Draw hand SVG rotated to align with wrist-elbow segment
------------------------------------------------------------------------------*/
export function drawHandSvg(
    ctx,
    img,
    wrist,
    elbow,
    armsDown,
    part,
    torsoDims
) {
    const { w: svgW, h: svgH } = getSvgSize(img);
    const avgTorsoWidth = torsoDims?.avgTorsoWidth;
    const avgTorsoHeight = torsoDims?.avgTorsoHeight;
    let fx, fy, tx, ty;
    if (armsDown) {
        fx = elbow.x;
        fy = elbow.y; 
        tx = wrist.x;
        ty = wrist.y; 
    } else {
        if (part === 'leftHand') {
            fx = wrist.x - avgTorsoWidth / ARM_SHIFT_FACTOR_X;
            fy = wrist.y + avgTorsoHeight / ARM_SHIFT_FACTOR_Y; 
            tx = elbow.x - avgTorsoWidth / ARM_SHIFT_FACTOR_X;
            ty = elbow.y + avgTorsoHeight / ARM_SHIFT_FACTOR_Y; 
        } else {
            tx = elbow.x + avgTorsoWidth / ARM_SHIFT_FACTOR_X;
            ty = elbow.y + avgTorsoHeight / ARM_SHIFT_FACTOR_Y; 
            fx = wrist.x + avgTorsoWidth / ARM_SHIFT_FACTOR_X;
            fy = wrist.y + avgTorsoHeight / ARM_SHIFT_FACTOR_Y; 
        }
    }
    const dx = tx - fx;
    const dy = ty - fy;
    const angle = Math.atan2(dy, dx);


    const isRight = part === 'rightHand';

    
    const scale = (avgTorsoHeight * 0.3) / Math.max(1, svgH);

    ctx.save();
    ctx.translate(fx, fy);

    if (!armsDown) {

        ctx.rotate(angle);

        if (isRight) {
        ctx.scale(scale, scale);   // mirror around wrist
        ctx.drawImage(img, -svgW, -svgW / 2, svgW, svgH);
        } else {
        ctx.scale(-scale, -scale);
        ctx.drawImage(img, 0, -svgH / 2, svgW, svgH);
        }
    } else {
        ctx.rotate(angle - Math.PI / 2); // vertical-arm authoring

        if (isRight) {
        ctx.scale(scale, scale);   // mirror for right side
        ctx.drawImage(img, -svgW / 2, svgH, svgW, svgH);
        } else {
        ctx.scale(scale, scale);
        ctx.drawImage(img, -svgW / 2, svgH, svgW, svgH);
        }
    }

    ctx.restore();
}

/*==============================================================================
                                    DRAW LEG
================================================================================
Draw leg SVG rotated to align with segment
------------------------------------------------------------------------------*/
export function drawLegSvg(ctx, img, from, to, part, torsoDims) {
    const { w: svgW, h: svgH } = getSvgSize(img);
    const avgTorsoWidth = torsoDims?.avgTorsoWidth;
    let fromOffset = { x: from.x , y: from.y };
    let toOffset = { x: to.x, y: to.y };

    if (part === 'leftUpperLeg') {
        fromOffset.x -= avgTorsoWidth / LEG_SHIFT_FACTOR_X;
    } else if (part === 'rightUpperLeg') {
        fromOffset.x += avgTorsoWidth / LEG_SHIFT_FACTOR_X;
    }
    const dx = toOffset.x - fromOffset.x;
    const dy = toOffset.y - fromOffset.y;
    const angle = Math.atan2(dy, dx);
    const length = Math.hypot(dx, dy);
    const scaleLength = length / Math.max(1, svgH);
    const scaleWidth = (avgTorsoWidth * 0.5) / Math.max(1, svgW); 
    ctx.save();
    ctx.translate(fromOffset.x, fromOffset.y);
    ctx.rotate(angle - Math.PI / 2); // <-- Fix: rotate so SVG height aligns with segment
    ctx.scale(scaleWidth, scaleLength * 1.15); // Adjust scale to better fit leg length and width
    if (part === 'leftUpperLeg' || part === 'leftLowerLeg') {
        ctx.drawImage(img, -svgW / 1.5, 0, svgW, svgH);
    } else if (part === 'rightUpperLeg' || part === 'rightLowerLeg') {
        ctx.drawImage(img, - svgW / 2.5, 0, svgW, svgH);
    }
    ctx.restore();
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

    // Vector from foot to ankle
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const angle = Math.atan2(dy, dx);
    const length = Math.hypot(dx, dy);
    const avgTorsoHeight = torsoDims?.avgTorsoHeight;
    const scale = avgTorsoHeight * 0.45 / Math.max(1, svgH); // Scale based on foot length, with adjustment
    //const scaleY = (avgTorsoHeight * 0.3) / Math.max(1, svgH);
    

    ctx.save();
    if (part === 'rightFoot') {
        // Align left edge of SVG to foot, right edge to ankle
        ctx.translate(from.x, from.y);
        ctx.rotate(angle - Math.PI / 2); // Flip for right foot
        ctx.scale(scale, scale);
        ctx.drawImage(img, -svgW / 2, 0, svgW, svgH); // left edge at (0,0)
    } else if (part === 'leftFoot') {
        // Align left edge of SVG to ankle, right edge to foot
        ctx.translate(from.x, from.y);
        ctx.rotate(angle - Math.PI / 2);
        ctx.scale(scale, scale);
        ctx.drawImage(img, -svgW / 1.5, 0, svgW, svgH); // left edge at (0,0)
    }

    ctx.restore();
}