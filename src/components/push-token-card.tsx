import { useBubblesNotifications } from '@fishonfire/bubbles-expo';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useDemoNotificationsConfig } from '@/notifications/demo-provider';

export function PushTokenCard() {
  const {
    registerDevice,
    deviceId,
    pushToken,
    tokenType,
    permissionStatus,
    isSyncing,
    error,
  } = useBubblesNotifications();
  const {
    appIdInput,
    setAppIdInput,
    appKeyInput,
    setAppKeyInput,
    userIdInput,
    setUserIdInput,
    aliasingInput,
    setAliasingInput,
    apiBaseUrl,
  } = useDemoNotificationsConfig();
  const [deviceSyncStatus, setDeviceSyncStatus] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const displayError = localError ?? error?.message ?? null;

  function handleAppIdChange(value: string) {
    setAppIdInput(value);
    setDeviceSyncStatus(null);
    setLocalError(null);
  }

  function handleAppKeyChange(value: string) {
    setAppKeyInput(value);
    setDeviceSyncStatus(null);
    setLocalError(null);
  }

  function handleUserIdChange(value: string) {
    setUserIdInput(value);
    setDeviceSyncStatus(null);
    setLocalError(null);
  }

  function handleAliasingChange(value: string) {
    setAliasingInput(value);
    setDeviceSyncStatus(null);
    setLocalError(null);
  }

  const handleRegisterDevice = async () => {
    const trimmedAppId = appIdInput.trim();
    const trimmedAppKey = appKeyInput.trim();
    const trimmedUserId = userIdInput.trim();
    const hadStoredDeviceId = deviceId !== null;

    setDeviceSyncStatus(null);
    setLocalError(null);

    try {
      if (!trimmedAppId) {
        throw new Error('Enter an app id first.');
      }

      if (!trimmedAppKey) {
        throw new Error('Enter an app key first.');
      }

      if (!trimmedUserId) {
        throw new Error('Enter a user id first.');
      }

      await registerDevice();
      setDeviceSyncStatus(hadStoredDeviceId ? 'Device updated' : 'Device synced');
    } catch (caughtError) {
      setLocalError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Failed to register the device.',
      );
    }
  };

  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.headerText}>
          <ThemedText type="subtitle">Register a device</ThemedText>
          <ThemedText themeColor="textSecondary">
            Request notification permission, fetch a push token, and sync the device record
            through the Bubbles package.
          </ThemedText>
          <View style={styles.metaRow}>
            <ThemedText type="small">Device ID</ThemedText>
            <ThemedText type="smallBold" style={styles.metaValue}>
              {deviceId ?? 'Not created yet'}
            </ThemedText>
          </View>
        </View>

        <Pressable onPress={handleRegisterDevice} style={({ pressed }) => [pressed && styles.pressed]}>
          <ThemedView type="backgroundSelected" style={styles.button}>
            <ThemedText type="smallBold">
              {isSyncing ? 'Loading…' : 'Register/update device'}
            </ThemedText>
          </ThemedView>
        </Pressable>
      </View>

      <View style={styles.inputGroup}>
        <ThemedText type="smallBold">App ID</ThemedText>
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          onChangeText={handleAppIdChange}
          placeholder="Enter app id"
          placeholderTextColor="#8A8F98"
          style={styles.input}
          value={appIdInput}
        />

        <ThemedText type="smallBold">App Key</ThemedText>
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          onChangeText={handleAppKeyChange}
          placeholder="Enter app key"
          placeholderTextColor="#8A8F98"
          style={styles.input}
          value={appKeyInput}
        />

        <ThemedText type="smallBold">User ID</ThemedText>
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          onChangeText={handleUserIdChange}
          placeholder="Enter user id"
          placeholderTextColor="#8A8F98"
          style={styles.input}
          value={userIdInput}
        />

        <ThemedText type="smallBold">Aliasing</ThemedText>
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          onChangeText={handleAliasingChange}
          placeholder="Enter comma-separated aliases"
          placeholderTextColor="#8A8F98"
          style={styles.input}
          value={aliasingInput}
        />

        <ThemedText type="small" themeColor="textSecondary">
          Device API base URL: {apiBaseUrl}
        </ThemedText>
      </View>

      <View style={styles.metaRow}>
        <ThemedText type="small">Permission</ThemedText>
        <ThemedText type="smallBold">{permissionStatus}</ThemedText>
      </View>

      <View style={styles.metaRow}>
        <ThemedText type="small">Token type</ThemedText>
        <ThemedText type="smallBold" style={styles.metaValue}>
          {tokenType ?? 'unknown'}
        </ThemedText>
      </View>

      <View style={styles.metaRow}>
        <ThemedText type="small">Platform</ThemedText>
        <ThemedText type="smallBold" style={styles.metaValue}>
          {Platform.OS === 'android' || Platform.OS === 'ios' ? Platform.OS : 'unsupported'}
        </ThemedText>
      </View>

      <View style={styles.tokenBlock}>
        <ThemedText type="smallBold">Push token</ThemedText>
        {pushToken ? (
          <ThemedText selectable type="code" style={styles.tokenText}>
            {pushToken}
          </ThemedText>
        ) : (
          <ThemedText themeColor="textSecondary">
            Tap {Platform.OS === 'web' ? 'Register/update device on a native build' : 'Register/update device'} to register this device. If notifications are denied, the device is still saved without a push token.
          </ThemedText>
        )}
      </View>

      {deviceSyncStatus ? (
        <ThemedView type="backgroundSelected" style={styles.messageBox}>
          <ThemedText>{deviceSyncStatus}</ThemedText>
        </ThemedView>
      ) : null}

      {displayError ? (
        <ThemedView type="backgroundSelected" style={styles.messageBox}>
          <ThemedText>{displayError}</ThemedText>
        </ThemedView>
      ) : null}

      <ThemedView type="backgroundSelected" style={styles.messageBox}>
        <ThemedText type="small">
          Use a native build to test push tokens. On Android, Expo SDK 57 push notifications are not available in Expo Go.
        </ThemedText>
      </ThemedView>

      <ThemedView type="backgroundSelected" style={styles.messageBox}>
        <ThemedText type="small">
          On Android emulators, localhost points to the emulator itself, so this uses 10.0.2.2:4000
          for your local API.
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
