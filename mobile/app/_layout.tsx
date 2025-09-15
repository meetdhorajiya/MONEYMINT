// mobile/app/_layout.tsx

import "./global.css";
import { Provider } from 'react-redux';
import { store } from '../store/store';
import { AuthProvider } from '../components/AuthProvider';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { useAppSelector } from "../hooks/useAuth";

function RootStack() {
  // We need to know if the user is authenticated to hide the close button on the modal for guests
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  return (
    <Stack>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      {/* The main tab navigator is treated as a single screen in the stack */}
      <Stack.Screen name="(app)" options={{ headerShown: false }} />

      {/* This configures the modal screen */}
      <Stack.Screen
        name="add-transaction"
        options={{
          presentation: 'modal',
          title: 'New Transaction',
          headerShown: isAuthenticated, // Only show header if logged in
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <SafeAreaProvider>
          <RootStack />
        </SafeAreaProvider>
      </AuthProvider>
    </Provider>
  );
}