// mobile/app/(app)/change-name.tsx
import React, { useState } from 'react';
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
import { Stack, useRouter } from 'expo-router';
import { useAppDispatch } from '@/hooks/useAuth';
import { changeName } from '@/store/slices/authSlice';
import { ScreenContainer, Surface } from '@/components/ui/ScreenContainer';
import { useTheme } from '@/components/ThemeProvider';

export default function ChangeNameScreen() {
  const [newName, setNewName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { theme } = useTheme();

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

  const handleUpdateName = async () => {
    if (!newName || !currentPassword) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    setIsLoading(true);
    try {
      await dispatch(changeName({ newName, currentPassword })).unwrap();
      Alert.alert('Success', 'Your name has been updated.');
      router.back();
    } catch (error: any) {
      Alert.alert('Update Failed', error.message || 'An error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenContainer edges={['top', 'left', 'right']}>
      <Stack.Screen options={{ title: 'Change Name' }} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 48, gap: 24 }}
        >
          <View>
            <Text style={{ color: theme.textPrimary, fontSize: 28, fontWeight: '800' }}>Update your name</Text>
            <Text style={{ color: theme.textSecondary, marginTop: 8 }}>
              Enter your new full name and confirm the change with your password.
            </Text>
          </View>

          <Surface>
            <Text style={{ color: theme.textSecondary, fontSize: 14, fontWeight: '600' }}>New full name</Text>
            <TextInput
              style={inputStyle}
              placeholder="E.g. Priya Sharma"
              placeholderTextColor={theme.textSecondary}
              value={newName}
              onChangeText={setNewName}
              autoCapitalize="words"
              returnKeyType="next"
            />

            <View style={{ marginTop: 20 }}>
              <Text style={{ color: theme.textSecondary, fontSize: 14, fontWeight: '600' }}>Current password</Text>
              <TextInput
                style={inputStyle}
                placeholder="Enter your password"
                placeholderTextColor={theme.textSecondary}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry
                returnKeyType="done"
              />
            </View>
          </Surface>

          <TouchableOpacity
            onPress={handleUpdateName}
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
            <Text style={{ color: theme.onAccent, fontSize: 17, fontWeight: '700' }}>Save Changes</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}