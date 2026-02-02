import { StyleSheet, useColorScheme, Platform, Image, View} from 'react-native'
import React from 'react'
import { Link } from 'expo-router'
import ThemedView from '../components/themed_components/ThemedView';
import { Colors } from '../constants/Colors';
import LinkButton from '../components/button/LinkButton';
import { GiShamblingZombie } from "react-icons/gi";
import { GiSpellBook } from "react-icons/gi";

const Home = () => {

    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;
    
    
    return (
        <>
            <ThemedView 
            style={[
                styles.container, 
                { 
                    justifyContent: 'flex-start', 
                    paddingTop: Platform.OS === 'web' ? 80 : 40, 
                }
            ]}
            >
                {colorScheme === 'dark' ? (
                <img
                    src="icon-dark.png"
                    alt="App Icon"
                    style={{ width: "400px", height: "auto", marginBottom: 32 }}
                />
                ) : (
                <img
                    src="icon-light.png"
                    alt="App Icon"
                    style={{ width: "400px", height: "auto", marginBottom: 32 }}
                />
                )}
                <View style={{
                    display: 'flex',
                    flexWrap: 'wrap', 
                    flexDirection: 'row', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    gap: 20,
                    
                }}
                >
                    <LinkButton href="/sketchPage">
                        <GiShamblingZombie 
                        color={theme.actionButtonPressed}
                        size={32}
                        style={{ marginRight: 10 }}/>                    
                        SKETCH & ANIMATE
                    </LinkButton>
                    <LinkButton href="/viewSavedPoses">
                        <GiSpellBook 
                        color={theme.actionButtonPressed}
                        size={32}
                        style={{ marginRight: 10 }}/>
                        SAVED ANIMATIONS
                    </LinkButton>
                </View>
            </ThemedView>
        </>
    )
}

export default Home

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },

    link: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 24,
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
        width: 400,
        height: 64,
        textAlign: 'center',

    }
})