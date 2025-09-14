import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '../../hooks/useAuth';
import { signOut } from '../../store/slices/authSlice';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  const handleSignOut = () => {
    dispatch(signOut());
    // The AuthProvider will automatically handle redirecting to the login screen
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="p-6">
        <Text className="text-3xl font-bold text-gray-800">Profile</Text>
      </View>

      <View className="px-6 mt-4">
        <View className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
          <View>
            <Text className="text-sm font-medium text-gray-500">Name</Text>
            <Text className="text-lg text-gray-800">{user?.name}</Text>
          </View>
          <View>
            <Text className="text-sm font-medium text-gray-500">Email</Text>
            <Text className="text-lg text-gray-800">{user?.email}</Text>
          </View>
        </View>
      </View>
      
      {/* Sign Out Button */}
      <View className="px-6 mt-8">
        <TouchableOpacity 
          className="bg-red-500 p-4 rounded-lg flex-row justify-center items-center shadow-lg"
          onPress={handleSignOut}
        >
          <Ionicons name="log-out-outline" size={24} color="white" />
          <Text className="text-white text-lg font-bold ml-2">Sign Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}