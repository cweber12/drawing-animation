import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const Draw = () => {
  return (
    <View style={styles.container}>
      <Text>Draw</Text>
    </View>
  )
}

export default Draw

const styles = StyleSheet.create({
        container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },

    link: {
        fontSize: 20,
        color: 'white',
        padding: 10,
        backgroundColor: '#007AFF',
        borderRadius: 5,

    }
})