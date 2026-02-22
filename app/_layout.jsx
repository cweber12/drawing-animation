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
import DetectHeaderIcons from '../components/button_group/DetectHeaderIcons';
import ViewSavedButtons from '../components/button_group/ViewSavedButtons';
import { ShiftFactorsProvider } from '../context/ShiftFactorsContext'
import { ScaleFactorsProvider } from '../context/ScaleFactorsContext'
import { LandmarksProvider } from '../context/LandmarksContext';
import SketchHeaderButtons from '../components/button_group/SketchHeaderButtons'
import LinkButton from '../components/button/LinkButton';
import { MdOutlineCollections } from "react-icons/md";
import { FaRegPenToSquare } from "react-icons/fa6";
import LibraryToolButtons from '../components/button_group/LibraryToolButtons'
import { RiBodyScanFill } from "react-icons/ri";


/* Home Button in Header
------------------------------------------------------------------------------*/
const HomeButton = () => {
    const router = useRouter();
    const [hoveredHome, setHoveredHome] = useState(false);
    
    const logoHeight = 48; // Adjust logo size based on screen width
    const logoSource = require("../assets/favicon.png");

    return (
        <View style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
            width: logoHeight * 2.5, // Ensure enough space for the logo and hover effect
        }}         >
            <TouchableOpacity  
                onPress={() => router.replace('/')}
                onMouseEnter={() => setHoveredHome(true)}
                onMouseLeave={() => setHoveredHome(false)}
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',                   
                }}
                 >
                <Image
                    source={logoSource}
                    style={{ 
                        width: hoveredHome ? logoHeight * 2.4 : logoHeight * 2, 
                        height: hoveredHome ? logoHeight * 1.2 : logoHeight, 
                        transition: 'width 0.3s, height 0.3s',
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
                    borderBottomWidth: 1,
                    borderBottomColor: theme.border,
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
                    options={{ title: 'LIVING SKETCH', 
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
                                    <FaRegPenToSquare size={24} />
                                    <Text 
                                        style={{ 
                                            color: theme.buttonText,
                                            fontSize: 24, 
                                            fontFamily: 'Segoe UI', }}>
                                        SKETCH
                                    </Text>
                                </LinkButton>

                                <LinkButton  href="/detect" >
                                    <RiBodyScanFill size={24} />
                                    <Text 
                                        style={{ 
                                            color: theme.buttonText,
                                            fontSize: 24, 
                                            fontFamily: 'Segoe UI', }}>
                                        DETECT
                                    </Text>
                                </LinkButton>
            
                                <LinkButton href="/library" >
                                    <MdOutlineCollections size={24}/>
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
                                <DetectHeaderIcons
                                    viewMode={route.params?.viewMode}
                                    showPoseAnimation={route.params?.showPoseAnimation}
                                    onToggleWebcam={route.params?.onToggleWebcam} 
                                    onToggleDetectOptions={route.params?.onToggleDetectOptions}
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
                                     />     
                
                            </>
                        ),
                        headerRight: () => (
                            <LibraryToolButtons
                                debugAnchors={route.params?.debugAnchors}
                                onToggleDebugAnchors={route.params?.onToggleDebugAnchors}
                                showShiftControls={route.params?.showShiftControls}
                                onToggleShiftControls={route.params?.onToggleShiftControls}
                                showScaleControls={route.params?.showScaleControls}
                                onToggleScaleControls={route.params?.onToggleScaleControls}
                             />
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