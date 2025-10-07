import { Tabs } from 'expo-router';
import { ChartLine, Clock, ClockPlus, Settings2 } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: '#0B2048' }}>
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
