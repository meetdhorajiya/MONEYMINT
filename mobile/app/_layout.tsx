import "./global.css";
import { Provider } from 'react-redux';
import { store } from '../store/store';
import { AuthProvider } from '../components/AuthProvider';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import React from 'react';

export default function RootLayout() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <SafeAreaProvider>
          <Stack>
            {/* These are the main groups of your app */}
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(app)" options={{ headerShown: false }} />
            
            {/* Modal screens */}
            <Stack.Screen
              name="add-transaction"
              options={{ presentation: 'modal', title: 'New Transaction' }}
            />
            
            {/* Regular screens that will get a back button */}
            <Stack.Screen name="settings" options={{ title: 'Settings' }} />
            <Stack.Screen name="change-name" options={{ title: 'Change Name' }} />
            <Stack.Screen name="change-email" options={{ title: 'Change Email' }} />
            <Stack.Screen name="change-password" options={{ title: 'Change Password' }} />
            <Stack.Screen name="delete-account" options={{ title: 'Delete Account' }} />
          </Stack>
        </SafeAreaProvider>
      </AuthProvider>
    </Provider>
  );
}
