import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';

export default function NotificationExampleScreen() {
  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
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
              Routed from notification
            </ThemedText>
            <ThemedText type="title" style={styles.title}>
              Push notification route
            </ThemedText>
            <ThemedText style={styles.subtitle} themeColor="textSecondary">
              This screen is opened by the Bubbles notification response handler when the push
              notification data contains this route.
            </ThemedText>
          </ThemedView>

          <ThemedView type="backgroundElement" style={styles.routeCard}>
            <ThemedText type="smallBold">Notification data route</ThemedText>
            <ThemedText selectable type="code" style={styles.routeValue}>
              /notification-example
            </ThemedText>
          </ThemedView>

          <View style={styles.detailGroup}>
            <ThemedText type="smallBold">How it works</ThemedText>
            <ThemedText themeColor="textSecondary">
              The Bubbles package normalizes the push notification data, reads the `url` field, and
              passes it to the app{"'"}s `onNotificationResponse` callback. The root layout then calls
              Expo Router with that route.
            </ThemedText>
          </View>
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
  routeCard: {
    alignSelf: 'stretch',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.four,
    borderRadius: Spacing.four,
  },
  routeValue: {
    fontSize: 14,
    lineHeight: 20,
  },
  detailGroup: {
    alignSelf: 'stretch',
    gap: Spacing.two,
  },
  pressed: {
    opacity: 0.75,
  },
});
