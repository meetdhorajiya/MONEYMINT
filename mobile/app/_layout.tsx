// mobile/app/_layout.tsx
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
      {/* The AuthProvider safely wraps the navigators */}
      <AuthProvider>
        <SafeAreaProvider>
          <Stack>
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(app)" options={{ headerShown: false }} />
            <Stack.Screen
              name="add-transaction"
              options={{ presentation: 'modal', title: 'New Transaction' }}
            />
          </Stack>
        </SafeAreaProvider>
      </AuthProvider>
    </Provider>
  );
}