import { Alert } from 'react-native';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants/Sizes';

const API_BASE = 'https://kqaq8gwqvl.execute-api.us-east-2.amazonaws.com/prod';
const BUCKET = 'pose-animations';

// Helper to encode S3 keys
const encodeS3KeyForPath = (key) =>
key.split("/").map(encodeURIComponent).join("/");

export const uploadToS3 = async ({
    landmarks,
    svgs,
    fileType,
}) => {
    console.log("uploading landmarks to s3: ", landmarks);
    const videoDimensions = { width: CANVAS_WIDTH, height: CANVAS_HEIGHT };
    console.log("uploadToS3 - videoDimensions:", videoDimensions);

    if (fileType === 'json' && (!landmarks || landmarks.length === 0)) {
        Alert.alert('No landmarks to upload');
        console.log("No landmarks to upload");
        if (fileType === 'svg' && (!svgs || svgs.length === 0)) {
        Alert.alert('No SVGs to upload');
        console.log("No SVGs to upload");
        return;
        }
    }

    const bucket = BUCKET;
    const timestamp = Date.now();
    const key = fileType === 'json' ? `landmarks/${timestamp}.json` : `svgs/${timestamp}.svg`;
    const url = `${API_BASE}/${bucket}/${key}`;
    const landmarkPayload = JSON.stringify({ landmarks, videoDimensions });
    console.log("landmarkPayload:", landmarkPayload);
    try {
        const response = await fetch(url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: fileType === 'json'
                ? JSON.stringify({ landmarks, videoDimensions })
                : JSON.stringify(svgs),
        });

        if (response.ok) {
            Alert.alert('Success', `${fileType === 'json' ? 'Landmarks' : 'SVGs'} uploaded successfully!`);
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
    setFrames,
    setSelectedSvgString,
) => {
    setLoading(true);
    setSelectedLandmarkFile(null);
    setSelectedSvgFile(null);
    setFrames([]);
    setSelectedSvgString(null);
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
    setLoading,
    setSelectedLandmarkFile,
    setFrames,
    setCurrentFrame,
    setVideoDimensions,
    setHeight,
    setWidth,
    window,
) => {
    setLoading(true);
    setSelectedLandmarkFile(fileKey);
    setFrames([]);
    setCurrentFrame(0);
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

        if (Array.isArray(loadedLandmarks[0])) {
        setFrames(loadedLandmarks);
        } else if (loadedLandmarks && typeof loadedLandmarks === 'object') {
        setFrames([loadedLandmarks]);
        } else {
        setFrames([]);
        }
        setVideoDimensions(loadedDimensions);
        console.log("Downloaded landmark file dimensions:", loadedDimensions);
        setHeight(window.height * 0.7);
        setWidth((loadedDimensions.width / loadedDimensions.height) * (window.height * 0.7));
        console.log("Set width:", (loadedDimensions.width / loadedDimensions.height) * (window.height * 0.7));
        console.log("Set height:", window.height * 0.7);
    } catch (err) {
        setFrames([]);
        setVideoDimensions({ width: CANVAS_WIDTH, height: CANVAS_HEIGHT });
    } finally {
        setLoading(false);
    }
};

// Download SVG file as string
export const downloadSvgFile = async (
    fileKey,
    setLoading,
    setSelectedSvgFile,
    setSelectedSvgString,
    selectedSvgString,
) => {
    setLoading(true);
    setSelectedSvgFile(fileKey);
    setSelectedSvgString(null);
    try {
        const downloadUrl = `${API_BASE}/${BUCKET}/${encodeS3KeyForPath(fileKey)}`;
        console.log("Downloading SVG from:", downloadUrl);
        const response = await fetch(downloadUrl, { method: "GET" });
        console.log("Download response:", response.status);
        if (!response.ok) throw new Error(`Failed: ${response.status}`);
        const text = await response.text();
        let svgString = text;
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
        setSelectedSvgString(svgObj);
        console.log('Downloaded SVG string:', selectedSvgString); 
    } catch (err) {
        setSelectedSvgString(null);
        console.log("Error downloading SVG file:", err);
    } finally {
        setLoading(false);
    }
};