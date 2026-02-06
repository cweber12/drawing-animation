// utils/anchorUtils.js
import { affineFrom3Points } from './svgUtils';
import { updateAvgEarDistance } from '../constants/Sizes';
import {
  drawHeadSvg,
  drawHorizontalSegmentSvg,
  drawVerticalSegmentSvg,
  drawHandSvg,
  drawLegSvg,
  drawFootSvg,
} from './drawingUtils';
import { getSvgSize } from './svgUtils';

  const debugTorsoAnchors = false;
  const debugHeadAnchors = false;
  const debugArmAnchors = false;
  const debugHandAnchors = false;
  const debugLegAnchors = false;
  const debugFootAnchors = false;

/*==============================================================================
                                    TORSO 
================================================================================
Sets the torso anchors and draws the torso SVG onto the canvas using an affine
transform to fit the svg to detected shoulder and hip positions.
------------------------------------------------------------------------------*/
export function setTorsoAnchorsAndDraw({
  ctx,
  img,
  svgW,
  svgH,
  scaledLandmarks,
  map,
  torsoDimsRef,
}) {
  const torsoDims = torsoDimsRef?.current;

  const tl = scaledLandmarks[map.topLeft];
  const tr = scaledLandmarks[map.topRight];
  const bl = scaledLandmarks[map.bottomLeft];
  const br = scaledLandmarks[map.bottomRight];

  // Ensure all four corners are present and have sufficient score
  if (!tl || !tr || !bl || !br) return false;
  if (tl.score < 0.3 || tr.score < 0.3 || bl.score < 0.3 || br.score < 0.3) return false;

  const shoulderWidth = tr.x - tl.x;
  const offset = shoulderWidth / 2;
  
  torsoDims.updateAvgTorsoHeight(
    Math.hypot(
      (tl.x + tr.x) / 2 - (bl.x + br.x) / 2,
      (tl.y + tr.y) / 2 - (bl.y + br.y) / 2
    )
  );

  torsoDims.updateAvgTorsoWidth(Math.abs(tr.x - tl.x));
  torsoDims.updateAvgHipWidth(Math.abs(br.x - bl.x));

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
  ctx.scale(1, 1.1); // Slightly scale height to cover gaps
  ctx.drawImage(img, 0, 0, svgW, svgH);
  ctx.restore();

  // Draw anchor points for debugging
  if (debugTorsoAnchors) {
    ctx.save();
    ctx.fillStyle = 'lime';
    [tl, tr, bl, br, hipCenter].forEach((pt) => {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 2, 0, 2 * Math.PI);
      ctx.fill();
    });
    ctx.restore();
  }

  return true;
}

