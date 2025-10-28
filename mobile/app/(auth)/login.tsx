// mobile/app/(auth)/login.tsx

import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ViewStyle,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch } from '@/hooks/useAuth';
import { signIn } from '@/store/slices/authSlice';
import apiClient from '@/api/client';
import { ScreenContainer, Surface } from '@/components/ui/ScreenContainer';
import { useTheme } from '@/components/ThemeProvider';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { theme } = useTheme();

  const inputStyle = useMemo(
    () => ({
      flex: 1,
      fontSize: 16,
      color: theme.textPrimary,
      paddingVertical: 12,
    }),
    [theme.textPrimary],
  );

  const fieldWrapperStyle = useMemo<ViewStyle>(
    () => ({
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.surface,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: theme.border,
      paddingHorizontal: 16,
      paddingVertical: 4,
      marginTop: 16,
      gap: 12,
    }),
    [theme.border, theme.surface],
  );

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing fields', 'Please enter both your email and password.');
      return;
    }
    setIsLoading(true);
    try {
      const response = await apiClient.post('/auth/login', { email: email.toLowerCase(), password });
      dispatch(signIn(response.data));
    } catch (error: any) {
      Alert.alert('Login failed', error.response?.data?.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenContainer edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 32, paddingBottom: 48, flexGrow: 1, justifyContent: 'center', gap: 24 }}
        >
          <View style={{ alignItems: 'center' }}>
            <View
              style={{
                backgroundColor: theme.accent + '22',
                padding: 16,
                borderRadius: 32,
              }}
            >
              <Ionicons name="wallet" size={42} color={theme.accent} />
            </View>
            <Text style={{ color: theme.textPrimary, fontSize: 32, fontWeight: '800', marginTop: 16 }}>Welcome back</Text>
            <Text style={{ color: theme.textSecondary, marginTop: 6 }}>Sign in to get back to your money map.</Text>
          </View>

          <Surface>
            <Text style={{ color: theme.textSecondary, fontSize: 14, fontWeight: '600' }}>Email</Text>
            <View style={fieldWrapperStyle}>
              <Ionicons name="mail-outline" size={22} color={theme.textSecondary} />
              <TextInput
                style={inputStyle}
                placeholder="you@example.com"
                placeholderTextColor={theme.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                returnKeyType="next"
              />
            </View>

            <View style={{ marginTop: 20 }}>
              <Text style={{ color: theme.textSecondary, fontSize: 14, fontWeight: '600' }}>Password</Text>
              <View style={fieldWrapperStyle}>
                <Ionicons name="lock-closed-outline" size={22} color={theme.textSecondary} />
                <TextInput
                  style={inputStyle}
                  placeholder="Enter your password"
                  placeholderTextColor={theme.textSecondary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  returnKeyType="done"
                />
              </View>
            </View>
          </Surface>

          <TouchableOpacity
            onPress={handleLogin}
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
            <Text style={{ color: theme.onAccent, fontSize: 17, fontWeight: '700' }}>Sign in</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/signup')} activeOpacity={0.8}>
            <Text style={{ textAlign: 'center', color: theme.textSecondary }}>
              Don&apos;t have an account?{' '}
              <Text style={{ color: theme.accent, fontWeight: '700' }}>Create one</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}