import * as Notifications from 'expo-notifications';
// import { getFCMToken } from 'bubbles-npm-get-device-token';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

const DEFAULT_ANDROID_CHANNEL_ID = 'default';

// the npm package:
// import * as Notifications from 'expo-notifications';
// import { Platform } from 'react-native';

export type SupportedPlatform = 'android' | 'ios';
export type NativeTokenType = 'fcm' | 'apns';
export type PermissionRequestOptions = Parameters<
  typeof Notifications.requestPermissionsAsync
>[0];

export interface GetDeviceTokenOptions {
  requestPermissions?: boolean;
  permissionRequestOptions?: PermissionRequestOptions;
}

export interface DeviceTokenResult {
  platform: SupportedPlatform;
  tokenType: NativeTokenType;
  token: string;
}

function getCurrentPlatform(): SupportedPlatform {
  if (Platform.OS === 'android' || Platform.OS === 'ios') {
    return Platform.OS;
  }

  throw new Error(
    `Unsupported platform: ${Platform.OS}. This package only supports iOS and Android.`,
  );
}

async function ensureNotificationPermissions(
  options?: GetDeviceTokenOptions,
): Promise<void> {
  if (options?.requestPermissions === false) {
    return;
  }

  const existingPermissions = await Notifications.getPermissionsAsync();

  if (existingPermissions.granted) {
    return;
  }

  const requestedPermissions = await Notifications.requestPermissionsAsync(
    options?.permissionRequestOptions,
  );

  if (!requestedPermissions.granted) {
    throw new Error('Push notification permission was not granted.');
  }
}

export async function getDeviceToken(
  options?: GetDeviceTokenOptions,
): Promise<DeviceTokenResult> {
  const platform = getCurrentPlatform();

  await ensureNotificationPermissions(options);

  const nativeToken = await Notifications.getDevicePushTokenAsync();

  return {
    platform,
    tokenType: platform === 'android' ? 'fcm' : 'apns',
    token: nativeToken.data,
  };
}

export async function getFCMToken(
  options?: GetDeviceTokenOptions,
): Promise<string> {
  const platform = getCurrentPlatform();

  if (platform === 'ios') {
    throw new Error(
      'expo-notifications returns an APNs token on iOS, not an FCM token. Use a Firebase Messaging native integration if you need the iOS FCM registration token.',
    );
  }

  const tokenResult = await getDeviceToken(options);
  console.log("This is the token:")
  console.log(tokenResult.token)
  return tokenResult.token;
}
// end of npm package

function describePermission(settings: Notifications.NotificationPermissionsStatus) {
  if (Platform.OS === 'ios' && settings.ios?.status != null) {
    return Notifications.IosAuthorizationStatus[settings.ios.status].toLowerCase();
  }

  return settings.status;
}

async function getDevicePushTokenAsync() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(DEFAULT_ANDROID_CHANNEL_ID, {
      name: 'Default',
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  if (Platform.OS === 'web') {
    throw new Error('FCM registration tokens are only available from a native Android app.');
  }

  const token = await getFCMToken({
    requestPermissions: true,
    permissionRequestOptions: {
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
      },
    },
  });

  const currentSettings = await Notifications.getPermissionsAsync();

  return {
    token,
    permissionStatus: describePermission(currentSettings),
    tokenType: 'fcm',
  };
}

export function PushTokenCard() {
  const [devicePushToken, setDevicePushToken] = useState<string | null>(null);
  const [tokenType, setTokenType] = useState<string>('android');
  const [permissionStatus, setPermissionStatus] = useState<string>('unknown');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGetToken = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getDevicePushTokenAsync();
      setDevicePushToken(result.token);
      setTokenType(result.tokenType);
      setPermissionStatus(result.permissionStatus);
    } catch (caughtError) {
      setDevicePushToken(null);
      setError(caughtError instanceof Error ? caughtError.message : 'Failed to get the FCM registration token.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.headerText}>
          <ThemedText type="subtitle">FCM registration token</ThemedText>
          <ThemedText themeColor="textSecondary">
            Request notification permission and fetch the native Android device token used for Firebase Cloud Messaging.
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
        <ThemedText type="small">Token type</ThemedText>
        <ThemedText type="smallBold" style={styles.metaValue}>
          {tokenType}
        </ThemedText>
      </View>

      <View style={styles.tokenBlock}>
        <ThemedText type="smallBold">FCM registration token</ThemedText>
        {devicePushToken ? (
          <ThemedText selectable type="code" style={styles.tokenText}>
            {devicePushToken}
          </ThemedText>
        ) : (
          <ThemedText themeColor="textSecondary">
            Tap {Platform.OS === 'web' ? 'Get token on a native Android build' : 'Get token'} to request permission and load the token.
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
          Android FCM tokens are not available in Expo Go for SDK 57. Use `npx expo run:android` or a development build on Android.
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
