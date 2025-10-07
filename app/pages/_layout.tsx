import { Stack } from 'expo-router';

export default function StackLayout() {
  return (
    <Stack>
      <Stack.Screen name="editWatchPage" options={{ headerShown: false }} />
    </Stack>
  );
}
