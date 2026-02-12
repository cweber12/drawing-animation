import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  FlatList,
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
    <View style={styles.listWrapper}>
      <View style={styles.listHeader}>
        <GiSkeleton
          size={50}
          color={theme.actionButton}
          style={{ marginRight: '1rem' }}
        />
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: theme.text }}>
          Animation Files
        </Text>
      </View>

      {/* Landmark Files List */}
      <FlatList
        style={[
          styles.list,
          {
            borderTop: `1px solid ${theme.border}`,
            borderRight: `1px solid ${theme.border}`,
            borderLeft: `1px solid ${theme.border}`,
            marginBottom: '2rem',
          },
        ]}
        data={landmarkFiles}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <DropdownSelect onPress={() => handleSelectLandmarkFile(item)}>
            <Text
              style={[
                styles.listItemText,
                { color: item === selectedLandmarkFile ? theme.actionButton : theme.text },
              ]}
            >
              {item}
            </Text>
          </DropdownSelect>
        )}
      />

      {selectedLandmarkFile && (
        <>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'flex-start',
              marginBottom: '1rem',
              paddingBottom: '0.2rem',
            }}
          >
            <BsPersonRaisedHand
              size={50}
              color={theme.actionButton}
              style={{ marginRight: '1rem' }}
            />
            <Text
              style={{
                fontSize: 24,
                fontWeight: 'bold',
                color: theme.text,
                marginBottom: 0,
              }}
            >
              Sketches
            </Text>
          </View>

          {/* SVG Files List */}
          <FlatList
            style={[
              styles.list,
              {
                borderTop: `1px solid ${theme.border}`,
                borderRight: `1px solid ${theme.border}`,
                borderLeft: `1px solid ${theme.border}`,
                marginBottom: 20,
              },
            ]}
            data={svgFiles}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.listItem,
                  item === selectedSvgFile && styles.selectedListItem,
                  { borderBottom: `1px solid ${theme.border}` },
                ]}
                onPress={() => handleSelectSvgFile(item)}
                onMouseEnter={(e) => {
                  if (e?.target?.style) e.target.style.backgroundColor = theme.border;
                }}
                onMouseLeave={(e) => {
                  if (e?.target?.style) e.target.style.backgroundColor = 'transparent';
                }}
              >
                <Text
                  style={[
                    styles.listItemText,
                    { color: item === selectedSvgFile ? theme.actionButton : theme.text },
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
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
    gap: '1rem',
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    marginBottom: '1rem',
    paddingBottom: '0.2rem',
  },
  list: {
    width: 320,
    maxHeight: '25vh',
    overflowY: 'auto',
    maxWidth: 320,
    flexShrink: 0,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  listItem: {
    paddingVertical: '1rem',
    paddingHorizontal: '1.5rem',
    cursor: 'pointer',
  },
  listItemText: {
    fontSize: 18,
  },
  selectedListItem: {
    backgroundColor: '#e6f0ff',
  },
});