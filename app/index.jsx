import { StyleSheet, Text, View, Button, Image } from 'react-native'
import React from 'react'
import { Link, useRouter } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'

const Home = () => {
    const router = useRouter();

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: false,
            quality: 1,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            const imageUri = result.assets[0].uri;
            router.push({ pathname: '/imagePreview', params: { uri: imageUri } });
        }
    };

    return (
        <View style={styles.container}>
            <Link href="/drawMobile" style={styles.link}>Draw Mobile</Link>
            <Link href="/drawWeb" style={styles.link}>Draw Web</Link>
            <Link href="/camera" style={styles.link}>Open Camera</Link>
            <Button title="Upload Image" onPress={pickImage} />
        </View>
    )
}

export default Home

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    link: {
        fontSize: 20,
        color: 'white',
        padding: 10,
        backgroundColor: '#007AFF',
        borderRadius: 5,
        marginBottom: 10,
        width: '40%',
        textAlign: 'center',
    }
})