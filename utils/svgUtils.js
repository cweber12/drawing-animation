/* Compute affine transform from 3 source points to 3 destination points
------------------------------------------------------------------------------*/
export function affineFrom3Points(src0, src1, src2, dst0, dst1, dst2) {
  const x0 = src0.x, y0 = src0.y;
  const x1 = src1.x, y1 = src1.y;
  const x2 = src2.x, y2 = src2.y;

  const X0 = dst0.x, Y0 = dst0.y;
  const X1 = dst1.x, Y1 = dst1.y;
  const X2 = dst2.x, Y2 = dst2.y;

  const det = x0 * (y1 - y2) + x1 * (y2 - y0) + x2 * (y0 - y1);
  if (Math.abs(det) < 1e-6) return null;

  const a = (X0 * (y1 - y2) + X1 * (y2 - y0) + X2 * (y0 - y1)) / det;
  const c = (X0 * (x2 - x1) + X1 * (x0 - x2) + X2 * (x1 - x0)) / det;
  const e = (X0 * (x1 * y2 - x2 * y1) + X1 * (x2 * y0 - x0 * y2) + X2 * (x0 * y1 - x1 * y0)) / det;

  const b = (Y0 * (y1 - y2) + Y1 * (y2 - y0) + Y2 * (y0 - y1)) / det;
  const d = (Y0 * (x2 - x1) + Y1 * (x0 - x2) + Y2 * (x1 - x0)) / det;
  const f = (Y0 * (x1 * y2 - x2 * y1) + Y1 * (x2 * y0 - x0 * y2) + Y2 * (x0 * y1 - x1 * y0)) / det;

  // Canvas expects: setTransform(a, b, c, d, e, f)
  return { a, b, c, d, e, f };
}

/* SVG TO STRING IMAGE CONVERSION
------------------------------------------------------------------------------*/
export function svgStringToImage(svgString) {
  return new Promise((resolve) => {
    if (!svgString || typeof window === 'undefined') return resolve(null);

    const img = new window.Image();
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };

    img.src = url;
  });
}

/* GET SVG SIZE
------------------------------------------------------------------------------*/
export function getSvgSize(img) {
  // SVG images can report 0 width/height in some browsers; natural* is safer.
  const w = img?.naturalWidth || img?.width;
  const h = img?.naturalHeight || img?.height;
  return { w, h };
}

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
  const midY = (leftEar.y + rightEar.y) / 2;
  const earDist = Math.hypot(dx, dy);
  const scale = (earDist / svgW) * 3.0;

  ctx.save();
  ctx.translate(midX, midY);
  ctx.rotate(angle); // Ensure upright orientation
  ctx.scale(scale, scale);
  // Draw SVG so its center is at the midpoint between ears
  ctx.drawImage(img, -svgW / 2, -svgH / 2, svgW, svgH);
  ctx.restore();
}

/* DRAW ARMS SVG
------------------------------------------------------------------------------*/
export function drawHorizontalSegmentSvg(ctx, img, from, to) {
  const { w: svgW, h: svgH } = getSvgSize(img);
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const angle = Math.atan2(dy, dx);
  const length = Math.hypot(dx, dy);
  const scale = length / Math.max(1, svgW);

  ctx.save();
  ctx.translate(from.x, from.y + svgH / 2); // Move to shoulder/elbow
  ctx.rotate(angle); // Rotate to point toward elbow/wrist
  ctx.scale(scale, scale); // Scale so SVG width matches segment length
  ctx.drawImage(img, 0, -svgH / 2, svgW, svgH); // left center at from, right center at to
  ctx.restore();
}

/* Draw left hand SVG rotated to match wrist-elbow angle
------------------------------------------------------------------------------*/
export function drawLeftHandSvg(ctx, img, wrist, elbow) {
    const { w: svgW, h: svgH } = getSvgSize(img);
    const dx = wrist.x - elbow.x;
    const dy = wrist.y - elbow.y;
    const angle = Math.atan2(dy, dx);

    ctx.save();
    ctx.translate(wrist.x, wrist.y);
    ctx.rotate(angle);
    ctx.drawImage(img, 0, -svgH / 2, svgW, svgH);
    ctx.restore();
}

/* Draw right hand SVG rotated to match wrist-elbow angle
------------------------------------------------------------------------------*/
export function drawRightHandSvg(ctx, img, wrist, elbow) {
    const { w: svgW, h: svgH } = getSvgSize(img);
    const dx = wrist.x - elbow.x;
    const dy = wrist.y - elbow.y;
    const angle = Math.atan2(dy, dx);

    ctx.save();
    ctx.translate(wrist.x, wrist.y);
    ctx.rotate(angle + Math.PI);
    ctx.drawImage(img, -svgW, -svgH / 2, svgW, svgH);
    ctx.restore();
}

/* Draw leg SVG rotated to align with segment
------------------------------------------------------------------------------*/
export function drawLegSvg(ctx, img, from, to) {
  const { w: svgW, h: svgH } = getSvgSize(img);
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const angle = Math.atan2(dy, dx);
  const length = Math.hypot(dx, dy);
  const scale = length / Math.max(1, svgH);
  ctx.save();
  ctx.translate(from.x, from.y);
  ctx.rotate(angle - Math.PI / 2); // <-- Fix: rotate so SVG height aligns with segment
  ctx.scale(scale, scale);
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