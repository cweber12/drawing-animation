import React, { useRef } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Signature from 'react-native-signature-canvas';

const { width, height } = Dimensions.get('window');

const DrawMobile = () => {
  const ref = useRef();

  const handleOK = (signature) => {
    // signature is a base64 encoded png
    console.log(signature);
  };

  return (
    <View style={styles.container}>
      <Signature
        ref={ref}
        onOK={handleOK}
        descriptionText="Draw here"
        clearText="Clear"
        confirmText="Save"
        webStyle={`.m-signature-pad {box-shadow: none; border: none; }`}
        autoClear={false}
        imageType="image/png"
        style={styles.signature}
      />
    </View>
  );
};

export default DrawMobile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signature: {
    width: width * 0.95,
    height: height * 0.7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
  },
});