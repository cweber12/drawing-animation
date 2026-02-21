// utils/labelUtils.js  (or place near other canvas helpers)
export function drawAnchorLabel(ctx, text, x, y, options = {}) {
  const {
    avgTorsoHeight = 0,
    fontScale = 0.06,           // relative to torso height
    font = null,                // optional override like '14px sans-serif'
    textColor = '#fff',
    bgColor = 'rgba(0,0,0,0.6)',
    padding = 4,
    offsetX = 6,
    offsetY = -10,
  } = options;

  const fontSize = font
    ? Number.parseInt(font, 10) || 12
    : Math.max(10, Math.round((avgTorsoHeight || 16) * fontScale));
  ctx.save();
  ctx.font = `${fontSize}px sans-serif`;
  ctx.textBaseline = 'top';

  const metrics = ctx.measureText(text);
  const textW = metrics.width;
  const textH = fontSize;

  const bx = x + offsetX;
  const by = y + offsetY - textH / 2;

  // background rounded rect (simple rect here)
  ctx.fillStyle = bgColor;
  ctx.fillRect(bx - padding, by - padding, textW + padding * 2, textH + padding * 2);

  // text
  ctx.fillStyle = textColor;
  ctx.fillText(text, bx, by);

  ctx.restore();
}

export function debugAnchors(from, to, ctx, part) {
    
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    // line between original anchors (green)
    ctx.strokeStyle = 'rgba(128, 255, 0, 0.95)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();

    // original anchors (green)
    ctx.fillStyle = 'rgba(128, 255, 0, 1)';
    ctx.beginPath();
    ctx.arc(from.x, from.y, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(128, 255, 0, 1)';
    ctx.beginPath();
    ctx.arc(to.x, to.y, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    //drawAnchorLabel(ctx, part, from.x, from.y, { avgTorsoHeight: 16 });
}
