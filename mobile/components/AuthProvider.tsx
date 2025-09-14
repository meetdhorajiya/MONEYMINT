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

  useEffect(() => {
    if (!navigationState?.key || isLoading) return;

    const inAppGroup = segments[0] === '(app)';

    if (isAuthenticated && !inAppGroup) {
      router.replace('/(app)/dashboard');
    } else if (!isAuthenticated && inAppGroup) {
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

  // Once the authentication state is determined, render the actual screen.
  return <>{children}</>;
}