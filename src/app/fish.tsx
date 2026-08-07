import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const starterFish = ['🐠', '🐟', '🐡'];

type FishButtonProps = {
  label: string;
  onPress: () => void;
};

function FishButton({ label, onPress }: FishButtonProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.buttonPressable, pressed && styles.pressed]}>
      <ThemedView type="backgroundElement" style={styles.button}>
        <ThemedText type="smallBold">{label}</ThemedText>
      </ThemedView>
    </Pressable>
  );
}

export default function FishScreen() {
  const [pond, setPond] = useState(starterFish);
  const theme = useTheme();

  const addFish = (fish: string) => {
    setPond((currentPond) => [...currentPond, fish]);
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={[styles.scrollView, { backgroundColor: theme.background }]} contentContainerStyle={styles.scrollContent}>
        <SafeAreaView style={styles.safeArea}>
          <ThemedView style={styles.header}>
          <ThemedText type="subtitle" style={styles.centerText}>
            Fish Pond
          </ThemedText>
          <ThemedText style={styles.centerText} themeColor="textSecondary">
            Tap a button to add another fish to the pond.
          </ThemedText>
        </ThemedView>

        <ThemedView type="backgroundElement" style={styles.card}>
          <ThemedText type="small" themeColor="textSecondary">
            Fish count
          </ThemedText>
          <ThemedText type="title" style={styles.countText}>
            {pond.length}
          </ThemedText>
        </ThemedView>

        <ThemedView type="backgroundElement" style={styles.card}>
          <ThemedText type="smallBold">Add a fish</ThemedText>
          <View style={styles.buttonRow}>
            <FishButton label="Add clownfish 🐠" onPress={() => addFish('🐠')} />
            <FishButton label="Add blue fish 🐟" onPress={() => addFish('🐟')} />
            <FishButton label="Add puffer 🐡" onPress={() => addFish('🐡')} />
            <FishButton label="Clear pond" onPress={() => setPond([])} />
          </View>
        </ThemedView>

          <ThemedView type="backgroundElement" style={styles.card}>
            <ThemedText type="smallBold">Your fishes</ThemedText>
            {pond.length > 0 ? (
              <View style={styles.pond}>
                {pond.map((fish, index) => (
                  <View key={`${fish}-${index}`} style={styles.fishBubble}>
                    <ThemedText style={styles.fishEmoji}>{fish}</ThemedText>
                  </View>
                ))}
              </View>
            ) : (
              <ThemedText themeColor="textSecondary">The pond is empty. Add a fish to fill it up.</ThemedText>
            )}
          </ThemedView>
        </SafeAreaView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
  },
  safeArea: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.three,
    gap: Spacing.three,
  },
  header: {
    gap: Spacing.one,
    paddingTop: Spacing.two,
  },
  centerText: {
    textAlign: 'center',
  },
  card: {
    borderRadius: Spacing.four,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.four,
    gap: Spacing.three,
  },
  countText: {
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  buttonPressable: {
    minWidth: 150,
    flexGrow: 1,
  },
  button: {
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pond: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  fishBubble: {
    minWidth: 64,
    minHeight: 64,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.two,
  },
  fishEmoji: {
    fontSize: 32,
    lineHeight: 40,
  },
  pressed: {
    opacity: 0.75,
  },
});
