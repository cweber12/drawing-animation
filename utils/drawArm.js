import { affineFrom3Points } from './svgUtils';
import { getSvgSize } from '../utils/svgUtils';

function safeNormalize(dx, dy) {
    const len = Math.hypot(dx, dy) || 1;
    return { ux: dx / len, uy: dy / len };
}

// Original perpendicular anchor (keep for non-upper-arm usage)
export function createBaseExtraAnchorPerp(from, to, thicknessPx, sideSign) {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const { ux, uy } = safeNormalize(dx, dy);
    const nx = -uy;
    const ny = ux;
    const half = (thicknessPx || 1) / 2;
    return {
        x: from.x + nx * half * sideSign,
        y: from.y + ny * half * sideSign,
    };
}

export function createBaseExtraAnchorBelow(from, offsetY) {
    return {
        x: from.x,
        y: from.y + offsetY,
    };
}

/**
 * Torso-side anchor for UPPER ARMS only.
 * torsoSide: 'left' | 'right'
 */
export function createBaseExtraAnchorFromTorsoSide(from, thicknessPx, sideSign, torsoDims, torsoSide) {
    // robust fallback vector
    let vx = 1, vy = 0;

    if (torsoDims && torsoSide === 'left' && torsoDims.topLeft && torsoDims.bottomLeft) {
        vx = torsoDims.topLeft.x - torsoDims.bottomLeft.x;
        vy = torsoDims.topLeft.y - torsoDims.bottomLeft.y;
    } else if (torsoDims && torsoSide === 'right' && torsoDims.topRight && torsoDims.bottomRight) {
        vx = torsoDims.topRight.x - torsoDims.bottomRight.x;
        vy = torsoDims.topRight.y - torsoDims.bottomRight.y;
    }

    const { ux, uy } = safeNormalize(vx, vy);
    const half = (thicknessPx || 1) / 2;

    return {
        x: from.x + ux * half * sideSign,
        y: from.y + uy * half * sideSign,
    };
}

/**
 * Keep your current draw math unchanged except for how baseExtra is computed.
 * Pass useTorsoSideAnchor=true ONLY for leftUpperArm/rightUpperArm.
 */
export function drawArmSegmentSingleAnchor(
    ctx,
    img,
    from,
    to,
    sideSign = 1,
    torsoDims,
    part
) {
    if (!ctx || !img || !from || !to) return;

    const svgW = img.naturalWidth || img.width || 1;
    const svgH = img.naturalHeight || img.height || 1;

    const baseExtra = createBaseExtraAnchorPerp(from, to, Math.max(svgW, svgH) * 0.5, sideSign);
    const shiftX = svgH / 2;

    const src0 = { x: 0, y: 0 };
    const src1 = { x: 0, y: svgH};
    const src2 = { x: svgW, y: 0 };

    const dst0 = from;
    const dst1 = baseExtra;
    const dst2 = to;

    const t = affineFrom3Points(src0, src1, src2, dst0, dst1, dst2);
    if (!t) return;

    // keep your existing scale logic but guard missing torsoDims methods
    const avgTorsoHeight = torsoDims?.getAvgTorsoHeight?.() ;
    const currentTorsoWidth = torsoDims?.getCurrentTorsoWidth?.() ;
    const length = Math.hypot(to.x - from.x, to.y - from.y);

    const scaleY = 1; // default to no vertical scaling 
    ctx.save();
    ctx.setTransform(t.a, t.b, t.c, t.d, t.e, t.f);
    ctx.scale(1, -scaleY); 
    ctx.drawImage(img, 0, -svgH / 2, svgW, svgH);
    ctx.restore();

    const DEBUG_ARM_ANCHORS = false;

    if (DEBUG_ARM_ANCHORS) {
    // draw in screen space (not transformed space)
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    // line between original anchors (green)
    ctx.strokeStyle = 'rgba(0, 200, 0, 0.95)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();

    // line from base original to new anchor (red)
    ctx.strokeStyle = 'rgba(220, 0, 0, 0.95)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(baseExtra.x, baseExtra.y);
    ctx.stroke();

    // original anchors (green)
    ctx.fillStyle = 'rgba(0, 220, 0, 1)';
    ctx.beginPath();
    ctx.arc(from.x, from.y, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(to.x, to.y, 4, 0, Math.PI * 2);
    ctx.fill();

    // new anchor (red)
    ctx.fillStyle = 'rgba(240, 0, 0, 1)';
    ctx.beginPath();
    ctx.arc(baseExtra.x, baseExtra.y, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
    }
}