// mobile/app/(app)/settings.tsx
import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Stack, Link } from 'expo-router';
import { ProfileMenuItem } from '@/app/(app)/profile';
import { ScreenContainer, Surface } from '../components/ui/ScreenContainer';
import { useTheme } from '../components/ThemeProvider';

export default function SettingsScreen() {
  const { theme } = useTheme();

  return (
    <ScreenContainer edges={['top', 'left', 'right']}>
      <Stack.Screen options={{ title: 'Settings' }} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 48, gap: 24 }}
      >
        <View>
          <Text style={{ color: theme.textPrimary, fontSize: 28, fontWeight: '800' }}>Settings</Text>
          <Text style={{ color: theme.textSecondary, marginTop: 8 }}>
            Update your personal information and security preferences.
          </Text>
        </View>

        <Surface style={{ padding: 0, overflow: 'hidden' }}>
          <Link href="/change-name" asChild>
            <ProfileMenuItem icon="person-outline" text="Change Name" />
          </Link>
          <Link href="/change-email" asChild>
            <ProfileMenuItem icon="at-outline" text="Change Email" />
          </Link>
          <Link href="/change-password" asChild>
            <ProfileMenuItem icon="lock-closed-outline" text="Change Password" showDivider={false} />
          </Link>
        </Surface>

        <Surface style={{ padding: 0, overflow: 'hidden' }}>
          <Link href="/delete-account" asChild>
            <ProfileMenuItem icon="trash-outline" text="Delete Account" showDivider={false} />
          </Link>
        </Surface>
      </ScrollView>
    </ScreenContainer>
  );
}