import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Switch, ScrollView, Alert } from 'react-native';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './../configs/FirebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export default function Profile() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const router = useRouter(); // Use expo-router for navigation

  // Check authentication status
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        Alert.alert('Authentication Required', 'Please log in to access your profile.', [
          { text: 'OK', onPress: () => router.replace('/auth/sign-in') }, // Redirect to sign-in page
        ]);
      }
    });

    // Load dark mode preference
    const loadDarkModePreference = async () => {
      const storedMode = await AsyncStorage.getItem('isDarkMode');
      if (storedMode !== null) {
        setIsDarkMode(JSON.parse(storedMode));
      }
    };
    loadDarkModePreference();

    return () => unsubscribe();
  }, [router]);

  // Handle dark mode toggle
  const toggleDarkMode = async () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    await AsyncStorage.setItem('isDarkMode', JSON.stringify(newMode));
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth); // Sign out the user
      setCurrentUser(null); // Clear the user state
      router.replace('/auth/sign-in'); // Navigate to Sign-In page after signing out
    } catch (error) {
      Alert.alert('Sign Out Error', error.message);
    }
  };

  const navigateToAccountSettings = () => {
    router.push('/accountsettings'); // Adjust this path based on where your Account Settings page is
  };

  if (!currentUser) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>You are not logged in.</Text>
        <TouchableOpacity style={styles.signOutButton} onPress={() => router.replace('/auth/sign-in')}>
          <Text style={styles.signOutButtonText}>Go to Sign-In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, isDarkMode ? styles.darkModeContainer : styles.lightModeContainer]}>
      <View style={styles.profileContainer}>
        {/* Profile Photo */}
        <Image
          source={{ uri: currentUser.photoURL || 'https://www.w3schools.com/w3images/avatar2.png' }} // Default photo if no profile picture is set
          style={styles.profileImage}
        />
        <Text style={styles.profileName}>{currentUser.displayName || 'User Name'}</Text>
        <Text style={styles.profileEmail}>{currentUser.email}</Text>

        {/* Dark Mode Toggle */}
        <View style={styles.darkModeSection}>
          <Text style={styles.darkModeText}>Dark Mode</Text>
          <Switch value={isDarkMode} onValueChange={toggleDarkMode} />
        </View>
      </View>

      <View style={styles.settingsContainer}>
        {/* Settings Section */}
        <TouchableOpacity style={styles.settingButton} onPress={navigateToAccountSettings}>
          <Text style={styles.settingButtonText}>Account Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingButton}>
          <Text style={styles.settingButtonText}>Privacy Settings</Text>
        </TouchableOpacity>
      </View>

      {/* Sign Out Button */}
      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutButtonText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  profileContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 15,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#ccc',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  profileEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  darkModeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  darkModeText: {
    fontSize: 18,
    color: '#333',
    marginRight: 10,
  },
  lightModeContainer: {
    backgroundColor: '#f0f0f0',
  },
  darkModeContainer: {
    backgroundColor: '#333',
  },
  settingsContainer: {
    marginTop: 30,
  },
  settingButton: {
    backgroundColor: '#f4f4f4',
    paddingVertical: 15,
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  settingButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },
  signOutButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 5,
    marginTop: 20,
  },
  signOutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
    marginVertical: 10,
  },
});
