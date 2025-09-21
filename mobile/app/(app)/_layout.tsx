import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';

export default function AppLayout() {
  return (
    <Tabs 
      screenOptions={{ 
        tabBarActiveTintColor: '#007AFF',
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="customers" // 1. Renamed from "friends"
        options={{
          title: 'Customers', // 2. Updated title
          tabBarIcon: ({ color, focused }) => (
            // 3. (Optional) Changed icon to be more suitable for customers
            <Ionicons name={focused ? 'people' : 'people-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'person-circle' : 'person-circle-outline'} size={24} color={color} />
          ),
        }}
      />
      
      {/* These hidden screens remain the same */}
      <Tabs.Screen name="transaction-details" options={{ href: null, headerShown: true }} />
      <Tabs.Screen name="settings" options={{ href: null, headerShown: true }} />
      <Tabs.Screen name="delete-account" options={{ href: null, headerShown: true }} />
      <Tabs.Screen name="change-name" options={{ href: null, headerShown: true }} />
      <Tabs.Screen name="change-email" options={{ href: null, headerShown: true }} />
      <Tabs.Screen name="change-password" options={{ href: null, headerShown: true }} />
    </Tabs>
  );
}