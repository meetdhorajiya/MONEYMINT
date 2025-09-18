import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function AppLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: '#007AFF' }}>
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="friends" // <-- Renamed from "transactions"
        options={{
          title: 'Friends', // <-- Updated title
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'list-circle' : 'list-circle-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'person-circle' : 'person-circle-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="transaction-details"
        options={{
          href: null,       // Hides the tab from the bar
          headerShown: true,  // Allows this screen to show its own header
        }}
      />
      <Tabs.Screen
        name="change-email"
        options={{
          href: null, // Hides it from the tab bar
          headerShown: true,
        }}
      />
      <Tabs.Screen
        name="manage-profile"
        options={{
          href: null, // Hides it from the tab bar
          headerShown: true,
        }}
      />
      <Tabs.Screen
        name="change-password"
        options={{
          href: null, // Hides it from the tab bar
          headerShown: true,
        }}
      />
    </Tabs>
  );
}