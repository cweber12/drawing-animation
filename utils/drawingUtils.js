// utils/drawingUtils.js
import { getSvgSize } from './svgUtils';
import { 
    getAvgTorsoHeight, 
    getAvgEarDistance,
} from '../constants/Sizes';

/*==============================================================================
                                    DRAW HEAD
================================================================================
Draw head SVG scaled and rotated between left and right ears
------------------------------------------------------------------------------*/
export function drawHeadSvg(ctx, img, leftEar, rightEar, torsoDims) {
    const { w: svgW, h: svgH } = getSvgSize(img);

    // Calculate the distance and angle between ears
    const dx = rightEar.x - leftEar.x;
    const dy = rightEar.y - leftEar.y;

    // Midpoint between ears
    const midX = (leftEar.x + rightEar.x) / 2;
    const midY = ((leftEar.y + rightEar.y) / 2); 
    const avgTorsoHeight = torsoDims?.avgTorsoHeight;
    const avgEarDistance = getAvgEarDistance();
    const scaleY = ((avgTorsoHeight * 0.85) / svgH); 
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
export function drawHorizontalSegmentSvg(ctx, img, from, to, part, torsoDims) {
    const { w: svgW, h: svgH } = getSvgSize(img);

    if (part === 'leftUpperArm') {
        from.x -= svgW / 10;

    } else if (part === 'rightUpperArm') {
        to.x += svgW / 10;
    }
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const angle = Math.atan2(dy, dx);
    const length = Math.hypot(dx, dy);
    
    // Scale width based on average torso height for smoother scaling
    const avgTorsoHeight = torsoDims?.avgTorsoHeight;
    const scaleWidth = (avgTorsoHeight * 0.85 * 0.65) / Math.max(1, svgW);
    const scaleLength = length / Math.max(1, svgW);

    ctx.save(); 
    ctx.translate(from.x, from.y );

    ctx.rotate(angle); // Rotate to point toward elbow/wrist
    ctx.scale(scaleLength, scaleWidth); // Scale so SVG width matches segment length
    ctx.drawImage(img, 0, -svgH / 2, svgW, svgH); 
    ctx.restore();
}

/*==============================================================================
                                DRAW VERTICAL ARMS
================================================================================
Draw arm SVG rotated to match elbow-wrist angle
------------------------------------------------------------------------------*/
export function drawVerticalSegmentSvg(ctx, img, from, to, part, torsoDims) {
    const { w: svgW, h: svgH } = getSvgSize(img);
    
    let fromAdjusted, toAdjusted;
    if (part === 'leftUpperArm' ) {
        fromAdjusted = {
            x: from.x - svgW / 4, 
            y: from.y + svgW / 4,};
        toAdjusted = {x: to.x, y: to.y, };
    } else if (part === 'rightUpperArm' ) {
        fromAdjusted = {
            x: from.x + svgW / 4, 
            y: from.y + svgW / 4,};
        toAdjusted = {x: to.x,  y: to.y, };
    } else {
        fromAdjusted = { x: from.x, y: from.y,};
        toAdjusted = { x: to.x, y: to.y,};
    }
    
    const dx = toAdjusted.x - fromAdjusted.x;
    const dy = toAdjusted.y - fromAdjusted.y; // Adjust for canvas border radius
    const angle = Math.atan2(dy, dx);
    const length = Math.hypot(dx, dy);
    const avgTorsoHeight = torsoDims?.avgTorsoHeight;
    const scaleLength = length / Math.max(1, svgH);
    const scaleWidth = (avgTorsoHeight * 0.85 * 0.65) / Math.max(1, svgW);
    ctx.save(); 
    ctx.translate(fromAdjusted.x, fromAdjusted.y);
    ctx.rotate(angle - Math.PI / 2); // Rotate to point toward elbow/wrist
    ctx.scale(scaleWidth, scaleLength); // Scale so SVG height matches segment length
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
    armOrientation, 
    part, 
    torsoDims
) {
    const { w: svgW, h: svgH } = getSvgSize(img);

    const dx = wrist.x - elbow.x;
    const dy = wrist.y - elbow.y;
    const angle = Math.atan2(dy, dx);
    const length = Math.hypot(dx, dy);
    const avgTorsoHeight = torsoDims?.avgTorsoHeight;
    const scaleLength = length / Math.max(1, svgW);
    const scaleWidth =  (avgTorsoHeight * 0.85 * 0.5) / Math.max(1, svgH);

    ctx.save();
    ctx.translate(wrist.x , wrist.y);
    if (armOrientation === 'horizontal') {
        ctx.scale(scaleLength, scaleWidth);
        if (part === 'rightHand') {
        ctx.rotate(angle + Math.PI); // Flip for right hand
        ctx.drawImage(img, -svgW, -svgH / 2, svgW, svgH);
        } else {
        ctx.rotate(angle);
        ctx.drawImage(img, 0, -svgH / 2, svgW, svgH);
        }
    } else {
        ctx.scale(scaleWidth, scaleLength);
        ctx.rotate(angle - Math.PI / 2); // Flip for right hand
        ctx.drawImage(img, -svgW / 2, 0, svgW, svgH);
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
  const fromOffset = {x: from.x, y: from.y};
  const toOffset = {x: to.x , y: to.y};
  const dx = toOffset.x - fromOffset.x;
  const dy = toOffset.y - fromOffset.y;
  const angle = Math.atan2(dy, dx);
  const length = Math.hypot(dx, dy);
  const avgTorsoWidth = torsoDims?.avgTorsoWidth;
  const scaleLength = length / Math.max(1, svgH);
  const scaleWidth = (avgTorsoWidth * 0.5) / Math.max(1, svgW);
  ctx.save();
  ctx.translate(fromOffset.x, fromOffset.y);
  ctx.rotate(angle - Math.PI / 2); // <-- Fix: rotate so SVG height aligns with segment
  ctx.scale(scaleWidth, scaleLength);
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
    let scaleFactor = 1.0;
    
    const scale = (length / svgH);
    const avgTorsoHeight = torsoDims?.avgTorsoHeight;
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
        ctx.drawImage(img, -svgW / 2, 0, svgW, svgH); // left edge at (0,0)
    }

    ctx.restore();
}