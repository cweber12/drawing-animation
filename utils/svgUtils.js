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
export function addSvgClipPath(svgString, width, height, radius) {
  // Insert <defs> and <clipPath>
  const clipDef = `
    <defs>
      <clipPath id="roundedClip">
        <rect x="0" y="0" width="${width}" height="${height}" rx="${radius}" ry="${radius}" />
      </clipPath>
    </defs>
  `;
  // Insert clip def after <svg ...>
  svgString = svgString.replace(/<svg([^>]*)>/, `<svg$1>${clipDef}`);

  // Wrap all <path> (and possibly <g>) elements in a <g clip-path="url(#roundedClip)">
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
  const dimensions = svgString.match(/<svg[^>]*\swidth="([^"]+)"[^>]*\sheight="([^"]+)"[^>]*>/);
  if (dimensions) {
    return {
      width: parseFloat(dimensions[1]),
      height: parseFloat(dimensions[2]),
    };
  }
}