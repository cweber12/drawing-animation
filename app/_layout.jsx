import { StyleSheet, Button, Text, useColorScheme, TouchableOpacity } from 'react-native'
import { Stack, useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { View } from 'react-native-web'
import { Colors } from '../constants/Colors'
import DrawWebHeaderButtons from '../components/DrawWebHeaderButtons';



const HomeButton = () => {
    const router = useRouter();
    const colorScheme = useColorScheme()
    const theme = Colors[colorScheme] ?? Colors.light

    return (
        <View style={{ marginRight: 24, flexShrink: 0 }}>
            <TouchableOpacity 
                style={[styles.button, { backgroundColor: theme.button }]} 
                onPress={() => router.replace('/')}
            >
                <Text style={[styles.buttonText, { color: theme.buttonText }]}>
                    Home
                </Text>
            </TouchableOpacity>
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
                headerTitleStyle: {
                    fontSize: 32, 
                    fontWeight: 'bold', 
                },
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
                                <DrawWebHeaderButtons
                                    onClear={route.params?.onClear}
                                    onSave={route.params?.onSave}
                                    onOpenCamera={route.params?.onOpenCamera}
                                />
                                <HomeButton />
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
    button: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginHorizontal: 2,
  },

  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
})