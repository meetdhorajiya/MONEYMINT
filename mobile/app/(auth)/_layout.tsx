import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    // The Stack navigator provides a native-like transition between screens.
    <Stack>
      <Stack.Screen 
        name="login" 
        options={{ 
          headerShown: false // Hides the header for a cleaner login screen
        }} 
      />
      <Stack.Screen 
        name="signup" 
        options={{ 
          title: 'Create Account', // Sets the title in the header
          headerBackTitle: 'Back', // Customizes the back button text on iOS
          headerTintColor: '#007AFF', // Sets the color of the header title and back button
          headerStyle: {
            backgroundColor: '#F9FAFB', // A light gray background for the header
          }
        }} 
      />
    </Stack>
  );
}