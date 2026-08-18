import { DeviceClient, getLocaleAndTimeZone } from 'bubbles-npm-user-app';
import * as Notifications from 'expo-notifications';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

const DEFAULT_ANDROID_CHANNEL_ID = 'default';

const { locale, timeZone } = getLocaleAndTimeZone();
// const appVersion = getAppVersion();
export type SupportedPlatform = 'android' | 'ios';
export type NativeTokenType = 'fcm' | 'apns';
export type PermissionRequestOptions = Parameters<typeof Notifications.requestPermissionsAsync>[0];

export interface GetDeviceTokenOptions {
  requestPermissions?: boolean;
  permissionRequestOptions?: PermissionRequestOptions;
}

export interface DeviceTokenResult {
  platform: SupportedPlatform;
  tokenType: NativeTokenType;
  token: string;
}

function parseAliasingInput(value: string): string[] {
  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
}

function getCurrentPlatform(): SupportedPlatform {
  if (Platform.OS === 'android' || Platform.OS === 'ios') {
    return Platform.OS;
  }

  throw new Error(
    `Unsupported platform: ${Platform.OS}. This package only supports iOS and Android.`,
  );
}

function getDeviceApiBaseUrl() {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:4000';
  }

  return 'http://localhost:4000';
}

async function ensureNotificationPermissions(options?: GetDeviceTokenOptions): Promise<void> {
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

function describePermission(settings: Notifications.NotificationPermissionsStatus) {
  if (Platform.OS === 'ios' && settings.ios?.status != null) {
    return Notifications.IosAuthorizationStatus[settings.ios.status].toLowerCase();
  }

  return settings.status;
}

async function syncDeviceWithApi({
  authToken,
  appId,
  userId,
  aliasing,
  platform,
  pushToken,
  notificationsEnabled,
  deviceId,
}: {
  authToken: string;
  appId: string;
  userId: string;
  aliasing: string[];
  platform: SupportedPlatform;
  pushToken: string;
  notificationsEnabled: boolean;
  deviceId: string | null;
}) {
  const client = new DeviceClient({
    baseUrl: getDeviceApiBaseUrl(),
    token: authToken,
  });

  const payload = {
    app_id: appId,
    app_version: "appVersion",
    user_id: userId,
    aliasing,
    locale,
    platform,
    push_token: pushToken,
    notifications_enabled: notificationsEnabled,
    timezone: timeZone,
  };

  if (deviceId) {
    await client.updateDevice(deviceId, payload);
    return { action: 'updated' as const, deviceId };
  }

  const createdDevice = await client.createDevice<Record<string, unknown>>(payload);
  const createdDeviceId =
    typeof createdDevice?.id === 'string' || typeof createdDevice?.id === 'number'
      ? String(createdDevice.id)
      : null;

  return { action: 'created' as const, deviceId: createdDeviceId };
}

async function getDevicePushTokenAsync() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(DEFAULT_ANDROID_CHANNEL_ID, {
      name: 'Default',
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  if (Platform.OS === 'web') {
    throw new Error('Push tokens are only available on native iOS and Android apps.');
  }

  const tokenResult = await getDeviceToken({
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
    token: tokenResult.token,
    permissionStatus: describePermission(currentSettings),
    tokenType: tokenResult.tokenType,
    platform: tokenResult.platform,
    notificationsEnabled: currentSettings.granted,
  };
}

export function PushTokenCard() {
  const [authToken, setAuthToken] = useState('');
  const [appId, setAppId] = useState('');
  const [userId, setUserId] = useState('');
  const [aliasingInput, setAliasingInput] = useState('');
  const [devicePushToken, setDevicePushToken] = useState<string | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [deviceSyncStatus, setDeviceSyncStatus] = useState<string | null>(null);
  const [tokenType, setTokenType] = useState<string>('android');
  const [permissionStatus, setPermissionStatus] = useState<string>('unknown');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGetToken = async () => {
    setIsLoading(true);
    setError(null);
    setDeviceSyncStatus(null);

    try {
      if (!authToken.trim()) {
        throw new Error('Enter a bearer auth token first.');
      }

      if (!appId.trim()) {
        throw new Error('Enter an app id first.');
      }

      if (!userId.trim()) {
        throw new Error('Enter a user id first.');
      }

      const result = await getDevicePushTokenAsync();
      setDevicePushToken(result.token);
      setTokenType(result.tokenType);
      setPermissionStatus(result.permissionStatus);

      const syncResult = await syncDeviceWithApi({
        authToken: authToken.trim(),
        appId: appId.trim(),
        userId: userId.trim(),
        aliasing: parseAliasingInput(aliasingInput),
        platform: result.platform,
        pushToken: result.token,
        notificationsEnabled: result.notificationsEnabled,
        deviceId,
      });

      setDeviceId(syncResult.deviceId);
      setDeviceSyncStatus(
        syncResult.action === 'created'
          ? syncResult.deviceId
            ? 'Device created'
            : 'Device created, but no device id was returned by the API.'
          : 'Device updated',
      );
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Failed to get the device push token.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.headerText}>
          <ThemedText type="subtitle">Device push token</ThemedText>
          <ThemedText themeColor="textSecondary">
            Request notification permission, fetch the native push token, and create or update the device in your API.
          </ThemedText>
        </View>

        <Pressable onPress={handleGetToken} style={({ pressed }) => [pressed && styles.pressed]}>
          <ThemedView type="backgroundSelected" style={styles.button}>
            <ThemedText type="smallBold">{isLoading ? 'Loading…' : 'Get token'}</ThemedText>
          </ThemedView>
        </Pressable>
      </View>

      <View style={styles.inputGroup}>
        <ThemedText type="smallBold">Bearer auth token</ThemedText>
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          onChangeText={setAuthToken}
          placeholder="Paste auth token here"
          placeholderTextColor="#8A8F98"
          style={styles.input}
          value={authToken}
        />

        <ThemedText type="smallBold">App ID</ThemedText>
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          onChangeText={setAppId}
          placeholder="Enter app id"
          placeholderTextColor="#8A8F98"
          style={styles.input}
          value={appId}
        />

        <ThemedText type="smallBold">User ID</ThemedText>
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          onChangeText={setUserId}
          placeholder="Enter user id"
          placeholderTextColor="#8A8F98"
          style={styles.input}
          value={userId}
        />

        <ThemedText type="smallBold">Aliasing</ThemedText>
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          onChangeText={setAliasingInput}
          placeholder="Enter comma-separated aliases"
          placeholderTextColor="#8A8F98"
          style={styles.input}
          value={aliasingInput}
        />

        <ThemedText type="small" themeColor="textSecondary">
          Device API base URL: {getDeviceApiBaseUrl()}
        </ThemedText>
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

      <View style={styles.metaRow}>
        <ThemedText type="small">Platform</ThemedText>
        <ThemedText type="smallBold" style={styles.metaValue}>
          {Platform.OS === 'android' || Platform.OS === 'ios' ? Platform.OS : 'unsupported'}
        </ThemedText>
      </View>

      <View style={styles.metaRow}>
        <ThemedText type="small">Device ID</ThemedText>
        <ThemedText type="smallBold" style={styles.metaValue}>
          {deviceId ?? 'Not created yet'}
        </ThemedText>
      </View>

      <View style={styles.tokenBlock}>
        <ThemedText type="smallBold">Device push token</ThemedText>
        {devicePushToken ? (
          <ThemedText selectable type="code" style={styles.tokenText}>
            {devicePushToken}
          </ThemedText>
        ) : (
          <ThemedText themeColor="textSecondary">
            Tap {Platform.OS === 'web' ? 'Get token on a native build' : 'Get token'} to request permission and load the token.
          </ThemedText>
        )}
      </View>

      {deviceSyncStatus ? (
        <ThemedView type="backgroundSelected" style={styles.messageBox}>
          <ThemedText>{deviceSyncStatus}</ThemedText>
        </ThemedView>
      ) : null}

      {error ? (
        <ThemedView type="backgroundSelected" style={styles.messageBox}>
          <ThemedText>{error}</ThemedText>
        </ThemedView>
      ) : null}

      <ThemedView type="backgroundSelected" style={styles.messageBox}>
        <ThemedText type="small">
          Use a native build to test push tokens. On Android, Expo SDK 57 push notifications are not available in Expo Go.
        </ThemedText>
      </ThemedView>

      <ThemedView type="backgroundSelected" style={styles.messageBox}>
        <ThemedText type="small">
          On Android emulators, `localhost` points to the emulator itself, so this uses `10.0.2.2:4000` for your local API.
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
  inputGroup: {
    gap: Spacing.two,
  },
  input: {
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    backgroundColor: '#FFFFFF',
    color: '#000000',
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
