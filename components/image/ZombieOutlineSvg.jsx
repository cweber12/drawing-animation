import React from "react";
import Svg, { Path, G } from "react-native-svg";

export default function ZombieOutlineSvg({ width, height, opacity = 0.12 }) {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 1280 1000"
      preserveAspectRatio="xMidYMid meet"
    >
      <G opacity={opacity}>
        <Path
          d="M 861.00 977.50 L 859.00 977.50 ... 861.00 977.50 Z"
          fill="none"
          stroke="black"
          strokeWidth={2}
        />
      </G>
    </Svg>
  );
}