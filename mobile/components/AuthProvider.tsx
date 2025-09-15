import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRootNavigationState, useRouter, useSegments } from 'expo-router';
import { useAppDispatch, useAppSelector } from '../hooks/useAuth';
import * as SecureStore from 'expo-secure-store';
import { hydrateAuth, signOut, setLoading } from '../store/slices/authSlice';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth);
  const segments = useSegments();
  const router = useRouter();
  
  const navigationState = useRootNavigationState();

  // This effect checks for a stored token on initial app load. (No changes here)
  useEffect(() => {
    const checkStoredToken = async () => {
      try {
        const token = await SecureStore.getItemAsync('token');
        const userString = await SecureStore.getItemAsync('user');
        
        if (token && userString) {
          const user = JSON.parse(userString);
          dispatch(hydrateAuth({ token, user }));
        } else {
          dispatch(setLoading(false));
        }
      } catch (error) {
        console.error("Failed to load auth state:", error);
        dispatch(signOut());
      }
    };

    checkStoredToken();
  }, [dispatch]);

  // This effect handles navigation redirects with the corrected logic.
  useEffect(() => {
    if (!navigationState?.key || isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    // If the user is authenticated AND is in the auth group, redirect to the dashboard.
    if (isAuthenticated && inAuthGroup) {
      router.replace('/dashboard');
    } 
    // If the user is NOT authenticated AND is NOT in the auth group, redirect to login.
    else if (!isAuthenticated && !inAuthGroup) {
      router.replace('/login');
    }
  }, [isAuthenticated, segments, isLoading, navigationState, router]);
  
  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return <>{children}</>;
}