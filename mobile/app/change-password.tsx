import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { useAppDispatch } from '@/hooks/useAuth';
import { changePassword } from '@/store/slices/authSlice';
import { ScreenContainer, Surface } from '@/components/ui/ScreenContainer';
import { useTheme } from '@/components/ThemeProvider';

export default function ChangePasswordScreen() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { theme } = useTheme();

  // 3. Add this hook to clear the state when the screen is focused
  useFocusEffect(
    useCallback(() => {
      // This function runs every time you navigate to this screen
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsLoading(false);
    }, [])
  );

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    try {
      await dispatch(changePassword({ currentPassword, newPassword })).unwrap();
      Alert.alert('Success', 'Your password has been updated.');
      router.back();
    } catch (error: any) {
      Alert.alert('Update Failed', error.message || 'An error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle = {
    backgroundColor: theme.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.border,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 16,
    color: theme.textPrimary,
    marginTop: 12,
  } as const;

  return (
    <ScreenContainer edges={['top', 'left', 'right']}>
      <Stack.Screen options={{ title: 'Change Password' }} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 48, gap: 24 }}
        >
          <View>
            <Text style={{ color: theme.textPrimary, fontSize: 28, fontWeight: '800' }}>Update your password</Text>
            <Text style={{ color: theme.textSecondary, marginTop: 8 }}>
              Choose a secure new password to keep your account protected.
            </Text>
          </View>

          <Surface>
            <Text style={{ color: theme.textSecondary, fontSize: 14, fontWeight: '600' }}>Current password</Text>
            <TextInput
              style={inputStyle}
              placeholder="Enter current password"
              placeholderTextColor={theme.textSecondary}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry
              returnKeyType="next"
            />

            <View style={{ marginTop: 20 }}>
              <Text style={{ color: theme.textSecondary, fontSize: 14, fontWeight: '600' }}>New password</Text>
              <TextInput
                style={inputStyle}
                placeholder="Create a new password"
                placeholderTextColor={theme.textSecondary}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                returnKeyType="next"
              />
            </View>

            <View style={{ marginTop: 20 }}>
              <Text style={{ color: theme.textSecondary, fontSize: 14, fontWeight: '600' }}>Confirm new password</Text>
              <TextInput
                style={inputStyle}
                placeholder="Repeat your new password"
                placeholderTextColor={theme.textSecondary}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                returnKeyType="done"
              />
            </View>
          </Surface>

          <TouchableOpacity
            onPress={handleUpdatePassword}
            disabled={isLoading}
            activeOpacity={0.85}
            style={{
              backgroundColor: theme.accent,
              borderRadius: 22,
              paddingVertical: 18,
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 10,
              opacity: isLoading ? 0.7 : 1,
            }}
          >
            {isLoading ? <ActivityIndicator color={theme.onAccent} /> : null}
            <Text style={{ color: theme.onAccent, fontSize: 17, fontWeight: '700' }}>Update Password</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}