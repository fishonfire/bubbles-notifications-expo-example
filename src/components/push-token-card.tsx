import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

const DEFAULT_ANDROID_CHANNEL_ID = 'default';

function getProjectId() {
  return Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId ?? null;
}

function hasNotificationPermission(settings: Notifications.NotificationPermissionsStatus) {
  if (Platform.OS === 'ios') {
    return (
      settings.granted ||
      settings.ios?.status === Notifications.IosAuthorizationStatus.AUTHORIZED ||
      settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
    );
  }

  return settings.granted;
}

function describePermission(settings: Notifications.NotificationPermissionsStatus) {
  if (Platform.OS === 'ios' && settings.ios?.status != null) {
    return Notifications.IosAuthorizationStatus[settings.ios.status].toLowerCase();
  }

  return settings.status;
}

async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(DEFAULT_ANDROID_CHANNEL_ID, {
      name: 'Default',
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  const existingSettings = await Notifications.getPermissionsAsync();
  let currentSettings = existingSettings;

  if (!hasNotificationPermission(existingSettings)) {
    currentSettings = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
      },
    });
  }

  if (!hasNotificationPermission(currentSettings)) {
    throw new Error('Notification permission was not granted.');
  }

  const projectId = getProjectId();
  if (!projectId) {
    throw new Error('No EAS projectId was found. Add expo.extra.eas.projectId to app.json or configure EAS before requesting an Expo push token.');
  }

  const token = await Notifications.getExpoPushTokenAsync({ projectId });

  return {
    token: token.data,
    permissionStatus: describePermission(currentSettings),
    projectId,
  };
}

export function PushTokenCard() {
  const detectedProjectId = useMemo(() => getProjectId(), []);
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<string>('unknown');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGetToken = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await registerForPushNotificationsAsync();
      setExpoPushToken(result.token);
      setPermissionStatus(result.permissionStatus);
    } catch (caughtError) {
      setExpoPushToken(null);
      setError(caughtError instanceof Error ? caughtError.message : 'Failed to get Expo push token.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.headerText}>
          <ThemedText type="subtitle">Push notifications</ThemedText>
          <ThemedText themeColor="textSecondary">
            Request notification permission and fetch the Expo push token for this app.
          </ThemedText>
        </View>

        <Pressable onPress={handleGetToken} style={({ pressed }) => [pressed && styles.pressed]}>
          <ThemedView type="backgroundSelected" style={styles.button}>
            <ThemedText type="smallBold">{isLoading ? 'Loading…' : 'Get token'}</ThemedText>
          </ThemedView>
        </Pressable>
      </View>

      <View style={styles.metaRow}>
        <ThemedText type="small">Permission</ThemedText>
        <ThemedText type="smallBold">{permissionStatus}</ThemedText>
      </View>

      <View style={styles.metaRow}>
        <ThemedText type="small">Project ID</ThemedText>
        <ThemedText type="smallBold" style={styles.metaValue}>
          {detectedProjectId ?? 'Missing'}
        </ThemedText>
      </View>

      <View style={styles.tokenBlock}>
        <ThemedText type="smallBold">Expo push token</ThemedText>
        {expoPushToken ? (
          <ThemedText selectable type="code" style={styles.tokenText}>
            {expoPushToken}
          </ThemedText>
        ) : (
          <ThemedText themeColor="textSecondary">
            Tap {Platform.OS === 'web' ? 'Get token on a native build' : 'Get token'} to request permission and load the token.
          </ThemedText>
        )}
      </View>

      {error ? (
        <ThemedView type="backgroundSelected" style={styles.messageBox}>
          <ThemedText>{error}</ThemedText>
        </ThemedView>
      ) : null}

      <ThemedView type="backgroundSelected" style={styles.messageBox}>
        <ThemedText type="small">
          Android remote push notifications are not available in Expo Go for SDK 57. Use a development build to test Android push tokens.
        </ThemedText>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    alignSelf: 'stretch',
    gap: Spacing.three,
    borderRadius: Spacing.four,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.four,
  },
  headerRow: {
    gap: Spacing.three,
  },
  headerText: {
    gap: Spacing.one,
  },
  button: {
    alignSelf: 'flex-start',
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  metaValue: {
    flexShrink: 1,
    textAlign: 'right',
  },
  tokenBlock: {
    gap: Spacing.two,
  },
  tokenText: {
    lineHeight: 18,
  },
  messageBox: {
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  pressed: {
    opacity: 0.75,
  },
});
