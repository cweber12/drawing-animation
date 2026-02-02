import React, { useState } from 'react'
import { 
    StyleSheet, 
    useColorScheme, 
    useWindowDimensions 
} from 'react-native'
import { Stack, useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { View } from 'react-native-web'
import { Colors } from '../constants/Colors'
import SketchButtons from '../components/button_group/SketchButtons';
import DetectPoseButtons from '../components/button_group/detectPoseButtons';
import { FaHouseDamage } from "react-icons/fa";
import HeaderButton from '../components/button/HeaderButton'

/* Home Button in Header
------------------------------------------------------------------------------*/
const HomeButton = () => {
    const router = useRouter();
    const colorScheme = useColorScheme()
    const theme = Colors[colorScheme] ?? Colors.light

    const [hoveredHome, setHoveredHome] = useState(false);

    return (
        <View style={{ marginRight: "2rem" }}>
            <HeaderButton  onPress={() => router.replace('/')} >
                <FaHouseDamage />
            </HeaderButton>
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
    const [headerTitle, setHeaderTitle] = useState('');
    return (
        <>
            <StatusBar style="auto"/>
            <Stack screenOptions={{ 
                headerTitleAlign: 'center',
                headerStyle: { 
                    backgroundColor: theme.background,
                    color: theme.title, 
                    borderBottomWidth: 0,
                    elevation: 0, // remove shadow on Android
                    shadowOpacity: 0, // remove shadow on iOS
                    height: isSmallScreen ? 60 : 80,
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
                                    onHoverTitle={(title) => setHeaderTitle(title)}
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
                                    setEraseMode={route.params?.setEraseMode}
                                    onShowSketchInfo={route.params?.onShowSketchInfo}
                                    onHoverTitle={(title) => setHeaderTitle(title)}
                                    onExportAll={route.params?.onExportAll}
                                    onShowDetectPoseOptions={route.params?.onShowDetectPoseOptions}
                                    svgData={route.params?.svgData}
                                    onHandleUploadSvg={route.params?.onHandleUploadSvg}
                                    onToggleSettings={route.params?.onToggleSettings}
                                />
                                <HomeButton />
                                
                            </>
                        ),
                    })}
                />
                <Stack.Screen 
                    name="viewSavedPoses" 
                    options={({ route }) => ({ 
                        title: 'Saved Content' ,
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