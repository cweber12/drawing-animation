import { getSvgSize } from './svgUtils';
import { CANVAS_BORDER_RADIUS, isSmallScreen } from '../constants/Sizes';

/* TODO
--------------------------------------------------------------------------------
- create scaling factor for body part width based on pose skeleton avg dist 
  between shoulders/hips and avg torso svg height

/* DRAW HEAD SVG
--------------------------------------------------------------------------------
Draw head SVG scaled and rotated between left and right ears
------------------------------------------------------------------------------*/
export function drawHeadSvg(ctx, img, leftEar, rightEar) {
    const { w: svgW, h: svgH } = getSvgSize(img);

    // Calculate the distance and angle between ears
    const dx = rightEar.x - leftEar.x;
    const dy = rightEar.y - leftEar.y;
    const angle = Math.atan2(dy, dx);

    // Midpoint between ears
    const midX = (leftEar.x + rightEar.x) / 2;
    const midY = ((leftEar.y + rightEar.y) / 2); 
    const earDist = Math.hypot(dx, dy);
    const scale = (earDist / svgW) * 2; 
    ctx.save();
    ctx.translate(midX, midY);
    ctx.rotate(angle); 
    ctx.scale(scale, scale);
    ctx.drawImage(img, -svgW / 2, -svgH / 2, svgW, svgH);
    ctx.restore();
}

/* DRAW HORIZONTAL ARMS SVG
------------------------------------------------------------------------------*/
export function drawHorizontalSegmentSvg(ctx, img, from, to, part) {
    const { w: svgW, h: svgH } = getSvgSize(img);
    
    let fromAdjusted = { ...from };
    let toAdjusted = { ...to };
    if (part === 'leftUpperArm' ) {
        fromAdjusted = {
            x: from.x, 
            y: from.y + svgW / 8,};
        toAdjusted = {x: to.x, y: to.y, };
    } else if (part === 'rightUpperArm' ) {
        fromAdjusted = {
            x: from.x,
            y: from.y + svgW / 8,};
        toAdjusted = {x: to.x,  y: to.y, };
    } else {
        fromAdjusted = { x: from.x, y: from.y,};
        toAdjusted = { x: to.x, y: to.y,};
    }

    
    const dx = toAdjusted.x - fromAdjusted.x;
    const dy = toAdjusted.y - fromAdjusted.y;
    const angle = Math.atan2(dy, dx);
    const length = Math.hypot(dx, dy);
    const scale = length / Math.max(1, svgW);

    ctx.save(); 
    ctx.translate(fromAdjusted.x, fromAdjusted.y );

    ctx.rotate(angle); // Rotate to point toward elbow/wrist
    ctx.scale(scale, scale); // Scale so SVG width matches segment length
    ctx.drawImage(img, 0, -svgH / 2, svgW, svgH); 
    ctx.restore();
}

/* DRAW VERTICAL ARMS SVG
------------------------------------------------------------------------------*/
export function drawVerticalSegmentSvg(ctx, img, from, to, part) {
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
    const scale = length / Math.max(1, svgH);
    ctx.save(); 
    ctx.translate(fromAdjusted.x, fromAdjusted.y);
    ctx.rotate(angle - Math.PI / 2); // Rotate to point toward elbow/wrist
    ctx.scale(scale, scale); // Scale so SVG height matches segment length
    ctx.drawImage(img, - svgW / 2, 0, svgW, svgH); 
    ctx.restore();
}

/* Draw left hand SVG rotated to match wrist-elbow angle
------------------------------------------------------------------------------*/
export function drawLeftHandSvg(ctx, img, wrist, elbow, armOrientation) {
    const { w: svgW, h: svgH } = getSvgSize(img);
    const dx = wrist.x - elbow.x;
    const dy = wrist.y - elbow.y;
    const angle = Math.atan2(dy, dx);
    const length = Math.hypot(dx, dy);
    let scale;
    if (armOrientation === 'horizontal') {
        scale = length / Math.max(1, svgW);
    } else {
        scale = length / Math.max(1, svgH);
    }
    ctx.save();
    ctx.translate(wrist.x, wrist.y);
    ctx.scale(scale, scale);
    if (armOrientation === 'horizontal') {
        ctx.rotate(angle); 
        ctx.drawImage(img, 0, -svgH / 2, svgW, svgH);
    } else {
        ctx.rotate(angle - Math.PI / 2);
        ctx.drawImage(img, -svgW / 2, 0, svgW, svgH);
    }
    ctx.restore();
}

/* Draw right hand SVG rotated to match wrist-elbow angle
------------------------------------------------------------------------------*/
export function drawRightHandSvg(ctx, img, wrist, elbow, armOrientation) {
    const { w: svgW, h: svgH } = getSvgSize(img);
    const dx = wrist.x - elbow.x;
    const dy = wrist.y - elbow.y;
    const angle = Math.atan2(dy, dx);
    const length = Math.hypot(dx, dy);
    let scale;
    if (armOrientation === 'horizontal') {
        scale = length / Math.max(1, svgW);
    } else {
        scale = length / Math.max(1, svgH);
    }

    ctx.save();
    ctx.translate(wrist.x , wrist.y);
    ctx.scale(scale, scale);
    if (armOrientation === 'horizontal') {
        ctx.rotate(angle + Math.PI); // Flip for right hand
        ctx.drawImage(img, -svgW, -svgH / 2, svgW, svgH);
    } else {
        ctx.rotate(angle - Math.PI / 2); // Flip for right hand
        ctx.drawImage(img, -svgW / 2, 0, svgW, svgH);
    }
    ctx.restore();
}

/* Draw leg SVG rotated to align with segment
------------------------------------------------------------------------------*/
export function drawLegSvg(ctx, img, from, to, part) {
  const { w: svgW, h: svgH } = getSvgSize(img);
  const fromOffset = {x: from.x, y: from.y - svgH / 4,};
  const toOffset = {x: to.x , y: to.y - svgH / 4 ,};
  const dx = toOffset.x - fromOffset.x;
  const dy = toOffset.y - fromOffset.y;
  const angle = Math.atan2(dy, dx);
  const length = Math.hypot(dx, dy);
  const scale = length / Math.max(1, svgH);
  ctx.save();
  ctx.translate(fromOffset.x, fromOffset.y);
  ctx.rotate(angle - Math.PI / 2); // <-- Fix: rotate so SVG height aligns with segment
  ctx.scale(scale, scale);
  if (part === 'leftUpperLeg' || part === 'leftLowerLeg') {
      ctx.drawImage(img, -svgW / 1.25, svgH / 4, svgW, svgH);
  } else if (part === 'rightUpperLeg' || part === 'rightLowerLeg') {
      ctx.drawImage(img, 0, svgH / 4, svgW, svgH);
  }
  ctx.restore();
}

/* Draw foot SVG rotated to align with segment
------------------------------------------------------------------------------*/
export function drawFootSvg(ctx, img, ankle, part) {
    const { w: svgW, h: svgH } = getSvgSize(img);
    ctx.save();
    ctx.translate(ankle.x, ankle.y);
    if (part === 'leftFoot') {
        // Align top-left corner to ankle
        ctx.drawImage(img, -svgW / 4, 0, svgW, svgH);
    } else {
        // Align top-right corner to ankle
        ctx.drawImage(img, -svgW / 1.25, 0, svgW, svgH);
    }
    ctx.restore();
}