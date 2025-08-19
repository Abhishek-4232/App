import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

const isWeb = Platform.OS === 'web';

// Configure default notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Register for push notifications
async function registerForPushNotificationsAsync() {
  let token;

  if (isWeb) {
    // On web, we'll just use local notifications
    return null;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (!Device.isDevice && !isWeb) {
    console.log('Must use physical device for Push Notifications');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    console.log('Failed to get push token for push notification!');
    return null;
  }

  try {
    token = await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig?.extra?.eas?.projectId,
    });
    console.log('Push token:', token);
  } catch (error) {
    console.log('Error getting push token:', error);
    // Don't throw error, just return null
    return null;
  }

  return token;
}

// Configure notifications and request permissions
export const configurePushNotifications = async () => {
  try {
    return await registerForPushNotificationsAsync();
  } catch (error) {
    console.error('Error configuring push notifications:', error);
    return null;
  }
};

// Show a local notification
export const showNotification = async (title, body) => {
  try {
    if (isWeb) {
      // Use browser notifications for web
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          new Notification(title, { body });
        }
      }
    } else {
      // Use Expo notifications for mobile
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: { data: 'goes here' },
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null, // null means show immediately
      });
    }
  } catch (error) {
    console.error('Error showing notification:', error);
  }
};

// Check for low stock products and show notifications
export const checkLowStockProducts = async () => {
  try {
    const response = await fetch('https://app-oq9q.onrender.com/api/products');
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    const products = await response.json();
    const lowStockProducts = products.filter(product => product.isLowStock);
    
    if (lowStockProducts.length > 0) {
      for (const product of lowStockProducts) {
        await showNotification(
          'Low Stock Alert',
          `${product.name} is running low (${product.quantity} remaining)`
        );
      }
    }
  } catch (error) {
    console.error('Error checking low stock products:', error);
  }
};
