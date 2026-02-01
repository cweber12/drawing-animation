// utils/anchorUtils.js
import { affineFrom3Points } from './svgUtils';
import { updateAvgTorsoHeight, updateAvgTorsoWidth } from '../constants/Sizes';

/* Utility for torso anchors 
--------------------------------------------------------------------------------
Sets the torso anchors and draws the torso SVG onto the canvas using an affine
transform to fit the svg to detected shoulder and hip positions.
------------------------------------------------------------------------------*/
export function setTorsoAnchors({
  ctx,
  img,
  svgW,
  svgH,
  scaledLandmarks,
  map,
  debugTorsoAnchors = false,
}) {
  const tl = scaledLandmarks[map.topLeft];
  const tr = scaledLandmarks[map.topRight];
  const bl = scaledLandmarks[map.bottomLeft];
  const br = scaledLandmarks[map.bottomRight];

  // Ensure all four corners are present and have sufficient score
  if (!tl || !tr || !bl || !br) return false;
  if (tl.score < 0.3 || tr.score < 0.3 || bl.score < 0.3 || br.score < 0.3) return false;

  const shoulderWidth = tr.x - tl.x;
  const offset = shoulderWidth / 2;

  updateAvgTorsoHeight(
    Math.hypot(
      (tl.x + tr.x) / 2 - (bl.x + br.x) / 2,
      (tl.y + tr.y) / 2 - (bl.y + br.y) / 2
    )
  );

  updateAvgTorsoWidth(Math.abs(tr.x - tl.x));

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
  ctx.scale(1, 1);
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

/* Utility for head anchors
--------------------------------------------------------------------------------
Sets the head anchors and draws the head SVG onto the canvas using the ear
landmarks to position and scale the head SVG.
Anchors: leftEar, rightEar
------------------------------------------------------------------------------*/
export function setHeadAnchors({
  ctx,
  img,
  scaledLandmarks,
  map,
  svgW,
  svgH,
  debugHeadAnchors = false,
  updateAvgEarDistance = () => {},
  drawHeadSvg,
}) {
  const leftEar = scaledLandmarks[map.leftAnchor];
  const rightEar = scaledLandmarks[map.rightAnchor];
  if (!leftEar || !rightEar || leftEar.score < 0.3 || rightEar.score < 0.3) return false;

  updateAvgEarDistance(
    Math.hypot(
      rightEar.x - leftEar.x,
      rightEar.y - leftEar.y
    )
  );
  drawHeadSvg(ctx, img, leftEar, rightEar);

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

/* Utility for arm anchors
--------------------------------------------------------------------------------
Sets the arm anchors and calls the appropriate function to draw the arm SVG
depending on arm orientation in the sketch canvas (arms extended for larger 
screens, arms at sides for smaller screens). 
Anchors: start, end (for vertical); leftCenter, rightCenter (for horizontal)
------------------------------------------------------------------------------*/
export function setArmAnchors({
  ctx,
  img,
  part,
  map,
  scaledLandmarks,
  svgH,
  armOrientation = 'horizontal',
  debugArmAnchors = false,
  drawVerticalSegmentSvg,
  drawHorizontalSegmentSvg,
}) {
  let from, to;
  let fromAdjusted, toAdjusted;
  if (armOrientation === 'vertical') {
    from = scaledLandmarks[map.start];
    to = scaledLandmarks[map.end];
  } else {
    from = scaledLandmarks[map.leftCenter];
    to = scaledLandmarks[map.rightCenter];
  }

  if (
    !from ||
    !to ||
    from.score < 0.3 ||
    to.score < 0.3 ||
    (from.x === to.x && from.y === to.y)
  ) return false;

  if (armOrientation === 'vertical') {
    drawVerticalSegmentSvg(ctx, img, from, to, part);
  } else {
    fromAdjusted = { x: from.x, y: from.y + svgH / 4 };
    toAdjusted = { x: to.x, y: to.y + svgH / 4 };
    drawHorizontalSegmentSvg(ctx, img, fromAdjusted, toAdjusted, part);
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
    if (!armOrientation === 'vertical') {
      ctx.fillStyle = 'red';
      ctx.beginPath();
      ctx.arc(fromAdjusted.x, fromAdjusted.y, 2, 0, 2 * Math.PI);
      ctx.fill();
      ctx.fillStyle = 'cyan';
      ctx.beginPath();
      ctx.arc(toAdjusted.x, toAdjusted.y, 2, 0, 2 * Math.PI);
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
  svgH,
  armOrientation,
  part,
  debugHandAnchors = false,
  drawHandSvg,
}) {
  const wrist = scaledLandmarks[map.wrist];
  const elbow = scaledLandmarks[map.elbow];
  if (!wrist || !elbow || wrist.score < 0.3 || elbow.score < 0.3) return false;

  const wristAdjusted = { x: wrist.x, y: wrist.y + svgH / 4 };
  const elbowAdjusted = { x: elbow.x, y: elbow.y + svgH / 4 };

  drawHandSvg(ctx, img, wristAdjusted, elbowAdjusted, armOrientation, part);

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
  debugLegAnchors = false,
  drawLegSvg,
}) {
  if (map.start === undefined || map.end === undefined) return false;
  const from = scaledLandmarks[map.start];
  const to = scaledLandmarks[map.end];
  if (!from || !to || from.score < 0.3 || to.score < 0.3) return false;

  drawLegSvg(ctx, img, from, to, part);

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
  debugFootAnchors = false,
  drawFootSvg,
}) {
  if (map.leftCenter === undefined || map.rightCenter === undefined) return false;
  const leftCenter = scaledLandmarks[map.leftCenter];
  const rightCenter = scaledLandmarks[map.rightCenter];
  if (!leftCenter || !rightCenter || leftCenter.score < 0.3 || rightCenter.score < 0.3) return false;

  let from, to;
  if (part === 'rightFoot') {
    from = rightCenter;
    to = leftCenter;
  } else {
    from = leftCenter;
    to = rightCenter;
  }

  drawFootSvg(ctx, img, from, to, part);

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