import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '../../hooks/useAuth';
import { signOut } from '../../store/slices/authSlice';
import { Ionicons } from '@expo/vector-icons';

// A reusable component for each menu item to keep the code clean
const ProfileMenuItem = ({ icon, text, isComingSoon = false, onPress }: {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
  isComingSoon?: boolean;
  onPress?: () => void;
}) => (
  <TouchableOpacity 
    onPress={onPress} 
    disabled={isComingSoon}
    className="flex-row items-center p-4"
  >
    <Ionicons name={icon} size={24} color="#4B5563" />
    <Text className="text-lg text-gray-700 ml-4 flex-1">{text}</Text>
    {isComingSoon ? (
      <Text className="text-sm text-gray-400">Coming Soon</Text>
    ) : (
      <Ionicons name="chevron-forward-outline" size={24} color="#9CA3AF" />
    )}
  </TouchableOpacity>
);

export default function ProfileScreen() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  const handleSignOut = () => {
    dispatch(signOut());
    // The AuthProvider will automatically handle redirecting to the login screen
  };
  
  const handlePrivacyPolicy = () => {
      Alert.alert("Privacy Policy", "Your data is stored securely and is not shared with any third parties.");
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <ScrollView>
        <View className="p-6">
          <Text className="text-3xl font-bold text-gray-800">Profile</Text>
        </View>

        {/* User Info Card */}
        <View className="px-6">
            <View className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex-row items-center">
                <Ionicons name="person-circle" size={64} color="#007AFF" />
                <View className="ml-4">
                    <Text className="text-2xl font-bold text-gray-800">{user?.name}</Text>
                    <Text className="text-base text-gray-500">{user?.email}</Text>
                </View>
            </View>
        </View>

        {/* Menu Options Card */}
        <View className="px-6 mt-6">
            <View className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100">
                <ProfileMenuItem icon="shield-checkmark-outline" text="Privacy Policy" onPress={handlePrivacyPolicy} />
                <ProfileMenuItem icon="color-palette-outline" text="Themes" isComingSoon={true} />
                <ProfileMenuItem icon="settings-outline" text="Settings" isComingSoon={true} />
            </View>
        </View>
        
        {/* Sign Out Button */}
        <View className="px-6 mt-8">
          <TouchableOpacity 
            className="bg-red-50 p-4 rounded-xl flex-row justify-center items-center"
            onPress={handleSignOut}
          >
            <Ionicons name="log-out-outline" size={24} color="#EF4444" />
            <Text className="text-red-600 text-lg font-bold ml-2">Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}