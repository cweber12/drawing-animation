import { getSvgSize } from './svgUtils';
import { CANVAS_BORDER_RADIUS, isSmallScreen } from '../constants/Sizes';
import { 
    getAvgTorsoHeight, 
    getAvgEarDistance,
    getTorsoScaleFactor,
    getCurrentHipWidth,
    getAvgHipWidth
} from '../constants/Sizes';
import { get } from 'lodash';
import { scale } from '@shopify/react-native-skia';

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
    const earDist = Math.hypot(dx, dy);

    // Midpoint between ears
    const midX = (leftEar.x + rightEar.x) / 2;
    const midY = ((leftEar.y + rightEar.y) / 2); 
    const avgTorsoHeight = getAvgTorsoHeight();
    const avgEarDistance = getAvgEarDistance();
    const scaleY = ((avgTorsoHeight * 0.85) / svgH); 
    const scaleX = avgEarDistance * 2 / svgW;
    ctx.save();
    ctx.translate(midX, midY);
    ctx.scale(scaleX, scaleY );
    ctx.drawImage(img, -svgW / 2, -svgH / 2, svgW, svgH);
    ctx.restore();
}

/* DRAW HORIZONTAL ARMS SVG
------------------------------------------------------------------------------*/
export function drawHorizontalSegmentSvg(ctx, img, from, to, part) {
    const { w: svgW, h: svgH } = getSvgSize(img);

    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const angle = Math.atan2(dy, dx);
    const length = Math.hypot(dx, dy);
    
    // Scale width based on average torso height for smoother scaling
    const avgTorsoHeight = getAvgTorsoHeight();
    const scaleWidth = (avgTorsoHeight * 0.85 * 0.65) / Math.max(1, svgW);
    const scaleLength = length / Math.max(1, svgW);

    ctx.save(); 
    ctx.translate(from.x, from.y );

    ctx.rotate(angle); // Rotate to point toward elbow/wrist
    ctx.scale(scaleLength, scaleWidth); // Scale so SVG width matches segment length
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
    const avgTorsoHeight = getAvgTorsoHeight();
    const scaleLength = length / Math.max(1, svgH);
    const scaleWidth = (avgTorsoHeight * 0.85 * 0.65) / Math.max(1, svgW);
    ctx.save(); 
    ctx.translate(fromAdjusted.x, fromAdjusted.y);
    ctx.rotate(angle - Math.PI / 2); // Rotate to point toward elbow/wrist
    ctx.scale(scaleWidth, scaleLength); // Scale so SVG height matches segment length
    ctx.drawImage(img, - svgW / 2, 0, svgW, svgH); 
    ctx.restore();
}

/* Draw right hand SVG rotated to match wrist-elbow angle
------------------------------------------------------------------------------*/
export function drawHandSvg(ctx, img, wrist, elbow, armOrientation, part) {
    const { w: svgW, h: svgH } = getSvgSize(img);

    const dx = wrist.x - elbow.x;
    const dy = wrist.y - elbow.y;
    const angle = Math.atan2(dy, dx);
    const length = Math.hypot(dx, dy);
    const avgTorsoHeight = getAvgTorsoHeight();
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

/* Draw leg SVG rotated to align with segment
------------------------------------------------------------------------------*/
export function drawLegSvg(ctx, img, from, to, part) {
  const { w: svgW, h: svgH } = getSvgSize(img);
  const fromOffset = {x: from.x, y: from.y};
  const toOffset = {x: to.x , y: to.y};
  const dx = toOffset.x - fromOffset.x;
  const dy = toOffset.y - fromOffset.y;
  const angle = Math.atan2(dy, dx);
  const length = Math.hypot(dx, dy);
  const avgTorsoHeight = getAvgTorsoHeight();
  const scaleLength = length / Math.max(1, svgH);
  const scaleWidth = (avgTorsoHeight * 0.85 * 0.5) / Math.max(1, svgW);
  ctx.save();
  ctx.translate(fromOffset.x, fromOffset.y);
  ctx.rotate(angle - Math.PI / 2); // <-- Fix: rotate so SVG height aligns with segment
  ctx.scale(scaleWidth, scaleLength);
  if (part === 'leftUpperLeg' || part === 'leftLowerLeg') {
      ctx.drawImage(img, -svgW / 2, 0, svgW, svgH);
  } else if (part === 'rightUpperLeg' || part === 'rightLowerLeg') {
      ctx.drawImage(img, -svgW / 2, 0, svgW, svgH);
  }
  ctx.restore();
}

/* Draw foot SVG rotated to align with segment
- if shoulder dx is snall and eye x < shoulder x, mirror left foot
- if shoulder dx is small and eye x > shoulder x, mirror right foot
------------------------------------------------------------------------------*/
export function drawFootSvg(ctx, img, ankle, knee, part) {
    const { w: svgW, h: svgH } = getSvgSize(img);
    const dx = ankle.x - knee.x;
    const dy = ankle.y - knee.y;
    const angle = Math.atan2(dy, dx);
    const avgTorsoHeight = getAvgTorsoHeight();
    const avgHipWidth = getAvgHipWidth();
    const currentHipWidth = getCurrentHipWidth();
    const scaleFactor = currentHipWidth / Math.abs(avgHipWidth);
    // Scaling
    let scaleX; 
    scaleX = (currentHipWidth - Math.abs(avgHipWidth) * 0.5) / Math.max(1, svgW);  
    //scaleX = (avgTorsoHeight * 0.85) / Math.max(1, svgW);
    const scaleY = (avgTorsoHeight * 0.65 * 0.5) / Math.max(1, svgH);

    ctx.save();
    ctx.translate(ankle.x, ankle.y);
    ctx.rotate(angle - Math.PI / 2); // Align with lower leg


    ctx.scale(scaleX, scaleY);

    if (part === 'leftFoot') {
        ctx.drawImage(img, -svgH / 1.5, 0, svgW, svgH); // top-left corner at ankle
    } else if (part === 'rightFoot') {
        ctx.drawImage(img, -svgW / 1.5, 0, svgW, svgH); // top-right corner at ankle
    }
    ctx.restore();
}