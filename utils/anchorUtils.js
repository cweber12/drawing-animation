import { affineFrom3Points } from './svgUtils';
import { updateAvgTorsoHeight, updateAvgTorsoWidth } from '../constants/Sizes';

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


