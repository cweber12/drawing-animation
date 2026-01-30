import React, { useState } from 'react';
import { Alert, Text, View, TouchableOpacity, useColorScheme } from 'react-native';
import { FaFileExport } from 'react-icons/fa';
import { Colors } from '../../constants/Colors';
import { getIconSize } from '../../constants/Sizes';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../constants/Sizes';

const UploadS3 = ({ 
  landmarks,
  style, 
  svgs, 
  fileType,   
  onHandleUpload,
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;
  console.log("UploadS3 - landmarks:", landmarks);

  const uploadToS3 = async () => {
    const videoDimensions = { width: CANVAS_WIDTH, height: CANVAS_HEIGHT };
    
    if (fileType === 'json' && (!landmarks || landmarks.length === 0)) {
      Alert.alert('No landmarks to upload');
      return;
    }
    if (fileType === 'svg' && (!svgs || svgs.length === 0)) {
      Alert.alert('No SVGs to upload');
      return;
    }
    if (fileType === 'json') {
    console.log('Uploading JSON to S3...');
    } else if (fileType === 'svg') {
      console.log('Uploading SVG to S3...');
    }
    setUploading(true);
    setUploadStatus('Uploading...');
    const bucket = 'pose-animations';
    const timestamp = Date.now();
    const key = fileType === 'json' ? `landmarks/${timestamp}.json` : `svgs/${timestamp}.svg`;
    const url = `https://kqaq8gwqvl.execute-api.us-east-2.amazonaws.com/prod/${bucket}/${key}`;
    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: fileType === 'json' 
        ? JSON.stringify({ landmarks, videoDimensions }) : JSON.stringify(svgs),
      });

      if (response.ok) {
        setUploadStatus('Upload successful!');
        Alert.alert('Success', `${fileType === 'json' ? 'Landmarks' : 'SVGs'} uploaded successfully!`);
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
        onPress={() => {
          if (fileType === 'json') {
            uploadToS3();
          } else {
            onHandleUpload && onHandleUpload();
            
            uploadToS3();
          }
        }}
      disabled={uploading}
      style={style}
    >
      <FaFileExport size={getIconSize()} color={theme.button} />
    </TouchableOpacity>
  );
};

export default UploadS3;