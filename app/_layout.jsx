import { StyleSheet, useColorScheme, TouchableOpacity, useWindowDimensions } from 'react-native'
import { Stack, useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { View } from 'react-native-web'
import { Colors } from '../constants/Colors'
import DrawWebHeaderButtons from '../components/controls/DrawWebHeaderButtons';
import DetectPoseButtons from '../components/controls/detectPoseButtons';
import { FaHome } from 'react-icons/fa';
import { getIconSize } from '../constants/Sizes';

/* Home Button in Header
------------------------------------------------------------------------------*/
const HomeButton = () => {
    const router = useRouter();
    const colorScheme = useColorScheme()
    const theme = Colors[colorScheme] ?? Colors.light

    return (
        <View style={{ marginRight: 24, flexShrink: 0 }}>
            <TouchableOpacity 
                onPress={() => router.replace('/')}
            >
                <FaHome size={getIconSize()} color={theme.button} />
            </TouchableOpacity>
        </View>
    );
};

const RootLayout = () => {
    // Get current color scheme and theme
    const colorScheme = useColorScheme()
    const theme = Colors[colorScheme] ?? Colors.light
    
    // Responsive layout based on screen width
    const { width } = useWindowDimensions();
    const isSmallScreen = width < 600;
    return (
        <>
            <StatusBar style="auto"/>
            <Stack screenOptions={{ 
                headerTitleAlign: isSmallScreen ? 'left' : 'center',
                headerStyle: { 
                    backgroundColor: theme.navBackground, 
                        borderBottomWidth: 0,
                        elevation: 0, // remove shadow on Android
                        shadowOpacity: 0, // remove shadow on iOS
                },
                headerTintColor: theme.title,
                headerTitleStyle: {
                    fontSize: isSmallScreen ? 20 : 32, 
                    fontWeight: 'bold', 
                },
                }}>
                <Stack.Screen name="index" options={{ title: 'Home' }}/>
                <Stack.Screen
                    name="detectPose"
                    options={({ route }) => ({
                        title: route.params?.viewMode === 'svg' ? 'Live Animation' : 'Create Animation',
                        headerRight: () => (
                            <>
                                <DetectPoseButtons
                                    viewMode={route.params?.viewMode}
                                    showPoseAnimation={route.params?.showPoseAnimation}
                                    onToggleWebcam={route.params?.onToggleWebcam} 
                                    onDetectionStarted={route.params?.onDetectionStarted}
                                    onDetectionStopped={route.params?.onDetectionStopped}
                                />
                                <HomeButton />
                            </>
                        ),
                    })}
                />  
                <Stack.Screen
                    name="sketchPage"
                    options={({ route }) => ({
                        title: 'Sketch',
                        headerRight: () => (
                            <>
                                <DrawWebHeaderButtons
                                    viewMode={route.params?.viewMode}
                                    onExportSvgs={route.params?.onExportSvgs}
                                    onClear={route.params?.onClear}
                                    onOpenCamera={route.params?.onOpenCamera}
                                    onShowBrushSizeSlider={route.params?.onShowBrushSizeSlider}
                                    onShowColorPicker={route.params?.onShowColorPicker}
                                    setPoseView={route.params?.setPoseView}
                                    setSvgView={route.params?.setSvgView}
                                    onPickVideo={route.params?.onPickVideo}
                                />
                                <HomeButton />
                            </>
                        ),
                    })}
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