import { 
    useColorScheme, 
    Platform, 
    View, 
    Text, 
    Image
} from 'react-native'
import React from 'react'
import ThemedView from '../components/view/ThemedView';
import { Colors } from '../constants/Colors';
import LinkButton from '../components/button/LinkButton';
import { GiRaiseZombie } from "react-icons/gi";
import { GiSpellBook } from "react-icons/gi";
import { GiSkeletonInside } from "react-icons/gi";
import { FaFolderOpen } from "react-icons/fa";

const Home = () => {

    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;

    const logoSource =
    colorScheme === "dark"
      ? require("../assets/icon-dark.png")
      : require("../assets/icon-light.png");

    
    return (
        <>     
            <ThemedView 
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                    justifyContent: 'flex-start', 
                    paddingTop: Platform.OS === 'web' ? 80 : 40, 
            
                }}
            >
                <Image
                    source={logoSource}
                    style={{ width: 400, height: 300 }}
                    resizeMode="contain"
                />
                <View style={{
                    display: 'flex',
                    flexWrap: 'wrap', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    gap: 20,    
                }}
                >
                    <LinkButton  href="/sketchPage" >
                        
                        <Text 
                        style={{ 
                            color: theme.buttonText, 
                            fontSize: 24, 
                            fontFamily: 'Segoe UI', }}>
                                SKETCH & ANIMATE</Text>
                    </LinkButton>

                    <LinkButton href="/viewSavedPoses" >
                        
                        <Text 
                            style={{ 
                                color: theme.buttonText, 
                                fontSize: 24, 
                                fontFamily: 'Segoe UI', }}>
                            SAVED ANIMATIONS</Text>
                    </LinkButton>
                </View>
            </ThemedView>
        </>
    )
}

export default Home