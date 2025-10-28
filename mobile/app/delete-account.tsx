// mobile/app/(app)/delete-account.tsx
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
import { Stack } from 'expo-router';
import { useAppDispatch } from '@/hooks/useAuth';
import { deleteAccount } from '@/store/slices/authSlice';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, Surface } from '@/components/ui/ScreenContainer';
import { useTheme } from '@/components/ThemeProvider';

export default function DeleteAccountScreen() {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();
  const { theme } = useTheme();

  const handleDelete = () => {
    Alert.alert(
      "Are you absolutely sure?",
      "This action is permanent and cannot be undone. All your transactions and data will be deleted.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete My Account", 
          style: "destructive", 
          onPress: async () => {
            if (!password) {
              Alert.alert('Error', 'Please enter your password to confirm.');
              return;
            }
            setIsLoading(true);
            try {
              await dispatch(deleteAccount(password)).unwrap();
              Alert.alert('Success', 'Your account has been permanently deleted.');
              // AuthProvider will handle the redirect to the login screen
            } catch (error: any) {
              Alert.alert('Deletion Failed', error.message || 'An error occurred.');
            } finally {
              setIsLoading(false);
            }
          } 
        }
      ]
    );
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
      <Stack.Screen options={{ title: 'Delete Account' }} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 48, gap: 24 }}
        >
          <Surface muted>
            <View style={{ alignItems: 'center' }}>
              <View
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 24,
                  backgroundColor: '#FEE2E2',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="alert-circle" size={40} color={theme.danger} />
              </View>
              <Text style={{ color: theme.textPrimary, fontSize: 26, fontWeight: '800', marginTop: 16 }}>
                Delete your account
              </Text>
              <Text style={{ color: theme.textSecondary, textAlign: 'center', marginTop: 10 }}>
                Once confirmed, all of your data will be permanently removed.
                This action cannot be undone.
              </Text>
            </View>
          </Surface>

          <Surface>
            <Text style={{ color: theme.textSecondary, fontSize: 14, fontWeight: '600' }}>Confirm with password</Text>
            <TextInput
              style={inputStyle}
              placeholder="Enter your password"
              placeholderTextColor={theme.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              returnKeyType="done"
            />
            <Text style={{ color: theme.textSecondary, marginTop: 12, fontSize: 13 }}>
              We use this step to make sure you are the account owner.
            </Text>
          </Surface>

          <TouchableOpacity
            onPress={handleDelete}
            disabled={isLoading}
            activeOpacity={0.85}
            style={{
              backgroundColor: theme.danger,
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
            <Text style={{ color: theme.onAccent, fontSize: 17, fontWeight: '700' }}>Confirm deletion</Text>
          </TouchableOpacity>

          <Text style={{ color: theme.textSecondary, textAlign: 'center', fontSize: 13 }}>
            You will be signed out automatically after deletion.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}