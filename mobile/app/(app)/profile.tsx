import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '../../hooks/useAuth';
import { signOut } from '../../store/slices/authSlice';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';

// This reusable component is exported so `settings.tsx` can use it too.
export const ProfileMenuItem = ({ icon, text, isComingSoon = false, onPress }: {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
  isComingSoon?: boolean;
  onPress?: () => void;
}) => (
  <TouchableOpacity 
    onPress={onPress} 
    disabled={isComingSoon || !onPress}
    className="flex-row items-center p-4 bg-white border-b border-gray-100 first:border-transparent"
    activeOpacity={0.6}
  >
    <Ionicons name={icon} size={24} color="#4B5563" />
    <Text className="text-lg text-gray-800 ml-5 flex-1">{text}</Text>
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

  const handleSignOut = () => dispatch(signOut());
  const handlePrivacyPolicy = () => Alert.alert("Privacy Policy", "Your data is stored securely and is not shared with any third parties.");
  const handleContactUs = () => Alert.alert("Contact Us", "For support, please email us at:\nsupport@moneymindapp.com");

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <ScrollView>
        {/* User Info Header */}
        <View className="p-6">
            <Text className="text-3xl font-bold text-gray-800 mb-4">Profile</Text>
            <View className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <View className="flex-row items-center">
                    <Ionicons name="person-circle" size={64} color="#007AFF" />
                    <View className="ml-4 flex-1">
                        <Text className="text-sm text-gray-500">Name</Text>
                        <Text className="text-2xl font-bold text-gray-800">{user?.name}</Text>
                    </View>
                </View>
                <View className="border-t border-gray-100 mt-4 pt-4">
                    <Text className="text-sm text-gray-500">Email</Text>
                    <View className="flex-row items-center mt-1">
                        <Ionicons name="mail-outline" size={20} color="#6B7280" />
                        <Text className="text-base text-gray-600 ml-2">{user?.email}</Text>
                    </View>
                </View>
            </View>
        </View>

        {/* Menu Options */}
        <View className="px-6">
            <View className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                <Link href="/settings" asChild>
                  <TouchableOpacity>
                    <ProfileMenuItem icon="settings-outline" text="Settings" />
                  </TouchableOpacity>
                </Link>
                <ProfileMenuItem icon="call-outline" text="Contact Us" onPress={handleContactUs} />
                <ProfileMenuItem icon="shield-checkmark-outline" text="Privacy Policy" onPress={handlePrivacyPolicy} />
                <ProfileMenuItem icon="color-palette-outline" text="Themes" isComingSoon={true} />
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

        <View className="items-center mt-12 pb-6">
            <Text className="text-gray-400">App Version 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}