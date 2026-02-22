import { View, StyleSheet, Text, useColorScheme, TouchableOpacity } from 'react-native';
import React from 'react';
import { FaRotate } from "react-icons/fa6";
import HeaderButton from '../button/HeaderButton';
import { LuHardDriveUpload } from "react-icons/lu";
import { RiDownloadCloud2Line } from "react-icons/ri";
import { GiSkeletonInside } from "react-icons/gi";
import { MdDevices } from "react-icons/md";
import { IoMdCloudOutline } from "react-icons/io";
import { Colors } from '../../constants/Colors';

const ViewSavedButtons = ({
    onDeviceSelect,
    onCloudSelect,
    showDeviceFiles,
    onHoverTitle,
    title,
}) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;

    return (
      <View style={{...styles.container, borderLeft: `1px solid ${theme.border}`}}>
          {/* TOGGLE VIEW BUTTON -------------------------------------------------------*/}
          
          <HeaderButton
              onPress={onCloudSelect}
              onHoverTitle={onHoverTitle}
              title={title.toUpperCase()}
              disabled={!showDeviceFiles}

          >
            <IoMdCloudOutline
                size={24}
            />
          </HeaderButton>

          <HeaderButton
              onPress={onDeviceSelect}
              onHoverTitle={onHoverTitle}
              title={title.toUpperCase()}
              disabled={showDeviceFiles}
          >
            <MdDevices
                size={24}
            />
          </HeaderButton>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center', 
    justifyContent: 'center',
    gap: 12,
    padding: 12,
  },

  text: {
    fontSize: 18,
    marginRight: 10,
  },
});

export default ViewSavedButtons;