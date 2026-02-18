import { View, StyleSheet, Text, useColorScheme, TouchableOpacity } from 'react-native';
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
  const [hovered, setHovered] = React.useState(false);
  const buttonStyle = {
    ...styles.button,
    backgroundColor: hovered ? theme.blueHovered : theme.blue,
  };

    return (
    <View style={styles.container}>
        {/* TOGGLE VIEW BUTTON -------------------------------------------------------*/}
        
        <TouchableOpacity
            style={buttonStyle}
            onPress={onSetShowDeviceFiles}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onHoverTitle={onHoverTitle}
            title={title.toUpperCase()}
        >
        {showDeviceFiles ? (
            <RiDownloadCloud2Line
                size={24}
            />
        ) : (
            <LuHardDriveUpload
                size={24}
            />
        )}
        
        {showDeviceFiles ? (
            <Text style={[styles.text, {color: theme.listItemBackgroundPressed}]}>Load from Cloud</Text>
        ) : (
            <Text style={[styles.text, {color: theme.listItemBackgroundPressed}]}>Load from Device</Text>
        )}
        </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginLeft: 24,
  },

  button: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,

  },

  text: {
    fontSize: 18,
    marginRight: 10,
  },
});

export default ViewSavedButtons;