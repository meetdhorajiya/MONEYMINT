import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppDispatch } from '../../hooks/useAuth';
import { signIn } from '../../store/slices/authSlice';
import apiClient from '../../api/client';

export default function SignUpScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleSignUp = async () => {
    if (!name || !email || !password) {
      Alert.alert('Missing Fields', 'Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
        Alert.alert('Weak Password', 'Password must be at least 6 characters long.');
        return;
    }

    setIsLoading(true);
    try {
      const response = await apiClient.post('/auth/signup', { name, email, password });
      dispatch(signIn(response.data));
      // AuthProvider will redirect to the main app after successful sign-in
    } catch (error: any) {
      Alert.alert('Sign Up Failed', error.response?.data?.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
        <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="flex-1 justify-center"
        >
            <View className="p-8">
                <View className="items-center mb-10">
                    <Text className="text-4xl font-bold text-gray-800">Create Account</Text>
                    <Text className="text-lg text-gray-500">Get started with your new account</Text>
                </View>

                <TextInput
                    className="bg-white p-4 rounded-lg mb-4 text-lg border border-gray-200"
                    placeholder="Full Name"
                    value={name}
                    onChangeText={setName}
                    textContentType="name"
                />
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
                    textContentType="newPassword"
                />
                <TouchableOpacity 
                    className="bg-blue-600 p-4 rounded-lg flex-row justify-center items-center shadow"
                    onPress={handleSignUp}
                    disabled={isLoading}
                >
                {isLoading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text className="text-white text-center text-lg font-bold">Sign Up</Text>
                )}
                </TouchableOpacity>
                 <TouchableOpacity className="mt-6" onPress={() => router.back()}>
                    <Text className="text-center text-blue-600 font-semibold">
                        Already have an account? <Text className="font-bold underline">Sign In</Text>
                    </Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    </SafeAreaView>
  );
}