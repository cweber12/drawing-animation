import { StyleSheet, Text, View, Image, Dimensions } from 'react-native'
import React from 'react'
import { Link, useLocalSearchParams } from 'expo-router'

const { width, height } = Dimensions.get('window');

const ImagePreview = () => {
  const { uri } = useLocalSearchParams();

  return (
    <View style={styles.container}>
        <Link href="/" style={{ fontSize: 18, color: 'blue' }}>Go Back</Link>   
        {uri ? (
            <Image source={{ uri }} style={styles.image} resizeMode="contain" />
        ) : (
            <Text>No image selected.</Text>
        )}
    </View>
  )
}

export default ImagePreview

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  
  image: {
    width: width * 0.9,
    height: height * 0.9,
    marginTop: 20,
    borderRadius: 10,
    backgroundColor: '#eee',
  },
})