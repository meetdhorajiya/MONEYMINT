// mobile/app/(app)/change-name.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { useAppDispatch } from '../../hooks/useAuth';
import { changeName } from '../../store/slices/authSlice';

export default function ChangeNameScreen() {
  const [newName, setNewName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleUpdateName = async () => {
    if (!newName || !currentPassword) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    setIsLoading(true);
    try {
      await dispatch(changeName({ newName, currentPassword })).unwrap();
      Alert.alert('Success', 'Your name has been updated.');
      router.back();
    } catch (error: any) {
      Alert.alert('Update Failed', error.message || 'An error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <Stack.Screen options={{ title: 'Change Name' }} />
      <View className="p-6">
        <Text className="text-lg text-gray-600 mb-4">Enter your new name and confirm with your current password.</Text>
        <TextInput
          className="bg-white p-4 rounded-lg mb-4 text-lg border border-gray-200"
          placeholder="New Full Name"
          value={newName}
          onChangeText={setNewName}
          autoCapitalize="words"
        />
        <TextInput
          className="bg-white p-4 rounded-lg mb-6 text-lg border border-gray-200"
          placeholder="Current Password"
          value={currentPassword}
          onChangeText={setCurrentPassword}
          secureTextEntry
        />
        <TouchableOpacity 
          className="bg-blue-600 p-4 rounded-lg flex-row justify-center items-center"
          onPress={handleUpdateName}
          disabled={isLoading}
        >
          {isLoading ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-bold text-lg">Save Changes</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}