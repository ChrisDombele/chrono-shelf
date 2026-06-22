import { useTheme } from '@/contexts/ThemeContext';
import { Tabs } from 'expo-router';
import { ChartLine, Clock, ClockPlus, Settings2 } from 'lucide-react-native';

export default function TabLayout() {
  const { isDarkMode } = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: isDarkMode ? '#60A5FA' : '#0B2048',
        tabBarInactiveTintColor: isDarkMode ? '#6B7280' : '#9CA3AF',
        tabBarStyle: {
          backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
          borderTopColor: isDarkMode ? '#374151' : '#E5E7EB',
        },
        tabBarLabelStyle: {
          fontSize: 12,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Watches',
          tabBarIcon: ({ color }) => (
            <Clock size={28} color={color} strokeWidth={1.5} />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Stats',
          tabBarIcon: ({ color }) => (
            <ChartLine size={28} color={color} strokeWidth={1.5} />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="addWatch"
        options={{
          title: 'Add Watch',
          tabBarIcon: ({ color }) => (
            <ClockPlus size={28} color={color} strokeWidth={1.5} />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="settingsPage"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => (
            <Settings2 size={28} color={color} strokeWidth={1.5} />
          ),
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
