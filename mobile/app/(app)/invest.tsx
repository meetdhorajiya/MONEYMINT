import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView, Modal, Pressable } from 'react-native';
import { ScreenContainer, Surface } from '../../components/ui/ScreenContainer';
import { useTheme } from '../../components/ThemeProvider';
import apiClient from '../../api/client';
import { Stack } from 'expo-router';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';

type InvestQuoteResponse = {
  success?: boolean;
  advice?: {
    snapshot: string;
    opportunity: string;
    risk: string;
    action: string;
    ideas: string[];
  };
  riskNotice?: string;
  message?: string;
};

const quickCategories = [
  { label: 'Stocks', value: 'stocks', icon: 'business' as const },
  { label: 'IPO', value: 'ipo', icon: 'trending-up' as const },
  { label: 'Crypto', value: 'crypto', icon: 'logo-bitcoin' as const },
  { label: 'Commodities', value: 'commodities', icon: 'leaf' as const },
] as const;

type QuickCategoryValue = (typeof quickCategories)[number]['value'];

const categoryHints: Record<QuickCategoryValue, string> = {
  stocks: 'Indian equities across sectors (large, mid, and thematic)',
  ipo: 'Upcoming and recently listed Indian IPO opportunities',
  crypto: 'Leading digital assets accessible to Indian investors',
  commodities: 'Commodities tradable in Indian markets (precious metals, agri, energy)',
};

