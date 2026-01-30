import { Alert } from 'react-native';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants/Sizes';

export const uploadToS3 = async ({
    landmarks,
    svgs,
    fileType,
}) => {
    const videoDimensions = { width: CANVAS_WIDTH, height: CANVAS_HEIGHT };
    console.log("uploadToS3 - landmarks:", landmarks);
    console.log("uploadToS3 - svgs:", svgs);

    if (fileType === 'json' && (!landmarks || landmarks.length === 0)) {
        Alert.alert('No landmarks to upload');
        console.log("No landmarks to upload");
        if (fileType === 'svg' && (!svgs || svgs.length === 0)) {
        Alert.alert('No SVGs to upload');
        console.log("No SVGs to upload");
        return;
        }
    }

    const bucket = 'pose-animations';
    const timestamp = Date.now();
    const key = fileType === 'json' ? `landmarks/${timestamp}.json` : `svgs/${timestamp}.svg`;
    const url = `https://kqaq8gwqvl.execute-api.us-east-2.amazonaws.com/prod/${bucket}/${key}`;
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