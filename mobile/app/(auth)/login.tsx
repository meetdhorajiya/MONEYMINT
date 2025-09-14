import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppDispatch } from '../../hooks/useAuth';
import { signIn } from '../../store/slices/authSlice';
import apiClient from '../../api/client';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const dispatch = useAppDispatch();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing Fields', 'Please enter both your email and password.');
      return;
    }
    setIsLoading(true);
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      dispatch(signIn(response.data));
      // The AuthProvider will handle redirecting to the main app
    } catch (error: any) {
      Alert.alert('Login Failed', error.response?.data?.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100 justify-center">
      <View className="p-8">
        <View className="items-center mb-10">
            <Ionicons name="wallet" size={64} color="#007AFF" />
            <Text className="text-4xl font-bold text-gray-800 mt-2">Welcome Back</Text>
            <Text className="text-lg text-gray-500">Sign in to continue</Text>
        </View>

        <TextInput
          className="bg-white p-4 rounded-lg mb-4 text-lg border border-gray-200"
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          textContentType="emailAddress"
        />
        <TextInput
          className="bg-white p-4 rounded-lg mb-6 text-lg border border-gray-200"
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          textContentType="password"
        />
        <TouchableOpacity 
          className="bg-blue-600 p-4 rounded-lg flex-row justify-center items-center shadow"
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white text-center text-lg font-bold">Sign In</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity className="mt-6" onPress={() => router.push('/signup')}>
          <Text className="text-center text-blue-600 font-semibold">
            Don't have an account? <Text className="font-bold underline">Sign Up</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}