import { StyleSheet, Text, View, useColorScheme  } from 'react-native'
import React from 'react'
import { Colors } from '../constants/Colors'

// TODO: Implement so background of canvas matches light/dark mode
// - light mode: background light, stroke dark
// - dark mode: background dark, stroke light
const ThemedCanvasWrapper = () => {
    const colorScheme = useColorScheme()
    const theme = Colors[colorScheme] ?? Colors.light

    return (
        <View>
        <Text>ThemedCanvas</Text>
        </View>
    )
}

export default ThemedCanvasWrapper

const styles = StyleSheet.create({})