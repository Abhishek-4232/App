import React from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CreateOrder from '../../screens/CreateOrder';

const queryClient = new QueryClient();

export default function OrdersScreen() {
  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ headerTitle: 'Create Order' }} />
      <QueryClientProvider client={queryClient}>
        <CreateOrder />
      </QueryClientProvider>
    </View>
  );
}
