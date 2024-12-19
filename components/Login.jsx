import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';

export default function Login() {
    const router = useRouter();
    
    return (
        <View style={{ flex: 1 }}>
            <Image
                source={require('./../assets/images/car2.jpg')}
                style={styles.image}
            />
            <View style={styles.container}>
                <Text style={styles.title}>Spare Gold</Text>
                <Text style={styles.description}>
                    Lorem ipsum dolor sit amet consectetur adipisicing elit. Iusto ea facere beatae aperiam excepturi assumenda doloribus suscipit unde facilis
                </Text>
                <TouchableOpacity style={styles.button}
                   onPress={()=>router.push('/auth/sign-in')}
                >
                    <Text style={styles.buttonText}>GET STARTED</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    image: {
        width: '100%',
        height: 400,
        resizeMode: 'cover', // Ensures the image covers the space
    },
    container: {
        backgroundColor: '#fff',
        marginTop: -20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    title: {
        fontSize: 55,
        fontFamily: 'outfit-bold', // Ensure the font is correctly loaded
        textAlign: 'center',
        marginBottom: 20,
    },
    description: {
        fontFamily: 'Outfit', // Ensure the font is loaded correctly
        fontSize: 20,
        textAlign: 'justify',
        letterSpacing: 0.5,
        marginBottom: 20,
        marginLeft: 20,
    },
    button: {
        padding: 16,
        backgroundColor: '#000000',
        borderRadius: 60,
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
