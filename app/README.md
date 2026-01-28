# App Folder Overview

This folder contains the main application screens and logic for the app. Each file is described below:

---

## Files

- **_layout.jsx**
  Defines the layout and navigation structure for the app's screens. Handles shared UI elements and routing logic.

- **index.jsx**
  The home screen of the app. Provides navigation links to the main features such as sketching and viewing saved poses. Applies theming and layout for the landing page.

- **sketchPage.jsx**
  The main drawing interface for users to sketch, edit, and export SVG body parts. Handles responsive layout, drawing controls, and integrates with canvas components for user input.
  - ReactSketchCanvas elements are rendered for each body part
  - When the user selects the animate sketch button (running icon), the sketched svgs are saved and passed to DetectPose

- **detectPose.jsx**
  Runs pose detection with TensorFlow.js. Detects human poses from webcam or video, overlays SVG body parts, and supports live animation, pose recording, and video modes. Integrates with `SvgCanvas` for rendering and manages pose data collection.

- **viewSavedPoses.jsx**
  Displays a list or gallery of saved pose animations. Allows users to view, replay, or manage previously recorded poses and their associated SVG overlays.
  
  NOTE: This feature is not fully implemented. It displays the json data for saved pose landmarks, but does not show animation or provide a way to use the saved landmarks. This file will be updated in the future to display pose landmark animations and allow users to select animations to apply to stored or sketched svgs. 

---

## Notes
- All screens use React (and React Native for web) with Expo Router for navigation.
- The folder is the entry point for user-facing features and ties together UI, pose detection, and drawing logic.
- For component-level details, see the `components/` folder.
