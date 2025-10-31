import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, TouchableOpacityProps } from 'react-native';
import { Stack, Link, useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '../../hooks/useAuth';
import { signOut, fetchAvatar } from '../../store/slices/authSlice';
import { ScreenContainer, Surface } from '../../components/ui/ScreenContainer';
import { useTheme } from '../../components/ThemeProvider';
import { Image } from 'expo-image';

type ProfileMenuItemProps = TouchableOpacityProps & {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
  isComingSoon?: boolean;
  showDivider?: boolean;
};

// Shared menu item between Profile and Settings screens.
export const ProfileMenuItem = ({
  icon,
  text,
  isComingSoon = false,
  showDivider = true,
  style,
  disabled,
  ...touchableProps
}: ProfileMenuItemProps) => {
  const { theme } = useTheme();
  const isDisabled = Boolean(disabled) || isComingSoon;

  return (
    <TouchableOpacity
      {...touchableProps}
      activeOpacity={0.75}
      disabled={isDisabled}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 24,
          paddingVertical: 18,
          borderBottomWidth: showDivider ? 1 : 0,
          borderBottomColor: theme.border,
          opacity: isComingSoon ? 0.6 : 1,
          backgroundColor: 'transparent',
        },
        style,
      ]}
    >
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 14,
          backgroundColor: theme.surfaceMuted,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 16,
        }}
      >
        <Ionicons name={icon} size={22} color={theme.accent} />
      </View>

      <Text
        style={{
          flex: 1,
          color: theme.textPrimary,
          fontSize: 16,
          fontWeight: '600',
        }}
      >
        {text}
      </Text>

      {isComingSoon ? (
        <Text style={{ color: theme.textSecondary, fontSize: 13 }}>Coming soon</Text>
      ) : (
        <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
      )}
    </TouchableOpacity>
  );
};

export default function ProfileScreen() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const token = useAppSelector((state) => state.auth.token);
  const { theme } = useTheme();
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      if (user?.id && token) {
        dispatch(fetchAvatar());
      }
    }, [dispatch, token, user?.id])
  );

  const handleSignOut = () => dispatch(signOut());
  const handlePrivacyPolicy = () =>
    Alert.alert('Privacy Policy', 'Your data is stored securely and is not shared with any third parties.');
  const handleContactUs = () =>
    Alert.alert('Contact Us', 'For support, please email us at:\nsupport@moneymint.com');

  const handleManageAvatar = () => {
    router.push('/change-avatar');
  };

  return (
    <ScreenContainer edges={['top', 'left', 'right']}>
      <Stack.Screen options={{ title: 'Profile' }} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 48, gap: 24 }}
      >
        <View>
          <Text style={{ color: theme.textPrimary, fontSize: 32, fontWeight: '800' }}>Profile</Text>
          <Text style={{ color: theme.textSecondary, marginTop: 8 }}>
            Manage your account preferences and keep details up to date.
          </Text>
        </View>

        <Surface>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ position: 'relative' }}>
              <TouchableOpacity onPress={handleManageAvatar} activeOpacity={0.85}>
                {user?.avatarUrl ? (
                  <Image
                    key={user.avatarUrl || 'avatar-placeholder'}
                    source={{
                      uri: user.avatarUrl || undefined,
                      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
                    }}
                    style={{ width: 76, height: 76, borderRadius: 24, backgroundColor: theme.surfaceMuted }}
                    contentFit="cover"
                    cachePolicy="none"
                  />
                ) : (
                  <View
                    style={{
                      width: 76,
                      height: 76,
                      borderRadius: 24,
                      backgroundColor: theme.surfaceMuted,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Ionicons name="person-circle" size={56} color={theme.accent} />
                  </View>
                )}
                <View
                  style={{
                    position: 'absolute',
                    bottom: -4,
                    right: -4,
                    backgroundColor: theme.accent,
                    borderRadius: 16,
                    padding: 6,
                    shadowColor: '#000',
                    shadowOpacity: 0.15,
                    shadowRadius: 6,
                    shadowOffset: { width: 0, height: 2 },
                    elevation: 4,
                  }}
                >
                  <Ionicons name="camera" size={16} color={theme.onAccent} />
                </View>
              </TouchableOpacity>
            </View>
            <View style={{ marginLeft: 16, flex: 1 }}>
              <Text style={{ color: theme.textSecondary, fontSize: 14, fontWeight: '600' }}>Name</Text>
              <Text style={{ color: theme.textPrimary, fontSize: 24, fontWeight: '800', marginTop: 4 }}>
                {user?.name || '—'}
              </Text>
              <TouchableOpacity
                onPress={handleManageAvatar}
                activeOpacity={0.8}
                style={{ marginTop: 8 }}
              >
                <Text style={{ color: theme.accent, fontWeight: '700' }}>Manage photo</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={{ borderTopWidth: 1, borderTopColor: theme.border, marginTop: 18, paddingTop: 18 }}>
            <Text style={{ color: theme.textSecondary, fontSize: 14, fontWeight: '600' }}>Email</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
              <Ionicons name="mail-outline" size={20} color={theme.textSecondary} />
              <Text style={{ color: theme.textPrimary, fontSize: 16, marginLeft: 8 }}>{user?.email || '—'}</Text>
            </View>
          </View>
        </Surface>

        <Surface style={{ padding: 0, overflow: 'hidden' }}>
          <Link href="/settings" asChild>
            <ProfileMenuItem icon="settings-outline" text="Settings" />
          </Link>
          <ProfileMenuItem icon="call-outline" text="Contact Us" onPress={handleContactUs} />
          <ProfileMenuItem icon="shield-checkmark-outline" text="Privacy Policy" onPress={handlePrivacyPolicy} />
          <ProfileMenuItem icon="color-palette-outline" text="Themes" isComingSoon showDivider={false} />
        </Surface>

        <TouchableOpacity
          onPress={handleSignOut}
          activeOpacity={0.85}
          style={{
            backgroundColor: theme.surface,
            borderRadius: 22,
            paddingVertical: 18,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: theme.danger,
          }}
        >
          <Ionicons name="log-out-outline" size={22} color={theme.danger} />
          <Text style={{ color: theme.danger, fontSize: 17, fontWeight: '700', marginLeft: 10 }}>Log out</Text>
        </TouchableOpacity>

        <View style={{ alignItems: 'center', marginTop: 12 }}>
          <Text style={{ color: theme.textSecondary }}>App Version 1.0.0</Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}