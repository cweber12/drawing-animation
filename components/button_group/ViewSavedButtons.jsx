import { View, StyleSheet, Text, useColorScheme } from 'react-native';
import React from 'react';
import { FaRotate } from "react-icons/fa6";
import HeaderButton from '../button/HeaderButton';
import { LuHardDriveUpload } from "react-icons/lu";
import { RiDownloadCloud2Line } from "react-icons/ri";
import { Colors } from '../../constants/Colors';

const ViewSavedButtons = ({
    showDeviceFiles,
    onSetShowDeviceFiles,
    onHoverTitle,
    title,
}) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;

    return (
    <View style={styles.container}>
        {/* TOGGLE VIEW BUTTON -------------------------------------------------------*/}
        {showDeviceFiles ? (
            <Text style={[styles.text, {color: theme.text}]}>Load Examples</Text>
        ) : (
            <Text style={[styles.text, {color: theme.text}]}>Load from Device</Text>
        )}
        <HeaderButton
        style={{ marginRight: 20 }}
        onPress={onSetShowDeviceFiles}
        onHoverTitle={onHoverTitle}
        title={title.toUpperCase()}
        >
        {showDeviceFiles ? (
            <RiDownloadCloud2Line
                size={32}
            />
        ) : (
            <LuHardDriveUpload
                size={32}
            />
        )}
        </HeaderButton>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 10,
    marginLeft: 20,
  },

  text: {
    fontSize: 18,
    marginRight: 10,
  },
});

export default ViewSavedButtons;