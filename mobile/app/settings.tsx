// mobile/app/(app)/settings.tsx
import React from 'react';
import { View, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, Link } from 'expo-router';
import { ProfileMenuItem } from '@/app/(app)/profile';

export default function SettingsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <Stack.Screen options={{ title: 'Settings' }} />
      <ScrollView>
        <View className="mt-6 mx-4 bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          {/* ADD THIS NEW LINK */}
          <Link href="/change-name" asChild>
            <TouchableOpacity>
              <ProfileMenuItem icon="person-outline" text="Change Name" />
            </TouchableOpacity>
          </Link>

          <Link href="/change-email" asChild>
            <TouchableOpacity>
              <ProfileMenuItem icon="at-outline" text="Change Email" />
            </TouchableOpacity>
          </Link>
          <Link href="/change-password" asChild>
            <TouchableOpacity>
              <ProfileMenuItem icon="lock-closed-outline" text="Change Password" />
            </TouchableOpacity>
          </Link>
        </View>

        <View className="mt-8 mx-4">
            <View className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                <Link href="/delete-account" asChild>
                    <TouchableOpacity>
                        <ProfileMenuItem icon="trash-outline" text="Delete Account" />
                    </TouchableOpacity>
                </Link>
            </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}