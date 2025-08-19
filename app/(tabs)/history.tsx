import React from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import OrderHistory from '../../screens/OrderHistory';

const queryClient = new QueryClient();

export default function HistoryScreen() {
  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ headerTitle: 'Order History' }} />
      <QueryClientProvider client={queryClient}>
        <OrderHistory />
      </QueryClientProvider>
    </View>
  );
}
