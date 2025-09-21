// mobile/app/(app)/change-email.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { useAppDispatch } from '@/hooks/useAuth';
import { changeEmail } from '@/store/slices/authSlice';
import { Ionicons } from '@expo/vector-icons';

export default function ChangeEmailScreen() {
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleUpdateEmail = async () => {
    if (!newEmail || !currentPassword) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    setIsLoading(true);
    try {
      await dispatch(changeEmail({ newEmail: newEmail.toLowerCase(), currentPassword })).unwrap();
      Alert.alert('Success', 'Your email has been updated.');
      router.back();
    } catch (error: any) {
      Alert.alert('Update Failed', error.message || 'An error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <Stack.Screen options={{ title: 'Change Email' }} />
      <View className="p-6">
        <Text className="text-lg text-gray-600 mb-4">Enter your new email and current password to confirm the change.</Text>
        <TextInput
          className="bg-white p-4 rounded-lg mb-4 text-lg border border-gray-200"
          placeholder="New Email"
          placeholderTextColor="#9CA3AF"
          value={newEmail}
          onChangeText={setNewEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          className="bg-white p-4 rounded-lg mb-6 text-lg border border-gray-200"
          placeholder="Current Password"
          placeholderTextColor="#9CA3AF"
          value={currentPassword}
          onChangeText={setCurrentPassword}
          secureTextEntry
          style={{ color: '#1F2937' }}
        />
        <TouchableOpacity 
          className="bg-blue-600 p-4 rounded-lg flex-row justify-center items-center"
          onPress={handleUpdateEmail}
          disabled={isLoading}
        >
          {isLoading ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-bold text-lg">Save Changes</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}