export default function InvestScreen() {
  const { theme } = useTheme();
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<QuickCategoryValue>(quickCategories[0].value);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<InvestQuoteResponse | null>(null);
  const [showModal, setShowModal] = useState(false);
  const ideas = result?.advice?.ideas ?? [];
  const activeCategory = quickCategories.find((item) => item.value === selectedCategory) ?? quickCategories[0];
  const activeHint = categoryHints[selectedCategory] ?? '';

  useEffect(() => {
    setResult(null);
    setShowModal(false);
  }, [selectedCategory]);

  const handleSubmit = async () => {
    if (!amount) {
      return Alert.alert('Missing information', 'Please enter an amount.');
    }

    const numeric = parseFloat(amount);
    if (Number.isNaN(numeric) || numeric <= 0) {
      return Alert.alert('Invalid amount', 'Please enter a valid number greater than zero.');
    }

    setShowModal(false);
    setLoading(true);
    setResult(null);
    try {
      const focusCategory = activeHint || selectedCategory;
      const res = await apiClient.post('/invest/quote', {
        amount: numeric,
        category: focusCategory,
      });
      setResult(res.data);
      if (res.data?.advice) {
        setShowModal(true);
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error('Invest API error', error.response?.data ?? error.message);
        const message = error.response?.data?.message || error.message || 'Failed to fetch guidance';
        Alert.alert('Error', message);
      } else {
        console.error('Invest API error', error);
        Alert.alert('Error', 'Failed to fetch guidance');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <Stack.Screen options={{ title: 'Invest' }} />

      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(15,23,42,0.55)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 24,
          }}
        >
          <Surface
            highlight
            style={{
              width: '100%',
              maxWidth: 360,
              paddingVertical: 28,
              gap: 16,
              alignItems: 'center',
            }}
          >
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: 'rgba(248,250,252,0.15)',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Ionicons name="sparkles" size={32} color={theme.onAccent} />
            </View>
            <View style={{ gap: 6, alignItems: 'center', paddingHorizontal: 12 }}>
              <Text style={{ color: theme.onAccent, fontSize: 20, fontWeight: '800' }}>Insight ready</Text>
              <Text style={{ color: theme.onAccent, opacity: 0.9, textAlign: 'center' }}>
                We prepared a quick market brief tailored to your focus area.
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setShowModal(false)}
              style={{
                backgroundColor: theme.onAccent,
                paddingVertical: 12,
                paddingHorizontal: 32,
                borderRadius: 999,
              }}
            >
              <Text style={{ color: theme.accent, fontWeight: '700' }}>View insights</Text>
            </TouchableOpacity>
          </Surface>
        </View>
      </Modal>

      <ScrollView contentContainerStyle={{ padding: 24, gap: 20 }}>
        <Surface highlight style={{ padding: 28 }}>
          <Text style={{ color: theme.onAccent, opacity: 0.7, fontSize: 14, fontWeight: '600' }}>Invest smarter</Text>
          <Text style={{ color: theme.onAccent, fontSize: 28, fontWeight: '800', marginTop: 6 }}>Get tailored market briefs</Text>
          <Text style={{ color: theme.onAccent, marginTop: 12, lineHeight: 20, opacity: 0.85 }}>
            Enter an amount, choose a focus area, and let Gemini generate a snapshot with opportunities, risks, and a next step.
          </Text>
        </Surface>

        <Surface style={{ gap: 18 }}>
          <View style={{ gap: 6 }}>
            <Text style={{ color: theme.textSecondary, fontWeight: '600' }}>Amount (₹)</Text>
            <TextInput
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
              placeholder="Amount (e.g., 1000)"
              placeholderTextColor={theme.textSecondary}
              style={{
                backgroundColor: theme.surfaceMuted,
                paddingHorizontal: 16,
                paddingVertical: 14,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: theme.border,
                color: theme.textPrimary,
                fontSize: 16,
              }}
            />
          </View>

          <View style={{ gap: 12 }}>
            <Text style={{ color: theme.textSecondary, fontWeight: '600' }}>Quick categories</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              {quickCategories.map((item) => {
                const isActive = item.value === selectedCategory;
                return (
                  <Pressable
                    key={item.value}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isActive }}
                    onPress={() => setSelectedCategory(item.value)}
                    style={{
                      paddingVertical: 10,
                      paddingHorizontal: 18,
                      borderRadius: 999,
                      backgroundColor: isActive ? theme.accent : theme.surfaceMuted,
                      borderWidth: 1,
                      borderColor: isActive ? theme.accent : theme.border,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <Ionicons name={item.icon} size={16} color={isActive ? theme.onAccent : theme.textSecondary} />
                    <Text style={{ color: isActive ? theme.onAccent : theme.textPrimary, fontWeight: '600' }}>{item.label}</Text>
                  </Pressable>
                );
              })}
            </View>
            <View
              style={{
                backgroundColor: 'rgba(37,99,235,0.08)',
                borderRadius: 14,
                borderWidth: 1,
                borderColor: theme.accent,
                padding: 14,
                gap: 4,
              }}
            >
              <Text style={{ color: theme.textPrimary, fontWeight: '700' }}>{activeCategory.label}</Text>
              <Text style={{ color: theme.textSecondary, lineHeight: 18 }}>{activeHint}</Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            style={{
              backgroundColor: theme.accent,
              paddingVertical: 16,
              borderRadius: 18,
              alignItems: 'center',
              shadowColor: theme.accent,
              shadowOpacity: 0.25,
              shadowRadius: 20,
              shadowOffset: { width: 0, height: 12 },
              elevation: 6,
            }}
          >
            {loading ? (
              <ActivityIndicator color={theme.onAccent} />
            ) : (
              <Text style={{ color: theme.onAccent, fontWeight: '700', fontSize: 16 }}>Get AI Insight</Text>
            )}
          </TouchableOpacity>
        </Surface>

        <Surface muted>
          <Text style={{ color: theme.textPrimary, fontWeight: '700', fontSize: 18, marginBottom: 6 }}>Safety note</Text>
          <Text style={{ color: theme.textSecondary, lineHeight: 20 }}>
            Insights are for educational purposes only. Verify data, consider your risk appetite, and make final decisions responsibly.
          </Text>
        </Surface>

        {result && (
          <Surface
            style={{
              backgroundColor: theme.surface,
              borderRadius: 24,
              gap: 12,
            }}
          >
            <Text style={{ color: theme.textPrimary, fontWeight: '700', fontSize: 18 }}>Market brief</Text>
            {result.riskNotice && <Text style={{ color: theme.textSecondary }}>{result.riskNotice}</Text>}

            {result.advice ? (
              <View style={{ gap: 12 }}>
                <View style={{ gap: 4 }}>
                  <Text style={{ color: theme.textSecondary, fontWeight: '600' }}>Snapshot</Text>
                  <Text style={{ color: theme.textPrimary, lineHeight: 20 }}>{result.advice.snapshot}</Text>
                </View>
                <View style={{ gap: 4 }}>
                  <Text style={{ color: theme.textSecondary, fontWeight: '600' }}>Opportunity</Text>
                  <Text style={{ color: theme.textPrimary, lineHeight: 20 }}>{result.advice.opportunity}</Text>
                </View>
                <View style={{ gap: 4 }}>
                  <Text style={{ color: theme.textSecondary, fontWeight: '600' }}>Risk</Text>
                  <Text style={{ color: theme.textPrimary, lineHeight: 20 }}>{result.advice.risk}</Text>
                </View>
                <View style={{ gap: 4 }}>
                  <Text style={{ color: theme.textSecondary, fontWeight: '600' }}>Suggested next step</Text>
                  <Text style={{ color: theme.textPrimary, lineHeight: 20 }}>{result.advice.action}</Text>
                </View>
                {ideas.length > 0 && (
                  <View style={{ gap: 8 }}>
                    <Text style={{ color: theme.textSecondary, fontWeight: '600' }}>Ideas to explore</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                      {ideas.map((idea) => (
                        <View
                          key={idea}
                          style={{
                            paddingVertical: 6,
                            paddingHorizontal: 12,
                            borderRadius: 999,
                            backgroundColor: theme.surfaceMuted,
                            borderWidth: 1,
                            borderColor: theme.border,
                          }}
                        >
                          <Text style={{ color: theme.textPrimary, fontWeight: '600' }}>{idea}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            ) : (
              <Text style={{ color: theme.textSecondary }}>No guidance received.</Text>
            )}
          </Surface>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
