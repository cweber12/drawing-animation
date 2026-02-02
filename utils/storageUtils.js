// storageUtils.js

/* Utility functions to download landmarks and SVGs to the user's device
   using the File System Access API (Chromium-based browsers only).
------------------------------------------------------------------------------*/

// Keep a persistent handle to the selected directory
let directoryHandle = null;

/* Prompt user to select a download folder
------------------------------------------------------------------------------*/
export async function selectDownloadFolder() {
  if (!("showDirectoryPicker" in window)) {
    alert("Folder selection is only supported in Chromium-based browsers.");
    return false;
  }

  try {
    directoryHandle = await window.showDirectoryPicker();
    return true;
  } catch (err) {
    console.error("showDirectoryPicker failed:", err);
    return false;
  }
}

/* Generate filename based on current timestamp and file type
------------------------------------------------------------------------------*/
function generateFilename(fileType) {
  const timestamp = Date.now();
  if (fileType === "json") return `landmarks/${timestamp}.json`;
  if (fileType === "svg") return `svgs/${timestamp}.svg`; 
  return `${timestamp}`;
}

/* Save data string to a file in the selected folder
------------------------------------------------------------------------------*/
async function saveFileToFolder(dataString, fileType) {
  if (!directoryHandle) {
    const ok = await selectDownloadFolder();
    if (!ok) return;
  }

  const filename = generateFilename(fileType);
  const [subfolder, name] = filename.split("/");

  // 1) Try to open existing subfolder first
  let subDirHandle;
  try {
    subDirHandle = await directoryHandle.getDirectoryHandle(subfolder, { create: false });
  } catch (e) {
    // 2) If it doesn't exist, create it
    subDirHandle = await directoryHandle.getDirectoryHandle(subfolder, { create: true });
  }

  // Create/overwrite file in that folder
  const fileHandle = await subDirHandle.getFileHandle(name, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(dataString);
  await writable.close();

  alert(`Saved to ${subfolder}/${name}`);
}

/* Serialize landmarks and video dimensions 
------------------------------------------------------------------------------*/
function serializeLandmarks(landmarks, videoDimensions) {
  return JSON.stringify({ landmarks, videoDimensions });
}

/* Serialize SVGs
--------------------------------------------------------------------------------
Props : svgs - object containing SVG strings
Returns : JSON string of the svgs object
------------------------------------------------------------------------------*/
function serializeSvgs(svgs) {
  return JSON.stringify(svgs);
}

/* Download landmarks or SVGs to device
--------------------------------------------------------------------------------
Description : Prompts user to select folder (if not already selected) and saves
              the landmarks or SVGs as a file in that folder.

Props : 
- landmarks : array of landmark data
- videoDimensions : object with width and height of the video
------------------------------------------------------------------------------*/
export async function downloadLandmarksToDevice(landmarks, videoDimensions) {
  if (!landmarks || (Array.isArray(landmarks) && landmarks.length === 0)) {
    alert("No landmarks to download");
    return;
  }

  const payload = serializeLandmarks(landmarks, videoDimensions);
  await saveFileToFolder(payload, "json");
}

/* Download SVGs to device
--------------------------------------------------------------------------------
Props : svgs - object containing SVG strings
------------------------------------------------------------------------------*/
export async function downloadSvgToDevice(svgs) {
  if (!svgs || typeof svgs !== "object" || Object.keys(svgs).length === 0) {
    alert("No SVGs to download");
    return;
  }

  const payload = serializeSvgs(svgs);
  await saveFileToFolder(payload, "svg");
}