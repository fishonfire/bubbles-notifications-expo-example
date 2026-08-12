import { Tabs } from 'expo-router';
import { ColorValue, Image, StyleSheet, Text, useColorScheme, View } from 'react-native';

import { Colors, Spacing } from '@/constants/theme';

type TabImageIconProps = {
  color: ColorValue;
  source: number;
};

function TabImageIcon({ color, source }: TabImageIconProps) {
  return <Image source={source} style={[styles.imageIcon, { tintColor: color }]} />;
}

type TabEmojiIconProps = {
  color: ColorValue;
  emoji: string;
};

function TabEmojiIcon({ color, emoji }: TabEmojiIconProps) {
  return (
    <View style={styles.emojiIconWrapper}>
      <Text style={[styles.emojiIcon, { color }]}>{emoji}</Text>
    </View>
  );
}

export default function AppTabs() {
  const scheme = useColorScheme();
  const theme = scheme === 'unspecified' ? 'light' : scheme;
  const colors = Colors[theme];
  const activeTabBackgroundColor = theme === 'dark' ? '#25282C' : '#D4D6DD';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarActiveBackgroundColor: activeTabBackgroundColor,
        tabBarInactiveBackgroundColor: colors.backgroundElement,
        tabBarStyle: {
          backgroundColor: colors.backgroundElement,
          borderTopColor: colors.backgroundSelected,
          paddingTop: Spacing.one,
          paddingBottom: Spacing.two,
          height: 72,
        },
        tabBarItemStyle: {
          marginHorizontal: Spacing.one,
          borderRadius: Spacing.three,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <TabImageIcon color={color} source={require('@/assets/images/tabIcons/home.png')} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => (
            <TabImageIcon color={color} source={require('@/assets/images/tabIcons/explore.png')} />
          ),
        }}
      />
      <Tabs.Screen
        name="fish"
        options={{
          title: 'Fish',
          tabBarIcon: ({ color }) => <TabEmojiIcon color={color} emoji="🐟" />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  imageIcon: {
    width: 22,
    height: 22,
  },
  emojiIconWrapper: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiIcon: {
    fontSize: 18,
    lineHeight: 20,
  },
});
