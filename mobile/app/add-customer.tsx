// mobile/app/add-customer.tsx

import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useAppDispatch } from '@/hooks/useAuth';
import { addCustomer } from '@/store/slices/customerSlice';
import { ScreenContainer, Surface } from '@/components/ui/ScreenContainer';
import { useTheme } from '@/components/ThemeProvider';

export default function AddCustomerScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { theme } = useTheme();

  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const inputStyle = useMemo(
    () => ({
      backgroundColor: theme.surface,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: theme.border,
      paddingHorizontal: 20,
      paddingVertical: 16,
      fontSize: 16,
      color: theme.textPrimary,
      marginTop: 12,
    }),
    [theme.border, theme.surface, theme.textPrimary],
  );

  const handleSave = async () => {
    if (!name || name.trim() === '') {
      Alert.alert('Name required', 'Please enter a customer name.');
      return;
    }

    setIsLoading(true);
    try {
  await dispatch(addCustomer({ name: name.trim() })).unwrap();
      router.back();
    } catch (error: any) {
      Alert.alert('Unable to add customer', error?.message || 'Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenContainer edges={['top', 'left', 'right']}>
      <Stack.Screen options={{ title: 'Add Customer' }} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 48, gap: 24 }}
        >
          <View>
            <Text style={{ color: theme.textPrimary, fontSize: 32, fontWeight: '800' }}>Create a new customer</Text>
            <Text style={{ color: theme.textSecondary, marginTop: 8 }}>
              Add someone you regularly work with to keep their transactions organised.
            </Text>
          </View>

          <Surface>
            <Text style={{ color: theme.textSecondary, fontSize: 14, fontWeight: '600' }}>Customer name</Text>
            <TextInput
              style={inputStyle}
              placeholder="E.g. Keval Shah"
              placeholderTextColor={theme.textSecondary}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              autoFocus
              returnKeyType="next"
            />

          </Surface>

          <TouchableOpacity
            onPress={handleSave}
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
            <Text style={{ color: theme.onAccent, fontSize: 17, fontWeight: '700' }}>Save Customer</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}