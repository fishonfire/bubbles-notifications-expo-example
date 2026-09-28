import { useBubblesNotifications, type BubblesDeviceAttributeValue } from '@fishonfire/bubbles-expo';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';

const SAMPLE_ATTRIBUTE_NAME = 'plan';
const SAMPLE_ATTRIBUTE_VALUE = JSON.stringify(
  {
    tier: 'pro',
    seats: 4,
  },
  null,
  2,
);

const CODE_SAMPLE = `const { addDeviceAttribute, deviceId } = useBubblesNotifications();

if (deviceId) {
  await addDeviceAttribute('plan', {
    tier: 'pro',
    seats: 4,
  });
}`;

function parseAttributeValue(value: string): BubblesDeviceAttributeValue {
  const trimmedValue = value.trim();

  if (trimmedValue.length === 0) {
    return '';
  }

  try {
    return JSON.parse(trimmedValue) as BubblesDeviceAttributeValue;
  } catch {
    return value;
  }
}

export default function DeviceAttributesExampleScreen() {
  const { addDeviceAttribute, deviceId, isSyncing, error } = useBubblesNotifications();
  const [attributeName, setAttributeName] = useState(SAMPLE_ATTRIBUTE_NAME);
  const [attributeValue, setAttributeValue] = useState(SAMPLE_ATTRIBUTE_VALUE);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const displayError = localError ?? error?.message ?? null;

  async function handleAddAttribute() {
    const normalizedName = attributeName.trim();

    setStatusMessage(null);
    setLocalError(null);

    try {
      if (!deviceId) {
        throw new Error('Register the device before adding custom attributes.');
      }

      if (!normalizedName) {
        throw new Error('Enter an attribute name.');
      }

      await addDeviceAttribute(normalizedName, parseAttributeValue(attributeValue));
      setStatusMessage(`Synced "${normalizedName}" to device ${deviceId}.`);
    } catch (caughtError) {
      setLocalError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Failed to sync the device attribute.',
      );
    }
  }

  function handleUseSample() {
    setAttributeName(SAMPLE_ATTRIBUTE_NAME);
    setAttributeValue(SAMPLE_ATTRIBUTE_VALUE);
    setStatusMessage(null);
    setLocalError(null);
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}>
        <SafeAreaView style={styles.safeArea}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [styles.backButtonWrapper, pressed && styles.pressed]}>
            <ThemedView type="backgroundElement" style={styles.backButton}>
              <ThemedText type="smallBold">Back</ThemedText>
            </ThemedView>
          </Pressable>

          <ThemedView style={styles.heroSection}>
            <ThemedText type="smallBold" themeColor="textSecondary" style={styles.eyebrow}>
              Custom device attributes
            </ThemedText>
            <ThemedText type="title" style={styles.title}>
              Attribute sync example
            </ThemedText>
            <ThemedText style={styles.subtitle} themeColor="textSecondary">
              Use this screen after registering a device to see how an app can attach
              JSON-compatible custom data through <ThemedText type="code">bubbles-expo</ThemedText>.
            </ThemedText>
          </ThemedView>

          <ThemedView type="backgroundElement" style={styles.formCard}>
            <View style={styles.metaRow}>
              <ThemedText type="small">Device ID</ThemedText>
              <ThemedText type="smallBold" style={styles.metaValue}>
                {deviceId ?? 'Register a device first'}
              </ThemedText>
            </View>

            <View style={styles.inputGroup}>
              <ThemedText type="smallBold">Attribute name</ThemedText>
              <TextInput
                autoCapitalize="none"
                autoCorrect={false}
                onChangeText={(value) => {
                  setAttributeName(value);
                  setStatusMessage(null);
                  setLocalError(null);
                }}
                placeholder="plan"
                placeholderTextColor="#8A8F98"
                style={styles.input}
                value={attributeName}
              />

              <ThemedText type="smallBold">Attribute value</ThemedText>
              <TextInput
                autoCapitalize="none"
                autoCorrect={false}
                multiline
                onChangeText={(value) => {
                  setAttributeValue(value);
                  setStatusMessage(null);
                  setLocalError(null);
                }}
                placeholder='{"tier":"pro","seats":4}'
                placeholderTextColor="#8A8F98"
                style={[styles.input, styles.valueInput]}
                textAlignVertical="top"
                value={attributeValue}
              />
              <ThemedText type="small" themeColor="textSecondary">
                Valid JSON is sent as JSON. Plain text is sent as a string.
              </ThemedText>
            </View>

            <View style={styles.actions}>
              <Pressable onPress={handleUseSample} style={({ pressed }) => [pressed && styles.pressed]}>
                <ThemedView type="backgroundSelected" style={styles.button}>
                  <ThemedText type="smallBold">Use sample</ThemedText>
                </ThemedView>
              </Pressable>
              <Pressable
                disabled={isSyncing}
                onPress={handleAddAttribute}
                style={({ pressed }) => [pressed && styles.pressed, isSyncing && styles.disabled]}>
                <ThemedView type="backgroundSelected" style={styles.button}>
                  <ThemedText type="smallBold">
                    {isSyncing ? 'Syncing...' : 'Add attribute'}
                  </ThemedText>
                </ThemedView>
              </Pressable>
            </View>

            {statusMessage ? (
              <ThemedText type="smallBold" style={styles.successText}>
                {statusMessage}
              </ThemedText>
            ) : null}
            {displayError ? (
              <ThemedText type="smallBold" style={styles.errorText}>
                {displayError}
              </ThemedText>
            ) : null}
          </ThemedView>

          <ThemedView type="backgroundElement" style={styles.codeCard}>
            <ThemedText type="smallBold">Minimal code</ThemedText>
            <ThemedText selectable type="code" style={styles.codeBlock}>
              {CODE_SAMPLE}
            </ThemedText>
          </ThemedView>
        </SafeAreaView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    alignItems: 'center',
  },
  safeArea: {
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.five,
    paddingBottom: Spacing.five,
    gap: Spacing.four,
  },
  backButtonWrapper: {
    alignSelf: 'flex-start',
  },
  backButton: {
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  heroSection: {
    alignSelf: 'stretch',
    gap: Spacing.two,
  },
  eyebrow: {
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    maxWidth: 520,
  },
  subtitle: {
    maxWidth: 640,
  },
  formCard: {
    alignSelf: 'stretch',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.four,
    borderRadius: Spacing.four,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  metaValue: {
    flex: 1,
    textAlign: 'right',
  },
  inputGroup: {
    gap: Spacing.two,
  },
  input: {
    minHeight: 48,
    borderRadius: Spacing.two,
    borderWidth: 1,
    borderColor: '#C7CBD1',
    backgroundColor: '#FFFFFF',
    color: '#000000',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
  },
  valueInput: {
    minHeight: 144,
    fontFamily: 'monospace',
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  button: {
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  codeCard: {
    alignSelf: 'stretch',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.four,
    borderRadius: Spacing.four,
  },
  codeBlock: {
    fontSize: 13,
    lineHeight: 20,
  },
  successText: {
    color: '#177245',
  },
  errorText: {
    color: '#B42318',
  },
  disabled: {
    opacity: 0.6,
  },
  pressed: {
    opacity: 0.75,
  },
});
