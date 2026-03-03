import { Alert } from 'react-native';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../constants/Sizes';

const API_BASE = 'https://kqaq8gwqvl.execute-api.us-east-2.amazonaws.com/prod';
const BUCKET = 'pose-animations';

// Helper to encode S3 keys
const encodeS3KeyForPath = (key) =>
key.split("/").map(encodeURIComponent).join("/");

export const uploadToS3 = async ({
    landmarks,
    svgs,
    dataType, // 'landmarks' or 'svgs' 
    isAnimation = false, // save both to same folder if true
    animationTimestamp = null, // to identify animation folders
}) => {

    const videoDimensions = { width: CANVAS_WIDTH, height: CANVAS_HEIGHT };

    if ((!landmarks || (Array.isArray(landmarks) && landmarks.length === 0)) && 
    (!svgs || Object.keys(svgs).length === 0)) {
        alert("No landmarks or SVGs to upload");
        return;
    }

    const bucket = BUCKET;
    const timestamp = Date.now();
    let key;
    if (isAnimation && animationTimestamp) {
        key = dataType === 'landmarks' 
            ? `animations/${animationTimestamp}/landmarks/${timestamp}.json` 
            : `animations/${animationTimestamp}/svgs/${timestamp}.svg`;
    } else {
        key = dataType === 'landmarks' ? `landmarks/${timestamp}.json` : `svgs/${timestamp}.svg`;
    }
    const url = `${API_BASE}/${bucket}/${key}`;
    const landmarkPayload = JSON.stringify({ landmarks, videoDimensions });
    console.log("landmarkPayload:", landmarkPayload);
    try {
        const response = await fetch(url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: dataType === 'landmarks'
                ? JSON.stringify({ landmarks, videoDimensions })
                : JSON.stringify(svgs),
        });

        if (response.ok) {
            Alert.alert('Success', `${dataType === 'landmarks' ? 'Landmarks' : 'SVGs'} uploaded successfully!`);
            console.log("Upload successful");
        } else {
            Alert.alert('Error', 'Upload failed');
            console.log("Upload failed");
        }
    } catch (error) {
            Alert.alert('Error', error.message);
            console.log("Upload error:", error);
    }
};

// Fetch file lists
export const fetchFiles = async (
    setLoading,
    setLandmarkFiles,
    setSvgFiles,
    setFiles,
    setSelectedLandmarkFile,
    setSelectedSvgFile,
) => {
    setLoading(true);
    setSelectedLandmarkFile(null);
    setSelectedSvgFile(null);
    try {
        const url = `${API_BASE}/${BUCKET}`;
        console.log("Fetching file list from:", url);
        const response = await fetch(url);
        console.log("Fetch response:", response.status);
        if (!response.ok) throw new Error(`Failed: ${response.status}`);
        const xml = await response.text();
        const keys = [...xml.matchAll(/<Key>(.*?)<\/Key>/g)].map(m => m[1]);
        const landmarkFiles = keys.filter(k => k.startsWith('landmarks/') && k.endsWith('.json'));
        const svgFiles = keys.filter(k => k.startsWith('svgs/') && k.endsWith('.svg'));
        setLandmarkFiles(landmarkFiles);
        setSvgFiles(svgFiles);
        setFiles(keys);
    } catch (err) {
        console.log("Error fetching file list:", err);
        setLandmarkFiles([]);
        setSvgFiles([]);
        setFiles([]);
    } finally {
        setLoading(false);
    }
};

// Download and parse landmark file
export const downloadLandmarkFile = async (
    fileKey,
) => {
    try {
        const downloadUrl = `${API_BASE}/${BUCKET}/${encodeS3KeyForPath(fileKey)}`;
        const response = await fetch(downloadUrl, { method: "GET" });
        if (!response.ok) throw new Error(`Failed: ${response.status}`);
        const content = await response.text();
        let parsed;
        try {
        parsed = JSON.parse(content);
        } catch (e) {
        parsed = {};
        }

        let loadedLandmarks = [];
        let loadedDimensions = { width: CANVAS_WIDTH, height: CANVAS_HEIGHT };

        if (Array.isArray(parsed)) {
        loadedLandmarks = parsed;
        } else if (parsed && typeof parsed === 'object') {
        loadedLandmarks = parsed.landmarks || [];
        if (parsed.videoDimensions) {
            loadedDimensions = parsed.videoDimensions;
        }
        }

        return { 
            landmarks: loadedLandmarks, 
            videoDimensions: loadedDimensions 
        };
    } catch (err) {
        console.error("Error downloading landmark file:", err);
        return { 
            landmarks: [], 
            videoDimensions: { width: CANVAS_WIDTH, height: CANVAS_HEIGHT } 
        };
    } 
};

// Download SVG file as string
export const downloadSvgFile = async ( fileKey ) => {
    try {
        const downloadUrl = `${API_BASE}/${BUCKET}/${encodeS3KeyForPath(fileKey)}`;
        console.log("Downloading SVG from:", downloadUrl);
        const response = await fetch(downloadUrl, { method: "GET" });
        console.log("Download response:", response.status);
        if (!response.ok) throw new Error(`Failed: ${response.status}`);
        const text = await response.text();

        console.log('Raw downloaded SVG text:', text);
        let svgObj = {};
        try {
        const parsed = JSON.parse(text);
        if (parsed && typeof parsed === "object") {
            svgObj = parsed; // Use all SVG parts
        } else {
            // If not a JSON object, do not set selectedSvgString
            svgObj = {};
        }
        } catch (e) {
        // If not JSON, do not set selectedSvgString
        svgObj = {};
        }
        return svgObj;
    } catch (err) {
        console.log("Error downloading SVG file:", err);
        return {};
    } 
};