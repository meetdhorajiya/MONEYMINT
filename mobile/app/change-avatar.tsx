import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { Stack, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { ScreenContainer, Surface } from '../components/ui/ScreenContainer';
import { useTheme } from '../components/ThemeProvider';
import { useAppDispatch, useAppSelector } from '../hooks/useAuth';
import { fetchAvatar, removeAvatar, uploadAvatar } from '../store/slices/authSlice';

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'accent' | 'outline';
};

const PrimaryButton: React.FC<PrimaryButtonProps> = ({ label, onPress, disabled = false, variant = 'accent' }) => {
  const { theme } = useTheme();

  const styles = useMemo(() => {
    if (variant === 'outline') {
      return {
        backgroundColor: 'transparent',
        borderColor: theme.accent,
        textColor: theme.accent,
      };
    }
    return {
      backgroundColor: theme.accent,
      borderColor: theme.accent,
      textColor: theme.onAccent,
    };
  }, [theme, variant]);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      disabled={disabled}
      style={{
        opacity: disabled ? 0.7 : 1,
        paddingVertical: 16,
        borderRadius: 18,
        backgroundColor: styles.backgroundColor,
        borderWidth: 1,
        borderColor: styles.borderColor,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ color: styles.textColor, fontSize: 16, fontWeight: '700' }}>{label}</Text>
    </TouchableOpacity>
  );
};

export default function ChangeAvatarScreen() {
  const { theme } = useTheme();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const token = useAppSelector((state) => state.auth.token);
  const [isLoading, setIsLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (user?.id && token) {
        dispatch(fetchAvatar());
      }
    }, [dispatch, token, user?.id])
  );

  const handleChooseImage = useCallback(async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Please allow photo library access to update your profile picture.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.75,
        allowsEditing: true,
        aspect: [1, 1],
        base64: true,
      });

      if (result.canceled || !result.assets?.length) {
        return;
      }

      const asset = result.assets[0];
      if (!asset.base64) {
        Alert.alert('Upload failed', 'Could not process the selected image. Please try another.');
        return;
      }

      const mimeType = asset.mimeType ?? 'image/jpeg';
      const dataUrl = `data:${mimeType};base64,${asset.base64}`;

      setIsLoading(true);
      await dispatch(uploadAvatar({ image: dataUrl })).unwrap();
      Alert.alert('Success', 'Your profile picture has been updated.');
    } catch (error: any) {
      const message = error?.message || 'Failed to update profile picture. Please try again later.';
      Alert.alert('Upload failed', message);
    } finally {
      setIsLoading(false);
    }
  }, [dispatch]);

  const handleRemoveImage = useCallback(() => {
    if (!user?.avatarUrl) {
      return;
    }

    Alert.alert('Remove photo?', 'This will delete your current profile picture.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            setIsLoading(true);
            await dispatch(removeAvatar()).unwrap();
            Alert.alert('Removed', 'Your profile picture has been removed.');
          } catch (error: any) {
            const message = error?.message || 'Could not remove the profile picture.';
            Alert.alert('Removal failed', message);
          } finally {
            setIsLoading(false);
          }
        },
      },
    ]);
  }, [dispatch, user?.avatarUrl]);

  return (
    <ScreenContainer edges={['top', 'left', 'right']}>
      <Stack.Screen options={{ title: 'Profile Photo' }} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 48, gap: 24 }}
      >
        <Surface>
          <View style={{ alignItems: 'center', gap: 16 }}>
            <View style={{ position: 'relative' }}>
              {user?.avatarUrl ? (
                <Image
                  key={user.avatarUrl || 'avatar-placeholder'}
                  source={{
                    uri: user.avatarUrl || undefined,
                    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
                  }}
                  style={{ width: 140, height: 140, borderRadius: 48, backgroundColor: theme.surfaceMuted }}
                  contentFit="cover"
                  cachePolicy="none"
                />
              ) : (
                <View
                  style={{
                    width: 140,
                    height: 140,
                    borderRadius: 48,
                    backgroundColor: theme.surfaceMuted,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name="person-circle" size={96} color={theme.accent} />
                </View>
              )}
              <View
                style={{
                  position: 'absolute',
                  bottom: -6,
                  right: -6,
                  backgroundColor: theme.accent,
                  borderRadius: 18,
                  padding: 8,
                  shadowColor: '#000',
                  shadowOpacity: 0.18,
                  shadowRadius: 8,
                  shadowOffset: { width: 0, height: 3 },
                  elevation: 6,
                }}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color={theme.onAccent} />
                ) : (
                  <Ionicons name="camera" size={20} color={theme.onAccent} />
                )}
              </View>
            </View>

            <View style={{ alignItems: 'center', gap: 6 }}>
              <Text style={{ color: theme.textPrimary, fontSize: 20, fontWeight: '700' }}>{user?.name ?? '—'}</Text>
              <Text style={{ color: theme.textSecondary }}>{user?.email ?? ''}</Text>
            </View>

            <Text style={{ color: theme.textSecondary, textAlign: 'center' }}>
              We recommend using a square image at least 400×400 pixels for the best quality.
            </Text>
          </View>
        </Surface>

        <View style={{ gap: 16 }}>
          <PrimaryButton label="Choose New Photo" onPress={handleChooseImage} disabled={isLoading} />
          <PrimaryButton label="Remove Photo" onPress={handleRemoveImage} disabled={isLoading || !user?.avatarUrl} variant="outline" />
        </View>

        <View style={{ padding: 16, borderRadius: 18, backgroundColor: theme.surfaceMuted }}>
          <Text style={{ color: theme.textPrimary, fontSize: 16, fontWeight: '700', marginBottom: 6 }}>Tips</Text>
          <Text style={{ color: theme.textSecondary }}>
            • Use good lighting so teammates recognise you quickly.
            {'\n'}• Keep file size below 5 MB for faster uploads.
            {'\n'}• You can update your picture anytime.
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
