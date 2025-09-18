import React, { useState, useCallback } from 'react'; // 1. Import useCallback
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter, useFocusEffect } from 'expo-router'; // 2. Import useFocusEffect
import { useAppDispatch } from '../../hooks/useAuth';
import { changePassword } from '../../store/slices/authSlice';

export default function ChangePasswordScreen() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();

  // 3. Add this hook to clear the state when the screen is focused
  useFocusEffect(
    useCallback(() => {
      // This function runs every time you navigate to this screen
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsLoading(false);
    }, [])
  );

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    try {
      await dispatch(changePassword({ currentPassword, newPassword })).unwrap();
      Alert.alert('Success', 'Your password has been updated.');
      router.back();
    } catch (error: any) {
      Alert.alert('Update Failed', error.message || 'An error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <Stack.Screen options={{ title: 'Change Password' }} />
      <View className="p-6">
        <Text className="text-lg text-gray-600 mb-4">Enter your current password and a new password.</Text>
        <TextInput
          className="bg-white p-4 rounded-lg mb-4 text-lg border border-gray-200"
          placeholder="Current Password"
          value={currentPassword}
          onChangeText={setCurrentPassword}
          secureTextEntry
        />
        <TextInput
          className="bg-white p-4 rounded-lg mb-4 text-lg border border-gray-200"
          placeholder="New Password"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
        />
        <TextInput
          className="bg-white p-4 rounded-lg mb-6 text-lg border border-gray-200"
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
        <TouchableOpacity 
          className="bg-blue-600 p-4 rounded-lg flex-row justify-center items-center"
          onPress={handleUpdatePassword}
          disabled={isLoading}
        >
          {isLoading ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-bold text-lg">Update Password</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}