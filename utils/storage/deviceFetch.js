let directoryHandle = null;
/* RETRIEVE FILES FROM DEVICE
--------------------------------------------------------------------------------
Uses the File System Access API to read files from a user-selected folder.
Only supported in Chromium-based browsers.
------------------------------------------------------------------------------*/

/* Prompt user to select a folder containing pose files
------------------------------------------------------------------------------*/
export async function selectPoseFolder() {
  if (!("showDirectoryPicker" in window)) {
    alert("Folder selection is only supported in Chromium-based browsers.");
    return false;
  }
  try {
    directoryHandle = await window.showDirectoryPicker();
    return true;
  } catch (e) {
    console.error("selectPoseFolder error:", e);
    return false;
  }
}

function splitKey(fileKey) {
  const [subfolder, ...rest] = fileKey.split("/");
  return { subfolder, name: rest.join("/") };
}

async function getSubDirHandle(subfolder, create = false) {
  if (!directoryHandle) {
    throw new Error("No folder selected");
  }
  return await directoryHandle.getDirectoryHandle(subfolder, { create });
}

// Returns keys like "landmarks/123.json" and "svgs/123.svg" (same shape as S3 keys)
export async function listDevicePoseFiles() {
  if (!directoryHandle) {
    throw new Error("No folder selected");
  }

  const listFilesIn = async (subfolder) => {
    try {
      const dir = await getSubDirHandle(subfolder, false);
      const keys = [];
      for await (const [name, handle] of dir.entries()) {
        if (handle.kind === "file") keys.push(`${subfolder}/${name}`);
      }
      // optional: newest first if filenames are timestamps
      keys.sort((a, b) => (a < b ? 1 : -1));
      return keys;
    } catch {
      return []; // folder doesn't exist
    }
  };

  const landmarkFiles = await listFilesIn("landmarks");
  const svgFiles = await listFilesIn("svgs");
  return { landmarkFiles, svgFiles };
}

export async function readDeviceFileText(fileKey) {
  const { subfolder, name } = splitKey(fileKey);
  const dir = await getSubDirHandle(subfolder, false);
  const fileHandle = await dir.getFileHandle(name, { create: false });
  const file = await fileHandle.getFile();
  const text = await file.text();
  return text;
}