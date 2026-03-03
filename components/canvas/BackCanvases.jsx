import React from "react";
import { View } from "react-native";
import ThemedView from "../view/ThemedView";

import Head from "./body_parts/Head";
import RightArm from "./body_parts/RightArm";
import LeftArm from "./body_parts/LeftArm";
import Torso from "./body_parts/Torso";
import Legs from "./body_parts/Legs";
import RightFoot from "./body_parts/RightFoot";
import LeftFoot from "./body_parts/LeftFoot";

export default function BackCanvases({
  styles,
  canvasProps,
  sizes,
  armsDown,
  showBackCanvases,
  refs,
  onStrokeEnd,
}) {
  return (
    <ThemedView style={[styles.container, { zIndex: showBackCanvases ? 1 : -1 }]}>
      <Head
        canvasProps={canvasProps}
        canvasId="headBack"
        headRef={refs.headBack}
        headSize={sizes.HEAD_SIZE}
        onStrokeEnd={onStrokeEnd("headBack")}
      />

      <View style={styles.column}>
        <View style={styles.row}>
          <RightArm
            canvasProps={canvasProps}
            upperArmId="rightUpperArmBack"
            lowerArmId="rightLowerArmBack"
            handId="rightHandBack"
            upperArmRef={refs.rightUpperArmBack}
            lowerArmRef={refs.rightLowerArmBack}
            handRef={refs.rightHandBack}
            armWidth={sizes.ARM_WIDTH}
            armLength={sizes.ARM_LENGTH}
            handWidth={sizes.HAND_WIDTH}
            handLength={sizes.HAND_LENGTH}
            armsDown={armsDown}
            // IMPORTANT: ensure RightArm forwards these to each internal canvas
            onUpperStrokeEnd={onStrokeEnd("rightUpperArmBack")}
            onLowerStrokeEnd={onStrokeEnd("rightLowerArmBack")}
            onHandStrokeEnd={onStrokeEnd("rightHandBack")}
          />

          <View style={styles.column}>
            <Torso
              canvasProps={canvasProps}
              torsoId="torsoBack"
              torsoRef={refs.torsoBack}
              torsoWidth={sizes.TORSO_WIDTH}
              torsoHeight={sizes.TORSO_HEIGHT}
              onStrokeEnd={onStrokeEnd("torsoBack")}
            />

            <Legs
              canvasProps={canvasProps}
              leftUpperLegId="leftUpperLegBack"
              rightUpperLegId="rightUpperLegBack"
              rightLowerLegId="rightLowerLegBack"
              leftLowerLegId="leftLowerLegBack"
              rightUpperLegRef={refs.rightUpperLegBack}
              rightLowerLegRef={refs.rightLowerLegBack}
              leftUpperLegRef={refs.leftUpperLegBack}
              leftLowerLegRef={refs.leftLowerLegBack}
              legWidth={sizes.LEG_WIDTH}
              legLength={sizes.LEG_LENGTH}
              thighLength={sizes.THIGH_LENGTH}
              calfLength={sizes.CALF_LENGTH}
              onLeftUpperStrokeEnd={onStrokeEnd("leftUpperLegBack")}
              onLeftLowerStrokeEnd={onStrokeEnd("leftLowerLegBack")}
              onRightUpperStrokeEnd={onStrokeEnd("rightUpperLegBack")}
              onRightLowerStrokeEnd={onStrokeEnd("rightLowerLegBack")}
            />

            <View style={styles.row}>
              <RightFoot
                canvasProps={canvasProps}
                rightFootId="rightFootBack"
                rightFootRef={refs.rightFootBack}
                footWidth={sizes.FOOT_WIDTH}
                footLength={sizes.FOOT_LENGTH}
                onStrokeEnd={onStrokeEnd("rightFootBack")}
              />
              <LeftFoot
                canvasProps={canvasProps}
                leftFootId="leftFootBack"
                leftFootRef={refs.leftFootBack}
                footWidth={sizes.FOOT_WIDTH}
                footLength={sizes.FOOT_LENGTH}
                onStrokeEnd={onStrokeEnd("leftFootBack")}
              />
            </View>
          </View>

          <LeftArm
            canvasProps={canvasProps}
            upperArmId="leftUpperArmBack"
            lowerArmId="leftLowerArmBack"
            handId="leftHandBack"
            upperArmRef={refs.leftUpperArmBack}
            lowerArmRef={refs.leftLowerArmBack}
            handRef={refs.leftHandBack}
            armWidth={sizes.ARM_WIDTH}
            armLength={sizes.ARM_LENGTH}
            handWidth={sizes.HAND_WIDTH}
            handLength={sizes.HAND_LENGTH}
            armsDown={armsDown}
            onUpperStrokeEnd={onStrokeEnd("leftUpperArmBack")}
            onLowerStrokeEnd={onStrokeEnd("leftLowerArmBack")}
            onHandStrokeEnd={onStrokeEnd("leftHandBack")}
          />
        </View>
      </View>
    </ThemedView>
  );
}