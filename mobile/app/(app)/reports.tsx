// mobile/app/(app)/reports.tsx

import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, Dimensions, ScrollView } from 'react-native'; 
import { PieChart } from 'react-native-chart-kit';
import { useAppDispatch, useAppSelector } from '../../hooks/useAuth';
import { fetchReportSummary } from '../../store/slices/reportSlice';

const screenWidth = Dimensions.get('window').width;

export default function ReportsScreen() {
  const dispatch = useAppDispatch();
  const { data, isLoading, error } = useAppSelector(
    (state) => state.reports
  );

  useEffect(() => {
    dispatch(fetchReportSummary());
  }, [dispatch]);

  const pieData = [
    {
      name: 'Income',
      value: data?.totalIncome || 0,
      color: '#4CAF50', // Green
      legendFontColor: '#333333',
      legendFontSize: 14,
    },
    {
      name: 'Expense',
      value: data?.totalExpense || 0,
      color: '#F44336', // Red
      legendFontColor: '#333333',
      legendFontSize: 14,
    },
  ].filter((d) => d.value > 0);

  const netProfit = (data?.totalIncome || 0) - (data?.totalExpense || 0);
  const netColor = netProfit >= 0 ? 'text-green-600' : 'text-red-600';

  const chartConfig = {
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  };

  return (
    // 2. Replace <View> with <ScrollView>
    //    We move the padding to `contentContainerClassName`
    <ScrollView 
      className="flex-1 bg-white"
      contentContainerClassName="p-4"
    >
      <Text className="text-3xl font-bold text-black mb-6">
        Reports
      </Text>

      {isLoading && <ActivityIndicator size="large" color="#000000" />}

      {error && (
        <Text className="text-red-500 text-center">{error}</Text>
      )}

      {data && !isLoading && (
        <View>
          <Text className="text-gray-800 text-lg text-center mb-4">
            Overall Summary
          </Text>

          {pieData.length > 0 ? (
            <PieChart
              data={pieData}
              width={screenWidth - 32}
              height={220}
              chartConfig={chartConfig}
              accessor={'value'}
              backgroundColor={'transparent'}
              paddingLeft={'15'}
              absolute
            />
          ) : (
            <Text className="text-gray-500 text-center my-10">
              No transaction data to display.
            </Text>
          )}

          {/* Summary Cards */}
          <View className="mt-6">
            <View className="flex-row justify-between bg-white shadow-md p-4 rounded-lg mb-3">
              <Text className="text-green-600 text-lg">
                Total Income
              </Text>
              <Text className="text-green-600 text-lg font-bold">
                ₹{data.totalIncome.toFixed(2)}
              </Text>
            </View>
            <View className="flex-row justify-between bg-white shadow-md p-4 rounded-lg mb-3">
              <Text className="text-red-600 text-lg">
                Total Expense
              </Text>
              <Text className="text-red-600 text-lg font-bold">
                ₹{data.totalExpense.toFixed(2)}
              </Text>
            </View>
            <View className="flex-row justify-between bg-white shadow-md p-4 rounded-lg">
              <Text className={`${netColor} text-lg`}>
                Remaining Amount
              </Text>
              <Text className={`${netColor} text-lg font-bold`}>
                ₹{netProfit.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>
      )}
    </ScrollView> // 3. Close the ScrollView
  );
}