import React, { useState } from 'react'
import { 
    StyleSheet, 
    useColorScheme, 
    TouchableOpacity, 
    useWindowDimensions 
} from 'react-native'
import { Stack, useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { View } from 'react-native-web'
import { Colors } from '../constants/Colors'
import SketchButtons from '../components/controls/SketchButtons';
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
        <View style={{ marginHorizontal: 24, flexShrink: 0}}>
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
    const [headerTitle, setHeaderTitle] = useState('Sketch');
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
                    fontSize: isSmallScreen ? 20 : 24, 
                   
                },
                }}>
                <Stack.Screen name="index" options={{ title: '' }}/>
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
                                    onShowPoseInfo={route.params?.onShowPoseInfo}
                                    savedLandmarks={route.params?.estimatedLandmarks}
                                    isDetecting={route.params?.isDetecting}
                                />
                                <HomeButton />                               
                            </>
                        ),
                    })}
                />  
                <Stack.Screen
                    name="sketchPage"
                    options={({ route }) => ({
                        title: headerTitle,
                        headerRight: () => (
                            <>       
                                <SketchButtons
                                    eraseMode={route.params?.eraseMode}
                                    strokeColor={route.params?.strokeColor}
                                    onClear={route.params?.onClear}
                                    onToggleErase={route.params?.onToggleErase}
                                    onShowBrushSizeSlider={route.params?.onShowBrushSizeSlider}
                                    onShowColorPicker={route.params?.onShowColorPicker}
                                    onShowSketchInfo={route.params?.onShowSketchInfo}
                                    onHoverTitle={(title) => setHeaderTitle(title)}
                                    onExportAll={route.params?.onExportAll}
                                    onShowDetectPoseOptions={route.params?.onShowDetectPoseOptions}
                                    svgData={route.params?.svgData}
                                    onHandleUpload={route.params?.onHandleUpload}
                                />
                                <HomeButton />
                                
                            </>
                        ),
                    })}
                />
                <Stack.Screen 
                    name="viewSavedPoses" 
                    options={({ route }) => ({ 
                        title: 'Saved Poses' ,
                        headerRight: () => (
                        <HomeButton />
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