/*==============================================================================
                                        HEAD 
================================================================================
Sets the head anchors and draws the head SVG onto the canvas using the ear
landmarks to position and scale the head SVG.
Anchors: leftEar, rightEar
------------------------------------------------------------------------------*/
export function setHeadAnchors({
  ctx,
  img,
  scaledLandmarks,
  map,
  torsoDimsRef,
  earDistRef,
}) {
  const torsoDims = torsoDimsRef?.current;
  const earDist = earDistRef?.current;
  const leftEar = scaledLandmarks[map.leftAnchor];
  const rightEar = scaledLandmarks[map.rightAnchor];
  if (!leftEar || !rightEar || leftEar.score < 0.3 || rightEar.score < 0.3) return false;

  earDist.updateAvgEarDistance(
    Math.hypot(
      rightEar.x - leftEar.x,
      rightEar.y - leftEar.y
    )
  );
  
  drawHeadSvg(ctx, img, leftEar, rightEar, torsoDims, earDist);

  if (debugHeadAnchors) {
    ctx.save();
    ctx.fillStyle = 'lime';
    ctx.beginPath();
    ctx.arc(leftEar.x, leftEar.y, 2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(rightEar.x, rightEar.y, 2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();
  }
  return true;
}

/*==============================================================================
                                        ARMS 
================================================================================
Sets the arm anchors and draws the arm SVG onto the canvas.
Anchors: leftCenter, rightCenter for horizontal arms; start, end for vertical arms
------------------------------------------------------------------------------*/
export function setArmAnchors({
  ctx,
  img,
  part,
  map,
  scaledLandmarks,
  torsoDimsRef,
}) {
  const { w: svgW, h: svgH } = getSvgSize(img);
  const armsDown = svgH > svgW; 
  const torsoDims = torsoDimsRef?.current;
  let from, to;
  if (armsDown) {
    from = scaledLandmarks[map.start];
    to = scaledLandmarks[map.end];
  } else {
    if(part === 'leftUpperArm' || part === 'leftLowerArm') {
    from = scaledLandmarks[map.leftCenter];
    to = scaledLandmarks[map.rightCenter];
    } else {
    from = scaledLandmarks[map.rightCenter];
    to = scaledLandmarks[map.leftCenter];
    }
  }

  if (
    !from ||
    !to ||
    from.score < 0.3 ||
    to.score < 0.3 ||
    (from.x === to.x && from.y === to.y)
  ) return false;

  if (armsDown) {
    drawVerticalSegmentSvg(ctx, img, from, to, part, torsoDims);
  } else {
    drawHorizontalSegmentSvg(ctx, img, from, to, part, torsoDims);
  }

  if (debugArmAnchors) {
    ctx.save();
    ctx.fillStyle = 'lime';
    ctx.beginPath();
    ctx.arc(from.x, from.y, 2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(to.x, to.y, 2, 0, 2 * Math.PI);
    ctx.fill();
    if (!armsDown) {
      ctx.fillStyle = 'red';
      ctx.beginPath();
      ctx.arc(from.x, from.y, 2, 0, 2 * Math.PI);
      ctx.fill();
      ctx.fillStyle = 'cyan';
      ctx.beginPath();
      ctx.arc(to.x, to.y, 2, 0, 2 * Math.PI);
      ctx.fill();
    }
    ctx.restore();
  }
  return true;
}


/* Utility for hand anchors
--------------------------------------------------------------------------------
Sets the hand anchors and draws the hand SVG onto the canvas.
Anchors: wrist, elbow
------------------------------------------------------------------------------*/
export function setHandAnchors({
  ctx,
  img,
  scaledLandmarks,
  map,
  part,
  torsoDimsRef,
}) {
  const { w: svgW, h: svgH } = getSvgSize(img);
  const armsDown = svgH > svgW;
  const torsoDims = torsoDimsRef?.current;
  const wrist = scaledLandmarks[map.wrist];
  const elbow = scaledLandmarks[map.elbow];
  if (!wrist || !elbow || wrist.score < 0.3 || elbow.score < 0.3) return false;

  const wristAdjusted = { x: wrist.x, y: wrist.y };
  const elbowAdjusted = { x: elbow.x, y: elbow.y };

  drawHandSvg(ctx, img, wristAdjusted, elbowAdjusted, armsDown, part, torsoDims);

  if (debugHandAnchors) {
    ctx.save();
    ctx.fillStyle = 'lime';
    ctx.beginPath();
    ctx.arc(wrist.x, wrist.y, 2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(elbow.x, elbow.y, 2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillStyle = "yellow";
    ctx.beginPath();
    ctx.arc(wristAdjusted.x, wristAdjusted.y, 2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(elbowAdjusted.x, elbowAdjusted.y, 2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();
  }
  return true;
}

/* Utility for leg anchors
--------------------------------------------------------------------------------
Sets the leg anchors and draws the leg SVG onto the canvas.
Anchors: start, end
------------------------------------------------------------------------------*/
export function setLegAnchors({
  ctx,
  img,
  scaledLandmarks,
  map,
  part,
  torsoDimsRef,
}) {
  const torsoDims = torsoDimsRef?.current;
  if (map.start === undefined || map.end === undefined) return false;
  const from = scaledLandmarks[map.start];
  const to = scaledLandmarks[map.end];
  if (!from || !to || from.score < 0.3 || to.score < 0.3) return false;

  drawLegSvg(ctx, img, from, to, part, torsoDims);

  if (debugLegAnchors) {
    ctx.save();
    ctx.fillStyle = 'lime';
    ctx.beginPath();
    ctx.arc(from.x, from.y, 2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(to.x, to.y, 2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();
  }
  return true;
}

/* Utility for foot anchors
--------------------------------------------------------------------------------
Sets the foot anchors and draws the foot SVG onto the canvas.
Anchors: leftCenter, rightCenter
------------------------------------------------------------------------------*/
export function setFootAnchors({
  ctx,
  img,
  scaledLandmarks,
  map,
  part,
  torsoDimsRef,
}) {
  const torsoDims = torsoDimsRef?.current;
  if (map.start === undefined || map.end === undefined) return false;
  const start = scaledLandmarks[map.start];
  const end = scaledLandmarks[map.end];
  if (!start || !end || start.score < 0.3) return false;

  let from, to;
  if (part === 'rightFoot') {
    to = end;
    from = start;
  } else {
    to = end;
    from = start;
  }

  drawFootSvg(ctx, img, from, to, part, torsoDims);

  if (debugFootAnchors) {
    ctx.save();
    ctx.fillStyle = part === 'rightFoot' ? 'orange' : 'aqua';
    ctx.beginPath();
    ctx.arc(from.x, from.y, 2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(to.x, to.y, 2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();
  }
  return true;
}