import { StyleSheet, Button } from 'react-native'
import React from 'react'
import { Stack, useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { View } from 'react-native-web'

const RootLayout = () => {
    const router = useRouter();

    // Home button component for the header
    const HomeButton = () => (
        <View style={{ marginRight: 10 }} >
            <Button title="Home" onPress={() => router.replace('/')}/>
        </View> 
    );

    return (
        <>
            <StatusBar style="auto"/>
            <Stack screenOptions={{ headerTitleAlign: 'center' }}>
                <Stack.Screen name="index" options={{ title: 'Home' }}/>
                
                <Stack.Screen
                    name="Animate Sketch"
                    options={{ 
                        title: '', 
                        headerRight: () => <HomeButton />,
                    }}
                />  
                
                <Stack.Screen
                    name="drawWeb"
                    options={{ 
                        title: 'Sketch', 
                        headerRight: () => <HomeButton />, 
                    }}
                />
                
                <Stack.Screen
                    name="savedDrawings"
                    options={{ 
                        title: 'Saved Sketches', 
                        headerRight: () => <HomeButton />, 
                    }}
                />

            </Stack>
        </>
    )
}

export default RootLayout

const styles = StyleSheet.create({
})