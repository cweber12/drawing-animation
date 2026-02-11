import { CANVAS_BORDER_RADIUS, isSmallScreen } from '../constants/Sizes';


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
    if (!svgString || typeof window === 'undefined') return Promise.resolve(null);
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

/* Add SVG Clip Path for Rounded Corners
------------------------------------------------------------------------------*/
export function addSvgClipPath(svgString, width, height, radius, topLeft, topRight, bottomRight, bottomLeft) {
  if (typeof svgString !== 'string') return svgString;

  // Helper to decide arc or straight for each corner
  function moveToOrArc(x, y, corner) {
    return corner
      ? `A ${radius} ${radius} 0 0 1 ${x} ${y}`
      : `L ${x} ${y}`;
  }

  // Build path string for custom corners
  let d = `M ${topLeft ? radius : 0},0 `; // Start at top-left
  d += `H ${width - (topRight ? radius : 0)} `;
  if (topRight) d += moveToOrArc(width, topRight ? radius : 0, topRight);
  else d += `L ${width},0 `;
  d += `V ${height - (bottomRight ? radius : 0)} `;
  if (bottomRight) d += moveToOrArc(width - radius, height, bottomRight);
  else d += `L ${width},${height} `;
  d += `H ${bottomLeft ? radius : 0} `;
  if (bottomLeft) d += moveToOrArc(0, height - radius, bottomLeft);
  else d += `L 0,${height} `;
  d += `V ${topLeft ? radius : 0} `;
  if (topLeft) d += moveToOrArc(topLeft ? radius : 0, 0, topLeft);
  else d += `L 0,0 `;
  d += `Z`;

  const clipDef = `
    <defs>
      <clipPath id="roundedClip">
        <path d="${d}" />
      </clipPath>
    </defs>
  `;

  svgString = svgString.replace(/<svg([^>]*)>/, `<svg$1>${clipDef}`);

  svgString = svgString.replace(
    /(<svg[^>]*>)([\s\S]*)(<\/svg>)/,
    (match, open, content, close) => {
      return `${open}<g clip-path="url(#roundedClip)">${content}</g>${close}`;
    }
  );
  return svgString;
}

/* Get SVG Dimensions from SVG String
------------------------------------------------------------------------------*/
export function getSvgDimensions(svgString) {
  if (typeof svgString !== 'string') return { width: 0, height: 0 };
  const dimensions = svgString.match(/<svg[^>]*\swidth="([^"]+)"[^>]*\sheight="([^"]+)"[^>]*>/);
  if (dimensions) {
    return {
      width: parseFloat(dimensions[1]),
      height: parseFloat(dimensions[2]),
    };
  }
}

/*==============================================================================
                              ARM ANCHOR CALCULATIONS
==============================================================================*/

function safeNormalize(dx, dy) {
  const len = Math.hypot(dx, dy) || 1;
  return { ux: dx / len, uy: dy / len, len };
}

export function createSingleBaseAnchor(from, to, thicknessPx, side = 'left') {
  if (!from || !to) return null;

  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const { ux, uy } = safeNormalize(dx, dy);

  // perpendicular unit
  const nx = -uy;
  const ny = ux;

  const half = (thicknessPx || 1) / 2;
  const dir = side === 'right' ? -1 : 1;

  return {
    x: from.x + nx * half * dir,
    y: from.y + ny * half * dir,
  };
}


export function addSvgOpacityGradient(svgString, opts = {}) {
  const {
    direction = 'leftToRight',
    stops = [
      { offset: 0, opacity: 1 },
      { offset: 1, opacity: 0 },
    ],
    idSuffix = '',
  } = opts;

  if (typeof svgString !== 'string' || !svgString.includes('<svg')) return svgString;

  // Find opening <svg ...> and closing </svg>
  const openMatch = svgString.match(/<svg\b[^>]*>/i);
  const closeIdx = svgString.toLowerCase().lastIndexOf('</svg>');
  if (!openMatch || closeIdx < 0) return svgString;

  const openTag = openMatch[0];
  const openEnd = svgString.indexOf(openTag) + openTag.length;
  const inner = svgString.slice(openEnd, closeIdx);

  // Direction mapping
  let x1 = '0%', y1 = '0%', x2 = '100%', y2 = '0%';
  if (direction === 'rightToLeft') { x1 = '100%'; y1 = '0%'; x2 = '0%'; y2 = '0%'; }
  if (direction === 'topToBottom') { x1 = '0%'; y1 = '0%'; x2 = '0%'; y2 = '100%'; }
  if (direction === 'bottomToTop') { x1 = '0%'; y1 = '100%'; x2 = '0%'; y2 = '0%'; }

  const uid = `${Date.now()}_${Math.random().toString(36).slice(2)}${idSuffix}`;
  const gradId = `opGrad_${uid}`;
  const maskId = `opMask_${uid}`;

  const stopTags = stops
    .map((s) => {
      const off = Math.max(0, Math.min(1, s.offset));
      const op = Math.max(0, Math.min(1, s.opacity));
      return `<stop offset="${off * 100}%" stop-color="white" stop-opacity="${op}" />`;
    })
    .join('');

  const defs = `
    <defs>
      <linearGradient id="${gradId}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">
        ${stopTags}
      </linearGradient>
      <mask id="${maskId}">
        <rect x="0" y="0" width="100%" height="100%" fill="url(#${gradId})" />
      </mask>
    </defs>`;

  return `${openTag}
    ${defs}
    <g mask="url(#${maskId})">
    ${inner}
    </g>
    </svg>`;
}