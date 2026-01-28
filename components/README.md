# Components Folder Overview

This folder contains all reusable UI and canvas components for the Drawing App. Components are organized by feature and type for clarity and maintainability.

---

## Folders and Components

### buttons/
- **UploadS3.jsx**
  - Button for uploading files to AWS S3. Handles file selection and upload logic.

### canvas/
- **PoseCanvas.jsx**
  - Draws pose landmarks and skeletons over the webcam or video feed.
- **SvgCanvas.jsx**
  - Renders SVG body parts and overlays them on detected pose landmarks. Supports animation and replay.
- **body_parts/**
  - **Feet.jsx**: Renders the feet drawing canvas and SVG export for foot parts.
  - **Head.jsx**: Renders the head drawing canvas and SVG export for the head.
  - **LeftArm.jsx**: Renders the left arm drawing canvas and SVG export for the left arm.
  - **Legs.jsx**: Renders the legs drawing canvas and SVG export for the legs.
  - **RightArm.jsx**: Renders the right arm drawing canvas and SVG export for the right arm.
  - **Torso.jsx**: Renders the torso drawing canvas and SVG export for the torso.

### controls/
- **BrushSizeSlider.jsx**
  - Slider for adjusting the brush size in drawing canvases.
- **ColorPicker.jsx**
  - Color picker for selecting drawing colors.
- **detectPoseButtons.jsx**
  - Buttons for controlling pose detection actions (start, stop, etc.).
- **detectPoseDropdown.jsx**
  - Dropdown for selecting pose detection options or modes.
- **SketchButtons.jsx**
  - Buttons for sketching actions (save, clear, export, etc.).

### themed_components/
- **ThemedCanvasWrapper.jsx**
  - Wrapper that applies theme-based background and layout to canvas components.
- **ThemedPoseView.jsx**
  - Themed container for pose detection and animation screens.
- **ThemedView.jsx**
  - General-purpose themed container for consistent app styling.

---

## Notes
- All components are written in React (with React Native for web compatibility).
- Components are designed to be reusable and composable across different screens.
- For constants and utility functions, see the `constants/` and `utils/` folders.
