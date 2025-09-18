// mobile/app/(app)/manage-profile.tsx
import React from 'react';
import { View, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ProfileMenuItem } from './profile'; // We can reuse the component from the profile screen

export default function ManageProfileScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <Stack.Screen options={{ title: 'Manage Profile' }} />
      <ScrollView>
        <View className="mt-6 mx-4 bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <Link href="/change-email" asChild>
            <TouchableOpacity>
              <ProfileMenuItem icon="at-outline" text="Change Email" />
            </TouchableOpacity>
          </Link>
          {/* You can add more options like "Change Password" here in the future */}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}