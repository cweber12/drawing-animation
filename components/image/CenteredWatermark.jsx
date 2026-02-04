import React from "react";
import { View, StyleSheet } from "react-native";
import ZombieOutlineSvg from "./ZombieOutlineSvg";
import { getSvgSizes } from "../../constants/Sizes";

export default function CenteredWatermark({ width, height }) {
    const svgSizes = getSvgSizes(height);
    return (
        <View pointerEvents="none" 
            style={styles.overlay}>
            <ZombieOutlineSvg width={width} height={height} opacity={1} />
        </View>
    );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2, // behind
  },
});