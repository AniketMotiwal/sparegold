import { View, Text, Image, TouchableOpacity } from 'react-native';
import React from 'react';
import { Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        headerShown: true, // Show the header to include back functionality
        headerStyle: { backgroundColor: '#fff' },
        headerTitleStyle: { fontWeight: 'bold' },
        headerBackVisible: false, // Hide the default back button
        tabBarActiveTintColor: '#007AFF',
        tabBarStyle: { display: 'flex' },
      }}
    >
      <Tabs.Screen
        name="companies"
        options={{
          headerTitle: 'Companies',
          tabBarIcon: () => (
            <Image
              source={require('../../assets/images/brand.png')}
              style={{ width: 24, height: 24 }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="models"
        options={{
          headerTitle: 'Models',
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.push('/companies')} // Navigate to the 'companies' tab
              style={{ marginLeft: 10 }}
            >
              <Ionicons name="arrow-back" size={24} color="#007AFF" />
            </TouchableOpacity>
          ),
          tabBarIcon: () => (
            <Image
              source={require('../../assets/images/models.png')}
              style={{ width: 24, height: 24 }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="spareparts"
        options={{
          headerTitle: 'Spare Parts',
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.push('/models')} // Navigate to the 'models' tab
              style={{ marginLeft: 10 }}
            >
              <Ionicons name="arrow-back" size={24} color="#007AFF" />
            </TouchableOpacity>
          ),
          tabBarIcon: () => (
            <Image
              source={require('../../assets/images/spareparts.png')}
              style={{ width: 24, height: 24 }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          headerTitle: 'Profile',
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.push('/spareparts')} // Navigate to the 'spareparts' tab
              style={{ marginLeft: 10 }}
            >
              <Ionicons name="arrow-back" size={24} color="#007AFF" />
            </TouchableOpacity>
          ),
          tabBarIcon: () => (
            <Image
              source={require('../../assets/images/profile.png')}
              style={{ width: 24, height: 24 }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="variants"
        options={{
          headerTitle: 'Variants',
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.push('/profile')} // Navigate to the 'profile' tab
              style={{ marginLeft: 10 }}
            >
              <Ionicons name="arrow-back" size={24} color="#007AFF" />
            </TouchableOpacity>
          ),
          tabBarIcon: () => (
            <Image
              source={require('../../assets/images/variants.png')}
              style={{ width: 24, height: 24 }}
            />
          ),
        }}
      />
    </Tabs>
  );
}
