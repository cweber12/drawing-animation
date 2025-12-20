import { StyleSheet} from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'

const RootLayout = () => {
  
    return (
        <>
            <StatusBar value="auto"/>
            <Stack>
                <Stack.Screen name="index" options={{ title: 'Home' }}/>
                <Stack.Screen name="imagePreview" options={{ title: 'Image Preview' }}/>
                <Stack.Screen name="draw" options={{ title: 'Draw' }}/>
                <Stack.Screen name="camera" options={{ title: 'Camera' }}/>
            </Stack>
        </>

    )
}

export default RootLayout

const styles = StyleSheet.create({

})