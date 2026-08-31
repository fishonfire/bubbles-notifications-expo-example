import { DarkTheme, DefaultTheme, Href, ThemeProvider, router } from 'expo-router';
import * as Notifications from 'expo-notifications';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import {
  getStringValue,
  postDeliveryStatus,
  readStoredDeviceId,
} from '@/notifications/helper';

SplashScreen.preventAutoHideAsync();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

function useNotificationObserver() {
  useEffect(() => {
    function redirect(notification: Notifications.Notification) {
      const url = notification.request.content.data?.url;
      if (typeof url === 'string') {
        router.push(url as Href);
      }
    }

    function handleNotificationTap(notification: Notifications.Notification) {
      const deviceId = readStoredDeviceId();
      const notificationId = getStringValue(notification.request.content.data?.notification_id);

      if (deviceId && notificationId) {
        void postDeliveryStatus(deviceId, notificationId, {
          status: 'notification clicked',
        });
      }

      redirect(notification);
    }

    // Handle the notification tap that may have opened the app.
    const response = Notifications.getLastNotificationResponse();
    if (response?.notification) {
      console.log('really new opeening');
      handleNotificationTap(response.notification);
    }

    // Handle notification taps that happen while the app is already running.
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('Was still running');
      handleNotificationTap(response.notification);
    });

    return () => {
      subscription.remove();
    };
  }, []);
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  useNotificationObserver();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <AppTabs />
    </ThemeProvider>
  );
}
