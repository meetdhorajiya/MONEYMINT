import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppDispatch } from '../../hooks/useAuth';
import { signIn } from '../../store/slices/authSlice';
import apiClient from '../../api/client';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

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
      const response = await apiClient.post('/auth/signup', { name, email: email.toLowerCase(),password});
      dispatch(signIn(response.data));
    } catch (error: any) {
      Alert.alert('Sign Up Failed', error.response?.data?.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#FFFFFF', '#E0EFFF']} className="flex-1">
      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
          <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
            <View className="p-8">
              <View className="items-center mb-10">
                <View className="bg-blue-100 p-4 rounded-full">
                    <Ionicons name="person-add-outline" size={48} color="#007AFF" />
                </View>
                <Text className="text-4xl font-bold text-gray-800 mt-4">Create Account</Text>
                <Text className="text-lg text-gray-500">Get started with your new account</Text>
              </View>

              {/* Full Name Input with Icon */}
              <View className="flex-row items-center bg-white p-3 rounded-xl mb-4 border border-gray-200">
                <Ionicons name="person-outline" size={24} color="gray" className="mr-3" />
                <TextInput className="flex-1 text-lg" placeholder="Full Name" placeholderTextColor="#9CA3AF" value={name} onChangeText={setName} />
              </View>

              {/* Email Input with Icon */}
              <View className="flex-row items-center bg-white p-3 rounded-xl mb-4 border border-gray-200">
                <Ionicons name="mail-outline" size={24} color="gray" className="mr-3" />
                <TextInput className="flex-1 text-lg" placeholder="Email" placeholderTextColor="#9CA3AF" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
              </View>

              {/* Password Input with Icon */}
              <View className="flex-row items-center bg-white p-3 rounded-xl mb-6 border border-gray-200">
                <Ionicons name="lock-closed-outline" size={24} color="gray" className="mr-3" />
                <TextInput className="flex-1 text-lg" placeholder="Password (min. 6 characters)" placeholderTextColor="#9CA3AF" style={{ color: '#1F2937' }} value={password} onChangeText={setPassword} secureTextEntry />
              </View>

              <TouchableOpacity 
                className="bg-blue-600 p-4 rounded-xl flex-row justify-center items-center shadow-md shadow-blue-300"
                onPress={handleSignUp}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white text-center text-lg font-bold">Sign Up</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity className="mt-8" onPress={() => router.back()}>
                <Text className="text-center text-gray-600 font-semibold">
                  Already have an account? <Text className="text-blue-600 font-bold">Sign In</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}