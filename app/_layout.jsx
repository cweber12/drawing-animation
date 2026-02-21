import React, { useState } from 'react'
import { 
    useColorScheme,  
    useWindowDimensions, 
    Image, 
    TouchableOpacity, 
    Text, 
    View 
} from 'react-native'
import { Stack, useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { Colors } from '../constants/Colors'
import DetectPoseButtons from '../components/button_group/detectPoseButtons';
import ViewSavedButtons from '../components/button_group/ViewSavedButtons';
import { ShiftFactorsProvider } from '../context/ShiftFactorsContext'
import { ScaleFactorsProvider } from '../context/ScaleFactorsContext'
import { LandmarksProvider } from '../context/LandmarksContext';
import SketchHeaderButtons from '../components/button_group/SketchHeaderButtons'
import LinkButton from '../components/button/LinkButton';
import { MdOutlineCollections } from "react-icons/md";
import { FaRegPenToSquare } from "react-icons/fa6";


/* Home Button in Header
------------------------------------------------------------------------------*/
const HomeButton = () => {
    const router = useRouter();
    const [hoveredHome, setHoveredHome] = useState(false);
    
    const logoHeight = 48; // Adjust logo size based on screen width
    const logoSource = require("../assets/favicon.png");

    return (
        <View >
            <TouchableOpacity  onPress={() => router.replace('/')} >
                <Image
                        source={logoSource}
                        style={{ 
                            width: logoHeight * (2), 
                            height: logoHeight, 

                        }}
                        resizeMode="contain"
                    />
            </TouchableOpacity>
        </View>
    );
};

/* Root Layout with Themed Header and Navigation
------------------------------------------------------------------------------*/
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
        <ShiftFactorsProvider>
        <ScaleFactorsProvider>
        <LandmarksProvider>
            <StatusBar style="auto"/>
            <Stack screenOptions={{ 
                headerTitleAlign: 'center',
                headerStyle: { 
                    backgroundColor: theme.navBackground,
                    borderBottomWidth: 0,
                    elevation: 0, // remove shadow on Android
                    shadowOpacity: 0, // remove shadow on iOS
                    height: isSmallScreen ? 52 : 68,
                },
                headerTintColor: theme.title,
                headerTitleStyle: {
                    fontSize: isSmallScreen ? 20 : 32, 
                    fontFamily: 'Segoe UI',
                },
                }}>
                <Stack.Screen 
                    name="index" 
                    options={{ title: 'Living Sketch', 
                    headerLeft: () => (
                        <View 
                            style={{
                                display: 'flex',
                                flexWrap: 'wrap', 
                                flexDirection: 'row', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                gap: 20,
                                marginLeft: 24,    
                            }}
                            >
                                <LinkButton  href="/sketch" >
                                    <FaRegPenToSquare
                                        size={24}
                                        
                                    />
                                    <Text 
                                        style={{ 
                                            color: theme.buttonText,
                                            fontSize: 24, 
                                            fontFamily: 'Segoe UI', }}>
                                        SKETCH
                                    </Text>
                                </LinkButton>
            
                                <LinkButton href="/library" >
                                    <MdOutlineCollections
                                        size={24}
                                    />
                                    <Text 
                                        style={{ 
                                            color: theme.buttonText, 
                                            fontSize: 24, 
                                            fontFamily: 'Segoe UI', }}>
                                        COLLECTION
                                        </Text>
                                </LinkButton>
                            </View>
                        ),
                    }}
                />
                <Stack.Screen
                    name="detect"
                    options={({ route }) => ({
                        title: route.params?.viewMode === 'svg' ? 'Live Animation' : 'Create Animation',
                        headerLeft: () => ( 
                            <>
                                <HomeButton />
                                <DetectPoseButtons
                                    viewMode={route.params?.viewMode}
                                    showPoseAnimation={route.params?.showPoseAnimation}
                                    onToggleWebcam={route.params?.onToggleWebcam} 
                                    onDetectionStarted={route.params?.onDetectionStarted}
                                    onDetectionStopped={route.params?.onDetectionStopped}
                                    onShowPoseInfo={route.params?.onShowPoseInfo}
                                    savedLandmarks={route.params?.savedLandmarks}
                                    isDetecting={route.params?.isDetecting}
                                    onHoverTitle={(title) => setHeaderTitle(title)}
                                    onToggleExportOptions={route.params?.onToggleExportOptions} />
                            </> 
                        ),
                    })}
                />  
                <Stack.Screen
                    name="sketch"
                    options={({ route }) => ({
                        title: headerTitle,
                        headerLeft: () => (
                            <>
                                <HomeButton />
                                <SketchHeaderButtons
                                    onShowSketchInfo={route.params?.onShowSketchInfo}
                                    onShowDetectPoseOptions={route.params?.onShowDetectPoseOptions}
                                    onToggleExportOptions={route.params?.onToggleExportOptions}
                                    onToggleBackCanvases={route.params?.onToggleBackCanvases}
                                    showBackCanvases={route.params?.showBackCanvases}
                                />
                            </>
                         ),                     
                    })}
                />
                <Stack.Screen 
                    name="library" 
                    options={({ route }) => ({ 
                        title: '' ,
                        headerLeft: () => (   
                            <>   
                                <HomeButton />                 
                                <ViewSavedButtons

                                    onDeviceSelect={route.params?.onDeviceSelect}
                                    onCloudSelect={route.params?.onCloudSelect}
                                    showDeviceFiles={route.params?.showDeviceFiles}
                                    onHoverTitle={(title) => setHeaderTitle(title)}
                                    title={route.params?.title || 'Saved Animations'}
                                    debugAnchors={route.params?.debugAnchors}
                                    onToggleDebugAnchors={route.params?.onToggleDebugAnchors}
                                     />     
                
                            </>
                            ),
               
                    })}

                />
            </Stack>
        </LandmarksProvider>
        </ScaleFactorsProvider>
        </ShiftFactorsProvider>
        </>
    )
}

export default RootLayout