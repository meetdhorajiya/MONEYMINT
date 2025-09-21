// mobile/app/(app)/delete-account.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { useAppDispatch } from '@/hooks/useAuth';
import { deleteAccount } from '@/store/slices/authSlice';
import { Ionicons } from '@expo/vector-icons';

export default function DeleteAccountScreen() {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();

  const handleDelete = () => {
    Alert.alert(
      "Are you absolutely sure?",
      "This action is permanent and cannot be undone. All your transactions and data will be deleted.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete My Account", 
          style: "destructive", 
          onPress: async () => {
            if (!password) {
              Alert.alert('Error', 'Please enter your password to confirm.');
              return;
            }
            setIsLoading(true);
            try {
              await dispatch(deleteAccount(password)).unwrap();
              Alert.alert('Success', 'Your account has been permanently deleted.');
              // AuthProvider will handle the redirect to the login screen
            } catch (error: any) {
              Alert.alert('Deletion Failed', error.message || 'An error occurred.');
            } finally {
              setIsLoading(false);
            }
          } 
        }
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <Stack.Screen options={{ title: 'Delete Account' }} />
      <View className="p-6">
        <View className="items-center mb-6">
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <Text className="text-2xl font-bold text-center mt-4">Delete Your Account</Text>
        </View>
        <Text className="text-lg text-center text-gray-600 mb-6">
          To permanently delete your account and all of its data, please enter your current password.
        </Text>
        <TextInput
          className="bg-white p-4 rounded-lg mb-6 text-lg border border-gray-200"
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TouchableOpacity 
          className="bg-red-600 p-4 rounded-lg flex-row justify-center items-center"
          onPress={handleDelete}
          disabled={isLoading}
        >
          {isLoading ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-bold text-lg">Confirm Deletion</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}