// mobile/app/(app)/reports.tsx

import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, ActivityIndicator, Dimensions, ScrollView, TouchableOpacity, LayoutChangeEvent } from 'react-native';
import { Stack, useFocusEffect } from 'expo-router';
import Svg, { Circle, G } from 'react-native-svg';
import { useAppDispatch, useAppSelector } from '@/hooks/useAuth';
import { fetchReportSummary } from '@/store/slices/reportSlice';
import { ScreenContainer, Surface } from '@/components/ui/ScreenContainer';
import { useTheme } from '@/components/ThemeProvider';

const screenWidth = Dimensions.get('window').width;

export default function ReportsScreen() {
  const dispatch = useAppDispatch();
  const { data, isLoading, error } = useAppSelector((state) => state.reports);
  const { theme } = useTheme();
  const [surfaceWidth, setSurfaceWidth] = useState(screenWidth - 48);
  const handleRetry = () => {
    dispatch(fetchReportSummary());
  };

  useFocusEffect(
    useCallback(() => {
      dispatch(fetchReportSummary());
    }, [dispatch]),
  );

  const pieData = useMemo(
    () =>
      [
        {
          name: 'Income',
          value: data?.totalIncome ?? 0,
          color: theme.success,
          legendFontColor: theme.textSecondary,
          legendFontSize: 14,
        },
        {
          name: 'Expense',
          value: data?.totalExpense ?? 0,
          color: theme.danger,
          legendFontColor: theme.textSecondary,
          legendFontSize: 14,
        },
      ].filter((segment) => segment.value > 0),
    [data?.totalExpense, data?.totalIncome, theme.danger, theme.success, theme.textSecondary],
  );

  const netBalance = useMemo(
    () => (data ? data.totalIncome - data.totalExpense : 0),
    [data],
  );

  const hasData = pieData.length > 0;
  const chartDiameter = Math.max(Math.min(surfaceWidth - 48, 320), 180);
  const totalValue = useMemo(() => pieData.reduce((sum, segment) => sum + segment.value, 0), [pieData]);
  const strokeWidth = useMemo(() => Math.min(Math.max(chartDiameter * 0.18, 20), 36), [chartDiameter]);
  const chartRadius = useMemo(() => chartDiameter / 2 - strokeWidth / 2, [chartDiameter, strokeWidth]);
  const chartCircumference = useMemo(() => 2 * Math.PI * chartRadius, [chartRadius]);

  const handleSurfaceLayout = useCallback((event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setSurfaceWidth((prev) => (Math.abs(prev - width) > 1 ? width : prev));
  }, []);

  const donutChart = useMemo(() => {
    if (!hasData || totalValue <= 0) {
      return null;
    }

    let cumulativeOffset = 0;

    return (
      <View
        style={{
          width: chartDiameter,
          height: chartDiameter,
          alignItems: 'center',
          justifyContent: 'center',
          alignSelf: 'center',
        }}
      >
        <Svg width={chartDiameter} height={chartDiameter} viewBox={`0 0 ${chartDiameter} ${chartDiameter}`}>
          <G rotation={-90} origin={`${chartDiameter / 2}, ${chartDiameter / 2}`}>
            <Circle
              cx={chartDiameter / 2}
              cy={chartDiameter / 2}
              r={chartRadius}
              stroke={theme.surfaceMuted}
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            {pieData.map((segment) => {
              const segmentRatio = segment.value / totalValue;
              const segmentLength = chartCircumference * segmentRatio;
              const circle = (
                <Circle
                  key={segment.name}
                  cx={chartDiameter / 2}
                  cy={chartDiameter / 2}
                  r={chartRadius}
                  stroke={segment.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${segmentLength} ${chartCircumference}`}
                  strokeDashoffset={cumulativeOffset}
                  strokeLinecap="round"
                  fill="transparent"
                />
              );
              cumulativeOffset -= segmentLength;
              return circle;
            })}
          </G>
        </Svg>
        <View style={{ position: 'absolute', alignItems: 'center' }}>
          <Text style={{ color: theme.textPrimary, fontSize: 20, fontWeight: '800' }}>₹{totalValue.toFixed(2)}</Text>
          <Text style={{ color: theme.textSecondary, fontSize: 12, marginTop: 4 }}>Total volume</Text>
        </View>
      </View>
    );
  }, [chartCircumference, chartDiameter, chartRadius, hasData, pieData, strokeWidth, theme.surfaceMuted, theme.textPrimary, theme.textSecondary, totalValue]);

  return (
    <ScreenContainer edges={['top', 'left', 'right']}>
      <Stack.Screen options={{ title: 'Reports' }} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 16,
          paddingBottom: 48,
          gap: 24,
        }}
      >
        <View>
          <Text style={{ color: theme.textPrimary, fontSize: 32, fontWeight: '800' }}>Reports</Text>
          <Text style={{ color: theme.textSecondary, marginTop: 8 }}>
            Visualise how money moves in and out to stay on top of decisions.
          </Text>
        </View>

        {isLoading && !data ? (
          <Surface style={{ alignItems: 'center', paddingVertical: 48 }}>
            <ActivityIndicator size="large" color={theme.accent} />
            <Text style={{ color: theme.textSecondary, marginTop: 12 }}>Loading your summary…</Text>
          </Surface>
        ) : null}

        {error ? (
          <Surface style={{ borderColor: theme.danger, borderWidth: 1 }}>
            <Text style={{ color: theme.danger, fontSize: 16, fontWeight: '700' }}>Unable to load report</Text>
            <Text style={{ color: theme.textSecondary, marginTop: 6 }}>{error}</Text>
            <TouchableOpacity
              onPress={handleRetry}
              activeOpacity={0.8}
              style={{
                marginTop: 16,
                alignSelf: 'flex-start',
                backgroundColor: theme.accent,
                paddingHorizontal: 18,
                paddingVertical: 10,
                borderRadius: 14,
              }}
            >
              <Text style={{ color: theme.onAccent, fontWeight: '700' }}>Try again</Text>
            </TouchableOpacity>
          </Surface>
        ) : null}

        {data ? (
          <>
            <Surface style={{ alignItems: 'center', paddingTop: 24 }} onLayout={handleSurfaceLayout}>
              <Text style={{ color: theme.textSecondary, fontSize: 15, fontWeight: '600', marginBottom: 16 }}>
                Income vs Expense
              </Text>
              {hasData && donutChart ? (
                <>
                  {donutChart}
                  <View
                    style={{
                      flexDirection: 'row',
                      flexWrap: 'wrap',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginTop: 18,
                    }}
                  >
                    {pieData.map((segment) => (
                      <View
                        key={segment.name}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          marginHorizontal: 6,
                          marginVertical: 4,
                        }}
                      >
                        <View
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: 9999,
                            backgroundColor: segment.color,
                            marginRight: 6,
                          }}
                        />
                        <Text style={{ color: theme.textPrimary, fontWeight: '700', marginRight: 6 }}>
                          {segment.name}
                        </Text>
                        <Text style={{ color: theme.textSecondary }}>₹{segment.value.toFixed(2)}</Text>
                      </View>
                    ))}
                  </View>
                </>
              ) : (
                <Text style={{ color: theme.textSecondary, textAlign: 'center', marginVertical: 16 }}>
                  No transactions yet. Start logging income and expenses to unlock insights.
                </Text>
              )}
            </Surface>

            <Surface>
              <Text style={{ color: theme.textSecondary, fontSize: 15, fontWeight: '600' }}>Net Balance</Text>
              <Text
                style={{
                  color: netBalance >= 0 ? theme.success : theme.danger,
                  fontSize: 32,
                  fontWeight: '800',
                  marginTop: 6,
                }}
              >
                ₹{netBalance.toFixed(2)}
              </Text>
              <Text style={{ color: theme.textSecondary, marginTop: 8 }}>
                {netBalance >= 0
                  ? 'You are closing in the green. Keep building that buffer!'
                  : 'Spending is ahead of income right now. Review where you can ease back.'}
              </Text>
            </Surface>

            <View style={{ flexDirection: 'row', gap: 16 }}>
              <Surface style={{ flex: 1 }}>
                <Text style={{ color: theme.textSecondary, fontSize: 15, fontWeight: '600' }}>Total Income</Text>
                <Text style={{ color: theme.success, fontSize: 26, fontWeight: '800', marginTop: 6 }}>
                  ₹{data.totalIncome.toFixed(2)}
                </Text>
                <Text style={{ color: theme.textSecondary, marginTop: 6 }}>All inflows captured this period.</Text>
              </Surface>
              <Surface style={{ flex: 1 }}>
                <Text style={{ color: theme.textSecondary, fontSize: 15, fontWeight: '600' }}>Total Expense</Text>
                <Text style={{ color: theme.danger, fontSize: 26, fontWeight: '800', marginTop: 6 }}>
                  ₹{data.totalExpense.toFixed(2)}
                </Text>
                <Text style={{ color: theme.textSecondary, marginTop: 6 }}>Everything you have spent so far.</Text>
              </Surface>
            </View>
          </>
        ) : null}
      </ScrollView>
    </ScreenContainer>
  );
}