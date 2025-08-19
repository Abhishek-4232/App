import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

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

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return;
    }
    token = await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig?.extra?.eas?.projectId,
    });
    console.log(token);
  } else {
    console.log('Must use physical device for Push Notifications');
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
