import { useMemo, useRef, useCallback } from "react";
import { useStrokeHistory } from "../context/StrokeHistoryContext";

/**
 * Owns:
 * - all canvas refs
 * - stable list of canvas IDs
 * - helpers: export/load/clear per-canvas
 * - stroke handlers that register last stroke on stroke end
 * - undo/redo that apply to the correct canvas via exportPaths/loadPaths
 */
export function useSketchCanvasRig() {
    const { registerStroke, undoStroke, redoStroke } = useStrokeHistory();

    // 1) Refs (front)
    const headRef = useRef(null);
    const torsoRef = useRef(null);

    const rightUpperArmRef = useRef(null);
    const rightLowerArmRef = useRef(null);
    const rightHandRef = useRef(null);

    const leftUpperArmRef = useRef(null);
    const leftLowerArmRef = useRef(null);
    const leftHandRef = useRef(null);

    const rightUpperLegRef = useRef(null);
    const rightLowerLegRef = useRef(null);
    const leftUpperLegRef = useRef(null);
    const leftLowerLegRef = useRef(null);

    const rightFootRef = useRef(null);
    const leftFootRef = useRef(null);

    // 2) Refs (back) — add if you have separate canvases
    const headBackRef = useRef(null);
    const torsoBackRef = useRef(null);
    
    const rightUpperArmBackRef = useRef(null);
    const rightLowerArmBackRef = useRef(null);
    const rightHandBackRef = useRef(null);
        
    const leftUpperArmBackRef = useRef(null);
    const leftLowerArmBackRef = useRef(null);
    const leftHandBackRef = useRef(null);

    const rightUpperLegBackRef = useRef(null);
    const rightLowerLegBackRef = useRef(null);
    const leftUpperLegBackRef = useRef(null);
    const leftLowerLegBackRef = useRef(null);

    const rightFootBackRef = useRef(null);
    const leftFootBackRef = useRef(null);

  // 3) Central registry: canvasId -> ref
  const canvasRefs = useMemo(
    () => ({
        head: headRef,
        headBack: headBackRef,
        torso: torsoRef,
        torsoBack: torsoBackRef,
        rightUpperArm: rightUpperArmRef,
        rightUpperArmBack: rightUpperArmBackRef,
        rightLowerArm: rightLowerArmRef,
        rightLowerArmBack: rightLowerArmBackRef,
        rightHand: rightHandRef,
        rightHandBack: rightHandBackRef,
        leftUpperArm: leftUpperArmRef,
        leftUpperArmBack: leftUpperArmBackRef,
        leftLowerArm: leftLowerArmRef,
        leftLowerArmBack: leftLowerArmBackRef,
        leftHand: leftHandRef,
        leftHandBack: leftHandBackRef,
        rightUpperLeg: rightUpperLegRef,
        rightUpperLegBack: rightUpperLegBackRef,
        rightLowerLeg: rightLowerLegRef,
        rightLowerLegBack: rightLowerLegBackRef,
        leftUpperLeg: leftUpperLegRef,
        leftUpperLegBack: leftUpperLegBackRef,
        leftLowerLeg: leftLowerLegRef,
        leftLowerLegBack: leftLowerLegBackRef,
        rightFoot: rightFootRef,
        rightFootBack: rightFootBackRef,
        leftFoot: leftFootRef,
        leftFootBack: leftFootBackRef,

    }),
    []
  );

  const getCanvas = useCallback(
    (canvasId) => canvasRefs[canvasId]?.current ?? null,
    [canvasRefs]
  );

  const exportPaths = useCallback(async (canvasId) => {
    const c = getCanvas(canvasId);
    if (!c?.exportPaths) return [];
    return await c.exportPaths();
  }, [getCanvas]);

  const loadPaths = useCallback(async (canvasId, paths) => {
    const c = getCanvas(canvasId);
    if (!c?.loadPaths) return;
    await c.loadPaths(paths);
  }, [getCanvas]);

  const clearCanvas = useCallback(async (canvasId) => {
    const c = getCanvas(canvasId);
    if (c?.clearCanvas) await c.clearCanvas();
    else if (c?.resetCanvas) await c.resetCanvas();
    else await loadPaths(canvasId, []);
  }, [getCanvas, loadPaths]);

  // Called when a stroke completes on a specific canvas:
  const onStrokeEnd = useCallback(
    (canvasId) => async () => {
      const paths = await exportPaths(canvasId);
      const last = paths?.[paths.length - 1];
      if (last) registerStroke(canvasId, last);
    },
    [exportPaths, registerStroke]
  );

  // Undo/Redo glue (using your context’s “which canvas + what stroke” logic)
  const handleUndo = useCallback(async () => {
    const res = undoStroke?.();
    if (!res) return;

    // recommend context returns: { canvasId, strokeData }
    const { canvasId } = res;

    const paths = await exportPaths(canvasId);
    if (!paths.length) return;

    // remove last stroke from actual canvas
    await loadPaths(canvasId, paths.slice(0, -1));
  }, [undoStroke, exportPaths, loadPaths]);

  const handleRedo = useCallback(async () => {
    const res = redoStroke?.();
    if (!res) return;

    // recommend context returns: { canvasId, strokeData }
    const { canvasId, strokeData } = res;

    const paths = await exportPaths(canvasId);
    await loadPaths(canvasId, [...paths, strokeData]);
  }, [redoStroke, exportPaths, loadPaths]);

  return {
    refs: canvasRefs,
    helpers: { exportPaths, loadPaths, clearCanvas },
    handlers: { onStrokeEnd, handleUndo, handleRedo },
  };
}