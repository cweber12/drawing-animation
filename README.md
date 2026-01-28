# Sketch Animation App

A web-based drawing and pose animation application built with React, Expo, and TensorFlow.js. Users can sketch body parts as SVGs, detect human poses from webcam or video, and animate their sketches using real-time or recorded pose data.

---

## Project Structure

- **app/**
  - Main application screens and logic. Includes the home page, sketching interface, pose detection, and saved poses features.
  - See [app/README.md](app/README.md) for detailed descriptions of each file.

- **components/**
  - Reusable UI and canvas components, organized by feature (buttons, canvas, controls, themed components).
  - Includes all drawing canvases, pose overlays, and UI controls.
  - See [components/README.md](components/README.md) for a full breakdown.

- **constants/**
  - Shared constants for colors, API endpoints, landmark data, and sizing used throughout the app.

- **hooks/**
  - Custom React hooks for pose detection and other reusable logic.

- **public/svg_parts/**
  - Contains static SVG assets and JSON data for body part templates.

- **styles/**
  - CSS files for custom styling of controls and layout.

- **utils/**
  - Utility functions for drawing, pose calculations, scaling, and SVG manipulation.

- **assets/**
  - App icons, splash images, and other static assets.

---

## Key Features

- Sketch and export SVG body parts using an interactive canvas.
- Detect human poses in real-time from webcam or video using TensorFlow.js.
- Overlay and animate custom SVGs on detected poses.
- Save and replay pose animations (feature in progress).
- Upload and manage assets with AWS S3 integration.

---

## Getting Started

1. **Install dependencies:**
   ```sh
   npm install
   ```
2. **Start the development server:**
   ```sh
   npm start
   ```
3. **Build and deploy for web:**
   ```sh
   npm run deploy
   ```

---

## Additional Notes

- Navigation is handled with Expo Router.
- Pose detection uses the MoveNet model from TensorFlow.js.
- For detailed documentation on screens and components, see the README files in their respective folders.

---

## License

This project is for educational and demonstration purposes.
