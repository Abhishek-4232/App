import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import 'react-native-reanimated';
import { useEffect } from 'react';

import { useColorScheme } from '@/hooks/useColorScheme';
import { configurePushNotifications, checkLowStockProducts } from '../utils/notifications';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    async function initializeNotifications() {
      try {
        // Only proceed with push notification setup if not on web
        if (Platform.OS !== 'web') {
          const token = await configurePushNotifications();
          if (token) {
            console.log('Push notification token:', token);
          }
        }
        
        // Check for low stock products initially and every 5 minutes
        await checkLowStockProducts();
        const interval = setInterval(checkLowStockProducts, 5 * 60 * 1000);
        
        return () => clearInterval(interval);
      } catch (error) {
        // Log error but don't break the app
        console.warn('Notification setup warning:', error);
      }
    }

    initializeNotifications();
  }, []);

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
