// mobile/app/(app)/manage-profile.tsx
import React from 'react';
import { View, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, Link } from 'expo-router';
import { ProfileMenuItem } from './profile';

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
          {/* ADD THIS NEW LINK */}
          <Link href="/change-password" asChild>
            <TouchableOpacity>
              <ProfileMenuItem icon="lock-closed-outline" text="Change Password" />
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}