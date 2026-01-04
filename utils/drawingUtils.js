import { getSvgSize } from './svgUtils';
import { CANVAS_BORDER_RADIUS, isSmallScreen } from '../constants/Sizes';

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

/* DRAW ARMS SVG
------------------------------------------------------------------------------*/
export function drawHorizontalSegmentSvg(ctx, img, from, to, part) {
    const { w: svgW, h: svgH } = getSvgSize(img);
    
    let fromAdjusted, toAdjusted;
    if (part === 'leftUpperArm' || part === 'leftLowerArm' ) {
        fromAdjusted = {
            x: from.x, 
            y: from.y + svgH / 4,};
        toAdjusted = {
            x: to.x, 
            y: to.y + svgH / 4, 
        };
    } else  {
        fromAdjusted = {
            x: from.x, 
            y: from.y + svgH / 4,
        };
        toAdjusted = {
            x: to.x,  
            y: to.y + svgH / 4, 
        };
    } 
    
    const dx = toAdjusted.x - fromAdjusted.x;
    const dy = toAdjusted.y - fromAdjusted.y;
    const angle = Math.atan2(dy, dx);
    const length = Math.hypot(dx, dy);
    const scaleX = length / Math.max(1, svgW);

    ctx.save(); 
    ctx.translate(fromAdjusted.x, fromAdjusted.y);
    ctx.rotate(angle); // Rotate to point toward elbow/wrist
    ctx.scale(scaleX, 1); // Scale so SVG width matches segment length
    ctx.drawImage(img, 0, 0, svgW, svgH); 
    ctx.restore();
}

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
    const scaleY = length / Math.max(1, svgH);
    ctx.save(); 
    ctx.translate(fromAdjusted.x, fromAdjusted.y);
    ctx.rotate(angle - Math.PI / 2); // Rotate to point toward elbow/wrist
    ctx.scale(1, scaleY); // Scale so SVG height matches segment length
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

    ctx.save();
    ctx.translate(wrist.x, wrist.y);
    if (armOrientation === 'horizontal') {
        ctx.rotate(angle); // Flip for left hand
        ctx.drawImage(img, 0, 0, svgW, svgH);
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

    ctx.save();
    ctx.translate(wrist.x , wrist.y);
    if (armOrientation === 'horizontal') {
        ctx.rotate(angle + Math.PI); // Flip for right hand
        ctx.drawImage(img, -svgW, 0, svgW, svgH);
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
  ctx.scale(1, scale);
  ctx.drawImage(img, -svgW / 2, 0, svgW, svgH);
  ctx.restore();
}

/* Draw foot SVG rotated to align with segment
------------------------------------------------------------------------------*/
export function drawFootSvg(ctx, img, from, to) {
  const { w: svgW, h: svgH } = getSvgSize(img);
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const angle = Math.atan2(dy, dx);
  ctx.save();
  ctx.translate(from.x, from.y);
  ctx.rotate(angle);
  ctx.drawImage(img, -svgW / 2, 0, svgW, svgH);
  ctx.restore();
}