// utils/drawingUtils.js
import { getSvgSize } from './svgUtils';

const ARM_SHIFT_FACTOR_X = 6; 
const ARM_SHIFT_FACTOR_Y = 6;

const LEG_SHIFT_FACTOR_X = 12;
const LEG_SHIFT_FACTOR_Y = 12;
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
    const scaleY = Math.max(
        (avgTorsoHeight * 0.9) / Math.max(1, svgH), 
        (avgEarDistance * 2) / Math.max(1, svgW)
    );
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

    if (isLeft) {
        fx -= avgTorsoWidth / ARM_SHIFT_FACTOR_X; 
        fy += avgTorsoHeight / ARM_SHIFT_FACTOR_Y;
        tx -= avgTorsoWidth / ARM_SHIFT_FACTOR_X;
        ty += avgTorsoHeight / ARM_SHIFT_FACTOR_Y;
    } else {
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
    const scaleY = Math.max(
        (avgTorsoHeight * 0.45) / Math.max(1, svgH), 
        (avgTorsoWidth * 0.5) / Math.max(1, svgW), 
    ); 

    ctx.save();
    ctx.translate(fx, fy);
    
    ctx.rotate(angle);

    if (!isLeft) {
        if (ty > fy) {
            ctx.scale(-scaleX * 1.2, -scaleY);
        }else {
            ctx.scale(-scaleX * 1.2, scaleY);
        }
        ctx.drawImage(img, -svgW, -svgH / 2, svgW, svgH);
    } else {

        if (ty > fy) {
            ctx.scale(scaleX * 1.2, scaleY);
        } else {
            ctx.scale(scaleX * 1.2, scaleY);
        }
      
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

    const scale = Math.max(
        (avgTorsoHeight * 0.4) / Math.max(1, svgH), 
        (avgTorsoWidth * 0.5) / Math.max(1, svgW)
    );

    ctx.save();
    ctx.translate(fx, fy);

    if (!armsDown) {

        ctx.rotate(angle);

        if (isRight) {
        ctx.scale(scale, -scale);   // mirror around wrist
        ctx.drawImage(img, -svgW, -svgW / 2, svgW, svgH);
        } else {
        ctx.scale(-scale, scale);
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
    const avgTorsoHeight = torsoDims?.avgTorsoHeight;
    let fromOffset = { x: from.x , y: from.y };
    let toOffset = { x: to.x, y: to.y };

    if (part === 'leftUpperLeg' || part === 'leftLowerLeg') {
        fromOffset.x -= avgTorsoWidth / LEG_SHIFT_FACTOR_X;
        toOffset.x -= avgTorsoWidth / LEG_SHIFT_FACTOR_X;
        fromOffset.y -= avgTorsoHeight / LEG_SHIFT_FACTOR_Y;
        toOffset.y -= avgTorsoHeight / LEG_SHIFT_FACTOR_Y;
    } else if (part === 'rightUpperLeg' || part === 'rightLowerLeg') {
        fromOffset.x += avgTorsoWidth / LEG_SHIFT_FACTOR_X;
        toOffset.x += avgTorsoWidth / LEG_SHIFT_FACTOR_X;
        fromOffset.y -= avgTorsoHeight / LEG_SHIFT_FACTOR_Y;
        toOffset.y -= avgTorsoHeight / LEG_SHIFT_FACTOR_Y;
    }

    const dx = toOffset.x - fromOffset.x;
    const dy = toOffset.y - fromOffset.y;
    const angle = Math.atan2(dy, dx);
    const length = Math.hypot(dx, dy);
    const scaleLength = length / Math.max(1, svgH);
    const scaleWidth = (avgTorsoWidth * 0.5) / Math.max(1, svgW); 
    ctx.save();
    ctx.translate(fromOffset.x, fromOffset.y);
    if (part === 'rightUpperLeg' || part === 'rightLowerLeg') {
        ctx.rotate(angle - Math.PI / 2); // Rotate to point toward knee/ankle
    } else {
        ctx.rotate(angle - Math.PI / 2);
    }
    if (part === 'rightUpperLeg' || part === 'leftUpperLeg') {
        ctx.scale(scaleWidth, scaleLength * 1.2);
    } else {
        ctx.scale(scaleWidth, scaleLength);
    }
    if (part === 'leftUpperLeg' || part === 'leftLowerLeg') {
        ctx.drawImage(img, -svgW / 2, 0, svgW, svgH);
    } else if (part === 'rightUpperLeg' || part === 'rightLowerLeg') {
        ctx.drawImage(img, -svgW / 2, 0, svgW, svgH);
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
    const avgTorsoWidth = torsoDims?.avgTorsoWidth;
    const avgTorsoHeight = torsoDims?.avgTorsoHeight;
    let fromOffset = { x: from.x, y: from.y };
    let toOffset = { x: to.x, y: to.y };

    if (part === 'leftFoot') {
        fromOffset.x -= avgTorsoWidth / LEG_SHIFT_FACTOR_X;
        toOffset.x -= avgTorsoWidth / LEG_SHIFT_FACTOR_X;
        fromOffset.y -= avgTorsoHeight / LEG_SHIFT_FACTOR_Y;
        toOffset.y -= avgTorsoHeight / LEG_SHIFT_FACTOR_Y;
    } else if (part === 'rightFoot') {
        fromOffset.x += avgTorsoWidth / LEG_SHIFT_FACTOR_X;
        toOffset.x += avgTorsoWidth / LEG_SHIFT_FACTOR_X;
        fromOffset.y -= avgTorsoHeight / LEG_SHIFT_FACTOR_Y;
        toOffset.y -= avgTorsoHeight / LEG_SHIFT_FACTOR_Y;
    }
    // Vector from foot to ankle
    const dx =  toOffset.x - fromOffset.x;
    const dy = toOffset.y - fromOffset.y;
    const angle = Math.atan2(dy, dx);
    const length = Math.hypot(dx, dy);
    const scaleY = Math.max(
        avgTorsoHeight * 0.45 / Math.max(1, svgH), 
        avgTorsoWidth * 0.5 / Math.max(1, svgW)
    );
    const scaleX = (avgTorsoWidth * 0.45) / Math.max(1, svgW); 

    ctx.save();
    // translate to the shifted from position so offsets actually affect placement
    ctx.translate(fromOffset.x, fromOffset.y);
    ctx.rotate(angle - Math.PI / 2);
    if (part === 'leftFoot') {
        ctx.scale(scaleX, scaleY);
        ctx.drawImage(img, -svgW / 2, -svgW / 4, svgW, svgH);
    } else if (part === 'rightFoot') {
        ctx.scale(scaleX, scaleY);
        ctx.drawImage(img, -svgW / 2, -svgW / 4, svgW, svgH);
    }

    ctx.restore();
}