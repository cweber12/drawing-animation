import { StyleSheet, Button, useColorScheme } from 'react-native'
import { Stack, useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { View } from 'react-native-web'
import { Colors } from '../constants/Colors'
import DrawWebHeaderButtons from '../components/DrawWebHeaderButtons';


const HomeButton = () => {

    const router = useRouter();

    return (
        <View style={{ marginRight: 10, flexShrink: 0 }}>
            <Button title="Home" onPress={() => router.replace('/')} />
        </View>
    );
};

const RootLayout = () => {
    const colorScheme = useColorScheme()
    const theme = Colors[colorScheme] ?? Colors.light
    
    return (
        <>
            <StatusBar style="auto"/>
            <Stack screenOptions={{ 
                headerTitleAlign: 'center',
                headerStyle: { 
                    backgroundColor: theme.navBackground, 
                        borderBottomWidth: 0,
                        elevation: 0, // remove shadow on Android
                        shadowOpacity: 0, // remove shadow on iOS
                },
                headerTintColor: theme.title,
                }}>
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
                    options={({ route }) => ({
                        title: 'Sketch',
                        headerRight: () => (
                            <>
                                <HomeButton />
                                <DrawWebHeaderButtons
                                    onClear={route.params?.onClear}
                                    onSave={route.params?.onSave}
                                    onOpenCamera={route.params?.onOpenCamera}
                                />
                            </>
                        ),
                    })}
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