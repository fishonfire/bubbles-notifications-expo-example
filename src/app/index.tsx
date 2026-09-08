import { Link } from 'expo-router';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PushTokenCard } from '@/components/push-token-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';

export default function HomeScreen() {
  return (
    <ThemedView style={styles.container}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}>
        <SafeAreaView style={styles.safeArea}>
          <ThemedView style={styles.heroSection}>
            <ThemedText type="smallBold" themeColor="textSecondary" style={styles.eyebrow}>
              Bubbles Notifications
            </ThemedText>
            <ThemedText type="title" style={styles.title}>
              Device registration demo
            </ThemedText>
            <ThemedText style={styles.subtitle} themeColor="textSecondary">
              This app only exists to exercise{' '}
              <ThemedText type="code">@fishonfire/bubbles-expo</ThemedText> device registration,
              push token retrieval, and notification tap routing.
            </ThemedText>
          </ThemedView>

          <PushTokenCard />

          <ThemedView type="backgroundElement" style={styles.noteCard}>
            <ThemedText type="smallBold">What to test</ThemedText>
            <ThemedText themeColor="textSecondary">
              Enter an app ID and user ID, sync the device from a native build, then send a push
              notification to confirm both token registration and notification response handling.
            </ThemedText>
            <Link href="/notification-example" style={styles.routeLink}>
              <ThemedText type="smallBold">Open notification route example</ThemedText>
            </Link>
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
  noteCard: {
    alignSelf: 'stretch',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.four,
    borderRadius: Spacing.four,
  },
  routeLink: {
    alignSelf: 'flex-start',
    marginTop: Spacing.one,
  },
});
