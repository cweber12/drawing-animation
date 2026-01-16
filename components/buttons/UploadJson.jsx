import React, { useState } from 'react';
import { Alert, Text, View, TouchableOpacity, useColorScheme } from 'react-native';
import { FaFileExport } from 'react-icons/fa';
import { Colors } from '../../constants/Colors';
import { getIconSize } from '../../constants/Sizes';

const UploadJson = ({ landmarks, style }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;

  const uploadLandmarksToS3 = async () => {
    if (!landmarks || landmarks.size === 0) {
      Alert.alert('No landmarks to upload');
      return;
    }
    console.log('Uploading landmarks to S3...');
    console.log(landmarks);
    setUploading(true);
    setUploadStatus('Uploading...');
    const bucket = 'pose-animations';
    const timestamp = Date.now();
    const key = `pose_landmarks/${timestamp}.json`;
    const url = `https://kqaq8gwqvl.execute-api.us-east-2.amazonaws.com/prod/${bucket}/${key}`;

    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(landmarks),
      });

      if (response.ok) {
        setUploadStatus('Upload successful!');
        Alert.alert('Success', 'Landmarks uploaded successfully!');
      } else {
        setUploadStatus('Upload failed');
        Alert.alert('Error', 'Upload failed');
      }
    } catch (error) {
      setUploadStatus('Error occurred');
      Alert.alert('Error', error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <TouchableOpacity
      onPress={uploadLandmarksToS3}
      disabled={uploading}
      style={style}
    >
      <FaFileExport size={getIconSize()} color={theme.button} />
    </TouchableOpacity>
  );
};

export default UploadJson;