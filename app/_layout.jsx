import { StyleSheet, Button } from 'react-native'
import React from 'react'
import { Stack, useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'

const RootLayout = () => {
    const router = useRouter();

    // Home button component for the header
    const HomeButton = () => (
        <Button 
            title="Home" 
            style={styles.homeButton} 
            onPress={() => router.replace('/')} 
        />
    );

    return (
        <>
            <StatusBar style="auto"/>
            <Stack>
                <Stack.Screen name="index" options={{ title: 'Home' }}/>
                <Stack.Screen
                    name="imagePreview"
                    options={{
                        title: 'Image Preview',
                        headerRight: () => <HomeButton />,
                    }}
                />

                <Stack.Screen
                    name="camera"
                    options={{
                        title: 'Camera',
                        headerRight: () => <HomeButton />,
                    }}
                />

                <Stack.Screen
                    name="drawMobile"
                    options={{
                        title: 'Draw Mobile',
                        headerRight: () => <HomeButton />,
                    }}
                />

                <Stack.Screen
                    name="drawWeb"
                    options={{
                        title: 'Draw Web',
                        headerRight: () => <HomeButton />,
                    }}
                />
            </Stack>
        </>
    )
}

export default RootLayout

const styles = StyleSheet.create({
    homeButton: {
        marginRight: 20,
    },
})