import type { BubblesNotificationResponseEvent } from '@fishonfire/bubbles-expo';
import { DarkTheme, DefaultTheme, Href, Stack, ThemeProvider, router } from 'expo-router';
import { useColorScheme } from 'react-native';

import { DemoNotificationsProvider } from '@/notifications/demo-provider';

function handleNotificationResponse(event: BubblesNotificationResponseEvent) {
  if (event.url) {
    router.push(event.url as Href);
  }
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <DemoNotificationsProvider
      onNotificationResponse={handleNotificationResponse}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }} />
      </ThemeProvider>
    </DemoNotificationsProvider>
  );
}
