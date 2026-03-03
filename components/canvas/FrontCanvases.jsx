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

export default function FrontCanvases({
  styles,
  canvasProps,
  sizes,
  armsDown,
  showBackCanvases,
  refs,
  onStrokeEnd,
}) {
  return (
    <ThemedView style={[styles.container, { zIndex: !showBackCanvases ? 1 : -1 }]}>
      <Head
        canvasProps={canvasProps}
        canvasId="head"
        headRef={refs.head}
        headSize={sizes.HEAD_SIZE}
        onStrokeEnd={onStrokeEnd("head")}
      />

      <View style={styles.column}>
        <View style={styles.row}>
          <RightArm
            canvasProps={canvasProps}
            upperArmId="rightUpperArm"
            lowerArmId="rightLowerArm"
            handId="rightHand"
            upperArmRef={refs.rightUpperArm}
            lowerArmRef={refs.rightLowerArm}
            handRef={refs.rightHand}
            armWidth={sizes.ARM_WIDTH}
            armLength={sizes.ARM_LENGTH}
            handWidth={sizes.HAND_WIDTH}
            handLength={sizes.HAND_LENGTH}
            armsDown={armsDown}
            // IMPORTANT: ensure RightArm forwards these to each internal canvas
            onUpperStrokeEnd={onStrokeEnd("rightUpperArm")}
            onLowerStrokeEnd={onStrokeEnd("rightLowerArm")}
            onHandStrokeEnd={onStrokeEnd("rightHand")}
          />

          <View style={styles.column}>
            <Torso
              canvasProps={canvasProps}
              torsoId="torso"
              torsoRef={refs.torso}
              torsoWidth={sizes.TORSO_WIDTH}
              torsoHeight={sizes.TORSO_HEIGHT}
              onStrokeEnd={onStrokeEnd("torso")}
            />

            <Legs
              canvasProps={canvasProps}
              leftUpperLegId="leftUpperLeg"
              rightUpperLegId="rightUpperLeg"
              rightLowerLegId="rightLowerLeg"
              leftLowerLegId="leftLowerLeg"
              rightUpperLegRef={refs.rightUpperLeg}
              rightLowerLegRef={refs.rightLowerLeg}
              leftUpperLegRef={refs.leftUpperLeg}
              leftLowerLegRef={refs.leftLowerLeg}
              legWidth={sizes.LEG_WIDTH}
              legLength={sizes.LEG_LENGTH}
              thighLength={sizes.THIGH_LENGTH}
              calfLength={sizes.CALF_LENGTH}
              onLeftUpperStrokeEnd={onStrokeEnd("leftUpperLeg")}
              onLeftLowerStrokeEnd={onStrokeEnd("leftLowerLeg")}
              onRightUpperStrokeEnd={onStrokeEnd("rightUpperLeg")}
              onRightLowerStrokeEnd={onStrokeEnd("rightLowerLeg")}
            />

            <View style={styles.row}>
              <RightFoot
                canvasProps={canvasProps}
                rightFootId="rightFoot"
                rightFootRef={refs.rightFoot}
                footWidth={sizes.FOOT_WIDTH}
                footLength={sizes.FOOT_LENGTH}
                onStrokeEnd={onStrokeEnd("rightFoot")}
              />
              <LeftFoot
                canvasProps={canvasProps}
                leftFootId="leftFoot"
                leftFootRef={refs.leftFoot}
                footWidth={sizes.FOOT_WIDTH}
                footLength={sizes.FOOT_LENGTH}
                onStrokeEnd={onStrokeEnd("leftFoot")}
              />
            </View>
          </View>

          <LeftArm
            canvasProps={canvasProps}
            upperArmId="leftUpperArm"
            lowerArmId="leftLowerArm"
            handId="leftHand"
            upperArmRef={refs.leftUpperArm}
            lowerArmRef={refs.leftLowerArm}
            handRef={refs.leftHand}
            armWidth={sizes.ARM_WIDTH}
            armLength={sizes.ARM_LENGTH}
            handWidth={sizes.HAND_WIDTH}
            handLength={sizes.HAND_LENGTH}
            armsDown={armsDown}
            onUpperStrokeEnd={onStrokeEnd("leftUpperArm")}
            onLowerStrokeEnd={onStrokeEnd("leftLowerArm")}
            onHandStrokeEnd={onStrokeEnd("leftHand")}
          />
        </View>
      </View>
    </ThemedView>
  );
}