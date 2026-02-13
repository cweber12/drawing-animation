import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
} from 'react-native';
import React, { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { GiSkeleton } from 'react-icons/gi';
import { BsPersonRaisedHand } from 'react-icons/bs';

import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../constants/Sizes';
import { Colors } from '../../constants/Colors';
import DropdownSelect from '../button/DropdownSelect';

import {
  fetchFiles,
  downloadLandmarkFile,
  downloadSvgFile,
} from '../../utils/s3Utils';
import {
  selectPoseFolder,
  listDevicePoseFiles,
  readDeviceFileText,
} from '../../utils/storageUtils';
import { set } from 'lodash';
import List from './List';

export default function FileList({
  // file list state
  files,
  setFiles,
  landmarkFiles,
  setLandmarkFiles,
  svgFiles,
  setSvgFiles,

  // selected items
  selectedLandmarkFile,
  setSelectedLandmarkFile,
  selectedSvgFile,
  setSelectedSvgFile,
  selectedSvgString,
  setSelectedSvgString,

  // frame/video state
  frames,
  setFrames,
  currentFrame,
  setCurrentFrame,
  videoDimensions,
  setVideoDimensions,
  setHeight,
  setWidth,
  window,

  // source mode / loading
  showDeviceFiles,
  setShowDeviceFiles,
  loading,
  setLoading,

  // cleanup
  animationRef,
}) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;
  const [listItemHover, setListItemHover] = React.useState(null);

  /* LOAD FILES FROM DEVICE
  ----------------------------------------------------------------------------*/
  const chooseDeviceFolderAndLoad = async () => {
    setLoading(true);
    try {
      const ok = await selectPoseFolder();
      if (!ok) return;

      setShowDeviceFiles(true);

      // reset selections/state
      setSelectedLandmarkFile(null);
      setSelectedSvgFile(null);
      setFrames([]);
      setCurrentFrame(0);
      setSelectedSvgString(null);
      setLandmarkFiles([]);
      setSvgFiles([]);

      // load from selected folder
      const result = await listDevicePoseFiles();
      setLandmarkFiles(result?.landmarkFiles ?? []);
      setSvgFiles(result?.svgFiles ?? []);
    } catch (e) {
      console.error(e);
      setLandmarkFiles([]);
      setSvgFiles([]);
    } finally {
      setLoading(false);
    }
  };

  /* HANDLE SVG FILE SELECTION
  ----------------------------------------------------------------------------*/
  async function handleSelectSvgFile(fileKey) {
    setLoading(true);
    setSelectedSvgFile(fileKey);
    setSelectedSvgString(null);

    try {
      // S3
      if (!showDeviceFiles) {
        await downloadSvgFile(
          fileKey,
          setLoading,
          setSelectedSvgFile,
          setSelectedSvgString,
          selectedSvgString
        );
        return;
      }

      // DEVICE
      const text = await readDeviceFileText(fileKey);
      const parsed = JSON.parse(text);

      if (!parsed || typeof parsed !== 'object') {
        alert('SVG file JSON is not an object');
        setSelectedSvgString({});
        return;
      }

      setSelectedSvgString(parsed);
    } catch (e) {
      console.error('Device SVG load failed:', e);
      setSelectedSvgString({});
    } finally {
      setLoading(false);
    }
  }

  /* HANDLE LANDMARK FILE SELECTION
  ----------------------------------------------------------------------------*/
  async function handleSelectLandmarkFile(fileKey) {
    setLoading(true);
    setSelectedLandmarkFile(fileKey);
    setFrames([]);
    setCurrentFrame(0);

    try {
      if (!showDeviceFiles) {
        // S3
        await downloadLandmarkFile(
          fileKey,
          setLoading,
          setSelectedLandmarkFile,
          setFrames,
          setCurrentFrame,
          setVideoDimensions,
          setHeight,
          setWidth,
          window
        );
        return;
      }

      // DEVICE
      const text = await readDeviceFileText(fileKey);
      let parsed;
      try {
        parsed = JSON.parse(text);
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

      const targetHeight = window.height * 0.7;
      setHeight(targetHeight);
      setWidth((loadedDimensions.width / loadedDimensions.height) * targetHeight);
    } catch (e) {
      console.error('Device landmark load failed:', e);
      setFrames([]);
      setVideoDimensions({ width: CANVAS_WIDTH, height: CANVAS_HEIGHT });
    } finally {
      setLoading(false);
    }
  }

  /* LOAD FILES WHEN SOURCE MODE CHANGES
  ----------------------------------------------------------------------------*/
  useEffect(() => {
    if (showDeviceFiles) {
      chooseDeviceFolderAndLoad();
      return;
    }

    fetchFiles(
      setLoading,
      setLandmarkFiles,
      setSvgFiles,
      setFiles,
      setSelectedLandmarkFile,
      setSelectedSvgFile,
      setFrames,
      setSelectedSvgString
    );

    return () => {
      if (animationRef?.current) clearInterval(animationRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showDeviceFiles]);

  return (
    <View style={[styles.listWrapper, { backgroundColor: theme.listItemBackground }]}>
      <View style={[styles.listHeader, { backgroundColor: theme.listItemBackgroundPressed }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          LANDMARK FILES
        </Text>
      </View>

      {/* Landmark Files List */}
      <List
        items={landmarkFiles}
        selectedItem={selectedLandmarkFile}
        onSelect={handleSelectLandmarkFile}
        keyExtractor={(item) => item}
        itemStyle={{}}
        selectedItemStyle={{ backgroundColor: theme.actionButton }}
        listStyle={{}}
        renderItemContent={(item) => (
          <Text style={[styles.listItemText, { color: item === selectedLandmarkFile ? theme.actionButtonText : theme.text }]}>
            {item}
          </Text>
        )}
      />

      {selectedLandmarkFile && (
        <>
          <View style={[styles.listHeader, { backgroundColor: theme.listItemBackgroundPressed }]}>
            <Text style={[styles.headerTitle, { color: theme.text }]}>
              SVG IMAGE FILES
            </Text>
          </View>

          {/* SVG Files List */}
          <List
            items={svgFiles}
            selectedItem={selectedSvgFile}
            onSelect={handleSelectSvgFile}
            keyExtractor={(item) => item}
            itemStyle={{}}
            selectedItemStyle={{ backgroundColor: theme.actionButton }}
            renderItemContent={(item) => (
              <Text style={[styles.listItemText, { color: item === selectedSvgFile ? theme.actionButtonText : theme.text }]}>
                {item}
              </Text>
            )}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
    listWrapper: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'flex-start',
    },

    listHeader: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'flex-start',
        width: '100%',
        padding: 12,
    },

    headerTitle: {
        fontSize: 18, 
        fontWeight: 'bold',
    },

    list: {
        width: 320,
        maxHeight: '25vh',
        overflowY: 'auto',
        maxWidth: 320,
        flexShrink: 0,
        direction: 'rtl',
        scrollbarGutter: 'stable',

    },

    listItem: {
        paddingVertical: '1rem',
        paddingHorizontal: '1.5rem',
        cursor: 'pointer',
        
    },

    listItemText: {
    fontSize: 18,
    },

});